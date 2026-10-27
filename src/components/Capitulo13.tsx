import React from 'react';

interface Capitulo13Props {
  onAction?: (action: string) => void;
}

const Capitulo13: React.FC<Capitulo13Props> = ({ onAction }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#action:') && onAction) {
      onAction(href);
    }
  };

  return (
    <>
      {/* 1. Contenedor Principal y Texto Introductorio */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-6">1. Intercambio Modal: El arte de tomar prestado</h2>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 text-slate-300 leading-relaxed">
          <p className="mb-4">El intercambio modal consiste en tomar prestados acordes de otros modos que tienen la misma tónica. Por ejemplo, si nuestra tonalidad principal es <strong>C Mayor</strong>, también existen otros modos paralelos que comienzan en la misma nota fundamental: C Jónico, C Dórico, C Frigio, C Lidio, C Mixolidio, C Eólico y C Locrio.</p>
          <p>Todos comparten la tónica (C), pero cada uno tiene alteraciones diferentes en su estructura de escala. Al armonizarlos, generan acordes distintos. El intercambio modal nos permite usar algunos de esos acordes dentro de nuestra progresión original sin cambiar de centro tonal, aportando colores inesperados y mayor riqueza emocional.</p>
        </div>
      </div>

      {/* 2. Tabla Responsiva de Modos Paralelos */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Campo armónico de los modos paralelos de C</h3>
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Modo</th>
                <th className="p-4 font-bold">I</th>
                <th className="p-4 font-bold">II</th>
                <th className="p-4 font-bold">III</th>
                <th className="p-4 font-bold">IV</th>
                <th className="p-4 font-bold">V</th>
                <th className="p-4 font-bold">VI</th>
                <th className="p-4 font-bold">VII</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Jónico</td>
                <td className="p-4">Cmaj7</td><td className="p-4">Dm7</td><td className="p-4">Em7</td><td className="p-4">Fmaj7</td><td className="p-4">G7</td><td className="p-4">Am7</td><td className="p-4">Bm7(b5)</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Dórico</td>
                <td className="p-4">Cm7</td><td className="p-4">Dm7</td><td className="p-4">Ebmaj7</td><td className="p-4">F7</td><td className="p-4">Gm7</td><td className="p-4">Am7(b5)</td><td className="p-4">Bbmaj7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Frigio</td>
                <td className="p-4">Cm7</td><td className="p-4">Dbmaj7</td><td className="p-4">Eb7</td><td className="p-4">Fm7</td><td className="p-4">Gm7(b5)</td><td className="p-4">Abmaj7</td><td className="p-4">Bbm7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Lidio</td>
                <td className="p-4">Cmaj7</td><td className="p-4">D7</td><td className="p-4">Em7</td><td className="p-4">F#m7(b5)</td><td className="p-4">Gmaj7</td><td className="p-4">Am7</td><td className="p-4">Bm7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Mixolidio</td>
                <td className="p-4">C7</td><td className="p-4">Dm7</td><td className="p-4">Em7(b5)</td><td className="p-4">Fmaj7</td><td className="p-4">Gm7</td><td className="p-4">Am7</td><td className="p-4">Bbmaj7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Eólico</td>
                <td className="p-4">Cm7</td><td className="p-4">Dm7(b5)</td><td className="p-4">Ebmaj7</td><td className="p-4">Fm7</td><td className="p-4">Gm7</td><td className="p-4">Abmaj7</td><td className="p-4">Bb7</td>
              </tr>
              
              <tr className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Locrio</td>
                <td className="p-4">Cm7(b5)</td><td className="p-4">Dbmaj7</td><td className="p-4">Ebm7</td><td className="p-4">Fm7</td><td className="p-4">Gbmaj7</td><td className="p-4">Ab7</td><td className="p-4">Bbm7</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 mt-3 italic">Nota: Esta tabla es el mapa completo del intercambio modal. Desliza hacia los lados en móviles para ver todos los grados.</p>
      </div>

      {/* 3. Ejemplo Interactivo (Contraste Diatónico vs Modal) */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4">2. Ejemplo Práctico Auditivo</h3>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          
          <div className="mb-8">
            <p className="text-slate-300 mb-3"><strong>A) Progresión diatónica tradicional (C Jónico):</strong> Fíjate cómo todos los acordes pertenecen estrictamente a la tonalidad mayor.</p>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <a href="#action:progression:Cmaj7,Fmaj7,G7,Cmaj7" onClick={handleClick} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 transition-colors">▶ Play Progresión</a>
              <div className="flex gap-2 text-lg font-mono">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - 
                <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - 
                <a href="#action:chord:G7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">G7</a> - 
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-slate-300 mb-3"><strong>B) Progresión con Intercambio Modal (C Eólico):</strong> Ahora reemplazamos el G7 por un Fm7 prestado del modo Eólico. Escucha cómo cambia el "color" dramáticamente sin perder la tónica.</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-500/20 transition-colors">▶ Play Intercambio</a>
              <div className="flex gap-2 text-lg font-mono">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - 
                <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - 
                <a href="#action:chord:Fm7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Fm7</a> - 
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
              </div>
            </div>
            <p className="text-sm text-pink-400/80 mt-2">* El Fm7 (IVm7) entra como un color oscuro melancólico antes de resolver a la luz del Cmaj7.</p>
          </div>

        </div>
      </div>

      {/* Sección 3: Acordes prestados más utilizados */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-4">3. Acordes prestados más utilizados</h3>
        <p className="text-slate-300 mb-4">Aunque teóricamente podemos usar cualquier acorde de los modos paralelos, en la práctica hay algunos que son increíblemente comunes. Aquí están los más destacados y el color que aportan:</p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/80 text-orange-400 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Acorde prestado en C</th>
                <th className="p-4 font-bold">Grado</th>
                <th className="p-4 font-bold">Modo de origen</th>
                <th className="p-4 font-bold">Color musical</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Fm7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Fm7</a></td>
                <td className="p-4">IVm7</td>
                <td className="p-4">C eólico / C frigio</td>
                <td className="p-4"><span className="italic text-blue-300">Emotivo, melancólico</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Ebmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Ebmaj7</a></td>
                <td className="p-4">bIIImaj7</td>
                <td className="p-4">C dórico / C eólico</td>
                <td className="p-4"><span className="italic text-purple-300">Color menor moderno</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Abmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Abmaj7</a></td>
                <td className="p-4">bVImaj7</td>
                <td className="p-4">C eólico / C frigio</td>
                <td className="p-4"><span className="italic text-emerald-300">Cinematográfico, profundo</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Bbmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Bbmaj7</a></td>
                <td className="p-4">bVIImaj7</td>
                <td className="p-4">C mixolidio / C dórico</td>
                <td className="p-4"><span className="italic text-yellow-300">Rock, pop, moderno</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Bb7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Bb7</a></td>
                <td className="p-4">bVII7</td>
                <td className="p-4">C eólico</td>
                <td className="p-4"><span className="italic text-orange-300">Dominante modal</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Dbmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Dbmaj7</a></td>
                <td className="p-4">bIImaj7</td>
                <td className="p-4">C frigio / C locrio</td>
                <td className="p-4"><span className="italic text-red-300">Oscuro, dramático</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:D7" onClick={handleClick} className="hover:text-orange-400 transition-colors">D7</a></td>
                <td className="p-4">II7</td>
                <td className="p-4">C lidio</td>
                <td className="p-4"><span className="italic text-pink-300">Brillante, moderno</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 4: Aplicaciones musicales */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">4. Aplicaciones musicales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Tarjeta 1 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-blue-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">IV menor</h4>
            <p className="text-slate-300 mb-4">Cambiar el IV mayor por IV menor.</p>
            <a href="#action:progression:Cmaj7,Fm7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors">▶ Escuchar Progresión</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Fm7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - IVm7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">El Fm7 viene de C eólico. Genera una sonoridad emotiva.</p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">bVI y bVII</h4>
            <p className="text-slate-300 mb-4">Tomar grados del modo menor paralelo.</p>
            <a href="#action:progression:Cmaj7,Abmaj7,Bbmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-500/30 transition-colors">▶ Escuchar Progresión</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Abmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Abmaj7</a> - <a href="#action:chord:Bbmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Bbmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bVImaj7 - bVIImaj7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">Sonido épico de rock, pop y cine. También se usa con triadas puras (C - Ab - Bb - C).</p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-purple-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">bIII</h4>
            <p className="text-slate-300 mb-4">Color menor sin abandonar la tonalidad.</p>
            <a href="#action:progression:Cmaj7,Ebmaj7,Fmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-500/30 transition-colors">▶ Escuchar Progresión</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Ebmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Ebmaj7</a> - <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bIIImaj7 - IVmaj7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">El Ebmaj7 viene de C eólico o C dórico.</p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Tarjeta 4 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-red-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">Aplicación 4: bII frigio</h4>
            <p className="text-slate-300 mb-4">Uno de los colores más fuertes y oscuros.</p>
            <a href="#action:progression:Cmaj7,Dbmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30 transition-colors">▶ Escuchar Progresión</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Dbmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Dbmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bIImaj7 - Imaj7 (El Dbmaj7 viene de C frigio o locrio).</p>
          </div>

          {/* Tarjeta 5 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-yellow-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">Aplicación 5: II7 lidio</h4>
            <p className="text-slate-300 mb-4">Color brillante y moderno gracias a la #11 (nota F#).</p>
            <a href="#action:progression:Cmaj7,D7,Fmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/30 transition-colors">▶ Escuchar Progresión</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:D7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">D7</a> - <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - II7 - IVmaj7 - Imaj7 (El D7 viene de C lidio).</p>
          </div>
        </div>
      </div>

      {/* Sección 5: Cómo reconocer un intercambio modal */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">5. Cómo reconocer un intercambio modal</h3>
        <p className="text-slate-300 mb-4">A veces puedes ver un acorde extraño y pensar que es modulación, cuando en realidad es solo un intercambio modal. Aquí tienes una guía paso a paso para identificarlo:</p>
        
        <ol className="list-decimal pl-5 space-y-3 text-slate-300 marker:text-orange-500 marker:font-bold">
          <li><strong>Identifica la tonalidad principal:</strong> ¿En qué tono está la canción? ¿C Mayor?</li>
          <li><strong>Encuentra el acorde extraño:</strong> ¿Hay un acorde que tiene notas que no pertenecen a la escala de C Mayor (C D E F G A B)?</li>
          <li><strong>Verifica la fundamental del acorde extraño:</strong> ¿La raíz de ese acorde es una nota de la escala principal o de una escala paralela?</li>
          <li><strong>Identifica el modo de origen:</strong> Busca qué modo paralelo (Dórico, Frigio, Lidio, Mixolidio, Eólico, Locrio) de la tónica contiene exactamente ese acorde.</li>
          <li><strong>Observa la resolución:</strong> ¿El acorde "extraño" resuelve de nuevo a un acorde de la tonalidad principal? Si es así, es intercambio modal. Si la canción se queda en un nuevo centro tonal, es modulación.</li>
        </ol>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mt-6 mb-10">
          <h4 className="text-orange-400 font-bold mb-3">Ejemplo Práctico de Reconocimiento</h4>
          <p className="text-slate-300 mb-2">Progresión: <span className="font-mono text-orange-300">Cmaj7 – Fmaj7 – Fm7 – Cmaj7</span></p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
            <li><strong>Tonalidad:</strong> C Mayor (acordes diatónicos: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5).</li>
            <li><strong>Acorde extraño:</strong> Fm7 (F - Ab - C - Eb). Contiene Ab y Eb, que no están en C Mayor.</li>
            <li><strong>Modo de origen:</strong> El acorde Fm7 (IVm7) pertenece al campo armónico de C Eólico o C Frigio.</li>
            <li><strong>Resolución:</strong> Resuelve a Cmaj7. La tónica sigue siendo C.</li>
            <li><strong>Conclusión:</strong> El Fm7 es un préstamo del modo menor (C Eólico).</li>
          </ul>
        </div>
      </div>

      {/* Sección 6: Intercambio Modal vs Modulación */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">6. Diferencia entre intercambio modal y modulación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Columna Izquierda: Intercambio Modal */}
          <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/50 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-blue-400 mb-3">Intercambio Modal</h4>
              <p className="text-slate-300 mb-4">
                Se toman acordes prestados, pero <strong className="text-white">el centro tonal (la tónica) no cambia</strong>. Seguimos sintiendo que la "casa" es el acorde I original.
              </p>
              <div className="font-mono text-lg mb-6">
                <span className="text-white">Cmaj7</span> - <span className="text-white">Fmaj7</span> - <span className="text-blue-400 font-bold">Fm7</span> - <span className="text-white">Cmaj7</span>
              </div>
            </div>
            <div>
              <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="inline-block text-sm bg-blue-500/20 border border-blue-500/40 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors font-bold mb-3">
                ▶ Escuchar Intercambio
              </a>
              <p className="text-sm text-blue-300/70 italic block">La canción sigue estando en Do.</p>
            </div>
          </div>

          {/* Columna Derecha: Modulación */}
          <div className="bg-orange-900/20 p-6 rounded-xl border border-orange-500/50 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-orange-400 mb-3">Modulación</h4>
              <p className="text-slate-300 mb-4">
                Hay un cambio definitivo. El centro tonal se desplaza y <strong className="text-white">una nueva nota se convierte en la "casa" permanente</strong>.
              </p>
              <div className="font-mono text-lg mb-6">
                <span className="text-white">Cmaj7</span> - <span className="text-white">Fmaj7</span> - <span className="text-orange-400 font-bold">A7</span> - <span className="text-white">Dmaj7</span>
              </div>
            </div>
            <div>
              <a href="#action:progression:Cmaj7,Fmaj7,A7,Dmaj7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Escuchar Modulación de C a D
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Sección 7: Ejercicios Prácticos */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">7. Ejercicios prácticos</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Ejercicio 1: Agrega Fm7</p>
              <p className="text-slate-400 text-xs">Escucha la resolución suave del IV menor al I mayor.</p>
            </div>
            <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-sky-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ Play</a>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Ejercicio 2: Transportar bVI y bVII a G</p>
              <p className="text-slate-400 text-xs font-mono">C - Ab - Bb - C &nbsp;➜&nbsp; G - Eb - F - G</p>
            </div>
            <div className="flex gap-2">
              <a href="#action:progression:C,Ab,Bb,C" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ C</a>
              <a href="#action:progression:G,Eb,F,G" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-purple-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ G</a>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Ejercicio 3: Melodía sobre bII</p>
              <p className="text-slate-400 text-xs">Demuestra la nota Db cayendo sobre el acorde Dbmaj7 en C.</p>
            </div>
            <a href="#action:combined:progression=Cmaj7,Dbmaj7,Cmaj7;melody=E4:4,Db4:4,C4:4" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-pink-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ Play con Melodía</a>
          </div>
        </div>
      </div>

      {/* Sección 8: El Intercambio Modal en la Música Popular */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">8. El Intercambio Modal en la Música Popular</h3>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-pink-500/30 shadow-xl">
          <h4 className="text-xl font-bold text-pink-400 mb-2">Ejemplo Clásico: "Creep" - Radiohead</h4>
          <p className="text-slate-300 mb-6">
            Esta canción es mundialmente famosa por su uso magistral del intercambio modal para generar melancolía. Originalmente está en G, pero vamos a analizarla en nuestra tonalidad de estudio (C mayor) para verla más clara.
          </p>

          {/* Contenedor Interactivo */}
          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/50 mb-6 text-center">
            <div className="font-mono text-2xl mb-2 tracking-widest">
              <a href="#action:chord:C" onClick={handleClick} className="text-white hover:text-pink-300 transition-colors">C</a> - 
              <a href="#action:chord:E" onClick={handleClick} className="text-white hover:text-pink-300 transition-colors"> E</a> - 
              <a href="#action:chord:F" onClick={handleClick} className="text-white hover:text-pink-300 transition-colors"> F</a> - 
              <a href="#action:chord:Fm" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors scale-110 inline-block"> Fm</a>
            </div>
            
            {/* Análisis Grados */}
            <div className="flex justify-center gap-6 text-sm text-slate-400 font-mono mb-8">
              <span>I</span>
              <span>III</span>
              <span>IV</span>
              <span className="text-pink-400 font-bold">IVm</span>
            </div>

            {/* Botón de Play (añadimos un C al final para escuchar la resolución) */}
            <a href="#action:progression:C,E,F,Fm,C" onClick={handleClick} className="inline-block bg-pink-500/20 border border-pink-500/50 text-pink-300 px-6 py-3 rounded-full hover:bg-pink-500/30 transition-all font-bold shadow-lg shadow-pink-500/10">
              ▶ Escuchar la Progresión
            </a>
          </div>

          {/* Explicación Teórica */}
          <div className="space-y-4 text-slate-300">
            <p>
              <strong className="text-white">¿Qué está pasando aquí?</strong>
            </p>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>La canción arranca firme en su tónica (<strong className="text-white">C</strong>).</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>
                  Pasa por el acorde <strong className="text-white">E mayor</strong>. En la escala de Do, este grado debería ser menor (Em). Al hacerlo mayor, actúa como un <strong>dominante secundario</strong> (teóricamente el V de Am). Sin embargo, en lugar de resolver hacia el Am, sorprende cayendo al F (una "resolución engañosa"), lo que genera una tensión ascendente, brillante y muy dramática.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>Resuelve al subdominante esperado (<strong className="text-white">F</strong>), dándonos una sensación de alivio épico y apertura.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>
                  <strong className="text-orange-400">¡Aquí está la magia!</strong> En lugar de volver a C, el F mayor se oscurece y se convierte en <strong className="text-pink-400">Fm</strong> (el IV menor prestado de C Eólico). Esta nota que baja un semitono (de La natural a La bemol) es la que "nos rompe el corazón" y define la identidad de la canción antes de volver a empezar el ciclo.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ejemplo Jazz: "All of Me" */}
        <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-amber-500 shadow-lg mt-8">
          <h4 className="text-xl font-bold text-amber-400 mb-3">Ejemplo Jazz: "All of Me" (Estándar Clásico)</h4>
          <p className="text-slate-300 mb-6">
            Si en el rock el IV menor suena desgarrador, en el jazz suena suave, elegante y sofisticado. En la famosa sección B de "All of Me" (tocada en <strong className="text-white">Do mayor</strong>), nos encontramos con este movimiento legendario.
          </p>
          
          {/* Contenedor de la Progresión */}
          <div className="bg-slate-900/80 p-5 rounded-lg mb-6 border border-slate-700/50 text-center">
            <div className="font-mono text-2xl mb-2">
              <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Fm7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:A7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">A7</a>
            </div>
            <div className="text-sm text-slate-400 mb-5 font-mono">
              IVmaj7  -  <span className="text-pink-400 font-bold">IVm7</span>  -  Imaj7  -  VI7
            </div>
            <a href="#action:progression:Fmaj7,Fm7,Cmaj7,A7" onClick={handleClick} className="inline-block text-sm bg-amber-500/20 border border-amber-500/40 text-amber-400 px-5 py-2.5 rounded-lg hover:bg-amber-500/30 transition-colors font-bold shadow-md">
              ▶ Escuchar Progresión Jazz
            </a>
          </div>

          <h5 className="font-bold text-white text-lg mb-3">El secreto de la conducción de voces:</h5>
          <ul className="space-y-4 text-slate-300 mb-8">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                Arrancamos en el subdominante diatónico (<strong className="text-white">Fmaj7</strong>), que suena brillante y abierto.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                Luego entra el intercambio modal con el <strong className="text-pink-400">Fm7</strong> prestado del modo Eólico. ¿Por qué suena tan bien? Porque crea una línea melódica secreta descendente: la nota <strong className="text-white">La</strong> (tercera de F) baja medio tono a <strong className="text-white">La bemol</strong> (tercera menor de Fm).
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                Esa nota La bemol necesita resolver, y lo hace cayendo medio tono más hacia la nota <strong className="text-white">Sol</strong> (la quinta del acorde <strong className="text-white">Cmaj7</strong>). Este movimiento cromático suave (A ➔ Ab ➔ G) es el ADN del sonido jazzístico.
              </span>
            </li>
          </ul>

          {/* Botón hacia Creación Musical */}
          <div className="text-center pt-6 border-t border-slate-700/50">
            <button 
              onClick={() => {
                sessionStorage.setItem('initialStandard', 'all-of-me');
                window.dispatchEvent(new CustomEvent('selectStandard', { detail: 'all-of-me' }));
                window.dispatchEvent(new CustomEvent('navigateTab', { detail: 'standards' }));
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all w-full md:w-auto justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              Ver Armonía y Análisis Completo
            </button>
          </div>
        </div>
      </div>

      {/* Conclusión Final */}
      <div className="bg-gradient-to-r from-orange-500/20 to-slate-900 p-6 rounded-xl border-l-4 border-orange-500 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Conclusión</h3>
        <p className="text-slate-300 leading-relaxed">
          El intercambio modal es una de las herramientas de rearmonización más potentes. Te permite acceder a una paleta de colores inmensa sin la complejidad de cambiar de tonalidad. Recuerda: <strong>un solo acorde de intercambio modal es suficiente para darle más color, dramatismo y emoción a una progresión</strong> convencional. ¡Empieza probando el IV menor y el bVI mayor en tus composiciones!
        </p>
      </div>
    </>
  );
};

export default Capitulo13;
