import React, { useEffect, useRef, useState } from 'react';
import { AudioClip } from '../types';
import { X, Maximize2, Scissors, Undo2 } from 'lucide-react';
import { getAudioContext } from '../utils/audio';

interface AudioClipEditorProps {
  clip: AudioClip;
  onClose: () => void;
  onSave: (updatedClip: AudioClip) => void;
  onSplit?: (clipA: AudioClip, clipB: AudioClip) => void;
}

export default function AudioClipEditor({ clip, onClose, onSave, onSplit }: AudioClipEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [trimStart, setTrimStart] = useState(clip.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(clip.trimEnd || 0);
  const [fadeIn, setFadeIn] = useState(clip.fadeIn || 0);
  const [fadeOut, setFadeOut] = useState(clip.fadeOut || 0);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(clip.buffer);
  
  const duration = buffer ? buffer.duration : clip.duration;

  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'fade-in' | 'fade-out' | null>(null);

  useEffect(() => {
    drawWaveform();
  }, [buffer]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !buffer) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const step = Math.ceil(buffer.length / width);
    const channels = buffer.numberOfChannels;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;

    if (channels === 1) {
      // Mono
      const amp = height / 2;
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
           const datum = buffer.getChannelData(0)[(i * step) + j] || 0;
           if (datum > max) max = datum;
           if (datum < min) min = datum;
        }
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }
      ctx.stroke();

      // Center zero line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, amp);
      ctx.lineTo(width, amp);
      ctx.stroke();
    } else {
      // Stereo (or multi-channel)
      const halfHeight = height / 2;
      const amp = halfHeight / 2;
      
      // Draw divider
      ctx.fillStyle = 'rgba(51, 65, 85, 0.5)'; // slate-700
      ctx.fillRect(0, halfHeight - 1, width, 2);
      
      // Draw Left Channel (Top)
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
           const datum = buffer.getChannelData(0)[(i * step) + j] || 0;
           if (datum > max) max = datum;
           if (datum < min) min = datum;
        }
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }
      ctx.stroke();

      // Draw Right Channel (Bottom)
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
           const datum = buffer.getChannelData(1)[(i * step) + j] || 0;
           if (datum > max) max = datum;
           if (datum < min) min = datum;
        }
        ctx.moveTo(i, halfHeight + (1 + min) * amp);
        ctx.lineTo(i, halfHeight + (1 + max) * amp);
      }
      ctx.stroke();
      
      // Center zero lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, amp);
      ctx.lineTo(width, amp);
      ctx.moveTo(0, halfHeight + amp);
      ctx.lineTo(width, halfHeight + amp);
      ctx.stroke();
    }
  };

  const handleNormalize = () => {
    if (!buffer) return;
    let maxAbs = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const channelData = buffer.getChannelData(c);
      for (let i = 0; i < channelData.length; i++) {
        const abs = Math.abs(channelData[i]);
        if (abs > maxAbs) maxAbs = abs;
      }
    }
    if (maxAbs > 0 && maxAbs < 1.0) {
      const multiplier = 1.0 / maxAbs;
      const newBuffer = getAudioContext().createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const data = buffer.getChannelData(c);
        const newData = newBuffer.getChannelData(c);
        for (let i = 0; i < data.length; i++) {
          newData[i] = data[i] * multiplier;
        }
      }
      setBuffer(newBuffer);
    }
  };

  const handleReverse = () => {
    if (!buffer) return;
    const newBuffer = getAudioContext().createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      const newData = newBuffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) {
        newData[i] = data[data.length - 1 - i];
      }
    }
    setBuffer(newBuffer);
  };

  const handleStripSilence = () => {
    if (!buffer) return;
    const threshold = Math.pow(10, -40 / 20);
    
    let startIdx = buffer.length - 1;
    let endIdx = 0;
    
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      let sIdx = 0;
      let eIdx = data.length - 1;
      while (sIdx < data.length && Math.abs(data[sIdx]) < threshold) sIdx++;
      while (eIdx > 0 && Math.abs(data[eIdx]) < threshold) eIdx--;
      if (sIdx < startIdx) startIdx = sIdx;
      if (eIdx > endIdx) endIdx = eIdx;
    }
    
    if (startIdx < endIdx) {
       setTrimStart(startIdx / buffer.sampleRate);
       setTrimEnd((buffer.length - 1 - endIdx) / buffer.sampleRate);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = Math.max(0, Math.min(1, x / rect.width));
    const time = p * duration;

    if (isDragging === 'start') {
      setTrimStart(Math.min(time, duration - trimEnd - 0.1));
    } else if (isDragging === 'end') {
      setTrimEnd(Math.min(duration - time, duration - trimStart - 0.1));
    } else if (isDragging === 'fade-in') {
      setFadeIn(Math.min(time - trimStart, duration - trimStart - trimEnd));
    } else if (isDragging === 'fade-out') {
      setFadeOut(Math.min(duration - time - trimEnd, duration - trimStart - trimEnd));
    }
  };

  const onMouseUp = () => setIsDragging(null);

  const startPx = (trimStart / duration) * 100;
  const endPx = (trimEnd / duration) * 100;
  const fadeInPx = (fadeIn / duration) * 100;
  const fadeOutPx = (fadeOut / duration) * 100;

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col p-6 items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🎙️ Editor de Clip: <span className="text-cyan-400 font-mono text-lg">{clip.name}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onSave({
                  ...clip,
                  buffer,
                  trimStart,
                  trimEnd,
                  fadeIn,
                  fadeOut
                });
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded font-bold shadow-md transition-colors"
            >
              Aplicar Cambios
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 border-b border-slate-800">
          <button onClick={handleNormalize} className="flex items-center gap-2 bg-slate-700 hover:bg-cyan-600 hover:text-white text-slate-300 px-3 py-1.5 rounded transition-colors text-sm font-medium">
            <Maximize2 size={16} /> Normalizar
          </button>
          <button onClick={handleStripSilence} className="flex items-center gap-2 bg-slate-700 hover:bg-purple-600 hover:text-white text-slate-300 px-3 py-1.5 rounded transition-colors text-sm font-medium">
            <Scissors size={16} /> Limpiar Silencios
          </button>
          <button onClick={handleReverse} className="flex items-center gap-2 bg-slate-700 hover:bg-[#EA580B] hover:text-white text-slate-300 px-3 py-1.5 rounded transition-colors text-sm font-medium">
            <Undo2 size={16} /> Invertir
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative w-full h-64 bg-[#0f172a] rounded-lg border border-slate-700 overflow-hidden select-none"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <canvas 
              ref={canvasRef} 
              width={2000} 
              height={500} 
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            
            {/* Trim Start Curtain */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-black/60 border-r-2 border-cyan-500 z-10 flex items-center justify-end group"
              style={{ width: `${startPx}%` }}
            >
              <div 
                className="w-4 h-8 bg-cyan-500 rounded-l cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -mr-2"
                onMouseDown={() => setIsDragging('start')}
              >
                <div className="w-0.5 h-4 bg-black/50" />
              </div>
            </div>

            {/* Trim End Curtain */}
            <div 
              className="absolute top-0 bottom-0 right-0 bg-black/60 border-l-2 border-cyan-500 z-10 flex items-center justify-start group"
              style={{ width: `${endPx}%` }}
            >
              <div 
                className="w-4 h-8 bg-cyan-500 rounded-r cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center -ml-2"
                onMouseDown={() => setIsDragging('end')}
              >
                <div className="w-0.5 h-4 bg-black/50" />
              </div>
            </div>

            {/* Fade In Handle */}
            <div 
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: `${startPx}%`, width: `${fadeInPx}%` }}
            >
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d={`M 0 100 L 100 0`} vectorEffect="non-scaling-stroke" stroke="rgba(250,204,21,0.8)" strokeWidth="2" fill="none" />
              </svg>
              <div 
                className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full cursor-ew-resize -mt-2 -mr-2 pointer-events-auto shadow-lg"
                onMouseDown={() => setIsDragging('fade-in')}
              />
            </div>

            {/* Fade Out Handle */}
            <div 
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ right: `${endPx}%`, width: `${fadeOutPx}%` }}
            >
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d={`M 0 0 L 100 100`} vectorEffect="non-scaling-stroke" stroke="rgba(250,204,21,0.8)" strokeWidth="2" fill="none" />
              </svg>
              <div 
                className="absolute top-0 left-0 w-4 h-4 bg-yellow-400 rounded-full cursor-ew-resize -mt-2 -ml-2 pointer-events-auto shadow-lg"
                onMouseDown={() => setIsDragging('fade-out')}
              />
            </div>

          </div>
          <div className="mt-4 flex justify-between text-xs font-mono text-slate-500">
            <div>Trim Start: {trimStart.toFixed(2)}s</div>
            <div>Fade In: {fadeIn.toFixed(2)}s</div>
            <div>Fade Out: {fadeOut.toFixed(2)}s</div>
            <div>Trim End: {trimEnd.toFixed(2)}s</div>
          </div>
        </div>
      </div>
    </div>
  );
}
