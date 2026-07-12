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

router.get('/', (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const lastSync = req.query.lastSync as string | undefined;

  let query = `
    SELECT um.*, m.title, m.poster_path, m.backdrop_path, m.overview, m.release_date, m.vote_average, m.genre_ids
    FROM user_movies um
    JOIN movies m ON um.tmdb_id = m.tmdb_id
    WHERE um.user_id = ?
  `;
  const params: any[] = [userId];

  if (lastSync) {
    query += ' AND (um.updated_at > ? OR um.created_at > ?)';
    params.push(lastSync, lastSync);
  }

  query += ' ORDER BY um.updated_at DESC';

  const movies = all(query, params);

  let reviewQuery = 'SELECT * FROM reviews WHERE user_id = ?';
  const reviewParams: any[] = [userId];

  if (lastSync) {
    reviewQuery += ' AND (updated_at > ? OR created_at > ?)';
    reviewParams.push(lastSync, lastSync);
  }

  const reviews = all(reviewQuery, reviewParams);

  res.json({
    movies,
    reviews,
    syncTime: new Date().toISOString(),
  });
});

router.post('/', (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { movies, reviews } = req.body;

  if (movies && Array.isArray(movies)) {
    for (const movie of movies) {
      const existing = all(
        'SELECT id FROM user_movies WHERE user_id = ? AND tmdb_id = ? AND list_type = ?',
        [userId, movie.tmdb_id, movie.list_type]
      );

      if (existing.length > 0) {
        run(
          `UPDATE user_movies
           SET rating = COALESCE(?, rating),
               notes = COALESCE(?, notes),
               tags = COALESCE(?, tags),
               updated_at = datetime('now')
           WHERE user_id = ? AND tmdb_id = ? AND list_type = ?`,
          [movie.rating ?? null, movie.notes ?? null, movie.tags ?? null, userId, movie.tmdb_id, movie.list_type]
        );
      } else {
        run(
          'INSERT INTO user_movies (user_id, tmdb_id, list_type, rating, notes, tags) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, movie.tmdb_id, movie.list_type, movie.rating ?? null, movie.notes ?? null, movie.tags ?? null]
        );
      }
    }
  }

  if (reviews && Array.isArray(reviews)) {
    for (const review of reviews) {
      const existing = all(
        'SELECT id FROM reviews WHERE user_id = ? AND tmdb_id = ?',
        [userId, review.tmdb_id]
      );

      if (existing.length > 0) {
        run(
          `UPDATE reviews
           SET rating = COALESCE(?, rating),
               text = COALESCE(?, text),
               updated_at = datetime('now')
           WHERE user_id = ? AND tmdb_id = ?`,
          [review.rating ?? null, review.text ?? null, userId, review.tmdb_id]
        );
      } else {
        run(
          'INSERT INTO reviews (user_id, tmdb_id, rating, text) VALUES (?, ?, ?, ?)',
          [userId, review.tmdb_id, review.rating ?? null, review.text ?? null]
        );
      }
    }
  }

  res.json({ success: true, syncTime: new Date().toISOString() });
});

router.delete('/full', (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  run('DELETE FROM user_movies WHERE user_id = ?', [userId]);
  run('DELETE FROM reviews WHERE user_id = ?', [userId]);
  res.json({ success: true });
});

export default router;
