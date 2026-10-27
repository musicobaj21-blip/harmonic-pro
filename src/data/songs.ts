import { Song, SongMeasure, RootNote } from "../types";

/**
 * Convierte bloques de secciones en estilo The New Real Book (ej. "[Sección A]: Am6 | Am6 | Dm6 | Dm6...")
 * en un arreglo completo de SongMeasure[] con soporte nativo para 1 o 2 acordes por compás (Redondas / Blancas)
 * y etiquetas de sección ([Sección A], [Sección B], [Sección C], [Sección D]).
 */
function buildRealBookMeasures(
  sectionBlocks: Array<{
    label: string;
    bars: string;
    modulations?: Record<number, { key: RootNote; isMinor: boolean }>;
  }>
): { measures: SongMeasure[]; sections: Record<string, number> } {
  const measures: SongMeasure[] = [];
  const sections: Record<string, number> = {};
  const labelCounts: Record<string, number> = {};

  for (const block of sectionBlocks) {
    const rawBars = block.bars
      .split("|")
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const startIndex = measures.length;
    const cleanLabel = block.label.replace(/^\[|\]$/g, "").trim();
    labelCounts[cleanLabel] = (labelCounts[cleanLabel] || 0) + 1;
    const sectionKey =
      labelCounts[cleanLabel] === 1
        ? cleanLabel
        : `${cleanLabel} (${labelCounts[cleanLabel]})`;
    sections[sectionKey] = startIndex;

    rawBars.forEach((barStr, localIdx) => {
      const globalIdx = measures.length;
      const chords = barStr
        .split(/\s+/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const measure: SongMeasure = {
        id: String(globalIdx + 1),
        chords: chords.length > 0 ? chords : [""],
      };

      if (localIdx === 0 && cleanLabel) {
        measure.sectionLabel = `[${cleanLabel}]`;
      }

      if (block.modulations && block.modulations[localIdx]) {
        measure.modulateTo = block.modulations[localIdx];
      }

      measures.push(measure);
    });
  }

  return { measures, sections };
}

function createRealBookSong(config: {
  id: string;
  title: string;
  defaultKey: RootNote;
  defaultIsMinor?: boolean;
  style: string;
  tempo: number;
  timeSignature?: string;
  blocks: Array<{
    label: string;
    bars: string;
    modulations?: Record<number, { key: RootNote; isMinor: boolean }>;
  }>;
}): Song {
  const { measures, sections } = buildRealBookMeasures(config.blocks);
  return {
    id: config.id,
    title: config.title,
    defaultKey: config.defaultKey,
    defaultIsMinor: config.defaultIsMinor,
    style: config.style,
    tempo: config.tempo,
    timeSignature: config.timeSignature || "4/4",
    measures,
    sections,
  };
}

/**
 * Clasifica cada estándar en su categoría estilística para organizar el selector con <optgroup>.
 */
export function getSongCategoryGroup(song: Song): string {
  if (song.isCustom || song.id.startsWith("custom-")) {
    return "Mis Progresiones Personalizadas";
  }
  const style = (song.style || "").toLowerCase();
  const id = song.id;

  if (style.includes("gypsy")) {
    return "Gypsy Jazz / Manouche";
  }
  if (
    style.includes("bossa") ||
    style.includes("latin") ||
    style.includes("afro") ||
    style.includes("samba")
  ) {
    return "Bossa Nova & Latin Jazz";
  }
  if (
    style.includes("funk") ||
    style.includes("soul") ||
    style.includes("blues")
  ) {
    return "Funk, Soul Jazz & Blues";
  }
  if (
    style.includes("modal") ||
    ["so-what", "impressions", "maiden-voyage", "nardis"].includes(id)
  ) {
    return "Modal & Post-Bop";
  }
  if (
    style.includes("ballad") ||
    [
      "misty",
      "my-funny-valentine",
      "body-and-soul",
      "blue-in-green",
    ].includes(id)
  ) {
    return "Baladas de Jazz";
  }
  if (
    style.includes("up-tempo") ||
    style.includes("fast") ||
    style.includes("bebop") ||
    [
      "giant-steps",
      "cherokee",
      "oleo",
      "confirmation",
      "sweet-georgia-brown",
    ].includes(id)
  ) {
    return "Bebop & Up-Tempo Swing";
  }
  return "Estándares de Jazz / Swing";
}

/**
 * COLECCIÓN DE 50 PROGRESIONES COMPLETAS (The New Real Book & iReal Pro Edition Auditada)
 */
export const JAZZ_STANDARDS: Song[] = [
  // ==========================================================================
  // 1-5: LOS 5 ESTÁNDARES ORIGINALES
  // ==========================================================================
  {
    id: "autumn-leaves",
    title: "Autumn Leaves",
    defaultKey: "G",
    style: "Medium Swing",
    tempo: 120,
    measures: [
      { id: "1", chords: ["Am7"], sectionLabel: "[Sección A]" },
      { id: "2", chords: ["D7"] },
      { id: "3", chords: ["Gmaj7"] },
      { id: "4", chords: ["Cmaj7"] },
      { id: "5", chords: ["F#m7b5"], modulateTo: { key: "E", isMinor: true } },
      { id: "6", chords: ["B7"] },
      { id: "7", chords: ["Em7"] },
      { id: "8", chords: ["Em7"] },
      {
        id: "9",
        chords: ["Am7"],
        sectionLabel: "[Sección A]",
        modulateTo: { key: "G", isMinor: false },
      },
      { id: "10", chords: ["D7"] },
      { id: "11", chords: ["Gmaj7"] },
      { id: "12", chords: ["Cmaj7"] },
      { id: "13", chords: ["F#m7b5"], modulateTo: { key: "E", isMinor: true } },
      { id: "14", chords: ["B7"] },
      { id: "15", chords: ["Em7"] },
      { id: "16", chords: ["Em7"] },
      { id: "17", chords: ["F#m7b5"], sectionLabel: "[Sección B]" },
      { id: "18", chords: ["B7"] },
      { id: "19", chords: ["Em7"] },
      { id: "20", chords: ["Em7"] },
      { id: "21", chords: ["Am7"], modulateTo: { key: "G", isMinor: false } },
      { id: "22", chords: ["D7"] },
      { id: "23", chords: ["Gmaj7"] },
      { id: "24", chords: ["Gmaj7"] },
      {
        id: "25",
        chords: ["F#m7b5"],
        sectionLabel: "[Sección C]",
        modulateTo: { key: "E", isMinor: true },
      },
      { id: "26", chords: ["B7"] },
      { id: "27", chords: ["Em7", "A7"] },
      { id: "28", chords: ["Dm7", "G7"] },
      { id: "29", chords: ["Cmaj7"] },
      { id: "30", chords: ["F#m7b5", "B7"] },
      { id: "31", chords: ["Em7"] },
      { id: "32", chords: ["Em7"] },
    ],
    sections: {
      "Sección A": 0,
      "Sección B": 16,
      "Sección C": 24,
    },
  },
  {
    id: "blue-bossa",
    title: "Blue Bossa",
    defaultKey: "C",
    defaultIsMinor: true,
    style: "Bossa Nova",
    tempo: 130,
    measures: [
      { id: "1", chords: ["Cm7"], sectionLabel: "[Sección A]" },
      { id: "2", chords: ["Cm7"] },
      { id: "3", chords: ["Fm7"] },
      { id: "4", chords: ["Fm7"] },
      { id: "5", chords: ["Dm7b5"] },
      { id: "6", chords: ["G7"] },
      { id: "7", chords: ["Cm7"] },
      { id: "8", chords: ["Cm7"] },
      {
        id: "9",
        chords: ["Ebm7"],
        sectionLabel: "[Sección B]",
        modulateTo: { key: "Db", isMinor: false },
      },
      { id: "10", chords: ["Ab7"] },
      { id: "11", chords: ["Dbmaj7"] },
      { id: "12", chords: ["Dbmaj7"] },
      { id: "13", chords: ["Dm7b5"], modulateTo: { key: "C", isMinor: true } },
      { id: "14", chords: ["G7"] },
      { id: "15", chords: ["Cm7"] },
      { id: "16", chords: ["Dm7b5", "G7"] },
    ],
    sections: {
      "Sección A": 0,
      "Sección B": 8,
    },
  },
  {
    id: "misty",
    title: "Misty",
    defaultKey: "Eb",
    style: "Slow Ballad",
    tempo: 70,
    measures: [
      { id: "1", chords: ["Ebmaj7"], sectionLabel: "[Sección A]" },
      { id: "2", chords: ["Bbm7", "Eb7"] },
      { id: "3", chords: ["Abmaj7"] },
      { id: "4", chords: ["Abm7", "Db7"] },
      { id: "5", chords: ["Ebmaj7", "Cm7"] },
      { id: "6", chords: ["Fm7", "Bb7"] },
      { id: "7", chords: ["G7", "C7"] },
      { id: "8", chords: ["Fm7", "Bb7"] },
      { id: "9", chords: ["Ebmaj7"], sectionLabel: "[Sección A]" },
      { id: "10", chords: ["Bbm7", "Eb7"] },
      { id: "11", chords: ["Abmaj7"] },
      { id: "12", chords: ["Abm7", "Db7"] },
      { id: "13", chords: ["Ebmaj7", "Cm7"] },
      { id: "14", chords: ["Fm7", "Bb7"] },
      { id: "15", chords: ["Ebmaj7"] },
      { id: "16", chords: ["Ebmaj7"] },
      { id: "17", chords: ["Bbm7"], sectionLabel: "[Sección B]" },
      { id: "18", chords: ["Eb7"] },
      { id: "19", chords: ["Abmaj7"] },
      { id: "20", chords: ["Abmaj7"] },
      { id: "21", chords: ["Am7"] },
      { id: "22", chords: ["D7", "C7"] },
      { id: "23", chords: ["Fm7"] },
      { id: "24", chords: ["Bb7"] },
      { id: "25", chords: ["Ebmaj7"], sectionLabel: "[Sección A]" },
      { id: "26", chords: ["Bbm7", "Eb7"] },
      { id: "27", chords: ["Abmaj7"] },
      { id: "28", chords: ["Abm7", "Db7"] },
      { id: "29", chords: ["Ebmaj7", "Cm7"] },
      { id: "30", chords: ["Fm7", "Bb7"] },
      { id: "31", chords: ["Ebmaj7"] },
      { id: "32", chords: ["Fm7", "Bb7"] },
    ],
    sections: {
      "Sección A": 0,
      "Sección B": 16,
      "Sección A final": 24,
    },
  },
  {
    id: "my-funny-valentine",
    title: "My Funny Valentine",
    defaultKey: "C",
    defaultIsMinor: true,
    style: "Jazz Ballad",
    tempo: 75,
    measures: [
      { id: "1", chords: ["Cm"], sectionLabel: "[Sección A]" },
      { id: "2", chords: ["Cm(maj7)"] },
      { id: "3", chords: ["Cm7"] },
      { id: "4", chords: ["Cm6"] },
      { id: "5", chords: ["Abmaj7"] },
      { id: "6", chords: ["Fm7"] },
      { id: "7", chords: ["Dm7b5"] },
      { id: "8", chords: ["G7"] },
      { id: "9", chords: ["Cm"], sectionLabel: "[Sección A]" },
      { id: "10", chords: ["Cm(maj7)"] },
      { id: "11", chords: ["Cm7"] },
      { id: "12", chords: ["Cm6"] },
      { id: "13", chords: ["Abmaj7"] },
      { id: "14", chords: ["Fm7"] },
      { id: "15", chords: ["Fm7b5"] },
      { id: "16", chords: ["Bb7"] },
      {
        id: "17",
        chords: ["Ebmaj7"],
        sectionLabel: "[Sección B]",
        modulateTo: { key: "Eb", isMinor: false },
      },
      { id: "18", chords: ["Fm7", "Bb7"] },
      { id: "19", chords: ["Ebmaj7"] },
      { id: "20", chords: ["Fm7", "Bb7"] },
      { id: "21", chords: ["Ebmaj7"] },
      { id: "22", chords: ["G7"], modulateTo: { key: "C", isMinor: true } },
      { id: "23", chords: ["Cm7"] },
      { id: "24", chords: ["Bbm7", "Eb7"] },
      { id: "25", chords: ["Abmaj7"], sectionLabel: "[Sección C]" },
      { id: "26", chords: ["Dm7b5", "G7"] },
      { id: "27", chords: ["Cm7", "F7"] },
      { id: "28", chords: ["Bbm7", "Eb7"] },
      { id: "29", chords: ["Abmaj7"] },
      { id: "30", chords: ["Fm7", "Bb7"] },
      { id: "31", chords: ["Ebmaj7"] },
      { id: "32", chords: ["Dm7b5", "G7"] },
    ],
    sections: {
      "Sección A": 0,
      "Sección B": 16,
      "Sección C": 24,
    },
  },
  {
    id: "fly-me-to-the-moon",
    title: "Fly Me to the Moon",
    defaultKey: "C",
    style: "Medium Swing",
    tempo: 120,
    measures: [
      { id: "1", chords: ["Am7"], sectionLabel: "[Sección A]" },
      { id: "2", chords: ["Dm7"] },
      { id: "3", chords: ["G7"] },
      { id: "4", chords: ["Cmaj7"] },
      { id: "5", chords: ["Fmaj7"] },
      { id: "6", chords: ["Bm7b5"] },
      { id: "7", chords: ["E7"] },
      { id: "8", chords: ["Am7", "A7"] },
      { id: "9", chords: ["Dm7"], sectionLabel: "[Sección B]" },
      { id: "10", chords: ["G7"] },
      { id: "11", chords: ["Cmaj7"] },
      { id: "12", chords: ["Am7"] },
      { id: "13", chords: ["Dm7"] },
      { id: "14", chords: ["G7"] },
      { id: "15", chords: ["Cmaj7"] },
      { id: "16", chords: ["Bm7b5", "E7"] },
      { id: "17", chords: ["Am7"], sectionLabel: "[Sección A]" },
      { id: "18", chords: ["Dm7"] },
      { id: "19", chords: ["G7"] },
      { id: "20", chords: ["Cmaj7"] },
      { id: "21", chords: ["Fmaj7"] },
      { id: "22", chords: ["Bm7b5"] },
      { id: "23", chords: ["E7"] },
      { id: "24", chords: ["Am7", "A7"] },
      { id: "25", chords: ["Dm7"], sectionLabel: "[Sección C]" },
      { id: "26", chords: ["G7"] },
      { id: "27", chords: ["Em7b5"] },
      { id: "28", chords: ["A7"] },
      { id: "29", chords: ["Dm7"] },
      { id: "30", chords: ["G7"] },
      { id: "31", chords: ["Cmaj7"] },
      { id: "32", chords: ["Bm7b5", "E7"] },
    ],
    sections: {
      "Sección A": 0,
      "Sección B": 8,
      "Sección C": 24,
    },
  },

  // ==========================================================================
  // 6-23: LAS 18 CANCIONES PRIORITARIAS OBLIGATORIAS
  // ==========================================================================

  // 1. Minor Swing (Gypsy Jazz - Am - 190 BPM - 16 compases)
  createRealBookSong({
    id: "minor-swing",
    title: "Minor Swing",
    defaultKey: "A",
    defaultIsMinor: true,
    style: "Gypsy Jazz",
    tempo: 190,
    blocks: [
      {
        label: "Sección A",
        bars: "Am6 | Am6 | Dm6 | Dm6 | E7 | E7 | Am6 | Am6",
      },
      {
        label: "Sección B",
        bars: "Dm6 | Dm6 | Am6 | Am6 | B7 | E7 | Am6 | E7",
      },
    ],
  }),

  // 2. Days of Wine and Roses (Exacto a iReal Pro: Fmaj7 | Eb7#11 | D7 | D7b9 | Gm7 | Gm7 | Bbm7 | Eb9...)
  createRealBookSong({
    id: "days-of-wine-and-roses",
    title: "Days of Wine and Roses",
    defaultKey: "F",
    style: "Medium Swing",
    tempo: 130,
    blocks: [
      {
        label: "Sección A",
        bars: "Fmaj7 | Eb7#11 | D7 | D7b9 | Gm7 | Gm7 | Bbm7 | Eb9",
      },
      {
        label: "Sección B",
        bars: "Am7 | Dm7 | Gm7 | C7 | Em7b5 A7b9 | Dm7 G7 | Gm7 | C7",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | Eb7#11 | D7 | D7b9 | Gm7 | Gm7 | Bbm7 | Eb9",
      },
      {
        label: "Sección C",
        bars: "Am7 | Dm7 | Bm7b5 | E7b9 | Am7 Dm7 | Gm7 C7 | F6 D7 | Gm7 C7",
      },
    ],
  }),

  // 3. Giant Steps (Up-Tempo Swing - B / G / Eb - 220 BPM - 16 compases)
  createRealBookSong({
    id: "giant-steps",
    title: "Giant Steps",
    defaultKey: "B",
    style: "Up-Tempo Swing",
    tempo: 220,
    blocks: [
      {
        label: "Sección A",
        bars: "Bmaj7 D7 | Gmaj7 Bb7 | Ebmaj7 | Am7 D7 | Gmaj7 Bb7 | Ebmaj7 F#7 | Bmaj7 | Fm7 Bb7",
      },
      {
        label: "Sección B",
        bars: "Ebmaj7 | Am7 D7 | Gmaj7 | C#m7 F#7 | Bmaj7 | Fm7 Bb7 | Ebmaj7 | C#m7 F#7",
      },
    ],
  }),

  // 4. All the Things You Are (Medium Swing - Ab - 135 BPM - 36 compases AABA)
  createRealBookSong({
    id: "all-the-things-you-are",
    title: "All the Things You Are",
    defaultKey: "Ab",
    style: "Medium Swing",
    tempo: 135,
    blocks: [
      {
        label: "Sección A",
        bars: "Fm7 | Bbm7 | Eb7 | Abmaj7 | Dbmaj7 | Dm7 G7 | Cmaj7 | Cmaj7",
      },
      {
        label: "Sección A",
        bars: "Cm7 | Fm7 | Bb7 | Ebmaj7 | Abmaj7 | Am7 D7 | Gmaj7 | Gmaj7",
      },
      {
        label: "Sección B",
        bars: "Am7 | D7 | Gmaj7 | Gmaj7 | F#m7b5 | B7b9 | Emaj7 | C7b9",
      },
      {
        label: "Sección A",
        bars: "Fm7 | Bbm7 | Eb7 | Abmaj7 | Dbmaj7 | Dbm7 | Cm7 | Bdim7 | Bbm7 | Eb7 | Abmaj7 | G7b9 C7b9",
      },
    ],
  }),

  // 5. Cherokee (Fast Swing - Bb - 240 BPM - 64 compases AABA de 16 compases por sección)
  createRealBookSong({
    id: "cherokee",
    title: "Cherokee",
    defaultKey: "Bb",
    style: "Fast Swing",
    tempo: 240,
    blocks: [
      {
        label: "Sección A",
        bars: "Bbmaj7 | Bbmaj7 | Fm7 | Bb7 | Ebmaj7 | Ebmaj7 | Ab9 | Ab9 | Bbmaj7 | Gm7 | C7 | C7 | Cm7 | F7 | Bbmaj7 | Cm7 F7",
      },
      {
        label: "Sección A",
        bars: "Bbmaj7 | Bbmaj7 | Fm7 | Bb7 | Ebmaj7 | Ebmaj7 | Ab9 | Ab9 | Bbmaj7 | Gm7 | C7 | C7 | Cm7 | F7 | Bbmaj7 | Bbmaj7",
      },
      {
        label: "Sección B",
        bars: "C#m7 | F#7 | Bmaj7 | Bmaj7 | Bm7 | E7 | Amaj7 | Amaj7 | Am7 | D7 | Gmaj7 | Gmaj7 | Gm7 | C7 | Cm7 | F7",
      },
      {
        label: "Sección A",
        bars: "Bbmaj7 | Bbmaj7 | Fm7 | Bb7 | Ebmaj7 | Ebmaj7 | Ab9 | Ab9 | Bbmaj7 | Gm7 | C7 | C7 | Cm7 | F7 | Bbmaj7 | Cm7 F7",
      },
    ],
  }),

  // 6. It Could Happen to You (Medium Swing - Eb - 135 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "it-could-happen-to-you",
    title: "It Could Happen to You",
    defaultKey: "Eb",
    style: "Medium Swing",
    tempo: 135,
    blocks: [
      {
        label: "Sección A",
        bars: "Ebmaj7 | Gm7b5 C7b9 | Fm7 | Am7b5 D7b9 | Ebmaj7 | Abmaj7 | Gm7b5 | C7b9",
      },
      {
        label: "Sección B",
        bars: "Fm7 | Db7#11 | Ebmaj7 | Cm7 | F7 | F7 | Fm7 | Bb7",
      },
      {
        label: "Sección A",
        bars: "Ebmaj7 | Gm7b5 C7b9 | Fm7 | Am7b5 D7b9 | Ebmaj7 | Abmaj7 | Gm7b5 | C7b9",
      },
      {
        label: "Sección C",
        bars: "Fm7 | Db7#11 | Ebmaj7 Dm7b5 | G7b9 Cm7 | Fm7 | Bb7 | Ebmaj7 | Fm7 Bb7",
      },
    ],
  }),

  // 7. Sunny (Funk / Soul - Am - 120 BPM - 16 compases)
  createRealBookSong({
    id: "sunny",
    title: "Sunny",
    defaultKey: "A",
    defaultIsMinor: true,
    style: "Funk / Soul",
    tempo: 120,
    blocks: [
      {
        label: "Sección A",
        bars: "Am7 | Gm7 C7 | Fmaj7 | Bm7b5 E7 | Am7 | Gm7 C7 | Fmaj7 | Bm7b5 E7",
      },
      {
        label: "Sección B",
        bars: "Am7 | Gm7 C7 | Fmaj7 | Bb7 | Bm7b5 | E7b9 | Am7 | E7#9",
      },
    ],
  }),

  // 8. Softly, as in a Morning Sunrise (Medium Swing - Cm - 140 BPM - 32 compases AABA)
  createRealBookSong({
    id: "softly-as-in-a-morning-sunrise",
    title: "Softly, as in a Morning Sunrise",
    defaultKey: "C",
    defaultIsMinor: true,
    style: "Medium Swing",
    tempo: 140,
    blocks: [
      {
        label: "Sección A",
        bars: "Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9",
      },
      {
        label: "Sección A",
        bars: "Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Fm7 Bb7",
      },
      {
        label: "Sección B",
        bars: "Ebmaj7 | Ebmaj7 | Em7b5 | A7b9 | Dm7b5 | G7b9 | Cm6 | Dm7b5 G7b9",
      },
      {
        label: "Sección A",
        bars: "Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9 | Cm6 | Dm7b5 G7b9",
      },
    ],
  }),

  // 9. Sweet Georgia Brown (Fast Swing - Ab - 180 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "sweet-georgia-brown",
    title: "Sweet Georgia Brown",
    defaultKey: "Ab",
    style: "Fast Swing",
    tempo: 180,
    blocks: [
      {
        label: "Sección A",
        bars: "F7 | F7 | F7 | F7 | Bb7 | Bb7 | Bb7 | Bb7",
      },
      {
        label: "Sección B",
        bars: "Eb7 | Eb7 | Eb7 | Eb7 | Ab6 | Eb7 | Ab6 | C7",
      },
      {
        label: "Sección A",
        bars: "F7 | F7 | F7 | F7 | Bb7 | Bb7 | Bb7 | Bb7",
      },
      {
        label: "Sección C",
        bars: "Cm7b5 | F7b9 | Bbm7 | F7b9 | Bbm7 | Eb7 | Ab6 | Bbm7 Eb7",
      },
    ],
  }),

  // 10. There Will Never Be Another You (Medium Swing - Eb - 145 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "there-will-never-be-another-you",
    title: "There Will Never Be Another You",
    defaultKey: "Eb",
    style: "Medium Swing",
    tempo: 145,
    blocks: [
      {
        label: "Sección A",
        bars: "Ebmaj7 | Ebmaj7 | Dm7b5 | G7b9 | Cm7 | Cm7 | Bbm7 | Eb7",
      },
      {
        label: "Sección B",
        bars: "Abmaj7 | Db9 | Ebmaj7 | Cm7 | F7 | F7 | Fm7 | Bb7",
      },
      {
        label: "Sección A",
        bars: "Ebmaj7 | Ebmaj7 | Dm7b5 | G7b9 | Cm7 | Cm7 | Bbm7 | Eb7",
      },
      {
        label: "Sección C",
        bars: "Abmaj7 | Db9 | Ebmaj7 | Am7b5 D7b9 | Ebmaj7 Ab7 | Gm7 C7b9 | Fm7 Bb7 | Ebmaj7",
      },
    ],
  }),

  // 11. When Lights Are Low (Medium Swing - Eb - 120 BPM - 32 compases AABA)
  createRealBookSong({
    id: "when-lights-are-low",
    title: "When Lights Are Low",
    defaultKey: "Eb",
    style: "Medium Swing",
    tempo: 120,
    blocks: [
      {
        label: "Sección A",
        bars: "Ebmaj7 | Fm7 Bb7 | Ebmaj7 | Abm7 Db7 | Gbmaj7 | Fm7 Bb7 | Ebmaj7 | Fm7 Bb7",
      },
      {
        label: "Sección A",
        bars: "Ebmaj7 | Fm7 Bb7 | Ebmaj7 | Abm7 Db7 | Gbmaj7 | Fm7 Bb7 | Ebmaj7 | Ebmaj7",
      },
      {
        label: "Sección B",
        bars: "Gmaj7 | Am7 D7 | Gmaj7 | Am7 D7 | Fmaj7 | Gm7 C7 | Fm7 | Bb7",
      },
      {
        label: "Sección A",
        bars: "Ebmaj7 | Fm7 Bb7 | Ebmaj7 | Abm7 Db7 | Gbmaj7 | Fm7 Bb7 | Ebmaj7 | Fm7 Bb7",
      },
    ],
  }),

  // 12. Wave (Exacto a iReal Pro: Dmaj7 | Bbdim7 | Am7 | D7b9 | Gmaj7 | Gm6 | F#13 F#7b13 | B9 B7b9 | E9 | Bb7 A7 | Dm7 G7 | Dm7 G7)
  createRealBookSong({
    id: "wave",
    title: "Wave",
    defaultKey: "D",
    style: "Bossa Nova",
    tempo: 140,
    blocks: [
      {
        label: "Sección A",
        bars: "Dmaj7 | Bbdim7 | Am7 | D7b9 | Gmaj7 | Gm6 | F#13 F#7b13 | B9 B7b9 | E9 | Bb7 A7 | Dm7 G7 | Dm7 G7",
      },
      {
        label: "Sección A",
        bars: "Dmaj7 | Bbdim7 | Am7 | D7b9 | Gmaj7 | Gm6 | F#13 F#7b13 | B9 B7b9 | E9 | Bb7 A7 | Dm7 G7 | Dm7 G7",
      },
      {
        label: "Sección B",
        bars: "Gm7 | C7 | Fmaj7 | Fmaj7 | Fm7 | Bb7 | Ebmaj7 | A7b9",
      },
      {
        label: "Sección A",
        bars: "Dmaj7 | Bbdim7 | Am7 | D7b9 | Gmaj7 | Gm6 | F#13 F#7b13 | B9 B7b9 | E9 | Bb7 A7 | Dm7 G7 | Dm7 G7",
      },
    ],
  }),

  // 13. Satin Doll (Medium Swing - C - 115 BPM - 32 compases AABA)
  createRealBookSong({
    id: "satin-doll",
    title: "Satin Doll",
    defaultKey: "C",
    style: "Medium Swing",
    tempo: 115,
    blocks: [
      {
        label: "Sección A",
        bars: "Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 | Am7 D7 | Abm7 Db7 | Cmaj7 | Dm7 G7",
      },
      {
        label: "Sección A",
        bars: "Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 | Am7 D7 | Abm7 Db7 | Cmaj7 | Cmaj7",
      },
      {
        label: "Sección B",
        bars: "Gm7 | C7 | Fmaj7 | Fmaj7 | Am7 | D7 | Dm7 | G7",
      },
      {
        label: "Sección A",
        bars: "Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 | Am7 D7 | Abm7 Db7 | Cmaj7 | Cmaj7",
      },
    ],
  }),

  // 14. Corcovado (Quiet Nights) (Am7 | Am7 | Abdim7 | Abdim7 | Gm7 | C7 | Fmaj7 | Fmaj7...)
  createRealBookSong({
    id: "corcovado",
    title: "Corcovado (Quiet Nights)",
    defaultKey: "C",
    style: "Bossa Nova",
    tempo: 140,
    blocks: [
      {
        label: "Sección A",
        bars: "Am7 | Am7 | Abdim7 | Abdim7 | Gm7 | C7 | Fmaj7 | Fmaj7",
      },
      {
        label: "Sección B",
        bars: "Fm7 | Bb7 | Em7 | A7b13 | D7 | D7 | Dm7 | Abdim7",
      },
      {
        label: "Sección A",
        bars: "Am6 | Am6 | Abdim7 | Abdim7 | Gm7 | C7 | Fmaj7 | Fmaj7",
      },
      {
        label: "Sección C",
        bars: "Fm7 | Bb7 | Em7 | Am7 | Dm7 | G7 | Em7 | A7b13 | Dm7 | G7 | C6 | C6",
      },
    ],
  }),

  // 15. I Can't Give You Anything But Love (Medium Swing - F - 125 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "i-cant-give-you-anything-but-love",
    title: "I Can't Give You Anything But Love",
    defaultKey: "F",
    style: "Medium Swing",
    tempo: 125,
    blocks: [
      {
        label: "Sección A",
        bars: "Fmaj7 | F#dim7 | Gm7 | C7 | Fmaj7 | Cm7 F7 | Bbmaj7 | Bbm6",
      },
      {
        label: "Sección B",
        bars: "Fmaj7 | D7b9 | Gm7 | G7 | Gm7 | C7 | Gm7 | C7",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | F#dim7 | Gm7 | C7 | Fmaj7 | Cm7 F7 | Bbmaj7 | Bbm6",
      },
      {
        label: "Sección C",
        bars: "Fmaj7 D7b9 | Gm7 Bbm6 | Fmaj7 | D7b9 | Gm7 | C7 | F6 | Gm7 C7",
      },
    ],
  }),

  // 16. Lullaby of Birdland (Medium Swing - Fm / Ab - 135 BPM - 32 compases AABA)
  createRealBookSong({
    id: "lullaby-of-birdland",
    title: "Lullaby of Birdland",
    defaultKey: "F",
    defaultIsMinor: true,
    style: "Medium Swing",
    tempo: 135,
    blocks: [
      {
        label: "Sección A",
        bars: "Fm7 | Dm7b5 G7b9 | Cm7 | F7b9 | Bbm7 | Eb7 | Abmaj7 | G7b9 C7b9",
      },
      {
        label: "Sección A",
        bars: "Fm7 | Dm7b5 G7b9 | Cm7 | F7b9 | Bbm7 | Eb7 | Abmaj7 | Abmaj7",
      },
      {
        label: "Sección B",
        bars: "Cm7 | F7b9 | Bbm7 | Bbm7 | Bbm7 | Eb7 | Abmaj7 | G7b9 C7b9",
      },
      {
        label: "Sección A",
        bars: "Fm7 | Dm7b5 G7b9 | Cm7 | F7b9 | Bbm7 | Eb7 | Abmaj7 | G7b9 C7b9",
      },
    ],
  }),

  // 17. Oleo (Fast Swing / Rhythm Changes - Bb - 210 BPM - 32 compases AABA)
  createRealBookSong({
    id: "oleo",
    title: "Oleo",
    defaultKey: "Bb",
    style: "Fast Swing",
    tempo: 210,
    blocks: [
      {
        label: "Sección A",
        bars: "Bbmaj7 G7 | Cm7 F7 | Dm7 G7 | Cm7 F7 | Fm7 Bb7 | Ebmaj7 Ab7 | Dm7 G7 | Cm7 F7",
      },
      {
        label: "Sección A",
        bars: "Bbmaj7 G7 | Cm7 F7 | Dm7 G7 | Cm7 F7 | Fm7 Bb7 | Ebmaj7 Ab7 | Cm7 F7 | Bbmaj7",
      },
      {
        label: "Sección B",
        bars: "D7 | D7 | G7 | G7 | C7 | C7 | F7 | F7",
      },
      {
        label: "Sección A",
        bars: "Bbmaj7 G7 | Cm7 F7 | Dm7 G7 | Cm7 F7 | Fm7 Bb7 | Ebmaj7 Ab7 | Cm7 F7 | Bbmaj7",
      },
    ],
  }),

  // 18. Summertime (Slow Swing - Am - 95 BPM - 16 compases)
  createRealBookSong({
    id: "summertime",
    title: "Summertime",
    defaultKey: "A",
    defaultIsMinor: true,
    style: "Slow Swing",
    tempo: 95,
    blocks: [
      {
        label: "Sección A",
        bars: "Am6 | Bm7b5 E7b9 | Am6 | Bm7b5 E7b9 | Dm7 | Dm7 | Bm7b5 | E7b9",
      },
      {
        label: "Sección B",
        bars: "Am6 | Bm7b5 E7b9 | Cmaj7 | Bm7b5 E7b9 | Am6 | Dm6 | Am6 | Bm7b5 E7b9",
      },
    ],
  }),

  // ==========================================================================
  // 24-50: 27 ESTÁNDARES UNIVERSALES ADICIONALES
  // ==========================================================================

  // 24. Take the 'A' Train (Medium Swing - C - 140 BPM - 32 compases AABA)
  createRealBookSong({
    id: "take-the-a-train",
    title: "Take the 'A' Train",
    defaultKey: "C",
    style: "Medium Swing",
    tempo: 140,
    blocks: [
      {
        label: "Sección A",
        bars: "Cmaj7 | Cmaj7 | D7#11 | D7#11 | Dm7 | G7 | Cmaj7 | Dm7 G7",
      },
      {
        label: "Sección A",
        bars: "Cmaj7 | Cmaj7 | D7#11 | D7#11 | Dm7 | G7 | Cmaj7 | Gm7 C7",
      },
      {
        label: "Sección B",
        bars: "Fmaj7 | Fmaj7 | Fmaj7 | Fmaj7 | D7 | D7 | Dm7 | G7",
      },
      {
        label: "Sección A",
        bars: "Cmaj7 | Cmaj7 | D7#11 | D7#11 | Dm7 | G7 | Cmaj7 | Dm7 G7",
      },
    ],
  }),

  // 25. All of Me (Medium Swing - C - 130 BPM - 32 compases ABAC - Compás 27 con Em7 = iii y Compás 28 con A7 = V7/ii)
  createRealBookSong({
    id: "all-of-me",
    title: "All of Me",
    defaultKey: "C",
    style: "Medium Swing",
    tempo: 130,
    blocks: [
      {
        label: "Sección A",
        bars: "Cmaj7 | Cmaj7 | E7 | E7 | A7 | A7 | Dm7 | Dm7",
      },
      {
        label: "Sección B",
        bars: "E7 | E7 | Am7 | Am7 | D7 | D7 | Dm7 | G7",
      },
      {
        label: "Sección A",
        bars: "Cmaj7 | Cmaj7 | E7 | E7 | A7 | A7 | Dm7 | Dm7",
      },
      {
        label: "Sección C",
        bars: "Fmaj7 | Fm6 | Em7 | A7 | Dm7 | G7 | C6 Ebdim7 | Dm7 G7",
      },
    ],
  }),

  // 26. Stella by Starlight (Medium Swing - Bb - 130 BPM - 32 compases ABCD)
  createRealBookSong({
    id: "stella-by-starlight",
    title: "Stella by Starlight",
    defaultKey: "Bb",
    style: "Medium Swing",
    tempo: 130,
    blocks: [
      {
        label: "Sección A",
        bars: "Em7b5 | A7b9 | Cm7 | F7 | Fm7 | Bb7 | Ebmaj7 | Ab7#11",
      },
      {
        label: "Sección B",
        bars: "Bbmaj7 | Em7b5 A7b9 | Dm7 | Bbm7 Eb7 | Fmaj7 | Em7b5 A7b9 | Am7b5 | D7b9",
      },
      {
        label: "Sección C",
        bars: "G7b9 | G7b9 | Cm7 | Cm7 | Ab7#11 | Ab7#11 | Bbmaj7 | Bbmaj7",
      },
      {
        label: "Sección D",
        bars: "Em7b5 | A7b9 | Dm7b5 | G7b9 | Cm7b5 | F7b9 | Bbmaj7 | Bbmaj7",
      },
    ],
  }),

  // 27. Body and Soul (Jazz Ballad - Db - 72 BPM - 32 compases AABA)
  createRealBookSong({
    id: "body-and-soul",
    title: "Body and Soul",
    defaultKey: "Db",
    style: "Jazz Ballad",
    tempo: 72,
    blocks: [
      {
        label: "Sección A",
        bars: "Ebm7 Bb7b9 | Ebm7 Ab7 | Dbmaj7 Gb7 | Fm7 Edim7 | Ebm7 | Cm7b5 F7b9 | Bbm7 Ebm7 | Ab7",
      },
      {
        label: "Sección A",
        bars: "Ebm7 Bb7b9 | Ebm7 Ab7 | Dbmaj7 Gb7 | Fm7 Edim7 | Ebm7 | Cm7b5 F7b9 | Bbm7 Ebm7 | Ab7 Dbmaj7",
      },
      {
        label: "Sección B",
        bars: "Em7 A7 | Dmaj7 | Dm7 G7 | Cmaj7 | Cm7 F7 | Bbmaj7 | Em7 A7 | Eb7 Ab7",
      },
      {
        label: "Sección A",
        bars: "Ebm7 Bb7b9 | Ebm7 Ab7 | Dbmaj7 Gb7 | Fm7 Edim7 | Ebm7 | Cm7b5 F7b9 | Bbm7 Ebm7 | Dbmaj7",
      },
    ],
  }),

  // 28. The Girl from Ipanema (Bossa Nova - F - 130 BPM - 40 compases AABA - Armonía Jobim / Getz-Gilberto)
  createRealBookSong({
    id: "the-girl-from-ipanema",
    title: "The Girl from Ipanema",
    defaultKey: "F",
    style: "Bossa Nova",
    tempo: 130,
    blocks: [
      {
        label: "Sección A",
        bars: "Fmaj7 | Fmaj7 | G7 | G7 | Gm7 | Gb7#11 | Fmaj7 | Gb7#11",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | Fmaj7 | G7 | G7 | Gm7 | Gb7#11 | Fmaj7 | Fmaj7",
      },
      {
        label: "Sección B",
        bars: "Gbmaj7 | Gbmaj7 | B7 | B7 | F#m7 | F#m7 | D7 | D7 | Gm7 | Gm7 | Eb7 | Eb7 | Am7 | D7b9 | Gm7 | C7b9",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | Fmaj7 | G7 | G7 | Gm7 | Gb7#11 | Fmaj7 | Gb7#11",
      },
    ],
  }),

  // 29. Black Orpheus (Manhã de Carnaval) (Bossa Nova - Am - 125 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "black-orpheus",
    title: "Black Orpheus (Manhã de Carnaval)",
    defaultKey: "A",
    defaultIsMinor: true,
    style: "Bossa Nova",
    tempo: 125,
    blocks: [
      {
        label: "Sección A",
        bars: "Am7 | Bm7b5 E7b9 | Am7 | Bm7b5 E7b9 | Am7 | Dm7 G7 | Cmaj7 | C#dim7",
      },
      {
        label: "Sección B",
        bars: "Dm7 | G7 | Cmaj7 | Fmaj7 | Bm7b5 | E7b9 | Am7 | Bm7b5 E7b9",
      },
      {
        label: "Sección A",
        bars: "Am7 | Bm7b5 E7b9 | Am7 | Bm7b5 E7b9 | Em7b5 | A7b9 | Dm7 | Dm7",
      },
      {
        label: "Sección C",
        bars: "Dm7 | Bm7b5 E7b9 | Am7 | Fmaj7 | Bm7b5 | E7b9 | Am7 | Bm7b5 E7b9",
      },
    ],
  }),

  // 30. Recorda-Me (Latin / Bossa Nova - Am - 160 BPM - 16 compases AB)
  createRealBookSong({
    id: "recorda-me",
    title: "Recorda-Me",
    defaultKey: "A",
    defaultIsMinor: true,
    style: "Bossa Nova",
    tempo: 160,
    blocks: [
      {
        label: "Sección A",
        bars: "Am7 | Am7 | Am7 | Am7 | Cm7 | Cm7 | Cm7 | F7",
      },
      {
        label: "Sección B",
        bars: "Bbmaj7 | Bbm7 Eb7 | Abmaj7 | Abm7 Db7 | Gbmaj7 | Gm7 C7 | Fmaj7 | E7b9",
      },
    ],
  }),

  // 31. Song for My Father (Bossa Nova / Latin - Fm - 126 BPM - 24 compases AAB)
  createRealBookSong({
    id: "song-for-my-father",
    title: "Song for My Father",
    defaultKey: "F",
    defaultIsMinor: true,
    style: "Bossa Nova",
    tempo: 126,
    blocks: [
      {
        label: "Sección A",
        bars: "Fm7 | Fm7 | Eb7 | Eb7 | Db7 | C7b9 | Fm7 | Fm7",
      },
      {
        label: "Sección A",
        bars: "Fm7 | Fm7 | Eb7 | Eb7 | Db7 | C7b9 | Fm7 | Fm7",
      },
      {
        label: "Sección B",
        bars: "Eb7 | Eb7 | Fm7 | Fm7 | Eb7 Db7 | C7b9 | Fm7 | Fm7",
      },
    ],
  }),

  // 32. So What (Modal Jazz - Dm - 136 BPM - 32 compases AABA)
  createRealBookSong({
    id: "so-what",
    title: "So What",
    defaultKey: "D",
    defaultIsMinor: true,
    style: "Modal Jazz",
    tempo: 136,
    blocks: [
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
      {
        label: "Sección B",
        bars: "Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7",
      },
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
    ],
  }),

  // 33. Impressions (Modal Jazz / Fast Swing - Dm - 200 BPM - 32 compases AABA)
  createRealBookSong({
    id: "impressions",
    title: "Impressions",
    defaultKey: "D",
    defaultIsMinor: true,
    style: "Modal Jazz",
    tempo: 200,
    blocks: [
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
      {
        label: "Sección B",
        bars: "Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7 | Ebm7",
      },
      {
        label: "Sección A",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7 | Dm7",
      },
    ],
  }),

  // 34. Maiden Voyage (Modal Jazz - D - 120 BPM - 32 compases AABA)
  createRealBookSong({
    id: "maiden-voyage",
    title: "Maiden Voyage",
    defaultKey: "D",
    style: "Modal Jazz",
    tempo: 120,
    blocks: [
      {
        label: "Sección A",
        bars: "D7sus4 | D7sus4 | D7sus4 | D7sus4 | F7sus4 | F7sus4 | F7sus4 | F7sus4",
      },
      {
        label: "Sección A",
        bars: "D7sus4 | D7sus4 | D7sus4 | D7sus4 | F7sus4 | F7sus4 | F7sus4 | F7sus4",
      },
      {
        label: "Sección B",
        bars: "Eb7sus4 | Eb7sus4 | Eb7sus4 | Eb7sus4 | C#m7 | C#m7 | C#m7 | C#m7",
      },
      {
        label: "Sección A",
        bars: "D7sus4 | D7sus4 | D7sus4 | D7sus4 | F7sus4 | F7sus4 | F7sus4 | F7sus4",
      },
    ],
  }),

  // 35. Cantaloupe Island (Funk / Soul - Fm - 116 BPM - 16 compases)
  createRealBookSong({
    id: "cantaloupe-island",
    title: "Cantaloupe Island",
    defaultKey: "F",
    defaultIsMinor: true,
    style: "Funk / Soul",
    tempo: 116,
    blocks: [
      {
        label: "Sección A",
        bars: "Fm7 | Fm7 | Fm7 | Fm7 | Db7 | Db7 | Db7 | Db7",
      },
      {
        label: "Sección B",
        bars: "Dm7 | Dm7 | Dm7 | Dm7 | Fm7 | Fm7 | Fm7 | Fm7",
      },
    ],
  }),

  // 36. Watermelon Man (Funk / Soul - F - 118 BPM - 16 compases)
  createRealBookSong({
    id: "watermelon-man",
    title: "Watermelon Man",
    defaultKey: "F",
    style: "Funk / Soul",
    tempo: 118,
    blocks: [
      {
        label: "Sección A",
        bars: "F7 | F7 | F7 | F7 | Bb7 | Bb7 | F7 | F7",
      },
      {
        label: "Sección B",
        bars: "C7 | Bb7 | C7 | Bb7 | C7 | Bb7 | F7 | F7",
      },
    ],
  }),

  // 37. Chameleon (Funk / Soul - Bbm - 104 BPM - 16 compases)
  createRealBookSong({
    id: "chameleon",
    title: "Chameleon",
    defaultKey: "Bb",
    defaultIsMinor: true,
    style: "Funk / Soul",
    tempo: 104,
    blocks: [
      {
        label: "Sección A",
        bars: "Bbm7 | Eb7 | Bbm7 | Eb7 | Bbm7 | Eb7 | Bbm7 | Eb7",
      },
      {
        label: "Sección B",
        bars: "Bbm7 | Eb7 | Bbm7 | Eb7 | Bbm7 | Eb7 | Bbm7 | Eb7",
      },
    ],
  }),

  // 38. Mercy, Mercy, Mercy (Funk / Soul - Bb - 92 BPM - 20 compases)
  createRealBookSong({
    id: "mercy-mercy-mercy",
    title: "Mercy, Mercy, Mercy",
    defaultKey: "Bb",
    style: "Funk / Soul",
    tempo: 92,
    blocks: [
      {
        label: "Sección A",
        bars: "Bb7 | Eb7 | Bb7 | Eb7 | Bb7 | Eb7 | Bbmaj7 | Cm7 Dm7",
      },
      {
        label: "Sección B",
        bars: "Ebmaj7 | Dm7 | Cm7 | F7 | Ebmaj7 | Dm7 | Cm7 | F7 | Gm7 | C7 | Cm7 F7 | Bb7",
      },
    ],
  }),

  // 39. Strasbourg / St. Denis (Funk / Soul - Bbm - 114 BPM - 16 compases)
  createRealBookSong({
    id: "strasbourg-st-denis",
    title: "Strasbourg / St. Denis",
    defaultKey: "Bb",
    defaultIsMinor: true,
    style: "Funk / Soul",
    tempo: 114,
    blocks: [
      {
        label: "Sección A",
        bars: "Bbm7 Cm7 | Dbmaj7 Eb7 | Bbm7 Cm7 | Dbmaj7 Eb7 | Gb7 | F7 | Bbm7 | Bbm7",
      },
      {
        label: "Sección B",
        bars: "Bbm7 Cm7 | Dbmaj7 Eb7 | Bbm7 Cm7 | Dbmaj7 Eb7 | Gb7 | F7 | Bbm7 | F7b9",
      },
    ],
  }),

  // 40. C Jam Blues (Medium Swing / Blues - C - 135 BPM - 12 compases)
  createRealBookSong({
    id: "c-jam-blues",
    title: "C Jam Blues",
    defaultKey: "C",
    style: "Blues / Swing",
    tempo: 135,
    blocks: [
      {
        label: "Sección A",
        bars: "C7 | F7 | C7 | Gm7 C7 | F7 | F#dim7 | C7 | A7b9 | Dm7 | G7 | C7 A7b9 | Dm7 G7",
      },
    ],
  }),

  // 41. Billie's Bounce (Medium Swing / Blues - F - 155 BPM - 12 compases)
  createRealBookSong({
    id: "billies-bounce",
    title: "Billie's Bounce",
    defaultKey: "F",
    style: "Blues / Swing",
    tempo: 155,
    blocks: [
      {
        label: "Sección A",
        bars: "F7 | Bb7 Bdim7 | F7 | Cm7 F7 | Bb7 | Bdim7 | F7 | D7b9 | Gm7 | C7 | F7 D7b9 | Gm7 C7",
      },
    ],
  }),

  // 42. Blue Monk (Slow Swing / Blues - Bb - 110 BPM - 12 compases)
  createRealBookSong({
    id: "blue-monk",
    title: "Blue Monk",
    defaultKey: "Bb",
    style: "Blues / Swing",
    tempo: 110,
    blocks: [
      {
        label: "Sección A",
        bars: "Bb7 | Eb7 | Bb7 | Fm7 Bb7 | Eb7 | Edim7 | Bb7 | G7b9 | Cm7 | F7 | Bb7 G7b9 | Cm7 F7",
      },
    ],
  }),

  // 43. Equinox (Slow Swing / Blues - C#m - 112 BPM - 12 compases)
  createRealBookSong({
    id: "equinox",
    title: "Equinox",
    defaultKey: "C#",
    defaultIsMinor: true,
    style: "Blues / Swing",
    tempo: 112,
    blocks: [
      {
        label: "Sección A",
        bars: "C#m7 | C#m7 | C#m7 | C#m7 | F#m7 | F#m7 | C#m7 | C#m7 | A7 | G#7b9 | C#m7 | C#m7",
      },
    ],
  }),

  // 44. Solar (Medium Swing - Cm - 150 BPM - 12 compases)
  createRealBookSong({
    id: "solar",
    title: "Solar",
    defaultKey: "C",
    defaultIsMinor: true,
    style: "Medium Swing",
    tempo: 150,
    blocks: [
      {
        label: "Sección A",
        bars: "Cm(maj7) | Cm7 | Gm7 | C7 | Fmaj7 | Fmaj7 | Fm7 | Bb7 | Ebmaj7 | Ebm7 Ab7 | Dbmaj7 | Dm7b5 G7b9",
      },
    ],
  }),

  // 45. Blue in Green (Jazz Ballad - Dm - 68 BPM - 10 compases)
  createRealBookSong({
    id: "blue-in-green",
    title: "Blue in Green",
    defaultKey: "D",
    defaultIsMinor: true,
    style: "Jazz Ballad",
    tempo: 68,
    blocks: [
      {
        label: "Sección A",
        bars: "Bbmaj7#11 | A7#9 | Dm7 | Db7 | Cm7 | F7b9 | Bbmaj7#11 | A7b9 | Dm6 | E7#9 A7b9",
      },
    ],
  }),

  // 46. Nardis (Modal / Post-Bop - Em - 135 BPM - 32 compases AABA)
  createRealBookSong({
    id: "nardis",
    title: "Nardis",
    defaultKey: "E",
    defaultIsMinor: true,
    style: "Modal Jazz",
    tempo: 135,
    blocks: [
      {
        label: "Sección A",
        bars: "Em7 | Fmaj7 | B7b9 | Cmaj7 | Am7 | Fmaj7 | Emaj7 | Em7",
      },
      {
        label: "Sección A",
        bars: "Em7 | Fmaj7 | B7b9 | Cmaj7 | Am7 | Fmaj7 | Emaj7 | Em7",
      },
      {
        label: "Sección B",
        bars: "Am7 | Fmaj7 | Am7 | Fmaj7 | Dm7 | G7 | Cmaj7 | Fmaj7",
      },
      {
        label: "Sección A",
        bars: "Em7 | Fmaj7 | B7b9 | Cmaj7 | Am7 | Fmaj7 | Emaj7 | Em7",
      },
    ],
  }),

  // 47. On Green Dolphin Street (Medium Swing - Eb - 145 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "on-green-dolphin-street",
    title: "On Green Dolphin Street",
    defaultKey: "Eb",
    style: "Medium Swing",
    tempo: 145,
    blocks: [
      {
        label: "Sección A",
        bars: "Ebmaj7 | Ebmaj7 | Ebm7 | Ebm7 | F7 | E7 | Ebmaj7 | Fm7 Bb7",
      },
      {
        label: "Sección B",
        bars: "Fm7 | Bb7 | Ebmaj7 | Ebmaj7 | Abm7 | Db7 | Gbmaj7 | Fm7 Bb7",
      },
      {
        label: "Sección A",
        bars: "Ebmaj7 | Ebmaj7 | Ebm7 | Ebm7 | F7 | E7 | Ebmaj7 | Am7b5 D7b9",
      },
      {
        label: "Sección C",
        bars: "Gm7 C7b9 | Fm7 Bb7 | Ebmaj7 | Am7b5 D7b9 | Gm7 | C7b9 | Fm7 Bb7 | Ebmaj7",
      },
    ],
  }),

  // 48. How High the Moon (Medium Swing - G - 145 BPM - 32 compases ABAC)
  createRealBookSong({
    id: "how-high-the-moon",
    title: "How High the Moon",
    defaultKey: "G",
    style: "Medium Swing",
    tempo: 145,
    blocks: [
      {
        label: "Sección A",
        bars: "Gmaj7 | Gmaj7 | Gm7 | C7 | Fmaj7 | Fmaj7 | Fm7 | Bb7",
      },
      {
        label: "Sección B",
        bars: "Ebmaj7 | Am7b5 D7b9 | Gm7 | Am7b5 D7b9 | Bmaj7 | Am7 D7 | Gmaj7 | Am7 D7",
      },
      {
        label: "Sección A",
        bars: "Gmaj7 | Gmaj7 | Gm7 | C7 | Fmaj7 | Fmaj7 | Fm7 | Bb7",
      },
      {
        label: "Sección C",
        bars: "Ebmaj7 | Am7b5 D7b9 | Gmaj7 | Am7b5 D7b9 | Bm7 Bb7 | Am7 D7 | Gmaj7 | Am7 D7",
      },
    ],
  }),

  // 49. I'll Remember April (Medium Swing - G - 160 BPM - 48 compases ABA)
  createRealBookSong({
    id: "ill-remember-april",
    title: "I'll Remember April",
    defaultKey: "G",
    style: "Medium Swing",
    tempo: 160,
    blocks: [
      {
        label: "Sección A",
        bars: "Gmaj7 | Gmaj7 | Gmaj7 | Gmaj7 | Gm7 | Gm7 | Gm7 | Gm7 | Am7b5 | D7b9 | Bm7b5 | E7b9 | Am7 | D7 | Gmaj7 | Gmaj7",
      },
      {
        label: "Sección B",
        bars: "Cm7 | F7 | Bbmaj7 | Gm7 | Cm7 | F7 | Bbmaj7 | Bbmaj7 | Am7 | D7 | Gmaj7 | Gmaj7 | F#m7 | B7 | Emaj7 | Am7 D7",
      },
      {
        label: "Sección A",
        bars: "Gmaj7 | Gmaj7 | Gmaj7 | Gmaj7 | Gm7 | Gm7 | Gm7 | Gm7 | Am7b5 | D7b9 | Bm7b5 | E7b9 | Am7 | D7 | Gmaj7 | Am7 D7",
      },
    ],
  }),

  // 50. Confirmation (Up-Tempo Swing / Bebop - F - 175 BPM - 32 compases AABA)
  createRealBookSong({
    id: "confirmation",
    title: "Confirmation",
    defaultKey: "F",
    style: "Up-Tempo Swing",
    tempo: 175,
    blocks: [
      {
        label: "Sección A",
        bars: "Fmaj7 | Em7b5 A7b9 | Dm7 G7 | Cm7 F7 | Bb7 | Am7 D7 | G7 | Gm7 C7",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | Em7b5 A7b9 | Dm7 G7 | Cm7 F7 | Bb7 | Am7 D7 | Gm7 C7 | Fmaj7",
      },
      {
        label: "Sección B",
        bars: "Cm7 | F7 | Bbmaj7 | Bbmaj7 | Ebm7 | Ab7 | Dbmaj7 | Gm7 C7",
      },
      {
        label: "Sección A",
        bars: "Fmaj7 | Em7b5 A7b9 | Dm7 G7 | Cm7 F7 | Bb7 | Am7 D7 | Gm7 C7 | Fmaj7",
      },
    ],
  }),
];