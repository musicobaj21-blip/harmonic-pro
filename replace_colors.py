import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# 1. Backgrounds
content = content.replace('bg-[#0b1120]', 'bg-[#09090b]')
content = content.replace('bg-[#0d121f]', 'bg-[#050507]')
content = content.replace('bg-[#131B2E]', 'bg-[#121214]')
content = content.replace('bg-[#1A243D]', 'bg-[#27272a]') # zinc-800
content = content.replace('bg-[#0B1120]', 'bg-[#0a0a0c]')
content = content.replace('bg-[#141824]', 'bg-[#18181b]') # zinc-900

# 2. Slate to Zinc
content = content.replace('border-slate-800', 'border-zinc-800')
content = content.replace('border-slate-700', 'border-zinc-700')
content = content.replace('text-slate-200', 'text-zinc-200')
content = content.replace('text-slate-300', 'text-zinc-300')
content = content.replace('text-slate-400', 'text-zinc-400')
content = content.replace('text-slate-500', 'text-zinc-500')
content = content.replace('bg-slate-800', 'bg-zinc-800')
content = content.replace('bg-slate-700', 'bg-zinc-700')
content = content.replace('bg-slate-950', 'bg-zinc-950')
content = content.replace('border-slate-500', 'border-zinc-500')

# 3. Accents
content = content.replace('cyan-400', 'orange-500')
content = content.replace('cyan-300', 'orange-400')
content = content.replace('cyan-500', 'orange-500')
content = content.replace('cyan-800', 'orange-800')
content = content.replace('cyan-700', 'orange-700')
content = content.replace('cyan-900', 'orange-900')
content = content.replace('cyan-950', 'orange-950')
content = content.replace('blue-600', 'orange-600')
content = content.replace('blue-500', 'orange-500')
content = content.replace('blue-400', 'orange-400')
content = content.replace('blue-700', 'orange-700')
content = content.replace('blue-900', 'orange-900')
content = content.replace('emerald-500', 'orange-500') # maybe leave emerald for some things? Wait, "red LED" is red, "play" is emerald? The prompt says "replace cyan/blue with orange". Let's keep emerald for play/events if not explicitly asked, or change it? "replace navy blue by pure black... cyan by orange".

# Let's fix specific buttons as requested:
# Import button: bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-200 border border-zinc-700 transition font-semibold
# Export button: bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)
