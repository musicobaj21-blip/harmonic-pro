import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_buttons = """                    {/* Controles de Consola: MUTE / SOLO */}
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


new_buttons = """                    {/* Controles de Consola: MUTE / SOLO */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* BOTÓN MUTE (M) - Naranjo Marca Linus */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono transition border flex items-center justify-center select-none ${
                          t.isMuted
                            ? 'bg-orange-600 text-white font-bold border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                            : 'bg-zinc-800/90 text-zinc-400 border-zinc-700/80 hover:text-white hover:bg-zinc-700 hover:border-zinc-600'
                        }`}
                        title="Silenciar pista (Mute)"
                      >
                        M
                      </button>

                      {/* BOTÓN SOLO (S) - Celeste Cyan Forma de Onda */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSolo(t.id);
                        }}
                        className={`w-5 h-5 rounded text-[10px] font-mono transition border flex items-center justify-center select-none ${
                          t.isSolo
                            ? 'bg-cyan-500 text-black font-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                            : 'bg-zinc-800/90 text-zinc-400 border-zinc-700/80 hover:text-white hover:bg-zinc-700 hover:border-zinc-600'
                        }`}
                        title="Escuchar solo esta pista (Solo)"
                      >
                        S
                      </button>
                    </div>"""

if old_buttons in content:
    content = content.replace(old_buttons, new_buttons)
    print("Replaced Mute and Solo buttons")
else:
    print("Could not find the original Mute and Solo buttons code")

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)

