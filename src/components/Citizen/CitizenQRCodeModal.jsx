import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import Modal from '../Common/Modal';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function CitizenQRCodeModal({ isOpen, onClose }) {
  const { lat, lng } = useGeolocation();

  const [citizenName, setCitizenName] = useState(() => localStorage.getItem('aura_citizen_name') || 'Citizen');
  const [phone] = useState(() => localStorage.getItem('aura_citizen_phone') || '+91 98765 43210');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [medicalConditions, setMedicalConditions] = useState('None / Asthma Inhaler');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const qrPayload = JSON.stringify({
        system: 'AURA-NDMA',
        id: `AURA-${citizenName.replace(/\s+/g, '').toUpperCase().slice(0, 6)}`,
        name: citizenName,
        phone: phone,
        bloodGroup: bloodGroup,
        medicalConditions: medicalConditions,
        lat: lat || 28.6139,
        lng: lng || 77.2090,
        generatedAt: new Date().toISOString()
      });

      QRCode.toDataURL(qrPayload, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR Generation error:', err));
    }
  }, [isOpen, citizenName, phone, bloodGroup, medicalConditions, lat, lng]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Emergency Medical QR Pass" icon={QrCode}>
      <div className="space-y-5 text-xs text-center">
        
        {/* QR Code Presentation Canvas */}
        <div className="p-4 rounded-2xl bg-white shadow-xl inline-block mx-auto border-4 border-blue-500/40">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Emergency QR Code" className="w-56 h-56 mx-auto block" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              Generating Dynamic QR...
            </div>
          )}
        </div>

        <p className="text-slate-300 max-w-sm mx-auto text-xs">
          Show this QR code to Admin triage officers or relief camp scanners for instant verified medical check-in.
        </p>

        {/* Dynamic Details Customizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Critical Medical Alerts / Allergies</label>
            <input
              type="text"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
