import re

with open("src/utils/audio.ts", "r") as f:
    content = f.read()

# Add a way to set sample rate
new_audio_context = """let globalSampleRate = 48000;

export async function setAudioContextOptions(sampleRate: number) {
  if (globalSampleRate === sampleRate) return;
  globalSampleRate = sampleRate;
  
  if (audioCtx) {
    if (audioCtx.state !== 'closed') {
      try {
        await audioCtx.close();
      } catch(e) {}
    }
    audioCtx = null;
  }
}

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: globalSampleRate });
    
    if (audioCtx && audioCtx.destination) {
      audioCtx.destination.channelCount = 2;
      audioCtx.destination.channelCountMode = 'explicit';
      audioCtx.destination.channelInterpretation = 'speakers';
    }
  }
"""

content = content.replace("""export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
    
    if (audioCtx && audioCtx.destination) {
      audioCtx.destination.channelCount = 2;
      audioCtx.destination.channelCountMode = 'explicit';
      audioCtx.destination.channelInterpretation = 'speakers';
    }
  }""", new_audio_context)

with open("src/utils/audio.ts", "w") as f:
    f.write(content)
