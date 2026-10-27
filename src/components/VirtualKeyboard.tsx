import React from 'react';

interface VirtualKeyboardProps {
  activeNotes: number[];
  dictionaryNotes?: number[];
  playingDictNotes?: number[];
  startNote?: number; // Default 36 (C2)
  endNote?: number;   // Default 96 (C7)
}

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const midiToNoteName = (midi: number) => notes[midi % 12];

interface VirtualKeyboardProps {
  activeNotes: number[];
  dictionaryNotes?: number[];
  playingDictNotes?: number[];
  startNote?: number;
  endNote?: number;
  onNoteOn?: (note: number) => void;
  onNoteOff?: (note: number) => void;
}

export default function VirtualKeyboard({ activeNotes, dictionaryNotes = [], playingDictNotes = [], startNote = 36, endNote = 96, onNoteOn, onNoteOff }: VirtualKeyboardProps) {
  // Helper to determine if a MIDI note is a black key
  const isBlackKey = (midiNote: number) => {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const keys = [];
  for (let i = startNote; i <= endNote; i++) {
    keys.push(i);
  }

  return (
    <div className="relative w-full overflow-x-auto select-none bg-black/50 p-4 rounded-xl border border-slate-800">
      <div className="flex relative min-w-max mx-auto h-48 md:h-64 shadow-2xl">
        {keys.map((midiNote) => {
          if (isBlackKey(midiNote)) return null;

          const hasBlackKeyNext = isBlackKey(midiNote + 1) && midiNote + 1 <= endNote;
          
          const isWhiteActive = activeNotes.includes(midiNote);
          const isWhiteDict = dictionaryNotes.includes(midiNote);
          const isWhitePlaying = playingDictNotes.includes(midiNote);
          const isBlackActive = hasBlackKeyNext ? activeNotes.includes(midiNote + 1) : false;
          const isBlackDict = hasBlackKeyNext ? dictionaryNotes.includes(midiNote + 1) : false;
          const isBlackPlaying = hasBlackKeyNext ? playingDictNotes.includes(midiNote + 1) : false;

          return (
            <div key={midiNote} className="relative h-full flex">
              {/* White Key */}
              <div
                onPointerDown={(e) => { e.preventDefault(); onNoteOn?.(midiNote); }}
                onPointerUp={(e) => { e.preventDefault(); onNoteOff?.(midiNote); }}
                onPointerLeave={(e) => { e.preventDefault(); onNoteOff?.(midiNote); }}
                className={`relative z-0 w-10 md:w-12 h-full cursor-pointer border border-slate-900 rounded-b-md flex items-end justify-center pb-2 transition-colors duration-75 shadow-sm
                  ${isWhiteActive ? 'bg-orange-300 shadow-[0_0_15px_rgba(253,186,116,0.6)]' : 
                    isWhitePlaying ? 'bg-emerald-300 shadow-[0_0_15px_rgba(110,231,183,0.6)] z-10' :
                    isWhiteDict ? 'bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.6)]' : 'bg-white hover:bg-slate-100'}`}
              >
                {/* Note Label */}
                {(isWhiteActive || isWhiteDict || isWhitePlaying) ? (
                  <span className={`${isWhiteActive || isWhitePlaying ? 'text-slate-900' : 'text-slate-800'} text-xs font-bold mb-2`}>{midiToNoteName(midiNote)}</span>
                ) : (midiNote % 12 === 0 && (
                  <span className="text-slate-400 text-[10px] font-bold">C{Math.floor(midiNote / 12) - 1}</span>
                ))}
              </div>

              {/* Black Key */}
              {hasBlackKeyNext && (
                <div
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onNoteOn?.(midiNote + 1); }}
                  onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); onNoteOff?.(midiNote + 1); }}
                  onPointerLeave={(e) => { e.preventDefault(); e.stopPropagation(); onNoteOff?.(midiNote + 1); }}
                  className={`absolute z-10 top-0 left-full -translate-x-1/2 w-6 md:w-8 h-2/3 cursor-pointer rounded-b-md flex items-end justify-center pb-2 transition-colors duration-75 shadow-md
                    ${isBlackActive ? 'bg-orange-500 shadow-[0_0_15px_rgba(234,88,11,0.8)] z-30' : 
                      isBlackPlaying ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-30' :
                      isBlackDict ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                  {(isBlackActive || isBlackDict || isBlackPlaying) && (
                    <span className="text-white text-[10px] font-bold mb-2">{midiToNoteName(midiNote + 1)}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
