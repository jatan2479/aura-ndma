import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState(null);

  useEffect(() => {
    // Determine backend host dynamically for multi-device physical phone testing
    const hostname = window.location.hostname || 'localhost';
    const serverUrl = `http://${hostname}:3001`;

    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    socketInstance.on('connect', () => {
      console.log(`[AURA-SOCKET] Connected to emergency server at ${serverUrl}`);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.warn('[AURA-SOCKET] Disconnected from server, falling back to local mesh/broadcast');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Initialize BroadcastChannel for multi-tab synchronization
    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('aura_ndma_realtime_mesh');
      setBroadcastChannel(bc);
    }

    return () => {
      socketInstance.disconnect();
      if (bc) {
        bc.close();
      }
    };
  }, []);

  const emitEvent = useCallback((event, data) => {
    // 1. Emit to Socket.IO backend if connected
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
    
    // 2. Also broadcast over BroadcastChannel for multi-tab / local network sync
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ event, data, timestamp: Date.now() });
      } catch (err) {
        console.warn('Broadcast channel message error:', err);
      }
    }
  }, [socket, broadcastChannel]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitEvent, broadcastChannel }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
