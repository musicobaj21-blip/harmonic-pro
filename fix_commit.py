import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_commit = """  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    saveToHistory();
    setTracks(prev => {
      const next = updater(prev);
      globalTracksState = next;
      return next;
    });
  };"""

new_commit = """  const commitProjectChange = (updater: (prev: Track[]) => Track[]) => {
    saveToHistory();
    setTracks(prev => {
      const next = updater(prev);
      globalTracksState = next;
      applyLiveMixerState(next);
      return next;
    });
  };"""

if old_commit in content:
    content = content.replace(old_commit, new_commit)
    print("Fixed commitProjectChange")
else:
    print("Could not find commitProjectChange")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

