import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = `import MidiWriter from 'midi-writer-js';\n` + code;

code = code.replace(/export function exportToMIDI\([\s\S]*?\n\}/m, `export function exportToMIDI(tracks: Track[], bpm: number): Blob {
  const MW = (MidiWriter as any).default || MidiWriter;
  if (!MW || !(MW as any).Track) {
     throw new Error("Librería de exportación MIDI no disponible.");
  }
  const MidiWriterTracks: any[] = [];
  
  for (const track of tracks) {
    const processedEvents = processTrackEvents(track.events);
    if (track.isMuted || processedEvents.length === 0) continue;
    
    const midiTrack = new (MW as any).Track();
    midiTrack.setTempo(bpm);
    midiTrack.addTrackName(track.name);
    for (const ev of processedEvents) {
       const tick = Math.round((ev.timestamp / 1000) * (bpm / 60) * 128);
       const durationTicks = Math.round((ev.duration / 1000) * (bpm / 60) * 128);
       
       const noteEvent = new (MW as any).NoteEvent({
         pitch: [ev.note],
         duration: \`T\${Math.max(1, durationTicks)}\`,
         velocity: Math.round((ev.velocity / 127) * 100),
         channel: track.instrument === 'drum' ? 10 : 1,
         tick: tick
       });
       midiTrack.addEvent(noteEvent);
    }
    MidiWriterTracks.push(midiTrack);
  }
  
  const write = new (MW as any).Writer(MidiWriterTracks);
  const uint8 = write.buildFile();
  return new Blob([uint8], {type: "audio/midi"});
}`);

fs.writeFileSync('src/utils/exportAudio.ts', code);
