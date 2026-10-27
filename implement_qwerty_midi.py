import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

qwerty_code = """
  // QWERTY Virtual MIDI Keyboard
  useEffect(() => {
    if (!studioSettings.isQwertyMidiEnabled) return;
    
    const keyToNote: Record<string, number> = {
      'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64,
      'f': 65, 't': 66, 'g': 67, 'y': 68, 'h': 69,
      'u': 70, 'j': 71, 'k': 72, 'o': 73, 'l': 74, 'p': 75, ';': 76, '\'': 77
    };
    
    const pressedKeys = new Set<string>();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key.toLowerCase();
      if (keyToNote[key] && !pressedKeys.has(key)) {
        pressedKeys.add(key);
        if (typeof (window as any).simulateMidiEvent === 'function') {
          (window as any).simulateMidiEvent(9, 0, keyToNote[key], 100);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToNote[key]) {
        pressedKeys.delete(key);
        if (typeof (window as any).simulateMidiEvent === 'function') {
          (window as any).simulateMidiEvent(8, 0, keyToNote[key], 0);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [studioSettings.isQwertyMidiEnabled]);
"""

# Insert this before MidiStudio's return
content = content.replace("  const applyLiveMixerState = (updatedTracks: Track[]) => {", qwerty_code + "\n  const applyLiveMixerState = (updatedTracks: Track[]) => {")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

