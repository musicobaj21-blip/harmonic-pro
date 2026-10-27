import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// Modifying exportToWAV to return Blob
code = code.replace(
  /export function exportToWAV\(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project\.wav"\) \{[\s\S]*?\}\n\}/,
  `export function exportToWAV(audioBuffer: AudioBuffer): Blob {
  if (!audioBuffer) throw new Error("AudioBuffer es inválido o está vacío.");
  return bufferToWav(audioBuffer);
}`
);

// Modifying exportToMP3 to return Blob
code = code.replace(
  /export function exportToMP3\(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project\.mp3"\) \{[\s\S]*?downloadBlob\(blob, filename\);\n  \} catch \(error: any\) \{[\s\S]*?\}\n\}/,
  `export function exportToMP3(audioBuffer: AudioBuffer): Blob {
  if (!lamejs || !lamejs.Mp3Encoder) {
     throw new Error("Librería de compresión MP3 no disponible en este entorno.");
  }
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  
  // @ts-ignore
  const Mp3Encoder = lamejs.Mp3Encoder || lamejs.default?.Mp3Encoder || lamejs;
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
}`
);

// Modifying exportToMIDI to return Blob
code = code.replace(
  /export function exportToMIDI\(tracks: Track\[\], bpm: number, filename = "Linus_Harmony_Project\.mid"\) \{[\s\S]*?downloadBlob\(blob, filename\);\n  \} catch \(error: any\) \{[\s\S]*?\}\n\}/,
  `export function exportToMIDI(tracks: Track[], bpm: number): Blob {
  if (!MidiWriter) {
     throw new Error("Librería de exportación MIDI (midi-writer-js) no disponible.");
  }
  const MidiWriterTracks: any[] = [];
  
  for (const track of tracks) {
    if (track.isMuted || track.events.length === 0) continue;
    
    // @ts-ignore
    const midiTrack = new MidiWriter.Track();
    midiTrack.setTempo(bpm);
    midiTrack.addTrackName(track.name);
    for (const ev of track.events) {
       const tick = Math.round((ev.timestamp / 1000) * (bpm / 60) * 128);
       const durationTicks = Math.round((ev.duration / 1000) * (bpm / 60) * 128);
       
       // @ts-ignore
       const noteEvent = new MidiWriter.NoteEvent({
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
  
  // @ts-ignore
  const write = new MidiWriter.Writer(MidiWriterTracks);
  // MidiWriter buildFile() returns a Uint8Array
  const uint8 = write.buildFile();
  return new Blob([uint8], {type: "audio/midi"});
}`
);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Patched exportAudio to return Blobs!');
