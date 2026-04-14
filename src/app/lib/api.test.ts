import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiRequest,
  setAccessTokenGetter,
  setRefreshTokenGetter,
  setSessionChangeHandler,
} from './api';

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

    window.localStorage.setItem('nextdream.auth.session', JSON.stringify({
      accessToken: 'persisted-token',
      refreshToken: 'refresh-token',
      user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'apoiador', verified: true },
    }));

    await apiRequest<{ id: string }>('/proposals/mine');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer persisted-token');
  });

  it('refreshes the session and retries the original request after a 401', async () => {
    const handleSessionChange = vi.fn();
    setAccessTokenGetter(() => 'expired-token');
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
          user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'apoiador', verified: true },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify([{ id: 'p1' }]),
      } as Response);

    const result = await apiRequest<Array<{ id: string }>>('/proposals/mine');

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
});
