with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(merger, 0, 0);
               gainNode.connect(merger, 0, 1);
               merger.connect(trackInputNode);"""

new = """               source.connect(gainNode);
               gainNode.connect(trackInputNode);"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Reverted track merger!")
else:
    print("Not found.")
