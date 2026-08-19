import React, { useState } from 'react';
import { ShieldAlert, Radio, Volume2, VolumeX, CheckCircle, Navigation } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useTorch } from '../../hooks/useTorch';
import { useAudioSiren } from '../../hooks/useAudioSiren';
import { useIncidents } from '../../contexts/IncidentContext';
import { formatCoordinates } from '../../utils/geoUtils';

export default function EmergencySOS() {
  const [isDispatched, setIsDispatched] = useState(false);
  const [citizenName, setCitizenName] = useState(() => localStorage.getItem('aura_citizen_name') || '');
  const [citizenPhone, setCitizenPhone] = useState(() => localStorage.getItem('aura_citizen_phone') || '');
  const [beaconActive, setBeaconActive] = useState(false);

  const { lat, lng, accuracy, refreshPosition, loading: gpsLoading } = useGeolocation();
  const { startStrobe, stopStrobe, screenStrobe } = useTorch();
  const { startSiren, stopSiren } = useAudioSiren();
  const { dispatchSOS } = useIncidents();

  const handleTriggerSOS = async () => {
    // 1. Force GPS refresh to get latest coordinate
    refreshPosition();

    // 2. Query Battery level if supported
    let batteryLevel = null;
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      try {
        const b = await navigator.getBattery();
        batteryLevel = Math.round(b.level * 100);
      } catch {}
    }

    // 3. Dispatch payload
    const sosPayload = {
      citizenName: citizenName || 'Citizen in Distress',
      phone: citizenPhone || 'N/A',
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      accuracy: accuracy || 10,
      battery: batteryLevel,
      deviceInfo: `${navigator.platform || 'Mobile'} • ${navigator.userAgent.substring(0, 30)}`,
      beaconActive: true
    };

    dispatchSOS(sosPayload);
    setIsDispatched(true);

    // Save profile for reuse
    if (citizenName) localStorage.setItem('aura_citizen_name', citizenName);
    if (citizenPhone) localStorage.setItem('aura_citizen_phone', citizenPhone);

    // 4. Activate hardware beacon (strobe + siren)
    setBeaconActive(true);
    startStrobe(250);
    startSiren();
  };

  const handleCancelSOS = () => {
    setIsDispatched(false);
    setBeaconActive(false);
    stopStrobe();
    stopSiren();
  };

  const toggleHardwareBeacon = () => {
    if (beaconActive) {
      setBeaconActive(false);
      stopStrobe();
      stopSiren();
    } else {
      setBeaconActive(true);
      startStrobe(250);
      startSiren();
    }
  };

  return (
    <div className="relative rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-900 p-6 shadow-2xl overflow-hidden">
      
      {/* Full screen optical strobe fallback when active */}
      {screenStrobe && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none opacity-85 transition-opacity" />
      )}

      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center text-center space-y-5">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
            <Radio size={14} className="animate-pulse text-red-500" />
            Instant Distress Dispatch
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">EMERGENCY SOS</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Dispatches live GPS coordinates and broadcasts a high-priority distress alert to the Admin Command Centre.
          </p>
        </div>

        {/* Live GPS Telemetry Readout */}
        <div className="w-full max-w-sm p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Navigation size={14} className={`text-red-400 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[11px]">
              {lat && lng ? formatCoordinates(lat, lng) : 'Acquiring high-accuracy GPS...'}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            ±{accuracy ? `${Math.round(accuracy)}m` : '--'}
          </span>
        </div>

        {/* Name / Phone quick input */}
        {!isDispatched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm text-left text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-red-500 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-red-500 text-xs"
              />
            </div>
          </div>
        )}

        {/* Big Impact SOS Trigger Button */}
        {!isDispatched ? (
          <button
            onClick={handleTriggerSOS}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-black text-2xl sm:text-3xl tracking-widest shadow-2xl shadow-red-600/60 border-4 border-red-400/40 flex flex-col items-center justify-center gap-2 transform active:scale-95 transition-all duration-200 animate-aura-pulse cursor-pointer"
            aria-label="Trigger Emergency SOS"
          >
            <ShieldAlert size={54} className="drop-shadow-lg" />
            <span>SOS</span>
            <span className="text-[10px] font-semibold tracking-normal text-red-100 opacity-90">TAP FOR HELP</span>
          </button>
        ) : (
          /* Dispatched Active State */
          <div className="w-full max-w-sm space-y-4 p-5 rounded-2xl bg-red-950/60 border-2 border-red-500 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
              <CheckCircle size={18} className="text-red-400 animate-pulse" />
              DISTRESS PACKET TRANSMITTED!
            </div>
            <p className="text-xs text-slate-300">
              Admin Command Centre is notified of your location. Keep your device powered on.
            </p>

            {/* Hardware Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={toggleHardwareBeacon}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                  beaconActive 
                    ? 'bg-amber-600 text-white border-amber-400 animate-pulse' 
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {beaconActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {beaconActive ? 'Beacon Active (Siren+Flash)' : 'Resume Siren & Flash'}
              </button>
            </div>

            <button
              onClick={handleCancelSOS}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
            >
              Cancel Distress Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
