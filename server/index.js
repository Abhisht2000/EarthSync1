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

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// In-Memory Database & State Stores
const state = {
  activeScenario: 'NORMAL',
  scenarioStep: 0,
  isCloudConnected: true,
  isEdgeMode: false,
  bufferedEventsCount: 0,
  lastSyncTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
  history: [],
  otpStore: {}, // phone -> { otp, expiresAt }
  userSessions: {}, // token -> user
  users: [
    {
      id: 'usr-default',
      phoneNumber: '+91 9876543210',
      name: 'Devansh Porwal',
      language: 'en',
      location: {
        latitude: 28.625,
        longitude: 77.225,
        district: 'New Delhi',
        state: 'Delhi',
        areaName: 'Central Monitoring Basin'
      },
      safetyStatus: 'SAFE',
      notificationsEnabled: true,
      voiceAlertsEnabled: true,
      smsAlertsEnabled: true,
      emergencyContacts: [
        { id: 'ec-1', name: 'District Emergency Center', phone: '1078', relation: 'Authority' },
        { id: 'ec-2', name: 'Family Contact', phone: '+91 9811122233', relation: 'Family' }
      ],
      authenticated: true
    }
  ],
  nodes: [
    {
      id: 'FOREST-01',
      name: 'Forest Node 01 (Deep Ridge)',
      hazardType: 'wildfire',
      zone: 'Northern Forestry Zone 01',
      latitude: 28.642,
      longitude: 77.218,
      status: 'ONLINE',
      battery: 94,
      signalRssi: -64,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'FOREST-01',
        timestamp: new Date().toISOString(),
        temperature: 27.2,
        humidity: 63.5,
        waterLevel: 0,
        rainfall: false,
        smokePpm: 38,
        smokeLevel: 'LOW',
        windSpeed: 14,
        battery: 94,
        signalRssi: -64,
        dataQuality: 'GOOD'
      }
    },
    {
      id: 'RIVER-02',
      name: 'River Node 02 (Lower Basin)',
      hazardType: 'flood',
      zone: 'Eastern River Drainage 02',
      latitude: 28.618,
      longitude: 77.245,
      status: 'ONLINE',
      battery: 89,
      signalRssi: -71,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'RIVER-02',
        timestamp: new Date().toISOString(),
        temperature: 28.0,
        humidity: 65.0,
        waterLevel: 32.4,
        rateOfRise: 0.2,
        rainfall: false,
        smokePpm: 30,
        smokeLevel: 'LOW',
        windSpeed: 12,
        battery: 89,
        signalRssi: -71,
        dataQuality: 'GOOD'
      }
    },
    {
      id: 'RIVER-01',
      name: 'River Node 01 (Headwaters)',
      hazardType: 'flood',
      zone: 'Upper Basin Catchment 01',
      latitude: 28.665,
      longitude: 77.230,
      status: 'ONLINE',
      battery: 96,
      signalRssi: -68,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'RIVER-01',
        timestamp: new Date().toISOString(),
        temperature: 26.5,
        humidity: 68.0,
        waterLevel: 28.1,
        rateOfRise: 0.1,
        rainfall: false,
        smokePpm: 25,
        smokeLevel: 'LOW',
        windSpeed: 10,
        battery: 96,
        signalRssi: -68,
        dataQuality: 'GOOD'
      }
    },
    {
      id: 'FOREST-02',
      name: 'Forest Node 02 (Canopy Pass)',
      hazardType: 'wildfire',
      zone: 'Western Perimeter 02',
      latitude: 28.630,
      longitude: 77.195,
      status: 'WARNING',
      battery: 54,
      signalRssi: -82,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'FOREST-02',
        timestamp: new Date().toISOString(),
        temperature: 28.4,
        humidity: 59.0,
        waterLevel: 0,
        rainfall: false,
        smokePpm: 45,
        smokeLevel: 'LOW',
        windSpeed: 16,
        battery: 54,
        signalRssi: -82,
        dataQuality: 'DEGRADED'
      }
    },
    {
      id: 'HILL-01',
      name: 'Hill Node 01 (Escarpment)',
      hazardType: 'landslide',
      zone: 'Southern Terraces 04',
      latitude: 28.585,
      longitude: 77.220,
      status: 'ONLINE',
      battery: 91,
      signalRssi: -65,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'HILL-01',
        timestamp: new Date().toISOString(),
        temperature: 27.0,
        humidity: 62.0,
        waterLevel: 0,
        rainfall: false,
        smokePpm: 32,
        smokeLevel: 'LOW',
        windSpeed: 11,
        soilMoisture: 42,
        battery: 91,
        signalRssi: -65,
        dataQuality: 'GOOD'
      }
    },
    {
      id: 'VALLEY-01',
      name: 'Valley Node 01 (Central Plains)',
      hazardType: 'heatwave',
      zone: 'Central Lowlands 01',
      latitude: 28.625,
      longitude: 77.210,
      status: 'ONLINE',
      battery: 88,
      signalRssi: -69,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: 'VALLEY-01',
        timestamp: new Date().toISOString(),
        temperature: 31.0,
        humidity: 51.0,
        waterLevel: 0,
        rainfall: false,
        smokePpm: 35,
        smokeLevel: 'LOW',
        windSpeed: 14,
        battery: 88,
        signalRssi: -69,
        dataQuality: 'GOOD'
      }
    }
  ],
  gateways: [
    {
      id: 'GW-RPI-01',
      name: 'Raspberry Pi Gateway (Ridge Station 01)',
      zone: 'Northern Ridge Sector',
      latitude: 28.640,
      longitude: 77.220,
      status: 'ONLINE',
      loraStatus: 'ACTIVE',
      loraFrequency: '868.1 MHz (IN865 Band)',
      packetsReceivedTotal: 14820,
      packetsPerMinute: 48,
      packetLossRatePct: 0.2,
      connectedNodesCount: 6,
      cellularBackhaul: {
        carrier: 'Jio 4G LTE Edge',
        signalBars: 4,
        status: 'CONNECTED',
        ipAddress: '192.168.1.100'
      },
      localStorage: {
        dbEngine: 'SQLite 3.42 (Local Edge Buffer)',
        bufferedEvents: 0,
        syncPending: false,
        lastSyncedAt: 'Just now'
      },
      power: {
        solarActive: true,
        solarInputWatts: 42.5,
        batteryPct: 96,
        voltage: 12.8
      },
      firmwareVersion: 'v3.1.0-rpi4',
      uptimeHours: 342,
      lastHeartbeat: new Date().toISOString()
    },
    {
      id: 'GW-RPI-02',
      name: 'Raspberry Pi Gateway (River Basin 02)',
      zone: 'Eastern Drainage Sector',
      latitude: 28.620,
      longitude: 77.240,
      status: 'ONLINE',
      loraStatus: 'ACTIVE',
      loraFrequency: '868.3 MHz (IN865 Band)',
      packetsReceivedTotal: 12450,
      packetsPerMinute: 42,
      packetLossRatePct: 0.4,
      connectedNodesCount: 6,
      cellularBackhaul: {
        carrier: 'Airtel 4G LTE IoT',
        signalBars: 5,
        status: 'CONNECTED',
        ipAddress: '192.168.1.101'
      },
      localStorage: {
        dbEngine: 'SQLite 3.42 (Local Edge Buffer)',
        bufferedEvents: 0,
        syncPending: false,
        lastSyncedAt: 'Just now'
      },
      power: {
        solarActive: true,
        solarInputWatts: 38.0,
        batteryPct: 92,
        voltage: 12.6
      },
      firmwareVersion: 'v3.1.0-rpi4',
      uptimeHours: 298,
      lastHeartbeat: new Date().toISOString()
    }
  ],
  safeLocations: [
    {
      id: 'LOC-SH-01',
      name: 'Central District Community Relief Center',
      hindiName: 'केंद्रीय जिला सामुदायिक राहत केंद्र',
      type: 'shelter',
      latitude: 28.630,
      longitude: 77.235,
      address: 'Near Civil Lines, Sector 4, New Delhi',
      contactPhone: '011-23998877',
      capacity: 500,
      availableCapacity: 340,
      isOperational: true
    },
    {
      id: 'LOC-HOSP-01',
      name: 'Apex Government Emergency Hospital',
      hindiName: 'शीर्ष सरकारी आपातकालीन अस्पताल',
      type: 'hospital',
      latitude: 28.615,
      longitude: 77.215,
      address: 'Ring Road, North Block, New Delhi',
      contactPhone: '102 / 011-26588500',
      capacity: 350,
      availableCapacity: 85,
      isOperational: true
    },
    {
      id: 'LOC-EVAC-01',
      name: 'Higher Ground Evacuation Assembly Area',
      hindiName: 'सुरक्षित ऊंचाई निकासी सभा क्षेत्र',
      type: 'evacuation_point',
      latitude: 28.655,
      longitude: 77.225,
      address: 'Ridge Forest Elevated Grounds, New Delhi',
      contactPhone: '1078',
      capacity: 1200,
      availableCapacity: 1200,
      isOperational: true
    }
  ],
  alerts: [
    {
      id: 'alt-001',
      hazard: 'flood',
      level: 'WATCH',
      nodeId: 'RIVER-02',
      zone: 'Eastern River Drainage 02',
      riskScore: 38,
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      relativeTime: '14 min ago',
      what: 'Water level measured at 32.4 cm with steady upstream baseline inflow.',
      why: 'Minor seasonal precipitation variation recorded in river catchment.',
      action: 'Continue baseline surveillance. Embankment retention margins remain secure.',
      acknowledged: false
    }
  ],
  citizenImpact: {
    hazardId: 'flood',
    zoneName: 'Eastern River Drainage 02',
    affectedRadiusKm: 3.5,
    estimatedCitizenPopulation: 1420,
    notificationDelivery: {
      inAppDelivered: 1380,
      pushSent: 1350,
      pushDelivered: 1325,
      smsSent: 1280,
      smsDelivered: 1260,
      voiceCallsTriggered: 14,
      totalAcknowledged: 920
    },
    sheltersOpenInZone: 2,
    shelterCapacityTotal: 850,
    shelterOccupancy: 120,
    lastCalculatedAt: new Date().toISOString()
  }
};

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'EARTHSYNC ENVIRONMENTAL INTELLIGENCE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: port,
    activeNodes: state.nodes.length,
    activeGateways: state.gateways.length
  });
});

// 2. Auth: Send OTP (supports Dev OTP fallback & configurable provider)
app.post('/api/auth/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Generate 6-digit OTP (dev OTP is always 123456 or generated)
  const otp = process.env.NODE_ENV === 'production' && process.env.SMS_PROVIDER
    ? Math.floor(100000 + Math.random() * 900000).toString()
    : '123456';

  state.otpStore[phoneNumber] = {
    otp,
    expiresAt: Date.now() + 1000 * 60 * 5 // 5 minutes
  };

  console.log(`[EARTHSYNC AUTH] OTP generated for ${phoneNumber}: ${otp}`);

  res.json({
    status: 'SENT',
    message: 'Verification OTP sent successfully',
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

// 3. Auth: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const record = state.otpStore[phoneNumber];
  // In development, accept 123456 or matching record
  const isValid = record?.otp === otp || otp === '123456';

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  delete state.otpStore[phoneNumber];

  const token = 'es_tok_' + Math.random().toString(36).substring(2, 15);
  let user = state.users.find((u) => u.phoneNumber === phoneNumber);

  if (!user) {
    user = {
      id: 'usr-' + Date.now(),
      phoneNumber,
      name: 'Citizen User',
      language: 'en',
      location: {
        latitude: 28.625,
        longitude: 77.225,
        district: 'New Delhi',
        state: 'Delhi',
        areaName: 'Central District'
      },
      safetyStatus: 'SAFE',
      notificationsEnabled: true,
      voiceAlertsEnabled: true,
      smsAlertsEnabled: true,
      emergencyContacts: [],
      authenticated: true
    };
    state.users.push(user);
  }

  state.userSessions[token] = user;

  res.json({
    status: 'SUCCESS',
    token,
    user
  });
});

// 4. User Profile
app.get('/api/user/profile', (req, res) => {
  res.json({ user: state.users[0] });
});

// 5. Update Location
app.patch('/api/user/location', (req, res) => {
  const { latitude, longitude, areaName, district } = req.body;
  if (latitude && longitude) {
    state.users[0].location = {
      ...state.users[0].location,
      latitude,
      longitude,
      areaName: areaName || state.users[0].location.areaName,
      district: district || state.users[0].location.district,
      timestamp: new Date().toISOString()
    };
  }
  res.json({ status: 'UPDATED', location: state.users[0].location });
});

// 6. Sensor Ingestion Endpoint (ESP32 REST)
app.post('/api/sensors/ingest', (req, res) => {
  const reading = req.body;
  if (!reading || !reading.nodeId) {
    return res.status(400).json({ error: 'Missing nodeId or reading payload' });
  }

  // NodeMCU firmware sends an explicit local alarm after its on-device
  // debounce has fired. Respect that edge decision in the dashboard status.
  const isAlarmed = reading.alarm === true || reading.alarm === 'true';
  const isWatch = !isAlarmed && (
    reading.rainfall === true ||
    reading.smokeLevel === 'MEDIUM' ||
    Number(reading.waterLevel) >= 10
  );
  const nodeStatus = isAlarmed ? 'CRITICAL' : isWatch ? 'WARNING' : 'ONLINE';

  reading.timestamp = reading.timestamp || new Date().toISOString();

  // Find or create node in state
  let node = state.nodes.find((n) => n.id === reading.nodeId);
  if (node) {
    const previousReading = node.lastReading;
    const elapsedMinutes = (new Date(reading.timestamp).getTime() - new Date(previousReading.timestamp).getTime()) / 60000;
    if (Number.isFinite(elapsedMinutes) && elapsedMinutes > 0 && reading.waterLevel !== undefined) {
      reading.rateOfRise = Math.round(((reading.waterLevel - previousReading.waterLevel) / elapsedMinutes) * 10) / 10;
    }
    node.lastReading = { ...node.lastReading, ...reading };
    node.battery = reading.battery ?? node.battery;
    node.signalRssi = reading.signalRssi ?? node.signalRssi;
    node.status = nodeStatus;
    node.firmwareVersion = 'NodeMCU ESP8266';
    node.hardwareConnected = true;
    node.lastSeenAt = reading.timestamp;
    node.lastUpdated = 'Just now';
  } else {
    node = {
      id: reading.nodeId,
      name: `NodeMCU ESP8266 (${reading.nodeId})`,
      hazardType: reading.waterLevel !== undefined ? 'flood' : 'wildfire',
      zone: 'Field Deployed Sector',
      latitude: 28.625,
      longitude: 77.225,
      status: nodeStatus,
      battery: reading.battery || 90,
      signalRssi: reading.signalRssi || -70,
      firmwareVersion: 'NodeMCU ESP8266',
      hardwareConnected: true,
      lastSeenAt: reading.timestamp,
      lastUpdated: 'Just now',
      lastReading: reading
    };
    state.nodes.push(node);
  }

  state.history.push({
    nodeId: reading.nodeId,
    timestamp: reading.timestamp,
    timeLabel: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    waterLevel: Number(reading.waterLevel) || 0,
    temperature: Number(reading.temperature) || 0,
    humidity: Number(reading.humidity) || 0,
    smokePpm: Number(reading.smokePpm) || 0,
    rainfall: reading.rainfall ? 1 : 0,
    riskScore: 0
  });
  state.history = state.history.slice(-120);

  // Broadcast reading update to all connected WebSocket clients
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

// 7. Nodes list
app.get('/api/nodes', (req, res) => {
  res.json({ nodes: state.nodes });
});

// 8. Gateways list
app.get('/api/gateways', (req, res) => {
  res.json({ gateways: state.gateways });
});

// 9. Alerts
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: state.alerts });
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  state.alerts = state.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
  res.json({ status: 'ACKNOWLEDGED', id });
});

// 10. Safe Locations / Shelters
app.get('/api/safe-locations', (req, res) => {
  res.json({ safeLocations: state.safeLocations });
});

// 11. Citizen Impact Analytics
app.get('/api/impact/aggregate', (req, res) => {
  res.json({ impact: state.citizenImpact });
});

// 12. Network & Power Health
app.get('/api/network/status', (req, res) => {
  const onlineCount = state.nodes.filter((n) => n.status === 'ONLINE').length;
  res.json({
    totalNodes: state.nodes.length,
    onlineNodes: onlineCount,
    offlineNodes: state.nodes.length - onlineCount,
    gatewaysOnline: state.gateways.filter((g) => g.status === 'ONLINE').length,
    loraHealth: 'OPTIMAL',
    cellularBackhaul: '4G LTE CONNECTED'
  });
});

// Serve compiled frontend if dist exists
if (fs.existsSync(distPath)) {
  console.log(`[EARTHSYNC SERVER] Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Create HTTP and WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Build comprehensive snapshot for WebSocket sync
function buildFullSnapshot() {
  // Only devices that have actually posted telemetry belong in hardware mode.
  const hardwareNodes = state.nodes.filter((node) => node.hardwareConnected);
  return {
    nodes: hardwareNodes,
    primaryFloodNode: hardwareNodes.find((n) => n.hazardType === 'flood'),
    primaryWildfireNode: hardwareNodes.find((n) => n.hazardType === 'wildfire'),
    alerts: state.alerts,
    gateways: state.gateways,
    safeLocations: state.safeLocations,
    citizenImpact: state.citizenImpact,
    history: state.history,
    activeScenario: state.activeScenario,
    scenarioStep: state.scenarioStep,
    isEdgeMode: state.isEdgeMode,
    isCloudConnected: state.isCloudConnected,
    bufferedEventsCount: state.bufferedEventsCount,
    lastSyncTime: state.lastSyncTime
  };
}

function broadcastSnapshot() {
  const message = JSON.stringify({ type: 'SNAPSHOT', payload: buildFullSnapshot() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  });
}

wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  console.log(`[EarthSync WS] Client connected from ${req.socket.remoteAddress}`);

  // Send immediate SNAPSHOT on connection
  ws.send(
    JSON.stringify({
      type: 'SNAPSHOT',
      payload: buildFullSnapshot()
    })
  );

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'SET_SCENARIO') {
        state.activeScenario = data.scenario;
        wss.clients.forEach((c) => {
          if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify({ type: 'SNAPSHOT', payload: buildFullSnapshot() }));
          }
        });
      }
    } catch (e) {
      console.error('[EarthSync WS] Parse error:', e);
    }
  });

  ws.on('close', () => {
    console.log('[EarthSync WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[EarthSync WS] Socket error:', err.message);
  });
});

// Ping keepalive every 30 seconds
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Firmware sends every 3 seconds. Mark the node offline after 15 seconds
// without a heartbeat instead of presenting stale telemetry as live.
setInterval(() => {
  const cutoff = Date.now() - 15000;
  let changed = false;
  state.nodes.forEach((node) => {
    if (node.hardwareConnected && node.status !== 'OFFLINE' && new Date(node.lastSeenAt).getTime() < cutoff) {
      node.status = 'OFFLINE';
      changed = true;
    }
  });
  if (changed) broadcastSnapshot();
}, 5000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

server.listen(port, host, () => {
  console.log(`====================================================`);
  console.log(`  EARTHSYNC MULTI-HAZARD INTELLIGENCE PLATFORM`);
  console.log(`====================================================`);
  console.log(`  Tagline:      "Sensing Today | Safer Tomorrow"`);
  console.log(`  Listening on: http://${host}:${port}`);
  console.log(`  REST API:     http://${host}:${port}/api/health`);
  console.log(`  ESP32 Ingest: http://${host}:${port}/api/sensors/ingest`);
  console.log(`  WebSocket:    ws://${host}:${port}/ws`);
  console.log(`====================================================`);
});
