import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Import InteractiveAudioClip
content = content.replace("import AudioClipEditor from './AudioClipEditor';", "import AudioClipEditor from './AudioClipEditor';\nimport { InteractiveAudioClip } from './InteractiveAudioClip';")

# 2. Add split logic
split_logic = """  const executeSplit = (trackId: string, clipId: string, splitTimeSec: number) => {
    commitProjectChange(prev => prev.map(tr => {
      if (tr.id !== trackId) return tr;
      const clipToSplit = tr.audioClips?.find(c => c.id === clipId);
      if (!clipToSplit) return tr;
      
      const splitTimeMs = splitTimeSec * 1000;
      if (splitTimeMs <= 0 || splitTimeMs >= clipToSplit.duration) return tr; // invalid split

      const newClip1 = {
        ...clipToSplit,
        duration: splitTimeMs,
        trimEnd: (clipToSplit.trimEnd || 0) + (clipToSplit.duration - splitTimeMs)
      };

      const newClip2 = {
        ...clipToSplit,
        id: crypto.randomUUID(),
        startTime: clipToSplit.startTime + splitTimeMs,
        duration: clipToSplit.duration - splitTimeMs,
        trimStart: (clipToSplit.trimStart || 0) + splitTimeMs,
        name: `${clipToSplit.name} (2)`
      };

      return {
        ...tr,
        audioClips: [...(tr.audioClips?.filter(c => c.id !== clipId) || []), newClip1, newClip2]
      };
    }));
  };
"""

content = content.replace("  const openContextMenu = (e: React.MouseEvent, trackId: string | null = null) => {", split_logic + "\n  const openContextMenu = (e: React.MouseEvent, trackId: string | null = null) => {")


# 3. Replace the clip rendering
old_clip_render = """                    {t.audioClips?.map((clip: any) => (
                      <div 
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
                        }}
                      >
                        <div className="h-4 flex items-center px-1.5 border-b border-orange-400/10">
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
                            <WaveformDisplay buffer={clip.buffer} duration={clip.duration / 1000} color="#38BDF8" />
                          </div>
                        )}
                        {/* Fade In Handle */}
                        <div 
                           className="absolute top-0 bottom-0 left-0 w-3 cursor-ew-resize opacity-0 group-hover/clip:opacity-100 z-30 flex items-start"
                           style={{ transform: `translateX(${((clip.fadeIn || 0) / 1000) * zoom}px)` }}
                           onMouseDown={(e) => {
                             e.stopPropagation();
                             const startX = e.clientX;
                             const startFade = clip.fadeIn || 0;
                             const move = (e2: MouseEvent) => {
                               const deltaX = e2.clientX - startX;
                               const timeDelta = (deltaX / zoom) * 1000;
                               const newFade = Math.max(0, Math.min(clip.duration, startFade + timeDelta));
                               commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.map(c => c.id === clip.id ? { ...c, fadeIn: newFade } : c) } : tr));
                             };
                             const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                             window.addEventListener('mousemove', move);
                             window.addEventListener('mouseup', up);
                           }}
                        >
                           <div className="w-0 h-0 border-t-[8px] border-t-white/80 border-r-[8px] border-r-transparent drop-shadow-md"></div>
                        </div>
                        {/* Fade Out Handle */}
                        <div 
                           className="absolute top-0 bottom-0 right-0 w-3 cursor-ew-resize opacity-0 group-hover/clip:opacity-100 z-30 flex items-start justify-end"
                           style={{ transform: `translateX(-${((clip.fadeOut || 0) / 1000) * zoom}px)` }}
                           onMouseDown={(e) => {
                             e.stopPropagation();
                             const startX = e.clientX;
                             const startFade = clip.fadeOut || 0;
                             const move = (e2: MouseEvent) => {
                               const deltaX = startX - e2.clientX;
                               const timeDelta = (deltaX / zoom) * 1000;
                               const newFade = Math.max(0, Math.min(clip.duration, startFade + timeDelta));
                               commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, audioClips: tr.audioClips?.map(c => c.id === clip.id ? { ...c, fadeOut: newFade } : c) } : tr));
                             };
                             const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                             window.addEventListener('mousemove', move);
                             window.addEventListener('mouseup', up);
                           }}
                        >
                           <div className="w-0 h-0 border-t-[8px] border-t-white/80 border-l-[8px] border-l-transparent drop-shadow-md"></div>
                        </div>
                        {/* Fades visual overlay */}
                        {(clip.fadeIn > 0 || clip.fadeOut > 0) && (
                           <svg className="absolute inset-0 top-4 w-full h-[calc(100%-16px)] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                             {clip.fadeIn > 0 && <polygon points={`0,100 ${(clip.fadeIn/clip.duration)*100},100 ${(clip.fadeIn/clip.duration)*100},0 0,0`} fill="rgba(15, 23, 42, 0.6)" />}
                             {clip.fadeOut > 0 && <polygon points={`100,100 ${(1 - clip.fadeOut/clip.duration)*100},100 ${(1 - clip.fadeOut/clip.duration)*100},0 100,0`} fill="rgba(15, 23, 42, 0.6)" />}
                           </svg>
                        )}
                      </div>
                    ))}"""

new_clip_render = """                    {t.audioClips?.map((clip: any) => (
                      <InteractiveAudioClip
                        key={clip.id}
                        clip={clip}
                        trackId={t.id}
                        zoom={zoom}
                        selectedTool={selectedTool}
                        isSelected={selectedClipIds.some(c => c.clipId === clip.id)}
                        onSelect={(e) => {
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
                        }}
                        onCommitChange={(updater) => {
                          commitProjectChange(prev => prev.map(tr => tr.id === t.id ? {
                            ...tr,
                            audioClips: tr.audioClips?.map(c => c.id === clip.id ? updater(c) : c)
                          } : tr));
                        }}
                        onSplit={(trackId, timeSec) => {
                          executeSplit(trackId, clip.id, timeSec);
                        }}
                      />
                    ))}"""

import_ok = content.find(old_clip_render) > -1
if import_ok:
    content = content.replace(old_clip_render, new_clip_render)
    print("Successfully replaced old clip render")
else:
    print("Could not find old clip render string")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

