import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

ruler_match = re.search(r'<div className="flex items-center gap-3">.*?<div className="w-56".*?(<div\s+className="flex-1 h-8 relative.*?</div\s*>\s*</div\s*>\s*</div\s*>\s*)<div className="flex flex-col gap-2 mt-2">', content, re.DOTALL)
if ruler_match:
    print("Found ruler section!")
else:
    print("Ruler not found.")
