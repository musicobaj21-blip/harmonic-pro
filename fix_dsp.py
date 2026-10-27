import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add clipGainNodesRef
old_trackVolumeNodesRef = """  const trackVolumeNodesRef = useRef<Record<string, GainNode>>({});"""
new_trackVolumeNodesRef = """  const trackVolumeNodesRef = useRef<Record<string, GainNode>>({});
  const clipGainNodesRef = useRef<Record<string, GainNode>>({});"""
content = content.replace(old_trackVolumeNodesRef, new_trackVolumeNodesRef)

# 2. Update applyLiveMixerState
old_applyLive = """  const applyLiveMixerState = (updatedTracks: Track[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    updatedTracks.forEach((track) => {
      const gainNode = trackVolumeNodesRef.current[track.id];
      if (gainNode) {
        const targetGain = getEffectiveGain(track, updatedTracks);
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.015);
      }
    });
  };"""

new_applyLive = """  const applyLiveMixerState = (updatedTracks: Track[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    updatedTracks.forEach((track) => {
      const gainNode = trackVolumeNodesRef.current[track.id];
      if (gainNode) {
        const targetGain = getEffectiveGain(track, updatedTracks);
        gainNode.gain.cancelScheduledValues(ctx.currentTime);
        gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.015);
      }
      
      track.audioClips?.forEach(clip => {
        const clipGainNode = clipGainNodesRef.current[clip.id];
        if (clipGainNode) {
          const safeVolume = Math.max(0, Math.min(clip.gain ?? 1.0, 2.0));
          clipGainNode.gain.cancelScheduledValues(ctx.currentTime);
          clipGainNode.gain.setTargetAtTime(safeVolume, ctx.currentTime, 0.015);
        }
      });
    });
  };"""
content = content.replace(old_applyLive, new_applyLive)

# 3. Update playbackVersion
old_playback = """  const playbackVersion = useMemo(() => {
     return JSON.stringify(tracks.map(t => ({ id: t.id, clips: t.audioClips, inserts: t.inserts, pan: t.pan })));
  }, [tracks]);"""

new_playback = """  const playbackVersion = useMemo(() => {
     return JSON.stringify(tracks.map(t => ({ 
         id: t.id, 
         clips: t.audioClips?.map(c => ({
             id: c.id,
             startTime: c.startTime,
             duration: c.duration,
             trimStart: c.trimStart,
             trimEnd: c.trimEnd,
             fadeIn: c.fadeIn,
             fadeOut: c.fadeOut
             // Omitting 'gain' to prevent sequencer restart during clip gain drag
         })), 
         inserts: t.inserts, 
         pan: t.pan 
     })));
  }, [tracks]);"""
content = content.replace(old_playback, new_playback)

# 4. Update stopAll
old_stop = """       activeGainNodesRef.current.forEach(g => { try { g.disconnect(); } catch(e){} });
       Object.values(trackVolumeNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
       activeSourcesRef.current = [];
       activeGainNodesRef.current = [];
       trackVolumeNodesRef.current = {};
       Object.values(trackAnalyserNodesRef.current).forEach(a => { try { a.disconnect(); } catch(e){} });"""

new_stop = """       activeGainNodesRef.current.forEach(g => { try { g.disconnect(); } catch(e){} });
       Object.values(trackVolumeNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
       Object.values(clipGainNodesRef.current).forEach(g => { try { g.disconnect(); } catch(e){} });
       activeSourcesRef.current = [];
       activeGainNodesRef.current = [];
       trackVolumeNodesRef.current = {};
       clipGainNodesRef.current = {};
       Object.values(trackAnalyserNodesRef.current).forEach(a => { try { a.disconnect(); } catch(e){} });"""
content = content.replace(old_stop, new_stop)

# 5. Store clip gain node
old_createGain = """               const gainNode = ctx.createGain();
               gainNode.channelCount = 2;
               gainNode.channelCountMode = 'explicit';
               gainNode.channelInterpretation = 'speakers';
               const baseGain = clip.gain ?? 1.0;
               gainNode.gain.value = baseGain;"""

new_createGain = """               const gainNode = ctx.createGain();
               gainNode.channelCount = 2;
               gainNode.channelCountMode = 'explicit';
               gainNode.channelInterpretation = 'speakers';
               const baseGain = clip.gain ?? 1.0;
               gainNode.gain.value = baseGain;
               
               clipGainNodesRef.current[clip.id] = gainNode;"""
content = content.replace(old_createGain, new_createGain)


with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
