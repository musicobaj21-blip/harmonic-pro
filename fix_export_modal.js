import fs from 'fs';
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');

code = code.replace(
  /const blob = exportToMP3\(buffer\);\n\s*triggerDownload\(blob, "Linus_Harmony_Project\.mp3"\);/m,
  'const blobInfo = await exportToMP3(buffer, setExportStatus);\n      triggerDownload(blobInfo.blob, `Linus_Harmony_Project.${blobInfo.ext}`);'
);

code = code.replace(
  /const blob = exportToMIDI\(tracks, bpm\);\n\s*triggerDownload\(blob, "Linus_Harmony_Project\.mid"\);/m,
  'const blob = exportToMIDINative(tracks, bpm);\n      triggerDownload(blob, "Linus_Harmony_Project.mid");'
);

fs.writeFileSync('src/components/ExportModal.tsx', code);
