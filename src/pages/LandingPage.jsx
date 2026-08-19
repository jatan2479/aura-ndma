import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Navigation, Wifi, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSocket } from '../contexts/SocketContext';
import { formatCoordinates } from '../utils/geoUtils';

export default function LandingPage() {
  const { lat, lng } = useGeolocation();
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Background Decorative Ambient Tactical Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / System Status */}
      <div className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold tracking-wider">AURA-NDMA DEFENCE GRID ACTIVE</span>
            <span className="text-slate-500 font-mono hidden sm:inline">| SMART INDIA HACKATHON EDITION</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Navigation size={12} className="text-blue-400" />
              <span>{lat && lng ? formatCoordinates(lat, lng) : 'GPS Acquired'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi size={12} className={isConnected ? 'text-emerald-400' : 'text-amber-400'} />
              <span>{isConnected ? 'NODE ONLINE (3001)' : 'STANDALONE MESH'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-blue-500/10">
          <Zap size={14} className="text-blue-400" />
          Hardware-Accelerated Situational Awareness Engine
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            AURA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">NDMA</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Next-Generation Tactical Disaster Management Platform connecting physical phone hardware sensors, acoustic transceivers, and live GPS telemetry directly to the Emergency Command Grid.
          </p>
        </div>

        {/* Role Selection High-Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl pt-4">
          
          {/* Citizen Entry Card */}
          <Link
            to="/citizen"
            className="group relative p-8 rounded-3xl border border-blue-500/40 bg-gradient-to-b from-slate-900/90 to-blue-950/30 hover:border-blue-400 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 text-left flex flex-col justify-between space-y-6 transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition">
                  Citizen Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  High-accessibility emergency tools for disaster-affected individuals.
                </p>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> One-Tap Emergency GPS SOS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> Essential Supply Requests Queue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> House Preparedness Assessment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> Missing Persons & Relief Camps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-400" /> Dead-Man's Safety Strobe Switch
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:text-blue-300 pt-2">
              <span>Log In as Citizen</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Admin Command Entry Card */}
          <Link
            to="/admin"
            className="group relative p-8 rounded-3xl border border-red-500/40 bg-gradient-to-b from-slate-900/90 to-red-950/30 hover:border-red-400 transition-all duration-300 shadow-2xl hover:shadow-red-500/20 text-left flex flex-col justify-between space-y-6 transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-lg shadow-red-600/20">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-red-300 transition">
                  Admin Command Centre
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Centralized situational awareness & tactical dispatch headquarters.
                </p>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400" /> Tactical Leaflet Operational Map
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400" /> Incident-Driven Precision Pinning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400" /> Live Microphone FFT Audio Spectrum
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400" /> Dead-Hand Safety Monitoring Panel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400" /> Camera QR Scanner & Supply Queue
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-red-400 group-hover:text-red-300 pt-2">
              <span>Log In as Admin</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Live Grid Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-white font-mono">100%</div>
            <div className="text-[11px] text-slate-400">Real Hardware Sensors</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-emerald-400 font-mono">0ms</div>
            <div className="text-[11px] text-slate-400">Real-Time Sync Latency</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-blue-400 font-mono">800 Hz</div>
            <div className="text-[11px] text-slate-400">Acoustic Tone Beacon</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-amber-400 font-mono">P2P BLE</div>
            <div className="text-[11px] text-slate-400">Off-Grid Mesh Radio</div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 py-4 text-center text-xs text-slate-500">
        National Disaster Management Authority (NDMA) • Smart India Hackathon Prototype Grid
      </footer>
    </div>
  );
}
