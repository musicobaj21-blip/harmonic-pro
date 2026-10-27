import { ensureStereoBuffer } from "../utils/audio";
import { LayoutGrid, ChevronDown, ChevronUp, Circle, Copy, Download, Eraser, FileAudio, Grip, Headphones, Magnet, Mic, Mic2, Minus, MousePointer2, Pencil, Play, PlayCircle, Plus, Scissors, Search, Settings, Settings2, SkipBack, SlidersHorizontal, Square, SquareMenu, Trash2, Upload, Volume2, VolumeX, X } from 'lucide-react';


import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useMIDI } from '../hooks/useMIDI';
import { useMetronome } from '../hooks/useMetronome';
import { useAudioDevices } from "../hooks/useAudioDevices";
import { useLanguage } from '../contexts/LanguageContext';

import { WaveformDisplay } from './WaveformDisplay';
import { PianoRoll } from './PianoRoll';
import AudioClipEditor from './AudioClipEditor';
import { InteractiveAudioClip } from './InteractiveAudioClip';
import { detectChordFromMidi } from '../utils/chordDetection';
import { loadSoundfontInstrument, getLoadedInstrument } from '../utils/soundfont';
import { getDictionaryNotes } from '../utils/music';
import { setMasterVolume } from '../utils/audio';
import { detectAudioHitpoints, calculateQuantizedTime } from '../utils/audioQuantization';
import { playChordFrequencies, playSingleNote, playDrumSound, getAudioContext, getPlaybackMasterGain, loadDrumSamples, getPlaybackMasterAnalyser, getRoomReverb, updateMasterFx, initAudioInput, ensureAudioContextReady, detectTrueChannelMode } from '../utils/audio';
import { VUMeter } from './VUMeter';
import { TrackFxModal } from './TrackFxModal';
import { MasterFxModal } from './MasterFxModal';
import { ExportModal } from './ExportModal';
import { StudioSetupModal } from './StudioSetupModal';
import StudioSettingsModal from './StudioSettingsModal';
import { Midi } from '@tonejs/midi';
import { AnimatePresence } from 'motion/react';
import { RootNote, ChordTypeOptions, Track } from '../types';
import { CHORD_GROUPS } from '../data/chords';
import { EXPLORER_CATEGORIES } from '../data/scales';
import { LinusDrumMachine } from './LinusDrumMachine';

import { useInstrument } from '../contexts/InstrumentContext';

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const midiToNote = (midi: number) => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const note = notes[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
};


const defaultEffects = {
  eq: { enabled: false, low: 0, mid: 0, high: 0 },
  compressor: { enabled: false, threshold: -24, ratio: 12 },
  reverb: { enabled: false, mix: 0.3 }
};
const defaultMasterEffects = {
  eq: { 
    enabled: false, 
    lowCut: { enabled: true, freq: 30, q: 0.71 },
    lowShelf: { enabled: true, freq: 100, gain: 0 },
    mid1: { enabled: true, freq: 500, gain: 0, q: 1 },
    mid2: { enabled: true, freq: 2000, gain: 0, q: 1 },
    mid3: { enabled: true, freq: 4000, gain: 0, q: 1 },
    highShelf: { enabled: true, freq: 8000, gain: 0 },
    highCut: { enabled: true, freq: 20000, q: 0.71 }
  },
  glue: { enabled: false, threshold: -10, makeup: 0 },
  limiter: { enabled: false, threshold: -0.5 }
};

const getInitialTracks = () => {
  try {
    const saved = localStorage.getItem('midi_studio_tracks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => {
        if (!t.effects || !t.effects.eq || !t.effects.compressor || !t.effects.reverb) {
          t.effects = JSON.parse(JSON.stringify(defaultEffects));
        }
        // Always reset armed state on load since we don't have the media streams
        t.isArmed = false;
        return t;
      });
    }
  } catch (e) {
    // Ignore
  }
  return [
    { id: '1', name: 'Pista 1', isMuted: false, isSolo: false, events: [], instrument: 'epiano', volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track,
    { id: '2', name: 'Pista 2', isMuted: false, isSolo: false, events: [], instrument: 'piano', volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track,
    { id: '3', name: 'Pista 3', isMuted: false, isSolo: false, events: [], instrument: 'bass', volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track,
    { id: '4', name: 'Pista 4', isMuted: false, isSolo: false, events: [], instrument: 'drum', volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track,
  ];
};

let globalTracksState: any[] = getInitialTracks();
let globalActiveTrackId = '1';


export const getMidiNotes = (events: any[]) => {
  const notes: any[] = [];
  const active: Record<number, any> = {};
  events.forEach(e => {
    if (e.type === 'drum') {
      notes.push({
        id: `${e.note}-${e.timestamp}`,
        note: e.note,
        startTime: e.timestamp,
        duration: e.duration || 100,
        velocity: e.velocity
      });
    } else if (e.type === 'noteOn' && e.velocity > 0) {
      active[e.note] = { startTime: e.timestamp, velocity: e.velocity };
    } else if (e.type === 'noteOff' || (e.type === 'noteOn' && e.velocity === 0)) {
      if (active[e.note]) {
         notes.push({
           id: `${e.note}-${active[e.note].startTime}`,
           note: e.note,
           startTime: active[e.note].startTime,
           duration: e.timestamp - active[e.note].startTime,
           velocity: active[e.note].velocity
         });
         delete active[e.note];
      }
    }
  });
  return notes;
};


interface MidiStudioProps { onBack?: () => void; isVisible?: boolean; }


const TrackVUMeter = ({ trackId, isPlaying, trackAnalyserNodesRef, visualFps = 60 }: { trackId: string, isPlaying: boolean, trackAnalyserNodesRef: React.MutableRefObject<Record<string, AnalyserNode>>, visualFps?: number }) => {
  const [level, setLevel] = useState(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const updateMeter = () => {
      const analyserNode = trackAnalyserNodesRef.current[trackId];
      if (isPlaying && analyserNode) {
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(dataArray);

        // Calcular nivel RMS (0.0 a 1.0)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amplitude = (dataArray[i] - 128) / 128;
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        // Exagerar ligeramente el factor para visibilidad visual óptima (0 a 1)
        setLevel(Math.min(1, rms * 3.5));
      } else {
        setLevel(0);
      }
      if (visualFps < 60) {
        setTimeout(() => {
          requestRef.current = requestAnimationFrame(updateMeter);
        }, 1000 / visualFps);
      } else {
        requestRef.current = requestAnimationFrame(updateMeter);
      }
    };

    requestRef.current = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(requestRef.current);
  }, [trackId, isPlaying, trackAnalyserNodesRef]);

  return (
    <div className="flex items-end gap-[2px] h-3 ml-1 px-0.5 select-none" title="Nivel de Salida VU">
      {/* Barra 1 (Bajo/Presencia) - Celeste Cyan */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 shadow-none ${
          level > 0.05 ? 'h-1.5 bg-cyan-500' : 'h-1 bg-neutral-800'
        }`}
      />
      {/* Barra 2 (Medio) - Celeste Cyan */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 shadow-none ${
          level > 0.25 ? 'h-2 bg-cyan-400' : 'h-1 bg-neutral-800'
        }`}
      />
      {/* Barra 3 (Alto) - Naranjo Marca Linus */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 shadow-none ${
          level > 0.55 ? 'h-2.5 bg-[#EA580B]' : 'h-1 bg-neutral-800'
        }`}
      />
      {/* Barra 4 (Pico / Clip) - Naranjo Intenso */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 shadow-none ${
          level > 0.8 ? 'h-3 bg-[#EA580B]' : 'h-1 bg-neutral-800'
        }`}
      />
    </div>
  );
};

function MidiStudio({ onBack, isVisible = true }: MidiStudioProps = {}) {
  const [tracks, setTracks] = useState<Track[]>(globalTracksState);
  const [selectedTrackId, setSelectedTrackId] = useState(globalActiveTrackId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studioSettings, setStudioSettings] = useState({
    sampleRate: 48000,
    bufferSize: 256,
    isQwertyMidiEnabled: true,
    preRollBars: 1,
    clickVolume: 80,
    autoSaveInterval: '5',
    visualFps: 60
  });
  const [bpm, setBpm] = useState(120);
  const [tempBpmInput, setTempBpmInput] = useState<string>("120");

  const commitBpm = (val: string | number) => {
    const parsed = typeof val === "number" ? val : parseInt(String(val).trim(), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(40, Math.min(300, parsed));
      setBpm(clamped);
      setTempBpmInput(String(clamped));
    } else {
      setTempBpmInput(String(bpm));
    }
  };
  const [playheadTime, setPlayheadTime] = useState(0);
  const [zoom, setZoom] = useState(50);
  const [history, setHistory] = useState<Track[][]>([]);
  const [snapMode, setSnapMode] = useState<'libre' | 'compas' | 'pulso' | '1/16'>('libre');
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'scissors' | 'eraser'>('pointer');
  const [selectedClipIds, setSelectedClipIds] = useState<{trackId: string, clipId: string}[]>([]);
  const [exportRange, setExportRange] = useState({ start: 0, end: 0, active: false });
  const [editingPianoRollTrackId, setEditingPianoRollTrackId] = useState<string | null>(null);
  const [editingAudioClip, setEditingAudioClip] = useState<{trackId: string, clipId: string} | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [fxModalTrackId, setFxModalTrackId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, trackId: string | null } | null>(null);
  const [pluginSelector, setPluginSelector] = useState<{ trackId: string, slotIdx: number } | null>(null);
  const [inspectorTrackId, setInspectorTrackId] = useState<string | null>(null);
  const [selectedDrumPattern, setSelectedDrumPattern] = useState('none');
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [seekVersion, setSeekVersion] = useState(0);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);
  
  const { playCountIn, setVolume: setMetronomeVolume } = useMetronome(120);

  useEffect(() => {
    setMetronomeVolume(studioSettings.clickVolume / 100);
  }, [studioSettings.clickVolume, setMetronomeVolume]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsSequencerPlaying(false);
    } else {
      if (studioSettings.preRollBars > 0) {
        // start count in
        playCountIn(studioSettings.preRollBars, () => {
          setIsRecording(true);
          setIsSequencerPlaying(true);
        });
      } else {
        setIsRecording(true);
        setIsSequencerPlaying(true);
      }
    }
  };

  const [isLooping, setIsLooping] = useState(false);
  const [trackHeight, setTrackHeight] = useState(140);

  useEffect(() => {
    const handleGlobalClick = () => {
       setContextMenu(null);
       setPluginSelector(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastAction();
        return;
      }

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev * 1.25, 200));
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev / 1.25, 2));
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipIds.length > 0) {
           e.preventDefault();
           commitProjectChange(prev => prev.map(t => ({
             ...t,
             audioClips: t.audioClips?.filter(c => !selectedClipIds.some(sc => sc.clipId === c.id))
           })));
           setSelectedClipIds([]);
           return;
        } else if (selectedTrackId) {
           e.preventDefault();
           commitProjectChange(prev => prev.filter(t => t.id !== selectedTrackId));
           setSelectedTrackId('');
           return;
        }
      }
      
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        setIsSequencerPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrackId, selectedClipIds, history, tracks]);

  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number>(0);
  const seekOffsetRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const saveToHistory = () => {
    setHistory((prev) => {
        // Prevent saving duplicate consecutive states
        if (prev.length > 0 && prev[prev.length - 1] === tracks) return prev;
        return [...prev.slice(-15), tracks];
    });
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const previousTracks = history[history.length - 1];
    setTracks(previousTracks);
    globalTracksState = previousTracks;
    applyLiveMixerState(previousTracks);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTrackId('');
    setSelectedClipIds([]);
  };

  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    saveToHistory();
    setTracks(prev => {
      const next = updater(prev);
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  const togglePlayback = () => setIsSequencerPlaying(!isSequencerPlaying);
  const handleDrumStyleSelect = (val: string) => setSelectedDrumPattern(val);
  
  const executeSplit = (trackId: string, clipId: string, splitTimeSec: number) => {
    commitProjectChange(prev => prev.map(tr => {
      if (tr.id !== trackId) return tr;
      const clipToSplit = tr.audioClips?.find(c => c.id === clipId);
      if (!clipToSplit) return tr;
      
      const splitTimeMs = splitTimeSec * 1000;
      if (splitTimeMs <= 0 || splitTimeMs >= clipToSplit.duration) return tr; // invalid split

      const newClip1 = {
        ...clipToSplit,
        duration: splitTimeMs,
        trimEnd: (clipToSplit.trimEnd || 0) + (clipToSplit.duration - splitTimeMs)
      };

      const newClip2 = {
        ...clipToSplit,
        id: crypto.randomUUID(),
        startTime: clipToSplit.startTime + splitTimeMs,
        duration: clipToSplit.duration - splitTimeMs,
        trimStart: (clipToSplit.trimStart || 0) + splitTimeMs,
        name: `${clipToSplit.name} (2)`
      };

      return {
        ...tr,
        audioClips: [...(tr.audioClips?.filter(c => c.id !== clipId) || []), newClip1, newClip2]
      };
    }));
  };

  const openContextMenu = (e: React.MouseEvent, trackId: string | null = null) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, trackId });
  };

  const importExternalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.mid') || file.name.endsWith('.midi')) {
      // For now, skip midi or parse basic if needed. Audio is priority.
      alert("MIDI import is not fully implemented yet.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const arrayBuffer = ev.target?.result as ArrayBuffer;
      const actx = await getAudioContext();
      try {
        const audioBuffer = await actx.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        const newTrack: Track = {
          id: Date.now().toString(),
          name: file.name,
          isMuted: false,
          isSolo: false,
          events: [],
          instrument: 'audio',
          channelMode: audioBuffer.numberOfChannels === 1 ? 'mono' : 'stereo',
          volume: 1.0,
          pan: 0,
          inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)),
          audioClips: [{
             id: 'clip_' + Date.now(),
             startTime: playheadTime > 0 ? playheadTime : 0,
             duration: duration * 1000, // Fixed: duration should be in ms
             buffer: audioBuffer,
             offset: 0,
             gain: 1.0,
             fadeIn: 0,
             fadeOut: 0
          }]
        } as unknown as Track;
        
        commitProjectChange(prev => [...prev, newTrack]);
      } catch (err) {
        console.error("Error decoding audio:", err);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const addMidiTrack = () => {
    commitProjectChange(prev => [...prev, { id: Date.now().toString(), name: 'Pista MIDI', isMuted: false, isSolo: false, events: [], instrument: 'piano', volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track as unknown as unknown as Track]);
  };
  const addAudioTrack = (type: 'mono' | 'stereo') => {
    commitProjectChange(prev => [...prev, { id: Date.now().toString(), name: `Pista Audio ${type}`, isMuted: false, isSolo: false, events: [], instrument: 'audio', channelMode: type, volume: 1.0, pan: 0, inserts: [null, null, null, null, null, null, null, null], effects: JSON.parse(JSON.stringify(defaultEffects)) } as unknown as Track as unknown as unknown as Track]);
  };

  useEffect(() => {
    globalActiveTrackId = selectedTrackId;
  }, [selectedTrackId]);
  
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const trackVolumeNodesRef = useRef<Record<string, GainNode>>({});
  const clipGainNodesRef = useRef<Record<string, GainNode>>({});
  const trackAnalyserNodesRef = useRef<Record<string, AnalyserNode>>({});

  const tracksRef = useRef(tracks);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  const getEffectiveGain = (track: Track, allTracks: Track[]) => {
    if (track.isMuted) return 0;
    const isAnySoloActive = allTracks.some((t) => t.isSolo);
    if (isAnySoloActive && !track.isSolo) {
      return 0;
    }
    return Math.max(0, Math.min(Number(track.volume ?? 1.0), 1.0));
  };



  // Auto-Save feature
  useEffect(() => {
    if (!studioSettings.autoSaveInterval || studioSettings.autoSaveInterval === 'off') return;
    
    const ms = parseInt(studioSettings.autoSaveInterval) * 60 * 1000;
    if (isNaN(ms) || ms <= 0) return;
    
    const timer = setInterval(() => {
      localStorage.setItem('linus_project_autosave', JSON.stringify({ tracks }));
      console.log(`Auto-saved at ${new Date().toLocaleTimeString()}`);
    }, ms);
    
    return () => clearInterval(timer);
  }, [studioSettings.autoSaveInterval, tracks]);

  // QWERTY Virtual MIDI Keyboard
  useEffect(() => {
    if (!studioSettings.isQwertyMidiEnabled) return;
    
    const keyToNote: Record<string, number> = {
      'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64,
      'f': 65, 't': 66, 'g': 67, 'y': 68, 'h': 69,
      'u': 70, 'j': 71, 'k': 72, 'o': 73, 'l': 74, 'p': 75, ';': 76, '\'': 77
    };
    
    const pressedKeys = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key.toLowerCase();
      if (keyToNote[key] && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        if (typeof (window as any).simulateMidiEvent === 'function') {
          (window as any).simulateMidiEvent(9, 0, keyToNote[key], 100);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToNote[key]) {
        pressedKeys.delete(key);
        if (typeof (window as any).simulateMidiEvent === 'function') {
          (window as any).simulateMidiEvent(8, 0, keyToNote[key], 0);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [studioSettings.isQwertyMidiEnabled]);

  const applyLiveMixerState = (updatedTracks: Track[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    updatedTracks.forEach((track) => {
      const gainNode = trackVolumeNodesRef.current[track.id];
      if (gainNode) {
        const targetGain = getEffectiveGain(track, updatedTracks);
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.015);
      }
      
      track.audioClips?.forEach(clip => {
        const clipGainNode = clipGainNodesRef.current[clip.id];
        if (clipGainNode) {
          const safeVolume = Math.max(0, Math.min(clip.gain ?? 1.0, 2.0));
          clipGainNode.gain.cancelScheduledValues(ctx.currentTime);
          clipGainNode.gain.setTargetAtTime(safeVolume, ctx.currentTime, 0.015);
        }
      });
    });
  };

  const toggleMute = (trackId: string) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  const toggleSolo = (trackId: string) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, isSolo: !t.isSolo } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  const handleVolumeChange = (trackId: string, newVolume: number) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, volume: newVolume } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  // Playback Version State to trigger sequencer restart only when non-mixer state changes
  const playbackVersion = useMemo(() => {
     return JSON.stringify(tracks.map(t => ({ 
         id: t.id, 
         clips: t.audioClips?.map(c => ({
             id: c.id,
             startTime: c.startTime,
             duration: c.duration,
             trimStart: c.trimStart,
             trimEnd: c.trimEnd,
             fadeIn: c.fadeIn,
             fadeOut: c.fadeOut
             // Omitting 'gain' to prevent sequencer restart during clip gain drag
         })), 
         inserts: t.inserts, 
         pan: t.pan 
     })));
  }, [tracks]);

  useEffect(() => {
    let ctx: AudioContext;
    let loopCheckerId: number;

    const stopAll = () => {
       activeSourcesRef.current.forEach(s => { try { s.stop(); s.disconnect(); } catch(e){} });
       activeGainNodesRef.current.forEach(g => { try { g.disconnect(); } catch(e){} });
       Object.values(trackVolumeNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
       Object.values(clipGainNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
       activeSourcesRef.current = [];
       activeGainNodesRef.current = [];
       trackVolumeNodesRef.current = {};
       clipGainNodesRef.current = {};
       Object.values(trackAnalyserNodesRef.current).forEach(a => { try { a.disconnect(); } catch(e){} });
       trackAnalyserNodesRef.current = {};
    };

    if (isSequencerPlaying) {
      ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      playbackStartTimeRef.current = performance.now();
      playbackStartOffsetRef.current = seekOffsetRef.current;
      const ctxStartTime = ctx.currentTime;
      const startOffset = playbackStartOffsetRef.current;

      // Start audio clips
      tracksRef.current.forEach(track => {
         
         const trackInputNode = ctx.createGain();
         trackInputNode.channelCount = 2;
         trackInputNode.channelCountMode = 'explicit';
         trackInputNode.channelInterpretation = 'speakers';
         let currentNode: AudioNode = trackInputNode;

         if (track.inserts) {
            track.inserts.forEach((insertPlugin: any) => {
               if (insertPlugin && insertPlugin.active) {
                  let pluginAudioNode: AudioNode | null = null;
                  
                  if (insertPlugin.type === 'eq3') {
                     const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 250;
                     const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000;
                     const high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 4000;
                     low.connect(mid);
                     mid.connect(high);
                     currentNode.connect(low);
                     currentNode = high;
                     activeGainNodesRef.current.push(low as any, mid as any, high as any);
                  } else if (insertPlugin.type === 'compressor') {
                     const comp = ctx.createDynamicsCompressor();
                     pluginAudioNode = comp;
                  } else if (insertPlugin.type === 'reverb') {
                     const delay = ctx.createDelay();
                     delay.delayTime.value = 0.1;
                     pluginAudioNode = delay;
                  } else if (insertPlugin.type === 'saturation') {
                     const waveShaper = ctx.createWaveShaper();
                     const curve = new Float32Array(400);
                     for (let i = 0; i < 400; i++) {
                        const x = (i * 2) / 400 - 1;
                        curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
                     }
                     waveShaper.curve = curve;
                     pluginAudioNode = waveShaper;
                  } else if (insertPlugin.type === 'gate') {
                     const filter = ctx.createBiquadFilter();
                     pluginAudioNode = filter;
                  }

                  if (pluginAudioNode) {
                     currentNode.connect(pluginAudioNode);
                     currentNode = pluginAudioNode;
                     activeGainNodesRef.current.push(pluginAudioNode as any);
                  }
               }
            });
         }

         // Create single track volume node
         const trackVolumeNode = ctx.createGain();
         trackVolumeNode.channelCount = 2;
         trackVolumeNode.channelCountMode = 'explicit';
         trackVolumeNode.channelInterpretation = 'speakers';
         trackVolumeNode.gain.value = getEffectiveGain(track, tracksRef.current);
         
         const trackPannerNode = ctx.createStereoPanner();
         trackPannerNode.pan.value = track.pan ?? 0;
         trackPannerNode.channelCount = 2;
         trackPannerNode.channelCountMode = 'explicit';
         trackPannerNode.channelInterpretation = 'speakers';

         currentNode.connect(trackVolumeNode);
         trackVolumeNode.connect(trackPannerNode);
         trackPannerNode.connect(getPlaybackMasterGain());
         
         const analyserNode = ctx.createAnalyser();
         analyserNode.fftSize = 64;
         analyserNode.smoothingTimeConstant = 0.6;
         trackVolumeNode.connect(analyserNode);
         
         trackVolumeNodesRef.current[track.id] = trackVolumeNode;
         trackAnalyserNodesRef.current[track.id] = analyserNode;
         activeGainNodesRef.current.push(trackInputNode, trackVolumeNode);

         if (track.audioClips) {
            track.audioClips.forEach((clip: any) => {
               if (!clip.buffer) return;
               const clipStartSec = clip.startTime / 1000;
               const clipDuration = clip.duration / 1000;
               const startOffsetSec = startOffset / 1000;
               const timelineOffset = Math.max(0, startOffsetSec - clipStartSec);
               
               if (timelineOffset >= clipDuration) return;

               const source = ctx.createBufferSource();
               source.buffer = ensureStereoBuffer(ctx, clip.buffer);
               source.channelInterpretation = 'speakers';
               
               const gainNode = ctx.createGain();
               gainNode.channelCount = 2;
               gainNode.channelCountMode = 'explicit';
               gainNode.channelInterpretation = 'speakers';
               const baseGain = clip.gain ?? 1.0;
               gainNode.gain.value = baseGain;
               
               clipGainNodesRef.current[clip.id] = gainNode;

               // Calcular tiempos absolutos en el reloj del AudioContext
               const timeToStart = Math.max(0, clipStartSec - startOffsetSec);
               const startPlaybackTime = ctxStartTime + timeToStart;
               const trimOffsetSec = (clip.trimOffset || 0) / 1000;
               const playOffset = Math.max(0, startOffsetSec - clipStartSec) + trimOffsetSec;
               const actualPlayDuration = clipDuration - Math.max(0, startOffsetSec - clipStartSec);
               const endPlaybackTime = startPlaybackTime + actualPlayDuration;

               // Obtener duraciones de fade reales o forzar 5ms Anti-Click (Zero-Crossing Fix)
               const rawFadeIn = (clip.fadeIn || 0) / 1000;
               const rawFadeOut = (clip.fadeOut || 0) / 1000;
               
               // Si empezamos en medio del clip, el fadeIn de UI puede que ya pasó.
               // Para simplificar, aplicamos un micro-fade in en startPlaybackTime si el fade de UI ya pasó.
               const isInsideFadeIn = timelineOffset < rawFadeIn;
               const effectiveFadeIn = isInsideFadeIn ? (rawFadeIn - timelineOffset) : 0;
               const safeFadeIn = effectiveFadeIn > 0.005 ? effectiveFadeIn : 0.005;
               
               // Fade Out
               const isInsideFadeOut = timelineOffset > (clipDuration - rawFadeOut);
               let effectiveFadeOut = rawFadeOut;
               if (isInsideFadeOut) {
                 effectiveFadeOut = clipDuration - timelineOffset; // Lo que quede
               }
               const safeFadeOut = effectiveFadeOut > 0.005 ? effectiveFadeOut : 0.005;

               // Dibujar la automatización de volumen del clip
               gainNode.gain.setValueAtTime(0, startPlaybackTime);
               gainNode.gain.linearRampToValueAtTime(baseGain, startPlaybackTime + safeFadeIn);

               gainNode.gain.setValueAtTime(baseGain, Math.max(startPlaybackTime + safeFadeIn, endPlaybackTime - safeFadeOut));
               gainNode.gain.linearRampToValueAtTime(0, endPlaybackTime);

               // The user requested Explicit Dual-Channel Merger to fix hard-panned recordings
               const splitter = ctx.createChannelSplitter(2);
               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(splitter);
               
               // Force Dual-Mono: take Left channel (0) and send to both L(0) and R(1)
               // This fixes issues where a 2-channel interface records Mic to Left and Silence to Right.
               splitter.connect(merger, 0, 0);
               splitter.connect(merger, 0, 1);
               
               merger.connect(trackInputNode);

               source.start(startPlaybackTime, playOffset, actualPlayDuration);

               activeSourcesRef.current.push(source);
               activeGainNodesRef.current.push(gainNode);
            });
         }
      });

      const loop = (time: number) => {
        let currentPlayhead = playbackStartOffsetRef.current + (time - playbackStartTimeRef.current);
        
        // Loop Engine
        if (isLooping && exportRange.active && exportRange.end && exportRange.end > exportRange.start) {
           if (currentPlayhead >= exportRange.end) {
              currentPlayhead = exportRange.start;
              seekOffsetRef.current = exportRange.start;
              stopAll();
              setIsSequencerPlaying(false);
              setTimeout(() => setIsSequencerPlaying(true), 10);
              return;
           }
        }
        
        if (isVisibleRef.current) {
          setPlayheadTime(currentPlayhead);
        }
        requestRef.current = requestAnimationFrame(loop);
      };
      requestRef.current = requestAnimationFrame(loop);
    } else {
      stopAll();
      cancelAnimationFrame(requestRef.current);
      seekOffsetRef.current = playheadTime;
    }

    return () => {
       stopAll();
       cancelAnimationFrame(requestRef.current);
    };
  }, [isSequencerPlaying, isLooping, playbackVersion, exportRange, seekVersion]);

  // Strict cleanup on component unmount
  useEffect(() => {
    return () => {
      activeSourcesRef.current.forEach(s => { try { s.stop(); s.disconnect(); } catch(e){} });
      activeGainNodesRef.current.forEach(g => { try { g.disconnect(); } catch(e){} });
      Object.values(trackVolumeNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
      Object.values(clipGainNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
      activeSourcesRef.current = [];
      activeGainNodesRef.current = [];
      trackVolumeNodesRef.current = {};
      clipGainNodesRef.current = {};
      Object.values(trackAnalyserNodesRef.current).forEach(a => { try { a.disconnect(); } catch(e){} });
      trackAnalyserNodesRef.current = {};
      const ctx = getAudioContext();
      if (ctx && ctx.state === "running") {
        ctx.suspend().catch(() => {});
      }
    };
  }, []);

  const calculateTotalDuration = () => {
    let max = 0;
    tracks.forEach(t => {
      t.audioClips?.forEach(c => {
        const end = (c.startTime + c.duration) / 1000;
        if (end > max) max = end;
      });
      t.events?.forEach(e => {
        const end = (e.timestamp + (e.duration || 100)) / 1000;
        if (end > max) max = end;
      });
    });
    // Añadir 60 segundos de espacio libre a la derecha
    return Math.max(300, max + 60);
  };
  const totalTimelineDurationSec = calculateTotalDuration();
  const totalMeasures = Math.max(10, Math.ceil(totalTimelineDurationSec / (4 * (60/bpm))));

  const handleZoomToFit = () => {
    // Ancho total de la ventana menos el panel de cabeceras de pista (aprox 256px de w-64)
    const availableWidth = window.innerWidth - 260; 
    if (totalTimelineDurationSec <= 0) return;
    const exactZoom = availableWidth / totalTimelineDurationSec;
    const safeZoom = Math.max(1, Math.min(exactZoom, 200));
    setZoom(safeZoom);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-neutral-950 text-neutral-200 select-none overflow-hidden shadow-none">
      
      {/* 1. Single-Tier Studio Toolbar */}
      <div className="w-full bg-neutral-900 border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between gap-3 text-xs select-none shrink-0 shadow-none">
        
        {/* Grupo Izquierdo: RETORNO + Importar / Exportar + Herramientas */}
        <div className="flex items-center gap-3">
          {/* BOTÓN DE RETORNO A LA APP PRINCIPAL */}
          <button
            onClick={() => onBack ? onBack() : null}
            title="Volver a Rumie Studio Pro"
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-neutral-700 transition font-mono text-[11px] flex items-center gap-1.5 shrink-0 shadow-none"
          >
            <span>←</span> Volver
          </button>

          {/* Separador */}
          <div className="h-4 w-[1px] bg-neutral-800" />

          {/* Botones I/O */}
          <div className="flex items-center gap-1.5 border-r border-neutral-800 pr-3">
            <button onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold transition flex items-center gap-1 border border-neutral-700 shadow-none">
              <span className="font-mono text-lg leading-none mt-[-2px]">+</span> Importar Archivo
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".wav,.mp3,.mid,.midi" onChange={importExternalFile} />
            <button onClick={() => setShowExportModal(true)} className="px-3 py-1 bg-[#EA580B] hover:brightness-110 text-white font-bold rounded shadow-none transition">
              Exportar
            </button>
          </div>

          {/* Herramientas Vectoriales (Puntero, Tijeras, Goma) */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-neutral-400 mr-1 uppercase tracking-widest">Herramientas:</span>
            <button onClick={() => setSelectedTool('pointer')} className={`w-7 h-7 rounded flex items-center justify-center transition-colors shadow-none ${selectedTool === 'pointer' ? 'text-white bg-[#EA580B] border border-[#EA580B]' : 'text-neutral-400 bg-neutral-800 border border-neutral-700 hover:text-neutral-200 hover:bg-neutral-700'}`}>
               <MousePointer2 size={13} strokeWidth={2.5} />
            </button>
            <button onClick={() => setSelectedTool('scissors')} className={`w-7 h-7 rounded flex items-center justify-center transition-colors shadow-none ${selectedTool === 'scissors' ? 'text-white bg-[#EA580B] border border-[#EA580B]' : 'text-neutral-400 bg-neutral-800 border border-neutral-700 hover:text-neutral-200 hover:bg-neutral-700'}`}>
               <Scissors size={13} strokeWidth={2.5} />
            </button>
            <button onClick={() => setSelectedTool('eraser')} className={`w-7 h-7 rounded flex items-center justify-center transition-colors shadow-none ${selectedTool === 'eraser' ? 'text-white bg-[#EA580B] border border-[#EA580B]' : 'text-neutral-400 bg-neutral-800 border border-neutral-700 hover:text-neutral-200 hover:bg-neutral-700'}`}>
               <Eraser size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Selector Imán */}
          <div className="flex items-center gap-1 border-l border-neutral-800 pl-3">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Imán:</span>
            <select 
              value={snapMode}
              onChange={(e) => setSnapMode(e.target.value as any)}
              className="bg-neutral-800 border border-neutral-700 rounded px-2 py-0.5 text-neutral-300 text-[11px] font-semibold focus:outline-none focus:border-[#EA580B] cursor-pointer shadow-none"
            >
              <option value="libre">Libre (Off)</option>
              <option value="compas">Compás</option>
              <option value="pulso">Beat</option>
              <option value="1/16">1/16</option>
            </select>
          </div>
        </div>

        {/* Grupo Derecho: Drum Machine + Zoom */}
        <div className="flex items-center gap-3">
          {/* Selector de Drum Machine */}
          <div className="flex items-center gap-1.5 border-r border-neutral-800 pr-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-300 uppercase">RUMIE DRUM MACHINE</span>
            <select
               value={selectedDrumPattern}
               onChange={(e) => handleDrumStyleSelect(e.target.value)}
               className="bg-neutral-800 border border-neutral-700 rounded px-2 py-0.5 text-neutral-300 font-semibold outline-none text-[11px] cursor-pointer focus:border-[#EA580B] shadow-none"
            >
               <option value="none"> </option>
               <option value="Bolero">Bolero</option>
               <option value="Pop">Pop</option>
               <option value="Cumbia Acústica">Cumbia</option>
               <option value="Bossa Nova Brasil">Bossa</option>
               <option value="Jazz Swing Studio">Jazz</option>
               <option value="Rock Classic">Rock</option>
               <option value="Reggaetón">Reggaetón</option>
            </select>
          </div>

          {/* Botonera de Zoom */}
          <div className="flex items-center gap-2 ml-4 border-l border-neutral-800 pl-4">
            <span className="text-[10px] text-neutral-400 font-mono w-24 tabular-nums tracking-wide">ZOOM: {zoom.toFixed(1)}px/s</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setZoom(p => Math.max(p / 1.25, 2))}
                className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 flex items-center justify-center transition shadow-none"
                title="Alejar (Zoom Out - Tecla G)"
              >
                <Minus size={12} strokeWidth={2.5}/>
              </button>
              <button 
                onClick={() => setZoom(p => Math.min(p * 1.25, 200))}
                className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 flex items-center justify-center transition shadow-none"
                title="Acercar (Zoom In - Tecla H)"
              >
                <Plus size={12} strokeWidth={2.5}/>
              </button>
              <button 
                onClick={handleZoomToFit}
                className="px-2 h-6 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-300 hover:text-white hover:bg-neutral-700 transition shadow-none"
                title="Ajustar todo el proyecto a la pantalla"
              >
                TODO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DAW Main Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative border-y border-neutral-800 bg-neutral-950 shadow-none">
        
        {/* Track Headers */}
        <div className="w-[280px] flex-shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col z-20 shadow-none">
          {/* Header for the track list */}
          <div className="h-8 flex items-center px-4 border-b border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">PISTAS</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 relative flex flex-col" onContextMenu={(e) => openContextMenu(e)}>
            {tracks.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTrackId(t.id)}
                style={{ height: trackHeight, flexShrink: 0 }} 
                className={`px-3 py-2 flex flex-col justify-between transition-all select-none cursor-pointer relative group border-b border-neutral-800 shadow-none ${
                  selectedTrackId === t.id
                    ? 'bg-neutral-800/80 border-l-4 border-l-[#EA580B]'
                    : 'bg-neutral-900 border-l-4 border-l-transparent hover:bg-neutral-800/40'
                }`}
                onContextMenu={(e) => { e.stopPropagation(); openContextMenu(e, t.id); }}
              >
                
                {/* 3. Cabeceras de Pista Profesionales */}
                <div className="flex items-center justify-between pl-1">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button onClick={() => setSelectedTrackId(t.id)} className={`w-3.5 h-3.5 rounded-full border-[1.5px] transition-all flex items-center justify-center ${selectedTrackId === t.id ? 'border-[#EA580B]' : 'border-neutral-500 hover:border-neutral-400 bg-transparent'}`}>
                       {selectedTrackId === t.id && <div className="w-1.5 h-1.5 bg-[#EA580B] rounded-full" />}
                    </button>
                    <div className="text-sm font-medium text-neutral-200 truncate pr-2">{t.name || 'Pista de Audio'}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-1.5 py-[1px] text-neutral-400 border border-neutral-700 bg-neutral-800 font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                      {t.channelMode === 'mono' ? 'MONO' : 'STEREO'}
                    </span>
                    {/* Controles de Consola: MUTE / SOLO */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* BOTÓN MUTE (M) - Rojo Plano */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono transition border flex items-center justify-center select-none shadow-none ${
                          t.isMuted
                            ? 'bg-red-600 text-white font-bold border-red-500'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-700 hover:border-neutral-600'
                        }`}
                        title="Silenciar pista (Mute)"
                      >
                        M
                      </button>

                      {/* BOTÓN SOLO (S) - Amarillo Plano */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolo(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono transition border flex items-center justify-center select-none shadow-none ${
                          t.isSolo
                            ? 'bg-yellow-600 text-white font-bold border-yellow-500'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-700 hover:border-neutral-600'
                        }`}
                        title="Escuchar solo esta pista (Solo)"
                      >
                        S
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Fila Inferior - Cabecera Limpia Cubase */}
                <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-neutral-800 text-[11px]">
                  {/* Grupo Izquierdo: Grabar, Monitorear y Botón [ e ] */}
                  <div className="flex items-center gap-1">
                    {/* Botón Redondo de Grabación (Record Arm) */}
                    <button
                      onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isArmed: !tr.isArmed } : tr))}
                      title="Armar Grabación"
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150 border shadow-none ${
                        t.isArmed 
                          ? 'bg-red-600 border-red-500 text-white font-bold' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-[10px] leading-none">●</span>
                    </button>

                    {/* Botón Monitoreo */}
                    <button className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 rounded border border-neutral-700 text-[10px] transition-all shadow-none" title="Monitoreo">
                      <Headphones size={12} />
                    </button>

                    {/* Botón de Inserts con Sigla Propia ([ INS ]) */}
                    <button
                      onClick={() => setInspectorTrackId(t.id)}
                      title="Rack de Insertos y Plugins"
                      className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-mono font-bold text-[10px] rounded border border-neutral-700 shadow-none transition tracking-wider"
                    >
                      INS
                    </button>
                  </div>

                  {/* Grupo Derecho: Fader de Volumen Ámbar */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="range" 
                      min="0" 
                      max="1.0" 
                      step="0.01" 
                      value={t.volume ?? 1.0}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleVolumeChange(t.id, parseFloat(e.target.value));
                      }}
                      className="w-16 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EA580B] [&::-webkit-slider-thumb]:bg-[#EA580B] [&::-moz-range-thumb]:bg-[#EA580B] focus:outline-none shadow-none" 
                    />
                    <TrackVUMeter isPlaying={isSequencerPlaying} trackId={t.id} trackAnalyserNodesRef={trackAnalyserNodesRef} visualFps={studioSettings.visualFps} />
                  </div>
                </div>
              </div>
            ))}
            {/* Espacio inferior vacío para hacer clic derecho con comodidad */}
            <div 
              onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); openContextMenu(e); }}
              className="flex-1 min-h-[120px] bg-neutral-950/20 hover:bg-neutral-950/40 transition cursor-context-menu"
            />
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-neutral-950 shadow-none" ref={timelineScrollRef}>
           <div className="relative flex flex-col shrink-0 min-w-max h-full" style={{ width: `${totalTimelineDurationSec * zoom}px`, minWidth: `${totalTimelineDurationSec * zoom}px` }}>
              {/* Timeline Ruler */}
              <div className="h-8 w-full shrink-0 sticky top-0 bg-neutral-900 border-b border-neutral-800 z-30 flex items-end overflow-hidden cursor-ew-resize shadow-none" style={{ minWidth: `${totalTimelineDurationSec * zoom}px` }} 
                   onMouseDown={(e) => {
                     const rulerElement = e.currentTarget;
                     
                     if (e.shiftKey) {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                       const time = (x / zoom) * 1000;
                       setExportRange({ start: time, end: time + 2000, active: true });
                       return;
                     }

                     const updatePosition = (clientX: number) => {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                       const time = (x / zoom) * 1000;
                       
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                       
                       // Sincronizar el bucle de animación para evitar rubber-banding
                       playbackStartOffsetRef.current = time;
                       playbackStartTimeRef.current = performance.now();
                     };

                     updatePosition(e.clientX);

                     const handleMouseMove = (moveEvent: MouseEvent) => {
                       updatePosition(moveEvent.clientX);
                     };

                     const handleMouseUp = () => {
                       window.removeEventListener('mousemove', handleMouseMove);
                       window.removeEventListener('mouseup', handleMouseUp);
                       // Si está reproduciendo, reiniciar para saltar (Timeline Seek)
                       if (isSequencerPlaying) {
                         setSeekVersion(v => v + 1);
                       }
                     };

                     window.addEventListener('mousemove', handleMouseMove);
                     window.addEventListener('mouseup', handleMouseUp);
                   }}
              >
                 {/* Numbers */}
                 <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {Array.from({length: Math.ceil(totalMeasures / (zoom < 15 ? 4 : zoom < 30 ? 2 : 1))}).map((_, i) => {
                      const tickStep = zoom < 15 ? 4 : zoom < 30 ? 2 : 1;
                      const measureIdx = i * tickStep;
                      return (
                        <div key={measureIdx} className="absolute bottom-0 text-[10px] font-bold text-neutral-400 pl-2 border-l border-neutral-800 h-3" style={{ left: `${(measureIdx * 4 * (60/bpm)) * zoom}px` }}>
                          <span className="select-none tabular-nums">{measureIdx + 1}</span>
                        </div>
                      );
                    })}
                 </div>
                 {/* Export Range / Loop Region */}
                 {exportRange.active && (
                    <div className="absolute top-0 bottom-0 bg-[#EA580B]/20 border-l border-r border-[#EA580B]" style={{ left: `${(exportRange.start / 1000) * zoom}px`, width: `${((exportRange.end || exportRange.start) - exportRange.start) / 1000 * zoom}px` }}>
                       <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-[#EA580B] text-white text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b shadow-none"
                            onMouseDown={(e) => {
                               e.stopPropagation();
                               const move = (e2: MouseEvent) => {
                                  if (timelineScrollRef.current) {
                                     const rect = timelineScrollRef.current.getBoundingClientRect();
                                     const offsetX = e2.clientX - rect.left + timelineScrollRef.current.scrollLeft;
                                     const time = Math.max(0, (offsetX / zoom) * 1000);
                                     setExportRange(prev => ({ ...prev, start: Math.min(time, prev.end || 0) }));
                                  }
                               };
                               const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                               window.addEventListener('mousemove', move);
                               window.addEventListener('mouseup', up);
                            }}
                       >L</div>
                       <div className="absolute top-0 right-0 translate-x-1/2 w-4 h-4 bg-[#EA580B] text-white text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b shadow-none"
                            onMouseDown={(e) => {
                               e.stopPropagation();
                               const move = (e2: MouseEvent) => {
                                  if (timelineScrollRef.current) {
                                     const rect = timelineScrollRef.current.getBoundingClientRect();
                                     const offsetX = e2.clientX - rect.left + timelineScrollRef.current.scrollLeft;
                                     const time = Math.max(exportRange.start, (offsetX / zoom) * 1000);
                                     setExportRange(prev => ({ ...prev, end: time }));
                                  }
                               };
                               const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                               window.addEventListener('mousemove', move);
                               window.addEventListener('mouseup', up);
                            }}
                       >R</div>
                    </div>
                 )}
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, #262626 1px, transparent 1px)`, backgroundSize: `${(60/bpm) * zoom}px 100%`, backgroundPosition: `0 8px` }}></div>
              
              {/* Playhead */}
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1.5px] bg-[#EA580B] border-[#EA580B] z-40 pointer-events-none transition-none shadow-none" style={{ left: `${(playheadTime / 1000) * zoom}px`, willChange: 'left' }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-[#EA580B]" />
              </div>

              {/* Track Rows in Timeline */}
              <div className="pt-0 flex flex-col h-full" onContextMenu={(e) => openContextMenu(e)}>
                {tracks.map(t => (
                  <div key={t.id} style={{ height: trackHeight, flexShrink: 0 }} className="border-b border-neutral-800 relative w-full group shadow-none" onContextMenu={(e) => { e.stopPropagation(); openContextMenu(e, t.id); }}>
                    {/* Horizontal dividing line inside track like in screenshot (optional) */}
                    <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-800/50 pointer-events-none"></div>

                    {/* Audio Clips */}
                    {t.audioClips?.map((clip: any) => (
                      <InteractiveAudioClip
                        key={clip.id}
                        clip={clip}
                        trackId={t.id}
                        zoom={zoom}
                        selectedTool={selectedTool}
                        isSelected={selectedClipIds.some(c => c.clipId === clip.id)}
                        onSelect={(e) => {
                          e.stopPropagation();
                          setSelectedTrackId(t.id);
                          if (selectedTool === 'eraser') {
                            commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.filter((c: any) => c.id !== clip.id) } : tr));
                          } else if (selectedTool === 'pointer') {
                            if (e.shiftKey) {
                              setSelectedClipIds(prev => [...prev, { trackId: t.id, clipId: clip.id }]);
                            } else {
                              setSelectedClipIds([{ trackId: t.id, clipId: clip.id }]);
                            }
                          }
                        }}
                        onCommitChange={(updater) => {
                          commitProjectChange(prev => prev.map(tr => tr.id === t.id ? {
                            ...tr,
                            audioClips: tr.audioClips?.map(c => c.id === clip.id ? updater(c) : c)
                          } : tr));
                        }}
                        onSplit={(trackId, timeSec) => {
                          executeSplit(trackId, clip.id, timeSec);
                        }}
                      />
                    ))}
                    
                    {/* MIDI Events */}
                    {t.events?.map((ev: any, i: number) => (
                      <div 
                        key={i} 
                        className="absolute h-1.5 bg-[#EA580B] rounded-[1px] opacity-80"
                        style={{ left: `${(ev.timestamp / 1000) * zoom}px`, top: `${(1 - (ev.note / 127)) * 100}%`, width: `${(ev.duration / 1000) * zoom}px` }}
                      />
                    ))}
                  </div>
                ))}
                {/* Espacio inferior vacío para hacer clic derecho con comodidad */}
                <div 
                  onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); openContextMenu(e); }}
                  className="flex-1 min-h-[120px] bg-neutral-950/20 hover:bg-neutral-950/40 transition cursor-context-menu"
                />
              </div>
           </div>
        </div>
      </div>

      {/* 5. Barra de Estado / Transporte Inferior */}
      {/* Absolute positioned floating toolbar at the bottom center-ish, extending full width with padding */}
      <div className="bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-4 py-2 flex-shrink-0 z-30 relative overflow-hidden shadow-none">
        
        <div className="flex items-center relative z-10">
          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded font-mono shadow-none min-w-[120px]">
            <span className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Tiempo</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold tracking-wide text-neutral-200 tabular-nums">
                 {Math.floor(playheadTime / 1000 / 60).toString().padStart(2, '0')}:{Math.floor((playheadTime / 1000) % 60).toString().padStart(2, '0')}.{Math.floor((playheadTime % 1000) / 10).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-neutral-400 tabular-nums tracking-wide">/ 04:03</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            seekOffsetRef.current = 0;
            setPlayheadTime(0);
            if (playheadRef.current) playheadRef.current.style.left = '0px';
          }} className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors border border-neutral-700 shadow-none"><SkipBack size={14} fill="currentColor" /></button>
          
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            if (isSequencerPlaying) togglePlayback();
          }} className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors border border-neutral-700 shadow-none"><Square size={12} fill="currentColor" /></button>
          
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border shadow-none ${isLooping ? 'bg-[#EA580B] text-white border-[#EA580B]' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border-neutral-700'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v1a4 4 0 0 1-4 4H3"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M17 1l4 4-4 4"></path></svg>
          </button>
          
          <button onClick={togglePlayback} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-none bg-[#EA580B] text-white hover:brightness-110 active:scale-95 ${isSequencerPlaying ? 'ring-2 ring-white/40 font-bold' : ''}`}>
            <Play size={18} fill="currentColor" className="ml-1" />
          </button>
          
          <button onClick={toggleRecording} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border shadow-none ${isRecording ? 'bg-red-600 text-white border-red-500' : 'bg-neutral-800 text-red-500 hover:bg-neutral-700 border-neutral-700'}`}>
            <Circle size={12} fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Pause icon like thing next to tempo in screenshot */}
          <button className="w-8 h-8 rounded-md flex items-center justify-center bg-neutral-800 text-neutral-400 border border-neutral-700 shadow-none">
             <div className="flex gap-[3px]"><div className="w-1 h-3 bg-current rounded-[1px]"></div><div className="w-1 h-3 bg-current rounded-[1px]"></div></div>
          </button>
          <div className="flex flex-col bg-neutral-950 border border-neutral-800 rounded px-3 py-1 items-center justify-center shadow-none">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wide leading-none mb-0.5">TEMPO</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempBpmInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setTempBpmInput(val);
                }
              }}
              onBlur={() => commitBpm(tempBpmInput)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitBpm(tempBpmInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-9 bg-transparent text-neutral-200 text-xs font-mono font-bold text-center outline-none leading-none tabular-nums tracking-wide [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer"
            />
          </div>
          
          <button onClick={() => setIsSettingsOpen(true)} className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 shadow-none"><Settings size={16} /></button>
          
          <span className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded-md text-xs font-mono tracking-wide font-semibold flex items-center gap-2 shadow-none tabular-nums">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            32-Bit Float / 48 kHz Studio PCM
          </span>
          
          <div className="flex gap-2 ml-2">
             <button className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-md border border-neutral-700 transition-colors shadow-none"><SlidersHorizontal size={14}/></button>
             <button className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-md border border-neutral-700 transition-colors shadow-none"><Trash2 size={14}/></button>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {editingPianoRollTrackId && (
          <PianoRoll 
            track={tracks.find(t => t.id === editingPianoRollTrackId)!}
            maxDuration={16}
            onClose={() => setEditingPianoRollTrackId(null)}
            onSave={(events) => {
               commitProjectChange(prev => prev.map(t => t.id === editingPianoRollTrackId ? { ...t, events } : t));
               setEditingPianoRollTrackId(null);
            }}
          />
        )}
        {editingAudioClip && (
          <AudioClipEditor
            clip={tracks.find(t => t.id === editingAudioClip.trackId)?.audioClips?.find(c => c.id === editingAudioClip.clipId)!}
            onClose={() => setEditingAudioClip(null)}
            onSave={(newClip) => {
               commitProjectChange(prev => prev.map(t => t.id === editingAudioClip.trackId ? {
                  ...t,
                  audioClips: t.audioClips?.map(c => c.id === editingAudioClip.clipId ? newClip : c)
               } : t));
               setEditingAudioClip(null);
            }}
            onSplit={(time) => {}}
          />
        )}
        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)}
            tracks={tracks}
            bpm={bpm}
            masterFx={null}
            exportRange={{ start: 0, end: null, active: false }}
          />
        )}

        {contextMenu && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-none py-1 text-xs font-mono text-neutral-300 select-none divide-y divide-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => { addMidiTrack(); setContextMenu(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 hover:text-white transition flex items-center justify-between"
              >
                <span>+ Agregar Pista</span>
                <span className="text-[10px] text-neutral-500">Ctrl+T</span>
              </button>
            </div>
            {contextMenu.trackId && (
              <div className="py-1">
                <button
                  onClick={() => {
                    commitProjectChange(prev => prev.filter(t => t.id !== contextMenu.trackId));
                    if (selectedTrackId === contextMenu.trackId) setSelectedTrackId('');
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-950/80 text-red-400 hover:text-red-300 transition flex items-center justify-between"
                >
                  <span>Eliminar Pista</span>
                  <span className="text-[10px] text-red-500 font-bold">SUPR</span>
                </button>
              </div>
            )}
          </div>
        )}

        {pluginSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-none" onClick={() => setPluginSelector(null)}>
             <div className="bg-neutral-900 border border-neutral-800 shadow-none rounded-xl w-[300px] overflow-hidden text-neutral-200" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b border-neutral-800 bg-neutral-900 font-bold text-sm text-neutral-100">
                   Seleccionar Efecto
                </div>
                <div className="p-2 max-h-[300px] overflow-y-auto">
                   {[
                     { type: 'eq3', name: 'EQ 3-Band Studio' },
                     { type: 'compressor', name: 'Compressor Pro' },
                     { type: 'reverb', name: 'Reverb Room / Hall' },
                     { type: 'saturation', name: 'Tube Saturation / Drive' },
                     { type: 'gate', name: 'Noise Gate / Chorus' }
                   ].map(plugin => (
                      <button 
                         key={plugin.type}
                         onClick={() => {
                            commitProjectChange(prev => prev.map(t => {
                               if (t.id === pluginSelector.trackId) {
                                  const newInserts = [...(t.inserts || [null, null, null, null, null, null, null, null])];
                                  newInserts[pluginSelector.slotIdx] = { id: Date.now().toString(), name: plugin.name, type: plugin.type, active: true, params: {} };
                                  return { ...t, inserts: newInserts };
                               }
                               return t;
                            }));
                            setPluginSelector(null);
                         }}
                         className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded mb-1 text-sm transition-colors"
                      >
                         {plugin.name}
                      </button>
                   ))}
                   <div className="my-1 border-t border-zinc-800"></div>
                   <button 
                      onClick={() => {
                         commitProjectChange(prev => prev.map(t => {
                            if (t.id === pluginSelector.trackId) {
                               const newInserts = [...(t.inserts || [null, null, null, null, null, null, null, null])];
                               newInserts[pluginSelector.slotIdx] = null;
                               return { ...t, inserts: newInserts };
                            }
                            return t;
                         }));
                         setPluginSelector(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded text-sm transition-colors text-zinc-400 italic"
                   >
                      &lt; Ninguno &gt;
                   </button>
                </div>
             </div>
          </div>
        )}

        {inspectorTrackId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]" onClick={() => setInspectorTrackId(null)}>
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 text-zinc-200 flex flex-col gap-3 relative max-h-[85vh] overflow-y-auto"
            >
              {/* Cabecera del Modal con Botón Cerrar */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580B] shrink-0"></span>
                  <h3 className="font-bold text-sm tracking-wide text-white truncate">
                    {tracks.find(t => t.id === inspectorTrackId)?.name} - INSERTS
                  </h3>
                </div>
                {/* BOTÓN CERRAR OBLIGATORIO */}
                <button
                  onClick={() => setInspectorTrackId(null)}
                  className="w-6 h-6 rounded-md bg-zinc-800/80 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700/60 flex items-center justify-center text-xs transition shrink-0"
                  title="Cerrar panel"
                >
                  ✕
                </button>
              </div>

             <div className="flex flex-col gap-1 bg-zinc-950 p-2 rounded border border-zinc-800">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex justify-between">
                   <span>Routing: Pre-Fader</span>
                   <span>8 Slots</span>
                </div>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((slotIndex) => {
                   const t = tracks.find(tr => tr.id === inspectorTrackId);
                   const activePlugin = t?.inserts?.[slotIndex];
                   return (
                      <div
                         key={slotIndex}
                         onClick={() => setPluginSelector({ trackId: inspectorTrackId, slotIdx: slotIndex })}
                         className={`h-7 px-2 rounded flex items-center justify-between text-xs font-mono cursor-pointer transition border ${
                            activePlugin 
                               ? 'bg-zinc-800/90 border-amber-500/50 text-amber-300 font-semibold shadow-sm' 
                               : 'bg-[#18181b] border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                         }`}
                      >
                         <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] text-zinc-600">{slotIndex + 1}</span>
                            <span className="truncate">{activePlugin ? activePlugin.name : ''}</span>
                         </div>
                         {activePlugin && (
                            <span className="text-[9px] px-1 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded">
                               ON
                            </span>
                         )}
                      </div>
                   );
                })}
             </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <StudioSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={studioSettings}
        onSettingsChange={async (newSettings) => {
          setStudioSettings(newSettings);
          const { setAudioContextOptions } = await import('../utils/audio');
          await setAudioContextOptions(newSettings.sampleRate);
        }}
      />
    </div>
  );
}

export default MidiStudio;
