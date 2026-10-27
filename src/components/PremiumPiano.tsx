import React, { useEffect, useRef } from 'react';

interface PremiumPianoProps {
  activeNotes?: (number | string | {midi: number; label: string})[]; // MIDI numbers
  playingNotes?: number[]; // MIDI numbers
  rootNote?: number | string | null; // MIDI number or Note string
  startMidi?: number; // default 48 (C3)
  numKeys?: number; // default 25 (2 octaves)
  onPlayNote?: (midi: number) => void;
  whiteKeyHeight?: string;
  blackKeyHeight?: string;
  isExpanded?: boolean;
}

function getNoteName(midi: number) {
  const scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return scale[midi % 12];
}

const enharmonics: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

export default function PremiumPiano({
  activeNotes = [],
  playingNotes = [],
  rootNote = null,
  startMidi = 48,
  numKeys = 25,
  onPlayNote,
  whiteKeyHeight = "h-36 sm:h-40",
  blackKeyHeight = "h-22 sm:h-24",
  isExpanded = false,
}: PremiumPianoProps) {
  const whiteKeys: { whiteKey: number; blackKey: number | null }[] = [];
  let currentMidi = startMidi;
  while (currentMidi < startMidi + numKeys) {
    const isBlack = [1, 3, 6, 8, 10].includes(currentMidi % 12);
    if (isBlack) {
      if (whiteKeys.length > 0) {
        whiteKeys[whiteKeys.length - 1].blackKey = currentMidi;
      }
    } else {
      whiteKeys.push({ whiteKey: currentMidi, blackKey: null });
    }
    currentMidi++;
  }

  return (
    <div className="w-full py-1">
      <div className="flex w-full bg-neutral-950 p-1.5 rounded-lg border border-neutral-800 overflow-hidden shadow-none">
        {whiteKeys.map((pair) => {
          const wMidi = pair.whiteKey;
          const bMidi = pair.blackKey;

          const wName = getNoteName(wMidi);
          const octaveNum = Math.floor(wMidi / 12) - 1;

          const isWhiteActive = !!activeNotes.find(n => n === wMidi || (typeof n === 'object' && n !== null && n.midi === wMidi));
          
          let whiteLabel = wName;
          const activeWhiteObj = activeNotes.find(n => typeof n === 'object' && n !== null && (n as any).midi === wMidi) as any;
          if (activeWhiteObj && activeWhiteObj.label) whiteLabel = activeWhiteObj.label;
          const isWhitePlaying = playingNotes.includes(wMidi);
          
          const sharpName = bMidi !== null ? getNoteName(bMidi) : null;
          const flatName = sharpName ? enharmonics[sharpName] : null;
          
          let rootStr = '';
          if (typeof rootNote === 'string') {
            rootStr = rootNote.replace(/[0-9]/g, '');
          } else if (typeof rootNote === 'number') {
            rootStr = getNoteName(rootNote);
          }

          const preferFlats = rootStr.includes('b') || rootStr === 'F';

          const stringMatch = activeNotes.find(n => typeof n === 'string' && ((sharpName && n === sharpName) || (flatName && n === flatName) || (sharpName && n.includes(sharpName)) || (flatName && n.includes(flatName))));
          const numberMatch = activeNotes.find(n => n === bMidi);
          const objectMatch = activeNotes.find(n => typeof n === 'object' && n !== null && (n as any).midi === bMidi) as any;
          
          const activeBlackNoteFound = objectMatch || stringMatch || numberMatch;
          const isBlackActive = !!activeBlackNoteFound;

          let displayBlackName = sharpName;
          if (typeof activeBlackNoteFound === 'object' && activeBlackNoteFound !== null && (activeBlackNoteFound as any).label) {
            displayBlackName = activeBlackNoteFound.label;
          } else if (typeof activeBlackNoteFound === 'string') {
            displayBlackName = activeBlackNoteFound.replace(/[0-9]/g, '');
          } else if (preferFlats && flatName) {
            displayBlackName = flatName;
          }

          const isBlackPlaying = bMidi !== null && playingNotes.includes(bMidi);

          return (
            <div 
              id={`key-${wMidi}`}
              key={wMidi} 
              onClick={() => onPlayNote?.(wMidi)}
              className={`cursor-pointer relative flex-1 ${whiteKeyHeight} border-r border-b border-l border-neutral-300 rounded-b-none flex flex-col justify-between items-center pb-2 pt-1.5 transition-colors duration-150 shadow-none select-none
                ${isWhitePlaying ? 'bg-orange-200' : 'bg-neutral-100 hover:bg-white'}
              `}
            >
              {wName === "C" ? (
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-neutral-400 select-none leading-none">
                  C{octaveNum}
                </span>
              ) : (
                <span />
              )}

              {/* Indicador Tecla Blanca: círculo plano bg-orange-500, sin bordes ni sombras, texto en blanco */}
              {isWhiteActive && (
                <div className={`${
                  isExpanded
                    ? 'w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-xs mb-1.5'
                    : 'w-4.5 h-4.5 sm:w-5 sm:h-5 text-[8px] sm:text-[9px] mb-1'
                } rounded-full flex items-center justify-center font-bold bg-orange-500 text-white shadow-none leading-none tracking-tighter shrink-0 mx-auto
                  ${isWhitePlaying ? 'scale-110' : ''}
                `}>
                  {whiteLabel}
                </div>
              )}

              {/* Tecla Negra: color oscuro mate bg-neutral-800 o bg-neutral-900 sin brillo ni gradientes */}
              {bMidi !== null && (
                <div 
                  id={`key-${bMidi}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayNote?.(bMidi);
                  }}
                  className={`cursor-pointer absolute top-0 -right-[35%] w-[70%] ${blackKeyHeight} z-10 rounded-b-none border-x border-b border-neutral-900 flex flex-col justify-end items-center pb-1.5 transition-colors duration-150 shadow-none select-none
                    ${isBlackPlaying ? 'bg-orange-500' : 'bg-neutral-800 hover:bg-neutral-700'}
                  `}
                >
                  {/* Indicador Tecla Negra: círculo plano bg-orange-500, sin bordes ni sombras, texto en blanco */}
                  {isBlackActive && (
                    <div className={`${
                      isExpanded
                        ? 'w-5 h-5 sm:w-6 sm:h-6 text-[9px] sm:text-[11px] mb-1'
                        : 'w-4 h-4 sm:w-4.5 sm:h-4.5 text-[7px] sm:text-[8px] mb-0.5'
                    } rounded-full flex items-center justify-center font-bold bg-orange-500 text-white shadow-none leading-none tracking-tighter shrink-0 mx-auto
                  ${isBlackPlaying ? 'scale-110' : ''}
                `}>
                      {displayBlackName}
                    </div>
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
