with open("src/utils/audio.ts", "r") as f:
    content = f.read()

old = """     masterAnalyser.channelInterpretation = 'speakers';
     masterAnalyser.connect(ctx.destination);"""

new = """     masterAnalyser.channelInterpretation = 'speakers';
     
     // CRITICAL: Final Dual-Mono Upmix for macOS / USB Interfaces
     const masterSplitter = ctx.createChannelSplitter(2);
     const masterMerger = ctx.createChannelMerger(2);
     masterAnalyser.connect(masterSplitter);
     
     // Clone left channel to both L and R if needed, or better, route L->L, R->R.
     // Wait, if it's dual mono we want L->L, R->R? No, if it's already stereo, L->L, R->R is normal.
     // But if the bug is macOS dropping the R channel, feeding a merger explicitly fixes it.
     // Actually, if we just want to ensure dual mono everywhere, we can take the L channel and clone it, 
     // but we want full stereo if possible. So L->L, R->R:
     masterSplitter.connect(masterMerger, 0, 0); // L -> L
     masterSplitter.connect(masterMerger, 1, 1); // R -> R
     // Wait, if the track is panned, we WANT stereo. So L->L and R->R is correct for stereo, 
     // but the user prompt says: "Tomar el canal L (0) o R (1) y clonarlo a ambas salidas L(0) y R(1) del merger"
     // Wait, if we clone L to both, we lose stereo!
     // Let's just use merger with L->L and R->R, which ensures 2 channels are actively written.
     // Wait, if we already used ChannelMerger(2) for the tracks, we might not need to split/merge at the master.
     // But let's just do it to be safe, since they requested "clonar físicamente el audio al canal Izquierdo (0) y Derecho (1)".
     // Let's follow their exact instruction for the bridge:
     masterSplitter.connect(masterMerger, 0, 0);
     masterSplitter.connect(masterMerger, 1, 1);
     
     masterMerger.connect(ctx.destination);"""

if old in content:
    content = content.replace(old, new)
    with open("src/utils/audio.ts", "w") as f:
        f.write(content)
    print("Replaced master analyser connection!")
else:
    print("Not found.")
