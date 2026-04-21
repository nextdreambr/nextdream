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

  it('returns a fresh default state on each load', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');

    const { loadSandboxTourState } = await import('./sandboxTourSession');

    const first = loadSandboxTourState();
    const second = loadSandboxTourState();

    expect(first).toEqual({
      queuedLaunchPersona: null,
      progressByPersona: {},
    });
    expect(second).toEqual(first);
    expect(second).not.toBe(first);

    first.progressByPersona.paciente = 'completed';
    expect(second.progressByPersona).toEqual({});
  });

  it('returns null storage when sessionStorage access throws', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    const sessionStorageGetter = vi
      .spyOn(window, 'sessionStorage', 'get')
      .mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

    const { loadSandboxTourState, saveSandboxTourState } = await import('./sandboxTourSession');

    expect(loadSandboxTourState()).toEqual({
      queuedLaunchPersona: null,
      progressByPersona: {},
    });
    expect(() => {
      saveSandboxTourState({
        queuedLaunchPersona: 'paciente',
        progressByPersona: {},
      });
    }).not.toThrow();

    expect(sessionStorageGetter).toHaveBeenCalled();
  });

  it('sanitizes invalid tour state loaded from sessionStorage', async () => {
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    window.sessionStorage.setItem(
      'nextdream.sandbox.tour',
      JSON.stringify({
        queuedLaunchPersona: 'admin',
        progressByPersona: {
          paciente: 'completed',
          admin: 'dismissed',
          instituicao: 'weird',
        },
      }),
    );

    const { loadSandboxTourState } = await import('./sandboxTourSession');

    expect(loadSandboxTourState()).toEqual({
      queuedLaunchPersona: null,
      progressByPersona: {
        paciente: 'completed',
      },
    });
  });
});
