import * as Tone from 'tone';

/**
 * Controlador Centralizado de Audio para Teclado MIDI en Vivo (GlobalMidiKeyboard)
 * Conecta el motor Tone.Sampler del teclado en vivo directamente a la
 * Consola de Mezcla Analógica (InteractiveMixer).
 */
// Asegurar que Tone.Destination sea siempre dinámico y apunte al contexto activo
try {
  Object.defineProperty(Tone, 'Destination', {
    get: () => Tone.getDestination(),
    configurable: true
  });
} catch (_) {}

class LiveMidiController {
  private volumeNode: Tone.Volume | null = null;
  private pannerNode: Tone.Panner | null = null;
  private reverbNode: Tone.Reverb | null = null;
  private meterNode: Tone.Meter | null = null;

  private instrumentGainNode: Tone.Volume | null = null;
  private currentInstrumentGainDb: number = 0;

  private volumeLinear: number = 1.0; // 1.0 = 0 dB (Ganancia Unitaria)
  private isMuted: boolean = false;
  private panValue: number = 0.0;     // 0 = Centro
  private reverbWet: number = 0.30;   // 30% Wet Reverb natural

  private listeners: Set<() => void> = new Set();

  /**
   * Nodo de ganancia dedicada por instrumento para el canal LIVE MIDI
   * Permite realce individual de cada banco (+3 dB a +6 dB) antes del canal de mezcla
   */
  public getInstrumentGainNode(): Tone.Volume {
    const rawCtx = Tone.getContext().rawContext;
    if (!this.instrumentGainNode || this.instrumentGainNode.context.rawContext !== rawCtx) {
      this.instrumentGainNode = new Tone.Volume(this.currentInstrumentGainDb);
    }
    return this.instrumentGainNode;
  }

  public setInstrumentGainDb(db: number): void {
    this.currentInstrumentGainDb = db;
    if (this.instrumentGainNode) {
      this.instrumentGainNode.volume.value = db;
    }
  }

  public getVolumeNode(): Tone.Volume {
    const rawCtx = Tone.getContext().rawContext;
    if (!this.volumeNode || this.volumeNode.context.rawContext !== rawCtx) {
      this.volumeNode = new Tone.Volume(0);
      this.applyVolume();
    }
    return this.volumeNode;
  }

  public getPannerNode(): Tone.Panner {
    const rawCtx = Tone.getContext().rawContext;
    if (!this.pannerNode || this.pannerNode.context.rawContext !== rawCtx) {
      this.pannerNode = new Tone.Panner(this.panValue);
    }
    return this.pannerNode;
  }

  public getReverbNode(): Tone.Reverb {
    const rawCtx = Tone.getContext().rawContext;
    if (!this.reverbNode || this.reverbNode.context.rawContext !== rawCtx) {
      this.reverbNode = new Tone.Reverb({ decay: 3, preDelay: 0.01 });
      this.reverbNode.wet.value = this.reverbWet;
    }
    return this.reverbNode;
  }

  public getMeterNode(): Tone.Meter {
    const rawCtx = Tone.getContext().rawContext;
    if (!this.meterNode || this.meterNode.context.rawContext !== rawCtx) {
      this.meterNode = new Tone.Meter({ normalRange: true });
    }
    return this.meterNode;
  }

  /**
   * Conecta cualquier Tone.Sampler a la cadena de audio de la consola:
   * Sampler -> Instrument Gain -> Reverb -> Panner -> Volume -> Tone.Destination
   * y conecta el VU Meter en derivación paralela desde Volume
   */
  public connectSampler(sampler: Tone.Sampler, instrumentGainDb: number = 0): void {
    this.setInstrumentGainDb(instrumentGainDb);
    const instGain = this.getInstrumentGainNode();
    const rev = this.getReverbNode();
    const pan = this.getPannerNode();
    const vol = this.getVolumeNode();
    const meter = this.getMeterNode();
    const dest = Tone.getDestination();

    try { sampler.disconnect(); } catch (_) {}
    sampler.chain(instGain, rev, pan, vol, dest);
    try {
      vol.connect(meter);
    } catch (_) {}
  }

  /**
   * Desconecta limpiamente el sampler actual del canal LIVE MIDI
   */
  public disconnectSampler(sampler: Tone.Sampler | null): void {
    if (!sampler) return;
    try {
      sampler.disconnect();
    } catch (_) {}
  }

  /**
   * Control directo de ganancia lineal desde el fader de la consola (0.0 a 1.5)
   */
  public setGainDirect(val: number): void {
    this.volumeLinear = Math.max(0, val);
    this.applyVolume();
    this.notify();
  }

  /**
   * Control directo de paneo estéreo (-1.0 a 1.0)
   */
  public setPanDirect(pan: number): void {
    this.panValue = Math.max(-1, Math.min(1, pan));
    if (this.pannerNode) {
      this.pannerNode.pan.value = this.panValue;
    }
    this.notify();
  }

  /**
   * Control de mezcla wet de la reverberación (0.0 a 1.0)
   */
  public setReverbWetDirect(wet: number): void {
    this.reverbWet = Math.max(0, Math.min(1, wet));
    if (this.reverbNode) {
      this.reverbNode.wet.value = this.reverbWet;
    }
    this.notify();
  }

  /**
   * Alternar Mute
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.applyVolume();
    this.notify();
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    this.applyVolume();
    this.notify();
  }

  private applyVolume(): void {
    if (!this.volumeNode) return;
    if (this.isMuted || this.volumeLinear <= 0.001) {
      this.volumeNode.mute = true;
      this.volumeNode.volume.value = -60;
    } else {
      this.volumeNode.mute = false;
      const db = Tone.gainToDb(this.volumeLinear);
      this.volumeNode.volume.value = Math.max(-60, Math.min(6, db));
    }
  }

  /**
   * Pico de nivel de señal normalizado (0.0 a 1.0) para el VU Meter
   */
  public getPeak(): number {
    if (!this.meterNode) return 0;
    const raw = this.meterNode.getValue();
    if (Array.isArray(raw)) {
      return Math.max(...raw);
    }
    if (typeof raw === 'number' && !isNaN(raw) && isFinite(raw)) {
      return Math.max(0, Math.min(1, raw));
    }
    return 0;
  }

  public getVolume(): number {
    return this.volumeLinear;
  }

  public getPan(): number {
    return this.panValue;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getReverbWet(): number {
    return this.reverbWet;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }
}

export const liveMidiController = new LiveMidiController();
