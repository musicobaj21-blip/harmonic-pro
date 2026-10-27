with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old = """    source.connect(gain);
    let lastNode: AudioNode = gain;"""

new = """    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);
    source.connect(gain);
    gain.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);

    let lastNode: AudioNode = merger;"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Added drum splitter+merger!")
else:
    print("Not found.")
