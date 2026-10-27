import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  BookOpen,
  Check,
  X,
  PlayCircle,
  BookCheck,
  Volume2,
  Maximize2,
} from "lucide-react";
import {
  harmonyCurriculumPart1,
  CurriculumChapter,
} from "../data/merinoSyllabusPart1";
import englishData from "../data/merinoSyllabusPart1EnData.json";
import ScaleFretboard from "./ScaleFretboard";
import ChordFretboard from "./ChordFretboard";
import IntervalFretboard from "./IntervalFretboard";
import ScalePianoKeyboard from "./ScalePianoKeyboard";
import ChordPianoKeyboard, {
  KeyboardVoicingMode,
  resolveKeyboardVoicingData,
} from "./ChordPianoKeyboard";
import IntervalPianoKeyboard from "./IntervalPianoKeyboard";
import { useInstrument } from "../contexts/InstrumentContext";
import ChordDictionary from "./ChordDictionary";
import GlobalIntervalMap from "./GlobalIntervalMap";
import { getArpeggioShape } from "../data/arpeggios";
import { academiaAudio } from "../utils/academiaAudio";
import {
  CHORD_DEFINITIONS,
  getGuitarChordVoicings,
  getGuitarChordFrequencies,
  ROOT_MIDI_OFFSET_MAP,
} from "../data/chords";
import { transposeRoot, parseChord, getChordNotes } from "../utils/music";
import { RootNote } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import QuizCapitulo7 from "./QuizCapitulo7";
import QuizCapitulo8 from "./QuizCapitulo8";
import QuizCapitulo9 from "./QuizCapitulo9";
import QuizCapitulo6 from "./QuizCapitulo6";
import QuizCapitulo5 from "./QuizCapitulo5";
import QuizCapitulo4 from "./QuizCapitulo4";
import QuizCapitulo3 from "./QuizCapitulo3";
import QuizCapitulo2 from "./QuizCapitulo2";
import QuizCapitulo1 from "./QuizCapitulo1";
import QuizCapitulo1En from "./QuizCapitulo1En";
import QuizCapitulo2En from "./QuizCapitulo2En";
import QuizCapitulo3En from "./QuizCapitulo3En";
import QuizCapitulo4En from "./QuizCapitulo4En";
import QuizCapitulo5En from "./QuizCapitulo5En";
import QuizCapitulo6En from "./QuizCapitulo6En";
import QuizCapitulo7En from "./QuizCapitulo7En";
import QuizCapitulo8En from "./QuizCapitulo8En";
import QuizCapitulo9En from "./QuizCapitulo9En";
import QuizCapitulo10En from "./QuizCapitulo10En";
import QuizCapitulo11En from "./QuizCapitulo11En";
import QuizCapitulo12En from "./QuizCapitulo12En";
import QuizCapitulo13En from "./QuizCapitulo13En";
import QuizCapitulo14En from "./QuizCapitulo14En";


export const buildOneOctaveScale = (rawNotes: string[]) => {
  let scale = [...rawNotes];
  if (scale.length === 7) {
    scale.push(scale[0]); 
  } else if (scale.length > 8) {
    scale = scale.slice(0, 8);
  }

  const pitchMap: Record<string, number> = { 'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4, 'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8, 'Ab':8, 'A':9, 'A#':10, 'Bb':10, 'B':11 };
  
  let currentOctave = 3;
  let previousPitch = -1;
  
  return scale.map((noteName) => {
    const cleanNote = noteName.replace(/[0-9]/g, '');
    const currentPitch = pitchMap[cleanNote] ?? 0;
    
    if (currentPitch <= previousPitch && previousPitch !== -1) {
      currentOctave++;
    }
    
    previousPitch = currentPitch;
    
    const safeOctave = currentOctave > 4 ? 4 : currentOctave; 
    
    return `${cleanNote}${safeOctave}`;
  });
};

import QuizCapitulo10 from "./QuizCapitulo10";
import QuizCapitulo11 from "./QuizCapitulo11";
import QuizCapitulo12 from "./QuizCapitulo12";
import QuizCapitulo14 from "./QuizCapitulo14";
import QuizCapitulo13 from "./QuizCapitulo13";
import Capitulo9 from "./Capitulo9";
import Capitulo9En from "./Capitulo9En";
import Capitulo10En from "./Capitulo10En";
import Capitulo11En from "./Capitulo11En";
import Capitulo12En from "./Capitulo12En";
import Capitulo13En from "./Capitulo13En";
import Capitulo14En from "./Capitulo14En";
import Capitulo10 from "./Capitulo10";
import Capitulo11 from "./Capitulo11";
import Capitulo12 from "./Capitulo12";
import Capitulo13 from "./Capitulo13";
import Capitulo14 from "./Capitulo14";

const escalasSostenidos = [
  { t: 'C', c: ['C:Mayor', 'D:Menor', 'E:Menor', 'F:Mayor', 'G:Mayor', 'A:Menor', 'B:dim7'] },
  { t: 'G', c: ['G:Mayor', 'A:Menor', 'B:Menor', 'C:Mayor', 'D:Mayor', 'E:Menor', 'F#:dim7'] },
  { t: 'D', c: ['D:Mayor', 'E:Menor', 'F#:Menor', 'G:Mayor', 'A:Mayor', 'B:Menor', 'C#:dim7'] },
  { t: 'A', c: ['A:Mayor', 'B:Menor', 'C#:Menor', 'D:Mayor', 'E:Mayor', 'F#:Menor', 'G#:dim7'] },
  { t: 'E', c: ['E:Mayor', 'F#:Menor', 'G#:Menor', 'A:Mayor', 'B:Mayor', 'C#:Menor', 'D#:dim7'] },
  { t: 'B', c: ['B:Mayor', 'C#:Menor', 'D#:Menor', 'E:Mayor', 'F#:Mayor', 'G#:Menor', 'A#:dim7'] },
  { t: 'F#', c: ['F#:Mayor', 'G#:Menor', 'A#:Menor', 'B:Mayor', 'C#:Mayor', 'D#:Menor', 'E#:dim7'] }
];

const escalasBemoles = [
  { t: 'F', c: ['F:Mayor', 'G:Menor', 'A:Menor', 'Bb:Mayor', 'C:Mayor', 'D:Menor', 'E:dim7'] },
  { t: 'Bb', c: ['Bb:Mayor', 'C:Menor', 'D:Menor', 'Eb:Mayor', 'F:Mayor', 'G:Menor', 'A:dim7'] },
  { t: 'Eb', c: ['Eb:Mayor', 'F:Menor', 'G:Menor', 'Ab:Mayor', 'Bb:Mayor', 'C:Menor', 'D:dim7'] },
  { t: 'Ab', c: ['Ab:Mayor', 'Bb:Menor', 'C:Menor', 'Db:Mayor', 'Eb:Mayor', 'F:Menor', 'G:dim7'] },
  { t: 'Db', c: ['Db:Mayor', 'Eb:Menor', 'F:Menor', 'Gb:Mayor', 'Ab:Mayor', 'Bb:Menor', 'C:dim7'] },
  { t: 'Gb', c: ['Gb:Mayor', 'Ab:Menor', 'Bb:Menor', 'Cb:Mayor', 'Db:Mayor', 'Eb:Menor', 'F:dim7'] }
];

const Capitulo3Tablas = ({ onAction, type, language }: { onAction: (action: string) => void, type: "sostenidos" | "bemoles", language?: string }) => {
  const isSostenidos = type === 'sostenidos';
  const data = isSostenidos ? escalasSostenidos : escalasBemoles;

  return (
    <div className="w-full mb-6 overflow-hidden rounded-xl border border-slate-700 p-0">
      <table className="w-full table-fixed text-[9px] sm:text-[11px] text-center text-slate-300">
        <thead className="text-[8px] sm:text-[10px] text-white uppercase bg-cyan-600">
          <tr>
            <th className="p-1 sm:p-2 font-bold w-[14%] text-left pl-2">{language === 'en' ? 'DEGREE' : 'GRADO'}</th>
            <th className="p-1 sm:p-2 w-[12%]">I</th>
            <th className="p-1 sm:p-2 w-[12%]">II</th>
            <th className="p-1 sm:p-2 w-[12%]">III</th>
            <th className="p-1 sm:p-2 w-[12%]">IV</th>
            <th className="p-1 sm:p-2 w-[12%]">V</th>
            <th className="p-1 sm:p-2 w-[12%]">VI</th>
            <th className="p-1 sm:p-2 w-[14%]">VII</th>
          </tr>
        </thead>
        <tbody>
          {data.map((fila) => (
            <tr key={fila.t} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-1 sm:p-2 font-bold bg-slate-900 text-cyan-400 border-r border-slate-700 text-left pl-2">{fila.t}</td>
              {fila.c.map((acordeData, i) => {
                const [rootStr, typeStr] = acordeData.split(':');
                // Transform for display: Mayor -> "", Menor -> "m", dim7 -> "dim"
                let display = rootStr;
                if (typeStr === "Menor") display += "m";
                else if (typeStr === "dim7") display += "dim";
                
                const isVGrado = i === 4;

                return (
                  <td key={i} className="p-1 sm:p-2">
                    <a 
                      href={`#action:chord:${rootStr}:${typeStr}`} 
                      onClick={(e) => { e.preventDefault(); onAction(`#action:chord:${rootStr}:${typeStr}`); }} 
                      className={`cursor-pointer hover:underline ${isVGrado ? 'text-orange-500 font-bold hover:text-orange-400' : 'text-slate-300 hover:text-slate-100'}`}
                    >
                      {display}
                    </a>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const acordesSostenidos = [
  { t: 'C', c: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'] },
  { t: 'G', c: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5'] },
  { t: 'D', c: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5'] },
  { t: 'A', c: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5'] },
  { t: 'E', c: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5'] },
  { t: 'B', c: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5'] },
  { t: 'F#', c: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'] }
];

const acordesBemoles = [
  { t: 'F', c: ['Fmaj7', 'Gm7', 'Am7', 'Bbmaj7', 'C7', 'Dm7', 'Em7b5'] },
  { t: 'Bb', c: ['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5'] },
  { t: 'Eb', c: ['Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7', 'Cm7', 'Dm7b5'] },
  { t: 'Ab', c: ['Abmaj7', 'Bbm7', 'Cm7', 'Dbmaj7', 'Eb7', 'Fm7', 'Gm7b5'] },
  { t: 'Db', c: ['Dbmaj7', 'Ebm7', 'Fm7', 'Gbmaj7', 'Ab7', 'Bbm7', 'Cm7b5'] },
  { t: 'Gb', c: ['Gbmaj7', 'Abm7', 'Bbm7', 'Cbmaj7', 'Db7', 'Ebm7', 'Fm7b5'] }
];

const menoresSostenidos = [
  { t: 'A Menor', c: ['Am7', 'Bm7b5', 'Cmaj7', 'Dm7', 'E7', 'Fmaj7', 'G7'] },
  { t: 'E Menor', c: ['Em7', 'F#m7b5', 'Gmaj7', 'Am7', 'B7', 'Cmaj7', 'D7'] },
  { t: 'B Menor', c: ['Bm7', 'C#m7b5', 'Dmaj7', 'Em7', 'F#7', 'Gmaj7', 'A7'] },
  { t: 'F# Menor', c: ['F#m7', 'G#m7b5', 'Amaj7', 'Bm7', 'C#7', 'Dmaj7', 'E7'] },
  { t: 'C# Menor', c: ['C#m7', 'D#m7b5', 'Emaj7', 'F#m7', 'G#7', 'Amaj7', 'B7'] },
  { t: 'G# Menor', c: ['G#m7', 'A#m7b5', 'Bmaj7', 'C#m7', 'D#7', 'Emaj7', 'F#7'] },
  { t: 'D# Menor', c: ['D#m7', 'E#m7b5', 'F#maj7', 'G#m7', 'A#7', 'Bmaj7', 'C#7'] }
];

const menoresBemoles = [
  { t: 'D Menor', c: ['Dm7', 'Em7b5', 'Fmaj7', 'Gm7', 'A7', 'Bbmaj7', 'C7'] },
  { t: 'G Menor', c: ['Gm7', 'Am7b5', 'Bbmaj7', 'Cm7', 'D7', 'Ebmaj7', 'F7'] },
  { t: 'C Menor', c: ['Cm7', 'Dm7b5', 'Ebmaj7', 'Fm7', 'G7', 'Abmaj7', 'Bb7'] },
  { t: 'F Menor', c: ['Fm7', 'Gm7b5', 'Abmaj7', 'Bbm7', 'C7', 'Dbmaj7', 'Eb7'] },
  { t: 'Bb Menor', c: ['Bbm7', 'Cm7b5', 'Dbmaj7', 'Ebm7', 'F7', 'Gbmaj7', 'Ab7'] },
  { t: 'Eb Menor', c: ['Ebm7', 'Fm7b5', 'Gbmaj7', 'Abm7', 'Bb7', 'Cbmaj7', 'Db7'] }
];

const Capitulo7Tablas = ({ onAction, type, language }: { onAction: (action: string) => void, type: 'sostenidos' | 'bemoles', language?: string }) => {
  const isSostenidos = type === 'sostenidos';
  const data = isSostenidos ? menoresSostenidos : menoresBemoles;

  return (
    <div className="w-full mb-6 overflow-hidden rounded-xl border border-slate-700 p-0">
      <table className="w-full table-fixed text-[9px] sm:text-[11px] text-center text-slate-300">
        <thead className="text-[8px] sm:text-[10px] text-white uppercase bg-cyan-600">
          <tr>
            <th className="p-1 sm:p-2 font-bold w-[14%] text-left pl-2">{language === 'en' ? 'Scale' : 'Escala'}</th>
            <th className="p-1 sm:p-2 w-[10%]">i</th>
            <th className="p-1 sm:p-2 w-[16%]">ii°</th>
            <th className="p-1 sm:p-2 w-[14%]">III</th>
            <th className="p-1 sm:p-2 w-[11%]">iv</th>
            <th className="p-1 sm:p-2 w-[10%]">V</th>
            <th className="p-1 sm:p-2 w-[14%]">VI</th>
            <th className="p-1 sm:p-2 w-[11%]">VII</th>
          </tr>
        </thead>
        <tbody>
          {data.map((fila) => (
            <tr key={fila.t} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="p-1 sm:p-2 font-bold bg-slate-900 text-cyan-400 border-r border-slate-700 text-left pl-2">{fila.t}</td>
              {fila.c.map((acorde, i) => {
                let rootMatch = acorde.match(/^[A-G](#|b)?/);
                let rootStr = rootMatch ? rootMatch[0] : "";
                let typeStr = acorde.substring(rootStr.length);
                
                // V grado en este curso es dominante (E7), pintar de naranja
                const isVGrado = i === 4; 
                
                return (
                  <td key={i} className="p-1 sm:p-2">
                    <a 
                      href={`#action:chord:${rootStr}:${typeStr}`} 
                      onClick={(e) => { e.preventDefault(); onAction(`#action:chord:${rootStr}:${typeStr}`); }} 
                      className={`cursor-pointer hover:underline ${isVGrado ? 'text-orange-500 font-bold hover:text-orange-400' : 'text-slate-300 hover:text-slate-100'}`}
                    >
                      {acorde}
                    </a>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Capitulo4Tablas = ({ onAction, language }: { onAction: (action: string) => void, language?: string }) => {
  return (
    <>
      <h4 className="text-sm font-semibold text-white mb-2 mt-4">{language === 'en' ? 'Major Scales with Sharps (#)' : 'Escalas Mayores con Sostenidos (#)'}</h4>
      <div className="w-full mb-6 overflow-hidden rounded-xl border border-slate-700 p-0">
        <table className="w-full table-fixed text-[9px] sm:text-[11px] text-center text-slate-300">
          <thead className="text-[8px] sm:text-[10px] text-white uppercase bg-cyan-600">
            <tr>
              <th className="p-1 sm:p-2 font-bold w-[14%] text-left pl-2">{language === 'en' ? 'DEGREE' : 'GRADO'}</th>
              <th className="p-1 sm:p-2 w-[14%]">I</th>
              <th className="p-1 sm:p-2 w-[11%]">II</th>
              <th className="p-1 sm:p-2 w-[11%]">III</th>
              <th className="p-1 sm:p-2 w-[14%]">IV</th>
              <th className="p-1 sm:p-2 w-[10%]">V</th>
              <th className="p-1 sm:p-2 w-[11%]">VI</th>
              <th className="p-1 sm:p-2 w-[15%]">VII</th>
            </tr>
          </thead>
          <tbody>
            {acordesSostenidos.map((fila) => (
              <tr key={fila.t} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="p-1 sm:p-2 font-bold bg-slate-900 text-cyan-400 border-r border-slate-700 text-left pl-2">{fila.t}</td>
                {fila.c.map((acorde, i) => {
                  let rootMatch = acorde.match(/^[A-G](#|b)?/);
                  let rootStr = rootMatch ? rootMatch[0] : fila.t;
                  let typeStr = acorde.substring(rootStr.length);
                  
                  const isVGrado = i === 4;

                  return (
                    <td key={i} className="p-1 sm:p-2">
                      <a 
                        href={`#action:chord:${rootStr}:${typeStr}`} 
                        onClick={(e) => { e.preventDefault(); onAction(`#action:chord:${rootStr}:${typeStr}`); }} 
                        className={`cursor-pointer hover:underline ${isVGrado ? 'text-orange-500 font-bold hover:text-orange-400' : 'text-slate-300 hover:text-slate-100'}`}
                      >
                        {acorde}
                      </a>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-sm font-semibold text-white mb-2">{language === 'en' ? 'Major Scales with Flats (b)' : 'Escalas Mayores con Bemoles (b)'}</h4>
      <div className="w-full mb-2 overflow-hidden rounded-xl border border-slate-700 p-0">
        <table className="w-full table-fixed text-[9px] sm:text-[11px] text-center text-slate-300">
          <thead className="text-[8px] sm:text-[10px] text-white uppercase bg-cyan-600">
            <tr>
              <th className="p-1 sm:p-2 font-bold w-[14%] text-left pl-2">{language === 'en' ? 'DEGREE' : 'GRADO'}</th>
              <th className="p-1 sm:p-2 w-[14%]">I</th>
              <th className="p-1 sm:p-2 w-[11%]">II</th>
              <th className="p-1 sm:p-2 w-[11%]">III</th>
              <th className="p-1 sm:p-2 w-[14%]">IV</th>
              <th className="p-1 sm:p-2 w-[10%]">V</th>
              <th className="p-1 sm:p-2 w-[11%]">VI</th>
              <th className="p-1 sm:p-2 w-[15%]">VII</th>
            </tr>
          </thead>
          <tbody>
            {acordesBemoles.map((fila) => (
              <tr key={fila.t} className="border-b border-slate-700 hover:bg-slate-700/30">
                <td className="p-1 sm:p-2 font-bold bg-slate-900 text-cyan-400 border-r border-slate-700 text-left pl-2">{fila.t}</td>
                {fila.c.map((acorde, i) => {
                  let rootMatch = acorde.match(/^[A-G](#|b)?/);
                  let rootStr = rootMatch ? rootMatch[0] : fila.t;
                  let typeStr = acorde.substring(rootStr.length);
                  
                  const isVGrado = i === 4;

                  return (
                    <td key={i} className="p-1 sm:p-2">
                      <a 
                        href={`#action:chord:${rootStr}:${typeStr}`} 
                        onClick={(e) => { e.preventDefault(); onAction(`#action:chord:${rootStr}:${typeStr}`); }} 
                        className={`cursor-pointer hover:underline ${isVGrado ? 'text-orange-500 font-bold hover:text-orange-400' : 'text-slate-300 hover:text-slate-100'}`}
                      >
                        {acorde}
                      </a>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

type VisualizerData = {
  type: "chord" | "interval" | "scale" | "empty";
  root?: string;
  note?: string;
  chordType?: string;
  scaleName?: string;
  triadShape?: { string: number, fret: number, label: string, finger?: number }[];
  fingersOverride?: (number | null)[];
  barres?: { fret: number, stringFrom: number, stringTo: number }[];
  isArpeggio?: boolean;
  intervals?: number[];
  notes?: string[];
  positions?: (number | null)[];
  title?: string;
  forceBaseFret?: number;
  autoPlayTrigger?: number;
};

const INVERSION_SHAPES: Record<string, { 
  positions: number[], 
  fingersOverride?: (number | null)[], 
  title: string, 
  rootNote: string, 
  chordType: string,
  forceBaseFret?: number,
  triadShape?: { string: number, fret: number, label: string, finger?: number }[],
  barres?: { fret: number, stringFrom: number, stringTo: number }[]
}> = {
  "C/E": {
    positions: [-1, -1, 2, 0, 1, -1],
    fingersOverride: [null, null, 2, null, 1, null],
    title: "C/E (1ª Inversión - Tríada)",
    rootNote: "C",
    chordType: "Mayor",
    forceBaseFret: 1,
    triadShape: [
      { string: 4, fret: 2, label: "Bajo" },
      { string: 3, fret: 0, label: "G" },
      { string: 2, fret: 1, label: "C" }
    ]
  },
  "C/G": {
    positions: [-1, -1, 5, 5, 5, -1],
    fingersOverride: [null, null, 1, 1, 1, null],
    title: "C/G (2ª Inversión - Tríada)",
    rootNote: "C",
    chordType: "Mayor",
    forceBaseFret: 5,
    triadShape: [
      { string: 4, fret: 5, label: "Bajo" },
      { string: 3, fret: 5, label: "C" },
      { string: 2, fret: 5, label: "E" }
    ]
  },
  "Cmaj7/E": {
    positions: [-1, -1, 2, 4, 1, 3],
    fingersOverride: [null, null, 2, 4, 1, 3],
    title: "Cmaj7/E (1ª Inversión - Drop 2)",
    rootNote: "C",
    chordType: "maj7",
    forceBaseFret: 1,
    triadShape: [
      { string: 4, fret: 2, label: "Bajo" },
      { string: 3, fret: 4, label: "B" },
      { string: 2, fret: 1, label: "C" },
      { string: 1, fret: 3, label: "G" }
    ]
  },
  "Cmaj7/G": {
    positions: [-1, -1, 5, 5, 5, 7],
    fingersOverride: [null, null, 1, 1, 1, 3],
    title: "Cmaj7/G (2ª Inversión - Drop 2)",
    rootNote: "C",
    chordType: "maj7",
    forceBaseFret: 5,
    triadShape: [
      { string: 4, fret: 5, label: "Bajo" },
      { string: 3, fret: 5, label: "C" },
      { string: 2, fret: 5, label: "E" },
      { string: 1, fret: 7, label: "B" }
    ]
  },
  "Cmaj7/B": {
    positions: [-1, -1, 9, 9, 8, 8],
    fingersOverride: [null, null, 3, 4, 1, 2],
    title: "Cmaj7/B (3ª Inversión - Drop 2)",
    rootNote: "C",
    chordType: "maj7",
    forceBaseFret: 7,
    triadShape: [
      { string: 4, fret: 9, label: "Bajo" },
      { string: 3, fret: 9, label: "E" },
      { string: 2, fret: 8, label: "G" },
      { string: 1, fret: 8, label: "C" }
    ]
  },
  "G/B": {
    positions: [-1, 2, 0, 0, 3, 3],
    fingersOverride: [null, 1, null, null, 3, 4],
    title: "G/B (1ª Inversión)",
    rootNote: "G",
    chordType: "Mayor"
  },
  "F/A": {
    positions: [-1, 0, 3, 2, 1, 1],
    fingersOverride: [null, null, 3, 2, 1, 1],
    title: "F/A (1ª Inversión)",
    rootNote: "F",
    chordType: "Mayor"
  }
};

export default function HarmonyTheory() {
  const { t, language } = useLanguage();
  const { instrument, setInstrument } = useInstrument();
  const curriculum = (language === 'en' && englishData.length > 0) ? englishData : harmonyCurriculumPart1;
  const [activeChapterId, setActiveChapterId] = useState<string>(
    curriculum[0].id,
  );
  const activeChapter =
    curriculum.find((c) => c.id === activeChapterId) ||
    curriculum[0];

  const [activeTab, setActiveTab] = useState<"theory" | "quiz">("theory");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [visualizerData, setVisualizerData] = useState<VisualizerData>({
    type: "empty",
  });
  const [showGlobalMap, setShowGlobalMap] = useState<boolean>(false);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number | null>(null);
  const playbackRef = useRef<number | null>(null);
  const progressionRef = useRef<number | null>(null);
  const melodyRef = useRef<number | null>(null);
  const [academyKeyboardMode, setAcademyKeyboardMode] = useState<KeyboardVoicingMode>('fundamental');
  const [isSensoryModalOpen, setIsSensoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveSequenceIndex(null);
    if (playbackRef.current !== null) {
      clearInterval(playbackRef.current);
      playbackRef.current = null;
    }
  }, [visualizerData]);

  // Sincronización de Balance de Ganancia Condicional (Gain Staging) en Linus Academia
  useEffect(() => {
    const targetInst = instrument === "piano" ? "piano" : "guitar";
    academiaAudio.setInstrument(targetInst);
  }, [instrument]);

  const checkQuizAnswer = (index: number) => {
    if (quizFeedback) return;
    setSelectedAnswer(index);
    if (index === activeChapter.quiz[quizIndex].correctAnswerIndex) {
      setQuizFeedback("correct");
      setTimeout(() => {
        if (quizIndex < activeChapter.quiz.length - 1) {
          setQuizIndex(quizIndex + 1);
        }
        setQuizFeedback(null);
        setSelectedAnswer(null);
      }, 1500);
    } else {
      setQuizFeedback("incorrect");
      setTimeout(() => {
        setQuizFeedback(null);
        setSelectedAnswer(null);
      }, 1200);
    }
  };

  const getIsolatedIntervalShapeData = (root: string, note: string) => {
    const cRoot = { stringIdx: 1, fret: 3, label: "C" };
    if (root !== "C") return [cRoot];

    switch (note) {
      case "C":
        return [cRoot, { stringIdx: 3, fret: 5, label: "C" }]; // Octava
      case "C#":
        return [cRoot, { stringIdx: 1, fret: 4, label: "C#" }];
      case "D":
        return [cRoot, { stringIdx: 1, fret: 5, label: "D" }];
      case "D#":
        return [cRoot, { stringIdx: 2, fret: 1, label: "D#" }];
      case "E":
        return [cRoot, { stringIdx: 2, fret: 2, label: "E" }];
      case "F":
        return [cRoot, { stringIdx: 2, fret: 3, label: "F" }];
      case "F#":
        return [cRoot, { stringIdx: 2, fret: 4, label: "F#" }];
      case "G":
        return [cRoot, { stringIdx: 2, fret: 5, label: "G" }];
      case "G#":
        return [cRoot, { stringIdx: 3, fret: 1, label: "G#" }];
      case "A":
        return [cRoot, { stringIdx: 3, fret: 2, label: "A" }];
      case "A#":
        return [cRoot, { stringIdx: 3, fret: 3, label: "A#" }];
      case "B":
        return [cRoot, { stringIdx: 3, fret: 4, label: "B" }];
      default:
        return [cRoot];
    }
  };

  const handleActionLink = (href: string) => {
    if (progressionRef.current) {
        clearTimeout(progressionRef.current);
        progressionRef.current = null;
    }
    let cleanHref = href.replace("#action:", "");
    try {
      cleanHref = decodeURIComponent(cleanHref);
    } catch(e) {}
    
    const parts = cleanHref.split(":");
    let type = parts[0] as "chord" | "interval" | "scale" | "arpeggio" | "note" | "standard" | "progression" | "stop" | "melody" | "combined";
    const root = parts[1];

    if (type === "stop") {
      if (progressionRef.current) {
         clearTimeout(progressionRef.current);
         progressionRef.current = null;
      }
      if (playbackRef.current) {
         clearInterval(playbackRef.current);
         playbackRef.current = null;
      }
      if (melodyRef.current) {
         clearTimeout(melodyRef.current);
         melodyRef.current = null;
      }
      academiaAudio.stopAll();
      setActiveSequenceIndex(null);
      return;
    }

    if (type === "progression" || type === "melody" || type === "combined") {
      let chordsStr = "";
      let melodyStr = "";
      let instType = "sine";
      
      if (type === "progression") {
          chordsStr = parts[1];
      } else if (type === "melody") {
          const params = cleanHref.replace("melody:", "").split(";");
          melodyStr = params[0];
          for (const p of params) {
              if (p.startsWith("inst=")) {
                  const inst = p.replace("inst=", "");
                  if (inst === "sax" || inst === "lead") instType = "triangle";
              }
          }
      } else if (type === "combined") {
          const combinedParts = cleanHref.replace("combined:", "").split(";");
          for (const p of combinedParts) {
              if (p.startsWith("progression=")) chordsStr = p.replace("progression=", "");
              if (p.startsWith("melody=")) melodyStr = p.replace("melody=", "");
              if (p.startsWith("inst=")) {
                  const inst = p.replace("inst=", "");
                  if (inst === "sax" || inst === "lead") instType = "triangle";
              }
          }
      }

      const bpm = 85;
      const measureMs = (60000 / bpm) * 4; // ~2824ms
      const halfMeasureMs = measureMs / 2; // ~1412ms

      if (chordsStr) {
          const chordList = chordsStr.split(",");
          const schedule: { raw: string; r: string; cType: string; durationMs: number }[] = [];
          chordList.forEach(chord => {
            if (chord.includes("_")) {
               const [chord1, chord2] = chord.split("_");
               const parsed1 = parseChord(chord1);
               const parsed2 = parseChord(chord2);
               schedule.push({ raw: chord1, r: parsed1.root, cType: parsed1.type, durationMs: halfMeasureMs });
               schedule.push({ raw: chord2, r: parsed2.root, cType: parsed2.type, durationMs: halfMeasureMs });
            } else {
               const parsed = parseChord(chord);
               schedule.push({ raw: chord, r: parsed.root, cType: parsed.type, durationMs: measureMs });
            }
          });
          
          let index = 0;
          const playNextChord = () => {
             if (index >= schedule.length) {
                if (progressionRef.current) clearTimeout(progressionRef.current);
                progressionRef.current = null;
                return;
             }
             
             const chord = schedule[index];
             setVisualizerData({ type: "chord", root: chord.r, chordType: chord.cType, isArpeggio: false });
             
             // Obtener arreglo completo de notas y frecuencias desde el Diccionario Maestro
             let freqs: number[] = [];
             if (instrument === "guitar") {
                 const voicings = getGuitarChordVoicings(chord.r as any, chord.cType as any);
                 if (voicings && voicings.length > 0) {
                     freqs = getGuitarChordFrequencies(voicings[0].frets);
                 }
             }
             if (!freqs || freqs.length === 0) {
                 const midiNotes = getChordNotes(chord.raw || `${chord.r}${chord.cType}`, 48);
                 freqs = midiNotes.map(m => 440 * Math.pow(2, (m - 69) / 12));
             }

             if (freqs.length > 0) {
                 const targetInst = instrument === "piano" ? "piano" : "guitar";
                 // Reproducción limpia a través del filtro pasa-altos @ 180Hz y transpuesta a registro medio
                 academiaAudio.playChord(freqs, targetInst, { strumDelay: targetInst === "piano" ? 0.016 : 0.045 });
             }

             // Acompañar con fundamental limpia en registro medio (octava 3), filtrada por High-Pass 180Hz
             if (chord.r) {
                 const rootOffset = (ROOT_MIDI_OFFSET_MAP as any)[chord.r] ?? 0;
                 const bassMidi = 48 + rootOffset; // Octava 3 (registro medio) en lugar de octava 2 (36)
                 academiaAudio.playBassNote(bassMidi, chord.durationMs / 1000, 0.45);
             }

             progressionRef.current = setTimeout(playNextChord, chord.durationMs) as any;
             index++;
          };
          
          playNextChord();
      }

      if (melodyStr) {
          const notes = melodyStr.split(",");
          let melodyIndex = 0;

          const playNextNote = () => {
              if (melodyIndex >= notes.length) {
                  if (melodyRef.current) clearTimeout(melodyRef.current);
                  melodyRef.current = null;
                  return;
              }
              const noteStr = notes[melodyIndex];
              const match = noteStr.match(/^([A-G][b#]?)([0-9])(?::([0-9.]+))?$/);
              let currentNoteDuration = measureMs / 4; // Default to 1 beat (quarter note)
              
              if (match) {
                  const n = match[1];
                  const oct = parseInt(match[2], 10);
                  if (match[3]) {
                      currentNoteDuration = parseFloat(match[3]) * (measureMs / 4);
                  }
                  const map: Record<string, number> = {
                      C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11
                  };
                  const midi = map[n] + (oct + 1) * 12;
                  const freq = 440 * Math.pow(2, (midi - 69) / 12);
                  const targetInst = instrument === "piano" ? "piano" : "guitar";
                  academiaAudio.playSingleNote(freq, targetInst);
              }
              melodyRef.current = setTimeout(playNextNote, currentNoteDuration) as any;
              melodyIndex++;
          };
          playNextNote();
      }

      return;
    }

    if (type === "standard") {
      sessionStorage.setItem("initialStandard", root);
      window.dispatchEvent(new CustomEvent("selectStandard", { detail: root }));
      window.dispatchEvent(new CustomEvent("navigateTab", { detail: "standards" }));
      return;
    }

    if (type === "arpeggio") {
      const rootNote = root as RootNote;
      const cType = parts[2];
      
      let intervals = [0, 4, 7];
      if (cType === "Mayor" || cType === "maj") intervals = [0, 4, 7];
      else if (cType === "Menor" || cType === "m") intervals = [0, 3, 7];
      else if (cType === "maj7") intervals = [0, 4, 7, 11];
      else if (cType === "m7") intervals = [0, 3, 7, 10];
      else if (cType === "7") intervals = [0, 4, 7, 10];
      else if (cType === "m7b5") intervals = [0, 3, 6, 10];
      else if (cType === "dim7") intervals = [0, 3, 6, 9];
      else if (cType === "aug") intervals = [0, 4, 8];

      const scaleName = `Arpegio ${rootNote} ${cType}`;
      const notes = intervals.map((interval) =>
        transposeRoot(rootNote, interval, rootNote),
      );

      setVisualizerData({
        type: "scale",
        root: rootNote,
        scaleName,
        isArpeggio: true,
        intervals,
        notes,
      });
      return;
    }

    if (type === "interval") {
      setVisualizerData({ type, root, note: parts[2] });
    } else if (type === "chord") {
      if (INVERSION_SHAPES[root]) {
        const chordData = INVERSION_SHAPES[root];
        setVisualizerData({
          type: "chord",
          root: chordData.rootNote,
          chordType: chordData.chordType,
          title: chordData.title,
          positions: chordData.positions,
          fingersOverride: chordData.fingersOverride,
          isArpeggio: false,
          forceBaseFret: chordData.forceBaseFret,
          triadShape: chordData.triadShape,
          barres: chordData.barres
        });
        return;
      }

      let triadShape = undefined;
      let fingersOverride = undefined;
      
      if (activeChapterId === "capitulo_2" && parts.length >= 3) {
        const rootNote = parts[1];
        const cType = parts[2] as "Mayor" | "Menor" | "dim7" | "aug";
        
        const rootFretMap: Record<string, number> = { 
          "G": 12, "G#": 13, "Ab": 13, "A": 14, "A#": 15, "Bb": 15, 
          "B": 4, "C": 5, "C#": 6, "Db": 6, "D": 7, "D#": 8, "Eb": 8, 
          "E": 9, "E#": 10, "F": 10, "F#": 11, "Gb": 11 
        };
        const rootFret = rootFretMap[rootNote] !== undefined ? rootFretMap[rootNote] : 5;
        
        const dynamicTriadShapes: Record<string, {string: number, fret: number, label: string}[]> = {
          "Mayor": [{ string: 3, fret: rootFret, label: '1' }, { string: 2, fret: rootFret, label: '3' }, { string: 1, fret: rootFret - 2, label: '5' }],
          "Menor": [{ string: 3, fret: rootFret, label: '1' }, { string: 2, fret: rootFret - 1, label: 'b3' }, { string: 1, fret: rootFret - 2, label: '5' }],
          "dim7": [{ string: 3, fret: rootFret, label: '1' }, { string: 2, fret: rootFret - 1, label: 'b3' }, { string: 1, fret: rootFret - 3, label: 'b5' }],
          "aug": [{ string: 3, fret: rootFret, label: '1' }, { string: 2, fret: rootFret, label: '3' }, { string: 1, fret: rootFret - 1, label: '#5' }]
        };
        
        const chapter2Fingers: Record<string, (number | null)[]> = {
          "Mayor": [null, null, null, 2, 3, 1],
          "Menor": [null, null, null, 3, 2, 1],
          "dim7": [null, null, null, 3, 2, 1],
          "aug": [null, null, null, 2, 3, 1]
        };
        
        if (dynamicTriadShapes[cType]) {
           triadShape = dynamicTriadShapes[cType];
           fingersOverride = chapter2Fingers[cType];
        }
      }
      let cType = parts[2];
      let r = root;
      if (!cType) {
         const match = r.match(/^([A-G][b#]?)(.*)$/);
         if (match) {
             r = match[1];
             cType = match[2];
             if (!cType) cType = "Mayor";
             if (cType === "m") cType = "Menor";
             if (cType === "m7(b5)") cType = "m7b5";
             if (cType === "7alt") cType = "alt";
             if (cType === "7(#9)") cType = "7#9";
             if (cType === "7(#11)") cType = "7#11";
         }
      }
      setVisualizerData({ type: "chord", root: r, chordType: cType, triadShape, fingersOverride, isArpeggio: false });
    } else if (type === "scale") {
      let intervals = [0, 2, 4, 5, 7, 9, 11]; // Jónica default
      const sName = parts[2] || "Mayor";
      
      if (sName === "Dórica" || sName === "Dórico") intervals = [0, 2, 3, 5, 7, 9, 10];
      else if (sName === "Frigia" || sName === "Frigio") intervals = [0, 1, 3, 5, 7, 8, 10];
      else if (sName === "Lidia" || sName === "Lidio") intervals = [0, 2, 4, 6, 7, 9, 11];
      else if (sName === "Mixolidia" || sName === "Mixolidio") intervals = [0, 2, 4, 5, 7, 9, 10];
      else if (sName === "Eólica" || sName === "Eólico" || sName === "Menor") intervals = [0, 2, 3, 5, 7, 8, 10];
      else if (sName === "Menor Armónica" || sName === "Armónica") intervals = [0, 2, 3, 5, 7, 8, 11];
      else if (sName === "Menor Melódica" || sName === "Melódica") intervals = [0, 2, 3, 5, 7, 9, 11];
      else if (sName === "Locria" || sName === "Lócrio") intervals = [0, 1, 3, 5, 6, 8, 10];
      else if (sName === "Locrio 6") intervals = [0, 1, 3, 5, 6, 9, 10];
      else if (sName === "Jónico Aumentado") intervals = [0, 2, 4, 5, 8, 9, 11];
      else if (sName === "Dórico #4") intervals = [0, 2, 3, 6, 7, 9, 10];
      else if (sName === "Mixolidio b9 b13") intervals = [0, 1, 4, 5, 7, 8, 10];
      else if (sName === "Lidio #2") intervals = [0, 3, 4, 6, 7, 9, 10];
      else if (sName === "Superlocrio") intervals = [0, 1, 3, 4, 6, 8, 9];
      else if (sName === "Dórico b2") intervals = [0, 1, 3, 5, 7, 9, 10];
      else if (sName === "Lidio Aumentado") intervals = [0, 2, 4, 6, 8, 9, 11];
      else if (sName === "Lidio b7") intervals = [0, 2, 4, 6, 7, 9, 10];
      else if (sName === "Mixolidio b13") intervals = [0, 2, 4, 5, 7, 8, 10];
      else if (sName === "Locrio natural 2") intervals = [0, 2, 3, 5, 6, 8, 10];
      else if (sName === "Alterado") intervals = [0, 1, 3, 4, 6, 8, 10];

      const notes = intervals.map((interval) =>
        transposeRoot(root as RootNote, interval, root as RootNote)
      );

      setVisualizerData({ type: "scale", root, scaleName: sName, notes, intervals, autoPlayTrigger: Date.now() });
    } else if (type === "note") {
      setVisualizerData({ type: "scale", root, scaleName: root, notes: [root], intervals: [0], autoPlayTrigger: Date.now() });
    }
  };

  const handlePlaySound = () => {
    if (
      visualizerData.type === "chord" &&
      visualizerData.root &&
      visualizerData.chordType
    ) {
      // Clear any pending playback
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
        playbackRef.current = null;
      }
      setActiveSequenceIndex(null);

      let freqs: number[] = [];
      if (visualizerData.triadShape) {
        const tuningNotes = [40, 45, 50, 55, 59, 64];
        freqs = visualizerData.triadShape
          .sort((a, b) => (6 - a.string) - (6 - b.string))
          .map(n => 440 * Math.pow(2, (tuningNotes[6 - n.string] + n.fret - 69) / 12));
      } else if (visualizerData.positions) {
        freqs = getGuitarChordFrequencies(visualizerData.positions);
      } else {
        const voicings = getGuitarChordVoicings(
          visualizerData.root as any,
          visualizerData.chordType as any,
        );
        if (voicings && voicings.length > 0) {
          freqs = getGuitarChordFrequencies(voicings[0].frets);
        }
      }

      if (freqs.length > 0) {
        const targetInst = instrument === "piano" ? "piano" : "guitar";
        if (visualizerData.isArpeggio) {
          academiaAudio.playChord(freqs, targetInst, { strumDelay: 0.5 });
          
          let count = 0;
          const seqLength = freqs.length;
          
          // First note starts immediately
          setActiveSequenceIndex(1);
          count++;
          
          playbackRef.current = setInterval(() => {
            if (count < seqLength) {
              setActiveSequenceIndex(count + 1);
              count++;
            } else {
              setActiveSequenceIndex(null);
              if (playbackRef.current) clearInterval(playbackRef.current);
            }
          }, 500) as any;
        } else {
          academiaAudio.playChord(freqs, targetInst, { strumDelay: targetInst === "piano" ? 0.016 : 0.045 });
        }
      }
    }
    // For intervals and scales, ideally we'd play individual notes, but passing for now for simplicity
  };

  const currentQuiz = activeChapter.quiz[quizIndex];

  const renderSensoryVisualizer = (isExpandedView: boolean) => {
    if (visualizerData.type === "empty") {
      if (!isExpandedView) {
        return (
          <div className="text-center py-8 px-4 border border-dashed border-neutral-800 rounded-lg text-neutral-400 text-xs sm:text-sm w-full">
            {t('academy.syncInstruction')}
          </div>
        );
      }
      // En vista ampliada (Pop-up), si aún no se ha seleccionado un ejemplo del texto, mostrar el instrumento panorámico completo en Do Mayor
      return (
        <div className="w-full flex flex-col gap-4">
          <div className="text-center py-2.5 px-4 bg-neutral-950/80 border border-neutral-800 rounded-lg text-neutral-300 text-xs sm:text-sm">
            {t('academy.syncInstruction')}
          </div>
          {instrument === 'piano' ? (
            <ChordDictionary
              defaultRoot="C"
              defaultType="maj7"
              hideControls={true}
              voicingMode={academyKeyboardMode}
              onVoicingModeChange={setAcademyKeyboardMode}
              isExpanded={true}
            />
          ) : (
            <ScaleFretboard
              scaleName="C Mayor"
              root="C"
              notes={["C", "D", "E", "F", "G", "A", "B"]}
              isExpanded={true}
            />
          )}
        </div>
      );
    }

    if (
      visualizerData.type === "chord" &&
      visualizerData.root &&
      visualizerData.chordType
    ) {
      const cDef =
        CHORD_DEFINITIONS[visualizerData.chordType as keyof typeof CHORD_DEFINITIONS] ||
        CHORD_DEFINITIONS["Mayor"];
      const isExplicitInvTitle = Boolean(
        visualizerData.title &&
          (visualizerData.title.includes("1ª Inversión") ||
            visualizerData.title.includes("2ª Inversión") ||
            visualizerData.title.includes("3ª Inversión"))
      );
      const resolvedKb = resolveKeyboardVoicingData(
        visualizerData.root as RootNote,
        visualizerData.chordType,
        isExplicitInvTitle
          ? visualizerData.title?.includes("1ª Inversión")
            ? "inv1"
            : visualizerData.title?.includes("2ª Inversión")
              ? "inv2"
              : "inv3"
          : academyKeyboardMode
      );

      return (
        <div className="w-full transform transition-all animate-in fade-in zoom-in-95 duration-300 flex flex-col">
          {visualizerData.triadShape || visualizerData.positions || visualizerData.isArpeggio ? (
            <div className="w-full flex flex-col">
              {instrument === "piano" ? (
                <ChordPianoKeyboard
                  root={visualizerData.root as any}
                  type={visualizerData.chordType as any}
                  title={
                    visualizerData.title ||
                    (visualizerData.isArpeggio
                      ? `Arpegio ${visualizerData.root} ${visualizerData.chordType}`
                      : `${visualizerData.root} ${visualizerData.chordType}`)
                  }
                  subtitle={resolvedKb.subtitle}
                  positions={visualizerData.positions}
                  activeSequenceIndex={activeSequenceIndex}
                  onPlay={visualizerData.isArpeggio ? handlePlaySound : undefined}
                  playLabel={
                    visualizerData.isArpeggio ? t("academy.playArpeggio") : t("academy.playChord")
                  }
                  voicingMode={academyKeyboardMode}
                  onVoicingModeChange={setAcademyKeyboardMode}
                  showVoicingSelector={!visualizerData.isArpeggio && !isExplicitInvTitle}
                  isExpanded={isExpandedView}
                />
              ) : (
                <ChordFretboard
                  root={visualizerData.root as any}
                  type={visualizerData.chordType as any}
                  title={
                    visualizerData.title ||
                    (visualizerData.isArpeggio
                      ? `Arpegio ${visualizerData.root} ${visualizerData.chordType}`
                      : `${visualizerData.root} ${visualizerData.chordType}`)
                  }
                  triadShape={visualizerData.triadShape}
                  fingersOverride={visualizerData.fingersOverride}
                  positions={visualizerData.positions}
                  showFretNumbers={
                    !visualizerData.triadShape ||
                    activeChapterId === "capitulo_2" ||
                    activeChapterId === "capitulo_3" ||
                    activeChapterId === "capitulo_6" ||
                    !!visualizerData.positions
                  }
                  showIntervalLabels={false}
                  showFingerings={!!visualizerData.positions}
                  isArpeggio={visualizerData.isArpeggio}
                  activeSequenceIndex={activeSequenceIndex}
                  forceBaseFret={visualizerData.forceBaseFret}
                  barres={visualizerData.barres}
                  onPlay={handlePlaySound}
                  playLabel={
                    visualizerData.isArpeggio ? t("academy.playArpeggio") : t("academy.playChord")
                  }
                  isExpanded={isExpandedView}
                />
              )}

              {/* Tarjetas de Metadatos: CLASIFICACIÓN y GRADOS */}
              <div className="w-full mt-2.5 grid grid-cols-2 gap-2">
                <div className="bg-neutral-900 border border-neutral-800 py-2 px-3 rounded-lg flex flex-col gap-0.5 min-w-0">
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-mono leading-tight">
                    {t("chords.classification")}
                  </span>
                  <span className="text-neutral-200 font-sans text-xs sm:text-sm font-semibold leading-snug break-words">
                    {cDef.suffix}
                  </span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 py-2 px-3 rounded-lg flex flex-col gap-0.5 min-w-0">
                  <span className="text-neutral-400 text-[10px] uppercase tracking-wider font-mono leading-tight">
                    {t("chords.degrees")}
                  </span>
                  <span className="text-neutral-200 font-sans text-xs sm:text-sm font-semibold leading-snug break-words">
                    {instrument === "piano"
                      ? resolvedKb.degreesDisplay
                      : cDef.chordFormula.split("-").join(" - ")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <ChordDictionary
              defaultRoot={visualizerData.root as RootNote}
              defaultType={visualizerData.chordType as any}
              hideControls={true}
              hideTitle={visualizerData.title ? true : false}
              forceBaseFret={visualizerData.forceBaseFret}
              onPlay={handlePlaySound}
              playLabel={
                visualizerData.isArpeggio ? t("academy.playArpeggio") : t("academy.playChord")
              }
              voicingMode={academyKeyboardMode}
              onVoicingModeChange={setAcademyKeyboardMode}
              isExpanded={isExpandedView}
            />
          )}
        </div>
      );
    }

    if (
      visualizerData.type === "interval" &&
      visualizerData.root &&
      visualizerData.note
    ) {
      const intervalNotes = getIsolatedIntervalShapeData(
        visualizerData.root,
        visualizerData.note
      );
      return (
        <div className="w-full transform transition-all animate-in fade-in zoom-in-95 duration-300 flex flex-col">
          {instrument === "piano" ? (
            <IntervalPianoKeyboard
              intervalName={visualizerData.note}
              notes={intervalNotes}
              isExpanded={isExpandedView}
            />
          ) : (
            <IntervalFretboard
              intervalName={visualizerData.note}
              notes={intervalNotes}
              isExpanded={isExpandedView}
            />
          )}
        </div>
      );
    }

    if (visualizerData.type === "scale" && visualizerData.root) {
      return (
        <div className="w-full transform transition-all animate-in fade-in zoom-in-95 duration-300">
          {instrument === "piano" ? (
            <ScalePianoKeyboard
              scaleName={visualizerData.scaleName || visualizerData.root}
              root={visualizerData.root as any}
              notes={buildOneOctaveScale(
                visualizerData.notes || ["C", "D", "E", "F", "G", "A", "B"]
              )}
              isArpeggio={visualizerData.isArpeggio}
              autoPlayTrigger={visualizerData.autoPlayTrigger}
              isExpanded={isExpandedView}
            />
          ) : (
            <ScaleFretboard
              scaleName={visualizerData.scaleName || visualizerData.root}
              root={visualizerData.root as any}
              notes={visualizerData.notes || ["C", "D", "E", "F", "G", "A", "B"]}
              isArpeggio={visualizerData.isArpeggio}
              intervals={visualizerData.intervals}
              autoPlayTrigger={visualizerData.autoPlayTrigger}
              isExpanded={isExpandedView}
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] mx-auto items-start relative">
      {/* Columna 1 (Izquierda): Navegación de los 14 Capítulos (Sticky con el scroll de la página) */}
      <div className="w-full lg:w-1/4 shrink-0 sticky top-6 self-start h-auto">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3.5 h-auto shadow-none">
          <h2 className="text-sm font-sans font-bold text-neutral-200 uppercase tracking-wider mb-3 border-b border-neutral-800 pb-2 flex items-center gap-2">
            <BookOpen size={16} className="text-orange-400" />
            {t('academy.linusAcademy')}
          </h2>
          <div className="flex flex-col gap-1">
            {curriculum.map((chap) => (
              <button
                key={chap.id}
                onClick={() => {
                  if (progressionRef.current) {
                     clearTimeout(progressionRef.current);
                     progressionRef.current = null;
                  }
                  setActiveChapterId(chap.id);
                  setActiveTab("theory");
                  setQuizIndex(0);
                  setQuizFeedback(null);
                  setSelectedAnswer(null);
                  setVisualizerData({ type: "empty" }); // Reset active visualizer
                  setShowGlobalMap(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors flex flex-col gap-0.5 border cursor-pointer shadow-none ${
                  activeChapterId === chap.id
                    ? "bg-orange-500 text-white font-semibold border-orange-500"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent"
                }`}
              >
                <span className={`font-semibold text-xs sm:text-sm leading-snug ${activeChapterId === chap.id ? "text-white" : "text-neutral-200"}`}>{chap.title}</span>
                <span className={`text-[10px] uppercase tracking-wider ${activeChapterId === chap.id ? "text-orange-100" : "text-neutral-500"}`}>
                  {chap.level === "Básico" ? t('academy.basicLevel') : chap.level === "Intermedio" ? t('academy.intermediateLevel') : chap.level === "Avanzado" ? t('academy.advancedLevel') : chap.level}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300">
            <p className="mb-1">
              <strong className="text-white">El Arte de la Armonía</strong>
            </p>
            <p>
              {t('academy.syncInstructionMobile')}
            </p>
          </div>
        </div>
      </div>

      {/* Columna 2 (Central): Lección de Teoría & Quiz (Flujo completo con el scroll de la página) */}
      <div className="w-full lg:w-2/4 bg-neutral-900 rounded-xl border border-neutral-800 min-h-[600px] h-auto flex flex-col shadow-none">
        <div className="flex items-center border-b border-neutral-800 p-3.5 gap-2 bg-neutral-950/60 rounded-t-xl relative z-10">
            <button
              onClick={() => setActiveTab("theory")}
              className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-none ${
                activeTab === "theory"
                  ? "bg-orange-500 text-white"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-800 border-transparent"
              }`}
            >
              {t('academy.theoryLesson')}
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-none ${
                activeTab === "quiz"
                  ? "bg-orange-500 text-white"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-800 border-transparent"
              }`}
            >
              <BookCheck size={16} />
              {t('academy.quiz')}
            </button>
          </div>

          <div className="p-6 md:p-8 flex-1">
            {activeTab === "theory" && (
              <div className="flex flex-col gap-6">
                <div className="markdown-body">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-100 mb-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-100 mt-8 mb-4 border-b border-neutral-800 pb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-display font-semibold text-orange-500 mt-6 mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="text-base text-neutral-200 mb-4 leading-relaxed font-sans" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-3 mb-6" {...props} />,
                      li: ({node, ...props}) => (
                        <li className="flex items-start text-base text-neutral-200 font-sans" {...props}>
                          <span className="text-orange-500 mr-2 mt-1.5 text-xs">●</span>
                          <span>{props.children}</span>
                        </li>
                      ),
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 bg-orange-500/10 p-4 rounded-r-lg my-6 text-orange-200 font-medium text-base" {...props} />,
                      table: ({node, ...props}) => <div className="my-6 border border-neutral-800 bg-neutral-950 rounded-lg w-full overflow-hidden shadow-none"><table className="w-full table-fixed text-xs sm:text-sm text-neutral-200" {...props} /></div>,
                      thead: ({node, ...props}) => <thead className="bg-neutral-900 text-neutral-300 font-semibold text-xs sm:text-sm border-b border-neutral-800" {...props} />,
                      th: ({node, ...props}) => {
                        const isCap1 = activeChapterId === "capitulo_1";
                        const isCap4 = activeChapterId === "capitulo_4";
                        return (
                          <th
                            className={`
                              font-semibold border-b border-neutral-800 text-center py-2.5
                              px-0 sm:px-1 first:text-left first:px-2 sm:first:px-4
                              ${isCap1 ? "first:w-2/5 w-1/5 whitespace-nowrap first:whitespace-normal" : 
                                isCap4 ? "first:w-[10%] w-[12%] last:w-[18%] whitespace-nowrap text-xs tracking-tighter" :
                                "first:w-1/5 w-[11.4%] whitespace-nowrap"}
                            `}
                            {...props}
                          />
                        );
                      },
                      tbody: ({node, ...props}) => <tbody className="divide-y divide-neutral-800" {...props} />,
                      tr: ({node, ...props}) => <tr className="hover:bg-neutral-800/50 transition-colors" {...props} />,
                      td: ({node, ...props}) => {
                        const isCap1 = activeChapterId === "capitulo_1";
                        const isCap4 = activeChapterId === "capitulo_4";
                        return (
                          <td
                            className={`
                              px-0 py-2.5 text-center align-middle
                              first:font-semibold first:text-left first:px-2 sm:first:px-4 text-xs sm:text-sm text-neutral-200
                              ${isCap1 ? "whitespace-nowrap first:whitespace-normal break-words" : 
                                isCap4 ? "whitespace-nowrap px-0 sm:px-1 text-xs tracking-tighter" :
                                "whitespace-nowrap"}
                            `}
                            {...props}
                          />
                        );
                      },
                      a: ({ node, href, children, ...props }) => {
                        if (href?.startsWith("#action:")) {
                          return (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleActionLink(href);
                              }}
                              className={props.className || "inline-flex items-center justify-center text-orange-400 font-bold hover:underline transition-colors rounded px-1 py-0.5 cursor-pointer text-base"}
                            >
                              {children}
                            </button>
                          );
                        }
                        return (
                          <a href={href} className={props.className || "text-orange-400 hover:underline text-base font-semibold"} {...props}>
                            {children}
                          </a>
                        );
                      },
                      'capitulo3-tablas': ((props: any) => <Capitulo3Tablas onAction={handleActionLink} language={language} {...props} />) as any,
                      'capitulo4-tablas': ((props: any) => <Capitulo4Tablas onAction={handleActionLink} language={language} {...props} />) as any,
                      'capitulo7-tablas': ((props: any) => <Capitulo7Tablas onAction={handleActionLink} language={language} {...props} />) as any,
                      'capitulo9-contenido': ((props: any) => language === 'en' ? <Capitulo9En onAction={handleActionLink} {...props} /> : <Capitulo9 onAction={handleActionLink} {...props} />) as any,
                      'capitulo10-contenido': ((props: any) => language === 'en' ? <Capitulo10En onAction={handleActionLink} {...props} /> : <Capitulo10 onAction={handleActionLink} {...props} />) as any,
                      'capitulo11-contenido': ((props: any) => language === 'en' ? <Capitulo11En onAction={handleActionLink} {...props} /> : <Capitulo11 onAction={handleActionLink} {...props} />) as any,
                      'capitulo12-contenido': ((props: any) => language === 'en' ? <Capitulo12En onAction={handleActionLink} {...props} /> : <Capitulo12 onAction={handleActionLink} {...props} />) as any,
                      'capitulo13-contenido': ((props: any) => language === 'en' ? <Capitulo13En onAction={handleActionLink} {...props} /> : <Capitulo13 onAction={handleActionLink} {...props} />) as any,
                      'capitulo14-contenido': ((props: any) => language === 'en' ? <Capitulo14En onAction={handleActionLink} {...props} /> : <Capitulo14 onAction={handleActionLink} {...props} />) as any,
                    } as any}
                  >
                    {activeChapter.theoryMarkdown}
                  </Markdown>
                </div>
                {showGlobalMap && activeChapterId === "capitulo_1" && instrument !== 'piano' ? (
                  <div className="mt-8 border-t border-neutral-800 pt-8 animate-in fade-in zoom-in-95 duration-500 w-full">
                    <GlobalIntervalMap />
                  </div>
                ) : (
                  activeChapterId === "capitulo_1" && instrument !== 'piano' && (
                    <div className="mt-8 flex justify-center border-t border-neutral-800 pt-8">
                      <button 
                        onClick={() => setShowGlobalMap(true)}
                        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-orange-400 font-bold tracking-wider uppercase text-sm rounded-lg border border-neutral-700 transition-colors shadow-none cursor-pointer"
                      >
                        {language === 'en' ? 'View Full Map on Fretboard' : 'Ver Mapa Completo en el Mástil'}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === "quiz" && (
              <>
                {activeChapterId === "capitulo_14" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo14En /> : <QuizCapitulo14 />}
                  </div>
                ) : activeChapterId === "capitulo_13" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo13En /> : <QuizCapitulo13 />}
                  </div>
                ) : activeChapterId === "capitulo_12" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo12En /> : <QuizCapitulo12 />}
                  </div>
                ) : activeChapterId === "capitulo_11" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo11En /> : <QuizCapitulo11 />}
                  </div>
                ) : activeChapterId === "capitulo_10" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo10En /> : <QuizCapitulo10 />}
                  </div>
                ) : activeChapterId === "capitulo_9" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo9En /> : <QuizCapitulo9 />}
                  </div>
                ) : activeChapterId === "capitulo_8" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo8En /> : <QuizCapitulo8 />}
                  </div>
                ) : activeChapterId === "capitulo_7" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo7En /> : <QuizCapitulo7 />}
                  </div>
                ) : activeChapterId === "capitulo_6" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo6En /> : <QuizCapitulo6 />}
                  </div>
                ) : activeChapterId === "capitulo_5" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo5En /> : <QuizCapitulo5 />}
                  </div>
                ) : activeChapterId === "capitulo_4" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo4En /> : <QuizCapitulo4 />}
                  </div>
                ) : activeChapterId === "capitulo_3" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo3En /> : <QuizCapitulo3 />}
                  </div>
                ) : activeChapterId === "capitulo_2" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo2En /> : <QuizCapitulo2 />}
                  </div>
                ) : activeChapterId === "capitulo_1" ? (
                  <div className="pt-8">
                    {language === 'en' ? <QuizCapitulo1En /> : <QuizCapitulo1 />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto pt-8">
                    <div className="text-center mb-10 w-full flex justify-between items-center">
                      <h2 className="text-2xl font-display font-bold text-neutral-100">
                        {language === 'en' ? 'Test your knowledge' : 'Prueba tus conocimientos'}
                      </h2>
                      <span className="text-xs font-mono text-neutral-400 border border-neutral-800 px-3 py-1.5 rounded-lg bg-neutral-950 shadow-none">
                        {language === 'en' ? `Question ${quizIndex + 1} of ${activeChapter.quiz.length}` : `Pregunta ${quizIndex + 1} de ${activeChapter.quiz.length}`}
                      </span>
                    </div>

                    {currentQuiz ? (
                      <>
                        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-8 text-center text-lg text-neutral-100 font-medium leading-relaxed shadow-none">
                          {currentQuiz.question}
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                          {currentQuiz.options.map((option: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => checkQuizAnswer(idx)}
                              className={`py-4 px-6 rounded-lg border text-left transition-colors focus:outline-none flex justify-between items-center text-sm sm:text-base font-medium shadow-none cursor-pointer ${
                                quizFeedback && idx === currentQuiz.correctAnswerIndex
                                  ? "bg-emerald-600 text-white border-emerald-500 font-semibold"
                                  : quizFeedback && idx === selectedAnswer
                                    ? "bg-red-600 text-white border-red-500 font-semibold"
                                    : "bg-neutral-950 border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white hover:border-neutral-700"
                              }`}
                            >
                              <span className="text-sm sm:text-base font-medium">{option}</span>
                              {quizFeedback && idx === currentQuiz.correctAnswerIndex && (
                                <Check size={18} className="text-white" />
                              )}
                              {quizFeedback === "incorrect" && idx === selectedAnswer && (
                                <X size={18} className="text-white" />
                              )}
                            </button>
                          ))}
                        </div>

                        {quizFeedback && (
                          <div
                            className={`w-full mt-6 p-4 rounded-lg text-sm font-medium ${
                              quizFeedback === "correct" ? "bg-emerald-950/60 border border-emerald-800 text-emerald-200" : "bg-red-950/60 border border-red-800 text-red-200"
                            }`}
                          >
                            <strong>
                              {quizFeedback === "correct" ? language === "en" ? "Correct!" : "¡Correcto!" : language === "en" ? "Incorrect." : "Incorrecto."}
                            </strong>{" "}
                            {currentQuiz.explanation}
                          </div>
                        )}

                        {quizIndex === activeChapter.quiz.length - 1 && quizFeedback === "correct" && (
                          <div className="mt-10 p-6 bg-neutral-950 border border-neutral-800 rounded-xl text-center w-full shadow-none">
                            <h3 className="text-xl font-bold text-orange-400 mb-2">
                              {language === "en" ? "Chapter Completed!" : "¡Capítulo Completado!"}
                            </h3>
                            <p className="text-neutral-300 text-sm">
                              {language === "en" ? "You have successfully completed this chapter's quiz." : "Has finalizado el quiz de este capítulo exitosamente."}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-8 mb-8 text-center text-lg text-neutral-200 font-medium leading-relaxed shadow-none">
                        {language === "en" ? "This chapter does not have a quiz yet." : "Este capítulo aún no tiene quiz."}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      {/* Columna 3 (Derecha): MÁSTIL SENSORIAL / PIANO SENSORIAL (Sticky top-6 self-start y 100% completo h-auto sin recortes) */}
      <div className="w-full lg:w-1/4 shrink-0 sticky top-6 self-start h-auto">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-3.5 flex flex-col items-center justify-start h-auto shadow-none">
          {/* Encabezado de la Tarjeta Sensorial con Botón Ampliar */}
          <div className="w-full flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5 mb-2.5">
            <h3 className="text-xs uppercase tracking-wider text-neutral-200 font-bold flex items-center gap-1.5 min-w-0">
              <PlayCircle size={16} className="text-orange-400 shrink-0" />
              <span className="whitespace-normal break-words">
                {instrument === 'piano' ? t('academy.sensoryPiano') : t('academy.sensoryFretboard')}
              </span>
            </h3>

            <button
              type="button"
              onClick={() => setIsSensoryModalOpen(true)}
              title={language === 'en' ? 'Expand Full Instrument' : 'Vista Ampliada / Instrumento Completo'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 border border-neutral-800 hover:border-orange-500/50 text-xs font-semibold tracking-wide transition-colors shrink-0 cursor-pointer"
            >
              <Maximize2 size={13} className="shrink-0" />
              <span>{language === 'en' ? 'Expand' : 'Ampliar'}</span>
            </button>
          </div>

          <div className="w-full h-auto flex flex-col items-center justify-start">
            {renderSensoryVisualizer(false)}
          </div>
        </div>
      </div>

      {/* Modal Pop-up de "Vista Ampliada / Instrumento Completo" (Ventana flotante mediana y compacta) */}
      {isSensoryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsSensoryModalOpen(false)}
        >
          <div
            className={`bg-neutral-900 border border-neutral-800 rounded-2xl w-full ${
              visualizerData.type === 'scale' ? 'max-w-2xl' : 'max-w-xl'
            } p-5 shadow-2xl relative h-auto max-h-[82vh] overflow-y-auto custom-scrollbar`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal Ampliado */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-neutral-800 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <PlayCircle size={18} className="text-orange-400 shrink-0" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-neutral-100 uppercase tracking-wider">
                    {instrument === 'piano' ? t('academy.sensoryPiano') : t('academy.sensoryFretboard')}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Selector rápido Guitarra / Teclado sincronizado globalmente */}
                <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setInstrument('guitar')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      instrument === 'guitar'
                        ? 'bg-orange-500 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {language === 'en' ? 'GUITAR' : 'GUITARRA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstrument('piano')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      instrument === 'piano'
                        ? 'bg-orange-500 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {language === 'en' ? 'KEYBOARD' : 'TECLADO'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSensoryModalOpen(false)}
                  aria-label="Cerrar vista ampliada"
                  className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenido del Instrumento */}
            <div className="w-full h-auto">
              {renderSensoryVisualizer(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
