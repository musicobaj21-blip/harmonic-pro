import React, { useState, useEffect } from 'react';
import { playDrumSound, getAudioContext } from '../utils/audio';
import { X, Trash2, Download, RotateCcw, Play, Square, Settings2 } from 'lucide-react';

const PRESET_STYLES = ['Cumbia', 'Reggaetón', 'Bossa Nova', 'Jazz Swing', 'Lo-Fi HipHop', 'Rock Classic'];

const TIME_DIVISIONS = [
  { label: '1/8', steps: 8, isTriplet: false },
  { label: '1/16', steps: 16, isTriplet: false },
  { label: '1/32', steps: 32, isTriplet: false },
  { label: '1/8T', steps: 12, isTriplet: true },
  { label: '1/16T', steps: 24, isTriplet: true }
];

const DRUM_ROWS = [
  { pitch: 56, name: 'COWBELL' },
  { pitch: 51, name: 'RIDE' },
  { pitch: 46, name: 'OPEN HAT' },
  { pitch: 42, name: 'CLOSED HAT' },
  { pitch: 38, name: 'SNARE' },
  { pitch: 37, name: 'RIMSHOT' },
  { pitch: 36, name: 'KICK' }
];

export const LinusDrumMachine = ({ onExport, onCancel, bpm }: { onExport: (notes: any[], styleName: string) => void, onCancel: () => void, bpm: number }) => {
  const [activePreset, setActivePreset] = useState<string>('Rock Classic');
  const [isCustom, setIsCustom] = useState(false);
  const [currentDivisionIdx, setCurrentDivisionIdx] = useState(1); // Default 1/16
  const currentDivision = TIME_DIVISIONS[currentDivisionIdx];
  const [swingPercentage, setSwingPercentage] = useState(0);
  
  const [gridState, setGridState] = useState<number[][]>(() => createEmptyGrid(16));
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function createEmptyGrid(steps: number) {
    return Array(DRUM_ROWS.length).fill(null).map(() => Array(steps).fill(0));
  }


  const getDrumPatternData = (styleName: string) => {
     const notes: { pitch: number, step: number, velocity: number }[] = [];
     
     if (styleName === 'Rock Classic') {
        notes.push({ step: 0, pitch: 36, velocity: 0.95 });
        notes.push({ step: 8, pitch: 36, velocity: 0.95 });
        notes.push({ step: 4, pitch: 38, velocity: 0.95 });
        notes.push({ step: 12, pitch: 38, velocity: 0.95 });
        for(let i=0; i<16; i+=2) notes.push({ step: i, pitch: 42, velocity: i%4===0 ? 0.95 : 0.70 });
        return { notes, divisionIdx: 1, swing: 0 };
     } else if (styleName === 'Reggaetón') {
        notes.push({ step: 0, pitch: 36, velocity: 0.95 });
        notes.push({ step: 4, pitch: 36, velocity: 0.95 });
        notes.push({ step: 8, pitch: 36, velocity: 0.95 });
        notes.push({ step: 12, pitch: 36, velocity: 0.95 });
        
        notes.push({ step: 3, pitch: 38, velocity: 0.95 });
        notes.push({ step: 6, pitch: 38, velocity: 0.70 });
        notes.push({ step: 11, pitch: 38, velocity: 0.95 });
        notes.push({ step: 14, pitch: 38, velocity: 0.70 });
        return { notes, divisionIdx: 1, swing: 0 };
     } else if (styleName === 'Lo-Fi HipHop') {
        notes.push({ step: 0, pitch: 36, velocity: 0.95 });
        notes.push({ step: 5, pitch: 36, velocity: 0.25 });
        notes.push({ step: 10, pitch: 36, velocity: 0.95 });
        
        notes.push({ step: 4, pitch: 38, velocity: 0.95 });
        notes.push({ step: 12, pitch: 38, velocity: 0.95 });
        notes.push({ step: 15, pitch: 38, velocity: 0.25 });
        
        for(let i=0; i<16; i+=2) {
           notes.push({ step: i, pitch: 42, velocity: i%4===0 ? 0.95 : 0.25 });
        }
        return { notes, divisionIdx: 1, swing: 54 };
     } else if (styleName === 'Bossa Nova') {
        const baseGain = 0.85; // Multiplicador de ganancia base oculto para equilibrar sonoridad
        const BOSSA_NOVA_PRESET = {
          division: '1/16',
          swing: 0,
          bpm: 120,
          baseGain: 0.85,
          grid: {
            Rimshot:    [0, 0, 0.95, 0, 0, 0.85, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0.85, 0],
            Kick:       [0.90, 0, 0, 0.70, 0.90, 0, 0, 0.70, 0.90, 0, 0, 0.70, 0.90, 0, 0, 0.70],
            ClosedHat:  [0.80, 0, 0.50, 0, 0.80, 0, 0.50, 0, 0.80, 0, 0.50, 0, 0.80, 0, 0.50, 0],
            PedalChick: [0, 0, 0, 0.75, 0, 0, 0, 0, 0, 0, 0, 0, 0.75, 0, 0, 0]
          }
        };
        BOSSA_NOVA_PRESET.grid.Rimshot.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 37, velocity: v * baseGain}) });
        BOSSA_NOVA_PRESET.grid.Kick.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 36, velocity: v * baseGain}) });
        BOSSA_NOVA_PRESET.grid.ClosedHat.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 42, velocity: v * baseGain}) });
        // Assuming Pedal Chick is OPEN HAT or similar since we don't have pedal chick pitch distinct from hat? Actually, 44 is pedal chick in some standards, but we have 46 open hat. Let's map it to Closed Hat with a different sound or just use 42 with higher velocity. Wait, we have no 44 in DRUM_ROWS. DRUM_ROWS has CLOSED HAT 42. So let's map PedalChick to CLOSED HAT or OPEN HAT. Let's map to OPEN HAT 46.
        BOSSA_NOVA_PRESET.grid.PedalChick.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 46, velocity: v * baseGain}) });
        return { notes, divisionIdx: 1, swing: 0, baseGain };
     } else if (styleName === 'Jazz Swing') {
        const baseGain = 1.0; // Multiplicador de ganancia base para Jazz
        const JAZZ_SWING_PRESET = {
          division: '1/8T', 
          swing: 66,
          bpm: 130,
          baseGain: 1.0,
          grid: {
            Ride:       [0.90, 0, 0, 0.95, 0, 0.75, 0.90, 0, 0, 0.95, 0, 0.75],
            PedalChick: [0, 0, 0, 0.90, 0, 0, 0, 0, 0, 0.90, 0, 0],
            Snare:      [0, 0, 0.30, 0, 0, 0, 0, 0, 0.45, 0, 0, 0.30], 
            Kick:       [0.40, 0, 0, 0.35, 0, 0, 0.40, 0, 0, 0.35, 0, 0]
          }
        };
        JAZZ_SWING_PRESET.grid.Ride.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 51, velocity: v * baseGain}) });
        JAZZ_SWING_PRESET.grid.PedalChick.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 46, velocity: v * baseGain}) });
        JAZZ_SWING_PRESET.grid.Snare.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 38, velocity: v * baseGain}) });
        JAZZ_SWING_PRESET.grid.Kick.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 36, velocity: v * baseGain}) });
        return { notes, divisionIdx: 3, swing: 66, baseGain };
     } else if (styleName === 'Cumbia') {
        const CUMBIA_PRESET = {
          division: '1/16',
          swing: 0,
          bpm: 100,
          grid: {
            // Figura de GALOPA por cada tiempo (Corchea, Semicorchea, Semicorchea)
            Shaker:     [0.70, 0, 0.40, 0.90, 0.70, 0, 0.40, 0.90, 0.70, 0, 0.40, 0.90, 0.70, 0, 0.40, 0.90],
            Kick:       [0.95, 0, 0, 0, 0, 0, 0, 0, 0.95, 0, 0, 0, 0.85, 0, 0, 0],
            Cowbell:    [0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0],
            Rimshot:    [0, 0, 0, 0, 0.90, 0, 0, 0, 0, 0, 0, 0, 0.90, 0, 0, 0]
          }
        };
        // Shaker -> CLOSED HAT (42) or similar? Let's use CLOSED HAT.
        CUMBIA_PRESET.grid.Shaker.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 42, velocity: v}) });
        CUMBIA_PRESET.grid.Kick.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 36, velocity: v}) });
        CUMBIA_PRESET.grid.Cowbell.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 56, velocity: v}) });
        CUMBIA_PRESET.grid.Rimshot.forEach((v, i) => { if(v > 0) notes.push({step: i, pitch: 37, velocity: v}) });
        return { notes, divisionIdx: 1, swing: 0 };
     }
     
     return { notes, divisionIdx: 1, swing: 0 };
  };

  const getRowIndexForPitch = (pitch: number) => {
    return DRUM_ROWS.findIndex(r => r.pitch === pitch);
  };

  const loadPresetStyleIntoGrid = (styleName: string) => {
    setActivePreset(styleName);
    setIsCustom(false);
    
    const patternData = getDrumPatternData(styleName);
    setCurrentDivisionIdx(patternData.divisionIdx);
    setSwingPercentage(patternData.swing);
    
    const steps = TIME_DIVISIONS[patternData.divisionIdx].steps;
    const newGrid = createEmptyGrid(steps);

    patternData.notes.forEach(note => {
      const instrumentRow = getRowIndexForPitch(note.pitch);
      if (instrumentRow > -1 && note.step >= 0 && note.step < steps) {
        newGrid[instrumentRow][note.step] = note.velocity;
      }
    });

    setGridState(newGrid);
  };

  useEffect(() => {
    loadPresetStyleIntoGrid(activePreset);
  }, []);

  const changeTimeDivision = (idx: number) => {
    setCurrentDivisionIdx(idx);
    const newDiv = TIME_DIVISIONS[idx];
    setGridState(prev => {
      const newGrid = createEmptyGrid(newDiv.steps);
      // Map existing notes relatively if possible, or just truncate/expand
      // Simple approach: preserve data up to min length, though relative mapping is better if requested.
      // Instructions say: "redimensionarse automáticamente preservando las notas existentes en sus posiciones de tiempo relativas"
      
      const oldSteps = prev[0].length;
      DRUM_ROWS.forEach((_, rIdx) => {
        for(let s=0; s < oldSteps; s++) {
          if (prev[rIdx][s] > 0) {
            // map s to new grid
            const relativePos = s / oldSteps;
            const newStep = Math.round(relativePos * newDiv.steps);
            if (newStep >= 0 && newStep < newDiv.steps) {
               newGrid[rIdx][newStep] = prev[rIdx][s];
            }
          }
        }
      });
      return newGrid;
    });
  };

  const handleCellClick = (rowIndex: number, stepIndex: number) => {
    setIsCustom(true);
    setGridState(prev => {
      const newGrid = [...prev];
      newGrid[rowIndex] = [...newGrid[rowIndex]];
      
      const currentVel = newGrid[rowIndex][stepIndex];
      let nextVel = 0;
      if (currentVel === 0) nextVel = 0.95;
      else if (currentVel === 0.95) nextVel = 0.70;
      else if (currentVel === 0.70) nextVel = 0.25;
      else if (currentVel === 0.25) nextVel = 0;
      
      newGrid[rowIndex][stepIndex] = nextVel;
      
      if (nextVel > 0) {
         playDrumSound(DRUM_ROWS[rowIndex].pitch, 0, nextVel * 127);
      }
      
      return newGrid;
    });
  };

  const clearGridToEmpty = () => {
    setIsCustom(true);
    setGridState(createEmptyGrid(currentDivision.steps));
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: any;
    
    if (isPlaying) {
      setCurrentStep(0);
      let nextStepTime = getAudioContext().currentTime + 0.05;
      let stepIdx = 0;

      interval = setInterval(() => {
        const ctx = getAudioContext();
        while (nextStepTime < ctx.currentTime + 0.1) {
          const baseStepDuration = (60 / bpm) / (currentDivision.steps / 4);
          let exactPlaybackTime = nextStepTime;

          if (stepIdx % 2 !== 0 && swingPercentage > 0) {
            const swingDelay = (baseStepDuration * 0.5) * (swingPercentage / 100);
            exactPlaybackTime += swingDelay;
          }
          
          const currentStepToPlay = stepIdx;
          const timeToPlay = exactPlaybackTime - ctx.currentTime;
          
          setTimeout(() => {
            setCurrentStep(currentStepToPlay);
          }, Math.max(0, timeToPlay * 1000));

          DRUM_ROWS.forEach((row, rowIndex) => {
            const vel = gridState[rowIndex][currentStepToPlay];
            if (vel > 0) {
               playDrumSound(row.pitch, exactPlaybackTime, vel * 127);
            }
          });

          nextStepTime += baseStepDuration;
          stepIdx = (stepIdx + 1) % currentDivision.steps;
        }
      }, 25);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, gridState, bpm, currentDivision, swingPercentage]);

  const handleExport = () => {
     const events: any[] = [];
     const baseStepDuration = (60000 / bpm) / (currentDivision.steps / 4);
     
     DRUM_ROWS.forEach((row, rowIndex) => {
        gridState[rowIndex].forEach((vel, step) => {
           if (vel > 0) {
              let exactTimeMs = step * baseStepDuration;
              if (step % 2 !== 0 && swingPercentage > 0) {
                 const swingDelayMs = (baseStepDuration * 0.5) * (swingPercentage / 100);
                 exactTimeMs += swingDelayMs;
              }
              
              events.push({
                 type: 'drum',
                 note: row.pitch,
                 velocity: Math.floor(vel * 127),
                 timestamp: exactTimeMs,
                 duration: baseStepDuration * 0.9
              });
           }
        });
     });
     
     events.sort((a,b) => a.timestamp - b.timestamp);
     onExport(events, activePreset + (isCustom ? ' Custom' : ''));
  };

  return (
    <div className="flex flex-col bg-[#101114] border border-[#22252a] rounded-sm p-5 w-[850px] shadow-2xl font-mono">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-widest">
          <Settings2 className="w-5 h-5 text-cyan-400" />
          LINUS DRUM RACK
          <span className="text-[10px] bg-[#1a1d24] border border-[#2a2d35] text-cyan-400 px-2 py-1 rounded ml-3">
            PRESET: {activePreset.toUpperCase()} {isCustom && '*'}
          </span>
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors"><X size={20}/></button>
      </div>

      <div className="flex flex-col gap-3 mb-6 bg-[#181a1f] p-3 rounded-sm border border-[#22252b]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 overflow-x-auto">
             <span className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">STYLE:</span>
             {PRESET_STYLES.map(style => (
               <button
                 key={style}
                 onClick={() => loadPresetStyleIntoGrid(style)}
                 className={`px-3 py-1.5 rounded-sm text-[10px] font-bold transition-all uppercase tracking-wider ${
                   activePreset === style && !isCustom
                     ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                     : 'bg-[#22252b] hover:bg-[#2a2d35] text-slate-300'
                 }`}
               >
                 {style}
               </button>
             ))}
           </div>
           
           <button 
             onClick={clearGridToEmpty}
             title="Clear Grid"
             className="ml-4 px-3 py-1.5 bg-[#2a1515] hover:bg-[#3a1d1d] text-red-400 border border-red-900/50 rounded-sm text-[10px] font-bold flex items-center gap-1 transition-colors tracking-wider"
           >
             <Trash2 size={12} /> CLEAR
           </button>
        </div>
        
        <div className="h-px bg-[#22252b] w-full my-1"></div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">DIV:</span>
             <select 
                value={currentDivisionIdx}
                onChange={e => changeTimeDivision(Number(e.target.value))}
                className="bg-[#22252b] text-slate-200 border border-[#2a2d35] text-[10px] font-bold rounded-sm px-2 py-1 outline-none focus:border-cyan-500 tracking-wider"
             >
                {TIME_DIVISIONS.map((div, i) => (
                   <option key={i} value={i}>{div.label}</option>
                ))}
             </select>
           </div>
           
           <div className="flex items-center gap-2 flex-1 max-w-[200px]">
             <span className="text-[10px] font-bold text-slate-500 uppercase px-1 tracking-wider">SWING: {swingPercentage}%</span>
             <input 
                type="range" 
                min="0" max="75" 
                value={swingPercentage}
                onChange={e => setSwingPercentage(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-[#22252b] rounded-full appearance-none cursor-pointer"
             />
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-6 bg-[#131418] p-4 rounded-sm border border-[#1e2127]">
        {DRUM_ROWS.map((row, rowIndex) => (
          <div key={row.pitch} className="flex items-center gap-2">
            <div className="w-24 text-[10px] font-bold text-slate-400 text-right pr-3 tracking-widest border-r border-[#22252b]">
               {row.name}
            </div>
            <div className="flex flex-1 gap-[2px] pl-1">
               {Array.from({length: currentDivision.steps}).map((_, step) => {
                  const vel = gridState[rowIndex][step];
                  const isActive = vel > 0;
                  const isCurrent = isPlaying && currentStep === step;
                  
                  // For 1/32, visual grouping by 4. For 1/16, by 4.
                  const isGroupEnd = (step + 1) % 4 === 0 && step !== currentDivision.steps - 1;
                  
                  return (
                    <div 
                      key={step} 
                      onClick={() => handleCellClick(rowIndex, step)}
                      className={`h-8 flex-1 rounded-[2px] cursor-pointer border ${isGroupEnd ? 'mr-1 border-r-[#2a2d35]' : ''} transition-all duration-75 ${
                        isActive 
                           ? (vel === 0.95 ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#00E5FF] brightness-125' :
                              vel === 0.70 ? 'bg-cyan-600/80 border-cyan-500' :
                              'bg-cyan-900/40 border-cyan-800/60 opacity-60')
                           : 'bg-[#181a1f] border-[#22252b] hover:border-[#383d47]'
                      } ${isCurrent ? 'bg-slate-200 border-white z-10 shadow-[0_0_10px_#ffffff]' : ''}`}
                    >
                    </div>
                  );
               })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2">
            <div className="w-24 border-r border-transparent pr-3"></div>
            <div className="flex flex-1 gap-[2px] pl-1">
               {Array.from({length: currentDivision.steps}).map((_, step) => {
                  const isGroupEnd = (step + 1) % 4 === 0 && step !== currentDivision.steps - 1;
                  return (
                    <div key={step} className={`h-1 flex-1 rounded-full ${isGroupEnd ? 'mr-1' : ''} ${isPlaying && currentStep === step ? 'bg-cyan-400 shadow-[0_0_8px_#00E5FF]' : 'bg-[#22252b]'}`} />
                  )
               })}
            </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-[#22252b]">
        <div className="flex items-center gap-4">
           <button onClick={togglePlay} className={`px-5 py-2.5 rounded-sm font-bold text-xs flex items-center gap-2 tracking-wider transition-colors ${isPlaying ? 'bg-cyan-500 text-[#101114] hover:bg-cyan-400' : 'bg-[#22252b] text-slate-300 hover:bg-[#2a2d35] border border-[#2a2d35]'}`}>
              {isPlaying ? <Square fill="currentColor" size={14} /> : <Play fill="currentColor" size={14} />} 
              {isPlaying ? 'STOP' : 'PLAY'}
           </button>
           {isCustom && (
              <button onClick={() => loadPresetStyleIntoGrid(activePreset)} className="px-4 py-2 text-[10px] bg-[#181a1f] hover:bg-[#22252b] text-slate-400 rounded-sm flex items-center gap-1 border border-[#2a2d35] tracking-wider transition-colors">
                 <RotateCcw size={12} /> RESTORE
              </button>
           )}
        </div>
        <button 
          onClick={handleExport}
          className="bg-cyan-500 hover:bg-cyan-400 text-[#101114] font-bold px-6 py-2.5 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all hover:brightness-110 tracking-wider text-xs"
        >
          <Download size={14} /> COMMIT TO TIMELINE
        </button>
      </div>
    </div>
  );
};
