import React from 'react';
import { useGlobalMidi } from '../contexts/GlobalMidiContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function MIDIBadge() {
  const { midiInputs, requestMidiAccess } = useGlobalMidi();
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => requestMidiAccess()}
      title={
        midiInputs.length > 0
          ? `${language === 'en' ? 'Connected' : 'Conectado'}: ${midiInputs[0].name}`
          : (language === 'en' ? 'Click to connect / scan MIDI keyboard' : 'Clic para conectar / buscar teclado MIDI')
      }
      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs cursor-pointer transition-colors text-left"
    >
      {midiInputs.length > 0 ? (
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
      )}
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider leading-none">
          {language === 'en' ? 'MIDI Input' : 'Entrada MIDI'}
        </span>
        <span className="font-mono text-xs text-neutral-200 font-semibold truncate max-w-[140px] mt-0.5">
          {midiInputs.length > 0 ? midiInputs[0].name : (language === 'en' ? 'Disconnected' : 'Desconectado')}
        </span>
      </div>
    </button>
  );
}
