import React, { useState } from 'react';
import { Skull, ShieldCheck, Play, Square } from 'lucide-react';
import { useDeadHand } from '../../hooks/useDeadHand';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useIncidents } from '../../contexts/IncidentContext';

export default function DeadHandCitizen() {
  const { lat, lng, refreshPosition, accuracy } = useGeolocation();
  const { triggerDeadHand } = useIncidents();

  const [citizenName, setCitizenName] = useState(() => localStorage.getItem('aura_citizen_name') || 'Citizen');
  const [selectedDuration, setSelectedDuration] = useState(10); // Default to 10s for fast SIH testing

  const {
    isActive,
    isTriggered,
    timeLeft,
    durationSeconds,
    screenStrobe,
    startMonitoring,
    stopMonitoring,
    checkIn
  } = useDeadHand({
    onCriticalTrigger: (payload) => {
      // Force GPS capture on trigger
      refreshPosition();

      // Dispatch critical dead-hand alert to Admin Command Dashboard
      triggerDeadHand({
        citizenName: citizenName || 'Monitored Citizen',
        phone: localStorage.getItem('aura_citizen_phone') || 'N/A',
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        accuracy: accuracy || 10,
        lastCheckinTime: payload.lastCheckinTime,
        durationSeconds: payload.durationSeconds,
        battery: 84
      });
    }
  });

  const progressPercent = Math.max(0, (timeLeft / durationSeconds) * 100);
  const isWarningZone = isActive && timeLeft <= Math.max(3, durationSeconds * 0.3);

  return (
    <div className={`rounded-2xl border p-6 shadow-2xl transition-all duration-300 relative overflow-hidden ${
      isTriggered 
        ? 'border-red-500 bg-red-950/80 animate-pulse' 
        : isWarningZone 
          ? 'border-amber-500 bg-amber-950/40' 
          : 'border-slate-700 bg-slate-900/90'
    }`}>
      
      {/* Full Screen Optical Strobe when triggered */}
      {screenStrobe && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none opacity-85 transition-opacity" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isTriggered 
              ? 'bg-red-600 text-white border-red-400 animate-bounce' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            <Skull size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">Dead Hand Safety Switch</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                Hardware Link
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Auto-activates camera strobe, audio siren, and critical SOS if check-in is missed
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          isTriggered
            ? 'bg-red-600 text-white border-red-400 animate-ping'
            : isActive
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {isTriggered ? 'CRITICAL TRIGGERED' : isActive ? 'ARMED & MONITORING' : 'DISARMED'}
        </div>
      </div>

      {/* Main Interactive Display */}
      <div className="py-6 flex flex-col items-center text-center space-y-5">
        
        {!isActive && !isTriggered ? (
          /* Disarmed Setup State */
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 text-left">Your Monitored Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 text-left">Check-in Interval</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: '10s (Test Demo)', val: 10 },
                  { label: '60s (1 Min)', val: 60 },
                  { label: '1 Hr (Field)', val: 3600 }
                ].map((option) => (
                  <button
                    key={option.val}
                    type="button"
                    onClick={() => setSelectedDuration(option.val)}
                    className={`py-2 rounded-xl border text-center font-semibold transition ${
                      selectedDuration === option.val
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => startMonitoring(selectedDuration)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
            >
              <Play size={16} /> Arm Dead-Man's Switch ({selectedDuration}s)
            </button>
          </div>
        ) : (
          /* Armed / Active State */
          <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
            
            {/* Circular Progress Ring */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-1000 ${
                    isTriggered 
                      ? 'stroke-red-500' 
                      : isWarningZone 
                        ? 'stroke-amber-400' 
                        : 'stroke-emerald-400'
                  }`}
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-4xl font-black font-mono tracking-tighter ${
                  isTriggered ? 'text-red-400' : isWarningZone ? 'text-amber-400 animate-pulse' : 'text-white'
                }`}>
                  {timeLeft}s
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  {isTriggered ? 'EXPIRED' : 'REMAINING'}
                </span>
              </div>
            </div>

            {/* Tap to Check In Button */}
            {!isTriggered ? (
              <button
                onClick={checkIn}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-base transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={22} /> I AM SAFE (TAP TO RESET)
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl bg-red-900/60 border border-red-500 text-center space-y-2">
                <p className="font-extrabold text-sm text-red-300">
                  CRITICAL ALARM ACTIVE
                </p>
                <p className="text-[11px] text-slate-200">
                  LED Flash Strobing • Audio Siren Blaring • GPS Sent to Admin
                </p>
                <button
                  onClick={checkIn}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-red-400 text-xs font-bold text-white transition"
                >
                  DEACTIVATE ALARM & REPORT SAFE
                </button>
              </div>
            )}

            {/* Disarm Switch */}
            <button
              onClick={stopMonitoring}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 pt-2"
            >
              <Square size={13} /> Disarm Dead Hand System
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
