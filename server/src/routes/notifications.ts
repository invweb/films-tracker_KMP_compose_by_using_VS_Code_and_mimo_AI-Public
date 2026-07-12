import { Router } from 'express';
import webpush from 'web-push';
import { getDB, saveDB } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@films-app.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

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

router.get('/vapid-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post('/subscribe', (req: AuthRequest, res) => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }

  const userId = req.user!.userId;
  const { endpoint, p256dh, auth } = req.body;

  if (!endpoint || !p256dh || !auth) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  const existing = get(
    'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
    [userId, endpoint]
  );

  if (existing) {
    run(
      'UPDATE push_subscriptions SET p256dh = ?, auth = ? WHERE user_id = ? AND endpoint = ?',
      [p256dh, auth, userId, endpoint]
    );
  } else {
    run(
      'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
      [userId, endpoint, p256dh, auth]
    );
  }

  res.json({ success: true });
});

router.post('/unsubscribe', (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { endpoint } = req.body;

  if (endpoint) {
    run(
      'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
      [userId, endpoint]
    );
  } else {
    run('DELETE FROM push_subscriptions WHERE user_id = ?', [userId]);
  }

  res.json({ success: true });
});

router.get('/status', (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const count = get(
    'SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );
  res.json({ enabled: (count?.count || 0) > 0 });
});

export async function sendPushToUser(userId: number, title: string, body: string, url?: string) {
  const subscriptions = all(
    'SELECT * FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );

  const payload = JSON.stringify({ title, body, url });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
      }
    }
  }
}

export async function sendPushToAll(title: string, body: string, url?: string) {
  const subscriptions = all('SELECT * FROM push_subscriptions');
  const payload = JSON.stringify({ title, body, url });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        run('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
      }
    }
  }
}

export default router;
