with open('src/utils/audio.ts', 'r') as f:
    content = f.read()

target = """  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }"""

replacement = """  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
  }"""

if target in content:
    with open('src/utils/audio.ts', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Updated getAudioContext")
else:
    print("Target not found in audio.ts")
