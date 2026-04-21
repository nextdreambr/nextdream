import { afterEach, describe, expect, it, vi } from 'vitest';

describe('sandboxTourSession', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    window.sessionStorage.clear();
  });

  it('swallows sessionStorage write failures when saving sandbox tour state', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const { saveSandboxTourState } = await import('./sandboxTourSession');

    expect(() => {
      saveSandboxTourState({
        queuedLaunchPersona: 'paciente',
        progressByPersona: {},
      });
    }).not.toThrow();

    expect(setItemSpy).toHaveBeenCalled();
  });
});
