import { RootNote, ChordTypeOptions, GuitarVoicing, Barre } from "../types";

export const CHORD_GROUPS = [
  {
    id: "triads",
    label: "TRÍADAS",
    options: ["Mayor", "Menor", "aug"] as ChordTypeOptions[],
  },
  {
    id: "sevenths",
    label: "SÉPTIMAS",
    options: ["maj7", "m7", "7", "m(maj7)", "m7b5", "dim7"] as ChordTypeOptions[],
  },
  {
    id: "tensions",
    label: "TENSIONES",
    options: ["maj9", "maj13", "6", "6(9)", "m9", "m11", "m13", "m6", "9", "13", "7sus4", "9sus4", "13sus4", "add9", "m-add9"] as ChordTypeOptions[],
  },
  {
    id: "altered",
    label: "ALTERADOS",
    options: ["maj7#11", "maj9#11", "alt", "7b9", "7#9", "7#11", "7b13"] as ChordTypeOptions[],
  }
];

export const ROOT_MIDI_OFFSET_MAP: Record<RootNote, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const ROOT_DISPLAY_NAME_MAP: Record<RootNote, string> = {
  C: "C",
  "C#": "C#",
  Db: "Db",
  D: "D",
  "D#": "D#",
  Eb: "Eb",
  E: "E",
  F: "F",
  "F#": "F#",
  Gb: "Gb",
  G: "G",
  "G#": "G#",
  Ab: "Ab",
  A: "A",
  "A#": "A#",
  Bb: "Bb",
  B: "B",
};

export const CHROMATIC_SCALE: RootNote[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const ROMAN_NUMERALS = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
];

export interface MovableTemplate {
  rootStringIndex: number;
  fretsOffset: number[]; // -1 for mute
  fingers: number[];
  baseOffset: number;
  label: string;
  isPro?: boolean;
  barres?: Barre[];
}

export const MOVABLE_TEMPLATES: Partial<
  Record<ChordTypeOptions, MovableTemplate[]>
> = {
  Mayor: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 2, 1, 0, 0],
      fingers: [0, 3, 4, 2, 0, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Forma de E)",
      barres: [{ fromString: 6, toString: 1, fretOffset: 0 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 2, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Forma de A)",
      barres: [{ fromString: 5, toString: 1, fretOffset: 0 }],
    },
  ],
  Menor: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 2, 0, 0, 0],
      fingers: [0, 3, 4, 0, 0, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Forma de Em)",
      barres: [{ fromString: 6, toString: 1, fretOffset: 0 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 3, 4, 2, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Forma de Am)",
      barres: [{ fromString: 5, toString: 1, fretOffset: 0 }],
    },
  ],
  maj7: [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 1, 2, -1],
      fingers: [0, 1, 4, 2, 4, 0],
      baseOffset: 0,
      label: "Pancho Merino 1 (R5)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 1, 1, -1, -1],
      fingers: [1, 4, 2, 3, 0, 0],
      baseOffset: 0,
      label: "Pancho Merino 2 (R6)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 1, 1, 0, -1],
      fingers: [1, 0, 2, 3, 4, 0],
      baseOffset: -1,
      label: "Pancho Merino 3 (R6)",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 2, 2, 2],
      fingers: [0, 0, 1, 2, 3, 4],
      baseOffset: 0,
      label: "Pancho Merino 4 (R4)",
    },
  ],
  maj9: [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 1, 0, -1],
      fingers: [0, 2, 1, 4, 3, 0],
      baseOffset: -1,
      label: "Pancho Merino 1 (R5)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 1, -1, 0, -1],
      fingers: [2, 0, 4, 1, 3, 0],
      baseOffset: -1,
      label: "Pancho Merino 2 (R6)",
    },
  ],
  "maj9#11": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -10, 1, 0, -10],
      fingers: [0, 2, 1, 4, 3, 1],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, -1, 1, -10, 2],
      fingers: [2, 0, 0, 3, 1, 4],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 6ta Cuerda - Holdsworth Drop)",
    },
  ],
  maj13: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 1, 1, 2, -1],
      fingers: [1, 0, 2, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Voicing 1, 7, 3, 13)",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 1, 2, 2],
      fingers: [0, 1, 3, 2, 4, 4],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Voicing 1, 5, 7, 3, 13)",
    },
  ],
  "6": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, -10, 1, 0, -1],
      fingers: [2, 0, 1, 4, 3, 0],
      baseOffset: -1,
      label: "Posición 1 (Raíz 6ta Cuerda - Clásico Drop Voicing)",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 2, 2, 2],
      fingers: [0, 1, 0, 0, 0, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Bloque Positivo)",
      barres: [{ fromString: 4, toString: 1, fretOffset: 2, finger: 3 }],
    },
  ],
  m7: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 0, 0, -1],
      fingers: [1, 0, 2, 3, 4, 0],
      baseOffset: 0,
      label: "Min7 Drop 3 (R6)",
      isPro: true,
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 0, 1, -1],
      fingers: [0, 1, 3, 0, 2, 0],
      baseOffset: 0,
      label: "Min7 Drop 2 (R5)",
      isPro: true,
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 1, 0],
      fingers: [0, 1, 0, 2, 3, 0],
      baseOffset: 0,
      label: "Min9 Drop 3",
      isPro: true,
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 2, 1, 1],
      fingers: [0, 0, 0, 3, 1, 2],
      baseOffset: 0,
      label: "Min7 (R4)",
      isPro: true,
    },

    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 0, 0, 0, 0],
      fingers: [1, 3, 0, 0, 0, 0],
      baseOffset: 0,
      label: "m7 Estándar 1",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 1, 3, 0, 2, 0],
      baseOffset: 0,
      label: "m7 Estándar 2",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 2, 1, 1],
      fingers: [0, 0, 0, 3, 1, 1],
      baseOffset: 0,
      label: "m7 Estándar 3",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 2, 1, 3],
      fingers: [0, 1, 3, 4, 2, 4],
      baseOffset: 0,
      label: "m7 Estándar 4",
    },
  ],
  m13: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 0, 2, -1],
      fingers: [0, 0, 0, 0, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Omisión de 5ta)",
      barres: [{ fromString: 6, toString: 3, fretOffset: 0, finger: 1 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 1, 2],
      fingers: [0, 1, 0, 2, 3, 4],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Omisión de 5ta y 9na)",
    },
  ],
  "7": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, 0, -1],
      fingers: [1, 0, 2, 3, 0, 0],
      baseOffset: 0,
      label: "Dom7 (R6)",
      isPro: true,
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 0, 2, -1],
      fingers: [0, 1, 3, 0, 4, 0],
      baseOffset: 0,
      label: "Dom7 Drop 2",
      isPro: true,
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 1, 0, -1],
      fingers: [0, 1, 3, 2, 0, 0],
      baseOffset: 0,
      label: "9th Drop 2",
      isPro: true,
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 2, 0],
      fingers: [0, 1, 0, 2, 3, 0],
      baseOffset: 0,
      label: "Dom9 Drop 3",
      isPro: true,
    },

    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 0, 1, 0, 0],
      fingers: [1, 3, 0, 2, 0, 0],
      baseOffset: 0,
      label: "7 Estándar 1",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 1, 3, 0, 4, 0],
      baseOffset: 0,
      label: "7 Estándar 2",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      baseOffset: 0,
      label: "7 Estándar 3",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, 3, -1],
      fingers: [1, 0, 2, 3, 4, 0],
      baseOffset: 0,
      label: "7 Estándar 4",
    },
  ],
  m7b5: [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 1, 0, 1, -1],
      fingers: [0, 1, 3, 2, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Drop 2, Raíz en 5ta cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 0, -10, -1],
      fingers: [2, 0, 3, 4, 1, 0],
      baseOffset: -1,
      label: "Posición 2 (Drop 3, Raíz en 6ta cuerda)",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 1, 1, 1],
      fingers: [0, 0, 1, 2, 3, 4],
      baseOffset: 0,
      label: "Posición 3 (Drop 2, Raíz en 4ta cuerda)",
    },
  ],
  "m(maj7)": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 1, 0, 0, -1],
      fingers: [1, 0, 3, 2, 2, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 6ta Cuerda)",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 1, 1, -1],
      fingers: [0, 1, 4, 2, 3, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 2, 2, 1],
      fingers: [0, 0, 1, 3, 4, 2],
      baseOffset: 0,
      label: "Posición 3 (Raíz en 4ta Cuerda)",
    },
  ],
  dim7: [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 1, -10, 1, -1],
      fingers: [0, 2, 3, 1, 4, 0],
      baseOffset: -1,
      label: "Posición 1 (Raíz en 5ta Cuerda - Drop 2)",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 1, 0, 1],
      fingers: [0, 0, 1, 2, 1, 3],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 4ta Cuerda - Drop 2)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, -10, 0, -10, -1],
      fingers: [2, 0, 1, 3, 1, 0],
      baseOffset: -1,
      label: "Posición 3 (Raíz en 6ta Cuerda - Drop 2)",
    },
  ],


  "13": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 2, 2],
      fingers: [0, 1, 0, 1, 3, 4],
      baseOffset: 0,
      label: "Posición 1 (Raíz 5ta Cuerda - Voicing 1, b7, 3, 13)",
      barres: [{ fromString: 5, toString: 3, fretOffset: 0, finger: 1 }],
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, 2, -1],
      fingers: [1, 0, 2, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 6ta Cuerda)",
    },
  ],
  "7sus4": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 2, 0, -1],
      fingers: [1, 0, 1, 3, 1, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Grip clásico Drop 2)",
      barres: [{ fromString: 6, toString: 2, fretOffset: 0, finger: 1 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 0, 3, -1],
      fingers: [0, 1, 2, 1, 4, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Modern Comping)",
      barres: [{ fromString: 5, toString: 3, fretOffset: 0, finger: 1 }],
    },
  ],
  "13sus4": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 2, 2, -1],
      fingers: [1, 0, 1, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz 6ta Cuerda - Grip 1, b7, 4, 13)",
      barres: [{ fromString: 6, toString: 4, fretOffset: 0, finger: 1 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 3, 2],
      fingers: [0, 1, 0, 1, 4, 2],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Grip 1, b7, 4, 13 con salto de cuerda)",
      barres: [{ fromString: 5, toString: 3, fretOffset: 0, finger: 1 }],
    },
  ],
  add9: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 4, 1, -1, -1],
      fingers: [1, 3, 4, 2, 0, 0],
      baseOffset: 0,
      label: 'Posición 1 (Raíz 6ta Cuerda - "Stretch Voicing")',
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 4, 2, -1],
      fingers: [0, 1, 3, 4, 2, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Clásico Pop/Rock Drop)",
    },
  ],
  "m-add9": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, 2, 4, 0, -1, -1],
      fingers: [1, 2, 4, 1, 0, 0],
      baseOffset: 0,
      label: 'Posición 1 (Raíz 6ta Cuerda - "Stretch Voicing Menor")',
      barres: [{ fromString: 6, toString: 3, fretOffset: 0, finger: 1 }],
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 2, 4, 0, -1],
      fingers: [0, 1, 2, 4, 3, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz 5ta Cuerda - Clásico The Police/Cinemático)",
    },
  ],
  "7b9": [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -10, 0, -2, -1, -1],
      fingers: [3, 2, 4, 1, 0, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 6ta Cuerda)",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -10, 0, -10, -1],
      fingers: [0, 2, 1, 3, 1, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 5ta Cuerda)",
      barres: [{ fromString: 4, toString: 2, fretOffset: -10, finger: 1 }],
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, -10, 1, -10],
      fingers: [0, 0, 2, 1, 4, 1],
      baseOffset: 0,
      label: "Posición 3 (Raíz en 4ta Cuerda)",
      barres: [{ fromString: 3, toString: 1, fretOffset: -10, finger: 1 }],
    },
  ],
  "7#9": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -10, 0, 1, -1],
      fingers: [0, 2, 1, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -10, 0, 0, 0, -1],
      fingers: [2, 1, 3, 3, 3, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 6ta Cuerda)",
      barres: [{ fromString: 4, toString: 2, fretOffset: 0, finger: 3 }],
    },
  ],
  "7b13": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 2, 1],
      fingers: [0, 1, 0, 2, 4, 3],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, 1, -1],
      fingers: [1, 0, 1, 2, 3, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 6ta Cuerda)",
      barres: [{ fromString: 6, toString: 4, fretOffset: 0, finger: 1 }],
    },
  ],
  "7#11": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, 0, 0, -10],
      fingers: [0, 2, 0, 3, 4, 1],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, -10, -1],
      fingers: [2, 0, 3, 4, 1, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 6ta Cuerda)",
    },
  ],
  alt: [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -10, 0, -10, 1],
      fingers: [0, 2, 1, 3, 1, 4],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 0, 1, 1, 1],
      fingers: [1, 0, 1, 2, 3, 4],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 6ta Cuerda - Drop 2 Completo)",
    },
  ],
  aug: [
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 2, 1, 1, -1],
      fingers: [1, 0, 4, 2, 3, 0],
      baseOffset: 0,
      label: "Posición 1 (Raíz en 6ta Cuerda)",
    },
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 3, 2, 2, -1],
      fingers: [0, 1, 4, 2, 3, 0],
      baseOffset: 0,
      label: "Posición 2 (Raíz en 5ta Cuerda)",
    },
    {
      rootStringIndex: 2,
      fretsOffset: [-1, -1, 0, 3, 3, 2],
      fingers: [0, 0, 1, 4, 3, 2],
      baseOffset: 0,
      label: "Posición 3 (Raíz en 4ta Cuerda)",
    },
  ],
  "maj7#11": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, 1, 1, 2, -1],
      fingers: [0, 1, 2, 3, 4, 0],
      baseOffset: 0,
      label: "Posición 1 (Tónica en 5ta)",
      isPro: true,
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, 1, 1, -1, -1],
      fingers: [2, 0, 3, 4, 1, 0],
      baseOffset: -1,
      label: "Posición 2 (Drop 2, Tónica 6ta)",
      isPro: true,
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, -1, 1, -1, -1],
      fingers: [2, 0, 0, 4, 1, 1],
      baseOffset: -1,
      label: "Posición 3 (Drop 3 Variante)",
      isPro: true,
    },
  ],
  "6(9)": [
    {
      rootStringIndex: 1,
      fretsOffset: [-1, 0, -1, -1, 0, -1],
      fingers: [0, 2, 1, 1, 3, 0],
      baseOffset: -1,
      label: "Pancho Merino 1 (R5)",
    },
    {
      rootStringIndex: 0,
      fretsOffset: [0, -1, -1, -1, 0, -1],
      fingers: [2, 0, 1, 1, 3, 0],
      baseOffset: -1,
      label: "Pancho Merino 2 (R6)",
    },
  ],
};

export const CHORD_DEFINITIONS: Record<
  ChordTypeOptions,
  { suffix: string; symbol: string; chordFormula: string }
> = {
  // Majors
  Mayor: { suffix: "Tríada Mayor", symbol: "Maj", chordFormula: "1-3-5" },
  maj7: { suffix: "Mayor 7", symbol: "maj7", chordFormula: "1-3-5-7" },
  maj9: { suffix: "Mayor 9", symbol: "maj9", chordFormula: "1-3-5-7-9" },
  maj13: { suffix: "Mayor 13", symbol: "maj13", chordFormula: "1-3-5-7-9-13" },
  "maj7#11": {
    suffix: "Mayor 7#11",
    symbol: "maj7#11",
    chordFormula: "1-3-5-7-#11",
  },
  "maj9#11": {
    suffix: "Mayor 9#11",
    symbol: "maj9#11",
    chordFormula: "1-3-5-7-9-#11",
  },
  "6": { suffix: "Mayor 6", symbol: "6", chordFormula: "1-3-5-6" },
  "6(9)": { suffix: "Seis Nueve", symbol: "6(9)", chordFormula: "1-3-5-6-9" },
  // Minors
  Menor: { suffix: "Tríada Menor", symbol: "m", chordFormula: "1-b3-5" },
  m7: { suffix: "Menor 7", symbol: "m7", chordFormula: "1-b3-5-b7" },
  m9: { suffix: "Menor 9", symbol: "m9", chordFormula: "1-b3-5-b7-9" },
  m11: { suffix: "Menor 11", symbol: "m11", chordFormula: "1-b3-5-b7-9-11" },
  m13: { suffix: "Menor 13", symbol: "m13", chordFormula: "1-b3-5-b7-9-11-13" },
  m6: { suffix: "Menor 6", symbol: "m6", chordFormula: "1-b3-5-6" },
  "m(maj7)": {
    suffix: "Menor Mayor 7",
    symbol: "m(maj7)",
    chordFormula: "1-b3-5-7",
  },
  m7b5: { suffix: "Semi-dism", symbol: "m7b5", chordFormula: "1-b3-b5-b7" },
  m11b5: { suffix: "Semi-dism 11", symbol: "m11b5", chordFormula: "1-b3-b5-b7-11" },
  mb13b5: { suffix: "Semi-dism b13", symbol: "m7b5(b13)", chordFormula: "1-b3-b5-b7-b13" },
  m9b5: { suffix: "Semi-dism 9", symbol: "m9b5", chordFormula: "1-b3-b5-b7-9" },
  dim: { suffix: "Disminuido", symbol: "dim", chordFormula: "1-b3-b5" },
  dim7: { suffix: "Disminuido 7", symbol: "dim7", chordFormula: "1-b3-b5-bb7" },
  dim7_9: { suffix: "Disminuido 7(9)", symbol: "dim7(9)", chordFormula: "1-b3-b5-bb7-9" },
  dim7_11: { suffix: "Disminuido 7(11)", symbol: "dim7(11)", chordFormula: "1-b3-b5-bb7-11" },
  dim7_b13: { suffix: "Disminuido 7(b13)", symbol: "dim7(b13)", chordFormula: "1-b3-b5-bb7-b13" },
  // Dominants
  "7": { suffix: "Dominante 7", symbol: "7", chordFormula: "1-3-5-b7" },
  "9": { suffix: "Dominante 9", symbol: "9", chordFormula: "1-3-5-b7-9" },
  "13": { suffix: "Dominante 13", symbol: "13", chordFormula: "1-3-5-b7-9-13" },
  "7sus4": {
    suffix: "7 Suspendido 4",
    symbol: "7sus4",
    chordFormula: "1-4-5-b7",
  },
  "9sus4": {
    suffix: "9 Suspendido 4",
    symbol: "9sus4",
    chordFormula: "1-4-5-b7-9",
  },
  "13sus4": {
    suffix: "13 Suspendido 4",
    symbol: "13sus4",
    chordFormula: "1-4-5-b7-9-13",
  },
  // Altered
  alt: {
    suffix: "Alterado",
    symbol: "alt",
    chordFormula: "1-3-b7-(b9/#9/b5/#5)",
  },
  "7b9": { suffix: "7 bemol 9", symbol: "7b9", chordFormula: "1-3-5-b7-b9" },
  "7#9": {
    suffix: "7 sostenido 9",
    symbol: "7#9",
    chordFormula: "1-3-5-b7-#9",
  },
  "7#11": {
    suffix: "7 sostenido 11",
    symbol: "7#11",
    chordFormula: "1-3-5-b7-#11",
  },
  "7b13": {
    suffix: "7 bemol 13",
    symbol: "7b13",
    chordFormula: "1-3-5-b7-b13",
  },
  // Others
  aug: { suffix: "Aumentado", symbol: "aug", chordFormula: "1-3-#5" },
  add9: { suffix: "Add 9", symbol: "add9", chordFormula: "1-3-5-9" },
  "m-add9": {
    suffix: "Menor Add 9",
    symbol: "m-add9",
    chordFormula: "1-b3-5-9",
  },
};

export function getGuitarChordVoicing(
  root: RootNote,
  type: ChordTypeOptions,
  isPro: boolean = false,
): GuitarVoicing {
  const voicings = getGuitarChordVoicings(root, type, isPro);
  return voicings[0];
}

export function getGuitarChordFrequencies(frets: number[]): number[] {
  const baseFrequencies = [
    82.41, // E2
    110.0, // A2
    146.83, // D3
    196.0, // G3
    246.94, // B3
    329.63, // E4
  ];

  const frequencies: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (frets[i] !== -1) {
      frequencies.push(baseFrequencies[i] * Math.pow(2, frets[i] / 12));
    }
  }
  return frequencies;
}

export function getNoteNameForStringFret(
  stringIdx: number,
  fret: number,
): string {
  if (fret === -1) return "X";
  const noteMap: string[] = [
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "Bb",
    "B",
    "C",
    "C#",
    "D",
    "Eb",
  ];

  const baseMidiMap = [16, 21, 26, 31, 35, 40]; // E, A, D, G, B, e
  const noteIndex = (baseMidiMap[stringIdx] + fret - 16) % 12;
  return noteMap[noteIndex];
}

export const advancedChordsData: {
  root: RootNote;
  type: ChordTypeOptions;
  label: string;
  startingFret: number;
  frets: number[];
  fingers?: number[];
  barres?: Barre[];
}[] = [
  {
    root: "C",
    type: "maj9",
    label: "Cmaj9 (Posición 1)",
    startingFret: 2,
    frets: [-1, 3, 2, 4, 3, -1], // X, C, E, B, D
    fingers: [0, 2, 1, 4, 3, 0],
  },
  {
    root: "C",
    type: "maj9",
    label: "Cmaj9 (Posición 2)",
    startingFret: 7,
    frets: [8, 7, 9, 7, -1, -1], // C, E, B, D, X, X
    fingers: [2, 1, 4, 1, 0, 0],
  },
  {
    root: "C",
    type: "6(9)",
    label: "C6(9) (Posición 1)",
    startingFret: 2,
    frets: [-1, 3, 2, 2, 3, -1], // X, C, E, A, D
    fingers: [0, 2, 1, 1, 3, 0],
  },
  {
    root: "C",
    type: "6(9)",
    label: "C6(9) (Posición 2)",
    startingFret: 7,
    frets: [8, 7, 7, 7, -1, -1], // C, E, A, D, X, X
    fingers: [2, 1, 1, 1, 0, 0],
  },
  {
    root: "C",
    type: "maj7#11",
    label: "Cmaj7#11 (Posición 1)",
    startingFret: 3,
    frets: [-1, 3, 4, 4, 5, -1],
    fingers: [0, 1, 2, 3, 4, 0],
  },
  {
    root: "C",
    type: "maj7#11",
    label: "Cmaj7#11 (Drop 2)",
    startingFret: 7,
    frets: [8, -1, 9, 9, 7, -1],
    fingers: [2, 0, 3, 4, 1, 0],
  },
  {
    root: "C",
    type: "maj7#11",
    label: "Cmaj7#11 (Variante Drop 3)",
    startingFret: 7,
    frets: [8, -1, -1, 9, 7, 7],
    fingers: [2, 0, 0, 4, 1, 1],
  },
  {
    root: "C",
    type: "maj7#11",
    label: "Cmaj7#11 (Stretch Lidio)",
    startingFret: 2,
    frets: [-1, 3, -1, 4, 5, 2],
    fingers: [-1, 2, -1, 3, 4, 1],
  },
  {
    root: "C",
    type: "13",
    label: "Posición 1 (Tónica 5ta cuerda)",
    startingFret: 3,
    frets: [-1, 3, -1, 3, 5, 5],
    fingers: [0, 1, 0, 1, 3, 4],
    barres: [{ fromString: 5, toString: 3, fret: 3, finger: 1 }],
  },
  {
    root: "C",
    type: "13",
    label: "Posición 2 (Tónica 6ta cuerda)",
    startingFret: 8,
    frets: [8, -1, 8, 9, 10, -1],
    fingers: [1, 0, 2, 3, 4, 0],
  },

  {
    root: "C",
    type: "9sus4",
    label: "Posición 1 (Tónica 5ta cuerda - Cejilla)",
    startingFret: 3,
    frets: [-1, 3, 3, 3, 3, -1],
    fingers: [0, 1, 1, 1, 1, 0],
  },
  {
    root: "C",
    type: "9sus4",
    label: "Posición 2 (Tónica 6ta cuerda - Gm7/C)",
    startingFret: 7,
    frets: [8, -1, 8, 7, 8, -1],
    fingers: [2, 0, 3, 1, 4, 0],
  },
  {
    root: "C",
    type: "m6",
    label: "Posición 1 (Tónica 5ta cuerda)",
    startingFret: 1,
    frets: [-1, 3, 1, 2, 1, -1],
    fingers: [0, 3, 1, 2, 1, 0], // guessed nice fingers
  },
  {
    root: "C",
    type: "m6",
    label: "Posición 2 (Tónica 6ta cuerda)",
    startingFret: 7,
    frets: [8, -1, 7, 8, 8, -1],
    fingers: [2, 0, 1, 3, 4, 0], // typical drop 2 shape
  },
  {
    root: "C",
    type: "m9",
    label: "Posición 1 (Tónica 5ta cuerda)",
    startingFret: 1,
    frets: [-1, 3, 1, 3, 3, -1],
    fingers: [0, 2, 1, 3, 4, 0],
  },
  {
    root: "C",
    type: "m9",
    label: "Posición 2 (Tónica 6ta cuerda)",
    startingFret: 8,
    frets: [8, -1, 8, 8, 8, 10],
    fingers: [1, 0, 1, 1, 1, 4], // cejilla on 8, pinky on 10
  },
  {
    root: "C",
    type: "m11",
    label: "Posición 1 (Tónica 5ta cuerda)",
    startingFret: 3,
    frets: [-1, 3, 3, 3, 4, -1],
    fingers: [0, 1, 1, 1, 2, 0],
  },
  {
    root: "C",
    type: "m11",
    label: "Posición 2 (Tónica 6ta cuerda)",
    startingFret: 6,
    frets: [8, -1, 8, 8, 6, -1],
    fingers: [3, 0, 4, 4, 1, 0],
  },
  {
    root: "C",
    type: "9",
    label: "Posición 1 (Tónica 5ta cuerda)",
    startingFret: 2,
    frets: [-1, 3, 2, 3, 3, -1],
    fingers: [0, 2, 1, 3, 4, 0],
  },
  {
    root: "C",
    type: "9",
    label: "Posición 2 (Tónica 6ta cuerda)",
    startingFret: 5,
    frets: [8, -1, 8, 7, 5, -1],
    fingers: [4, 0, 3, 2, 1, 0],
  },
];

export function getGuitarChordVoicings(
  root: RootNote,
  type: ChordTypeOptions,
  isProFilter: boolean = false,
): GuitarVoicing[] {
  // Check mock advanced patterns first
  const rootOffsets: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const offset = rootOffsets[root] || 0;

  // We use the "C" templates from advancedChordsData as the base movable shapes
  const advancedBaseMatches = advancedChordsData.filter(
    (d) => d.root === "C" && d.type === type,
  );

  if (advancedBaseMatches.length > 0) {
    return advancedBaseMatches.map((data) => {
      let shift = offset;

      // Keep the shapes within the 1st and 12th fret range generally
      if (data.startingFret + shift > 12) {
        shift -= 12;
      }

      const newStartingFret = data.startingFret + shift;
      const newFrets = data.frets.map((f) => (f !== -1 ? f + shift : -1));

      const fingers = data.fingers && data.fingers.length === 6 
        ? [...data.fingers] 
        : newFrets.map((f) => (f !== -1 ? 1 : 0));
      const mutes = newFrets.map((f) => f === -1);

      const activeFrets = newFrets.filter((f) => f > 0);
      let calculatedBaseFretNum = activeFrets.length > 0 ? Math.min(...activeFrets) : newStartingFret;

      return {
        frets: newFrets,
        fingers: fingers,
        baseFret: ROMAN_NUMERALS[calculatedBaseFretNum] || calculatedBaseFretNum.toString(),
        mutes: mutes,
        label: data.label.replace(/^C/, root),
        isPro: false,
      };
    });
  }

  const allTemplatesForType = MOVABLE_TEMPLATES[type] || [];

  let templates = allTemplatesForType;
  if (isProFilter) {
    templates = allTemplatesForType.filter((t) => t.isPro);
  } else {
    templates = allTemplatesForType.filter((t) => !t.isPro);
  }

  if (templates.length === 0) {
    return [];
  }

  return templates.map((template) => {
    let rootFret = 0;

    if (template.rootStringIndex === 0) {
      rootFret = ROOT_MIDI_OFFSET_MAP[root] - 4;
      if (rootFret < 0) rootFret += 12;
    } else if (template.rootStringIndex === 1) {
      rootFret = ROOT_MIDI_OFFSET_MAP[root] + 3;
      if (rootFret > 11) rootFret -= 12;
    } else if (template.rootStringIndex === 2) {
      rootFret = (ROOT_MIDI_OFFSET_MAP[root] - 2 + 12) % 12;
    } else if (template.rootStringIndex === 3) {
      rootFret = (ROOT_MIDI_OFFSET_MAP[root] - 7 + 12) % 12;
    }

    if (rootFret === 0) {
      rootFret = 12; // Mover 0 a 12 para evitar trastes vacíos en acordes móviles
    }

    const frets = [...template.fretsOffset];
    const mutes = [false, false, false, false, false, false];

    // Compute absolute frets
    for (let s = 0; s < 6; s++) {
      if (frets[s] === -10) {
        frets[s] = rootFret - 1;
      } else if (frets[s] !== -1) {
        frets[s] += rootFret;
      } else {
        mutes[s] = true;
      }
    }

    const activeFrets = frets.filter((f) => f > 0);
    let baseFretNum = activeFrets.length > 0 ? Math.min(...activeFrets) : rootFret;
    if (baseFretNum < 1) baseFretNum = 1;

    return {
      frets,
      fingers: template.fingers,
      baseFret: ROMAN_NUMERALS[baseFretNum] || baseFretNum.toString(),
      mutes,
      label: template.label,
      isPro: template.isPro,
      barres: template.barres?.map(b => ({
        fromString: b.fromString,
        toString: b.toString,
        fret: b.fretOffset === -10 ? rootFret - 1 : rootFret + (b.fretOffset || 0),
        finger: b.finger
      }))
    };
  });
}
