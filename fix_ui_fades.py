import re

with open("src/components/InteractiveAudioClip.tsx", "r") as f:
    content = f.read()

old_fades = """      {/* Capas visuales de Fades sobre la forma de onda */}
      <div className="absolute inset-0 pointer-events-none flex justify-between z-20 top-4">
        {/* FADE IN VISUAL */}
        {fadeInMs > 0 && (
          <div 
            className="h-full bg-zinc-900/60" 
            style={{ width: `${(fadeInMs / 1000) * zoom}px`, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} 
          />
        )}
        <div className="flex-1" /> {/* Espaciador central */}
        {/* FADE OUT VISUAL REPARADO */}
        {fadeOutMs > 0 && (
          <div 
            className="h-full bg-zinc-900/60" 
            style={{ width: `${(fadeOutMs / 1000) * zoom}px`, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} 
          />
        )}
      </div>"""

new_fades = """      {/* Capas visuales de Fades sobre la forma de onda */}
      <div className="absolute inset-0 pointer-events-none z-20 top-4">
        {/* FADE IN VISUAL */}
        {fadeInMs > 0 && (
          <div 
            className="h-full bg-zinc-900/70 absolute left-0 top-0 bottom-0 z-20 pointer-events-none" 
            style={{ 
              width: `${(fadeInMs / 1000) * zoom}px`, 
              clipPath: 'polygon(0 0, 100% 0, 0 100%)'
            }} 
          />
        )}
        {/* FADE OUT VISUAL */}
        {fadeOutMs > 0 && (
          <div 
            className="h-full bg-zinc-900/70 absolute right-0 top-0 bottom-0 z-20 pointer-events-none" 
            style={{ 
              width: `${(fadeOutMs / 1000) * zoom}px`, 
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
            }} 
          />
        )}
      </div>"""

if content.find("flex justify-between") > -1:
    content = re.sub(r'\{\/\* Capas visuales de Fades sobre la forma de onda \*\/}.*?<\/div>', new_fades, content, flags=re.DOTALL)
    print("Replaced Fades")

with open("src/components/InteractiveAudioClip.tsx", "w") as f:
    f.write(content)
