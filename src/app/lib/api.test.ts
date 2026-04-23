import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiRequest,
  authApi,
  setAccessTokenGetter,
  setRefreshTokenGetter,
  setSessionChangeHandler,
} from './api';
import { AUTH_STORAGE_KEY } from './authSession';

describe('apiRequest', () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setAccessTokenGetter(() => null);
    setRefreshTokenGetter(() => null);
    setSessionChangeHandler(() => {});
    window.localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('uses VITE_API_URL as the request base URL', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    } as Response);

    await apiRequest<{ ok: boolean }>('/health');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://localhost:4000/health');
  });

  it('sends bearer token when available', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ id: 'u1' }),
    } as Response);
    setAccessTokenGetter(() => 'token-123');

    await apiRequest<{ id: string }>('/dreams/public');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-123');
  });

  it('falls back to the persisted session token when the in-memory getter is not ready yet', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ id: 'u1' }),
    } as Response);

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      accessToken: 'persisted-token',
      refreshToken: 'refresh-token',
      user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'apoiador', verified: true, approved: true },
    }));

    await apiRequest<{ id: string }>('/proposals/mine');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer persisted-token');
  });

  it('includes credentials so cookie-based auth works across local web and API origins', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ user: { id: 'u1' } }),
    } as Response);

    await apiRequest<{ user: { id: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'instituicao1@nextdream.local', password: 'Seed123!' }),
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.credentials).toBe('include');
  });

  it('submits public registration expecting email verification instead of an authenticated session', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({
        success: true,
        email: 'ana@example.com',
        role: 'paciente',
        requiresEmailVerification: true,
        requiresApproval: false,
      }),
    } as Response);

    await authApi.register({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'Secret123!',
      role: 'paciente',
      city: 'Santos',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          name: 'Ana',
          email: 'ana@example.com',
          password: 'Secret123!',
          role: 'paciente',
          city: 'Santos',
        }),
      }),
    );
  });

  it('confirms an email verification token with the auth API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    } as Response);

    await authApi.verifyEmail({ token: 'verify-token-123' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/auth/verify-email',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ token: 'verify-token-123' }),
      }),
    );
  });

  it('requests a password reset email from the auth API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      text: async () => '',
    } as Response);

    await authApi.requestPasswordReset({
      email: 'ana@example.com',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/auth/password-reset/request',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'ana@example.com' }),
      }),
    );
  });

  it('confirms a password reset with the new password and token', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    } as Response);

    await authApi.confirmPasswordReset({
      token: 'token-123',
      newPassword: 'NovaSenha123!',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/auth/password-reset/confirm',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ token: 'token-123', newPassword: 'NovaSenha123!' }),
      }),
    );
  });

  it('refreshes the session and retries the original request after a 401', async () => {
    const handleSessionChange = vi.fn();
    setRefreshTokenGetter(() => 'refresh-token');
    setSessionChangeHandler(handleSessionChange);

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'apoiador', verified: true, approved: true },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: 'p1' }]),
      } as Response);

    const result = await apiRequest<Array<{ id: string }>>('/proposals/mine', {
      headers: {
        Authorization: 'Bearer expired-token',
      },
    });

    expect(result).toEqual([{ id: 'p1' }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('http://localhost:4000/auth/refresh');
    expect(handleSessionChange).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }));

    const retryInit = fetchMock.mock.calls[2]?.[1] as RequestInit;
    const retryHeaders = retryInit.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe('Bearer new-access-token');
  });

  it('ignores a stale successful refresh response after the refresh token changes', async () => {
    const handleSessionChange = vi.fn();
    const listener = vi.fn();
    let currentRefreshToken = 'refresh-token-1';

    setRefreshTokenGetter(() => currentRefreshToken);
    setSessionChangeHandler(handleSessionChange);
    window.addEventListener('nextdream:auth-expired', listener);

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => {
          currentRefreshToken = 'refresh-token-2';
          return JSON.stringify({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'apoiador', verified: true, approved: true },
          });
        },
      } as Response);

    try {
      await expect(apiRequest('/proposals/mine', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      })).rejects.toEqual(
        expect.objectContaining<ApiError>({
          name: 'ApiError',
          status: 401,
          message: 'Invalid token',
        }),
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(handleSessionChange).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('nextdream:auth-expired', listener);
    }
  });

  it('ignores a stale non-ok refresh response after the refresh token changes', async () => {
    const handleSessionChange = vi.fn();
    const listener = vi.fn();
    let currentRefreshToken = 'refresh-token-1';

    setRefreshTokenGetter(() => currentRefreshToken);
    setSessionChangeHandler(handleSessionChange);
    window.addEventListener('nextdream:auth-expired', listener);

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => {
          currentRefreshToken = 'refresh-token-2';
          return JSON.stringify({ message: 'Invalid refresh token' });
        },
      } as Response);

    try {
      await expect(apiRequest('/proposals/mine', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      })).rejects.toEqual(
        expect.objectContaining<ApiError>({
          name: 'ApiError',
          status: 401,
          message: 'Invalid token',
        }),
      );

      expect(handleSessionChange).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('nextdream:auth-expired', listener);
    }
  });

  it('ignores a stale failed refresh request after the refresh token changes', async () => {
    const handleSessionChange = vi.fn();
    const listener = vi.fn();
    let currentRefreshToken = 'refresh-token-1';

    setRefreshTokenGetter(() => currentRefreshToken);
    setSessionChangeHandler(handleSessionChange);
    window.addEventListener('nextdream:auth-expired', listener);

    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Invalid token' }),
      } as Response)
      .mockImplementationOnce(async () => {
        currentRefreshToken = 'refresh-token-2';
        throw new Error('network down');
      });

    try {
      await expect(apiRequest('/proposals/mine', {
        headers: {
          Authorization: 'Bearer expired-token',
        },
      })).rejects.toEqual(
        expect.objectContaining<ApiError>({
          name: 'ApiError',
          status: 401,
          message: 'Invalid token',
        }),
      );

      expect(handleSessionChange).not.toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('nextdream:auth-expired', listener);
    }
  });

  it('does not attempt token refresh or clear the session on auth-route 401 responses', async () => {
    const handleSessionChange = vi.fn();
    setRefreshTokenGetter(() => 'refresh-token');
    setSessionChangeHandler(handleSessionChange);

    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Invalid invite token' }),
    } as Response);

    await expect(apiRequest('/auth/admin-invites/accept', {
      method: 'POST',
    })).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        status: 401,
        message: 'Invalid invite token',
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(handleSessionChange).not.toHaveBeenCalled();
  });

  it('throws ApiError with API message on non-2xx response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Invalid credentials' }),
    } as Response);

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        status: 401,
        message: 'Invalid credentials',
      }),
    );
  });

  it('dispatches an auth-expired event when a protected request loses its auth token', async () => {
    const listener = vi.fn();
    window.addEventListener('nextdream:auth-expired', listener);

    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Missing authentication token' }),
    } as Response);

    try {
      await expect(apiRequest('/institution/patients')).rejects.toEqual(
        expect.objectContaining<ApiError>({
          name: 'ApiError',
          status: 401,
          message: 'Missing authentication token',
        }),
      );

      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('nextdream:auth-expired', listener);
    }
  });
});
