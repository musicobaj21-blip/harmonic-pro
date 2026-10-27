import re

with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old = """     // CRITICAL: Final Stereo Upmix bridge for macOS / USB Interfaces
     const masterSplitter = ctx.createChannelSplitter(2);
     const masterMerger = ctx.createChannelMerger(2);
     masterAnalyser.connect(masterSplitter);
     
     // Route L->L and R->R explicitly to prevent macOS dropping the R channel
     masterSplitter.connect(masterMerger, 0, 0); // L -> L
     masterSplitter.connect(masterMerger, 1, 1); // R -> R
     
     masterMerger.connect(ctx.destination);"""

new = """     // CRITICAL: Final Stereo Upmix bridge for macOS / USB Interfaces
     const masterUpmixer = ctx.createGain();
     masterUpmixer.channelCount = 2;
     masterUpmixer.channelCountMode = 'explicit';
     masterUpmixer.channelInterpretation = 'speakers';
     
     const outChannels = ctx.destination.maxChannelCount > 0 ? ctx.destination.maxChannelCount : 2;
     const masterSplitter = ctx.createChannelSplitter(2);
     const masterMerger = ctx.createChannelMerger(outChannels);
     
     masterAnalyser.connect(masterUpmixer);
     masterUpmixer.connect(masterSplitter);
     
     // Clone L and R to all available output channels of the hardware
     for (let i = 0; i < outChannels; i++) {
        masterSplitter.connect(masterMerger, i % 2, i);
     }
     
     masterMerger.connect(ctx.destination);"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Cleaned up master routing!")
else:
    print("Not found.")
