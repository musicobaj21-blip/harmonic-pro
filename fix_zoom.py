import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Fix hotkey G
old_g_hotkey = """      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev / 1.25, 10));
        return;
      }"""
new_g_hotkey = """      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev / 1.25, 2));
        return;
      }"""
content = content.replace(old_g_hotkey, new_g_hotkey)

# 2. Add handleZoomToFit after totalMeasures
old_measures = """  const totalMeasures = Math.max(10, Math.ceil(totalTimelineDurationSec / (4 * (60/bpm))));"""
new_measures = """  const totalMeasures = Math.max(10, Math.ceil(totalTimelineDurationSec / (4 * (60/bpm))));

  const handleZoomToFit = () => {
    // Ancho total de la ventana menos el panel de cabeceras de pista (aprox 256px de w-64)
    const availableWidth = window.innerWidth - 260; 
    if (totalTimelineDurationSec <= 0) return;
    const exactZoom = availableWidth / totalTimelineDurationSec;
    const safeZoom = Math.max(1, Math.min(exactZoom, 200));
    setZoom(safeZoom);
  };"""
content = content.replace(old_measures, new_measures)

# 3. Update the zoom toolbar JSX
old_zoom_jsx = """          {/* Botonera de Zoom */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-zinc-500 tracking-wider">ZOOM: {zoom}px/s</span>
            <div className="flex items-center border border-zinc-800 rounded bg-zinc-900 overflow-hidden">
              <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="px-2 py-0.5 hover:bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center transition-colors"><Minus size={12} strokeWidth={2.5}/></button>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="px-2 py-0.5 hover:bg-zinc-800 text-zinc-300 font-bold border-l border-r border-zinc-800 flex items-center justify-center transition-colors"><Plus size={12} strokeWidth={2.5}/></button>
              <button onClick={() => setZoom(50)} className="px-2 py-0.5 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] uppercase font-bold transition-colors">Todo</button>
            </div>
          </div>"""
          
new_zoom_jsx = """          {/* Botonera de Zoom */}
          <div className="flex items-center gap-2 ml-4 border-l border-zinc-800 pl-4">
            <span className="text-[9px] text-zinc-500 font-mono w-24">ZOOM: {zoom.toFixed(1)}px/s</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setZoom(p => Math.max(p / 1.25, 2))}
                className="w-6 h-6 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition"
                title="Alejar (Zoom Out - Tecla G)"
              >
                <Minus size={12} strokeWidth={2.5}/>
              </button>
              <button 
                onClick={() => setZoom(p => Math.min(p * 1.25, 200))}
                className="w-6 h-6 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition"
                title="Acercar (Zoom In - Tecla H)"
              >
                <Plus size={12} strokeWidth={2.5}/>
              </button>
              <button 
                onClick={handleZoomToFit}
                className="px-2 h-6 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                title="Ajustar todo el proyecto a la pantalla"
              >
                TODO
              </button>
            </div>
          </div>"""
content = content.replace(old_zoom_jsx, new_zoom_jsx)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
