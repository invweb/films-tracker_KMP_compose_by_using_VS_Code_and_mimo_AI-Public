import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setAuthToken, getAuthToken, authApi, moviesApi } from '../services/api';

const mockFetch = vi.fn();
(globalThis as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  setAuthToken(null);
});

describe('auth token management', () => {
  it('stores and retrieves token', () => {
    setAuthToken('test-token-123');
    expect(getAuthToken()).toBe('test-token-123');
  });

  it('clears token', () => {
    setAuthToken('test-token');
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });
});

describe('authApi', () => {
  it('login sends correct request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1, email: 'test@test.com' }, token: 'abc' }),
    });

    const result = await authApi.login({ email: 'test@test.com', password: '123456' });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '123456' }),
    }));
    expect(result.user.email).toBe('test@test.com');
  });

  it('register sends correct request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1 }, token: 'xyz' }),
    });

    await authApi.register({ email: 'new@test.com', password: 'pass123', name: 'Test' });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
      method: 'POST',
    }));
  });
});

describe('moviesApi', () => {
  beforeEach(() => {
    setAuthToken('test-token');
  });

  it('getAll sends auth header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await moviesApi.getAll('watchlist');

    expect(mockFetch).toHaveBeenCalledWith('/api/movies?list_type=watchlist', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-token',
      }),
    }));
  });

  it('stats returns data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ watchlist: 5, watched: 10, favorites: 3, avgRating: 7.5 }),
    });

    const stats = await moviesApi.stats();
    expect(stats.watched).toBe(10);
  });
});
