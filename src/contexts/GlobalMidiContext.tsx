import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface GlobalMidiContextType {
  midiAccess: any | null;
  midiInputs: any[];
  isConnected: boolean;
  activeNotes: number[];
  velocity: number;
  sustain: boolean;
  pitchBend: number;
  midiActivity: number;
  simulateMidiEvent: (command: number, data1: number, data2: number) => void;
  requestMidiAccess: () => Promise<void>;
}

const GlobalMidiContext = createContext<GlobalMidiContextType | null>(null);

export function GlobalMidiProvider({ children }: { children: React.ReactNode }) {
  const [midiAccess, setMidiAccess] = useState<any>(null);
  const [midiInputs, setMidiInputs] = useState<any[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [velocity, setVelocity] = useState<number>(0);
  const [sustain, setSustain] = useState<boolean>(false);
  const [pitchBend, setPitchBend] = useState<number>(8192); // Center value (0-16383)
  const [midiActivity, setMidiActivity] = useState<number>(0);

  const midiAccessRef = useRef<any>(null);
  const isRequestingRef = useRef<boolean>(false);

  const handleMidiEvent = useCallback((command: number, channel: number, data1: number, data2: number) => {
    setMidiActivity(Date.now());

    // Dispatch custom event to notify listeners (such as GlobalMidiKeyboard) across the app
    try {
      window.dispatchEvent(
        new CustomEvent('custom-midi-message', {
          detail: { command, channel, data1, data2 },
        })
      );
    } catch {
      // ignore
    }

    // Note On
    if (command === 9 && data2 > 0) {
      setVelocity(data2);
      setActiveNotes((prev) => (prev.includes(data1) ? prev : [...prev, data1]));
    }
    // Note Off
    else if (command === 8 || (command === 9 && data2 === 0)) {
      setActiveNotes((prev) => prev.filter((n) => n !== data1));
    }
    // Control Change (Sustain: CC 64)
    else if (command === 11 && data1 === 64) {
      setSustain(data2 >= 64);
    }
    // Pitch Bend
    else if (command === 14) {
      setPitchBend((data2 << 7) | data1);
    }
  }, []);

  const simulateMidiEvent = useCallback((command: number, data1: number, data2: number) => {
    handleMidiEvent(command, 0, data1, data2);
  }, [handleMidiEvent]);

  // Extract inputs safely regardless of browser implementation
  const extractInputs = useCallback((access: any): any[] => {
    if (!access || !access.inputs) return [];
    const list: any[] = [];
    try {
      if (typeof access.inputs.values === 'function') {
        for (const input of access.inputs.values()) {
          if (input) list.push(input);
        }
      }
    } catch {
      // ignore
    }
    if (list.length === 0 && typeof access.inputs.forEach === 'function') {
      try {
        access.inputs.forEach((input: any) => {
          if (input) list.push(input);
        });
      } catch {
        // ignore
      }
    }
    return list;
  }, []);

  const onMIDIMessage = useCallback((message: any) => {
    const data = message?.data;
    if (!data || data.length < 2) return;
    const command = data[0] >> 4;
    const channel = data[0] & 0xf;
    const data1 = data[1];
    const data2 = data.length > 2 ? data[2] : 0;
    handleMidiEvent(command, channel, data1, data2);
  }, [handleMidiEvent]);

  const updateInputs = useCallback((access: any) => {
    if (!access) return;
    const inputs = extractInputs(access);
    setMidiInputs(inputs);

    inputs.forEach((input: any) => {
      // Eliminar cualquier event listener previo para garantizar una única ruta principal
      try {
        input.removeEventListener('midimessage', onMIDIMessage);
      } catch {
        // ignore
      }
      // Asignar ruta única principal de eventos MIDI físicos
      try {
        input.onmidimessage = onMIDIMessage;
      } catch {
        try {
          input.addEventListener('midimessage', onMIDIMessage);
        } catch {
          // ignore
        }
      }
    });
  }, [extractInputs, onMIDIMessage]);

  const requestMidiAccess = useCallback(async () => {
    if (typeof navigator === 'undefined' || !(navigator as any).requestMIDIAccess) {
      return;
    }
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;

    try {
      let access = midiAccessRef.current;
      if (!access) {
        try {
          access = await (navigator as any).requestMIDIAccess();
        } catch {
          try {
            access = await (navigator as any).requestMIDIAccess({ sysex: false });
          } catch {
            try {
              access = await (navigator as any).requestMIDIAccess({ sysex: true });
            } catch {
              // Both standard and sysex requests failed
            }
          }
        }
      }

      if (access) {
        midiAccessRef.current = access;
        setMidiAccess(access);
        updateInputs(access);

        const handleStateChange = () => {
          updateInputs(access);
          // Secondary update for delayed USB driver registration
          setTimeout(() => updateInputs(access), 150);
          setTimeout(() => updateInputs(access), 500);
        };

        if (typeof access.addEventListener === 'function') {
          access.addEventListener('statechange', handleStateChange);
        }
        access.onstatechange = handleStateChange;
      }
    } catch (err) {
      console.warn('[GlobalMidiProvider] Failed to acquire MIDI access:', err);
    } finally {
      isRequestingRef.current = false;
    }
  }, [updateInputs]);

  useEffect(() => {
    // Expose simulateMidiEvent to window for global access
    (window as any).simulateMidiEvent = (command: number, _channelOrData1: number, data1OrData2?: number, maybeData2?: number) => {
      if (typeof maybeData2 === 'number') {
        handleMidiEvent(command, _channelOrData1, data1OrData2 ?? 0, maybeData2);
      } else {
        handleMidiEvent(command, 0, _channelOrData1, data1OrData2 ?? 0);
      }
    };

    // Initial MIDI access request
    requestMidiAccess();

    // In Chrome, if initial request on load didn't prompt or was deferred,
    // trigger requestMidiAccess on first user gesture
    const handleFirstGesture = () => {
      if (!midiAccessRef.current || midiInputs.length === 0) {
        requestMidiAccess();
      }
    };
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    // Periodic check to detect hotplugged devices when OS does not send statechange
    const interval = setInterval(() => {
      if (midiAccessRef.current) {
        updateInputs(midiAccessRef.current);
      } else {
        requestMidiAccess();
      }
    }, 3000);

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      clearInterval(interval);
    };
  }, [handleMidiEvent, requestMidiAccess, updateInputs, midiInputs.length]);

  const value = useMemo<GlobalMidiContextType>(() => ({
    midiAccess,
    midiInputs,
    isConnected: midiInputs.length > 0,
    activeNotes,
    velocity,
    sustain,
    pitchBend,
    midiActivity,
    simulateMidiEvent,
    requestMidiAccess,
  }), [
    midiAccess,
    midiInputs,
    activeNotes,
    velocity,
    sustain,
    pitchBend,
    midiActivity,
    simulateMidiEvent,
    requestMidiAccess,
  ]);

  return (
    <GlobalMidiContext.Provider value={value}>
      {children}
    </GlobalMidiContext.Provider>
  );
}

export function useGlobalMidi(): GlobalMidiContextType {
  const context = useContext(GlobalMidiContext);
  if (!context) {
    return {
      midiAccess: null,
      midiInputs: [],
      isConnected: false,
      activeNotes: [],
      velocity: 0,
      sustain: false,
      pitchBend: 8192,
      midiActivity: 0,
      simulateMidiEvent: () => {},
      requestMidiAccess: async () => {},
    };
  }
  return context;
}

export function useMidiAccessRequest(): () => Promise<void> {
  const context = useContext(GlobalMidiContext);
  return context?.requestMidiAccess || (async () => {});
}
