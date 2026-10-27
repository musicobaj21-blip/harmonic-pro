import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Update calculateTotalDuration
old_calc = """  const calculateTotalDuration = () => {
    let max = 60; // minimum 1 minute
    tracks.forEach(t => {
      t.audioClips?.forEach(c => {
        const end = (c.startTime + c.duration) / 1000;
        if (end > max) max = end;
      });
      t.events?.forEach(e => {
        const end = (e.timestamp + (e.duration || 100)) / 1000;
        if (end > max) max = end;
      });
    });
    return max + 120; // 2 minutes padding
  };"""

new_calc = """  const calculateTotalDuration = () => {
    let max = 0;
    tracks.forEach(t => {
      t.audioClips?.forEach(c => {
        const end = (c.startTime + c.duration) / 1000;
        if (end > max) max = end;
      });
      t.events?.forEach(e => {
        const end = (e.timestamp + (e.duration || 100)) / 1000;
        if (end > max) max = end;
      });
    });
    // Añadir 60 segundos de espacio libre a la derecha
    return Math.max(60, max + 60);
  };"""
content = content.replace(old_calc, new_calc)

# 2. Update Timeline Ruler logic
old_ruler_logic = """              <div className="h-8 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden" 
                   onMouseDown={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left + timelineScrollRef.current!.scrollLeft;
                     const time = (x / zoom) * 1000;
                     if (e.shiftKey) {
                       setExportRange({ start: time, end: time + 2000, active: true });
                     } else {
                       // 1. Seek the offset
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                       
                       // 2. Si está reproduciendo, reiniciar para saltar (Timeline Seek)
                       if (isSequencerPlaying) {
                         setSeekVersion(v => v + 1);
                       }
                     }
                   }}
              >"""

new_ruler_logic = """              <div className="h-8 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden cursor-ew-resize" 
                   onMouseDown={(e) => {
                     const rulerElement = e.currentTarget;
                     
                     if (e.shiftKey) {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = e.clientX - rect.left + timelineScrollRef.current!.scrollLeft;
                       const time = (x / zoom) * 1000;
                       setExportRange({ start: time, end: time + 2000, active: true });
                       return;
                     }

                     const updatePosition = (clientX: number) => {
                       const rect = rulerElement.getBoundingClientRect();
                       // Calcular X relativo, permitiendo desborde y sumando el scroll actual
                       // La regla de timelineScrollRef puede tener un scrollLeft
                       const x = Math.max(0, clientX - rect.left + timelineScrollRef.current!.scrollLeft);
                       const time = (x / zoom) * 1000;
                       
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                     };

                     updatePosition(e.clientX);

                     const handleMouseMove = (moveEvent: MouseEvent) => {
                       updatePosition(moveEvent.clientX);
                     };

                     const handleMouseUp = () => {
                       window.removeEventListener('mousemove', handleMouseMove);
                       window.removeEventListener('mouseup', handleMouseUp);
                       // Si está reproduciendo, reiniciar para saltar (Timeline Seek)
                       if (isSequencerPlaying) {
                         setSeekVersion(v => v + 1);
                       }
                     };

                     window.addEventListener('mousemove', handleMouseMove);
                     window.addEventListener('mouseup', handleMouseUp);
                   }}
              >"""
content = content.replace(old_ruler_logic, new_ruler_logic)

# 3. Update playhead to have willChange
old_playhead = """              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] z-40 pointer-events-none" style={{ left: `${(playheadTime / 1000) * zoom}px` }}>
                 <div className="absolute top-0 -left-1.5 w-3 h-3 bg-orange-500 rounded-b-[2px] shadow-[0_0_10px_rgba(249,115,22,1)] flex items-center justify-center">
                    <div className="w-[1px] h-1.5 bg-black/30"></div>
                 </div>
              </div>"""

new_playhead = """              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] z-40 pointer-events-none transition-none" style={{ left: `${(playheadTime / 1000) * zoom}px`, willChange: 'left' }}>
                 <div className="absolute top-0 -left-1.5 w-3 h-3 bg-orange-500 rounded-b-[2px] shadow-[0_0_10px_rgba(249,115,22,1)] flex items-center justify-center">
                    <div className="w-[1px] h-1.5 bg-black/30"></div>
                 </div>
              </div>"""
content = content.replace(old_playhead, new_playhead)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
