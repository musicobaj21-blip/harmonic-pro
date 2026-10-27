export const detectAudioHitpoints = (buffer: AudioBuffer, sensitivityThreshold: number = 0.15): number[] => {
  const channelData = buffer.getChannelData(0); // Use left channel for detection
  const sampleRate = buffer.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.01); // 10ms window
  const debounceSamples = Math.floor(sampleRate * 0.05); // 50ms debounce
  
  const hitpoints: number[] = [];
  let lastHitSample = -debounceSamples;
  
  let prevEnergy = 0;
  
  for (let i = 0; i < channelData.length; i += windowSize) {
    let energy = 0;
    const end = Math.min(i + windowSize, channelData.length);
    for (let j = i; j < end; j++) {
      energy += channelData[j] * channelData[j]; // RMS approach (sum of squares)
    }
    energy = Math.sqrt(energy / (end - i)); // RMS
    
    // Detect transient: Energy exceeds threshold AND is a sudden increase compared to previous window
    if (energy > sensitivityThreshold && energy > prevEnergy * 1.5) {
      if (i - lastHitSample > debounceSamples) {
        hitpoints.push(i / sampleRate);
        lastHitSample = i;
      }
    }
    
    prevEnergy = energy;
  }
  
  // Always include the beginning of the clip as a hitpoint if not detected
  if (hitpoints.length === 0 || hitpoints[0] > 0.05) {
      hitpoints.unshift(0);
  }
  
  return hitpoints;
};

export const calculateQuantizedTime = (
    currentStartTimeMs: number, 
    bpm: number, 
    subdivision: number, 
    strength: number
): number => {
    // subdivision: 4 (1/4), 8 (1/8), 16 (1/16), 32 (1/32)
    const msPerBeat = 60000 / bpm;
    // For 1/4 note (subdivision=4), gridStep is msPerBeat
    // For 1/8 note (subdivision=8), gridStep is msPerBeat / 2
    const gridStepMs = msPerBeat * (4 / subdivision);
    
    const targetGridTimeMs = Math.round(currentStartTimeMs / gridStepMs) * gridStepMs;
    
    // Humanization Math: strength 0.0 to 1.0 (0% to 100%)
    const humanizedStartTimeMs = currentStartTimeMs + (targetGridTimeMs - currentStartTimeMs) * strength;
    
    return humanizedStartTimeMs;
};
