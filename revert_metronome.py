with open("src/components/Metronome.tsx", "r") as f:
    content = f.read()

old1 = """const merger = ctx.createChannelMerger(2);
    gainNode.connect(merger, 0, 0);
    gainNode.connect(merger, 0, 1);
    merger.connect(ctx.destination);"""
new1 = "gainNode.connect(ctx.destination);"

old2 = """const tonalMerger = ctx.createChannelMerger(2);
      tonalGain.connect(tonalMerger, 0, 0);
      tonalGain.connect(tonalMerger, 0, 1);
      tonalMerger.connect(ctx.destination);"""
new2 = "tonalGain.connect(ctx.destination);"

if old1 in content:
    content = content.replace(old1, new1)
    content = content.replace(old2, new2)
    with open("src/components/Metronome.tsx", "w") as f:
        f.write(content)
    print("Reverted metronome!")
else:
    print("Not found.")
