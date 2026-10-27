import re

with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old1 = "const outChannels = ctx.destination.maxChannelCount > 0 ? ctx.destination.maxChannelCount : 2;"
new1 = "const outChannels = 2; // FORCE 2 channels to prevent interface misreporting"

old2 = "ctx.destination.channelCount = ctx.destination.maxChannelCount || 2;"
new2 = "try { ctx.destination.channelCount = 2; } catch(e) {}"

if old1 in content:
    content = content.replace(old1, new1)
    content = content.replace(old2, new2)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Forced 2 channels!")
else:
    print("Not found.")
