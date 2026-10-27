import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { RootNote, ChordTypeOptions } from "../types";
import {
  CHORD_DEFINITIONS,
  ROOT_DISPLAY_NAME_MAP,
  getGuitarChordVoicings,
  getGuitarChordFrequencies,
  CHORD_GROUPS,
} from "../data/chords";
import ChordFretboard from "./ChordFretboard";
import ChordPianoKeyboard, {
  KeyboardVoicingMode,
  resolveKeyboardVoicingData,
} from "./ChordPianoKeyboard";
import { useInstrument } from "../contexts/InstrumentContext";
import {
  Search,
  Music,
  HelpCircle,
  GraduationCap,
  ToggleLeft,
  ToggleRight,
  Layers,
} from "lucide-react";
import { dictionaryAudio } from "../utils/dictionaryAudio";
import { useLanguage } from "../contexts/LanguageContext";

interface ChordDictionaryProps {
  defaultRoot?: RootNote;
  defaultType?: ChordTypeOptions;
  hideControls?: boolean;
  hideTitle?: boolean;
  forceBaseFret?: number;
  onPlay?: () => void;
  playLabel?: string;
  voicingMode?: KeyboardVoicingMode;
  onVoicingModeChange?: (mode: KeyboardVoicingMode) => void;
  isExpanded?: boolean;
}

export default function ChordDictionary({
  defaultRoot = "C",
  defaultType = "maj7",
  hideControls = false,
  hideTitle = false,
  forceBaseFret,
  onPlay,
  playLabel,
  voicingMode,
  onVoicingModeChange,
  isExpanded = false,
}: ChordDictionaryProps = {}) {
  const { instrument } = useInstrument();
  const { t } = useLanguage();
  const [selectedRoot, setSelectedRoot] = useState<RootNote>(defaultRoot);
  const [selectedType, setSelectedType] = useState<ChordTypeOptions>(defaultType);
  const [positionIndex, setPositionIndex] = useState(0);
  const [keyboardVoicingMode, setKeyboardVoicingMode] = useState<KeyboardVoicingMode>('fundamental');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("SÉPTIMAS"); // Will be translated in UI render, keeping state key same for simplicity

  useEffect(() => {
    setSelectedRoot(defaultRoot);
    setSelectedType(defaultType);
  }, [defaultRoot, defaultType]);

  // Roots list
  const roots: RootNote[] = [
    "C",
    "Db",
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

  const chordTypes: ChordTypeOptions[] = [
    "Mayor",
    "Menor",
    "maj7",
    "m7",
    "7",
    "m7b5",
    "dim7",
    "9",
    "13",
    "alt",
    "aug",
  ];

  // Resolve voicings whenever root or type changes (memoizado para no recalcular en navegación)
  const activeVoicings = useMemo(() => {
    return getGuitarChordVoicings(selectedRoot, selectedType, false);
  }, [selectedRoot, selectedType]);

  // Safe position check
  const actualIndex = positionIndex % Math.max(activeVoicings.length, 1);
  const activeVoicing = activeVoicings[actualIndex];
  const activeDef = useMemo(() => {
    return CHORD_DEFINITIONS[selectedType] || CHORD_DEFINITIONS["Mayor"];
  }, [selectedType]);

  const effectiveKeyboardMode = voicingMode ?? keyboardVoicingMode;
  const handleKeyboardModeChange = onVoicingModeChange ?? setKeyboardVoicingMode;

  const resolvedKeyboardData = useMemo(() => {
    return resolveKeyboardVoicingData(selectedRoot, selectedType, effectiveKeyboardMode);
  }, [selectedRoot, selectedType, effectiveKeyboardMode]);

  useEffect(() => {
    if (effectiveKeyboardMode === 'inv3' && resolvedKeyboardData.noteCount < 4) {
      handleKeyboardModeChange('fundamental');
    }
  }, [effectiveKeyboardMode, resolvedKeyboardData.noteCount]);

  // Reset position index to 0 when type changes
  useEffect(() => {
    setPositionIndex(0);
  }, [selectedType, selectedRoot]);

  const handleQuickPlay = () => {
    if (instrument === 'piano') {
      const freqs = resolvedKeyboardData.notes.map((n) => 440 * Math.pow(2, (n.midi - 69) / 12));
      dictionaryAudio.playChord(freqs, 'piano');
      return;
    }
    if (!activeVoicing) return;
    const freqs = getGuitarChordFrequencies(activeVoicing.frets);
    dictionaryAudio.playChord(freqs, 'guitar');
  };

  return (
    <div
      id="chord-dictionary-container"
      className={`flex ${hideControls ? 'flex-col items-center justify-center' : 'flex-col lg:flex-row items-start'} gap-8 w-full`}
    >
      {/* Left panel: Filters (Roots & Types Grid) */}
      {!hideControls && (
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        {/* Step 1: Note Root Selector Grid */}
        <div
          id="root-filter-panel"
          className="bg-neutral-900 p-6 rounded-xl border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-orange-400">
              <Music size={14} />
            </div>
            <h4 className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-bold">
              {t("chords.rootNote")}
            </h4>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {roots.map((root) => {
              const isSelected = selectedRoot === root;
              return (
                <button
                  key={`root-btn-${root}`}
                  id={`root-btn-${root}`}
                  onClick={() => setSelectedRoot(root)}
                  className={`h-10 border rounded-lg text-sm font-mono font-semibold tabular-nums transition-colors cursor-pointer shadow-none ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white font-bold"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-200 hover:text-white"
                  }`}
                >
                  {ROOT_DISPLAY_NAME_MAP[root]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Chord Type Selector Categories */}
        <div
          id="chord-type-panel"
          className="bg-neutral-900 p-6 rounded-xl border border-neutral-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-orange-400">
                <GraduationCap size={16} />
              </div>
              <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-sans font-bold">
                {t("chords.chordType")}
              </h4>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={t("chords.searchType")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-neutral-800 border border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            {!searchQuery && (
              <div className="flex space-x-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
                {CHORD_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveCategory(group.label)}
                    className={`whitespace-nowrap px-3.5 py-1.5 text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-none ${
                      activeCategory === group.label
                        ? "text-orange-400 border-b-2 border-orange-500"
                        : "text-neutral-400 hover:text-neutral-200 border-b-2 border-transparent"
                    }`}
                  >
                    {t(`chords.${group.id}`)}
                  </button>
                ))}
              </div>
            )}

            {CHORD_GROUPS.map((group) => {
              if (!searchQuery && group.label !== activeCategory) return null;

              const filteredOptions = group.options.filter((type) => {
                if (!searchQuery) return true;
                const def = CHORD_DEFINITIONS[type];
                const searchLower = searchQuery.toLowerCase();
                return (
                  type.toLowerCase().includes(searchLower) ||
                  def.symbol.toLowerCase().includes(searchLower) ||
                  def.suffix.toLowerCase().includes(searchLower)
                );
              });

              if (filteredOptions.length === 0) return null;

              return (
                <div key={group.label} className="mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredOptions.map((type) => {
                      const def = CHORD_DEFINITIONS[type];
                      const isSelected = selectedType === type;
                      return (
                        <div
                          key={`opt-${type}`}
                          onClick={() => {
                            setSelectedType(type);
                          }}
                          className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-center transition-colors shadow-none ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-200"
                          }`}
                        >
                          <div
                            className={`text-base font-bold ${
                              isSelected ? "text-white" : "text-neutral-200"
                            }`}
                          >
                            {ROOT_DISPLAY_NAME_MAP[selectedRoot]}{" "}
                            {def.symbol !== "Maj" && def.symbol !== "m"
                              ? def.symbol
                              : def.symbol === "m"
                                ? "m"
                                : "Mayor"}
                          </div>
                          <div className={`text-xs mt-1 ${isSelected ? "text-orange-100" : "text-neutral-400"}`}>
                            Símbolo: {def.symbol}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {searchQuery &&
              !CHORD_GROUPS.some((g) =>
                g.options.some(
                  (t) =>
                    CHORD_DEFINITIONS[t].symbol
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    CHORD_DEFINITIONS[t].suffix
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    t.toLowerCase().includes(searchQuery.toLowerCase()),
                ),
              ) && (
                <div className="p-4 text-center text-sm text-neutral-400 font-mono">
                  No se encontraron acordes con "{searchQuery}"
                </div>
              )}
          </div>
        </div>
      </div>
      )}

      {/* Right panel: SVG Guitar Fretboard & Play Trigger */}
      <div className={`w-full ${hideControls ? 'w-full' : 'lg:w-1/3'} flex justify-center self-start h-auto`}>
        <div className="w-full flex flex-col items-center h-auto">
          {activeVoicing ? (
            <div className={`flex flex-col items-center w-full ${hideControls ? 'max-w-none' : 'max-w-md lg:max-w-none'} h-auto`}>
              {instrument === 'piano' ? (
                <ChordPianoKeyboard
                  root={selectedRoot}
                  type={selectedType}
                  voicing={activeVoicing}
                  title={hideTitle ? undefined : (activeDef.symbol === "Maj" ? "" : activeDef.symbol)}
                  subtitle={resolvedKeyboardData.subtitle}
                  isPro={false}
                  voicingMode={effectiveKeyboardMode}
                  onVoicingModeChange={handleKeyboardModeChange}
                  showVoicingSelector={true}
                  isExpanded={isExpanded}
                />
              ) : (
                <ChordFretboard
                  root={selectedRoot}
                  type={selectedType}
                  voicing={activeVoicing}
                  title={hideTitle ? undefined : (activeDef.symbol === "Maj" ? "" : activeDef.symbol)}
                  subtitle={
                    activeVoicing.label
                      ? activeVoicing.label
                      : `${t("chords.position")} ${actualIndex + 1} (${t("chords.rootOn")} ${activeVoicing.bassString}${t("chords.string")})`
                  }
                  isPro={false}
                  forceBaseFret={forceBaseFret}
                  isExpanded={isExpanded}
                />
              )}

              {/* Position Text Block */}
              {activeVoicings.length > 1 && instrument === 'guitar' && (
                <div
                  id="voicing-positions-selector"
                  className="w-full mt-2.5 space-y-1.5"
                >
                  <h4 className="text-[11px] text-neutral-400 tracking-wider uppercase font-bold md:text-left">
                    {t("chords.voicing")}
                  </h4>
                  <div className={`grid ${isExpanded ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'} gap-1.5`}>
                    {activeVoicings.map((v, idx) => {
                      const isActive = idx === actualIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setPositionIndex(idx)}
                          className={`py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer text-center shadow-none ${
                            isActive
                              ? "bg-orange-500 text-white border-orange-500 font-bold"
                              : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-200"
                          }`}
                        >
                          <span
                            className="text-xs font-bold uppercase tracking-wider"
                          >
                            {t("chords.position")} {idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Music Theory Card */}
              <div id="theory-info-card" className="w-full mt-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neutral-900 border border-neutral-800 py-2 px-3 rounded-lg flex flex-col gap-0.5 min-w-0">
                    <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-mono leading-tight">
                      {t("chords.classification")}
                    </span>
                    <span className="text-neutral-200 font-sans text-xs sm:text-sm font-semibold leading-snug break-words">
                      {activeDef.suffix}
                    </span>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 py-2 px-3 rounded-lg flex flex-col gap-0.5 min-w-0">
                    <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-mono leading-tight">
                      {t("chords.degrees")}
                    </span>
                    <span className="text-neutral-200 font-sans text-xs sm:text-sm font-semibold leading-snug break-words">
                      {instrument === 'piano'
                        ? resolvedKeyboardData.degreesDisplay
                        : activeDef.chordFormula.split("-").join(" - ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-neutral-800 rounded-xl bg-neutral-900 text-neutral-400 text-sm w-full font-mono max-w-md lg:max-w-none">
              Voicing en construcción. Utiliza el Modo Edición para añadir tu
              posición.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
