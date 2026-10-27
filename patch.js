const fs = require('fs');
let content = fs.readFileSync('src/components/MidiStudio.tsx', 'utf8');

// 1. Add import
content = content.replace("import { setMasterVolume } from '../utils/audio';", "import { setMasterVolume } from '../utils/audio';\nimport { detectAudioHitpoints, calculateQuantizedTime } from '../utils/audioQuantization';");

// 2. Add state
const stateInsertionPoint = "const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; trackId: string | null }>({ visible: false, x: 0, y: 0, trackId: null });";
const stateToAdd = `
  const [audioClipContextMenu, setAudioClipContextMenu] = useState<{ visible: boolean; x: number; y: number; trackId: string; clipId: string } | null>(null);
  const [quantizeModal, setQuantizeModal] = useState<{ visible: boolean; trackId: string; clipId: string } | null>(null);
  const [quantizeSettings, setQuantizeSettings] = useState<{ subdivision: number, strength: number }>({ subdivision: 16, strength: 80 });
`;
content = content.replace(stateInsertionPoint, stateInsertionPoint + stateToAdd);

// 3. Add handleQuantize function
const fnInsertionPoint = "const handleClipMouseDown = (e: React.MouseEvent, type: 'midi' | 'audio', trackId: string, clipId?: string) => {";
const fnToAdd = `
  const applyQuantization = () => {
    if (!quantizeModal) return;
    const { trackId, clipId } = quantizeModal;
    const track = latestTracksRef.current.find(t => t.id === trackId);
    if (!track || !track.audioClips) return;
    const originalClip = track.audioClips.find(c => c.id === clipId);
    if (!originalClip || !originalClip.buffer) return;

    const hitpoints = detectAudioHitpoints(originalClip.buffer);
    const newClips: any[] = [];
    hitpoints.sort((a, b) => a - b);
    
    for (let i = 0; i < hitpoints.length; i++) {
        const hpTime = hitpoints[i];
        if (hpTime < (originalClip.trimStart || 0)) continue;
        const actualBufferDuration = originalClip.buffer.duration;
        const maxEnd = actualBufferDuration - (originalClip.trimEnd || 0);
        if (hpTime >= maxEnd) continue;

        const nextHpTime = i < hitpoints.length - 1 ? hitpoints[i + 1] : maxEnd;
        const durationSec = nextHpTime - hpTime;

        const relativeStartMs = (hpTime - (originalClip.trimStart || 0)) * 1000;
        const currentStartTimeMs = originalClip.startTime + relativeStartMs;
        
        const humanizedStartMs = calculateQuantizedTime(currentStartTimeMs, bpm, quantizeSettings.subdivision, quantizeSettings.strength / 100);

        newClips.push({
            ...originalClip,
            id: originalClip.id + '_q_' + i,
            startTime: humanizedStartMs,
            trimStart: hpTime,
            trimEnd: actualBufferDuration - nextHpTime,
            duration: durationSec,
            fadeIn: 0.003,
            fadeOut: 0.005
        });
    }

    if (newClips.length > 0) {
        commitProjectChange(latestTracksRef.current.map(t => t.id === trackId ? {
            ...t,
            audioClips: [...(t.audioClips?.filter(c => c.id !== clipId) || []), ...newClips]
        } : t));
    }
    setQuantizeModal(null);
  };
`;
content = content.replace(fnInsertionPoint, fnToAdd + fnInsertionPoint);

fs.writeFileSync('src/components/MidiStudio.tsx', content);
