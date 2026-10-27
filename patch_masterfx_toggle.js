import fs from 'fs';
let code = fs.readFileSync('src/components/MasterFxModal.tsx', 'utf-8');

const oldHandle = `  const handleGenreMaster = async (genreId: string, genreName: string) => {
    setIsMastering(true);
    setToastMessage(null);
    setActiveGenre(genreId);
    
    // @ts-ignore
    const newMasterFx = await runGenreMastering(genreId, fx);
    
    onUpdateMasterFx(newMasterFx);
    setIsMastering(false);
    setToastMessage(\`¡Mezcla optimizada para \${genreName}!\`);
    setTimeout(() => setToastMessage(null), 3000);
  };`;

const newHandle = `  const handleGenreMaster = async (genreId: string, genreName: string) => {
    if (activeGenre === genreId) {
      setActiveGenre(null);
      // Disable effects
      onUpdateMasterFx({
        ...fx,
        eq: { ...fx.eq, enabled: false },
        glue: { ...fx.glue, enabled: false },
        limiter: { ...fx.limiter, enabled: false }
      });
      return;
    }
    
    setIsMastering(true);
    setToastMessage(null);
    setActiveGenre(genreId);
    
    // @ts-ignore
    const newMasterFx = await runGenreMastering(genreId, fx);
    newMasterFx.eq.enabled = true;
    newMasterFx.glue.enabled = true;
    newMasterFx.limiter.enabled = true;
    
    onUpdateMasterFx(newMasterFx);
    setIsMastering(false);
    setToastMessage(\`¡Mezcla optimizada para \${genreName}!\`);
    setTimeout(() => setToastMessage(null), 3000);
  };`;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('src/components/MasterFxModal.tsx', code);
console.log('Patched handleGenreMaster');
