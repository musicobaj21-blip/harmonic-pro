import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add TrackVUMeter component at the top level or outside MidiStudio, or inside. 
# Outside is better. I'll put it before MidiStudio function.

vu_meter_code = """
const TrackVUMeter = ({ trackId, isPlaying, trackAnalyserNodesRef }: { trackId: string, isPlaying: boolean, trackAnalyserNodesRef: React.MutableRefObject<Record<string, AnalyserNode>> }) => {
  const [level, setLevel] = useState(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const updateMeter = () => {
      const analyserNode = trackAnalyserNodesRef.current[trackId];
      if (isPlaying && analyserNode) {
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(dataArray);

        // Calcular nivel RMS (0.0 a 1.0)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const amplitude = (dataArray[i] - 128) / 128;
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        // Exagerar ligeramente el factor para visibilidad visual óptima (0 a 1)
        setLevel(Math.min(1, rms * 3.5));
      } else {
        setLevel(0);
      }
      requestRef.current = requestAnimationFrame(updateMeter);
    };

    requestRef.current = requestAnimationFrame(updateMeter);
    return () => cancelAnimationFrame(requestRef.current);
  }, [trackId, isPlaying, trackAnalyserNodesRef]);

  return (
    <div className="flex items-end gap-[2px] h-3 ml-1 px-0.5 select-none" title="Nivel de Salida VU">
      {/* Barra 1 (Bajo/Presencia) - Celeste Cyan */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 ${
          level > 0.05 ? 'h-1.5 bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.6)]' : 'h-1 bg-zinc-800'
        }`}
      />
      {/* Barra 2 (Medio) - Celeste Cyan */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 ${
          level > 0.25 ? 'h-2 bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'h-1 bg-zinc-800'
        }`}
      />
      {/* Barra 3 (Alto) - Naranjo Marca Linus */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 ${
          level > 0.55 ? 'h-2.5 bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]' : 'h-1 bg-zinc-800'
        }`}
      />
      {/* Barra 4 (Pico / Clip) - Naranjo Intenso */}
      <div
        className={`w-[2px] rounded-t-sm transition-all duration-75 ${
          level > 0.8 ? 'h-3 bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,1)]' : 'h-1 bg-zinc-800'
        }`}
      />
    </div>
  );
};
"""

content = content.replace("function MidiStudio({ onBack }: MidiStudioProps = {}) {", vu_meter_code + "\nfunction MidiStudio({ onBack }: MidiStudioProps = {}) {")

# 2. Add trackAnalyserNodesRef
content = content.replace("const trackVolumeNodesRef = useRef<Record<string, GainNode>>({});", "const trackVolumeNodesRef = useRef<Record<string, GainNode>>({});\n  const trackAnalyserNodesRef = useRef<Record<string, AnalyserNode>>({});")

# 3. Disconnect analyser nodes on stop
content = content.replace("trackVolumeNodesRef.current = {};", "trackVolumeNodesRef.current = {};\n       Object.values(trackAnalyserNodesRef.current).forEach(a => { try { a.disconnect(); } catch(e){} });\n       trackAnalyserNodesRef.current = {};")

# 4. Create and connect AnalyserNode in playback loop
old_playback_routing = """         trackVolumeNode.connect(trackPannerNode);
         trackPannerNode.connect(getPlaybackMasterGain());
         trackVolumeNodesRef.current[track.id] = trackVolumeNode;
         activeGainNodesRef.current.push(trackInputNode, trackVolumeNode);"""

new_playback_routing = """         trackVolumeNode.connect(trackPannerNode);
         trackPannerNode.connect(getPlaybackMasterGain());
         
         const analyserNode = ctx.createAnalyser();
         analyserNode.fftSize = 64;
         analyserNode.smoothingTimeConstant = 0.6;
         trackVolumeNode.connect(analyserNode);
         
         trackVolumeNodesRef.current[track.id] = trackVolumeNode;
         trackAnalyserNodesRef.current[track.id] = analyserNode;
         activeGainNodesRef.current.push(trackInputNode, trackVolumeNode);"""

content = content.replace(old_playback_routing, new_playback_routing)

# 5. Replace UI placeholder
old_ui_placeholder = """                    <div className="flex gap-[2px] items-end h-3 opacity-40">
                      <div className="w-[2px] h-[3px] bg-zinc-500 rounded-sm"></div>
                      <div className="w-[2px] h-[5px] bg-zinc-500 rounded-sm"></div>
                      <div className="w-[2px] h-[7px] bg-zinc-500 rounded-sm"></div>
                      <div className="w-[2px] h-[9px] bg-zinc-500 rounded-sm"></div>
                    </div>"""

new_ui_placeholder = """                    <TrackVUMeter isPlaying={isSequencerPlaying} trackId={t.id} trackAnalyserNodesRef={trackAnalyserNodesRef} />"""

content = content.replace(old_ui_placeholder, new_ui_placeholder)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

print("VU Meter logic added.")
