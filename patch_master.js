import fs from 'fs';
let code = fs.readFileSync('src/components/MasterFxModal.tsx', 'utf-8');

// Replace runAutoMastering import
code = code.replace(/runAutoMastering/g, 'runGenreMastering');

// Find and replace the handleAutoMaster function
const handleAutoMasterRegex = /const handleAutoMaster = async \(\) => \{[\s\S]*?^\s*\};\n/m;

const newHandlers = `
  const [activeGenre, setActiveGenre] = React.useState<string | null>(null);

  const genres = [
    { id: 'urbano', name: '🔥 Urbano / Trap' },
    { id: 'electronica', name: '🎛️ Electrónica' },
    { id: 'jazz', name: '🎷 Jazz / Acústico' },
    { id: 'pop', name: '✨ Pop Radio' },
    { id: 'rock', name: '🎸 Rock / Indie' },
    { id: 'metal', name: '⚡ Metal' },
    { id: 'soul', name: '🎙️ Soul / R&B' },
    { id: 'tropical', name: '🌴 Tropical / Cumbia' }
  ];

  const handleGenreMaster = async (genreId: string, genreName: string) => {
    setIsMastering(true);
    setToastMessage(null);
    setActiveGenre(genreId);
    
    const newMasterFx = await runGenreMastering(genreId, fx);
    
    onUpdateMasterFx(newMasterFx);
    setIsMastering(false);
    setToastMessage(\`⚡ Mezcla masterizada con curva de ecualización y limitador para \${genreName}\`);
    setTimeout(() => setToastMessage(null), 4000);
  };
`;
code = code.replace(/const handleAutoMaster = async \(\) => \{[\s\S]*?setIsMastering\(false\);\n.*?setTimeout\(\(\) => setToastMessage\(null\), 3000\);\n    \}\n  \};\n/, newHandlers);


// Remove the button from the header
const buttonRegex = /<button[\s\S]*?onClick=\{handleAutoMaster\}[\s\S]*?<\/button>/;
code = code.replace(buttonRegex, '');

// Insert the new section just before {/* Visualizer Canvas */}
const newSection = `
            {/* ✨ Asistente de Masterización por Estilo */}
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-5 mb-2 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-2">
                  ✨ Asistente de Masterización por Estilo
                </h3>
                {toastMessage && (
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] font-bold rounded-full animate-fade-in">
                    {toastMessage}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {genres.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleGenreMaster(g.id, g.name)}
                    disabled={isMastering}
                    className={\`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 \${
                      activeGenre === g.id
                        ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-[#111] border border-slate-800 text-slate-400 hover:border-purple-500/50 hover:bg-purple-900/20 hover:text-slate-200'
                    }\`}
                  >
                    {isMastering && activeGenre === g.id ? (
                       <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    ) : null}
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualizer Canvas */}
`;

code = code.replace(/\{\/\* Visualizer Canvas \*\/\}/, newSection);

// Remove the old toastMessage div from the header since we moved it
const toastRegex = /\{toastMessage && \([\s\S]*?\{toastMessage\}[\s\S]*?<\/div>\n              \)\}/;
code = code.replace(toastRegex, '');

fs.writeFileSync('src/components/MasterFxModal.tsx', code);
console.log('Patched MasterFxModal.tsx');
