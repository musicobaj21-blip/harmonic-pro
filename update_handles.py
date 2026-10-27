import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# Replace the existing fade visualizers with interactive ones
target = """
                      {clip.fadeIn && clip.fadeIn > 0 ? (
                         <div className="absolute top-0 bottom-0 left-0 pointer-events-none z-10" style={{ width: `${(clip.fadeIn / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))) * 100}%` }}>
                            <svg className="w-full h-full" preserveAspectRatio="none">
                               <path d="M 0 100 L 100 0 L 100 100 Z" fill="rgba(0,0,0,0.4)" />
                               <path d="M 0 100 L 100 0" vectorEffect="non-scaling-stroke" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
                            </svg>
                         </div>
                      ) : null}
                      {clip.fadeOut && clip.fadeOut > 0 ? (
                         <div className="absolute top-0 bottom-0 right-0 pointer-events-none z-10" style={{ width: `${(clip.fadeOut / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))) * 100}%` }}>
                            <svg className="w-full h-full" preserveAspectRatio="none">
                               <path d="M 0 0 L 100 100 L 0 100 Z" fill="rgba(0,0,0,0.4)" />
                               <path d="M 0 0 L 100 100" vectorEffect="non-scaling-stroke" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
                            </svg>
                         </div>
                      ) : null}
"""

replacement = """
                      {clip.fadeIn && clip.fadeIn > 0 ? (
                         <div className="absolute top-0 bottom-0 left-0 pointer-events-none z-10" style={{ width: `${(clip.fadeIn / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))) * 100}%` }}>
                            <svg className="w-full h-full" preserveAspectRatio="none">
                               <path d="M 0 100 L 100 0 L 100 100 Z" fill="rgba(0,0,0,0.4)" />
                               <path d="M 0 100 L 100 0" vectorEffect="non-scaling-stroke" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
                            </svg>
                         </div>
                      ) : null}
                      {clip.fadeOut && clip.fadeOut > 0 ? (
                         <div className="absolute top-0 bottom-0 right-0 pointer-events-none z-10" style={{ width: `${(clip.fadeOut / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))) * 100}%` }}>
                            <svg className="w-full h-full" preserveAspectRatio="none">
                               <path d="M 0 0 L 100 100 L 0 100 Z" fill="rgba(0,0,0,0.4)" />
                               <path d="M 0 0 L 100 100" vectorEffect="non-scaling-stroke" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
                            </svg>
                         </div>
                      ) : null}
                      
                      {/* INTERACTIVE FADE HANDLES (visible on hover/selection) */}
                      <div 
                         className="absolute top-0 left-0 w-3 h-3 bg-white border border-slate-700 rounded-br cursor-ew-resize z-20 opacity-0 group-hover/clip:opacity-100 hover:scale-125 transition-transform"
                         style={{ transform: `translateX(${(clip.fadeIn || 0) * (rectWidthContext || 100) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))}px)` }}
                         onMouseDown={(e) => {
                             e.stopPropagation();
                             const actDur = (clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0);
                             const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                             if (!rect) return;
                             const startX = e.clientX;
                             const startFadeIn = clip.fadeIn || 0;
                             
                             const moveHandler = (me: MouseEvent) => {
                                 const deltaX = me.clientX - startX;
                                 const deltaSecs = (deltaX / rect.width) * actDur;
                                 let newFadeIn = Math.max(0, Math.min(actDur - (clip.fadeOut || 0), startFadeIn + deltaSecs));
                                 commitProjectChange(tracks.map(t => t.id === track.id ? { ...t, audioClips: t.audioClips?.map(c => c.id === clip.id ? { ...c, fadeIn: newFadeIn } : c) } : t));
                             };
                             const upHandler = () => {
                                 window.removeEventListener('mousemove', moveHandler);
                                 window.removeEventListener('mouseup', upHandler);
                             };
                             window.addEventListener('mousemove', moveHandler);
                             window.addEventListener('mouseup', upHandler);
                         }}
                      />
                      <div 
                         className="absolute top-0 right-0 w-3 h-3 bg-white border border-slate-700 rounded-bl cursor-ew-resize z-20 opacity-0 group-hover/clip:opacity-100 hover:scale-125 transition-transform"
                         style={{ transform: `translateX(${-(clip.fadeOut || 0) * (rectWidthContext || 100) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))}px)` }}
                         onMouseDown={(e) => {
                             e.stopPropagation();
                             const actDur = (clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0);
                             const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                             if (!rect) return;
                             const startX = e.clientX;
                             const startFadeOut = clip.fadeOut || 0;
                             
                             const moveHandler = (me: MouseEvent) => {
                                 const deltaX = startX - me.clientX;
                                 const deltaSecs = (deltaX / rect.width) * actDur;
                                 let newFadeOut = Math.max(0, Math.min(actDur - (clip.fadeIn || 0), startFadeOut + deltaSecs));
                                 commitProjectChange(tracks.map(t => t.id === track.id ? { ...t, audioClips: t.audioClips?.map(c => c.id === clip.id ? { ...c, fadeOut: newFadeOut } : c) } : t));
                             };
                             const upHandler = () => {
                                 window.removeEventListener('mousemove', moveHandler);
                                 window.removeEventListener('mouseup', upHandler);
                             };
                             window.addEventListener('mousemove', moveHandler);
                             window.addEventListener('mouseup', upHandler);
                         }}
                      />
"""

if "INTERACTIVE FADE HANDLES" not in content:
    content = content.replace(target, replacement)
    
    # We need to make sure rectWidthContext is available or just read it from parent
    if "rectWidthContext" in content:
        # Instead of rectWidthContext, we can calculate it with %
        content = content.replace("rectWidthContext || 100", "1")
        # Wait, if we use translateX with %, it's relative to the handle's width, which is 3px.
        # It's better to use `left:` and `right:` instead of translateX.
        
        content = content.replace("""style={{ transform: `translateX(${(clip.fadeIn || 0) * (rectWidthContext || 100) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))}px)` }}""", """style={{ left: `calc(${(clip.fadeIn || 0) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0)) * 100}% - 6px)` }}""")
        
        content = content.replace("""style={{ transform: `translateX(${-(clip.fadeOut || 0) * (rectWidthContext || 100) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0))}px)` }}""", """style={{ right: `calc(${(clip.fadeOut || 0) / ((clip.buffer ? clip.buffer.duration : clip.duration/1000) - (clip.trimStart||0) - (clip.trimEnd||0)) * 100}% - 6px)` }}""")
    
    with open('src/components/MidiStudio.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Already contains fade handles")
