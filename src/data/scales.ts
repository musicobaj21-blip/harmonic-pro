export type ScaleDefinition = {
  name: string;
  intervals: number[];
  relatedChords: string[];
};

export type ScaleCategory = {
  category: string;
  scales: ScaleDefinition[];
};

export const EXPLORER_CATEGORIES: ScaleCategory[] = [
  {
    category: "Modos de la Escala Mayor",
    scales: [
      { name: "Jónica (Mayor)", intervals: [0, 2, 4, 5, 7, 9, 11], relatedChords: ["Maj7", "Mayor", "6", "Maj9"] },
      { name: "Dórica", intervals: [0, 2, 3, 5, 7, 9, 10], relatedChords: ["m7", "m6", "m9", "m11"] },
      { name: "Frigia", intervals: [0, 1, 3, 5, 7, 8, 10], relatedChords: ["m7", "m7b9", "sus4b9"] },
      { name: "Lidia", intervals: [0, 2, 4, 6, 7, 9, 11], relatedChords: ["Maj7#11", "Maj7"] },
      { name: "Mixolidia", intervals: [0, 2, 4, 5, 7, 9, 10], relatedChords: ["7", "9", "13", "7sus4"] },
      { name: "Eólica (Menor Antigua)", intervals: [0, 2, 3, 5, 7, 8, 10], relatedChords: ["m7", "m9", "m11"] },
      { name: "Locria", intervals: [0, 1, 3, 5, 6, 8, 10], relatedChords: ["m7b5", "dim"] }
    ]
  },
  {
    category: "Modos de la Menor Melódica",
    scales: [
      { name: "Menor Melódica", intervals: [0, 2, 3, 5, 7, 9, 11], relatedChords: ["m(Maj7)", "m6"] },
      { name: "Dórica b2 (Frigia ♮6)", intervals: [0, 1, 3, 5, 7, 9, 10], relatedChords: ["sus4b9", "m7b9"] },
      { name: "Lidia Aumentada", intervals: [0, 2, 4, 6, 8, 9, 11], relatedChords: ["Maj7#5"] },
      { name: "Lidia b7 (Lidia Dominante)", intervals: [0, 2, 4, 6, 7, 9, 10], relatedChords: ["7#11", "9#11", "13#11"] },
      { name: "Mixolidia b13 (Mixolidia b6)", intervals: [0, 2, 4, 5, 7, 8, 10], relatedChords: ["7b13"] },
      { name: "Locria ♮2", intervals: [0, 2, 3, 5, 6, 8, 10], relatedChords: ["m7b5"] },
      { name: "Alterada (Superlocria)", intervals: [0, 1, 3, 4, 6, 8, 10], relatedChords: ["7alt", "7#9", "7b9", "7b13"] }
    ]
  },
  {
    category: "Modos de la Menor Armónica",
    scales: [
      { name: "Menor Armónica", intervals: [0, 2, 3, 5, 7, 8, 11], relatedChords: ["m(Maj7)", "m(add b6)"] },
      { name: "Locria ♮6", intervals: [0, 1, 3, 5, 6, 9, 10], relatedChords: ["m7b5", "dim"] },
      { name: "Jónica Aumentada", intervals: [0, 2, 4, 5, 8, 9, 11], relatedChords: ["Maj7#5"] },
      { name: "Dórica #4 (Ucraniana)", intervals: [0, 2, 3, 6, 7, 9, 10], relatedChords: ["m7", "m6"] },
      { name: "Frigia Dominante", intervals: [0, 1, 4, 5, 7, 8, 10], relatedChords: ["7b9", "7b13"] },
      { name: "Lidia #2", intervals: [0, 3, 4, 6, 7, 9, 11], relatedChords: ["Maj7#11"] },
      { name: "Superlocria bb7", intervals: [0, 1, 3, 4, 6, 8, 9], relatedChords: ["dim7"] }
    ]
  },
  {
    category: "Simétricas y Pentatónicas",
    scales: [
      { name: "Disminuida (semitono-tono)", intervals: [0, 1, 3, 4, 6, 7, 9, 10], relatedChords: ["dim7"] },
      { name: "Dominante Disminuida (tono-semitono)", intervals: [0, 2, 3, 5, 6, 8, 9, 11], relatedChords: ["7b9", "7#9", "13b9"] },
      { name: "Tonal (tono-tono)", intervals: [0, 2, 4, 6, 8, 10], relatedChords: ["7#5", "7b5", "9#5"] },
      { name: "Escala de Blues", intervals: [0, 3, 5, 6, 7, 10], relatedChords: ["7", "m7", "7#9"] },
      { name: "Pentatónica Mayor", intervals: [0, 2, 4, 7, 9], relatedChords: ["Mayor", "Maj7", "6"] },
      { name: "Pentatónica Menor", intervals: [0, 3, 5, 7, 10], relatedChords: ["Menor", "m7"] },
      { name: "Bebop Dominante", intervals: [0, 2, 4, 5, 7, 9, 10, 11], relatedChords: ["7", "9", "13", "7b9"] },
      { name: "Bebop Mayor", intervals: [0, 2, 4, 5, 7, 8, 9, 11], relatedChords: ["Maj7", "6"] }
    ]
  },
  {
    category: "Arpegios",
    scales: [
      { name: "Arpegio Tríada Mayor (1 - 3 - 5)", intervals: [0, 4, 7], relatedChords: ["Mayor"] },
      { name: "Arpegio Tétrada (Maj7) (1 - 3 - 5 - 7)", intervals: [0, 4, 7, 11], relatedChords: ["Maj7"] },
      { name: "Arpegio Tríada Menor (1 - b3 - 5)", intervals: [0, 3, 7], relatedChords: ["Menor"] },
      { name: "Arpegio Tétrada (m7) (1 - b3 - 5 - b7)", intervals: [0, 3, 7, 10], relatedChords: ["m7"] },
      { name: "Arpegio Tétrada (7) (1 - 3 - 5 - b7)", intervals: [0, 4, 7, 10], relatedChords: ["7"] },
      { name: "Arpegio Tétrada (m7b5) (1 - b3 - b5 - b7)", intervals: [0, 3, 6, 10], relatedChords: ["m7b5"] },
      { name: "Arpegio Tétrada (dim7) (1 - b3 - b5 - bb7)", intervals: [0, 3, 6, 9], relatedChords: ["dim7"] }
    ]
  }
];
