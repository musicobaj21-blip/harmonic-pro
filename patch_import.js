import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/import \{ SOUNDFONT_MAPPING \} from '.\/soundfont';/, "import { SOUNDFONT_MAPPING, getLoadedInstrument } from './soundfont';");
code = code.replace(/require\('.\/soundfont'\).getLoadedInstrument/, "getLoadedInstrument");

fs.writeFileSync('src/utils/exportAudio.ts', code);
