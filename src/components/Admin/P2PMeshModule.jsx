import React from 'react';
import { Bluetooth, Radio, Navigation, Wifi } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import { useP2PMesh } from '../../hooks/useP2PMesh';
import { formatCoordinates } from '../../utils/geoUtils';

export default function P2PMeshModule() {
  const { p2pSignals, selectIncident } = useIncidents();
  const { isScanning, requestBluetoothDevice, connectedPeers, bluetoothSupported } = useP2PMesh();

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Bluetooth size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Peer-to-Peer (P2P) Mesh Network</h4>
            <p className="text-[11px] text-slate-400">Off-grid packets relayed via Web Bluetooth / WebRTC</p>
          </div>
        </div>

        <button
          onClick={requestBluetoothDevice}
          disabled={isScanning}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          <Radio size={13} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Scanning...' : 'Pair BLE Node'}
        </button>
      </div>

      {/* Connected Peers Status */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi size={14} className="text-blue-400" />
          <span>Active Mesh Nodes: <strong>{connectedPeers.length + 1}</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {bluetoothSupported ? 'Hardware Radio: READY' : 'Web Bluetooth: Standby'}
        </span>
      </div>

      {/* Relayed Signals Feed */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {p2pSignals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No P2P relayed mesh packets detected yet. Off-grid device signals will populate here.
          </div>
        ) : (
          p2pSignals.map((sig) => (
            <div
              key={sig.id}
              onClick={() => selectIncident(sig)}
              className="p-3 rounded-xl border border-blue-900/40 bg-slate-950 hover:bg-blue-950/30 hover:border-blue-500/50 cursor-pointer transition text-xs space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="font-bold text-white group-hover:text-blue-300 transition">
                    Relayed SOS Packet
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  {sig.hopCount || 1} Hop(s)
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{formatCoordinates(sig.lat, sig.lng)}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(sig.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Protocol: {sig.meshProtocol || 'WebRTC DataChannel'}</span>
                <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                  <Navigation size={10} /> Focus on Map
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
