import React, { useState } from 'react';
import { Radio, Volume2, Square } from 'lucide-react';
import { useAcousticTransceiver } from '../../hooks/useAcousticTransceiver';
import { useTorch } from '../../hooks/useTorch';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useIncidents } from '../../contexts/IncidentContext';

export default function AcousticBeaconTransmitter() {
  const { lat, lng } = useGeolocation();
  const { sendAcousticSignal } = useIncidents();
  const { isTransmitting, transmitBeacon, stopTransmission } = useAcousticTransceiver();
  const { stopStrobe, toggleTorch } = useTorch();

  const [activePulseType, setActivePulseType] = useState(null);

  const handleStartBeacon = () => {
    // Transmit 800Hz Morse pattern with synchronized optical strobe
    transmitBeacon('SOS', (pulseType, isOn) => {
      setActivePulseType(isOn ? pulseType : null);
      if (isOn) {
        toggleTorch();
      }
    });

    // Notify backend network of acoustic event
    sendAcousticSignal({
      frequency: 800,
      decodedPayload: 'CITIZEN_ACOUSTIC_SOS_BEACON',
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      detectedBy: 'Citizen Acoustic Transmitter (Phone A)'
    });
  };

  const handleStopBeacon = () => {
    stopTransmission();
    stopStrobe();
    setActivePulseType(null);
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl space-y-5">
      
      {/* Screen flash feedback during transmission */}
      {activePulseType && (
        <div className="fixed top-0 left-0 right-0 h-2 bg-amber-400 z-50 animate-ping pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Radio size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">Acoustic & Optical Transceiver</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Hardware Link
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transmits 800Hz sound pulses & optical light bursts to nearby listening nodes
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          isTransmitting 
            ? 'bg-purple-950/60 border-purple-600 text-purple-300 animate-pulse' 
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          {isTransmitting ? 'TRANSMITTING 800Hz' : 'STANDBY'}
        </div>
      </div>

      {/* Controls & Visual Pulse Meter */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 text-center">
        
        {/* Pulse Visualizer */}
        <div className="h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-3 px-4">
          {['dot', 'dot', 'dot', 'dash', 'dash', 'dash', 'dot', 'dot', 'dot'].map((type, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-150 ${
                type === 'dot' ? 'w-3 h-3' : 'w-7 h-3'
              } ${
                activePulseType ? 'bg-purple-400 shadow-md shadow-purple-500/50 scale-110' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-300">
          Transmits an acoustic distress pattern encoded at <strong>800 Hz</strong> with synchronized flashlight strobing.
        </p>

        {/* Action Button */}
        <div className="pt-2">
          {!isTransmitting ? (
            <button
              onClick={handleStartBeacon}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Volume2 size={16} /> Start 800Hz Acoustic & Optical Beacon
            </button>
          ) : (
            <button
              onClick={handleStopBeacon}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Square size={16} /> Stop Acoustic Transmission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
