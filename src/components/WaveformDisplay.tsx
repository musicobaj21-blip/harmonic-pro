import React, { useEffect, useRef, useState } from 'react';

interface WaveformDisplayProps {
  buffer: AudioBuffer | null;
  color?: string;
  trimStart?: number;
  duration?: number;
  gain?: number;
}

const MAX_CANVAS_WIDTH = 8192; // Safe limit for all browsers

export const WaveformDisplay: React.FC<WaveformDisplayProps> = React.memo(({ buffer, color = 'rgba(96, 165, 250, 0.8)', trimStart = 0, duration, gain = 1.0 }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
        setContainerHeight(entries[0].contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    // Initial size
    setContainerWidth(containerRef.current.getBoundingClientRect().width);
    setContainerHeight(containerRef.current.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, []);

  // Calculate number of chunks needed
  const dpr = window.devicePixelRatio || 1;
  const totalPhysicalWidth = Math.floor(containerWidth * dpr);
  const numChunks = Math.ceil(totalPhysicalWidth / MAX_CANVAS_WIDTH) || 1;
  
  // We use a callback ref pattern for the multiple canvases
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (!buffer || containerWidth === 0) return;
    if (typeof buffer.getChannelData !== 'function') return;

    const actualDuration = duration !== undefined ? duration : buffer.duration - trimStart;
    const startSample = Math.floor(trimStart * buffer.sampleRate);
    const endSample = Math.floor((trimStart + actualDuration) * buffer.sampleRate);
    const samplesToDraw = endSample - startSample;
    
    if (samplesToDraw <= 0) return;

    const channels = buffer.numberOfChannels;
    const physicalHeight = Math.floor((containerHeight || 80) * dpr);

    for (let chunkIdx = 0; chunkIdx < numChunks; chunkIdx++) {
        const canvas = canvasRefs.current[chunkIdx];
        if (!canvas) continue;

        const isLastChunk = chunkIdx === numChunks - 1;
        const chunkPhysicalWidth = isLastChunk 
            ? totalPhysicalWidth - (chunkIdx * MAX_CANVAS_WIDTH)
            : MAX_CANVAS_WIDTH;

        const chunkCssWidth = chunkPhysicalWidth / dpr;

        canvas.width = chunkPhysicalWidth;
        canvas.height = physicalHeight;
        canvas.style.width = `${chunkCssWidth}px`;
        canvas.style.height = `${containerHeight || 80}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        // 1. VITAL: Resetear cualquier escala o traslación acumulada en renders previos
        if (ctx.resetTransform) {
          ctx.resetTransform();
        } else {
          ctx.setTransform(1, 0, 0, 1, 0, 0); // Fallback universal
        }

        // 2. Limpiar el lienzo físico
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // We draw exactly chunkPhysicalWidth lines
        const step = samplesToDraw / totalPhysicalWidth;
        const startXOffset = chunkIdx * MAX_CANVAS_WIDTH;

        ctx.beginPath();
        if (channels === 1) {
          const amp = physicalHeight / 2;
          const data = buffer.getChannelData(0).subarray(startSample, endSample);
          
          for (let localX = 0; localX < chunkPhysicalWidth; localX++) {
            let min = 1.0;
            let max = -1.0;
            
            const globalX = startXOffset + localX;
            const start = Math.floor(globalX * step);
            const end = Math.max(start + 1, Math.floor((globalX + 1) * step));
            const safeEnd = Math.min(end, data.length);
            
            if (start >= data.length) {
                min = 0; max = 0;
            } else {
                for (let j = start; j < safeEnd; j++) {
                  const val = data[j] || 0;
                  if (val > max) max = val;
                  if (val < min) min = val;
                }
            }
            
            const yMin = (1 - max * gain) * amp;
            const yMax = (1 - min * gain) * amp;
            
            ctx.moveTo(localX + 0.5, yMin);
            ctx.lineTo(localX + 0.5, Math.max(yMin + 1, yMax));
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
          
        } else {
          const halfHeight = physicalHeight / 2;
          const subAmp = halfHeight / 2;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, halfHeight, chunkPhysicalWidth, 1);
          
          const dataL = buffer.getChannelData(0).subarray(startSample, endSample);
          const dataR = buffer.getChannelData(1).subarray(startSample, endSample);
          
          for (let localX = 0; localX < chunkPhysicalWidth; localX++) {
            let minL = 1.0; let maxL = -1.0;
            let minR = 1.0; let maxR = -1.0;
            
            const globalX = startXOffset + localX;
            const start = Math.floor(globalX * step);
            const end = Math.max(start + 1, Math.floor((globalX + 1) * step));
            const safeEndL = Math.min(end, dataL.length);
            const safeEndR = Math.min(end, dataR.length);
            
            if (start >= dataL.length) {
                minL = 0; maxL = 0; minR = 0; maxR = 0;
            } else {
                for (let j = start; j < safeEndL; j++) {
                  const valL = dataL[j] || 0;
                  if (valL > maxL) maxL = valL;
                  if (valL < minL) minL = valL;
                }
                for (let j = start; j < safeEndR; j++) {
                  const valR = dataR[j] || 0;
                  if (valR > maxR) maxR = valR;
                  if (valR < minR) minR = valR;
                }
            }
            
            const yMinL = (1 - maxL * gain) * subAmp;
            const yMaxL = (1 - minL * gain) * subAmp;
            ctx.moveTo(localX + 0.5, yMinL);
            ctx.lineTo(localX + 0.5, Math.max(yMinL + 1, yMaxL));
            
            const yMinR = halfHeight + (1 - maxR * gain) * subAmp;
            const yMaxR = halfHeight + (1 - minR * gain) * subAmp;
            ctx.moveTo(localX + 0.5, yMinR);
            ctx.lineTo(localX + 0.5, Math.max(yMinR + 1, yMaxR));
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
    }
  }, [buffer, containerWidth, containerHeight, color, trimStart, duration, numChunks, totalPhysicalWidth, dpr, gain]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none w-full h-full flex">
      {Array.from({ length: numChunks }).map((_, idx) => (
        <canvas
          key={idx}
          ref={(el) => { if (el) canvasRefs.current[idx] = el; }}
          className="opacity-80 pointer-events-none z-0"
          style={{ display: 'block' }}
        />
      ))}
    </div>
  );
});
