import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add total timeline calculation somewhere near the top of the render
# Let's place it before `return (`
calc_code = """  const calculateTotalDuration = () => {
    let max = 60; // minimum 1 minute
    tracks.forEach(t => {
      t.audioClips?.forEach(c => {
        const end = (c.startTime + c.duration) / 1000;
        if (end > max) max = end;
      });
      t.midiEvents?.forEach(e => {
        const end = (e.timestamp + (e.duration || 100)) / 1000;
        if (end > max) max = end;
      });
    });
    return max + 120; // 2 minutes padding
  };
  const totalTimelineDurationSec = calculateTotalDuration();
  const totalMeasures = Math.max(10, Math.ceil(totalTimelineDurationSec / (4 * (60/bpm))));
"""

content = content.replace("  return (\n    <div className=\"w-full flex-1 flex flex-col bg-[#09090b] text-zinc-200 select-none overflow-hidden\">", calc_code + "\n  return (\n    <div className=\"w-full flex-1 flex flex-col bg-[#09090b] text-zinc-200 select-none overflow-hidden\">")

# 2. Update the ruler onMouseDown and the array map
old_ruler = """              <div className="h-8 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden" 
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
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-zinc-500 pl-2 border-l border-zinc-700/50 h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
                    ))}
                 </div>"""

new_ruler = """              <div className="h-8 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden" 
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
                         setPlaybackVersion(v => v + 1);
                       }
                     }
                   }}
              >
                 {/* Numbers */}
                 <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {Array.from({length: totalMeasures}).map((_, i) => (
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-zinc-500 pl-2 border-l border-zinc-700/50 h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
                    ))}
                 </div>"""

content = content.replace(old_ruler, new_ruler)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
