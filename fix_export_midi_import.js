import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace("const MidiWriterTracks: any[] = [];", "import MidiWriter from 'midi-writer-js/browser/midiwriter.js';\nconst MidiWriterTracks: any[] = [];");
code = code.replace(/MW = \(window as any\)\.MidiWriter/g, 'MW = MidiWriter');
code = code.replace(/console.log\('MIDIWRITER IS'[^;]+;/g, '');

fs.writeFileSync('src/utils/exportAudio.ts', code);
