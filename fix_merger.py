with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """               source.connect(gainNode);
               gainNode.connect(trackInputNode);"""

new = """               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(merger, 0, 0);
               gainNode.connect(merger, 0, 1);
               merger.connect(trackInputNode);"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Replaced!")
else:
    print("Not found.")
