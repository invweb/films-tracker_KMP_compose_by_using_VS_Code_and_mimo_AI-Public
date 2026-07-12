import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tmdbApi, img } from '../services/api';

const RecCard = memo(function RecCard({ movie }: { movie: any }) {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
      <img src={img(movie.poster_path)} alt={movie.title} loading="lazy" decoding="async" />
      <div className="title">{movie.title}</div>
      <div className="meta">★ {movie.vote_average?.toFixed(1)}</div>
    </Link>
  );
});

export default function RecsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => tmdbApi.recommendations(),
    staleTime: 5 * 60 * 1000,
  });

  const recs = data?.results || [];

  return (
    <div>
      <h1>{t('recommendedForYou')}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{t('basedOnHistory')}</p>
      <div className="movie-grid">
        {recs.map(m => (
          <RecCard key={m.id} movie={m} />
        ))}
      </div>
      {!isLoading && !error && recs.length === 0 && (
        <div className="empty">{t('addWatchedForRecs')}</div>
      )}
      {isLoading && <div className="empty">{t('loading')}</div>}
      {error && <div className="empty">{t('noResults')}</div>}
    </div>
  );
}
