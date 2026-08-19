import React from 'react';
import { Radio, PhoneCall, ShieldAlert } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';

const EMERGENCY_HELPLINES = [
  { name: 'National Emergency', number: '112', badge: 'All Emergencies' },
  { name: 'NDMA Control Room', number: '1078', badge: 'Disaster HQ' },
  { name: 'NDRF Rescue Squad', number: '1070', badge: 'Tactical Rescue' },
  { name: 'Ambulance Emergency', number: '108', badge: 'Medical' },
  { name: 'Fire Control Centre', number: '101', badge: 'Fire & Hazard' },
  { name: 'Women Helpline', number: '1091', badge: 'Safety' },
];

export default function DisasterAlerts() {
  const { broadcastAlerts } = useIncidents();

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Radio size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Disaster News & Location-Based Alerts</h3>
            <p className="text-xs text-slate-400">Live meteorological warnings and official government evacuation advisories</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-700/60 text-xs font-bold text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          LIVE FEED
        </div>
      </div>

      {/* Broadcast Feed Alerts */}
      <div className="space-y-3">
        {broadcastAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/50 to-slate-950 text-xs space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert size={16} />
                <span>{alert.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed">{alert.message}</p>

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span>Source: {alert.issuedBy}</span>
              <span className="text-amber-400 font-semibold uppercase">{alert.severity} ADVISORY</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Helpline Speed-Dial Cards */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <PhoneCall size={14} className="text-blue-400" /> Emergency Speed-Dial Network
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {EMERGENCY_HELPLINES.map((hl) => (
            <a
              key={hl.number}
              href={`tel:${hl.number}`}
              className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-slate-700 transition text-center space-y-1 block group"
            >
              <div className="font-extrabold text-base text-white group-hover:text-blue-400 font-mono">
                {hl.number}
              </div>
              <div className="text-[11px] font-semibold text-slate-300 truncate">{hl.name}</div>
              <div className="text-[9px] text-slate-500">{hl.badge}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
