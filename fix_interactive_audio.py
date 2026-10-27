import re

with open("src/components/InteractiveAudioClip.tsx", "r") as f:
    content = f.read()

# 1. Update startDrag to handle 'move' and ensure e.stopPropagation() is already there (it is, but let's be sure).
# We also need to add 'move' to the startDrag parameter type.
start_drag_old = "const startDrag = (e: React.MouseEvent, type: 'fadeIn' | 'fadeOut' | 'trimStart' | 'trimEnd' | 'gain') => {"
start_drag_new = "const startDrag = (e: React.MouseEvent, type: 'fadeIn' | 'fadeOut' | 'trimStart' | 'trimEnd' | 'gain' | 'move') => {"
content = content.replace(start_drag_old, start_drag_new)

move_logic_old = """      if (type === 'fadeIn') {"""
move_logic_new = """      if (type === 'move') {
        const newStartTime = Math.max(0, startClipStart + timeDelta);
        onCommitChange(c => ({ ...c, startTime: newStartTime }));
      } else if (type === 'fadeIn') {"""
content = content.replace(move_logic_old, move_logic_new)

# 2. Update the main div to handle onMouseDown for 'move'
main_div_old = """      onClick={(e) => {
        if (selectedTool === 'scissors' && hoverX !== null) {
          e.stopPropagation();
          onSplit(trackId, hoverX / zoomPixelsPerSecond);
        } else {
          onSelect(e);
        }
      }}"""
main_div_new = """      onMouseDown={(e) => {
        if (selectedTool === 'pointer') {
          // Solamente si es el puntero, iniciamos arrastre de toda la pista
          startDrag(e, 'move');
        }
      }}
      onClick={(e) => {
        if (selectedTool === 'scissors' && hoverX !== null) {
          e.stopPropagation();
          onSplit(trackId, hoverX / zoomPixelsPerSecond);
        } else {
          onSelect(e);
        }
      }}"""
content = content.replace(main_div_old, main_div_new)

# 3. Replace the SVG fades with the <div> fades requested by the user
svg_fades_old = """      {/* Fades visual overlay (SVG) */}
      {(fadeInMs > 0 || fadeOutMs > 0) && (
        <svg className="absolute inset-0 top-4 w-full h-[calc(100%-16px)] pointer-events-none z-20" preserveAspectRatio="none" viewBox="0 0 100 100">
          {fadeInMs > 0 && <polygon points={`0,100 ${pFadeIn},100 ${pFadeIn},0 0,0`} fill="rgba(15, 23, 42, 0.6)" />}
          {fadeOutMs > 0 && <polygon points={`100,100 ${pFadeOut},100 ${pFadeOut},0 100,0`} fill="rgba(15, 23, 42, 0.6)" />}
        </svg>
      )}"""
      
div_fades_new = """      {/* Capas visuales de Fades sobre la forma de onda */}
      <div className="absolute inset-0 top-4 pointer-events-none flex justify-between z-20">
        {/* FADE IN VISUAL */}
        {fadeInMs > 0 && (
          <div 
            className="h-full bg-zinc-900/60" 
            style={{ width: `${(fadeInMs / 1000) * zoom}px`, clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} 
          />
        )}
        <div className="flex-1" /> {/* Espaciador central */}
        {/* FADE OUT VISUAL REPARADO */}
        {fadeOutMs > 0 && (
          <div 
            className="h-full bg-zinc-900/60" 
            style={{ width: `${(fadeOutMs / 1000) * zoom}px`, clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} 
          />
        )}
      </div>"""
content = content.replace(svg_fades_old, div_fades_new)

# 4. Make sure stopPropagation is explicitly called in the handle startDrag if it wasn't
# It's already there in startDrag: e.stopPropagation();

with open("src/components/InteractiveAudioClip.tsx", "w") as f:
    f.write(content)
