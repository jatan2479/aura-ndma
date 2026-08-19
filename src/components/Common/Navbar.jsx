import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Users, Navigation, Wifi, WifiOff, Palette } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { formatCoordinates } from '../../utils/geoUtils';

export default function Navbar({ onOpenThemeCustomizer }) {
  const location = useLocation();
  const { isConnected } = useSocket();
  const { lat, lng, loading: gpsLoading } = useGeolocation();

  const isCitizen = location.pathname.startsWith('/citizen');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="w-full border-b border-slate-700/60 sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-lg shadow-blue-600/20">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">AURA-NDMA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                SIH'26
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight hidden sm:block">National Disaster Management Grid</p>
          </div>
        </Link>

        {/* Live GPS & Network Telemetry Badges */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live GPS Hardware Telemetry */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Navigation size={13} className={`text-emerald-400 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span className="font-mono text-[11px]">
              {lat && lng ? formatCoordinates(lat, lng) : 'Acquiring GPS...'}
            </span>
          </div>

          {/* Real-Time Cross-Device Mesh Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isConnected 
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-700/60 text-amber-300'
          }`}>
            {isConnected ? <Wifi size={13} className="text-emerald-400" /> : <WifiOff size={13} className="text-amber-400" />}
            <span className="text-[11px]">{isConnected ? 'LIVE MESH (3001)' : 'LOCAL RELAY'}</span>
          </div>
        </div>

        {/* Right Navigation & Role Switches */}
        <div className="flex items-center gap-2">
          {/* Role Badges */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <Link
              to="/citizen"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                isCitizen 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">Citizen</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                isAdmin 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldAlert size={14} />
              <span className="hidden sm:inline">Admin Command</span>
            </Link>
          </div>

          {/* Theme Quick Button */}
          {onOpenThemeCustomizer && (
            <button
              onClick={onOpenThemeCustomizer}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Change Theme & Styling"
              aria-label="Theme Customizer"
            >
              <Palette size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
