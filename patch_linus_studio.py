import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# Find the start of the return statement for the component
# Since there are multiple returns, we look for the one at the end.
# We'll use a regex or string match.
# Look for "  return (\n    <div \n      className={`w-full" or similar

idx = content.find("  return (\n    <div \n      className={`w-full")
if idx == -1:
    idx = content.rfind("  return (\n")

if idx == -1:
    print("Could not find return statement")
    sys.exit(1)

new_return = """  return (
    <div className="flex flex-col h-full bg-[#101114] text-slate-200 select-none overflow-hidden font-sans">
      {/* Zona Superior (70% del alto - Secuenciador DAW) */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* Barra de Herramientas Principal (Studio Toolbar) */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1c23] border-b border-[#22252b]">
          <div className="flex items-center gap-4">
             {/* Herramientas de Edición */}
             <div className="flex bg-[#101114] rounded-md border border-[#22252b] p-0.5">
               <button onClick={() => setSelectedTool('pointer')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'pointer' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}><MousePointer2 size={16} strokeWidth={2} /></button>
               <button onClick={() => setSelectedTool('scissors')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'scissors' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}><Scissors size={16} strokeWidth={2} /></button>
               <button onClick={() => setSelectedTool('eraser')} className={`p-1.5 rounded-sm transition-colors ${selectedTool === 'eraser' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}><Eraser size={16} strokeWidth={2} /></button>
             </div>
             
             {/* Menú Imán (Snap to Grid) */}
             <div className="flex items-center gap-2">
                <Magnet size={14} className="text-slate-400" />
                <select className="bg-[#101114] text-xs font-semibold text-slate-300 border border-[#22252b] rounded-md px-2 py-1 outline-none focus:border-cyan-500">
                  <option value="off">Libre (Off)</option>
                  <option value="compas">Compás</option>
                  <option value="beat">Beat</option>
                  <option value="1/16">1/16</option>
                </select>
             </div>

             {/* Librería de Ritmos (Studio Loops WAV) */}
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loops:</span>
                <select 
                   value={selectedDrumPattern}
                   onChange={(e) => handleDrumStyleSelect(e.target.value)}
                   className="bg-[#101114] text-xs font-semibold text-cyan-400 border border-[#22252b] rounded-md px-2 py-1 outline-none focus:border-cyan-500"
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
          
          {/* Botonera de Zoom Visual */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">ZOOM: {zoom}px/s</span>
            <div className="flex bg-[#101114] rounded-md border border-[#22252b] p-0.5">
               <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1 hover:bg-[#22252b] rounded text-slate-300"><Minus size={14} /></button>
               <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-[#22252b] rounded text-slate-300"><Plus size={14} /></button>
               <button onClick={() => setZoom(50)} className="px-2 py-1 hover:bg-[#22252b] rounded text-slate-300 font-semibold text-[10px] uppercase">Todo</button>
            </div>
          </div>
        </div>
        
        {/* DAW Main Area */}
        <div className="flex flex-1 overflow-hidden relative">
           {/* Track Headers */}
           <div className="w-64 flex-shrink-0 bg-[#1a1c23] border-r border-[#22252b] overflow-y-auto z-20">
              {/* Timeline Header Spacer */}
              <div className="h-8 border-b border-[#22252b] bg-[#14161a]"></div>
              
              {tracks.map(t => (
                 <div key={t.id} className="h-24 border-b border-[#22252b] p-3 flex flex-col justify-between bg-[#1a1c23] hover:bg-[#1f222a] transition-colors relative group">
                   <div className="flex items-center justify-between">
                     <div className="text-xs font-bold truncate text-slate-200">{t.name}</div>
                     <div className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#101114] text-slate-400 border border-[#22252b]">
                       {t.channelMode === 'mono' ? 'MONO' : 'STEREO'}
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1">
                       <button 
                         onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))}
                         className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-all ${t.isMuted ? 'bg-amber-500 text-[#101114] shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-[#101114] text-slate-400 hover:text-slate-200 border border-[#22252b]'}`}
                       >M</button>
                       <button 
                         onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))}
                         className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-all ${t.isSolo ? 'bg-cyan-500 text-[#101114] shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-[#101114] text-slate-400 hover:text-slate-200 border border-[#22252b]'}`}
                       >S</button>
                     </div>
                     
                     <div className="flex-1 flex items-center gap-2 ml-2">
                       <Volume2 size={12} className="text-slate-500" />
                       <input 
                         type="range" min="0" max="1.5" step="0.01" 
                         value={t.volume ?? 1.0} 
                         onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))}
                         className="w-full h-1 accent-cyan-500 bg-[#101114] rounded-full appearance-none cursor-pointer" 
                       />
                     </div>
                   </div>
                 </div>
              ))}
           </div>
           
           {/* Timeline */}
           <div className="flex-1 overflow-auto relative bg-[#101114]" ref={timelineScrollRef}>
              <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>
                 {/* Timeline Ruler & L-R Range */}
                 <div className="h-8 sticky top-0 bg-[#14161a] border-b border-[#22252b] z-30 flex items-end">
                    {/* Placeholder for ruler */}
                    <div className="flex items-center px-2 w-full justify-between h-full text-[10px] text-slate-500 border-b border-[#22252b]">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                    </div>
                 </div>
                 
                 {/* Grid Background */}
                 <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(to right, #22252b 1px, transparent 1px)`, backgroundSize: `${zoom}px 100%` }}></div>
                 
                 {/* Playhead */}
                 <div ref={playheadRef} className="absolute top-0 bottom-0 w-px bg-cyan-400 z-50 pointer-events-none shadow-[0_0_8px_rgba(6,182,212,0.8)]" style={{ left: 0 }}>
                   <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-cyan-400" />
                 </div>

                 {/* Track Rows */}
                 <div className="pt-0">
                   {tracks.map(t => (
                     <div key={t.id} className="h-24 border-b border-[#22252b]/50 relative w-full group">
                       {/* Audio Clips */}
                       {t.audioClips?.map((clip: any) => (
                         <div 
                           key={clip.id} 
                           className={`absolute top-1 bottom-1 rounded-sm overflow-hidden transition-all shadow-md group/clip
                             ${selectedClipIds.some(c => c.clipId === clip.id) ? 'ring-2 ring-amber-400 brightness-125 shadow-[0_0_15px_rgba(251,191,36,0.6)] z-20' : 'ring-1 ring-cyan-500/50 z-10'}
                             bg-slate-800/80`}
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
                           {/* Clip Header */}
                           <div className="h-4 bg-[#14161a]/80 flex items-center px-1 border-b border-cyan-500/30">
                              <span className="text-[9px] font-bold text-slate-300 truncate">{clip.name}</span>
                           </div>
                           
                           {/* Clip Gain Handle */}
                           <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-white/80 rounded-[1px] cursor-ns-resize opacity-0 group-hover/clip:opacity-100 transition-opacity z-30" />
                           
                           {/* Waveform Canvas */}
                           {clip.buffer && (
                             <div className="absolute inset-0 top-4 pointer-events-none opacity-90 flex items-center" style={{ transform: `scaleY(${clip.gain || 1.0})` }}>
                               <WaveformDisplay buffer={clip.buffer} duration={clip.duration} color="#22d3ee" />
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
      </div>
      
      {/* Transport Bar */}
      <div className="h-14 bg-[#14161a] border-t border border-[#22252b] px-4 flex items-center justify-between flex-shrink-0 z-30">
         <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#101114] rounded-md border border-[#22252b] p-1">
               <button onClick={() => {
                  cancelAnimationFrame(requestRef.current);
                  seekOffsetRef.current = 0;
                  setPlayheadTime(0);
                  if (playheadRef.current) playheadRef.current.style.left = '0px';
               }} className="p-2 text-slate-400 hover:text-slate-200 transition-colors"><SkipBack size={16} fill="currentColor" /></button>
               
               <button 
                 onClick={togglePlayback} 
                 className={`p-2 transition-colors ${isSequencerPlaying ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 {isSequencerPlaying ? <Square size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
               </button>
               
               <button className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Circle size={16} fill="currentColor" /></button>
            </div>
            
            <button 
               onClick={() => setIsLooping(!isLooping)}
               className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${isLooping ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-[#101114] text-slate-500 border-[#22252b] hover:text-slate-300'}`}
               title="Loop ( / )"
            >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v1a4 4 0 0 1-4 4H3"></path><path d="M7 22l-4-4 4-4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M17 1l4 4-4 4"></path></svg>
            </button>
            
            <div className="font-mono text-cyan-400 text-lg font-medium tracking-wider w-24 text-center bg-[#101114] border border-[#22252b] rounded px-2 py-1 shadow-inner">
               {Math.floor(playheadTime / 1000 / 60).toString().padStart(2, '0')}:
               {Math.floor((playheadTime / 1000) % 60).toString().padStart(2, '0')}.
               {Math.floor((playheadTime % 1000) / 10).toString().padStart(2, '0')}
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BPM</span>
               <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-12 bg-[#101114] text-slate-300 text-xs font-mono font-bold text-center border border-[#22252b] rounded px-1 py-1 outline-none focus:border-cyan-500" />
            </div>
         </div>
      </div>
      
      {/* Zona Inferior (30% del alto - Teclado MIDI) */}
      <div className="h-64 border-t border-[#22252b] bg-[#14161a] flex-shrink-0 flex flex-col">
         <VirtualKeyboard 
            onNotePlay={(note) => {}}
            onNoteStop={(note) => {}}
            activeNotes={[]}
         />
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
            exportRange={{ start: 0, end: null, active: false }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MidiStudio;
"""

new_content = content[:idx] + new_return

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(new_content)

print("Replaced return statement successfully.")
