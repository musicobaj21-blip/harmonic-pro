import React from 'react';

interface Capitulo14Props {
  onAction?: (action: string) => void;
}

const Capitulo14: React.FC<Capitulo14Props> = ({ onAction }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#action:') && onAction) {
      onAction(href);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Encabezado e Introducción */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Capítulo 14: Escala Menor Melódica</h2>
        <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700 text-slate-300 leading-relaxed text-lg shadow-lg">
          <p className="mb-4">La escala menor melódica es una de las escalas más importantes en la música moderna, especialmente en jazz, fusión, música popular sofisticada y composición cinematográfica.</p>
          <p className="mb-4">Su sonido es muy especial porque mezcla dos mundos:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-indigo-300">
            <li>Tiene <strong>tercera menor</strong>, por eso conserva un color menor profundo.</li>
            <li>Tiene <strong>sexta mayor y séptima mayor</strong>, por eso suena más abierta, moderna y elegante que la escala menor natural.</li>
          </ul>
          <p className="text-sm text-slate-400 italic bg-slate-900/50 p-4 rounded-lg border-l-2 border-indigo-500">
            * Nota: En la música clásica tradicional, la escala menor melódica suele cambiar al subir y al bajar. Sin embargo, en jazz y música moderna se utiliza generalmente igual en ambos sentidos.
          </p>
        </div>
      </div>

      {/* 2. Formación de la escala menor melódica */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-orange-400 mb-6">1. Formación de la escala menor melódica</h3>
        <p className="text-slate-300 mb-4">La fórmula de la escala menor melódica es: <strong className="font-mono text-white bg-slate-800 px-2 py-1 rounded">1 – 2 – b3 – 4 – 5 – 6 – 7</strong></p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg mb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Escala</th>
                <th className="p-4 font-bold">Escuchar escala</th>
              </tr>
            </thead>
            <tbody className="text-slate-400 font-mono">
              <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-sans text-white">C menor natural</td>
                <td className="p-4">
                  <a href="#action:scale:C:Menor" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block">
                    ▶ C – D – Eb – F – G – <span className="text-pink-400">Ab – Bb</span>
                  </a>
                </td>
              </tr>
              <tr className="bg-indigo-900/20 hover:bg-indigo-900/40 transition-colors">
                <td className="p-4 font-sans text-white font-bold">C menor melódica</td>
                <td className="p-4">
                  <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block">
                    ▶ C – D – Eb – F – G – A – B
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-300 text-sm">La diferencia está en los grados 6 y 7. Por eso tiene un sonido más luminoso y moderno.</p>
      </div>

      {/* 3. Sonido Principal (Tarjeta Interactiva) */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">2. Sonido principal de la escala menor melódica</h3>
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-indigo-500 shadow-xl">
          <p className="text-slate-300 mb-6">
            El acorde más representativo de esta escala es el acorde menor con séptima mayor: <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 font-bold hover:text-orange-300 transition-colors text-lg">Cm(maj7)</a> (C - Eb - G - B). Tiene una sonoridad misteriosa, elegante y cinematográfica. También se usa frecuentemente como acorde menor con sexta: <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 font-bold hover:text-orange-300 transition-colors text-lg">Cm6</a> (C - Eb - G - A).
          </p>
          
          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Ejemplo de progresión (Balada/Jazz/Cine):</p>
              <div className="font-mono text-xl md:text-2xl">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a> - <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm6</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a>
              </div>
            </div>
            <a href="#action:progression:Cm(maj7),Cm6,Fm7,G7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Escuchar Progresión
            </a>
          </div>
        </div>
      </div>

      {/* 4. Acordes formados desde C menor melódica */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-orange-400 mb-6">3. Acordes formados desde C menor melódica</h3>
        <p className="text-slate-300 mb-4 text-sm md:text-base">Si construimos acordes sobre cada nota de la escala de Do Menor Melódica (apilando terceras), obtenemos el siguiente campo armónico:</p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Grado</th>
                <th className="p-4 font-bold">Acorde</th>
                <th className="p-4 font-bold">Notas</th>
                <th className="p-4 font-bold">Color principal</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">I</td>
                <td className="p-4 font-mono text-indigo-400 font-bold">Cm(maj7)</td>
                <td className="p-4 font-mono text-slate-400">C - Eb - G - B</td>
                <td className="p-4 text-blue-200">Oscuro, misterioso, jazzístico</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">II</td>
                <td className="p-4 font-mono text-white">Dm7</td>
                <td className="p-4 font-mono text-slate-400">D - F - A - C</td>
                <td className="p-4 text-blue-200">Menor, suave</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">III</td>
                <td className="p-4 font-mono text-white">Ebmaj7(#5)</td>
                <td className="p-4 font-mono text-slate-400">Eb - G - B - D</td>
                <td className="p-4 text-blue-200">Aumentado (Brillante, tenso)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">IV</td>
                <td className="p-4 font-mono text-white">F7</td>
                <td className="p-4 font-mono text-slate-400">F - A - C - Eb</td>
                <td className="p-4 text-blue-200">Bluesy, flotante (Dominante Lidio)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">V</td>
                <td className="p-4 font-mono text-white">G7</td>
                <td className="p-4 font-mono text-slate-400">G - B - D - F</td>
                <td className="p-4 text-blue-200">Dominante clásico (con tensiones)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">VI</td>
                <td className="p-4 font-mono text-white">Am7(b5)</td>
                <td className="p-4 font-mono text-slate-400">A - C - Eb - G</td>
                <td className="p-4 text-blue-200">Inestable (Semidisminuido)</td>
              </tr>
              <tr className="bg-orange-900/20 hover:bg-orange-900/30 transition-colors">
                <td className="p-4 font-mono font-bold text-orange-400">VII</td>
                <td className="p-4 font-mono text-orange-400 font-bold">Bm7(b5) / B7alt</td>
                <td className="p-4 font-mono text-orange-200">B - D - F - A</td>
                <td className="p-4 text-orange-300 font-bold italic">Base del sonido Alterado (Máxima tensión)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modos derivados de la escala menor melódica */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">4. Modos derivados de la escala menor melódica</h3>
        <p className="text-slate-300 mb-8">Cada grado de la escala menor melódica genera un modo con un color único. A continuación, exploramos su estructura, uso y sonoridad.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Modo 1 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">1. Menor Melódica (Tónica)</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 1er grado | Notas: C-D-Eb-F-G-A-B</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2M - 3m - 4J - 5J - 6M - 7M
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> Cm(maj7), Cm6. Color oscuro, misterioso, jazzístico.</p>
            </div>
            <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 2 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">2. Dórico b2</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 2do grado | Notas: D-Eb-F-G-A-B-C</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2m - 3m - 4J - 5J - 6M - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> Dm7(b9). Acordes menores con b9 o sus(b9).</p>
            </div>
            <a href="#action:scale:D:Dórico b2" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 3 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">3. Lidio Aumentado</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 3er grado | Notas: Eb-F-G-A-B-C-D</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2M - 3M - 4aum - 5aum - 6M - 7M
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> Ebmaj7(#5). Sonoridad flotante, acordes aumentados.</p>
            </div>
            <a href="#action:scale:Eb:Lidio Aumentado" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 4 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">4. Lidio b7</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 4to grado | Notas: F-G-A-B-C-D-Eb</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2M - 3M - 4aum - 5J - 6M - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> F7(#11). Dominantes que no resuelven (Sustitutos tritonales).</p>
            </div>
            <a href="#action:scale:F:Lidio b7" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 5 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">5. Mixolidio b13</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 5to grado | Notas: G-A-B-C-D-Eb-F</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2M - 3M - 4J - 5J - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> G7(b13). Acordes dominantes que resuelven a un tono menor.</p>
            </div>
            <a href="#action:scale:G:Mixolidio b13" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 6 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">6. Locrio natural 2</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 6to grado | Notas: A-B-C-D-Eb-F-G</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2M - 3m - 4J - 5dim - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> Am7(b5). Acordes semidisminuidos donde se permite usar la novena mayor.</p>
            </div>
            <a href="#action:scale:A:Locrio natural 2" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

          {/* Modo 7 - Centrado para cerrar el Grid */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between md:col-span-2 md:w-1/2 md:mx-auto">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">7. Alterado (Super Locrio)</h4>
              <p className="text-sm text-slate-400 mb-4">Grado y Notas: Desde el 7mo grado | Notas: B-C-D-Eb-F-G-A</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                T - 2m - 3m - 4dim - 5dim - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Uso:</strong> B7alt. El rey de la tensión en el jazz. Todos los grados alterados.</p>
            </div>
            <a href="#action:scale:B:Alterado" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">Ver y Escuchar Escala</a>
          </div>

        </div>
      </div>

      {/* Secciones 5, 6 y 7: Aplicaciones y Usos 1 y 2 */}
      <div className="mb-12">
        {/* Sección 5: Las aplicaciones más importantes */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">5. Las aplicaciones más importantes</h3>
          <p className="text-slate-300 mb-4">Aunque la escala menor melódica genera siete modos, no es necesario memorizarlos todos de inmediato. En la práctica, los usos más importantes son cuatro:</p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">1.</span> Sobre acordes menores con séptima mayor o sexta.</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">2.</span> Sobre acordes dominantes 7(#11).</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">3.</span> Sobre acordes dominantes alterados.</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">4.</span> Sobre acordes m7(b5) con 9 natural.</li>
            </ul>
          </div>
          <p className="text-slate-400 text-sm mt-4 italic">Estos cuatro usos aparecen constantemente en jazz, fusión, composición moderna y arreglos.</p>
        </div>

        {/* Sección 6: Uso 1 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-indigo-500 shadow-xl mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">6. Uso 1: Menor melódica sobre acordes m(maj7) y m6</h3>
          <p className="text-slate-300 mb-6">Cuando aparece un acorde menor con séptima mayor, la escala más directa es la menor melódica desde la misma fundamental.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-indigo-400 font-bold mb-3">Estructura Base</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Acorde:</span> <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm(maj7)</a></li>
                <li><span className="text-slate-500">Notas del acorde:</span> C – Eb – G – B</li>
                <li><span className="text-slate-500">Escala:</span> <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">C Menor Melódica</a></li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-indigo-400 font-bold mb-3">Tensiones Disponibles</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tensión 9</span><span className="text-white font-bold">D</span></div>
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tensión 11</span><span className="text-white font-bold">F</span></div>
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tensión 13</span><span className="text-white font-bold">A</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Aplicación en Progresión:</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a>
              </div>
            </div>
            <a href="#action:progression:Cm(maj7),Fm7,G7,Cm(maj7)" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Escuchar Progresión
            </a>
          </div>
          <p className="text-slate-300 text-sm mt-4">
            La nota <strong className="text-white">B</strong> es clave porque define el color. Este sonido aparece mucho en standards menores y baladas de jazz (ej. "Solar").
          </p>
        </div>

        {/* Sección 7: Uso 2 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-cyan-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">7. Uso 2: Lidio dominante sobre acordes 7(#11)</h3>
          <p className="text-slate-300 mb-6">El cuarto modo de la menor melódica se llama <strong className="text-cyan-400">Lidio b7</strong> (o Lidio Dominante). Se usa sobre acordes dominantes con #11.</p>
          
          <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
            <ul className="text-slate-300 space-y-2 font-mono text-sm">
              <li><span className="text-slate-500">Escala (desde el 4to grado de C Menor Melódica):</span> <a href="#action:scale:F:Lidio b7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F Lidio Dominante (F-G-A-B-C-D-Eb)</a></li>
              <li><span className="text-slate-500">Acorde:</span> <a href="#action:chord:F7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F7(#11)</a></li>
              <li><span className="text-slate-500">Tensión característica:</span> <strong className="text-cyan-400 text-lg">B = #11</strong></li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progresión Lidia Dominante */}
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Color Dominante Moderno (No resolutivo):</p>
              <div className="font-mono text-lg mb-4">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a> - <a href="#action:chord:F7#11" onClick={handleClick} className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">F7(#11)</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
              </div>
              <a href="#action:progression:Cmaj7,F7#11,Cmaj7" onClick={handleClick} className="inline-block text-xs bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Escuchar Progresión
              </a>
            </div>

            {/* Sustituto Tritonal */}
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Uso en Sustituto Tritonal (SubV7):</p>
              <div className="font-mono text-lg mb-1">
                <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7</a> - <a href="#action:chord:Db7#11" onClick={handleClick} className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Db7(#11)</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
              </div>
              <p className="text-xs text-slate-500 font-mono mb-4">II - SubV7 - I</p>
              <a href="#action:progression:Dm7,Db7#11,Cmaj7" onClick={handleClick} className="inline-block text-xs bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Escuchar SubV7
              </a>
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-4 italic">
            Nota: El <strong className="text-white">Db7(#11)</strong> usa la escala Db Lidia Dominante (proveniente de Ab menor melódica). Este color sofisticado es clásico en temas como "Take the A Train".
          </p>
        </div>

        {/* Sección 8: Uso 3 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-yellow-500 shadow-xl mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">8. Uso 3: Mixolidio b13 sobre dominantes que resuelven a menor</h3>
          <p className="text-slate-300 mb-6">El quinto modo de la menor melódica se llama <strong className="text-yellow-400">Mixolidio b13</strong>. Es la escala por excelencia para los acordes dominantes que resuelven hacia una tónica menor.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-yellow-400 font-bold mb-3">Estructura Base</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Escala (5to grado de C Menor Melódica):</span> <a href="#action:scale:G:Mixolidio b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ G Mixolidio b13 (G-A-B-C-D-Eb-F)</a></li>
                <li><span className="text-slate-500">Acorde:</span> <a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7(b13)</a></li>
                <li><span className="text-slate-500">Notas del acorde:</span> G – B – D – F</li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 flex flex-col justify-center">
              <h4 className="text-yellow-400 font-bold mb-3">Tensión Característica</h4>
              <div className="bg-slate-800 p-4 rounded-lg text-center border border-slate-700">
                <span className="text-slate-400 block text-sm mb-1">b13 (Treceava menor)</span>
                <span className="text-yellow-400 text-3xl font-bold">Eb</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">El Eb anticipa el color del acorde menor (Cm) al que va a resolver.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Progresión clásica menor (IIø - V7 - Im):</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Dm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7(b5)</a> - <a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7(b13)</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a>
              </div>
            </div>
            <a href="#action:progression:Dm7b5,G7b13,Cm(maj7)" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Escuchar Progresión
            </a>
          </div>
          <p className="text-slate-300 text-sm italic">
            Aplicación: En standards como "Autumn Leaves", sobre la cadencia hacia el relativo menor (ej. Bm7(b5) - <strong className="text-white">E7</strong> - Am), ese E7 pide a gritos un color Mixolidio b13 o alterado.
          </p>
        </div>

        {/* Sección 9: Uso 4 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-emerald-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">9. Uso 4: Locrio natural 2 sobre acordes m7(b5)</h3>
          <p className="text-slate-300 mb-6">El sexto modo de la menor melódica es el <strong className="text-emerald-400">Locrio natural 2</strong> (o Locrio #2). Es la salvación armónica para los acordes semidisminuidos.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-emerald-400 font-bold mb-3">Estructura Base</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Escala (6to grado de C Menor Melódica):</span> <a href="#action:scale:A:Locrio natural 2" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ A Locrio natural 2 (A-B-C-D-Eb-F-G)</a></li>
                <li><span className="text-slate-500">Acorde:</span> <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)</a></li>
                <li><span className="text-slate-500">Notas del acorde:</span> A – C – Eb – G</li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 flex flex-col justify-center">
              <h4 className="text-emerald-400 font-bold mb-3">El Secreto: La Tensión 9</h4>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                <span className="text-slate-400 block text-sm mb-2">A diferencia del Locrio normal (que usa b9), aquí usamos:</span>
                <span className="text-emerald-400 text-2xl font-bold tracking-widest">B (9 natural)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Progresión (IIø - V7alt - Im7):</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Am7(b5)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Am7(b5)</a> - <a href="#action:chord:D7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">D7(#9)</a> - <a href="#action:chord:Gm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Gm7</a>
              </div>
            </div>
            <a href="#action:progression:Am7(b5),D7(#9),Gm7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Escuchar Progresión
            </a>
          </div>
          <p className="text-slate-300 text-sm mt-4 italic">
            Al usar el acorde <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)(9)</a>, la 9 natural entrega un sonido mucho más moderno, luminoso y abierto al acorde semidisminuido.
          </p>
        </div>

        {/* Sección 10: Uso 5 (Escala Alterada) */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-red-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">10. Uso 5: Escala alterada sobre dominantes alterados</h3>
          <p className="text-slate-300 mb-6">El séptimo modo de la menor melódica es la <strong className="text-red-400">Escala Alterada</strong> (o Superlocrio). Es uno de los modos más importantes en el jazz moderno porque contiene <em className="text-white">casi todas las tensiones alteradas posibles</em> (b9, #9, b5, #5, b13).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Estructura Base */}
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-red-400 font-bold mb-3">Estructura Base</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Escala (7mo grado de C Menor Melódica):</span> <a href="#action:scale:B:Alterado" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ B Alterada (B-C-D-Eb-F-G-A)</a></li>
                <li><span className="text-slate-500">Acorde:</span> <a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></li>
              </ul>
            </div>

            {/* Equivalencias Enarmónicas */}
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
               <h4 className="text-red-400 font-bold mb-3">La Magia Enarmónica</h4>
               <p className="text-xs text-slate-400 mb-3">El acorde B7 tradicional tiene D# y F#, pero en la escala alterada los pensamos como tensiones sobre B:</p>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-center font-mono">
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300"><span className="text-slate-500 text-[10px] block uppercase">1</span> B</div>
                  <div className="bg-slate-800 p-2 rounded border border-red-500/30 text-white font-bold"><span className="text-red-400 text-[10px] block uppercase">b9</span> C</div>
                  <div className="bg-slate-800 p-2 rounded border border-red-500/30 text-white font-bold"><span className="text-red-400 text-[10px] block uppercase">#9</span> D</div>
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300"><span className="text-slate-500 text-[10px] block uppercase">3</span> Eb (D#)</div>
                  <div className="bg-slate-800 p-2 rounded border border-red-500/30 text-white font-bold"><span className="text-red-400 text-[10px] block uppercase">b5 / #11</span> F</div>
                  <div className="bg-slate-800 p-2 rounded border border-red-500/30 text-white font-bold"><span className="text-red-400 text-[10px] block uppercase">#5 / b13</span> G</div>
                  <div className="bg-slate-800 p-2 rounded border border-slate-700 text-slate-300 col-span-2 md:col-span-2"><span className="text-slate-500 text-[10px] block uppercase">b7</span> A</div>
               </div>
            </div>
          </div>

          {/* La Regla de Oro */}
          <div className="bg-gradient-to-r from-red-900/20 to-slate-900/80 p-6 rounded-xl border border-red-500/30 mb-8">
             <h4 className="text-xl font-bold text-white mb-2">🔥 Regla Práctica (El Atajo Mental)</h4>
             <p className="text-slate-300 mb-4">Para tocar una escala alterada sobre un dominante, simplemente usa la <strong className="text-red-400">escala menor melódica ubicada MEDIO TONO ARRIBA</strong> del acorde.</p>

             <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                   <tr>
                     <th className="p-4 font-bold">Acorde Dominante</th>
                     <th className="p-4 font-bold">Escala Alterada</th>
                     <th className="p-4 font-bold text-red-400">Menor Melódica de Origen (Atajo)</th>
                   </tr>
                 </thead>
                 <tbody className="text-slate-400 font-mono">
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7alt</a></td>
                     <td className="p-4">G alterada</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:Ab:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">Ab menor melódica</a></td>
                   </tr>
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:C7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">C7alt</a></td>
                     <td className="p-4">C alterada</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:Db:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">Db menor melódica</a></td>
                   </tr>
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></td>
                     <td className="p-4">B alterada</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">C menor melódica</a></td>
                   </tr>
                   <tr className="hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:E7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">E7alt</a></td>
                     <td className="p-4">E alterada</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:F:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">F menor melódica</a></td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          {/* Progresiones */}
          <div className="space-y-4">
              <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Resolución Clásica Menor:</p>
                  <div className="font-mono text-lg md:text-xl">
                    <a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">B7alt</a> - <a href="#action:chord:Em7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Em7</a>
                  </div>
                </div>
                <a href="#action:progression:B7(#9),Em7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap shadow-md">
                  ▶ Escuchar Resolución
                </a>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Máxima Tensión en Mayor (IIm7 - V7alt - Imaj7):</p>
                  <div className="font-mono text-lg md:text-xl mb-1">
                    <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7alt</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Para improvisar sobre el G7alt pensamos en <strong className="text-red-400">Ab Menor Melódica</strong>.</p>
                </div>
                <a href="#action:progression:Dm7,G7(#9),Cmaj7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap shadow-md">
                  ▶ Escuchar Progresión
                </a>
              </div>
          </div>

        </div>
      {/* Sección 11 y demás */}
      <div className="mb-12">

        {/* Sección 11: Tabla práctica de uso rápido */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">11. Tabla práctica de uso rápido</h3>
          <p className="text-slate-300 mb-6">Esta tabla es tu "atajo mental" para elegir rápidamente qué escala menor melódica usar (pensada desde C Menor Melódica) según el tipo de acorde que encuentres en una partitura.</p>
          
          <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-700 shadow-inner mb-8">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="p-4 font-bold">Tipo de acorde</th>
                  <th className="p-4 font-bold">Escala recomendada</th>
                  <th className="p-4 font-bold text-indigo-400">Regla rápida (Relación con la raíz)</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 font-mono">
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm(maj7)</a> / <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm6</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C menor melódica</a></td>
                  <td className="p-4 font-bold text-indigo-300">Misma raíz del acorde</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:F7(#11)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F7(#11)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C menor melódica</a></td>
                  <td className="p-4 font-bold text-indigo-300">Menor melódica una 5ª justa arriba</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7(b13)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C menor melódica</a></td>
                  <td className="p-4 font-bold text-indigo-300">Menor melódica una 4ª justa arriba</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)(9)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C menor melódica</a></td>
                  <td className="p-4 font-bold text-indigo-300">Menor melódica una 3ª menor arriba</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C menor melódica</a></td>
                  <td className="p-4 font-bold text-indigo-300">Menor melódica medio tono arriba</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4 className="font-bold text-white mb-3">Más Ejemplos Prácticos:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm font-mono">
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:Dm(maj7)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">Dm(maj7)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Menor Melódica</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:G7(#11)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">G7(#11)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Menor Melódica</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:A7b13" onClick={handleClick} className="text-orange-400 font-bold block mb-1">A7(b13)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Menor Melódica</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:Bm7b5" onClick={handleClick} className="text-orange-400 font-bold block mb-1">Bm7(b5)(9)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Menor Melódica</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50 col-span-2 md:col-span-1">
                <a href="#action:chord:C#7(#9)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">C#7alt</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Menor Melódica</a>
             </div>
          </div>
        </div>

        {/* Sección 12: Aplicaciones en progresiones musicales */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">12. Aplicaciones en progresiones musicales</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-indigo-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 1: Tónica menor moderna</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm(maj7)</a> - <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm6</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">G7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-indigo-400">Uso:</strong> Sobre los acordes de tónica usamos C menor melódica. Color misterioso y cinematográfico.</p>
              <a href="#action:progression:Cm(maj7),Cm6,Fm7,G7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Escuchar</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 2: II - V - I menor</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Dm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7(b5)</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">G7alt</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm(maj7)</a>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 mb-2 font-mono">
                <li><strong className="text-emerald-400">Dm7(b5):</strong> F menor melódica (Locrio #2)</li>
                <li><strong className="text-emerald-400">G7alt:</strong> Ab menor melódica (Alterada)</li>
                <li><strong className="text-emerald-400">Cm(maj7):</strong> C menor melódica</li>
              </ul>
              <p className="text-xs text-slate-400">Clásico en temas como "Blue Bossa".</p>
              <a href="#action:progression:Dm7b5,G7(#9),Cm(maj7)" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Escuchar</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-red-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 3: Dominante alterado a mayor</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">G7alt</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cmaj7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-red-400">Uso:</strong> Sobre G7alt usamos Ab menor melódica. Genera máxima tensión antes de resolver brillante al mayor.</p>
              <a href="#action:progression:Dm7,G7(#9),Cmaj7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Escuchar</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-cyan-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 4: Dominante #11</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cmaj7</a> - <a href="#action:chord:D7(#11)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">D7(#11)</a> - <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">G7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-cyan-400">Uso:</strong> Sobre D7(#11) usamos A menor melódica. Color brillante y moderno, no suena tan oscuro como el alterado.</p>
              <a href="#action:progression:Cmaj7,D7(#11),Dm7,G7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Escuchar</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-amber-500 shadow-md lg:col-span-2 md:w-2/3 lg:mx-auto">
              <h4 className="font-bold text-white mb-2">App 5: Semidisminuido moderno</h4>
              <div className="font-mono text-lg mb-3 text-center">
                <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">Am7(b5)</a> - <a href="#action:chord:D7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">D7alt</a> - <a href="#action:chord:Gm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Gm7</a>
              </div>
              <p className="text-sm text-slate-300 text-center"><strong className="text-amber-400">Uso:</strong> Sobre Am7(b5) usamos C menor melódica para obtener la <strong className="text-white">9 natural (B)</strong>, dándole un sonido más abierto que el locrio tradicional.</p>
              <div className="text-center">
                <a href="#action:progression:Am7b5,D7(#9),Gm7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Escuchar</a>
              </div>
            </div>

          </div>
        </div>

        {/* Sección 13: Aplicación melódica */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">13. Aplicación melódica</h3>
          <p className="text-slate-300 mb-6">La menor melódica se usa para crear líneas (solos) con tensión y resolución. Veamos un ejemplo sobre <strong className="font-mono text-white">Dm7 - G7alt - Cmaj7</strong>:</p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
              <div className="text-indigo-400 font-bold font-mono mb-2">Sobre Dm7:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">F - E - D</div>
              <div className="text-xs text-slate-500">Notas diatónicas</div>
            </div>
            <div className="flex-1 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
              <div className="text-red-400 font-bold font-mono mb-2">Sobre G7alt:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">Ab - Bb - B - Eb</div>
              <div className="text-xs text-slate-400">b9, #9, 3ra, b13 (Ab Menor Melódica)</div>
            </div>
            <div className="flex-1 bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
              <div className="text-orange-400 font-bold font-mono mb-2">Sobre Cmaj7:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">E - D - C</div>
              <div className="text-xs text-slate-500">Resolución clara a tónica</div>
            </div>
          </div>
        </div>

        {/* Sección 14: Consejos */}
        <div className="mb-12 border-l-4 border-emerald-500 pl-6 py-2">
          <h3 className="text-xl font-bold text-white mb-4">14. Consejos para estudiar la menor melódica</h3>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>Primero memoriza la escala en una tonalidad.</li>
            <li>Aprende sus acordes derivados.</li>
            <li>Estudia sus 4 usos principales: <strong className="text-orange-400">m(maj7), 7(#11), 7alt, m7(b5)(9)</strong>.</li>
            <li>No intentes usar todos los modos al mismo tiempo. Practica con progresiones cortas.</li>
            <li>Escucha cómo resuelven las tensiones.</li>
            <li>En improvisación, usa primero frases simples de 3 o 4 notas.</li>
          </ul>
        </div>

        {/* Sección 15: Ejercicios */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">15. Ejercicios prácticos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Ejercicio 1</h4>
              <p className="text-slate-300 text-sm mb-2">Construye la escala de C menor melódica y forma el acorde del I grado (Cm(maj7)).</p>
              <p className="text-xs text-slate-400 italic">Práctica: Toca una melodía usando la nota B como color principal.</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Ejercicio 2</h4>
              <p className="text-slate-300 text-sm mb-2">Escribe las escalas para Dm7(b5) - G7alt - Cm(maj7).</p>
              <ul className="text-xs text-slate-400 font-mono space-y-1">
                <li>Dm7(b5) = F menor melódica</li>
                <li>G7alt = Ab menor melódica</li>
                <li>Cm(maj7) = C menor melódica</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Ejercicio 3</h4>
              <p className="text-slate-300 text-sm mb-2">Identifica la escala menor melódica para improvisar sobre dominantes alterados:</p>
              <ul className="text-xs text-slate-400 font-mono space-y-1">
                <li>G7alt ➔ Ab menor melódica</li>
                <li>C7alt ➔ Db menor melódica</li>
                <li>F7alt ➔ Gb menor melódica</li>
                <li>B7alt ➔ C menor melódica</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Ejercicio 4</h4>
              <p className="text-slate-300 text-sm mb-2">Crea una progresión usando un dominante #11.</p>
              <p className="text-xs text-slate-400 font-mono mb-2">Ej: Cmaj7 - D7(#11) - Dm7 - G7</p>
              <p className="text-xs text-slate-400 italic">Práctica: Improvisa sobre D7(#11) usando A menor melódica.</p>
            </div>
          </div>
        </div>

        {/* CONCLUSIÓN FINAL */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900 p-8 rounded-2xl border-t-4 border-indigo-400 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Conclusión</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            La escala menor melódica es una herramienta fundamental para la armonía moderna. Su sonido combina el color menor con una apertura especial producida por la sexta y séptima mayores.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            En la práctica, se utiliza principalmente para enriquecer progresiones menores, dominantes alterados, dominantes #11 y acordes semidisminuidos.
          </p>
          <div className="inline-block bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-full font-bold border border-indigo-500/30">
            Dominar esta escala permite crear líneas melódicas más expresivas, armonías más sofisticadas y una improvisación con mayor tensión, color y resolución.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Capitulo14;
