with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

target = """                      style={{
                        left: `${((clip.startTime + (clip.trimStart || 0) * 1000) / maxDuration) * 100}%`,
                        width: `${Math.max(1, ( ((clip.buffer ? clip.buffer.duration : clip.duration) * 1000 - (clip.trimStart || 0) * 1000 - (clip.trimEnd || 0) * 1000) / maxDuration) * 100)}%`
                      }}"""

replacement = """                      style={{
                        left: `${((clip.startTime + (clip.trimStart || 0) * 1000) / maxDuration) * 100}%`,
                        width: `${Math.max(1, ( ((clip.buffer ? clip.buffer.duration : clip.duration) * 1000 - (clip.trimStart || 0) * 1000 - (clip.trimEnd || 0) * 1000) / maxDuration) * 100)}%`,
                        ...(track.color ? { backgroundColor: track.color + '99', borderColor: track.color } : {})
                      }}"""

if target in content:
    with open('src/components/MidiStudio.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Updated audio clip bg")
else:
    print("Target not found")
