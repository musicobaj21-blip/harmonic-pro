import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_useeffect = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'g' || e.key === 'G') {
        setTrackHeight(prev => Math.max(40, prev - 10));
      } else if (e.key === 'h' || e.key === 'H') {
        setTrackHeight(prev => Math.min(200, prev + 10));
      } else if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        setIsSequencerPlaying(prev => !prev);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTrackId) {
        e.preventDefault();
        commitProjectChange(prev => prev.filter(t => t.id !== selectedTrackId));
        setSelectedTrackId('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrackId]);"""

new_useeffect = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastAction();
        return;
      }

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev * 1.25, 200));
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev / 1.25, 10));
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipIds.length > 0) {
           e.preventDefault();
           commitProjectChange(prev => prev.map(t => ({
             ...t,
             audioClips: t.audioClips?.filter(c => !selectedClipIds.some(sc => sc.clipId === c.id))
           })));
           setSelectedClipIds([]);
           return;
        } else if (selectedTrackId) {
           e.preventDefault();
           commitProjectChange(prev => prev.filter(t => t.id !== selectedTrackId));
           setSelectedTrackId('');
           return;
        }
      }
      
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        setIsSequencerPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrackId, selectedClipIds, history, tracks]);"""

if old_useeffect in content:
    content = content.replace(old_useeffect, new_useeffect)
    print("Replaced handleKeyDown useEffect")
else:
    print("Could not find handleKeyDown useEffect")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
