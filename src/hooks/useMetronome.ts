import { useState, useEffect, useRef, useCallback } from 'react';
import { getAudioContext, getPlaybackMasterGain } from '../utils/audio';

export type TimeSignature = '4/4' | '3/4' | '6/8' | '12/8' | '2/4' | '5/4' | '7/8';

export function useMetronome(initialBpm: number = 120) {
  const [bpm, setBpm] = useState(initialBpm);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const nextNoteTimeRef = useRef(0);
  const currentBeatInBarRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const scheduleNote = (time: number, isAccent: boolean) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    osc.connect(env);
    env.connect(getPlaybackMasterGain());
    
    osc.type = "triangle";
    osc.frequency.value = isAccent ? 1500 : 1000;
    
    const maxGain = volumeRef.current * (isAccent ? 1.5 : 1.0);
    env.gain.setValueAtTime(0, time - 0.001);
    env.gain.setValueAtTime(maxGain, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.start(time);
    osc.stop(time + 0.05);
  };

  const getBeatsPerBar = () => {
    const num = parseInt(timeSignature.split('/')[0], 10);
    return isNaN(num) || num <= 0 ? 4 : num;
  };

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const beatsPerBar = getBeatsPerBar();
      const isAccent = currentBeatInBarRef.current === 0;
      scheduleNote(nextNoteTimeRef.current, isAccent);
      
      nextNoteTimeRef.current += 60.0 / bpm;
      currentBeatInBarRef.current = (currentBeatInBarRef.current + 1) % beatsPerBar;
    }
    timerIDRef.current = window.setTimeout(scheduler, 25.0);
  }, [bpm, timeSignature]);

  useEffect(() => {
    if (isPlaying) {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      currentBeatInBarRef.current = 0;
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      scheduler();
    } else {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    }
    return () => {
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    };
  }, [isPlaying, scheduler]);

  // Utility to play exactly N bars for a count-in, then call a callback
  const playCountIn = useCallback((bars: number, onComplete: () => void) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    const beatsPerBar = getBeatsPerBar();
    const totalBeats = beatsPerBar * bars;
    const beatDuration = 60.0 / bpm;
    
    let time = ctx.currentTime + 0.1;
    for (let i = 0; i < totalBeats; i++) {
      const isAccent = (i % beatsPerBar) === 0;
      scheduleNote(time, isAccent);
      time += beatDuration;
    }
    
    // Convert time delay to JS timeout for the UI callback
    const delayMs = (time - ctx.currentTime) * 1000;
    setTimeout(() => {
      onComplete();
    }, delayMs);
    
  }, [bpm, timeSignature]);

  return { bpm, setBpm, timeSignature, setTimeSignature, isPlaying, setIsPlaying, volume, setVolume, playCountIn };
}
