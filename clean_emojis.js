import fs from 'fs';

// MidiStudio.tsx
let midiCode = fs.readFileSync('src/components/MidiStudio.tsx', 'utf-8');
midiCode = midiCode.replace(/📥 Exportar Proyecto/g, 'Exportar Proyecto');
fs.writeFileSync('src/components/MidiStudio.tsx', midiCode);

// ExportModal.tsx
let exportCode = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');
exportCode = exportCode.replace(/⏳ /g, '');
fs.writeFileSync('src/components/ExportModal.tsx', exportCode);

// MasterFxModal.tsx
let masterCode = fs.readFileSync('src/components/MasterFxModal.tsx', 'utf-8');
masterCode = masterCode.replace(/✨ /g, '');
fs.writeFileSync('src/components/MasterFxModal.tsx', masterCode);

console.log('Removed emojis');
