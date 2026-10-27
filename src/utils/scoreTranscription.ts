/**
 * Motor Profesional de Transcripción Musical Computacional (MIDI a Partitura)
 * y Renderizador Vectorial SVG Autocontenido (Calidad Imprenta).
 *
 * Arquitectura Completa y Limpia (Especial para Lectura Directa / Lead Sheet):
 * - Niveles 1 a 7: Redonda (w), Blanca (h), Blanca con punto (hd), Negra (q),
 *   Negra con punto (qd), Corcheas (8), Cuartinas (16), Galopas (8-16-16 / 16-16-8),
 *   Saltillos (8d-16 / 16-8d), Síncopa Interna (16-8-16), Tresillo de Corcheas (8t),
 *   Síncopa Larga (8-8~8-8) y Contratiempos.
 * - Módulo A: Catálogo de Figuras Básicas y Silencios hasta Fusa ('32') y Semifusa ('64').
 * - Módulo B (Limpio): Solo Puntillo Simple estándar (hd, qd, 8d) para no confundir al lector.
 * - Módulo C y D: Ligaduras de prolongación internas e inter-compás (Cross-Barline Ties) y Síncopas.
 * - Módulo E: Grupos Irregulares (Dosillo 2, Tresillo de Negra 3 con corchete, Tresillo de Corchea 3,
 *   Quintillo 5, Seisillo 6 y Septillo 7).
 * - Sin inferencia automática de puntos de Staccato para mantener el pentagrama 100% limpio.
 */

import { Song, SongMeasure } from '../types';
import { transposeChordString, transposeRoot } from './music';

export type RhythmicFigureCode =
  | 'w'
  | 'hd'
  | 'h'
  | 'qd'
  | 'q'
  | 'qt'
  | '8d'
  | '8'
  | '8t'
  | '16'
  | '16tuplet'
  | '32'
  | '64';

export type BaseFigureCode = 'w' | 'h' | 'q' | '8' | '16' | '32' | '64';
export type ClefType = 'treble' | 'bass';
export type QuantizationMode = 'clean' | 'detailed';
export type AccidentalSymbol = '' | '#' | 'b' | 'natural';
export type ArticulationType =
  | 'none'
  | 'staccato'
  | 'staccatissimo'
  | 'tenuto'
  | 'accent'
  | 'marcato';

export interface KeySignatureInfo {
  tonality: string;
  type: 'sharp' | 'flat' | 'none';
  count: number;
  preferFlats: boolean;
  defaultLetterAccidentals: Record<number, '' | '#' | 'b'>;
  trebleStaffOffsets: number[];
  bassStaffOffsets: number[];
}

export interface RawMidiNoteInput {
  id?: string;
  midi?: number;
  note?: number;
  noteName?: string;
  time?: number;
  duration?: number;
  startBeat?: number;
  durationBeats?: number;
  startTicks?: number;
  durationTicks?: number;
  bar?: number;
  length?: number;
  pitchPercent?: number;
  velocity?: number;
  articulation?: ArticulationType;
  legato?: boolean;
}

export interface ScoreNotationEvent {
  isRest: boolean;
  startStepInMeasure: number; // 0 .. stepsPerMeasure
  durationSteps: number;
  figure: RhythmicFigureCode;
  baseFigure: BaseFigureCode;
  dots: number; // 0 o 1 (Puntillo simple estándar)
  isTriplet?: boolean;
  tupletNumber?: number; // 2, 3, 5, 6, 7
  tupletGroupId?: string;
  tupletBracket?: boolean; // true cuando lleva corchete ┌─ n ─┐
  tripletGroupId?: string;
  beamGroupId?: string;
  midi: number;
  chordMidis: number[];
  noteName: string;
  letterIndex: number; // 0=C, 1=D, 2=E, 3=F, 4=G, 5=A, 6=B
  octave: number;
  accidental: '' | '#' | 'b';
  displayedAccidental?: AccidentalSymbol;
  tieFromPrev: boolean;
  tieToNext: boolean;
  articulation?: ArticulationType;
}

export interface TranscribedMeasure {
  measureIndex: number;
  stepsPerMeasure?: number;
  events: ScoreNotationEvent[];
}

const SHARP_LETTER_ORDER = [3, 0, 4, 1, 5, 2, 6];
const TREBLE_SHARP_OFFSETS = [8, 5, 9, 6, 3, 7, 4];
const BASS_SHARP_OFFSETS = [6, 3, 7, 4, 1, 5, 2];

const FLAT_LETTER_ORDER = [6, 2, 5, 1, 4, 0, 3];
const TREBLE_FLAT_OFFSETS = [4, 7, 3, 6, 2, 5, 1];
const BASS_FLAT_OFFSETS = [2, 5, 1, 4, 0, 3, -1];

export function parseTimeSignatureBeats(timeSignature: string = '4/4'): {
  numerator: number;
  denominator: number;
  beatsPerBar: number;
  stepsPerMeasure: number;
} {
  const clean = String(timeSignature || '4/4').trim();
  const parts = clean.split('/');
  const num = Math.max(1, parseInt(parts[0], 10) || 4);
  const den = Math.max(1, parseInt(parts[1], 10) || 4);

  let beatsPerBar = num;
  if (den === 8) {
    if (num === 6) beatsPerBar = 3;
    else if (num === 12) beatsPerBar = 4;
    else beatsPerBar = num / 2;
  }
  const stepsPerMeasure = Math.max(4, Math.round(beatsPerBar * 4));
  return {
    numerator: num,
    denominator: den,
    beatsPerBar,
    stepsPerMeasure
  };
}

export function getKeySignatureInfo(rawKey: string = 'C'): KeySignatureInfo {
  const clean = String(rawKey || 'C')
    .trim()
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/\s+/g, '');

  const keyMap: Record<string, { type: 'sharp' | 'flat' | 'none'; count: number }> = {
    C: { type: 'none', count: 0 },
    Am: { type: 'none', count: 0 },
    'A-': { type: 'none', count: 0 },
    G: { type: 'sharp', count: 1 },
    Em: { type: 'sharp', count: 1 },
    'E-': { type: 'sharp', count: 1 },
    D: { type: 'sharp', count: 2 },
    Bm: { type: 'sharp', count: 2 },
    'B-': { type: 'sharp', count: 2 },
    A: { type: 'sharp', count: 3 },
    'F#m': { type: 'sharp', count: 3 },
    'F#-': { type: 'sharp', count: 3 },
    E: { type: 'sharp', count: 4 },
    'C#m': { type: 'sharp', count: 4 },
    'C#-': { type: 'sharp', count: 4 },
    B: { type: 'sharp', count: 5 },
    'G#m': { type: 'sharp', count: 5 },
    'F#': { type: 'sharp', count: 6 },
    'D#m': { type: 'sharp', count: 6 },
    F: { type: 'flat', count: 1 },
    Dm: { type: 'flat', count: 1 },
    'D-': { type: 'flat', count: 1 },
    Bb: { type: 'flat', count: 2 },
    Gm: { type: 'flat', count: 2 },
    'G-': { type: 'flat', count: 2 },
    Eb: { type: 'flat', count: 3 },
    Cm: { type: 'flat', count: 3 },
    'C-': { type: 'flat', count: 3 },
    Ab: { type: 'flat', count: 4 },
    Fm: { type: 'flat', count: 4 },
    'F-': { type: 'flat', count: 4 },
    Db: { type: 'flat', count: 5 },
    'C#': { type: 'flat', count: 5 },
    Bbm: { type: 'flat', count: 5 },
    'Bb-': { type: 'flat', count: 5 },
    'A#m': { type: 'flat', count: 5 },
    Gb: { type: 'flat', count: 6 },
    Ebm: { type: 'flat', count: 6 },
    'Eb-': { type: 'flat', count: 6 },
    'A#': { type: 'flat', count: 2 },
    'D#': { type: 'flat', count: 3 },
    'G#': { type: 'flat', count: 4 }
  };

  const canonicalNameMap: Record<string, string> = {
    'A#': 'Bb',
    'D#': 'Eb',
    'G#': 'Ab',
    'A-': 'Am',
    'E-': 'Em',
    'B-': 'Bm',
    'F#-': 'F#m',
    'C#-': 'C#m',
    'D-': 'Dm',
    'G-': 'Gm',
    'C-': 'Cm',
    'F-': 'Fm',
    'Bb-': 'Bbm',
    'Eb-': 'Ebm'
  };

  const canonicalTonality = canonicalNameMap[clean] || clean;
  const entry = keyMap[canonicalTonality] || keyMap[clean] || { type: 'none', count: 0 };
  const defaultLetterAccidentals: Record<number, '' | '#' | 'b'> = {
    0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: ''
  };

  if (entry.type === 'sharp') {
    for (let i = 0; i < entry.count; i++) {
      defaultLetterAccidentals[SHARP_LETTER_ORDER[i]] = '#';
    }
  } else if (entry.type === 'flat') {
    for (let i = 0; i < entry.count; i++) {
      defaultLetterAccidentals[FLAT_LETTER_ORDER[i]] = 'b';
    }
  }

  const trebleStaffOffsets =
    entry.type === 'sharp'
      ? TREBLE_SHARP_OFFSETS.slice(0, entry.count)
      : entry.type === 'flat'
      ? TREBLE_FLAT_OFFSETS.slice(0, entry.count)
      : [];

  const bassStaffOffsets =
    entry.type === 'sharp'
      ? BASS_SHARP_OFFSETS.slice(0, entry.count)
      : entry.type === 'flat'
      ? BASS_FLAT_OFFSETS.slice(0, entry.count)
      : [];

  return {
    tonality: canonicalTonality,
    type: entry.type,
    count: entry.count,
    preferFlats: entry.type === 'flat',
    defaultLetterAccidentals,
    trebleStaffOffsets,
    bassStaffOffsets
  };
}

export function midiToPitchNotation(
  midi: number,
  preferFlats: boolean = false,
  keySigCount: number = 0
): {
  midi: number;
  noteName: string;
  letterIndex: number;
  octave: number;
  accidental: '' | '#' | 'b';
  absDiatonicStep: number;
} {
  const clamped = Math.max(21, Math.min(108, Math.round(midi)));
  const octave = Math.floor(clamped / 12) - 1;
  const pc = ((clamped % 12) + 12) % 12;

  const sharpMap: Array<{ letter: string; idx: number; acc: '' | '#' | 'b' }> = [
    { letter: 'C', idx: 0, acc: '' },
    { letter: 'C', idx: 0, acc: '#' },
    { letter: 'D', idx: 1, acc: '' },
    { letter: 'D', idx: 1, acc: '#' },
    { letter: 'E', idx: 2, acc: '' },
    { letter: 'F', idx: 3, acc: '' },
    { letter: 'F', idx: 3, acc: '#' },
    { letter: 'G', idx: 4, acc: '' },
    { letter: 'G', idx: 4, acc: '#' },
    { letter: 'A', idx: 5, acc: '' },
    { letter: 'A', idx: 5, acc: '#' },
    { letter: 'B', idx: 6, acc: '' }
  ];

  const useFSharpInFlatKey = preferFlats && keySigCount <= 3;

  const flatMap: Array<{ letter: string; idx: number; acc: '' | '#' | 'b' }> = [
    { letter: 'C', idx: 0, acc: '' },
    { letter: 'D', idx: 1, acc: 'b' },
    { letter: 'D', idx: 1, acc: '' },
    { letter: 'E', idx: 2, acc: 'b' },
    { letter: 'E', idx: 2, acc: '' },
    { letter: 'F', idx: 3, acc: '' },
    useFSharpInFlatKey
      ? { letter: 'F', idx: 3, acc: '#' }
      : { letter: 'G', idx: 4, acc: 'b' },
    { letter: 'G', idx: 4, acc: '' },
    { letter: 'A', idx: 5, acc: 'b' },
    { letter: 'A', idx: 5, acc: '' },
    { letter: 'B', idx: 6, acc: 'b' },
    { letter: 'B', idx: 6, acc: '' }
  ];

  const entry = preferFlats ? flatMap[pc] : sharpMap[pc];
  return {
    midi: clamped,
    noteName: `${entry.letter}${entry.acc}${octave}`,
    letterIndex: entry.idx,
    octave,
    accidental: entry.acc,
    absDiatonicStep: octave * 7 + entry.idx
  };
}

export function getStaffStepOffset(absDiatonicStep: number, clef: ClefType): number {
  const bottomLineStep = clef === 'bass' ? 18 : 30;
  return absDiatonicStep - bottomLineStep;
}

export function detectTrackClef(
  notes: RawMidiNoteInput[],
  instrumentName?: string,
  bankId?: string
): ClefType {
  const instLower = `${instrumentName || ''} ${bankId || ''}`.toLowerCase();
  if (
    instLower.includes('bass') ||
    instLower.includes('bajo') ||
    instLower.includes('contrabajo') ||
    instLower.includes('upright') ||
    instLower.includes('fretless') ||
    instLower.includes('cello')
  ) {
    return 'bass';
  }

  if (Array.isArray(notes) && notes.length > 0) {
    const midis = notes
      .map(n => {
        if (typeof n.midi === 'number' && !isNaN(n.midi)) return n.midi;
        if (typeof n.note === 'number' && !isNaN(n.note)) return n.note;
        if (typeof n.pitchPercent === 'number' && !isNaN(n.pitchPercent)) {
          return Math.round((n.pitchPercent / 100) * (84 - 36) + 36);
        }
        return 60;
      })
      .filter(m => m >= 21 && m <= 108);

    if (midis.length > 0) {
      const avgMidi = midis.reduce((a, b) => a + b, 0) / midis.length;
      if (avgMidi < 52) {
        return 'bass';
      }
    }
  }

  return 'treble';
}

export function computeOptimalOctaveShiftSemitones(
  midis: number[],
  clef: ClefType
): number {
  if (!midis || midis.length === 0) return 0;

  let shift = 0;
  if (clef === 'treble') {
    let shifted = midis.map(m => m + shift);
    let highCount = shifted.filter(m => m > 81).length;
    let avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;

    while ((highCount > shifted.length * 0.45 || avg > 79) && shift > -36) {
      shift -= 12;
      shifted = midis.map(m => m + shift);
      highCount = shifted.filter(m => m > 81).length;
      avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
    }

    while (avg < 56 && shift < 24) {
      shift += 12;
      shifted = midis.map(m => m + shift);
      avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
    }
  } else {
    let shifted = midis.map(m => m + shift);
    let avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
    while (avg > 62 && shift > -24) {
      shift -= 12;
      shifted = midis.map(m => m + shift);
      avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
    }
    while (avg < 38 && shift < 24) {
      shift += 12;
      shifted = midis.map(m => m + shift);
      avg = shifted.reduce((a, b) => a + b, 0) / shifted.length;
    }
  }

  return shift;
}

/**
 * Descomposición en figuras estándar usando únicamente Puntillo Simple (hd, qd, 8d)
 * y ligaduras limpias cuando corresponde (ej. 14 steps = hd + 8 ligada), evitando
 * dobles o triples puntillos que confundan la lectura a primera vista.
 */
function decomposeSpanToStandardFigures(
  startStep: number,
  durationSteps: number,
  isRest: boolean,
  mode: QuantizationMode,
  allowSubSixteenthInThisSpan: boolean = false
): Array<{
  steps: number;
  figure: RhythmicFigureCode;
  baseFigure: BaseFigureCode;
  dots: number;
}> {
  if (Math.abs(durationSteps - 0.25) < 0.04) {
    return [{ steps: 0.25, figure: '64', baseFigure: '64', dots: 0 }];
  }
  if (Math.abs(durationSteps - 0.5) < 0.04) {
    return [{ steps: 0.5, figure: '32', baseFigure: '32', dots: 0 }];
  }

  const cleanCatalog: Array<{
    steps: number;
    figure: RhythmicFigureCode;
    baseFigure: BaseFigureCode;
    dots: number;
  }> = [
    { steps: 16, figure: 'w', baseFigure: 'w', dots: 0 },
    { steps: 12, figure: 'hd', baseFigure: 'h', dots: 1 },
    { steps: 8, figure: 'h', baseFigure: 'h', dots: 0 },
    { steps: 6, figure: 'qd', baseFigure: 'q', dots: 1 },
    { steps: 4, figure: 'q', baseFigure: 'q', dots: 0 },
    { steps: 2, figure: '8', baseFigure: '8', dots: 0 }
  ];

  const detailedCatalog: Array<{
    steps: number;
    figure: RhythmicFigureCode;
    baseFigure: BaseFigureCode;
    dots: number;
  }> = [
    ...cleanCatalog.slice(0, 5),
    { steps: 3, figure: '8d', baseFigure: '8', dots: 1 },
    { steps: 2, figure: '8', baseFigure: '8', dots: 0 },
    { steps: 1, figure: '16', baseFigure: '16', dots: 0 },
    { steps: 0.5, figure: '32', baseFigure: '32', dots: 0 },
    { steps: 0.25, figure: '64', baseFigure: '64', dots: 0 }
  ];

  const useDetailed =
    mode === 'detailed' ||
    allowSubSixteenthInThisSpan ||
    durationSteps < 2 ||
    durationSteps === 3;
  const catalog = useDetailed ? detailedCatalog : cleanCatalog;
  const out: Array<{
    steps: number;
    figure: RhythmicFigureCode;
    baseFigure: BaseFigureCode;
    dots: number;
  }> = [];

  let rem = useDetailed
    ? Math.max(0.25, Math.round(durationSteps * 4) / 4)
    : Math.max(2, Math.round(durationSteps / 2) * 2);
  let cur = startStep;

  while (rem > 0.05) {
    if (isRest) {
      if (Math.abs(cur % 4) < 0.05 && Math.abs(rem - 2) < 0.05) {
        out.push({ steps: 2, figure: '8', baseFigure: '8', dots: 0 });
        break;
      }
      if (cur === 0 && rem >= 16) {
        out.push({ steps: 16, figure: 'w', baseFigure: 'w', dots: 0 });
        break;
      }
      if ((cur === 0 || cur === 8) && rem >= 8) {
        out.push({ steps: 8, figure: 'h', baseFigure: 'h', dots: 0 });
        rem -= 8;
        cur += 8;
        continue;
      }
      if (Math.abs(cur % 4) > 0.05) {
        const toBeat = 4 - (cur % 4);
        const matchSub =
          catalog.find(c => c.steps <= toBeat + 0.02 && c.dots === 0) ||
          catalog[catalog.length - 1];
        out.push(matchSub);
        rem -= matchSub.steps;
        cur += matchSub.steps;
        continue;
      }
      if (rem >= 4) {
        out.push({ steps: 4, figure: 'q', baseFigure: 'q', dots: 0 });
        rem -= 4;
        cur += 4;
        continue;
      }
    } else {
      if (Math.abs((cur % 4) - 1) < 0.05 && Math.abs(rem - 2) < 0.05) {
        out.push({ steps: 2, figure: '8', baseFigure: '8', dots: 0 });
        break;
      }

      if (Math.abs((cur % 4) - 2) < 0.05 && rem > 2.05) {
        out.push({ steps: 2, figure: '8', baseFigure: '8', dots: 0 });
        rem -= 2;
        cur += 2;
        continue;
      }

      if (Math.abs((cur % 4) - 3) < 0.05 && rem > 1.05) {
        out.push({ steps: 1, figure: '16', baseFigure: '16', dots: 0 });
        rem -= 1;
        cur += 1;
        continue;
      }

      const exact = catalog.find(c => Math.abs(c.steps - rem) < 0.04);
      if (exact) {
        out.push(exact);
        break;
      }

      if (Math.abs(rem - 14) < 0.05) {
        out.push({ steps: 12, figure: 'hd', baseFigure: 'h', dots: 1 });
        rem -= 12;
        cur += 12;
        continue;
      }

      if (Math.abs(rem - 10) < 0.05) {
        out.push({ steps: 8, figure: 'h', baseFigure: 'h', dots: 0 });
        rem -= 8;
        cur += 8;
        continue;
      }
    }

    const best =
      catalog.find(c => c.steps <= rem + 0.02 && (!isRest || c.dots === 0)) ||
      catalog[catalog.length - 1];
    out.push(best);
    rem -= best.steps;
    cur += best.steps;
  }

  return out;
}

/**
 * MOTOR DE TRANSCRIPCIÓN RÍTMICA LIMPIO (SIN STACCATOS AUTOMÁTICOS)
 */
export function transcribeMidiTrackToMeasures(
  notes: RawMidiNoteInput[],
  bpm: number = 120,
  totalMeasures: number = 16,
  globalKey: string = 'C',
  quantizationMode: QuantizationMode = 'clean',
  clefOverride?: ClefType,
  timeSignature: string = '4/4'
): TranscribedMeasure[] {
  const safeBpm = Math.max(30, Math.min(300, Number(bpm) || 120));
  const secondsPerBeat = 60 / safeBpm;
  const { beatsPerBar, stepsPerMeasure } = parseTimeSignatureBeats(timeSignature);
  const keySig = getKeySignatureInfo(globalKey);
  const preferFlats = keySig.preferFlats;

  const rawParsed: Array<{
    startBeat: number;
    durationBeats: number;
    midi: number;
    articulation?: ArticulationType;
  }> = [];
  const rawMidisForOctave: number[] = [];

  for (const n of notes || []) {
    let midi = 60;
    if (typeof n.midi === 'number' && !isNaN(n.midi)) {
      midi = Math.round(n.midi);
    } else if (typeof n.note === 'number' && !isNaN(n.note)) {
      midi = Math.round(n.note);
    } else if (typeof n.pitchPercent === 'number' && !isNaN(n.pitchPercent)) {
      midi = Math.round((n.pitchPercent / 100) * (84 - 36) + 36);
    }
    midi = Math.max(21, Math.min(108, midi));
    rawMidisForOctave.push(midi);

    let startBeat = 0;
    if (typeof n.startBeat === 'number' && !isNaN(n.startBeat)) {
      startBeat = Math.max(0, n.startBeat);
    } else if (typeof n.startTicks === 'number' && !isNaN(n.startTicks)) {
      startBeat = Math.max(0, n.startTicks / 480);
    } else if (typeof n.bar === 'number' && !isNaN(n.bar)) {
      startBeat = Math.max(0, (n.bar - 1.0) * beatsPerBar);
    } else if (typeof n.time === 'number' && !isNaN(n.time)) {
      startBeat = Math.max(0, n.time / secondsPerBeat);
    }

    let durationBeats = 0.5;
    if (typeof n.durationBeats === 'number' && !isNaN(n.durationBeats)) {
      durationBeats = Math.max(0.03, n.durationBeats);
    } else if (typeof n.durationTicks === 'number' && !isNaN(n.durationTicks)) {
      durationBeats = Math.max(0.03, n.durationTicks / 480);
    } else if (typeof n.length === 'number' && !isNaN(n.length)) {
      durationBeats = Math.max(0.03, n.length * beatsPerBar);
    } else if (typeof n.duration === 'number' && !isNaN(n.duration)) {
      durationBeats = Math.max(0.03, n.duration / secondsPerBeat);
    }

    rawParsed.push({
      startBeat,
      durationBeats,
      midi,
      articulation: n.articulation
    });
  }

  const effectiveClef = clefOverride || detectTrackClef(notes);
  const octaveShiftSemitones = computeOptimalOctaveShiftSemitones(rawMidisForOctave, effectiveClef);

  rawParsed.forEach(p => {
    p.midi = Math.max(21, Math.min(108, p.midi + octaveShiftSemitones));
  });

  rawParsed.sort((a, b) => a.startBeat - b.startBeat || b.midi - a.midi);

  // =========================================================================
  // PASO 1: SEPARAR ACORDES SIMULTÁNEOS (<= 0.04 beats) DE NOTAS MELÓDICAS
  // =========================================================================
  interface MelodicOnsetGroup {
    startBeat: number;
    durationBeats: number;
    leadMidi: number;
    chordMidis: number[];
    articulation?: ArticulationType;
  }

  const onsetGroups: MelodicOnsetGroup[] = [];
  for (const item of rawParsed) {
    const last = onsetGroups[onsetGroups.length - 1];
    if (last && Math.abs(item.startBeat - last.startBeat) <= 0.04) {
      if (!last.chordMidis.includes(item.midi)) {
        last.chordMidis.push(item.midi);
        last.chordMidis.sort((a, b) => a - b);
      }
      last.leadMidi = Math.max(last.leadMidi, item.midi);
      last.durationBeats = Math.max(last.durationBeats, item.durationBeats);
      if (item.articulation) last.articulation = item.articulation;
    } else {
      onsetGroups.push({
        startBeat: item.startBeat,
        durationBeats: item.durationBeats,
        leadMidi: item.midi,
        chordMidis: [item.midi],
        articulation: item.articulation
      });
    }
  }

  // =========================================================================
  // PASO 2: DETECCIÓN SECUENCIAL DE CÉLULAS RÍTMICAS
  // =========================================================================
  interface QuantizedAttackEvent {
    globalStep: number;
    rawDurationSteps: number;
    leadMidi: number;
    chordMidis: number[];
    explicitArticulation?: ArticulationType;
    isSixteenthBurst?: boolean;
    isSubSixteenthBurst?: boolean;
    isTriplet?: boolean;
    tupletNumber?: number;
    tupletGroupId?: string;
    tupletBracket?: boolean;
    tripletGroupId?: string;
    isLongSyncopation?: boolean;
    tieFromPrevMeasure?: boolean;
    tieToNextMeasure?: boolean;
  }

  const quantizedAttacks: QuantizedAttackEvent[] = [];
  let idx = 0;

  while (idx < onsetGroups.length) {
    const prevQuantized = quantizedAttacks[quantizedAttacks.length - 1];
    const minAvailableStep = prevQuantized
      ? prevQuantized.globalStep + prevQuantized.rawDurationSteps
      : 0;

    // -----------------------------------------------------------------------
    // 2.0A: ¿Empieza en `idx` un QUINTILLO (5), SEISILLO (6) o SEPTILLO (7)?
    // -----------------------------------------------------------------------
    let matchedHighTuplet = false;
    for (const N of [7, 6, 5]) {
      if (idx + N - 1 < onsetGroups.length) {
        const firstN = onsetGroups[idx];
        const lastN = onsetGroups[idx + N - 1];
        const afterN = onsetGroups[idx + N];

        const nearestBeat = Math.round(firstN.startBeat);
        const startsOnBeat = Math.abs(firstN.startBeat - nearestBeat) <= 0.22;
        const spanN = lastN.startBeat - firstN.startBeat;
        const expectedSpan = (N - 1) / N;
        const expectedGap = 1 / N;
        const gapAfter = afterN ? afterN.startBeat - lastN.startBeat : 99;

        if (
          startsOnBeat &&
          Math.abs(spanN - expectedSpan) <= 0.14 &&
          gapAfter >= expectedGap * 0.75 &&
          (!afterN || afterN.startBeat - firstN.startBeat >= 0.92)
        ) {
          let allEven = true;
          for (let k = 0; k < N - 1; k++) {
            const gk = onsetGroups[idx + k + 1].startBeat - onsetGroups[idx + k].startBeat;
            if (
              Math.abs(gk - expectedGap) > expectedGap * 0.42 ||
              onsetGroups[idx + k].durationBeats > 0.30
            ) {
              allEven = false;
              break;
            }
          }

          if (allEven) {
            let targetBeatInt = nearestBeat;
            const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
            if (targetBeatInt < minAllowedBeatInt) {
              targetBeatInt = minAllowedBeatInt;
            }
            const baseStep = Math.max(0, targetBeatInt * 4);
            const stepPerNote = 4 / N;
            const tupletId = `tuplet-${N}-b${targetBeatInt}`;

            for (let k = 0; k < N; k++) {
              const item = onsetGroups[idx + k];
              quantizedAttacks.push({
                globalStep: baseStep + k * stepPerNote,
                rawDurationSteps: stepPerNote,
                leadMidi: item.leadMidi,
                chordMidis: item.chordMidis,
                explicitArticulation: item.articulation,
                isTriplet: true,
                tupletNumber: N,
                tupletGroupId: tupletId,
                tripletGroupId: tupletId
              });
            }
            idx += N;
            matchedHighTuplet = true;
            break;
          }
        }
      }
    }
    if (matchedHighTuplet) continue;

    // -----------------------------------------------------------------------
    // 2.0B: ¿Empieza en `idx` una ráfaga de FUSAS (1/32) o SEMIFUSAS (1/64)?
    // -----------------------------------------------------------------------
    if (idx + 3 < onsetGroups.length) {
      let subBurstCount = 1;
      let sumSubGaps = 0;
      let maxSubDur = onsetGroups[idx].durationBeats;

      while (idx + subBurstCount < onsetGroups.length && subBurstCount < 16) {
        const prevN = onsetGroups[idx + subBurstCount - 1];
        const nextN = onsetGroups[idx + subBurstCount];
        const gap = nextN.startBeat - prevN.startBeat;
        if (gap >= 0.042 && gap <= 0.165 && nextN.durationBeats <= 0.19 && maxSubDur <= 0.19) {
          sumSubGaps += gap;
          maxSubDur = Math.max(maxSubDur, nextN.durationBeats);
          subBurstCount++;
        } else {
          break;
        }
      }

      if (subBurstCount >= 4) {
        const avgSubGap = sumSubGaps / (subBurstCount - 1);
        const isSixtyFourth = avgSubGap <= 0.092 && maxSubDur <= 0.12;
        const stepIncrement = isSixtyFourth ? 0.25 : 0.5;

        const firstNote = onsetGroups[idx];
        const gridDiv = isSixtyFourth ? 16 : 8;
        const startSubStep = Math.max(
          minAvailableStep,
          (Math.round(firstNote.startBeat * gridDiv) / gridDiv) * 4
        );

        for (let s = 0; s < subBurstCount; s++) {
          const item = onsetGroups[idx + s];
          quantizedAttacks.push({
            globalStep: startSubStep + s * stepIncrement,
            rawDurationSteps: stepIncrement,
            leadMidi: item.leadMidi,
            chordMidis: item.chordMidis,
            explicitArticulation: item.articulation,
            isSixteenthBurst: true,
            isSubSixteenthBurst: true
          });
        }
        idx += subBurstCount;
        continue;
      }
    }

    // -----------------------------------------------------------------------
    // 2.1: ¿Empieza en `idx` una CUARTINA REAL de 4 semicorcheas (16-16-16-16)?
    // -----------------------------------------------------------------------
    if (idx + 3 < onsetGroups.length) {
      const n0 = onsetGroups[idx];
      const n1 = onsetGroups[idx + 1];
      const n2 = onsetGroups[idx + 2];
      const n3 = onsetGroups[idx + 3];

      const g01 = n1.startBeat - n0.startBeat;
      const g12 = n2.startBeat - n1.startBeat;
      const g23 = n3.startBeat - n2.startBeat;
      const totalSpan4 = n3.startBeat - n0.startBeat;
      const avgGap4 = totalSpan4 / 3;

      const isFourSixteenthCluster =
        n0.durationBeats <= 0.34 &&
        n1.durationBeats <= 0.34 &&
        n2.durationBeats <= 0.34 &&
        g01 >= 0.14 &&
        g01 <= 0.31 &&
        g12 >= 0.14 &&
        g12 <= 0.31 &&
        g23 >= 0.14 &&
        g23 <= 0.31 &&
        avgGap4 <= 0.285 &&
        totalSpan4 <= 0.85;

      if (isFourSixteenthCluster) {
        let targetBeatInt = Math.round(n0.startBeat);
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }

        const baseStep = Math.max(0, targetBeatInt * 4);
        const cluster4 = [n0, n1, n2, n3];
        for (let s = 0; s < 4; s++) {
          quantizedAttacks.push({
            globalStep: baseStep + s,
            rawDurationSteps: 1,
            leadMidi: cluster4[s].leadMidi,
            chordMidis: cluster4[s].chordMidis,
            explicitArticulation: cluster4[s].articulation,
            isSixteenthBurst: true
          });
        }
        idx += 4;
        continue;
      }
    }

    // -----------------------------------------------------------------------
    // 2.2: ¿Empieza en `idx` un GRUPO DE 3 NOTAS (Tresillo de Negras, Síncopa Larga,
    //      Tresillo de Corcheas, Galopa, Galopa Inversa o Síncopa Interna 16-8-16)?
    // -----------------------------------------------------------------------
    if (idx + 2 < onsetGroups.length) {
      const n0 = onsetGroups[idx];
      const n1 = onsetGroups[idx + 1];
      const n2 = onsetGroups[idx + 2];
      const n3 = onsetGroups[idx + 3];

      const g01 = n1.startBeat - n0.startBeat;
      const g12 = n2.startBeat - n1.startBeat;
      const totalSpan3 = n2.startBeat - n0.startBeat;
      const gapToFourth = n3 ? n3.startBeat - n2.startBeat : 99;

      const nearestBeatToN0 = Math.round(n0.startBeat);
      const startsNearBeat = Math.abs(n0.startBeat - nearestBeatToN0) <= 0.32;
      const isolatedFromFourth = gapToFourth >= 0.18 && (totalSpan3 + gapToFourth >= 0.82);

      // A) TRESILLO DE NEGRAS EN 2 PULSOS (qt - qt - qt)
      const isQuarterNoteTriplet =
        startsNearBeat &&
        nearestBeatToN0 % beatsPerBar <= beatsPerBar - 2 &&
        totalSpan3 >= 1.15 &&
        totalSpan3 <= 1.50 &&
        g01 >= 0.56 &&
        g01 <= 0.77 &&
        g12 >= 0.56 &&
        g12 <= 0.77 &&
        Math.abs(g01 - g12) <= 0.14 &&
        gapToFourth >= 0.48;

      if (isQuarterNoteTriplet) {
        let targetBeatInt = nearestBeatToN0;
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }
        const baseStep = Math.max(0, targetBeatInt * 4);
        const stepTwoThirds = 8 / 3;
        const qTupletId = `qtuplet-b${targetBeatInt}`;

        const trio = [n0, n1, n2];
        for (let k = 0; k < 3; k++) {
          quantizedAttacks.push({
            globalStep: baseStep + k * stepTwoThirds,
            rawDurationSteps: stepTwoThirds,
            leadMidi: trio[k].leadMidi,
            chordMidis: trio[k].chordMidis,
            explicitArticulation: trio[k].articulation,
            isTriplet: true,
            tupletNumber: 3,
            tupletGroupId: qTupletId,
            tupletBracket: true,
            tripletGroupId: qTupletId
          });
        }
        idx += 3;
        continue;
      }

      // B) SÍNCOPA LARGA DE 2 PULSOS (8 - 8~8 - 8)
      const isTwoBeatLongSyncopation =
        startsNearBeat &&
        nearestBeatToN0 % beatsPerBar <= beatsPerBar - 2 &&
        totalSpan3 >= 1.25 &&
        totalSpan3 <= 1.72 &&
        g01 >= 0.35 &&
        g01 <= 0.65 &&
        g12 >= 0.78 &&
        g12 <= 1.24 &&
        g12 > g01 * 1.45 &&
        n0.durationBeats <= 0.42 &&
        n1.durationBeats >= 0.44 &&
        n2.durationBeats <= 0.45 &&
        gapToFourth >= 0.35;

      if (isTwoBeatLongSyncopation) {
        let targetBeatInt = nearestBeatToN0;
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }
        const baseStep = Math.max(0, targetBeatInt * 4);

        quantizedAttacks.push({
          globalStep: baseStep,
          rawDurationSteps: 2,
          leadMidi: n0.leadMidi,
          chordMidis: n0.chordMidis,
          explicitArticulation: n0.articulation,
          isLongSyncopation: true
        });
        quantizedAttacks.push({
          globalStep: baseStep + 2,
          rawDurationSteps: 4,
          leadMidi: n1.leadMidi,
          chordMidis: n1.chordMidis,
          explicitArticulation: n1.articulation,
          isLongSyncopation: true
        });
        quantizedAttacks.push({
          globalStep: baseStep + 6,
          rawDurationSteps: 2,
          leadMidi: n2.leadMidi,
          chordMidis: n2.chordMidis,
          explicitArticulation: n2.articulation,
          isLongSyncopation: true
        });
        idx += 3;
        continue;
      }

      const mseTriplet =
        Math.pow(g01 - 0.3333, 2) + Math.pow(totalSpan3 - 0.6667, 2);
      const mseGalopa =
        Math.pow(g01 - 0.50, 2) + Math.pow(totalSpan3 - 0.75, 2);
      const mseReverseGalopa =
        Math.pow(g01 - 0.25, 2) + Math.pow(totalSpan3 - 0.50, 2);
      const mseSyncopation =
        Math.pow(g01 - 0.25, 2) + Math.pow(totalSpan3 - 0.75, 2);

      const isTriplet3 =
        startsNearBeat &&
        isolatedFromFourth &&
        totalSpan3 >= 0.50 &&
        totalSpan3 <= 0.84 &&
        g01 >= 0.22 &&
        g01 <= 0.46 &&
        g12 >= 0.22 &&
        g12 <= 0.46 &&
        Math.abs(g01 - g12) <= 0.16 &&
        n0.durationBeats <= 0.56 &&
        n1.durationBeats <= 0.56 &&
        n2.durationBeats <= 0.58 &&
        mseTriplet <= mseGalopa &&
        mseTriplet <= mseReverseGalopa &&
        mseTriplet <= mseSyncopation;

      const isStandardGalopa =
        !isTriplet3 &&
        startsNearBeat &&
        isolatedFromFourth &&
        totalSpan3 >= 0.54 &&
        totalSpan3 <= 0.94 &&
        g01 >= 0.36 &&
        g01 <= 0.65 &&
        g12 >= 0.12 &&
        g12 <= 0.35 &&
        g01 > g12 * 1.25 &&
        n0.durationBeats <= 0.62 &&
        n1.durationBeats <= 0.36 &&
        n2.durationBeats <= 0.38;

      const isReverseGalopa =
        !isTriplet3 &&
        !isStandardGalopa &&
        startsNearBeat &&
        totalSpan3 >= 0.30 &&
        totalSpan3 <= 0.68 &&
        g01 >= 0.12 &&
        g01 <= 0.35 &&
        g12 >= 0.12 &&
        g12 <= 0.36 &&
        gapToFourth >= 0.38 &&
        n0.durationBeats <= 0.35 &&
        n1.durationBeats <= 0.35 &&
        n2.durationBeats <= 0.65;

      const isSyncopation16_8_16 =
        !isTriplet3 &&
        !isStandardGalopa &&
        !isReverseGalopa &&
        startsNearBeat &&
        isolatedFromFourth &&
        totalSpan3 >= 0.54 &&
        totalSpan3 <= 0.94 &&
        g01 >= 0.11 &&
        g01 <= 0.36 &&
        g12 >= 0.37 &&
        g12 <= 0.66 &&
        g12 > g01 * 1.25 &&
        n0.durationBeats <= 0.36 &&
        n1.durationBeats <= 0.65 &&
        n2.durationBeats <= 0.38;

      if (isTriplet3 || isStandardGalopa || isReverseGalopa || isSyncopation16_8_16) {
        let targetBeatInt = nearestBeatToN0;
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }
        const baseStep = Math.max(0, targetBeatInt * 4);

        if (isTriplet3) {
          const tripletId = `triplet-b${targetBeatInt}`;
          const stepThird = 4 / 3;
          const trio = [n0, n1, n2];
          for (let k = 0; k < 3; k++) {
            quantizedAttacks.push({
              globalStep: baseStep + k * stepThird,
              rawDurationSteps: stepThird,
              leadMidi: trio[k].leadMidi,
              chordMidis: trio[k].chordMidis,
              explicitArticulation: trio[k].articulation,
              isTriplet: true,
              tupletNumber: 3,
              tupletGroupId: tripletId,
              tripletGroupId: tripletId
            });
          }
        } else if (isStandardGalopa) {
          quantizedAttacks.push({
            globalStep: baseStep,
            rawDurationSteps: 2,
            leadMidi: n0.leadMidi,
            chordMidis: n0.chordMidis,
            explicitArticulation: n0.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 2,
            rawDurationSteps: 1,
            leadMidi: n1.leadMidi,
            chordMidis: n1.chordMidis,
            explicitArticulation: n1.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 3,
            rawDurationSteps: 1,
            leadMidi: n2.leadMidi,
            chordMidis: n2.chordMidis,
            explicitArticulation: n2.articulation,
            isSixteenthBurst: true
          });
        } else if (isReverseGalopa) {
          quantizedAttacks.push({
            globalStep: baseStep,
            rawDurationSteps: 1,
            leadMidi: n0.leadMidi,
            chordMidis: n0.chordMidis,
            explicitArticulation: n0.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 1,
            rawDurationSteps: 1,
            leadMidi: n1.leadMidi,
            chordMidis: n1.chordMidis,
            explicitArticulation: n1.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 2,
            rawDurationSteps: 2,
            leadMidi: n2.leadMidi,
            chordMidis: n2.chordMidis,
            explicitArticulation: n2.articulation,
            isSixteenthBurst: true
          });
        } else {
          quantizedAttacks.push({
            globalStep: baseStep,
            rawDurationSteps: 1,
            leadMidi: n0.leadMidi,
            chordMidis: n0.chordMidis,
            explicitArticulation: n0.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 1,
            rawDurationSteps: 2,
            leadMidi: n1.leadMidi,
            chordMidis: n1.chordMidis,
            explicitArticulation: n1.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 3,
            rawDurationSteps: 1,
            leadMidi: n2.leadMidi,
            chordMidis: n2.chordMidis,
            explicitArticulation: n2.articulation,
            isSixteenthBurst: true
          });
        }

        idx += 3;
        continue;
      }
    }

    // -----------------------------------------------------------------------
    // 2.3: ¿Empieza en `idx` un SALTILLO (8d-16), SALTILLO INVERSO (16-8d) O DOSILLO (2)?
    // -----------------------------------------------------------------------
    if (idx + 1 < onsetGroups.length) {
      const n0 = onsetGroups[idx];
      const n1 = onsetGroups[idx + 1];
      const n2 = onsetGroups[idx + 2];

      const nearestBeatToN0 = Math.round(n0.startBeat);
      const startsNearBeat = Math.abs(n0.startBeat - nearestBeatToN0) <= 0.24;
      const g01 = n1.startBeat - n0.startBeat;
      const gapToThird = n2 ? n2.startBeat - n1.startBeat : 99;
      const totalSpanToThird = n2 ? n2.startBeat - n0.startBeat : 99;

      const isCompoundMeter = timeSignature.trim().endsWith('/8');
      const isDupletInCompound =
        isCompoundMeter &&
        startsNearBeat &&
        g01 >= 0.68 &&
        g01 <= 0.82 &&
        Math.abs(n0.durationBeats - n1.durationBeats) <= 0.22 &&
        gapToThird >= 0.65;

      if (isDupletInCompound) {
        let targetBeatInt = nearestBeatToN0;
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }
        const baseStep = Math.max(0, targetBeatInt * 4);
        const dupletId = `duplet-b${targetBeatInt}`;

        quantizedAttacks.push({
          globalStep: baseStep,
          rawDurationSteps: 3,
          leadMidi: n0.leadMidi,
          chordMidis: n0.chordMidis,
          explicitArticulation: n0.articulation,
          isTriplet: true,
          tupletNumber: 2,
          tupletGroupId: dupletId,
          tripletGroupId: dupletId
        });
        quantizedAttacks.push({
          globalStep: baseStep + 3,
          rawDurationSteps: 3,
          leadMidi: n1.leadMidi,
          chordMidis: n1.chordMidis,
          explicitArticulation: n1.articulation,
          isTriplet: true,
          tupletNumber: 2,
          tupletGroupId: dupletId,
          tripletGroupId: dupletId
        });
        idx += 2;
        continue;
      }

      const isStandardSaltillo =
        startsNearBeat &&
        g01 >= 0.63 &&
        g01 <= 0.86 &&
        n1.durationBeats <= 0.34 &&
        n0.durationBeats <= 0.88 &&
        (n0.durationBeats >= 0.42 || n0.durationBeats >= n1.durationBeats * 1.35) &&
        totalSpanToThird >= 0.90;

      const isReverseSaltillo =
        !isStandardSaltillo &&
        startsNearBeat &&
        g01 >= 0.12 &&
        g01 <= 0.34 &&
        n0.durationBeats <= 0.32 &&
        (n1.durationBeats >= 0.42 || n1.durationBeats >= n0.durationBeats * 1.4) &&
        gapToThird >= 0.56;

      if (isStandardSaltillo || isReverseSaltillo) {
        let targetBeatInt = nearestBeatToN0;
        const minAllowedBeatInt = Math.ceil((minAvailableStep - 0.01) / 4);
        if (targetBeatInt < minAllowedBeatInt) {
          targetBeatInt = minAllowedBeatInt;
        }
        const baseStep = Math.max(0, targetBeatInt * 4);

        if (isStandardSaltillo) {
          quantizedAttacks.push({
            globalStep: baseStep,
            rawDurationSteps: 3,
            leadMidi: n0.leadMidi,
            chordMidis: n0.chordMidis,
            explicitArticulation: n0.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 3,
            rawDurationSteps: 1,
            leadMidi: n1.leadMidi,
            chordMidis: n1.chordMidis,
            explicitArticulation: n1.articulation,
            isSixteenthBurst: true
          });
        } else {
          quantizedAttacks.push({
            globalStep: baseStep,
            rawDurationSteps: 1,
            leadMidi: n0.leadMidi,
            chordMidis: n0.chordMidis,
            explicitArticulation: n0.articulation,
            isSixteenthBurst: true
          });
          quantizedAttacks.push({
            globalStep: baseStep + 1,
            rawDurationSteps: 3,
            leadMidi: n1.leadMidi,
            chordMidis: n1.chordMidis,
            explicitArticulation: n1.articulation,
            isSixteenthBurst: true
          });
        }

        idx += 2;
        continue;
      }
    }

    // -----------------------------------------------------------------------
    // 2.4 BLOQUES ANCHOS EN EL PIANO ROLL + SÍNCOPAS Y ANTICIPACIONES
    // -----------------------------------------------------------------------
    const cur = onsetGroups[idx];
    const nextGroup = onsetGroups[idx + 1];
    const isQuarterOrLongerBlock = cur.durationBeats >= 0.43;

    if (isQuarterOrLongerBlock) {
      const beatFloor = Math.floor(cur.startBeat);
      const offsetInBeat = cur.startBeat - beatFloor;
      const prevCameOnThisBeatDownbeat =
        Boolean(prevQuantized) && Math.abs(prevQuantized!.globalStep - beatFloor * 4) < 0.1;

      const isIntentionalSyncopatedAttack =
        offsetInBeat >= 0.36 &&
        offsetInBeat <= 0.64 &&
        cur.durationBeats >= 0.72 &&
        (prevCameOnThisBeatDownbeat || (beatFloor + 1) % beatsPerBar === 0);

      let globalStep: number;
      if (isIntentionalSyncopatedAttack) {
        globalStep = Math.max(0, beatFloor * 4 + 2);
        if (globalStep < minAvailableStep - 0.01) {
          const roundedMin = Math.round(minAvailableStep);
          globalStep = roundedMin % 2 === 0 ? roundedMin : roundedMin + 1;
        }
      } else {
        const targetBeat = Math.round(cur.startBeat);
        globalStep = Math.max(0, targetBeat * 4);
        if (globalStep < minAvailableStep - 0.01) {
          globalStep = Math.ceil((minAvailableStep - 0.01) / 4) * 4;
        }
      }

      let rawDurationSteps = Math.max(4, Math.round(cur.durationBeats * 2) * 2);

      if (nextGroup) {
        const nextApproxStep = Math.round(nextGroup.startBeat * 4);
        if (nextApproxStep > globalStep) {
          rawDurationSteps = Math.min(rawDurationSteps, nextApproxStep - globalStep);
        }
      }

      quantizedAttacks.push({
        globalStep,
        rawDurationSteps: Math.max(2, rawDurationSteps),
        leadMidi: cur.leadMidi,
        chordMidis: cur.chordMidis,
        explicitArticulation: cur.articulation,
        isLongSyncopation: isIntentionalSyncopatedAttack
      });
      idx += 1;
      continue;
    }

    // -----------------------------------------------------------------------
    // 2.5 BLOQUES CORTOS O ULTRA-CORTOS AISLADOS (Corchea, Semicorchea, Fusa o Semifusa)
    // -----------------------------------------------------------------------
    if (quantizationMode === 'detailed' && cur.durationBeats <= 0.16) {
      const isIsolated64 = cur.durationBeats <= 0.085;
      const stepDur = isIsolated64 ? 0.25 : 0.5;
      const gridDiv = isIsolated64 ? 4 : 2;
      const globalStep = Math.max(
        minAvailableStep,
        Math.round(cur.startBeat * 4 * gridDiv) / gridDiv
      );
      quantizedAttacks.push({
        globalStep,
        rawDurationSteps: stepDur,
        leadMidi: cur.leadMidi,
        chordMidis: cur.chordMidis,
        explicitArticulation: cur.articulation,
        isSixteenthBurst: true,
        isSubSixteenthBurst: true
      });
      idx += 1;
      continue;
    }

    let globalStep = Math.max(0, Math.round(cur.startBeat * 2) * 2);

    if (globalStep < minAvailableStep - 0.01) {
      const roundedMin = Math.round(minAvailableStep);
      globalStep = roundedMin % 2 === 0 ? roundedMin : roundedMin + 1;
    }

    quantizedAttacks.push({
      globalStep,
      rawDurationSteps: 2,
      leadMidi: cur.leadMidi,
      chordMidis: cur.chordMidis,
      explicitArticulation: cur.articulation
    });
    idx += 1;
  }

  // =========================================================================
  // PASO 2.5: PARTICIÓN Y LIGADURA ENTRE COMPASES (CROSS-BARLINE TIES)
  // =========================================================================
  const expandedCrossBarAttacks: QuantizedAttackEvent[] = [];

  for (let i = 0; i < quantizedAttacks.length; i++) {
    const q = quantizedAttacks[i];
    const nextQ = quantizedAttacks[i + 1];

    if (q.isTriplet || q.isSixteenthBurst || q.isSubSixteenthBurst) {
      expandedCrossBarAttacks.push(q);
      continue;
    }

    const maxEndStep = nextQ
      ? Math.min(q.globalStep + q.rawDurationSteps, nextQ.globalStep)
      : q.globalStep + q.rawDurationSteps;

    const firstMeasureEnd = (Math.floor(q.globalStep / stepsPerMeasure) + 1) * stepsPerMeasure;

    if (maxEndStep <= firstMeasureEnd + 1.5) {
      expandedCrossBarAttacks.push({
        ...q,
        rawDurationSteps: Math.max(2, Math.min(q.rawDurationSteps, firstMeasureEnd - q.globalStep))
      });
      continue;
    }

    let curStart = q.globalStep;
    let isFirstSlice = true;

    while (curStart < maxEndStep - 0.5) {
      const mEnd = (Math.floor(curStart / stepsPerMeasure) + 1) * stepsPerMeasure;
      const sliceSteps = Math.min(mEnd - curStart, maxEndStep - curStart);

      if (!isFirstSlice && sliceSteps < 2) {
        const prevInserted = expandedCrossBarAttacks[expandedCrossBarAttacks.length - 1];
        if (prevInserted) {
          prevInserted.tieToNextMeasure = false;
        }
        break;
      }

      const continuesToNextBar = curStart + sliceSteps < maxEndStep - 1.5;

      expandedCrossBarAttacks.push({
        ...q,
        globalStep: curStart,
        rawDurationSteps: sliceSteps,
        tieFromPrevMeasure: !isFirstSlice,
        tieToNextMeasure: continuesToNextBar
      });

      curStart += sliceSteps;
      isFirstSlice = false;
    }
  }

  const maxStepFromNotes =
    expandedCrossBarAttacks.length > 0
      ? Math.max(...expandedCrossBarAttacks.map(q => q.globalStep + q.rawDurationSteps))
      : 0;
  const effectiveMeasures = Math.max(
    1,
    totalMeasures,
    Math.ceil((maxStepFromNotes - 0.01) / stepsPerMeasure)
  );

  const transcribedMeasures: TranscribedMeasure[] = [];

  for (let mIdx = 0; mIdx < effectiveMeasures; mIdx++) {
    const measureStartGlobalStep = mIdx * stepsPerMeasure;
    const measureEndGlobalStep = measureStartGlobalStep + stepsPerMeasure;

    const activeMeasureAccidentals: Record<number, '' | '#' | 'b'> = {
      ...keySig.defaultLetterAccidentals
    };

    const mNotes = expandedCrossBarAttacks
      .filter(
        q =>
          q.globalStep >= measureStartGlobalStep - 0.01 &&
          q.globalStep < measureEndGlobalStep - 0.01
      )
      .map(q => ({
        ...q,
        stepInMeasure: Math.max(0, q.globalStep - measureStartGlobalStep)
      }));

    if (mNotes.length === 0) {
      const restFigs = decomposeSpanToStandardFigures(
        0,
        stepsPerMeasure,
        true,
        quantizationMode
      );
      transcribedMeasures.push({
        measureIndex: mIdx,
        stepsPerMeasure,
        events: [
          {
            isRest: true,
            startStepInMeasure: 0,
            durationSteps: stepsPerMeasure,
            figure: restFigs[0].figure,
            baseFigure: restFigs[0].baseFigure,
            dots: restFigs[0].dots,
            midi: 60,
            chordMidis: [],
            noteName: 'R',
            letterIndex: 6,
            octave: 4,
            accidental: '',
            displayedAccidental: '',
            tieFromPrev: false,
            tieToNext: false
          }
        ]
      });
      continue;
    }

    const measureEvents: ScoreNotationEvent[] = [];
    let cursor = 0;

    for (let i = 0; i < mNotes.length; i++) {
      const curNote = mNotes[i];
      const nextNote = mNotes[i + 1];

      if (curNote.stepInMeasure > cursor + 0.05) {
        const restGap = Math.round((curNote.stepInMeasure - cursor) * 4) / 4;
        if (restGap >= 0.25) {
          const restFigs = decomposeSpanToStandardFigures(
            cursor,
            restGap,
            true,
            quantizationMode,
            Boolean(curNote.isSubSixteenthBurst)
          );
          let rPos = cursor;
          for (const rf of restFigs) {
            measureEvents.push({
              isRest: true,
              startStepInMeasure: rPos,
              durationSteps: rf.steps,
              figure: rf.figure,
              baseFigure: rf.baseFigure,
              dots: rf.dots,
              midi: 60,
              chordMidis: [],
              noteName: 'R',
              letterIndex: 6,
              octave: 4,
              accidental: '',
              displayedAccidental: '',
              tieFromPrev: false,
              tieToNext: false
            });
            rPos += rf.steps;
          }
        }
        cursor = curNote.stepInMeasure;
      }

      const pitchInfo = midiToPitchNotation(curNote.leadMidi, preferFlats, keySig.count);
      const currentExpectedAcc = activeMeasureAccidentals[pitchInfo.letterIndex] ?? '';
      let resolvedDisplayAcc: AccidentalSymbol = '';

      if (!curNote.tieFromPrevMeasure) {
        if (pitchInfo.accidental !== currentExpectedAcc) {
          resolvedDisplayAcc = pitchInfo.accidental === '' ? 'natural' : pitchInfo.accidental;
          activeMeasureAccidentals[pitchInfo.letterIndex] = pitchInfo.accidental;
        }
      } else {
        activeMeasureAccidentals[pitchInfo.letterIndex] = pitchInfo.accidental;
      }

      if (curNote.isTriplet) {
        const beatIndex = Math.floor((curNote.stepInMeasure + 0.02) / 4);
        const tNum = curNote.tupletNumber || 3;
        const isQuarterTuplet = Boolean(curNote.tupletBracket);
        const isSixteenthTuplet = tNum >= 5;

        const figCode: RhythmicFigureCode = isQuarterTuplet
          ? 'qt'
          : isSixteenthTuplet
          ? '16tuplet'
          : '8t';
        const baseFigCode: BaseFigureCode = isQuarterTuplet
          ? 'q'
          : isSixteenthTuplet
          ? '16'
          : '8';

        measureEvents.push({
          isRest: false,
          startStepInMeasure: curNote.stepInMeasure,
          durationSteps: curNote.rawDurationSteps,
          figure: figCode,
          baseFigure: baseFigCode,
          dots: 0,
          isTriplet: true,
          tupletNumber: tNum,
          tupletGroupId: curNote.tupletGroupId || curNote.tripletGroupId,
          tupletBracket: isQuarterTuplet,
          tripletGroupId: curNote.tripletGroupId,
          beamGroupId: isQuarterTuplet ? undefined : `beam-m${mIdx}-b${beatIndex}`,
          midi: pitchInfo.midi,
          chordMidis: curNote.chordMidis,
          noteName: pitchInfo.noteName,
          letterIndex: pitchInfo.letterIndex,
          octave: pitchInfo.octave,
          accidental: pitchInfo.accidental,
          displayedAccidental: resolvedDisplayAcc,
          tieFromPrev: false,
          tieToNext: false,
          articulation: curNote.explicitArticulation || 'none'
        });
        cursor = curNote.stepInMeasure + curNote.rawDurationSteps;
        if (Math.abs(cursor - Math.round(cursor)) < 0.05) {
          cursor = Math.round(cursor);
        }
        continue;
      }

      if (curNote.isSubSixteenthBurst) {
        const beatIndex = Math.floor((curNote.stepInMeasure + 0.01) / 4);
        const subFig: RhythmicFigureCode = curNote.rawDurationSteps <= 0.3 ? '64' : '32';

        measureEvents.push({
          isRest: false,
          startStepInMeasure: curNote.stepInMeasure,
          durationSteps: curNote.rawDurationSteps,
          figure: subFig,
          baseFigure: subFig,
          dots: 0,
          beamGroupId: `beam-m${mIdx}-b${beatIndex}`,
          midi: pitchInfo.midi,
          chordMidis: curNote.chordMidis,
          noteName: pitchInfo.noteName,
          letterIndex: pitchInfo.letterIndex,
          octave: pitchInfo.octave,
          accidental: pitchInfo.accidental,
          displayedAccidental: resolvedDisplayAcc,
          tieFromPrev: false,
          tieToNext: false,
          articulation: curNote.explicitArticulation || 'none'
        });
        cursor = curNote.stepInMeasure + curNote.rawDurationSteps;
        continue;
      }

      const roundedStartStep = Math.round(curNote.stepInMeasure);
      const maxStepsUntilNextAttack = nextNote
        ? Math.round(nextNote.stepInMeasure) - roundedStartStep
        : stepsPerMeasure - roundedStartStep;

      let effectiveNoteSteps = Math.max(1, maxStepsUntilNextAttack);

      if (curNote.tieFromPrevMeasure && !curNote.tieToNextMeasure && !nextNote) {
        effectiveNoteSteps = Math.min(maxStepsUntilNextAttack, Math.max(2, curNote.rawDurationSteps));
      } else if (curNote.isLongSyncopation) {
        effectiveNoteSteps = Math.min(maxStepsUntilNextAttack, curNote.rawDurationSteps);
      } else if (curNote.isSixteenthBurst && roundedStartStep % 4 === 3) {
        effectiveNoteSteps = 1;
      } else if (curNote.isSixteenthBurst && curNote.rawDurationSteps === 3 && roundedStartStep % 4 === 1) {
        effectiveNoteSteps = 3;
      } else if (curNote.isSixteenthBurst && curNote.rawDurationSteps === 2 && roundedStartStep % 4 === 1) {
        effectiveNoteSteps = 2;
      } else if (curNote.isSixteenthBurst && curNote.rawDurationSteps === 2 && roundedStartStep % 4 === 2) {
        effectiveNoteSteps = 2;
      } else if (roundedStartStep % 4 === 2 && curNote.rawDurationSteps === 2 && maxStepsUntilNextAttack >= 4) {
        effectiveNoteSteps = 2;
      } else if (!nextNote && !curNote.tieToNextMeasure) {
        if (roundedStartStep % 4 === 2 && maxStepsUntilNextAttack === 2) {
          effectiveNoteSteps = 2;
        } else if (maxStepsUntilNextAttack >= 8 && curNote.rawDurationSteps <= 4) {
          const currentBeatRemaining = 4 - (roundedStartStep % 4);
          effectiveNoteSteps = Math.max(2, currentBeatRemaining);
        }
      }

      const noteFigs = decomposeSpanToStandardFigures(
        roundedStartStep,
        effectiveNoteSteps,
        false,
        quantizationMode,
        Boolean(curNote.isSixteenthBurst)
      );

      let nPos = roundedStartStep;
      noteFigs.forEach((nf, figIdx) => {
        const isFirstFig = figIdx === 0;
        const isLastFig = figIdx === noteFigs.length - 1;
        const beatIndex = Math.floor(nPos / 4);
        const canBeam =
          (nf.baseFigure === '8' ||
            nf.baseFigure === '16' ||
            nf.baseFigure === '32' ||
            nf.baseFigure === '64') &&
          !curNote.isLongSyncopation;

        measureEvents.push({
          isRest: false,
          startStepInMeasure: nPos,
          durationSteps: nf.steps,
          figure: nf.figure,
          baseFigure: nf.baseFigure,
          dots: nf.dots,
          beamGroupId: canBeam ? `beam-m${mIdx}-b${beatIndex}` : undefined,
          midi: pitchInfo.midi,
          chordMidis: curNote.chordMidis,
          noteName: pitchInfo.noteName,
          letterIndex: pitchInfo.letterIndex,
          octave: pitchInfo.octave,
          accidental: pitchInfo.accidental,
          displayedAccidental: isFirstFig ? resolvedDisplayAcc : '',
          tieFromPrev: isFirstFig ? Boolean(curNote.tieFromPrevMeasure) : true,
          tieToNext: isLastFig ? Boolean(curNote.tieToNextMeasure) : true,
          articulation: isFirstFig ? curNote.explicitArticulation || 'none' : 'none'
        });
        nPos += nf.steps;
      });

      cursor = roundedStartStep + effectiveNoteSteps;
    }

    if (cursor < stepsPerMeasure - 0.05) {
      const tailGap = Math.round((stepsPerMeasure - cursor) * 4) / 4;
      const tailRests = decomposeSpanToStandardFigures(
        cursor,
        tailGap,
        true,
        quantizationMode
      );
      let rPos = cursor;
      for (const rf of tailRests) {
        measureEvents.push({
          isRest: true,
          startStepInMeasure: rPos,
          durationSteps: rf.steps,
          figure: rf.figure,
          baseFigure: rf.baseFigure,
          dots: rf.dots,
          midi: 60,
          chordMidis: [],
          noteName: 'R',
          letterIndex: 6,
          octave: 4,
          accidental: '',
          displayedAccidental: '',
          tieFromPrev: false,
          tieToNext: false
        });
        rPos += rf.steps;
      }
    }

    if (beatsPerBar === 4) {
      const unifyHalfBarEighthBeams = (halfStartStep: number, halfEndStep: number, newBeamId: string) => {
        const halfEvents = measureEvents.filter(
          ev => ev.startStepInMeasure >= halfStartStep - 0.01 && ev.startStepInMeasure < halfEndStep - 0.01
        );
        if (
          halfEvents.length === 4 &&
          halfEvents.every(
            ev => !ev.isRest && ev.figure === '8' && !ev.isTriplet && !ev.tieFromPrev && !ev.tieToNext
          )
        ) {
          halfEvents.forEach(ev => {
            ev.beamGroupId = newBeamId;
          });
        }
      };

      unifyHalfBarEighthBeams(0, 8, `beam-m${mIdx}-half1`);
      unifyHalfBarEighthBeams(8, 16, `beam-m${mIdx}-half2`);
    }

    transcribedMeasures.push({
      measureIndex: mIdx,
      stepsPerMeasure,
      events: measureEvents
    });
  }

  return transcribedMeasures;
}

// ============================================================================
// RENDERIZADOR VECTORIAL SVG DE PARTITURA (CALIDAD IMPRENTA / MULTI-MÉTRICA)
// ============================================================================

export interface ScoreSheetRenderOptions {
  song: Song;
  transposition?: number;
  globalKey?: string;
  trackName?: string;
  instrumentName?: string;
  bankId?: string;
  midiNotes?: RawMidiNoteInput[];
  quantizationMode?: QuantizationMode;
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBeamCountForBaseFigure(baseFigure: BaseFigureCode): number {
  if (baseFigure === '64') return 4;
  if (baseFigure === '32') return 3;
  if (baseFigure === '16') return 2;
  if (baseFigure === '8') return 1;
  return 0;
}

export function generateScorePagesSVG(options: ScoreSheetRenderOptions): string[] {
  const {
    song,
    transposition = 0,
    globalKey = 'C',
    trackName = 'Pista MIDI',
    instrumentName = 'Piano / Melodía',
    bankId = '',
    midiNotes = [],
    quantizationMode = 'clean'
  } = options;

  const tempo = song.tempo || 120;
  const timeSignature = song.timeSignature || '4/4';
  const { stepsPerMeasure } = parseTimeSignatureBeats(timeSignature);
  const rawTitle = (song.title || 'MI NUEVA PROGRESION').toUpperCase();
  const styleName = (song.style || 'Jazz Swing').toUpperCase();

  const isAlreadyTransposed = Boolean((song as any)?.isAlreadyTransposed);
  const rawKeyStr = String((song as any)?.activeKey || song.defaultKey || globalKey || 'C').trim();
  const isMinorKeyStr = /m|-|min/i.test(rawKeyStr);
  const cleanRawKey = rawKeyStr.replace(/m|-|min/gi, '').trim() as import('../types').RootNote;
  const effectiveKeyCenter = (globalKey.replace(/m|-|min/gi, '').trim() || cleanRawKey || 'C') as import('../types').RootNote;

  const transposedRoot =
    !isAlreadyTransposed && transposition !== 0
      ? transposeRoot(cleanRawKey, transposition, effectiveKeyCenter)
      : cleanRawKey;
  const displayKey = isMinorKeyStr ? `${transposedRoot}m` : transposedRoot;
  const keySig = getKeySignatureInfo(displayKey);
  const preferFlats = keySig.preferFlats;

  const songMeasures: SongMeasure[] =
    song.measures && song.measures.length > 0
      ? song.measures
      : [{ id: 'm-1', chords: ['Cmaj7'] }];

  const clef = detectTrackClef(midiNotes, instrumentName, bankId);

  const transcribed = transcribeMidiTrackToMeasures(
    midiNotes,
    tempo,
    songMeasures.length,
    displayKey,
    quantizationMode,
    clef,
    timeSignature
  );

  const totalMeasuresCount = Math.max(songMeasures.length, transcribed.length);

  const pageW = 794;
  const pageH = 1123;
  const marginX = 44;
  const contentW = pageW - marginX * 2;
  const measuresPerRow = 4;
  const systemsPerPage = 5;
  const measuresPerPage = measuresPerRow * systemsPerPage;

  const totalPages = Math.max(1, Math.ceil(totalMeasuresCount / measuresPerPage));
  const svgPages: string[] = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const parts: string[] = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pageW} ${pageH}" width="100%" height="100%" style="background:#ffffff;color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">`
    );

    parts.push(`<rect x="0" y="0" width="${pageW}" height="${pageH}" fill="#ffffff" />`);

    parts.push(
      `<text x="${marginX}" y="52" font-size="24" font-weight="800" fill="#000000" letter-spacing="0.5">${escapeXml(
        rawTitle
      )}</text>`
    );
    parts.push(
      `<text x="${marginX}" y="71" font-size="10.5" font-weight="700" fill="#444444" letter-spacing="1.2">GUÍA DE ACORDES Y MELODÍA  •  PARTITURA LEAD SHEET (${escapeXml(
        trackName.toUpperCase()
      )})</text>`
    );

    const keySigLabel =
      keySig.count > 0
        ? `${displayKey} (${keySig.count}${keySig.type === 'sharp' ? '♯' : '♭'})`
        : displayKey;

    const metaItems = [
      `TEMPO: ${tempo} BPM`,
      `MÉTRICA: ${timeSignature}`,
      `TONALIDAD: ${keySigLabel}`,
      `ESTILO: ${styleName}`,
      `INSTRUMENTO: ${instrumentName.toUpperCase()} (${clef === 'bass' ? 'CLAVE DE FA' : 'CLAVE DE SOL'})`
    ];
    parts.push(
      `<text x="${marginX}" y="92" font-size="10.5" font-weight="700" fill="#111111">${escapeXml(
        metaItems.join('   |   ')
      )}</text>`
    );
    parts.push(
      `<line x1="${marginX}" y1="104" x2="${
        marginX + contentW
      }" y2="104" stroke="#000000" stroke-width="1.8" />`
    );

    const startM = pageIdx * measuresPerPage;
    const endM = Math.min(totalMeasuresCount, startM + measuresPerPage);

    const firstSystemTopY = 148;
    const systemSpacingY = 184;
    const lineSpacing = 8.5;
    const staffHeight = lineSpacing * 4;

    let pendingCrossBarTie: {
      x: number;
      y: number;
      stemUp: boolean;
      row: number;
      measureEndX: number;
    } | null = null;

    for (let mIdx = startM; mIdx < endM; mIdx++) {
      const localIdx = mIdx - startM;
      const row = Math.floor(localIdx / measuresPerRow);
      const col = localIdx % measuresPerRow;

      const systemTopY = firstSystemTopY + row * systemSpacingY;
      const staffTopY = systemTopY + 72;
      const staffBottomY = staffTopY + staffHeight;

      const isVeryFirstSystem = pageIdx === 0 && row === 0;
      const keySigOffsets =
        clef === 'bass' ? keySig.bassStaffOffsets : keySig.trebleStaffOffsets;
      const keySigWidth = keySigOffsets.length > 0 ? keySigOffsets.length * 8.5 + 6 : 0;
      const timeSigWidth = isVeryFirstSystem ? 20 : 4;
      const clefHeaderW = 36 + keySigWidth + timeSigWidth;

      const usableRowW = contentW - clefHeaderW;
      const measureW = usableRowW / measuresPerRow;

      if (col === 0) {
        const measuresInThisRow = Math.min(measuresPerRow, endM - mIdx);
        const rowTotalW = clefHeaderW + measuresInThisRow * measureW;

        for (let l = 0; l < 5; l++) {
          const ly = staffTopY + l * lineSpacing;
          parts.push(
            `<line x1="${marginX}" y1="${ly.toFixed(1)}" x2="${(
              marginX + rowTotalW
            ).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="#111111" stroke-width="1.15" />`
          );
        }

        parts.push(
          `<line x1="${marginX}" y1="${staffTopY.toFixed(1)}" x2="${marginX}" y2="${staffBottomY.toFixed(
            1
          )}" stroke="#000000" stroke-width="1.8" />`
        );

        const clefX = marginX + 4;
        if (clef === 'treble') {
          parts.push(
            `<text x="${clefX}" y="${(staffTopY + 34).toFixed(
              1
            )}" font-size="56" font-family="'Bravura', 'Apple Symbols', 'Segoe UI Symbol', 'Noto Music', 'Times New Roman', serif" fill="#000000">${'\uD834\uDD1E'}</text>`
          );
        } else {
          parts.push(
            `<text x="${clefX}" y="${(staffTopY + 29).toFixed(
              1
            )}" font-size="44" font-family="'Bravura', 'Apple Symbols', 'Segoe UI Symbol', 'Noto Music', 'Times New Roman', serif" fill="#000000">${'\uD834\uDD22'}</text>`
          );
        }

        const keySigStartX = marginX + 34;
        keySigOffsets.forEach((stepOffset, idx) => {
          const accX = keySigStartX + idx * 8.5;
          const accLineY = staffBottomY - stepOffset * (lineSpacing / 2);
          if (keySig.type === 'sharp') {
            parts.push(
              `<text x="${accX.toFixed(1)}" y="${(accLineY + 4.5).toFixed(
                1
              )}" font-size="14" font-weight="800" text-anchor="middle" fill="#000000">♯</text>`
            );
          } else if (keySig.type === 'flat') {
            parts.push(
              `<text x="${accX.toFixed(1)}" y="${(accLineY + 4.2).toFixed(
                1
              )}" font-size="14.5" font-weight="800" text-anchor="middle" fill="#000000">♭</text>`
            );
          }
        });

        if (isVeryFirstSystem) {
          const tsX = marginX + 34 + keySigWidth + 8;
          const tsParts = timeSignature.split('/');
          const tsNum = tsParts[0] || '4';
          const tsDen = tsParts[1] || '4';
          parts.push(
            `<text x="${tsX.toFixed(1)}" y="${(
              staffTopY + 15
            ).toFixed(1)}" font-size="16" font-weight="900" font-family="Georgia,serif" text-anchor="middle" fill="#000000">${escapeXml(
              tsNum
            )}</text>`
          );
          parts.push(
            `<text x="${tsX.toFixed(1)}" y="${(
              staffTopY + 32
            ).toFixed(1)}" font-size="16" font-weight="900" font-family="Georgia,serif" text-anchor="middle" fill="#000000">${escapeXml(
              tsDen
            )}</text>`
          );
        }
      }

      const mStartX = marginX + clefHeaderW + col * measureW;
      const mEndX = mStartX + measureW;
      const songMeasure: SongMeasure = songMeasures[mIdx] || { id: `m-${mIdx + 1}`, chords: [''] };
      const transMeasure: TranscribedMeasure = transcribed[mIdx] || {
        measureIndex: mIdx,
        stepsPerMeasure,
        events: []
      };
      const curStepsPerMeasure = transMeasure.stepsPerMeasure || stepsPerMeasure;

      parts.push(
        `<text x="${(mStartX + 2).toFixed(1)}" y="${(
          staffTopY - 6
        ).toFixed(1)}" font-size="8.5" font-weight="700" fill="#666666">${mIdx + 1}</text>`
      );

      const chordY = staffTopY - 38;

      let sectionLabel = songMeasure.sectionLabel;
      if (!sectionLabel && song.sections) {
        const found = Object.entries(song.sections).find(([_, sIdx]) => sIdx === mIdx);
        if (found) {
          sectionLabel = found[0].startsWith('[') ? found[0] : `[${found[0]}]`;
        }
      }
      if (sectionLabel) {
        const cleanSecText = sectionLabel.replace(/^\[\vert{}\]$/g, '');
        const badgeW = Math.max(28, cleanSecText.length * 6.6 + 14);
        const badgeX = col === 0 ? marginX : mStartX;
        const badgeY = chordY - 36;
        parts.push(
          `<rect x="${badgeX.toFixed(1)}" y="${badgeY.toFixed(
            1
          )}" width="${badgeW.toFixed(1)}" height="16" rx="3" fill="#f3f4f6" stroke="#000000" stroke-width="1.15" />`
        );
        parts.push(
          `<text x="${(badgeX + badgeW / 2).toFixed(1)}" y="${(
            badgeY + 11.5
          ).toFixed(1)}" font-size="9.5" font-weight="800" text-anchor="middle" fill="#000000">${escapeXml(
            sectionLabel
          )}</text>`
        );
      }

      if (songMeasure.volta) {
        const voltaTopY = chordY - 26;
        parts.push(
          `<path d="M ${mStartX.toFixed(1)} ${(voltaTopY + 10).toFixed(
            1
          )} L ${mStartX.toFixed(1)} ${voltaTopY.toFixed(1)} L ${mEndX.toFixed(
            1
          )} ${voltaTopY.toFixed(1)} L ${mEndX.toFixed(1)} ${(voltaTopY + 10).toFixed(
            1
          )}" fill="none" stroke="#000000" stroke-width="1.2" />`
        );
        parts.push(
          `<text x="${(mStartX + 5).toFixed(1)}" y="${(
            voltaTopY + 10
          ).toFixed(1)}" font-size="9" font-weight="800" fill="#000000">${songMeasure.volta}.</text>`
        );
      }

      const rawChords =
        songMeasure.chords && songMeasure.chords.length > 0 ? songMeasure.chords : [''];
      const slotCount = rawChords.length <= 1 ? 1 : rawChords.length === 2 ? 2 : 4;
      const slotW = measureW / slotCount;

      for (let sIdx = 0; sIdx < slotCount; sIdx++) {
        const rawC = rawChords[sIdx] || '';
        const chordStr =
          typeof rawC === 'string'
            ? rawC
            : (rawC as any)?.chordName || (rawC as any)?.name || '';
        if (!chordStr || !chordStr.trim()) continue;

        const transposedChord =
          !isAlreadyTransposed && transposition !== 0
            ? transposeChordString(chordStr, transposition, effectiveKeyCenter)
            : chordStr;

        const chordX = mStartX + sIdx * slotW + 8;
        parts.push(
          `<text x="${chordX.toFixed(1)}" y="${chordY.toFixed(
            1
          )}" font-size="14" font-weight="800" fill="#000000">${escapeXml(
            transposedChord
          )}</text>`
        );
      }

      if (songMeasure.repeatStart) {
        parts.push(
          `<line x1="${mStartX + 2}" y1="${staffTopY}" x2="${
            mStartX + 2
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="3" />`
        );
        parts.push(
          `<line x1="${mStartX + 6}" y1="${staffTopY}" x2="${
            mStartX + 6
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="1" />`
        );
        parts.push(
          `<circle cx="${mStartX + 10}" cy="${staffTopY + 12.5}" r="1.8" fill="#000000" />`
        );
        parts.push(
          `<circle cx="${mStartX + 10}" cy="${staffTopY + 21.5}" r="1.8" fill="#000000" />`
        );
      } else {
        parts.push(
          `<line x1="${mStartX}" y1="${staffTopY}" x2="${mStartX}" y2="${staffBottomY}" stroke="#000000" stroke-width="1.15" />`
        );
      }

      if (songMeasure.repeatEnd) {
        parts.push(
          `<circle cx="${mEndX - 10}" cy="${staffTopY + 12.5}" r="1.8" fill="#000000" />`
        );
        parts.push(
          `<circle cx="${mEndX - 10}" cy="${staffTopY + 21.5}" r="1.8" fill="#000000" />`
        );
        parts.push(
          `<line x1="${mEndX - 6}" y1="${staffTopY}" x2="${
            mEndX - 6
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="1" />`
        );
        parts.push(
          `<line x1="${mEndX - 2}" y1="${staffTopY}" x2="${
            mEndX - 2
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="3" />`
        );
      } else if (mIdx === totalMeasuresCount - 1) {
        parts.push(
          `<line x1="${mEndX - 5}" y1="${staffTopY}" x2="${
            mEndX - 5
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="1.15" />`
        );
        parts.push(
          `<line x1="${mEndX - 1.5}" y1="${staffTopY}" x2="${
            mEndX - 1.5
          }" y2="${staffBottomY}" stroke="#000000" stroke-width="3" />`
        );
      } else {
        parts.push(
          `<line x1="${mEndX}" y1="${staffTopY}" x2="${mEndX}" y2="${staffBottomY}" stroke="#000000" stroke-width="1.15" />`
        );
      }

      const innerPaddingLeft = songMeasure.repeatStart ? 18 : 14;
      const innerPaddingRight = songMeasure.repeatEnd ? 16 : 10;
      const innerW = Math.max(40, measureW - innerPaddingLeft - innerPaddingRight);

      const isWholeMeasureRest =
        transMeasure.events.length === 1 &&
        transMeasure.events[0].isRest &&
        transMeasure.events[0].durationSteps >= curStepsPerMeasure;

      if (isWholeMeasureRest) {
        const restX = mStartX + measureW / 2 - 5;
        const fourthLineY = staffTopY + lineSpacing;
        parts.push(
          `<rect x="${restX.toFixed(1)}" y="${fourthLineY.toFixed(
            1
          )}" width="10" height="4.2" fill="#000000" />`
        );
        pendingCrossBarTie = null;
        continue;
      }

      const beamGroupsMap = new Map<string, number[]>();
      const beamedEventIndices = new Set<number>();

      for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
        const ev = transMeasure.events[eIdx];
        if (!ev.isRest && ev.beamGroupId) {
          const list = beamGroupsMap.get(ev.beamGroupId) || [];
          list.push(eIdx);
          beamGroupsMap.set(ev.beamGroupId, list);
        }
      }

      for (const [gid, indices] of beamGroupsMap.entries()) {
        if (indices.length >= 2) {
          indices.forEach(idx => beamedEventIndices.add(idx));
        } else {
          beamGroupsMap.delete(gid);
        }
      }

      interface RenderedEventGeom {
        evX: number;
        noteY: number;
        staffOffset: number;
        stemUp: boolean;
        stemX: number;
        stemEndY: number;
      }
      const eventGeoms: Record<number, RenderedEventGeom> = {};

      for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
        const ev = transMeasure.events[eIdx];
        const evX =
          mStartX +
          innerPaddingLeft +
          (ev.startStepInMeasure / curStepsPerMeasure) * innerW +
          5;
        if (!ev.isRest) {
          const pitchInfo = midiToPitchNotation(ev.midi, preferFlats, keySig.count);
          const staffOffset = getStaffStepOffset(pitchInfo.absDiatonicStep, clef);
          const noteY = staffBottomY - staffOffset * (lineSpacing / 2);
          const stemUp = staffOffset <= 6;
          const stemLen = ev.baseFigure === '64' ? 35 : ev.baseFigure === '32' ? 31 : 27;
          const stemX = stemUp ? evX + 3.9 : evX - 3.9;
          const stemEndY = stemUp ? noteY - stemLen : noteY + stemLen;
          eventGeoms[eIdx] = { evX, noteY, staffOffset, stemUp, stemX, stemEndY };
        }
      }

      for (const indices of beamGroupsMap.values()) {
        const geoms = indices.map(i => eventGeoms[i]).filter(Boolean);
        if (geoms.length < 2) continue;

        const maxBeamLevelInGroup = Math.max(
          ...indices.map(i => getBeamCountForBaseFigure(transMeasure.events[i].baseFigure))
        );
        const avgOffset = geoms.reduce((s, g) => s + g.staffOffset, 0) / geoms.length;
        const sharedStemUp = avgOffset <= 6;
        const stemLen = maxBeamLevelInGroup >= 4 ? 36 : maxBeamLevelInGroup === 3 ? 32 : 28;

        geoms.forEach(g => {
          g.stemUp = sharedStemUp;
          g.stemX = sharedStemUp ? g.evX + 3.9 : g.evX - 3.9;
        });

        const firstG = geoms[0];
        const lastG = geoms[geoms.length - 1];

        let targetFirstEndY: number;
        let targetLastEndY: number;

        if (sharedStemUp) {
          const highestNoteY = Math.min(...geoms.map(g => g.noteY));
          const baseBeamY = highestNoteY - stemLen;
          const pitchDiff = Math.max(-5, Math.min(5, (lastG.noteY - firstG.noteY) * 0.25));
          targetFirstEndY = baseBeamY - (pitchDiff > 0 ? pitchDiff : 0);
          targetLastEndY = baseBeamY + (pitchDiff < 0 ? -pitchDiff : pitchDiff);
        } else {
          const lowestNoteY = Math.max(...geoms.map(g => g.noteY));
          const baseBeamY = lowestNoteY + stemLen;
          const pitchDiff = Math.max(-5, Math.min(5, (lastG.noteY - firstG.noteY) * 0.25));
          targetFirstEndY = baseBeamY - (pitchDiff > 0 ? pitchDiff : 0);
          targetLastEndY = baseBeamY + (pitchDiff < 0 ? -pitchDiff : pitchDiff);
        }

        const totalSpanX = Math.max(1, lastG.stemX - firstG.stemX);
        geoms.forEach(g => {
          const t = (g.stemX - firstG.stemX) / totalSpanX;
          g.stemEndY = targetFirstEndY + t * (targetLastEndY - targetFirstEndY);
        });
      }

      let prevNoteX: number | null = null;
      let prevStemUp = true;

      for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
        const ev = transMeasure.events[eIdx];
        const evX =
          mStartX +
          innerPaddingLeft +
          (ev.startStepInMeasure / curStepsPerMeasure) * innerW +
          5;

        if (ev.isRest) {
          const midY = staffTopY + lineSpacing * 2;
          if (ev.baseFigure === 'w') {
            parts.push(
              `<rect x="${(evX - 4).toFixed(1)}" y="${(staffTopY + lineSpacing).toFixed(
                1
              )}" width="9" height="4" fill="#000000" />`
            );
          } else if (ev.baseFigure === 'h') {
            parts.push(
              `<rect x="${(evX - 4).toFixed(1)}" y="${(midY - 4).toFixed(
                1
              )}" width="9" height="4" fill="#000000" />`
            );
          } else if (ev.baseFigure === 'q') {
            parts.push(
              `<path d="M ${evX - 2} ${midY - 9} L ${evX + 3} ${midY - 3} L ${
                evX - 2
              } ${midY + 2} L ${evX + 3} ${midY + 7} C ${evX} ${midY + 6}, ${
                evX - 3
              } ${midY + 9}, ${evX - 1} ${midY + 11}" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
            );
          } else if (ev.baseFigure === '8') {
            parts.push(
              `<circle cx="${evX - 1.5}" cy="${midY - 3}" r="2.2" fill="#000000" />`
            );
            parts.push(
              `<path d="M ${evX - 1} ${midY - 3} Q ${evX + 3} ${midY - 5} ${
                evX + 3
              } ${midY - 6} L ${evX - 1} ${midY + 8}" fill="none" stroke="#000000" stroke-width="1.6" stroke-linecap="round" />`
            );
          } else {
            const hooksCount = getBeamCountForBaseFigure(ev.baseFigure);
            const topHookY = midY - (hooksCount - 1) * 4;
            const bottomSlashY = midY + 9;
            for (let h = 0; h < hooksCount; h++) {
              const hy = topHookY + h * 4.5;
              const hx = evX - 1 - h * 0.7;
              parts.push(
                `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="1.9" fill="#000000" />`
              );
            }
            parts.push(
              `<line x1="${(evX + 2.8).toFixed(1)}" y1="${(topHookY - 1.5).toFixed(
                1
              )}" x2="${(evX - 2.2).toFixed(1)}" y2="${bottomSlashY.toFixed(
                1
              )}" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />`
            );
          }

          if (ev.dots > 0) {
            parts.push(
              `<circle cx="${(evX + 6.5).toFixed(1)}" cy="${(midY - 3).toFixed(
                1
              )}" r="1.5" fill="#000000" />`
            );
          }
          prevNoteX = null;
          pendingCrossBarTie = null;
          continue;
        }

        const geom = eventGeoms[eIdx];
        const { staffOffset, noteY, stemUp, stemX, stemEndY } = geom;

        if (staffOffset <= -2) {
          for (let lo = -2; lo >= staffOffset; lo -= 2) {
            const ly = staffBottomY - lo * (lineSpacing / 2);
            parts.push(
              `<line x1="${(evX - 6.8).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(
                evX + 6.8
              ).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="#000000" stroke-width="1.25" />`
            );
          }
        } else if (staffOffset >= 10) {
          for (let hi = 10; hi <= staffOffset; hi += 2) {
            const ly = staffBottomY - hi * (lineSpacing / 2);
            parts.push(
              `<line x1="${(evX - 6.8).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(
                evX + 6.8
              ).toFixed(1)}" y2="${ly.toFixed(1)}" stroke="#000000" stroke-width="1.25" />`
            );
          }
        }

        const accToRender = ev.displayedAccidental ?? '';
        if (accToRender === '#') {
          parts.push(
            `<text x="${(evX - 9.2).toFixed(1)}" y="${(noteY + 3.8).toFixed(
              1
            )}" font-size="11.5" font-weight="800" text-anchor="middle" fill="#000000">♯</text>`
          );
        } else if (accToRender === 'b') {
          parts.push(
            `<text x="${(evX - 9.2).toFixed(1)}" y="${(noteY + 3.8).toFixed(
              1
            )}" font-size="12" font-weight="800" text-anchor="middle" fill="#000000">♭</text>`
          );
        } else if (accToRender === 'natural') {
          parts.push(
            `<text x="${(evX - 9.2).toFixed(1)}" y="${(noteY + 3.8).toFixed(
              1
            )}" font-size="12" font-weight="800" text-anchor="middle" fill="#000000">${'\u266E'}</text>`
          );
        }

        const isHollow = ev.baseFigure === 'w' || ev.baseFigure === 'h';
        if (isHollow) {
          parts.push(
            `<ellipse cx="${evX.toFixed(1)}" cy="${noteY.toFixed(
              1
            )}" rx="4.6" ry="3.3" transform="rotate(-18 ${evX.toFixed(1)} ${noteY.toFixed(
              1
            )})" fill="#ffffff" stroke="#000000" stroke-width="1.8" />`
          );
        } else {
          parts.push(
            `<ellipse cx="${evX.toFixed(1)}" cy="${noteY.toFixed(
              1
            )}" rx="4.5" ry="3.2" transform="rotate(-18 ${evX.toFixed(1)} ${noteY.toFixed(
              1
            )})" fill="#000000" />`
          );
        }

        if (ev.chordMidis && ev.chordMidis.length > 1) {
          for (const extraMidi of ev.chordMidis) {
            if (extraMidi === ev.midi) continue;
            const extraPitch = midiToPitchNotation(extraMidi, preferFlats, keySig.count);
            const extraOffset = getStaffStepOffset(extraPitch.absDiatonicStep, clef);
            const extraY = staffBottomY - extraOffset * (lineSpacing / 2);
            if (isHollow) {
              parts.push(
                `<ellipse cx="${evX.toFixed(1)}" cy="${extraY.toFixed(
                  1
                )}" rx="4.6" ry="3.3" transform="rotate(-18 ${evX.toFixed(
                  1
                )} ${extraY.toFixed(1)})" fill="#ffffff" stroke="#000000" stroke-width="1.6" />`
              );
            } else {
              parts.push(
                `<ellipse cx="${evX.toFixed(1)}" cy="${extraY.toFixed(
                  1
                )}" rx="4.5" ry="3.2" transform="rotate(-18 ${evX.toFixed(
                  1
                )} ${extraY.toFixed(1)})" fill="#000000" />`
              );
            }
          }
        }

        // Puntillo rítmico único estándar (hd, qd, 8d) al lado derecho de la cabeza de nota
        if (ev.dots > 0) {
          const dotY = staffOffset % 2 === 0 ? noteY - 2.5 : noteY;
          parts.push(
            `<circle cx="${(evX + 7.2).toFixed(1)}" cy="${dotY.toFixed(
              1
            )}" r="1.55" fill="#000000" />`
          );
        }

        if (ev.baseFigure !== 'w') {
          parts.push(
            `<line x1="${stemX.toFixed(1)}" y1="${noteY.toFixed(1)}" x2="${stemX.toFixed(
              1
            )}" y2="${stemEndY.toFixed(1)}" stroke="#000000" stroke-width="1.45" />`
          );

          const flagsCount = getBeamCountForBaseFigure(ev.baseFigure);
          if (flagsCount > 0 && !beamedEventIndices.has(eIdx)) {
            for (let f = 0; f < flagsCount; f++) {
              const flagOffset = f * 5.2;
              if (stemUp) {
                const fy = stemEndY + flagOffset;
                parts.push(
                  `<path d="M ${stemX.toFixed(1)} ${fy.toFixed(1)} Q ${(
                    stemX + 7
                  ).toFixed(1)} ${(fy + 4.5).toFixed(1)} ${(stemX + 5).toFixed(1)} ${(
                    fy + 11
                  ).toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.75" stroke-linecap="round" />`
                );
              } else {
                const fy = stemEndY - flagOffset;
                parts.push(
                  `<path d="M ${stemX.toFixed(1)} ${fy.toFixed(1)} Q ${(
                    stemX + 7
                  ).toFixed(1)} ${(fy - 4.5).toFixed(1)} ${(stemX + 5).toFixed(1)} ${(
                    fy - 11
                  ).toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.75" stroke-linecap="round" />`
                );
              }
            }
          }
        }

        // Ligaduras de Prolongación (Ties) internas e inter-compás
        if (ev.tieFromPrev) {
          if (prevNoteX !== null) {
            const tieY = prevStemUp ? noteY + 5.5 : noteY - 5.5;
            const curveCtrlY = prevStemUp ? tieY + 6.5 : tieY - 6.5;
            const midTieX = (prevNoteX + evX) / 2;
            parts.push(
              `<path d="M ${(prevNoteX + 3.5).toFixed(1)} ${tieY.toFixed(
                1
              )} Q ${midTieX.toFixed(1)} ${curveCtrlY.toFixed(1)} ${(evX - 3.5).toFixed(
                1
              )} ${tieY.toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />`
            );
          } else if (pendingCrossBarTie && pendingCrossBarTie.row === row) {
            const tieY = pendingCrossBarTie.stemUp ? noteY + 5.5 : noteY - 5.5;
            const curveCtrlY = pendingCrossBarTie.stemUp ? tieY + 7.5 : tieY - 7.5;
            const midTieX = (pendingCrossBarTie.x + evX) / 2;
            parts.push(
              `<path d="M ${(pendingCrossBarTie.x + 3.5).toFixed(1)} ${tieY.toFixed(
                1
              )} Q ${midTieX.toFixed(1)} ${curveCtrlY.toFixed(1)} ${(evX - 3.5).toFixed(
                1
              )} ${tieY.toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />`
            );
            pendingCrossBarTie = null;
          } else {
            const tieY = stemUp ? noteY + 5.5 : noteY - 5.5;
            const curveCtrlY = stemUp ? tieY + 5.5 : tieY - 5.5;
            const startStubX = mStartX + 3;
            const midStubX = (startStubX + evX - 3.5) / 2;
            parts.push(
              `<path d="M ${startStubX.toFixed(1)} ${tieY.toFixed(
                1
              )} Q ${midStubX.toFixed(1)} ${curveCtrlY.toFixed(1)} ${(evX - 3.5).toFixed(
                1
              )} ${tieY.toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />`
            );
            pendingCrossBarTie = null;
          }
        }

        if (eIdx === transMeasure.events.length - 1 && ev.tieToNext) {
          if (col === measuresPerRow - 1) {
            const tieY = stemUp ? noteY + 5.5 : noteY - 5.5;
            const curveCtrlY = stemUp ? tieY + 5.5 : tieY - 5.5;
            const endStubX = mEndX - 3;
            const midStubX = (evX + 3.5 + endStubX) / 2;
            parts.push(
              `<path d="M ${(evX + 3.5).toFixed(1)} ${tieY.toFixed(
                1
              )} Q ${midStubX.toFixed(1)} ${curveCtrlY.toFixed(1)} ${endStubX.toFixed(
                1
              )} ${tieY.toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />`
            );
            pendingCrossBarTie = null;
          } else {
            pendingCrossBarTie = {
              x: evX,
              y: noteY,
              stemUp,
              row,
              measureEndX: mEndX
            };
          }
        } else if (eIdx === transMeasure.events.length - 1) {
          pendingCrossBarTie = null;
        }

        prevNoteX = evX;
        prevStemUp = stemUp;
      }

      for (const indices of beamGroupsMap.values()) {
        const firstIdx = indices[0];
        const lastIdx = indices[indices.length - 1];
        const gFirst = eventGeoms[firstIdx];
        const gLast = eventGeoms[lastIdx];
        if (!gFirst || !gLast) continue;

        parts.push(
          `<line x1="${gFirst.stemX.toFixed(1)}" y1="${gFirst.stemEndY.toFixed(
            1
          )}" x2="${gLast.stemX.toFixed(1)}" y2="${gLast.stemEndY.toFixed(
            1
          )}" stroke="#000000" stroke-width="3.4" stroke-linecap="butt" />`
        );

        for (let level = 2; level <= 4; level++) {
          const beamOffset = (gFirst.stemUp ? 1 : -1) * (level - 1) * 4.8;
          const strokeW = level === 2 ? 3.1 : 2.7;

          for (let k = 0; k < indices.length; k++) {
            const curIdx = indices[k];
            const curEv = transMeasure.events[curIdx];
            if (getBeamCountForBaseFigure(curEv.baseFigure) < level) continue;

            const nextIdx = k + 1 < indices.length ? indices[k + 1] : -1;
            const prevIdx = k - 1 >= 0 ? indices[k - 1] : -1;
            const nextHasLevel =
              nextIdx !== -1 &&
              getBeamCountForBaseFigure(transMeasure.events[nextIdx].baseFigure) >= level;
            const prevHasLevel =
              prevIdx !== -1 &&
              getBeamCountForBaseFigure(transMeasure.events[prevIdx].baseFigure) >= level;

            const gCur = eventGeoms[curIdx];
            if (!gCur) continue;

            if (nextHasLevel) {
              const gNext = eventGeoms[nextIdx];
              if (gNext) {
                parts.push(
                  `<line x1="${gCur.stemX.toFixed(1)}" y1="${(
                    gCur.stemEndY + beamOffset
                  ).toFixed(1)}" x2="${gNext.stemX.toFixed(1)}" y2="${(
                    gNext.stemEndY + beamOffset
                  ).toFixed(1)}" stroke="#000000" stroke-width="${strokeW}" stroke-linecap="butt" />`
                );
              }
            } else if (!prevHasLevel) {
              const stubTowardsRight = k === 0;
              const neighborG = stubTowardsRight
                ? eventGeoms[indices[k + 1]]
                : eventGeoms[indices[k - 1]];
              if (neighborG) {
                const stubLen = 7.5;
                const dir = stubTowardsRight ? 1 : -1;
                const slope =
                  (neighborG.stemEndY - gCur.stemEndY) /
                  Math.max(1, Math.abs(neighborG.stemX - gCur.stemX));
                const stubEndX = gCur.stemX + dir * stubLen;
                const stubEndY = gCur.stemEndY + slope * stubLen;

                parts.push(
                  `<line x1="${gCur.stemX.toFixed(1)}" y1="${(
                    gCur.stemEndY + beamOffset
                  ).toFixed(1)}" x2="${stubEndX.toFixed(1)}" y2="${(
                    stubEndY + beamOffset
                  ).toFixed(1)}" stroke="#000000" stroke-width="${strokeW}" stroke-linecap="butt" />`
                );
              }
            }
          }
        }

        const tupletEv = indices
          .map(i => transMeasure.events[i])
          .find(ev => ev.isTriplet || ev.tupletNumber);
        if (tupletEv) {
          const tLabel = String(tupletEv.tupletNumber || 3);
          const midX = (gFirst.stemX + gLast.stemX) / 2;
          const midY = (gFirst.stemEndY + gLast.stemEndY) / 2;
          const labelY = gFirst.stemUp ? midY - 5 : midY + 12;
          parts.push(
            `<text x="${midX.toFixed(1)}" y="${labelY.toFixed(
              1
            )}" font-size="10.5" font-weight="800" font-style="italic" text-anchor="middle" fill="#000000">${escapeXml(
              tLabel
            )}</text>`
          );
        }
      }

      const bracketTupletMap = new Map<string, number[]>();
      for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
        const ev = transMeasure.events[eIdx];
        if (!ev.isRest && ev.tupletBracket && ev.tupletGroupId) {
          const list = bracketTupletMap.get(ev.tupletGroupId) || [];
          list.push(eIdx);
          bracketTupletMap.set(ev.tupletGroupId, list);
        }
      }

      for (const indices of bracketTupletMap.values()) {
        if (indices.length < 2) continue;
        const firstG = eventGeoms[indices[0]];
        const lastG = eventGeoms[indices[indices.length - 1]];
        if (!firstG || !lastG) continue;

        const tNum = transMeasure.events[indices[0]].tupletNumber || 3;
        const isUp = firstG.stemUp;
        const minTopY = Math.min(...indices.map(i => Math.min(eventGeoms[i].noteY, eventGeoms[i].stemEndY)));
        const maxBotY = Math.max(...indices.map(i => Math.max(eventGeoms[i].noteY, eventGeoms[i].stemEndY)));

        const bracketY = isUp ? minTopY - 7 : maxBotY + 9;
        const hookDir = isUp ? 4.5 : -4.5;
        const x1 = firstG.evX - 4;
        const x2 = lastG.evX + 4;
        const midX = (x1 + x2) / 2;

        parts.push(
          `<path d="M ${x1.toFixed(1)} ${(bracketY + hookDir).toFixed(
            1
          )} L ${x1.toFixed(1)} ${bracketY.toFixed(1)} L ${(midX - 7).toFixed(
            1
          )} ${bracketY.toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.25" />`
        );
        parts.push(
          `<path d="M ${(midX + 7).toFixed(1)} ${bracketY.toFixed(
            1
          )} L ${x2.toFixed(1)} ${bracketY.toFixed(1)} L ${x2.toFixed(1)} ${(
            bracketY + hookDir
          ).toFixed(1)}" fill="none" stroke="#000000" stroke-width="1.25" />`
        );
        parts.push(
          `<text x="${midX.toFixed(1)}" y="${(bracketY + 3.5).toFixed(
            1
          )}" font-size="10" font-weight="800" font-style="italic" text-anchor="middle" fill="#000000">${tNum}</text>`
        );
      }
    }

    parts.push(
      `<text x="${
        pageW / 2
      }" y="${pageH - 22}" font-size="9.5" font-weight="600" fill="#555555" text-anchor="middle">PÁGINA ${
        pageIdx + 1
      } DE ${totalPages}   •   RUMIE STUDIO PRO — MOTOR DE PARTITURA VECTORIAL</text>`
    );

    parts.push('</svg>');
    svgPages.push(parts.join('\n'));
  }

  return svgPages;
}