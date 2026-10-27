import fs from 'fs';

let code = `import React, { useState } from 'react';
import { X, Download, Music, Headphones, FileCode } from 'lucide-react';
import { renderOfflineAudio, exportToWAV, exportToMP3, exportToMIDI, triggerDownload } from '../utils/exportAudio';
import { Track } from '../types';

interface ExportModalProps {
  onClose: () => void;
  tracks: Track[];
  bpm: number;
  masterFx: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, tracks, bpm, masterFx }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExportWav = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      const buffer = await renderOfflineAudio(tracks, bpm, masterFx);
      const blob = exportToWAV(buffer);
      triggerDownload(blob, "Linus_Harmony_Project.wav");
    } catch (e: any) {
      console.error(e);
      alert("❌ Error al procesar WAV: " + e.message);
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const handleExportMp3 = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      const buffer = await renderOfflineAudio(tracks, bpm, masterFx);
      const blob = exportToMP3(buffer);
      triggerDownload(blob, "Linus_Harmony_Project.mp3");
    } catch (e: any) {
      console.error(e);
      alert("❌ Error al procesar MP3: " + e.message);
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  const handleExportMidi = () => {
    setIsExporting(true);
    setExportStatus("Generando archivo MIDI...");
    try {
      const blob = exportToMIDI(tracks, bpm);
      triggerDownload(blob, "Linus_Harmony_Project.mid");
    } catch (e: any) {
      console.error(e);
      alert("❌ Error al procesar MIDI: " + e.message);
    } finally {
      setIsExporting(false);
      setExportStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="text-orange-500" />
              Exportación Profesional HQ
            </h2>
            <p className="text-xs text-orange-400 mt-1">Si la descarga no inicia, abre la app en una nueva pestaña (ícono ↗️ arriba a la derecha).</p>
          </div>
          <button onClick={onClose} disabled={isExporting} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {exportStatus && (
            <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-400 font-bold text-center animate-pulse">
              {exportStatus}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={handleExportWav} disabled={isExporting} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-xl p-5 flex flex-col items-center text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-orange-500">
                <Music size={32} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WAV Profesional</h3>
              <p className="text-xs text-slate-400">Calidad Estudio / Lossless 44.1kHz</p>
            </button>
            <button onClick={handleExportMp3} disabled={isExporting} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-blue-500">
                <Headphones size={32} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">MP3 Alta Calidad</h3>
              <p className="text-xs text-slate-400">320 kbps - Ligero y con máxima claridad</p>
            </button>
            <button onClick={handleExportMidi} disabled={isExporting} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-xl p-5 flex flex-col items-center text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-purple-500">
                <FileCode size={32} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Archivo MIDI</h3>
              <p className="text-xs text-slate-400">Datos de notas - Ideal para partituras</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};`;

fs.writeFileSync('src/components/ExportModal.tsx', code);
console.log('ExportModal updated!');
