import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add seekVersion state
state_code = "  const [isRecording, setIsRecording] = useState(false);\n  const [seekVersion, setSeekVersion] = useState(0);"
content = content.replace("  const [isRecording, setIsRecording] = useState(false);", state_code)

# 2. Add seekVersion to dependency array
old_deps = "  }, [isSequencerPlaying, isLooping, playbackVersion, exportRange]);"
new_deps = "  }, [isSequencerPlaying, isLooping, playbackVersion, exportRange, seekVersion]);"
content = content.replace(old_deps, new_deps)

# 3. Change setPlaybackVersion to setSeekVersion
old_seek = "setPlaybackVersion(v => v + 1);"
new_seek = "setSeekVersion(v => v + 1);"
content = content.replace(old_seek, new_seek)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
