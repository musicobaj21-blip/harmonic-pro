import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/if \(!MidiWriter\) \{/g, `
  const MW = (MidiWriter as any).default || MidiWriter;
  if (!MW || !MW.Track) {
`);
code = code.replace(/new MidiWriter\.Track/g, 'new MW.Track');
code = code.replace(/new MidiWriter\.NoteEvent/g, 'new MW.NoteEvent');
code = code.replace(/new MidiWriter\.Writer/g, 'new MW.Writer');

fs.writeFileSync('src/utils/exportAudio.ts', code);
