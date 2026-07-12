import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initDB } from './db';
import moviesRouter from './routes/movies';
import tmdbRouter from './routes/tmdb';
import authRouter from './routes/auth';
import reviewsRouter from './routes/reviews';
import syncRouter from './routes/sync';
import notificationsRouter from './routes/notifications';
import { authMiddleware } from './middleware/auth';
import { setupWebSocket } from './websocket';
import { startPremiereChecker } from './premiere-checker';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/movies', authMiddleware, moviesRouter);
app.use('/api/tmdb', authMiddleware, tmdbRouter);
app.use('/api/reviews', authMiddleware, reviewsRouter);
app.use('/api/sync', authMiddleware, syncRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await initDB();
  console.log('Database initialized');

  setupWebSocket(server);

  startPremiereChecker();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  });
}

start().catch(console.error);

export default app;
