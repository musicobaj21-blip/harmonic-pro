import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

settings_state = """  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studioSettings, setStudioSettings] = useState({
    sampleRate: 48000,
    bufferSize: 256,
    isQwertyMidiEnabled: true,
    preRollBars: 1,
    clickVolume: 80,
    autoSaveInterval: '5',
    visualFps: 60
  });"""

content = content.replace("  const [isSettingsOpen, setIsSettingsOpen] = useState(false);", settings_state)

# Replace usage of StudioSettingsModal
old_modal = """      <StudioSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />"""

new_modal = """      <StudioSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={studioSettings}
        onSettingsChange={(newSettings) => {
          setStudioSettings(newSettings);
        }}
      />"""

content = content.replace(old_modal, new_modal)

# Pass QWERTY disabled prop or modify QWERTY hook?
# Currently useMIDI just captures keyboard events.
# We can pass isQwertyMidiEnabled to useMIDI or MidiStudio can just ignore it? Let's check useMIDI hook.

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
