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
      {/* 1. Header and Introduction */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Chapter 14: Melodic Minor Scale</h2>
        <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl border border-slate-700 text-slate-300 leading-relaxed text-lg shadow-lg">
          <p className="mb-4">The melodic minor scale is one of the most important scales in modern music, especially in jazz, fusion, sophisticated popular music, and film scoring.</p>
          <p className="mb-4">Its sound is very special because it blends two worlds:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-indigo-300">
            <li>It has a <strong>minor third</strong>, which is why it retains a deep minor color.</li>
            <li>It has a <strong>major sixth and major seventh</strong>, which is why it sounds more open, modern, and elegant than the natural minor scale.</li>
          </ul>
          <p className="text-sm text-slate-400 italic bg-slate-900/50 p-4 rounded-lg border-l-2 border-indigo-500">
            * Note: In traditional classical music, the melodic minor scale usually changes when ascending and descending. However, in jazz and modern music, it is generally used the same way in both directions.
          </p>
        </div>
      </div>

      {/* 2. Formation of the melodic minor scale */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-orange-400 mb-6">1. Formation of the melodic minor scale</h3>
        <p className="text-slate-300 mb-4">The formula for the melodic minor scale is: <strong className="font-mono text-white bg-slate-800 px-2 py-1 rounded">1 – 2 – b3 – 4 – 5 – 6 – 7</strong></p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg mb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Scale</th>
                <th className="p-4 font-bold">Listen to scale</th>
              </tr>
            </thead>
            <tbody className="text-slate-400 font-mono">
              <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-sans text-white">C natural minor</td>
                <td className="p-4">
                  <a href="#action:scale:C:Menor" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block">
                    ▶ C – D – Eb – F – G – <span className="text-pink-400">Ab – Bb</span>
                  </a>
                </td>
              </tr>
              <tr className="bg-indigo-900/20 hover:bg-indigo-900/40 transition-colors">
                <td className="p-4 font-sans text-white font-bold">C melodic minor</td>
                <td className="p-4">
                  <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block">
                    ▶ C – D – Eb – F – G – A – B
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-300 text-sm">The difference is in the 6th and 7th degrees. That is why it has a brighter and more modern sound.</p>
      </div>

      {/* 3. Main Sound (Interactive Card) */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">2. Main sound of the melodic minor scale</h3>
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-indigo-500 shadow-xl">
          <p className="text-slate-300 mb-6">
            The most representative chord of this scale is the minor major seventh chord: <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 font-bold hover:text-orange-300 transition-colors text-lg">Cm(maj7)</a> (C - Eb - G - B). It has a mysterious, elegant, and cinematic sonority. It is also frequently used as a minor sixth chord: <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 font-bold hover:text-orange-300 transition-colors text-lg">Cm6</a> (C - Eb - G - A).
          </p>
          
          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Example progression (Ballad/Jazz/Film):</p>
              <div className="font-mono text-xl md:text-2xl">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a> - <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm6</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a>
              </div>
            </div>
            <a href="#action:progression:Cm(maj7),Cm6,Fm7,G7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Listen to Progression
            </a>
          </div>
        </div>
      </div>

      {/* 4. Chords formed from C melodic minor */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-orange-400 mb-6">3. Chords formed from C melodic minor</h3>
        <p className="text-slate-300 mb-4 text-sm md:text-base">If we build chords on each note of the C Melodic Minor scale (stacking thirds), we get the following harmonic field:</p>
        
        <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-700 shadow-lg">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
              <tr>
                <th className="p-4 font-bold">Degree</th>
                <th className="p-4 font-bold">Chord</th>
                <th className="p-4 font-bold">Notes</th>
                <th className="p-4 font-bold">Main color</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">I</td>
                <td className="p-4 font-mono text-indigo-400 font-bold">Cm(maj7)</td>
                <td className="p-4 font-mono text-slate-400">C - Eb - G - B</td>
                <td className="p-4 text-blue-200">Dark, mysterious, jazzy</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">II</td>
                <td className="p-4 font-mono text-white">Dm7</td>
                <td className="p-4 font-mono text-slate-400">D - F - A - C</td>
                <td className="p-4 text-blue-200">Minor, soft</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">III</td>
                <td className="p-4 font-mono text-white">Ebmaj7(#5)</td>
                <td className="p-4 font-mono text-slate-400">Eb - G - B - D</td>
                <td className="p-4 text-blue-200">Augmented (Bright, tense)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">IV</td>
                <td className="p-4 font-mono text-white">F7</td>
                <td className="p-4 font-mono text-slate-400">F - A - C - Eb</td>
                <td className="p-4 text-blue-200">Bluesy, floating (Lydian Dominant)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">V</td>
                <td className="p-4 font-mono text-white">G7</td>
                <td className="p-4 font-mono text-slate-400">G - B - D - F</td>
                <td className="p-4 text-blue-200">Classic dominant (with tensions)</td>
              </tr>
              <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono font-bold">VI</td>
                <td className="p-4 font-mono text-white">Am7(b5)</td>
                <td className="p-4 font-mono text-slate-400">A - C - Eb - G</td>
                <td className="p-4 text-blue-200">Unstable (Half-diminished)</td>
              </tr>
              <tr className="bg-orange-900/20 hover:bg-orange-900/30 transition-colors">
                <td className="p-4 font-mono font-bold text-orange-400">VII</td>
                <td className="p-4 font-mono text-orange-400 font-bold">Bm7(b5) / B7alt</td>
                <td className="p-4 font-mono text-orange-200">B - D - F - A</td>
                <td className="p-4 text-orange-300 font-bold italic">Base of the Altered sound (Maximum tension)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modes derived from the melodic minor scale */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white mb-6">4. Modes derived from the melodic minor scale</h3>
        <p className="text-slate-300 mb-8">Each degree of the melodic minor scale generates a mode with a unique color. Below, we explore their structure, use, and sonority.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mode 1 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">1. Melodic Minor (Tonic)</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 1st degree | Notes: C-D-Eb-F-G-A-B</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2M - 3m - 4P - 5P - 6M - 7M
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> Cm(maj7), Cm6. Dark, mysterious, jazzy color.</p>
            </div>
            <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 2 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">2. Dorian b2</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 2nd degree | Notes: D-Eb-F-G-A-B-C</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2m - 3m - 4P - 5P - 6M - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> Dm7(b9). Minor chords with b9 or sus(b9).</p>
            </div>
            <a href="#action:scale:D:Dórico b2" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 3 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">3. Lydian Augmented</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 3rd degree | Notes: Eb-F-G-A-B-C-D</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2M - 3M - 4aug - 5aug - 6M - 7M
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> Ebmaj7(#5). Floating sonority, augmented chords.</p>
            </div>
            <a href="#action:scale:Eb:Lidio Aumentado" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 4 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">4. Lydian b7</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 4th degree | Notes: F-G-A-B-C-D-Eb</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2M - 3M - 4aug - 5P - 6M - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> F7(#11). Dominants that do not resolve (Tritone substitutions).</p>
            </div>
            <a href="#action:scale:F:Lidio b7" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 5 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">5. Mixolydian b13</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 5th degree | Notes: G-A-B-C-D-Eb-F</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2M - 3M - 4P - 5P - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> G7(b13). Dominant chords that resolve to a minor key.</p>
            </div>
            <a href="#action:scale:G:Mixolidio b13" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 6 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">6. Locrian natural 2</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 6th degree | Notes: A-B-C-D-Eb-F-G</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2M - 3m - 4P - 5dim - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> Am7(b5). Half-diminished chords where the major ninth is allowed.</p>
            </div>
            <a href="#action:scale:A:Locrio natural 2" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

          {/* Mode 7 */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between md:col-span-2 md:w-1/2 md:mx-auto">
            <div>
              <h4 className="text-xl font-bold text-white mb-2">7. Altered (Super Locrian)</h4>
              <p className="text-sm text-slate-400 mb-4">Degree and Notes: From the 7th degree | Notes: B-C-D-Eb-F-G-A</p>
              <div className="bg-slate-900/80 p-4 rounded-lg mb-4 font-mono text-cyan-400 text-center text-sm tracking-widest">
                R - 2m - 3m - 4dim - 5dim - 6m - 7m
              </div>
              <p className="text-slate-300 text-sm mb-6"><strong className="text-orange-400">Use:</strong> B7alt. The king of tension in jazz. All degrees altered.</p>
            </div>
            <a href="#action:scale:B:Alterado" onClick={handleClick} className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md">View and Listen to Scale</a>
          </div>

        </div>
      </div>

      {/* Sections 5, 6 and 7: Applications and Uses 1 and 2 */}
      <div className="mb-12">
        {/* Section 5: The most important applications */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">5. The most important applications</h3>
          <p className="text-slate-300 mb-4">Although the melodic minor scale generates seven modes, it is not necessary to memorize them all immediately. In practice, there are four main uses:</p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">1.</span> Over minor chords with a major seventh or sixth.</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">2.</span> Over dominant 7(#11) chords.</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">3.</span> Over altered dominant chords.</li>
              <li className="flex items-center gap-3"><span className="text-orange-400 text-xl">4.</span> Over m7(b5) chords with a natural 9.</li>
            </ul>
          </div>
          <p className="text-slate-400 text-sm mt-4 italic">These four uses appear constantly in jazz, fusion, modern composition, and arrangements.</p>
        </div>

        {/* Section 6: Use 1 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-indigo-500 shadow-xl mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">6. Use 1: Melodic minor over m(maj7) and m6 chords</h3>
          <p className="text-slate-300 mb-6">When a minor chord with a major seventh appears, the most direct scale is the melodic minor from the same root.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-indigo-400 font-bold mb-3">Base Structure</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Chord:</span> <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm(maj7)</a></li>
                <li><span className="text-slate-500">Chord notes:</span> C – Eb – G – B</li>
                <li><span className="text-slate-500">Scale:</span> <a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">C Melodic Minor</a></li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-indigo-400 font-bold mb-3">Available Tensions</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tension 9</span><span className="text-white font-bold">D</span></div>
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tension 11</span><span className="text-white font-bold">F</span></div>
                <div className="bg-slate-800 p-2 rounded"><span className="text-slate-400 block text-xs">Tension 13</span><span className="text-white font-bold">A</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Application in Progression:</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a>
              </div>
            </div>
            <a href="#action:progression:Cm(maj7),Fm7,G7,Cm(maj7)" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Listen to Progression
            </a>
          </div>
          <p className="text-slate-300 text-sm mt-4">
            The note <strong className="text-white">B</strong> is key because it defines the color. This sound appears often in minor standards and jazz ballads (e.g., "Solar").
          </p>
        </div>

        {/* Section 7: Use 2 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-cyan-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">7. Use 2: Lydian dominant over 7(#11) chords</h3>
          <p className="text-slate-300 mb-6">The fourth mode of the melodic minor scale is called <strong className="text-cyan-400">Lydian b7</strong> (or Lydian Dominant). It is used over dominant chords with a #11.</p>
          
          <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
            <ul className="text-slate-300 space-y-2 font-mono text-sm">
              <li><span className="text-slate-500">Scale (from the 4th degree of C Melodic Minor):</span> <a href="#action:scale:F:Lidio b7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F Lydian Dominant (F-G-A-B-C-D-Eb)</a></li>
              <li><span className="text-slate-500">Chord:</span> <a href="#action:chord:F7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F7(#11)</a></li>
              <li><span className="text-slate-500">Characteristic tension:</span> <strong className="text-cyan-400 text-lg">B = #11</strong></li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Modern Dominant Color (Non-resolving):</p>
              <div className="font-mono text-lg mb-4">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a> - <a href="#action:chord:F7#11" onClick={handleClick} className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">F7(#11)</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
              </div>
              <a href="#action:progression:Cmaj7,F7#11,Cmaj7" onClick={handleClick} className="inline-block text-xs bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Listen to Progression
              </a>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Use in Tritone Substitution (SubV7):</p>
              <div className="font-mono text-lg mb-1">
                <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7</a> - <a href="#action:chord:Db7#11" onClick={handleClick} className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Db7(#11)</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
              </div>
              <p className="text-xs text-slate-500 font-mono">II - SubV7 - I</p>
              <a href="#action:progression:Dm7,Db7#11,Cmaj7" onClick={handleClick} className="inline-block text-xs bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors font-bold">
                ▶ Listen to SubV7
              </a>
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-4 italic">
            Note: The <strong className="text-white">Db7(#11)</strong> uses the Db Lydian Dominant scale (derived from Ab melodic minor). This sophisticated color is classic in themes like "Take the A Train".
          </p>
        </div>

        {/* Section 8: Use 3 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-yellow-500 shadow-xl mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">8. Use 3: Mixolydian b13 over dominants resolving to minor</h3>
          <p className="text-slate-300 mb-6">The fifth mode of the melodic minor scale is called <strong className="text-yellow-400">Mixolydian b13</strong>. It is the scale par excellence for dominant chords that resolve to a minor tonic.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-yellow-400 font-bold mb-3">Base Structure</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Scale (5th degree of C Melodic Minor):</span> <a href="#action:scale:G:Mixolidio b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ G Mixolydian b13 (G-A-B-C-D-Eb-F)</a></li>
                <li><span className="text-slate-500">Chord:</span> <a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7(b13)</a></li>
                <li><span className="text-slate-500">Chord notes:</span> G – B – D – F</li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 flex flex-col justify-center">
              <h4 className="text-yellow-400 font-bold mb-3">Characteristic Tension</h4>
              <div className="bg-slate-800 p-4 rounded-lg text-center border border-slate-700">
                <span className="text-slate-400 block text-sm mb-1">b13 (Minor thirteenth)</span>
                <span className="text-yellow-400 text-3xl font-bold">Eb</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">The Eb anticipates the color of the minor chord (Cm) it will resolve to.</p>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Classic minor progression (IIø - V7 - Im):</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Dm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7(b5)</a> - <a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">G7(b13)</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cm(maj7)</a>
              </div>
            </div>
            <a href="#action:progression:Dm7b5,G7b13,Cm(maj7)" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Listen to Progression
            </a>
          </div>
          <p className="text-slate-300 text-sm italic">
            Application: In standards like "Autumn Leaves", over the cadence to the relative minor (e.g., Bm7(b5) - <strong className="text-white">E7</strong> - Am), that E7 cries out for a Mixolydian b13 or altered color.
          </p>
        </div>

        {/* Section 9: Use 4 */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-emerald-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">9. Use 4: Locrian natural 2 over m7(b5) chords</h3>
          <p className="text-slate-300 mb-6">The sixth mode of the melodic minor scale is the <strong className="text-emerald-400">Locrian natural 2</strong> (or Locrian #2). It is the harmonic salvation for half-diminished chords.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-emerald-400 font-bold mb-3">Base Structure</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Scale (6th degree of C Melodic Minor):</span> <a href="#action:scale:A:Locrio natural 2" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ A Locrian natural 2 (A-B-C-D-Eb-F-G)</a></li>
                <li><span className="text-slate-500">Chord:</span> <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)</a></li>
                <li><span className="text-slate-500">Chord notes:</span> A – C – Eb – G</li>
              </ul>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 flex flex-col justify-center">
              <h4 className="text-emerald-400 font-bold mb-3">The Secret: Tension 9</h4>
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                <span className="text-slate-400 block text-sm mb-2">Unlike the normal Locrian (which uses b9), here we use:</span>
                <span className="text-emerald-400 text-2xl font-bold tracking-widest">B (Natural 9)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-2">Progression (IIø - V7alt - Im7):</p>
              <div className="font-mono text-lg md:text-xl">
                <a href="#action:chord:Am7(b5)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Am7(b5)</a> - <a href="#action:chord:D7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">D7(#9)</a> - <a href="#action:chord:Gm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Gm7</a>
              </div>
            </div>
            <a href="#action:progression:Am7(b5),D7(#9),Gm7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap">
              ▶ Listen to Progression
            </a>
          </div>
          <p className="text-slate-300 text-sm mt-4 italic">
            By using the chord <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)(9)</a>, the natural 9 provides a much more modern, bright, and open sound to the half-diminished chord.
          </p>
        </div>

        {/* Section 10: Use 5 (Altered Scale) */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border-t-4 border-red-500 shadow-xl mb-6">
          <h3 className="text-2xl font-bold text-white mb-6">10. Use 5: Altered scale over altered dominants</h3>
          <p className="text-slate-300 mb-6">The seventh mode of the melodic minor scale is the <strong className="text-red-400">Altered Scale</strong> (or Super Locrian). It is one of the most important modes in modern jazz because it contains <em className="text-white">almost all possible altered tensions</em> (b9, #9, b5, #5, b13).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
              <h4 className="text-red-400 font-bold mb-3">Base Structure</h4>
              <ul className="text-slate-300 space-y-2 font-mono text-sm">
                <li><span className="text-slate-500">Scale (7th degree of C Melodic Minor):</span> <a href="#action:scale:B:Alterado" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold block mt-1">▶ B Altered (B-C-D-Eb-F-G-A)</a></li>
                <li><span className="text-slate-500">Chord:</span> <a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></li>
              </ul>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50">
               <h4 className="text-red-400 font-bold mb-3">Enharmonic Magic</h4>
               <p className="text-xs text-slate-400 mb-3">The traditional B7 chord has D# and F#, but in the altered scale we think of them as tensions over B:</p>
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

          <div className="bg-gradient-to-r from-red-900/20 to-slate-900/80 p-6 rounded-xl border border-red-500/30 mb-8">
             <h4 className="text-xl font-bold text-white mb-2">🔥 Golden Rule (The Mental Shortcut)</h4>
             <p className="text-slate-300 mb-4">To play an altered scale over a dominant, simply use the <strong className="text-red-400">melodic minor scale located A HALF STEP ABOVE</strong> the chord.</p>

             <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                   <tr>
                     <th className="p-4 font-bold">Dominant Chord</th>
                     <th className="p-4 font-bold">Altered Scale</th>
                     <th className="p-4 font-bold text-red-400">Original Melodic Minor (Shortcut)</th>
                   </tr>
                 </thead>
                 <tbody className="text-slate-400 font-mono">
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7alt</a></td>
                     <td className="p-4">G altered</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:Ab:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">Ab melodic minor</a></td>
                   </tr>
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:C7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">C7alt</a></td>
                     <td className="p-4">C altered</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:Db:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">Db melodic minor</a></td>
                   </tr>
                   <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></td>
                     <td className="p-4">B altered</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">C melodic minor</a></td>
                   </tr>
                   <tr className="hover:bg-slate-800/30 transition-colors">
                     <td className="p-4 text-white"><a href="#action:chord:E7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">E7alt</a></td>
                     <td className="p-4">E altered</td>
                     <td className="p-4 font-bold text-red-300"><a href="#action:scale:F:Menor Melódica" onClick={handleClick} className="hover:text-red-200 transition-colors">F melodic minor</a></td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <div className="space-y-4">
              <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Classic Minor Resolution:</p>
                  <div className="font-mono text-lg md:text-xl">
                    <a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">B7alt</a> - <a href="#action:chord:Em7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Em7</a>
                  </div>
                </div>
                <a href="#action:progression:B7(#9),Em7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap shadow-md">
                  ▶ Listen to Resolution
                </a>
              </div>

              <div className="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Maximum Tension in Major (IIm7 - V7alt - Imaj7):</p>
                  <div className="font-mono text-lg md:text-xl mb-1">
                    <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Dm7</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7alt</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">Cmaj7</a>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">To improvise over the G7alt we think of <strong className="text-red-400">Ab Melodic Minor</strong>.</p>
                </div>
                <a href="#action:progression:Dm7,G7(#9),Cmaj7" onClick={handleClick} className="inline-block text-sm bg-orange-500/20 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-lg hover:bg-orange-500/30 transition-colors font-bold whitespace-nowrap shadow-md">
                  ▶ Listen to Progression
                </a>
              </div>
          </div>
        </div>
      {/* Sección 11 and others */}
      <div className="mb-12">

        {/* Section 11: Quick reference table */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">11. Quick reference table</h3>
          <p className="text-slate-300 mb-6">This table is your "mental shortcut" to quickly choose which melodic minor scale to use (based on C Melodic Minor) according to the type of chord you find in a score.</p>
          
          <div className="overflow-x-auto bg-slate-900 rounded-lg border border-slate-700 shadow-inner mb-8">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                <tr>
                  <th className="p-4 font-bold">Chord type</th>
                  <th className="p-4 font-bold">Recommended scale</th>
                  <th className="p-4 font-bold text-indigo-400">Quick rule (Relationship with root)</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 font-mono">
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm(maj7)</a> / <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Cm6</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C melodic minor</a></td>
                  <td className="p-4 font-bold text-indigo-300">Same root as chord</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:F7(#11)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">F7(#11)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C melodic minor</a></td>
                  <td className="p-4 font-bold text-indigo-300">Melodic minor a perfect 5th above</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:G7b13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">G7(b13)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C melodic minor</a></td>
                  <td className="p-4 font-bold text-indigo-300">Melodic minor a perfect 4th above</td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">Am7(b5)(9)</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C melodic minor</a></td>
                  <td className="p-4 font-bold text-indigo-300">Melodic minor a minor 3rd above</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-white"><a href="#action:chord:B7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors font-bold">B7alt</a></td>
                  <td className="p-4"><a href="#action:scale:C:Menor Melódica" onClick={handleClick} className="text-orange-400 hover:text-orange-300 transition-colors">C melodic minor</a></td>
                  <td className="p-4 font-bold text-indigo-300">Melodic minor a half step above</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h4 className="font-bold text-white mb-3">More Practical Examples:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm font-mono">
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:Dm(maj7)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">Dm(maj7)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Melodic Minor</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:G7(#11)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">G7(#11)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Melodic Minor</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:A7b13" onClick={handleClick} className="text-orange-400 font-bold block mb-1">A7(b13)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Melodic Minor</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50">
                <a href="#action:chord:Bm7b5" onClick={handleClick} className="text-orange-400 font-bold block mb-1">Bm7(b5)(9)</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Melodic Minor</a>
             </div>
             <div className="bg-slate-900/80 p-3 rounded border border-slate-700/50 col-span-2 md:col-span-1">
                <a href="#action:chord:C#7(#9)" onClick={handleClick} className="text-orange-400 font-bold block mb-1">C#7alt</a>
                <a href="#action:scale:D:Menor Melódica" onClick={handleClick} className="text-slate-400 text-xs hover:text-orange-300">D Melodic Minor</a>
             </div>
          </div>
        </div>

        {/* Section 12: Applications in musical progressions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">12. Applications in musical progressions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-indigo-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 1: Modern minor tonic</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm(maj7)</a> - <a href="#action:chord:Cm6" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm6</a> - <a href="#action:chord:Fm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Fm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">G7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-indigo-400">Use:</strong> Over tonic chords we use C melodic minor. Mysterious and cinematic color.</p>
              <a href="#action:progression:Cm(maj7),Cm6,Fm7,G7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Listen</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-emerald-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 2: II - V - I minor</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Dm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7(b5)</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">G7alt</a> - <a href="#action:chord:Cm(maj7)" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cm(maj7)</a>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 mb-2 font-mono">
                <li><strong className="text-emerald-400">Dm7(b5):</strong> F melodic minor (Locrian #2)</li>
                <li><strong className="text-emerald-400">G7alt:</strong> Ab melodic minor (Altered)</li>
                <li><strong className="text-emerald-400">Cm(maj7):</strong> C melodic minor</li>
              </ul>
              <p className="text-xs text-slate-400">Classic in tracks like "Blue Bossa".</p>
              <a href="#action:progression:Dm7b5,G7(#9),Cm(maj7)" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Listen</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-red-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 3: Altered dominant to major</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7</a> - <a href="#action:chord:G7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">G7alt</a> - <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cmaj7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-red-400">Use:</strong> Over G7alt we use Ab melodic minor. Generates maximum tension before resolving brightly to the major.</p>
              <a href="#action:progression:Dm7,G7(#9),Cmaj7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Listen</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-cyan-500 shadow-md">
              <h4 className="font-bold text-white mb-2">App 4: Dominant #11</h4>
              <div className="font-mono text-lg mb-3">
                <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Cmaj7</a> - <a href="#action:chord:D7(#11)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">D7(#11)</a> - <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Dm7</a> - <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">G7</a>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-cyan-400">Use:</strong> Over D7(#11) we use A melodic minor. Bright and modern color, not as dark as the altered.</p>
              <a href="#action:progression:Cmaj7,D7(#11),Dm7,G7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Listen</a>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-amber-500 shadow-md lg:col-span-2 md:w-2/3 lg:mx-auto">
              <h4 className="font-bold text-white mb-2">App 5: Modern half-diminished</h4>
              <div className="font-mono text-lg mb-3 text-center">
                <a href="#action:chord:Am7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">Am7(b5)</a> - <a href="#action:chord:D7(#9)" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold">D7alt</a> - <a href="#action:chord:Gm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300">Gm7</a>
              </div>
              <p className="text-sm text-slate-300 text-center"><strong className="text-amber-400">Use:</strong> Over Am7(b5) we use C melodic minor to obtain the <strong className="text-white">natural 9 (B)</strong>, giving it a more open sound than the traditional locrian.</p>
              <div className="text-center">
                <a href="#action:progression:Am7b5,D7(#9),Gm7" onClick={handleClick} className="inline-block mt-4 text-xs bg-orange-500/20 text-orange-400 px-4 py-2 rounded font-bold">▶ Listen</a>
              </div>
            </div>

          </div>
        </div>

        {/* Section 13: Melodic application */}
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">13. Melodic application</h3>
          <p className="text-slate-300 mb-6">The melodic minor is used to create lines (solos) with tension and resolution. Let's look at an example over <strong className="font-mono text-white">Dm7 - G7alt - Cmaj7</strong>:</p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
              <div className="text-indigo-400 font-bold font-mono mb-2">Over Dm7:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">F - E - D</div>
              <div className="text-xs text-slate-500">Diatonic notes</div>
            </div>
            <div className="flex-1 bg-red-900/20 p-4 rounded-lg border border-red-500/30">
              <div className="text-red-400 font-bold font-mono mb-2">Over G7alt:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">Ab - Bb - B - Eb</div>
              <div className="text-xs text-slate-400">b9, #9, 3rd, b13 (Ab Melodic Minor)</div>
            </div>
            <div className="flex-1 bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
              <div className="text-orange-400 font-bold font-mono mb-2">Over Cmaj7:</div>
              <div className="text-white text-xl font-mono tracking-widest mb-1">E - D - C</div>
              <div className="text-xs text-slate-500">Clear resolution to tonic</div>
            </div>
          </div>
        </div>

        {/* Section 14: Tips */}
        <div className="mb-12 border-l-4 border-emerald-500 pl-6 py-2">
          <h3 className="text-xl font-bold text-white mb-4">14. Tips for studying melodic minor</h3>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            <li>First memorize the scale in one key.</li>
            <li>Learn its derived chords.</li>
            <li>Study its 4 main uses: <strong className="text-orange-400">m(maj7), 7(#11), 7alt, m7(b5)(9)</strong>.</li>
            <li>Don't try to use all modes at the same time. Practice with short progressions.</li>
            <li>Listen to how the tensions resolve.</li>
            <li>In improvisation, first use simple phrases of 3 or 4 notes.</li>
          </ul>
        </div>

        {/* Section 15: Practical exercises */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">15. Practical exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Exercise 1</h4>
              <p className="text-slate-300 text-sm mb-2">Build the C melodic minor scale and form the I degree chord (Cm(maj7)).</p>
              <p className="text-xs text-slate-400 italic">Practice: Play a melody using the note B as the main color.</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Exercise 2</h4>
              <p className="text-slate-300 text-sm mb-2">Write the scales for Dm7(b5) - G7alt - Cm(maj7).</p>
              <ul className="text-xs text-slate-400 font-mono space-y-1">
                <li>Dm7(b5) = F melodic minor</li>
                <li>G7alt = Ab melodic minor</li>
                <li>Cm(maj7) = C melodic minor</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Exercise 3</h4>
              <p className="text-slate-300 text-sm mb-2">Identify the melodic minor scale to improvise over altered dominants:</p>
              <ul className="text-xs text-slate-400 font-mono space-y-1">
                <li>G7alt ➔ Ab melodic minor</li>
                <li>C7alt ➔ Db melodic minor</li>
                <li>F7alt ➔ Gb melodic minor</li>
                <li>B7alt ➔ C melodic minor</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-700 border-dashed">
              <h4 className="text-orange-400 font-bold mb-2">Exercise 4</h4>
              <p className="text-slate-300 text-sm mb-2">Create a progression using a #11 dominant.</p>
              <p className="text-xs text-slate-400 font-mono mb-2">Ej: Cmaj7 - D7(#11) - Dm7 - G7</p>
              <p className="text-xs text-slate-400 italic">Practice: Improvise over D7(#11) using A melodic minor.</p>
            </div>
          </div>
        </div>

        {/* FINAL CONCLUSION */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900 p-8 rounded-2xl border-t-4 border-indigo-400 shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Conclusion</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            The melodic minor scale is a fundamental tool for modern harmony. Its sound combines minor color with a special openness produced by the major sixth and seventh.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            In practice, it is primarily used to enrich minor progressions, altered dominants, #11 dominants, and half-diminished chords.
          </p>
          <div className="inline-block bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-full font-bold border border-indigo-500/30">
            Mastering this scale allows you to create more expressive melodic lines, more sophisticated harmonies, and improvisation with greater tension, color, and resolution.
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Capitulo14;