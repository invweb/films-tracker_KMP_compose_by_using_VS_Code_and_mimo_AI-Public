import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi, img } from '../services/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => tmdbApi.trending(),
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => tmdbApi.search(query),
    enabled: query.trim().length >= 2,
  });

  const movies = query.trim().length >= 2 ? (searchData?.results || []) : (trending?.results || []);
  const label = query.trim().length >= 2 ? 'Results' : 'Trending Now';

  return (
    <div>
      <h1>Search Movies</h1>
      <div className="search-box">
        <input
          placeholder="Movie title..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="btn btn-outline" onClick={() => setQuery('')} style={{ flex: '0 0 auto' }}>
            ✕
          </button>
        )}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label} {searchLoading ? '...' : ''}
      </p>
      <div className="movie-grid">
        {movies.map(m => (
          <Link to={`/movie/${m.id}`} key={m.id} className="movie-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={img(m.poster_path)} alt={m.title} loading="lazy" />
            <div className="title">{m.title}</div>
            <div className="meta">
              {m.release_date?.slice(0, 4)} · ★ {m.vote_average?.toFixed(1)}
            </div>
          </Link>
        ))}
      </div>
      {movies.length === 0 && !searchLoading && <div className="empty">No results found</div>}
    </div>
  );
}
