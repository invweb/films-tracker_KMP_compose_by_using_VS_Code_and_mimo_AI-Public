import { Router } from 'express';
import { getDB, saveDB } from '../db';
import { LOCAL_MOVIES, LocalMovie } from '../local-movies';

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

function toMovieId(imdbID: string): number {
  return parseInt(imdbID.replace('tt', ''), 10);
}

function parseRating(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function toFrontend(m: LocalMovie) {
  return {
    id: toMovieId(m.imdbID),
    tmdb_id: toMovieId(m.imdbID),
    title: m.Title,
    poster_path: m.Poster !== 'N/A' ? m.Poster : null,
    backdrop_path: null,
    overview: m.Plot,
    release_date: m.Released || `${m.Year}-01-01`,
    vote_average: parseRating(m.imdbRating),
    genre_ids: [],
    genres: m.Genre ? m.Genre.split(', ').map(g => ({ id: 0, name: g })) : [],
    runtime: m.Runtime && m.Runtime !== 'TBD' ? parseInt(m.Runtime) : undefined,
    director: m.Director,
    actors: m.Actors,
    rated: m.Rated,
    language: m.Language,
    country: m.Country,
    awards: m.Awards,
  };
}

function upsertMovie(m: LocalMovie) {
  const tmdbId = toMovieId(m.imdbID);
  try {
    run(
      `INSERT OR IGNORE INTO movies (tmdb_id, title, poster_path, backdrop_path, overview, release_date, vote_average, genre_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tmdbId, m.Title, m.Poster !== 'N/A' ? m.Poster : null, null, m.Plot, m.Released, parseRating(m.imdbRating), JSON.stringify([])]
    );
  } catch {}
}

function searchLocal(query: string): LocalMovie[] {
  const q = query.toLowerCase();
  return LOCAL_MOVIES.filter(m =>
    m.Title.toLowerCase().includes(q) ||
    m.Director.toLowerCase().includes(q) ||
    m.Actors.toLowerCase().includes(q) ||
    m.Genre.toLowerCase().includes(q)
  );
}

function getById(id: string): LocalMovie | undefined {
  return LOCAL_MOVIES.find(m => m.imdbID === id || String(toMovieId(m.imdbID)) === id);
}

function paginate<T>(items: T[], page: number, limit: number): { data: T[]; total: number; page: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total,
    page,
    totalPages,
  };
}

router.get('/search', async (req, res) => {
  const query = (req.query.query as string) || '';
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  if (!query.trim()) {
    return res.json({ results: [], total: 0, page: 1, totalPages: 0 });
  }
  const results = searchLocal(query).map(toFrontend);
  results.forEach(m => {
    const local = LOCAL_MOVIES.find(l => toMovieId(l.imdbID) === m.id);
    if (local) upsertMovie(local);
  });
  const paged = paginate(results, page, limit);
  res.json({ results: paged.data, total: paged.total, page: paged.page, totalPages: paged.totalPages });
});

router.get('/trending', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const results = LOCAL_MOVIES.filter(m => parseRating(m.imdbRating) >= 8.0)
    .sort((a, b) => parseRating(b.imdbRating) - parseRating(a.imdbRating))
    .map(toFrontend);
  results.forEach(m => {
    const local = LOCAL_MOVIES.find(l => toMovieId(l.imdbID) === m.id);
    if (local) upsertMovie(local);
  });
  const paged = paginate(results, page, limit);
  res.json({ results: paged.data, total: paged.total, page: paged.page, totalPages: paged.totalPages });
});

router.get('/upcoming', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const now = new Date();
  const upcoming = LOCAL_MOVIES.filter(m => {
    const year = parseInt(m.Year);
    return year >= now.getFullYear() - 1;
  }).sort((a, b) => {
    const dateA = a.Released || `${a.Year}-12-31`;
    const dateB = b.Released || `${b.Year}-12-31`;
    return dateA.localeCompare(dateB);
  });
  upcoming.forEach(upsertMovie);
  const paged = paginate(upcoming.map(toFrontend), page, limit);
  res.json({ results: paged.data, total: paged.total, page: paged.page, totalPages: paged.totalPages });
});

router.get('/movie/:id', async (req, res) => {
  const movie = getById(req.params.id);
  if (movie) {
    upsertMovie(movie);
    return res.json({
      ...toFrontend(movie),
      credits: {
        cast: movie.Actors ? movie.Actors.split(', ').map(a => ({ id: 0, name: a, character: '', profile_path: null })) : [],
        crew: movie.Director ? movie.Director.split(', ').map(d => ({ id: 0, name: d.trim(), job: 'Director' })) : [],
      },
      similar: { results: LOCAL_MOVIES.filter(m => m.imdbID !== movie.imdbID && m.Genre.split(', ').some(g => movie.Genre.includes(g))).slice(0, 6).map(toFrontend) },
      videos: { results: [] },
    });
  }
  return res.status(404).json({ error: 'Movie not found' });
});

router.get('/recommendations', async (_req, res) => {
  const watched = all('SELECT tmdb_id FROM user_movies WHERE list_type = ? ORDER BY created_at DESC LIMIT 5', ['watched']);

  if (watched.length === 0) {
    return res.json({ results: LOCAL_MOVIES.sort(() => Math.random() - 0.5).slice(0, 12).map(toFrontend) });
  }

  const watchedGenres = new Set<string>();
  for (const w of watched) {
    const m = getById(String(w.tmdb_id));
    if (m) m.Genre.split(', ').forEach(g => watchedGenres.add(g));
  }

  const watchedIds = new Set(watched.map((w: any) => w.tmdb_id));
  const recs = LOCAL_MOVIES
    .filter(m => !watchedIds.has(toMovieId(m.imdbID)) && m.Genre.split(', ').some(g => watchedGenres.has(g)))
    .sort(() => Math.random() - 0.5)
    .slice(0, 12);

  res.json({ results: recs.map(toFrontend) });
});

router.get('/status', (_req, res) => {
  res.json({ omdbConnected: false, localMovies: LOCAL_MOVIES.length });
});

export default router;
