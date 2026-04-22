import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

function readRepoFile(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

function extractComposeServiceBlock(composeFile: string, serviceName: 'api' | 'web') {
  const lines = composeFile.split('\n');
  const serviceHeader = `  ${serviceName}:`;
  const serviceBlock: string[] = [];
  let foundServicesSection = false;
  let isCapturing = false;

  for (const line of lines) {
    if (!foundServicesSection) {
      if (line === 'services:') {
        foundServicesSection = true;
      }
      continue;
    }

    if (isCapturing) {
      if (/^[^\s].*:\s*$/.test(line) || /^ {2}[a-zA-Z0-9_-]+:\s*$/.test(line)) {
        break;
      }

      serviceBlock.push(line);
      continue;
    }

    if (/^[^\s].*:\s*$/.test(line)) {
      break;
    }

    if (line === serviceHeader) {
      isCapturing = true;
      serviceBlock.push(line);
    }
  }

  if (!foundServicesSection) {
    throw new Error('Unable to locate services section in docker-compose.prod.yml');
  }

  if (serviceBlock.length === 0) {
    throw new Error(`Unable to locate ${serviceName} service block in docker-compose.prod.yml`);
  }

  return serviceBlock.join('\n');
}

describe('production deploy hardening assets', () => {
  it('defaults production deploys to /home/actions/nextdream on the existing host', () => {
    const workflow = readRepoFile('.github/workflows/deploy-prod.yml');

    expect(workflow).toContain("APP_DIR: ${{ vars.APP_DIR || '/home/actions/nextdream' }}");
    expect(workflow).not.toContain("APP_DIR: ${{ vars.APP_DIR || '/opt/nextdream' }}");
  });

  it('runs the API container as a non-root user', () => {
    const dockerfile = readRepoFile('Dockerfile.api');

    expect(dockerfile).toMatch(/USER\s+node/);
  });

  it('installs production-only API workspace dependencies in the runtime image', () => {
    const dockerfile = readRepoFile('Dockerfile.api');

    expect(dockerfile).toMatch(/npm ci --omit=dev --workspace apps\/api --include-workspace-root=false/);
    expect(dockerfile).toMatch(/rm -rf \/usr\/local\/lib\/node_modules\/npm/);
    expect(dockerfile).not.toMatch(/COPY --from=builder \/app\/node_modules \/app\/node_modules/);
  });

  it('uses an unprivileged web image and serves on an unprivileged port', () => {
    const dockerfile = readRepoFile('Dockerfile.web');
    const nginxConfig = readRepoFile('deploy/nginx/default.conf');

    expect(dockerfile).toMatch(/nginxinc\/nginx-unprivileged:1\.29.*-alpine/i);
    expect(dockerfile).toMatch(/EXPOSE\s+8080/);
    expect(nginxConfig).toMatch(/listen\s+8080;/);
  });

  it('passes the sandbox hostname into the web image build', () => {
    const dockerfile = readRepoFile('Dockerfile.web');
    const workflow = readRepoFile('.github/workflows/deploy-prod.yml');

    expect(dockerfile).toMatch(/ARG\s+VITE_SANDBOX_HOSTNAME=/);
    expect(dockerfile).toMatch(/ENV\s+VITE_SANDBOX_HOSTNAME=\$\{VITE_SANDBOX_HOSTNAME\}/);
    expect(workflow).toContain('VITE_SANDBOX_HOSTNAME');
    expect(workflow).toContain('VITE_SANDBOX_HOSTNAME=${{ vars.VITE_SANDBOX_HOSTNAME }}');
  });

  it('maps the Resend runtime configuration into production deploys', () => {
    const workflow = readRepoFile('.github/workflows/deploy-prod.yml');
    const envExample = readRepoFile('.env.production.example');

    expect(workflow).toContain('RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}');
    expect(workflow).toContain('RESEND_FROM_EMAIL: ${{ vars.RESEND_FROM_EMAIL }}');
    expect(workflow).toContain('RESEND_API_KEY=${RESEND_API_KEY}');
    expect(workflow).toContain('RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL}');

    expect(envExample).toContain('#   RESEND_API_KEY -> RESEND_API_KEY');
    expect(envExample).toContain('#   RESEND_FROM_EMAIL -> RESEND_FROM_EMAIL');
    expect(envExample).toContain('RESEND_API_KEY=<PROD_RESEND_API_KEY>');
    expect(envExample).toContain('RESEND_FROM_EMAIL=<PROD_RESEND_FROM_EMAIL>');
  });

  it('exposes an internal mail smoke test command for controlled real sends', () => {
    const apiPackage = JSON.parse(readRepoFile('apps/api/package.json')) as {
      scripts: Record<string, string>;
    };
    const smokeScript = readRepoFile('apps/api/src/scripts/mail-smoke.ts');

    expect(apiPackage.scripts['mail:smoke']).toBe('npm run build && node dist/scripts/mail-smoke.js');
    expect(smokeScript).toContain('MAIL_SMOKE_TO');
    expect(smokeScript).toContain('sendSmokeTestEmail');
  });

  it('defines isolated sandbox deploy assets for the same VM', () => {
    const sandboxCompose = readRepoFile('docker-compose.sandbox.yml');
    const sandboxScript = readRepoFile('scripts/deploy-sandbox-remote.sh');
    const sandboxWorkflow = readRepoFile('.github/workflows/deploy-sandbox.yml');
    const sandboxNginxVhost = readRepoFile('deploy/nginx/sandbox.nextdream.ong.br.conf');

    expect(sandboxCompose).toMatch(/container_name:\s*nextdream-sandbox-api/);
    expect(sandboxCompose).toMatch(/127\.0\.0\.1}:?\$?\{?SANDBOX_API_HOST_PORT:-4001\}?:4000|SANDBOX_API_BIND_ADDRESS:-127\.0\.0\.1/);
    expect(sandboxCompose).toMatch(/name:\s*\$\{SANDBOX_DOCKER_NETWORK:-nextdream-sandbox\}/);
    expect(sandboxCompose).not.toMatch(/\bweb:\b/);

    expect(sandboxScript).toContain('docker-compose.sandbox.yml');
    expect(sandboxScript).toContain('.env.sandbox');
    expect(sandboxScript).toContain('nextdream-sandbox-api');
    expect(sandboxScript).toContain('.sandbox-release-state.json');
    expect(sandboxScript).not.toContain('docker image prune -f');
    expect(sandboxScript).not.toContain('docker builder prune -f');
    expect(sandboxScript).toContain("response_file=\"$(mktemp)\"");

    expect(sandboxWorkflow).toContain('name: Deploy Sandbox');
    expect(sandboxWorkflow).toContain("APP_DIR: ${{ vars.SANDBOX_APP_DIR || '/home/actions/nextdream-sandbox' }}");
    expect(sandboxWorkflow).toContain('SANDBOX_JWT_ACCESS_SECRET');
    expect(sandboxWorkflow).toContain('SANDBOX_JWT_REFRESH_SECRET');
    expect(sandboxWorkflow).toContain('docker-compose.sandbox.yml');
    expect(sandboxWorkflow).toContain('normalized_trust_proxy');
    expect(sandboxWorkflow).toContain('normalized_auth_cookie_secure');
    expect(sandboxWorkflow).toContain('normalized_proxy_trusted_ips');

    expect(sandboxNginxVhost).toContain('server_name sandbox.nextdream.ong.br;');
    expect(sandboxNginxVhost).toContain('proxy_pass http://127.0.0.1:4001/;');
    expect(sandboxNginxVhost).toContain('proxy_pass http://127.0.0.1:8080;');
    expect(sandboxNginxVhost).toContain('/etc/letsencrypt/live/sandbox.nextdream.ong.br/fullchain.pem');
  });

  it('hardens the production compose services and adds healthchecks', () => {
    const composeFile = readRepoFile('docker-compose.prod.yml');
    const apiService = extractComposeServiceBlock(composeFile, 'api');
    const webService = extractComposeServiceBlock(composeFile, 'web');

    expect(apiService).toMatch(/API_PORT:\s*4000/);
    expect(apiService).toMatch(/read_only:\s*true/);
    expect(webService).toMatch(/read_only:\s*true/);
    expect(apiService).toMatch(/security_opt:[\s\S]*no-new-privileges:true/);
    expect(webService).toMatch(/security_opt:[\s\S]*no-new-privileges:true/);
    expect(apiService).toMatch(/cap_drop:[\s\S]*-\s*ALL/);
    expect(webService).toMatch(/cap_drop:[\s\S]*-\s*ALL/);
    expect(apiService).toMatch(/healthcheck:[\s\S]*127\.0\.0\.1:4000\/health/);
    expect(webService).toMatch(/healthcheck:/);
    expect(composeFile).not.toContain('--spider');
  });

  it('extracts service blocks without bleeding hardening fields across services', () => {
    const composeFile = `services:
  api:
    image: api
  web:
    read_only: true
`;
    const apiService = extractComposeServiceBlock(composeFile, 'api');
    const webService = extractComposeServiceBlock(composeFile, 'web');

    expect(apiService).not.toMatch(/read_only:\s*true/);
    expect(webService).toMatch(/read_only:\s*true/);
  });

  it('adds cache and supply-chain verification to the deploy workflow', () => {
    const workflow = readRepoFile('.github/workflows/deploy-prod.yml');

    expect(workflow).toContain('cache-from: type=gha,scope=${{ matrix.name }}');
    expect(workflow).toContain('cache-to: type=gha,mode=max,scope=${{ matrix.name }}');
    expect(workflow).toContain('aquasecurity/trivy-action');
    expect(workflow).toContain('anchore/sbom-action');
    expect(workflow).toContain('sigstore/cosign-installer');
    expect(workflow).toContain('cosign sign --yes');
    expect(workflow).toContain('cosign verify');
  });

  it('clears the high-risk production audit baseline after dependency remediation', () => {
    const baseline = JSON.parse(readRepoFile('.github/security/audit-baseline.json')) as {
      high_or_critical_packages: string[];
    };

    expect(baseline.high_or_critical_packages).toHaveLength(0);
  });
});
