import React, { useState } from 'react';
import { Package, Navigation, CheckCircle2, Truck } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';

export default function SupplyQueueModule() {
  const { supplyRequests, updateSupplyStatus, selectIncident } = useIncidents();
  const [filterUrgency, setFilterUrgency] = useState('ALL');

  const filteredRequests = supplyRequests.filter((r) => {
    if (filterUrgency === 'ALL') return true;
    return r.urgency === filterUrgency;
  });

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-2xl space-y-4">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Package size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Supply Requests Queue</h4>
            <p className="text-[11px] text-slate-400">Emergency food, clean water, and medical aid logistics</p>
          </div>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] self-start sm:self-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((u) => (
            <button
              key={u}
              onClick={() => setFilterUrgency(u)}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                filterUrgency === u
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Feed */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filteredRequests.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No supply requests in queue matching current filter.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-3.5 rounded-xl border transition text-xs space-y-2.5 ${
                req.status === 'DELIVERED'
                  ? 'border-emerald-900/40 bg-slate-950/60 opacity-80'
                  : req.urgency === 'CRITICAL'
                    ? 'border-red-600/50 bg-red-950/20'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{req.citizenName}</span>
                  <span className="text-[10px] text-slate-400">({req.peopleCount || 1} people)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    req.urgency === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : req.urgency === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {req.urgency}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    req.status === 'DELIVERED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : req.status === 'DISPATCHED'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-200">
                <strong className="text-blue-400">Requested:</strong> {Array.isArray(req.items) ? req.items.join(', ') : req.items}
              </div>

              {req.notes && (
                <p className="text-[11px] text-slate-400 italic">"{req.notes}"</p>
              )}

              {/* Action Buttons & Map Pin Focus */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                <button
                  onClick={() => selectIncident(req)}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
                >
                  <Navigation size={12} /> Pin Drop-off on Map
                </button>

                <div className="flex items-center gap-1.5">
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => updateSupplyStatus(req.id, 'DISPATCHED')}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <Truck size={11} /> Mark Dispatched
                    </button>
                  )}
                  {req.status === 'DISPATCHED' && (
                    <button
                      onClick={() => updateSupplyStatus(req.id, 'DELIVERED')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
