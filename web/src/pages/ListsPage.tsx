import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi, img } from '../services/api';


type Tab = 'watchlist' | 'watched' | 'favorites';
type SortBy = 'date' | 'rating' | 'title';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'watchlist', label: 'Watchlist', icon: '📋' },
  { key: 'watched', label: 'Watched', icon: '👁' },
  { key: 'favorites', label: 'Favorites', icon: '♥' },
];

export default function ListsPage() {
  const [tab, setTab] = useState<Tab>('watchlist');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['movies', tab],
    queryFn: () => moviesApi.getAll(tab),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => moviesApi.stats(),
  });

  const removeMutation = useMutation({
    mutationFn: ({ tmdbId }: { tmdbId: number }) => moviesApi.remove(tmdbId, tab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', tab] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const handleRemove = (tmdbId: number) => {
    if (!confirm('Remove from list?')) return;
    removeMutation.mutate({ tmdbId });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1>My Lists</h1>
        <a href="/api/movies/export" className="btn btn-outline btn-sm" download>Export CSV</a>
      </div>
      {stats?.avgRating !== null && stats?.avgRating !== undefined && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          Average rating: <span style={{ color: 'var(--gold)' }}>★ {stats.avgRating}</span>
        </p>
      )}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label} ({stats?.[t.key] ?? 0})
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['date', 'rating', 'title'] as SortBy[]).map(s => (
          <button
            key={s}
            className={`tab${sortBy === s ? ' active' : ''}`}
            onClick={() => setSortBy(s)}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            {s === 'date' ? 'Newest' : s === 'rating' ? 'Rating' : 'A-Z'}
          </button>
        ))}
      </div>
      {!isLoading && sorted.map(m => (
        <div className="list-item" key={`${m.tmdb_id}-${m.list_type}`}>
          <Link to={`/movie/${m.tmdb_id}`}>
            <img src={img(m.poster_path ?? null, 'w185')} alt={m.title} loading="lazy" />
          </Link>
          <div className="info">
            <h3><Link to={`/movie/${m.tmdb_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{m.title || `Film #${m.tmdb_id}`}</Link></h3>
            <p>
              {m.release_date?.slice(0, 4)}
              {m.rating ? ` · My Rating: ${m.rating}/10` : ''}
              {m.vote_average ? ` · TMDB: ★ ${m.vote_average.toFixed(1)}` : ''}
            </p>
            {m.notes && <p style={{ marginTop: 4, fontStyle: 'italic' }}>{m.notes}</p>}
            {m.tags && <p style={{ marginTop: 2, fontSize: 12, color: 'var(--muted)' }}>#{m.tags}</p>}
          </div>
          <div className="actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleRemove(m.tmdb_id)}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? '...' : 'Remove'}
            </button>
          </div>
        </div>
      ))}
      {!isLoading && sorted.length === 0 && <div className="empty">List is empty</div>}
      {isLoading && <div className="empty">Loading...</div>}
    </div>
  );
}
