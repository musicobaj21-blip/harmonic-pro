import React, { useState, useRef, useEffect } from "react";
import { CHORD_DEFINITIONS, ROOT_MIDI_OFFSET_MAP } from "../data/chords";
import { parseChord, getIRealPitchClassIntervals } from "../utils/music";
import { RootNote } from "../types";

export interface ChordNameInputProps {
  chordName?: string;
  initialValue?: string;
  isEditMode?: boolean;
  isPlaying?: boolean;
  isFocused?: boolean;
  sequenceGroupingClass?: string;
  globalKey?: string;
  onSave: (newChordName: string) => void;
  onClick?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

const ROOTS: RootNote[] = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];

const SUFFIX_MAP: Record<string, string> = {
  Mayor: "",
  Menor: "m",
  "6": "6",
  "6(9)": "6(9)",
  maj7: "maj7",
  maj9: "maj9",
  maj13: "maj13",
  "maj7#11": "maj7#11",
  "maj9#11": "maj9#11",
  add9: "add9",
  m6: "m6",
  m7: "m7",
  m9: "m9",
  m11: "m11",
  m13: "m13",
  "m(maj7)": "m(maj7)",
  "m-add9": "m-add9",
  m7b5: "m7b5",
  m9b5: "m9b5",
  m11b5: "m11b5",
  mb13b5: "mb13b5",
  dim: "dim",
  dim7: "dim7",
  dim7_9: "dim7(9)",
  dim7_11: "dim7(11)",
  dim7_b13: "dim7(b13)",
  "7": "7",
  "9": "9",
  "13": "13",
  "7sus4": "7sus4",
  "9sus4": "9sus4",
  "13sus4": "13sus4",
  "7#11": "7#11",
  "7b9": "7b9",
  "7#9": "7#9",
  "7b13": "7b13",
  alt: "alt",
  aug: "aug",
};

const ALL_BASE_CHORDS: string[] = [];
const chordTypeKeys = Array.isArray(CHORD_DEFINITIONS)
  ? CHORD_DEFINITIONS.map((d: any) => d.name || String(d))
  : Object.keys(CHORD_DEFINITIONS);

ROOTS.forEach((root) => {
  chordTypeKeys.forEach((defName) => {
    const suffix = SUFFIX_MAP[defName] ?? defName;
    ALL_BASE_CHORDS.push(`${root}${suffix}`);
  });
});

const PITCH_TO_PREFERRED_NOTE: Record<number, RootNote[]> = {
  0: ["C"],
  1: ["Db", "C#"],
  2: ["D"],
  3: ["Eb", "D#"],
  4: ["E"],
  5: ["F"],
  6: ["F#", "Gb"],
  7: ["G"],
  8: ["Ab", "G#"],
  9: ["A"],
  10: ["Bb", "A#"],
  11: ["B"],
};

export function buildSlashSuggestions(inputStr: string): string[] {
  const trimmed = inputStr.trim();
  const slashIdx = trimmed.lastIndexOf("/");
  if (slashIdx <= 0) return [];

  const chordPart = trimmed.substring(0, slashIdx).trim();
  const bassQuery = trimmed.substring(slashIdx + 1).trim().toLowerCase();

  // Evitar tratar "D6/9" como slash chord si el usuario escribe exactamente "/9"
  if (bassQuery === "9" && chordPart.endsWith("6")) {
    return [`${chordPart}(9)`, `${chordPart}/9`];
  }

  const parsed = parseChord(chordPart);
  const rootPc = ROOT_MIDI_OFFSET_MAP[parsed.root] ?? 0;
  const intervals = getIRealPitchClassIntervals(parsed.type, parsed.suffix);

  // Priorizar las inversiones reales del acorde (3ª, 5ª, 7ª) antes que el resto de bajos cromáticos
  const inversionNotes: RootNote[] = [];
  intervals.forEach((intv) => {
    const pc = (((rootPc + intv) % 12) + 12) % 12;
    if (pc !== rootPc) {
      const candidates = PITCH_TO_PREFERRED_NOTE[pc] || [];
      candidates.forEach((n) => {
        if (!inversionNotes.includes(n)) inversionNotes.push(n);
      });
    }
  });

  const otherBassNotes = ROOTS.filter(
    (r) => r !== parsed.root && !inversionNotes.includes(r)
  );
  const orderedBassNotes = [...inversionNotes, ...otherBassNotes];

  return orderedBassNotes
    .filter((b) => b.toLowerCase().startsWith(bassQuery))
    .map((b) => `${chordPart}/${b}`);
}

export const ChordNameInput: React.FC<ChordNameInputProps> = ({
  chordName,
  initialValue,
  isEditMode = true,
  isPlaying = false,
  isFocused = false,
  onSave,
  onClick,
  onCancel,
  placeholder = "Ej: Cmaj7 o Cmaj7/B",
}) => {
  const resolvedValue = chordName !== undefined ? chordName : initialValue || "";
  const isStandaloneInput = chordName === undefined && initialValue !== undefined;

  const [inputValue, setInputValue] = useState(resolvedValue);
  const [isEditing, setIsEditing] = useState(isStandaloneInput);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(resolvedValue);
  }, [resolvedValue]);

  useEffect(() => {
    if ((isEditing || isStandaloneInput) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, isStandaloneInput]);

  useEffect(() => {
    if (!isEditing && !isStandaloneInput) return;

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (trimmed === "%") {
      setSuggestions(["%"]);
      setIsOpen(true);
      setSelectedIndex(0);
      return;
    }

    // Si el usuario escribe "/" (ej. "Cmaj7/" o "G/B"), sugerir inversiones / bajos
    if (trimmed.includes("/")) {
      const slashMatches = buildSlashSuggestions(trimmed).slice(0, 12);
      setSuggestions(slashMatches);
      setIsOpen(slashMatches.length > 0);
      setSelectedIndex(slashMatches.length > 0 ? 0 : -1);
      return;
    }

    const lowerInput = trimmed.toLowerCase();
    const matched = ALL_BASE_CHORDS.filter((chord) =>
      chord.toLowerCase().startsWith(lowerInput)
    ).slice(0, 10);

    // Añadir también sugerencias rápidas de 1ª y 3ª inversión (con bajo en la 3ª y en la 7ª) al final
    const parsed = parseChord(trimmed);
    const rootPc = ROOT_MIDI_OFFSET_MAP[parsed.root] ?? 0;
    const intervals = getIRealPitchClassIntervals(parsed.type, parsed.suffix);
    const quickInversions: string[] = [];
    intervals.forEach((intv) => {
      if (intv !== 0) {
        const pc = (((rootPc + intv) % 12) + 12) % 12;
        const noteName = PITCH_TO_PREFERRED_NOTE[pc]?.[0];
        if (noteName) {
          quickInversions.push(`${trimmed}/${noteName}`);
        }
      }
    });

    const combined = Array.from(
      new Set([...matched, ...quickInversions.slice(0, 3)])
    ).slice(0, 12);

    setSuggestions(combined);
    setIsOpen(combined.length > 0);
    setSelectedIndex(combined.length > 0 ? 0 : -1);
  }, [inputValue, isEditing, isStandaloneInput]);

  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const normalizeChordBeforeSave = (raw: string): string => {
    const clean = raw.trim();
    if (!clean) return resolvedValue || "C";
    if (clean === "%") return "%";
    return clean;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isOpen && suggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen && suggestions.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        onSave(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        onSave(normalizeChordBeforeSave(inputValue));
      } else if (onCancel) {
        onCancel();
      }
      setIsOpen(false);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setIsEditing(false);
      if (onCancel) onCancel();
    }
  };

  const handleSelectSuggestion = (chord: string) => {
    setInputValue(chord);
    setIsOpen(false);
    setIsEditing(false);
    onSave(chord);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setIsEditing(false);
      if (inputValue.trim() && inputValue.trim() !== resolvedValue) {
        onSave(normalizeChordBeforeSave(inputValue));
      } else if (onCancel) {
        onCancel();
      }
    }, 180);
  };

  if (isStandaloneInput || isEditing || (isEditMode && !resolvedValue)) {
    return (
      <div
        ref={containerRef}
        className="relative w-full max-w-[160px] overflow-visible z-50"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsEditing(true);
          }}
          onFocus={() => setIsEditing(true)}
          onClick={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-center font-bold text-white bg-neutral-800 border-2 border-[#EA580B] rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-xs sm:text-sm font-mono"
        />

        {isOpen && suggestions.length > 0 && (
          <ul
            ref={dropdownRef}
            className="absolute left-1/2 -translate-x-1/2 z-[99999] min-w-[130px] w-max mt-1 max-h-48 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 text-sm"
          >
            {suggestions.map((chord, index) => (
              <li
                key={chord}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectSuggestion(chord);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-3 py-1.5 cursor-pointer transition-colors text-center font-mono font-medium ${
                  index === selectedIndex
                    ? "bg-[#EA580B] text-white font-bold"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {chord}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (onClick) onClick();
        if (isEditMode) {
          setIsEditing(true);
        }
      }}
      className={`w-full py-1 rounded-none border-none text-center font-mono font-bold transition duration-150 cursor-pointer measure-chord-name print:text-black print:bg-transparent print:ring-0 print:scale-100 print:shadow-none print:font-bold ${
        isPlaying
          ? "bg-[#EA580B] text-white z-10 shadow-none font-bold"
          : isFocused
          ? "bg-neutral-800 text-neutral-100 z-10 shadow-none font-bold text-base sm:text-lg"
          : "bg-transparent text-neutral-100 hover:text-white text-base sm:text-lg min-h-[26px]"
      }`}
    >
      {resolvedValue === "%" ? (
        <span className="block text-sm sm:text-base font-bold font-mono select-none leading-none tracking-wide text-center text-neutral-100">
          %
        </span>
      ) : (
        <span className="block truncate tracking-wide text-neutral-100 font-bold">
          {resolvedValue || "..."}
        </span>
      )}
    </button>
  );
};

export default ChordNameInput;

