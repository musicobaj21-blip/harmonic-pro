with open("src/utils/audio.ts", "r") as f:
    content = f.read()

content = content.replace("source.buffer = drumBuffers[note];", "source.buffer = ensureStereoBuffer(ctx, drumBuffers[note] as AudioBuffer);")

old = """    source.connect(gain);

    let lastNode = gain;"""

new = """    const merger = ctx.createChannelMerger(2);
    source.connect(gain);
    gain.connect(merger, 0, 0);
    gain.connect(merger, 0, 1);

    let lastNode: AudioNode = merger;"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Replaced drums!")
else:
    print("Not found.")
