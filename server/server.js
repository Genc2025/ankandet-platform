import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';

import db, { initDatabase } from './db.js';
import { setupWebSocket, broadcast } from './websocket.js';
import { processExpiredAuctions } from './auction-engine.js';
import { runAutomatedBusinessAlerts } from './alerts-engine.js';

import authRoutes from './routes/auth.js';
import auctionsRoutes from './routes/auctions.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & indexes
initDatabase();

const app = express();
const server = http.createServer(app);

// Setup WebSockets
setupWebSocket(server);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Ankandet.ks - Platformë Profesionale Ankandesh',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// JSON 404 handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Rruga '${req.baseUrl}${req.path}' nuk ekziston në server.` });
});

// Serve frontend build if dist folder exists
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/ws') && req.method === 'GET') {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Background Worker: Checks expired auctions every second & runs business alerts every 15s
let alertTickCounter = 0;
const auctionWorkerInterval = setInterval(() => {
  processExpiredAuctions(broadcast);
  alertTickCounter++;
  if (alertTickCounter % 15 === 0) {
    runAutomatedBusinessAlerts(broadcast);
  }
}, 1000);

// Run initial business check
setTimeout(() => runAutomatedBusinessAlerts(broadcast), 2000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ANKANDET SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint available at: ws://localhost:${PORT}/ws`);
  console.log(`🇦🇱 Gjuha kryesore: Shqip (Kosovë)`);
  console.log(`====================================================`);
});

// Handle graceful termination
process.on('SIGINT', () => {
  clearInterval(auctionWorkerInterval);
  server.close(() => {
    db.close();
    console.log('Ankandet server shutdown safely.');
    process.exit(0);
  });
});
