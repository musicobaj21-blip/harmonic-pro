import fs from 'fs';
let code = fs.readFileSync('src/components/MidiStudio.tsx', 'utf-8');

// Remove button from header
code = code.replace(
  /<button\s+onClick=\{\(\) => setShowExportModal\(true\)\}\s+className="text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-3 py-1\.5 rounded-full flex items-center gap-2 shadow-lg transition-all border border-orange-400\/50"\s*>\s*Exportar Proyecto\s*<\/button>/m,
  ''
);

// Add button to Sequencer section
const seqTarget = `<h2 className="text-sm text-slate-400 uppercase tracking-widest font-sans font-bold flex items-center gap-2">\n              SECUENCIADOR MULTIPISTA\n            </h2>`;
const seqReplacement = `<h2 className="text-sm text-slate-400 uppercase tracking-widest font-sans font-bold flex items-center gap-4">
              SECUENCIADOR MULTIPISTA
              <button 
                onClick={() => setShowExportModal(true)}
                className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-lg transition-all border border-orange-400/50 normal-case tracking-normal"
              >
                📥 Exportar
              </button>
            </h2>`;
code = code.replace(seqTarget, seqReplacement);

fs.writeFileSync('src/components/MidiStudio.tsx', code);
console.log('Patched UI');
