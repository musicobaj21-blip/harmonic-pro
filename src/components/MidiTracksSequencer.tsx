import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import {
  Waves,
  MousePointer2,
  Scissors,
  VolumeX,
  Search,
  LayoutGrid,
  Plus,
  Minus,
  Piano,
  Music,
  Drum,
  Sparkles,
  Magnet,
  Maximize2,
  Zap,
  Wind,
  Play,
  Square,
  Circle,
  SkipBack,
  Repeat,
  Headphones,
  Sliders,
  Radio,
  Cpu,
  Download,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BankInstrumentKey,
  ensureAudioContextStarted
} from '../utils/instrumentBanks';
import { interactiveAnalysisAudio } from '../utils/interactiveAnalysisAudio';
import { generateComping, generateWalkingBass } from '../utils/band';
import { getDrumMatrixForBeat, getBeatsPerBar } from '../utils/interactiveRhythmPatterns';
import {
  LiveMidiBankOption,
  LIVE_MIDI_CATEGORIES,
  LIVE_MIDI_ANCHORS,
  LIVE_MIDI_BANKS,
  calculateMusicalVelocity,
  getOrLoadLiveBankSampler,
  createTrackSampler,
  createInstrumentSynth,
  preloadLiveBankAudioBuffers,
  TrackAudioChannel
} from '../utils/liveMidiBanks';
import PianoRollModal, { PianoRollTrackPayload } from './PianoRollModal';

export type DawTool = 'pointer' | 'scissors' | 'mute' | 'zoom' | 'grid';
export type TrackType = BankInstrumentKey | 'harmony' | 'synth';

export interface TrackData {
  id: string;
  number: number;
  name: string;
  type: TrackType;
  bankId: string; // e.g. '' (Sin instrumento), 'violin', 'sax_alto', 'piano', etc.
  instrument: string; // Nombre visible del banco o "Sin instrumento"
  accentColor: string;
  isMuted: boolean;
  isSolo: boolean;
  isArmed: boolean;
  isRecording?: boolean;
  regions?: MidiClip[];
  clips?: MidiClip[];
  recordedNotes?: MidiNoteVisual[];
  volume: number;
  volumeDb: string;
  pan: string;
}

export interface MidiTrackRouter {
  noteOn: (midiNote: number, velocity: number) => void;
  noteOff: (midiNote: number) => void;
  hasArmedTrack: () => boolean;
  getArmedTrackInfo: () => { name: string; instrument: string; bankId: string } | null;
}

export interface MidiTracksSequencerProps {
  onRegisterRouter?: (router: MidiTrackRouter | null) => void;
  onArmedTrackChange?: (info: { name: string; instrument: string; bankId: string } | null) => void;
  onTracksChange?: (tracks: TrackData[]) => void;
  bpm?: number;
  timeSignature?: string;
  playbackSequence?: any[];
  currentSong?: any;
  transposition?: number;
  globalKey?: string;
  currentStyle?: string;
  isVisible?: boolean;
  masterIsPlaying?: boolean;
  masterIsRecording?: boolean;
  onMasterPlay?: () => void;
  onMasterStop?: () => void;
  onMasterRec?: () => void;
}

// Resolución estándar MIDI (Ticks Per Quarter / PPQ)
export const TICKS_PER_BEAT = 480;

// Conversiones de tiempo musical ↔ Ticks
export const ticksToSeconds = (ticks: number, bpm: number, isEighthMeter: boolean = false): number => {
  const quarterDuration = 60.0 / Math.max(20, bpm);
  const secondsPerBeat = isEighthMeter ? quarterDuration / 2.0 : quarterDuration;
  return (ticks / TICKS_PER_BEAT) * secondsPerBeat;
};

export const secondsToTicks = (seconds: number, bpm: number, isEighthMeter: boolean = false): number => {
  const quarterDuration = 60.0 / Math.max(20, bpm);
  const secondsPerBeat = isEighthMeter ? quarterDuration / 2.0 : quarterDuration;
  return Math.round((seconds / secondsPerBeat) * TICKS_PER_BEAT);
};

export const barsToTicks = (bar: number, beatsPerBar: number): number => {
  return Math.round((bar - 1.0) * beatsPerBar * TICKS_PER_BEAT);
};

export const ticksToBars = (ticks: number, beatsPerBar: number): number => {
  return 1.0 + (ticks / (beatsPerBar * TICKS_PER_BEAT));
};

export interface MidiNoteVisual {
  id?: string; // Identificador único estable de la nota MIDI
  note?: number; // Código numérico de nota MIDI (ej. 60)
  midi?: number;
  noteName?: string;
  velocity?: number;
  bar: number; // e.g., 1.0, 1.25, 2.5
  length: number; // length in bars, e.g. 0.5
  pitchPercent: number; // 0 to 100 for vertical position
  startTicks?: number; // Ticks exactos de inicio (RAW MIDI)
  durationTicks?: number; // Duración exacta en ticks (RAW MIDI)
  time?: number; // Tiempo exacto de ataque en segundos (sincronizado con Piano Roll)
  duration?: number; // Duración exacta en segundos (sincronizada con Piano Roll)
}

export interface MidiClip {
  id: string;
  trackId?: string;
  name: string;
  startBar: number;
  durationBars: number;
  startTime?: number;
  duration?: number;
  startTicks?: number;
  durationTicks?: number;
  notes: MidiNoteVisual[];
}

const TRACK_ICONS: Record<string, typeof Piano> = {
  piano: Piano,
  rhodes: Zap,
  sax: Wind,
  violin: Music,
  harmony: Piano,
  bass: Music,
  drums: Drum,
  synth: Sparkles
};

const USER_TRACK_COLORS = [
  '#8B5CF6', // Violeta
  '#3B82F6', // Azul
  '#F59E0B', // Ámbar
  '#EC4899', // Rosa
  '#10B981', // Esmeralda
  '#06B6D4', // Cian
  '#F97316', // Naranja
  '#E11D48', // Carmesí
];

function gainToDbString(gain: number): string {
  if (gain <= 0.01) return '-∞ dB';
  const db = Tone.gainToDb(gain);
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
}

// 3 Pistas de Banda Linus iniciales
const INITIAL_BANDA_TRACKS: TrackData[] = [
  {
    id: 't-1',
    number: 1,
    name: 'ARMONÍA',
    type: 'harmony',
    bankId: 'piano',
    instrument: 'Piano de Cola',
    accentColor: '#EA580B',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isRecording: false,
    volume: Tone.dbToGain(-10),
    volumeDb: '-10.0 dB',
    pan: 'C',
  },
  {
    id: 't-2',
    number: 2,
    name: 'BAJO',
    type: 'bass',
    bankId: 'bass',
    instrument: 'Contrabajo Acústico',
    accentColor: '#06B6D4',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isRecording: false,
    volume: Tone.dbToGain(8),
    volumeDb: '+8.0 dB',
    pan: 'C',
  },
  {
    id: 't-3',
    number: 3,
    name: 'BATERÍA',
    type: 'drums',
    bankId: 'drums',
    instrument: 'Batería Jazz Kit',
    accentColor: '#10B981',
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isRecording: false,
    volume: 0.63,
    volumeDb: '-4.0 dB',
    pan: 'C',
  }
];

// Fallback de clips si no hay progresión cargada
const DEFAULT_BANDA_CLIPS: Record<string, MidiClip[]> = {
  't-1': [
    {
      id: 'c-1',
      name: 'Acordes Intro (Cmaj7 - Am9)',
      startBar: 1,
      durationBars: 4,
      notes: [
        { bar: 1.0, length: 0.9, pitchPercent: 75 },
        { bar: 1.0, length: 0.9, pitchPercent: 60 },
        { bar: 1.0, length: 0.9, pitchPercent: 45 },
        { bar: 1.0, length: 0.9, pitchPercent: 30 },
        { bar: 2.0, length: 0.9, pitchPercent: 80 },
        { bar: 2.0, length: 0.9, pitchPercent: 65 },
        { bar: 2.0, length: 0.9, pitchPercent: 50 },
        { bar: 2.0, length: 0.9, pitchPercent: 35 },
        { bar: 3.0, length: 0.9, pitchPercent: 70 },
        { bar: 3.0, length: 0.9, pitchPercent: 55 },
        { bar: 3.0, length: 0.9, pitchPercent: 40 },
        { bar: 3.0, length: 0.9, pitchPercent: 25 },
        { bar: 4.0, length: 0.9, pitchPercent: 75 },
        { bar: 4.0, length: 0.9, pitchPercent: 58 },
        { bar: 4.0, length: 0.9, pitchPercent: 42 },
        { bar: 4.0, length: 0.9, pitchPercent: 22 },
      ]
    }
  ],
  't-2': [
    {
      id: 'c-2',
      name: 'Línea de Bajo (Walking Bass)',
      startBar: 1,
      durationBars: 4,
      notes: [
        { bar: 1.0, length: 0.8, pitchPercent: 30 },
        { bar: 1.8, length: 0.8, pitchPercent: 35 },
        { bar: 2.0, length: 0.8, pitchPercent: 40 },
        { bar: 2.8, length: 0.8, pitchPercent: 45 },
        { bar: 3.0, length: 0.8, pitchPercent: 35 },
        { bar: 3.8, length: 0.8, pitchPercent: 40 },
        { bar: 4.0, length: 0.8, pitchPercent: 30 },
      ]
    }
  ],
  't-3': [
    {
      id: 'c-3',
      name: 'Groove de Batería (Beat 4/4)',
      startBar: 1,
      durationBars: 4,
      notes: [
        { bar: 1.0, length: 0.4, pitchPercent: 20 },
        { bar: 1.25, length: 0.2, pitchPercent: 70 },
        { bar: 1.5, length: 0.4, pitchPercent: 45 },
        { bar: 1.75, length: 0.2, pitchPercent: 70 },
        { bar: 2.0, length: 0.4, pitchPercent: 20 },
        { bar: 2.25, length: 0.2, pitchPercent: 70 },
        { bar: 2.5, length: 0.4, pitchPercent: 45 },
        { bar: 2.75, length: 0.2, pitchPercent: 70 },
        { bar: 3.0, length: 0.4, pitchPercent: 20 },
        { bar: 3.25, length: 0.2, pitchPercent: 70 },
        { bar: 3.5, length: 0.4, pitchPercent: 45 },
        { bar: 3.75, length: 0.2, pitchPercent: 70 },
        { bar: 4.0, length: 0.4, pitchPercent: 20 },
        { bar: 4.25, length: 0.2, pitchPercent: 70 },
        { bar: 4.5, length: 0.4, pitchPercent: 45 },
        { bar: 4.75, length: 0.2, pitchPercent: 70 },
      ]
    }
  ]
};



// Precarga de bancos MIDI delegada a liveMidiBanks.ts y audio de Banda delegado exclusivamente a interactiveAnalysisAudio
function preloadRealBankBuffers(bankId: string): Promise<Record<string, AudioBuffer>> {
  if (!bankId || bankId === 'none') return Promise.resolve({});
  return preloadLiveBankAudioBuffers(bankId);
}

// ============================================================================
// SUBCOMPONENTES MEMOIZADOS (OPTIMIZACIÓN DE RENDIMIENTO)
// ============================================================================

/**
 * Visualizador de notas individuales estilo Piano Roll dentro de un clip MIDI.
 */
interface MidiNoteVisualViewProps {
  notes: MidiNoteVisual[];
  clipStartBar: number;
  clipDurationBars: number;
  accentColor: string;
}

const MidiNoteVisualView = React.memo<MidiNoteVisualViewProps>(({
  notes,
  clipStartBar,
  clipDurationBars,
  accentColor
}) => {
  const safeDuration = Math.max(0.2, clipDurationBars);
  return (
    <div className="w-full flex-1 relative bg-black/40 rounded-[2px] border border-black/50 overflow-hidden">
      {notes.map((n, nIdx) => {
        const noteOffsetInClip = Math.max(0, n.bar - clipStartBar);
        const leftPct = (noteOffsetInClip / safeDuration) * 100;
        const widthPct = Math.max(1.5, (n.length / safeDuration) * 100);
        const bottomPct = n.pitchPercent;
        return (
          <div
            key={nIdx}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              bottom: `${bottomPct}%`,
              backgroundColor: accentColor,
            }}
            className="absolute h-[2px] rounded-xs shadow-xs opacity-90"
          />
        );
      })}
    </div>
  );
});

/**
 * Renderizado de un clip MIDI en la rejilla.
 */
interface MidiClipViewProps {
  clip: MidiClip;
  totalBars: number;
  accentColor: string;
  isSelected?: boolean;
  onSelect?: (clipId: string, e: React.MouseEvent) => void;
  onDoubleClick?: (clip: MidiClip, e: React.MouseEvent) => void;
  activeTool?: DawTool;
}

const MidiClipView = React.memo<MidiClipViewProps>(({
  clip,
  totalBars,
  accentColor,
  isSelected = false,
  onSelect,
  onDoubleClick,
  activeTool = 'pointer'
}) => {
  const startPercent = ((clip.startBar - 1) / totalBars) * 100;
  const widthPercent = (clip.durationBars / totalBars) * 100;

  const toolCursorClass =
    activeTool === 'scissors'
      ? 'cursor-col-resize'
      : activeTool === 'zoom'
      ? 'cursor-zoom-in'
      : 'cursor-pointer';

  return (
    <div
      tabIndex={0}
      title="Doble clic para abrir en el Editor MIDI (Piano Roll)"
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) {
          onSelect(clip.id, e);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) {
          onDoubleClick(clip, e);
        }
      }}
      style={{
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
        borderColor: isSelected ? '#ffffff' : `${accentColor}55`,
        backgroundColor: isSelected ? `${accentColor}38` : `${accentColor}18`
      }}
      className={`absolute top-1 bottom-1 rounded-[3px] border p-1 flex flex-col justify-between overflow-hidden ${toolCursorClass} transition-all outline-none ${
        isSelected
          ? 'border-white ring-2 ring-white/90 shadow-[0_0_12px_rgba(255,255,255,0.45)] brightness-125 z-20'
          : 'hover:brightness-125 shadow-sm z-10'
      }`}
    >
      {/* Cabecera del Clip */}
      <div className="flex items-center justify-between text-[9px] font-mono font-medium truncate leading-none pb-0.5">
        <span className={`truncate font-semibold ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
          {clip.name}
        </span>
        <span className={`text-[8px] shrink-0 ml-1 font-bold ${isSelected ? 'text-white/90' : 'text-neutral-400'}`}>
          {clip.durationBars >= 1 ? `${clip.durationBars} c` : `${clip.durationBars.toFixed(2)} c`}
        </span>
      </div>

      {/* Visualizador de notas MIDI estilo Piano Roll */}
      <MidiNoteVisualView
        notes={clip.notes}
        clipStartBar={clip.startBar}
        clipDurationBars={clip.durationBars}
        accentColor={accentColor}
      />
    </div>
  );
});

/**
 * Regla de Compases Superior del Timeline (Ruler).
 */
interface TimelineRulerProps {
  totalBars: number;
  zoomLevel: number;
  rulerPlayheadRef: React.RefObject<HTMLDivElement | null>;
  onSeekMeasure: (measureIndex: number) => void;
}

const TimelineRuler = React.memo<TimelineRulerProps>(({
  totalBars,
  zoomLevel,
  rulerPlayheadRef,
  onSeekMeasure
}) => {
  const barWidthPx = Math.round(96 * (zoomLevel / 100));
  const scaledMinWidth = totalBars * barWidthPx;

  return (
    <div className="flex min-w-full w-fit border-b border-neutral-800/60 bg-[#141414] text-[10px] font-mono text-neutral-500 select-none">
      {/* Esquina superior izquierda fija: PISTAS */}
      <div className="w-64 sm:w-72 shrink-0 sticky left-0 z-40 bg-[#141414] px-3.5 py-2 border-r border-neutral-800/60 flex items-center justify-between text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
        <span>PISTAS</span>
        <span>M / S / R</span>
      </div>

      {/* Contenedor de la regla horizontal (idéntico al contenedor padre de las pistas) */}
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (rect.width > 0) {
            const relX = Math.max(0, Math.min(rect.width - 1, e.clientX - rect.left));
            const measureIndex = Math.min(totalBars - 1, Math.max(0, Math.floor((relX / rect.width) * totalBars)));
            onSeekMeasure(measureIndex);
          }
        }}
        style={{
          minWidth: `${scaledMinWidth}px`
        }}
        title="Haz clic en cualquier compás para posicionar el cabezal (Playhead)"
        className="flex-1 flex relative cursor-pointer bg-[#111111] hover:bg-neutral-800/30 transition-colors"
      >
        {/* Playhead notch superior en la regla */}
        <div
          ref={rulerPlayheadRef}
          className="absolute top-0 bottom-0 w-[2px] bg-[#EA580B] z-30 pointer-events-none shadow-[0_0_8px_rgba(234,88,11,0.7)] will-change-transform"
          style={{ left: 0, transform: 'translate3d(0, 0, 0)' }}
        >
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-[#EA580B] -translate-x-[3px]" />
        </div>

        {Array.from({ length: totalBars }).map((_, i) => {
          const barNum = i + 1;
          return (
            <div
              key={barNum}
              onClick={(e) => {
                e.stopPropagation();
                onSeekMeasure(i);
              }}
              style={{
                width: `${100 / totalBars}%`,
                minWidth: `${barWidthPx}px`
              }}
              className="w-24 flex-1 shrink-0 min-w-0 border-r border-neutral-800/50 py-1.5 grid grid-cols-4 items-center text-[10px] font-mono cursor-pointer hover:bg-neutral-800/40 transition-colors box-border overflow-hidden"
            >
              <span className="font-bold text-neutral-200 text-[10px] leading-none pl-1 text-left pointer-events-none">
                {barNum}
              </span>
              <span className="text-[8px] text-neutral-600 font-normal leading-none text-left pointer-events-none">
                . 2
              </span>
              <span className="text-[8px] text-neutral-600 font-normal leading-none text-left pointer-events-none">
                . 3
              </span>
              <span className="text-[8px] text-neutral-600 font-normal leading-none text-left pointer-events-none">
                . 4
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

/**
 * Fila individual de pista del secuenciador.
 */
interface TrackRowProps {
  track: TrackData;
  index: number;
  totalBars: number;
  zoomLevel: number;
  clips: MidiClip[];
  isFirstBand: boolean;
  isFirstUser: boolean;
  isRecordingTrack: boolean;
  liveRecordingNotes: MidiNoteVisual[];
  recordingStartBar: number;
  currentBar: number;
  selectedClipId: string | null;
  isSelectedTrack: boolean;
  activeTool: DawTool;
  onSelectClip: (clipId: string | null, e?: React.MouseEvent, trackId?: string) => void;
  onSelectTrack: (trackId: string, e?: React.MouseEvent) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenPianoRoll: (track: TrackData, clip: MidiClip) => void;
  onMute: (id: string) => void;
  onSolo: (id: string) => void;
  onArm: (id: string) => void;
  onToggleRecord: (id: string) => void;
  onVolume: (id: string, vol: number) => void;
  onPan: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onBankChange: (id: string, bankId: string) => void;
  registerPlayheadRef: (index: number, el: HTMLDivElement | null) => void;
}

const TrackRow = React.memo<TrackRowProps>(({
  track,
  index,
  totalBars,
  zoomLevel,
  clips,
  isFirstBand,
  isFirstUser,
  isRecordingTrack,
  liveRecordingNotes,
  recordingStartBar,
  currentBar,
  selectedClipId,
  isSelectedTrack,
  activeTool,
  onSelectClip,
  onSelectTrack,
  onDeleteTrack,
  onOpenPianoRoll,
  onMute,
  onSolo,
  onArm,
  onToggleRecord,
  onVolume,
  onPan,
  onUpdateName,
  onBankChange,
  registerPlayheadRef
}) => {
  const { language } = useLanguage();
  const isBand = track.id === 't-1' || track.id === 't-2' || track.id === 't-3';
  const TrackIcon = TRACK_ICONS[track.type] || Sparkles;
  const barWidthPx = Math.round(96 * (zoomLevel / 100));
  const scaledMinWidth = totalBars * barWidthPx;

  // Estado local para edición de nombre de pista
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(track.name);

  useEffect(() => {
    setTempName(track.name);
  }, [track.name]);

  const handleSaveName = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      onUpdateName(track.id, tempName.trim());
    } else {
      setTempName(track.name);
    }
  };

  return (
    <>
      {/* Divisor de Sección 1: BANDA RUMIE */}
      {isFirstBand && (
        <div className="flex min-w-full w-fit bg-[#141414] border-y border-neutral-800/50 select-none">
          <div className="w-64 sm:w-72 shrink-0 sticky left-0 z-40 bg-[#141414] px-3.5 py-1.5 border-r border-neutral-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
              <span>BANDA RUMIE</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide">
              AUTO
            </span>
          </div>
          <div
            style={{ minWidth: `${scaledMinWidth}px` }}
            className="flex-1 py-1.5 bg-[#111111]"
          />
        </div>
      )}

      {/* Divisor de Sección 2: PISTAS MIDI / USUARIO */}
      {isFirstUser && (
        <div className="flex min-w-full w-fit bg-[#141414] border-y border-neutral-800/50 select-none">
          <div className="w-64 sm:w-72 shrink-0 sticky left-0 z-40 bg-[#141414] px-3.5 py-1.5 border-r border-neutral-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
              <span>PISTAS MIDI</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wide">
              USER
            </span>
          </div>
          <div
            style={{ minWidth: `${scaledMinWidth}px` }}
            className="flex-1 py-1.5 bg-[#111111]"
          />
        </div>
      )}

      {/* Fila de Pista */}
      <div
        className={`flex min-w-full w-fit min-h-[66px] group transition-colors ${
          isSelectedTrack && !isBand
            ? 'bg-[#EA580B]/[0.06] ring-1 ring-inset ring-[#EA580B]/50'
            : 'hover:bg-neutral-900/40'
        }`}
      >
        {/* CABECERA DE LA PISTA (TRACK HEADER) */}
        <div
          onClick={(e) => onSelectTrack(track.id, e)}
          className={`w-64 sm:w-72 shrink-0 sticky left-0 z-40 px-3 py-2 border-r flex flex-col justify-between cursor-pointer transition-colors ${
            isSelectedTrack && !isBand
              ? 'bg-[#201926] border-r-[#EA580B]/70 shadow-[inset_0_0_14px_rgba(234,88,11,0.12)]'
              : 'bg-[#161616] border-r-neutral-800/60 hover:bg-[#1b1b1b]'
          }`}
        >
          {/* Barra de Acento Lateral */}
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all ${
              isSelectedTrack && !isBand ? 'w-[4px] opacity-100' : 'w-[2px] opacity-80'
            }`}
            style={{ backgroundColor: isSelectedTrack && !isBand ? '#EA580B' : track.accentColor }}
          />

          {/* Fila 1: Indicador, Nombre Editable, Badge STEREO/BANDA y Botones M/S/R/Trash */}
          <div className="flex items-center justify-between gap-1.5 pl-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Indicador circular de color */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: track.accentColor }}
              />

              {/* Nombre Editable para pistas de usuario */}
              {isBand ? (
                <span className="font-mono text-xs font-bold text-neutral-100 truncate tracking-wide">
                  {track.name}
                </span>
              ) : isEditingName ? (
                <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setTempName(track.name);
                        setIsEditingName(false);
                      }
                    }}
                    autoFocus
                    className="w-full bg-neutral-800 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTrack(track.id, e);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  title="Clic para seleccionar pista • Doble clic para renombrar"
                  className="flex items-center gap-1 cursor-pointer group/name truncate flex-1"
                >
                  <span className={`font-mono text-xs font-bold truncate tracking-wide ${
                    isSelectedTrack ? 'text-orange-400' : 'text-neutral-100 hover:text-white'
                  }`}>
                    {track.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                    title="Cambiar nombre de la pista"
                    className="text-neutral-500 hover:text-neutral-200 opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0 cursor-pointer"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
              )}

              {isBand && (
                <span className="text-[8px] font-mono px-1 py-0.2 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded shrink-0">
                  BANDA
                </span>
              )}
            </div>

            {/* Botones Mute / Solo / Rec / Arm / Eliminar */}
            <div className="flex items-center gap-1 shrink-0">
              {/* MUTE */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onMute(track.id); }}
                className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  track.isMuted
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/40'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border border-neutral-700'
                }`}
                title="Silenciar Pista (Mute)"
              >
                M
              </button>

              {/* SOLO */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSolo(track.id); }}
                className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  track.isSolo
                    ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/40'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border border-neutral-700'
                }`}
                title="Pista Solista (Solo)"
              >
                S
              </button>

              {/* GRABACIÓN EXCLUSIVA DE LA PISTA (⏺) - Exclusivo para pistas creadas por el usuario */}
              {!isBand && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); onToggleRecord(track.id); }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                    track.isRecording
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/60 animate-pulse'
                      : 'bg-neutral-800 text-rose-500 hover:text-rose-400 hover:bg-neutral-700 border-neutral-700'
                  }`}
                  title={track.isRecording ? "Grabación activa en esta pista (⏺ ON)" : "Activar grabación en esta pista (⏺)"}
                >
                  <span className="text-[11px] leading-none select-none">⏺</span>
                </button>
              )}

              {/* ARM / MONITOREO EN VIVO (R) */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); onArm(track.id); }}
                className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  track.isArmed
                    ? 'bg-[#EA580B] text-white shadow-sm shadow-[#EA580B]/40'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border border-neutral-700'
                }`}
                title={track.isArmed ? "Pista Armada para Monitoreo en Vivo (R ON)" : "Armar Pista para Monitoreo (Record Arm)"}
              >
                R
              </button>

              {/* ELIMINAR PISTA DE USUARIO (Papelera) */}
              {!isBand && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrack(track.id);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer bg-neutral-800 text-neutral-400 hover:bg-rose-600 hover:text-white border border-neutral-700 hover:border-rose-500"
                  title="Eliminar Pista MIDI (Supr / Delete)"
                  aria-label={`Eliminar ${track.name}`}
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Fila 2: Selector de Banco / Instrumento */}
          {isBand ? (
            <div className="flex items-center gap-1.5 pl-1.5 my-1 text-[10px] text-neutral-400 font-sans truncate">
              <TrackIcon size={11} className="shrink-0 text-neutral-500" />
              <span className="truncate">{track.instrument}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1.5 my-1 text-[10px] font-sans truncate">
              <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700 shrink-0">
                INS
              </span>
              <select
                value={track.bankId || ''}
                onChange={e => onBankChange(track.id, e.target.value)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] font-mono outline-none cursor-pointer max-w-[155px] truncate font-medium transition-colors"
                title="Seleccionar Banco de Sonido Live MIDI"
              >
                <option value="">-- Sin instrumento --</option>
                {LIVE_MIDI_CATEGORIES.map(category => (
                  <optgroup key={category} label={category} className="bg-neutral-900 text-neutral-400 font-bold">
                    {LIVE_MIDI_BANKS.filter(b => b.category === category).map(b => (
                      <option key={b.id} value={b.id} className="bg-neutral-800 text-neutral-200 font-normal">
                        {language === 'en' ? (b.nameEn || b.name) : b.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Fila 3: Fader / Slider de Volumen + Valor en dB + Pan */}
          <div className="flex items-center gap-2 pl-1.5">
            <div className="flex-1 flex items-center gap-1.5">
              <input
                type="range"
                min="0"
                max="4.2"
                step="0.01"
                value={track.volume}
                onChange={e => onVolume(track.id, parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EA580B]"
                title={`Volumen: ${track.volumeDb}`}
              />
              <span className="text-[9px] font-mono text-neutral-400 w-12 text-right shrink-0">
                {track.volumeDb}
              </span>
            </div>

            {/* Paneo + Canal */}
            <div className="flex items-center gap-1 shrink-0 font-mono">
              <button
                type="button"
                onClick={() => onPan(track.id)}
                className="text-[8px] text-neutral-400 hover:text-white cursor-pointer w-7 text-center font-bold"
                title="Alternar Pan Estéreo"
              >
                {track.pan}
              </button>
              <span className="text-[8px] text-neutral-500 font-mono uppercase">
                CH {track.number}
              </span>
            </div>
          </div>
        </div>

        {/* TIMELINE / GRID DE LA PISTA (Contenedor padre idéntico al de la regla superior) */}
        <div
          onClick={(e) => {
            onSelectTrack(track.id, e);
            onSelectClip(null, e, track.id);
          }}
          style={{
            minWidth: `${scaledMinWidth}px`
          }}
          className={`flex-1 flex relative min-h-[66px] linus-timeline-grid ${
            isSelectedTrack && !isBand ? 'bg-[#17131c]' : 'bg-[#111111]'
          }`}
        >
          {/* Líneas de cuadrícula verticales sutiles por compás (mismo w-24 flex-1 shrink-0 que TimelineRuler) */}
          {Array.from({ length: totalBars }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${100 / totalBars}%`,
                minWidth: `${barWidthPx}px`
              }}
              className="w-24 flex-1 shrink-0 min-w-0 border-r border-neutral-800/50 min-h-[66px] h-full pointer-events-none box-border"
            />
          ))}

          {/* Playhead vertical naranja brillante sincronizado con el Transport real (GPU transform) */}
          <div
            ref={el => registerPlayheadRef(index, el)}
            className="absolute top-0 bottom-0 w-[2px] bg-[#EA580B] z-30 pointer-events-none shadow-[0_0_8px_rgba(234,88,11,0.7)] will-change-transform"
            style={{ left: 0, transform: 'translate3d(0, 0, 0)' }}
          >
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-[#EA580B] -translate-x-[3px]" />
          </div>

          {/* OVERLAY DE GRABACIÓN EN TIEMPO REAL (Bloque rojo translúcido atado al Playhead) */}
          {isRecordingTrack && (
            <div
              style={{
                left: `${((recordingStartBar - 1) / totalBars) * 100}%`,
                width: `${(Math.max(0.25, currentBar - recordingStartBar) / totalBars) * 100}%`,
              }}
              className="absolute top-1 bottom-1 rounded-[4px] border-2 border-rose-500 bg-rose-600/25 backdrop-blur-[1px] p-1 flex flex-col justify-between overflow-hidden pointer-events-none z-25 shadow-lg shadow-rose-950/50"
            >
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-rose-300">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  REC [TOMA EN VIVO]
                </span>
                <span className="text-[7.5px] text-rose-300/80">
                  {liveRecordingNotes.length} {liveRecordingNotes.length === 1 ? 'nota' : 'notas'}
                </span>
              </div>
              <MidiNoteVisualView
                notes={liveRecordingNotes}
                clipStartBar={recordingStartBar}
                clipDurationBars={Math.max(0.25, currentBar - recordingStartBar)}
                accentColor="#fb7185"
              />
            </div>
          )}

          {/* Renderizado de Clips MIDI Guardados */}
          {clips.map(clip => (
            <MidiClipView
              key={clip.id}
              clip={clip}
              totalBars={totalBars}
              accentColor={track.accentColor}
              isSelected={selectedClipId === clip.id}
              onSelect={(clipId, e) => onSelectClip(clipId, e, track.id)}
              onDoubleClick={(clickedClip) => onOpenPianoRoll(track, clickedClip)}
              activeTool={activeTool}
            />
          ))}
        </div>
      </div>
    </>
  );
});

/**
 * Generador de instancias totalmente nuevas e independientes de Pistas MIDI de usuario.
 * Garantiza un UUID único real (crypto.randomUUID) y cero referencias compartidas.
 */
function createMidiTrack(userIndex: number): TrackData {
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `midi-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const chosenColor = USER_TRACK_COLORS[(userIndex - 1) % USER_TRACK_COLORS.length];

  return {
    id: uniqueId,
    number: userIndex + 3,
    name: `PISTA MIDI ${userIndex}`,
    type: 'synth',
    bankId: '', // Inicialmente Sin instrumento
    instrument: 'Sin instrumento',
    accentColor: chosenColor,
    isMuted: false,
    isSolo: false,
    isArmed: false,
    isRecording: false,
    regions: [],
    volume: 1.0,
    volumeDb: '0.0 dB',
    pan: 'C',
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL: MidiTracksSequencer
// ============================================================================

export const MidiTracksSequencer: React.FC<MidiTracksSequencerProps> = ({
  onRegisterRouter,
  onArmedTrackChange,
  onTracksChange,
  bpm = 120,
  timeSignature = '4/4',
  playbackSequence,
  currentSong,
  transposition = 0,
  globalKey = 'C',
  currentStyle,
  isVisible = true,
  masterIsPlaying,
  masterIsRecording,
  onMasterPlay,
  onMasterStop,
  onMasterRec
}) => {
  const { language } = useLanguage();

  // Contador de referencia para numeración incremental segura de pistas (sin re-renders ni dobles llamadas)
  const nextTrackIndexRef = useRef<number>(0);

  // Clips guardados de pistas de usuario (organizados por trackId)
  const [userClips, setUserClips] = useState<Record<string, MidiClip[]>>({});

  // Estado de Pistas: Inicializa con las 3 pistas de Banda Linus
  const [tracks, setTracks] = useState<TrackData[]>(() => {
    try {
      const mixer = interactiveAnalysisAudio.getMixerState();
      return INITIAL_BANDA_TRACKS.map(t => {
        if (t.id === 't-1') {
          return {
            ...t,
            isMuted: mixer.piano.isMuted,
            isSolo: mixer.piano.isSolo,
            volume: mixer.piano.volume,
            volumeDb: gainToDbString(mixer.piano.volume)
          };
        }
        if (t.id === 't-2') {
          return {
            ...t,
            isMuted: mixer.bass.isMuted,
            isSolo: mixer.bass.isSolo,
            volume: mixer.bass.volume,
            volumeDb: gainToDbString(mixer.bass.volume)
          };
        }
        if (t.id === 't-3') {
          return {
            ...t,
            isMuted: mixer.drums.isMuted,
            isSolo: mixer.drums.isSolo,
            volume: mixer.drums.volume,
            volumeDb: gainToDbString(mixer.drums.volume)
          };
        }
        return t;
      });
    } catch (_) {
      return INITIAL_BANDA_TRACKS;
    }
  });

  const isBandTrack = useCallback((id: string) => ['t-1', 't-2', 't-3'].includes(id), []);
  const tracksRef = useRef<TrackData[]>(tracks);
  const onArmedTrackChangeRef = useRef(onArmedTrackChange);
  useEffect(() => {
    onArmedTrackChangeRef.current = onArmedTrackChange;
  }, [onArmedTrackChange]);

  const lastArmedInfoKeyRef = useRef<string | null>(null);

  useEffect(() => {
    tracksRef.current = tracks;
    const armed = tracks.find(t => t.isArmed && !isBandTrack(t.id));
    const armedKey = armed ? `${armed.id}:${armed.name}:${armed.instrument}:${armed.bankId}` : 'none';

    if (armedKey !== lastArmedInfoKeyRef.current) {
      lastArmedInfoKeyRef.current = armedKey;
      if (onArmedTrackChangeRef.current) {
        if (armed) {
          onArmedTrackChangeRef.current({
            name: armed.name,
            instrument: armed.instrument,
            bankId: armed.bankId
          });
        } else {
          onArmedTrackChangeRef.current(null);
        }
      }
    }
  }, [tracks, isBandTrack]);

  // Canales Tone.Channel dedicados por pista (controlan Gain, Pan y Mute por pista)
  const channelsRef = useRef<Map<string, Tone.Channel>>(new Map());
  const trackMetersRef = useRef<Map<string, Tone.Meter>>(new Map());

  // Samplers dedicados por pista de usuario
  const trackSamplersRef = useRef<Map<string, Tone.Sampler>>(new Map());

  // Precargar samples para la Banda Rumie (interactiveAnalysisAudio) y bancos de pistas MIDI (liveMidiBanks) al montar
  useEffect(() => {
    interactiveAnalysisAudio.preloadAllWavSamples().catch(() => {});
    preloadRealBankBuffers('piano').catch(() => {});
    preloadRealBankBuffers('rhodes').catch(() => {});
    preloadRealBankBuffers('acoustic_upright_bass').catch(() => {});
    preloadRealBankBuffers('electric_bass_finger').catch(() => {});
    preloadRealBankBuffers('sax_alto').catch(() => {});
    preloadRealBankBuffers('jazz_guitar').catch(() => {});
  }, []);

  // Tone.Parts activas durante la reproducción del secuenciador
  const activePlaybackPartsRef = useRef<Tone.Part[]>([]);

  // ============================================================================
  // ESTADO DE GRABACIÓN MIDI (REC EXCLUSIVO POR PISTA Y RENDERIZADO DINÁMICO)
  // ============================================================================
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const activeNotesByTrackRef = useRef<Map<string, Map<number, { midi: number; velocity: number; startTicks: number; startBar: number; noteOnTime: number }>>>(new Map());
  const recordedNotesByTrackRef = useRef<Map<string, Array<{ midi: number; velocity: number; startTicks: number; durationTicks: number; startBar: number; durationBars: number }>>>(new Map());
  const [liveNotesByTrack, setLiveNotesByTrack] = useState<Record<string, MidiNoteVisual[]>>({});
  const liveNotesByTrackRef = useRef<Record<string, MidiNoteVisual[]>>({});
  useEffect(() => {
    liveNotesByTrackRef.current = liveNotesByTrack;
  }, [liveNotesByTrack]);
  const [trackRecStartBars, setTrackRecStartBars] = useState<Record<string, number>>({});
  const trackRecStartBarsRef = useRef<Record<string, number>>({});
  const trackRecStartSecondsRef = useRef<Record<string, number>>({});
  const maxRecBarReachedRef = useRef<Record<string, number>>({});
  const lastValidTransportSecondsRef = useRef<number>(0);
  const hasActiveTakeSessionRef = useRef<boolean>(false);
  const [liveRecBar, setLiveRecBar] = useState<number>(1.0);
  const liveRecBarRef = useRef<number>(1.0);
  const targetBarTimeRef = useRef<number>(0);

  // Sincronización transversal de Solo y Mute entre las pistas de la Banda Linus y las dawTracks de usuario
  const applyCrossEngineSoloAndMute = useCallback((trackList: TrackData[]) => {
    const anyUserSolo = trackList.some(t => !isBandTrack(t.id) && Boolean(t.isSolo));
    interactiveAnalysisAudio.setExternalSoloActive(anyUserSolo);

    const anyBandaSolo = interactiveAnalysisAudio.isAnyBandaSoloActive();
    const anyGlobalSolo = anyUserSolo || anyBandaSolo;

    trackList.forEach(t => {
      if (!isBandTrack(t.id)) {
        const shouldSilence = Boolean(t.isMuted) || (anyGlobalSolo && !Boolean(t.isSolo));
        const ch = channelsRef.current.get(t.id);
        if (ch) {
          ch.mute = shouldSilence;
          const volNum = typeof t.volume === 'number' ? t.volume : 1.0;
          ch.volume.value = shouldSilence
            ? -Infinity
            : (volNum <= 0.0001 ? -Infinity : Tone.gainToDb(volNum));
        }
        if (shouldSilence) {
          const sampler = trackSamplersRef.current.get(t.id);
          if (sampler) {
            try { sampler.releaseAll(); } catch (_) {}
          }
        }
      }
    });
  }, [isBandTrack]);

  // Sincronización continua e instantánea de Mute, Solo y Volumen desde el canal real de interactiveAnalysisAudio para Banda Linus
  useEffect(() => {
    const syncFromMixer = () => {
      const state = interactiveAnalysisAudio.getMixerState();
      setTracks(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (t.id === 't-1') {
            if (t.isMuted !== state.piano.isMuted || t.isSolo !== state.piano.isSolo || t.volume !== state.piano.volume) {
              changed = true;
              return {
                ...t,
                isMuted: state.piano.isMuted,
                isSolo: state.piano.isSolo,
                volume: state.piano.volume,
                volumeDb: gainToDbString(state.piano.volume)
              };
            }
          }
          if (t.id === 't-2') {
            if (t.isMuted !== state.bass.isMuted || t.isSolo !== state.bass.isSolo || t.volume !== state.bass.volume) {
              changed = true;
              return {
                ...t,
                isMuted: state.bass.isMuted,
                isSolo: state.bass.isSolo,
                volume: state.bass.volume,
                volumeDb: gainToDbString(state.bass.volume)
              };
            }
          }
          if (t.id === 't-3') {
            if (t.isMuted !== state.drums.isMuted || t.isSolo !== state.drums.isSolo || t.volume !== state.drums.volume) {
              changed = true;
              return {
                ...t,
                isMuted: state.drums.isMuted,
                isSolo: state.drums.isSolo,
                volume: state.drums.volume,
                volumeDb: gainToDbString(state.drums.volume)
              };
            }
          }
          return t;
        });
        const effectiveList = changed ? next : prev;
        tracksRef.current = effectiveList;
        applyCrossEngineSoloAndMute(effectiveList);
        return changed ? next : prev;
      });
    };

    const unsubscribe = interactiveAnalysisAudio.subscribe(() => {
      syncFromMixer();
    });
    const interval = setInterval(syncFromMixer, 350);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [applyCrossEngineSoloAndMute]);

  // Total de compases calculado dinámicamente según la canción o progresión cargada
  const beatsPerBar = useMemo(() => {
    const num = parseInt(timeSignature.split('/')[0], 10);
    return !isNaN(num) && num > 0 ? num : getBeatsPerBar(timeSignature);
  }, [timeSignature]);
  const isEighthMeter = useMemo(() => timeSignature.split('/')[1]?.trim() === '8', [timeSignature]);

  const totalBars = useMemo(() => {
    if (currentSong?.measures && Array.isArray(currentSong.measures) && currentSong.measures.length > 0) {
      return Math.max(8, currentSong.measures.length);
    }
    if (playbackSequence && playbackSequence.length > 0) {
      const highestMeasure = playbackSequence.reduce((max, item) => {
        const m = typeof item.measureIndex === 'number' ? item.measureIndex : 0;
        return Math.max(max, m);
      }, 0);
      return Math.max(8, highestMeasure + 1);
    }
    return 32; // Predeterminado para arreglo estándar completo
  }, [currentSong, playbackSequence]);

  const totalBarsRef = useRef(totalBars);
  useEffect(() => {
    totalBarsRef.current = totalBars;
  }, [totalBars]);

  const beatsPerBarRef = useRef(beatsPerBar);
  useEffect(() => {
    beatsPerBarRef.current = beatsPerBar;
  }, [beatsPerBar]);

  const isEighthMeterRef = useRef(isEighthMeter);
  useEffect(() => {
    isEighthMeterRef.current = isEighthMeter;
  }, [isEighthMeter]);

  const bpmRef = useRef(bpm);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Total de tiempo en segundos formateado (MM:SS)
  const formattedTotalTime = useMemo(() => {
    const totalBeats = totalBars * beatsPerBar;
    const stepDuration = isEighthMeter ? (60 / (bpm || 120)) / 2 : (60 / (bpm || 120));
    const totalSeconds = totalBeats * stepDuration;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [totalBars, beatsPerBar, bpm, isEighthMeter]);

  // Estados visuales de la barra de herramientas e interactividad de clips y pistas
  const [activeTool, setActiveTool] = useState<DawTool>('pointer');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<PianoRollTrackPayload | null>(null);
  const [quantize, setQuantize] = useState<string>('1/16');
  const quantizeRef = useRef<string>(quantize);
  useEffect(() => { quantizeRef.current = quantize; }, [quantize]);
  const [isSnapToBar, setIsSnapToBar] = useState<boolean>(true);
  const [isSnapToggleOn, setIsSnapToggleOn] = useState<boolean>(true);
  const isSnapToggleOnRef = useRef<boolean>(isSnapToggleOn);
  useEffect(() => { isSnapToggleOnRef.current = isSnapToggleOn; }, [isSnapToggleOn]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Sincronizar flag global para evitar conflicto con el borrado de compases de la grilla de acordes
  useEffect(() => {
    const hasDawSelection = Boolean(
      selectedClipId || (selectedTrackId && !isBandTrack(selectedTrackId))
    );
    (window as any).__linusHasSelectedDawItem = hasDawSelection;
    return () => {
      (window as any).__linusHasSelectedDawItem = false;
    };
  }, [selectedClipId, selectedTrackId, isBandTrack]);

  // Limpiar selección del DAW cuando el usuario hace clic en la grilla de acordes inferior
  useEffect(() => {
    const handleClearDawSelection = () => {
      setSelectedClipId(null);
      setSelectedTrackId(null);
    };
    window.addEventListener('linus-clear-daw-selection', handleClearDawSelection);
    return () => window.removeEventListener('linus-clear-daw-selection', handleClearDawSelection);
  }, []);

  // Selección de una pista en el panel izquierdo o carril del timeline
  const handleSelectTrack = useCallback((trackId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedTrackId(trackId);
    setSelectedClipId(null);
  }, []);

  // Selección de un clip MIDI en el TimelineGrid
  const handleSelectClip = useCallback((clipId: string | null, e?: React.MouseEvent, trackId?: string) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedClipId(clipId);
    if (trackId) {
      setSelectedTrackId(trackId);
    }
  }, []);

  // Apertura del Modal Piano Roll al hacer doble clic en un clip MIDI
  const handleOpenPianoRoll = useCallback((track: TrackData, clip: MidiClip) => {
    setSelectedClipId(clip.id);
    setSelectedTrackId(track.id);
    setEditingTrack({
      ...track,
      notes: Array.isArray(clip.notes) ? clip.notes : (track.recordedNotes || []),
      activeClip: clip
    });
  }, []);

  // Preescucha de nota MIDI al hacer clic en una tecla o bloque dentro del Piano Roll
  const handlePreviewPianoRollNote = useCallback(async (midiNote: number) => {
    if (!editingTrack) return;
    try {
      await ensureAudioContextStarted();

      if (editingTrack.id === 't-1') {
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        interactiveAnalysisAudio.playHarmonyChord([freq], interactiveAnalysisAudio.getAudioContext().currentTime, 0.45, 'piano', 0.85);
        return;
      }
      if (editingTrack.id === 't-2') {
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        interactiveAnalysisAudio.playBassNote(freq, interactiveAnalysisAudio.getAudioContext().currentTime, 0.55, 0.85);
        return;
      }
      if (editingTrack.id === 't-3') {
        const drumPiece =
          midiNote <= 36 ? 'kick' :
          midiNote === 37 || midiNote === 39 ? 'rim' :
          midiNote <= 40 ? 'snare' :
          midiNote === 42 || midiNote === 44 ? 'hihat_closed' :
          midiNote === 46 ? 'hihat_open' :
          'ride';
        interactiveAnalysisAudio.playDrumHit(drumPiece, interactiveAnalysisAudio.getAudioContext().currentTime, 0.85);
        return;
      }

      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      let sampler = trackSamplersRef.current.get(editingTrack.id);
      if (!sampler && editingTrack.bankId && editingTrack.bankId !== 'none') {
        let channel = channelsRef.current.get(editingTrack.id);
        if (!channel) {
          channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
          channelsRef.current.set(editingTrack.id, channel);
        }
        const created = createTrackSampler(editingTrack.bankId, channel) || createInstrumentSynth(editingTrack.bankId, channel);
        if (created) {
          trackSamplersRef.current.set(editingTrack.id, created);
          sampler = created;
        }
      }
      if (sampler) {
        sampler.triggerAttackRelease(noteName, 0.35, Tone.now(), 0.8);
      }
    } catch (_) {}
  }, [editingTrack]);

  // Actualización en vivo de las notas de un clip/pista desde el PianoRollModal (Lápiz, Goma, Puntero, Cuantizar)
  const handleUpdateTrackNotes = useCallback((trackId: string, newNotes: MidiNoteVisual[], clipId?: string) => {
    const minNoteBar = newNotes.length > 0
      ? Math.min(...newNotes.map(n => n.bar))
      : 1.0;
    const maxNoteEndBar = newNotes.length > 0
      ? Math.max(...newNotes.map(n => n.bar + n.length))
      : 2.0;

    const updateClipList = (clipList: MidiClip[]): MidiClip[] => {
      if (!Array.isArray(clipList) || clipList.length === 0) {
        const startBar = Math.max(1.0, Math.floor(minNoteBar));
        const durationBars = Math.max(1.0, Math.ceil(maxNoteEndBar - startBar));
        return [
          {
            id: clipId || `clip-${trackId}-${Date.now()}`,
            name: 'TAKE 01',
            startBar,
            durationBars,
            notes: newNotes
          }
        ];
      }

      return clipList.map((c, idx) => {
        const isTarget = clipId ? c.id === clipId : idx === 0;
        if (!isTarget) return c;

        const bPerBar = beatsPerBarRef.current || 4;
        const bpmVal = bpmRef.current || 120;
        const stepDur = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
        const secondsPerBar = stepDur * bPerBar;

        const newStartBar = newNotes.length > 0 ? Math.max(1.0, Math.min(c.startBar, minNoteBar)) : c.startBar;
        const newEndBar = newNotes.length > 0 ? Math.max(newStartBar + 0.25, c.startBar + c.durationBars, maxNoteEndBar) : (c.startBar + c.durationBars);
        const newDurationBars = Math.max(0.25, newEndBar - newStartBar);
        return {
          ...c,
          startBar: newStartBar,
          durationBars: newDurationBars,
          startTicks: barsToTicks(newStartBar, bPerBar),
          durationTicks: Math.max(12, barsToTicks(newStartBar + newDurationBars, bPerBar) - barsToTicks(newStartBar, bPerBar)),
          startTime: Math.max(0, (newStartBar - 1.0) * secondsPerBar),
          duration: newDurationBars * secondsPerBar,
          notes: newNotes
        };
      });
    };

    setUserClips(prev => ({
      ...prev,
      [trackId]: updateClipList(prev[trackId] || [])
    }));

    setTracks(prevTracks => {
      const nextTracks = prevTracks.map(t => {
        if (t.id !== trackId) return t;
        const updatedRegions = updateClipList(
          Array.isArray(t.regions) && t.regions.length > 0
            ? t.regions
            : (userClips[trackId] || [])
        );
        return {
          ...t,
          regions: updatedRegions,
          clips: updatedRegions,
          recordedNotes: newNotes
        };
      });
      tracksRef.current = nextTracks;
      return nextTracks;
    });

    setEditingTrack(prev => {
      if (!prev || prev.id !== trackId) return prev;
      return {
        ...prev,
        notes: newNotes,
        activeClip: prev.activeClip
          ? { ...prev.activeClip, notes: newNotes }
          : prev.activeClip
      };
    });
  }, [userClips]);

  // Estados de transporte sincronizados con el Master Transport global
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const effectiveIsPlaying = typeof masterIsPlaying === 'boolean' ? masterIsPlaying : isPlaying;
  const effectiveIsRecording = typeof masterIsRecording === 'boolean' ? masterIsRecording : isRecording;

  // Refs de manipulación DOM directa para CERO re-renders en el playhead
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const rulerPlayheadRef = useRef<HTMLDivElement | null>(null);
  const playheadRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barDisplayRef = useRef<HTMLDivElement | null>(null);
  const timeDisplayRef = useRef<HTMLSpanElement | null>(null);
  const timelineWidthRef = useRef<number>(540);
  const latestPlayingRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(isVisible);
  const targetBarRef = useRef<number>(1.0);
  const isCountingInRef = useRef<boolean>(false);
  const countInStartBarRef = useRef<number>(1.0);
  const countInStartSecondsRef = useRef<number>(0);

  const registerPlayheadRef = useCallback((index: number, el: HTMLDivElement | null) => {
    playheadRefs.current[index] = el;
  }, []);

  // Actualizador de Playhead y Displays por manipulación DOM directa
  const updatePlayheadDOM = useCallback((bar: number) => {
    const effectiveBar = isCountingInRef.current ? (countInStartBarRef.current || 1.0) : bar;
    const total = totalBarsRef.current || 8;
    const rulerGrid = rulerPlayheadRef.current?.parentElement;
    const width = (rulerGrid && rulerGrid.offsetWidth > 0)
      ? rulerGrid.offsetWidth
      : (timelineWidthRef.current || 540);
    timelineWidthRef.current = width;

    const clampedBar = Math.max(1, Math.min(total + 1, effectiveBar));
    const progress = Math.max(0, Math.min(1, (clampedBar - 1) / total));
    const x = progress * width;
    const transformStr = `translate3d(${x}px, 0, 0)`;

    if (rulerPlayheadRef.current) {
      rulerPlayheadRef.current.style.transform = transformStr;
    }

    const els = playheadRefs.current;
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (el) {
        el.style.transform = transformStr;
      }
    }

    // Auto-Scroll / Follow Playhead cuando la reproducción o grabación está activa
    if (scrollContainerRef.current && (latestPlayingRef.current || isRecordingRef.current || Tone.Transport.state === 'started')) {
      const container = scrollContainerRef.current;
      const headerOffset = rulerGrid ? rulerGrid.offsetLeft : Math.max(0, container.scrollWidth - width);
      const playheadPositionPx = headerOffset + x;
      const viewRightEdge = container.scrollLeft + container.clientWidth;

      if (effectiveBar <= 1.02 && container.scrollLeft > 0) {
        container.scrollLeft = 0;
      } else if (playheadPositionPx > viewRightEdge - 100) {
        container.scrollLeft = playheadPositionPx - container.clientWidth + 150;
      } else if (x < container.scrollLeft) {
        container.scrollLeft = Math.max(0, x);
      }
    }

    if (barDisplayRef.current) {
      const bPerBar = beatsPerBarRef.current || 4;
      const curMeasure = Math.max(1, Math.floor(clampedBar));
      const curBeat = Math.max(1, Math.floor(((clampedBar - Math.floor(clampedBar)) * bPerBar) + 1));
      barDisplayRef.current.textContent = `BAR ${String(curMeasure).padStart(2, '0')} : ${String(curBeat).padStart(2, '0')} : 00`;
    }

    if (timeDisplayRef.current) {
      const bPerBar = beatsPerBarRef.current || 4;
      const bpmVal = bpmRef.current || 120;
      const totalBeats = (clampedBar - 1) * bPerBar;
      const stepDur = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
      const totalSeconds = totalBeats * stepDur;
      const mins = Math.floor(totalSeconds / 60);
      const secs = Math.floor(totalSeconds % 60);
      const cs = Math.floor((totalSeconds % 1) * 100);
      timeDisplayRef.current.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    }
  }, []);

  // Posicionamiento por Clic en la Regla o desde la Grilla de Acordes (Scrubbing / Seek a cualquier compás)
  const seekToMeasure = useCallback((measureIndex: number, fromExternalEvent: boolean = false) => {
    const total = totalBarsRef.current || 32;
    const clampedIndex = Math.max(0, Math.min(total - 1, Math.floor(measureIndex)));
    const bPerBar = beatsPerBarRef.current || 4;
    const bpmVal = Tone.Transport.bpm.value || bpmRef.current || 120;
    const secondsPerBeat = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
    const targetSeconds = clampedIndex * bPerBar * secondsPerBeat;
    const newBar = clampedIndex + 1.0;

    try {
      Tone.Transport.seconds = targetSeconds;
    } catch (_) {}

    targetBarRef.current = newBar;
    countInStartBarRef.current = newBar;
    countInStartSecondsRef.current = targetSeconds;
    targetBarTimeRef.current = Tone.now();
    lastValidTransportSecondsRef.current = targetSeconds;
    liveRecBarRef.current = newBar;
    (window as any).__linusSeekMeasureIndex = clampedIndex;
    (window as any).__linusSeekTargetSeconds = targetSeconds;

    updatePlayheadDOM(newBar);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const rulerGrid = rulerPlayheadRef.current?.parentElement;
      const width = (rulerGrid && rulerGrid.offsetWidth > 0)
        ? rulerGrid.offsetWidth
        : (timelineWidthRef.current || 540);
      const headerOffset = rulerGrid ? rulerGrid.offsetLeft : 288;
      const progress = Math.max(0, Math.min(1, (newBar - 1) / total));
      const x = progress * width;
      const playheadPosPx = headerOffset + x;
      const viewLeft = container.scrollLeft + headerOffset;
      const viewRight = container.scrollLeft + container.clientWidth;

      if (clampedIndex === 0) {
        container.scrollLeft = 0;
      } else if (playheadPosPx > viewRight - 60 || playheadPosPx < viewLeft) {
        container.scrollLeft = Math.max(0, x - 80);
      }
    }

    if (!fromExternalEvent) {
      window.dispatchEvent(new CustomEvent('linus-seek-measure', {
        detail: {
          measureIndex: clampedIndex,
          bar: newBar,
          targetSeconds,
          source: 'daw-ruler'
        }
      }));
    }
  }, [updatePlayheadDOM]);

  // Escuchar saltos de compás disparados desde la Grilla de Acordes inferior (Jump-to-Measure)
  useEffect(() => {
    const handleExternalSeekMeasure = (e: any) => {
      if (e?.detail?.source === 'daw-ruler') return;
      const mIdx = e?.detail?.measureIndex;
      if (typeof mIdx === 'number' && !isNaN(mIdx) && mIdx >= 0) {
        seekToMeasure(mIdx, true);
      }
    };
    window.addEventListener('linus-seek-measure', handleExternalSeekMeasure);
    return () => window.removeEventListener('linus-seek-measure', handleExternalSeekMeasure);
  }, [seekToMeasure]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
    if (isVisible) {
      updatePlayheadDOM(targetBarRef.current);
    }
  }, [isVisible, updatePlayheadDOM]);

  // Medición de ancho del contenedor de timeline con ResizeObserver
  useEffect(() => {
    if (!isVisible) return;
    const firstGrid = document.querySelector('.linus-timeline-grid') as HTMLElement | null;
    if (!firstGrid) return;

    timelineWidthRef.current = firstGrid.getBoundingClientRect().width;
    updatePlayheadDOM(targetBarRef.current);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        timelineWidthRef.current = entry.contentRect.width;
        updatePlayheadDOM(targetBarRef.current);
      }
    });

    observer.observe(firstGrid);
    return () => observer.disconnect();
  }, [zoomLevel, totalBars, isVisible, updatePlayheadDOM]);

  // Sincronización del Transporte con linus-transport-position
  useEffect(() => {
    let rafId: number | null = null;

    const handlePositionEvent = (e: any) => {
      const { bar, isPlaying: playing, isCountingIn } = e.detail || {};
      const wasCountingIn = isCountingInRef.current;
      if (typeof isCountingIn === 'boolean') {
        isCountingInRef.current = isCountingIn;
      }
      if (isCountingInRef.current) {
        const holdBar = typeof bar === 'number' ? bar : (countInStartBarRef.current || targetBarRef.current || 1.0);
        countInStartBarRef.current = holdBar;
        targetBarRef.current = holdBar;
        targetBarTimeRef.current = Tone.now();
        if (isRecordingRef.current) {
          liveRecBarRef.current = holdBar;
          lastValidTransportSecondsRef.current = countInStartSecondsRef.current || 0;
          setLiveRecBar(holdBar);
        }
        if (isVisibleRef.current) {
          updatePlayheadDOM(holdBar);
        }
        if (typeof playing === 'boolean' && playing !== latestPlayingRef.current) {
          latestPlayingRef.current = playing;
          setIsPlaying(playing);
        }
        return;
      }

      // Justo cuando termina la cuenta previa (Count-in -> Compás seleccionado), fijar el inicio exacto de grabación
      if (wasCountingIn && !isCountingInRef.current && isRecordingRef.current) {
        const startBarAfterCountIn = countInStartBarRef.current || 1.0;
        const startSecAfterCountIn = countInStartSecondsRef.current || 0;
        const resetBars: Record<string, number> = {};
        tracksRef.current.forEach(t => {
          if ((t.isRecording || t.isArmed) && !isBandTrack(t.id)) {
            resetBars[t.id] = startBarAfterCountIn;
            trackRecStartSecondsRef.current[t.id] = startSecAfterCountIn;
            maxRecBarReachedRef.current[t.id] = startBarAfterCountIn;
          }
        });
        trackRecStartBarsRef.current = { ...trackRecStartBarsRef.current, ...resetBars };
        setTrackRecStartBars({ ...trackRecStartBarsRef.current });
        liveRecBarRef.current = startBarAfterCountIn;
        lastValidTransportSecondsRef.current = startSecAfterCountIn;
        setLiveRecBar(startBarAfterCountIn);
      }

      if (typeof bar === 'number') {
        const prevBar = targetBarRef.current;
        targetBarRef.current = bar;
        targetBarTimeRef.current = Tone.now();

        // Solo reiniciar Tone.Transport a 0:0:0 cuando la secuencia da la vuelta al bucle (loop wrap) y NO se está grabando
        const isLoopWrap = (bar === 1 && prevBar > 1.5 && !isRecordingRef.current && !hasActiveTakeSessionRef.current);
        if (isLoopWrap) {
          try {
            Tone.Transport.position = "0:0:0";
            Tone.Transport.seconds = 0;
            Tone.Transport.ticks = 0;
          } catch (_) {}
          (window as any).__linusSeekMeasureIndex = 0;
          (window as any).__linusSeekTargetSeconds = 0;
        }

        if (isRecordingRef.current && Tone.Transport.state !== 'started') {
          liveRecBarRef.current = Math.max(liveRecBarRef.current, bar);
          setLiveRecBar(bar);
        }

        if (isVisibleRef.current && rafId === null && Tone.Transport.state !== 'started') {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            if (isVisibleRef.current) {
              updatePlayheadDOM(targetBarRef.current);
            }
          });
        }
      }
      if (typeof playing === 'boolean' && playing !== latestPlayingRef.current) {
        latestPlayingRef.current = playing;
        setIsPlaying(playing);
      }
    };

    window.addEventListener('linus-transport-position', handlePositionEvent);
    return () => {
      window.removeEventListener('linus-transport-position', handlePositionEvent);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [updatePlayheadDOM, isBandTrack]);

  // Cálculo exacto del compás actual en el Transporte (Tone.Transport.seconds o targetBar)
  const getCurrentTransportBar = useCallback((): number => {
    if (isCountingInRef.current) {
      return countInStartBarRef.current || 1.0;
    }
    const bPerBar = beatsPerBarRef.current || 4;
    const bpmVal = bpmRef.current || 120;
    const stepDur = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
    const secondsPerBar = stepDur * bPerBar;

    if (Tone.Transport.state === 'started') {
      try {
        const sec = Tone.Transport.seconds;
        if (typeof sec === 'number' && !isNaN(sec) && sec >= 0) {
          return 1.0 + (sec / secondsPerBar);
        }
      } catch (_) {}
    }

    return targetBarRef.current || 1.0;
  }, []);

  // Obtener la posición exacta del cabezal (sin cuantización a compás) para permitir anacrusas
  const getExactRecordingStart = useCallback((): { startBar: number; startTime: number } => {
    if (isCountingInRef.current) {
      return {
        startBar: countInStartBarRef.current || 1.0,
        startTime: countInStartSecondsRef.current || 0
      };
    }
    const bPerBar = beatsPerBarRef.current || 4;
    const bpmVal = bpmRef.current || 120;
    const stepDur = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
    const secondsPerBar = stepDur * bPerBar;

    let exactSeconds = countInStartSecondsRef.current || 0;
    try {
      if (Tone.Transport.state === 'started' && typeof Tone.Transport.seconds === 'number' && !isNaN(Tone.Transport.seconds) && Tone.Transport.seconds >= 0) {
        exactSeconds = Tone.Transport.seconds;
      }
    } catch (_) {}

    const exactBar = 1.0 + (exactSeconds / secondsPerBar);
    return {
      startBar: exactBar,
      startTime: exactSeconds
    };
  }, []);

  // Loop dedicado de 60fps (requestAnimationFrame):
  // - En modo PLAY: solo actualiza la posición visual del Playhead.
  // - En modo REC (isRecording && track.isRecording): expande dinámicamente el clip rojo temporal.
  useEffect(() => {
    const recordingTracks = tracks.filter(t => (t.isRecording || t.isArmed) && !isBandTrack(t.id));
    const hasRecordingTrack = recordingTracks.length > 0;
    const isGlobalRecActive = Boolean(isRecording && hasRecordingTrack);

    if (!isPlaying && !isGlobalRecActive) {
      return;
    }

    let animId: number;
    const tick = () => {
      if (isCountingInRef.current) {
        const countInEndAudioTime = (window as any).__linusCountInEndAudioTime || 0;
        const audioCtx = interactiveAnalysisAudio.getAudioContext();
        const isStillCountingIn = countInEndAudioTime > 0 && audioCtx && audioCtx.currentTime < countInEndAudioTime;
        if (!isStillCountingIn && Tone.Transport.state === 'started') {
          isCountingInRef.current = false;
        } else {
          if (isVisibleRef.current) {
            updatePlayheadDOM(countInStartBarRef.current || 1.0);
          }
          animId = requestAnimationFrame(tick);
          return;
        }
      }

      const curBar = getCurrentTransportBar();

      if (isRecordingRef.current && hasRecordingTrack) {
        liveRecBarRef.current = curBar;
        setLiveRecBar(curBar);

        if (Tone.Transport.state === 'started' && typeof Tone.Transport.seconds === 'number' && Tone.Transport.seconds > 0) {
          lastValidTransportSecondsRef.current = Tone.Transport.seconds;
        } else {
          const bPerBar = beatsPerBarRef.current || 4;
          const bpmVal = bpmRef.current || 120;
          const stepDur = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
          const secondsPerBar = stepDur * bPerBar;
          lastValidTransportSecondsRef.current = Math.max(
            lastValidTransportSecondsRef.current,
            Math.max(0, (curBar - 1.0) * secondsPerBar)
          );
        }

        tracksRef.current.forEach(t => {
          if ((t.isRecording || t.isArmed) && !isBandTrack(t.id)) {
            const prevMax = maxRecBarReachedRef.current[t.id] || trackRecStartBarsRef.current[t.id] || 1.0;
            if (curBar > prevMax) {
              maxRecBarReachedRef.current[t.id] = curBar;
            }
          }
        });
      }

      if (isVisibleRef.current) {
        updatePlayheadDOM(curBar);
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [tracks, isPlaying, isRecording, isBandTrack, getCurrentTransportBar, updatePlayheadDOM]);

  // Sincronización pasiva del estado de transporte maestro (solo cuando no es controlado por prop masterIsPlaying)
  useEffect(() => {
    if (!isVisible || typeof masterIsPlaying === 'boolean') return;
    const syncTransport = () => {
      const btn = document.getElementById("metronome-toggle-btn");
      if (btn) {
        const txt = (btn.textContent || btn.innerText || "").toLowerCase();
        const isPlayingMaster =
          btn.getAttribute("data-playing") === "true" ||
          btn.getAttribute("data-counting-in") === "true" ||
          txt.includes("stop") ||
          txt.includes("lista") ||
          Tone.Transport.state === "started";
        if (isPlayingMaster !== latestPlayingRef.current) {
          latestPlayingRef.current = isPlayingMaster;
          setIsPlaying(isPlayingMaster);
        }
      }
    };
    syncTransport();
    const interval = setInterval(syncTransport, 400);
    return () => clearInterval(interval);
  }, [isVisible, masterIsPlaying]);

  // ============================================================================
  // MOTOR DE ENRUTAMIENTO MIDI (ROUTER GLOBAL PARA PISTAS DE USUARIO ARMADAS)
  // ============================================================================
  const onRegisterRouterRef = useRef(onRegisterRouter);
  useEffect(() => {
    onRegisterRouterRef.current = onRegisterRouter;
  }, [onRegisterRouter]);

  useEffect(() => {
    if (!onRegisterRouterRef.current) return;

    const router: MidiTrackRouter = {
      hasArmedTrack: () => {
        return tracksRef.current.some(t => !isBandTrack(t.id));
      },

      getArmedTrackInfo: () => {
        const target = tracksRef.current.find(t => t.isRecording && !isBandTrack(t.id)) ||
                       tracksRef.current.find(t => t.isArmed && !isBandTrack(t.id)) ||
                       tracksRef.current.find(t => !isBandTrack(t.id));
        if (!target) return null;
        return {
          name: target.name,
          instrument: target.instrument,
          bankId: target.bankId
        };
      },

      noteOn: (midiNote: number, velocity: number) => {
        let armedTracks = tracksRef.current.filter(t => (t.isArmed || t.isRecording) && !isBandTrack(t.id));
        if (armedTracks.length === 0 && isRecordingRef.current) {
          const fallbackUserTrack = tracksRef.current.find(t => !isBandTrack(t.id));
          if (fallbackUserTrack) {
            armedTracks = [fallbackUserTrack];
          }
        }
        if (armedTracks.length === 0) return;

        const hasSolo = tracksRef.current.some(t => t.isSolo) || interactiveAnalysisAudio.isAnySoloActive();

        // 1. Monitoreo sonoro en vivo a través del banco exclusivo de cada pista armada (Samples reales)
        armedTracks.forEach(armedTrack => {
          const isSilenced = armedTrack.isMuted || (hasSolo && !armedTrack.isSolo);
          if (!isSilenced && armedTrack.bankId && armedTrack.bankId !== 'none') {
            let sampler = trackSamplersRef.current.get(armedTrack.id);
            if (!sampler) {
              let channel = channelsRef.current.get(armedTrack.id);
              if (!channel) {
                channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
                channelsRef.current.set(armedTrack.id, channel);
              }
              const created = createTrackSampler(armedTrack.bankId, channel) || createInstrumentSynth(armedTrack.bankId, channel);
              if (created) {
                trackSamplersRef.current.set(armedTrack.id, created);
                sampler = created;
              }
            }
            if (sampler) {
              try {
                const noteName = Tone.Frequency(midiNote, 'midi').toNote();
                const velNorm = calculateMusicalVelocity(velocity);
                sampler.triggerAttack(noteName, Tone.now(), velNorm);
              } catch (_) {}
            }
          }
        });

        // 2. Captura en buffer de grabación:
        // Si el usuario solo dio Play (y isRecording global es false), las notas suenan pero NO se guardan.
        if (!isRecordingRef.current) return;

        // Sincronizar captura con el Count-in:
        // Ignorar notas tocadas durante los primeros tiempos del Count-in antes de que arranque Tone.Transport
        if (isCountingInRef.current && Tone.Transport.state !== 'started') {
          const endAudioTime = (window as any).__linusCountInEndAudioTime || 0;
          const curAudioTime = interactiveAnalysisAudio.getAudioContext()?.currentTime || 0;
          if (endAudioTime > 0 && (endAudioTime - curAudioTime) > 0.12) {
            return;
          }
        }

        const recordingTracks = armedTracks.filter(t => isRecordingRef.current && (t.isRecording || t.isArmed));
        if (recordingTracks.length === 0) return;

        const nowAudioTime = Tone.now();
        const bPerBar = beatsPerBarRef.current || 4;
        const bpmVal = bpmRef.current || 120;

        let exactNoteSeconds = 0;
        let currentTicks = 0;

        if (!isCountingInRef.current && Tone.Transport.state === 'started') {
          try {
            if (typeof Tone.Transport.seconds === 'number' && !isNaN(Tone.Transport.seconds) && Tone.Transport.seconds >= 0) {
              exactNoteSeconds = Tone.Transport.seconds;
            }
          } catch (_) {}

          try {
            if (typeof Tone.Transport.ticks === 'number' && Tone.Transport.ticks >= 0) {
              const ppq = Tone.Transport.PPQ || 192;
              const tickScale = isEighthMeterRef.current ? 2 : 1;
              currentTicks = Math.round((Tone.Transport.ticks / ppq) * TICKS_PER_BEAT * tickScale);
            }
          } catch (_) {}

          if (currentTicks <= 0 && exactNoteSeconds > 0) {
            currentTicks = secondsToTicks(exactNoteSeconds, bpmVal, isEighthMeterRef.current);
          }
        }

        const calculatedStartTicks = Math.max(0, currentTicks);
        const calculatedStartBar = 1.0 + (calculatedStartTicks / (bPerBar * TICKS_PER_BEAT));

        recordingTracks.forEach(track => {
          let trackNotesMap = activeNotesByTrackRef.current.get(track.id);
          if (!trackNotesMap) {
            trackNotesMap = new Map();
            activeNotesByTrackRef.current.set(track.id, trackNotesMap);
          }

          let trackRecordedList = recordedNotesByTrackRef.current.get(track.id);
          if (!trackRecordedList) {
            trackRecordedList = [];
            recordedNotesByTrackRef.current.set(track.id, trackRecordedList);
          }

          // Al capturar la primera nota (o anacrusa), asegurar que el startTime del clip temporal
          // use exactamente Tone.Transport.seconds sin redondear al compás
          const isFirstNoteInTake =
            trackRecordedList.length === 0 &&
            trackNotesMap.size === 0 &&
            (liveNotesByTrackRef.current[track.id]?.length || 0) === 0;

          if (isFirstNoteInTake) {
            const initialSec = Math.min(trackRecStartSecondsRef.current[track.id] ?? exactNoteSeconds, exactNoteSeconds);
            const initialBar = Math.min(trackRecStartBarsRef.current[track.id] ?? calculatedStartBar, calculatedStartBar);
            trackRecStartSecondsRef.current[track.id] = initialSec;
            trackRecStartBarsRef.current[track.id] = initialBar;
            setTrackRecStartBars(prev => ({ ...prev, [track.id]: initialBar }));
          }

          // Si la misma nota ya estaba activa en esta pista, cerrarla primero
          if (trackNotesMap.has(midiNote)) {
            const prev = trackNotesMap.get(midiNote)!;
            const durationTicks = Math.max(12, calculatedStartTicks - prev.startTicks);
            const durationBars = durationTicks / (bPerBar * TICKS_PER_BEAT);
            trackRecordedList.push({
              midi: prev.midi,
              velocity: prev.velocity,
              startTicks: prev.startTicks,
              durationTicks: durationTicks,
              startBar: prev.startBar,
              durationBars: durationBars
            });
          }

          // Guardar nota activa
          trackNotesMap.set(midiNote, {
            midi: midiNote,
            velocity,
            startTicks: calculatedStartTicks,
            startBar: calculatedStartBar,
            noteOnTime: nowAudioTime
          });

          // Actualizar liveNotesByTrack y su ref sincrónicamente para la pista
          const pitchPercent = Math.max(10, Math.min(90, ((midiNote - 36) / (84 - 36)) * 100));
          const newVisualNote: MidiNoteVisual = {
            note: midiNote,
            midi: midiNote,
            bar: calculatedStartBar,
            length: 0.25,
            pitchPercent,
            startTicks: calculatedStartTicks,
            durationTicks: Math.round(0.25 * bPerBar * TICKS_PER_BEAT)
          };
          const nextTrackLiveNotes = [...(liveNotesByTrackRef.current[track.id] || []), newVisualNote];
          liveNotesByTrackRef.current = {
            ...liveNotesByTrackRef.current,
            [track.id]: nextTrackLiveNotes
          };
          setLiveNotesByTrack(prev => ({
            ...prev,
            [track.id]: nextTrackLiveNotes
          }));
        });
      },

      noteOff: (midiNote: number) => {
        let armedTracks = tracksRef.current.filter(t => (t.isArmed || t.isRecording) && !isBandTrack(t.id));
        if (armedTracks.length === 0 && isRecordingRef.current) {
          const fallbackUserTrack = tracksRef.current.find(t => !isBandTrack(t.id));
          if (fallbackUserTrack) {
            armedTracks = [fallbackUserTrack];
          }
        }
        if (armedTracks.length === 0) return;

        // 1. Release en el sampler de cada pista armada
        armedTracks.forEach(armedTrack => {
          if (armedTrack.bankId) {
            const sampler = trackSamplersRef.current.get(armedTrack.id);
            if (sampler) {
              try {
                const noteName = Tone.Frequency(midiNote, 'midi').toNote();
                sampler.triggerRelease(noteName, Tone.now());
              } catch (_) {}
            }
          }
        });

        // 2. Condición ESTRICTA: if (isRecording)
        if (!isRecordingRef.current) return;

        const recordingTracks = armedTracks.filter(t => isRecordingRef.current && (t.isRecording || t.isArmed));
        if (recordingTracks.length === 0) return;

        const nowAudioTime = Tone.now();
        const bPerBar = beatsPerBarRef.current || 4;
        const bpmVal = bpmRef.current || 120;
        const secondsPerBeat = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);

        let endTicks = 0;
        try {
          if (Tone.Transport.state === 'started' && typeof Tone.Transport.ticks === 'number') {
            const ppq = Tone.Transport.PPQ || 192;
            const tickScale = isEighthMeterRef.current ? 2 : 1;
            endTicks = Math.round((Tone.Transport.ticks / ppq) * TICKS_PER_BEAT * tickScale);
          }
        } catch (_) {}

        if (endTicks <= 0) {
          const currentBar = getCurrentTransportBar();
          endTicks = Math.max(0, Math.round((currentBar - 1.0) * bPerBar * TICKS_PER_BEAT));
        }

        recordingTracks.forEach(track => {
          const trackNotesMap = activeNotesByTrackRef.current.get(track.id);
          const trackRecordedList = recordedNotesByTrackRef.current.get(track.id);
          if (!trackNotesMap || !trackRecordedList) return;

          const active = trackNotesMap.get(midiNote);
          if (active) {
            let durationTicks = Math.max(12, endTicks - active.startTicks);
            const realDurationSeconds = Math.max(0.04, nowAudioTime - active.noteOnTime);
            const audioDurationTicks = Math.max(12, Math.round((realDurationSeconds / secondsPerBeat) * TICKS_PER_BEAT));
            if (durationTicks <= 12 && audioDurationTicks > 12) {
              durationTicks = audioDurationTicks;
            }
            const durationBars = durationTicks / (bPerBar * TICKS_PER_BEAT);

            trackRecordedList.push({
              midi: active.midi,
              velocity: active.velocity,
              startTicks: active.startTicks,
              durationTicks: durationTicks,
              startBar: active.startBar,
              durationBars: durationBars
            });
            trackNotesMap.delete(midiNote);

            // Actualizar duración real en vista en vivo y en su ref sincrónicamente
            const updatedTrackLiveNotes = (liveNotesByTrackRef.current[track.id] || []).map(n => {
              if (n.midi === midiNote && Math.abs(n.bar - active.startBar) < 0.001) {
                return { ...n, length: durationBars, durationTicks };
              }
              return n;
            });
            liveNotesByTrackRef.current = {
              ...liveNotesByTrackRef.current,
              [track.id]: updatedTrackLiveNotes
            };
            setLiveNotesByTrack(prev => ({
              ...prev,
              [track.id]: updatedTrackLiveNotes
            }));
          }
        });
      }
    };

    onRegisterRouterRef.current(router);
    return () => {
      if (onRegisterRouterRef.current) {
        onRegisterRouterRef.current(null);
      }
    };
  }, [isBandTrack, getCurrentTransportBar]);

  // ============================================================================
  // REPRODUCCIÓN MULTIPISTA DE CLIPS GRABADOS (SINCRONIZADA CON MASTER TRANSPORT)
  // ============================================================================
  useEffect(() => {
    // Limpiar/desechar SIEMPRE cualquier Tone.Part previa antes de programar o al detener
    activePlaybackPartsRef.current.forEach(p => {
      try { p.stop(); p.dispose(); } catch (_) {}
    });
    activePlaybackPartsRef.current = [];

    // Si la reproducción está detenida, liberar todas las notas
    if (!isPlaying) {
      trackSamplersRef.current.forEach((sampler, trId) => {
        // No cortar notas de la pista armada mientras el usuario toca en vivo
        const isArmedTrack = tracksRef.current.some(t => t.id === trId && t.isArmed);
        if (!isArmedTrack) {
          try { sampler?.releaseAll(); } catch (_) {}
        }
      });
      return;
    }

    // Al iniciar PLAY, programar un Tone.Part por cada pista de usuario con clips
    const newParts: Tone.Part[] = [];
    const bPerBar = beatsPerBarRef.current || 4;
    const bpmVal = bpmRef.current || 120;
    const totalBarsVal = totalBarsRef.current || 32;

    try {
      Tone.Transport.bpm.value = bpmVal;
    } catch (_) {}

    tracks.forEach(track => {
      if (isBandTrack(track.id)) return;
      if (!track.bankId) return;

      const trackClips = (track.regions && track.regions.length > 0)
        ? track.regions
        : (userClips[track.id] || []);
      if (trackClips.length === 0) return;

      const events: Array<{ time: number; noteName: string; duration: number; velocity: number }> = [];

      trackClips.forEach(clip => {
        const clipStartTicks = barsToTicks(clip.startBar, bPerBar);

        clip.notes.forEach(note => {
          // Obtener startTicks y durationTicks RAW
          const nStartTicks = typeof note.startTicks === 'number'
            ? note.startTicks
            : barsToTicks(note.bar, bPerBar);

          const nDurationTicks = typeof note.durationTicks === 'number'
            ? note.durationTicks
            : Math.max(1, Math.round(note.length * bPerBar * TICKS_PER_BEAT));

          // Si la nota ya viene con posición absoluta de canción (bar >= 1.0 o time explícito), usar su posición exacta sin sumarle clipStartTicks
          const hasAbsoluteSongPosition =
            (typeof note.time === 'number' && !isNaN(note.time)) ||
            (typeof note.bar === 'number' && !isNaN(note.bar) && note.bar >= 1.0);

          const absoluteAttackTicks = hasAbsoluteSongPosition
            ? Math.max(0, nStartTicks)
            : (nStartTicks >= clipStartTicks ? nStartTicks : clipStartTicks + nStartTicks);

          const attackTimeSeconds =
            typeof note.time === 'number' && !isNaN(note.time)
              ? Math.max(0, note.time)
              : ticksToSeconds(absoluteAttackTicks, bpmVal, isEighthMeter);

          const durationSeconds =
            typeof note.duration === 'number' && !isNaN(note.duration)
              ? Math.max(0.04, note.duration)
              : Math.max(0.04, ticksToSeconds(nDurationTicks, bpmVal, isEighthMeter));

          const midiNum = note.note || note.midi || Math.round(note.pitchPercent * 0.48 + 36);
          const noteName = note.noteName || Tone.Frequency(midiNum, 'midi').toNote();
          const velNorm = note.velocity ? calculateMusicalVelocity(note.velocity) : 0.8;

          events.push({
            time: attackTimeSeconds,
            noteName,
            duration: durationSeconds,
            velocity: velNorm
          });
        });
      });

      if (events.length > 0) {
        try {
          // Asegurar que el Sampler real de la pista esté instanciado antes de iniciar el Tone.Part
          if (!trackSamplersRef.current.has(track.id) && track.bankId && track.bankId !== 'none') {
            let channel = channelsRef.current.get(track.id);
            if (!channel) {
              channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
              channelsRef.current.set(track.id, channel);
            }
            const preCreated = createTrackSampler(track.bankId, channel) || createInstrumentSynth(track.bankId, channel);
            if (preCreated) {
              trackSamplersRef.current.set(track.id, preCreated);
            }
          }

          const part = new Tone.Part((time, ev) => {
            try {
              const currentTracks = tracksRef.current;
              const currentTrack = currentTracks.find(t => t.id === track.id);
              const anySolo = currentTracks.some(t => t.isSolo) || interactiveAnalysisAudio.isAnySoloActive();
              if (currentTrack && (currentTrack.isMuted || (anySolo && !currentTrack.isSolo))) {
                return;
              }
              let sampler = trackSamplersRef.current.get(track.id);
              if (!sampler && track.bankId && track.bankId !== 'none') {
                let channel = channelsRef.current.get(track.id);
                if (!channel) {
                  channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
                  channelsRef.current.set(track.id, channel);
                }
                const created = createTrackSampler(track.bankId, channel) || createInstrumentSynth(track.bankId, channel);
                if (created) {
                  trackSamplersRef.current.set(track.id, created);
                  sampler = created;
                }
              }
              if (sampler) {
                sampler.triggerAttackRelease(ev.noteName, ev.duration, time, ev.velocity);
              }
            } catch (_) {}
          }, events);

          // Configurar loop automático del Tone.Part con la duración total del arreglo
          part.loop = true;
          part.loopStart = 0;
          part.loopEnd = ticksToSeconds(totalBarsVal * bPerBar * TICKS_PER_BEAT, bpmVal, isEighthMeter);

          part.start(0);
          newParts.push(part);
        } catch (_) {}
      }
    });

    activePlaybackPartsRef.current = newParts;

    return () => {
      newParts.forEach(p => {
        try { p.stop(); p.dispose(); } catch (_) {}
      });
      activePlaybackPartsRef.current = [];
    };
  }, [isPlaying, tracks, userClips, isBandTrack, bpm, beatsPerBar, totalBars, isEighthMeter]);

  // ============================================================================
  // MANEJADORES DE PISTAS (MUTE, SOLO, ARM, VOL, PAN, NOMBRE, BANCO, ELIMINAR)
  // ============================================================================

  // Manejo de MUTE
  const toggleMute = useCallback((trackId: string) => {
    if (trackId === 't-1') {
      interactiveAnalysisAudio.toggleChannelMute('piano');
      return;
    }
    if (trackId === 't-2') {
      interactiveAnalysisAudio.toggleChannelMute('bass');
      return;
    }
    if (trackId === 't-3') {
      interactiveAnalysisAudio.toggleChannelMute('drums');
      return;
    }

    setTracks(prev => {
      const next = prev.map(t => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
      tracksRef.current = next;
      applyCrossEngineSoloAndMute(next);
      return next;
    });
  }, [applyCrossEngineSoloAndMute]);

  // Manejo de SOLO (integrado transversalmente entre Banda Linus y dawTracks)
  const toggleSolo = useCallback((trackId: string) => {
    if (trackId === 't-1') {
      interactiveAnalysisAudio.toggleChannelSolo('piano');
      applyCrossEngineSoloAndMute(tracksRef.current);
      return;
    }
    if (trackId === 't-2') {
      interactiveAnalysisAudio.toggleChannelSolo('bass');
      applyCrossEngineSoloAndMute(tracksRef.current);
      return;
    }
    if (trackId === 't-3') {
      interactiveAnalysisAudio.toggleChannelSolo('drums');
      applyCrossEngineSoloAndMute(tracksRef.current);
      return;
    }

    setTracks(prev => {
      const next = prev.map(t => (t.id === trackId ? { ...t, isSolo: !t.isSolo } : t));
      tracksRef.current = next;
      applyCrossEngineSoloAndMute(next);
      return next;
    });
  }, [applyCrossEngineSoloAndMute]);

  // Manejo de ARM (Una sola pista armada a la vez para monitoreo en vivo con [R])
  const toggleArm = useCallback((trackId: string) => {
    if (isBandTrack(trackId)) return;
    setSelectedTrackId(trackId);
    setSelectedClipId(null);

    setTracks(prev => {
      const target = prev.find(t => t.id === trackId);
      const willBeArmed = !target?.isArmed;

      // Liberar notas en la pista armada anteriormente
      prev.forEach(t => {
        if (t.isArmed && t.id !== trackId) {
          const s = trackSamplersRef.current.get(t.id);
          try { s?.releaseAll(); } catch (_) {}
        }
      });

      const next = prev.map(t => {
        if (t.id === trackId) {
          return { ...t, isArmed: willBeArmed, isRecording: willBeArmed ? true : t.isRecording };
        }
        return { ...t, isArmed: false };
      });
      tracksRef.current = next;
      return next;
    });
  }, [isBandTrack]);

  // Manejo de GRABACIÓN INDIVIDUAL POR PISTA (Botón circular rojo ⏺)
  const handleToggleRecord = useCallback((trackId: string) => {
    if (isBandTrack(trackId)) return;
    setSelectedTrackId(trackId);
    setSelectedClipId(null);

    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          const nextRec = !t.isRecording;
          if (nextRec && isRecordingRef.current) {
            const { startBar: exactBar, startTime: exactSec } = getExactRecordingStart();

            trackRecStartBarsRef.current[trackId] = exactBar;
            trackRecStartSecondsRef.current[trackId] = exactSec;
            maxRecBarReachedRef.current[trackId] = exactBar;
            setTrackRecStartBars(s => ({ ...s, [trackId]: exactBar }));

            if (!activeNotesByTrackRef.current.has(trackId)) {
              activeNotesByTrackRef.current.set(trackId, new Map());
            }
            if (!recordedNotesByTrackRef.current.has(trackId)) {
              recordedNotesByTrackRef.current.set(trackId, []);
            }
          }
          return {
            ...t,
            isRecording: nextRec,
            // Al encender ⏺, también aseguramos isArmed: true para monitoreo en vivo inmediato
            isArmed: nextRec ? true : t.isArmed
          };
        }
        return t;
      });
      tracksRef.current = next;
      return next;
    });
  }, [isBandTrack, getExactRecordingStart]);

  // Manejo de VOLUMEN
  const handleVolumeChange = useCallback((trackId: string, newVol: number) => {
    const safeVol = Math.max(0, Math.min(4.2, Number(newVol) || 0));
    if (trackId === 't-1') {
      interactiveAnalysisAudio.setChannelGainDirect('piano', safeVol);
    } else if (trackId === 't-2') {
      interactiveAnalysisAudio.setChannelGainDirect('bass', safeVol);
    } else if (trackId === 't-3') {
      interactiveAnalysisAudio.setChannelGainDirect('drums', safeVol);
    }

    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          return {
            ...t,
            volume: safeVol,
            volumeDb: gainToDbString(safeVol)
          };
        }
        return t;
      });
      tracksRef.current = next;
      applyCrossEngineSoloAndMute(next);
      return next;
    });
  }, [applyCrossEngineSoloAndMute]);

  // Manejo directo de PANEO continuo (-1.0 a 1.0) desde el Mixer
  const handlePanChange = useCallback((trackId: string, panNum: number) => {
    const clampedPan = Math.max(-1, Math.min(1, Number(panNum) || 0));
    const p50 = Math.round(clampedPan * 50);
    const panStr = p50 === 0 ? 'C' : p50 < 0 ? `L ${Math.abs(p50)}` : `R ${p50}`;

    if (trackId === 't-1') {
      interactiveAnalysisAudio.setChannelPanDirect('piano', clampedPan);
    } else if (trackId === 't-2') {
      interactiveAnalysisAudio.setChannelPanDirect('bass', clampedPan);
    } else if (trackId === 't-3') {
      // Batería
    } else {
      const channel = channelsRef.current.get(trackId);
      if (channel) {
        channel.pan.value = clampedPan;
      }
    }

    setTracks(prev => {
      const next = prev.map(t => (t.id === trackId ? { ...t, pan: panStr } : t));
      tracksRef.current = next;
      return next;
    });
  }, []);

  // Manejo de PANEO discreto en el cabezal del DAW
  const handlePanToggle = useCallback((trackId: string) => {
    const pans = ['L 30', 'L 15', 'C', 'R 15', 'R 30'];
    const panValues = [-0.3, -0.15, 0, 0.15, 0.3];

    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          const currentIdx = pans.indexOf(t.pan);
          const nextIdx = (currentIdx + 1) % pans.length;
          const nextPan = pans[nextIdx];
          const panNum = panValues[nextIdx];

          if (trackId === 't-1') {
            interactiveAnalysisAudio.setChannelPanDirect('piano', panNum);
          } else if (trackId === 't-2') {
            interactiveAnalysisAudio.setChannelPanDirect('bass', panNum);
          } else if (trackId === 't-3') {
            // Batería
          } else {
            const channel = channelsRef.current.get(trackId);
            if (channel) {
              channel.pan.value = panNum;
            }
          }

          return { ...t, pan: nextPan };
        }
        return t;
      });
      tracksRef.current = next;
      return next;
    });
  }, []);

  // Manejo de EDICIÓN DE NOMBRE DE PISTA
  const handleUpdateTrackName = useCallback((trackId: string, newName: string) => {
    setTracks(prev => {
      const next = prev.map(t => (t.id === trackId ? { ...t, name: newName } : t));
      tracksRef.current = next;
      return next;
    });
  }, []);

  // Manejo de CAMBIO DE BANCO DE SONIDO POR PISTA
  const handleBankChange = useCallback(async (trackId: string, newBankId: string) => {
    setSelectedTrackId(trackId);
    // 1. Desconectar y liberar sampler existente de esa pista
    const existingSampler = trackSamplersRef.current.get(trackId);
    if (existingSampler) {
      try { existingSampler.releaseAll(); } catch (_) {}
      try { existingSampler.disconnect(); } catch (_) {}
      try { (existingSampler as any).dispose?.(); } catch (_) {}
      trackSamplersRef.current.delete(trackId);
    }

    const bankMeta = LIVE_MIDI_BANKS.find(b => b.id === newBankId);
    const instrumentName = bankMeta ? bankMeta.name : 'Sin instrumento';
    const hasValidBank = Boolean(newBankId && newBankId !== 'none');

    setTracks(prev => {
      const anyOtherArmed = prev.some(t => t.id !== trackId && t.isArmed && !isBandTrack(t.id));
      const next = prev.map(t => {
        if (t.id === trackId) {
          return {
            ...t,
            bankId: newBankId,
            instrument: instrumentName,
            isArmed: hasValidBank && !anyOtherArmed ? true : t.isArmed,
            isRecording: hasValidBank ? true : t.isRecording
          };
        }
        return t;
      });
      tracksRef.current = next;
      return next;
    });

    // Si se seleccionó "Sin instrumento", queda silenciado
    if (!hasValidBank) {
      return;
    }

    // 2. Instanciar inmediatamente el Multi-Sampler de muestras reales conectado al canal dedicado de la pista
    let channel = channelsRef.current.get(trackId);
    if (!channel) {
      channel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
      channelsRef.current.set(trackId, channel);
      try {
        const meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });
        channel.connect(meter);
        trackMetersRef.current.set(trackId, meter);
      } catch (_) {}
    }
    const sampler = createTrackSampler(newBankId, channel) || createInstrumentSynth(newBankId, channel);
    if (sampler) {
      trackSamplersRef.current.set(trackId, sampler);
    }
  }, [isBandTrack]);

  // Manejo de ELIMINACIÓN DE PISTA DE USUARIO
  const handleDeleteTrack = useCallback((trackId: string) => {
    if (isBandTrack(trackId)) return;

    // Liberar sampler y notas activas
    const sampler = trackSamplersRef.current.get(trackId);
    if (sampler) {
      try { sampler.releaseAll(); } catch (_) {}
      try { sampler.disconnect(); } catch (_) {}
      try { (sampler as any).dispose?.(); } catch (_) {}
      trackSamplersRef.current.delete(trackId);
    }

    // Desechar medidor de nivel
    const meter = trackMetersRef.current.get(trackId);
    if (meter) {
      try { meter.dispose(); } catch (_) {}
      trackMetersRef.current.delete(trackId);
    }

    // Desechar canal de audio
    const ch = channelsRef.current.get(trackId);
    if (ch) {
      try { ch.dispose(); } catch (_) {}
      channelsRef.current.delete(trackId);
    }

    // Limpiar buffers de grabación de esa pista
    activeNotesByTrackRef.current.delete(trackId);
    recordedNotesByTrackRef.current.delete(trackId);
    delete trackRecStartBarsRef.current[trackId];
    delete trackRecStartSecondsRef.current[trackId];
    delete maxRecBarReachedRef.current[trackId];

    // Eliminar pista y sus clips
    setTracks(prev => {
      const next = prev.filter(t => t.id !== trackId);
      tracksRef.current = next;
      applyCrossEngineSoloAndMute(next);
      return next;
    });
    setUserClips(prev => {
      const next = { ...prev };
      delete next[trackId];
      return next;
    });
    setSelectedClipId(null);
    setSelectedTrackId(prev => (prev === trackId ? null : prev));
  }, [isBandTrack, applyCrossEngineSoloAndMute]);

  // Manejo de ELIMINACIÓN DE CLIP ESPECÍFICO
  const handleDeleteClip = useCallback((clipIdToDelete: string) => {
    if (!clipIdToDelete) return;
    // Ignorar clips pertenecientes a la Banda Linus
    if (
      clipIdToDelete.startsWith('piano-chord-') ||
      clipIdToDelete.startsWith('bass-chord-') ||
      clipIdToDelete.startsWith('drum-bar-') ||
      clipIdToDelete === 'c-1' ||
      clipIdToDelete === 'c-2' ||
      clipIdToDelete === 'c-3'
    ) {
      return;
    }

    setTracks(prevTracks => {
      const nextTracks = prevTracks.map(track => {
        if (isBandTrack(track.id)) return track;
        const currentRegions = Array.isArray(track.regions) ? track.regions : [];
        const currentClips = Array.isArray(track.clips) ? track.clips : [];
        const hasInRegions = currentRegions.some(r => r.id === clipIdToDelete);
        const hasInClips = currentClips.some(c => c.id === clipIdToDelete);
        if (!hasInRegions && !hasInClips) return track;

        const sampler = trackSamplersRef.current.get(track.id);
        if (sampler) {
          try { sampler.releaseAll(); } catch (_) {}
        }

        const filteredRegions = currentRegions.filter(r => r.id !== clipIdToDelete);
        const filteredClips = currentClips.filter(c => c.id !== clipIdToDelete);
        const effectiveRemaining = filteredRegions.length > 0 ? filteredRegions : filteredClips;

        return {
          ...track,
          regions: filteredRegions,
          clips: filteredClips,
          recordedNotes: effectiveRemaining.flatMap(c => c.notes || [])
        };
      });
      tracksRef.current = nextTracks;
      return nextTracks;
    });

    setUserClips(prevClips => {
      const nextClips: Record<string, MidiClip[]> = {};
      for (const [trackId, list] of Object.entries(prevClips)) {
        nextClips[trackId] = (list || []).filter(c => c.id !== clipIdToDelete);
      }
      return nextClips;
    });

    setSelectedClipId(null);
  }, [isBandTrack]);

  // Eliminación de clip o pista de usuario con Delete o Backspace (deshabilitado cuando el Piano Roll está abierto)
  useEffect(() => {
    const handleKeyDownDelete = (e: KeyboardEvent) => {
      if (editingTrack) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      const activeEl = document.activeElement as HTMLElement | null;
      const target = e.target as HTMLElement | null;
      const isTyping =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) return;

      // 1. Si hay un clip seleccionado de una pista de usuario, borrar ese clip
      if (selectedClipId) {
        const isBandClip =
          selectedClipId.startsWith('piano-chord-') ||
          selectedClipId.startsWith('bass-chord-') ||
          selectedClipId.startsWith('drum-bar-') ||
          selectedClipId === 'c-1' ||
          selectedClipId === 'c-2' ||
          selectedClipId === 'c-3';

        if (!isBandClip) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleDeleteClip(selectedClipId);
          return;
        }
      }

      // 2. Si el usuario está posicionado sobre una pista de usuario (selectedTrackId), eliminar la pista MIDI
      if (selectedTrackId && !isBandTrack(selectedTrackId)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleDeleteTrack(selectedTrackId);
      }
    };

    window.addEventListener('keydown', handleKeyDownDelete, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDownDelete, { capture: true });
  }, [selectedClipId, selectedTrackId, editingTrack, isBandTrack, handleDeleteClip, handleDeleteTrack]);

  // AGREGAR NUEVA PISTA MIDI VACÍA (+ NUEVA PISTA)
  // Garantiza: 1 CLIC = EXACTAMENTE 1 PISTA con ID ÚNICO REAL e instancia independiente
  const handleAddTrack = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    nextTrackIndexRef.current += 1;
    const userIndex = nextTrackIndexRef.current;
    const newTrack: TrackData = {
      ...createMidiTrack(userIndex),
      isArmed: true,
      isRecording: true
    };

    // Crear canal Tone.Channel dedicado para esta pista (Gain + Pan a Master)
    const newChannel = new Tone.Channel({ volume: 0, pan: 0 }).toDestination();
    channelsRef.current.set(newTrack.id, newChannel);
    try {
      const meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });
      newChannel.connect(meter);
      trackMetersRef.current.set(newTrack.id, meter);
    } catch (_) {}

    setTracks(prev => {
      const next = prev.map(t => (isBandTrack(t.id) ? t : { ...t, isArmed: false })).concat(newTrack);
      tracksRef.current = next;
      applyCrossEngineSoloAndMute(next);
      return next;
    });
    setSelectedTrackId(newTrack.id);
    setSelectedClipId(null);
  }, [isBandTrack, applyCrossEngineSoloAndMute]);

  // ============================================================================
  // TRANSPORTE MASTER Y GRABACIÓN (PLAY, STOP, REC)
  // ============================================================================
  // ============================================================================
  // UNIFIED MASTER TRANSPORT & MIDI RECORDING ARCHITECTURE
  // ============================================================================

  // 1. Iniciar grabación MIDI (exclusivamente al presionar el botón explícito de REC)
  const startMidiRecording = useCallback(() => {
    if (isRecordingRef.current && hasActiveTakeSessionRef.current) return;

    // Verificar pistas que tienen isRecording: true (⏺ encendido)
    let recordingTracks = tracksRef.current.filter(t => t.isRecording && !isBandTrack(t.id));
    if (recordingTracks.length === 0) {
      // Si ninguna tiene isRecording activo pero hay una con isArmed: true (o cualquier pista de usuario), activar isRecording en esa pista al presionar Master REC
      const targetUserTrack =
        tracksRef.current.find(t => t.isArmed && !isBandTrack(t.id)) ||
        tracksRef.current.find(t => !isBandTrack(t.id));
      if (targetUserTrack) {
        const nextTracks = tracksRef.current.map(t =>
          t.id === targetUserTrack.id ? { ...t, isRecording: true, isArmed: true } : t
        );
        tracksRef.current = nextTracks;
        setTracks(nextTracks);
        recordingTracks = [{ ...targetUserTrack, isRecording: true, isArmed: true }];
      } else {
        return;
      }
    }

    const bpmVal = bpmRef.current || 120;

    setIsRecording(true);
    isRecordingRef.current = true;
    hasActiveTakeSessionRef.current = true;

    // Usar exactamente Tone.Transport.seconds (o 1.0 / 0s si estamos en Count-in)
    const { startBar: currentBar, startTime: currentSec } = getExactRecordingStart();

    const newStartBars: Record<string, number> = {};
    recordingTracks.forEach(t => {
      newStartBars[t.id] = currentBar;
      trackRecStartSecondsRef.current[t.id] = currentSec;
      maxRecBarReachedRef.current[t.id] = currentBar;
      activeNotesByTrackRef.current.set(t.id, new Map());
      recordedNotesByTrackRef.current.set(t.id, []);
    });

    trackRecStartBarsRef.current = { ...trackRecStartBarsRef.current, ...newStartBars };
    setTrackRecStartBars({ ...trackRecStartBarsRef.current });
    liveRecBarRef.current = currentBar;
    lastValidTransportSecondsRef.current = currentSec;
    setLiveRecBar(currentBar);
    liveNotesByTrackRef.current = {};
    setLiveNotesByTrack({});

    try {
      Tone.Transport.bpm.value = bpmVal;
      // Solo iniciar Tone.Transport directamente si no existe el Master Metronome (que gestiona el Count-in de 4 tiempos)
      const metroBtn = document.getElementById("metronome-toggle-btn");
      if (!metroBtn && Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
    } catch (_) {}
  }, [isBandTrack, getExactRecordingStart]);

  // 2. Detener grabación MIDI y consolidar Clips (TAKE) por pista en OnStop
  const stopMidiRecording = useCallback(() => {
    const bPerBar = beatsPerBarRef.current || 4;
    const bpmVal = bpmRef.current || 120;
    const nowAudioTime = Tone.now();
    const secondsPerBeat = isEighthMeterRef.current ? (60 / bpmVal) / 2 : (60 / bpmVal);
    const secondsPerBar = secondsPerBeat * bPerBar;

    // Capturar el tiempo exacto de Tone.Transport ANTES de cualquier limpieza o reset
    let transportSecondsNow = lastValidTransportSecondsRef.current;
    try {
      if (typeof Tone.Transport.seconds === 'number' && !isNaN(Tone.Transport.seconds) && Tone.Transport.seconds > 0) {
        transportSecondsNow = Math.max(transportSecondsNow, Tone.Transport.seconds);
      }
    } catch (_) {}

    const barSecondsNow = Math.max(0, (liveRecBarRef.current - 1.0) * secondsPerBar);
    const effectiveStopSeconds = Math.max(transportSecondsNow, barSecondsNow);

    let endTicks = 0;
    try {
      if (Tone.Transport.state === 'started' && typeof Tone.Transport.ticks === 'number' && Tone.Transport.ticks > 0) {
        const ppq = Tone.Transport.PPQ || 192;
        const tickScale = isEighthMeterRef.current ? 2 : 1;
        endTicks = Math.round((Tone.Transport.ticks / ppq) * TICKS_PER_BEAT * tickScale);
      }
    } catch (_) {}

    if (endTicks <= 0) {
      endTicks = Math.max(0, secondsToTicks(effectiveStopSeconds, bpmVal, isEighthMeterRef.current));
    }

    // Cerrar notas activas pendientes en todas las pistas que estaban grabando
    activeNotesByTrackRef.current.forEach((notesMap, trackId) => {
      if (notesMap.size === 0) return;
      let trackRecordedList = recordedNotesByTrackRef.current.get(trackId);
      if (!trackRecordedList) {
        trackRecordedList = [];
        recordedNotesByTrackRef.current.set(trackId, trackRecordedList);
      }
      notesMap.forEach(active => {
        let durationTicks = Math.max(12, endTicks - active.startTicks);
        const realDurationSeconds = Math.max(0.04, nowAudioTime - active.noteOnTime);
        const audioDurationTicks = Math.max(12, Math.round((realDurationSeconds / secondsPerBeat) * TICKS_PER_BEAT));
        if (durationTicks <= 12 && audioDurationTicks > 12) {
          durationTicks = audioDurationTicks;
        }
        const durationBars = durationTicks / (bPerBar * TICKS_PER_BEAT);
        trackRecordedList!.push({
          midi: active.midi,
          velocity: active.velocity,
          startTicks: active.startTicks,
          durationTicks: durationTicks,
          startBar: active.startBar,
          durationBars: durationBars
        });
      });
      notesMap.clear();
    });

    // Identificar pistas con grabación activa o notas en el buffer temporal
    const candidateTracks = tracksRef.current.filter(t => {
      if (isBandTrack(t.id)) return false;
      const hasRecorded = (recordedNotesByTrackRef.current.get(t.id)?.length || 0) > 0;
      const hasLive = (liveNotesByTrackRef.current[t.id]?.length || 0) > 0;
      return Boolean(t.isRecording || t.isArmed || hasRecorded || hasLive);
    });

    const hadActiveSession = isRecordingRef.current || hasActiveTakeSessionRef.current;
    isRecordingRef.current = false;
    hasActiveTakeSessionRef.current = false;
    setIsRecording(false);

    // Liberar todos los samplers
    trackSamplersRef.current.forEach(s => {
      try { s?.releaseAll(); } catch (_) {}
    });

    if (!hadActiveSession && candidateTracks.every(t => (recordedNotesByTrackRef.current.get(t.id)?.length || 0) === 0 && (liveNotesByTrackRef.current[t.id]?.length || 0) === 0)) {
      return;
    }

    // Construir el mapa de clips definitivos (finalClip) por cada pista grabada
    const consolidatedClipsByTrack = new Map<string, MidiClip>();

    candidateTracks.forEach(track => {
      const recordedNotes = recordedNotesByTrackRef.current.get(track.id) || [];
      const liveVisualNotes = liveNotesByTrackRef.current[track.id] || [];

      // Si no hay notas grabadas en esta pista, no crear fragmentos vacíos
      if (recordedNotes.length === 0 && liveVisualNotes.length === 0) {
        return;
      }

      const recStartBar = trackRecStartBarsRef.current[track.id] || 1.0;
      const startTime = typeof trackRecStartSecondsRef.current[track.id] === 'number'
        ? trackRecStartSecondsRef.current[track.id]
        : Math.max(0, (recStartBar - 1.0) * secondsPerBar);

      const maxTrackBar = Math.max(
        liveRecBarRef.current,
        maxRecBarReachedRef.current[track.id] || recStartBar
      );
      const trackStopSeconds = Math.max(
        effectiveStopSeconds,
        Math.max(0, (maxTrackBar - 1.0) * secondsPerBar)
      );

      // 1. Cálculo Preciso de Duración:
      // Fórmula: const clipDuration = Tone.Transport.seconds - activeRecording.startTime;
      // Nunca permitir que la duración sea 0 o negativa.
      const rawClipDuration = trackStopSeconds - startTime;
      let clipDuration = Math.max(secondsPerBar * 0.25, rawClipDuration);

      // Normalización de notas: usar recordedNotes (con cierre exacto de NoteOff) o fallback a liveVisualNotes
      const normalizedNotes: MidiNoteVisual[] = recordedNotes.length > 0
        ? recordedNotes.map(n => ({
            note: n.midi,
            midi: n.midi,
            noteName: Tone.Frequency(n.midi, 'midi').toNote(),
            velocity: n.velocity,
            startTicks: n.startTicks,
            durationTicks: n.durationTicks,
            bar: n.startBar,
            length: Math.max(0.05, n.durationBars),
            pitchPercent: Math.max(10, Math.min(90, ((n.midi - 36) / (84 - 36)) * 100))
          }))
        : liveVisualNotes.map(n => {
            const midiNum = n.midi || n.note || 60;
            return {
              ...n,
              note: midiNum,
              midi: midiNum,
              noteName: n.noteName || Tone.Frequency(midiNum, 'midi').toNote(),
              velocity: n.velocity || 100,
              bar: n.bar,
              length: Math.max(0.05, n.length || 0.25),
              pitchPercent: n.pitchPercent ?? Math.max(10, Math.min(90, ((midiNum - 36) / (84 - 36)) * 100))
            };
          });

      const minNoteBar = Math.min(...normalizedNotes.map(n => n.bar));
      const maxNoteEndBar = Math.max(...normalizedNotes.map(n => n.bar + n.length));

      const finalStartBar = Math.max(1.0, Math.min(recStartBar, minNoteBar));
      const durationFromSecondsBars = clipDuration / secondsPerBar;
      const durationFromNotesBars = maxNoteEndBar - finalStartBar;
      const finalDurationBars = Math.max(0.25, durationFromSecondsBars, durationFromNotesBars);

      clipDuration = Math.max(clipDuration, finalDurationBars * secondsPerBar);

      const existingRegions = track.regions && track.regions.length > 0
        ? track.regions
        : (userClips[track.id] || []);
      const takeNum = existingRegions.length + 1;
      const uniqueClipId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `clip-${track.id}-${Date.now()}-${takeNum}`;

      // 2. Empaquetado del Clip Definitivo con la estructura exacta que TimelineGrid / MidiClipView espera:
      const finalClip: MidiClip = {
        id: uniqueClipId,
        trackId: track.id,
        name: `TAKE ${String(takeNum).padStart(2, '0')}`,
        startTime: startTime,
        duration: clipDuration,
        startBar: finalStartBar,
        durationBars: Number(finalDurationBars.toFixed(3)),
        startTicks: barsToTicks(finalStartBar, bPerBar),
        durationTicks: Math.max(12, barsToTicks(finalStartBar + finalDurationBars, bPerBar) - barsToTicks(finalStartBar, bPerBar)),
        notes: normalizedNotes
      };

      consolidatedClipsByTrack.set(track.id, finalClip);
    });

    // 3. Actualización de Estado Inmutable y Segura:
    // Primero guardar el clip en la pista (track.regions) y userClips usando actualización funcional estricta
    if (consolidatedClipsByTrack.size > 0) {
      setTracks(prevTracks => {
        const nextTracks = prevTracks.map(track => {
          const finalClip = consolidatedClipsByTrack.get(track.id);
          if (!finalClip) return track;
          const prevRegions = Array.isArray(track.regions) ? track.regions : [];
          return {
            ...track,
            regions: [...prevRegions, finalClip]
          };
        });
        tracksRef.current = nextTracks;
        return nextTracks;
      });

      setUserClips(prevClips => {
        const nextClips = { ...prevClips };
        consolidatedClipsByTrack.forEach((finalClip, trackId) => {
          const prevList = nextClips[trackId] || [];
          nextClips[trackId] = [...prevList, finalClip];
        });
        return nextClips;
      });
    }

    // 4. SOLO DESPUÉS de hacer setTracks, ejecutar la limpieza del buffer temporal (activeRecording = null)
    candidateTracks.forEach(track => {
      recordedNotesByTrackRef.current.set(track.id, []);
      activeNotesByTrackRef.current.set(track.id, new Map());
      trackRecStartBarsRef.current[track.id] = 1.0;
      trackRecStartSecondsRef.current[track.id] = 0;
      maxRecBarReachedRef.current[track.id] = 1.0;
    });
    setTrackRecStartBars({ ...trackRecStartBarsRef.current });
    liveRecBarRef.current = 1.0;
    lastValidTransportSecondsRef.current = 0;
    setLiveRecBar(1.0);
    liveNotesByTrackRef.current = {};
    setLiveNotesByTrack({});
  }, [isBandTrack, userClips]);

  // 3. Detención de reproducción y consolidación de grabación (preservando la posición actual)
  const stopAllPlaybackAndRecording = useCallback(() => {
    stopMidiRecording();

    activePlaybackPartsRef.current.forEach(p => {
      try { p.stop(); p.dispose(); } catch (_) {}
    });
    activePlaybackPartsRef.current = [];

    trackSamplersRef.current.forEach(s => {
      try { s?.releaseAll(); } catch (_) {}
    });

    isCountingInRef.current = false;
    latestPlayingRef.current = false;
    setIsPlaying(false);
  }, [stopMidiRecording]);

  // Botón "Volver al Inicio" (Rewind / Go to Start)
  const goToStart = useCallback(() => {
    stopMidiRecording();

    activePlaybackPartsRef.current.forEach(p => {
      try { p.stop(); p.dispose(); } catch (_) {}
    });
    activePlaybackPartsRef.current = [];

    trackSamplersRef.current.forEach(s => {
      try { s?.releaseAll(); } catch (_) {}
    });

    if (onMasterStop) {
      onMasterStop();
    } else {
      window.dispatchEvent(new CustomEvent('global-playback-stop'));
    }

    isCountingInRef.current = false;
    countInStartBarRef.current = 1.0;
    countInStartSecondsRef.current = 0;

    try {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
      Tone.Transport.seconds = 0;
      Tone.Transport.ticks = 0;
    } catch (_) {}

    (window as any).__linusSeekMeasureIndex = 0;
    (window as any).__linusSeekTargetSeconds = 0;
    targetBarRef.current = 1.0;
    lastValidTransportSecondsRef.current = 0;
    latestPlayingRef.current = false;
    setIsPlaying(false);

    updatePlayheadDOM(1.0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }

    window.dispatchEvent(new CustomEvent('linus-seek-measure', {
      detail: {
        measureIndex: 0,
        bar: 1.0,
        targetSeconds: 0
      }
    }));
  }, [onMasterStop, stopMidiRecording, updatePlayheadDOM]);

  // Manejadores delegados al Master Transport (Respetando la posición actual del Playhead)
  const togglePlayback = useCallback(() => {
    if (!effectiveIsPlaying && !latestPlayingRef.current && Tone.Transport.state !== 'started') {
      const currentBar = targetBarRef.current || 1.0;
      const bPerBar = beatsPerBarRef.current || 4;
      const bpmVal = Tone.Transport.bpm.value || bpmRef.current || 120;
      const secondsPerBeat = 60 / bpmVal;
      const currentSeconds = Math.max(0, (currentBar - 1.0) * bPerBar * secondsPerBeat);

      countInStartBarRef.current = currentBar;
      countInStartSecondsRef.current = currentSeconds;
      lastValidTransportSecondsRef.current = currentSeconds;

      try {
        Tone.Transport.seconds = currentSeconds;
      } catch (_) {}

      const isMetronomeEnabled = interactiveAnalysisAudio.isMetronomeActive();
      isCountingInRef.current = isMetronomeEnabled;
      updatePlayheadDOM(currentBar);
    }
    if (onMasterPlay) {
      onMasterPlay();
      return;
    }
    const btn = document.getElementById("metronome-toggle-btn");
    if (btn) btn.click();
  }, [effectiveIsPlaying, onMasterPlay, updatePlayheadDOM]);

  const handleTransportPlay = useCallback(() => {
    togglePlayback();
  }, [togglePlayback]);

  const handleTransportStop = useCallback(() => {
    // Primero consolidar y detener localmente ANTES de que onMasterStop detenga el transporte
    stopAllPlaybackAndRecording();
    if (onMasterStop) {
      onMasterStop();
    }
  }, [onMasterStop, stopAllPlaybackAndRecording]);

  const handleTransportRec = useCallback(() => {
    if (onMasterRec) {
      onMasterRec();
      return;
    }
    if (isRecordingRef.current) {
      handleTransportStop();
    } else {
      const armed = tracksRef.current.find(t => !isBandTrack(t.id));
      if (!armed) return;
      const btn = document.getElementById("metronome-toggle-btn");
      if (btn && !latestPlayingRef.current) btn.click();
      startMidiRecording();
    }
  }, [onMasterRec, handleTransportStop, startMidiRecording, isBandTrack]);

  const handleRewind = useCallback(() => {
    goToStart();
  }, [goToStart]);

  // 4. Observar masterIsRecording desde el Master Transport
  const prevMasterIsRecordingRef = useRef<boolean | undefined>(masterIsRecording);
  useEffect(() => {
    const prev = prevMasterIsRecordingRef.current;
    prevMasterIsRecordingRef.current = masterIsRecording;
    if (typeof masterIsRecording === 'boolean') {
      if (masterIsRecording && !prev) {
        startMidiRecording();
      } else if (!masterIsRecording && prev) {
        stopMidiRecording();
      }
    }
  }, [masterIsRecording, startMidiRecording, stopMidiRecording]);

  // 5. Observar masterIsPlaying desde el Master Transport
  const prevMasterIsPlayingRef = useRef<boolean | undefined>(masterIsPlaying);
  useEffect(() => {
    const prev = prevMasterIsPlayingRef.current;
    prevMasterIsPlayingRef.current = masterIsPlaying;
    if (typeof masterIsPlaying === 'boolean') {
      setIsPlaying(prevPlaying => (prevPlaying !== masterIsPlaying ? masterIsPlaying : prevPlaying));
      latestPlayingRef.current = masterIsPlaying;
      if (!masterIsPlaying && prev === true) {
        stopAllPlaybackAndRecording();
      }
    }
  }, [masterIsPlaying, stopAllPlaybackAndRecording]);

  // 6. Escucha de eventos globales del Master Transport
  useEffect(() => {
    const onGlobalStop = () => {
      stopAllPlaybackAndRecording();
    };
    const onMasterRecStart = () => {
      startMidiRecording();
    };
    const onMasterRecStop = () => {
      stopMidiRecording();
    };

    window.addEventListener('global-playback-stop', onGlobalStop);
    window.addEventListener('master-rec-start', onMasterRecStart);
    window.addEventListener('master-rec-stop', onMasterRecStop);
    return () => {
      window.removeEventListener('global-playback-stop', onGlobalStop);
      window.removeEventListener('master-rec-start', onMasterRecStart);
      window.removeEventListener('master-rec-stop', onMasterRecStop);
    };
  }, [stopAllPlaybackAndRecording, startMidiRecording, stopMidiRecording]);

  // ============================================================================
  // GENERACIÓN DE CLIPS DE BANDA LINUS (Armonía, Bajo, Batería)
  // ============================================================================
  const renderedBandClips = useMemo(() => {
    const pianoClips: MidiClip[] = [];
    const bassClips: MidiClip[] = [];
    const drumClips: MidiClip[] = [];

    const activeStyle = currentStyle || currentSong?.style || 'Jazz Swing';

    if (playbackSequence && playbackSequence.length > 0) {
      let currentMeasure = -1;
      let measureBeatOffset = 0;

      playbackSequence.forEach((chord: any, idx: number) => {
        const mIdx = chord.measureIndex ?? 0;
        if (mIdx !== currentMeasure) {
          currentMeasure = mIdx;
          measureBeatOffset = 0;
        }

        // Resolver acorde efectivo si el compás actual hereda el acorde previo
        let effectiveChord = chord;
        if (!effectiveChord.chordString && !effectiveChord.resolvedChord) {
          for (let back = 1; back <= playbackSequence.length; back++) {
            const prev = playbackSequence[(idx - back + playbackSequence.length) % playbackSequence.length];
            if (prev && (prev.chordString || prev.resolvedChord)) {
              effectiveChord = {
                ...chord,
                chordString: prev.chordString || prev.resolvedChord,
                resolvedChord: prev.resolvedChord || prev.chordString,
                frequencies: prev.frequencies,
                voicingMidis: prev.voicingMidis,
                parsedRoot: prev.parsedRoot,
                parsedType: prev.parsedType,
              };
              break;
            }
          }
        }

        const chordBeatsLen = effectiveChord.beatsLength || beatsPerBar;
        const startBar = mIdx + 1 + (measureBeatOffset / beatsPerBar);
        const durationBars = chordBeatsLen / beatsPerBar;
        const chordName = effectiveChord.chordString || effectiveChord.resolvedChord || 'Cmaj7';

        // 1. PISTA PIANO (ARMONÍA)
        let pianoNotes: MidiNoteVisual[] = [];
        try {
          const comping = generateComping(
            { ...effectiveChord, chordString: chordName, beatsLength: chordBeatsLen },
            activeStyle,
            mIdx * beatsPerBar + measureBeatOffset,
            'piano',
            timeSignature
          );
          if (comping && comping.length > 0) {
            comping.forEach((c) => {
              const hitOffsetBars = (c.timeOffset || 0) / beatsPerBar;
              const rawLenBars = (c.durationBeats || 0.4) / beatsPerBar;
              const hitLengthBars = Math.max(
                0.06,
                Math.min(Math.max(0.06, durationBars - hitOffsetBars - 0.01), rawLenBars)
              );
              (c.freqs || []).forEach((freq: number) => {
                const midi = Math.round(12 * Math.log2(freq / 440) + 69);
                const pitchPercent = Math.max(15, Math.min(85, ((midi - 48) / (84 - 48)) * 100));
                pianoNotes.push({
                  bar: startBar + hitOffsetBars,
                  length: hitLengthBars,
                  pitchPercent
                });
              });
            });
          }
        } catch (_) {}

        if (pianoNotes.length === 0 && effectiveChord.frequencies && effectiveChord.frequencies.length > 0) {
          effectiveChord.frequencies.forEach((freq: number) => {
            const midi = Math.round(12 * Math.log2(freq / 440) + 69);
            const pitchPercent = Math.max(15, Math.min(85, ((midi - 48) / (84 - 48)) * 100));
            pianoNotes.push({
              bar: startBar,
              length: durationBars * 0.85,
              pitchPercent
            });
          });
        }

        pianoClips.push({
          id: `piano-chord-${idx}`,
          name: chordName,
          startBar,
          durationBars,
          notes: pianoNotes
        });

        // 2. PISTA BAJO
        let nextChordString: string | null = null;
        if (idx + 1 < playbackSequence.length) {
          nextChordString = playbackSequence[idx + 1].chordString || playbackSequence[idx + 1].resolvedChord || chordName;
        } else {
          nextChordString = playbackSequence[0]?.chordString || playbackSequence[0]?.resolvedChord || null;
        }

        let bassNotes: MidiNoteVisual[] = [];
        try {
          const generatedBass = generateWalkingBass(
            chordName,
            chordBeatsLen,
            nextChordString,
            activeStyle,
            mIdx * beatsPerBar + measureBeatOffset,
            timeSignature
          );
          if (generatedBass && generatedBass.length > 0) {
            generatedBass.forEach((n) => {
              const midi = Math.round(12 * Math.log2(n.freq / 440) + 69);
              const pitchPercent = Math.max(15, Math.min(85, ((midi - 28) / (55 - 28)) * 100));
              const offsetBars = (n.timeOffset || 0) / beatsPerBar;
              const noteBar = startBar + offsetBars;
              const rawLenBars = (n.durationBeats || 0.8) / beatsPerBar;
              const noteLen = Math.max(
                0.06,
                Math.min(Math.max(0.06, durationBars - offsetBars - 0.01), rawLenBars)
              );
              bassNotes.push({
                bar: noteBar,
                length: noteLen,
                pitchPercent
              });
            });
          }
        } catch (_) {}

        bassClips.push({
          id: `bass-chord-${idx}`,
          name: chordName ? `Bajo ${chordName}` : 'Bajo',
          startBar,
          durationBars,
          notes: bassNotes
        });

        measureBeatOffset += chordBeatsLen;
      });
    }

    // 3. PISTA BATERÍA (Generada dinámicamente según timeSignature y activeStyle)
    for (let bar = 1; bar <= totalBars; bar++) {
      let drumNotes: MidiNoteVisual[] = [];
      try {
        for (let beat = 0; beat < beatsPerBar; beat++) {
          const matrix = getDrumMatrixForBeat(
            activeStyle,
            beat,
            (bar - 1) * beatsPerBar + beat,
            timeSignature
          );
          (matrix.kick || []).forEach((h) => {
            drumNotes.push({
              bar: bar + (beat + h.timeOffset) / beatsPerBar,
              length: Math.max(0.04, 0.36 / beatsPerBar),
              pitchPercent: 20
            });
          });
          (matrix.snare || []).forEach((h) => {
            drumNotes.push({
              bar: bar + (beat + h.timeOffset) / beatsPerBar,
              length: Math.max(0.04, 0.36 / beatsPerBar),
              pitchPercent: 45
            });
          });
          (matrix.hihat || []).forEach((h) => {
            drumNotes.push({
              bar: bar + (beat + h.timeOffset) / beatsPerBar,
              length: Math.max(0.035, 0.24 / beatsPerBar),
              pitchPercent: 70
            });
          });
          (matrix.ride || []).forEach((h) => {
            drumNotes.push({
              bar: bar + (beat + h.timeOffset) / beatsPerBar,
              length: Math.max(0.035, 0.24 / beatsPerBar),
              pitchPercent: 88
            });
          });
        }
      } catch (_) {}

      drumClips.push({
        id: `drum-bar-${bar}`,
        name: `${activeStyle} (${timeSignature})`,
        startBar: bar,
        durationBars: 1,
        notes: drumNotes
      });
    }

    return {
      't-1': pianoClips.length > 0 ? pianoClips : (DEFAULT_BANDA_CLIPS['t-1'] || []),
      't-2': bassClips.length > 0 ? bassClips : (DEFAULT_BANDA_CLIPS['t-2'] || []),
      't-3': drumClips.length > 0 ? drumClips : (DEFAULT_BANDA_CLIPS['t-3'] || []),
    };
  }, [playbackSequence, totalBars, currentStyle, currentSong, timeSignature, beatsPerBar]);

  // ============================================================================
  // SERIALIZACIÓN Y RESTAURACIÓN COMPLETA DE PISTAS DEL DAW (.linus)
  // ============================================================================
  const onTracksChangeRef = useRef(onTracksChange);
  useEffect(() => {
    onTracksChangeRef.current = onTracksChange;
  }, [onTracksChange]);

  const serializedTracks = useMemo<TrackData[]>(() => {
    return tracks.map(track => {
      const isBand = isBandTrack(track.id);
      const trackClips = isBand
        ? (renderedBandClips[String(track.id)] || [])
        : ((track.regions && track.regions.length > 0)
            ? track.regions
            : ((track.clips && track.clips.length > 0)
                ? track.clips
                : (userClips[track.id] || [])));
      const recordedNotes = trackClips.flatMap(c => (Array.isArray(c.notes) ? c.notes : []));

      return {
        ...track,
        bankId: track.bankId || '',
        instrument: track.instrument || 'Sin instrumento',
        isMuted: Boolean(track.isMuted),
        isSolo: Boolean(track.isSolo),
        isArmed: Boolean(track.isArmed),
        isRecording: Boolean(track.isRecording),
        volume: typeof track.volume === 'number' ? track.volume : 1.0,
        volumeDb: track.volumeDb || gainToDbString(typeof track.volume === 'number' ? track.volume : 1.0),
        pan: track.pan || 'C',
        regions: trackClips,
        clips: trackClips,
        recordedNotes
      };
    });
  }, [tracks, userClips, renderedBandClips, isBandTrack]);

  const serializedTracksRef = useRef<TrackData[]>(serializedTracks);
  useEffect(() => {
    serializedTracksRef.current = serializedTracks;
    (window as any).__linusGetDawTracks = () => serializedTracksRef.current;
    if (onTracksChangeRef.current) {
      onTracksChangeRef.current(serializedTracks);
    }
    window.dispatchEvent(new CustomEvent('linus-daw-tracks-updated', { detail: serializedTracks }));
  }, [serializedTracks]);

  // Exponer puente bidireccional entre el DAW y el Mixer Principal
  useEffect(() => {
    const getTrackPeak = (trackId: string): number => {
      const meter = trackMetersRef.current.get(trackId);
      if (!meter) return 0;
      try {
        const val = meter.getValue();
        const num = Array.isArray(val) ? Math.max(...val) : val;
        return typeof num === 'number' && !isNaN(num) && isFinite(num)
          ? Math.max(0, Math.min(1, num * 2.2))
          : 0;
      } catch (_) {
        return 0;
      }
    };

    (window as any).__linusGetDawTrackPeak = getTrackPeak;
    (window as any).__linusDawMixerBridge = {
      updateTrackVolume: handleVolumeChange,
      toggleTrackMute: toggleMute,
      toggleTrackSolo: toggleSolo,
      updateTrackPan: handlePanChange,
      getTrackPeak,
    };
  }, [handleVolumeChange, toggleMute, toggleSolo, handlePanChange]);

  const restoreSessionTracks = useCallback((loadedTracks: any[], options?: { bpm?: number; timeSignature?: string }) => {
    if (!Array.isArray(loadedTracks) || loadedTracks.length === 0) return;

    stopAllPlaybackAndRecording();

    // Limpiar samplers, medidores y canales previos de pistas de usuario
    trackSamplersRef.current.forEach(s => {
      try { s.releaseAll(); } catch (_) {}
      try { s.disconnect(); } catch (_) {}
    });
    trackSamplersRef.current.clear();

    trackMetersRef.current.forEach(m => {
      try { m.dispose(); } catch (_) {}
    });
    trackMetersRef.current.clear();

    channelsRef.current.forEach(ch => {
      try { ch.dispose(); } catch (_) {}
    });
    channelsRef.current.clear();

    const bPerBar = options?.timeSignature
      ? getBeatsPerBar(options.timeSignature)
      : (beatsPerBarRef.current || 4);
    const bpmVal = (typeof options?.bpm === 'number' && !isNaN(options.bpm) && options.bpm > 0)
      ? options.bpm
      : (bpmRef.current || 120);
    const nextUserClips: Record<string, MidiClip[]> = {};
    let maxUserTrackNum = 0;

    // Asegurar que las 3 pistas de Banda Linus existan al inicio
    const hasBandTracks = loadedTracks.some((t: any) => ['t-1', 't-2', 't-3'].includes(t?.id));
    const sourceList = hasBandTracks
      ? loadedTracks
      : [...INITIAL_BANDA_TRACKS, ...loadedTracks];

    const normalizedTracks: TrackData[] = sourceList.map((raw: any, idx: number) => {
      const id = String(raw?.id || `midi-user-${Date.now()}-${idx}`);
      const isBand = ['t-1', 't-2', 't-3'].includes(id);
      const defaultBand = INITIAL_BANDA_TRACKS.find(bt => bt.id === id);

      const volume = typeof raw?.volume === 'number' && !isNaN(raw.volume)
        ? raw.volume
        : (defaultBand ? defaultBand.volume : 1.0);
      const volumeDb = typeof raw?.volumeDb === 'string' && raw.volumeDb.trim()
        ? raw.volumeDb
        : gainToDbString(volume);
      const pan = typeof raw?.pan === 'string' && raw.pan.trim() ? raw.pan : 'C';
      const isMuted = Boolean(raw?.isMuted);
      const isSolo = Boolean(raw?.isSolo);
      const isArmed = isBand ? false : Boolean(raw?.isArmed);

      const bankId = typeof raw?.bankId === 'string'
        ? raw.bankId
        : (defaultBand ? defaultBand.bankId : '');
      const bankMeta = LIVE_MIDI_BANKS.find(b => b.id === bankId);
      const instrument = typeof raw?.instrument === 'string' && raw.instrument.trim()
        ? raw.instrument
        : (bankMeta ? bankMeta.name : (defaultBand ? defaultBand.instrument : 'Sin instrumento'));

      // Extraer clips desde clips, regions o recordedNotes y normalizar Tiempo Cero (Zero-Offset a "0:0:0" / Compás 1)
      let restoredClips: MidiClip[] = [];
      const rawClipsList = Array.isArray(raw?.clips) && raw.clips.length > 0
        ? raw.clips
        : (Array.isArray(raw?.regions) && raw.regions.length > 0 ? raw.regions : []);

      if (!isBand && rawClipsList.length > 0) {
        restoredClips = rawClipsList.map((clip: any, cIdx: number) => {
          const rawClipStartBar = typeof clip?.startBar === 'number' && !isNaN(clip.startBar)
            ? Math.max(1.0, clip.startBar)
            : 1.0;
          const rawClipDurationBars = typeof clip?.durationBars === 'number' && !isNaN(clip.durationBars)
            ? Math.max(0.25, clip.durationBars)
            : 1.0;

          const rawNotesArray = Array.isArray(clip?.notes) ? clip.notes : [];

          // Calcular el offset inicial del clip respecto a "0:0:0" (Compás 1)
          const clipBarOffset = Math.max(0, rawClipStartBar - 1.0);

          // Determinar el compás mínimo de las notas internas para corregir cualquier offset absoluto adicional
          const parsedRawNotes = rawNotesArray.map((n: any) => {
            const midiVal = typeof n?.midi === 'number' ? n.midi : (typeof n?.note === 'number' ? n.note : 60);
            const rawBarVal = typeof n?.bar === 'number' && !isNaN(n.bar)
              ? n.bar
              : (typeof n?.startTicks === 'number' && !isNaN(n.startTicks)
                  ? 1.0 + (n.startTicks / (bPerBar * TICKS_PER_BEAT))
                  : 1.0);
            const lenVal = typeof n?.length === 'number' && !isNaN(n.length)
              ? Math.max(0.05, n.length)
              : (typeof n?.durationTicks === 'number' && !isNaN(n.durationTicks)
                  ? Math.max(0.05, n.durationTicks / (bPerBar * TICKS_PER_BEAT))
                  : 0.25);
            return {
              rawNote: n,
              midiVal,
              rawBarVal,
              lenVal
            };
          });

          const minRawNoteBar = parsedRawNotes.length > 0
            ? Math.min(...parsedRawNotes.map(item => item.rawBarVal))
            : rawClipStartBar;

          const minBarAfterClipOffset = Math.max(1.0, minRawNoteBar - clipBarOffset);
          const extraWholeBarOffset = minBarAfterClipOffset >= 2.0
            ? Math.floor(minBarAfterClipOffset - 1.0)
            : 0;
          const totalBarOffset = clipBarOffset + extraWholeBarOffset;

          const clipNotes: MidiNoteVisual[] = parsedRawNotes.map(({ rawNote: n, midiVal, rawBarVal, lenVal }) => {
            const normalizedBar = Math.max(1.0, Number((rawBarVal - totalBarOffset).toFixed(6)));
            const normalizedStartTicks = Math.max(0, barsToTicks(normalizedBar, bPerBar));
            const normalizedDurationTicks = typeof n?.durationTicks === 'number' && !isNaN(n.durationTicks)
              ? Math.max(12, n.durationTicks)
              : Math.max(12, Math.round(lenVal * bPerBar * TICKS_PER_BEAT));

            return {
              note: midiVal,
              midi: midiVal,
              noteName: n?.noteName || Tone.Frequency(midiVal, 'midi').toNote(),
              velocity: typeof n?.velocity === 'number' ? n.velocity : 100,
              bar: normalizedBar,
              length: lenVal,
              pitchPercent: typeof n?.pitchPercent === 'number'
                ? n.pitchPercent
                : Math.max(10, Math.min(90, ((midiVal - 36) / (84 - 36)) * 100)),
              startTicks: normalizedStartTicks,
              durationTicks: normalizedDurationTicks
            };
          });

          // Forzar que el bloque visual del clip inicie exactamente en 0 (Compás 1 / "0:0:0")
          const startBar = 1.0;
          const maxNoteEndBar = clipNotes.length > 0
            ? Math.max(...clipNotes.map(n => n.bar + n.length))
            : (1.0 + rawClipDurationBars);
          const adjustedRawDuration = Math.max(0.25, rawClipDurationBars - extraWholeBarOffset);
          const durationBars = Number(Math.max(0.25, adjustedRawDuration, maxNoteEndBar - 1.0).toFixed(3));
          const durationTicks = Math.max(12, Math.round(durationBars * bPerBar * TICKS_PER_BEAT));
          const durationSeconds = ticksToSeconds(durationTicks, bpmVal);

          return {
            id: String(clip?.id || `clip-${id}-${Date.now()}-${cIdx + 1}`),
            trackId: id,
            name: String(clip?.name || `TAKE ${String(cIdx + 1).padStart(2, '0')}`),
            startBar,
            durationBars,
            startTime: 0,
            duration: durationSeconds,
            startTicks: 0,
            durationTicks,
            notes: clipNotes
          };
        });
      } else if (!isBand && Array.isArray(raw?.recordedNotes) && raw.recordedNotes.length > 0) {
        const parsedRawNotes = raw.recordedNotes.map((n: any) => {
          const midiVal = typeof n?.midi === 'number' ? n.midi : (typeof n?.note === 'number' ? n.note : 60);
          const rawBarVal = typeof n?.bar === 'number' && !isNaN(n.bar)
            ? n.bar
            : (typeof n?.startTicks === 'number' && !isNaN(n.startTicks)
                ? 1.0 + (n.startTicks / (bPerBar * TICKS_PER_BEAT))
                : 1.0);
          const lenVal = typeof n?.length === 'number' && !isNaN(n.length)
            ? Math.max(0.05, n.length)
            : (typeof n?.durationTicks === 'number' && !isNaN(n.durationTicks)
                ? Math.max(0.05, n.durationTicks / (bPerBar * TICKS_PER_BEAT))
                : 0.25);
          return { rawNote: n, midiVal, rawBarVal, lenVal };
        });

        const minRawBar = Math.max(1.0, Math.min(...parsedRawNotes.map((item: any) => item.rawBarVal)));
        const totalBarOffset = minRawBar >= 2.0 ? Math.floor(minRawBar - 1.0) : 0;

        const clipNotes: MidiNoteVisual[] = parsedRawNotes.map(({ rawNote: n, midiVal, rawBarVal, lenVal }: any) => {
          const normalizedBar = Math.max(1.0, Number((rawBarVal - totalBarOffset).toFixed(6)));
          const normalizedStartTicks = Math.max(0, barsToTicks(normalizedBar, bPerBar));
          const normalizedDurationTicks = typeof n?.durationTicks === 'number' && !isNaN(n.durationTicks)
            ? Math.max(12, n.durationTicks)
            : Math.max(12, Math.round(lenVal * bPerBar * TICKS_PER_BEAT));

          return {
            note: midiVal,
            midi: midiVal,
            noteName: n?.noteName || Tone.Frequency(midiVal, 'midi').toNote(),
            velocity: typeof n?.velocity === 'number' ? n.velocity : 100,
            bar: normalizedBar,
            length: lenVal,
            pitchPercent: typeof n?.pitchPercent === 'number'
              ? n.pitchPercent
              : Math.max(10, Math.min(90, ((midiVal - 36) / (84 - 36)) * 100)),
            startTicks: normalizedStartTicks,
            durationTicks: normalizedDurationTicks
          };
        });

        const maxBar = Math.max(1.25, ...clipNotes.map(n => n.bar + n.length));
        const durationBars = Number(Math.max(0.25, maxBar - 1.0).toFixed(3));
        const durationTicks = Math.max(12, Math.round(durationBars * bPerBar * TICKS_PER_BEAT));
        const durationSeconds = ticksToSeconds(durationTicks, bpmVal);

        restoredClips = [{
          id: `clip-${id}-${Date.now()}-1`,
          trackId: id,
          name: 'TAKE 01',
          startBar: 1.0,
          durationBars,
          startTime: 0,
          duration: durationSeconds,
          startTicks: 0,
          durationTicks,
          notes: clipNotes
        }];
      }

      if (!isBand) {
        nextUserClips[id] = restoredClips;
        const trackNum = typeof raw?.number === 'number' ? raw.number : idx + 1;
        if (trackNum - 3 > maxUserTrackNum) {
          maxUserTrackNum = trackNum - 3;
        } else {
          maxUserTrackNum += 1;
        }
      }

      return {
        id,
        number: typeof raw?.number === 'number' ? raw.number : idx + 1,
        name: String(raw?.name || (defaultBand ? defaultBand.name : `PISTA MIDI ${Math.max(1, idx - 2)}`)),
        type: (raw?.type as TrackType) || (defaultBand ? defaultBand.type : 'synth'),
        bankId,
        instrument,
        accentColor: String(raw?.accentColor || (defaultBand ? defaultBand.accentColor : USER_TRACK_COLORS[idx % USER_TRACK_COLORS.length])),
        isMuted,
        isSolo,
        isArmed,
        isRecording: false,
        regions: restoredClips,
        clips: restoredClips,
        recordedNotes: restoredClips.flatMap(c => c.notes || []),
        volume,
        volumeDb,
        pan
      };
    });

    nextTrackIndexRef.current = Math.max(nextTrackIndexRef.current, maxUserTrackNum);

    // Sincronizar mezcla de Banda Linus e inicializar canales y samplers de pistas de usuario
    const anySolo = normalizedTracks.some(t => t.isSolo);
    const pans = ['L 30', 'L 15', 'C', 'R 15', 'R 30'];
    const panValues = [-0.3, -0.15, 0, 0.15, 0.3];

    try {
      const currentMixer = interactiveAnalysisAudio.getMixerState();
      normalizedTracks.forEach(t => {
        const pIdx = pans.indexOf(t.pan);
        const panNum = pIdx >= 0 ? panValues[pIdx] : 0;

        if (t.id === 't-1') {
          interactiveAnalysisAudio.setChannelGainDirect('piano', t.volume);
          interactiveAnalysisAudio.setChannelPanDirect('piano', panNum);
          if (currentMixer.piano.isMuted !== t.isMuted) interactiveAnalysisAudio.toggleChannelMute('piano');
          if (currentMixer.piano.isSolo !== t.isSolo) interactiveAnalysisAudio.toggleChannelSolo('piano');
        } else if (t.id === 't-2') {
          interactiveAnalysisAudio.setChannelGainDirect('bass', t.volume);
          interactiveAnalysisAudio.setChannelPanDirect('bass', panNum);
          if (currentMixer.bass.isMuted !== t.isMuted) interactiveAnalysisAudio.toggleChannelMute('bass');
          if (currentMixer.bass.isSolo !== t.isSolo) interactiveAnalysisAudio.toggleChannelSolo('bass');
        } else if (t.id === 't-3') {
          interactiveAnalysisAudio.setChannelGainDirect('drums', t.volume);
          if (currentMixer.drums.isMuted !== t.isMuted) interactiveAnalysisAudio.toggleChannelMute('drums');
          if (currentMixer.drums.isSolo !== t.isSolo) interactiveAnalysisAudio.toggleChannelSolo('drums');
        } else {
          const volDb = t.volume <= 0.0001 ? -100 : Tone.gainToDb(t.volume);
          const channel = new Tone.Channel({ volume: volDb, pan: panNum }).toDestination();
          channel.mute = anySolo ? (t.isMuted || !t.isSolo) : t.isMuted;
          channelsRef.current.set(t.id, channel);
          try {
            const meter = new Tone.Meter({ normalRange: true, smoothing: 0.8 });
            channel.connect(meter);
            trackMetersRef.current.set(t.id, meter);
          } catch (_) {}

          if (t.bankId && t.bankId !== 'none') {
            const sampler = createTrackSampler(t.bankId, channel) || createInstrumentSynth(t.bankId, channel);
            if (sampler) {
              trackSamplersRef.current.set(t.id, sampler);
            }
          }
        }
      });
    } catch (_) {}

    setUserClips(nextUserClips);
    tracksRef.current = normalizedTracks;
    applyCrossEngineSoloAndMute(normalizedTracks);
    setTracks(normalizedTracks);
    setSelectedClipId(null);

    // Reinicio preventivo del Transporte y Playhead al cargar sesión (.linus)
    try {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
      Tone.Transport.seconds = 0;
      Tone.Transport.ticks = 0;
    } catch (_) {}

    isCountingInRef.current = false;
    countInStartBarRef.current = 1.0;
    countInStartSecondsRef.current = 0;
    targetBarRef.current = 1.0;
    lastValidTransportSecondsRef.current = 0;
    liveRecBarRef.current = 1.0;
    setLiveRecBar(1.0);
    latestPlayingRef.current = false;
    setIsPlaying(false);

    (window as any).__linusSeekMeasureIndex = 0;
    (window as any).__linusSeekTargetSeconds = 0;

    updatePlayheadDOM(1.0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }

    window.dispatchEvent(new CustomEvent('linus-seek-measure', {
      detail: {
        measureIndex: 0,
        bar: 1.0,
        targetSeconds: 0
      }
    }));
  }, [stopAllPlaybackAndRecording, updatePlayheadDOM]);

  useEffect(() => {
    (window as any).__linusRestoreDawTracks = restoreSessionTracks;
    const handleRestoreEvent = (e: any) => {
      const tracksToRestore = e?.detail?.tracks;
      const options = e?.detail?.options;
      if (Array.isArray(tracksToRestore)) {
        restoreSessionTracks(tracksToRestore, options);
      }
    };
    window.addEventListener('linus-restore-daw-tracks', handleRestoreEvent);
    return () => {
      window.removeEventListener('linus-restore-daw-tracks', handleRestoreEvent);
    };
  }, [restoreSessionTracks]);

  return (
    <div className="w-full mt-4 bg-[#161616] border border-neutral-800 rounded-xl p-3.5 flex flex-col gap-3 select-none font-sans text-neutral-200">
      {/* ======================================================== */}
      {/* 1. CABECERA Y BARRA DE HERRAMIENTAS UNIFICADA DEL DAW    */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-800/50 text-xs">
        {/* Izquierda: Identificador compacto + Herramientas de Edición (Iconos Cuadrados) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-2 border-r border-neutral-800/60">
            <div className="w-8 h-8 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#EA580B] shrink-0">
              <Waves size={15} />
            </div>
            <div className="flex flex-col leading-none">
              <h3 className="font-bold text-neutral-100 tracking-wider text-xs font-sans uppercase">
                {language === 'en' ? 'MIDI TRACKS' : 'PISTAS MIDI'}
              </h3>
              <span className="text-[10px] font-mono uppercase text-[#EA580B] mt-0.5 font-semibold">
                DAW
              </span>
            </div>
          </div>

          {/* Herramientas de Edición (Estado activo en Naranja Linus) */}
          <div className="flex items-center gap-1">
            {/* Puntero */}
            <button
              type="button"
              onClick={() => setActiveTool('pointer')}
              title={language === 'en' ? 'Select / Pointer Tool' : 'Puntero / Selección'}
              aria-label={language === 'en' ? 'Select / Pointer Tool' : 'Puntero / Selección'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                activeTool === 'pointer'
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <MousePointer2 size={14} />
            </button>

            {/* Cuchilla / Cortar */}
            <button
              type="button"
              onClick={() => setActiveTool('scissors')}
              title={language === 'en' ? 'Split / Scissors Tool' : 'Cuchilla / Cortar Clip'}
              aria-label={language === 'en' ? 'Split / Scissors Tool' : 'Cuchilla / Cortar Clip'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                activeTool === 'scissors'
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <Scissors size={14} />
            </button>

            {/* Mute Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('mute')}
              title={language === 'en' ? 'Mute Tool' : 'Silenciar Evento'}
              aria-label={language === 'en' ? 'Mute Tool' : 'Silenciar Evento'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                activeTool === 'mute'
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <VolumeX size={14} />
            </button>

            {/* Zoom Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('zoom')}
              title={language === 'en' ? 'Zoom Tool' : 'Lupa / Zoom'}
              aria-label={language === 'en' ? 'Zoom Tool' : 'Lupa / Zoom'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                activeTool === 'zoom'
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <Search size={14} />
            </button>

            {/* Grid Tool */}
            <button
              type="button"
              onClick={() => setActiveTool('grid')}
              title={language === 'en' ? 'Grid Overview' : 'Vista General / Rejilla'}
              aria-label={language === 'en' ? 'Grid Overview' : 'Vista General / Rejilla'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                activeTool === 'grid'
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* Derecha: Transporte Sincronizado, Cuantización, Snap, Zoom y Botón Agregar Pista */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Botonera de Transporte del DAW (Sincronizada con Master Transport) */}
          <div className="flex items-center gap-1">
            {/* VOLVER AL INICIO (Rewind / Go to Start) */}
            <button
              type="button"
              id="daw-transport-rewind-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                goToStart();
              }}
              title={language === 'en' ? 'Go to Start (Bar 1)' : 'Volver al Inicio (Compás 1)'}
              aria-label={language === 'en' ? 'Go to Start (Bar 1)' : 'Volver al Inicio (Compás 1)'}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <SkipBack size={16} />
            </button>

            {/* PLAY: Gris claro inactivo, Naranja brillante activo */}
            <button
              type="button"
              id="daw-transport-play-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                togglePlayback();
              }}
              title={language === 'en' ? 'Play Sequencer' : 'Reproducir secuencia'}
              aria-label={language === 'en' ? 'Play Sequencer' : 'Reproducir secuencia'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                effectiveIsPlaying
                  ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/40'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
              }`}
            >
              <Play size={14} className="fill-current" />
            </button>

            {/* STOP */}
            <button
              type="button"
              id="daw-transport-stop-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                handleTransportStop();
              }}
              title={
                effectiveIsRecording
                  ? (language === 'en' ? 'Stop Recording MIDI Take' : 'Detener Grabación MIDI Take')
                  : (language === 'en' ? 'Stop Sequencer' : 'Detener secuencia')
              }
              aria-label={language === 'en' ? 'Stop Sequencer' : 'Detener secuencia'}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition-colors cursor-pointer"
            >
              <Square size={13} className="fill-current" />
            </button>

            {/* REC: Rojo intenso palpitante al grabar, toque naranja en estado inactivo */}
            <button
              type="button"
              id="daw-transport-rec-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                handleTransportRec();
              }}
              title={
                effectiveIsRecording
                  ? (language === 'en' ? 'Recording MIDI on armed track... (Click Stop to finish Take)' : 'Grabando MIDI en pista armada... (Clic en Stop para finalizar Take)')
                  : (language === 'en' ? 'Record MIDI on armed track' : 'Grabar MIDI en pista armada')
              }
              aria-label={language === 'en' ? 'Record MIDI on armed track' : 'Grabar MIDI en pista armada'}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                effectiveIsRecording
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-sm shadow-rose-900/50'
                  : 'bg-neutral-800 border-[#EA580B]/40 text-orange-500 hover:bg-neutral-700 hover:border-[#EA580B] hover:text-orange-400'
              }`}
            >
              <Circle
                size={12}
                className={effectiveIsRecording ? 'fill-white text-white' : 'fill-[#EA580B] text-[#EA580B]'}
              />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-neutral-800/50 mx-0.5 hidden sm:block" />

          {/* Dropdown Cuantización con acento Naranja Linus */}
          <div className="h-8 flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 hover:border-[#EA580B]/60 focus-within:border-[#EA580B] px-2 rounded-md transition-colors">
            <span className="text-[10px] uppercase text-[#EA580B] font-mono font-bold">
              Q
            </span>
            <select
              value={quantize}
              onChange={e => setQuantize(e.target.value)}
              title="Cuantización de rejilla"
              className="bg-transparent text-xs font-mono font-bold text-orange-400 hover:text-orange-300 outline-none cursor-pointer"
            >
              <option value="1/4" className="bg-neutral-900 text-neutral-200">1/4</option>
              <option value="1/8" className="bg-neutral-900 text-neutral-200">1/8</option>
              <option value="1/16" className="bg-neutral-900 text-neutral-200">1/16</option>
              <option value="1/32" className="bg-neutral-900 text-neutral-200">1/32</option>
            </select>
          </div>

          {/* Botón Imán / SNAP (Activo en Naranja Linus) */}
          <button
            type="button"
            onClick={() => setIsSnapToggleOn(prev => !prev)}
            title="Ajuste a la rejilla magnética (SNAP)"
            aria-label="Ajuste a la rejilla magnética (SNAP)"
            className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
              isSnapToggleOn
                ? 'bg-[#EA580B] border-[#EA580B] text-white shadow-sm shadow-[#EA580B]/30'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400'
            }`}
          >
            <Magnet size={14} />
          </button>

          {/* Controles de Zoom */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition-colors cursor-pointer"
              title="Zoom -"
              aria-label="Zoom -"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 text-[10px] uppercase text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition-colors cursor-pointer font-mono"
              title="Restablecer vista (100%)"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-orange-400 transition-colors cursor-pointer"
              title="Zoom +"
              aria-label="Zoom +"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-neutral-800/50 mx-0.5 hidden sm:block" />

          {/* Botón Agregar Pista (Icono + en Naranja Linus, hover fondo naranja e icono blanco) */}
          <button
            type="button"
            onClick={handleAddTrack}
            title="Agregar pista"
            aria-label="Agregar pista"
            className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-[#EA580B]/50 text-[#EA580B] hover:bg-[#EA580B] hover:border-[#EA580B] hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CONTENEDOR PRINCIPAL: PANEL DE PISTAS + TIMELINE GRID */}
      {/* ======================================================== */}
      <div
        ref={scrollContainerRef}
        className="w-full bg-[#111111] border border-neutral-800/50 rounded-lg flex flex-col overflow-x-auto"
      >
        {/* REGLA DE TIEMPO / TIMELINE HEADER */}
        <TimelineRuler
          totalBars={totalBars}
          zoomLevel={zoomLevel}
          rulerPlayheadRef={rulerPlayheadRef}
          onSeekMeasure={seekToMeasure}
        />

        {/* LISTADO DE PISTAS MULTIPISTA */}
        <div className="flex flex-col min-w-full w-fit relative divide-y divide-neutral-800/50">
          {tracks.map((track, index) => {
            const isBand = isBandTrack(track.id);
            const clips = isBand
              ? (renderedBandClips[String(track.id)] || [])
              : ((track.regions && track.regions.length > 0) ? track.regions : (userClips[track.id] || []));
            const isFirstBand = index === 0 && isBand;
            const isFirstUser = !isBand && (index === 0 || isBandTrack(tracks[index - 1]?.id));

            return (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                totalBars={totalBars}
                zoomLevel={zoomLevel}
                clips={clips}
                isFirstBand={isFirstBand}
                isFirstUser={isFirstUser}
                isRecordingTrack={Boolean(isRecording && track.isRecording)}
                liveRecordingNotes={liveNotesByTrack[track.id] || []}
                recordingStartBar={trackRecStartBars[track.id] || 1.0}
                currentBar={liveRecBar}
                selectedClipId={selectedClipId}
                isSelectedTrack={selectedTrackId === track.id}
                activeTool={activeTool}
                onSelectClip={handleSelectClip}
                onSelectTrack={handleSelectTrack}
                onDeleteTrack={handleDeleteTrack}
                onOpenPianoRoll={handleOpenPianoRoll}
                onMute={toggleMute}
                onSolo={toggleSolo}
                onArm={toggleArm}
                onToggleRecord={handleToggleRecord}
                onVolume={handleVolumeChange}
                onPan={handlePanToggle}
                onUpdateName={handleUpdateTrackName}
                onBankChange={handleBankChange}
                registerPlayheadRef={registerPlayheadRef}
              />
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PIE DEL MÓDULO (INDICADORES TÉCNICOS COMPACTOS)       */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        {/* IZQUIERDA: Digital Time Display con compás y tiempo reales */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-neutral-500 font-mono">
            TIEMPO
          </span>
          <div className="flex items-center font-mono text-xs font-bold bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md text-neutral-200">
            <span ref={timeDisplayRef}>00:00.00</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span className="text-neutral-400">{formattedTotalTime}</span>
          </div>
          <div
            ref={barDisplayRef}
            className="hidden sm:flex items-center font-mono text-[10px] uppercase text-neutral-400 bg-neutral-800 border border-neutral-700 px-2 py-1 rounded-md"
          >
            BAR 01 : 01 : 00
          </div>
        </div>

        {/* DERECHA: Tempo, Formato PCM y Estado */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tempo */}
          <div className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md text-xs font-mono">
            <span className="text-[10px] uppercase text-neutral-500">BPM</span>
            <span className="font-bold text-neutral-200">{bpm || 120}</span>
          </div>

          {/* Formato Audio PCM */}
          <div className="hidden xl:flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md text-[10px] uppercase text-neutral-500 font-mono">
            <Cpu size={12} className="text-neutral-500" />
            <span>32-Bit / 48 kHz</span>
          </div>

          {/* Estado del motor */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-[10px] uppercase text-neutral-400 font-mono font-bold">
            <span className={`w-1.5 h-1.5 rounded-full ${effectiveIsRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>{effectiveIsRecording ? 'REC' : 'READY'}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL PIANO ROLL (EDITOR DE NOTAS DETALLADO)          */}
      {/* ======================================================== */}
      {editingTrack && (
        <PianoRollModal
          activeTrack={editingTrack}
          onClose={() => setEditingTrack(null)}
          bpm={bpm}
          beatsPerBar={beatsPerBar}
          totalBars={totalBars}
          onTriggerPreviewNote={handlePreviewPianoRollNote}
          updateTrackNotes={handleUpdateTrackNotes}
          isPlaying={effectiveIsPlaying}
          onTogglePlayback={togglePlayback}
          onStopPlayback={handleTransportStop}
          onRewind={goToStart}
          onSeekMeasure={seekToMeasure}
          currentSong={currentSong}
          transposition={transposition}
          globalKey={globalKey}
        />
      )}
    </div>
  );
};
