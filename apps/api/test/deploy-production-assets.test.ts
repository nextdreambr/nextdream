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
