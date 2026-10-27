import React, { useState, useRef } from "react";
import { UploadCloud, X, Music, CheckCircle, Loader2 } from "lucide-react";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";
import { Song, SongMeasure, RootNote } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface AudioFileAnalyzerProps {
  onImport: (song: Song) => void;
}

export default function AudioFileAnalyzer({ onImport }: AudioFileAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAnalyzing, loadingStep, analyzedData, setAnalyzedData, processAudioFile } = useAudioAnalyzer();
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.includes("audio")) {
      alert("Por favor, sube un archivo de audio válido (MP3, WAV, etc.)");
      return;
    }
    
    setAudioFile(file);
    await processAudioFile(file);
  };

  // Convert analyzedData to Song format
  const convertAndImport = () => {
    if (!analyzedData) return;
    
    const measuresData: SongMeasure[] = [];
    
    // We group by 4 beats per measure as a simplified model
    let currentMeasureChords: string[] = [];
    let currentBeat = 0;
    
    analyzedData.chords.forEach((c) => {
        // Just simplifying to push chords into measures
        currentMeasureChords.push(c.chord);
        currentBeat += c.duration;
        
        if (currentBeat >= 4) {
            measuresData.push({
                id: (measuresData.length + 1).toString(),
                chords: [...currentMeasureChords]
            });
            currentMeasureChords = [];
            currentBeat = 0;
        }
    });
    
    if (currentMeasureChords.length > 0) {
         measuresData.push({
                id: (measuresData.length + 1).toString(),
                chords: [...currentMeasureChords]
            });
    }

    let localAudioUrl = undefined;
    if (audioFile) {
        localAudioUrl = URL.createObjectURL(audioFile);
    }

    const newSong: Song = {
        id: "ai-analyzed-" + Date.now(),
        title: "Análisis IA",
        defaultKey: analyzedData.detectedKey as RootNote,
        style: "Generado por IA",
        tempo: analyzedData.tempoBpm,
        measures: measuresData.length > 0 ? measuresData : [{ id: "1", chords: ["Cmaj7"] }],
        audioUrl: localAudioUrl,
        analyzedChordsData: analyzedData.chords,
    };
    
    onImport(newSong);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 flex justify-center items-center gap-2 w-full px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded text-xs border border-indigo-500/50 transition-colors"
      >
        <Music size={16} />
        Subir MP3 (IA)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
            {!isAnalyzing && !analyzedData && (
                <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                >
                <X size={20} />
                </button>
            )}
            
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Motor de Análisis IA</h2>
            
            {!isAnalyzing && !analyzedData && (
                <>
                <p className="text-sm text-zinc-400 mb-6">
                    Sube un archivo de audio para extraer automáticamente los acordes crudos (Acústico) y enviar a nuestra IA para el análisis funcional.
                </p>
                <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                >
                <UploadCloud size={48} className={`mb-4 ${isDragging ? "text-indigo-400" : "text-zinc-600"}`} />
                <p className="text-center text-sm font-medium text-zinc-300">
                    Arrastra tu archivo MP3 aquí o haz clic para explorar
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
                </div>
                </>
            )}

            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center p-12">
                    <Loader2 size={48} className="animate-spin text-indigo-500 mb-6" />
                    
                    <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                       {loadingStep === 'acoustic' && 'Extrayendo acordes (Essentia/Librosa)...'}
                       {loadingStep === 'theory' && 'Calculando teoría musical con IA (LLM)...'}
                    </h3>
                    
                    <div className="w-full bg-zinc-800 rounded-full h-2 mt-4 overflow-hidden">
                        <div className={`bg-indigo-500 h-2 rounded-full transition-all duration-500 ${loadingStep === 'acoustic' ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                </div>
            )}

            {analyzedData && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center p-6 border border-zinc-800 rounded-xl bg-zinc-900/50">
                    <CheckCircle size={48} className="text-emerald-500 mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Análisis Completado</h3>
                    <div className="text-sm text-zinc-400 text-center mb-6">
                        Tonalidad detectada: <span className="font-bold text-white">{analyzedData.detectedKey}</span><br />
                        Tempo: <span className="font-bold text-white">{analyzedData.tempoBpm} BPM</span><br />
                        Progresión: {analyzedData.chords.map(c => c.chord).join(' - ')}
                    </div>
                    
                    <div className="flex gap-4 w-full">
                        <button
                          onClick={() => {setAnalyzedData(null)}}
                          className="flex-1 py-2 px-4 rounded text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                        >
                          Analizar Otro
                        </button>
                        <button
                          onClick={convertAndImport}
                          className="flex-1 py-2 px-4 rounded text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                        >
                          Importar Partitura
                        </button>
                    </div>
                </div>
            )}

            {!isAnalyzing && !analyzedData && (
                <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
