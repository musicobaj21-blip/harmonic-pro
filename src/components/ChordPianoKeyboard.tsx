import React, { useState } from 'react';
import { GuitarVoicing, RootNote, ChordTypeOptions } from "../types";
import { CHORD_DEFINITIONS, ROOT_DISPLAY_NAME_MAP } from "../data/chords";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { transposeRoot, buildJazzVoicing } from "../utils/music";
import PremiumPiano from "./PremiumPiano";
import { useInstrument } from "../contexts/InstrumentContext";
import { useLanguage } from "../contexts/LanguageContext";

export type KeyboardVoicingMode = 'fundamental' | 'inv1' | 'inv2' | 'inv3' | 'jazz';

interface ChordPianoKeyboardProps {
  root: RootNote;
  type: ChordTypeOptions | string;
  voicing?: GuitarVoicing;
  title?: string;
  subtitle?: string;
  isPro?: boolean;
  positions?: (number | null | string | undefined)[];
  activeSequenceIndex?: number | null;
  onPlay?: () => void;
  playLabel?: string;
  voicingMode?: KeyboardVoicingMode;
  onVoicingModeChange?: (mode: KeyboardVoicingMode) => void;
  showVoicingSelector?: boolean;
  isExpanded?: boolean;
}

const PIANO_START_MIDI = 48; // C3

const ROOT_OFFSET_MAP: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8,
  Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5, "B#": 0
};

export interface DegreeStep {
  degree: string;
  offset: number;
}

export function getFundamentalDegreeSteps(chordFormula: string): DegreeStep[] {
  const parts = chordFormula.split('-');
  const steps: DegreeStep[] = [];
  const seenOffsets = new Set<number>();

  const addStep = (degree: string, offset: number) => {
    if (!seenOffsets.has(offset)) {
      seenOffsets.add(offset);
      steps.push({ degree, offset });
    }
  };

  parts.forEach((rawPart) => {
    const p = rawPart.trim();
    if (p.includes('(')) {
      // Caso alt: "1-3-b7-(b9/#9/b5/#5)" -> asegurar tónica + guías + alteraciones en orden ascendente
      addStep('1', 0);
      addStep('3', 4);
      addStep('b7', 10);
      addStep('#9', 15);
      addStep('b13', 20);
      return;
    }
    switch (p) {
      case '1': addStep('1', 0); break;
      case 'b2': addStep('b2', 1); break;
      case '2': addStep('2', 2); break;
      case 'b3': addStep('b3', 3); break;
      case '3': addStep('3', 4); break;
      case '4': addStep('4', 5); break;
      case 'b5':
      case '#4': addStep(p, 6); break;
      case '5': addStep('5', 7); break;
      case '#5':
      case 'b6': addStep(p, 8); break;
      case '6':
      case 'bb7': addStep(p, 9); break;
      case 'b7': addStep('b7', 10); break;
      case '7':
      case 'maj7': addStep(p, 11); break;
      case 'b9': addStep('b9', 13); break;
      case '9': addStep('9', 14); break;
      case '#9': addStep('#9', 15); break;
      case '11': addStep('11', 17); break;
      case '#11': addStep('#11', 18); break;
      case 'b13': addStep('b13', 20); break;
      case '13': addStep('13', 21); break;
    }
  });

  // Garantizar que el estado fundamental siempre comience en la Tónica (0) en orden estricto ascendente
  if (!seenOffsets.has(0)) {
    steps.unshift({ degree: '1', offset: 0 });
  }

  return steps.sort((a, b) => a.offset - b.offset);
}

function inferDegreeLabelForPitchClass(
  pcFromRoot: number,
  fundamentalSteps: DegreeStep[],
  typeStr: string
): string {
  const exactMatch = fundamentalSteps.find((s) => ((s.offset % 12) + 12) % 12 === pcFromRoot);
  if (exactMatch) return exactMatch.degree;

  switch (pcFromRoot) {
    case 0: return '1';
    case 1: return 'b9';
    case 2: return '9';
    case 3: return typeStr.includes('#9') || typeStr === 'alt' ? '#9' : 'b3';
    case 4: return '3';
    case 5: return typeStr.includes('sus') ? '4' : '11';
    case 6: return typeStr.includes('#11') ? '#11' : 'b5';
    case 7: return '5';
    case 8: return typeStr === 'aug' ? '#5' : 'b13';
    case 9: return typeStr.includes('dim') ? 'bb7' : typeStr.includes('13') ? '13' : '6';
    case 10: return 'b7';
    case 11: return '7';
    default: return '1';
  }
}

export function resolveKeyboardVoicingData(
  root: RootNote,
  type: ChordTypeOptions | string,
  requestedMode: KeyboardVoicingMode
): {
  effectiveMode: KeyboardVoicingMode;
  subtitle: string;
  degreesDisplay: string;
  notes: { midi: number; degree: string; noteName: string }[];
  noteCount: number;
} {
  const rootOffset = ROOT_OFFSET_MAP[root as string] ?? 0;
  const rootMidi = PIANO_START_MIDI + rootOffset;

  const chordDef = CHORD_DEFINITIONS[type as ChordTypeOptions];
  const formula = chordDef?.chordFormula || "1-3-5";
  const fundamentalSteps = getFundamentalDegreeSteps(formula);
  const noteCount = fundamentalSteps.length;

  const effectiveMode: KeyboardVoicingMode =
    requestedMode === 'inv3' && noteCount < 4 ? 'fundamental' : requestedMode;

  const subtitleMap: Record<KeyboardVoicingMode, string> = {
    fundamental: "Estado Fundamental",
    inv1: "1ª Inversión",
    inv2: "2ª Inversión",
    inv3: "3ª Inversión",
    jazz: "Jazz Voicing",
  };

  if (effectiveMode === 'jazz') {
    const suffixStr = type === "Mayor" ? "" : type === "Menor" ? "m" : String(type);
    const jazzVoicingMidis = buildJazzVoicing(`${root}${suffixStr}`);
    const notes = jazzVoicingMidis.map((midi) => {
      const semitoneFromRoot = (((midi - rootMidi) % 12) + 12) % 12;
      const noteName = transposeRoot(root, semitoneFromRoot, root);
      const degree = inferDegreeLabelForPitchClass(semitoneFromRoot, fundamentalSteps, String(type));
      return { midi, degree, noteName };
    });
    return {
      effectiveMode,
      subtitle: subtitleMap[effectiveMode],
      degreesDisplay: notes.map((n) => n.degree).join(" - "),
      notes,
      noteCount,
    };
  }

  const inversionCount =
    effectiveMode === 'inv1'
      ? 1
      : effectiveMode === 'inv2'
        ? 2
        : effectiveMode === 'inv3'
          ? 3
          : 0;

  const workingNotes = fundamentalSteps.map((step) => {
    const semitoneFromRoot = ((step.offset % 12) + 12) % 12;
    const noteName = transposeRoot(root, semitoneFromRoot, root);
    return {
      midi: rootMidi + step.offset,
      degree: step.degree,
      noteName,
    };
  });

  // Subir las primeras N notas una octava arriba (+12 semitonos) según la inversión
  for (let i = 0; i < inversionCount; i++) {
    if (i < workingNotes.length) {
      workingNotes[i].midi += 12;
    }
  }

  workingNotes.sort((a, b) => a.midi - b.midi);

  return {
    effectiveMode,
    subtitle: subtitleMap[effectiveMode],
    degreesDisplay: workingNotes.map((n) => n.degree).join(" - "),
    notes: workingNotes,
    noteCount,
  };
}

export default function ChordPianoKeyboard({
  root,
  type,
  title,
  subtitle,
  onPlay,
  playLabel,
  voicingMode,
  onVoicingModeChange,
  showVoicingSelector = false,
  isExpanded = false,
}: ChordPianoKeyboardProps) {
  useInstrument();
  const { t, translateNote } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalVoicingMode, setInternalVoicingMode] = useState<KeyboardVoicingMode>('fundamental');

  const isExplicitInversionLesson = Boolean(
    title && (title.includes('1ª Inversión') || title.includes('2ª Inversión') || title.includes('3ª Inversión'))
  );

  const activeMode: KeyboardVoicingMode = isExplicitInversionLesson
    ? title?.includes('1ª Inversión')
      ? 'inv1'
      : title?.includes('2ª Inversión')
        ? 'inv2'
        : 'inv3'
    : (voicingMode ?? internalVoicingMode);

  const handleModeChange = (mode: KeyboardVoicingMode) => {
    if (onVoicingModeChange) {
      onVoicingModeChange(mode);
    } else {
      setInternalVoicingMode(mode);
    }
  };

  const resolved = resolveKeyboardVoicingData(root, type, activeMode);

  const combinedActiveNotes = resolved.notes.map((n) => ({
    midi: n.midi,
    label: translateNote(n.noteName),
  }));

  const chordMidiNotes = combinedActiveNotes.map((n) => n.midi);
  const maxMidi = chordMidiNotes.length > 0 ? Math.max(...chordMidiNotes) : 60;
  // En modo ampliado mostrar siempre 3 octavas completas (37 teclas); en vista compacta 25 o 37 según el registro
  const pianoNumKeys = isExpanded ? 37 : (maxMidi > 72 ? 37 : 25);

  const displaySubtitle = showVoicingSelector ? resolved.subtitle : (subtitle || resolved.subtitle);

  const handlePlayChord = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    dictionaryAudio.getContext();

    try {
      const freqs = chordMidiNotes.map((midi) => 440 * Math.pow(2, (midi - 69) / 12));
      dictionaryAudio.playChord(freqs, 'piano');
    } catch (error) {
      console.error("Audio error:", error);
    }

    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  const handlePlayNote = async (midi: number) => {
    dictionaryAudio.getContext();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    dictionaryAudio.playSingleNote(freq, 'piano');
  };

  const selectorButtons: { id: KeyboardVoicingMode; label: string }[] = [
    { id: 'fundamental', label: 'F' },
    { id: 'inv1', label: '1ª Inv.' },
    { id: 'inv2', label: '2ª Inv.' },
    ...(resolved.noteCount >= 4 ? [{ id: 'inv3' as KeyboardVoicingMode, label: '3ª Inv.' }] : []),
    { id: 'jazz', label: 'Jazz Voicing' },
  ];

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-3.5 shadow-none relative overflow-visible flex flex-col h-auto">
      {/* Encabezado Apilado Verticalmente: 1. Título y Subtítulo al 100%, 2. Botón TOCAR a ancho completo */}
      <div className="flex flex-col gap-2 mb-2.5 w-full overflow-visible">
        <div className="w-full min-w-0 overflow-visible">
          <h3 id="chord-piano-title" className={`${isExpanded ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-neutral-100 tracking-tight flex items-baseline flex-wrap gap-1.5 w-full overflow-visible whitespace-normal break-words`}>
            {title && (title.includes(root) || title.includes("Inversión") || title.includes("Arpegio")) ? (
              <span>{title}</span>
            ) : (
              <>
                <span>{translateNote(ROOT_DISPLAY_NAME_MAP[root] || root)}</span>
                <span className={`${isExpanded ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-mono text-orange-400 font-bold`}>
                  {title ? title : type}
                </span>
              </>
            )}
          </h3>
          {displaySubtitle && (
            <p className="text-xs text-neutral-400 font-mono tracking-wider mt-0.5 w-full overflow-visible whitespace-normal break-words">
              {displaySubtitle}
            </p>
          )}
        </div>

        <button
          onClick={onPlay || handlePlayChord}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all py-2 px-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase shadow-md shadow-orange-500/10 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>{playLabel || (isPlaying ? 'TOCANDO...' : t("chords.playChord"))}</span>
        </button>

        {showVoicingSelector && (
          <div className="flex items-center justify-between gap-1 w-full pt-0.5">
            {selectorButtons.map((btn) => {
              const isActive = resolved.effectiveMode === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleModeChange(btn.id)}
                  className={`flex-1 text-center px-1.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold tracking-tight whitespace-nowrap transition-colors cursor-pointer border ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-500 font-bold"
                      : "bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <PremiumPiano
        activeNotes={combinedActiveNotes}
        playingNotes={isPlaying ? chordMidiNotes : []}
        rootNote={root}
        startMidi={PIANO_START_MIDI}
        numKeys={pianoNumKeys}
        whiteKeyHeight={isExpanded ? "h-40 sm:h-44" : "h-28 sm:h-32"}
        blackKeyHeight={isExpanded ? "h-24 sm:h-28" : "h-18 sm:h-20"}
        isExpanded={isExpanded}
        onPlayNote={handlePlayNote}
      />
    </div>
  );
}
