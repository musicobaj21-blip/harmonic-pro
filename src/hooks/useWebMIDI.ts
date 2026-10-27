import { useGlobalMidi } from '../contexts/GlobalMidiContext';

export function useWebMIDI() {
  const { midiAccess, midiInputs: inputs, midiActivity } = useGlobalMidi();
  return { midiAccess, inputs, midiActivity };
}
