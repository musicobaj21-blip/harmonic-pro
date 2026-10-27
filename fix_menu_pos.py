with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

target = "style={{ left: contextMenu.x, top: contextMenu.y }}"
replacement = "style={{ left: typeof window !== 'undefined' ? Math.min(contextMenu.x, window.innerWidth - 200) : contextMenu.x, top: typeof window !== 'undefined' ? Math.min(contextMenu.y, window.innerHeight - 220) : contextMenu.y }}"

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content.replace(target, replacement))
