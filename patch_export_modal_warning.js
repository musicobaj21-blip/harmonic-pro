import fs from 'fs';
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');

const target = `<h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="text-orange-500" />
            Exportación Profesional HQ
          </h2>`;
          
const replacement = `<div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="text-orange-500" />
              Exportación Profesional HQ
            </h2>
            <p className="text-xs text-orange-400 mt-1">Si la descarga no inicia, abre la app en una nueva pestaña (ícono ↗️ arriba a la derecha).</p>
          </div>`;
          
code = code.replace(target, replacement);

// Fix lamejs import just in case
let audioCode = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');
audioCode = audioCode.replace(/import \{ Mp3Encoder \} from 'lamejs';/, 'import * as lamejs from \'lamejs\';');
audioCode = audioCode.replace(/new Mp3Encoder\(/g, 'new (lamejs.Mp3Encoder || lamejs.default.Mp3Encoder || lamejs)(');

fs.writeFileSync('src/utils/exportAudio.ts', audioCode);
fs.writeFileSync('src/components/ExportModal.tsx', code);
console.log('Patched modal and lamejs');
