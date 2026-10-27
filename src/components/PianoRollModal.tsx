import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as Tone from 'tone';
import {
  X,
  MousePointer2,
  Pencil,
  Eraser,
  Magnet,
  Piano,
  ZoomIn,
  ZoomOut,
  Trash2,
  Undo2,
  SkipBack,
  Play,
  Square,
  Link2,
  FileText
} from 'lucide-react';
import { MidiClip, MidiNoteVisual, TrackData, TICKS_PER_BEAT } from './MidiTracksSequencer';
import { ScorePreviewModal } from './ScorePreviewModal';

export type PianoRollTool = 'puntero' | 'lapiz' | 'goma';
export type GridSnapDivision = '1/4' | '1/8' | '1/16';

export interface PianoRollTrackPayload extends TrackData {
  notes?: MidiNoteVisual[];
  activeClip?: MidiClip | null;
}

interface PianoRollModalProps {
  activeTrack: PianoRollTrackPayload | null;
  onClose: () => void;
  bpm?: number;
  beatsPerBar?: number;
  totalBars?: number;
  onTriggerPreviewNote?: (midi: number) => void;
  updateTrackNotes?: (trackId: string, newNotes: MidiNoteVisual[], clipId?: string) => void;
  isPlaying?: boolean;
  onTogglePlayback?: () => void;
  onStopPlayback?: () => void;
  onRewind?: () => void;
  onSeekMeasure?: (measureIndex: number) => void;
  currentSong?: any;
  transposition?: number;
  globalKey?: string;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_OFFSETS = new Set([1, 3, 6, 8, 10]);

// Rango completo de Piano de Estudio de 88 teclas: A0 (MIDI 21) a C8 (MIDI 108)
const LOWEST_MIDI_NOTE = 21;  // A0
const HIGHEST_MIDI_NOTE = 108; // C8
const TOTAL_ROWS = HIGHEST_MIDI_NOTE - LOWEST_MIDI_NOTE + 1; // 88 filas cromáticas
const ROW_HEIGHT = 28; // Altura en píxeles de cada fila cromática
const KEYBOARD_WIDTH_PX = 96; // w-24 = 96px

export interface LocalPianoRollNote {
  id: string;
  midi: number;
  noteName: string;
  startBeat: number; // En negras (0-indexed desde Compás 1, Beat 1)
  durationBeats: number; // Duración en negras
  time: number; // Tiempo de inicio en segundos
  duration: number; // Duración en segundos
  velocity: number; // 1 a 127
}

interface SelectionBoxRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface InitialNoteDragState {
  startBeat: number;
  durationBeats: number;
  time: number;
  duration: number;
  midi: number;
}

function getNoteNameFromMidi(midi: number): string {
  const clamped = Math.max(LOWEST_MIDI_NOTE, Math.min(HIGHEST_MIDI_NOTE, Math.round(midi)));
  const pitchClass = clamped % 12;
  const octave = Math.floor(clamped / 12) - 1;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

export const PianoRollModal: React.FC<PianoRollModalProps> = ({
  activeTrack,
  onClose,
  bpm = 120,
  beatsPerBar = 4,
  totalBars = 16,
  onTriggerPreviewNote,
  updateTrackNotes,
  isPlaying = false,
  onTogglePlayback,
  onStopPlayback,
  onRewind,
  onSeekMeasure,
  currentSong,
  transposition = 0,
  globalKey = 'C'
}) => {
  const [isScorePreviewOpen, setIsScorePreviewOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<PianoRollTool>('puntero');
  const [gridSnap, setGridSnap] = useState<GridSnapDivision>('1/16');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxRect | null>(null);
  const [zoomBeatPx, setZoomBeatPx] = useState<number>(64); // Píxeles por negra (1/4)
  const [localNotes, setLocalNotes] = useState<LocalPianoRollNote[]>([]);
  const [history, setHistory] = useState<LocalPianoRollNote[][]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(isPlaying);

  // =========================================================================
  // REFERENCIAS SINCRONIZADAS PARA EVITAR "STALE CLOSURES" EN TECLADO Y DOM
  // =========================================================================
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const gridScrollRef = useRef<HTMLDivElement | null>(null);
  const gridCanvasRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<LocalPianoRollNote[]>(localNotes);
  const selectedIdsRef = useRef<string[]>(selectedNoteIds);
  const historyRef = useRef<LocalPianoRollNote[][]>([]);
  const autoScrollRef = useRef<boolean>(autoScroll);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const activeTrackRef = useRef<PianoRollTrackPayload | null>(activeTrack);
  const updateTrackNotesRef = useRef(updateTrackNotes);
  const onCloseRef = useRef(onClose);
  const onTogglePlaybackRef = useRef(onTogglePlayback);

  useEffect(() => {
    notesRef.current = localNotes;
  }, [localNotes]);

  useEffect(() => {
    selectedIdsRef.current = selectedNoteIds;
  }, [selectedNoteIds]);

  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  useEffect(() => {
    updateTrackNotesRef.current = updateTrackNotes;
  }, [updateTrackNotes]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onTogglePlaybackRef.current = onTogglePlayback;
  }, [onTogglePlayback]);

  const lastTransportEventRef = useRef<{ bar: number; audioTime: number; isCountingIn: boolean }>({
    bar: 1.0,
    audioTime: 0,
    isCountingIn: false
  });

  // Estado de arrastre grupal para la herramienta Puntero (mover o redimensionar notas en bloque)
  const dragStateRef = useRef<{
    mode: 'move' | 'resize';
    anchorNoteId: string;
    startX: number;
    startY: number;
    anchorInitialMidi: number;
    lastPreviewMidi: number;
    hasMoved: boolean;
    wasShiftClick: boolean;
    wasAlreadySelected: boolean;
    initialNotesMap: Map<string, InitialNoteDragState>;
    snapshotBeforeDrag: LocalPianoRollNote[];
  } | null>(null);

  // Estado de selección por recuadro arrastrable (Marquee / Lasso)
  const marqueeStateRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    additiveSelectionIds: Set<string>;
  } | null>(null);

  const safeBpm = Math.max(40, bpm || 120);
  const secondsPerBeat = 60 / safeBpm; // Duración de 1 negra (1/4) en segundos
  const bPerBar = Math.max(1, beatsPerBar || 4);
  const secondsPerBar = secondsPerBeat * bPerBar;
  const pixelsPerSecond = zoomBeatPx / secondsPerBeat;

  const secondsPerBeatRef = useRef<number>(secondsPerBeat);
  const bPerBarRef = useRef<number>(bPerBar);
  useEffect(() => {
    secondsPerBeatRef.current = secondsPerBeat;
    bPerBarRef.current = bPerBar;
  }, [secondsPerBeat, bPerBar]);

  // Factor según Grid Snap actual: '1/4' -> 1, '1/8' -> 0.5, '1/16' -> 0.25
  const snapFactor = useMemo(() => {
    if (gridSnap === '1/4') return 1.0;
    if (gridSnap === '1/8') return 0.5;
    return 0.25;
  }, [gridSnap]);

  const snapStepBeats = snapFactor;
  const gridStepSeconds = secondsPerBeat * snapFactor;
  const gridStepSecondsRef = useRef<number>(gridStepSeconds);
  useEffect(() => {
    gridStepSecondsRef.current = gridStepSeconds;
  }, [gridStepSeconds]);

  // Subdivisión por negra según Grid Snap (1/4 -> 1, 1/8 -> 2, 1/16 -> 4)
  const subdivisionsPerBeat = useMemo(() => {
    if (gridSnap === '1/4') return 1;
    if (gridSnap === '1/8') return 2;
    return 4;
  }, [gridSnap]);

  // Enfocar contenedor del modal para capturar teclado inmediatamente
  const focusModalContainer = useCallback(() => {
    try {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        activeEl !== modalContainerRef.current &&
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(activeEl.tagName)
      ) {
        activeEl.blur();
      }
      modalContainerRef.current?.focus({ preventScroll: true });
    } catch (_) {}
  }, []);

  // Generar las 88 teclas de arriba (C8 = 108, agudas) hacia abajo (A0 = 21, graves)
  const midiKeys = useMemo(() => {
    const list: Array<{
      midi: number;
      noteName: string;
      isBlack: boolean;
      isOctaveC: boolean;
    }> = [];
    for (let m = HIGHEST_MIDI_NOTE; m >= LOWEST_MIDI_NOTE; m--) {
      const pitchClass = m % 12;
      const octave = Math.floor(m / 12) - 1;
      const name = `${NOTE_NAMES[pitchClass]}${octave}`;
      list.push({
        midi: m,
        noteName: name,
        isBlack: BLACK_KEY_OFFSETS.has(pitchClass),
        isOctaveC: pitchClass === 0
      });
    }
    return list;
  }, []);

  // Convertir LocalPianoRollNote[] al formato MidiNoteVisual[] del DAW y propagar al estado global
  const propagateNotesToDaw = useCallback((updatedLocalNotes: LocalPianoRollNote[]) => {
    const currentTrack = activeTrackRef.current;
    const updater = updateTrackNotesRef.current;
    if (!currentTrack || !updater) return;

    const secPerBeat = secondsPerBeatRef.current;
    const beatsBar = bPerBarRef.current;

    const dawNotes: MidiNoteVisual[] = updatedLocalNotes.map((n, idx) => {
      const exactStartBeat = n.time / secPerBeat;
      const exactDurationBeats = Math.max(0.05, n.duration / secPerBeat);
      const startTicks = Math.max(0, Math.round(exactStartBeat * TICKS_PER_BEAT));
      const durationTicks = Math.max(12, Math.round(exactDurationBeats * TICKS_PER_BEAT));
      const bar = Number((1.0 + exactStartBeat / beatsBar).toFixed(6));
      const length = Number(Math.max(0.02, exactDurationBeats / beatsBar).toFixed(6));
      const pitchPercent = Math.max(5, Math.min(95, ((n.midi - 36) / (84 - 36)) * 100));

      return {
        id: n.id || `pr-note-${currentTrack.id}-${idx}`,
        note: n.midi,
        midi: n.midi,
        noteName: n.noteName,
        velocity: n.velocity,
        bar,
        length,
        pitchPercent,
        startTicks,
        durationTicks,
        time: Number(n.time.toFixed(6)),
        duration: Number(n.duration.toFixed(6))
      };
    });

    updater(currentTrack.id, dawNotes, currentTrack.activeClip?.id);
  }, []);

  // =========================================================================
  // BORRADO REAL, EDICIÓN GRUPAL Y CMD+Z / CTRL+Z INFALIBLES LEYENDO DESDE REFS
  // =========================================================================
  const commitNotesChange = useCallback(
    (newNotes: LocalPianoRollNote[], saveToUndo = true) => {
      if (saveToUndo) {
        const snapshot: LocalPianoRollNote[] = JSON.parse(JSON.stringify(notesRef.current));
        historyRef.current = [...historyRef.current, snapshot];
        setHistory([...historyRef.current]);
      }
      notesRef.current = newNotes;
      setLocalNotes(newNotes);
      propagateNotesToDaw(newNotes);
    },
    [propagateNotesToDaw]
  );

  const deleteSelectedNotes = useCallback(() => {
    const currentSelected = selectedIdsRef.current;
    if (!currentSelected || currentSelected.length === 0) return;

    const selectedSet = new Set(currentSelected);
    const remainingNotes = notesRef.current.filter(
      (note, idx) => !selectedSet.has(note.id ?? String(idx))
    );
    if (remainingNotes.length === notesRef.current.length) return;

    commitNotesChange(remainingNotes, true);
    selectedIdsRef.current = [];
    setSelectedNoteIds([]);
  }, [commitNotesChange]);

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previousNotes: LocalPianoRollNote[] = JSON.parse(
      JSON.stringify(historyRef.current[historyRef.current.length - 1])
    );
    historyRef.current = historyRef.current.slice(0, -1);
    setHistory([...historyRef.current]);
    selectedIdsRef.current = [];
    setSelectedNoteIds([]);
    commitNotesChange(previousNotes, false);
  }, [commitNotesChange]);

  const selectAllNotes = useCallback(() => {
    const allIds = notesRef.current.map((n, idx) => n.id ?? String(idx));
    selectedIdsRef.current = allIds;
    setSelectedNoteIds(allIds);
  }, []);

  // =========================================================================
  // 1. INICIALIZAR NOTAS SOLO CUANDO CAMBIA EL ID DE LA PISTA (activeTrack?.id)
  // =========================================================================
  useEffect(() => {
    if (!activeTrack) {
      notesRef.current = [];
      setLocalNotes([]);
      selectedIdsRef.current = [];
      setSelectedNoteIds([]);
      historyRef.current = [];
      setHistory([]);
      return;
    }

    const rawNotesSource: any[] =
      Array.isArray(activeTrack.notes) && activeTrack.notes.length > 0
        ? activeTrack.notes
        : activeTrack.activeClip && Array.isArray(activeTrack.activeClip.notes)
        ? activeTrack.activeClip.notes
        : Array.isArray(activeTrack.recordedNotes) && activeTrack.recordedNotes.length > 0
        ? activeTrack.recordedNotes
        : Array.isArray(activeTrack.regions) && activeTrack.regions.length > 0
        ? activeTrack.regions.flatMap(r => r.notes || [])
        : Array.isArray(activeTrack.clips) && activeTrack.clips.length > 0
        ? activeTrack.clips.flatMap(c => c.notes || [])
        : [];

    const parsed: LocalPianoRollNote[] = rawNotesSource.map((n: any, idx: number) => {
      let midiNum = 60;
      if (typeof n?.midi === 'string' && n.midi.trim()) {
        try {
          midiNum = Tone.Frequency(n.midi).toMidi();
        } catch (_) {
          midiNum = 60;
        }
      } else if (typeof n?.midi === 'number' && !isNaN(n.midi)) {
        midiNum = Math.round(n.midi);
      } else if (typeof n?.note === 'string' && n.note.trim()) {
        try {
          midiNum = Tone.Frequency(n.note).toMidi();
        } catch (_) {
          midiNum = 60;
        }
      } else if (typeof n?.note === 'number' && !isNaN(n.note)) {
        midiNum = Math.round(n.note);
      } else if (typeof n?.noteName === 'string' && n.noteName.trim()) {
        try {
          midiNum = Tone.Frequency(n.noteName).toMidi();
        } catch (_) {
          midiNum = 60;
        }
      } else if (typeof n?.pitchPercent === 'number' && !isNaN(n.pitchPercent)) {
        midiNum = Math.round((n.pitchPercent / 100) * (84 - 36) + 36);
      }
      midiNum = Math.max(LOWEST_MIDI_NOTE, Math.min(HIGHEST_MIDI_NOTE, midiNum));

      let startBeat = 0;
      if (typeof n?.startBeat === 'number' && !isNaN(n.startBeat)) {
        startBeat = Math.max(0, n.startBeat);
      } else if (typeof n?.startTicks === 'number' && !isNaN(n.startTicks)) {
        startBeat = Math.max(0, n.startTicks / TICKS_PER_BEAT);
      } else if (typeof n?.bar === 'number' && !isNaN(n.bar)) {
        startBeat = Math.max(0, (n.bar - 1.0) * bPerBar);
      } else if (typeof n?.time === 'number' && !isNaN(n.time)) {
        startBeat = Math.max(0, n.time / secondsPerBeat);
      }

      let durationBeats = 0.5;
      if (typeof n?.durationBeats === 'number' && !isNaN(n.durationBeats)) {
        durationBeats = Math.max(0.08, n.durationBeats);
      } else if (typeof n?.durationTicks === 'number' && !isNaN(n.durationTicks)) {
        durationBeats = Math.max(0.08, n.durationTicks / TICKS_PER_BEAT);
      } else if (typeof n?.length === 'number' && !isNaN(n.length)) {
        durationBeats = Math.max(0.08, n.length * bPerBar);
      } else if (typeof n?.duration === 'number' && !isNaN(n.duration)) {
        durationBeats = Math.max(0.08, n.duration / secondsPerBeat);
      }

      const noteName =
        typeof n?.noteName === 'string' && n.noteName.trim()
          ? n.noteName
          : getNoteNameFromMidi(midiNum);

      const velocity =
        typeof n?.velocity === 'number' && !isNaN(n.velocity)
          ? Math.max(1, Math.min(127, Math.round(n.velocity <= 1 ? n.velocity * 127 : n.velocity)))
          : 100;

      const stableId =
        typeof n?.id === 'string' && n.id.trim()
          ? n.id
          : `pr-note-${activeTrack.id}-${idx}-${Math.round(startBeat * 1000)}-${midiNum}`;

      return {
        id: stableId,
        midi: midiNum,
        noteName,
        startBeat,
        durationBeats,
        time: startBeat * secondsPerBeat,
        duration: durationBeats * secondsPerBeat,
        velocity
      };
    });

    notesRef.current = parsed;
    setLocalNotes(parsed);
    selectedIdsRef.current = [];
    setSelectedNoteIds([]);
    historyRef.current = [];
    setHistory([]);

    const initialClipStartBar = activeTrack.activeClip?.startBar
      ? Math.max(1, Math.floor(activeTrack.activeClip.startBar))
      : 1;
    const initialTimeSec = Math.max(0, (initialClipStartBar - 1) * secondsPerBar);
    setCurrentTime(initialTimeSec);
    lastTransportEventRef.current = {
      bar: initialClipStartBar,
      audioTime: Tone.now(),
      isCountingIn: false
    };

    let centerMidi = 60;
    if (parsed.length > 0) {
      const midis = parsed.map(n => n.midi);
      const minMidi = Math.min(...midis);
      const maxMidi = Math.max(...midis);
      centerMidi = Math.floor((minMidi + maxMidi) / 2);
    }

    const rowOffset = HIGHEST_MIDI_NOTE - centerMidi;
    const targetY = rowOffset * ROW_HEIGHT;

    const minBeat =
      parsed.length > 0
        ? Math.min(...parsed.map(n => n.startBeat))
        : (initialClipStartBar - 1) * bPerBar;
    const targetX = Math.max(0, (minBeat - 1) * zoomBeatPx);

    const applyScrollAndFocus = () => {
      const el = gridScrollRef.current;
      if (el) {
        const containerHeight = el.clientHeight || 500;
        const targetScrollTop = Math.max(0, targetY - containerHeight / 2 + ROW_HEIGHT / 2);
        el.scrollTop = targetScrollTop;
        el.scrollLeft = targetX;
      }
      focusModalContainer();
    };

    applyScrollAndFocus();
    const rafId = requestAnimationFrame(applyScrollAndFocus);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack?.id]);

  // Calcular número total de compases visibles en el Piano Roll
  const effectiveTotalBars = useMemo(() => {
    const maxNoteBeat = localNotes.reduce(
      (max, n) => Math.max(max, n.startBeat + n.durationBeats),
      0
    );
    const barsFromNotes = Math.ceil(maxNoteBeat / Math.max(1, beatsPerBar)) + 2;
    const clipBars = activeTrack?.activeClip?.durationBars
      ? Math.ceil((activeTrack.activeClip.startBar || 1) + activeTrack.activeClip.durationBars) + 2
      : 8;
    return Math.max(8, totalBars, barsFromNotes, clipBars);
  }, [localNotes, beatsPerBar, totalBars, activeTrack]);

  const totalBeats = effectiveTotalBars * beatsPerBar;
  const totalGridWidthPx = totalBeats * zoomBeatPx;
  const totalGridHeightPx = TOTAL_ROWS * ROW_HEIGHT;
  const barWidthPx = beatsPerBar * zoomBeatPx;

  const syncAutoScrollWithPlayheadX = useCallback((playheadX: number) => {
    if (!autoScrollRef.current || !gridScrollRef.current) return;
    const scrollEl = gridScrollRef.current;
    const scrollLeft = scrollEl.scrollLeft;
    const visibleWidth = Math.max(120, scrollEl.clientWidth - KEYBOARD_WIDTH_PX);

    if (playheadX <= 8 && scrollLeft > 0) {
      scrollEl.scrollLeft = 0;
    } else if (playheadX > scrollLeft + visibleWidth * 0.75 || playheadX < scrollLeft) {
      scrollEl.scrollLeft = Math.max(0, playheadX - visibleWidth * 0.2);
    }
  }, []);

  // =========================================================================
  // SEGUIMIENTO EN TIEMPO REAL DEL PLAYHEAD Y AUTO-SCROLL HORIZONTAL
  // =========================================================================
  useEffect(() => {
    const handleTransportPos = (e: any) => {
      const { bar, isPlaying: playing, isCountingIn } = e?.detail || {};
      if (typeof playing === 'boolean') {
        isPlayingRef.current = playing;
        setLocalIsPlaying(playing);
      }
      if (typeof bar === 'number' && !isNaN(bar)) {
        const clampedBar = Math.max(1.0, bar);
        lastTransportEventRef.current = {
          bar: clampedBar,
          audioTime: Tone.now(),
          isCountingIn: Boolean(isCountingIn)
        };
        const timeSec = Math.max(0, (clampedBar - 1.0) * secondsPerBar);
        setCurrentTime(timeSec);
        if (playing) {
          syncAutoScrollWithPlayheadX(timeSec * pixelsPerSecond);
        }
      }
    };

    const handleSeekEvent = (e: any) => {
      const bar = e?.detail?.bar;
      const targetSeconds = e?.detail?.targetSeconds;
      const sec =
        typeof targetSeconds === 'number' && !isNaN(targetSeconds)
          ? Math.max(0, targetSeconds)
          : typeof bar === 'number' && !isNaN(bar)
          ? Math.max(0, (bar - 1.0) * secondsPerBar)
          : 0;

      lastTransportEventRef.current = {
        bar: 1.0 + sec / secondsPerBar,
        audioTime: Tone.now(),
        isCountingIn: false
      };
      setCurrentTime(sec);
    };

    const handleGlobalStop = () => {
      isPlayingRef.current = false;
      setLocalIsPlaying(false);
    };

    window.addEventListener('linus-transport-position', handleTransportPos);
    window.addEventListener('linus-seek-measure', handleSeekEvent);
    window.addEventListener('global-playback-stop', handleGlobalStop);
    return () => {
      window.removeEventListener('linus-transport-position', handleTransportPos);
      window.removeEventListener('linus-seek-measure', handleSeekEvent);
      window.removeEventListener('global-playback-stop', handleGlobalStop);
    };
  }, [secondsPerBar, pixelsPerSecond, syncAutoScrollWithPlayheadX]);

  // Loop de 60fps mientras la reproducción está en curso
  useEffect(() => {
    if (!localIsPlaying) return;

    let rafId: number;
    const totalDurationSec = effectiveTotalBars * secondsPerBar;

    const tick = () => {
      let nextTimeSec = -1;

      try {
        if (
          Tone.Transport.state === 'started' &&
          typeof Tone.Transport.seconds === 'number' &&
          !isNaN(Tone.Transport.seconds) &&
          Tone.Transport.seconds >= 0 &&
          !lastTransportEventRef.current.isCountingIn
        ) {
          nextTimeSec = Tone.Transport.seconds % Math.max(secondsPerBar, totalDurationSec);
        }
      } catch (_) {}

      if (nextTimeSec < 0) {
        const evt = lastTransportEventRef.current;
        const baseSec = Math.max(0, (evt.bar - 1.0) * secondsPerBar);
        if (evt.isCountingIn) {
          nextTimeSec = baseSec;
        } else {
          const elapsed = Math.max(0, Tone.now() - evt.audioTime);
          nextTimeSec = (baseSec + elapsed) % Math.max(secondsPerBar, totalDurationSec);
        }
      }

      setCurrentTime(nextTimeSec);
      const playheadX = nextTimeSec * pixelsPerSecond;
      syncAutoScrollWithPlayheadX(playheadX);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [localIsPlaying, effectiveTotalBars, secondsPerBar, pixelsPerSecond, syncAutoScrollWithPlayheadX]);

  const seekToBar = useCallback(
    (targetBarNumber: number) => {
      const clampedBar = Math.max(1, Math.min(effectiveTotalBars, targetBarNumber));
      const measureIdx = Math.max(0, Math.floor(clampedBar - 1));
      const targetSeconds = measureIdx * secondsPerBar;

      lastTransportEventRef.current = {
        bar: measureIdx + 1.0,
        audioTime: Tone.now(),
        isCountingIn: false
      };
      setCurrentTime(targetSeconds);

      if (onSeekMeasure) {
        onSeekMeasure(measureIdx);
      } else {
        try {
          Tone.Transport.seconds = targetSeconds;
        } catch (_) {}
        window.dispatchEvent(
          new CustomEvent('linus-seek-measure', {
            detail: {
              measureIndex: measureIdx,
              bar: measureIdx + 1.0,
              targetSeconds
            }
          })
        );
      }
      focusModalContainer();
    },
    [effectiveTotalBars, onSeekMeasure, secondsPerBar, focusModalContainer]
  );

  // =========================================================================
  // CONTROLES DE TRANSPORTE EN CABECERA
  // =========================================================================
  const handleTransportRewind = useCallback(() => {
    if (onRewind) {
      onRewind();
    } else {
      const rewindBtn = document.getElementById('daw-transport-rewind-btn');
      if (rewindBtn) rewindBtn.click();
    }
    lastTransportEventRef.current = {
      bar: 1.0,
      audioTime: Tone.now(),
      isCountingIn: false
    };
    setCurrentTime(0);
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollLeft = 0;
    }
    focusModalContainer();
  }, [onRewind, focusModalContainer]);

  const handleTransportPlayClick = useCallback(() => {
    if (localIsPlaying) return;
    if (onTogglePlayback) {
      onTogglePlayback();
    } else {
      const playBtn =
        document.getElementById('daw-transport-play-btn') ||
        document.getElementById('metronome-toggle-btn');
      if (playBtn) playBtn.click();
    }
    focusModalContainer();
  }, [localIsPlaying, onTogglePlayback, focusModalContainer]);

  const handleTransportStopClick = useCallback(() => {
    if (onStopPlayback) {
      onStopPlayback();
    } else if (localIsPlaying && onTogglePlayback) {
      onTogglePlayback();
    } else {
      const stopBtn = document.getElementById('daw-transport-stop-btn');
      if (stopBtn) stopBtn.click();
    }
    setLocalIsPlaying(false);
    isPlayingRef.current = false;
    focusModalContainer();
  }, [onStopPlayback, localIsPlaying, onTogglePlayback, focusModalContainer]);

  // =========================================================================
  // CUANTIZAR GRUPO SELECCIONADO O PISTA COMPLETA CON SOPORTE DE HISTORIAL
  // =========================================================================
  const handleQuantize = useCallback(() => {
    const currentNotes = notesRef.current;
    if (currentNotes.length === 0) return;

    const currentSelection = new Set(selectedIdsRef.current);
    const hasSelection = currentSelection.size > 0;
    const stepSec = gridStepSecondsRef.current;
    const secPerBeat = secondsPerBeatRef.current;

    const quantized = currentNotes.map((note, idx) => {
      const noteKey = note.id ?? String(idx);
      if (hasSelection && !currentSelection.has(noteKey)) {
        return note;
      }

      const currentNoteTime =
        typeof note.time === 'number' && !isNaN(note.time)
          ? note.time
          : note.startBeat * secPerBeat;
      const currentNoteDuration =
        typeof note.duration === 'number' && !isNaN(note.duration)
          ? note.duration
          : note.durationBeats * secPerBeat;

      const quantizedTime = Math.max(0, Math.round(currentNoteTime / stepSec) * stepSec);
      const quantizedDuration = Math.max(
        stepSec,
        Math.round(currentNoteDuration / stepSec) * stepSec
      );

      const quantizedStartBeat = quantizedTime / secPerBeat;
      const quantizedDurationBeats = quantizedDuration / secPerBeat;

      return {
        ...note,
        time: Number(quantizedTime.toFixed(6)),
        duration: Number(quantizedDuration.toFixed(6)),
        startBeat: Number(quantizedStartBeat.toFixed(6)),
        durationBeats: Number(quantizedDurationBeats.toFixed(6))
      };
    });

    commitNotesChange(quantized, true);
    focusModalContainer();
  }, [commitNotesChange, focusModalContainer]);

  // =========================================================================
  // MOVIMIENTO GRUPAL RELATIVO, REDIMENSIONADO EN GRUPO Y MARQUEE SELECTION
  // =========================================================================
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const marquee = marqueeStateRef.current;
      if (marquee && activeTool === 'puntero' && gridCanvasRef.current) {
        const rect = gridCanvasRef.current.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(totalGridWidthPx, e.clientX - rect.left));
        const currentY = Math.max(0, Math.min(totalGridHeightPx, e.clientY - rect.top));

        marquee.currentX = currentX;
        marquee.currentY = currentY;
        setSelectionBox({
          startX: marquee.startX,
          startY: marquee.startY,
          currentX,
          currentY
        });

        const minX = Math.min(marquee.startX, currentX);
        const maxX = Math.max(marquee.startX, currentX);
        const minY = Math.min(marquee.startY, currentY);
        const maxY = Math.max(marquee.startY, currentY);

        const nextSelectedSet = new Set<string>(marquee.additiveSelectionIds);
        notesRef.current.forEach((note, idx) => {
          const noteKey = note.id ?? String(idx);
          const rowIndex = HIGHEST_MIDI_NOTE - note.midi;
          const noteTop = rowIndex * ROW_HEIGHT + 2;
          const noteBottom = noteTop + (ROW_HEIGHT - 4);
          const noteLeft = note.startBeat * zoomBeatPx;
          const noteRight = noteLeft + Math.max(10, note.durationBeats * zoomBeatPx - 1);

          const intersects =
            noteRight >= minX &&
            noteLeft <= maxX &&
            noteBottom >= minY &&
            noteTop <= maxY;

          if (intersects) {
            nextSelectedSet.add(noteKey);
          }
        });

        const nextSelectedArr = Array.from(nextSelectedSet);
        selectedIdsRef.current = nextSelectedArr;
        setSelectedNoteIds(nextSelectedArr);
        return;
      }

      const drag = dragStateRef.current;
      if (!drag || activeTool !== 'puntero') return;

      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        drag.hasMoved = true;
      }

      if (!drag.hasMoved) return;

      const initialEntries = Array.from(drag.initialNotesMap.values());
      if (initialEntries.length === 0) return;

      if (drag.mode === 'move') {
        const rawDeltaBeats = deltaX / zoomBeatPx;
        const snappedDeltaBeats = Math.round(rawDeltaBeats / snapStepBeats) * snapStepBeats;

        const minInitialStartBeat = Math.min(...initialEntries.map(item => item.startBeat));
        const effectiveDeltaBeats = Math.max(-minInitialStartBeat, snappedDeltaBeats);

        const rawDeltaRows = Math.round(deltaY / ROW_HEIGHT);
        const rawDeltaMidi = -rawDeltaRows;
        const minInitialMidi = Math.min(...initialEntries.map(item => item.midi));
        const maxInitialMidi = Math.max(...initialEntries.map(item => item.midi));
        const effectiveDeltaMidi = Math.max(
          LOWEST_MIDI_NOTE - minInitialMidi,
          Math.min(HIGHEST_MIDI_NOTE - maxInitialMidi, rawDeltaMidi)
        );

        const newAnchorMidi = drag.anchorInitialMidi + effectiveDeltaMidi;
        if (newAnchorMidi !== drag.lastPreviewMidi && onTriggerPreviewNote) {
          drag.lastPreviewMidi = newAnchorMidi;
          onTriggerPreviewNote(newAnchorMidi);
        }

        const updated = notesRef.current.map((n, idx) => {
          const noteKey = n.id ?? String(idx);
          const init = drag.initialNotesMap.get(noteKey);
          if (!init) return n;

          const nextStartBeat = Number(Math.max(0, init.startBeat + effectiveDeltaBeats).toFixed(6));
          const nextTime = Number((nextStartBeat * secondsPerBeat).toFixed(6));
          const nextMidi = Math.max(
            LOWEST_MIDI_NOTE,
            Math.min(HIGHEST_MIDI_NOTE, init.midi + effectiveDeltaMidi)
          );

          return {
            ...n,
            midi: nextMidi,
            noteName: getNoteNameFromMidi(nextMidi),
            startBeat: nextStartBeat,
            time: nextTime
          };
        });

        notesRef.current = updated;
        setLocalNotes(updated);
      } else if (drag.mode === 'resize') {
        const rawDeltaBeats = deltaX / zoomBeatPx;
        const snappedDeltaDurationBeats =
          Math.round(rawDeltaBeats / snapStepBeats) * snapStepBeats;

        const updated = notesRef.current.map((n, idx) => {
          const noteKey = n.id ?? String(idx);
          const init = drag.initialNotesMap.get(noteKey);
          if (!init) return n;

          const nextDurationBeats = Number(
            Math.max(snapStepBeats, init.durationBeats + snappedDeltaDurationBeats).toFixed(6)
          );
          const nextDuration = Number((nextDurationBeats * secondsPerBeat).toFixed(6));

          return {
            ...n,
            durationBeats: nextDurationBeats,
            duration: nextDuration
          };
        });

        notesRef.current = updated;
        setLocalNotes(updated);
      }
    };

    const handleWindowMouseUp = () => {
      if (marqueeStateRef.current) {
        marqueeStateRef.current = null;
        setSelectionBox(null);
      }

      const drag = dragStateRef.current;
      if (drag) {
        dragStateRef.current = null;
        if (drag.hasMoved) {
          historyRef.current = [...historyRef.current, drag.snapshotBeforeDrag];
          setHistory([...historyRef.current]);
          propagateNotesToDaw(notesRef.current);
        } else if (!drag.wasShiftClick && drag.wasAlreadySelected && selectedIdsRef.current.length > 1) {
          selectedIdsRef.current = [drag.anchorNoteId];
          setSelectedNoteIds([drag.anchorNoteId]);
        }
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    activeTool,
    zoomBeatPx,
    snapStepBeats,
    secondsPerBeat,
    totalGridWidthPx,
    totalGridHeightPx,
    onTriggerPreviewNote,
    propagateNotesToDaw
  ]);

  // =========================================================================
  // LISTENER GLOBAL DE TECLADO EN FASE DE CAPTURA
  // =========================================================================
  const handleUndoRef = useRef(handleUndo);
  const deleteSelectedNotesRef = useRef(deleteSelectedNotes);
  const handleQuantizeRef = useRef(handleQuantize);
  const selectAllNotesRef = useRef(selectAllNotes);

  useEffect(() => {
    handleUndoRef.current = handleUndo;
    deleteSelectedNotesRef.current = deleteSelectedNotes;
    handleQuantizeRef.current = handleQuantize;
    selectAllNotesRef.current = selectAllNotes;
  }, [handleUndo, deleteSelectedNotes, handleQuantize, selectAllNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeTrackRef.current) return;

      const activeTag = document.activeElement?.tagName || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndoRef.current();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        e.stopPropagation();
        selectAllNotesRef.current();
        return;
      }

      if (
        e.key === 'Delete' ||
        e.key === 'Backspace' ||
        e.code === 'Delete' ||
        e.code === 'Backspace'
      ) {
        e.preventDefault();
        e.stopPropagation();
        deleteSelectedNotesRef.current();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (!e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        e.stopPropagation();
        handleQuantizeRef.current();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  if (!activeTrack) return null;

  const handleNoteClick = (note: LocalPianoRollNote, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    focusModalContainer();

    const noteKey = note.id ?? String(idx);

    if (activeTool === 'goma') {
      const remaining = notesRef.current.filter((n, i) => (n.id ?? String(i)) !== noteKey);
      commitNotesChange(remaining, true);
      const nextSelected = selectedIdsRef.current.filter(id => id !== noteKey);
      selectedIdsRef.current = nextSelected;
      setSelectedNoteIds(nextSelected);
    }
  };

  const handleNoteMouseDown = (
    note: LocalPianoRollNote,
    idx: number,
    mode: 'move' | 'resize',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    focusModalContainer();

    const noteKey = note.id ?? String(idx);

    if (activeTool === 'goma') {
      handleNoteClick(note, idx, e);
      return;
    }

    if (activeTool !== 'puntero') return;

    const currentSelected = selectedIdsRef.current;
    const wasAlreadySelected = currentSelected.includes(noteKey);

    let nextSelected: string[];
    if (e.shiftKey) {
      if (wasAlreadySelected) {
        nextSelected = currentSelected.filter(id => id !== noteKey);
        selectedIdsRef.current = nextSelected;
        setSelectedNoteIds(nextSelected);
        return;
      } else {
        nextSelected = [...currentSelected, noteKey];
      }
    } else if (wasAlreadySelected) {
      nextSelected = currentSelected;
    } else {
      nextSelected = [noteKey];
    }

    selectedIdsRef.current = nextSelected;
    setSelectedNoteIds(nextSelected);

    if (mode === 'move' && onTriggerPreviewNote) {
      onTriggerPreviewNote(note.midi);
    }

    const selectedSet = new Set(nextSelected);
    const initialNotesMap = new Map<string, InitialNoteDragState>();
    notesRef.current.forEach((n, i) => {
      const k = n.id ?? String(i);
      if (selectedSet.has(k)) {
        initialNotesMap.set(k, {
          startBeat: n.startBeat,
          durationBeats: n.durationBeats,
          time: n.time,
          duration: n.duration,
          midi: n.midi
        });
      }
    });

    dragStateRef.current = {
      mode,
      anchorNoteId: noteKey,
      startX: e.clientX,
      startY: e.clientY,
      anchorInitialMidi: note.midi,
      lastPreviewMidi: note.midi,
      hasMoved: false,
      wasShiftClick: Boolean(e.shiftKey),
      wasAlreadySelected,
      initialNotesMap,
      snapshotBeforeDrag: JSON.parse(JSON.stringify(notesRef.current))
    };
  };

  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    focusModalContainer();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(totalGridWidthPx, e.clientX - rect.left));
    const offsetY = Math.max(0, Math.min(totalGridHeightPx, e.clientY - rect.top));

    if (activeTool === 'puntero') {
      const additiveIds = e.shiftKey ? new Set<string>(selectedIdsRef.current) : new Set<string>();
      if (!e.shiftKey) {
        selectedIdsRef.current = [];
        setSelectedNoteIds([]);
      }

      marqueeStateRef.current = {
        startX: offsetX,
        startY: offsetY,
        currentX: offsetX,
        currentY: offsetY,
        additiveSelectionIds: additiveIds
      };
      setSelectionBox({
        startX: offsetX,
        startY: offsetY,
        currentX: offsetX,
        currentY: offsetY
      });
      return;
    }

    if (activeTool !== 'lapiz') return;

    const rowIndex = Math.floor(offsetY / ROW_HEIGHT);
    const midi = Math.max(
      LOWEST_MIDI_NOTE,
      Math.min(HIGHEST_MIDI_NOTE, HIGHEST_MIDI_NOTE - rowIndex)
    );

    const rawBeat = offsetX / zoomBeatPx;
    const snappedBeat = Math.max(0, Math.floor(rawBeat / snapStepBeats) * snapStepBeats);
    const snapDurationBeats = snapStepBeats;

    const snappedTime = Number((snappedBeat * secondsPerBeat).toFixed(6));
    const snapDuration = Number((snapDurationBeats * secondsPerBeat).toFixed(6));

    const newNote: LocalPianoRollNote = {
      id: `pr-note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      midi,
      noteName: getNoteNameFromMidi(midi),
      startBeat: snappedBeat,
      durationBeats: snapDurationBeats,
      time: snappedTime,
      duration: snapDuration,
      velocity: 100
    };

    if (onTriggerPreviewNote) {
      onTriggerPreviewNote(midi);
    }

    const nextNotes = [...notesRef.current, newNote];
    commitNotesChange(nextNotes, true);
    selectedIdsRef.current = [newNote.id];
    setSelectedNoteIds([newNote.id]);
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, e.clientX - rect.left);
    const clickedBeat = clickX / zoomBeatPx;
    const snappedBar = 1.0 + Math.floor(clickedBeat) / bPerBar;
    seekToBar(snappedBar);
  };

  const trackColor = activeTrack.accentColor || '#8B5CF6';
  const clipTitle = activeTrack.activeClip?.name || 'TAKE 01';
  const playheadX = Math.max(0, currentTime * pixelsPerSecond);
  const currentMeasureInt = Math.max(
    1,
    Math.min(effectiveTotalBars, Math.floor(1 + currentTime / secondsPerBar))
  );
  const selectedCount = selectedNoteIds.length;

  const modalContent = (
    <div
      id="piano-roll-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden select-none"
    >
      <div
        id="piano-roll-modal-container"
        ref={modalContainerRef}
        tabIndex={-1}
        onClick={e => {
          e.stopPropagation();
          focusModalContainer();
        }}
        className="w-[95vw] max-w-7xl h-[90vh] bg-[#121212] border border-neutral-800 rounded-xl flex flex-col overflow-hidden shadow-2xl text-neutral-200 font-sans outline-none"
      >
        {/* CABECERA */}
        <div className="flex items-center justify-between whitespace-nowrap flex-nowrap gap-3 px-4 py-3 bg-[#161616] border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 shadow-sm"
              style={{
                backgroundColor: `${trackColor}20`,
                borderColor: `${trackColor}60`,
                color: trackColor
              }}
            >
              <Piano size={16} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide truncate">
                  Editor MIDI: {activeTrack.name}
                </h2>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0"
                  style={{
                    backgroundColor: `${trackColor}22`,
                    borderColor: `${trackColor}55`,
                    color: trackColor
                  }}
                >
                  {clipTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span className="truncate">{activeTrack.instrument || 'Synth MIDI'}</span>
                <span className="text-neutral-600">•</span>
                <span>
                  {localNotes.length} {localNotes.length === 1 ? 'nota' : 'notas'}
                </span>
                {selectedCount > 1 && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="text-[#EA580B] font-bold">
                      {selectedCount} seleccionadas
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#101010] p-1 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTool('puntero');
                  focusModalContainer();
                }}
                title="Puntero (Seleccionar / Recuadro de Selección / Mover en Grupo)"
                aria-label="Puntero"
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  activeTool === 'puntero'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <MousePointer2 size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool('lapiz');
                  focusModalContainer();
                }}
                title="Lápiz (Dibujar Notas)"
                aria-label="Lápiz"
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  activeTool === 'lapiz'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Pencil size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTool('goma');
                  focusModalContainer();
                }}
                title="Goma (Borrar Notas)"
                aria-label="Goma"
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  activeTool === 'goma'
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Eraser size={15} />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#101010] p-1 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={handleTransportRewind}
                title="Volver al inicio (Compás 1 / 0:0:0)"
                aria-label="Volver al inicio"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <SkipBack size={15} />
              </button>

              <button
                type="button"
                onClick={handleTransportPlayClick}
                title="Reproducir (Play)"
                aria-label="Reproducir"
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  localIsPlaying
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Play size={14} className="fill-current" />
              </button>

              <button
                type="button"
                onClick={handleTransportStopClick}
                title="Detener (Stop)"
                aria-label="Detener"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <Square size={13} className="fill-current" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAutoScroll(prev => !prev);
                  focusModalContainer();
                }}
                title={
                  autoScroll
                    ? 'Seguimiento automático del cursor activo (Auto-Scroll ON)'
                    : 'Activar seguimiento automático del cursor (Auto-Scroll OFF)'
                }
                aria-label="Seguimiento automático del cursor"
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  autoScroll
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Link2 size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 rounded-md">
              <Magnet size={13} className="text-[#EA580B]" />
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold">
                GRID SNAP:
              </span>
              <div className="flex items-center gap-0.5">
                {(['1/4', '1/8', '1/16'] as GridSnapDivision[]).map(div => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setGridSnap(div);
                      focusModalContainer();
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      gridSnap === div
                        ? 'bg-[#EA580B] text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuantize}
              title={`Cuantizar notas al Grid Snap actual (${gridSnap})`}
              className="h-8 flex items-center justify-center px-3 py-1.5 rounded-md bg-[#EA580B] hover:bg-orange-600 border border-orange-500/40 text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Cuantizar
            </button>

            <div className="h-8 flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded-md px-1">
              <button
                type="button"
                onClick={() => {
                  handleUndo();
                  focusModalContainer();
                }}
                disabled={history.length === 0}
                title="Deshacer último cambio (Cmd+Z / Ctrl+Z)"
                aria-label="Deshacer"
                className={`p-1.5 rounded transition-colors ${
                  history.length > 0
                    ? 'text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Undo2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSelectedNotes();
                  focusModalContainer();
                }}
                disabled={selectedCount === 0}
                title="Eliminar nota(s) seleccionada(s) (Delete / Backspace)"
                aria-label="Eliminar nota seleccionada"
                className={`p-1.5 rounded transition-colors ${
                  selectedCount > 0
                    ? 'text-neutral-300 hover:text-rose-400 hover:bg-neutral-800 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="h-8 flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 rounded-md px-1">
              <button
                type="button"
                onClick={() => {
                  setZoomBeatPx(prev => Math.max(36, prev - 12));
                  focusModalContainer();
                }}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                title="Alejar grilla horizontal"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomBeatPx(prev => Math.min(128, prev + 12));
                  focusModalContainer();
                }}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                title="Acercar grilla horizontal"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsScorePreviewOpen(true);
              }}
              title="Exportar Partitura PDF (Pentagrama + Acordes)"
              aria-label="Exportar Partitura PDF"
              className="w-8 h-8 rounded-md bg-neutral-900 hover:bg-[#EA580B]/20 border border-neutral-800 hover:border-[#EA580B]/60 text-neutral-300 hover:text-[#EA580B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <FileText size={14} />
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar Editor MIDI (Esc)"
              aria-label="Cerrar Editor MIDI"
              className="w-8 h-8 rounded-md bg-neutral-900 hover:bg-rose-600/20 border border-neutral-800 hover:border-rose-500/60 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ÁREA DE TRABAJO */}
        <div className="flex-1 flex overflow-hidden relative">
          <div
            ref={gridScrollRef}
            className="flex-1 overflow-x-scroll overflow-y-scroll piano-roll-scroll relative bg-[#101010] min-h-0 min-w-0"
          >
            <div
              style={{ width: `${KEYBOARD_WIDTH_PX + totalGridWidthPx}px` }}
              className="sticky top-0 z-30 flex h-8 bg-[#141414] border-b border-neutral-800"
            >
              <div className="sticky left-0 z-40 w-24 shrink-0 border-r border-neutral-800 px-2.5 flex items-center justify-between text-[10px] font-mono font-bold uppercase text-neutral-500 bg-[#141414]">
                <span>PITCH</span>
                <span>88 KEYS</span>
              </div>

              <div
                onClick={handleRulerClick}
                title="Haz clic en cualquier compás para posicionar el Playhead"
                style={{ width: `${totalGridWidthPx}px` }}
                className="flex h-full relative bg-[#111111] cursor-pointer"
              >
                {Array.from({ length: effectiveTotalBars }).map((_, barIdx) => {
                  const barNumber = barIdx + 1;
                  const isCurrentBar = currentMeasureInt === barNumber;
                  return (
                    <div
                      key={barNumber}
                      style={{ width: `${barWidthPx}px` }}
                      className="shrink-0 h-full border-r border-neutral-700/80 flex items-center relative"
                    >
                      {Array.from({ length: beatsPerBar }).map((__, beatIdx) => (
                        <div
                          key={beatIdx}
                          style={{ width: `${zoomBeatPx}px` }}
                          className={`h-full flex items-center pl-1.5 border-r ${
                            beatIdx === beatsPerBar - 1
                              ? 'border-transparent'
                              : 'border-neutral-800/70'
                          }`}
                        >
                          {beatIdx === 0 ? (
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isCurrentBar ? 'text-[#EA580B]' : 'text-neutral-200'
                              }`}
                            >
                              {barNumber}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-neutral-500">
                              {barNumber}.{beatIdx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                <div
                  style={{ left: `${playheadX}px` }}
                  className="absolute top-0 bottom-0 w-[2px] bg-[#EA580B] z-30 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 bg-[#EA580B] rotate-45 -translate-x-[4px] -translate-y-[3px] rounded-[1px]" />
                </div>
              </div>
            </div>

            <div
              style={{
                width: `${KEYBOARD_WIDTH_PX + totalGridWidthPx}px`,
                height: `${totalGridHeightPx}px`
              }}
              className="flex relative"
            >
              <div
                style={{ height: `${totalGridHeightPx}px` }}
                className="sticky left-0 z-20 w-24 shrink-0 bg-[#151515] border-r border-neutral-800 select-none flex flex-col shadow-[4px_0_12px_rgba(0,0,0,0.45)]"
              >
                {midiKeys.map(key => (
                  <div
                    key={key.midi}
                    onClick={() => {
                      focusModalContainer();
                      if (onTriggerPreviewNote) {
                        onTriggerPreviewNote(key.midi);
                      }
                    }}
                    style={{ height: `${ROW_HEIGHT}px` }}
                    className={`w-full shrink-0 flex items-center justify-between px-2 border-b transition-colors cursor-pointer relative ${
                      key.isBlack
                        ? 'bg-[#18181b] hover:bg-neutral-800 text-neutral-400 border-neutral-900'
                        : key.isOctaveC
                        ? 'bg-neutral-200 hover:bg-orange-100 text-neutral-950 border-neutral-400 font-bold'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {key.isBlack && (
                      <div className="absolute left-0 top-0 bottom-0 w-[64%] bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 border-r border-neutral-700 rounded-r-xs shadow-md pointer-events-none" />
                    )}

                    <span
                      className={`relative z-10 text-[9px] font-mono leading-none ml-auto ${
                        key.isBlack
                          ? 'text-neutral-400 font-medium'
                          : key.isOctaveC
                          ? 'text-[#EA580B] font-extrabold'
                          : 'text-neutral-600 font-semibold'
                      }`}
                    >
                      {key.noteName}
                    </span>
                  </div>
                ))}
              </div>

              <div
                ref={gridCanvasRef}
                onMouseDown={handleGridMouseDown}
                style={{
                  width: `${totalGridWidthPx}px`,
                  height: `${totalGridHeightPx}px`
                }}
                className={`relative flex-1 ${
                  activeTool === 'lapiz'
                    ? 'cursor-crosshair'
                    : activeTool === 'goma'
                    ? 'cursor-crosshair'
                    : 'cursor-default'
                }`}
              >
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {midiKeys.map(key => (
                    <div
                      key={key.midi}
                      style={{ height: `${ROW_HEIGHT}px` }}
                      className={`w-full shrink-0 border-b ${
                        key.isOctaveC
                          ? 'bg-[#18181b] border-b-neutral-700/80'
                          : key.isBlack
                          ? 'bg-[#111113] border-b-neutral-900/90'
                          : 'bg-[#16161a] border-b-neutral-800/50'
                      }`}
                    />
                  ))}
                </div>

                <div
                  style={{
                    backgroundSize: `${zoomBeatPx / subdivisionsPerBeat}px ${ROW_HEIGHT}px`,
                    backgroundImage:
                      'linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px)'
                  }}
                  className="absolute inset-0 flex pointer-events-none"
                >
                  {Array.from({ length: effectiveTotalBars }).map((_, barIdx) => (
                    <div
                      key={barIdx}
                      style={{ width: `${barWidthPx}px` }}
                      className="shrink-0 h-full border-r border-neutral-700/70 flex"
                    >
                      {Array.from({ length: beatsPerBar }).map((__, beatIdx) => (
                        <div
                          key={beatIdx}
                          style={{ width: `${zoomBeatPx}px` }}
                          className={`h-full ${
                            beatIdx === beatsPerBar - 1
                              ? ''
                              : 'border-r border-neutral-800/70'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {selectionBox && (
                  <div
                    style={{
                      left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
                      top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
                      width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
                      height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`
                    }}
                    className="absolute border border-orange-500 bg-orange-500/15 pointer-events-none z-30 rounded-[2px]"
                  />
                )}

                <div
                  style={{ left: `${playheadX}px` }}
                  className="absolute top-0 bottom-0 w-[2px] bg-[#EA580B] shadow-[0_0_8px_rgba(234,88,11,0.85)] z-25 pointer-events-none"
                />

                <div className="absolute inset-0 pointer-events-none">
                  {localNotes.map((note, idx) => {
                    const rowIndex = HIGHEST_MIDI_NOTE - note.midi;
                    if (rowIndex < 0 || rowIndex >= TOTAL_ROWS) return null;

                    const noteKey = note.id ?? String(idx);
                    const topPx = rowIndex * ROW_HEIGHT + 2;
                    const heightPx = ROW_HEIGHT - 4;
                    const leftPx = note.startBeat * zoomBeatPx;
                    const widthPx = Math.max(10, note.durationBeats * zoomBeatPx - 1);
                    const isSelected = selectedNoteIds.includes(noteKey);

                    const noteCursorClass =
                      activeTool === 'goma'
                        ? 'cursor-crosshair hover:bg-rose-600/90 hover:border-rose-300'
                        : activeTool === 'puntero'
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-crosshair';

                    return (
                      <div
                        key={noteKey}
                        onMouseDown={e => handleNoteMouseDown(note, idx, 'move', e)}
                        onClick={e => handleNoteClick(note, idx, e)}
                        title={`${note.noteName} (MIDI ${note.midi}) | Inicio: Beat ${(
                          note.startBeat + 1
                        ).toFixed(2)} | Duración: ${note.durationBeats.toFixed(2)} beats`}
                        style={{
                          top: `${topPx}px`,
                          left: `${leftPx}px`,
                          width: `${widthPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: isSelected ? '#EA580B' : trackColor,
                          borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.35)'
                        }}
                        className={`pointer-events-auto absolute rounded-md px-1.5 flex items-center justify-between overflow-hidden transition-shadow group/note ${noteCursorClass} ${
                          isSelected
                            ? 'border-2 border-white ring-2 ring-white/80 shadow-[0_0_12px_rgba(234,88,11,0.85)] z-20'
                            : 'border hover:brightness-110 shadow-md z-10'
                        }`}
                      >
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-white/25 pointer-events-none" />

                        <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs truncate leading-none select-none pointer-events-none">
                          {note.noteName}
                        </span>

                        {widthPx > 46 && (
                          <span className="text-[8px] font-mono text-white/80 leading-none ml-1 shrink-0 select-none pointer-events-none">
                            v{note.velocity}
                          </span>
                        )}

                        {activeTool === 'puntero' && (
                          <div
                            onMouseDown={e => handleNoteMouseDown(note, idx, 'resize', e)}
                            title="Arrastrar para cambiar la duración"
                            className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 transition-colors"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIE DE ESTADO TÉCNICO */}
        <div className="flex items-center justify-between whitespace-nowrap px-4 py-2 bg-[#161616] border-t border-neutral-800 text-[11px] font-mono text-neutral-400 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>
              HERRAMIENTA:{' '}
              <strong className="text-[#EA580B] uppercase">
                {activeTool === 'puntero'
                  ? 'Puntero (Seleccionar / Mover)'
                  : activeTool === 'lapiz'
                  ? 'Lápiz (Dibujar Notas)'
                  : 'Goma (Borrar Notas)'}
              </strong>
            </span>
            <span className="text-neutral-700">|</span>
            <span>
              SNAP: <strong className="text-neutral-200">{gridSnap}</strong>
            </span>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              TEMPO: <strong className="text-neutral-200">{bpm} BPM</strong>
            </span>
          </div>

          <div className="text-neutral-500 text-[10px] truncate">
            {activeTool === 'lapiz'
              ? 'Haz clic en cualquier celda de la grilla para dibujar una nota'
              : activeTool === 'goma'
              ? 'Haz clic sobre cualquier bloque de nota para eliminarlo'
              : 'Arrastra en el fondo para selección múltiple • Shift+Clic o Cmd/Ctrl+A • Supr para borrar • Cmd/Ctrl+Z deshacer'}
          </div>
        </div>

        {isScorePreviewOpen && (
          <ScorePreviewModal
            isOpen={isScorePreviewOpen}
            onClose={() => {
              setIsScorePreviewOpen(false);
              focusModalContainer();
            }}
            song={
              currentSong
                ? { ...currentSong, tempo: bpm }
                : {
                    id: 'piano-roll-score',
                    title: activeTrack.name || 'Partitura MIDI',
                    composer: 'Rumie Studio',
                    defaultKey: globalKey || 'C',
                    style: 'Jazz Swing',
                    tempo: bpm,
                    timeSignature: `${beatsPerBar}/4`,
                    measures: Array.from({ length: totalBars }, (_, idx) => ({
                      id: `m-${idx}`,
                      chords: ['']
                    }))
                  }
            }
            transposition={transposition}
            globalKey={globalKey}
            activeKey={currentSong?.activeKey || currentSong?.defaultKey || globalKey || 'C'}
            midiNotes={localNotes.map(n => ({
              id: n.id,
              midi: n.midi,
              note: n.midi,
              startBeat: n.startBeat,
              durationBeats: n.durationBeats,
              time: n.time,
              duration: n.duration,
              velocity: n.velocity
            }))}
            trackName={activeTrack.name}
            instrumentName={activeTrack.instrument}
            bankId={activeTrack.bankId}
          />
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default PianoRollModal;
