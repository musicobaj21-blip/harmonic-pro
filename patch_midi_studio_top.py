import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

idx = content.find("const TempoInput = ")
if idx == -1:
    print("Could not find TempoInput")
    sys.exit(1)

new_code = """
export default function MidiStudio() {
  const [tracks, setTracks] = useState<Track[]>(globalTracksState);
  const [activeTrackId, setActiveTrackId] = useState(globalActiveTrackId);
  const [bpm, setBpm] = useState(120);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [zoom, setZoom] = useState(50);
  const [snapMode, setSnapMode] = useState<'libre' | 'compas' | 'pulso' | '1/16'>('libre');
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'scissors' | 'eraser'>('pointer');
  const [selectedClipIds, setSelectedClipIds] = useState<{trackId: string, clipId: string}[]>([]);
  const [exportRange, setExportRange] = useState({ start: 0, end: 0, active: false });
  const [editingPianoRollTrackId, setEditingPianoRollTrackId] = useState<string | null>(null);
  const [editingAudioClip, setEditingAudioClip] = useState<{trackId: string, clipId: string} | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [fxModalTrackId, setFxModalTrackId] = useState<string | null>(null);
  const [selectedDrumPattern, setSelectedDrumPattern] = useState('none');
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number>(0);
  const seekOffsetRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    setTracks(updater);
    globalTracksState = updater(tracks);
  };

  const togglePlayback = () => setIsSequencerPlaying(!isSequencerPlaying);
  const handleDrumStyleSelect = (val: string) => setSelectedDrumPattern(val);
  const importExternalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    // mock for now
  };
  const addMidiTrack = () => {
    commitProjectChange(prev => [...prev, { id: Date.now().toString(), name: 'Pista MIDI', isMuted: false, isSolo: false, events: [], instrument: 'piano', volume: 1.0, pan: 0, effects: JSON.parse(JSON.stringify(defaultEffects)) }]);
  };
  const addAudioTrack = (type: 'mono' | 'stereo') => {
    commitProjectChange(prev => [...prev, { id: Date.now().toString(), name: `Pista Audio ${type}`, isMuted: false, isSolo: false, events: [], instrument: 'audio', channelMode: type, volume: 1.0, pan: 0, effects: JSON.parse(JSON.stringify(defaultEffects)) }]);
  };

  useEffect(() => {
    globalActiveTrackId = activeTrackId;
  }, [activeTrackId]);
  
  useEffect(() => {
    // mock playback loop
    if (isSequencerPlaying) {
      let startTime = performance.now();
      const loop = (time: number) => {
        setPlayheadTime(seekOffsetRef.current + (time - startTime));
        requestRef.current = requestAnimationFrame(loop);
      };
      requestRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSequencerPlaying]);
"""

# replace up to `return (` inside TempoInput
idx_return = content.find("  return (", idx)

content = content[:idx] + new_code + content[idx_return:]

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)

print("Restored missing state and functions")
