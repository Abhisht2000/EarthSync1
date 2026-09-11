import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY, EMERGENCY_GUIDES_DATA } from '../../services/localization';
import {
  BookOpen,
  Waves,
  Flame,
  Mountain,
  Sun,
  Wind,
  CheckCircle2,
  XCircle,
  Package,
  PhoneCall,
  Volume2,
  Share2,
  Shield,
  HelpCircle
} from 'lucide-react';

export const CitizenGuides: React.FC = () => {
  const { language, playVoiceAlert } = useEarthSync();
  const t = DICTIONARY[language];

  const [selectedHazard, setSelectedHazard] = useState<'flood' | 'wildfire' | 'landslide' | 'heatwave'>('flood');
  const [activeTab, setActiveTab] = useState<'dos' | 'donts' | 'kit'>('dos');
  const [checkedKitItems, setCheckedKitItems] = useState<Record<string, boolean>>({});

  const hazardList = [
    { id: 'flood' as const, label: language === 'hi' ? 'बाढ़' : 'Flood', icon: Waves, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { id: 'wildfire' as const, label: language === 'hi' ? 'दावानल / आग' : 'Wildfire', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { id: 'landslide' as const, label: language === 'hi' ? 'भूस्खलन' : 'Landslide', icon: Mountain, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'heatwave' as const, label: language === 'hi' ? 'लू / ग्रीष्म लहर' : 'Heatwave', icon: Sun, color: 'text-red-400 bg-red-500/10 border-red-500/30' }
  ];

  const currentGuide = EMERGENCY_GUIDES_DATA[selectedHazard][language];

  const toggleKitItem = (item: string) => {
    setCheckedKitItems((prev) => ({
      ...prev,
      [`${selectedHazard}_${item}`]: !prev[`${selectedHazard}_${item}`]
    }));
  };

  const handleReadAloud = () => {
    let text = `${currentGuide.title}. ${currentGuide.tagline}. `;
    if (activeTab === 'dos') {
      text += (language === 'hi' ? 'क्या करें: ' : 'Things to do: ') + currentGuide.dos.join('. ');
    } else if (activeTab === 'donts') {
      text += (language === 'hi' ? 'क्या न करें: ' : 'Things to avoid: ') + currentGuide.donts.join('. ');
    } else {
      text += (language === 'hi' ? 'सुरक्षा किट: ' : 'Emergency Kit checklist: ') + currentGuide.kit.join(', ');
    }
    playVoiceAlert(text);
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{t.emergencyGuides}</h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'NDMA एवं SDMA मानकों के अनुसार आपदा से बचाव एवं सुरक्षा निर्देश'
                  : 'NDMA & SDMA aligned survival guidelines, DOs/DON\'Ts and kit checklists'}
              </p>
            </div>
          </div>

          <button
            onClick={handleReadAloud}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Read current guide"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'hi' ? 'सुनाएं' : 'Listen'}</span>
          </button>
        </div>

        {/* Hazard Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          {hazardList.map((h) => {
            const Icon = h.icon;
            const isSelected = selectedHazard === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHazard(h.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-xs font-bold ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500 text-white ring-1 ring-teal-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{h.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guide Content Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {currentGuide.title}
          </h3>
          <p className="text-xs text-teal-400/90 mt-0.5 font-medium">{currentGuide.tagline}</p>
        </div>

        {/* Tabs: DOs, DON'Ts, Kit */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dos')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dos'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.dos}</span>
          </button>
          <button
            onClick={() => setActiveTab('donts')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'donts'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t.donts}</span>
          </button>
          <button
            onClick={() => setActiveTab('kit')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'kit'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.emergencyKit}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="space-y-2.5 pt-1">
          {activeTab === 'dos' && (
            <div className="space-y-2.5">
              {currentGuide.dos.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'donts' && (
            <div className="space-y-2.5">
              {currentGuide.donts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 flex items-start gap-3 text-xs text-slate-200"
                >
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kit' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                {language === 'hi'
                  ? 'अपनी तैयारी जांचने के लिए किट की वस्तुओं पर टिक करें:'
                  : 'Check off items as you pack your family emergency grab-bag:'}
              </p>
              {currentGuide.kit.map((item, idx) => {
                const key = `${selectedHazard}_${item}`;
                const isChecked = !!checkedKitItems[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleKitItem(item)}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-950/30 border-amber-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700 pointer-events-none"
                    />
                    <span className={isChecked ? 'line-through text-slate-400' : 'font-medium'}>{item}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Helplines Quick-Dial Hub */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          {language === 'hi' ? 'आपातकालीन हेल्पलाइन नंबर' : 'National Emergency Helplines'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <a
            href="tel:112"
            className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500 flex flex-col items-center text-center transition-all group"
          >
            <span className="font-extrabold text-red-400 text-base group-hover:scale-110 transition-transform">112</span>
            <span className="text-[11px] text-slate-300 font-semibold">{language === 'hi' ? 'अखिल भारतीय आपात' : 'All-in-One SOS'}</span>
          </a>
          <a
            href="tel:1078"
            className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 hover:border-blue-500 flex flex-col items-center text-center transition-all group"
          >
            <span className="font-extrabold text-blue-400 text-base group-hover:scale-110 transition-transform">1078</span>
            <span className="text-[11px] text-slate-300 font-semibold">{language === 'hi' ? 'NDMA आपदा नियंत्रण' : 'NDMA Disaster'}</span>
          </a>
          <a
            href="tel:108"
            className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 flex flex-col items-center text-center transition-all group"
          >
            <span className="font-extrabold text-emerald-400 text-base group-hover:scale-110 transition-transform">108</span>
            <span className="text-[11px] text-slate-300 font-semibold">{language === 'hi' ? 'एम्बुलेंस' : 'Ambulance'}</span>
          </a>
          <a
            href="tel:1070"
            className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-500 flex flex-col items-center text-center transition-all group"
          >
            <span className="font-extrabold text-purple-400 text-base group-hover:scale-110 transition-transform">1070</span>
            <span className="text-[11px] text-slate-300 font-semibold">{language === 'hi' ? 'राज्य राहत आयुक्त' : 'State Disaster Desk'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
