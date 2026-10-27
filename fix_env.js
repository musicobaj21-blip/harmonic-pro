import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

const processTrackEventsEnd = code.indexOf('export async function fallbackMixdown');
const bufferToWavStart = code.indexOf('export function bufferToWav');

const before = code.substring(0, processTrackEventsEnd);
const after = code.substring(bufferToWavStart);

const newMiddle = `
export async function fallbackMixdown(tracks: Track[], bpm: number): Promise<AudioBuffer> {
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
     return { ...t, events: processedEvents };
  });

  if (!hasNonDrum) maxDuration = 16; else maxDuration += 2;

  for (const pt of processedTracks) {
      if (pt.instrument === 'drum') {
          pt.events = pt.events.filter((ev: any) => (ev.timestamp / 1000) <= maxDuration);
      }
  }

  const totalSeconds = maxDuration + 2;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * totalSeconds);
  
  const dummyCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const outBuffer = dummyCtx.createBuffer(2, length, sampleRate);
  
  const left = outBuffer.getChannelData(0);
  const right = outBuffer.getChannelData(1);
  const drumBuffers = getDrumBuffers();

  for (const track of processedTracks) {
    if (track.isMuted) continue;
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
    } else {
       let player = (window as any).__SOUNDFONT_PLAYERS?.[track.instrument] || getLoadedInstrument(track.instrument);
       if (!player || !player.buffers) {
           const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
           const instName = SOUNDFONT_MAPPING[track.instrument] || track.instrument;
           player = await Soundfont.instrument(ac as any, instName as any, { format: 'mp3', soundfont: 'MusyngKite' });
       }
       if (player && player.buffers) {
           for (const event of track.events) {
               const buffer = (player as any).buffers[event.note] || (player as any).buffers[String(event.note)];
               if (buffer) {
                   const srcL = buffer.getChannelData(0);
                   const srcR = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : srcL;
                   const startSample = Math.floor((event.timestamp / 1000) * sampleRate);
                   const durationSamples = Math.floor(((event.duration || 500) / 1000) * sampleRate);
                   const releaseSamples = Math.floor(0.1 * sampleRate); // 100ms release
                   const eventVol = (event.velocity / 127) * 1.5 * vol;
                   
                   for (let i = 0; i < srcL.length; i++) {
                      if (startSample + i < length && i < durationSamples + releaseSamples) {
                         let env = 1.0;
                         if (i > durationSamples) {
                            env = 1.0 - ((i - durationSamples) / releaseSamples);
                         }
                         if (env < 0) env = 0;
                         left[startSample + i] += srcL[i] * eventVol * env * panLeft;
                         right[startSample + i] += srcR[i] * eventVol * env * panRight;
                      }
                   }
               }
           }
       }
    }
  }

  // Apply a simple hard limiter to avoid clipping
  for (let i = 0; i < length; i++) {
      left[i] = Math.max(-1, Math.min(1, left[i]));
      right[i] = Math.max(-1, Math.min(1, right[i]));
  }
  
  return outBuffer;
}

export async function renderOfflineAudio(tracks: Track[], bpm: number, masterFx?: any): Promise<AudioBuffer> {
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
     return { ...t, events: processedEvents };
  });

  if (!hasNonDrum) maxDuration = 16; else maxDuration += 2;

  for (const pt of processedTracks) {
      if (pt.instrument === 'drum') {
          pt.events = pt.events.filter((ev: any) => (ev.timestamp / 1000) <= maxDuration);
      }
  }

  const totalSeconds = maxDuration + 2;
  const sampleRate = 44100;
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(2, sampleRate * totalSeconds, sampleRate);
  const drumBuffers = getDrumBuffers();

  const masterLimiter = offlineCtx.createDynamicsCompressor();
  masterLimiter.threshold.value = masterFx?.limiter?.enabled ? masterFx.limiter.threshold : -0.5;
  masterLimiter.knee.value = 0;
  masterLimiter.ratio.value = 20;
  masterLimiter.attack.value = 0.001;
  masterLimiter.release.value = 0.05;

  const masterGlueCompMakeup = offlineCtx.createGain();
  masterGlueCompMakeup.gain.value = masterFx?.glue?.enabled ? Math.pow(10, (masterFx.glue.makeup || 0) / 20) : 1;

  const masterGlueComp = offlineCtx.createDynamicsCompressor();
  masterGlueComp.threshold.value = masterFx?.glue?.enabled ? (masterFx.glue.threshold || 0) : 0;
  masterGlueComp.knee.value = 0;
  masterGlueComp.ratio.value = masterFx?.glue?.enabled ? (masterFx.glue.ratio || 2) : 2;
  masterGlueComp.attack.value = masterFx?.glue?.enabled ? (masterFx.glue.attack || 0.01) : 0.01;
  masterGlueComp.release.value = masterFx?.glue?.enabled ? (masterFx.glue.release || 0.1) : 0.1;

  masterGlueComp.connect(masterGlueCompMakeup);
  masterGlueCompMakeup.connect(masterLimiter);
  masterLimiter.connect(offlineCtx.destination);
  
  const masterInput = masterGlueComp;

  await Promise.all(processedTracks.map(async (track) => {
    if (track.isMuted) return;

    const trackGain = offlineCtx.createGain();
    trackGain.gain.value = track.volume ?? 1.0;

    const panner = offlineCtx.createStereoPanner();
    panner.pan.value = track.pan;

    trackGain.connect(panner);
    panner.connect(masterInput);

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
             const source = offlineCtx.createBufferSource();
             source.buffer = buffer;
             const vol = (event.velocity / 127) * 1.5;
             const vGain = offlineCtx.createGain();
             vGain.gain.value = vol;
             source.connect(vGain);
             vGain.connect(trackGain);
             source.start(event.timestamp / 1000);
          }
        }
      }
    } else {
       let player = (window as any).__SOUNDFONT_PLAYERS?.[track.instrument] || getLoadedInstrument(track.instrument);
       if (!player || !player.buffers) {
           const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
           const instName = SOUNDFONT_MAPPING[track.instrument] || track.instrument;
           player = await Soundfont.instrument(ac as any, instName as any, { format: 'mp3', soundfont: 'MusyngKite' });
       }
       if (player && player.buffers) {
           for (const event of track.events) {
               const startTime = event.timestamp / 1000;
               const duration = (event.duration || 500) / 1000;
               const buffer = (player as any).buffers[event.note] || (player as any).buffers[String(event.note)];
               if (buffer) {
                   const source = offlineCtx.createBufferSource();
                   source.buffer = buffer;
                   const gainNode = offlineCtx.createGain();
                   const vol = (event.velocity / 127) * 1.5;
                   
                   // Properly initialize and automate the envelope
                   gainNode.gain.setValueAtTime(0, 0); 
                   source.connect(gainNode);
                   gainNode.connect(trackGain);
                   source.start(startTime);
                   
                   gainNode.gain.setValueAtTime(vol, startTime);
                   gainNode.gain.setValueAtTime(vol, Math.max(0, startTime + duration - 0.05));
                   gainNode.gain.linearRampToValueAtTime(0, Math.max(0, startTime + duration + 0.1));
                   source.stop(Math.max(0, startTime + duration + 0.1));
               }
           }
       }
    }
  }));

  return await offlineCtx.startRendering();
}
`;

fs.writeFileSync('src/utils/exportAudio.ts', before + newMiddle + after);
