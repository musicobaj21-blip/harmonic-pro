import Soundfont from 'soundfont-player';
import { getAudioContext, getPlaybackMasterGain } from './audio';

export const SOUNDFONT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Convierte un número MIDI (0-127) al nombre de nota que requiere soundfont-player (ej: 'C4', 'A0', 'Eb3')
 */
export function midiToNoteName(midi: number): string {
  const clamped = Math.max(21, Math.min(108, Math.round(midi)));
  const note = SOUNDFONT_NOTE_NAMES[((clamped % 12) + 12) % 12];
  const octave = Math.floor(clamped / 12) - 1;
  return `${note}${octave}`;
}

/**
 * Convierte una frecuencia en Hz al número MIDI más cercano
 */
export function freqToMidi(freq: number): number {
  if (freq <= 0 || isNaN(freq)) return 60;
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

export const SOUNDFONT_MAPPING: Record<string, string> = {
  piano: 'acoustic_grand_piano',
  epiano: 'electric_piano_1',
  guitar: 'acoustic_guitar_nylon',
  bass: 'acoustic_bass',
  electric_bass: 'electric_bass_finger',
  saxophone: 'alto_sax',
  trumpet: 'trumpet',
  violin: 'violin'
};

const loadedInstruments: Record<string, any> = {};
const loadingPromises: Record<string, Promise<any>> = {};

export async function loadSoundfontInstrument(instrumentName: string): Promise<any> {
  const sfName = SOUNDFONT_MAPPING[instrumentName] || instrumentName || 'acoustic_grand_piano';
  
  if (loadedInstruments[sfName]) {
    return loadedInstruments[sfName];
  }
  if (loadingPromises[sfName]) {
    return loadingPromises[sfName];
  }
  
  const ac = getAudioContext();
  
  loadingPromises[sfName] = (async () => {
    try {
      const player = await Soundfont.instrument(ac, sfName as any, {
        soundfont: 'FluidR3_GM',
        destination: getPlaybackMasterGain()
      });
      loadedInstruments[sfName] = player;
      return player;
    } catch (err) {
      console.warn(`[Soundfont] Fallback al cargar ${sfName}:`, err);
      // Intento de fallback a electric_bass_finger si acoustic_bass falla
      if (sfName === 'acoustic_bass') {
        try {
          const fallbackPlayer = await Soundfont.instrument(ac, 'electric_bass_finger' as any, {
            soundfont: 'FluidR3_GM',
            destination: getPlaybackMasterGain()
          });
          loadedInstruments[sfName] = fallbackPlayer;
          return fallbackPlayer;
        } catch (e) {}
      }
      return null;
    } finally {
      delete loadingPromises[sfName];
    }
  })();
  
  return loadingPromises[sfName];
}

export function getLoadedInstrument(instrumentName: string) {
  const sfName = SOUNDFONT_MAPPING[instrumentName] || instrumentName;
  return loadedInstruments[sfName] || null;
}

/**
 * Ejecuta de forma segura una nota en el reproductor soundfont usando el formato de clave de texto ('C4')
 */
export function playSoundfontNote(
  player: any,
  midiOrFreq: number,
  time: number,
  options: { duration?: number; gain?: number } = {}
): boolean {
  if (!player || typeof player.play !== 'function') return false;
  try {
    // Si es una frecuencia musical (en Hz, >= 20Hz), convertir siempre mediante fórmula logarítmica exacta
    const midi = midiOrFreq >= 20 ? freqToMidi(midiOrFreq) : Math.round(midiOrFreq);
    const noteName = midiToNoteName(midi);

    // Verificar si el reproductor de soundfont tiene buffers cargados para esa nota
    if (player.buffers && !player.buffers[noteName] && !player.buffers[midi]) {
      return false;
    }

    const playTime = Math.max(0, time);
    const node = player.play(noteName, playTime, options);
    return !!node;
  } catch (err) {
    console.warn('[Soundfont] Error al reproducir nota:', err);
    return false;
  }
}
