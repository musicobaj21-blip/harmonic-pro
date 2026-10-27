import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# Make sure Grip is imported
if "LayoutGrid" not in content:
    content = content.replace("from 'lucide-react';", "LayoutGrid, from 'lucide-react';")

import_code = """
import { LayoutGrid, Download, Upload, Grip, Mic2, FileAudio, PlayCircle, SquareMenu } from 'lucide-react';
"""

# Find return (
idx = content.find("  return (")

new_ui = """  return (
    <div className="bg-[#0B1120] border border-slate-800/80 rounded-xl p-5 shadow-2xl flex flex-col gap-4 max-w-[1400px] mx-auto my-4 w-full h-[88vh] text-slate-200 select-none overflow-hidden font-sans relative">
      
      {/* 1. Contenedor Maestro y Cabecera del Secuenciador */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-slate-400">
             <LayoutGrid size={24} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-200 tracking-wide">SECUENCIADOR MULTIPISTA</h2>
          
          <div className="flex items-center gap-2 ml-4">
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-[#131B2E] hover:bg-[#1A243D] text-slate-300 rounded-md text-xs font-semibold border border-slate-700/60 flex items-center gap-1.5 shadow-sm transition-colors">
              <span className="text-blue-400"><Upload size={14} /></span> + Importar Archivo
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".wav,.mp3,.mid,.midi" onChange={importExternalFile} />
            
            <button onClick={() => setShowExportModal(true)} className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-md text-xs shadow-md flex items-center gap-1.5 transition-all">
              <Download size={14} /> Exportar
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#131B2E] border border-slate-700/60 rounded-md px-3 py-1.5 shadow-inner cursor-pointer hover:bg-[#1A243D] transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">🥁 Linus Drum Machine</span>
            <select 
               value={selectedDrumPattern}
               onChange={(e) => handleDrumStyleSelect(e.target.value)}
               className="bg-transparent text-slate-400 font-semibold outline-none text-xs ml-1 cursor-pointer appearance-none"
            >
               <option value="none"> </option>
               <option value="Cumbia Acústica">Cumbia</option>
               <option value="Bossa Nova Brasil">Bossa</option>
               <option value="Jazz Swing Studio">Jazz</option>
               <option value="Rock Classic">Rock</option>
               <option value="Reggaetón">Reggaetón</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Barra de Herramientas y Zoom */}
      <div className="flex items-center justify-between flex-shrink-0 z-30 mb-1">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">HERRAMIENTAS:</span>
            <div className="flex gap-1">
              <button onClick={() => setSelectedTool('pointer')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${selectedTool === 'pointer' ? 'text-white bg-blue-600' : 'text-slate-400 bg-[#131B2E] border border-slate-700/60 hover:text-slate-200'}`}>
                 <MousePointer2 size={15} strokeWidth={2.5} />
              </button>
              <button onClick={() => setSelectedTool('scissors')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${selectedTool === 'scissors' ? 'text-white bg-blue-600' : 'text-slate-400 bg-[#131B2E] border border-slate-700/60 hover:text-slate-200'}`}>
                 <Scissors size={15} strokeWidth={2.5} />
              </button>
              <button onClick={() => setSelectedTool('eraser')} className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${selectedTool === 'eraser' ? 'text-white bg-blue-600' : 'text-slate-400 bg-[#131B2E] border border-slate-700/60 hover:text-slate-200'}`}>
                 <Eraser size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#131B2E] border border-slate-700/60 rounded-md px-3 h-8 gap-2">
              <Magnet size={14} className="text-slate-400" />
              <span className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">IMÁN:</span>
              <select 
                value={snapMode}
                onChange={(e) => setSnapMode(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="libre">Libre (Off)</option>
                <option value="compas">Compás</option>
                <option value="pulso">Beat</option>
                <option value="1/16">1/16</option>
              </select>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-500 font-medium border-l border-slate-800 pl-6">
            Selecciona una herramienta y haz clic sobre los clips para editar.
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono font-bold tracking-wider">ZOOM: {zoom}px/s</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="w-8 h-8 rounded-md bg-[#131B2E] border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"><Minus size={14} /></button>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-8 h-8 rounded-md bg-[#131B2E] border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"><Plus size={14} /></button>
            <button onClick={() => setZoom(50)} className="h-8 px-3 rounded-md bg-[#131B2E] border border-slate-700/60 flex items-center gap-1.5 text-slate-300 text-[11px] font-bold transition-colors hover:text-white">
              <Search size={12} /> Todo
            </button>
          </div>
        </div>
      </div>

      {/* DAW Main Area */}
      <div className="flex flex-1 overflow-hidden relative border border-slate-800 rounded-lg">
        
        {/* Track Headers */}
        <div className="w-[280px] flex-shrink-0 bg-[#0B1120] border-r border-slate-800 flex flex-col z-20">
          {/* Header for the track list */}
          <div className="h-8 flex items-center px-4 border-b border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">PISTAS</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 relative pb-16">
            {tracks.map(t => (
              <div key={t.id} className="h-[96px] border-b border-slate-800 p-3 flex flex-col justify-between bg-[#131B2E]/50 hover:bg-[#131B2E] transition-colors rounded-none text-xs relative group">
                
                {/* Indicador de Actividad Izquierdo */}
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${activeTrackId === t.id ? 'bg-cyan-500' : 'bg-transparent'}`}></div>

                {/* 3. Cabeceras de Pista Profesionales */}
                <div className="flex items-center justify-between pl-1">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button onClick={() => setActiveTrackId(t.id)} className={`w-3.5 h-3.5 rounded-full border-[1.5px] transition-all flex items-center justify-center ${activeTrackId === t.id ? 'border-cyan-400' : 'border-slate-500 hover:border-slate-400 bg-transparent'}`}>
                       {activeTrackId === t.id && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                    </button>
                    <div className="text-[13px] font-medium text-slate-200 truncate pr-2">{t.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-1.5 py-[1px] text-cyan-400 border border-cyan-800/80 font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                      {t.channelMode === 'mono' ? 'MONO' : 'STEREO'}
                    </span>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all ${t.isMuted ? 'text-slate-400' : 'text-slate-500 hover:text-slate-300'}`}>M</button>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all ${t.isSolo ? 'text-slate-400' : 'text-slate-500 hover:text-slate-300'}`}>S</button>
                  </div>
                </div>
                
                {/* Fila Inferior */}
                <div className="flex items-center justify-between gap-1 mt-2 text-[11px] text-slate-400 pl-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-[#0B1120] rounded font-mono text-[9px] text-cyan-300 font-bold border border-slate-800">IN 1+2</span>
                    <button className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors" title="Monitoreo"><Headphones size={13} /></button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button onClick={() => setFxModalTrackId(t.id)} className="px-2 py-0.5 text-slate-500 hover:text-slate-300 font-mono text-[10px] rounded font-bold transition-colors" title="Rack de Efectos">FX</button>
                    
                    <div className="relative flex items-center">
                      {/* Custom styled slider to match the orange dot and yellow track */}
                      <input 
                        type="range" min="0" max="1.5" step="0.01" 
                        value={t.volume ?? 1.0} 
                        onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))} 
                        className="w-[72px] h-1 bg-slate-700 rounded-full appearance-none cursor-ew-resize outline-none z-10" 
                        title={`Vol: ${Math.round((t.volume ?? 1.0) * 100)}%`} 
                        style={{
                          background: `linear-gradient(to right, #F59E0B ${(t.volume ?? 1.0) / 1.5 * 100}%, #334155 ${(t.volume ?? 1.0) / 1.5 * 100}%)`
                        }}
                      />
                      {/* Fake thumb overlay if we needed strict styling, but standard range thumb usually works if styled via CSS, let's keep it simple for now, the accent-color handles thumb in most browsers, but we need custom CSS for perfect match. For inline React: */}
                      <style>{`
                        input[type=range]::-webkit-slider-thumb {
                          -webkit-appearance: none;
                          height: 12px;
                          width: 12px;
                          border-radius: 50%;
                          background: #F97316;
                          cursor: ew-resize;
                          box-shadow: 0 0 2px rgba(0,0,0,0.5);
                        }
                      `}</style>
                    </div>
                    {/* Fake LED meter next to slider */}
                    <div className="flex gap-[2px] h-2.5 items-end opacity-40">
                       <div className="w-[3px] h-[4px] bg-slate-500 rounded-sm"></div>
                       <div className="w-[3px] h-[6px] bg-slate-500 rounded-sm"></div>
                       <div className="w-[3px] h-[8px] bg-slate-500 rounded-sm"></div>
                       <div className="w-[3px] h-[10px] bg-slate-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 4. Botones Inferiores de Agregar Pista (Dropzones) */}
            <div className="flex flex-col gap-3 mt-4 px-3 pb-4">
              <button onClick={addMidiTrack} className="w-full h-10 border border-dashed border-slate-700/80 rounded-md bg-transparent hover:bg-slate-800/30 text-slate-500 hover:text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5">
                <span className="text-[16px] leading-none mb-[2px]">+</span> Agregar Pista MIDI
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => addAudioTrack('mono')} className="h-10 border border-dashed border-slate-700/80 rounded-md bg-transparent hover:bg-slate-800/30 text-slate-500 hover:text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <Mic size={12}/> + Pista Audio Mono
                </button>
                <button onClick={() => addAudioTrack('stereo')} className="h-10 border border-dashed border-slate-700/80 rounded-md bg-transparent hover:bg-slate-800/30 text-slate-500 hover:text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                  <Headphones size={12}/> + Pista Audio Estéreo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-[#0B1120]" ref={timelineScrollRef}>
           <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>
              {/* Timeline Ruler */}
              <div className="h-8 sticky top-0 bg-[#0B1120] border-b border-slate-800 z-30 flex items-end overflow-hidden" 
                   onMouseDown={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left + timelineScrollRef.current!.scrollLeft;
                     const time = (x / zoom) * 1000;
                     if (e.shiftKey) {
                       setExportRange({ start: time, end: time + 2000, active: true });
                     } else {
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                     }
                   }}
              >
                 {/* Numbers */}
                 <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {Array.from({length: 100}).map((_, i) => (
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-slate-500 pl-2 border-l border-slate-700/50 h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
                    ))}
                 </div>
                 {/* Export Range / Loop Region */}
                 {exportRange.active && (
                    <div className="absolute top-0 bottom-0 bg-blue-500/20 border-l border-r border-blue-400" style={{ left: `${(exportRange.start / 1000) * zoom}px`, width: `${((exportRange.end || exportRange.start) - exportRange.start) / 1000 * zoom}px` }}>
                       <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-blue-500 text-white text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b shadow-md">L</div>
                       <div className="absolute top-0 right-0 translate-x-1/2 w-4 h-4 bg-blue-500 text-white text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b shadow-md">R</div>
                    </div>
                 )}
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px)`, backgroundSize: `${(60/bpm) * zoom}px 100%`, backgroundPosition: `0 8px` }}></div>
              
              {/* Playhead */}
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-cyan-400 z-50 pointer-events-none" style={{ left: 0 }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-cyan-400" />
              </div>

              {/* Track Rows in Timeline */}
              <div className="pt-0 flex flex-col pb-16">
                {tracks.map(t => (
                  <div key={t.id} className="h-[96px] border-b border-slate-800 relative w-full group">
                    {/* Horizontal dividing line inside track like in screenshot (optional) */}
                    <div className="absolute left-0 right-0 top-1/2 border-t border-slate-800/50 pointer-events-none"></div>

                    {/* Audio Clips */}
                    {t.audioClips?.map((clip: any) => (
                      <div 
                        key={clip.id} 
                        className={`absolute top-[4px] bottom-[4px] rounded-sm overflow-hidden transition-all shadow-sm group/clip
                          ${selectedClipIds.some(c => c.clipId === clip.id) ? 'ring-1 ring-white/50 brightness-110 z-20 bg-[#1E3A5F]' : 'ring-1 ring-blue-500/30 z-10 bg-[#172A46]'}`}
                        style={{ left: `${(clip.startTime / 1000) * zoom}px`, width: `${(clip.duration / 1000) * zoom}px` }}
                        onClick={(e) => {
                           e.stopPropagation();
                           if (selectedTool === 'eraser') {
                              commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.filter((c: any) => c.id !== clip.id) } : tr));
                           } else if (selectedTool === 'pointer') {
                              if (e.shiftKey) {
                                 setSelectedClipIds(prev => [...prev, { trackId: t.id, clipId: clip.id }]);
                              } else {
                                 setSelectedClipIds([{ trackId: t.id, clipId: clip.id }]);
                              }
                           }
                        }}
                      >
                        <div className="h-4 flex items-center px-1.5 border-b border-blue-400/10">
                           <PlayCircle size={8} className="text-white/60 mr-1" />
                           <span className="text-[9px] font-medium text-white/80 truncate">{clip.name}</span>
                        </div>
                        {/* Clip Gain Handle */}
                        <div 
                          className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/50 rounded-[2px] cursor-ns-resize opacity-0 group-hover/clip:opacity-100 transition-opacity z-30" 
                          onMouseDown={(e) => {
                             e.stopPropagation();
                             const startY = e.clientY;
                             const startGain = clip.gain ?? 1.0;
                             const move = (e2: MouseEvent) => {
                               const deltaY = startY - e2.clientY;
                               const newGain = Math.max(0, Math.min(2, startGain + deltaY * 0.02));
                               commitProjectChange(prev => prev.map(tr => tr.id === t.id ? {
                                 ...tr, audioClips: tr.audioClips?.map(c => c.id === clip.id ? { ...c, gain: newGain } : c)
                               } : tr));
                             };
                             const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                             window.addEventListener('mousemove', move);
                             window.addEventListener('mouseup', up);
                          }}
                        />
                        {clip.buffer && (
                          <div className="absolute inset-0 top-4 pointer-events-none flex items-center justify-center overflow-hidden" style={{ transform: `scaleY(${clip.gain ?? 1.0})` }}>
                            <WaveformDisplay buffer={clip.buffer} duration={clip.duration} color="#38BDF8" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* MIDI Events */}
                    {t.events?.map((ev: any, i: number) => (
                      <div 
                        key={i} 
                        className="absolute h-1.5 bg-emerald-500 rounded-[1px] opacity-80"
                        style={{ left: `${(ev.timestamp / 1000) * zoom}px`, top: `${(1 - (ev.note / 127)) * 100}%`, width: `${(ev.duration / 1000) * zoom}px` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* 5. Barra de Estado / Transporte Inferior */}
      {/* Absolute positioned floating toolbar at the bottom center-ish, extending full width with padding */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-lg flex items-center justify-between px-4 py-2 mt-2 flex-shrink-0 z-30 relative overflow-hidden">
        {/* Subtle background glow or gradient like in image */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#131B2E]/20 to-transparent"></div>
        
        <div className="flex items-center relative z-10">
          {/* Time Display */}
          <div className="flex flex-col bg-black/60 border border-slate-800/80 rounded px-3 py-1 shadow-inner min-w-[120px]">
            <span className="text-[8px] text-[#4ADE80] font-bold uppercase tracking-widest leading-none mb-0.5">TIEMPO</span>
            <div className="flex items-baseline">
              <span className="font-mono text-[#4ADE80] text-sm tracking-wider font-bold">
                 {Math.floor(playheadTime / 1000 / 60).toString().padStart(2, '0')}:{Math.floor((playheadTime / 1000) % 60).toString().padStart(2, '0')}.{Math.floor((playheadTime % 1000) / 10).toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500 ml-1 text-[10px] font-mono">/ 04:03</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            seekOffsetRef.current = 0;
            setPlayheadTime(0);
            if (playheadRef.current) playheadRef.current.style.left = '0px';
          }} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#131B2E] text-slate-400 hover:text-white transition-colors border border-slate-700/60"><SkipBack size={14} fill="currentColor" /></button>
          
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            if (isSequencerPlaying) togglePlayback();
          }} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#131B2E] text-slate-400 hover:text-white transition-colors border border-slate-700/60"><Square size={12} fill="currentColor" /></button>
          
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${isLooping ? 'bg-blue-900/40 text-blue-400 border-blue-700/60' : 'bg-[#131B2E] text-slate-400 hover:text-white border-slate-700/60'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v1a4 4 0 0 1-4 4H3"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M17 1l4 4-4 4"></path></svg>
          </button>
          
          <button onClick={togglePlayback} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSequencerPlaying ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#131B2E] text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'}`}>
            <Play size={18} fill="currentColor" className="ml-1" />
          </button>
          
          <button className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#131B2E] text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/30`}>
            <Circle size={12} fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Pause icon like thing next to tempo in screenshot */}
          <button className="w-8 h-8 rounded-md flex items-center justify-center bg-[#131B2E] text-slate-400 border border-slate-700/60">
             <div className="flex gap-[3px]"><div className="w-1 h-3 bg-current rounded-[1px]"></div><div className="w-1 h-3 bg-current rounded-[1px]"></div></div>
          </button>
          <div className="flex flex-col bg-black/60 border border-slate-800/80 rounded px-3 py-1 shadow-inner items-center justify-center">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-0.5">TEMPO</span>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-8 bg-transparent text-slate-300 text-sm font-mono font-bold text-center outline-none leading-none" />
          </div>
          
          <button className="text-slate-500 hover:text-slate-300 transition-colors p-1"><Settings size={16} /></button>
          
          <span className="px-3 py-1.5 bg-[#0B1120] border border-cyan-900/50 text-cyan-500 rounded-full text-[10px] font-mono tracking-wider font-semibold flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            32-Bit Float / 48 kHz Studio PCM
          </span>
          
          <div className="flex gap-2 ml-2">
             <button className="w-8 h-8 flex items-center justify-center bg-[#131B2E] hover:bg-[#1A243D] text-slate-400 rounded-md border border-slate-700/60 transition-colors"><SlidersHorizontal size={14}/></button>
             <button className="w-8 h-8 flex items-center justify-center bg-[#131B2E] hover:bg-[#1A243D] text-slate-400 rounded-md border border-slate-700/60 transition-colors"><Trash2 size={14}/></button>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {editingPianoRollTrackId && (
          <PianoRoll 
            track={tracks.find(t => t.id === editingPianoRollTrackId)!}
            maxDuration={16}
            onClose={() => setEditingPianoRollTrackId(null)}
            onSave={(events) => {
               commitProjectChange(prev => prev.map(t => t.id === editingPianoRollTrackId ? { ...t, events } : t));
               setEditingPianoRollTrackId(null);
            }}
          />
        )}
        {editingAudioClip && (
          <AudioClipEditor
            clip={tracks.find(t => t.id === editingAudioClip.trackId)?.audioClips?.find(c => c.id === editingAudioClip.clipId)!}
            onClose={() => setEditingAudioClip(null)}
            onSave={(newClip) => {
               commitProjectChange(prev => prev.map(t => t.id === editingAudioClip.trackId ? {
                  ...t,
                  audioClips: t.audioClips?.map(c => c.id === editingAudioClip.clipId ? newClip : c)
               } : t));
               setEditingAudioClip(null);
            }}
            onSplit={(time) => {}}
          />
        )}
        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)}
            tracks={tracks}
            bpm={bpm}
            masterFx={null}
            exportRange={{ start: 0, end: null, active: false }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MidiStudio;
"""

new_content = import_code + "\n" + content[:idx] + new_ui

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(new_content)

