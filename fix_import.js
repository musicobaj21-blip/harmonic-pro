const fs = require('fs');
let content = fs.readFileSync('src/components/MidiStudio.tsx', 'utf8');
content = content.replace("Settings } from 'lucide-react';", "Settings, Magnet } from 'lucide-react';");
fs.writeFileSync('src/components/MidiStudio.tsx', content);
console.log("Fixed import");
