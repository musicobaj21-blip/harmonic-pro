import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

const target = `    } else {
      const sfName = SOUNDFONT_MAPPING[track.instrument] || 'electric_piano_1';
      // @ts-ignore
      const player = await Soundfont.instrument(offlineCtx, sfName, {
        soundfont: 'FluidR3_GM',
        destination: trackOutput
      });
      for (const event of track.events) {
        player.play(event.note, event.timestamp / 1000, {
          duration: event.duration / 1000,
          gain: (event.velocity / 127)
        });
      }
    }`;

const replacement = `    } else {
      const player = (window as any).__SOUNDFONT_PLAYERS?.[track.instrument] || require('./soundfont').getLoadedInstrument(track.instrument);
      
      if (player && player.buffers) {
        for (const event of track.events) {
          const buffer = player.buffers[event.note] || player.buffers[String(event.note)];
          if (buffer) {
             const source = offlineCtx.createBufferSource();
             source.buffer = buffer;
             
             const gainNode = offlineCtx.createGain();
             gainNode.gain.value = event.velocity / 127;
             
             source.connect(gainNode);
             gainNode.connect(trackOutput);
             
             const startTime = event.timestamp / 1000;
             const duration = event.duration / 1000;
             
             source.start(startTime);
             
             // Simple ADSR release for realistic sound
             gainNode.gain.setValueAtTime(gainNode.gain.value, startTime + duration - 0.05);
             gainNode.gain.linearRampToValueAtTime(0, startTime + duration + 0.1);
             source.stop(startTime + duration + 0.1);
          }
        }
      }
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Patched offline rendering!');
