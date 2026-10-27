import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/if \(!lamejs \|\| !lamejs\.Mp3Encoder\) \{/g, `
  const Mp3Encoder = lamejs.Mp3Encoder || lamejs.default?.Mp3Encoder || (lamejs as any);
  if (!Mp3Encoder || typeof Mp3Encoder !== 'function') {
`);
code = code.replace(/const Mp3Encoder = lamejs\.Mp3Encoder \|\| lamejs\.default\?\.Mp3Encoder \|\| lamejs;/g, '');

fs.writeFileSync('src/utils/exportAudio.ts', code);
