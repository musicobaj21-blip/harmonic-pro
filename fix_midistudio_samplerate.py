import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

content = content.replace("        onSettingsChange={(newSettings) => {\n          setStudioSettings(newSettings);\n        }}",
"""        onSettingsChange={async (newSettings) => {
          setStudioSettings(newSettings);
          const { setAudioContextOptions } = await import('../utils/audio');
          await setAudioContextOptions(newSettings.sampleRate);
        }}""")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
