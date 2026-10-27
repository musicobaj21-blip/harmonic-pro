import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# 1. Main container bg-[#0a0a0a] -> bg-[#09090b] (only the one for MidiStudio, let's just do a specific replace)
content = content.replace('bg-[#0a0a0a] text-zinc-200 select-none', 'bg-[#09090b] text-zinc-200 select-none')

# 2. Track headers: was bg-[#050507], should be bg-[#121214]
content = content.replace('w-[280px] flex-shrink-0 bg-[#050507]', 'w-[280px] flex-shrink-0 bg-[#121214]')

# 3. Bottom bar: was bg-[#050507], should be bg-[#0a0a0c]
content = content.replace('className="bg-[#050507] flex items-center justify-between px-4 py-2 flex-shrink-0', 'className="bg-[#0a0a0c] flex items-center justify-between px-4 py-2 flex-shrink-0')

# 4. Clips: ring-white/50 brightness-110 z-20 bg-[#1E3A5F]' : 'ring-1 ring-orange-500/30 z-10 bg-[#172A46]'
content = content.replace("bg-[#1E3A5F]", "bg-zinc-700")
content = content.replace("bg-[#172A46]", "bg-zinc-800")
content = content.replace("bg-[#1A2235]", "bg-zinc-900") # line 949 modal header
content = content.replace("bg-[#12151f]", "bg-zinc-900") # line 1004 fx modal
content = content.replace("bg-[#0a0c12]", "bg-zinc-950") # line 1024 fx list

# Fix the shadow of play button which had emerald color:
content = content.replace("shadow-[0_0_15px_rgba(16,185,129,0.4)]", "shadow-[0_0_15px_rgba(249,115,22,0.4)]")

# Fix hover:border-orange-500 hover:text-orange-400 for INS button and monitoring button
content = content.replace('hover:bg-orange-950/80 text-orange-400 hover:text-orange-300', 'hover:bg-zinc-800 text-orange-500 hover:text-orange-400')
content = content.replace('hover:border-orange-700/60', 'hover:border-orange-500')

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)
