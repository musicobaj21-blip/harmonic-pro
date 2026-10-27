with open("src/components/Metronome.tsx", "r") as f:
    content = f.read()

old1 = "gainNode.connect(ctx.destination);"
new1 = """const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    gainNode.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);
    merger.connect(ctx.destination);"""

old2 = "tonalGain.connect(ctx.destination);"
new2 = """const tonalSplitter = ctx.createChannelSplitter(2);
      const tonalMerger = ctx.createChannelMerger(2);
      tonalGain.connect(tonalSplitter);
      tonalSplitter.connect(tonalMerger, 0, 0);
      tonalSplitter.connect(tonalMerger, 1, 1);
      tonalMerger.connect(ctx.destination);"""

if old1 in content:
    content = content.replace(old1, new1)
    content = content.replace(old2, new2)
    with open("src/components/Metronome.tsx", "w") as f:
        f.write(content)
    print("Added metronome splitter+merger!")
else:
    print("Not found.")
