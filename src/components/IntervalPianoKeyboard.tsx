import React, { useState } from "react";
import { useInstrument } from "../contexts/InstrumentContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Play } from "lucide-react";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { IntervalNote } from "./IntervalFretboard";
import PremiumPiano from "./PremiumPiano";

interface IntervalPianoKeyboardProps {
  intervalName: string;
  notes: IntervalNote[];
  isExpanded?: boolean;
}

const PIANO_START_MIDI = 48; // C3
const NUM_KEYS = 37; // 3 octaves C3 to C6

function isBlackKey(midi: number) {
  const noteInOctave = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

export default function IntervalPianoKeyboard({
  intervalName,
  notes,
  isExpanded = false,
}: IntervalPianoKeyboardProps) {
  const { t } = useLanguage();
  const { instrument } = useInstrument();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayingNote, setActivePlayingNote] = useState<number | null>(null);

  const activeNotesMidi = notes.map(n => {
    const tuningNotes = [40, 45, 50, 55, 59, 64];
    let midi = tuningNotes[n.stringIdx] + n.fret;
    while (midi < PIANO_START_MIDI) midi += 12;
    while (midi >= PIANO_START_MIDI + NUM_KEYS) midi -= 12;
    return midi;
  });

  const rootMidi = activeNotesMidi[0]; // the first note is the root for interval visualization usually

  const handlePlayNotes = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    dictionaryAudio.getContext();
    
    for (let i = 0; i < activeNotesMidi.length; i++) {
      const midi = activeNotesMidi[i];
      setActivePlayingNote(midi);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      dictionaryAudio.playSingleNote(freq, 'piano');
      await new Promise(r => setTimeout(r, 600));
    }
    
    setActivePlayingNote(null);
    setIsPlaying(false);
  };

  const handlePlaySingle = (midi: number) => {
    dictionaryAudio.getContext();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'piano');
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-none relative overflow-visible flex flex-col mt-1">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botón TOCAR a ancho completo */}
      <div className="flex flex-col gap-2.5 mb-3.5 w-full overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 className={`${isExpanded ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            <span>Intervalo en el Piano</span>
            <span className="text-orange-400 font-mono text-lg sm:text-xl">{intervalName}</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">
            {t('academy.isolatedInterval')}
          </p>
        </div>
        
        <button
          onClick={handlePlayNotes}
          disabled={isPlaying}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play size={14} fill="currentColor" className={`shrink-0 ${isPlaying ? "animate-pulse" : ""}`} />
          <span>{isPlaying ? t('academy.playing') : t('academy.playInterval')}</span>
        </button>
      </div>

      <PremiumPiano
        activeNotes={activeNotesMidi.map((midi, index) => ({ midi, label: notes[index]?.label }))}
        playingNotes={activePlayingNote !== null ? [activePlayingNote] : []}
        rootNote={notes[0]?.label || rootMidi}
        whiteKeyHeight={isExpanded ? "h-52 sm:h-60" : "h-36 sm:h-40"}
        blackKeyHeight={isExpanded ? "h-32 sm:h-36" : "h-22 sm:h-24"}
        isExpanded={isExpanded}
        onPlayNote={handlePlaySingle}
      />
    </div>
  );
}
