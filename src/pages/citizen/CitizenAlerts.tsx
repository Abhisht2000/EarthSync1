import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY } from '../../services/localization';
import { ActionableAlert } from '../../types/alert';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  Volume2,
  CheckCircle2,
  MapPin,
  Clock,
  HelpCircle,
  X,
  Share2
} from 'lucide-react';

export const CitizenAlerts: React.FC = () => {
  const {
    language,
    alerts,
    acknowledgeAlert,
    playVoiceAlert
  } = useEarthSync();

  const t = DICTIONARY[language];
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'WATCH' | 'LOW'>('ALL');
  const [activeWhyAlert, setActiveWhyAlert] = useState<ActionableAlert | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'ALL' && alert.level !== filterSeverity) return false;
    return true;
  });

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          icon: AlertOctagon,
          text: language === 'hi' ? 'गंभीर चेतावनी' : 'CRITICAL WARNING'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          icon: AlertTriangle,
          text: language === 'hi' ? 'उच्च जोखिम अलर्ट' : 'HIGH RISK ALERT'
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: AlertTriangle,
          text: language === 'hi' ? 'सतर्कता अलर्ट' : 'WATCH WARNING'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: Info,
          text: language === 'hi' ? 'सलाहकार सूचना' : 'ADVISORY INFO'
        };
    }
  };

  const handleShare = (alert: ActionableAlert) => {
    const text = `🚨 EarthSync Alert [${alert.level}]: ${alert.what} | Zone: ${alert.zone || 'India'} | Verified by IoT Mesh`;
    if (navigator.share) {
      navigator.share({ title: 'EarthSync Emergency Alert', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{t.alertsEvents}</h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'सत्यापित पूर्व चेतावनी बुलेटिन एवं भू-भौगोलिक आपातकालीन निर्देश'
                  : 'Verified multi-hazard early warning bulletins and evacuation orders'}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredAlerts.length} {language === 'hi' ? 'अलर्ट' : 'Alerts'}
          </span>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              filterSeverity === 'ALL'
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'hi' ? 'सभी' : 'All'} ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              filterSeverity === 'CRITICAL'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800 text-red-400 hover:text-red-300'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            {language === 'hi' ? 'गंभीर' : 'Critical'}
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              filterSeverity === 'HIGH'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'bg-slate-800 text-orange-400 hover:text-orange-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {language === 'hi' ? 'उच्च' : 'High'}
          </button>
          <button
            onClick={() => setFilterSeverity('WATCH')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              filterSeverity === 'WATCH'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-amber-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {language === 'hi' ? 'सतर्कता' : 'Watch'}
          </button>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white">
              {language === 'hi' ? 'कोई सक्रिय अलर्ट नहीं है' : 'No Active Alerts In This Category'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'hi'
                ? 'आपके क्षेत्र के सभी सेंसर सामान्य सीमा के भीतर कार्य कर रहे हैं।'
                : 'All environmental telemetry channels are operating within safe baselines.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const badge = getSeverityBadge(alert.level);
            const BadgeIcon = badge.icon;
            const isAcknowledged = alert.acknowledged;

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-4 transition-all shadow-lg ${
                  alert.level === 'CRITICAL'
                    ? 'bg-gradient-to-br from-red-950/40 to-slate-900/90 border-red-500/40 ring-1 ring-red-500/20'
                    : alert.level === 'HIGH' || alert.level === 'WATCH'
                    ? 'bg-gradient-to-br from-amber-950/30 to-slate-900/90 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {badge.text}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.relativeTime || (alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now')}
                    </span>
                  </div>

                  {/* Audio Readout & Share */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => playVoiceAlert(alert.what)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title={language === 'hi' ? 'आवाज़ सुनें' : 'Read aloud'}
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handleShare(alert)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* What happened */}
                <p className="text-sm font-semibold text-white mt-2.5 leading-relaxed">
                  {alert.what}
                </p>

                {/* Recommended Action */}
                {alert.action && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-xs text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">
                        {language === 'hi' ? 'सलाह/कार्रवाई:' : 'Recommended Action:'}
                      </strong>
                      <span>{alert.action}</span>
                    </div>
                  </div>
                )}

                {/* Footer Meta & Actions */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    {alert.zone && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {alert.zone}
                      </span>
                    )}
                    {alert.nodeId && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {alert.nodeId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* "Why This Alert?" trigger */}
                    <button
                      onClick={() => setActiveWhyAlert(alert)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.whyAlert}</span>
                    </button>

                    {/* Acknowledge Button */}
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      disabled={isAcknowledged}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isAcknowledged
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAcknowledged ? t.acknowledged : t.acknowledge}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* "Why This Alert?" Modal */}
      {activeWhyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.whyAlert}</h3>
                  <p className="text-xs text-slate-400">Sensor Verification & Physics Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setActiveWhyAlert(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Alert Identifier:</span>
                <span className="font-mono text-slate-200 font-bold">{activeWhyAlert.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Reporting Node:</span>
                <span className="font-mono text-emerald-400">{activeWhyAlert.nodeId || 'SYSTEM_AGGREGATOR'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Severity Level:</span>
                <span className="font-bold text-red-400">{activeWhyAlert.level}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Hazard Type:</span>
                <span className="font-bold text-white uppercase">{activeWhyAlert.hazard}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-400 block mb-1">Scientific Cause & Rationale:</span>
                <p className="font-semibold text-amber-200 leading-relaxed">{activeWhyAlert.why}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'hi'
                ? 'यह अलर्ट स्वायत्त IoT सेंसर नोड्स द्वारा सीमा उल्लंघन और AI जोखिम मॉडल के आधार पर स्वचालित रूप से प्रसारित किया गया है।'
                : 'This bulletin was autonomously generated by on-ground IoT nodes following validated threshold violations and edge-computed physics risk models.'}
            </p>

            <button
              onClick={() => setActiveWhyAlert(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              {language === 'hi' ? 'समझ आ गया' : 'Close Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
