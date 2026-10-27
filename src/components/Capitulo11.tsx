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
      <h2 className="text-2xl font-bold text-white mb-6">Capítulo 11: Dominantes Extendidos y Acordes ii7 Relativos</h2>
      
      {/* 1. Dominantes Extendidos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">1. Dominantes Extendidos (Cadenas de Tensión)</h3>
        
        <div className="space-y-4 text-slate-300">
          <p>
            <span className="font-bold text-slate-100">Concepto:</span> Consiste en encadenar varios acordes dominantes (V7) de forma consecutiva. Cada acorde de la cadena funciona como el dominante secundario del que le sigue, moviéndose a través del ciclo de quintas descendentes hasta resolver finalmente en un acorde diatónico estable.
          </p>
          
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg flex flex-col gap-4 mt-4">
             <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => handlePlay("#action:progression:E7,A7,D7,G7,Cmaj7")}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
                >
                  ▶️ Escuchar Cadena Extendida
                </button>
                <button
                   onClick={handleStop}
                   className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
                 >
                   ⏹️ Detener
                 </button>
             </div>
             
             <p className="text-sm text-slate-400 pb-2">Ejemplo Práctico en Do Mayor (C): En lugar de ir directo al grano, iniciamos la tensión cuatro pasos atrás:</p>

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
            <span className="font-bold text-slate-300 not-italic">Análisis del Viaje Armónico:</span> <a href="#action:chord:E7" onClick={(e) => handleClick(e, "#action:chord:E7")} className="text-orange-400 hover:text-orange-300 transition-colors">E7</a> es el V7 de <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a>; <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a> es el V7 de <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="text-orange-400 hover:text-orange-300 transition-colors">D7</a>; <a href="#action:chord:D7" onClick={(e) => handleClick(e, "#action:chord:D7")} className="text-orange-400 hover:text-orange-300 transition-colors">D7</a> es el V7 de <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a>; y finalmente <a href="#action:chord:G7" onClick={(e) => handleClick(e, "#action:chord:G7")} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a> resuelve en nuestra tónica <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>. Es una acumulación de tensión en cadena muy utilizada en el Ragtime, Jazz tradicional y Pop sofisticado.
          </p>
        </div>
      </div>

      {/* 2. Acordes ii7 Relativos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">2. Acordes ii7 Relativos (La Micro-Resolución ii-V)</h3>
        
        <div className="space-y-6 text-slate-300">
          <p>
            <span className="font-bold text-slate-100">Concepto:</span> Es una técnica de rearmonización donde cualquier acorde dominante (ya sea secundario o sustituto tritonal) es precedido por su propio acorde menor séptimo (m7 o m7b5 si es menor). Esto transforma un acorde de tensión solitario en un micro-ciclo ii - V, añadiendo un movimiento melódico mucho más fluido y elegante.
          </p>
          
          {/* Ejemplo Dominante Secundario */}
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg">
            <h4 className="font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">Aplicación sobre Dominante Secundario</h4>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handlePlay("#action:progression:Em7(b5)_A7,Dm7")}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
              >
                ▶️ Escuchar ii7 Secundario
              </button>
              <button
                 onClick={handleStop}
                 className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
               >
                 ⏹️ Detener
               </button>
            </div>

            <div className="space-y-4 font-mono text-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400 w-36">Conexión simple:</span>
                <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">A7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-emerald-400 w-36 font-semibold">Con ii7 Relativo:</span>
                <div className="flex p-1 bg-slate-800 rounded border border-emerald-500/50">
                   <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="px-3 py-1 text-emerald-400 hover:text-emerald-300 transition-colors border-r border-slate-600">Em7b5</a>
                   <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="px-3 py-1 text-yellow-400 hover:text-yellow-300 transition-colors font-bold">A7</a>
                </div>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Dm7" onClick={(e) => handleClick(e, "#action:chord:Dm7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mt-3 italic">
              Donde <a href="#action:chord:Em7(b5)" onClick={(e) => handleClick(e, "#action:chord:Em7(b5)")} className="text-emerald-400 hover:text-emerald-300 transition-colors">Em7b5</a> es el segundo grado relativo de la escala de Re menor. Acompaña a <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 transition-colors">A7</a>.
            </p>
          </div>

          {/* Ejemplo Dominante Tritonal */}
          <div className="bg-slate-900 border border-slate-700/50 p-5 rounded-lg">
            <h4 className="font-bold text-pink-400 mb-3 border-b border-slate-700 pb-2">Aplicación sobre Sustituto Tritonal</h4>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handlePlay("#action:progression:Abm7_Db7,Cmaj7")}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
              >
                ▶️ Escuchar ii7 Tritonal
              </button>
               <button
                 onClick={handleStop}
                 className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
               >
                 ⏹️ Detener
               </button>
            </div>

            <div className="space-y-4 font-mono text-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-400 w-36">Conexión simple:</span>
                <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Db7</a>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-pink-400 w-36 font-semibold">Con ii7 Relativo:</span>
                <div className="flex p-1 bg-slate-800 rounded border border-pink-500/50">
                   <a href="#action:chord:Abm7" onClick={(e) => handleClick(e, "#action:chord:Abm7")} className="px-3 py-1 text-pink-400 hover:text-pink-300 transition-colors border-r border-slate-600">Abm7</a>
                   <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="px-3 py-1 text-yellow-400 hover:text-yellow-300 transition-colors font-bold">Db7</a>
                </div>
                <span className="text-slate-500">→</span>
                <a href="#action:chord:Cmaj7" onClick={(e) => handleClick(e, "#action:chord:Cmaj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mt-3 italic">
              Donde <a href="#action:chord:Abm7" onClick={(e) => handleClick(e, "#action:chord:Abm7")} className="text-pink-400 hover:text-pink-300 transition-colors">Abm7</a> se empareja rítmicamente en el mismo compás con <a href="#action:chord:Db7" onClick={(e) => handleClick(e, "#action:chord:Db7")} className="text-orange-400 hover:text-orange-300 transition-colors">Db7</a> antes de caer a la tónica.
            </p>
          </div>
        </div>
      </div>

      {/* Estudio de Caso Práctico: All of Me (Dominantes Extendidos) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Caso de Estudio Práctico: All of Me (Dominantes Extendidos)</h3>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => handlePlay("#action:progression:Cmaj7,Cmaj7,E7,E7,A7,A7,Dm7,Dm7,E7,E7,Am7,Am7,D7,D7,Dm7,G7")}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
            >
              ▶️ Escuchar Progresión
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
            >
              ⏹️ Detener
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
            Observa cómo los compases 3 al 6 son el ejemplo perfecto de Dominantes Extendidos: el E7 inicia la cadena empujando fuertemente hacia A7, y este a su vez nos lanza inevitablemente hacia el Dm7. Es un efecto dominó que le da vida y movimiento continuo a la armonía.
          </p>
        </div>
      </div>

      {/* 3. Sustitución por Acordes Disminuidos */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">3. Sustitución por Acordes Disminuidos</h3>
        
        <div className="text-slate-300 space-y-4 mb-6">
          <p>
            Un acorde dominante (V7) puede ser reemplazado por un acorde disminuido séptimo (<span className="font-bold">dim7</span> o <span className="font-bold">°7</span>). Este disminuido funciona como un dominante con novena bemol sin la nota fundamental (V7b9 sin tónica), aportando una tensión dramática muy usada en el Jazz y el Bossa Nova.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <h4 className="text-orange-400 font-bold mb-2">El Truco de Construcción:</h4>
            <p>Para encontrar el disminuido correcto, simplemente busca la <span className="font-bold text-white">tercera mayor del dominante original</span>.</p>
            <p className="mt-2">
              Ejemplo Práctico: Si queremos sustituir un <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 font-bold">A7</a> (que resuelve a Dm7):
            </p>
            <ul className="list-disc pl-5 text-slate-300 mt-2 space-y-1">
              <li>La tercera mayor de A es <span className="font-bold text-white">C#</span>.</li>
              <li>Nuestro acorde sustituto base es <a href="#action:chord:C#dim7" onClick={(e) => handleClick(e, "#action:chord:C#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">C#°</a>.</li>
            </ul>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            <h4 className="text-orange-400 font-bold mb-2">Simetría (Magia Geométrica):</h4>
            <p>
              Los acordes disminuidos son simétricos. Se repiten exactamente igual cada tercera menor. Por lo tanto, sobre ese mismo <a href="#action:chord:A7" onClick={(e) => handleClick(e, "#action:chord:A7")} className="text-orange-400 hover:text-orange-300 font-bold">A7</a>, podemos tocar cualquiera de las siguientes inversiones construidas por terceras menores: <a href="#action:chord:C#dim7" onClick={(e) => handleClick(e, "#action:chord:C#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">C#°</a>, <a href="#action:chord:Edim7" onClick={(e) => handleClick(e, "#action:chord:Edim7")} className="text-orange-400 hover:text-orange-300 font-bold">E°</a>, <a href="#action:chord:Gdim7" onClick={(e) => handleClick(e, "#action:chord:Gdim7")} className="text-orange-400 hover:text-orange-300 font-bold">G°</a> o <a href="#action:chord:A#dim7" onClick={(e) => handleClick(e, "#action:chord:A#dim7")} className="text-orange-400 hover:text-orange-300 font-bold">A#°</a>. ¡Todos cumplen la misma función!
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-3 gap-2 flex-wrap">
            <button
              onClick={() => handlePlay("#action:progression:Em7(b5),A7,Dm7,Dm7")}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ▶️ Escuchar con Dominante
            </button>
            <button
              onClick={() => handlePlay("#action:progression:Em7(b5),C#dim7,Dm7,Dm7")}
              className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ▶️ Escuchar con Disminuido
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit"
            >
              ⏹️ Detener
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
