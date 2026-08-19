import React, { useState } from 'react';
import { Package, Plus, Minus, Check, Navigation } from 'lucide-react';
import Modal from '../Common/Modal';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useIncidents } from '../../contexts/IncidentContext';
import { formatCoordinates } from '../../utils/geoUtils';

const ESSENTIAL_SUPPLIES = [
  { id: 'water', name: 'Clean Drinking Water', icon: '💧', defaultUnit: 'Litres (Packs)' },
  { id: 'food', name: 'Ready-to-Eat Food / Rations', icon: '🍞', defaultUnit: 'Meal Packs' },
  { id: 'medicines', name: 'Emergency Medicines / Insulin', icon: '💊', defaultUnit: 'Kits' },
  { id: 'firstaid', name: 'First Aid & Trauma Bandages', icon: '🩹', defaultUnit: 'Kits' },
  { id: 'blankets', name: 'Blankets & Warm Clothing', icon: '🧣', defaultUnit: 'Units' },
  { id: 'sanitation', name: 'Sanitation & Baby Hygiene', icon: '🧼', defaultUnit: 'Packs' },
];

export default function SupplyRequestModal({ isOpen, onClose }) {
  const { lat, lng, refreshPosition, loading: gpsLoading } = useGeolocation();
  const { requestSupplies } = useIncidents();

  const [citizenName, setCitizenName] = useState(() => localStorage.getItem('aura_citizen_name') || '');
  const [citizenPhone, setCitizenPhone] = useState(() => localStorage.getItem('aura_citizen_phone') || '');
  const [selectedItems, setSelectedItems] = useState({});
  const [peopleCount, setPeopleCount] = useState(2);
  const [urgency, setUrgency] = useState('HIGH');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleItem = (itemId) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = 1;
      }
      return next;
    });
  };

  const updateQuantity = (itemId, delta) => {
    setSelectedItems(prev => {
      const current = prev[itemId] || 0;
      const updated = Math.max(1, current + delta);
      return { ...prev, [itemId]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemsArray = Object.keys(selectedItems).map(id => {
      const itemDef = ESSENTIAL_SUPPLIES.find(s => s.id === id);
      return `${selectedItems[id]}x ${itemDef ? itemDef.name : id}`;
    });

    if (itemsArray.length === 0) {
      alert('Please select at least one supply item.');
      return;
    }

    refreshPosition();

    requestSupplies({
      citizenName: citizenName || 'Citizen',
      phone: citizenPhone || 'N/A',
      items: itemsArray,
      itemCounts: selectedItems,
      peopleCount,
      urgency,
      notes,
      lat: lat || 28.6139,
      lng: lng || 77.2090
    });

    if (citizenName) localStorage.setItem('aura_citizen_name', citizenName);
    if (citizenPhone) localStorage.setItem('aura_citizen_phone', citizenPhone);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedItems({});
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Emergency Supplies" icon={Package}>
      {isSubmitted ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
            <Check size={32} />
          </div>
          <h4 className="font-bold text-lg text-white">Supply Request Dispatched!</h4>
          <p className="text-xs text-slate-400">
            Your request has been queued at the Admin Command Centre with your live GPS location.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* User Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Supplies Selector Cards */}
          <div>
            <label className="font-semibold text-slate-300 block mb-2">Select Required Items & Quantities</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ESSENTIAL_SUPPLIES.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const count = selectedItems[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => toggleItem(item.id)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-xs leading-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.defaultUnit}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{count}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* People Count & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Number of People Affected</label>
              <input
                type="number"
                min="1"
                max="500"
                value={peopleCount}
                onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Urgency Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              >
                <option value="NORMAL">Standard / Non-Life Threatening</option>
                <option value="HIGH">High Priority (Within 4 Hours)</option>
                <option value="CRITICAL">Critical Emergency (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Specific Needs / Medical Notes / Landmark</label>
            <textarea
              rows="2"
              placeholder="e.g. 1 Infant formula needed, 1 diabetic patient requiring cold storage insulin..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:border-blue-500"
            />
          </div>

          {/* GPS Confirmation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Navigation size={14} className={`text-blue-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span className="font-mono text-[11px]">
                {lat && lng ? formatCoordinates(lat, lng) : 'Acquiring GPS Drop-off Target...'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">AUTO-ATTACHED</span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <Package size={16} /> Submit Request
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
