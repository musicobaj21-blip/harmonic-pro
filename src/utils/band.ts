import { RootNote } from "../types";
import { parseChord, getSuggestedScale, getChordNotes, getChordIntervals, buildJazzVoicing } from "./music";
import { ROOT_MIDI_OFFSET_MAP } from "../data/chords";
import { ScheduledNote } from "./melody";
import { PlaybackChord } from "../components/Metronome";
import { getBeatsPerBar } from "./interactiveRhythmPatterns";

function midiToFreq(midiNode: number): number {
  return 440 * Math.pow(2, (midiNode - 69) / 12);
}

export function generateWalkingBass(
  chordString: string,
  chordBeats: number,
  nextChordString: string | null,
  style: string = "",
  globalBeatPhase: number = 0,
  timeSignature: string = "4/4"
): ScheduledNote[] {
  const parsed = parseChord(chordString);
  const scale = getSuggestedScale(parsed.root, parsed.type, "C"); 
  const intervals = scale.intervals || [0, 2, 4, 5, 7, 9, 11];
  
  let bassRoot = parsed.root;
  if (chordString.includes("/") && !chordString.includes("6/9")) {
    const slashPart = chordString.split("/")[1]?.trim() as RootNote;
    if (slashPart && slashPart in ROOT_MIDI_OFFSET_MAP) {
      bassRoot = slashPart;
    }
  }
  const rootOffset = ROOT_MIDI_OFFSET_MAP[bassRoot] || 0;
  let rootMidi = 36 + rootOffset; 
  
  const notes: ScheduledNote[] = [];
  
  let nextRootMidi: number | null = null;
  if (nextChordString) {
      const nextParsed = parseChord(nextChordString);
      let nextBassRoot = nextParsed.root;
      if (nextChordString.includes("/") && !nextChordString.includes("6/9")) {
        const nextSlash = nextChordString.split("/")[1]?.trim() as RootNote;
        if (nextSlash && nextSlash in ROOT_MIDI_OFFSET_MAP) {
          nextBassRoot = nextSlash;
        }
      }
      nextRootMidi = 36 + (ROOT_MIDI_OFFSET_MAP[nextBassRoot] || 0);
      if (nextRootMidi - rootMidi > 6) nextRootMidi -= 12;
      if (rootMidi - nextRootMidi > 6) nextRootMidi += 12;
  }

  const i3rd = intervals[2] || 4;
  const i5th = intervals[4] || 7;

  const styleLower = style.toLowerCase();
  const isBossa = styleLower.includes("bossa") || styleLower.includes("latin");
  const isBolero = styleLower.includes("bolero");
  const isReggaeton = styleLower.includes("reggaetón") || styleLower.includes("reggaeton") || styleLower.includes("reguetón") || styleLower.includes("regueton") || styleLower.includes("dembow") || styleLower.includes("perreo");
  const isReggae = !isReggaeton && (styleLower.includes("reggae") || styleLower.includes("dub") || styleLower.includes("ska"));
  const isRnb = styleLower.includes("r&b") || styleLower.includes("rnb") || styleLower.includes("neo-soul");
  const isHipHop = styleLower.includes("hip hop") || styleLower.includes("hip-hop") || styleLower.includes("rap") || styleLower.includes("trap") || styleLower.includes("boom bap");
  const isCumbia = styleLower.includes("cumbia") || styleLower.includes("chicha");
  const isCool = styleLower.includes("cool");
  const isFunk = styleLower.includes("funk");
  const isBlues = styleLower.includes("blues") || styleLower.includes("shuffle") || styleLower.includes("boogie");
  const isPop = !isFunk && !isBlues && !isReggaeton && !isBolero && styleLower.includes("pop");
  const isRock = !isFunk && !isBlues && !isReggaeton && !isPop && (styleLower.includes("rock") || styleLower.includes("straight"));
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const [, meterDenominator] = timeSignature.split("/").map((s) => parseInt(s.trim(), 10));
  const isEighthMeter = meterDenominator === 8;

  // =========================================================================
  // GROOVES ESPECÍFICOS POR MÉTRICA: 3/4, 6/8, 12/8, 9/8, 7/8 y 5/8
  // =========================================================================
  if (isEighthMeter || beatsPerBar === 3) {
      let baseRoot = rootMidi;
      while (baseRoot > 44) baseRoot -= 12;
      while (baseRoot < 31) baseRoot += 12;

      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInt = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : i3rd;
      const fifthInt = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : i5th;
      const seventhInt = chordIntervals.some((i) => (i % 12) === 11)
        ? 11
        : chordIntervals.some((i) => (i % 12) === 10)
        ? 10
        : (intervals[6] || 10);

      let thirdMidi = baseRoot + thirdInt;
      if (thirdMidi > 47) thirdMidi -= 12;
      let fifthMidi = baseRoot + fifthInt;
      if (fifthMidi > 48) fifthMidi -= 12;
      let seventhMidi = baseRoot + seventhInt;
      if (seventhMidi > 49) seventhMidi -= 12;
      let octaveMidi = baseRoot + 12 <= 50 ? baseRoot + 12 : fifthMidi;

      // Nota de aproximación cromática/diatónica hacia el siguiente acorde
      let approachMidi = fifthMidi;
      if (nextRootMidi !== null) {
          let target = nextRootMidi;
          while (target > 45) target -= 12;
          while (target < 31) target += 12;
          approachMidi = target !== baseRoot
            ? (target > baseRoot ? target - 1 : target + 1)
            : (fifthMidi > baseRoot ? fifthMidi - 1 : thirdMidi);
      } else {
          approachMidi = seventhMidi;
      }
      if (approachMidi > 49) approachMidi -= 12;
      if (approachMidi < 30) approachMidi += 12;

      const pushBassNote = (midiNote: number, offset: number, dur: number) => {
          if (offset >= chordBeats) return;
          const safeDur = Math.max(0.25, Math.min(dur, (chordBeats - offset) - 0.06));
          notes.push({
              freq: midiToFreq(midiNote),
              timeOffset: offset,
              durationBeats: safeDur,
          });
      };

      // 1. COMPÁS 3/4 (Jazz Waltz):
      // Toca en los 3 tiempos (0, 1, 2):
      // Tiempo 1 (0) = Tónica (Root)
      // Tiempo 2 (1) = 5ª o 3ª
      // Tiempo 3 (2) = Nota de aproximación cromática/diatónica hacia el siguiente acorde
      if (!isEighthMeter && beatsPerBar === 3) {
          for (let beat = 0; beat < chordBeats; beat++) {
              const absBeat = globalBeatPhase + beat;
              const beatInBar = absBeat % 3;
              const measureIdx = Math.floor(absBeat / 3);
              const isLastBeatOfChord = beat === Math.ceil(chordBeats) - 1;

              let midi = baseRoot;
              if (beat === 0 || beatInBar === 0) {
                  midi = baseRoot;
              } else if (isLastBeatOfChord || beatInBar === 2) {
                  midi = approachMidi;
              } else {
                  midi = measureIdx % 2 === 0 ? fifthMidi : thirdMidi;
              }
              pushBassNote(midi, beat, 0.90);
          }
          return notes;
      }

      // 2. COMPASES 6/8, 12/8 y 9/8 (Ternario / Slow Blues / Ballad):
      // Camina sobre los pulsos principales de negra con puntillo (0 y 3 en 6/8; 0, 3, 6, 9 en 12/8)
      // con duración larga, y usa las corcheas débiles previas (2, 5, 8, 11) como notas cortas de paso.
      if (isEighthMeter && (beatsPerBar === 6 || beatsPerBar === 12 || beatsPerBar === 9)) {
          for (let barOffset = 0; barOffset < chordBeats; barOffset += beatsPerBar) {
              const rem = chordBeats - barOffset;
              const measureIdx = Math.floor((globalBeatPhase + barOffset) / beatsPerBar);

              if (beatsPerBar === 6) {
                  if (rem >= 5.5) {
                      // Pulso 0 (1ª negra con puntillo): Tónica larga (con nota corta de paso opcional en 2 cada 2 compases)
                      if (measureIdx % 2 === 1) {
                          pushBassNote(baseRoot, barOffset + 0.0, 1.85);
                          pushBassNote(thirdMidi, barOffset + 2.0, 0.82); // Ghost / passing note en corchea 2
                      } else {
                          pushBassNote(baseRoot, barOffset + 0.0, 2.70);
                      }
                      // Pulso 3 (2ª negra con puntillo): 5ª o 3ª larga + nota corta de aproximación en corchea 5
                      const secondPulseMidi = measureIdx % 2 === 0 ? fifthMidi : thirdMidi;
                      pushBassNote(secondPulseMidi, barOffset + 3.0, 1.85);
                      pushBassNote(approachMidi, barOffset + 5.0, 0.82); // Approach note corta en corchea 5
                  } else {
                      // Medio compás (3 corcheas): Tónica en 0 + aproximación corta en 2
                      pushBassNote(baseRoot, barOffset + 0.0, Math.min(1.85, rem));
                      if (rem > 2.0) {
                          pushBassNote(approachMidi, barOffset + 2.0, 0.82);
                      }
                  }
              } else if (beatsPerBar === 12) {
                  if (rem >= 11.5) {
                      // Pulso 0: Tónica larga (negra con puntillo)
                      pushBassNote(baseRoot, barOffset + 0.0, 2.75);
                      // Pulso 3: 3ª larga + paso corto en corchea débil 5
                      pushBassNote(thirdMidi, barOffset + 3.0, 1.85);
                      pushBassNote(fifthMidi - 1, barOffset + 5.0, 0.82);
                      // Pulso 6: 5ª larga (negra con puntillo)
                      pushBassNote(fifthMidi, barOffset + 6.0, 2.75);
                      // Pulso 9: 7ª/6ª larga + aproximación corta en corchea débil 11 hacia el siguiente acorde
                      pushBassNote(seventhMidi, barOffset + 9.0, 1.85);
                      pushBassNote(approachMidi, barOffset + 11.0, 0.82);
                  } else if (rem >= 5.5) {
                      // 2 acordes por compás en 12/8 (6 corcheas cada uno)
                      pushBassNote(baseRoot, barOffset + 0.0, 2.70);
                      pushBassNote(fifthMidi, barOffset + 3.0, 1.85);
                      pushBassNote(approachMidi, barOffset + 5.0, 0.82);
                  } else {
                      pushBassNote(baseRoot, barOffset + 0.0, Math.min(2.65, rem));
                      if (rem > 2.0) {
                          pushBassNote(approachMidi, barOffset + 2.0, 0.82);
                      }
                  }
              } else {
                  // 9/8 (3 macro-pulsos ternarios: 0, 3, 6 + aproximación corta en 8)
                  pushBassNote(baseRoot, barOffset + 0.0, 2.70);
                  if (rem > 3.0) pushBassNote(thirdMidi, barOffset + 3.0, 2.70);
                  if (rem > 6.0) pushBassNote(fifthMidi, barOffset + 6.0, 1.85);
                  if (rem > 8.0) pushBassNote(approachMidi, barOffset + 8.0, 0.82);
              }
          }
          return notes;
      }

      // 3. COMPÁS 7/8 (Subdivisión 2 + 2 + 3 -> corcheas acentuadas 0, 2 y 4, aproximación en 6):
      if (isEighthMeter && beatsPerBar === 7) {
          for (let barOffset = 0; barOffset < chordBeats; barOffset += 7) {
              const rem = chordBeats - barOffset;
              // Corchea 0: Tónica
              pushBassNote(baseRoot, barOffset + 0.0, Math.min(1.80, rem));
              // Corchea 2: Quinta
              if (rem > 2.0) {
                  pushBassNote(fifthMidi, barOffset + 2.0, Math.min(1.80, rem - 2.0));
              }
              // Corchea 4: Octava / Tercera
              if (rem > 4.0) {
                  pushBassNote(octaveMidi, barOffset + 4.0, Math.min(1.80, rem - 4.0));
              }
              // Corchea 6: Aproximación hacia el siguiente acorde
              if (rem > 6.0) {
                  pushBassNote(approachMidi, barOffset + 6.0, Math.min(0.85, rem - 6.0));
              }
          }
          return notes;
      }

      // 4. COMPÁS 5/8 (Subdivisión 3 + 2 -> corcheas acentuadas 0 y 3):
      if (isEighthMeter && beatsPerBar === 5) {
          for (let barOffset = 0; barOffset < chordBeats; barOffset += 5) {
              const rem = chordBeats - barOffset;
              pushBassNote(baseRoot, barOffset + 0.0, Math.min(1.85, rem));
              if (rem > 2.0) {
                  pushBassNote(thirdMidi, barOffset + 2.0, Math.min(0.82, rem - 2.0));
              }
              if (rem > 3.0) {
                  pushBassNote(approachMidi, barOffset + 3.0, Math.min(1.80, rem - 3.0));
              }
          }
          return notes;
      }
  }

  if (isBossa) {
      // Patrón clásico Bossa Nova: Tónica - Quinta con su síncopa característica:
      // Tónica en el tiempo 1, una corchea de anticipación antes del tiempo 3, y la Quinta en el tiempo 3.
      const fifthMidi = rootMidi + i5th > 45 ? rootMidi + i5th - 12 : rootMidi + i5th;

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const barBeatPhase = (globalBeatPhase + beat) % beatsPerBar;

          if (remainingBeats >= 3 && barBeatPhase === 0) {
              // Tónica en el tiempo 1
              notes.push({
                  freq: midiToFreq(rootMidi),
                  timeOffset: beat + 0.0,
                  durationBeats: 1.3,
              });

              // Una corchea de anticipación antes del tiempo 3 (contratiempo del tiempo 2 / pulso 2.5)
              notes.push({
                  freq: midiToFreq(fifthMidi),
                  timeOffset: beat + 1.5,
                  durationBeats: 0.4,
              });

              // La Quinta en el tiempo 3
              notes.push({
                  freq: midiToFreq(fifthMidi),
                  timeOffset: beat + 2.0,
                  durationBeats: Math.min(1.8, remainingBeats - 2.0),
              });
          } else if (barBeatPhase === 0) {
              // Bloque corto en la primera mitad del compás (ej. compás de 2 tiempos)
              notes.push({
                  freq: midiToFreq(rootMidi),
                  timeOffset: beat + 0.0,
                  durationBeats: 1.3,
              });
              if (remainingBeats >= 2) {
                  notes.push({
                      freq: midiToFreq(fifthMidi),
                      timeOffset: beat + 1.5,
                      durationBeats: 0.4,
                  });
              }
          } else {
              // Bloque en la segunda mitad del compás (tiempo 3 en adelante)
              notes.push({
                  freq: midiToFreq(fifthMidi),
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(1.8, remainingBeats),
              });
          }
      }
      return notes;
  }

  if (isBolero) {
      // Bolero: Rítmica de bajo característica en compás 4/4:
      // NEGRA CON PUNTILLO + CORCHEA + NEGRA + NEGRA (1.5 + 0.5 + 1.0 + 1.0 = 4.0 tiempos)
      // Representación: | ♩.   ♪   ♩   ♩ |
      // Ataques en cada compás:
      // 1) beat 0.0: Negra con puntillo (~1.38 beats) -> Fundamental
      // 2) beat 1.5: Corchea (~0.42 beats) -> Quinta
      // 3) beat 2.0: Negra (~0.90 beats) -> Fundamental (o tercera/quinta)
      // 4) beat 3.0: Negra (~0.90 beats) -> Quinta (o octava/aproximación)
      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);

      // Registro óptimo profundo, redondo y cálido (MIDI 28 a 43, C1 a G2):
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      let fifthMidi = deepRoot + fifthInterval;
      if (fifthMidi > 45) fifthMidi -= 12;
      if (fifthMidi < 28) fifthMidi += 12;

      let thirdMidi = deepRoot + thirdInterval;
      if (thirdMidi > 45) thirdMidi -= 12;
      if (thirdMidi < 28) thirdMidi += 12;

      let octaveMidi = deepRoot + 12;
      if (octaveMidi > 45) octaveMidi -= 12;
      if (octaveMidi < 28) octaveMidi += 12;

      // Nota de aproximación diatónica/cromática suave hacia la fundamental del siguiente acorde
      let approachMidi = fifthMidi;
      if (nextRootMidi !== null) {
          let targetRoot = nextRootMidi;
          while (targetRoot > 43) targetRoot -= 12;
          while (targetRoot < 28) targetRoot += 12;
          const candidate = targetRoot > deepRoot ? targetRoot - 1 : targetRoot + 1;
          approachMidi = candidate;
          if (approachMidi > 45) approachMidi -= 12;
          if (approachMidi < 28) approachMidi += 12;
      }

      const addNote = (midiNote: number, timeOffset: number, rawDuration: number) => {
          if (timeOffset >= chordBeats) return;
          const maxDuration = Math.max(0.2, (chordBeats - timeOffset) - 0.08);
          const safeDuration = Math.min(rawDuration, maxDuration);
          notes.push({
              freq: midiToFreq(midiNote),
              timeOffset,
              durationBeats: safeDuration,
          });
      };

      // Si el acorde dura 1 pulso (4 acordes por compás)
      if (chordBeats <= 1.2) {
          addNote(deepRoot, 0.0, 0.90);
          return notes;
      }

      // Si el acorde dura 2 pulsos (2 acordes por compás de 4/4)
      if (chordBeats <= 2.5) {
          const barBeatPhase = globalBeatPhase % beatsPerBar;
          if (barBeatPhase === 0) {
              // Primera mitad del compás (tiempos 1 y 2):
              // 1) Fundamental con negra con puntillo (1.5 tiempos)
              addNote(deepRoot, 0.0, 1.38);
              // 2) Quinta con corchea (0.5 tiempos)
              addNote(fifthMidi, 1.5, 0.42);
          } else {
              // Segunda mitad del compás (tiempos 3 y 4):
              // 3) Fundamental con negra (1.0 tiempo)
              addNote(deepRoot, 0.0, 0.90);
              // 4) Quinta o aproximación con negra (1.0 tiempo)
              const note4 = (nextRootMidi !== null) ? approachMidi : fifthMidi;
              addNote(note4, 1.0, 0.90);
          }
          return notes;
      }

      // Si el acorde dura 3 pulsos (compás de 3/4)
      if (chordBeats <= 3.5) {
          addNote(deepRoot, 0.0, 1.38);
          addNote(fifthMidi, 1.5, 0.42);
          addNote(thirdMidi, 2.0, 0.90);
          return notes;
      }

      // Compás estándar de 4 pulsos (o más)
      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const currentBar = Math.floor((globalBeatPhase + beat) / beatsPerBar);

          if (remainingBeats >= 3.5) {
              // Patrón base de CADA COMPÁS en 4/4:
              // NEGRA CON PUNTILLO + CORCHEA + NEGRA + NEGRA (1.5 + 0.5 + 1.0 + 1.0 = 4.0 tiempos)
              // | ♩.   ♪   ♩   ♩ |
              let n1 = deepRoot;
              let n2 = fifthMidi;
              let n3 = deepRoot;
              let n4 = fifthMidi;

              const barVar = currentBar % 4;
              if (barVar === 0) {
                  // Patrón inicial / base: Fundamental - Quinta - Fundamental - Quinta
                  // Ejemplo C: C (♩.) — G (♪) — C (♩) — G (♩)
                  n1 = deepRoot;
                  n2 = fifthMidi;
                  n3 = deepRoot;
                  n4 = fifthMidi;
              } else if (barVar === 1) {
                  // Variación melódica 1 con tercera:
                  // Fundamental - Quinta - Tercera - Quinta
                  n1 = deepRoot;
                  n2 = fifthMidi;
                  n3 = thirdMidi;
                  n4 = fifthMidi;
              } else if (barVar === 2) {
                  // Variación melódica 2 con octava:
                  // Fundamental - Quinta - Fundamental - Octava
                  n1 = deepRoot;
                  n2 = fifthMidi;
                  n3 = deepRoot;
                  n4 = octaveMidi !== deepRoot ? octaveMidi : fifthMidi;
              } else {
                  // Variación melódica 3: aproximación suave al cambio de acorde o resolución
                  n1 = deepRoot;
                  n2 = fifthMidi;
                  if (nextRootMidi !== null && remainingBeats <= 4.5) {
                      n3 = deepRoot;
                      n4 = approachMidi;
                  } else {
                      n3 = thirdMidi;
                      n4 = fifthMidi;
                  }
              }

              // 1) Negra con puntillo (duración 1.5)
              addNote(n1, beat + 0.0, 1.38);

              // 2) Corchea (duración 0.5)
              addNote(n2, beat + 1.5, 0.42);

              // 3) Negra (duración 1.0)
              addNote(n3, beat + 2.0, 0.90);

              // 4) Negra (duración 1.0)
              addNote(n4, beat + 3.0, 0.90);
          } else {
              addNote(deepRoot, beat + 0.0, Math.min(1.38, remainingBeats));
              if (remainingBeats > 1.5) {
                  addNote(fifthMidi, beat + 1.5, Math.min(0.42, remainingBeats - 1.5));
              }
              if (remainingBeats > 2.0) {
                  addNote(deepRoot, beat + 2.0, Math.min(0.90, remainingBeats - 2.0));
              }
              if (remainingBeats > 3.0) {
                  addNote(fifthMidi, beat + 3.0, Math.min(0.90, remainingBeats - 3.0));
              }
          }
      }
      return notes;
  }

  if (isPop) {
      // =======================================================================
      // POP: BAJO (Simple, estable, musical, comercial, refuerza el kick)
      // - Sigue automáticamente el acorde actual.
      // - Prioriza: fundamental, quinta, octava y tercera ocasional.
      // - Utiliza: negras, corcheas y silencios musicales.
      // - No rock pesado ni distorsionado, ni slap/funk complejo.
      // =======================================================================
      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);

      // Registro grave y limpio de bajo eléctrico (E1/MIDI 28 a G2/MIDI 43)
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      let fifthMidi = deepRoot + fifthInterval;
      if (fifthMidi > 46) fifthMidi -= 12;
      if (fifthMidi < 28) fifthMidi += 12;

      let octaveMidi = deepRoot + 12;
      if (octaveMidi > 50) octaveMidi -= 12;

      let thirdMidi = deepRoot + thirdInterval;
      if (thirdMidi > 46) thirdMidi -= 12;
      if (thirdMidi < 28) thirdMidi += 12;

      const addNote = (midiNote: number, timeOffset: number, rawDuration: number) => {
          if (timeOffset >= chordBeats) return;
          const safeDuration = Math.max(0.20, Math.min(rawDuration, chordBeats - timeOffset));
          notes.push({
              freq: midiToFreq(midiNote),
              timeOffset,
              durationBeats: safeDuration,
          });
      };

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const currentBar = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = currentBar % 4;

          if (remainingBeats >= 3.5) {
              // Compás completo de 4 tiempos en POP:
              // El bajo acompaña exactamente el patrón rítmico del bombo de cada compás.
              if (barCycle === 0) {
                  // Compás 1 (Bombo en 1 y 3):
                  // T1: Negra en fundamental (reforzando Kick en 1)
                  // T2: Silencio (caja clara)
                  // T3: Negra en quinta (reforzando Kick en 3)
                  // T4: Silencio
                  addNote(deepRoot, beat + 0.0, 0.85);
                  addNote(fifthMidi, beat + 2.0, 0.85);
              } else if (barCycle === 1) {
                  // Compás 2 (Bombo en 1, 3 y 3 &):
                  // T1: Negra en fundamental
                  // T2: Silencio
                  // T3: Corchea en fundamental (T3)
                  // T3&: Corchea en quinta (T3.5, exactamente con el kick en 3 &)
                  // T4: Silencio
                  addNote(deepRoot, beat + 0.0, 0.85);
                  addNote(deepRoot, beat + 2.0, 0.42);
                  addNote(fifthMidi, beat + 2.5, 0.42);
              } else if (barCycle === 2) {
                  // Compás 3 (Bombo en 1, 2 & y 3):
                  // T1: Negra en fundamental
                  // T2: Silencio en pulso 2; en 2 & corchea en octava (con el kick en 2 &)
                  // T3: Negra en quinta o tercera (reforzando Kick en 3)
                  // T4: Silencio
                  addNote(deepRoot, beat + 0.0, 0.85);
                  addNote(octaveMidi, beat + 1.5, 0.42);
                  addNote(thirdMidi, beat + 2.0, 0.85);
              } else {
                  // Compás 4 (Bombo en 1, 1 & y 3):
                  // T1: Corchea en fundamental (con el 1er kick)
                  // T1&: Corchea en octava o fundamental (con el 2do kick en 1 &)
                  // T2: Silencio
                  // T3: Negra en quinta (reforzando Kick en 3)
                  // T4: Silencio
                  addNote(deepRoot, beat + 0.0, 0.42);
                  addNote(octaveMidi, beat + 0.5, 0.42);
                  addNote(fifthMidi, beat + 2.0, 0.85);
              }
          } else if (remainingBeats >= 2.0) {
              // 2 pulsos: Negra en 1 (fundamental) y negra en 2 (quinta)
              addNote(deepRoot, beat + 0.0, 0.85);
              addNote(fifthMidi, beat + 1.0, 0.85);
          } else {
              // 1 pulso: Negra en fundamental
              addNote(deepRoot, beat + 0.0, Math.min(0.85, remainingBeats));
          }
      }
      return notes;
  }

  if (isReggae) {
      // Reggae: Bajo Roots tradicional - Melódico, sincopado, profundo y con espacio ("respiración")
      // Basado en el patrón de referencia tradicional:
      // 1 & 2 & 3 & 4 &
      // - C C - C - E G  (o silencios, síncopas, notas ligadas y movimiento melódico 1-1-1-3-5)
      
      // Obtener los intervalos exactos del acorde actual (fundamental, 3ra, 5ta)
      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);

      // Ajuste al registro grave óptimo y profundo (entre MIDI 28 y 43)
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      // Tercera en registro adecuado
      let thirdMidi = deepRoot + thirdInterval;
      if (thirdMidi > 46) thirdMidi -= 12;
      if (thirdMidi < 28) thirdMidi += 12;

      // Quinta en registro adecuado
      let fifthMidi = deepRoot + fifthInterval;
      if (fifthMidi > 46) fifthMidi -= 12;
      if (fifthMidi < 28) fifthMidi += 12;

      // Helper para agendar notas con sustain medio y garantizando que NO invadan el siguiente acorde
      const addNote = (midiNote: number, timeOffset: number, rawDuration: number) => {
          if (timeOffset >= chordBeats) return;
          // Dejar siempre al menos 0.08 beats de silencio/respiro antes del siguiente cambio
          const maxDuration = Math.max(0.12, (chordBeats - timeOffset) - 0.08);
          const safeDuration = Math.min(rawDuration, maxDuration);
          notes.push({
              freq: midiToFreq(midiNote),
              timeOffset,
              durationBeats: safeDuration,
          });
      };

      // CASO A: 4 acordes por compás (aprox. 1 pulso por acorde)
      // Adaptar priorizando la fundamental con ataque claro y espacio
      if (chordBeats <= 1.2) {
          addNote(deepRoot, 0.0, 0.75);
          return notes;
      }

      // CASO B: 2 acordes por compás (aprox. 2 pulsos por acorde)
      // Entrada con fundamental, ligadura/síncopa y movimiento hacia la 3ra o 5ta
      if (chordBeats <= 2.5) {
          // Entra con fundamental (con breve respiración inicial de semicorchea o directo al pulso)
          addNote(deepRoot, 0.0, 0.65);
          // Segunda fundamental sincopada
          if (chordBeats >= 1.25) {
              addNote(deepRoot, 0.75, 0.55);
          }
          // Quinta o tercera melódica al final del pulso del acorde
          if (chordBeats >= 1.75) {
              addNote(fifthMidi, 1.5, 0.40);
          }
          return notes;
      }

      // CASO C: 3 pulsos (ej. 3/4)
      if (chordBeats <= 3.5) {
          addNote(deepRoot, 0.25, 0.60);
          addNote(deepRoot, 1.0, 0.70);
          addNote(thirdMidi, 2.0, 0.45);
          addNote(fifthMidi, 2.5, 0.45);
          return notes;
      }

      // CASO D: Compás completo o más (4 pulsos en adelante)
      // Patrón Melódico Roots Tradicional:
      // Subdivisión: 1 & 2 & 3 & 4 &
      // Rítmica inspirada en: [silencio corchea / 16va] ROOT (0.25), ROOT (0.75/1.0), ROOT sostenida (1.75/2.0), THIRD (3.0), FIFTH (3.5)
      // Variación sutil por compás para dar fluidez humana y no sentirse una caja de ritmos rígida
      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const currentBar = Math.floor((globalBeatPhase + beat) / beatsPerBar);

          if (remainingBeats >= 4) {
              if (currentBar % 2 === 0) {
                  // Variación A (Patrón Roots clásico C - C - C - E - G con síncopa y silencio inicial):
                  // 1) Pequeño silencio inicial: entra en 0.25 (semicorchea después del pulso 1) -> FUNDAMENTAL
                  addNote(deepRoot, beat + 0.25, 0.45);
                  // 2) Siguiente FUNDAMENTAL en el contratiempo del 1 (0.75) o tiempo 2
                  addNote(deepRoot, beat + 0.75, 0.55);
                  // 3) Tercera FUNDAMENTAL en tiempo 2 sincopado (pulso 1.75 ó 2.0) con cuerpo y sustain
                  addNote(deepRoot, beat + 1.75, 0.95);
                  // 4) TERCERA melódica en el tiempo 4 (3.0)
                  addNote(thirdMidi, beat + 3.0, 0.45);
                  // 5) QUINTA melódica sincopada en el contratiempo (3.5) que conduce con sabor al compás siguiente
                  addNote(fifthMidi, beat + 3.5, 0.42);
              } else {
                  // Variación B (Variación Roots melódica con apertura en tiempo 1 y pickup hacia la 3ra y 5ta):
                  // 1) FUNDAMENTAL en tiempo 1 con sustain medio
                  addNote(deepRoot, beat + 0.0, 0.65);
                  // 2) FUNDAMENTAL sincopada en el tiempo 1.5
                  addNote(deepRoot, beat + 1.5, 0.60);
                  // 3) FUNDAMENTAL en tiempo 2.5 (sincopada antes del 3)
                  addNote(deepRoot, beat + 2.25, 0.65);
                  // 4) TERCERA en tiempo 3.0
                  addNote(thirdMidi, beat + 3.0, 0.45);
                  // 5) QUINTA en tiempo 3.5
                  addNote(fifthMidi, beat + 3.5, 0.42);
              }
          } else if (remainingBeats >= 2) {
              addNote(deepRoot, beat + 0.0, 0.65);
              if (remainingBeats >= 1.25) {
                  addNote(deepRoot, beat + 0.75, 0.55);
              }
              if (remainingBeats >= 1.75) {
                  addNote(fifthMidi, beat + 1.5, 0.40);
              }
          } else {
              addNote(deepRoot, beat + 0.0, 0.75);
          }
      }

      return notes;
  }

  if (isRnb) {
      // R&B / Neo Soul: Bajo MUCHO MÁS PROFUNDO, REDONDO, CÁLIDO y con NOTAS LARGAS
      // Priorizar fundamental, quinta, y tercera/séptima/octava ocasionales con mucho espacio.
      // Registro óptimo profundo y cálido: MIDI 28 a 43 (E1 a G2)
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);
      const seventhInterval = chordIntervals.some(i => (i % 12) === 11) ? 11 : (chordIntervals.some(i => (i % 12) === 10) ? 10 : (intervals[6] || 10));

      const octMidi = deepRoot + 12 <= 50 ? deepRoot + 12 : deepRoot;
      const thirdMidi = deepRoot + thirdInterval <= 46 ? deepRoot + thirdInterval : deepRoot + thirdInterval - 12;
      const fifthMidi = deepRoot + fifthInterval <= 48 ? deepRoot + fifthInterval : deepRoot + fifthInterval - 12;
      const seventhMidi = deepRoot + seventhInterval <= 50 ? deepRoot + seventhInterval : deepRoot + seventhInterval - 12;

      // Helper para agregar notas largas con sustain y espacio
      const addRnbNote = (midiVal: number, offset: number, dur: number) => {
          if (offset >= chordBeats) return;
          const maxDur = Math.max(0.6, Math.min(dur, (chordBeats - offset) - 0.05));
          notes.push({
              freq: midiToFreq(midiVal),
              timeOffset: offset,
              durationBeats: maxDur,
          });
      };

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const currentMeasure = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = currentMeasure % 4;

          if (remainingBeats >= 3.5) {
              // Compás 4/4 completo: Máximo espacio, notas largas y redondas (1 o 2 notas por compás)
              if (barCycle === 0) {
                  // Variación 1: ROOT ---- ---- 5TH ---- (Blanca en 1, Blanca en 3)
                  // Tiempo 1: Fundamental profunda sostenida (duración 1.95 beats)
                  addRnbNote(deepRoot, beat + 0.0, 1.95);
                  // Tiempo 3: Quinta cálida sostenida (duración 1.95 beats)
                  addRnbNote(fifthMidi, beat + 2.0, 1.95);
              } else if (barCycle === 1) {
                  // Variación 2: ROOT -------- ROOT/5TH ---- (Negra con puntillo/Blanca ligada en 1, síncopa suave en el & de 3)
                  // Tiempo 1: Fundamental profunda sostenida (duración 2.45 beats)
                  addRnbNote(deepRoot, beat + 0.0, 2.45);
                  // Contratiempo del tiempo 3 ('&' de 3 / beat 2.5): Quinta sostenida hasta el final
                  addRnbNote(fifthMidi, beat + 2.5, 1.45);
              } else if (barCycle === 2) {
                  // Variación 3: ROOT sostén completo (casi todo el compás, pura profundidad y aire para que respire la batería y armonía)
                  // Tiempo 1: Fundamental profunda sostenida (duración 3.6 beats)
                  addRnbNote(deepRoot, beat + 0.0, 3.6);
              } else {
                  // Variación 4: ROOT ---- ---- 3RD/7TH/5TH ---- (Blanca en 1, nota melódica larga en tiempo 3)
                  // Tiempo 1: Fundamental profunda sostenida (duración 1.95 beats)
                  addRnbNote(deepRoot, beat + 0.0, 1.95);
                  // Tiempo 3: Tercera o Quinta con duración elegante
                  const secondNote = (thirdMidi > deepRoot) ? thirdMidi : fifthMidi;
                  addRnbNote(secondNote, beat + 2.0, 1.95);
              }
          } else if (remainingBeats >= 2) {
              // 2 tiempos por acorde: Fundamental larga que sostiene los 2 tiempos (blanca: 1.9 beats)
              addRnbNote(deepRoot, beat + 0.0, Math.min(1.9, remainingBeats - 0.05));
          } else {
              // 1 tiempo: Fundamental con cuerpo y sustain
              addRnbNote(deepRoot, beat + 0.0, Math.min(0.95, remainingBeats));
          }
      }
      return notes;
  }

  if (isHipHop) {
      // Hip Hop: Bajo profundo, simple, repetitivo, rítmico y con espacio (Boom-Bap clásico)
      // Registro grave y sólido (entre MIDI 28 y 43: E1 a G2)
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      // Obtener intervalos del acorde actual
      const chordIntervals = getChordIntervals(parsed.type as any);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);

      // Quinta en registro óptimo
      let fifthMidi = deepRoot + fifthInterval;
      if (fifthMidi > 46) fifthMidi -= 12;
      if (fifthMidi < 28) fifthMidi += 12;

      // Octava sólida
      let octaveMidi = deepRoot + 12;
      if (octaveMidi > 46) octaveMidi -= 12;

      // Tercera ocasional
      let thirdMidi = deepRoot + thirdInterval;
      if (thirdMidi > 46) thirdMidi -= 12;
      if (thirdMidi < 28) thirdMidi += 12;

      // Nota de aproximación ocasional (séptima menor o paso al siguiente acorde)
      let approachMidi = deepRoot + (intervals[6] || 10);
      if (nextRootMidi !== null) {
          approachMidi = nextRootMidi + (nextRootMidi > deepRoot ? -1 : 1);
      }
      while (approachMidi > 46) approachMidi -= 12;
      while (approachMidi < 28) approachMidi += 12;

      // Helper para agendar notas con cuerpo y evitar invadir el siguiente acorde
      const addNote = (midiNote: number, timeOffset: number, rawDuration: number) => {
          if (timeOffset >= chordBeats) return;
          const maxDuration = Math.max(0.15, (chordBeats - timeOffset) - 0.08);
          const safeDuration = Math.min(rawDuration, maxDuration);
          notes.push({
              freq: midiToFreq(midiNote),
              timeOffset,
              durationBeats: safeDuration,
          });
      };

      // CASO A: 4 acordes por compás (aprox. 1 pulso por acorde)
      if (chordBeats <= 1.2) {
          addNote(deepRoot, 0.0, 0.75);
          return notes;
      }

      // CASO B: 2 acordes por compás (aprox. 2 pulsos por acorde)
      if (chordBeats <= 2.5) {
          addNote(deepRoot, 0.0, 0.85);
          if (chordBeats >= 1.75) {
              addNote(fifthMidi, 1.52, 0.38);
          }
          return notes;
      }

      // CASO C: 3 pulsos (3/4)
      if (chordBeats <= 3.5) {
          addNote(deepRoot, 0.0, 0.85);
          addNote(fifthMidi, 2.0, 0.70);
          return notes;
      }

      // CASO D: Compás completo o más (4 pulsos en adelante)
      // Alternancia de groove Boom-Bap coordinada con el bombo:
      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const currentBar = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const isBarA = currentBar % 2 === 0;

          if (remainingBeats >= 4) {
              if (isBarA) {
                  // Compás A:
                  // 1) Tiempo 1 (beat 0.0): Fundamental sólida con peso, alineada con el bombo
                  addNote(deepRoot, beat + 0.0, 0.85);
                  // [Espacio en tiempo 2 para que resuene la caja seca]
                  // 2) Síncopa en '&' de 2 (beat 1.52): Sigue al bombo sincopado con nota más corta
                  addNote(deepRoot, beat + 1.52, 0.40);
                  // 3) Tiempo 3 (beat 2.0): Golpe con peso en la QUINTA
                  addNote(fifthMidi, beat + 2.0, 0.75);
                  // [Espacio en tiempo 4 para la caja seca]
              } else {
                  // Compás B:
                  // 1) Tiempo 1 (beat 0.0): Fundamental pesada
                  addNote(deepRoot, beat + 0.0, 0.85);
                  // [Espacio en tiempo 2]
                  // 2) Tiempo 3 (beat 2.0): QUINTA o TERCERA firme junto con el bombo
                  addNote(fifthMidi, beat + 2.0, 0.55);
                  // 3) Síncopa en '&' de 3 (beat 2.52): OCTAVA o FUNDAMENTAL siguiendo al bombo sincopado
                  addNote(octaveMidi, beat + 2.52, 0.40);
                  // 4) Ocasional nota de aproximación al final del compás 4
                  if (currentBar % 4 === 3) {
                      addNote(approachMidi, beat + 3.52, 0.35);
                  }
                  // [Espacio en tiempo 4]
              }
          } else if (remainingBeats >= 2) {
              addNote(deepRoot, beat + 0.0, 0.85);
              if (remainingBeats >= 1.75) {
                  addNote(fifthMidi, beat + 1.52, 0.38);
              }
          } else {
              addNote(deepRoot, beat + 0.0, 0.75);
          }
      }

      return notes;
  }

  if (isCumbia) {
      // Cumbia: Figura de 2/4 (negra y dos corcheas) mapeada a 4/4 en Tone.js:
      // Tiempos exactos: ["0:0:0", "0:1:0", "0:1:2", "0:2:0", "0:3:0", "0:3:2"]
      // La Negra toca la Fundamental (Root) y las corcheas tocan la 5ta o su octava.
      const bassPatternTimes = ["0:0:0", "0:1:0", "0:1:2", "0:2:0", "0:3:0", "0:3:2"];
      const fifthMidi = rootMidi + i5th > 46 ? rootMidi + i5th - 12 : rootMidi + i5th;
      const octaveMidi = rootMidi + 12 <= 48 ? rootMidi + 12 : fifthMidi;

      // Definición de notas por cada evento del patrón en 4/4
      const patternEvents = [
          { timeStr: "0:0:0", timeOffset: 0.0, midi: rootMidi, duration: 0.85 },    // Negra (Tónica)
          { timeStr: "0:1:0", timeOffset: 1.0, midi: fifthMidi, duration: 0.45 },   // 1ra corchea (5ta)
          { timeStr: "0:1:2", timeOffset: 1.5, midi: octaveMidi, duration: 0.45 },  // 2da corchea contratiempo (8va / 5ta)
          { timeStr: "0:2:0", timeOffset: 2.0, midi: rootMidi, duration: 0.85 },    // Negra (Tónica)
          { timeStr: "0:3:0", timeOffset: 3.0, midi: fifthMidi, duration: 0.45 },   // 1ra corchea (5ta)
          { timeStr: "0:3:2", timeOffset: 3.5, midi: octaveMidi, duration: 0.45 },  // 2da corchea contratiempo (8va / 5ta)
      ];

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const barBeatPhase = (globalBeatPhase + beat) % beatsPerBar;

          patternEvents.forEach(evt => {
              // Si el evento cae dentro de la duración restante del acorde y del compás
              const actualOffset = (evt.timeOffset - barBeatPhase);
              if (actualOffset >= 0 && actualOffset < Math.min(beatsPerBar, remainingBeats)) {
                  notes.push({
                      freq: midiToFreq(evt.midi),
                      timeOffset: beat + actualOffset,
                      durationBeats: Math.min(evt.duration, remainingBeats - actualOffset),
                  });
              }
          });
      }
      return notes;
  }

  if (isCool) {
      // Cool Jazz: Walking bass espaciado y relajado
      for (let beat = 0; beat < chordBeats; beat += 2) {
          const isFirst = beat === 0;
          let midi = isFirst ? rootMidi : rootMidi + i5th;
          if (midi > 45) midi -= 12;
          notes.push({ freq: midiToFreq(midi), timeOffset: beat, durationBeats: Math.min(1.8, chordBeats - beat) });
      }
      return notes;
  }

  if (isFunk) {
      // Funk: Bajo rítmico, percusivo, sincopado y groovero (Funk 70s / James Brown / Tower of Power)
      // - Registro grave y definido: E1 (MIDI 28) a G2 (MIDI 43)
      // - Articulación staccato corta y percusiva (0.18 a 0.32 beats)
      // - Selección de notas: Fundamental predominante, 5ta, octava, 7ma menor / 3ra ocasional y aproximaciones
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      const chordIntervals = getChordIntervals(parsed.type as any);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);
      const flat7Interval = chordIntervals.some(i => (i % 12) === 10) ? 10 : (intervals[6] || 10);
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);

      const octMidi = deepRoot + 12 <= 55 ? deepRoot + 12 : deepRoot;
      const fifthMidi = deepRoot + fifthInterval <= 52 ? deepRoot + fifthInterval : deepRoot + fifthInterval - 12;
      const flat7Midi = deepRoot + flat7Interval <= 55 ? deepRoot + flat7Interval : deepRoot + flat7Interval - 12;
      const thirdMidi = deepRoot + thirdInterval <= 52 ? deepRoot + thirdInterval : deepRoot + thirdInterval - 12;

      // Helper para insertar notas de bajo staccato funk respetando el espacio del acorde
      const addFunkNote = (midiVal: number, offset: number, dur: number) => {
          if (offset >= chordBeats) return;
          const maxDur = Math.max(0.12, Math.min(dur, (chordBeats - offset) - 0.04));
          notes.push({
              freq: midiToFreq(midiVal),
              timeOffset: offset,
              durationBeats: maxDur,
          });
      };

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const measureIdx = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const isBarA = measureIdx % 2 === 0;

          if (remainingBeats >= 4) {
              if (isBarA) {
                  // Compás A: Trabado firmemente con el bombo sincopado
                  // 1) Tiempo 1 (downbeat fuerte con pegada)
                  addFunkNote(deepRoot, beat + 0.0, 0.32);
                  // 2) Síncopa en 'a' de 1 (offset 0.75) con la octava o fundamental
                  addFunkNote(deepRoot, beat + 0.75, 0.20);
                  // 3) '&' de 2 (offset 1.5) con la fundamental u octava
                  addFunkNote(octMidi, beat + 1.5, 0.22);
                  // 4) Tiempo 3 (offset 2.0): Golpe con la 5ta o fundamental bloqueando con el kick
                  addFunkNote(fifthMidi, beat + 2.0, 0.28);
                  // 5) Síncopa en 'a' de 3 (offset 2.75) con la octava
                  addFunkNote(octMidi, beat + 2.75, 0.20);
                  // 6) Conducción al siguiente compás (offset 3.5 o 3.75): aproximación cromática o flat 7
                  const approachMidi = nextRootMidi ? (nextRootMidi > deepRoot ? nextRootMidi - 1 : nextRootMidi + 1) : flat7Midi;
                  addFunkNote(approachMidi, beat + 3.75, 0.18);
              } else {
                  // Compás B: Variación en semicorcheas con rebote rítmico y aproximación
                  // 1) Tiempo 1 (fundamental percusiva)
                  addFunkNote(deepRoot, beat + 0.0, 0.32);
                  // 2) Contratiempo '&' de 1 (offset 0.5)
                  addFunkNote(deepRoot, beat + 0.5, 0.22);
                  // 3) 'a' de 2 (offset 1.75) octava preparando el 3
                  addFunkNote(octMidi, beat + 1.75, 0.20);
                  // 4) Tiempo 3 (offset 2.0) y 'e' de 3 (offset 2.25)
                  addFunkNote(deepRoot, beat + 2.0, 0.26);
                  addFunkNote(thirdMidi, beat + 2.5, 0.22);
                  // 5) Turnaround sincopado en 3.5 y 3.75
                  addFunkNote(flat7Midi, beat + 3.5, 0.22);
                  addFunkNote(fifthMidi, beat + 3.75, 0.18);
              }
          } else if (remainingBeats >= 2) {
              // 2 tiempos por compás (cambios frecuentes de acorde): se adapta automáticamente
              addFunkNote(deepRoot, beat + 0.0, 0.32);
              addFunkNote(deepRoot, beat + 0.75, 0.20);
              addFunkNote(octMidi, beat + 1.5, 0.22);
              if (remainingBeats >= 1.75) {
                  addFunkNote(fifthMidi, beat + 1.75, 0.18);
              }
          } else {
              // 1 tiempo: ataque conciso en downbeat y posible síncopa de paso
              addFunkNote(deepRoot, beat + 0.0, 0.32);
              if (remainingBeats >= 0.75) {
                  addFunkNote(octMidi, beat + 0.5, 0.20);
              }
          }
      }
      return notes;
  }

  if (isBlues) {
      // =======================================================================
      // BLUES: Walking Bass Blues / Chicago Shuffle / Boogie auténtico
      // Opciones estilísticas:
      // - Walking bass continuo en negras con swing (fundamental, 3ra, 5ta, 6ta / 7ma b)
      // - Patrón Boogie tradicional (fundamental - 3ra - 5ta - 6ta - b7 - 6ta - 5ta - 3ra)
      // - Ataque redondo, con peso, articulación clara y notas no excesivamente largas (0.75 a 0.85 beats)
      // =======================================================================
      let deepRoot = rootMidi;
      while (deepRoot > 43) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      const chordIntervals = getChordIntervals(parsed.type as any);
      // Tercera (mayor o menor según el acorde, blues tradicional usa 3ra mayor en dom7 o menor en acordes menores)
      const thirdInterval = chordIntervals.length > 1 ? (chordIntervals[1] % 12) : (intervals[2] || 4);
      const fifthInterval = chordIntervals.length > 2 ? (chordIntervals[2] % 12) : (intervals[4] || 7);
      const sixthInterval = 9; // 6ta natural típica del boogie shuffle
      const flat7Interval = chordIntervals.some(i => (i % 12) === 10) ? 10 : (intervals[6] || 10);

      const thirdMidi = deepRoot + thirdInterval <= 46 ? deepRoot + thirdInterval : deepRoot + thirdInterval - 12;
      const fifthMidi = deepRoot + fifthInterval <= 48 ? deepRoot + fifthInterval : deepRoot + fifthInterval - 12;
      const sixthMidi = deepRoot + sixthInterval <= 50 ? deepRoot + sixthInterval : deepRoot + sixthInterval - 12;
      const flat7Midi = deepRoot + flat7Interval <= 52 ? deepRoot + flat7Interval : deepRoot + flat7Interval - 12;

      const addBluesNote = (midiVal: number, offset: number, dur: number) => {
          if (offset >= chordBeats) return;
          const maxDur = Math.max(0.25, Math.min(dur, (chordBeats - offset) - 0.05));
          notes.push({
              freq: midiToFreq(midiVal),
              timeOffset: offset,
              durationBeats: maxDur,
          });
      };

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const measureIdx = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = measureIdx % 4;

          if (remainingBeats >= 4) {
              if (barCycle === 0) {
                  // Patrón A (Walking Blues Root - 3rd - 5th - 6th):
                  // Típico de Willie Dixon / Chicago Blues
                  addBluesNote(deepRoot, beat + 0.0, 0.82);
                  addBluesNote(thirdMidi, beat + 1.0, 0.80);
                  addBluesNote(fifthMidi, beat + 2.0, 0.80);
                  addBluesNote(sixthMidi, beat + 3.0, 0.80);
              } else if (barCycle === 1) {
                  // Patrón B (Walking Blues 5th - 6th - b7 - Approach / Chromatic leading tone):
                  // Conducción hacia la tónica o siguiente acorde
                  addBluesNote(deepRoot, beat + 0.0, 0.82);
                  addBluesNote(fifthMidi, beat + 1.0, 0.80);
                  addBluesNote(flat7Midi, beat + 2.0, 0.80);
                  // Nota de paso / aproximación cromática al siguiente compás
                  let approachMidi = nextRootMidi !== null
                      ? (nextRootMidi > deepRoot ? nextRootMidi - 1 : nextRootMidi + 1)
                      : sixthMidi;
                  while (approachMidi > 46) approachMidi -= 12;
                  while (approachMidi < 28) approachMidi += 12;
                  addBluesNote(approachMidi, beat + 3.0, 0.78);
              } else if (barCycle === 2) {
                  // Patrón C (Boogie Woogie ascendente y descendente: Root - 3rd - 5th - 6th)
                  addBluesNote(deepRoot, beat + 0.0, 0.82);
                  addBluesNote(thirdMidi, beat + 1.0, 0.80);
                  addBluesNote(fifthMidi, beat + 2.0, 0.80);
                  addBluesNote(thirdMidi, beat + 3.0, 0.80);
              } else {
                  // Patrón D (Turnaround / Frase de cierre: Root - b7 - 6th - 5th hacia la siguiente raíz)
                  addBluesNote(deepRoot, beat + 0.0, 0.82);
                  addBluesNote(flat7Midi, beat + 1.0, 0.80);
                  addBluesNote(sixthMidi, beat + 2.0, 0.80);
                  addBluesNote(fifthMidi, beat + 3.0, 0.80);
              }
          } else if (remainingBeats === 2) {
              // 2 pulsos por acorde (ej. turnarounds I - V o IV - I):
              // Tiempo 1: Fundamental | Tiempo 2: Quinta o aproximación
              addBluesNote(deepRoot, beat + 0.0, 0.82);
              const step2 = nextRootMidi !== null
                  ? (nextRootMidi > deepRoot ? nextRootMidi - 1 : nextRootMidi + 1)
                  : fifthMidi;
              addBluesNote(step2, beat + 1.0, 0.78);
          } else {
              // Menor a 2 pulsos
              for (let b = 0; b < remainingBeats; b++) {
                  const m = b === 0 ? deepRoot : fifthMidi;
                  addBluesNote(m, beat + b, 0.80);
              }
          }
      }

      return notes;
  }

  if (isReggaeton) {
      // =======================================================================
      // REGGAETÓN: BAJO PESADO Y BOMBO COMO UNA SOLA UNIDAD RÍTMICA
      // - El bajo toca EXCLUSIVAMENTE LA TÓNICA (Root) del acorde actual.
      // - NO usa quinta, tercera, séptima, octava melódica ni cromatismos.
      // - El bajo sigue EXACTAMENTE los ataques del BOMBO dembow.
      // - Cada vez que golpea el kick, el bajo ataca la tónica.
      // - Cuando NO hay kick, el bajo permanece en silencio.
      // - Notas profundas, pesadas, redondas y repetitivas (duración corchea a negra corta, ~0.40 - 0.70 beats).
      // - Registro sub-bass profundo y sólido: MIDI 28 a 41 (E1 a F2).
      // =======================================================================
      let deepRoot = rootMidi;
      while (deepRoot > 41) deepRoot -= 12;
      while (deepRoot < 28) deepRoot += 12;

      const addKickSyncedBass = (midiVal: number, offset: number, dur: number) => {
          if (offset >= chordBeats) return;
          // Respetar estrictamente el límite del acorde actual
          const maxDur = Math.max(0.20, Math.min(dur, (chordBeats - offset) - 0.05));
          notes.push({
              freq: midiToFreq(midiVal),
              timeOffset: offset,
              durationBeats: maxDur,
          });
      };

      for (let beat = 0; beat < chordBeats; beat += beatsPerBar) {
          const remainingBeats = chordBeats - beat;
          const measureIdx = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = measureIdx % 4;

          // Patrones de ataque idénticos a los del kick:
          // barCycle 0: [0.0, 1.0, 2.0, 3.0]
          // barCycle 1: [0.0, 1.0, 1.50, 2.0, 3.0]
          // barCycle 2: [0.0, 1.0, 2.0, 2.50, 3.0]
          // barCycle 3: [0.0, 1.0, 2.0, 3.0, 3.50]
          if (remainingBeats >= 4) {
              if (barCycle === 0) {
                  // Compás 1: Kick en 1, 2, 3, 4 (tónica pura)
                  addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 1.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 2.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 3.0, 0.65);
              } else if (barCycle === 1) {
                  // Compás 2: Kick en 1, 2, '&' de 2 (1.50), 3, 4 (tónica pura)
                  addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 1.0, 0.42);
                  addKickSyncedBass(deepRoot, beat + 1.5, 0.42); // Coincide exactamente con kick en '&' de 2
                  addKickSyncedBass(deepRoot, beat + 2.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 3.0, 0.65);
              } else if (barCycle === 2) {
                  // Compás 3: Kick en 1, 2, 3, '&' de 3 (2.50), 4 (tónica pura)
                  addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 1.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 2.0, 0.42);
                  addKickSyncedBass(deepRoot, beat + 2.5, 0.42); // Coincide exactamente con kick en '&' de 3
                  addKickSyncedBass(deepRoot, beat + 3.0, 0.65);
              } else {
                  // Compás 4: Kick en 1, 2, 3, 4, '&' de 4 (3.50) (tónica pura)
                  addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 1.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 2.0, 0.70);
                  addKickSyncedBass(deepRoot, beat + 3.0, 0.42);
                  addKickSyncedBass(deepRoot, beat + 3.5, 0.40); // Coincide exactamente con kick en '&' de 4
              }
          } else if (remainingBeats === 2) {
              // 2 pulsos por acorde: Ataques en 1 y 2 coincidiendo con el kick (tónica pura)
              addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
              addKickSyncedBass(deepRoot, beat + 1.0, 0.65);
          } else {
              // 1 pulso por acorde: Ataque en tiempo 1 coincidiendo con el kick (tónica pura)
              addKickSyncedBass(deepRoot, beat + 0.0, 0.70);
          }
      }

      return notes;
  }

  if (isRock) {
      // Rock / Straight pattern
      for (let beat = 0; beat < chordBeats; beat++) {
          notes.push({ freq: midiToFreq(rootMidi), timeOffset: beat, durationBeats: 0.5 });
          notes.push({ freq: midiToFreq(rootMidi), timeOffset: beat + 0.5, durationBeats: 0.4 });
      }
      return notes;
  }

  // =========================================================================
  // JAZZ SWING: Walking Bass en negras continuas (4 notas por compás en 4/4)
  // =========================================================================
  // Si el acorde dura todo el compás:
  // Tiempo 1 (beat 0): Tónica
  // Tiempo 2 (beat 1): Tercera
  // Tiempo 3 (beat 2): Quinta
  // Tiempo 4 (beat 3): Nota de paso / aproximación hacia el siguiente acorde
  for (let beat = 0; beat < chordBeats; beat++) {
      let midi = rootMidi;

      if (chordBeats >= 4) {
          // El acorde dura todo el compás en 4/4
          if (beat === 0) {
              // Tiempo 1: Tónica
              midi = rootMidi;
          } else if (beat === 1) {
              // Tiempo 2: Tercera
              midi = rootMidi + i3rd;
              if (midi > 45) midi -= 12;
          } else if (beat === 2) {
              // Tiempo 3: Quinta
              midi = rootMidi + i5th;
              if (midi > 45) midi -= 12;
          } else if (beat === 3) {
              // Tiempo 4: Nota de paso / aproximación cromática al siguiente acorde
              if (nextRootMidi !== null) {
                  midi = nextRootMidi + (nextRootMidi > rootMidi ? -1 : 1);
              } else {
                  midi = rootMidi + (intervals[6] || 10);
              }
              if (midi > 45) midi -= 12;
          } else {
              const toneDist = beat % 2 === 0 ? i5th : i3rd;
              midi = rootMidi + toneDist;
              if (midi > 45) midi -= 12;
          }
      } else if (chordBeats === 2) {
          // Dos acordes por compás: Tónica en tiempo 1, y aproximación/quinta en tiempo 2
          if (beat === 0) {
              midi = rootMidi;
          } else {
              if (nextRootMidi !== null) {
                  midi = nextRootMidi + (nextRootMidi > rootMidi ? -1 : 1);
              } else {
                  midi = rootMidi + i5th;
              }
              if (midi > 45) midi -= 12;
          }
      } else {
          // 1 o 3 tiempos
          if (beat === 0) {
              midi = rootMidi;
          } else if (beat === chordBeats - 1 && nextRootMidi !== null) {
              midi = nextRootMidi + (nextRootMidi > rootMidi ? -1 : 1);
              if (midi > 45) midi -= 12;
          } else {
              midi = rootMidi + (beat === 1 ? i3rd : i5th);
              if (midi > 45) midi -= 12;
          }
      }

      // Negras continuas (0.95 de duración por negra)
      notes.push({ freq: midiToFreq(midi), timeOffset: beat, durationBeats: 0.95 });
  }

  return notes;
}

export interface CompingChord {
  freqs: number[];
  timeOffset: number;
  durationBeats: number;
}

const CompingPatternBank = [
  [0.0, 1.5],       // Patrón Charleston clásico: Tiempo 1 y contratiempo ('y') del tiempo 2
  [1.0, 2.5],       // Comping de anticipación: Tiempo 2 y anticipación del tiempo 4 ('y' del tiempo 3)
  [0.0, 1.5, 2.5],  // Charleston extendido con anticipación del 4
  [1.0, 3.5],       // Tiempo 2 y anticipación del tiempo 1 del siguiente compás
  [0.5, 2.0],       // Charleston invertido sincopado
];

let lastCompingMeasure = -1;
let currentCompingPattern = CompingPatternBank[0];
let lastCompingVoicingMidis: number[] | null = null;

export const FUNK_COMPING_STEPS_16: number[] = [0, 3, 7, 10, 12];

export function generateComping(
  chord: PlaybackChord,
  style: string = "",
  globalBeatPhase: number = 0,
  _harmonicInstrument: 'piano' | 'guitar' | 'epiano' = 'piano',
  timeSignature: string = "4/4"
): CompingChord[] {
  const comping: CompingChord[] = [];
  const beats = chord.beatsLength;
  const beatsPerBar = getBeatsPerBar(timeSignature);

  if (globalBeatPhase === 0) {
    lastCompingVoicingMidis = null;
  }

  // Motor de Voicings de Jazz de Estudio (Tipo A / Tipo B con Smooth Voice Leading en E3-C5):
  // El Bajo ya toca la Fundamental en C2-B2, por lo que la Armonía usa 4 voces abiertas
  // (3ra y 7ma abajo, tensiones arriba, sin choques de 5ta contra #11 o b13 ni fundamental junto a b9).
  const precomputedMidis = (chord as any)?.voicingMidis as number[] | undefined;
  const voicingMidis =
    Array.isArray(precomputedMidis) && precomputedMidis.length >= 3
      ? precomputedMidis
      : buildJazzVoicing(chord.chordString || "Cmaj7", lastCompingVoicingMidis);

  lastCompingVoicingMidis = voicingMidis;
  const freqs: number[] = voicingMidis.map(midiToFreq);

  const styleLower = style.toLowerCase();
  const isBossa = styleLower.includes("bossa") || styleLower.includes("latin");
  const isBolero = styleLower.includes("bolero");
  const isReggaeton = styleLower.includes("reggaetón") || styleLower.includes("reggaeton") || styleLower.includes("reguetón") || styleLower.includes("regueton") || styleLower.includes("dembow") || styleLower.includes("perreo");
  const isReggae = !isReggaeton && (styleLower.includes("reggae") || styleLower.includes("dub") || styleLower.includes("ska"));
  const isRnb = styleLower.includes("r&b") || styleLower.includes("rnb") || styleLower.includes("neo-soul");
  const isHipHop = styleLower.includes("hip hop") || styleLower.includes("hip-hop") || styleLower.includes("rap") || styleLower.includes("trap") || styleLower.includes("boom bap");
  const isCumbia = styleLower.includes("cumbia") || styleLower.includes("chicha");
  const isCool = styleLower.includes("cool");
  const isFunk = styleLower.includes("funk");
  const isBlues = styleLower.includes("blues") || styleLower.includes("shuffle") || styleLower.includes("boogie");
  const isPop = !isFunk && !isBlues && !isReggaeton && !isBolero && styleLower.includes("pop");
  const isRock = !isFunk && !isBlues && !isReggaeton && !isPop && (styleLower.includes("rock") || styleLower.includes("straight"));
  const [, compingDenominator] = timeSignature.split("/").map((s) => parseInt(s.trim(), 10));
  const isEighthMeter = compingDenominator === 8;

  // =========================================================================
  // COMPING MUSICAL ESPECÍFICO PARA 3/4, 6/8, 12/8, 9/8, 7/8 y 5/8
  // =========================================================================
  if (isEighthMeter || beatsPerBar === 3) {
      const addCompChord = (offset: number, dur: number) => {
          if (offset >= beats) return;
          const safeDur = Math.max(0.22, Math.min(dur, (beats - offset) * 0.94));
          comping.push({
              freqs,
              timeOffset: offset,
              durationBeats: safeDur,
          });
      };

      // 1. En 3/4: Acorde largo en el tiempo 0 y un golpe corto de comping en el tiempo 2 (o contratiempo)
      if (!isEighthMeter && beatsPerBar === 3) {
          for (let barOffset = 0; barOffset < beats; barOffset += 3) {
              const rem = beats - barOffset;
              const measureIdx = Math.floor((globalBeatPhase + barOffset) / 3);
              if (rem >= 2.5) {
                  // Acorde largo en el tiempo 0
                  addCompChord(barOffset + 0.0, 1.65);
                  // Golpe corto de comping en el tiempo 2 (o contratiempo 1.66 en compases alternos)
                  const stabOffset = measureIdx % 2 === 0 ? 2.0 : 1.66;
                  addCompChord(barOffset + stabOffset, 0.45);
              } else {
                  addCompChord(barOffset + 0.0, Math.max(0.45, rem * 0.85));
              }
          }
          return comping;
      }

      // 2. En 6/8, 12/8 y 9/8: Plancha el acorde en los pulsos principales (0 y 3 en 6/8;
      //    0 y 6 con ligero apoyo en 3 y 9 en 12/8), evitando repetir el acorde en cada corchea.
      if (isEighthMeter && (beatsPerBar === 6 || beatsPerBar === 12 || beatsPerBar === 9)) {
          for (let barOffset = 0; barOffset < beats; barOffset += beatsPerBar) {
              const rem = beats - barOffset;
              if (beatsPerBar === 6) {
                  // Pulso principal 0 (negra con puntillo)
                  addCompChord(barOffset + 0.0, Math.min(2.65, rem));
                  // Segundo pulso principal 3 (negra con puntillo)
                  if (rem > 3.0) {
                      addCompChord(barOffset + 3.0, Math.min(2.40, rem - 3.0));
                  }
              } else if (beatsPerBar === 12) {
                  // Pulso fuerte 0 (planchado largo)
                  addCompChord(barOffset + 0.0, Math.min(2.70, rem));
                  // Ligero apoyo en 3
                  if (rem > 3.0) {
                      addCompChord(barOffset + 3.0, Math.min(1.45, rem - 3.0));
                  }
                  // Pulso fuerte 6 (planchado largo)
                  if (rem > 6.0) {
                      addCompChord(barOffset + 6.0, Math.min(2.70, rem - 6.0));
                  }
                  // Ligero apoyo en 9
                  if (rem > 9.0) {
                      addCompChord(barOffset + 9.0, Math.min(1.45, rem - 9.0));
                  }
              } else {
                  // 9/8: Pulsos principales 0, 3 y 6
                  addCompChord(barOffset + 0.0, Math.min(2.65, rem));
                  if (rem > 3.0) addCompChord(barOffset + 3.0, Math.min(2.65, rem - 3.0));
                  if (rem > 6.0) addCompChord(barOffset + 6.0, Math.min(2.35, rem - 6.0));
              }
          }
          return comping;
      }

      // 3. En 7/8: Golpes rítmicos de comping sincronizados con la clave 2+2+3 (pulsos 0, 2 y 4)
      if (isEighthMeter && beatsPerBar === 7) {
          for (let barOffset = 0; barOffset < beats; barOffset += 7) {
              const rem = beats - barOffset;
              addCompChord(barOffset + 0.0, Math.min(1.65, rem));
              if (rem > 2.0) {
                  addCompChord(barOffset + 2.0, Math.min(1.65, rem - 2.0));
              }
              if (rem > 4.0) {
                  addCompChord(barOffset + 4.0, Math.min(2.35, rem - 4.0));
              }
          }
          return comping;
      }

      // 4. En 5/8: Golpes rítmicos sincronizados con la clave 3+2 (pulsos 0 y 3)
      if (isEighthMeter && beatsPerBar === 5) {
          for (let barOffset = 0; barOffset < beats; barOffset += 5) {
              const rem = beats - barOffset;
              addCompChord(barOffset + 0.0, Math.min(2.35, rem));
              if (rem > 3.0) {
                  addCompChord(barOffset + 3.0, Math.min(1.65, rem - 3.0));
              }
          }
          return comping;
      }
  }

  if (isBossa) {
      // Clave Bossa Nova adaptada dinámicamente al ciclo de 2 compases
      const cycleLength = beatsPerBar * 2;
      for (let beat = 0; beat < beats; beat += 0.5) {
          const globalBeat = (globalBeatPhase + beat) % cycleLength;
          const beatInBar = globalBeat % beatsPerBar;
          if (
              beatInBar === 0.0 ||
              beatInBar === 1.5 % beatsPerBar ||
              (beatsPerBar >= 3 && beatInBar === 2.5 % beatsPerBar)
          ) {
              comping.push({ freqs, timeOffset: beat, durationBeats: 0.3 }); // Short staccato
          }
      }
      return comping;
  }

  if (isBolero) {
      // Bolero: Armonía cálida, romántica y elegante (Piano, Guitarra o EPiano)
      // Acordes largos con ataques principalmente en 1 y 3, arpegios suaves ocasionales y sustain medio/largo.
      // NO usar contratiempo reggae ni golpes secos funk.
      const boleroFreqs = freqs;

      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const currentMeasure = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = currentMeasure % 2;

          if (remainingBeats >= 3.5) {
              if (barCycle === 0) {
                  // Compás A: Acordes largos cálidos con ataques en tiempos 1 y 3
                  // Tiempo 1 (beat 0.0): Acorde amplio con sustain largo (1.85 beats)
                  comping.push({
                      freqs: boleroFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.85,
                  });
                  // Tiempo 3 (beat 2.0): Acorde amplio con sustain largo (1.85 beats)
                  comping.push({
                      freqs: boleroFreqs,
                      timeOffset: beat + 2.0,
                      durationBeats: 1.85,
                  });
              } else {
                  // Compás B: Acorde largo en tiempo 1 y arpegio suave romántico ocasional en tiempos 3 y 4
                  // Tiempo 1 (beat 0.0): Acorde amplio con sustain largo (1.85 beats)
                  comping.push({
                      freqs: boleroFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.85,
                  });

                  // Arpegio suave romántico en 3 y 4:
                  // Tiempo 3 (beat 2.0): Base armónica con sustain (0.95 beats)
                  comping.push({
                      freqs: boleroFreqs.slice(0, Math.min(3, boleroFreqs.length)),
                      timeOffset: beat + 2.0,
                      durationBeats: 0.95,
                  });
                  // Despliegue arpegiado suave de las notas medias y superiores del acorde
                  if (boleroFreqs.length >= 3) {
                      // Contratiempo de 3 (beat 2.5): Nota intermedia con sustain cálido
                      comping.push({
                          freqs: [boleroFreqs[1]],
                          timeOffset: beat + 2.5,
                          durationBeats: 0.85,
                      });
                      // Tiempo 4 (beat 3.0): Nota superior melódica
                      comping.push({
                          freqs: [boleroFreqs[boleroFreqs.length - 1]],
                          timeOffset: beat + 3.0,
                          durationBeats: 0.90,
                      });
                      // Contratiempo de 4 (beat 3.5): Nota de resolución suave
                      comping.push({
                          freqs: [boleroFreqs[boleroFreqs.length > 3 ? 2 : 0]],
                          timeOffset: beat + 3.5,
                          durationBeats: 0.45,
                      });
                  } else {
                      // Si no hay suficientes notas para arpegio, acorde largo en tiempo 3
                      comping.push({
                          freqs: boleroFreqs,
                          timeOffset: beat + 2.0,
                          durationBeats: 1.85,
                      });
                  }
              }
          } else if (remainingBeats >= 1.8) {
              // 2 pulsos por acorde: acorde largo en tiempo 1
              comping.push({
                  freqs: boleroFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(1.85, remainingBeats),
              });
          } else {
              // 1 pulso por acorde: acorde sostenido
              comping.push({
                  freqs: boleroFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(0.95, remainingBeats),
              });
          }
      }
      return comping;
  }

  if (isReggae) {
      // Reggae: TECLADO / PIANO / RHODES - SKANK / CHOP auténtico
      // Compás 4/4 (o subdivisión en contratiempos):
      // 1 & 2 & 3 & 4 &
      // - X - X - X - X  (SOLO en los contratiempos '&', nunca en los tiempos fuertes 1, 2, 3, 4)
      //
      // Voicing específico para Reggae:
      // Registro medio y medio-agudo limpio (ej. E3 / G3 hasta E5 / G5), evitando registro grave (C2-E2-G2)
      // para dejar todo el espacio al bajo y la batería.
      const reggaeFreqs = freqs;

      // Generar chops estrictamente en el contratiempo ("&") de cada pulso
      // En 4/4: 0.5, 1.5, 2.5, 3.5 (tiempo 1 &, tiempo 2 &, tiempo 3 &, tiempo 4 &)
      for (let beat = 0; beat < beats; beat += 1.0) {
          const offbeatTime = beat + 0.5;
          if (offbeatTime < beats) {
              // Duración muy corta, seca y percusiva (ataque rápido, sin sustain, corte inmediato)
              comping.push({
                  freqs: reggaeFreqs,
                  timeOffset: offbeatTime,
                  durationBeats: 0.14, // Chop / skank corto y percusivo
              });
          }
      }
      return comping;
  }

  if (isRnb) {
      // R&B / Neo Soul: Acordes cálidos, abiertos, sostenidos y con amplio espacio (Rhodes / EPiano / Piano cálido)
      // Voicing específico R&B / Neo Soul:
      // Conservar completamente las tensiones del acorde ingresado (7, maj7, m7, 9, m9, 11, 13)
      // Mantener registro medio y medio-agudo abierto (E3 a G#5: ~164Hz a ~830Hz), dejando libre el sub y graves para el bajo profundo
      const rnbFreqs = freqs;

      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const currentMeasure = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const barCycle = currentMeasure % 4;

          if (remainingBeats >= 3.5) {
              if (barCycle === 0) {
                  // Compás 1: Acordes amplios con sustain envolvente en tiempos 1 (1.9 beats) y 3 (1.9 beats)
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.9,
                  });
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 2.0,
                      durationBeats: 1.9,
                  });
              } else if (barCycle === 1) {
                  // Compás 2: Acorde en tiempo 1 (1.4 beats), y síncopa suave en '&' de 2 (beat 1.5) ligada hacia el final (2.4 beats)
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.4,
                  });
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 1.5,
                      durationBeats: 2.4,
                  });
              } else if (barCycle === 2) {
                  // Compás 3: Acorde pleno sostenido desde el tiempo 1 (3.8 beats de pad / Rhodes cálido), dejando respirar el compás
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 3.8,
                  });
              } else {
                  // Compás 4: Acorde en tiempo 1 (1.9 beats) y segundo acorde en tiempo 3 o '&' de 3 (beat 2.5) con caída suave
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.9,
                  });
                  comping.push({
                      freqs: rnbFreqs,
                      timeOffset: beat + 2.5,
                      durationBeats: 1.4,
                  });
              }
          } else if (remainingBeats >= 2) {
              // 2 tiempos por compás: acorde sostenido en tiempo 1 (1.9 beats)
              comping.push({
                  freqs: rnbFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(1.9, remainingBeats),
              });
          } else {
              // 1 tiempo: acorde sostenido que llena el slot
              comping.push({
                  freqs: rnbFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(0.95, remainingBeats),
              });
          }
      }
      return comping;
  }

  if (isHipHop) {
      // Hip Hop: Acompañamiento armónico tipo sample / loop boom-bap, espaciado y limpio
      // Voicing específico para Hip Hop: registro medio y medio-agudo (evita frecuencias graves < 220Hz para no competir con el bajo y bombo)
      const hipHopFreqs = freqs;

      // Iterar por compás para crear el loop musical con espacio y respiración
      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const currentBar = Math.floor((globalBeatPhase + beat) / beatsPerBar);
          const isBarA = currentBar % 2 === 0;

          if (remainingBeats >= 3.5) {
              if (isBarA) {
                  // Opción A / C: Acorde en tiempo 1 sostenido que respira, y acorde en tiempo 3 con espacio
                  // Tiempo 1 (beat 0.0): Acorde sostenido con peso (1.25 beats), dejando libre la caja en tiempo 2
                  comping.push({
                      freqs: hipHopFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.25,
                  });
                  // Tiempo 3 (beat 2.0): Acorde espaciado (1.10 beats), dejando libre la caja en tiempo 4
                  comping.push({
                      freqs: hipHopFreqs,
                      timeOffset: beat + 2.0,
                      durationBeats: 1.10,
                  });
              } else {
                  // Opción B: Acorde en tiempo 1 y respuesta corta sincopada (stab de vinilo/sample)
                  // Tiempo 1 (beat 0.0): Acorde con cuerpo (1.15 beats)
                  comping.push({
                      freqs: hipHopFreqs,
                      timeOffset: beat + 0.0,
                      durationBeats: 1.15,
                  });
                  // Respuesta corta sincopada en '&' de 2 (beat 1.52): Puñalada corta (stab ~0.35 beats)
                  comping.push({
                      freqs: hipHopFreqs,
                      timeOffset: beat + 1.52,
                      durationBeats: 0.35,
                  });
                  // [Tiempos 3 y 4 con espacio amplio para que respiren el bajo y la batería]
              }
          } else if (remainingBeats >= 1.75) {
              // 2 acordes por compás: ataque sólido en tiempo 1 con respiración antes del siguiente acorde
              comping.push({
                  freqs: hipHopFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(1.2, remainingBeats - 0.2),
              });
          } else {
              // 1 acorde por compás corto
              comping.push({
                  freqs: hipHopFreqs,
                  timeOffset: beat + 0.0,
                  durationBeats: Math.min(0.75, remainingBeats),
              });
          }
      }
      return comping;
  }

  if (isCumbia) {
      // Cumbia: Acordes marcando estrictamente en el contratiempo (la segunda corchea de cada tiempo: 0.5, 1.5, 2.5, 3.5)
      for (let beat = 0; beat < beats; beat += 1.0) {
          comping.push({ freqs, timeOffset: beat + 0.5, durationBeats: 0.28 });
      }
      return comping;
  }

  if (isCool) {
      // Cool Jazz: Comping muy minimalista (solo en el tiempo 1 y la anticipación del 4)
      const swingRatio = 0.66;
      for (let beat = 0; beat < beats; beat += 0.5) {
          const measureBeat = (globalBeatPhase + beat) % beatsPerBar;
          if (measureBeat === 0.0) {
              comping.push({ freqs, timeOffset: beat, durationBeats: Math.min(1.8, beatsPerBar * 0.9) });
          } else if (measureBeat === 2.5 || (beatsPerBar === 3 && measureBeat === 1.5)) {
              const timeOffset = Math.floor(beat) + (0.5 * 2 * swingRatio);
              comping.push({ freqs, timeOffset, durationBeats: 0.45 });
          }
      }
      return comping;
  }

  if (isFunk) {
      // Funk: Acompañamiento rítmico percusivo (Chank / Skank / Scratch en 16ths)
      // Voicing específico para Funk:
      // Registro medio y medio-agudo limpio (ej. E3 / G3 hasta E5 / G5, evitando < 220Hz)
      // para dejar total claridad y pegada al bajo y bombo sincopados.
      const funkFreqs = freqs;

      // Patrones de 16 semicorcheas por compás en 4/4 (1 e & a 2 e & a 3 e & a 4 e & a):
      // Compás A: Síncopas en 0 (tiempo 1), 3 ('a' de 1), 6 ('&' de 2), 10 ('&' de 3), 14 ('&' de 4)
      // Compás B: Síncopas en 2 ('&' de 1), 7 ('a' de 2), 8 (tiempo 3), 11 ('a' de 3), 14 ('&' de 4)
      const funkCompingA = [0, 3, 6, 10, 14];
      const funkCompingB = [2, 7, 8, 11, 14];

      const stepsInBar = beatsPerBar * 4;
      for (let beat = 0; beat < beats; beat += 0.25) {
          const absoluteBeat = globalBeatPhase + beat;
          const measureIdx = Math.floor(absoluteBeat / beatsPerBar);
          const isBarA = measureIdx % 2 === 0;
          const activeSteps = isBarA ? funkCompingA : funkCompingB;

          const measureBeat = absoluteBeat % beatsPerBar;
          const stepInBar = Math.round(measureBeat * 4) % stepsInBar;

          if (activeSteps.includes(stepInBar % 16)) {
              // Duración staccato extremadamente corta y percusiva (0.15 a 0.20 beats)
              comping.push({
                  freqs: funkFreqs,
                  timeOffset: beat,
                  durationBeats: 0.18,
              });
          }
      }
      return comping;
  }

  if (isBlues) {
      // =======================================================================
      // BLUES: ARMONÍA (Piano / Rhodes / Guitarra Blues Shuffle auténtico)
      // - Voicings auténticos de Blues: acordes con 7ma dominante (o menor/9na)
      //   priorizando 3ra y 7ma (guías tonales), más fundamental/5ta/9na
      // - Registro medio y medio-agudo limpio (G3 a G5), sin invadir el grave del bajo
      // - Patrón rítmico: comping shuffle / boogie rhythm en tresillos de corchea
      //   Acompañamiento rítmico con síncopas, stabs en contratiempo shuffle,
      //   y respuesta bluesera
      // =======================================================================
      const bluesFreqs = freqs;

      // Subdivisión shuffle (1 = 0.0, 1a = 0.667 | 2 = 1.0, 2a = 1.667 | 3 = 2.0, 3a = 2.667 | 4 = 3.0, 4a = 3.667)
      const SHUFFLE_TRIPLET = 2.0 / 3.0; // ~0.667

      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const absoluteBeat = globalBeatPhase + beat;
          const measureIdx = Math.floor(absoluteBeat / beatsPerBar);
          const barCycle = measureIdx % 4;

          const addComp = (offset: number, dur: number) => {
              if (offset >= remainingBeats) return;
              const maxDur = Math.max(0.18, Math.min(dur, (remainingBeats - offset) - 0.04));
              comping.push({
                  freqs: bluesFreqs,
                  timeOffset: beat + offset,
                  durationBeats: maxDur,
              });
          };

          if (remainingBeats >= 4) {
              if (barCycle === 0) {
                  // Compás 1: Ataque sólido en tiempo 1 con sustain medio, y respuesta en contratiempo shuffle de 2 y 4
                  // Tiempo 1 (beat 0.0): Acorde con cuerpo
                  addComp(0.0, 0.55);
                  // Pickup en tiempo 2a (beat 1.667): Stab corto
                  addComp(1.0 + SHUFFLE_TRIPLET, 0.28);
                  // Tiempo 3 (beat 2.0): Acorde marcado
                  addComp(2.0, 0.45);
                  // Pickup en tiempo 4a (beat 3.667): Anticipación hacia el compás siguiente
                  addComp(3.0 + SHUFFLE_TRIPLET, 0.28);
              } else if (barCycle === 1) {
                  // Compás 2: Shuffle rítmico continuo en corcheas atresilladas (Charleston / Shuffle groove)
                  // Tiempos 2 y 3 con sus pickups característicos
                  addComp(0.0, 0.38);
                  addComp(0.0 + SHUFFLE_TRIPLET, 0.26);
                  // Tiempo 2 (beat 1.0) junto a la caja
                  addComp(1.0, 0.42);
                  // Tiempo 3a (beat 2.667)
                  addComp(2.0 + SHUFFLE_TRIPLET, 0.28);
                  // Tiempo 4 (beat 3.0)
                  addComp(3.0, 0.45);
              } else if (barCycle === 2) {
                  // Compás 3: Síncopas espaciadas ("dejar respirar" a la melodía / solo)
                  // Entrada en '&' de 1 (offset 0.667) y tiempo 3
                  addComp(0.0 + SHUFFLE_TRIPLET, 0.32);
                  addComp(2.0, 0.55);
                  addComp(3.0 + SHUFFLE_TRIPLET, 0.28);
              } else {
                  // Compás 4: Turnaround rítmico con stabs percusivos
                  // Stabs en 1, 2, y doble golpe shuffle en 3 y 4
                  addComp(0.0, 0.42);
                  addComp(1.0 + SHUFFLE_TRIPLET, 0.28);
                  addComp(2.0, 0.38);
                  addComp(2.0 + SHUFFLE_TRIPLET, 0.26);
                  addComp(3.0, 0.45);
              }
          } else if (remainingBeats === 2) {
              // 2 pulsos por compás: Tiempo 1 y pickup shuffle en tiempo 2
              addComp(0.0, 0.55);
              addComp(1.0 + SHUFFLE_TRIPLET, 0.28);
          } else {
              // 1 pulso por compás
              addComp(0.0, 0.65);
          }
      }

      return comping;
  }

  if (isReggaeton) {
      // =======================================================================
      // REGGAETÓN: ARMONÍA / PIANO ESPACIADO, SIMPLE Y CON SUSTAIN
      // - CERO contratiempo tipo reggae, CERO skank (- X - X - X - X).
      // - Ejecuta los acordes ingresados por el usuario con golpes más largos y espaciados.
      // - Golpes principales: tiempo 1 y tiempo 3 con sustain (X - X -),
      //   o acorde sostenido de compás completo (X - - -).
      // - Voicings en registro medio y con cuerpo, sin invadir frecuencias graves.
      // - Deja todo el espacio central para el peso del dembow, el bajo y la voz.
      // =======================================================================
      const reggaetonFreqs = freqs;

      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const absoluteBeat = globalBeatPhase + beat;
          const measureIdx = Math.floor(absoluteBeat / beatsPerBar);
          const barCycle = measureIdx % 4;

          const addSustainedChord = (offset: number, dur: number) => {
              if (offset >= remainingBeats) return;
              const maxDur = Math.max(0.60, Math.min(dur, (remainingBeats - offset) - 0.08));
              comping.push({
                  freqs: reggaetonFreqs,
                  timeOffset: beat + offset,
                  durationBeats: maxDur,
              });
          };

          if (remainingBeats >= 4) {
              if (barCycle === 0 || barCycle === 2) {
                  // Compases 1 y 3: Acordes con peso y sustain en tiempo 1 y tiempo 3 (X - X -)
                  // Tiempo 1 (beat 0.0) -> sustain 1.75 beats
                  addSustainedChord(0.0, 1.75);
                  // Tiempo 3 (beat 2.0) -> sustain 1.75 beats
                  addSustainedChord(2.0, 1.75);
              } else if (barCycle === 1) {
                  // Compás 2: Acorde sostenido durante la barra completa (X - - -)
                  // Deja respirar al máximo el beat de dembow
                  addSustainedChord(0.0, 3.60);
              } else {
                  // Compás 4: Tiempo 1 sostenido (X - X -) con ligera resolución en tiempo 3
                  addSustainedChord(0.0, 1.75);
                  addSustainedChord(2.0, 1.75);
              }
          } else if (remainingBeats === 2) {
              // 2 pulsos por acorde: Acorde en tiempo 1 con sustain completo
              addSustainedChord(0.0, 1.85);
          } else {
              // 1 pulso por acorde: Acorde en tiempo 1 con sustain
              addSustainedChord(0.0, 0.90);
          }
      }

      return comping;
  }

  if (isPop) {
      // =======================================================================
      // POP: ARMONÍA (Limpia, clara, comercial, moderna y pop-rock suave)
      // - Usa exactamente los acordes ingresados por el usuario.
      // - Ejecución clara y regular:
      //   * Negras, blancas, acordes sostenidos y algunos contratiempos suaves.
      //   * Voicing equilibrado (Piano / EPiano / Teclado) en registro medio (C3 a C5).
      //   * Dinámica musical por compás:
      //     - Compás 1: Acordes claros en blancas (tiempo 1 y tiempo 3).
      //     - Compás 2: Ataque en tiempo 1, sutil contratiempo suave en '2 &' y blanca en tiempo 3.
      //     - Compás 3: Acordes en negras o sostenido musical con buen sustain.
      //     - Compás 4: Ataque en 1, 2, y anticipación en '4 &' hacia el cambio de compás.
      // =======================================================================
      const popFreqs = freqs;

      const addChord = (offset: number, dur: number) => {
          if (offset >= beats) return;
          const maxDur = Math.max(0.25, Math.min(dur, (beats - offset) * 0.95));
          comping.push({
              freqs: popFreqs,
              timeOffset: offset,
              durationBeats: maxDur,
          });
      };

      for (let beat = 0; beat < beats; beat += beatsPerBar) {
          const remainingBeats = beats - beat;
          const absoluteBeat = globalBeatPhase + beat;
          const measureIdx = Math.floor(absoluteBeat / beatsPerBar);
          const barCycle = measureIdx % 4;

          if (remainingBeats >= 3.5) {
              if (barCycle === 0) {
                  // Compás 1: Blancas limpias y claras en tiempos 1 y 3
                  addChord(beat + 0.0, 1.85); // Blanca (tiempos 1 y 2)
                  addChord(beat + 2.0, 1.85); // Blanca (tiempos 3 y 4)
              } else if (barCycle === 1) {
                  // Compás 2: Tiempo 1, contratiempo suave en '2 &' (offset 1.5) y tiempo 3
                  addChord(beat + 0.0, 1.35); // Negra con puntillo suave
                  addChord(beat + 1.5, 0.40); // Contratiempo suave en 2 &
                  addChord(beat + 2.0, 1.85); // Blanca sostenida
              } else if (barCycle === 2) {
                  // Compás 3: Acordes en negras o pulso pop constante
                  addChord(beat + 0.0, 0.90);
                  addChord(beat + 1.0, 0.90);
                  addChord(beat + 2.0, 0.90);
                  addChord(beat + 3.0, 0.90);
              } else {
                  // Compás 4: Acorde sostenido con anticipación suave en 4 &
                  addChord(beat + 0.0, 1.85);
                  addChord(beat + 2.0, 1.35);
                  addChord(beat + 3.5, 0.45); // Anticipación suave al siguiente compás
              }
          } else if (remainingBeats >= 2.0) {
              // 2 pulsos: 2 negras limpias o una blanca sostenida
              addChord(beat + 0.0, 0.90);
              addChord(beat + 1.0, 0.90);
          } else {
              // 1 pulso
              addChord(beat + 0.0, 0.90);
          }
      }

      return comping;
  }

  if (isRock) {
      for (let beat = 0; beat < beats; beat += 1.0) {
          const globalBeat = (globalBeatPhase + beat) % beatsPerBar;
          if (globalBeat === 0.0 || (beatsPerBar > 2 && globalBeat === 2.0)) {
              comping.push({ freqs, timeOffset: beat, durationBeats: Math.min(1.8, beatsPerBar * 0.9) });
          }
      }
      return comping;
  }

  // Jazz / Swing default adaptado al número de pulsos del compás
  const measureIdx = Math.floor(globalBeatPhase / beatsPerBar);
  if (measureIdx !== lastCompingMeasure) {
      currentCompingPattern = CompingPatternBank[Math.floor(Math.random() * CompingPatternBank.length)];
      lastCompingMeasure = measureIdx;
  }

  const swingRatio = 0.66; // triplet swing feel for .5 values

  for (let beat = 0; beat < beats; beat += 0.5) {
      // Se empareja dentro del compás dinámico (% beatsPerBar)
      const measureBeat = (globalBeatPhase + beat) % beatsPerBar;
      
      let shouldPlay = false;
      if (beatsPerBar === 4) {
        shouldPlay = currentCompingPattern.includes(measureBeat);
      } else if (beatsPerBar === 3) {
        shouldPlay = measureBeat === 0.0 || measureBeat === 1.5 || measureBeat === 2.0;
      } else if (beatsPerBar === 2) {
        shouldPlay = measureBeat === 0.0 || measureBeat === 1.5;
      } else if (beatsPerBar === 5) {
        shouldPlay = measureBeat === 0.0 || measureBeat === 2.0 || measureBeat === 3.5;
      } else {
        shouldPlay = measureBeat === 0.0 || measureBeat === Math.floor(beatsPerBar / 2) + 0.5;
      }

      if (shouldPlay) {
          const isOffBeat = measureBeat % 1 !== 0;
          const durationBeats = isOffBeat ? 0.35 : Math.min(0.65, beats - beat);
          
          let timeOffset = beat;
          if (isOffBeat) {
             const fraction = beat % 1;
             timeOffset = Math.floor(beat) + (fraction * 2 * swingRatio);
          }

          // Respetar estrictamente la duración del acorde en la grilla
          if (timeOffset < beats) {
             const maxDuration = Math.max(0.2, (beats - timeOffset) * 0.95);
             comping.push({ freqs, timeOffset, durationBeats: Math.min(durationBeats, maxDuration) });
          }
      }
  }
  
  return comping;
}
