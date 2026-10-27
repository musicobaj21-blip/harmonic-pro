import re

with open("src/components/InteractiveAudioClip.tsx", "r") as f:
    content = f.read()

old_name = """        <span className="text-[9px] font-medium text-white/80 truncate">{clip.name}</span>"""
new_name = """        <span className="text-[9px] font-medium text-white/80 truncate bg-zinc-900/50 px-1 rounded">{clip.name || 'Pista de Audio'}</span>"""

content = content.replace(old_name, new_name)

with open("src/components/InteractiveAudioClip.tsx", "w") as f:
    f.write(content)
