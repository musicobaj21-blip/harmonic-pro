/**
 * Linus Harmony Pro - Motor de Audio Aislado para Diccionario de Acordes y Escalas
 *
 * Cadena de Audio:
 * [Voice / Sample / Synth] -> [instrumentGain (Guitar/Keyboard)] -> [masterCompressor (Brickwall)] -> [audioContext.destination]
 *
 * Especificaciones estrictas:
 * - Brickwall Limiter: ratio 20:1, threshold -1 dB, knee 0, attack 0.003s, release 0.25s
 * - Ganancia de instrumento independiente para equilibrar guitarra y teclado
 * - Escalado polifónico dinámico para evitar saturación en voicings densos (maj7, m9, 13, etc.)
 */

import Soundfont from 'soundfont-player';
import { playSoundfontNote } from './soundfont';

export type DictionaryInstrument = 'guitar' | 'piano' | 'keyboard';

class DictionaryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private instrumentGains: {
    guitar: GainNode | null;
    keyboard: GainNode | null;
  } = {
    guitar: null,
    keyboard: null,
  };

  private activeInstrument: DictionaryInstrument = 'piano';

  // Ganancias de bus calibradas idénticas (0.38) para salida uniforme en ambos instrumentos
  private calibration = {
    guitar: 0.38,
    keyboard: 0.38,
  };

  private soundfontPlayers: Record<string, any> = {};
  private loadingSoundfonts: Record<string, Promise<any>> = {};

  /**
   * Obtiene o inicializa el AudioContext perezosamente.
   */
  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.setupMasterChain();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.warn('[DictionaryAudio] Error reanudando AudioContext:', e));
    }

    return this.ctx;
  }

  /**
   * Configura la cadena:
   * instrumentGain -> masterCompressor (Brickwall) -> destination
   */
  private setupMasterChain(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Limitador Brickwall (DynamicsCompressorNode)
    // ratio: 20:1, threshold: -1 dB, knee: 0, attack: 0.003s, release: 0.25s
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.ratio.setValueAtTime(20, now);
    this.masterCompressor.threshold.setValueAtTime(-1, now);
    this.masterCompressor.knee.setValueAtTime(0, now);
    this.masterCompressor.attack.setValueAtTime(0.003, now);
    this.masterCompressor.release.setValueAtTime(0.25, now);

    // Conectar el compresor directamente a la salida física
    this.masterCompressor.connect(this.ctx.destination);

    // 2. GainNode específico para Guitarra
    this.instrumentGains.guitar = this.ctx.createGain();
    this.instrumentGains.guitar.gain.setValueAtTime(this.calibration.guitar, now);
    this.instrumentGains.guitar.connect(this.masterCompressor);

    // 3. GainNode específico para Teclado / Piano
    this.instrumentGains.keyboard = this.ctx.createGain();
    this.instrumentGains.keyboard.gain.setValueAtTime(this.calibration.keyboard, now);
    this.instrumentGains.keyboard.connect(this.masterCompressor);
  }

  /**
   * Retorna el nodo de ganancia para el instrumento solicitado ('guitar' o 'keyboard'/'piano')
   */
  public getInputNode(instrument: DictionaryInstrument = this.activeInstrument): GainNode {
    this.getContext();
    if (instrument === 'guitar') {
      return this.instrumentGains.guitar!;
    }
    return this.instrumentGains.keyboard!;
  }

  /**
   * Define el instrumento activo
   */
  public setInstrument(instrument: DictionaryInstrument): void {
    this.activeInstrument = instrument;
  }

  public getInstrument(): DictionaryInstrument {
    return this.activeInstrument;
  }

  /**
   * Ajusta el volumen relativo de cada instrumento de forma independiente con rampa suave
   */
  public setInstrumentGain(instrument: 'guitar' | 'keyboard', value: number, rampTime = 0.015): void {
    this.getContext();
    const safeVal = Math.max(0, Math.min(value, 1.5));
    this.calibration[instrument] = safeVal;
    const targetNode = this.instrumentGains[instrument];
    if (targetNode && this.ctx) {
      targetNode.gain.setTargetAtTime(safeVal, this.ctx.currentTime, rampTime);
    }
  }

  /**
   * Carga Soundfont opcionalmente conectado directamente a la cadena del diccionario
   */
  public async loadSoundfont(instrument: DictionaryInstrument): Promise<any> {
    const key = instrument === 'guitar' ? 'acoustic_guitar_nylon' : 'acoustic_grand_piano';
    if (this.soundfontPlayers[key]) return this.soundfontPlayers[key];
    if (this.loadingSoundfonts[key]) return this.loadingSoundfonts[key];

    const ctx = this.getContext();
    const destNode = this.getInputNode(instrument);

    this.loadingSoundfonts[key] = (async () => {
      try {
        const player = await Soundfont.instrument(ctx, key as any, {
          soundfont: 'FluidR3_GM',
          destination: destNode,
        });
        this.soundfontPlayers[key] = player;
        return player;
      } catch (err) {
        console.warn(`[DictionaryAudio] No se pudo cargar soundfont ${key}, usando síntesis nativa.`, err);
        return null;
      } finally {
        delete this.loadingSoundfonts[key];
      }
    })();

    return this.loadingSoundfonts[key];
  }

  /**
   * Toca una nota individual con la cadena de audio y balance correspondiente
   */
  public playSingleNote(
    frequency: number,
    instrument: DictionaryInstrument = this.activeInstrument,
    volume = 0.35
  ): void {
    if (frequency <= 0 || isNaN(frequency)) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const inputNode = this.getInputNode(instrument);

    const isGuitar = instrument === 'guitar';
    const sfKey = isGuitar ? 'acoustic_guitar_nylon' : 'acoustic_grand_piano';
    const sfPlayer = this.soundfontPlayers[sfKey];

    if (sfPlayer) {
      const played = playSoundfontNote(sfPlayer, frequency, now, { gain: volume });
      if (played) return;
    }

    if (isGuitar) {
      this.synthesizeGuitarNote(ctx, inputNode, frequency, now, volume);
    } else {
      this.synthesizePianoNote(ctx, inputNode, frequency, now, volume);
    }
  }

  /**
   * Toca un acorde completo aplicando:
   * 1. Escalado polifónico dinámico (headroom anti-clipping según cantidad de notas)
   * 2. Strum delay natural
   * 3. Enrutamiento por el instrumentGain calibrado
   * 4. Limitador brickwall final
   */
  public playChord(
    frequencies: number[],
    instrument: DictionaryInstrument = this.activeInstrument,
    options: { strumDelay?: number; baseVolume?: number } = {}
  ): void {
    const validFreqs = frequencies.filter((f) => f > 0 && !isNaN(f));
    if (validFreqs.length === 0) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;
    const inputNode = this.getInputNode(instrument);

    // Strum delay: 38ms en guitarra para rasgueo natural, 16ms en piano
    const isGuitar = instrument === 'guitar';
    const defaultStrum = isGuitar ? 0.038 : 0.016;
    const strumDelay = options.strumDelay !== undefined ? options.strumDelay : defaultStrum;

    // Headroom polifónico: Cuantas más notas se sumen simultáneamente,
    // menor es la amplitud individual de cada una para garantizar que la suma
    // matemática no exceda el umbral de saturación.
    const noteCount = validFreqs.length;
    const polyHeadroomScale = Math.min(0.65, 1.1 / Math.sqrt(Math.max(1, noteCount)));
    const baseVolume = options.baseVolume ?? 0.40;

    // Ganancia simétrica e idéntica para ambos instrumentos
    const noteGain = baseVolume * polyHeadroomScale;

    const sfKey = isGuitar ? 'acoustic_guitar_nylon' : 'acoustic_grand_piano';
    const sfPlayer = this.soundfontPlayers[sfKey];

    if (sfPlayer) {
      let anyPlayed = false;
      validFreqs.forEach((freq, index) => {
        const noteTime = now + index * strumDelay;
        const played = playSoundfontNote(sfPlayer, freq, noteTime, { gain: noteGain });
        if (played) anyPlayed = true;
      });
      if (anyPlayed) return;
    }

    // Síntesis de modelado físico acústico sin saturación
    validFreqs.forEach((freq, index) => {
      const noteTime = now + index * strumDelay;
      if (isGuitar) {
        this.synthesizeGuitarNote(ctx, inputNode, freq, noteTime, noteGain);
      } else {
        this.synthesizePianoNote(ctx, inputNode, freq, noteTime, noteGain);
      }
    });
  }

  /**
   * Síntesis de guitarra acústica limpia (plucked string equilibrada)
   */
  private synthesizeGuitarNote(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    gainLevel: number
  ): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Osciladores: Triángulo + Seno armónico sutil con micro-desafinación acústica
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2.detune.setValueAtTime(3, startTime);
    osc2Gain.gain.setValueAtTime(0.25, startTime);
    osc2.connect(osc2Gain);

    // Filtro pasa-bajos dinámico con envolvente acústica de cuerda punteada
    filter.type = 'lowpass';
    const cutoffBase = Math.min(3800, freq * 4.0);
    filter.frequency.setValueAtTime(cutoffBase, startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(240, freq * 1.2), startTime + 0.5);

    // Envolvente de ganancia (ataque rápido de púa, decay natural)
    const decayDuration = 2.2;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.70, startTime + 0.012);
    gain.gain.setTargetAtTime(0.0001, startTime + 0.04, 0.60);

    osc1.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + decayDuration);
    osc2.stop(startTime + decayDuration);
  }

  /**
   * Síntesis de teclado / piano acústico cálido con cuerpo armónico completo
   */
  private synthesizePianoNote(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    startTime: number,
    gainLevel: number
  ): void {
    const fundamental = ctx.createOscillator();
    const harmonic2 = ctx.createOscillator();
    const harmonic3 = ctx.createOscillator();
    const harm2Gain = ctx.createGain();
    const harm3Gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(freq, startTime);

    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(freq * 2, startTime);
    harm2Gain.gain.setValueAtTime(0.28, startTime);
    harmonic2.connect(harm2Gain);

    harmonic3.type = 'sine';
    harmonic3.frequency.setValueAtTime(freq * 3, startTime);
    harm3Gain.gain.setValueAtTime(0.10, startTime);
    harmonic3.connect(harm3Gain);

    // Filtro con respuesta suave
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(4800, freq * 5.0), startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.4), startTime + 0.7);

    // Envolvente de piano acústico: mismo pico (0.70) y decaimiento armónico natural
    const decayDuration = 2.4;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.70, startTime + 0.010);
    gain.gain.setTargetAtTime(gainLevel * 0.42, startTime + 0.02, 0.30);
    gain.gain.setTargetAtTime(0.0001, startTime + 0.30, 0.80);

    fundamental.connect(filter);
    harm2Gain.connect(filter);
    harm3Gain.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    fundamental.start(startTime);
    harmonic2.start(startTime);
    harmonic3.start(startTime);
    fundamental.stop(startTime + decayDuration);
    harmonic2.stop(startTime + decayDuration);
    harmonic3.stop(startTime + decayDuration);
  }
}

export const dictionaryAudio = new DictionaryAudioEngine();
