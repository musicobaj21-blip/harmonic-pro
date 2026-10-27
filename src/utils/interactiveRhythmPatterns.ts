/**
 * Diccionario de Patrones Rítmicos y Matriz de Secuenciador para Análisis Interactivo
 *
 * Arquitectura de 4 Canales / Filas Independientes (Kit drumjazz):
 * 1. Canal Bombo (Kick) -> /public/audio/drumjazz/jazz-drum-kit-kick_G_minor.wav
 * 2. Canal Caja (Snare / Rim Clave) -> /public/audio/drumjazz/jazz-drum-kit-punchy-snare_G_minor.wav / jazz-drum-kit-rim_C_minor.wav
 * 3. Canal Hi-Hat (Chick / Closed) -> /public/audio/drumjazz/jazz-drum-kit-closed-hi-hat_F_minor.wav
 * 4. Canal Platillo Ride (Ride Swing / Corcheas Bossa) -> /public/audio/drumjazz/jazz-drum-kit-ride-2.wav
 *
 * Grooves Reales Implementados:
 * - JAZZ SWING (Autumn Leaves, Minor Swing, etc.):
 *   * Ride continuo clásico ("ding-ding-da-ding") con subdivisión en tresillo de swing en tiempos 2 y 4.
 *   * Hi-hat pedal chick cerrado estrictamente en tiempos 2 y 4.
 *   * Bombo y Caja en comping sutil e interactivo (punchy-snare_G_minor.wav): silencios largos y acentos esporádicos.
 * - BOSSA NOVA (Blue Bossa, Ipanema, Wave, etc.):
 *   * Ride en corcheas continuas (8th notes: estrictamente 2 golpes por negra relajados y a tempo).
 *   * Clave en Aro/Rim (jazz-drum-kit-rim_C_minor.wav): cross-stick / partido alto en 2 compases.
 *   * Bombo en 1 y 3 con anticipación sincopada brasileña (upbeat de 2 y upbeat de 4).
 *   * Hi-hat pedal chick en 2 y 4.
 * - ROCK / FUNK:
 *   * Kick en 1 y 3, Caja backbeat en 2 y 4, Hi-hat en corcheas.
 * - METRÓNOMO BÁSICO:
 *   * Click de madera / rim solo para referencia temporal.
 */

import { DrumSampleName } from './interactiveAnalysisAudio';

export interface DrumHitEvent {
  instrument: DrumSampleName;
  /** Desplazamiento temporal en fracciones del pulso (0 = a tiempo, 0.5 = corchea recta, 0.667 = tresillo swing) */
  timeOffset: number;
  /** Velocidad de golpeo (0.0 a 1.0) */
  velocity: number;
}

export interface DrumChannelMatrix {
  kick: DrumHitEvent[];
  snare: DrumHitEvent[];
  hihat: DrumHitEvent[];
  ride: DrumHitEvent[];
}

export type DrumStyle =
  | 'Jazz Swing'
  | 'Bossa Nova'
  | 'Bolero'
  | 'Pop'
  | 'Rock'
  | 'Reggae'
  | 'R&B'
  | 'Hip Hop'
  | 'Cumbia'
  | 'Cool Jazz'
  | 'Funk'
  | 'Blues'
  | 'Reggaetón'
  | 'Metronome Básico';

/**
 * Multiplicadores de ganancia base ocultos para equilibrar el volumen percibido (Loudness)
 * desde la fuente al cambiar entre estilos musicales.
 */
export const STYLE_BASE_GAIN_MULTIPLIERS: Record<DrumStyle, number> = {
  'Jazz Swing': 1.0,
  'Bossa Nova': 0.85,
  'Bolero': 0.85,
  'Pop': 0.90,
  'Rock': 0.90,
  'Reggae': 0.92,
  'R&B': 0.90,
  'Hip Hop': 0.94,
  'Cumbia': 0.88,
  'Cool Jazz': 1.0,
  'Funk': 0.88,
  'Blues': 0.92,
  'Reggaetón': 0.95,
  'Metronome Básico': 1.0,
};

export function getStyleBaseGainMultiplier(style?: DrumStyle | string): number {
  if (!style) return 1.0;
  const s = style.toLowerCase().trim();
  if (s.includes('reggaetón') || s.includes('reggaeton') || s.includes('dembow') || s.includes('perreo')) return 0.95;
  if (s.includes('bolero')) return 0.85;
  if (s.includes('bossa') || s.includes('latin')) return 0.85;
  if (s.includes('cumbia')) return 0.88;
  if (s.includes('funk')) return 0.88;
  if (s.includes('blues') || s.includes('shuffle') || s.includes('boogie')) return 0.92;
  if (s.includes('reggae') || s.includes('dub') || s.includes('ska')) return 0.92;
  if (s.includes('r&b') || s.includes('rnb')) return 0.90;
  if (s.includes('hip hop') || s.includes('hip-hop') || s.includes('rap') || s.includes('boom bap') || s.includes('trap')) return 0.94;
  if (s.includes('pop')) return 0.90;
  if (s.includes('rock')) return 0.90;
  if (s.includes('cool') || s.includes('west coast')) return 1.0;
  if (
    s.includes('swing') ||
    s.includes('jazz') ||
    s.includes('bebop') ||
    s.includes('gypsy') ||
    s.includes('ballad') ||
    s.includes('modal')
  ) {
    return 1.0;
  }
  return (STYLE_BASE_GAIN_MULTIPLIERS as Record<string, number>)[style] ?? 1.0;
}

/**
 * Detecta y asigna dinámicamente el estilo rítmico adecuado según el estilo de la canción analizada.
 */
export function detectDrumStyleFromSongStyle(songStyle?: string): DrumStyle {
  if (!songStyle) return 'Jazz Swing';
  const s = songStyle.toLowerCase().trim();

  if (s.includes('bolero')) {
    return 'Bolero';
  }

  if (s.includes('reggaetón') || s.includes('reggaeton') || s.includes('dembow') || s.includes('perreo')) {
    return 'Reggaetón';
  }

  if (s.includes('blues') || s.includes('shuffle') || s.includes('boogie')) {
    return 'Blues';
  }

  if (s.includes('reggae') || s.includes('dub') || s.includes('ska')) {
    return 'Reggae';
  }

  if (s.includes('funk') || s.includes('16th') || s.includes('groove') || s.includes('boogaloo')) {
    return 'Funk';
  }

  if (s.includes('r&b') || s.includes('rnb') || s.includes('neo-soul') || s.includes('soul')) {
    return 'R&B';
  }

  if (s.includes('hip hop') || s.includes('hip-hop') || s.includes('rap') || s.includes('trap') || s.includes('boom-bap') || s.includes('boom bap')) {
    return 'Hip Hop';
  }

  if (s.includes('cumbia') || s.includes('chicha')) {
    return 'Cumbia';
  }

  if (s.includes('bossa') || s.includes('latin')) {
    return 'Bossa Nova';
  }

  if (s.includes('cool') || s.includes('west coast')) {
    return 'Cool Jazz';
  }

  if (s.includes('pop')) {
    return 'Pop';
  }

  if (s.includes('rock')) {
    return 'Rock';
  }

  if (
    s.includes('swing') ||
    s.includes('jazz') ||
    s.includes('bebop') ||
    s.includes('gypsy') ||
    s.includes('ballad') ||
    s.includes('modal')
  ) {
    return 'Jazz Swing';
  }

  return 'Jazz Swing';
}

/**
 * Matriz matemática de 16 pasos por compás para el estilo Funk (4 pasos por tiempo en 4/4).
 * Subdivisión de la grilla:
 *  1 e & a   2 e & a   3 e & a   4 e & a
 *  0 1 2 3   4 5 6 7   8 9 10 11 12 13 14 15
 *
 * - HI-HAT: Principalmente CORCHEAS (pasos 0, 2, 4, 6, 8, 10, 12, 14).
 *   NO semicorcheas constantes. Solo corcheas con variaciones:
 *   algunas notas omitidas para respirar, leves acentuaciones,
 *   y solo muy ocasionalmente una semicorchea puntual como adorno o mini-fill.
 *   Sin open hi-hat (exclusivamente closed hi-hat).
 *
 * - BOMBO (KICK): Gran protagonismo y movimiento sincopado.
 *   Usa negras, corcheas y semicorcheas puntuales, variando entre compases A, B y C.
 *   Genera el verdadero groove funk en conversación con el bajo.
 *
 * - CAJA (SNARE): Golpe principal sólido y seco en 2 y 4 (pasos 4 y 12).
 *   Solo ghost notes muy ocasionales y sutiles (sin rellenar demasiado).
 */
export const FUNK_DRUM_GRID_16 = {
  // Compás A:
  // Kick: 1 (paso 0), & de 2 (paso 6), tiempo 3 (paso 8), a de 3 (paso 11) -> [X - - - | - - X - | X - - X | - - - -]
  kickA:        [0.96, 0.00, 0.00, 0.00, 0.00, 0.00, 0.88, 0.00, 0.92, 0.00, 0.00, 0.82, 0.00, 0.00, 0.84, 0.00],

  // Compás B:
  // Kick: 1 (paso 0), & de 1 (paso 2), 3 (paso 8), & de 3 (paso 10), e de 4 (paso 13) -> [X - X - | - - - - | X - X - | - X - -]
  kickB:        [0.96, 0.00, 0.84, 0.00, 0.00, 0.00, 0.00, 0.00, 0.92, 0.00, 0.86, 0.00, 0.00, 0.80, 0.00, 0.00],

  // Compás C / Turnaround:
  // Kick sincopado: 1 (paso 0), a de 1 (paso 3), tiempo 3 (paso 8), 4 (paso 12), a de 4 (paso 15)
  kickC:        [0.96, 0.00, 0.00, 0.82, 0.00, 0.00, 0.82, 0.00, 0.92, 0.00, 0.00, 0.00, 0.84, 0.00, 0.00, 0.80],

  // Caja A: Sólido en 2 (paso 4) y 4 (paso 12) + 1 ghost note muy suave en paso 10
  snareA:       [0.00, 0.00, 0.00, 0.00, 0.96, 0.00, 0.00, 0.00, 0.00, 0.00, 0.22, 0.00, 0.96, 0.00, 0.00, 0.00],

  // Caja B: Sólido en 2 (paso 4) y 4 (paso 12) + 1 ghost note muy suave en paso 7
  snareB:       [0.00, 0.00, 0.00, 0.00, 0.96, 0.00, 0.00, 0.22, 0.00, 0.00, 0.00, 0.00, 0.96, 0.00, 0.00, 0.00],

  // Hi-Hat Cerrado Compás A (Corcheas base con respiración: omite paso 6 donde entra el bombo fuerte):
  // 1 & 2 & 3 & 4 &: pasos 0, 2, 4, (omite 6), 8, 10, 12, 14
  hihatA:       [0.82, 0.00, 0.68, 0.00, 0.78, 0.00, 0.00, 0.00, 0.80, 0.00, 0.70, 0.00, 0.78, 0.00, 0.68, 0.00],

  // Hi-Hat Cerrado Compás B (Corcheas continuas dinámicas con un pequeño adorno de semicorchea en 'a' de 4):
  // 1 & 2 & 3 & 4 &: pasos 0, 2, 4, 6, 8, 10, 12, y adorno puntual 14 + 15
  hihatB:       [0.82, 0.00, 0.68, 0.00, 0.76, 0.00, 0.68, 0.00, 0.80, 0.00, 0.70, 0.00, 0.78, 0.00, 0.68, 0.50],

  // Hi-Hat Cerrado Compás C (Corcheas con espacio en paso 10 y adorno en paso 13):
  hihatC:       [0.84, 0.00, 0.70, 0.00, 0.78, 0.00, 0.68, 0.00, 0.80, 0.00, 0.00, 0.00, 0.78, 0.52, 0.68, 0.00],

  // Compatibilidad hacia atrás
  kick:         [0.96, 0.00, 0.00, 0.00, 0.00, 0.00, 0.88, 0.00, 0.92, 0.00, 0.00, 0.82, 0.00, 0.00, 0.84, 0.00],
  snare:        [0.00, 0.00, 0.00, 0.00, 0.96, 0.00, 0.00, 0.00, 0.00, 0.00, 0.22, 0.00, 0.96, 0.00, 0.00, 0.00],
  hihat_closed: [0.82, 0.00, 0.68, 0.00, 0.78, 0.00, 0.00, 0.00, 0.80, 0.00, 0.70, 0.00, 0.78, 0.00, 0.68, 0.00],
  hihat:        [0.82, 0.00, 0.68, 0.00, 0.78, 0.00, 0.00, 0.00, 0.80, 0.00, 0.70, 0.00, 0.78, 0.00, 0.68, 0.00],
};

/**
 * Parsea una métrica (ej. "6/8", "4/4", "3/4") y devuelve [numerador, denominador]
 */
export function parseTimeSignature(sig: string = '4/4'): [number, number] {
  if (!sig || !sig.includes('/')) return [4, 4];
  const parts = sig.split('/');
  const num = parseInt(parts[0], 10);
  const den = parseInt(parts[1], 10);
  return [
    isNaN(num) || num <= 0 ? 4 : num,
    isNaN(den) || den <= 0 ? 4 : den,
  ];
}

/**
 * Calcula dinámicamente el número de pulsos o tiempos por compás (numerador de la métrica)
 */
export function getBeatsPerBar(sig: string = '4/4'): number {
  const [num] = parseTimeSignature(sig);
  return num;
}

/**
 * Determina si la métrica tiene denominador 8 (compás de corcheas, ej: 6/8, 7/8, 12/8)
 */
export function isCompoundOrEighthMeter(sig: string = '4/4'): boolean {
  const [, den] = parseTimeSignature(sig);
  return den === 8;
}

/**
 * Obtiene la matriz rítmica de 4 canales para el pulso actual.
 * Cada canal es completamente independiente: el disparador de Ride está 100% aislado de la Caja.
 * Respeta de forma dinámica el límite del compás (beatsPerBar).
 */
export function getDrumMatrixForBeat(
  style: DrumStyle,
  beatInMeasure: number,
  globalBeatIndex: number,
  timeSignature: string = '4/4'
): DrumChannelMatrix {
  const emptyMatrix: DrumChannelMatrix = {
    kick: [],
    snare: [],
    hihat: [],
    ride: [],
  };

  if (style === 'Metronome Básico') {
    return emptyMatrix;
  }

  const beatsPerMeasure = getBeatsPerBar(timeSignature);
  // Normalización estricta al límite matemático del compás
  const effectiveBeat = beatInMeasure % beatsPerMeasure;
  const isLastBeatInMeasure = effectiveBeat === beatsPerMeasure - 1;
  const isCompound8th = isCompoundOrEighthMeter(timeSignature);

  // Subdivisión de tresillo de swing clásico (tercer tercio del tiempo en métricas de negra)
  const SWING_TRIPLET_OFFSET = 2.0 / 3.0; // ~0.667

  const measureIndexGlobal = Math.floor(globalBeatIndex / beatsPerMeasure);
  const useRimBackbeat =
    style === 'Jazz Swing' ||
    style === 'Cool Jazz' ||
    style === 'Bossa Nova' ||
    style === 'Bolero' ||
    style === 'R&B' ||
    style === 'Reggae';
  const backbeatInst: DrumSampleName = useRimBackbeat ? 'rim' : 'snare';

  // =========================================================================
  // GROOVES DE BATERÍA ESPECÍFICOS PARA 3/4 Y MÉTRICAS /8 (6/8, 12/8, 7/8, 5/8, 9/8)
  // =========================================================================
  if (!isCompound8th && beatsPerMeasure === 3) {
    // COMPÁS 3/4 (Jazz Waltz):
    // - Bombo en 0
    // - Hi-hat con pie en 1 y 2
    // - Ride marcando el vals de jazz (0, 1 + skip de swing, 2)
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    if (effectiveBeat === 0) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.78 });
      rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.76 });
    } else if (effectiveBeat === 1) {
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.74 });
      rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.78 });
      rideHits.push({ instrument: 'ride', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.58 });
    } else if (effectiveBeat === 2) {
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.72 });
      rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.70 });
      // Sutil apoyo de caja/rim en el tiempo 3 o contratiempo de vals
      if (measureIndexGlobal % 2 === 1) {
        snareHits.push({ instrument: backbeatInst, timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.48 });
      } else if (!useRimBackbeat) {
        snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.68 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  if (isCompound8th) {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    if (beatsPerMeasure === 6 || beatsPerMeasure === 12 || beatsPerMeasure === 9) {
      // COMPASES TERNARIOS COMPUESTOS (6/8, 12/8, 9/8):
      // - Ride / Hi-hat marcando todas las corcheas (0..5 o 0..11) con acento en los pulsos de negra con puntillo
      // - Bombo (Kick) en los tiempos fuertes (0 en 6/8; 0 y 6 en 12/8)
      // - Caja / Rimshot (Snare) clavada en el backbeat ternario (corchea 3 en 6/8; corcheas 3 y 9 en 12/8)
      const isStrongDownbeat =
        effectiveBeat === 0 || (beatsPerMeasure === 12 && effectiveBeat === 6);
      const isBackbeatPulse =
        (beatsPerMeasure === 6 && effectiveBeat === 3) ||
        (beatsPerMeasure === 12 && (effectiveBeat === 3 || effectiveBeat === 9)) ||
        (beatsPerMeasure === 9 && effectiveBeat === 3);
      const isDottedQuarterPulse = effectiveBeat % 3 === 0;

      const rideVel = isStrongDownbeat ? 0.80 : isDottedQuarterPulse ? 0.74 : 0.54;
      rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: rideVel });

      // Hi-hat acompaña en el backbeat ternario (o lleva las corcheas suaves en estilos urbanos/blues)
      if (isBackbeatPulse) {
        hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.72 });
      } else if (!useRimBackbeat) {
        hihatHits.push({
          instrument: 'hihat_closed',
          timeOffset: 0.0,
          velocity: isDottedQuarterPulse ? 0.64 : 0.44,
        });
      }

      // Bombo en los tiempos fuertes (0 en 6/8; 0 y 6 en 12/8; 0 y 6 en 9/8)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.88 });
      } else if ((beatsPerMeasure === 12 || beatsPerMeasure === 9) && effectiveBeat === 6) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
      } else if (measureIndexGlobal % 2 === 1 && effectiveBeat === beatsPerMeasure - 1) {
        // Pickup sutil en la última corchea cada 2 compases
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.56 });
      }

      // Caja / Rimshot clavada en el backbeat ternario (3 en 6/8; 3 y 9 en 12/8)
      if (isBackbeatPulse) {
        snareHits.push({ instrument: backbeatInst, timeOffset: 0.0, velocity: 0.84 });
      }
    } else if (beatsPerMeasure === 7) {
      // COMPÁS 7/8 (Subdivisión 2 + 2 + 3):
      // - Ride en las 7 corcheas (0..6) acentuando 0, 2, 4
      // - Bombo en 0 y 2
      // - Caja (Snare) en 4
      const isAccent = effectiveBeat === 0 || effectiveBeat === 2 || effectiveBeat === 4;
      rideHits.push({
        instrument: 'ride',
        timeOffset: 0.0,
        velocity: effectiveBeat === 0 ? 0.82 : isAccent ? 0.74 : 0.52,
      });

      if (effectiveBeat === 2 || effectiveBeat === 4) {
        hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.70 });
      }

      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.88 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
      }

      if (effectiveBeat === 4) {
        snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.86 });
      }
    } else if (beatsPerMeasure === 5) {
      // COMPÁS 5/8 (Subdivisión 3 + 2):
      // - Ride en las 5 corcheas (0..4) acentuando 0 y 3
      // - Bombo en 0
      // - Caja en 3
      const isAccent = effectiveBeat === 0 || effectiveBeat === 3;
      rideHits.push({
        instrument: 'ride',
        timeOffset: 0.0,
        velocity: effectiveBeat === 0 ? 0.82 : isAccent ? 0.74 : 0.52,
      });

      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.88 });
      }
      if (effectiveBeat === 3) {
        snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.84 });
        hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.70 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 1. JAZZ SWING (Estándares en 4/4 y 2/4 como Autumn Leaves, Minor Swing, etc.)
  // =========================================================================
  if (style === 'Jazz Swing') {
    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);

    // --- FILA 1: PLATILLO RIDE (jazz-drum-kit-ride-2.wav) ---
    const rideHits: DrumHitEvent[] = [];

    if (beatsPerMeasure === 2) {
      // 2/4: Tiempo 1 (ding), Tiempo 2 (ding-da)
      if (effectiveBeat === 0) {
        rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.72 });
      } else if (effectiveBeat === 1) {
        rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.76 });
        rideHits.push({ instrument: 'ride', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.58 });
      }
    } else {
      // 4/4 y métricas estándar de jazz:
      // Tiempos 1 y 3 (índices 0 y 2): Negras ("ding")
      // Tiempos 2 y 4 (índices 1 y 3): Figura de swing "ding-a" (negra + corchea atresillada)
      if (effectiveBeat === 0 || effectiveBeat === 2) {
        rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.72 });
      } else if (effectiveBeat === 1 || effectiveBeat === 3) {
        rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.78 });
        rideHits.push({ instrument: 'ride', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.58 });
      } else {
        // En métricas extendidas (5/4, etc.)
        if (effectiveBeat % 2 === 1) {
          rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.76 });
          rideHits.push({ instrument: 'ride', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.56 });
        } else {
          rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.70 });
        }
      }
    }

    // --- FILA 2: HI-HAT PEDAL (hihat_closed.wav) ---
    const hihatHits: DrumHitEvent[] = [];
    if (beatsPerMeasure === 2) {
      if (effectiveBeat === 1) {
        hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.74 });
      }
    } else {
      // 4/4: Tiempos 2 y 4 estrictos (pedal chick nítido y firme)
      if (effectiveBeat === 1 || effectiveBeat === 3 || (beatsPerMeasure > 4 && effectiveBeat % 2 === 1)) {
        hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.78 });
      }
    }

    // --- FILA 3: BOMBO (kick.wav) ---
    // Snare/Kick: Muy sutiles o con silencios, dejando el peso del ritmo en el Ride y el Hi-hat
    const kickHits: DrumHitEvent[] = [];
    const compingBarInCycle = measureIndex % 4;

    // Solo un roce tenue tipo pluma (feathering @ 0.16) cada 4 compases en el tiempo 1
    if (compingBarInCycle === 0 && effectiveBeat === 0) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.16 });
    }

    // --- FILA 4: CAJA (snare.wav) ---
    // Muy sutil o con silencios: comping ocasional muy tenue
    const snareHits: DrumHitEvent[] = [];
    if (compingBarInCycle === 2 && isLastBeatInMeasure) {
      snareHits.push({ instrument: 'snare', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.20 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 2. BOSSA NOVA (Estándares como Blue Bossa, The Girl from Ipanema, etc.)
  // =========================================================================
  if (style === 'Bossa Nova') {
    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);
    const barInTwoBarCycle = measureIndex % 2; // Compás 0 o 1 del ciclo de 2 compases

    // --- FILA 1: PLATILLO RIDE (jazz-drum-kit-ride-2.wav) ---
    // Ride en corcheas continuas durante todo el compás, truncado en beatsPerMeasure
    const isStrongBeat = effectiveBeat === 0 || effectiveBeat % 2 === 0;
    const rideHits: DrumHitEvent[] = [
      {
        instrument: 'ride',
        timeOffset: 0.0,
        velocity: isStrongBeat ? 0.64 : 0.60,
      },
      {
        instrument: 'ride',
        timeOffset: 0.5,
        velocity: isStrongBeat ? 0.50 : 0.48,
      },
    ];

    // --- FILA 2: HI-HAT (jazz-drum-kit-closed-hi-hat_F_minor.wav) ---
    // Pulso continuo y constante en cada tiempo
    const hihatHits: DrumHitEvent[] = [
      {
        instrument: 'hihat_closed',
        timeOffset: 0.0,
        velocity: 0.60,
      },
    ];

    // --- FILA 3: BOMBO (jazz-drum-kit-kick_G_minor.wav) ---
    // Síncopa real de Bossa Nova en 4/4:
    // Tiempo 1 (Beat 1), Contratiempo del tiempo 2 (corchea "y" del 2), Tiempo 3 (Beat 3), Contratiempo del tiempo 4 (corchea "y" del 4)
    const kickHits: DrumHitEvent[] = [];
    if (beatsPerMeasure === 4) {
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.74 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.85 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.74 });
      }
    } else {
      if (effectiveBeat % 2 === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
      } else {
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.74 });
      }
    }

    // --- FILA 4: CAJA / ARO (jazz-drum-kit-rim_C_minor.wav) ---
    // Clave tradicional de Bossa Nova (3:2) en aro / cross-stick:
    // Compás 1: Tiempo 1 (a tiempo), Tiempo 2 (al contratiempo / corchea al aire), Tiempo 4 (a tiempo)
    // Compás 2: Tiempo 2 (a tiempo), Tiempo 3 (al contratiempo / corchea al aire)
    const snareHits: DrumHitEvent[] = [];
    if (barInTwoBarCycle === 0) {
      if (effectiveBeat === 0) {
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.80 });
      } else if (effectiveBeat === 1) {
        snareHits.push({ instrument: 'rim', timeOffset: 0.5, velocity: 0.76 });
      } else if (effectiveBeat === 3 || (beatsPerMeasure < 4 && isLastBeatInMeasure)) {
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.78 });
      }
    } else {
      if (effectiveBeat === 1) {
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.78 });
      } else if (effectiveBeat === 2 || (beatsPerMeasure <= 3 && effectiveBeat === 1)) {
        snareHits.push({ instrument: 'rim', timeOffset: 0.5, velocity: 0.76 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // BOLERO (Compás 4/4 - Groove suave, romántico y estable)
  // =========================================================================
  if (style === 'Bolero') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // HI-HAT (Bolero tradicional - Referencia Bolero Básico):
    // TIEMPO 1: Subdivisión de la NEGRA en 6 partes iguales (1, 2, 3, 4, 5, 6)
    // Patrón: X - - X X X
    // - Subdivisión 1 (offset 0/6 = 0.0): ATAQUE (acento inicial)
    // - Subdivisión 2 (offset 1/6): silencio
    // - Subdivisión 3 (offset 2/6): silencio
    // - Subdivisión 4 (offset 3/6 = 0.5): ATAQUE (ligero y claro)
    // - Subdivisión 5 (offset 4/6 = 2/3): ATAQUE (ligero y claro)
    // - Subdivisión 6 (offset 5/6): ATAQUE (ligero y claro)
    // TIEMPOS 2, 3 y 4: Corcheas normales (1 & -> X X)
    if (effectiveBeat === 0) {
      // Tiempo 1: X - - X X X (6 subdivisiones de la negra)
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.46 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 3.0 / 6.0, velocity: 0.28 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 4.0 / 6.0, velocity: 0.27 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 5.0 / 6.0, velocity: 0.29 });
    } else {
      // Tiempos 2, 3 y 4: 2 corcheas regulares (X X) suaves y estables
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.34 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.5, velocity: 0.28 });
    }

    // Bombo suave principalmente en 1 y 3 (effectiveBeat 0 y 2):
    if (effectiveBeat === 0) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.58 });
    } else if (effectiveBeat === 2) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.52 });
    }

    // Aro / Cross-stick o caja muy suave en 2 y 4 (effectiveBeat 1 y 3):
    if (effectiveBeat === 1) {
      // Tiempo 2: Aro / cross-stick suave
      snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.58 });
    } else if (effectiveBeat === 3 || (beatsPerMeasure < 4 && isLastBeatInMeasure)) {
      // Tiempo 4: Aro / cross-stick suave
      snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.62 });
      // Percusión discreta: toque suave en el contratiempo (0.5)
      snareHits.push({ instrument: 'rim', timeOffset: 0.5, velocity: 0.34 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // POP / POP-ROCK (Compás 4/4 - Referencia de partitura Pop-Rock tradicional)
  // - Hi-Hat: Corcheas constantes y uniformes (1 & 2 & 3 & 4 &)
  // - Snare: Fuerte y sólido en 2 y 4 (backbeat clásico comercial)
  // - Kick: Variaciones de partitura pop-rock por compás sincronizadas con el bajo:
  //   * Compás 1 (Patrón 1): Bombo en 1 y 3
  //   * Compás 2 (Patrón 2): Bombo en 1, 3 y 3 &
  //   * Compás 3 (Patrón 3): Bombo en 1, 2 & y 3
  //   * Compás 4 (Patrón 4): Bombo en 1, 1 & y 3
  // =========================================================================
  if (style === 'Pop') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Cálculo del compás actual en el ciclo de 4 compases
    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);
    const barCycle = measureIndex % 4;

    // HI-HAT: Corcheas continuas (X X X X X X X X) sin adornos extraños
    // Pulso (0.0): toque firme y claro
    // Contratiempo (0.5): toque suave y regular
    const hhMainVel = (effectiveBeat === 0 || effectiveBeat === 2) ? 0.62 : 0.58;
    const hhOffVel = 0.44;

    hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: hhMainVel });
    hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.5, velocity: hhOffVel });

    // KICK (BOMBO): Sigue fielmente los patrones de partitura Pop-Rock
    if (barCycle === 0) {
      // Patrón 1: Bombo en 1 y 3
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.80 });
      }
    } else if (barCycle === 1) {
      // Patrón 2: Bombo en 1, 3 y 3 & (síncopa pop-rock clásica en el contratiempo del 3)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.80 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.66 });
      }
    } else if (barCycle === 2) {
      // Patrón 3: Bombo en 1, 2 & y 3 (anticipación pop-rock al tiempo 3)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.68 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.78 });
      }
    } else {
      // Patrón 4: Bombo en 1, 1 & y 3 (doble golpe pop-rock en tiempo 1)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.5, velocity: 0.68 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.80 });
      }
    }

    // SNARE (CAJA): Backbeat sólido y claro en tiempos 2 y 4 (effectiveBeat 1 y 3)
    if (effectiveBeat === 1) {
      snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.86 });
    } else if (effectiveBeat === 3 || (beatsPerMeasure < 4 && isLastBeatInMeasure)) {
      snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.88 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 3. ROCK
  // =========================================================================
  if (style === 'Rock') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [
      { instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.60 },
      { instrument: 'hihat_closed', timeOffset: 0.5, velocity: 0.40 },
    ];
    const rideHits: DrumHitEvent[] = [];

    // Bombo en pulsos pares (0, 2, 4...)
    if (effectiveBeat % 2 === 0) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.85 });
    }

    // Caja backbeat en pulsos impares (1, 3, 5...)
    if (effectiveBeat % 2 === 1) {
      snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.82 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // =========================================================================
  // 4. REGGAE (One Drop clásico en 4/4: bombo + cross stick en tiempo 3, hi-hat en corcheas)
  // =========================================================================
  if (style === 'Reggae') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Hi-Hat: Corcheas constantes (1 & 2 & 3 & 4 &) con leve humanización de dynamics (velocity)
    // El tiempo 1 se mantiene intencionalmente liviano y flotante
    const hiHatPattern = [
      { time: "0:0:0", velocity: 0.64 }, // Tiempo 1 (liviano)
      { time: "0:0:2", velocity: 0.58 }, // 1 &
      { time: "0:1:0", velocity: 0.70 }, // Tiempo 2
      { time: "0:1:2", velocity: 0.62 }, // 2 &
      { time: "0:2:0", velocity: 0.76 }, // Tiempo 3 (apoyo al One Drop)
      { time: "0:2:2", velocity: 0.60 }, // 3 &
      { time: "0:3:0", velocity: 0.68 }, // Tiempo 4
      { time: "0:3:2", velocity: 0.62 }, // 4 &
    ];

    hiHatPattern.forEach((entry) => {
      const parts = entry.time.split(':').map(Number);
      const entryBeat = parts[1];
      const sixteenth = parts[2];
      if (entryBeat === effectiveBeat % 4) {
        hihatHits.push({
          instrument: 'hihat_closed',
          timeOffset: sixteenth * 0.25,
          velocity: entry.velocity,
        });
      }
    });

    // Fallback para compases con más de 4 tiempos o no cuaternarios
    if (hihatHits.length === 0) {
      hihatHits.push(
        { instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.68 },
        { instrument: 'hihat_closed', timeOffset: 0.5, velocity: 0.60 }
      );
    }

    // Bombo (Kick) y Caja / Cross Stick (Rimshot):
    // ONE DROP CLÁSICO: Golpe principal simultáneo EXCLUSIVAMENTE en el TIEMPO 3 ("0:2:0").
    // Los tiempos 1, 2 y 4 quedan completamente libres (sin bombo y sin caja fuerte de rock en 2 y 4).
    if (beatsPerMeasure >= 4) {
      if (effectiveBeat === 2) {
        // Tiempo 3 ("0:2:0"): Bombo profundo + Cross Stick (rimshot)
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.94 });
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.88 });
      }
    } else if (beatsPerMeasure === 3) {
      if (effectiveBeat === 2) {
        // 3/4: One Drop en tiempo 3
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.92 });
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.88 });
      }
    } else if (beatsPerMeasure === 2) {
      if (effectiveBeat === 1) {
        // 2/4: One Drop en tiempo 2
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.92 });
        snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.88 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 5. R&B (Groove R&B / Neo Soul: relajado, sobrio, elegante y profundo)
  // Relación: BOMBO en 1 y 3 | ARO/RIMSHOT en 2 y 4 | HI-HAT en 2 y 4
  // =========================================================================
  if (style === 'R&B') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Ciclo de compases para sutiles variaciones orgánicas de bombo y dinámica
    const currentMeasure = Math.floor(globalBeatIndex / beatsPerMeasure);
    const barCycle = currentMeasure % 4;

    // -------------------------------------------------------------------------
    // 1. HI-HAT: A contratiempo (offbeats / '&'), exactamente igual que el chop/piano reggae
    // Compás 4/4:
    // 1 & 2 & 3 & 4 &
    // - X - X - X - X
    // Toca estrictamente en los contratiempos (timeOffset: 0.50), nunca a tiempo.
    // Discreto, elegante, suave y seco.
    // -------------------------------------------------------------------------
    hihatHits.push({
      instrument: 'hihat_closed',
      timeOffset: 0.50, // Contratiempo exacto (& de 1, & de 2, & de 3, & de 4)
      velocity: (effectiveBeat === 1 || effectiveBeat === 3) ? 0.52 : 0.46, // Sutil dinámica elegante
    });

    // -------------------------------------------------------------------------
    // 2. CAJA / ARO: Utilizar ARO / CROSS STICK / RIMSHOT (instrument: 'rim')
    // NO usar caja fuerte. El aro marca exactamente los tiempos 2 y 4 (1 2 3 4 -> - X - X).
    // Suave, seco y cálido con micro-retardo laid-back (+0.015).
    // -------------------------------------------------------------------------
    if (effectiveBeat === 1 || effectiveBeat === 3) {
      snareHits.push({
        instrument: 'rim', // Aro / Cross stick auténtico
        timeOffset: 0.015, // Micro-retardo relajado "behind the beat"
        velocity: effectiveBeat === 1 ? 0.60 : 0.65, // Suave, seco y cálido
      });
    }

    // -------------------------------------------------------------------------
    // 3. BOMBO: Básico, profundo y relajado.
    // Base principal: TIEMPO 1 y TIEMPO 3 (1 2 3 4 -> X - X -)
    // Variaciones sutiles entre compases sin sobrecargar:
    // Compás 1: X - - - X - - - (Base pura 1 y 3)
    // Compás 2: X - - - X X - - (1, 3 y '&' de 3)
    // Compás 3: X - - X X - - - (1, '&' de 2 y 3)
    // Compás 4: X - - - X - - X (1, 3 y anticipación suave en '&' de 4)
    // -------------------------------------------------------------------------
    if (barCycle === 0) {
      // Variación 1 (Base pura): 1 y 3
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
      }
    } else if (barCycle === 1) {
      // Variación 2: X - - - X X - - (1, 3 y '&' de 3)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.72 });
      }
    } else if (barCycle === 2) {
      // Variación 3: X - - X X - - - (1, '&' de 2 y 3)
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.70 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.80 });
      }
    } else {
      // Variación 4: 1, 3 y anticipación relajada en '&' de 4
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.82 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.65 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 6. HIP HOP (Boom-bap clásico, bombo pesado con swing, caja seca en 2 y 4)
  // =========================================================================
  if (style === 'Hip Hop') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);
    const isBarA = measureIndex % 2 === 0;
    const isBar4 = measureIndex % 4 === 3;

    // --- 1. HI-HAT: Corcheas constantes (1 & 2 & 3 & 4 &) con swing MPC sutil (~0.52) ---
    // Dinámicas humanizadas por pulso para que respire con el groove
    let hatDownVel = 0.78;
    let hatUpVel = 0.60;
    if (effectiveBeat === 1 || effectiveBeat === 3) {
      // En pulsos 2 y 4 el Hi-Hat es levemente más suave para que la caja resuene al frente
      hatDownVel = 0.68;
      hatUpVel = 0.62;
    } else if (effectiveBeat === 2) {
      hatDownVel = 0.76;
      hatUpVel = 0.58;
    }

    // Golpe 1 de corchea (downbeat a tiempo)
    hihatHits.push({
      instrument: 'hihat_closed',
      timeOffset: 0.0,
      velocity: hatDownVel,
    });

    // Golpe 2 de corchea (upbeat / contratiempo con sutil groove boom-bap relajado)
    hihatHits.push({
      instrument: 'hihat_closed',
      timeOffset: 0.52,
      velocity: hatUpVel,
    });

    // Variaciones ocasionales de Hi-Hat (boom-bap sin sonar a trap):
    // - Doble golpe / ghost note antes de la caja en compases impares (tiempo 1 hacia la caja en 2):
    if (!isBarA && effectiveBeat === 0) {
      hihatHits.push({
        instrument: 'hihat_closed',
        timeOffset: 0.78,
        velocity: 0.42,
      });
    }
    // - Pequeño pickup roll al final de ciclo (compás 4, tiempo 4):
    if (isBar4 && effectiveBeat === 3) {
      hihatHits.push({
        instrument: 'hihat_closed',
        timeOffset: 0.76,
        velocity: 0.44,
      });
    }

    // --- 2. BOMBO (KICK): Principalmente en tiempo 1 y golpes adicionales sincopados ---
    // Patrón base: Tiempo 1 siempre presente, alternando síncopas auténticas de boom-bap
    if (effectiveBeat === 0) {
      // Tiempo 1: Bombo pesado, profundo y contundente
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
    } else if (effectiveBeat === 1) {
      // En Compás A: Síncopa en el contratiempo del tiempo 2 ('&' de 2: 1, & de 2, 3)
      if (isBarA) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.52, velocity: 0.84 });
      }
    } else if (effectiveBeat === 2) {
      // Tiempo 3: Bombo sólido que asienta el pulso
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.88 });
      // En Compás B: Síncopa adicional en el contratiempo del 3 ('&' de 3)
      if (!isBarA) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.52, velocity: 0.80 });
      }
    } else if (effectiveBeat === 3) {
      // En compás 4: Ocasional pickup sincopado al final de compás hacia el tiempo 1
      if (isBar4) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.52, velocity: 0.72 });
      }
    }

    // --- 3. CAJA (SNARE): Fuerte, marcada y seca estrictamente en tiempos 2 y 4 ---
    if (effectiveBeat === 1 || effectiveBeat === 3 || (beatsPerMeasure > 4 && effectiveBeat % 2 === 1)) {
      snareHits.push({
        instrument: 'snare',
        timeOffset: 0.0,
        velocity: 0.96,
      });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 7. CUMBIA (Patrón latino fundamental, galopa en Hi-Hat/Güiro)
  // =========================================================================
  if (style === 'Cumbia') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Figura de GALOPA por cada tiempo (Corchea, Semicorchea, Semicorchea)
    // El acento va ligeramente en la última semicorchea para dar el empuje de la cumbia.
    const hiHatPattern = [
      { time: "0:0:0", velocity: 0.7 }, { time: "0:0:2", velocity: 0.4 }, { time: "0:0:3", velocity: 0.9 },
      { time: "0:1:0", velocity: 0.7 }, { time: "0:1:2", velocity: 0.4 }, { time: "0:1:3", velocity: 0.9 },
      { time: "0:2:0", velocity: 0.7 }, { time: "0:2:2", velocity: 0.4 }, { time: "0:2:3", velocity: 0.9 },
      { time: "0:3:0", velocity: 0.7 }, { time: "0:3:2", velocity: 0.4 }, { time: "0:3:3", velocity: 0.9 }
    ];

    // Leer el time y velocity del arreglo hiHatPattern para agendar la galopa con groove dinámico
    hiHatPattern.forEach((entry) => {
      const parts = entry.time.split(':').map(Number);
      const entryBeat = parts[1];
      const sixteenth = parts[2];

      if (entryBeat === effectiveBeat % 4) {
        // En Tone.js cada semicorchea representa 0.25 del tiempo (negra)
        const timeOffset = sixteenth * 0.25;
        hihatHits.push({
          instrument: 'hihat_closed',
          timeOffset,
          velocity: entry.velocity,
        });
      }
    });

    // Bombo (Kick): Negras continuas en todos los tiempos fuertes
    // Tiempos programados en Tone.js: ["0:0:0", "0:1:0", "0:2:0", "0:3:0"]
    const kickPattern = ["0:0:0", "0:1:0", "0:2:0", "0:3:0"];
    kickPattern.forEach((timeStr) => {
      const parts = timeStr.split(':').map(Number);
      const entryBeat = parts[1];
      const sixteenth = parts[2];
      if (entryBeat === effectiveBeat % 4) {
        kickHits.push({
          instrument: 'kick',
          timeOffset: sixteenth * 0.25,
          velocity: 0.88,
        });
      }
    });

    // Caja / Aro (Snare / Rimshot): Marca estrictamente negras continuas junto al bombo
    // Tiempos programados en Tone.js: ["0:0:0", "0:1:0", "0:2:0", "0:3:0"]
    const snarePattern = ["0:0:0", "0:1:0", "0:2:0", "0:3:0"];
    snarePattern.forEach((timeStr) => {
      const parts = timeStr.split(':').map(Number);
      const entryBeat = parts[1];
      const sixteenth = parts[2];
      if (entryBeat === effectiveBeat % 4) {
        snareHits.push({
          instrument: 'rim',
          timeOffset: sixteenth * 0.25,
          velocity: 0.82,
        });
      }
    });

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 5. COOL JAZZ (Swing espaciado, ride constante, hi-hat 2 y 4, minimalista)
  // =========================================================================
  if (style === 'Cool Jazz') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Ride constante relajado y espaciado
    rideHits.push({ instrument: 'ride', timeOffset: 0.0, velocity: 0.65 });
    if (effectiveBeat % 2 === 1) {
      // Skip note de swing sutil y elegante en 2 y 4
      rideHits.push({ instrument: 'ride', timeOffset: SWING_TRIPLET_OFFSET, velocity: 0.44 });
      // Hi-hat pedal constante en tiempos 2 y 4
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.68 });
    }

    // Bombo espaciado y muy sutil (solo pluma en el tiempo 1)
    if (effectiveBeat === 0) {
      kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.35 });
    }

    // Caja espaciada y suave (rim sutil en el tiempo 4 en 4/4)
    if (effectiveBeat === 3 || (beatsPerMeasure <= 3 && effectiveBeat === beatsPerMeasure - 1)) {
      snareHits.push({ instrument: 'rim', timeOffset: 0.0, velocity: 0.32 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 6. FUNK (Groove auténtico: Hi-Hat en corcheas con variaciones, bombo sincopado con protagonismo, caja en 2 y 4)
  // =========================================================================
  if (style === 'Funk') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    // Ciclo de compases (A, B, C) para brindar variedad orgánica sin caer en repetición mecánica
    const currentMeasure = Math.floor(globalBeatIndex / beatsPerMeasure);
    const measureCycle = currentMeasure % 3;

    // Cada pulso comprende 4 subdivisiones de semicorchea (offsets: 0.0, 0.25, 0.5, 0.75)
    const stepStart = effectiveBeat * 4;
    const offsets = [0.0, 0.25, 0.5, 0.75];

    // Matrices rítmicas según el compás en el ciclo
    let kickGrid = FUNK_DRUM_GRID_16.kickA;
    let snareGrid = FUNK_DRUM_GRID_16.snareA;
    let hatGrid = FUNK_DRUM_GRID_16.hihatA;

    if (measureCycle === 1) {
      kickGrid = FUNK_DRUM_GRID_16.kickB;
      snareGrid = FUNK_DRUM_GRID_16.snareB;
      hatGrid = FUNK_DRUM_GRID_16.hihatB;
    } else if (measureCycle === 2) {
      kickGrid = FUNK_DRUM_GRID_16.kickC;
      snareGrid = FUNK_DRUM_GRID_16.snareA;
      hatGrid = FUNK_DRUM_GRID_16.hihatC;
    }

    for (let sub = 0; sub < 4; sub++) {
      const stepIndex = (stepStart + sub) % 16;
      const offset = offsets[sub];

      // --- 1. HI-HAT: Principalmente corcheas con respiración (sin semicorcheas continuas, sin open hi-hat) ---
      const hatVel = hatGrid[stepIndex];
      if (hatVel > 0) {
        hihatHits.push({
          instrument: 'hihat_closed',
          timeOffset: offset,
          velocity: hatVel,
        });
      }

      // --- 2. BOMBO (KICK): Movimiento sincopado principal que genera el groove ---
      const kickVel = kickGrid[stepIndex];
      if (kickVel > 0) {
        kickHits.push({
          instrument: 'kick',
          timeOffset: offset,
          velocity: kickVel,
        });
      }

      // --- 3. CAJA (SNARE): Golpe principal sólido y seco en tiempos 2 y 4 (pasos 4 y 12) + ghost ocasional ---
      const snareVel = snareGrid[stepIndex];
      if (snareVel > 0) {
        snareHits.push({
          instrument: 'snare',
          timeOffset: offset,
          velocity: snareVel,
        });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 10. BLUES (Chicago / Texas Shuffle clásico en 4/4 con subdivisión ternaria)
  // Sensación: DAA-da (1 trip let, 2 trip let, 3 trip let, 4 trip let)
  // HI-HAT / RIDE: Shuffle continuo (pulso 0.0 + pickup atresillado 0.667)
  // CAJA (SNARE): Golpes principales sólidos en 2 y 4 con ghost notes suaves
  // BOMBO (KICK): Base en 1 y 3 con variaciones orgánicas según el compás
  // =========================================================================
  if (style === 'Blues') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);
    const barInCycle = measureIndex % 4; // Ciclo de 4 compases para variaciones de bombo y ghost notes
    const SHUFFLE_PICKUP = 2.0 / 3.0; // 0.667 (tercer tercio del tresillo)

    // 1. HI-HAT CERRADO (SHUFFLE GROOVE DAA-da)
    // En cada pulso de negra: golpe a tierra (fuerte/marcado) y golpe débil atresillado
    if (effectiveBeat === 0 || effectiveBeat === 2) {
      // Tiempos 1 y 3: DAA-da con dinámica moderada
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.72 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: SHUFFLE_PICKUP, velocity: 0.54 });
    } else {
      // Tiempos 2 y 4: DAA-da con acento del backbeat
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.82 });
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: SHUFFLE_PICKUP, velocity: 0.56 });
    }

    // 2. CAJA (SNARE): Golpe principal sólido y seco en 2 y 4 + ghost notes atresilladas
    if (effectiveBeat === 1 || effectiveBeat === 3) {
      // Tiempo 2 y Tiempo 4: Backbeat de caja firme y auténtico
      snareHits.push({ instrument: 'snare', timeOffset: 0.0, velocity: 0.84 });
    }

    // Ghost notes sutiles de caja para enriquecer el shuffle en compases específicos
    if (barInCycle === 1 && effectiveBeat === 2) {
      // Compás 2: Ghost note atresillada en el tercer tercio del tiempo 3 preparando la caja del 4
      snareHits.push({ instrument: 'snare', timeOffset: SHUFFLE_PICKUP, velocity: 0.26 });
    } else if (barInCycle === 3 && effectiveBeat === 0) {
      // Compás 4 (fin de frase blues): Ghost note tenue en el pickup del tiempo 1
      snareHits.push({ instrument: 'snare', timeOffset: SHUFFLE_PICKUP, velocity: 0.28 });
    }

    // 3. BOMBO (KICK): Base principal en tiempos 1 y 3 con variaciones shuffle
    if (barInCycle === 0) {
      // Compás 1 (Base pura sólida): Kick en 1 y 3
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.78 });
      }
    } else if (barInCycle === 1) {
      // Compás 2 (Variación con pickup): Kick en 1, y en tiempo 3 con pickup atresillado en 'a' de 3
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.76 });
        kickHits.push({ instrument: 'kick', timeOffset: SHUFFLE_PICKUP, velocity: 0.62 });
      }
    } else if (barInCycle === 2) {
      // Compás 3 (Variación shuffle sincopada): Kick en 1, pickup en 'a' de 2 hacia el 3, y en 3
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.84 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: SHUFFLE_PICKUP, velocity: 0.64 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.78 });
      }
    } else {
      // Compás 4 (Variación turnaround): Kick en 1, 3, y pickup al final en 'a' de 4
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.86 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.78 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: SHUFFLE_PICKUP, velocity: 0.60 });
      }
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  // =========================================================================
  // 11. REGGAETÓN (Dembow auténtico y moderno en 4/4)
  // Subdivisión de 16 semicorcheas por compás (4 semicorcheas por tiempo):
  // 1 e & a   2 e & a   3 e & a   4 e & a
  //
  // - KICK: Profundo, con cuerpo y seco.
  //   Base principal: Tiempo 1 y Tiempo 3.
  //   Variaciones orgánicas sincopadas según el compás (sin negras de música electrónica).
  //
  // - SNARE / CLAP: Sincopado característico del DEMBOW (BOOM - cha - BOOM-cha).
  //   Golpes en las posiciones sincopadas:
  //   'a' de 1 (offset 0.75), '&' de 2 (offset 1.50)
  //   'a' de 3 (offset 2.75), '&' de 4 (offset 3.50)
  //   Caja / clap seca y percusiva (instrument: 'snare')
  //
  // - HI-HAT: Corcheas suaves y discretas en 'hihat_closed', con semicorcheas ocasionales
  //   para mantener el flow rítmico sin sonar a trap ni continuo.
  // =========================================================================
  if (style === 'Reggaetón') {
    const kickHits: DrumHitEvent[] = [];
    const snareHits: DrumHitEvent[] = [];
    const hihatHits: DrumHitEvent[] = [];
    const rideHits: DrumHitEvent[] = [];

    const measureIndex = Math.floor(globalBeatIndex / beatsPerMeasure);
    const barInCycle = measureIndex % 4; // Ciclo de 4 compases para variaciones orgánicas

    // -------------------------------------------------------------------------
    // 1. KICK (BOMBO DEMBOW AUTÉNTICO)
    // Compás 4/4 en corcheas:
    // 1 & 2 & 3 & 4 &
    // Patrón base: X - X - X - X - (golpes en 1, 2, 3, 4 con juego sincopado)
    // con variaciones sincopadas (desplazamientos en contratiempos) entre compases.
    // NUNCA cuatro negras rectas.
    // -------------------------------------------------------------------------
    if (barInCycle === 0) {
      // Compás 1 (Base Dembow clásica con peso rítmico):
      // 1 & 2 & 3 & 4 &
      // X - X - X - X -
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      }
    } else if (barInCycle === 1) {
      // Compás 2 (Variación sincopada A: síncopa en '&' de 2):
      // 1 & 2 & 3 & 4 &
      // X - X X X - X -
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.96 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.90 }); // Síncopa en '&' de 2
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      }
    } else if (barInCycle === 2) {
      // Compás 3 (Variación sincopada B: síncopa en '&' de 3):
      // 1 & 2 & 3 & 4 &
      // X - X - X X X -
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.90 }); // Síncopa en '&' de 3
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      }
    } else {
      // Compás 4 (Variación Turnaround final de frase: síncopa en '&' de 4 preparando el 1):
      // 1 & 2 & 3 & 4 &
      // X - X - X - X X
      if (effectiveBeat === 0) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 1) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.98 });
      } else if (effectiveBeat === 2) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 1.05 });
      } else if (effectiveBeat === 3) {
        kickHits.push({ instrument: 'kick', timeOffset: 0.0, velocity: 0.96 });
        kickHits.push({ instrument: 'kick', timeOffset: 0.50, velocity: 0.92 }); // Síncopa en '&' de 4
      }
    }

    // -------------------------------------------------------------------------
    // 2. SNARE / CLAP (DEMBOW SYNCOPATION) - MANTENIDA INTACTA
    // Posiciones exactas en el compás 4/4:
    // En tiempo 1: Golpe en 'a' (offset 0.75)
    // En tiempo 2: Golpe en '&' (offset 0.50)
    // En tiempo 3: Golpe en 'a' (offset 0.75)
    // En tiempo 4: Golpe en '&' (offset 0.50)
    // Produce el inconfundible groove Dembow: "BOOM — cha — BOOM-cha"
    // -------------------------------------------------------------------------
    if (effectiveBeat === 0) {
      // 'a' de 1 (offset 0.75)
      snareHits.push({ instrument: 'snare', timeOffset: 0.75, velocity: 0.95 });
    } else if (effectiveBeat === 1) {
      // '&' de 2 (offset 0.50)
      snareHits.push({ instrument: 'snare', timeOffset: 0.50, velocity: 0.92 });
    } else if (effectiveBeat === 2) {
      // 'a' de 3 (offset 0.75)
      snareHits.push({ instrument: 'snare', timeOffset: 0.75, velocity: 0.95 });
    } else if (effectiveBeat === 3) {
      // '&' de 4 (offset 0.50)
      snareHits.push({ instrument: 'snare', timeOffset: 0.50, velocity: 0.92 });

      // En compás 4: ghost note suave de semicorchea antes del final (fill sutil de dembow)
      if (barInCycle === 3) {
        snareHits.push({ instrument: 'snare', timeOffset: 0.75, velocity: 0.42 });
      }
    }

    // -------------------------------------------------------------------------
    // 3. HI-HAT (DISCRETO, SUAVE Y RÍTMICO - ELEMENTO SECUNDARIO)
    // -------------------------------------------------------------------------
    hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.0, velocity: 0.40 });
    if (effectiveBeat === 1 || effectiveBeat === 3) {
      hihatHits.push({ instrument: 'hihat_closed', timeOffset: 0.50, velocity: 0.32 });
    }

    return {
      kick: kickHits,
      snare: snareHits,
      hihat: hihatHits,
      ride: rideHits,
    };
  }

  return emptyMatrix;
}
