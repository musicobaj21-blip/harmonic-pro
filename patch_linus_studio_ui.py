import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

idx = content.find("  return (\n    <div ")
if idx == -1:
    idx = content.rfind("  return (\n")

if idx == -1:
    print("Could not find return statement")
    sys.exit(1)

new_return = """  return (
    <div className="flex flex-col h-full bg-[#101114] text-slate-200 select-none overflow-hidden font-sans">
      
      {/* TOP BAR: Tools & Zoom */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#14161a] border-b border-[#22252b] flex-shrink-0 z-30">
        <div className="flex items-center gap-6">
          {/* Herramientas */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest">HERRAMIENTAS:</span>
            <div className="flex bg-[#101114] rounded border border-[#22252b] p-0.5">
              <button onClick={() => setSelectedTool('pointer')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'pointer' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><MousePointer2 size={16} strokeWidth={2} /></button>
              <button onClick={() => setSelectedTool('scissors')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'scissors' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Scissors size={16} strokeWidth={2} /></button>
              <button onClick={() => setSelectedTool('eraser')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'eraser' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Eraser size={16} strokeWidth={2} /></button>
            </div>
          </div>
          
          {/* Imán */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#101114] border border-[#22252b] rounded px-2 py-1 gap-2">
              <Magnet size={14} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Imán:</span>
              <select 
                value={snapMode}
                onChange={(e) => setSnapMode(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-300 outline-none"
              >
                <option value="libre">Libre (Off)</option>
                <option value="compas">Compás</option>
                <option value="pulso">Beat</option>
              </select>
            </div>
          </div>
          
          {/* Help text */}
          <div className="text-[11px] text-slate-500 ml-4 font-medium">
            Selecciona una herramienta y haz clic sobre los clips para editar.
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* ZOOM */}
          <div className="flex items-center gap-2 bg-[#101114] border border-[#22252b] rounded p-1">
            <span className="text-[10px] text-slate-500 font-mono px-2">ZOOM: {zoom}px/s</span>
            <div className="flex border-l border-[#22252b] pl-1">
              <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 hover:bg-[#22252b] rounded text-slate-400"><Minus size={14} /></button>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-[#22252b] rounded text-slate-400"><Plus size={14} /></button>
              <button onClick={() => setZoom(50)} className="px-2 py-1 hover:bg-[#22252b] rounded text-slate-300 text-[10px] font-bold uppercase">Todo</button>
            </div>
          </div>
        </div>
      </div>

      {/* DAW Main Area */}
      <div className="flex flex-1 overflow-hidden relative bg-[#101114]">
        
        {/* Track Headers */}
        <div className="w-72 flex-shrink-0 bg-[#16181d] border-r border-[#22252b] flex flex-col z-20">
          <div className="h-8 flex items-center px-4 border-b border-[#22252b] bg-[#14161a]">
            <span className="text-[10px] text-slate-500 font-bold tracking-widest">PISTAS</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0">
            {tracks.map(t => (
              <div key={t.id} className="h-28 border-b border-[#22252b] p-3 flex flex-col justify-between bg-[#16181d] hover:bg-[#1a1c22] transition-colors group">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className={`w-3 h-3 rounded-full border ${activeTrackId === t.id ? 'bg-slate-300 border-white' : 'border-slate-500'}`} onClick={() => setActiveTrackId(t.id)}></div>
                    <div className="text-sm font-semibold text-slate-200 truncate">{t.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/30">
                      {t.channelMode === 'mono' ? 'MONO' : 'STEREO'}
                    </div>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${t.isMuted ? 'bg-[#101114] text-slate-400 shadow-inner' : 'text-slate-400 hover:bg-[#22252b]'}`}>M</button>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${t.isSolo ? 'bg-[#101114] text-slate-400 shadow-inner' : 'text-slate-400 hover:bg-[#22252b]'}`}>S</button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 bg-[#101114] rounded border border-[#22252b] p-1.5">
                   <div className="text-[9px] text-slate-500 font-mono font-bold">IN 1+2</div>
                   <button className="text-slate-400 hover:text-white"><Headphones size={12} /></button>
                   <button onClick={() => setFxModalTrackId(t.id)} className="text-[9px] border border-[#22252b] text-slate-400 px-1.5 py-0.5 rounded hover:bg-[#22252b]">FX</button>
                   
                   <div className="flex-1 flex items-center gap-2 ml-1">
                     <input type="range" min="-1" max="1" step="0.1" value={t.pan ?? 0} onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, pan: parseFloat(e.target.value) } : tr))} className="w-10 h-1 accent-amber-500 bg-[#22252b] rounded-full appearance-none cursor-ew-resize" title="Pan" />
                     <input type="range" min="0" max="1.5" step="0.01" value={t.volume ?? 1.0} onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))} className="flex-1 h-1 accent-blue-500 bg-[#22252b] rounded-full appearance-none cursor-ew-resize" title="Volume" />
                   </div>
                </div>
              </div>
            ))}
            
            {/* Add track buttons */}
            <div className="p-3 flex flex-col gap-2">
              <button onClick={addMidiTrack} className="w-full py-2 border border-dashed border-[#22252b] text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-[10px] uppercase font-bold rounded flex justify-center items-center gap-1">+ Agregar Pista MIDI</button>
              <div className="flex gap-2">
                <button onClick={() => addAudioTrack('mono')} className="flex-1 py-2 border border-[#22252b] text-slate-500 hover:text-slate-300 hover:bg-[#22252b] transition-colors text-[10px] uppercase font-bold rounded flex justify-center items-center gap-1">+ Pista Audio Mono</button>
                <button onClick={() => addAudioTrack('stereo')} className="flex-1 py-2 border border-[#22252b] text-slate-500 hover:text-slate-300 hover:bg-[#22252b] transition-colors text-[10px] uppercase font-bold rounded flex justify-center items-center gap-1"><Headphones size={10}/> + Pista Audio Estéreo</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-[#101114]" ref={timelineScrollRef}>
           <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>
              {/* Timeline Ruler */}
              <div className="h-8 sticky top-0 bg-[#14161a] border-b border-[#22252b] z-30 flex items-end overflow-hidden" 
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
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-slate-500 pl-1.5 border-l border-[#22252b] h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
                    ))}
                 </div>
                 {/* Export Range / Loop Region */}
                 {exportRange.active && (
                    <div className="absolute top-0 bottom-0 bg-blue-500/20 border-l-2 border-r-2 border-blue-500" style={{ left: `${(exportRange.start / 1000) * zoom}px`, width: `${((exportRange.end || exportRange.start) - exportRange.start) / 1000 * zoom}px` }}>
                       <div className="absolute top-0 left-0 -translate-x-1/2 w-4 h-4 bg-blue-500 text-black text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b">L</div>
                       <div className="absolute top-0 right-0 translate-x-1/2 w-4 h-4 bg-blue-500 text-black text-[9px] flex items-center justify-center cursor-ew-resize font-bold rounded-b">R</div>
                    </div>
                 )}
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, #22252b 1px, transparent 1px)`, backgroundSize: `${(60/bpm) * zoom}px 100%`, backgroundPosition: `0 8px` }}></div>
              
              {/* Playhead */}
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1.5px] bg-cyan-400 z-50 pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ left: 0 }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-cyan-400" />
              </div>

              {/* Track Rows */}
              <div className="pt-0 flex flex-col">
                {tracks.map(t => (
                  <div key={t.id} className="h-28 border-b border-[#22252b]/50 relative w-full group hover:bg-white/[0.01] transition-colors">
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
                        <div className="h-5 bg-black/40 flex items-center px-1.5 border-b border-blue-400/20">
                           <span className="text-[10px] font-bold text-slate-200 truncate">{clip.name}</span>
                        </div>
                        {/* Clip Gain Handle */}
                        <div 
                          className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white rounded cursor-ns-resize opacity-0 group-hover/clip:opacity-100 transition-opacity z-30 shadow" 
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
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Control Strip above Keyboard */}
      <div className="flex items-center gap-4 px-4 py-2 bg-[#16181d] border-t border-[#22252b] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Librería de Ritmos:</span>
          <select 
             value={selectedDrumPattern}
             onChange={(e) => handleDrumStyleSelect(e.target.value)}
             className="bg-[#101114] text-cyan-400 font-semibold border border-[#22252b] rounded px-2 py-1 outline-none focus:border-cyan-500 text-xs"
          >
             <option value="none">Apagada</option>
             <option value="Cumbia Acústica">Cumbia Acústica</option>
             <option value="Bossa Nova Brasil">Bossa Nova Brasil</option>
             <option value="Jazz Swing Studio">Jazz Swing Studio</option>
             <option value="Rock Classic">Rock Classic</option>
             <option value="Reggaetón">Reggaetón</option>
          </select>
        </div>
        <div className="flex-1"></div>
        {exportRange.active && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExportModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow">Exportar (Rango)</button>
            <button onClick={() => setExportRange({start: 0, end: null, active: false})} className="text-[10px] text-slate-400 hover:text-red-400 transition-colors uppercase font-bold px-2 py-1 border border-transparent hover:border-red-900/50 rounded">x Limpiar Rango</button>
          </div>
        )}
      </div>

      {/* Keyboard Drawer */}
      <div className="h-64 border-t border-[#22252b] bg-[#14161a] flex-shrink-0 flex flex-col relative overflow-hidden">
        <VirtualKeyboard 
          activeNotes={[]} 
          onNoteOn={(note) => {}}
          onNoteOff={(note) => {}}
        />
      </div>

      {/* Transport Bar */}
      <div className="h-16 bg-[#101114] border-t border-[#22252b] flex items-center justify-between px-6 flex-shrink-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center">
          {/* Time Display */}
          <div className="bg-black border border-[#22252b] rounded-md px-3 py-1 flex items-center gap-3">
            <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Tiempo</span>
            <span className="font-mono text-green-400 text-lg tracking-wider">
               {Math.floor(playheadTime / 1000 / 60).toString().padStart(2, '0')}:{Math.floor((playheadTime / 1000) % 60).toString().padStart(2, '0')}.{Math.floor((playheadTime % 1000) / 10).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            seekOffsetRef.current = 0;
            setPlayheadTime(0);
            if (playheadRef.current) playheadRef.current.style.left = '0px';
          }} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1c22] text-slate-400 hover:text-white transition-colors border border-[#22252b]"><SkipBack size={16} fill="currentColor" /></button>
          
          <button onClick={() => {
            cancelAnimationFrame(requestRef.current);
            if (isSequencerPlaying) togglePlayback();
          }} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1c22] text-slate-400 hover:text-white transition-colors border border-[#22252b]"><Square size={16} fill="currentColor" /></button>
          
          <button 
            onClick={() => setIsLooping(!isLooping)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isLooping ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-[#1a1c22] text-slate-400 hover:text-white border-[#22252b]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v1a4 4 0 0 1-4 4H3"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M17 1l4 4-4 4"></path></svg>
          </button>
          
          <button onClick={togglePlayback} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isSequencerPlaying ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#1a1c22] text-slate-300 hover:bg-[#22252b] border border-[#22252b]'}`}>
            <Play size={20} fill="currentColor" />
          </button>
          
          <button className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1c22] text-slate-400 hover:text-red-400 transition-colors border border-[#22252b]`}>
            <Circle size={14} fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black border border-[#22252b] rounded-md px-3 py-1 gap-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Tempo</span>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-10 bg-transparent text-white text-sm font-mono font-bold text-center outline-none" />
          </div>
          <button className="text-slate-500 hover:text-white transition-colors p-2"><Settings size={18} /></button>
          <div className="text-[9px] font-bold text-cyan-600 bg-cyan-950/20 border border-cyan-900/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            32-Bit Float / 48 kHz Studio PCM
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

print("Restored perfect Linus Studio DAW UI.")
