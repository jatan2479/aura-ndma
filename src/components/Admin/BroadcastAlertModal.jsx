import React, { useState } from 'react';
import { Radio, Send, Check } from 'lucide-react';
import Modal from '../Common/Modal';
import { useIncidents } from '../../contexts/IncidentContext';

export default function BroadcastAlertModal({ isOpen, onClose }) {
  const { broadcastOfficialAlert } = useIncidents();

  const [title, setTitle] = useState('NDMA EVACUATION ADVISORY');
  const [severity, setSeverity] = useState('CRITICAL');
  const [message, setMessage] = useState('Severe flash flood wave detected in downstream sectors. Immediate evacuation to marked relief camps recommended.');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    broadcastOfficialAlert({
      title,
      severity,
      message,
      issuedBy: 'Emergency Command HQ (Admin)'
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Official Disaster Broadcast Alert" icon={Radio}>
      {isSent ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto animate-ping">
            <Check size={32} />
          </div>
          <h4 className="font-bold text-lg text-white">Broadcast Alert Dispatched!</h4>
          <p className="text-xs text-slate-400">
            Push alert transmitted across all citizen mobile devices on the network.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Alert Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Alert Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
            >
              <option value="CRITICAL">Critical Emergency (Immediate Action)</option>
              <option value="HIGH">High Warning (Prepare Evacuation)</option>
              <option value="ADVISORY">General Advisory / Weather Watch</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Detailed Message & Guidance</label>
            <textarea
              rows="3"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Send size={15} /> Broadcast to All Phones
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
