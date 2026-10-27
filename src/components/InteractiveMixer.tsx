import React, { useEffect, useState, useRef } from "react";
import {
  interactiveAnalysisAudio,
  HarmonicInstrumentType,
} from "../utils/interactiveAnalysisAudio";
import {
  Volume2,
  Music,
  Disc,
  Layers,
  Sparkles,
  X,
  ChevronDown,
  ChevronRight,
  Play,
  Square,
  Plus,
  Minus,
  Radio,
  Waves,
} from "lucide-react";
import { liveMidiController } from "../utils/liveMidiController";
import {
  setLeadMelodyVolume,
  setLeadMelodyMuted,
} from "./Metronome";

interface InteractiveMixerProps {
  currentInstrument?: HarmonicInstrumentType;
  onInstrumentChange?: (inst: HarmonicInstrumentType) => void;
  onClose?: () => void;
  className?: string;
  isPlaying?: boolean;
  onTogglePlayback?: () => void;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  songStyle?: string;
  dawTracks?: any[];
  updateTrackVolume?: (trackId: string, volume: number) => void;
  toggleTrackMute?: (trackId: string) => void;
  toggleTrackSolo?: (trackId: string) => void;
  updateTrackPan?: (trackId: string, pan: number) => void;
  onUpdateTrackInstrument?: (trackId: string, instrumentId: string) => void;
}

const STATIC_MIXER_CHANNELS = new Set([
  "master",
  "drums",
  "bass",
  "piano",
  "rhodes",
  "guitar",
  "kick",
  "snare",
  "hihat",
  "ride",
]);

function parsePanStringToNumber(panVal: any): number {
  if (typeof panVal === "number" && !isNaN(panVal)) {
    return Math.max(-1, Math.min(1, panVal));
  }
  const str = String(panVal || "C").trim().toUpperCase();
  if (str === "C" || str === "0") return 0;
  if (str.startsWith("L")) {
    const num = parseFloat(str.replace("L", "").trim());
    return isNaN(num) ? 0 : Math.max(-1, -num / 50);
  }
  if (str.startsWith("R")) {
    const num = parseFloat(str.replace("R", "").trim());
    return isNaN(num) ? 0 : Math.min(1, num / 50);
  }
  return 0;
}

function toDecibels(val: number): string {
  if (val <= 0.001) return "-∞ dB";
  const db = 20 * Math.log10(val);
  return `${db >= 0 ? "+" : ""}${db.toFixed(1)} dB`;
}

const VUMeter = React.memo(({ channel }: { channel: string }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const peakTextRef = useRef<HTMLSpanElement>(null);
  const clipLedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let smoothedPeak = 0;
    const DECAY = 0.88;

    const tick = () => {
      const peak =
        channel === "liveMidi"
          ? liveMidiController.getPeak()
          : STATIC_MIXER_CHANNELS.has(channel)
          ? interactiveAnalysisAudio.getChannelPeak(channel as any)
          : typeof (window as any).__linusGetDawTrackPeak === "function"
          ? (window as any).__linusGetDawTrackPeak(channel)
          : 0;
      smoothedPeak = Math.max(peak, smoothedPeak * DECAY);

      if (barRef.current) {
        const percent = Math.min(100, Math.max(0, smoothedPeak * 100));
        barRef.current.style.height = `${percent}%`;

        if (percent > 94) {
          barRef.current.style.backgroundColor = "#ef4444";
          barRef.current.style.boxShadow = "0 0 6px rgba(239, 68, 68, 0.9)";
        } else if (percent > 82) {
          barRef.current.style.backgroundColor = "#EA580B";
          barRef.current.style.boxShadow = "0 0 5px rgba(234, 88, 11, 0.8)";
        } else if (percent > 65) {
          barRef.current.style.backgroundColor = "#f59e0b";
          barRef.current.style.boxShadow = "0 0 4px rgba(245, 158, 11, 0.7)";
        } else {
          barRef.current.style.backgroundColor = "#10b981";
          barRef.current.style.boxShadow = "0 0 3px rgba(16, 185, 129, 0.6)";
        }
      }

      if (clipLedRef.current) {
        if (smoothedPeak > 0.95) {
          clipLedRef.current.style.backgroundColor = "#ef4444";
          clipLedRef.current.style.boxShadow = "0 0 6px rgba(239, 68, 68, 0.95)";
        } else {
          clipLedRef.current.style.backgroundColor = "#27272a";
          clipLedRef.current.style.boxShadow = "none";
        }
      }

      if (peakTextRef.current) {
        if (smoothedPeak <= 0.005) {
          peakTextRef.current.textContent = "-∞";
          peakTextRef.current.style.color = "#71717a";
        } else {
          const db = 20 * Math.log10(smoothedPeak);
          peakTextRef.current.textContent = `${db >= 0 ? "+" : ""}${db.toFixed(0)}`;
          peakTextRef.current.style.color = db > -1.5 ? "#ef4444" : db > -6 ? "#f59e0b" : "#10b981";
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [channel]);

  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none flex-none w-3.5 h-[162px] min-h-[162px] max-h-[162px]">
      <div className="flex items-center gap-0.5 justify-center w-full h-3">
        <div
          ref={clipLedRef}
          className="w-1.5 h-1.5 rounded-[1px] bg-zinc-800 transition-colors shrink-0"
          title="Clip Peak LED"
        />
        <span
          ref={peakTextRef}
          className="font-mono text-[7px] font-bold text-zinc-500 leading-3 tabular-nums block overflow-hidden text-center"
        >
          -∞
        </span>
      </div>

      <div className="w-2.5 h-[142px] bg-black rounded-[2px] border border-zinc-800/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] flex flex-col justify-end relative overflow-hidden p-[1px] flex-none">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background:
              "linear-gradient(to top, #10b981 0%, #10b981 65%, #f59e0b 65%, #f59e0b 82%, #EA580B 82%, #EA580B 94%, #ef4444 94%)",
          }}
        />
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, #000 6px, #000 8px)",
          }}
        />
        <div
          ref={barRef}
          className="w-full rounded-[1px] absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: "0%",
            backgroundColor: "#10b981",
            willChange: "height",
            transition: "none",
          }}
        />
      </div>
    </div>
  );
});

VUMeter.displayName = "VUMeter";

interface UncontrolledChannelStripProps {
  id: string;
  name: string;
  subName: string;
  channelKey: string;
  initialVolume: number;
  initialPan?: number;
  onPanDirect?: (pan: number) => void;
  isMuted?: boolean;
  isSolo?: boolean;
  isDimmed?: boolean;
  onToggleMute?: () => void;
  onToggleSolo?: () => void;
  showSolo?: boolean;
  accentColor?: string;
  onGainDirect: (vol: number) => void;
  headerIcon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  widthClass?: string;
  borderHighlightClass?: string;
  bgHighlightClass?: string;
}

const formatPanDisplay = (pan: number): string => {
  const p50 = Math.round(pan * 50);
  if (p50 === 0) return "C";
  if (p50 < 0) return `L${Math.abs(p50)}`;
  return `R${p50}`;
};

const UncontrolledChannelStrip = React.memo(({
  id,
  name,
  subName,
  channelKey,
  initialVolume,
  initialPan,
  onPanDirect,
  isMuted = false,
  isSolo = false,
  isDimmed = false,
  onToggleMute,
  onToggleSolo,
  showSolo = false,
  accentColor,
  onGainDirect,
  headerIcon,
  headerExtra,
  borderHighlightClass = "border-neutral-800",
  bgHighlightClass = "bg-[#111215]",
}: UncontrolledChannelStripProps) => {
  const dbTextRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLDivElement>(null);
  const rangeInputRef = useRef<HTMLInputElement>(null);
  const panTextRef = useRef<HTMLSpanElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rangeInputRef.current && document.activeElement !== rangeInputRef.current) {
      rangeInputRef.current.value = String(initialVolume);
    }
    if (dbTextRef.current) {
      dbTextRef.current.textContent = toDecibels(initialVolume);
    }
    if (percentTextRef.current) {
      percentTextRef.current.textContent = `${Math.round(initialVolume * 100)}%`;
    }
  }, [initialVolume]);

  useEffect(() => {
    if (initialPan === undefined) return;
    if (panInputRef.current && document.activeElement !== panInputRef.current) {
      panInputRef.current.value = String(initialPan);
    }
    if (panTextRef.current) {
      panTextRef.current.textContent = formatPanDisplay(initialPan);
    }
  }, [initialPan]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    onGainDirect(val);

    if (dbTextRef.current) {
      dbTextRef.current.textContent = toDecibels(val);
    }
    if (percentTextRef.current) {
      percentTextRef.current.textContent = `${Math.round(val * 100)}%`;
    }
  };

  const handleDoubleClick = () => {
    if (rangeInputRef.current) {
      rangeInputRef.current.value = "1.0";
    }
    onGainDirect(1.0);
    if (dbTextRef.current) {
      dbTextRef.current.textContent = "0.0 dB";
    }
    if (percentTextRef.current) {
      percentTextRef.current.textContent = "100%";
    }
  };

  const handlePanInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    if (onPanDirect) {
      onPanDirect(val);
    }
    if (panTextRef.current) {
      panTextRef.current.textContent = formatPanDisplay(val);
    }
  };

  const handlePanDoubleClick = () => {
    if (panInputRef.current) {
      panInputRef.current.value = "0";
    }
    if (onPanDirect) {
      onPanDirect(0);
    }
    if (panTextRef.current) {
      panTextRef.current.textContent = "C";
    }
  };

  return (
    <div
      className={`flex-none w-[110px] min-w-[110px] max-w-[110px] shrink-0 h-[435px] min-h-[435px] max-h-[435px] ${bgHighlightClass} border ${borderHighlightClass} rounded-xl p-2 flex flex-col justify-between transition-all duration-150 relative overflow-hidden ${
        isMuted || isDimmed ? "opacity-55" : "opacity-100"
      }`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-[#EA580B] pointer-events-none"
        style={accentColor ? { backgroundColor: accentColor } : undefined}
      />

      <div className="text-center pt-0.5 pb-1 border-b border-neutral-800 flex-none h-10 overflow-hidden flex flex-col justify-center">
        <span className="font-sans text-[11px] text-neutral-200 font-semibold tracking-wide uppercase flex items-center justify-center gap-1.5 truncate">
          {headerIcon || <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#EA580B]" />}
          <span className="truncate">{name}</span>
        </span>
        <span className="text-neutral-400 text-xs font-mono block truncate mt-0.5">
          {subName}
        </span>
      </div>

      <div className="my-0.5 flex-none min-h-[24px]">
        {showSolo ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              id={`fader-btn-mute-${channelKey}`}
              onClick={onToggleMute}
              className={`flex-1 h-6 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center active:scale-95 border ${
                isMuted
                  ? "bg-rose-600 text-white border-rose-500 font-bold"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800"
              }`}
              title="Mutear Canal (M)"
            >
              M
            </button>
            <button
              type="button"
              id={`fader-btn-solo-${channelKey}`}
              onClick={onToggleSolo}
              className={`flex-1 h-6 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center active:scale-95 border ${
                isSolo
                  ? "bg-[#EA580B] text-white font-bold border-[#EA580B]"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border-neutral-800"
              }`}
              title="Solo Canal (S)"
            >
              S
            </button>
          </div>
        ) : onToggleMute ? (
          <button
            type="button"
            id={`fader-btn-mute-${channelKey}`}
            onClick={onToggleMute}
            className={`w-full h-6 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center active:scale-95 border ${
              isMuted
                ? "bg-rose-600 text-white border-rose-500 font-bold"
                : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800"
            }`}
            title="Mutear Pista"
          >
            {isMuted ? "MUTED" : "MUTE"}
          </button>
        ) : null}

        {headerExtra}
      </div>

      {onPanDirect !== undefined ? (
        <div className="my-0.5 px-1.5 py-1 bg-neutral-950 rounded-md border border-neutral-800 flex flex-col gap-0.5 select-none flex-none h-11 overflow-hidden">
          <div className="flex items-center justify-between text-[7.5px] font-mono leading-none px-0.5">
            <span className="text-neutral-400 font-bold uppercase tracking-wider">PAN</span>
            <span ref={panTextRef} className="font-bold tabular-nums text-[#EA580B]">
              {formatPanDisplay(initialPan ?? 0)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 px-0.5">
            <span className="text-[6.5px] font-mono font-bold text-neutral-500">L</span>
            <input
              ref={panInputRef}
              type="range"
              min="-1"
              max="1"
              step="0.01"
              defaultValue={initialPan ?? 0}
              id={`pan-slider-${channelKey}`}
              onInput={handlePanInput}
              onDoubleClick={handlePanDoubleClick}
              className="w-full h-1 bg-neutral-800 rounded-lg cursor-pointer accent-[#EA580B]"
              style={{ accentColor: "#EA580B" }}
              title="Arrastra para ajustar paneo en tiempo real. Doble clic para Centrar (C)."
            />
            <span className="text-[6.5px] font-mono font-bold text-neutral-500">R</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-1 my-auto py-1 h-[190px] min-h-[190px] max-h-[190px] flex-none bg-neutral-950 rounded-lg p-1 border border-neutral-800 overflow-hidden">
        <VUMeter channel={channelKey} />

        <div className="flex flex-col justify-between text-[7px] font-mono text-neutral-500 h-[154px] min-h-[154px] max-h-[154px] flex-none select-none text-right pr-0.5 tabular-nums">
          <span className="text-rose-400 font-bold">+3</span>
          <span className="text-[#EA580B] font-extrabold flex items-center justify-end gap-0.5">
            0 <span className="text-[6px] text-[#EA580B]">◀</span>
          </span>
          <span className="text-neutral-400 font-medium">-6</span>
          <span className="text-neutral-500">-12</span>
          <span className="text-neutral-600">-24</span>
          <span className="text-neutral-600">-∞</span>
        </div>

        <div
          className="relative w-8 h-[162px] min-h-[162px] max-h-[162px] flex-none flex items-center justify-center bg-neutral-950 rounded-md border border-neutral-800"
          title="Arrastra para ajustar ganancia en tiempo real. Doble clic para 0 dB."
        >
          <div className="absolute top-2.5 bottom-2.5 w-[3px] bg-neutral-900 rounded-full border border-neutral-800 pointer-events-none" />

          <div
            className="absolute left-0 right-0 h-[1.5px] bg-[#EA580B] pointer-events-none z-0"
            style={{ bottom: "66.7%" }}
            title="0 dB (Ganancia Unitaria)"
          />

          <input
            ref={rangeInputRef}
            type="range"
            min="0"
            max="4.2"
            step="0.01"
            defaultValue={initialVolume}
            id={id}
            onInput={handleInput}
            onDoubleClick={handleDoubleClick}
            className="daw-fader accent-orange"
            title="Arrastra para ajustar ganancia. Doble clic para 0.0 dB"
          />
        </div>
      </div>

      <div className="text-center pt-1 border-t border-neutral-800 flex-none h-11 overflow-hidden bg-neutral-950/60 rounded-b-lg">
        <div
          ref={dbTextRef}
          className="block w-full text-center h-6 overflow-hidden text-neutral-200 tabular-nums font-medium font-mono text-[11px] leading-6 tracking-tight"
        >
          {toDecibels(initialVolume)}
        </div>
        <div
          ref={percentTextRef}
          className="block w-full text-center h-4 overflow-hidden text-neutral-400 tabular-nums font-mono text-[8px] leading-4"
        >
          {Math.round(initialVolume * 100)}%
        </div>
      </div>
    </div>
  );
});

UncontrolledChannelStrip.displayName = "UncontrolledChannelStrip";

interface RoomReverbControlProps {
  initialWet: number;
  onWetChange: (wet: number) => void;
}

const RoomReverbControl = React.memo(({ initialWet, onWetChange }: RoomReverbControlProps) => {
  const wetTextRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    onWetChange(val);
    if (wetTextRef.current) {
      wetTextRef.current.textContent = `${Math.round(val * 100)}%`;
    }
  };

  const handleDoubleClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "0.28";
    }
    onWetChange(0.28);
    if (wetTextRef.current) {
      wetTextRef.current.textContent = "28%";
    }
  };

  return (
    <div className="my-1 px-1.5 py-1 bg-zinc-950/70 rounded border border-amber-500/30 flex flex-col gap-0.5 select-none shadow-inner">
      <div className="flex items-center justify-between text-[7.5px] font-mono leading-none px-0.5">
        <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={8} className="text-amber-400" />
          Room Reverb
        </span>
        <span ref={wetTextRef} className="font-bold text-amber-300">
          {Math.round(initialWet * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-1 mt-0.5 px-0.5">
        <span className="text-[6.5px] font-mono font-bold text-zinc-500">DRY</span>
        <input
          ref={inputRef}
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue={initialWet}
          id="slider-master-room-reverb"
          onInput={handleInput}
          onDoubleClick={handleDoubleClick}
          className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer"
          style={{ accentColor: "#f59e0b" }}
          title="Nivel de retorno de Room Reverb (Wet level). Doble clic para 28%."
        />
        <span className="text-[6.5px] font-mono font-bold text-zinc-500">WET</span>
      </div>
    </div>
  );
});

RoomReverbControl.displayName = "RoomReverbControl";

export default function InteractiveMixer({
  currentInstrument = "piano",
  onInstrumentChange,
  onClose,
  className = "",
  isPlaying = false,
  onTogglePlayback,
  bpm,
  onBpmChange,
  dawTracks: propDawTracks,
  updateTrackVolume,
  toggleTrackMute,
  toggleTrackSolo,
  updateTrackPan,
}: InteractiveMixerProps) {
  const initialMixer = interactiveAnalysisAudio.getMixerState();

  const [syncedDawTracks, setSyncedDawTracks] = useState<any[]>(() => {
    if (Array.isArray(propDawTracks) && propDawTracks.length > 0) {
      return propDawTracks;
    }
    if (typeof (window as any).__linusGetDawTracks === "function") {
      return (window as any).__linusGetDawTracks() || [];
    }
    return [];
  });

  useEffect(() => {
    if (Array.isArray(propDawTracks)) {
      setSyncedDawTracks(propDawTracks);
    }
  }, [propDawTracks]);

  useEffect(() => {
    const handleDawTracksUpdated = (e: any) => {
      if (Array.isArray(e?.detail)) {
        setSyncedDawTracks(e.detail);
      }
    };
    window.addEventListener("linus-daw-tracks-updated", handleDawTracksUpdated);
    return () => {
      window.removeEventListener("linus-daw-tracks-updated", handleDawTracksUpdated);
    };
  }, []);

  const dawTracks = (syncedDawTracks.length > 0 ? syncedDawTracks : (propDawTracks || [])).filter(
    (track: any) => track && !["t-1", "t-2", "t-3"].includes(String(track.id))
  );

  const handleUpdateUserTrackVolume = (trackId: string, vol: number) => {
    if (updateTrackVolume) {
      updateTrackVolume(trackId, vol);
    } else if ((window as any).__linusDawMixerBridge?.updateTrackVolume) {
      (window as any).__linusDawMixerBridge.updateTrackVolume(trackId, vol);
    }
  };

  const handleToggleUserTrackMute = (trackId: string) => {
    if (toggleTrackMute) {
      toggleTrackMute(trackId);
    } else if ((window as any).__linusDawMixerBridge?.toggleTrackMute) {
      (window as any).__linusDawMixerBridge.toggleTrackMute(trackId, );
    }
  };

  const handleToggleUserTrackSolo = (trackId: string) => {
    if (toggleTrackSolo) {
      toggleTrackSolo(trackId);
    } else if ((window as any).__linusDawMixerBridge?.toggleTrackSolo) {
      (window as any).__linusDawMixerBridge.toggleTrackSolo(trackId);
    }
  };

  const handleUpdateUserTrackPan = (trackId: string, pan: number) => {
    if (updateTrackPan) {
      updateTrackPan(trackId, pan);
    } else if ((window as any).__linusDawMixerBridge?.updateTrackPan) {
      (window as any).__linusDawMixerBridge.updateTrackPan(trackId, pan);
    }
  };

  const [muteSolo, setMuteSolo] = useState(() => ({
    kickMuted: initialMixer.drumPieces.kick.isMuted,
    snareMuted: initialMixer.drumPieces.snare.isMuted,
    hihatMuted: initialMixer.drumPieces.hihat.isMuted,
    rideMuted: initialMixer.drumPieces.ride.isMuted,
    drumsMuted: initialMixer.drums.isMuted,
    drumsSolo: initialMixer.drums.isSolo,
    bassMuted: initialMixer.bass.isMuted,
    bassSolo: initialMixer.bass.isSolo,
    pianoMuted: initialMixer.piano.isMuted,
    pianoSolo: initialMixer.piano.isSolo,
    rhodesMuted: initialMixer.rhodes.isMuted,
    rhodesSolo: initialMixer.rhodes.isSolo,
    guitarMuted: initialMixer.guitar.isMuted,
    guitarSolo: initialMixer.guitar.isSolo,
    melodyMuted: false,
    metronomeActive: initialMixer.metronomeActive,
    liveMidiMuted: liveMidiController.getIsMuted(),
  }));

  useEffect(() => {
    return liveMidiController.subscribe(() => {
      setMuteSolo((prev) => ({ ...prev, liveMidiMuted: liveMidiController.getIsMuted() }));
      const fader = document.getElementById("fader-slider-livemidi") as HTMLInputElement;
      if (fader && document.activeElement !== fader) {
        fader.value = String(liveMidiController.getVolume());
      }
      const revDisplay = document.getElementById("live-midi-rev-display");
      if (revDisplay) {
        revDisplay.textContent = `${Math.round(liveMidiController.getReverbWet() * 100)}%`;
      }
    });
  }, []);

  const [isDrumBusExpanded, setIsDrumBusExpanded] = useState(true);
  const [localBpmInput, setLocalBpmInput] = useState<string>(() => (bpm !== undefined ? String(bpm) : "120"));

  useEffect(() => {
    if (bpm !== undefined) {
      setLocalBpmInput(String(bpm));
    }
  }, [bpm]);

  const commitBpmChange = (rawVal: string) => {
    const num = parseInt(rawVal, 10);
    if (!isNaN(num) && onBpmChange) {
      const clamped = Math.max(40, Math.min(300, num));
      onBpmChange(clamped);
      setLocalBpmInput(String(clamped));
    } else if (bpm !== undefined) {
      setLocalBpmInput(String(bpm));
    }
  };

  const handleToggleKickMute = () => {
    interactiveAnalysisAudio.toggleDrumPieceMute("kick");
    setMuteSolo((prev) => ({ ...prev, kickMuted: !prev.kickMuted }));
  };

  const handleToggleSnareMute = () => {
    interactiveAnalysisAudio.toggleDrumPieceMute("snare");
    setMuteSolo((prev) => ({ ...prev, snareMuted: !prev.snareMuted }));
  };

  const handleToggleHihatMute = () => {
    interactiveAnalysisAudio.toggleDrumPieceMute("hihat");
    setMuteSolo((prev) => ({ ...prev, hihatMuted: !prev.hihatMuted }));
  };

  const handleToggleRideMute = () => {
    interactiveAnalysisAudio.toggleDrumPieceMute("ride");
    setMuteSolo((prev) => ({ ...prev, rideMuted: !prev.rideMuted }));
  };

  const handleToggleDrumsMute = () => {
    interactiveAnalysisAudio.toggleChannelMute("drums");
    setMuteSolo((prev) => ({ ...prev, drumsMuted: !prev.drumsMuted }));
  };

  const handleToggleDrumsSolo = () => {
    interactiveAnalysisAudio.toggleChannelSolo("drums");
    setMuteSolo((prev) => ({ ...prev, drumsSolo: !prev.drumsSolo }));
  };

  const handleToggleBassMute = () => {
    interactiveAnalysisAudio.toggleChannelMute("bass");
    setMuteSolo((prev) => ({ ...prev, bassMuted: !prev.bassMuted }));
  };

  const handleToggleBassSolo = () => {
    interactiveAnalysisAudio.toggleChannelSolo("bass");
    setMuteSolo((prev) => ({ ...prev, bassSolo: !prev.bassSolo }));
  };

  const handleTogglePianoMute = () => {
    interactiveAnalysisAudio.toggleChannelMute("piano");
    setMuteSolo((prev) => ({ ...prev, pianoMuted: !prev.pianoMuted }));
  };

  const handleTogglePianoSolo = () => {
    interactiveAnalysisAudio.toggleChannelSolo("piano");
    setMuteSolo((prev) => ({ ...prev, pianoSolo: !prev.pianoSolo }));
  };

  const handleToggleRhodesMute = () => {
    interactiveAnalysisAudio.toggleChannelMute("rhodes");
    setMuteSolo((prev) => ({ ...prev, rhodesMuted: !prev.rhodesMuted }));
  };

  const handleToggleRhodesSolo = () => {
    interactiveAnalysisAudio.toggleChannelSolo("rhodes");
    setMuteSolo((prev) => ({ ...prev, rhodesSolo: !prev.rhodesSolo }));
  };

  const handleToggleGuitarMute = () => {
    interactiveAnalysisAudio.toggleChannelMute("guitar");
    setMuteSolo((prev) => ({ ...prev, guitarMuted: !prev.guitarMuted }));
  };

  const handleToggleGuitarSolo = () => {
    interactiveAnalysisAudio.toggleChannelSolo("guitar");
    setMuteSolo((prev) => ({ ...prev, guitarSolo: !prev.guitarSolo }));
  };

  const handleToggleMelodyMute = () => {
    setMuteSolo((prev) => {
      const next = !prev.melodyMuted;
      setLeadMelodyMuted(next);
      window.dispatchEvent(new CustomEvent("melody-mute-changed", { detail: next }));
      return { ...prev, melodyMuted: next };
    });
  };

  const handleToggleLiveMidiMute = () => {
    const next = liveMidiController.toggleMute();
    setMuteSolo((prev) => ({ ...prev, liveMidiMuted: next }));
  };

  const anySoloActive =
    muteSolo.drumsSolo ||
    muteSolo.bassSolo ||
    muteSolo.pianoSolo ||
    muteSolo.rhodesSolo ||
    muteSolo.guitarSolo ||
    dawTracks.some((t: any) => Boolean(t?.isSolo));

  return (
    <div
      id="interactive-audio-mixer"
      className={`bg-[#111215] border border-neutral-800 rounded-2xl p-4 relative max-h-[92vh] overflow-y-auto ${className}`}
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1">
          {onTogglePlayback && (
            <button
              type="button"
              id="mixer-transport-play-btn"
              onClick={onTogglePlayback}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10.5px] font-mono font-bold tracking-wider uppercase transition cursor-pointer active:scale-95 border ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500"
                  : "bg-[#EA580B] hover:brightness-110 text-white border-[#f97316]/50"
              }`}
              title={isPlaying ? "Detener reproducción" : "Iniciar reproducción de acompañamiento"}
            >
              {isPlaying ? (
                <>
                  <Square size={11} className="fill-current" />
                  <span>STOP</span>
                </>
              ) : (
                <>
                  <Play size={11} className="fill-current ml-0.5" />
                  <span>PLAY</span>
                </>
              )}
            </button>
          )}

          {bpm !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-[8px] font-mono font-bold text-neutral-400">BPM</span>
              {onBpmChange && (
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(40, (parseInt(localBpmInput, 10) || bpm) - 5);
                    setLocalBpmInput(String(next));
                    onBpmChange(next);
                  }}
                  className="w-4 h-4 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-[10px] cursor-pointer active:scale-90"
                  title="Disminuir tempo (-5 BPM)"
                >
                  <Minus size={9} />
                </button>
              )}
              <input
                type="number"
                min="40"
                max="300"
                value={localBpmInput}
                onChange={(e) => setLocalBpmInput(e.target.value)}
                onBlur={() => commitBpmChange(localBpmInput)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitBpmChange(localBpmInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="bg-transparent border-none outline-none focus:ring-0 w-12 text-center text-[#EA580B] font-bold tabular-nums appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-[11px] p-0 m-0"
              />
              {onBpmChange && (
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(300, (parseInt(localBpmInput, 10) || bpm) + 5);
                    setLocalBpmInput(String(next));
                    onBpmChange(next);
                  }}
                  className="w-4 h-4 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-[10px] cursor-pointer active:scale-90"
                  title="Aumentar tempo (+5 BPM)"
                >
                  <Plus size={9} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? "bg-emerald-400 animate-ping" : "bg-neutral-600"
              }`}
            />
            <span className="text-[8.5px] font-mono font-bold tracking-wider uppercase text-neutral-400">
              {isPlaying ? "EN VIVO" : "STANDBY"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            id="mixer-btn-toggle-drumbus-header"
            onClick={() => setIsDrumBusExpanded(!isDrumBusExpanded)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9.5px] font-mono font-bold tracking-wider uppercase transition cursor-pointer border ${
              isDrumBusExpanded
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800"
            }`}
          >
            {isDrumBusExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>Drum Bus: {isDrumBusExpanded ? "4 STEMS" : "RESUMEN"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              id="mixer-header-close-btn"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer border border-neutral-800 flex items-center justify-center active:scale-90"
              title="Cerrar Consola"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {isDrumBusExpanded && (
          <div className="flex items-stretch gap-2.5 bg-neutral-950/80 p-2 rounded-2xl border border-neutral-800 flex-none relative">
            <UncontrolledChannelStrip
              id="fader-slider-kick"
              name="BOMBO"
              subName="Kick WAV"
              channelKey="kick"
              initialVolume={initialMixer.drumPieces.kick.volume}
              initialPan={initialMixer.drumPieces.kick.pan ?? 0.0}
              onPanDirect={(p) => interactiveAnalysisAudio.setDrumPiecePanDirect("kick", p)}
              isMuted={muteSolo.kickMuted}
              onToggleMute={handleToggleKickMute}
              onGainDirect={(v) => interactiveAnalysisAudio.setDrumPieceGainDirect("kick", v)}
            />

            <UncontrolledChannelStrip
              id="fader-slider-snare"
              name="CAJA / ARO"
              subName="Snare / Rim"
              channelKey="snare"
              initialVolume={initialMixer.drumPieces.snare.volume}
              initialPan={initialMixer.drumPieces.snare.pan ?? 0.0}
              onPanDirect={(p) => interactiveAnalysisAudio.setDrumPiecePanDirect("snare", p)}
              isMuted={muteSolo.snareMuted}
              onToggleMute={handleToggleSnareMute}
              onGainDirect={(v) => interactiveAnalysisAudio.setDrumPieceGainDirect("snare", v)}
            />

            <UncontrolledChannelStrip
              id="fader-slider-hihat"
              name="HI-HAT"
              subName="Chick / Pedal"
              channelKey="hihat"
              initialVolume={initialMixer.drumPieces.hihat.volume}
              initialPan={initialMixer.drumPieces.hihat.pan ?? -0.30}
              onPanDirect={(p) => interactiveAnalysisAudio.setDrumPiecePanDirect("hihat", p)}
              isMuted={muteSolo.hihatMuted}
              onToggleMute={handleToggleHihatMute}
              onGainDirect={(v) => interactiveAnalysisAudio.setDrumPieceGainDirect("hihat", v)}
            />

            <UncontrolledChannelStrip
              id="fader-slider-ride"
              name="RIDE"
              subName="Jazz Bronze"
              channelKey="ride"
              initialVolume={initialMixer.drumPieces.ride.volume}
              initialPan={initialMixer.drumPieces.ride.pan ?? 0.35}
              onPanDirect={(p) => interactiveAnalysisAudio.setDrumPiecePanDirect("ride", p)}
              isMuted={muteSolo.rideMuted}
              onToggleMute={handleToggleRideMute}
              onGainDirect={(v) => interactiveAnalysisAudio.setDrumPieceGainDirect("ride", v)}
            />
          </div>
        )}

        <UncontrolledChannelStrip
          id="fader-slider-drums"
          name="BATERÍA"
          subName="Master Drum Bus"
          channelKey="drums"
          initialVolume={initialMixer.drums.volume}
          isMuted={muteSolo.drumsMuted}
          isSolo={muteSolo.drumsSolo}
          isDimmed={anySoloActive && !muteSolo.drumsSolo}
          showSolo={true}
          onToggleMute={handleToggleDrumsMute}
          onToggleSolo={handleToggleDrumsSolo}
          headerIcon={<Disc size={13} className="text-[#EA580B]" />}
          onGainDirect={(v) => interactiveAnalysisAudio.setChannelGainDirect("drums", v)}
        />

        <UncontrolledChannelStrip
          id="fader-slider-bass"
          name="BAJO"
          subName="LPF @ 2.8kHz"
          channelKey="bass"
          initialVolume={initialMixer.bass.volume}
          initialPan={initialMixer.bass.pan ?? 0.0}
          onPanDirect={(p) => interactiveAnalysisAudio.setChannelPanDirect("bass", p)}
          isMuted={muteSolo.bassMuted}
          isSolo={muteSolo.bassSolo}
          isDimmed={anySoloActive && !muteSolo.bassSolo}
          showSolo={true}
          onToggleMute={handleToggleBassMute}
          onToggleSolo={handleToggleBassSolo}
          headerIcon={<Music size={13} className="text-neutral-300" />}
          onGainDirect={(v) => interactiveAnalysisAudio.setChannelGainDirect("bass", v)}
        />

        <UncontrolledChannelStrip
          id="fader-slider-piano"
          name="PIANO"
          subName="Grand Piano"
          channelKey="piano"
          initialVolume={initialMixer.piano.volume}
          initialPan={initialMixer.piano.pan ?? -0.15}
          onPanDirect={(p) => interactiveAnalysisAudio.setChannelPanDirect("piano", p)}
          isMuted={muteSolo.pianoMuted}
          isSolo={muteSolo.pianoSolo}
          isDimmed={anySoloActive && !muteSolo.pianoSolo}
          showSolo={true}
          onToggleMute={handleTogglePianoMute}
          onToggleSolo={handleTogglePianoSolo}
          headerIcon={<Layers size={13} className="text-neutral-300" />}
          headerExtra={
            onInstrumentChange ? (
              <button
                type="button"
                onClick={() => onInstrumentChange("piano")}
                className={`w-full py-0.5 mt-1 text-[7.5px] font-mono rounded border transition cursor-pointer ${
                  currentInstrument === "piano"
                    ? "bg-[#EA580B]/20 border-[#EA580B] text-[#EA580B] font-bold"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {currentInstrument === "piano" ? "● ACTIVO" : "ELEGIR"}
              </button>
            ) : undefined
          }
          onGainDirect={(v) => interactiveAnalysisAudio.setChannelGainDirect("piano", v)}
        />

        <UncontrolledChannelStrip
          id="fader-slider-rhodes"
          name="RHODES"
          subName="Vintage EP"
          channelKey="rhodes"
          initialVolume={initialMixer.rhodes.volume}
          initialPan={initialMixer.rhodes.pan ?? -0.15}
          onPanDirect={(p) => interactiveAnalysisAudio.setChannelPanDirect("rhodes", p)}
          isMuted={muteSolo.rhodesMuted}
          isSolo={muteSolo.rhodesSolo}
          isDimmed={anySoloActive && !muteSolo.rhodesSolo}
          showSolo={true}
          onToggleMute={handleToggleRhodesMute}
          onToggleSolo={handleToggleRhodesSolo}
          headerIcon={<Sparkles size={13} className="text-neutral-300" />}
          headerExtra={
            onInstrumentChange ? (
              <button
                type="button"
                onClick={() => onInstrumentChange("epiano")}
                className={`w-full py-0.5 mt-1 text-[7.5px] font-mono rounded border transition cursor-pointer ${
                  currentInstrument === "epiano"
                    ? "bg-[#EA580B]/20 border-[#EA580B] text-[#EA580B] font-bold"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {currentInstrument === "epiano" ? "● ACTIVO" : "ELEGIR"}
              </button>
            ) : undefined
          }
          onGainDirect={(v) => interactiveAnalysisAudio.setChannelGainDirect("rhodes", v)}
        />

        <UncontrolledChannelStrip
          id="fader-slider-guitar"
          name="GUITARRA"
          subName="Jazz Archtop"
          channelKey="guitar"
          initialVolume={initialMixer.guitar.volume}
          initialPan={initialMixer.guitar.pan ?? -0.15}
          onPanDirect={(p) => interactiveAnalysisAudio.setChannelPanDirect("guitar", p)}
          isMuted={muteSolo.guitarMuted}
          isSolo={muteSolo.guitarSolo}
          isDimmed={anySoloActive && !muteSolo.guitarSolo}
          showSolo={true}
          onToggleMute={handleToggleGuitarMute}
          onToggleSolo={handleToggleGuitarSolo}
          headerIcon={<Music size={13} className="text-neutral-300" />}
          headerExtra={
            onInstrumentChange ? (
              <button
                type="button"
                onClick={() => onInstrumentChange("guitar")}
                className={`w-full py-0.5 mt-1 text-[7.5px] font-mono rounded border transition cursor-pointer ${
                  currentInstrument === "guitar"
                    ? "bg-[#EA580B]/20 border-[#EA580B] text-[#EA580B] font-bold"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {currentInstrument === "guitar" ? "● ACTIVO" : "ELEGIR"}
              </button>
            ) : undefined
          }
          onGainDirect={(v) => interactiveAnalysisAudio.setChannelGainDirect("guitar", v)}
        />

        {/* ========================================================================= */}
        {/* CANAL DEDICADO: MELODÍA LEAD (VIBRÁFONO) */}
        {/* ========================================================================= */}
        <UncontrolledChannelStrip
          id="fader-slider-melody"
          name="MELODÍA"
          subName="Vibráfono Lead"
          channelKey="melody"
          initialVolume={1.2}
          isMuted={muteSolo.melodyMuted}
          onToggleMute={handleToggleMelodyMute}
          headerIcon={<Sparkles size={13} className="text-[#EA580B]" />}
          onGainDirect={(v) => {
            setLeadMelodyVolume(v);
            window.dispatchEvent(new CustomEvent("melody-volume-changed", { detail: v }));
          }}
        />

        <UncontrolledChannelStrip
          id="fader-slider-livemidi"
          name="LIVE MIDI"
          subName="MIDI Keys / Live"
          channelKey="liveMidi"
          initialVolume={liveMidiController.getVolume()}
          initialPan={liveMidiController.getPan()}
          onPanDirect={(p) => liveMidiController.setPanDirect(p)}
          isMuted={muteSolo.liveMidiMuted}
          onToggleMute={handleToggleLiveMidiMute}
          headerIcon={<Radio size={13} className="text-neutral-300" />}
          headerExtra={
            <div className="flex flex-col gap-0.5 mt-1 px-1 py-0.5 rounded bg-black/60 border border-neutral-800">
              <div className="flex items-center justify-between text-[7px] font-mono text-neutral-400">
                <span className="flex items-center gap-0.5"><Waves size={8} className="text-[#EA580B]" /> REV</span>
                <span id="live-midi-rev-display" className="text-[#EA580B] font-bold">
                  {Math.round(liveMidiController.getReverbWet() * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue={liveMidiController.getReverbWet()}
                onInput={(e) => {
                  const val = parseFloat(e.currentTarget.value);
                  liveMidiController.setReverbWetDirect(val);
                  const el = document.getElementById("live-midi-rev-display");
                  if (el) el.textContent = `${Math.round(val * 100)}%`;
                }}
                className="w-full h-1 bg-neutral-800 rounded cursor-pointer accent-[#EA580B]"
                style={{ accentColor: "#EA580B" }}
              />
            </div>
          }
          onGainDirect={(v) => liveMidiController.setGainDirect(v)}
        />

        {dawTracks.map((track: any) => (
          <UncontrolledChannelStrip
            key={track.id}
            id={`fader-slider-daw-${track.id}`}
            name={track.name || "PISTA MIDI"}
            subName={track.instrument || "Sin instrumento"}
            channelKey={String(track.id)}
            initialVolume={typeof track.volume === "number" ? track.volume : 1.0}
            initialPan={parsePanStringToNumber(track.pan)}
            onPanDirect={(p) => handleUpdateUserTrackPan(track.id, p)}
            isMuted={Boolean(track.isMuted)}
            isSolo={Boolean(track.isSolo)}
            isDimmed={anySoloActive && !track.isSolo}
            showSolo={true}
            onToggleMute={() => handleToggleUserTrackMute(track.id)}
            onToggleSolo={() => handleToggleUserTrackSolo(track.id)}
            accentColor={track.accentColor || "#EA580B"}
            headerIcon={
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: track.accentColor || "#EA580B" }}
              />
            }
            onGainDirect={(v) => handleUpdateUserTrackVolume(track.id, v)}
          />
        ))}

        <UncontrolledChannelStrip
          id="fader-slider-master"
          name="MASTER"
          subName="Main Output"
          channelKey="master"
          initialVolume={initialMixer.masterVolume}
          headerIcon={<Volume2 size={13} className="text-[#EA580B]" />}
          headerExtra={
            <div className="flex flex-col gap-1 mt-1">
              <div className="p-1 rounded bg-black/70 border border-neutral-800 text-[7.5px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Brickwall</span>
                <span className="text-neutral-300 font-bold">20:1 Limiter</span>
              </div>
              <RoomReverbControl
                initialWet={initialMixer.roomReverbWet ?? 0.28}
                onWetChange={(wet) => interactiveAnalysisAudio.setRoomReverbWetDirect(wet)}
              />
            </div>
          }
          onGainDirect={(v) => interactiveAnalysisAudio.setMasterGainDirect(v)}
        />
      </div>
    </div>
  );
}
