import * as Tone from "tone";

export interface MixerChannelState {
  volume: number; // 0.0 a 4.5
  pan?: number; // -1.0 a 1.0 (paneo estéreo)
  isMuted: boolean;
  isSolo: boolean;
}

export type DrumPieceName = "kick" | "snare" | "hihat" | "ride";

export interface DrumPieceState {
  volume: number; // 0.0 a 1.5
  pan?: number; // -1.0 a 1.0 (paneo estéreo)
  isMuted: boolean;
}

export type MainMixerChannel = "drums" | "bass" | "piano" | "rhodes" | "guitar";

export type HarmonyVoicePresetId =
  | "grand_piano"
  | "korg_bright"
  | "roland_stage"
  | "rhodes"
  | "electric_piano"
  | "acoustic_steel"
  | "nylon_concert";

export type BassVoicePresetId =
  | "upright_bass"
  | "j_style_finger"
  | "p_style_vintage"
  | "active_modern"
  | "fretless_bass";

export type DrumKitPresetId = "jazz_vintage" | "studio_birch" | "urban_808";

export interface VoicePresetOption<T extends string> {
  id: T;
  category: "piano" | "guitar" | "bass" | "drums";
  labelEs: string;
  labelEn: string;
  badge: string;
}

export const HARMONY_VOICE_PRESETS: VoicePresetOption<HarmonyVoicePresetId>[] = [
  // 5 TECLADOS HD
  {
    id: "grand_piano",
    category: "piano",
    labelEs: "Grand Piano HD",
    labelEn: "Grand Piano HD",
    badge: "Acoustic Concert",
  },
  {
    id: "korg_bright",
    category: "piano",
    labelEs: "Bright Studio Piano",
    labelEn: "Bright Studio Piano",
    badge: "Bright Attack",
  },
  {
    id: "roland_stage",
    category: "piano",
    labelEs: "Stage Layer (Piano + EP)",
    labelEn: "Stage Layer (Piano + EP)",
    badge: "Grand + FM Layer",
  },
  {
    id: "rhodes",
    category: "piano",
    labelEs: "Vintage Tine EP",
    labelEn: "Vintage Tine EP",
    badge: "Warm Mark I",
  },
  {
    id: "electric_piano",
    category: "piano",
    labelEs: "FM Crystal EP",
    labelEn: "FM Crystal EP",
    badge: "80s Digital EP",
  },
  // 2 GUITARRAS ACÚSTICAS HD
  {
    id: "acoustic_steel",
    category: "guitar",
    labelEs: "Acoustic Steel Guitar",
    labelEn: "Acoustic Steel Guitar",
    badge: "Dreadnought HD",
  },
  {
    id: "nylon_concert",
    category: "guitar",
    labelEs: "Nylon Concert Guitar",
    labelEn: "Nylon Concert Guitar",
    badge: "Spanish Classical",
  },
];

export const BASS_VOICE_PRESETS: VoicePresetOption<BassVoicePresetId>[] = [
  {
    id: "upright_bass",
    category: "bass",
    labelEs: "Contrabajo Acústico (Upright)",
    labelEn: "Upright Acoustic Bass",
    badge: "Jazz Pizzicato",
  },
  {
    id: "j_style_finger",
    category: "bass",
    labelEs: "J-Style Finger Bass (60s)",
    labelEn: "60s J-Style Finger Bass",
    badge: "Bridge Growl",
  },
  {
    id: "p_style_vintage",
    category: "bass",
    labelEs: "P-Style Vintage Bass",
    labelEn: "Vintage P-Style Bass",
    badge: "Warm Punch",
  },
  {
    id: "active_modern",
    category: "bass",
    labelEs: "Modern Active Studio Bass",
    labelEn: "Modern Active Studio Bass",
    badge: "Deep Sub + Hi-Fi",
  },
  {
    id: "fretless_bass",
    category: "bass",
    labelEs: "Fretless Studio Bass",
    labelEn: "Fretless Studio Bass",
    badge: "Warm Mwah",
  },
];

export const DRUM_KIT_PRESETS: VoicePresetOption<DrumKitPresetId>[] = [
  {
    id: "jazz_vintage",
    category: "drums",
    labelEs: "Vintage Maple Jazz Kit (Jazz / Bossa / Bolero)",
    labelEn: "Vintage Maple Jazz Kit (Jazz / Bossa / Bolero)",
    badge: "Warm Acoustic",
  },
  {
    id: "studio_birch",
    category: "drums",
    labelEs: "Studio Birch Punch Kit (Rock / Pop / Blues / Reggae)",
    labelEn: "Studio Birch Punch Kit (Rock / Pop / Blues / Reggae)",
    badge: "Tight Punch",
  },
  {
    id: "urban_808",
    category: "drums",
    labelEs: "Urban Dembow & 808 Kit (Reggaetón / Urbano)",
    labelEn: "Urban Dembow & 808 Kit (Reggaeton / Urban)",
    badge: "Tight Urban Punch",
  },
];

export function detectDrumKitFromStyle(style?: string): DrumKitPresetId {
  const s = String(style || "Jazz Swing").toLowerCase();
  if (
    s.includes("reggaet") ||
    s.includes("reguet") ||
    s.includes("dembow") ||
    s.includes("urbano") ||
    s.includes("hip") ||
    s.includes("boom bap")
  ) {
    return "urban_808";
  }
  if (
    s.includes("rock") ||
    s.includes("pop") ||
    s.includes("blues") ||
    s.includes("shuffle") ||
    s.includes("funk") ||
    s.includes("fusion") ||
    s.includes("reggae") ||
    s.includes("soul") ||
    s.includes("r&b") ||
    s.includes("cumbia")
  ) {
    return "studio_birch";
  }
  return "jazz_vintage";
}

export interface MixerState {
  drums: MixerChannelState;
  drumPieces: Record<DrumPieceName, DrumPieceState>;
  bass: MixerChannelState;
  piano: MixerChannelState;
  rhodes: MixerChannelState;
  guitar: MixerChannelState;
  masterVolume: number;
  roomReverbWet?: number;
  metronomeActive: boolean;
  harmonyPreset?: HarmonyVoicePresetId;
  bassPreset?: BassVoicePresetId;
  drumKitPreset?: DrumKitPresetId;
}

export type DrumSampleName =
  | "kick"
  | "snare"
  | "hihat"
  | "hihat_closed"
  | "hihat_open"
  | "ride"
  | "rim";
export type HarmonicInstrumentType = "piano" | "guitar" | "epiano";

const PIANO_ANCHOR_URLS = [
  { midi: 36, note: "C2", url: "https://tonejs.github.io/audio/salamander/C2.mp3" },
  { midi: 42, note: "Fs2", url: "https://tonejs.github.io/audio/salamander/Fs2.mp3" },
  { midi: 48, note: "C3", url: "https://tonejs.github.io/audio/salamander/C3.mp3" },
  { midi: 54, note: "Fs3", url: "https://tonejs.github.io/audio/salamander/Fs3.mp3" },
  { midi: 60, note: "C4", url: "https://tonejs.github.io/audio/salamander/C4.mp3" },
  { midi: 66, note: "Fs4", url: "https://tonejs.github.io/audio/salamander/Fs4.mp3" },
  { midi: 72, note: "C5", url: "https://tonejs.github.io/audio/salamander/C5.mp3" },
  { midi: 78, note: "Fs5", url: "https://tonejs.github.io/audio/salamander/Fs5.mp3" },
  { midi: 84, note: "C6", url: "https://tonejs.github.io/audio/salamander/C6.mp3" },
];

const MUSYNG_CDN = "https://gleitz.github.io/midi-js-soundfonts/MusyngKite";
const FLUID_CDN = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM";

interface ActiveVoiceRecord {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  stopTime: number;
  peakGain: number;
}

const CHANNEL_NOMINAL_BASE_GAIN: Record<MainMixerChannel, number> = {
  piano: 0.55,
  rhodes: 0.65,
  guitar: 0.65,
  bass: 1.25,
  drums: 0.72,
};

export class InteractiveAnalysisAudioEngine {
  private ctx: AudioContext | null = null;

  // Master Section
  private masterBusGain: GainNode | null = null;
  private styleGainNode: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private brickwallLimiter: DynamicsCompressorNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private currentStyleGainMultiplier: number = 1.0;

  // Presets activos de Armonía, Bajo y Kit de Batería
  private activeHarmonyPreset: HarmonyVoicePresetId = "grand_piano";
  private lastPianoPreset: HarmonyVoicePresetId = "grand_piano";
  private lastGuitarPreset: HarmonyVoicePresetId = "acoustic_steel";
  private activeBassPreset: BassVoicePresetId = "upright_bass";
  private activeDrumKitPreset: DrumKitPresetId = "jazz_vintage";

  // 1. Drums & Drum Bus Sub-Mixer
  private drumInputNode: GainNode | null = null;
  private drumFaderGain: GainNode | null = null;
  private drumAnalyser: AnalyserNode | null = null;

  private kickGainNode: GainNode | null = null;
  private snareGainNode: GainNode | null = null;
  private hihatGainNode: GainNode | null = null;
  private rideGainNode: GainNode | null = null;

  private kickPannerNode: StereoPannerNode | null = null;
  private snarePannerNode: StereoPannerNode | null = null;
  private hihatPannerNode: StereoPannerNode | null = null;
  private ridePannerNode: StereoPannerNode | null = null;

  private kickAnalyser: AnalyserNode | null = null;
  private snareAnalyser: AnalyserNode | null = null;
  private hihatAnalyser: AnalyserNode | null = null;
  private rideAnalyser: AnalyserNode | null = null;

  // 2. Bass Strip
  private bassInputNode: GainNode | null = null;
  private bassLowShelfFilter: BiquadFilterNode | null = null;
  private bassMidPeakFilter: BiquadFilterNode | null = null;
  private bassEQFilter: BiquadFilterNode | null = null;
  private bassPannerNode: StereoPannerNode | null = null;
  private bassFaderGain: GainNode | null = null;
  private bassAnalyser: AnalyserNode | null = null;

  // 3. Piano Strip
  private pianoInputNode: GainNode | null = null;
  private pianoHighpassEQ: BiquadFilterNode | null = null;
  private pianoPannerNode: StereoPannerNode | null = null;
  private pianoFaderGain: GainNode | null = null;
  private pianoAnalyser: AnalyserNode | null = null;

  // 4. Rhodes Strip
  private rhodesInputNode: GainNode | null = null;
  private rhodesHighpassEQ: BiquadFilterNode | null = null;
  private rhodesPannerNode: StereoPannerNode | null = null;
  private rhodesFaderGain: GainNode | null = null;
  private rhodesAnalyser: AnalyserNode | null = null;

  // 5. Guitar Strip
  private guitarInputNode: GainNode | null = null;
  private guitarHighpassEQ: BiquadFilterNode | null = null;
  private guitarBodyEQ: BiquadFilterNode | null = null;
  private guitarPannerNode: StereoPannerNode | null = null;
  private guitarFaderGain: GainNode | null = null;
  private guitarAnalyser: AnalyserNode | null = null;

  // 6. Studio Room Reverb Bus (Con Pre-Delay, High-Pass y Low-Pass cálido)
  private roomConvolverNode: ConvolverNode | null = null;
  private reverbSendBusGain: GainNode | null = null;
  private reverbHighpassFilter: BiquadFilterNode | null = null;
  private reverbFilter: BiquadFilterNode | null = null;
  private reverbReturnGain: GainNode | null = null;

  // Sample Buffers Cache por Kit de Batería
  private drumKitBuffers: Record<
    DrumKitPresetId,
    Map<DrumSampleName, AudioBuffer>
  > = {
    jazz_vintage: new Map(),
    studio_birch: new Map(),
    urban_808: new Map(),
  };

  // Bancos de Teclado
  private pianoBuffers: Map<number, AudioBuffer> = new Map();
  private brightPianoBuffers: Map<number, AudioBuffer> = new Map();
  private epianoBuffers: Map<number, AudioBuffer> = new Map();
  private fmEpianoBuffers: Map<number, AudioBuffer> = new Map();

  // Bancos de Guitarra (Solo las 2 Guitarras Acústicas HD)
  private steelGuitarBuffers: Map<number, AudioBuffer> = new Map();
  private nylonGuitarBuffers: Map<number, AudioBuffer> = new Map();

  // Bancos de Bajo
  private bassBuffers: Map<number, AudioBuffer> = new Map();
  private fingerBassBuffers: Map<number, AudioBuffer> = new Map();
  private pickedBassBuffers: Map<number, AudioBuffer> = new Map();
  private fretlessBassBuffers: Map<number, AudioBuffer> = new Map();

  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private activeHarmonyVoices: Set<ActiveVoiceRecord> = new Set();
  private activeBassVoices: Set<ActiveVoiceRecord> = new Set();
  private readonly MAX_HARMONY_POLYPHONY = 10;
  private isPreloadingSamples = false;
  private samplesReady = false;
  private lastRideScheduledTime = -1;

  private mixerState: MixerState = {
    drums: {
      volume: CHANNEL_NOMINAL_BASE_GAIN.drums,
      isMuted: false,
      isSolo: false,
    },
    drumPieces: {
      kick: { volume: 1.0, pan: 0.0, isMuted: false },
      snare: { volume: 1.0, pan: 0.0, isMuted: false },
      hihat: { volume: 1.0, pan: -0.3, isMuted: false },
      ride: { volume: 1.0, pan: 0.35, isMuted: false },
    },
    bass: {
      volume: CHANNEL_NOMINAL_BASE_GAIN.bass,
      pan: 0.0,
      isMuted: false,
      isSolo: false,
    },
    piano: {
      volume: CHANNEL_NOMINAL_BASE_GAIN.piano,
      pan: -0.15,
      isMuted: false,
      isSolo: false,
    },
    rhodes: {
      volume: CHANNEL_NOMINAL_BASE_GAIN.rhodes,
      pan: -0.15,
      isMuted: false,
      isSolo: false,
    },
    guitar: {
      volume: CHANNEL_NOMINAL_BASE_GAIN.guitar * Math.pow(65 / 85, 1.8),
      pan: -0.15,
      isMuted: false,
      isSolo: false,
    },
    masterVolume: 0.9,
    roomReverbWet: 0.38, // 38% por defecto para dar espacialidad y naturalidad de sala acústica
    metronomeActive: true,
    harmonyPreset: "grand_piano",
    bassPreset: "upright_bass",
    drumKitPreset: "jazz_vintage",
  };

  private listeners: Set<(state: MixerState) => void> = new Set();
  private externalSoloActive: boolean = false;

  public faderPctToGain(channel: MainMixerChannel, pct: number): number {
    const clampedPct = Math.max(0, Math.min(100, Number(pct) || 0));
    if (clampedPct <= 0.5) return 0;
    const base = CHANNEL_NOMINAL_BASE_GAIN[channel] ?? 0.7;
    const normalized = clampedPct / 85;
    return base * Math.pow(normalized, 1.8);
  }

  public setChannelVolumeFromPercent(
    channel: MainMixerChannel,
    pct: number
  ): void {
    if (!this.ctx) this.getAudioContext();
    const gainValue = this.faderPctToGain(channel, pct);
    if (channel === "piano" || channel === "guitar" || channel === "rhodes") {
      this.mixerState.piano.volume = this.faderPctToGain("piano", pct);
      this.mixerState.rhodes.volume = this.faderPctToGain("rhodes", pct);
      this.mixerState.guitar.volume = this.faderPctToGain("guitar", pct);
    } else {
      this.mixerState[channel].volume = gainValue;
    }
    this.applyEffectiveGains();
  }

  /**
   * Ajusta en tiempo real el porcentaje de Reverb Room (0 a 100%)
   */
  public setRoomReverbFromPercent(pct: number): void {
    if (!this.ctx) this.getAudioContext();
    const clampedPct = Math.max(0, Math.min(100, Number(pct) || 0));
    // Mapeo exponencial suave: 0% -> 0.0, 38% -> 0.38, 100% -> 1.15
    const wetGain =
      clampedPct <= 0.5 ? 0 : Math.pow(clampedPct / 100, 1.25) * 1.15;
    this.mixerState.roomReverbWet = clampedPct / 100;
    if (this.reverbReturnGain && this.ctx) {
      this.reverbReturnGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.reverbReturnGain.gain.setTargetAtTime(
        wetGain,
        this.ctx.currentTime,
        0.015
      );
    }
    this.notifyListeners();
  }

  public setHarmonyPreset(preset: HarmonyVoicePresetId): void {
    this.activeHarmonyPreset = preset;
    this.mixerState.harmonyPreset = preset;
    const found = HARMONY_VOICE_PRESETS.find((p) => p.id === preset);
    if (found?.category === "guitar") {
      this.lastGuitarPreset = preset;
    } else if (found?.category === "piano") {
      this.lastPianoPreset = preset;
    }
    this.notifyListeners();
  }

  public getHarmonyPreset(): HarmonyVoicePresetId {
    return this.activeHarmonyPreset;
  }

  public setBassPreset(preset: BassVoicePresetId): void {
    this.activeBassPreset = preset;
    this.mixerState.bassPreset = preset;
    this.applyBassCabinetEQ();
    this.notifyListeners();
  }

  public getBassPreset(): BassVoicePresetId {
    return this.activeBassPreset;
  }

  public setDrumKitPreset(kit: DrumKitPresetId): void {
    this.activeDrumKitPreset = kit;
    this.mixerState.drumKitPreset = kit;
    this.notifyListeners();
  }

  public getDrumKitPreset(): DrumKitPresetId {
    return this.activeDrumKitPreset;
  }

  private applyBassCabinetEQ(): void {
    if (!this.ctx || !this.bassLowShelfFilter || !this.bassMidPeakFilter) return;
    const now = this.ctx.currentTime;

    if (this.activeBassPreset === "j_style_finger") {
      this.bassLowShelfFilter.frequency.setTargetAtTime(95, now, 0.015);
      this.bassLowShelfFilter.gain.setTargetAtTime(2.2, now, 0.015);
      this.bassMidPeakFilter.frequency.setTargetAtTime(820, now, 0.015);
      this.bassMidPeakFilter.Q.setTargetAtTime(1.2, now, 0.015);
      this.bassMidPeakFilter.gain.setTargetAtTime(3.0, now, 0.015);
    } else if (this.activeBassPreset === "p_style_vintage") {
      this.bassLowShelfFilter.frequency.setTargetAtTime(105, now, 0.015);
      this.bassLowShelfFilter.gain.setTargetAtTime(3.0, now, 0.015);
      this.bassMidPeakFilter.frequency.setTargetAtTime(450, now, 0.015);
      this.bassMidPeakFilter.Q.setTargetAtTime(1.0, now, 0.015);
      this.bassMidPeakFilter.gain.setTargetAtTime(2.0, now, 0.015);
    } else if (this.activeBassPreset === "active_modern") {
      this.bassLowShelfFilter.frequency.setTargetAtTime(68, now, 0.015);
      this.bassLowShelfFilter.gain.setTargetAtTime(3.2, now, 0.015);
      this.bassMidPeakFilter.frequency.setTargetAtTime(1750, now, 0.015);
      this.bassMidPeakFilter.Q.setTargetAtTime(1.1, now, 0.015);
      this.bassMidPeakFilter.gain.setTargetAtTime(2.8, now, 0.015);
    } else if (this.activeBassPreset === "fretless_bass") {
      this.bassLowShelfFilter.frequency.setTargetAtTime(90, now, 0.015);
      this.bassLowShelfFilter.gain.setTargetAtTime(1.8, now, 0.015);
      this.bassMidPeakFilter.frequency.setTargetAtTime(560, now, 0.015);
      this.bassMidPeakFilter.Q.setTargetAtTime(1.5, now, 0.015);
      this.bassMidPeakFilter.gain.setTargetAtTime(3.5, now, 0.015);
    } else {
      this.bassLowShelfFilter.frequency.setTargetAtTime(110, now, 0.015);
      this.bassLowShelfFilter.gain.setTargetAtTime(1.8, now, 0.015);
      this.bassMidPeakFilter.frequency.setTargetAtTime(650, now, 0.015);
      this.bassMidPeakFilter.Q.setTargetAtTime(1.0, now, 0.015);
      this.bassMidPeakFilter.gain.setTargetAtTime(1.2, now, 0.015);
    }
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtxClass({ latencyHint: "interactive" });
      this.buildAudioGraph();
      this.preloadAllWavSamples();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public init(): AudioContext {
    return this.getAudioContext();
  }

  public getOrCreateMediaStreamDestination(): MediaStreamAudioDestinationNode {
    const ctx = this.getAudioContext();
    if (!this.mediaStreamDest) {
      this.mediaStreamDest = ctx.createMediaStreamDestination();
      if (this.masterAnalyser) {
        this.masterAnalyser.connect(this.mediaStreamDest);
      }
    }
    return this.mediaStreamDest;
  }

  private connectedMediaElements = new WeakSet<HTMLMediaElement>();

  public connectMediaElement(element: HTMLMediaElement): void {
    const ctx = this.getAudioContext();
    if (!this.connectedMediaElements.has(element)) {
      try {
        const source = ctx.createMediaElementSource(element);
        if (this.masterBusGain) {
          source.connect(this.masterBusGain);
          this.connectedMediaElements.add(element);
        }
      } catch {}
    }
  }

  /**
   * Genera una Respuesta al Impulso (IR) de Sala de Estudio Acústica (Studio Wood Room):
   * - Pre-delay de 14ms para mantener intacto el ataque de los instrumentos.
   * - Primeras reflexiones estéreo (Early Reflections) entre 18ms y 68ms que dan ancho y profundidad real.
   * - Cola difusa con absorción natural de altas frecuencias (damping progresivo).
   */
  private generateRoomImpulseResponse(
    durationSeconds = 1.85,
    decayRate = 3.1
  ): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const length = Math.floor(sampleRate * durationSeconds);
    const impulseBuffer = this.ctx!.createBuffer(2, length, sampleRate);
    const leftChannel = impulseBuffer.getChannelData(0);
    const rightChannel = impulseBuffer.getChannelData(1);

    const preDelaySamples = Math.floor(sampleRate * 0.014); // 14ms pre-delay

    // Primeras reflexiones de paredes de madera (tiempos en segundos y ganancias L/R)
    const earlyReflections = [
      { time: 0.018, gainL: 0.48, gainR: 0.32 },
      { time: 0.025, gainL: -0.34, gainR: 0.46 },
      { time: 0.033, gainL: 0.38, gainR: -0.28 },
      { time: 0.044, gainL: -0.25, gainR: 0.35 },
      { time: 0.056, gainL: 0.29, gainR: 0.22 },
      { time: 0.068, gainL: 0.2, gainR: -0.26 },
    ];

    for (const er of earlyReflections) {
      const idx = Math.floor(sampleRate * er.time);
      if (idx < length - 4) {
        leftChannel[idx] += er.gainL;
        rightChannel[idx] += er.gainR;
        leftChannel[idx + 1] += er.gainL * 0.5;
        rightChannel[idx + 1] += er.gainR * 0.5;
      }
    }

    // Cola difusa suavizada con filtro paso-bajos progresivo (absorción del aire/madera)
    let lpStateL = 0;
    let lpStateR = 0;

    for (let i = preDelaySamples; i < length; i++) {
      const t = (i - preDelaySamples) / (length - preDelaySamples);
      const attackEnv = Math.min(1.0, (i - preDelaySamples) / (sampleRate * 0.02));
      const decayEnv = Math.exp(-decayRate * t) * (1 - t * 0.1);
      const envelope = attackEnv * decayEnv;

      const rawNoiseL = (Math.random() * 2 - 1) * envelope * 0.65;
      const rawNoiseR = (Math.random() * 2 - 1) * envelope * 0.65;

      // Damping progresivo: cuanto más avanza la cola, más cálida y oscura se vuelve
      const dampingAlpha = Math.max(0.18, 0.72 - t * 0.45);
      lpStateL = lpStateL + dampingAlpha * (rawNoiseL - lpStateL);
      lpStateR = lpStateR + dampingAlpha * (rawNoiseR - lpStateR);

      leftChannel[i] += lpStateL;
      rightChannel[i] += lpStateR;
    }

    return impulseBuffer;
  }

  private createStudioDrumKitBuffers(ctx: BaseAudioContext): void {
    const rate = ctx.sampleRate;

    const makeBuffer = (
      durationSec: number,
      renderFn: (t: number, i: number, len: number) => [number, number]
    ): AudioBuffer => {
      const len = Math.floor(rate * durationSec);
      const buf = ctx.createBuffer(2, len, rate);
      const L = buf.getChannelData(0);
      const R = buf.getChannelData(1);
      for (let i = 0; i < len; i++) {
        const [lVal, rVal] = renderFn(i / rate, i, len);
        L[i] = Math.max(-0.98, Math.min(0.98, lVal));
        R[i] = Math.max(-0.98, Math.min(0.98, rVal));
      }
      return buf;
    };

    // KIT 2: STUDIO BIRCH PUNCH KIT
    const birchKick = makeBuffer(0.5, (t) => {
      const instPhase =
        2 * Math.PI * (56 * t + (110 / 40) * (1 - Math.exp(-t * 40)));
      const subBody = Math.sin(instPhase) * Math.exp(-t * 9.5);
      const punch2nd = Math.sin(instPhase * 2) * 0.28 * Math.exp(-t * 24);
      const beaterClick =
        Math.sin(2 * Math.PI * 3100 * t) * Math.exp(-t * 190) * 0.42 +
        (Math.random() * 2 - 1) * Math.exp(-t * 260) * 0.25;
      const val = Math.tanh((subBody * 1.2 + punch2nd + beaterClick) * 1.15);
      return [val, val];
    });

    const birchSnare = makeBuffer(0.42, (t) => {
      const shellPhase =
        2 * Math.PI * (195 * t + (60 / 55) * (1 - Math.exp(-t * 55)));
      const shellBody =
        (Math.sin(shellPhase) * 0.78 + Math.sin(shellPhase * 1.72) * 0.36) *
        Math.exp(-t * 19);
      const crack = (Math.random() * 2 - 1) * Math.exp(-t * 110) * 0.65;
      const wiresL = (Math.random() * 2 - 1) * Math.exp(-t * 13.5) * 0.58;
      const wiresR = (Math.random() * 2 - 1) * Math.exp(-t * 13.5) * 0.58;
      return [
        Math.tanh((shellBody + crack + wiresL) * 1.15),
        Math.tanh((shellBody + crack + wiresR) * 1.15),
      ];
    });

    const birchRim = makeBuffer(0.22, (t) => {
      const woodRes =
        (Math.sin(2 * Math.PI * 880 * t) * 0.6 +
          Math.sin(2 * Math.PI * 1760 * t) * 0.55 +
          Math.sin(2 * Math.PI * 2850 * t) * 0.35) *
        Math.exp(-t * 68);
      const stickClick = (Math.random() * 2 - 1) * Math.exp(-t * 280) * 0.45;
      const val = Math.tanh((woodRes + stickClick) * 1.2);
      return [val, val];
    });

    const birchHihatClosed = makeBuffer(0.16, (t) => {
      const metallic =
        Math.sin(2 * Math.PI * 6420 * t) * 0.32 +
        Math.sin(2 * Math.PI * 8190 * t) * 0.3 +
        Math.sin(2 * Math.PI * 10540 * t) * 0.28 +
        Math.sin(2 * Math.PI * 13200 * t) * 0.2;
      const sizzleL = (Math.random() * 2 - 1) * 0.65 + metallic;
      const sizzleR = (Math.random() * 2 - 1) * 0.65 - metallic * 0.8;
      const env = Math.exp(-t * 58);
      return [sizzleL * env * 0.85, sizzleR * env * 0.85];
    });

    const birchHihatOpen = makeBuffer(0.65, (t) => {
      const metallic =
        Math.sin(2 * Math.PI * 6420 * t) * 0.3 +
        Math.sin(2 * Math.PI * 8190 * t) * 0.28 +
        Math.sin(2 * Math.PI * 10540 * t) * 0.25;
      const sizzleL = (Math.random() * 2 - 1) * 0.6 + metallic;
      const sizzleR = (Math.random() * 2 - 1) * 0.6 - metallic * 0.8;
      const env = Math.exp(-t * 6.8);
      return [sizzleL * env * 0.82, sizzleR * env * 0.82];
    });

    const birchRide = makeBuffer(1.8, (t) => {
      const ping = Math.sin(2 * Math.PI * 3850 * t) * Math.exp(-t * 55) * 0.48;
      const bell =
        (Math.sin(2 * Math.PI * 2240 * t) * 0.28 +
          Math.sin(2 * Math.PI * 3190 * t) * 0.26 +
          Math.sin(2 * Math.PI * 5120 * t) * 0.32 +
          Math.sin(2 * Math.PI * 7840 * t) * 0.22) *
        Math.exp(-t * 2.4);
      const washL = (Math.random() * 2 - 1) * Math.exp(-t * 2.1) * 0.22;
      const washR = (Math.random() * 2 - 1) * Math.exp(-t * 2.1) * 0.22;
      return [(ping + bell + washL) * 0.88, (ping + bell + washR) * 0.88];
    });

    this.drumKitBuffers.studio_birch.set("kick", birchKick);
    this.drumKitBuffers.studio_birch.set("snare", birchSnare);
    this.drumKitBuffers.studio_birch.set("rim", birchRim);
    this.drumKitBuffers.studio_birch.set("hihat", birchHihatClosed);
    this.drumKitBuffers.studio_birch.set("hihat_closed", birchHihatClosed);
    this.drumKitBuffers.studio_birch.set("hihat_open", birchHihatOpen);
    this.drumKitBuffers.studio_birch.set("ride", birchRide);

    // KIT 3: URBAN DEMBOW KIT (Bombo seco y firme sin retumbe subgrave)
    const urbanKick = makeBuffer(0.24, (t) => {
      const phaseUrban =
        2 * Math.PI * (62 * t + (110 / 55) * (1 - Math.exp(-t * 55)));
      const tightBody = Math.sin(phaseUrban) * Math.exp(-t * 18.0);
      const midPunch =
        Math.sin(2 * Math.PI * 135 * t) * Math.exp(-t * 42.0) * 0.32;
      const transient =
        Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 260) * 0.38;
      const val = Math.tanh((tightBody * 0.92 + midPunch + transient) * 1.05);
      return [val, val];
    });

    const urbanSnare = makeBuffer(0.26, (t) => {
      const dembowTone =
        (Math.sin(2 * Math.PI * 245 * t) * 0.8 +
          Math.sin(2 * Math.PI * 420 * t) * 0.4) *
        Math.exp(-t * 34);
      const clapBurst =
        (Math.random() * 2 - 1) *
        (t < 0.012 ? 0.85 : Math.exp(-(t - 0.012) * 30)) *
        0.7;
      const val = Math.tanh((dembowTone + clapBurst) * 1.15);
      return [val, val];
    });

    const urbanRim = makeBuffer(0.18, (t) => {
      const rimTone =
        (Math.sin(2 * Math.PI * 1150 * t) * 0.7 +
          Math.sin(2 * Math.PI * 2300 * t) * 0.45) *
        Math.exp(-t * 85);
      const click = (Math.random() * 2 - 1) * Math.exp(-t * 320) * 0.4;
      return [rimTone + click, rimTone + click];
    });

    const urbanHihat = makeBuffer(0.1, (t) => {
      const metal =
        Math.sin(2 * Math.PI * 7800 * t) * 0.35 +
        Math.sin(2 * Math.PI * 11200 * t) * 0.35;
      const noise = (Math.random() * 2 - 1) * 0.65;
      const env = Math.exp(-t * 95);
      return [(metal + noise) * env * 0.8, (metal - noise) * env * 0.8];
    });

    this.drumKitBuffers.urban_808.set("kick", urbanKick);
    this.drumKitBuffers.urban_808.set("snare", urbanSnare);
    this.drumKitBuffers.urban_808.set("rim", urbanRim);
    this.drumKitBuffers.urban_808.set("hihat", urbanHihat);
    this.drumKitBuffers.urban_808.set("hihat_closed", urbanHihat);
    this.drumKitBuffers.urban_808.set("hihat_open", birchHihatOpen);
    this.drumKitBuffers.urban_808.set("ride", birchRide);
  }

  private buildAudioGraph(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.masterBusGain = this.ctx.createGain();
    this.masterBusGain.gain.setValueAtTime(this.mixerState.masterVolume, now);

    this.styleGainNode = this.ctx.createGain();
    this.styleGainNode.gain.setValueAtTime(
      this.currentStyleGainMultiplier,
      now
    );

    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-3.0, now);
    this.masterCompressor.knee.setValueAtTime(6, now);
    this.masterCompressor.ratio.setValueAtTime(12, now);
    this.masterCompressor.attack.setValueAtTime(0.002, now);
    this.masterCompressor.release.setValueAtTime(0.12, now);
    this.brickwallLimiter = this.masterCompressor;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 1024;

    this.masterBusGain.connect(this.styleGainNode);
    this.styleGainNode.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.masterCompressor);
    this.masterCompressor.connect(this.ctx.destination);
    if (this.mediaStreamDest) {
      try {
        this.masterCompressor.connect(this.mediaStreamDest);
      } catch {}
    }

    // DRUMS STRIP
    this.drumInputNode = this.ctx.createGain();
    this.drumInputNode.gain.setValueAtTime(1.0, now);

    this.drumFaderGain = this.ctx.createGain();
    this.drumFaderGain.gain.setValueAtTime(this.mixerState.drums.volume, now);

    this.drumAnalyser = this.ctx.createAnalyser();
    this.drumAnalyser.fftSize = 256;

    this.kickGainNode = this.ctx.createGain();
    this.kickGainNode.gain.setValueAtTime(
      this.mixerState.drumPieces.kick.isMuted
        ? 0
        : this.mixerState.drumPieces.kick.volume,
      now
    );
    this.kickPannerNode = this.ctx.createStereoPanner();
    this.kickPannerNode.pan.setValueAtTime(
      this.mixerState.drumPieces.kick.pan ?? 0.0,
      now
    );
    this.kickPannerNode.connect(this.kickGainNode);

    this.snareGainNode = this.ctx.createGain();
    this.snareGainNode.gain.setValueAtTime(
      this.mixerState.drumPieces.snare.isMuted
        ? 0
        : this.mixerState.drumPieces.snare.volume,
      now
    );
    this.snarePannerNode = this.ctx.createStereoPanner();
    this.snarePannerNode.pan.setValueAtTime(
      this.mixerState.drumPieces.snare.pan ?? 0.0,
      now
    );
    this.snarePannerNode.connect(this.snareGainNode);

    this.hihatGainNode = this.ctx.createGain();
    this.hihatGainNode.gain.setValueAtTime(
      this.mixerState.drumPieces.hihat.isMuted
        ? 0
        : this.mixerState.drumPieces.hihat.volume,
      now
    );
    this.hihatPannerNode = this.ctx.createStereoPanner();
    this.hihatPannerNode.pan.setValueAtTime(
      this.mixerState.drumPieces.hihat.pan ?? -0.3,
      now
    );
    this.hihatPannerNode.connect(this.hihatGainNode);

    this.rideGainNode = this.ctx.createGain();
    this.rideGainNode.gain.setValueAtTime(
      this.mixerState.drumPieces.ride.isMuted
        ? 0
        : this.mixerState.drumPieces.ride.volume,
      now
    );
    this.ridePannerNode = this.ctx.createStereoPanner();
    this.ridePannerNode.pan.setValueAtTime(
      this.mixerState.drumPieces.ride.pan ?? 0.35,
      now
    );
    this.ridePannerNode.connect(this.rideGainNode);

    this.kickAnalyser = this.ctx.createAnalyser();
    this.kickAnalyser.fftSize = 128;
    this.snareAnalyser = this.ctx.createAnalyser();
    this.snareAnalyser.fftSize = 128;
    this.hihatAnalyser = this.ctx.createAnalyser();
    this.hihatAnalyser.fftSize = 128;
    this.rideAnalyser = this.ctx.createAnalyser();
    this.rideAnalyser.fftSize = 128;

    this.kickGainNode.connect(this.kickAnalyser);
    this.kickAnalyser.connect(this.drumInputNode);

    this.snareGainNode.connect(this.snareAnalyser);
    this.snareAnalyser.connect(this.drumInputNode);

    this.hihatGainNode.connect(this.hihatAnalyser);
    this.hihatAnalyser.connect(this.drumInputNode);

    this.rideGainNode.connect(this.rideAnalyser);
    this.rideAnalyser.connect(this.drumInputNode);

    this.drumInputNode.connect(this.drumFaderGain);
    this.drumFaderGain.connect(this.drumAnalyser);
    this.drumAnalyser.connect(this.masterBusGain);

    // BASS STRIP
    this.bassInputNode = this.ctx.createGain();
    this.bassInputNode.gain.setValueAtTime(1.0, now);

    this.bassLowShelfFilter = this.ctx.createBiquadFilter();
    this.bassLowShelfFilter.type = "lowshelf";

    this.bassMidPeakFilter = this.ctx.createBiquadFilter();
    this.bassMidPeakFilter.type = "peaking";

    this.bassEQFilter = this.ctx.createBiquadFilter();
    this.bassEQFilter.type = "lowpass";
    this.bassEQFilter.frequency.setValueAtTime(2600, now);
    this.bassEQFilter.Q.setValueAtTime(0.707, now);

    this.bassPannerNode = this.ctx.createStereoPanner();
    this.bassPannerNode.pan.setValueAtTime(
      this.mixerState.bass.pan ?? 0.0,
      now
    );

    this.bassFaderGain = this.ctx.createGain();
    this.bassFaderGain.gain.setValueAtTime(this.mixerState.bass.volume, now);

    this.bassAnalyser = this.ctx.createAnalyser();
    this.bassAnalyser.fftSize = 256;

    this.bassInputNode.connect(this.bassLowShelfFilter);
    this.bassLowShelfFilter.connect(this.bassMidPeakFilter);
    this.bassMidPeakFilter.connect(this.bassEQFilter);
    this.bassEQFilter.connect(this.bassPannerNode);
    this.bassPannerNode.connect(this.bassFaderGain);
    this.bassFaderGain.connect(this.bassAnalyser);
    this.bassAnalyser.connect(this.masterBusGain);

    this.applyBassCabinetEQ();

    // PIANO STRIP
    this.pianoInputNode = this.ctx.createGain();
    this.pianoInputNode.gain.setValueAtTime(1.0, now);

    this.pianoHighpassEQ = this.ctx.createBiquadFilter();
    this.pianoHighpassEQ.type = "highpass";
    this.pianoHighpassEQ.frequency.setValueAtTime(135, now);
    this.pianoHighpassEQ.Q.setValueAtTime(0.707, now);

    this.pianoPannerNode = this.ctx.createStereoPanner();
    this.pianoPannerNode.pan.setValueAtTime(
      this.mixerState.piano.pan ?? -0.15,
      now
    );

    this.pianoFaderGain = this.ctx.createGain();
    this.pianoFaderGain.gain.setValueAtTime(this.mixerState.piano.volume, now);

    this.pianoAnalyser = this.ctx.createAnalyser();
    this.pianoAnalyser.fftSize = 256;

    this.pianoInputNode.connect(this.pianoHighpassEQ);
    this.pianoHighpassEQ.connect(this.pianoPannerNode);
    this.pianoPannerNode.connect(this.pianoFaderGain);
    this.pianoFaderGain.connect(this.pianoAnalyser);
    this.pianoAnalyser.connect(this.masterBusGain);

    // RHODES STRIP
    this.rhodesInputNode = this.ctx.createGain();
    this.rhodesInputNode.gain.setValueAtTime(1.0, now);

    this.rhodesHighpassEQ = this.ctx.createBiquadFilter();
    this.rhodesHighpassEQ.type = "highpass";
    this.rhodesHighpassEQ.frequency.setValueAtTime(135, now);
    this.rhodesHighpassEQ.Q.setValueAtTime(0.707, now);

    this.rhodesPannerNode = this.ctx.createStereoPanner();
    this.rhodesPannerNode.pan.setValueAtTime(
      this.mixerState.rhodes.pan ?? -0.15,
      now
    );

    this.rhodesFaderGain = this.ctx.createGain();
    this.rhodesFaderGain.gain.setValueAtTime(this.mixerState.rhodes.volume, now);

    this.rhodesAnalyser = this.ctx.createAnalyser();
    this.rhodesAnalyser.fftSize = 256;

    this.rhodesInputNode.connect(this.rhodesHighpassEQ);
    this.rhodesHighpassEQ.connect(this.rhodesPannerNode);
    this.rhodesPannerNode.connect(this.rhodesFaderGain);
    this.rhodesFaderGain.connect(this.rhodesAnalyser);
    this.rhodesAnalyser.connect(this.masterBusGain);

    // GUITAR STRIP
    this.guitarInputNode = this.ctx.createGain();
    this.guitarInputNode.gain.setValueAtTime(1.0, now);

    this.guitarHighpassEQ = this.ctx.createBiquadFilter();
    this.guitarHighpassEQ.type = "highpass";
    this.guitarHighpassEQ.frequency.setValueAtTime(130, now);
    this.guitarHighpassEQ.Q.setValueAtTime(0.707, now);

    this.guitarBodyEQ = this.ctx.createBiquadFilter();
    this.guitarBodyEQ.type = "peaking";
    this.guitarBodyEQ.frequency.setValueAtTime(2400, now);
    this.guitarBodyEQ.Q.setValueAtTime(1.1, now);
    this.guitarBodyEQ.gain.setValueAtTime(2.0, now);

    this.guitarPannerNode = this.ctx.createStereoPanner();
    this.guitarPannerNode.pan.setValueAtTime(
      this.mixerState.guitar.pan ?? -0.15,
      now
    );

    this.guitarFaderGain = this.ctx.createGain();
    this.guitarFaderGain.gain.setValueAtTime(this.mixerState.guitar.volume, now);

    this.guitarAnalyser = this.ctx.createAnalyser();
    this.guitarAnalyser.fftSize = 256;

    this.guitarInputNode.connect(this.guitarHighpassEQ);
    this.guitarHighpassEQ.connect(this.guitarBodyEQ);
    this.guitarBodyEQ.connect(this.guitarPannerNode);
    this.guitarPannerNode.connect(this.guitarFaderGain);
    this.guitarFaderGain.connect(this.guitarAnalyser);
    this.guitarAnalyser.connect(this.masterBusGain);

    // =========================================================================
    // STUDIO ROOM REVERB BUS (Con filtrado Abbey Road HPF 190Hz + LPF 4800Hz)
    // =========================================================================
    this.roomConvolverNode = this.ctx.createConvolver();
    this.roomConvolverNode.buffer = this.generateRoomImpulseResponse(1.85, 3.1);

    this.reverbSendBusGain = this.ctx.createGain();
    this.reverbSendBusGain.gain.setValueAtTime(1.0, now);

    // Filtro High-Pass a 190Hz para que los graves del bombo y bajo no retumben en la sala
    this.reverbHighpassFilter = this.ctx.createBiquadFilter();
    this.reverbHighpassFilter.type = "highpass";
    this.reverbHighpassFilter.frequency.setValueAtTime(190, now);
    this.reverbHighpassFilter.Q.setValueAtTime(0.707, now);

    // Filtro Low-Pass a 4800Hz para una cola cálida y natural de estudio
    this.reverbFilter = this.ctx.createBiquadFilter();
    this.reverbFilter.type = "lowpass";
    this.reverbFilter.frequency.setValueAtTime(4800, now);
    this.reverbFilter.Q.setValueAtTime(0.707, now);

    this.reverbReturnGain = this.ctx.createGain();
    const initialReverbWet = this.mixerState.roomReverbWet ?? 0.38;
    const initialWetGain = Math.pow(initialReverbWet, 1.25) * 1.15;
    this.reverbReturnGain.gain.setValueAtTime(initialWetGain, now);

    this.reverbSendBusGain.connect(this.reverbHighpassFilter);
    this.reverbHighpassFilter.connect(this.roomConvolverNode);
    this.roomConvolverNode.connect(this.reverbFilter);
    this.reverbFilter.connect(this.reverbReturnGain);
    this.reverbReturnGain.connect(this.masterBusGain);

    // Envíos Post-Fader de cada instrumento hacia la Reverb Room
    if (this.drumFaderGain) {
      const drumReverbSend = this.ctx.createGain();
      drumReverbSend.gain.setValueAtTime(0.35, now);
      this.drumFaderGain.connect(drumReverbSend);
      drumReverbSend.connect(this.reverbSendBusGain);
    }

    if (this.bassFaderGain) {
      // Envío sutil del bajo (el HPF de 190Hz solo deja pasar la madera/cuerdas a la sala sin ensuciar el subgrave)
      const bassReverbSend = this.ctx.createGain();
      bassReverbSend.gain.setValueAtTime(0.14, now);
      this.bassFaderGain.connect(bassReverbSend);
      bassReverbSend.connect(this.reverbSendBusGain);
    }

    if (this.pianoFaderGain) {
      const pianoReverbSend = this.ctx.createGain();
      pianoReverbSend.gain.setValueAtTime(0.45, now);
      this.pianoFaderGain.connect(pianoReverbSend);
      pianoReverbSend.connect(this.reverbSendBusGain);
    }

    if (this.rhodesFaderGain) {
      const rhodesReverbSend = this.ctx.createGain();
      rhodesReverbSend.gain.setValueAtTime(0.42, now);
      this.rhodesFaderGain.connect(rhodesReverbSend);
      rhodesReverbSend.connect(this.reverbSendBusGain);
    }

    if (this.guitarFaderGain) {
      const guitarReverbSend = this.ctx.createGain();
      guitarReverbSend.gain.setValueAtTime(0.46, now);
      this.guitarFaderGain.connect(guitarReverbSend);
      guitarReverbSend.connect(this.reverbSendBusGain);
    }

    this.applyEffectiveGains();
    this.preloadAllWavSamples().catch(() => {});
  }

  private normalizeSampleBuffer(
    buffer: AudioBuffer,
    targetRms: number = 0.2,
    maxAllowedPeak: number = 0.86
  ): AudioBuffer {
    const rate = buffer.sampleRate;
    const ch0 = buffer.getChannelData(0);

    let startIdx = 0;
    for (let i = 0; i < ch0.length; i++) {
      if (Math.abs(ch0[i]) > 0.008) {
        startIdx = i;
        break;
      }
    }

    const windowLength = Math.min(
      ch0.length - startIdx,
      Math.floor(rate * 0.6)
    );
    if (windowLength <= 100) return buffer;

    let sumSquares = 0;
    let totalSamples = 0;
    let currentPeak = 0;

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const abs = Math.abs(data[i]);
        if (abs > currentPeak) currentPeak = abs;
        if (i >= startIdx && i < startIdx + windowLength) {
          sumSquares += data[i] * data[i];
          totalSamples++;
        }
      }
    }

    const rms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
    if (rms < 0.0005 || currentPeak < 0.0005) return buffer;

    let gainFactor = Math.min(4.5, Math.max(0.25, targetRms / rms));
    if (currentPeak * gainFactor > maxAllowedPeak) {
      gainFactor = maxAllowedPeak / currentPeak;
    }

    const fadeInSamples = Math.min(128, Math.floor(rate * 0.003));
    const fadeOutSamples = Math.min(512, Math.floor(rate * 0.01));

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      const len = data.length;
      for (let i = 0; i < len; i++) {
        let env = 1.0;
        if (i < fadeInSamples) {
          env = i / fadeInSamples;
        } else if (i > len - fadeOutSamples) {
          env = (len - i) / fadeOutSamples;
        }
        data[i] = data[i] * gainFactor * env;
      }
    }

    return buffer;
  }

  private preloadPromise: Promise<void> | null = null;
  private decodeCtx: BaseAudioContext | null = null;

  private getDecodeContext(): BaseAudioContext {
    if (this.ctx) return this.ctx;
    if (!this.decodeCtx) {
      const OfflineCtx =
        window.OfflineAudioContext ||
        (window as any).webkitOfflineAudioContext;
      this.decodeCtx = OfflineCtx
        ? new OfflineCtx(2, 1, 44100)
        : this.getAudioContext();
    }
    return this.decodeCtx!;
  }

  private async fetchAndDecodeRealSample(
    ctx: BaseAudioContext,
    urls: string[],
    targetRms?: number,
    maxPeak?: number
  ): Promise<AudioBuffer | null> {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arrayBuf = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        if (decoded && decoded.length > 0) {
          return targetRms
            ? this.normalizeSampleBuffer(decoded, targetRms, maxPeak || 0.86)
            : decoded;
        }
      } catch {}
    }
    return null;
  }

  public async preloadAllWavSamples(): Promise<void> {
    if (
      this.samplesReady &&
      this.pianoBuffers.size > 0 &&
      this.bassBuffers.size > 0 &&
      this.steelGuitarBuffers.size > 0
    ) {
      return;
    }
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.isPreloadingSamples = true;
    this.preloadPromise = (async () => {
      const ctx = this.getDecodeContext();

      this.createStudioDrumKitBuffers(ctx);

      const jazzDrumMap: Record<DrumSampleName, string[]> = {
        kick: [
          "/audio/drumjazz/jazz-drum-kit-kick_G_minor.wav",
          "/audio/drums/kick.wav",
        ],
        snare: [
          "/audio/drumjazz/jazz-drum-kit-punchy-snare_G_minor.wav",
          "/audio/drums/snare.wav",
        ],
        hihat: [
          "/audio/drumjazz/jazz-drum-kit-closed-hi-hat_F_minor.wav",
          "/audio/drums/hihat_closed.wav",
          "/audio/drums/hihat.wav",
        ],
        hihat_closed: [
          "/audio/drumjazz/jazz-drum-kit-closed-hi-hat_F_minor.wav",
          "/audio/drums/hihat_closed.wav",
        ],
        hihat_open: ["/audio/drums/hihat_open.wav", "/audio/drums/hihat.wav"],
        ride: [
          "/audio/drumjazz/jazz-drum-kit-ride-2.wav",
          "/audio/drums/ride.wav",
        ],
        rim: [
          "/audio/drumjazz/jazz-drum-kit-rim_C_minor.wav",
          "/audio/drums/rim.wav",
        ],
      };

      const drumPromises = Object.entries(jazzDrumMap).map(
        async ([key, urls]) => {
          const sampleKey = key as DrumSampleName;
          const audioBuf = await this.fetchAndDecodeRealSample(ctx, urls);
          if (audioBuf) {
            this.drumKitBuffers.jazz_vintage.set(sampleKey, audioBuf);
            if (sampleKey === "ride" || sampleKey === "hihat_open") {
              this.drumKitBuffers.studio_birch.set(sampleKey, audioBuf);
            }
          }
        }
      );

      const studioDrumOptionalMap: Partial<Record<DrumSampleName, string[]>> = {
        kick: ["/audio/drums/kick.wav"],
        snare: ["/audio/drums/snare.wav"],
        hihat_closed: ["/audio/drums/hihat_closed.wav"],
        rim: ["/audio/drums/rim.wav"],
      };
      const studioOptionalPromises = Object.entries(studioDrumOptionalMap).map(
        async ([key, urls]) => {
          if (!urls) return;
          const sampleKey = key as DrumSampleName;
          const audioBuf = await this.fetchAndDecodeRealSample(
            ctx,
            urls,
            0.26,
            0.92
          );
          if (audioBuf) {
            this.drumKitBuffers.studio_birch.set(sampleKey, audioBuf);
            if (sampleKey === "hihat_closed") {
              this.drumKitBuffers.studio_birch.set("hihat", audioBuf);
            }
          }
        }
      );

      const keyboardAnchors = [
        { note: "C3", midi: 48 },
        { note: "Eb3", midi: 51 },
        { note: "Gb3", midi: 54 },
        { note: "A3", midi: 57 },
        { note: "C4", midi: 60 },
        { note: "Eb4", midi: 63 },
        { note: "Gb4", midi: 66 },
        { note: "A4", midi: 69 },
        { note: "C5", midi: 72 },
        { note: "Eb5", midi: 75 },
        { note: "Gb5", midi: 78 },
        { note: "A5", midi: 81 },
      ];

      // 2. GRAND PIANO HD (Salamander)
      const pianoPromises = PIANO_ANCHOR_URLS.map(
        async ({ midi, note, url }) => {
          const audioBuf = await this.fetchAndDecodeRealSample(
            ctx,
            [
              url,
              `${MUSYNG_CDN}/acoustic_grand_piano-mp3/${note}.mp3`,
              `${FLUID_CDN}/acoustic_grand_piano-mp3/${note}.mp3`,
            ],
            0.17,
            0.78
          );
          if (audioBuf) {
            this.pianoBuffers.set(midi, audioBuf);
          }
        }
      );

      // 3. BRIGHT STUDIO PIANO & VINTAGE TINE EP & FM CRYSTAL EP
      const extraKeysPromises = keyboardAnchors.map(async ({ note, midi }) => {
        const [brightBuf, rhodesBuf, fmBuf] = await Promise.all([
          this.fetchAndDecodeRealSample(
            ctx,
            [
              `${MUSYNG_CDN}/bright_acoustic_piano-mp3/${note}.mp3`,
              `${FLUID_CDN}/bright_acoustic_piano-mp3/${note}.mp3`,
            ],
            0.2,
            0.84
          ),
          this.fetchAndDecodeRealSample(
            ctx,
            [
              `${MUSYNG_CDN}/electric_piano_1-mp3/${note}.mp3`,
              `${FLUID_CDN}/electric_piano_1-mp3/${note}.mp3`,
            ],
            0.21,
            0.86
          ),
          this.fetchAndDecodeRealSample(
            ctx,
            [
              `${MUSYNG_CDN}/electric_piano_2-mp3/${note}.mp3`,
              `${FLUID_CDN}/electric_piano_2-mp3/${note}.mp3`,
            ],
            0.21,
            0.86
          ),
        ]);
        if (brightBuf) this.brightPianoBuffers.set(midi, brightBuf);
        if (rhodesBuf) this.epianoBuffers.set(midi, rhodesBuf);
        if (fmBuf) this.fmEpianoBuffers.set(midi, fmBuf);
      });

      // 4. BANCOS DE BAJO HD
      const bassAnchors = [
        { note: "E1", midi: 28 },
        { note: "F1", midi: 29 },
        { note: "G1", midi: 31 },
        { note: "Ab1", midi: 32 },
        { note: "A1", midi: 33 },
        { note: "Bb1", midi: 34 },
        { note: "B1", midi: 35 },
        { note: "C2", midi: 36 },
        { note: "Db2", midi: 37 },
        { note: "D2", midi: 38 },
        { note: "Eb2", midi: 39 },
        { note: "E2", midi: 40 },
        { note: "F2", midi: 41 },
        { note: "Gb2", midi: 42 },
        { note: "G2", midi: 43 },
        { note: "Ab2", midi: 44 },
        { note: "A2", midi: 45 },
        { note: "Bb2", midi: 46 },
        { note: "B2", midi: 47 },
        { note: "C3", midi: 48 },
        { note: "D3", midi: 50 },
        { note: "Eb3", midi: 51 },
        { note: "E3", midi: 52 },
        { note: "G3", midi: 55 },
      ];

      const bassPromises = bassAnchors.map(async ({ note, midi }) => {
        const [uprightBuf, fingerBuf, pickedBuf, fretlessBuf] =
          await Promise.all([
            this.fetchAndDecodeRealSample(
              ctx,
              [
                `${MUSYNG_CDN}/acoustic_bass-mp3/${note}.mp3`,
                `${FLUID_CDN}/acoustic_bass-mp3/${note}.mp3`,
              ],
              0.16,
              0.72
            ),
            this.fetchAndDecodeRealSample(
              ctx,
              [
                `${MUSYNG_CDN}/electric_bass_finger-mp3/${note}.mp3`,
                `${FLUID_CDN}/electric_bass_finger-mp3/${note}.mp3`,
              ],
              0.16,
              0.72
            ),
            this.fetchAndDecodeRealSample(
              ctx,
              [
                `${MUSYNG_CDN}/electric_bass_pick-mp3/${note}.mp3`,
                `${FLUID_CDN}/electric_bass_pick-mp3/${note}.mp3`,
              ],
              0.16,
              0.72
            ),
            this.fetchAndDecodeRealSample(
              ctx,
              [
                `${MUSYNG_CDN}/fretless_bass-mp3/${note}.mp3`,
                `${FLUID_CDN}/fretless_bass-mp3/${note}.mp3`,
              ],
              0.16,
              0.72
            ),
          ]);
        if (uprightBuf) this.bassBuffers.set(midi, uprightBuf);
        if (fingerBuf) this.fingerBassBuffers.set(midi, fingerBuf);
        if (pickedBuf) this.pickedBassBuffers.set(midi, pickedBuf);
        if (fretlessBuf) this.fretlessBassBuffers.set(midi, fretlessBuf);
      });

      // 5. SOLO LAS 2 GUITARRAS ACÚSTICAS HD
      const guitarAnchors = [
        { note: "E2", midi: 40 },
        { note: "A2", midi: 45 },
        { note: "D3", midi: 50 },
        { note: "G3", midi: 55 },
        { note: "B3", midi: 59 },
        { note: "E4", midi: 64 },
        { note: "A4", midi: 69 },
        { note: "C5", midi: 72 },
      ];

      const guitarPromises = guitarAnchors.map(async ({ note, midi }) => {
        const [steelBuf, nylonBuf] = await Promise.all([
          this.fetchAndDecodeRealSample(
            ctx,
            [
              `${MUSYNG_CDN}/acoustic_guitar_steel-mp3/${note}.mp3`,
              `${FLUID_CDN}/acoustic_guitar_steel-mp3/${note}.mp3`,
            ],
            0.16,
            0.74
          ),
          this.fetchAndDecodeRealSample(
            ctx,
            [
              `${MUSYNG_CDN}/acoustic_guitar_nylon-mp3/${note}.mp3`,
              `${FLUID_CDN}/acoustic_guitar_nylon-mp3/${note}.mp3`,
            ],
            0.16,
            0.74
          ),
        ]);
        if (steelBuf) this.steelGuitarBuffers.set(midi, steelBuf);
        if (nylonBuf) this.nylonGuitarBuffers.set(midi, nylonBuf);
      });

      await Promise.allSettled([
        ...drumPromises,
        ...studioOptionalPromises,
        ...pianoPromises,
        ...extraKeysPromises,
        ...bassPromises,
        ...guitarPromises,
      ]);

      this.samplesReady = true;
      this.isPreloadingSamples = false;
    })();

    return this.preloadPromise;
  }

  private getActiveDrumBuffer(instrument: DrumSampleName): AudioBuffer | undefined {
    const kitMap =
      this.drumKitBuffers[this.activeDrumKitPreset] ||
      this.drumKitBuffers.jazz_vintage;

    let buf = kitMap.get(instrument);
    if (!buf && (instrument === "hihat" || instrument === "hihat_closed")) {
      buf = kitMap.get("hihat_closed") || kitMap.get("hihat");
    }
    if (!buf) {
      buf =
        this.drumKitBuffers.jazz_vintage.get(instrument) ||
        this.drumKitBuffers.studio_birch.get(instrument);
    }
    return buf;
  }

  private getActiveBassBufferMap(): Map<number, AudioBuffer> {
    if (
      this.activeBassPreset === "j_style_finger" &&
      this.fingerBassBuffers.size > 0
    ) {
      return this.fingerBassBuffers;
    }
    if (
      (this.activeBassPreset === "p_style_vintage" ||
        this.activeBassPreset === "active_modern") &&
      this.pickedBassBuffers.size > 0
    ) {
      return this.pickedBassBuffers;
    }
    if (
      this.activeBassPreset === "fretless_bass" &&
      this.fretlessBassBuffers.size > 0
    ) {
      return this.fretlessBassBuffers;
    }
    return this.bassBuffers;
  }

  private getActiveHarmonyBufferMap(
    fallbackInstrument: HarmonicInstrumentType
  ): Map<number, AudioBuffer> {
    if (fallbackInstrument === "guitar") {
      const gPreset =
        this.activeHarmonyPreset === "acoustic_steel" ||
        this.activeHarmonyPreset === "nylon_concert"
          ? this.activeHarmonyPreset
          : this.lastGuitarPreset;

      if (gPreset === "nylon_concert" && this.nylonGuitarBuffers.size > 0) {
        return this.nylonGuitarBuffers;
      }
      if (this.steelGuitarBuffers.size > 0) {
        return this.steelGuitarBuffers;
      }
      return this.nylonGuitarBuffers;
    }

    const pPreset =
      this.activeHarmonyPreset === "grand_piano" ||
      this.activeHarmonyPreset === "korg_bright" ||
      this.activeHarmonyPreset === "roland_stage" ||
      this.activeHarmonyPreset === "rhodes" ||
      this.activeHarmonyPreset === "electric_piano"
        ? this.activeHarmonyPreset
        : this.lastPianoPreset;

    if (pPreset === "korg_bright" && this.brightPianoBuffers.size > 0) {
      return this.brightPianoBuffers;
    }
    if (pPreset === "rhodes" && this.epianoBuffers.size > 0) {
      return this.epianoBuffers;
    }
    if (pPreset === "electric_piano" && this.fmEpianoBuffers.size > 0) {
      return this.fmEpianoBuffers;
    }
    return this.pianoBuffers;
  }

  public async getBuffersForOfflineRender(): Promise<{
    drums: Record<DrumSampleName, AudioBuffer>;
    bass: Record<number, AudioBuffer>;
    piano: Record<number, AudioBuffer>;
    guitar: Record<number, AudioBuffer>;
    epiano: Record<number, AudioBuffer>;
  }> {
    await this.preloadAllWavSamples();

    const drumNames: DrumSampleName[] = [
      "kick",
      "snare",
      "hihat",
      "hihat_closed",
      "hihat_open",
      "ride",
      "rim",
    ];
    const drums = {} as Record<DrumSampleName, AudioBuffer>;
    for (const name of drumNames) {
      const buf = this.getActiveDrumBuffer(name);
      if (buf) drums[name] = buf;
    }

    const bass: Record<number, AudioBuffer> = {};
    this.getActiveBassBufferMap().forEach((buf, midi) => {
      bass[midi] = buf;
    });

    const piano: Record<number, AudioBuffer> = {};
    this.getActiveHarmonyBufferMap("piano").forEach((buf, midi) => {
      piano[midi] = buf;
    });

    const epiano: Record<number, AudioBuffer> = {};
    this.epianoBuffers.forEach((buf, midi) => {
      epiano[midi] = buf;
    });

    const guitar: Record<number, AudioBuffer> = {};
    this.getActiveHarmonyBufferMap("guitar").forEach((buf, midi) => {
      guitar[midi] = buf;
    });

    return { drums, bass, piano, guitar, epiano };
  }

  public playDrumHit(
    instrument: DrumSampleName,
    time: number,
    velocity = 0.85
  ): AudioBufferSourceNode | null {
    const anySoloActive = this.isAnySoloActive();
    if (
      this.mixerState.drums.isMuted ||
      (anySoloActive && !this.mixerState.drums.isSolo)
    ) {
      return null;
    }

    const ctx = this.getAudioContext();
    const playTime = Math.max(time, ctx.currentTime + 0.002);

    if (instrument === "ride") {
      if (
        this.lastRideScheduledTime >= 0 &&
        Math.abs(playTime - this.lastRideScheduledTime) < 0.015
      ) {
        return null;
      }
      this.lastRideScheduledTime = playTime;
    }

    const buffer = this.getActiveDrumBuffer(instrument);
    if (!buffer) return null;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    if (this.activeDrumKitPreset === "studio_birch") {
      source.playbackRate.value =
        instrument === "kick" ? 0.96 : instrument === "snare" ? 1.02 : 1.0;
    } else if (this.activeDrumKitPreset === "urban_808") {
      source.playbackRate.value =
        instrument === "kick" ? 1.0 : instrument === "snare" ? 1.08 : 1.05;
    } else {
      source.playbackRate.value = 1.0;
    }

    const hitFilter = ctx.createBiquadFilter();
    if (this.activeDrumKitPreset === "studio_birch") {
      if (instrument === "kick") {
        hitFilter.type = "lowshelf";
        hitFilter.frequency.setValueAtTime(75, playTime);
        hitFilter.gain.setValueAtTime(3.2, playTime);
      } else if (instrument === "snare" || instrument === "rim") {
        hitFilter.type = "peaking";
        hitFilter.frequency.setValueAtTime(220, playTime);
        hitFilter.Q.setValueAtTime(1.1, playTime);
        hitFilter.gain.setValueAtTime(3.2, playTime);
      } else {
        hitFilter.type = "highshelf";
        hitFilter.frequency.setValueAtTime(6500, playTime);
        hitFilter.gain.setValueAtTime(2.0, playTime);
      }
    } else if (this.activeDrumKitPreset === "urban_808") {
      if (instrument === "kick") {
        hitFilter.type = "highpass";
        hitFilter.frequency.setValueAtTime(52, playTime);
        hitFilter.Q.setValueAtTime(0.707, playTime);
      } else {
        hitFilter.type = "peaking";
        hitFilter.frequency.setValueAtTime(1800, playTime);
        hitFilter.Q.setValueAtTime(1.2, playTime);
        hitFilter.gain.setValueAtTime(2.8, playTime);
      }
    } else {
      hitFilter.type = "peaking";
      hitFilter.frequency.setValueAtTime(1000, playTime);
      hitFilter.gain.setValueAtTime(0.0, playTime);
    }

    const hitGain = ctx.createGain();
    const isUrbanKick =
      this.activeDrumKitPreset === "urban_808" && instrument === "kick";
    const calGain =
      (isUrbanKick
        ? 0.85
        : instrument === "kick"
        ? 1.1
        : instrument === "snare"
        ? 1.02
        : instrument === "rim"
        ? 0.92
        : instrument === "ride"
        ? 0.7
        : instrument === "hihat_open"
        ? 0.75
        : 0.65) * velocity;
    hitGain.gain.setValueAtTime(calGain, playTime);

    source.connect(hitFilter);
    hitFilter.connect(hitGain);

    const targetPieceNode =
      instrument === "kick"
        ? this.kickPannerNode || this.kickGainNode
        : instrument === "snare" || instrument === "rim"
        ? this.snarePannerNode || this.snareGainNode
        : instrument === "ride"
        ? this.ridePannerNode || this.rideGainNode
        : this.hihatPannerNode || this.hihatGainNode;

    hitGain.connect(targetPieceNode || this.drumInputNode!);

    source.start(playTime);
    const maxDur = isUrbanKick
      ? 0.25
      : instrument === "ride"
      ? 2.5
      : instrument === "hihat_open"
      ? 1.2
      : instrument === "kick"
      ? 0.8
      : instrument === "snare"
      ? 0.6
      : 0.35;
    source.stop(playTime + maxDur);
    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
      try {
        source.disconnect();
        hitFilter.disconnect();
        hitGain.disconnect();
      } catch {}
    };

    return source;
  }

  private estimateVoiceCurrentGain(
    voice: ActiveVoiceRecord,
    atTime: number
  ): number {
    const elapsed = Math.max(0, atTime - voice.startTime);
    const totalDur = Math.max(0.1, voice.stopTime - voice.startTime);
    if (elapsed <= 0.015) {
      return Math.max(0.0001, (elapsed / 0.015) * voice.peakGain);
    }
    const progress = Math.min(1, elapsed / totalDur);
    return Math.max(0.0001, voice.peakGain * Math.pow(1 - progress, 1.6));
  }

  public releaseAllBass(fadeTime = 0.035, referenceTime?: number): void {
    const ctx = this.getAudioContext();
    const now =
      referenceTime !== undefined
        ? Math.max(ctx.currentTime, referenceTime)
        : ctx.currentTime;
    this.activeBassVoices.forEach((voice) => {
      if (voice.stopTime > now) {
        try {
          const currentEst = this.estimateVoiceCurrentGain(voice, now);
          voice.gainNode.gain.cancelScheduledValues(now);
          voice.gainNode.gain.setValueAtTime(currentEst, now);
          voice.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeTime);
          voice.source.stop(now + fadeTime + 0.01);
          voice.stopTime = now + fadeTime;
        } catch {}
      }
    });
    this.activeBassVoices.clear();
  }

  public playBassNote(
    freqOrMidi: number,
    time: number,
    durationBeats = 1.0,
    velocity = 0.85
  ): AudioBufferSourceNode | null {
    const anySoloActive = this.isAnySoloActive();
    if (
      this.mixerState.bass.isMuted ||
      (anySoloActive && !this.mixerState.bass.isSolo)
    ) {
      return null;
    }

    const ctx = this.getAudioContext();
    const playTime = Math.max(time, ctx.currentTime + 0.002);

    const targetMidi =
      freqOrMidi >= 21 && freqOrMidi <= 64 && Number.isInteger(freqOrMidi)
        ? freqOrMidi
        : this.freqToMidi(freqOrMidi);

    this.activeBassVoices.forEach((voice) => {
      if (voice.stopTime > playTime) {
        try {
          const estGain = this.estimateVoiceCurrentGain(voice, playTime);
          voice.gainNode.gain.cancelScheduledValues(playTime);
          voice.gainNode.gain.setValueAtTime(estGain, playTime);
          voice.gainNode.gain.linearRampToValueAtTime(
            0.0001,
            playTime + 0.03
          );
          voice.source.stop(playTime + 0.035);
          voice.stopTime = playTime + 0.03;
        } catch {}
        this.activeBassVoices.delete(voice);
      }
    });

    const bassBank = this.getActiveBassBufferMap();
    const anchor =
      this.findNearestBuffer(bassBank, targetMidi) ||
      this.findNearestBuffer(this.bassBuffers, targetMidi);
    if (!anchor) return null;

    const buffer = anchor.buffer;
    const playbackRate = Math.pow(2, (targetMidi - anchor.midi) / 12);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, playTime);

    const noteGain = ctx.createGain();
    const safeDurationBeats = Math.max(
      0.25,
      Math.min(4.0, isNaN(durationBeats) ? 1.0 : durationBeats)
    );
    const noteDuration = Math.max(0.3, safeDurationBeats * 0.52);
    const safeVelocity = Math.max(
      0.05,
      Math.min(1.0, isNaN(velocity) ? 0.85 : velocity)
    );
    const peakGain = safeVelocity * 0.58;

    const attackEnd = playTime + 0.014;
    const sustainEnd = playTime + noteDuration * 0.75;
    const releaseEnd = playTime + noteDuration + 0.045;

    noteGain.gain.setValueAtTime(0.0001, playTime);
    noteGain.gain.linearRampToValueAtTime(peakGain, attackEnd);
    noteGain.gain.linearRampToValueAtTime(peakGain * 0.65, sustainEnd);
    noteGain.gain.linearRampToValueAtTime(0.0001, releaseEnd);

    source.connect(noteGain);
    noteGain.connect(this.bassInputNode!);

    const stopTime = releaseEnd + 0.015;
    const voiceRecord: ActiveVoiceRecord = {
      source,
      gainNode: noteGain,
      startTime: playTime,
      stopTime,
      peakGain,
    };
    this.activeBassVoices.add(voiceRecord);
    this.activeSources.add(source);

    source.start(playTime);
    source.stop(stopTime);

    source.onended = () => {
      this.activeBassVoices.delete(voiceRecord);
      this.activeSources.delete(source);
      try {
        source.disconnect();
        noteGain.disconnect();
      } catch {}
    };

    return source;
  }

  public releaseAllHarmony(fadeTime = 0.03, referenceTime?: number): void {
    const ctx = this.getAudioContext();
    const now =
      referenceTime !== undefined
        ? Math.max(ctx.currentTime, referenceTime)
        : ctx.currentTime;
    this.activeHarmonyVoices.forEach((voice) => {
      if (voice.stopTime > now) {
        try {
          const estGain = this.estimateVoiceCurrentGain(voice, now);
          voice.gainNode.gain.cancelScheduledValues(now);
          voice.gainNode.gain.setValueAtTime(estGain, now);
          voice.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeTime);
          voice.source.stop(now + fadeTime + 0.01);
          voice.stopTime = now + fadeTime;
        } catch {}
      }
    });
    this.activeHarmonyVoices.clear();
  }

  public playHarmonyChord(
    frequencies: number[],
    time: number,
    durationSeconds = 1.5,
    instrument: HarmonicInstrumentType = "piano",
    velocity = 1.0
  ): void {
    const anySoloActive = this.isAnySoloActive();
    const isHarmMuted =
      this.mixerState.piano.isMuted || this.mixerState.guitar.isMuted;
    const isHarmSolo =
      this.mixerState.piano.isSolo || this.mixerState.guitar.isSolo;

    if (isHarmMuted || (anySoloActive && !isHarmSolo)) {
      return;
    }

    const ctx = this.getAudioContext();
    const playTime = Math.max(time, ctx.currentTime + 0.002);

    const isGuitarMode =
      instrument === "guitar" ||
      this.activeHarmonyPreset === "acoustic_steel" ||
      this.activeHarmonyPreset === "nylon_concert";

    const isRhodesActive =
      !isGuitarMode &&
      (this.activeHarmonyPreset === "rhodes" || instrument === "epiano");

    const filtered = frequencies
      .filter((f) => f > 0 && !isNaN(f))
      .map((f) => {
        let freq = f;
        while (freq < (isGuitarMode ? 130 : 140)) freq *= 2;
        while (freq > (isGuitarMode ? 880 : 780)) freq /= 2;
        return Math.round(freq * 10) / 10;
      })
      .sort((a, b) => a - b);

    const validFreqs = Array.from(new Set(filtered));
    if (validFreqs.length === 0) return;

    const safeVelocity = Math.max(
      0.05,
      Math.min(1.0, isNaN(velocity) ? 1.0 : velocity)
    );
    const polyHeadroom = Math.min(1.0, 1.0 / Math.sqrt(validFreqs.length));
    const chordVelocity = safeVelocity * polyHeadroom;

    const strumOffset = isGuitarMode
      ? 0.014
      : isRhodesActive
      ? 0.007
      : 0.004;

    const primaryMap = this.getActiveHarmonyBufferMap(
      isGuitarMode ? "guitar" : "piano"
    );
    const isStageLayer =
      !isGuitarMode && this.activeHarmonyPreset === "roland_stage";

    validFreqs.forEach((freq, index) => {
      const noteTime = playTime + index * strumOffset;
      const targetMidi = this.freqToMidi(freq);

      const anchor =
        this.findNearestBuffer(primaryMap, targetMidi) ||
        this.findNearestBuffer(
          isGuitarMode ? this.steelGuitarBuffers : this.pianoBuffers,
          targetMidi
        );
      if (!anchor) return;

      const buffer = anchor.buffer;
      const playbackRate = Math.pow(2, (targetMidi - anchor.midi) / 12);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.setValueAtTime(playbackRate, noteTime);

      const noteGain = ctx.createGain();
      const peakGain =
        chordVelocity * (isGuitarMode ? 0.65 : isStageLayer ? 0.65 : 0.85);
      const safeDur = Math.max(
        0.08,
        isNaN(durationSeconds) ? 1.2 : durationSeconds
      );
      const isStaccato = safeDur <= 0.28;
      const releaseTime = noteTime + safeDur;

      if (isStaccato) {
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.linearRampToValueAtTime(peakGain, noteTime + 0.006);
        noteGain.gain.linearRampToValueAtTime(
          peakGain * 0.65,
          Math.max(noteTime + 0.015, releaseTime)
        );
        noteGain.gain.linearRampToValueAtTime(0.0001, releaseTime + 0.025);
      } else {
        const sustainEnd = Math.max(noteTime + 0.04, releaseTime - 0.05);
        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.linearRampToValueAtTime(peakGain, noteTime + 0.008);
        noteGain.gain.linearRampToValueAtTime(peakGain * 0.65, sustainEnd);
        noteGain.gain.linearRampToValueAtTime(0.0001, releaseTime + 0.03);
      }

      source.connect(noteGain);

      const targetInputNode = isGuitarMode
        ? this.guitarInputNode
        : isRhodesActive
        ? this.rhodesInputNode
        : this.pianoInputNode;

      noteGain.connect(targetInputNode || this.masterBusGain!);

      const stopTime = releaseTime + 0.04;
      const voiceRecord: ActiveVoiceRecord = {
        source,
        gainNode: noteGain,
        startTime: noteTime,
        stopTime,
        peakGain,
      };
      this.activeHarmonyVoices.add(voiceRecord);
      this.activeSources.add(source);

      source.start(noteTime);
      source.stop(stopTime);

      source.onended = () => {
        this.activeHarmonyVoices.delete(voiceRecord);
        this.activeSources.delete(source);
        try {
          source.disconnect();
          noteGain.disconnect();
        } catch {}
      };

      if (isStageLayer && this.fmEpianoBuffers.size > 0) {
        const epAnchor = this.findNearestBuffer(
          this.fmEpianoBuffers,
          targetMidi
        );
        if (epAnchor) {
          const epSrc = ctx.createBufferSource();
          epSrc.buffer = epAnchor.buffer;
          epSrc.playbackRate.setValueAtTime(
            Math.pow(2, (targetMidi - epAnchor.midi) / 12),
            noteTime
          );
          const epGain = ctx.createGain();
          epGain.gain.setValueAtTime(0.0001, noteTime);
          epGain.gain.linearRampToValueAtTime(
            chordVelocity * 0.36,
            noteTime + 0.01
          );
          epGain.gain.linearRampToValueAtTime(0.0001, releaseTime + 0.04);
          epSrc.connect(epGain);
          epGain.connect(targetInputNode || this.masterBusGain!);
          epSrc.start(noteTime);
          epSrc.stop(releaseTime + 0.05);
        }
      }
    });
  }

  public isAnyBandaSoloActive(): boolean {
    const { drums, bass, piano, rhodes, guitar } = this.mixerState;
    return Boolean(
      drums.isSolo ||
        bass.isSolo ||
        piano.isSolo ||
        rhodes.isSolo ||
        guitar.isSolo
    );
  }

  public isAnySoloActive(): boolean {
    return this.isAnyBandaSoloActive() || this.externalSoloActive;
  }

  public setExternalSoloActive(active: boolean): void {
    const next = Boolean(active);
    if (this.externalSoloActive === next) return;
    this.externalSoloActive = next;
    this.getAudioContext();
    this.applyEffectiveGains();
  }

  public isExternalSoloActive(): boolean {
    return this.externalSoloActive;
  }

  private applyEffectiveGains(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const rampTime = 0.01;

    const { drums, bass, piano, rhodes, guitar, masterVolume } =
      this.mixerState;
    const anySoloActive = this.isAnySoloActive();

    let effectiveDrum = 0;
    if (!drums.isMuted && (!anySoloActive || drums.isSolo)) {
      effectiveDrum = drums.volume;
    }
    if (this.drumFaderGain) {
      this.drumFaderGain.gain.cancelScheduledValues(now);
      this.drumFaderGain.gain.setTargetAtTime(effectiveDrum, now, rampTime);
    }

    let effectiveBass = 0;
    if (!bass.isMuted && (!anySoloActive || bass.isSolo)) {
      effectiveBass = bass.volume;
    }
    if (this.bassFaderGain) {
      this.bassFaderGain.gain.cancelScheduledValues(now);
      this.bassFaderGain.gain.setTargetAtTime(effectiveBass, now, rampTime);
    }
    if (effectiveBass === 0) {
      this.releaseAllBass(0.02);
    }

    const isHarmSolo = piano.isSolo || guitar.isSolo || rhodes.isSolo;
    const isHarmMuted = piano.isMuted || guitar.isMuted || rhodes.isMuted;

    let effectivePiano = 0;
    if (!isHarmMuted && (!anySoloActive || isHarmSolo)) {
      effectivePiano = piano.volume;
    }
    if (this.pianoFaderGain) {
      this.pianoFaderGain.gain.cancelScheduledValues(now);
      this.pianoFaderGain.gain.setTargetAtTime(effectivePiano, now, rampTime);
    }

    let effectiveRhodes = 0;
    if (!isHarmMuted && (!anySoloActive || isHarmSolo)) {
      effectiveRhodes = rhodes.volume;
    }
    if (this.rhodesFaderGain) {
      this.rhodesFaderGain.gain.cancelScheduledValues(now);
      this.rhodesFaderGain.gain.setTargetAtTime(effectiveRhodes, now, rampTime);
    }

    let effectiveGuitar = 0;
    if (!isHarmMuted && (!anySoloActive || isHarmSolo)) {
      effectiveGuitar = guitar.volume;
    }
    if (this.guitarFaderGain) {
      this.guitarFaderGain.gain.cancelScheduledValues(now);
      this.guitarFaderGain.gain.setTargetAtTime(effectiveGuitar, now, rampTime);
    }

    if (
      effectivePiano === 0 &&
      effectiveRhodes === 0 &&
      effectiveGuitar === 0
    ) {
      this.releaseAllHarmony(0.02);
    }

    if (this.masterBusGain) {
      this.masterBusGain.gain.cancelScheduledValues(now);
      this.masterBusGain.gain.setTargetAtTime(masterVolume, now, rampTime);
    }

    this.notifyListeners();
  }

  public setChannelVolume(channel: MainMixerChannel, volume: number): void {
    this.getAudioContext();
    const clamped = Math.max(0, Math.min(4.5, volume));
    this.mixerState[channel].volume = clamped;
    this.applyEffectiveGains();
  }

  public toggleChannelMute(channel: MainMixerChannel): void {
    this.getAudioContext();
    const nextMuted = !this.mixerState[channel].isMuted;
    this.mixerState[channel].isMuted = nextMuted;
    if (channel === "piano" || channel === "guitar" || channel === "rhodes") {
      this.mixerState.piano.isMuted = nextMuted;
      this.mixerState.guitar.isMuted = nextMuted;
      this.mixerState.rhodes.isMuted = nextMuted;
    }
    this.applyEffectiveGains();
  }

  public toggleChannelSolo(channel: MainMixerChannel): void {
    this.getAudioContext();
    const nextSolo = !this.mixerState[channel].isSolo;
    this.mixerState[channel].isSolo = nextSolo;
    if (channel === "piano" || channel === "guitar" || channel === "rhodes") {
      this.mixerState.piano.isSolo = nextSolo;
      this.mixerState.guitar.isSolo = nextSolo;
      this.mixerState.rhodes.isSolo = nextSolo;
    }
    this.applyEffectiveGains();
  }

  public setMasterVolume(volume: number): void {
    this.getAudioContext();
    this.mixerState.masterVolume = Math.max(0, Math.min(1.5, volume));
    this.applyEffectiveGains();
  }

  public setDrumPieceVolume(piece: DrumPieceName, volume: number): void {
    this.getAudioContext();
    const clamped = Math.max(0, Math.min(1.5, volume));
    this.mixerState.drumPieces[piece].volume = clamped;
    this.applyDrumPieceGain(piece);
    this.notifyListeners();
  }

  public toggleDrumPieceMute(piece: DrumPieceName): void {
    this.getAudioContext();
    this.mixerState.drumPieces[piece].isMuted =
      !this.mixerState.drumPieces[piece].isMuted;
    this.applyDrumPieceGain(piece);
    this.notifyListeners();
  }

  public setChannelGainDirect(channel: MainMixerChannel, volume: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(0, Math.min(4.5, volume));
    this.mixerState[channel].volume = clamped;
    this.applyEffectiveGains();
  }

  public setDrumPieceGainDirect(piece: DrumPieceName, volume: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(0, Math.min(1.5, volume));
    this.mixerState.drumPieces[piece].volume = clamped;
    this.applyDrumPieceGain(piece);
  }

  public setMasterGainDirect(volume: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(0, Math.min(1.5, volume));
    this.mixerState.masterVolume = clamped;
    if (this.masterBusGain && this.ctx) {
      this.masterBusGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterBusGain.gain.setTargetAtTime(
        clamped,
        this.ctx.currentTime,
        0.01
      );
    }
  }

  public setStyleBaseGain(multiplier: number): void {
    const clamped = Math.max(0.1, Math.min(2.0, multiplier));
    this.currentStyleGainMultiplier = clamped;
    if (this.styleGainNode && this.ctx) {
      this.styleGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.styleGainNode.gain.setTargetAtTime(
        clamped,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  public getStyleBaseGain(): number {
    return this.currentStyleGainMultiplier;
  }

  public setChannelPanDirect(channel: MainMixerChannel, pan: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(-1.0, Math.min(1.0, pan));
    if (this.mixerState[channel]) {
      this.mixerState[channel].pan = clamped;
    }
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    let node: StereoPannerNode | null = null;
    if (channel === "bass") node = this.bassPannerNode;
    else if (channel === "piano") node = this.pianoPannerNode;
    else if (channel === "rhodes") node = this.rhodesPannerNode;
    else if (channel === "guitar") node = this.guitarPannerNode;

    if (node) {
      node.pan.setTargetAtTime(clamped, now, 0.01);
    }
  }

  public setDrumPiecePanDirect(piece: DrumPieceName, pan: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(-1.0, Math.min(1.0, pan));
    if (this.mixerState.drumPieces[piece]) {
      this.mixerState.drumPieces[piece].pan = clamped;
    }
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const node =
      piece === "kick"
        ? this.kickPannerNode
        : piece === "snare"
        ? this.snarePannerNode
        : piece === "hihat"
        ? this.hihatPannerNode
        : this.ridePannerNode;

    if (node) {
      node.pan.setTargetAtTime(clamped, now, 0.01);
    }
  }

  private applyDrumPieceGain(piece: DrumPieceName): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pieceState = this.mixerState.drumPieces[piece];
    const targetGain = pieceState.isMuted ? 0 : pieceState.volume;
    const node =
      piece === "kick"
        ? this.kickGainNode
        : piece === "snare"
        ? this.snareGainNode
        : piece === "hihat"
        ? this.hihatGainNode
        : this.rideGainNode;

    if (node) {
      node.gain.setTargetAtTime(targetGain, now, 0.01);
    }
  }

  public getMixerState(): MixerState {
    return {
      drums: { ...this.mixerState.drums },
      drumPieces: {
        kick: { ...this.mixerState.drumPieces.kick },
        snare: { ...this.mixerState.drumPieces.snare },
        hihat: { ...this.mixerState.drumPieces.hihat },
        ride: { ...this.mixerState.drumPieces.ride },
      },
      bass: { ...this.mixerState.bass },
      piano: { ...this.mixerState.piano },
      rhodes: { ...this.mixerState.rhodes },
      guitar: { ...this.mixerState.guitar },
      masterVolume: this.mixerState.masterVolume,
      roomReverbWet: this.mixerState.roomReverbWet ?? 0.38,
      metronomeActive: this.mixerState.metronomeActive,
      harmonyPreset: this.activeHarmonyPreset,
      bassPreset: this.activeBassPreset,
      drumKitPreset: this.activeDrumKitPreset,
    };
  }

  public setRoomReverbWetDirect(wet: number): void {
    if (!this.ctx) this.getAudioContext();
    const clamped = Math.max(0, Math.min(1.0, wet));
    this.mixerState.roomReverbWet = clamped;
    const wetGain = clamped <= 0.005 ? 0 : Math.pow(clamped, 1.25) * 1.15;
    if (this.reverbReturnGain && this.ctx) {
      this.reverbReturnGain.gain.setTargetAtTime(
        wetGain,
        this.ctx.currentTime,
        0.015
      );
    }
  }

  public getRoomReverbWet(): number {
    return this.mixerState.roomReverbWet ?? 0.38;
  }

  public isMetronomeActive(): boolean {
    return this.mixerState.metronomeActive;
  }

  public toggleMetronomeActive(): boolean {
    this.mixerState.metronomeActive = !this.mixerState.metronomeActive;
    this.notifyListeners();
    return this.mixerState.metronomeActive;
  }

  public setMetronomeActive(active: boolean): void {
    this.mixerState.metronomeActive = active;
    this.notifyListeners();
  }

  public isDrumTrackAudible(): boolean {
    const { drums, drumPieces } = this.mixerState;
    if (drums.isMuted) return false;
    if (drums.volume <= 0.01) return false;
    const anyPieceAudible = Object.values(drumPieces).some(
      (p) => !p.isMuted && p.volume > 0.01
    );
    if (!anyPieceAudible) return false;
    const anySoloActive = this.isAnySoloActive();
    if (anySoloActive && !drums.isSolo) return false;
    return true;
  }

  private meterSampleArray = new Uint8Array(128);

  public getChannelPeak(
    channel:
      | "master"
      | "drums"
      | "bass"
      | "piano"
      | "rhodes"
      | "guitar"
      | "kick"
      | "snare"
      | "hihat"
      | "ride"
  ): number {
    const node =
      channel === "master"
        ? this.masterAnalyser
        : channel === "drums"
        ? this.drumAnalyser
        : channel === "bass"
        ? this.bassAnalyser
        : channel === "piano"
        ? this.pianoAnalyser
        : channel === "rhodes"
        ? this.rhodesAnalyser
        : channel === "guitar"
        ? this.guitarAnalyser
        : channel === "kick"
        ? this.kickAnalyser
        : channel === "snare"
        ? this.snareAnalyser
        : channel === "hihat"
        ? this.hihatAnalyser
        : this.rideAnalyser;

    if (!node) return 0;

    node.getByteTimeDomainData(this.meterSampleArray);
    let maxDev = 0;
    for (let i = 0; i < this.meterSampleArray.length; i++) {
      const dev = Math.abs(this.meterSampleArray[i] - 128);
      if (dev > maxDev) maxDev = dev;
    }
    return Math.min(1.0, maxDev / 128);
  }

  public getAllChannelPeaks(): Record<string, number> {
    return {
      master: this.getChannelPeak("master"),
      drums: this.getChannelPeak("drums"),
      bass: this.getChannelPeak("bass"),
      piano: this.getChannelPeak("piano"),
      rhodes: this.getChannelPeak("rhodes"),
      guitar: this.getChannelPeak("guitar"),
      kick: this.getChannelPeak("kick"),
      snare: this.getChannelPeak("snare"),
      hihat: this.getChannelPeak("hihat"),
      ride: this.getChannelPeak("ride"),
    };
  }

  public subscribe(listener: (state: MixerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getMixerState());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const current = this.getMixerState();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch {}
    });
  }

  public stopAll(): void {
    this.activeHarmonyVoices.clear();
    this.activeBassVoices.clear();
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    });
    this.activeSources.clear();
    this.lastRideScheduledTime = -1;
  }

  private findNearestBuffer(
    bufferMap: Map<number, AudioBuffer>,
    targetMidi: number
  ): { buffer: AudioBuffer; midi: number } | null {
    if (bufferMap.size === 0) return null;
    let bestMidi = -1;
    let minDiff = Infinity;

    for (const [midi] of bufferMap.entries()) {
      const diff = Math.abs(targetMidi - midi);
      if (diff < minDiff) {
        minDiff = diff;
        bestMidi = midi;
      }
    }

    return bestMidi !== -1
      ? { buffer: bufferMap.get(bestMidi)!, midi: bestMidi }
      : null;
  }

  private freqToMidi(freq: number): number {
    if (freq <= 0 || isNaN(freq)) return 60;
    return Math.round(69 + 12 * Math.log2(freq / 440));
  }
}

export const interactiveAnalysisAudio = new InteractiveAnalysisAudioEngine();

if (typeof window !== "undefined") {
  interactiveAnalysisAudio.preloadAllWavSamples().catch(() => {});
}