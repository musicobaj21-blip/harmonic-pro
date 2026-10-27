import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_undo = """  const undoLastAction = () => {
    if (history.length === 0) return;
    const previousTracks = history[history.length - 1];
    setTracks(previousTracks);
    globalTracksState = previousTracks;
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTrackId('');
    setSelectedClipIds([]);
  };"""

new_undo = """  const undoLastAction = () => {
    if (history.length === 0) return;
    const previousTracks = history[history.length - 1];
    setTracks(previousTracks);
    globalTracksState = previousTracks;
    applyLiveMixerState(previousTracks);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTrackId('');
    setSelectedClipIds([]);
  };"""

if old_undo in content:
    content = content.replace(old_undo, new_undo)
    print("Fixed undo")
else:
    print("Could not find undo")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

