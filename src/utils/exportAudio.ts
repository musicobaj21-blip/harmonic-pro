
import { Track } from '../types';
import Soundfont from 'soundfont-player';
import { SOUNDFONT_MAPPING, getLoadedInstrument } from './soundfont';
import { getDrumBuffers } from './audio';


export const processTrackEvents = (events: any[]) => {
  const processed: any[] = [];
  const activeNotes: Record<string, any> = {};

  for (const ev of events) {
    const type = (ev.type || '').toLowerCase();
    
    if (type === 'drum') {
       processed.push({ ...ev, duration: 200 }); 
    } else if (type === 'noteon' && ev.velocity > 0) {
       activeNotes[ev.note] = {
         note: ev.note,
         velocity: ev.velocity,
         timestamp: ev.timestamp
       };
    } else if (type === 'noteoff' || (type === 'noteon' && ev.velocity === 0)) {
       const active = activeNotes[ev.note];
       if (active) {
          processed.push({
             ...active,
             duration: Math.max(10, ev.timestamp - active.timestamp)
          });
          delete activeNotes[ev.note];
       }
    } else if (ev.duration !== undefined) {
       processed.push(ev);
    }
  }

  for (const note in activeNotes) {
     processed.push({ ...activeNotes[note], duration: 500 });
  }

  return processed.sort((a, b) => a.timestamp - b.timestamp);
};



export async function fallbackMixdown(tracks: Track[], bpm: number, exportRange?: any): Promise<AudioBuffer> {
  let maxDuration = 0;
  let hasNonDrum = false;

  const processedTracks = tracks.map(t => {
     const processedEvents = processTrackEvents(t.events);
     if (processedEvents.length > 0 && !t.isMuted) {
        if (t.instrument !== 'drum') {
           hasNonDrum = true;
           const lastEvent = processedEvents[processedEvents.length - 1];
           const end = (lastEvent.timestamp + (lastEvent.duration || 500)) / 1000;
           if (end > maxDuration) maxDuration = end;
        }
     }
     if (t.type === 'audio' && t.audioClips) {
       hasNonDrum = true;
       t.audioClips.forEach((clip: any) => {
           const end = (clip.startTime + clip.duration) / 1000;
           if (end > maxDuration) maxDuration = end;
       });
     }
     return { ...t, events: processedEvents };
  });

  if (!hasNonDrum) maxDuration = 16; else maxDuration += 2;

  for (const pt of processedTracks) {
      if (pt.instrument === 'drum') {
          pt.events = pt.events.filter((ev: any) => (ev.timestamp / 1000) <= maxDuration);
      }
  }

  const totalSeconds = maxDuration + 2;
  const sampleRate = 48000;
  const length = Math.floor(sampleRate * totalSeconds);
  
  const dummyCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const outBuffer = dummyCtx.createBuffer(2, length, sampleRate);
  
  const left = outBuffer.getChannelData(0);
  const right = outBuffer.getChannelData(1);
  const drumBuffers = getDrumBuffers();

  const hasSoloTracks = processedTracks.some(track => track.isSolo === true);
  const activeTracks = processedTracks.filter(track => {
    if (hasSoloTracks) {
      return track.isSolo === true && track.isMuted !== true;
    }
    return track.isMuted !== true;
  });

  for (const track of activeTracks) {
    const vol = track.volume ?? 1.0;
    const panLeft = Math.cos((track.pan + 1) * Math.PI / 4);
    const panRight = Math.sin((track.pan + 1) * Math.PI / 4);

    if (track.instrument === 'drum') {
      for (const event of track.events) {
        const drumMap: Record<string, string> = {
          '36': 'kick', '38': 'snare', '42': 'hihat_closed', '46': 'hihat_open', '51': 'ride',
          '48': 'tom1', '45': 'tom2', '43': 'tom3', '56': 'cowbell', '76': 'jam_block'
        };
        const type = drumMap[String(event.note)] || event.note;
        if (type) {
          const sampleKey = type === 'hihat' ? 'hihat_closed' : type;
          const buffer = drumBuffers[sampleKey];
          if (buffer) {
             const srcL = buffer.getChannelData(0);
             const srcR = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : srcL;
             const startSample = Math.floor((event.timestamp / 1000) * sampleRate);
             const eventVol = (event.velocity / 127) * 1.5 * vol;
             
             for (let i = 0; i < srcL.length; i++) {
                if (startSample + i < length) {
                   left[startSample + i] += srcL[i] * eventVol * panLeft;
                   right[startSample + i] += srcR[i] * eventVol * panRight;
                }
             }
          }
        }
      }
    } else if (track.type === 'audio') {
      // fallbackMixdown no processa clips de audio (se procesan en renderOfflineAudio)
    } else {
       // fallbackMixdown no processa synth (se procesan en renderOfflineAudio)
    }
  }
  return outBuffer;
}

export async function renderOfflineAudio(tracks: Track[], bpm: number, exportRange?: { active: boolean, start: number, end: number | null }): Promise<AudioBuffer> {
  let maxDuration = 0;
  let hasNonDrum = false;
  
  const processedTracks = tracks.map(t => {
     const processedEvents = processTrackEvents(t.events);
     if (processedEvents.length > 0 && !t.isMuted) {
        if (t.instrument !== 'drum') {
           hasNonDrum = true;
           const lastEvent = processedEvents[processedEvents.length - 1];
           const end = (lastEvent.timestamp + (lastEvent.duration || 500)) / 1000;
           if (end > maxDuration) maxDuration = end;
        }
     }
     
     if (t.type === 'audio' && t.audioClips) {
       hasNonDrum = true;
       t.audioClips.forEach((clip: any) => {
           const end = (clip.startTime + clip.duration) / 1000;
           if (end > maxDuration) maxDuration = end;
       });
     }
     
     return { ...t, events: processedEvents };
  });

  if (!hasNonDrum) maxDuration = 16; else maxDuration += 2;
  
  let totalSeconds = maxDuration + 2;
  let renderStartMs = 0;
  let renderEndMs = maxDuration * 1000 + 2000;
  if (exportRange?.active && exportRange.end !== null && exportRange.end > exportRange.start) {
      renderStartMs = exportRange.start;
      renderEndMs = exportRange.end;
      totalSeconds = (renderEndMs - renderStartMs) / 1000;
  }

  for (const pt of processedTracks) {
      if (pt.instrument === 'drum' || pt.type !== 'audio') {
          pt.events = pt.events.filter((ev: any) => ev.timestamp >= renderStartMs && ev.timestamp <= renderEndMs);
      }
  }

  const sampleRate = 48000;
  const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalSeconds), sampleRate);
  const _SOUNDFONT_MAPPING = SOUNDFONT_MAPPING;
  const drumBuffers = getDrumBuffers();
  
  const hasSoloTracks = processedTracks.some(track => track.isSolo === true);
  const activeTracks = processedTracks.filter(track => {
    if (hasSoloTracks) {
      return track.isSolo === true && track.isMuted !== true;
    }
    return track.isMuted !== true;
  });

  await Promise.all(activeTracks.map(async (track) => {

    const inputNode = offlineCtx.createGain();
    inputNode.gain.value = track.volume ?? 1.0;
    
    const panner = offlineCtx.createStereoPanner();
    panner.pan.value = track.pan ?? 0.0;
    
    inputNode.connect(panner);
    panner.connect(offlineCtx.destination);
    
    if (track.type === 'audio') {
      if (track.audioClips) {
        for (const clip of track.audioClips) {
          if (clip.buffer) {
            const clipEndMs = clip.startTime + clip.duration;
            if (clipEndMs <= renderStartMs || clip.startTime >= renderEndMs) continue; // Fuera de rango

            const leftTrimOffsetMs = Math.max(0, renderStartMs - clip.startTime);
            const scheduledStartTimeSec = Math.max(0, clip.startTime - renderStartMs) / 1000;
            const effectiveDurationSec = (Math.min(clipEndMs, renderEndMs) - Math.max(clip.startTime, renderStartMs)) / 1000;

            const clipSource = offlineCtx.createBufferSource();
            clipSource.buffer = clip.buffer;
            
            const clipGain = offlineCtx.createGain(); // VITAL: Nodo exclusivo para los Fades de este clip
            clipSource.connect(clipGain);
            clipGain.connect(inputNode);
            
            const trimStart = (clip.trimStart || 0) + (leftTrimOffsetMs / 1000);
            const fadeIn = clip.fadeIn || 0;
            const fadeOut = clip.fadeOut || 0;
            const baseGain = clip.gain ?? 1.0;
            
            const whenToPlay = scheduledStartTimeSec;
            const clipDuration = effectiveDurationSec;
            
            if (clipDuration > 0) {
              clipSource.start(whenToPlay, trimStart, clipDuration);

              clipGain.gain.cancelScheduledValues(whenToPlay);

              if (fadeIn > 0) {
                clipGain.gain.setValueAtTime(0.0001, whenToPlay);
                clipGain.gain.linearRampToValueAtTime(baseGain, whenToPlay + fadeIn);
              } else {
                clipGain.gain.setValueAtTime(baseGain, whenToPlay);
              }

              if (fadeOut > 0) {
                const fadeOutStartTime = whenToPlay + clipDuration - fadeOut;
                clipGain.gain.setValueAtTime(baseGain, Math.max(whenToPlay, fadeOutStartTime));
                clipGain.gain.linearRampToValueAtTime(0.0001, whenToPlay + clipDuration);
              }
            }
          }
        }
      }
    } else if (track.instrument === 'drum') {
      for (const event of track.events) {
        const drumMap: Record<string, string> = {
          '36': 'kick', '38': 'snare', '42': 'hihat_closed', '46': 'hihat_open', '51': 'ride',
          '48': 'tom1', '45': 'tom2', '43': 'tom3', '56': 'cowbell', '76': 'jam_block'
        };
        const type = drumMap[String(event.note)] || event.note;
        if (type) {
          const sampleKey = type === 'hihat' ? 'hihat_closed' : type;
          const buffer = drumBuffers[sampleKey];
          if (buffer) {
             const source = offlineCtx.createBufferSource();
             source.buffer = buffer;
             const vol = (event.velocity / 127) * 1.5;
             const vGain = offlineCtx.createGain();
             vGain.gain.value = vol;
             source.connect(vGain);
             vGain.connect(inputNode);
             source.start((event.timestamp - renderStartMs) / 1000);
          }
        }
      }
    } else {
       const instName = _SOUNDFONT_MAPPING[track.instrument] || track.instrument;
       const Soundfont = (window as any).Soundfont || require('soundfont-player');
       
       try {
         const player = await Soundfont.instrument(offlineCtx as any, instName as any, {
              format: 'mp3',
              soundfont: 'MusyngKite',
              destination: inputNode as any
         });
         
         if (player) {
             for (const event of track.events) {
                 const startTime = event.timestamp / 1000;
                 const duration = (event.duration || 500) / 1000;
                 const vol = (event.velocity / 127) * 1.5;
                 
                 player.play(event.note, startTime, {
                     duration: duration,
                     gain: vol
                 });
             }
         }
       } catch (err) {
         console.warn('Failed to load instrument in offline context', err);
       }
    }
  }));

  return await offlineCtx.startRendering();
}
export function bufferToWav(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  
  // 24 bits = 3 bytes per sample
  const bytesPerSample = 3; 
  const blockAlign = numOfChan * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = audioBuffer.length * blockAlign;
  
  const length = 44 + dataSize;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  
  const channels = [];
  let offset = 0;
  let pos = 0;
  
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(byteRate);
  setUint16(blockAlign);
  setUint16(24); // 24 bits per sample
  
  setUint32(0x61746164); // "data" chunk
  setUint32(dataSize);
  
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  
  while (offset < audioBuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      
      // 24-bit PCM: max val is 0x7FFFFF (8388607), min val is -0x800000 (-8388608)
      const val = sample < 0 ? sample * 0x800000 : sample * 0x7FFFFF;
      const intVal = val | 0; // cast to 32-bit int
      
      // Write little-endian 3 bytes
      view.setUint8(pos, intVal & 0xFF);
      view.setUint8(pos + 1, (intVal >> 8) & 0xFF);
      view.setUint8(pos + 2, (intVal >> 16) & 0xFF);
      pos += 3;
    }
    offset++;
  }
  
  return new Blob([buffer], { type: "audio/wav" });
  
  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  
  // Intento 1: Descarga oculta en DOM
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Intento 2 (Escape obligatorio para Iframe/AI Studio):
  setTimeout(() => {
    const win = window.open(url, '_blank');
    if (!win) {
      alert("⚠️ Tu navegador bloqueó la ventana emergente. Por favor habilita los popups para descargar tu archivo.");
    } else {
      console.log(`🎵 Archivo ${filename} generado con éxito.`);
    }
  }, 400);
};

export function exportToWAV(audioBuffer: AudioBuffer): Blob {
  if (!audioBuffer) throw new Error("AudioBuffer es inválido o está vacío.");
  return bufferToWav(audioBuffer);
}

export async function exportToMP3(audioBuffer: AudioBuffer, onProgress?: (msg: string) => void): Promise<{blob: Blob, ext: string}> {
  try {
    let lamejsObj = (window as any).lamejs;
    if (!lamejsObj) {
      if (onProgress) onProgress("Cargando codificador MP3 de alta calidad...");
      lamejsObj = await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
        script.onload = () => resolve((window as any).lamejs);
        script.onerror = () => reject(new Error("Error de red cargando lamejs"));
        document.head.appendChild(script);
      });
    }

    if (onProgress) onProgress("Codificando MP3 offline...");
    let Mp3Encoder = lamejsObj.Mp3Encoder || lamejsObj.default?.Mp3Encoder;
    if (!Mp3Encoder) throw new Error("Mp3Encoder not found in lamejs");

    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new Mp3Encoder(channels, sampleRate, 320);
    const mp3Data = [];

    const left = audioBuffer.getChannelData(0);
    const right = channels > 1 ? audioBuffer.getChannelData(1) : left;
    const sampleBlockSize = 1152;
    
    for (let i = 0; i < left.length; i += sampleBlockSize) {
      const leftChunk = left.subarray(i, i + sampleBlockSize);
      const rightChunk = right.subarray(i, i + sampleBlockSize);
      
      const leftBuffer = new Int16Array(leftChunk.length);
      const rightBuffer = new Int16Array(rightChunk.length);
      
      for (let j = 0; j < leftChunk.length; j++) {
        let l = Math.max(-1, Math.min(1, leftChunk[j]));
        let r = Math.max(-1, Math.min(1, rightChunk[j]));
        leftBuffer[j] = l < 0 ? l * 32768 : l * 32767;
        rightBuffer[j] = r < 0 ? r * 32768 : r * 32767;
      }
      
      const mp3buf = mp3encoder.encodeBuffer(leftBuffer, rightBuffer);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    return { blob: new Blob(mp3Data, { type: 'audio/mp3' }), ext: 'mp3' };
    
  } catch (err) {
     console.warn("Fallo el codificador MP3, usando fallback nativo (WebM/AAC)...", err);
     if (onProgress) onProgress("Usando codificador nativo (tiempo real). Por favor espera...");
     
     return new Promise((resolve, reject) => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);
        
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
           mimeType = 'audio/webm';
           if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
            }
        }
        
        let options: any = { audioBitsPerSecond: 128000 };
        if (mimeType) options.mimeType = mimeType;
        const recorder = new MediaRecorder(dest.stream, options);
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => {
           if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
           resolve({
             blob: new Blob(chunks, { type: mimeType || 'audio/webm' }),
             ext: mimeType.includes('mp4') ? 'm4a' : (mimeType.includes('webm') ? 'webm' : 'mp3')
           });
        };
        
        recorder.start();
        source.start();
        
        source.onended = () => {
           recorder.stop();
           ctx.close();
        };
     });
  }
}

export function exportToMIDINative(tracks: Track[], bpm: number, exportRange?: any): Blob {
  function toVLQ(value: number): number[] {
    let buffer = [value & 0x7F];
    while ((value >>= 7)) {
      buffer.unshift((value & 0x7F) | 0x80);
    }
    return buffer;
  }

  function strToBytes(str: string): number[] {
    return str.split('').map(c => c.charCodeAt(0));
  }

  function numToBytes16(num: number): number[] {
    return [(num >> 8) & 0xFF, num & 0xFF];
  }

  function numToBytes32(num: number): number[] {
    return [(num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF];
  }

  
  const hasSoloTracks = tracks.some(track => track.isSolo === true);
  const activeTracks = tracks.filter(track => {
    if (hasSoloTracks) {
      return track.isSolo === true && track.isMuted !== true;
    }
    return track.isMuted !== true;
  });
  const validTracks = activeTracks.filter(t => processTrackEvents(t.events).length > 0);
  if (validTracks.length === 0) throw new Error("No hay pistas con notas para exportar.");
  
  let header = [
    ...strToBytes('MThd'),
    ...numToBytes32(6),
    ...numToBytes16(1),
    ...numToBytes16(validTracks.length),
    ...numToBytes16(480)
  ];

  let tracksData: number[] = [];

  validTracks.forEach((track, index) => {
    let eventsData: number[] = [];
    
    if (index === 0) {
      let microsecondsPerBeat = Math.round(60000000 / bpm);
      eventsData.push(
        0x00, 0xFF, 0x51, 0x03,
        (microsecondsPerBeat >> 16) & 0xFF,
        (microsecondsPerBeat >> 8) & 0xFF,
        microsecondsPerBeat & 0xFF
      );
    }
    
    let trackName = track.name || `Track ${index + 1}`;
    eventsData.push(0x00, 0xFF, 0x03, trackName.length, ...strToBytes(trackName));

    let processedEvents = processTrackEvents(track.events);
    if (exportRange?.active && exportRange.end !== null && exportRange.end > exportRange.start) {
        processedEvents = processedEvents.filter((ev: any) => ev.timestamp >= exportRange.start && ev.timestamp <= exportRange.end);
        processedEvents = processedEvents.map((ev: any) => ({
            ...ev,
            timestamp: ev.timestamp - exportRange.start
        }));
    }
    let midiEvents: any[] = [];

    for (const ev of processedEvents) {
       let tickStart = Math.round((ev.timestamp / 1000) * (bpm / 60) * 480);
       let tickEnd = Math.round(((ev.timestamp + (ev.duration || 500)) / 1000) * (bpm / 60) * 480);
       let vel = Math.min(127, Math.max(1, Math.round((ev.velocity / 127) * 127)));
       
       let numericNote = ev.note;
       if (typeof ev.note === 'string' && track.instrument === 'drum') {
          const reverseDrumMap: Record<string, number> = {
             'kick': 36, 'snare': 38, 'hihat_closed': 42, 'hihat_open': 46, 'ride': 51,
             'tom1': 48, 'tom2': 45, 'tom3': 43, 'cowbell': 56, 'jam_block': 76
          };
          numericNote = reverseDrumMap[ev.note] || 36;
       }
       
       let note = Math.min(127, Math.max(0, numericNote));
       midiEvents.push({ type: 'noteOn', note: note, velocity: vel, tick: tickStart });
       midiEvents.push({ type: 'noteOff', note: note, velocity: 0, tick: tickEnd });
    }

    midiEvents.sort((a, b) => a.tick - b.tick);

    let lastTick = 0;
    let channel = track.instrument === 'drum' ? 9 : index % 16;
    if (channel === 9 && track.instrument !== 'drum') {
      channel = 10;
    }

    for (const ev of midiEvents) {
      let delta = ev.tick - lastTick;
      lastTick = ev.tick;
      eventsData.push(...toVLQ(delta));
      
      if (ev.type === 'noteOn') {
        eventsData.push(0x90 | channel, ev.note, ev.velocity);
      } else {
        eventsData.push(0x80 | channel, ev.note, ev.velocity);
      }
    }

    eventsData.push(0x00, 0xFF, 0x2F, 0x00);

    tracksData.push(
      ...strToBytes('MTrk'),
      ...numToBytes32(eventsData.length),
      ...eventsData
    );
  });

  const midiFileBytes = new Uint8Array([...header, ...tracksData]);
  return new Blob([midiFileBytes], { type: 'audio/midi' });
}
