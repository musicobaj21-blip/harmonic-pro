import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_clip_div = """                      <div 
                        key={clip.id} 
                        className={`absolute top-[4px] bottom-[4px] rounded-sm overflow-hidden transition-all shadow-sm group/clip
                          ${selectedClipIds.some(c => c.clipId === clip.id) ? 'ring-1 ring-white/50 brightness-110 z-20 bg-zinc-700' : 'ring-1 ring-orange-500/30 z-10 bg-zinc-800'}`}
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
                        }}"""

new_clip_div = """                      <div 
                        key={clip.id} 
                        className={`absolute top-1 bottom-1 rounded-sm overflow-hidden flex items-center transition cursor-pointer select-none group/clip ${
                          selectedClipIds.some(c => c.clipId === clip.id)
                            ? 'bg-zinc-800 border-2 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)] z-30'
                            : 'bg-zinc-800/90 border border-zinc-700 hover:border-zinc-500 z-10'
                        }`}
                        style={{ left: `${(clip.startTime / 1000) * zoom}px`, width: `${(clip.duration / 1000) * zoom}px` }}
                        onClick={(e) => {
                           e.stopPropagation();
                           setSelectedTrackId(t.id);
                           if (selectedTool === 'eraser') {
                              commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.filter((c: any) => c.id !== clip.id) } : tr));
                           } else if (selectedTool === 'pointer') {
                              if (e.shiftKey) {
                                 setSelectedClipIds(prev => [...prev, { trackId: t.id, clipId: clip.id }]);
                              } else {
                                 setSelectedClipIds([{ trackId: t.id, clipId: clip.id }]);
                              }
                           }
                        }}"""

if old_clip_div in content:
    content = content.replace(old_clip_div, new_clip_div)
    print("Replaced clip rendering div")
else:
    print("Could not find clip rendering div")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
