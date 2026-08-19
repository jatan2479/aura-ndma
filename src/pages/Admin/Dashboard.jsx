import React, { useState } from 'react';
import Navbar from '../../components/Common/Navbar';
import ThemeCustomizer from '../../theme/ThemeCustomizer';
import TacticalMap from '../../components/Map/TacticalMap';
import P2PMeshModule from '../../components/Admin/P2PMeshModule';
import AcousticReceiverModule from '../../components/Admin/AcousticReceiverModule';
import SupplyQueueModule from '../../components/Admin/SupplyQueueModule';
import QRScannerModule from '../../components/Admin/QRScannerModule';
import DeadHandMonitoringModule from '../../components/Admin/DeadHandMonitoringModule';
import BroadcastAlertModal from '../../components/Admin/BroadcastAlertModal';
import { useIncidents } from '../../contexts/IncidentContext';
import { ShieldAlert, Package, Tent, Skull, Send, Navigation } from 'lucide-react';
import { formatCoordinates } from '../../utils/geoUtils';

export default function AdminDashboard() {
  const {
    incidents,
    supplyRequests,
    deadHandAlerts,
    reliefCamps,
    acousticSignals,
    p2pSignals,
    selectedIncident,
    selectIncident
  } = useIncidents();

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const sosCount = incidents.filter(i => i.type === 'SOS_EMERGENCY').length;
  const criticalDeadHandCount = deadHandAlerts.length;
  const pendingSuppliesCount = supplyRequests.filter(s => s.status === 'PENDING').length;
  const totalCampBeds = reliefCamps.reduce((acc, c) => acc + c.availableBeds, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Tactical Universal Header */}
      <Navbar />

      {/* Floating Theme Customizer */}
      <ThemeCustomizer />

      {/* Command Centre Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        
        {/* Top Operational Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h2 className="text-xl font-black tracking-wide text-white">
                CENTRAL EMERGENCY COMMAND HEADQUARTERS
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              NDMA Operational Tactical Dashboard • Real-Time Multi-Sensor Telemetry
            </p>
          </div>

          {/* Broadcast Alert Push Button */}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-red-600/30 self-start md:self-auto"
          >
            <Send size={15} /> Issue Emergency Broadcast Alert
          </button>
        </div>

        {/* Tactical Key Metrics Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/40 to-slate-900 shadow-lg shadow-red-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">ACTIVE SOS DISTRESS</span>
              <ShieldAlert size={18} className="text-red-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">{sosCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Live Citizen Transmissions</p>
          </div>

          <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-lg shadow-amber-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">DEAD-HAND ALERTS</span>
              <Skull size={18} className="text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">{criticalDeadHandCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Unresponsive Switch Timers</p>
          </div>

          <div className="p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-slate-900 shadow-lg shadow-blue-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">SUPPLY REQUESTS</span>
              <Package size={18} className="text-blue-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">{pendingSuppliesCount}</div>
            <p className="text-[10px] text-slate-400 mt-1">Pending Field Deliveries</p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900 shadow-lg shadow-emerald-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">CAMP SHELTER BEDS</span>
              <Tent size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">{totalCampBeds}</div>
            <p className="text-[10px] text-slate-400 mt-1">Available across {reliefCamps.length} Camps</p>
          </div>
        </div>

        {/* Selected Incident Banner (Incident-Driven Focusing) */}
        {selectedIncident && (
          <div className="p-4 rounded-2xl bg-blue-950/60 border-2 border-blue-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 text-xs">
              <div className="p-2 rounded-xl bg-blue-600 text-white font-bold shrink-0">
                <Navigation size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  Target Focused on Operational Map: {selectedIncident.title || selectedIncident.name || selectedIncident.citizenName || 'Incident Target'}
                </h4>
                <p className="font-mono text-[11px] text-blue-300">
                  Target GPS: {formatCoordinates(selectedIncident.lat, selectedIncident.lng)} • Severity: {selectedIncident.severity || 'HIGH'}
                </p>
              </div>
            </div>

            <button
              onClick={() => selectIncident(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 self-start sm:self-auto"
            >
              Reset Map View
            </button>
          </div>
        )}

        {/* Main Central Operational Command Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              Leaflet Situational Awareness Grid
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Click any signal below to pin and fly to its exact GPS coordinates
            </span>
          </div>

          <TacticalMap
            incidents={incidents}
            supplyRequests={supplyRequests}
            deadHandAlerts={deadHandAlerts}
            reliefCamps={reliefCamps}
            acousticSignals={acousticSignals}
            p2pSignals={p2pSignals}
            selectedIncident={selectedIncident}
            onMarkerSelect={selectIncident}
            height="520px"
          />
        </div>

        {/* 6 Command Modules Multi-Pane Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Module 1: Peer-to-Peer (P2P) Bluetooth Mesh Module */}
          <P2PMeshModule />

          {/* Module 2: Acoustic & Torch Signals Module */}
          <AcousticReceiverModule />

          {/* Module 3: Supply Requests Queue */}
          <SupplyQueueModule />

          {/* Module 4: QR Emergency Code System Scanner */}
          <QRScannerModule />

          {/* Module 5: Dead Hand Safety System Monitoring Panel */}
          <div className="lg:col-span-2">
            <DeadHandMonitoringModule />
          </div>
        </div>

      </div>

      {/* Broadcast Alert Modal */}
      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
}
