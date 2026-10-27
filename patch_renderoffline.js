import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// The original renderOfflineAudio is exported after fallbackMixdown. Let's patch it.
const processEventsCode = `
  const processTrackEvents = (events: any[]) => {
    const processed: any[] = [];
    const activeNotes: Record<string, any> = {};

    for (const ev of events) {
      if (ev.type === 'drum') {
         processed.push({ ...ev, duration: 200 }); 
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
      } else if (ev.duration) {
         processed.push(ev);
      }
    }

    for (const note in activeNotes) {
       processed.push({ ...activeNotes[note], duration: 500 });
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
`;

code = code.replace(/export async function renderOfflineAudio\(tracks: Track\[\], bpm: number, masterFx: any\): Promise<AudioBuffer> \{\n  console\.log\("Starting renderOfflineAudio..."\);\n  let maxDuration = 0;\n  tracks\.forEach\(t => \{[\s\S]*?\}\);\n/, `export async function renderOfflineAudio(tracks: Track[], bpm: number, masterFx: any): Promise<AudioBuffer> {
  console.log("Starting renderOfflineAudio...");
${processEventsCode}
`);

// Now replace "for (const track of tracks) {" with "for (const track of processedTracks) {" inside renderOfflineAudio
// However, there could be multiple. Let's just do it securely using string replacement after "Starting renderOfflineAudio..."

// Let's replace tracks with processedTracks inside renderOfflineAudio's loop:
code = code.replace(/for \(const track of tracks\) \{\n    if \(track\.isMuted\)/, "for (const track of processedTracks) {\n    if (track.isMuted)");

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('renderOfflineAudio patched!');
