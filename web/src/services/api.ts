import { Movie, MovieDetail, UserMovie, Stats } from '../types';

const BASE = '/api';

let authToken: string | null = localStorage.getItem('authToken');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (res.status === 401) {
    setAuthToken(null);
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    request<{ user: AuthUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
};

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

export interface DetailedStats {
  ratingDistribution: { rating: number; count: number }[];
  genreStats: { genre_ids: string; count: number; avg_rating: number }[];
  monthlyStats: { month: string; count: number }[];
  ratingStats: { min: number; max: number; ratedCount: number };
  totalMovies: number;
  byListType: { list_type: string; count: number; avg_rating: number }[];
}

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
  detailedStats: () => request<DetailedStats>('/movies/stats/detailed'),
};

export interface Review {
  id: number;
  user_id: number;
  tmdb_id: number;
  rating: number | null;
  text: string | null;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
}

export interface MovieReviews {
  reviews: Review[];
  stats: {
    count: number;
    avgRating: number | null;
  };
}

export const reviewsApi = {
  getMovieReviews: (tmdbId: number) =>
    request<MovieReviews>(`/reviews/movie/${tmdbId}`),
  getMyReview: (tmdbId: number) =>
    request<Review | null>(`/reviews/my/${tmdbId}`),
  saveReview: (data: { tmdb_id: number; rating?: number; text?: string }) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (tmdbId: number) =>
    request<void>(`/reviews/${tmdbId}`, { method: 'DELETE' }),
};

export interface SyncData {
  movies: UserMovie[];
  reviews: Review[];
  syncTime: string;
}

export const syncApi = {
  getData: (lastSync?: string) => {
    const params = lastSync ? `?lastSync=${encodeURIComponent(lastSync)}` : '';
    return request<SyncData>(`/sync${params}`);
  },
  pushData: (data: { movies?: any[]; reviews?: any[] }) =>
    request<{ success: boolean; syncTime: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  fullSync: () => request<SyncData>('/sync'),
  resetData: () =>
    request<void>('/sync/full', { method: 'DELETE' }),
};

export const img = (path: string | null, size = 'w500') =>
  !path
    ? 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=No+Poster'
    : path.startsWith('http') ? path : `https://image.tmdb.org/t/p/${size}${path}`;
