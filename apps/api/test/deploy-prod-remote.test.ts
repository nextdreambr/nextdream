import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const deployScriptPath = resolve(__dirname, '../../../scripts/deploy-prod-remote.sh');

function writeExecutable(path: string, content: string) {
  writeFileSync(path, content, 'utf8');
  chmodSync(path, 0o755);
}

describe('deploy-prod-remote.sh', () => {
  let tempDir: string | undefined;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it('runs schema sync with docker run instead of docker compose run', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'nextdream-deploy-'));
    const binDir = join(tempDir, 'bin');
    const dockerLogPath = join(tempDir, 'docker.log');

    mkdirSync(binDir);

    writeExecutable(
      join(binDir, 'docker'),
      `#!/usr/bin/env bash
set -euo pipefail

printf '%s\\n' "$*" >> "$FAKE_DOCKER_LOG"

if [[ "$1" == "system" && "$2" == "df" ]]; then
  exit 0
fi

if [[ "$1" == "container" && "$2" == "prune" ]]; then
  exit 0
fi

if [[ "$1" == "image" && "$2" == "prune" ]]; then
  exit 0
fi

if [[ "$1" == "builder" && "$2" == "prune" ]]; then
  exit 0
fi

if [[ "$1" == "login" || "$1" == "logout" ]]; then
  exit 0
fi

if [[ "$1" == "compose" ]]; then
  case "$*" in
    *" pull api web")
      exit 0
      ;;
    *" run --rm -T api node apps/api/dist/scripts/sync-schema.js")
      echo "Error response from daemon: failed to set up container networking: Address already in use" >&2
      exit 125
      ;;
    *" up -d --force-recreate --remove-orphans")
      exit 0
      ;;
    *" ps")
      exit 0
      ;;
    *)
      echo "Unexpected docker compose invocation: $*" >&2
      exit 1
      ;;
  esac
fi

if [[ "$1" == "run" ]]; then
  case "$*" in
    *" --rm --env-file .env.production $API_IMAGE node apps/api/dist/scripts/sync-schema.js")
      exit 0
      ;;
    *)
      echo "Unexpected docker run invocation: $*" >&2
      exit 1
      ;;
  esac
fi

if [[ "$1" == "inspect" && "$2" == "nextdream-api" ]]; then
  printf '%s' "$API_IMAGE"
  exit 0
fi

if [[ "$1" == "inspect" && "$2" == "nextdream-web" ]]; then
  printf '%s' "$WEB_IMAGE"
  exit 0
fi

echo "Unexpected docker invocation: $*" >&2
exit 1
`,
    );

    writeExecutable(
      join(binDir, 'curl'),
      `#!/usr/bin/env bash
set -euo pipefail

output_file=""
write_format=""

while (($# > 0)); do
  case "$1" in
    -o)
      output_file="$2"
      shift 2
      ;;
    -w)
      write_format="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -n "$output_file" ]]; then
  : > "$output_file"
fi

if [[ "$write_format" == "%{http_code}" ]]; then
  printf '401'
fi
`,
    );

    writeFileSync(join(tempDir, '.env.production'), 'NODE_ENV=production\n', 'utf8');
    writeFileSync(
      join(tempDir, '.deploy-runtime.env'),
      [
        'DEPLOY_ACTION=deploy',
        'API_IMAGE=ghcr.io/nextdreambr/nextdream-api:test',
        'WEB_IMAGE=ghcr.io/nextdreambr/nextdream-web:test',
        'IMAGE_TAG=test-sha',
        'GHCR_USERNAME=tester',
        'GHCR_TOKEN=test-token',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(join(tempDir, 'docker-compose.prod.yml'), 'services: {}\n', 'utf8');

    const result = spawnSync('bash', [deployScriptPath], {
      cwd: tempDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        APP_DIR: tempDir,
        FAKE_DOCKER_LOG: dockerLogPath,
        PATH: `${binDir}:${process.env.PATH ?? ''}`,
      },
    });

    const dockerLog = readFileSync(dockerLogPath, 'utf8');

    expect(result.status, result.stderr).toBe(0);
    expect(dockerLog).toContain(
      'run --rm --env-file .env.production ghcr.io/nextdreambr/nextdream-api:test node apps/api/dist/scripts/sync-schema.js',
    );
    expect(dockerLog).not.toContain(
      'compose --env-file .env.production -f docker-compose.prod.yml run --rm -T api node apps/api/dist/scripts/sync-schema.js',
    );
    expect(existsSync(join(tempDir, '.release-state.json'))).toBe(true);
  });
});
