import { Router } from 'express';
import { getDB, saveDB } from '../db';
import { AuthRequest } from '../middleware/auth';

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

router.get('/movie/:tmdbId', (req, res) => {
  const { tmdbId } = req.params;
  const reviews = all(`
    SELECT r.*, u.name as author_name, u.email as author_email
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.tmdb_id = ?
    ORDER BY r.created_at DESC
  `, [Number(tmdbId)]);

  const stats = get(`
    SELECT
      COUNT(*) as count,
      AVG(rating) as avg_rating
    FROM reviews
    WHERE tmdb_id = ? AND rating IS NOT NULL
  `, [Number(tmdbId)]);

  res.json({
    reviews,
    stats: {
      count: stats?.count || 0,
      avgRating: stats?.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : null,
    },
  });
});

router.get('/my/:tmdbId', (req: AuthRequest, res) => {
  const { tmdbId } = req.params;
  const review = get(
    'SELECT * FROM reviews WHERE user_id = ? AND tmdb_id = ?',
    [req.user!.userId, Number(tmdbId)]
  );
  res.json(review || null);
});

router.post('/', (req: AuthRequest, res) => {
  const { tmdb_id, rating, text } = req.body;
  const userId = req.user!.userId;

  if (!tmdb_id) {
    return res.status(400).json({ error: 'tmdb_id is required' });
  }

  if (rating !== null && rating !== undefined && (rating < 1 || rating > 10)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });
  }

  const existing = get(
    'SELECT * FROM reviews WHERE user_id = ? AND tmdb_id = ?',
    [userId, tmdb_id]
  );

  if (existing) {
    run(
      `UPDATE reviews SET rating = COALESCE(?, rating), text = COALESCE(?, text), updated_at = datetime('now')
       WHERE user_id = ? AND tmdb_id = ?`,
      [rating ?? null, text ?? null, userId, tmdb_id]
    );
  } else {
    run(
      'INSERT INTO reviews (user_id, tmdb_id, rating, text) VALUES (?, ?, ?, ?)',
      [userId, tmdb_id, rating ?? null, text ?? null]
    );
  }

  const review = get(
    'SELECT * FROM reviews WHERE user_id = ? AND tmdb_id = ?',
    [userId, tmdb_id]
  );
  res.json(review);
});

router.delete('/:tmdbId', (req: AuthRequest, res) => {
  const { tmdbId } = req.params;
  const userId = req.user!.userId;

  const existing = get(
    'SELECT * FROM reviews WHERE user_id = ? AND tmdb_id = ?',
    [userId, Number(tmdbId)]
  );

  if (!existing) {
    return res.status(404).json({ error: 'Review not found' });
  }

  run('DELETE FROM reviews WHERE user_id = ? AND tmdb_id = ?', [userId, Number(tmdbId)]);
  res.json({ success: true });
});

export default router;
