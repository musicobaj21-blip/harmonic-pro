/**
 * Linus Harmony Pro - Motor de Instrumentos Acústicos Reales de Estudio
 * Proporciona audio acústico real y modelado físico para:
 * - Contrabajo acústico de Jazz (Acoustic Upright Double Bass)
 * - Piano de cola acústico (Grand Piano Salamander & Modelado de Cuerda/Martillo con inharmonicidad)
 * - Guitarra acústica de Jazz / Nylon (Jazz Guitar Archtop / Nylon Pluck)
 * - Piano Eléctrico Rhodes (Silky Vintage Jazz EPiano)
 *
 * Elimina completamente el sonido de sintetizador básico "MIDI" y garantiza
 * que el bajo y los acordes suenen con cuerpo, pegada y presencia acústica.
 */

import { getAudioContext, getPlaybackMasterGain, activeSources } from './audio';
import { getLoadedInstrument, playSoundfontNote } from './soundfont';

// Conversión precisa entre frecuencia (Hz) y número MIDI
export function freqToMidiNote(freq: number): number {
  if (freq <= 0 || isNaN(freq)) return 60;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

export function midiNoteToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Nombres de notas estándar
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function midiToNoteString(midi: number): string {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const name = NOTE_NAMES[clamped % 12];
  const octave = Math.floor(clamped / 12) - 1;
  return `${name}${octave}`;
}

// Cachés de AudioBuffer
const pianoSampleCache = new Map<string, AudioBuffer>();
const bassSampleCache = new Map<string, AudioBuffer>();
const guitarSampleCache = new Map<string, AudioBuffer>();
const syntheticBufferCache = new Map<string, AudioBuffer>();

let isPreloading = false;

// Nodos ancla de Piano Salamander alojados en Tone.js CDN
const SALAMANDER_PIANO_ANCHORS = [
  { note: 'C2', midi: 36, url: 'https://tonejs.github.io/audio/salamander/C2.mp3' },
  { note: 'C3', midi: 48, url: 'https://tonejs.github.io/audio/salamander/C3.mp3' },
  { note: 'C4', midi: 60, url: 'https://tonejs.github.io/audio/salamander/C4.mp3' },
  { note: 'C5', midi: 72, url: 'https://tonejs.github.io/audio/salamander/C5.mp3' },
  { note: 'C6', midi: 84, url: 'https://tonejs.github.io/audio/salamander/C6.mp3' },
];

/**
 * Convierte Base64 a ArrayBuffer en el navegador
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.includes(',') ? base64.split(',')[1] : base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Pre-carga muestras reales acústicas en segundo plano
 */
export async function preloadAcousticInstruments(): Promise<void> {
  if (isPreloading) return;
  isPreloading = true;

  const ctx = getAudioContext();

  // 1. Cargar muestras de Piano de Cola Salamander
  const pianoPromises = SALAMANDER_PIANO_ANCHORS.map(async (anchor) => {
    try {
      const res = await fetch(anchor.url);
      if (!res.ok) return;
      const arrayBuf = await res.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      pianoSampleCache.set(anchor.note, audioBuf);
      pianoSampleCache.set(String(anchor.midi), audioBuf);
    } catch (e) {
      // Ignorar fallback a síntesis acústica
    }
  });

  // 2. Cargar muestras reales de Contrabajo Acústico FluidR3 (Soundfont)
  const bassPromise = (async () => {
    try {
      const res = await fetch('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_bass-mp3.js');
      if (!res.ok) return;
      const jsText = await res.text();
      const fn = new Function('window', jsText + '; return (typeof MIDI !== "undefined" && MIDI.Soundfont) ? MIDI.Soundfont.acoustic_bass : null;');
      const sf = fn({});
      if (sf) {
        const anchors = ['E1', 'A1', 'D2', 'G2', 'C3', 'E3', 'A3'];
        for (const noteName of anchors) {
          const b64 = sf[noteName];
          if (b64) {
            try {
              const arrayBuf = base64ToArrayBuffer(b64);
              const audioBuf = await ctx.decodeAudioData(arrayBuf);
              bassSampleCache.set(noteName, audioBuf);
            } catch (err) {}
          }
        }
      }
    } catch (e) {}
  })();

  // 3. Cargar muestras de Guitarra Acústica FluidR3 (Soundfont)
  const guitarPromise = (async () => {
    try {
      const res = await fetch('https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3.js');
      if (!res.ok) return;
      const jsText = await res.text();
      const fn = new Function('window', jsText + '; return (typeof MIDI !== "undefined" && MIDI.Soundfont) ? MIDI.Soundfont.acoustic_guitar_nylon : null;');
      const sf = fn({});
      if (sf) {
        const anchors = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4', 'A4'];
        for (const noteName of anchors) {
          const b64 = sf[noteName];
          if (b64) {
            try {
              const arrayBuf = base64ToArrayBuffer(b64);
              const audioBuf = await ctx.decodeAudioData(arrayBuf);
              guitarSampleCache.set(noteName, audioBuf);
            } catch (err) {}
          }
        }
      }
    } catch (e) {}
  })();

  await Promise.allSettled([...pianoPromises, bassPromise, guitarPromise]);
}

/**
 * MODELADO ACÚSTICO: CONTRABAJO DE JAZZ (Acoustic Upright Double Bass)
 * Genera un buffer PCM con ataque percusivo de yema de dedo (pluck transient),
 * resonancia de caja de madera acústica y cuerpo resonante.
 */
function createSyntheticAcousticBassBuffer(ctx: AudioContext, freq: number): AudioBuffer {
  const key = `bass_${Math.round(freq * 10)}`;
  if (syntheticBufferCache.has(key)) return syntheticBufferCache.get(key)!;

  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 1.8);
  const buffer = ctx.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const omega = 2 * Math.PI * freq;
  const decayRate = Math.max(1.8, 1.2 + (freq / 80));

  for (let i = 0; i < length; i++) {
    const t = i / rate;

    // 1. Pluck Attack (Ataque de yema en el diapasón de ébano)
    const pluckClick = (Math.random() * 2 - 1) * Math.exp(-t * 220) * 0.35;

    // 2. Fundamental con micro-tensión inicial de cuerda de tripa
    const pitchOffset = Math.exp(-t * 45) * 0.012;
    const currentOmega = omega * (1 + pitchOffset);
    const fundamental = Math.sin(currentOmega * t) * Math.exp(-t * decayRate);

    // 3. Segundo armónico cálido (octava)
    const secondHarmonic = Math.sin(currentOmega * 2 * t) * 0.42 * Math.exp(-t * (decayRate * 1.35));

    // 4. Tercer armónico (cuerpo de madera)
    const thirdHarmonic = Math.sin(currentOmega * 3 * t) * 0.18 * Math.exp(-t * (decayRate * 1.8));

    // 5. Calidez natural de madera (resonancia de tapa de arce a 110Hz)
    const woodResonance = Math.sin(2 * Math.PI * 110 * t) * Math.exp(-t * 18) * 0.12;

    const sample = (fundamental * 1.2 + secondHarmonic + thirdHarmonic + woodResonance + pluckClick) * 0.88;
    left[i] = sample;
    right[i] = sample;
  }

  syntheticBufferCache.set(key, buffer);
  return buffer;
}

/**
 * MODELADO ACÚSTICO: PIANO DE COLA (Grand Piano Acoustic Physical Model)
 * Genera un buffer PCM con golpe de fieltro de martillo, inharmonicidad real de cuerda
 * de acero tensada y resonancia natural de caja armónica.
 */
function createSyntheticAcousticPianoBuffer(ctx: AudioContext, freq: number): AudioBuffer {
  const key = `piano_${Math.round(freq * 10)}`;
  if (syntheticBufferCache.has(key)) return syntheticBufferCache.get(key)!;

  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 2.2);
  const buffer = ctx.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const omega = 2 * Math.PI * freq;
  const decayRate = Math.max(1.0, 0.75 + Math.sqrt(freq) * 0.07);

  // Inharmonicidad física de cuerdas de piano de cola: fn = n * f0 * sqrt(1 + B * n^2)
  const B = 0.0003;
  const f2 = freq * 2 * Math.sqrt(1 + B * 4);
  const f3 = freq * 3 * Math.sqrt(1 + B * 9);
  const f4 = freq * 4 * Math.sqrt(1 + B * 16);

  const w2 = 2 * Math.PI * f2;
  const w3 = 2 * Math.PI * f3;
  const w4 = 2 * Math.PI * f4;

  for (let i = 0; i < length; i++) {
    const t = i / rate;

    // 1. Golpe de fieltro de martillo
    const hammer = Math.sin(2 * Math.PI * 500 * t) * Math.exp(-t * 260) * 0.22;

    // 2. Unísono de cuerdas gemelas con micro-batimiento acústico natural (+/- 0.35 Hz)
    const s1 = Math.sin((omega + 0.35 * 2 * Math.PI) * t);
    const s2 = Math.sin((omega - 0.35 * 2 * Math.PI) * t);
    const stringUnison = (s1 + s2) * 0.5 * Math.exp(-t * decayRate);

    // 3. Parciales inarmónicos auténticos
    const p2 = Math.sin(w2 * t) * 0.35 * Math.exp(-t * (decayRate * 1.35));
    const p3 = Math.sin(w3 * t) * 0.15 * Math.exp(-t * (decayRate * 1.9));
    const p4 = Math.sin(w4 * t) * 0.06 * Math.exp(-t * (decayRate * 2.7));

    const sample = (stringUnison * 1.20 + p2 + p3 + p4 + hammer) * 0.85;
    left[i] = sample;
    right[i] = sample;
  }

  syntheticBufferCache.set(key, buffer);
  return buffer;
}

/**
 * MODELADO ACÚSTICO: GUITARRA DE JAZZ / NYLON (Acoustic / Archtop Guitar Model)
 */
function createSyntheticAcousticGuitarBuffer(ctx: AudioContext, freq: number): AudioBuffer {
  const key = `guitar_${Math.round(freq * 10)}`;
  if (syntheticBufferCache.has(key)) return syntheticBufferCache.get(key)!;

  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 1.7);
  const buffer = ctx.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const omega = 2 * Math.PI * freq;
  const decayRate = Math.max(1.7, 1.2 + (freq / 180));

  for (let i = 0; i < length; i++) {
    const t = i / rate;

    // Pluck snap / ataque de púa o yema
    const pluck = Math.sin(2 * Math.PI * 920 * t) * Math.exp(-t * 260) * 0.32;

    // Cuerda pulsada
    const body = Math.sin(omega * t) * Math.exp(-t * decayRate);
    const h2 = Math.sin(omega * 2 * t) * 0.36 * Math.exp(-t * (decayRate * 1.6));
    const h3 = Math.sin(omega * 3 * t) * 0.14 * Math.exp(-t * (decayRate * 2.3));

    // Resonancia de caja de tapa armónica (220 Hz)
    const boxResonance = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 18) * 0.12;

    const sample = (body * 1.05 + h2 + h3 + boxResonance + pluck) * 0.85;
    left[i] = sample;
    right[i] = sample;
  }

  syntheticBufferCache.set(key, buffer);
  return buffer;
}

/**
 * MODELADO DE PIANO ELÉCTRICO RHODES (Vintage Electric Piano)
 */
function createSyntheticAcousticEPianoBuffer(ctx: AudioContext, freq: number): AudioBuffer {
  const key = `epiano_${Math.round(freq * 10)}`;
  if (syntheticBufferCache.has(key)) return syntheticBufferCache.get(key)!;

  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 2.0);
  const buffer = ctx.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const omega = 2 * Math.PI * freq;
  const decayRate = Math.max(1.1, 0.8 + (freq / 380));

  for (let i = 0; i < length; i++) {
    const t = i / rate;

    // Campana de varilla metálica Rhodes (tine bell transient)
    const tineBell = Math.sin(omega * 7 * t) * 0.16 * Math.exp(-t * 24);

    // Fundamental redonda
    const fundamental = Math.sin(omega * t) * Math.exp(-t * decayRate);

    // Armónicos cálidos de pickup electromagnético
    const h2 = Math.sin(omega * 2 * t) * 0.22 * Math.exp(-t * (decayRate * 1.5));
    const h3 = Math.sin(omega * 3 * t) * 0.07 * Math.exp(-t * (decayRate * 2.2));

    const leftSample = (fundamental + h2 + h3 + tineBell * 1.1) * 0.85;
    const rightSample = (fundamental + h2 * 0.95 + h3 * 1.05 + tineBell * 0.9) * 0.85;

    left[i] = leftSample;
    right[i] = rightSample;
  }

  syntheticBufferCache.set(key, buffer);
  return buffer;
}

/**
 * Encuentra el buffer ancla más cercano en el mapa de muestras
 */
function getNearestAnchorBuffer(
  sampleMap: Map<string, AudioBuffer>,
  targetMidi: number
): { buffer: AudioBuffer; anchorMidi: number } | null {
  if (sampleMap.size === 0) return null;

  let bestBuffer: AudioBuffer | null = null;
  let minDiff = Infinity;
  let bestAnchorMidi = 60;

  for (const [key, buffer] of sampleMap.entries()) {
    let anchorMidi = parseInt(key, 10);
    if (isNaN(anchorMidi)) {
      const match = key.match(/^([A-G][b#]?)(-?[0-9])$/);
      if (match) {
        const noteMap: Record<string, number> = {
          C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
        };
        anchorMidi = noteMap[match[1]] + (parseInt(match[2], 10) + 1) * 12;
      }
    }

    if (!isNaN(anchorMidi)) {
      const diff = Math.abs(targetMidi - anchorMidi);
      if (diff < minDiff) {
        minDiff = diff;
        bestBuffer = buffer;
        bestAnchorMidi = anchorMidi;
      }
    }
  }

  return bestBuffer ? { buffer: bestBuffer, anchorMidi: bestAnchorMidi } : null;
}

export function parsePitchInput(freqOrMidi: number): { freq: number; midi: number } {
  if (freqOrMidi <= 0 || isNaN(freqOrMidi)) return { freq: 440, midi: 69 };
  if (freqOrMidi < 20) {
    const f = midiNoteToFreq(freqOrMidi);
    return { freq: f, midi: Math.round(freqOrMidi) };
  }
  const f = freqOrMidi;
  const m = freqToMidiNote(f);
  return { freq: f, midi: m };
}

/**
 * REPRODUCE UNA NOTA DE CONTRABAJO ACÚSTICO (Acoustic Upright Double Bass)
 */
export function playAcousticBassNote(
  freqOrMidi: number,
  time: number,
  durationBeats: number = 1.0,
  velocity: number = 1.0,
  destinationNode?: AudioNode
): AudioBufferSourceNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const playTime = Math.max(time, ctx.currentTime + 0.003);
  const { freq, midi: targetMidi } = parsePitchInput(freqOrMidi);

  // 1. Priorizar Soundfont real FluidR3 si está cargado
  const sfPlayer = getLoadedInstrument('bass');
  if (sfPlayer) {
    const ok = playSoundfontNote(sfPlayer, targetMidi, playTime, {
      duration: Math.max(0.4, durationBeats * 0.6),
      gain: velocity * 1.15
    });
    if (ok) return null;
  }

  // 2. Intentar usar muestra ancla descargada
  let buffer: AudioBuffer | null = null;
  let playbackRate = 1.0;

  const nearest = getNearestAnchorBuffer(bassSampleCache, targetMidi);
  if (nearest) {
    buffer = nearest.buffer;
    playbackRate = Math.pow(2, (targetMidi - nearest.anchorMidi) / 12);
  } else {
    buffer = createSyntheticAcousticBassBuffer(ctx, freq);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(playbackRate, playTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(850, playTime);
  filter.frequency.exponentialRampToValueAtTime(360, playTime + 0.35);

  const gainNode = ctx.createGain();
  const noteDurationSeconds = Math.max(0.2, durationBeats * (60 / 120));
  const baseGain = velocity * 1.15;

  gainNode.gain.setValueAtTime(0.0001, playTime);
  gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(baseGain * 0.45, playTime + 0.25);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, playTime + Math.min(noteDurationSeconds * 1.1, 1.8));

  source.connect(filter);
  filter.connect(gainNode);

  const dest = destinationNode || getPlaybackMasterGain();
  gainNode.connect(dest);

  source.start(playTime);
  activeSources.add(source);

  source.onended = () => {
    activeSources.delete(source);
    try {
      source.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    } catch (e) {}
  };

  return source;
}

/**
 * REPRODUCE UNA NOTA DE PIANO DE COLA ACÚSTICO (Salamander Grand Piano)
 */
export function playAcousticPianoNote(
  freqOrMidi: number,
  time: number,
  durationSeconds: number = 1.5,
  velocity: number = 1.0,
  destinationNode?: AudioNode
): AudioBufferSourceNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const playTime = Math.max(time, ctx.currentTime + 0.003);
  const { freq, midi: targetMidi } = parsePitchInput(freqOrMidi);

  // 1. Priorizar Soundfont real FluidR3 si está listo
  const sfPlayer = getLoadedInstrument('piano');
  if (sfPlayer) {
    const ok = playSoundfontNote(sfPlayer, targetMidi, playTime, {
      duration: durationSeconds,
      gain: velocity * 0.95
    });
    if (ok) return null;
  }

  // 2. Muestras ancla Salamander Grand Piano
  let buffer: AudioBuffer | null = null;
  let playbackRate = 1.0;

  const nearest = getNearestAnchorBuffer(pianoSampleCache, targetMidi);
  if (nearest) {
    buffer = nearest.buffer;
    playbackRate = Math.pow(2, (targetMidi - nearest.anchorMidi) / 12);
  } else {
    buffer = createSyntheticAcousticPianoBuffer(ctx, freq);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(playbackRate, playTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4200, playTime);
  filter.frequency.exponentialRampToValueAtTime(1800, playTime + 0.4);

  const gainNode = ctx.createGain();
  const baseGain = velocity * 0.90;
  const isStaccato = durationSeconds <= 0.20;
  const releaseTime = playTime + durationSeconds;

  if (isStaccato) {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.008);
    gainNode.gain.setValueAtTime(baseGain * 0.75, releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.02);
  } else {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(baseGain * 0.48, playTime + 0.35);
    gainNode.gain.setTargetAtTime(0.0001, releaseTime, 0.8);
  }

  source.connect(filter);
  filter.connect(gainNode);

  const dest = destinationNode || getPlaybackMasterGain();
  gainNode.connect(dest);

  source.start(playTime);
  source.stop(releaseTime + (isStaccato ? 0.04 : 1.8));
  activeSources.add(source);

  source.onended = () => {
    activeSources.delete(source);
    try {
      source.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    } catch (e) {}
  };

  return source;
}

/**
 * REPRODUCE UNA NOTA DE GUITARRA ACÚSTICA / JAZZ
 */
export function playAcousticGuitarNote(
  freqOrMidi: number,
  time: number,
  durationSeconds: number = 1.2,
  velocity: number = 1.0,
  destinationNode?: AudioNode
): AudioBufferSourceNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const playTime = Math.max(time, ctx.currentTime + 0.003);
  const { freq, midi: targetMidi } = parsePitchInput(freqOrMidi);

  // 1. Priorizar Soundfont real FluidR3 si está listo
  const sfPlayer = getLoadedInstrument('guitar');
  if (sfPlayer) {
    const ok = playSoundfontNote(sfPlayer, targetMidi, playTime, {
      duration: durationSeconds,
      gain: velocity * 0.95
    });
    if (ok) return null;
  }

  // 2. Muestras ancla o modelado de guitarra acústica
  let buffer: AudioBuffer | null = null;
  let playbackRate = 1.0;

  const nearest = getNearestAnchorBuffer(guitarSampleCache, targetMidi);
  if (nearest) {
    buffer = nearest.buffer;
    playbackRate = Math.pow(2, (targetMidi - nearest.anchorMidi) / 12);
  } else {
    buffer = createSyntheticAcousticGuitarBuffer(ctx, freq);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(playbackRate, playTime);

  const gainNode = ctx.createGain();
  const baseGain = velocity * 0.90;
  const isStaccato = durationSeconds <= 0.20;
  const releaseTime = playTime + durationSeconds;

  if (isStaccato) {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.008);
    gainNode.gain.setValueAtTime(baseGain * 0.70, releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.02);
  } else {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.010);
    gainNode.gain.exponentialRampToValueAtTime(baseGain * 0.38, playTime + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime);
  }

  source.connect(gainNode);
  const dest = destinationNode || getPlaybackMasterGain();
  gainNode.connect(dest);

  source.start(playTime);
  source.stop(releaseTime + (isStaccato ? 0.04 : 1.2));
  activeSources.add(source);

  source.onended = () => {
    activeSources.delete(source);
    try {
      source.disconnect();
      gainNode.disconnect();
    } catch (e) {}
  };

  return source;
}

/**
 * REPRODUCE UNA NOTA DE PIANO ELÉCTRICO RHODES (Electric Piano)
 */
export function playAcousticEPianoNote(
  freqOrMidi: number,
  time: number,
  durationSeconds: number = 1.6,
  velocity: number = 1.0,
  destinationNode?: AudioNode
): AudioBufferSourceNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const playTime = Math.max(time, ctx.currentTime + 0.003);
  const { freq, midi: targetMidi } = parsePitchInput(freqOrMidi);

  // 1. Soundfont real Electric Piano 1 si está disponible
  const sfPlayer = getLoadedInstrument('epiano');
  if (sfPlayer) {
    const ok = playSoundfontNote(sfPlayer, targetMidi, playTime, {
      duration: durationSeconds,
      gain: velocity * 0.95
    });
    if (ok) return null;
  }

  // 2. Modelado de Rhodes
  const buffer = createSyntheticAcousticEPianoBuffer(ctx, freq);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(1.0, playTime);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, playTime); // 800Hz-1200Hz cálido y opaco sin estridencias
  filter.Q.setValueAtTime(0.707, playTime);

  const gainNode = ctx.createGain();
  const baseGain = velocity * 0.88;
  const isStaccato = durationSeconds <= 0.20;
  const releaseTime = playTime + durationSeconds;

  if (isStaccato) {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.008);
    gainNode.gain.setValueAtTime(baseGain * 0.70, releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.02);
  } else {
    gainNode.gain.setValueAtTime(0.0001, playTime);
    gainNode.gain.linearRampToValueAtTime(baseGain, playTime + 0.012);
    gainNode.gain.setTargetAtTime(baseGain * 0.45, playTime + 0.012, 0.15);
    gainNode.gain.setTargetAtTime(0.0001, playTime + 0.20, durationSeconds / 2.5);
    gainNode.gain.setTargetAtTime(0.0001, releaseTime, 0.8);
  }

  source.connect(filter);
  filter.connect(gainNode);

  const dest = destinationNode || getPlaybackMasterGain();
  gainNode.connect(dest);

  source.start(playTime);
  source.stop(releaseTime + (isStaccato ? 0.04 : 1.8));
  activeSources.add(source);

  source.onended = () => {
    activeSources.delete(source);
    try {
      source.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    } catch (e) {}
  };

  return source;
}

/**
 * REPRODUCE UN ACORDE COMPLETO (PIANO, GUITARRA O RHODES)
 * - Aplica registro medio limpio (sin solapamiento con el contrabajo)
 * - Aplica rasgueo / articulación auténtica según el instrumento
 * - Aplica headroom dinámico polifónico para evitar distorsión
 */
export function playAcousticChord(
  frequencies: number[],
  time: number,
  durationSeconds: number = 1.5,
  instrument: 'piano' | 'guitar' | 'epiano' = 'piano',
  strumDelay?: number,
  velocity: number = 1.0,
  destinationNode?: AudioNode
): void {
  // Limpieza de frecuencias: asegurar que ninguna nota caiga en el sub-grave (< 130 Hz)
  // para evitar conflicto y distorsión con el contrabajo acústico
  const validFreqs = frequencies
    .filter(f => f > 0 && !isNaN(f))
    .map(f => {
      let freq = f;
      while (freq < 130) freq *= 2;
      while (freq > 780) freq /= 2;
      return freq;
    });

  if (validFreqs.length === 0) return;

  const actualStrum = strumDelay !== undefined
    ? strumDelay
    : (instrument === 'guitar' ? 0.020 : instrument === 'epiano' ? 0.008 : 0.004);

  // Escalado polifónico de headroom para sonido cristalino sin saturación en acordes de 5 o 6 voces
  const polyHeadroom = Math.min(0.85, 1.05 / Math.sqrt(validFreqs.length));
  const chordVelocity = velocity * polyHeadroom;

  validFreqs.forEach((freq, index) => {
    const noteStart = time + index * actualStrum;
    if (instrument === 'guitar') {
      playAcousticGuitarNote(freq, noteStart, durationSeconds, chordVelocity, destinationNode);
    } else if (instrument === 'epiano') {
      playAcousticEPianoNote(freq, noteStart, durationSeconds, chordVelocity, destinationNode);
    } else {
      playAcousticPianoNote(freq, noteStart, durationSeconds, chordVelocity, destinationNode);
    }
  });
}
