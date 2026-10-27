import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 ml-4 shadow-none">
      <button
        onClick={() => setLanguage('es')}
        className={`w-10 py-1 rounded-md text-xs font-bold tracking-wider transition-colors cursor-pointer shadow-none ${
          language === 'es'
            ? 'bg-[#EA580B] text-white'
            : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`w-10 py-1 rounded-md text-xs font-bold tracking-wider transition-colors cursor-pointer shadow-none ${
          language === 'en'
            ? 'bg-[#EA580B] text-white'
            : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        EN
      </button>
    </div>
  );
}
