import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

idx = content.find("  return (\n")
if idx == -1:
    print("Could not find return statement")
    sys.exit(1)

new_return = """  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-4 max-w-7xl mx-auto my-4 w-full h-[85vh] text-slate-200 select-none overflow-hidden font-sans">
      
      {/* 1. Contenedor Maestro y Cabecera del Secuenciador */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
             🎛️
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-wide">SECUENCIADOR MULTIPISTA</h2>
          <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 ml-2 shadow transition-colors">
            <span>+</span> Importar Archivo
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".wav,.mp3,.mid,.midi" onChange={importExternalFile} />
          
          <button onClick={() => setShowExportModal(true)} className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded text-xs shadow-md ml-1 flex items-center gap-1.5 transition-all">
            Exportar
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#131b2e] border border-slate-700/80 rounded px-3 py-1.5 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Linus Drum Machine</span>
            <select 
               value={selectedDrumPattern}
               onChange={(e) => handleDrumStyleSelect(e.target.value)}
               className="bg-[#0b1120] text-cyan-400 font-semibold border border-slate-700 rounded px-2 py-0.5 outline-none focus:border-cyan-500 text-xs ml-2"
            >
               <option value="none">Apagada</option>
               <option value="Cumbia Acústica">Cumbia Acústica</option>
               <option value="Bossa Nova Brasil">Bossa Nova Brasil</option>
               <option value="Jazz Swing Studio">Jazz Swing Studio</option>
               <option value="Rock Classic">Rock Classic</option>
               <option value="Reggaetón">Reggaetón</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Barra de Herramientas y Zoom */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 flex-shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">HERRAMIENTAS:</span>
            <div className="flex bg-[#0b1120] rounded border border-slate-800 p-0.5 gap-0.5">
              <button onClick={() => setSelectedTool('pointer')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'pointer' ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:text-slate-200'}`}>
                 <MousePointer2 size={16} strokeWidth={2.5} />
              </button>
              <button onClick={() => setSelectedTool('scissors')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'scissors' ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:text-slate-200'}`}>
                 <Scissors size={16} strokeWidth={2.5} />
              </button>
              <button onClick={() => setSelectedTool('eraser')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'eraser' ? 'text-blue-400 bg-blue-900/30' : 'text-slate-400 hover:text-slate-200'}`}>
                 <Eraser size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0b1120] border border-slate-800 rounded px-2 py-1 gap-2">
              <Magnet size={14} className="text-slate-500" />
              <span className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">Imán:</span>
              <select 
                value={snapMode}
                onChange={(e) => setSnapMode(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-300 outline-none"
              >
                <option value="libre">Libre (Off)</option>
                <option value="compas">Compás</option>
                <option value="pulso">Beat</option>
                <option value="1/16">1/16</option>
              </select>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-500 ml-2 font-medium">
            Selecciona una herramienta y haz clic sobre los clips para editar.
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-[#0b1120] border border-slate-800 rounded p-1">
          <span className="text-[11px] text-slate-500 font-mono px-2 font-bold tracking-wider">ZOOM: {zoom}px/s</span>
          <div className="flex border-l border-slate-800 pl-1">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"><Minus size={14} /></button>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors"><Plus size={14} /></button>
            <button onClick={() => setZoom(50)} className="px-2 py-1 hover:bg-slate-800 rounded text-slate-300 text-[10px] font-bold uppercase transition-colors">Todo</button>
          </div>
        </div>
      </div>

      {/* DAW Main Area */}
      <div className="flex flex-1 overflow-hidden relative bg-[#0b1120] border border-slate-800 rounded-lg">
        
        {/* Track Headers */}
        <div className="w-72 flex-shrink-0 bg-[#0b1120] border-r border-slate-800 flex flex-col z-20">
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 relative pb-16">
            {tracks.map(t => (
              <div key={t.id} className="h-28 border-b border-slate-700/80 p-2.5 flex flex-col justify-between bg-[#131b2e] hover:bg-[#1a243d] transition-colors rounded-l-md text-xs relative group">
                
                {/* Indicador de Actividad Izquierdo */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTrackId === t.id ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-transparent'}`}></div>

                {/* 3. Cabeceras de Pista Profesionales */}
                <div className="flex items-center justify-between pl-1">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button onClick={() => setActiveTrackId(t.id)} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${activeTrackId === t.id ? 'bg-slate-300 border-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'border-slate-500 hover:border-slate-400 bg-transparent'}`}></button>
                    <div className="text-[13px] font-semibold text-slate-200 truncate pr-2">{t.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] rounded uppercase font-bold tracking-wider">
                      {t.channelMode === 'mono' ? 'MONO' : 'STEREO'}
                    </span>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))} className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-all ${t.isMuted ? 'bg-[#0b1120] text-amber-500 border border-amber-900/50 shadow-inner' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'}`}>M</button>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))} className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-all ${t.isSolo ? 'bg-[#0b1120] text-cyan-400 border border-cyan-900/50 shadow-inner' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'}`}>S</button>
                  </div>
                </div>
                
                {/* Fila Inferior */}
                <div className="flex items-center justify-between gap-1 mt-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400 pl-1">
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-cyan-300 font-bold border border-slate-700/50">IN 1+2</span>
                    <button className="p-1 hover:bg-slate-800 rounded text-slate-300 transition-colors" title="Monitoreo">🎧</button>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button onClick={() => setFxModalTrackId(t.id)} className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-[10px] rounded border border-slate-700 font-bold transition-colors" title="Rack de Efectos">FX</button>
                    
                    <input 
                      type="range" min="0" max="1.5" step="0.01" 
                      value={t.volume ?? 1.0} 
                      onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))} 
                      className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-ew-resize accent-amber-500 outline-none" 
                      title={`Vol: ${Math.round((t.volume ?? 1.0) * 100)}%`} 
                    />
                    {/* Fake LED meter next to slider */}
                    <div className="flex gap-[1px] h-3 items-end">
                       <div className="w-1 h-1 bg-green-500/80 rounded-sm"></div>
                       <div className="w-1 h-1.5 bg-green-500/80 rounded-sm"></div>
                       <div className="w-1 h-2 bg-green-500/30 rounded-sm"></div>
                       <div className="w-1 h-2.5 bg-yellow-500/30 rounded-sm"></div>
                       <div className="w-1 h-3 bg-red-500/30 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 4. Botones Inferiores de Agregar Pista (Dropzones) */}
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-800/80 px-2">
              <button onClick={addMidiTrack} className="w-full py-2.5 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 font-medium text-xs transition flex items-center justify-center gap-2">
                <span className="text-sm">+</span> Agregar Pista MIDI
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => addAudioTrack('mono')} className="py-2 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg bg-slate-900/20 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1.5 transition">
                  <span>🎙️</span> + Pista Audio Mono
                </button>
                <button onClick={() => addAudioTrack('stereo')} className="py-2 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg bg-slate-900/20 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1.5 transition">
                  <span>🎧</span> + Pista Audio Estéreo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-[#0b1120]" ref={timelineScrollRef}>
           <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>
              {/* Timeline Ruler */}
              <div className="h-8 sticky top-0 bg-slate-900/50 border-b border-slate-800 z-30 flex items-end overflow-hidden backdrop-blur-sm" 
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
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-slate-500 pl-1.5 border-l border-slate-700/50 h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
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
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-50 pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ left: 0 }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-cyan-400" />
              </div>

              {/* Track Rows in Timeline */}
              <div className="pt-0 flex flex-col pb-16">
                {tracks.map(t => (
                  <div key={t.id} className="h-28 border-b border-slate-800/80 relative w-full group hover:bg-slate-800/10 transition-colors">
                    {/* Audio Clips */}
                    {t.audioClips?.map((clip: any) => (
                      <div 
                        key={clip.id} 
                        className={`absolute top-2 bottom-2 rounded overflow-hidden transition-all shadow-md group/clip
                          ${selectedClipIds.some(c => c.clipId === clip.id) ? 'ring-2 ring-amber-400 brightness-125 shadow-[0_0_15px_rgba(251,191,36,0.6)] z-20' : 'ring-1 ring-blue-500/50 z-10'}
                          bg-blue-900/40`}
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
                        <div className="h-5 bg-black/50 flex items-center px-1.5 border-b border-blue-400/20">
                           <span className="text-[10px] font-bold text-slate-200 truncate">{clip.name}</span>
                        </div>
                        {/* Clip Gain Handle */}
                        <div 
                          className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/90 rounded-[2px] cursor-ns-resize opacity-0 group-hover/clip:opacity-100 transition-opacity z-30 shadow-sm" 
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
                          <div className="absolute inset-0 top-5 pointer-events-none flex items-center justify-center overflow-hidden" style={{ transform: `scaleY(${clip.gain ?? 1.0})` }}>
                            <WaveformDisplay buffer={clip.buffer} duration={clip.duration} color="#3b82f6" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* MIDI Events */}
                    {t.events?.map((ev: any, i: number) => (
                      <div 
                        key={i} 
                        className="absolute h-1.5 bg-emerald-500 rounded-[1px] shadow-[0_0_4px_rgba(16,185,129,0.8)]"
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
      <div className="bg-[#0b1120] border border-slate-800 rounded-lg flex items-center justify-between px-6 py-2.5 flex-shrink-0 z-30 shadow-xl mt-auto">
        <div className="flex items-center">
          {/* Time Display */}
          <div className="bg-black/80 border border-slate-800/80 rounded-md px-3 py-1 flex items-center gap-3 shadow-inner">
            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">TIEMPO</span>
            <span className="font-mono text-emerald-400 text-base tracking-wider font-bold">
               {Math.floor(playheadTime / 1000 / 60).toString().padStart(2, '0')}:{Math.floor((playheadTime / 1000) % 60).toString().padStart(2, '0')}.{Math.floor((playheadTime % 1000) / 10).toString().padStart(2, '0')}
               <span className="text-slate-600 ml-1 text-[10px]">/ 04:03</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            seekOffsetRef.current = 0;
            setPlayheadTime(0);
            if (playheadRef.current) playheadRef.current.style.left = '0px';
          }} className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow"><SkipBack size={15} fill="currentColor" /></button>
          
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            if (isSequencerPlaying) togglePlayback();
          }} className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow"><Square size={15} fill="currentColor" /></button>
          
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border shadow ${isLooping ? 'bg-cyan-900/40 text-cyan-400 border-cyan-700/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v1a4 4 0 0 1-4 4H3"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M17 1l4 4-4 4"></path></svg>
          </button>
          
          <button onClick={togglePlayback} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${isSequencerPlaying ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50'}`}>
            <Play size={18} fill="currentColor" className="ml-1" />
          </button>
          
          <button className={`w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-700 transition-all border border-slate-700 shadow`}>
            <Circle size={13} fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/80 border border-slate-800/80 rounded-md px-3 py-1 gap-2 shadow-inner">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">TEMPO</span>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-10 bg-transparent text-white text-sm font-mono font-bold text-center outline-none" />
          </div>
          <button className="text-slate-500 hover:text-slate-300 transition-colors p-1"><Settings size={16} /></button>
          <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-400 rounded-full text-[10px] font-mono tracking-wider font-semibold shadow-inner flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            32-Bit Float / 48 kHz Studio PCM
          </span>
          <div className="flex gap-1">
             <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700 transition-colors"><SlidersHorizontal size={14}/></button>
             <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded border border-slate-700 transition-colors"><Trash2 size={14}/></button>
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

content = content[:idx] + new_return

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)

print("Restored original specific Linus Studio DAW UI, removed VirtualPiano.")
