import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, setAccessTokenGetter } from './api';

describe('apiRequest', () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setAccessTokenGetter(() => null);
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

    await expect(apiRequest('/institution/patients')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        status: 401,
        message: 'Missing authentication token',
      }),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('nextdream:auth-expired', listener);
  });
});
