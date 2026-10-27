import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

// Replace downloadBlob
const downloadBlobTarget = /export function downloadBlob\(blob: Blob, filename: string\) \{[\s\S]*?\}, 100\);\n\}/;
const downloadBlobReplacement = `export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  // CRÍTICO: Debe agregarse al DOM para funcionar en navegadores modernos e iframes
  document.body.appendChild(a); 
  a.click();
  // Limpieza
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}`;
code = code.replace(downloadBlobTarget, downloadBlobReplacement);

// Add try catch to exportToWAV
const wavTarget = /export function exportToWAV\(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project\.wav"\) \{\n  const blob = bufferToWav\(audioBuffer\);\n  downloadBlob\(blob, filename\);\n\}/;
const wavReplacement = `export function exportToWAV(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project.wav") {
  try {
    if (!audioBuffer) throw new Error("AudioBuffer es inválido o está vacío.");
    const blob = bufferToWav(audioBuffer);
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error(error);
    alert("❌ Error al exportar WAV: " + error.message);
  }
}`;
code = code.replace(wavTarget, wavReplacement);

// Add try catch to exportToMP3
const mp3Target = /export function exportToMP3\(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project\.mp3"\) \{([\s\S]*?)\n\}/;
code = code.replace(mp3Target, (match, p1) => {
  return `export function exportToMP3(audioBuffer: AudioBuffer, filename = "Linus_Harmony_Project.mp3") {
  try {
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
    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error(error);
    alert("❌ Error al exportar MP3: " + error.message);
  }
}`;
});

// Add try catch to exportToMIDI
const midiTarget = /export function exportToMIDI\(tracks: Track\[\], bpm: number, filename = "Linus_Harmony_Project\.mid"\) \{([\s\S]*?)\n\}/;
code = code.replace(midiTarget, (match, p1) => {
  return `export function exportToMIDI(tracks: Track[], bpm: number, filename = "Linus_Harmony_Project.mid") {
  try {
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
    const blob = new Blob([uint8], {type: "audio/midi"});
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error(error);
    alert("❌ Error al exportar MIDI: " + error.message);
  }
}`;
});

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Patched export functions!');
