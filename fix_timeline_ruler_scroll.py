import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# Fix the minWidth for the container (it already has style={{ width: `${totalTimelineDurationSec * zoom}px` }})
# We need to add minWidth to both the container and the ruler.
old_container = """<div className="relative flex flex-col shrink-0 min-w-max h-full" style={{ width: `${totalTimelineDurationSec * zoom}px` }}>"""
new_container = """<div className="relative flex flex-col shrink-0 min-w-max h-full" style={{ width: `${totalTimelineDurationSec * zoom}px`, minWidth: `${totalTimelineDurationSec * zoom}px` }}>"""
content = content.replace(old_container, new_container)

old_ruler_class = """<div className="h-8 w-full shrink-0 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden cursor-ew-resize" """
new_ruler_class = """<div className="h-8 w-full shrink-0 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden cursor-ew-resize" style={{ minWidth: `${totalTimelineDurationSec * zoom}px` }} """
content = content.replace(old_ruler_class, new_ruler_class)

# Update the onMouseDown logic
old_mouse_down = """                     if (e.shiftKey) {
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
                       const x = Math.max(0, clientX - rect.left + timelineScrollRef.current!.scrollLeft);"""
new_mouse_down = """                     if (e.shiftKey) {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
                       const time = (x / zoom) * 1000;
                       setExportRange({ start: time, end: time + 2000, active: true });
                       return;
                     }

                     const updatePosition = (clientX: number) => {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(clientX - rect.left, rect.width));"""
content = content.replace(old_mouse_down, new_mouse_down)

# Update the Numbers mapping
old_numbers = """                 {/* Numbers */}
                 <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {Array.from({length: totalMeasures}).map((_, i) => (
                      <div key={i} className="absolute bottom-0 text-[10px] font-bold text-zinc-500 pl-2 border-l border-zinc-700/50 h-3" style={{ left: `${(i * 4 * (60/bpm)) * zoom}px` }}>{i + 1}</div>
                    ))}
                 </div>"""

new_numbers = """                 {/* Numbers */}
                 <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                    {Array.from({length: Math.ceil(totalMeasures / (zoom < 15 ? 4 : zoom < 30 ? 2 : 1))}).map((_, i) => {
                      const tickStep = zoom < 15 ? 4 : zoom < 30 ? 2 : 1;
                      const measureIdx = i * tickStep;
                      return (
                        <div key={measureIdx} className="absolute bottom-0 text-[10px] font-bold text-zinc-500 pl-2 border-l border-zinc-700/50 h-3" style={{ left: `${(measureIdx * 4 * (60/bpm)) * zoom}px` }}>
                          <span className="select-none">{measureIdx + 1}</span>
                        </div>
                      );
                    })}
                 </div>"""
content = content.replace(old_numbers, new_numbers)

# Also fix the shiftKey clientX variable name bug I introduced above
# I wrote `clientX` instead of `e.clientX` in the shiftKey block
old_shift = """                     if (e.shiftKey) {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(clientX - rect.left, rect.width));"""
new_shift = """                     if (e.shiftKey) {
                       const rect = rulerElement.getBoundingClientRect();
                       const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));"""
content = content.replace(old_shift, new_shift)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
