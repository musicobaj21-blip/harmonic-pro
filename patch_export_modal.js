import fs from 'fs';
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');

code = code.replace(/alert\("Error al exportar WAV"\);/g, 'alert("Error: " + e.message);');
code = code.replace(/alert\("Error al exportar MP3"\);/g, 'alert("Error: " + e.message);');

fs.writeFileSync('src/components/ExportModal.tsx', code);
console.log('Patched export modal errors');
