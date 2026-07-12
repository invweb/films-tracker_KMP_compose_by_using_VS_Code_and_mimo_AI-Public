import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tmdbApi, moviesApi, reviewsApi, img, Review } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function ReviewForm({ tmdbId, existing, onSaved }: { tmdbId: number; existing: Review | null; onSaved: () => void }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.text || '');

  const mutation = useMutation({
    mutationFn: () => reviewsApi.saveReview({ tmdb_id: tmdbId, rating: rating || undefined, text: text || undefined }),
    onSuccess: onSaved,
  });

  return (
    <div className="review-form">
      <div className="rating-input">
        <label>{t('yourRating')}:</label>
        <div className="star-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              type="button"
              className={`star-btn ${n <= rating ? 'active' : ''}`}
              onClick={() => setRating(n === rating ? 0 : n)}
            >
              ★
            </button>
          ))}
          {rating > 0 && <span className="rating-display">{rating}/10</span>}
        </div>
      </div>
      <textarea
        className="review-textarea"
        placeholder={t('reviewPlaceholder')}
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
      />
      <div className="review-actions">
        <button
          className="btn btn-accent"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {existing ? t('updateReview') : t('saveReview')}
        </button>
        {existing && (
          <button className="btn btn-outline" onClick={onSaved}>
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tmdbId = Number(id);
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', tmdbId],
    queryFn: () => reviewsApi.getMovieReviews(tmdbId),
    enabled: !!tmdbId,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', tmdbId],
    queryFn: () => reviewsApi.getMyReview(tmdbId),
    enabled: !!tmdbId && !!user,
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

  if (isLoading) return <div className="empty">{t('loading')}</div>;
  if (error) return <div className="empty">{t('noResults')}</div>;
  if (!movie) return <div className="empty">{t('noResults')}</div>;

  const trailer = movie.videos?.results?.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  return (
    <div>
      <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }} aria-label={t('backToSearch')}>
        ← {t('backToSearch')}
      </Link>

      <div className="detail-header">
        <img className="detail-poster" src={img(movie.poster_path, 'w500')} alt={movie.title} loading="lazy" />
        <div className="detail-info">
          <h1>{movie.title}</h1>
          <p style={{ color: 'var(--muted)' }}>
            {movie.release_date?.slice(0, 4)}{movie.runtime ? ` · ${movie.runtime} min` : ''}
          </p>
          <div className="detail-rating">★ {movie.vote_average?.toFixed(1)}</div>

          {reviewsData?.stats.avgRating && (
            <div style={{ color: 'var(--gold)', fontSize: 14, marginBottom: 8 }}>
              {t('communityRating')}: ★ {reviewsData.stats.avgRating} ({reviewsData.stats.count} {t('reviews')})
            </div>
          )}

          <div className="detail-genres">
            {movie.genres?.map(g => (
              <span key={g.id} className="genre-tag">{g.name}</span>
            ))}
          </div>

          <div className="detail-actions">
            {listsData?.watchlist
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'watchlist' })}>✓ {t('inWatchlist')}</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'watchlist' })}>{t('addToWatchlist')}</button>}
            {listsData?.watched
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'watched' })}>✓ {t('watched')}</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'watched' })}>{t('markWatched')}</button>}
            {listsData?.favorites
              ? <button className="btn btn-accent active" onClick={() => listMutation.mutate({ action: 'remove', listType: 'favorites' })}>♥ {t('favorites')}</button>
              : <button className="btn btn-outline" onClick={() => listMutation.mutate({ action: 'add', listType: 'favorites' })}>{t('addToFavorites')}</button>}
          </div>

          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener"
              className="btn btn-outline"
              style={{ display: 'inline-block', marginBottom: 16 }}
            >
              ▶ {t('watchTrailer')}
            </a>
          )}

          {movie.overview && <div className="detail-overview">{movie.overview}</div>}
        </div>
      </div>

      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2>{t('cast')}</h2>
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

      <div className="reviews-section">
        <h2>{t('reviews')} ({reviewsData?.stats.count || 0})</h2>

        {user && (
          <>
            {showReviewForm || myReview ? (
              <ReviewForm
                tmdbId={tmdbId}
                existing={myReview ?? null}
                onSaved={() => {
                  setShowReviewForm(false);
                  refetchReviews();
                  queryClient.invalidateQueries({ queryKey: ['my-review', tmdbId] });
                }}
              />
            ) : (
              <button className="btn btn-outline" onClick={() => setShowReviewForm(true)} style={{ marginBottom: 16 }}>
                {t('writeReview')}
              </button>
            )}
          </>
        )}

        {reviewsData?.reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <span className="review-author">{review.author_name || review.author_email}</span>
              {review.rating && <span className="review-rating">★ {review.rating}/10</span>}
              <span className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.text && <p className="review-text">{review.text}</p>}
          </div>
        ))}

        {!reviewsData?.reviews.length && <p className="empty" style={{ marginTop: 16 }}>{t('noReviewsYet')}</p>}
      </div>

      {movie.similar?.results && movie.similar.results.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2>{t('similarMovies')}</h2>
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
