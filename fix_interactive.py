import re

with open("src/components/InteractiveAudioClip.tsx", "r") as f:
    content = f.read()

# 1. Add startTrimOffset
old_starts = """    const startGain = clip.gain ?? 1.0;
    const startTrimIn = clip.trimStart || 0;
    const startTrimOut = clip.trimEnd || 0;
    const startClipStart = clip.startTime;
    const startDuration = clip.duration;"""
    
new_starts = """    const startGain = clip.gain ?? 1.0;
    const startTrimIn = clip.trimStart || 0;
    const startTrimOffset = clip.trimOffset || 0;
    const startTrimOut = clip.trimEnd || 0;
    const startClipStart = clip.startTime;
    const startDuration = clip.duration;"""
content = content.replace(old_starts, new_starts)

# 2. Update trimStart logic
old_trim_logic = """      } else if (type === 'trimStart') {
        // limit trim to not invert duration
        const maxTimeDelta = startDuration - 10;
        const validTimeDelta = Math.min(timeDelta, maxTimeDelta);
        const newTrimStart = Math.max(0, startTrimIn + validTimeDelta);
        onCommitChange(c => ({
          ...c,
          trimStart: newTrimStart,
          startTime: startClipStart + validTimeDelta,
          duration: startDuration - validTimeDelta
        }));"""

new_trim_logic = """      } else if (type === 'trimStart') {
        // limit trim to not invert duration
        const maxTimeDelta = startDuration - 10;
        const validTimeDelta = Math.min(timeDelta, maxTimeDelta);
        const newTrimOffset = Math.max(0, startTrimOffset + validTimeDelta);
        onCommitChange(c => ({
          ...c,
          trimOffset: newTrimOffset,
          startTime: startClipStart + validTimeDelta,
          duration: startDuration - validTimeDelta
        }));"""
content = content.replace(old_trim_logic, new_trim_logic)

# 3. Update waveform rendering
old_waveform = """      {clip.buffer && (
        <div
          className="absolute inset-0 top-4 pointer-events-none flex items-center justify-center overflow-hidden"
          style={{ transform: `scaleY(${clip.gain ?? 1.0})` }}
        >
          <WaveformDisplay buffer={clip.buffer} duration={clipDurationMs / 1000} color="#06b6d4" />
        </div>
      )}"""

new_waveform = """      {clip.buffer && (
        <div className="absolute inset-0 top-4 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ 
              left: `-${(clip.trimOffset || 0) / 1000 * zoom}px`,
              width: `${clip.buffer.duration * zoom}px`,
              transform: `scaleY(${clip.gain ?? 1.0})`,
              transformOrigin: 'center'
            }}
          >
            <WaveformDisplay buffer={clip.buffer} duration={clip.buffer.duration} color="#06b6d4" />
          </div>
        </div>
      )}"""
content = content.replace(old_waveform, new_waveform)

with open("src/components/InteractiveAudioClip.tsx", "w") as f:
    f.write(content)
