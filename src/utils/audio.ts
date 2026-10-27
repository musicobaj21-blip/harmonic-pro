let audioCtx: AudioContext | null = null;

/**
 * Returns and resumes a singleton instance of the native browser AudioContext
 */
import { ScheduledNote } from "./melody";
import { getLoadedInstrument, playSoundfontNote } from "./soundfont";
import {
  playAcousticBassNote,
  playAcousticPianoNote,
  playAcousticGuitarNote,
  playAcousticEPianoNote,
  playAcousticChord,
  preloadAcousticInstruments,
} from "./acousticInstruments";
export { preloadAcousticInstruments, playAcousticEPianoNote };

let globalSampleRate = 48000;

export async function setAudioContextOptions(sampleRate: number) {
  if (globalSampleRate === sampleRate) return;
  globalSampleRate = sampleRate;
  
  if (audioCtx) {
    if (audioCtx.state !== 'closed') {
      try {
        await audioCtx.close();
      } catch(e) {}
    }
    audioCtx = null;
  }
}

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: globalSampleRate });
    
    if (audioCtx && audioCtx.destination) {
      audioCtx.destination.channelCount = 2;
      audioCtx.destination.channelCountMode = 'explicit';
      audioCtx.destination.channelInterpretation = 'speakers';
    }
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(e => console.warn("Failed to resume AudioContext", e));
  }
  return audioCtx;
}

export async function ensureAudioContextReady(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

export let playbackMasterGain: GainNode | null = null;
export let globalMasterVolume = 1.0;

export function setMasterVolume(vol: number) {
  globalMasterVolume = vol;
  if (playbackMasterGain) {
    playbackMasterGain.gain.setTargetAtTime(0.3 * globalMasterVolume, getAudioContext().currentTime, 0.05);
  }
}
export let masterCompressor: DynamicsCompressorNode | null = null;
export let masterAnalyser: AnalyserNode | null = null;
export function getPlaybackMasterAnalyser(): AnalyserNode {
  getPlaybackMasterGain();
  return masterAnalyser!;
}
export async function initAudioInput(deviceId?: string): Promise<MediaStream | null> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    console.warn("getUserMedia not supported in this browser.");
    return null;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }
    });
    return stream;
  } catch (err) {
    try {
      // Fallback if exact deviceId or constraints fail
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return fallbackStream;
    } catch (fallbackErr) {
      console.warn("Could not get user media audio input:", fallbackErr);
      return null;
    }
  }
}

export let melodyReverbNode: ConvolverNode | null = null; // using a different name to not conflict if needed
export const activeSources: Set<AudioScheduledSourceNode> = new Set();


export let roomReverbNode: ConvolverNode | null = null;
export function getRoomReverb(): ConvolverNode {
  const ctx = getAudioContext();
  if (!roomReverbNode) {
    const length = Math.floor(ctx.sampleRate * 1.6); // 1.6 seconds natural studio room
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      // Natural exponential acoustic room decay
      const decay = Math.pow(1 - i / length, 2.0) * Math.exp(-3.5 * (i / length));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    roomReverbNode = ctx.createConvolver();
    roomReverbNode.buffer = impulse;
    
    // Controlled 12% wet send to provide natural space without muddying the mix
    const reverbLevel = ctx.createGain();
    reverbLevel.gain.value = 0.12;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2800; // Warm studio room roll-off
    
    roomReverbNode.connect(filter);
    filter.connect(reverbLevel);
    reverbLevel.connect(getPlaybackMasterGain());
  }
  return roomReverbNode;
}

export let masterEQNodes: Record<string, BiquadFilterNode> = {};
export let masterGlueComp: DynamicsCompressorNode | null = null;
export let masterGlueCompMakeup: GainNode | null = null;
export let masterLimiter: DynamicsCompressorNode | null = null;

export function updateMasterFx(fx: any) {
  const ctx = getAudioContext();
  const time = ctx.currentTime;
  
  const smoothParam = (param: AudioParam, targetVal: number) => {
    if (!param || !isFinite(targetVal)) return;
    param.setValueAtTime(param.value, time);
    param.linearRampToValueAtTime(targetVal, time + 0.2);
  };

  if (masterEQNodes['lowCut'] && fx && fx.eq) {
     const applyEQ = (band: string) => {
       const b = fx.eq[band];
       if (!b || !masterEQNodes[band]) return;
       
       const freq = typeof b.freq === 'number' ? b.freq : parseFloat(b.freq);
       if (isFinite(freq)) {
         smoothParam(masterEQNodes[band].frequency, freq);
       }
       
       if (b.gain !== undefined && masterEQNodes[band].gain) {
           const gain = typeof b.gain === 'number' ? b.gain : parseFloat(b.gain);
           smoothParam(masterEQNodes[band].gain, fx.eq.enabled && b.enabled ? gain : 0);
       }
       
       if (b.q !== undefined && masterEQNodes[band].Q) {
           const q = typeof b.q === 'number' ? b.q : parseFloat(b.q);
           smoothParam(masterEQNodes[band].Q, q);
       }
       
       if (band === 'lowCut') {
           smoothParam(masterEQNodes[band].frequency, fx.eq.enabled && b.enabled ? freq : 10);
       }
       if (band === 'highCut') {
           smoothParam(masterEQNodes[band].frequency, fx.eq.enabled && b.enabled ? freq : 24000);
       }
     };
     
     applyEQ('lowCut');
     applyEQ('lowShelf');
     applyEQ('lowMid');
     applyEQ('mid1');
     applyEQ('mid2');
     applyEQ('mid3');
     applyEQ('highShelf');
     applyEQ('highCut');
  }
  
  if (masterGlueComp && fx && fx.glue) {
     const threshold = (typeof fx.glue.threshold === 'number' && isFinite(fx.glue.threshold)) ? fx.glue.threshold : 0;
     smoothParam(masterGlueComp.threshold, fx.glue.enabled ? threshold : 0);
     
     // Note: If some of these are undefined, we might need to add them. Let's wrap in try/catch to be safe if they are not exposed in standard DynamicsCompressorNode (attack, release, ratio are standard).
     const ratio = (typeof fx.glue.ratio === 'number' && isFinite(fx.glue.ratio)) ? fx.glue.ratio : 2;
     if (masterGlueComp.ratio) smoothParam(masterGlueComp.ratio, fx.glue.enabled ? ratio : 2);
     
     const attack = (typeof fx.glue.attack === 'number' && isFinite(fx.glue.attack)) ? fx.glue.attack : 0.01;
     if (masterGlueComp.attack) smoothParam(masterGlueComp.attack, fx.glue.enabled ? attack : 0.01);
     
     const release = (typeof fx.glue.release === 'number' && isFinite(fx.glue.release)) ? fx.glue.release : 0.1;
     if (masterGlueComp.release) smoothParam(masterGlueComp.release, fx.glue.enabled ? release : 0.1);
  }
  
  if (masterGlueCompMakeup && fx && fx.glue) {
     const makeup = (typeof fx.glue.makeup === 'number' && isFinite(fx.glue.makeup)) ? fx.glue.makeup : 0;
     const makeupGain = Math.pow(10, makeup / 20);
     smoothParam(masterGlueCompMakeup.gain, fx.glue.enabled ? makeupGain : 1);
  }
  
  if (masterLimiter && fx && fx.limiter) {
     const threshold = (typeof fx.limiter.threshold === 'number' && isFinite(fx.limiter.threshold)) ? fx.limiter.threshold : -0.5;
     smoothParam(masterLimiter.threshold, fx.limiter.enabled ? threshold : -0.5);
  }
}

export function getPlaybackMasterGain(): GainNode {
  const ctx = getAudioContext();
  
  if (!masterAnalyser) {
     masterAnalyser = ctx.createAnalyser();
     masterAnalyser.fftSize = 2048;
     masterAnalyser.channelCount = 2;
     masterAnalyser.channelCountMode = 'explicit';
     masterAnalyser.channelInterpretation = 'speakers';
     
     // CRITICAL: Final Stereo Upmix bridge for macOS / USB Interfaces
     const masterUpmixer = ctx.createGain();
     masterUpmixer.channelCount = 2;
     masterUpmixer.channelCountMode = 'explicit';
     masterUpmixer.channelInterpretation = 'speakers';
     
     const outChannels = 2; // FORCE 2 channels to prevent interface misreporting
     const masterSplitter = ctx.createChannelSplitter(2);
     const masterMerger = ctx.createChannelMerger(outChannels);
     
     masterAnalyser.connect(masterUpmixer);
     masterUpmixer.connect(masterSplitter);
     
     // CRITICAL MAC USB INTERFACE FIX: Clone Left Channel (0) to both Left (0) and Right (1)
     // This guarantees sound on both speakers for interfaces that only recognize Mono on L
     masterSplitter.connect(masterMerger, 0, 0); // L -> L
     if (outChannels > 1) {
        masterSplitter.connect(masterMerger, 0, 1); // L -> R
     }
     
     // MASTER BUS COMPRESSOR: DynamicsCompressorNode justo antes del audioContext.destination
     // Nivelador automático para equilibrar la dinámica y transiciones entre estilos
     if (!masterCompressor) {
        masterCompressor = ctx.createDynamicsCompressor();
        masterCompressor.channelCount = 2;
        masterCompressor.channelCountMode = 'explicit';
        masterCompressor.channelInterpretation = 'speakers';
        masterCompressor.threshold.setValueAtTime(-15, ctx.currentTime);
        masterCompressor.knee.setValueAtTime(30, ctx.currentTime);
        masterCompressor.ratio.setValueAtTime(12, ctx.currentTime);
        masterCompressor.attack.setValueAtTime(0.003, ctx.currentTime);
        masterCompressor.release.setValueAtTime(0.25, ctx.currentTime);
     }

     masterMerger.connect(masterCompressor);
     masterCompressor.connect(ctx.destination);
  }

  if (!masterLimiter) {
     masterLimiter = ctx.createDynamicsCompressor();
     masterLimiter.channelCount = 2;
     masterLimiter.channelCountMode = 'explicit';
     masterLimiter.channelInterpretation = 'speakers';
     masterLimiter.threshold.value = -0.5;
     masterLimiter.knee.value = 0;
     masterLimiter.ratio.value = 20;
     masterLimiter.attack.value = 0.001;
     masterLimiter.release.value = 0.05;
     masterLimiter.connect(masterAnalyser);
  }
  
  if (!masterGlueCompMakeup) {
     masterGlueCompMakeup = ctx.createGain();
     masterGlueCompMakeup.gain.value = 1;
     masterGlueCompMakeup.connect(masterLimiter);
  }
  
  if (!masterGlueComp) {
     masterGlueComp = ctx.createDynamicsCompressor();
     masterGlueComp.channelCount = 2;
     masterGlueComp.channelCountMode = 'explicit';
     masterGlueComp.channelInterpretation = 'speakers';
     masterGlueComp.threshold.value = 0;
     masterGlueComp.knee.value = 0;
     masterGlueComp.ratio.value = 2;
     masterGlueComp.attack.value = 0.03;
     masterGlueComp.release.value = 0.25;
     masterGlueComp.connect(masterGlueCompMakeup);
  }

  if (!masterEQNodes['lowCut']) {
     masterEQNodes['lowCut'] = ctx.createBiquadFilter();
     masterEQNodes['lowCut'].type = 'highpass';
     masterEQNodes['lowCut'].frequency.value = 30;
     
     masterEQNodes['lowShelf'] = ctx.createBiquadFilter();
     masterEQNodes['lowShelf'].type = 'lowshelf';
     masterEQNodes['lowShelf'].frequency.value = 100;
     
     masterEQNodes['mid1'] = ctx.createBiquadFilter();
     masterEQNodes['mid1'].type = 'peaking';
     masterEQNodes['mid1'].frequency.value = 500;
     
     masterEQNodes['mid2'] = ctx.createBiquadFilter();
     masterEQNodes['mid2'].type = 'peaking';
     masterEQNodes['mid2'].frequency.value = 2000;
     
     masterEQNodes['mid3'] = ctx.createBiquadFilter();
     masterEQNodes['mid3'].type = 'peaking';
     masterEQNodes['mid3'].frequency.value = 4000;
     
     masterEQNodes['highShelf'] = ctx.createBiquadFilter();
     masterEQNodes['highShelf'].type = 'highshelf';
     masterEQNodes['highShelf'].frequency.value = 8000;
     
     masterEQNodes['highCut'] = ctx.createBiquadFilter();
     masterEQNodes['highCut'].type = 'lowpass';
     masterEQNodes['highCut'].frequency.value = 20000;

     // connect them
     masterEQNodes['lowCut'].connect(masterEQNodes['lowShelf']);
     masterEQNodes['lowShelf'].connect(masterEQNodes['mid1']);
     masterEQNodes['mid1'].connect(masterEQNodes['mid2']);
     masterEQNodes['mid2'].connect(masterEQNodes['mid3']);
     masterEQNodes['mid3'].connect(masterEQNodes['highShelf']);
     masterEQNodes['highShelf'].connect(masterEQNodes['highCut']);
     masterEQNodes['highCut'].connect(masterGlueComp!);
  }
  
  if (!playbackMasterGain) {
    playbackMasterGain = ctx.createGain();
    playbackMasterGain.channelCount = 2;
    playbackMasterGain.channelCountMode = 'explicit';
    playbackMasterGain.channelInterpretation = 'speakers';
    playbackMasterGain.gain.value = 1.0 * globalMasterVolume; 
    playbackMasterGain.connect(masterEQNodes['lowCut']);
  }
  return playbackMasterGain;
}

// --- CANALES DE MEZCLA INDEPENDIENTES (STUDIO MIXER BUSES & EQ) ---
let drumBusNode: GainNode | null = null;
let bassBusNode: GainNode | null = null;
let bassPannerNode: StereoPannerNode | null = null;
let harmonyBusNode: GainNode | null = null;
let pianoBusNode: GainNode | null = null;
let pianoPannerNode: StereoPannerNode | null = null;
let rhodesBusNode: GainNode | null = null;
let rhodesPannerNode: StereoPannerNode | null = null;
let guitarBusNode: GainNode | null = null;
let guitarPannerNode: StereoPannerNode | null = null;
let harmonyHighpassNode: BiquadFilterNode | null = null;
let bassEQNode: BiquadFilterNode | null = null;

export function getDrumBus(): GainNode {
  const ctx = getAudioContext();
  if (!drumBusNode) {
    drumBusNode = ctx.createGain();
    drumBusNode.gain.value = 0.55;
    drumBusNode.connect(getPlaybackMasterGain());
  }
  return drumBusNode;
}

export function getBassBus(): AudioNode {
  const ctx = getAudioContext();
  if (!bassBusNode) {
    bassEQNode = ctx.createBiquadFilter();
    bassEQNode.type = 'lowpass';
    bassEQNode.frequency.value = 2800; // Redondea el tono y elimina ruido áspero de agudos
    bassEQNode.Q.value = 0.707;

    bassPannerNode = ctx.createStereoPanner();
    bassPannerNode.pan.value = 0.0;

    bassBusNode = ctx.createGain();
    bassBusNode.gain.value = 1.0;

    bassEQNode.connect(bassPannerNode);
    bassPannerNode.connect(bassBusNode);
    bassBusNode.connect(getPlaybackMasterGain());
  }
  return bassEQNode!;
}

export function getBassBusGain(): GainNode {
  getBassBus();
  return bassBusNode!;
}

export function getPianoBus(): AudioNode {
  const ctx = getAudioContext();
  if (!pianoBusNode) {
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 140;
    hpf.Q.value = 0.707;

    pianoPannerNode = ctx.createStereoPanner();
    pianoPannerNode.pan.value = -0.15;

    pianoBusNode = ctx.createGain();
    pianoBusNode.gain.value = 0.28;

    hpf.connect(pianoPannerNode);
    pianoPannerNode.connect(pianoBusNode);
    pianoBusNode.connect(getPlaybackMasterGain());
    return hpf;
  }
  return pianoBusNode;
}

export function getRhodesBus(): AudioNode {
  const ctx = getAudioContext();
  if (!rhodesBusNode) {
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 140;
    hpf.Q.value = 0.707;

    rhodesPannerNode = ctx.createStereoPanner();
    rhodesPannerNode.pan.value = -0.15;

    rhodesBusNode = ctx.createGain();
    rhodesBusNode.gain.value = 0.14;

    hpf.connect(rhodesPannerNode);
    rhodesPannerNode.connect(rhodesBusNode);
    rhodesBusNode.connect(getPlaybackMasterGain());
    return hpf;
  }
  return rhodesBusNode;
}

export function getGuitarBus(): AudioNode {
  const ctx = getAudioContext();
  if (!guitarBusNode) {
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 140;
    hpf.Q.value = 0.707;

    guitarPannerNode = ctx.createStereoPanner();
    guitarPannerNode.pan.value = -0.15;

    guitarBusNode = ctx.createGain();
    guitarBusNode.gain.value = 0.35;

    hpf.connect(guitarPannerNode);
    guitarPannerNode.connect(guitarBusNode);
    guitarBusNode.connect(getPlaybackMasterGain());
    return hpf;
  }
  return guitarBusNode;
}

export function getHarmonyBus(): AudioNode {
  const ctx = getAudioContext();
  if (!harmonyBusNode) {
    harmonyHighpassNode = ctx.createBiquadFilter();
    harmonyHighpassNode.type = 'highpass';
    harmonyHighpassNode.frequency.value = 140;
    harmonyHighpassNode.Q.value = 0.707;

    harmonyBusNode = ctx.createGain();
    harmonyBusNode.gain.value = 0.35;

    harmonyHighpassNode.connect(harmonyBusNode);
    harmonyBusNode.connect(getPlaybackMasterGain());
  }
  return harmonyHighpassNode!;
}

export function getHarmonyBusGain(): GainNode {
  getHarmonyBus();
  return harmonyBusNode!;
}

export function setInstrumentBusVolumes(drumVol: number, bassVol: number, harmonyVol: number) {
  if (drumBusNode) drumBusNode.gain.value = drumVol;
  if (bassBusNode) bassBusNode.gain.value = bassVol;
  if (harmonyBusNode) harmonyBusNode.gain.value = harmonyVol;
}

export function stopAllPlayback() {
  const ctx = getAudioContext();
  if (playbackMasterGain) {
    const now = ctx.currentTime;
    playbackMasterGain.gain.cancelScheduledValues(now);
    playbackMasterGain.gain.setValueAtTime(playbackMasterGain.gain.value, now);
    playbackMasterGain.gain.linearRampToValueAtTime(0, now + 0.02);

    activeSources.forEach(source => {
      try { source.stop(now + 0.025); } catch (e) {}
    });
    activeSources.clear();

    // Re-habilitar ganancia para la siguiente reproducción sin romper conexiones de nodos
    playbackMasterGain.gain.setValueAtTime(1.0 * globalMasterVolume, now + 0.035);
  }
}

interface SynthParams {
  oscType?: OscillatorType; // 'triangle' (default, warm), 'sine'
  strumDelay?: number;      // delay in seconds between notes, e.g. 0.04
  filterCutoff?: number;    // lowpass filter freq
  decayTime?: number;       // total decay in seconds
  instrument?: "guitar" | "epiano" | "piano" | "bass" | "saxophone" | "trumpet" | "violin"; // default epiano
}

/**
 * Synthesizes a note using FM synthesis for Electric Piano or filtered oscillators for Guitar
 */
function playNoteInstrument(ctx: AudioContext, destination: AudioNode, freq: number, startTime: number, params: SynthParams) {
  const instrument = params.instrument || "epiano";
  const decayTime = params.decayTime || (instrument === "epiano" ? 2.5 : 1.6);
  const safeStart = Math.max(startTime, ctx.currentTime + 0.002);
  
  if (instrument === "piano") {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    
    // Mezcla de sine y triangle
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, safeStart);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.001, safeStart);
    
    // Lowpass filter para calidez
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, safeStart);
    filter.frequency.exponentialRampToValueAtTime(700, safeStart + 0.5);
    
    // ADSR de Piano
    const tailDuration = decayTime || 3.0;
    const stopTime = safeStart + tailDuration;
    noteGain.gain.setValueAtTime(0.0001, safeStart);
    noteGain.gain.linearRampToValueAtTime(0.65, safeStart + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.28, safeStart + 0.15);
    noteGain.gain.setTargetAtTime(0.0001, safeStart + 0.15, tailDuration / 3);
    noteGain.gain.setValueAtTime(0.0001, stopTime);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);

    osc.start(safeStart);
    osc2.start(safeStart);
    osc.stop(stopTime + 0.05);
    osc2.stop(stopTime + 0.05);
  } else if (instrument === "bass") {
    // Contrabajo / Bajo acústico
    const osc = ctx.createOscillator();
    const pluck = ctx.createOscillator();
    const pluckGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, safeStart);

    pluck.type = "triangle";
    pluck.frequency.setValueAtTime(freq * 2.2, safeStart);
    pluck.frequency.exponentialRampToValueAtTime(freq, safeStart + 0.04);
    pluckGain.gain.setValueAtTime(0.35, safeStart);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, safeStart + 0.05);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, safeStart);
    filter.frequency.exponentialRampToValueAtTime(140, safeStart + 0.4);
    
    const tailDuration = 2.0;
    noteGain.gain.setValueAtTime(0.0001, safeStart);
    noteGain.gain.linearRampToValueAtTime(1.1, safeStart + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, safeStart + tailDuration);
    
    osc.connect(filter);
    pluck.connect(pluckGain);
    pluckGain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);
    
    osc.start(safeStart);
    pluck.start(safeStart);
    osc.stop(safeStart + tailDuration + 0.1);
    pluck.stop(safeStart + 0.06);
  } else if (instrument === "saxophone") {
    // Saxophone approximation
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    
    osc.type = "sawtooth";
    // Add slight vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 5; // 5Hz vibrato
    lfoGain.gain.value = 5; // pitch variation amount
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.frequency.setValueAtTime(freq, startTime);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.value = 2;
    
    const tailDuration = decayTime;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.1);
    noteGain.gain.setTargetAtTime(0.4, startTime + 0.2, 0.5);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + tailDuration);
    
    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);
    
    lfo.start(startTime);
    osc.start(startTime);
    lfo.stop(startTime + tailDuration + 0.1);
    osc.stop(startTime + tailDuration + 0.1);
  } else if (instrument === "trumpet") {
    // Trumpet approximation
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, startTime);
    // Slight pitch envelope for the attack (lip slur)
    osc.frequency.setValueAtTime(freq * 0.95, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.05);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3000, startTime);
    filter.frequency.exponentialRampToValueAtTime(1500, startTime + 0.1);
    
    const tailDuration = decayTime;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.7, startTime + 0.05);
    noteGain.gain.setTargetAtTime(0.5, startTime + 0.1, 0.5);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + tailDuration);
    
    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);
    
    osc.start(startTime);
    osc.stop(startTime + tailDuration + 0.1);
  } else if (instrument === "violin") {
    // Violin approximation
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Expressive vibrato delayed
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 6;
    lfoGain.gain.setValueAtTime(0, startTime);
    lfoGain.gain.linearRampToValueAtTime(10, startTime + 0.5); // fade in vibrato
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3000, startTime);
    
    const tailDuration = decayTime;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.2); // Slow attack
    noteGain.gain.setTargetAtTime(0.4, startTime + 0.5, 0.5);
    noteGain.gain.linearRampToValueAtTime(0.001, startTime + tailDuration); // Slow release
    
    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);
    
    lfo.start(startTime);
    osc.start(startTime);
    lfo.stop(startTime + tailDuration + 0.1);
    osc.stop(startTime + tailDuration + 0.1);
  } else if (instrument === "epiano") {
    // FM Synthesis for Electric Piano (Rhodes-like) con tono cálido y opaco
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const ratio = 1; 
    carrier.type = "sine";
    carrier.frequency.setValueAtTime(freq, safeStart);
    
    modulator.type = "sine";
    modulator.frequency.setValueAtTime(freq * ratio, safeStart);
    
    const maxModIndex = freq * 1.8; 
    modGain.gain.setValueAtTime(maxModIndex, safeStart);
    modGain.gain.setTargetAtTime(0.0001, safeStart + 0.03, 0.12); 

    // BiquadFilterNode (lowpass a 1000Hz, rango 800Hz-1200Hz) para tono cálido y opaco sin estridencias
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, safeStart);
    filter.Q.setValueAtTime(0.707, safeStart);
    
    // Envolvente ADSR con Release Suave progresivo:
    const noteDuration = decayTime;
    const stopTime = safeStart + noteDuration;
    noteGain.gain.setValueAtTime(0.0001, safeStart);
    noteGain.gain.linearRampToValueAtTime(0.40, safeStart + 0.015); 
    noteGain.gain.setTargetAtTime(0.0001, safeStart + 0.02, noteDuration / 3.5);
    noteGain.gain.setTargetAtTime(0.0001, stopTime, 0.8);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency); 
    
    carrier.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(destination);

    carrier.start(safeStart);
    modulator.start(safeStart);
    // Permitir decaimiento suave sin cortes abruptos ni clics
    carrier.stop(stopTime + 1.8);
    modulator.stop(stopTime + 1.8);
  } else {
    // Guitarra Acústica Cálida (Acoustic Guitar Pluck)
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = params.oscType || "triangle";
    osc.frequency.setValueAtTime(freq, safeStart);
    
    osc2.type = "sine"; 
    osc2.frequency.setValueAtTime(freq * 2, safeStart);

    const detuneCents = (Math.random() - 0.5) * 4;
    osc.detune.setValueAtTime(detuneCents, safeStart);

    const tailDuration = 3.5;
    noteGain.gain.setValueAtTime(0.0001, safeStart);
    noteGain.gain.linearRampToValueAtTime(0.65, safeStart + 0.020);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, safeStart + tailDuration);

    osc.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(destination);

    osc.start(safeStart);
    osc2.start(safeStart);
    osc.stop(safeStart + tailDuration + 0.1);
    osc2.stop(safeStart + tailDuration + 0.1);
  }
}

/**
 * Synthesizes a list of note frequencies simultaneously or in sequence (guitar strum / piano chord)
 */
export function playChordFrequencies(frequencies: number[], params: SynthParams & { startTime?: number } = {}): void {
  const ctx = getAudioContext();
  const instrument = params.instrument === "guitar" ? "guitar" : "piano";
  const strumDelay = params.strumDelay !== undefined ? params.strumDelay : (instrument === "guitar" ? 0.038 : 0.014);
  const now = params.startTime !== undefined ? params.startTime : ctx.currentTime;
  const decayTime = params.decayTime || 1.8;

  playAcousticChord(frequencies, now, decayTime, instrument, strumDelay, 1.15);
}

/**
 * Plays a single pitch frequency
 */
export function playSingleNote(frequency: number, type: OscillatorType = 'sine', volume = 0.2, instrument: 'epiano' | 'guitar' | 'piano' | 'bass' | 'saxophone' | 'trumpet' | 'violin' = 'epiano', pan = 0, destination?: AudioNode): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const vel = (volume / 0.2) * 1.0;

  if (instrument === 'bass') {
    playAcousticBassNote(frequency, now, 1.5, vel, destination);
  } else if (instrument === 'guitar') {
    playAcousticGuitarNote(frequency, now, 1.5, vel, destination);
  } else {
    playAcousticPianoNote(frequency, now, 2.0, vel, destination);
  }
}


let melodyReverb: ConvolverNode | null = null;
export function getMelodyReverb(): ConvolverNode {
  const ctx = getAudioContext();
  if (!melodyReverb) {
    const length = Math.floor(ctx.sampleRate * 1.2); // 1.2 seconds controlled studio reverb
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const n = length - i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 3);
      right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 3);
    }
    melodyReverb = ctx.createConvolver();
    melodyReverb.buffer = impulse;
    
    // Controlled 10% wet signal level (eliminates muddy reverb)
    const reverbLevel = ctx.createGain();
    reverbLevel.gain.value = 0.10;
    melodyReverb.connect(reverbLevel);
    reverbLevel.connect(getPlaybackMasterGain());
  }
  return melodyReverb;
}

export function playMelodyNotes(notes: ScheduledNote[], startTime: number, bpm: number): void {
  const beatDuration = 60 / bpm;
  notes.forEach((n) => {
    if (isNaN(n.freq) || isNaN(n.timeOffset) || isNaN(n.durationBeats)) return;
    const noteStart = startTime + n.timeOffset * beatDuration;
    const noteDuration = Math.max(0.15, n.durationBeats * beatDuration);
    playAcousticPianoNote(n.freq, noteStart, noteDuration, 1.0);
  });
}

export interface BassPlaybackOptions {
  volume?: number;
  muted?: boolean;
}

export function playWalkingBassNotes(
  notes: ScheduledNote[],
  startTime: number,
  bpm: number,
  options: BassPlaybackOptions = {}
): void {
  if (options.muted) return;
  const vol = options.volume !== undefined ? options.volume : 1.0;
  const beatDuration = 60 / bpm;
  notes.forEach((n) => {
    if (isNaN(n.freq) || isNaN(n.timeOffset) || isNaN(n.durationBeats)) return;
    const noteStart = startTime + n.timeOffset * beatDuration;
    playAcousticBassNote(n.freq, noteStart, n.durationBeats, vol * 1.15);
  });
}

import { CompingChord } from "./band";

export interface CompingPlaybackOptions {
  instrument?: 'piano' | 'guitar' | 'epiano';
  volume?: number;
  muted?: boolean;
}

export function playCompingChords(
  chords: CompingChord[],
  startTime: number,
  bpm: number,
  options: CompingPlaybackOptions = {}
): void {
  if (options.muted) return;
  const vol = options.volume !== undefined ? options.volume : 1.0;
  const inst = options.instrument || 'piano';
  const beatDuration = 60 / bpm;

  chords.forEach((c) => {
    if (!c.freqs || c.freqs.length === 0) return;
    const hitsStart = startTime + c.timeOffset * beatDuration;
    const hitsDuration = c.durationBeats <= 0.22
      ? Math.min(0.15, Math.max(0.10, c.durationBeats * beatDuration))
      : Math.max(0.25, c.durationBeats * beatDuration);
    playAcousticChord(c.freqs, hitsStart, hitsDuration, inst, undefined, vol * 0.95);
  });
}



// --- DRUM SYNTHESIS ---

function createNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

const DRUM_WAV_MAP: Record<number, string> = {
  36: '/samples/drums/acoustic_kick_studio.wav',      // Bombo Acústico Profundo
  37: '/samples/drums/rimshot_wood_bossa.wav',        // Aro de Caja / Rimshot Orgánico
  38: '/samples/drums/snare_warm_studio.wav',         // Caja de Estudio Cálida
  42: '/samples/drums/hihat_closed_crisp.wav',        // Hi-Hat Cerrado Nítido
  44: '/samples/drums/hihat_pedal_chick.wav',         // Pedal de Hi-Hat (Chick acústico)
  51: '/samples/drums/ride_cymbal_jazz_bell.wav',     // Platillo Ride con Swing / Campana
  70: '/samples/drums/shaker_latin_soft.wav'          // Shaker Latino Suave
};

const STRING_TO_MIDI_MAP: Record<string, number> = {
  kick: 36,
  snare: 38,
  hihat_closed: 42,
  hihat: 42,
  hihat_open: 46,
  ride: 51,
  tom1: 48,
  tom2: 45,
  tom3: 41,
  cowbell: 56,
  jam_block: 76
};

const drumBuffers: Record<number, AudioBuffer | null> = {};
let drumSamplesLoading = false;
let drumSamplesLoaded = false;

export async function loadDrumSamples() {
  if (drumSamplesLoaded || drumSamplesLoading) return;
  drumSamplesLoading = true;
  
  const ctx = getAudioContext();
  
  try {
    await Promise.all(Object.entries(DRUM_WAV_MAP).map(async ([noteStr, url]) => {
      const note = parseInt(noteStr);
      try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && !contentType.includes('text/html')) {
           const arrayBuffer = await response.arrayBuffer();
           const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
           drumBuffers[note] = audioBuffer;
        } else {
           const fallbackUrls: Record<number, string> = {
             36: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/kick.mp3',
             37: 'https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3',
             38: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/snare.mp3',
             42: 'https://tonejs.github.io/audio/drum-samples/acoustic-kit/hihat.mp3',
             44: 'https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3',
             51: 'https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3',
             70: 'https://tonejs.github.io/audio/drum-samples/CR78/tom1.mp3'
           };
           const fbRes = await fetch(fallbackUrls[note] || fallbackUrls[36]);
           if (fbRes.ok) {
              drumBuffers[note] = await ctx.decodeAudioData(await fbRes.arrayBuffer());
           }
        }
      } catch (err) {
        console.error("Failed to load sample", url, err);
      }
    }));
    drumSamplesLoaded = true;
  } catch (e) {
    console.error('Error loading drum samples:', e);
  } finally {
    drumSamplesLoading = false;
  }
}

export function playDrumSound(typeOrNote: string | number, time: number, velocity: number = 100, pan: number = 0, destination?: AudioNode) {
  const ctx = getAudioContext();
  
  let note = typeof typeOrNote === 'number' ? typeOrNote : STRING_TO_MIDI_MAP[typeOrNote] || parseInt(typeOrNote as string) || 36;
  
  // Algoritmo de Humanización (Groove & Velocity)
  const humanizedVelocity = velocity * (0.85 + Math.random() * 0.15);
  const vol = (humanizedVelocity / 127) * 1.5;
  const humanizedTimeOffset = (Math.random() * 0.01) - 0.005; // -5ms to +5ms
  const t = Math.max(time, ctx.currentTime) + humanizedTimeOffset;

  if (drumBuffers[note]) {
    const source = ctx.createBufferSource();
    source.channelInterpretation = 'speakers';
    source.buffer = ensureStereoBuffer(ctx, drumBuffers[note] as AudioBuffer);
    
    const gain = ctx.createGain();
    gain.channelCount = 2;
    gain.channelCountMode = 'explicit';
    gain.channelInterpretation = 'speakers';
    gain.gain.value = vol;
    
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    source.connect(gain);
    gain.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);

    let lastNode: AudioNode = merger;

    // Apply EQ to brighten everything except the kick
    if (note !== 36) {
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 4000;
      highShelf.gain.value = 8;

      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 250;
      lowShelf.gain.value = -4;

      lastNode.connect(highShelf);
      highShelf.connect(lowShelf);
      lastNode = lowShelf;
    }

    if (destination) {
      lastNode.connect(destination);
    } else {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      lastNode.connect(panner);
      panner.connect(getPlaybackMasterGain());
    }
    
    source.start(Math.max(t, ctx.currentTime));
    activeSources.add(source);
    source.onended = () => {
      activeSources.delete(source);
      source.disconnect();
    };
  } else {
     // STRICTLY FORBIDDEN to use oscillators! Just do nothing if sample not loaded
  }
}

export function getMasterEQFrequencyResponse(freqs: Float32Array, magResponse: Float32Array, phaseResponse: Float32Array) {
  const ctx = getAudioContext();
  
  // Initialize with 1.0
  for (let i = 0; i < freqs.length; i++) magResponse[i] = 1.0;
  
  const tempMag = new Float32Array(freqs.length);
  const tempPhase = new Float32Array(freqs.length);
  
  const applyFilterResp = (node: BiquadFilterNode | undefined) => {
    if (!node) return;
    node.getFrequencyResponse(freqs, tempMag, tempPhase);
    for (let i = 0; i < freqs.length; i++) {
      magResponse[i] *= tempMag[i];
    }
  };
  
  applyFilterResp(masterEQNodes['lowCut']);
  applyFilterResp(masterEQNodes['lowShelf']);
  applyFilterResp(masterEQNodes['mid1']);
  applyFilterResp(masterEQNodes['mid2']);
  applyFilterResp(masterEQNodes['mid3']);
  applyFilterResp(masterEQNodes['highShelf']);
  applyFilterResp(masterEQNodes['highCut']);
}

export const runGenreMastering = async (genre: string, currentFx: any): Promise<any> => {
  const newFx = JSON.parse(JSON.stringify(currentFx));
  
  // Enforce enabled
  newFx.eq.enabled = true;
  newFx.glue.enabled = true;
  newFx.limiter.enabled = true;
  
  if (['urbano', 'electronica', 'metal'].includes(genre)) {
    // Urbano / Electrónica / Metal
    newFx.limiter.threshold = -5; // agresivo
    newFx.glue.threshold = -15;
    newFx.glue.ratio = 4;
    newFx.glue.attack = 0.005;
    newFx.glue.release = 0.05; // release rápido
    newFx.glue.makeup = 4;
    
    // EQ: Bass boost, high boost
    newFx.eq.lowShelf.gain = 3;
    newFx.eq.highShelf.gain = 2;
  } else if (['jazz', 'soul', 'acustico'].includes(genre)) {
    // Jazz / Soul / Acústico
    newFx.limiter.threshold = -1.5; // suave
    newFx.glue.threshold = -10;
    newFx.glue.ratio = 1.5;
    newFx.glue.attack = 0.03; // attack lento
    newFx.glue.release = 0.2;
    newFx.glue.makeup = 2;
    
    // EQ: Warmth +1dB at 100Hz
    newFx.eq.lowShelf.gain = 1;
    newFx.eq.lowShelf.freq = 100;
    newFx.eq.highShelf.gain = 0;
  } else {
    // Pop / Rock / Tropical (default)
    newFx.limiter.threshold = -3;
    newFx.glue.threshold = -12;
    newFx.glue.ratio = 2.5;
    newFx.glue.attack = 0.01;
    newFx.glue.release = 0.1;
    newFx.glue.makeup = 3;
    
    // EQ: Brillo/aire +2.5dB en 10kHz
    newFx.eq.highShelf.gain = 2.5;
    newFx.eq.highShelf.freq = 10000;
  }
  
  // Apply using the smooth function
  updateMasterFx(newFx);
  return newFx;
};
export const getDrumBuffers = () => drumBuffers;

export const detectTrueChannelMode = (audioBuffer: AudioBuffer): 'MONO' | 'STEREO' => {
  if (audioBuffer.numberOfChannels === 1) return 'MONO';
  if (audioBuffer.numberOfChannels > 2) return 'STEREO';

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  const len = left.length;

  const step = Math.max(1, Math.floor(len / 5000));
  let isIdentical = true;

  for (let i = 0; i < len; i += step) {
    if (Math.abs(left[i] - right[i]) > 0.00001) {
      isIdentical = false;
      break;
    }
  }

  return isIdentical ? 'MONO' : 'STEREO';
};

export const applyAudioOutputSink = async (deviceId: string) => {
  if (!deviceId) return;
  try {
    const ctx = getAudioContext();
    if ('setSinkId' in ctx && typeof (ctx as any).setSinkId === 'function') {
      await (ctx as any).setSinkId(deviceId);
      console.log(`AudioContext enrutado correctamente al dispositivo OUT: ${deviceId}`);
    }

    if (ctx && ctx.destination) {
      try { ctx.destination.channelCount = 2; } catch(e) {}
      ctx.destination.channelCountMode = 'explicit';
      ctx.destination.channelInterpretation = 'speakers';
    }

    if (playbackMasterGain) {
      playbackMasterGain.channelCount = 2;
      playbackMasterGain.channelCountMode = 'explicit';
      playbackMasterGain.channelInterpretation = 'speakers';
    }

    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(async (audioEl) => {
      if ('setSinkId' in audioEl && typeof (audioEl as any).setSinkId === 'function') {
        await (audioEl as any).setSinkId(deviceId);
      }
    });
  } catch (error) {
    console.error('Error al cambiar el dispositivo de salida de audio (sinkId):', error);
  }
};


export const ensureStereoBuffer = (audioContext: AudioContext, buffer: AudioBuffer): AudioBuffer => {
  if (!buffer || buffer.numberOfChannels >= 2) return buffer;

  const stereoBuffer = audioContext.createBuffer(
    2,
    buffer.length,
    buffer.sampleRate
  );

  const monoData = buffer.getChannelData(0);
  stereoBuffer.copyToChannel(monoData, 0);
  stereoBuffer.copyToChannel(monoData, 1);

  return stereoBuffer;
};
