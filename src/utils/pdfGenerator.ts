/**
 * Generador nativo de archivos PDF (estándar PDF 1.4) sin dependencias externas.
 * Produce archivos PDF vectoriales válidos, ligeros y de alta definición (A4).
 * Soporta tanto "Guía de Acordes y Armonía" como "Partitura Completa (Lead Sheet: Acordes + Melodía MIDI en Pentagrama)".
 */

import { Song, SongMeasure } from "../types";
import { transposeChordString, transposeRoot } from "./music";
import {
  RawMidiNoteInput,
  QuantizationMode,
  transcribeMidiTrackToMeasures,
  detectTrackClef,
  midiToPitchNotation,
  getStaffStepOffset,
  getKeySignatureInfo,
  parseTimeSignatureBeats,
} from "./scoreTranscription";

export interface PDFExportOptions {
  song: Song;
  transposition?: number;
  globalKey?: string;
  includeStaffNotation?: boolean;
  midiNotes?: RawMidiNoteInput[];
  trackName?: string;
  instrumentName?: string;
  bankId?: string;
  quantizationMode?: QuantizationMode;
}

/**
 * Sanitiza y limpia el texto para el stream de PDF estándar Type 1 Helvetica (ASCII 7-bit).
 */
function escapePDFText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/°/g, "dim")
    .replace(/ø/g, "m7b5")
    .replace(/Δ/g, "maj7")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

/**
 * Calcula el ancho aproximado de una cadena con fuente Helvetica en puntos
 */
function approximateTextWidth(text: string, fontSize: number, isBold: boolean = false): number {
  const factor = isBold ? 0.60 : 0.52;
  return text.length * fontSize * factor;
}

/**
 * Dibuja una elipse (cabeza de nota o punto) mediante 4 curvas de Bézier cúbicas en PDF
 */
function pdfEllipseCommands(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  filled: boolean,
  lineWidth: number = 1.2
): string[] {
  const k = 0.5522847498;
  const ox = rx * k;
  const oy = ry * k;
  const cmds: string[] = [];
  cmds.push("q");
  cmds.push(`${lineWidth.toFixed(2)} w`);
  cmds.push("0 0 0 RG");
  cmds.push("0 0 0 rg");
  cmds.push(`${(cx - rx).toFixed(2)} ${cy.toFixed(2)} m`);
  cmds.push(
    `${(cx - rx).toFixed(2)} ${(cy + oy).toFixed(2)} ${(cx - ox).toFixed(2)} ${(
      cy + ry
    ).toFixed(2)} ${cx.toFixed(2)} ${(cy + ry).toFixed(2)} c`
  );
  cmds.push(
    `${(cx + ox).toFixed(2)} ${(cy + ry).toFixed(2)} ${(cx + rx).toFixed(2)} ${(
      cy + oy
    ).toFixed(2)} ${(cx + rx).toFixed(2)} ${cy.toFixed(2)} c`
  );
  cmds.push(
    `${(cx + rx).toFixed(2)} ${(cy - oy).toFixed(2)} ${(cx + ox).toFixed(2)} ${(
      cy - ry
    ).toFixed(2)} ${cx.toFixed(2)} ${(cy - ry).toFixed(2)} c`
  );
  cmds.push(
    `${(cx - ox).toFixed(2)} ${(cy - ry).toFixed(2)} ${(cx - rx).toFixed(2)} ${(
      cy - oy
    ).toFixed(2)} ${(cx - rx).toFixed(2)} ${cy.toFixed(2)} c`
  );
  cmds.push(filled ? "f" : "S");
  cmds.push("Q");
  return cmds;
}

/**
 * Dibuja una Clave de Sol vectorial estilizada en coordenadas PDF (Y hacia arriba)
 * centrada sobre la 2da línea (gLineY).
 */
function pdfTrebleClefCommands(gx: number, staffBottomY: number, lineSpacing: number): string[] {
  const gY = staffBottomY + lineSpacing; // 2da línea (Sol)
  const cmds: string[] = [];
  cmds.push("q");
  cmds.push("1.35 w");
  cmds.push("1 J");
  cmds.push("1 j");
  cmds.push("0 0 0 RG");

  // Espiral inferior envolviendo la 2da línea (Sol) -> sube hacia el lazo superior -> baja en línea recta con gancho final
  cmds.push(`${(gx - 1.2).toFixed(2)} ${(gY + 1.5).toFixed(2)} m`);
  // Curva derecha de la panza
  cmds.push(
    `${(gx + 3.8).toFixed(2)} ${(gY + 4.8).toFixed(2)} ${(gx + 5.2).toFixed(2)} ${(
      gY - 4.2
    ).toFixed(2)} ${(gx + 0.2).toFixed(2)} ${(gY - 5.2).toFixed(2)} c`
  );
  // Curva izquierda de la panza subiendo en diagonal hacia el lazo superior
  cmds.push(
    `${(gx - 4.8).toFixed(2)} ${(gY - 5.8).toFixed(2)} ${(gx - 5.2).toFixed(2)} ${(
      gY + 3.8
    ).toFixed(2)} ${(gx + 1.5).toFixed(2)} ${(gY + 11.5).toFixed(2)} c`
  );
  // Lazo superior por encima de la 5ta línea
  cmds.push(
    `${(gx + 4.8).toFixed(2)} ${(gY + 16.5).toFixed(2)} ${(gx + 1.2).toFixed(2)} ${(
      gY + 23.0
    ).toFixed(2)} ${(gx - 0.8).toFixed(2)} ${(gY + 18.5).toFixed(2)} c`
  );
  // Eje vertical descendente hasta por debajo de la 1ra línea
  cmds.push(
    `${(gx - 1.8).toFixed(2)} ${(gY + 14.0).toFixed(2)} ${(gx - 0.3).toFixed(2)} ${(
      gY - 4.0
    ).toFixed(2)} ${(gx - 0.5).toFixed(2)} ${(staffBottomY - 6.5).toFixed(2)} c`
  );
  // Gancho inferior izquierdo
  cmds.push(
    `${(gx - 0.6).toFixed(2)} ${(staffBottomY - 9.5).toFixed(2)} ${(gx - 4.5).toFixed(2)} ${(
      staffBottomY - 9.2
    ).toFixed(2)} ${(gx - 3.8).toFixed(2)} ${(staffBottomY - 6.5).toFixed(2)} c`
  );
  cmds.push("S");
  cmds.push("Q");
  // Punto terminal del gancho inferior
  cmds.push(...pdfEllipseCommands(gx - 3.4, staffBottomY - 6.5, 1.3, 1.3, true, 1.0));
  return cmds;
}

/**
 * Genera un Blob PDF 1.4 vectorial válido con la guía de acordes o la partitura completa (pentagrama + acordes + MIDI)
 */
export function generateLeadSheetPDFBlob(options: PDFExportOptions): Blob {
  const {
    song,
    transposition = 0,
    globalKey = "C",
    includeStaffNotation = false,
    midiNotes = [],
    trackName = "",
    instrumentName = "",
    bankId = "",
    quantizationMode = "clean",
  } = options;

  const hasMidiScore =
    Boolean(includeStaffNotation) || (Array.isArray(midiNotes) && midiNotes.length > 0);

  const rawTitle = song.title && song.title.trim() ? song.title.trim() : "Mi Nueva Progresion";
  const title = escapePDFText(rawTitle).toUpperCase();
  const rawStyle = song.style && song.style.trim() ? song.style.trim() : "Swing";
  const style = escapePDFText(rawStyle);
  const tempo = song.tempo || 120;
  const timeSignature = song.timeSignature || "4/4";

  const isAlreadyTransposed = Boolean((song as any)?.isAlreadyTransposed);
  const rawKeyStr = String((song as any)?.activeKey || song.defaultKey || globalKey || "C").trim();
  const isMinorKeyStr = /m|-|min/i.test(rawKeyStr);
  const cleanRawKey = rawKeyStr.replace(/m|-|min/gi, "").trim() as import("../types").RootNote;
  const effectiveKeyCenter = (globalKey.replace(/m|-|min/gi, "").trim() || cleanRawKey || "C") as import("../types").RootNote;

  const transposedRoot =
    !isAlreadyTransposed && transposition !== 0
      ? transposeRoot(cleanRawKey, transposition, effectiveKeyCenter)
      : cleanRawKey;
  const calculatedKey = isMinorKeyStr ? `${transposedRoot}m` : transposedRoot;
  const keySig = getKeySignatureInfo(calculatedKey);
  const displayKey = escapePDFText(keySig.tonality || calculatedKey);
  const preferFlats = keySig.preferFlats;

  const measures: SongMeasure[] =
    song.measures && song.measures.length > 0
      ? song.measures
      : [{ id: "m-1", chords: ["Cmaj7"] }];

  const clef = hasMidiScore ? detectTrackClef(midiNotes, instrumentName, bankId) : "treble";
  const meterInfo = parseTimeSignatureBeats(timeSignature);
  const stepsPerMeasure = meterInfo.stepsPerMeasure;
  const beamGroupSteps = meterInfo.denominator === 8 ? 6 : 4;

  // Transcripción con Human MIDI Quantization & Legato Snapping + Registro Óptimo de Lectura
  const transcribedMeasures = hasMidiScore
    ? transcribeMidiTrackToMeasures(
        midiNotes,
        tempo,
        measures.length,
        calculatedKey,
        quantizationMode,
        clef,
        timeSignature
      )
    : [];

  const totalMeasuresCount = hasMidiScore
    ? Math.max(measures.length, transcribedMeasures.length)
    : measures.length;

  // Dimensiones A4 estándar en puntos tipográficos (595 x 842 pt)
  const pageWidth = 595.0;
  const pageHeight = 842.0;
  const marginLeft = 38.0;
  const marginRight = 38.0;
  const contentWidth = pageWidth - marginLeft - marginRight; // 519.0 pt

  const measuresPerRow = 4;

  // Si incluye pentagrama MIDI usamos 5 sistemas amplios por página (128pt por sistema = 20 compases/página)
  // para garantizar >= 34pt (~45px) libres sobre la 5ta línea para acordes y secciones;
  // si es solo guía de acordes usamos 10 filas (68pt por fila = 40 compases/página).
  const systemRowHeight = hasMidiScore ? 128.0 : 68.0;
  const headerBottomY = 736.0;
  const footerMarginBottom = 42.0;
  const usableHeightPerPage = headerBottomY - footerMarginBottom;

  const maxRowsPerPage = Math.max(1, Math.floor(usableHeightPerPage / systemRowHeight));
  const measuresPerPage = maxRowsPerPage * measuresPerRow;
  const totalPages = Math.ceil(totalMeasuresCount / measuresPerPage) || 1;

  const objects: string[] = [];
  objects[1] = "<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>";
  const pageObjectIds: number[] = [];

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageObjId = 3 + pageIdx * 3;
    const resObjId = pageObjId + 1;
    const contentsObjId = pageObjId + 2;
    pageObjectIds.push(pageObjId);

    const streamCommands: string[] = [];

    // --- ENCABEZADO DE LA PARTITURA (Lead Sheet Header) ---
    streamCommands.push("BT");
    streamCommands.push("/F2 19 Tf");
    streamCommands.push("0 0 0 rg");
    streamCommands.push(`${marginLeft} 794 Td`);
    streamCommands.push(`(${title}) Tj`);
    streamCommands.push("ET");

    streamCommands.push("BT");
    streamCommands.push("/F1 8.5 Tf");
    streamCommands.push("0.32 0.32 0.32 rg");
    streamCommands.push(`${marginLeft} 779 Td`);
    const subtitleStr = hasMidiScore
      ? `GUIA DE ACORDES Y MELODIA  *  LEAD SHEET${
          trackName ? `  (${escapePDFText(trackName.toUpperCase())})` : ""
        }`
      : "GUIA DE ACORDES Y ARMONIA  *  LEAD SHEET";
    streamCommands.push(`(${subtitleStr}) Tj`);
    streamCommands.push("ET");

    streamCommands.push("BT");
    streamCommands.push("/F2 9 Tf");
    streamCommands.push("0.1 0.1 0.1 rg");
    streamCommands.push(`${marginLeft} 761 Td`);
    const pdfKeySigLabel =
      keySig.count > 0
        ? `${displayKey} (${keySig.count}${keySig.type === "sharp" ? "#" : "b"})`
        : displayKey;
    const metaParts = [
      `TEMPO: ${tempo} BPM`,
      `METRICA: ${escapePDFText(timeSignature)}`,
      `TONALIDAD: ${pdfKeySigLabel}`,
      `ESTILO: ${style.toUpperCase()}`,
    ];
    if (hasMidiScore && instrumentName) {
      metaParts.push(
        `INSTRUMENTO: ${escapePDFText(instrumentName.toUpperCase())} (${
          clef === "bass" ? "CLAVE DE FA" : "CLAVE DE SOL"
        })`
      );
    }
    const metaText = escapePDFText(metaParts.join("   |   "));
    streamCommands.push(`(${metaText}) Tj`);
    streamCommands.push("ET");

    // Línea divisoria horizontal bajo el encabezado
    streamCommands.push("q");
    streamCommands.push("1.2 w");
    streamCommands.push("0 0 0 RG");
    streamCommands.push(`${marginLeft} 750 m`);
    streamCommands.push(`${marginLeft + contentWidth} 750 l`);
    streamCommands.push("S");
    streamCommands.push("Q");

    const startMeasureIdx = pageIdx * measuresPerPage;
    const endMeasureIdx = Math.min(startMeasureIdx + measuresPerPage, totalMeasuresCount);

    if (hasMidiScore) {
      // =====================================================================
      // MODO PARTITURA COMPLETA (PENTAGRAMA + ARMADURA + ACORDES + NOTAS MIDI)
      // =====================================================================
      const lineSpacing = 6.0; // Espacio entre las 5 líneas del pentagrama en puntos PDF
      const staffHeight = lineSpacing * 4; // 24.0 pt
      const keySigOffsets =
        clef === "bass" ? keySig.bassStaffOffsets : keySig.trebleStaffOffsets;
      const keySigWidthPt = keySigOffsets.length > 0 ? keySigOffsets.length * 6.2 + 4.0 : 0.0;

      for (let mIdx = startMeasureIdx; mIdx < endMeasureIdx; mIdx++) {
        const measure: SongMeasure = measures[mIdx] || { id: `m-${mIdx + 1}`, chords: [""] };
        const transMeasure = transcribedMeasures[mIdx] || { measureIndex: mIdx, events: [] };

        const localMeasureIdx = mIdx - startMeasureIdx;
        const row = Math.floor(localMeasureIdx / measuresPerRow);
        const col = localMeasureIdx % measuresPerRow;

        const isVeryFirstSystem = pageIdx === 0 && row === 0;
        const timeSigWidthPt = isVeryFirstSystem ? 14.0 : 3.0;
        const clefHeaderW = 24.0 + keySigWidthPt + timeSigWidthPt;
        const measureWidth = (contentWidth - clefHeaderW) / measuresPerRow;

        // En PDF, Y crece de abajo hacia arriba.
        // Dejamos 52pt (~69px) de aire libre por encima de la 5ta línea para acordes y secciones.
        const systemTopY = headerBottomY - row * systemRowHeight - 8.0;
        const staffTopY = systemTopY - 52.0; // 5ta línea (superior) del pentagrama
        const staffBottomY = staffTopY - staffHeight; // 1ra línea (inferior) del pentagrama

        // Si es el primer compás del sistema (col === 0), dibujar las 5 líneas + Clave + Armadura + (4/4 en 1er sistema)
        if (col === 0) {
          const measuresInRow = Math.min(measuresPerRow, endMeasureIdx - mIdx);
          const rowTotalW = clefHeaderW + measuresInRow * measureWidth;

          streamCommands.push("q");
          streamCommands.push("0.7 w");
          streamCommands.push("0.12 0.12 0.12 RG");
          for (let l = 0; l < 5; l++) {
            const ly = staffBottomY + l * lineSpacing;
            streamCommands.push(`${marginLeft.toFixed(2)} ${ly.toFixed(2)} m`);
            streamCommands.push(`${(marginLeft + rowTotalW).toFixed(2)} ${ly.toFixed(2)} l`);
          }
          streamCommands.push("S");
          streamCommands.push("Q");

          // Barra vertical izquierda del sistema
          streamCommands.push("q");
          streamCommands.push("1.3 w");
          streamCommands.push("0 0 0 RG");
          streamCommands.push(`${marginLeft.toFixed(2)} ${staffBottomY.toFixed(2)} m`);
          streamCommands.push(`${marginLeft.toFixed(2)} ${staffTopY.toFixed(2)} l`);
          streamCommands.push("S");
          streamCommands.push("Q");

          // 1. Dibujar símbolo de Clave (Sol o Fa)
          if (clef === "treble") {
            streamCommands.push(
              ...pdfTrebleClefCommands(marginLeft + 10.5, staffBottomY, lineSpacing)
            );
          } else {
            const fx = marginLeft + 8.5;
            const fLineY = staffBottomY + lineSpacing * 3;
            streamCommands.push(...pdfEllipseCommands(fx, fLineY, 2.2, 2.2, true, 1.0));
            streamCommands.push("q");
            streamCommands.push("1.5 w");
            streamCommands.push("0 0 0 RG");
            streamCommands.push(`${fx.toFixed(2)} ${fLineY.toFixed(2)} m`);
            streamCommands.push(
              `${(fx + 8).toFixed(2)} ${(fLineY + 5).toFixed(2)} ${(fx + 9).toFixed(2)} ${(
                fLineY - 7
              ).toFixed(2)} ${(fx - 1).toFixed(2)} ${(staffBottomY + 2).toFixed(2)} c`
            );
            streamCommands.push("S");
            streamCommands.push("Q");
            streamCommands.push(
              ...pdfEllipseCommands(fx + 9.2, fLineY + 2.2, 1.0, 1.0, true, 1.0)
            );
            streamCommands.push(
              ...pdfEllipseCommands(fx + 9.2, fLineY - 2.2, 1.0, 1.0, true, 1.0)
            );
          }

          // 2. Dibujar Armadura de Clave (Key Signature: # o b según tonalidad)
          const keySigStartX = marginLeft + 21.0;
          keySigOffsets.forEach((stepOffset, idx) => {
            const accX = keySigStartX + idx * 6.0;
            const accY = staffBottomY + stepOffset * (lineSpacing / 2);
            streamCommands.push("BT");
            streamCommands.push("/F2 9.5 Tf");
            streamCommands.push("0 0 0 rg");
            streamCommands.push(`${accX.toFixed(2)} ${(accY - 3.0).toFixed(2)} Td`);
            streamCommands.push(`(${keySig.type === "sharp" ? "#" : "b"}) Tj`);
            streamCommands.push("ET");
          });

          // 3. Métrica 4/4 en el primer sistema después de la Armadura
          if (isVeryFirstSystem) {
            const tsX = marginLeft + 22.0 + keySigWidthPt;
            const tsParts = timeSignature.split("/");
            const tsNum = escapePDFText(tsParts[0] || "4");
            const tsDen = escapePDFText(tsParts[1] || "4");
            streamCommands.push("BT");
            streamCommands.push("/F2 11 Tf");
            streamCommands.push("0 0 0 rg");
            streamCommands.push(
              `${tsX.toFixed(2)} ${(staffBottomY + lineSpacing * 2.15).toFixed(2)} Td`
            );
            streamCommands.push(`(${tsNum}) Tj`);
            streamCommands.push("ET");

            streamCommands.push("BT");
            streamCommands.push("/F2 11 Tf");
            streamCommands.push("0 0 0 rg");
            streamCommands.push(
              `${tsX.toFixed(2)} ${(staffBottomY + 1.2).toFixed(2)} Td`
            );
            streamCommands.push(`(${tsDen}) Tj`);
            streamCommands.push("ET");
          }
        }

        const mStartX = marginLeft + clefHeaderW + col * measureWidth;
        const mEndX = mStartX + measureWidth;

        // Número de compás discreto justo encima de la esquina izquierda del compás
        streamCommands.push("BT");
        streamCommands.push("/F1 6.5 Tf");
        streamCommands.push("0.4 0.4 0.4 rg");
        streamCommands.push(`${(mStartX + 1.5).toFixed(2)} ${(staffTopY + 3.5).toFixed(2)} Td`);
        streamCommands.push(`(${mIdx + 1}) Tj`);
        streamCommands.push("ET");

        // Coordenada vertical fija de los acordes (+28pt por encima de la 5ª línea del pentagrama)
        const chordY = staffTopY + 28.0;

        // Marcador de sección ([Sección A], [Sección B], etc.) elevado 18pt por encima de los acordes
        // y alineado sobre la Clave de Sol (marginLeft) cuando es el primer compás del sistema
        let sectionLabel = measure.sectionLabel;
        if (!sectionLabel && song.sections) {
          const found = Object.entries(song.sections).find(([_, sIdx]) => sIdx === mIdx);
          if (found) {
            sectionLabel = found[0].startsWith("[") ? found[0] : `[${found[0]}]`;
          }
        }
        if (sectionLabel) {
          const cleanSec = escapePDFText(sectionLabel);
          const badgeW = approximateTextWidth(cleanSec, 7.5, true) + 9;
          const badgeX = col === 0 ? marginLeft : mStartX;
          const badgeY = chordY + 16.5;
          streamCommands.push("q");
          streamCommands.push("0.93 0.93 0.93 rg");
          streamCommands.push("0 0 0 RG");
          streamCommands.push("0.6 w");
          streamCommands.push(
            `${badgeX.toFixed(2)} ${badgeY.toFixed(2)} ${badgeW.toFixed(2)} 11.0 re B`
          );
          streamCommands.push("Q");

          streamCommands.push("BT");
          streamCommands.push("/F2 7.5 Tf");
          streamCommands.push("0 0 0 rg");
          streamCommands.push(`${(badgeX + 4.5).toFixed(2)} ${(badgeY + 2.8).toFixed(2)} Td`);
          streamCommands.push(`(${cleanSec}) Tj`);
          streamCommands.push("ET");
        }

        // --- CIFRADO AMERICANO A +28pt POR ENCIMA DE LA 5ª LÍNEA DEL PENTAGRAMA (CERO COLISIONES) ---
        const rawChords =
          measure.chords && measure.chords.length > 0 ? measure.chords : [""];
        const slotCount = Math.max(1, rawChords.length);
        const slotWidth = measureWidth / slotCount;

        for (let sIdx = 0; sIdx < slotCount; sIdx++) {
          const rawC = rawChords[sIdx] || "";
          const chordName =
            typeof rawC === "string"
              ? rawC
              : (rawC as any)?.chordName || (rawC as any)?.name || "";
          if (!chordName || !chordName.trim()) continue;

          const transposed =
            !isAlreadyTransposed && transposition !== 0
              ? transposeChordString(chordName, transposition, effectiveKeyCenter)
              : chordName;
          const cleanChord = escapePDFText(transposed);
          const chordX = mStartX + sIdx * slotWidth + 6.0;

          streamCommands.push("BT");
          streamCommands.push("/F2 11 Tf");
          streamCommands.push("0 0 0 rg");
          streamCommands.push(`${chordX.toFixed(2)} ${chordY.toFixed(2)} Td`);
          streamCommands.push(`(${cleanChord}) Tj`);
          streamCommands.push("ET");
        }

        // Barras divisorias de compás
        streamCommands.push("q");
        streamCommands.push("0.8 w");
        streamCommands.push("0 0 0 RG");
        streamCommands.push(`${mStartX.toFixed(2)} ${staffBottomY.toFixed(2)} m`);
        streamCommands.push(`${mStartX.toFixed(2)} ${staffTopY.toFixed(2)} l`);
        streamCommands.push(`${mEndX.toFixed(2)} ${staffBottomY.toFixed(2)} m`);
        streamCommands.push(`${mEndX.toFixed(2)} ${staffTopY.toFixed(2)} l`);
        streamCommands.push("S");
        streamCommands.push("Q");

        if (mIdx === totalMeasuresCount - 1) {
          streamCommands.push("q");
          streamCommands.push("2.2 w");
          streamCommands.push("0 0 0 RG");
          streamCommands.push(`${(mEndX - 2.2).toFixed(2)} ${staffBottomY.toFixed(2)} m`);
          streamCommands.push(`${(mEndX - 2.2).toFixed(2)} ${staffTopY.toFixed(2)} l`);
          streamCommands.push("S");
          streamCommands.push("Q");
        }

        // --- DIBUJAR NOTAS Y SILENCIOS TRANSCRITOS DENTRO DEL PENTAGRAMA ---
        const padLeft = 10.0;
        const padRight = 8.0;
        const innerW = Math.max(30.0, measureWidth - padLeft - padRight);

        const isWholeRest =
          transMeasure.events.length === 1 &&
          transMeasure.events[0].isRest &&
          transMeasure.events[0].durationSteps === stepsPerMeasure;

        if (isWholeRest) {
          const rx = mStartX + measureWidth / 2 - 3.5;
          const fourthLineY = staffBottomY + lineSpacing * 3;
          streamCommands.push("q");
          streamCommands.push("0 0 0 rg");
          streamCommands.push(
            `${rx.toFixed(2)} ${(fourthLineY - 2.8).toFixed(2)} 7.0 2.8 re f`
          );
          streamCommands.push("Q");
          continue;
        }

        // Identificar pares de corcheas ("Beamed Eighth Notes") en el mismo pulso
        const beamedIndices = new Set<number>();
        const beamPairs: Array<{ firstIdx: number; secondIdx: number }> = [];
        for (let eIdx = 0; eIdx < transMeasure.events.length - 1; eIdx++) {
          if (beamedIndices.has(eIdx)) continue;
          const ev1 = transMeasure.events[eIdx];
          const ev2 = transMeasure.events[eIdx + 1];
          if (
            !ev1.isRest &&
            !ev2.isRest &&
            ev1.baseFigure === "8" &&
            ev1.dots === 0 &&
            ev2.baseFigure === "8" &&
            ev2.dots === 0 &&
            ev2.startStepInMeasure === ev1.startStepInMeasure + ev1.durationSteps &&
            Math.floor(ev1.startStepInMeasure / beamGroupSteps) ===
              Math.floor(ev2.startStepInMeasure / beamGroupSteps)
          ) {
            beamedIndices.add(eIdx);
            beamedIndices.add(eIdx + 1);
            beamPairs.push({ firstIdx: eIdx, secondIdx: eIdx + 1 });
          }
        }

        interface PdfNoteGeom {
          evX: number;
          noteY: number;
          staffOffset: number;
          stemUp: boolean;
          stemX: number;
          stemEndY: number;
        }
        const pdfGeoms: Record<number, PdfNoteGeom> = {};

        for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
          const ev = transMeasure.events[eIdx];
          const evX = mStartX + padLeft + (ev.startStepInMeasure / stepsPerMeasure) * innerW + 2.5;
          if (!ev.isRest) {
            const pitchInfo = midiToPitchNotation(ev.midi, preferFlats, keySig.count);
            const staffOffset = getStaffStepOffset(pitchInfo.absDiatonicStep, clef);
            const noteY = staffBottomY + staffOffset * (lineSpacing / 2);
            const stemUp = staffOffset < 4;
            const stemLen = 17.5;
            const stemX = stemUp ? evX + 2.8 : evX - 2.8;
            const stemEndY = stemUp ? noteY + stemLen : noteY - stemLen;
            pdfGeoms[eIdx] = { evX, noteY, staffOffset, stemUp, stemX, stemEndY };
          }
        }

        // Alinear plicas de pares de corcheas con Beam
        for (const pair of beamPairs) {
          const g1 = pdfGeoms[pair.firstIdx];
          const g2 = pdfGeoms[pair.secondIdx];
          if (!g1 || !g2) continue;
          const sharedUp = (g1.staffOffset + g2.staffOffset) / 2 < 4;
          g1.stemUp = sharedUp;
          g2.stemUp = sharedUp;
          g1.stemX = sharedUp ? g1.evX + 2.8 : g1.evX - 2.8;
          g2.stemX = sharedUp ? g2.evX + 2.8 : g2.evX - 2.8;
          const stemLen = 17.5;
          let end1 = sharedUp ? g1.noteY + stemLen : g1.noteY - stemLen;
          let end2 = sharedUp ? g2.noteY + stemLen : g2.noteY - stemLen;
          if (Math.abs(end2 - end1) > 4.5) {
            if (sharedUp) {
              const maxEnd = Math.max(end1, end2);
              end1 = g1.noteY > g2.noteY ? maxEnd : maxEnd - 3;
              end2 = g2.noteY > g1.noteY ? maxEnd : maxEnd - 3;
            } else {
              const minEnd = Math.min(end1, end2);
              end1 = g1.noteY < g2.noteY ? minEnd : minEnd + 3;
              end2 = g2.noteY < g1.noteY ? minEnd : minEnd + 3;
            }
          }
          g1.stemEndY = end1;
          g2.stemEndY = end2;
        }

        let prevNoteX: number | null = null;
        let prevNoteY: number | null = null;
        let prevStemUp = true;

        for (let eIdx = 0; eIdx < transMeasure.events.length; eIdx++) {
          const ev = transMeasure.events[eIdx];
          const evX = mStartX + padLeft + (ev.startStepInMeasure / stepsPerMeasure) * innerW + 2.5;
          const midStaffY = staffBottomY + lineSpacing * 2;

          if (ev.isRest) {
            streamCommands.push("q");
            streamCommands.push("0 0 0 rg");
            streamCommands.push("0 0 0 RG");
            if (ev.baseFigure === "w") {
              streamCommands.push(
                `${(evX - 3).toFixed(2)} ${(staffBottomY + lineSpacing * 3 - 2.6).toFixed(
                  2
                )} 6.5 2.6 re f`
              );
            } else if (ev.baseFigure === "h") {
              streamCommands.push(
                `${(evX - 3).toFixed(2)} ${midStaffY.toFixed(2)} 6.5 2.6 re f`
              );
            } else if (ev.baseFigure === "q") {
              streamCommands.push("1.3 w");
              streamCommands.push(`${(evX - 1.5).toFixed(2)} ${(midStaffY + 6).toFixed(2)} m`);
              streamCommands.push(`${(evX + 2).toFixed(2)} ${(midStaffY + 2).toFixed(2)} l`);
              streamCommands.push(`${(evX - 1.5).toFixed(2)} ${(midStaffY - 1.5).toFixed(2)} l`);
              streamCommands.push(`${(evX + 1.8).toFixed(2)} ${(midStaffY - 5.5).toFixed(2)} l`);
              streamCommands.push("S");
            } else {
              streamCommands.push("1.1 w");
              streamCommands.push(`${(evX + 1.8).toFixed(2)} ${(midStaffY + 4).toFixed(2)} m`);
              streamCommands.push(`${(evX - 1.2).toFixed(2)} ${(midStaffY - 5).toFixed(2)} l`);
              streamCommands.push("S");
              streamCommands.push(
                ...pdfEllipseCommands(evX - 0.8, midStaffY + 2.2, 1.4, 1.4, true, 1.0)
              );
              if (ev.baseFigure === "16") {
                streamCommands.push(
                  ...pdfEllipseCommands(evX - 1.5, midStaffY - 1.2, 1.4, 1.4, true, 1.0)
                );
              }
            }
            if (ev.dots > 0) {
              streamCommands.push(
                ...pdfEllipseCommands(evX + 4.8, midStaffY + 2.0, 1.0, 1.0, true, 1.0)
              );
            }
            streamCommands.push("Q");
            prevNoteX = null;
            continue;
          }

          // Nota musical real
          const geom = pdfGeoms[eIdx];
          const pitchInfo = midiToPitchNotation(ev.midi, preferFlats);
          const { staffOffset, noteY, stemUp, stemX, stemEndY } = geom;

          // Líneas adicionales (ledger lines)
          if (staffOffset <= -2) {
            streamCommands.push("q");
            streamCommands.push("0.8 w");
            streamCommands.push("0 0 0 RG");
            for (let lo = -2; lo >= staffOffset; lo -= 2) {
              const ly = staffBottomY + lo * (lineSpacing / 2);
              streamCommands.push(`${(evX - 4.8).toFixed(2)} ${ly.toFixed(2)} m`);
              streamCommands.push(`${(evX + 4.8).toFixed(2)} ${ly.toFixed(2)} l`);
            }
            streamCommands.push("S");
            streamCommands.push("Q");
          } else if (staffOffset >= 10) {
            streamCommands.push("q");
            streamCommands.push("0.8 w");
            streamCommands.push("0 0 0 RG");
            for (let hi = 10; hi <= staffOffset; hi += 2) {
              const ly = staffBottomY + hi * (lineSpacing / 2);
              streamCommands.push(`${(evX - 4.8).toFixed(2)} ${ly.toFixed(2)} m`);
              streamCommands.push(`${(evX + 4.8).toFixed(2)} ${ly.toFixed(2)} l`);
            }
            streamCommands.push("S");
            streamCommands.push("Q");
          }

          // Alteración accidental inteligente según Armadura de Clave ('#', 'b', 'natural' o '')
          const accToRender = ev.displayedAccidental ?? "";
          if (accToRender === "#" || accToRender === "b") {
            streamCommands.push("BT");
            streamCommands.push("/F2 7.5 Tf");
            streamCommands.push("0 0 0 rg");
            streamCommands.push(
              `${(evX - 7.8).toFixed(2)} ${(noteY - 2.4).toFixed(2)} Td`
            );
            streamCommands.push(`(${accToRender}) Tj`);
            streamCommands.push("ET");
          } else if (accToRender === "natural") {
            // Becuadro vectorial (♮) en PDF 1.4
            const nx = evX - 6.8;
            streamCommands.push("q");
            streamCommands.push("0.75 w");
            streamCommands.push("0 0 0 RG");
            streamCommands.push(`${(nx - 1.2).toFixed(2)} ${(noteY + 4.2).toFixed(2)} m`);
            streamCommands.push(`${(nx - 1.2).toFixed(2)} ${(noteY - 2.2).toFixed(2)} l`);
            streamCommands.push(`${(nx + 1.2).toFixed(2)} ${(noteY + 2.2).toFixed(2)} m`);
            streamCommands.push(`${(nx + 1.2).toFixed(2)} ${(noteY - 4.2).toFixed(2)} l`);
            streamCommands.push(`${(nx - 1.2).toFixed(2)} ${(noteY + 1.4).toFixed(2)} m`);
            streamCommands.push(`${(nx + 1.2).toFixed(2)} ${(noteY + 2.0).toFixed(2)} l`);
            streamCommands.push(`${(nx - 1.2).toFixed(2)} ${(noteY - 2.0).toFixed(2)} m`);
            streamCommands.push(`${(nx + 1.2).toFixed(2)} ${(noteY - 1.4).toFixed(2)} l`);
            streamCommands.push("S");
            streamCommands.push("Q");
          }

          // Cabeza de nota (hueca para 'w'/'h', rellena para 'q'/'8'/'16')
          const isHollow = ev.baseFigure === "w" || ev.baseFigure === "h";
          streamCommands.push(
            ...pdfEllipseCommands(evX, noteY, 3.2, 2.3, !isHollow, 1.25)
          );

          // Puntillo
          if (ev.dots > 0) {
            const dotY = staffOffset % 2 === 0 ? noteY + 1.8 : noteY;
            streamCommands.push(
              ...pdfEllipseCommands(evX + 5.0, dotY, 1.0, 1.0, true, 1.0)
            );
          }

          // Plica (stem) y corchete suelto (flag)
          if (ev.baseFigure !== "w") {
            streamCommands.push("q");
            streamCommands.push("1.0 w");
            streamCommands.push("0 0 0 RG");
            streamCommands.push(`${stemX.toFixed(2)} ${noteY.toFixed(2)} m`);
            streamCommands.push(`${stemX.toFixed(2)} ${stemEndY.toFixed(2)} l`);
            streamCommands.push("S");

            if ((ev.baseFigure === "8" || ev.baseFigure === "16") && !beamedIndices.has(eIdx)) {
              const flagTargetY = stemUp ? stemEndY - 6.5 : stemEndY + 6.5;
              streamCommands.push("1.3 w");
              streamCommands.push(`${stemX.toFixed(2)} ${stemEndY.toFixed(2)} m`);
              streamCommands.push(
                `${(stemX + 4.5).toFixed(2)} ${flagTargetY.toFixed(2)} l`
              );
              if (ev.baseFigure === "16") {
                const secondStartY = stemUp ? stemEndY - 3.8 : stemEndY + 3.8;
                const secondEndY = stemUp ? flagTargetY - 3.8 : flagTargetY + 3.8;
                streamCommands.push(`${stemX.toFixed(2)} ${secondStartY.toFixed(2)} m`);
                streamCommands.push(
                  `${(stemX + 4.5).toFixed(2)} ${secondEndY.toFixed(2)} l`
                );
              }
              streamCommands.push("S");
            }
            streamCommands.push("Q");
          }

          // Ligadura de prolongación (Tie)
          if (ev.tieFromPrev && prevNoteX !== null && prevNoteY !== null) {
            const tieY = prevStemUp ? noteY - 3.6 : noteY + 3.6;
            const ctrlY = prevStemUp ? tieY - 4.2 : tieY + 4.2;
            const midX = (prevNoteX + evX) / 2;
            streamCommands.push("q");
            streamCommands.push("0.9 w");
            streamCommands.push("0 0 0 RG");
            streamCommands.push(`${(prevNoteX + 2).toFixed(2)} ${tieY.toFixed(2)} m`);
            streamCommands.push(
              `${midX.toFixed(2)} ${ctrlY.toFixed(2)} ${midX.toFixed(2)} ${ctrlY.toFixed(
                2
              )} ${(evX - 2).toFixed(2)} ${tieY.toFixed(2)} c`
            );
            streamCommands.push("S");
            streamCommands.push("Q");
          }

          prevNoteX = evX;
          prevNoteY = noteY;
          prevStemUp = stemUp;
        }

        // Dibujar barras horizontales (Beams) para pares de corcheas en el mismo pulso
        for (const pair of beamPairs) {
          const g1 = pdfGeoms[pair.firstIdx];
          const g2 = pdfGeoms[pair.secondIdx];
          if (!g1 || !g2) continue;
          streamCommands.push("q");
          streamCommands.push("2.4 w");
          streamCommands.push("0 0 0 RG");
          streamCommands.push(`${g1.stemX.toFixed(2)} ${g1.stemEndY.toFixed(2)} m`);
          streamCommands.push(`${g2.stemX.toFixed(2)} ${g2.stemEndY.toFixed(2)} l`);
          streamCommands.push("S");
          streamCommands.push("Q");
        }
      }
    } else {
      // =====================================================================
      // MODO GUÍA DE ACORDES CLÁSICA (REAL BOOK CHORD CHART)
      // =====================================================================
      const measureWidth = contentWidth / measuresPerRow;
      const measureHeight = 46.0;

      for (let mIdx = startMeasureIdx; mIdx < endMeasureIdx; mIdx++) {
        const measure: SongMeasure = measures[mIdx];
        const localMeasureIdx = mIdx - startMeasureIdx;
        const row = Math.floor(localMeasureIdx / measuresPerRow);
        const col = localMeasureIdx % measuresPerRow;

        const mX = marginLeft + col * measureWidth;
        const mTopY = headerBottomY - row * systemRowHeight - 16.0;
        const mY = mTopY - measureHeight;

        streamCommands.push("q");
        streamCommands.push("0.9 w");
        streamCommands.push("0.15 0.15 0.15 RG");
        streamCommands.push(
          `${mX.toFixed(2)} ${mY.toFixed(2)} ${measureWidth.toFixed(2)} ${measureHeight.toFixed(
            2
          )} re S`
        );
        streamCommands.push("Q");

        streamCommands.push("BT");
        streamCommands.push("/F1 7 Tf");
        streamCommands.push("0.45 0.45 0.45 rg");
        streamCommands.push(`${(mX + 3.5).toFixed(2)} ${(mTopY - 8.5).toFixed(2)} Td`);
        streamCommands.push(`(${mIdx + 1}) Tj`);
        streamCommands.push("ET");

        let sectionLabel = measure.sectionLabel;
        if (!sectionLabel && song.sections) {
          const found = Object.entries(song.sections).find(([_, startIdx]) => startIdx === mIdx);
          if (found) {
            sectionLabel = found[0].startsWith("[") ? found[0] : `[${found[0]}]`;
          }
        }

        if (sectionLabel) {
          const cleanSection = escapePDFText(sectionLabel);
          const badgeW = approximateTextWidth(cleanSection, 7.5, true) + 8;
          const badgeH = 11.0;
          const badgeX = mX;
          const badgeY = mTopY + 3.0;

          streamCommands.push("q");
          streamCommands.push("0.94 0.94 0.94 rg");
          streamCommands.push("0 0 0 RG");
          streamCommands.push("0.6 w");
          streamCommands.push(
            `${badgeX.toFixed(2)} ${badgeY.toFixed(2)} ${badgeW.toFixed(2)} ${badgeH.toFixed(
              2
            )} re B`
          );
          streamCommands.push("Q");

          streamCommands.push("BT");
          streamCommands.push("/F2 7.5 Tf");
          streamCommands.push("0 0 0 rg");
          streamCommands.push(`${(badgeX + 4).toFixed(2)} ${(badgeY + 2.8).toFixed(2)} Td`);
          streamCommands.push(`(${cleanSection}) Tj`);
          streamCommands.push("ET");
        }

        const rawChords =
          measure.chords && measure.chords.length > 0 ? measure.chords : [""];
        const slotCount = Math.max(1, rawChords.length);
        const slotWidth = measureWidth / slotCount;
        const fontSize = slotCount >= 4 ? 10.5 : slotCount === 3 ? 11.5 : slotCount === 2 ? 12.5 : 14.0;

        for (let sIdx = 0; sIdx < slotCount; sIdx++) {
          const rawC = rawChords[sIdx] || "";
          const chordName =
            typeof rawC === "string"
              ? rawC
              : (rawC as any)?.chordName || (rawC as any)?.name || "";
          if (!chordName || chordName.trim() === "") continue;

          const transposed =
            !isAlreadyTransposed && transposition !== 0
              ? transposeChordString(chordName, transposition, effectiveKeyCenter)
              : chordName;
          const cleanChord = escapePDFText(transposed);

          if (sIdx > 0) {
            const sepX = mX + sIdx * slotWidth;
            streamCommands.push("q");
            streamCommands.push("0.4 w");
            streamCommands.push("0.65 0.65 0.65 RG");
            streamCommands.push(`${sepX.toFixed(2)} ${(mY + 4).toFixed(2)} m`);
            streamCommands.push(`${sepX.toFixed(2)} ${(mY + measureHeight - 4).toFixed(2)} l`);
            streamCommands.push("S");
            streamCommands.push("Q");
          }

          const cWidth = approximateTextWidth(cleanChord, fontSize, true);
          const cX = mX + sIdx * slotWidth + Math.max(2, (slotWidth - cWidth) / 2);
          const cY = mY + (measureHeight - fontSize) / 2 + 1.5;

          streamCommands.push("BT");
          streamCommands.push(`/F2 ${fontSize} Tf`);
          streamCommands.push("0 0 0 rg");
          streamCommands.push(`${cX.toFixed(2)} ${cY.toFixed(2)} Td`);
          streamCommands.push(`(${cleanChord}) Tj`);
          streamCommands.push("ET");
        }
      }
    }

    // Pie de página (Footer)
    streamCommands.push("BT");
    streamCommands.push("/F1 7.5 Tf");
    streamCommands.push("0.4 0.4 0.4 rg");
    const footerText = `PAGINA ${pageIdx + 1} DE ${totalPages}    *    RUMIE STUDIO PRO`;
    const footerW = approximateTextWidth(footerText, 7.5);
    const footerX = (pageWidth - footerW) / 2;
    streamCommands.push(`${footerX.toFixed(2)} 24 Td`);
    streamCommands.push(`(${footerText}) Tj`);
    streamCommands.push("ET");

    const streamData = streamCommands.join("\n");
    const streamLength = streamData.length;

    objects[pageObjId] = `<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${pageWidth} ${pageHeight}]\n  /Resources ${resObjId} 0 R\n  /Contents ${contentsObjId} 0 R\n>>`;
    objects[resObjId] = `<<\n  /Font <<\n    /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n    /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n  >>\n>>`;
    objects[contentsObjId] = `<<\n  /Length ${streamLength}\n>>\nstream\n${streamData}\nendstream`;
  }

  objects[2] = `<<\n  /Type /Pages\n  /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}]\n  /Count ${pageObjectIds.length}\n>>`;

  const totalObjects = 2 + totalPages * 3;
  let pdfContent = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 1; i <= totalObjects; i++) {
    offsets[i] = pdfContent.length;
    pdfContent += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdfContent.length;
  pdfContent += `xref\n0 ${totalObjects + 1}\n`;
  pdfContent += "0000000000 65535 f \n";

  for (let i = 1; i <= totalObjects; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdfContent += `${offsetStr} 00000 n \n`;
  }

  pdfContent += `trailer\n<<\n  /Size ${totalObjects + 1}\n  /Root 1 0 R\n>>\n`;
  pdfContent += `startxref\n${xrefOffset}\n%%EOF\n`;

  return new Blob([pdfContent], { type: "application/pdf" });
}

/**
 * Descarga directamente un archivo .pdf con el nombre de la canción
 */
export function downloadLeadSheetPDF(options: PDFExportOptions): void {
  const blob = generateLeadSheetPDFBlob(options);
  const rawTitle =
    options.song.title && options.song.title.trim()
      ? options.song.title.trim()
      : "partitura-guia";

  const safeFilename = rawTitle
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix =
    options.includeStaffNotation || (options.midiNotes && options.midiNotes.length > 0)
      ? "-partitura-completa"
      : "-lead-sheet";

  const filename = `${safeFilename || "partitura"}${suffix}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1500);
}
