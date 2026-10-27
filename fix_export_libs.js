import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/export function exportToMP3\([\s\S]*?export function exportToMIDI/m, `export function exportToMP3(audioBuffer: AudioBuffer): Blob {
  let Mp3Encoder = (lamejs as any).Mp3Encoder;
  if (!Mp3Encoder && (lamejs as any).default) Mp3Encoder = (lamejs as any).default.Mp3Encoder;
  if (!Mp3Encoder) {
     throw new Error("Librería de compresión MP3 no disponible en este entorno. (lamejs=" + typeof lamejs + ")");
  }
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
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

export function exportToMIDI`);

code = code.replace(/export function exportToMIDI\([\s\S]*?\n\}/m, `export function exportToMIDI(tracks: Track[], bpm: number): Blob {
  let MW = MidiWriter;
  if (!MW || !(MW as any).Track) MW = (MidiWriter as any).default;
  if (!MW || !(MW as any).Track) MW = MidiWriter as any;
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
