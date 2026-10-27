import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

# 1. Add refs at the top
refs_code = """  const [seekVersion, setSeekVersion] = useState(0);
  const playbackStartTimeRef = useRef(0);
  const playbackStartOffsetRef = useRef(0);"""
content = content.replace("  const [seekVersion, setSeekVersion] = useState(0);", refs_code)

# 2. Update calculateTotalDuration again to make sure it's Math.max(300, max + 60)
old_calc = """    // Añadir 60 segundos de espacio libre a la derecha
    return Math.max(60, max + 60);"""
new_calc = """    // Añadir 60 segundos de espacio libre a la derecha
    return Math.max(300, max + 60);"""
content = content.replace(old_calc, new_calc)

# 3. Update the Timeline flexbox container
old_container = """        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-[#050507]" ref={timelineScrollRef}>
           <div className="relative min-w-full h-full" style={{ width: 'max(100%, 3000px)' }}>"""
new_container = """        {/* Timeline */}
        <div className="flex-1 overflow-auto relative bg-[#050507]" ref={timelineScrollRef}>
           <div className="relative flex flex-col shrink-0 min-w-max h-full" style={{ width: `${totalTimelineDurationSec * zoom}px` }}>"""
content = content.replace(old_container, new_container)

# 4. Update ruler to have w-full and shrink-0
old_ruler_class = '<div className="h-8 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden cursor-ew-resize"'
new_ruler_class = '<div className="h-8 w-full shrink-0 sticky top-0 bg-[#050507] border-b border-zinc-800 z-30 flex items-end overflow-hidden cursor-ew-resize"'
content = content.replace(old_ruler_class, new_ruler_class)

# 5. Update seek logic to sync refs
old_update_pos = """                     const updatePosition = (clientX: number) => {
                       const rect = rulerElement.getBoundingClientRect();
                       // Calcular X relativo, permitiendo desborde y sumando el scroll actual
                       // La regla de timelineScrollRef puede tener un scrollLeft
                       const x = Math.max(0, clientX - rect.left + timelineScrollRef.current!.scrollLeft);
                       const time = (x / zoom) * 1000;
                       
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                     };"""
new_update_pos = """                     const updatePosition = (clientX: number) => {
                       const rect = rulerElement.getBoundingClientRect();
                       // Calcular X relativo, permitiendo desborde y sumando el scroll actual
                       // La regla de timelineScrollRef puede tener un scrollLeft
                       const x = Math.max(0, clientX - rect.left + timelineScrollRef.current!.scrollLeft);
                       const time = (x / zoom) * 1000;
                       
                       seekOffsetRef.current = time;
                       setPlayheadTime(time);
                       if (playheadRef.current) playheadRef.current.style.left = `${x}px`;
                       
                       // Sincronizar el bucle de animación para evitar rubber-banding
                       playbackStartOffsetRef.current = time;
                       playbackStartTimeRef.current = performance.now();
                     };"""
content = content.replace(old_update_pos, new_update_pos)

# 6. Update loop and useEffect start code to use the refs
old_loop_setup = """      const startTime = performance.now();
      const startOffset = seekOffsetRef.current;
      const ctxStartTime = ctx.currentTime;"""
new_loop_setup = """      playbackStartTimeRef.current = performance.now();
      playbackStartOffsetRef.current = seekOffsetRef.current;
      const ctxStartTime = ctx.currentTime;"""
content = content.replace(old_loop_setup, new_loop_setup)

old_loop_engine = """      const loop = (time: number) => {
        let currentPlayhead = startOffset + (time - startTime);"""
new_loop_engine = """      const loop = (time: number) => {
        let currentPlayhead = playbackStartOffsetRef.current + (time - playbackStartTimeRef.current);"""
content = content.replace(old_loop_engine, new_loop_engine)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
