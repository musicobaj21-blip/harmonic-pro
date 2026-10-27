import React from 'react';

export default function Capitulo10({ onAction }: { onAction?: (action: string) => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, action: string) => {
    e.preventDefault();
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Capítulo 10: Dominantes Sustitutos Secundarios y Tritonales</h2>
      
      {/* Introducción General */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <p className="text-slate-300 leading-relaxed">
          Este capítulo se centra en herramientas que permiten enriquecer progresiones armónicas y aportar opciones de reharmonización avanzada.
        </p>
      </div>

      {/* 1. Dominantes Sustitutos Secundarios */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">1. Dominantes Sustitutos Secundarios</h3>
        
        <ul className="list-disc pl-5 space-y-4 text-slate-300 mt-4">
          <li>
            <span className="font-bold text-slate-100">Concepto:</span> Son acordes dominantes (V7) que funcionan como preparación hacia un acorde específico, aunque estén fuera de la tonalidad principal (no son diatónicos). Es el V7 del acorde que le sigue.
          </li>
          <li>
            <span className="font-bold text-slate-100">Construcción y Ejemplo:</span> En <a href="#action:chord:C:Mayor" onClick={(e) => handleClick(e, "#action:chord:C:Mayor")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">C</a> mayor, el dominante secundario de <a href="#action:chord:A:Menor" onClick={(e) => handleClick(e, "#action:chord:A:Menor")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Am</a> (VI grado) es <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">E7</a>. Este <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">E7</a> no es diatónico (debería ser <a href="#action:chord:E:Menor" onClick={(e) => handleClick(e, "#action:chord:E:Menor")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Em</a>), lo que añade un color externo y sofisticación, preparando la llegada a <a href="#action:chord:A:Menor" onClick={(e) => handleClick(e, "#action:chord:A:Menor")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Am</a>.
          </li>
          <li>
            <span className="font-bold text-slate-100">Aplicación en Progresiones (Rearmonización):</span>
            
            <div className="mt-4 bg-slate-900 border border-slate-700/50 p-5 rounded-lg flex flex-col gap-4">
              <div>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2 block">Progresión original:</span>
                <button
                  onClick={() => {
                    if (onAction) {
                      onAction("#action:progression:C-Mayor,A-Menor,D-Menor,G-7,C-Mayor");
                    }
                  }}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit mb-3"
                >
                  ▶️ Escuchar progresión completa
                </button>
                <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
                  <a href="#action:chord:C:Mayor" onClick={(e) => handleClick(e, "#action:chord:C:Mayor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">C</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:A:Menor" onClick={(e) => handleClick(e, "#action:chord:A:Menor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Am</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:D:Menor" onClick={(e) => handleClick(e, "#action:chord:D:Menor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">G7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:C:Mayor" onClick={(e) => handleClick(e, "#action:chord:C:Mayor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">C</a>
                </div>
              </div>
              
              <div className="border-t border-slate-800 pt-4">
                <span className="text-sm text-emerald-400 uppercase tracking-wider font-bold mb-2 block">Con dominantes secundarios:</span>
                <button
                  onClick={() => {
                    if (onAction) {
                      onAction("#action:progression:C-Mayor,E-7,A-Menor,D-7,G-7,C-Mayor");
                    }
                  }}
                  className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all w-fit mb-3"
                >
                  ▶️ Escuchar progresión completa
                </button>
                <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
                  <a href="#action:chord:C:Mayor" onClick={(e) => handleClick(e, "#action:chord:C:Mayor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">C</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="px-3 py-1 bg-slate-800 rounded border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-600">E7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:A:Menor" onClick={(e) => handleClick(e, "#action:chord:A:Menor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Am</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:D:7" onClick={(e) => handleClick(e, "#action:chord:D:7")} className="px-3 py-1 bg-slate-800 rounded border-emerald-500/50 text-emerald-400 hover:text-emerald-300 transition-colors border border-slate-600">D7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">G7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:C:Mayor" onClick={(e) => handleClick(e, "#action:chord:C:Mayor")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">C</a>
                </div>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-slate-400">
              <span className="font-bold text-slate-300">(Explicación):</span> <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-orange-400 hover:underline">E7</a> sustituye a <a href="#action:chord:E:Menor" onClick={(e) => handleClick(e, "#action:chord:E:Menor")} className="text-orange-400 hover:underline">Em</a> para preparar <a href="#action:chord:A:Menor" onClick={(e) => handleClick(e, "#action:chord:A:Menor")} className="text-orange-400 hover:underline">Am</a>, y <a href="#action:chord:D:7" onClick={(e) => handleClick(e, "#action:chord:D:7")} className="text-orange-400 hover:underline">D7</a> funciona como V7 de <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-orange-400 hover:underline">G7</a>, añadiendo tensión antes de resolver.
            </p>
          </li>
        </ul>
      </div>

      {/* Caso de Estudio: Análisis Armónico en la Práctica */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Caso de Estudio: Análisis Armónico en la Práctica</h3>

        {/* Leyenda de Colores */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-300">Diatónico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-300">Dominante Sec (V/X)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => {
              if (onAction) {
                onAction("#action:progression:C-maj7,E-7,A-m7,A-7,D-m7,D-7,G-7");
              }
            }}
            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-sm font-bold py-2 px-4 rounded-lg transition-all w-fit"
          >
            ▶️ Reproducir Análisis Completo
          </button>
          <button
            onClick={() => {
              if (onAction) {
                onAction("#action:stop");
              }
            }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
          >
            ⏹️ Detener
          </button>
        </div>

        {/* Rejilla de Compases */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-emerald-500 font-bold text-sm mb-2">Imaj7</span>
            <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">Cmaj7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-yellow-500 font-bold text-sm mb-2">V7/vi</span>
            <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">E7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-emerald-500 font-bold text-sm mb-2">vi7</span>
            <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">Am7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-yellow-500 font-bold text-sm mb-2">V7/ii</span>
            <a href="#action:chord:A:7" onClick={(e) => handleClick(e, "#action:chord:A:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">A7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-emerald-500 font-bold text-sm mb-2">ii7</span>
            <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">Dm7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-yellow-500 font-bold text-sm mb-2">V7/V</span>
            <a href="#action:chord:D:7" onClick={(e) => handleClick(e, "#action:chord:D:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">D7</a>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
            <span className="text-yellow-500 font-bold text-sm mb-2">V7</span>
            <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700">G7</a>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-slate-400">
          En esta clásica cascada de acordes, cada dominante secundario (E7, A7, D7) genera una fuerte tensión que nos empuja irremediablemente hacia el siguiente acorde de la tonalidad, creando un movimiento armónico continuo y sofisticado.
        </p>
      </div>

      {/* Estudio de Caso en Estándares: Mack the Knife */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Estudio de Caso en Estándares: Mack the Knife</h3>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:progression:C-maj7,C-maj7,D-m7,D-m7,G-7,G-7,C-maj7,C-maj7,A-m7,A-m7,D-m7,D-m7,G-7,G-7,C-maj7,D-m7_G-7");
                }
              }}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
            >
              ▶️ Escuchar versión original
            </button>
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:stop");
                }
              }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all ml-2"
            >
              ⏹️ Detener
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-slate-700/50 bg-slate-900/50 rounded-lg overflow-hidden font-mono text-center">
            {/* ROW 1 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">1</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">2</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">3</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">4</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            
            {/* ROW 2 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">5</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">6</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">7</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">8</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>

            {/* ROW 3 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">9</span>
              <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Am7</a>
              <span className="text-xs text-slate-400 mt-1">[vi7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">10</span>
              <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[vi7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">11</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">12</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>

            {/* ROW 4 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">13</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">14</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">15</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">16</span>
              <div className="flex justify-evenly items-center w-full">
                <div className="flex flex-col items-center">
                  <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
                  <span className="text-[10px] text-slate-400 mt-1">[ii7]</span>
                </div>
                <div className="flex flex-col items-center">
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
                  <span className="text-[10px] text-slate-400 mt-1">[V7]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 border-t border-slate-700/50 pt-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:progression:C-maj7,A-7,D-m7,D-m7,G-7,G-7,C-maj7,E-7,A-m7,A-7,D-m7,D-m7,G-7,G-7,C-maj7_A-7,D-m7_G-7");
                }
              }}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all"
            >
              ▶️ Escuchar versión rearmonizada
            </button>
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:stop");
                }
              }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all ml-2"
            >
              ⏹️ Detener
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-slate-700/50 bg-slate-900/50 rounded-lg overflow-hidden font-mono text-center">
            {/* ROW 1 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">1</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">2</span>
              <a href="#action:chord:A:7" onClick={(e) => handleClick(e, "#action:chord:A:7")} className="text-xl text-yellow-400 font-bold hover:text-yellow-300 transition-colors cursor-pointer">A7</a>
              <span className="text-xs text-yellow-500 mt-1 leading-tight">[V7/ii]<br/><span className="text-[9px]">(Dom. Sec.)</span></span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">3</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">4</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            
            {/* ROW 2 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">5</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">6</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">7</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-slate-400 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">8</span>
              <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-xl text-yellow-400 font-bold hover:text-yellow-300 transition-colors cursor-pointer">E7</a>
              <span className="text-xs text-yellow-500 mt-1 leading-tight">[V7/vi]<br/><span className="text-[9px]">(Dom. Sec.)</span></span>
            </div>

            {/* ROW 3 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">9</span>
              <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Am7</a>
              <span className="text-xs text-slate-400 mt-1">[vi7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">10</span>
              <a href="#action:chord:A:7" onClick={(e) => handleClick(e, "#action:chord:A:7")} className="text-xl text-yellow-400 font-bold hover:text-yellow-300 transition-colors cursor-pointer">A7</a>
              <span className="text-xs text-yellow-500 mt-1 leading-tight">[V7/ii]<br/><span className="text-[9px]">(Dom. Sec.)</span></span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">11</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">12</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[ii7]</span>
            </div>

            {/* ROW 4 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">13</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">14</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-slate-400 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">15</span>
              <div className="flex justify-center gap-0.5 lg:gap-1 items-center w-full mt-2">
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">Cmaj7</a>
                  <span className="text-[7px] lg:text-[8px] text-slate-400 mt-1">[Imaj7]</span>
                </div>
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:A:7" onClick={(e) => handleClick(e, "#action:chord:A:7")} className="text-sm lg:text-base text-yellow-400 font-bold hover:text-yellow-300 transition-colors cursor-pointer leading-none">A7</a>
                  <span className="text-[7px] lg:text-[8px] text-yellow-500 mt-1">[V7/ii]</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">16</span>
              <div className="flex justify-center gap-0.5 lg:gap-1 items-center w-full mt-2">
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">Dm7</a>
                  <span className="text-[7px] lg:text-[8px] text-slate-400 mt-1">[ii7]</span>
                </div>
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">G7</a>
                  <span className="text-[7px] lg:text-[8px] text-slate-400 mt-1">[V7]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Al escuchar ambas versiones, notarás cómo los dominantes <a href="#action:chord:A:7" onClick={(e) => handleClick(e, "#action:chord:A:7")} className="text-orange-400 hover:underline">A7</a> y <a href="#action:chord:E:7" onClick={(e) => handleClick(e, "#action:chord:E:7")} className="text-orange-400 hover:underline">E7</a> (que no pertenecen a Do Mayor) empujan la armonía con fuerza hacia los acordes menores <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-orange-400 hover:underline">Dm7</a> y <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-orange-400 hover:underline">Am7</a>, transformando una canción lineal en una pieza dinámica y llena de movimiento armónico.
        </p>
      </div>
      {/* 2. Dominantes Sustitutos Tritonales */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">2. Dominantes Sustitutos Tritonales (Modo Lidio Dominante)</h3>
        
        <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-4">
          <li>
            <span className="font-bold text-slate-100">Concepto:</span> Es un acorde que reemplaza al dominante (V7) mediante el uso del intervalo de tritono. Se sitúa a una segunda menor descendente del acorde de resolución (o cuarta aumentada del V7 original). Crea fuerte tensión que resuelve al tónico aportando un color único.
          </li>
          <li>
            <span className="font-bold text-slate-100">Ejemplo:</span> En un II-V-I en C mayor (<a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Dm7</a> - <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">G7</a> - <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Cmaj7</a>), el <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">G7</a> (V7) puede ser sustituido por <a href="#action:chord:Db:7" onClick={(e) => handleClick(e, "#action:chord:Db:7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Db7</a>, el cual está a medio tono abajo de <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-orange-400 hover:text-orange-300 font-bold transition-colors underline decoration-orange-500/30">Cmaj7</a>.
          </li>
          <li>
            <span className="font-bold text-slate-100">Escala de Acorde:</span> Para dar color, se suele usar la escala lidia dominante o mixolidia, pero la clave está en el esqueleto base que comparte el tritono.
          </li>
          <li>
            <span className="font-bold text-slate-100">Aplicación en Progresiones:</span>
            
            <div className="mt-4 bg-slate-900 border border-slate-700/50 p-5 rounded-lg flex flex-col gap-4">
              <div>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-2 block">Progresión original:</span>
                <div className="flex items-center mb-3">
                  <button
                    onClick={() => {
                      if (onAction) {
                        onAction("#action:progression:D-m7,G-7,C-maj7,C-maj7");
                      }
                    }}
                    className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
                  >
                    ▶️ Escuchar progresión completa
                  </button>
                  <button
                    onClick={() => {
                      if (onAction) {
                        onAction("#action:stop");
                      }
                    }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
                  >
                    ⏹️ Detener
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
                  <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">G7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
                </div>
              </div>
              
              <div className="border-t border-slate-800 pt-4">
                <span className="text-sm text-emerald-400 uppercase tracking-wider font-bold mb-2 block">Con Sustituto Tritonal:</span>
                <div className="flex items-center mb-3">
                  <button
                    onClick={() => {
                      if (onAction) {
                        onAction("#action:progression:D-m7,Db-7,C-maj7,C-maj7");
                      }
                    }}
                    className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
                  >
                    ▶️ Escuchar progresión completa
                  </button>
                  <button
                    onClick={() => {
                      if (onAction) {
                        onAction("#action:stop");
                      }
                    }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
                  >
                    ⏹️ Detener
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-lg">
                  <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Dm7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:Db:7" onClick={(e) => handleClick(e, "#action:chord:Db:7")} className="px-3 py-1 bg-slate-800 rounded border-pink-500/50 text-pink-400 hover:text-pink-300 transition-colors border border-slate-600">Db7</a>
                  <span className="text-slate-500">-</span>
                  <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="px-3 py-1 bg-slate-800 rounded text-orange-400 hover:text-orange-300 transition-colors border border-slate-600">Cmaj7</a>
                </div>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-slate-400">
              <span className="font-bold text-slate-300">Análisis:</span> <a href="#action:chord:Db:7" onClick={(e) => handleClick(e, "#action:chord:Db:7")} className="text-orange-400 hover:underline">Db7</a> funciona porque comparte el mismo tritono que el dominante original G7 (las notas F y Cb/B). Produce un sonido tenso y elegante que desliza en medios tonos hacia <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-orange-400 hover:underline">Cmaj7</a>.
            </p>
          </li>
        </ul>
      </div>

      {/* 4. Caso de Estudio: Cascada de Sustitutos Tritonales */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">4. Caso de Estudio: Cascada de Sustitutos Tritonales</h3>

        {/* Leyenda de Colores */}
        <div className="flex flex-wrap items-center gap-4 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
          <span className="text-sm font-medium text-slate-300">Leyenda:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-slate-300">Diatónico</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-slate-300">Dominante Secundario/Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-400"></span>
            <span className="text-sm text-slate-300">Sustituto Tritonal (SubV7)</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:progression:C-maj7,Bb-7,A-m7,Eb-7,D-m7,Ab-7,G-7,Db-7,C-maj7");
                }
              }}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
            >
              ▶️ Escuchar Progresión
            </button>
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:stop");
                }
              }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
            >
              ⏹️ Detener
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {/* Casilla 1 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-emerald-500 font-bold text-sm mb-2">Imaj7 (Diatónico)</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Cmaj7</a>
            </div>
            
            {/* Casilla 2 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-pink-400 font-bold text-sm mb-2">SubV7/vi (Tritonal)</span>
              <a href="#action:chord:Bb:7" onClick={(e) => handleClick(e, "#action:chord:Bb:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Bb7</a>
            </div>
            
            {/* Casilla 3 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-emerald-500 font-bold text-sm mb-2">vi7 (Diatónico)</span>
              <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Am7</a>
            </div>
            
            {/* Casilla 4 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-pink-400 font-bold text-sm mb-2">SubV7/ii (Tritonal)</span>
              <a href="#action:chord:Eb:7" onClick={(e) => handleClick(e, "#action:chord:Eb:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Eb7</a>
            </div>
            
            {/* Casilla 5 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-emerald-500 font-bold text-sm mb-2">ii7 (Diatónico)</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Dm7</a>
            </div>
            
            {/* Casilla 6 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-pink-400 font-bold text-sm mb-2">SubV7/V (Tritonal)</span>
              <a href="#action:chord:Ab:7" onClick={(e) => handleClick(e, "#action:chord:Ab:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Ab7</a>
            </div>
            
            {/* Casilla 7 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-yellow-500 font-bold text-sm mb-2">V7 (Dominante)</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">G7</a>
            </div>
            
            {/* Casilla 8 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-pink-400 font-bold text-sm mb-2">SubV7/I (Tritonal Principal)</span>
              <a href="#action:chord:Db:7" onClick={(e) => handleClick(e, "#action:chord:Db:7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Db7</a>
            </div>
            
            {/* Casilla 9 */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 text-center flex flex-col items-center">
              <span className="text-emerald-500 font-bold text-sm mb-2">Imaj7 (Diatónico)</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl font-bold text-slate-200 hover:text-orange-400 transition-colors w-full py-2 bg-slate-800/80 rounded hover:bg-slate-700 cursor-pointer">Cmaj7</a>
            </div>
          </div>
        </div>

        <p className="mt-4 text-slate-300 italic border-l-4 border-pink-500/50 pl-4 py-1 bg-pink-500/5 rounded-r-lg">
          Nota cómo cada Sustituto Tritonal (SubV7) resuelve descendiendo exactamente medio tono hacia el siguiente acorde diatónico, creando una línea de bajo cromática súper suave y sofisticada.
        </p>
      </div>

      {/* 5. Estudio de Caso Comparativo: Mack the Knife (Sustitución Tritonal) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-orange-400 mb-4">5. Estudio de Caso Comparativo: Mack the Knife (Sustitución Tritonal)</h3>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:progression:C-maj7,Eb-7,D-m7,D-m7,G-7,G-7,C-maj7,Bb-7,A-m7,Eb-7,D-m7,D-m7,G-7,Db-7,C-maj7_Eb-7,D-m7_G-7");
                }
              }}
              className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 w-fit"
            >
              ▶️ Escuchar Progresión Rearmonizada
            </button>
            <button
              onClick={() => {
                if (onAction) {
                  onAction("#action:stop");
                }
              }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all mb-3 ml-2 w-fit"
            >
              ⏹️ Detener
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-slate-700/50 bg-slate-900/50 rounded-lg overflow-hidden font-mono text-center">
            {/* ROW 1 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">1</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-emerald-500 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">2</span>
              <a href="#action:chord:Eb:7" onClick={(e) => handleClick(e, "#action:chord:Eb:7")} className="text-xl text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer">Eb7</a>
              <span className="text-xs text-pink-500 mt-1 leading-tight">[SubV7/ii]<br/><span className="text-[9px]">(Sub. Trit.)</span></span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">3</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">4</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7]</span>
            </div>
            
            {/* ROW 2 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">5</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">6</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-yellow-500 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">7</span>
              <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Cmaj7</a>
              <span className="text-xs text-emerald-500 mt-1">[Imaj7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">8</span>
              <a href="#action:chord:Bb:7" onClick={(e) => handleClick(e, "#action:chord:Bb:7")} className="text-xl text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer">Bb7</a>
              <span className="text-xs text-pink-500 mt-1 leading-tight">[SubV7/vi]<br/><span className="text-[9px]">(Sub. Trit.)</span></span>
            </div>
            
            {/* ROW 3 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">9</span>
              <a href="#action:chord:A:m7" onClick={(e) => handleClick(e, "#action:chord:A:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Am7</a>
              <span className="text-xs text-emerald-500 mt-1">[vi7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">10</span>
              <a href="#action:chord:Eb:7" onClick={(e) => handleClick(e, "#action:chord:Eb:7")} className="text-xl text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer">Eb7</a>
              <span className="text-xs text-pink-500 mt-1 leading-tight">[SubV7/ii]<br/><span className="text-[9px]">(Sub. Trit.)</span></span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">11</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">Dm7</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">12</span>
              <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">%</a>
              <span className="text-xs text-emerald-500 mt-1">[ii7]</span>
            </div>
            
            {/* ROW 4 */}
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">13</span>
              <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-xl text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">G7</a>
              <span className="text-xs text-yellow-500 mt-1">[V7]</span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">14</span>
              <a href="#action:chord:Db:7" onClick={(e) => handleClick(e, "#action:chord:Db:7")} className="text-xl text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer">Db7</a>
              <span className="text-xs text-pink-500 mt-1 leading-tight">[SubV7/I]<br/><span className="text-[9px]">(Sub. Trit.)</span></span>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">15</span>
              <div className="flex justify-center gap-0.5 lg:gap-1 items-center w-full mt-2">
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:C:maj7" onClick={(e) => handleClick(e, "#action:chord:C:maj7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">Cmaj7</a>
                  <span className="text-[7px] lg:text-[8px] text-emerald-500 mt-1">[Imaj7]</span>
                </div>
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:Eb:7" onClick={(e) => handleClick(e, "#action:chord:Eb:7")} className="text-sm lg:text-base text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer leading-none">Eb7</a>
                  <span className="text-[7px] lg:text-[8px] text-pink-500 mt-1">[SubV7/ii]</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-r border-b border-slate-700/50 flex flex-col justify-center min-h-[5rem] relative">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">16</span>
              <div className="flex justify-center gap-0.5 lg:gap-1 items-center w-full mt-2">
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:D:m7" onClick={(e) => handleClick(e, "#action:chord:D:m7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">Dm7</a>
                  <span className="text-[7px] lg:text-[8px] text-emerald-500 mt-1">[ii7]</span>
                </div>
                <div className="flex flex-col items-center w-1/2">
                  <a href="#action:chord:G:7" onClick={(e) => handleClick(e, "#action:chord:G:7")} className="text-sm lg:text-base text-orange-400 hover:text-orange-300 transition-colors cursor-pointer leading-none">G7</a>
                  <span className="text-[7px] lg:text-[8px] text-yellow-500 mt-1">[V7]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-slate-300 italic border-l-4 border-pink-500/50 pl-4 py-1 bg-pink-500/5 rounded-r-lg">
          Escucha cómo la sustitución tritonal cambia radicalmente el carácter de la canción. En lugar de los saltos de cuarta de los dominantes secundarios clásicos, ahora el bajo desciende cromáticamente (ej. Eb7 cayendo medio tono hacia Dm7), dándole a la pieza un sonido jazzístico mucho más denso, oscuro y sofisticado.
        </p>
      </div>
    </div>
  );
}
