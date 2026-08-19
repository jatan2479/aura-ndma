import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' })); // Allows Base64 photo uploads for missing persons

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-Memory Database Store for live emergency state
const state = {
  incidents: [],
  supplyRequests: [],
  deadHandAlerts: [],
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
      reportedAt: new Date(Date.now() - 7200000).toISOString(),
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
      reportedAt: new Date(Date.now() - 18000000).toISOString(),
      photoUrl: null
    }
  ],
  acousticSignals: [],
  p2pSignals: [],
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
  res.json({ status: 'AURA-NDMA Server Operational', timestamp: new Date().toISOString(), connectedNodes: io.engine.clientsCount });
});

app.get('/api/state', (req, res) => {
  res.json(state);
});

// Socket.IO Real-Time Engine
io.on('connection', (socket) => {
  console.log(`[AURA-NODE] Device connected: ${socket.id}`);

  // Send current state to newly connected device
  socket.emit('state:sync', state);

  // 1. Emergency SOS Dispatch
  socket.on('sos:dispatch', (payload) => {
    const incident = {
      id: `sos-${Date.now()}`,
      type: 'SOS_EMERGENCY',
      title: payload.title || 'EMERGENCY SOS DISTRESS',
      citizenName: payload.citizenName || 'Anonymous Citizen',
      phone: payload.phone || 'N/A',
      lat: payload.lat,
      lng: payload.lng,
      accuracy: payload.accuracy || null,
      battery: payload.battery || null,
      deviceInfo: payload.deviceInfo || null,
      severity: 'CRITICAL',
      status: 'ACTIVE',
      beaconActive: payload.beaconActive || false,
      timestamp: new Date().toISOString()
    };
    state.incidents.unshift(incident);
    io.emit('incident:new', incident);
    io.emit('state:sync', state);
    console.log(`[SOS] Received SOS at Lat: ${incident.lat}, Lng: ${incident.lng}`);
  });

  // 2. Supply Request Submission
  socket.on('supply:request', (payload) => {
    const request = {
      id: `sup-${Date.now()}`,
      citizenName: payload.citizenName || 'Citizen',
      phone: payload.phone || 'N/A',
      items: payload.items || [], // e.g. ['Clean Water', 'Medicines']
      itemCounts: payload.itemCounts || {},
      peopleCount: payload.peopleCount || 1,
      urgency: payload.urgency || 'HIGH',
      notes: payload.notes || '',
      lat: payload.lat,
      lng: payload.lng,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    state.supplyRequests.unshift(request);
    io.emit('supply:new', request);
    io.emit('state:sync', state);
    console.log(`[SUPPLY] New request from ${request.citizenName} for: ${request.items.join(', ')}`);
  });

  // Supply status update (Admin dispatch/delivered)
  socket.on('supply:update_status', ({ id, status }) => {
    const item = state.supplyRequests.find(r => r.id === id);
    if (item) {
      item.status = status;
      io.emit('supply:updated', item);
      io.emit('state:sync', state);
    }
  });

  // 3. Dead Hand Safety System Alert
  socket.on('deadhand:alert', (payload) => {
    const alert = {
      id: `dh-${Date.now()}`,
      type: 'DEAD_HAND_EXPIRATION',
      citizenName: payload.citizenName || 'Monitored Citizen',
      phone: payload.phone || 'N/A',
      lat: payload.lat,
      lng: payload.lng,
      lastCheckinTime: payload.lastCheckinTime || new Date().toISOString(),
      durationSeconds: payload.durationSeconds || 10,
      battery: payload.battery || null,
      severity: 'CRITICAL',
      status: 'UNRESPONSIVE',
      timestamp: new Date().toISOString()
    };
    state.deadHandAlerts.unshift(alert);
    state.incidents.unshift({
      ...alert,
      title: `DEAD-HAND ALERT: ${alert.citizenName} UNRESPONSIVE`
    });
    io.emit('deadhand:new', alert);
    io.emit('incident:new', alert);
    io.emit('state:sync', state);
    console.log(`[DEAD HAND] CRITICAL alert triggered for ${alert.citizenName}`);
  });

  // 4. Acoustic / Optical Distress Signal
  socket.on('acoustic:signal', (payload) => {
    const signal = {
      id: `ac-${Date.now()}`,
      frequency: payload.frequency || 800,
      decodedPayload: payload.decodedPayload || 'SOS_BEACON_DETECTED',
      lat: payload.lat,
      lng: payload.lng,
      detectedBy: payload.detectedBy || 'Acoustic Sensor Node',
      timestamp: new Date().toISOString()
    };
    state.acousticSignals.unshift(signal);
    io.emit('acoustic:new', signal);
    io.emit('state:sync', state);
    console.log(`[ACOUSTIC] 800Hz Signal captured: ${signal.decodedPayload}`);
  });

  // 5. Peer-to-Peer (P2P) Mesh Relay Signal
  socket.on('p2p:relay', (payload) => {
    const p2p = {
      id: `p2p-${Date.now()}`,
      originId: payload.originId || socket.id,
      hopCount: (payload.hopCount || 0) + 1,
      meshProtocol: payload.protocol || 'WebBluetooth/WebRTC',
      data: payload.data,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: new Date().toISOString()
    };
    state.p2pSignals.unshift(p2p);
    io.emit('p2p:new', p2p);
    io.emit('state:sync', state);
    console.log(`[P2P MESH] Packet relayed across ${p2p.hopCount} hop(s)`);
  });

  // 6. Missing Person Report
  socket.on('missing:report', (payload) => {
    const person = {
      id: `mp-${Date.now()}`,
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      lastSeenTime: payload.lastSeenTime || 'Just now',
      lastKnownLocation: {
        lat: payload.lat,
        lng: payload.lng,
        address: payload.address || 'Reported Location'
      },
      description: payload.description || '',
      status: 'MISSING',
      photoUrl: payload.photoUrl || null,
      reportedAt: new Date().toISOString(),
      contactNumber: payload.contactNumber || ''
    };
    state.missingPersons.unshift(person);
    io.emit('missing:new', person);
    io.emit('state:sync', state);
    console.log(`[MISSING PERSON] New report filed: ${person.name}`);
  });

  // Update Missing Person Status (e.g., Found at Relief Camp)
  socket.on('missing:update_status', ({ id, status, campName }) => {
    const person = state.missingPersons.find(p => p.id === id);
    if (person) {
      person.status = status;
      if (campName) person.campName = campName;
      io.emit('missing:updated', person);
      io.emit('state:sync', state);
    }
  });

  // 7. Relief Camp Check-in (via QR Code)
  socket.on('camp:checkin', (payload) => {
    const { campId, citizenData } = payload;
    const camp = state.reliefCamps.find(c => c.id === campId);
    if (camp && camp.availableBeds > 0) {
      camp.availableBeds = Math.max(0, camp.availableBeds - 1);
    }
    io.emit('camp:updated', { campId, camp, citizenData, timestamp: new Date().toISOString() });
    io.emit('state:sync', state);
    console.log(`[QR CHECKIN] Citizen ${citizenData?.name || 'Unknown'} checked into ${camp?.name}`);
  });

  // 8. Admin Push Broadcast Alert
  socket.on('admin:broadcast', (payload) => {
    const alert = {
      id: `alert-${Date.now()}`,
      title: payload.title || 'CRITICAL NDMA ADVISORY',
      severity: payload.severity || 'CRITICAL',
      message: payload.message,
      timestamp: new Date().toISOString(),
      issuedBy: payload.issuedBy || 'Emergency Command Centre'
    };
    state.broadcastAlerts.unshift(alert);
    io.emit('broadcast:new', alert);
    io.emit('state:sync', state);
    console.log(`[BROADCAST] Official Alert Issued: ${alert.title}`);
  });

  socket.on('disconnect', () => {
    console.log(`[AURA-NODE] Device disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  AURA-NDMA Real-Time Emergency Server Running!`);
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  LAN / Multi-Phone: http://0.0.0.0:${PORT}`);
  console.log(`======================================================\n`);
});
