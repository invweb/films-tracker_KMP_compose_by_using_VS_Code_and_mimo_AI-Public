import { Router } from 'express';
import { getDB, saveDB } from '../db';

const router = Router();

function all(sql: string, params: any[] = []): any[] {
  const db = getDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql: string, params: any[] = []): void {
  const db = getDB();
  db.run(sql, params);
  saveDB();
}

function get(sql: string, params: any[] = []): any | null {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

router.get('/', (req, res) => {
  const { list_type, tag } = req.query;

  let query = 'SELECT um.*, m.title, m.poster_path, m.backdrop_path, m.overview, m.release_date, m.vote_average, m.genre_ids FROM user_movies um JOIN movies m ON um.tmdb_id = m.tmdb_id';
  const params: any[] = [];

  if (list_type) {
    query += ' WHERE um.list_type = ?';
    params.push(list_type);
  }

  if (tag) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' um.tags LIKE ?';
    params.push(`%${tag}%`);
  }

  query += ' ORDER BY um.created_at DESC';

  const movies = all(query, params);
  res.json(movies);
});

router.post('/', (req, res) => {
  const { tmdb_id, list_type, rating, notes, tags } = req.body;

  if (!tmdb_id || !list_type) {
    return res.status(400).json({ error: 'tmdb_id and list_type are required' });
  }

  const movie = get('SELECT * FROM movies WHERE tmdb_id = ?', [tmdb_id]);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found in local DB. Fetch from TMDB first.' });
  }

  const existing = get('SELECT * FROM user_movies WHERE tmdb_id = ? AND list_type = ?', [tmdb_id, list_type]);

  if (existing) {
    run(
      `UPDATE user_movies SET rating = COALESCE(?, rating), notes = COALESCE(?, notes), tags = COALESCE(?, tags), updated_at = datetime('now') WHERE tmdb_id = ? AND list_type = ?`,
      [rating ?? null, notes ?? null, tags ?? null, tmdb_id, list_type]
    );
    const updated = get('SELECT * FROM user_movies WHERE tmdb_id = ? AND list_type = ?', [tmdb_id, list_type]);
    return res.json(updated);
  }

  run(
    'INSERT INTO user_movies (tmdb_id, list_type, rating, notes, tags) VALUES (?, ?, ?, ?, ?)',
    [tmdb_id, list_type, rating ?? null, notes ?? null, tags ?? null]
  );
  const created = get('SELECT * FROM user_movies WHERE tmdb_id = ? AND list_type = ?', [tmdb_id, list_type]);
  res.status(201).json(created);
});

router.delete('/:tmdbId/:listType', (req, res) => {
  const { tmdbId, listType } = req.params;

  const before = get('SELECT * FROM user_movies WHERE tmdb_id = ? AND list_type = ?', [Number(tmdbId), listType]);
  if (!before) {
    return res.status(404).json({ error: 'Not found' });
  }

  run('DELETE FROM user_movies WHERE tmdb_id = ? AND list_type = ?', [Number(tmdbId), listType]);
  res.json({ success: true });
});

router.get('/stats', (_req, res) => {
  const watchlist = get('SELECT COUNT(*) as count FROM user_movies WHERE list_type = ?', ['watchlist']);
  const watched = get('SELECT COUNT(*) as count FROM user_movies WHERE list_type = ?', ['watched']);
  const favorites = get('SELECT COUNT(*) as count FROM user_movies WHERE list_type = ?', ['favorites']);
  const avgRating = get('SELECT AVG(rating) as avg FROM user_movies WHERE rating IS NOT NULL');

  res.json({
    watchlist: watchlist?.count || 0,
    watched: watched?.count || 0,
    favorites: favorites?.count || 0,
    avgRating: avgRating?.avg ? Math.round(avgRating.avg * 10) / 10 : null,
  });
});

router.get('/stats/detailed', (_req, res) => {
  const ratingDist = all(`
    SELECT rating, COUNT(*) as count
    FROM user_movies
    WHERE rating IS NOT NULL
    GROUP BY rating
    ORDER BY rating
  `);

  const genreStats = all(`
    SELECT m.genre_ids, COUNT(*) as count, AVG(um.rating) as avg_rating
    FROM user_movies um
    JOIN movies m ON um.tmdb_id = m.tmdb_id
    WHERE um.list_type = 'watched' AND m.genre_ids IS NOT NULL
    GROUP BY m.genre_ids
    ORDER BY count DESC
    LIMIT 10
  `);

  const monthlyStats = all(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM user_movies
    WHERE created_at IS NOT NULL
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `);

  const ratingStats = get(`
    SELECT
      MIN(rating) as min_rating,
      MAX(rating) as max_rating,
      COUNT(rating) as rated_count
    FROM user_movies
    WHERE rating IS NOT NULL
  `);

  const totalMovies = get('SELECT COUNT(*) as count FROM user_movies');

  const byListType = all(`
    SELECT list_type, COUNT(*) as count, AVG(rating) as avg_rating
    FROM user_movies
    GROUP BY list_type
  `);

  res.json({
    ratingDistribution: ratingDist,
    genreStats,
    monthlyStats: monthlyStats.reverse(),
    ratingStats: {
      min: ratingStats?.min_rating || 0,
      max: ratingStats?.max_rating || 0,
      ratedCount: ratingStats?.rated_count || 0,
    },
    totalMovies: totalMovies?.count || 0,
    byListType,
  });
});

router.get('/export', (_req, res) => {
  const movies = all(`
    SELECT um.list_type, m.title, m.release_date, um.rating, um.notes, um.tags, m.vote_average
    FROM user_movies um
    JOIN movies m ON um.tmdb_id = m.tmdb_id
    ORDER BY um.list_type, um.created_at DESC
  `);

  const csv = [
    'List,Title,Release Date,My Rating,TMDB Rating,Notes,Tags',
    ...movies.map((m: any) =>
      `"${m.list_type}","${m.title}","${m.release_date || ''}",${m.rating || ''},${m.vote_average || ''},"${(m.notes || '').replace(/"/g, '""')}","${m.tags || ''}"`
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=films_export.csv');
  res.send(csv);
});

export default router;
