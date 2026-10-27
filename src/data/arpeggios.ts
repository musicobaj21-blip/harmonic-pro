export type ArpeggioShapeDef = {
  stringIdx: number; // 5 is Low E, 0 is High e
  fretOffset: number; // Relative to the main root note fret
  interval: string;
};

export const ARPEGGIO_SHAPES: Record<string, Record<string, { baseString: number, notes: ArpeggioShapeDef[] }>> = {
  "Mayor": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -1, interval: "3" },
        { stringIdx: 4, fretOffset: 2, interval: "5" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 1, interval: "3" },
        { stringIdx: 1, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "5" }, // optional low 5th
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -1, interval: "3" },
        { stringIdx: 3, fretOffset: 2, interval: "5" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 2, interval: "3" },
        { stringIdx: 0, fretOffset: 0, interval: "5" },
      ]
    },
  },
  "Menor": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -2, interval: "b3" },
        { stringIdx: 4, fretOffset: 2, interval: "5" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 0, interval: "b3" },
        { stringIdx: 1, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -2, interval: "b3" },
        { stringIdx: 3, fretOffset: 2, interval: "5" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 1, interval: "b3" },
        { stringIdx: 0, fretOffset: 0, interval: "5" },
      ]
    },
  },
  "Disminuida": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -2, interval: "b3" },
        { stringIdx: 4, fretOffset: 1, interval: "b5" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 0, interval: "b3" },
        { stringIdx: 1, fretOffset: -1, interval: "b5" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -2, interval: "b3" },
        { stringIdx: 3, fretOffset: 1, interval: "b5" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 1, interval: "b3" },
        { stringIdx: 1, fretOffset: 4, interval: "b5" }, // or string 0, fret -1
      ]
    },
  },
  "Aumentada": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -1, interval: "3" },
        { stringIdx: 4, fretOffset: 3, interval: "#5" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 1, interval: "3" },
        { stringIdx: 1, fretOffset: 1, interval: "#5" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
  },
  "Maj7": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -1, interval: "3" },
        { stringIdx: 4, fretOffset: 2, interval: "5" },
        { stringIdx: 3, fretOffset: 1, interval: "7" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 1, interval: "3" },
        { stringIdx: 1, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: -1, interval: "7" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -1, interval: "3" },
        { stringIdx: 3, fretOffset: 2, interval: "5" },
        { stringIdx: 2, fretOffset: 1, interval: "7" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 2, interval: "3" },
        { stringIdx: 0, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: 4, interval: "7" }, // or stringIdx: 0, fretOffset: -1, but wait!
      ]
    },
  },
  "m7": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -2, interval: "b3" },
        { stringIdx: 4, fretOffset: 2, interval: "5" },
        { stringIdx: 3, fretOffset: 0, interval: "b7" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 0, interval: "b3" },
        { stringIdx: 1, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: -2, interval: "b7" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -2, interval: "b3" },
        { stringIdx: 3, fretOffset: 2, interval: "5" },
        { stringIdx: 2, fretOffset: 0, interval: "b7" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 1, interval: "b3" },
        { stringIdx: 0, fretOffset: 0, interval: "5" },
      ]
    },
  },
  "7": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -1, interval: "3" },
        { stringIdx: 4, fretOffset: 2, interval: "5" },
        { stringIdx: 3, fretOffset: 0, interval: "b7" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 1, interval: "3" },
        { stringIdx: 1, fretOffset: 0, interval: "5" },
        { stringIdx: 0, fretOffset: -2, interval: "b7" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -1, interval: "3" },
        { stringIdx: 3, fretOffset: 2, interval: "5" },
        { stringIdx: 2, fretOffset: 0, interval: "b7" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 2, interval: "3" },
        { stringIdx: 0, fretOffset: 0, interval: "5" },
      ]
    },
  },
  "m7b5": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -2, interval: "b3" },
        { stringIdx: 4, fretOffset: 1, interval: "b5" },
        { stringIdx: 3, fretOffset: 0, interval: "b7" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 0, interval: "b3" },
        { stringIdx: 1, fretOffset: -1, interval: "b5" },
        { stringIdx: 0, fretOffset: -2, interval: "b7" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -2, interval: "b3" },
        { stringIdx: 3, fretOffset: 1, interval: "b5" },
        { stringIdx: 2, fretOffset: 0, interval: "b7" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 1, interval: "b3" },
        { stringIdx: 1, fretOffset: 4, interval: "b5" },
      ]
    },
  },
  "dim7": {
    "Posición 1 (Raíz 6ta)": {
      baseString: 5,
      notes: [
        { stringIdx: 5, fretOffset: 0, interval: "1" },
        { stringIdx: 4, fretOffset: -2, interval: "b3" },
        { stringIdx: 4, fretOffset: 1, interval: "b5" },
        { stringIdx: 3, fretOffset: -1, interval: "bb7" },
        { stringIdx: 3, fretOffset: 2, interval: "1" },
        { stringIdx: 2, fretOffset: 0, interval: "b3" },
        { stringIdx: 1, fretOffset: -1, interval: "b5" },
        { stringIdx: 0, fretOffset: -3, interval: "bb7" },
        { stringIdx: 0, fretOffset: 0, interval: "1" },
      ]
    },
    "Posición 2 (Raíz 5ta)": {
      baseString: 4,
      notes: [
        { stringIdx: 4, fretOffset: 0, interval: "1" },
        { stringIdx: 3, fretOffset: -2, interval: "b3" },
        { stringIdx: 3, fretOffset: 1, interval: "b5" },
        { stringIdx: 2, fretOffset: -1, interval: "bb7" },
        { stringIdx: 2, fretOffset: 2, interval: "1" },
        { stringIdx: 1, fretOffset: 1, interval: "b3" },
        { stringIdx: 1, fretOffset: 4, interval: "b5" },
      ]
    },
  }
};

export function getArpeggioShape(root: string, type: string, positionStr: string = "Posición 1 (Raíz 6ta)"): { string: number, fret: number, label: string }[] | undefined {
  const rootObj = ARPEGGIO_SHAPES[type];
  if (!rootObj) return undefined;
  
  const activePattern = rootObj[positionStr] || Object.values(rootObj)[0];
  if (!activePattern) return undefined;

  const tuningNotes = [64, 59, 55, 50, 45, 40];
  const baseMidi = tuningNotes[activePattern.baseString];
  
  const map: Record<string, number> = {
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11
  };
  const rOffset = map[root] || 0;
  
  let rootFret = 0;
  while ((baseMidi + rootFret) % 12 !== rOffset && rootFret <= 24) {
    rootFret++;
  }

  if (rootFret >= 12 && rootFret - 12 > 0) {
       rootFret -= 12;
  }

  return activePattern.notes.map(note => {
    let fretIdx = rootFret + note.fretOffset;
    if (fretIdx <= 0 && fretIdx + 12 < 15) {
       fretIdx += 12;
    }
    return {
      string: 6 - note.stringIdx,
      fret: fretIdx,
      label: note.interval
    };
  });
}