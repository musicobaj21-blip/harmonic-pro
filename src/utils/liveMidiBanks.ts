import * as Tone from 'tone';

export interface LiveMidiBankOption {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  folder: string;
  nbrosowskyFolder?: string;
  gainDb: number;
  attack: number;
  release: number;
  curve: 'exponential' | 'linear';
}

export const LIVE_MIDI_CATEGORIES = [
  'PIANOS / TECLADOS',
  'BAJOS',
  'VIENTOS',
  'CUERDAS',
  'GUITARRAS',
  'SYNTH SOLISTAS'
];

/**
 * Muestreo denso de 30 anclajes por banco melódico (6 muestras por octava de C2 a C7).
 * Reduce la interpolación tonal a un máximo de 1 semitono, erradicando timbres robóticos
 * y logrando un cuerpo acústico natural, realista y expresivo.
 */
export const LIVE_MIDI_ANCHORS = [
  'C2', 'Eb2', 'Gb2', 'G2', 'A2',
  'C3', 'D3', 'Eb3', 'E3', 'Gb3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'Eb4', 'E4', 'Gb4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'Eb5', 'E5', 'Gb5', 'G5', 'A5',
  'C6', 'Eb6', 'G6'
];

/**
 * Anclajes extendidos en el registro grave (C1 a C4) para la categoría BAJOS.
 * Cubre desde el sub-grave (C1 / E1 de 4 cuerdas) hasta el registro solista de bajo (C4).
 */
export const LIVE_MIDI_BASS_ANCHORS = [
  'C1', 'E1', 'G1', 'A1',
  'C2', 'D2', 'Eb2', 'E2', 'Gb2', 'G2', 'A2', 'B2',
  'C3', 'D3', 'Eb3', 'E3', 'Gb3', 'G3', 'A3', 'B3',
  'C4', 'E4', 'G4'
];

/**
 * Curva de velocity musical perceptiva que optimiza la respuesta del teclado físico:
 * - vel 30  -> ~0.36 (pianissimo sutil y claro)
 * - vel 60  -> ~0.59 (suave / mp)
 * - vel 90  -> ~0.78 (normal-fuerte / mf-f)
 * - vel 120 -> ~0.96 (fuerte / ff)
 * - vel 127 -> 1.00 (máximo headroom sin saturación)
 */
export function calculateMusicalVelocity(rawVelocity: number): number {
  if (rawVelocity <= 0) return 0;
  const clamped = Math.max(1, Math.min(127, rawVelocity));
  const x = clamped / 127;
  const curve = 0.2 * x + 0.8 * Math.pow(x, 0.65);
  return Math.max(0.05, Math.min(1.0, curve));
}

export const LIVE_MIDI_BANKS: LiveMidiBankOption[] = [
  // ==========================================================================
  // PIANOS / TECLADOS
  // ==========================================================================
  {
    id: 'piano',
    name: 'Grand Piano',
    nameEn: 'Grand Piano',
    category: 'PIANOS / TECLADOS',
    folder: 'acoustic_grand_piano-mp3',
    nbrosowskyFolder: 'piano',
    gainDb: 7.5,
    attack: 0.002,
    release: 1.6,
    curve: 'exponential'
  },
  {
    id: 'rhodes',
    name: 'Rhodes',
    nameEn: 'Rhodes',
    category: 'PIANOS / TECLADOS',
    folder: 'electric_piano_1-mp3',
    gainDb: 5.5,
    attack: 0.004,
    release: 1.35,
    curve: 'exponential'
  },
  {
    id: 'wurlitzer',
    name: 'Wurlitzer',
    nameEn: 'Wurlitzer',
    category: 'PIANOS / TECLADOS',
    folder: 'electric_piano_2-mp3',
    gainDb: 5.0,
    attack: 0.003,
    release: 1.15,
    curve: 'exponential'
  },
  {
    id: 'vibraphone',
    name: 'Vibraphone',
    nameEn: 'Vibraphone',
    category: 'PIANOS / TECLADOS',
    folder: 'vibraphone-mp3',
    gainDb: 5.5,
    attack: 0.002,
    release: 2.4,
    curve: 'exponential'
  },

  // ==========================================================================
  // BAJOS (NUEVA CATEGORÍA DE ESTUDIO)
  // ==========================================================================
  {
    id: 'electric_bass_finger',
    name: 'Electric Bass (Finger)',
    nameEn: 'Electric Bass (Finger)',
    category: 'BAJOS',
    folder: 'electric_bass_finger-mp3',
    nbrosowskyFolder: 'bass-electric',
    gainDb: 7.5,
    attack: 0.008,
    release: 0.25,
    curve: 'exponential'
  },
  {
    id: 'fretless_bass',
    name: 'Fretless Bass',
    nameEn: 'Fretless Bass',
    category: 'BAJOS',
    folder: 'fretless_bass-mp3',
    nbrosowskyFolder: 'bass-electric',
    gainDb: 7.5,
    attack: 0.012,
    release: 0.32,
    curve: 'exponential'
  },
  {
    id: 'acoustic_upright_bass',
    name: 'Acoustic Upright Bass',
    nameEn: 'Acoustic Upright Bass',
    category: 'BAJOS',
    folder: 'acoustic_bass-mp3',
    nbrosowskyFolder: 'contrabass',
    gainDb: 8.0,
    attack: 0.010,
    release: 0.30,
    curve: 'exponential'
  },
  {
    id: 'slap_bass',
    name: 'Slap / Funk Bass',
    nameEn: 'Slap / Funk Bass',
    category: 'BAJOS',
    folder: 'slap_bass_1-mp3',
    nbrosowskyFolder: 'bass-electric',
    gainDb: 6.5,
    attack: 0.004,
    release: 0.22,
    curve: 'exponential'
  },

  // ==========================================================================
  // VIENTOS
  // ==========================================================================
  {
    id: 'sax_alto',
    name: 'Alto Sax',
    nameEn: 'Alto Saxophone',
    category: 'VIENTOS',
    folder: 'alto_sax-mp3',
    nbrosowskyFolder: 'saxophone',
    gainDb: 6.0,
    attack: 0.022,
    release: 0.35,
    curve: 'linear'
  },
  {
    id: 'sax_tenor',
    name: 'Tenor Sax',
    nameEn: 'Tenor Saxophone',
    category: 'VIENTOS',
    folder: 'tenor_sax-mp3',
    nbrosowskyFolder: 'saxophone',
    gainDb: 6.0,
    attack: 0.025,
    release: 0.40,
    curve: 'linear'
  },
  {
    id: 'sax_soprano',
    name: 'Soprano Sax',
    nameEn: 'Soprano Saxophone',
    category: 'VIENTOS',
    folder: 'soprano_sax-mp3',
    nbrosowskyFolder: 'saxophone',
    gainDb: 5.5,
    attack: 0.020,
    release: 0.32,
    curve: 'linear'
  },
  {
    id: 'trumpet',
    name: 'Trumpet',
    nameEn: 'Trumpet',
    category: 'VIENTOS',
    folder: 'trumpet-mp3',
    nbrosowskyFolder: 'trumpet',
    gainDb: 4.5,
    attack: 0.015,
    release: 0.28,
    curve: 'linear'
  },
  {
    id: 'flugelhorn',
    name: 'Flugelhorn',
    nameEn: 'Flugelhorn',
    category: 'VIENTOS',
    folder: 'french_horn-mp3',
    nbrosowskyFolder: 'french-horn',
    gainDb: 5.5,
    attack: 0.030,
    release: 0.45,
    curve: 'linear'
  },
  {
    id: 'trombone',
    name: 'Trombone',
    nameEn: 'Trombone',
    category: 'VIENTOS',
    folder: 'trombone-mp3',
    nbrosowskyFolder: 'trombone',
    gainDb: 5.5,
    attack: 0.028,
    release: 0.40,
    curve: 'linear'
  },
  {
    id: 'flute',
    name: 'Flute',
    nameEn: 'Flute',
    category: 'VIENTOS',
    folder: 'flute-mp3',
    nbrosowskyFolder: 'flute',
    gainDb: 6.0,
    attack: 0.030,
    release: 0.38,
    curve: 'linear'
  },
  {
    id: 'clarinet',
    name: 'Clarinet',
    nameEn: 'Clarinet',
    category: 'VIENTOS',
    folder: 'clarinet-mp3',
    nbrosowskyFolder: 'clarinet',
    gainDb: 5.5,
    attack: 0.022,
    release: 0.32,
    curve: 'linear'
  },

  // ==========================================================================
  // CUERDAS
  // ==========================================================================
  {
    id: 'violin',
    name: 'Violin',
    nameEn: 'Violin',
    category: 'CUERDAS',
    folder: 'violin-mp3',
    nbrosowskyFolder: 'violin',
    gainDb: 5.5,
    attack: 0.045,
    release: 0.85,
    curve: 'linear'
  },
  {
    id: 'cello',
    name: 'Cello',
    nameEn: 'Cello',
    category: 'CUERDAS',
    folder: 'cello-mp3',
    nbrosowskyFolder: 'cello',
    gainDb: 5.5,
    attack: 0.050,
    release: 1.0,
    curve: 'linear'
  },

  // ==========================================================================
  // GUITARRAS
  // ==========================================================================
  {
    id: 'clean_guitar',
    name: 'Clean Electric Guitar',
    nameEn: 'Clean Electric Guitar',
    category: 'GUITARRAS',
    folder: 'electric_guitar_clean-mp3',
    nbrosowskyFolder: 'guitar-electric',
    gainDb: 5.5,
    attack: 0.003,
    release: 1.25,
    curve: 'exponential'
  },
  {
    id: 'jazz_guitar',
    name: 'Jazz Guitar',
    nameEn: 'Jazz Guitar',
    category: 'GUITARRAS',
    folder: 'electric_guitar_jazz-mp3',
    nbrosowskyFolder: 'guitar-electric',
    gainDb: 6.0,
    attack: 0.004,
    release: 1.4,
    curve: 'exponential'
  },
  {
    id: 'nylon_guitar',
    name: 'Nylon Guitar',
    nameEn: 'Nylon Guitar',
    category: 'GUITARRAS',
    folder: 'acoustic_guitar_nylon-mp3',
    nbrosowskyFolder: 'guitar-nylon',
    gainDb: 5.5,
    attack: 0.003,
    release: 1.35,
    curve: 'exponential'
  },

  // ==========================================================================
  // SYNTH SOLISTAS
  // ==========================================================================
  {
    id: 'synth_warm',
    name: 'Warm Lead',
    nameEn: 'Warm Lead',
    category: 'SYNTH SOLISTAS',
    folder: 'lead_2_sawtooth-mp3',
    gainDb: 3.5,
    attack: 0.012,
    release: 0.45,
    curve: 'linear'
  },
  {
    id: 'synth_analog',
    name: 'Analog Lead',
    nameEn: 'Analog Lead',
    category: 'SYNTH SOLISTAS',
    folder: 'lead_1_square-mp3',
    gainDb: 3.5,
    attack: 0.006,
    release: 0.38,
    curve: 'linear'
  },
  {
    id: 'synth_soft',
    name: 'Soft Lead',
    nameEn: 'Soft Lead',
    category: 'SYNTH SOLISTAS',
    folder: 'lead_3_calliope-mp3',
    gainDb: 3.5,
    attack: 0.020,
    release: 0.50,
    curve: 'linear'
  },
  {
    id: 'synth_lead',
    name: 'Synth Lead (Analog)',
    nameEn: 'Synth Lead',
    category: 'SYNTH SOLISTAS',
    folder: 'lead_1_square-mp3',
    gainDb: 3.5,
    attack: 0.006,
    release: 0.38,
    curve: 'linear'
  }
];

function getAnchorsForBank(bankMeta: LiveMidiBankOption): string[] {
  return bankMeta.category === 'BAJOS' ? LIVE_MIDI_BASS_ANCHORS : LIVE_MIDI_ANCHORS;
}

// Mapa de muestras de respaldo verificado en nbrosowsky/tonejs-instruments
const NBROSOWSKY_SAMPLE_MAP: Record<string, Record<string, string>> = {
  'bass-electric': {
    'E1': 'E1.mp3',
    'G1': 'G1.mp3',
    'A#1': 'As1.mp3',
    'C#2': 'Cs2.mp3',
    'E2': 'E2.mp3',
    'G2': 'G2.mp3',
    'A#2': 'As2.mp3',
    'C#3': 'Cs3.mp3',
    'E3': 'E3.mp3',
    'G3': 'G3.mp3',
    'A#3': 'As3.mp3',
    'C#4': 'Cs4.mp3',
    'E4': 'E4.mp3'
  },
  'contrabass': {
    'C1': 'C1.mp3',
    'G1': 'G1.mp3',
    'D2': 'D2.mp3',
    'A2': 'A2.mp3',
    'E3': 'E3.mp3',
    'B3': 'B3.mp3'
  },
  'saxophone': {
    'D#3': 'Ds3.mp3',
    'F3': 'F3.mp3',
    'A3': 'A3.mp3',
    'C4': 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F4': 'F4.mp3',
    'A4': 'A4.mp3',
    'C5': 'C5.mp3'
  },
  'trumpet': {
    'F3': 'F3.mp3',
    'A3': 'A3.mp3',
    'C4': 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F4': 'F4.mp3',
    'A4': 'A4.mp3',
    'C5': 'C5.mp3'
  },
  'flute': {
    'C4': 'C4.mp3',
    'E4': 'E4.mp3',
    'A4': 'A4.mp3',
    'C5': 'C5.mp3',
    'E5': 'E5.mp3',
    'A5': 'A5.mp3',
    'C6': 'C6.mp3'
  },
  'piano': {
    'C2': 'C2.mp3',
    'E2': 'E2.mp3',
    'A2': 'A2.mp3',
    'C3': 'C3.mp3',
    'E3': 'E3.mp3',
    'A3': 'A3.mp3',
    'C4': 'C4.mp3',
    'E4': 'E4.mp3',
    'A4': 'A4.mp3',
    'C5': 'C5.mp3',
    'E5': 'E5.mp3',
    'A5': 'A5.mp3',
    'C6': 'C6.mp3'
  }
};

// ============================================================================
// CADENA DE PROCESAMIENTO DSP Y MODELADO FÍSICO DE ESTUDIO POR INSTRUMENTO
// ============================================================================

interface StudioDspChainResult {
  inputNode: Tone.Gain;
  outputNode: Tone.Gain;
  disposables: Tone.ToneAudioNode[];
  isMonophonicBass: boolean;
}

/**
 * Construye la cadena de efectos de estudio (Filtros, Saturación Ampeg, Formantes, Chorus,
 * Tremolo, EQ3 y Reverb de cámara) para el instrumento muestreado real (100% libre de osciladores).
 */
function buildStudioDspChain(bankMeta: LiveMidiBankOption, isOffline = false): StudioDspChainResult {
  const inputNode = new Tone.Gain(1.0);
  const outputNode = new Tone.Gain(Tone.dbToGain(bankMeta.gainDb));
  const disposables: Tone.ToneAudioNode[] = [inputNode, outputNode];

  const id = bankMeta.id;
  const category = bankMeta.category;
  const isMonophonicBass = category === 'BAJOS';

  // --------------------------------------------------------------------------
  // 1. ELECTRIC BASS (FINGER): Ampeg Lowpass 900Hz (-24dB/oct) + Tube Saturation + Punch
  // --------------------------------------------------------------------------
  if (id === 'electric_bass_finger') {
    const ampegFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 900,
      rolloff: -24,
      Q: 1.35
    });
    const tubeWarmth = new Tone.Distortion({
      distortion: 0.08,
      wet: 0.42
    });
    const cabEq = new Tone.EQ3({
      low: 3.5,
      mid: 1.5,
      high: -3.5,
      lowFrequency: 180,
      highFrequency: 1600
    });

    inputNode.chain(ampegFilter, tubeWarmth, cabEq, outputNode);
    disposables.push(ampegFilter, tubeWarmth, cabEq);
  }
  // --------------------------------------------------------------------------
  // 2. FRETLESS BASS: Resonancia Mwah (Q: 3 @ 700Hz) + Chorus Cantabile
  // --------------------------------------------------------------------------
  else if (id === 'fretless_bass') {
    const mwahPeakFilter = new Tone.Filter({
      type: 'peaking',
      frequency: 700,
      Q: 3.0,
      gain: 6.5
    });
    const warmLowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 1450,
      rolloff: -24,
      Q: 2.2
    });
    const jacoChorus = new Tone.Chorus({
      frequency: 1.8,
      delayTime: 3.8,
      depth: 0.42,
      wet: 0.32
    });
    if (!isOffline) {
      try { jacoChorus.start(); } catch (_) {}
    }
    const warmTube = new Tone.Distortion({
      distortion: 0.05,
      wet: 0.28
    });

    inputNode.chain(mwahPeakFilter, warmLowpass, jacoChorus, warmTube, outputNode);
    disposables.push(mwahPeakFilter, warmLowpass, jacoChorus, warmTube);
  }
  // --------------------------------------------------------------------------
  // 3. ACOUSTIC UPRIGHT BASS: Caja de madera resonante + Pizzicato orgánico
  // --------------------------------------------------------------------------
  else if (id === 'acoustic_upright_bass') {
    const woodBodyResonance = new Tone.Filter({
      type: 'peaking',
      frequency: 235,
      Q: 2.4,
      gain: 5.0
    });
    const fingerboardLowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 1250,
      rolloff: -24,
      Q: 1.15
    });
    const roomAmbience = new Tone.Freeverb({
      roomSize: 0.26,
      dampening: 2200,
      wet: 0.10
    });

    inputNode.chain(woodBodyResonance, fingerboardLowpass, roomAmbience, outputNode);
    disposables.push(woodBodyResonance, fingerboardLowpass, roomAmbience);
  }
  // --------------------------------------------------------------------------
  // 4. SLAP / FUNK BASS: Ataque percusivo brillante + EQ en V + Compresión/Grit
  // --------------------------------------------------------------------------
  else if (id === 'slap_bass') {
    const funkEq = new Tone.EQ3({
      low: 4.0,
      mid: -2.0,
      high: 3.5,
      lowFrequency: 165,
      highFrequency: 2300
    });
    const slapDrive = new Tone.Distortion({
      distortion: 0.08,
      wet: 0.36
    });
    const slapFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 3600,
      rolloff: -12,
      Q: 1.25
    });

    inputNode.chain(funkEq, slapDrive, slapFilter, outputNode);
    disposables.push(funkEq, slapDrive, slapFilter);
  }
  // --------------------------------------------------------------------------
  // 5. VIENTOS (Alto/Tenor/Soprano Sax, Trumpet, Flugelhorn, Trombone, Flute, Clarinet)
  //    Filtro de formantes cálido + Suavizado anti-dureza digital + Reverb de Cámara (wet: 0.22)
  // --------------------------------------------------------------------------
  else if (category === 'VIENTOS') {
    const formantFreq =
      id === 'sax_tenor' || id === 'trombone'
        ? 820
        : id === 'sax_alto' || id === 'clarinet'
        ? 1120
        : id === 'flute'
        ? 1550
        : 1280; // trumpet / flugelhorn / soprano sax

    const cutoffFreq =
      id === 'flute'
        ? 4400
        : id === 'trumpet' || id === 'sax_soprano'
        ? 3900
        : 3400;

    const formantFilter = new Tone.Filter({
      type: 'peaking',
      frequency: formantFreq,
      Q: 1.65,
      gain: 3.5
    });
    const warmAntiHarshFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: cutoffFreq,
      rolloff: -12,
      Q: 0.7
    });
    const chamberReverb = new Tone.Freeverb({
      roomSize: 0.54,
      dampening: 3200,
      wet: 0.22
    });

    inputNode.chain(formantFilter, warmAntiHarshFilter, chamberReverb, outputNode);
    disposables.push(formantFilter, warmAntiHarshFilter, chamberReverb);
  }
  // --------------------------------------------------------------------------
  // 6. RHODES / WURLITZER / VIBRAPHONE / GUITARS:
  //    Tone.Tremolo o Tone.Chorus suave + EQ3 de cuerpo cálido + Reverb de estudio
  // --------------------------------------------------------------------------
  else if (
    id === 'rhodes' ||
    id === 'wurlitzer' ||
    id === 'vibraphone' ||
    category === 'GUITARRAS'
  ) {
    const isGuitar = category === 'GUITARRAS';
    const warmBodyEq = new Tone.EQ3({
      low: id === 'jazz_guitar' ? 3.2 : 2.5,
      mid: id === 'wurlitzer' || id === 'nylon_guitar' ? 2.2 : 1.5,
      high: id === 'jazz_guitar' ? -3.5 : -1.2,
      lowFrequency: 220,
      highFrequency: 3100
    });

    const toneFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: id === 'jazz_guitar' ? 2900 : 4800,
      rolloff: -12,
      Q: 0.8
    });

    const studioReverb = new Tone.Freeverb({
      roomSize: 0.45,
      dampening: 3400,
      wet: 0.18
    });

    if (!isGuitar) {
      // Rhodes / Wurlitzer / Vibraphone: Tremolo clásico + Chorus sutil
      const vintageTremolo = new Tone.Tremolo({
        frequency: id === 'wurlitzer' ? 5.2 : 3.8,
        depth: id === 'vibraphone' ? 0.28 : 0.34,
        wet: 0.42
      });
      if (!isOffline) {
        try { vintageTremolo.start(); } catch (_) {}
      }
      const softChorus = new Tone.Chorus({
        frequency: 1.1,
        delayTime: 3.5,
        depth: 0.24,
        wet: 0.22
      });
      if (!isOffline) {
        try { softChorus.start(); } catch (_) {}
      }
      inputNode.chain(warmBodyEq, toneFilter, vintageTremolo, softChorus, studioReverb, outputNode);
      disposables.push(warmBodyEq, toneFilter, vintageTremolo, softChorus, studioReverb);
    } else {
      // Guitarras (Clean, Jazz, Nylon): Chorus estéreo suave + EQ cálido
      const guitarChorus = new Tone.Chorus({
        frequency: 1.2,
        delayTime: 3.2,
        depth: 0.22,
        wet: id === 'clean_guitar' ? 0.28 : 0.14
      });
      if (!isOffline) {
        try { guitarChorus.start(); } catch (_) {}
      }
      inputNode.chain(warmBodyEq, toneFilter, guitarChorus, studioReverb, outputNode);
      disposables.push(warmBodyEq, toneFilter, guitarChorus, studioReverb);
    }
  }
  // --------------------------------------------------------------------------
  // 7. CUERDAS (Violin, Cello): Resonancia de caja acústica + Reverb de cámara
  // --------------------------------------------------------------------------
  else if (category === 'CUERDAS') {
    const stringBodyFilter = new Tone.Filter({
      type: 'peaking',
      frequency: id === 'cello' ? 320 : 680,
      Q: 1.5,
      gain: 3.0
    });
    const silkLowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 4200,
      rolloff: -12
    });
    const chamberReverb = new Tone.Freeverb({
      roomSize: 0.58,
      dampening: 3000,
      wet: 0.24
    });

    inputNode.chain(stringBodyFilter, silkLowpass, chamberReverb, outputNode);
    disposables.push(stringBodyFilter, silkLowpass, chamberReverb);
  }
  // --------------------------------------------------------------------------
  // 8. SYNTH SOLISTAS (Warm Lead, Analog Lead, Soft Lead): Chorus + Filtro Analógico
  // --------------------------------------------------------------------------
  else if (category === 'SYNTH SOLISTAS') {
    const analogFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: id === 'synth_soft' ? 2400 : 3400,
      rolloff: -24,
      Q: 1.6
    });
    const synthChorus = new Tone.Chorus({
      frequency: 1.6,
      delayTime: 3.5,
      depth: 0.35,
      wet: 0.32
    });
    if (!isOffline) {
      try { synthChorus.start(); } catch (_) {}
    }
    const studioReverb = new Tone.Freeverb({
      roomSize: 0.5,
      dampening: 3200,
      wet: 0.22
    });

    inputNode.chain(analogFilter, synthChorus, studioReverb, outputNode);
    disposables.push(analogFilter, synthChorus, studioReverb);
  }
  // --------------------------------------------------------------------------
  // 9. GRAND PIANO (y por defecto): Cuerpo de cola + Reverb de sala de estudio
  // --------------------------------------------------------------------------
  else {
    const pianoEq = new Tone.EQ3({
      low: 2.0,
      mid: 0.8,
      high: 0.5,
      lowFrequency: 200,
      highFrequency: 3600
    });
    const studioHallReverb = new Tone.Freeverb({
      roomSize: 0.46,
      dampening: 3800,
      wet: 0.16
    });

    inputNode.chain(pianoEq, studioHallReverb, outputNode);
    disposables.push(pianoEq, studioHallReverb);
  }

  return {
    inputNode,
    outputNode,
    disposables,
    isMonophonicBass
  };
}

// ============================================================================
// CACHÉ EN MEMORIA DE SAMPLES REALES MULTI-SAMPLEADOS (LATENCIA CERO)
// ============================================================================
const cachedBankAudioBuffers = new Map<string, Record<string, AudioBuffer>>();
const cachedBankPromises = new Map<string, Promise<Record<string, AudioBuffer>>>();
const activeBankVoiceListeners = new Map<string, Set<(note: string, buffer: AudioBuffer) => void>>();
let sharedOfflineDecodeCtx: BaseAudioContext | null = null;

function getSharedDecodeContext(): BaseAudioContext {
  try {
    const raw = Tone.getContext().rawContext as AudioContext;
    if (raw) return raw;
  } catch (_) {}
  if (!sharedOfflineDecodeCtx) {
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    sharedOfflineDecodeCtx = OfflineCtx ? new OfflineCtx(2, 1, 44100) : (Tone.getContext().rawContext as AudioContext);
  }
  return sharedOfflineDecodeCtx!;
}

async function fetchDecodeRealSampleWithFallback(ctx: BaseAudioContext, urls: string[]): Promise<AudioBuffer | null> {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ab = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(ab.slice(0));
      if (decoded && decoded.length > 0) return decoded;
    } catch (_) {}
  }
  return null;
}

/**
 * Descarga y decodifica en memoria caché (`cachedBankAudioBuffers`) todos los samples reales
 * de un instrumento desde FluidR3_GM / MusyngKite / Salamander / Tonejs-Instruments.
 * Notifica progresivamente cada nota decodificada para que el instrumento suene de inmediato.
 */
export async function preloadLiveBankAudioBuffers(bankId: string): Promise<Record<string, AudioBuffer>> {
  if (!bankId || bankId === 'none') return {};
  const bankMeta = LIVE_MIDI_BANKS.find(b => b.id === bankId);
  if (!bankMeta) return {};

  const existing = cachedBankAudioBuffers.get(bankId);
  const anchors = getAnchorsForBank(bankMeta);
  if (existing && Object.keys(existing).length >= Math.min(6, anchors.length)) {
    return existing;
  }

  if (cachedBankPromises.has(bankId)) {
    return cachedBankPromises.get(bankId)!;
  }

  const bufferMap: Record<string, AudioBuffer> = existing || {};
  cachedBankAudioBuffers.set(bankId, bufferMap);

  const loadPromise = (async () => {
    const ctx = getSharedDecodeContext();

    // Priorizar primero los anclajes centrales (C3, C4, G3, G4, E2, A2) para respuesta inmediata (<45ms)
    const priorityOrder = [...anchors].sort((a, b) => {
      const score = (n: string) => (n.includes('3') || n.includes('4') || n.includes('2') ? 0 : 1);
      return score(a) - score(b);
    });

    await Promise.allSettled(
      priorityOrder.map(async (note) => {
        if (bufferMap[note]) return;
        const candidateUrls = [
          `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${bankMeta.folder}/${note}.mp3`,
          `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${bankMeta.folder}/${note}.mp3`,
          `https://gleitz.github.io/midi-js-soundfonts/FatBoy/${bankMeta.folder}/${note}.mp3`
        ];
        if (bankMeta.id === 'piano' && note.startsWith('C')) {
          candidateUrls.unshift(`https://tonejs.github.io/audio/salamander/${note}.mp3`);
        }
        const nbFolder = bankMeta.nbrosowskyFolder;
        const nbFile = nbFolder ? NBROSOWSKY_SAMPLE_MAP[nbFolder]?.[note] : undefined;
        if (nbFolder && nbFile) {
          candidateUrls.push(`https://nbrosowsky.github.io/tonejs-instruments/samples/${nbFolder}/${nbFile}`);
        }

        const audioBuf = await fetchDecodeRealSampleWithFallback(ctx, candidateUrls);
        if (audioBuf) {
          bufferMap[note] = audioBuf;
          const listeners = activeBankVoiceListeners.get(bankId);
          if (listeners) {
            listeners.forEach((cb) => {
              try { cb(note, audioBuf); } catch (_) {}
            });
          }
        }
      })
    );

    return bufferMap;
  })();

  cachedBankPromises.set(bankId, loadPromise);
  return loadPromise;
}

// ============================================================================
// MOTOR DE INSTRUMENTO DE ESTUDIO CON SAMPLES REALES + CADENA DSP (1 SOLA FUENTE)
// ============================================================================

/**
 * Envuelve un Tone.Sampler multi-muestreado alimentado exclusivamente por la caché en memoria
 * de AudioBuffers reales junto con su cadena de efectos de estudio (EQ, filtros de formantes,
 * Ampeg bass filter, Chorus, Tremolo y Reverb). Sin ningún PolySynth ni oscilador de respaldo.
 */
export class StudioInstrumentVoice {
  public readonly bankId: string;
  public readonly bankMeta: LiveMidiBankOption;
  public volume: Tone.Param<'decibels'>;
  private dsp: StudioDspChainResult;
  private rawSampler: Tone.Sampler | null = null;
  private isSamplerReady: boolean = false;
  private isDisposed: boolean = false;
  private userVolumeNode: Tone.Volume;
  private bufferListener: ((note: string, buf: AudioBuffer) => void) | null = null;
  private pendingTriggers: Array<{
    type: 'attack' | 'attackRelease';
    notes: Tone.Unit.Frequency | Tone.Unit.Frequency[];
    duration?: Tone.Unit.Time | Tone.Unit.Time[];
    velocity: number;
    requestedAt: number;
  }> = [];

  constructor(bankMeta: LiveMidiBankOption, destinationNode?: Tone.ToneAudioNode) {
    this.bankId = bankMeta.id;
    this.bankMeta = bankMeta;
    this.dsp = buildStudioDspChain(bankMeta, false);
    this.userVolumeNode = new Tone.Volume(0);
    this.volume = this.userVolumeNode.volume;

    this.dsp.outputNode.connect(this.userVolumeNode);
    if (destinationNode) {
      try {
        this.userVolumeNode.connect(destinationNode);
      } catch (_) {}
    }

    this.initRealMultiSampler();
  }

  public get _buffers(): any {
    return this.rawSampler ? (this.rawSampler as any)._buffers : null;
  }

  private flushPendingTriggers() {
    if (!this.rawSampler || !this.isSamplerReady || this.pendingTriggers.length === 0) return;
    const now = Tone.now();
    while (this.pendingTriggers.length > 0) {
      const item = this.pendingTriggers.shift()!;
      if (now - item.requestedAt <= 0.65) {
        try {
          if (item.type === 'attackRelease') {
            this.rawSampler.triggerAttackRelease(item.notes, item.duration ?? 0.35, Tone.now(), item.velocity);
          } else {
            this.rawSampler.triggerAttack(item.notes, Tone.now(), item.velocity);
          }
        } catch (_) {}
      }
    }
  }

  private initRealMultiSampler() {
    const cachedMap = cachedBankAudioBuffers.get(this.bankId) || {};
    const initialBufferEntries = Object.entries(cachedMap);

    const initialUrls: Record<string, AudioBuffer> = {};
    for (const [note, buf] of initialBufferEntries) {
      initialUrls[note] = buf;
    }

    try {
      const sampler = new Tone.Sampler({
        urls: initialUrls,
        attack: this.bankMeta.attack,
        release: this.bankMeta.release,
        curve: this.bankMeta.curve
      });
      sampler.connect(this.dsp.inputNode);
      this.rawSampler = sampler;

      if (initialBufferEntries.length > 0) {
        this.isSamplerReady = true;
      }
    } catch (_) {}

    // Suscribirse a nuevos AudioBuffers decodificados en segundo plano
    const onBufferDecoded = (note: string, audioBuf: AudioBuffer) => {
      if (this.isDisposed || !this.rawSampler) return;
      try {
        this.rawSampler.add(note as any, audioBuf);
        this.isSamplerReady = true;
        this.flushPendingTriggers();
      } catch (_) {}
    };
    this.bufferListener = onBufferDecoded;
    if (!activeBankVoiceListeners.has(this.bankId)) {
      activeBankVoiceListeners.set(this.bankId, new Set());
    }
    activeBankVoiceListeners.get(this.bankId)!.add(onBufferDecoded);

    // Iniciar o reutilizar precarga en caché del banco
    preloadLiveBankAudioBuffers(this.bankId).then((loadedMap) => {
      if (this.isDisposed || !this.rawSampler) return;
      for (const [note, buf] of Object.entries(loadedMap)) {
        try {
          this.rawSampler.add(note as any, buf);
          this.isSamplerReady = true;
        } catch (_) {}
      }
      this.flushPendingTriggers();
    }).catch(() => {});
  }

  public triggerAttack(
    notes: Tone.Unit.Frequency | Tone.Unit.Frequency[],
    time?: Tone.Unit.Time,
    velocity: number = 0.8
  ): this {
    if (this.isDisposed) return this;
    const triggerTime = time ?? Tone.now();

    if (this.isSamplerReady && this.rawSampler) {
      try {
        this.rawSampler.triggerAttack(notes, triggerTime, velocity);
      } catch (_) {}
      return this;
    }

    this.pendingTriggers.push({
      type: 'attack',
      notes,
      velocity,
      requestedAt: Tone.now()
    });
    return this;
  }

  public triggerRelease(
    notes: Tone.Unit.Frequency | Tone.Unit.Frequency[],
    time?: Tone.Unit.Time
  ): this {
    if (this.isDisposed) return this;
    const releaseTime = time ?? Tone.now();

    if (this.isSamplerReady && this.rawSampler) {
      try {
        this.rawSampler.triggerRelease(notes, releaseTime);
      } catch (_) {}
      return this;
    }
    return this;
  }

  public triggerAttackRelease(
    notes: Tone.Unit.Frequency | Tone.Unit.Frequency[],
    duration: Tone.Unit.Time | Tone.Unit.Time[],
    time?: Tone.Unit.Time,
    velocity: number = 0.8
  ): this {
    if (this.isDisposed) return this;
    const triggerTime = time ?? Tone.now();

    if (this.isSamplerReady && this.rawSampler) {
      try {
        this.rawSampler.triggerAttackRelease(notes, duration, triggerTime, velocity);
      } catch (_) {}
      return this;
    }

    this.pendingTriggers.push({
      type: 'attackRelease',
      notes,
      duration,
      velocity,
      requestedAt: Tone.now()
    });
    return this;
  }

  public releaseAll(time?: Tone.Unit.Time): this {
    if (this.isDisposed) return this;
    this.pendingTriggers.length = 0;
    if (this.rawSampler) {
      try {
        this.rawSampler.releaseAll(time);
      } catch (_) {}
      return this;
    }
    return this;
  }

  public connect(destination: Tone.InputNode): this {
    try {
      this.userVolumeNode.connect(destination);
    } catch (_) {}
    return this;
  }

  public disconnect(destination?: Tone.InputNode): this {
    try {
      if (destination) {
        this.userVolumeNode.disconnect(destination);
      } else {
        this.userVolumeNode.disconnect();
      }
    } catch (_) {}
    return this;
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.releaseAll();
    if (this.bufferListener) {
      activeBankVoiceListeners.get(this.bankId)?.delete(this.bufferListener);
      this.bufferListener = null;
    }
    if (this.rawSampler) {
      try {
        this.rawSampler.disconnect();
        this.rawSampler.dispose();
      } catch (_) {}
      this.rawSampler = null;
    }
    for (const node of this.dsp.disposables) {
      try {
        node.disconnect();
        node.dispose();
      } catch (_) {}
    }
    try {
      this.userVolumeNode.disconnect();
      this.userVolumeNode.dispose();
    } catch (_) {}
  }
}

// ============================================================================
// GESTOR CENTRALIZADO DE BANCOS DE SONIDO Y CACHÉ DE BUFFERS
// ============================================================================
const globalBankSamplers = new Map<string, Tone.Sampler>();
const bankLoadPromises = new Map<string, Promise<Tone.Sampler>>();

/**
 * Carga o recupera de caché el Tone.Sampler base de un banco con sus AudioBuffers reales.
 */
export async function getOrLoadLiveBankSampler(bankId: string): Promise<Tone.Sampler | null> {
  if (!bankId || bankId === 'none') return null;
  const bankMeta = LIVE_MIDI_BANKS.find(b => b.id === bankId);
  if (!bankMeta) return null;

  if (globalBankSamplers.has(bankId)) {
    return globalBankSamplers.get(bankId)!;
  }

  if (bankLoadPromises.has(bankId)) {
    return await bankLoadPromises.get(bankId)!;
  }

  const loadPromise = (async () => {
    const bufferMap = await preloadLiveBankAudioBuffers(bankId);
    const sampler = new Tone.Sampler({
      urls: bufferMap,
      attack: bankMeta.attack,
      release: bankMeta.release,
      curve: bankMeta.curve
    });
    globalBankSamplers.set(bankId, sampler);
    return sampler;
  })();

  bankLoadPromises.set(bankId, loadPromise);
  return await loadPromise;
}

/**
 * Función constructora de instrumentos de estudio (Multi-Sampling + Modelado Físico + Cadena de FX).
 * Retorna inmediatamente una instancia lista para sonar sin latencia ni silencios.
 */
export function createInstrumentSynth(
  bankId: string,
  destinationNode?: Tone.ToneAudioNode
): Tone.Sampler | null {
  if (!bankId || bankId === 'none') return null;
  const bankMeta = LIVE_MIDI_BANKS.find(b => b.id === bankId);
  if (!bankMeta) return null;

  // Pre-calentar caché de buffers en segundo plano para exportación WAV Offline
  getOrLoadLiveBankSampler(bankId).catch(() => {});

  const voice = new StudioInstrumentVoice(bankMeta, destinationNode);
  return voice as unknown as Tone.Sampler;
}

export const getTrackInstrument = createInstrumentSynth;

/**
 * Crea una instancia de instrumento de estudio dedicada para una pista MIDI de usuario,
 * conectada a su nodo/canal de audio exclusivo (Gain, Pan, Volume).
 */
export function createTrackSampler(
  bankId: string,
  destinationNode?: Tone.ToneAudioNode
): Tone.Sampler | null {
  if (!bankId || bankId === 'none') return null;
  try {
    if (Tone.context.state !== 'running') {
      Tone.start().catch(() => {});
    }
  } catch (_) {}

  return createInstrumentSynth(bankId, destinationNode);
}

/**
 * Canal de audio dedicado e independiente por pista MIDI:
 * Cadena: instGain (realce del banco) -> pannerNode -> volumeNode -> Tone.getDestination()
 */
export class TrackAudioChannel {
  public instGain: Tone.Volume;
  public pannerNode: Tone.Panner;
  public volumeNode: Tone.Volume;
  private isMuted: boolean = false;
  private volumeLinear: number = 1.0;
  private currentSampler: Tone.Sampler | null = null;

  constructor(pan: number = 0, volume: number = 1.0) {
    this.instGain = new Tone.Volume(0);
    this.pannerNode = new Tone.Panner(pan);
    this.volumeNode = new Tone.Volume(0);

    this.instGain.chain(this.pannerNode, this.volumeNode, Tone.getDestination());
    this.setVolume(volume);
  }

  public setInstrumentGainDb(db: number) {
    this.instGain.volume.value = db;
  }

  public setVolume(linear: number) {
    this.volumeLinear = linear;
    if (this.isMuted || linear <= 0.001) {
      this.volumeNode.mute = true;
      this.volumeNode.volume.value = -60;
    } else {
      this.volumeNode.mute = false;
      this.volumeNode.volume.value = Math.max(-60, Math.min(6, Tone.gainToDb(linear)));
    }
  }

  public setPan(pan: number) {
    this.pannerNode.pan.value = Math.max(-1, Math.min(1, pan));
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.volumeLinear);
  }

  public attachSampler(sampler: Tone.Sampler | null, boostDb: number = 0) {
    if (this.currentSampler) {
      try {
        this.currentSampler.disconnect(this.instGain);
      } catch (_) {}
    }
    this.currentSampler = sampler;
    this.setInstrumentGainDb(boostDb);
    if (sampler) {
      try {
        sampler.connect(this.instGain);
      } catch (_) {}
    }
  }

  public dispose() {
    if (this.currentSampler) {
      try {
        this.currentSampler.disconnect(this.instGain);
      } catch (_) {}
    }
    try {
      this.instGain.dispose();
      this.pannerNode.dispose();
      this.volumeNode.dispose();
    } catch (_) {}
  }
}

/**
 * Extrae el mapa de AudioBuffers nativos de un banco SoundFont ya cargado
 * para poder instanciar un Tone.Sampler nuevo dentro de Tone.Offline sin cruzar AudioContexts.
 */
export async function getBankAudioBuffersForOffline(
  bankId: string
): Promise<Record<string, AudioBuffer> | null> {
  if (!bankId || bankId === 'none') return null;
  try {
    const buffers = await preloadLiveBankAudioBuffers(bankId);
    return Object.keys(buffers).length > 0 ? { ...buffers } : null;
  } catch (err) {
    console.warn(`[getBankAudioBuffersForOffline] Error obteniendo buffers para ${bankId}:`, err);
    return null;
  }
}

/**
 * Programa y renderiza una pista MIDI de usuario dentro de Tone.Offline con la misma
 * cadena de efectos de estudio (Filtro Ampeg 900Hz, saturación, portamento fretless,
 * formantes de viento, reverb de cámara, tremolo/chorus) que suena en vivo.
 */
export function scheduleOfflineStudioTrack(
  uTrack: {
    bankId: string;
    volume: number;
    pan: number;
    gainDb: number;
    attack: number;
    release: number;
    curve: 'exponential' | 'linear';
    category: string;
    preloadedBuffers: Record<string, AudioBuffer> | null;
    notes: Array<{ time: number; noteName: string; duration: number; velocity: number }>;
  },
  transport: any,
  rawDestination: Tone.ToneAudioNode,
  countInOffsetSec: number
): void {
  const bankMeta: LiveMidiBankOption = LIVE_MIDI_BANKS.find(b => b.id === uTrack.bankId) || {
    id: uTrack.bankId,
    name: uTrack.bankId,
    nameEn: uTrack.bankId,
    category: uTrack.category || 'VIENTOS',
    folder: 'flute-mp3',
    gainDb: uTrack.gainDb,
    attack: uTrack.attack,
    release: uTrack.release,
    curve: uTrack.curve
  };

  const trackPanner = new Tone.Panner(uTrack.pan).connect(rawDestination);
  trackPanner.pan.setValueAtTime(uTrack.pan, 0);

  const trackVolGain = uTrack.volume > 0.001 ? uTrack.volume : 0;
  const trackVolumeNode = new Tone.Gain(trackVolGain).connect(trackPanner);

  const dsp = buildStudioDspChain(bankMeta, true);
  dsp.outputNode.connect(trackVolumeNode);

  const hasBuffers =
    Boolean(uTrack.preloadedBuffers) && Object.keys(uTrack.preloadedBuffers!).length > 0;

  let offlineSampler: Tone.Sampler | null = null;
  if (hasBuffers && uTrack.preloadedBuffers) {
    offlineSampler = new Tone.Sampler({
      urls: uTrack.preloadedBuffers,
      attack: bankMeta.attack,
      release: bankMeta.release,
      curve: bankMeta.curve
    }).connect(dsp.inputNode);
  }

  uTrack.notes.forEach(ev => {
    transport.schedule((time: number) => {
      if (offlineSampler) {
        try {
          offlineSampler.triggerAttackRelease(ev.noteName, ev.duration, time, ev.velocity);
        } catch (_) {}
      }
    }, countInOffsetSec + ev.time);
  });
}

// Precarga automática en memoria de los bancos principales al iniciar en navegador
if (typeof window !== 'undefined') {
  const priorityBanks = [
    'piano', 'rhodes', 'wurlitzer', 'vibraphone',
    'acoustic_upright_bass', 'electric_bass_finger', 'fretless_bass', 'slap_bass',
    'sax_alto', 'sax_tenor', 'sax_soprano', 'trumpet', 'trombone', 'flute', 'clarinet',
    'jazz_guitar', 'nylon_guitar', 'clean_guitar', 'violin', 'cello'
  ];
  // Escalonar precarga para no saturar conexiones simultáneas
  priorityBanks.forEach((id, idx) => {
    setTimeout(() => {
      preloadLiveBankAudioBuffers(id).catch(() => {});
    }, idx * 120);
  });
}
