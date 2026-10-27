export type RootNote =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type ChordClass = "Major" | "Seventh" | "Augmented" | "Minor" | "Diminished" | "Minor 7b5";

export type ChordTypeOptions =
  | "Mayor" | "maj7" | "maj9" | "maj13" | "maj7#11" | "maj9#11" | "6" | "6(9)"
  | "Menor" | "m7" | "m9" | "m11" | "m13" | "m6" | "m(maj7)" | "m7b5" | "m11b5" | "mb13b5" | "m9b5"
  | "7" | "9" | "13" | "7sus4" | "9sus4" | "13sus4"
  | "alt" | "7b9" | "7#9" | "7#11" | "7b13"
  | "dim" | "dim7" | "dim7_9" | "dim7_11" | "dim7_b13" | "aug" | "add9" | "m-add9";

export interface ChordDefinition {
  type: ChordTypeOptions;
  category: ChordClass;
  intervals: number[]; // semitones relative to root
  symbol: string; // abbreviation
  suffix: string; // text suffix
  chordFormula: string;
}

export interface Barre {
  fromString: number;
  toString: number;
  fretOffset?: number; // used in templates
  fret?: number; // used in final rendering
  finger?: number;
}

export interface GuitarVoicing {
  bassString?: number;
  frets: number[]; // 6 strings, -1 for mute.
  fingers: number[]; // fingering numbers.
  baseFret: number | string; // Roman numeral supported.
  mutes?: boolean[]; // Explicit mutes, true for 'X'.
  label?: string;
  isPro?: boolean;
  barres?: Barre[];
}

export type MelodyInstrument = "vibraphone";

export interface MelodyNote {
  midi: number;          // Número MIDI de la nota (ej. 69 = A4)
  startBeat: number;     // Pulso de inicio dentro del compás (puede ser negativo para anacrusa, ej. -3, -2, -1, o 0 a 3.99)
  durationBeats: number; // Duración en pulsos (ej. 1 = negra, 0.5 = corchea, 2 = blanca)
  velocity?: number;     // 0.1 a 1.0 (por defecto 0.90)
}

export interface SongMeasure {
  id: string;
  chords: string[]; // e.g. ["Cmaj7", "Am7"] or ["Dm7"] - length 1, 2 or 4 chords in a bar
  modulateTo?: { key: RootNote; isMinor: boolean };
  sectionLabel?: string; // Etiqueta de sección musical / parte (ej: [A], [B], [Intro], [Coda])
  repeatStart?: boolean; // Signo / barra de repetición de inicio |:
  repeatEnd?: boolean;   // Signo / barra de repetición de fin :|
  volta?: 1 | 2;         // Casilla de repetición 1 o 2 (Voltas 1. y 2.)
  isEnd?: boolean;       // Marcador de final de progresión (END)
  melody?: MelodyNote[]; // Notas de la melodía (Lead) en este compás
}

export interface ImportedNote {
  freq: number;
  startBeat: number; // absolute beat from start of song
  durationBeats: number;
}

export interface Song {
  id: string;
  title: string;
  defaultKey: string;
  defaultIsMinor?: boolean;
  style: string; // Swing, Bossa Nova, Ballad, etc.
  tempo: number;
  timeSignature?: string; // e.g. "4/4", "3/4", "6/8"
  measures: SongMeasure[]; // grid of measures representing the song sheet
  sections?: { [key: string]: number }; // starting indices of sections, e.g. { "A": 0, "B": 8 }
  isCustom?: boolean;
  importedMelody?: ImportedNote[];
  pickupMelody?: MelodyNote[]; // Anacrusa inicial antes del compás 1
  audioUrl?: string;
  analyzedChordsData?: any[];
}

export interface ChordSoundConfig {
  root: RootNote;
  type: ChordTypeOptions;
}

export interface AudioClip {
  id: string;
  buffer: AudioBuffer | null;
  startTime: number;
  duration: number;
  name: string;
  trimStart?: number;
  trimOffset?: number;
  trimEnd?: number;
  fadeIn?: number;
  fadeOut?: number;
  gain?: number;
  type?: 'audio' | 'midi';
  notes?: any[];
}

export interface Track {
  id: string;
  name: string;
  trimStart?: number;
  trimOffset?: number;
  trimEnd?: number;
  fadeIn?: number;
  fadeOut?: number;
  instrument: string;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSolo: boolean;
  isArmed: boolean;
  events: any[];
  fx: any;
  type?: 'midi' | 'audio';
  channelMode?: 'mono' | 'stereo';
  monitor?: boolean;
  inputChannel?: number | 'stereo';
  audioClips?: AudioClip[];
  inserts?: (any | null)[];
  color?: string;
  height?: number;
  isDrumTrack?: boolean;
}