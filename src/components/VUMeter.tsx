import React, { useRef, useEffect } from 'react';

export const VUMeter = ({ analyser, orientation = 'vertical' }: { analyser: AnalyserNode | null, orientation?: 'vertical' | 'horizontal' }) => {
  const barRef = useRef<any>(null);

  useEffect(() => {
    if (!analyser || !barRef.current) return;

    const dataArray = new Float32Array(analyser.fftSize);
    let animationFrameId: number;
    let currentLevel = 0; // Para suavizar la caída (falloff)

    const draw = () => {
      if (!analyser || !barRef.current) return;
      
      // Obtener los datos reales de audio
      if (analyser.getFloatTimeDomainData) {
        analyser.getFloatTimeDomainData(dataArray);
      } else {
        const byteData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(byteData);
        for (let i = 0; i < analyser.fftSize; i++) {
          dataArray[i] = (byteData[i] / 128.0) - 1.0;
        }
      }
      
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sumSquares += dataArray[i] * dataArray[i];
      }
      
      // Cálculo de RMS (Root Mean Square)
      const rms = Math.sqrt(sumSquares / dataArray.length);
      
      // Convertir RMS a Decibelios (dB)
      const minDb = -60; // Nivel de ruido mínimo a mostrar
      let db = minDb;
      if (rms > 0) {
         db = 20 * Math.log10(rms);
      }
      
      // Mapear dB a un porcentaje (0% a 100%)
      let targetLevel = ((db - minDb) / (-minDb)) * 100;
      targetLevel = Math.max(0, Math.min(100, targetLevel));

      // Suavizar la animación (Attack rápido, Decay más lento)
      if (targetLevel > currentLevel) {
        currentLevel = targetLevel; // Responde inmediatamente a los picos
      } else {
        currentLevel -= 2.5; // Caída progresiva (ajustar para velocidad de caída)
        if (currentLevel < 0) currentLevel = 0;
      }
      
      const bar = barRef.current;
      
      if (orientation === 'vertical') {
        bar.style.height = `${currentLevel}%`;
      } else if (Array.isArray(barRef.current)) {
        barRef.current.forEach((el, index) => {
           if (!el) return;
           const min = index * 20;
           const max = (index + 1) * 20;
           if (currentLevel >= max) {
             el.style.width = '100%';
           } else if (currentLevel > min) {
             const percent = ((currentLevel - min) / 20) * 100;
             el.style.width = `${percent}%`;
           } else {
             el.style.width = '0%';
           }
        });
      }

      // Colores basados en dB aproximados (-60 a 0 dB)
      if (orientation === 'vertical') {
        if (currentLevel > 90) { // Mayor a -6dB (Cerca del clipping)
          bar.style.backgroundColor = '#ef4444'; // red-500
        } else if (currentLevel > 70) { // Mayor a -18dB (Nivel óptimo)
          bar.style.backgroundColor = '#EA580B'; // brand accent
        } else {
          bar.style.backgroundColor = '#10b981'; // emerald-500
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, orientation]);

  if (orientation === 'vertical') {
    return (
      <div className="w-2 h-full bg-slate-900 rounded-full overflow-hidden flex flex-col justify-end border border-slate-800">
        <div ref={barRef} className="w-full bg-emerald-500 transition-none" style={{ height: '0%' }} />
      </div>
    );
  }

  // Render segmented VU meter for horizontal orientation
  return (
    <div className="flex gap-0.5 w-8 h-2">
      {[1, 2, 3, 4, 5].map((segment, index) => {
         const threshold = segment * 20; // 20, 40, 60, 80, 100
         return (
           <div key={segment} className="flex-1 rounded-sm overflow-hidden bg-slate-900 border border-slate-800/50">
             <div 
               className={`h-full transition-none ${index === 4 ? 'bg-red-500' : index >= 3 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
               style={{ 
                 // Segment logic: if currentLevel >= threshold, full width. 
                 // If it's between previous and current threshold, partial width.
                 width: '0%' 
               }}
               ref={(el) => {
                  // We need to store these refs somehow, or let the requestAnimationFrame handle them all
                  // Let's modify the barRef logic to handle children if orientation is horizontal
                  if (el) {
                    if (!barRef.current) barRef.current = [];
                    (barRef.current)[index] = el;
                  }
               }}
             />
           </div>
         );
      })}
    </div>
  );
};
