import re

with open('src/components/MidiStudio.tsx', 'r') as f:
    content = f.read()

# 1. Imports
if "import { Midi }" not in content:
    content = content.replace("import { ExportModal } from './ExportModal';", "import { ExportModal } from './ExportModal';\nimport { Midi } from '@tonejs/midi';\nimport { generateId } from '../utils/music'; // or similar")

# 2. Add importExternalFile and state
import_code = """
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const importExternalFile = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else {
      file = e.target.files?.[0] || null;
    }
    
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.mid') || file.name.toLowerCase().endsWith('.midi')) {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      
      if (midi.header.tempos.length > 0) {
         setBpm(Math.round(midi.header.tempos[0].bpm));
      }

      const newTracks = midi.tracks.map((track, i) => {
         const events = track.notes.map(note => ({
            note: note.midi,
            velocity: Math.floor(note.velocity * 127),
            timestamp: note.time * 1000,
            duration: note.duration * 1000
         }));

         return {
            id: 'import_' + Date.now() + '_' + i,
            name: track.name || `MIDI Track ${i+1}`,
            type: 'soundfont',
            isMuted: false,
            isSolo: false,
            isArmed: false,
            events: events,
            instrument: 'acoustic_grand_piano',
            volume: 1.0,
            pan: 0,
            fx: { delay: { enabled: false, mix: 0.3, time: 0.4, feedback: 0.4 }, reverb: { enabled: false, mix: 0.3, decay: 2.0 }, eq: { enabled: false, low: 0, mid: 0, high: 0 }, filter: { enabled: false, type: 'lowpass' as const, frequency: 2000, resonance: 1 }, chorus: { enabled: false, rate: 1.5, depth: 0.5, mix: 0.5 }, distortion: { enabled: false, amount: 0.5, mix: 0.5 }, compressor: { enabled: false, threshold: -24, ratio: 12, attack: 0.003, release: 0.25 } },
            monitor: false,
            audioClips: []
         };
      }).filter(t => t.events.length > 0);

      commitProjectChange([...tracks, ...newTracks as any]);
    } else if (file.type.includes('audio') || file.name.toLowerCase().endsWith('.wav') || file.name.toLowerCase().endsWith('.mp3')) {
      const ac = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ac.decodeAudioData(arrayBuffer);

      const newTrack = {
         id: 'import_' + Date.now(),
         name: file.name,
         type: 'audio',
         isMuted: false,
         isSolo: false,
         isArmed: false,
         events: [],
         audioClips: [{
            id: 'clip_' + Date.now(),
            name: file.name,
            startTime: 0,
            duration: audioBuffer.duration * 1000,
            buffer: audioBuffer,
            trimStart: 0,
            trimEnd: 0,
            fadeIn: 0,
            fadeOut: 0
         }],
         volume: 1.0,
         pan: 0,
         fx: { delay: { enabled: false, mix: 0.3, time: 0.4, feedback: 0.4 }, reverb: { enabled: false, mix: 0.3, decay: 2.0 }, eq: { enabled: false, low: 0, mid: 0, high: 0 }, filter: { enabled: false, type: 'lowpass' as const, frequency: 2000, resonance: 1 }, chorus: { enabled: false, rate: 1.5, depth: 0.5, mix: 0.5 }, distortion: { enabled: false, amount: 0.5, mix: 0.5 }, compressor: { enabled: false, threshold: -24, ratio: 12, attack: 0.003, release: 0.25 } },
         monitor: false
      };
      commitProjectChange([...tracks, newTrack as any]);
    }
    
    if ('target' in e && (e.target as HTMLInputElement).value) {
       (e.target as HTMLInputElement).value = ''; // reset
    }
  };
"""
if "importExternalFile =" not in content:
    content = content.replace("const [masterToast, setMasterToast] = useState<string | null>(null);", "const [masterToast, setMasterToast] = useState<string | null>(null);\n" + import_code)


# 3. Add Import Button
import_button_html = """
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-lg transition-all border border-slate-600 normal-case tracking-normal"
              >
                📥 + Importar Archivo
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".wav,.mp3,.mid,.midi" onChange={importExternalFile} />
              <button 
                onClick={() => setShowExportModal(true)}
"""
if "+ Importar Archivo" not in content:
    content = content.replace("<button \n                onClick={() => setShowExportModal(true)}", import_button_html)

# 4. Add drag over styling and events to Sequencer wrapper
if "onDragOver={(e) =>" not in content:
    content = content.replace('<div className="w-full bg-slate-900/80 rounded-xl border border-slate-700 p-6 flex flex-col gap-4 shadow-2xl">', '<div className={`w-full bg-slate-900/80 rounded-xl border p-6 flex flex-col gap-4 shadow-2xl transition-all ${isDraggingFile ? "border-orange-500 border-dashed bg-orange-500/10" : "border-slate-700"}`} onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }} onDragLeave={() => setIsDraggingFile(false)} onDrop={importExternalFile}>')


# 5. Alt+Drag logic
handleMouseDownOld = """
    let originalMidiEvents = type === 'midi' ? [...track.events] : [];
    let originalAudioClip = type === 'audio' ? track.audioClips?.find(c => c.id === clipId) : null;
    let didMove = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
"""
handleMouseDownNew = """
    let originalMidiEvents = type === 'midi' ? [...track.events] : [];
    let originalAudioClip = type === 'audio' ? track.audioClips?.find(c => c.id === clipId) : null;
    let didMove = false;
    let draggingClipId = clipId;

    if (e.altKey && type === 'audio' && originalAudioClip) {
      originalAudioClip = { ...originalAudioClip, id: 'clone_' + Date.now() };
      draggingClipId = originalAudioClip.id;
      // Immediately inject cloned clip into the tracks state so mousemove updates it
      setTracks(prev => prev.map(t => {
         if (t.id !== trackId) return t;
         return {
            ...t,
            audioClips: [...(t.audioClips || []), originalAudioClip as any]
         };
      }));
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
"""
if "draggingClipId = clipId" not in content:
    content = content.replace(handleMouseDownOld, handleMouseDownNew)
    content = content.replace("audioClips: t.audioClips?.map(c => c.id === clipId ? { ...c, startTime: Math.max(0, originalAudioClip.startTime + safeDeltaMs) } : c)", "audioClips: t.audioClips?.map(c => c.id === draggingClipId ? { ...c, startTime: Math.max(0, (originalAudioClip as any).startTime + safeDeltaMs) } : c)")


with open('src/components/MidiStudio.tsx', 'w') as f:
    f.write(content)

print("Updates applied via Python.")
