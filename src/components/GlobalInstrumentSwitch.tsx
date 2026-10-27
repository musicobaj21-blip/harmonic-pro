import React from 'react';
import { useInstrument } from '../contexts/InstrumentContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function GlobalInstrumentSwitch() {
  const { instrument, setInstrument } = useInstrument();
  const { t } = useLanguage();

  return (
    <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg shadow-none">
      {/* Botón Guitarra */}
      <button
        onClick={() => setInstrument('guitar')}
        className={`px-3 py-1.5 rounded-md font-sans transition-colors flex items-center gap-1.5 uppercase text-xs tracking-wider cursor-pointer shadow-none ${
          instrument === 'guitar'
            ? 'bg-orange-500 text-white font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
      >
        <svg className="w-3.5 h-3.5 opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
        {t("common.guitar")}
      </button>

      {/* Botón Teclado */}
      <button
        onClick={() => setInstrument('piano')}
        className={`px-3 py-1.5 rounded-md font-sans transition-colors flex items-center gap-1.5 uppercase text-xs tracking-wider cursor-pointer shadow-none ${
          instrument === 'piano'
            ? 'bg-orange-500 text-white font-bold'
            : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        }`}
      >
        <svg className="w-3.5 h-3.5 opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 3C2.9 3 2 3.9 2 5v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4zm2 4h2v8H6V7zm4 0h2v8h-2V7zm4 0h2v8h-2V7z"/></svg>
        {t("common.keyboard")}
      </button>
    </div>
  );
}
