import re

with open("src/components/Metronome.tsx", "r") as f:
    content = f.read()

content = content.replace("gainNode.connect(ctx.destination);", 
"""const merger = ctx.createChannelMerger(2);
    gainNode.connect(merger, 0, 0);
    gainNode.connect(merger, 0, 1);
    merger.connect(ctx.destination);""")

content = content.replace("tonalGain.connect(ctx.destination);",
"""const tonalMerger = ctx.createChannelMerger(2);
      tonalGain.connect(tonalMerger, 0, 0);
      tonalGain.connect(tonalMerger, 0, 1);
      tonalMerger.connect(ctx.destination);""")

with open("src/components/Metronome.tsx", "w") as f:
    f.write(content)
print("Replaced metronome!")
