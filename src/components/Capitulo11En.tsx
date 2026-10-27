import React from 'react';

export default function Capitulo11({ onAction }: { onAction?: (action: string) => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, action: string) => {
    e.preventDefault();
    if (onAction) {
      onAction(action);
    }
  };

  const handlePlay = (progression: string) => {
    if (onAction) {
      onAction(progression);
    }
  };

  const handleStop = () => {
    if (onAction) {
      onAction("stop_playback"); // Custom action, or just use play action if stop is handled differently.
      // Assuming onAction handles stop, maybe a #stop action? Or just standard play will abort previous.
      onAction("#action:stop");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Chapter 11: Extended Dominants and Relative ii7 Chords</h2>
      
      {/* 1. Dominantes Extendidos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">1. Extended Dominants (Tension Chains)</h3>
        
        <div className="space-y-4 text-slate-300">
          <p>
            <span className="font-bold text-slate-100">Concept:</span> This involves chaining several dominant chords (V7) consecutively. Each chord in the chain functions as the secondary dominant of the next, moving through the cycle of descending fifths until finally resolving into a stable diatonic chord.
          </p>
          
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg flex flex-col gap-4 mt-4">
             <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handlePlay("#action:progression:E7,A7,D7,G7,Cmaj7")}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
                >
                  ▶️ Listen to Extended Chain
                </button>
                <button
                   onClick={handleStop}
                   className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
                 >
                   ⏹️ Stop
                 </button>
             </div>
             
             <p className="text-sm text-slate-400 pb-2">Practical Example in C Major: Instead of going straight to the point, we start the tension four steps back:</p>

             <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
                <a href="#action:chord:E7" onClick={(e) => handleClick(e, "#action:chord:E7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">E7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">A7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">D7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">G7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
             </div>
          </div>

          <p className="border-l-4 border-slate-600 pl-4 py-2 mt-4 text-slate-400 italic">
            <span className="font-bold text-slate-300 not-italic">Harmonic Journey Analysis:</span> <a href="#action:chord:E7" onClick={(e) => handleClick(e, "#action:chord:E7")} className="text-orange-400 hover:text-orange-300 transition-colors">E7</a> is the V7 of <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a>; <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a> is the V7 of <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="text-orange-400 hover:text-orange-300 transition-colors">D7</a>; <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="text-orange-400 hover:text-orange-300 transition-colors">D7</a> is the V7 of <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a>; and finally <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a> resolves into our tonic <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>. This chain of tension buildup is widely used in Ragtime, Traditional Jazz, and sophisticated Pop.
          </p>
        </div>
      </div>

      {/* 2. Acordes ii7 Relativos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">2. Relative ii7 Chords (The ii-V Micro-Resolution)</h3>
        
        <div className="space-y-6 text-slate-300">
          <p>
            <span className="font-bold text-slate-100">Concept:</span> A reharmonization technique where any dominant chord (whether secondary or tritone substitute) is preceded by its own minor seventh chord (m7 or m7b5 if minor). This transforms a solitary tension chord into a ii - V micro-cycle, adding a much more fluid and elegant melodic movement.
          </p>
          
          {/* Ejemplo Dominante Secundario */}
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg">
            <h4 className="font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">Application over Secondary Dominant</h4>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handlePlay("#action:progression:Em7(b5)_A7,Dm7")}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
              >
                ▶️ Listen to Secondary ii7
              </button>
              <button
                 onClick={handleStop}
                 className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
               >
                 ⏹️ Stop
               </button>
            </div>

            <div className="space-y-4 font-mono text-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400 w-36">Simple connection:</span>
                <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">A7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-emerald-400 w-36 font-semibold">With Relative ii7:</span>
                <div className="flex p-1 bg-slate-800 rounded border border-emerald-500/50">
                   <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="px-3 py-1 text-emerald-400 hover:text-emerald-300 transition-colors border-r border-slate-600">Em7b5</a>
                   <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="px-3 py-1 text-yellow-400 hover:text-yellow-300 transition-colors font-bold">A7</a>
                </div>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mt-3 italic">
              Where <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="text-emerald-400 hover:text-emerald-300 transition-colors">Em7b5</a> is the second relative degree of the D minor scale. It accompanies <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a>.
            </p>
          </div>

          {/* Ejemplo Dominante Tritonal */}
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg">
            <h4 className="font-bold text-pink-400 mb-3 border-b border-slate-700 pb-2">Application over Tritone Substitute</h4>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handlePlay("#action:progression:Abm7_Db7,Cmaj7")}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
              >
                ▶️ Listen to Tritonal ii7
              </button>
               <button
                 onClick={handleStop}
                 className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
               >
                 ⏹️ Stop
               </button>
            </div>

            <div className="space-y-4 font-mono text-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400 w-36">Simple connection:</span>
                <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Db7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-pink-400 w-36 font-semibold">With Relative ii7:</span>
                <div className="flex p-1 bg-slate-800 rounded border border-pink-500/50">
                   <a href="#action:chord:Abm7" onClick={(e) => handleClick(e, "#action:chord:Abm7")} className="px-3 py-1 text-pink-400 hover:text-pink-300 transition-colors border-r border-slate-600">Abm7</a>
                   <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="px-3 py-1 text-yellow-400 hover:text-yellow-300 transition-colors font-bold">Db7</a>
                </div>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mt-3 italic">
              Where <a href="#action:chord:Abm7" onClick={(e) => handleClick(e, "#action:chord:Abm7")} className="text-pink-400 hover:text-pink-300 transition-colors">Abm7</a> is rhythmically paired in the same measure with <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="text-orange-400 hover:text-orange-300 transition-colors">Db7</a> before falling to the tonic.
            </p>
          </div>
        </div>
      </div>

      {/* Estudio de Caso Práctico: All of Me (Dominantes Extendidos) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Practical Case Study: All of Me (Extended Dominants)</h3>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => handlePlay("#action:progression:Cmaj7,Cmaj7,E7,E7,A7,A7,Dm7,Dm7,E7,E7,Am7,Am7,D7,D7,Dm7,G7")}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
            >
              ▶️ Listen to Progression
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
            >
              ⏹️ Stop
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 font-mono">
            {/* ROW 1 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-orange-400 cursor-default">%</span>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:E7" onClick={(e) => handleClick(e, "#action:chord:E7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">E7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7/vi]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-yellow-400 cursor-default">%</span>
              <span className="text-xs text-yellow-500 mt-1">[V7/vi]</span>
            </div>
            
            {/* ROW 2 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">A7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7/ii]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-yellow-400 cursor-default">%</span>
              <span className="text-xs text-yellow-500 mt-1">[V7/ii]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-orange-400 cursor-default">%</span>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>

            {/* ROW 3 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:E7" onClick={(e) => handleClick(e, "#action:chord:E7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">E7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7/vi]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-yellow-400 cursor-default">%</span>
              <span className="text-xs text-yellow-500 mt-1">[V7/vi]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:Am7" onClick={(e) => handleClick(e, "#action:chord:Am7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Am7</a>
              <span className="text-xs text-slate-400 mt-1">[vi7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-orange-400 cursor-default">%</span>
              <span className="text-xs text-slate-400 mt-1">[vi7]</span>
            </div>

            {/* ROW 4 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">D7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7/V]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-xl text-yellow-400 cursor-default">%</span>
              <span className="text-xs text-yellow-500 mt-1">[V7/V]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7]</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-6 italic">
            Notice how measures 3 through 6 are the perfect example of Extended Dominants: the E7 starts the chain, pushing strongly toward A7, which in turn inevitably launches us toward Dm7. It is a domino effect that gives life and continuous movement to the harmony.
          </p>
        </div>
      </div>

      {/* 3. Sustitución por Acordes Disminuidos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">3. Substitution with Diminished Chords</h3>
        
        <div className="text-slate-300 space-y-4 mb-6">
          <p>
            A dominant chord (V7) can be replaced by a diminished seventh chord (<span className="font-bold">dim7</span> or <span className="font-bold">°7</span>). This diminished chord functions as a dominant with a flatted ninth without the root note (V7b9 without tonic), providing a dramatic tension widely used in Jazz and Bossa Nova.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <h4 className="text-orange-400 font-bold mb-2">Construction Trick:</h4>
            <p>To find the correct diminished chord, simply look for the <span className="font-bold text-white">major third of the original dominant</span>.</p>
            <p className="mt-2">
              Practical Example: If we want to substitute an <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 font-bold">A7</a> (which resolves to Dm7):
            </p>
            <ul className="list-disc pl-5 text-slate-300 mt-2 space-y-1">
              <li>The major third of A is <span className="font-bold text-white">C#</span>.</li>
              <li>Our base substitute chord is <a href="#action:chord:C#dim7" onClick={(e) => handleClick(e, "#action:chord:C#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">C#°</a>.</li>
            </ul>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <h4 className="text-orange-400 font-bold mb-2">Symmetry (Geometric Magic):</h4>
            <p>
              Diminished chords are symmetric. They repeat exactly every minor third. Therefore, over that same <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 font-bold">A7</a>, we can play any of the following inversions constructed by minor thirds: <a href="#action:chord:C#dim7" onClick={(e) => handleClick(e, "#action:chord:C#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">C#°</a>, <a href="#action:chord:Edim7" onClick={(e) => handleClick(e, "#action:chord:Edim7")} className="text-orange-400 hover:text-orange-300 font-bold">E°</a>, <a href="#action:chord:Gdim7" onClick={(e) => handleClick(e, "#action:chord:Gdim7")} className="text-orange-400 hover:text-orange-300 font-bold">G°</a> or <a href="#action:chord:A#dim7" onClick={(e) => handleClick(e, "#action:chord:A#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">A#°</a>. They all perform the same function!
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-3 gap-2 flex-wrap">
            <button
              onClick={() => handlePlay("#action:progression:Em7(b5),A7,Dm7,Dm7")}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ▶️ Listen with Dominant
            </button>
            <button
              onClick={() => handlePlay("#action:progression:Em7(b5),C#dim7,Dm7,Dm7")}
              className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ▶️ Listen with Diminished
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ⏹️ Stop
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 font-mono text-center">
            {/* Fila 1 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="text-xl text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Em7(b5)</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7(b5)]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-xl text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer">A7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-orange-500 mt-1">[i7]</span>
            </div>
            
            {/* Fila 2 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="text-xl text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Em7(b5)</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7(b5)]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:C#dim7" onClick={(e) => handleClick(e, "#action:chord:C#dim7")} className="text-xl text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-bold">C#°</a>
              <span className="text-xs text-purple-500 mt-1">[vii°/i]</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center">
              <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-orange-500 mt-1">[i7]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}