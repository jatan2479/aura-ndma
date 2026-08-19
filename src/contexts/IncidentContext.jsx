import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';

const INITIAL_MISSING_PERSONS = [
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
];

const INITIAL_RELIEF_CAMPS = [
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
];

const INITIAL_BROADCAST_ALERTS = [
  {
    id: 'alert-1',
    title: 'NDMA FLASH FLOOD WARNING (SECTOR 4-9)',
    severity: 'CRITICAL',
    message: 'River discharge peaked. Immediate evacuation advisory active for low-lying sectors. Head to nearest marked Relief Camp.',
    timestamp: '2026-08-19T20:00:00.000Z',
    issuedBy: 'National Disaster Management Authority (HQ)'
  }
];

const IncidentContext = createContext(null);

export const IncidentProvider = ({ children }) => {
  const { socket, emitEvent, broadcastChannel } = useSocket();

  const [incidents, setIncidents] = useState([]);
  const [deadHandAlerts, setDeadHandAlerts] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [missingPersons, setMissingPersons] = useState(INITIAL_MISSING_PERSONS);
  const [acousticSignals, setAcousticSignals] = useState([]);
  const [p2pSignals, setP2pSignals] = useState([]);
  const [reliefCamps, setReliefCamps] = useState(INITIAL_RELIEF_CAMPS);
  const [broadcastAlerts, setBroadcastAlerts] = useState(INITIAL_BROADCAST_ALERTS);

  // Selected incident for tactical map pinning and focusing
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Sync state from server on connection
  useEffect(() => {
    if (!socket) return;

    socket.on('state:sync', (serverState) => {
      if (serverState.incidents) setIncidents(serverState.incidents);
      if (serverState.supplyRequests) setSupplyRequests(serverState.supplyRequests);
      if (serverState.deadHandAlerts) setDeadHandAlerts(serverState.deadHandAlerts);
      if (serverState.missingPersons) setMissingPersons(serverState.missingPersons);
      if (serverState.acousticSignals) setAcousticSignals(serverState.acousticSignals);
      if (serverState.p2pSignals) setP2pSignals(serverState.p2pSignals);
      if (serverState.reliefCamps) setReliefCamps(serverState.reliefCamps);
      if (serverState.broadcastAlerts) setBroadcastAlerts(serverState.broadcastAlerts);
    });

    socket.on('incident:new', (inc) => {
      setIncidents(prev => [inc, ...prev.filter(i => i.id !== inc.id)]);
    });

    socket.on('supply:new', (req) => {
      setSupplyRequests(prev => [req, ...prev.filter(r => r.id !== req.id)]);
    });

    socket.on('supply:updated', (updatedReq) => {
      setSupplyRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
    });

    socket.on('deadhand:new', (dh) => {
      setDeadHandAlerts(prev => [dh, ...prev.filter(d => d.id !== dh.id)]);
    });

    socket.on('acoustic:new', (ac) => {
      setAcousticSignals(prev => [ac, ...prev.filter(a => a.id !== ac.id)]);
    });

    socket.on('p2p:new', (p2p) => {
      setP2pSignals(prev => [p2p, ...prev.filter(p => p.id !== p2p.id)]);
    });

    socket.on('missing:new', (mp) => {
      setMissingPersons(prev => [mp, ...prev.filter(p => p.id !== mp.id)]);
    });

    socket.on('missing:updated', (mp) => {
      setMissingPersons(prev => prev.map(p => p.id === mp.id ? mp : p));
    });

    socket.on('camp:updated', ({ campId, camp }) => {
      if (camp) {
        setReliefCamps(prev => prev.map(c => c.id === campId ? camp : c));
      }
    });

    socket.on('broadcast:new', (alert) => {
      setBroadcastAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socket.off('state:sync');
      socket.off('incident:new');
      socket.off('supply:new');
      socket.off('supply:updated');
      socket.off('deadhand:new');
      socket.off('acoustic:new');
      socket.off('p2p:new');
      socket.off('missing:new');
      socket.off('missing:updated');
      socket.off('camp:updated');
      socket.off('broadcast:new');
    };
  }, [socket]);

  // Multi-tab BroadcastChannel listener fallback
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleBroadcastMessage = (event) => {
      const { event: evtName, data } = event.data || {};
      if (!evtName || !data) return;

      if (evtName === 'sos:dispatch') {
        const item = { ...data, id: `sos-${Date.now()}`, type: 'SOS_EMERGENCY', timestamp: new Date().toISOString() };
        setIncidents(prev => [item, ...prev]);
      } else if (evtName === 'supply:request') {
        const item = { ...data, id: `sup-${Date.now()}`, status: 'PENDING', timestamp: new Date().toISOString() };
        setSupplyRequests(prev => [item, ...prev]);
      } else if (evtName === 'deadhand:alert') {
        const item = { ...data, id: `dh-${Date.now()}`, type: 'DEAD_HAND_EXPIRATION', timestamp: new Date().toISOString() };
        setDeadHandAlerts(prev => [item, ...prev]);
        setIncidents(prev => [item, ...prev]);
      } else if (evtName === 'acoustic:signal') {
        const item = { ...data, id: `ac-${Date.now()}`, timestamp: new Date().toISOString() };
        setAcousticSignals(prev => [item, ...prev]);
      } else if (evtName === 'p2p:relay') {
        const item = { ...data, id: `p2p-${Date.now()}`, timestamp: new Date().toISOString() };
        setP2pSignals(prev => [item, ...prev]);
      } else if (evtName === 'missing:report') {
        const item = { ...data, id: `mp-${Date.now()}`, status: 'MISSING', reportedAt: new Date().toISOString() };
        setMissingPersons(prev => [item, ...prev]);
      } else if (evtName === 'admin:broadcast') {
        const item = { ...data, id: `alert-${Date.now()}`, timestamp: new Date().toISOString() };
        setBroadcastAlerts(prev => [item, ...prev]);
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcastMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    };
  }, [broadcastChannel]);

  // Actions
  const dispatchSOS = useCallback((sosData) => {
    const item = {
      id: `sos-${Date.now()}`,
      type: 'SOS_EMERGENCY',
      title: 'EMERGENCY SOS DISTRESS',
      ...sosData,
      timestamp: new Date().toISOString()
    };
    setIncidents(prev => [item, ...prev]);
    emitEvent('sos:dispatch', item);
    return item;
  }, [emitEvent]);

  const requestSupplies = useCallback((requestData) => {
    const item = {
      id: `sup-${Date.now()}`,
      status: 'PENDING',
      ...requestData,
      timestamp: new Date().toISOString()
    };
    setSupplyRequests(prev => [item, ...prev]);
    emitEvent('supply:request', item);
    return item;
  }, [emitEvent]);

  const updateSupplyStatus = useCallback((id, status) => {
    setSupplyRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    emitEvent('supply:update_status', { id, status });
  }, [emitEvent]);

  const triggerDeadHand = useCallback((dhData) => {
    const item = {
      id: `dh-${Date.now()}`,
      type: 'DEAD_HAND_EXPIRATION',
      title: `DEAD-HAND ALERT: ${dhData.citizenName || 'Citizen'} UNRESPONSIVE`,
      ...dhData,
      timestamp: new Date().toISOString()
    };
    setDeadHandAlerts(prev => [item, ...prev]);
    setIncidents(prev => [item, ...prev]);
    emitEvent('deadhand:alert', item);
    return item;
  }, [emitEvent]);

  const sendAcousticSignal = useCallback((signalData) => {
    const item = {
      id: `ac-${Date.now()}`,
      ...signalData,
      timestamp: new Date().toISOString()
    };
    setAcousticSignals(prev => [item, ...prev]);
    emitEvent('acoustic:signal', item);
    return item;
  }, [emitEvent]);

  const sendP2PRelay = useCallback((p2pData) => {
    const item = {
      id: `p2p-${Date.now()}`,
      ...p2pData,
      timestamp: new Date().toISOString()
    };
    setP2pSignals(prev => [item, ...prev]);
    emitEvent('p2p:relay', item);
    return item;
  }, [emitEvent]);

  const reportMissingPerson = useCallback((personData) => {
    const item = {
      id: `mp-${Date.now()}`,
      status: 'MISSING',
      reportedAt: new Date().toISOString(),
      ...personData
    };
    setMissingPersons(prev => [item, ...prev]);
    emitEvent('missing:report', item);
    return item;
  }, [emitEvent]);

  const updateMissingPersonStatus = useCallback((id, status, campName) => {
    setMissingPersons(prev => prev.map(p => p.id === id ? { ...p, status, campName: campName || p.campName } : p));
    emitEvent('missing:update_status', { id, status, campName });
  }, [emitEvent]);

  const checkinCamp = useCallback((campId, citizenData) => {
    setReliefCamps(prev => prev.map(c => {
      if (c.id === campId && c.availableBeds > 0) {
        return { ...c, availableBeds: c.availableBeds - 1 };
      }
      return c;
    }));
    emitEvent('camp:checkin', { campId, citizenData });
  }, [emitEvent]);

  const broadcastOfficialAlert = useCallback((alertData) => {
    const item = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...alertData
    };
    setBroadcastAlerts(prev => [item, ...prev]);
    emitEvent('admin:broadcast', item);
    return item;
  }, [emitEvent]);

  const selectIncident = useCallback((incident) => {
    setSelectedIncident(incident);
  }, []);

  return (
    <IncidentContext.Provider value={{
      incidents,
      deadHandAlerts,
      supplyRequests,
      missingPersons,
      acousticSignals,
      p2pSignals,
      reliefCamps,
      broadcastAlerts,
      selectedIncident,
      selectIncident,
      dispatchSOS,
      requestSupplies,
      updateSupplyStatus,
      triggerDeadHand,
      sendAcousticSignal,
      sendP2PRelay,
      reportMissingPerson,
      updateMissingPersonStatus,
      checkinCamp,
      broadcastOfficialAlert
    }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
