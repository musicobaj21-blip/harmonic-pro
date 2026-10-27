import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """             duration: duration,
             buffer: audioBuffer,"""

new = """             duration: duration * 1000, // Fixed: duration should be in ms
             buffer: audioBuffer,"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Fixed duration in MidiStudio.tsx!")
else:
    print("Not found.")
