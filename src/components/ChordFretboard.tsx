import { useInstrument } from "../contexts/InstrumentContext";
import { useState, useEffect } from "react";
import { GuitarVoicing, RootNote, ChordTypeOptions } from "../types";
import { getGuitarChordFrequencies, ROOT_DISPLAY_NAME_MAP, getGuitarChordVoicings } from "../data/chords";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { Play, Volume2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { transposeRoot } from "../utils/music";

interface ChordFretboardProps {
  root: RootNote;
  type: ChordTypeOptions | string;
  voicing?: GuitarVoicing;
  title?: string;
  subtitle?: string;
  isPro?: boolean;
  positions?: (number | null | string | undefined)[];
  fingersOverride?: (number | null | undefined)[];
  barres?: { fret: number, stringFrom: number, stringTo: number }[];
  forceBaseFret?: number;
  triadShape?: { string: number, fret: number, label: string, finger?: number }[];
  showFretNumbers?: boolean;
  showIntervalLabels?: boolean;
  showFingerings?: boolean;
  isArpeggio?: boolean;
  activeSequenceIndex?: number | null;
  onPlay?: () => void;
  playLabel?: string;
  isExpanded?: boolean;
}

// Convert MIDI number to note name
function getNoteNameForStringFret(
  stringIndex: number,
  fret: number | null | string | undefined,
  rootKey?: RootNote,
  translateFn?: (n: string) => string
): string {
  if (fret == null || fret === "x" || fret === "X" || fret === -1) return "-";
  const numFret = typeof fret === "string" ? parseInt(fret) : fret;
  if (isNaN(numFret) || numFret === -1) return "-";

  // Tuning: E(40), A(45), D(50), G(55), B(59), e(64)
  const tuningNotes = [40, 45, 50, 55, 59, 64];
  const midi = tuningNotes[stringIndex] + numFret;
  
  if (rootKey) {
    const rootOffsetMap: Record<string, number> = {
      C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
      E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
      Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5, "B#": 0
    };
    const rOff = rootOffsetMap[rootKey as string] ?? 0;
    const semis = (midi - rOff + 120) % 12;
    const name = transposeRoot(rootKey, semis, rootKey);
    return translateFn ? translateFn(name) : name;
  }
  const scale = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const raw = scale[midi % 12];
  return translateFn ? translateFn(raw) : raw;
}

// Convert roman numeral back to integer or use fallback
function getRomanNumeralValue(numeral: string | number): number {
  if (typeof numeral === "number") return numeral;
  const numMap: Record<string, number> = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12, "XIII": 13, "XIV": 14, "XV": 15
  };
  return numMap[numeral] || parseInt(numeral, 10) || 1;
}

export default function ChordFretboard({
  root,
  type,
  voicing,
  title,
  subtitle,
  isPro = false,
  positions,
  fingersOverride,
  barres,
  forceBaseFret,
  triadShape,
  showFretNumbers = true,
  showIntervalLabels = false,
  showFingerings = true,
  isArpeggio = false,
  activeSequenceIndex = null,
  onPlay,
  playLabel,
  isExpanded = false,
}: ChordFretboardProps) {
  const { instrument } = useInstrument();
  const { t, translateNote } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  // If we have isolated interval positions, build a mock voicing
  let currentVoicing;
  if (triadShape) {
    const frets = [-1, -1, -1, -1, -1, -1];
    triadShape.forEach(t => {
       frets[6 - t.string] = t.fret;
    });
    currentVoicing = {
       frets,
       fingers: [0, 0, 0, 0, 0, 0],
       baseFret: forceBaseFret ?? Math.min(...triadShape.map(t => t.fret))
    } as GuitarVoicing;
  } else {
    currentVoicing = positions 
      ? { 
          frets: positions.map(f => (f == null || f === "x" || f === "X" ? -1 : Number(f))), 
          fingers: fingersOverride?.map(f => f ?? 0) ?? [0, 0, 0, 0, 0, 0], 
          baseFret: forceBaseFret ?? 1,
          barres: barres ? barres.map(b => ({ fret: b.fret, fromString: b.stringFrom, toString: b.stringTo })) : []
        } as GuitarVoicing
      : (voicing || getGuitarChordVoicings(root, type as any, isPro)?.[0]);
  }
  
  if (!currentVoicing) return null; // Safety

  const rawFrets = triadShape ? currentVoicing.frets : (positions ?? currentVoicing.frets);
  const frets = (rawFrets ?? []).map(f => (f == null || f === "x" || f === "X" ? -1 : Number(f)));
  const fingers = fingersOverride ?? currentVoicing.fingers ?? [];

  // Robust calculation of baseFret
  const validFrets = frets.filter(f => typeof f === 'number' && f > 0);
  const calculatedBaseFret = validFrets.length > 0 ? Math.min(...validFrets) : 1;
  const numericBaseFret = forceBaseFret ?? (currentVoicing.baseFret ? getRomanNumeralValue(currentVoicing.baseFret) : calculatedBaseFret);

  const rootOffsetMap: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
    E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
    Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5, "B#": 0
  };
  const rootOffset = rootOffsetMap[root as string] ?? 0;

  const getNoteForPosition = (stringIdx: number, fretNum: number): string => {
    const tuningNotes = [40, 45, 50, 55, 59, 64];
    const midi = tuningNotes[stringIdx] + fretNum;
    const semis = (midi - rootOffset + 120) % 12;
    const noteName = transposeRoot(root, semis, root);
    return translateNote(noteName);
  };

  // Handle playing the entire chord
  const handlePlayChord = async () => {
    dictionaryAudio.getContext();
    if (triadShape) {
      const tuningNotes = [40, 45, 50, 55, 59, 64];
      const freqs = triadShape.map(n => 440 * Math.pow(2, (tuningNotes[6 - n.string] + n.fret - 69) / 12));
      dictionaryAudio.playChord(freqs, 'guitar');
    } else {
      const freqs = getGuitarChordFrequencies(frets);
      dictionaryAudio.playChord(freqs, 'guitar');
    }
  };

  // Play a single string note
  const handlePlayString = async (stringIndex: number) => {
    dictionaryAudio.getContext();
    const fret = frets[stringIndex];
    if (fret === undefined || fret === -1) return;
    const tuningNotes = [40, 45, 50, 55, 59, 64];
    const midi = tuningNotes[stringIndex] + fret;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'guitar');
  };

  // SVG parameters with generous horizontal & vertical spacing
  const stringXCoords = [52, 95, 138, 181, 224, 268];
  const fretYCoords = [70, 134, 198, 262, 326, 390]; // 5 fret spans with 64px height each
  const numFrets = 5;

  // Pre-calculate arpeggio sequence ordering (low to high string)
  let arpeggioSequenceMap: Record<number, number> = {};
  if (isArpeggio) {
     let seqItem = 1;
     for (let i = 0; i < 6; i++) {
        const f = frets[i];
        const isMuted = currentVoicing.mutes ? currentVoicing.mutes[i] : f === -1;
        if (!isMuted && f !== undefined) {
           arpeggioSequenceMap[i] = seqItem++;
        }
     }
  }

  return (
    <div className="flex flex-col items-center bg-neutral-900 p-3 sm:p-3.5 rounded-xl border border-neutral-800 shadow-none w-full h-auto overflow-visible">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botón TOCAR a ancho completo */}
      <div className="flex flex-col gap-1.5 mb-2 w-full overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 id="chord-fretboard-title" className={`${isExpanded ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            <span>{translateNote(ROOT_DISPLAY_NAME_MAP[root] || root)}</span>
            <span className={`${isExpanded ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} text-orange-400 font-mono font-bold`}>
              {title ? title : type}
            </span>
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">{subtitle}</p>
          )}
        </div>
        
        <button 
          id="play-chord-btn"
          onClick={onPlay || handlePlayChord}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all py-2 px-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase shadow-md shadow-orange-500/10 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>{playLabel || (positions ? t("academy.playNotes") : t("chords.playChord"))}</span>
        </button>
      </div>

      {/* SVG Guitar Diagram */}
      <div className={`relative w-full flex justify-center items-center py-2 bg-neutral-950/70 rounded-xl border border-neutral-800/80 ${isExpanded ? 'min-h-[250px] sm:min-h-[270px]' : 'min-h-[205px] sm:min-h-[220px]'}`}>
        <svg
          id="fretboard-svg"
          width="100%"
          height="100%"
          viewBox="0 0 320 445"
          className={`select-none w-full h-auto ${isExpanded ? 'max-w-[270px] sm:max-w-[295px]' : 'max-w-[225px] sm:max-w-[245px]'}`}
        >
          {/* Base Fret indicator (Numeric) */}
          {showFretNumbers && numericBaseFret > 1 && (
            <text
              x="44"
              y="74"
              textAnchor="end"
              className="fill-orange-500 text-lg font-sans font-bold"
            >
              {numericBaseFret}
            </text>
          )}

          {/* Draw Frets (horizontal lines) */}
          {fretYCoords.map((y, index) => {
            const isNut = index === 0 && numericBaseFret === 1;
            return (
              <line
                key={`fret-${index}`}
                x1={stringXCoords[0]}
                y1={y}
                x2={stringXCoords[stringXCoords.length - 1]}
                y2={y}
                stroke={isNut ? "#EA580B" : "#404040"}
                strokeWidth={isNut ? 4 : 1.5}
              />
            );
          })}

          {/* Draw Strings (vertical lines with variable width to simulate gauge) */}
          {stringXCoords.map((x, index) => {
            // String width representing thickness (6th string thickest)
            const strokeWidth = 2.5 - index * 0.35;
            return (
              <line
                key={`string-${index}`}
                x1={x}
                y1={fretYCoords[0]}
                x2={x}
                y2={fretYCoords[fretYCoords.length - 1]}
                stroke="#525252"
                strokeWidth={strokeWidth}
              />
            );
          })}

          {/* String interaction zones (Invisible wide vertical bars for easy tapping) */}
          {stringXCoords.map((x, index) => {
            const isPlayed = frets[index] !== undefined && frets[index] !== -1;
            return (
              <rect
                key={`string-hitbox-${index}`}
                x={x - 12}
                y={fretYCoords[0] - 25}
                width="24"
                height="300"
                fill="transparent"
                className={isPlayed ? "cursor-pointer hover:fill-orange-500/10 transition" : "cursor-not-allowed"}
                onClick={() => handlePlayString(index)}
              >
                <title>{isPlayed ? `Tocar cuerda ${6 - index} (${getNoteNameForStringFret(index, frets[index])})` : "Cuerda silenciada (X)"}</title>
              </rect>
            );
          })}

          {/* Draw Open (O) / Muted (X) labels on top of the nut */}
          {frets.map((fret, stringIdx) => {
            const isMuted = currentVoicing.mutes ? currentVoicing.mutes[stringIdx] : fret === -1;
            const x = stringXCoords[stringIdx];
            const y = 55; // aligned to sit right on top of the nut (nut is at 70)

            if (isMuted) {
              // Muted string (X)
              return (
                <g key={`mute-${stringIdx}`}>
                  <text
                    x={x}
                    y={y}
                    fill="#a3a3a3"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    className="cursor-default"
                  >
                    X
                  </text>
                </g>
              );
            } else if (fret === 0) {
              // Open string (O)
              return (
                <g key={`open-${stringIdx}`}>
                  <text
                    x={x}
                    y={y}
                    fill="#a3a3a3"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    className="cursor-default"
                  >
                    O
                  </text>
                  {isArpeggio && arpeggioSequenceMap[stringIdx] && (() => {
                    const triadNote = triadShape ? triadShape.find(t => 6 - t.string === stringIdx) : null;
                    const openLabel = triadNote
                      ? (triadNote.label === "Bajo" ? triadNote.label : (translateNote(triadNote.label) || getNoteForPosition(stringIdx, 0)))
                      : getNoteForPosition(stringIdx, 0);
                    
                    const isTonic = openLabel === translateNote(root);
                    let isActiveSequence = false;
                    let opacityClass = "opacity-100";
                    if (isArpeggio && activeSequenceIndex !== null) {
                      if (arpeggioSequenceMap[stringIdx] === activeSequenceIndex) {
                        isActiveSequence = true;
                      } else {
                        opacityClass = "opacity-30";
                      }
                    }

                    return (
                    <g className={`${opacityClass} transition-opacity duration-300 ${isTonic && activeSequenceIndex === null ? "animate-pulse" : ""} ${isActiveSequence ? 'scale-110 origin-center' : ''}`} style={activeSequenceIndex === null ? { animationDelay: `${arpeggioSequenceMap[stringIdx] * 300}ms` } : { transition: 'all 0.3s ease' }}>
                      <circle cx={x + 10} cy={y - 8} r="6.5" className="fill-orange-500" />
                      <text x={x + 10} y={y - 8} fill="#ffffff" fontSize={openLabel.length >= 3 ? "7.5" : "8.5"} fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" alignmentBaseline="central">
                        {openLabel}
                      </text>
                    </g>
                    );
                  })()}
                </g>
              );
            }
            return null;
          })}

          {/* Draw Barres */}
          {isArpeggio && Object.keys(arpeggioSequenceMap).length > 0 && (() => {
            const points: string[] = [];
            for (let i = 0; i < 6; i++) {
              if (arpeggioSequenceMap[i]) {
                const fret = frets[i];
                if (fret === undefined || fret === -1) continue;
                const x = stringXCoords[i];
                let y = fretYCoords[0] - 8; // open string roughly here
                if (fret > 0) {
                  const visualFretIndex = fret - numericBaseFret;
                  if (visualFretIndex >= 0 && visualFretIndex < numFrets) {
                    y = fretYCoords[visualFretIndex] + (fretYCoords[visualFretIndex + 1] - fretYCoords[visualFretIndex]) / 2;
                  }
                }
                points.push(`${x},${y}`);
              }
            }
            if (points.length > 1) {
              return (
                <polyline 
                  points={points.join(" ")} 
                  fill="none" 
                  stroke="#EA580B" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                  className="opacity-70"
                />
              );
            }
            return null;
          })()}

          {!triadShape && !isArpeggio && currentVoicing.barres?.map((barre, i) => {
            const fret = barre.fret || 0;
            if (fret <= 0) return null; // open strings don't need UI barre
            
            const visualFretIndex = fret - numericBaseFret;
            if (visualFretIndex < 0 || visualFretIndex >= numFrets) return null;

            const fromIdx = 6 - barre.fromString;
            const toIdx = 6 - barre.toString;
            
            const minIdx = Math.min(fromIdx, toIdx);
            const maxIdx = Math.max(fromIdx, toIdx);

            const xStart = stringXCoords[minIdx];
            const xEnd = stringXCoords[maxIdx];
            const y = fretYCoords[visualFretIndex] + (fretYCoords[visualFretIndex + 1] - fretYCoords[visualFretIndex]) / 2;
            
            return (
               <g key={`barre-${i}`}>
                 <rect 
                   x={xStart - 10} 
                   y={y - 10} 
                   width={(xEnd - xStart) + 20} 
                   height="20" 
                   rx="10" 
                   className="fill-orange-500" 
                 />
               </g>
            )
          })}

          {/* Draw Finger Dots */}
          {triadShape ? 
            triadShape.map((t, idx) => {
              const stringIdx = 6 - t.string;
              const fret = t.fret;

              const visualFretIndex = fret - numericBaseFret;
              if (visualFretIndex < 0 || visualFretIndex >= numFrets) return null;

              const x = stringXCoords[stringIdx];
              const y = fretYCoords[visualFretIndex] + (fretYCoords[visualFretIndex + 1] - fretYCoords[visualFretIndex]) / 2;
              
              const labelStr = t.label === "Bajo" ? t.label : (translateNote(t.label) || getNoteForPosition(stringIdx, fret));

              let isActiveSequence = false;
              let opacityClass = "opacity-100";
              if (isArpeggio && activeSequenceIndex !== null) {
                if (arpeggioSequenceMap[stringIdx] === activeSequenceIndex) {
                  isActiveSequence = true;
                } else {
                  opacityClass = "opacity-30";
                }
              }

              return (
                <g
                  key={`dot-iso-${idx}`}
                  className={`cursor-pointer ${opacityClass} transition-opacity duration-200`}
                  onClick={() => handlePlayString(stringIdx)}
                >
                  <circle
                     cx={x}
                     cy={y}
                     r="12"
                     className="fill-orange-500 transition-transform duration-150"
                     style={{ transformOrigin: `${x}px ${y}px` }}
                  />
                  <text
                     x={x}
                     y={y}
                     fill="#ffffff"
                     fontSize={labelStr.length >= 3 ? "8" : "9"}
                     fontWeight="bold"
                     fontFamily="sans-serif"
                     textAnchor="middle"
                     dominantBaseline="central"
                     alignmentBaseline="central"
                  >
                     {labelStr}
                  </text>
                </g>
              );
            })
          : frets.map((fret, stringIdx) => {
            if (fret === undefined || fret <= 0) return null; // open or muted is handled above

            // Calculate which visual fret space it goes.
            const visualFretIndex = fret - numericBaseFret;
            if (visualFretIndex < 0 || visualFretIndex >= numFrets) return null;

            const x = stringXCoords[stringIdx];
            // center in-between fret lines
            const y = fretYCoords[visualFretIndex] + (fretYCoords[visualFretIndex + 1] - fretYCoords[visualFretIndex]) / 2;

            const noteLabel = getNoteForPosition(stringIdx, fret);
            const triadNote = triadShape ? triadShape.find(t => 6 - t.string === stringIdx) : null;
            let labelStr = noteLabel;
            if (isArpeggio && triadNote) {
              labelStr = triadNote.label;
            } else if (triadNote) {
              labelStr = triadNote.label === "Bajo" ? triadNote.label : (translateNote(triadNote.label) || noteLabel);
            }

            let isActiveSequence = false;
            let opacityClass = "opacity-100";
            if (isArpeggio && activeSequenceIndex !== null) {
              if (arpeggioSequenceMap[stringIdx] === activeSequenceIndex) {
                isActiveSequence = true;
              } else {
                opacityClass = "opacity-30";
              }
            }

            return (
              <g
                key={`dot-${stringIdx}`}
                className={`cursor-pointer ${opacityClass} transition-opacity duration-200`}
                onClick={() => handlePlayString(stringIdx)}
              >
                {/* Visual Circle for dots: plano perfecto, color de acento, sin relieve ni sombras */}
                <circle
                   cx={x}
                   cy={y}
                   r={triadNote || isArpeggio ? "12" : "10"}
                   className="fill-orange-500 transition-transform duration-150"
                   style={{ transformOrigin: `${x}px ${y}px` }}
                />
                <text
                   x={x}
                   y={y}
                   fill="#ffffff" // Texto interior en blanco de alto contraste
                   fontSize={labelStr.length >= 3 ? "8" : "9"}
                   fontWeight="bold"
                   fontFamily="sans-serif"
                   textAnchor="middle"
                   dominantBaseline="central"
                   alignmentBaseline="central"
                >
                   {labelStr}
                </text>
              </g>
            );
          })}

          {/* Note Letters or Fingers at the bottom of the guitar neck */}
          {frets.map((fret, stringIdx) => {
            const x = stringXCoords[stringIdx];
            const y = fretYCoords[fretYCoords.length - 1] + 20;
            
            let label = "";
            let color = fret === -1 || fret === undefined ? "#404040" : "#a3a3a3";

            const isFingerOverride = fingersOverride && fingersOverride[stringIdx] != null;

            if (isFingerOverride && showFingerings) {
               label = fingersOverride[stringIdx]!.toString();
               color = "#EA580B";
            } else if (triadShape) {
               // When there's a triad shape but no override, hide notes for mute strings
               label = fret !== -1 ? getNoteNameForStringFret(stringIdx, fret, root, translateNote) : "";
            } else {
               label = getNoteNameForStringFret(stringIdx, fret, root, translateNote);
            }
            
            return (
              <text
                key={`note-${stringIdx}`}
                x={x}
                y={y}
                fill={color}
                fontSize={isFingerOverride ? "18" : triadShape ? "14" : "11"}
                fontWeight={isFingerOverride ? "900" : "bold"}
                fontFamily={triadShape || isFingerOverride ? "sans-serif" : "monospace"}
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}
        </svg>

        {/* Floating tooltip identifier of string indices */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1 text-[9px] font-mono text-neutral-500">
          <div>{t("common.stringsInfo")}</div>
          <div className="flex gap-1 items-center text-neutral-400">
            <Volume2 size={10} />
            <span>{t("common.clickToHear")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
