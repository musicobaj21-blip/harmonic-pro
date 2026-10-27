import re

with open("src/components/StudioSettingsModal.tsx", "r") as f:
    content = f.read()

# Add temp state for settings
state_code = """  const [activeTab, setActiveTab] = useState<TabType>('audio');
  
  const [localSettings, setLocalSettings] = useState<StudioSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const updateSetting = (key: keyof StudioSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const latencyMs = ((localSettings.bufferSize / localSettings.sampleRate) * 1000 * 2).toFixed(1);
"""

content = content.replace("  const [activeTab, setActiveTab] = useState<TabType>('audio');", state_code)

# Audio Tab updates
content = content.replace("""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" defaultValue="48000">""",
"""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.sampleRate} onChange={e => updateSetting('sampleRate', parseInt(e.target.value))}>""")

content = content.replace("""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" defaultValue="256">""",
"""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.bufferSize} onChange={e => updateSetting('bufferSize', parseInt(e.target.value))}>""")

content = content.replace("""<span className="text-orange-400">~5.3 ms</span>""",
"""<span className="text-orange-400">~{latencyMs} ms</span>""")

# MIDI Tab updates
# find keyboard
content = content.replace("""<input type="checkbox" defaultChecked className="accent-orange-500 w-3 h-3 bg-zinc-900 border-zinc-700 rounded-sm" />""",
"""<input type="checkbox" checked={true} readOnly className="accent-orange-500 w-3 h-3 bg-zinc-900 border-zinc-700 rounded-sm" />""")

content = content.replace("""<label className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-zinc-900/50 cursor-pointer group">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Teclado QWERTY Virtual</span>
                         <span className="text-[10px] text-zinc-500">Usar el teclado del ordenador como entrada MIDI</span>
                      </div>
                      <div className="relative inline-block w-8 h-4 rounded-full bg-orange-600">
                         <span className="absolute left-[18px] top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow"></span>
                      </div>
                   </label>""",
"""<label className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-zinc-900/50 cursor-pointer group" onClick={(e) => { e.preventDefault(); updateSetting('isQwertyMidiEnabled', !localSettings.isQwertyMidiEnabled); }}>
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Teclado QWERTY Virtual</span>
                         <span className="text-[10px] text-zinc-500">Usar el teclado del ordenador como entrada MIDI</span>
                      </div>
                      <div className={`relative inline-block w-8 h-4 rounded-full transition-colors ${localSettings.isQwertyMidiEnabled ? 'bg-orange-600' : 'bg-zinc-600'}`}>
                         <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow ${localSettings.isQwertyMidiEnabled ? 'left-[18px]' : 'left-0.5'}`}></span>
                      </div>
                   </label>""")

# Metronome updates
content = content.replace("""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" defaultValue="1">""",
"""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.preRollBars} onChange={e => updateSetting('preRollBars', parseInt(e.target.value))}>""")

content = content.replace("""<span className="text-xs text-zinc-500 font-mono">80%</span>""",
"""<span className="text-xs text-zinc-500 font-mono">{localSettings.clickVolume}%</span>""")

content = content.replace("""<input type="range" min="0" max="100" defaultValue="80" className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />""",
"""<input type="range" min="0" max="100" value={localSettings.clickVolume} onChange={e => updateSetting('clickVolume', parseInt(e.target.value))} className="w-full accent-orange-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />""")

# General updates
content = content.replace("""<select onClick={(e) => e.stopPropagation()} className="bg-black border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-zinc-600" defaultValue="5">
                         <option value="5">5 min</option>
                         <option value="10">10 min</option>
                      </select>""",
"""<select onClick={(e) => e.stopPropagation()} value={localSettings.autoSaveInterval} onChange={e => updateSetting('autoSaveInterval', e.target.value)} className="bg-black border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-zinc-600">
                         <option value="5">5 min</option>
                         <option value="10">10 min</option>
                         <option value="off">Off</option>
                      </select>""")

content = content.replace("""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" defaultValue="60">""",
"""<select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.visualFps} onChange={e => updateSetting('visualFps', parseInt(e.target.value))}>""")

# Save changes
content = content.replace("""              onClick={async () => {
                await applyAudioOutputSink(selectedOutput);
                onClose();
              }}""",
"""              onClick={async () => {
                onSettingsChange(localSettings);
                await applyAudioOutputSink(selectedOutput);
                onClose();
              }}""")

# Add MIDI detection status
content = content.replace("""                     {/* Placeholder for actual MIDI devices */}
                     <p className="text-xs text-zinc-600 italic">No hay dispositivos MIDI físicos detectados.</p>""",
"""                     <div className="text-xs text-zinc-400">
                       <MidiStatusMessage />
                     </div>""")

import_midi = """import React, { useState, useEffect } from 'react';

const MidiStatusMessage = () => {
   const [status, setStatus] = useState('Buscando dispositivos MIDI...');
   
   useEffect(() => {
     let isMounted = true;
     if (navigator.requestMIDIAccess) {
       navigator.requestMIDIAccess().then(midiAccess => {
         if (!isMounted) return;
         if (midiAccess.inputs.size > 0) {
           let devices = [];
           midiAccess.inputs.forEach(input => {
             devices.push(input.name || 'Dispositivo MIDI Desconocido');
           });
           setStatus(`Dispositivos detectados: ${devices.join(', ')}`);
         } else {
           setStatus('No hay dispositivos MIDI físicos detectados.');
         }
       }).catch(() => {
         if (isMounted) setStatus('No hay dispositivos MIDI físicos detectados.');
       });
     } else {
       setStatus('Web MIDI API no soportada en este navegador.');
     }
     return () => { isMounted = false; };
   }, []);
   
   return <p className="italic">{status}</p>;
};"""

content = content.replace("import React, { useState, useEffect } from 'react';", import_midi)

with open("src/components/StudioSettingsModal.tsx", "w") as f:
    f.write(content)
