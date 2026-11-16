import { WebSocketServer, WebSocket } from 'ws';

let wss = null;
const clients = new Set();

export function setupWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'SUBSCRIBE_PRODUCT') {
          ws.subscribedProductId = data.productId;
        } else if (data.type === 'IDENTIFY_USER') {
          ws.userId = data.userId;
        }
      } catch (e) {
        // Ignore malformed json
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });

    // Send initial connected ping
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() }));
  });

  // Heartbeat interval every 30 seconds
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  console.log('Real-Time WebSocket server initialized on /ws');
  return wss;
}

export function broadcast(type, payload) {
  if (!wss) return;

  const msg = JSON.stringify({ type, payload, timestamp: Date.now() });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        // If event is private to a user (e.g. OUTBID_ALERT)
        if (type === 'OUTBID_ALERT' && payload.userId) {
          if (client.userId === payload.userId) {
            client.send(msg);
          }
        } else {
          // Public broadcast
          client.send(msg);
        }
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  }
}
