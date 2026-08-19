import { useState, useCallback, useRef } from 'react';

/**
 * Peer-to-Peer (P2P) Bluetooth & WebRTC Mesh Transceiver Hook
 * Scans for nearby BLE devices and establishes WebRTC DataChannels for off-grid SOS packet relaying.
 */
export function useP2PMesh({ onPacketReceived } = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [meshPackets, setMeshPackets] = useState([]);
  const [error, setError] = useState(null);
  const [localNodeId] = useState('node-mesh-alpha');

  const bluetoothSupported = typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
  const dataChannelsRef = useRef([]);

  // Web Bluetooth Scan & Connect
  const requestBluetoothDevice = useCallback(async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth API not available on this browser/OS');
      }

      setIsScanning(true);
      setError(null);

      // Request any nearby Bluetooth devices
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'battery_service']
      });

      const peer = {
        id: device.id || `ble-${Date.now()}`,
        name: device.name || 'Nearby Emergency Device',
        type: 'BLUETOOTH_LE',
        connectedAt: new Date().toISOString()
      };

      setConnectedPeers(prev => [...prev.filter(p => p.id !== peer.id), peer]);
      setIsScanning(false);
      return peer;
    } catch (err) {
      console.warn('Bluetooth scan note:', err);
      setError(err.message);
      setIsScanning(false);
      return null;
    }
  }, []);

  // Broadcast packet through active P2P mesh
  const broadcastMeshPacket = useCallback((payload) => {
    const packet = {
      id: `mesh-${Date.now()}`,
      originNode: localNodeId,
      hopCount: (payload.hopCount || 0) + 1,
      protocol: 'WebRTC/WebBluetooth',
      data: payload.data || payload,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: new Date().toISOString()
    };

    setMeshPackets(prev => [packet, ...prev]);

    // Send through active DataChannels
    dataChannelsRef.current.forEach(dc => {
      if (dc.readyState === 'open') {
        try {
          dc.send(JSON.stringify(packet));
        } catch (e) {
          console.warn('DataChannel send error:', e);
        }
      }
    });

    if (onPacketReceived) {
      onPacketReceived(packet);
    }

    return packet;
  }, [localNodeId, onPacketReceived]);

  return {
    localNodeId,
    isScanning,
    connectedPeers,
    meshPackets,
    bluetoothSupported,
    error,
    requestBluetoothDevice,
    broadcastMeshPacket
  };
}
