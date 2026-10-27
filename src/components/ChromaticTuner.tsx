import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Mic, MicOff, Settings2, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

const noteStrings = [
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

function getNoteFromFrequency(frequency: number, a4Frequency: number) {
  const noteNum = 12 * Math.log2(frequency / a4Frequency);
  return Math.round(noteNum) + 69;
}

function getFrequencyFromNote(note: number, a4Frequency: number) {
  return a4Frequency * Math.pow(2, (note - 69) / 12);
}

function getCents(frequency: number, note: number, a4Frequency: number) {
  return Math.floor(
    1200 * Math.log2(frequency / getFrequencyFromNote(note, a4Frequency)),
  );
}

// Time-domain autocorrelation algorithm
// Algoritmo YIN (Pitch Tracking) optimizado para bajos de rango extendido y alta precisión
function autoCorrelate(buf: Float32Array, sampleRate: number) {
  // 1. RMS para regla de silencio
  let rms = 0;
  for (let i = 0; i < buf.length; i++) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.005) return -1; // Sensibilidad mejorada (0.005 en vez de 0.008)

  // 2. Configurar límites para YIN
  const maxPeriod = Math.floor(sampleRate / 20);  // Rango inferior: ~20Hz
  const minPeriod = Math.floor(sampleRate / 1500); // Rango superior: ~1500Hz
  
  // Tamaño de ventana (W) más largo para capturar mejor las formas de onda lentas de sub-bajos
  const W = Math.min(maxPeriod * 2, buf.length - maxPeriod);
  if (W <= 0) return -1;

  const yinBuffer = new Float32Array(maxPeriod);

  // Paso 1: Función de diferencia (Difference function)
  for (let tau = 0; tau < maxPeriod; tau++) {
    let delta = 0;
    for (let i = 0; i < W; i++) {
      const diff = buf[i] - buf[i + tau];
      delta += diff * diff;
    }
    yinBuffer[tau] = delta;
  }

  // Paso 2: Función de diferencia normalizada acumulativa media (CMND)
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < maxPeriod; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = (yinBuffer[tau] * tau) / (runningSum || 1);
  }

  // Paso 3: Búsqueda del umbral absoluto
  const threshold = 0.2; // Umbral aumentado para ser más tolerante con notas muy graves llenas de inarmonicidad
  let tauEstimate = -1;
  for (let tau = minPeriod; tau < maxPeriod; tau++) {
    if (yinBuffer[tau] < threshold) {
      // Buscar el mínimo local en la depresión actual
      while (tau + 1 < maxPeriod && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }

  // Fallback: si no cruzó el umbral, usar el mínimo global
  if (tauEstimate === -1) {
    let minVal = Infinity;
    for (let tau = minPeriod; tau < maxPeriod; tau++) {
      if (yinBuffer[tau] < minVal) {
        minVal = yinBuffer[tau];
        tauEstimate = tau;
      }
    }
    if (minVal > 0.5) return -1; // Tolerancia aumentada a 0.5
  }

  // Paso 4: Interpolación parabólica
  let betterTau = tauEstimate;
  if (tauEstimate > 0 && tauEstimate < maxPeriod - 1) {
    const s0 = yinBuffer[tauEstimate - 1];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[tauEstimate + 1];
    const a = (s0 + s2 - 2 * s1) / 2;
    const b = (s2 - s0) / 2;
    if (a > 0) {
      betterTau = tauEstimate - b / (2 * a);
    }
  }

  return sampleRate / betterTau;
}

export default function ChromaticTuner({ isVisible = true }: { isVisible?: boolean } = {}) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [noteStr, setNoteStr] = useState<string>("--");
  const [cents, setCents] = useState<number>(0);
  const [a4Frequency, setA4Frequency] = useState(440);
  const a4Ref = useRef(440);
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    a4Ref.current = a4Frequency;
  }, [a4Frequency]);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [micError, setMicError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const toneAnalyserRef = useRef<Tone.Analyser | null>(null);
  const userMediaRef = useRef<Tone.UserMedia | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Sintetizador dedicado para el feedback auditivo y bandera anti-spam
  const tuneSynthRef = useRef<Tone.Synth | null>(null);
  const hasPlayedTuneSoundRef = useRef<boolean>(false);

  const playTuneConfirmation = async () => {
    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
      }
      if (!tuneSynthRef.current) {
        tuneSynthRef.current = new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.15,
            sustain: 0,
            release: 0.2,
          },
          volume: -14,
        }).toDestination();
      }
      // Emite un ping suave y percusivo en registro agudo
      tuneSynthRef.current.triggerAttackRelease("A5", "16n");
    } catch (err) {
      console.warn("No se pudo emitir el sonido de confirmación:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    // Enumerate audio input devices
    const getDevices = async () => {
      try {
        if (!navigator?.mediaDevices?.enumerateDevices) return;
        const d = await navigator.mediaDevices.enumerateDevices();
        if (!isMounted) return;
        const audioInputs = d.filter((device) => device.kind === "audioinput");
        setDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDeviceId((prev) => prev || audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();

    const handleDeviceChange = () => {
      getDevices();
    };

    if (navigator?.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    }
    return () => {
      isMounted = false;
      if (navigator?.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      }
    };
  }, []);

  const updatePitch = () => {
    if (!analyserRef.current && !toneAnalyserRef.current) return;

    let buffer: Float32Array;
    if (analyserRef.current) {
      const analyser = analyserRef.current;
      const bufferLength = analyser.fftSize;
      buffer = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(buffer);
    } else if (toneAnalyserRef.current) {
      const val = toneAnalyserRef.current.getValue();
      buffer = val instanceof Float32Array ? val : new Float32Array(val as any);
    } else {
      return;
    }

    const sampleRate =
      audioContextRef.current?.sampleRate || Tone.getContext().sampleRate || 44100;
    const acValue = autoCorrelate(buffer, sampleRate);

    if (acValue !== -1) {
      setPitch(acValue);
      const currentA4 = a4Ref.current;
      const noteNum = getNoteFromFrequency(acValue, currentA4);
      const diff = getCents(acValue, noteNum, currentA4);

      setNoteStr(noteStrings[noteNum % 12]);
      setCents(diff);

      // Feedback auditivo con bloqueo anti-spam:
      if (Math.abs(diff) < 4) {
        if (!hasPlayedTuneSoundRef.current) {
          hasPlayedTuneSoundRef.current = true;
          playTuneConfirmation();
        }
      } else if (Math.abs(diff) > 10) {
        // La cuerda se desafinó: resetear bandera para permitir aviso al volver a afinar
        hasPlayedTuneSoundRef.current = false;
      }
    } else {
      // Silencio o cambio de cuerda: resetear bandera para el siguiente ataque
      hasPlayedTuneSoundRef.current = false;
    }

    if (!isVisibleRef.current) {
      animationRef.current = null;
      return;
    }
    animationRef.current = requestAnimationFrame(updatePitch);
  };

  useEffect(() => {
    if (!isVisible && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    } else if (isVisible && isActive && !animationRef.current) {
      animationRef.current = requestAnimationFrame(updatePitch);
    }
  }, [isVisible, isActive]);

  const startTuner = async () => {
    setMicError(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicError(t("tuner.microphoneError") || "Micrófono no soportado en este navegador.");
      return;
    }

    // CRÍTICO: Solicitar el permiso de micrófono de forma SÍNCRONA en el primer tick del evento click
    // para que Chrome (especialmente en modo Incógnito o dentro de un iframe) no invalide el User Gesture
    const validDeviceId =
      selectedDeviceId && selectedDeviceId !== "default" && selectedDeviceId !== "communications"
        ? selectedDeviceId
        : undefined;

    const initialMediaPromise = navigator.mediaDevices.getUserMedia(
      validDeviceId
        ? {
            audio: {
              deviceId: { ideal: validDeviceId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          }
        : {
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          }
    );

    // Disparar Tone.start() en paralelo dentro del mismo gesto de usuario
    const toneStartPromise = Tone.start().catch((toneErr) => {
      console.warn("Aviso al iniciar Tone.start():", toneErr);
    });

    // Limpiar sesión previa de micrófono si existiera
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (userMediaRef.current) {
      try {
        userMediaRef.current.close();
        userMediaRef.current.dispose();
      } catch (_) {}
      userMediaRef.current = null;
    }
    if (toneAnalyserRef.current) {
      try {
        toneAnalyserRef.current.dispose();
      } catch (_) {}
      toneAnalyserRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch (_) {}
      audioContextRef.current = null;
    }

    try {
      await toneStartPromise;

      let stream: MediaStream | null = null;
      try {
        stream = await initialMediaPromise;
      } catch (firstErr) {
        // Fallback inmediato a { audio: true } estándar o Tone.UserMedia
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (basicErr) {
          const mic = new Tone.UserMedia();
          await mic.open();
          userMediaRef.current = mic;
          const toneAnalyser = new Tone.Analyser("waveform", 4096);
          toneAnalyserRef.current = toneAnalyser;
          mic.connect(toneAnalyser);
        }
      }

      if (stream) {
        streamRef.current = stream;

        // Crear un AudioContext nativo dedicado y garantizar que esté en estado 'running'
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx: AudioContext = new AudioCtxClass();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);

        // Filtro pasa-bajos suave para limpiar ruido de dedos y armónicos agudos
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 8192;

        source.connect(filter);
        filter.connect(analyser);

        analyserRef.current = analyser;
      }

      // Actualizar lista de dispositivos una vez concedido el permiso
      if (navigator?.mediaDevices?.enumerateDevices) {
        navigator.mediaDevices
          .enumerateDevices()
          .then((d) => {
            const audioInputs = d.filter((device) => device.kind === "audioinput");
            if (audioInputs.length > 0) {
              setDevices(audioInputs);
              setSelectedDeviceId((prev) => prev || audioInputs[0].deviceId);
            }
          })
          .catch(() => {});
      }

      setIsActive(true);
      updatePitch();
    } catch (error: any) {
      console.error("Detalle del error de micrófono:", error);
      const errName = error?.name || "";
      const errMsg = error?.message || "";
      const isInIframe = (() => {
        try {
          return window.self !== window.top;
        } catch (_) {
          return true;
        }
      })();

      if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errName === "SecurityError" ||
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes(" policy")
      ) {
        if (isInIframe && window.matchMedia && window.navigator) {
          setMicError(
            "El navegador o el modo Incógnito bloqueó el micrófono dentro de la vista previa. Haz clic en el ícono de ajustes junto a la URL para permitir el Micrófono, o abre la app en una pestaña normal."
          );
        } else {
          setMicError(
            "Permiso de micrófono bloqueado por el navegador. Permite el acceso al micrófono en el ícono junto a la barra de direcciones."
          );
        }
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setMicError("No se detectó ningún micrófono conectado al equipo.");
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setMicError("El micrófono está siendo utilizado de forma exclusiva por otra aplicación.");
      } else {
        setMicError(
          `${t("tuner.microphoneError") || "No se pudo acceder al micrófono."}${errName ? ` (${errName})` : ""}`
        );
      }
      stopTuner();
    }
  };

  const stopTuner = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (userMediaRef.current) {
      try {
        userMediaRef.current.close();
        userMediaRef.current.dispose();
      } catch (_) {}
      userMediaRef.current = null;
    }
    if (toneAnalyserRef.current) {
      try {
        toneAnalyserRef.current.dispose();
      } catch (_) {}
      toneAnalyserRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch (_) {}
      audioContextRef.current = null;
    }
    hasPlayedTuneSoundRef.current = false;
    setIsActive(false);
    setPitch(null);
    setNoteStr("--");
    setCents(0);
  };

  useEffect(() => {
    return () => {
      stopTuner(); // Cleanup estricto al desmontar el componente
      if (tuneSynthRef.current) {
        try {
          tuneSynthRef.current.dispose();
        } catch (_) {}
        tuneSynthRef.current = null;
      }
    };
  }, []);

  // UI calculations
  const isInTune = cents >= -3 && cents <= 3 && pitch !== null;
  const colorClass = isInTune
    ? "text-emerald-400"
    : pitch !== null
      ? "text-orange-400"
      : "text-neutral-500";
  const borderColorClass = isInTune ? "border-emerald-500/50" : "border-neutral-800";
  const bgActive = isInTune ? "bg-emerald-500/5" : "bg-neutral-950";

  // Calculate dial rotation (-50 to +50 cents -> roughly -45 to +45 degrees)
  const visualCents = Math.max(-50, Math.min(50, cents));
  const rotation = (visualCents / 50) * 45;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-8 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Activity
            className={
              isActive ? "text-orange-400 animate-pulse" : "text-neutral-400"
            }
            size={20}
          />
          <h3 className="text-neutral-200 font-sans font-bold uppercase tracking-wider text-sm">
            <span className="block">{t("tuner.title")}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {devices.length > 0 && (
            <div className="relative">
              <Settings2
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedDeviceId(newId);
                  if (isActive) {
                    stopTuner();
                    setTimeout(() => startTuner(), 100);
                  }
                }}
                className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm rounded-lg pl-9 pr-6 py-2 focus:outline-none focus:border-neutral-500 appearance-none max-w-[170px] truncate cursor-pointer shadow-none"
              >
                {devices.map((device, idx) => (
                  <option key={device.deviceId || `mic-${idx}`} value={device.deviceId}>
                    {device.label ||
                      `Micrófono ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={isActive ? stopTuner : startTuner}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-none ${
              isActive
                ? "bg-red-600 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isActive ? <MicOff size={16} /> : <Mic size={16} />}
            <span className="block">{isActive ? t("tuner.stop") : t("tuner.start")}</span>
          </button>
        </div>
      </div>

      {micError && (
        <div className="w-full mb-6 px-4 py-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-lg text-center font-sans flex flex-col items-center gap-2">
          <span className="block font-medium">{micError}</span>
        </div>
      )}

      {/* Main Tuner Screen */}
      <div
        className={`relative flex flex-col items-center justify-center p-10 rounded-full w-72 h-72 sm:w-80 sm:h-80 transition-colors border shadow-none ${bgActive} ${borderColorClass}`}
      >
        {/* Note Display */}
        <div className="flex flex-col items-center h-28 justify-end mb-2">
          <span
            className={`text-7xl sm:text-8xl leading-none font-bold font-sans transition-colors duration-150 ${colorClass}`}
          >
            <span className="block">{noteStr}</span>
          </span>
          <span className="text-neutral-300 font-mono text-sm tabular-nums mt-2 min-h-[22px]">
            <span className="block">{pitch ? `~ ${Math.round(pitch)} Hz` : t("common.loading")}</span>
          </span>
        </div>

        {/* Dial/Meter */}
        <div className="relative w-full h-12 mt-4 flex justify-center items-end hidden sm:flex">
          {/* Tick marks */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-3">
            <span className="text-xs font-mono tabular-nums text-neutral-400"><span className="block">-50</span></span>
            <span className="text-xs font-mono tabular-nums text-neutral-400"><span className="block">0</span></span>
            <span className="text-xs font-mono tabular-nums text-neutral-400"><span className="block">+50</span></span>
          </div>

          {/* Center line */}
          <div className="absolute bottom-6 w-0.5 h-4 bg-neutral-600 rounded-t-full"></div>

          {/* Needle */}
          <motion.div
            className={`absolute bottom-4 w-1.5 h-20 rounded-full origin-bottom transition-colors duration-200 ${
              isActive
                ? isInTune
                  ? "bg-emerald-500"
                  : "bg-orange-500"
                : "bg-neutral-700"
            }`}
            animate={{ rotate: isActive ? rotation : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          ></motion.div>
        </div>

        {/* Cents numerical readout */}
        <div className="mt-6 text-center">
          <div
            className={`text-2xl font-mono font-bold tabular-nums transition-colors ${colorClass}`}
          >
            <span className="inline-block">
              {isActive && pitch !== null
                ? cents > 0
                  ? `+${cents}`
                  : cents
                : "--"}
            </span>
            <span className="inline-block text-xs font-normal text-neutral-400 uppercase tracking-wider ml-1.5">cents</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-neutral-950 px-5 py-3 rounded-lg border border-neutral-800 mt-6 shadow-none">
        <button 
          onClick={() => setA4Frequency(prev => Math.max(430, prev - 1))}
          className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer shadow-none"
        >
          <span className="block">-</span>
        </button>
        
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-xs text-neutral-400 font-semibold tracking-wider uppercase mb-0.5">
            <span className="block">Calibración A4</span>
          </span>
          <span className="text-lg text-white font-mono font-bold tabular-nums">
            <span className="block">{a4Frequency} Hz</span>
          </span>
        </div>

        <button 
          onClick={() => setA4Frequency(prev => Math.min(450, prev + 1))}
          className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg w-9 h-9 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer shadow-none"
        >
          <span className="block">+</span>
        </button>
      </div>
    </div>
  );
}
