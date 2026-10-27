import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add useMetronome and state
metronome_state = """  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { playCountIn, setVolume: setMetronomeVolume } = useMetronome(120);

  useEffect(() => {
    setMetronomeVolume(studioSettings.clickVolume / 100);
  }, [studioSettings.clickVolume, setMetronomeVolume]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsSequencerPlaying(false);
    } else {
      if (studioSettings.preRollBars > 0) {
        // start count in
        playCountIn(studioSettings.preRollBars, () => {
          setIsRecording(true);
          setIsSequencerPlaying(true);
        });
      } else {
        setIsRecording(true);
        setIsSequencerPlaying(true);
      }
    }
  };
"""

content = content.replace("  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);", metronome_state)

# 2. Update record button in transport
old_record_btn = """          <button className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#121214] text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/30`}>
            <Circle size={12} fill="currentColor" />
          </button>"""

new_record_btn = """          <button onClick={toggleRecording} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${isRecording ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-[#121214] text-red-500 hover:bg-red-500/20 border-red-500/30'}`}>
            <Circle size={12} fill="currentColor" />
          </button>"""

content = content.replace(old_record_btn, new_record_btn)

# 3. Handle Auto-Save
autosave_code = """
  // Auto-Save feature
  useEffect(() => {
    if (!studioSettings.autoSaveInterval || studioSettings.autoSaveInterval === 'off') return;
    
    const ms = parseInt(studioSettings.autoSaveInterval) * 60 * 1000;
    if (isNaN(ms) || ms <= 0) return;
    
    const timer = setInterval(() => {
      localStorage.setItem('linus_project_autosave', JSON.stringify({ tracks }));
      console.log(`Auto-saved at ${new Date().toLocaleTimeString()}`);
    }, ms);
    
    return () => clearInterval(timer);
  }, [studioSettings.autoSaveInterval, tracks]);
"""

content = content.replace("  // QWERTY Virtual MIDI Keyboard", autosave_code + "\n  // QWERTY Virtual MIDI Keyboard")

# 4. Handle Visual FPS for VU Meter
# We'll pass it to TrackVUMeter.
content = content.replace("<TrackVUMeter isPlaying={isSequencerPlaying} trackId={t.id} trackAnalyserNodesRef={trackAnalyserNodesRef} />",
"""<TrackVUMeter isPlaying={isSequencerPlaying} trackId={t.id} trackAnalyserNodesRef={trackAnalyserNodesRef} visualFps={studioSettings.visualFps} />""")

# Update TrackVUMeter definition
old_vumeter_def = """const TrackVUMeter = ({ trackId, isPlaying, trackAnalyserNodesRef }: { trackId: string, isPlaying: boolean, trackAnalyserNodesRef: React.MutableRefObject<Record<string, AnalyserNode>> }) => {"""
new_vumeter_def = """const TrackVUMeter = ({ trackId, isPlaying, trackAnalyserNodesRef, visualFps = 60 }: { trackId: string, isPlaying: boolean, trackAnalyserNodesRef: React.MutableRefObject<Record<string, AnalyserNode>>, visualFps?: number }) => {"""
content = content.replace(old_vumeter_def, new_vumeter_def)

old_vumeter_fps = """      requestRef.current = requestAnimationFrame(updateMeter);
    };

    requestRef.current = requestAnimationFrame(updateMeter);"""
    
new_vumeter_fps = """      if (visualFps < 60) {
        setTimeout(() => {
          requestRef.current = requestAnimationFrame(updateMeter);
        }, 1000 / visualFps);
      } else {
        requestRef.current = requestAnimationFrame(updateMeter);
      }
    };

    requestRef.current = requestAnimationFrame(updateMeter);"""
    
content = content.replace(old_vumeter_fps, new_vumeter_fps)


with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
