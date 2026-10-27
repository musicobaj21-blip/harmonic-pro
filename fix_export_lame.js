import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace("import * as lamejs from 'lamejs';\n", "");
code = code.replace(/lamejs/g, "(window as any).lamejs");

fs.writeFileSync('src/utils/exportAudio.ts', code);
