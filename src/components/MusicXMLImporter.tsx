import React, { useState, useRef } from "react";
import { UploadCloud, Upload, X } from "lucide-react";
import { Song, SongMeasure, RootNote } from "../types";

interface MusicXMLImporterProps {
  onImport: (song: Song) => void;
  compact?: boolean;
  className?: string;
}

export default function MusicXMLImporter({ onImport, compact, className }: MusicXMLImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseMusicXML(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".xml") || file.name.endsWith(".musicxml")) {
        processFile(file);
      } else {
        alert("Por favor, sube un archivo .xml o .musicxml válido.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const mapXMLKindToChordType = (kind: string, textAttr: string | null): string => {
    const cleanKind = kind.trim().toLowerCase();
    const cleanText = (textAttr || "").trim();

    if (cleanKind.includes("half-diminished")) return "m7b5";
    if (cleanKind.includes("diminished")) return "dim7";
    if (cleanKind.includes("minor-major")) return "m(maj7)";
    if (cleanKind.includes("minor-seventh")) return "m7";
    if (cleanKind.includes("major-seventh")) return "maj7";
    if (cleanKind.includes("dominant-ninth")) return "9";
    if (cleanKind.includes("major-ninth")) return "maj9";
    if (cleanKind.includes("minor-ninth")) return "m9";
    if (cleanKind.includes("dominant-13th")) return "13";
    if (cleanKind.includes("minor-13th")) return "m13";
    if (cleanKind.includes("major-13th")) return "maj13";
    if (cleanKind.includes("dominant-11th")) return "9sus4";
    if (cleanKind.includes("minor-11th")) return "m11";
    if (cleanKind.includes("augmented-seventh")) return "7#5";
    if (cleanKind.includes("augmented")) return "aug";
    if (cleanKind.includes("suspended-fourth") || cleanKind.includes("suspended-second")) {
      return "7sus4";
    }
    if (cleanKind.includes("major-sixth")) {
      if (cleanText.includes("9")) return "6(9)";
      return "6";
    }
    if (cleanKind.includes("minor-sixth")) {
      return "m6";
    }
    if (cleanKind.includes("dominant")) return "7";
    if (cleanKind.includes("minor")) return "Menor";
    if (cleanKind.includes("major")) return "Mayor";

    return "Mayor";
  };

  const parseMusicXML = (xmlText: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // Title
      const workTitleNode = xmlDoc.querySelector("work-title");
      const movementTitleNode = xmlDoc.querySelector("movement-title");
      let title = "Desconocido";
      if (workTitleNode && workTitleNode.textContent?.trim()) {
        title = workTitleNode.textContent.trim();
      } else if (movementTitleNode && movementTitleNode.textContent?.trim()) {
        title = movementTitleNode.textContent.trim();
      }

      // Key
      const modeNode = xmlDoc.querySelector("key > mode");
      let isMinor = false;
      if (modeNode && modeNode.textContent?.trim().toLowerCase() === "minor") {
        isMinor = true;
      }
      const fifthsNode = xmlDoc.querySelector("key > fifths");
      let fifths = 0;
      if (fifthsNode && fifthsNode.textContent) {
        fifths = parseInt(fifthsNode.textContent, 10) || 0;
      }

      let defaultKey: string = "C";
      if (isMinor) {
        if (fifths === -1) defaultKey = "Dm";
        else if (fifths === 0) defaultKey = "Am";
        else if (fifths === 1) defaultKey = "Em";
        else if (fifths === 2) defaultKey = "Bm";
        else if (fifths === 3) defaultKey = "F#m";
        else if (fifths === 4) defaultKey = "C#m";
        else if (fifths === 5) defaultKey = "G#m";
        else if (fifths === 6) defaultKey = "D#m";
        else if (fifths === 7) defaultKey = "A#m";
        else if (fifths === -2) defaultKey = "Gm";
        else if (fifths === -3) defaultKey = "Cm";
        else if (fifths === -4) defaultKey = "Fm";
        else if (fifths === -5) defaultKey = "Bbm";
        else if (fifths === -6) defaultKey = "Ebm";
        else if (fifths === -7) defaultKey = "Abm";
        else defaultKey = "Am";
      } else {
        if (fifths === 0) defaultKey = "C";
        else if (fifths === 1) defaultKey = "G";
        else if (fifths === 2) defaultKey = "D";
        else if (fifths === 3) defaultKey = "A";
        else if (fifths === 4) defaultKey = "E";
        else if (fifths === 5) defaultKey = "B";
        else if (fifths === 6) defaultKey = "F#";
        else if (fifths === 7) defaultKey = "C#";
        else if (fifths === -1) defaultKey = "F";
        else if (fifths === -2) defaultKey = "Bb";
        else if (fifths === -3) defaultKey = "Eb";
        else if (fifths === -4) defaultKey = "Ab";
        else if (fifths === -5) defaultKey = "Db";
        else if (fifths === -6) defaultKey = "Gb";
        else if (fifths === -7) defaultKey = "Cb";
        else defaultKey = "C";
      }

      const beatsNode = xmlDoc.querySelector("attributes > time > beats");
      const beatTypeNode = xmlDoc.querySelector("attributes > time > beat-type");
      const beatsPerBar = beatsNode?.textContent ? parseInt(beatsNode.textContent, 10) || 4 : 4;
      const beatType = beatTypeNode?.textContent ? parseInt(beatTypeNode.textContent, 10) || 4 : 4;
      const timeSignature = `${beatsPerBar}/${beatType}`;

      const soundTempoNode = xmlDoc.querySelector("sound[tempo]");
      const parsedTempo = soundTempoNode?.getAttribute("tempo")
        ? Math.round(parseFloat(soundTempoNode.getAttribute("tempo") || "120"))
        : 120;

      interface RawXmlMeasure {
        chords: string[];
        hasRepeatStart: boolean;
        hasRepeatEnd: boolean;
        endingStart: 0 | 1 | 2;
        endingStop: boolean;
        rehearsalSection?: "A" | "B" | "C";
        section: "A" | "B" | "C";
        activeEnding: 0 | 1 | 2;
        hasDaCapo: boolean;
        hasFine: boolean;
        melodyNotes: { freq: number; offsetBeats: number; durationBeats: number }[];
      }

      const allParts = xmlDoc.querySelectorAll("part");
      const primaryPart = allParts[0];
      if (!primaryPart) return;

      let divisions = 1;
      const firstDivisions = primaryPart.querySelector("attributes > divisions");
      if (firstDivisions && firstDivisions.textContent) {
        divisions = parseInt(firstDivisions.textContent, 10) || 1;
      }

      const rawMeasures: RawXmlMeasure[] = [];
      let activeEnding: 0 | 1 | 2 = 0;
      let currentSection: "A" | "B" | "C" = "A";

      const measureNodes = primaryPart.querySelectorAll("measure");

      measureNodes.forEach((measureNode) => {
        const hasRepeatStart = Boolean(
          measureNode.querySelector(
            "barline repeat[direction='forward'], repeat[direction='forward']"
          )
        );
        const hasRepeatEnd = Boolean(
          measureNode.querySelector(
            "barline repeat[direction='backward'], repeat[direction='backward']"
          )
        );

        let endingStart: 0 | 1 | 2 = 0;
        let endingStop = false;
        const endingNodes = measureNode.querySelectorAll("barline ending, ending");
        endingNodes.forEach((endNode) => {
          const endType = (endNode.getAttribute("type") || "").toLowerCase();
          const endNum = (endNode.getAttribute("number") || "").trim();
          if (endType === "start") {
            if (endNum.includes("1")) endingStart = 1;
            else if (endNum.includes("2")) endingStart = 2;
          }
          if (endType === "stop" || endType === "discontinue") {
            endingStop = true;
          }
        });

        let rehearsalSection: "A" | "B" | "C" | undefined = undefined;
        const rehearsalNode = measureNode.querySelector(
          "direction rehearsal, rehearsal"
        );
        if (rehearsalNode && rehearsalNode.textContent) {
          const rawReh = rehearsalNode.textContent
            .replace(/[^A-Za-z]/g, "")
            .toUpperCase();
          if (rawReh.startsWith("B")) rehearsalSection = "B";
          else if (rawReh.startsWith("C") || rawReh.startsWith("D"))
            rehearsalSection = "C";
          else if (rawReh.startsWith("A") || rawReh.startsWith("V"))
            rehearsalSection = "A";
        }

        // Actualizar activeEnding según las reglas exactas de casillas y secciones
        if (endingStart === 1) {
          activeEnding = 1;
        } else if (endingStart === 2) {
          activeEnding = 2;
        } else if (rehearsalSection && !endingStart) {
          activeEnding = 0;
        } else if (hasRepeatStart && !endingStart) {
          activeEnding = 0;
        }

        if (rehearsalSection) {
          currentSection = rehearsalSection;
        }

        // Detectar D.C. (Da Capo) y Fine
        let hasDaCapo = Boolean(
          measureNode.querySelector("sound[dacapo='yes'], sound[dacapo]")
        );
        let hasFine = Boolean(
          measureNode.querySelector("sound[fine='yes'], sound[fine]")
        );
        const wordsNodes = measureNode.querySelectorAll(
          "direction words, words"
        );
        wordsNodes.forEach((wNode) => {
          const txt = (wNode.textContent || "").trim();
          if (/D\.?C\.?|Da\s*Capo/i.test(txt)) {
            hasDaCapo = true;
          }
          if (/\bFine\b/i.test(txt)) {
            hasFine = true;
          }
        });

        // Extraer acordes (<harmony>) incluyendo inversiones (<bass>)
        const harmonyNodes = measureNode.querySelectorAll("harmony");
        const chordsInMeasure: string[] = [];

        harmonyNodes.forEach((harmony) => {
          const rootStepEntry = harmony.querySelector("root > root-step, root-step");
          const rootAlterEntry = harmony.querySelector("root > root-alter, root-alter");
          if (rootStepEntry && rootStepEntry.textContent) {
            let rootNoteStr = rootStepEntry.textContent.trim();
            const rootAlterVal = rootAlterEntry?.textContent?.trim();
            if (rootAlterVal === "-1") rootNoteStr += "b";
            else if (rootAlterVal === "1") rootNoteStr += "#";

            const kindNode = harmony.querySelector("kind");
            let chordType = "Mayor";
            if (kindNode) {
              const kindContent = kindNode.textContent || "major";
              const textAttr = kindNode.getAttribute("text");
              chordType = mapXMLKindToChordType(kindContent, textAttr);
            }

            let finalSuffix =
              chordType === "Mayor"
                ? ""
                : chordType === "Menor"
                ? "m"
                : chordType;

            const degreeNodes = harmony.querySelectorAll("degree");
            degreeNodes.forEach((degreeNode) => {
              const degreeValue = degreeNode
                .querySelector("degree-value")
                ?.textContent?.trim();
              const degreeAlter = degreeNode
                .querySelector("degree-alter")
                ?.textContent?.trim();
              if (degreeValue === "5") {
                if (
                  degreeAlter === "-1" &&
                  !finalSuffix.includes("b5") &&
                  !finalSuffix.includes("dim")
                ) {
                  finalSuffix += "b5";
                } else if (
                  degreeAlter === "1" &&
                  !finalSuffix.includes("#5") &&
                  !finalSuffix.includes("aug")
                ) {
                  finalSuffix += "#5";
                }
              } else if (degreeValue === "9") {
                if (degreeAlter === "-1" && !finalSuffix.includes("b9")) {
                  finalSuffix = finalSuffix === "7" ? "7b9" : `${finalSuffix}b9`;
                } else if (degreeAlter === "1" && !finalSuffix.includes("#9")) {
                  finalSuffix = finalSuffix === "7" ? "7#9" : `${finalSuffix}#9`;
                } else if (
                  (!degreeAlter || degreeAlter === "0") &&
                  finalSuffix === "6"
                ) {
                  finalSuffix = "6(9)";
                }
              } else if (degreeValue === "11" && degreeAlter === "1") {
                if (!finalSuffix.includes("#11")) {
                  finalSuffix =
                    finalSuffix === "7"
                      ? "7#11"
                      : finalSuffix === "maj7"
                      ? "maj7#11"
                      : `${finalSuffix}#11`;
                }
              } else if (degreeValue === "13" && degreeAlter === "-1") {
                if (!finalSuffix.includes("b13")) {
                  finalSuffix =
                    finalSuffix === "7" ? "7b13" : `${finalSuffix}b13`;
                }
              }
            });

            // Verificar si existe <bass><bass-step> (inversión / slash chord)
            let bassSuffix = "";
            const bassStepNode = harmony.querySelector(
              "bass > bass-step, bass-step"
            );
            const bassAlterNode = harmony.querySelector(
              "bass > bass-alter, bass-alter"
            );
            if (bassStepNode && bassStepNode.textContent?.trim()) {
              let bassNoteStr = bassStepNode.textContent.trim();
              const bassAlterVal = bassAlterNode?.textContent?.trim();
              if (bassAlterVal === "-1") bassNoteStr += "b";
              else if (bassAlterVal === "1") bassNoteStr += "#";
              if (bassNoteStr && bassNoteStr !== rootNoteStr) {
                bassSuffix = `/${bassNoteStr}`;
              }
            }

            chordsInMeasure.push(`${rootNoteStr}${finalSuffix}${bassSuffix}`);
          }
        });

        // Parsear notas de melodía dentro del compás
        const melodyNotes: {
          freq: number;
          offsetBeats: number;
          durationBeats: number;
        }[] = [];
        let measureBeatOffset = 0;
        const localDivisionsNode = measureNode.querySelector(
          "attributes > divisions"
        );
        if (localDivisionsNode && localDivisionsNode.textContent) {
          divisions = parseInt(localDivisionsNode.textContent, 10) || divisions;
        }

        const timeElements = measureNode.querySelectorAll(
          "note, backup, forward"
        );
        timeElements.forEach((el) => {
          const tag = el.tagName.toLowerCase();
          if (tag === "backup") {
            const d = el.querySelector("duration");
            if (d && d.textContent) {
              measureBeatOffset -= parseInt(d.textContent, 10) / divisions;
            }
            return;
          }
          if (tag === "forward") {
            const d = el.querySelector("duration");
            if (d && d.textContent) {
              measureBeatOffset += parseInt(d.textContent, 10) / divisions;
            }
            return;
          }
          const isChord = el.querySelector("chord") !== null;
          const isGrace = el.querySelector("grace") !== null;
          const durationNode = el.querySelector("duration");
          let durationDivs = 0;
          if (durationNode && durationNode.textContent && !isGrace) {
            durationDivs = parseInt(durationNode.textContent, 10) || 0;
          }
          const durationBeats = divisions > 0 ? durationDivs / divisions : 0;
          let currentOffset = measureBeatOffset;
          if (isChord) {
            currentOffset -= durationBeats;
          }
          const pitchNode = el.querySelector("pitch");
          if (pitchNode && !isGrace) {
            const step = pitchNode.querySelector("step")?.textContent;
            const alter = pitchNode.querySelector("alter")?.textContent;
            const octave = pitchNode.querySelector("octave")?.textContent;
            if (step && octave) {
              const stepToOffset: Record<string, number> = {
                C: 0,
                D: 2,
                E: 4,
                F: 5,
                G: 7,
                A: 9,
                B: 11,
              };
              let midi =
                12 * (parseInt(octave, 10) + 1) +
                (stepToOffset[step.toUpperCase()] || 0);
              if (alter) {
                midi += parseInt(alter, 10) || 0;
              }
              const freq = 440 * Math.pow(2, (midi - 69) / 12);
              melodyNotes.push({
                freq,
                offsetBeats: Math.max(0, currentOffset),
                durationBeats,
              });
            }
          }
          if (!isChord && !isGrace) {
            measureBeatOffset += durationBeats;
          }
        });

        rawMeasures.push({
          chords: chordsInMeasure,
          hasRepeatStart,
          hasRepeatEnd,
          endingStart,
          endingStop,
          rehearsalSection,
          section: currentSection,
          activeEnding,
          hasDaCapo,
          hasFine,
          melodyNotes,
        });
      });

      // Expandir la estructura musical respetando Casilla 1, Casilla 2 y D.C. al 2nd End. / Fine
      const expandedMeasures: RawXmlMeasure[] = [];
      let repeatStartIdx = 0;

      for (let i = 0; i < rawMeasures.length; i++) {
        const rm = rawMeasures[i];
        if (rm.hasRepeatStart) {
          repeatStartIdx = i;
        }

        expandedMeasures.push({
          ...rm,
          chords: [...rm.chords],
          melodyNotes: [...rm.melodyNotes],
        });

        if (rm.hasRepeatEnd) {
          // 2ª pasada: copiar ÚNICAMENTE los compases comunes desde repeatStartIdx con activeEnding === 0
          // deteniéndose justo antes del primer compás con activeEnding === 1
          for (let k = repeatStartIdx; k <= i; k++) {
            if (rawMeasures[k].activeEnding === 1) {
              break;
            }
            if (rawMeasures[k].activeEnding === 0) {
              expandedMeasures.push({
                ...rawMeasures[k],
                chords: [...rawMeasures[k].chords],
                melodyNotes: [...rawMeasures[k].melodyNotes],
              });
            }
          }
        }
      }

      // Si algún compás tenía D.C. (D.C. al 2nd End. o D.C. al Fine), agregar al final la vuelta desde 0
      // tomando únicamente activeEnding === 0 más activeEnding === 2 hasta Fine
      const anyHasDaCapo = rawMeasures.some((m) => m.hasDaCapo);
      if (anyHasDaCapo) {
        let passedEnding2InDaCapo = false;
        for (let d = 0; d < rawMeasures.length; d++) {
          const rm = rawMeasures[d];
          if (rm.activeEnding === 1) {
            continue;
          }
          if (rm.activeEnding === 2) {
            passedEnding2InDaCapo = true;
          }
          if (passedEnding2InDaCapo && rm.activeEnding === 0) {
            break;
          }
          if (rm.activeEnding === 0 || rm.activeEnding === 2) {
            expandedMeasures.push({
              ...rm,
              chords: [...rm.chords],
              melodyNotes: [...rm.melodyNotes],
            });
            if (rm.hasFine) {
              break;
            }
          }
        }
      }

      const measuresData: SongMeasure[] = [];
      const importedMelody: {
        freq: number;
        startBeat: number;
        durationBeats: number;
      }[] = [];
      const sectionsMap: Record<string, number> = {};
      let lastKnownChord = ["Cmaj7"];

      expandedMeasures.forEach((em, idx) => {
        const resolvedChords =
          em.chords.length > 0 ? [...em.chords] : [...lastKnownChord];
        if (em.chords.length > 0) {
          lastKnownChord = [...em.chords];
        }

        const isBlockStart =
          idx === 0 ||
          idx % 8 === 0 ||
          (idx > 0 && expandedMeasures[idx - 1].section !== em.section);
        const secLetter = em.section || "A";

        if (isBlockStart && sectionsMap[secLetter] === undefined) {
          sectionsMap[secLetter] = idx;
        }

        measuresData.push({
          id: `m-${idx + 1}`,
          chords: resolvedChords,
          section: isBlockStart ? secLetter : undefined,
          sectionLabel: isBlockStart ? `[Sección ${secLetter}]` : undefined,
          isEnd: idx === expandedMeasures.length - 1 ? true : undefined,
        } as SongMeasure);

        const measureStartBeat = idx * beatsPerBar;
        em.melodyNotes.forEach((mn) => {
          importedMelody.push({
            freq: mn.freq,
            startBeat: measureStartBeat + mn.offsetBeats,
            durationBeats: mn.durationBeats,
          });
        });
      });

      const cleanKeyRoot = defaultKey.replace(/m$/i, "").trim() || "C";

      const newSong: Song = {
        id: `${title.toLowerCase().replace(/[\s/]+/g, "-")}-${Date.now()}`,
        title,
        defaultKey: cleanKeyRoot as RootNote,
        defaultIsMinor: isMinor,
        timeSignature,
        style: "Jazz Swing",
        tempo: parsedTempo,
        isCustom: true,
        sections: Object.keys(sectionsMap).length > 0 ? sectionsMap : { A: 0 },
        importedMelody: importedMelody.length > 0 ? importedMelody : undefined,
        measures:
          measuresData.length > 0
            ? measuresData
            : [{ id: "m-1", chords: ["Cmaj7"], sectionLabel: "[Sección A]", isEnd: true }],
      };

      onImport(newSong);
      setIsOpen(false);
    } catch (error) {
      console.error("Error parseando archivo MusicXML:", error);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-9 px-2.5 sm:px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Subir MusicXML (.xml, .musicxml)"
        >
          <Upload size={14} className="text-sky-400 shrink-0" />
          <span className="hidden sm:inline">MusicXML</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={className || "flex-1 flex justify-center items-center gap-2 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 font-bold rounded-lg text-xs border border-[#EA580B] text-[#EA580B] hover:text-orange-300 transition-colors cursor-pointer"}
          title="Subir archivo MusicXML (.xml, .musicxml)"
        >
          <UploadCloud size={16} className="text-[#EA580B] shrink-0" />
          <span>Subir MusicXML</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Importar Canción</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Sube un partitura en formato MusicXML (.xml) generado desde Finale, Sibelius, MuseScore, etc.
            </p>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-[#EA580B] bg-[#EA580B]/10" : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} className={`mb-4 ${isDragging ? "text-[#EA580B]" : "text-zinc-600"}`} />
              <p className="text-center text-sm font-medium text-zinc-300">
                Arrastra tu archivo MusicXML aquí o haz clic para explorar
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Formatos soportados: .xml, .musicxml
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xml,.musicxml"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
