import React, { useState } from 'react';
import { WaveformDisplay } from './WaveformDisplay';
import { PlayCircle } from 'lucide-react';
import { AudioClip } from '../types';

interface InteractiveAudioClipProps {
  clip: AudioClip;
  trackId: string;
  zoom: number;
  selectedTool: 'pointer' | 'scissors' | 'eraser';
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onCommitChange: (updater: (clip: AudioClip) => AudioClip) => void;
  onSplit: (trackId: string, timeSec: number) => void;
}

export const InteractiveAudioClip: React.FC<InteractiveAudioClipProps> = ({
  clip,
  trackId,
  zoom,
  selectedTool,
  isSelected,
  onSelect,
  onCommitChange,
  onSplit
}) => {
  const [hoverX, setHoverX] = useState<number | null>(null);

  const startDrag = (e: React.MouseEvent, type: 'fadeIn' | 'fadeOut' | 'trimStart' | 'trimEnd' | 'gain' | 'move') => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const startFadeIn = clip.fadeIn || 0;
    const startFadeOut = clip.fadeOut || 0;
    const startGain = clip.gain ?? 1.0;
    const startTrimIn = clip.trimStart || 0;
    const startTrimOffset = clip.trimOffset || 0;
    const startTrimOut = clip.trimEnd || 0;
    const startClipStart = clip.startTime;
    const startDuration = clip.duration;

    const move = (e2: MouseEvent) => {
      const deltaX = e2.clientX - startX;
      const deltaY = startY - e2.clientY;
      const timeDelta = (deltaX / zoom) * 1000; // in milliseconds

      if (type === 'move') {
        const newStartTime = Math.max(0, startClipStart + timeDelta);
        onCommitChange(c => ({ ...c, startTime: newStartTime }));
      } else if (type === 'fadeIn') {
        const newFade = Math.max(0, Math.min(clip.duration, startFadeIn + timeDelta));
        onCommitChange(c => ({ ...c, fadeIn: newFade }));
      } else if (type === 'fadeOut') {
        const newFade = Math.max(0, Math.min(clip.duration, startFadeOut - timeDelta));
        onCommitChange(c => ({ ...c, fadeOut: newFade }));
      } else if (type === 'gain') {
        const newGain = Math.max(0, Math.min(2, startGain + deltaY * 0.02));
        onCommitChange(c => ({ ...c, gain: newGain }));
      } else if (type === 'trimStart') {
        // limit trim to not invert duration
        const maxTimeDelta = startDuration - 10;
        const validTimeDelta = Math.min(timeDelta, maxTimeDelta);
        const newTrimOffset = Math.max(0, startTrimOffset + validTimeDelta);
        onCommitChange(c => ({
          ...c,
          trimOffset: newTrimOffset,
          startTime: startClipStart + validTimeDelta,
          duration: startDuration - validTimeDelta
        }));
      } else if (type === 'trimEnd') {
        const minTimeDelta = -(startDuration - 10);
        const validTimeDelta = Math.max(timeDelta, minTimeDelta);
        const newTrimEnd = Math.max(0, startTrimOut - validTimeDelta);
        onCommitChange(c => ({
          ...c,
          trimEnd: newTrimEnd,
          duration: startDuration + validTimeDelta
        }));
      }
    };

    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const zoomPixelsPerSecond = zoom; // assuming zoom is pixels per second
  const fadeInMs = clip.fadeIn || 0;
  const fadeOutMs = clip.fadeOut || 0;
  const clipDurationMs = clip.duration;
  
  const pFadeIn = clipDurationMs > 0 ? (fadeInMs / clipDurationMs) * 100 : 0;
  const pFadeOut = clipDurationMs > 0 ? (1 - fadeOutMs / clipDurationMs) * 100 : 100;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-sm overflow-hidden flex items-center transition cursor-pointer select-none group/clip shadow-none ${
        isSelected
          ? 'bg-neutral-800 border-2 border-orange-500 z-30'
          : 'bg-neutral-800 border border-neutral-700 hover:border-neutral-500 z-10'
      }`}
      style={{
        left: `${(clip.startTime / 1000) * zoom}px`,
        width: `${(clipDurationMs / 1000) * zoom}px`
      }}
      onMouseDown={(e) => {
        if (selectedTool === 'pointer') {
          // Solamente si es el puntero, iniciamos arrastre de toda la pista
          startDrag(e, 'move');
        }
      }}
      onClick={(e) => {
        if (selectedTool === 'scissors' && hoverX !== null) {
          e.stopPropagation();
          onSplit(trackId, hoverX / zoomPixelsPerSecond);
        } else {
          onSelect(e);
        }
      }}
      onMouseMove={(e) => {
        if (selectedTool === 'scissors') {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoverX(e.clientX - rect.left);
        }
      }}
      onMouseLeave={() => setHoverX(null)}
    >
      <div className="h-4 flex items-center px-1.5 border-b border-orange-400/10 absolute top-0 left-0 right-0 z-20">
        <PlayCircle size={8} className="text-white/60 mr-1" />
        <span className="text-[9px] font-medium text-white/80 truncate bg-zinc-900/50 px-1 rounded">{clip.name || 'Pista de Audio'}</span>
      </div>

      {/* TIRADOR DE CLIP GAIN (Centro Superior) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-zinc-400 hover:bg-zinc-200 cursor-ns-resize z-50 rounded-b-sm"
        onMouseDown={(e) => {
          e.stopPropagation();
          startDrag(e, 'gain');
        }}
        title={`Ganancia de Clip: ${Math.round((clip.gain ?? 1) * 100)}%`}
      />

      {clip.buffer && (
        <div className="absolute inset-0 top-4 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ 
              left: `-${(clip.trimOffset || 0) / 1000 * zoom}px`,
              width: `${clip.buffer.duration * zoom}px`,
              transform: `scaleY(${clip.gain ?? 1.0})`,
              transformOrigin: 'center'
            }}
          >
            <WaveformDisplay buffer={clip.buffer} duration={clip.buffer.duration} color="#06b6d4" />
          </div>
        </div>
      )}

      {/* ZONA DE FADE IN (Esquina superior izquierda) */}
      <div
        className="absolute top-0 left-0 w-3 h-3 bg-zinc-400/80 hover:bg-zinc-200 cursor-se-resize z-40"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', transform: `translateX(${(fadeInMs / 1000) * zoom}px)` }}
        onMouseDown={(e) => startDrag(e, 'fadeIn')}
        title="Arrastrar para Fade In"
      />

      {/* ZONA DE TRIM START (Borde izquierdo) */}
      <div
        className="absolute top-3 bottom-0 left-0 w-2 cursor-col-resize hover:bg-white/20 z-30"
        onMouseDown={(e) => startDrag(e, 'trimStart')}
        title="Recortar Inicio"
      />

      {/* ZONA DE FADE OUT (Esquina superior derecha) */}
      <div
        className="absolute top-0 right-0 w-3 h-3 bg-zinc-400/80 hover:bg-zinc-200 cursor-sw-resize z-40"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)', transform: `translateX(-${(fadeOutMs / 1000) * zoom}px)` }}
        onMouseDown={(e) => startDrag(e, 'fadeOut')}
        title="Arrastrar para Fade Out"
      />

      {/* ZONA DE TRIM END (Borde derecho) */}
      <div
        className="absolute top-3 bottom-0 right-0 w-2 cursor-col-resize hover:bg-white/20 z-30"
        onMouseDown={(e) => startDrag(e, 'trimEnd')}
        title="Recortar Fin"
      />

            {/* Capas visuales de Fades sobre la forma de onda */}
      <div className="absolute inset-0 pointer-events-none z-20 top-4">
        {/* FADE IN VISUAL */}
        {fadeInMs > 0 && (
          <div 
            className="h-full bg-zinc-900/70 absolute left-0 top-0 bottom-0 z-20 pointer-events-none" 
            style={{ 
              width: `${(fadeInMs / 1000) * zoom}px`, 
              clipPath: 'polygon(0 0, 100% 0, 0 100%)'
            }} 
          />
        )}
        {/* FADE OUT VISUAL */}
        {fadeOutMs > 0 && (
          <div 
            className="h-full bg-zinc-900/70 absolute right-0 top-0 bottom-0 z-20 pointer-events-none" 
            style={{ 
              width: `${(fadeOutMs / 1000) * zoom}px`, 
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
            }} 
          />
        )}
      </div>

      {/* Renderizado condicional de la línea de corte naranja */}
      {selectedTool === 'scissors' && hoverX !== null && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-orange-500 shadow-[0_0_8px_rgba(234,88,11,0.8)] z-50 pointer-events-none"
          style={{ left: hoverX }}
        />
      )}
    </div>
  );
};
