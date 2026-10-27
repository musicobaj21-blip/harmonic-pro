import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

const newMiddle = `
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
       const instName = SOUNDFONT_MAPPING[track.instrument] || track.instrument;
       // Create an instrument specifically for this offline context and route it to our trackGain
       const player = await Soundfont.instrument(offlineCtx as any, instName as any, { 
           format: 'mp3', 
           soundfont: 'MusyngKite',
           destination: trackGain as any
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
    }
  }));

  return await offlineCtx.startRendering();
}
`;

const processTrackEventsEnd = code.indexOf('export async function renderOfflineAudio');
const bufferToWavStart = code.indexOf('export function bufferToWav');

const before = code.substring(0, processTrackEventsEnd);
const after = code.substring(bufferToWavStart);

fs.writeFileSync('src/utils/exportAudio.ts', before + newMiddle + after);
