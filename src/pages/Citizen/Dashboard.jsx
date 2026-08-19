import React, { useState } from 'react';
import Navbar from '../../components/Common/Navbar';
import ThemeCustomizer from '../../theme/ThemeCustomizer';
import EmergencySOS from '../../components/Citizen/EmergencySOS';
import SupplyRequestModal from '../../components/Citizen/SupplyRequestModal';
import PreparednessSurvey from '../../components/Citizen/PreparednessSurvey';
import MissingPersonsDirectory from '../../components/Citizen/MissingPersonsDirectory';
import ReliefCampsList from '../../components/Citizen/ReliefCampsList';
import DisasterAlerts from '../../components/Citizen/DisasterAlerts';
import DeadHandCitizen from '../../components/Citizen/DeadHandCitizen';
import AcousticBeaconTransmitter from '../../components/Citizen/AcousticBeaconTransmitter';
import CitizenQRCodeModal from '../../components/Citizen/CitizenQRCodeModal';
import { ShieldAlert, Package, CheckSquare, Users, Tent, Radio, Skull, QrCode } from 'lucide-react';

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState('sos');
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const TABS = [
    { id: 'sos', name: 'Emergency SOS', icon: ShieldAlert, color: 'text-red-400' },
    { id: 'supplies', name: 'Request Supplies', icon: Package, color: 'text-blue-400', action: () => setIsSupplyModalOpen(true) },
    { id: 'preparedness', name: 'House Preparedness', icon: CheckSquare, color: 'text-emerald-400' },
    { id: 'missing', name: 'Missing Persons', icon: Users, color: 'text-purple-400' },
    { id: 'camps', name: 'Relief Camps', icon: Tent, color: 'text-teal-400' },
    { id: 'alerts', name: 'Disaster Alerts', icon: Radio, color: 'text-amber-400' },
    { id: 'deadhand', name: "Dead-Man's Switch", icon: Skull, color: 'text-red-400' },
    { id: 'acoustic', name: 'Acoustic Beacon', icon: Radio, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Universal Tactical Navbar */}
      <Navbar />

      {/* Floating Theme Customizer Engine */}
      <ThemeCustomizer />

      {/* Citizen Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        
        {/* Quick Action Banner with QR Pass & Supplies */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Citizen Emergency Dashboard
            </h2>
            <p className="text-xs text-slate-400">
              Live hardware sensors and direct command grid dispatch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/10"
            >
              <QrCode size={15} /> Emergency QR Pass
            </button>

            <button
              onClick={() => setIsSupplyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Package size={15} className="text-blue-400" /> Request Supplies
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs (Mobile Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.action) {
                    tab.action();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 scale-102'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : tab.color} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="space-y-6">
          {activeTab === 'sos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EmergencySOS />
              </div>
              <div className="space-y-6">
                <DeadHandCitizen />
              </div>
            </div>
          )}

          {activeTab === 'preparedness' && <PreparednessSurvey />}

          {activeTab === 'missing' && <MissingPersonsDirectory />}

          {activeTab === 'camps' && <ReliefCampsList />}

          {activeTab === 'alerts' && <DisasterAlerts />}

          {activeTab === 'deadhand' && (
            <div className="max-w-2xl mx-auto">
              <DeadHandCitizen />
            </div>
          )}

          {activeTab === 'acoustic' && (
            <div className="max-w-2xl mx-auto">
              <AcousticBeaconTransmitter />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SupplyRequestModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
      />

      <CitizenQRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
