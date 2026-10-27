import re

with open("src/components/InteractiveAudioClip.tsx", "r") as f:
    content = f.read()

old_handle = """      {/* Clip Gain Handle */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-2 bg-white/50 rounded-[2px] cursor-ns-resize opacity-0 group-hover/clip:opacity-100 transition-opacity z-30"
        onMouseDown={(e) => startDrag(e, 'gain')}
      />"""

new_handle = """      {/* TIRADOR DE CLIP GAIN (Centro Superior) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-zinc-400 hover:bg-zinc-200 cursor-ns-resize z-50 rounded-b-sm"
        onMouseDown={(e) => {
          e.stopPropagation();
          startDrag(e, 'gain');
        }}
        title={`Ganancia de Clip: ${Math.round((clip.gain ?? 1) * 100)}%`}
      />"""

content = content.replace(old_handle, new_handle)

with open("src/components/InteractiveAudioClip.tsx", "w") as f:
    f.write(content)
