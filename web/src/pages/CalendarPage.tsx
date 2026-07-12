import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tmdbApi, img } from '../services/api';

const CalendarItem = memo(function CalendarItem({ movie, locale }: { movie: any; locale: string }) {
  return (
    <Link to={`/movie/${movie.id}`} className="calendar-item" style={{ textDecoration: 'none', color: 'inherit' }}>
      <img src={img(movie.poster_path, 'w185')} alt={movie.title} loading="lazy" decoding="async" />
      <div className="info">
        <h3>{movie.title}</h3>
        <div className="date">
          {movie.release_date
            ? new Date(movie.release_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
            : 'Date TBD'}
        </div>
        <p style={{ color: 'var(--gold)', marginTop: 4 }}>★ {movie.vote_average?.toFixed(1)}</p>
        {movie.overview && <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>{movie.overview.slice(0, 120)}...</p>}
      </div>
    </Link>
  );
});

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['upcoming'],
    queryFn: () => tmdbApi.upcoming(),
    staleTime: 10 * 60 * 1000,
  });

  const movies = data?.results || [];
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div>
      <h1>{t('upcomingPremieres')}</h1>
      {movies.map(m => (
        <CalendarItem key={m.id} movie={m} locale={locale} />
      ))}
      {!isLoading && !error && movies.length === 0 && <div className="empty">{t('noResults')}</div>}
      {isLoading && <div className="empty">{t('loading')}</div>}
      {error && <div className="empty">{t('noResults')}</div>}
    </div>
  );
}
