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
        <h2 className="text-3xl font-bold text-white mb-6">1. Modal Interchange: The art of borrowing</h2>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 text-slate-300 leading-relaxed">
          <p className="mb-4">Modal interchange consists of borrowing chords from other modes that share the same tonic. For example, if our main key is <strong>C Major</strong>, there are also other parallel modes that begin on the same root note: C Ionian, C Dorian, C Phrygian, C Lydian, C Mixolydian, C Aeolian, and C Locrian.</p>
          <p>They all share the tonic (C), but each has different alterations in its scale structure. When harmonized, they generate different chords. Modal interchange allows us to use some of those chords within our original progression without changing the tonal center, providing unexpected colors and greater emotional richness.</p>
        </div>
      </div>

      {/* 2. Tabla Responsiva de Modos Paralelos */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Harmonic field of the parallel modes of C</h3>
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Mode</th>
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
                <td className="p-4 font-bold text-white">C Ionian</td>
                <td className="p-4">Cmaj7</td><td className="p-4">Dm7</td><td className="p-4">Em7</td><td className="p-4">Fmaj7</td><td className="p-4">G7</td><td className="p-4">Am7</td><td className="p-4">Bm7(b5)</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Dorian</td>
                <td className="p-4">Cm7</td><td className="p-4">Dm7</td><td className="p-4">Ebmaj7</td><td className="p-4">F7</td><td className="p-4">Gm7</td><td className="p-4">Am7(b5)</td><td className="p-4">Bbmaj7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Phrygian</td>
                <td className="p-4">Cm7</td><td className="p-4">Dbmaj7</td><td className="p-4">Eb7</td><td className="p-4">Fm7</td><td className="p-4">Gm7(b5)</td><td className="p-4">Abmaj7</td><td className="p-4">Bbm7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Lydian</td>
                <td className="p-4">Cmaj7</td><td className="p-4">D7</td><td className="p-4">Em7</td><td className="p-4">F#m7(b5)</td><td className="p-4">Gmaj7</td><td className="p-4">Am7</td><td className="p-4">Bm7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Mixolydian</td>
                <td className="p-4">C7</td><td className="p-4">Dm7</td><td className="p-4">Em7(b5)</td><td className="p-4">Fmaj7</td><td className="p-4">Gm7</td><td className="p-4">Am7</td><td className="p-4">Bbmaj7</td>
              </tr>
              
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Aeolian</td>
                <td className="p-4">Cm7</td><td className="p-4">Dm7(b5)</td><td className="p-4">Ebmaj7</td><td className="p-4">Fm7</td><td className="p-4">Gm7</td><td className="p-4">Abmaj7</td><td className="p-4">Bb7</td>
              </tr>
              
              <tr className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-bold text-white">C Locrian</td>
                <td className="p-4">Cm7(b5)</td><td className="p-4">Dbmaj7</td><td className="p-4">Ebm7</td><td className="p-4">Fm7</td><td className="p-4">Gbmaj7</td><td className="p-4">Ab7</td><td className="p-4">Bbm7</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 mt-3 italic">Note: This table is the complete map of modal interchange. Slide sideways on mobile devices to see all degrees.</p>
      </div>

      {/* 3. Ejemplo Interactivo (Contraste Diatónico vs Modal) */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4">2. Practical Auditory Example</h3>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          
          <div className="mb-8">
            <p className="text-slate-300 mb-3"><strong>A) Traditional diatonic progression (C Ionian):</strong> Notice how all chords belong strictly to the major key.</p>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <a href="#action:progression:Cmaj7,Fmaj7,G7,Cmaj7" onClick={handleClick} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 transition-colors">▶ Play Progression</a>
              <div className="flex gap-2 text-lg font-mono">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - 
                <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - 
                <a href="#action:chord:G7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">G7</a> - 
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
              </div>
            </div>
          </div>

          <div>
            <p className="text-slate-300 mb-3"><strong>B) Progression with Modal Interchange (C Aeolian):</strong> Now we replace the G7 with an Fm7 borrowed from the Aeolian mode. Listen to how the "color" changes dramatically without losing the tonic.</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-500/20 transition-colors">▶ Play Interchange</a>
              <div className="flex gap-2 text-lg font-mono">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - 
                <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - 
                <a href="#action:chord:Fm7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Fm7</a> - 
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
              </div>
            </div>
            <p className="text-sm text-pink-400/80 mt-2">* The Fm7 (IVm7) enters as a dark, melancholic color before resolving into the brightness of the Cmaj7.</p>
          </div>

        </div>
      </div>

      {/* Sección 3: Acordes prestados más utilizados */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-4">3. Most commonly used borrowed chords</h3>
        <p className="text-slate-300 mb-4">Although theoretically we can use any chord from the parallel modes, in practice there are some that are incredibly common. Here are the most prominent ones and the color they add:</p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/80 text-orange-400 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Borrowed chord in C</th>
                <th className="p-4 font-bold">Degree</th>
                <th className="p-4 font-bold">Source mode</th>
                <th className="p-4 font-bold">Musical color</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Fm7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Fm7</a></td>
                <td className="p-4">IVm7</td>
                <td className="p-4">C Aeolian / C Phrygian</td>
                <td className="p-4"><span className="italic text-blue-300">Emotional, melancholic</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Ebmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Ebmaj7</a></td>
                <td className="p-4">bIIImaj7</td>
                <td className="p-4">C Dorian / C Aeolian</td>
                <td className="p-4"><span className="italic text-purple-300">Modern minor color</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Abmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Abmaj7</a></td>
                <td className="p-4">bVImaj7</td>
                <td className="p-4">C Aeolian / C Phrygian</td>
                <td className="p-4"><span className="italic text-emerald-300">Cinematic, profound</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Bbmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Bbmaj7</a></td>
                <td className="p-4">bVIImaj7</td>
                <td className="p-4">C Mixolydian / C Dorian</td>
                <td className="p-4"><span className="italic text-yellow-300">Rock, pop, modern</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Bb7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Bb7</a></td>
                <td className="p-4">bVII7</td>
                <td className="p-4">C Aeolian</td>
                <td className="p-4"><span className="italic text-orange-300">Modal dominant</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:Dbmaj7" onClick={handleClick} className="hover:text-orange-400 transition-colors">Dbmaj7</a></td>
                <td className="p-4">bIImaj7</td>
                <td className="p-4">C Phrygian / C Locrian</td>
                <td className="p-4"><span className="italic text-red-300">Dark, dramatic</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white"><a href="#action:chord:D7" onClick={handleClick} className="hover:text-orange-400 transition-colors">D7</a></td>
                <td className="p-4">II7</td>
                <td className="p-4">C Lydian</td>
                <td className="p-4"><span className="italic text-pink-300">Bright, modern</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 4: Aplicaciones musicales */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">4. Musical applications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Tarjeta 1 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-blue-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">Minor IV</h4>
            <p className="text-slate-300 mb-4">Replace the major IV with a minor IV.</p>
            <a href="#action:progression:Cmaj7,Fm7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors">▶ Listen to Progression</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Fm7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - IVm7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">The Fm7 comes from C Aeolian. It generates an emotional sonority.</p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">bVI and bVII</h4>
            <p className="text-slate-300 mb-4">Borrowing degrees from the parallel minor mode.</p>
            <a href="#action:progression:Cmaj7,Abmaj7,Bbmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-500/30 transition-colors">▶ Listen to Progression</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Abmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Abmaj7</a> - <a href="#action:chord:Bbmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Bbmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bVImaj7 - bVIImaj7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">Epic sound found in rock, pop, and film. Also used with pure triads (C - Ab - Bb - C).</p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-purple-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">bIII</h4>
            <p className="text-slate-300 mb-4">Minor color without leaving the key.</p>
            <a href="#action:progression:Cmaj7,Ebmaj7,Fmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-500/30 transition-colors">▶ Listen to Progression</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Ebmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Ebmaj7</a> - <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bIIImaj7 - IVmaj7 - Imaj7</p>
            <p className="text-sm text-slate-500 border-t border-slate-700 pt-3">The Ebmaj7 comes from C Aeolian or C Dorian.</p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Tarjeta 4 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-red-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">Application 4: bII Phrygian</h4>
            <p className="text-slate-300 mb-4">One of the strongest and darkest colors.</p>
            <a href="#action:progression:Cmaj7,Dbmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30 transition-colors">▶ Listen to Progression</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:Dbmaj7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">Dbmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - bIImaj7 - Imaj7 (The Dbmaj7 comes from C Phrygian or Locrian).</p>
          </div>

          {/* Tarjeta 5 */}
          <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-yellow-500 shadow-lg">
            <h4 className="text-lg font-bold text-white mb-2">Application 5: II7 Lydian</h4>
            <p className="text-slate-300 mb-4">Bright and modern color thanks to the #11 (F# note).</p>
            <a href="#action:progression:Cmaj7,D7,Fmaj7,Cmaj7" onClick={handleClick} className="inline-block mb-3 text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/30 transition-colors">▶ Listen to Progression</a>
            <div className="font-mono text-lg mb-2">
              <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a> - <a href="#action:chord:D7" onClick={handleClick} className="text-pink-400 font-bold hover:text-pink-300 transition-colors">D7</a> - <a href="#action:chord:Fmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Fmaj7</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-white hover:text-orange-400 transition-colors">Cmaj7</a>
            </div>
            <p className="text-sm text-slate-400 mb-4">Imaj7 - II7 - IVmaj7 - Imaj7 (The D7 comes from C Lydian).</p>
          </div>
        </div>
      </div>

      {/* Sección 5: Cómo reconocer un intercambio modal */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">5. How to recognize a modal interchange</h3>
        <p className="text-slate-300 mb-4">Sometimes you may see a strange chord and think it's modulation, when in reality it is just a modal interchange. Here is a step-by-step guide to identify it:</p>
        
        <ol className="list-decimal pl-5 space-y-3 text-slate-300 marker:text-orange-500 marker:font-bold">
          <li><strong>Identify the main key:</strong> What key is the song in? C Major?</li>
          <li><strong>Find the strange chord:</strong> Is there a chord that has notes that do not belong to the C Major scale (C D E F G A B)?</li>
          <li><strong>Verify the root of the strange chord:</strong> Is the root of that chord a note of the main scale or of a parallel scale?</li>
          <li><strong>Identify the source mode:</strong> Look for which parallel mode (Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) of the tonic contains exactly that chord.</li>
          <li><strong>Observe the resolution:</strong> Does the "strange" chord resolve back to a chord of the main key? If so, it is modal interchange. If the song stays in a new tonal center, it is modulation.</li>
        </ol>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mt-6 mb-10">
          <h4 className="text-orange-400 font-bold mb-3">Practical Recognition Example</h4>
          <p className="text-slate-300 mb-2">Progression: <span className="font-mono text-orange-300">Cmaj7 – Fmaj7 – Fm7 – Cmaj7</span></p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-sm">
            <li><strong>Key:</strong> C Major (diatonic chords: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7b5).</li>
            <li><strong>Strange chord:</strong> Fm7 (F - Ab - C - Eb). Contains Ab and Eb, which are not in C Major.</li>
            <li><strong>Source mode:</strong> The chord Fm7 (IVm7) belongs to the harmonic field of C Aeolian or C Phrygian.</li>
            <li><strong>Resolution:</strong> Resolves to Cmaj7. The tonic remains C.</li>
            <li><strong>Conclusion:</strong> The Fm7 is a borrow from the minor mode (C Aeolian).</li>
          </ul>
        </div>
      </div>

      {/* Sección 6: Intercambio Modal vs Modulación */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">6. Difference between modal interchange and modulation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Columna Izquierda: Intercambio Modal */}
          <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/50 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-blue-400 mb-3">Modal Interchange</h4>
              <p className="text-slate-300 mb-4">
                Chords are borrowed, but <strong className="text-white">the tonal center (the tonic) does not change</strong>. We still feel that "home" is the original I chord.
              </p>
              <div className="font-mono text-lg mb-6">
                <span className="text-white">Cmaj7</span> - <span className="text-white">Fmaj7</span> - <span className="text-blue-400 font-bold">Fm7</span> - <span className="text-white">Cmaj7</span>
              </div>
            </div>
            <div>
              <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="inline-block text-sm bg-blue-500/20 border border-blue-500/40 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors font-bold mb-3">
                ▶ Listen to Interchange
              </a>
              <p className="text-sm text-blue-300/70 italic block">The song remains in C.</p>
            </div>
          </div>

          {/* Columna Derecha: Modulación */}
          <div className="bg-orange-900/20 p-6 rounded-xl border border-orange-500/50 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-orange-400 mb-3">Modulation</h4>
              <p className="text-slate-300 mb-4">
                There is a definitive change. The tonal center shifts and <strong className="text-white">a new note becomes the permanent "home"</strong>.
              </p>
              <div className="font-mono text-lg mb-6">
                <span className="text-white">Cmaj7</span> - <span className="text-white">Fmaj7</span> - <span className="text-orange-400 font-bold">A7</span> - <span className="text-white">Dmaj7</span>
              </div>
            </div>
            <div>
              <a href="#action:progression:Cmaj7,Fmaj7,A7,Dmaj7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Listen to Modulation from C to D
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Sección 7: Ejercicios Prácticos */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">7. Practical exercises</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Exercise 1: Add Fm7</p>
              <p className="text-slate-400 text-xs">Listen to the smooth resolution from minor IV to major I.</p>
            </div>
            <a href="#action:progression:Cmaj7,Fmaj7,Fm7,Cmaj7" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-sky-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ Play</a>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Exercise 2: Transpose bVI and bVII to G</p>
              <p className="text-slate-400 text-xs font-mono">C - Ab - Bb - C &nbsp;➜&nbsp; G - Eb - F - G</p>
            </div>
            <div className="flex gap-2">
              <a href="#action:progression:C,Ab,Bb,C" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-emerald-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ C</a>
              <a href="#action:progression:G,Eb,F,G" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-purple-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ G</a>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between border border-slate-700">
            <div>
              <p className="font-bold text-white text-sm mb-1">Exercise 3: Melody over bII</p>
              <p className="text-slate-400 text-xs">Demonstrate the Db note landing on the Dbmaj7 chord in C.</p>
            </div>
            <a href="#action:combined:progression=Cmaj7,Dbmaj7,Cmaj7;melody=E4:4,Db4:4,C4:4" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-pink-400 border border-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">▶ Play with Melody</a>
          </div>
        </div>
      </div>

      {/* Sección 8: El Intercambio Modal en la Música Popular */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-white mb-6">8. Modal Interchange in Popular Music</h3>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-pink-500/30 shadow-xl">
          <h4 className="text-xl font-bold text-pink-400 mb-2">Classic Example: "Creep" - Radiohead</h4>
          <p className="text-slate-300 mb-6">
            This song is world-famous for its masterful use of modal interchange to generate melancholy. It is originally in G, but we will analyze it in our study key (C major) to see it more clearly.
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
              ▶ Listen to Progression
            </a>
          </div>

          {/* Explicación Teórica */}
          <div className="space-y-4 text-slate-300">
            <p>
              <strong className="text-white">What is happening here?</strong>
            </p>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>The song starts firmly on its tonic (<strong className="text-white">C</strong>).</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>
                  It moves through the <strong className="text-white">E major</strong> chord. In the key of C, this degree should be minor (Em). By making it major, it acts as a <strong>secondary dominant</strong> (theoretically the V of Am). However, instead of resolving to the Am, it surprises by falling into the F (a "deceptive resolution"), which generates an upward, bright, and very dramatic tension.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>It resolves to the expected subdominant (<strong className="text-white">F</strong>), giving us a feeling of epic relief and openness.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2 mt-1">•</span>
                <span>
                  <strong className="text-orange-400">Here is the magic!</strong> Instead of returning to C, the F major darkens and becomes <strong className="text-pink-400">Fm</strong> (the minor IV borrowed from C Aeolian). This note that drops a semitone (from A natural to A flat) is what "breaks our hearts" and defines the identity of the song before restarting the cycle.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ejemplo Jazz: "All of Me" */}
        <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-amber-500 shadow-lg mt-8">
          <h4 className="text-xl font-bold text-amber-400 mb-3">Jazz Example: "All of Me" (Classic Standard)</h4>
          <p className="text-slate-300 mb-6">
            If the minor IV sounds heartbreaking in rock, it sounds smooth, elegant, and sophisticated in jazz. In the famous B section of "All of Me" (played in <strong className="text-white">C major</strong>), we encounter this legendary movement.
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
              ▶ Listen to Jazz Progression
            </a>
          </div>

          <h5 className="font-bold text-white text-lg mb-3">The secret of voice leading:</h5>
          <ul className="space-y-4 text-slate-300 mb-8">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                We start on the diatonic subdominant (<strong className="text-white">Fmaj7</strong>), which sounds bright and open.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                Then the modal interchange enters with the <strong className="text-pink-400">Fm7</strong> borrowed from the Aeolian mode. Why does it sound so good? Because it creates a secret descending melodic line: the <strong className="text-white">A</strong> note (third of F) drops a half-tone to <strong className="text-white">A-flat</strong> (minor third of Fm).
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2 mt-1">🎷</span>
              <span>
                That A-flat note needs to resolve, and it does so by dropping another half-tone to the <strong className="text-white">G</strong> note (the fifth of the <strong className="text-white">Cmaj7</strong> chord). This smooth chromatic movement (A ➔ Ab ➔ G) is the DNA of the jazz sound.
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
              View Harmony and Full Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Conclusión Final */}
      <div className="bg-gradient-to-r from-orange-500/20 to-slate-900 p-6 rounded-xl border-l-4 border-orange-500 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Conclusion</h3>
        <p className="text-slate-300 leading-relaxed">
          Modal interchange is one of the most powerful reharmonization tools. It allows you to access an immense palette of colors without the complexity of changing keys. Remember: <strong>a single modal interchange chord is enough to give more color, drama, and emotion to a conventional progression</strong>. Start by trying the minor IV and the major bVI in your compositions!
        </p>
      </div>
    </>
  );
};

export default Capitulo13;