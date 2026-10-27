import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import { useLanguage } from '../contexts/LanguageContext';
import { useGlobalMidi } from '../contexts/GlobalMidiContext';
import { liveMidiController } from '../utils/liveMidiController';
import { getAudioContext, getPlaybackMasterGain, stopAllPlayback } from '../utils/audio';
import { interactiveAnalysisAudio } from '../utils/interactiveAnalysisAudio';
import {
  Activity,
  Radio,
  Sparkles,
  Loader2,
  Piano,
  Zap,
  Music,
  Wind,
  Volume2,
  VolumeX,
  Waves,
  Play,
  Square,
  Circle,
  Download,
  SlidersHorizontal,
  Drum,
  Plus,
  Minus,
  Clock,
  Keyboard
} from 'lucide-react';
import { DrumStyle, getStyleBaseGainMultiplier } from '../utils/interactiveRhythmPatterns';
import { MidiTracksSequencer, MidiTrackRouter } from './MidiTracksSequencer';
import {
  BankInstrumentKey,
  ensureAudioContextStarted,
  MELODIC_ANCHORS
} from '../utils/instrumentBanks';

/**
 * Convierte un AudioBuffer de Web Audio API a un Blob de archivo WAV (PCM 16-bit RIFF/WAVE)
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM sin comprimir
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // Cabecera RIFF
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');

  // Sub-chunk fmt
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Tamaño del sub-chunk fmt (16 para PCM)
  view.setUint16(20, format, true); // Formato de audio (1 = PCM)
  view.setUint16(22, numChannels, true); // Canales
  view.setUint32(24, sampleRate, true); // Frecuencia de muestreo
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitDepth, true); // Bits por muestra (16 bits)

  // Sub-chunk data
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Escribir muestras intercaladas (Interleaved 16-bit PCM)
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

interface GlobalMidiKeyboardProps {
  /**
   * Nota MIDI inicial. 36 = C2, 48 = C3, etc.
   * Con 61 teclas desde 36 (C2) a 96 (C7), o 49 teclas desde 36 a 84.
   * 61 teclas (C2 - C7, 5 octavas completas) cubre todo el rango para directo y controladores como Oxygen.
   */
  startNote?: number;
  numKeys?: number;
  className?: string;
  /** Función de parada global (Mixer / Secuenciador maestro) */
  onStopSequence?: () => void;
  /** Función de apertura global para el Mixer */
  onOpenMixer?: () => void;
  /** Estilo musical activo (sincronizado con selector superior y base rítmica) */
  currentStyle?: DrumStyle | string;
  /** Callback para notificar cambios de estilo musical */
  onStyleChange?: (style: DrumStyle) => void;
  /** Tempo BPM global */
  bpm?: number;
  /** Callback para notificar cambios de BPM */
  onBpmChange?: (bpm: number) => void;
  /** Métrica global (ej: 4/4, 3/4) */
  timeSignature?: string;
  /** Callback para notificar cambios de Métrica */
  onTimeSignatureChange?: (sig: string) => void;
  /** Secuencia de acordes del acompañamiento de LINUS */
  playbackSequence?: any[];
  /** Canción o progresión activa con sus compases */
  currentSong?: any;
  /** Semitonos de transposición activa */
  transposition?: number;
  /** Tonalidad activa transpuesta */
  globalKey?: string;
  /** Visibilidad de la sección para optimización de navegación */
  isVisible?: boolean;
  /** Callback para sincronizar el estado de las pistas del DAW con el proyecto (.linus) */
  onTracksChange?: (tracks: any[]) => void;
}

export type LiveInstrumentKey = BankInstrumentKey;

export interface LiveInstrumentDef {
  id: LiveInstrumentKey;
  name: string;
  nameEs: string;
  soundfont: string; // Nombre del banco
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const LIVE_INSTRUMENTS: Record<LiveInstrumentKey, LiveInstrumentDef> = {
  piano: {
    id: 'piano',
    name: 'Piano',
    nameEs: 'Piano Acústico',
    soundfont: 'acoustic_grand_piano',
    icon: Piano,
  },
  rhodes: {
    id: 'rhodes',
    name: 'Rhodes',
    nameEs: 'Piano Rhodes',
    soundfont: 'electric_piano_1',
    icon: Zap,
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    nameEs: 'Violín Acústico',
    soundfont: 'violin',
    icon: Music,
  },
  sax: {
    id: 'sax',
    name: 'Saxophone',
    nameEs: 'Saxofón Alto',
    soundfont: 'alto_sax',
    icon: Wind,
  },
  bass: {
    id: 'bass',
    name: 'Bass',
    nameEs: 'Bajo Acústico',
    soundfont: 'acoustic_bass',
    icon: Music,
  },
  drums: {
    id: 'drums',
    name: 'Drums',
    nameEs: 'Batería Real',
    soundfont: 'drums',
    icon: Drum,
  },
  synth: {
    id: 'synth',
    name: 'Synth Lead',
    nameEs: 'Sintetizador Lead',
    soundfont: 'lead_1_square',
    icon: Sparkles,
  },
};

import {
  type LiveMidiBankOption,
  LIVE_MIDI_CATEGORIES,
  LIVE_MIDI_ANCHORS,
  calculateMusicalVelocity,
  LIVE_MIDI_BANKS
} from '../utils/liveMidiBanks';

export {
  type LiveMidiBankOption,
  LIVE_MIDI_CATEGORIES,
  LIVE_MIDI_ANCHORS,
  calculateMusicalVelocity,
  LIVE_MIDI_BANKS
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface VirtualPianoKeyboardProps {
  keyPairs: Array<{ whiteMidi: number; blackMidi: number | null }>;
  activeNotesSet: Set<number>;
  onNoteOn: (midi: number, vel: number) => void;
  onNoteOff: (midi: number) => void;
}

function areVirtualPianoPropsEqual(
  prevProps: VirtualPianoKeyboardProps,
  nextProps: VirtualPianoKeyboardProps
) {
  if (prevProps.keyPairs !== nextProps.keyPairs) return false;
  if (prevProps.activeNotesSet.size !== nextProps.activeNotesSet.size) return false;
  for (const note of prevProps.activeNotesSet) {
    if (!nextProps.activeNotesSet.has(note)) return false;
  }
  return true;
}

const VirtualPianoKeyboard = React.memo<VirtualPianoKeyboardProps>(({
  keyPairs,
  activeNotesSet,
  onNoteOn,
  onNoteOff
}) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-1">
      <div className="flex relative min-w-[720px] w-full h-[200px] sm:h-[210px] bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 shadow-inner">
        {keyPairs.map(({ whiteMidi, blackMidi }) => {
          const isWhiteActive = activeNotesSet.has(whiteMidi);
          const isBlackActive = blackMidi !== null && activeNotesSet.has(blackMidi);
          const whiteNoteName = NOTE_NAMES[whiteMidi % 12];
          const isC = whiteMidi % 12 === 0;
          const octaveNumber = Math.floor(whiteMidi / 12) - 1;

          return (
            <div key={whiteMidi} className="relative flex-1 h-full flex">
              {/* Tecla Blanca */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onNoteOn(whiteMidi, 100);
                }}
                onMouseUp={() => onNoteOff(whiteMidi)}
                onMouseLeave={() => {
                  if (isWhiteActive) onNoteOff(whiteMidi);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onNoteOn(whiteMidi, 100);
                }}
                onTouchEnd={() => onNoteOff(whiteMidi)}
                className={`relative flex-1 h-full border-r border-b-2 border-l border-neutral-300/80 rounded-b-[4px] flex flex-col justify-end items-center pb-2.5 transition-colors duration-75 cursor-pointer outline-none shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12)] ${
                  isWhiteActive
                    ? 'bg-[#EA580B] text-white font-bold shadow-[0_0_14px_rgba(234,88,11,0.5)] border-[#c2410c] z-10'
                    : 'bg-gradient-to-b from-neutral-200 via-neutral-100 to-white hover:from-neutral-100 hover:to-white text-neutral-700'
                }`}
              >
                {/* Etiqueta C de octava o nota activa */}
                {isWhiteActive ? (
                  <span className="text-[10px] font-mono font-bold leading-none pointer-events-none text-white tracking-wider">
                    {whiteNoteName}
                  </span>
                ) : isC ? (
                  <span className="text-[9px] font-mono text-neutral-400 font-bold leading-none opacity-90 pointer-events-none tracking-tight">
                    C{octaveNumber}
                  </span>
                ) : null}
              </button>

              {/* Tecla Negra (posicionada absolutamente respecto a la unión, 62% de altura) */}
              {blackMidi !== null && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNoteOn(blackMidi, 100);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    onNoteOff(blackMidi);
                  }}
                  onMouseLeave={() => {
                    if (isBlackActive) onNoteOff(blackMidi);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNoteOn(blackMidi, 100);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    onNoteOff(blackMidi);
                  }}
                  className={`absolute top-0 -right-[32%] w-[64%] h-[62%] z-20 rounded-b-[3px] border-x border-b-2 border-neutral-950 flex flex-col justify-end items-center pb-2 transition-colors duration-75 shadow-[0_4px_6px_rgba(0,0,0,0.7)] cursor-pointer outline-none ${
                    isBlackActive
                      ? 'bg-[#EA580B] text-white font-bold shadow-[0_0_14px_rgba(234,88,11,0.6)] border-[#c2410c]'
                      : 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 hover:from-neutral-700 hover:to-neutral-900'
                  }`}
                >
                  {isBlackActive && (
                    <span className="text-[9px] font-mono font-bold text-white leading-none pointer-events-none tracking-wider">
                      {NOTE_NAMES[blackMidi % 12]}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}, areVirtualPianoPropsEqual);

// Caché en memoria persistente a nivel de módulo para que los bancos no se descarguen ni destruyan entre cambios de vista
const globalLiveBankCache = new Map<string, Tone.Sampler>();

export default function GlobalMidiKeyboard({
  startNote = 36, // C2
  numKeys = 61,   // 61 teclas: C2 a C7 (5 octavas completas)
  className = "",
  onStopSequence,
  onOpenMixer,
  currentStyle,
  onStyleChange,
  bpm: propBpm,
  onBpmChange,
  timeSignature: propTimeSignature,
  onTimeSignatureChange,
  playbackSequence,
  currentSong,
  transposition = 0,
  globalKey = 'C',
  isVisible = true,
  onTracksChange
}: GlobalMidiKeyboardProps) {
  const { language } = useLanguage();
  const { midiInputs } = useGlobalMidi();
  const sequencerRouterRef = useRef<MidiTrackRouter | null>(null);
  const [armedTrackInfo, setArmedTrackInfo] = useState<{ name: string; instrument: string; bankId: string } | null>(null);

  const handleRegisterRouter = useCallback((router: MidiTrackRouter | null) => {
    sequencerRouterRef.current = router;
  }, []);

  const handleArmedTrackChange = useCallback((info: { name: string; instrument: string; bankId: string } | null) => {
    setArmedTrackInfo((prev) => {
      if (!prev && !info) return prev;
      if (prev && info && prev.name === info.name && prev.instrument === info.instrument && prev.bankId === info.bankId) {
        return prev;
      }
      return info;
    });
  }, []);

  // Estados visuales y MIDI
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [velocity, setVelocity] = useState<number>(0);

  // Estados y Refs del Banco de Sonido Exclusivo para LIVE MIDI INPUT
  const [selectedBank, setSelectedBank] = useState<string>(''); // Inicialmente "Sin instrumento" (cadena vacía)
  const [isBankLoading, setIsBankLoading] = useState<boolean>(false);
  const liveSamplerRef = useRef<Tone.Sampler | null>(null);
  const selectedBankRef = useRef<string>('');
  const bankLoadTokenRef = useRef<number>(0);

  useEffect(() => {
    selectedBankRef.current = selectedBank;
  }, [selectedBank]);


  // Estados de Acceso Rápido sincronizados bidireccionalmente con liveMidiController (Mixer)
  const [quickVolume, setQuickVolume] = useState(() => liveMidiController.getVolume());
  const [quickReverb, setQuickReverb] = useState(() => liveMidiController.getReverbWet());
  const [isMuted, setIsMuted] = useState(() => liveMidiController.getIsMuted());

  // Estados de Transporte Rápido y Grabación Maestra (Tone.Recorder)
  const [isPlayingState, setIsPlayingState] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [isConvertingWav, setIsConvertingWav] = useState<boolean>(false);

  // Derivación directa de estilo y métrica sin useState local aislado
  const activeStyle: DrumStyle = (currentStyle as DrumStyle) || 'Jazz Swing';
  const activeTimeSignature: string = propTimeSignature || '4/4';

  // Estado local para el input de texto de BPM (permite escritura libre, backspace y string temporal vacío)
  const [bpmInput, setBpmInput] = useState<string>(() => {
    if (typeof propBpm === 'number' && !isNaN(propBpm)) return String(propBpm);
    try {
      const tBpm = Math.round(Tone.Transport.bpm.value);
      if (tBpm >= 40 && tBpm <= 240) return String(tBpm);
    } catch (e) {}
    return "120";
  });
  const lastCommittedBpmRef = useRef<number>(typeof propBpm === 'number' ? propBpm : 120);
  const stepDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stepDebounceTimerRef.current) {
        clearTimeout(stepDebounceTimerRef.current);
      }
    };
  }, []);

  // Sincronizar bpmInput si propBpm cambia externamente desde el componente padre
  useEffect(() => {
    if (typeof propBpm === 'number' && !isNaN(propBpm)) {
      lastCommittedBpmRef.current = propBpm;
      setBpmInput(String(propBpm));
    }
  }, [propBpm]);

  const onStyleChangeRef = useRef(onStyleChange);
  useEffect(() => { onStyleChangeRef.current = onStyleChange; }, [onStyleChange]);

  const onTimeSignatureChangeRef = useRef(onTimeSignatureChange);
  useEffect(() => { onTimeSignatureChangeRef.current = onTimeSignatureChange; }, [onTimeSignatureChange]);

  const activeStyleRef = useRef(activeStyle);
  useEffect(() => { activeStyleRef.current = activeStyle; }, [activeStyle]);

  const activeTimeSignatureRef = useRef(activeTimeSignature);
  useEffect(() => { activeTimeSignatureRef.current = activeTimeSignature; }, [activeTimeSignature]);

  // Sincronizar si el selector superior de Metronome dispara cambio de BPM o eventos globales
  useEffect(() => {
    const handleGlobalBpmChanged = (e: any) => {
      if (typeof e.detail === 'number' && !isNaN(e.detail)) {
        lastCommittedBpmRef.current = e.detail;
        setBpmInput((prev) => {
          const current = parseInt(prev, 10);
          return current !== e.detail ? String(e.detail) : prev;
        });
      }
    };
    const handleGlobalDrumStyleChanged = (e: any) => {
      if (e.detail && typeof onStyleChangeRef.current === 'function' && e.detail !== activeStyleRef.current) {
        onStyleChangeRef.current(e.detail);
      }
    };
    const handleGlobalSigChanged = (e: any) => {
      if (e.detail && typeof onTimeSignatureChangeRef.current === 'function' && e.detail !== activeTimeSignatureRef.current) {
        onTimeSignatureChangeRef.current(e.detail);
      }
    };

    window.addEventListener('bpm-changed', handleGlobalBpmChanged);
    window.addEventListener('drum-style-changed', handleGlobalDrumStyleChanged);
    window.addEventListener('time-signature-changed', handleGlobalSigChanged);
    return () => {
      window.removeEventListener('bpm-changed', handleGlobalBpmChanged);
      window.removeEventListener('drum-style-changed', handleGlobalDrumStyleChanged);
      window.removeEventListener('time-signature-changed', handleGlobalSigChanged);
    };
  }, []);

  // Manejador centralizado y validado de BPM al salir del foco (onBlur) o presionar Enter
  const commitBpm = useCallback((valStr: string) => {
    let parsed = parseInt(valStr.trim(), 10);
    if (isNaN(parsed) || parsed < 40) {
      parsed = 40;
    } else if (parsed > 240) {
      parsed = 240;
    }

    if (parsed === lastCommittedBpmRef.current) return;
    lastCommittedBpmRef.current = parsed;
    setBpmInput(String(parsed));

    // 1. Aplicar a Tone.Transport.bpm.value directamente
    try {
      Tone.Transport.bpm.value = parsed;
    } catch (e) {
      console.warn('[Tone.Transport] Error seteando bpm:', e);
    }

    // 2. Notificar callback global por prop si existe
    if (typeof onBpmChange === 'function') {
      onBpmChange(parsed);
    }

    // 3. Emitir eventos globales para Metronome y resto de la aplicación
    window.dispatchEvent(new CustomEvent('change-bpm', { detail: parsed }));
    window.dispatchEvent(new CustomEvent('bpm-changed', { detail: parsed }));
  }, [onBpmChange]);

  // Manejador para botones +/- de BPM con debounce seguro
  const handleStepBpm = useCallback((delta: number) => {
    const current = parseInt(bpmInput, 10) || (typeof propBpm === 'number' ? propBpm : 120);
    const clamped = Math.max(40, Math.min(240, current + delta));
    setBpmInput(String(clamped));

    if (stepDebounceTimerRef.current) {
      clearTimeout(stepDebounceTimerRef.current);
    }
    stepDebounceTimerRef.current = setTimeout(() => {
      commitBpm(String(clamped));
    }, 150);
  }, [bpmInput, propBpm, commitBpm]);

  // Manejador centralizado de cambio de Métrica rápida
  const handleTimeSignatureUpdate = useCallback((newSig: string) => {
    // 1. Notificar callback global por prop si existe
    if (typeof onTimeSignatureChange === 'function') {
      onTimeSignatureChange(newSig);
    }

    // 2. Emitir eventos globales para Metronome y resto de la aplicación
    window.dispatchEvent(new CustomEvent('change-time-signature', { detail: newSig }));
    window.dispatchEvent(new CustomEvent('time-signature-changed', { detail: newSig }));

    // 3. Sincronizar el selector superior de metrónomo si está en el DOM
    const topSigSelector = document.getElementById('metronome-sig-selector') as HTMLSelectElement | null;
    if (topSigSelector && topSigSelector.value !== newSig) {
      topSigSelector.value = newSig;
      topSigSelector.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, [onTimeSignatureChange]);

  // Referencias de audio
  const recorderRef = useRef<Tone.Recorder | null>(null);

  // Nodos de Masterización (Master Bus) interna en Tone.js
  const masterEQRef = useRef<Tone.EQ3 | null>(null);
  const masterCompressorRef = useRef<Tone.Compressor | null>(null);
  const masterLimiterRef = useRef<Tone.Limiter | null>(null);

  // Implementación de Cadena Maestra (Master Bus) interna en Tone.js:
  // - Ecualizador (Tone.EQ3): high: 3 (boost agudos), mid: -1 (limpiar medios), low: 1
  // - Compresor (Tone.Compressor): threshold: -24, ratio: 4, attack: 0.005, release: 0.1
  // - Limitador (Tone.Limiter): threshold: -1.5
  // - Ruteo: Tone.Destination.chain(masterEQ, masterCompressor, masterLimiter)
  // - Cleanup al desmontar: dispose de cada nodo maestro
  useEffect(() => {
    let masterEQ: Tone.EQ3 | null = null;
    let masterCompressor: Tone.Compressor | null = null;
    let masterLimiter: Tone.Limiter | null = null;

    try {
      // 1. Ecualizador (Tone.EQ3) para darle brillo y claridad
      masterEQ = new Tone.EQ3({
        high: 3,
        mid: -1,
        low: 1,
      });

      // 2. Compresor (Tone.Compressor) para "apretar" (glue) la mezcla
      masterCompressor = new Tone.Compressor({
        threshold: -24,
        ratio: 4,
        attack: 0.005,
        release: 0.1,
      });

      // 3. Limitador (Tone.Limiter) para evitar distorsión digital y maximizar volumen
      masterLimiter = new Tone.Limiter({
        threshold: -1.5,
      });

      masterEQRef.current = masterEQ;
      masterCompressorRef.current = masterCompressor;
      masterLimiterRef.current = masterLimiter;

      // Rutear la Cadena Maestra directamente a la salida global
      try {
        Tone.Destination.chain(masterEQ, masterCompressor, masterLimiter);
      } catch (_) {
        Tone.getDestination().chain(masterEQ, masterCompressor, masterLimiter);
      }
    } catch (err) {
      console.warn('[Tone Master Bus] Error inicializando cadena de masterización:', err);
    }

    return () => {
      // Restaurar la cadena maestra de Tone.Destination al desmontar
      try {
        Tone.Destination.chain();
      } catch (_) {
        try {
          Tone.getDestination().chain();
        } catch (__) {}
      }

      // Limpieza y dispose de los nodos maestros
      if (masterEQ) {
        try {
          masterEQ.dispose();
        } catch (_) {}
        masterEQRef.current = null;
      }
      if (masterCompressor) {
        try {
          masterCompressor.dispose();
        } catch (_) {}
        masterCompressorRef.current = null;
      }
      if (masterLimiter) {
        try {
          masterLimiter.dispose();
        } catch (_) {}
        masterLimiterRef.current = null;
      }
    };
  }, []);

  // Inicializar Grabador Maestro conectado a la salida global (Tone.Destination.connect(recorder))
  const getRecorder = useCallback((): Tone.Recorder => {
    if (!recorderRef.current) {
      const rec = new Tone.Recorder();
      // 1. Ruteo al Master Global con Tone.Destination (o Tone.getDestination())
      try {
        Tone.Destination.connect(rec);
      } catch (e) {
        try {
          Tone.getDestination().connect(rec);
        } catch (e2) {
          console.warn('[Tone.Recorder] Error conectando Destination:', e2);
        }
      }

      // Conectar también la pista de fondo del secuenciador y acordes (getPlaybackMasterGain)
      try {
        const masterGain = getPlaybackMasterGain();
        const ac = getAudioContext();
        if (masterGain && rec.input) {
          const toneRawContext = Tone.getContext().rawContext as AudioContext;
          if (toneRawContext === ac) {
            const targetNode = (rec.input as any).input || (rec.input as any);
            masterGain.connect(targetNode);
          } else if (ac && ac.createMediaStreamDestination && toneRawContext && toneRawContext.createMediaStreamSource) {
            const msDest = ac.createMediaStreamDestination();
            masterGain.connect(msDest);
            const msSource = toneRawContext.createMediaStreamSource(msDest.stream);
            const targetNode = (rec.input as any).input || (rec.input as any);
            msSource.connect(targetNode);
          }
        }
      } catch (e) {
        console.warn('[Tone.Recorder] Error enlazando masterGain al grabador:', e);
      }

      // Conectar la pista de creación musical y stems si están activos
      try {
        const iaaDest = interactiveAnalysisAudio.getOrCreateMediaStreamDestination();
        const toneRawContext = Tone.getContext().rawContext as AudioContext;
        if (iaaDest && iaaDest.stream && toneRawContext && toneRawContext.createMediaStreamSource) {
          const msSource = toneRawContext.createMediaStreamSource(iaaDest.stream);
          const targetNode = (rec.input as any).input || (rec.input as any);
          msSource.connect(targetNode);
        }
      } catch (e) {
        console.warn('[Tone.Recorder] Error enlazando interactiveAnalysisAudio al grabador:', e);
      }

      recorderRef.current = rec;
    }
    return recorderRef.current;
  }, []);

  // Pre-inicializar el grabador en Tone.Destination
  useEffect(() => {
    try {
      getRecorder();
    } catch (e) {
      console.warn('[Tone.Recorder] Inicialización diferida:', e);
    }
  }, [getRecorder]);

  // Sincronización continua de estado con la Consola de Mezcla Analógica
  useEffect(() => {
    return liveMidiController.subscribe(() => {
      setQuickVolume(liveMidiController.getVolume());
      setQuickReverb(liveMidiController.getReverbWet());
      setIsMuted(liveMidiController.getIsMuted());
    });
  }, []);

  const lastTransportStartAtRef = useRef<number>(0);

  // Helper para verificar si el secuenciador principal está activo (incluyendo el Count-in de 4 tiempos)
  const isSequencerPlaying = useCallback((): boolean => {
    const btn = document.getElementById("metronome-toggle-btn");
    if (!btn) return false;
    if (btn.getAttribute("data-playing") === "true" || btn.getAttribute("data-counting-in") === "true") {
      return true;
    }
    const txt = (btn.textContent || btn.innerText || "").toLowerCase();
    return txt.includes("stop") || txt.includes("lista");
  }, []);

  // Sincronización de estado con el botón PLAY principal del secuenciador y eventos de transporte
  useEffect(() => {
    const syncTransportState = () => {
      if (Date.now() - lastTransportStartAtRef.current < 1000) {
        return;
      }
      const btn = document.getElementById("metronome-toggle-btn");
      if (btn) {
        const isPlaying = isSequencerPlaying() || Tone.Transport.state === "started";
        setIsPlayingState((prev) => (prev !== isPlaying ? isPlaying : prev));
        if (!isPlaying) {
          setIsRecording(false);
        }
      }
    };

    const handleGlobalStop = () => {
      lastTransportStartAtRef.current = 0;
      setIsPlayingState(false);
      setIsRecording(false);
      setRecNotice(null);
    };

    const handleTransportPosition = (e: any) => {
      const playing = e?.detail?.isPlaying;
      const countingIn = e?.detail?.isCountingIn;
      if (playing === true || countingIn === true) {
        setIsPlayingState(true);
        return;
      }
      if (Date.now() - lastTransportStartAtRef.current < 1000) {
        return;
      }
      if (playing === false) {
        setIsPlayingState(false);
        setIsRecording(false);
      }
    };

    syncTransportState();
    const interval = setInterval(syncTransportState, 150);
    window.addEventListener("global-playback-stop", handleGlobalStop);
    window.addEventListener("master-rec-stop", handleGlobalStop);
    window.addEventListener("linus-transport-position", handleTransportPosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener("global-playback-stop", handleGlobalStop);
      window.removeEventListener("master-rec-stop", handleGlobalStop);
      window.removeEventListener("linus-transport-position", handleTransportPosition);
    };
  }, [isSequencerPlaying]);

  // Activar AudioContext con Tone.start() si aún está suspendido
  const ensureAudioStarted = useCallback(async () => {
    try {
      const ac = getAudioContext();
      if (ac.state === 'suspended') {
        await ac.resume();
      }
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
    } catch (e) {
      console.warn('[LiveMidiAudio] Error iniciando Tone AudioContext:', e);
    }
  }, []);

  // Acciones de Transporte Global (Play / Stop / Rec): Arranque inmediato y síncrono respetando la posición actual
  const togglePlayback = useCallback(() => {
    ensureAudioStarted();
    if (isPlayingState || isSequencerPlaying() || Tone.Transport.state === "started") {
      const stopBtn = document.getElementById("keyboard-transport-stop-btn");
      if (stopBtn) {
        stopBtn.click();
      }
      return;
    }

    lastTransportStartAtRef.current = Date.now();
    setIsPlayingState(true);
    const btn = document.getElementById("metronome-toggle-btn");
    if (btn) {
      if (!isSequencerPlaying()) {
        btn.click();
      }
    } else {
      try {
        const currentSec = Math.max(0, Tone.Transport.seconds || 0);
        Tone.Transport.start(Tone.now(), currentSec);
      } catch (e) {
        console.warn("[Tone.Transport] Error starting transport:", e);
      }
    }
  }, [ensureAudioStarted, isPlayingState, isSequencerPlaying]);

  const handlePlay = togglePlayback;

  // Detener la grabación de Tone.Recorder, decodificar WebM a PCM y convertir a WAV nativo
  const stopAndProcessRecording = useCallback(async () => {
    try {
      const recorder = getRecorder();
      if (recorder) {
        if (recorder.state === "started" || recorder.state === "paused") {
          setIsConvertingWav(true);
          const webmBlob = await recorder.stop();
          if (webmBlob && webmBlob.size > 0) {
            try {
              // Leer Blob con ArrayBuffer y decodificar con Tone.context.decodeAudioData()
              const arrayBuffer = await webmBlob.arrayBuffer();
              const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
              
              // Empaquetar AudioBuffer en formato WAV (PCM 16-bit RIFF/WAVE)
              const wavBlob = audioBufferToWav(audioBuffer);
              const url = URL.createObjectURL(wavBlob);

              // Guardar la URL en el estado local para el botón de exportación
              setWavUrl((prevUrl) => {
                if (prevUrl) {
                  URL.revokeObjectURL(prevUrl);
                }
                return url;
              });
            } catch (convErr) {
              console.error("[WAV Encoder] Error decodificando audio a WAV, usando fallback:", convErr);
              // Si falla la decodificación, preservar el archivo grabado
              const fallbackUrl = URL.createObjectURL(webmBlob);
              setWavUrl(fallbackUrl);
            }
          }
        }
      }
    } catch (err) {
      console.error("[Tone.Recorder] Error al detener grabación:", err);
    } finally {
      setIsConvertingWav(false);
      setIsRecording(false);
    }
  }, [getRecorder]);

  // Manejador para exportar / descargar el archivo WAV grabado
  const handleExportWav = useCallback(() => {
    if (!wavUrl) return;
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = wavUrl;
    anchor.download = "Linus_Live_Session.wav";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [wavUrl]);

  // Estado para advertencia discreta si se presiona REC sin pista armada
  const [recNotice, setRecNotice] = useState<string | null>(null);
  const recNoticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Freno de Mano Global (Stop Real, preservando posición actual salvo Rewind)
  const handleStop = useCallback(() => {
    lastTransportStartAtRef.current = 0;
    const savedSec = Math.max(0, Tone.Transport.seconds || 0);
    // 1. Consolidar cualquier grabación MIDI en curso ANTES de pausar el reloj del transporte
    try {
      window.dispatchEvent(new CustomEvent("master-rec-stop"));
    } catch (e) {
      console.warn('[GlobalMidiKeyboard] Error emitiendo master-rec-stop:', e);
    }

    // 2. Invocación de la función global STOP pasada por props (ej. handleStop / stopSequence del Mixer/Metronome)
    if (typeof onStopSequence === "function") {
      try {
        onStopSequence();
      } catch (e) {
        console.warn('[GlobalMidiKeyboard] Error en onStopSequence prop:', e);
      }
    }

    // 3. Disparar evento global de detención para asegurar que Metronome y todos los transportes se enteren
    try {
      window.dispatchEvent(new CustomEvent("global-playback-stop"));
    } catch (e) {
      console.warn('[GlobalMidiKeyboard] Error emitiendo global-playback-stop:', e);
    }

    // 4. Pausar Tone.Transport y limpiar cola de eventos preservando la posición actual
    try {
      Tone.Transport.pause();
      Tone.Transport.cancel(0);
      Tone.Transport.seconds = savedSec;
    } catch (e) {
      console.warn('[Tone.Transport] Error stopping transport:', e);
    }

    // 5. Detener motores de audio secundarios (acordes y stems interactivos)
    try {
      stopAllPlayback();
    } catch (e) {
      console.warn('[Audio] Error in stopAllPlayback:', e);
    }

    try {
      interactiveAnalysisAudio.stopAll();
    } catch (e) {
      console.warn('[InteractiveAnalysisAudio] Error in stopAll:', e);
    }

    // 6. Actualizar el estado global de reproducción y grabación a inactivo
    setIsPlayingState(false);
    setIsRecording(false);
    setRecNotice(null);

    // NOTA ARQUITECTÓNICA:
    // El motor WAV existente (Tone.Recorder, stopAndProcessRecording, audioBufferToWav)
    // queda completamente desacoplado del flujo de Master REC / STOP y se preserva
    // intacto para su futura función dedicada de "EXPORTAR AUDIO / WAV".
  }, [onStopSequence, isSequencerPlaying]);

  const handleRecord = useCallback(() => {
    try {
      // Si ya está grabando, clic en Rec actúa como toggle de stop
      if (isRecording) {
        handleStop();
        return;
      }

      const hasArmed = sequencerRouterRef.current ? sequencerRouterRef.current.hasArmedTrack() : false;
      if (!hasArmed) {
        lastTransportStartAtRef.current = 0;
        const msg = language === 'en' ? 'Enable recording (⏺) or arm a MIDI track to record.' : 'Activa la grabación (⏺) o arma una pista MIDI para grabar.';
        setRecNotice(msg);
        if (recNoticeTimerRef.current) clearTimeout(recNoticeTimerRef.current);
        recNoticeTimerRef.current = setTimeout(() => {
          setRecNotice(null);
        }, 3500);
        return;
      }

      // Limpiar advertencia si existía
      setRecNotice(null);

      // Si ya estaba reproduciendo en modo solo Play, detener limpiamente
      if (isSequencerPlaying() || isPlayingState) {
        handleStop();
      }

      lastTransportStartAtRef.current = Date.now();
      ensureAudioStarted();

      // Disparar primero el Play de la secuencia si está detenida (programa count-in y Tone.Transport.start en la posición actual)
      const btn = document.getElementById("metronome-toggle-btn");
      if (btn) {
        if (!isSequencerPlaying()) {
          btn.click();
        }
      } else {
        try {
          const currentSec = Math.max(0, Tone.Transport.seconds || 0);
          Tone.Transport.start(Tone.now(), currentSec);
        } catch (e) {
          console.warn("[Tone.Transport] Error starting transport on record:", e);
        }
      }

      // Activar inmediatamente el estado global de grabación y notificar al secuenciador MIDI
      setIsRecording(true);
      setIsPlayingState(true);
      window.dispatchEvent(new CustomEvent('master-rec-start'));

      // NOTA ARQUITECTÓNICA:
      // REC MASTER graba exclusivamente eventos MIDI en la pista armada.
      // NO se inicia grabador de audio (Tone.Recorder / MediaRecorder) ni se genera WAV.
    } catch (err) {
      console.error("[Master REC] Error al iniciar grabación MIDI:", err);
      lastTransportStartAtRef.current = 0;
      setIsRecording(false);
      setIsPlayingState(false);
    }
  }, [ensureAudioStarted, isRecording, isPlayingState, handleStop, isSequencerPlaying, language]);

  // Manejadores de controles rápidos locales (cambian audio y mixer instantáneamente)
  const handleQuickVolumeChange = useCallback((val: number) => {
    ensureAudioStarted();
    setQuickVolume(val);
    liveMidiController.setGainDirect(val);
  }, [ensureAudioStarted]);

  const handleQuickReverbChange = useCallback((val: number) => {
    ensureAudioStarted();
    setQuickReverb(val);
    liveMidiController.setReverbWetDirect(val);
  }, [ensureAudioStarted]);

  const handleToggleMute = useCallback(() => {
    ensureAudioStarted();
    liveMidiController.toggleMute();
  }, [ensureAudioStarted]);

  // Acceso Rápido al Mixer (Icono SlidersHorizontal)
  const handleOpenMixer = useCallback(() => {
    if (typeof onOpenMixer === 'function') {
      onOpenMixer();
    }
    window.dispatchEvent(new CustomEvent('open-mixer-modal'));
    const openBtn = document.getElementById('open-mixer-modal-btn');
    if (openBtn) {
      openBtn.click();
    }
  }, [onOpenMixer]);

  // Acceso Rápido al Estilo de Música (Icono Drum + Selector Minimalista DAW)
  const handleDrumStyleChange = useCallback((newStyle: DrumStyle) => {
    // 1. Invocar directamente la función setter global por props si fue provista
    if (typeof onStyleChange === 'function') {
      onStyleChange(newStyle);
    }

    // 2. Disparar eventos globales para sincronizar Metronome y oyentes de la app
    window.dispatchEvent(new CustomEvent('change-drum-style', { detail: newStyle }));
    window.dispatchEvent(new CustomEvent('drum-style-changed', { detail: newStyle }));

    // 3. Sincronizar el selector superior nativo si está presente en el DOM
    const topSelector = document.getElementById('drum-style-selector') as HTMLSelectElement | null;
    if (topSelector && topSelector.value !== newStyle) {
      topSelector.value = newStyle;
      topSelector.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 4. Actualizar inmediatamente la ganancia base del motor rítmico
    const baseGain = getStyleBaseGainMultiplier(newStyle);
    interactiveAnalysisAudio.setStyleBaseGain(baseGain);
  }, [onStyleChange]);

  // Desconexión limpia del sampler activo de Live MIDI
  const disconnectCurrentSampler = useCallback(() => {
    if (liveSamplerRef.current) {
      try {
        liveSamplerRef.current.releaseAll();
      } catch (_) {}
      try {
        liveMidiController.disconnectSampler(liveSamplerRef.current);
      } catch (_) {}
      liveSamplerRef.current = null;
    }
  }, []);

  // Manejador del Selector de BANCO exclusivo para LIVE MIDI
  const handleBankChange = useCallback(async (newBankId: string) => {
    const token = ++bankLoadTokenRef.current;
    setSelectedBank(newBankId);

    // Desconectar el sampler activo antes de cambiar
    disconnectCurrentSampler();

    // Si se selecciona "Sin instrumento" (cadena vacía) -> SILENCIO TOTAL
    if (!newBankId) {
      setIsBankLoading(false);
      return;
    }

    const bankMeta = LIVE_MIDI_BANKS.find((b) => b.id === newBankId);
    if (!bankMeta) {
      setIsBankLoading(false);
      return;
    }

    // 1. Si el banco ya está en caché global persistente, activación instantánea sin latencia
    if (globalLiveBankCache.has(newBankId)) {
      const cached = globalLiveBankCache.get(newBankId)!;
      liveMidiController.connectSampler(cached, bankMeta.gainDb);
      liveSamplerRef.current = cached;
      setIsBankLoading(false);
      return;
    }

    // 2. Carga bajo demanda del banco con FluidR3_GM de alta resolución
    setIsBankLoading(true);
    await ensureAudioStarted();

    try {
      const urls: Record<string, string> = {};
      for (const note of LIVE_MIDI_ANCHORS) {
        urls[note] = `${note}.mp3`;
      }
      const baseUrl = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${bankMeta.folder}/`;

      const sampler = new Tone.Sampler({
        urls,
        baseUrl,
        attack: bankMeta.attack,
        release: bankMeta.release,
        curve: bankMeta.curve,
        onload: () => {
          if (token !== bankLoadTokenRef.current) {
            try {
              sampler.disconnect();
              sampler.dispose();
            } catch (_) {}
            return;
          }
          // Guardar en caché global y conectar al canal LIVE MIDI con ganancia dedicada
          globalLiveBankCache.set(newBankId, sampler);
          liveMidiController.connectSampler(sampler, bankMeta.gainDb);
          liveSamplerRef.current = sampler;
          setIsBankLoading(false);
        },
        onerror: (err) => {
          console.warn(`[LiveMidiBank] Error cargando banco ${bankMeta.name}:`, err);
          if (token !== bankLoadTokenRef.current) {
            try {
              sampler.disconnect();
              sampler.dispose();
            } catch (_) {}
            return;
          }
          globalLiveBankCache.set(newBankId, sampler);
          liveMidiController.connectSampler(sampler, bankMeta.gainDb);
          liveSamplerRef.current = sampler;
          setIsBankLoading(false);
        }
      });
    } catch (err) {
      console.error('[LiveMidiBank] Error inicializando sampler:', err);
      if (token === bankLoadTokenRef.current) {
        setIsBankLoading(false);
      }
    }
  }, [disconnectCurrentSampler, ensureAudioStarted]);

  // Limpieza al desmontar el componente (desconectar sampler activo sin purgar memoria de bancos)
  useEffect(() => {
    return () => {
      disconnectCurrentSampler();
    };
  }, [disconnectCurrentSampler]);

  // Manejo de eventos NoteOn y NoteOff:
  // REGLAS ESTRICTAS DE ENRUTAMIENTO:
  // 1. Si hay una pista armada (R = ON), el controlador reproduce directamente el instrumento de esa pista.
  // 2. Si NO hay ninguna pista armada o la pista armada no tiene banco ("Sin instrumento"), SILENCIO TOTAL.
  // 3. El teclado visual sigue detectando e iluminando las notas en tiempo real.
  const handleNoteOn = useCallback((midiNote: number, rawVelocity: number) => {
    ensureAudioStarted();

    // 1. Enrutamiento directo y exclusivo a la pista armada
    if (sequencerRouterRef.current && sequencerRouterRef.current.hasArmedTrack()) {
      sequencerRouterRef.current.noteOn(midiNote, rawVelocity);
    }
    // Si ninguna pista está armada (R = OFF), SILENCIO. NO tocar banco global ni piano fallback.

    // 2. Estado visual de las teclas (iluminación visual en tiempo real)
    setActiveNotes((prev) => (prev.includes(midiNote) ? prev : [...prev, midiNote]));
    setVelocity(rawVelocity);
  }, [ensureAudioStarted]);

  const handleNoteOff = useCallback((midiNote: number) => {
    // 1. Enrutamiento de NoteOff hacia la pista armada
    if (sequencerRouterRef.current && sequencerRouterRef.current.hasArmedTrack()) {
      sequencerRouterRef.current.noteOff(midiNote);
    }

    // 2. Estado visual de las teclas
    setActiveNotes((prev) => prev.filter((n) => n !== midiNote));
  }, []);

  // Mantener referencias actualizadas para los event listeners del useEffect de MIDI
  const handleNoteOnRef = useRef(handleNoteOn);
  const handleNoteOffRef = useRef(handleNoteOff);
  useEffect(() => {
    handleNoteOnRef.current = handleNoteOn;
    handleNoteOffRef.current = handleNoteOff;
  }, [handleNoteOn, handleNoteOff]);

  // useEffect principal que procesa la entrada de mensajes MIDI globales (hardware y simulador)
  useEffect(() => {
    // Escucha de eventos MIDI procesados por el GlobalMidiProvider
    const onMidiMessageEvent = (e: any) => {
      const { command, data1, data2 } = e.detail || {};
      if (command === 9 && data2 > 0) {
        handleNoteOnRef.current(data1, data2);
      } else if (command === 8 || (command === 9 && data2 === 0)) {
        handleNoteOffRef.current(data1);
      }
    };
    window.addEventListener('custom-midi-message', onMidiMessageEvent);

    return () => {
      window.removeEventListener('custom-midi-message', onMidiMessageEvent);
      if (recorderRef.current && recorderRef.current.state === "started") {
        recorderRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Construcción de teclas blancas y sus correspondientes teclas negras
  const keyPairs = useMemo(() => {
    const pairs: { whiteMidi: number; blackMidi: number | null }[] = [];
    let currentMidi = startNote;
    const endMidi = startNote + numKeys;

    while (currentMidi < endMidi) {
      const isBlack = [1, 3, 6, 8, 10].includes(currentMidi % 12);
      if (isBlack) {
        if (pairs.length > 0) {
          pairs[pairs.length - 1].blackMidi = currentMidi;
        }
      } else {
        pairs.push({ whiteMidi: currentMidi, blackMidi: null });
      }
      currentMidi++;
    }
    return pairs;
  }, [startNote, numKeys]);

  const activeNotesSet = useMemo(() => new Set(activeNotes), [activeNotes]);

  // Nombres legibles de las notas presionadas actualmente en vivo
  const activeNoteLabels = useMemo(() => {
    return Array.from(activeNotesSet)
      .sort((a, b) => a - b)
      .map((midi) => {
        const note = NOTE_NAMES[midi % 12];
        const oct = Math.floor(midi / 12) - 1;
        return `${note}${oct}`;
      });
  }, [activeNotesSet]);

  const activeDeviceName = midiInputs.length > 0 ? midiInputs[0].name || "Controlador MIDI" : null;
  return (
    <div
      className={`w-full bg-neutral-900/60 border border-[#EA580B]/50 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 select-none print:hidden transition-all backdrop-blur-sm ${className}`}
    >
      {/* 1. Header Principal: Círculo Naranja con "1", Título, Subtítulo y Estado MIDI a la derecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EA580B] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md shadow-[#EA580B]/30">
            1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white tracking-wider text-sm font-mono flex items-center gap-1.5 uppercase">
                LIVE MIDI INPUT
              </h3>
              <Radio
                size={13}
                className={`text-[#EA580B] ${midiInputs.length > 0 ? "animate-pulse" : ""}`}
              />
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              {language === 'en'
                ? 'Real-time USB/MIDI controller & virtual piano with master audio recorder'
                : 'Controlador en vivo, grabación de audio y secuenciador en tiempo real'}
            </p>
          </div>
        </div>

        {/* Estado MIDI (Puntito y Nombre de Controlador) y Monitor de Notas en Vivo */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {/* Monitor de notas tocadas en vivo y velocidad */}
          {activeNoteLabels.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-neutral-950/80 border border-neutral-800 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-sm">
              <Activity size={12} className="text-[#EA580B] animate-pulse" />
              <span className="text-neutral-400 text-[10px]">
                {language === 'en' ? 'Notes:' : 'Notas:'}
              </span>
              <div className="flex items-center gap-1">
                {activeNoteLabels.map((n) => (
                  <span
                    key={n}
                    className="bg-[#EA580B] text-white font-bold px-1.5 py-0.5 rounded text-[10px]"
                  >
                    {n}
                  </span>
                ))}
              </div>
              {velocity > 0 && (
                <span className="text-neutral-500 text-[10px] pl-1 font-mono">
                  vel: {velocity}
                </span>
              )}
            </div>
          ) : (
            <span className="text-neutral-500 text-[11px] italic hidden md:inline font-mono">
              {language === 'en' ? 'Play keys on controller...' : 'Toca teclas en tu controlador...'}
            </span>
          )}

          {/* Nombre de dispositivo o estado de conexión MIDI */}
          {midiInputs.length > 0 ? (
            <span className="flex items-center gap-2 text-emerald-400 bg-neutral-950/80 border border-emerald-900/60 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                {activeDeviceName}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-neutral-400 bg-neutral-950/80 border border-neutral-800 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span>
                {language === 'en' ? 'No device connected' : 'Conecta tu teclado (USB / MIDI)'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Barra de Herramientas DAW: Contenedor Grid Modular de 4 Cajas Refinadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.05fr_1fr_1.45fr_1fr] gap-3 mb-4 items-stretch">
        {/* Caja 1: Dispositivo MIDI / Transporte (PLAY / STOP / REC) */}
        <div className="border border-neutral-800/90 rounded-xl p-3 bg-neutral-950/80 flex flex-col justify-between shadow-inner h-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <Radio size={12} className="text-[#EA580B] shrink-0" />
            <span className="font-semibold text-neutral-300 truncate">
              DISPOSITIVO MIDI / TRANSPORTE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full my-auto">
            {/* Play Button - Naranja */}
            <button
              type="button"
              id="keyboard-transport-play-btn"
              onClick={(e) => { e.currentTarget.blur(); togglePlayback(); }}
              title={language === 'en' ? 'Play Sequencer' : 'Reproducir secuencia'}
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-mono font-semibold tracking-wider uppercase transition-all cursor-pointer active:scale-95 shadow-sm min-w-0 ${
                isPlayingState && !isRecording
                  ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-750'
                  : 'bg-[#EA580B] hover:bg-[#d94e08] text-white shadow-[#EA580B]/20 hover:shadow-[#EA580B]/35'
              }`}
            >
              <Play size={13} className={isPlayingState && !isRecording ? "fill-current shrink-0" : "fill-white text-white shrink-0"} />
              <span className="truncate">PLAY</span>
            </button>

            {/* Stop Button - Gris oscuro */}
            <button
              type="button"
              id="keyboard-transport-stop-btn"
              onClick={(e) => { e.currentTarget.blur(); handleStop(); }}
              title={
                isRecording
                  ? (language === 'en' ? 'Stop Recording MIDI Take' : 'Detener Grabación MIDI Take')
                  : (language === 'en' ? 'Stop Sequencer' : 'Detener secuencia')
              }
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-mono font-semibold tracking-wider uppercase transition-all cursor-pointer active:scale-95 border min-w-0 ${
                !isPlayingState && !isRecording
                  ? 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border-neutral-800'
                  : 'bg-neutral-900 text-neutral-200 border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              <Square size={12} className="fill-current shrink-0" />
              <span className="truncate">STOP</span>
            </button>

            {/* Record Button - Punto rojo / rosa */}
            <button
              type="button"
              id="keyboard-transport-rec-btn"
              onClick={(e) => { e.currentTarget.blur(); handleRecord(); }}
              title={
                isRecording
                  ? (language === 'en' ? 'Recording MIDI on armed track... (Click Stop to finish Take)' : 'Grabando MIDI en la pista armada... (Haz clic en Stop para finalizar Take)')
                  : (language === 'en' ? 'Record MIDI on armed track (Master Transport)' : 'Grabar MIDI en pista armada (Master Transport)')
              }
              className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-mono font-semibold tracking-wider uppercase transition-all cursor-pointer active:scale-95 border min-w-0 ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-sm shadow-rose-900/40'
                  : 'bg-neutral-900 text-rose-400 hover:text-rose-300 hover:bg-neutral-800 border-neutral-800 hover:border-rose-900/40'
              }`}
            >
              <Circle size={10} className={isRecording ? "fill-white text-white shrink-0" : "fill-rose-500 text-rose-500 shrink-0"} />
              <span className={`truncate ${isRecording ? "text-white font-bold" : "text-rose-400"}`}>REC</span>
            </button>
          </div>

          {/* Aviso discreto si se presiona REC sin pista armada */}
          {recNotice && (
            <div className="flex items-center gap-1.5 px-2 py-1 mt-1.5 bg-amber-950/90 border border-amber-600/60 rounded-md text-[10px] font-mono text-amber-300 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
              <span className="truncate">{recNotice}</span>
            </div>
          )}

          {/* Dispositivo conectado o indicador de grabación activa */}
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-neutral-500 mt-2 pt-1.5 border-t border-neutral-900">
            {isRecording ? (
              <span className="flex items-center gap-1 text-rose-400 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="truncate">REC: {armedTrackInfo?.name || (language === 'en' ? 'Armed Track' : 'Pista armada')}</span>
              </span>
            ) : (
              <span className="truncate max-w-[140px] text-neutral-400">
                {midiInputs.length > 0 ? activeDeviceName : (language === 'en' ? 'Virtual / USB' : 'Teclado Virtual / USB')}
              </span>
            )}
          </div>
        </div>

        {/* Caja 2: Tempo y Métrica */}
        <div className="border border-neutral-800/90 rounded-xl p-3 bg-neutral-950/80 flex flex-col justify-between shadow-inner h-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <Clock size={12} className="text-[#EA580B] shrink-0" />
            <span className="font-semibold text-neutral-300 truncate">
              {language === 'en' ? 'Tempo & Meter' : 'TEMPO Y MÉTRICA'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full justify-between my-auto">
            {/* Control Rápido de BPM con [-] [BPM] [+] */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1.5 rounded-lg flex-1 min-w-0 justify-between" title={language === 'en' ? 'BPM Tempo' : 'Tempo (BPM)'}>
              <button
                type="button"
                id="keyboard-quick-bpm-minus"
                onClick={() => handleStepBpm(-1)}
                className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-[#EA580B] hover:bg-neutral-800 transition cursor-pointer active:scale-90 shrink-0"
                title="-1 BPM"
              >
                <Minus size={11} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={bpmInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setBpmInput(val);
                  }
                }}
                onBlur={() => commitBpm(bpmInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitBpm(bpmInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-8 sm:w-10 bg-transparent text-center text-sm font-mono font-bold text-neutral-100 focus:text-[#EA580B] outline-none p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-pointer"
                title={language === 'en' ? 'BPM Tempo' : 'Tempo (BPM)'}
              />
              <span className="text-[10px] font-mono uppercase text-neutral-500 font-bold shrink-0">BPM</span>
              <button
                type="button"
                id="keyboard-quick-bpm-plus"
                onClick={() => handleStepBpm(1)}
                className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-[#EA580B] hover:bg-neutral-800 transition cursor-pointer active:scale-90 shrink-0"
                title="+1 BPM"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Selector de Métrica */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg group shrink-0" title={language === 'en' ? 'Time Signature' : 'Métrica / Compás'}>
              <select
                id="keyboard-quick-sig-selector"
                value={activeTimeSignature}
                onChange={(e) => handleTimeSignatureUpdate(e.target.value)}
                className="appearance-none bg-transparent text-sm font-mono font-bold text-neutral-200 group-hover:text-[#EA580B] outline-none cursor-pointer border-none p-0 transition-colors"
                title={language === 'en' ? 'Time Signature' : 'Métrica / Compás'}
              >
                {(["4/4", "3/4", "6/8", "12/8", "2/4", "5/4", "7/8"] as const).map((sig) => (
                  <option key={sig} value={sig} className="bg-neutral-900 text-neutral-200">
                    {sig}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-500 mt-2 pt-1.5 border-t border-neutral-900 flex justify-between">
            <span>{bpmInput || 120} Beats/min</span>
            <span className="text-neutral-400 font-semibold">{activeTimeSignature} Bar</span>
          </div>
        </div>

        {/* Caja 3: Sonido y Estilo (Unificado: Banco Live MIDI + Estilo Rítmico) */}
        <div className="border border-neutral-800/90 rounded-xl p-3 bg-neutral-950/80 flex flex-col justify-between shadow-inner h-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase tracking-wider">
              <Music size={12} className="text-[#EA580B] shrink-0" />
              <span className="font-semibold text-neutral-300 truncate">
                {language === 'en' ? 'SOUND & STYLE' : 'SONIDO Y ESTILO'}
              </span>
            </div>
            {isBankLoading && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#EA580B] animate-pulse shrink-0">
                <Loader2 size={10} className="animate-spin" />
                <span>{language === 'en' ? 'Loading...' : 'Cargando...'}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full my-auto">
            {/* Opción 1: Instrumento de la Pista Armada (Solo lectura desde el DAW) */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <Piano size={11} className="text-[#EA580B] shrink-0" />
                <span className="truncate">
                  {language === 'en' ? 'Track Instrument' : 'Instrumento de Pista'}
                </span>
              </div>
              <div
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg text-neutral-300 min-w-0"
                title={
                  armedTrackInfo
                    ? `${armedTrackInfo.name}: ${armedTrackInfo.instrument}`
                    : (language === 'en' ? 'No track armed. Arm a track in the DAW to play.' : 'Sin pista armada. Activa R en una pista para tocar.')
                }
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      armedTrackInfo && armedTrackInfo.bankId
                        ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]'
                        : 'bg-neutral-600'
                    }`}
                  />
                  <span className="text-xs font-mono font-medium truncate text-neutral-200">
                    {armedTrackInfo
                      ? (armedTrackInfo.bankId ? armedTrackInfo.instrument : 'Sin instrumento')
                      : (language === 'en' ? 'No track armed' : 'Sin pista armada')}
                  </span>
                </div>
                {armedTrackInfo && (
                  <span className="text-[9px] font-mono text-[#EA580B] bg-[#EA580B]/10 px-1 py-0.5 rounded border border-[#EA580B]/20 shrink-0 ml-1">
                    {armedTrackInfo.name}
                  </span>
                )}
              </div>
            </div>

            {/* Opción 2: Estilo y Ritmo */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <Drum size={11} className="text-[#EA580B] shrink-0" />
                <span className="truncate">{language === 'en' ? 'Style' : 'Estilo'}</span>
              </div>
              <div
                className="flex items-center bg-neutral-900 border border-neutral-800 px-2 py-1.5 rounded-lg text-neutral-300 group min-w-0"
                title={language === 'en' ? 'Musical Style / Rhythm Groove' : 'Estilo Musical / Patrón Rítmico'}
              >
                <select
                  id="keyboard-quick-drum-style-selector"
                  value={activeStyle}
                  onChange={(e) => handleDrumStyleChange(e.target.value as DrumStyle)}
                  className="appearance-none bg-transparent text-xs font-mono text-neutral-200 group-hover:text-[#EA580B] outline-none cursor-pointer border-none p-0 w-full truncate transition-colors"
                  title={language === 'en' ? 'Musical Style / Rhythm Groove' : 'Estilo Musical / Patrón Rítmico'}
                >
                  <option value="Jazz Swing" className="bg-neutral-900 text-neutral-200">Jazz Swing</option>
                  <option value="Bossa Nova" className="bg-neutral-900 text-neutral-200">Bossa Nova</option>
                  <option value="Bolero" className="bg-neutral-900 text-neutral-200">Bolero</option>
                  <option value="Pop" className="bg-neutral-900 text-neutral-200">Pop</option>
                  <option value="Rock" className="bg-neutral-900 text-neutral-200">Rock</option>
                  <option value="Reggae" className="bg-neutral-900 text-neutral-200">Reggae</option>
                  <option value="R&B" className="bg-neutral-900 text-neutral-200">R&B</option>
                  <option value="Hip Hop" className="bg-neutral-900 text-neutral-200">Hip Hop</option>
                  <option value="Cumbia" className="bg-neutral-900 text-neutral-200">Cumbia</option>
                  <option value="Cool Jazz" className="bg-neutral-900 text-neutral-200">Cool Jazz</option>
                  <option value="Funk" className="bg-neutral-900 text-neutral-200">Funk</option>
                  <option value="Blues" className="bg-neutral-900 text-neutral-200">Blues</option>
                  <option value="Reggaetón" className="bg-neutral-900 text-neutral-200">Reggaetón</option>
                  <option value="Metronome Básico" className="bg-neutral-900 text-neutral-200">
                    {language === 'en' ? 'Metronome (Basic)' : 'Metrónomo Básico'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-500 mt-2 pt-1.5 border-t border-neutral-900 flex justify-between gap-1">
            <span className={`truncate ${selectedBank ? 'text-[#EA580B]' : 'text-neutral-500'}`}>
              {selectedBank
                ? (LIVE_MIDI_BANKS.find((b) => b.id === selectedBank)?.name || selectedBank)
                : 'Sin instrumento'}
            </span>
            <span className="text-neutral-400 truncate text-right">
              {activeStyle}
            </span>
          </div>
        </div>

        {/* Caja 4: Mixer (Título/Botón MIXER + Sliders Volumen y Reverb) */}
        <div className="border border-neutral-800/90 rounded-xl p-3 bg-neutral-950/80 flex flex-col justify-between shadow-inner h-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono uppercase tracking-wider">
              <SlidersHorizontal size={12} className="text-[#EA580B] shrink-0" />
              <span className="font-semibold text-neutral-300">
                MIXER
              </span>
            </div>
            <button
              type="button"
              id="btn-keyboard-open-mixer"
              onClick={handleOpenMixer}
              className="text-[10px] font-mono font-bold text-[#EA580B] hover:text-[#d94e08] hover:underline cursor-pointer uppercase transition-colors"
              title={language === 'en' ? 'Open Mixer & Master Console' : 'Abrir Mezclador y Consola Maestra'}
            >
              CONSOLE &gt;
            </button>
          </div>

          <div className="flex flex-col gap-1.5 w-full my-auto">
            {/* Slider de Volumen */}
            <div className="flex items-center gap-2 w-full group">
              <button
                type="button"
                onClick={handleToggleMute}
                title={
                  isMuted || quickVolume <= 0.001
                    ? (language === 'en' ? 'Unmute Live Keyboard' : 'Activar sonido del teclado')
                    : (language === 'en' ? 'Mute Live Keyboard' : 'Silenciar teclado en vivo')
                }
                className="text-neutral-400 hover:text-[#EA580B] transition-colors cursor-pointer shrink-0"
              >
                {isMuted || quickVolume <= 0.001 ? (
                  <VolumeX size={13} className="text-neutral-500 hover:text-neutral-300" />
                ) : (
                  <Volume2 size={13} className="text-[#EA580B]" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={quickVolume}
                onChange={(e) => handleQuickVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#EA580B] hover:accent-[#EA580B] focus:outline-none"
                title={`${language === 'en' ? 'Quick Volume' : 'Volumen en vivo'}: ${Math.round(quickVolume * 100)}%`}
              />
              <span className="text-[10px] font-mono text-neutral-400 min-w-[32px] text-right font-medium shrink-0">
                {isMuted || quickVolume <= 0.001 ? 'MUTE' : `${Math.round(quickVolume * 100)}%`}
              </span>
            </div>

            {/* Slider de Reverb */}
            <div className="flex items-center gap-2 w-full group">
              <div
                className="shrink-0 text-cyan-400"
                title={language === 'en' ? 'Quick Live Reverb Effect' : 'Efecto Reverb Espacial en Vivo'}
              >
                <Waves
                  size={13}
                  className={quickReverb > 0.001 ? "text-cyan-400" : "text-neutral-500"}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={quickReverb}
                onChange={(e) => handleQuickReverbChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none"
                title={`${language === 'en' ? 'Quick Reverb' : 'Reverb en vivo'}: ${Math.round(quickReverb * 100)}%`}
              />
              <span className="text-[10px] font-mono text-neutral-400 min-w-[32px] text-right font-medium shrink-0">
                {quickReverb <= 0.001 ? 'DRY' : `${Math.round(quickReverb * 100)}%`}
              </span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-500 mt-1.5 pt-1 border-t border-neutral-900 flex justify-between">
            <span>Vol: {Math.round(quickVolume * 100)}%</span>
            <span className="text-cyan-400/80">Rev: {Math.round(quickReverb * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 3. Contenedor del teclado virtual de 61 teclas memoizado */}
      <VirtualPianoKeyboard
        keyPairs={keyPairs}
        activeNotesSet={activeNotesSet}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />

      {/* 4. Secuenciador Multipista (PISTAS MIDI) */}
      <MidiTracksSequencer
        onRegisterRouter={handleRegisterRouter}
        onArmedTrackChange={handleArmedTrackChange}
        onTracksChange={onTracksChange}
        bpm={bpmInput ? parseInt(bpmInput, 10) : (propBpm || 120)}
        timeSignature={activeTimeSignature || propTimeSignature || "4/4"}
        playbackSequence={playbackSequence}
        currentSong={currentSong}
        transposition={transposition}
        globalKey={globalKey}
        currentStyle={activeStyle || currentStyle}
        isVisible={isVisible}
        masterIsPlaying={isPlayingState}
        masterIsRecording={isRecording}
        onMasterPlay={handlePlay}
        onMasterStop={handleStop}
        onMasterRec={handleRecord}
      />
    </div>
  );
}
