import { CHORD_DEFINITIONS } from "../data/chords";
import { RootNote, ChordTypeOptions } from "../types";

export interface ChordSuggestion {
  chord: string;
  label: string;
  type?: ChordTypeOptions;
}

interface SuffixDef {
  type: ChordTypeOptions;
  suffix: string;
  label: string;
}

// Lista canónica completa de sufijos y extensiones leídas del diccionario maestro (CHORD_DEFINITIONS)
export const MASTER_SUFFIX_DEFS: SuffixDef[] = [
  // 1. Tríadas
  { type: "Mayor", suffix: "", label: CHORD_DEFINITIONS["Mayor"]?.suffix || "Tríada Mayor" },
  { type: "Mayor", suffix: "Maj", label: "Mayor" },
  { type: "Menor", suffix: "m", label: CHORD_DEFINITIONS["Menor"]?.suffix || "Tríada Menor" },
  { type: "aug", suffix: "aug", label: CHORD_DEFINITIONS["aug"]?.suffix || "Aumentado" },
  { type: "aug", suffix: "+", label: "Aumentado (+)" },

  // 2. Séptimas
  { type: "maj7", suffix: "maj7", label: CHORD_DEFINITIONS["maj7"]?.suffix || "Mayor 7" },
  { type: "m7", suffix: "m7", label: CHORD_DEFINITIONS["m7"]?.suffix || "Menor 7" },
  { type: "7", suffix: "7", label: CHORD_DEFINITIONS["7"]?.suffix || "Dominante 7" },
  { type: "m(maj7)", suffix: "m(maj7)", label: CHORD_DEFINITIONS["m(maj7)"]?.suffix || "Menor Mayor 7" },
  { type: "m7b5", suffix: "m7b5", label: CHORD_DEFINITIONS["m7b5"]?.suffix || "Semi-dism" },
  { type: "m7b5", suffix: "ø", label: "Semi-dism (ø)" },
  { type: "dim7", suffix: "dim7", label: CHORD_DEFINITIONS["dim7"]?.suffix || "Disminuido 7" },
  { type: "dim", suffix: "dim", label: CHORD_DEFINITIONS["dim"]?.suffix || "Disminuido" },

  // 3. Tensiones
  { type: "maj9", suffix: "maj9", label: CHORD_DEFINITIONS["maj9"]?.suffix || "Mayor 9" },
  { type: "maj13", suffix: "maj13", label: CHORD_DEFINITIONS["maj13"]?.suffix || "Mayor 13" },
  { type: "6", suffix: "6", label: CHORD_DEFINITIONS["6"]?.suffix || "Mayor 6" },
  { type: "6(9)", suffix: "6(9)", label: CHORD_DEFINITIONS["6(9)"]?.suffix || "Seis Nueve" },
  { type: "6(9)", suffix: "6/9", label: "Seis Nueve (6/9)" },
  { type: "m9", suffix: "m9", label: CHORD_DEFINITIONS["m9"]?.suffix || "Menor 9" },
  { type: "m11", suffix: "m11", label: CHORD_DEFINITIONS["m11"]?.suffix || "Menor 11" },
  { type: "m13", suffix: "m13", label: CHORD_DEFINITIONS["m13"]?.suffix || "Menor 13" },
  { type: "m6", suffix: "m6", label: CHORD_DEFINITIONS["m6"]?.suffix || "Menor 6" },
  { type: "9", suffix: "9", label: CHORD_DEFINITIONS["9"]?.suffix || "Dominante 9" },
  { type: "13", suffix: "13", label: CHORD_DEFINITIONS["13"]?.suffix || "Dominante 13" },
  { type: "7sus4", suffix: "7sus4", label: CHORD_DEFINITIONS["7sus4"]?.suffix || "7 Suspendido 4" },
  { type: "7sus4", suffix: "sus4", label: "Suspendido 4" },
  { type: "9sus4", suffix: "9sus4", label: CHORD_DEFINITIONS["9sus4"]?.suffix || "9 Suspendido 4" },
  { type: "13sus4", suffix: "13sus4", label: CHORD_DEFINITIONS["13sus4"]?.suffix || "13 Suspendido 4" },
  { type: "add9", suffix: "add9", label: CHORD_DEFINITIONS["add9"]?.suffix || "Add 9" },
  { type: "m-add9", suffix: "m-add9", label: CHORD_DEFINITIONS["m-add9"]?.suffix || "Menor Add 9" },

  // 4. Alterados y Extensiones Avanzadas
  { type: "maj7#11", suffix: "maj7#11", label: CHORD_DEFINITIONS["maj7#11"]?.suffix || "Mayor 7#11" },
  { type: "maj9#11", suffix: "maj9#11", label: CHORD_DEFINITIONS["maj9#11"]?.suffix || "Mayor 9#11" },
  { type: "alt", suffix: "alt", label: CHORD_DEFINITIONS["alt"]?.suffix || "Alterado" },
  { type: "alt", suffix: "7alt", label: "7 Alterado" },
  { type: "7b9", suffix: "7b9", label: CHORD_DEFINITIONS["7b9"]?.suffix || "7 bemol 9" },
  { type: "7#9", suffix: "7#9", label: CHORD_DEFINITIONS["7#9"]?.suffix || "7 sostenido 9" },
  { type: "7#11", suffix: "7#11", label: CHORD_DEFINITIONS["7#11"]?.suffix || "7 sostenido 11" },
  { type: "7b13", suffix: "7b13", label: CHORD_DEFINITIONS["7b13"]?.suffix || "7 bemol 13" },
  { type: "m11b5", suffix: "m11b5", label: CHORD_DEFINITIONS["m11b5"]?.suffix || "Semi-dism 11" },
  { type: "mb13b5", suffix: "m7b5(b13)", label: CHORD_DEFINITIONS["mb13b5"]?.suffix || "Semi-dism b13" },
  { type: "m9b5", suffix: "m9b5", label: CHORD_DEFINITIONS["m9b5"]?.suffix || "Semi-dism 9" },
  { type: "dim7_9", suffix: "dim7(9)", label: CHORD_DEFINITIONS["dim7_9"]?.suffix || "Disminuido 7(9)" },
  { type: "dim7_11", suffix: "dim7(11)", label: CHORD_DEFINITIONS["dim7_11"]?.suffix || "Disminuido 7(11)" },
  { type: "dim7_b13", suffix: "dim7(b13)", label: CHORD_DEFINITIONS["dim7_b13"]?.suffix || "Disminuido 7(b13)" }
];

const ROOT_MAP: Record<string, RootNote> = {
  c: "C", "c#": "C#", db: "Db",
  d: "D", "d#": "D#", eb: "Eb",
  e: "E",
  f: "F", "f#": "F#", gb: "Gb",
  g: "G", "g#": "G#", ab: "Ab",
  a: "A", "a#": "A#", bb: "Bb",
  b: "B"
};

/**
 * Descompone una cadena en candidatos de { root, suffix }.
 * Soporta tónicas enarmónicas y tensiones escritas directamente (ej. "C#11" -> tanto raíz C# como C con tensión #11).
 */
export function extractRootCandidates(input: string): { root: RootNote; suffix: string }[] {
  const clean = input.trim();
  if (!clean) return [];

  const candidates: { root: RootNote; suffix: string }[] = [];

  // Chequeo de 2 caracteres (C#, Db, etc.)
  if (clean.length >= 2) {
    const twoChars = clean.substring(0, 2).toLowerCase();
    if (ROOT_MAP[twoChars]) {
      candidates.push({ root: ROOT_MAP[twoChars], suffix: clean.substring(2) });
    }
  }

  // Chequeo de 1 caracter (C, D, etc.)
  const oneChar = clean.substring(0, 1).toLowerCase();
  if (ROOT_MAP[oneChar]) {
    // Si ya agregamos el de 2 caracteres, solo agregamos el de 1 caracter si no es redundante
    // o si el segundo caracter parece el inicio de una tensión (#11, #9, b9, b13)
    const secondChar = clean[1];
    const isTensionStart = secondChar === '#' || secondChar === 'b';
    if (candidates.length === 0 || isTensionStart) {
      candidates.push({ root: ROOT_MAP[oneChar], suffix: clean.substring(1) });
    }
  }

  return candidates;
}

/**
 * Genera sugerencias dinámicas conectadas al Diccionario Maestro de Acordes.
 */
export function getMasterChordSuggestions(
  input: string,
  globalKey: string = "C"
): ChordSuggestion[] {
  const raw = (input || "").trim();

  // 1. Estado vacío: Sugerencias iniciales inteligentes basadas en tonalidad activa
  if (!raw) {
    const key = (globalKey || "C") as RootNote;
    const initialSuggestions: ChordSuggestion[] = [
      { chord: "%", label: "Repetir acorde anterior" },
      { chord: `${key}maj7`, label: "Tónica Mayor 7", type: "maj7" },
      { chord: `${key}m7`, label: "Tónica Menor 7", type: "m7" },
      { chord: `${key}7`, label: "Dominante 7", type: "7" },
      { chord: `${key}m7b5`, label: "Semi-disminuido", type: "m7b5" },
      { chord: `${key}dim7`, label: "Disminuido 7", type: "dim7" },
      { chord: `${key}6`, label: "Mayor 6", type: "6" },
      { chord: `${key}alt`, label: "Alterado", type: "alt" }
    ];
    return initialSuggestions;
  }

  // 2. Símbolo de repetición %
  if (raw.startsWith("%")) {
    return [{ chord: "%", label: "Repetir acorde anterior" }];
  }

  // 2b. Si el usuario escribe "/" para inversión o slash chord (ej. "Cmaj7/" o "G/B")
  if (raw.includes("/") && !raw.toLowerCase().endsWith("6/9")) {
    const slashIdx = raw.lastIndexOf("/");
    if (slashIdx > 0) {
      const chordPart = raw.substring(0, slashIdx).trim();
      const bassQuery = raw.substring(slashIdx + 1).trim().toLowerCase();
      if (bassQuery === "9" && chordPart.endsWith("6")) {
        return [
          { chord: `${chordPart}(9)`, label: "Seis Nueve" },
          { chord: `${chordPart}/9`, label: "Seis Nueve (6/9)" },
        ];
      }
      const allRoots: RootNote[] = [
        "C", "Db", "C#", "D", "Eb", "D#", "E", "F", "F#", "Gb", "G", "Ab", "G#", "A", "Bb", "A#", "B"
      ];
      return allRoots
        .filter((b) => b.toLowerCase().startsWith(bassQuery))
        .map((b) => ({
          chord: `${chordPart}/${b}`,
          label: `Bajo en ${b}`,
        }));
    }
  }

  const rootCandidates = extractRootCandidates(raw);

  // 3. Caso A: Se detectó al menos una raíz tónica (ej. "C", "Db", "F#", "Am", "Cmaj7", "C#11")
  if (rootCandidates.length > 0) {
    const results: ChordSuggestion[] = [];
    const seen = new Set<string>();

    for (const { root, suffix } of rootCandidates) {
      const suffixLower = suffix.toLowerCase();

      // Si no ha escrito sufijo (ej: el usuario solo escribió "C"), mostrar TODAS las variantes disponibles
      if (!suffixLower) {
        for (const def of MASTER_SUFFIX_DEFS) {
          const chord = `${root}${def.suffix}`;
          if (!seen.has(chord)) {
            seen.add(chord);
            results.push({
              chord,
              label: def.label,
              type: def.type
            });
          }
        }
        continue;
      }

      // Si ya escribió parte del sufijo (ej: "C7", "Cma", "C#11", "Calt", "Cm")
      const exactMatches: ChordSuggestion[] = [];
      const prefixMatches: ChordSuggestion[] = [];
      const containsMatches: ChordSuggestion[] = [];

      for (const def of MASTER_SUFFIX_DEFS) {
        const fullChord = `${root}${def.suffix}`;
        const chordLower = fullChord.toLowerCase();
        const defSuffixLower = def.suffix.toLowerCase();
        const labelLower = def.label.toLowerCase();

        const item: ChordSuggestion = {
          chord: fullChord,
          label: def.label,
          type: def.type
        };

        if (defSuffixLower === suffixLower) {
          exactMatches.push(item);
        } else if (defSuffixLower.startsWith(suffixLower) || chordLower.startsWith(raw.toLowerCase())) {
          prefixMatches.push(item);
        } else if (
          defSuffixLower.includes(suffixLower) ||
          chordLower.includes(raw.toLowerCase()) ||
          labelLower.includes(suffixLower)
        ) {
          containsMatches.push(item);
        }
      }

      for (const item of [...exactMatches, ...prefixMatches, ...containsMatches]) {
        if (!seen.has(item.chord)) {
          seen.add(item.chord);
          results.push(item);
        }
      }
    }

    if (results.length > 0) {
      return results;
    }
  }

  // 4. Caso B: El usuario no empezó con una nota raíz (ej. escribió "maj7", "alt", "m7b5", "dim")
  const rawLower = raw.toLowerCase();
  const fallbackKey = (globalKey || "C") as RootNote;
  const genericMatches: ChordSuggestion[] = [];

  for (const def of MASTER_SUFFIX_DEFS) {
    const defSuffixLower = def.suffix.toLowerCase();
    const labelLower = def.label.toLowerCase();

    if (
      defSuffixLower.includes(rawLower) ||
      labelLower.includes(rawLower)
    ) {
      genericMatches.push({
        chord: `${fallbackKey}${def.suffix}`,
        label: `${def.label} (${fallbackKey})`,
        type: def.type
      });
    }
  }

  return genericMatches;
}
