import React, { useState } from 'react';
import { X, Power, Wand2 } from 'lucide-react';
import { trackFxPresets } from '../data/fxPresets';

export const TrackFxModal = ({ track, onClose, onUpdateTrack }: any) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const defaultEffects = {
  eq: { enabled: false, low: 0, mid: 0, high: 0 },
  compressor: { enabled: false, threshold: -24, ratio: 12 },
  reverb: { enabled: false, mix: 0.3 }
};
const fx = track.effects || defaultEffects;
track.effects = fx;

  const updateFx = (type: string, field: string, value: any) => {
    const updated = {
      ...track,
      effects: {
        ...track.effects,
        [type]: {
          ...track.effects[type],
          [field]: value
        }
      }
    };
    onUpdateTrack(updated, track.id, type, field, value, track.effects[type].enabled);
  };

  const toggleFx = (type: string) => {
    const willBeEnabled = !track.effects[type].enabled;
    onUpdateTrack({
      ...track,
      effects: {
        ...track.effects,
        [type]: {
          ...track.effects[type],
          enabled: willBeEnabled
        }
      }
    }, track.id, type, 'enabled', willBeEnabled);
    // logic moved above
  };

  const applyPreset = (presetKey: string, preset: any) => {
    if (activePreset === presetKey) {
      setActivePreset(null);
      const updated = {
        ...track,
        effects: {
          ...track.effects,
          eq: { ...track.effects.eq, enabled: false },
          compressor: { ...track.effects.compressor, enabled: false },
          reverb: { ...track.effects.reverb, enabled: false }
        }
      };
      onUpdateTrack(updated, track.id, 'preset', 'preset', null, true);
    } else {
      setActivePreset(presetKey);
      const updated = {
        ...track,
        effects: {
          ...track.effects,
          eq: { ...track.effects.eq, enabled: true, ...preset.eq },
          compressor: { ...track.effects.compressor, enabled: true, ...preset.compressor },
          reverb: { ...track.effects.reverb, enabled: true, ...preset.reverb }
        }
      };
      onUpdateTrack(updated, track.id, 'preset', 'preset', null, true);
    }
  };

  const applyAutoEq = () => {
    const isBass = track.instrument === 'bass' || track.instrument === 'drum'; // simplified heuristic
    const low = isBass ? 3 : -2;
    const mid = isBass ? -1 : 1;
    const high = isBass ? -2 : 2.5;

    const updated = {
      ...track,
      effects: {
        ...track.effects,
        eq: { ...track.effects.eq, enabled: true, low, mid, high }
      }
    };
    onUpdateTrack(updated, track.id, 'auto_eq', 'auto', null, true);
  };

  const applyAutoComp = () => {
    const updated = {
      ...track,
      effects: {
        ...track.effects,
        compressor: { ...track.effects.compressor, enabled: true, threshold: -18, ratio: 3 }
      }
    };
    onUpdateTrack(updated, track.id, 'auto_compressor', 'auto', null, true);
  };

  const applyAutoReverb = () => {
    const isRhythm = track.instrument === 'bass' || track.instrument === 'drum';
    const mix = isRhythm ? 0.08 : 0.28;
    const updated = {
      ...track,
      effects: {
        ...track.effects,
        reverb: { ...track.effects.reverb, enabled: true, mix }
      }
    };
    onUpdateTrack(updated, track.id, 'auto_reverb', 'auto', null, true);
  };

  // Determine preset category
  let presetCategory = 'synth';
  if (track.instrument === 'bass') presetCategory = 'bass';
  if (track.instrument === 'drum') presetCategory = 'drums';
  
  const presets = (trackFxPresets as any)[presetCategory] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#111]">
          <h2 className="text-lg font-bold text-slate-200">FX Chain: {track.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Presets Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              Presets Rápidos por Estilo
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 custom-scrollbar">
              {Object.entries(presets).map(([key, preset]: [string, any]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key, preset)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePreset === key
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-[#111] border border-slate-700 text-slate-300 hover:border-purple-500/50 hover:bg-purple-900/10'
                  }`}
                >
                                    {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* EQ Section */}
            <div className="flex-1 bg-black/40 rounded-lg p-4 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-blue-400">EQ 3-Band</h3>
                  <button 
                    onClick={applyAutoEq}
                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    <Wand2 size={10} /> AUTO
                  </button>
                </div>
                <button 
                  onClick={() => toggleFx('eq')}
                  className={`p-1.5 rounded-full ${fx.eq.enabled ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                >
                  <Power size={14} />
                </button>
              </div>
              
              <div className="flex justify-around gap-2 mt-4">
                <Knob label="LOW" value={fx.eq.low} min={-24} max={24} onChange={(v: number) => updateFx('eq', 'low', v)} disabled={!fx.eq.enabled} unit="dB" />
                <Knob label="MID" value={fx.eq.mid} min={-24} max={24} onChange={(v: number) => updateFx('eq', 'mid', v)} disabled={!fx.eq.enabled} unit="dB" />
                <Knob label="HIGH" value={fx.eq.high} min={-24} max={24} onChange={(v: number) => updateFx('eq', 'high', v)} disabled={!fx.eq.enabled} unit="dB" />
              </div>
            </div>

            {/* Compressor Section */}
            <div className="flex-1 bg-black/40 rounded-lg p-4 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-orange-400">Compressor</h3>
                  <button 
                    onClick={applyAutoComp}
                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded hover:bg-orange-500/30 transition-colors"
                  >
                    <Wand2 size={10} /> AUTO
                  </button>
                </div>
                <button 
                  onClick={() => toggleFx('compressor')}
                  className={`p-1.5 rounded-full ${fx.compressor.enabled ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                >
                  <Power size={14} />
                </button>
              </div>
              
              <div className="flex justify-around gap-2 mt-4">
                <Knob label="THRESH" value={fx.compressor.threshold} min={-60} max={0} onChange={(v: number) => updateFx('compressor', 'threshold', v)} disabled={!fx.compressor.enabled} unit="dB" />
                <Knob label="RATIO" value={fx.compressor.ratio} min={1} max={20} onChange={(v: number) => updateFx('compressor', 'ratio', v)} disabled={!fx.compressor.enabled} unit=":1" />
              </div>
            </div>

            {/* Reverb Section */}
            <div className="flex-1 bg-black/40 rounded-lg p-4 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-emerald-400">Reverb Send</h3>
                  <button 
                    onClick={applyAutoReverb}
                    className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30 transition-colors"
                  >
                    <Wand2 size={10} /> AUTO
                  </button>
                </div>
                <button 
                  onClick={() => toggleFx('reverb')}
                  className={`p-1.5 rounded-full ${fx.reverb.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                >
                  <Power size={14} />
                </button>
              </div>
              
              <div className="flex justify-around gap-2 mt-4">
                <Knob label="MIX" value={Math.round(fx.reverb.mix * 100)} min={0} max={100} onChange={(v: number) => updateFx('reverb', 'mix', v / 100)} disabled={!fx.reverb.enabled} unit="%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Knob = ({ label, value, min, max, onChange, disabled, unit }: any) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <span className="text-[10px] text-slate-500 font-bold uppercase">{label}</span>
      <div className="relative w-12 h-12 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center">
        <input 
          type="range" 
          min={min} 
          max={max} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          style={{ appearance: 'slider-vertical' as any }}
        />
        <div 
          className="absolute w-1 h-3 bg-slate-400 rounded-full top-1 origin-[50%_20px]"
          style={{ transform: `rotate(${((value - min) / (max - min)) * 270 - 135}deg)` }}
        />
      </div>
      <span className="text-xs text-slate-300 font-mono">{Math.round(value)}{unit}</span>
    </div>
  );
};
