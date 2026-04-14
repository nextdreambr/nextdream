import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

function readRepoFile(path: string) {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('production deploy hardening assets', () => {
  it('runs the API container as a non-root user', () => {
    const dockerfile = readRepoFile('Dockerfile.api');

    expect(dockerfile).toMatch(/USER\s+node/);
  });

  it('uses an unprivileged web image and serves on an unprivileged port', () => {
    const dockerfile = readRepoFile('Dockerfile.web');
    const nginxConfig = readRepoFile('deploy/nginx/default.conf');

    expect(dockerfile).toMatch(/nginx.*unprivileged/i);
    expect(dockerfile).toMatch(/EXPOSE\s+8080/);
    expect(nginxConfig).toMatch(/listen\s+8080;/);
  });

  it('hardens the production compose services and adds healthchecks', () => {
    const composeFile = readRepoFile('docker-compose.prod.yml');

    expect(composeFile).toMatch(/api:[\s\S]*read_only:\s*true/);
    expect(composeFile).toMatch(/web:[\s\S]*read_only:\s*true/);
    expect(composeFile).toMatch(/api:[\s\S]*security_opt:[\s\S]*no-new-privileges:true/);
    expect(composeFile).toMatch(/web:[\s\S]*security_opt:[\s\S]*no-new-privileges:true/);
    expect(composeFile).toMatch(/api:[\s\S]*cap_drop:[\s\S]*-\s*ALL/);
    expect(composeFile).toMatch(/web:[\s\S]*cap_drop:[\s\S]*-\s*ALL/);
    expect(composeFile).toMatch(/api:[\s\S]*healthcheck:/);
    expect(composeFile).toMatch(/web:[\s\S]*healthcheck:/);
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
