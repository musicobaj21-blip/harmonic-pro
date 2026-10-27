import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type InstrumentType = 'guitar' | 'piano' | 'bass' | 'saxophone' | 'trumpet' | 'violin' | 'epiano';

interface InstrumentContextType {
  instrument: InstrumentType;
  setInstrument: (instrument: InstrumentType) => void;
}

const InstrumentContext = createContext<InstrumentContextType | undefined>(undefined);

export function InstrumentProvider({ children }: { children: ReactNode }) {
  const [instrument, setInstrument] = useState<InstrumentType>('piano');

  useEffect(() => {
    try {
      localStorage.setItem('global_instrument', instrument);
    } catch (e) {}
  }, [instrument]);

  return (
    <InstrumentContext.Provider value={{ instrument, setInstrument }}>
      {children}
    </InstrumentContext.Provider>
  );
}

export function useInstrument() {
  const context = useContext(InstrumentContext);
  if (context === undefined) {
    throw new Error('useInstrument must be used within an InstrumentProvider');
  }
  return context;
}
