import React, { useState, useRef } from 'react';
import { Users, Search, Plus, Camera, Check, MapPin, Tent } from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import Modal from '../Common/Modal';

export default function MissingPersonsDirectory() {
  const { missingPersons, reportMissingPerson } = useIncidents();
  const { lat, lng, refreshPosition } = useGeolocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form State for reporting
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [lastSeenTime, setLastSeenTime] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  // Handle Photo Capture / Selection
  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    refreshPosition();

    reportMissingPerson({
      name,
      age: parseInt(age) || 0,
      gender,
      lastSeenTime: lastSeenTime || 'Recent',
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      address: address || 'Last Reported Zone',
      description,
      contactNumber,
      photoUrl: photoBase64
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsReportModalOpen(false);
      // Reset form
      setName('');
      setAge('');
      setDescription('');
      setContactNumber('');
      setPhotoBase64(null);
    }, 1800);
  };

  const filteredPersons = missingPersons.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.campName && p.campName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Missing Persons Directory</h3>
            <p className="text-xs text-slate-400">Search missing reports or located individuals across Relief Camps</p>
          </div>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-2 transition shadow-lg shadow-red-600/30 self-start sm:self-auto"
        >
          <Plus size={16} /> Report Missing Person
        </button>
      </div>

      {/* Search Bar & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, description, or camp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {['ALL', 'MISSING', 'AT_RELIEF_CAMP'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All' : status === 'MISSING' ? 'Missing' : 'In Camp'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPersons.map((person) => (
          <div
            key={person.id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition flex gap-4"
          >
            {/* Photo / Avatar */}
            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 shrink-0 overflow-hidden flex items-center justify-center text-slate-500">
              {person.photoUrl ? (
                <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <Users size={32} className="text-slate-600" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-white truncate">{person.name}</h4>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                  person.status === 'AT_RELIEF_CAMP'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {person.status === 'AT_RELIEF_CAMP' ? 'Located in Camp' : 'Missing'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                {person.age} yrs • {person.gender} • Last seen: {person.lastSeenTime}
              </p>

              {person.status === 'AT_RELIEF_CAMP' && person.campName && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40">
                  <Tent size={13} className="shrink-0" />
                  <span className="truncate">{person.campName}</span>
                </div>
              )}

              {person.description && (
                <p className="text-[11px] text-slate-400 line-clamp-2">{person.description}</p>
              )}

              <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                <MapPin size={11} />
                <span className="truncate">{person.lastKnownLocation?.address || 'GPS Tagged'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Missing Person Modal */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        title="File Missing Person Report" 
        icon={Users}
      >
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <Check size={32} />
            </div>
            <h4 className="font-bold text-lg text-white">Missing Person Report Filed</h4>
            <p className="text-xs text-slate-400">
              Record synced across all NDMA relief camps and Admin Command centres.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            
            {/* Camera Photo Capture */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Photo (Physical Camera Upload)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-2 transition"
                >
                  <Camera size={16} className="text-blue-400" />
                  {photoBase64 ? 'Change Photo' : 'Capture / Upload Photo'}
                </button>

                {photoBase64 && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-500">
                    <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Person's Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Last Seen Approx Time</label>
                <input
                  type="text"
                  placeholder="e.g. 3 hours ago / 2:00 PM"
                  value={lastSeenTime}
                  onChange={(e) => setLastSeenTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Last Known Landmark / Area</label>
              <input
                type="text"
                placeholder="e.g. Near Old Bridge, Sector 4 Market"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Physical Description / Clothing</label>
              <textarea
                rows="2"
                placeholder="e.g. Height 5'6'', red t-shirt, carrying brown handbag, speaks Bengali"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Reporter Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> File Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
