import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// First, inject processTrackEvents at the top of the file
const processEventsStandalone = `
export const processTrackEvents = (events: any[]) => {
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
    } else if (ev.duration !== undefined) {
       processed.push(ev);
    }
  }
  for (const note in activeNotes) {
     processed.push({ ...activeNotes[note], duration: 500 });
  }
  return processed.sort((a, b) => a.timestamp - b.timestamp);
};
`;

// Insert it after imports
code = code.replace(/import \{ getDrumBuffers \} from '\.\/audio';/, "import { getDrumBuffers } from './audio';\n" + processEventsStandalone);

// Now in exportToMIDI, map the track events using this new function
code = code.replace(/for \(const track of tracks\) \{\n    if \(track\.isMuted \|\| track\.events\.length === 0\) continue;/, `for (const track of tracks) {
    const processedEvents = processTrackEvents(track.events);
    if (track.isMuted || processedEvents.length === 0) continue;`);

// And replace track.events loop with processedEvents loop
code = code.replace(/for \(const ev of track\.events\) \{/g, "for (const ev of processedEvents) {");

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('exportToMIDI patched!');
