import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, img } from '../services/api';

export default function CalendarPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['upcoming'],
    queryFn: () => tmdbApi.upcoming(),
  });

  const movies = data?.results || [];

  return (
    <div>
      <h1>Upcoming Premieres</h1>
      {movies.map(m => (
        <Link to={`/movie/${m.id}`} key={m.id} className="calendar-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={img(m.poster_path, 'w185')} alt={m.title} loading="lazy" />
          <div className="info">
            <h3>{m.title}</h3>
            <div className="date">
              {m.release_date
                ? new Date(m.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'Date TBD'}
            </div>
            <p style={{ color: 'var(--gold)', marginTop: 4 }}>★ {m.vote_average?.toFixed(1)}</p>
            {m.overview && <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>{m.overview.slice(0, 120)}...</p>}
          </div>
        </Link>
      ))}
      {!isLoading && !error && movies.length === 0 && <div className="empty">No data available</div>}
      {isLoading && <div className="empty">Loading...</div>}
      {error && <div className="empty">Failed to load premieres</div>}
    </div>
  );
}
