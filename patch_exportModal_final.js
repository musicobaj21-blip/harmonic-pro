import fs from 'fs';
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');

code = code.replace(/alert\("Error: " \+ e\.message\);/g, 'alert("❌ Error al procesar audio: " + e.message);');

fs.writeFileSync('src/components/ExportModal.tsx', code);
