import { useState, useEffect, useMemo, Fragment } from "react";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { RootNote } from "../types";
import { transposeRoot } from "../utils/music";
import { CHROMATIC_SCALE } from "../data/chords";
import { EXPLORER_CATEGORIES, ScaleDefinition } from "../data/scales";
import ScaleFretboard from "./ScaleFretboard";
import ScalePianoKeyboard from "./ScalePianoKeyboard";
import { useInstrument } from "../contexts/InstrumentContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function ScaleDictionary() {
  const { instrument } = useInstrument();
  const { t } = useLanguage();
  const [explorerRoot, setExplorerRoot] = useState<RootNote>("C");
  const [explorerCategoryIdx, setExplorerCategoryIdx] = useState<number>(0);
  const [explorerScaleIdx, setExplorerScaleIdx] = useState<number>(0);
  const [activePlayingNote, setActivePlayingNote] = useState<number | string | null>(null);
  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);

  useEffect(() => {
    setActivePlayingNote(null);
    setActiveScaleIndex(null);
  }, [explorerRoot, explorerCategoryIdx, explorerScaleIdx]);

  const selectedCategory = EXPLORER_CATEGORIES[explorerCategoryIdx];
  const selectedScale = selectedCategory.scales[explorerScaleIdx];
  const calculatedNotes = useMemo(() => {
    return selectedScale.intervals.map(interval => transposeRoot(explorerRoot, interval, explorerRoot));
  }, [selectedScale, explorerRoot]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 flex flex-col min-h-[500px]">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-neutral-100 mb-1 flex items-center justify-center gap-2">
            <Search className="text-orange-400" size={22} />
            {t("scales.title")}
          </h2>
          <p className="text-neutral-400 text-sm">{t("scales.subtitle")}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Controls Column */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800">
              <label className="block text-xs text-neutral-400 uppercase tracking-wider font-bold mb-3">{t("scales.rootNote")}</label>
              <div className="grid grid-cols-4 gap-2 w-full">
                {CHROMATIC_SCALE.map(rt => (
                  <button
                    key={rt}
                    onClick={() => setExplorerRoot(rt)}
                    className={`py-2.5 px-2 rounded-lg text-sm font-mono font-semibold tabular-nums transition-colors cursor-pointer shadow-none ${
                      explorerRoot === rt 
                        ? "bg-orange-500 text-white border border-orange-500 font-bold" 
                        : "bg-neutral-900 text-neutral-200 border border-neutral-800 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 p-5 rounded-lg border border-neutral-800 flex-1">
              <label className="block text-xs text-neutral-400 uppercase tracking-wider font-bold mb-3">{t("scales.scaleToExplore")}</label>
              <div className="flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {EXPLORER_CATEGORIES.map((category, catIdx) => (
                  <Fragment key={category.category}>
                    <div className="sticky top-0 bg-neutral-950 text-neutral-400 font-bold text-xs uppercase tracking-wider py-2 px-1 mt-4 mb-2 z-10 first:mt-0 border-b border-neutral-800">
                      {t(`scaleData.${category.category}`)}
                    </div>
                    <div className="flex flex-col gap-1.5 pl-2 mb-2">
                      {category.scales.map((scale, i) => (
                        <button
                          key={scale.name}
                          onClick={() => {
                            setExplorerCategoryIdx(catIdx);
                            setExplorerScaleIdx(i);
                          }}
                          className={`text-left px-3.5 py-2.5 text-sm rounded-lg transition-colors border cursor-pointer shadow-none ${
                            explorerCategoryIdx === catIdx && explorerScaleIdx === i
                              ? "bg-orange-500 text-white border-orange-500 font-semibold"
                              : "bg-neutral-900 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                          }`}
                        >
                          {t(`scaleData.${scale.name}`)}
                        </button>
                      ))}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Fretboard Visualization */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            {instrument === 'piano' ? (
              <ScalePianoKeyboard
                scaleName={`${explorerRoot} ${t(`scaleData.${selectedScale.name}`)}`}
                notes={calculatedNotes}
                root={explorerRoot}
                isArpeggio={selectedScale.name.includes("Arpegio")}
                twoOctaves={true}
              />
            ) : (
              <ScaleFretboard
                scaleName={`${explorerRoot} ${t(`scaleData.${selectedScale.name}`)}`}
                notes={calculatedNotes}
                root={explorerRoot}
                isArpeggio={selectedScale.name.includes("Arpegio")}
                intervals={selectedScale.intervals}
                activeNote={activePlayingNote}
                playingIndex={activeScaleIndex}
              />
            )}
            
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-xs text-neutral-400 uppercase tracking-wider font-sans font-bold flex items-center gap-1.5 mb-3">
                <BookOpen size={16} className="text-orange-400" />
                {t("scales.relation")}
              </h3>
              <p className="text-base text-neutral-200 mb-4">
                {t("scales.relationText")} <strong className="text-white">{explorerRoot}</strong>:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedScale.relatedChords.map(suffix => (
                  <span key={suffix} className="bg-neutral-900 border border-neutral-800 text-neutral-100 font-bold px-3.5 py-2 rounded-lg text-sm inline-flex items-center gap-1 shadow-none">
                    {explorerRoot}<span className="text-orange-400">{suffix}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
