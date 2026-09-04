export interface VoiceAlertSettings {
  enabled: boolean;
  rate: number; // 0.8 - 1.5
  pitch: number; // 0.8 - 1.2
  volume: number; // 0 - 1.0
  voiceUri?: string;
  cooldownSeconds: number; // default 20s
}

class VoiceAlertService {
  private settings: VoiceAlertSettings = {
    enabled: true,
    rate: 1.05,
    pitch: 1.0,
    volume: 1.0,
    cooldownSeconds: 22,
  };

  private lastSpokenTime: Record<string, number> = {};
  private isSpeaking: boolean = false;
  private listeners: Array<(speaking: boolean, text: string) => void> = [];
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public getSettings(): VoiceAlertSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceAlertSettings>) {
    this.settings = { ...this.settings, ...partial };
  }

  public subscribe(callback: (speaking: boolean, text: string) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(speaking: boolean, text: string = '') {
    this.isSpeaking = speaking;
    this.listeners.forEach((cb) => cb(speaking, text));
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Speaks a warning phrase if voice alerts are enabled and cooldown has passed.
   */
  public speak(text: string, categoryKey: string = 'general', force: boolean = false): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return false;
    }

    if (!this.settings.enabled && !force) {
      return false;
    }

    const now = Date.now();
    const lastSpoken = this.lastSpokenTime[categoryKey] || 0;
    const cooldownMs = this.settings.cooldownSeconds * 1000;

    if (!force && now - lastSpoken < cooldownMs) {
      // Cooldown active, suppress audio repetition
      return false;
    }

    // Cancel currently speaking if any to prioritize new alert
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    // Pick a clean English voice if available
    const voices = this.getVoices();
    if (this.settings.voiceUri) {
      const chosen = voices.find((v) => v.voiceURI === this.settings.voiceUri);
      if (chosen) utterance.voice = chosen;
    } else {
      const preferred = voices.find(
        (v) =>
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David')))
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => {
      this.notify(true, text);
      this.lastSpokenTime[categoryKey] = Date.now();
    };

    utterance.onend = () => {
      this.notify(false, '');
    };

    utterance.onerror = () => {
      this.notify(false, '');
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public speakFloodWarning(severity: 'HIGH' | 'CRITICAL' = 'HIGH'): boolean {
    const text =
      severity === 'CRITICAL'
        ? 'Emergency alert. Water level is increasing rapidly. Critical flood risk detected.'
        : 'Warning. Water level is increasing rapidly. High flood risk detected.';
    return this.speak(text, 'flood_' + severity);
  }

  public speakWildfireWarning(severity: 'HIGH' | 'CRITICAL' = 'HIGH'): boolean {
    const text =
      severity === 'CRITICAL'
        ? 'Emergency alert. High wildfire risk detected. Temperature is rising and smoke levels are elevated.'
        : 'Warning. High wildfire risk detected. Temperature is rising and smoke levels are elevated.';
    return this.speak(text, 'wildfire_' + severity);
  }

  public speakGeneralAnomaly(): boolean {
    return this.speak('Attention. Environmental anomaly detected.', 'anomaly');
  }

  public testAlert(): boolean {
    return this.speak(
      'EarthSync voice intelligence online. Environmental monitoring operational.',
      'test',
      true
    );
  }
}

export const voiceAlertService = new VoiceAlertService();
