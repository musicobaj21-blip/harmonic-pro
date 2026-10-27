import fs from 'fs';
const file = 'src/utils/exportAudio.ts';
let code = fs.readFileSync(file, 'utf-8');

const mp3Index = code.indexOf('export function exportToMP3(audioBuffer: AudioBuffer): Blob {');
if (mp3Index !== -1) {
  code = code.substring(0, mp3Index);
}

const newCode = `
export async function exportToMP3(audioBuffer: AudioBuffer, onProgress?: (msg: string) => void): Promise<{blob: Blob, ext: string}> {
  try {
    let lamejsObj = (window as any).lamejs;
    if (!lamejsObj) {
      if (onProgress) onProgress("Cargando codificador MP3 de alta calidad...");
      lamejsObj = await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
        script.onload = () => resolve((window as any).lamejs);
        script.onerror = () => reject(new Error("Error de red cargando lamejs"));
        document.head.appendChild(script);
      });
    }

    if (onProgress) onProgress("Codificando MP3 offline...");
    let Mp3Encoder = lamejsObj.Mp3Encoder || lamejsObj.default?.Mp3Encoder;
    if (!Mp3Encoder) throw new Error("Mp3Encoder not found in lamejs");

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
    return { blob: new Blob(mp3Data, { type: 'audio/mp3' }), ext: 'mp3' };
    
  } catch (err) {
     console.warn("Fallo el codificador MP3, usando fallback nativo (WebM/AAC)...", err);
     if (onProgress) onProgress("Usando codificador nativo (tiempo real). Por favor espera...");
     
     return new Promise((resolve, reject) => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);
        
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
           mimeType = 'audio/webm';
           if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4'; 
           }
        }
        
        let options: any = { audioBitsPerSecond: 128000 };
        if (mimeType) options.mimeType = mimeType;

        const recorder = new MediaRecorder(dest.stream, options);
        
        const chunks: Blob[] = [];
        recorder.ondataavailable = e => {
           if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
           resolve({
             blob: new Blob(chunks, { type: mimeType || 'audio/webm' }),
             ext: mimeType.includes('mp4') ? 'm4a' : (mimeType.includes('webm') ? 'webm' : 'mp3')
           });
        };
        
        recorder.start();
        source.start();
        
        source.onended = () => {
           recorder.stop();
           ctx.close();
        };
     });
  }
}

export function exportToMIDINative(tracks: Track[], bpm: number): Blob {
  function toVLQ(value: number): number[] {
    let buffer = [value & 0x7F];
    while ((value >>= 7)) {
      buffer.unshift((value & 0x7F) | 0x80);
    }
    return buffer;
  }

  function strToBytes(str: string): number[] {
    return str.split('').map(c => c.charCodeAt(0));
  }
  function numToBytes16(num: number): number[] {
    return [(num >> 8) & 0xFF, num & 0xFF];
  }
  function numToBytes32(num: number): number[] {
    return [(num >> 24) & 0xFF, (num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF];
  }

  const validTracks = tracks.filter(t => !t.isMuted && processTrackEvents(t.events).length > 0);
  if (validTracks.length === 0) throw new Error("No hay pistas con notas para exportar.");
  
  let header = [
    ...strToBytes('MThd'),
    ...numToBytes32(6),
    ...numToBytes16(1),
    ...numToBytes16(validTracks.length),
    ...numToBytes16(480)
  ];

  let tracksData: number[] = [];

  validTracks.forEach((track, index) => {
    let eventsData: number[] = [];
    
    if (index === 0) {
      let microsecondsPerBeat = Math.round(60000000 / bpm);
      eventsData.push(
        0x00, 0xFF, 0x51, 0x03,
        (microsecondsPerBeat >> 16) & 0xFF,
        (microsecondsPerBeat >> 8) & 0xFF,
        microsecondsPerBeat & 0xFF
      );
    }
    
    let trackName = track.name || \`Track \${index + 1}\`;
    eventsData.push(0x00, 0xFF, 0x03, trackName.length, ...strToBytes(trackName));

    const processedEvents = processTrackEvents(track.events);
    let midiEvents: any[] = [];
    for (const ev of processedEvents) {
       let tickStart = Math.round((ev.timestamp / 1000) * (bpm / 60) * 480);
       let tickEnd = Math.round(((ev.timestamp + (ev.duration || 500)) / 1000) * (bpm / 60) * 480);
       let vel = Math.min(127, Math.max(1, Math.round((ev.velocity / 127) * 127)));
       let note = Math.min(127, Math.max(0, ev.note));
       midiEvents.push({ type: 'noteOn', note: note, velocity: vel, tick: tickStart });
       midiEvents.push({ type: 'noteOff', note: note, velocity: 0, tick: tickEnd });
    }
    midiEvents.sort((a, b) => a.tick - b.tick);

    let lastTick = 0;
    let channel = track.instrument === 'drum' ? 9 : index % 16;
    if (channel === 9 && track.instrument !== 'drum') {
      channel = 10;
    }

    for (const ev of midiEvents) {
      let delta = ev.tick - lastTick;
      lastTick = ev.tick;
      eventsData.push(...toVLQ(delta));
      
      if (ev.type === 'noteOn') {
        eventsData.push(0x90 | channel, ev.note, ev.velocity);
      } else {
        eventsData.push(0x80 | channel, ev.note, ev.velocity);
      }
    }

    eventsData.push(0x00, 0xFF, 0x2F, 0x00);

    tracksData.push(
      ...strToBytes('MTrk'),
      ...numToBytes32(eventsData.length),
      ...eventsData
    );
  });

  const midiFileBytes = new Uint8Array([...header, ...tracksData]);
  return new Blob([midiFileBytes], { type: 'audio/midi' });
}
`;

fs.writeFileSync(file, code + newCode);
