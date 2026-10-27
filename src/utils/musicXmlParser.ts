import { SongMeasure, MelodyNote } from "../types";

const STEP_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const FIFTHS_TO_MAJOR_KEY: Record<number, string> = {
  [-7]: "Cb",
  [-6]: "Gb",
  [-5]: "Db",
  [-4]: "Ab",
  [-3]: "Eb",
  [-2]: "Bb",
  [-1]: "F",
  0: "C",
  1: "G",
  2: "D",
  3: "A",
  4: "E",
  5: "B",
  6: "F#",
  7: "C#",
};

const FIFTHS_TO_MINOR_KEY: Record<number, string> = {
  [-7]: "Ab",
  [-6]: "Eb",
  [-5]: "Bb",
  [-4]: "F",
  [-3]: "C",
  [-2]: "G",
  [-1]: "D",
  0: "A",
  1: "E",
  2: "B",
  3: "F#",
  4: "C#",
  5: "G#",
  6: "D#",
  7: "A#",
};

const MAJOR_KEY_TO_FIFTHS: Record<string, number> = {
  Cb: -7,
  Gb: -6,
  Db: -5,
  Ab: -4,
  Eb: -3,
  Bb: -2,
  F: -1,
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
};

const MINOR_KEY_TO_FIFTHS: Record<string, number> = {
  Ab: -7,
  Eb: -6,
  Bb: -5,
  F: -4,
  C: -3,
  G: -2,
  D: -1,
  A: 0,
  E: 1,
  B: 2,
  "F#": 3,
  "C#": 4,
  "G#": 5,
  "D#": 6,
  "A#": 7,
};

function normalizeEnharmonicRoot(note: string): number {
  const map: Record<string, number> = {
    C: 0,
    "B#": 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    F: 5,
    "E#": 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
  };
  return map[note] ?? -1;
}

function getChordRootAndQuality(chordStr: string): {
  root: string;
  semi: number;
  isMinorTonic: boolean;
  isDom7: boolean;
  isHalfDim: boolean;
} {
  const clean = String(chordStr || "")
    .trim()
    .split("/")[0];
  const m = clean.match(/^([A-G][#b]?)(.*)$/);
  if (!m) {
    return {
      root: "C",
      semi: 0,
      isMinorTonic: false,
      isDom7: false,
      isHalfDim: false,
    };
  }
  const root = m[1];
  const suffix = m[2].trim();
  const lower = suffix.toLowerCase();
  const semi = normalizeEnharmonicRoot(root);

  const isHalfDim =
    lower.includes("m7b5") ||
    lower.includes("-7b5") ||
    lower.includes("ø") ||
    lower.startsWith("dim");

  const isMinorTonic =
    !isHalfDim &&
    (lower.startsWith("m") || lower.startsWith("-")) &&
    !lower.startsWith("maj");

  const isDom7 =
    !isMinorTonic &&
    !isHalfDim &&
    !lower.includes("maj") &&
    !suffix.includes("Δ") &&
    /^(7|9|11|13|alt)/.test(lower);

  return { root, semi, isMinorTonic, isDom7, isHalfDim };
}

function formatNoteStepAlter(step: string, alter: number): string {
  if (alter === 1) return `${step}#`;
  if (alter === -1) return `${step}b`;
  if (alter === 2) return `${step}##`;
  if (alter === -2) return `${step}bb`;
  return step;
}

function parseHarmonyElement(harmonyEl: Element): string {
  const rootStep =
    harmonyEl.querySelector("root > root-step")?.textContent?.trim() || "C";
  const rootAlter = parseInt(
    harmonyEl.querySelector("root > root-alter")?.textContent?.trim() || "0",
    10
  );
  const rootName = formatNoteStepAlter(
    rootStep,
    isNaN(rootAlter) ? 0 : rootAlter
  );

  const kindEl = harmonyEl.querySelector("kind");
  const kindVal = (kindEl?.textContent || "").trim().toLowerCase();
  const kindTextAttr = (kindEl?.getAttribute("text") || "").trim();

  const degreeEls = Array.from(harmonyEl.querySelectorAll("degree"));
  let hasFlat5 = false;
  let hasSharp5 = false;
  let extraTensions = "";

  for (const deg of degreeEls) {
    const val = parseInt(
      deg.querySelector("degree-value")?.textContent?.trim() || "0",
      10
    );
    const alt = parseInt(
      deg.querySelector("degree-alter")?.textContent?.trim() || "0",
      10
    );
    const dType =
      deg.querySelector("degree-type")?.textContent?.trim().toLowerCase() || "";
    if (val === 5 && alt === -1) hasFlat5 = true;
    else if (val === 5 && alt === 1) hasSharp5 = true;
    else if (val === 9 && alt === -1) extraTensions += "b9";
    else if (val === 9 && alt === 1) extraTensions += "#9";
    else if (val === 11 && alt === 1) extraTensions += "#11";
    else if (val === 13 && alt === -1) extraTensions += "b13";
    else if (dType === "add" && val > 0) {
      const prefix = alt === 1 ? "#" : alt === -1 ? "b" : "";
      extraTensions += `${prefix}${val}`;
    }
  }

  let quality = "";
  if (
    kindVal === "half-diminished" ||
    (kindVal === "minor-seventh" && hasFlat5)
  ) {
    quality = "m7b5";
  } else if (kindVal === "minor-seventh") {
    quality = "m7";
  } else if (kindVal === "minor" || kindVal === "minor-triad") {
    quality = "m";
  } else if (kindVal === "minor-sixth") {
    quality = "m6";
  } else if (kindVal === "minor-ninth") {
    quality = "m9";
  } else if (kindVal === "minor-11th") {
    quality = "m11";
  } else if (kindVal === "minor-major") {
    quality = "m(maj7)";
  } else if (kindVal === "major-seventh") {
    quality = "maj7";
  } else if (kindVal === "major-ninth") {
    quality = "maj9";
  } else if (kindVal === "major-sixth") {
    quality = kindTextAttr.includes("9") ? "6(9)" : "6";
  } else if (kindVal === "dominant") {
    quality = "7";
  } else if (kindVal === "dominant-ninth") {
    quality = "9";
  } else if (kindVal === "dominant-11th") {
    quality = "9sus4";
  } else if (kindVal === "dominant-13th") {
    quality = "13";
  } else if (kindVal === "diminished" || kindVal === "diminished-seventh") {
    quality = "dim7";
  } else if (kindVal === "augmented" || kindVal === "augmented-seventh") {
    quality = kindVal.includes("seventh") ? "7#5" : "aug";
  } else if (kindVal === "suspended-fourth") {
    quality = kindTextAttr.includes("7") ? "7sus4" : "sus4";
  } else if (kindTextAttr) {
    quality = kindTextAttr
      .replace(/^min7$/i, "m7")
      .replace(/^min$/i, "m")
      .replace(/^maj7$/i, "maj7");
  }

  if (quality === "7" && hasFlat5 && !extraTensions.includes("b5")) {
    quality = "7b5";
  } else if (quality === "7" && hasSharp5 && !extraTensions.includes("#5")) {
    quality = "7#5";
  }

  let fullChord = `${rootName}${quality}${extraTensions}`;

  const bassStep = harmonyEl
    .querySelector("bass > bass-step")
    ?.textContent?.trim();
  if (bassStep) {
    const bassAlter = parseInt(
      harmonyEl.querySelector("bass > bass-alter")?.textContent?.trim() || "0",
      10
    );
    const bassName = formatNoteStepAlter(
      bassStep,
      isNaN(bassAlter) ? 0 : bassAlter
    );
    if (bassName && bassName !== rootName) {
      fullChord += `/${bassName}`;
    }
  }

  return fullChord;
}

function detectTrueJazzKey(
  fifths: number,
  xmlMode: string,
  measures: SongMeasure[]
): { key: string; isMinor: boolean } {
  const majorKey = FIFTHS_TO_MAJOR_KEY[fifths] || "C";
  const relativeMinorKey = FIFTHS_TO_MINOR_KEY[fifths] || "A";

  if (xmlMode === "minor") {
    return { key: relativeMinorKey, isMinor: true };
  }

  const majorSemi = normalizeEnharmonicRoot(majorKey);
  const minorSemi = normalizeEnharmonicRoot(relativeMinorKey);
  const minorDomSemi = (minorSemi + 7) % 12;
  const majorDomSemi = (majorSemi + 7) % 12;

  let majorScore = 2;
  let minorScore = 0;

  const allChords = measures.flatMap((m) => m.chords);

  for (let i = 0; i < allChords.length; i++) {
    const cur = getChordRootAndQuality(allChords[i]);
    const next =
      i + 1 < allChords.length
        ? getChordRootAndQuality(allChords[i + 1])
        : null;

    if (
      cur.semi === majorSemi &&
      !cur.isMinorTonic &&
      !cur.isDom7 &&
      !cur.isHalfDim
    ) {
      majorScore += 1.5;
    }
    if (cur.semi === minorSemi && cur.isMinorTonic) {
      minorScore += 1.0;
    }

    if (next) {
      if (
        cur.semi === majorDomSemi &&
        cur.isDom7 &&
        next.semi === majorSemi &&
        !next.isMinorTonic
      ) {
        majorScore += 3.0;
      }
      if (
        cur.semi === minorDomSemi &&
        cur.isDom7 &&
        next.semi === minorSemi &&
        next.isMinorTonic
      ) {
        minorScore += 3.0;
      }
    }
  }

  const lastBar = measures[measures.length - 1];
  const prevBar = measures.length >= 2 ? measures[measures.length - 2] : null;

  for (const bar of [prevBar, lastBar]) {
    if (!bar) continue;
    for (const cStr of bar.chords) {
      const info = getChordRootAndQuality(cStr);
      if (info.semi === majorSemi && !info.isMinorTonic && !info.isDom7) {
        majorScore += 5.0;
      } else if (info.semi === minorSemi && info.isMinorTonic) {
        minorScore += 5.0;
      }
    }
  }

  if (minorScore > majorScore) {
    return { key: relativeMinorKey, isMinor: true };
  }
  return { key: majorKey, isMinor: false };
}

function detectStyleFromXmlMetadata(
  doc: Document,
  title: string,
  beatsPerBar: number
): string {
  const wordsTexts = Array.from(
    doc.querySelectorAll(
      "direction words, credit credit-words, identification creator"
    )
  )
    .map((el) => (el.textContent || "").trim())
    .join(" ");

  const combinedText = `${title} ${wordsTexts}`.toLowerCase();

  if (
    combinedText.includes("bossa") ||
    combinedText.includes("ipanema") ||
    combinedText.includes("corcovado") ||
    combinedText.includes("desafinado") ||
    combinedText.includes("wave") ||
    combinedText.includes("insensatez") ||
    combinedText.includes("how insensitive") ||
    combinedText.includes("chega de saudade") ||
    combinedText.includes("no more blues") ||
    combinedText.includes("meditation") ||
    combinedText.includes("meditação") ||
    combinedText.includes("agua de beber") ||
    combinedText.includes("waters of march") ||
    combinedText.includes("aguas de marco") ||
    combinedText.includes("triste") ||
    combinedText.includes("one note samba") ||
    combinedText.includes("black orpheus") ||
    combinedText.includes("manhã de carnaval") ||
    combinedText.includes("dindi") ||
    combinedText.includes("summer samba") ||
    combinedText.includes("so nice") ||
    combinedText.includes("jobim")
  ) {
    return "Bossa Nova";
  }

  if (
    combinedText.includes("samba") ||
    combinedText.includes("spain") ||
    combinedText.includes("aquarela do brasil") ||
    combinedText.includes("mas que nada") ||
    combinedText.includes("tico tico")
  ) {
    return "Samba";
  }

  if (
    combinedText.includes("funk") ||
    combinedText.includes("fusion") ||
    combinedText.includes("chameleon") ||
    combinedText.includes("cantaloupe") ||
    combinedText.includes("watermelon man") ||
    combinedText.includes("cissy strut") ||
    combinedText.includes("strasbourg") ||
    combinedText.includes("superstition") ||
    combinedText.includes("isn't she lovely") ||
    combinedText.includes("isnt she lovely") ||
    combinedText.includes("chicken") ||
    combinedText.includes("red baron") ||
    combinedText.includes("herbie hancock") ||
    combinedText.includes("stevie wonder")
  ) {
    return "Funk";
  }

  if (
    combinedText.includes("bolero") ||
    combinedText.includes("besame mucho") ||
    combinedText.includes("bésame mucho") ||
    combinedText.includes("contigo aprendi") ||
    combinedText.includes("sabor a mi") ||
    combinedText.includes("historia de un amor") ||
    combinedText.includes("relok") ||
    combinedText.includes("el reloj")
  ) {
    return "Bolero";
  }

  if (
    beatsPerBar === 3 ||
    combinedText.includes("waltz") ||
    combinedText.includes("vals") ||
    combinedText.includes("someday my prince") ||
    combinedText.includes("my favorite things") ||
    combinedText.includes("alice in wonderland") ||
    combinedText.includes("bluesette") ||
    combinedText.includes("waltz for debby") ||
    combinedText.includes("footprints")
  ) {
    return "Jazz Swing";
  }

  if (combinedText.includes("reggae")) return "Reggae";
  if (combinedText.includes("rock")) return "Rock";
  if (combinedText.includes("pop")) return "Pop";
  if (combinedText.includes("cumbia")) return "Cumbia";
  if (combinedText.includes("r&b") || combinedText.includes("soul")) {
    return "Funk";
  }

  return "Jazz Swing";
}

interface RawParsedMeasure {
  measureNumber: string;
  isImplicitPickup: boolean;
  chords: string[];
  melody: MelodyNote[];
  hasRepeatStart: boolean;
  hasRepeatEnd: boolean;
  endingStart: number | null;
  endingStop: number | null;
  rehearsal?: string;
  hasDaCapo: boolean;
  hasFine: boolean;
}

export interface ParsedMusicXmlResult {
  title: string;
  style: string;
  tempo: number;
  timeSignature: string;
  defaultKey: string;
  defaultIsMinor: boolean;
  measures: SongMeasure[];
  pickupMelody: MelodyNote[];
}

export function parseLeadSheetMusicXml(xmlText: string): ParsedMusicXmlResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const title =
    doc.querySelector("movement-title")?.textContent?.trim() ||
    doc.querySelector("work > work-title")?.textContent?.trim() ||
    doc
      .querySelector("credit > credit-type")
      ?.parentElement?.querySelector("credit-words")
      ?.textContent?.trim() ||
    "Imported XML Standard";

  let tempo = 120;
  const soundTempoEl = doc.querySelector("sound[tempo]");
  const perMinuteEl = doc.querySelector(
    "direction metronome per-minute, per-minute"
  );
  if (soundTempoEl) {
    const tVal = parseFloat(soundTempoEl.getAttribute("tempo") || "120");
    if (!isNaN(tVal) && tVal >= 40 && tVal <= 260) {
      tempo = Math.round(tVal);
    }
  } else if (perMinuteEl && perMinuteEl.textContent) {
    const tVal = parseFloat(perMinuteEl.textContent.trim());
    if (!isNaN(tVal) && tVal >= 40 && tVal <= 260) {
      tempo = Math.round(tVal);
    }
  }

  let divisions = 2;
  let beatsPerBar = 4;
  let beatType = 4;
  let fifths = 0;
  let hasFoundFirstKey = false;
  let mode = "major";

  const firstPart = doc.querySelector("part") || doc;
  const measureEls = Array.from(firstPart.querySelectorAll("measure"));

  const rawMeasures: RawParsedMeasure[] = [];

  for (let mIdx = 0; mIdx < measureEls.length; mIdx++) {
    const mEl = measureEls[mIdx];
    const mNum = mEl.getAttribute("number") || String(mIdx + 1);
    const isImplicit = mEl.getAttribute("implicit") === "yes" || mNum === "0";

    const divText = mEl
      .querySelector("attributes > divisions")
      ?.textContent?.trim();
    if (divText) {
      const parsedDiv = parseFloat(divText);
      if (!isNaN(parsedDiv) && parsedDiv > 0) divisions = parsedDiv;
    }

    const beatsText = mEl
      .querySelector("attributes > time > beats")
      ?.textContent?.trim();
    const beatTypeText = mEl
      .querySelector("attributes > time > beat-type")
      ?.textContent?.trim();
    if (beatsText && beatTypeText) {
      const b = parseInt(beatsText, 10);
      const bt = parseInt(beatTypeText, 10);
      if (!isNaN(b) && !isNaN(bt)) {
        beatsPerBar = b;
        beatType = bt;
      }
    }

    if (!hasFoundFirstKey) {
      const fifthsText = mEl
        .querySelector("attributes > key > fifths")
        ?.textContent?.trim();
      const modeText = mEl
        .querySelector("attributes > key > mode")
        ?.textContent?.trim();
      if (fifthsText !== undefined) {
        const f = parseInt(fifthsText, 10);
        if (!isNaN(f)) {
          fifths = f;
          hasFoundFirstKey = true;
        }
      }
      if (modeText) {
        mode = modeText.toLowerCase();
      }
    }

    let hasRepeatStart = false;
    let hasRepeatEnd = false;
    let endingStart: number | null = null;
    let endingStop: number | null = null;
    let rehearsal: string | undefined = undefined;
    let hasDaCapo = false;
    let hasFine = false;

    const barlines = Array.from(mEl.querySelectorAll("barline"));
    for (const bl of barlines) {
      const rep = bl.querySelector("repeat");
      if (rep) {
        const dir = rep.getAttribute("direction");
        if (dir === "forward") hasRepeatStart = true;
        if (dir === "backward") hasRepeatEnd = true;
      }
      const endEl = bl.querySelector("ending");
      if (endEl) {
        const num = parseInt(endEl.getAttribute("number") || "1", 10);
        const eType = endEl.getAttribute("type");
        if (eType === "start") endingStart = isNaN(num) ? 1 : num;
        if (eType === "stop" || eType === "discontinue") {
          endingStop = isNaN(num) ? 1 : num;
        }
      }
    }

    const rehEl = mEl.querySelector("direction > direction-type > rehearsal");
    if (rehEl && rehEl.textContent) {
      rehearsal = rehEl.textContent.trim();
    }

    const soundEls = Array.from(mEl.querySelectorAll("sound"));
    for (const sEl of soundEls) {
      if (sEl.getAttribute("dacapo") === "yes") hasDaCapo = true;
      if (sEl.getAttribute("fine") === "yes") hasFine = true;
    }

    const chords: string[] = [];
    const melody: MelodyNote[] = [];
    let cursorBeat = 0;

    const children = Array.from(mEl.children);
    for (const child of children) {
      const tag = child.tagName.toLowerCase();

      if (tag === "harmony") {
        const chordStr = parseHarmonyElement(child);
        if (chordStr) chords.push(chordStr);
      } else if (tag === "direction") {
        const wordsList = Array.from(
          child.querySelectorAll("direction-type > words")
        );
        for (const wEl of wordsList) {
          const txt = (wEl.textContent || "").trim();
          if (/d\.?c\.?/i.test(txt)) hasDaCapo = true;
          if (/fine/i.test(txt)) hasFine = true;
          const parenChordMatch = txt.match(
            /^\(([A-G][#b]?[a-zA-Z0-9#b/+-]*)\)$/
          );
          if (parenChordMatch && chords.length === 0) {
            chords.push(parenChordMatch[1]);
          }
        }
      } else if (tag === "note") {
        if (child.querySelector("chord") || child.querySelector("grace")) {
          continue;
        }
        const voiceTxt = child.querySelector("voice")?.textContent?.trim();
        if (voiceTxt && voiceTxt !== "1") continue;

        const durVal = parseFloat(
          child.querySelector("duration")?.textContent?.trim() || "0"
        );
        const durBeats = divisions > 0 ? durVal / divisions : 0;
        if (durBeats <= 0) continue;

        if (child.querySelector("rest")) {
          cursorBeat += durBeats;
          continue;
        }

        const pitchEl = child.querySelector("pitch");
        if (pitchEl) {
          const step =
            pitchEl.querySelector("step")?.textContent?.trim() || "C";
          const alter = parseInt(
            pitchEl.querySelector("alter")?.textContent?.trim() || "0",
            10
          );
          const octave = parseInt(
            pitchEl.querySelector("octave")?.textContent?.trim() || "4",
            10
          );
          const midi =
            (octave + 1) * 12 +
            (STEP_TO_SEMITONE[step] ?? 0) +
            (isNaN(alter) ? 0 : alter);

          const tieTypes = Array.from(child.querySelectorAll("tie")).map((t) =>
            t.getAttribute("type")
          );
          const isTieStop = tieTypes.includes("stop");

          if (
            isTieStop &&
            melody.length > 0 &&
            melody[melody.length - 1].midi === midi
          ) {
            melody[melody.length - 1].durationBeats += durBeats;
          } else {
            melody.push({
              midi,
              startBeat: cursorBeat,
              durationBeats: durBeats,
              velocity: 0.92,
            });
          }
          cursorBeat += durBeats;
        }
      }
    }

    rawMeasures.push({
      measureNumber: mNum,
      isImplicitPickup: isImplicit,
      chords,
      melody,
      hasRepeatStart,
      hasRepeatEnd,
      endingStart,
      endingStop,
      rehearsal,
      hasDaCapo,
      hasFine,
    });
  }

  let pickupMelody: MelodyNote[] = [];
  let workingMeasures = [...rawMeasures];

  if (
    workingMeasures.length > 1 &&
    (workingMeasures[0].isImplicitPickup ||
      (workingMeasures[0].chords.length === 0 &&
        workingMeasures[1].chords.length > 0))
  ) {
    const pickupBar = workingMeasures.shift()!;
    const totalPickupBeats = pickupBar.melody.reduce(
      (acc, n) => Math.max(acc, n.startBeat + n.durationBeats),
      0
    );
    pickupMelody = pickupBar.melody.map((n) => ({
      ...n,
      startBeat: n.startBeat - totalPickupBeats,
    }));
  }

  const expandedRaw: {
    chords: string[];
    melody: MelodyNote[];
    rehearsal?: string;
  }[] = [];
  let repeatStartIdx = 0;
  let activeEnding = 0;

  const taggedMeasures = workingMeasures.map((m) => {
    if (m.endingStart === 1) activeEnding = 1;
    else if (m.endingStart === 2) activeEnding = 2;
    else if (m.rehearsal && !m.endingStart) activeEnding = 0;

    const item = { ...m, endingTag: activeEnding };
    if (m.endingStop === 2 && m.hasRepeatEnd) {
      activeEnding = 0;
    }
    return item;
  });

  for (let i = 0; i < taggedMeasures.length; i++) {
    const m = taggedMeasures[i];
    if (m.hasRepeatStart) {
      repeatStartIdx = i;
    }

    expandedRaw.push({
      chords: [...m.chords],
      melody: m.melody.map((n) => ({ ...n })),
      rehearsal: m.rehearsal,
    });

    if (m.hasRepeatEnd && m.endingTag !== 2) {
      for (let r = repeatStartIdx; r <= i; r++) {
        const repMeasure = taggedMeasures[r];
        if (repMeasure.endingTag === 1) {
          break;
        }
        expandedRaw.push({
          chords: [...repMeasure.chords],
          melody: repMeasure.melody.map((n) => ({ ...n })),
          rehearsal: repMeasure.rehearsal,
        });
      }
    }
  }

  const hasAnyDaCapo = taggedMeasures.some((m) => m.hasDaCapo);
  const lastMeasureTag =
    taggedMeasures.length > 0
      ? taggedMeasures[taggedMeasures.length - 1].endingTag
      : 0;

  if (hasAnyDaCapo && lastMeasureTag !== 2) {
    for (let r = 0; r < taggedMeasures.length; r++) {
      const dcMeasure = taggedMeasures[r];
      if (dcMeasure.endingTag === 1) continue;
      expandedRaw.push({
        chords: [...dcMeasure.chords],
        melody: dcMeasure.melody.map((n) => ({ ...n })),
        rehearsal: dcMeasure.rehearsal,
      });
      if (dcMeasure.hasFine || dcMeasure.endingStop === 2) {
        break;
      }
    }
  }

  let lastValidChord =
    expandedRaw.find((m) => m.chords.length > 0)?.chords[0] || "C";

  const finalMeasures: SongMeasure[] = expandedRaw.map((m, idx) => {
    const barChords = m.chords.length > 0 ? m.chords : [lastValidChord];
    lastValidChord = barChords[barChords.length - 1];

    const barMelody =
      idx === 0 && pickupMelody.length > 0
        ? [...pickupMelody.map((n) => ({ ...n })), ...m.melody]
        : m.melody;

    const sectionLetter =
      m.rehearsal ||
      (idx % 8 === 0
        ? idx === 0
          ? "A"
          : idx === 8
          ? "B"
          : idx === 16
          ? "A"
          : idx === 24
          ? "C"
          : "A"
        : undefined);

    return {
      id: `xml-m-${idx + 1}`,
      chords: barChords,
      melody: barMelody,
      sectionLabel: sectionLetter,
    };
  });

  const { key: detectedKey, isMinor: detectedIsMinor } = detectTrueJazzKey(
    fifths,
    mode,
    finalMeasures
  );

  const detectedStyle = detectStyleFromXmlMetadata(doc, title, beatsPerBar);
  const detectedSig = `${beatsPerBar}/${beatType}`;

  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("change-bpm", { detail: tempo }));
      window.dispatchEvent(new CustomEvent("bpm-changed", { detail: tempo }));
      window.dispatchEvent(
        new CustomEvent("change-drum-style", { detail: detectedStyle })
      );
      window.dispatchEvent(
        new CustomEvent("drum-style-changed", { detail: detectedStyle })
      );
      window.dispatchEvent(
        new CustomEvent("change-time-signature", { detail: detectedSig })
      );
    }, 20);
  }

  return {
    title,
    style: detectedStyle,
    tempo,
    timeSignature: detectedSig,
    defaultKey: detectedKey,
    defaultIsMinor: detectedIsMinor,
    measures: finalMeasures,
    pickupMelody,
  };
}

// ============================================================================
// EXPORTADOR PROFESIONAL A MUSICXML 3.1 (.XML / .MUSICXML)
// Compatible con Finale, MuseScore, Sibelius, Dorico e iReal Pro
// ============================================================================

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseRootToXmlStepAlter(noteStr: string): {
  step: string;
  alter: number;
} {
  const m = String(noteStr || "C")
    .trim()
    .match(/^([A-G])([#b]*)/);
  if (!m) return { step: "C", alter: 0 };
  const step = m[1];
  const acc = m[2] || "";
  const alter =
    acc === "#" ? 1 : acc === "b" ? -1 : acc === "##" ? 2 : acc === "bb" ? -2 : 0;
  return { step, alter };
}

function buildHarmonyXmlFromChordString(chordStr: string): string {
  const clean = String(chordStr || "C").trim();
  if (!clean || clean === "%" || clean === "NC" || clean === "N.C.") return "";

  const [mainPart, slashBass] = clean.split("/");
  const m = mainPart.trim().match(/^([A-G][#b]?)(.*)$/);
  if (!m) return "";

  const rootToken = m[1];
  const suffix = m[2].trim();
  const lower = suffix.toLowerCase();
  const { step: rootStep, alter: rootAlter } =
    parseRootToXmlStepAlter(rootToken);

  let kindValue = "major";
  let kindText = suffix;
  const degreesXml: string[] = [];

  if (
    lower.includes("m7b5") ||
    lower.includes("-7b5") ||
    lower.includes("ø")
  ) {
    kindValue = "half-diminished";
    kindText = "m7b5";
  } else if (lower.startsWith("dim7") || lower.startsWith("°7")) {
    kindValue = "diminished-seventh";
    kindText = "dim7";
  } else if (lower.startsWith("dim") || lower.startsWith("°")) {
    kindValue = "diminished";
    kindText = "dim";
  } else if (lower.startsWith("m(maj7)") || lower.startsWith("mmaj7")) {
    kindValue = "minor-major";
    kindText = "m(maj7)";
  } else if (lower.startsWith("m11")) {
    kindValue = "minor-11th";
    kindText = "m11";
  } else if (lower.startsWith("m9")) {
    kindValue = "minor-ninth";
    kindText = "m9";
  } else if (lower.startsWith("m6")) {
    kindValue = "minor-sixth";
    kindText = "m6";
  } else if (lower.startsWith("m7") || lower.startsWith("-7")) {
    kindValue = "minor-seventh";
    kindText = "m7";
  } else if (
    (lower.startsWith("m") || lower.startsWith("-")) &&
    !lower.startsWith("maj")
  ) {
    kindValue = "minor";
    kindText = "m";
  } else if (lower.startsWith("maj9")) {
    kindValue = "major-ninth";
    kindText = "maj9";
  } else if (
    lower.startsWith("maj7") ||
    suffix.startsWith("Δ") ||
    suffix.startsWith("M7")
  ) {
    kindValue = "major-seventh";
    kindText = "maj7";
    if (lower.includes("#11")) {
      degreesXml.push(
        `        <degree><degree-value>11</degree-value><degree-alter>1</degree-alter><degree-type>add</degree-type></degree>`
      );
    }
  } else if (lower.startsWith("6(9)") || lower.startsWith("6/9")) {
    kindValue = "major-sixth";
    kindText = "6(9)";
    degreesXml.push(
      `        <degree><degree-value>9</degree-value><degree-alter>0</degree-alter><degree-type>add</degree-type></degree>`
    );
  } else if (lower.startsWith("6")) {
    kindValue = "major-sixth";
    kindText = "6";
  } else if (lower.includes("7sus4") || lower.includes("9sus4")) {
    kindValue = "suspended-fourth";
    kindText = suffix;
  } else if (lower.startsWith("13")) {
    kindValue = "dominant-13th";
    kindText = suffix;
  } else if (lower.startsWith("9")) {
    kindValue = "dominant-ninth";
    kindText = suffix;
  } else if (lower.startsWith("aug") || suffix.startsWith("+")) {
    kindValue = "augmented";
    kindText = "aug";
  } else if (lower.startsWith("7") || lower.startsWith("alt")) {
    kindValue = "dominant";
    kindText = suffix;
    if (lower.includes("b9")) {
      degreesXml.push(
        `        <degree><degree-value>9</degree-value><degree-alter>-1</degree-alter><degree-type>add</degree-type></degree>`
      );
    }
    if (lower.includes("#9")) {
      degreesXml.push(
        `        <degree><degree-value>9</degree-value><degree-alter>1</degree-alter><degree-type>add</degree-type></degree>`
      );
    }
    if (lower.includes("#11")) {
      degreesXml.push(
        `        <degree><degree-value>11</degree-value><degree-alter>1</degree-alter><degree-type>add</degree-type></degree>`
      );
    }
    if (lower.includes("b13")) {
      degreesXml.push(
        `        <degree><degree-value>13</degree-value><degree-alter>-1</degree-alter><degree-type>add</degree-type></degree>`
      );
    }
    if (lower.includes("b5")) {
      degreesXml.push(
        `        <degree><degree-value>5</degree-value><degree-alter>-1</degree-alter><degree-type>alter</degree-type></degree>`
      );
    }
    if (lower.includes("#5")) {
      degreesXml.push(
        `        <degree><degree-value>5</degree-value><degree-alter>1</degree-alter><degree-type>alter</degree-type></degree>`
      );
    }
  }

  let bassXml = "";
  if (slashBass && slashBass.trim()) {
    const { step: bStep, alter: bAlter } = parseRootToXmlStepAlter(
      slashBass.trim()
    );
    bassXml =
      `      <bass>\n` +
      `        <bass-step>${bStep}</bass-step>\n` +
      (bAlter !== 0 ? `        <bass-alter>${bAlter}</bass-alter>\n` : "") +
      `      </bass>\n`;
  }

  return (
    `      <harmony default-y="40">\n` +
    `        <root>\n` +
    `          <root-step>${rootStep}</root-step>\n` +
    (rootAlter !== 0 ? `          <root-alter>${rootAlter}</root-alter>\n` : "") +
    `        </root>\n` +
    `        <kind text="${escapeXml(kindText)}">${kindValue}</kind>\n` +
    (bassXml ? bassXml : "") +
    (degreesXml.length > 0 ? degreesXml.join("\n") + "\n" : "") +
    `      </harmony>`
  );
}

function midiToXmlPitch(
  midi: number,
  useFlats: boolean = true
): { step: string; alter: number; octave: number } {
  const safeMidi = Math.max(12, Math.min(108, Math.round(midi)));
  const octave = Math.floor(safeMidi / 12) - 1;
  const pc = ((safeMidi % 12) + 12) % 12;

  const flatTable: { step: string; alter: number }[] = [
    { step: "C", alter: 0 },
    { step: "D", alter: -1 },
    { step: "D", alter: 0 },
    { step: "E", alter: -1 },
    { step: "E", alter: 0 },
    { step: "F", alter: 0 },
    { step: "G", alter: -1 },
    { step: "G", alter: 0 },
    { step: "A", alter: -1 },
    { step: "A", alter: 0 },
    { step: "B", alter: -1 },
    { step: "B", alter: 0 },
  ];

  const sharpTable: { step: string; alter: number }[] = [
    { step: "C", alter: 0 },
    { step: "C", alter: 1 },
    { step: "D", alter: 0 },
    { step: "D", alter: 1 },
    { step: "E", alter: 0 },
    { step: "F", alter: 0 },
    { step: "F", alter: 1 },
    { step: "G", alter: 0 },
    { step: "G", alter: 1 },
    { step: "A", alter: 0 },
    { step: "A", alter: 1 },
    { step: "B", alter: 0 },
  ];

  const entry = useFlats ? flatTable[pc] : sharpTable[pc];
  return { step: entry.step, alter: entry.alter, octave };
}

function durationDivisionsToTypeAndDot(divDur: number): {
  type: string;
  dot: boolean;
} {
  // Con divisions = 4 por negra (16 por compás de 4/4)
  if (divDur >= 16) return { type: "whole", dot: false };
  if (divDur >= 12) return { type: "half", dot: true };
  if (divDur >= 8) return { type: "half", dot: false };
  if (divDur >= 6) return { type: "quarter", dot: true };
  if (divDur >= 4) return { type: "quarter", dot: false };
  if (divDur >= 3) return { type: "eighth", dot: true };
  if (divDur >= 2) return { type: "eighth", dot: false };
  return { type: "16th", dot: false };
}

export interface ExportMusicXmlOptions {
  title: string;
  style?: string;
  tempo?: number;
  timeSignature?: string;
  keySignature?: string;
  isMinor?: boolean;
  measures: SongMeasure[];
  transposition?: number;
}

export function exportSongToMusicXml(options: ExportMusicXmlOptions): string {
  const {
    title = "Rumie Lead Sheet",
    style = "Jazz Swing",
    tempo = 120,
    timeSignature = "4/4",
    keySignature = "C",
    isMinor = false,
    measures = [],
    transposition = 0,
  } = options;

  const [beatsStr, beatTypeStr] = String(timeSignature || "4/4").split("/");
  const beatsPerBar = parseInt(beatsStr, 10) || 4;
  const beatType = parseInt(beatTypeStr, 10) || 4;
  const divisions = 4; // 4 divisiones por negra
  const maxBarDivisions = beatsPerBar * divisions;

  const cleanKey = String(keySignature || "C")
    .replace(/m$/i, "")
    .trim();
  const fifths = isMinor
    ? MINOR_KEY_TO_FIFTHS[cleanKey] ?? 0
    : MAJOR_KEY_TO_FIFTHS[cleanKey] ?? 0;
  const useFlats = fifths <= 0;

  const xmlMeasures: string[] = [];

  // Verificar si el primer compás tiene notas de anacrusa (startBeat < 0)
  const firstBarMelody = measures[0]?.melody || [];
  const pickupNotes = firstBarMelody
    .filter((n) => n.startBeat < 0)
    .sort((a, b) => a.startBeat - b.startBeat);

  if (pickupNotes.length > 0) {
    const pickupLines: string[] = [];
    pickupLines.push(`    <measure implicit="yes" number="0">`);
    pickupLines.push(`      <attributes>`);
    pickupLines.push(`        <divisions>${divisions}</divisions>`);
    pickupLines.push(`        <key>`);
    pickupLines.push(`          <fifths>${fifths}</fifths>`);
    pickupLines.push(
      `          <mode>${isMinor ? "minor" : "major"}</mode>`
    );
    pickupLines.push(`        </key>`);
    pickupLines.push(`        <time>`);
    pickupLines.push(`          <beats>${beatsPerBar}</beats>`);
    pickupLines.push(`          <beat-type>${beatType}</beat-type>`);
    pickupLines.push(`        </time>`);
    pickupLines.push(`        <clef>`);
    pickupLines.push(`          <sign>G</sign>`);
    pickupLines.push(`          <line>2</line>`);
    pickupLines.push(`        </clef>`);
    pickupLines.push(`      </attributes>`);
    pickupLines.push(
      `      <direction placement="above"><direction-type><words>${escapeXml(
        style
      )}</words></direction-type><sound tempo="${Math.round(tempo)}"/></direction>`
    );

    for (const pNote of pickupNotes) {
      const divDur = Math.max(1, Math.round(pNote.durationBeats * divisions));
      const { type, dot } = durationDivisionsToTypeAndDot(divDur);
      const pitch = midiToXmlPitch(pNote.midi + transposition, useFlats);
      pickupLines.push(`      <note>`);
      pickupLines.push(`        <pitch>`);
      pickupLines.push(`          <step>${pitch.step}</step>`);
      if (pitch.alter !== 0) {
        pickupLines.push(`          <alter>${pitch.alter}</alter>`);
      }
      pickupLines.push(`          <octave>${pitch.octave}</octave>`);
      pickupLines.push(`        </pitch>`);
      pickupLines.push(`        <duration>${divDur}</duration>`);
      pickupLines.push(`        <voice>1</voice>`);
      pickupLines.push(`        <type>${type}</type>`);
      if (dot) pickupLines.push(`        <dot/>`);
      pickupLines.push(`      </note>`);
    }

    pickupLines.push(`    </measure>`);
    xmlMeasures.push(pickupLines.join("\n"));
  }

  measures.forEach((measure, idx) => {
    const measureNum = idx + 1;
    const lines: string[] = [];
    lines.push(`    <measure number="${measureNum}">`);

    if (idx === 0 && pickupNotes.length === 0) {
      lines.push(`      <attributes>`);
      lines.push(`        <divisions>${divisions}</divisions>`);
      lines.push(`        <key>`);
      lines.push(`          <fifths>${fifths}</fifths>`);
      lines.push(
        `          <mode>${isMinor ? "minor" : "major"}</mode>`
      );
      lines.push(`        </key>`);
      lines.push(`        <time>`);
      lines.push(`          <beats>${beatsPerBar}</beats>`);
      lines.push(`          <beat-type>${beatType}</beat-type>`);
      lines.push(`        </time>`);
      lines.push(`        <clef>`);
      lines.push(`          <sign>G</sign>`);
      lines.push(`          <line>2</line>`);
      lines.push(`        </clef>`);
      lines.push(`      </attributes>`);
      lines.push(
        `      <direction placement="above"><direction-type><words>${escapeXml(
          style
        )}</words></direction-type><sound tempo="${Math.round(
          tempo
        )}"/></direction>`
      );
    }

    if (measure.sectionLabel) {
      lines.push(
        `      <direction placement="above"><direction-type><rehearsal>${escapeXml(
          measure.sectionLabel
        )}</rehearsal></direction-type></direction>`
      );
    }

    const barChords =
      measure.chords && measure.chords.length > 0 ? measure.chords : ["C"];
    const barMelody = (measure.melody || [])
      .filter((n) => n.startBeat >= 0 && n.startBeat < beatsPerBar)
      .sort((a, b) => a.startBeat - b.startBeat);

    if (barMelody.length === 0) {
      // Si el compás no tiene notas de melodía, exportar los acordes con silencios/notas guía proporcionales
      const chordsCount = barChords.length;
      const divPerChord = Math.max(
        1,
        Math.floor(maxBarDivisions / chordsCount)
      );
      const { type, dot } = durationDivisionsToTypeAndDot(divPerChord);

      barChords.forEach((cStr) => {
        const hXml = buildHarmonyXmlFromChordString(cStr);
        if (hXml) lines.push(hXml);
        lines.push(`      <note>`);
        lines.push(`        <rest/>`);
        lines.push(`        <duration>${divPerChord}</duration>`);
        lines.push(`        <voice>1</voice>`);
        lines.push(`        <type>${type}</type>`);
        if (dot) lines.push(`        <dot/>`);
        lines.push(`      </note>`);
      });
    } else {
      // Exportar los acordes (<harmony>) y las notas melódicas (<note>) alineadas por pulso dentro del compás
      const chordPositions = barChords.map((cStr, cIdx) => ({
        chordStr: cStr,
        divPos: Math.round((cIdx * maxBarDivisions) / barChords.length),
        emitted: false,
      }));

      let cursorDiv = 0;

      for (const noteObj of barMelody) {
        const noteStartDiv = Math.max(
          cursorDiv,
          Math.min(
            maxBarDivisions - 1,
            Math.round(noteObj.startBeat * divisions)
          )
        );

        // Emitir silencios si hay hueco antes de la nota
        if (noteStartDiv > cursorDiv) {
          for (const cp of chordPositions) {
            if (!cp.emitted && cp.divPos <= cursorDiv) {
              const hXml = buildHarmonyXmlFromChordString(cp.chordStr);
              if (hXml) lines.push(hXml);
              cp.emitted = true;
            }
          }
          const gapDiv = noteStartDiv - cursorDiv;
          const { type: rType, dot: rDot } =
            durationDivisionsToTypeAndDot(gapDiv);
          lines.push(`      <note>`);
          lines.push(`        <rest/>`);
          lines.push(`        <duration>${gapDiv}</duration>`);
          lines.push(`        <voice>1</voice>`);
          lines.push(`        <type>${rType}</type>`);
          if (rDot) lines.push(`        <dot/>`);
          lines.push(`      </note>`);
          cursorDiv = noteStartDiv;
        }

        // Emitir cualquier acorde que caiga en o antes de esta nota
        for (const cp of chordPositions) {
          if (!cp.emitted && cp.divPos <= cursorDiv) {
            const hXml = buildHarmonyXmlFromChordString(cp.chordStr);
            if (hXml) lines.push(hXml);
            cp.emitted = true;
          }
        }

        const rawDurDiv = Math.max(
          1,
          Math.round(noteObj.durationBeats * divisions)
        );
        const clampedDurDiv = Math.max(
          1,
          Math.min(maxBarDivisions - cursorDiv, rawDurDiv)
        );
        const { type: nType, dot: nDot } =
          durationDivisionsToTypeAndDot(clampedDurDiv);
        const pitch = midiToXmlPitch(noteObj.midi + transposition, useFlats);

        lines.push(`      <note>`);
        lines.push(`        <pitch>`);
        lines.push(`          <step>${pitch.step}</step>`);
        if (pitch.alter !== 0) {
          lines.push(`          <alter>${pitch.alter}</alter>`);
        }
        lines.push(`          <octave>${pitch.octave}</octave>`);
        lines.push(`        </pitch>`);
        lines.push(`        <duration>${clampedDurDiv}</duration>`);
        lines.push(`        <voice>1</voice>`);
        lines.push(`        <type>${nType}</type>`);
        if (nDot) lines.push(`        <dot/>`);
        lines.push(`      </note>`);

        cursorDiv += clampedDurDiv;
        if (cursorDiv >= maxBarDivisions) break;
      }

      // Emitir acordes restantes si quedaron después de la última nota
      for (const cp of chordPositions) {
        if (!cp.emitted) {
          const hXml = buildHarmonyXmlFromChordString(cp.chordStr);
          if (hXml) lines.push(hXml);
          cp.emitted = true;
        }
      }

      // Completar el compás con silencio si sobró tiempo
      if (cursorDiv < maxBarDivisions) {
        const remDiv = maxBarDivisions - cursorDiv;
        const { type: rType, dot: rDot } =
          durationDivisionsToTypeAndDot(remDiv);
        lines.push(`      <note>`);
        lines.push(`        <rest/>`);
        lines.push(`        <duration>${remDiv}</duration>`);
        lines.push(`        <voice>1</voice>`);
        lines.push(`        <type>${rType}</type>`);
        if (rDot) lines.push(`        <dot/>`);
        lines.push(`      </note>`);
      }
    }

    if (idx === measures.length - 1) {
      lines.push(
        `      <barline location="right"><bar-style>light-heavy</bar-style></barline>`
      );
    }

    lines.push(`    </measure>`);
    xmlMeasures.push(lines.join("\n"));
  });

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n` +
    `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n` +
    `<score-partwise version="3.1">\n` +
    `  <movement-title>${escapeXml(title)}</movement-title>\n` +
    `  <identification>\n` +
    `    <creator type="composer">Rumie Harmonic Pro</creator>\n` +
    `    <encoding>\n` +
    `      <software>Rumie Harmonic Pro MusicXML 3.1 Exporter</software>\n` +
    `    </encoding>\n` +
    `  </identification>\n` +
    `  <part-list>\n` +
    `    <score-part id="P1">\n` +
    `      <part-name>Lead Sheet</part-name>\n` +
    `    </score-part>\n` +
    `  </part-list>\n` +
    `  <part id="P1">\n` +
    xmlMeasures.join("\n") +
    `\n  </part>\n` +
    `</score-partwise>\n`
  );
}

export function downloadSongAsMusicXml(options: ExportMusicXmlOptions): void {
  const xmlString = exportSongToMusicXml(options);
  const blob = new Blob([xmlString], {
    type: "application/vnd.recordare.musicxml+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const safeFileName =
    String(options.title || "rumie-leadsheet")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "rumie-leadsheet";

  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileName}.musicxml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}