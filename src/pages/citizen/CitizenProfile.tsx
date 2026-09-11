import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY } from '../../services/localization';
import {
  User,
  Phone,
  Globe,
  MapPin,
  Volume2,
  VolumeX,
  Shield,
  HardDrive,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';

const PRESET_DISTRICTS = [
  { name: 'Dehradun (Song River Basin)', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
  { name: 'Rishikesh (Ganga Ghats)', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676 },
  { name: 'Haridwar (Alaknanda Basin)', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642 },
  { name: 'Shimla (Pine Hills)', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { name: 'Wayanad (Western Ghats)', state: 'Kerala', lat: 11.6854, lon: 76.1320 },
  { name: 'New Delhi (Yamuna Bank)', state: 'Delhi NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai (Coastal Zone)', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 }
];

export const CitizenProfile: React.FC = () => {
  const {
    currentUser,
    updateUserLocation,
    language,
    setLanguage,
    setAppRole,
    voiceMuted,
    setVoiceMuted,
    isOffline,
    isHardwareConnected
  } = useEarthSync();

  const t = DICTIONARY[language];

  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string; relation: string }>>([
    { name: 'Family Contact 1', phone: '+91 98765 43210', relation: 'Spouse' },
    { name: 'Local Volunteer', phone: '+91 91234 56789', relation: 'Neighbourhood' }
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    setEmergencyContacts((prev) => [
      ...prev,
      { name: newContactName, phone: newContactPhone, relation: newContactRelation || 'Contact' }
    ]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setShowAddContact(false);
    triggerSaveToast();
  };

  const handleDeleteContact = (index: number) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto font-sans">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'hi' ? 'सेटिंग्स सुरक्षित की गईं' : 'Settings Saved Successfully'}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-950/40">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {currentUser.name || 'Verified Citizen'}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.authenticatedAs}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.phoneNumber || '+91 98765 43210'}</p>
          </div>
        </div>
      </div>

      {/* Language & Accessibility Preferences */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          {language === 'hi' ? 'भाषा एवं आवाज सेटिंग्स' : 'Language & Voice Preferences'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Language Switch */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                {language === 'hi' ? 'एप्लिकेशन भाषा' : 'Application Language'}
              </span>
              <span className="text-[11px] text-slate-400">English / हिन्दी</span>
            </div>
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Voice Alert Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                {language === 'hi' ? 'ऑटो वॉयस चेतावनी' : 'Audio Readout Alerts'}
              </span>
              <span className="text-[11px] text-slate-400">
                {voiceMuted ? (language === 'hi' ? 'म्यूट है' : 'Voice Muted') : (language === 'hi' ? 'सक्रिय है' : 'Voice Active')}
              </span>
            </div>
            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              className={`p-2 rounded-lg border transition-all ${
                voiceMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation & Region Simulation */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {language === 'hi' ? 'वर्तमान स्थान / जिला चयन' : 'Current District & Location'}
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono">
            {currentUser.location.latitude.toFixed(4)}, {currentUser.location.longitude.toFixed(4)}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          {language === 'hi'
            ? 'आपदा जोखिम परीक्षण हेतु भारतीय जिला चुनें या अपना सटीक स्थान सेट करें:'
            : 'Select an Indian district to simulate real-time sensor geofence calculations:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_DISTRICTS.map((dist) => {
            const isSelected =
              Math.abs(currentUser.location.latitude - dist.lat) < 0.01 &&
              Math.abs(currentUser.location.longitude - dist.lon) < 0.01;
            return (
              <button
                key={dist.name}
                onClick={() => {
                  updateUserLocation({
                    latitude: dist.lat,
                    longitude: dist.lon,
                    district: dist.name,
                    state: dist.state,
                    areaName: dist.name
                  });
                  triggerSaveToast();
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <strong className="block font-semibold">{dist.name}</strong>
                  <span className="text-[10px] text-slate-400">{dist.state}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            {language === 'hi' ? 'आपातकालीन परिजन संपर्क' : 'Emergency Contacts for SOS'}
          </h3>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'जोड़ें' : 'Add Contact'}</span>
          </button>
        </div>

        {showAddContact && (
          <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{contact.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {contact.phone} • <span className="text-emerald-400">{contact.relation}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(idx)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Switch Experience to Disaster Command Center */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {language === 'hi' ? 'आपदा नियंत्रण केंद्र में बदलें' : 'Disaster Authority Command Center'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'प्रशासकों, एनडीआरएफ एवं एसडीआरएफ टीमों के लिए पूर्ण विश्लेषण प्रणाली'
                : 'Full multi-hazard intelligence, gateway mesh & automated siren triggers'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setAppRole('AUTHORITY')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-950/50 transition-all active:scale-95 shrink-0"
        >
          <span>{language === 'hi' ? 'कमांड सेंटर खोलें' : 'Switch to Command Center'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Offline Storage Status Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-500" />
          <span>
            {language === 'hi' ? 'ऑफलाइन स्टोरेज स्थिति:' : 'PWA Storage Cache:'}{' '}
            <strong className="text-slate-300">Active (IndexedDB + ServiceWorker)</strong>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isOffline ? 'Offline Standalone' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
