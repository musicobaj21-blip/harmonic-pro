import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Replace the old volume sync useEffect with the new live mixer logic
old_sync_effect = """  useEffect(() => {
    // Sync track volumes in real-time
    tracks.forEach(t => {
       if (trackVolumeNodesRef.current[t.id]) {
          trackVolumeNodesRef.current[t.id].gain.setTargetAtTime(t.volume ?? 1.0, getAudioContext().currentTime, 0.05);
       }
    });
  }, [tracks]);"""

new_mixer_logic = """  const tracksRef = useRef(tracks);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  const getEffectiveGain = (track: Track, allTracks: Track[]) => {
    if (track.isMuted) return 0;
    const isAnySoloActive = allTracks.some((t) => t.isSolo);
    if (isAnySoloActive && !track.isSolo) {
      return 0;
    }
    return Math.max(0, Math.min(Number(track.volume ?? 1.0), 1.0));
  };

  const applyLiveMixerState = (updatedTracks: Track[]) => {
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
  };

  const toggleMute = (trackId: string) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, isMuted: !t.isMuted } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  const toggleSolo = (trackId: string) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, isSolo: !t.isSolo } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };

  const handleVolumeChange = (trackId: string, newVolume: number) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, volume: newVolume } : t));
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };"""

content = content.replace(old_sync_effect, new_mixer_logic)

# 2. Update the main playback useEffect dependencies and logic
# We need to remove `tracks` from dependencies and use `tracksRef.current`
# Let's find the start of the useEffect
old_playback_effect_start = """  useEffect(() => {
    let ctx: AudioContext;
    let loopCheckerId: number;

    const stopAll = () => {"""

new_playback_effect_start = """  // Playback Version State to trigger sequencer restart only when non-mixer state changes
  const playbackVersion = useMemo(() => {
     return JSON.stringify(tracks.map(t => ({ id: t.id, clips: t.audioClips, inserts: t.inserts, pan: t.pan })));
  }, [tracks]);

  useEffect(() => {
    let ctx: AudioContext;
    let loopCheckerId: number;

    const stopAll = () => {"""

content = content.replace(old_playback_effect_start, new_playback_effect_start)

old_start_audio_clips = """      // Start audio clips
      tracks.forEach(track => {
         if (track.isMuted) return;"""

new_start_audio_clips = """      // Start audio clips
      tracksRef.current.forEach(track => {"""

content = content.replace(old_start_audio_clips, new_start_audio_clips)

old_track_volume = """         trackVolumeNode.gain.value = track.volume ?? 1.0;"""

new_track_volume = """         trackVolumeNode.gain.value = getEffectiveGain(track, tracksRef.current);"""

content = content.replace(old_track_volume, new_track_volume)

old_deps = """  }, [isSequencerPlaying, isLooping, tracks, exportRange]);"""
new_deps = """  }, [isSequencerPlaying, isLooping, playbackVersion, exportRange]);"""

content = content.replace(old_deps, new_deps)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

print("Mixer logic injected")
