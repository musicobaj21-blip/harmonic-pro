import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

content = content.replace("'\\''", "'\\''")
content = content.replace("';': 76, ''': 77", "';': 76, '\\'': 77")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
