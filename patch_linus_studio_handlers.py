import sys

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# find a place to insert the handlers, maybe right before the return statement.
idx = content.find("  return (\n    <div className=\"flex flex-col h-full")
if idx == -1:
    print("Could not find insertion point")
    sys.exit(1)

handlers = """
  const addMidiTrack = () => {
    commitProjectChange(prev => [...prev, {
       id: `track-${Date.now()}`,
       name: `Nueva Pista MIDI`,
       type: 'midi',
       color: 'bg-emerald-600',
       instrument: 'acoustic_grand_piano',
       volume: 1.0,
       pan: 0,
       isMuted: false,
       isSolo: false,
       events: [],
       audioClips: []
    }]);
  };

  const addAudioTrack = (mode: 'mono' | 'stereo') => {
    commitProjectChange(prev => [...prev, {
       id: `track-${Date.now()}`,
       name: `Nueva Pista Audio (${mode.toUpperCase()})`,
       type: 'audio',
       channelMode: mode,
       color: 'bg-blue-600',
       volume: 1.0,
       pan: 0,
       isMuted: false,
       isSolo: false,
       events: [],
       audioClips: []
    }]);
  };

"""

content = content[:idx] + handlers + content[idx:]

with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)

print("Patched handlers.")
