import React from 'react';

interface Capitulo12Props {
  onAction?: (action: string) => void;
}

const Capitulo12: React.FC<Capitulo12Props> = ({ onAction }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#action:') && onAction) {
      onAction(href);
    }
  };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Capítulo 12: Tensiones</h2>
      <p className="text-slate-300 mb-6">
        Las tensiones enriquecen los acordes aportando color sin alterar su función armónica (por ejemplo, transformar <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> en <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a>).
      </p>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">1. ¿Qué son las tensiones?</h3>
      <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
        <p className="text-slate-300 mb-4">
          Una tensión es una nota que se añade a la estructura base (1-3-5-7) de un acorde mediante la superposición por terceras. Las tensiones superiores disponibles son la 9ª, la 11ª y la 13ª.
        </p>
        <p className="text-slate-300 mb-4">
          Ejemplo en <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a>: <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> (C - E - G - B).
        </p>
        <p className="text-slate-300 mb-4">
          Tensiones posibles: D (9ª), F# (#11), A (13ª).
        </p>
        <p className="text-slate-300">
          Resultados: <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a>, <a href="#action:chord:Cmaj7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7(#11)</a>, y <a href="#action:chord:Cmaj13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj13</a>.
        </p>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">2. Tensiones en los acordes</h3>
      <p className="text-slate-300 mb-4">
        A continuación analizaremos cómo se aplican individualmente estas tensiones.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Tarjeta 1: Novena (9ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-orange-500">
          <h4 className="text-lg font-bold text-orange-400 mb-2">Novena (9ª)</h4>
          <p className="text-slate-300 text-sm mb-4">
            La novena es equivalente a una segunda mayor tocada en el registro superior, aportando un brillo suave sin generar choques fuertes.
          </p>
          <p className="text-slate-300 text-sm font-mono bg-slate-800 p-2 rounded">
            <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> vs <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a> (agrega D)
          </p>
        </div>

        {/* Tarjeta 2: Oncena (11ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-bold text-blue-400 mb-2">Oncena (11ª)</h4>
          <p className="text-slate-300 text-sm mb-4">
            Muy común en acordes menores: <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm7</a> vs <a href="#action:chord:Dm11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm11</a> (agrega G).
          </p>
          <div className="bg-red-500/10 border border-red-500/30 p-2 rounded">
            <p className="text-xs text-slate-300">
              <span className="text-red-400 font-bold">Nota importante (El Choque):</span> En los acordes mayores (como <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a>), la oncena natural (F) choca directamente con la tercera mayor (E) creando una disonancia indeseada. Por esto, se suele justificar el uso de la oncena aumentada (#11, F#).
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Trecena (13ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="text-lg font-bold text-purple-400 mb-2">Trecena (13ª)</h4>
          <p className="text-slate-300 text-sm mb-4">
            La trecena equivale a una sexta tocada en el registro superior. Es la nota más aguda que se añade convencionalmente.
          </p>
          <p className="text-slate-300 text-sm font-mono bg-slate-800 p-2 rounded">
            Contraste en dominantes: <br/> <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7</a> vs <a href="#action:chord:G13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G13</a> (agrega E)
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2 mt-8">3. Tensiones disponibles según el tipo de acorde</h3>
      <p className="text-slate-300 mb-4">
        No todas las tensiones funcionan igual en todos los acordes. La disponibilidad de una tensión depende directamente de cómo interactúa con las notas del acorde base (1, 3, 5, 7).
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg my-4 text-orange-200">
        Una regla práctica: Una tensión suele funcionar bien cuando no genera una distancia de segunda menor (o b9) contra una nota estructural importante del acorde.
      </div>
      
      <p className="text-slate-300 mb-6">
        Por ejemplo, en un acorde Cmaj7, si añadimos una oncena natural (F natural), esta nota formará un intervalo de segunda menor (un semitono) por encima de la tercera mayor (E). Este choque disonante ensucia la cualidad brillante del acorde mayor, por lo que la oncena natural se considera una "nota a evitar" (avoid note) sobre acordes Maj7.
      </p>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2 mt-8">4. Tensiones en acordes Maj7</h3>
      <p className="text-slate-300 mb-4">
        Ejemplo: <span className="font-mono text-orange-400">Cmaj7 (C – E – G – B)</span>
      </p>

      <div className="overflow-x-auto mt-4 mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en Cmaj7</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">9</td>
              <td className="p-3 text-slate-300 font-mono">D</td>
              <td className="p-3 text-slate-400">Muy estable y utilizada</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">#11</td>
              <td className="p-3 text-slate-300 font-mono">F#</td>
              <td className="p-3 text-slate-400">Sonoridad lidia, moderna y abierta</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">13</td>
              <td className="p-3 text-slate-300 font-mono">A</td>
              <td className="p-3 text-slate-400">Color estable y sofisticado</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold text-red-400 mb-2 mt-6">Tensión a evitar normalmente</h4>
      <div className="overflow-x-auto mt-4 mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en Cmaj7</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-red-400 font-bold">11</td>
              <td className="p-3 text-slate-300 font-mono">F</td>
              <td className="p-3 text-slate-400"><span className="text-red-400">Choca con la tercera mayor E</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
        <h4 className="text-orange-400 font-bold mb-4">Ejemplos Interactivos:</h4>
        <ul className="space-y-3 text-slate-300">
          <li>
            <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a>: <span className="font-mono text-sm">C – E – G – B – D</span>
          </li>
          <li>
            <a href="#action:chord:Cmaj7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7(#11)</a>: <span className="font-mono text-sm">C – E – G – B – F#</span>
          </li>
          <li>
            <a href="#action:chord:Cmaj13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj13</a>: <span className="font-mono text-sm">C – E – G – B – D – A</span>
          </li>
        </ul>
      </div>

      <p className="text-slate-300">
        <span className="font-bold text-emerald-400">Conclusión del Modo Lidio:</span> Al añadir la <span className="italic text-orange-300 font-bold">#11</span> a un acorde Maj7, automáticamente estamos evocando la sonoridad del <span className="font-bold text-white">Modo Lidio</span>. Esta tensión resuelve el conflicto del choque de la oncena natural y es fundamental en el <span className="text-orange-300">jazz, la fusión y la música cinematográfica</span> para crear acordes mayores flotantes y misteriosos.
      </p>
      </div>

      {/* Sección 5 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">5. Tensiones en acordes m7</h3>
        <p className="text-slate-300 mb-4">
          Ejemplo: <span className="font-mono text-orange-400">Dm7 (D – F – A – C)</span>
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en Dm7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Muy estable</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">G</td>
                <td className="p-3 text-slate-400">Muy natural en acordes menores (sin choque con la 3ra)</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">13</td>
                <td className="p-3 text-slate-300 font-mono">B</td>
                <td className="p-3 text-slate-400">Aporta un color dórico característico</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 text-blue-200">
          ¡Ojo al contexto modal! Si el acorde proviene del Modo Dórico, la 13 es natural (ej. <a href="#action:chord:Dm13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm13</a>). Si proviene del Modo Eólico, usaremos b13 (ej. Am7 con b13). En la música moderna, el sonido m13 se asocia casi siempre al color dórico.
        </div>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
          <h4 className="text-orange-400 font-bold mb-4">Ejemplos Interactivos:</h4>
          <ul className="space-y-3 text-slate-300">
            <li>
              <a href="#action:chord:Dm9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm9</a>: <span className="font-mono text-sm">D – F – A – C – E</span>
            </li>
            <li>
              <a href="#action:chord:Dm11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm11</a>: <span className="font-mono text-sm">D – F – A – C – E – G</span>
            </li>
            <li>
              <a href="#action:chord:Dm13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm13</a>: <span className="font-mono text-sm">D – F – A – C – E – G – B</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sección 6 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">6. Tensiones en acordes dominantes 7</h3>
        <p className="text-slate-300 mb-4">
          Ejemplo: <span className="font-mono text-orange-400">G7 (G – B – D – F)</span>
        </p>
        <p className="text-slate-300 mb-6">
          Los acordes dominantes son los más flexibles de todo el sistema armónico. Al contener un tritono en su estructura base, aceptan casi cualquier tensión (natural o alterada) para incrementar la inestabilidad antes de resolver.
        </p>

        <h4 className="text-lg font-bold text-orange-400 mb-2 mt-6">A. Tensiones Naturales</h4>
        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en G7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">A</td>
                <td className="p-3 text-slate-400">Dominante estable</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">13</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Sonoridad abierta y moderna</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">#11</td>
                <td className="p-3 text-slate-300 font-mono">C#</td>
                <td className="p-3 text-slate-400">Color lidio dominante (muy común en sustitutos tritonales)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-red-400 mb-2 mt-6">B. Tensiones Alteradas</h4>
        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en G7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">b9</td>
                <td className="p-3 text-slate-300 font-mono">Ab</td>
                <td className="p-3 text-slate-400">Alta tensión, típica de dominantes que resuelven a acordes menores</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">#9</td>
                <td className="p-3 text-slate-300 font-mono">A# / Bb</td>
                <td className="p-3 text-slate-400">Sonoridad blues/jazz punzante</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">Eb</td>
                <td className="p-3 text-slate-400">Color alterado oscuro, muy usado en jazz tradicional</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg my-4 text-red-200">
          La 11 natural se evita en dominantes porque choca con la 3ra mayor (B). La única excepción es el acorde suspendido <a href="#action:chord:G7sus4" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7sus4</a> (G – C – D – F), donde la 11 reemplaza temporalmente a la tercera.
        </div>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
          <h4 className="text-orange-400 font-bold mb-4">Ejemplos Interactivos:</h4>
          <ul className="space-y-3 text-slate-300">
            <li>
              <a href="#action:chord:G9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G9</a>: <span className="font-mono text-sm">G – B – D – F – A</span>
            </li>
            <li>
              <a href="#action:chord:G13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G13</a>: <span className="font-mono text-sm">G – B – D – F – A – E</span>
            </li>
            <li>
              <a href="#action:chord:G7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(#11)</a>: <span className="font-mono text-sm">G – B – D – F – C#</span>
            </li>
            <li>
              <a href="#action:chord:G7b9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(b9)</a>: <span className="font-mono text-sm">G – B – D – F – Ab</span>
            </li>
            <li>
              <a href="#action:chord:G7#9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(#9)</a>: <span className="font-mono text-sm">G – B – D – F – A#</span>
            </li>
            <li>
              <a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(b13)</a>: <span className="font-mono text-sm">G – B – D – F – Eb</span>
            </li>
            <li>
              <a href="#action:chord:G7alt" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7alt</a>: <span className="font-mono text-sm">G – B – F – Ab – Bb – Eb</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sección 7 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">7. Tensiones en acordes m7(b5)</h3>
        <p className="text-slate-300 mb-4">
          Ejemplo: <a href="#action:chord:Bm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Bm7(b5)</a> <span className="font-mono text-orange-400">(B – D – F – A)</span>
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en Bm7(b5)</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Muy utilizada</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">G</td>
                <td className="p-3 text-slate-400">Color natural del modo locrio</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">C#</td>
                <td className="p-3 text-slate-400">Sonido más moderno, asociado al locrio #2</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg my-4 text-yellow-200">
          <p className="mb-2"><span className="font-bold">Locrio vs Locrio #2:</span> En el modo locrio natural, la b9 (C natural) genera una disonancia muy fuerte con la fundamental (B), por lo que suele evitarse.</p>
          <p>En el jazz, la solución es utilizar la escala Locria #2, la cual permite incorporar una 9 natural (C#) creando una sonoridad mucho más abierta y manejable.</p>
        </div>


      </div>

      {/* Sección 8 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">8. Tensiones en acordes disminuidos</h3>
        
        <p className="text-slate-300 mb-4">
          Es vital diferenciar la tríada disminuida del acorde con séptima:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
          <li>
            <span className="font-bold text-white">Tríada:</span> <a href="#action:chord:Cdim" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cdim</a>: <span className="font-mono text-sm">C – Eb – Gb</span>
          </li>
          <li>
            <span className="font-bold text-white">Séptima:</span> <a href="#action:chord:Cdim7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cdim7</a>: <span className="font-mono text-sm">C – Eb – Gb – Bbb</span> (Bbb equivale a A en sonido real)
          </li>
        </ul>

        <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg my-4 text-purple-200">
          <p className="font-bold mb-2">Simetría (Magia Geométrica):</p>
          <p>
            Los acordes disminuidos son totalmente simétricos, construidos por intervalos de tercera menor. Esto significa que estos 4 acordes contienen exactamente las mismas notas: <br/>
            <a href="#action:chord:Cdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Cdim7</a>, <a href="#action:chord:Ebdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Ebdim7</a>, <a href="#action:chord:Gbdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Gbdim7</a> y <a href="#action:chord:Adim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Adim7</a>.
          </p>
        </div>

        <p className="text-slate-300 mt-6 mb-4">
          Las tensiones sobre el acorde disminuido provienen de la <span className="font-bold text-emerald-400">Escala Disminuida Tono-Semitono</span>.
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tensión</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Nota en Cdim7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comentario</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">D</td>
                <td className="p-3 text-slate-400">Tensión disponible</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">F</td>
                <td className="p-3 text-slate-400">Tensión disponible</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">Ab</td>
                <td className="p-3 text-slate-400">Color disminuido</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">7 mayor</td>
                <td className="p-3 text-slate-300 font-mono">B</td>
                <td className="p-3 text-slate-400">Nota de paso o color adicional</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-slate-300">
          <span className="font-bold text-emerald-400">Conclusión:</span> En la práctica, las tensiones del disminuido suelen usarse más en la melodía, la improvisación y los enlaces cromáticos que como acordes completos de larga duración.
        </p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        {/* Sección 9 */}
        <h3 className="text-2xl font-bold text-white mb-4">9. Resumen general de tensiones por tipo de acorde</h3>
        <div className="overflow-x-auto mt-4 mb-8">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80 text-orange-400">
              <tr>
                <th className="p-3 font-bold border-b border-slate-700">Tipo de acorde</th>
                <th className="p-3 font-bold border-b border-slate-700">Tensiones recomendadas</th>
                <th className="p-3 font-bold border-b border-slate-700">Tensiones a cuidar o evitar</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">Maj7</td>
                <td className="p-3">9, #11, 13</td>
                <td className="p-3"><span className="text-red-400">11 natural</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">m7</td>
                <td className="p-3">9, 11, 13</td>
                <td className="p-3"><span className="text-red-400">b9</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">7 (Dominante)</td>
                <td className="p-3">9, 13, b9, #9, #11, b13</td>
                <td className="p-3"><span className="text-red-400">11 natural (salvo 7sus4)</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">m7(b5)</td>
                <td className="p-3">11, b13, 9 natural</td>
                <td className="p-3"><span className="text-yellow-400">b9 (según contexto)</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">dim7</td>
                <td className="p-3">9, 11, b13</td>
                <td className="p-3">Depende del uso melódico</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 10 */}
        <h3 className="text-2xl font-bold text-white mb-4">10. Tensiones en la melodía e improvisación</h3>
        <p className="text-slate-300 mb-6">
          En la improvisación y composición de melodías, las notas estables (del acorde) proporcionan reposo, mientras que las tensiones aportan color y movimiento.
        </p>
        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-8">
          <p className="text-orange-400 font-bold mb-4">Ejemplo sobre Cmaj7:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4">
            <li>
              <span className="font-bold text-white">Notas del acorde:</span> C – E – G – B
            </li>
            <li>
              <span className="font-bold text-emerald-400">Tensiones:</span> D – F# – A
            </li>
          </ul>
          <p className="text-slate-300">
            Una melodía sobre <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> puede utilizar la nota D como 9, F# como #11 o A como 13 para generar una sonoridad más moderna.
          </p>
        </div>

        {/* Sección 11 */}
        <h3 className="text-2xl font-bold text-white mb-4">11. Notas de paso, bordaduras y tensiones melódicas</h3>
        <p className="text-slate-300 mb-6">
          En la melodía, una tensión puede aparecer de diferentes maneras:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-green-500 shadow-md">
            <h4 className="text-lg font-bold text-green-400 mb-2">Nota de Paso</h4>
            <p className="text-slate-300 mb-4 text-sm">Conecta dos notas estables.</p>
            <p className="text-slate-400 text-xs mb-1">Ejemplo sobre Cmaj7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">C – D – E</p>
            <p className="text-slate-300 text-sm">La nota D funciona como paso entre C y E, y también puede entenderse como 9 del acorde.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-blue-500 shadow-md">
            <h4 className="text-lg font-bold text-blue-400 mb-2">Bordadura</h4>
            <p className="text-slate-300 mb-4 text-sm">Rodea una nota principal y vuelve a ella.</p>
            <p className="text-slate-400 text-xs mb-1">Ejemplo sobre Cmaj7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">E – F# – E</p>
            <p className="text-slate-300 text-sm">El F# puede funcionar como #11 y generar un color lidio.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-purple-500 shadow-md">
            <h4 className="text-lg font-bold text-purple-400 mb-2">Apoyatura</h4>
            <p className="text-slate-300 mb-4 text-sm">Nota tensa que cae en un tiempo fuerte y luego resuelve.</p>
            <p className="text-slate-400 text-xs mb-1">Ejemplo sobre G7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">Ab – G</p>
            <p className="text-slate-300 text-sm">La nota Ab funciona como b9 y resuelve a la fundamental G.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        {/* Sección 12 */}
        <h3 className="text-2xl font-bold text-white mb-4">12. Estrategias para improvisar con tensiones</h3>
        <p className="text-slate-300 mb-6">
          Integrar tensiones en tu vocabulario requiere entender cómo manejarlas rítmica y melódicamente. Aquí presentamos tres enfoques clave:
        </p>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
          <h4 className="text-lg font-bold text-blue-400 mb-2">Usar tensiones como color</h4>
          <p className="text-slate-300 text-sm mb-2">Ejemplo sobre <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm7</a>:</p>
          <div className="font-mono text-lg text-blue-400 my-2 bg-slate-950/50 p-2 rounded inline-block">E – F – G – A</div>
          <p className="text-slate-300 text-sm mt-2">La nota E funciona como 9 y G como 11. Se mantienen brevemente para dar color sin necesitar una resolución inmediata, aportando una sonoridad abierta y flotante.</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-green-500 mb-4">
          <h4 className="text-lg font-bold text-green-400 mb-2">Resolver tensiones en notas del acorde</h4>
          <p className="text-slate-300 text-sm mb-2">Ejemplo sobre <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7</a>:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
            <li><span className="font-mono text-green-400 font-bold">Ab – G</span> (b9 resolviendo a fundamental).</li>
            <li><span className="font-mono text-green-400 font-bold">Bb – B</span> (#9 resolviendo a tercera mayor).</li>
            <li><span className="font-mono text-green-400 font-bold">Eb – D</span> (b13 resolviendo a quinta).</li>
          </ul>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-red-500 mb-4">
          <h4 className="text-lg font-bold text-red-400 mb-2">Usar tensiones alteradas en dominantes</h4>
          <p className="text-slate-300 text-sm mb-2">Ejemplo: <a href="#action:chord:G7b9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(b9)</a> → <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a></p>
          <p className="text-slate-300 text-sm mt-2">La tensión Ab del G7(b9) resuelve armónicamente hacia G o E dentro del Cmaj7, generando una gran sensación de tensión armónica seguida de una liberación melódica natural.</p>
        </div>

        {/* Sección 13 */}
        <h3 className="text-2xl font-bold text-white mb-4 mt-8">13. Ejemplo práctico de aplicación</h3>
        
        <div className="flex flex-wrap gap-3 mt-4 mb-6">
          {/* Play Completo */}
          <a href="#action:combined:progression=Dm7,G7,Cmaj7;melody=E4:2,G4:1,E4:1,Eb4:2,G4:1,Eb4:1,D4:4" onClick={handleClick} className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg font-bold hover:bg-orange-500/30 transition-colors shadow-lg shadow-orange-500/5">
            ⚡ Play Completo (Acordes + Melodía)
          </a>
          
          {/* Sólo Armonía */}
          <a href="#action:progression:Dm7,G7,Cmaj7" onClick={handleClick} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 transition-colors">
            ▶ Sólo Armonía
          </a>
          
          {/* Sólo Melodía */}
          <a href="#action:melody:E4:2,G4:1,E4:1,Eb4:2,G4:1,Eb4:1,D4:4" onClick={handleClick} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-500/20 transition-colors">
            ▶ Sólo Melodía
          </a>
          
          {/* Stop */}
          <a href="#action:stop" onClick={handleClick} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
            ■ Stop
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Subdominante</h4>
            <a href="#action:chord:Dm7" onClick={handleClick} className="text-2xl text-orange-400 font-bold block mb-2 hover:text-orange-300 transition-colors">Dm7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensiones: 9, 11, 13</div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:E4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">E</a>
                <span className="text-xs text-slate-500">Blanca (2t)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:G4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">G</a>
                <span className="text-xs text-slate-500">Negra (1t)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:E4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">E</a>
                <span className="text-xs text-slate-500">Negra (1t)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Dominante</h4>
            <a href="#action:chord:G7" onClick={handleClick} className="text-2xl text-yellow-400 font-bold block mb-2 hover:text-yellow-300 transition-colors">G7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensiones: b9, #9, 13, b13</div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:Eb4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">Eb</a>
                <span className="text-xs text-slate-500">Blanca (2t)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:G4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">G</a>
                <span className="text-xs text-slate-500">Negra (1t)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:Eb4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">Eb</a>
                <span className="text-xs text-slate-500">Negra (1t)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Tónica</h4>
            <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-2xl text-orange-400 font-bold block mb-2 hover:text-orange-300 transition-colors">Cmaj7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensiones: 9, #11, 13</div>
            <div className="flex flex-col gap-2 mt-2 pt-2 justify-start h-full">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:D4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">D</a>
                <span className="text-xs text-slate-500">Redonda (4t)</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-300 mt-6 leading-relaxed">
          En este ejemplo, la melodía cobra vida con el ritmo de 4/4: sobre el Dm7, la nota <strong className="text-white">E</strong> (tensión 9) se establece como blanca en el tiempo fuerte y salta hacia el <strong className="text-white">G</strong> (tensión 11) para regresar al E, creando un hermoso arpegio de tensiones. Sobre el G7, introducimos el color oscuro del <strong className="text-white">Eb</strong> (tensión alterada b13), que salta temporalmente a la fundamental <strong className="text-white">G</strong> antes de volver al Eb. Finalmente, toda la tensión armónica y melódica aterriza suavemente en el <strong className="text-white">D</strong> (tensión 9) del Cmaj7, que reposa como una redonda llenando todo el compás.
        </p>

        {/* Conclusión */}
        <div className="bg-gradient-to-r from-orange-500/20 to-slate-900 p-6 rounded-xl border-l-4 border-orange-500 mt-8 shadow-md">
          <h3 className="text-xl font-bold text-orange-400 mb-3">Conclusión</h3>
          <p className="text-slate-300 mb-4">
            Comprender las tensiones es el paso definitivo para <span className="font-bold text-white">transformar acordes simples</span> en ricas texturas armónicas. No se trata simplemente de añadir notas al azar, sino de saber elegir los <span className="font-bold text-white">colores, notas de paso y apoyaturas</span> que mejor complementan el contexto modal y armónico.
          </p>
          <p className="text-slate-300">
            Al dominar las 9nas, 11nas y 13nas, no solo amplías tu vocabulario como acompañante, sino que logras una verdadera <span className="font-bold text-white">profundidad armónica</span> que enriquecerá enormemente tu improvisación y tu forma de componer y arreglar.
          </p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg mt-8">
        <h3 className="text-2xl font-bold text-white mb-4">14. Aplicación Práctica Avanzada: Autumn Leaves con Tensiones y Tritonales</h3>
        
        <div className="flex gap-4 mb-4">
          <a href="#action:progression:Am9,D9_D7b9,Gmaj9_Db7#11,Cmaj7#11,F#m7b5_C9,B7b13,Em9,Em11" onClick={handleClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center">
             ▶ Play Progresión
          </a>
          <a href="#action:stop" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center">
             ⏹ Stop
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6">
          {/* Compás 1 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:Am9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">Am9</a>
            <span className="text-xs text-slate-400 leading-tight">[ii9] (En G)</span>
          </div>

          {/* Compás 2 (Compartido) */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="flex flex-wrap justify-center gap-3 w-full mb-2">
              <a href="#action:chord:D9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-lg cursor-pointer transition-colors">D9</a>
              <a href="#action:chord:D7b9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-lg cursor-pointer transition-colors">D7(b9)</a>
            </div>
            <span className="text-xs text-slate-400 leading-tight">[V9 → V7(b9)]</span>
          </div>

          {/* Compás 3 (Compartido) */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="flex flex-wrap justify-center gap-3 w-full mb-2">
              <a href="#action:chord:Gmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-lg cursor-pointer transition-colors">Gmaj9</a>
              <a href="#action:chord:Db7#11" onClick={handleClick} className="text-pink-400 hover:text-pink-300 font-bold text-lg cursor-pointer transition-colors">Db7(#11)</a>
            </div>
            <span className="text-xs text-slate-400 leading-tight">[Imaj9 → SubV7/IV]</span>
          </div>

          {/* Compás 4 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:Cmaj7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">Cmaj7(#11)</a>
            <span className="text-xs text-slate-400 leading-tight">[IVmaj7(#11)]</span>
          </div>

          {/* Compás 5 (Compartido) */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <div className="flex flex-wrap justify-center gap-3 w-full mb-2">
              <a href="#action:chord:F#m7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-lg cursor-pointer transition-colors">F#m7(b5)</a>
              <a href="#action:chord:C9" onClick={handleClick} className="text-pink-400 hover:text-pink-300 font-bold text-lg cursor-pointer transition-colors">C9</a>
            </div>
            <span className="text-xs text-slate-400 leading-tight">[iiø7 → SubV7/V]</span>
          </div>

          {/* Compás 6 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:B7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">B7(b13)</a>
            <span className="text-xs text-slate-400 leading-tight">[V7(b13)]</span>
          </div>

          {/* Compás 7 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:Em9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">Em9</a>
            <span className="text-xs text-slate-400 leading-tight">[im9]</span>
          </div>

          {/* Compás 8 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:Em11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">Em11</a>
            <span className="text-xs text-slate-400 leading-tight">[im11]</span>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-slate-300 mb-4">
            <span className="font-bold text-white">Análisis del Db7(#11):</span> Actúa como <span className="font-bold text-pink-300">SubV7/IV</span>. En lugar de usar un G7 estático, este acorde cae por semitono hacia Cmaj7(#11). La tensión #11 (nota Sol) le otorga una brillante sonoridad Lidia Dominante.
          </p>
          <p className="text-slate-300">
            <span className="font-bold text-white">Análisis del C9:</span> Actúa como <span className="font-bold text-pink-300">SubV7/V</span>. Al interpolarse justo después del acorde semidisminuido, genera una línea de bajo cromática descendente hacia el dominante principal B7(b13).
          </p>
        </div>
      </div>
    </>
  );
};

export default Capitulo12;
