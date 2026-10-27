import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Printer, FileText, Music, SlidersHorizontal } from 'lucide-react';
import { Song } from '../types';
import {
  RawMidiNoteInput,
  QuantizationMode,
  generateScorePagesSVG,
  detectTrackClef,
  getKeySignatureInfo
} from '../utils/scoreTranscription';
import { downloadLeadSheetPDF } from '../utils/pdfGenerator';

export interface ScorePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  transposition?: number;
  globalKey?: string;
  activeKey?: string;
  trackName?: string;
  instrumentName?: string;
  bankId?: string;
  midiNotes: RawMidiNoteInput[];
  availableTracks?: Array<{
    id: string;
    name: string;
    instrument: string;
    bankId: string;
    notes: RawMidiNoteInput[];
  }>;
  selectedTrackId?: string;
  onSelectTrackId?: (trackId: string) => void;
}

export const ScorePreviewModal: React.FC<ScorePreviewModalProps> = ({
  isOpen,
  onClose,
  song,
  transposition = 0,
  globalKey = 'C',
  activeKey,
  trackName = 'Pista MIDI',
  instrumentName = 'Piano / Melodía',
  bankId = '',
  midiNotes,
  availableTracks = [],
  selectedTrackId,
  onSelectTrackId
}) => {
  const [quantizationMode, setQuantizationMode] = useState<QuantizationMode>('clean');

  if (!isOpen) return null;

  const resolvedActiveKey =
    activeKey || (song as any)?.activeKey || song.defaultKey || globalKey || 'C';
  const keySigInfo = getKeySignatureInfo(resolvedActiveKey);
  const keySigBadgeText =
    keySigInfo.count > 0
      ? `${keySigInfo.tonality} (${keySigInfo.count}${keySigInfo.type === 'sharp' ? '♯' : '♭'})`
      : `${keySigInfo.tonality} (0♯/♭)`;

  const svgPages = generateScorePagesSVG({
    song,
    transposition,
    globalKey: resolvedActiveKey,
    trackName,
    instrumentName,
    bankId,
    midiNotes,
    quantizationMode
  });

  const clef = detectTrackClef(midiNotes, instrumentName, bankId);

  const handleDownloadPdf = () => {
    downloadLeadSheetPDF({
      song,
      transposition,
      globalKey: resolvedActiveKey,
      includeStaffNotation: true,
      midiNotes,
      trackName,
      instrumentName,
      bankId,
      quantizationMode
    });
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (_) {}
  };

  const modalNode = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-hidden select-none print:static print:bg-white print:p-0 print:block"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[95vw] max-w-5xl h-[90vh] bg-[#121212] border border-neutral-800 rounded-xl flex flex-col overflow-hidden shadow-2xl text-neutral-200 font-sans print:w-full print:max-w-none print:h-auto print:bg-white print:border-none print:shadow-none print:overflow-visible"
      >
        {/* Cabecera del Visor / Exportador de Partitura */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#161616] border-b border-neutral-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EA580B]/20 border border-[#EA580B]/50 text-[#EA580B] flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  Partitura Lead Sheet: {song.title || 'Mi Nueva Progresión'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EA580B]/20 text-[#EA580B] border border-[#EA580B]/40 uppercase shrink-0">
                  {clef === 'bass' ? 'Clave de Fa' : 'Clave de Sol'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700 shrink-0">
                  Tonalidad: {keySigBadgeText}
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {trackName} • {instrumentName} • {midiNotes.length}{' '}
                {midiNotes.length === 1 ? 'nota MIDI transcrita' : 'notas MIDI transcritas'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Selector de Simplificación Rítmica: Lectura Limpia (1/4 - 1/8) vs Detallada (1/16) */}
            <div
              className="h-8 flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 rounded-md"
              title="Simplificación Rítmica y Legato Snapping para interpretación humana"
            >
              <SlidersHorizontal size={12} className="text-[#EA580B] shrink-0" />
              <span className="text-[10px] font-mono uppercase text-neutral-400 hidden md:inline">
                Rítmica:
              </span>
              <select
                value={quantizationMode}
                onChange={e => setQuantizationMode(e.target.value as QuantizationMode)}
                className="bg-transparent text-xs font-mono text-neutral-200 outline-none cursor-pointer"
              >
                <option value="clean" className="bg-neutral-900 text-neutral-200">
                  Lectura Limpia (1/4 - 1/8)
                </option>
                <option value="detailed" className="bg-neutral-900 text-neutral-200">
                  Detallada (1/16)
                </option>
              </select>
            </div>

            {availableTracks.length > 1 && onSelectTrackId && (
              <div className="h-8 flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 rounded-md">
                <Music size={12} className="text-[#EA580B]" />
                <select
                  value={selectedTrackId || ''}
                  onChange={e => onSelectTrackId(e.target.value)}
                  className="bg-transparent text-xs font-mono text-neutral-200 outline-none cursor-pointer"
                  title="Seleccionar pista MIDI para la partitura"
                >
                  {availableTracks.map(t => (
                    <option key={t.id} value={t.id} className="bg-neutral-900 text-neutral-200">
                      {t.name} ({t.instrument}) — {t.notes.length} notas
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir o Guardar como PDF desde el diálogo del sistema"
              className="h-8 flex items-center gap-1.5 px-3 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              title="Descargar archivo PDF vectorial directo (.pdf)"
              className="h-8 flex items-center gap-1.5 px-3.5 rounded-md bg-[#EA580B] hover:bg-orange-600 border border-orange-500/40 text-white text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar vista de partitura"
              className="w-8 h-8 rounded-md bg-neutral-900 hover:bg-rose-600/20 border border-neutral-800 hover:border-rose-500/60 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Lienzo de páginas SVG vectoriales en alta resolución */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950 flex flex-col items-center gap-6 piano-roll-scroll print:p-0 print:bg-white print:overflow-visible print:gap-0">
          {svgPages.map((svgMarkup, idx) => (
            <div
              key={idx}
              className="w-full max-w-[794px] bg-white rounded-sm shadow-2xl border border-neutral-300 overflow-hidden shrink-0 print:max-w-none print:w-full print:shadow-none print:border-none print:break-after-page"
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default ScorePreviewModal;
