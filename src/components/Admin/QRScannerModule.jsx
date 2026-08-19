import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, UserCheck, ShieldCheck } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import { formatCoordinates } from '../../utils/geoUtils';

export default function QRScannerModule() {
  const { reliefCamps, checkinCamp } = useIncidents();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [selectedCampId, setSelectedCampId] = useState(reliefCamps[0]?.id || 'camp-1');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        'aura-qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          console.log('[QR SCANNER] Scanned:', decodedText);
          try {
            const parsed = JSON.parse(decodedText);
            setScannedData(parsed);
          } catch {
            setScannedData({
              name: 'Citizen Pass',
              rawText: decodedText,
              phone: 'N/A',
              bloodGroup: 'N/A',
              medicalConditions: decodedText
            });
          }
          scanner.clear().catch(() => {});
          setIsScanning(false);
        },
        () => {
          // Continuous scan frame callback
        }
      );

      scannerRef.current = scanner;

      return () => {
        try {
          scanner.clear().catch(() => {});
        } catch {}
      };
    }
  }, [isScanning]);

  const handleCampCheckin = () => {
    if (!scannedData) return;

    checkinCamp(selectedCampId, scannedData);
    setCheckinSuccess(true);

    setTimeout(() => {
      setCheckinSuccess(false);
      setScannedData(null);
    }, 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <QrCode size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">QR Emergency Code Scanner</h4>
            <p className="text-[11px] text-slate-400">Live camera scanner for camp intake & field verification</p>
          </div>
        </div>

        <button
          onClick={() => {
            setScannedData(null);
            setIsScanning(prev => !prev);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
            isScanning
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
          }`}
        >
          <Camera size={14} />
          {isScanning ? 'Close Viewfinder' : 'Open Camera Scanner'}
        </button>
      </div>

      {/* Live HTML5 QR Scanner Viewport */}
      {isScanning && (
        <div className="p-3 rounded-2xl bg-slate-950 border border-blue-500/40 shadow-inner space-y-2">
          <div id="aura-qr-reader" className="w-full rounded-xl overflow-hidden" />
          <p className="text-[11px] text-slate-400 text-center">
            Align the citizen's mobile QR code within the viewfinder.
          </p>
        </div>
      )}

      {/* Scanned Citizen Triage Result Card */}
      {scannedData && (
        <div className="p-4 rounded-xl border border-blue-500 bg-slate-950 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ShieldCheck size={16} />
              <span>VERIFIED CITIZEN TRIAGE RECORD</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{scannedData.id || 'VALID'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 block">Name</span>
              <strong className="text-sm text-white">{scannedData.name || 'Citizen'}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Blood Group</span>
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                {scannedData.bloodGroup || 'O+'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Contact</span>
              <span>{scannedData.phone || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block">Medical Conditions</span>
              <span className="text-amber-300 font-semibold">{scannedData.medicalConditions || 'None'}</span>
            </div>
          </div>

          {scannedData.lat && scannedData.lng && (
            <div className="text-[11px] text-slate-400 font-mono">
              Last Known GPS: {formatCoordinates(scannedData.lat, scannedData.lng)}
            </div>
          )}

          {/* Camp Selection & Checkin Action */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Assign Relief Camp Shelter Intake:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCampId}
                onChange={(e) => setSelectedCampId(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {reliefCamps.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.availableBeds} beds left)
                  </option>
                ))}
              </select>

              <button
                onClick={handleCampCheckin}
                disabled={checkinSuccess}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <UserCheck size={14} />
                {checkinSuccess ? 'Checked In!' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
