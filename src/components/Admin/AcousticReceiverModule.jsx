import React from 'react';
import { Radio, Mic, MicOff, Volume2, Navigation } from 'lucide-react';
import { useAcousticTransceiver } from '../../hooks/useAcousticTransceiver';
import { useIncidents } from '../../contexts/IncidentContext';
import AudioSpectrumCanvas from '../Common/AudioSpectrumCanvas';
import { formatCoordinates } from '../../utils/geoUtils';

export default function AcousticReceiverModule() {
  const { acousticSignals, selectIncident, sendAcousticSignal } = useIncidents();
  const {
    isListening,
    startListening,
    stopListening,
    analyser,
    signalStrength
  } = useAcousticTransceiver();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((detected) => {
        // Also sync detected acoustic spike to central incident store
        sendAcousticSignal({
          frequency: detected.frequency,
          decodedPayload: detected.message,
          lat: 28.6139 + (Math.random() - 0.5) * 0.01,
          lng: 77.2090 + (Math.random() - 0.5) * 0.01,
          detectedBy: 'Admin Acoustic Sensor Array'
        });
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Radio size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Acoustic & Torch Signals Module</h4>
            <p className="text-[11px] text-slate-400">Microphone spectrum FFT analysis & 800Hz tone decoder</p>
          </div>
        </div>

        <button
          onClick={handleToggleListening}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-600/30'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
          }`}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          {isListening ? 'Stop Mic Stream' : 'Listen via Mic'}
        </button>
      </div>

      {/* Live Spectrum Visualizer Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Volume2 size={13} className="text-purple-400" /> Real-time Frequency Spectrum
          </span>
          {isListening && (
            <span className="text-[11px] font-mono text-purple-400 font-bold">
              800Hz Energy: {signalStrength}%
            </span>
          )}
        </div>

        <AudioSpectrumCanvas analyser={analyser} isListening={isListening} targetFrequency={800} height={90} />
      </div>

      {/* Detected Acoustic Signals Feed */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Detected Distress Audio Events
        </h5>

        {acousticSignals.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No acoustic distress beeps detected. Start microphone monitoring to capture audio Morse codes.
          </div>
        ) : (
          acousticSignals.map((ac) => (
            <div
              key={ac.id}
              onClick={() => selectIncident(ac)}
              className="p-2.5 rounded-xl border border-purple-900/40 bg-slate-950 hover:bg-purple-950/30 hover:border-purple-500/50 cursor-pointer transition text-xs space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  <span className="font-bold text-white group-hover:text-purple-300">
                    {ac.decodedPayload || '800 Hz Tone Spike'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(ac.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">{formatCoordinates(ac.lat, ac.lng)}</span>
                <span className="text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                  <Navigation size={10} /> Focus Map
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
