import React, { useState, useEffect } from 'react';
import { useGlobalMidi } from '../contexts/GlobalMidiContext';

const MidiStatusMessage = () => {
   const { midiInputs } = useGlobalMidi();

   if (typeof navigator !== 'undefined' && !(navigator as any).requestMIDIAccess) {
     return <p className="italic">Web MIDI API no soportada en este navegador.</p>;
   }

   if (midiInputs.length > 0) {
     const devices = midiInputs.map(input => input.name || 'Dispositivo MIDI Desconocido');
     return <p className="italic">{`Dispositivos detectados: ${devices.join(', ')}`}</p>;
   }

   return <p className="italic">No hay dispositivos MIDI físicos detectados.</p>;
};
import { useAudioDevices } from '../hooks/useAudioDevices';
import { applyAudioOutputSink } from '../utils/audio';

export interface StudioSettings {
  sampleRate: number;
  bufferSize: number;
  isQwertyMidiEnabled: boolean;
  preRollBars: number;
  clickVolume: number;
  autoSaveInterval: string;
  visualFps: number;
}

interface StudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onSettingsChange: (newSettings: StudioSettings) => void;
}

type TabType = 'audio' | 'midi' | 'metronome' | 'general';

export default function StudioSettingsModal({ isOpen, onClose, settings, onSettingsChange }: StudioSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  
  const [localSettings, setLocalSettings] = useState<StudioSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const updateSetting = (key: keyof StudioSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const latencyMs = ((localSettings.bufferSize / localSettings.sampleRate) * 1000 * 2).toFixed(1);

  
  const { inputDevices, outputDevices, error, requestPermission } = useAudioDevices();
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');

  // Default selection fallback
  useEffect(() => {
    if (inputDevices.length > 0 && !selectedInput) {
      setSelectedInput(inputDevices[0].deviceId);
    }
    if (outputDevices.length > 0 && !selectedOutput) {
      setSelectedOutput(outputDevices[0].deviceId);
    }
  }, [inputDevices, outputDevices, selectedInput, selectedOutput]);

  const scanHardware = () => {
    requestPermission();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[680px] h-[480px] bg-[#0a0a0c] border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-200 select-none">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-[#09090b]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580B] shadow-[0_0_8px_#EA580B]" />
            <h2 className="text-sm font-bold tracking-wide text-white uppercase font-mono">
              Configuración de Estudio - RUMIE STUDIO PRO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center text-xs transition"
            title="Cerrar configuración"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo Dividido */}
        <div className="flex flex-1 overflow-hidden">
          {/* Barra Lateral de Pestañas */}
          <div className="w-48 bg-[#070709] border-r border-zinc-800/80 p-2 flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-2 text-xs text-left transition-all ${
                activeTab === 'audio'
                  ? 'bg-zinc-800/90 text-[#EA580B] border-l-2 border-[#EA580B] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 font-semibold'
              }`}
            >
              AUDIO & HARDWARE
            </button>
            <button
              onClick={() => setActiveTab('midi')}
              className={`px-3 py-2 text-xs text-left transition-all ${
                activeTab === 'midi'
                  ? 'bg-zinc-800/90 text-[#EA580B] border-l-2 border-[#EA580B] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 font-semibold'
              }`}
            >
              MIDI & CONTROL
            </button>
            <button
              onClick={() => setActiveTab('metronome')}
              className={`px-3 py-2 text-xs text-left transition-all ${
                activeTab === 'metronome'
                  ? 'bg-zinc-800/90 text-[#EA580B] border-l-2 border-[#EA580B] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 font-semibold'
              }`}
            >
              METRÓNOMO
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-xs text-left transition-all ${
                activeTab === 'general'
                  ? 'bg-zinc-800/90 text-[#EA580B] border-l-2 border-[#EA580B] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 font-semibold'
              }`}
            >
              GENERAL
            </button>
          </div>

          {/* Contenido de Pestañas */}
          <div className="flex-1 p-6 bg-[#0a0a0c] overflow-y-auto">
            {activeTab === 'audio' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-sm font-bold text-white">Dispositivos de Audio</h3>
                    <button
                      onClick={scanHardware}
                      className="text-[10px] font-mono tracking-wider font-semibold text-[#EA580B] hover:brightness-110 transition flex items-center gap-1.5"
                    >
                      <span className="text-lg leading-none">↻</span> Escanear Hardware
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-950/40 border border-red-900/50 p-2 rounded text-[10px] text-red-400 font-mono">
                      {error}
                    </div>
                  )}
                  
                  {/* DISPOSITIVO DE ENTRADA */}
                  <div className="flex flex-col gap-1 mb-1">
                    <label className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                      Dispositivo de Entrada (In)
                    </label>
                    <select
                      value={selectedInput}
                      onChange={(e) => setSelectedInput(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#EA580B]"
                    >
                      {inputDevices.length === 0 ? (
                        <option value="">Sin entradas detectadas (Haz clic en Escanear Hardware)</option>
                      ) : (
                        inputDevices.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Entrada de Audio ${idx + 1}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* DISPOSITIVO DE SALIDA */}
                  <div className="flex flex-col gap-1 mb-1">
                    <label className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">
                      Dispositivo de Salida (Out)
                    </label>
                    <select
                      value={selectedOutput}
                      onChange={async (e) => {
                        const newId = e.target.value;
                        setSelectedOutput(newId);
                        await applyAudioOutputSink(newId);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#EA580B]"
                    >
                      {outputDevices.length === 0 ? (
                        <option value="">Sin salidas detectadas</option>
                      ) : (
                        outputDevices.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Salida de Audio ${idx + 1}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Motor y Rendimiento</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Frecuencia de Muestreo</label>
                      <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.sampleRate} onChange={e => updateSetting('sampleRate', parseInt(e.target.value))}>
                        <option value="44100">44100 Hz</option>
                        <option value="48000">48000 Hz (Estudio)</option>
                        <option value="96000">96000 Hz</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tamaño de Búfer</label>
                      <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.bufferSize} onChange={e => updateSetting('bufferSize', parseInt(e.target.value))}>
                        <option value="128">128 Muestras</option>
                        <option value="256">256 Muestras</option>
                        <option value="512">512 Muestras</option>
                        <option value="1024">1024 Muestras</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center p-3 border border-zinc-800/80 bg-zinc-900/50 rounded-md">
                     <span className="text-xs font-mono font-bold text-zinc-300">LATENCIA ESTIMADA: <span className="text-[#EA580B]">~{latencyMs} ms</span> <span className="text-zinc-500 font-normal ml-1">(Entrada/Salida optimizada)</span></span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'midi' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Entradas MIDI Detectadas</h3>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-md p-3 min-h-[100px] flex flex-col gap-3">
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={true} readOnly className="accent-[#EA580B] w-3 h-3 bg-zinc-900 border-zinc-700 rounded-sm" />
                        <span className="text-xs text-zinc-300 font-semibold">Cualquier Controlador MIDI</span>
                     </label>
                     <div className="text-xs text-zinc-400">
                       <MidiStatusMessage />
                     </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                   <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Control Virtual</h3>
                   <label className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-zinc-900/50 cursor-pointer group" onClick={(e) => { e.preventDefault(); updateSetting('isQwertyMidiEnabled', !localSettings.isQwertyMidiEnabled); }}>
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Teclado QWERTY Virtual</span>
                         <span className="text-[10px] text-zinc-500">Usar el teclado del ordenador como entrada MIDI</span>
                      </div>
                      <div className={`relative inline-block w-8 h-4 rounded-full transition-colors ${localSettings.isQwertyMidiEnabled ? 'bg-[#EA580B]' : 'bg-zinc-600'}`}>
                         <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow ${localSettings.isQwertyMidiEnabled ? 'left-[18px]' : 'left-0.5'}`}></span>
                      </div>
                   </label>
                </div>
              </div>
            )}

            {activeTab === 'metronome' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Opciones de Metrónomo</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cuenta Regresiva (Pre-roll)</label>
                    <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.preRollBars} onChange={e => updateSetting('preRollBars', parseInt(e.target.value))}>
                      <option value="0">Desactivada</option>
                      <option value="1">1 Compás</option>
                      <option value="2">2 Compases</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Volumen del Clic</label>
                        <span className="text-xs text-zinc-500 font-mono">{localSettings.clickVolume}%</span>
                     </div>
                     <input type="range" min="0" max="100" value={localSettings.clickVolume} onChange={e => updateSetting('clickVolume', parseInt(e.target.value))} className="w-full accent-[#EA580B] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                   <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Sistema y Flujo de Trabajo</h3>
                   
                   <label className="flex items-center justify-between p-3 border border-zinc-800 rounded bg-zinc-900/50 cursor-pointer group">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Guardado Automático (Auto-Save)</span>
                         <span className="text-[10px] text-zinc-500">Respaldar el proyecto periódicamente</span>
                      </div>
                      <select onClick={(e) => e.stopPropagation()} value={localSettings.autoSaveInterval} onChange={e => updateSetting('autoSaveInterval', e.target.value)} className="bg-black border border-zinc-700 rounded px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-zinc-600">
                         <option value="5">5 min</option>
                         <option value="10">10 min</option>
                         <option value="off">Off</option>
                      </select>
                   </label>

                   <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Frecuencia de Actualización Gráfica (FPS)</label>
                      <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700" value={localSettings.visualFps} onChange={e => updateSetting('visualFps', parseInt(e.target.value))}>
                        <option value="60">60 FPS (Estudio Fluido)</option>
                        <option value="30">30 FPS (Ahorro Energía)</option>
                      </select>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie de Página del Modal */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-zinc-800 bg-[#09090b]">
          <button className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded text-xs font-mono transition">
            Restaurar Por Defecto
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                onSettingsChange(localSettings);
                await applyAudioOutputSink(selectedOutput);
                onClose();
              }}
              className="px-4 py-1.5 bg-[#EA580B] hover:brightness-110 text-white rounded text-xs font-bold shadow-[0_0_12px_rgba(234,88,11,0.4)] transition"
            >
              Aplicar Configuración
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
