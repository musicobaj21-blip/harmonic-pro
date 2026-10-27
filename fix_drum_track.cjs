const fs = require('fs');
let code = fs.readFileSync('src/components/MidiStudio.tsx', 'utf8');

const target1 = `events: [],
        fx: JSON.parse(JSON.stringify(defaultEffects)),
        audioClips: [midiClip as any],`;

const replace1 = `events: notes, // Store notes here for rendering
        fx: JSON.parse(JSON.stringify(defaultEffects)),
        audioClips: [midiClip as any],`;

code = code.replace(target1, replace1);

const target2 = `{track.type === 'audio' ? \`\${track.audioClips?.length || 0} clips\` : \`\${track.events.length} events\`}`;
const replace2 = `{track.type === 'audio' ? \`\${track.audioClips?.length || 0} clips\` : track.isDrumTrack ? '1 patron' : \`\${track.events.length} events\`}`;
code = code.replace(target2, replace2);

fs.writeFileSync('src/components/MidiStudio.tsx', code);
