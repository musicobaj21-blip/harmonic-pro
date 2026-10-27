/**
 * Linus Harmony Pro - Motor de Batería Acústica Real (WAV & Acoustic PCM Synthesis)
 * Elimina el sonido sintético "MIDI" y proporciona muestras acústicas reales de estudio.
 *
 * Instrumentos acústicos:
 * - Kick: Bombo acústico de 22" con golpe de maza (beater punch) y cuerpo resonante
 * - Snare: Caja de madera acústica con bordonera articulada y crack realista
 * - HiHat: Charles de bronce de 14" con ataque limpio y decaimiento metálico orgánico
 * - Ride: Platillo Ride de Jazz con "ping" de punta de baqueta de madera y campana cálida
 * - Rim: Cross-stick / Aro de madera brasileño para Bossa Nova
 */

import { getAudioContext, getPlaybackMasterGain } from './audio';

export type AcousticDrumType = 'kick' | 'snare' | 'hihat' | 'ride' | 'rim' | 'tom1' | 'tom2';

// URLs de muestras acústicas reales de jazz grabadas en estudio
const ACOUSTIC_DRUM_URLS: Record<string, string> = {
  kick: '/audio/drumjazz/jazz-drum-kit-kick_G_minor.wav',
  snare: '/audio/drumjazz/jazz-drum-kit-punchy-snare_G_minor.wav',
  hihat: '/audio/drumjazz/jazz-drum-kit-closed-hi-hat_F_minor.wav',
  ride: '/audio/drumjazz/jazz-drum-kit-ride-2.wav',
  rim: '/audio/drumjazz/jazz-drum-kit-rim_C_minor.wav',
};

// Caché de AudioBuffers para baja latencia instantánea
const audioBufferCache: Map<string, AudioBuffer> = new Map();
let isPreloading = false;

/**
 * Genera un impulso acústico sintetizado de alta fidelidad cuando no hay conexión
 * o mientras cargan los archivos de audio de la web.
 */
function createSyntheticAcousticBuffer(ctx: AudioContext, type: AcousticDrumType): AudioBuffer {
  const rate = ctx.sampleRate;

  if (type === 'kick') {
    // Bombo Acústico: Transiente de impacto (click maza @ 3kHz) + barrido de afinación 75Hz -> 48Hz + cola de resonancia
    const length = Math.floor(rate * 0.42);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const pitch = 48 + 90 * Math.exp(-t * 38);
      const phase = 2 * Math.PI * (48 * t - (90 / 38) * (Math.exp(-t * 38) - 1));
      const body = Math.sin(phase) * Math.exp(-t * 9.5);
      const secondHarmonic = Math.sin(phase * 2) * 0.18 * Math.exp(-t * 14);
      // Impacto de maza (beater click)
      const click = (Math.random() * 2 - 1) * Math.exp(-t * 500) * 0.35;
      const sample = (body + secondHarmonic + click) * 0.95;
      left[i] = sample;
      right[i] = sample;
    }
    return buffer;
  }

  if (type === 'snare') {
    // Caja Acústica de Madera: Golpe seco de baqueta + cuerpo de casco (190Hz) + bordonera metálica
    const length = Math.floor(rate * 0.38);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      // Golpe de parche (head tone)
      const tone1 = Math.sin(2 * Math.PI * 188 * t) * Math.exp(-t * 22) * 0.65;
      const tone2 = Math.sin(2 * Math.PI * 335 * t) * Math.exp(-t * 32) * 0.25;
      // Transiente de baqueta
      const crack = (Math.random() * 2 - 1) * Math.exp(-t * 400) * 0.55;
      // Bordonera acústica (snare wire sizzle con decaimiento natural)
      const wire = (Math.random() * 2 - 1) * Math.exp(-t * 11) * 0.6;
      const sample = (tone1 + tone2 + crack + wire) * 0.85;
      left[i] = sample;
      right[i] = sample * (1 + 0.05 * Math.sin(t * 100)); // Ligera apertura estéreo
    }
    return buffer;
  }

  if (type === 'hihat') {
    // Charles / Hi-Hat Acústico: 12 parciales inarmónicos de aleación de bronce + transiente rápido
    const length = Math.floor(rate * 0.12);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const partials = [3120, 3940, 4820, 5450, 6800, 7920, 9240, 10800, 12400];

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      let metal = 0;
      for (let p = 0; p < partials.length; p++) {
        metal += Math.sin(2 * Math.PI * partials[p] * t);
      }
      metal = (metal / partials.length) * 0.5;
      const airNoise = (Math.random() * 2 - 1) * 0.5;
      const envelope = Math.exp(-t * 45); // Choke rápido de hihat cerrado
      const sample = (metal + airNoise) * envelope * 0.8;
      left[i] = sample;
      right[i] = sample;
    }
    return buffer;
  }

  if (type === 'ride') {
    // Platillo Ride de Jazz: "Ping" claro de punta de baqueta sobre la campana + estela cálida de bronce
    const length = Math.floor(rate * 1.6);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const ridePartials = [1180, 2460, 3520, 4810, 6150, 7840, 9400, 11200];

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      // Ping inicial (ataque de madera @ 3500Hz)
      const stickPing = Math.sin(2 * Math.PI * 3520 * t) * Math.exp(-t * 80) * 0.45;
      // Cuerpo del platillo (bronce oscuro y brillante sin sonido de onda cuadrada)
      let cymbalWash = 0;
      for (let p = 0; p < ridePartials.length; p++) {
        cymbalWash += Math.sin(2 * Math.PI * ridePartials[p] * t) * (1 / (p * 0.4 + 1));
      }
      cymbalWash = (cymbalWash / ridePartials.length) * 0.35 * Math.exp(-t * 2.2);
      // Brillo del aire acústico
      const shimmer = (Math.random() * 2 - 1) * 0.15 * Math.exp(-t * 3.5);

      const sample = (stickPing + cymbalWash + shimmer) * 0.8;
      left[i] = sample;
      right[i] = sample * (1 + 0.08 * (Math.random() - 0.5));
    }
    return buffer;
  }

  // Rim / Cross-stick de Bossa Nova: Baqueta de madera apoyada sobre aro metálico
  const length = Math.floor(rate * 0.14);
  const buffer = ctx.createBuffer(2, length, rate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / rate;
    // Resonancia de madera (1250Hz y 2400Hz)
    const wood1 = Math.sin(2 * Math.PI * 1260 * t) * Math.exp(-t * 55) * 0.7;
    const wood2 = Math.sin(2 * Math.PI * 2380 * t) * Math.exp(-t * 70) * 0.4;
    const click = (Math.random() * 2 - 1) * Math.exp(-t * 350) * 0.5;
    const sample = (wood1 + wood2 + click) * 0.85;
    left[i] = sample;
    right[i] = sample;
  }
  return buffer;
}

/**
 * Precarga las muestras de audio acústico en memoria
 */
export async function preloadAcousticDrums(): Promise<void> {
  if (isPreloading) return;
  isPreloading = true;

  const ctx = getAudioContext();

  // Primero asegurar que todos los instrumentos tengan un buffer acústico listo de inmediato
  (['kick', 'snare', 'hihat', 'ride', 'rim'] as AcousticDrumType[]).forEach((type) => {
    if (!audioBufferCache.has(type)) {
      audioBufferCache.set(type, createSyntheticAcousticBuffer(ctx, type));
    }
  });

  // Descargar las grabaciones reales en segundo plano para máxima fidelidad
  await Promise.all(
    Object.entries(ACOUSTIC_DRUM_URLS).map(async ([name, url]) => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          const decoded = await ctx.decodeAudioData(ab);
          audioBufferCache.set(name, decoded);
        }
      } catch (err) {
        // Mantiene el buffer acústico ya generado
      }
    })
  );

  isPreloading = false;
}

/**
 * Reproduce un golpe de batería acústica real
 */
export function playAcousticDrum(
  instrument: AcousticDrumType,
  time: number,
  velocity: number = 0.8,
  destinationNode?: AudioNode
): AudioBufferSourceNode | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  // Obtener o generar el buffer acústico
  let buffer = audioBufferCache.get(instrument);
  if (!buffer) {
    buffer = createSyntheticAcousticBuffer(ctx, instrument);
    audioBufferCache.set(instrument, buffer);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Humanización sutil de volumen y afinación para realismo orgánico
  const subtlePitchDetune = 1.0 + (Math.random() * 0.04 - 0.02);
  source.playbackRate.setValueAtTime(subtlePitchDetune, time);

  const gain = ctx.createGain();
  // Calibración de volumen por tipo de instrumento acústico
  let baseGain = velocity * 0.9;
  if (instrument === 'kick') baseGain = velocity * 1.15;
  if (instrument === 'snare') baseGain = velocity * 1.0;
  if (instrument === 'hihat') baseGain = velocity * 0.65;
  if (instrument === 'ride') baseGain = velocity * 0.75;
  if (instrument === 'rim') baseGain = velocity * 0.95;

  gain.gain.setValueAtTime(baseGain, time);

  source.connect(gain);

  // Enrutar al nodo de destino o al master bus
  const dest = destinationNode || getPlaybackMasterGain();
  gain.connect(dest);

  const playTime = time > 0 ? time : ctx.currentTime;
  source.start(playTime);

  return source;
}
