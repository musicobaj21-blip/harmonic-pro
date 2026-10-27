import { useInstrument } from "../contexts/InstrumentContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { Play, Volume2 } from "lucide-react";
import { RootNote } from "../types";
import { ROOT_MIDI_OFFSET_MAP } from "../data/chords";
import { useLanguage } from "../contexts/LanguageContext";

export interface ScaleFretCoordinate {
  stringIdx: number; // 0 = High e (1ra cuerda), 1 = B, 2 = G, 3 = D, 4 = A, 5 = Low E (6ta cuerda)
  fretIdx: number;
  midi: number;
}

// Genera el camino ergonómico y ascendente de coordenadas { stringIdx, fretIdx } para 1 octava de la escala
function getScaleFretboardCoordinates(
  rootOffset: number,
  scaleOffsets: number[],
  numFrets: number = 15
): ScaleFretCoordinate[] {
  // tuningReversed: index 0 = 64 (High e), 1 = 59 (B), 2 = 55 (G), 3 = 50 (D), 4 = 45 (A), 5 = 40 (Low E)
  const tuningReversed = [64, 59, 55, 50, 45, 40];

  // 1. Encontrar la posición raíz inicial (priorizando Cuerda 5 o 6 en traste cómodo)
  const fretString5 = (rootOffset - 9 + 12) % 12;
  const fretString6 = (rootOffset - 4 + 12) % 12;

  let startStringIdx = 4;
  let startFretIdx = fretString5;

  if (fretString5 <= 5 && fretString5 >= 1) {
    startStringIdx = 4;
    startFretIdx = fretString5;
  } else if (fretString6 <= 5 && fretString6 >= 1) {
    startStringIdx = 5;
    startFretIdx = fretString6;
  } else if (fretString5 <= 8) {
    startStringIdx = 4;
    startFretIdx = fretString5;
  } else {
    startStringIdx = 5;
    startFretIdx = fretString6;
  }

  const baseFret = startFretIdx;
  const minFret = Math.max(0, baseFret - 1);
  const maxFret = Math.min(numFrets - 1, baseFret + 4);

  const startMidi = tuningReversed[startStringIdx] + startFretIdx;

  // 2. Secuencia de notas MIDI en la escala (1 octava completa)
  const targetMidis: number[] = [];
  let currentOctave = Math.floor(startMidi / 12);
  let prevOffset = -1;

  for (let i = 0; i < scaleOffsets.length; i++) {
    const offset = scaleOffsets[i];
    // Lógica de frontera (Si/B a Do/C): si el índice cromático de la nota actual es menor
    // que el de la anterior, cruzamos la frontera de octava y sumamos +1 a la octava actual
    if (i > 0 && offset < prevOffset) {
      currentOctave++;
    }
    const midi = currentOctave * 12 + offset;
    targetMidis.push(midi);
    prevOffset = offset;
  }

  // Tónica de la siguiente octava (exactamente 1 octava completa = +12 semitonos sobre startMidi)
  targetMidis.push(startMidi + 12);

  // 3. Mapear cada nota a la coordenada { stringIdx, fretIdx } ascendente óptima
  const coords: ScaleFretCoordinate[] = [];
  let lastStringIdx = startStringIdx;
  let lastFretIdx = startFretIdx;

  for (let i = 0; i < targetMidis.length; i++) {
    const midi = targetMidis[i];
    if (i === 0) {
      coords.push({ stringIdx: startStringIdx, fretIdx: startFretIdx, midi });
      continue;
    }

    const candidates: { stringIdx: number; fretIdx: number; score: number }[] = [];
    for (let s = 0; s < 6; s++) {
      const f = midi - tuningReversed[s];
      if (f >= 1 && f <= numFrets) {
        let score = 0;
        if (f >= minFret && f <= maxFret) {
          score += 100;
        } else {
          score -= Math.abs(f - baseFret) * 15;
        }

        // Favorecer avanzar en la misma cuerda o pasar a la cuerda inmediatamente más aguda
        if (s === lastStringIdx && f > lastFretIdx) {
          score += 60;
        } else if (s === lastStringIdx - 1) {
          score += 55;
        } else if (s < lastStringIdx) {
          score += 30 - (lastStringIdx - s) * 10;
        } else {
          score -= 100;
        }

        // Penalizar estiramiento lejos de baseFret
        score -= Math.abs(f - baseFret) * 15;

        candidates.push({ stringIdx: s, fretIdx: f, score });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      coords.push({ stringIdx: best.stringIdx, fretIdx: best.fretIdx, midi });
      lastStringIdx = best.stringIdx;
      lastFretIdx = best.fretIdx;
    } else {
      for (let s = 0; s < 6; s++) {
        const f = midi - tuningReversed[s];
        if (f >= 1 && f <= numFrets) {
          coords.push({ stringIdx: s, fretIdx: f, midi });
          lastStringIdx = s;
          lastFretIdx = f;
          break;
        }
      }
    }
  }

  return coords;
}

interface ScaleFretboardProps {
  scaleName: string;
  notes: string[];
  root: RootNote;
  isArpeggio?: boolean;
  intervals?: number[];
  isolatedShape?: {
    stringIdx: number;
    fretIdx: number;
    label: string;
    isRoot?: boolean;
  }[];
  autoPlayTrigger?: number;
  onPlay?: () => void;
  playLabel?: string;
  chordString?: string;
  playingNote?: number | string | null;
  activeNote?: number | string | null;
  activeStepIndex?: number | null;
  playingIndex?: number | null;
  playingNotes?: number[];
  isExpanded?: boolean;
}

// Convert MIDI number to note name
function getNoteNameForMidi(midi: number): string {
  const scale = [
    "C",
    "C#",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  return scale[midi % 12];
}

// Convert MIDI number to note name with scientific octave (e.g. 48 -> "C3", 60 -> "C4")
function getNoteNameWithOctave(midi: number): string {
  const noteName = getNoteNameForMidi(midi);
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

// Parse note with octave string to MIDI (e.g. "C3" -> 48, "C4" -> 60)
function parseNoteToMidi(noteStr: string): number | null {
  const match = noteStr.trim().match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return null;
  const name = match[1];
  const oct = parseInt(match[2], 10);
  const semitones: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };
  const offset = semitones[name];
  if (offset === undefined) return null;
  return (oct + 1) * 12 + offset;
}

// Standard tuning: [Low E, A, D, G, B, High e]
const tuningNotes = [40, 45, 50, 55, 59, 64];

export default function ScaleFretboard({
  scaleName,
  notes,
  root,
  isArpeggio,
  intervals,
  isolatedShape,
  autoPlayTrigger,
  onPlay,
  playLabel,
  chordString,
  playingNote,
  activeNote,
  activeStepIndex,
  playingIndex,
  playingNotes,
  isExpanded = false,
}: ScaleFretboardProps) {
  const { instrument } = useInstrument();
  const { t, translateNote } = useLanguage();
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCoordinate, setActiveCoordinate] = useState<{ stringIdx: number; fretIdx: number } | null>(null);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number | null>(null);
  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);
  const [activeMidiNote, setActiveMidiNote] = useState<number | null>(null);
  const [activeNoteWithOctave, setActiveNoteWithOctave] = useState<string | null>(null);

  const stopPlayback = () => {
    isPlayingRef.current = false;
    setActiveCoordinate(null);
    setActiveSequenceIndex(null);
    setActiveScaleIndex(null);
    setActiveMidiNote(null);
    setActiveNoteWithOctave(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    stopPlayback();
  }, [scaleName, root]);

  // Normalize note arrays for comparison (remove flat/sharp differences mathematically)
  // But since both use our music utils, we can just compare the midi offset
  const getNoteOffset = (note: string) => {
    // Basic mapping for scale notes
    const map: Record<string, number> = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
    };
    return map[note] !== undefined ? map[note] : -1;
  };

  const scaleOffsets = notes.map(getNoteOffset);
  const rootOffset = getNoteOffset(root);

  // 15 frets (0 to 14) with generous vertical & horizontal spacing so note circles never overlap
  const numFrets = 15;
  const stringSpacing = isExpanded ? 44 : 36;
  const fretSpacing = isExpanded ? 54 : 46;

  const width = numFrets * fretSpacing + 36;
  const height = 5 * stringSpacing + 64;

  // Arreglo de coordenadas exactas para la escala en orden ascendente
  const scaleCoordinates = useMemo(() => {
    return getScaleFretboardCoordinates(rootOffset, scaleOffsets, numFrets);
  }, [rootOffset, scaleOffsets, numFrets]);

  // Secuenciador sincronizado basado en coordenadas exactas de cuerda y traste
  const playScale = async () => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    dictionaryAudio.getContext();

    const coordinates = isolatedShape && isolatedShape.length > 0
      ? isolatedShape.map(p => ({
          stringIdx: p.stringIdx,
          fretIdx: p.fretIdx,
          midi: tuningNotes.slice().reverse()[p.stringIdx] + p.fretIdx,
        }))
      : scaleCoordinates;

    for (let i = 0; i < coordinates.length; i++) {
      if (!isPlayingRef.current) break;
      const coord = coordinates[i];

      // Apagado inmediato de la posición anterior y encendido exclusivo de las coordenadas actuales
      setActiveCoordinate({ stringIdx: coord.stringIdx, fretIdx: coord.fretIdx });
      setActiveSequenceIndex(i);
      setActiveScaleIndex(i);
      setActiveMidiNote(coord.midi);
      setActiveNoteWithOctave(getNoteNameWithOctave(coord.midi));

      const freq = 440 * Math.pow(2, (coord.midi - 69) / 12);
      dictionaryAudio.playSingleNote(freq, "guitar");
      await new Promise((r) => setTimeout(r, 400));
    }

    // Apagado inmediato de todas las luces al finalizar
    stopPlayback();
  };

  useEffect(() => {
    if (autoPlayTrigger) {
      setTimeout(playScale, 100);
    }
  }, [autoPlayTrigger]);

  const handlePlayStringFret = async (midi: number) => {
    dictionaryAudio.getContext();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'guitar');
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

  // Coordenada efectiva activa (del secuenciador interno o de props externas)
  const effectiveCoordinate = activeCoordinate ?? (
    (playingIndex !== null && playingIndex !== undefined && scaleCoordinates[playingIndex])
      ? { stringIdx: scaleCoordinates[playingIndex].stringIdx, fretIdx: scaleCoordinates[playingIndex].fretIdx }
      : (activeStepIndex !== null && activeStepIndex !== undefined && scaleCoordinates[activeStepIndex])
        ? { stringIdx: scaleCoordinates[activeStepIndex].stringIdx, fretIdx: scaleCoordinates[activeStepIndex].fretIdx }
        : null
  );

  // Comparación Estricta de Nota Activa (Coordenada física exacta o Nota + Octava estricta):
  // Asegura que SOLO se encienda un único punto en todo el diapasón por cada paso de la secuencia.
  const isNoteActive = (scaleIndex: number, noteOffset: number, noteMidi: number, stringIdx: number, fretIdx: number) => {
    // 1. Si hay coordenadas físicas activas (del secuenciador playScale o de playingIndex), la comprobación es 100% estricta por cuerda y traste:
    if (effectiveCoordinate !== null) {
      return effectiveCoordinate.stringIdx === stringIdx && effectiveCoordinate.fretIdx === fretIdx;
    }

    // 2. Si hay un índice de secuencia/escala activo, resolver su coordenada física única en la escala:
    const effectiveIndex = activeSequenceIndex ?? activeScaleIndex ?? playingIndex ?? activeStepIndex;
    if (effectiveIndex !== null && effectiveIndex !== undefined) {
      const targetCoord = isolatedShape ? isolatedShape[effectiveIndex] : scaleCoordinates[effectiveIndex];
      if (targetCoord) {
        return targetCoord.stringIdx === stringIdx && targetCoord.fretIdx === fretIdx;
      }
    }

    // 3. Si se recibe un activeNote o playingNote externo (ej. emitido por Tone.js como "C3" o MIDI exacto):
    const externalActive = playingNote ?? activeNote;
    if (externalActive !== null && externalActive !== undefined) {
      if (typeof externalActive === "number") {
        if (noteMidi !== externalActive) return false;
        const found = scaleCoordinates.find(c => c.midi === externalActive);
        if (found) {
          return found.stringIdx === stringIdx && found.fretIdx === fretIdx;
        }
        return true;
      }

      if (typeof externalActive === "string") {
        const parsedMidi = parseNoteToMidi(externalActive);
        const stdNoteWithOctave = getNoteNameWithOctave(noteMidi);

        if (parsedMidi !== null) {
          if (noteMidi !== parsedMidi) return false;
          const found = scaleCoordinates.find(c => c.midi === parsedMidi);
          if (found) {
            return found.stringIdx === stringIdx && found.fretIdx === fretIdx;
          }
          return true;
        }

        // Comparación estricta NOTA + OCTAVA (ej. "C3" === "C3")
        if (externalActive.match(/[0-9]$/)) {
          if (stdNoteWithOctave.toLowerCase() !== externalActive.trim().toLowerCase()) {
            return false;
          }
          const found = scaleCoordinates.find(c => getNoteNameWithOctave(c.midi).toLowerCase() === externalActive.trim().toLowerCase());
          if (found) {
            return found.stringIdx === stringIdx && found.fretIdx === fretIdx;
          }
          return true;
        }

        return false;
      }
    }

    // 4. Props externas de arreglo de notas activas
    if (playingNotes && playingNotes.length > 0) {
      return playingNotes.includes(noteMidi);
    }

    return false;
  };

  const isIsolatedPointActive = (pointIdx: number, pointMidi: number, pointOffset: number) => {
    if (effectiveCoordinate !== null && isolatedShape && isolatedShape[pointIdx]) {
      const p = isolatedShape[pointIdx];
      return effectiveCoordinate.stringIdx === p.stringIdx && effectiveCoordinate.fretIdx === p.fretIdx;
    }
    const effectiveIndex = activeSequenceIndex ?? activeScaleIndex ?? playingIndex ?? activeStepIndex;
    if (effectiveIndex !== null && effectiveIndex !== undefined) {
      return pointIdx === effectiveIndex;
    }
    const p = isolatedShape?.[pointIdx];
    if (p) {
      return isNoteActive(pointIdx, pointOffset, pointMidi, p.stringIdx, p.fretIdx);
    }
    return false;
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-none relative overflow-visible flex flex-col mt-1">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botón TOCAR a ancho completo */}
      <div className="flex flex-col gap-2.5 mb-3.5 w-full overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 className={`${isExpanded ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            {isolatedShape && !scaleName ? (
              notes.map(translateNote).join(" y ")
            ) : (
              <>
                <span className="text-orange-400 font-extrabold">{translateNote(effectiveRoot)}</span>{" "}
                <span className={`${isExpanded ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-mono text-neutral-200`}>{modeName}</span>
              </>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">
             {isolatedShape ? t('academy.isolatedInterval') : t('academy.fretboardSequence')}
          </p>
        </div>
        
        <button 
          onClick={onPlay || playScale}
          disabled={isPlaying}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-md shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>{playLabel || (isPlaying ? t("academy.playing") : (isArpeggio ? t("academy.playArpeggio") : t("academy.playScale")))}</span>
        </button>
      </div>

      {/* Diagrama Diapasón (Horizontal) */}
      <div className="w-full overflow-x-auto pb-1 mt-1 custom-scrollbar">
        <div className={`w-full h-auto ${isExpanded ? 'min-w-[780px] min-h-[320px] sm:min-h-[350px] p-4' : 'min-w-[660px] min-h-[250px] sm:min-h-[270px] p-3.5'} relative bg-neutral-950/70 rounded-xl flex justify-center items-center border border-neutral-800`}>
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="select-none w-full h-auto"
          >
            {/* Draw Frets (Vertical lines) */}
            {Array.from({ length: numFrets + 1 }).map((_, i) => (
              <line
                key={`fret-${i}`}
                x1={i * fretSpacing + 20}
                y1={16}
                x2={i * fretSpacing + 20}
                y2={height - 24}
                stroke={i === 0 ? "#EA580B" : "#404040"}
                strokeWidth={i === 0 ? 3.5 : 1.5}
              />
            ))}

            {/* Fret Numbers (3, 5, 7, 9, 12, 15) Centered in fret space */}
            {[3, 5, 7, 9, 12, 15].map((fretNum) => (
              <text
                key={`fret-num-${fretNum}`}
                x={fretNum * fretSpacing + 20 - fretSpacing / 2}
                y={height - 4}
                fill="#737373"
                fontSize={isExpanded ? "12" : "10.5"}
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {fretNum}
              </text>
            ))}

            {/* Draw Strings (Horizontal lines) */}
            {tuningNotes
              .slice()
              .reverse()
              .map((_, i) => {
                // i=0 is High E, i=5 is Low E
                const y = i * stringSpacing + 16;
                const stringThickness = 1 + i * 0.35;
                return (
                  <line
                    key={`string-${i}`}
                    x1={20}
                    y1={y}
                    x2={width - 10}
                    y2={y}
                    stroke="#525252"
                    strokeWidth={stringThickness}
                  />
                );
              })}

            {/* Draw Notes */}
            {isolatedShape
              ? isolatedShape.map((point, i) => {
                  // Omitir cuerdas al aire (traste 0)
                  if (point.fretIdx === 0) return null;

                  const x =
                    point.fretIdx * fretSpacing +
                    (point.fretIdx === 0 ? 10 : 20 - fretSpacing / 2);
                  const y = point.stringIdx * stringSpacing + 16;
                  const pointMidi =
                    tuningNotes.slice().reverse()[point.stringIdx] + point.fretIdx;
                  const isPlayingThisNote = isIsolatedPointActive(i, pointMidi, pointMidi % 12);
                  const isRoot = !!point.isRoot;

                  return (
                    <g
                      key={`iso-${i}`}
                      className={`cursor-pointer origin-center ${
                        isPlayingThisNote
                          ? "scale-110 z-10 transition-transform duration-75"
                          : "hover:scale-110 transition-transform duration-150"
                      }`}
                      onClick={() => handlePlayStringFret(pointMidi)}
                      style={{ transformOrigin: `${x}px ${y}px` }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isPlayingThisNote ? (isExpanded ? "13" : "11.5") : (isRoot ? (isExpanded ? "12.5" : "11") : (isExpanded ? "11.5" : "10"))}
                        fill={isPlayingThisNote ? "#ffffff" : (isRoot ? "#EA580B" : "#404040")}
                        className={`transition-all ${
                          isPlayingThisNote
                            ? "fill-white bg-white duration-75"
                            : isRoot
                              ? "fill-orange-500 bg-orange-500 duration-150"
                              : "fill-neutral-700 bg-neutral-700 duration-150"
                        }`}
                      />
                      <text
                        x={x}
                        y={y + 3.5}
                        fill={isPlayingThisNote ? "#171717" : (isRoot ? "#ffffff" : "#d4d4d4")}
                        fontSize={isPlayingThisNote ? (isExpanded ? "12" : "10.5") : (isExpanded ? "11" : "10")}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        className={`select-none font-bold ${
                          isPlayingThisNote
                            ? "fill-neutral-900 text-neutral-900"
                            : isRoot
                              ? "fill-white text-white"
                              : "fill-neutral-300 text-neutral-300"
                        }`}
                      >
                        {point.label}
                      </text>
                    </g>
                  );
                })
              : tuningNotes
                  .slice()
                  .reverse()
                  .map((baseMidi, stringIdx) => {
                    // stringIdx 0 = High e... 5 = Low E
                    return Array.from({ length: numFrets + 1 }).map(
                      (_, fretIdx) => {
                        // Omitir traste 0 (cuerdas al aire / cejuela) para mostrar marcadores únicamente desde el traste 1 en adelante
                        if (fretIdx === 0) return null;

                        const midi = baseMidi + fretIdx;
                        const offset = midi % 12;

                        if (scaleOffsets.includes(offset)) {
                          const isRoot = offset === rootOffset;
                          const x =
                            fretIdx * fretSpacing +
                            (fretIdx === 0 ? 10 : 20 - fretSpacing / 2);
                          const y = stringIdx * stringSpacing + 16;

                          const scaleIndex = scaleOffsets.indexOf(offset);
                          const noteName = notes[scaleIndex];
                          let label = translateNote(noteName);

                          if (isArpeggio && intervals) {
                            const intervalValue = intervals[scaleOffsets.indexOf(offset)];
                            if (intervalValue === 0) label = "1";
                            if (intervalValue === 3) label = "b3";
                            if (intervalValue === 4) label = "3";
                            if (intervalValue === 6) label = "b5";
                            if (intervalValue === 7) label = "5";
                            if (intervalValue === 9) label = "bb7";
                            if (intervalValue === 10) label = "b7";
                            if (intervalValue === 11) label = "7";
                          }

                          // Comprobación de estado activo en tiempo real: exactamente un único punto activo por paso
                          const isPlayingThisNote = isNoteActive(scaleIndex, offset, midi, stringIdx, fretIdx);

                          return (
                            <g
                              key={`note-${stringIdx}-${fretIdx}`}
                              className={`cursor-pointer origin-center ${
                                isPlayingThisNote
                                  ? "scale-110 z-10 transition-transform duration-75"
                                  : "hover:scale-110 transition-transform duration-150"
                              }`}
                              onClick={() => handlePlayStringFret(midi)}
                              style={{ transformOrigin: `${x}px ${y}px` }}
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isPlayingThisNote ? (isExpanded ? "13" : "11.5") : (isRoot ? (isExpanded ? "12.5" : "11") : (isExpanded ? "11.5" : "10"))}
                                fill={
                                  isPlayingThisNote
                                    ? "#ffffff"
                                    : isRoot
                                      ? "#EA580B"
                                      : "#404040"
                                }
                                className={`transition-all ${
                                  isPlayingThisNote
                                    ? "fill-white bg-white duration-75"
                                    : isRoot
                                      ? "fill-orange-500 bg-orange-500 duration-150"
                                      : "fill-neutral-700 bg-neutral-700 duration-150"
                                }`}
                              />
                              <text
                                x={x}
                                y={y + 3.5}
                                fill={
                                  isPlayingThisNote
                                    ? "#171717"
                                    : isRoot
                                      ? "#ffffff"
                                      : "#d4d4d4"
                                }
                                fontSize={isPlayingThisNote ? (isExpanded ? "12" : "10.5") : (isExpanded ? "11" : "10")}
                                fontWeight="bold"
                                fontFamily="sans-serif"
                                textAnchor="middle"
                                className={`select-none font-bold ${
                                  isPlayingThisNote
                                    ? "fill-neutral-900 text-neutral-900"
                                    : isRoot
                                      ? "fill-white text-white"
                                      : "fill-neutral-300 text-neutral-300"
                                }`}
                              >
                                {label}
                              </text>
                            </g>
                          );
                        }
                        return null;
                      },
                    );
                  })}
          </svg>
        </div>
        <div className="flex justify-end text-[10px] text-neutral-400 mt-2 font-mono flex items-center gap-1">
          <Volume2 size={12} />
          <span>{t("common.clickToHear")}</span>
        </div>
      </div>
    </div>
  );
}
