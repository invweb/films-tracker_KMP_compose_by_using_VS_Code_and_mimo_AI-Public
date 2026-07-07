import { Router } from 'express';
import { getDB, saveDB } from '../db';
import { MOCK_MOVIES, MOCK_UPCOMING } from '../mock';

const router = Router();

const OMDB_BASE = 'https://www.omdbapi.com';
const OMDB_KEY = process.env.OMDB_API_KEY;

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

function hasKey() {
  return OMDB_KEY && OMDB_KEY !== 'your_omdb_api_key_here';
}

function toMovieId(imdbID: string): number {
  return parseInt(imdbID.replace('tt', ''), 10);
}

function parseRating(val: string): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

async function omdbFetch(params: Record<string, string>) {
  if (!hasKey()) throw new Error('NO_KEY');

  const url = new URL(OMDB_BASE);
  url.searchParams.set('apikey', OMDB_KEY!);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OMDb error: ${res.status}`);
  return res.json();
}

function upsertMovie(movie: any) {
  const tmdbId = toMovieId(movie.imdbID || movie.id || 'tt0');
  const rating = movie.Ratings?.[0]?.Value
    ? parseRating(movie.Ratings[0].Value)
    : parseRating(movie.vote_average || '0');

  try {
    run(
      `INSERT OR IGNORE INTO movies (tmdb_id, title, poster_path, backdrop_path, overview, release_date, vote_average, genre_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tmdbId,
        movie.Title || movie.title,
        movie.Poster !== 'N/A' ? movie.Poster : movie.poster_path || null,
        movie.backdrop_path || null,
        movie.Plot || movie.overview || '',
        movie.Year ? `${movie.Year}-01-01` : movie.release_date || null,
        rating,
        JSON.stringify(movie.genre_ids || []),
      ]
    );
  } catch {}
}

function toFrontend(movie: any) {
  const rating = movie.Ratings?.[0]?.Value
    ? parseRating(movie.Ratings[0].Value)
    : 0;

  return {
    id: toMovieId(movie.imdbID),
    tmdb_id: toMovieId(movie.imdbID),
    title: movie.Title,
    poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
    backdrop_path: movie.backdrop_path || null,
    overview: movie.Plot || '',
    release_date: movie.Year ? `${movie.Year}-01-01` : '',
    vote_average: rating,
    genre_ids: [],
    genres: movie.Genre ? movie.Genre.split(', ').map((g: string) => ({ id: 0, name: g })) : [],
    runtime: movie.Runtime ? parseInt(movie.Runtime) : undefined,
    director: movie.Director,
    actors: movie.Actors,
    rated: movie.Rated,
  };
}

router.get('/search', async (req, res) => {
  try {
    const query = (req.query.query as string) || '';
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    try {
      const data = await omdbFetch({ s: query, type: 'movie', page: '1' });
      if (data.Search) {
        const results = data.Search.map(toFrontend);
        results.forEach(upsertMovie);
        return res.json({ results });
      }
      return res.json({ results: [] });
    } catch {
      const filtered = MOCK_MOVIES.filter(m =>
        m.Title.toLowerCase().includes(query.toLowerCase())
      );
      filtered.forEach(upsertMovie);
      return res.json({ results: filtered.map(toFrontend) });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trending', async (_req, res) => {
  try {
    try {
      const data = await omdbFetch({ s: 'popular', type: 'movie', page: '1' });
      if (data.Search) {
        const results = data.Search.map(toFrontend);
        results.forEach(upsertMovie);
        return res.json({ results });
      }
      return res.json({ results: MOCK_MOVIES.map(toFrontend) });
    } catch {
      MOCK_MOVIES.forEach(upsertMovie);
      return res.json({ results: MOCK_MOVIES.map(toFrontend) });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/upcoming', async (_req, res) => {
  try {
    MOCK_UPCOMING.forEach(upsertMovie);
    return res.json({ results: MOCK_UPCOMING.map(toFrontend) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/movie/:id', async (req, res) => {
  try {
    try {
      const data = await omdbFetch({ i: req.params.id, plot: 'full' });
      if (data.Response === 'True') {
        upsertMovie(data);
        return res.json({
          ...toFrontend(data),
          credits: {
            cast: data.Actors ? data.Actors.split(', ').map((a: string) => ({ id: 0, name: a, character: '', profile_path: null })) : [],
            crew: data.Director ? [{ id: 0, name: data.Director, job: 'Director' }] : [],
          },
          similar: { results: [] },
          videos: { results: [] },
        });
      }
      return res.status(404).json({ error: 'Movie not found' });
    } catch {
      const paramId = req.params.id;
      const mock = MOCK_MOVIES.find(m =>
        m.id === paramId || m.imdbID === paramId || toMovieId(m.imdbID) === Number(paramId)
      );
      if (mock) {
        upsertMovie(mock);
        return res.json({
          ...toFrontend(mock),
          credits: { cast: [], crew: [] },
          similar: { results: MOCK_MOVIES.filter(m => m.id !== mock.id).slice(0, 5).map(toFrontend) },
          videos: { results: [] },
        });
      }
      return res.status(404).json({ error: 'Movie not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations', async (_req, res) => {
  try {
    const watched = all(
      'SELECT tmdb_id FROM user_movies WHERE list_type = ? ORDER BY created_at DESC LIMIT 5',
      ['watched']
    );

    if (watched.length === 0) {
      return res.json({ results: MOCK_MOVIES.slice(0, 10).map(toFrontend) });
    }

    const recs: any[] = [];
    for (const movie of watched.slice(0, 3)) {
      try {
        const data = await omdbFetch({ i: String(movie.tmdb_id), plot: 'full' });
        if (data.Response === 'True' && data.Genre) {
          const genres = data.Genre.split(', ');
          for (const genre of genres.slice(0, 2)) {
            try {
              const similar = await omdbFetch({ s: genre, type: 'movie', page: '1' });
              if (similar.Search) {
                recs.push(...similar.Search.map(toFrontend));
              }
            } catch {}
          }
        }
      } catch {
        recs.push(...MOCK_MOVIES.filter(m => m.id !== movie.tmdb_id).map(toFrontend));
      }
    }

    const seen = new Set(watched.map((m: any) => m.tmdb_id));
    const unique = recs.filter((m: any) => !seen.has(m.id));
    const deduped = unique.filter((m: any, i: number) => unique.findIndex((x: any) => x.id === m.id) === i);

    res.json({ results: deduped.slice(0, 10) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (_req, res) => {
  res.json({ omdbConnected: hasKey() });
});

export default router;
