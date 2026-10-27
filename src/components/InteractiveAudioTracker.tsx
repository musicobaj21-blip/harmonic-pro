import React, { useState, useRef } from 'react';
import { getHarmonicFunctionClasses } from '../utils/analyzer';
import { interactiveAnalysisAudio } from '../utils/interactiveAnalysisAudio';

interface InteractiveAudioTrackerProps {
  audioUrl: string;
  chordsData: any[];
}

export default function InteractiveAudioTracker({ audioUrl, chordsData }: InteractiveAudioTrackerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      interactiveAnalysisAudio.init();
      interactiveAnalysisAudio.connectMediaElement(audioRef.current);
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  return (
    <div className="w-full bg-[#0a0f1a] p-6 rounded-2xl border border-slate-800 mt-6">
      {/* Reproductor de Audio Oculto */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Controles de Reproducción Customizados */}
      <div className="flex items-center gap-4 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <button 
          onClick={togglePlay}
          className="bg-[#EA580B] hover:brightness-110 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(234,88,11,0.4)]"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        
        <div className="flex flex-col">
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Audio Importado</span>
          <span className="text-white font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Grilla Sincronizada (El Tracker) */}
      <div className="w-full bg-[#0f1523]/50 p-4 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="flex flex-wrap gap-3 w-full items-center justify-start">
          {chordsData.map((chordObj, index) => {
            const isActive = currentTime >= chordObj.startTime && currentTime < (chordObj.startTime + chordObj.duration);
            const colors = getHarmonicFunctionClasses(chordObj.functionType);
            
            return (
              <div 
                key={index}
                className={`flex flex-col items-center justify-center p-2 w-[85px] h-[75px] rounded-lg border-2 transition-all duration-200 shrink-0 border-[#EA580B]
                  ${isActive 
                    ? `bg-[#EA580B]/20 scale-110 z-10 shadow-[0_0_20px_rgba(234,88,11,0.2)]` 
                    : 'bg-neutral-900/60 hover:bg-neutral-800'
                  }
                `}
              >
                <span className="text-[10px] font-bold mb-1 text-[#EA580B]">
                  {chordObj.romanNumeral || '-'}
                </span>
                <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {chordObj.chord || chordObj.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function
const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
