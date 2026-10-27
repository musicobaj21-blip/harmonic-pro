import fs from 'fs';
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf-8');

// Also import fallbackMixdown
code = code.replace(/import \{ renderOfflineAudio,/, 'import { fallbackMixdown, renderOfflineAudio,');

code = code.replace(/const handleExportWav = async \(\) => \{[\s\S]*?finally \{/g, `const handleExportWav = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      let buffer;
      try {
        buffer = await renderOfflineAudio(tracks, bpm, masterFx);
      } catch (err) {
        console.warn("OfflineAudioContext failed, falling back to manual JS mixdown...", err);
        setExportStatus("Sandbox restrictivo detectado. Usando motor de renderizado alternativo...");
        buffer = await fallbackMixdown(tracks, bpm);
      }
      const blob = exportToWAV(buffer);
      triggerDownload(blob, "Linus_Harmony_Project.wav");
    } catch (e: any) {
      console.error(e);
      alert("❌ Error al procesar WAV: " + e.message);
    } finally {`);

code = code.replace(/const handleExportMp3 = async \(\) => \{[\s\S]*?finally \{/g, `const handleExportMp3 = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      let buffer;
      try {
        buffer = await renderOfflineAudio(tracks, bpm, masterFx);
      } catch (err) {
        console.warn("OfflineAudioContext failed, falling back to manual JS mixdown...", err);
        setExportStatus("Sandbox restrictivo detectado. Usando motor de renderizado alternativo...");
        buffer = await fallbackMixdown(tracks, bpm);
      }
      const blob = exportToMP3(buffer);
      triggerDownload(blob, "Linus_Harmony_Project.mp3");
    } catch (e: any) {
      console.error(e);
      alert("❌ Error al procesar MP3: " + e.message);
    } finally {`);

fs.writeFileSync('src/components/ExportModal.tsx', code);
console.log('ExportModal patched with fallback!');
