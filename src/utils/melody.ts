import { RootNote, ChordTypeOptions } from "../types";
import { parseChord } from "./music";
import { ROOT_MIDI_OFFSET_MAP } from "../data/chords";

export interface ScheduledNote {
  freq: number;
  timeOffset: number; // in beats relative to start of chord
  durationBeats: number;
}

function midiToFreq(midiNode: number): number {
  return 440 * Math.pow(2, (midiNode - 69) / 12);
}

const CENTRAL_OCTAVE = 72; // C5

// Constrain a midi note to be within CENTRAL_OCTAVE and CENTRAL_OCTAVE + 11
function constrainToOctave(midi: number): number {
  let m = midi;
  while (m < CENTRAL_OCTAVE) m += 12;
  while (m >= CENTRAL_OCTAVE + 12) m -= 12;
  return m;
}

// Exactly 1, 3, 5, 7 arpeggio
function getArpeggioTones(rootMidi: number, type: ChordTypeOptions): number[] {
  let intervals = [0, 4, 7, 10]; // default dom7 (1, 3, 5, b7)
  const isMajor = type.includes("maj") || type === ("M7" as string) || type === ("6" as string);
  const isMinor = !isMajor && (type.includes("m") || type.includes("min"));
  
  if (isMinor) {
    intervals = [0, 3, 7, 10]; // m7 (1, b3, 5, b7)
    if (type.includes("b5") || type === "m7b5") intervals = [0, 3, 6, 10]; // m7b5 (1, b3, b5, b7)
  } else if (isMajor) {
    intervals = [0, 4, 7, 11]; // maj7 (1, 3, 5, 7)
    if (type === ("6" as string)) intervals = [0, 4, 7, 9]; // 6 (1, 3, 5, 6)
  } else if (type === "dim" || type === "dim7") {
    intervals = [0, 3, 6, 9]; // dim7 (1, b3, b5, bb7)
  } else if (type === ("7alt" as string) || type === "7#9" || type === "7b9" || type === "alt") {
    intervals = [0, 4, 8, 10]; // 7#5 (1, 3, #5, b7) - simplified altered arpeggio
  }
  
  return intervals.map(i => constrainToOctave(rootMidi + i));
}

// Shuffle array
function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

export function generateLick(
  chordString: string,
  chordBeats: number,
  globalKey: RootNote,
  nextChordString: string | null = null
): ScheduledNote[] {
  const parsed = parseChord(chordString);
  const rootMidi = 60 + ROOT_MIDI_OFFSET_MAP[parsed.root]; 
  
  const notes: ScheduledNote[] = [];

  const arpeggioTones = getArpeggioTones(rootMidi, parsed.type);

  // Target Note for next chord (always in the central octave)
  let targetMidi = arpeggioTones[1]; // default to 3rd of current chord
  if (nextChordString) {
    const nextParsed = parseChord(nextChordString);
    const nextRootMidi = 60 + ROOT_MIDI_OFFSET_MAP[nextParsed.root];
    const nextArpeggio = getArpeggioTones(nextRootMidi, nextParsed.type);
    // Resolve to 3rd or 5th of the next chord for stronger melodic resolution
    targetMidi = nextArpeggio[Math.random() > 0.5 ? 1 : 2];
  }

  let currentBeat = 0.0; 
  const beatsForVocab = chordBeats - 1; // Leave 1 beat for resolution/approach
  
  while (currentBeat < beatsForVocab) {
    const r = Math.random();
    
    // Choose random arpeggio tones
    const tone1 = arpeggioTones[Math.floor(Math.random() * arpeggioTones.length)];
    const tone2 = arpeggioTones[Math.floor(Math.random() * arpeggioTones.length)];
    
    // Smooth, lyrical rhythms like Autumn Leaves (longer notes)
    if (r < 0.1) {
      // Rest
      currentBeat += 1.0;
    } else if (r < 0.3 && currentBeat + 4 <= beatsForVocab) {
      // Whole note
      notes.push({ freq: midiToFreq(tone1), timeOffset: currentBeat, durationBeats: 4.0 });
      currentBeat += 4.0;
    } else if (r < 0.5 && currentBeat + 3 <= beatsForVocab) {
      // Dotted half note
      notes.push({ freq: midiToFreq(tone1), timeOffset: currentBeat, durationBeats: 3.0 });
      currentBeat += 3.0;
    } else if (r < 0.8 && currentBeat + 2 <= beatsForVocab) {
      // Half note
      notes.push({ freq: midiToFreq(tone1), timeOffset: currentBeat, durationBeats: 2.0 });
      currentBeat += 2.0;
    } else if (r < 0.95 && currentBeat + 1 <= beatsForVocab) {
      // Quarter note
      notes.push({ freq: midiToFreq(tone1), timeOffset: currentBeat, durationBeats: 1.0 });
      currentBeat += 1.0;
    } else if (currentBeat + 1 <= beatsForVocab) {
      // Two eighth notes (used sparingly)
      notes.push({ freq: midiToFreq(tone1), timeOffset: currentBeat, durationBeats: 0.5 });
      notes.push({ freq: midiToFreq(tone2), timeOffset: currentBeat + 0.5, durationBeats: 0.5 });
      currentBeat += 1.0;
    } else {
      currentBeat += 1.0; 
    }
  }
  
  // Last beat: Approach towards the Target Note (3rd or 5th of next chord)
  const enclosureStartBeat = chordBeats - 1;
  const approachBelow = targetMidi - 1; // half step below
  const approachAbove = targetMidi + 2; // scale step above
  
  const approachRhythm = Math.random();
  if (approachRhythm < 0.2) {
      // Double approach (Corcheas)
      notes.push({ freq: midiToFreq(approachAbove), timeOffset: enclosureStartBeat, durationBeats: 0.5 });
      notes.push({ freq: midiToFreq(approachBelow), timeOffset: enclosureStartBeat + 0.5, durationBeats: 0.5 });
  } else {
      // Single note approach (Negra de anticipación - much more common in smooth jazz)
      const approachNode = Math.random() > 0.5 ? approachBelow : approachAbove;
      notes.push({ freq: midiToFreq(approachNode), timeOffset: enclosureStartBeat, durationBeats: 1.0 });
  }
  
  return notes;
}
