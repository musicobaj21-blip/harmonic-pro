import React, { useEffect, useRef } from 'react';
import { X, Power, Activity } from 'lucide-react';
import { getPlaybackMasterAnalyser, getMasterEQFrequencyResponse, getAudioContext, runGenreMastering } from '../utils/audio';

export const MasterFxModal = ({ fx, onClose, onUpdateMasterFx }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingBand, setDraggingBand] = React.useState<string | null>(null);
  const [isMastering, setIsMastering] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  
  const [activeGenre, setActiveGenre] = React.useState<string | null>(null);

  const genres = [
    { id: 'urbano', name: 'Urbano / Electrónica' },
    { id: 'jazz', name: 'Jazz / Acústico' },
    { id: 'rock', name: 'Pop / Rock / Tropical' }
  ];

  const handleGenreMaster = async (genreId: string, genreName: string) => {
    if (activeGenre === genreId) {
      setActiveGenre(null);
      // Disable effects
      onUpdateMasterFx({
        ...fx,
        eq: { ...fx.eq, enabled: false },
        glue: { ...fx.glue, enabled: false },
        limiter: { ...fx.limiter, enabled: false }
      });
      return;
    }
    
    setIsMastering(true);
    setToastMessage(null);
    setActiveGenre(genreId);
    
    // @ts-ignore
    const newMasterFx = await runGenreMastering(genreId, fx);
    newMasterFx.eq.enabled = true;
    newMasterFx.glue.enabled = true;
    newMasterFx.limiter.enabled = true;
    
    onUpdateMasterFx(newMasterFx);
    setIsMastering(false);
    setToastMessage(`¡Mezcla optimizada para ${genreName}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateFx = (type: string, field: string, value: any) => {
    const updated = {
      ...fx,
      [type]: {
        ...fx[type],
        [field]: value
      }
    };
    onUpdateMasterFx(updated);
  };

  const toggleFx = (type: string) => {
    const willBeEnabled = !fx[type].enabled;
    const updated = {
      ...fx,
      [type]: {
        ...fx[type],
        enabled: willBeEnabled
      }
    };
    onUpdateMasterFx(updated);
  };

  const getFreqFromX = (x: number, width: number) => {
    const minFreq = 20;
    const maxFreq = 20000;
    return minFreq * Math.pow(maxFreq / minFreq, x / width);
  };

  const getXFromFreq = (f: number, width: number) => {
    const minFreq = 20;
    const maxFreq = 20000;
    return width * (Math.log(f / minFreq) / Math.log(maxFreq / minFreq));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    let clickedBand = null;
    let minDistance = 20;

    ['lowCut', 'lowShelf', 'mid1', 'mid2', 'mid3', 'highShelf', 'highCut'].forEach((band) => {
      const params = fx.eq[band];
      if (params && params.enabled) {
        const hX = getXFromFreq(params.freq, canvas.width);
        const db = params.gain || 0;
        let hY = canvas.height / 2 - (db / 30) * (canvas.height / 2);
        hY = Math.max(0, Math.min(canvas.height, hY));

        const dist = Math.sqrt((x - hX) ** 2 + (y - hY) ** 2);
        if (dist < minDistance) {
          minDistance = dist;
          clickedBand = band;
        }
      }
    });

    if (clickedBand) {
      setDraggingBand(clickedBand);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingBand) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * (canvas.width / rect.width)));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * (canvas.height / rect.height)));

    const freq = getFreqFromX(x, canvas.width);
    let db = ((canvas.height / 2 - y) / (canvas.height / 2)) * 30;
    db = Math.max(-30, Math.min(30, db));

    const params = fx.eq[draggingBand];
    if (!params) return;

    const newParams = { ...params, freq: Math.round(freq) };
    if (newParams.gain !== undefined) {
      newParams.gain = Math.round(db * 10) / 10;
    }
    
    updateFx('eq', draggingBand, newParams);
  };

  const handleMouseUp = () => {
    setDraggingBand(null);
  };

  // Spectrum Analyzer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let analyser: AnalyserNode;
    
    try {
      analyser = getPlaybackMasterAnalyser();
    } catch (e) {
      console.warn("Could not get master analyser", e);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const freqs = new Float32Array(canvas.width);
    const magResponse = new Float32Array(canvas.width);
    const phaseResponse = new Float32Array(canvas.width);
    
    // Logarithmic frequency scale from 20Hz to 20kHz
    const minFreq = 20;
    const maxFreq = 20000;
    for (let i = 0; i < canvas.width; i++) {
        freqs[i] = minFreq * Math.pow(maxFreq / minFreq, i / canvas.width);
    }
    
    const getXFromFreq = (f: number) => canvas.width * (Math.log(f / minFreq) / Math.log(maxFreq / minFreq));
    const gridFreqs = [20, 30, 40, 50, 60, 80, 100, 200, 300, 400, 500, 800, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 20000];
    const bandColors: Record<string, string> = {
      lowCut: '#ef4444', // red-500
      lowShelf: '#EA580B', // brand accent
      mid1: '#eab308', // yellow-500
      mid2: '#22c55e', // green-500
      mid3: '#14b8a6', // teal-500
      highShelf: '#3b82f6', // blue-500
      highCut: '#a855f7' // purple-500
    };

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Background
      ctx.fillStyle = '#1e2430'; // Dark bluish-gray
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid
      ctx.strokeStyle = '#2a3142';
      ctx.lineWidth = 1;
      ctx.beginPath();
      gridFreqs.forEach(f => {
        const x = getXFromFreq(f);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      });
      // horizontal lines
      for(let i=1; i<4; i++) {
         ctx.moveTo(0, (canvas.height/4)*i);
         ctx.lineTo(canvas.width, (canvas.height/4)*i);
      }
      ctx.stroke();

      // Text labels for some freqs
      ctx.fillStyle = '#5a6172';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach(f => {
         const x = getXFromFreq(f);
         const label = f >= 1000 ? (f/1000) + 'k' : f.toString();
         ctx.fillText(label, x, canvas.height - 5);
      });
      
      // Draw analyzer
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      // Analyser bins are linear, we need to map to log scale
      const nyquist = getAudioContext().sampleRate / 2;
      for (let i = 0; i < bufferLength; i++) {
        const f = i * (nyquist / bufferLength);
        if (f < minFreq) continue;
        if (f > maxFreq) break;
        
        const x = getXFromFreq(f);
        const barHeight = dataArray[i];
        const y = canvas.height - (barHeight / 255) * canvas.height;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(100, 110, 150, 0.4)'; // Purplish faint fill
      ctx.fill();
      
      // Draw EQ Curve
      if (fx?.eq?.enabled) {
        getMasterEQFrequencyResponse(freqs, magResponse, phaseResponse);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#a3e635'; 
        
        for (let i = 0; i < canvas.width; i++) {
            const mag = magResponse[i];
            let db = 0;
            if (mag > 0) {
               db = 20 * Math.log10(mag);
            }
            
            // Map dB to canvas Y (range -30dB to +30dB)
            const dbRange = 30;
            let y = canvas.height / 2 - (db / dbRange) * (canvas.height / 2);
            y = Math.max(0, Math.min(canvas.height, y)); // clamp
            
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.stroke();
        
        // Fill under EQ curve
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(163, 230, 53, 0.3)');
        gradient.addColorStop(1, 'rgba(163, 230, 53, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw band handles
        ['lowCut', 'lowShelf', 'mid1', 'mid2', 'mid3', 'highShelf', 'highCut'].forEach((band) => {
            const params = fx.eq[band];
            if (params && params.enabled) {
                const x = getXFromFreq(params.freq);
                const db = params.gain || 0;
                let y = canvas.height / 2 - (db / 30) * (canvas.height / 2);
                y = Math.max(0, Math.min(canvas.height, y));
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = bandColors[band];
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full h-full justify-center items-center p-4 md:p-8">
        <div 
          className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Activity size={16} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Master Channel Fx</h2>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Studio Bus</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              
              
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            
            
            {/* Asistente de Masterización por Estilo */}
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-5 mb-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-2">
                  Asistente de Masterización por Estilo
                </h3>
                {toastMessage && (
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] font-bold rounded-full animate-fade-in">
                    {toastMessage}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {genres.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleGenreMaster(g.id, g.name)}
                    disabled={isMastering}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                      activeGenre === g.id
                        ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-[#111] border border-slate-800 text-slate-400 hover:border-purple-500/50 hover:bg-purple-900/20 hover:text-slate-200'
                    }`}
                  >
                    {isMastering && activeGenre === g.id ? (
                       <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    ) : null}
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualizer Canvas */}

            <div className="w-full bg-black rounded-lg border border-slate-800 overflow-hidden relative shadow-inner">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={200} 
                className={`w-full h-[200px] ${fx.eq.enabled ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-slate-600 font-mono font-bold">SPECTRUM ANALYZER</div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* EQ Section */}
              <div className="flex-[2] bg-black/40 rounded-lg p-5 border border-slate-800 flex flex-col gap-4 relative shadow-lg overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                  <h3 className="font-bold text-blue-400 text-sm tracking-wide">PARAMETRIC EQ</h3>
                  <button 
                    onClick={() => toggleFx('eq')}
                    className={`p-1.5 rounded-full transition-all ${fx.eq.enabled ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
                  >
                    <Power size={14} />
                  </button>
                </div>
                
                <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar justify-between">
                  <EqBandRow label="LC" band="lowCut" color="text-red-400" bg="bg-red-500" params={fx.eq.lowCut} fx={fx} updateFx={updateFx} hasFreq hasQ />
                  <EqBandRow label="LS" band="lowShelf" color="text-orange-400" bg="bg-orange-500" params={fx.eq.lowShelf} fx={fx} updateFx={updateFx} hasFreq hasGain />
                  <EqBandRow label="M1" band="mid1" color="text-yellow-400" bg="bg-yellow-500" params={fx.eq.mid1} fx={fx} updateFx={updateFx} hasFreq hasGain hasQ />
                  <EqBandRow label="M2" band="mid2" color="text-green-400" bg="bg-green-500" params={fx.eq.mid2} fx={fx} updateFx={updateFx} hasFreq hasGain hasQ />
                  <EqBandRow label="M3" band="mid3" color="text-teal-400" bg="bg-teal-500" params={fx.eq.mid3} fx={fx} updateFx={updateFx} hasFreq hasGain hasQ />
                  <EqBandRow label="HS" band="highShelf" color="text-blue-400" bg="bg-blue-500" params={fx.eq.highShelf} fx={fx} updateFx={updateFx} hasFreq hasGain />
                  <EqBandRow label="HC" band="highCut" color="text-purple-400" bg="bg-purple-500" params={fx.eq.highCut} fx={fx} updateFx={updateFx} hasFreq hasQ />
                </div>
              </div>

              {/* Glue Compressor Section */}
              <div className="flex-1 bg-black/40 rounded-lg p-5 border border-slate-800 flex flex-col gap-4 relative shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                  <h3 className="font-bold text-emerald-400 text-sm tracking-wide">GLUE COMP</h3>
                  <button 
                    onClick={() => toggleFx('glue')}
                    className={`p-1.5 rounded-full transition-all ${fx.glue.enabled ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
                  >
                    <Power size={14} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Ratio 2:1 | Attack 30ms | Release 250ms</div>
                
                <div className="flex justify-around gap-2 mt-2">
                  <Knob label="THRESH" value={fx.glue.threshold} min={-40} max={0} onChange={(v: any) => updateFx('glue', 'threshold', v)} disabled={!fx.glue.enabled} unit="dB" />
                  <Knob label="MAKE-UP" value={fx.glue.makeup} min={0} max={24} onChange={(v: any) => updateFx('glue', 'makeup', v)} disabled={!fx.glue.enabled} unit="dB" />
                </div>
              </div>

              {/* Limiter Section */}
              <div className="flex-1 bg-black/40 rounded-lg p-5 border border-slate-800 flex flex-col gap-4 relative shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                  <h3 className="font-bold text-orange-400 text-sm tracking-wide">BRICKWALL</h3>
                  <button 
                    onClick={() => toggleFx('limiter')}
                    className={`p-1.5 rounded-full transition-all ${fx.limiter.enabled ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(234,88,11,0.5)]' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
                  >
                    <Power size={14} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">Ratio 20:1 | Attack 1ms | Release 50ms</div>
                
                <div className="flex justify-center gap-6 mt-2">
                  <Knob label="MAXIMIZER" value={fx.limiter.threshold} min={-30} max={-0.1} step={0.1} onChange={(v: any) => updateFx('limiter', 'threshold', v)} disabled={!fx.limiter.enabled} unit="dB" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Knob = ({ label, value, min, max, step = 1, onChange, disabled, unit }: any) => {
  return (
    <div className={`flex flex-col items-center gap-3 transition-opacity duration-300 ${disabled ? 'opacity-30' : 'opacity-100'}`}>
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</span>
      <div className="relative w-14 h-14 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full border border-slate-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_2px_5px_rgba(0,0,0,0.5)]">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-10"
          style={{ appearance: 'slider-vertical' as any }}
        />
        <div 
          className="absolute w-1 h-3.5 bg-white rounded-full top-1.5 origin-[50%_21px] shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{ transform: `rotate(${((value - min) / (max - min)) * 270 - 135}deg)` }}
        />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800" />
      </div>
      <span className="text-xs text-slate-300 font-mono bg-black/50 px-2 py-0.5 rounded border border-slate-800 min-w-[50px] text-center">
        {step >= 1 ? Math.round(value) : value.toFixed(1)}{unit}
      </span>
    </div>
  );
};

const EqBandRow = ({ label, band, params, fx, updateFx, hasFreq, hasGain, hasQ, color, bg }: any) => {
  const toggleBand = () => {
    updateFx('eq', band, { ...params, enabled: !params.enabled });
  };
  const updateVal = (field: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    updateFx('eq', band, { ...params, [field]: num });
  };
  
  if (!params) return null;

  return (
    <div className={`flex flex-col gap-2 p-2 min-w-[75px] max-w-[85px] flex-1 items-center rounded-lg bg-[#1e2430] border border-[#2a3142] ${!params.enabled ? 'opacity-40' : ''}`}>
      <button 
        onClick={toggleBand}
        className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold ${params.enabled ? bg + ' text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-slate-800 text-slate-500'}`}
      >
        {label}
      </button>
      
      <div className="flex flex-col gap-1 w-full items-center mt-1">
        {hasFreq && (
          <div className="flex flex-col items-center">
            <input type="number" value={Math.round(params.freq) || ''} onChange={e => updateVal('freq', e.target.value)} className={`w-full max-w-[50px] bg-transparent text-[10px] font-mono font-bold text-center p-0 border-none focus:ring-0 ${color}`} />
            <span className="text-[7px] text-slate-500 -mt-0.5">Hz</span>
          </div>
        )}
        {hasGain && (
          <div className="flex flex-col items-center">
            <input type="number" step="0.1" value={params.gain} onChange={e => updateVal('gain', e.target.value)} className={`w-full max-w-[50px] bg-transparent text-[10px] font-mono font-bold text-center p-0 border-none focus:ring-0 ${color}`} />
            <span className="text-[7px] text-slate-500 -mt-0.5">dB</span>
          </div>
        )}
        {hasQ && (
          <div className="flex flex-col items-center">
            <input type="number" step="0.1" value={params.q} onChange={e => updateVal('q', e.target.value)} className={`w-full max-w-[50px] bg-transparent text-[10px] font-mono font-bold text-center p-0 border-none focus:ring-0 ${color}`} />
            <span className="text-[7px] text-slate-500 -mt-0.5">Q</span>
          </div>
        )}
      </div>
    </div>
  );
};
