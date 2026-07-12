import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tmdbApi, img } from '../services/api';

const MovieCard = memo(function MovieCard({ movie }: { movie: any }) {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <img src={img(movie.poster_path)} alt={movie.title} loading="lazy" decoding="async" />
      <div className="title">{movie.title}</div>
      <div className="meta">
        {movie.release_date?.slice(0, 4)} · ★ {movie.vote_average?.toFixed(1)}
      </div>
    </Link>
  );
});

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbApi.trending(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => tmdbApi.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  const movies = query.trim().length >= 2 ? (searchData?.results || []) : (trending?.results || []);
  const label = query.trim().length >= 2 ? t('results') : t('trending');

  return (
    <div>
      <h1>{t('searchMovies')}</h1>
      <div className="search-box" role="search" aria-label={t('searchMovies')}>
        <label htmlFor="movie-search" className="sr-only">{t('searchMovies')}</label>
        <input
          id="movie-search"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="btn btn-outline" onClick={() => setQuery('')} aria-label={t('clearSearch')} style={{ flex: '0 0 auto' }}>
            ✕
          </button>
        )}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label} {searchLoading ? '...' : ''}
      </p>
      <div className="movie-grid">
        {movies.map(m => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
      {movies.length === 0 && !searchLoading && <div className="empty">{t('noResults')}</div>}
    </div>
  );
}
