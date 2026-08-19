import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Serve static HTML/JS/CSS files from root and dist
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Central Real-Time Incident State
const state = {
  incidents: [],
  supplyRequests: [],
  deadHandAlerts: [],
  meshAlerts: [],
  acousticSignals: [],
  missingPersons: [
    {
      id: 'mp-1',
      name: 'Rohan Sharma',
      age: 14,
      gender: 'Male',
      lastSeenTime: '2 hours ago',
      lastKnownLocation: { lat: 28.6139, lng: 77.2090, address: 'Near Connaught Place, New Delhi' },
      description: 'Wearing blue jacket, navy jeans, black school backpack.',
      status: 'MISSING',
      reportedAt: '2026-08-19T18:30:00.000Z',
      photoUrl: null
    },
    {
      id: 'mp-2',
      name: 'Priya Patel',
      age: 68,
      gender: 'Female',
      lastSeenTime: '5 hours ago',
      lastKnownLocation: { lat: 28.6250, lng: 77.2200, address: 'Relief Camp Alpha, Pragati Maidan' },
      description: 'Speaks Gujarati/Hindi, green saree, medical bracelet.',
      status: 'AT_RELIEF_CAMP',
      campName: 'Central High School Camp',
      reportedAt: '2026-08-19T15:30:00.000Z',
      photoUrl: null
    }
  ],
  reliefCamps: [
    { 
      id: 'camp-1', 
      name: 'NDMA Central Command Camp Alpha', 
      lat: 28.6139, 
      lng: 77.2090, 
      address: 'Central Sports Complex, Sector 4',
      beds: 250, 
      availableBeds: 84,
      medical: true, 
      food: true, 
      water: true, 
      power: true,
      contact: '+91 11 2670 1700'
    },
    { 
      id: 'camp-2', 
      name: 'Pragati Maidan Emergency Relief Center', 
      lat: 28.6230, 
      lng: 77.2400, 
      address: 'Gate 4, Exhibition Ground',
      beds: 500, 
      availableBeds: 210,
      medical: true, 
      food: true, 
      water: true, 
      power: true,
      contact: '+91 11 2337 1800'
    },
    { 
      id: 'camp-3', 
      name: 'Yamuna Riverbank Flood Shelter 7', 
      lat: 28.6450, 
      lng: 77.2600, 
      address: 'Near Old Railway Bridge',
      beds: 120, 
      availableBeds: 18,
      medical: true, 
      food: true, 
      water: true, 
      power: false,
      contact: '+91 11 2250 9911'
    }
  ],
  broadcastAlerts: [
    {
      id: 'alert-1',
      title: 'NDMA FLASH FLOOD WARNING (SECTOR 4-9)',
      severity: 'CRITICAL',
      message: 'River discharge peaked. Immediate evacuation advisory active for low-lying sectors. Head to nearest marked Relief Camp.',
      timestamp: new Date().toISOString(),
      issuedBy: 'National Disaster Management Authority (HQ)'
    }
  ]
};

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'AURA-NDMA Server Operational',
    port: 3000,
    connectedNodes: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/state', (req, res) => {
  res.json(state);
});

// Socket.io Real-Time Dispatch Engine
io.on('connection', (socket) => {
  console.log(`[AURA-SOCKET] Device Node Connected: ${socket.id}`);

  // Send current synchronized state
  socket.emit('state_sync', state);
  socket.emit('state:sync', state);

  // 1. Citizen P2P / Offline Mesh SOS Dispatch
  socket.on('mesh_sos', (data) => {
    console.log(`[MESH SOS] Received from ${data.citizenName || 'Citizen'}:`, data);
    const incident = {
      id: `mesh-sos-${Date.now()}`,
      type: 'MESH_SOS',
      title: 'OFFLINE P2P MESH SOS',
      citizenName: data.citizenName || 'Mesh Citizen Node',
      phone: data.phone || 'N/A',
      lat: data.lat || 28.6139,
      lng: data.lng || 77.2090,
      accuracy: data.accuracy || 10,
      hopCount: data.hopCount || 1,
      meshProtocol: data.protocol || 'WebBluetooth/WebRTC',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      timestamp: new Date().toISOString(),
      ...data
    };
    state.meshAlerts.unshift(incident);
    state.incidents.unshift(incident);

    // Broadcast to Admin and all listening devices
    io.emit('mesh_sos', incident);
    io.emit('incident:new', incident);
    io.emit('state_sync', state);
  });

  // 2. Supply Request Dispatch
  socket.on('supply_request', (data) => {
    console.log(`[SUPPLY REQUEST] Received:`, data);
    const request = {
      id: `sup-${Date.now()}`,
      citizenName: data.citizenName || 'Citizen',
      phone: data.phone || 'N/A',
      items: data.items || ['Essential Rations'],
      peopleCount: data.peopleCount || 1,
      urgency: data.urgency || 'HIGH',
      notes: data.notes || '',
      lat: data.lat || 28.6139,
      lng: data.lng || 77.2090,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      ...data
    };
    state.supplyRequests.unshift(request);

    io.emit('supply_request', request);
    io.emit('supply:new', request);
    io.emit('state_sync', state);
  });

  // 3. Dead Hand Safety Alert Dispatch
  socket.on('dead_hand_alert', (data) => {
    console.log(`[DEAD HAND ALERT] CRITICAL UNRESPONSIVE:`, data);
    const alert = {
      id: `dh-${Date.now()}`,
      type: 'DEAD_HAND_EXPIRATION',
      title: `DEAD-HAND ALERT: ${data.citizenName || 'Citizen'} UNRESPONSIVE`,
      citizenName: data.citizenName || 'Monitored Citizen',
      phone: data.phone || 'N/A',
      lat: data.lat || 28.6139,
      lng: data.lng || 77.2090,
      durationSeconds: data.durationSeconds || 10,
      lastCheckinTime: data.lastCheckinTime || new Date().toISOString(),
      severity: 'CRITICAL',
      status: 'UNRESPONSIVE',
      timestamp: new Date().toISOString(),
      ...data
    };
    state.deadHandAlerts.unshift(alert);
    state.incidents.unshift(alert);

    io.emit('dead_hand_alert', alert);
    io.emit('deadhand:new', alert);
    io.emit('incident:new', alert);
    io.emit('state_sync', state);
  });

  // Standard aliases for maximum cross-client compatibility
  socket.on('sos:dispatch', (data) => {
    socket.emit('mesh_sos', data);
  });

  socket.on('supply:request', (data) => {
    socket.emit('supply_request', data);
  });

  socket.on('deadhand:alert', (data) => {
    socket.emit('dead_hand_alert', data);
  });

  socket.on('acoustic:signal', (data) => {
    const signal = {
      id: `ac-${Date.now()}`,
      frequency: data.frequency || 800,
      decodedPayload: data.decodedPayload || '800Hz SOS Peak',
      lat: data.lat || 28.6139,
      lng: data.lng || 77.2090,
      timestamp: new Date().toISOString()
    };
    state.acousticSignals.unshift(signal);
    io.emit('acoustic:new', signal);
    io.emit('acoustic_signal', signal);
    io.emit('state_sync', state);
  });

  socket.on('camp:checkin', ({ campId, citizenData }) => {
    const camp = state.reliefCamps.find(c => c.id === campId);
    if (camp && camp.availableBeds > 0) {
      camp.availableBeds -= 1;
    }
    io.emit('camp_updated', { campId, camp, citizenData, timestamp: new Date().toISOString() });
    io.emit('state_sync', state);
  });

  socket.on('admin:broadcast', (data) => {
    const alert = {
      id: `alert-${Date.now()}`,
      title: data.title || 'CRITICAL NDMA ADVISORY',
      severity: data.severity || 'CRITICAL',
      message: data.message,
      timestamp: new Date().toISOString(),
      issuedBy: data.issuedBy || 'Emergency Command Centre'
    };
    state.broadcastAlerts.unshift(alert);
    io.emit('broadcast:new', alert);
    io.emit('admin_broadcast', alert);
    io.emit('state_sync', state);
  });

  socket.on('disconnect', () => {
    console.log(`[AURA-SOCKET] Device Node Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================================`);
  console.log(`  AURA-NDMA Cross-Device WebSocket Server Running!`);
  console.log(`  Local Access: http://localhost:${PORT}`);
  console.log(`  Multi-Phone Network: http://0.0.0.0:${PORT}`);
  console.log(`========================================================\n`);
});
