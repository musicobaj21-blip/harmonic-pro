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
      <h2 className="text-2xl font-bold text-white mb-6">Chapter 9: Harmonic Minor Scale Modes</h2>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Harmonic Minor Scale Modes</h2>
        <p className="text-slate-300 leading-relaxed">
          The harmonic minor scale gives rise to seven modes, each with a unique and tense character. 
          Below, we explore their structure, usage, and sonority.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        {/* Modo 1 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-2">1. Harmonic Minor (Tonic)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 1st degree | Notes: A-B-C-D-E-F-G#</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3m - 4J - 5J - 6m - 7M
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Classical and jazz, tense/exotic sound.</p>
          </div>
          <div>
            <a href="#action:scale:A:Menor Armónica" onClick={(e) => handleClick(e, "#action:scale:A:Menor Armónica")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 2 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">2. Locrian 6 (Supertonic)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 2nd degree | Notes: B-C-D-E-F-G#-A</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50 flex-wrap">
                T - 2m - 3m - 4J - 5dim - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Dark/tense atmospheres, jazz and metal.</p>
          </div>
          <div>
            <a href="#action:scale:B:Locrio 6" onClick={(e) => handleClick(e, "#action:scale:B:Locrio 6")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 3 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">3. Ionian Augmented (Mediant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 3rd degree | Notes: C-D-E-F-G#-A-B</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3M - 4J - 5aum - 6M - 7M
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Dreamy, contemporary sound.</p>
          </div>
          <div>
            <a href="#action:scale:C:Jónico Aumentado" onClick={(e) => handleClick(e, "#action:scale:C:Jónico Aumentado")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 4 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">4. Dorian #4 (Subdominant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 4th degree | Notes: D-E-F-G#-A-B-C</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2M - 3m - 4aum - 5J - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Harmonic tension, modal passages in jazz/fusion.</p>
          </div>
          <div>
            <a href="#action:scale:D:Dórico #4" onClick={(e) => handleClick(e, "#action:scale:D:Dórico #4")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 5 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-rose-400 mb-2">5. Mixolydian b9 b13 (Dominant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 5th degree | Notes: E-F-G#-A-B-C-D</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2m - 3M - 4J - 5J - 6m - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Main dominant, perfect tension to resolve to the minor chord.</p>
          </div>
          <div>
            <a href="#action:scale:E:Mixolidio b9 b13" onClick={(e) => handleClick(e, "#action:scale:E:Mixolidio b9 b13")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 6 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-amber-400 mb-2">6. Lydian #2 (Submediant)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 6th degree | Notes: F-G#-A-B-C-D-E</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2aum - 3M - 4aum - 5J - 6M - 7m
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> Ethereal, experimental sound.</p>
          </div>
          <div>
            <a href="#action:scale:F:Lidio #2" onClick={(e) => handleClick(e, "#action:scale:F:Lidio #2")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>

        {/* Modo 7 */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-2">7. Superlocrian (Subtonic)</h3>
            <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Degree and Notes:</span> From the 7th degree | Notes: G#-A-B-C-D-E-F</p>
            <div className="mb-4">
              <span className="inline-block bg-slate-900 px-3 py-2 rounded-lg text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50 border border-slate-700/50">
                T - 2m - 3m - 4J - 5dim - 6m - 7bb
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6"><span className="font-semibold text-orange-400">Usage:</span> The most dissonant, extreme tension.</p>
          </div>
          <div>
            <a href="#action:scale:G#:Superlocrio" onClick={(e) => handleClick(e, "#action:scale:G#:Superlocrio")} className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors !no-underline shadow-lg shadow-orange-500/20">
              View and Listen to Scale
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}