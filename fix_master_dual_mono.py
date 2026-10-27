import re

with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old = """     // Clone L and R to all available output channels of the hardware
     for (let i = 0; i < outChannels; i++) {
        masterSplitter.connect(masterMerger, i % 2, i);
     }"""

new = """     // CRITICAL MAC USB INTERFACE FIX: Clone Left Channel (0) to both Left (0) and Right (1)
     // This guarantees sound on both speakers for interfaces that only recognize Mono on L
     masterSplitter.connect(masterMerger, 0, 0); // L -> L
     if (outChannels > 1) {
        masterSplitter.connect(masterMerger, 0, 1); // L -> R
     }"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Forced Master to Dual Mono!")
else:
    print("Not found.")
