with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old = """    const merger = ctx.createChannelMerger(2);
    source.connect(gain);
    gain.connect(merger, 0, 0);
    gain.connect(merger, 0, 1);

    let lastNode: AudioNode = merger;"""

new = """    source.connect(gain);
    let lastNode: AudioNode = gain;"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Reverted drum merger!")
else:
    print("Not found.")
