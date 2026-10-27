import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    lines = f.readlines()

# Find the insertion point
insert_idx = -1
for i, line in enumerate(lines):
    if "// Playback state and engine" in line:
        insert_idx = i
        break

if insert_idx == -1:
    print("Could not find insertion point.")
    sys.exit(1)

# Keep everything before the insertion point
new_lines = lines[:insert_idx]

# Add the correct UI code
ui_code = """
  // Ref para hacer scroll
  const timelineScrollRef = React.useRef<HTMLDivElement>(null);
  
  // Playback state
  const seekOffsetRef = React.useRef<number>(0);
  const playheadRef = React.useRef<HTMLDivElement>(null);
  const requestRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number>(0);
  const [playheadTime, setPlayheadTime] = React.useState(0);
  const audioNodesRef = React.useRef<any[]>([]);

  const togglePlayback = () => {
    const ctx = getAudioContext();
    if (isSequencerPlaying) {
      setIsSequencerPlaying(false);
      cancelAnimationFrame(requestRef.current);
      audioNodesRef.current.forEach(node => {
         try { node.stop(); } catch(e){}
      });
      audioNodesRef.current = [];
    } else {
      setIsSequencerPlaying(true);
      const currentOffsetSec = seekOffsetRef.current / 1000;
      startTimeRef.current = ctx.currentTime - currentOffsetSec;
      
      // Schedule audio clips
      tracks.forEach(t => {
         if (t.isMuted) return;
         t.audioClips?.forEach(clip => {
            if (clip.buffer) {
               const clipStartSec = clip.startTime / 1000;
               const clipDurSec = clip.duration / 1000;
               
               if (currentOffsetSec < clipStartSec + clipDurSec) {
                  const source = ctx.createBufferSource();
                  source.buffer = clip.buffer;
                  
                  const gainNode = ctx.createGain();
                  gainNode.gain.value = t.volume * (clip.gain || 1.0);
                  
                  source.connect(gainNode);
                  gainNode.connect(getPlaybackMasterGain());
                  
                  let startDelay = clipStartSec - currentOffsetSec;
                  let offsetInBuffer = 0;
                  
                  if (startDelay < 0) {
                     offsetInBuffer = -startDelay;
                     startDelay = 0;
                  }
                  
                  source.start(ctx.currentTime + startDelay, offsetInBuffer);
                  audioNodesRef.current.push(source);
               }
            }
         });
      });
      
      playbackLoop();
    }
  };

  const playbackLoop = () => {
    if (!isSequencerPlaying) return;
    const now = getAudioContext().currentTime;
    const currentElapsed = (now - startTimeRef.current) * 1000;
    seekOffsetRef.current = currentElapsed;
    setPlayheadTime(currentElapsed);
    
    if (playheadRef.current) {
        // Asumiendo 50px por segundo de zoom
        playheadRef.current.style.left = `${(currentElapsed / 1000) * 50}px`;
    }
    
    requestRef.current = requestAnimationFrame(playbackLoop);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSequencerPlaying, tracks]);

  return (
    <div 
      className={`w-full bg-slate-900/80 rounded-xl border p-6 flex flex-col gap-4 shadow-2xl transition-all ${isDraggingFile ? "border-orange-500 border-dashed bg-orange-500/10" : "border-slate-700"}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={importExternalFile}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700 relative z-10">
        
        {/* Playback Controls */}
        <button 
          onClick={togglePlayback} 
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${isSequencerPlaying ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-cyan-400 hover:bg-slate-600'}`}
        >
          {isSequencerPlaying ? <Square size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
        </button>
        
        <div className="flex flex-col">
          <span className="text-xs font-mono text-cyan-400">{Math.floor(playheadTime / 1000)}s</span>
        </div>

        <div className="w-px h-6 bg-slate-700 mx-2"></div>

        {/* LOOP ENGINE Dropdown */}
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-slate-400">LOOP ENGINE:</span>
           <select 
             value={selectedDrumPattern}
             onChange={(e) => handleDrumStyleSelect(e.target.value)}
             className="bg-slate-900 text-slate-200 border border-slate-700 text-xs font-bold rounded-md px-2 py-1 outline-none focus:border-cyan-500"
           >
             <option value="none">Apagada</option>
             <option value="Cumbia Acústica">Cumbia Acústica (100 BPM)</option>
             <option value="Bossa Nova Brasil">Bossa Nova Brasil (120 BPM)</option>
             <option value="Jazz Swing Studio">Jazz Swing Studio (130 BPM)</option>
             <option value="Rock Classic">Rock Classic (120 BPM)</option>
             <option value="Reggaetón">Reggaetón (90 BPM)</option>
           </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
           {/* Pointer/Scissors/Eraser Tools */}
           <button onClick={() => setSelectedTool('pointer')} className={`p-1.5 rounded ${selectedTool === 'pointer' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-700'}`}><MousePointer2 size={16} /></button>
           <button onClick={() => setSelectedTool('scissors')} className={`p-1.5 rounded ${selectedTool === 'scissors' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-700'}`}><Scissors size={16} /></button>
           <button onClick={() => setSelectedTool('eraser')} className={`p-1.5 rounded ${selectedTool === 'eraser' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-700'}`}><Eraser size={16} /></button>
           
           <div className="w-px h-6 bg-slate-700 mx-2"></div>
           
           {/* File Options */}
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1.5 rounded flex items-center gap-1 border border-slate-600 transition-colors"
           >
             📥 Importar Archivo
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".wav,.mp3,.mid,.midi" onChange={importExternalFile} />
           
           <button 
             onClick={() => setShowExportModal(true)}
             className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1.5 rounded flex items-center gap-1 transition-colors"
           >
             <Download size={12} /> Exportar
           </button>
        </div>
      </div>

      {/* Main Arranger */}
      <div className="flex flex-col border border-slate-700 rounded-lg overflow-hidden bg-[#0c0d10] h-[450px]">
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Track Headers */}
          <div className="w-64 flex-shrink-0 bg-slate-800/80 border-r border-slate-700 overflow-y-auto">
            {tracks.map(t => (
              <div key={t.id} className="h-24 border-b border-slate-700/50 p-2 flex flex-col justify-center relative bg-slate-800 hover:bg-slate-750 transition-colors">
                <div className="text-xs font-semibold truncate mb-2" style={{ color: t.color || '#fff' }}>{t.name}</div>
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1">
                     <button 
                       onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))}
                       className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${t.isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}
                     >M</button>
                     <button 
                       onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))}
                       className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${t.isSolo ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}
                     >S</button>
                   </div>
                   
                   {/* Volume */}
                   <div className="flex items-center gap-2">
                     <Volume2 size={12} className="text-slate-400" />
                     <input 
                       type="range" min="0" max="1.5" step="0.01" 
                       value={t.volume ?? 1.0} 
                       onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))}
                       className="w-16 h-1 accent-cyan-500 bg-slate-700 rounded-full appearance-none" 
                     />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Timeline */}
          <div className="flex-1 overflow-auto relative bg-[#0c0d10]" ref={timelineScrollRef}>
            <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>
               {/* Grid Background Lines (Optional) */}
               <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px)', backgroundSize: '50px 100%' }}></div>
               
               {/* Playhead Marker */}
               <div ref={playheadRef} className="absolute top-0 bottom-0 w-px bg-cyan-400 z-50 pointer-events-none" style={{ left: 0 }}>
                 <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-cyan-400" />
               </div>

               {/* Track Rows in Timeline */}
               {tracks.map(t => (
                 <div key={t.id} className="h-24 border-b border-slate-700/20 relative w-full overflow-hidden">
                   
                   {/* Audio Clips */}
                   {t.audioClips?.map((clip: any) => (
                     <div 
                       key={clip.id} 
                       className={`absolute top-2 bottom-2 rounded-md overflow-hidden transition-all shadow-md ${clip.color || 'bg-cyan-600/60 border border-cyan-400'}`}
                       style={{ left: `${(clip.startTime / 1000) * 50}px`, width: `${(clip.duration / 1000) * 50}px` }}
                       onClick={() => {
                          if (selectedTool === 'eraser') {
                             commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.filter((c: any) => c.id !== clip.id) } : tr));
                          } else if (selectedTool === 'pointer') {
                             setEditingAudioClip({ trackId: t.id, clipId: clip.id });
                          }
                       }}
                     >
                       <div className="px-2 py-0.5 text-[10px] font-bold text-white/90 bg-black/40 truncate backdrop-blur-sm border-b border-white/10 z-10 relative">{clip.name}</div>
                       {clip.buffer && (
                         <div className="absolute inset-0 top-5 opacity-80 pointer-events-none">
                           <WaveformDisplay buffer={clip.buffer} duration={clip.duration} color="#ffffff" />
                         </div>
                       )}
                     </div>
                   ))}
                   
                   {/* MIDI Events */}
                   {t.events?.map((ev: any, i: number) => (
                     <div 
                       key={i} 
                       className="absolute h-1.5 bg-emerald-500 rounded-sm shadow-[0_0_4px_rgba(16,185,129,0.8)]"
                       style={{ left: `${(ev.timestamp / 1000) * 50}px`, top: `${(1 - (ev.note / 127)) * 100}%`, width: '12px' }}
                     />
                   ))}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals & Overlays */}
      <AnimatePresence>
        {editingPianoRollTrackId && (
          <PianoRoll 
            track={tracks.find(t => t.id === editingPianoRollTrackId)!}
            maxDuration={maxDuration}
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
        
        {fxModalTrackId && (
          <TrackFxModal
            track={tracks.find(t => t.id === fxModalTrackId)!}
            onClose={() => setFxModalTrackId(null)}
            onUpdateTrack={(updater) => {
               commitProjectChange(prev => prev.map(t => t.id === fxModalTrackId ? updater(t) : t));
            }}
          />
        )}
        
        {showMasterFxModal && (
          <MasterFxModal 
            fx={masterFx}
            onClose={() => setShowMasterFxModal(false)}
            onUpdateMasterFx={(updater) => setMasterFx(updater(masterFx))}
          />
        )}
        
        {showExportModal && (
          <ExportModal 
            onClose={() => setShowExportModal(false)}
            tracks={tracks}
            bpm={bpm}
            masterFx={masterFx}
            exportRange={exportRange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MidiStudio;
"""

new_lines.append(ui_code)

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.writelines(new_lines)

print("Restored original MidiStudio UI structure!")
