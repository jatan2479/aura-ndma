/**
 * AURA-NDMA Client State & Real-Time Socket.io Relay Manager
 */

(function() {
  const serverUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
  let socket = null;

  // Initialize Socket.io connection if socket.io client is loaded
  if (typeof io !== 'undefined') {
    try {
      socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        console.log(`[AURA-CLIENT] Connected to real-time relay: ${serverUrl}`);
        const connDot = document.getElementById('conn-dot');
        const connLabel = document.getElementById('conn-label');
        if (connDot) connDot.className = 'status-dot live';
        if (connLabel) connLabel.textContent = 'SOCKET LIVE (3000)';
      });

      socket.on('disconnect', () => {
        console.warn('[AURA-CLIENT] Socket disconnected, falling back to local storage mesh');
        const connDot = document.getElementById('conn-dot');
        const connLabel = document.getElementById('conn-label');
        if (connDot) connDot.className = 'status-dot offline';
        if (connLabel) connLabel.textContent = 'OFFLINE MESH';
      });
    } catch (e) {
      console.warn('Socket.io connection initialization error:', e);
    }
  }

  window.AURA_STATE = {
    socket,
    incidents: [],
    supplyRequests: [],
    deadHandAlerts: [],
    meshAlerts: [],

    emit(event, data) {
      if (socket && socket.connected) {
        socket.emit(event, data);
      }
      // Also broadcast locally
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('aura_local_channel');
          bc.postMessage({ event, data });
          bc.close();
        } catch {}
      }
    },

    on(event, callback) {
      if (socket) {
        socket.on(event, callback);
      }
    },

    dispatchMeshSOS(payload) {
      const data = {
        citizenName: payload.citizenName || localStorage.getItem('aura_citizen_name') || 'Citizen Mesh Node',
        phone: payload.phone || localStorage.getItem('aura_citizen_phone') || 'N/A',
        lat: payload.lat || (window.AURA_GEO ? window.AURA_GEO.getCoords().lat : 28.6139),
        lng: payload.lng || (window.AURA_GEO ? window.AURA_GEO.getCoords().lng : 77.2090),
        accuracy: payload.accuracy || 10,
        protocol: 'WebBluetooth/WebRTC Mesh',
        hopCount: 1,
        timestamp: new Date().toISOString(),
        ...payload
      };
      this.emit('mesh_sos', data);
      return data;
    },

    dispatchSupplyRequest(payload) {
      const data = {
        citizenName: payload.citizenName || localStorage.getItem('aura_citizen_name') || 'Citizen',
        phone: payload.phone || localStorage.getItem('aura_citizen_phone') || 'N/A',
        items: payload.items || ['Essential Rations'],
        peopleCount: payload.peopleCount || 1,
        urgency: payload.urgency || 'HIGH',
        notes: payload.notes || '',
        lat: payload.lat || (window.AURA_GEO ? window.AURA_GEO.getCoords().lat : 28.6139),
        lng: payload.lng || (window.AURA_GEO ? window.AURA_GEO.getCoords().lng : 77.2090),
        timestamp: new Date().toISOString(),
        ...payload
      };
      this.emit('supply_request', data);
      return data;
    },

    dispatchDeadHandAlert(payload) {
      const data = {
        citizenName: payload.citizenName || localStorage.getItem('aura_citizen_name') || 'Monitored Citizen',
        phone: payload.phone || localStorage.getItem('aura_citizen_phone') || 'N/A',
        lat: payload.lat || (window.AURA_GEO ? window.AURA_GEO.getCoords().lat : 28.6139),
        lng: payload.lng || (window.AURA_GEO ? window.AURA_GEO.getCoords().lng : 77.2090),
        durationSeconds: payload.durationSeconds || 10,
        lastCheckinTime: payload.lastCheckinTime || new Date().toISOString(),
        timestamp: new Date().toISOString(),
        ...payload
      };
      this.emit('dead_hand_alert', data);
      return data;
    }
  };
})();
