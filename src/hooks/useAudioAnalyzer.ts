import { useState } from 'react';

export interface RawChord {
  id: number;
  chord: string;
  startTime: number;
  duration: number;
}

export interface EnrichedChord extends RawChord {
  romanNumeral: string;
  functionType: string;
}

export interface AnalyzedData {
  detectedKey: string;
  tempoBpm: number;
  chords: EnrichedChord[];
}

export const useAudioAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'acoustic' | 'theory' | ''>('');
  const [analyzedData, setAnalyzedData] = useState<AnalyzedData | null>(null);

  // Simula el backend acústico (ej. Python/Librosa)
  const extractRawChords = async (file: File): Promise<RawChord[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, chord: 'Gmaj7', startTime: 0, duration: 4 },
          { id: 2, chord: 'E7', startTime: 4, duration: 4 },
          { id: 3, chord: 'Am7', startTime: 8, duration: 4 }
        ]);
      }, 2000);
    });
  };

  // Simula la llamada a la API del LLM (ej. OpenAI/Gemini)
  const analyzeHarmonicTheory = async (rawChords: RawChord[]): Promise<AnalyzedData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Enriquecemos la data simulando la respuesta de la IA
        const enrichedChords: EnrichedChord[] = rawChords.map(c => {
          if (c.chord === 'Gmaj7') return { ...c, romanNumeral: 'I', functionType: 'diatonic' };
          if (c.chord === 'E7') return { ...c, romanNumeral: 'V7/ii', functionType: 'secondary-dominant' };
          if (c.chord === 'Am7') return { ...c, romanNumeral: 'ii', functionType: 'diatonic' };
          return { ...c, romanNumeral: '?', functionType: 'unknown' };
        });
        
        resolve({
          detectedKey: 'G',
          tempoBpm: 92,
          chords: enrichedChords
        });
      }, 1500);
    });
  };

  // Función orquestadora a llamar desde el botón
  const processAudioFile = async (file: File) => {
    setIsAnalyzing(true);
    setAnalyzedData(null);
    
    try {
      setLoadingStep('acoustic');
      const rawChords = await extractRawChords(file);
      
      setLoadingStep('theory');
      const finalData = await analyzeHarmonicTheory(rawChords);
      
      setAnalyzedData(finalData);
    } catch (error) {
      console.error("Error analizando el audio:", error);
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  return { isAnalyzing, loadingStep, analyzedData, setAnalyzedData, processAudioFile };
};
