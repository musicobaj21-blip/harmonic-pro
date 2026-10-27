import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_mute_solo = """                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isMuted: !tr.isMuted } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all border ${t.isMuted ? 'text-orange-500 border-orange-500/50 bg-orange-500/10' : 'text-zinc-500 border-transparent hover:text-orange-400 hover:border-orange-500/50'}`}>M</button>
                    <button onClick={() => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, isSolo: !tr.isSolo } : tr))} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all border ${t.isSolo ? 'text-orange-500 border-orange-500/50 bg-orange-500/10' : 'text-zinc-500 border-transparent hover:text-orange-400 hover:border-orange-500/50'}`}>S</button>"""

new_mute_solo = """                    {/* Controles de Consola: MUTE / SOLO */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition border flex items-center justify-center ${
                          t.isMuted
                            ? 'bg-red-600 text-white border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                        }`}
                        title="Silenciar pista (Mute)"
                      >
                        M
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolo(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition border flex items-center justify-center ${
                          t.isSolo
                            ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                        }`}
                        title="Escuchar solo esta pista (Solo)"
                      >
                        S
                      </button>
                    </div>"""

content = content.replace(old_mute_solo, new_mute_solo)


old_vol_slider = """                  {/* Grupo Derecho: Fader de Volumen Ámbar */}
                  <div className="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="1.5" 
                      step="0.01" 
                      value={t.volume ?? 1.0}
                      onChange={(e) => commitProjectChange(prev => prev.map(tr => tr.id === t.id ? { ...tr, volume: parseFloat(e.target.value) } : tr))}
                      className="w-16 accent-orange-500 h-1 bg-zinc-700 rounded-lg cursor-pointer" 
                    />"""

new_vol_slider = """                  {/* Grupo Derecho: Fader de Volumen Ámbar */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="range" 
                      min="0" 
                      max="1.0" 
                      step="0.01" 
                      value={t.volume ?? 1.0}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleVolumeChange(t.id, parseFloat(e.target.value));
                      }}
                      className="w-16 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none shadow-inner" 
                    />"""

if old_vol_slider in content:
    content = content.replace(old_vol_slider, new_vol_slider)
    print("Replaced Slider")
else:
    print("Could not find old Slider")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

