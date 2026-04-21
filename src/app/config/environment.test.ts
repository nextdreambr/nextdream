// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest';

function stubHostname(hostname: string) {
  vi.stubGlobal(
    'window',
    {
      location: {
        hostname,
      },
    } as unknown as Window & typeof globalThis,
  );
}

async function loadEnvironmentModule() {
  return import('./environment');
}

describe('isSandboxEnvironment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('activates sandbox when the browser hostname matches VITE_SANDBOX_HOSTNAME', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    stubHostname('sandbox.nextdream.ong.br');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(true);
  });

  it('does not activate sandbox on the main domain', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    stubHostname('nextdream.ong.br');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(false);
  });

  it('activates sandbox on localhost when VITE_APP_ENV=sandbox', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    stubHostname('localhost');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(true);
  });

  it('activates sandbox on 127.0.0.1 when VITE_APP_ENV=sandbox', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    stubHostname('127.0.0.1');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(true);
  });

  it('keeps the main domain in production mode even when VITE_APP_ENV=sandbox', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    stubHostname('nextdream.ong.br');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(false);
  });

  it('allows the sandbox fallback in the test environment when there is no browser hostname', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');

    const { isSandboxEnvironment } = await loadEnvironmentModule();

    expect(isSandboxEnvironment()).toBe(true);
  });
});
