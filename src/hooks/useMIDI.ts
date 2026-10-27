import { useEffect, useRef } from "react";
import { playSingleNote, getAudioContext } from "../utils/audio";
import { getLoadedInstrument } from "../utils/soundfont";
import { useGlobalMidi } from "../contexts/GlobalMidiContext";

export interface UseMidiOptions {
  playSound?: boolean;
  instrument?: string;
  pan?: number;
  volume?: number;
  onMidiEvent?: (event: { command: number; data1: number; data2: number }) => void;
}

export function useMIDI(options: UseMidiOptions = { playSound: false }) {
  const {
    midiInputs,
    activeNotes,
    velocity,
    sustain,
    pitchBend,
    simulateMidiEvent,
  } = useGlobalMidi();

  const onMidiEventRef = useRef(options?.onMidiEvent);
  const playingAudioNodes = useRef<Record<number, any>>({});
  const instrumentRef = useRef(options?.instrument);
  const panRef = useRef(options?.pan ?? 0);
  const volumeRef = useRef(options?.volume ?? 1.0);

  useEffect(() => {
    onMidiEventRef.current = options?.onMidiEvent;
  }, [options?.onMidiEvent]);

  useEffect(() => {
    instrumentRef.current = options?.instrument;
  }, [options?.instrument]);

  useEffect(() => {
    panRef.current = options?.pan ?? 0;
  }, [options?.pan]);

  useEffect(() => {
    volumeRef.current = options?.volume ?? 1.0;
  }, [options?.volume]);

  useEffect(() => {
    if (!options.playSound && !options.onMidiEvent) {
      return;
    }

    const handleCustomMidiMessage = (e: any) => {
      const { command, data1, data2 } = e.detail || {};
      if (typeof command !== 'number' || typeof data1 !== 'number') return;

      if (onMidiEventRef.current) {
        onMidiEventRef.current({ command, data1, data2: data2 || 0 });
      }

      if (options.playSound === true) {
        // Note On
        if (command === 9 && data2 > 0) {
          if (playingAudioNodes.current[data1]) {
            try {
              playingAudioNodes.current[data1].stop(getAudioContext().currentTime);
            } catch {
              // ignore
            }
            delete playingAudioNodes.current[data1];
          }

          const instName = instrumentRef.current || 'epiano';
          const currentInstrument = getLoadedInstrument(instName);
          const ac = getAudioContext();

          if (currentInstrument) {
            const noteVolume = (data2 / 127) * 1.5 * volumeRef.current;
            const panner = ac.createStereoPanner();
            panner.pan.value = panRef.current;
            import("../utils/audio").then(({ getPlaybackMasterGain }) => panner.connect(getPlaybackMasterGain()));

            const node = currentInstrument.play(data1, ac.currentTime, { duration: undefined, gain: noteVolume });
            if (node && typeof node.disconnect === 'function') {
              node.disconnect();
              node.connect(panner);
            }
            playingAudioNodes.current[data1] = node;
          } else {
            const freq = 440 * Math.pow(2, (data1 - 69) / 12);
            playSingleNote(freq, "sine", (data2 / 127) * 0.5 * volumeRef.current, instName as any, panRef.current);
          }
        }
        // Note Off
        else if (command === 8 || (command === 9 && data2 === 0)) {
          const node = playingAudioNodes.current[data1];
          if (node) {
            try {
              node.stop(getAudioContext().currentTime);
            } catch {
              // ignore
            }
            delete playingAudioNodes.current[data1];
          }
        }
      }
    };

    window.addEventListener('custom-midi-message', handleCustomMidiMessage);

    return () => {
      window.removeEventListener('custom-midi-message', handleCustomMidiMessage);
      Object.values(playingAudioNodes.current).forEach((node: any) => {
        try {
          node.stop(getAudioContext().currentTime);
        } catch {
          // ignore
        }
      });
      playingAudioNodes.current = {};
    };
  }, [options.playSound]);

  return { midiInputs, activeNotes, velocity, sustain, pitchBend, simulateMidiEvent };
}
