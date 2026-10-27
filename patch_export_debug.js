import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/export async function renderOfflineAudio.*\n/g, 'export async function renderOfflineAudio(tracks: Track[], bpm: number, masterFx: any): Promise<AudioBuffer> {\n  console.log("Starting renderOfflineAudio...");\n');
code = code.replace(/const renderedBuffer = await offlineCtx.startRendering\(\);/g, 'console.log("Starting startRendering...");\n  const renderedBuffer = await offlineCtx.startRendering();\n  console.log("startRendering finished!");');

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('Patched export debug');
