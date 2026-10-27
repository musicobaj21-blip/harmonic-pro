import React from 'react';

export default function Capitulo9({ onAction }: { onAction?: (action: string) => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, action: string) => {
    e.preventDefault();
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white mb-6">Capítulo 9: Modos de la Escala Menor Armónica</h2>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Modos de la Escala Menor Armónica</h2>
        <p className="text-slate-300 leading-relaxed">
          La escala menor armónica da origen a siete modos, cada uno con un carácter único y tenso. 
          A continuación, exploramos su estructura, uso y sonoridad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {/* Modo 1 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-2">1. Menor Armónica (Tónica)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 1er grado | Notas: A-B-C-D-E-F-G#</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3m - 4J - 5J - 6m - 7M
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Clásico y jazz, sonido tenso/exótico.</p>
          </div>
          <div>
            <a href="#action:scale:A:Menor Armónica" onClick={(e) => handleClick(e, "#action:scale:A:Menor Armónica")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 2 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">2. Locrio 6 (Supertonic)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 2do grado | Notas: B-C-D-E-F-G#-A</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50 flex-wrap">
                T - 2m - 3m - 4J - 5dim - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Ambientes sombríos/tensos, jazz y metal.</p>
          </div>
          <div>
            <a href="#action:scale:B:Locrio 6" onClick={(e) => handleClick(e, "#action:scale:B:Locrio 6")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 3 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">3. Jónico Aumentado (Mediant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 3er grado | Notas: C-D-E-F-G#-A-B</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3M - 4J - 5aum - 6M - 7M
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Sonoridad de ensueño, contemporánea.</p>
          </div>
          <div>
            <a href="#action:scale:C:Jónico Aumentado" onClick={(e) => handleClick(e, "#action:scale:C:Jónico Aumentado")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 4 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">4. Dórico #4 (Subdominante)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 4to grado | Notas: D-E-F-G#-A-B-C</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3m - 4aum - 5J - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Tensión armónica, pasajes modales en jazz/fusión.</p>
          </div>
          <div>
            <a href="#action:scale:D:Dórico #4" onClick={(e) => handleClick(e, "#action:scale:D:Dórico #4")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 5 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-rose-400 mb-2">5. Mixolidio b9 b13 (Dominante)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 5to grado | Notas: E-F-G#-A-B-C-D</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2m - 3M - 4J - 5J - 6m - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Dominante principal, tensión perfecta para resolver al acorde menor.</p>
          </div>
          <div>
            <a href="#action:scale:E:Mixolidio b9 b13" onClick={(e) => handleClick(e, "#action:scale:E:Mixolidio b9 b13")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 6 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">6. Lidio #2 (Submediant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 6to grado | Notas: F-G#-A-B-C-D-E</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2aum - 3M - 4aum - 5J - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> Sonoridad etérea, experimental.</p>
          </div>
          <div>
            <a href="#action:scale:F:Lidio #2" onClick={(e) => handleClick(e, "#action:scale:F:Lidio #2")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>

        {/* Modo 7 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-2">7. Superlocrio (Subtónica)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 7mo grado | Notas: G#-A-B-C-D-E-F</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2m - 3m - 4J - 5dim - 6m - 7bb
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Uso:</span> El más disonante, tensión extrema.</p>
          </div>
          <div>
            <a href="#action:scale:G#:Superlocrio" onClick={(e) => handleClick(e, "#action:scale:G#:Superlocrio")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              Ver y Escuchar Escala
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

