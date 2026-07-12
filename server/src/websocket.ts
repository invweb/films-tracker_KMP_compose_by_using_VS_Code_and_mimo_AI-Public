import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './routes/auth';

interface SyncMessage {
  type: 'sync' | 'update' | 'delete' | 'ping' | 'pong';
  data?: any;
  timestamp?: string;
}

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  email?: string;
  isAlive?: boolean;
}

const clients = new Map<number, Set<AuthenticatedSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: AuthenticatedSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Token required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
      ws.userId = decoded.userId;
      ws.email = decoded.email;
      ws.isAlive = true;

      if (!clients.has(decoded.userId)) {
        clients.set(decoded.userId, new Set());
      }
      clients.get(decoded.userId)!.add(ws);

      console.log(`WebSocket connected: ${decoded.email}`);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data) => {
        try {
          const message: SyncMessage = JSON.parse(data.toString());
          handleMessage(ws, message);
        } catch (e) {
          console.error('Invalid message:', e);
        }
      });

      ws.on('close', () => {
        const userClients = clients.get(decoded.userId);
        if (userClients) {
          userClients.delete(ws);
          if (userClients.size === 0) {
            clients.delete(decoded.userId);
          }
        }
        console.log(`WebSocket disconnected: ${decoded.email}`);
      });

      ws.send(JSON.stringify({ type: 'connected', userId: decoded.userId }));
    } catch (e) {
      ws.close(4002, 'Invalid token');
    }
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const authWs = ws as AuthenticatedSocket;
      if (authWs.isAlive === false) {
        return authWs.terminate();
      }
      authWs.isAlive = false;
      authWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  return wss;
}

function handleMessage(sender: AuthenticatedSocket, message: SyncMessage) {
  if (!sender.userId) return;

  switch (message.type) {
    case 'update':
    case 'delete':
      broadcastToUser(sender.userId, message, sender);
      break;
    case 'ping':
      sender.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
  }
}

function broadcastToUser(userId: number, message: SyncMessage, exclude?: AuthenticatedSocket) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const payload = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString(),
  });

  userClients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function notifyUser(userId: number, message: SyncMessage) {
  broadcastToUser(userId, message);
}
