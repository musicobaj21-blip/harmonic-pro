import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MousePointer2, Pencil, Scissors, Eraser, Undo2, Redo2 } from 'lucide-react';
import { getLoadedInstrument } from '../utils/soundfont';
import { getAudioContext, playSingleNote } from '../utils/audio';

interface PianoRollProps {
  track: any;
  maxDuration: number;
  onClose: () => void;
  onSave: (events: any[]) => void;
}

interface NoteBlock {
  id: string;
  note: number;
  startTime: number;
  duration: number;
  velocity: number;
  selected?: boolean;
}

export const PianoRoll: React.FC<PianoRollProps> = ({ track, maxDuration, onClose, onSave }) => {
  const [notes, setNotes] = useState<NoteBlock[]>([]);
  const [history, setHistory] = useState<NoteBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [tool, setTool] = useState<'select' | 'draw' | 'split' | 'erase'>('select');
  
  const [resizing, setResizing] = useState<{ id: string, startX: number, originalDuration: number } | null>(null);
  const [moving, setMoving] = useState<{ id: string, startX: number, startY: number, originalStartTime: number, originalNote: number } | null>(null);
  const [drawing, setDrawing] = useState<{ id: string, startX: number, note: number, startTime: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  
  const [gridStep, setGridStep] = useState<number>(125);
  
  const notesRef = useRef(notes);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  
  const minNote = 36;
  const maxNote = 84;
  const numNotes = maxNote - minNote + 1;
  const keyHeight = 16;
  const pixelsPerSecond = 200;
  const gridWidth = Math.max(1000, (maxDuration / 1000) * pixelsPerSecond + 1000);
  const containerHeight = numNotes * keyHeight;
  
  const bpm = track.bpm || 120;
  const beatsPerSecond = bpm / 60;
  const pixelsPerBeat = pixelsPerSecond / beatsPerSecond;
  const beatsPerBar = 4;
  const barWidth = pixelsPerBeat * beatsPerBar;
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track || !track.events) return;
    const blocks: NoteBlock[] = [];
    const activeNotes = new Map<number, { timestamp: number; velocity: number }>();
    const sortedEvents = [...track.events].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedEvents.forEach(ev => {
      if (ev.type === 'noteOn') {
        activeNotes.set(ev.note, { timestamp: ev.timestamp, velocity: ev.velocity });
      } else if (ev.type === 'noteOff') {
        const active = activeNotes.get(ev.note);
        if (active) {
          blocks.push({
            id: `note-${ev.note}-${active.timestamp}`,
            note: ev.note,
            startTime: active.timestamp,
            duration: ev.timestamp - active.timestamp,
            velocity: active.velocity
          });
          activeNotes.delete(ev.note);
        }
      }
    });
    
    activeNotes.forEach((active, note) => {
      blocks.push({
        id: `note-${note}-${active.timestamp}`,
        note: note,
        startTime: active.timestamp,
        duration: 1000,
        velocity: active.velocity
      });
    });
    
    setNotes(blocks);
    setHistory([blocks]);
    setHistoryIndex(0);
  }, [track]);
  
  useEffect(() => {
    if (scrollRef.current) {
      const centerNote = 60;
      const y = (maxNote - centerNote) * keyHeight - 200;
      scrollRef.current.scrollTop = Math.max(0, y);
    }
  }, []);

  const commitChange = (newNotes: NoteBlock[]) => {
    if (historyIndex === -1) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newNotes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setNotes(newNotes);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setNotes(history[historyIndex - 1]);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(i => i + 1);
      setNotes(history[historyIndex + 1]);
    }
  };

  const handleQuantize = () => {
    const hasSelection = notes.some(n => n.selected);
    let changed = false;
    const newNotes = notes.map(n => {
      if (hasSelection && !n.selected) return n;
      const snappedTime = Math.round(n.startTime / gridStep) * gridStep;
      if (snappedTime !== n.startTime) changed = true;
      return { ...n, startTime: snappedTime };
    });
    if (changed) commitChange(newNotes);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.key.toLowerCase() === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const hasSelection = notes.some(n => n.selected);
        if (hasSelection) {
          const newNotes = notes.filter(n => !n.selected);
          commitChange(newNotes);
        }
      } else if (e.key.toLowerCase() === 'q' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleQuantize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, history, historyIndex, gridStep]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const deltaX = e.clientX - resizing.startX;
        const deltaDuration = (deltaX / pixelsPerSecond) * 1000;
        setNotes(prev => prev.map(n => 
          n.id === resizing.id 
            ? { ...n, duration: Math.max(10, resizing.originalDuration + deltaDuration) } 
            : n
        ));
      } else if (moving) {
        const deltaX = e.clientX - moving.startX;
        const deltaY = e.clientY - moving.startY;
        
        const deltaTime = (deltaX / pixelsPerSecond) * 1000;
        const deltaNotes = Math.round(-deltaY / keyHeight);
        
        let newStartTime = Math.max(0, moving.originalStartTime + deltaTime);
        newStartTime = Math.round(newStartTime / gridStep) * gridStep;
        
        setNotes(prev => prev.map(n => 
          n.id === moving.id 
            ? { 
                ...n, 
                startTime: newStartTime,
                note: Math.max(minNote, Math.min(maxNote, moving.originalNote + deltaNotes))
              } 
            : n
        ));
      } else if (drawing) {
        const deltaX = e.clientX - drawing.startX;
        const deltaDuration = (deltaX / pixelsPerSecond) * 1000;
        const newDuration = Math.max(gridStep, Math.round(deltaDuration / gridStep) * gridStep);
        
        setNotes(prev => prev.map(n => 
          n.id === drawing.id 
            ? { ...n, duration: newDuration }
            : n
        ));
      } else if (selectionBox) {
        const gridEl = document.getElementById('piano-grid-content');
        if (gridEl) {
          const rect = gridEl.getBoundingClientRect();
          const currentX = e.clientX - rect.left;
          const currentY = e.clientY - rect.top;
          
          setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null);
          
          const minX = Math.min(selectionBox.startX, currentX);
          const maxX = Math.max(selectionBox.startX, currentX);
          const minY = Math.min(selectionBox.startY, currentY);
          const maxY = Math.max(selectionBox.startY, currentY);
          
          setNotes(prev => prev.map(n => {
            const noteTop = (maxNote - n.note) * keyHeight;
            const noteLeft = (n.startTime / 1000) * pixelsPerSecond;
            const noteRight = noteLeft + (n.duration / 1000) * pixelsPerSecond;
            const noteBottom = noteTop + keyHeight;
            
            const isIntersecting = !(noteLeft > maxX || noteRight < minX || noteTop > maxY || noteBottom < minY);
            return { ...n, selected: isIntersecting };
          }));
        }
      }
    };
    
    const handleMouseUp = () => {
      if (resizing || moving || drawing || selectionBox) {
        if (!selectionBox) commitChange(notesRef.current);
        setResizing(null);
        setMoving(null);
        setDrawing(null);
        setSelectionBox(null);
      }
    };

    if (resizing || moving || drawing || selectionBox) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, moving, drawing, selectionBox, gridStep]);

  const handleSave = () => {
    const newEvents: any[] = [];
    notes.forEach(note => {
      newEvents.push({ type: 'noteOn', note: note.note, velocity: note.velocity, timestamp: note.startTime });
      newEvents.push({ type: 'noteOff', note: note.note, velocity: 0, timestamp: note.startTime + note.duration });
    });
    newEvents.sort((a, b) => a.timestamp - b.timestamp);
    onSave(newEvents);
    onClose();
  };
  
  const handleGridMouseDown = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'draw') {
      const startTime = (x / pixelsPerSecond) * 1000;
      const note = maxNote - Math.floor(y / keyHeight);
      const snappedTime = Math.round(startTime / gridStep) * gridStep;
      
      const id = `drawn-${Date.now()}`;
      setDrawing({ id, startX: e.clientX, note, startTime: snappedTime });
      
      const newNote: NoteBlock = {
        id,
        note,
        startTime: snappedTime,
        duration: gridStep,
        velocity: 100,
        selected: true
      };
      
      setNotes([...notes.map(n => ({...n, selected: false})), newNote]);
      
      const ac = getAudioContext();
      if (ac.state === 'suspended') await ac.resume();
      const instToUse = track.instrument || 'epiano';
      const inst = getLoadedInstrument(instToUse);
      if (inst) {
        inst.play(note, ac.currentTime, { duration: 0.25, gain: 1.5 });
      } else {
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        playSingleNote(freq, "sine", 0.5, instToUse, 0);
      }
    } else if (tool === 'select') {
      setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
      setNotes(notes.map(n => ({ ...n, selected: false })));
    } else {
      setNotes(notes.map(n => ({ ...n, selected: false })));
    }
  };
  
  const handleNoteMouseDown = (e: React.MouseEvent, note: NoteBlock) => {
    e.stopPropagation();
    
    if (tool === 'erase') {
      const newNotes = notes.filter(n => n.id !== note.id);
      commitChange(newNotes);
      return;
    }
    
    if (tool === 'split') {
      const gridRect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect();
      const gridX = e.clientX - gridRect.left; 
      const clickTime = (gridX / pixelsPerSecond) * 1000;
      const snappedTime = Math.round(clickTime / gridStep) * gridStep;
      
      const splitTime = (snappedTime > note.startTime && snappedTime < note.startTime + note.duration) 
        ? snappedTime 
        : clickTime;
      
      if (splitTime > note.startTime && splitTime < note.startTime + note.duration) {
        const newNotes = notes.filter(n => n.id !== note.id);
        const noteA: NoteBlock = { ...note, id: `split-A-${Date.now()}`, duration: splitTime - note.startTime };
        const noteB: NoteBlock = { ...note, id: `split-B-${Date.now()}`, startTime: splitTime, duration: (note.startTime + note.duration) - splitTime };
        newNotes.push(noteA, noteB);
        commitChange(newNotes);
      }
      return;
    }
    
    let newNotes = notes;
    if (!note.selected) {
      newNotes = notes.map(n => ({ ...n, selected: n.id === note.id }));
      setNotes(newNotes);
    }
    
    if (tool === 'select') {
      setMoving({ id: note.id, startX: e.clientX, startY: e.clientY, originalStartTime: note.startTime, originalNote: note.note });
    }

    const ac = getAudioContext();
    const instToUse = track.instrument || 'epiano';
    const inst = getLoadedInstrument(instToUse);
    if (inst) {
      inst.play(note.note, ac.currentTime, { duration: 0.25, gain: (note.velocity / 127) * 1.5 });
    } else {
      const freq = 440 * Math.pow(2, (note.note - 69) / 12);
      playSingleNote(freq, "sine", (note.velocity / 127) * 0.5, instToUse, 0);
    }
  };
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / pixelsPerSecond) * 1000;
    
    const seekEvent = new CustomEvent('seekPlayback', { detail: { time: seekTime } });
    window.dispatchEvent(seekEvent);
  };

  const getNoteName = (midi: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${notes[midi % 12]}${Math.floor(midi / 12) - 1}`;
  };
  
  const isBlackKey = (midi: number) => {
    const n = midi % 12;
    return n === 1 || n === 3 || n === 6 || n === 8 || n === 10;
  };
  
  const getCursor = () => {
    if (tool === 'split') return 'crosshair';
    if (tool === 'erase') return 'cell';
    if (tool === 'draw') return 'crosshair';
    return 'default';
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-4 shadow-none">
      <div className="flex items-center justify-between mb-4 bg-neutral-900 p-3 rounded-lg border border-neutral-800 shadow-none">
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          🎹 Piano Roll - {track.name}
        </h2>
        
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1 border border-neutral-700 shadow-none">
            <button 
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded shadow-none ${historyIndex > 0 ? 'text-neutral-300 hover:text-white hover:bg-neutral-700' : 'text-neutral-600'}`}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded shadow-none ${historyIndex < history.length - 1 ? 'text-neutral-300 hover:text-white hover:bg-neutral-700' : 'text-neutral-600'}`}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1 border border-neutral-700 shadow-none">
            <button 
              onClick={() => setTool('select')}
              className={`p-1.5 rounded transition-all shadow-none ${tool === 'select' ? 'bg-[#EA580B] text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
              title="Puntero"
            >
              <MousePointer2 size={16} />
            </button>
            <button 
              onClick={() => setTool('draw')}
              className={`p-1.5 rounded transition-all shadow-none ${tool === 'draw' ? 'bg-[#EA580B] text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
              title="Lápiz"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => setTool('split')}
              className={`p-1.5 rounded transition-all shadow-none ${tool === 'split' ? 'bg-[#EA580B] text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
              title="Tijeras"
            >
              <Scissors size={16} />
            </button>
            <button 
              onClick={() => setTool('erase')}
              className={`p-1.5 rounded transition-all shadow-none ${tool === 'erase' ? 'bg-[#EA580B] text-white font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
              title="Gomita"
            >
              <Eraser size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded-lg border border-neutral-700 shadow-none">
            <select 
              value={gridStep}
              onChange={(e) => setGridStep(Number(e.target.value))}
              className="bg-neutral-900 text-sm text-neutral-300 px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-[#EA580B] shadow-none"
            >
              <option value={500}>1/4 (Negra)</option>
              <option value={250}>1/8 (Corchea)</option>
              <option value={125}>1/16 (Semicorchea)</option>
            </select>
            <button
              onClick={handleQuantize}
              className="flex items-center gap-2 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm font-medium transition-colors shadow-none"
              title="Cuantizar notas (Ctrl+Q)"
            >
              Cuantizar
            </button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#EA580B] hover:brightness-110 text-white rounded font-medium transition-colors shadow-none"
          >
            <Save size={16} />
            Guardar
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors ml-2 shadow-none"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col border border-neutral-800 rounded-lg bg-neutral-950 overflow-hidden shadow-none">
        
        <div className="flex h-8 bg-neutral-900 border-b border-neutral-800 select-none relative flex-shrink-0 z-30 shadow-none">
          <div className="w-16 flex-shrink-0 border-r border-neutral-800 bg-neutral-900 z-40 flex items-center justify-center text-[10px] text-neutral-400 font-medium tracking-widest">
             MIDI
          </div>
          <div className="flex-1 overflow-hidden relative">
             <div 
               className="relative h-full cursor-pointer" 
               style={{ width: gridWidth }} 
               id="timeline-ruler"
               onMouseDown={handleTimelineClick}
             >
                {Array.from({ length: Math.ceil(gridWidth / barWidth) }).map((_, i) => (
                  <div key={i} className="absolute h-full border-l border-neutral-700 pl-1.5 pt-1 text-[10px] text-neutral-300 font-bold tabular-nums" style={{ left: i * barWidth, width: barWidth }}>
                    {i + 1}
                    <div className="absolute bottom-0 w-full h-full pointer-events-none">
                       <div className="h-1.5 w-px bg-neutral-700 absolute bottom-0" style={{ left: '25%' }} />
                       <div className="h-2 w-px bg-neutral-600 absolute bottom-0" style={{ left: '50%' }} />
                       <div className="h-1.5 w-px bg-neutral-700 absolute bottom-0" style={{ left: '75%' }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          
          <div className="w-16 flex-shrink-0 bg-neutral-900 border-r border-neutral-800 overflow-hidden relative z-20 shadow-none">
            <div 
              style={{ height: containerHeight, transform: `translateY(-${scrollRef.current?.scrollTop || 0}px)` }} 
              className="relative"
              id="piano-keys-container"
            >
              {Array.from({ length: numNotes }).map((_, i) => {
                const note = maxNote - i;
                const isBlack = isBlackKey(note);
                const isC = note % 12 === 0;
                return (
                  <div 
                    key={note}
                    className={`absolute w-full flex items-center justify-end pr-1 text-[9px] border-b border-slate-700/50 ${isBlack ? 'bg-slate-900 text-slate-500' : 'bg-slate-200 text-slate-800'}`}
                    style={{ height: keyHeight, top: i * keyHeight }}
                  >
                    {isC ? <strong>{getNoteName(note)}</strong> : (isBlack ? '' : getNoteName(note))}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-auto relative bg-[#1c1e26]"
            ref={scrollRef}
            style={{ cursor: getCursor() }}
            onScroll={(e) => {
              const keysContainer = document.getElementById('piano-keys-container');
              if (keysContainer) {
                keysContainer.style.transform = `translateY(-${e.currentTarget.scrollTop}px)`;
              }
              const timelineRuler = document.getElementById('timeline-ruler');
              if (timelineRuler) {
                timelineRuler.style.transform = `translateX(-${e.currentTarget.scrollLeft}px)`;
              }
            }}
          >
            <div 
              id="piano-grid-content"
              style={{ width: gridWidth, height: containerHeight }} 
              className="relative"
              onMouseDown={handleGridMouseDown}
            >
              <div className="playhead-line-pr absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{ left: '0px', display: 'none' }} />
              
              {selectionBox && (
                <div 
                  className="bg-blue-500/20 border border-blue-400 absolute pointer-events-none z-30"
                  style={{
                    left: Math.min(selectionBox.startX, selectionBox.currentX),
                    top: Math.min(selectionBox.startY, selectionBox.currentY),
                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                    height: Math.abs(selectionBox.currentY - selectionBox.startY)
                  }}
                />
              )}

              {/* Horizontal Grid Lines */}
              {Array.from({ length: numNotes }).map((_, i) => (
                <div 
                  key={`h-${i}`} 
                  className="absolute w-full border-b border-slate-800/60 pointer-events-none"
                  style={{ height: keyHeight, top: i * keyHeight, backgroundColor: isBlackKey(maxNote - i) ? 'rgba(0,0,0,0.15)' : 'transparent' }}
                />
              ))}
              
              {/* Vertical Grid Lines */}
              {Array.from({ length: Math.ceil(gridWidth / (pixelsPerSecond / (1000/gridStep))) }).map((_, i) => {
                const isBeat = i % (1000/gridStep) === 0;
                const isBar = i % (beatsPerBar * (1000/gridStep)) === 0;
                return (
                  <div 
                    key={`v-${i}`}
                    className={`absolute h-full border-r pointer-events-none ${isBar ? 'border-slate-600/80' : (isBeat ? 'border-slate-700/60' : 'border-slate-800/20')}`}
                    style={{ width: (pixelsPerSecond / (1000/gridStep)), left: i * (pixelsPerSecond / (1000/gridStep)) }}
                  />
                )
              })}
              
              {/* Notes */}
              {notes.map(note => {
                const top = (maxNote - note.note) * keyHeight;
                const left = (note.startTime / 1000) * pixelsPerSecond;
                const width = Math.max(4, (note.duration / 1000) * pixelsPerSecond);
                
                if (note.note < minNote || note.note > maxNote) return null;
                
                return (
                  <div
                    key={note.id}
                    onMouseDown={(e) => handleNoteMouseDown(e, note)}
                    className={`absolute rounded border transition-colors ${
                      note.selected 
                        ? 'bg-amber-400 border-2 border-amber-400 shadow-md brightness-125 z-20' 
                        : 'bg-emerald-500/90 border-emerald-400/90 hover:bg-emerald-400 z-10 shadow-sm'
                    }`}
                    style={{
                      top: top + 1,
                      left,
                      width,
                      height: keyHeight - 2
                    }}
                    title={`Nota: ${getNoteName(note.note)} | Tiempo: ${(note.startTime/1000).toFixed(2)}s`}
                  >
                    {tool === 'select' && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/40 rounded-r transition-colors"
                        onMouseDown={(e) => {
                           e.stopPropagation();
                           setResizing({ id: note.id, startX: e.clientX, originalDuration: note.duration });
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
