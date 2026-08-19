import React from 'react';
import { Tent, Navigation, Phone, Check, X, BedDouble } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { calculateDistance, formatDistance } from '../../utils/geoUtils';

export default function ReliefCampsList() {
  const { reliefCamps } = useIncidents();
  const { lat, lng } = useGeolocation();

  // Compute live distance for each camp and sort closest first
  const sortedCamps = [...reliefCamps].map(camp => {
    const distanceKm = (lat && lng && camp.lat && camp.lng)
      ? calculateDistance(lat, lng, camp.lat, camp.lng)
      : null;
    return { ...camp, distanceKm };
  }).sort((a, b) => {
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  const openNavigation = (camp) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Tent size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Relief Camp Centres</h3>
            <p className="text-xs text-slate-400">Real-time distance-sorted active shelters & facility availability</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-700/60 text-xs font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {reliefCamps.length} Active Camps
        </div>
      </div>

      {/* Camp Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCamps.map((camp) => (
          <div
            key={camp.id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Distance badge & Name */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
                  {formatDistance(camp.distanceKm)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {camp.id}</span>
              </div>

              <h4 className="font-bold text-sm text-white leading-snug">{camp.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{camp.address}</p>

              {/* Beds Availability */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <BedDouble size={15} className="text-emerald-400" />
                  <span className="text-slate-300">Available Beds:</span>
                </div>
                <span className={`text-xs font-extrabold font-mono ${
                  camp.availableBeds > 30 ? 'text-emerald-400' : camp.availableBeds > 0 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {camp.availableBeds} / {camp.beds}
                </span>
              </div>

              {/* Facilities Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  camp.medical ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {camp.medical ? <Check size={11} /> : <X size={11} />} Medical Staff
                </span>

                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  camp.food ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {camp.food ? <Check size={11} /> : <X size={11} />} Rations & Food
                </span>

                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  camp.water ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {camp.water ? <Check size={11} /> : <X size={11} />} Clean Water
                </span>

                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  camp.power ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  {camp.power ? <Check size={11} /> : <X size={11} />} Power Grid
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <a
                href={`tel:${camp.contact}`}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                title={`Call ${camp.contact}`}
              >
                <Phone size={14} />
              </a>

              <button
                onClick={() => openNavigation(camp)}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Navigation size={13} /> Get Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
