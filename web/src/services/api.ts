import { Movie, MovieDetail, UserMovie, Stats } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const tmdbApi = {
  search: (q: string, page = 1, limit = 20) =>
    request<PaginatedResponse<Movie>>(`/tmdb/search?query=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
  trending: (page = 1, limit = 20) =>
    request<PaginatedResponse<Movie>>(`/tmdb/trending?page=${page}&limit=${limit}`),
  upcoming: (page = 1, limit = 20) =>
    request<PaginatedResponse<Movie>>(`/tmdb/upcoming?page=${page}&limit=${limit}`),
  movieDetail: (id: number) => request<MovieDetail>(`/tmdb/movie/${id}`),
  recommendations: () => request<{ results: Movie[] }>('/tmdb/recommendations'),
};

export const moviesApi = {
  getAll: (listType?: string) => {
    const params = listType ? `?list_type=${listType}` : '';
    return request<UserMovie[]>(`/movies${params}`);
  },
  add: (data: { tmdb_id: number; list_type: string; rating?: number; notes?: string; tags?: string }) =>
    request<UserMovie>('/movies', { method: 'POST', body: JSON.stringify(data) }),
  remove: (tmdbId: number, listType: string) =>
    request<void>(`/movies/${tmdbId}/${listType}`, { method: 'DELETE' }),
  stats: () => request<Stats>('/movies/stats'),
};

export const img = (path: string | null, _size = 'w500') =>
  !path
    ? 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=No+Poster'
    : path.startsWith('http') ? path : `https://image.tmdb.org/t/p/${_size}${path}`;
