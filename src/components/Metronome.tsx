import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { stopAllPlayback } from "../utils/audio";
import { ImportedNote, MelodyNote, MelodyInstrument } from "../types";
import { generateWalkingBass, generateComping } from "../utils/band";
import {
  getChordNotes,
  parseChord,
  isMinorQuality,
  buildJazzVoicing,
} from "../utils/music";
import {
  Play,
  Square,
  Plus,
  Minus,
  Volume2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useInstrument } from "../contexts/InstrumentContext";
import { preloadAcousticDrums } from "../utils/acousticDrums";
import { preloadAcousticInstruments } from "../utils/acousticInstruments";
import { loadSoundfontInstrument } from "../utils/soundfont";
import {
  interactiveAnalysisAudio,
  DrumSampleName,
  detectDrumKitFromStyle,
} from "../utils/interactiveAnalysisAudio";
import {
  DrumStyle,
  detectDrumStyleFromSongStyle,
  getDrumMatrixForBeat,
  getBeatsPerBar,
  getStyleBaseGainMultiplier,
} from "../utils/interactiveRhythmPatterns";
import InteractiveMixer from "./InteractiveMixer";

export type TimeSignature =
  | "4/4"
  | "3/4"
  | "6/8"
  | "12/8"
  | "2/4"
  | "5/4"
  | "7/8";
export type { DrumStyle };

export type { MelodyInstrument, MelodyNote };

const VIBRAPHONE_SAMPLER_CONFIG = {
  baseUrl:
    "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/vibraphone-mp3/",
  urls: {
    C4: "C4.mp3",
    E4: "E4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    E5: "E5.mp3",
    A5: "A5.mp3",
  },
  release: 0.85,
};

let vibraphoneSamplerInstance: Tone.Sampler | null = null;
let vibraphoneSamplerLoaded = false;
let melodyFallbackSynth: Tone.PolySynth<Tone.FMSynth> | null = null;
let melodyMasterGainNode: Tone.Gain | null = null;
let globalMelodyVolumeState = 1.0;
let globalMelodyMutedState = false;

function getMelodyMasterGain(): Tone.Gain {
  if (!melodyMasterGainNode) {
    const initialGain = globalMelodyMutedState ? 0 : globalMelodyVolumeState * 3.0;
    melodyMasterGainNode = new Tone.Gain(initialGain).toDestination();
  }
  return melodyMasterGainNode;
}

export function setLeadMelodyVolume(vol: number): void {
  globalMelodyVolumeState = Math.max(0, Math.min(2.0, vol));
  const gainNode = getMelodyMasterGain();
  gainNode.gain.value = globalMelodyMutedState ? 0 : globalMelodyVolumeState * 3.0;
}

export function setLeadMelodyMuted(muted: boolean): void {
  globalMelodyMutedState = Boolean(muted);
  const gainNode = getMelodyMasterGain();
  gainNode.gain.value = globalMelodyMutedState ? 0 : globalMelodyVolumeState * 3.0;
  if (globalMelodyMutedState) {
    releaseAllLeadMelodyNotes();
  }
}

function getMelodyFallbackSynth(): Tone.PolySynth<Tone.FMSynth> {
  if (!melodyFallbackSynth) {
    melodyFallbackSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 4,
      modulationIndex: 2.2,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.004,
        decay: 0.9,
        sustain: 0.18,
        release: 0.9,
      },
      modulation: { type: "sine" },
      modulationEnvelope: {
        attack: 0.004,
        decay: 0.35,
        sustain: 0.1,
        release: 0.5,
      },
      volume: 2,
    }).connect(getMelodyMasterGain());
  }
  return melodyFallbackSynth;
}

export function preloadMelodyInstrumentSampler(
  _inst: MelodyInstrument = "vibraphone"
): Tone.Sampler {
  if (vibraphoneSamplerInstance) return vibraphoneSamplerInstance;

  const sampler = new Tone.Sampler({
    urls: VIBRAPHONE_SAMPLER_CONFIG.urls,
    baseUrl: VIBRAPHONE_SAMPLER_CONFIG.baseUrl,
    release: VIBRAPHONE_SAMPLER_CONFIG.release,
    volume: 4,
    onload: () => {
      vibraphoneSamplerLoaded = true;
    },
  }).connect(getMelodyMasterGain());

  vibraphoneSamplerInstance = sampler;
  return sampler;
}

export function triggerLeadMelodyNote(
  _inst: MelodyInstrument,
  noteName: string,
  durationSec: number,
  attackAudioCtxTime: number,
  velocity: number = 0.92
): void {
  try {
    if (globalMelodyMutedState) return;
    const iaa: any = interactiveAnalysisAudio;
    if (typeof iaa.isMelodyMuted === "function" && iaa.isMelodyMuted()) {
      return;
    }
    if (typeof iaa.getMelodyVolume === "function") {
      const mixerVol = iaa.getMelodyVolume();
      if (typeof mixerVol === "number" && !isNaN(mixerVol)) {
        setLeadMelodyVolume(mixerVol);
      }
    }

    const sampler = preloadMelodyInstrumentSampler("vibraphone");
    const sharedCtx = interactiveAnalysisAudio.getAudioContext();
    const nowCtx = sharedCtx ? sharedCtx.currentTime : Tone.now();
    const deltaSec = Math.max(0, attackAudioCtxTime - nowCtx);
    const toneAttackTime = Tone.now() + deltaSec;
    const safeDur = Math.max(0.1, Math.min(3.2, durationSec));
    const safeVel = Math.max(0.15, Math.min(1.0, velocity));

    if (vibraphoneSamplerLoaded && sampler.loaded) {
      sampler.triggerAttackRelease(noteName, safeDur, toneAttackTime, safeVel);
    } else {
      const fb = getMelodyFallbackSynth();
      fb.triggerAttackRelease(noteName, safeDur, toneAttackTime, safeVel);
    }
  } catch (_) {}
}

export function releaseAllLeadMelodyNotes(): void {
  try {
    if (vibraphoneSamplerInstance && vibraphoneSamplerInstance.loaded) {
      vibraphoneSamplerInstance.releaseAll();
    }
    if (melodyFallbackSynth) {
      melodyFallbackSynth.releaseAll();
    }
  } catch (_) {}
}

export interface PlaybackChord {
  globalChordIndex: number;
  frequencies: number[];
  beatsLength: number;
  chordString: string;
  globalKey: string;
  parsedRoot: string;
  parsedType: string;
  originalString?: string;
  isSimile?: boolean;
  isEndMarker?: boolean;
  isEndOfPlayback?: boolean;
  originalFlatIndex?: number;
  measureIndex?: number;
  section?: string;
  isEndOfSection?: boolean;
  melody?: MelodyNote[];
  transposition?: number;
}

export interface MetronomeControls {
  start: () => Promise<void>;
  stop: () => void;
  togglePlayback: () => void;
  isPlaying: () => boolean;
}

interface MetronomeProps {
  initialBPM?: number;
  inline?: boolean;
  playbackSequence?: PlaybackChord[];
  getPlaybackSequence?: () => PlaybackChord[];
  songStyle?: string;
  onPlayingIndexChange?: (index: number | null) => void;
  onIsPlayingChange?: (isPlaying: boolean) => void;
  onCycleComplete?: () => void;
  metronomeControlRef?: React.MutableRefObject<MetronomeControls | null>;
  importedMelody?: ImportedNote[];
  timeSignature?: string;
  onTimeSignatureChange?: (sig: TimeSignature) => void;
  drumStyle?: DrumStyle;
  onDrumStyleChange?: (style: DrumStyle) => void;
  selectedMeasureIndex?: number | null;
  isVisible?: boolean;
  dawTracks?: any[];
  updateTrackVolume?: (trackId: string, volume: number) => void;
  toggleTrackMute?: (trackId: string) => void;
  toggleTrackSolo?: (trackId: string) => void;
  updateTrackPan?: (trackId: string, pan: number) => void;
  onUpdateTrackInstrument?: (trackId: string, instrumentId: string) => void;
  totalChoruses?: number;
  currentChorusRef?: React.MutableRefObject<number>;
  melodyInstrument?: MelodyInstrument;
  melodyVolume?: number;
  melodyMuted?: boolean;
  transposition?: number;
}

const ROOT_SEMITONE_MAP: Record<string, number> = {
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

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getChordTriadIntervals(chordString: string): {
  rootSemitone: number;
  thirdSemitones: number;
  fifthSemitones: number;
} {
  const fullStr = String(chordString || "C").trim();
  const parsedFull = parseChord(fullStr);
  const cleanStr = fullStr
    .replace(/6\/9/g, "6(9)")
    .split("/")[0]
    .trim();
  const parsed = parseChord(cleanStr);
  const rootMatch = cleanStr.match(/^[A-G][#b]?/);
  const rootName = parsed.root || (rootMatch ? rootMatch[0] : "C");
  const effectiveBassNote = parsedFull.bassNote || rootName;
  const rootSemitone = ROOT_SEMITONE_MAP[effectiveBassNote] ?? 0;

  const rawSuffix = cleanStr.slice(rootName.length).trim();
  const lowerSuffix = rawSuffix.toLowerCase();
  const parsedType = String(parsed.type || "").toLowerCase();

  const isDiminished =
    lowerSuffix.startsWith("dim") ||
    lowerSuffix.startsWith("dis") ||
    lowerSuffix.startsWith("°") ||
    lowerSuffix.startsWith("o") ||
    lowerSuffix.includes("ø") ||
    lowerSuffix.includes("m7b5") ||
    lowerSuffix.includes("-7b5") ||
    parsedType.includes("dim") ||
    parsedType.includes("m7b5") ||
    parsedType.includes("half-dim");

  if (isDiminished) {
    const fifth = lowerSuffix.startsWith("dis") ? 5 : 6;
    return {
      rootSemitone,
      thirdSemitones: 3,
      fifthSemitones: fifth,
    };
  }

  const isExplicitlyMajorOrDom =
    rawSuffix === "" ||
    lowerSuffix.startsWith("maj") ||
    lowerSuffix.startsWith("M") ||
    lowerSuffix.startsWith("Δ") ||
    lowerSuffix.startsWith("dom") ||
    /^(6|7|9|11|13|add)/.test(lowerSuffix);

  if (isExplicitlyMajorOrDom) {
    const hasFlatFive = /b5|-5/.test(lowerSuffix);
    const hasSharpFive = /#5|\+|aug/.test(lowerSuffix);
    return {
      rootSemitone,
      thirdSemitones: 4,
      fifthSemitones: hasFlatFive ? 6 : hasSharpFive ? 8 : 7,
    };
  }

  const isMinor =
    lowerSuffix.startsWith("m") ||
    lowerSuffix.startsWith("-") ||
    isMinorQuality(parsed.type);

  if (isMinor) {
    return {
      rootSemitone,
      thirdSemitones: 3,
      fifthSemitones: 7,
    };
  }

  return {
    rootSemitone,
    thirdSemitones: 4,
    fifthSemitones: 7,
  };
}

function buildReggaetonBassPattern(
  chordString: string,
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number
): { midi: number; timeOffset: number; durationBeats: number }[] {
  const { rootSemitone, thirdSemitones, fifthSemitones } =
    getChordTriadIntervals(chordString);

  let rootMidi = 36 + rootSemitone;
  if (rootMidi > 43) rootMidi -= 12;

  const thirdMidi = rootMidi + thirdSemitones;
  const fifthMidi = rootMidi + fifthSemitones;

  const measureIndex = Math.floor(
    globalBeatCount / Math.max(1, beatsPerMeasure)
  );
  const isVariationBar = measureIndex % 2 === 1;

  if (chordBeatsLength >= 4) {
    if (!isVariationBar) {
      return [
        { midi: rootMidi, timeOffset: 0, durationBeats: 1.9 },
        { midi: thirdMidi, timeOffset: 2, durationBeats: 0.92 },
        { midi: fifthMidi, timeOffset: 3, durationBeats: 0.92 },
      ];
    } else {
      return [
        { midi: rootMidi, timeOffset: 0, durationBeats: 0.92 },
        { midi: rootMidi, timeOffset: 1, durationBeats: 0.92 },
        { midi: thirdMidi, timeOffset: 2, durationBeats: 0.92 },
        { midi: fifthMidi, timeOffset: 3, durationBeats: 0.92 },
      ];
    }
  } else if (chordBeatsLength >= 2) {
    return [
      { midi: rootMidi, timeOffset: 0, durationBeats: 0.92 },
      { midi: thirdMidi, timeOffset: 1, durationBeats: 0.92 },
    ];
  } else {
    return [{ midi: rootMidi, timeOffset: 0, durationBeats: 0.9 }];
  }
}

function buildValsBassPattern(
  chordString: string,
  chordBeatsLength: number
): { midi: number; timeOffset: number; durationBeats: number }[] {
  const { rootSemitone, thirdSemitones, fifthSemitones } =
    getChordTriadIntervals(chordString);

  let rootMidi = 36 + rootSemitone;
  if (rootMidi > 43) rootMidi -= 12;

  const thirdMidi = rootMidi + thirdSemitones;
  const fifthMidi = rootMidi + fifthSemitones;

  if (chordBeatsLength >= 3) {
    return [
      { midi: rootMidi, timeOffset: 0, durationBeats: 0.9 },
      { midi: fifthMidi, timeOffset: 1, durationBeats: 0.85 },
      { midi: thirdMidi, timeOffset: 2, durationBeats: 0.85 },
    ];
  } else if (chordBeatsLength >= 2) {
    return [
      { midi: rootMidi, timeOffset: 0, durationBeats: 0.9 },
      { midi: fifthMidi, timeOffset: 1, durationBeats: 0.85 },
    ];
  }
  return [{ midi: rootMidi, timeOffset: 0, durationBeats: 0.85 }];
}

function buildBossaAndSambaBassPattern(
  chordString: string,
  chordBeatsLength: number,
  nextChordString?: string | null,
  isBossaStyle: boolean = true
): {
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity?: number;
}[] {
  const { rootSemitone, fifthSemitones } = getChordTriadIntervals(chordString);

  let rootMidi = 36 + rootSemitone;
  if (rootMidi > 43) rootMidi -= 12;

  const fifthMidi = rootMidi + fifthSemitones;

  let approachMidi = isBossaStyle ? fifthMidi : rootMidi;
  if (isBossaStyle && nextChordString && nextChordString.trim() !== "") {
    const nextTriad = getChordTriadIntervals(nextChordString);
    if (nextTriad.rootSemitone !== rootSemitone) {
      let nextRootMidi = 36 + nextTriad.rootSemitone;
      if (nextRootMidi > 43) nextRootMidi -= 12;
      approachMidi =
        fifthMidi > nextRootMidi ? nextRootMidi + 1 : nextRootMidi - 1;
    }
  }

  if (chordBeatsLength >= 4) {
    return [
      {
        midi: rootMidi,
        timeOffset: 0.0,
        durationBeats: 1.42,
        velocity: 0.88,
      },
      {
        midi: fifthMidi,
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.7,
      },
      {
        midi: fifthMidi,
        timeOffset: 2.0,
        durationBeats: 1.42,
        velocity: 0.84,
      },
      {
        midi: approachMidi,
        timeOffset: 3.5,
        durationBeats: 0.45,
        velocity: 0.74,
      },
    ];
  } else if (chordBeatsLength >= 2) {
    return [
      {
        midi: rootMidi,
        timeOffset: 0.0,
        durationBeats: 1.42,
        velocity: 0.88,
      },
      {
        midi: approachMidi,
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.74,
      },
    ];
  }
  return [
    { midi: rootMidi, timeOffset: 0.0, durationBeats: 0.9, velocity: 0.85 },
  ];
}

function buildHipHopBassPattern(
  chordString: string,
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number
): { midi: number; timeOffset: number; durationBeats: number }[] {
  const { rootSemitone, thirdSemitones, fifthSemitones } =
    getChordTriadIntervals(chordString);

  let rootMidi = 36 + rootSemitone;
  if (rootMidi > 43) rootMidi -= 12;

  const thirdMidi = rootMidi + thirdSemitones;
  const fifthMidi = rootMidi + fifthSemitones;
  const measureIndex = Math.floor(
    globalBeatCount / Math.max(1, beatsPerMeasure)
  );
  const isVariation = measureIndex % 2 === 1;

  if (chordBeatsLength >= 4) {
    if (!isVariation) {
      return [
        { midi: rootMidi, timeOffset: 0.0, durationBeats: 1.35 },
        { midi: rootMidi, timeOffset: 1.5, durationBeats: 1.2 },
        { midi: fifthMidi, timeOffset: 3.0, durationBeats: 0.9 },
      ];
    } else {
      return [
        { midi: rootMidi, timeOffset: 0.0, durationBeats: 1.35 },
        { midi: rootMidi, timeOffset: 1.5, durationBeats: 0.9 },
        { midi: thirdMidi, timeOffset: 2.5, durationBeats: 0.45 },
        { midi: fifthMidi, timeOffset: 3.0, durationBeats: 0.9 },
      ];
    }
  } else if (chordBeatsLength >= 2) {
    return [
      { midi: rootMidi, timeOffset: 0.0, durationBeats: 1.3 },
      { midi: fifthMidi, timeOffset: 1.5, durationBeats: 0.45 },
    ];
  }
  return [{ midi: rootMidi, timeOffset: 0.0, durationBeats: 0.9 }];
}

export interface GuitarCompHit {
  freqs: number[];
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}

function splitGuitarThumbAndFingers(
  freqs: number[],
  chordString: string
): {
  rootThumbFreq: number;
  fifthThumbFreq: number;
  upperFreqs: number[];
} {
  const { rootSemitone, fifthSemitones } = getChordTriadIntervals(chordString);

  let rootGuitarMidi = 48 + rootSemitone;
  if (rootGuitarMidi > 52) rootGuitarMidi -= 12;
  if (rootGuitarMidi < 40) rootGuitarMidi += 12;

  let fifthGuitarMidi = rootGuitarMidi + fifthSemitones;
  if (fifthGuitarMidi > 55) fifthGuitarMidi -= 12;

  const sorted = [...freqs]
    .filter((f) => f > 0 && !isNaN(f))
    .map((f) => {
      let val = f;
      while (val < 195) val *= 2;
      while (val > 780) val /= 2;
      return val;
    })
    .sort((a, b) => a - b);

  const upperFreqs =
    sorted.length >= 4
      ? sorted.slice(1, 4)
      : sorted.length >= 2
      ? sorted.slice(-3)
      : sorted;

  return {
    rootThumbFreq: midiToFreq(rootGuitarMidi),
    fifthThumbFreq: midiToFreq(fifthGuitarMidi),
    upperFreqs: upperFreqs.length > 0 ? upperFreqs : sorted,
  };
}

function buildJazzGuitarQuarterComping(
  freqs: number[],
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const hits: GuitarCompHit[] = [];

  const totalBeats = Math.max(
    1,
    Math.round(chordBeatsLength || beatsPerMeasure)
  );

  for (let b = 0; b < totalBeats; b++) {
    const beatInBar = (globalBeatCount + b) % Math.max(1, beatsPerMeasure);
    const isBackbeat = beatInBar === 1 || beatInBar === 3;

    hits.push({
      freqs,
      timeOffset: b,
      durationBeats: 0.42,
      velocity: isBackbeat ? 0.68 : 0.6,
    });
  }

  return hits;
}

function getPianoVoicingFreqs(freqs: number[], chordString: string): number[] {
  const midiNotesFromFreqs = (freqs || []).map((f) =>
    Math.round(69 + 12 * Math.log2(Math.max(20, f) / 440))
  );
  let pianoMidis = midiNotesFromFreqs.filter((m) => m >= 50);

  if (pianoMidis.length < 3 && chordString) {
    const rawVoicing = buildJazzVoicing(chordString);
    pianoMidis = rawVoicing.filter((m) => m >= 50);
    if (pianoMidis.length < 3) {
      const fallback = getChordNotes(chordString, 48);
      pianoMidis = (fallback.length >= 3 ? fallback : rawVoicing).map((m) => {
        let shifted = m;
        while (shifted < 51) shifted += 12;
        while (shifted > 76) shifted -= 12;
        return shifted;
      });
    }
  }

  const uniqueSorted = Array.from(new Set(pianoMidis)).sort((a, b) => a - b);
  return uniqueSorted.map((m) => 440 * Math.pow(2, (m - 69) / 12));
}

function buildBossaNovaKeyboardComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number,
  _isSectionB: boolean = false
): GuitarCompHit[] {
  const upperFreqs = getPianoVoicingFreqs(freqs, chordString);
  if (upperFreqs.length === 0) return [];
  const totalBeats = Math.max(
    1,
    Math.round(chordBeatsLength || beatsPerMeasure)
  );
  const measureIdx = Math.floor(
    globalBeatCount / Math.max(1, beatsPerMeasure)
  );
  const isOddMeasure = measureIdx % 2 === 0;

  if (totalBeats >= 4) {
    if (isOddMeasure) {
      return [
        {
          freqs: upperFreqs,
          timeOffset: 0.0,
          durationBeats: 1.2,
          velocity: 0.76,
        },
        {
          freqs: upperFreqs,
          timeOffset: 1.5,
          durationBeats: 1.2,
          velocity: 0.82,
        },
        {
          freqs: upperFreqs,
          timeOffset: 3.5,
          durationBeats: 0.85,
          velocity: 0.72,
        },
      ];
    } else {
      return [
        {
          freqs: upperFreqs,
          timeOffset: 1.0,
          durationBeats: 1.2,
          velocity: 0.78,
        },
        {
          freqs: upperFreqs,
          timeOffset: 2.5,
          durationBeats: 1.1,
          velocity: 0.75,
        },
      ];
    }
  } else if (totalBeats >= 2) {
    return [
      {
        freqs: upperFreqs,
        timeOffset: 0.0,
        durationBeats: 1.15,
        velocity: 0.78,
      },
      {
        freqs: upperFreqs,
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.72,
      },
    ];
  }

  return [
    {
      freqs: upperFreqs,
      timeOffset: 0.0,
      durationBeats: 0.85,
      velocity: 0.75,
    },
  ];
}

/**
 * COMPING DE PIANO JAZZ SWING (4 Variaciones de frase extraídas del MIDI de iReal Pro)
 */
function buildJazzSwingKeyboardComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  measureIdx: number,
  isRhythm2Chorus: boolean
): GuitarCompHit[] {
  const voicingFreqs = getPianoVoicingFreqs(freqs, chordString);
  if (voicingFreqs.length === 0) return [];
  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 4));
  const barInPhrase = ((measureIdx % 4) + 4) % 4;
  const velBoost = isRhythm2Chorus ? 0.04 : 0.0;

  if (totalBeats >= 4) {
    if (barInPhrase === 0) {
      // Variación 1 (iReal Pro Bar 1): Charleston clásico (Beat 1 corto + "a" del 2 tenido)
      return [
        {
          freqs: voicingFreqs,
          timeOffset: 0.0,
          durationBeats: 0.7,
          velocity: Math.min(0.9, 0.72 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 1.667,
          durationBeats: 1.25,
          velocity: Math.min(0.92, 0.78 + velBoost),
        },
      ];
    } else if (barInPhrase === 1) {
      // Variación 2 (iReal Pro Bar 2): Espacio en el 1, entra en el 2 + "a" del 3 + anticipación opcional en "a" del 4
      const hits: GuitarCompHit[] = [
        {
          freqs: voicingFreqs,
          timeOffset: 1.0,
          durationBeats: 0.55,
          velocity: Math.min(0.88, 0.7 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 2.667,
          durationBeats: 0.85,
          velocity: Math.min(0.9, 0.76 + velBoost),
        },
      ];
      if (isRhythm2Chorus) {
        hits.push({
          freqs: voicingFreqs,
          timeOffset: 3.667,
          durationBeats: 0.45,
          velocity: 0.72,
        });
      }
      return hits;
    } else if (barInPhrase === 2) {
      // Variación 3 (iReal Pro Bar 3): Síncopa en el "a" del 1 (0.667) y el "a" del 3 (2.667)
      return [
        {
          freqs: voicingFreqs,
          timeOffset: 0.667,
          durationBeats: 1.1,
          velocity: Math.min(0.9, 0.75 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 2.667,
          durationBeats: 1.05,
          velocity: Math.min(0.92, 0.78 + velBoost),
        },
      ];
    } else {
      // Variación 4 (iReal Pro Bar 4): Acorde tenido en el 1 + doble ataque swing en el 3 y "a" del 3
      return [
        {
          freqs: voicingFreqs,
          timeOffset: 0.0,
          durationBeats: 1.2,
          velocity: Math.min(0.9, 0.74 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 2.0,
          durationBeats: 0.55,
          velocity: Math.min(0.88, 0.72 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 2.667,
          durationBeats: 0.95,
          velocity: Math.min(0.92, 0.8 + velBoost),
        },
      ];
    }
  } else if (totalBeats >= 2) {
    if (barInPhrase % 2 === 0) {
      return [
        {
          freqs: voicingFreqs,
          timeOffset: 0.0,
          durationBeats: 0.65,
          velocity: Math.min(0.9, 0.74 + velBoost),
        },
        {
          freqs: voicingFreqs,
          timeOffset: 1.667,
          durationBeats: 0.45,
          velocity: Math.min(0.9, 0.78 + velBoost),
        },
      ];
    } else {
      return [
        {
          freqs: voicingFreqs,
          timeOffset: 0.0,
          durationBeats: 1.15,
          velocity: Math.min(0.9, 0.76 + velBoost),
        },
      ];
    }
  }

  return [
    {
      freqs: voicingFreqs,
      timeOffset: 0.0,
      durationBeats: 0.75,
      velocity: 0.76,
    },
  ];
}

function buildJazzSwingWalkingBass(
  chordString: string,
  chordBeatsLength: number,
  nextChordString: string | null | undefined,
  measureIdx: number,
  isRhythm2Chorus: boolean,
  beatInMeasure: number = 0
): {
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const { rootSemitone, thirdSemitones, fifthSemitones } =
    getChordTriadIntervals(chordString);

  let T = 36 + rootSemitone;
  if (T > 43) T -= 12;

  const third = T + thirdSemitones;
  const fifth = T + fifthSemitones;

  let nextRootMidi = T;
  if (nextChordString && nextChordString.trim() !== "") {
    const nextTriad = getChordTriadIntervals(nextChordString);
    nextRootMidi = 36 + nextTriad.rootSemitone;
    if (nextRootMidi > 43) nextRootMidi -= 12;
  }

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
  const isOddMeasure = measureIdx % 2 === 0;
  const isSecondHalfOfMeasure = beatInMeasure >= 2;

  if (useTwoFeel) {
    if (chordBeatsLength >= 4) {
      if (measureIdx % 2 === 1) {
        return [
          {
            midi: T,
            timeOffset: 0.0,
            durationBeats: 1.85,
            velocity: 0.88,
          },
          {
            midi: fifth,
            timeOffset: 2.0,
            durationBeats: 0.92,
            velocity: 0.84,
          },
          {
            midi: C_to_Next,
            timeOffset: 3.0,
            durationBeats: 0.92,
            velocity: 0.78,
          },
        ];
      }
      return [
        {
          midi: T,
          timeOffset: 0.0,
          durationBeats: 1.85,
          velocity: 0.88,
        },
        {
          midi: fifth,
          timeOffset: 2.0,
          durationBeats: 1.85,
          velocity: 0.84,
        },
      ];
    } else if (chordBeatsLength >= 2) {
      if (!isSecondHalfOfMeasure) {
        if (isOddMeasure) {
          return [
            {
              midi: T,
              timeOffset: 0.0,
              durationBeats: 0.92,
              velocity: 0.88,
            },
            {
              midi: C_to_Next,
              timeOffset: 1.0,
              durationBeats: 0.92,
              velocity: 0.78,
            },
          ];
        }
        return [
          {
            midi: T,
            timeOffset: 0.0,
            durationBeats: 1.85,
            velocity: 0.88,
          },
        ];
      } else {
        return [
          {
            midi: T,
            timeOffset: 0.0,
            durationBeats: 0.92,
            velocity: 0.86,
          },
          {
            midi: isOddMeasure ? fifth : C_to_Next,
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
        timeOffset: 0.0,
        durationBeats: 0.92,
        velocity: 0.86,
      },
    ];
  }

  if (chordBeatsLength >= 4) {
    const formulaIdx = measureIdx % 3;
    const beat2Note =
      formulaIdx === 0 ? third : formulaIdx === 1 ? C_to_5 : C_neighbor_T;
    const beat3Note = formulaIdx === 2 ? T : fifth;

    return [
      {
        midi: T,
        timeOffset: 0.0,
        durationBeats: 0.92,
        velocity: 0.9,
      },
      {
        midi: beat2Note,
        timeOffset: 1.0,
        durationBeats: 0.92,
        velocity: 0.85,
      },
      {
        midi: beat3Note,
        timeOffset: 2.0,
        durationBeats: 0.92,
        velocity: 0.88,
      },
      {
        midi: C_to_Next,
        timeOffset: 3.0,
        durationBeats: 0.92,
        velocity: 0.84,
      },
    ];
  } else if (chordBeatsLength >= 2) {
    if (!isSecondHalfOfMeasure) {
      return [
        {
          midi: T,
          timeOffset: 0.0,
          durationBeats: 0.92,
          velocity: 0.9,
        },
        {
          midi: isOddMeasure ? C_to_Next : fifth,
          timeOffset: 1.0,
          durationBeats: 0.92,
          velocity: 0.84,
        },
      ];
    } else {
      return [
        {
          midi: T,
          timeOffset: 0.0,
          durationBeats: 0.92,
          velocity: 0.88,
        },
        {
          midi: C_to_Next,
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
      timeOffset: 0.0,
      durationBeats: 0.92,
      velocity: 0.88,
    },
  ];
}

function buildBossaNovaGuitarComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const hits: GuitarCompHit[] = [];
  const { rootThumbFreq, fifthThumbFreq, upperFreqs } =
    splitGuitarThumbAndFingers(freqs, chordString);

  const totalBeats = Math.max(
    1,
    Math.round(chordBeatsLength || beatsPerMeasure)
  );
  const measureIdx = Math.floor(
    globalBeatCount / Math.max(1, beatsPerMeasure)
  );
  const isOddMeasure = measureIdx % 2 === 0;

  if (totalBeats >= 4) {
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 0.0,
      durationBeats: 1.42,
      velocity: 0.64,
    });
    hits.push({
      freqs: [fifthThumbFreq],
      timeOffset: 1.5,
      durationBeats: 0.45,
      velocity: 0.56,
    });
    hits.push({
      freqs: [fifthThumbFreq],
      timeOffset: 2.0,
      durationBeats: 1.42,
      velocity: 0.62,
    });
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 3.5,
      durationBeats: 0.45,
      velocity: 0.56,
    });

    if (isOddMeasure) {
      hits.push(
        {
          freqs: upperFreqs,
          timeOffset: 0.0,
          durationBeats: 1.2,
          velocity: 0.76,
        },
        {
          freqs: upperFreqs,
          timeOffset: 1.5,
          durationBeats: 1.2,
          velocity: 0.82,
        },
        {
          freqs: upperFreqs,
          timeOffset: 3.5,
          durationBeats: 0.85,
          velocity: 0.72,
        }
      );
    } else {
      hits.push(
        {
          freqs: upperFreqs,
          timeOffset: 1.0,
          durationBeats: 1.2,
          velocity: 0.78,
        },
        {
          freqs: upperFreqs,
          timeOffset: 2.5,
          durationBeats: 1.1,
          velocity: 0.75,
        }
      );
    }
  } else if (totalBeats >= 2) {
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 0.0,
      durationBeats: 1.42,
      velocity: 0.64,
    });
    hits.push({
      freqs: [fifthThumbFreq],
      timeOffset: 1.5,
      durationBeats: 0.45,
      velocity: 0.58,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.0,
      durationBeats: 1.15,
      velocity: 0.78,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.5,
      durationBeats: 0.45,
      velocity: 0.72,
    });
  } else {
    hits.push({
      freqs,
      timeOffset: 0.0,
      durationBeats: 0.7,
      velocity: 0.62,
    });
  }

  return hits;
}

function buildBoleroGuitarComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const hits: GuitarCompHit[] = [];
  const { rootThumbFreq, fifthThumbFreq, upperFreqs } =
    splitGuitarThumbAndFingers(freqs, chordString);

  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 4));

  if (totalBeats >= 4) {
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 0.0,
      durationBeats: 0.9,
      velocity: 0.68,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.5,
      durationBeats: 0.4,
      velocity: 0.58,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.0,
      durationBeats: 0.4,
      velocity: 0.64,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.5,
      durationBeats: 0.4,
      velocity: 0.6,
    });
    hits.push({
      freqs: [fifthThumbFreq],
      timeOffset: 2.0,
      durationBeats: 0.85,
      velocity: 0.64,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 2.5,
      durationBeats: 0.4,
      velocity: 0.6,
    });
    hits.push({
      freqs: [fifthThumbFreq],
      timeOffset: 3.0,
      durationBeats: 0.85,
      velocity: 0.62,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 3.5,
      durationBeats: 0.4,
      velocity: 0.62,
    });
  } else if (totalBeats >= 2) {
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 0.0,
      durationBeats: 0.85,
      velocity: 0.66,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.5,
      durationBeats: 0.4,
      velocity: 0.58,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.0,
      durationBeats: 0.4,
      velocity: 0.63,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.5,
      durationBeats: 0.4,
      velocity: 0.59,
    });
  } else {
    hits.push({
      freqs: [rootThumbFreq],
      timeOffset: 0.0,
      durationBeats: 0.45,
      velocity: 0.65,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.5,
      durationBeats: 0.4,
      velocity: 0.6,
    });
  }

  return hits;
}

function buildValsCriolloComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  includeThumbBass: boolean = true
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const hits: GuitarCompHit[] = [];
  const { rootThumbFreq, upperFreqs } = splitGuitarThumbAndFingers(
    freqs,
    chordString
  );

  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 3));

  if (totalBeats >= 3) {
    if (includeThumbBass) {
      hits.push({
        freqs: [rootThumbFreq],
        timeOffset: 0.0,
        durationBeats: 0.9,
        velocity: 0.68,
      });
    }
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.0,
      durationBeats: 0.38,
      velocity: includeThumbBass ? 0.64 : 0.74,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 2.0,
      durationBeats: 0.4,
      velocity: includeThumbBass ? 0.62 : 0.72,
    });
  } else if (totalBeats === 2) {
    if (includeThumbBass) {
      hits.push({
        freqs: [rootThumbFreq],
        timeOffset: 0.0,
        durationBeats: 0.85,
        velocity: 0.68,
      });
    }
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.0,
      durationBeats: 0.4,
      velocity: includeThumbBass ? 0.64 : 0.74,
    });
  } else {
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.0,
      durationBeats: 0.4,
      velocity: 0.68,
    });
  }

  return hits;
}

function buildSambaComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  globalBeatCount: number,
  beatsPerMeasure: number,
  includeThumbBass: boolean = true
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const hits: GuitarCompHit[] = [];
  const { rootThumbFreq, fifthThumbFreq, upperFreqs } =
    splitGuitarThumbAndFingers(freqs, chordString);

  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 4));
  const measureNumber = Math.floor(
    globalBeatCount / Math.max(1, beatsPerMeasure)
  );
  const isSecondBar = measureNumber % 2 === 1;

  if (totalBeats >= 4) {
    if (includeThumbBass) {
      hits.push({
        freqs: [rootThumbFreq],
        timeOffset: 0.0,
        durationBeats: 1.4,
        velocity: 0.62,
      });
      hits.push({
        freqs: [fifthThumbFreq],
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.56,
      });
      hits.push({
        freqs: [fifthThumbFreq],
        timeOffset: 2.0,
        durationBeats: 1.4,
        velocity: 0.6,
      });
      hits.push({
        freqs: [rootThumbFreq],
        timeOffset: 3.5,
        durationBeats: 0.45,
        velocity: 0.56,
      });
    }

    const sambaPlucks = !isSecondBar
      ? [
          { offset: 0.0, dur: 0.65, vel: includeThumbBass ? 0.62 : 0.74 },
          { offset: 1.0, dur: 0.4, vel: includeThumbBass ? 0.58 : 0.68 },
          { offset: 1.5, dur: 0.8, vel: includeThumbBass ? 0.65 : 0.76 },
          { offset: 2.5, dur: 0.8, vel: includeThumbBass ? 0.64 : 0.74 },
          { offset: 3.5, dur: 0.45, vel: includeThumbBass ? 0.6 : 0.7 },
        ]
      : [
          { offset: 0.5, dur: 0.8, vel: includeThumbBass ? 0.64 : 0.75 },
          { offset: 1.5, dur: 0.45, vel: includeThumbBass ? 0.6 : 0.7 },
          { offset: 2.0, dur: 0.65, vel: includeThumbBass ? 0.58 : 0.7 },
          { offset: 3.0, dur: 0.75, vel: includeThumbBass ? 0.63 : 0.74 },
        ];

    sambaPlucks.forEach((p) => {
      hits.push({
        freqs: upperFreqs,
        timeOffset: p.offset,
        durationBeats: p.dur,
        velocity: p.vel,
      });
    });
  } else if (totalBeats >= 2) {
    if (includeThumbBass) {
      hits.push({
        freqs: [rootThumbFreq],
        timeOffset: 0.0,
        durationBeats: 1.4,
        velocity: 0.62,
      });
      hits.push({
        freqs: [fifthThumbFreq],
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.56,
      });
    }
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.0,
      durationBeats: 0.45,
      velocity: includeThumbBass ? 0.62 : 0.74,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.5,
      durationBeats: 0.45,
      velocity: includeThumbBass ? 0.65 : 0.76,
    });
    hits.push({
      freqs: upperFreqs,
      timeOffset: 1.5,
      durationBeats: 0.45,
      velocity: includeThumbBass ? 0.62 : 0.72,
    });
  } else {
    hits.push({
      freqs: upperFreqs,
      timeOffset: 0.0,
      durationBeats: 0.45,
      velocity: 0.7,
    });
  }

  return hits;
}

function buildHipHopKeyboardComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number
): GuitarCompHit[] {
  if (!freqs || freqs.length === 0) return [];
  const { upperFreqs } = splitGuitarThumbAndFingers(freqs, chordString);
  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 4));

  if (totalBeats >= 4) {
    return [
      {
        freqs: upperFreqs,
        timeOffset: 0.0,
        durationBeats: 1.35,
        velocity: 0.78,
      },
      {
        freqs: upperFreqs,
        timeOffset: 1.5,
        durationBeats: 1.25,
        velocity: 0.72,
      },
      {
        freqs: upperFreqs,
        timeOffset: 3.0,
        durationBeats: 0.85,
        velocity: 0.68,
      },
    ];
  } else if (totalBeats >= 2) {
    return [
      {
        freqs: upperFreqs,
        timeOffset: 0.0,
        durationBeats: 1.3,
        velocity: 0.78,
      },
      {
        freqs: upperFreqs,
        timeOffset: 1.5,
        durationBeats: 0.45,
        velocity: 0.7,
      },
    ];
  }
  return [
    { freqs: upperFreqs, timeOffset: 0.0, durationBeats: 0.85, velocity: 0.76 },
  ];
}

function buildFunkKeyboardComping(
  freqs: number[],
  chordString: string,
  chordBeatsLength: number,
  measureIdx: number
): GuitarCompHit[] {
  const voicingFreqs = getPianoVoicingFreqs(freqs, chordString);
  if (voicingFreqs.length === 0) return [];
  const totalBeats = Math.max(1, Math.round(chordBeatsLength || 4));
  const barInPhrase = ((measureIdx % 4) + 4) % 4;

  if (totalBeats >= 4) {
    if (barInPhrase === 0) {
      return [
        { freqs: voicingFreqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
        { freqs: voicingFreqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.74 },
        { freqs: voicingFreqs, timeOffset: 1.5, durationBeats: 0.65, velocity: 0.85 },
        { freqs: voicingFreqs, timeOffset: 3.25, durationBeats: 0.45, velocity: 0.78 },
      ];
    } else if (barInPhrase === 1) {
      return [
        { freqs: voicingFreqs, timeOffset: 0.5, durationBeats: 0.35, velocity: 0.78 },
        { freqs: voicingFreqs, timeOffset: 1.75, durationBeats: 0.45, velocity: 0.84 },
        { freqs: voicingFreqs, timeOffset: 2.5, durationBeats: 0.45, velocity: 0.80 },
        { freqs: voicingFreqs, timeOffset: 3.5, durationBeats: 0.35, velocity: 0.76 },
      ];
    } else if (barInPhrase === 2) {
      return [
        { freqs: voicingFreqs, timeOffset: 0.0, durationBeats: 0.40, velocity: 0.82 },
        { freqs: voicingFreqs, timeOffset: 1.25, durationBeats: 0.28, velocity: 0.75 },
        { freqs: voicingFreqs, timeOffset: 1.75, durationBeats: 0.50, velocity: 0.84 },
        { freqs: voicingFreqs, timeOffset: 3.0, durationBeats: 0.60, velocity: 0.80 },
      ];
    } else {
      return [
        { freqs: voicingFreqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
        { freqs: voicingFreqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.76 },
        { freqs: voicingFreqs, timeOffset: 2.0, durationBeats: 0.45, velocity: 0.80 },
        { freqs: voicingFreqs, timeOffset: 3.25, durationBeats: 0.25, velocity: 0.82 },
        { freqs: voicingFreqs, timeOffset: 3.75, durationBeats: 0.25, velocity: 0.85 },
      ];
    }
  } else if (totalBeats >= 2) {
    return [
      { freqs: voicingFreqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.82 },
      { freqs: voicingFreqs, timeOffset: 0.75, durationBeats: 0.25, velocity: 0.75 },
      { freqs: voicingFreqs, timeOffset: 1.5, durationBeats: 0.35, velocity: 0.80 },
    ];
  }

  return [
    { freqs: voicingFreqs, timeOffset: 0.0, durationBeats: 0.35, velocity: 0.80 },
  ];
}

function buildFunkBassPattern(
  chordString: string,
  chordBeatsLength: number,
  nextChordString: string | null | undefined,
  measureIdx: number,
  isRhythm2Chorus: boolean = false
): {
  midi: number;
  timeOffset: number;
  durationBeats: number;
  velocity: number;
}[] {
  const { rootSemitone, thirdSemitones } = getChordTriadIntervals(chordString);
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
    const nextTriad = getChordTriadIntervals(nextChordString);
    nextRootMidi = 36 + nextTriad.rootSemitone;
    if (nextRootMidi > 43) nextRootMidi -= 12;
  }
  const chromNext = nextRootMidi - 1;
  const barInPhrase = ((measureIdx % 4) + 4) % 4;
  const velBoost = isRhythm2Chorus ? 0.04 : 0.0;

  if (chordBeatsLength >= 4) {
    if (barInPhrase === 0) {
      const hits = [
        { midi: R, timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: octave, timeOffset: 0.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: seventh, timeOffset: 1.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: R, timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.86 + velBoost) },
        { midi: fifth, timeOffset: 2.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.75 + velBoost) },
        { midi: fifth, timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.76 + velBoost) },
        { midi: chromNext, timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: R, timeOffset: 1.25, durationBeats: 0.20, velocity: 0.68 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else if (barInPhrase === 1) {
      const hits = [
        { midi: R, timeOffset: 0.0, durationBeats: 0.42, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: R, timeOffset: 0.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.74 + velBoost) },
        { midi: fifth, timeOffset: 1.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: octave, timeOffset: 1.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.84 + velBoost) },
        { midi: third, timeOffset: 2.5, durationBeats: 0.45, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: chromNext, timeOffset: 3.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: seventh, timeOffset: 3.25, durationBeats: 0.20, velocity: 0.72 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else if (barInPhrase === 2) {
      const hits = [
        { midi: R, timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: fifth, timeOffset: 0.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.76 + velBoost) },
        { midi: R, timeOffset: 1.25, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
        { midi: fifth, timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.84 + velBoost) },
        { midi: seventh, timeOffset: 2.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: octave, timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: chromNext, timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: octave, timeOffset: 1.75, durationBeats: 0.20, velocity: 0.70 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    } else {
      const hits = [
        { midi: R, timeOffset: 0.0, durationBeats: 0.60, velocity: Math.min(0.98, 0.92 + velBoost) },
        { midi: fifth, timeOffset: 1.5, durationBeats: 0.42, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: octave, timeOffset: 2.0, durationBeats: 0.42, velocity: Math.min(0.95, 0.85 + velBoost) },
        { midi: third, timeOffset: 3.0, durationBeats: 0.22, velocity: Math.min(0.95, 0.78 + velBoost) },
        { midi: fifth, timeOffset: 3.25, durationBeats: 0.22, velocity: Math.min(0.95, 0.80 + velBoost) },
        { midi: seventh, timeOffset: 3.5, durationBeats: 0.22, velocity: Math.min(0.95, 0.82 + velBoost) },
        { midi: chromNext, timeOffset: 3.75, durationBeats: 0.22, velocity: Math.min(0.95, 0.86 + velBoost) },
      ];
      if (isRhythm2Chorus) {
        hits.push({ midi: octave, timeOffset: 0.75, durationBeats: 0.22, velocity: 0.76 });
        hits.sort((a, b) => a.timeOffset - b.timeOffset);
      }
      return hits;
    }
  } else if (chordBeatsLength >= 2) {
    return [
      { midi: R, timeOffset: 0.0, durationBeats: 0.45, velocity: 0.90 },
      { midi: octave, timeOffset: 0.75, durationBeats: 0.22, velocity: 0.80 },
      { midi: fifth, timeOffset: 1.5, durationBeats: 0.22, velocity: 0.78 },
      { midi: chromNext, timeOffset: 1.75, durationBeats: 0.22, velocity: 0.82 },
    ];
  }

  return [
    { midi: R, timeOffset: 0.0, durationBeats: 0.45, velocity: 0.88 },
  ];
}

export default function Metronome({
  initialBPM = 120,
  inline = false,
  playbackSequence,
  getPlaybackSequence,
  songStyle,
  onPlayingIndexChange,
  onIsPlayingChange,
  onCycleComplete,
  metronomeControlRef,
  importedMelody,
  timeSignature: propTimeSignature,
  onTimeSignatureChange,
  drumStyle: propDrumStyle,
  onDrumStyleChange,
  selectedMeasureIndex,
  isVisible = true,
  dawTracks,
  updateTrackVolume,
  toggleTrackMute,
  toggleTrackSolo,
  updateTrackPan,
  onUpdateTrackInstrument,
  totalChoruses = 3,
  currentChorusRef: externalChorusRef,
  melodyInstrument = "vibraphone",
  melodyVolume = 1.0,
  melodyMuted = false,
  transposition = 0,
}: MetronomeProps) {
  const { t } = useLanguage();
  const { instrument: globalInstrument } = useInstrument();
  const [bpm, setBpm] = useState(initialBPM);
  const [localBpm, setLocalBpm] = useState<number>(initialBPM);
  const [localBpmInput, setLocalBpmInput] = useState<string>(
    String(initialBPM)
  );
  const localBpmRef = useRef<number>(initialBPM);
  const bpmRef = useRef(initialBPM);
  const selectedMeasureIndexRef = useRef<number>(selectedMeasureIndex ?? 0);
  const isVisibleRef = useRef<boolean>(isVisible);
  const totalChorusesLocalRef = useRef<number>(totalChoruses ?? 3);
  const melodyInstrumentRef = useRef<MelodyInstrument>(melodyInstrument);
  const melodyVolumeRef = useRef<number>(melodyVolume);
  const melodyMutedRef = useRef<boolean>(melodyMuted);
  const transpositionRef = useRef<number>(transposition);

  useEffect(() => {
    melodyInstrumentRef.current = "vibraphone";
    preloadMelodyInstrumentSampler("vibraphone");
  }, [melodyInstrument]);

  useEffect(() => {
    melodyVolumeRef.current = melodyVolume;
    setLeadMelodyVolume(melodyVolume);
  }, [melodyVolume]);

  useEffect(() => {
    melodyMutedRef.current = melodyMuted;
    setLeadMelodyMuted(melodyMuted);
  }, [melodyMuted]);

  useEffect(() => {
    const handleMelodyVolEvent = (e: any) => {
      if (typeof e?.detail === "number") {
        melodyVolumeRef.current = e.detail;
        setLeadMelodyVolume(e.detail);
      } else if (typeof e?.detail?.volume === "number") {
        melodyVolumeRef.current = e.detail.volume;
        setLeadMelodyVolume(e.detail.volume);
      }
    };
    const handleMelodyMuteEvent = (e: any) => {
      const muted =
        typeof e?.detail === "boolean" ? e.detail : Boolean(e?.detail?.muted);
      melodyMutedRef.current = muted;
      setLeadMelodyMuted(muted);
    };
    window.addEventListener("melody-volume-changed", handleMelodyVolEvent);
    window.addEventListener("melody-mute-changed", handleMelodyMuteEvent);
    return () => {
      window.removeEventListener("melody-volume-changed", handleMelodyVolEvent);
      window.removeEventListener("melody-mute-changed", handleMelodyMuteEvent);
    };
  }, []);

  useEffect(() => {
    transpositionRef.current = transposition;
  }, [transposition]);

  useEffect(() => {
    totalChorusesLocalRef.current = Math.max(1, totalChoruses ?? 3);
  }, [totalChoruses]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (typeof selectedMeasureIndex === "number" && selectedMeasureIndex >= 0) {
      selectedMeasureIndexRef.current = selectedMeasureIndex;
    } else {
      selectedMeasureIndexRef.current = 0;
    }
  }, [selectedMeasureIndex]);

  const isEditingBpmRef = useRef(false);
  const stepDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stepDebounceTimerRef.current) {
        clearTimeout(stepDebounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialBPM && initialBPM !== bpmRef.current) {
      bpmRef.current = initialBPM;
      localBpmRef.current = initialBPM;
      setBpm(initialBPM);
      setLocalBpm(initialBPM);
      setLocalBpmInput(String(initialBPM));
      try {
        Tone.Transport.bpm.value = initialBPM;
      } catch {}
    }
  }, [initialBPM]);

  const [timeSignature, setTimeSignature] = useState<TimeSignature>(() => {
    if (propTimeSignature) {
      return propTimeSignature as TimeSignature;
    }
    return "4/4";
  });
  const [drumStyle, setDrumStyle] = useState<DrumStyle>(
    () => propDrumStyle || detectDrumStyleFromSongStyle(songStyle)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number>(-1);
  const [isCountingIn, setIsCountingIn] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);

  useEffect(() => {
    if (propDrumStyle && propDrumStyle !== drumStyle) {
      setDrumStyle(propDrumStyle);
      interactiveAnalysisAudio.setDrumKitPreset(
        detectDrumKitFromStyle(propDrumStyle)
      );
    }
  }, [propDrumStyle]);

  useEffect(() => {
    const handleOpenMixer = () => setIsMixerOpen(true);
    const handleCloseMixer = () => setIsMixerOpen(false);
    window.addEventListener("open-mixer-modal", handleOpenMixer);
    window.addEventListener("close-mixer-modal", handleCloseMixer);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMixerOpen) {
        setIsMixerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-mixer-modal", handleOpenMixer);
      window.removeEventListener("close-mixer-modal", handleCloseMixer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMixerOpen]);

  const onDrumStyleChangeRef = useRef(onDrumStyleChange);
  useEffect(() => {
    onDrumStyleChangeRef.current = onDrumStyleChange;
  }, [onDrumStyleChange]);

  useEffect(() => {
    const handleGlobalDrumStyle = (e: any) => {
      if (e.detail && e.detail !== drumStyleRef.current) {
        setDrumStyle(e.detail);
        drumStyleRef.current = e.detail;
        const baseGain = getStyleBaseGainMultiplier(e.detail);
        interactiveAnalysisAudio.setStyleBaseGain(baseGain);
        interactiveAnalysisAudio.setDrumKitPreset(
          detectDrumKitFromStyle(e.detail)
        );
        if (onDrumStyleChangeRef.current) {
          onDrumStyleChangeRef.current(e.detail);
        }
      }
    };
    window.addEventListener("change-drum-style", handleGlobalDrumStyle);
    window.addEventListener("drum-style-changed", handleGlobalDrumStyle);
    return () => {
      window.removeEventListener("change-drum-style", handleGlobalDrumStyle);
      window.removeEventListener("drum-style-changed", handleGlobalDrumStyle);
    };
  }, []);

  const [harmonicInstrument, setHarmonicInstrument] = useState<
    "piano" | "guitar" | "epiano"
  >(() =>
    globalInstrument === "guitar"
      ? "guitar"
      : (globalInstrument as any) === "epiano"
      ? "epiano"
      : "piano"
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const isCountingInRef = useRef(false);
  const countInBeatRef = useRef(0);
  const countInEndTimeRef = useRef(0);
  const countInStartBarRef = useRef<number>(1.0);
  const countInStartMeasureRef = useRef<number>(0);
  const startSessionIdRef = useRef(0);
  const clickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const timeSignatureRef = useRef(timeSignature);
  const drumStyleRef = useRef(drumStyle);
  const nextBeatTimeRef = useRef(0.0);
  const currentBeatInMeasureRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const visualQueueRef = useRef<
    {
      time: number;
      beat: number;
      chordIndex: number | null;
      isCountingInBeat: boolean;
      measureIndex?: number;
      beatsPerMeasure?: number;
    }[]
  >([]);

  const harmonicInstrumentRef = useRef(harmonicInstrument);

  const playbackSequenceRef = useRef(playbackSequence);
  const getPlaybackSequenceRef = useRef(getPlaybackSequence);
  useEffect(() => {
    getPlaybackSequenceRef.current = getPlaybackSequence;
  }, [getPlaybackSequence]);

  const currentChordIdxRef = useRef(0);
  const beatsElapsedForCurrentChordRef = useRef(0);
  const globalBeatCountRef = useRef(0);
  const importedMelodyRef = useRef(importedMelody);
  useEffect(() => {
    importedMelodyRef.current = importedMelody;
  }, [importedMelody]);

  const onCycleCompleteRef = useRef(onCycleComplete);
  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  const onIsPlayingChangeRef = useRef(onIsPlayingChange);
  useEffect(() => {
    onIsPlayingChangeRef.current = onIsPlayingChange;
  }, [onIsPlayingChange]);

  useEffect(() => {
    if (metronomeControlRef) {
      metronomeControlRef.current = {
        start: startMetronome,
        stop: stopMetronome,
        togglePlayback: () => {
          if (isPlayingRef.current) {
            stopMetronome();
          } else {
            startMetronome();
          }
        },
        isPlaying: () => isPlayingRef.current,
      };
    }
  });

  useEffect(() => {
    bpmRef.current = bpm;
    try {
      Tone.Transport.bpm.value = bpm;
    } catch {}
  }, [bpm]);

  const onTimeSignatureChangeRef = useRef(onTimeSignatureChange);
  useEffect(() => {
    onTimeSignatureChangeRef.current = onTimeSignatureChange;
  }, [onTimeSignatureChange]);

  useEffect(() => {
    const handleGlobalBpmChange = (e: any) => {
      if (typeof e.detail === "number" && !isNaN(e.detail)) {
        const next = Math.max(40, Math.min(240, Math.round(e.detail)));
        if (next !== bpmRef.current) {
          bpmRef.current = next;
          localBpmRef.current = next;
          setBpm(next);
          setLocalBpm(next);
          setLocalBpmInput(String(next));
          try {
            Tone.Transport.bpm.value = next;
          } catch {}
        }
      }
    };
    const handleGlobalSigChange = (e: any) => {
      if (
        e.detail &&
        typeof e.detail === "string" &&
        e.detail !== timeSignatureRef.current
      ) {
        const sig = e.detail as TimeSignature;
        setTimeSignature(sig);
        timeSignatureRef.current = sig;
        const bpb = getBeatsPerBar(sig);
        currentBeatInMeasureRef.current = currentBeatInMeasureRef.current % bpb;
        if (onTimeSignatureChangeRef.current) {
          onTimeSignatureChangeRef.current(sig);
        }
      }
    };
    window.addEventListener("change-bpm", handleGlobalBpmChange);
    window.addEventListener("bpm-changed", handleGlobalBpmChange);
    window.addEventListener("change-time-signature", handleGlobalSigChange);
    window.addEventListener("time-signature-changed", handleGlobalSigChange);
    return () => {
      window.removeEventListener("change-bpm", handleGlobalBpmChange);
      window.removeEventListener("bpm-changed", handleGlobalBpmChange);
      window.removeEventListener(
        "change-time-signature",
        handleGlobalSigChange
      );
      window.removeEventListener(
        "time-signature-changed",
        handleGlobalSigChange
      );
    };
  }, []);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
  }, [timeSignature]);

  useEffect(() => {
    if (propTimeSignature && propTimeSignature !== timeSignature) {
      const validSig = propTimeSignature as TimeSignature;
      setTimeSignature(validSig);
      timeSignatureRef.current = validSig;
      const bpb = getBeatsPerBar(validSig);
      currentBeatInMeasureRef.current = currentBeatInMeasureRef.current % bpb;
    }
  }, [propTimeSignature]);

  useEffect(() => {
    drumStyleRef.current = drumStyle;
    const baseGain = getStyleBaseGainMultiplier(drumStyle);
    interactiveAnalysisAudio.setStyleBaseGain(baseGain);
    interactiveAnalysisAudio.setDrumKitPreset(
      detectDrumKitFromStyle(songStyle || drumStyle)
    );
  }, [drumStyle, songStyle]);

  useEffect(() => {
    if (songStyle) {
      const detected = detectDrumStyleFromSongStyle(songStyle);
      setDrumStyle(detected);
      const baseGain = getStyleBaseGainMultiplier(detected);
      interactiveAnalysisAudio.setStyleBaseGain(baseGain);
      interactiveAnalysisAudio.setDrumKitPreset(
        detectDrumKitFromStyle(songStyle)
      );
    }
  }, [songStyle]);

  useEffect(() => {
    harmonicInstrumentRef.current = harmonicInstrument;
  }, [harmonicInstrument]);

  useEffect(() => {
    const nextInst =
      globalInstrument === "guitar"
        ? "guitar"
        : (globalInstrument as any) === "epiano"
        ? "epiano"
        : "piano";
    setHarmonicInstrument(nextInst);
    harmonicInstrumentRef.current = nextInst;
  }, [globalInstrument]);

  useEffect(() => {
    playbackSequenceRef.current = playbackSequence;
    if (!isPlaying) {
      currentChordIdxRef.current = 0;
      beatsElapsedForCurrentChordRef.current = 0;
    }
  }, [playbackSequence, isPlaying]);

  useEffect(() => {
    preloadAcousticDrums();
    preloadAcousticInstruments();
    loadSoundfontInstrument("piano");
    loadSoundfontInstrument("guitar");
    loadSoundfontInstrument("bass");
    loadSoundfontInstrument("epiano");
    preloadMelodyInstrumentSampler("vibraphone");
    return () => {
      stopMetronome();
      if (clickSynthRef.current) {
        try {
          clickSynthRef.current.dispose();
        } catch {}
        clickSynthRef.current = null;
      }
      const ctx = interactiveAnalysisAudio.getAudioContext();
      if (ctx && ctx.state === "running") {
        ctx.suspend().catch(() => {});
      }
    };
  }, []);

  const getBeatsPerMeasure = (sig: string = "4/4"): number => {
    const num = parseInt(sig.split("/")[0], 10);
    return !isNaN(num) && num > 0 ? num : getBeatsPerBar(sig);
  };

  const getStepDuration = (
    sig: string = "4/4",
    currentBpm: number = 120
  ): number => {
    const denominator = sig.split("/")[1]?.trim();
    const quarterDuration = 60.0 / Math.max(20, currentBpm);
    return denominator === "8" ? quarterDuration / 2.0 : quarterDuration;
  };

  const getMetronomeAccentLevel = (
    beatIndex: number,
    sig: string = "4/4"
  ): "strong" | "medium" | "weak" => {
    if (beatIndex === 0) return "strong";
    const [numStr, denStr] = sig.split("/").map((s) => s.trim());
    const num = parseInt(numStr, 10);
    if (denStr === "8") {
      if (num === 6 && beatIndex === 3) return "medium";
      if (
        num === 12 &&
        (beatIndex === 3 || beatIndex === 6 || beatIndex === 9)
      )
        return "medium";
      if (num === 7 && (beatIndex === 2 || beatIndex === 4)) return "medium";
      if (num === 9 && (beatIndex === 3 || beatIndex === 6)) return "medium";
      if (num === 5 && beatIndex === 3) return "medium";
    }
    return "weak";
  };

  const playClickSound = (
    time: number,
    accentLevel: "strong" | "medium" | "weak" | boolean,
    vol: number = 1.0
  ) => {
    const level =
      typeof accentLevel === "boolean"
        ? accentLevel
          ? "strong"
          : "weak"
        : accentLevel;
    const gain = level === "strong" ? 0.95 : level === "medium" ? 0.72 : 0.48;
    interactiveAnalysisAudio.playDrumHit("rim", time, gain * vol);
  };

  const playDrumSound = (
    instrument: DrumSampleName,
    time: number,
    vel: number = 1
  ) => {
    const safeInst: DrumSampleName =
      instrument === "hihat_open" ? "hihat_closed" : instrument;
    interactiveAnalysisAudio.playDrumHit(safeInst, time, vel);
  };

  const scheduler = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const lookahead = 0.1;
    const scheduleIntervalMs = 25;

    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const beatsPerMeasure = getBeatsPerMeasure(timeSignatureRef.current);
      const beatNum = currentBeatInMeasureRef.current % beatsPerMeasure;
      const accentLevel = getMetronomeAccentLevel(
        beatNum,
        timeSignatureRef.current
      );

      const pSequence = playbackSequenceRef.current;
      const isCurrentlyCountingIn = false;
      let playingChordIndex: number | null = null;

      const secondsPerBeat = getStepDuration(
        timeSignatureRef.current,
        bpmRef.current
      );

      const rawStyleText = `${songStyle || ""} ${drumStyleRef.current || ""}`.toLowerCase();
      const isReggaetonStyle =
        rawStyleText.includes("reggaet") ||
        rawStyleText.includes("reguet") ||
        rawStyleText.includes("dembow");
      const isValsStyle =
        rawStyleText.includes("vals") || rawStyleText.includes("waltz");
      const isSambaStyle = rawStyleText.includes("samba");
      const isHipHopStyle =
        rawStyleText.includes("hip") || rawStyleText.includes("boom bap");
      const isBossaStyle = !isSambaStyle && rawStyleText.includes("bossa");
      const isBoleroStyle = rawStyleText.includes("bolero");
      const isFunkStyle = rawStyleText.includes("funk");
      const isJazzSwingStyle =
        !isReggaetonStyle &&
        !isValsStyle &&
        !isSambaStyle &&
        !isHipHopStyle &&
        !isBossaStyle &&
        !isBoleroStyle &&
        !isFunkStyle &&
        (rawStyleText.includes("swing") || rawStyleText.includes("jazz"));

      const activeSeqChord =
        pSequence && pSequence.length > 0
          ? pSequence[currentChordIdxRef.current % pSequence.length]
          : null;
      const currentMeasureIdx =
        activeSeqChord?.measureIndex ??
        Math.floor(globalBeatCountRef.current / Math.max(1, beatsPerMeasure));
      const seqTotalBeatsForChorus =
        pSequence && pSequence.length > 0
          ? pSequence.reduce(
              (acc, c) => acc + (c.beatsLength || beatsPerMeasure),
              0
            )
          : 32 * beatsPerMeasure;
      const currentChorus =
        externalChorusRef?.current ??
        Math.floor(
          globalBeatCountRef.current / Math.max(1, seqTotalBeatsForChorus)
        ) + 1;
      const totalChorusesCount = Math.max(
        1,
        totalChorusesLocalRef.current || 1
      );
      const isRhythm2Chorus =
        totalChorusesCount === 1
          ? false
          : totalChorusesCount === 2
          ? currentChorus === 2
          : currentChorus > 1 && currentChorus < totalChorusesCount;

      if (pSequence && pSequence.length > 0) {
        if (currentChordIdxRef.current >= pSequence.length) {
          currentChordIdxRef.current = 0;
        }
        const currentChord = pSequence[currentChordIdxRef.current];
        playingChordIndex =
          currentChord.originalFlatIndex !== undefined
            ? currentChord.originalFlatIndex
            : currentChord.globalChordIndex;

        if (beatsElapsedForCurrentChordRef.current === 0) {
          if (!isJazzSwingStyle && !isBossaStyle && !isFunkStyle) {
            interactiveAnalysisAudio.releaseAllHarmony(
              0.025,
              nextBeatTimeRef.current
            );
          }

          let effectiveChord = currentChord;
          if (!effectiveChord.chordString) {
            for (let back = 1; back <= pSequence.length; back++) {
              const prevIdx =
                (currentChordIdxRef.current - back + pSequence.length) %
                pSequence.length;
              if (pSequence[prevIdx] && pSequence[prevIdx].chordString) {
                effectiveChord = {
                  ...currentChord,
                  chordString: pSequence[prevIdx].chordString,
                  frequencies: pSequence[prevIdx].frequencies,
                  parsedRoot: pSequence[prevIdx].parsedRoot,
                  parsedType: pSequence[prevIdx].parsedType,
                };
                break;
              }
            }
          }

          let nextChordString: string | null = null;
          if (currentChordIdxRef.current + 1 < pSequence.length) {
            nextChordString =
              pSequence[currentChordIdxRef.current + 1].chordString ||
              effectiveChord.chordString;
          } else if (pSequence.length > 0) {
            nextChordString =
              pSequence[0].chordString || effectiveChord.chordString;
          }

          if (effectiveChord.chordString) {
            const activeStyle =
              drumStyleRef.current === "Metronome Básico"
                ? songStyle || ""
                : drumStyleRef.current;

            const beatDuration = secondsPerBeat;

            let chordFreqs = effectiveChord.frequencies;
            if (!chordFreqs || chordFreqs.length === 0) {
              const midiNotes = getChordNotes(effectiveChord.chordString, 48);
              chordFreqs = midiNotes.map(
                (m) => 440 * Math.pow(2, (m - 69) / 12)
              );
            }

            // 1. ARMONÍA
            if (harmonicInstrumentRef.current === "guitar" && !isFunkStyle) {
              let guitarHits: GuitarCompHit[] = [];
              if (isValsStyle) {
                guitarHits = buildValsCriolloComping(
                  chordFreqs,
                  effectiveChord.chordString,
                  effectiveChord.beatsLength,
                  true
                );
              } else if (isSambaStyle) {
                guitarHits = buildSambaComping(
                  chordFreqs,
                  effectiveChord.chordString,
                  effectiveChord.beatsLength,
                  globalBeatCountRef.current,
                  beatsPerMeasure,
                  true
                );
              } else if (isBossaStyle) {
                guitarHits = buildBossaNovaGuitarComping(
                  chordFreqs,
                  effectiveChord.chordString,
                  effectiveChord.beatsLength,
                  globalBeatCountRef.current,
                  beatsPerMeasure
                );
              } else if (isBoleroStyle) {
                guitarHits = buildBoleroGuitarComping(
                  chordFreqs,
                  effectiveChord.chordString,
                  effectiveChord.beatsLength
                );
              } else {
                guitarHits = buildJazzGuitarQuarterComping(
                  chordFreqs,
                  effectiveChord.beatsLength,
                  globalBeatCountRef.current,
                  beatsPerMeasure
                );
              }

              guitarHits.forEach((gh) => {
                const hitStart =
                  nextBeatTimeRef.current + gh.timeOffset * beatDuration;
                const hitDur =
                  isBossaStyle || isBoleroStyle || isValsStyle || isSambaStyle
                    ? Math.max(
                        0.15,
                        Math.min(0.85, gh.durationBeats * beatDuration)
                      )
                    : Math.max(
                        0.14,
                        Math.min(0.32, gh.durationBeats * beatDuration)
                      );
                interactiveAnalysisAudio.playHarmonyChord(
                  gh.freqs,
                  hitStart,
                  hitDur,
                  "guitar",
                  gh.velocity
                );
              });
            } else if (
              isValsStyle ||
              isSambaStyle ||
              isBossaStyle ||
              isHipHopStyle ||
              isJazzSwingStyle ||
              isFunkStyle
            ) {
              const customKbHits = isValsStyle
                ? buildValsCriolloComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    false
                  )
                : isBossaStyle
                ? buildBossaNovaKeyboardComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    globalBeatCountRef.current,
                    beatsPerMeasure,
                    isRhythm2Chorus
                  )
                : isJazzSwingStyle
                ? buildJazzSwingKeyboardComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    currentMeasureIdx,
                    isRhythm2Chorus
                  )
                : isFunkStyle
                ? buildFunkKeyboardComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    currentMeasureIdx
                  )
                : isSambaStyle
                ? buildSambaComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    globalBeatCountRef.current,
                    beatsPerMeasure,
                    false
                  )
                : buildHipHopKeyboardComping(
                    chordFreqs,
                    effectiveChord.chordString,
                    effectiveChord.beatsLength
                  );

              customKbHits.forEach((kh) => {
                const hitStart =
                  nextBeatTimeRef.current + kh.timeOffset * beatDuration;
                const hitDur = Math.max(
                  isFunkStyle ? 0.08 : 0.16,
                  kh.durationBeats * beatDuration
                );
                interactiveAnalysisAudio.playHarmonyChord(
                  kh.freqs,
                  hitStart,
                  hitDur,
                  harmonicInstrumentRef.current,
                  kh.velocity
                );
              });
            } else {
              const comping = generateComping(
                effectiveChord,
                activeStyle,
                globalBeatCountRef.current,
                harmonicInstrumentRef.current,
                timeSignatureRef.current
              );
              const isReggaeStyle =
                !isReggaetonStyle && rawStyleText.includes("reggae");

              comping.forEach((c) => {
                if (!c.freqs || c.freqs.length === 0) return;
                const hitsStart =
                  nextBeatTimeRef.current + c.timeOffset * beatDuration;
                const hitsDuration =
                  isFunkStyle || isReggaeStyle || c.durationBeats <= 0.2
                    ? Math.min(
                        0.14,
                        Math.max(0.08, c.durationBeats * beatDuration)
                      )
                    : c.durationBeats <= 0.4
                    ? Math.min(
                        0.28,
                        Math.max(0.16, c.durationBeats * beatDuration)
                      )
                    : Math.max(0.25, c.durationBeats * beatDuration);
                interactiveAnalysisAudio.playHarmonyChord(
                  c.freqs,
                  hitsStart,
                  hitsDuration,
                  harmonicInstrumentRef.current
                );
              });
            }

            // 2. BAJO / CONTRABAJO (Intacto)
            if (
              isReggaetonStyle ||
              isValsStyle ||
              isSambaStyle ||
              isBossaStyle ||
              isHipHopStyle ||
              isJazzSwingStyle ||
              isFunkStyle
            ) {
              const customBassNotes = isReggaetonStyle
                ? buildReggaetonBassPattern(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    globalBeatCountRef.current,
                    beatsPerMeasure
                  )
                : isValsStyle
                ? buildValsBassPattern(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength
                  )
                : isSambaStyle || isBossaStyle
                ? buildBossaAndSambaBassPattern(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    nextChordString,
                    isBossaStyle
                  )
                : isJazzSwingStyle
                ? buildJazzSwingWalkingBass(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    nextChordString,
                    currentMeasureIdx,
                    isRhythm2Chorus,
                    beatNum
                  )
                : isFunkStyle
                ? buildFunkBassPattern(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    nextChordString,
                    currentMeasureIdx,
                    isRhythm2Chorus
                  )
                : buildHipHopBassPattern(
                    effectiveChord.chordString,
                    effectiveChord.beatsLength,
                    globalBeatCountRef.current,
                    beatsPerMeasure
                  );

              customBassNotes.forEach((n) => {
                const noteStart =
                  nextBeatTimeRef.current + n.timeOffset * beatDuration;
                interactiveAnalysisAudio.playBassNote(
                  n.midi,
                  noteStart,
                  n.durationBeats * (secondsPerBeat / (60.0 / bpmRef.current)),
                  (n as any).velocity ?? 0.85
                );
              });
            } else {
              const bassNotes = generateWalkingBass(
                effectiveChord.chordString,
                effectiveChord.beatsLength,
                nextChordString,
                activeStyle,
                globalBeatCountRef.current,
                timeSignatureRef.current
              );

              bassNotes.forEach((n) => {
                if (
                  isNaN(n.freq) ||
                  isNaN(n.timeOffset) ||
                  isNaN(n.durationBeats)
                )
                  return;
                const noteStart =
                  nextBeatTimeRef.current + n.timeOffset * beatDuration;
                interactiveAnalysisAudio.playBassNote(
                  n.freq,
                  noteStart,
                  n.durationBeats * (secondsPerBeat / (60.0 / bpmRef.current))
                );
              });
            }
          }

          // 3. MELODÍA (LEAD): Disparo al inicio del compás (solo notas con startBeat >= 0; las de startBeat < 0 se disparan en la anacrusa)
          if (
            !melodyMutedRef.current &&
            !interactiveAnalysisAudio.isAnySoloActive() &&
            currentChord.melody &&
            currentChord.melody.length > 0
          ) {
            const trans =
              typeof currentChord.transposition === "number"
                ? currentChord.transposition
                : transpositionRef.current || 0;
            const measureStartTime = nextBeatTimeRef.current;

            currentChord.melody.forEach((noteObj) => {
              if (noteObj.startBeat < 0) return;
              const finalMidi = noteObj.midi + trans;
              const attackTime =
                measureStartTime + noteObj.startBeat * secondsPerBeat;
              const noteDur = Math.max(
                0.08,
                Math.min(3.2, noteObj.durationBeats * secondsPerBeat * 0.95)
              );
              const noteName = Tone.Frequency(finalMidi, "midi").toNote();
              const vel = Math.max(
                0.2,
                Math.min(1.0, noteObj.velocity ?? 0.92)
              );
              triggerLeadMelodyNote(
                "vibraphone",
                noteName,
                noteDur,
                attackTime,
                vel
              );
            });
          }
        }
      }

      const dStyle = drumStyleRef.current;
      const isDrumPattern = dStyle !== "Metronome Básico";

      if (
        !isCurrentlyCountingIn &&
        !isDrumPattern &&
        !interactiveAnalysisAudio.isAnySoloActive()
      ) {
        playClickSound(nextBeatTimeRef.current, accentLevel);
      }

      if (isDrumPattern && !isCurrentlyCountingIn) {
        if (isReggaetonStyle) {
          playDrumSound("kick", nextBeatTimeRef.current, 0.78);
          playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.52);
          playDrumSound(
            "hihat_closed",
            nextBeatTimeRef.current + 0.5 * secondsPerBeat,
            0.42
          );

          if (beatNum === 0 || beatNum === 2) {
            playDrumSound(
              "snare",
              nextBeatTimeRef.current + 0.75 * secondsPerBeat,
              0.76
            );
          } else if (beatNum === 1 || beatNum === 3) {
            playDrumSound(
              "snare",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.72
            );
          }
        } else if (isValsStyle) {
          if (beatNum === 0) {
            playDrumSound("kick", nextBeatTimeRef.current, 0.78);
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.45);
          } else if (beatNum === 1) {
            playDrumSound("rim", nextBeatTimeRef.current, 0.62);
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.42);
            playDrumSound(
              "rim",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.38
            );
          } else {
            playDrumSound("rim", nextBeatTimeRef.current, 0.7);
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.48);
          }
        } else if (isBossaStyle) {
          // BATERÍA BOSSA NOVA LIMPIA (Sin fills de caja que ensucien la 2da vuelta)
          const isOddMeasure = currentMeasureIdx % 2 === 0;
          const dynBoost = isRhythm2Chorus ? 0.05 : 0.0;

          playDrumSound(
            "hihat_closed",
            nextBeatTimeRef.current,
            Math.min(0.85, 0.62 + dynBoost)
          );
          playDrumSound(
            "hihat_closed",
            nextBeatTimeRef.current + 0.5 * secondsPerBeat,
            Math.min(0.75, 0.44 + dynBoost)
          );

          if (beatNum === 0) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current,
              Math.min(0.9, 0.76 + dynBoost)
            );
            if (isOddMeasure) {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current,
                Math.min(0.85, 0.64 + dynBoost)
              );
            } else {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                Math.min(0.85, 0.64 + dynBoost)
              );
            }
          } else if (beatNum === 1) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              Math.min(0.82, 0.54 + dynBoost)
            );
            if (isOddMeasure) {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                Math.min(0.85, 0.64 + dynBoost)
              );
            }
          } else if (beatNum === 2) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current,
              Math.min(0.9, 0.78 + dynBoost)
            );
            if (!isOddMeasure) {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current,
                Math.min(0.85, 0.64 + dynBoost)
              );
            }
          } else if (beatNum === 3) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              Math.min(0.82, 0.56 + dynBoost)
            );
            if (isOddMeasure) {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current,
                Math.min(0.85, 0.64 + dynBoost)
              );
            } else {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                Math.min(0.85, 0.64 + dynBoost)
              );
            }
          }
        } else if (isJazzSwingStyle) {
          // BATERÍA JAZZ SWING:
          // - Vuelta 1 y Última (!isRhythm2Chorus): El patrón original limpio de Hi-Hat cerrado + Aro (sin bombo en negras).
          // - Vueltas de Solos (isRhythm2Chorus): El patrón de Ride + Hi-Hat en 2 y 4 + Ghost Snare sutil cada 4 compases (sin bombo pesado).
          if (!isRhythm2Chorus) {
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.68);
            if (beatNum === 1 || beatNum === 3) {
              playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.65);
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                0.56
              );
            }
            if (beatNum === 1) {
              playDrumSound(
                "rim",
                nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                0.55
              );
            } else if (beatNum === 3) {
              playDrumSound("rim", nextBeatTimeRef.current, 0.55);
            }
          } else {
            const barInPhrase = ((currentMeasureIdx % 4) + 4) % 4;
            playDrumSound("ride", nextBeatTimeRef.current, 0.74);

            if (beatNum === 1 || beatNum === 3) {
              playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.72);
              playDrumSound(
                "ride",
                nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                0.60
              );
            }

            const ghostVel = 0.38;
            if (barInPhrase === 1) {
              if (beatNum === 1) {
                playDrumSound(
                  "snare",
                  nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                  ghostVel
                );
              }
            } else if (barInPhrase === 2) {
              if (beatNum === 3) {
                playDrumSound("snare", nextBeatTimeRef.current, ghostVel);
              }
            } else if (barInPhrase === 3) {
              if (beatNum === 1) {
                playDrumSound(
                  "snare",
                  nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                  ghostVel
                );
              } else if (beatNum === 3) {
                playDrumSound(
                  "snare",
                  nextBeatTimeRef.current + 0.667 * secondsPerBeat,
                  ghostVel + 0.06
                );
              }
            }
          }
        } else if (isFunkStyle) {
          const barInPhrase = ((currentMeasureIdx % 4) + 4) % 4;
          const isOpenHatOn3And =
            (barInPhrase === 1 || barInPhrase === 3) && beatNum === 3;

          if (!isRhythm2Chorus) {
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.68);
            if (beatNum === 0 || beatNum === 1) {
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.45
              );
            }
            if (isOpenHatOn3And) {
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.75
              );
            } else {
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.45
              );
            }
          } else {
            playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.72);
            playDrumSound(
              "hihat_closed",
              nextBeatTimeRef.current + 0.25 * secondsPerBeat,
              0.42
            );
            if (isOpenHatOn3And) {
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.75
              );
            } else {
              playDrumSound(
                "hihat_closed",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.72
              );
            }
            playDrumSound(
              "hihat_closed",
              nextBeatTimeRef.current + 0.75 * secondsPerBeat,
              0.42
            );
          }

          if (beatNum === 1 || beatNum === 3) {
            playDrumSound("snare", nextBeatTimeRef.current, 0.90);
          }
          if (barInPhrase === 0) {
            if (beatNum === 0 || beatNum === 1) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.38
              );
            } else if (beatNum === 2) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.38
              );
            }
          } else if (barInPhrase === 1) {
            if (beatNum === 1 || beatNum === 3) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.38
              );
            } else if (beatNum === 2) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.38
              );
            }
          } else if (barInPhrase === 2) {
            if (beatNum === 0 || beatNum === 2) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.38
              );
            } else if (beatNum === 1) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.38
              );
            }
          } else if (barInPhrase === 3) {
            if (beatNum === 0 || beatNum === 1) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.38
              );
            } else if (beatNum === 3) {
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.55
              );
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.70
              );
              playDrumSound(
                "snare",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.85
              );
            }
          }

          if (barInPhrase === 0) {
            if (beatNum === 0) {
              playDrumSound("kick", nextBeatTimeRef.current, 0.92);
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.72
              );
            } else if (beatNum === 2) {
              playDrumSound("kick", nextBeatTimeRef.current, 0.85);
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.78
              );
            }
          } else if (barInPhrase === 1) {
            if (beatNum === 0) {
              playDrumSound("kick", nextBeatTimeRef.current, 0.92);
            } else if (beatNum === 1) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.76
              );
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.82
              );
            } else if (beatNum === 2) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.80
              );
            }
          } else if (barInPhrase === 2) {
            if (beatNum === 0) {
              playDrumSound("kick", nextBeatTimeRef.current, 0.92);
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.75
              );
            } else if (beatNum === 2) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.25 * secondsPerBeat,
                0.80
              );
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.76
              );
            }
          } else if (barInPhrase === 3) {
            if (beatNum === 0) {
              playDrumSound("kick", nextBeatTimeRef.current, 0.92);
            } else if (beatNum === 1) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.80
              );
            } else if (beatNum === 2) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.84
              );
            } else if (beatNum === 3) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.5 * secondsPerBeat,
                0.78
              );
            }
          }
        } else if (isSambaStyle) {
          playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.48);
          playDrumSound(
            "hihat_closed",
            nextBeatTimeRef.current + 0.5 * secondsPerBeat,
            0.4
          );

          if (beatNum === 0) {
            playDrumSound("kick", nextBeatTimeRef.current, 0.8);
            playDrumSound("rim", nextBeatTimeRef.current, 0.68);
          } else if (beatNum === 1) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.72
            );
            playDrumSound(
              "rim",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.68
            );
          } else if (beatNum === 2) {
            playDrumSound("kick", nextBeatTimeRef.current, 0.8);
            playDrumSound(
              "rim",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.65
            );
          } else if (beatNum === 3) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.72
            );
            playDrumSound("rim", nextBeatTimeRef.current, 0.64);
          }
        } else if (isHipHopStyle) {
          playDrumSound("hihat_closed", nextBeatTimeRef.current, 0.62);
          playDrumSound(
            "hihat_closed",
            nextBeatTimeRef.current + 0.54 * secondsPerBeat,
            0.46
          );

          if (beatNum === 0) {
            playDrumSound("kick", nextBeatTimeRef.current, 0.88);
          } else if (beatNum === 1) {
            playDrumSound("snare", nextBeatTimeRef.current, 0.86);
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.82
            );
          } else if (beatNum === 2) {
            playDrumSound(
              "kick",
              nextBeatTimeRef.current + 0.5 * secondsPerBeat,
              0.74
            );
          } else if (beatNum === 3) {
            playDrumSound("snare", nextBeatTimeRef.current, 0.88);
            if (globalBeatCountRef.current % 8 === 7) {
              playDrumSound(
                "kick",
                nextBeatTimeRef.current + 0.75 * secondsPerBeat,
                0.68
              );
            }
          }
        } else {
          const matrix = getDrumMatrixForBeat(
            dStyle,
            beatNum,
            globalBeatCountRef.current,
            timeSignatureRef.current
          );

          for (const hit of matrix.kick) {
            playDrumSound(
              hit.instrument,
              nextBeatTimeRef.current + hit.timeOffset * secondsPerBeat,
              hit.velocity
            );
          }

          for (const hit of matrix.snare) {
            playDrumSound(
              hit.instrument,
              nextBeatTimeRef.current + hit.timeOffset * secondsPerBeat,
              hit.velocity
            );
          }

          for (const hit of matrix.hihat) {
            playDrumSound(
              hit.instrument,
              nextBeatTimeRef.current + hit.timeOffset * secondsPerBeat,
              hit.velocity
            );
          }

          for (const hit of matrix.ride) {
            playDrumSound(
              hit.instrument,
              nextBeatTimeRef.current + hit.timeOffset * secondsPerBeat,
              hit.velocity
            );
          }
        }
      }

      const currentChordForVisual =
        pSequence &&
        pSequence.length > 0 &&
        currentChordIdxRef.current < pSequence.length
          ? pSequence[currentChordIdxRef.current]
          : null;
      const measureIdxForVisual = currentChordForVisual
        ? currentChordForVisual.measureIndex ?? 0
        : 0;

      visualQueueRef.current.push({
        time: nextBeatTimeRef.current,
        beat: beatNum,
        chordIndex: playingChordIndex,
        isCountingInBeat: isCurrentlyCountingIn,
        measureIndex: measureIdxForVisual,
        beatsPerMeasure: beatsPerMeasure,
      });

      nextBeatTimeRef.current += secondsPerBeat;
      currentBeatInMeasureRef.current = (beatNum + 1) % beatsPerMeasure;

      if (!isCurrentlyCountingIn) {
        if (pSequence && pSequence.length > 0) {
          const currentChord = pSequence[currentChordIdxRef.current];
          beatsElapsedForCurrentChordRef.current += 1;
          if (
            beatsElapsedForCurrentChordRef.current >= currentChord.beatsLength
          ) {
            beatsElapsedForCurrentChordRef.current = 0;

            const nextIdx = currentChord.isEndOfPlayback
              ? 0
              : (currentChordIdxRef.current + 1) % pSequence.length;
            if (nextIdx === 0) {
              if (onCycleCompleteRef.current) {
                onCycleCompleteRef.current();
                if (!isPlayingRef.current) {
                  return;
                }
              } else if (currentChord.isEndOfPlayback) {
                stopMetronome();
                return;
              }
            }
            currentChordIdxRef.current = nextIdx;
          }
        }
        globalBeatCountRef.current += 1;
      }
    }

    if (isPlayingRef.current) {
      timerIdRef.current = window.setTimeout(scheduler, scheduleIntervalMs);
    }
  };

  const updateVisuals = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const currentTime = ctx.currentTime;

    if (isCountingInRef.current) {
      if (currentTime < countInEndTimeRef.current) {
        let countInBeatUpdated = -1;
        while (
          visualQueueRef.current.length > 0 &&
          visualQueueRef.current[0].isCountingInBeat &&
          visualQueueRef.current[0].time <= currentTime
        ) {
          const top = visualQueueRef.current.shift()!;
          countInBeatUpdated = top.beat;
        }
        if (countInBeatUpdated !== -1 && isVisibleRef.current) {
          setCurrentBeat(countInBeatUpdated);
        }
        if (isPlayingRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(updateVisuals);
        }
        return;
      }
      isCountingInRef.current = false;
      (window as any).__linusCountInEndAudioTime = 0;
      setIsCountingIn(false);
      const btnEl = document.getElementById("metronome-toggle-btn");
      if (btnEl) {
        btnEl.setAttribute("data-counting-in", "false");
      }
      window.dispatchEvent(
        new CustomEvent("linus-transport-position", {
          detail: {
            bar: countInStartBarRef.current || 1.0,
            measureIndex: countInStartMeasureRef.current || 0,
            beat: 0,
            isPlaying: true,
            isCountingIn: false,
          },
        })
      );
    }

    let activeBeat = currentBeat;
    let activeChordIndex: number | null = null;
    let activeIsCountingIn = isCountingIn;
    let activeMeasureIndex = 0;
    let activeBeatsPerMeasure = getBeatsPerMeasure(timeSignatureRef.current);
    let advanced = false;

    while (
      visualQueueRef.current.length > 0 &&
      visualQueueRef.current[0].time <= currentTime
    ) {
      const top = visualQueueRef.current[0];
      activeBeat = top.beat;
      activeChordIndex = top.chordIndex;
      activeIsCountingIn = top.isCountingInBeat;
      activeMeasureIndex = top.measureIndex ?? 0;
      activeBeatsPerMeasure =
        top.beatsPerMeasure ?? getBeatsPerMeasure(timeSignatureRef.current);
      visualQueueRef.current.shift();
      advanced = true;
    }

    if (
      advanced &&
      isVisibleRef.current &&
      activeBeat !== currentBeat &&
      activeBeat !== -1
    ) {
      setCurrentBeat(activeBeat);
    }

    if (
      advanced &&
      isVisibleRef.current &&
      activeIsCountingIn !== isCountingIn
    ) {
      setIsCountingIn(activeIsCountingIn);
    }

    if (advanced && onPlayingIndexChange && isVisibleRef.current) {
      onPlayingIndexChange(activeChordIndex);
    }

    if (advanced && !activeIsCountingIn) {
      const bpb =
        activeBeatsPerMeasure || getBeatsPerMeasure(timeSignatureRef.current);
      const barPosition =
        (activeMeasureIndex ?? 0) + 1 + (activeBeat ?? 0) / bpb;
      const secondsPerBeatCur = getStepDuration(
        timeSignatureRef.current,
        bpmRef.current
      );
      (window as any).__linusSeekMeasureIndex = activeMeasureIndex ?? 0;
      (window as any).__linusSeekTargetSeconds = Math.max(
        0,
        (barPosition - 1.0) * bpb * secondsPerBeatCur
      );
      window.dispatchEvent(
        new CustomEvent("linus-transport-position", {
          detail: {
            bar: barPosition,
            measureIndex: activeMeasureIndex,
            beat: activeBeat,
            isPlaying: true,
            isCountingIn: false,
          },
        })
      );
    }

    if (isPlayingRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(updateVisuals);
    }
  };

  const startMetronome = async () => {
    try {
      const sessionId = ++startSessionIdRef.current;

      const beatsPerMeasureInitial = getBeatsPerMeasure(
        timeSignatureRef.current
      );
      const secondsPerBeatInitial = getStepDuration(
        timeSignatureRef.current,
        bpmRef.current
      );
      const secondsPerBarInitial =
        secondsPerBeatInitial * beatsPerMeasureInitial;
      const startMeasureIndex =
        typeof (window as any).__linusSeekMeasureIndex === "number"
          ? Math.max(0, (window as any).__linusSeekMeasureIndex)
          : typeof selectedMeasureIndexRef.current === "number" &&
            selectedMeasureIndexRef.current >= 0
          ? selectedMeasureIndexRef.current
          : Math.max(
              0,
              Math.round((Tone.Transport.seconds || 0) / secondsPerBarInitial)
            );
      const startTransportSeconds = Math.max(
        0,
        startMeasureIndex * secondsPerBarInitial
      );
      const startBar = startMeasureIndex + 1.0;

      (window as any).__linusSeekMeasureIndex = startMeasureIndex;
      (window as any).__linusSeekTargetSeconds = startTransportSeconds;

      countInStartBarRef.current = startBar;
      countInStartMeasureRef.current = startMeasureIndex;

      try {
        Tone.Transport.pause();
        Tone.Transport.cancel(0);
        Tone.Transport.seconds = startTransportSeconds;
      } catch {}

      const isMetronomeEnabledInitial =
        interactiveAnalysisAudio.isMetronomeActive() ||
        drumStyleRef.current === "Metronome Básico" ||
        bpmRef.current > 150;

      isCountingInRef.current = isMetronomeEnabledInitial;
      setIsCountingIn(isMetronomeEnabledInitial);
      setIsPlaying(true);
      isPlayingRef.current = true;
      if (onIsPlayingChangeRef.current) {
        onIsPlayingChangeRef.current(true);
      }
      countInBeatRef.current = 0;

      const btnEl = document.getElementById("metronome-toggle-btn");
      if (btnEl) {
        btnEl.setAttribute("data-playing", "true");
        btnEl.setAttribute(
          "data-counting-in",
          isMetronomeEnabledInitial ? "true" : "false"
        );
      }

      window.dispatchEvent(
        new CustomEvent("linus-transport-position", {
          detail: {
            bar: startBar,
            measureIndex: startMeasureIndex,
            beat: 0,
            isPlaying: true,
            isCountingIn: isMetronomeEnabledInitial,
          },
        })
      );

      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      interactiveAnalysisAudio.stopAll();
      releaseAllLeadMelodyNotes();

      const ctx = interactiveAnalysisAudio.getAudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      await interactiveAnalysisAudio.preloadAllWavSamples();

      if (sessionId !== startSessionIdRef.current) return;

      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      if (getPlaybackSequenceRef.current) {
        const fresh = getPlaybackSequenceRef.current();
        if (fresh && fresh.length > 0) {
          playbackSequenceRef.current = fresh;
        }
      }

      currentBeatInMeasureRef.current = 0;
      beatsElapsedForCurrentChordRef.current = 0;
      globalBeatCountRef.current = startMeasureIndex * beatsPerMeasureInitial;

      if (
        playbackSequenceRef.current &&
        playbackSequenceRef.current.length > 0
      ) {
        const exactIdx = playbackSequenceRef.current.findIndex(
          (c, idx) => (c.measureIndex ?? idx) === startMeasureIndex
        );
        currentChordIdxRef.current =
          exactIdx !== -1
            ? exactIdx
            : Math.min(
                startMeasureIndex,
                playbackSequenceRef.current.length - 1
              );
      } else {
        currentChordIdxRef.current = 0;
      }

      visualQueueRef.current = [];
      setCurrentBeat(-1);
      if (onPlayingIndexChange) {
        onPlayingIndexChange(null);
      }

      try {
        if (Tone.context.state !== "running") {
          await Tone.start();
        }
        if (sessionId !== startSessionIdRef.current) return;

        Tone.Transport.bpm.value = bpmRef.current;
        Tone.Transport.pause();
        Tone.Transport.seconds = startTransportSeconds;

        if (!clickSynthRef.current) {
          clickSynthRef.current = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            envelope: {
              attack: 0.001,
              decay: 0.045,
              sustain: 0,
              release: 0.01,
            },
            volume: -4,
          }).toDestination();
        }

        const isMetronomeEnabled =
          interactiveAnalysisAudio.isMetronomeActive() ||
          drumStyleRef.current === "Metronome Básico" ||
          bpmRef.current > 150;

        const now = Tone.now();
        const beatsPerBar =
          parseInt(timeSignatureRef.current.split("/")[0], 10) || 4;
        const countInBars = bpmRef.current > 150 ? 2 : 1;
        const countInBeats = countInBars * beatsPerBar;
        const stepDuration = getStepDuration(
          timeSignatureRef.current,
          bpmRef.current
        );

        const firstChordObj =
          playbackSequenceRef.current?.[currentChordIdxRef.current];
        const pickupNotes =
          startMeasureIndex === 0 && firstChordObj?.melody
            ? firstChordObj.melody.filter((n) => n.startBeat < 0)
            : [];
        const earliestPickupBeat =
          pickupNotes.length > 0
            ? Math.min(...pickupNotes.map((n) => n.startBeat))
            : 0;
        const pickupLeadInSeconds =
          earliestPickupBeat < 0
            ? Math.abs(earliestPickupBeat) * stepDuration
            : 0;

        if (isMetronomeEnabled) {
          isCountingInRef.current = true;
          setIsCountingIn(true);
          countInEndTimeRef.current =
            ctx.currentTime + stepDuration * countInBeats;
          (window as any).__linusCountInEndAudioTime =
            countInEndTimeRef.current;

          window.dispatchEvent(
            new CustomEvent("linus-transport-position", {
              detail: {
                bar: startBar,
                measureIndex: startMeasureIndex,
                beat: 0,
                isPlaying: true,
                isCountingIn: true,
              },
            })
          );

          for (let i = 0; i < countInBeats; i++) {
            const beatInBar = i % beatsPerBar;
            const accentLevel = getMetronomeAccentLevel(
              beatInBar,
              timeSignatureRef.current
            );
            const notePitch =
              accentLevel === "strong"
                ? "G5"
                : accentLevel === "medium"
                ? "E5"
                : "C5";
            const noteVel =
              accentLevel === "strong"
                ? 1.0
                : accentLevel === "medium"
                ? 0.72
                : 0.48;
            clickSynthRef.current.triggerAttackRelease(
              notePitch,
              "32n",
              now + stepDuration * i,
              noteVel
            );
            visualQueueRef.current.push({
              time: ctx.currentTime + stepDuration * i,
              beat: beatInBar,
              chordIndex: null,
              isCountingInBeat: true,
              measureIndex: startMeasureIndex,
              beatsPerMeasure: beatsPerBar,
            });
          }

          Tone.Transport.start(
            now + stepDuration * countInBeats,
            startTransportSeconds
          );
          nextBeatTimeRef.current =
            ctx.currentTime + stepDuration * countInBeats;
        } else {
          isCountingInRef.current = false;
          setIsCountingIn(false);
          countInEndTimeRef.current = 0;
          (window as any).__linusCountInEndAudioTime = 0;
          const startDelaySec = 0.05 + pickupLeadInSeconds;
          Tone.Transport.start(now + startDelaySec, startTransportSeconds);
          nextBeatTimeRef.current = ctx.currentTime + startDelaySec;
        }

        if (pickupNotes.length > 0 && !melodyMutedRef.current) {
          const trans =
            typeof firstChordObj?.transposition === "number"
              ? firstChordObj.transposition
              : transpositionRef.current || 0;
          const bandEntryTime = nextBeatTimeRef.current;
          pickupNotes.forEach((noteObj) => {
            const finalMidi = noteObj.midi + trans;
            const attackTime = bandEntryTime + noteObj.startBeat * stepDuration;
            const noteDur = Math.max(
              0.08,
              Math.min(3.2, noteObj.durationBeats * stepDuration * 0.95)
            );
            const noteName = Tone.Frequency(finalMidi, "midi").toNote();
            triggerLeadMelodyNote(
              "vibraphone",
              noteName,
              noteDur,
              attackTime,
              noteObj.velocity ?? 0.95
            );
          });
        }
      } catch {
        isCountingInRef.current = false;
        setIsCountingIn(false);
        (window as any).__linusCountInEndAudioTime = 0;
        nextBeatTimeRef.current = ctx.currentTime + 0.02;
      }

      scheduler();
      animationFrameIdRef.current = requestAnimationFrame(updateVisuals);
    } catch (err) {
      console.warn("Failed to launch metronome context", err);
    }
  };

  const stopMetronome = () => {
    startSessionIdRef.current += 1;
    const wasCountingIn = isCountingInRef.current;
    (window as any).__linusCountInEndAudioTime = 0;
    const btnEl = document.getElementById("metronome-toggle-btn");
    if (btnEl) {
      btnEl.setAttribute("data-playing", "false");
      btnEl.setAttribute("data-counting-in", "false");
    }
    window.dispatchEvent(new CustomEvent("master-rec-stop"));

    const bpbStop = getBeatsPerMeasure(timeSignatureRef.current);
    const secPerBarStop =
      getStepDuration(timeSignatureRef.current, bpmRef.current) * bpbStop;
    const currentSecOnStop = wasCountingIn
      ? Math.max(
          0,
          ((countInStartBarRef.current || 1.0) - 1.0) * secPerBarStop
        )
      : Math.max(0, Tone.Transport.seconds || 0);
    const currentBarOnStop = wasCountingIn
      ? countInStartBarRef.current || 1.0
      : 1.0 + currentSecOnStop / secPerBarStop;
    const currentMeasureOnStop = Math.max(
      0,
      Math.floor(currentBarOnStop - 1.0)
    );

    setIsPlaying(false);
    isPlayingRef.current = false;
    if (onIsPlayingChangeRef.current) {
      onIsPlayingChangeRef.current(false);
    }
    setIsCountingIn(false);
    isCountingInRef.current = false;
    countInEndTimeRef.current = 0;
    setCurrentBeat(-1);
    if (onPlayingIndexChange) {
      onPlayingIndexChange(null);
    }
    stopAllPlayback();
    interactiveAnalysisAudio.stopAll();
    releaseAllLeadMelodyNotes();

    window.dispatchEvent(
      new CustomEvent("linus-transport-position", {
        detail: {
          bar: currentBarOnStop,
          measureIndex: currentMeasureOnStop,
          beat: 0,
          isPlaying: false,
          isCountingIn: false,
        },
      })
    );

    try {
      if (clickSynthRef.current) {
        clickSynthRef.current.triggerRelease();
        clickSynthRef.current.dispose();
        clickSynthRef.current = null;
      }
      Tone.Transport.pause();
      Tone.Transport.cancel(0);
      Tone.Transport.seconds = currentSecOnStop;
    } catch {}

    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  useEffect(() => {
    const handleGlobalStop = () => {
      stopMetronome();
    };
    const handleSeekMeasure = (e: any) => {
      const mIdx = e?.detail?.measureIndex;
      const targetSec = e?.detail?.targetSeconds;
      const flatIdx = e?.detail?.flatIndex;
      if (typeof mIdx === "number" && mIdx >= 0) {
        const bpb = getBeatsPerMeasure(timeSignatureRef.current);
        const secondsPerBeatCur = getStepDuration(
          timeSignatureRef.current,
          bpmRef.current
        );
        const effectiveTargetSec =
          typeof targetSec === "number" && !isNaN(targetSec)
            ? Math.max(0, targetSec)
            : Math.max(0, mIdx * bpb * secondsPerBeatCur);

        selectedMeasureIndexRef.current = mIdx;
        countInStartMeasureRef.current = mIdx;
        countInStartBarRef.current = mIdx + 1.0;
        (window as any).__linusSeekMeasureIndex = mIdx;
        (window as any).__linusSeekTargetSeconds = effectiveTargetSec;

        currentBeatInMeasureRef.current = 0;
        globalBeatCountRef.current = mIdx * bpb;
        beatsElapsedForCurrentChordRef.current = 0;

        if (
          playbackSequenceRef.current &&
          playbackSequenceRef.current.length > 0
        ) {
          let exactIdx = -1;
          if (typeof flatIdx === "number") {
            exactIdx = playbackSequenceRef.current.findIndex(
              (c, idx) =>
                (c.measureIndex ?? idx) === mIdx &&
                c.originalFlatIndex === flatIdx
            );
          }
          if (exactIdx === -1) {
            exactIdx = playbackSequenceRef.current.findIndex(
              (c, idx) => (c.measureIndex ?? idx) === mIdx
            );
          }
          currentChordIdxRef.current =
            exactIdx !== -1
              ? exactIdx
              : Math.min(mIdx, playbackSequenceRef.current.length - 1);
        } else {
          currentChordIdxRef.current = 0;
        }

        visualQueueRef.current = [];
        try {
          Tone.Transport.seconds = effectiveTargetSec;
        } catch {}

        if (isPlayingRef.current) {
          interactiveAnalysisAudio.releaseAllHarmony(0.03);
          interactiveAnalysisAudio.releaseAllBass(0.03);
          releaseAllLeadMelodyNotes();
          const jumpedChord =
            playbackSequenceRef.current?.[currentChordIdxRef.current];
          if (jumpedChord && onPlayingIndexChange && isVisibleRef.current) {
            onPlayingIndexChange(
              jumpedChord.originalFlatIndex !== undefined
                ? jumpedChord.originalFlatIndex
                : jumpedChord.globalChordIndex
            );
          }
          if (!isCountingInRef.current && audioCtxRef.current) {
            nextBeatTimeRef.current = audioCtxRef.current.currentTime + 0.02;
            if (timerIdRef.current) {
              clearTimeout(timerIdRef.current);
              timerIdRef.current = null;
            }
            scheduler();
          }
        }
      }
    };
    window.addEventListener("global-playback-stop", handleGlobalStop);
    window.addEventListener("linus-seek-measure", handleSeekMeasure);
    return () => {
      window.removeEventListener("global-playback-stop", handleGlobalStop);
      window.removeEventListener("linus-seek-measure", handleSeekMeasure);
    };
  }, []);

  const togglePlayback = () => {
    if (isPlayingRef.current || isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const commitBpm = useCallback((targetBpm: number) => {
    const clamped = Math.max(40, Math.min(240, Math.round(targetBpm)));
    if (clamped === bpmRef.current) return;
    bpmRef.current = clamped;
    localBpmRef.current = clamped;
    setBpm(clamped);
    setLocalBpm(clamped);
    setLocalBpmInput(String(clamped));
    try {
      Tone.Transport.bpm.value = clamped;
    } catch {}
    window.dispatchEvent(new CustomEvent("bpm-changed", { detail: clamped }));
  }, []);

  const handleStepBpm = useCallback(
    (delta: number) => {
      setLocalBpm((prev) => {
        const next = Math.max(40, Math.min(240, prev + delta));
        localBpmRef.current = next;
        setLocalBpmInput(String(next));

        if (stepDebounceTimerRef.current) {
          clearTimeout(stepDebounceTimerRef.current);
        }
        stepDebounceTimerRef.current = setTimeout(() => {
          commitBpm(next);
        }, 150);

        return next;
      });
    },
    [commitBpm]
  );

  const beatsCount = getBeatsPerMeasure(timeSignature);

  return (
    <div
      id="digital-metronome-container"
      className={`border rounded-xl transition duration-150 p-4 ${
        inline
          ? "bg-black/40 border-zinc-850 w-full"
          : "bg-[#0e0e0e] border-zinc-850 shadow-2xl w-full max-w-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
          <Volume2 className="text-orange-500 scale-90" size={15} />
          <span className="text-[10px] whitespace-nowrap tracking-widest font-mono text-zinc-400 uppercase font-bold truncate">
            <span className="inline-block">
              {drumStyle === "Metronome Básico"
                ? t("academy.metronome")
                : drumStyle}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="drum-style-selector"
            value={drumStyle}
            onChange={(e) => {
              const newStyle = e.target.value as DrumStyle;
              setDrumStyle(newStyle);
              interactiveAnalysisAudio.setDrumKitPreset(
                detectDrumKitFromStyle(newStyle)
              );
              if (onDrumStyleChange) {
                onDrumStyleChange(newStyle);
              }
              window.dispatchEvent(
                new CustomEvent("drum-style-changed", { detail: newStyle })
              );
            }}
            className="bg-black text-[10px] text-zinc-300 font-mono border border-zinc-850 rounded px-2 py-0.5 outline-none focus:border-orange-500 appearance-none cursor-pointer"
          >
            <option value="Jazz Swing">Jazz Swing</option>
            <option value="Bossa Nova">Bossa Nova</option>
            <option value="Bolero">Bolero</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Reggae">Reggae</option>
            <option value="R&B">R&amp;B</option>
            <option value="Cumbia">Cumbia</option>
            <option value="Funk">Funk</option>
            <option value="Blues">Blues</option>
            <option value="Reggaetón">Reggaetón</option>
          </select>

          <div className="flex bg-black rounded p-0.5 border border-zinc-850">
            <select
              id="metronome-sig-selector"
              value={timeSignature}
              onChange={(e) => {
                const sig = e.target.value as TimeSignature;
                setTimeSignature(sig);
                timeSignatureRef.current = sig;
                const bpb = getBeatsPerBar(sig);
                currentBeatInMeasureRef.current =
                  currentBeatInMeasureRef.current % bpb;
                if (onTimeSignatureChange) {
                  onTimeSignatureChange(sig);
                }
                window.dispatchEvent(
                  new CustomEvent("time-signature-changed", { detail: sig })
                );
              }}
              className="bg-black text-[10px] text-zinc-300 font-mono border-none rounded px-1.5 py-0.5 outline-none focus:text-orange-500 cursor-pointer"
            >
              {(["4/4", "3/4", "6/8", "12/8", "2/4", "5/4", "7/8"] as const).map(
                (sig) => (
                  <option
                    key={sig}
                    value={sig}
                    className="bg-zinc-900 text-zinc-200"
                  >
                    {sig}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-[0_0_80px]">
          <button
            id="metronome-toggle-btn"
            data-playing={isPlaying ? "true" : "false"}
            data-counting-in={isCountingIn ? "true" : "false"}
            onClick={(e) => {
              e.currentTarget.blur();
              togglePlayback();
            }}
            className={`w-full py-2 px-3 rounded flex items-center justify-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-none ${
              isPlaying
                ? isCountingIn
                  ? "bg-amber-500/20 border border-amber-500/50 text-amber-400"
                  : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                : "bg-orange-500 text-white shadow-none"
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={11} fill="currentColor" />
                <span className="block truncate">
                  {isCountingIn ? `Lista... ${currentBeat + 1}!` : "Stop"}
                </span>
              </>
            ) : (
              <>
                <Play size={11} fill="currentColor" />
                <span className="block truncate">Play</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1">
          <button
            id="open-mixer-modal-btn"
            type="button"
            onClick={() => setIsMixerOpen(true)}
            className="w-full py-2 px-3 rounded flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-755 hover:border-orange-500 shadow-sm active:scale-95"
          >
            <SlidersHorizontal size={13} className="text-orange-500" />
            <span className="inline-block text-orange-500">Mixer</span>
          </button>
        </div>

        <div className="flex-[0_0_130px] flex items-center justify-between gap-1.5 bg-black/60 border border-zinc-850 px-2 py-1.5 rounded">
          <button
            id="metronome-bpm-minus"
            onClick={() => handleStepBpm(-1)}
            className="p-1 hover:bg-zinc-800 hover:text-orange-500 text-zinc-500 transition rounded active:scale-90 cursor-pointer"
          >
            <Minus size={12} />
          </button>

          <div className="text-center select-none flex flex-col min-w-[50px]">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={localBpmInput}
              onFocus={() => {
                isEditingBpmRef.current = true;
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setLocalBpmInput(val);
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed)) {
                    const clamped = Math.max(40, Math.min(240, parsed));
                    localBpmRef.current = clamped;
                    setLocalBpm(clamped);
                  }
                }
              }}
              onBlur={() => {
                isEditingBpmRef.current = false;
                const parsed = parseInt(localBpmInput, 10);
                commitBpm(isNaN(parsed) ? bpmRef.current : parsed);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  isEditingBpmRef.current = false;
                  const parsed = parseInt(localBpmInput, 10);
                  commitBpm(isNaN(parsed) ? bpmRef.current : parsed);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="text-sm font-mono font-bold text-zinc-100 leading-none text-center bg-transparent border-none outline-none focus:text-orange-500 tabular-nums w-full cursor-pointer"
            />
            <span className="text-[7.5px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">
              BPM
            </span>
          </div>

          <button
            id="metronome-bpm-plus"
            onClick={() => handleStepBpm(1)}
            className="p-1 hover:bg-zinc-800 hover:text-orange-500 text-zinc-500 transition rounded active:scale-90 cursor-pointer"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[8px] font-mono text-zinc-600">40</span>
        <input
          id="metronome-slider"
          type="range"
          min="40"
          max="240"
          value={localBpm}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              localBpmRef.current = val;
              setLocalBpm(val);
              setLocalBpmInput(String(val));
            }
          }}
          onPointerUp={() => commitBpm(localBpmRef.current)}
          onMouseUp={() => commitBpm(localBpmRef.current)}
          onTouchEnd={() => commitBpm(localBpmRef.current)}
          onKeyUp={() => commitBpm(localBpmRef.current)}
          className="flex-1 accent-orange-500 cursor-pointer h-1.5 rounded-lg bg-zinc-850 appearance-none focus:outline-none"
        />
        <span className="text-[8px] font-mono text-zinc-600">240</span>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-850/60 flex items-center justify-center gap-2">
        {Array.from({ length: beatsCount }).map((_, idx) => {
          const isActive = currentBeat === idx;
          const isAccent = idx === 0;

          return (
            <div
              key={`metro-led-${idx}`}
              id={`metro-led-${idx}`}
              className={`flex-1 h-2 rounded transition-all duration-75 relative ${
                isActive
                  ? isAccent
                    ? "bg-orange-500 shadow-[0_0_8px_4px_rgba(234,88,11,0.4)]"
                    : "bg-orange-500 shadow-[0_0_6px_2px_rgba(234,88,11,0.25)]"
                  : isAccent
                  ? "bg-zinc-800 border-[1.5px] border-orange-500/25"
                  : "bg-zinc-900"
              }`}
            />
          );
        })}
      </div>

      {isMixerOpen && (
        <div
          id="mixer-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMixerOpen(false)}
        >
          <div
            id="mixer-modal-card"
            className="w-full max-w-6xl relative shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-mixer-modal-btn"
              type="button"
              onClick={() => setIsMixerOpen(false)}
              className="absolute -top-3.5 -right-3.5 z-20 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-xl"
            >
              <X size={15} />
            </button>

            <InteractiveMixer
              currentInstrument={harmonicInstrument}
              onInstrumentChange={setHarmonicInstrument}
              onClose={() => setIsMixerOpen(false)}
              isPlaying={isPlaying}
              onTogglePlayback={togglePlayback}
              bpm={bpm}
              onBpmChange={commitBpm}
              songStyle={songStyle}
              dawTracks={dawTracks}
              updateTrackVolume={updateTrackVolume}
              toggleTrackMute={toggleTrackMute}
              toggleTrackSolo={toggleTrackSolo}
              updateTrackPan={updateTrackPan}
              onUpdateTrackInstrument={onUpdateTrackInstrument}
            />
          </div>
        </div>
      )}
    </div>
  );
}