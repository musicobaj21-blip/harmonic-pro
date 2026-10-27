import * as Tone from 'tone';

export type BankInstrumentKey = 'piano' | 'rhodes' | 'sax' | 'violin' | 'bass' | 'drums' | 'synth';

export interface InstrumentBankMeta {
  id: BankInstrumentKey;
  name: string;
  nameEs: string;
  folder: string;
}

export const INSTRUMENT_BANKS_META: Record<BankInstrumentKey, InstrumentBankMeta> = {
  piano: {
    id: 'piano',
    name: 'Piano',
    nameEs: 'Piano Acústico',
    folder: 'acoustic_grand_piano-mp3',
  },
  rhodes: {
    id: 'rhodes',
    name: 'Rhodes',
    nameEs: 'Piano Rhodes',
    folder: 'electric_piano_1-mp3',
  },
  sax: {
    id: 'sax',
    name: 'Saxophone',
    nameEs: 'Saxofón Alto',
    folder: 'alto_sax-mp3',
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    nameEs: 'Violín Acústico',
    folder: 'violin-mp3',
  },
  bass: {
    id: 'bass',
    name: 'Bass',
    nameEs: 'Bajo Acústico',
    folder: 'acoustic_bass-mp3',
  },
  drums: {
    id: 'drums',
    name: 'Drums',
    nameEs: 'Batería Real',
    folder: 'drums',
  },
  synth: {
    id: 'synth',
    name: 'Synth',
    nameEs: 'Sintetizador Lead',
    folder: 'lead_1_square-mp3',
  },
};

// Conjunto optimizado de notas de anclaje (C, Eb, G, A por octava) para interpolación sin pérdida
export const MELODIC_ANCHORS = [
  'C2', 'Eb2', 'G2', 'A2',
  'C3', 'Eb3', 'G3', 'A3',
  'C4', 'Eb4', 'G4', 'A4',
  'C5', 'Eb5', 'G5', 'A5',
  'C6', 'Eb6'
];

const BASS_ANCHORS = [
  'E1', 'G1', 'A1',
  'C2', 'Eb2', 'G2', 'A2',
  'C3', 'Eb3', 'G3', 'A3',
  'C4'
];

// Muestras acústicas locales de batería (baja latencia, 100% confiables)
const DRUM_NOTE_MAP: Record<string, string> = {
  'C1': '/audio/drums/kick.wav',          // MIDI 36: Kick
  'C#1': '/audio/drums/rim.wav',          // MIDI 37: Rim
  'D1': '/audio/drums/snare.wav',        // MIDI 38: Snare
  'D#1': '/audio/drums/rim.wav',          // MIDI 39: Clave
  'F#1': '/audio/drums/hihat_closed.wav', // MIDI 42: Closed HiHat
  'G#1': '/audio/drums/hihat.wav',        // MIDI 44: Pedal HiHat
  'A#1': '/audio/drums/hihat_open.wav',   // MIDI 46: Open HiHat
  'F1': '/audio/drums/ride.wav',          // MIDI 41: Ride
};

// Generador de objeto urls para Tone.Sampler
function createAnchorUrls(anchors: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const note of anchors) {
    map[note] = `${note}.mp3`;
  }
  return map;
}

// Gestor de instancias de bancos fuera del ciclo de renderizado de React
const bankInstances = new Map<string, Tone.Sampler>();
const bankLoadPromises = new Map<string, Promise<Tone.Sampler>>();

let allBanksLoaded = false;

/**
 * Inicialización obligatoria de AudioContext con evento del usuario (Tone.start())
 */
export async function ensureAudioContextStarted(): Promise<boolean> {
  try {
    const rawContext = Tone.getContext().rawContext as AudioContext;
    if (rawContext && rawContext.state === 'suspended') {
      await rawContext.resume();
    }
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    return Tone.context.state === 'running';
  } catch (err) {
    console.warn('[InstrumentBanks] Error en Tone.start():', err);
    return false;
  }
}

/**
 * Carga un banco específico con Tone.Sampler
 */
export async function loadInstrumentBank(
  key: BankInstrumentKey,
  destinationNode?: Tone.InputNode
): Promise<Tone.Sampler> {
  const cacheKey = key;
  if (bankInstances.has(cacheKey)) {
    const cached = bankInstances.get(cacheKey)!;
    if (destinationNode) {
      try { cached.connect(destinationNode); } catch (_) {}
    }
    // Asegurar que el instrumento esté encadenado a la salida maestra
    try { cached.toDestination(); } catch (_) {}
    return cached;
  }

  if (bankLoadPromises.has(cacheKey)) {
    const ongoing = await bankLoadPromises.get(cacheKey)!;
    if (destinationNode) {
      try { ongoing.connect(destinationNode); } catch (_) {}
    }
    try { ongoing.toDestination(); } catch (_) {}
    return ongoing;
  }

  const loadPromise = (async () => {
    // Asegurar que AudioContext esté listo antes de decodificar
    await ensureAudioContextStarted();

    if (key === 'drums') {
      return new Promise<Tone.Sampler>((resolve) => {
        const sampler = new Tone.Sampler({
          urls: DRUM_NOTE_MAP,
          onload: () => {
            if (destinationNode) {
              try { sampler.connect(destinationNode); } catch (_) {}
            }
            try { sampler.toDestination(); } catch (_) {}
            bankInstances.set(cacheKey, sampler);
            resolve(sampler);
          },
          onerror: (err) => {
            console.warn('[InstrumentBanks] Error cargando batería:', err);
            if (destinationNode) {
              try { sampler.connect(destinationNode); } catch (_) {}
            }
            try { sampler.toDestination(); } catch (_) {}
            bankInstances.set(cacheKey, sampler);
            resolve(sampler);
          }
        });
      });
    }

    const meta = INSTRUMENT_BANKS_META[key];
    const anchors = key === 'bass' ? BASS_ANCHORS : MELODIC_ANCHORS;
    const urls = createAnchorUrls(anchors);
    const baseUrl = `https://gleitz.github.io/midi-js-soundfonts/FatBoy/${meta.folder}/`;
    const initialDb = key === 'piano' ? -10 : key === 'bass' ? 12 : 0;

    return new Promise<Tone.Sampler>((resolve) => {
      const sampler = new Tone.Sampler({
        urls,
        baseUrl,
        volume: initialDb,
        onload: () => {
          sampler.volume.value = initialDb;
          if (destinationNode) {
            try { sampler.connect(destinationNode); } catch (_) {}
          }
          try { sampler.toDestination(); } catch (_) {}
          bankInstances.set(cacheKey, sampler);
          resolve(sampler);
        },
        onerror: (err) => {
          console.warn(`[InstrumentBanks] Error cargando ${key}:`, err);
          sampler.volume.value = initialDb;
          if (destinationNode) {
            try { sampler.connect(destinationNode); } catch (_) {}
          }
          try { sampler.toDestination(); } catch (_) {}
          bankInstances.set(cacheKey, sampler);
          resolve(sampler);
        }
      });
    });
  })();

  bankLoadPromises.set(cacheKey, loadPromise);
  return loadPromise;
}

/**
 * Pre-carga todos los bancos pesados principales e informa al terminar
 */
export async function preloadAllInstrumentBanks(): Promise<void> {
  const keys: BankInstrumentKey[] = ['piano', 'rhodes', 'sax', 'violin', 'bass', 'drums', 'synth'];
  try {
    await Promise.all(keys.map(k => loadInstrumentBank(k)));
    allBanksLoaded = true;
    console.log("Bancos cargados correctamente");
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('instrument-banks-ready'));
    }
  } catch (err) {
    console.warn('[InstrumentBanks] Error durante la pre-carga:', err);
  }
}

export function areAllBanksLoaded(): boolean {
  return allBanksLoaded;
}

export function getCachedBank(key: BankInstrumentKey): Tone.Sampler | null {
  return bankInstances.get(key) || null;
}

/**
 * Disparo seguro de Note On para instrumentos melódicos o percusión
 */
export function triggerBankNoteOn(
  sampler: Tone.Sampler | null,
  midiNote: number,
  velocity: number,
  isDrumTrack: boolean = false
): void {
  if (!sampler) return;

  const velNorm = Math.max(0.01, Math.min(1, velocity / 127));

  try {
    if (isDrumTrack) {
      // Mapeo estándar General MIDI a notas del sampler de batería
      let drumKey = 'D1'; // default snare
      if (midiNote === 35 || midiNote === 36) drumKey = 'C1'; // Kick
      else if (midiNote === 37) drumKey = 'C#1'; // Rim
      else if (midiNote === 38 || midiNote === 40) drumKey = 'D1'; // Snare
      else if (midiNote === 39) drumKey = 'D#1'; // Clave / Rim
      else if (midiNote === 42) drumKey = 'F#1'; // Closed HH
      else if (midiNote === 44) drumKey = 'G#1'; // Pedal HH
      else if (midiNote === 46) drumKey = 'A#1'; // Open HH
      else if (midiNote === 49 || midiNote === 51) drumKey = 'F1'; // Ride / Cymbal
      else {
        const drumKeys = ['C1', 'D1', 'F#1', 'A#1', 'C#1', 'F1', 'G#1'];
        drumKey = drumKeys[midiNote % drumKeys.length];
      }

      sampler.triggerAttack(drumKey, Tone.now(), velNorm);
    } else {
      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      sampler.triggerAttack(noteName, Tone.now(), velNorm);
    }
  } catch (err) {
    console.warn('[InstrumentBanks] triggerBankNoteOn error:', err);
  }
}

/**
 * Disparo seguro de Note Off
 */
export function triggerBankNoteOff(
  sampler: Tone.Sampler | null,
  midiNote: number,
  isDrumTrack: boolean = false
): void {
  if (!sampler || isDrumTrack) return; // Las muestras de batería decaen naturalmente

  try {
    const noteName = Tone.Frequency(midiNote, 'midi').toNote();
    sampler.triggerRelease(noteName, Tone.now());
  } catch (err) {
    console.warn('[InstrumentBanks] triggerBankNoteOff error:', err);
  }
}
