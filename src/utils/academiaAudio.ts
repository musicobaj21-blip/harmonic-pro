/**
 * Linus Harmony Pro - Motor de Audio Dedicado para "Linus Academia"
 * 
 * Cadena DSP Limpia:
 * [Voice / Synthesizer / Bass] -> [inputGain] -> [highpassFilter (180Hz)] -> [masterCompressor (Brickwall)] -> [destination]
 *
 * Especificaciones de DSP y Armonía:
 * 1. Limpieza de Graves (High-Pass Filter):
 *    - BiquadFilterNode configurado como type = "highpass"
 *    - Frecuencia de corte = 180Hz (entre 150Hz y 200Hz) con Q = 0.707 (curva Butterworth)
 *    - 100% de la señal armónica de Linus Academia pasa por este filtro antes de la salida física.
 *
 * 2. Ajuste de Registro (Octavas):
 *    - Transposición automática +1 octava (* 2) para cualquier voicing o nota que se genere en octavas
 *      graves (octava 2, frecuencias < 150Hz), situando los bloques armónicos en registro medio claro (octavas 3 y 4).
 *
 * 3. Aislamiento Estricto:
 *    - Modificaciones circunscritas única y exclusivamente a Linus Academia.
 */

import Soundfont from 'soundfont-player';
import { playSoundfontNote } from './soundfont';

export class AcademiaAudioEngine {
  private ctx: AudioContext | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private inputGain: GainNode | null = null;
  private activeOscillators = new Set<OscillatorNode>();
  private soundfontPlayers: Record<string, any> = {};
  private loadingSoundfonts: Record<string, Promise<any>> = {};

  // Parámetros de Calibración de Ganancia Dinámica (Gain Staging) para Linus Academia:
  // - Piano/Teclado: atenuado a 0.60 (-4.4 dB) para nivelar la densidad armónica y volumen de salida
  // - Guitarra: ganancia equilibrada y ligeramente reforzada (1.08, +0.7 dB) para emparejar sonoridad percibida
  private readonly BASE_SYSTEM_GAIN = 0.42;
  private readonly PIANO_GAIN_FACTOR = 0.60;   // -4.4 dB
  private readonly GUITAR_GAIN_FACTOR = 1.08;  // +0.7 dB
  private currentInstrument: 'piano' | 'guitar' = 'piano';

  /**
   * Obtiene o inicializa el AudioContext con la cadena DSP de filtrado pasa-altos
   */
  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.setupDSPChain();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.warn('[AcademiaAudio] Error al reanudar AudioContext:', e));
    }

    return this.ctx;
  }

  /**
   * Configura la cadena DSP:
   * [inputGain] -> [highpassFilter (180Hz)] -> [masterCompressor (-1dBFS)] -> [destination]
   */
  private setupDSPChain(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Ganancia de entrada / Bus de mezcla de Academia calibrada condicionalmente por instrumento
    this.inputGain = this.ctx.createGain();
    const factor = this.currentInstrument === 'piano' ? this.PIANO_GAIN_FACTOR : this.GUITAR_GAIN_FACTOR;
    this.inputGain.gain.setValueAtTime(this.BASE_SYSTEM_GAIN * factor, now);

    // 2. Filtro Pasa-Altos (High-Pass Filter @ 180Hz) para erradicar saturación y lodo en graves
    this.highpassFilter = this.ctx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.setValueAtTime(180, now); // Entre 150Hz y 200Hz
    this.highpassFilter.Q.setValueAtTime(0.707, now);       // Respuesta plana Butterworth

    // 3. Limitador Brickwall para mastering transparente
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.ratio.setValueAtTime(20, now);
    this.masterCompressor.threshold.setValueAtTime(-1.0, now);
    this.masterCompressor.knee.setValueAtTime(0, now);
    this.masterCompressor.attack.setValueAtTime(0.003, now);
    this.masterCompressor.release.setValueAtTime(0.20, now);

    // Interconexión DSP
    this.inputGain.connect(this.highpassFilter);
    this.highpassFilter.connect(this.masterCompressor);
    this.masterCompressor.connect(this.ctx.destination);
  }

  /**
   * Balance de Ganancia Condicional (Gain Staging) para Linus Academia:
   * Nivela la ganancia del GainNode principal entre Teclado y Guitarra:
   * - Teclado / Piano: reduce la ganancia multiplicando por 0.60 (-4.4 dB)
   * - Guitarra: mantiene / eleva ligeramente su ganancia (* 1.08, +0.7 dB) para emparejar sonoridad percibida
   * Evita saltos bruscos de volumen al alternar instrumentos en las progresiones de la academia.
   */
  public setInstrument(instrument: 'piano' | 'guitar'): void {
    this.currentInstrument = instrument;
    if (!this.inputGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const factor = instrument === 'piano' ? this.PIANO_GAIN_FACTOR : this.GUITAR_GAIN_FACTOR;
    const targetGain = this.BASE_SYSTEM_GAIN * factor;
    this.inputGain.gain.setTargetAtTime(targetGain, now, 0.015);
  }

  public getCurrentInstrument(): 'piano' | 'guitar' {
    return this.currentInstrument;
  }

  /**
   * Transpone frecuencias hacia arriba +1 octava (* 2) si los voicings se generan en octavas graves (< 150 Hz)
   * garantizando que el bloque armónico suene en un registro medio claro y brillante (octavas 3 y 4).
   */
  public transposeToMidRegister(frequencies: number[]): number[] {
    const valid = frequencies.filter((f) => f > 0 && !isNaN(f));
    if (valid.length === 0) return [];

    const lowestFreq = Math.min(...valid);
    // Si la nota más grave del acorde está en octava 2 (ej. cuerda 5ª o 6ª de guitarra, < 155 Hz),
    // transponer todo el acorde +1 octava (* 2) para preservar intervalos y situarlo en octavas 3 y 4.
    if (lowestFreq < 155) {
      return valid.map((f) => f * 2);
    }
    return valid;
  }

  /**
   * Carga soundfont opcional conectado al bus filtrado
   */
  public async loadSoundfont(instrument: 'piano' | 'guitar'): Promise<any> {
    const key = instrument === 'guitar' ? 'acoustic_guitar_nylon' : 'acoustic_grand_piano';
    if (this.soundfontPlayers[key]) return this.soundfontPlayers[key];
    if (this.loadingSoundfonts[key]) return this.loadingSoundfonts[key];

    const ctx = this.getContext();
    const destNode = this.inputGain!;

    this.loadingSoundfonts[key] = (async () => {
      try {
        const player = await Soundfont.instrument(ctx, key as any, {
          soundfont: 'FluidR3_GM',
          destination: destNode,
        });
        this.soundfontPlayers[key] = player;
        return player;
      } catch (err) {
        return null;
      } finally {
        delete this.loadingSoundfonts[key];
      }
    })();

    return this.loadingSoundfonts[key];
  }

  /**
   * Reproduce un acorde en Linus Academia:
   * - Transpuesto a registro medio (+1 octava si estaba en octava 2)
   * - Procesado obligatoriamente por el filtro Pasa-Altos (High-Pass @ 180Hz)
   * - Con compensación polifónica anti-saturación
   */
  public playChord(
    frequencies: number[],
    instrument: 'piano' | 'guitar' = 'piano',
    options: { strumDelay?: number; baseVolume?: number } = {}
  ): void {
    const rawValid = frequencies.filter((f) => f > 0 && !isNaN(f));
    if (rawValid.length === 0) return;

    // 1. Ajuste de Registro (Octavas 3 y 4)
    const midFreqs = this.transposeToMidRegister(rawValid);

    const ctx = this.getContext();
    const now = ctx.currentTime;
    const dest = this.inputGain!;

    // 2. Balance de Ganancia Condicional en el GainNode principal
    this.setInstrument(instrument);

    const isGuitar = instrument === 'guitar';
    const defaultStrum = isGuitar ? 0.040 : 0.016;
    const strumDelay = options.strumDelay !== undefined ? options.strumDelay : defaultStrum;

    // Escalado polifónico
    const noteCount = midFreqs.length;
    const polyScale = Math.min(0.65, 1.15 / Math.sqrt(Math.max(1, noteCount)));
    const baseVolume = options.baseVolume ?? 0.45;
    const noteGain = baseVolume * polyScale;

    // Intentar Soundfont si está disponible
    const sfKey = isGuitar ? 'acoustic_guitar_nylon' : 'acoustic_grand_piano';
    const sfPlayer = this.soundfontPlayers[sfKey];

    if (sfPlayer) {
      let playedAny = false;
      midFreqs.forEach((freq, idx) => {
        const noteTime = now + idx * strumDelay;
        const played = playSoundfontNote(sfPlayer, freq, noteTime, { gain: noteGain });
        if (played) playedAny = true;
      });
      if (playedAny) return;
    }

    // Síntesis acústica de estudio filtrada a través de High-Pass 180Hz
    midFreqs.forEach((freq, idx) => {
      const noteTime = now + idx * strumDelay;
      if (isGuitar) {
        this.synthesizeGuitarNote(ctx, dest, freq, noteTime, noteGain);
      } else {
        this.synthesizePianoNote(ctx, dest, freq, noteTime, noteGain);
      }
    });
  }

  /**
   * Reproduce una nota de acompañamiento de bajo limpio en registro medio (octava 3),
   * pasando igualmente por el High-Pass Filter @ 180Hz para no saturar los graves.
   */
  public playBassNote(midiNote: number, durationSeconds = 1.5, volume = 0.55): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const dest = this.inputGain!;

    // Si la nota midi está en octava 2 (< 48), elevar a octava 3 (48 a 59)
    const midMidi = midiNote < 48 ? midiNote + 12 : midiNote;
    const freq = 440 * Math.pow(2, (midMidi - 69) / 12);

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc2.detune.setValueAtTime(2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(1800, freq * 3.5), now);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(volume * 0.40, now + 0.015);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(durationSeconds, 2.0));

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(dest);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + durationSeconds + 0.1);
    osc2.stop(now + durationSeconds + 0.1);

    this.activeOscillators.add(osc);
    this.activeOscillators.add(osc2);

    osc.onended = () => {
      this.activeOscillators.delete(osc);
      this.activeOscillators.delete(osc2);
      try {
        osc.disconnect();
        osc2.disconnect();
        filter.disconnect();
        oscGain.disconnect();
      } catch (e) {}
    };
  }

  /**
   * Reproduce una nota individual melódica pasando por el filtro pasa-altos
   */
  public playSingleNote(
    frequency: number,
    instrument: 'piano' | 'guitar' = 'piano',
    volume = 0.38
  ): void {
    if (frequency <= 0 || isNaN(frequency)) return;
    // Si la nota es muy grave (< 155Hz), elevar +1 octava para claridad de estudio
    const cleanFreq = frequency < 155 ? frequency * 2 : frequency;

    const ctx = this.getContext();
    const now = ctx.currentTime;
    const dest = this.inputGain!;

    // Balance de ganancia condicional
    this.setInstrument(instrument);

    if (instrument === 'guitar') {
      this.synthesizeGuitarNote(ctx, dest, cleanFreq, now, volume);
    } else {
      this.synthesizePianoNote(ctx, dest, cleanFreq, now, volume);
    }
  }

  /**
   * Detiene de inmediato cualquier sonido activo
   */
  public stopAll(): void {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators.clear();
  }

  /**
   * Síntesis acústica de guitarra con cuerpo nítido
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

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    osc2.detune.setValueAtTime(3, startTime);
    osc2Gain.gain.setValueAtTime(0.25, startTime);
    osc2.connect(osc2Gain);

    filter.type = 'lowpass';
    const cutoffBase = Math.min(4200, freq * 4.5);
    filter.frequency.setValueAtTime(cutoffBase, startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(350, freq * 1.4), startTime + 0.6);

    const decayDuration = 2.4;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.75, startTime + 0.012);
    gain.gain.setTargetAtTime(0.0001, startTime + 0.04, 0.65);

    osc1.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + decayDuration);
    osc2.stop(startTime + decayDuration);

    this.activeOscillators.add(osc1);
    this.activeOscillators.add(osc2);

    osc1.onended = () => {
      this.activeOscillators.delete(osc1);
      this.activeOscillators.delete(osc2);
      try {
        osc1.disconnect();
        osc2.disconnect();
        osc2Gain.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  }

  /**
   * Síntesis acústica de piano con ataque claro y decaimiento transparente
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
    harm3Gain.gain.setValueAtTime(0.12, startTime);
    harmonic3.connect(harm3Gain);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(5200, freq * 5.5), startTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(400, freq * 1.5), startTime + 0.8);

    const decayDuration = 2.6;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel * 0.75, startTime + 0.010);
    gain.gain.setTargetAtTime(gainLevel * 0.45, startTime + 0.02, 0.35);
    gain.gain.setTargetAtTime(0.0001, startTime + 0.35, 0.85);

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

    this.activeOscillators.add(fundamental);
    this.activeOscillators.add(harmonic2);
    this.activeOscillators.add(harmonic3);

    fundamental.onended = () => {
      this.activeOscillators.delete(fundamental);
      this.activeOscillators.delete(harmonic2);
      this.activeOscillators.delete(harmonic3);
      try {
        fundamental.disconnect();
        harmonic2.disconnect();
        harmonic3.disconnect();
        harm2Gain.disconnect();
        harm3Gain.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  }
}

export const academiaAudio = new AcademiaAudioEngine();
