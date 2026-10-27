import React, { useState } from "react";
import { useInstrument } from "../contexts/InstrumentContext";
import { Play } from "lucide-react";
import { dictionaryAudio } from "../utils/dictionaryAudio";

export interface IntervalNote {
  stringIdx: number; // 0 = Low E, 1 = A, 2 = D, 3 = G, 4 = B, 5 = High e
  fret: number;
  label: string;
}

interface IntervalFretboardProps {
  intervalName: string;
  notes: IntervalNote[];
  isExpanded?: boolean;
}

export default function IntervalFretboard({
  intervalName,
  notes,
  isExpanded = false,
}: IntervalFretboardProps) {
  const { instrument } = useInstrument();
  const [visibleNoteIndex, setVisibleNoteIndex] = useState<number | null>(null);

  // calculate baseFret from notes
  const frets = notes.map((n) => n.fret);
  const minFret = frets.length > 0 ? Math.min(...frets) : 1;
  const maxFret = frets.length > 0 ? Math.max(...frets) : 5;

  // Try to fit notes within 5 frets. If they span more, increase numFretsToDraw.
  const fretSpan = maxFret - minFret + 1;
  const numFretsToDraw = Math.max(5, fretSpan + 1);
  const baseFret = Math.max(1, minFret - 1); // 1 fret padding at the top if possible, minimum 1

  const stringXCoords = [30, 82, 134, 186, 238, 290];
  const fretStepHeight = 56;

  const playMelodicInterval = () => {
    if (notes.length === 0) return;

    // Play first note
    setVisibleNoteIndex(0);
    playNote(notes[0]);

    if (notes.length > 1) {
      setTimeout(() => {
        setVisibleNoteIndex(1);
        playNote(notes[1]);

        setTimeout(() => {
          setVisibleNoteIndex(null); // Show all
        }, 1000);
      }, 800);
    } else {
      setTimeout(() => setVisibleNoteIndex(null), 1000);
    }
  };

  const playHarmonicInterval = () => {
    if (notes.length === 0) return;
    setVisibleNoteIndex(null);
    const tuningNotes = [40, 45, 50, 55, 59, 64];
    const freqs = notes.map((note) => {
      const midi = tuningNotes[note.stringIdx] + note.fret;
      return 440 * Math.pow(2, (midi - 69) / 12);
    });
    dictionaryAudio.playChord(freqs, 'guitar', { strumDelay: 0 });
  };

  const playNote = (note: IntervalNote) => {
    const tuningNotes = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
    const midi = tuningNotes[note.stringIdx] + note.fret;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'guitar');
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 relative flex flex-col items-center select-none font-sans mt-1 overflow-visible">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botones a ancho completo */}
      <div className="flex flex-col gap-2.5 w-full mb-3.5 overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 className={`${isExpanded ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-sans font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            <span>Intervalo</span>
            <span className="text-orange-500 font-mono">{intervalName}</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">
            Intervalo Aislado en el Mástil
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={playMelodicInterval}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 transition text-neutral-200 font-sans font-bold text-xs uppercase tracking-wider rounded-lg border border-neutral-700 shadow-none cursor-pointer"
          >
            <Play size={14} fill="currentColor" className="shrink-0" />
            <span>Melódico</span>
          </button>
          <button
            onClick={playHarmonicInterval}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-500 hover:bg-orange-600 transition text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg shadow-none cursor-pointer"
          >
            <Play size={14} fill="currentColor" className="shrink-0" />
            <span>Armónico</span>
          </button>
        </div>
      </div>

      <div className={`w-full flex justify-center items-center py-4 bg-neutral-950/70 rounded-xl border border-neutral-800/80 overflow-visible ${isExpanded ? 'min-h-[340px]' : 'min-h-[290px]'}`}>
        <svg
          width="340"
          height={70 + numFretsToDraw * fretStepHeight + 30}
          viewBox={`0 0 320 ${70 + numFretsToDraw * fretStepHeight + 30}`}
          style={{ maxWidth: "100%", margin: "0 auto" }}
          className="overflow-visible select-none"
        >
          <g transform="translate(0, 10)">
          {/* Base Fret Marker */}
          {baseFret > 1 && (
            <text
              x="5"
              y="108"
              fill="#a3a3a3"
              fontSize="14"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {baseFret}fr
            </text>
          )}

          {/* Nut or Top Fret Line */}
          <rect
            x="30"
            y="70"
            width="260"
            height={baseFret === 1 ? 8 : 2}
            fill={baseFret === 1 ? "#EA580B" : "#404040"}
            rx={baseFret === 1 ? 1 : 0}
          />

          {/* Frets */}
          {Array.from({ length: numFretsToDraw }).map((_, i) => (
            <line
              key={`fret-${i}`}
              x1="30"
              y1={70 + (i + 1) * fretStepHeight}
              x2="290"
              y2={70 + (i + 1) * fretStepHeight}
              stroke="#404040"
              strokeWidth="1.5"
            />
          ))}

          {/* Strings */}
          {stringXCoords.map((x, index) => (
            <line
              key={`string-${index}`}
              x1={x}
              y1="70"
              x2={x}
              y2={70 + numFretsToDraw * fretStepHeight}
              stroke="#525252"
              strokeWidth={1 + (5 - index) * 0.3}
            />
          ))}

          {/* Notes */}
          {notes.map((note, index) => {
            const isVisible =
              visibleNoteIndex === null || visibleNoteIndex === index;
            const isSecondNoteAnimated = visibleNoteIndex === 1 && index === 1;

            const isRoot = index === 0;
            const x = stringXCoords[note.stringIdx];
            const visualFret = note.fret - baseFret;
            const y = 70 + visualFret * fretStepHeight + fretStepHeight / 2;

            return (
              <g
                key={`note-${index}`}
                className="transition-all duration-200 cursor-pointer"
                onClick={() => playNote(note)}
                style={{
                  opacity: isVisible ? 1 : 0.2,
                  transform: isSecondNoteAnimated ? "scale(1.08)" : "scale(1)",
                  transformOrigin: `${x}px ${y}px`,
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill={isRoot ? "#EA580B" : "#0284c7"}
                  className="transition-all duration-150"
                />
                <text
                  x={x}
                  y={y + 4}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {note.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  </div>
);
}
