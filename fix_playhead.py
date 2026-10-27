import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """              {/* Playhead */}
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-orange-500 z-50 pointer-events-none" style={{ left: 0 }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-orange-500" />
              </div>"""

new = """              {/* Playhead */}
              <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-orange-500 z-50 pointer-events-none" style={{ left: `${(playheadTime / 1000) * zoom}px` }}>
                <div className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-orange-500" />
              </div>"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Fixed playhead line!")
else:
    print("Not found.")
