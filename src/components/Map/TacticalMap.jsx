import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Package, Tent, Radio, Skull } from 'lucide-react';
import { formatCoordinates } from '../../utils/geoUtils';

// Fix Leaflet Default Icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Tactical SVG Markers Factory
const createCustomIcon = (type, color = '#EF4444') => {
  let iconSvg = '';
  if (type === 'SOS') {
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else if (type === 'DEAD_HAND') {
    iconSvg = `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else if (type === 'SUPPLY') {
    iconSvg = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  } else if (type === 'CAMP') {
    iconSvg = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20 10 4"/><path d="m5 20 9-16"/><path d="M3 20h18"/><path d="m12 15-3 5"/><path d="m12 15 3 5"/></svg>`;
  } else if (type === 'ACOUSTIC') {
    iconSvg = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>`;
  } else {
    iconSvg = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><circle cx="12" cy="12" r="8"/></svg>`;
  }

  return L.divIcon({
    className: 'custom-tactical-pin',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
        <div class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background-color: ${color};"></div>
        <div class="relative p-2 rounded-xl border shadow-xl bg-slate-900/90 border-slate-700" style="color: ${color};">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Map Viewport Controller for Incident-Driven Pinning
function MapViewController({ selectedIncident }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident && selectedIncident.lat && selectedIncident.lng) {
      map.flyTo([selectedIncident.lat, selectedIncident.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedIncident, map]);

  return null;
}

export default function TacticalMap({
  incidents = [],
  supplyRequests = [],
  deadHandAlerts = [],
  reliefCamps = [],
  acousticSignals = [],
  selectedIncident = null,
  onMarkerSelect = null,
  height = '520px'
}) {
  // Center default (New Delhi / NDMA Central Grid)
  const defaultCenter = [28.6139, 77.2090];
  const [activeLayers, setActiveLayers] = useState({
    sos: true,
    deadhand: true,
    supplies: true,
    camps: true,
    acoustic: true
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
      
      {/* Top Map Tactical Status Bar */}
      <div className="absolute top-3 left-3 z-400 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-200 tracking-wide">TACTICAL COMMAND MAP</span>
        </div>
        <div className="h-4 w-px bg-slate-700"></div>
        <span className="text-[11px] text-slate-400 font-mono">ADMIN PRIVACY: ACTIVE</span>
      </div>

      {/* Layer Visibility Toggles */}
      <div className="absolute top-3 right-3 z-400 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl flex items-center gap-1 shadow-lg text-[11px]">
        <button
          onClick={() => toggleLayer('sos')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            activeLayers.sos ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle SOS Distress Layer"
        >
          <ShieldAlert size={12} /> SOS ({incidents.filter(i => i.type === 'SOS_EMERGENCY').length})
        </button>

        <button
          onClick={() => toggleLayer('deadhand')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            activeLayers.deadhand ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40' : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Dead Hand Alerts Layer"
        >
          <Skull size={12} /> Dead-Hand ({deadHandAlerts.length})
        </button>

        <button
          onClick={() => toggleLayer('supplies')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            activeLayers.supplies ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Supply Requests Layer"
        >
          <Package size={12} /> Supplies ({supplyRequests.length})
        </button>

        <button
          onClick={() => toggleLayer('camps')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
            activeLayers.camps ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle Relief Camps Layer"
        >
          <Tent size={12} /> Camps ({reliefCamps.length})
        </button>
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: height, width: '100%', backgroundColor: '#0B1120' }}
        attributionControl={false}
      >
        {/* Dark Tactical Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Viewport controller for incident-driven flyTo centering */}
        <MapViewController selectedIncident={selectedIncident} />

        {/* 1. SOS Emergency Markers */}
        {activeLayers.sos && incidents
          .filter(i => i.type === 'SOS_EMERGENCY' && i.lat && i.lng)
          .map((inc) => (
            <React.Fragment key={inc.id}>
              <Marker
                position={[inc.lat, inc.lng]}
                icon={createCustomIcon('SOS', '#EF4444')}
                eventHandlers={{
                  click: () => onMarkerSelect && onMarkerSelect(inc)
                }}
              >
                <Popup className="tactical-popup">
                  <div className="p-2 text-slate-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-600 text-sm">
                      <ShieldAlert size={16} /> EMERGENCY SOS
                    </div>
                    <p className="text-xs font-semibold">{inc.citizenName || 'Citizen in Distress'}</p>
                    <p className="text-[11px] font-mono text-slate-600">{formatCoordinates(inc.lat, inc.lng)}</p>
                    <p className="text-[10px] text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</p>
                    {inc.battery && <p className="text-[10px] text-slate-700">Battery: {inc.battery}%</p>}
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[inc.lat, inc.lng]}
                radius={inc.accuracy || 80}
                pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.15 }}
              />
            </React.Fragment>
          ))}

        {/* 2. Dead Hand Safety Alert Markers */}
        {activeLayers.deadhand && deadHandAlerts
          .filter(dh => dh.lat && dh.lng)
          .map((dh) => (
            <React.Fragment key={dh.id}>
              <Marker
                position={[dh.lat, dh.lng]}
                icon={createCustomIcon('DEAD_HAND', '#F59E0B')}
                eventHandlers={{
                  click: () => onMarkerSelect && onMarkerSelect(dh)
                }}
              >
                <Popup className="tactical-popup">
                  <div className="p-2 text-slate-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 text-sm">
                      <Skull size={16} /> DEAD-HAND TRIGGERED
                    </div>
                    <p className="text-xs font-semibold">{dh.citizenName || 'Monitored Citizen'}</p>
                    <p className="text-[11px] text-red-600 font-bold">Check-in Missed / Unresponsive</p>
                    <p className="text-[11px] font-mono text-slate-600">{formatCoordinates(dh.lat, dh.lng)}</p>
                    <p className="text-[10px] text-slate-500">Alerted: {new Date(dh.timestamp).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[dh.lat, dh.lng]}
                radius={120}
                pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.2 }}
              />
            </React.Fragment>
          ))}

        {/* 3. Supply Requests Markers */}
        {activeLayers.supplies && supplyRequests
          .filter(sup => sup.lat && sup.lng)
          .map((sup) => (
            <Marker
              key={sup.id}
              position={[sup.lat, sup.lng]}
              icon={createCustomIcon('SUPPLY', '#3B82F6')}
              eventHandlers={{
                click: () => onMarkerSelect && onMarkerSelect(sup)
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2 text-slate-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 text-sm">
                    <Package size={16} /> SUPPLY DROP REQUEST
                  </div>
                  <p className="text-xs font-semibold">Requester: {sup.citizenName || 'Citizen'}</p>
                  <p className="text-xs text-slate-800">
                    <strong>Items:</strong> {Array.isArray(sup.items) ? sup.items.join(', ') : 'Supplies'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">{formatCoordinates(sup.lat, sup.lng)}</p>
                  <p className="text-[10px] text-slate-500">People: {sup.peopleCount || 1} • Status: {sup.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. Relief Camp Centres Markers */}
        {activeLayers.camps && reliefCamps
          .filter(c => c.lat && c.lng)
          .map((camp) => (
            <Marker
              key={camp.id}
              position={[camp.lat, camp.lng]}
              icon={createCustomIcon('CAMP', '#10B981')}
              eventHandlers={{
                click: () => onMarkerSelect && onMarkerSelect(camp)
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2 text-slate-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                    <Tent size={16} /> {camp.name}
                  </div>
                  <p className="text-xs text-slate-700">{camp.address}</p>
                  <div className="text-[11px] space-y-0.5 pt-1">
                    <p className="font-semibold text-emerald-700">Available Beds: {camp.availableBeds} / {camp.beds}</p>
                    <p className="text-slate-600">Medical: {camp.medical ? '✓ Present' : '✗ None'} • Food: {camp.food ? '✓ Available' : '✗'}</p>
                    <p className="text-slate-600">Contact: {camp.contact}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 5. Acoustic Signals Markers */}
        {activeLayers.acoustic && acousticSignals
          .filter(a => a.lat && a.lng)
          .map((ac) => (
            <Marker
              key={ac.id}
              position={[ac.lat, ac.lng]}
              icon={createCustomIcon('ACOUSTIC', '#A855F7')}
              eventHandlers={{
                click: () => onMarkerSelect && onMarkerSelect(ac)
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-2 text-slate-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-600 text-sm">
                    <Radio size={16} /> ACOUSTIC DISTRESS CAPTURE
                  </div>
                  <p className="text-xs">{ac.decodedPayload || '800 Hz Tone Spike'}</p>
                  <p className="text-[11px] font-mono text-slate-600">{formatCoordinates(ac.lat, ac.lng)}</p>
                  <p className="text-[10px] text-slate-500">Detected: {new Date(ac.timestamp).toLocaleTimeString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
