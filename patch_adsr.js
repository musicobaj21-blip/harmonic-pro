import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/gainNode\.gain\.setValueAtTime\(gainNode\.gain\.value, startTime \+ duration - 0\.05\);/,
  "gainNode.gain.setValueAtTime(gainNode.gain.value, Math.max(0, startTime + duration - 0.05));");
code = code.replace(/gainNode\.gain\.linearRampToValueAtTime\(0, startTime \+ duration \+ 0\.1\);/,
  "gainNode.gain.linearRampToValueAtTime(0, Math.max(0, startTime + duration + 0.1));");
code = code.replace(/source\.stop\(startTime \+ duration \+ 0\.1\);/,
  "source.stop(Math.max(0, startTime + duration + 0.1));");

fs.writeFileSync('src/utils/exportAudio.ts', code);
