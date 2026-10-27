import { RootNote, ChordTypeOptions } from "../types";
import {
  parseChord,
  SuggestedScale,
  getSuggestedScale,
  isMinorQuality,
  isDominantQuality,
  isExplicitMajorChord,
} from "./music";
import { ROOT_MIDI_OFFSET_MAP } from "../data/chords";

export interface ChordInputContext {
  chordString: string;
  keyContext: RootNote;
  isMinorKey: boolean;
  measureIndex?: number;
}

export type AnalysisCategory =
  | "diatonic"
  | "secondary_dominant"
  | "tritone_substitute"
  | "modal_interchange"
  | "tonal_shift"
  | "related_ii"
  | "none";

export interface AnalyzedChord {
  chordString: string;
  root: RootNote;
  type: ChordTypeOptions;
  keyContext: RootNote;
  isMinorKey: boolean;
  romanNumeral: string;
  category: AnalysisCategory;
  color?: string;
  suggestedScale?: SuggestedScale;
}

const CHROMATIC_SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const CHROMATIC_FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

function buildExactScale(
  root: RootNote,
  scaleTitle: string,
  intervals: number[],
  forceSharpThird: boolean = false
): SuggestedScale {
  const cleanRoot = String(root || "C").trim() as RootNote;
  const baseSemi =
    ROOT_MIDI_OFFSET_MAP[cleanRoot] !== undefined
      ? ROOT_MIDI_OFFSET_MAP[cleanRoot] % 12
      : 0;
  const useFlats =
    cleanRoot.includes("b") ||
    cleanRoot === "F" ||
    cleanRoot === "Bb" ||
    cleanRoot === "Eb" ||
    cleanRoot === "Ab" ||
    cleanRoot === "Db" ||
    cleanRoot === "Gb" ||
    cleanRoot === "C";

  const notes = intervals.map((intv, idx) => {
    const semi = (baseSemi + intv) % 12;
    if (forceSharpThird && idx === 2) {
      return CHROMATIC_SHARP_NAMES[semi] as RootNote;
    }
    return (
      useFlats ? CHROMATIC_FLAT_NAMES[semi] : CHROMATIC_SHARP_NAMES[semi]
    ) as RootNote;
  });

  return {
    name: `${cleanRoot} ${scaleTitle}`,
    notes,
  };
}

function buildHarmonicMinorLeadingToneScale(
  dimRoot: RootNote,
  targetRoot?: RootNote
): SuggestedScale {
  const cleanDimRoot = String(dimRoot || "C#").trim() as RootNote;
  if (targetRoot && ROOT_MIDI_OFFSET_MAP[targetRoot] !== undefined) {
    const targetSemi = ROOT_MIDI_OFFSET_MAP[targetRoot] % 12;
    const dimSemi = (ROOT_MIDI_OFFSET_MAP[cleanDimRoot] ?? 0) % 12;
    const harmonicMinorPitchClasses = [0, 2, 3, 5, 7, 8, 11].map(
      (i) => (targetSemi + i) % 12
    );
    const relativeIntervals = harmonicMinorPitchClasses
      .map((pc) => (pc - dimSemi + 12) % 12)
      .sort((a, b) => a - b);

    return buildExactScale(
      cleanDimRoot,
      `Disminuida (${targetRoot}m Armónica)`,
      relativeIntervals
    );
  }

  return buildExactScale(
    cleanDimRoot,
    "Disminuida (7º Menor Armónica)",
    [0, 1, 3, 4, 6, 8, 9]
  );
}

function getInterval(root1: RootNote, root2: RootNote): number {
  const v1 = ROOT_MIDI_OFFSET_MAP[root1] ?? 0;
  const v2 = ROOT_MIDI_OFFSET_MAP[root2] ?? 0;
  let diff = (v2 - v1) % 12;
  if (diff < 0) diff += 12;
  return diff;
}

export function isPureDiminishedSeventh(
  type: string,
  rawChordStr: string = ""
): boolean {
  const t = String(type || "").toLowerCase();
  const s = String(rawChordStr || "").toLowerCase();
  if (
    t.includes("m7b5") ||
    s.includes("m7b5") ||
    s.includes("-7b5") ||
    t.includes("ø") ||
    s.includes("ø")
  ) {
    return false;
  }
  return (
    t === "dim7" ||
    t === "dim" ||
    t.includes("dim") ||
    t.includes("°") ||
    s.includes("dim") ||
    s.includes("°") ||
    /^[a-g][#b]?o7?$/i.test(s.trim())
  );
}

export function isHalfDimOnly(type: string, rawChordStr: string = ""): boolean {
  const t = String(type || "").toLowerCase();
  const s = String(rawChordStr || "").toLowerCase();
  return (
    t === "m7b5" ||
    t.includes("b5") ||
    t.includes("ø") ||
    s.includes("m7b5") ||
    s.includes("-7b5") ||
    s.includes("ø")
  );
}

export function isHalfDimOrDimType(
  type: string,
  rawChordStr: string = ""
): boolean {
  return (
    isHalfDimOnly(type, rawChordStr) ||
    isPureDiminishedSeventh(type, rawChordStr)
  );
}

export function isPureMinorSeventhType(
  type: string,
  rawChordStr: string = ""
): boolean {
  if (isHalfDimOrDimType(type, rawChordStr)) return false;
  return isMinorQuality(type);
}

export function isPureMajorTonicType(
  type: string,
  rawChordStr: string = ""
): boolean {
  if (isHalfDimOrDimType(type, rawChordStr)) return false;
  if (isDominantQuality(type)) return false;
  if (isMinorQuality(type)) return false;
  return isExplicitMajorChord(type) || type === "Mayor" || type === "6";
}

function isSameFunctionalHarmony(
  pA: { root: RootNote; type: string; raw: string } | null,
  pB: { root: RootNote; type: string; raw: string } | null
): boolean {
  if (!pA || !pB) return false;
  if (ROOT_MIDI_OFFSET_MAP[pA.root] !== ROOT_MIDI_OFFSET_MAP[pB.root]) {
    return false;
  }
  if (pA.type === pB.type) return true;

  const aDom = isDominantQuality(pA.type);
  const bDom = isDominantQuality(pB.type);
  if (aDom && bDom) return true;

  const aMin = isPureMinorSeventhType(pA.type, pA.raw);
  const bMin = isPureMinorSeventhType(pB.type, pB.raw);
  if (aMin && bMin) return true;

  const aMaj = isPureMajorTonicType(pA.type, pA.raw);
  const bMaj = isPureMajorTonicType(pB.type, pB.raw);
  if (aMaj && bMaj) return true;

  const aHalfDim = isHalfDimOnly(pA.type, pA.raw);
  const bHalfDim = isHalfDimOnly(pB.type, pB.raw);
  if (aHalfDim && bHalfDim) return true;

  const aPureDim = isPureDiminishedSeventh(pA.type, pA.raw);
  const bPureDim = isPureDiminishedSeventh(pB.type, pB.raw);
  if (aPureDim && bPureDim) return true;

  return false;
}

function getRomanNumeral(
  keyRoot: RootNote,
  chordRoot: RootNote,
  type: string,
  isMinorKey: boolean,
  category: AnalysisCategory
): string {
  const diff = getInterval(keyRoot, chordRoot);
  const degreeMapMajor: Record<number, string> = {
    0: "I",
    1: "bII",
    2: "II",
    3: "bIII",
    4: "III",
    5: "IV",
    6: "#IV",
    7: "V",
    8: "bVI",
    9: "VI",
    10: "bVII",
    11: "VII",
  };

  const baseDegree = degreeMapMajor[diff] || "?";

  const isMin = isMinorQuality(type);
  const isDom = isDominantQuality(type);
  const isHalfDim = type === "m7b5" || type.includes("b5") || type.includes("ø");
  const isDim = type === "dim7" || type.includes("dim") || type.includes("°");

  let numeral = isMin ? baseDegree.toLowerCase() : baseDegree;
  if (isHalfDim) numeral = baseDegree.toLowerCase() + "ø";
  else if (isDim) numeral = baseDegree.toLowerCase() + "°";
  else if (isDom && diff === 7) numeral = "V7";
  else if (isDom && diff !== 7) numeral = baseDegree + "7";
  else if (isDom) numeral = baseDegree;

  if (category === "modal_interchange") {
    if (isMinorKey && [0, 2, 3, 5, 7, 8, 10].includes(diff)) {
      // Diatónico en menor: sin sufijo (IM)
    } else {
      numeral += " (IM)";
    }
  }

  return numeral;
}

function classifyDiatonic(
  chordRoot: RootNote,
  chordType: string,
  keyContext: RootNote,
  isMinorKey: boolean
): boolean {
  const diff = getInterval(keyContext, chordRoot);
  const isMin = isMinorQuality(chordType);
  const isDom = isDominantQuality(chordType);
  const isHalfDim = chordType === "m7b5";
  const isDim = chordType === "dim7";
  const isMaj = !isMin && !isDom && !isHalfDim && !isDim;

  if (!isMinorKey) {
    return (
      (diff === 0 && isMaj) ||
      (diff === 2 && isMin && !isHalfDim) ||
      (diff === 4 && isMin && !isHalfDim) ||
      (diff === 5 && isMaj) ||
      (diff === 7 && isDom) ||
      (diff === 9 && isMin && !isHalfDim) ||
      (diff === 11 && isHalfDim)
    );
  } else {
    return (
      (diff === 0 && isMin) ||
      (diff === 2 && (isHalfDim || isDim)) ||
      (diff === 3 && isMaj) ||
      (diff === 5 && isMin) ||
      (diff === 7 && (isDom || isMin)) ||
      (diff === 8 && isMaj) ||
      (diff === 10 && (isDom || isMaj)) ||
      (diff === 11 && isDim)
    );
  }
}

function classifyModalInterchange(
  chordRoot: RootNote,
  chordType: string,
  keyContext: RootNote,
  isMinorKey: boolean
): boolean {
  const diff = getInterval(keyContext, chordRoot);
  const isMin = isMinorQuality(chordType);
  const isDom = isDominantQuality(chordType);
  const isHalfDim = chordType === "m7b5";
  const isMaj = !isMin && !isDom && !isHalfDim && !(chordType === "dim7");

  if (!isMinorKey) {
    return (
      (diff === 0 && (isMin || isHalfDim)) ||
      (diff === 2 && isHalfDim) ||
      (diff === 3 && isMaj) ||
      (diff === 5 && isMin) ||
      (diff === 7 && isMin) ||
      (diff === 8 && isMaj) ||
      (diff === 10 && (isDom || isMaj))
    );
  } else {
    return (
      (diff === 0 && isMaj) ||
      (diff === 5 && (isMaj || isDom)) ||
      (diff === 9 && isMin)
    );
  }
}

export function analyzeChord(
  chord: any,
  index: number,
  allChords: any[],
  keyContextStr: string
): {
  romanNumeral: string;
  category: string;
  color: string;
  isMinorKey?: boolean;
  keyContext?: RootNote;
  suggestedScale?: SuggestedScale;
} {
  const rawChord =
    typeof chord === "string"
      ? chord
      : chord?.chordName || chord?.name || "";
  if (!rawChord || rawChord.trim() === "") {
    return { romanNumeral: "-", category: "none", color: "border-zinc-700" };
  }

  if (rawChord.trim() === "%") {
    if (allChords && allChords.length > 0) {
      for (let prevIdx = index - 1; prevIdx >= 0; prevIdx--) {
        const prev = allChords[prevIdx];
        const prevStr =
          typeof prev === "string"
            ? prev
            : prev?.chordName || prev?.name || "";
        if (prevStr && prevStr.trim() !== "" && prevStr.trim() !== "%") {
          return analyzeChord(prevStr, prevIdx, allChords, keyContextStr);
        }
      }
    }
    return analyzeChord("C", index, allChords, keyContextStr);
  }

  let isGlobalMinor =
    keyContextStr.endsWith("m") || /m|-|min/i.test(keyContextStr);
  const globalKey = keyContextStr.replace(/m|-|min/gi, "").trim() as RootNote;

  const { root, type } = parseChord(rawChord);

  if (!isGlobalMinor && allChords && allChords.length > 0) {
    const validChords = allChords.filter((s) => {
      const str = typeof s === "string" ? s : s?.chordName || s?.name || "";
      return str && str.trim() !== "" && str !== "%";
    });
    if (validChords.length > 0) {
      const getStr = (c: any) =>
        typeof c === "string" ? c : c?.chordName || c?.name || "";
      const firstP = parseChord(getStr(validChords[0]));
      const lastP = parseChord(getStr(validChords[validChords.length - 1]));
      const tonicKey = (
        globalKey in ROOT_MIDI_OFFSET_MAP ? globalKey : "C"
      ) as RootNote;
      if (
        (isMinorQuality(firstP.type) &&
          ROOT_MIDI_OFFSET_MAP[firstP.root] ===
            ROOT_MIDI_OFFSET_MAP[tonicKey]) ||
        (isMinorQuality(lastP.type) &&
          ROOT_MIDI_OFFSET_MAP[lastP.root] === ROOT_MIDI_OFFSET_MAP[tonicKey])
      ) {
        isGlobalMinor = true;
      }
    }
  }

  const getRaw = (idx: number) => {
    if (idx < 0 || idx >= allChords.length) return null;
    const c = allChords[idx];
    const str = typeof c === "string" ? c : c?.chordName || c?.name || "";
    return str.trim() !== "" ? str : null;
  };

  const safeParse = (str: string | null) =>
    str && str !== "%" ? { ...parseChord(str), raw: str } : null;

  const skipDuplicatesForwards = (startIdx: number) => {
    const currP = safeParse(getRaw(startIdx));
    for (let i = startIdx + 1; i < allChords.length; i++) {
      const str = getRaw(i);
      if (str === "%") continue;
      const p = safeParse(str);
      if (p && !isSameFunctionalHarmony(currP, p)) {
        return { parsed: p, idx: i };
      }
    }
    return null;
  };

  const skipDuplicatesBackwards = (startIdx: number) => {
    const currP = safeParse(getRaw(startIdx));
    for (let i = startIdx - 1; i >= 0; i--) {
      const str = getRaw(i);
      if (str === "%") continue;
      const p = safeParse(str);
      if (p && !isSameFunctionalHarmony(currP, p)) {
        return { parsed: p, idx: i };
      }
    }
    return null;
  };

  const p1 = skipDuplicatesForwards(index);
  const p2 = p1 ? skipDuplicatesForwards(p1.idx) : null;
  const m1 = skipDuplicatesBackwards(index);
  const m2 = m1 ? skipDuplicatesBackwards(m1.idx) : null;

  const isPureDim = isPureDiminishedSeventh(type, rawChord);
  const isHalfDim = isHalfDimOnly(type, rawChord);
  const isMinQuality = isMinorQuality(type) || isHalfDim;
  const isDomQuality = isDominantQuality(type);
  const isMajQuality = isPureMajorTonicType(type, rawChord);

  let category: AnalysisCategory = "diatonic";
  let numeral = "";
  let resolvedDimTargetRoot: RootNote | undefined = undefined;

  const isSamePitch = (r1: RootNote, r2: RootNote) =>
    ROOT_MIDI_OFFSET_MAP[r1] === ROOT_MIDI_OFFSET_MAP[r2];

  const getSlashTarget = (
    targetRoot: RootNote,
    targetIsExplicitMajor: boolean = false
  ): string | null => {
    if (targetIsExplicitMajor) return null;

    const diff = getInterval(globalKey, targetRoot);
    if (!isGlobalMinor) {
      switch (diff) {
        case 2:
          return "ii";
        case 4:
          return "iii";
        case 5:
          return "IV";
        case 7:
          return "V";
        case 9:
          return "vi";
        default:
          return null;
      }
    } else {
      switch (diff) {
        case 2:
          return "ii°";
        case 3:
          return "bIII";
        case 5:
          return "iv";
        case 7:
          return "V";
        case 8:
          return "bVI";
        default:
          return null;
      }
    }
  };

  const isDiatonicMinorBeforeSecondaryDom = (
    minorRoot: RootNote,
    minorType: string,
    minorRaw: string,
    prevChord: { root: RootNote; type: string; raw: string } | null | undefined,
    prevPrevChord: { root: RootNote; type: string; raw: string } | null | undefined,
    nextDom: { root: RootNote; type: string; raw: string } | null | undefined,
    afterNextDom: { root: RootNote; type: string; raw: string } | null | undefined
  ): "iii" | "vi" | null => {
    if (isGlobalMinor) return null;
    if (!isPureMinorSeventhType(minorType, minorRaw)) return null;
    if (!nextDom || !isDominantQuality(nextDom.type)) return null;
    if (getInterval(minorRoot, nextDom.root) !== 5) return null;

    const diffFromTonic = getInterval(globalKey, minorRoot);

    if (diffFromTonic === 4) {
      const precededByItsOwnV7 =
        Boolean(prevChord) &&
        isDominantQuality(prevChord!.type) &&
        getInterval(prevChord!.root, minorRoot) === 5;

      const nextDomResolvesToMinorII =
        Boolean(afterNextDom) &&
        isPureMinorSeventhType(afterNextDom!.type, afterNextDom!.raw) &&
        getInterval(nextDom.root, afterNextDom!.root) === 5;

      if (!precededByItsOwnV7 && nextDomResolvesToMinorII) {
        return "iii";
      }
    }

    if (diffFromTonic === 9) {
      const precededByItsOwnSecondaryDom =
        Boolean(prevChord) &&
        isDominantQuality(prevChord!.type) &&
        getInterval(prevChord!.root, minorRoot) === 5 &&
        !(
          prevPrevChord &&
          isHalfDimOrDimType(prevPrevChord.type, prevPrevChord.raw) &&
          getInterval(prevPrevChord.root, prevChord!.root) === 5
        );

      const nextDomDoesNotResolveToMajorTonic =
        !afterNextDom ||
        !(
          isPureMajorTonicType(afterNextDom.type, afterNextDom.raw) &&
          getInterval(nextDom.root, afterNextDom.root) === 5
        );

      if (precededByItsOwnSecondaryDom && nextDomDoesNotResolveToMajorTonic) {
        return "vi";
      }
    }

    return null;
  };

  // === REGLA 0: ACORDE DISMINUIDO PURO (dim7 / °) CON RESOLUCIÓN SECUNDARIA (ej. vii°/ii, vii°/vi, vii°/V, vii°/iii) ===
  if (isPureDim) {
    if (p1?.parsed) {
      const intervalToTarget = getInterval(root, p1.parsed.root);
      const isSecondaryLeadingToneResolution =
        intervalToTarget === 1 ||
        intervalToTarget === 4 ||
        intervalToTarget === 7 ||
        intervalToTarget === 10 ||
        intervalToTarget === 11 ||
        intervalToTarget === 0;

      if (isSecondaryLeadingToneResolution) {
        // Si el acorde destino (p1, ej. Gm7 en Corcovado) es un acorde menor o semidisminuido
        // que forma pareja cadencial ii - V7 con el siguiente acorde (p2, ej. C7),
        // entonces su función real en la progresión es "ii" (o "iiø"), por lo que el disminuido es vii°/ii.
        const isTargetActingAsCadentialII =
          (isMinorQuality(p1.parsed.type) ||
            isHalfDimOnly(p1.parsed.type, p1.parsed.raw)) &&
          p2?.parsed &&
          isDominantQuality(p2.parsed.type) &&
          getInterval(p1.parsed.root, p2.parsed.root) === 5;

        const isTonicTarget = isSamePitch(p1.parsed.root, globalKey);
        const target = isTargetActingAsCadentialII
          ? "ii"
          : isTonicTarget
          ? null
          : getSlashTarget(p1.parsed.root, false);

        numeral = target ? `vii°/${target}` : "vii°";
        category = "secondary_dominant";
        resolvedDimTargetRoot = p1.parsed.root;
      }
    }
    if (!numeral) {
      const defaultTargetOffset = (ROOT_MIDI_OFFSET_MAP[root] + 1) % 12;
      const defaultTargetRoot = Object.keys(ROOT_MIDI_OFFSET_MAP).find(
        (k) => ROOT_MIDI_OFFSET_MAP[k as RootNote] === defaultTargetOffset
      ) as RootNote | undefined;
      const target =
        defaultTargetRoot && !isSamePitch(defaultTargetRoot, globalKey)
          ? getSlashTarget(defaultTargetRoot, false)
          : null;
      numeral = target ? `vii°/${target}` : "vii°";
      category = "secondary_dominant";
      resolvedDimTargetRoot = defaultTargetRoot;
    }
  }

  // === REGLA 1: PAREJA CADENCIAL ii - V7 ===
  if (
    !numeral &&
    isMinQuality &&
    p1?.parsed &&
    isDominantQuality(p1.parsed.type) &&
    getInterval(root, p1.parsed.root) === 5
  ) {
    const diatonicMinorRole = isDiatonicMinorBeforeSecondaryDom(
      root,
      type,
      rawChord,
      m1?.parsed,
      m2?.parsed,
      p1?.parsed,
      p2?.parsed
    );

    if (diatonicMinorRole) {
      numeral = diatonicMinorRole;
      category = "diatonic";
    } else {
      numeral = isHalfDim ? "iiø" : "ii";
      const resolutionRootOffset =
        (ROOT_MIDI_OFFSET_MAP[p1.parsed.root] + 5) % 12;
      const globalKeyOffset = ROOT_MIDI_OFFSET_MAP[globalKey as RootNote];
      const isNaturalResolution = resolutionRootOffset === globalKeyOffset;
      category = isNaturalResolution ? "diatonic" : "secondary_dominant";
    }
  }

  // === REGLA 1.5: APERTURA DE PROGRESIÓN vi - ii - V7 ===
  if (
    !numeral &&
    isPureMinorSeventhType(type, rawChord) &&
    p1?.parsed &&
    isPureMinorSeventhType(p1.parsed.type, p1.parsed.raw) &&
    getInterval(root, p1.parsed.root) === 5 &&
    p2?.parsed &&
    isDominantQuality(p2.parsed.type) &&
    getInterval(p1.parsed.root, p2.parsed.root) === 5
  ) {
    const isResolutionOfCompleteMinorIIV =
      m1?.parsed &&
      isDominantQuality(m1.parsed.type) &&
      getInterval(m1.parsed.root, root) === 5 &&
      m2?.parsed &&
      isHalfDimOrDimType(m2.parsed.type, m2.parsed.raw) &&
      getInterval(m2.parsed.root, m1.parsed.root) === 5;

    if (isResolutionOfCompleteMinorIIV) {
      numeral = "i";
      category = "diatonic";
    } else {
      numeral = "vi";
      category = "diatonic";
    }
  }

  // === REGLA 2: DOMINANTE PRECEDIDO POR SU ii ===
  if (!numeral && isDomQuality && m1?.parsed) {
    const isM1Min =
      isMinorQuality(m1.parsed.type) ||
      isHalfDimOnly(m1.parsed.type, m1.parsed.raw);
    if (isM1Min && getInterval(m1.parsed.root, root) === 5) {
      const m3 = m2 ? skipDuplicatesBackwards(m2.idx) : null;
      const prevMinorDiatonicRole = isDiatonicMinorBeforeSecondaryDom(
        m1.parsed.root,
        m1.parsed.type,
        m1.parsed.raw,
        m2?.parsed,
        m3?.parsed,
        { root, type, raw: rawChord },
        p1?.parsed
      );

      const turnsIntoParallelMinorII =
        p1?.parsed &&
        isPureMinorSeventhType(p1.parsed.type, p1.parsed.raw) &&
        isSamePitch(root, p1.parsed.root);

      if (!prevMinorDiatonicRole && !turnsIntoParallelMinorII) {
        numeral = "V7";
        const resolutionRootOffset = (ROOT_MIDI_OFFSET_MAP[root] + 5) % 12;
        const globalKeyOffset = ROOT_MIDI_OFFSET_MAP[globalKey as RootNote];
        const isNaturalResolution = resolutionRootOffset === globalKeyOffset;
        category = isNaturalResolution ? "diatonic" : "secondary_dominant";
      }
    }
  }

  // === REGLA 2.2: REGLA UNIVERSAL DE BLUES (I7 y IV7 en Tonalidad Mayor/Blues) ===
  if (!numeral && isDomQuality && !isGlobalMinor) {
    const diffFromTonic = getInterval(globalKey, root);

    if (diffFromTonic === 0) {
      const resolvesToExplicitMajorIV =
        p1?.parsed &&
        isPureMajorTonicType(p1.parsed.type, p1.parsed.raw) &&
        getInterval(root, p1.parsed.root) === 5;

      if (!resolvesToExplicitMajorIV) {
        numeral = "I7";
        category = "diatonic";
      }
    }

    if (diffFromTonic === 5) {
      const resolvesFourthUpToAny =
        p1?.parsed && getInterval(root, p1.parsed.root) === 5;

      if (!resolvesFourthUpToAny) {
        numeral = "IV7";
        category = "modal_interchange";
      }
    }
  }

  // === REGLA 2.5: PUENTE ESTILO GIRL FROM IPANEMA (bVII7 Backdoor en modulación) ===
  if (!numeral && isDomQuality && m1?.parsed) {
    const prevIsMajTonicFourthBelow =
      isPureMajorTonicType(m1.parsed.type, m1.parsed.raw) &&
      getInterval(m1.parsed.root, root) === 5 &&
      getInterval(globalKey, m1.parsed.root) !== 0 &&
      !(
        p1?.parsed &&
        getInterval(root, p1.parsed.root) === 5 &&
        isPureMajorTonicType(p1.parsed.type, p1.parsed.raw)
      );

    const prevIsMinorMajorThirdAbove =
      isPureMinorSeventhType(m1.parsed.type, m1.parsed.raw) &&
      getInterval(m1.parsed.root, root) === 8;

    if (prevIsMajTonicFourthBelow || prevIsMinorMajorThirdAbove) {
      numeral = "bVII7";
      category = "modal_interchange";
    }
  }

  // === REGLA 2.6: ACORDE MENOR ii EN PUENTE MODULANTE SEGUIDO POR bVII7 ===
  if (
    !numeral &&
    isPureMinorSeventhType(type, rawChord) &&
    p1?.parsed &&
    isDominantQuality(p1.parsed.type) &&
    getInterval(root, p1.parsed.root) === 8
  ) {
    numeral = "ii";
    category = "tonal_shift";
  }

  // === REGLA 2.7: ACORDE MAYOR IV EN PUENTE MODULANTE SEGUIDO POR bVII7 ===
  if (
    !numeral &&
    isMajQuality &&
    p1?.parsed &&
    isDominantQuality(p1.parsed.type) &&
    getInterval(root, p1.parsed.root) === 5 &&
    getInterval(globalKey, root) === 1
  ) {
    numeral = "IV";
    category = "tonal_shift";
  }

  // === REGLA 3: DOMINANTE QUE RESUELVE 1 CUARTA JUSTA ARRIBA ===
  if (!numeral && isDomQuality && p1?.parsed) {
    const intervalToNext = getInterval(root, p1.parsed.root);
    if (intervalToNext === 5) {
      const targetOffset = ROOT_MIDI_OFFSET_MAP[p1.parsed.root];
      const globalKeyOffset = ROOT_MIDI_OFFSET_MAP[globalKey as RootNote];
      const isGlobalTonicResolution = targetOffset === globalKeyOffset;
      const nextIsExplicitMaj = isPureMajorTonicType(
        p1.parsed.type,
        p1.parsed.raw
      );

      if (isGlobalTonicResolution || nextIsExplicitMaj) {
        numeral = "V7";
        category = isGlobalTonicResolution ? "diatonic" : "secondary_dominant";
      } else {
        category = "secondary_dominant";
        const target = getSlashTarget(p1.parsed.root, false);
        numeral = target ? `V7/${target}` : "V7";
      }
    }
  }

  // === REGLA 4: SUSTITUTO TRITONAL (subV7) ===
  if (!numeral && isDomQuality) {
    const resolvesHalfStepDown =
      p1?.parsed && getInterval(root, p1.parsed.root) === 11;
    const isFlatTwoDom = getInterval(globalKey, root) === 1;

    if (resolvesHalfStepDown || isFlatTwoDom) {
      category = "tritone_substitute";
      if (resolvesHalfStepDown && p1?.parsed) {
        const nextIsExplicitMaj = isPureMajorTonicType(
          p1.parsed.type,
          p1.parsed.raw
        );
        const isTonicTarget = isSamePitch(p1.parsed.root, globalKey);
        const target = isTonicTarget
          ? null
          : getSlashTarget(p1.parsed.root, nextIsExplicitMaj);
        numeral = target ? `subV7/${target}` : "subV7";
      } else {
        numeral = "subV7";
      }
    }
  }

  // === REGLA 5: BACKDOOR DOMINANT (bVII7 en la tonalidad global) ===
  if (!numeral && isDomQuality && getInterval(globalKey, root) === 10) {
    const resolvesToFourth =
      p1?.parsed && getInterval(root, p1.parsed.root) === 5;
    if (!resolvesToFourth) {
      category = isGlobalMinor ? "diatonic" : "modal_interchange";
      numeral = "bVII7";
    }
  }

  // === REGLA 6: ACORDE DE RESOLUCIÓN I / i / vi / ii TRAS UN DOMINANTE A CUARTA JUSTA ===
  if (
    !numeral &&
    m1?.parsed &&
    isDominantQuality(m1.parsed.type) &&
    getInterval(m1.parsed.root, root) === 5
  ) {
    const isGlobalTonicTarget = isSamePitch(root, globalKey);
    if (isMajQuality) {
      numeral = "I";
      category = isGlobalTonicTarget ? "diatonic" : "secondary_dominant";
    } else if (isMinQuality && !isHalfDim) {
      const diffFromGlobal = getInterval(globalKey, root);
      if (!isGlobalMinor && diffFromGlobal === 2) {
        numeral = "ii";
        category = "diatonic";
      } else if (!isGlobalMinor && diffFromGlobal === 4) {
        numeral = "iii";
        category = "diatonic";
      } else if (!isGlobalMinor && diffFromGlobal === 9) {
        const precededByCompleteMinorIIV =
          m2?.parsed &&
          isHalfDimOrDimType(m2.parsed.type, m2.parsed.raw) &&
          getInterval(m2.parsed.root, m1.parsed.root) === 5;
        const goesToParallelDom =
          p1?.parsed &&
          isDominantQuality(p1.parsed.type) &&
          isSamePitch(root, p1.parsed.root);

        if (precededByCompleteMinorIIV && !goesToParallelDom) {
          numeral = "i";
        } else {
          numeral = "vi";
        }
        category = "diatonic";
      } else {
        numeral = "i";
        category = isGlobalTonicTarget ? "diatonic" : "secondary_dominant";
      }
    }
  }

  // === REGLA 6.5: SUBDOMINANTE IV DESPUÉS DE UN I LOCAL ===
  if (
    !numeral &&
    isMajQuality &&
    m1?.parsed &&
    isPureMajorTonicType(m1.parsed.type, m1.parsed.raw) &&
    getInterval(m1.parsed.root, root) === 5
  ) {
    numeral = "IV";
    category = "diatonic";
  }

  // === REGLA 6.8: TÓNICA EN TEMAS QUE INICIAN EN SU RELATIVO MENOR SIN CADENCIA vi-ii-V-I MAYOR ===
  if (
    !numeral &&
    !isGlobalMinor &&
    isPureMinorSeventhType(type, rawChord) &&
    getInterval(globalKey, root) === 9
  ) {
    const firstValidStr = allChords.find(
      (s) => s && s !== "%" && String(s).trim() !== ""
    );
    const firstP = firstValidStr ? parseChord(String(firstValidStr)) : null;
    if (firstP && isSamePitch(firstP.root, root)) {
      numeral = "i";
      category = "diatonic";
    }
  }

  // === REGLA 7: DOMINANTES SECUNDARIOS Y POR EXTENSIÓN ===
  if (!numeral && isDomQuality) {
    const resolutionRootOffset = (ROOT_MIDI_OFFSET_MAP[root] + 5) % 12;
    const globalKeyOffset = ROOT_MIDI_OFFSET_MAP[globalKey as RootNote];
    const isGlobalDominant = resolutionRootOffset === globalKeyOffset;

    if (isGlobalDominant) {
      category = "diatonic";
      numeral = "V7";
    } else {
      const resolutionRoot = Object.keys(ROOT_MIDI_OFFSET_MAP).find(
        (k) => ROOT_MIDI_OFFSET_MAP[k as RootNote] === resolutionRootOffset
      ) as RootNote;
      category = "secondary_dominant";
      const target = getSlashTarget(resolutionRoot, false);
      numeral = target ? `V7/${target}` : "V7";
    }
  }

  // === REGLA 8: DIATÓNICO / INTERCAMBIO MODAL ===
  if (!numeral) {
    const isDegreeIV = getInterval(globalKey, root) === 5;
    if (isDegreeIV && isMajQuality) {
      category = "diatonic";
      numeral = "IV";
    } else {
      const isDiatonic = classifyDiatonic(root, type, globalKey, isGlobalMinor);
      const isModal = classifyModalInterchange(
        root,
        type,
        globalKey,
        isGlobalMinor
      );
      if (isDiatonic) {
        category = "diatonic";
        numeral = getRomanNumeral(
          globalKey,
          root,
          type,
          isGlobalMinor,
          category
        );
      } else if (isModal) {
        category = "modal_interchange";
        numeral = getRomanNumeral(
          globalKey,
          root,
          type,
          isGlobalMinor,
          category
        );
      } else {
        category = "tonal_shift";
        numeral = getRomanNumeral(
          globalKey,
          root,
          type,
          isGlobalMinor,
          category
        );
      }
    }
  }

  // Solo etiquetar como IV si NO viene de resolver su propio V7 local (o ii - V7 local)
  if (
    numeral !== "I" &&
    (numeral.startsWith("IV") || getInterval(globalKey, root) === 5) &&
    isMajQuality &&
    !(
      m1?.parsed &&
      isDominantQuality(m1.parsed.type) &&
      getInterval(m1.parsed.root, root) === 5
    )
  ) {
    category = "diatonic";
    numeral = "IV";
  }

  let color = "border-slate-700";
  switch (category) {
    case "diatonic":
      color = "border-[#EA580B]";
      break;
    case "secondary_dominant":
      color = "border-yellow-500";
      break;
    case "tritone_substitute":
      color = "border-green-500";
      break;
    case "modal_interchange":
      color = "border-blue-500";
      break;
    case "tonal_shift":
      color = "border-purple-500";
      break;
    default:
      color = "border-slate-700";
  }

  // =========================================================================
  // SELECCIÓN INTELIGENTE DE ESCALA POR CONTEXTO DE COMPÁS
  // =========================================================================
  let suggestedScale = getSuggestedScale(
    root,
    type,
    globalKey,
    numeral,
    isGlobalMinor,
    p1?.parsed,
    category,
    m1?.parsed
  );

  const cleanNumeralBase = numeral.replace(/\s*\(IM\)/gi, "").trim();

  if (isPureDim && numeral.startsWith("vii°")) {
    suggestedScale = buildHarmonicMinorLeadingToneScale(
      root,
      resolvedDimTargetRoot
    );
  } else if (
    isPureMinorSeventhType(type, rawChord) &&
    (cleanNumeralBase === "ii" || cleanNumeralBase === "iv")
  ) {
    suggestedScale = buildExactScale(root, "Dórica", [0, 2, 3, 5, 7, 9, 10]);
  } else if (
    isPureMinorSeventhType(type, rawChord) &&
    cleanNumeralBase === "iii"
  ) {
    suggestedScale = buildExactScale(root, "Frigia", [0, 1, 3, 5, 7, 8, 10]);
  } else if (
    isPureMinorSeventhType(type, rawChord) &&
    (cleanNumeralBase === "vi" ||
      cleanNumeralBase === "i" ||
      cleanNumeralBase === "v")
  ) {
    suggestedScale = buildExactScale(root, "Eólica", [0, 2, 3, 5, 7, 8, 10]);
  } else if (isMajQuality && cleanNumeralBase === "IV") {
    suggestedScale = buildExactScale(root, "Lidia", [0, 2, 4, 6, 7, 9, 11]);
  } else if (
    isMajQuality &&
    (cleanNumeralBase === "I" || cleanNumeralBase === "bIII")
  ) {
    suggestedScale = buildExactScale(root, "Jónica", [0, 2, 4, 5, 7, 9, 11]);
  } else if (isMajQuality && cleanNumeralBase === "bVI") {
    suggestedScale = buildExactScale(root, "Lidia", [0, 2, 4, 6, 7, 9, 11]);
  }

  if (isDomQuality) {
    const precededByHalfDim =
      m1?.parsed &&
      isHalfDimOnly(m1.parsed.type, m1.parsed.raw) &&
      getInterval(m1.parsed.root, root) === 5;

    const precededByMajorII =
      m1?.parsed &&
      isPureMinorSeventhType(m1.parsed.type, m1.parsed.raw) &&
      getInterval(m1.parsed.root, root) === 5 &&
      numeral === "V7";

    const resolvesFourthUpToMajor =
      p1?.parsed &&
      isPureMajorTonicType(p1.parsed.type, p1.parsed.raw) &&
      getInterval(root, p1.parsed.root) === 5;

    const resolvesFourthUpToMinor =
      p1?.parsed &&
      isPureMinorSeventhType(p1.parsed.type, p1.parsed.raw) &&
      getInterval(root, p1.parsed.root) === 5;

    const nextMinorIsActuallyIIOfNextV =
      resolvesFourthUpToMinor &&
      p1?.parsed &&
      p2?.parsed &&
      isDominantQuality(p2.parsed.type) &&
      getInterval(p1.parsed.root, p2.parsed.root) === 5;

    const isSecondaryToMinorDegree = /\/(i|ii|iii|vi)$/i.test(numeral);

    if (numeral === "I7") {
      suggestedScale = buildExactScale(
        root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    } else if (
      /#11|b5/i.test(rawChord) ||
      category === "tritone_substitute" ||
      numeral.startsWith("subV") ||
      numeral === "bVII7" ||
      numeral === "V7/V" ||
      numeral === "IV7"
    ) {
      suggestedScale = buildExactScale(
        root,
        "Lidia b7",
        [0, 2, 4, 6, 7, 9, 10]
      );
    } else if (precededByMajorII && !/b9|#9|b13/i.test(rawChord)) {
      suggestedScale = buildExactScale(
        root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    } else if (
      precededByHalfDim ||
      isSecondaryToMinorDegree ||
      (resolvesFourthUpToMinor && !nextMinorIsActuallyIIOfNextV) ||
      /b9|#9|b13/i.test(rawChord)
    ) {
      suggestedScale = buildExactScale(
        root,
        "Frigia Dominante",
        [0, 1, 4, 5, 7, 8, 10],
        true
      );
    } else if (resolvesFourthUpToMajor) {
      suggestedScale = buildExactScale(
        root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    }
  }

  return {
    romanNumeral: numeral,
    category,
    color,
    isMinorKey: isGlobalMinor,
    keyContext: globalKey,
    suggestedScale,
  };
}

export function analyzeSongHarmony(
  contexts: ChordInputContext[]
): AnalyzedChord[] {
  if (contexts.length === 0) return [];

  const allChords = contexts.map((c) => {
    const raw = c.chordString as any;
    return typeof raw === "string"
      ? raw
      : raw?.chordName || raw?.name || raw?.text || "";
  });

  const validChords = allChords.filter(
    (s) => s && s !== "%" && s.trim() !== ""
  );
  const rawKey = contexts[0]?.keyContext || "C";
  const cleanSongKey = rawKey.replace(/m|-|min/gi, "").trim() as RootNote;
  const songTonicKey = (
    cleanSongKey in ROOT_MIDI_OFFSET_MAP ? cleanSongKey : "C"
  ) as RootNote;
  let autoDetectedMinor = Boolean(
    contexts[0]?.isMinorKey || /m|-|min/i.test(rawKey)
  );

  if (!autoDetectedMinor && validChords.length > 0) {
    const firstParsed = parseChord(validChords[0]);
    const lastParsed = parseChord(validChords[validChords.length - 1]);

    const isFirstMinorTonic =
      isMinorQuality(firstParsed.type) &&
      ROOT_MIDI_OFFSET_MAP[firstParsed.root] ===
        ROOT_MIDI_OFFSET_MAP[songTonicKey];
    const isLastMinorTonic =
      isMinorQuality(lastParsed.type) &&
      ROOT_MIDI_OFFSET_MAP[lastParsed.root] ===
        ROOT_MIDI_OFFSET_MAP[songTonicKey];

    if (isFirstMinorTonic || isLastMinorTonic) {
      autoDetectedMinor = true;
    }
  }

  const results: AnalyzedChord[] = [];

  for (let i = 0; i < contexts.length; i++) {
    const c = contexts[i];
    const rawChordStr = (allChords[i] || "").trim();
    const isSimile = rawChordStr === "%";

    const rawContextKey = c.keyContext || "C";
    const cleanKey = rawContextKey.replace(/m|-|min/gi, "").trim() as RootNote;
    const isContextExplicitMinor = Boolean(
      c.isMinorKey || /m|-|min/i.test(rawContextKey)
    );
    const effectiveIsMinor =
      isContextExplicitMinor ||
      (autoDetectedMinor &&
        ROOT_MIDI_OFFSET_MAP[cleanKey] === ROOT_MIDI_OFFSET_MAP[songTonicKey]);
    const keyContextStr = cleanKey + (effectiveIsMinor ? "m" : "");

    if (isSimile) {
      let inheritedAnalysis: AnalyzedChord | null = null;
      for (let k = i - 1; k >= 0; k--) {
        if (results[k] && results[k].root && results[k].type) {
          inheritedAnalysis = results[k];
          break;
        }
      }

      if (inheritedAnalysis) {
        results.push({
          chordString: "%",
          root: inheritedAnalysis.root,
          type: inheritedAnalysis.type,
          keyContext: inheritedAnalysis.keyContext,
          isMinorKey: inheritedAnalysis.isMinorKey,
          romanNumeral: inheritedAnalysis.romanNumeral,
          category: inheritedAnalysis.category,
          color: inheritedAnalysis.color,
          suggestedScale: inheritedAnalysis.suggestedScale,
        });
        continue;
      }
    }

    const { root, type } = parseChord(rawChordStr);
    const analysis = analyzeChord(rawChordStr, i, allChords, keyContextStr);

    results.push({
      chordString: rawChordStr,
      root,
      type,
      keyContext: cleanKey,
      isMinorKey: effectiveIsMinor,
      romanNumeral: analysis.romanNumeral || "-",
      category: analysis.category as AnalysisCategory,
      color: analysis.color,
      suggestedScale: analysis.suggestedScale,
    });
  }

  for (let i = 1; i < results.length; i++) {
    if (results[i].chordString === "%") {
      const prev = results[i - 1];
      if (prev) {
        results[i].root = prev.root;
        results[i].type = prev.type;
        results[i].keyContext = prev.keyContext;
        results[i].isMinorKey = prev.isMinorKey;
        results[i].romanNumeral = prev.romanNumeral;
        results[i].category = prev.category;
        results[i].color = prev.color;
        results[i].suggestedScale = prev.suggestedScale;
      }
    }
  }

  return results;
}

export const getHarmonicFunctionClasses = (
  harmonicFunction: string | undefined | null
) => {
  const func = harmonicFunction?.toLowerCase().trim();

  switch (func) {
    case "diatonic":
    case "diatónico":
    case "tonic":
    case "subdominant":
    case "dominant":
      return {
        border: "border-[#EA580B]",
        text: "text-[#EA580B]",
        bg: "border border-[#EA580B] bg-neutral-900 hover:bg-neutral-800",
      };

    case "secondary_dominant":
    case "secondary-dominant":
    case "dominante-secundario":
    case "secondary":
      return {
        border: "border-yellow-500/50",
        text: "text-yellow-500",
        bg: "bg-yellow-500/10 ring-1 ring-yellow-500/40 hover:bg-yellow-500/20",
      };

    case "tritone_substitute":
    case "tritone-sub":
    case "sustituto-tritonal":
    case "subv":
      return {
        border: "border-green-500/50",
        text: "text-green-500",
        bg: "bg-green-500/10 ring-1 ring-green-500/40 hover:bg-green-500/20",
      };

    case "modal_interchange":
    case "intercambio-modal":
    case "im":
      return {
        border: "border-blue-500/50",
        text: "text-blue-500",
        bg: "bg-blue-500/10 ring-1 ring-blue-500/40 hover:bg-blue-500/20",
      };

    case "tonal_shift":
      return {
        border: "border-purple-500/50",
        text: "text-purple-500",
        bg: "bg-purple-500/10 ring-1 ring-purple-500/40 hover:bg-purple-500/20",
      };

    default:
      return {
        border: "border-zinc-700",
        text: "text-zinc-500",
        bg: "hover:bg-zinc-850",
      };
  }
};

// ============================================================================
// MOTOR PEDAGÓGICO DE EXPLICACIÓN ARMÓNICA (PARA POP-UP INTERACTIVO)
// ============================================================================

export interface HarmonicExplanation {
  titleEs: string;
  titleEn: string;
  badgeEs: string;
  badgeEn: string;
  badgeColorClass: string;
  summaryEs: string;
  summaryEn: string;
  resolutionEs: string;
  resolutionEn: string;
  improvisationTipEs: string;
  improvisationTipEn: string;
  formulaOrConcept: string;
}

const PITCH_TO_FLAT_NAME: Record<number, RootNote> = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "Gb",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

function getNoteAtSemitoneInterval(root: RootNote, semitones: number): RootNote {
  const base = ROOT_MIDI_OFFSET_MAP[root] ?? 0;
  const target = (((base + semitones) % 12) + 12) % 12;
  return PITCH_TO_FLAT_NAME[target] || "C";
}

export function buildHarmonicExplanation(params: {
  chordString: string;
  romanNumeral: string;
  category: string;
  keyContext: RootNote;
  isMinorKey: boolean;
  suggestedScaleName?: string;
  prevChordString?: string | null;
  nextChordString?: string | null;
}): HarmonicExplanation {
  const {
    chordString,
    romanNumeral,
    category,
    keyContext,
    isMinorKey,
    suggestedScaleName,
    prevChordString,
    nextChordString,
  } = params;

  const cleanChord = (chordString || "C").trim();
  const parsed = parseChord(cleanChord);
  const root = parsed.root || "C";
  const num = (romanNumeral || "I").trim();
  const cleanNumBase = num.replace(/\s*\(IM\)/gi, "").trim();
  const keyLabel = `${keyContext} ${isMinorKey ? "Menor" : "Mayor"}`;
  const keyLabelEn = `${keyContext} ${isMinorKey ? "Minor" : "Major"}`;
  const scaleLabel = suggestedScaleName || `${root} Dórica`;

  const nextParsed =
    nextChordString && nextChordString !== "%"
      ? parseChord(nextChordString)
      : null;
  const prevParsed =
    prevChordString && prevChordString !== "%"
      ? parseChord(prevChordString)
      : null;

  // 1. SUSTITUTO TRITONAL (subV7 o subV7/x)
  if (
    category === "tritone_substitute" ||
    cleanNumBase.toLowerCase().startsWith("subv")
  ) {
    const replacedDomRoot = getNoteAtSemitoneInterval(root, 6);
    const thirdNote = getNoteAtSemitoneInterval(root, 4);
    const seventhNote = getNoteAtSemitoneInterval(root, 10);
    const targetName = nextChordString || getNoteAtSemitoneInterval(root, 11);

    return {
      titleEs: `Sustituto Tritonal (${num})`,
      titleEn: `Tritone Substitute (${num})`,
      badgeEs: "Sustitución Tritonal",
      badgeEn: "Tritone Sub",
      badgeColorClass:
        "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      formulaOrConcept: `${cleanChord} ⇄ ${replacedDomRoot}7 (Mismo tritono: ${thirdNote} y ${seventhNote})`,
      summaryEs: `El acorde ${cleanChord} sustituye al dominante original (${replacedDomRoot}7) porque ambos comparten exactamente las mismas notas guía (el tritono entre ${thirdNote} y ${seventhNote}, donde la 3ª y la 7ª se invierten).`,
      summaryEn: `${cleanChord} replaces the original dominant (${replacedDomRoot}7) because both share the exact same tritone (${thirdNote} and ${seventhNote}).`,
      resolutionEs: `Resuelve un semitono cromático hacia abajo hacia ${targetName}, creando una línea de bajo descendente muy suave y característica del Jazz y Neo-Soul.`,
      resolutionEn: `Resolves a half-step down into ${targetName}, creating a smooth chromatic bass line.`,
      improvisationTipEs: `Usa la escala ${scaleLabel} (4º modo de la menor melódica). Destaca la #11 (${replacedDomRoot}), que es la fundamental del dominante sustituido.`,
      improvisationTipEn: `Use ${scaleLabel} (4th mode of Melodic Minor), highlighting the #11 (${replacedDomRoot}).`,
    };
  }

  // 2. ACORDE DISMINUIDO DE PASO / SENSIBLE SECUNDARIA (vii° o vii°/x)
  if (cleanNumBase.startsWith("vii°") || cleanNumBase.includes("°")) {
    const targetDegree = cleanNumBase.includes("/")
      ? cleanNumBase.split("/")[1]
      : "acorde objetivo";
    const equivalentDomRoot = getNoteAtSemitoneInterval(root, 8);
    const targetChordLabel =
      nextChordString || getNoteAtSemitoneInterval(root, 1);

    return {
      titleEs: `Disminuido de Sensible Secundaria (${num})`,
      titleEn: `Secondary Leading-Tone Diminished (${num})`,
      badgeEs: "Función Dominante / Paso Cromático",
      badgeEn: "Secondary Diminished",
      badgeColorClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      formulaOrConcept: `${cleanChord} = ${equivalentDomRoot}7b9 (sin fundamental) → ${targetChordLabel}`,
      summaryEs: `El acorde ${cleanChord} funciona como un dominante secundario ${equivalentDomRoot}7b9 sin su nota raíz. Su estructura simétrica por terceras menores genera una fuerte atracción cromática hacia el grado ${targetDegree} (${targetChordLabel}).`,
      summaryEn: `${cleanChord} acts as a rootless ${equivalentDomRoot}7b9 secondary dominant pulling chromatically toward ${targetChordLabel}.`,
      resolutionEs: `Conduce las voces por semitono hacia ${targetChordLabel} (en la tonalidad de ${keyLabel}), aumentando la tensión armónica antes de aterrizar en el acorde destino.`,
      resolutionEn: `Leads voices chromatically by half-step into ${targetChordLabel}.`,
      improvisationTipEs: `Improvisa con la escala ${scaleLabel} o arpegios disminuidos simétricos (puedes repetir cualquier dibujo melódico cada 3 semitonos).`,
      improvisationTipEn: `Improvise using ${scaleLabel} or symmetric diminished arpeggios moved in minor thirds.`,
    };
  }

  // 3. DOMINANTES POR EXTENSIÓN Y DOMINANTES SECUNDARIOS (V7/ii, V7/V, V7/vi, V7)
  if (category === "secondary_dominant" && isDominantQuality(parsed.type)) {
    const nextIsAlsoDomFourthUp =
      nextParsed &&
      isDominantQuality(nextParsed.type) &&
      getInterval(root, nextParsed.root) === 5;
    const prevWasDomFourthBelow =
      prevParsed &&
      isDominantQuality(prevParsed.type) &&
      getInterval(prevParsed.root, root) === 5;

    const targetDegree = cleanNumBase.includes("/")
      ? cleanNumBase.split("/")[1]
      : "acorde objetivo";
    const targetChordLabel =
      nextChordString || getNoteAtSemitoneInterval(root, 5);

    if (nextIsAlsoDomFourthUp || prevWasDomFourthBelow) {
      return {
        titleEs: `Dominante por Extensión / Secundario (${num})`,
        titleEn: `Extended / Secondary Dominant (${num})`,
        badgeEs: "Cadena de Dominantes (Ciclo de 5tas)",
        badgeEn: "Extended Dominant Chain",
        badgeColorClass:
          "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
        formulaOrConcept: `Ciclo de Cuartas: ${
          prevChordString ? `${prevChordString} → ` : ""
        }${cleanChord} → ${targetChordLabel}`,
        summaryEs: `El acorde ${cleanChord} (${num}) forma parte de una cadena de Dominantes por Extensión en ${keyLabel}. En lugar de resolver de inmediato a un acorde diatónico estable, impulsa la armonía por ciclo de cuartas justas hacia ${targetChordLabel}.`,
        summaryEn: `${cleanChord} (${num}) is part of an Extended Dominant chain moving around the circle of fifths toward ${targetChordLabel}.`,
        resolutionEs: `Su tercera mayor (${getNoteAtSemitoneInterval(
          root,
          4
        )}) actúa como sensible temporal que resuelve hacia la séptima de ${targetChordLabel}.`,
        resolutionEn: `Its major third (${getNoteAtSemitoneInterval(
          root,
          4
        )}) acts as a temporary leading tone into ${targetChordLabel}.`,
        improvisationTipEs: `Utiliza ${scaleLabel}. Conecta las notas guía (3ª y b7ª) de cada dominante descendiendo por semitonos entre un compás y el siguiente.`,
        improvisationTipEn: `Use ${scaleLabel} and connect guide tones (3rd and b7th) chromatically down.`,
      };
    }

    return {
      titleEs: `Dominante Secundario (${num})`,
      titleEn: `Secondary Dominant (${num})`,
      badgeEs: "Dominante Secundario",
      badgeEn: "Secondary Dominant",
      badgeColorClass: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
      formulaOrConcept: `${cleanChord} (${num}) → Tonicaliza temporalmente a ${targetChordLabel} (${targetDegree})`,
      summaryEs: `El acorde ${cleanChord} no pertenece originalmente a la escala de ${keyLabel}, sino que se toma prestado para actuar como el "Quinto Grado" (V7) propio del grado ${targetDegree} (${targetChordLabel}).`,
      summaryEn: `${cleanChord} is a non-diatonic dominant chord that tonicizes ${targetChordLabel} (${targetDegree}).`,
      resolutionEs: `Resuelve una cuarta justa hacia arriba (o quinta abajo) hacia ${targetChordLabel}, dándole peso de tónica momentánea.`,
      resolutionEn: `Resolves a perfect fourth up into ${targetChordLabel}.`,
      improvisationTipEs: `Se recomienda la escala ${scaleLabel}, la cual anticipa el color menor o mayor del acorde destino (${targetChordLabel}).`,
      improvisationTipEn: `Improvise with ${scaleLabel} to anticipate the quality of ${targetChordLabel}.`,
    };
  }

  // 4. SEGUNDO RELATIVO SECUNDARIO (ii o iiø antes de un Dominante Secundario)
  if (
    category === "secondary_dominant" &&
    (cleanNumBase === "ii" || cleanNumBase === "iiø")
  ) {
    const pairedDom =
      nextChordString || `${getNoteAtSemitoneInterval(root, 5)}7`;
    const targetKeyRoot = getNoteAtSemitoneInterval(root, 10);

    return {
      titleEs: `Segundo Relativo Secundario (${num} de ii-V)`,
      titleEn: `Related II Chord (${num} in Secondary ii-V)`,
      badgeEs: "Pareja Cadencial ii - V Secundaria",
      badgeEn: "Secondary ii - V",
      badgeColorClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      formulaOrConcept: `[ ${cleanChord} (${num}) → ${pairedDom} (V7) ] hacia ${targetKeyRoot}`,
      summaryEs: `El acorde ${cleanChord} actúa como el "Segundo Grado" (subdominante local) que precede al dominante ${pairedDom}, formando una cadencia ii - V secundaria orientada hacia el centro de ${targetKeyRoot}.`,
      summaryEn: `${cleanChord} functions as the local ii chord preceding ${pairedDom} in a secondary ii-V cadence toward ${targetKeyRoot}.`,
      resolutionEs: `Prepara suavemente la llegada del dominante ${pairedDom} a distancia de cuarta justa.`,
      resolutionEn: `Prepares the arrival of ${pairedDom} a fourth above.`,
      improvisationTipEs: `Emplea ${scaleLabel}. Puedes tratar toda la célula [ ${cleanChord} → ${pairedDom} ] pensando en el centro tonal local de ${targetKeyRoot}.`,
      improvisationTipEn: `Use ${scaleLabel}, treating the [${cleanChord} → ${pairedDom}] cell in the local key of ${targetKeyRoot}.`,
    };
  }

  // 5. INTERCAMBIO MODAL (IM) Y BACKDOOR DOMINANT
  if (
    category === "modal_interchange" ||
    num.includes("(IM)") ||
    cleanNumBase === "bVII7" ||
    cleanNumBase === "IV7"
  ) {
    if (cleanNumBase === "bVII7") {
      return {
        titleEs: `Dominante Backdoor / Intercambio Modal (${num})`,
        titleEn: `Backdoor Dominant (${num})`,
        badgeEs: "Intercambio Modal · Cadencia Backdoor",
        badgeEn: "Modal Interchange · Backdoor",
        badgeColorClass: "bg-sky-500/15 text-sky-300 border-sky-500/40",
        formulaOrConcept: `iv7 → ${cleanChord} (bVII7) → ${keyContext}maj7 (I)`,
        summaryEs: `El acorde ${cleanChord} (bVII7) proviene del modo menor paralelo (${keyContext} Eólico) y actúa como el famoso "Backdoor Dominant" del Jazz: entra a la tónica ${keyContext} por la "puerta trasera" (un tono completo abajo) en lugar de usar el V7 tradicional.`,
        summaryEn: `${cleanChord} (bVII7) is borrowed from ${keyContext} parallel minor and resolves up a whole step into the tonic.`,
        resolutionEs: `Suele resolver un tono arriba hacia ${keyContext}maj7 o conectar suavemente entre grados de intercambio modal.`,
        resolutionEn: `Typically resolves a whole step up into ${keyContext}maj7.`,
        improvisationTipEs: `La escala ideal es ${scaleLabel} (Lidia b7), que conserva las notas de la subdominante menor (${getNoteAtSemitoneInterval(
          keyContext,
          5
        )}m6).`,
        improvisationTipEn: `Use ${scaleLabel} (Lydian Dominant), outlining the minor subdominant color.`,
      };
    }

    if (cleanNumBase === "IV7") {
      return {
        titleEs: `Subdominante de Blues (${num})`,
        titleEn: `Blues Subdominant (${num})`,
        badgeEs: "Armonía de Blues / Mixolidia",
        badgeEn: "Blues Harmony",
        badgeColorClass: "bg-sky-500/15 text-sky-300 border-sky-500/40",
        formulaOrConcept: `I7 (${keyContext}7) → IV7 (${cleanChord})`,
        summaryEs: `En el lenguaje del Blues y Soul-Jazz en ${keyLabel}, el cuarto grado (${cleanChord}) adopta estructura de acorde dominante con b7 (${getNoteAtSemitoneInterval(
          root,
          10
        )}), aportando la "Blue Note" b3 de la tonalidad principal.`,
        summaryEn: `In Blues harmony, the IV chord (${cleanChord}) is a dominant 7th chord containing the b3 blue note of ${keyContext}.`,
        resolutionEs: `Regresa a la tónica ${keyContext}7 o pasa por el disminuido cromático #iv°7.`,
        resolutionEn: `Returns to the tonic ${keyContext}7 or moves through #iv°7.`,
        improvisationTipEs: `Usa ${scaleLabel} o combina la escala de Blues de ${keyContext} enfatizando la b7 de ${cleanChord} (${getNoteAtSemitoneInterval(
          root,
          10
        )}).`,
        improvisationTipEn: `Use ${scaleLabel} or the ${keyContext} Blues scale.`,
      };
    }

    const parallelModeSource =
      cleanNumBase === "v" ||
      cleanNumBase === "bIII" ||
      cleanNumBase === "bVI" ||
      cleanNumBase === "bVII" ||
      cleanNumBase === "iv"
        ? `${keyContext} Eólico (Menor Natural)`
        : `${keyContext} Menor Paralelo`;

    return {
      titleEs: `Intercambio Modal (${num})`,
      titleEn: `Modal Interchange (${num})`,
      badgeEs: "Préstamo Modal (Modo Paralelo)",
      badgeEn: "Modal Interchange",
      badgeColorClass: "bg-sky-500/15 text-sky-300 border-sky-500/40",
      formulaOrConcept: `Tomado prestado de ${parallelModeSource}`,
      summaryEs: `El acorde ${cleanChord} (${cleanNumBase}) es un préstamo armónico tomado de ${parallelModeSource} mientras estamos en la tonalidad de ${keyLabel}. Aporta un color cálido, nostálgico y moderno muy característico del Jazz, Bossa Nova y Neo-Soul.`,
      summaryEn: `${cleanChord} (${cleanNumBase}) is borrowed from ${parallelModeSource}, adding a rich modal color to ${keyLabelEn}.`,
      resolutionEs: `Puede resolver hacia la tónica ${keyContext}, enlazar con otros acordes prestados (${
        nextChordString || "bIII / bVII / iv"
      }) o conducir hacia el dominante.`,
      resolutionEn: `Can resolve to ${keyContext} or flow into neighboring modal chords.`,
      improvisationTipEs: `Improvisa con ${scaleLabel}, respetando las notas propias del modo paralelo de ${keyContext} menor.`,
      improvisationTipEn: `Improvise using ${scaleLabel}, matching the parallel minor mode of ${keyContext}.`,
    };
  }

  // 6. DESPLAZAMIENTO TONAL / MODULACIÓN (tonal_shift)
  if (category === "tonal_shift") {
    return {
      titleEs: `Desplazamiento Tonal / Modulación (${num})`,
      titleEn: `Tonal Shift / Modulation (${num})`,
      badgeEs: "Giro Tonal / Modulación",
      badgeEn: "Tonal Shift",
      badgeColorClass: "bg-purple-500/15 text-purple-300 border-purple-500/40",
      formulaOrConcept: `Centro local temporal sobre ${cleanChord}`,
      summaryEs: `El acorde ${cleanChord} introduce un desplazamiento del centro tonal fuera de la escala diatónica de ${keyLabel}, creando contraste armónico (típico de puentes en forma AABA o estándares Post-Bop).`,
      summaryEn: `${cleanChord} shifts the tonal center away from ${keyLabelEn}.`,
      resolutionEs: `Conecta hacia ${
        nextChordString || "el siguiente centro tonal"
      } siguiendo la conducción de voces interna.`,
      resolutionEn: `Connects smoothly into ${nextChordString || "the next chord"}.`,
      improvisationTipEs: `Apóyate en la escala ${scaleLabel} centrada directamente sobre las notas del acorde ${cleanChord}.`,
      improvisationTipEn: `Center your phrasing on ${scaleLabel}.`,
    };
  }

  // 7. GRADOS DIATÓNICOS (I, I7, ii, iii, IV, V7, vi, viiø)
  const diatonicRoleMap: Record<
    string,
    { roleEs: string; roleEn: string; descEs: string; descEn: string }
  > = {
    I: {
      roleEs: "Tónica Mayor (Reposo / Resolución Cadencial)",
      roleEn: "Major Tonic (Primary Rest / Cadential Resolution)",
      descEs: `Funciona como acorde de resolución tonal (I) después de su dominante V7 o como centro gravitacional principal.`,
      descEn: `Acts as the tonic resolution (I) following its dominant V7 or as the primary center of stability.`,
    },
    I7: {
      roleEs: "Tónica Dominante de Blues",
      roleEn: "Blues Dominant Tonic",
      descEs: `Funciona como acorde de tónica estable en ${keyLabel}, pero con séptima menor (b7) característica del lenguaje del Blues y Funk.`,
      descEn: `Acts as the tonic in ${keyLabelEn} with a dominant b7 Blues color.`,
    },
    i: {
      roleEs: "Tónica Menor (Centro Tonal)",
      roleEn: "Minor Tonic",
      descEs: `Es el acorde de reposo principal dentro de la tonalidad de ${keyLabel}.`,
      descEn: `Primary tonic chord in ${keyLabelEn}.`,
    },
    ii: {
      roleEs: "Subdominante Menor (Segundo Grado Cadencial)",
      roleEn: "Supertonic / Subdominant Minor (ii)",
      descEs: `Es el pilar subdominante del Jazz en ${keyLabel}. Prepara de forma natural la llegada del dominante V7 en la cadencia fundamental ii - V - I.`,
      descEn: `Core subdominant chord in ${keyLabelEn}, setting up the V7 in a ii-V-I cadence.`,
    },
    iiø: {
      roleEs: "Subdominante Semidisminuido (iiø en Menor)",
      roleEn: "Half-Diminished Supertonic (iiø)",
      descEs: `Segundo grado diatónico del modo menor. Su quinta disminuida genera la tensión característica que impulsa al V7b9 en las cadencias menores iiø - V7 - i.`,
      descEn: `Diatonic second degree in minor keys, leading into V7b9.`,
    },
    iii: {
      roleEs: "Mediante (Extensión de Tónica)",
      roleEn: "Mediant (Tonic Extension)",
      descEs: `Comparte 3 notas con el acorde de tónica (${keyContext}maj7), por lo que funciona como un sustituto suave de tónica o puente hacia el vi (${getNoteAtSemitoneInterval(
        keyContext,
        9
      )}m7).`,
      descEn: `Shares 3 notes with ${keyContext}maj7, acting as a tonic extension.`,
    },
    IV: {
      roleEs: "Subdominante Principal",
      roleEn: "Primary Subdominant (IV)",
      descEs: `Abre el espacio armónico alejándose de la tónica en ${keyLabel} con luminosidad (función subdominante).`,
      descEn: `Primary subdominant chord moving away from the tonic in ${keyLabelEn}.`,
    },
    V7: {
      roleEs: "Dominante Principal (Tensión Cadencial)",
      roleEn: "Primary Dominant (V7)",
      descEs: `Contiene el tritono que exige resolución una cuarta justa arriba. Es el motor de tensión-reposo de la armonía tonal.`,
      descEn: `Primary dominant chord containing the tritone that resolves a fourth up.`,
    },
    vi: {
      roleEs: "Submediante / Relativo Menor (Función Tónica)",
      roleEn: "Submediant / Relative Minor (vi)",
      descEs: `Es el relativo menor dentro de ${keyLabel}. Funciona como sustituto de tónica y suele iniciar progresiones circulares vi - ii - V7 - I.`,
      descEn: `Relative minor in ${keyLabelEn}, often starting vi-ii-V-I progressions.`,
    },
  };

  const roleInfo = diatonicRoleMap[cleanNumBase] || {
    roleEs: `Grado Diatónico (${num})`,
    roleEn: `Diatonic Degree (${num})`,
    descEs: `Acorde perteneciente a la estructura armónica natural de ${keyLabel}.`,
    descEn: `Diatonic chord belonging to ${keyLabelEn}.`,
  };

  return {
    titleEs: `${roleInfo.roleEs} · ${num}`,
    titleEn: `${roleInfo.roleEn} · ${num}`,
    badgeEs: "Armonía Diatónica / Cadencial",
    badgeEn: "Diatonic / Cadential Harmony",
    badgeColorClass: "bg-[#f25100]/15 text-[#ff8547] border-[#f25100]/40",
    formulaOrConcept: `Grado ${num} en el contexto de ${keyLabel}`,
    summaryEs: `El acorde ${cleanChord} actúa como ${num}. ${roleInfo.descEs}`,
    summaryEn: `${cleanChord} acts as ${num}. ${roleInfo.descEn}`,
    resolutionEs: nextChordString
      ? `En esta progresión enlaza hacia ${nextChordString} manteniendo la cohesión tonal.`
      : `Mantiene la estabilidad dentro del centro tonal.`,
    resolutionEn: nextChordString
      ? `Progresses into ${nextChordString}.`
      : `Maintains tonal stability.`,
    improvisationTipEs: `Improvisa utilizando la escala ${scaleLabel}, descansando sobre las notas del arpegio de ${cleanChord} (1ª, 3ª, 5ª y 7ª).`,
    improvisationTipEn: `Improvise with ${scaleLabel}, targeting the chord tones of ${cleanChord}.`,
  };
}