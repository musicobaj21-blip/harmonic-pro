import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// The replacement logic for renderOfflineAudio
code = code.replace(/export async function renderOfflineAudio\([\s\S]*?const length = Math\.floor\(sampleRate \* totalSeconds\);/, `export async function renderOfflineAudio(tracks: Track[], bpm: number, masterFx: any): Promise<AudioBuffer> {
  console.log("Starting renderOfflineAudio...");

  let maxDuration = 0;
  let hasNonDrum = false;

  const processedTracks = tracks.map(t => {
     const processedEvents = processTrackEvents(t.events);
     if (processedEvents.length > 0 && !t.isMuted) {
        if (t.instrument !== 'drum') {
           hasNonDrum = true;
           const lastEvent = processedEvents[processedEvents.length - 1];
           const end = (lastEvent.timestamp + lastEvent.duration) / 1000;
           if (end > maxDuration) maxDuration = end;
        }
     }
     return { ...t, events: processedEvents };
  });

  if (!hasNonDrum) {
     maxDuration = 16;
  } else {
     maxDuration += 2;
  }

  for (const pt of processedTracks) {
      if (pt.instrument === 'drum') {
          pt.events = pt.events.filter((ev: any) => (ev.timestamp / 1000) <= maxDuration);
      }
  }

  const totalSeconds = maxDuration;
  const sampleRate = 44100;
  const length = Math.floor(sampleRate * totalSeconds);`);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Fixed renderOfflineAudio properly!');
