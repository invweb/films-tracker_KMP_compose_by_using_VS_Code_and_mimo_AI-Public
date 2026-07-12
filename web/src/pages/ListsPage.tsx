import { useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { moviesApi, img } from '../services/api';
import { UserMovie } from '../types';

type Tab = 'watchlist' | 'watched' | 'favorites';
type SortBy = 'date' | 'rating' | 'title';

const ListItem = memo(function ListItem({ item, onRemove, t }: { item: UserMovie; onRemove: (id: number) => void; t: any }) {
  return (
    <div className="list-item">
      <Link to={`/movie/${item.tmdb_id}`}>
        <img src={img(item.poster_path ?? null, 'w185')} alt={item.title} loading="lazy" decoding="async" />
      </Link>
      <div className="info">
        <h3><Link to={`/movie/${item.tmdb_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.title || `Film #${item.tmdb_id}`}</Link></h3>
        <p>
          {item.release_date?.slice(0, 4)}
          {item.rating ? ` · ${t('myRating')}: ${item.rating}/10` : ''}
          {item.vote_average ? ` · ${t('tmdbRating')}: ★ ${item.vote_average.toFixed(1)}` : ''}
        </p>
        {item.notes && <p style={{ marginTop: 4, fontStyle: 'italic' }}>{item.notes}</p>}
        {item.tags && <p style={{ marginTop: 2, fontSize: 12, color: 'var(--muted)' }}>#{item.tags}</p>}
      </div>
      <div className="actions">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onRemove(item.tmdb_id)}
        >
          {t('remove')}
        </button>
      </div>
    </div>
  );
});

export default function ListsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('watchlist');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const queryClient = useQueryClient();

  const TABS: { key: Tab; labelKey: string; icon: string }[] = [
    { key: 'watchlist', labelKey: 'watchlist', icon: '📋' },
    { key: 'watched', labelKey: 'watched', icon: '👁' },
    { key: 'favorites', labelKey: 'favorites', icon: '♥' },
  ];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['movies', tab],
    queryFn: () => moviesApi.getAll(tab),
    staleTime: 30 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => moviesApi.stats(),
    staleTime: 60 * 1000,
  });

  const removeMutation = useMutation({
    mutationFn: ({ tmdbId }: { tmdbId: number }) => moviesApi.remove(tmdbId, tab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', tab] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [items, sortBy]);

  const handleRemove = (tmdbId: number) => {
    if (!confirm(t('removeConfirm'))) return;
    removeMutation.mutate({ tmdbId });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1>{t('myLists')}</h1>
        <a href="/api/movies/export" className="btn btn-outline btn-sm" download aria-label={t('exportCSV')}>{t('exportCSV')}</a>
      </div>
      {stats?.avgRating !== null && stats?.avgRating !== undefined && (
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          {t('averageRating')}: <span style={{ color: 'var(--gold)' }}>★ {stats.avgRating}</span>
        </p>
      )}
      <div className="tabs" role="tablist" aria-label={t('myLists')}>
        {TABS.map(tItem => (
          <button
            key={tItem.key}
            role="tab"
            aria-selected={tab === tItem.key}
            aria-controls="list-panel"
            className={`tab${tab === tItem.key ? ' active' : ''}`}
            onClick={() => setTab(tItem.key)}
          >
            {tItem.icon} {t(tItem.labelKey)} ({stats?.[tItem.key] ?? 0})
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }} role="group" aria-label="Sort order">
        {(['date', 'rating', 'title'] as SortBy[]).map(s => (
          <button
            key={s}
            className={`tab${sortBy === s ? ' active' : ''}`}
            onClick={() => setSortBy(s)}
            aria-pressed={sortBy === s}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            {s === 'date' ? t('newest') : s === 'rating' ? t('rating') : t('alphabetical')}
          </button>
        ))}
      </div>
      <div id="list-panel" role="tabpanel">
      {!isLoading && sorted.map(m => (
        <ListItem key={`${m.tmdb_id}-${m.list_type}`} item={m} onRemove={handleRemove} t={t} />
      ))}
      {!isLoading && sorted.length === 0 && <div className="empty">{t('listEmpty')}</div>}
      {isLoading && <div className="empty">{t('loading')}</div>}
      </div>
    </div>
  );
}
