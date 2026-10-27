import React, { useState } from 'react';
import { X, Download, Music, Headphones, FileCode, CheckCircle2 } from 'lucide-react';
import { fallbackMixdown, renderOfflineAudio, exportToWAV, exportToMP3, exportToMIDINative } from '../utils/exportAudio';
import { Track } from '../types';

interface ExportModalProps {
  onClose: () => void;
  tracks: Track[];
  bpm: number;
  masterFx: any;
  exportRange?: { start: number; end: number | null; active: boolean };
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, tracks, bpm, masterFx, exportRange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState<{url: string, filename: string, type: string} | null>(null);

  const handleExportWav = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      let buffer;
      try {
        buffer = await renderOfflineAudio(tracks, bpm, exportRange);
      } catch (err) {
        console.warn("OfflineAudioContext failed, falling back to manual JS mixdown...", err);
        setExportStatus("Sandbox restrictivo detectado. Usando motor de renderizado alternativo...");
        buffer = await fallbackMixdown(tracks, bpm, exportRange);
      }
      const blob = exportToWAV(buffer);
      const url = window.URL.createObjectURL(blob);
      setDownloadReady({ url, filename: "Linus_Harmony_Project.wav", type: 'WAV' });
    } catch (e: any) {
      console.error(e);
      setExportStatus("❌ Error al procesar WAV: " + e.message);
    } finally {
      setIsExporting(false);
      // No limpiamos el status si fue exitoso para que vea que terminó
      if (downloadReady === null && !exportStatus?.includes("Error")) {
          setExportStatus(null);
      }
    }
  };

  const handleExportMp3 = async () => {
    setIsExporting(true);
    setExportStatus("Procesando y renderizando mezcla en calidad de estudio...");
    try {
      let buffer;
      try {
        buffer = await renderOfflineAudio(tracks, bpm, exportRange);
      } catch (err) {
        console.warn("OfflineAudioContext failed, falling back to manual JS mixdown...", err);
        setExportStatus("Sandbox restrictivo detectado. Usando motor de renderizado alternativo...");
        buffer = await fallbackMixdown(tracks, bpm, exportRange);
      }
      const blobInfo = await exportToMP3(buffer, setExportStatus);
      const url = window.URL.createObjectURL(blobInfo.blob);
      setDownloadReady({ url, filename: `Linus_Harmony_Project.${blobInfo.ext}`, type: 'MP3' });
    } catch (e: any) {
      console.error(e);
      setExportStatus("❌ Error al procesar MP3: " + e.message);
    } finally {
      setIsExporting(false);
      if (downloadReady === null && !exportStatus?.includes("Error")) {
          setExportStatus(null);
      }
    }
  };

  const handleExportMidi = () => {
    setIsExporting(true);
    setExportStatus("Generando archivo MIDI...");
    try {
      const blob = exportToMIDINative(tracks, bpm, exportRange);
      const url = window.URL.createObjectURL(blob);
      setDownloadReady({ url, filename: "Linus_Harmony_Project.mid", type: 'MIDI' });
    } catch (e: any) {
      console.error(e);
      setExportStatus("❌ Error al procesar MIDI: " + e.message);
    } finally {
      setIsExporting(false);
      if (downloadReady === null && !exportStatus?.includes("Error")) {
          setExportStatus(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1f2e] border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="text-[#EA580B]" />
              Exportación Profesional HQ
              {exportRange?.active && exportRange.end !== null && exportRange.end > exportRange.start && (
                <span className="ml-4 text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-2 py-1 rounded">
                  [ Rango L-R: {((exportRange.end - exportRange.start) / 1000).toFixed(1)}s ]
                </span>
              )}
            </h2>
          </div>
          <button onClick={onClose} disabled={isExporting} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {exportStatus && !downloadReady && (
            <div className="mb-6 p-4 bg-[#EA580B]/20 border border-[#EA580B]/50 rounded-lg text-[#EA580B] font-bold text-center animate-pulse">
              {exportStatus}
            </div>
          )}

          {downloadReady ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
               <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                 <CheckCircle2 size={48} className="text-green-500" />
               </div>
               <h3 className="text-2xl font-bold text-white">¡Archivo {downloadReady.type} Listo!</h3>
               <p className="text-slate-400">Tu archivo ha sido procesado exitosamente.</p>
               
               <a 
                 href={downloadReady.url} 
                 download={downloadReady.filename}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="bg-[#EA580B] hover:brightness-110 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg shadow-[#EA580B]/30 transition-all hover:scale-105 flex items-center gap-3"
                 onClick={() => {
                   // Intento de forzar apertura si el download falla
                   setTimeout(() => {
                      // Fallback en caso que siga bloqueado
                   }, 500);
                 }}
               >
                 <Download size={24} />
                 Haz Clic Aquí para Descargar
               </a>

               <button onClick={() => setDownloadReady(null)} className="text-slate-400 hover:text-white underline mt-4">
                 Volver a opciones de exportación
               </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={handleExportWav} disabled={isExporting} className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-[#EA580B] rounded-xl p-5 flex flex-col items-center text-center transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-[#EA580B]">
                  <Music size={32} className="text-[#EA580B]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">WAV Profesional</h3>
                <p className="text-xs text-slate-400">💎 Calidad Activa: 24-Bit / 48 kHz Studio PCM</p>
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
          )}
        </div>
      </div>
    </div>
  );
};
