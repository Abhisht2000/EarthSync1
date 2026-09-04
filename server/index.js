import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);
const host = '0.0.0.0';

// Enable CORS for all origins (allows local dev, deployed frontend, or external ESP32s)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// In-memory telemetry cache
let latestReadings = {};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'EARTHSYNC ENVIRONMENTAL INTELLIGENCE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: port
  });
});

// ESP32 REST Ingestion Endpoint
app.post('/api/sensors/ingest', (req, res) => {
  const reading = req.body;
  if (!reading || !reading.nodeId) {
    return res.status(400).json({ error: 'Missing nodeId or payload' });
  }

  reading.timestamp = reading.timestamp || new Date().toISOString();
  latestReadings[reading.nodeId] = reading;

  // Broadcast to all active WebSocket browser clients
  const message = JSON.stringify({
    type: 'READING',
    payload: reading
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ status: 'ACCEPTED', nodeId: reading.nodeId });
});

// Query active nodes
app.get('/api/sensors/nodes', (req, res) => {
  res.json({ nodes: Object.values(latestReadings) });
});

// Serve production static assets from Vite build if dist directory exists
if (fs.existsSync(distPath)) {
  console.log(`[EARTHSYNC SERVER] Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback for client-side navigation (avoid 404 on refresh)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('[EARTHSYNC SERVER] No dist folder found. Run `npm run build` to generate static files.');
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handling with keep-alive heartbeat
wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  console.log(`[EarthSync WS] Client connected from ${req.socket.remoteAddress}`);

  ws.send(
    JSON.stringify({
      type: 'INFO',
      message: 'EarthSync Command Center Stream Connected'
    })
  );

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[EarthSync WS] Received:', data);
    } catch (e) {
      console.error('[EarthSync WS] Error parsing client message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[EarthSync WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[EarthSync WS] Socket error:', err.message);
  });
});

// Ping clients every 30 seconds to prevent cloud proxies (Render, Cloudflare, etc.) from closing idle sockets
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('[EarthSync WS] Terminating dead connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

server.listen(port, host, () => {
  console.log(`====================================================`);
  console.log(`  EARTHSYNC MULTI-HAZARD INTELLIGENCE PLATFORM`);
  console.log(`====================================================`);
  console.log(`  Status:       OPERATIONAL`);
  console.log(`  Environment:  ${process.env.NODE_ENV || 'production'}`);
  console.log(`  Listening on: http://${host}:${port}`);
  console.log(`  REST API:     http://${host}:${port}/api/health`);
  console.log(`  ESP32 Ingest: http://${host}:${port}/api/sensors/ingest`);
  console.log(`  WebSocket:    ws://${host}:${port}/ws (or wss:// on HTTPS)`);
  if (fs.existsSync(distPath)) {
    console.log(`  Frontend:     Serving built React application`);
  }
  console.log(`====================================================`);
});
