import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace("import MidiWriter from 'midi-writer-js';\n", "");
code = code.replace(/MidiWriter/g, "(window as any).MidiWriter");
code = code.replace(/MW = \(window as any\)\.\(window as any\)\.MidiWriter/g, 'MW = (window as any).MidiWriter');
code = code.replace(/MW = \(window as any\)\.MidiWriter/g, 'MW = (window as any).MidiWriter');

fs.writeFileSync('src/utils/exportAudio.ts', code);
