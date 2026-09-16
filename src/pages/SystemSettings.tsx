import React, { useState, useEffect } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { voiceAlertService } from '../services/voiceAlertService';
import { esp32SensorService } from '../services/esp32SensorService';
import {
  Settings,
  Volume2,
  Sliders,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Server,
  Play
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const {
    voiceEnabled,
    setVoiceEnabled,
    testVoice,
    activeServiceType,
    setActiveServiceType
  } = useEarthSync();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [cooldownSec, setCooldownSec] = useState<number>(20);

  // Risk weighting states
  const [floodWeights, setFloodWeights] = useState({ water: 40, rise: 35, rain: 25 });
  const [fireWeights, setFireWeights] = useState({ temp: 35, hum: 25, smoke: 40 });

  const defaultApiHost =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      ? import.meta.env.VITE_API_URL + '/api/sensors/ingest'
      : (typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}:5000/api/sensors/ingest`
          : 'http://localhost:5000/api/sensors/ingest');

  const defaultWsHost =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL)
      ? import.meta.env.VITE_WS_URL
      : (typeof window !== 'undefined'
          ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ':5000/ws'
          : 'ws://localhost:5000/ws');

  const [esp32Host, setEsp32Host] = useState(defaultApiHost);
  const [esp32Ws, setEsp32Ws] = useState(defaultWsHost);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const list = voiceAlertService.getVoices();
    setVoices(list);
    const settings = voiceAlertService.getSettings();
    setSpeechRate(settings.rate);
    setCooldownSec(settings.cooldownSeconds);
    if (settings.voiceUri) setSelectedVoice(settings.voiceUri);
  }, []);

  const handleApplyVoice = () => {
    voiceAlertService.updateSettings({
      enabled: voiceEnabled,
      rate: speechRate,
      cooldownSeconds: cooldownSec,
      voiceUri: selectedVoice
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Settings Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              OPERATIONS PLATFORM CONFIGURATION
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
              MISSION CONTROL PARAMETERS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
            <Settings className="w-6 h-6 sm:w-7 h-7 text-cyan-400 shrink-0" />
            <span>SYSTEM SETTINGS & HARDWARE</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Fine-tune speech synthesis voices, early warning debounce, risk formulas, and ESP32 hardware bridges.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Settings saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Voice Alert Engine Settings */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
              <Volume2 className="w-4 h-4" />
              <span>VOICE ALERT SPEECH SYNTHESIS ENGINE</span>
            </div>
            <span className="text-xs font-mono text-slate-400">SIGNATURE FEATURE</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-slate-200 block">VOICE ALERTS MASTER:</span>
                <span className="text-[11px] text-slate-400">
                  Enable automated browser speech announcements on critical incidents.
                </span>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`px-3 py-1.5 rounded font-bold transition-all ${
                  voiceEnabled
                    ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {voiceEnabled ? 'ACTIVE (ON)' : 'MUTED (OFF)'}
              </button>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">
                SPEECH SYNTHESIS VOICE:
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">Default OS Natural Voice</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate Slider */}
            <div>
              <div className="flex justify-between mb-1 text-slate-400">
                <span className="font-bold">SPEECH SPEED RATE:</span>
                <span className="text-cyan-400 font-bold">{speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.4"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Cooldown Debounce */}
            <div>
              <div className="flex justify-between mb-1 text-slate-400">
                <span className="font-bold">ALERT COOLDOWN DEBOUNCE:</span>
                <span className="text-cyan-400 font-bold">{cooldownSec} seconds</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(parseInt(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Suppresses repetitive voice playback when telemetry remains elevated.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleApplyVoice}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
              >
                APPLY VOICE SETTINGS
              </button>
              <button
                onClick={testVoice}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> TEST AUDIO
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Hardware Readiness & Ingestion Mode */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
              <Server className="w-4 h-4" />
              <span>HARDWARE INTEGRATION & DATA SOURCE</span>
            </div>
            <span className="text-xs font-mono text-slate-400">ESP8266 / ESP32 BRIDGE</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Service Toggle */}
            <div>
              <label className="block text-slate-400 mb-2 font-bold">
                ACTIVE DATA SERVICE ABSTRACTION:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveServiceType('MOCK')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeServiceType === 'MOCK'
                      ? 'bg-cyan-950/70 border-cyan-600 text-white font-bold ring-1 ring-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-sm">MockSensorService</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Deterministic time-series curves
                  </span>
                </button>

                <button
                  onClick={() => setActiveServiceType('ESP32')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeServiceType === 'ESP32'
                      ? 'bg-emerald-950/70 border-emerald-600 text-white font-bold ring-1 ring-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-sm">ESP8266 / ESP32 Live Service</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Live WebSocket / REST link
                  </span>
                </button>
              </div>
            </div>

            {/* REST Endpoint */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">
                ESP32 REST INGESTION URI:
              </label>
              <input
                type="text"
                value={esp32Host}
                onChange={(e) => setEsp32Host(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                ESP32 HTTP POST payload target.
              </span>
            </div>

            {/* WebSocket Endpoint */}
            <div>
              <label className="block text-slate-400 mb-1 font-bold">
                BACKEND WEBSOCKET SERVER URI:
              </label>
              <input
                type="text"
                value={esp32Ws}
                onChange={(e) => setEsp32Ws(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Real-time bi-directional telemetry broadcast channel.
              </span>
            </div>

            <button
              onClick={() => {
                esp32SensorService.setWsUrl(esp32Ws);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2500);
              }}
              className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors"
            >
              APPLY HARDWARE CONNECTION CONFIG
            </button>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">
                HARDWARE DROP-IN READINESS:
              </strong>
              The EarthSync frontend is fully decoupled from mock data. Swapping between Mock and ESP32 services requires zero UI redesign.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
