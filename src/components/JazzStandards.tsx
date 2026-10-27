import React, { useState, useEffect, useMemo, useRef } from "react";
import * as Tone from "tone";
import { JAZZ_STANDARDS, getSongCategoryGroup } from "../data/songs";
import {
  getGuitarChordVoicing,
  ROOT_DISPLAY_NAME_MAP,
  ROOT_MIDI_OFFSET_MAP,
} from "../data/chords";
import {
  analyzeSongHarmony,
  AnalyzedChord,
  AnalysisCategory,
  analyzeChord,
  ChordInputContext,
  buildHarmonicExplanation,
  HarmonicExplanation,
} from "../utils/analyzer";
import {
  parseChord,
  transposeRoot,
  transposeChordString,
  getSuggestedScale,
  isMinorQuality,
  buildJazzVoicing,
} from "../utils/music";
import {
  interactiveAnalysisAudio,
  HARMONY_VOICE_PRESETS,
  BASS_VOICE_PRESETS,
  DRUM_KIT_PRESETS,
  detectDrumKitFromStyle,
  HarmonyVoicePresetId,
  BassVoicePresetId,
  DrumKitPresetId,
} from "../utils/interactiveAnalysisAudio";
import ChordFretboard from "./ChordFretboard";
import ScaleFretboard from "./ScaleFretboard";
import ChordPianoKeyboard from "./ChordPianoKeyboard";
import ScalePianoKeyboard from "./ScalePianoKeyboard";
import { useInstrument } from "../contexts/InstrumentContext";
import Metronome, {
  MetronomeControls,
  preloadMelodyInstrumentSampler,
} from "./Metronome";
import {
  getBeatsPerBar,
  DrumStyle,
  detectDrumStyleFromSongStyle,
  getDrumMatrixForBeat,
} from "../utils/interactiveRhythmPatterns";
import { generateComping, generateWalkingBass } from "../utils/band";
import {
  parseLeadSheetMusicXml,
  downloadSongAsMusicXml,
} from "../utils/musicXmlParser";
import MusicXMLImporter from "./MusicXMLImporter";
import {
  Song,
  SongMeasure,
  RootNote,
  MelodyNote,
  MelodyInstrument,
} from "../types";
import ChordNameInput from "./ChordNameInput";
import { downloadLeadSheetPDF } from "../utils/pdfGenerator";
import { getMasterChordSuggestions } from "../utils/chordSuggestions";
import LanguageSwitch from "./LanguageSwitch";
import {
  Music,
  ArrowUpDown,
  RotateCcw,
  Plus,
  Sparkles,
  Pencil,
  Save,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Folder,
  FolderOpen,
  FileText,
  Download,
  BarChart2,
  Piano,
  Guitar,
  Eye,
  Loader2,
  Play,
  Square,
  Volume2,
  VolumeX,
  MoreVertical,
  LayoutGrid,
  Wrench,
  Upload,
  Gauge,
  Sliders,
  SlidersHorizontal,
  Repeat,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const STYLE_CATEGORIES_CATALOG: {
  groupEs: string;
  groupEn: string;
  styles: { value: string; labelEs: string; labelEn: string }[];
}[] = [
  {
    groupEs: "Jazz & Bossa",
    groupEn: "Jazz & Bossa",
    styles: [
      { value: "Jazz Swing", labelEs: "Jazz Swing", labelEn: "Jazz Swing" },
      { value: "Bossa Nova", labelEs: "Bossa Nova", labelEn: "Bossa Nova" },
      { value: "Samba", labelEs: "Samba", labelEn: "Samba" },
    ],
  },
  {
    groupEs: "Latino, Criollo & Tropical",
    groupEn: "Latin, Criollo & Tropical",
    styles: [
      { value: "Bolero", labelEs: "Bolero", labelEn: "Bolero" },
      {
        value: "Vals Criollo",
        labelEs: "Vals Peruano / Porteño (3/4)",
        labelEn: "Criollo / Tango Waltz (3/4)",
      },
      { value: "Cumbia", labelEs: "Cumbia", labelEn: "Cumbia" },
    ],
  },
  {
    groupEs: "Pop, Rock, Blues & Urbano",
    groupEn: "Pop, Rock, Blues & Urban",
    styles: [
      {
        value: "Shuffle",
        labelEs: "Blues / Shuffle",
        labelEn: "Blues / Shuffle",
      },
      {
        value: "Funk / Fusion",
        labelEs: "Funk / Fusion",
        labelEn: "Funk / Fusion",
      },
      { value: "Pop", labelEs: "Pop", labelEn: "Pop" },
      { value: "Rock", labelEs: "Rock", labelEn: "Rock" },
      { value: "Soul / R&B", labelEs: "Soul / R&B", labelEn: "Soul / R&B" },
      { value: "Hip-Hop", labelEs: "Hip-Hop", labelEn: "Hip-Hop" },
      { value: "Reggae", labelEs: "Reggae", labelEn: "Reggae" },
      { value: "Reggaeton", labelEs: "Reggaetón", labelEn: "Reggaeton" },
    ],
  },
];

const MAJOR_KEYS_LIST = [
  { value: "C", labelEs: "C Mayor (Do Mayor)", labelEn: "C Major" },
  { value: "Db", labelEs: "Db Mayor (Reb Mayor)", labelEn: "Db Major" },
  { value: "D", labelEs: "D Mayor (Re Mayor)", labelEn: "D Major" },
  { value: "Eb", labelEs: "Eb Mayor (Mib Mayor)", labelEn: "Eb Major" },
  { value: "E", labelEs: "E Mayor (Mi Mayor)", labelEn: "E Major" },
  { value: "F", labelEs: "F Mayor (Fa Mayor)", labelEn: "F Major" },
  { value: "F#", labelEs: "F# Mayor (Fa# Mayor)", labelEn: "F# Major" },
  { value: "G", labelEs: "G Mayor (Sol Mayor)", labelEn: "G Major" },
  { value: "Ab", labelEs: "Ab Mayor (Lab Mayor)", labelEn: "Ab Major" },
  { value: "A", labelEs: "A Mayor (La Mayor)", labelEn: "A Major" },
  { value: "Bb", labelEs: "Bb Mayor (Sib Mayor)", labelEn: "Bb Major" },
  { value: "B", labelEs: "B Mayor (Si Mayor)", labelEn: "B Major" },
];

const MINOR_KEYS_LIST = [
  { value: "Cm", labelEs: "Cm (Do Menor)", labelEn: "Cm (C Minor)" },
  { value: "C#m", labelEs: "C#m (Do# Menor)", labelEn: "C#m (C# Minor)" },
  { value: "Dm", labelEs: "Dm (Re Menor)", labelEn: "Dm (D Minor)" },
  { value: "Ebm", labelEs: "Ebm (Mib Menor)", labelEn: "Ebm (Eb Minor)" },
  { value: "Em", labelEs: "Em (Mi Menor)", labelEn: "Em (E Minor)" },
  { value: "Fm", labelEs: "Fm (Fa Menor)", labelEn: "Fm (F Minor)" },
  { value: "F#m", labelEs: "F#m (Fa# Menor)", labelEn: "F#m (F# Minor)" },
  { value: "Gm", labelEs: "Gm (Sol Menor)", labelEn: "Gm (G Minor)" },
  { value: "G#m", labelEs: "G#m (Sol# Menor)", labelEn: "G#m (G# Minor)" },
  { value: "Am", labelEs: "Am (La Menor)", labelEn: "Am (A Minor)" },
  { value: "Bbm", labelEs: "Bbm (Sib Menor)", labelEn: "Bbm (Bb Minor)" },
  { value: "Bm", labelEs: "Bm (Si Menor)", labelEn: "Bm (B Minor)" },
];

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

function buildScaleByIntervals(
  root: string,
  scaleTitle: string,
  intervals: number[],
  forceSharpThird: boolean = false
): { name: string; notes: string[] } {
  const cleanRoot = String(root || "C").trim();
  const baseSemi =
    ROOT_MIDI_OFFSET_MAP[cleanRoot as RootNote] !== undefined
      ? ROOT_MIDI_OFFSET_MAP[cleanRoot as RootNote] % 12
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
      return CHROMATIC_SHARP_NAMES[semi];
    }
    return useFlats ? CHROMATIC_FLAT_NAMES[semi] : CHROMATIC_SHARP_NAMES[semi];
  });

  return {
    name: `${cleanRoot} ${scaleTitle}`,
    notes,
  };
}

function classifyChordQuality(chordStr: string | null | undefined): {
  root: string;
  semi: number;
  isDominant: boolean;
  isMinorSeventh: boolean;
  isHalfDim: boolean;
  isMajorTonic: boolean;
} | null {
  if (!chordStr || chordStr === "%" || !chordStr.trim()) return null;
  const clean = chordStr.split("/")[0].trim();
  const parsed = parseChord(clean);
  if (!parsed.root) return null;

  const semi = (ROOT_MIDI_OFFSET_MAP[parsed.root as RootNote] ?? 0) % 12;
  const suffix = clean.slice(parsed.root.length).trim();
  const pType = String(parsed.type || "").toLowerCase();

  const isHalfDim =
    /m7b5|-7b5|ø|dim|°/i.test(suffix) ||
    pType.includes("m7b5") ||
    pType.includes("dim");

  const isMinorSeventh =
    !isHalfDim &&
    (/^(m(?!aj)|min|-)/i.test(suffix) || isMinorQuality(parsed.type));

  const isMajorTonic =
    !isHalfDim &&
    !isMinorSeventh &&
    (suffix === "" ||
      /^maj/i.test(suffix) ||
      /^M(?!in)/.test(suffix) ||
      /^Δ/.test(suffix) ||
      /^6/.test(suffix) ||
      pType.includes("maj") ||
      pType === "major" ||
      pType === "6");

  const isDominant =
    !isHalfDim &&
    !isMajorTonic &&
    !isMinorSeventh &&
    (/^(7|9|11|13|7b9|7#9|7b5|7#5|7b13|7alt|7sus)/i.test(suffix) ||
      pType.includes("dom") ||
      pType === "7" ||
      pType === "9" ||
      pType === "13");

  return {
    root: parsed.root,
    semi,
    isDominant,
    isMinorSeventh,
    isHalfDim,
    isMajorTonic,
  };
}

function resolveTransposedScaleForChord(params: {
  baseScale: { name: string; notes: string[] } | null | undefined;
  romanNumeral?: string;
  category?: string;
  chordString: string;
  prevChordString?: string | null;
  nextChordString?: string | null;
  nextNextChordString?: string | null;
}): { name: string; notes: string[] } | null | undefined {
  const {
    baseScale,
    romanNumeral,
    category,
    chordString,
    prevChordString,
    nextChordString,
    nextNextChordString,
  } = params;

  const curr = classifyChordQuality(chordString);
  if (!curr) return baseScale;

  const prev = classifyChordQuality(prevChordString);
  const next = classifyChordQuality(nextChordString);
  const next2 = classifyChordQuality(nextNextChordString);
  const num = String(romanNumeral || "").trim();

  if (curr.isMinorSeventh && num === "ii") {
    return buildScaleByIntervals(curr.root, "Dórica", [0, 2, 3, 5, 7, 9, 10]);
  }

  if (curr.isMinorSeventh && num === "iii") {
    return buildScaleByIntervals(curr.root, "Frigia", [0, 1, 3, 5, 7, 8, 10]);
  }

  if (curr.isMinorSeventh && (num === "i" || num === "vi")) {
    return buildScaleByIntervals(curr.root, "Eólica", [0, 2, 3, 5, 7, 8, 10]);
  }

  if (curr.isMajorTonic && num === "IV") {
    return buildScaleByIntervals(curr.root, "Lidia", [0, 2, 4, 6, 7, 9, 11]);
  }

  if (curr.isMajorTonic && num === "I") {
    return buildScaleByIntervals(curr.root, "Jónica", [0, 2, 4, 5, 7, 9, 11]);
  }

  if (curr.isDominant) {
    const precededByHalfDim =
      prev && prev.isHalfDim && (curr.semi - prev.semi + 12) % 12 === 5;
    const precededByMajorII =
      prev &&
      prev.isMinorSeventh &&
      (curr.semi - prev.semi + 12) % 12 === 5 &&
      num === "V7";
    const resolvesFourthUpToMajor =
      next && next.isMajorTonic && (next.semi - curr.semi + 12) % 12 === 5;
    const resolvesFourthUpToMinor =
      next && next.isMinorSeventh && (next.semi - curr.semi + 12) % 12 === 5;
    const nextMinorIsPartOfMajorIIV =
      resolvesFourthUpToMinor &&
      next &&
      next2 &&
      next2.isDominant &&
      (next2.semi - next.semi + 12) % 12 === 5;

    if (num === "I7") {
      return buildScaleByIntervals(
        curr.root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    }

    if (
      /#11|b5/i.test(chordString) ||
      category === "tritone_substitute" ||
      num.startsWith("subV") ||
      num === "bVII7" ||
      num === "V7/V" ||
      num === "IV7"
    ) {
      return buildScaleByIntervals(
        curr.root,
        "Lidia b7",
        [0, 2, 4, 6, 7, 9, 10]
      );
    }

    if (precededByMajorII && !/b9|#9|b13/i.test(chordString)) {
      return buildScaleByIntervals(
        curr.root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    }

    if (
      precededByHalfDim ||
      (resolvesFourthUpToMinor && !nextMinorIsPartOfMajorIIV) ||
      /\/(i|ii|iii|vi)$/i.test(num) ||
      /b9|#9|b13/i.test(chordString)
    ) {
      return buildScaleByIntervals(
        curr.root,
        "Frigia Dominante",
        [0, 1, 4, 5, 7, 8, 10],
        true
      );
    }

    if (resolvesFourthUpToMajor) {
      return buildScaleByIntervals(
        curr.root,
        "Mixolidia",
        [0, 2, 4, 5, 7, 9, 10]
      );
    }
  }

  return baseScale;
}

function normalizeKeySelectionValue(
  rawKey: string | undefined,
  isMinorFlag: boolean | undefined
): string {
  const cleanRoot = String(rawKey || "C")
    .replace(/m|-|min/gi, "")
    .trim();
  const isMin = Boolean(isMinorFlag) || /m|-|min/i.test(String(rawKey || ""));
  if (!isMin) {
    const mapMaj: Record<string, string> = {
      "C#": "Db",
      "D#": "Eb",
      Gb: "F#",
      "G#": "Ab",
      "A#": "Bb",
    };
    return mapMaj[cleanRoot] || cleanRoot || "C";
  }
  const mapMin: Record<string, string> = {
    Db: "C#m",
    "C#": "C#m",
    "D#": "Ebm",
    Eb: "Ebm",
    Gb: "F#m",
    "F#": "F#m",
    Ab: "G#m",
    "G#": "G#m",
    "A#": "Bbm",
    Bb: "Bbm",
  };
  return mapMin[cleanRoot] || `${cleanRoot}m`;
}

function normalizeStyleDropdownValue(rawStyle: string | undefined): string {
  const s = String(rawStyle || "Jazz Swing").toLowerCase();
  if (s.includes("samba")) return "Samba";
  if (s.includes("bossa")) return "Bossa Nova";
  if (s.includes("vals") || s.includes("waltz") || s.includes("porte"))
    return "Vals Criollo";
  if (s.includes("bolero")) return "Bolero";
  if (s.includes("cumbia")) return "Cumbia";
  if (s.includes("hip") || s.includes("boom bap")) return "Hip-Hop";
  if (s.includes("reggaet") || s.includes("reguet") || s.includes("dembow"))
    return "Reggaeton";
  if (s.includes("reggae")) return "Reggae";
  if (s.includes("funk") || s.includes("fusion")) return "Funk / Fusion";
  if (s.includes("rock")) return "Rock";
  if (s.includes("soul") || s.includes("r&b")) return "Soul / R&B";
  if (s.includes("pop")) return "Pop";
  if (s.includes("blues") || s.includes("shuffle")) return "Shuffle";
  return "Jazz Swing";
}

function doesStyleAllowGuitar(styleLabel: string | undefined): boolean {
  const norm = normalizeStyleDropdownValue(styleLabel);
  return (
    norm === "Jazz Swing" ||
    norm === "Bossa Nova" ||
    norm === "Samba" ||
    norm === "Bolero" ||
    norm === "Vals Criollo"
  );
}

function getDefaultKeyboardPresetForStyle(
  styleLabel: string | undefined
): HarmonyVoicePresetId {
  const norm = normalizeStyleDropdownValue(styleLabel);
  if (
    norm === "Soul / R&B" ||
    norm === "Funk / Fusion" ||
    norm === "Hip-Hop" ||
    norm === "Reggaeton"
  ) {
    return "rhodes";
  }
  return "grand_piano";
}

function getIdealDrumKitForStyle(
  styleLabel: string | undefined
): DrumKitPresetId {
  const norm = normalizeStyleDropdownValue(styleLabel);
  if (norm === "Reggaeton" || norm === "Hip-Hop") {
    return "urban_808";
  }
  if (
    norm === "Jazz Swing" ||
    norm === "Bossa Nova" ||
    norm === "Samba" ||
    norm === "Bolero" ||
    norm === "Vals Criollo"
  ) {
    return "jazz_vintage";
  }
  return detectDrumKitFromStyle(norm);
}

function formatCompactScaleLabel(
  rawScaleName: string,
  root: string,
  slotCount: 1 | 2 | 4
): string {
  const cleanSc = rawScaleName
    .replace(/\s*\([^)]*\)/g, "")
    .split("·")[0]
    .trim();

  if (slotCount === 1) {
    return cleanSc.toUpperCase().startsWith(root.toUpperCase() + " ")
      ? cleanSc
      : `${root} ${cleanSc}`;
  }

  const compact = cleanSc
    .replace(/Lidia Dominante/gi, "Lidia b7")
    .replace(/Frigia Dominante/gi, "Frigia Dom")
    .replace(/Menor Melódica/gi, "Melódica")
    .replace(/Menor Armónica/gi, "Armónica")
    .replace(/Semidisminuida/gi, "Locria ♮2")
    .replace(/Disminuida/gi, "Dism")
    .replace(/Mixolidia/gi, "Mixo")
    .replace(/Pentatónica/gi, "Penta")
    .replace(/Superlocria/gi, "Alterada")
    .trim();

  if (slotCount >= 4) {
    return compact.replace(new RegExp(`^${root}\\s+`, "i"), "");
  }

  return compact.toUpperCase().startsWith(root.toUpperCase() + " ")
    ? compact
    : `${root} ${compact}`;
}

function extractCleanSectionBadge(
  rawLabel: string | undefined,
  fallback: string
): string {
  if (!rawLabel) return fallback;
  const cleaned = rawLabel
    .replace(/^\[|\]$/g, "")
    .replace(/^(secci[oó]n|section|parte|part)\s*/i, "")
    .trim();
  if (!cleaned) return fallback;
  if (/^intro/i.test(cleaned)) return "IN";
  if (/^coda/i.test(cleaned)) return "CO";
  return cleaned.charAt(0).toUpperCase();
}

function audioBufferToWav(
  buffer: AudioBuffer | Tone.ToneAudioBuffer,
  opt?: { float32?: boolean }
): Blob {
  const rawBuffer: AudioBuffer =
    buffer && typeof (buffer as any).get === "function"
      ? (buffer as any).get()
      : (buffer as AudioBuffer);

  const options = opt || {};
  const numChannels = rawBuffer.numberOfChannels;
  const sampleRate = rawBuffer.sampleRate;
  const format = options.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result: Float32Array;
  if (numChannels === 2) {
    result = interleaveWavChannels(
      rawBuffer.getChannelData(0),
      rawBuffer.getChannelData(1)
    );
  } else {
    result = rawBuffer.getChannelData(0);
  }

  const wavArrayBuffer = encodeWavBuffer(
    result,
    format,
    sampleRate,
    numChannels,
    bitDepth
  );
  return new Blob([wavArrayBuffer], { type: "audio/wav" });
}

function encodeWavBuffer(
  samples: Float32Array,
  format: number,
  sampleRate: number,
  numChannels: number,
  bitDepth: number
): ArrayBuffer {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeWavString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeWavString(view, 8, "WAVE");
  writeWavString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeWavString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  if (format === 1) {
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32Samples(view, 44, samples);
  }

  return buffer;
}

function interleaveWavChannels(
  inputL: Float32Array,
  inputR: Float32Array
): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeFloat32Samples(
  output: DataView,
  offset: number,
  input: Float32Array
): void {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(
  output: DataView,
  offset: number,
  input: Float32Array
): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeWavString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Carga dinámicamente el codificador MP3 real `lamejs` en el navegador y convierte un AudioBuffer
 * en un archivo .MP3 comprimido real (192 kbps), pesando ~10x menos que un WAV y compatible con macOS/iOS/Windows.
 */
async function ensureLameJsLoaded(): Promise<any> {
  if (typeof window !== "undefined" && (window as any).lamejs) {
    return (window as any).lamejs;
  }
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("lamejs-encoder-script");
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).lamejs));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "lamejs-encoder-script";
    script.src =
      "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.all.min.js";
    script.async = true;
    script.onload = () => resolve((window as any).lamejs);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

async function audioBufferToRealMp3(
  buffer: AudioBuffer | Tone.ToneAudioBuffer,
  kbps: number = 192
): Promise<Blob> {
  const rawBuffer: AudioBuffer =
    buffer && typeof (buffer as any).get === "function"
      ? (buffer as any).get()
      : (buffer as AudioBuffer);

  const lame = await ensureLameJsLoaded();
  if (!lame || !lame.Mp3Encoder) {
    throw new Error("No se pudo inicializar el codificador MP3 (lamejs).");
  }

  const numChannels = Math.min(2, rawBuffer.numberOfChannels || 1);
  const sampleRate = rawBuffer.sampleRate || 44100;
  const mp3Encoder = new lame.Mp3Encoder(numChannels, sampleRate, kbps);

  const floatTo16BitIntArray = (float32: Float32Array): Int16Array => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  };

  const leftPcm = floatTo16BitIntArray(rawBuffer.getChannelData(0));
  const rightPcm =
    numChannels > 1
      ? floatTo16BitIntArray(rawBuffer.getChannelData(1))
      : leftPcm;

  const mp3Chunks: Uint8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < leftPcm.length; i += sampleBlockSize) {
    const leftSub = leftPcm.subarray(i, i + sampleBlockSize);
    const rightSub = rightPcm.subarray(i, i + sampleBlockSize);
    const mp3buf =
      numChannels === 2
        ? mp3Encoder.encodeBuffer(leftSub, rightSub)
        : mp3Encoder.encodeBuffer(leftSub);
    if (mp3buf && mp3buf.length > 0) {
      mp3Chunks.push(new Uint8Array(mp3buf));
    }
  }

  const endBuf = mp3Encoder.flush();
  if (endBuf && endBuf.length > 0) {
    mp3Chunks.push(new Uint8Array(endBuf));
  }

  return new Blob(mp3Chunks, { type: "audio/mpeg" });
}

/**
 * Genera buffers de percusión acústicos de estudio para Hi-Hat Cerrado, Hi-Hat Abierto y Rimshot
 * idénticos al timbre real de la aplicación cuando el kit de batería no provee sample externo separado.
 */
function createSynthesizedDrumBuffer(
  type: "hihat_closed" | "hihat_open" | "rim",
  sampleRate: number = 44100
): AudioBuffer {
  const duration =
    type === "hihat_closed" ? 0.085 : type === "hihat_open" ? 0.38 : 0.095;
  const length = Math.floor(sampleRate * duration);
  const ctx = Tone.getContext().rawContext as AudioContext;
  const buf = ctx.createBuffer(2, length, sampleRate);

  const chL = buf.getChannelData(0);
  const chR = buf.getChannelData(1);

  if (type === "rim") {
    // Cross-stick / Rimshot de madera cálido (frecuencias resonantes 420Hz + 1680Hz + click corto)
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 68);
      const clickEnv = Math.exp(-t * 280);
      const body =
        Math.sin(2 * Math.PI * 420 * t) * 0.45 +
        Math.sin(2 * Math.PI * 1680 * t) * 0.55;
      const noise = (Math.random() * 2 - 1) * clickEnv * 0.4;
      const sample = (body * env + noise) * 0.85;
      chL[i] = sample;
      chR[i] = sample;
    }
  } else {
    // Hi-Hat Metálico de Jazz (6 osciladores inarmónicos de bronce + filtrado agudo)
    const freqs = [3120, 4380, 5840, 7420, 9150, 11200];
    const decayRate = type === "hihat_closed" ? 58 : 11.5;
    let prev = 0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const attack = Math.min(1, t / 0.002);
      const env = attack * Math.exp(-t * decayRate);

      let metallic = 0;
      for (let fIdx = 0; fIdx < freqs.length; fIdx++) {
        metallic += Math.sign(Math.sin(2 * Math.PI * freqs[fIdx] * t));
      }
      metallic /= freqs.length;

      const white = Math.random() * 2 - 1;
      const raw = metallic * 0.45 + white * 0.55;
      // High-pass simple para eliminar graves y dejar el "chick" cristalino del hi-hat
      const hp = raw - prev * 0.86;
      prev = raw;

      const out = hp * env * 0.55;
      chL[i] = out;
      chR[i] = out * 0.96;
    }
  }

  return buf;
}

function getBossaChordRootAndFifth(chordString: string): {
  rootSemitone: number;
  thirdSemitones: number;
  fifthSemitones: number;
} {
  const parsed = parseChord(chordString || "C");
  const effectiveBassRoot = parsed.bassNote || parsed.root;
  const rootSemitone = ROOT_MIDI_OFFSET_MAP[effectiveBassRoot] ?? 0;
  const lower = String(chordString || "").toLowerCase();
  const isDim =
    lower.includes("m7b5") ||
    lower.includes("ø") ||
    lower.includes("dim") ||
    lower.includes("°");
  const isAug =
    lower.includes("#5") || lower.includes("+") || lower.includes("aug");
  const isMinor =
    isDim ||
    ((lower.includes("m") || lower.includes("-")) && !lower.includes("maj"));
  return {
    rootSemitone,
    thirdSemitones: isMinor ? 3 : 4,
    fifthSemitones: isDim ? 6 : isAug ? 8 : 7,
  };
}

function getPianoVoicingFreqsForExport(effectiveChord: any): number[] {
  const rawMidis: number[] =
    effectiveChord.voicingMidis && effectiveChord.voicingMidis.length > 0
      ? effectiveChord.voicingMidis
      : buildJazzVoicing(effectiveChord.chordString || "Cmaj7");
  let pianoMidis = rawMidis.filter((m) => m >= 50);
  if (pianoMidis.length < 3) {
    pianoMidis = rawMidis.map((m) => {
      let shifted = m;
      while (shifted < 51) shifted += 12;
      while (shifted > 76) shifted -= 12;
      return shifted;
    });
  }
  const uniqueSorted = Array.from(new Set(pianoMidis)).sort((a, b) => a - b);
  return uniqueSorted.map((m) => 440 * Math.pow(2, (m - 69) / 12));
}

function buildBossaNovaExportComping(
  effectiveChord: any,
  songBeatCursor: number,
  beatsPerBar: number,
  _isSectionB: boolean = false
): {
  freqs: number[];
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const freqs = getPianoVoicingFreqsForExport(effectiveChord);
  const chordBeats = Math.max(
    1,
    Math.round(effectiveChord.beatsLength || beatsPerBar)
  );
  const measureIdx = Math.floor(songBeatCursor / Math.max(1, beatsPerBar));
  const isOddMeasure = measureIdx % 2 === 0;

  if (chordBeats >= 4) {
    if (isOddMeasure) {
      return [
        { freqs, timeOffset: 0.0, durationBeats: 1.2, velocity: 0.76 },
        { freqs, timeOffset: 1.5, durationBeats: 1.2, velocity: 0.82 },
        { freqs, timeOffset: 3.5, durationBeats: 0.85, velocity: 0.72 },
      ];
    } else {
      return [
        { freqs, timeOffset: 1.0, durationBeats: 1.2, velocity: 0.78 },
        { freqs, timeOffset: 2.5, durationBeats: 1.1, velocity: 0.75 },
      ];
    }
  } else if (chordBeats >= 2) {
    return [
      { freqs, timeOffset: 0.0, durationBeats: 1.15, velocity: 0.78 },
      { freqs, timeOffset: 1.5, durationBeats: 0.45, velocity: 0.72 },
    ];
  }
  return [{ freqs, timeOffset: 0.0, durationBeats: 0.85, velocity: 0.75 }];
}

function buildBossaNovaExportBass(
  chordString: string,
  chordBeats: number,
  nextChordString?: string | null
): {
  freq: number;
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const { rootSemitone, fifthSemitones } =
    getBossaChordRootAndFifth(chordString);
  let rootMidi = 36 + rootSemitone;
  if (rootMidi > 43) rootMidi -= 12;
  const fifthMidi = rootMidi + fifthSemitones;

  let approachMidi = fifthMidi;
  if (nextChordString && nextChordString.trim() !== "") {
    const nextInfo = getBossaChordRootAndFifth(nextChordString);
    if (nextInfo.rootSemitone !== rootSemitone) {
      let nextRootMidi = 36 + nextInfo.rootSemitone;
      if (nextRootMidi > 43) nextRootMidi -= 12;
      approachMidi =
        fifthMidi > nextRootMidi ? nextRootMidi + 1 : nextRootMidi - 1;
    }
  }

  const midiToFreqLocal = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

  if (chordBeats >= 4) {
    return [
      {
        midi: rootMidi,
        freq: midiToFreqLocal(rootMidi),
        timeOffset: 0.0,
        durationBeats: 1.42,
        velocity: 0.88,
      },
      {
        midi: fifthMidi,
        freq: midiToFreqLocal(fifthMidi),
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.7,
      },
      {
        midi: fifthMidi,
        freq: midiToFreqLocal(fifthMidi),
        timeOffset: 2.0,
        durationBeats: 1.42,
        velocity: 0.84,
      },
      {
        midi: approachMidi,
        freq: midiToFreqLocal(approachMidi),
        timeOffset: 3.5,
        durationBeats: 0.45,
        velocity: 0.74,
      },
    ];
  } else if (chordBeats >= 2) {
    return [
      {
        midi: rootMidi,
        freq: midiToFreqLocal(rootMidi),
        timeOffset: 0.0,
        durationBeats: 1.42,
        velocity: 0.88,
      },
      {
        midi: approachMidi,
        freq: midiToFreqLocal(approachMidi),
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.74,
      },
    ];
  }

  return [
    {
      midi: rootMidi,
      freq: midiToFreqLocal(rootMidi),
      timeOffset: 0.0,
      durationBeats: 0.9,
      velocity: 0.85,
    },
  ];
}

function buildBossaNovaExportDrumsForBeat(
  beatInMeasure: number,
  songBeat: number,
  beatsPerBar: number,
  isSectionB: boolean = false,
  isEndOfSection: boolean = false
): {
  instrument: "kick" | "snare" | "rim" | "hihat_closed" | "ride";
  timeOffset: number;
  velocity: number;
}[] {
  const measureIdx = Math.floor(songBeat / Math.max(1, beatsPerBar));
  const isOddMeasure = measureIdx % 2 === 0;
  const dynBoost = isSectionB ? 0.08 : 0.0;
  const cymbalInst: "hihat_closed" | "ride" = isSectionB
    ? "ride"
    : "hihat_closed";

  const hits: {
    instrument: "kick" | "snare" | "rim" | "hihat_closed" | "ride";
    timeOffset: number;
    velocity: number;
  }[] = [
    {
      instrument: cymbalInst,
      timeOffset: 0.0,
      velocity: Math.min(0.95, 0.65 + dynBoost * 0.5),
    },
    {
      instrument: cymbalInst,
      timeOffset: 0.5,
      velocity: Math.min(0.9, 0.45 + dynBoost * 0.5),
    },
  ];

  if (beatInMeasure === 0) {
    hits.push({
      instrument: "kick",
      timeOffset: 0.0,
      velocity: Math.min(0.95, 0.78 + dynBoost),
    });
    if (isOddMeasure) {
      hits.push({
        instrument: "rim",
        timeOffset: 0.0,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    } else {
      hits.push({
        instrument: "rim",
        timeOffset: 0.5,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    }
  } else if (beatInMeasure === 1) {
    hits.push({
      instrument: "kick",
      timeOffset: 0.5,
      velocity: Math.min(0.9, 0.55 + dynBoost),
    });
    if (isOddMeasure) {
      hits.push({
        instrument: "rim",
        timeOffset: 0.5,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    }
  } else if (beatInMeasure === 2) {
    hits.push({
      instrument: "kick",
      timeOffset: 0.0,
      velocity: Math.min(0.95, 0.8 + dynBoost),
    });
    if (!isOddMeasure) {
      hits.push({
        instrument: "rim",
        timeOffset: 0.0,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    }
  } else if (beatInMeasure === 3) {
    hits.push({
      instrument: "kick",
      timeOffset: 0.5,
      velocity: Math.min(0.9, 0.58 + dynBoost),
    });
    if (isOddMeasure) {
      hits.push({
        instrument: "rim",
        timeOffset: 0.0,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    } else {
      hits.push({
        instrument: "rim",
        timeOffset: 0.5,
        velocity: Math.min(0.95, 0.68 + dynBoost),
      });
    }
    if (isEndOfSection) {
      hits.push(
        { instrument: "rim", timeOffset: 0.333, velocity: 0.56 },
        { instrument: "snare", timeOffset: 0.667, velocity: 0.68 }
      );
    }
  }

  return hits;
}

function buildJazzSwingExportComping(
  effectiveChord: any,
  songBeatCursor: number,
  beatsPerBar: number,
  isRhythm2Chorus: boolean = false,
  harmonicInst: "piano" | "guitar" | "epiano" = "piano"
): {
  freqs: number[];
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const freqs = getPianoVoicingFreqsForExport(effectiveChord);
  const chordBeats = Math.max(
    1,
    Math.round(effectiveChord.beatsLength || beatsPerBar)
  );
  const measureIdx = Math.floor(songBeatCursor / Math.max(1, beatsPerBar));
  const isOddMeasure = measureIdx % 2 === 0;

  if (harmonicInst === "guitar") {
    const gHits: {
      freqs: number[];
      timeOffset: number;
      durationBeats: number;
      velocity: number;
    }[] = [];
    for (let b = 0; b < chordBeats; b++) {
      const beatInBar = (songBeatCursor + b) % Math.max(1, beatsPerBar);
      const isBackbeat = beatInBar === 1 || beatInBar === 3;
      gHits.push({
        freqs,
        timeOffset: b,
        durationBeats: 0.42,
        velocity: isBackbeat ? 0.7 : 0.62,
      });
    }
    return gHits;
  }

  if (chordBeats >= 4) {
    if (!isRhythm2Chorus) {
      if (isOddMeasure) {
        return [
          { freqs, timeOffset: 0.0, durationBeats: 0.65, velocity: 0.74 },
          { freqs, timeOffset: 1.667, durationBeats: 1.15, velocity: 0.8 },
        ];
      } else {
        return [
          { freqs, timeOffset: 1.0, durationBeats: 0.6, velocity: 0.74 },
          { freqs, timeOffset: 2.667, durationBeats: 1.1, velocity: 0.8 },
        ];
      }
    } else {
      return [
        {
          freqs,
          timeOffset: 0.0,
          durationBeats: 0.65,
          velocity: 0.78,
        },
        { freqs, timeOffset: 1.667, durationBeats: 1.2, velocity: 0.84 },
        { freqs, timeOffset: 3.667, durationBeats: 0.8, velocity: 0.76 },
      ];
    }
  } else if (chordBeats >= 2) {
    return [
      { freqs, timeOffset: 0.0, durationBeats: 0.6, velocity: 0.76 },
      { freqs, timeOffset: 1.667, durationBeats: 0.45, velocity: 0.8 },
    ];
  }

  return [{ freqs, timeOffset: 0.0, durationBeats: 0.75, velocity: 0.76 }];
}

function buildJazzSwingExportBass(
  chordString: string,
  chordBeats: number,
  nextChordString: string | null | undefined,
  songBeatCursor: number,
  beatsPerBar: number,
  isRhythm2Chorus: boolean = false
): {
  freq: number;
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const { rootSemitone, thirdSemitones, fifthSemitones } =
    getBossaChordRootAndFifth(chordString);
  let T = 36 + rootSemitone;
  if (T > 43) T -= 12;

  const third = T + thirdSemitones;
  const fifth = T + fifthSemitones;

  let nextRootMidi = T;
  if (nextChordString && nextChordString.trim() !== "") {
    const nextInfo = getBossaChordRootAndFifth(nextChordString);
    nextRootMidi = 36 + nextInfo.rootSemitone;
    if (nextRootMidi > 43) nextRootMidi -= 12;
  }

  const midiToFreqLocal = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const measureIdx = Math.floor(songBeatCursor / Math.max(1, beatsPerBar));
  const beatInMeasure = songBeatCursor % Math.max(1, beatsPerBar);
  const isOddMeasure = measureIdx % 2 === 0;
  const isSecondHalfOfMeasure = beatInMeasure >= 2;

  const C_to_5 = measureIdx % 2 === 0 ? fifth - 1 : fifth + 1;
  const C_neighbor_T = measureIdx % 2 === 0 ? T - 1 : T + 1;
  const C_to_Next =
    nextRootMidi === T
      ? measureIdx % 2 === 0
        ? nextRootMidi - 1
        : nextRootMidi + 1
      : fifth >= nextRootMidi
      ? nextRootMidi + 1
      : nextRootMidi - 1;

  const useTwoFeel = !isRhythm2Chorus;

  // MODO 1: TWO-FEEL ("IN 2") — Ritmo 1 (Exposición / Cierre)
  if (useTwoFeel) {
    if (chordBeats >= 4) {
      if (measureIdx % 2 === 1) {
        return [
          {
            midi: T,
            freq: midiToFreqLocal(T),
            timeOffset: 0.0,
            durationBeats: 1.85,
            velocity: 0.88,
          },
          {
            midi: fifth,
            freq: midiToFreqLocal(fifth),
            timeOffset: 2.0,
            durationBeats: 0.92,
            velocity: 0.84,
          },
          {
            midi: C_to_Next,
            freq: midiToFreqLocal(C_to_Next),
            timeOffset: 3.0,
            durationBeats: 0.92,
            velocity: 0.78,
          },
        ];
      }
      return [
        {
          midi: T,
          freq: midiToFreqLocal(T),
          timeOffset: 0.0,
          durationBeats: 1.85,
          velocity: 0.88,
        },
        {
          midi: fifth,
          freq: midiToFreqLocal(fifth),
          timeOffset: 2.0,
          durationBeats: 1.85,
          velocity: 0.84,
        },
      ];
    } else if (chordBeats >= 2) {
      if (!isSecondHalfOfMeasure) {
        if (isOddMeasure) {
          return [
            {
              midi: T,
              freq: midiToFreqLocal(T),
              timeOffset: 0.0,
              durationBeats: 0.92,
              velocity: 0.88,
            },
            {
              midi: C_to_Next,
              freq: midiToFreqLocal(C_to_Next),
              timeOffset: 1.0,
              durationBeats: 0.92,
              velocity: 0.78,
            },
          ];
        }
        return [
          {
            midi: T,
            freq: midiToFreqLocal(T),
            timeOffset: 0.0,
            durationBeats: 1.85,
            velocity: 0.88,
          },
        ];
      } else {
        const secondNoteMidi = isOddMeasure ? fifth : C_to_Next;
        return [
          {
            midi: T,
            freq: midiToFreqLocal(T),
            timeOffset: 0.0,
            durationBeats: 0.92,
            velocity: 0.86,
          },
          {
            midi: secondNoteMidi,
            freq: midiToFreqLocal(secondNoteMidi),
            timeOffset: 1.0,
            durationBeats: 0.92,
            velocity: 0.78,
          },
        ];
      }
    }

    return [
      {
        midi: T,
        freq: midiToFreqLocal(T),
        timeOffset: 0.0,
        durationBeats: 0.92,
        velocity: 0.86,
      },
    ];
  }

  // MODO 2: WALKING BASS ("IN 4") — Sección B/C o vueltas de improvisación (currentChorus > 1)
  if (chordBeats >= 4) {
    const formulaIdx = measureIdx % 3;
    const beat2Note =
      formulaIdx === 0 ? third : formulaIdx === 1 ? C_to_5 : C_neighbor_T;
    const beat3Note = formulaIdx === 2 ? T : fifth;

    return [
      {
        midi: T,
        freq: midiToFreqLocal(T),
        timeOffset: 0.0,
        durationBeats: 0.92,
        velocity: 0.9,
      },
      {
        midi: beat2Note,
        freq: midiToFreqLocal(beat2Note),
        timeOffset: 1.0,
        durationBeats: 0.92,
        velocity: 0.85,
      },
      {
        midi: beat3Note,
        freq: midiToFreqLocal(beat3Note),
        timeOffset: 2.0,
        durationBeats: 0.92,
        velocity: 0.88,
      },
      {
        midi: C_to_Next,
        freq: midiToFreqLocal(C_to_Next),
        timeOffset: 3.0,
        durationBeats: 0.92,
        velocity: 0.84,
      },
    ];
  } else if (chordBeats >= 2) {
    if (!isSecondHalfOfMeasure) {
      const secondBeatMidi = isOddMeasure ? C_to_Next : fifth;
      return [
        {
          midi: T,
          freq: midiToFreqLocal(T),
          timeOffset: 0.0,
          durationBeats: 0.92,
          velocity: 0.9,
        },
        {
          midi: secondBeatMidi,
          freq: midiToFreqLocal(secondBeatMidi),
          timeOffset: 1.0,
          durationBeats: 0.92,
          velocity: 0.84,
        },
      ];
    } else {
      return [
        {
          midi: T,
          freq: midiToFreqLocal(T),
          timeOffset: 0.0,
          durationBeats: 0.92,
          velocity: 0.88,
        },
        {
          midi: C_to_Next,
          freq: midiToFreqLocal(C_to_Next),
          timeOffset: 1.0,
          durationBeats: 0.92,
          velocity: 0.84,
        },
      ];
    }
  }

  return [
    {
      midi: T,
      freq: midiToFreqLocal(T),
      timeOffset: 0.0,
      durationBeats: 0.92,
      velocity: 0.88,
    },
  ];
}

function buildJazzSwingExportDrumsForBeat(
  beatInMeasure: number,
  songBeat: number,
  beatsPerBar: number,
  isSectionB: boolean = false,
  isEndOfSection: boolean = false
): {
  instrument:
    | "kick"
    | "snare"
    | "rim"
    | "hihat_closed"
    | "hihat_pedal"
    | "ride";
  timeOffset: number;
  velocity: number;
}[] {
  const measureIdx = Math.floor(songBeat / Math.max(1, beatsPerBar));
  const isOddMeasure = measureIdx % 2 === 0;
  const hits: {
    instrument:
      | "kick"
      | "snare"
      | "rim"
      | "hihat_closed"
      | "hihat_pedal"
      | "ride";
    timeOffset: number;
    velocity: number;
  }[] = [];

  if (!isSectionB) {
    hits.push({ instrument: "hihat_closed", timeOffset: 0.0, velocity: 0.68 });
    if (beatInMeasure === 1 || beatInMeasure === 3) {
      hits.push({ instrument: "hihat_pedal", timeOffset: 0.0, velocity: 0.65 });
      hits.push({
        instrument: "hihat_closed",
        timeOffset: 0.667,
        velocity: 0.56,
      });
    }
    if (beatInMeasure === 1) {
      hits.push({ instrument: "rim", timeOffset: 0.667, velocity: 0.55 });
    } else if (beatInMeasure === 3) {
      hits.push({ instrument: "rim", timeOffset: 0.0, velocity: 0.55 });
    }
  } else {
    hits.push({ instrument: "ride", timeOffset: 0.0, velocity: 0.78 });
    if (beatInMeasure === 1 || beatInMeasure === 3) {
      hits.push({ instrument: "hihat_pedal", timeOffset: 0.0, velocity: 0.76 });
      hits.push({ instrument: "ride", timeOffset: 0.667, velocity: 0.64 });
    }
    if (beatInMeasure === 0) {
      hits.push({ instrument: "snare", timeOffset: 0.667, velocity: 0.48 });
    } else if (beatInMeasure === 2 && isOddMeasure) {
      hits.push({ instrument: "snare", timeOffset: 0.667, velocity: 0.48 });
    } else if (beatInMeasure === 3 && !isOddMeasure && !isEndOfSection) {
      hits.push({ instrument: "snare", timeOffset: 0.667, velocity: 0.48 });
    }
  }

  if (isEndOfSection && beatInMeasure === 3) {
    hits.push(
      { instrument: "snare", timeOffset: 0.0, velocity: 0.58 },
      { instrument: "snare", timeOffset: 0.333, velocity: 0.66 },
      { instrument: "snare", timeOffset: 0.667, velocity: 0.76 }
    );
  }

  return hits;
}

function buildFunkExportComping(
  effectiveChord: any,
  songBeatCursor: number,
  beatsPerBar: number
): {
  freqs: number[];
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const freqs = getPianoVoicingFreqsForExport(effectiveChord);
  const chordBeats = Math.max(
    1,
    Math.round(effectiveChord.beatsLength || beatsPerBar)
  );
  const measureIdx = Math.floor(songBeatCursor / Math.max(1, beatsPerBar));
  const barInPhrase = ((measureIdx % 4) + 4) % 4;

  if (chordBeats >= 4) {
    if (barInPhrase === 0) {
      return [
        { freqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
        { freqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.74 },
        { freqs, timeOffset: 1.5, durationBeats: 0.65, velocity: 0.85 },
        { freqs, timeOffset: 3.25, durationBeats: 0.45, velocity: 0.78 },
      ];
    } else if (barInPhrase === 1) {
      return [
        { freqs, timeOffset: 0.5, durationBeats: 0.35, velocity: 0.78 },
        { freqs, timeOffset: 1.75, durationBeats: 0.45, velocity: 0.84 },
        { freqs, timeOffset: 2.5, durationBeats: 0.45, velocity: 0.80 },
        { freqs, timeOffset: 3.5, durationBeats: 0.35, velocity: 0.76 },
      ];
    } else if (barInPhrase === 2) {
      return [
        { freqs, timeOffset: 0.0, durationBeats: 0.40, velocity: 0.82 },
        { freqs, timeOffset: 1.25, durationBeats: 0.28, velocity: 0.75 },
        { freqs, timeOffset: 1.75, durationBeats: 0.50, velocity: 0.84 },
        { freqs, timeOffset: 3.0, durationBeats: 0.60, velocity: 0.80 },
      ];
    } else {
      return [
        { freqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
        { freqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.76 },
        { freqs, timeOffset: 2.0, durationBeats: 0.45, velocity: 0.80 },
        { freqs, timeOffset: 3.25, durationBeats: 0.25, velocity: 0.82 },
        { freqs, timeOffset: 3.75, durationBeats: 0.25, velocity: 0.85 },
      ];
    }
  } else if (chordBeats >= 2) {
    return [
      { freqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
      { freqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.75 },
      { freqs, timeOffset: 1.5, durationBeats: 0.35, velocity: 0.80 },
    ];
  }

  return [{ freqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.80 }];
}

function buildFunkExportBass(
  chordString: string,
  chordBeats: number,
  nextChordString: string | null | undefined,
  songBeatCursor: number,
  beatsPerBar: number,
  isRhythm2Chorus: boolean = false
): {
  freq: number;
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const { rootSemitone, thirdSemitones } = getBossaChordRootAndFifth(chordString);
  let R = 36 + rootSemitone;
  if (R > 43) R -= 12;

  const isMinor = thirdSemitones === 3;
  const lower = String(chordString || "").toLowerCase();
  const isMaj7 =
    lower.includes("maj") ||
    String(chordString || "").includes("Δ") ||
    String(chordString || "").includes("^") ||
    (String(chordString || "").includes("M7") && !lower.includes("m7"));

  const third = R + (isMinor ? 3 : 4);
  const fifth = R + 7;
  const seventh = R + (isMaj7 ? 11 : 10);
  const octave = R + 12;

  let nextRootMidi = R;
  if (nextChordString && nextChordString.trim() !== "") {
    const nextInfo = getBossaChordRootAndFifth(nextChordString);
    nextRootMidi = 36 + nextInfo.rootSemitone;
    if (nextRootMidi > 43) nextRootMidi -= 12;
  }
  const chromNext = nextRootMidi - 1;

  const midiToFreqLocal = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const measureIdx = Math.floor(songBeatCursor / Math.max(1, beatsPerBar));
  const barInPhrase = ((measureIdx % 4) + 4) % 4;
  const velBoost = isRhythm2Chorus ? 0.04 : 0.0;

  if (chordBeats >= 4) {
    if (barInPhrase === 0) {
      const hits = [
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: octave, freq: midiToFreqLocal(octave), timeOffset: 0.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: seventh, freq: midiToFreqLocal(seventh), timeOffset: 1.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.86 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 2.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.75 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.76 + velBoost) },
        { midi: chromNext, freq: midiToFreqLocal(chromNext), timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: R, freq: midiToFreqLocal(R), timeOffset: 1.25, durationBeats: 0.20, velocity: 0.68 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else if (barInPhrase === 1) {
      const hits = [
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.42, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.74 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 1.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: octave, freq: midiToFreqLocal(octave), timeOffset: 1.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.84 + velBoost) },
        { midi: third, freq: midiToFreqLocal(third), timeOffset: 2.5, durationBeats: 0.45, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: chromNext, freq: midiToFreqLocal(chromNext), timeOffset: 3.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: seventh, freq: midiToFreqLocal(seventh), timeOffset: 3.25, durationBeats: 0.20, velocity: 0.72 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else if (barInPhrase === 2) {
      const hits = [
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 0.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.76 + velBoost) },
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 1.25, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.84 + velBoost) },
        { midi: seventh, freq: midiToFreqLocal(seventh), timeOffset: 2.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: octave, freq: midiToFreqLocal(octave), timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: chromNext, freq: midiToFreqLocal(chromNext), timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: octave, freq: midiToFreqLocal(octave), timeOffset: 1.75, durationBeats: 0.20, velocity: 0.70 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else {
      const hits = [
        { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 1.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: octave, freq: midiToFreqLocal(octave), timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.85 + velBoost) },
        { midi: third, freq: midiToFreqLocal(third), timeOffset: 3.0, durationBeats: 0.22, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 3.25, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: seventh, freq: midiToFreqLocal(seventh), timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
        { midi: chromNext, freq: midiToFreqLocal(chromNext), timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.86 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: octave, freq: midiToFreqLocal(octave), timeOffset: 0.75, durationBeats: 0.22, velocity: 0.76 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    }
  } else if (chordBeats >= 2) {
    return [
      { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.45, velocity: 0.90 },
      { midi: octave, freq: midiToFreqLocal(octave), timeOffset: 0.75, durationBeats: 0.22, velocity: 0.80 },
      { midi: fifth, freq: midiToFreqLocal(fifth), timeOffset: 1.5, durationBeats: 0.22, velocity: 0.78 },
      { midi: chromNext, freq: midiToFreqLocal(chromNext), timeOffset: 1.75, durationBeats: 0.22, velocity: 0.82 },
    ];
  }

  return [
    { midi: R, freq: midiToFreqLocal(R), timeOffset: 0.0, durationBeats: 0.45, velocity: 0.88 },
  ];
}

function buildFunkExportDrumsForBeat(
  beatInMeasure: number,
  songBeat: number,
  beatsPerBar: number,
  isRhythm2Chorus: boolean = false
): {
  instrument:
    | "kick"
    | "snare"
    | "rim"
    | "hihat_closed"
    | "hihat_pedal"
    | "hihat_open"
    | "ride";
  timeOffset: number;
  velocity: number;
}[] {
  const measureIdx = Math.floor(songBeat / Math.max(1, beatsPerBar));
  const barInPhrase = ((measureIdx % 4) + 4) % 4;
  const isOpenHatOn3And =
    (barInPhrase === 1 || barInPhrase === 3) && beatInMeasure === 3;

  const hits: {
    instrument:
      | "kick"
      | "snare"
      | "rim"
      | "hihat_closed"
      | "hihat_pedal"
      | "hihat_open"
      | "ride";
    timeOffset: number;
    velocity: number;
  }[] = [];

  // 1. Hi-Hat Cerrado (MIDI 42)
  if (!isRhythm2Chorus) {
    hits.push({ instrument: "hihat_closed", timeOffset: 0.0, velocity: 0.68 });
    if (beatInMeasure === 0 || beatInMeasure === 1) {
      hits.push({ instrument: "hihat_closed", timeOffset: 0.25, velocity: 0.45 });
    }
    if (isOpenHatOn3And) {
      hits.push({ instrument: "hihat_closed", timeOffset: 0.5, velocity: 0.75 });
    } else {
      hits.push({ instrument: "hihat_closed", timeOffset: 0.5, velocity: 0.45 });
    }
  } else {
    hits.push({ instrument: "hihat_closed", timeOffset: 0.0, velocity: 0.72 });
    hits.push({ instrument: "hihat_closed", timeOffset: 0.25, velocity: 0.42 });
    if (isOpenHatOn3And) {
      hits.push({ instrument: "hihat_closed", timeOffset: 0.5, velocity: 0.75 });
    } else {
      hits.push({ instrument: "hihat_closed", timeOffset: 0.5, velocity: 0.72 });
    }
    hits.push({ instrument: "hihat_closed", timeOffset: 0.75, velocity: 0.42 });
  }

  // 2. Caja / Snare (MIDI 38) + Ghost Notes + Fill en Compás 4
  if (beatInMeasure === 1 || beatInMeasure === 3) {
    hits.push({ instrument: "snare", timeOffset: 0.0, velocity: 0.90 });
  }
  if (barInPhrase === 0) {
    if (beatInMeasure === 0 || beatInMeasure === 1) {
      hits.push({ instrument: "snare", timeOffset: 0.75, velocity: 0.38 });
    } else if (beatInMeasure === 2) {
      hits.push({ instrument: "snare", timeOffset: 0.25, velocity: 0.38 });
    }
  } else if (barInPhrase === 1) {
    if (beatInMeasure === 1 || beatInMeasure === 3) {
      hits.push({ instrument: "snare", timeOffset: 0.75, velocity: 0.38 });
    } else if (beatInMeasure === 2) {
      hits.push({ instrument: "snare", timeOffset: 0.25, velocity: 0.38 });
    }
  } else if (barInPhrase === 2) {
    if (beatInMeasure === 0 || beatInMeasure === 2) {
      hits.push({ instrument: "snare", timeOffset: 0.75, velocity: 0.38 });
    } else if (beatInMeasure === 1) {
      hits.push({ instrument: "snare", timeOffset: 0.25, velocity: 0.38 });
    }
  } else if (barInPhrase === 3) {
    if (beatInMeasure === 0 || beatInMeasure === 1) {
      hits.push({ instrument: "snare", timeOffset: 0.75, velocity: 0.38 });
    } else if (beatInMeasure === 3) {
      hits.push(
        { instrument: "snare", timeOffset: 0.25, velocity: 0.55 },
        { instrument: "snare", timeOffset: 0.5, velocity: 0.70 },
        { instrument: "snare", timeOffset: 0.75, velocity: 0.85 }
      );
    }
  }

  // 3. Bombo / Kick (MIDI 36) — 4 Variaciones
  if (barInPhrase === 0) {
    if (beatInMeasure === 0) {
      hits.push(
        { instrument: "kick", timeOffset: 0.0, velocity: 0.92 },
        { instrument: "kick", timeOffset: 0.75, velocity: 0.72 }
      );
    } else if (beatInMeasure === 2) {
      hits.push(
        { instrument: "kick", timeOffset: 0.0, velocity: 0.85 },
        { instrument: "kick", timeOffset: 0.5, velocity: 0.78 }
      );
    }
  } else if (barInPhrase === 1) {
    if (beatInMeasure === 0) {
      hits.push({ instrument: "kick", timeOffset: 0.0, velocity: 0.92 });
    } else if (beatInMeasure === 1) {
      hits.push(
        { instrument: "kick", timeOffset: 0.5, velocity: 0.76 },
        { instrument: "kick", timeOffset: 0.75, velocity: 0.82 }
      );
    } else if (beatInMeasure === 2) {
      hits.push({ instrument: "kick", timeOffset: 0.5, velocity: 0.80 });
    }
  } else if (barInPhrase === 2) {
    if (beatInMeasure === 0) {
      hits.push(
        { instrument: "kick", timeOffset: 0.0, velocity: 0.92 },
        { instrument: "kick", timeOffset: 0.5, velocity: 0.75 }
      );
    } else if (beatInMeasure === 2) {
      hits.push(
        { instrument: "kick", timeOffset: 0.25, velocity: 0.80 },
        { instrument: "kick", timeOffset: 0.75, velocity: 0.76 }
      );
    }
  } else if (barInPhrase === 3) {
    if (beatInMeasure === 0) {
      hits.push({ instrument: "kick", timeOffset: 0.0, velocity: 0.92 });
    } else if (beatInMeasure === 1) {
      hits.push({ instrument: "kick", timeOffset: 0.5, velocity: 0.80 });
    } else if (beatInMeasure === 2) {
      hits.push({ instrument: "kick", timeOffset: 0.5, velocity: 0.84 });
    } else if (beatInMeasure === 3) {
      hits.push({ instrument: "kick", timeOffset: 0.5, velocity: 0.78 });
    }
  }

  return hits;
}

/**
 * EXPORTADOR MIDI PROFESIONAL MULTIPISTA (Piano/Guitarra Comping Real + Walking Bass + Batería General MIDI Canal 10)
 */
function buildStandardMidiFileBlob(
  sequence: any[],
  bpm: number,
  songTitle: string,
  activeStyle: DrumStyle,
  harmonicInst: "piano" | "guitar" | "epiano",
  timeSig: string,
  chorusesCount: number = 1,
  includeHarmony: boolean = true,
  includeBass: boolean = true,
  includeDrums: boolean = true
): Blob {
  const ppq = 480;
  const safeBpm = Math.max(30, Math.min(300, Number(bpm) || 120));
  const mpqn = Math.round(60000000 / safeBpm);
  const beatsPerBar =
    parseInt(timeSig.split("/")[0], 10) || getBeatsPerBar(timeSig);

  const writeVarLen = (val: number): number[] => {
    let v = Math.max(0, Math.round(val));
    let buffer = v & 0x7f;
    const bytes: number[] = [];
    while ((v >>= 7)) {
      buffer <<= 8;
      buffer |= (v & 0x7f) | 0x80;
    }
    while (true) {
      bytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
    return bytes;
  };

  const freqToMidi = (freq: number): number => {
    if (!freq || freq <= 0 || isNaN(freq)) return 60;
    return Math.max(
      21,
      Math.min(108, Math.round(69 + 12 * Math.log2(freq / 440)))
    );
  };

  interface RawMidiEvent {
    tick: number;
    data: number[];
  }

  const events: RawMidiEvent[] = [];

  events.push({
    tick: 0,
    data: [
      0xff,
      0x51,
      0x03,
      (mpqn >> 16) & 0xff,
      (mpqn >> 8) & 0xff,
      mpqn & 0xff,
    ],
  });

  const titleBytes = Array.from(songTitle || "Rumie Harmonic Pro").map((ch) =>
    Math.min(127, ch.charCodeAt(0))
  );
  events.push({
    tick: 0,
    data: [0xff, 0x03, titleBytes.length, ...titleBytes],
  });

  const harmProgram =
    harmonicInst === "guitar" ? 24 : harmonicInst === "epiano" ? 4 : 0;
  events.push({ tick: 0, data: [0xc0, harmProgram] });
  events.push({ tick: 0, data: [0xc1, 32] });

  const GM_DRUM_NOTE_MAP: Record<string, number> = {
    kick: 36,
    snare: 38,
    rim: 37,
    hihat: 42,
    hihat_closed: 42,
    hihat_pedal: 44,
    hihat_open: 42,
    ride: 51,
  };

  const safeChoruses = Math.max(1, Math.min(10, chorusesCount || 1));
  const countInBars = safeBpm > 150 ? 2 : 1;
  const countInBeats = countInBars * beatsPerBar;

  // Conteo de entrada (Count-In) en Canal 10 GM (0x99 / 0x89)
  for (let cBeat = 0; cBeat < countInBeats; cBeat++) {
    const isAccent = cBeat % beatsPerBar === 0;
    const clickMidiNote = 37; // Side Stick / Rimshot (GM 37)
    const clickVel = isAccent ? 115 : 85;
    const startTick = Math.round(cBeat * ppq);
    const durTicks = Math.min(120, Math.round(ppq * 0.25));
    events.push({
      tick: Math.max(0, startTick),
      data: [0x99, clickMidiNote, clickVel],
    });
    events.push({
      tick: Math.max(0, startTick + durTicks),
      data: [0x89, clickMidiNote, 0],
    });
  }

  let globalBeatCursor = countInBeats;
  const beatSectionMap: {
    isRhythm2Chorus: boolean;
    isEndOfChorus: boolean;
  }[] = [];

  for (let chorus = 1; chorus <= safeChoruses; chorus++) {
    const isRhythm2Chorus =
      safeChoruses === 1
        ? false
        : safeChoruses === 2
        ? chorus === 2
        : chorus > 1 && chorus < safeChoruses;

    for (let i = 0; i < sequence.length; i++) {
      const currentChord = sequence[i];
      const chordBeats = currentChord.beatsLength || beatsPerBar;
      const isEndOfChorus = i === sequence.length - 1;

      for (let b = 0; b < Math.round(chordBeats); b++) {
        beatSectionMap.push({ isRhythm2Chorus, isEndOfChorus });
      }

      let effectiveChord = currentChord;
      if (!effectiveChord.chordString) {
        for (let back = 1; back <= sequence.length; back++) {
          const prevIdx = (i - back + sequence.length) % sequence.length;
          if (sequence[prevIdx] && sequence[prevIdx].chordString) {
            effectiveChord = {
              ...currentChord,
              chordString: sequence[prevIdx].chordString,
              frequencies: sequence[prevIdx].frequencies,
              voicingMidis: sequence[prevIdx].voicingMidis,
              parsedRoot: sequence[prevIdx].parsedRoot,
              parsedType: sequence[prevIdx].parsedType,
            };
            break;
          }
        }
      }

      let nextChordString: string | null = null;
      if (i + 1 < sequence.length) {
        nextChordString =
          sequence[i + 1].chordString || effectiveChord.chordString;
      } else if (sequence.length > 0) {
        nextChordString =
          sequence[0].chordString || effectiveChord.chordString;
      }

      const rawStyleLower = String(activeStyle || "").toLowerCase();
      const isBossa =
        rawStyleLower.includes("bossa") && !rawStyleLower.includes("samba");
      const isFunk = rawStyleLower.includes("funk");
      const isJazzSwing =
        !isBossa &&
        !isFunk &&
        !rawStyleLower.includes("samba") &&
        !rawStyleLower.includes("vals") &&
        !rawStyleLower.includes("waltz") &&
        !rawStyleLower.includes("bolero") &&
        !rawStyleLower.includes("reggaet") &&
        !rawStyleLower.includes("hip") &&
        (rawStyleLower.includes("swing") || rawStyleLower.includes("jazz"));
      const songBeatCursor = Math.max(0, globalBeatCursor - countInBeats);

      if (effectiveChord.chordString) {
        if (includeHarmony) {
          const compingHits = isBossa
            ? buildBossaNovaExportComping(
                effectiveChord,
                songBeatCursor,
                beatsPerBar,
                isRhythm2Chorus
              )
            : isJazzSwing
            ? buildJazzSwingExportComping(
                effectiveChord,
                songBeatCursor,
                beatsPerBar,
                isRhythm2Chorus,
                harmonicInst
              )
            : isFunk
            ? buildFunkExportComping(
                effectiveChord,
                songBeatCursor,
                beatsPerBar
              )
            : generateComping(
                effectiveChord,
                activeStyle,
                globalBeatCursor,
                harmonicInst,
                timeSig
              );
          compingHits.forEach((hit) => {
            if (!hit.freqs || hit.freqs.length === 0) return;
            const startTick = Math.round(
              (globalBeatCursor + hit.timeOffset) * ppq
            );
            const durTicks = Math.max(
              60,
              Math.round(hit.durationBeats * ppq) - 12
            );
            const vel = Math.max(
              45,
              Math.min(115, Math.round((hit.velocity ?? 0.8) * 105))
            );

            const midiNotes = Array.from(
              new Set(hit.freqs.map((f) => freqToMidi(f)))
            );
            midiNotes.forEach((mNote) => {
              events.push({
                tick: Math.max(0, startTick),
                data: [0x90, mNote, vel],
              });
              events.push({
                tick: Math.max(0, startTick + durTicks),
                data: [0x80, mNote, 0],
              });
            });
          });
        }

        if (includeBass) {
          const bassNotes = isBossa
            ? buildBossaNovaExportBass(
                effectiveChord.chordString,
                chordBeats,
                nextChordString
              )
            : isJazzSwing
            ? buildJazzSwingExportBass(
                effectiveChord.chordString,
                chordBeats,
                nextChordString,
                songBeatCursor,
                beatsPerBar,
                isRhythm2Chorus
              )
            : isFunk
            ? buildFunkExportBass(
                effectiveChord.chordString,
                chordBeats,
                nextChordString,
                songBeatCursor,
                beatsPerBar,
                isRhythm2Chorus
              )
            : generateWalkingBass(
                effectiveChord.chordString,
                chordBeats,
                nextChordString,
                activeStyle,
                globalBeatCursor,
                timeSig
              );
          bassNotes.forEach((bn) => {
            if (!bn.freq || isNaN(bn.freq)) return;
            const startTick = Math.round(
              (globalBeatCursor + bn.timeOffset) * ppq
            );
            const durTicks =
              isBossa || isJazzSwing || isFunk
                ? Math.max(45, Math.round(bn.durationBeats * ppq))
                : Math.max(60, Math.round(bn.durationBeats * ppq * 0.9) - 10);
            const mNote = Math.max(28, Math.min(60, freqToMidi(bn.freq)));
            const bassVel =
              typeof (bn as any).velocity === "number"
                ? Math.max(
                    45,
                    Math.min(120, Math.round((bn as any).velocity * 110))
                  )
                : 96;
            events.push({
              tick: Math.max(0, startTick),
              data: [0x91, mNote, bassVel],
            });
            events.push({
              tick: Math.max(0, startTick + durTicks),
              data: [0x81, mNote, 0],
            });
          });
        }
      }

      globalBeatCursor += chordBeats;
    }
  }

  if (includeDrums && activeStyle !== "Metronome Básico") {
    const rawStyleLower = String(activeStyle || "").toLowerCase();
    const isBossaDrums =
      rawStyleLower.includes("bossa") && !rawStyleLower.includes("samba");
    const isFunkDrums = rawStyleLower.includes("funk");
    const isJazzSwingDrums =
      !isBossaDrums &&
      !isFunkDrums &&
      !rawStyleLower.includes("samba") &&
      !rawStyleLower.includes("vals") &&
      !rawStyleLower.includes("waltz") &&
      !rawStyleLower.includes("bolero") &&
      !rawStyleLower.includes("reggaet") &&
      !rawStyleLower.includes("hip") &&
      (rawStyleLower.includes("swing") || rawStyleLower.includes("jazz"));
    const totalBeatsToRender = Math.round(globalBeatCursor);
    for (let gBeat = countInBeats; gBeat < totalBeatsToRender; gBeat++) {
      const songBeat = gBeat - countInBeats;
      const beatInMeasure = songBeat % beatsPerBar;
      const secInfo = beatSectionMap[songBeat] || {
        isRhythm2Chorus: false,
        isEndOfChorus: false,
      };
      const allDrumHits = isBossaDrums
        ? buildBossaNovaExportDrumsForBeat(
            beatInMeasure,
            songBeat,
            beatsPerBar,
            secInfo.isRhythm2Chorus,
            secInfo.isEndOfChorus
          )
        : isJazzSwingDrums
        ? buildJazzSwingExportDrumsForBeat(
            beatInMeasure,
            songBeat,
            beatsPerBar,
            secInfo.isRhythm2Chorus,
            secInfo.isEndOfChorus
          )
        : isFunkDrums
        ? buildFunkExportDrumsForBeat(
            beatInMeasure,
            songBeat,
            beatsPerBar,
            secInfo.isRhythm2Chorus
          )
        : (() => {
            const matrix = getDrumMatrixForBeat(
              activeStyle,
              beatInMeasure,
              songBeat,
              timeSig
            );
            return [
              ...matrix.kick,
              ...matrix.snare,
              ...matrix.hihat,
              ...matrix.ride,
            ];
          })();

      allDrumHits.forEach((hit) => {
        const drumMidiNote = GM_DRUM_NOTE_MAP[hit.instrument] || 42;
        const startTick = Math.round((gBeat + hit.timeOffset) * ppq);
        const durTicks = 110;
        const vel = Math.max(
          35,
          Math.min(120, Math.round((hit.velocity ?? 0.75) * 115))
        );
        events.push({
          tick: Math.max(0, startTick),
          data: [0x99, drumMidiNote, vel],
        });
        events.push({
          tick: Math.max(0, startTick + durTicks),
          data: [0x89, drumMidiNote, 0],
        });
      });
    }
  }

  events.sort((a, b) => a.tick - b.tick);

  const trackBytes: number[] = [];
  let lastTick = 0;
  for (const ev of events) {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;
    trackBytes.push(...writeVarLen(delta), ...ev.data);
  }
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  const header = [
    0x4d,
    0x54,
    0x68,
    0x64,
    0x00,
    0x00,
    0x00,
    0x06,
    0x00,
    0x00,
    0x00,
    0x01,
    (ppq >> 8) & 0xff,
    ppq & 0xff,
  ];

  const len = trackBytes.length;
  const trackHeader = [
    0x4d,
    0x54,
    0x72,
    0x6b,
    (len >> 24) & 0xff,
    (len >> 16) & 0xff,
    (len >> 8) & 0xff,
    len & 0xff,
  ];

  const fullArray = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
  return new Blob([fullArray], { type: "audio/midi" });
}

export interface FlattenedMeasure extends SongMeasure {
  measure: SongMeasure;
  originalIndex: number;
  isEndOfPlayback?: boolean;
}

export function flattenCompasses(compasses: SongMeasure[]): FlattenedMeasure[] {
  if (!compasses || compasses.length === 0) return [];

  const cloneMeasure = (
    m: SongMeasure,
    originalIndex: number,
    isEndOfPlayback: boolean = false
  ): FlattenedMeasure => {
    const cloned: SongMeasure = JSON.parse(JSON.stringify(m));
    return {
      ...cloned,
      measure: cloned,
      originalIndex,
      isEndOfPlayback: isEndOfPlayback || !!m.isEnd,
    };
  };

  const result: FlattenedMeasure[] = [];
  let idx = 0;

  while (idx < compasses.length) {
    let repeatStartIdx = idx;
    let volta1StartIdx = -1;
    let repeatEndIdx = -1;
    let volta2StartIdx = -1;

    for (let scan = idx; scan < compasses.length; scan++) {
      if (
        compasses[scan].repeatStart &&
        scan > idx &&
        volta1StartIdx === -1 &&
        repeatEndIdx === -1
      ) {
        break;
      }
      if (compasses[scan].repeatStart && scan === idx) {
        repeatStartIdx = scan;
      }
      if (compasses[scan].volta === 1 && volta1StartIdx === -1) {
        volta1StartIdx = scan;
      }
      if (compasses[scan].repeatEnd && repeatEndIdx === -1) {
        repeatEndIdx = scan;
        if (
          scan + 1 < compasses.length &&
          compasses[scan + 1].volta === 2
        ) {
          volta2StartIdx = scan + 1;
        }
        break;
      }
      if (compasses[scan].volta === 2 && volta1StartIdx !== -1) {
        volta2StartIdx = scan;
        if (repeatEndIdx === -1) {
          repeatEndIdx = scan - 1;
        }
        break;
      }
    }

    if (
      volta1StartIdx !== -1 &&
      volta2StartIdx !== -1 &&
      volta1StartIdx < volta2StartIdx
    ) {
      const volta1EndIdx =
        repeatEndIdx !== -1 &&
        repeatEndIdx >= volta1StartIdx &&
        repeatEndIdx < volta2StartIdx
          ? repeatEndIdx
          : volta2StartIdx - 1;

      for (let i = repeatStartIdx; i <= volta1EndIdx; i++) {
        const isEnd = !!compasses[i].isEnd;
        result.push(cloneMeasure(compasses[i], i, isEnd));
        if (isEnd) return result;
      }

      for (let i = repeatStartIdx; i < volta1StartIdx; i++) {
        const isEnd = !!compasses[i].isEnd;
        result.push(cloneMeasure(compasses[i], i, isEnd));
        if (isEnd) return result;
      }

      idx = volta2StartIdx;
      continue;
    }

    if (repeatEndIdx !== -1 && repeatEndIdx >= repeatStartIdx) {
      for (let i = repeatStartIdx; i <= repeatEndIdx; i++) {
        const isEnd = !!compasses[i].isEnd;
        result.push(cloneMeasure(compasses[i], i, isEnd));
        if (isEnd) return result;
      }
      for (let i = repeatStartIdx; i <= repeatEndIdx; i++) {
        const isEnd = !!compasses[i].isEnd;
        result.push(cloneMeasure(compasses[i], i, isEnd));
        if (isEnd) return result;
      }
      idx = repeatEndIdx + 1;
      continue;
    }

    const isEnd = !!compasses[idx].isEnd;
    result.push(cloneMeasure(compasses[idx], idx, isEnd));
    if (isEnd) return result;
    idx++;
  }

  return result;
}

export const linearizeSongMeasures = flattenCompasses;

function unobfuscateIRealString(raw: string): string {
  let s = raw.trim();
  if (!s.startsWith("1r34LbKcu7")) return s;
  s = s.slice(10);
  const arr = s.split("");
  for (let i = 0; i + 50 <= arr.length; i += 50) {
    if (arr.length - i < 50) break;
    for (let j = 0; j < 5; j++) {
      const tmp = arr[i + j];
      arr[i + j] = arr[i + 49 - j];
      arr[i + 49 - j] = tmp;
    }
    for (let j = 0; j < 14; j++) {
      const tmp = arr[i + 10 + j];
      arr[i + 10 + j] = arr[i + 39 - j];
      arr[i + 39 - j] = tmp;
    }
  }
  return arr.join("");
}

export function normalizeIRealChordToken(rawToken: string): string {
  if (!rawToken) return "";
  let s = rawToken.trim();
  if (s === "%" || s === "x" || s === "r") return "%";
  if (s === "n" || s === "p" || s === "W") return "";

  // Extraer inversión / nota de bajo si termina en /Nota (ej. G/B, C^7/B, D6/9/A)
  let slashBass = "";
  const slashMatch = s.match(/^(.*?)\/([A-G][b#]?)$/);
  if (slashMatch) {
    s = slashMatch[1].trim();
    slashBass = `/${slashMatch[2]}`;
  }

  const rootMatch = s.match(/^([A-G][b#]?)(.*)$/);
  if (!rootMatch) return "";
  const root = rootMatch[1];
  let qual = rootMatch[2].trim();

  // Normalizar nomenclatura de iReal Pro a nomenclatura estándar de la app
  qual = qual
    .replace(/^\^7#11|^\^9#11|^\^#11/, "maj7#11")
    .replace(/^\^13/, "maj13")
    .replace(/^\^9/, "maj9")
    .replace(/^\^7|^\^/, "maj7")
    .replace(/^-\^7|^-\^/, "m(maj7)")
    .replace(/^-13/, "m13")
    .replace(/^-11/, "m11")
    .replace(/^-9/, "m9")
    .replace(/^-7b5|^h7|^h/, "m7b5")
    .replace(/^-7/, "m7")
    .replace(/^-6\/9|^-69|^-6/, "m6")
    .replace(/^-/, "m")
    .replace(/^o7|^o|^°7|^°/, "dim7")
    .replace(/^6\/9|^69/, "6(9)")
    .replace(/^7#11|^9#11|^7b5/, "7#11")
    .replace(/^7b9|^13b9/, "7b9")
    .replace(/^7#9/, "7#9")
    .replace(/^7b13|^7#5|^7\+/, "7b13")
    .replace(/^7alt|^alt/, "alt")
    .replace(/^7sus4|^7sus|^sus4|^sus/, "7sus4")
    .replace(/^9sus4|^9sus|^11/, "9sus4")
    .replace(/^13sus4|^13sus/, "13sus4")
    .replace(/^\+/, "aug");

  return `${root}${qual}${slashBass}`;
}

export function parseIRealBodyTo32Measures(rawBody: string): {
  id: string;
  chords: string[];
  section?: "A" | "B" | "C" | "Intro" | "Coda";
  isEnd?: boolean;
}[] {
  const hasDC2ndEnd = /D\.?C\.?\s*al\s*(2nd|Fine)/i.test(rawBody);

  // Limpiar comentarios <...>, compases T44, divisores Y, etc., pero conservar *, {, }, N1, N2, |, [ y ]
  let cleaned = rawBody
    .replace(/<[^>]*>/g, " ")
    .replace(/T\d\d/g, " ")
    .replace(/\*i/g, "*I")
    .replace(/LZ/g, "|")
    .replace(/\[/g, "|")
    .replace(/\]/g, "|")
    .replace(/Z/g, "|")
    .replace(/Y+/g, " ");

  // Tokenizar barra por barra manteniendo marcadores estructurales
  interface RawBar {
    chords: string[];
    section?: "A" | "B" | "C";
    inRepeatBlock: boolean;
    endingNumber: 0 | 1 | 2;
  }

  const rawBars: RawBar[] = [];
  let currentSection: "A" | "B" | "C" = "A";
  let inRepeat = false;
  let currentEnding: 0 | 1 | 2 = 0;

  // Separar marcadores para recorrerlos secuencialmente
  const stream = cleaned
    .replace(/(\*[A-D])/g, " $1 ")
    .replace(/(\{)/g, " | { ")
    .replace(/(\})/g, " } | ")
    .replace(/(N1)/g, " | N1 ")
    .replace(/(N2)/g, " | N2 ")
    .split("|");

  for (const segment of stream) {
    let seg = segment.trim();
    if (!seg) continue;

    if (seg.includes("{")) {
      inRepeat = true;
      currentEnding = 0;
      seg = seg.replace(/\{/g, " ").trim();
    }

    const secMatch = seg.match(/\*([A-D])/);
    if (secMatch) {
      const letter = secMatch[1];
      currentSection =
        letter === "B" ? "B" : letter === "C" || letter === "D" ? "C" : "A";
      if (currentSection === "B" && currentEnding === 2) {
        currentEnding = 0;
      }
      seg = seg.replace(/\*[A-D]/g, " ").trim();
    }

    if (seg.includes("N1")) {
      currentEnding = 1;
      seg = seg.replace(/N1/g, " ").trim();
    }
    if (seg.includes("N2")) {
      currentEnding = 2;
      inRepeat = false;
      seg = seg.replace(/N2/g, " ").trim();
    }

    const closesRepeat = seg.includes("}");
    if (closesRepeat) {
      seg = seg.replace(/\}/g, " ").trim();
    }

    // Extraer acordes dentro de este compás
    const chordRegex = /([A-G][b#]?[^\s|{}*N]*|%)/g;
    const matches = seg.match(chordRegex) || [];
    const parsedChords = matches
      .map((tok) => normalizeIRealChordToken(tok))
      .filter((c) => c !== "");

    if (parsedChords.length > 0) {
      rawBars.push({
        chords: parsedChords.slice(0, 4),
        section: currentSection,
        inRepeatBlock: inRepeat,
        endingNumber: currentEnding,
      });
    }

    if (closesRepeat) {
      inRepeat = false;
    }
  }

  // Reconstruir la forma real expandiendo Casilla 1 (N1), Casilla 2 (N2) y D.C. al 2nd End.
  const hasEndings = rawBars.some(
    (b) => b.endingNumber === 1 || b.endingNumber === 2
  );

  let finalBars: { chords: string[]; section: "A" | "B" | "C" }[] = [];

  if (hasEndings) {
    const sharedA = rawBars.filter(
      (b) => b.section === "A" && b.endingNumber === 0
    );
    const ending1 = rawBars.filter((b) => b.endingNumber === 1);
    const ending2 = rawBars.filter(
      (b) => b.endingNumber === 2 && b.section === "A"
    );
    const sectionB = rawBars.filter((b) => b.section === "B");
    const sectionC = rawBars.filter((b) => b.section === "C");

    // Primera A (6 compases comunes + 2 de Casilla 1 = 8 compases)
    const firstA = [...sharedA, ...ending1].map((b) => ({
      chords: b.chords,
      section: "A" as const,
    }));

    // Segunda A (6 compases comunes + 2 de Casilla 2 = 8 compases)
    const secondA = [
      ...sharedA,
      ...(ending2.length > 0 ? ending2 : ending1),
    ].map((b) => ({
      chords: b.chords,
      section: "A" as const,
    }));

    // Sección B (8 compases)
    const bridgeB = sectionB.map((b) => ({
      chords: b.chords,
      section: "B" as const,
    }));

    finalBars = [...firstA, ...secondA, ...bridgeB];

    if (sectionC.length > 0) {
      finalBars.push(
        ...sectionC.map((b) => ({
          chords: b.chords,
          section: "C" as const,
        }))
      );
    } else if (hasDC2ndEnd) {
      // Tercera A final por D.C. al 2nd End. (8 compases)
      const lastA = [
        ...sharedA,
        ...(ending2.length > 0 ? ending2 : ending1),
      ].map((b) => ({
        chords: b.chords,
        section: "A" as const,
      }));
      finalBars.push(...lastA);
    }
  } else {
    finalBars = rawBars.map((b) => ({
      chords: b.chords,
      section: b.section || "A",
    }));
  }

  // Resolver los símbolos "%" para que tomen el acorde del compás anterior (como en el resto del catálogo)
  const resolvedMeasures = finalBars.map((bar, idx) => {
    let chords = [...bar.chords];
    if (chords.length === 1 && chords[0] === "%" && idx > 0) {
      // Buscar el último compás con acordes reales
      for (let prev = idx - 1; prev >= 0; prev--) {
        if (finalBars[prev].chords[0] && finalBars[prev].chords[0] !== "%") {
          chords = [...finalBars[prev].chords];
          break;
        }
      }
    }
    return {
      id: `m-${idx + 1}`,
      chords,
      section:
        idx === 0
          ? ("A" as const)
          : idx > 0 && finalBars[idx].section !== finalBars[idx - 1].section
          ? finalBars[idx].section
          : idx % 8 === 0
          ? finalBars[idx].section
          : undefined,
      isEnd: idx === finalBars.length - 1,
    };
  });

  return resolvedMeasures;
}

export function parseIRealProgression(rawProgression: string): {
  measures: SongMeasure[];
  timeSignature: string;
} {
  const unobfuscated = unobfuscateIRealString(rawProgression || "");
  let timeSignature = "4/4";
  const timeSigMatch = unobfuscated.match(/T(\d)(\d)/);
  if (timeSigMatch) {
    const num = timeSigMatch[1];
    const den = timeSigMatch[2];
    if (num === "1" && den === "2") timeSignature = "12/8";
    else timeSignature = `${num}/${den}`;
  }
  const parsedMeasures = parseIRealBodyTo32Measures(unobfuscated);
  return {
    measures: parsedMeasures as unknown as SongMeasure[],
    timeSignature,
  };
}

export function parseMusicXml(xmlContent: string): Song | null {
  try {
    const parsed = parseLeadSheetMusicXml(xmlContent);
    if (!parsed || !parsed.measures || parsed.measures.length === 0) {
      return null;
    }
    const sectionsMap: Record<string, number> = {};
    parsed.measures.forEach((m, idx) => {
      if (m.sectionLabel) {
        const badge = extractCleanSectionBadge(m.sectionLabel, "A");
        if (sectionsMap[badge] === undefined) {
          sectionsMap[badge] = idx;
        }
      }
    });
    return {
      id: `${parsed.title.toLowerCase().replace(/[\s/]+/g, "-")}-${Date.now()}`,
      title: parsed.title,
      tempo: parsed.tempo,
      timeSignature: parsed.timeSignature,
      defaultKey: parsed.defaultKey as RootNote,
      defaultIsMinor: parsed.defaultIsMinor,
      style: parsed.style || "Jazz Swing",
      isCustom: true,
      sections: Object.keys(sectionsMap).length > 0 ? sectionsMap : { A: 0 },
      measures: parsed.measures,
    };
  } catch (err) {
    console.error("Error parseando MusicXML:", err);
    return null;
  }
}

export function importFromIRealUrl(rawInput: string): Song | null {
  if (!rawInput || typeof rawInput !== "string") return null;

  const urlMatch = rawInput.match(/(?:irealb|irealbook):\/\/[^\s"'<>]+/i);
  const rawUri = urlMatch ? urlMatch[0] : rawInput.trim();
  if (!/^(?:irealb|irealbook):\/\//i.test(rawUri)) return null;

  let decoded = rawUri.replace(/^(?:irealb|irealbook):\/\//i, "");
  try {
    decoded = decodeURIComponent(decoded);
  } catch (_) {}

  const parts = decoded.split("===");
  const songChunk = parts[0] || "";
  const fields = songChunk.split("=");
  if (fields.length < 4) return null;

  const rawTitle = (fields[0] || "Estándar iReal").trim();
  const rawStyle = (fields[2] || "Medium Swing").trim();
  const rawKey = (fields[3] || "C").trim();

  let progressionField = "";
  for (let i = 4; i < fields.length; i++) {
    if (
      fields[i].startsWith("1r34LbKcu7") ||
      fields[i].includes("|") ||
      fields[i].includes("{")
    ) {
      progressionField = fields[i];
      break;
    }
  }
  if (!progressionField && fields[5]) {
    progressionField = fields[5];
  } else if (!progressionField && fields[4]) {
    progressionField = fields[4];
  }

  const numericBpmField = fields
    .slice(5)
    .map((f) => parseInt(f, 10))
    .find((n) => !isNaN(n) && n >= 40 && n <= 300);

  const { measures, timeSignature } = parseIRealProgression(progressionField);

  const isMinorKey = /-$|m$/i.test(rawKey);
  const cleanKeyRoot = rawKey.replace(/(-|m)$/i, "").trim() || "C";
  const mappedStyle = normalizeStyleDropdownValue(rawStyle);
  const defaultTempo =
    numericBpmField ||
    (mappedStyle === "Bossa Nova"
      ? 130
      : mappedStyle === "Samba"
      ? 190
      : 120);

  const sectionsMap: Record<string, number> = {};
  measures.forEach((m: any, idx) => {
    const secLabel = m.section || m.sectionLabel;
    if (secLabel) {
      const badge = extractCleanSectionBadge(secLabel, "A");
      if (sectionsMap[badge] === undefined) {
        sectionsMap[badge] = idx;
      }
    }
  });

  return {
    id: `ireal-${Date.now()}`,
    title: rawTitle,
    style: mappedStyle,
    tempo: defaultTempo,
    timeSignature: timeSignature || "4/4",
    defaultKey: cleanKeyRoot,
    defaultIsMinor: isMinorKey,
    isCustom: true,
    sections: Object.keys(sectionsMap).length > 0 ? sectionsMap : { A: 0 },
    measures,
  };
}

export function buildSongPlaybackSequence(
  song: Song | null,
  transposition: number,
  globalKey: string
) {
  if (!song) return [];
  let flatIdx = 0;
  const seq: any[] = [];
  const flattened = flattenCompasses(song.measures || []);
  let lastResolvedMeasureSlots: string[] = [];
  let previousVoicingMidis: number[] | null = null;

  const resolveMeasureSectionLabel = (m: any, mIdx: number): string => {
    if (m?.section) return extractCleanSectionBadge(String(m.section), "A");
    if (m?.sectionLabel)
      return extractCleanSectionBadge(String(m.sectionLabel), "A");
    if (song.sections) {
      let matchedSec: string | null = null;
      let bestStartIdx = -1;
      for (const [secName, secIdx] of Object.entries(song.sections)) {
        if (
          typeof secIdx === "number" &&
          secIdx <= mIdx &&
          secIdx >= bestStartIdx
        ) {
          bestStartIdx = secIdx;
          matchedSec = extractCleanSectionBadge(secName, "A");
        }
      }
      if (matchedSec) return matchedSec;
    }
    const rowFirstM = (song.measures || [])[Math.floor(mIdx / 8) * 8];
    if (rowFirstM?.sectionLabel) {
      return extractCleanSectionBadge(
        String(rowFirstM.sectionLabel),
        Math.floor(mIdx / 8) % 2 === 1 ? "B" : "A"
      );
    }
    return Math.floor(mIdx / 8) % 2 === 1 ? "B" : "A";
  };

  flattened.forEach((entry, flatEntryIdx) => {
    const measure = entry.measure || entry;
    const measureIdx = entry.originalIndex ?? flatEntryIdx;
    const currentSection = resolveMeasureSectionLabel(measure, measureIdx);
    const nextEntry = flattened[flatEntryIdx + 1];
    const nextMeasure = nextEntry ? nextEntry.measure || nextEntry : null;
    const nextMeasureIdx = nextEntry
      ? nextEntry.originalIndex ?? flatEntryIdx + 1
      : measureIdx + 1;
    const nextSection = nextMeasure
      ? resolveMeasureSectionLabel(nextMeasure, nextMeasureIdx)
      : null;
    const totalSongMeasures = (song.measures || []).length;
    const isEndOfSection =
      flatEntryIdx === flattened.length - 1 ||
      measureIdx === Math.max(0, totalSongMeasures - 1);

    const beatsPerMeasure = getBeatsPerBar(song.timeSignature || "4/4");
    const rawChordsInput =
      measure.chords && measure.chords.length > 0 ? measure.chords : [""];

    const isMeasureFullSimile =
      rawChordsInput.length === 1 &&
      (rawChordsInput[0] === "%" ||
        (typeof rawChordsInput[0] === "object" &&
          ((rawChordsInput[0] as any)?.chordName === "%" ||
            (rawChordsInput[0] as any)?.name === "%")));

    let effectiveMeasureChords: any[] = rawChordsInput;
    let isClonedFromPrevMeasure = false;

    if (isMeasureFullSimile && lastResolvedMeasureSlots.length > 0) {
      effectiveMeasureChords = [...lastResolvedMeasureSlots];
      isClonedFromPrevMeasure = true;
    }

    const slotCount =
      effectiveMeasureChords.length <= 1
        ? 1
        : effectiveMeasureChords.length === 2
        ? 2
        : 4;
    const lengthPerChord = beatsPerMeasure / slotCount;

    const resolvedChordsThisMeasure: string[] = [];

    const staticMeasureBaseIdx = (song.measures || [])
      .slice(0, entry.originalIndex)
      .reduce((acc, m) => {
        const mChords = m.chords && m.chords.length > 0 ? m.chords : [""];
        return acc + (mChords.length <= 1 ? 1 : mChords.length === 2 ? 2 : 4);
      }, 0);

    for (
      let chordIdxInMeasure = 0;
      chordIdxInMeasure < slotCount;
      chordIdxInMeasure++
    ) {
      const rawChord = effectiveMeasureChords[chordIdxInMeasure] || "";
      const actualChordName =
        typeof rawChord === "string"
          ? rawChord
          : (rawChord as any)?.chordName ||
            (rawChord as any)?.name ||
            (rawChord as any)?.text ||
            "";
      const isSimile = actualChordName === "%" || isClonedFromPrevMeasure;

      let chordToPlay = actualChordName;
      if (actualChordName === "%") {
        if (lastResolvedMeasureSlots.length > 0) {
          chordToPlay =
            lastResolvedMeasureSlots[chordIdxInMeasure] ||
            lastResolvedMeasureSlots[lastResolvedMeasureSlots.length - 1];
        } else if (
          resolvedChordsThisMeasure.length > 0 &&
          chordIdxInMeasure > 0
        ) {
          chordToPlay = resolvedChordsThisMeasure[chordIdxInMeasure - 1];
        } else {
          for (let k = seq.length - 1; k >= 0; k--) {
            const prev = seq[k]?.resolvedChord;
            if (prev && prev !== "%" && prev.trim() !== "") {
              chordToPlay = prev;
              break;
            }
          }
        }
        if (!chordToPlay || chordToPlay === "%") chordToPlay = "C";
      }
      resolvedChordsThisMeasure.push(chordToPlay);

      const transposed =
        chordToPlay && chordToPlay !== "%"
          ? transposeChordString(chordToPlay, transposition, globalKey)
          : chordToPlay || "";
      const parsed =
        chordToPlay && chordToPlay !== "%"
          ? parseChord(transposed)
          : { root: "", type: "", suffix: "" };

      let frequencies: number[] = [];
      let voicingMidis: number[] = [];
      if (parsed.root) {
        const rawVoicing = buildJazzVoicing(transposed, previousVoicingMidis);
        previousVoicingMidis = rawVoicing;
        let pianoMidis = rawVoicing.filter((m) => m >= 50);
        if (pianoMidis.length < 3) {
          pianoMidis = rawVoicing.map((m) => {
            let shifted = m;
            while (shifted < 51) shifted += 12;
            while (shifted > 76) shifted -= 12;
            return shifted;
          });
        }
        voicingMidis = Array.from(new Set(pianoMidis)).sort((a, b) => a - b);
        frequencies = voicingMidis.map((m) => 440 * Math.pow(2, (m - 69) / 12));
      }

      const isLastChordOfMeasure = chordIdxInMeasure === slotCount - 1;
      const isLastItem = !!(entry.isEndOfPlayback && isLastChordOfMeasure);

      seq.push({
        globalChordIndex: flatIdx,
        originalFlatIndex:
          staticMeasureBaseIdx +
          (isClonedFromPrevMeasure ? 0 : chordIdxInMeasure),
        frequencies,
        voicingMidis,
        beatsLength: lengthPerChord,
        chordString: transposed,
        originalString: isClonedFromPrevMeasure ? "%" : actualChordName,
        resolvedChord: chordToPlay,
        isSimile,
        isEndMarker: !!measure.isEnd,
        isEndOfPlayback: isLastItem,
        globalKey,
        parsedRoot: parsed.root,
        parsedType: parsed.type,
        measureIndex: entry.originalIndex,
        section: currentSection,
        isEndOfSection,
        melody: chordIdxInMeasure === 0 ? measure.melody : undefined,
        transposition,
      });
      flatIdx++;
    }

    lastResolvedMeasureSlots = resolvedChordsThisMeasure;
  });

  return seq;
}

export default function JazzStandards({
  isVisible = true,
}: { isVisible?: boolean } = {}) {
  const { instrument, setInstrument } = useInstrument();
  const { language } = useLanguage();
  const isEs = language === "es";

  const [selectedSongId, setSelectedSongId] = useState(() => {
    const initial = sessionStorage.getItem("initialStandard");
    if (initial) {
      sessionStorage.removeItem("initialStandard");
      return initial;
    }
    return "autumn-leaves";
  });
  const [transposition, setTransposition] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showScalesInCells, setShowScalesInCells] = useState(false);
  const [masterVolPct, setMasterVolPct] = useState(85);
  const [masterMuted, setMasterMuted] = useState(false);
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [measurePageOffset, setMeasurePageOffset] = useState(0);

  const measureRowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastAutoScrolledRowRef = useRef<number>(-1);

  const [totalChoruses, setTotalChoruses] = useState<number>(3);
  const [currentChorusNumber, setCurrentChorusNumber] = useState<number>(1);
  const totalChorusesRef = useRef<number>(3);
  const currentChorusRef = useRef<number>(1);

  useEffect(() => {
    totalChorusesRef.current = totalChoruses;
  }, [totalChoruses]);

  const [isDeleteSongModalOpen, setIsDeleteSongModalOpen] = useState(false);
  const [isMixerModalOpen, setIsMixerModalOpen] = useState(false);

  const [selectedHarmonyPreset, setSelectedHarmonyPreset] =
    useState<HarmonyVoicePresetId>(() =>
      interactiveAnalysisAudio.getHarmonyPreset()
    );
  const [selectedBassPreset, setSelectedBassPreset] =
    useState<BassVoicePresetId>(() => interactiveAnalysisAudio.getBassPreset());
  const [selectedDrumKitPreset, setSelectedDrumKitPreset] =
    useState<DrumKitPresetId>(() =>
      interactiveAnalysisAudio.getDrumKitPreset()
    );

  const [reverbRoomPct, setReverbRoomPct] = useState<number>(() =>
    Math.round((interactiveAnalysisAudio.getRoomReverbWet() ?? 0.38) * 100)
  );

  const [melodyInstrument] = useState<MelodyInstrument>("vibraphone");

  const [mixerChannels, setMixerChannels] = useState({
    harmonyVol: 85,
    harmonyMuted: false,
    harmonySolo: false,
    bassVol: 85,
    bassMuted: false,
    bassSolo: false,
    drumsVol: 85,
    drumsMuted: false,
    drumsSolo: false,
    melodyVol: 85,
    melodyMuted: false,
  });

  const [isNewSheetModalOpen, setIsNewSheetModalOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState("Mi Nueva Progresión");
  const [newSheetMeasuresCount, setNewSheetMeasuresCount] =
    useState<number>(16);
  const [newSheetKey, setNewSheetKey] = useState<string>("C");
  const [newSheetTimeSig, setNewSheetTimeSig] = useState<string>("4/4");
  const [newSheetStyle, setNewSheetStyle] = useState<string>("Jazz Swing");

  const sanitizeChordString = (chord: string): string => {
    if (!chord || typeof chord !== "string") return chord;
    return chord.replace(/6\/9/g, "6(9)").replace(/alt(?=\/|$)/i, "");
  };

  const sanitizeSongs = (songList: Song[]): Song[] => {
    return songList.map((song) => ({
      ...song,
      measures: (song.measures || []).map((m) => ({
        ...m,
        chords: (m.chords || []).map(sanitizeChordString),
        melody:
          song.isCustom && m.melody && m.melody.length > 0
            ? m.melody
            : undefined,
      })),
    }));
  };

  const [allSongs, setAllSongs] = useState<Song[]>(() => {
    try {
      localStorage.removeItem("allSongsList");
      const saved = localStorage.getItem("customSongs");
      const parsedCustom = saved ? JSON.parse(saved) : [];
      const standardIds = new Set(JAZZ_STANDARDS.map((s: Song) => s.id));
      const validCustom = Array.isArray(parsedCustom)
        ? parsedCustom.filter(
            (s: Song) => s?.isCustom && !standardIds.has(s.id)
          )
        : [];
      return sanitizeSongs([...JAZZ_STANDARDS, ...validCustom]);
    } catch (e) {
      return sanitizeSongs([...JAZZ_STANDARDS]);
    }
  });

  useEffect(() => {
    const customOnly = allSongs.filter((s) => s.isCustom);
    localStorage.setItem("customSongs", JSON.stringify(customOnly));
  }, [allSongs]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showChordModal, setShowChordModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [explanationModalData, setExplanationModalData] = useState<{
    chordName: string;
    romanNumeral: string;
    explanation: HarmonicExplanation;
  } | null>(null);

  const [customAnalyses, setCustomAnalyses] = useState<
    Record<
      string,
      { numeral: string; category: AnalysisCategory; groupWithNext?: boolean }
    >
  >({});
  const [editingCell, setEditingCell] = useState<{
    key: string;
    flatIndex: number;
    numeral: string;
    category: AnalysisCategory;
    groupWithNext: boolean;
  } | null>(null);

  const [focusedChord, setFocusedChord] = useState<{
    originalString: string;
    transposedString: string;
    analysisContext: AnalyzedChord | null;
    flatIndex?: number;
  } | null>(null);

  const currentSong = useMemo(() => {
    return allSongs.find((s) => s.id === selectedSongId) || allSongs[0];
  }, [selectedSongId, allSongs]);

  const isCustomSong = Boolean(
    currentSong?.isCustom || String(currentSong?.id || "").startsWith("custom-")
  );
  const isEditingActive = isEditMode;

  const [selectedStyleLabel, setSelectedStyleLabel] = useState<string>(() =>
    normalizeStyleDropdownValue(currentSong?.style)
  );
  const [activeDrumStyle, setActiveDrumStyle] = useState<DrumStyle>(() =>
    detectDrumStyleFromSongStyle(currentSong?.style)
  );

  const [bpmDraft, setBpmDraft] = useState<string>(
    String(currentSong?.tempo || 120)
  );
  useEffect(() => {
    setBpmDraft(String(currentSong?.tempo || 120));
  }, [currentSong?.tempo, currentSong?.id]);

  const commitDirectBpmInput = (rawText: string) => {
    const parsed = parseInt(rawText, 10);
    const currentTempo = Number(currentSong?.tempo) || 120;
    const clamped = isNaN(parsed)
      ? currentTempo
      : Math.max(40, Math.min(240, parsed));
    setBpmDraft(String(clamped));
    if (clamped !== currentTempo) {
      const newSong = { ...currentSong, tempo: clamped };
      setAllSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? newSong : s))
      );
      try {
        Tone.Transport.bpm.value = clamped;
      } catch (_) {}
      window.dispatchEvent(new CustomEvent("change-bpm", { detail: clamped }));
    }
  };

  const styleAllowsGuitar = useMemo(
    () => doesStyleAllowGuitar(selectedStyleLabel),
    [selectedStyleLabel]
  );

  useEffect(() => {
    const currentPresetObj = HARMONY_VOICE_PRESETS.find(
      (p) => p.id === selectedHarmonyPreset
    );
    if (instrument === "guitar") {
      if (!doesStyleAllowGuitar(selectedStyleLabel)) {
        setInstrument("piano");
        return;
      }
      if (currentPresetObj?.category !== "guitar") {
        const defaultGuitar: HarmonyVoicePresetId =
          selectedStyleLabel === "Bossa Nova" ||
          selectedStyleLabel === "Samba" ||
          selectedStyleLabel === "Bolero" ||
          selectedStyleLabel === "Vals Criollo"
            ? "nylon_concert"
            : "acoustic_steel";
        setSelectedHarmonyPreset(defaultGuitar);
        interactiveAnalysisAudio.setHarmonyPreset(defaultGuitar);
        setMixerChannels((prev) => ({ ...prev, harmonyVol: 65 }));
        interactiveAnalysisAudio.setChannelVolumeFromPercent("guitar", 65);
      }
    } else if (
      instrument === "piano" &&
      currentPresetObj?.category !== "piano"
    ) {
      const targetKeyboard = getDefaultKeyboardPresetForStyle(selectedStyleLabel);
      setSelectedHarmonyPreset(targetKeyboard);
      interactiveAnalysisAudio.setHarmonyPreset(targetKeyboard);
      setMixerChannels((prev) => ({ ...prev, harmonyVol: 85 }));
      interactiveAnalysisAudio.setChannelVolumeFromPercent("piano", 85);
    }
  }, [instrument]);

  const applyStyleInstrumentationRules = React.useCallback(
    (styleName: string) => {
      const normalized = normalizeStyleDropdownValue(styleName);
      const allowsGtr = doesStyleAllowGuitar(normalized);
      const defaultKb = getDefaultKeyboardPresetForStyle(normalized);

      const autoKit = getIdealDrumKitForStyle(normalized);
      setSelectedDrumKitPreset(autoKit);
      interactiveAnalysisAudio.setDrumKitPreset(autoKit);

      if (!allowsGtr) {
        if (instrument === "guitar") {
          setInstrument("piano");
        }
        setSelectedHarmonyPreset(defaultKb);
        interactiveAnalysisAudio.setHarmonyPreset(defaultKb);
      } else {
        if (instrument === "guitar") {
          const gtrPreset: HarmonyVoicePresetId =
            normalized === "Bossa Nova" ||
            normalized === "Samba" ||
            normalized === "Bolero" ||
            normalized === "Vals Criollo"
              ? "nylon_concert"
              : "acoustic_steel";
          setSelectedHarmonyPreset(gtrPreset);
          interactiveAnalysisAudio.setHarmonyPreset(gtrPreset);
        } else {
          setSelectedHarmonyPreset(defaultKb);
          interactiveAnalysisAudio.setHarmonyPreset(defaultKb);
        }
      }
    },
    [instrument, setInstrument]
  );

  useEffect(() => {
    const normalized = normalizeStyleDropdownValue(currentSong?.style);
    setSelectedStyleLabel(normalized);
    setActiveDrumStyle(detectDrumStyleFromSongStyle(normalized));
    applyStyleInstrumentationRules(normalized);
  }, [currentSong?.id, currentSong?.style]);

  const handleSelectStyleOption = (newStyleLabel: string) => {
    const normalized = normalizeStyleDropdownValue(newStyleLabel);
    const previousStyle = selectedStyleLabel;
    setSelectedStyleLabel(normalized);
    const resolvedDrumStyle = detectDrumStyleFromSongStyle(normalized);
    setActiveDrumStyle(resolvedDrumStyle);

    applyStyleInstrumentationRules(normalized);

    let nextTimeSig = currentSong.timeSignature || "4/4";
    if (normalized === "Vals Criollo") {
      nextTimeSig = "3/4";
    } else if (
      previousStyle === "Vals Criollo" &&
      currentSong.timeSignature === "3/4"
    ) {
      nextTimeSig = "4/4";
    }

    let nextTempo = Number(currentSong.tempo) || 120;
    if (normalized === "Samba") {
      nextTempo = Math.max(200, nextTempo);
    } else if (previousStyle === "Samba" && nextTempo >= 195) {
      nextTempo =
        normalized === "Hip-Hop" || normalized === "Reggaeton"
          ? 94
          : normalized === "Bolero"
          ? 96
          : 120;
    }

    setBpmDraft(String(nextTempo));
    try {
      Tone.Transport.bpm.value = nextTempo;
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("change-bpm", { detail: nextTempo }));

    const newSong = {
      ...currentSong,
      style: normalized,
      timeSignature: nextTimeSig,
      tempo: nextTempo,
    };
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSong : s))
    );
  };

  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState<
    number | null
  >(0);
  const [selectedChordSlotIndex, setSelectedChordSlotIndex] =
    useState<number>(0);
  const [quickChordInput, setQuickChordInput] = useState<string>("");
  const [isQuickChordDropdownOpen, setIsQuickChordDropdownOpen] =
    useState(false);
  const [activeDropdownMeasureIndex, setActiveDropdownMeasureIndex] = useState<
    number | null
  >(null);
  const quickChordInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditingActive) {
      setActiveDropdownMeasureIndex(null);
    }
  }, [isEditingActive]);

  useEffect(() => {
    if (
      selectedMeasureIndex !== null &&
      currentSong?.measures?.[selectedMeasureIndex]
    ) {
      const m = currentSong.measures[selectedMeasureIndex];
      const chords = m.chords || [];
      const currentSlotVal = chords[selectedChordSlotIndex] ?? chords[0] ?? "";
      const chordName =
        typeof currentSlotVal === "string"
          ? currentSlotVal
          : (currentSlotVal as any)?.chordName || "";
      setQuickChordInput(chordName);
    }
  }, [selectedMeasureIndex, selectedChordSlotIndex, currentSong]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        quickChordInputRef.current &&
        !quickChordInputRef.current.contains(e.target as Node)
      ) {
        setIsQuickChordDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleUpdateChordName = (
    measureIndex: number,
    chordIndex: number,
    newChord: string
  ) => {
    let trimmed = sanitizeChordString(newChord.trim());
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (!newSongObject.measures || !newSongObject.measures[measureIndex])
      return;

    if (!newSongObject.measures[measureIndex].chords) {
      newSongObject.measures[measureIndex].chords = [""];
    }

    let chordStr = trimmed;
    if (trimmed && transposition !== 0) {
      chordStr = transposeChordString(trimmed, -transposition, globalKey);
    }

    newSongObject.measures[measureIndex].chords[chordIndex] =
      sanitizeChordString(chordStr);
    if (currentSong.measures[measureIndex]?.melody) {
      newSongObject.measures[measureIndex].melody = currentSong.measures[
        measureIndex
      ].melody!.map((n) => ({ ...n }));
    }
    newSongObject.isCustom = true;

    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
    );

    const flatIdx = (measureFlatIndices[measureIndex] ?? 0) + chordIndex;
    const analysisCtx = analyzedMeasures[measureIndex]?.[chordIndex];
    handleChordClick(chordStr, analysisCtx, flatIdx, false);
    if (trimmed && trimmed !== "%") {
      playChord(trimmed);
    }
  };

  const handleSetMeasureSubdivision = (count: 1 | 2 | 4) => {
    const targetIdx = selectedMeasureIndex ?? 0;
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (!newSongObject.measures || !newSongObject.measures[targetIdx]) return;

    const currentChords = (newSongObject.measures[targetIdx].chords || []).map(
      (c: any) => (typeof c === "string" ? c : c?.chordName || "")
    );

    let newChords: string[] = [];
    if (count === 1) {
      newChords = [currentChords[0] || ""];
    } else if (count === 2) {
      newChords = [currentChords[0] || "", currentChords[1] || ""];
    } else if (count === 4) {
      newChords = [
        currentChords[0] || "",
        currentChords[1] || "",
        currentChords[2] || "",
        currentChords[3] || "",
      ];
    }

    newSongObject.measures[targetIdx].chords = newChords;
    if (currentSong.measures[targetIdx]?.melody) {
      newSongObject.measures[targetIdx].melody = currentSong.measures[
        targetIdx
      ].melody!.map((n) => ({ ...n }));
    }
    newSongObject.isCustom = true;
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
    );
    if (selectedChordSlotIndex >= count) {
      setSelectedChordSlotIndex(count - 1);
    }
  };

  const handleToggleRepeatStart = (measureIndex: number) => {
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (newSongObject.measures && newSongObject.measures[measureIndex]) {
      newSongObject.measures[measureIndex].repeatStart =
        !newSongObject.measures[measureIndex].repeatStart;
      newSongObject.isCustom = true;
      setAllSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
      );
    }
  };

  const handleToggleRepeatEnd = (measureIndex: number) => {
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (newSongObject.measures && newSongObject.measures[measureIndex]) {
      newSongObject.measures[measureIndex].repeatEnd =
        !newSongObject.measures[measureIndex].repeatEnd;
      newSongObject.isCustom = true;
      setAllSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
      );
    }
  };

  const handleToggleVolta = (measureIndex: number, voltaNum: 1 | 2) => {
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (newSongObject.measures && newSongObject.measures[measureIndex]) {
      const currentVolta = newSongObject.measures[measureIndex].volta;
      newSongObject.measures[measureIndex].volta =
        currentVolta === voltaNum ? undefined : voltaNum;
      newSongObject.isCustom = true;
      setAllSongs((prev) =>
        prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
      );
    }
  };

  const handleAddMeasureAfter = (measureIndex: number | null) => {
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (!newSongObject.measures) newSongObject.measures = [];

    const newMeasure: SongMeasure = {
      id: `m-${Date.now()}`,
      chords: [""],
    };

    const insertIdx =
      measureIndex !== null ? measureIndex + 1 : newSongObject.measures.length;
    newSongObject.measures.splice(insertIdx, 0, newMeasure);
    newSongObject.isCustom = true;

    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
    );
    setSelectedMeasureIndex(insertIdx);
    setSelectedChordSlotIndex(0);
  };

  const handleDeleteMeasure = (measureIndex: number) => {
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (!newSongObject.measures) newSongObject.measures = [];

    if (newSongObject.measures.length <= 1) {
      newSongObject.measures[0] = {
        id: `m-1-${Date.now()}`,
        chords: [""],
      };
    } else {
      newSongObject.measures.splice(measureIndex, 1);
    }

    newSongObject.isCustom = true;
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
    );
    const maxIdx = Math.max(0, (newSongObject.measures.length || 1) - 1);
    setSelectedMeasureIndex(Math.min(measureIndex, maxIdx));
  };

  const handleDeleteCurrentCustomSong = () => {
    setAllSongs((prev) => {
      const updated = prev.filter((s) => s.id !== currentSong.id);
      const nextSongs =
        updated.length > 0 ? updated : sanitizeSongs([...JAZZ_STANDARDS]);
      try {
        localStorage.setItem(
          "customSongs",
          JSON.stringify(nextSongs.filter((s) => s.isCustom))
        );
      } catch (_) {}
      setSelectedSongId(nextSongs[0].id);
      return nextSongs;
    });
    setIsDeleteSongModalOpen(false);
    setIsEditMode(false);
  };

  useEffect(() => {
    const isTextInputElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      if (el.tagName === "TEXTAREA" || el.isContentEditable) return true;
      if (el.tagName === "INPUT") {
        const type = ((el as HTMLInputElement).type || "text").toLowerCase();
        return (
          type !== "range" &&
          type !== "checkbox" &&
          type !== "radio" &&
          type !== "button"
        );
      }
      return false;
    };

    const handleSpaceKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        const activeEl = document.activeElement as HTMLElement | null;
        const target = e.target as HTMLElement | null;

        if (isTextInputElement(activeEl) || isTextInputElement(target)) return;

        e.preventDefault();
        e.stopPropagation();

        if (activeEl && typeof activeEl.blur === "function") {
          activeEl.blur();
        }

        if (e.repeat) return;

        if (metronomeControlRef.current) {
          metronomeControlRef.current.togglePlayback();
        } else {
          const btn = document.getElementById("metronome-toggle-btn");
          if (btn) btn.click();
        }
      }
    };

    window.addEventListener("keydown", handleSpaceKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleSpaceKeyDown, {
        capture: true,
      });
    };
  }, []);

  const handleToggleSection = (label: string) => {
    const targetIdx = selectedMeasureIndex ?? 0;
    let newSongObject = JSON.parse(JSON.stringify(currentSong)) as Song;
    if (!newSongObject.measures || !newSongObject.measures[targetIdx]) return;

    const currentLabel = newSongObject.measures[targetIdx].sectionLabel;
    const formatted = `[${label.replace(/^\[|\]$/g, "")}]`;

    if (currentLabel === formatted) {
      newSongObject.measures[targetIdx].sectionLabel = undefined;
    } else {
      newSongObject.measures[targetIdx].sectionLabel = formatted;
    }

    newSongObject.isCustom = true;
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSongObject : s))
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const metronomeControlRef = useRef<MetronomeControls | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(
    null
  );
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);

  // Estado separado para saber exactamente si se está exportando "wav" o "mp3" sin activar ambos spinners a la vez
  const [exportingAudioFormat, setExportingAudioFormat] = useState<
    "wav" | "mp3" | null
  >(null);
  const isExportingWav = exportingAudioFormat !== null;

  const triggerExportToast = (msg: string) => {
    setExportToastMessage(msg);
    setTimeout(() => {
      setExportToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const updateMixerChannelVol = (
    ch: "harmony" | "bass" | "drums",
    valPct: number
  ) => {
    const safePct = Math.max(0, Math.min(100, Math.round(valPct)));
    const muteKey = `${ch}Muted` as
      | "harmonyMuted"
      | "bassMuted"
      | "drumsMuted";
    const wasMuted = mixerChannels[muteKey];

    setMixerChannels((prev) => ({
      ...prev,
      [`${ch}Vol`]: safePct,
      ...(wasMuted && safePct > 0 ? { [muteKey]: false } : {}),
    }));

    try {
      if (ch === "harmony") {
        if (wasMuted && safePct > 0) {
          interactiveAnalysisAudio.toggleChannelMute("piano");
        }
        interactiveAnalysisAudio.setChannelVolumeFromPercent("piano", safePct);
      } else if (ch === "bass") {
        if (wasMuted && safePct > 0) {
          interactiveAnalysisAudio.toggleChannelMute("bass");
        }
        interactiveAnalysisAudio.setChannelVolumeFromPercent("bass", safePct);
      } else if (ch === "drums") {
        if (wasMuted && safePct > 0) {
          interactiveAnalysisAudio.toggleChannelMute("drums");
        }
        interactiveAnalysisAudio.setChannelVolumeFromPercent("drums", safePct);
      }
    } catch (_) {}
  };

  const updateReverbRoomLevel = (pct: number) => {
    const safePct = Math.max(0, Math.min(100, Math.round(pct)));
    setReverbRoomPct(safePct);
    try {
      interactiveAnalysisAudio.setRoomReverbFromPercent(safePct);
    } catch (_) {}
  };

  const toggleMixerChannelMute = (ch: "harmony" | "bass" | "drums") => {
    const key = `${ch}Muted` as
      | "harmonyMuted"
      | "bassMuted"
      | "drumsMuted";
    const nextMuted = !mixerChannels[key];
    setMixerChannels((prev) => ({ ...prev, [key]: nextMuted }));
    try {
      if (ch === "harmony") {
        interactiveAnalysisAudio.toggleChannelMute("piano");
      } else if (ch === "bass") {
        interactiveAnalysisAudio.toggleChannelMute("bass");
      } else if (ch === "drums") {
        interactiveAnalysisAudio.toggleChannelMute("drums");
      }
    } catch (_) {}
  };

  const toggleMixerChannelSolo = (ch: "harmony" | "bass" | "drums") => {
    const key = `${ch}Solo` as "harmonySolo" | "bassSolo" | "drumsSolo";
    const nextSolo = !mixerChannels[key];
    setMixerChannels((prev) => ({ ...prev, [key]: nextSolo }));
    try {
      if (ch === "harmony") {
        interactiveAnalysisAudio.toggleChannelSolo(
          instrument === "guitar" ? "guitar" : "piano"
        );
      } else if (ch === "bass") {
        interactiveAnalysisAudio.toggleChannelSolo("bass");
      } else if (ch === "drums") {
        interactiveAnalysisAudio.toggleChannelSolo("drums");
      }
    } catch (_) {}
  };

  const handleExportSession = () => {
    try {
      const sessionData = {
        app: "Rumie Harmonic Pro",
        version: "2.0",
        format: "linus-session",
        exportedAt: new Date().toISOString(),
        id: currentSong.id,
        title: currentSong.title || "Mi Nueva Progresión",
        style: selectedStyleLabel || currentSong.style || "Jazz Swing",
        activeDrumStyle: activeDrumStyle || "Jazz Swing",
        tempo: currentSong.tempo || 120,
        timeSignature: currentSong.timeSignature || "4/4",
        defaultKey: currentSong.defaultKey || "C",
        defaultIsMinor: Boolean(currentSong.defaultIsMinor),
        transposition: transposition || 0,
        sections: currentSong.sections || { A: 0 },
        measures: currentSong.measures || [],
      };

      const jsonString = JSON.stringify(sessionData, null, 2);
      const blob = new Blob([jsonString], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = (currentSong.title || "sesion-rumie")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, "_");
      link.download = `${safeTitle}.linus`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar la sesión .linus:", error);
    }
  };

  const handleExportMidi = () => {
    setIsExportModalOpen(false);
    try {
      const seq = buildSongPlaybackSequence(
        currentSong,
        transposition,
        globalKey
      );
      const activeStyle: DrumStyle =
        activeDrumStyle ||
        detectDrumStyleFromSongStyle(currentSong?.style) ||
        "Jazz Swing";
      const harmonicInst: "piano" | "guitar" | "epiano" =
        instrument === "guitar" && styleAllowsGuitar
          ? "guitar"
          : selectedHarmonyPreset === "rhodes" ||
            selectedHarmonyPreset === "wurlitzer"
          ? "epiano"
          : "piano";

      const anySolo =
        mixerChannels.harmonySolo ||
        mixerChannels.bassSolo ||
        mixerChannels.drumsSolo;
      const includeHarm = anySolo
        ? mixerChannels.harmonySolo
        : !mixerChannels.harmonyMuted;
      const includeBass = anySolo
        ? mixerChannels.bassSolo
        : !mixerChannels.bassMuted;
      const includeDrums = anySolo
        ? mixerChannels.drumsSolo
        : !mixerChannels.drumsMuted;

      const midiBlob = buildStandardMidiFileBlob(
        seq,
        currentSong.tempo || 120,
        currentSong.title || "Rumie Harmonic Pro",
        activeStyle,
        harmonicInst,
        currentSong.timeSignature || "4/4",
        Math.max(1, totalChoruses || 1),
        includeHarm,
        includeBass,
        includeDrums
      );
      const url = URL.createObjectURL(midiBlob);
      const a = document.createElement("a");
      const safeTitle = (currentSong.title || "progresion_rumie")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, "_");
      a.href = url;
      a.download = `${safeTitle}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      triggerExportToast(
        "¡MIDI Multipista (Piano/Guitarra + Bajo + Batería GM) exportado!"
      );
    } catch (e) {
      console.error("Error exportando MIDI:", e);
    }
  };

  const handleDownloadDirectPDF = () => {
    setIsExportModalOpen(false);
    try {
      downloadLeadSheetPDF({
        song: transposedSongForScore,
        transposition,
        globalKey: displayedKeyCenter,
      });
      setPdfExportSuccess(true);
      setTimeout(() => setPdfExportSuccess(false), 4500);
    } catch (err) {
      console.error("Error al descargar el archivo PDF directo:", err);
    }
  };

  const handleExportMusicXml = () => {
    setIsExportModalOpen(false);
    const selectedStyle = selectedStyleLabel;
    const bpm = Number(currentSong.tempo) || 120;
    const timeSignature = currentSong.timeSignature || "4/4";
    const currentKey = globalKey;
    const isMinorKey = globalIsMinor;
    downloadSongAsMusicXml({
      title: currentSong.title,
      style: selectedStyle || currentSong.style,
      tempo: bpm,
      timeSignature: timeSignature || currentSong.timeSignature || "4/4",
      keySignature: currentKey,
      isMinor: isMinorKey,
      measures: currentSong.measures,
      transposition: transposition,
    });
    triggerExportToast(
      `Partitura MusicXML ("${currentSong.title}.musicxml") exportada correctamente.`
    );
  };

  const handleExportWav = async (extensionFormat: "wav" | "mp3" = "wav") => {
    if (exportingAudioFormat !== null) return;
    setExportingAudioFormat(extensionFormat);
    triggerExportToast(
      extensionFormat === "mp3"
        ? "Renderizando y comprimiendo pista a .MP3 (192 kbps)..."
        : "Renderizando mezcla Master en .WAV (Sin compresión)..."
    );

    try {
      if (
        metronomeControlRef.current &&
        metronomeControlRef.current.isPlaying()
      ) {
        try {
          metronomeControlRef.current.stop();
        } catch (_) {}
      }

      try {
        await Tone.start();
      } catch (_) {}

      const bpmVal = Math.max(
        30,
        Math.min(300, Number(currentSong?.tempo) || 120)
      );
      const timeSig = currentSong?.timeSignature || "4/4";
      const beatsPerBar =
        parseInt(timeSig.split("/")[0], 10) || getBeatsPerBar(timeSig);
      const secondsPerBeat =
        timeSig.split("/")[1]?.trim() === "8"
          ? 60.0 / bpmVal / 2.0
          : 60.0 / bpmVal;
      const activeStyle: DrumStyle =
        activeDrumStyle ||
        detectDrumStyleFromSongStyle(currentSong?.style) ||
        "Jazz Swing";
      const harmonicInst: "piano" | "guitar" | "epiano" =
        instrument === "guitar" && styleAllowsGuitar
          ? "guitar"
          : selectedHarmonyPreset === "rhodes" ||
            selectedHarmonyPreset === "wurlitzer"
          ? "epiano"
          : "piano";

      const seq = buildSongPlaybackSequence(
        currentSong,
        transposition,
        globalKey
      );
      const safeChoruses = Math.max(1, Math.min(10, totalChoruses || 1));
      const singleChorusBeats =
        seq.length > 0
          ? seq.reduce((acc, item) => acc + (item.beatsLength || beatsPerBar), 0)
          : Math.max(4, (currentSong?.measures?.length || 4) * beatsPerBar);
      const seqTotalBeats = singleChorusBeats * safeChoruses;
      const progressionDurationSec = seqTotalBeats * secondsPerBeat;

      const anySolo =
        mixerChannels.harmonySolo ||
        mixerChannels.bassSolo ||
        mixerChannels.drumsSolo;

      const isHarmonyAudible = anySolo
        ? mixerChannels.harmonySolo
        : !mixerChannels.harmonyMuted && mixerChannels.harmonyVol > 0;
      const isBassAudible = anySolo
        ? mixerChannels.bassSolo
        : !mixerChannels.bassMuted && mixerChannels.bassVol > 0;
      const isDrumsAudible =
        (anySolo
          ? mixerChannels.drumsSolo
          : !mixerChannels.drumsMuted && mixerChannels.drumsVol > 0) &&
        activeStyle !== "Metronome Básico";

      const harmGainLinear = (mixerChannels.harmonyVol / 85) * 0.9;
      const bassGainLinear = (mixerChannels.bassVol / 85) * 1.0;
      const drumsGainLinear = (mixerChannels.drumsVol / 85) * 0.95;

      const bandBuffers =
        await interactiveAnalysisAudio.getBuffersForOfflineRender();

      // Preparar buffers reales de Hi-Hat cerrado, Hi-Hat abierto y Rimshot (NUNCA usar el plato Ride como fallback de Hi-Hat)
      const realClosedHihatBuf: AudioBuffer =
        (bandBuffers.drums as any).hihat_closed ||
        (bandBuffers.drums as any).hihat ||
        (interactiveAnalysisAudio as any).drumBuffers?.hihat_closed ||
        (interactiveAnalysisAudio as any).drumBuffers?.hihat ||
        createSynthesizedDrumBuffer("hihat_closed");

      const realOpenHihatBuf: AudioBuffer =
        (bandBuffers.drums as any).hihat_open ||
        (interactiveAnalysisAudio as any).drumBuffers?.hihat_open ||
        createSynthesizedDrumBuffer("hihat_open");

      const realRimshotBuf: AudioBuffer =
        (bandBuffers.drums as any).rim ||
        (interactiveAnalysisAudio as any).drumBuffers?.rim ||
        createSynthesizedDrumBuffer("rim");

      const harmonyEvents: {
        time: number;
        notes: string[];
        freqs: number[];
        duration: number;
        velocity: number;
      }[] = [];
      const bassEvents: {
        time: number;
        noteName: string;
        freq: number;
        duration: number;
        velocity: number;
      }[] = [];
      const drumEvents: {
        time: number;
        instrument:
          | "kick"
          | "snare"
          | "rim"
          | "hihat"
          | "hihat_closed"
          | "hihat_pedal"
          | "hihat_open"
          | "ride";
        velocity: number;
      }[] = [];

      let currentBeatCursor = 0;
      const wavBeatSectionMap: {
        isRhythm2Chorus: boolean;
        isEndOfChorus: boolean;
      }[] = [];

      for (let chorus = 1; chorus <= safeChoruses; chorus++) {
        const isRhythm2Chorus =
          safeChoruses === 1
            ? false
            : safeChoruses === 2
            ? chorus === 2
            : chorus > 1 && chorus < safeChoruses;

        for (let i = 0; i < seq.length; i++) {
          const currentChord = seq[i];
          const chordBeats = currentChord.beatsLength || beatsPerBar;
          const chordStartTimeSec = currentBeatCursor * secondsPerBeat;
          const isEndOfChorus = i === seq.length - 1;

          for (let b = 0; b < Math.round(chordBeats); b++) {
            wavBeatSectionMap.push({ isRhythm2Chorus, isEndOfChorus });
          }

          let effectiveChord = currentChord;
          if (!effectiveChord.chordString) {
            for (let back = 1; back <= seq.length; back++) {
              const prevIdx = (i - back + seq.length) % seq.length;
              if (seq[prevIdx] && seq[prevIdx].chordString) {
                effectiveChord = {
                  ...currentChord,
                  chordString: seq[prevIdx].chordString,
                  frequencies: seq[prevIdx].frequencies,
                  parsedRoot: seq[prevIdx].parsedRoot,
                  parsedType: seq[prevIdx].parsedType,
                };
                break;
              }
            }
          }

          let nextChordString: string | null = null;
          if (i + 1 < seq.length) {
            nextChordString =
              seq[i + 1].chordString || effectiveChord.chordString;
          } else if (seq.length > 0) {
            nextChordString = seq[0].chordString || effectiveChord.chordString;
          }

          const rawStyleLower = String(activeStyle || "").toLowerCase();
          const isBossa =
            rawStyleLower.includes("bossa") && !rawStyleLower.includes("samba");
          const isFunk = rawStyleLower.includes("funk");
          const isJazzSwing =
            !isBossa &&
            !isFunk &&
            !rawStyleLower.includes("samba") &&
            !rawStyleLower.includes("vals") &&
            !rawStyleLower.includes("waltz") &&
            !rawStyleLower.includes("bolero") &&
            !rawStyleLower.includes("reggaet") &&
            !rawStyleLower.includes("hip") &&
            (rawStyleLower.includes("swing") || rawStyleLower.includes("jazz"));

          if (effectiveChord.chordString) {
            if (isHarmonyAudible) {
              const comping = isBossa
                ? buildBossaNovaExportComping(
                    effectiveChord,
                    currentBeatCursor,
                    beatsPerBar,
                    isRhythm2Chorus
                  )
                : isJazzSwing
                ? buildJazzSwingExportComping(
                    effectiveChord,
                    currentBeatCursor,
                    beatsPerBar,
                    isRhythm2Chorus,
                    harmonicInst
                  )
                : isFunk
                ? buildFunkExportComping(
                    effectiveChord,
                    currentBeatCursor,
                    beatsPerBar
                  )
                : generateComping(
                    effectiveChord,
                    activeStyle,
                    currentBeatCursor,
                    harmonicInst,
                    timeSig
                  );
              comping.forEach((c) => {
                if (!c.freqs || c.freqs.length === 0) return;
                const hitStartSec =
                  chordStartTimeSec + c.timeOffset * secondsPerBeat;
                const hitDurationSec = Math.max(
                  isFunk ? 0.1 : 0.24,
                  c.durationBeats * secondsPerBeat
                );

                const cleanFreqs: number[] = [];
                const validNotes = Array.from(
                  new Set(
                    c.freqs
                      .filter((f) => f > 0 && !isNaN(f))
                      .map((f) => {
                        let freq = f;
                        while (freq < 130) freq *= 2;
                        while (freq > 880) freq /= 2;
                        cleanFreqs.push(freq);
                        return Tone.Frequency(freq).toNote();
                      })
                  )
                );

                if (validNotes.length > 0) {
                  const polyHeadroom = Math.min(
                    1.0,
                    1.0 / Math.sqrt(validNotes.length)
                  );
                  harmonyEvents.push({
                    time: Math.max(0, hitStartSec),
                    notes: validNotes,
                    freqs: cleanFreqs,
                    duration: hitDurationSec,
                    velocity: (c.velocity ?? 0.85) * polyHeadroom,
                  });
                }
              });
            }

            if (isBassAudible) {
              const bassNotes = isBossa
                ? buildBossaNovaExportBass(
                    effectiveChord.chordString,
                    chordBeats,
                    nextChordString
                  )
                : isJazzSwing
                ? buildJazzSwingExportBass(
                    effectiveChord.chordString,
                    chordBeats,
                    nextChordString,
                    currentBeatCursor,
                    beatsPerBar,
                    isRhythm2Chorus
                  )
                : isFunk
                ? buildFunkExportBass(
                    effectiveChord.chordString,
                    chordBeats,
                    nextChordString,
                    currentBeatCursor,
                    beatsPerBar,
                    isRhythm2Chorus
                  )
                : generateWalkingBass(
                    effectiveChord.chordString,
                    chordBeats,
                    nextChordString,
                    activeStyle,
                    currentBeatCursor,
                    timeSig
                  );
              bassNotes.forEach((n) => {
                if (
                  isNaN(n.freq) ||
                  isNaN(n.timeOffset) ||
                  isNaN(n.durationBeats)
                )
                  return;
                const noteStartSec =
                  chordStartTimeSec + n.timeOffset * secondsPerBeat;
                const safeDurBeats = Math.max(
                  isFunk ? 0.15 : 0.25,
                  Math.min(4.0, n.durationBeats)
                );
                const noteDurSec =
                  isBossa || isJazzSwing || isFunk
                    ? safeDurBeats * secondsPerBeat
                    : Math.max(0.28, safeDurBeats * secondsPerBeat * 0.88);
                const noteName = Tone.Frequency(n.freq).toNote();
                bassEvents.push({
                  time: Math.max(0, noteStartSec),
                  noteName,
                  freq: n.freq,
                  duration: noteDurSec,
                  velocity: (n as any).velocity ?? 0.88,
                });
              });
            }
          }

          currentBeatCursor += chordBeats;
        }
      }

      if (isDrumsAudible) {
        const rawStyleLower = String(activeStyle || "").toLowerCase();
        const isBossaDrums =
          rawStyleLower.includes("bossa") && !rawStyleLower.includes("samba");
        const isFunkDrums = rawStyleLower.includes("funk");
        const isJazzSwingDrums =
          !isBossaDrums &&
          !isFunkDrums &&
          !rawStyleLower.includes("samba") &&
          !rawStyleLower.includes("vals") &&
          !rawStyleLower.includes("waltz") &&
          !rawStyleLower.includes("bolero") &&
          !rawStyleLower.includes("reggaet") &&
          !rawStyleLower.includes("hip") &&
          (rawStyleLower.includes("swing") || rawStyleLower.includes("jazz"));
        for (let globalBeat = 0; globalBeat < seqTotalBeats; globalBeat++) {
          const beatInMeasure = globalBeat % beatsPerBar;
          const beatStartSec = globalBeat * secondsPerBeat;
          const secInfo = wavBeatSectionMap[globalBeat] || {
            isRhythm2Chorus: false,
            isEndOfChorus: false,
          };

          if (isBossaDrums) {
            const bossaHits = buildBossaNovaExportDrumsForBeat(
              beatInMeasure,
              globalBeat,
              beatsPerBar,
              secInfo.isRhythm2Chorus,
              secInfo.isEndOfChorus
            );
            for (const hit of bossaHits) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
          } else if (isJazzSwingDrums) {
            const swingHits = buildJazzSwingExportDrumsForBeat(
              beatInMeasure,
              globalBeat,
              beatsPerBar,
              secInfo.isRhythm2Chorus,
              secInfo.isEndOfChorus
            );
            for (const hit of swingHits) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
          } else if (isFunkDrums) {
            const funkHits = buildFunkExportDrumsForBeat(
              beatInMeasure,
              globalBeat,
              beatsPerBar,
              secInfo.isRhythm2Chorus
            );
            for (const hit of funkHits) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
          } else {
            const matrix = getDrumMatrixForBeat(
              activeStyle,
              beatInMeasure,
              globalBeat,
              timeSig
            );

            for (const hit of matrix.kick) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
            for (const hit of matrix.snare) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
            for (const hit of matrix.hihat) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
            for (const hit of matrix.ride) {
              drumEvents.push({
                time: Math.max(
                  0,
                  beatStartSec + hit.timeOffset * secondsPerBeat
                ),
                instrument: hit.instrument,
                velocity: hit.velocity,
              });
            }
          }
        }
      }

      const countInBars = bpmVal > 150 ? 2 : 1;
      const countInBeats = countInBars * beatsPerBar;
      const countInOffsetSec = 0.1 + countInBeats * secondsPerBeat;
      const totalDuration =
        countInOffsetSec + Math.max(4, progressionDurationSec) + 2.2;
      const roomWet = Math.max(0, Math.min(0.85, (reverbRoomPct / 100) * 0.65));

      const renderedBuffer = await Tone.Offline(async ({ transport }) => {
        transport.bpm.setValueAtTime(bpmVal, 0);
        const rawDestination = Tone.getDestination();

        const masterLimiter = new Tone.Limiter(-1.0).connect(rawDestination);
        const masterCompressor = new Tone.Compressor({
          threshold: -16,
          ratio: 2.5,
          attack: 0.015,
          release: 0.18,
        }).connect(masterLimiter);

        const reverbNode = new Tone.Freeverb({
          roomSize: 0.62,
          dampening: 3200,
          wet: roomWet,
        }).connect(masterCompressor);

        // 0. CONTEO DE ENTRADA (COUNT-IN) DEL METRÓNOMO
        const countInClickSynth = new Tone.Synth({
          oscillator: { type: "triangle" },
          envelope: {
            attack: 0.001,
            decay: 0.035,
            sustain: 0,
            release: 0.01,
          },
        }).connect(masterCompressor);
        countInClickSynth.volume.setValueAtTime(-4, 0);

        for (let beatIdx = 0; beatIdx < countInBeats; beatIdx++) {
          const isAccent = beatIdx % beatsPerBar === 0;
          const freq = isAccent ? 1200 : 800;
          const vel = isAccent ? 0.95 : 0.68;
          const clickTime = 0.1 + beatIdx * secondsPerBeat;
          transport.schedule((time) => {
            countInClickSynth.triggerAttackRelease(freq, 0.035, time, vel);
          }, clickTime);
        }

        // 1. CANAL DE ARMONÍA (PIANO / RHODES / GUITARRA HD)
        if (isHarmonyAudible && harmonyEvents.length > 0) {
          const harmGainNode = new Tone.Gain(harmGainLinear).connect(
            reverbNode
          );
          const harmFilter = new Tone.Filter({
            frequency: 130,
            type: "highpass",
          }).connect(harmGainNode);

          const sourceMap =
            harmonicInst === "guitar" ? bandBuffers.guitar : bandBuffers.piano;

          const harmUrls: Record<string, AudioBuffer> = {};
          Object.entries(sourceMap).forEach(([midiStr, buf]) => {
            if (buf) {
              const noteStr = Tone.Frequency(Number(midiStr), "midi").toNote();
              harmUrls[noteStr] = buf;
            }
          });

          if (Object.keys(harmUrls).length > 0) {
            const offlineHarmSampler = new Tone.Sampler({
              urls: harmUrls,
              attack: 0.006,
              release: 0.95,
              curve: "exponential",
            }).connect(harmFilter);
            offlineHarmSampler.volume.setValueAtTime(-8, 0);

            harmonyEvents.forEach((ev) => {
              transport.schedule((time) => {
                offlineHarmSampler.triggerAttackRelease(
                  ev.notes,
                  ev.duration,
                  time,
                  ev.velocity
                );
              }, countInOffsetSec + ev.time);
            });
          }
        }

        // 2. CANAL DE BAJO (CONTRABAJO / ELECTRIC BASS HD)
        if (isBassAudible && bassEvents.length > 0) {
          const bassGainNode = new Tone.Gain(bassGainLinear).connect(
            masterCompressor
          );
          const bassFilter = new Tone.Filter({
            frequency: 2200,
            type: "lowpass",
          }).connect(bassGainNode);

          const bassUrls: Record<string, AudioBuffer> = {};
          Object.entries(bandBuffers.bass).forEach(([midiStr, buf]) => {
            if (buf) {
              const noteStr = Tone.Frequency(Number(midiStr), "midi").toNote();
              bassUrls[noteStr] = buf;
            }
          });

          if (Object.keys(bassUrls).length > 0) {
            const offlineBassSampler = new Tone.Sampler({
              urls: bassUrls,
              attack: 0.01,
              release: 0.28,
              curve: "exponential",
            }).connect(bassFilter);
            offlineBassSampler.volume.setValueAtTime(0, 0);

            bassEvents.forEach((ev) => {
              transport.schedule((time) => {
                offlineBassSampler.triggerAttackRelease(
                  ev.noteName,
                  ev.duration,
                  time,
                  ev.velocity
                );
              }, countInOffsetSec + ev.time);
            });
          }
        }

        // 3. CANAL DE BATERÍA COMPLETO CON HI-HAT Y RIMSHOT DEDICADOS (IDÉNTICO AL MOTOR EN VIVO)
        if (isDrumsAudible && drumEvents.length > 0) {
          const drumBus = new Tone.Gain(drumsGainLinear).connect(reverbNode);

          const kickSampler = bandBuffers.drums.kick
            ? new Tone.Sampler({
                urls: { C4: bandBuffers.drums.kick },
              }).connect(drumBus)
            : null;

          const snareSampler = bandBuffers.drums.snare
            ? new Tone.Sampler({
                urls: { C4: bandBuffers.drums.snare },
              }).connect(drumBus)
            : null;

          const rimSampler = new Tone.Sampler({
            urls: { C4: realRimshotBuf },
          }).connect(drumBus);

          const hhClosedSampler = new Tone.Sampler({
            urls: { C4: realClosedHihatBuf },
          }).connect(drumBus);

          const hhOpenSampler = new Tone.Sampler({
            urls: { C4: realOpenHihatBuf },
          }).connect(drumBus);

          const rideSampler = bandBuffers.drums.ride
            ? new Tone.Sampler({
                urls: { C4: bandBuffers.drums.ride },
              }).connect(drumBus)
            : null;

          drumEvents.forEach((hit) => {
            transport.schedule((time) => {
              const v = Math.max(0.15, Math.min(1.0, hit.velocity ?? 0.75));
              if (hit.instrument === "kick" && kickSampler) {
                kickSampler.triggerAttackRelease("C4", 0.65, time, v);
              } else if (hit.instrument === "snare" && snareSampler) {
                snareSampler.triggerAttackRelease("C4", 0.45, time, v);
              } else if (hit.instrument === "rim") {
                rimSampler.triggerAttackRelease("C4", 0.12, time, v * 0.9);
              } else if (
                hit.instrument === "hihat" ||
                hit.instrument === "hihat_closed" ||
                hit.instrument === "hihat_pedal" ||
                hit.instrument === "hihat_open"
              ) {
                hhClosedSampler.triggerAttackRelease(
                  "C4",
                  0.085,
                  time,
                  v * 0.85
                );
              } else if (hit.instrument === "ride" && rideSampler) {
                rideSampler.triggerAttackRelease("C4", 1.4, time, v * 0.72);
              }
            }, countInOffsetSec + hit.time);
          });
        }

        transport.start(0);
      }, totalDuration);

      let outputBlob: Blob;
      if (extensionFormat === "mp3") {
        outputBlob = await audioBufferToRealMp3(renderedBuffer, 192);
      } else {
        outputBlob = audioBufferToWav(renderedBuffer);
      }

      const url = URL.createObjectURL(outputBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const safeTitle = (currentSong?.title || "mezcla_rumie")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/gi, "_")
        .replace(/^_+|_+$/g, "");
      a.download = `${safeTitle || "mezcla_rumie"}.${extensionFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setIsExportModalOpen(false);
      const sizeMb = (outputBlob.size / (1024 * 1024)).toFixed(1);
      triggerExportToast(
        extensionFormat === "mp3"
          ? `¡MP3 (192 kbps · ${sizeMb} MB) exportado correctamente!`
          : `¡Audio Master WAV (${sizeMb} MB) exportado correctamente!`
      );
    } catch (error) {
      console.error("Error exportando audio offline:", error);
      triggerExportToast("Error al renderizar y exportar el archivo de audio.");
    } finally {
      setExportingAudioFormat(null);
    }
  };

  const handleCycleComplete = React.useCallback(() => {
    const nextChorus = currentChorusRef.current + 1;
    if (nextChorus > totalChorusesRef.current) {
      currentChorusRef.current = 1;
      setCurrentChorusNumber(1);
      lastAutoScrolledRowRef.current = -1;
      if (metronomeControlRef.current) {
        metronomeControlRef.current.stop();
      }
      setIsPlayingState(false);
      setCurrentPlayingIndex(null);
    } else {
      currentChorusRef.current = nextChorus;
      setCurrentChorusNumber(nextChorus);
      lastAutoScrolledRowRef.current = -1;
      const firstRowEl = measureRowRefs.current[0];
      if (firstRowEl) {
        firstRowEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  const handleIsPlayingChange = (playing: boolean) => {
    setIsPlayingState(playing);
    if (!playing) {
      setCurrentPlayingIndex(null);
      currentChorusRef.current = 1;
      setCurrentChorusNumber(1);
      lastAutoScrolledRowRef.current = -1;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        if (
          file.name.endsWith(".xml") ||
          file.name.endsWith(".musicxml") ||
          /<score-partwise/i.test(content)
        ) {
          const parsed = parseLeadSheetMusicXml(content);
          if (parsed && parsed.measures.length > 0) {
            const sectionsMap: Record<string, number> = {};
            parsed.measures.forEach((m, idx) => {
              if (m.sectionLabel) {
                const badge = extractCleanSectionBadge(m.sectionLabel, "A");
                if (sectionsMap[badge] === undefined) {
                  sectionsMap[badge] = idx;
                }
              }
            });

            const resolvedXmlStyle = normalizeStyleDropdownValue(
              parsed.style || "Jazz Swing"
            );
            const resolvedXmlDrumStyle =
              detectDrumStyleFromSongStyle(resolvedXmlStyle);
            const resolvedXmlTempo = Number(parsed.tempo) || 120;

            const importedXml: Song = {
              id: `${parsed.title.toLowerCase().replace(/[\s/]+/g, "-")}-${Date.now()}`,
              title: parsed.title,
              tempo: resolvedXmlTempo,
              timeSignature: parsed.timeSignature,
              defaultKey: parsed.defaultKey as RootNote,
              defaultIsMinor: parsed.defaultIsMinor,
              style: parsed.style || "Jazz Swing",
              isCustom: true,
              sections:
                Object.keys(sectionsMap).length > 0 ? sectionsMap : { A: 0 },
              measures: parsed.measures,
            };

            setAllSongs((prev) => {
              const updated = [...prev, importedXml];
              try {
                localStorage.setItem(
                  "customSongs",
                  JSON.stringify(updated.filter((s) => s.isCustom))
                );
              } catch (_) {}
              return updated;
            });
            setSelectedStyleLabel(resolvedXmlStyle);
            setActiveDrumStyle(resolvedXmlDrumStyle);
            applyStyleInstrumentationRules(resolvedXmlStyle);
            setBpmDraft(String(resolvedXmlTempo));
            try {
              Tone.Transport.bpm.value = resolvedXmlTempo;
            } catch (_) {}
            window.dispatchEvent(
              new CustomEvent("change-bpm", { detail: resolvedXmlTempo })
            );
            setMixerChannels((prev) => ({ ...prev, melodyMuted: false }));
            setSelectedSongId(importedXml.id);
            setSelectedMeasureIndex(0);
            setSelectedChordSlotIndex(0);
            triggerExportToast(
              `Partitura MusicXML ("${importedXml.title}") importada correctamente.`
            );
            return;
          }
        }

        if (/irealb:\/\/|irealbook:\/\//i.test(content)) {
          const importedIReal = importFromIRealUrl(content);
          if (importedIReal && importedIReal.measures.length > 0) {
            setAllSongs((prev) => [...prev, importedIReal]);
            setSelectedSongId(importedIReal.id);
            setSelectedMeasureIndex(0);
            setSelectedChordSlotIndex(0);
            triggerExportToast(
              `Partitura iReal Pro ("${importedIReal.title}") importada correctamente.`
            );
            return;
          }
        }

        const parsed = JSON.parse(content);

        let loadedMeasures: SongMeasure[] = [];
        if (Array.isArray(parsed.measures)) {
          loadedMeasures = parsed.measures.map((m: any, idx: number) => ({
            id: m.id || `m-${idx + 1}-${Date.now()}`,
            chords: Array.isArray(m.chords)
              ? m.chords
              : typeof m.chord === "string"
              ? [m.chord]
              : m.chords
              ? [String(m.chords)]
              : [""],
            sectionLabel: m.sectionLabel || undefined,
            repeatStart: Boolean(m.repeatStart),
            repeatEnd: Boolean(m.repeatEnd),
            volta: m.volta || undefined,
            isEnd: Boolean(m.isEnd),
            modulateTo: m.modulateTo || undefined,
            melody: Array.isArray(m.melody) ? m.melody : undefined,
          }));
        }

        if (loadedMeasures.length === 0) return;

        const restoredSong: Song = {
          id: `custom-${Date.now()}`,
          title: parsed.title || "Sesión Cargada",
          style: parsed.style || "Jazz Swing",
          tempo: parsed.tempo || 120,
          timeSignature: parsed.timeSignature || "4/4",
          defaultKey: parsed.defaultKey || "C",
          defaultIsMinor: Boolean(parsed.defaultIsMinor),
          isCustom: true,
          sections: parsed.sections || { A: 0 },
          measures: loadedMeasures,
        };

        setAllSongs((prev) => [...prev, restoredSong]);
        setSelectedSongId(restoredSong.id);
        setSelectedMeasureIndex(0);
        setSelectedChordSlotIndex(0);
        triggerExportToast("Sesión (.linus) cargada correctamente.");
      } catch (err) {
        console.error("Error al procesar el archivo .linus:", err);
      }
    };
    reader.readAsText(file);
  };

  const { globalKey, globalIsMinor } = useMemo(() => {
    let rawKey = currentSong.defaultKey || "C";
    let isMinStr = /m|-|min/i.test(rawKey);
    let key = rawKey.replace(/m|-|min/gi, "").trim() as RootNote;
    let isMinor = !!currentSong.defaultIsMinor || isMinStr;

    if (
      currentSong.defaultIsMinor === undefined &&
      !isMinStr &&
      currentSong?.measures
    ) {
      const allFlatChords = currentSong.measures
        .flatMap((m) => m.chords || [])
        .filter((c) => {
          const str =
            typeof c === "string"
              ? c
              : (c as any)?.chordName || (c as any)?.name || "";
          return str && str.trim() !== "" && str !== "%";
        });
      if (allFlatChords.length > 0) {
        const firstC = allFlatChords[0];
        const lastC = allFlatChords[allFlatChords.length - 1];
        const firstParsed = parseChord(
          typeof firstC === "string" ? firstC : (firstC as any)?.chordName || ""
        );
        const lastParsed = parseChord(
          typeof lastC === "string" ? lastC : (lastC as any)?.chordName || ""
        );
        const cleanTonic = (
          key in ROOT_MIDI_OFFSET_MAP ? key : "C"
        ) as RootNote;

        if (
          (isMinorQuality(firstParsed.type) &&
            ROOT_MIDI_OFFSET_MAP[firstParsed.root] ===
              ROOT_MIDI_OFFSET_MAP[cleanTonic]) ||
          (isMinorQuality(lastParsed.type) &&
            ROOT_MIDI_OFFSET_MAP[lastParsed.root] ===
              ROOT_MIDI_OFFSET_MAP[cleanTonic])
        ) {
          isMinor = true;
        }
      }
    }

    return { globalKey: key || "C", globalIsMinor: isMinor };
  }, [currentSong]);

  const activeKeyDropdownValue = useMemo(
    () => normalizeKeySelectionValue(globalKey, globalIsMinor),
    [globalKey, globalIsMinor]
  );

  const quickChordSuggestions = useMemo(() => {
    if (!isQuickChordDropdownOpen) return [];
    return getMasterChordSuggestions(quickChordInput, globalKey);
  }, [isQuickChordDropdownOpen, quickChordInput, globalKey]);

  const analyzedChords = useMemo(() => {
    let currentKey = globalKey;
    let currentIsMinor = globalIsMinor;

    const contexts: ChordInputContext[] = [];

    (currentSong?.measures || []).forEach((m) => {
      if (m.modulateTo) {
        currentKey = m.modulateTo.key;
        currentIsMinor = m.modulateTo.isMinor;
      }
      const rawChords = m.chords && m.chords.length > 0 ? m.chords : [""];
      const slotCount =
        rawChords.length <= 1 ? 1 : rawChords.length === 2 ? 2 : 4;
      for (let i = 0; i < slotCount; i++) {
        const c = rawChords[i] || "";
        const actualChordName =
          typeof c === "string"
            ? c
            : (c as any)?.chordName ||
              (c as any)?.name ||
              (c as any)?.text ||
              "";
        contexts.push({
          chordString: actualChordName,
          keyContext: currentKey,
          isMinorKey: currentIsMinor,
        });
      }
    });

    return analyzeSongHarmony(contexts);
  }, [currentSong, globalKey, globalIsMinor]);

  const analyzedMeasures = useMemo(() => {
    let globalIdx = 0;
    return (currentSong?.measures || []).map((m) => {
      const rawChords = m.chords && m.chords.length > 0 ? m.chords : [""];
      const slotCount =
        rawChords.length <= 1 ? 1 : rawChords.length === 2 ? 2 : 4;
      return Array.from({ length: slotCount }, () => analyzedChords[globalIdx++]);
    });
  }, [currentSong, analyzedChords]);

  const allRawChords = useMemo(() => {
    return (currentSong?.measures || []).flatMap((m) => {
      const rawChords = m.chords && m.chords.length > 0 ? m.chords : [""];
      const slotCount =
        rawChords.length <= 1 ? 1 : rawChords.length === 2 ? 2 : 4;
      return Array.from({ length: slotCount }, (_, i) => {
        const c = rawChords[i] || "";
        const rawStr =
          typeof c === "string"
            ? c
            : (c as any)?.chordName || (c as any)?.name || "";
        return sanitizeChordString(rawStr);
      });
    });
  }, [currentSong]);

  const measureFlatIndices = useMemo(() => {
    let acc = 0;
    return (currentSong?.measures || []).map((m) => {
      const start = acc;
      const rawChords = m.chords && m.chords.length > 0 ? m.chords : [""];
      const slotCount =
        rawChords.length <= 1 ? 1 : rawChords.length === 2 ? 2 : 4;
      acc += slotCount;
      return start;
    });
  }, [currentSong]);

  const volta1SpanSet = useMemo(() => {
    const set = new Set<number>();
    const measures = currentSong?.measures || [];
    for (let i = 0; i < measures.length; i++) {
      if (measures[i].volta === 1) {
        set.add(i);
        for (let j = i + 1; j < measures.length; j++) {
          if (measures[j].volta === 2 || measures[j].repeatStart) break;
          set.add(j);
          if (measures[j].repeatEnd) break;
        }
      }
    }
    return set;
  }, [currentSong?.measures]);

  const syncDawPlayheadToMeasure = React.useCallback(
    (measureIndex: number, slotIdx: number = 0, flatIdx?: number) => {
      const clampedMeasure = Math.max(0, Math.floor(measureIndex));
      const bPerBar = getBeatsPerBar(currentSong?.timeSignature || "4/4");
      const bpmVal = Math.max(
        20,
        Tone.Transport.bpm.value || currentSong?.tempo || 120
      );
      const secondsPerBeat = 60 / bpmVal;
      const targetSeconds = clampedMeasure * bPerBar * secondsPerBeat;

      (window as any).__linusSeekMeasureIndex = clampedMeasure;
      (window as any).__linusSeekTargetSeconds = targetSeconds;

      try {
        Tone.Transport.seconds = targetSeconds;
      } catch (_) {}

      window.dispatchEvent(
        new CustomEvent("linus-seek-measure", {
          detail: {
            measureIndex: clampedMeasure,
            bar: clampedMeasure + 1.0,
            targetSeconds,
            slotIdx,
            flatIndex: flatIdx,
            source: "chord-grid",
          },
        })
      );
    },
    [currentSong?.timeSignature, currentSong?.tempo]
  );

  useEffect(() => {
    if (metronomeControlRef.current) {
      try {
        metronomeControlRef.current.stop();
      } catch (_) {}
    }
    try {
      Tone.Transport.stop();
      Tone.Transport.seconds = 0;
      Tone.Transport.position = "0:0:0";
    } catch (_) {}
    syncDawPlayheadToMeasure(0, 0, 0);
    setCurrentPlayingIndex(null);
    setIsPlayingState(false);
    setTransposition(0);
    setSelectedMeasureIndex(0);
    setSelectedChordSlotIndex(0);
    setMeasurePageOffset(0);
    setIsDeleteSongModalOpen(false);
    currentChorusRef.current = 1;
    setCurrentChorusNumber(1);
    lastAutoScrolledRowRef.current = -1;
  }, [selectedSongId]);

  useEffect(() => {
    if (
      currentSong &&
      currentSong.measures.length > 0 &&
      currentSong.measures[0].chords.length > 0 &&
      analyzedMeasures.length > 0
    ) {
      const rawChord = currentSong.measures[0].chords[0];
      const firstChord =
        typeof rawChord === "string"
          ? rawChord
          : (rawChord as any)?.chordName ||
            (rawChord as any)?.name ||
            (rawChord as any)?.text ||
            "";
      const transposedFirst =
        transposition !== 0
          ? transposeChordString(firstChord, transposition, globalKey)
          : firstChord;
      setFocusedChord({
        originalString: firstChord,
        transposedString: transposedFirst,
        analysisContext: analyzedMeasures[0]?.[0] || null,
        flatIndex: 0,
      });
    } else {
      setFocusedChord(null);
    }
  }, [selectedSongId]);

  const handleTranspose = (amount: number) => {
    setTransposition((prev) => {
      const nextValue = prev + amount;
      if (nextValue > 11) return -11;
      if (nextValue < -11) return 11;
      return nextValue;
    });
  };

  const handleResetTranspose = () => {
    setTransposition(0);
  };

  const playChord = (chordToPlay: string) => {
    const parsed = parseChord(chordToPlay);
    let frequencies: number[] = [];
    if (parsed.root) {
      const midiNotes = buildJazzVoicing(chordToPlay);
      frequencies = midiNotes.map((m) => 440 * Math.pow(2, (m - 69) / 12));
    }
    if (frequencies.length > 0) {
      interactiveAnalysisAudio.playHarmonyChord(
        frequencies,
        0,
        1.8,
        instrument === "piano" || !styleAllowsGuitar ? "piano" : "guitar"
      );
    }
  };

  const handleChordClick = (
    chordString: string,
    analysisContext?: AnalyzedChord,
    flatIndex?: number,
    shouldPlayAudio: boolean = false
  ) => {
    let effectiveChordString = chordString;
    if (chordString === "%") {
      for (let prevIdx = (flatIndex ?? 1) - 1; prevIdx >= 0; prevIdx--) {
        const prev = allRawChords[prevIdx];
        if (prev && prev !== "%") {
          effectiveChordString = prev;
          break;
        }
      }
      if (effectiveChordString === "%") effectiveChordString = "C";
    }

    const transposedString =
      transposition === 0
        ? effectiveChordString
        : transposeChordString(effectiveChordString, transposition, globalKey);

    setFocusedChord({
      originalString: chordString,
      transposedString,
      analysisContext: analysisContext || null,
      flatIndex,
    });

    if (shouldPlayAudio && transposedString && transposedString !== "%") {
      playChord(transposedString);
    }
  };

  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(
    null
  );

  const playbackSequence = useMemo(() => {
    return buildSongPlaybackSequence(currentSong, transposition, globalKey);
  }, [currentSong, transposition, globalKey]);

  const getPlaybackSequence = React.useCallback(() => {
    return buildSongPlaybackSequence(currentSong, transposition, globalKey);
  }, [currentSong, transposition, globalKey]);

  useEffect(() => {
    if (currentPlayingIndex !== null) {
      const p =
        playbackSequence.find(
          (item) => item.originalFlatIndex === currentPlayingIndex
        ) || playbackSequence[currentPlayingIndex];
      if (p) {
        const analysisContext = analyzedChords[currentPlayingIndex] || null;
        setFocusedChord({
          originalString: p.originalString,
          transposedString: p.chordString,
          analysisContext,
          flatIndex: currentPlayingIndex,
        });

        const activeMeasureIdx =
          typeof p.measureIndex === "number" ? p.measureIndex : 0;
        const activeRowIdx = Math.floor(activeMeasureIdx / 8);

        if (activeRowIdx !== lastAutoScrolledRowRef.current) {
          lastAutoScrolledRowRef.current = activeRowIdx;
          const rowEl = measureRowRefs.current[activeRowIdx];
          if (rowEl) {
            const rect = rowEl.getBoundingClientRect();
            const viewportHeight =
              window.innerHeight || document.documentElement.clientHeight;
            const isOutOfComfortZone =
              rect.top < 110 || rect.bottom > viewportHeight - 90;
            if (
              isOutOfComfortZone ||
              (currentSong?.measures?.length || 0) > 24
            ) {
              rowEl.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        }
      }
    }
  }, [
    currentPlayingIndex,
    playbackSequence,
    analyzedChords,
    currentSong?.measures?.length,
  ]);

  const displayedKeyCenter = useMemo(() => {
    return transposeRoot(globalKey, transposition, globalKey);
  }, [globalKey, transposition]);

  const transposedSongForScore = useMemo(() => {
    const activeKeyStr = globalIsMinor
      ? `${displayedKeyCenter}m`
      : displayedKeyCenter;

    const transposedMeasures = (currentSong?.measures || []).map((m) => {
      let currentKeyForMeasure = globalKey;
      if (m.modulateTo?.key) {
        currentKeyForMeasure = m.modulateTo.key;
      }
      const rawChords = m.chords && m.chords.length > 0 ? m.chords : [""];
      const newChords = rawChords.map((c) => {
        const rawStr =
          typeof c === "string"
            ? c
            : (c as any)?.chordName ||
              (c as any)?.name ||
              (c as any)?.text ||
              "";
        const cleanStr = sanitizeChordString(rawStr);
        if (!cleanStr || cleanStr.trim() === "" || cleanStr === "%") {
          return cleanStr;
        }
        return transposition !== 0
          ? transposeChordString(cleanStr, transposition, currentKeyForMeasure)
          : cleanStr;
      });
      return {
        ...m,
        chords: newChords,
      };
    });

    return {
      ...currentSong,
      defaultKey: activeKeyStr,
      activeKey: activeKeyStr,
      transposition,
      isAlreadyTransposed: true,
      measures: transposedMeasures,
    } as Song & {
      activeKey: string;
      transposition: number;
      isAlreadyTransposed: boolean;
    };
  }, [currentSong, transposition, globalKey, globalIsMinor, displayedKeyCenter]);

  const getNthDistinctNeighborTransposedChord = React.useCallback(
    (
      flatIdx: number,
      stepDirection: -1 | 1,
      countSteps: number = 1
    ): string | null => {
      if (!allRawChords || allRawChords.length === 0) return null;
      const originRaw = allRawChords[flatIdx] || "";
      const originTrans =
        transposition === 0
          ? originRaw
          : transposeChordString(originRaw, transposition, globalKey);
      let refClass = classifyChordQuality(originTrans);

      let cursor = flatIdx + stepDirection;
      let foundCount = 0;
      while (cursor >= 0 && cursor < allRawChords.length) {
        const candidate = allRawChords[cursor];
        if (candidate && candidate !== "%" && candidate.trim() !== "") {
          const candTrans =
            transposition === 0
              ? candidate
              : transposeChordString(candidate, transposition, globalKey);
          const candClass = classifyChordQuality(candTrans);

          const isSameHarmony =
            refClass &&
            candClass &&
            refClass.semi === candClass.semi &&
            refClass.isDominant === candClass.isDominant &&
            refClass.isMinorSeventh === candClass.isMinorSeventh &&
            refClass.isMajorTonic === candClass.isMajorTonic &&
            refClass.isHalfDim === candClass.isHalfDim;

          if (!isSameHarmony) {
            foundCount++;
            if (foundCount === countSteps) {
              return candTrans;
            }
            refClass = candClass;
          }
        }
        cursor += stepDirection;
      }
      return null;
    },
    [allRawChords, transposition, globalKey]
  );

  const focusedChordVoicingDetails = useMemo(() => {
    if (!focusedChord) return null;
    const parsed = parseChord(focusedChord.transposedString);
    const voicing = getGuitarChordVoicing(parsed.root, parsed.type);

    let scaleKeyCenter = displayedKeyCenter;
    if (focusedChord.analysisContext) {
      scaleKeyCenter = transposeRoot(
        focusedChord.analysisContext.keyContext,
        transposition,
        globalKey
      );
    }

    const isMinor = focusedChord.analysisContext?.isMinorKey ?? globalIsMinor;
    const numeral = focusedChord.analysisContext?.romanNumeral;
    const category = focusedChord.analysisContext?.category;
    const flatIdx = focusedChord.flatIndex ?? 0;

    const prevTransposed = getNthDistinctNeighborTransposedChord(
      flatIdx,
      -1,
      1
    );
    const nextTransposed = getNthDistinctNeighborTransposedChord(flatIdx, 1, 1);
    const nextNextTransposed = getNthDistinctNeighborTransposedChord(
      flatIdx,
      1,
      2
    );

    const baseScale = getSuggestedScale(
      parsed.root,
      parsed.type,
      scaleKeyCenter,
      numeral,
      isMinor,
      prevTransposed,
      category,
      nextTransposed
    );

    const suggestedScale = resolveTransposedScaleForChord({
      baseScale,
      romanNumeral: numeral,
      category,
      chordString: focusedChord.transposedString,
      prevChordString: prevTransposed,
      nextChordString: nextTransposed,
      nextNextChordString: nextNextTransposed,
    });

    return {
      root: parsed.root,
      type: parsed.type,
      suffix: parsed.suffix,
      voicing,
      suggestedScale,
    };
  }, [
    focusedChord,
    displayedKeyCenter,
    transposition,
    globalKey,
    globalIsMinor,
    getNthDistinctNeighborTransposedChord,
  ]);

  const effectiveChordDetails = useMemo(() => {
    if (focusedChordVoicingDetails) return focusedChordVoicingDetails;
    let rawStr = "";
    const selMeasure = currentSong?.measures?.[selectedMeasureIndex ?? 0];
    if (selMeasure && selMeasure.chords && selMeasure.chords.length > 0) {
      const c =
        selMeasure.chords[selectedChordSlotIndex ?? 0] || selMeasure.chords[0];
      rawStr =
        typeof c === "string"
          ? c
          : (c as any)?.chordName || (c as any)?.name || "";
    }
    if (!rawStr && allRawChords.length > 0) {
      rawStr =
        allRawChords.find((c) => c && c !== "%" && c.trim() !== "") || "Cmaj7";
    }
    if (!rawStr) rawStr = "Cmaj7";

    const parsed = parseChord(rawStr);
    const voicing = getGuitarChordVoicing(parsed.root, parsed.type);
    const baseScale = getSuggestedScale(
      parsed.root,
      parsed.type,
      displayedKeyCenter,
      undefined,
      globalIsMinor,
      undefined,
      undefined
    );

    const suggestedScale = resolveTransposedScaleForChord({
      baseScale,
      chordString: rawStr,
    });

    return {
      root: parsed.root,
      type: parsed.type,
      suffix: parsed.suffix,
      voicing,
      suggestedScale,
    };
  }, [
    focusedChordVoicingDetails,
    currentSong,
    selectedMeasureIndex,
    selectedChordSlotIndex,
    allRawChords,
    displayedKeyCenter,
    globalIsMinor,
  ]);

  const effectiveChordString =
    focusedChord?.transposedString ||
    focusedChord?.originalString ||
    (effectiveChordDetails
      ? `${effectiveChordDetails.root}${effectiveChordDetails.suffix}`
      : "Cmaj7");

  const selectedMeasure =
    selectedMeasureIndex !== null && currentSong.measures
      ? currentSong.measures[selectedMeasureIndex]
      : null;

  const handleSelectKeyFromDropdown = (selectedVal: string) => {
    const isMinorSelected = selectedVal.endsWith("m");
    const cleanRoot = selectedVal.replace(/m$/i, "").trim();
    const newSong: Song = {
      ...currentSong,
      isCustom: true,
      defaultKey: cleanRoot,
      defaultIsMinor: isMinorSelected,
    };
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSong : s))
    );
    setTransposition(0);
  };

  const handleConfirmCreateNewSheet = () => {
    if (/irealb:\/\/|irealbook:\/\//i.test(newSheetTitle)) {
      const importedIReal = importFromIRealUrl(newSheetTitle);
      if (importedIReal && importedIReal.measures.length > 0) {
        setAllSongs((prev) => {
          const updated = [...prev, importedIReal];
          localStorage.setItem(
            "customSongs",
            JSON.stringify(updated.filter((s) => s.isCustom))
          );
          return updated;
        });
        setSelectedSongId(importedIReal.id);
        setSelectedMeasureIndex(0);
        setSelectedChordSlotIndex(0);
        setIsNewSheetModalOpen(false);
        return;
      }
    }

    const safeCount = Math.max(
      1,
      Math.min(64, Number(newSheetMeasuresCount) || 16)
    );
    const generatedMeasures: SongMeasure[] = Array.from(
      { length: safeCount },
      (_, idx) => ({
        id: `m-${idx + 1}-${Date.now()}`,
        chords: [""],
        sectionLabel:
          idx === 0
            ? "[A]"
            : idx === 8 && safeCount >= 16
            ? "[B]"
            : idx === 16 && safeCount >= 24
            ? "[A]"
            : idx === 24 && safeCount >= 32
            ? "[C]"
            : undefined,
      })
    );

    const isMinorNew = newSheetKey.endsWith("m");
    const cleanRootNew = newSheetKey.replace(/m$/i, "").trim() || "C";
    const normNewStyle = normalizeStyleDropdownValue(newSheetStyle);
    const autoTimeSig =
      normNewStyle === "Vals Criollo" ? "3/4" : newSheetTimeSig || "4/4";
    const autoInitialTempo = normNewStyle === "Samba" ? 200 : 120;

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: newSheetTitle.trim() || "Mi Nueva Progresión",
      defaultKey: cleanRootNew,
      defaultIsMinor: isMinorNew,
      timeSignature: autoTimeSig,
      style: normNewStyle,
      tempo: autoInitialTempo,
      isCustom: true,
      sections: { A: 0 },
      measures: generatedMeasures,
    };

    setAllSongs((prev) => {
      const updated = [...prev, newSong];
      localStorage.setItem(
        "customSongs",
        JSON.stringify(updated.filter((s) => s.isCustom))
      );
      return updated;
    });
    setSelectedSongId(newSong.id);
    setSelectedMeasureIndex(0);
    setSelectedChordSlotIndex(0);
    setIsEditMode(true);
    setIsNewSheetModalOpen(false);
  };

  const handleMusicXMLImport = (song: Song) => {
    const bpb = getBeatsPerBar(song.timeSignature || "4/4");
    const enrichedMeasures = (song.measures || []).map((m, mIdx) => {
      if (m.melody && m.melody.length > 0) return m;
      if (song.importedMelody && song.importedMelody.length > 0) {
        const barStart = mIdx * bpb;
        const barEnd = (mIdx + 1) * bpb;
        const notesInBar: MelodyNote[] = song.importedMelody
          .filter((n) => n.startBeat >= barStart - 0.01 && n.startBeat < barEnd - 0.01)
          .map((n) => ({
            midi: Math.round(69 + 12 * Math.log2(Math.max(20, n.freq) / 440)),
            startBeat: Math.max(0, n.startBeat - barStart),
            durationBeats: Math.max(0.1, n.durationBeats),
            velocity: 0.85,
          }));
        if (notesInBar.length > 0) {
          return { ...m, melody: notesInBar };
        }
      }
      return m;
    });

    const resolvedStyle = normalizeStyleDropdownValue(
      song.style || "Jazz Swing"
    );
    const resolvedDrumStyle = detectDrumStyleFromSongStyle(resolvedStyle);
    const resolvedTempo = Number(song.tempo) || 120;

    const songWithMelody: Song = {
      ...song,
      style: song.style || "Jazz Swing",
      tempo: resolvedTempo,
      measures: enrichedMeasures,
    };

    setAllSongs((prev) => {
      const updated = [...prev, songWithMelody];
      localStorage.setItem(
        "customSongs",
        JSON.stringify(updated.filter((s) => s.isCustom))
      );
      return updated;
    });
    setSelectedStyleLabel(resolvedStyle);
    setActiveDrumStyle(resolvedDrumStyle);
    applyStyleInstrumentationRules(resolvedStyle);
    setBpmDraft(String(resolvedTempo));
    try {
      Tone.Transport.bpm.value = resolvedTempo;
    } catch (_) {}
    window.dispatchEvent(
      new CustomEvent("change-bpm", { detail: resolvedTempo })
    );
    setMixerChannels((prev) => ({ ...prev, melodyMuted: false }));
    setSelectedSongId(songWithMelody.id);
    setSelectedMeasureIndex(0);
    setSelectedChordSlotIndex(0);
    triggerExportToast(
      `Partitura MusicXML ("${songWithMelody.title}") importada correctamente.`
    );
  };

  const handleBpmDelta = (delta: number) => {
    const current = Number(currentSong.tempo) || 120;
    const nextBpm = Math.max(40, Math.min(240, current + delta));
    setBpmDraft(String(nextBpm));
    const newSong = { ...currentSong, tempo: nextBpm };
    setAllSongs((prev) =>
      prev.map((s) => (s.id === currentSong.id ? newSong : s))
    );
    try {
      Tone.Transport.bpm.value = nextBpm;
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("change-bpm", { detail: nextBpm }));
  };

  const handleMasterVolChange = (pct: number) => {
    const safePct = Math.max(0, Math.min(100, Math.round(pct)));
    const nextMuted = masterMuted && safePct > 0 ? false : masterMuted;
    if (nextMuted !== masterMuted) {
      setMasterMuted(nextMuted);
    }
    setMasterVolPct(safePct);
    try {
      interactiveAnalysisAudio.setMasterGainDirect(
        nextMuted ? 0 : safePct / 100
      );
    } catch (_) {}
  };

  const toggleMasterMute = () => {
    const nextMuted = !masterMuted;
    setMasterMuted(nextMuted);
    try {
      interactiveAnalysisAudio.setMasterGainDirect(
        nextMuted ? 0 : masterVolPct / 100
      );
    } catch (_) {}
  };

  const handlePlayTrigger = () => {
    if (metronomeControlRef.current) {
      metronomeControlRef.current.togglePlayback();
    } else {
      const btn = document.getElementById("metronome-toggle-btn");
      if (btn) btn.click();
    }
  };

  const handleStopTrigger = () => {
    if (metronomeControlRef.current) {
      metronomeControlRef.current.stop();
    }
    setIsPlayingState(false);
    setCurrentPlayingIndex(null);
    currentChorusRef.current = 1;
    setCurrentChorusNumber(1);
    lastAutoScrolledRowRef.current = -1;
  };

  const handleRestartLoopTrigger = () => {
    syncDawPlayheadToMeasure(0, 0, 0);
    setSelectedMeasureIndex(0);
    setSelectedChordSlotIndex(0);
    currentChorusRef.current = 1;
    setCurrentChorusNumber(1);
    lastAutoScrolledRowRef.current = 0;
    const firstRowEl = measureRowRefs.current[0];
    if (firstRowEl) {
      firstRowEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const totalMeasures = currentSong?.measures?.length || 0;
  const visibleMeasuresSlice = useMemo(() => {
    return currentSong?.measures || [];
  }, [currentSong?.measures]);

  const rowsOf8Measures = useMemo(() => {
    const rows: {
      rowIndex: number;
      sectionBadge: string;
      items: { measure: SongMeasure; globalIndex: number }[];
    }[] = [];

    const defaultRowBadges = ["A", "B", "A", "C", "D", "A", "B", "C"];
    const totalRows = Math.ceil(visibleMeasuresSlice.length / 8);

    for (let r = 0; r < totalRows; r++) {
      const startInSlice = r * 8;
      const chunk = visibleMeasuresSlice.slice(startInSlice, startInSlice + 8);
      if (chunk.length === 0) break;

      const firstGlobalIdx = startInSlice;
      const firstM = chunk[0];
      let badge = defaultRowBadges[r % defaultRowBadges.length] || "A";

      if ((firstM as any)?.section) {
        badge = extractCleanSectionBadge((firstM as any).section, badge);
      } else if (firstM?.sectionLabel) {
        badge = extractCleanSectionBadge(firstM.sectionLabel, badge);
      } else if (currentSong.sections) {
        const foundSec = Object.entries(currentSong.sections).find(
          ([_, idx]) => idx === firstGlobalIdx
        );
        if (foundSec) {
          badge = extractCleanSectionBadge(foundSec[0], badge);
        }
      }

      rows.push({
        rowIndex: r,
        sectionBadge: badge,
        items: chunk.map((m, idx) => ({
          measure: m,
          globalIndex: firstGlobalIdx + idx,
        })),
      });
    }

    return rows;
  }, [visibleMeasuresSlice, currentSong.sections]);

  const renderStyleOptions = () => (
    <>
      {STYLE_CATEGORIES_CATALOG.map((cat) => (
        <optgroup
          key={cat.groupEs}
          label={isEs ? cat.groupEs : cat.groupEn}
          className="bg-[#0c0e14] text-[#f25100] font-bold"
        >
          {cat.styles.map((st) => (
            <option
              key={st.value}
              value={st.value}
              className="bg-[#141722] text-white font-normal"
            >
              {isEs ? st.labelEs : st.labelEn}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );

  return (
    <div className="w-full min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col select-none">
      {/* Motor de Audio Oculto */}
      <div className="hidden" aria-hidden="true">
        <Metronome
          key={`metro-${currentSong.id}-${currentSong.timeSignature || "4/4"}`}
          initialBPM={currentSong.tempo}
          inline={true}
          playbackSequence={playbackSequence}
          getPlaybackSequence={getPlaybackSequence}
          importedMelody={currentSong.importedMelody}
          songStyle={selectedStyleLabel}
          drumStyle={activeDrumStyle}
          onDrumStyleChange={(st) => {
            setActiveDrumStyle(st);
            const normSt = normalizeStyleDropdownValue(st);
            setSelectedStyleLabel(normSt);
            applyStyleInstrumentationRules(normSt);
          }}
          timeSignature={currentSong.timeSignature || "4/4"}
          onTimeSignatureChange={(sig) => {
            const newSong = {
              ...currentSong,
              isCustom: true,
              timeSignature: sig,
            };
            setAllSongs((prev) =>
              prev.map((s) => (s.id === currentSong.id ? newSong : s))
            );
          }}
          onPlayingIndexChange={setCurrentPlayingIndex}
          metronomeControlRef={metronomeControlRef}
          onCycleComplete={handleCycleComplete}
          onIsPlayingChange={handleIsPlayingChange}
          selectedMeasureIndex={selectedMeasureIndex}
          isVisible={isVisible}
          dawTracks={[]}
          totalChoruses={totalChoruses}
          currentChorusRef={currentChorusRef}
          melodyInstrument={melodyInstrument}
          melodyVolume={
            masterMuted || mixerChannels.melodyMuted
              ? 0
              : (mixerChannels.melodyVol / 100) * (masterVolPct / 100)
          }
          melodyMuted={masterMuted || mixerChannels.melodyMuted}
          transposition={transposition}
        />
      </div>

      {/* =====================================================================
          1. HEADER SUPERIOR CORPORATIVO
      ===================================================================== */}
      <header className="w-full bg-[#0c0e14] border-b border-[#1c1f2b] px-4 sm:px-6 h-16 flex items-center justify-between gap-3 print:hidden shrink-0">
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#f25100] flex items-center justify-center shadow-[0_0_18px_rgba(242,81,0,0.45)] shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-baseline gap-1.5 leading-none">
              <span>Rumie Harmonic</span>
              <span className="font-light text-zinc-400">Pro</span>
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-400 mt-1 leading-none">
              {isEs
                ? "APRENDE, COMPRENDE Y CREA MÚSICA"
                : "LEARN, UNDERSTAND AND CREATE MUSIC"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-10 px-3 w-[220px] sm:w-[255px]">
            <Folder size={15} className="text-[#f25100] mr-2.5 shrink-0" />
            <select
              value={selectedSongId}
              onChange={(e) => {
                handleStopTrigger();
                syncDawPlayheadToMeasure(0, 0, 0);
                setSelectedSongId(e.target.value);
                setIsEditMode(false);
              }}
              className="w-full bg-transparent text-sm font-bold text-white appearance-none outline-none pr-6 cursor-pointer truncate"
            >
              {[
                "Mis Progresiones Personalizadas",
                "Estándares de Jazz / Swing",
                "Bebop & Up-Tempo Swing",
                "Bossa Nova & Latin Jazz",
                "Gypsy Jazz / Manouche",
                "Modal & Post-Bop",
                "Funk, Soul Jazz & Blues",
                "Baladas de Jazz",
              ].map((groupName) => {
                const groupSongs = allSongs.filter(
                  (s) => getSongCategoryGroup(s) === groupName
                );
                if (groupSongs.length === 0) return null;
                return (
                  <optgroup
                    key={groupName}
                    label={`${groupName} (${groupSongs.length})`}
                    className="bg-[#0c0e14] text-[#f25100] font-bold"
                  >
                    {groupSongs.map((song) => (
                      <option
                        key={song.id}
                        value={song.id}
                        className="bg-[#141722] text-white font-normal"
                      >
                        {song.title} {song.isCustom ? "★" : ""}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 text-zinc-400 pointer-events-none"
            />
          </div>

          <button
            type="button"
            disabled={!isCustomSong}
            onClick={() => {
              if (isCustomSong) setIsDeleteSongModalOpen(true);
            }}
            title={
              isCustomSong
                ? isEs
                  ? "Eliminar esta Hoja en Blanco"
                  : "Delete this custom progression"
                : isEs
                ? "Los estándares del catálogo base están protegidos"
                : "Built-in standards cannot be deleted"
            }
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
              isCustomSong
                ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300 cursor-pointer"
                : "bg-[#141722]/40 border-[#1c1f2b] text-zinc-700 cursor-not-allowed"
            }`}
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              setNewSheetTitle("Mi Nueva Progresión");
              setNewSheetMeasuresCount(16);
              setIsNewSheetModalOpen(true);
            }}
            title={
              isEs
                ? "Nueva Hoja en Blanco (Elegir cantidad de compases)"
                : "New Blank Sheet (Choose measure count)"
            }
            className="h-10 px-3 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] hover:border-[#f25100] text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} className="text-[#f25100]" />
            <span className="text-xs font-bold hidden sm:inline">
              {isEs ? "Hoja en Blanco" : "Blank Sheet"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleTriggerFileInput}
            title={
              isEs
                ? "Abrir / Cargar Sesión guardada (.linus)"
                : "Open / Load saved session (.linus)"
            }
            className="h-10 px-3 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] hover:border-[#f25100] text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <FolderOpen size={15} className="text-amber-400" />
            <span className="text-xs font-bold hidden lg:inline">
              {isEs ? "Abrir Sesión" : "Open Session"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleTriggerFileInput}
            title={
              isEs
                ? "Subir MusicXML (.xml, .musicxml)"
                : "Upload MusicXML (.xml, .musicxml)"
            }
            className="h-9 px-2.5 sm:px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Upload size={14} className="text-sky-400 shrink-0" />
            <span className="hidden sm:inline">MusicXML</span>
          </button>

          <div className="flex items-center bg-[#141722] p-1 rounded-xl border border-[#262a3b] h-10 shrink-0">
            <button
              type="button"
              onClick={() => setInstrument("piano")}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                instrument === "piano"
                  ? "bg-[#f25100]/20 text-white border border-[#f25100]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Piano size={14} className="text-[#f25100]" />
              <span>Piano</span>
            </button>
            <button
              type="button"
              disabled={!styleAllowsGuitar}
              onClick={() => {
                if (styleAllowsGuitar) setInstrument("guitar");
              }}
              title={
                styleAllowsGuitar
                  ? isEs
                    ? "Cambiar a Guitarra Acústica"
                    : "Switch to Acoustic Guitar"
                  : isEs
                  ? "Este estilo utiliza exclusivamente Teclado (Piano / Rhodes)"
                  : "This style uses Keyboard only"
              }
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                !styleAllowsGuitar
                  ? "opacity-35 cursor-not-allowed text-zinc-600"
                  : instrument === "guitar"
                  ? "bg-[#f25100]/20 text-white border border-[#f25100] cursor-pointer"
                  : "text-zinc-400 hover:text-white cursor-pointer"
              }`}
            >
              <Guitar size={14} className="text-[#f25100]" />
              <span>{isEs ? "Guitarra" : "Guitar"}</span>
            </button>
          </div>

          <LanguageSwitch />
        </div>
      </header>

      {/* =====================================================================
          2. BARRA DE TRANSPORTE HORIZONTAL
      ===================================================================== */}
      <div className="w-full bg-[#0e1017] border-b border-[#1c1f2b] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 print:hidden shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePlayTrigger}
            title={
              isEs
                ? "Reproducir / Pausar (Atajo: Barra Espaciadora)"
                : "Play / Pause (Shortcut: Spacebar)"
            }
            className="w-12 h-12 rounded-full bg-[#f25100] hover:bg-[#ff621a] text-white flex items-center justify-center shadow-[0_0_20px_rgba(242,81,0,0.5)] transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Play size={20} className="fill-current ml-0.5" />
          </button>

          <button
            type="button"
            onClick={handleStopTrigger}
            title={isEs ? "Detener" : "Stop"}
            className="w-10 h-10 rounded-full bg-[#161924] hover:bg-[#1f2433] border border-[#262a3b] text-zinc-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Square size={14} className="fill-current" />
          </button>

          <button
            type="button"
            onClick={handleRestartLoopTrigger}
            title={isEs ? "Volver al Compás 1" : "Return to Measure 1"}
            className="w-10 h-10 rounded-full bg-[#161924] hover:bg-[#1f2433] border border-[#262a3b] text-zinc-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              {isEs ? "Estilo" : "Style"}
            </span>
            <div className="relative flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-9 px-3 min-w-[165px]">
              <Music size={13} className="text-[#f25100] mr-2 shrink-0" />
              <select
                value={selectedStyleLabel}
                onChange={(e) => handleSelectStyleOption(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white appearance-none outline-none pr-5 cursor-pointer"
              >
                {renderStyleOptions()}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 text-zinc-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              {isEs ? "Veces" : "Repeats"}
            </span>
            <div className="relative flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-9 px-2.5 min-w-[82px]">
              <Repeat size={13} className="text-[#f25100] mr-1.5 shrink-0" />
              <select
                value={totalChoruses}
                onChange={(e) => {
                  const val = Number(e.target.value) || 3;
                  setTotalChoruses(val);
                  totalChorusesRef.current = val;
                }}
                className="w-full bg-transparent text-xs font-mono font-bold text-white appearance-none outline-none pr-4 cursor-pointer"
                title={
                  isEs
                    ? "Cantidad de veces (coros) que se repetirá la canción completa"
                    : "Number of times (choruses) to play the full song"
                }
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num} className="bg-[#141722]">
                    {num}x
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2 text-zinc-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              Tempo
            </span>
            <div className="flex items-center bg-[#141722] border border-[#262a3b] focus-within:border-[#f25100] rounded-xl h-9 px-2.5 gap-1.5">
              <Gauge size={13} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                value={bpmDraft}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d{1,3}$/.test(val)) {
                    setBpmDraft(val);
                  }
                }}
                onBlur={() => commitDirectBpmInput(bpmDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitDirectBpmInput(bpmDraft);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                title={
                  isEs
                    ? "Haz clic para escribir el BPM directamente (40 - 240)"
                    : "Click to type BPM directly (40 - 240)"
                }
                className="w-10 bg-transparent text-xs font-mono font-bold text-white text-center outline-none focus:text-[#f25100] cursor-text"
              />
              <div className="flex flex-col border-l border-[#262a3b] pl-1.5 -my-1">
                <button
                  type="button"
                  onClick={() => handleBpmDelta(2)}
                  className="text-[9px] text-zinc-400 hover:text-white leading-none py-0.5 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleBpmDelta(-2)}
                  className="text-[9px] text-zinc-400 hover:text-white leading-none py-0.5 cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              {isEs ? "Tonalidad" : "Key"}
            </span>
            <div className="relative flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-9 px-3 min-w-[92px]">
              <select
                value={activeKeyDropdownValue}
                onChange={(e) => handleSelectKeyFromDropdown(e.target.value)}
                className="w-full bg-transparent text-xs font-mono font-bold text-white appearance-none outline-none pr-4 cursor-pointer"
              >
                <optgroup
                  label={isEs ? "Tonalidades Mayores" : "Major Keys"}
                  className="bg-[#0c0e14] text-[#f25100] font-bold"
                >
                  {MAJOR_KEYS_LIST.map((k) => (
                    <option
                      key={`maj-${k.value}`}
                      value={k.value}
                      className="bg-[#141722] text-white font-normal"
                    >
                      {k.value}
                    </option>
                  ))}
                </optgroup>
                <optgroup
                  label={isEs ? "Tonalidades Menores" : "Minor Keys"}
                  className="bg-[#0c0e14] text-[#f25100] font-bold"
                >
                  {MINOR_KEYS_LIST.map((k) => (
                    <option
                      key={`min-${k.value}`}
                      value={k.value}
                      className="bg-[#141722] text-white font-normal"
                    >
                      {k.value}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 text-zinc-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              {isEs ? "Compás" : "Meter"}
            </span>
            <div className="relative flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-9 px-3 min-w-[84px]">
              <select
                value={currentSong.timeSignature || "4/4"}
                onChange={(e) => {
                  const newSong = {
                    ...currentSong,
                    isCustom: true,
                    timeSignature: e.target.value,
                  };
                  setAllSongs((prev) =>
                    prev.map((s) => (s.id === currentSong.id ? newSong : s))
                  );
                }}
                className="w-full bg-transparent text-xs font-mono font-bold text-white appearance-none outline-none pr-4 cursor-pointer"
              >
                <option value="4/4" className="bg-[#141722]">
                  4/4
                </option>
                <option value="3/4" className="bg-[#141722]">
                  3/4
                </option>
                <option value="6/8" className="bg-[#141722]">
                  6/8
                </option>
                <option value="12/8" className="bg-[#141722]">
                  12/8
                </option>
                <option value="2/4" className="bg-[#141722]">
                  2/4
                </option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 text-zinc-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-zinc-400 pl-1">
              {isEs ? "Transponer" : "Transpose"}
            </span>
            <div className="flex items-center bg-[#141722] border border-[#262a3b] rounded-xl h-9 px-2.5 gap-2">
              <ArrowUpDown size={13} className="text-zinc-400 shrink-0" />
              <span
                className={`text-xs font-mono font-bold min-w-[36px] text-center ${
                  transposition === 0 ? "text-white" : "text-[#f25100]"
                }`}
              >
                {transposition > 0 ? `+${transposition}` : transposition} st
              </span>
              <div className="flex flex-col border-l border-[#262a3b] pl-1.5 -my-1">
                <button
                  type="button"
                  onClick={() => handleTranspose(1)}
                  className="text-[9px] text-zinc-400 hover:text-white leading-none py-0.5 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleTranspose(-1)}
                  className="text-[9px] text-zinc-400 hover:text-white leading-none py-0.5 cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMixerModalOpen(true)}
            title={
              isEs
                ? "Abrir Mixer y Sonidos HD (Teclados, Guitarras, Bajos, Kits de Batería y Reverb Room)"
                : "Open Band Mixer & HD Sounds"
            }
            className="h-11 px-3.5 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#f25100]/50 hover:border-[#f25100] text-white flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
          >
            <Sliders size={14} className="text-[#f25100]" />
            <span className="text-[10px] font-extrabold text-[#f25100]">
              MIXER
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDirectPDF}
            className="h-11 px-3.5 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] hover:border-[#f25100] text-zinc-200 hover:text-white flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
          >
            <FileText size={14} className="text-zinc-300" />
            <span className="text-[10px] font-extrabold">PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportMidi}
            className="h-11 px-3.5 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] hover:border-[#f25100] text-zinc-200 hover:text-white flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
          >
            <Music size={14} className="text-[#f25100]" />
            <span className="text-[10px] font-extrabold">MIDI</span>
          </button>

          <button
            type="button"
            disabled={isExportingWav}
            onClick={() => handleExportWav("wav")}
            className="h-11 px-3.5 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] hover:border-[#f25100] text-zinc-200 hover:text-white flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer"
          >
            {exportingAudioFormat === "wav" ? (
              <Loader2 size={14} className="animate-spin text-[#f25100]" />
            ) : (
              <BarChart2 size={14} className="text-zinc-300" />
            )}
            <span className="text-[10px] font-extrabold">WAV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            title="Abrir centro de exportación por bloques (WAV, MP3, MIDI con Batería, PDF, .linus)"
            className="w-10 h-11 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* =====================================================================
          3. WORKSPACE PRINCIPAL
      ===================================================================== */}
      <div className="flex-1 w-full max-w-[1860px] mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-9 bg-[#0e1017] border border-[#1c1f2b] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2.5 min-w-0">
              {isEditingActive ? (
                <input
                  value={currentSong.title}
                  onChange={(e) => {
                    const newSong = {
                      ...currentSong,
                      isCustom: true,
                      title: e.target.value,
                    };
                    setAllSongs((prev) =>
                      prev.map((s) => (s.id === currentSong.id ? newSong : s))
                    );
                  }}
                  className="text-xl sm:text-2xl font-bold text-white tracking-tight bg-transparent border-b border-dashed border-[#f25100]/70 focus:border-[#f25100] outline-none"
                  placeholder="Título de la canción"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {currentSong.title}
                </h2>
              )}
              <span className="text-sm text-zinc-400 font-medium">
                · {selectedStyleLabel} ·{" "}
                <strong className="text-zinc-200">
                  {ROOT_DISPLAY_NAME_MAP[displayedKeyCenter] ||
                    displayedKeyCenter}
                  {globalIsMinor ? "m" : ""}
                </strong>
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#141722] border border-[#262a3b] text-[#f25100]">
                {isPlayingState
                  ? `${isEs ? "Vuelta" : "Chorus"} ${currentChorusNumber}/${totalChoruses}`
                  : `${totalChoruses} ${isEs ? "Veces" : "Choruses"}`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#141722] p-1 rounded-xl border border-[#262a3b]">
                <button
                  type="button"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showAnalysis
                      ? "bg-[#f25100]/20 text-[#ff7b3a] border border-[#f25100]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <BarChart2 size={13} className="text-[#f25100]" />
                  <span>{isEs ? "Análisis" : "Analysis"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowChordModal(true)}
                  className="h-8 px-3 rounded-lg text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Piano size={13} />
                  <span>{isEs ? "Acordes" : "Chords"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScalesInCells(!showScalesInCells)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    showScalesInCells
                      ? "bg-[#f25100]/20 text-[#ff7b3a] border border-[#f25100]"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  <Music size={13} />
                  <span>{isEs ? "Escalas" : "Scales"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScaleModal(true)}
                  className="h-8 px-3 rounded-lg text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LayoutGrid size={13} />
                  <span>{isEs ? "Diagramas" : "Diagrams"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* GRILLA DE COMPASES */}
          <div className="flex flex-col gap-2.5">
            {rowsOf8Measures.map((row) => (
              <div
                key={`row-8-${row.rowIndex}`}
                ref={(el) => {
                  measureRowRefs.current[row.rowIndex] = el;
                }}
                data-row-index={row.rowIndex}
                className={`flex items-stretch gap-2.5 scroll-mt-24 overflow-visible ${
                  isEditingActive &&
                  row.items.some(
                    (item) => item.globalIndex === activeDropdownMeasureIndex
                  )
                    ? "relative z-30"
                    : ""
                }`}
              >
                <div className="w-7 sm:w-8 rounded-xl bg-[#141722] border border-[#f25100] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(242,81,0,0.15)]">
                  <span className="text-sm sm:text-base font-black text-[#f25100]">
                    {row.sectionBadge}
                  </span>
                </div>

                <div className="flex-1 grid grid-cols-4 sm:grid-cols-8 bg-[#0b0d13] border border-[#1d2130] rounded-xl overflow-visible">
                  {row.items.map(({ measure, globalIndex }, colIdx) => {
                    const rawChordsList =
                      measure?.chords && measure.chords.length > 0
                        ? measure.chords
                        : [""];
                    const slotCount: 1 | 2 | 4 =
                      rawChordsList.length <= 1
                        ? 1
                        : rawChordsList.length === 2
                        ? 2
                        : 4;
                    const slots = Array.from(
                      { length: slotCount },
                      (_, i) => rawChordsList[i] ?? ""
                    );

                    const isSelectedMeasure =
                      selectedMeasureIndex === globalIndex;
                    const isDropdownOpenInMeasure =
                      isEditingActive &&
                      activeDropdownMeasureIndex === globalIndex;
                    const isPartOfVolta1Span = volta1SpanSet.has(globalIndex);
                    const hasVoltaBracket =
                      Boolean(measure.volta) || isPartOfVolta1Span;
                    const isLastMeasureOfSong =
                      globalIndex === totalMeasures - 1 ||
                      Boolean(measure.isEnd);

                    return (
                      <div
                        key={measure.id || `m-${globalIndex}`}
                        onFocusCapture={(e) => {
                          setSelectedMeasureIndex(globalIndex);
                          if (
                            isEditingActive &&
                            (e.target as HTMLElement)?.tagName === "INPUT"
                          ) {
                            setActiveDropdownMeasureIndex(globalIndex);
                          }
                        }}
                        onBlurCapture={() => {
                          setTimeout(() => {
                            setActiveDropdownMeasureIndex((prev) =>
                              prev === globalIndex ? null : prev
                            );
                          }, 190);
                        }}
                        onClick={() => {
                          setSelectedMeasureIndex(globalIndex);
                          setSelectedChordSlotIndex(0);
                          if (isEditingActive) {
                            setActiveDropdownMeasureIndex(globalIndex);
                          }
                          const targetFlatIdx =
                            measureFlatIndices[globalIndex] ?? 0;
                          syncDawPlayheadToMeasure(
                            globalIndex,
                            0,
                            targetFlatIdx
                          );
                        }}
                        className={`min-h-[104px] sm:min-h-[112px] overflow-visible ${
                          slotCount === 1
                            ? "p-2"
                            : slotCount === 2
                            ? "px-1 py-2"
                            : "px-0.5 py-2"
                        } flex flex-col justify-center items-center transition-colors cursor-pointer ${
                          colIdx < 7 ? "border-r border-[#1c202e]" : ""
                        } ${
                          isSelectedMeasure
                            ? `bg-[#f25100]/[0.09] ring-1 ring-inset ring-[#f25100]/60 ${
                                isDropdownOpenInMeasure
                                  ? "z-30 relative"
                                  : "relative z-0"
                              }`
                            : "hover:bg-[#141824]/70 relative z-0"
                        }`}
                      >
                        {measure.repeatStart && (
                          <div className="absolute left-0 top-0 bottom-0 flex items-center z-10 pointer-events-none pl-0.5">
                            <div className="w-[2.5px] h-full bg-[#f25100]" />
                            <div className="flex flex-col gap-1.5 ml-[2px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#f25100]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-[#f25100]" />
                            </div>
                          </div>
                        )}

                        {measure.repeatEnd && (
                          <div className="absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none pr-0.5">
                            <div className="flex flex-col gap-1.5 mr-[2px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#f25100]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-[#f25100]" />
                            </div>
                            <div className="w-[2.5px] h-full bg-[#f25100]" />
                          </div>
                        )}

                        {isLastMeasureOfSong && !measure.repeatEnd && (
                          <div className="absolute right-0 top-0 bottom-0 flex items-center z-10 pointer-events-none pr-0.5">
                            <div className="w-[1.5px] h-full bg-[#f25100]/80 mr-[2.5px]" />
                            <div className="w-[3px] h-full bg-[#f25100]" />
                          </div>
                        )}

                        {hasVoltaBracket && (
                          <div className="absolute top-0 left-0 right-0 h-3 pointer-events-none z-20 flex items-start">
                            <div
                              className={`w-full border-t-2 border-[#f25100] h-2.5 flex items-start ${
                                measure.volta ? "border-l" : ""
                              } ${measure.repeatEnd ? "border-r" : ""}`}
                            >
                              {measure.volta && (
                                <span className="bg-[#090a0d] text-[#f25100] font-mono font-bold text-[9px] px-1 -mt-1.5 ml-5">
                                  {measure.volta}.
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <span className="absolute top-1.5 left-2 text-[10px] font-mono text-zinc-500 select-none">
                          {globalIndex + 1}
                        </span>

                        <div
                          className={`grid w-full h-full items-center pt-2.5 ${
                            slotCount === 1
                              ? "gap-0.5"
                              : "divide-x divide-[#1c202e]/60"
                          }`}
                          style={{
                            gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))`,
                          }}
                        >
                          {slots.map((rawChord, slotIdx) => {
                            const rawChordName =
                              typeof rawChord === "string"
                                ? rawChord
                                : (rawChord as any)?.chordName ||
                                  (rawChord as any)?.name ||
                                  "";
                            const actualChordName =
                              sanitizeChordString(rawChordName);
                            const transposedChordName = transposeChordString(
                              actualChordName,
                              transposition,
                              globalKey
                            );
                            const flatIndex =
                              (measureFlatIndices[globalIndex] ?? 0) + slotIdx;

                            const isPlaying = currentPlayingIndex === flatIndex;
                            const isFocused =
                              focusedChord?.flatIndex === flatIndex;
                            const overrideKey = `${currentSong.id}-${flatIndex}`;
                            const measureAnalysis =
                              analyzedMeasures[globalIndex]?.[slotIdx];
                            const analyzeRes =
                              measureAnalysis ||
                              analyzeChord(
                                actualChordName,
                                flatIndex,
                                allRawChords,
                                globalKey + (globalIsMinor ? "m" : "")
                              );

                            const parsedOriginal = parseChord(actualChordName);
                            let analysis: AnalyzedChord = measureAnalysis || {
                              chordString: actualChordName,
                              root:
                                (analyzeRes as any).root ||
                                parsedOriginal.root,
                              type:
                                (analyzeRes as any).type ||
                                parsedOriginal.type,
                              keyContext:
                                analyzeRes.keyContext || (globalKey as any),
                              isMinorKey:
                                analyzeRes.isMinorKey || globalIsMinor,
                              romanNumeral: analyzeRes.romanNumeral,
                              category: analyzeRes.category as any,
                              color: analyzeRes.color,
                              suggestedScale: analyzeRes.suggestedScale,
                            };

                            if (customAnalyses[overrideKey]) {
                              analysis = {
                                ...analysis,
                                romanNumeral:
                                  customAnalyses[overrideKey].numeral,
                                category: customAnalyses[overrideKey]
                                  .category as AnalysisCategory,
                              };
                            }

                            let shortScaleName: string | null = null;
                            if (
                              showScalesInCells &&
                              actualChordName &&
                              actualChordName !== "%"
                            ) {
                              const p = parseChord(transposedChordName);
                              if (p.root) {
                                const prevTrans =
                                  getNthDistinctNeighborTransposedChord(
                                    flatIndex,
                                    -1,
                                    1
                                  );
                                const nextTrans =
                                  getNthDistinctNeighborTransposedChord(
                                    flatIndex,
                                    1,
                                    1
                                  );
                                const nextNextTrans =
                                  getNthDistinctNeighborTransposedChord(
                                    flatIndex,
                                    1,
                                    2
                                  );

                                const baseSc = getSuggestedScale(
                                  p.root,
                                  p.type,
                                  transposeRoot(
                                    analysis.keyContext || globalKey,
                                    transposition,
                                    globalKey
                                  ),
                                  analysis.romanNumeral,
                                  analysis.isMinorKey,
                                  prevTrans,
                                  analysis.category,
                                  nextTrans
                                );

                                const resolvedScale =
                                  resolveTransposedScaleForChord({
                                    baseScale: baseSc,
                                    romanNumeral: analysis.romanNumeral,
                                    category: analysis.category,
                                    chordString: transposedChordName,
                                    prevChordString: prevTrans,
                                    nextChordString: nextTrans,
                                    nextNextChordString: nextNextTrans,
                                  });

                                if (resolvedScale?.name) {
                                  shortScaleName = formatCompactScaleLabel(
                                    resolvedScale.name,
                                    p.root,
                                    slotCount
                                  );
                                }
                              }
                            }

                            const numeralFontClass =
                              slotCount === 1
                                ? "text-sm sm:text-base"
                                : slotCount === 2
                                ? "text-[11px] sm:text-xs"
                                : "text-[9px]";

                            const hasSlashInversion =
                              transposedChordName.includes("/") &&
                              !transposedChordName.includes("6/9");

                            const chordSlotScaleClass =
                              slotCount === 1
                                ? hasSlashInversion &&
                                  transposedChordName.length >= 7
                                  ? "w-full flex justify-center scale-[0.9] origin-center whitespace-nowrap"
                                  : "w-full flex justify-center whitespace-nowrap"
                                : slotCount === 2
                                ? hasSlashInversion &&
                                  transposedChordName.length >= 6
                                  ? "w-full flex justify-center scale-[0.76] origin-center whitespace-nowrap"
                                  : "w-full flex justify-center scale-[0.86] origin-center whitespace-nowrap"
                                : "w-full flex justify-center scale-[0.72] origin-center whitespace-nowrap";

                            return (
                              <div
                                key={`cell-${globalIndex}-${slotIdx}`}
                                onFocusCapture={() => {
                                  setSelectedMeasureIndex(globalIndex);
                                  setSelectedChordSlotIndex(slotIdx);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMeasureIndex(globalIndex);
                                  setSelectedChordSlotIndex(slotIdx);
                                  syncDawPlayheadToMeasure(
                                    globalIndex,
                                    slotIdx,
                                    flatIndex
                                  );
                                  handleChordClick(
                                    actualChordName,
                                    showAnalysis ? analysis : undefined,
                                    flatIndex
                                  );
                                }}
                                className={`flex flex-col items-center justify-center gap-1 w-full min-w-0 px-0.5 overflow-visible relative ${
                                  isDropdownOpenInMeasure &&
                                  selectedChordSlotIndex === slotIdx
                                    ? "z-30"
                                    : "z-0"
                                }`}
                              >
                                {showAnalysis &&
                                  analysis?.romanNumeral &&
                                  analysis.romanNumeral !== "-" && (
                                    <span
                                      title="Haz clic para ver la explicación armónica"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isEditingActive) {
                                          setEditingCell({
                                            key: overrideKey,
                                            flatIndex,
                                            numeral: analysis.romanNumeral,
                                            category: analysis.category,
                                            groupWithNext:
                                              !!customAnalyses[overrideKey]
                                                ?.groupWithNext,
                                          });
                                        } else {
                                          const prevTrans =
                                            getNthDistinctNeighborTransposedChord(
                                              flatIndex,
                                              -1,
                                              1
                                            );
                                          const nextTrans =
                                            getNthDistinctNeighborTransposedChord(
                                              flatIndex,
                                              1,
                                              1
                                            );
                                          const exp = buildHarmonicExplanation({
                                            chordString: transposedChordName,
                                            romanNumeral: analysis.romanNumeral,
                                            category: analysis.category,
                                            keyContext: transposeRoot(
                                              analysis.keyContext || globalKey,
                                              transposition,
                                              globalKey
                                            ),
                                            isMinorKey: Boolean(
                                              analysis.isMinorKey ??
                                                globalIsMinor
                                            ),
                                            suggestedScaleName:
                                              shortScaleName ||
                                              analysis.suggestedScale?.name,
                                            prevChordString: prevTrans,
                                            nextChordString: nextTrans,
                                          });
                                          setExplanationModalData({
                                            chordName: transposedChordName,
                                            romanNumeral: analysis.romanNumeral,
                                            explanation: exp,
                                          });
                                        }
                                      }}
                                      className={`${numeralFontClass} font-serif italic font-bold text-[#f25100] leading-none truncate max-w-full cursor-pointer hover:scale-110 hover:brightness-125 transition-transform ${
                                        isEditingActive
                                          ? "underline decoration-dotted"
                                          : ""
                                      }`}
                                    >
                                      {analysis.romanNumeral}
                                    </span>
                                  )}

                                <div
                                  className={`${chordSlotScaleClass} [&_div]:!z-30 [&_ul]:!bg-[#0b0c0e] [&_ul]:!border [&_ul]:!border-zinc-700 [&_ul]:!shadow-2xl [&_ul]:!z-40 [&_ul]:!opacity-100`}
                                >
                                  <ChordNameInput
                                    chordName={
                                      actualChordName === "%"
                                        ? "%"
                                        : transposedChordName
                                    }
                                    isEditMode={isEditingActive}
                                    isPlaying={isPlaying}
                                    isFocused={isFocused}
                                    sequenceGroupingClass=""
                                    globalKey={globalKey}
                                    onSave={(newChordName) => {
                                      setActiveDropdownMeasureIndex(null);
                                      handleUpdateChordName(
                                        globalIndex,
                                        slotIdx,
                                        newChordName
                                      );
                                    }}
                                    onClick={() => {
                                      setSelectedMeasureIndex(globalIndex);
                                      setSelectedChordSlotIndex(slotIdx);
                                      if (isEditingActive) {
                                        setActiveDropdownMeasureIndex(
                                          globalIndex
                                        );
                                      }
                                      syncDawPlayheadToMeasure(
                                        globalIndex,
                                        slotIdx,
                                        flatIndex
                                      );
                                      handleChordClick(
                                        actualChordName,
                                        showAnalysis ? analysis : undefined,
                                        flatIndex
                                      );
                                    }}
                                  />
                                </div>

                                {shortScaleName && (
                                  <span
                                    title={shortScaleName}
                                    className={`${
                                      slotCount === 1
                                        ? "text-[9px] max-w-[95px]"
                                        : slotCount === 2
                                        ? "text-[8px] max-w-[54px]"
                                        : "text-[7px] max-w-[30px]"
                                    } font-mono text-zinc-400 truncate leading-none mt-0.5 text-center`}
                                  >
                                    {shortScaleName}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================================
            COLUMNA DERECHA (3 COLUMNAS)
        =================================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-3 print:hidden">
          {isEditingActive ? (
            <>
              <div className="bg-[#0e1017] border border-[#f25100]/60 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1c1f2b] pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                    <Pencil size={13} className="text-[#f25100]" />
                    <span>
                      {isEs ? "Edición de Compás" : "Measure Editor"}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#f25100] bg-[#f25100]/10 px-2 py-0.5 rounded-md border border-[#f25100]/30">
                      Compás #{(selectedMeasureIndex ?? 0) + 1} · Slot{" "}
                      {(selectedChordSlotIndex ?? 0) + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="w-6 h-6 rounded-lg bg-[#161924] hover:bg-[#f25100] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title={
                        isEs
                          ? "Cerrar herramienta de edición"
                          : "Close editor tool"
                      }
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 bg-[#141722] border border-[#f25100] rounded-xl p-1.5 relative"
                  ref={quickChordInputRef}
                >
                  <input
                    type="text"
                    value={quickChordInput}
                    onChange={(e) => {
                      setQuickChordInput(e.target.value);
                      setIsQuickChordDropdownOpen(true);
                    }}
                    onFocus={() => setIsQuickChordDropdownOpen(true)}
                    onClick={() => setIsQuickChordDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsQuickChordDropdownOpen(false);
                        if (selectedMeasureIndex !== null) {
                          handleUpdateChordName(
                            selectedMeasureIndex,
                            selectedChordSlotIndex,
                            quickChordInput
                          );
                        }
                      }
                    }}
                    placeholder="Ej: Am7, D7, Gmaj7..."
                    className="flex-1 bg-transparent text-sm font-mono font-black text-white placeholder-zinc-500 outline-none px-2"
                  />

                  {isQuickChordDropdownOpen &&
                    quickChordSuggestions.length > 0 && (
                      <ul
                        style={{ backgroundColor: "#0b0c0e", opacity: 1 }}
                        className="absolute top-[108%] left-0 right-0 bg-[#0b0c0e] border border-zinc-700 shadow-2xl z-40 rounded-xl max-h-48 overflow-y-auto divide-y divide-[#1f2230]"
                      >
                        {quickChordSuggestions.map((suggestion) => (
                          <li
                            key={suggestion.chord}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickChordInput(suggestion.chord);
                              setIsQuickChordDropdownOpen(false);
                              if (selectedMeasureIndex !== null) {
                                handleUpdateChordName(
                                  selectedMeasureIndex,
                                  selectedChordSlotIndex,
                                  suggestion.chord
                                );
                              }
                            }}
                            className="hover:bg-[#f25100] hover:text-white px-3 py-2 cursor-pointer font-mono transition-colors text-zinc-200 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-bold">
                              {suggestion.chord}
                            </span>
                            {suggestion.label && (
                              <span className="text-[10px] opacity-80 font-sans truncate">
                                {suggestion.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickChordDropdownOpen(false);
                      if (selectedMeasureIndex !== null) {
                        handleUpdateChordName(
                          selectedMeasureIndex,
                          selectedChordSlotIndex,
                          quickChordInput
                        );
                      }
                    }}
                    className="bg-[#f25100] hover:bg-[#ff621a] text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    {isEs ? "Aplicar →" : "Apply →"}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      {isEs ? "Ritmo Armónico (Slots)" : "Harmonic Rhythm"}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          selectedMeasure?.chords?.[
                            selectedChordSlotIndex ?? 0
                          ] === "%" || selectedMeasure?.chords?.[0] === "%"
                        )}
                        onChange={(e) => {
                          if (selectedMeasureIndex !== null) {
                            const slot = selectedChordSlotIndex ?? 0;
                            const newVal = e.target.checked ? "%" : "";
                            setQuickChordInput(newVal);
                            handleUpdateChordName(
                              selectedMeasureIndex,
                              slot,
                              newVal
                            );
                          }
                        }}
                        className="w-3.5 h-3.5 rounded accent-[#f25100] cursor-pointer"
                      />
                      <span className="font-mono text-[11px]">% Repetir</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetMeasureSubdivision(1)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center ${
                        (selectedMeasure?.chords?.length || 1) <= 1
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      <span>1 Slot</span>
                      <span className="text-[9px] opacity-80">Redonda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetMeasureSubdivision(2)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center ${
                        (selectedMeasure?.chords?.length || 1) === 2
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      <span>2 Slots</span>
                      <span className="text-[9px] opacity-80">Blancas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetMeasureSubdivision(4)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center ${
                        (selectedMeasure?.chords?.length || 1) >= 3
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      <span>4 Slots</span>
                      <span className="text-[9px] opacity-80">Negras</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    {isEs ? "Barras y Casillas" : "Repeats & Voltas"}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleRepeatStart(selectedMeasureIndex ?? 0)
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        selectedMeasure?.repeatStart
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      |: Inicio
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleRepeatEnd(selectedMeasureIndex ?? 0)
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        selectedMeasure?.repeatEnd
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      Fin :|
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVolta(selectedMeasureIndex ?? 0, 1)
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        selectedMeasure?.volta === 1
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      1.
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVolta(selectedMeasureIndex ?? 0, 2)
                      }
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        selectedMeasure?.volta === 2
                          ? "bg-[#f25100] text-white"
                          : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                      }`}
                    >
                      2.
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    {isEs ? "Estructura y Compases" : "Sections & Measures"}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["A", "B", "C", "Intro", "Coda"] as const).map((sec) => {
                      const isSecActive =
                        selectedMeasure?.sectionLabel === `[${sec}]`;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleToggleSection(sec)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                            isSecActive
                              ? "bg-[#f25100] text-white"
                              : "bg-[#141722] text-zinc-300 hover:text-white border border-[#262a3b]"
                          }`}
                        >
                          {sec}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddMeasureAfter(selectedMeasureIndex ?? 0)
                      }
                      className="h-8 rounded-xl bg-[#141722] hover:bg-[#1c2030] border border-[#262a3b] text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} className="text-[#f25100]" />
                      <span>{isEs ? "Añadir Compás" : "Add Measure"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteMeasure(selectedMeasureIndex ?? 0)
                      }
                      className="h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{isEs ? "Borrar Compás" : "Delete Measure"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e1017] border border-[#1c1f2b] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Wrench size={13} className="text-[#f25100]" />
                    <span>{isEs ? "Herramientas" : "Tools"}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#f25100]">
                    {isEs ? "Modo Edición Activo" : "Edit Mode Active"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  title={isEs ? "Cerrar Modo Edición" : "Close Edit Mode"}
                  className="w-full h-9 rounded-xl bg-[#f25100] text-white border border-[#ff7433] shadow-[0_0_12px_rgba(242,81,0,0.4)] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  <Pencil size={14} />
                  <span>
                    {isEs
                      ? "Modo Edición de Compás (Activo)"
                      : "Measure Edit Mode (Active)"}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#0e1017] border border-[#1c1f2b] rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Wrench size={13} className="text-[#f25100]" />
                    <span>{isEs ? "Herramientas" : "Tools"}</span>
                  </span>
                  <ChevronRight size={14} className="text-zinc-500" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  title={
                    isEs
                      ? "Activar Modo Edición (Acordes, Slots, Casillas)"
                      : "Enable Edit Mode"
                  }
                  className="w-full h-9 rounded-xl bg-[#141722] hover:bg-[#1c2030] text-zinc-200 hover:text-white border border-[#262a3b] hover:border-[#f25100] flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Pencil size={14} className="text-[#f25100]" />
                  <span>
                    {isEs ? "Modo Edición de Compás" : "Measure Edit Mode"}
                  </span>
                </button>
              </div>

              <div className="bg-[#0e1017] border border-[#1c1f2b] rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <LayoutGrid size={13} className="text-[#f25100]" />
                    <span>{isEs ? "Estructura" : "Structure"}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    1 – {totalMeasures} {isEs ? "compases" : "bars"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["A", "B", "C"] as const).map((sec) => {
                    const currentSec =
                      extractCleanSectionBadge(
                        currentSong.measures?.[selectedMeasureIndex ?? 0]
                          ?.sectionLabel,
                        ""
                      ) === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleToggleSection(sec)}
                        className={`h-9 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          currentSec
                            ? "bg-[#f25100]/20 text-white border-[#f25100]"
                            : "bg-[#141722] text-zinc-300 hover:text-white border-[#262a3b]"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-[#EA580B]" />
                    <span>Mixer</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMixerModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-[#141722] hover:bg-[#1c2030] border border-[#EA580B]/40 hover:border-[#EA580B] text-[10px] font-bold text-[#EA580B] transition-colors cursor-pointer"
                  >
                    {isEs ? "Sonidos HD" : "HD Sounds"}
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* 1. Batería */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {isEs ? "Batería" : "Drums"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelMute("drums")}
                          title="Mute Batería"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.drumsMuted
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelSolo("drums")}
                          title="Solo Batería"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.drumsSolo
                              ? "bg-[#EA580B] text-white border-[#EA580B]"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          S
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#EA580B] w-8 text-right">
                          {mixerChannels.drumsMuted
                            ? "0%"
                            : `${mixerChannels.drumsVol}%`}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={
                        mixerChannels.drumsMuted ? 0 : mixerChannels.drumsVol
                      }
                      onInput={(e) =>
                        updateMixerChannelVol(
                          "drums",
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onChange={(e) =>
                        updateMixerChannelVol("drums", Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${
                          mixerChannels.drumsMuted ? 0 : mixerChannels.drumsVol
                        }%, #27272a ${
                          mixerChannels.drumsMuted ? 0 : mixerChannels.drumsVol
                        }%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>

                  {/* 2. Bajo */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {isEs ? "Bajo" : "Bass"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelMute("bass")}
                          title="Mute Bajo"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.bassMuted
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelSolo("bass")}
                          title="Solo Bajo"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.bassSolo
                              ? "bg-[#EA580B] text-white border-[#EA580B]"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          S
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#EA580B] w-8 text-right">
                          {mixerChannels.bassMuted
                            ? "0%"
                            : `${mixerChannels.bassVol}%`}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={
                        mixerChannels.bassMuted ? 0 : mixerChannels.bassVol
                      }
                      onInput={(e) =>
                        updateMixerChannelVol(
                          "bass",
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onChange={(e) =>
                        updateMixerChannelVol("bass", Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${
                          mixerChannels.bassMuted ? 0 : mixerChannels.bassVol
                        }%, #27272a ${
                          mixerChannels.bassMuted ? 0 : mixerChannels.bassVol
                        }%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>

                  {/* 3. Armonía (Piano / Guitarra) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {instrument === "guitar" && styleAllowsGuitar
                          ? isEs
                            ? "Guitarra"
                            : "Guitar"
                          : "Piano"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelMute("harmony")}
                          title="Mute Armonía"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.harmonyMuted
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMixerChannelSolo("harmony")}
                          title="Solo Armonía"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.harmonySolo
                              ? "bg-[#EA580B] text-white border-[#EA580B]"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          S
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#EA580B] w-8 text-right">
                          {mixerChannels.harmonyMuted
                            ? "0%"
                            : `${mixerChannels.harmonyVol}%`}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={
                        mixerChannels.harmonyMuted
                          ? 0
                          : mixerChannels.harmonyVol
                      }
                      onInput={(e) =>
                        updateMixerChannelVol(
                          "harmony",
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onChange={(e) =>
                        updateMixerChannelVol("harmony", Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${
                          mixerChannels.harmonyMuted
                            ? 0
                            : mixerChannels.harmonyVol
                        }%, #27272a ${
                          mixerChannels.harmonyMuted
                            ? 0
                            : mixerChannels.harmonyVol
                        }%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>

                  {/* 4. Melodía (Vibráfono) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {isEs ? "Melodía" : "Melody"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setMixerChannels((prev) => ({
                              ...prev,
                              melodyMuted: !prev.melodyMuted,
                            }))
                          }
                          title="Mute Melodía"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            mixerChannels.melodyMuted
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          M
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#EA580B] w-8 text-right">
                          {mixerChannels.melodyMuted
                            ? "0%"
                            : `${mixerChannels.melodyVol}%`}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={
                        mixerChannels.melodyMuted ? 0 : mixerChannels.melodyVol
                      }
                      onInput={(e) => {
                        const val = Math.max(
                          0,
                          Math.min(
                            100,
                            Math.round(
                              Number((e.target as HTMLInputElement).value)
                            )
                          )
                        );
                        setMixerChannels((prev) => ({
                          ...prev,
                          melodyVol: val,
                          ...(prev.melodyMuted && val > 0
                            ? { melodyMuted: false }
                            : {}),
                        }));
                      }}
                      onChange={(e) => {
                        const val = Math.max(
                          0,
                          Math.min(100, Math.round(Number(e.target.value)))
                        );
                        setMixerChannels((prev) => ({
                          ...prev,
                          melodyVol: val,
                          ...(prev.melodyMuted && val > 0
                            ? { melodyMuted: false }
                            : {}),
                        }));
                      }}
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${
                          mixerChannels.melodyMuted ? 0 : mixerChannels.melodyVol
                        }%, #27272a ${
                          mixerChannels.melodyMuted ? 0 : mixerChannels.melodyVol
                        }%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>

                  {/* 5. Reverb (Sala) */}
                  <div className="flex flex-col gap-1 pt-0.5 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-200">
                        Reverb
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateReverbRoomLevel(reverbRoomPct > 0 ? 0 : 38)
                          }
                          className={`px-1.5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            reverbRoomPct === 0
                              ? "bg-[#141722] text-zinc-400 border-[#262a3b]"
                              : "bg-[#EA580B] text-white border-[#EA580B]"
                          }`}
                        >
                          {reverbRoomPct === 0 ? "OFF" : "ON"}
                        </button>
                        <span className="text-[10px] font-mono font-bold text-[#EA580B] w-8 text-right">
                          {reverbRoomPct}%
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={reverbRoomPct}
                      onInput={(e) =>
                        updateReverbRoomLevel(
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onChange={(e) =>
                        updateReverbRoomLevel(Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${reverbRoomPct}%, #27272a ${reverbRoomPct}%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>

                  {/* 6. Volumen Master */}
                  <div className="flex flex-col gap-1 border-t border-neutral-800/80 pt-2.5 mt-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                        {masterMuted || masterVolPct === 0 ? (
                          <VolumeX size={13} className="text-[#EA580B]" />
                        ) : (
                          <Volume2 size={13} className="text-[#EA580B]" />
                        )}
                        <span>Master</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={toggleMasterMute}
                          title="Mute Master"
                          className={`w-5 h-5 rounded text-[9px] font-mono font-extrabold border flex items-center justify-center transition-colors cursor-pointer ${
                            masterMuted
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-[#141722] text-zinc-400 hover:text-white border-[#262a3b]"
                          }`}
                        >
                          M
                        </button>
                        <span className="text-[#EA580B] font-mono text-[11px] font-bold w-8 text-right">
                          {masterMuted ? "0%" : `${masterVolPct}%`}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={masterMuted ? 0 : masterVolPct}
                      onInput={(e) =>
                        handleMasterVolChange(
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      onChange={(e) =>
                        handleMasterVolChange(Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, #EA580B 0%, #EA580B ${
                          masterMuted ? 0 : masterVolPct
                        }%, #27272a ${
                          masterMuted ? 0 : masterVolPct
                        }%, #27272a 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 accent-[#EA580B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(234,88,11,0.6)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-orange-400"
                    />
                  </div>
                </div>
              </div>
        </div>
      </div>

      {/* =====================================================================
          MODAL LIMPIO DE CONFIRMACIÓN PARA ELIMINAR HOJA EN BLANCO
      ===================================================================== */}
      {isDeleteSongModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsDeleteSongModalOpen(false)}
        >
          <div
            className="bg-[#111217] border border-[#262a3b] rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isEs ? "Eliminar Progresión" : "Delete Progression"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isEs
                    ? `¿Deseas eliminar "${currentSong.title}"?`
                    : `Are you sure you want to delete "${currentSong.title}"?`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteSongModalOpen(false)}
                className="h-10 rounded-xl bg-[#161924] hover:bg-[#1f2433] border border-[#262a3b] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
              >
                {isEs ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentCustomSong}
                className="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-extrabold text-white cursor-pointer"
              >
                {isEs ? "Sí, Eliminar" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL CONSOLA MIXER Y SONIDOS HD DE BANDA + REVERB ROOM ACÚSTICA
      ===================================================================== */}
      {isMixerModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsMixerModalOpen(false)}
        >
          <div
            className="bg-[#111217] border border-[#262a3b] rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f2230] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f25100] text-white flex items-center justify-center font-bold shadow-[0_0_14px_rgba(242,81,0,0.4)]">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEs
                      ? "Mixer y Sonidos HD de Banda"
                      : "Live Band Mixer & HD Sounds"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isEs
                      ? "Elige el timbre HD y controla el volumen, Reverb Room, Mute y Solo"
                      : "Select HD timbre and control volume, Reverb Room, Mute & Solo"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMixerModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#161720] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {instrument === "guitar" && styleAllowsGuitar
                    ? isEs
                      ? "Guitarra Acústica HD"
                      : "HD Acoustic Guitar"
                    : isEs
                    ? "Timbre de Teclado HD"
                    : "HD Keyboard Sound"}
                </label>
                <select
                  value={selectedHarmonyPreset}
                  onChange={(e) => {
                    const val = e.target.value as HarmonyVoicePresetId;
                    setSelectedHarmonyPreset(val);
                    interactiveAnalysisAudio.setHarmonyPreset(val);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#161924] border border-[#262a3b] focus:border-[#f25100] text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {HARMONY_VOICE_PRESETS.filter((p) =>
                    instrument === "guitar" && styleAllowsGuitar
                      ? p.category === "guitar"
                      : p.category === "piano"
                  ).map((preset) => (
                    <option
                      key={preset.id}
                      value={preset.id}
                      className="bg-[#111217] text-white"
                    >
                      {isEs ? preset.labelEs : preset.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {isEs ? "Timbre de Bajo HD" : "HD Bass Sound"}
                </label>
                <select
                  value={selectedBassPreset}
                  onChange={(e) => {
                    const val = e.target.value as BassVoicePresetId;
                    setSelectedBassPreset(val);
                    interactiveAnalysisAudio.setBassPreset(val);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#161924] border border-[#262a3b] focus:border-[#f25100] text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {BASS_VOICE_PRESETS.map((preset) => (
                    <option
                      key={preset.id}
                      value={preset.id}
                      className="bg-[#111217] text-white"
                    >
                      {isEs ? preset.labelEs : preset.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {isEs
                    ? "Kit de Batería HD (Auto-ajustable por estilo)"
                    : "HD Drum Kit"}
                </label>
                <select
                  value={selectedDrumKitPreset}
                  onChange={(e) => {
                    const val = e.target.value as DrumKitPresetId;
                    setSelectedDrumKitPreset(val);
                    interactiveAnalysisAudio.setDrumKitPreset(val);
                  }}
                  className="h-9 px-3 rounded-xl bg-[#161924] border border-[#262a3b] focus:border-[#f25100] text-xs font-bold text-white outline-none cursor-pointer"
                >
                  {DRUM_KIT_PRESETS.map((kit) => (
                    <option
                      key={kit.id}
                      value={kit.id}
                      className="bg-[#111217] text-white"
                    >
                      {isEs ? kit.labelEs : kit.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {(
                [
                  {
                    id: "harmony",
                    name:
                      instrument === "piano" || !styleAllowsGuitar
                        ? isEs
                          ? "Piano / Teclado HD"
                          : "HD Keyboard"
                        : isEs
                        ? "Guitarra Acústica HD"
                        : "HD Acoustic Guitar",
                    vol: mixerChannels.harmonyVol,
                    muted: mixerChannels.harmonyMuted,
                    solo: mixerChannels.harmonySolo,
                  },
                  {
                    id: "bass",
                    name: isEs ? "Bajo / Contrabajo HD" : "HD Bass",
                    vol: mixerChannels.bassVol,
                    muted: mixerChannels.bassMuted,
                    solo: mixerChannels.bassSolo,
                  },
                  {
                    id: "drums",
                    name: isEs
                      ? `Batería (${selectedStyleLabel})`
                      : `Drums (${selectedStyleLabel})`,
                    vol: mixerChannels.drumsVol,
                    muted: mixerChannels.drumsMuted,
                    solo: mixerChannels.drumsSolo,
                  },
                ] as const
              ).map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#161924] border border-[#262a3b] rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      {ch.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleMixerChannelMute(ch.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border transition-colors cursor-pointer ${
                          ch.muted
                            ? "bg-red-500 text-white border-red-400"
                            : "bg-[#10121a] text-zinc-400 hover:text-white border-[#262a3b]"
                        }`}
                      >
                        MUTE
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleMixerChannelSolo(ch.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border transition-colors cursor-pointer ${
                          ch.solo
                            ? "bg-[#f25100] text-white border-[#ff7433]"
                            : "bg-[#10121a] text-zinc-400 hover:text-white border-[#262a3b]"
                        }`}
                      >
                        SOLO
                      </button>
                      <span className="text-xs font-mono font-bold text-[#f25100] w-10 text-right">
                        {ch.muted ? "0%" : `${ch.vol}%`}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={ch.muted ? 0 : ch.vol}
                    onInput={(e) =>
                      updateMixerChannelVol(
                        ch.id,
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                    onChange={(e) =>
                      updateMixerChannelVol(ch.id, Number(e.target.value))
                    }
                    className="w-full accent-[#f25100] h-2 cursor-pointer"
                  />
                </div>
              ))}

              {/* CANAL DE MELODÍA (VIBRÁFONO) */}
              <div className="bg-[#161924] border border-[#262a3b] rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    {isEs ? "Melodía (Vibráfono)" : "Melody (Vibraphone)"}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMixerChannels((prev) => ({
                          ...prev,
                          melodyMuted: !prev.melodyMuted,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold border transition-colors cursor-pointer ${
                        mixerChannels.melodyMuted
                          ? "bg-red-500 text-white border-red-400"
                          : "bg-[#10121a] text-zinc-400 hover:text-white border-[#262a3b]"
                      }`}
                    >
                      MUTE
                    </button>
                    <span className="text-xs font-mono font-bold text-[#f25100] w-10 text-right">
                      {mixerChannels.melodyMuted
                        ? "0%"
                        : `${mixerChannels.melodyVol}%`}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={
                    mixerChannels.melodyMuted ? 0 : mixerChannels.melodyVol
                  }
                  onInput={(e) => {
                    const val = Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(Number((e.target as HTMLInputElement).value))
                      )
                    );
                    setMixerChannels((prev) => ({
                      ...prev,
                      melodyVol: val,
                      ...(prev.melodyMuted && val > 0
                        ? { melodyMuted: false }
                        : {}),
                    }));
                  }}
                  onChange={(e) => {
                    const val = Math.max(
                      0,
                      Math.min(100, Math.round(Number(e.target.value)))
                    );
                    setMixerChannels((prev) => ({
                      ...prev,
                      melodyVol: val,
                      ...(prev.melodyMuted && val > 0
                        ? { melodyMuted: false }
                        : {}),
                    }));
                  }}
                  className="w-full accent-[#f25100] h-2 cursor-pointer"
                />
              </div>

              <div className="bg-[#161924] border border-[#f25100]/40 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#f25100]" />
                    <span>
                      {isEs
                        ? "Reverb Room (Sala Acústica)"
                        : "Studio Room Reverb"}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateReverbRoomLevel(reverbRoomPct > 0 ? 0 : 38)
                      }
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold border transition-colors cursor-pointer ${
                        reverbRoomPct === 0
                          ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                          : "bg-[#f25100]/20 text-[#f25100] border-[#f25100]/50"
                      }`}
                    >
                      {reverbRoomPct === 0 ? "OFF" : "ON"}
                    </button>
                    <span className="text-xs font-mono font-bold text-[#f25100] w-10 text-right">
                      {reverbRoomPct}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={reverbRoomPct}
                  onInput={(e) =>
                    updateReverbRoomLevel(
                      Number((e.target as HTMLInputElement).value)
                    )
                  }
                  onChange={(e) =>
                    updateReverbRoomLevel(Number(e.target.value))
                  }
                  className="w-full accent-[#f25100] h-2 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMixerModalOpen(false)}
              className="w-full h-10 rounded-xl bg-[#f25100] hover:bg-[#ff621a] text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              {isEs ? "Listo" : "Done"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL NUEVA HOJA EN BLANCO
      ===================================================================== */}
      {isNewSheetModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsNewSheetModalOpen(false)}
        >
          <div
            className="bg-[#111217] border border-[#262a3b] rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f2230] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f25100] text-white flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEs ? "Nueva Hoja en Blanco" : "New Blank Sheet"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isEs
                      ? "Elige cuántos compases quieres componer o enseñar"
                      : "Choose how many measures to compose or teach"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSheetModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#161720] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {isEs ? "Título de la Progresión" : "Progression Title"}
              </label>
              <input
                type="text"
                value={newSheetTitle}
                onChange={(e) => setNewSheetTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#161720] border border-[#262a3b] focus:border-[#f25100] text-sm font-bold text-white outline-none"
                placeholder="Ej: Ejercicio II-V-I, Blues en Fa..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-300">
                {isEs ? "Cantidad de Compases" : "Number of Measures"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 4, label: "4 Compases" },
                  { count: 8, label: "8 Compases" },
                  { count: 12, label: "12 (Blues)" },
                  { count: 16, label: "16 Compases" },
                  { count: 24, label: "24 Compases" },
                  { count: 32, label: "32 (Estándar)" },
                ].map((opt) => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setNewSheetMeasuresCount(opt.count)}
                    className={`py-2 px-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                      newSheetMeasuresCount === opt.count
                        ? "bg-[#f25100] text-white border-[#ff7433]"
                        : "bg-[#161722] text-zinc-300 hover:text-white border-[#262a3b]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">
                {isEs ? "Estilo Musical" : "Musical Style"}
              </label>
              <select
                value={newSheetStyle}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewSheetStyle(val);
                  if (val === "Vals Criollo") {
                    setNewSheetTimeSig("3/4");
                  }
                }}
                className="h-10 px-3 rounded-xl bg-[#161720] border border-[#262a3b] text-sm font-bold text-white outline-none cursor-pointer"
              >
                {STYLE_CATEGORIES_CATALOG.map((cat) => (
                  <optgroup
                    key={`new-st-${cat.groupEs}`}
                    label={isEs ? cat.groupEs : cat.groupEn}
                    className="bg-[#0c0e14] text-[#f25100] font-bold"
                  >
                    {cat.styles.map((st) => (
                      <option
                        key={st.value}
                        value={st.value}
                        className="bg-[#161720] text-white font-normal"
                      >
                        {isEs ? st.labelEs : st.labelEn}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  {isEs ? "Tonalidad (Mayor / Menor)" : "Key (Major / Minor)"}
                </label>
                <select
                  value={newSheetKey}
                  onChange={(e) => setNewSheetKey(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[#161720] border border-[#262a3b] text-sm font-mono font-bold text-white outline-none cursor-pointer"
                >
                  <optgroup
                    label={isEs ? "Mayores" : "Major Keys"}
                    className="bg-[#0c0e14] text-[#f25100] font-bold"
                  >
                    {MAJOR_KEYS_LIST.map((k) => (
                      <option
                        key={`new-maj-${k.value}`}
                        value={k.value}
                        className="bg-[#161720] text-white font-normal"
                      >
                        {isEs ? k.labelEs : k.labelEn}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup
                    label={isEs ? "Menores" : "Minor Keys"}
                    className="bg-[#0c0e14] text-[#f25100] font-bold"
                  >
                    {MINOR_KEYS_LIST.map((k) => (
                      <option
                        key={`new-min-${k.value}`}
                        value={k.value}
                        className="bg-[#161720] text-white font-normal"
                      >
                        {isEs ? k.labelEs : k.labelEn}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  {isEs ? "Compás (Métrica)" : "Time Signature"}
                </label>
                <select
                  value={newSheetTimeSig}
                  onChange={(e) => setNewSheetTimeSig(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-[#161720] border border-[#262a3b] text-sm font-mono font-bold text-white outline-none cursor-pointer"
                >
                  <option value="4/4">4/4</option>
                  <option value="3/4">3/4</option>
                  <option value="6/8">6/8</option>
                  <option value="12/8">12/8</option>
                  <option value="2/4">2/4</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmCreateNewSheet}
              className="w-full h-11 mt-1 rounded-xl bg-[#f25100] hover:bg-[#ff621a] text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_0_18px_rgba(242,81,0,0.4)] transition-colors cursor-pointer"
            >
              {isEs
                ? `Crear Hoja de ${newSheetMeasuresCount} Compases`
                : `Create ${newSheetMeasuresCount}-Bar Sheet`}
            </button>
          </div>
        </div>
      )}

      {/* POPOVER PARA EDITAR GRADOS ROMANOS */}
      {isEditingActive && editingCell && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingCell(null)}
        >
          <div
            className="bg-[#111217] border border-[#252736] rounded-2xl p-4 w-72 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#1f2230] pb-2">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Pencil size={14} className="text-[#f25100]" />
                <span>Editar Grado Armónico</span>
              </h3>
              <button
                onClick={() => setEditingCell(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold mb-1 block">
                  Grado Romano
                </label>
                <input
                  type="text"
                  value={editingCell.numeral}
                  onChange={(e) =>
                    setEditingCell({ ...editingCell, numeral: e.target.value })
                  }
                  className="w-full bg-[#090a0d] border border-[#252736] rounded-lg p-2 text-sm text-white focus:border-[#f25100] outline-none"
                  placeholder="Ej: ii, V7, V7/vi"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setCustomAnalyses((prev) => ({
                  ...prev,
                  [editingCell.key]: {
                    numeral: editingCell.numeral,
                    category: editingCell.category,
                    groupWithNext: editingCell.groupWithNext,
                  },
                }));
                setEditingCell(null);
              }}
              className="w-full bg-[#f25100] hover:bg-[#ff621a] text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Save size={14} />
              <span>Guardar Grado</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL DE EXPORTACIÓN Y GESTIÓN DE PROYECTO (DISEÑO POR BLOQUES LIMPIOS)
      ===================================================================== */}
      {isExportModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
          onClick={() => setIsExportModalOpen(false)}
        >
          <div
            className="bg-[#111217] border border-[#262a3b] rounded-2xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1f2230]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f25100]/15 border border-[#f25100]/40 flex items-center justify-center text-[#f25100] shadow-[0_0_15px_rgba(242,81,0,0.25)]">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {isEs
                      ? "Centro de Exportación & Estudio"
                      : "Export & Studio Center"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentSong.title} · {selectedStyleLabel} ·{" "}
                    {currentSong.tempo} BPM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#161720] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* BLOQUE 1: AUDIO MASTER & PRODUCCIÓN DAW (MIDI MULTIPISTA CON BATERÍA) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f25100]">
                  {isEs
                    ? "1. Audio Master & Secuencia DAW (Con Batería)"
                    : "1. Master Audio & DAW MIDI (With Drums)"}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {isEs ? "Mezcla fiel al Mixer en vivo" : "True-to-Mixer Output"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={isExportingWav}
                  onClick={() => handleExportWav("wav")}
                  className="flex flex-col justify-between p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-amber-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      {exportingAudioFormat === "wav" ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <BarChart2 size={17} />
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                      .WAV
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      Audio Master
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      PCM 16-bit sin compresión
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isExportingWav}
                  onClick={() => handleExportWav("mp3")}
                  className="flex flex-col justify-between p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-purple-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      {exportingAudioFormat === "mp3" ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Volume2 size={17} />
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                      .MP3
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      Pista de Práctica
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      MP3 ligero (192 kbps)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportMidi}
                  className="flex flex-col justify-between p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-[#f25100] text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#f25100]/15 border border-[#f25100]/40 flex items-center justify-center text-[#f25100]">
                      <Music size={17} />
                    </div>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#f25100]/20 text-[#ff8547]">
                      .MID
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white group-hover:text-[#ff8547] transition-colors">
                      MIDI Multipista
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                      Comping + Walking Bass + Batería GM
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* BLOQUE 2: PARTITURA & IMPRESIÓN */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400">
                {isEs
                  ? "2. Partitura & Documentación Musical"
                  : "2. Sheet Music & Lead Sheet"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadDirectPDF}
                  className="w-full flex items-center justify-between gap-3.5 p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-sky-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <FileText size={19} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors">
                        Descargar Partitura Lead Sheet (.PDF)
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        Diseño profesional estilo Real Book listo para imprimir o compartir
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 shrink-0">
                    PDF A4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMusicXml}
                  className="w-full flex items-center justify-between gap-3.5 p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-sky-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <FileText size={19} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors">
                        Exportar Partitura Editable (.XML)
                      </span>
                      <span className="text-xs text-zinc-400 truncate">
                        Archivo MusicXML 3.1 con acordes y melodía (Finale, MuseScore, Sibelius)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 shrink-0">
                    .XML
                  </span>
                </button>
              </div>
            </div>

            {/* BLOQUE 3: GESTIÓN DE PROYECTO EDITABLE (.LINUS) */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                {isEs
                  ? "3. Proyecto Editable de Sesión (.LINUS)"
                  : "3. Editable Project Session (.LINUS)"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(false);
                    handleExportSession();
                    triggerExportToast(
                      "Sesión (.linus) guardada correctamente."
                    );
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-emerald-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Save size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                      Guardar Proyecto (.LINUS)
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Respalda tu canción en tu equipo
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(false);
                    handleTriggerFileInput();
                  }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-[#262a3b] hover:border-amber-400/70 text-left transition-all cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <FolderOpen size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      Abrir / Cargar (.LINUS)
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Restaura una sesión guardada
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISUALIZADOR DE ACORDE */}
      {showChordModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowChordModal(false)}
        >
          <div
            className="bg-[#111217] border border-[#252736] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f2230] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f25100] text-white flex items-center justify-center font-bold">
                  <Piano size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Visualizador de Acorde
                    {effectiveChordDetails && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#f25100] text-white font-mono font-bold">
                        {effectiveChordString}
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowChordModal(false)}
                className="w-8 h-8 rounded-lg bg-[#161720] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-full flex flex-col items-center justify-center py-1">
              {effectiveChordDetails ? (
                instrument === "piano" ? (
                  <ChordPianoKeyboard
                    root={effectiveChordDetails.root}
                    type={effectiveChordDetails.type}
                    voicing={effectiveChordDetails.voicing}
                    title={effectiveChordDetails.suffix}
                    subtitle={`Acorde: ${effectiveChordString}`}
                  />
                ) : (
                  <ChordFretboard
                    root={effectiveChordDetails.root}
                    type={effectiveChordDetails.type}
                    voicing={effectiveChordDetails.voicing}
                    title={effectiveChordDetails.suffix}
                    subtitle={`Acorde: ${effectiveChordString}`}
                  />
                )
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISUALIZADOR DE ESCALA */}
      {showScaleModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowScaleModal(false)}
        >
          <div
            className="bg-[#111217] border border-[#252736] rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f2230] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f25100] text-white flex items-center justify-center font-bold">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Escala Recomendada
                    {effectiveChordDetails?.suggestedScale && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#161720] border border-[#f25100]/50 text-[#f25100] font-mono font-bold">
                        {effectiveChordDetails.suggestedScale.name}
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowScaleModal(false)}
                className="w-8 h-8 rounded-lg bg-[#161720] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-full flex flex-col items-center justify-center py-1">
              {effectiveChordDetails?.suggestedScale ? (
                instrument === "piano" ? (
                  <ScalePianoKeyboard
                    scaleName={effectiveChordDetails.suggestedScale.name}
                    notes={effectiveChordDetails.suggestedScale.notes}
                    root={effectiveChordDetails.root}
                    chordString={effectiveChordString}
                  />
                ) : (
                  <ScaleFretboard
                    scaleName={effectiveChordDetails.suggestedScale.name}
                    notes={effectiveChordDetails.suggestedScale.notes}
                    root={effectiveChordDetails.root}
                    chordString={effectiveChordString}
                  />
                )
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Toast de Exportación */}
      {exportToastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-[#111217] border border-[#f25100] text-white px-4 py-3 rounded-xl shadow-2xl print:hidden">
          <div className="w-2 h-2 rounded-full bg-[#f25100] animate-pulse shrink-0" />
          <span className="text-xs font-bold">{exportToastMessage}</span>
          <button
            type="button"
            onClick={() => setExportToastMessage(null)}
            className="text-zinc-400 hover:text-white ml-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MODAL POP-UP DE EXPLICACIÓN ARMÓNICA */}
      {explanationModalData !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setExplanationModalData(null)}
        >
          <div
            className="bg-[#111217] border border-[#262a3b] rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#1f2230] pb-3.5">
              <div className="flex flex-col gap-1.5">
                <span
                  className={`inline-flex items-center self-start text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${explanationModalData.explanation.badgeColorClass}`}
                >
                  {explanationModalData.explanation.badgeEs}
                </span>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <h3 className="text-lg font-extrabold text-white leading-snug">
                    {explanationModalData.explanation.titleEs}
                  </h3>
                  <span className="text-sm font-mono font-black px-2 py-0.5 rounded-lg bg-[#161924] border border-[#f25100]/40 text-[#f25100]">
                    {explanationModalData.chordName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExplanationModalData(null)}
                className="w-8 h-8 rounded-lg bg-[#161924] hover:bg-[#1f2433] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#161924] border border-[#f25100]/30 rounded-xl px-3.5 py-2.5">
              <span className="text-xs font-mono font-bold text-[#ff8547] block">
                {explanationModalData.explanation.formulaOrConcept}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-zinc-300">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Función Armónica
                </span>
                <p>{explanationModalData.explanation.summaryEs}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Resolución y Movimiento
                </span>
                <p>{explanationModalData.explanation.resolutionEs}</p>
              </div>

              <div className="flex flex-col gap-1 bg-[#141722] border border-[#262a3b] rounded-xl p-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f25100]">
                  Consejo de Improvisación
                </span>
                <p className="text-zinc-200">
                  {explanationModalData.explanation.improvisationTipEs}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1f2230]">
              <button
                type="button"
                onClick={() => playChord(explanationModalData.chordName)}
                className="h-9 px-3.5 rounded-xl bg-[#f25100] hover:bg-[#ff621a] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 size={14} />
                <span>Escuchar Acorde</span>
              </button>
              <button
                type="button"
                onClick={() => setExplanationModalData(null)}
                className="h-9 px-3.5 rounded-xl bg-[#161924] hover:bg-[#1f2433] border border-[#262a3b] text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept=".linus,.json,.html,.htm,.xml,.musicxml"
        onChange={handleFileChange}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
        className="hidden"
      />
    </div>
  );
}