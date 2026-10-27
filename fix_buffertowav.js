import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(
  /sample = \(0\.5 \+ sample < 0 \? sample \* 32768 : sample \* 32767\) \| 0;/g,
  "sample = Math.max(-32768, Math.min(32767, sample < 0 ? sample * 32768 : sample * 32767)) | 0;"
);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log("Fixed bufferToWav math");
