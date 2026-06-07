import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, clearToken, getToken, setToken } from '@/lib/api';

describe('api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stores, reads and clears the bearer token', () => {
    expect(getToken()).toBeNull();
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });

  it('attaches the bearer token when present', async () => {
    setToken('token-123');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    await apiFetch('/sync');

    const headers = fetchMock.mock.calls[0]?.[1]?.headers;
    expect(headers).toBeInstanceOf(Headers);
    if (headers instanceof Headers) {
      expect(headers.get('Authorization')).toBe('Bearer token-123');
      expect(headers.get('Content-Type')).toBe('application/json');
    }
  });

  it('throws when the response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 401 }));
    await expect(apiFetch('/sync')).rejects.toThrow(/401/);
  });
});
