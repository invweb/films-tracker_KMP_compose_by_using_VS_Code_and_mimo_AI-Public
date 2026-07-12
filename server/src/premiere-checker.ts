import { sendPushToAll } from '../routes/notifications';
import { all } from './db-helper';

const CHECK_INTERVAL = 60 * 60 * 1000;
const NOTIFICATION_DAYS_BEFORE = 3;

let checkTimer: ReturnType<typeof setInterval> | null = null;

export function startPremiereChecker() {
  console.log('Starting premiere checker...');

  checkPremieres();

  checkTimer = setInterval(checkPremieres, CHECK_INTERVAL);
}

export function stopPremiereChecker() {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}

async function checkPremieres() {
  try {
    const today = new Date();
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + NOTIFICATION_DAYS_BEFORE);

    const upcoming = all(`
      SELECT tmdb_id, title, release_date
      FROM movies
      WHERE release_date IS NOT NULL
        AND release_date != ''
        AND date(release_date) BETWEEN date(?) AND date(?, '+' || ? || ' days')
    `, [today.toISOString().split('T')[0], today.toISOString().split('T')[0], String(NOTIFICATION_DAYS_BEFORE)]);

    for (const movie of upcoming) {
      const releaseDate = new Date(movie.release_date);
      const daysUntil = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let message: string;
      if (daysUntil <= 0) {
        message = `Сегодня премьера!`;
      } else if (daysUntil === 1) {
        message = `Завтра премьера!`;
      } else {
        message = `Через ${daysUntil} дней`;
      }

      await sendPushToAll(
        `🎬 ${movie.title}`,
        `${message} — ${new Date(movie.release_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`,
        `/movie/${movie.tmdb_id}`
      );

      console.log(`Notification sent for: ${movie.title}`);
    }
  } catch (error) {
    console.error('Error checking premieres:', error);
  }
}
