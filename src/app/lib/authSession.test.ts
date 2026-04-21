import { afterEach, describe, expect, it, vi } from 'vitest';

const sandboxSession = {
  accessToken: 'sandbox-access-token',
  refreshToken: 'sandbox-refresh-token',
  user: {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'paciente' as const,
    verified: true,
    approved: true,
  },
};

describe('authSession storage selection', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses sessionStorage in sandbox mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    const {
      AUTH_STORAGE_KEY,
      clearStoredSession,
      loadStoredSession,
      persistStoredSession,
    } = await import('./authSession');

    persistStoredSession(sandboxSession);

    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toContain('sandbox-access-token');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(loadStoredSession()).toEqual(sandboxSession);

    clearStoredSession();
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('keeps localStorage as the default outside sandbox mode', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    const {
      AUTH_STORAGE_KEY,
      loadStoredSession,
      persistStoredSession,
    } = await import('./authSession');

    persistStoredSession(sandboxSession);

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain('sandbox-access-token');
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(loadStoredSession()).toEqual(sandboxSession);
  });
});
