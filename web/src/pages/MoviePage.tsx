import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tmdbApi, moviesApi, img } from '../services/api';

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const tmdbId = Number(id);

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', tmdbId],
    queryFn: () => tmdbApi.movieDetail(tmdbId),
    enabled: !!tmdbId,
  });

  const { data: listsData } = useQuery({
    queryKey: ['lists', tmdbId],
    queryFn: async () => {
      const [watchlist, watched, favorites] = await Promise.all([
        moviesApi.getAll('watchlist'),
        moviesApi.getAll('watched'),
        moviesApi.getAll('favorites'),
      ]);
      return {
        watchlist: watchlist.some(m => m.tmdb_id === tmdbId),
        watched: watched.some(m => m.tmdb_id === tmdbId),
        favorites: favorites.some(m => m.tmdb_id === tmdbId),
      };
    },
    enabled: !!tmdbId,
  });

  const listMutation = useMutation({
    mutationFn: ({ action, listType }: { action: 'add' | 'remove'; listType: string }) =>
      action === 'add'
        ? moviesApi.add({ tmdb_id: tmdbId, list_type: listType }).then(() => {})
        : moviesApi.remove(tmdbId, listType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });

  if (isLoading) return <div className="empty">Loading...</div>;
  if (error) return <div className="empty">Failed to load movie</div>;
  if (!movie) return <div className="empty">Movie not found</div>;

  const trailer = movie.videos?.results?.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  return (
    <div>
      <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
        ← Back to Search
      </Link>

      <div className="detail-header">
        <img className="detail-poster" src={img(movie.poster_path, 'w500')} alt={movie.title} loading="lazy" />
        <div className="detail-info">
          <h1>{movie.title}</h1>
          <p style={{ color: 'var(--muted)' }}>
            {movie.release_date?.slice(0, 4)}{movie.runtime ? ` · ${movie.runtime} min` : ''}
          </p>
          <div className="detail-rating">★ {movie.vote_average?.toFixed(1)}</div>

          <div className="detail-genres">
            {movie.genres?.map(g => (
              <span key={g.id} className="genre-tag">{g.name}</span>
            ))}
          </div>

          <div className="detail-actions">
            {listsData?.watchlist
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'watchlist' })}>✓ In Watchlist</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'watchlist' })}>Add to Watchlist</button>}
            {listsData?.watched
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'watched' })}>✓ Watched</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'watched' })}>Mark Watched</button>}
            {listsData?.favorites
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'favorites' })}>♥ Favorites</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'favorites' })}>Add to Favorites</button>}
          </div>

          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener"
              className="btn btn-outline"
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              ▶ Watch Trailer
            </a>
          )}

          {movie.overview && <div className="detail-overview">{movie.overview}</div>}
        </div>
      </div>

      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2>Cast</h2>
          <div className="actors-row">
            {movie.credits.cast.slice(0, 12).map(p => (
              <div className="actor-card" key={p.id}>
                <img src={img(p.profile_path, 'w185')} alt={p.name} loading="lazy" />
                <div className="name">{p.name}</div>
                <div className="role">{p.character}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {movie.similar?.results && movie.similar.results.length > 0 && (
        <div>
          <h2>Similar Movies</h2>
          <div className="similar-row">
            {movie.similar.results.slice(0, 8).map(s => (
              <Link to={`/movie/${s.id}`} key={s.id} className="similar-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={img(s.poster_path, 'w185')} alt={s.title} loading="lazy" />
                <div className="title">{s.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
