with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old = """               const splitter = ctx.createChannelSplitter(2);
               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(splitter);
               splitter.connect(merger, 0, 0);
               splitter.connect(merger, 1, 1);
               merger.connect(trackInputNode);"""

new = """               // The user requested Explicit Dual-Channel Merger to fix hard-panned recordings
               const splitter = ctx.createChannelSplitter(2);
               const merger = ctx.createChannelMerger(2);
               source.connect(gainNode);
               gainNode.connect(splitter);
               
               // Force Dual-Mono: take Left channel (0) and send to both L(0) and R(1)
               // This fixes issues where a 2-channel interface records Mic to Left and Silence to Right.
               splitter.connect(merger, 0, 0);
               splitter.connect(merger, 0, 1);
               
               merger.connect(trackInputNode);"""

if old in content:
    content = content.replace(old, new)
    with open("src/components/MidiStudio.tsx", "w") as f:
        f.write(content)
    print("Forced Left channel to Dual Mono on tracks!")
else:
    print("Not found.")
