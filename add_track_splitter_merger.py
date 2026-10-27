with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """               source.connect(gainNode);
               gainNode.connect(trackInputNode);"""

new = """               const splitter = ctx.createChannelSplitter(2);
               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(splitter);
               splitter.connect(merger, 0, 0);
               splitter.connect(merger, 1, 1);
               merger.connect(trackInputNode);"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Added track splitter+merger!")
else:
    print("Not found.")
