import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# Add history state
if 'const [history, setHistory] = useState<Track[][]>([]);' not in content:
    content = content.replace('const [zoom, setZoom] = useState(50);', 'const [zoom, setZoom] = useState(50);\n  const [history, setHistory] = useState<Track[][]>([]);')

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
