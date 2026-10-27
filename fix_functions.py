import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_commit = """  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    setTracks(updater);
    globalTracksState = updater(tracks);
  };"""

new_commit = """  const saveToHistory = () => {
    setHistory((prev) => {
        // Prevent saving duplicate consecutive states
        if (prev.length > 0 && prev[prev.length - 1] === tracks) return prev;
        return [...prev.slice(-15), tracks];
    });
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const previousTracks = history[history.length - 1];
    setTracks(previousTracks);
    globalTracksState = previousTracks;
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTrackId('');
    setSelectedClipIds([]);
  };

  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    saveToHistory();
    setTracks(prev => {
      const next = updater(prev);
      globalTracksState = next;
      return next;
    });
  };"""

if old_commit in content:
    content = content.replace(old_commit, new_commit)
    print("Replaced commitProjectChange")
else:
    print("Could not find commitProjectChange")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
