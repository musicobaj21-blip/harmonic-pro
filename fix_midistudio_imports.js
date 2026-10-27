const fs = require('fs');
let content = fs.readFileSync('src/components/MidiStudio.tsx', 'utf8');

// Add Settings to lucide-react import
content = content.replace(
  /import \{ (.*) \} from 'lucide-react';/,
  "import { $1, Settings } from 'lucide-react';"
);

// Add StudioSetupModal import
content = content.replace(
  /import \{ ExportModal \} from '\.\/ExportModal';/,
  "import { ExportModal } from './ExportModal';\nimport { StudioSetupModal } from './StudioSetupModal';"
);

fs.writeFileSync('src/components/MidiStudio.tsx', content);
