import React from 'react';
import { Skull, Navigation } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import { formatCoordinates } from '../../utils/geoUtils';

export default function DeadHandMonitoringModule() {
  const { deadHandAlerts, selectIncident } = useIncidents();

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Skull size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Dead Hand Safety Monitoring Panel</h4>
            <p className="text-[11px] text-slate-400">Automated tracking for unresponsive field citizens</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          deadHandAlerts.length > 0
            ? 'bg-red-950/60 border-red-500/60 text-red-400 animate-pulse'
            : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-400'
        }`}>
          {deadHandAlerts.length} Flagged Unresponsive
        </div>
      </div>

      {/* Flagged Citizens Alerts Feed */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {deadHandAlerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            All registered dead-hand switch citizens are checking in safely. Expired timers will immediately trigger red priority alerts here.
          </div>
        ) : (
          deadHandAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => selectIncident(alert)}
              className="p-3.5 rounded-xl border border-red-500/60 bg-gradient-to-r from-red-950/60 via-slate-950 to-slate-950 hover:border-red-400 cursor-pointer transition text-xs space-y-2 group shadow-lg shadow-red-950/50"
            >
              {/* Alert Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-extrabold text-red-400 text-xs">
                    CRITICAL DEAD-MAN ALERT
                  </span>
                </div>
                <span className="text-[10px] text-red-300 font-bold px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40">
                  TIMER EXPIRED
                </span>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-2 gap-2 text-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Monitored Citizen</span>
                  <strong className="text-white">{alert.citizenName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Interval Mode</span>
                  <span className="text-amber-400 font-mono font-semibold">{alert.durationSeconds}s Test</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>{formatCoordinates(alert.lat, alert.lng)}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Pin Map Action */}
              <div className="flex items-center justify-between pt-1.5 border-t border-red-900/40 text-[11px]">
                <span className="text-red-400 font-semibold group-hover:underline flex items-center gap-1">
                  <Navigation size={12} /> Pinpoint Target Location on Map
                </span>
                <span className="text-[10px] text-slate-400">Phone: {alert.phone || 'N/A'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
