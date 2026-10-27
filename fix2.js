import fs from 'fs';
const code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');
console.log(code.substring(code.indexOf('export function bufferToWav'), code.indexOf('export function bufferToWav') + 100));
