with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

target = """                      style={{
                        left: `${(track.events[0].timestamp / maxDuration) * 100}%`,
                        width: `${Math.max(1, ((track.events[track.events.length - 1].timestamp - track.events[0].timestamp) / maxDuration) * 100)}%`
                      }}"""

replacement = """                      style={{
                        left: `${(track.events[0].timestamp / maxDuration) * 100}%`,
                        width: `${Math.max(1, ((track.events[track.events.length - 1].timestamp - track.events[0].timestamp) / maxDuration) * 100)}%`,
                        ...(track.color ? { backgroundColor: track.color + '80' } : {})
                      }}"""

if target in content:
    with open('src/components/MidiStudio.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Updated midi block bg")
else:
    print("Target not found")
