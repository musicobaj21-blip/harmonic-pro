import React, { useState, useEffect } from 'react';
import { useInstrument } from "../contexts/InstrumentContext";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { useLanguage } from "../contexts/LanguageContext";
import { Play } from "lucide-react";
import PremiumPiano from "./PremiumPiano";
import { RootNote } from "../types";

interface ScalePianoKeyboardProps {
  scaleName: string;
  notes: string[];
  root: RootNote;
  isArpeggio?: boolean;
  isolatedShape?: {
    stringIdx: number;
    fretIdx: number;
    label: string;
    isRoot?: boolean;
  }[];
  autoPlayTrigger?: number;
  onPlay?: () => void;
  playLabel?: string;
  twoOctaves?: boolean;
  chordString?: string;
  isExpanded?: boolean;
}

function isBlackKey(midi: number) {
  const noteInOctave = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

const getNoteOffset = (note: string) => {
  const map: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
    E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
    Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5, "B#": 0
  };
  const cleanNote = note.replace(/[0-9]/g, '');
  return map[cleanNote] ?? 0;
};

const getMidiFromNoteName = (noteStr: string) => {
  const match = noteStr.match(/^([A-G][#b]?)([0-9])$/);
  if (!match) return 0;
  const note = match[1];
  const octave = parseInt(match[2], 10);
  const offset = getNoteOffset(note);
  return (octave + 1) * 12 + offset;
};

export default function ScalePianoKeyboard({
  scaleName,
  notes,
  root,
  isArpeggio,
  isolatedShape,
  autoPlayTrigger,
  onPlay,
  playLabel,
  twoOctaves,
  chordString,
  isExpanded = false,
}: ScalePianoKeyboardProps) {
  const { t, translateNote } = useLanguage();
  const { instrument } = useInstrument();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayingNote, setActivePlayingNote] = useState<number | null>(null);

  const activeOffsets = notes.map(getNoteOffset);
  const rootOffset = getNoteOffset(root);

  const exactMidis = notes.map(getMidiFromNoteName).filter(m => m > 0);
  const hasOctaves = exactMidis.length === notes.length && exactMidis.length > 0;

  let finalStartMidi = 48;
  let finalNumKeys = 25;
  let allActiveMidis: number[] = [];
  let activeShapeMidi = new Set<number>();

  if (isolatedShape) {
    const tuningNotes = [40, 45, 50, 55, 59, 64];
    isolatedShape.forEach(p => {
      let midi = tuningNotes[p.stringIdx] + p.fretIdx;
      while (midi < 48) midi += 12;
      while (midi >= 48 + 25) midi -= 12;
      activeShapeMidi.add(midi);
    });
    
    allActiveMidis = Array.from(activeShapeMidi);
    finalStartMidi = 48;
    finalNumKeys = 25;
  } else if (hasOctaves) {
    const minMidi = Math.min(...exactMidis);
    const maxMidi = Math.max(...exactMidis);
    
    finalStartMidi = minMidi;
    if (isBlackKey(finalStartMidi)) finalStartMidi--;
    
    let endMidi = maxMidi;
    if (isBlackKey(endMidi)) endMidi++;
    
    finalNumKeys = endMidi - finalStartMidi + 1;
    
    if (isBlackKey(finalStartMidi + finalNumKeys - 1)) {
       finalNumKeys++; 
    }
    // Pad to min 12 keys for better visuals
    while (finalNumKeys < 12) finalNumKeys++;
    
    allActiveMidis = exactMidis;
  } else {
    // We want to start the scale exactly on its root and play exactly 1 octave of it
    const baseOctave = 4; // C4 = 60
    let currentMidi = 12 * (baseOctave + 1) + rootOffset; // e.g. A4 = 69
    // actually let's pick an octave that centers nicely. 48 + offset
    currentMidi = 48 + rootOffset; 
    
    // Sort the notes so they ascend from the root
    // But the activeOffsets array is already in scale order!
    // We just need to build ascending midis based on activeOffsets
    
    let currentOffset = activeOffsets[0];
    let octaveBase = currentMidi - currentOffset; // This is the C of the current octave
    
    allActiveMidis = [];
    let prevOffset = -1;
    let currentOctave = Math.floor(currentMidi / 12);
    
    const numOctaves = twoOctaves ? 2 : 1;
    for (let oct = 0; oct < numOctaves; oct++) {
      for (let i = 0; i < activeOffsets.length; i++) {
         const offset = activeOffsets[i];
         if (offset < prevOffset) {
             currentOctave++;
         }
         allActiveMidis.push(currentOctave * 12 + offset);
         prevOffset = offset;
      }
    }
    
    // Add the top root note to complete the octave visually
    allActiveMidis.push((currentOctave + (activeOffsets[0] < prevOffset ? 1 : 0)) * 12 + activeOffsets[0]);
    
    finalStartMidi = Math.min(...allActiveMidis);
    if (isBlackKey(finalStartMidi)) finalStartMidi--;
    
    const maxMidi = Math.max(...allActiveMidis);
    let endMidi = maxMidi;
    if (isBlackKey(endMidi)) endMidi++;
    
    finalNumKeys = endMidi - finalStartMidi + 1;
    while (finalNumKeys < 15) finalNumKeys++;
  }

  const handlePlayScale = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    dictionaryAudio.getContext();
    
    let midiSequence: number[] = [];
    if (isolatedShape) {
       midiSequence = isolatedShape.map(p => {
         const tuningNotes = [40, 45, 50, 55, 59, 64];
         let midi = tuningNotes[p.stringIdx] + p.fretIdx;
         while (midi < 48) midi += 12;
         while (midi >= 48 + 25) midi -= 12;
         return midi;
       }).sort((a,b) => a - b);
    } else if (hasOctaves) {
       midiSequence = [...exactMidis]; 
    } else {
      midiSequence = [...allActiveMidis];
    }

    for (let i = 0; i < midiSequence.length; i++) {
      const midi = midiSequence[i];
      setActivePlayingNote(midi);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      dictionaryAudio.playSingleNote(freq, 'piano');
      await new Promise(r => setTimeout(r, 400));
    }
    
    setActivePlayingNote(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (autoPlayTrigger) {
      handlePlayScale();
    }
  }, [autoPlayTrigger]);

  const handlePlayNote = async (midi: number) => {
    dictionaryAudio.getContext();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'piano');
  };

  // 1. Extracción Dinámica de la Raíz DIRECTAMENTE del string original del acorde
  const rawRootMatch = chordString ? chordString.trim().match(/^([A-G][#b]?)/) : null;
  const originalChordRoot = rawRootMatch ? rawRootMatch[1] : null;

  // 2. Sincronización Enarmónica: Si el acorde tiene bemol (b), usar bemol; si tiene (#), usar sostenido
  let effectiveRoot = root;
  if (originalChordRoot) {
    if (originalChordRoot.includes('b')) {
      const flatMap: Record<string, string> = {
        'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
      };
      effectiveRoot = (flatMap[root] || originalChordRoot) as RootNote;
    } else if (originalChordRoot.includes('#')) {
      const sharpMap: Record<string, string> = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
      };
      effectiveRoot = (sharpMap[root] || originalChordRoot) as RootNote;
    } else {
      effectiveRoot = originalChordRoot as RootNote;
    }
  }

  // 3. Eliminar Conversión por Defecto a sostenidos en el título
  const modeName = scaleName.replace(/^[A-G][#b]?\s+/, '');
  const effectiveScaleName = modeName !== scaleName ? `${effectiveRoot} ${modeName}` : scaleName;

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-none relative overflow-visible flex flex-col h-auto mt-1">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botón TOCAR a ancho completo */}
      <div className="flex flex-col gap-2.5 mb-3.5 w-full overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 className={`${isExpanded ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            <span className="text-orange-400">{translateNote(effectiveRoot)}</span>{" "}
            <span className={`${isExpanded ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-mono text-neutral-200`}>{modeName}</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">
             {isolatedShape ? t('academy.isolatedInterval') : t('academy.pianoSequence')}
          </p>
        </div>
        
        <button 
          onClick={onPlay || handlePlayScale}
          disabled={isPlaying}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>{playLabel || (isPlaying ? t('academy.playing') : t(isArpeggio ? 'academy.playArpeggio' : 'academy.playScale'))}</span>
        </button>
      </div>

      <PremiumPiano
        numKeys={isExpanded ? Math.max(finalNumKeys, 37) : finalNumKeys}
        startMidi={isExpanded ? Math.min(finalStartMidi, 48) : finalStartMidi}
        whiteKeyHeight={isExpanded ? "h-52 sm:h-60" : "h-36 sm:h-40"}
        blackKeyHeight={isExpanded ? "h-32 sm:h-36" : "h-22 sm:h-24"}
        isExpanded={isExpanded}
        activeNotes={allActiveMidis.map(midi => {
          if (hasOctaves) {
            const index = exactMidis.indexOf(midi);
            return { midi, label: index !== -1 ? translateNote(notes[index]) : undefined };
          }
          const noteIndex = activeOffsets.indexOf(midi % 12);
          return { midi, label: noteIndex !== -1 ? translateNote(notes[noteIndex]) : undefined };
        })}
        playingNotes={activePlayingNote !== null ? [activePlayingNote] : []}
        rootNote={root}
        onPlayNote={handlePlayNote}
      />
    </div>
  );
}
