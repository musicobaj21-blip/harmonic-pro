import React from "react";

const INTERVAL_LABELS: Record<number, string> = {
  0: "1",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "b5",
  7: "5",
  8: "b6",
  9: "6",
  10: "b7",
  11: "7",
};

export default function GlobalIntervalMap() {
  const rootFret = 8; // C on 6th string
  const numFretsToDraw = 5;
  const baseFret = 7; // Show frets 7, 8, 9, 10, 11

  const tuningNotes = [40, 45, 50, 55, 59, 64];

  const notes = [];
  const rootMidi = tuningNotes[0] + rootFret;

  for (let s = 0; s < 6; s++) {
    for (let f = 0; f < numFretsToDraw; f++) {
      const fret = baseFret + f;
      const midi = tuningNotes[s] + fret;
      let interval = (midi - rootMidi) % 12;
      if (interval < 0) interval += 12;

      notes.push({
        stringIdx: s,
        fret: fret,
        label: INTERVAL_LABELS[interval],
        isRoot: interval === 0,
      });
    }
  }

  // Horizonal Tab-like layout parameters (Larger size)
  const svgWidth = 600;
  const svgHeight = 340;
  const startX = 40;
  const fretWidth = 110;
  const stringYCoords = [280, 235, 190, 145, 100, 55]; // Index 0 (6th string) at bottom, Index 5 (1st string) at top

  return (
    <div className="w-full relative flex flex-col items-center select-none font-sans mt-4">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-sans font-bold text-zinc-100 tracking-tight">
          Mapa Global de Intervalos
        </h3>
        <p className="text-zinc-400 text-base mt-2">
          Anclado en la Tónica C (Traste 8, 6ta Cuerda)
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ maxWidth: "600px", display: "block", margin: "0 auto" }}
          className="overflow-visible"
        >
          <g transform="translate(10, 10)">
            {/* String labels (optional, left side) */}
            {stringYCoords.map((y, s) => (
              <text
                key={`string-label-${s}`}
                x="15"
                y={y + 5}
                fill="#71717a"
                fontSize="14"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="end"
              >
                {6 - s}
              </text>
            ))}

            {/* Strings */}
            {stringYCoords.map((y, s) => {
              const thickness = 1 + (5 - s) * 0.4; // 6th string (s=0) is thickest
              return (
                <line
                  key={`string-${s}`}
                  x1={startX}
                  y1={y}
                  x2={startX + numFretsToDraw * fretWidth}
                  y2={y}
                  stroke="#71717a"
                  strokeWidth={thickness}
                />
              );
            })}

            {/* Frets */}
            {Array.from({ length: numFretsToDraw + 1 }).map((_, i) => (
              <line
                key={`fret-${i}`}
                x1={startX + i * fretWidth}
                y1={55}
                x2={startX + i * fretWidth}
                y2={280}
                stroke="#52525b"
                strokeWidth="3"
              />
            ))}

            {/* Fret Labels (bottom) */}
            {Array.from({ length: numFretsToDraw }).map((_, i) => (
              <text
                key={`fret-label-${i}`}
                x={startX + i * fretWidth + fretWidth / 2}
                y={320}
                fill="#71717a"
                fontSize="16"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {baseFret + i}
              </text>
            ))}

            {/* Notes */}
            {notes.map((note, index) => {
              const visualFret = note.fret - baseFret;
              const x = startX + visualFret * fretWidth + fretWidth / 2;
              const y = stringYCoords[note.stringIdx];

              return (
                <g key={`note-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={note.isRoot ? "#EA580B" : "#0ea5e9"}
                    stroke={note.isRoot ? "#EA580B" : "#0284c7"}
                    strokeWidth="3"
                  />
                  <text
                    x={x}
                    y={y + 6}
                    fill={note.isRoot ? "#000" : "#fff"}
                    fontSize="15"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    {note.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
