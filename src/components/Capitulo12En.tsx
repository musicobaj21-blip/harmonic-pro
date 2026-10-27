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
        <h2 className="text-2xl font-bold text-white mb-6">Chapter 12: Tensions</h2>
      <p className="text-slate-300 mb-6">
        Tensions enrich chords by adding color without altering their harmonic function (for example, transforming <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> into <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a>).
      </p>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">1. What are tensions?</h3>
      <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
        <p className="text-slate-300 mb-4">
          A tension is a note added to the base structure (1-3-5-7) of a chord through third-interval superposition. The available upper tensions are the 9th, 11th, and 13th.
        </p>
        <p className="text-slate-300 mb-4">
          Example in <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a>: <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> (C - E - G - B).
        </p>
        <p className="text-slate-300 mb-4">
          Possible tensions: D (9th), F# (#11), A (13th).
        </p>
        <p className="text-slate-300">
          Results: <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a>, <a href="#action:chord:Cmaj7#11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7(#11)</a>, and <a href="#action:chord:Cmaj13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj13</a>.
        </p>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">2. Tensions in chords</h3>
      <p className="text-slate-300 mb-4">
        Below, we will analyze how these tensions are applied individually.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Tarjeta 1: Novena (9ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-orange-500">
          <h4 className="text-lg font-bold text-orange-400 mb-2">Ninth (9th)</h4>
          <p className="text-slate-300 text-sm mb-4">
            The ninth is equivalent to a major second played in the upper register, providing a smooth brightness without generating strong clashes.
          </p>
          <p className="text-slate-300 text-sm font-mono bg-slate-800 p-2 rounded">
            <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> vs <a href="#action:chord:Cmaj9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj9</a> (adds D)
          </p>
        </div>

        {/* Tarjeta 2: Oncena (11ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-bold text-blue-400 mb-2">Eleventh (11th)</h4>
          <p className="text-slate-300 text-sm mb-4">
            Very common in minor chords: <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm7</a> vs <a href="#action:chord:Dm11" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm11</a> (adds G).
          </p>
          <div className="bg-red-500/10 border border-red-500/30 p-2 rounded">
            <p className="text-xs text-slate-300">
              <span className="text-red-400 font-bold">Important Note (The Clash):</span> In major chords (like <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a>), the natural eleventh (F) clashes directly with the major third (E), creating an unwanted dissonance. Because of this, the use of the augmented eleventh (#11, F#) is usually justified.
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Trecena (13ª) */}
        <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500">
          <h4 className="text-lg font-bold text-purple-400 mb-2">Thirteenth (13th)</h4>
          <p className="text-slate-300 text-sm mb-4">
            The thirteenth is equivalent to a sixth played in the upper register. It is the highest note conventionally added.
          </p>
          <p className="text-slate-300 text-sm font-mono bg-slate-800 p-2 rounded">
            Contrast in dominants: <br/> <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7</a> vs <a href="#action:chord:G13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G13</a> (adds E)
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2 mt-8">3. Available tensions based on chord type</h3>
      <p className="text-slate-300 mb-4">
        Not all tensions work the same in every chord. The availability of a tension depends directly on how it interacts with the base chord notes (1, 3, 5, 7).
      </p>

      <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg my-4 text-orange-200">
        A practical rule: A tension usually works well when it does not generate a minor second distance (or b9) against an important structural note of the chord.
      </div>
      
      <p className="text-slate-300 mb-6">
        For example, in a Cmaj7 chord, if we add a natural eleventh (F natural), this note will form a minor second interval (a semitone) above the major third (E). This dissonant clash soils the bright quality of the major chord, which is why the natural eleventh is considered an "avoid note" on Maj7 chords.
      </p>

      <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2 mt-8">4. Tensions in Maj7 chords</h3>
      <p className="text-slate-300 mb-4">
        Example: <span className="font-mono text-orange-400">Cmaj7 (C – E – G – B)</span>
      </p>

      <div className="overflow-x-auto mt-4 mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in Cmaj7</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">9</td>
              <td className="p-3 text-slate-300 font-mono">D</td>
              <td className="p-3 text-slate-400">Very stable and common</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">#11</td>
              <td className="p-3 text-slate-300 font-mono">F#</td>
              <td className="p-3 text-slate-400">Lydian, modern, and open sonority</td>
            </tr>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-emerald-400 font-bold">13</td>
              <td className="p-3 text-slate-300 font-mono">A</td>
              <td className="p-3 text-slate-400">Stable and sophisticated color</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 className="text-lg font-bold text-red-400 mb-2 mt-6">Tension to typically avoid</h4>
      <div className="overflow-x-auto mt-4 mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in Cmaj7</th>
              <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/50">
              <td className="p-3 text-red-400 font-bold">11</td>
              <td className="p-3 text-slate-300 font-mono">F</td>
              <td className="p-3 text-slate-400"><span className="text-red-400">Clashes with the major third E</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
        <h4 className="text-orange-400 font-bold mb-4">Interactive Examples:</h4>
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
        <span className="font-bold text-emerald-400">Lydian Mode Conclusion:</span> By adding the <span className="italic text-orange-300 font-bold">#11</span> to a Maj7 chord, we are automatically evoking the sound of the <span className="font-bold text-white">Lydian Mode</span>. This tension resolves the conflict of the natural eleventh clash and is fundamental in <span className="text-orange-300">jazz, fusion, and cinematic music</span> to create floating and mysterious major chords.
      </p>
      </div>

      {/* Sección 5 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">5. Tensions in m7 chords</h3>
        <p className="text-slate-300 mb-4">
          Example: <span className="font-mono text-orange-400">Dm7 (D – F – A – C)</span>
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in Dm7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Very stable</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">G</td>
                <td className="p-3 text-slate-400">Very natural in minor chords (no clash with the 3rd)</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">13</td>
                <td className="p-3 text-slate-300 font-mono">B</td>
                <td className="p-3 text-slate-400">Provides a characteristic Dorian color</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 text-blue-200">
          Watch the modal context! If the chord comes from the Dorian Mode, the 13 is natural (e.g., <a href="#action:chord:Dm13" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm13</a>). If it comes from the Aeolian Mode, we use b13 (e.g., Am7 with b13). In modern music, the m13 sound is almost always associated with the Dorian color.
        </div>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
          <h4 className="text-orange-400 font-bold mb-4">Interactive Examples:</h4>
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
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">6. Tensions in dominant 7 chords</h3>
        <p className="text-slate-300 mb-4">
          Example: <span className="font-mono text-orange-400">G7 (G – B – D – F)</span>
        </p>
        <p className="text-slate-300 mb-6">
          Dominant chords are the most flexible of the entire harmonic system. By containing a tritone in their base structure, they accept almost any tension (natural or altered) to increase instability before resolving.
        </p>

        <h4 className="text-lg font-bold text-orange-400 mb-2 mt-6">A. Natural Tensions</h4>
        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in G7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">A</td>
                <td className="p-3 text-slate-400">Stable dominant</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">13</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Open and modern sonority</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">#11</td>
                <td className="p-3 text-slate-300 font-mono">C#</td>
                <td className="p-3 text-slate-400">Lydian dominant color (common in tritone substitutes)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-red-400 mb-2 mt-6">B. Altered Tensions</h4>
        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in G7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">b9</td>
                <td className="p-3 text-slate-300 font-mono">Ab</td>
                <td className="p-3 text-slate-400">High tension, typical of dominants resolving to minor chords</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">#9</td>
                <td className="p-3 text-slate-300 font-mono">A# / Bb</td>
                <td className="p-3 text-slate-400">Punchy blues/jazz sonority</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-red-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">Eb</td>
                <td className="p-3 text-slate-400">Dark altered color, used in traditional jazz</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg my-4 text-red-200">
          The natural 11 is avoided in dominants because it clashes with the major 3rd (B). The only exception is the suspended chord <a href="#action:chord:G7sus4" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7sus4</a> (G – C – D – F), where the 11 temporarily replaces the third.
        </div>

        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-6">
          <h4 className="text-orange-400 font-bold mb-4">Interactive Examples:</h4>
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
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">7. Tensions in m7(b5) chords</h3>
        <p className="text-slate-300 mb-4">
          Example: <a href="#action:chord:Bm7b5" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Bm7(b5)</a> <span className="font-mono text-orange-400">(B – D – F – A)</span>
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in Bm7(b5)</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">E</td>
                <td className="p-3 text-slate-400">Very used</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">G</td>
                <td className="p-3 text-slate-400">Natural color of the Locrian mode</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">C#</td>
                <td className="p-3 text-slate-400">More modern sound, associated with Locrian #2</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg my-4 text-yellow-200">
          <p className="mb-2"><span className="font-bold">Locrian vs Locrian #2:</span> In the natural Locrian mode, the b9 (C natural) generates a very strong dissonance with the root (B), so it is usually avoided.</p>
          <p>In jazz, the solution is to use the Locrian #2 scale, which allows incorporating a natural 9 (C#), creating a much more open and manageable sound.</p>
        </div>


      </div>

      {/* Sección 8 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">8. Tensions in diminished chords</h3>
        
        <p className="text-slate-300 mb-4">
          It is vital to differentiate the diminished triad from the chord with a seventh:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-6">
          <li>
            <span className="font-bold text-white">Triad:</span> <a href="#action:chord:Cdim" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cdim</a>: <span className="font-mono text-sm">C – Eb – Gb</span>
          </li>
          <li>
            <span className="font-bold text-white">Seventh:</span> <a href="#action:chord:Cdim7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cdim7</a>: <span className="font-mono text-sm">C – Eb – Gb – Bbb</span> (Bbb is equivalent to A in real sound)
          </li>
        </ul>

        <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg my-4 text-purple-200">
          <p className="font-bold mb-2">Symmetry (Geometric Magic):</p>
          <p>
            Diminished chords are totally symmetrical, built by minor third intervals. This means that these 4 chords contain exactly the same notes: <br/>
            <a href="#action:chord:Cdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Cdim7</a>, <a href="#action:chord:Ebdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Ebdim7</a>, <a href="#action:chord:Gbdim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Gbdim7</a> and <a href="#action:chord:Adim7" onClick={handleClick} className="text-purple-300 hover:text-purple-100 font-bold underline cursor-pointer transition-colors">Adim7</a>.
          </p>
        </div>

        <p className="text-slate-300 mt-6 mb-4">
          Tensions on the diminished chord come from the <span className="font-bold text-emerald-400">Whole-Half Diminished Scale</span>.
        </p>

        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Tension</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Note in Cdim7</th>
                <th className="p-3 text-slate-300 font-bold border-b border-slate-700">Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">9</td>
                <td className="p-3 text-slate-300 font-mono">D</td>
                <td className="p-3 text-slate-400">Available tension</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">11</td>
                <td className="p-3 text-slate-300 font-mono">F</td>
                <td className="p-3 text-slate-400">Available tension</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">b13</td>
                <td className="p-3 text-slate-300 font-mono">Ab</td>
                <td className="p-3 text-slate-400">Diminished color</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="p-3 text-emerald-400 font-bold">Major 7</td>
                <td className="p-3 text-slate-300 font-mono">B</td>
                <td className="p-3 text-slate-400">Passing note or additional color</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-slate-300">
          <span className="font-bold text-emerald-400">Conclusion:</span> In practice, diminished tensions are usually used more in melody, improvisation, and chromatic links than as complete long-duration chords.
        </p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        {/* Sección 9 */}
        <h3 className="text-2xl font-bold text-white mb-4">9. General summary of tensions by chord type</h3>
        <div className="overflow-x-auto mt-4 mb-8">
          <table className="w-full text-left border-collapse font-sans">
            <thead className="bg-slate-900/80 text-orange-400">
              <tr>
                <th className="p-3 font-bold border-b border-slate-700">Chord Type</th>
                <th className="p-3 font-bold border-b border-slate-700">Recommended Tensions</th>
                <th className="p-3 font-bold border-b border-slate-700">Tensions to watch or avoid</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">Maj7</td>
                <td className="p-3">9, #11, 13</td>
                <td className="p-3"><span className="text-red-400">natural 11</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">m7</td>
                <td className="p-3">9, 11, 13</td>
                <td className="p-3"><span className="text-red-400">b9</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">7 (Dominant)</td>
                <td className="p-3">9, 13, b9, #9, #11, b13</td>
                <td className="p-3"><span className="text-red-400">natural 11 (except 7sus4)</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">m7(b5)</td>
                <td className="p-3">11, b13, natural 9</td>
                <td className="p-3"><span className="text-yellow-400">b9 (depending on context)</span></td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="p-3 font-bold">dim7</td>
                <td className="p-3">9, 11, b13</td>
                <td className="p-3">Depends on melodic use</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 10 */}
        <h3 className="text-2xl font-bold text-white mb-4">10. Tensions in melody and improvisation</h3>
        <p className="text-slate-300 mb-6">
          In improvisation and melody composition, stable notes (of the chord) provide rest, while tensions provide color and movement.
        </p>
        <div className="bg-slate-900/60 p-5 rounded-lg border border-slate-700/50 mb-8">
          <p className="text-orange-400 font-bold mb-4">Example over Cmaj7:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4">
            <li>
              <span className="font-bold text-white">Chord notes:</span> C – E – G – B
            </li>
            <li>
              <span className="font-bold text-emerald-400">Tensions:</span> D – F# – A
            </li>
          </ul>
          <p className="text-slate-300">
            A melody over <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a> can use D as 9, F# as #11, or A as 13 to generate a more modern sonority.
          </p>
        </div>

        {/* Sección 11 */}
        <h3 className="text-2xl font-bold text-white mb-4">11. Passing notes, neighboring tones, and melodic tensions</h3>
        <p className="text-slate-300 mb-6">
          In melody, a tension can appear in different ways:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-green-500 shadow-md">
            <h4 className="text-lg font-bold text-green-400 mb-2">Passing Note</h4>
            <p className="text-slate-300 mb-4 text-sm">Connects two stable notes.</p>
            <p className="text-slate-400 text-xs mb-1">Example over Cmaj7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">C – D – E</p>
            <p className="text-slate-300 text-sm">The D note works as a pass between C and E, and can also be understood as the 9th of the chord.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-blue-500 shadow-md">
            <h4 className="text-lg font-bold text-blue-400 mb-2">Neighboring Tone</h4>
            <p className="text-slate-300 mb-4 text-sm">Surrounds a main note and returns to it.</p>
            <p className="text-slate-400 text-xs mb-1">Example over Cmaj7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">E – F# – E</p>
            <p className="text-slate-300 text-sm">The F# can function as #11 and generate a Lydian color.</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border-t-4 border-purple-500 shadow-md">
            <h4 className="text-lg font-bold text-purple-400 mb-2">Appoggiatura</h4>
            <p className="text-slate-300 mb-4 text-sm">Tense note that lands on a strong beat and then resolves.</p>
            <p className="text-slate-400 text-xs mb-1">Example over G7:</p>
            <p className="font-mono text-orange-400 mb-3 bg-slate-950/50 p-2 rounded inline-block">Ab – G</p>
            <p className="text-slate-300 text-sm">The Ab note functions as b9 and resolves to the root G.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
        {/* Sección 12 */}
        <h3 className="text-2xl font-bold text-white mb-4">12. Strategies for improvising with tensions</h3>
        <p className="text-slate-300 mb-6">
          Integrating tensions into your vocabulary requires understanding how to handle them rhythmically and melodically. Here we present three key approaches:
        </p>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
          <h4 className="text-lg font-bold text-blue-400 mb-2">Using tensions as color</h4>
          <p className="text-slate-300 text-sm mb-2">Example over <a href="#action:chord:Dm7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Dm7</a>:</p>
          <div className="font-mono text-lg text-blue-400 my-2 bg-slate-950/50 p-2 rounded inline-block">E – F – G – A</div>
          <p className="text-slate-300 text-sm mt-2">The E note functions as 9 and G as 11. They are held briefly to add color without needing immediate resolution, providing an open and floating sonority.</p>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-green-500 mb-4">
          <h4 className="text-lg font-bold text-green-400 mb-2">Resolving tensions into chord notes</h4>
          <p className="text-slate-300 text-sm mb-2">Example over <a href="#action:chord:G7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7</a>:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm">
            <li><span className="font-mono text-green-400 font-bold">Ab – G</span> (b9 resolving to root).</li>
            <li><span className="font-mono text-green-400 font-bold">Bb – B</span> (#9 resolving to major 3rd).</li>
            <li><span className="font-mono text-green-400 font-bold">Eb – D</span> (b13 resolving to fifth).</li>
          </ul>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-red-500 mb-4">
          <h4 className="text-lg font-bold text-red-400 mb-2">Using altered tensions in dominants</h4>
          <p className="text-slate-300 text-sm mb-2">Example: <a href="#action:chord:G7b9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">G7(b9)</a> → <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer transition-colors">Cmaj7</a></p>
          <p className="text-slate-300 text-sm mt-2">The Ab tension of the G7(b9) resolves harmonically toward G or E within the Cmaj7, generating a great sense of harmonic tension followed by a natural melodic release.</p>
        </div>

        {/* Sección 13 */}
        <h3 className="text-2xl font-bold text-white mb-4 mt-8">13. Practical application example</h3>
        
        <div className="flex flex-wrap gap-3 mt-4 mb-6">
          {/* Play Completo */}
          <a href="#action:combined:progression=Dm7,G7,Cmaj7;melody=E4:2,G4:1,E4:1,Eb4:2,G4:1,Eb4:1,D4:4" onClick={handleClick} className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg font-bold hover:bg-orange-500/30 transition-colors shadow-lg shadow-orange-500/5">
            ⚡ Play Full (Chords + Melody)
          </a>
          
          {/* Sólo Armonía */}
          <a href="#action:progression:Dm7,G7,Cmaj7" onClick={handleClick} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-emerald-500/20 transition-colors">
            ▶ Harmony Only
          </a>
          
          {/* Sólo Melodía */}
          <a href="#action:melody:E4:2,G4:1,E4:1,Eb4:2,G4:1,Eb4:1,D4:4" onClick={handleClick} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-bold hover:bg-blue-500/20 transition-colors">
            ▶ Melody Only
          </a>
          
          {/* Stop */}
          <a href="#action:stop" onClick={handleClick} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
            ■ Stop
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Subdominant</h4>
            <a href="#action:chord:Dm7" onClick={handleClick} className="text-2xl text-orange-400 font-bold block mb-2 hover:text-orange-300 transition-colors">Dm7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensions: 9, 11, 13</div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:E4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">E</a>
                <span className="text-xs text-slate-500">Half note (2b)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:G4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">G</a>
                <span className="text-xs text-slate-500">Quarter note (1b)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:E4;inst=sax" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">E</a>
                <span className="text-xs text-slate-500">Quarter note (1b)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Dominant</h4>
            <a href="#action:chord:G7" onClick={handleClick} className="text-2xl text-yellow-400 font-bold block mb-2 hover:text-yellow-300 transition-colors">G7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensions: b9, #9, 13, b13</div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:Eb4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">Eb</a>
                <span className="text-xs text-slate-500">Half note (2b)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:G4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">G</a>
                <span className="text-xs text-slate-500">Quarter note (1b)</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:Eb4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">Eb</a>
                <span className="text-xs text-slate-500">Quarter note (1b)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700 text-center shadow-inner">
            <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">Tonic</h4>
            <a href="#action:chord:Cmaj7" onClick={handleClick} className="text-2xl text-orange-400 font-bold block mb-2 hover:text-orange-300 transition-colors">Cmaj7</a>
            <div className="text-sm text-slate-400 mb-4 pb-2 border-b border-slate-800">Tensions: 9, #11, 13</div>
            <div className="flex flex-col gap-2 mt-2 pt-2 justify-start h-full">
              <div className="flex justify-between items-center px-2">
                <a href="#action:note:D4" onClick={handleClick} className="font-mono text-lg text-white hover:text-blue-400 cursor-pointer font-bold transition-colors">D</a>
                <span className="text-xs text-slate-500">Whole note (4b)</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-300 mt-6 leading-relaxed">
          In this example, the melody comes to life with a 4/4 rhythm: over the Dm7, the note <strong className="text-white">E</strong> (tension 9) is established as a half note on the strong beat and jumps to the <strong className="text-white">G</strong> (tension 11) to return to E, creating a beautiful arpeggio of tensions. Over the G7, we introduce the dark color of <strong className="text-white">Eb</strong> (altered tension b13), which jumps temporarily to the root <strong className="text-white">G</strong> before returning to Eb. Finally, all the harmonic and melodic tension lands gently on the <strong className="text-white">D</strong> (tension 9) of Cmaj7, which rests as a whole note filling the entire measure.
        </p>

        {/* Conclusión */}
        <div className="bg-gradient-to-r from-orange-500/20 to-slate-900 p-6 rounded-xl border-l-4 border-orange-500 mt-8 shadow-md">
          <h3 className="text-xl font-bold text-orange-400 mb-3">Conclusion</h3>
          <p className="text-slate-300 mb-4">
            Understanding tensions is the final step to <span className="font-bold text-white">transform simple chords</span> into rich harmonic textures. It's not simply about adding random notes, but knowing how to choose the <span className="font-bold text-white">colors, passing notes, and appoggiaturas</span> that best complement the modal and harmonic context.
          </p>
          <p className="text-slate-300">
            By mastering 9ths, 11ths, and 13ths, you don't just expand your vocabulary as an accompanist, but achieve a true <span className="font-bold text-white">harmonic depth</span> that will greatly enrich your improvisation and your way of composing and arranging.
          </p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg mt-8">
        <h3 className="text-2xl font-bold text-white mb-4">14. Advanced Practical Application: Autumn Leaves with Tensions and Tritones</h3>
        
        <div className="flex gap-4 mb-4">
          <a href="#action:progression:Am9,D9_D7b9,Gmaj9_Db7#11,Cmaj7#11,F#m7b5_C9,B7b13,Em9,Em11" onClick={handleClick} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center">
             ▶ Play Progression
          </a>
          <a href="#action:stop" onClick={handleClick} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center">
             ⏹ Stop
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6">
          {/* Compás 1 */}
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
            <a href="#action:chord:Am9" onClick={handleClick} className="text-orange-400 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors mb-2">Am9</a>
            <span className="text-xs text-slate-400 leading-tight">[ii9] (In G)</span>
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
            <span className="font-bold text-white">Analysis of Db7(#11):</span> Acts as <span className="font-bold text-pink-300">SubV7/IV</span>. Instead of using a static G7, this chord drops by a semitone towards Cmaj7(#11). The #11 tension (G note) gives it a bright Lydian Dominant sonority.
          </p>
          <p className="text-slate-300">
            <span className="font-bold text-white">Analysis of C9:</span> Acts as <span className="font-bold text-pink-300">SubV7/V</span>. By interpolating just after the half-diminished chord, it generates a descending chromatic bass line towards the main dominant B7(b13).
          </p>
        </div>
      </div>
    </>
  );
};

export default Capitulo12;