import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// We will redefine processTrackEvents globally and replace ALL occurrences.
const correctProcessTrackEvents = `
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
`;

// Replace the standalone export const processTrackEvents
code = code.replace(/export const processTrackEvents = \([\s\S]*?return processed\.sort\(\(a, b\) => a\.timestamp - b\.timestamp\);\n\};\n/, correctProcessTrackEvents);

// Remove the inner const processTrackEvents inside renderOfflineAudio
code = code.replace(/const processTrackEvents = \([\s\S]*?return processed\.sort\(\(a, b\) => a\.timestamp - b\.timestamp\);\n  \};\n/, "");

// Fix maxDuration to ignore empty or muted tracks, AND ignore the 100-bar drum track if it's the only thing making it 4 minutes, wait, let's limit maxDuration
// We want maxDuration to be the max duration of NON-DRUM tracks, plus maybe 2 seconds.
// If there are ONLY drum tracks, then we just export the drum track up to its last event? No, drums has 100 bars.
// If the user hasn't recorded anything on track 1,2,3, but selected a drum pattern, it exports 100 bars.
// Let's cap drums at maxDuration of other tracks. If no other tracks, cap at 8 bars (16 seconds).
code = code.replace(/let maxDuration = 0;\n\s*const processedTracks = tracks\.map\(t => \{[\s\S]*?return \{ \.\.\.t, events: processedEvents \};\n\s*\}\);/, `
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
     // If only drums, limit to 16 seconds (approx 8 bars at 120bpm)
     maxDuration = 16;
  } else {
     maxDuration += 2; // add tail
  }
  
  // Cut drum tracks to maxDuration
  for (const pt of processedTracks) {
      if (pt.instrument === 'drum') {
          pt.events = pt.events.filter((ev: any) => (ev.timestamp / 1000) <= maxDuration);
      }
  }
`);

// Same fix for fallbackMixdown
code = code.replace(/let maxDuration = 0;\n\s*const processedTracks = tracks\.map\(t => \{[\s\S]*?return \{ \.\.\.t, events: processedEvents \};\n\s*\}\);\n\n\s*const totalSeconds = maxDuration \+ 2;/, `
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
`);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Fixed processTrackEvents & maxDuration!');
