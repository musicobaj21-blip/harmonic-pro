import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = '<WaveformDisplay buffer={clip.buffer} duration={clip.duration} color="#38BDF8" />'
new = '<WaveformDisplay buffer={clip.buffer} duration={clip.duration / 1000} color="#38BDF8" />'

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Fixed WaveformDisplay duration prop!")
else:
    print("Not found.")
