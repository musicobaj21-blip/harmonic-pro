import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

const fallbackMixdownCode = `
export async function fallbackMixdown(tracks: Track[], bpm: number): Promise<AudioBuffer> {
  console.log("Using JS Fallback Mixdown...");
  
  // Transform NoteOn / NoteOff into Note objects with duration
  const processTrackEvents = (events: any[]) => {
    const processed: any[] = [];
    const activeNotes: Record<string, any> = {};

    for (const ev of events) {
      if (ev.type === 'drum') {
         processed.push({ ...ev, duration: 200 }); // Default drum duration
      } else if (ev.type === 'noteon' && ev.velocity > 0) {
         activeNotes[ev.note] = {
           note: ev.note,
           velocity: ev.velocity,
           timestamp: ev.timestamp
         };
      } else if (ev.type === 'noteoff' || (ev.type === 'noteon' && ev.velocity === 0)) {
         const active = activeNotes[ev.note];
         if (active) {
            processed.push({
               ...active,
               duration: Math.max(10, ev.timestamp - active.timestamp)
            });
            delete activeNotes[ev.note];
         }
      }
    }

    // Any hanging notes get a default duration
    for (const note in activeNotes) {
       processed.push({
         ...activeNotes[note],
         duration: 500
       });
    }

    return processed.sort((a, b) => a.timestamp - b.timestamp);
  };

  let maxDuration = 0;
  
  const processedTracks = tracks.map(t => {
     const processedEvents = processTrackEvents(t.events);
     if (processedEvents.length > 0) {
        const lastEvent = processedEvents[processedEvents.length - 1];
        const end = (lastEvent.timestamp + lastEvent.duration) / 1000;
        if (end > maxDuration) maxDuration = end;
     }
     return { ...t, events: processedEvents };
  });

  const totalSeconds = maxDuration + 2;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * totalSeconds);
  
  // Create an AudioBuffer using standard context
  const dummyCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const outBuffer = dummyCtx.createBuffer(2, length, sampleRate);
  
  const left = outBuffer.getChannelData(0);
  const right = outBuffer.getChannelData(1);
  
  const drumBuffers = getDrumBuffers();
  
  for (const track of processedTracks) {
    if (track.isMuted) continue;
    
    const vol = track.volume;
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
             const startSample = Math.floor((event.timestamp / 1000) * sampleRate);
             const srcLeft = buffer.getChannelData(0);
             const srcRight = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : srcLeft;
             
             const eventVol = (event.velocity / 127) * 1.5 * vol;
             for (let i = 0; i < srcLeft.length; i++) {
                if (startSample + i < length) {
                   left[startSample + i] += srcLeft[i] * eventVol * panLeft;
                   right[startSample + i] += srcRight[i] * eventVol * panRight;
                }
             }
          }
        }
      }
    } else {
      const player = (window as any).__SOUNDFONT_PLAYERS?.[track.instrument] || getLoadedInstrument(track.instrument);
      if (player && player.buffers) {
        for (const event of track.events) {
          const buffer = player.buffers[event.note] || player.buffers[String(event.note)];
          if (buffer) {
             const startSample = Math.floor((event.timestamp / 1000) * sampleRate);
             const durationSamples = Math.floor((event.duration / 1000) * sampleRate);
             
             const srcLeft = buffer.getChannelData(0);
             const srcRight = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : srcLeft;
             
             const eventVol = (event.velocity / 127) * vol;
             const releaseSamples = Math.floor(0.1 * sampleRate);
             
             for (let i = 0; i < srcLeft.length; i++) {
                if (startSample + i < length && i < durationSamples + releaseSamples) {
                   let env = 1.0;
                   if (i > durationSamples - 1) {
                      env = 1.0 - ((i - durationSamples) / releaseSamples);
                   }
                   if (env < 0) env = 0;
                   left[startSample + i] += srcLeft[i] * eventVol * env * panLeft;
                   right[startSample + i] += srcRight[i] * eventVol * env * panRight;
                }
             }
          }
        }
      }
    }
  }
  
  for (let i = 0; i < length; i++) {
     left[i] = Math.max(-1, Math.min(1, left[i]));
     right[i] = Math.max(-1, Math.min(1, right[i]));
  }
  
  return outBuffer;
}
`;

code = code.replace(/export async function fallbackMixdown[\s\S]*?return outBuffer;\n\}/, fallbackMixdownCode);
fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('fallbackMixdown updated with processTrackEvents!');
