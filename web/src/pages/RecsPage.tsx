import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, img } from '../services/api';

export default function RecsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => tmdbApi.recommendations(),
  });

  const recs = data?.results || [];

  return (
    <div>
      <h1>Recommended For You</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Based on your watch history</p>
      <div className="movie-grid">
        {recs.map(m => (
          <Link to={`/movie/${m.id}`} key={m.id} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={img(m.poster_path)} alt={m.title} loading="lazy" />
            <div className="title">{m.title}</div>
            <div className="meta">★ {m.vote_average?.toFixed(1)}</div>
          </Link>
        ))}
      </div>
      {!isLoading && !error && recs.length === 0 && (
        <div className="empty">Add movies to "Watched" to get recommendations</div>
      )}
      {isLoading && <div className="empty">Loading...</div>}
      {error && <div className="empty">Failed to load recommendations</div>}
    </div>
  );
}
