import re

with open("src/components/StudioSettingsModal.tsx", "r") as f:
    content = f.read()

new_props = """export interface StudioSettings {
  sampleRate: number;
  bufferSize: number;
  isQwertyMidiEnabled: boolean;
  preRollBars: number;
  clickVolume: number;
  autoSaveInterval: string;
  visualFps: number;
}

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onSettingsChange: (newSettings: StudioSettings) => void;
}"""

content = re.sub(r'interface StudioSettingsModalProps \{[\s\S]*?\}', new_props, content)

content = content.replace("export default function StudioSettingsModal({ isOpen, onClose }: StudioSettingsModalProps) {", "export default function StudioSettingsModal({ isOpen, onClose, settings, onSettingsChange }: StudioSettingsModalProps) {")


with open("src/components/StudioSettingsModal.tsx", "w") as f:
    f.write(content)
