export interface CurriculumChapter {
  id: string;
  title: string;
  level: string;
  theoryMarkdown: string;
  visualizerTriggers: any[];
  quiz: any[];
}

const sostenidosData = [
  { root: 'C', chords: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'] },
  { root: 'G', chords: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5'] },
  { root: 'D', chords: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5'] },
  { root: 'A', chords: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5'] },
  { root: 'E', chords: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5'] },
  { root: 'B', chords: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5'] },
  { root: 'F#', chords: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'] }
];

const bemolesData = [
  { root: 'F', chords: ['Fmaj7', 'Gm7', 'Am7', 'Bbmaj7', 'C7', 'Dm7', 'Em7b5'] },
  { root: 'Bb', chords: ['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5'] },
  { root: 'Eb', chords: ['Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7', 'Cm7', 'Dm7b5'] },
  { root: 'Ab', chords: ['Abmaj7', 'Bbm7', 'Cm7', 'Dbmaj7', 'Eb7', 'Fm7', 'Gm7b5'] },
  { root: 'Db', chords: ['Dbmaj7', 'Ebm7', 'Fm7', 'Gbmaj7', 'Ab7', 'Bbm7', 'Cm7b5'] },
  { root: 'Gb', chords: ['Gbmaj7', 'Abm7', 'Bbm7', 'Cbmaj7', 'Db7', 'Ebm7', 'Fm7b5'] }
];

export const harmonyCurriculumPart1: CurriculumChapter[] = [
  {
    id: "capitulo_1",
    title: "Introducción a la Armonía e Intervalos",
    level: "Básico",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 1: Introducción a la Armonía e Intervalos</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Introducción a la Armonía</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La armonía es un pilar fundamental en la música, ya que no solo da estructura a las composiciones, sino que también evoca emociones y conecta a los oyentes con la obra.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    Los objetivos de este libro son:
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li>Proporcionar una comprensión sólida de los principios de la armonía.</li>
    <li>Desarrollar habilidades para analizar, componer e improvisar música de manera efectiva.</li>
    <li>Fomentar la creatividad musical a través de la aplicación práctica de la teoría.</li>
  </ul>
  <p className="text-slate-300 leading-relaxed">
    La importancia de la armonía radica en su capacidad para crear contextos sonoros que acompañan la melodía, aportando riqueza y profundidad a la música. A lo largo de este libro, aprenderemos a identificar, construir y aplicar conceptos armónicos que nos ayudarán a convertir nuestras ideas musicales en realidad.
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Intervalos - La Unidad Básica</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Los intervalos son la base de la armonía y representan la distancia entre dos notas. Se dividen en:
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li><strong>Intervalo Melódico:</strong> es cuando se toca una nota y después la otra.</li>
    <li><strong>Intervalo Armónico:</strong> es cuando se tocan 2 notas al mismo tiempo.</li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Tabla de Intervalos (Desde C)</h3>
  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm text-left text-slate-300">
      <thead className="text-xs text-white uppercase bg-cyan-900/40">
        <tr>
          <th className="py-3 px-4 font-semibold">Distancia</th>
          <th className="py-3 px-4 font-semibold">Intervalo (Semitonos)</th>
          <th className="py-3 px-4 font-semibold text-center">Ejemplo desde <span className="text-orange-500 font-semibold">C</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">1 semitono</td>
          <td className="py-3 px-4">Segunda menor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:C#" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a C#</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">2 semitonos</td>
          <td className="py-3 px-4">Segunda mayor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:D" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a D</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">3 semitonos</td>
          <td className="py-3 px-4">Tercera menor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:D#" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a D#</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">4 semitonos</td>
          <td className="py-3 px-4">Tercera mayor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:E" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a E</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">5 semitonos</td>
          <td className="py-3 px-4">Cuarta justa</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:F" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a F</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">6 semitonos</td>
          <td className="py-3 px-4">Cuarta aumentada/Quinta disminuida</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:F#" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a F#</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">7 semitonos</td>
          <td className="py-3 px-4">Quinta justa</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:G" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a G</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">8 semitonos</td>
          <td className="py-3 px-4">Sexta menor/Quinta aumentada</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:G#" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a G#</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">9 semitonos</td>
          <td className="py-3 px-4">Sexta mayor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:A" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a A</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">10 semitonos</td>
          <td className="py-3 px-4">Séptima menor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:A#" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a A#</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">11 semitonos</td>
          <td className="py-3 px-4">Séptima mayor</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:B" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a B</a></td>
        </tr>
        <tr className="border-b border-slate-700 hover:bg-slate-700/30">
          <td className="py-3 px-4">12 semitonos</td>
          <td className="py-3 px-4">Octava</td>
          <td className="py-3 px-4 text-center"><a href="#action:interval:C:C" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C a C (Octava)</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Identificación y Construcción</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Identificación:</strong> Para identificar un intervalo, es fundamental conocer las notas involucradas y contar la distancia en tonos y semitonos. Ejemplo: El intervalo de una tercera mayor se compone de cuatro semitonos. Si comenzamos en la nota <span className="text-orange-500 font-semibold">C (Do)</span>, el intervalo de tercera mayor sería <span className="text-orange-500 font-semibold">E (Mi)</span>.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Construcción:</strong> Para construir un intervalo, se debe comenzar con una nota base y contar hacia arriba o hacia abajo el número de tonos y semitonos requeridos. Ejemplo: Para construir una quinta justa a partir de <span className="text-orange-500 font-semibold">C (Do)</span>, contamos siete semitonos, lo que nos lleva a <span className="text-orange-500 font-semibold">G (Sol)</span>.
  </p>
</div>
    `,
    visualizerTriggers: [
      {
        description: "Distancias de 3ra Mayor y 5ta Justa en el mástil desde C.",
        type: "intervals",
        root: "C",
        notes: ["C", "E", "G"],
        intervals: ["3", "5"]
      }
    ],
    quiz: [
      {
        question: "¿Cuál es la 6ta Mayor (6) de C?",
        options: ["Ab", "G", "A", "Bb"],
        correctAnswerIndex: 2,
        explanation: "Recuerda: La 6ta Mayor está a 9 semitonos de distancia desde la tónica."
      },
      {
        question: "¿Cuál es la 5ta Justa (5) de G?",
        options: ["C", "D", "E", "Db"],
        correctAnswerIndex: 1,
        explanation: "Recuerda: La 5ta Justa está a 7 semitonos de distancia."
      },
      {
        question: "¿Cuál es la 6ta menor (b6) de Eb?",
        options: ["C", "B", "Cb", "Bb"],
        correctAnswerIndex: 2,
        explanation: "Recuerda: La 6ta menor (b6) está a 8 semitonos de distancia."
      },
      {
        question: "¿Cuál es la 3ra menor (b3) de A?",
        options: ["C#", "C", "D", "B"],
        correctAnswerIndex: 1,
        explanation: "Recuerda: La 3ra menor (b3) está a 3 semitonos de distancia."
      },
      {
        question: "¿Cuál es la 7ma Mayor (7) de F?",
        options: ["Eb", "E", "D", "F#"],
        correctAnswerIndex: 1,
        explanation: "Recuerda: La 7ma Mayor está a 11 semitonos de distancia, un semitono por debajo de la octava."
      },
      {
        question: "¿Cuál es la 4ta Aumentada (#4 / b5) de Bb?",
        options: ["E", "F", "Eb", "D"],
        correctAnswerIndex: 0,
        explanation: "Recuerda: La 4ta Aumentada (#4 / b5) está a 6 semitonos de distancia (el tritono)."
      },
      {
        question: "¿Cuál es la 2da menor (b2) de D?",
        options: ["E", "Eb", "C#", "C"],
        correctAnswerIndex: 1,
        explanation: "Recuerda: La 2da menor (b2) está a 1 semitono de distancia."
      }
    ]
  },
  {
    id: "capitulo_2",
    title: "Construcción de Acordes Tríadas",
    level: "Básico",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 2: Construcción de Acordes Tríadas</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Introducción a las Tríadas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Los acordes triadas son la base fundamental de la armonía en la música. Se componen de tres notas y se clasifican en cuatro tipos principales: mayores, menores, disminuidos y aumentados. Cada tipo de acorde se construye a partir de una nota fundamental, añadiendo diferentes intervalos.
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Acordes Mayores</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Construcción:</strong> Se forma utilizando la primera (tónica), tercera mayor y quinta justa de la escala.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Ejemplo Acorde C Mayor:</strong> <a href="#action:chord:C:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C (Do) - E (Mi) - G (Sol)</a>
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Acordes Menores</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Construcción:</strong> Se forma utilizando la primera (tónica), tercera menor y quinta justa de la escala.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Ejemplo Acorde C Menor:</strong> <a href="#action:chord:C:Menor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C (Do) - Eb (Mi bemol) - G (Sol)</a>
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Acordes Disminuidos</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Construcción:</strong> Se forma utilizando la primera (tónica), tercera menor y quinta disminuida (que es un semitono por debajo de la quinta justa).
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Ejemplo Acorde C Disminuido:</strong> <a href="#action:chord:C:dim7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C (Do) - Eb (Mi bemol) - Gb (Sol bemol)</a>
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Acordes Aumentados</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Construcción:</strong> Se forma utilizando la primera (tónica), tercera mayor y quinta aumentada (un semitono por encima de la quinta justa).
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Ejemplo Acorde C Aumentado:</strong> <a href="#action:chord:C:aug" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C (Do) - E (Mi) - G (Sol sostenido)</a>
  </p>
</div>
    `,
    visualizerTriggers: [
      {
        description: "Renderizar C, Cm, Cdim, Caug en las cuerdas 5, 4 y 3.",
        type: "chord_sequence",
        chords: [
           { root: "C", type: "Mayor" },
           { root: "C", type: "Menor" },
           { root: "C", type: "dim7", title: "Disminuído (tríada/dim7)" },
           { root: "C", type: "aug" }
        ]
      }
    ],
    quiz: [
      {
        question: "Si estás tocando un G Mayor (G - B - D) y cambias la tercera mayor (B) por una tercera menor (Bb), ¿qué tríada estás formando?",
        options: ["G Aumentado", "G Disminuido", "G Menor", "G sus4"],
        correctAnswerIndex: 2,
        explanation: "Correcto. Al bajar la tercera mayor un semitono, se convierte en tercera menor, formando la tríada de G Menor."
      },
      {
        question: "Tienes un acorde con la estructura 1 - b3 - b5. Si subes la quinta un semitono (a 5ta justa), ¿en qué especie de tríada se convierte?",
        options: ["Tríada Mayor", "Tríada Menor", "Tríada Aumentada", "Queda igual"],
        correctAnswerIndex: 1,
        explanation: "Correcto. 1 - b3 - 5 es la fórmula de una Tríada Menor."
      },
      {
        question: "La diferencia entre una tríada mayor y una tríada aumentada radica en la alteración de un solo intervalo. ¿Cuál es?",
        options: ["La tercera (de mayor a menor)", "La quinta (de justa a disminuida)", "La quinta (de justa a aumentada)", "La tónica"],
        correctAnswerIndex: 2,
        explanation: "Correcto. La tríada aumentada se forma elevando la quinta justa (5) a quinta aumentada (#5)."
      },
      {
        question: "Si tocas las notas A - C - E, estás formando una tríada menor de A. ¿Qué nota debes alterar para transformarla en una tríada disminuida?",
        options: ["Bajar el E a Eb", "Subir el C a C#", "Bajar el A a Ab", "Subir el E a F"],
        correctAnswerIndex: 0,
        explanation: "Correcto. Para hacerla disminuida, debes bajar la quinta justa (E) a quinta disminuida (Eb)."
      },
      {
        question: "Sabiendo que un acorde aumentado se forma con Tónica, 3ra Mayor y 5ta Aumentada, ¿qué notas componen la tríada de F Aumentado (Faug)?",
        options: ["F - Ab - C", "F - A - C#", "F - A - C", "F - Ab - Cb"],
        correctAnswerIndex: 1,
        explanation: "Correcto. F es tónica, A es la 3ra Mayor y C# es la 5ta Aumentada."
      }
    ]
  },
  {
    id: "capitulo_3",
    title: "Escala Mayor y su Estructura Interválica",
    level: "Básico",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 3: Escala Mayor y su Estructura Interválica</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Estructura Interválica de la Escala Mayor</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La escala mayor es uno de los cimientos fundamentales de la teoría musical y la madre de nuestra música tonal occidental. Posee una estructura interválica específica desde su tónica.
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li><strong>Fórmula Interválica:</strong> Tónica(1) - 2da Mayor(2) - 3ra Mayor(3) - 4ta Justa(4) - 5ta Justa(5) - 6ta Mayor(6) - 7ma Mayor(7).</li>
    <li><strong>Patrón de Tonos(T) y Semitonos(S):</strong> T - T - S - T - T - T - S.</li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">La Escala Mayor de C y su Importancia</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La escala mayor de C es única porque no contiene alteraciones (ni sostenidos ni bemoles). Está compuesta por la secuencia de notas naturales: <strong className="text-orange-500">C - D - E - F - G - A - B - C</strong>.
  </p>
  <div className="mt-4 mb-6">
    <a href="#action:scale:C:Mayor" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/50 rounded-lg transition-all cursor-pointer font-semibold shadow-sm hover:shadow-md">
      🎸 Visualizar y Reproducir Escala Completa
    </a>
  </div>
  <p className="text-slate-300 leading-relaxed mb-4">
    Esta escala sirve como modelo y punto de partida para construir todas las demás escalas mayores y entender la armonía fundamental. Su simplicidad la hace ideal para comenzar el estudio armónico.
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Armonización de la Escala Mayor de C</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La armonización implica construir acordes a partir de cada nota de la escala mayor (usando solo las notas diatónicas). Al aplicar esto en la <a href="#action:scale:C:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">escala de C Mayor</a> obtenemos la siguiente progresión de tríadas:
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li><strong>1.</strong> <a href="#action:chord:C:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C Mayor</a> (C - E - G)</li>
    <li><strong>2.</strong> <a href="#action:chord:D:Menor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">D Menor</a> (D - F - A)</li>
    <li><strong>3.</strong> <a href="#action:chord:E:Menor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">E Menor</a> (E - G - B)</li>
    <li><strong>4.</strong> <a href="#action:chord:F:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">F Mayor</a> (F - A - C)</li>
    <li><strong>5.</strong> <a href="#action:chord:G:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G Mayor</a> (G - B - D)</li>
    <li><strong>6.</strong> <a href="#action:chord:A:Menor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">A Menor</a> (A - C - E)</li>
    <li><strong>7.</strong> <a href="#action:chord:B:dim7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">B Disminuido</a> (B - D - F)</li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg mt-6">
  <h3 className="text-xl font-bold text-white mb-4">Caso de Estudio: Análisis de 'Let It Be' (The Beatles)</h3>
  <p className="text-slate-300 mb-4">
    Para entender el poder de la Escala Mayor, analicemos la estrofa de uno de los grandes clásicos del pop. Esta canción está en la tonalidad de Do Mayor (C) y utiliza exclusivamente acordes de su armonización (tríadas diatónicas). Es el ejemplo perfecto para escuchar cómo interactúan los grados I, V, vi y IV.
  </p>

  <div className="flex items-center mb-4 gap-2 flex-wrap">
    <a href="#action:progression:C,G,Am,F,C,G,F,C" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ▶️ Escuchar Progresión
    </a>
    <a href="#action:stop" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ⏹️ Detener
    </a>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:C" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">C</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:G" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">G</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Am" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Am</a>
      <span className="text-xs text-slate-400 mt-1">[vi] Relativo Menor</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:F" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">F</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:C" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">C</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:G" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">G</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:F" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">F</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:C" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">C</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
  </div>

  <p className="text-slate-300 mt-4">
    Notarás cómo la canción parte desde la estabilidad absoluta de la Tónica (I), genera tensión al moverse al Dominante (V), hace un pequeño desvío melancólico hacia su relativo menor (vi) y aterriza suavemente en la Subdominante (IV). Esta progresión I - V - vi - IV es el esqueleto de miles de éxitos mundiales.
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Escalas con Sostenidos (#)</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    El concepto se organiza a través del Círculo de Quintas, que nos permite determinar qué notas se alteran en cada nueva escala mayor. El proceso consiste en tomar la quinta justa de la tónica de la escala anterior. Cada nueva escala añade un sostenido en el séptimo grado.
  </p>
  <capitulo3-tablas type="sostenidos" />
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Escalas con Bemoles (b)</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Se organizan siguiendo el mismo principio pero en sentido inverso (Círculo de Cuartas), generando alteraciones descendentes. En este caso, las nuevas tonalidades se construyen añadiendo bemoles a partir del cuarto grado de la escala anterior.
  </p>
  <capitulo3-tablas type="bemoles" />
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg mt-6">
  <h3 className="text-xl font-bold text-white mb-4">Transposición: Cambiando de Tonalidad con las Tablas</h3>
  <p className="text-slate-300 mb-6">
    La magia de pensar en grados romanos (I, V, vi, IV) en lugar de acordes fijos, es que puedes mover cualquier canción a la tonalidad que mejor se ajuste a tu voz. Solo tienes que buscar la nueva tonalidad en las tablas de arriba y copiar los acordes de esas mismas columnas. Veamos cómo queda 'Let It Be' si la transportamos a La Bemol Mayor (Ab) y a Mi Mayor (E).
  </p>

  <h4 className="text-lg font-bold text-slate-200 mb-3 block">1. Tonalidad de Ab Mayor (Buscando en la tabla con bemoles)</h4>
  <div className="flex items-center mb-4 gap-2 flex-wrap">
    <a href="#action:progression:Ab,Eb,Fm,Db,Ab,Eb,Db,Ab" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ▶️ Escuchar Progresión
    </a>
    <a href="#action:stop" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ⏹️ Detener
    </a>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-8">
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Ab" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Ab</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Eb" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Eb</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Fm" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Fm</a>
      <span className="text-xs text-slate-400 mt-1">[vi] Relativo Menor</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Db" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Db</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Ab" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Ab</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Eb" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Eb</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Db" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Db</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Ab" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">Ab</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
  </div>

  <h4 className="text-lg font-bold text-slate-200 mb-3 block">2. Tonalidad de E Mayor (Buscando en la tabla con sostenidos)</h4>
  <div className="flex items-center mb-4 gap-2 flex-wrap">
    <a href="#action:progression:E,B,C#m,A,E,B,A,E" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ▶️ Escuchar Progresión
    </a>
    <a href="#action:stop" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ⏹️ Detener
    </a>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:E" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">E</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:B" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">B</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:C#m" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">C#m</a>
      <span className="text-xs text-slate-400 mt-1">[vi] Relativo Menor</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:A" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">A</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:E" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">E</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:B" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">B</a>
      <span className="text-xs text-yellow-400 mt-1">[V] Dominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:A" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">A</a>
      <span className="text-xs text-slate-400 mt-1">[IV] Subdominante</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:E" className="text-orange-500 hover:text-orange-300 font-bold text-xl cursor-pointer transition-colors !no-underline">E</a>
      <span className="text-xs text-slate-400 mt-1">[I] Tónica</span>
    </div>
  </div>
</div>
`,
    visualizerTriggers: [
      {
        description: "Mostrar la escala mayor de C a lo largo de la 5ta y 4ta cuerda y la armonización de tríadas diatónicas.",
        type: "scale_and_diatonic_chords",
        scale: "C Mayor",
        strings: [4, 5],
        chords: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]
      }
    ],
    quiz: [
      {
        question: "¿Cuál es la 5ta justa de C que inicia el círculo de sostenidos?",
        options: ["F", "G", "D", "A"],
        correctAnswerIndex: 1,
        explanation: "La quinta justa de C es G, que marca la primera escala con un sostenido en la armadura."
      },
      {
        question: "En la tonalidad de D Mayor, ¿cuál es el acorde del grado VI?",
        options: ["Em", "F#m", "Bm", "A"],
        correctAnswerIndex: 2,
        explanation: "El sexto grado de D Mayor genera un acorde menor, en este caso B menor (Bm), que también es su relativa menor."
      },
      {
        question: "¿Qué nota se altera (sostenido) al pasar de C Mayor a G Mayor?",
        options: ["C#", "F#", "G#", "D#"],
        correctAnswerIndex: 1,
        explanation: "Al pasar a la tonalidad de G Mayor, el séptimo grado se convierte en sensible, introduciendo la alteración F#."
      },
      {
        question: "¿Cuál es el acorde diatónico del grado VII en la escala de A Mayor?",
        options: ["G#dim", "Gdim", "C#dim", "F#m"],
        correctAnswerIndex: 0,
        explanation: "El grado VII de una escala mayor es un acorde disminuido. En A Mayor, el séptimo grado es sol sostenido (G#), formando G#dim."
      },
      {
        question: "¿Qué escala mayor tiene exactamente 4 sostenidos en su armadura?",
        options: ["D Mayor", "A Mayor", "B Mayor", "E Mayor"],
        correctAnswerIndex: 3,
        explanation: "Siguiendo el círculo de quintas: G (1), D (2), A (3), E (4). E Mayor tiene 4 sostenidos: F#, C#, G#, D#."
      }
    ]
  },
  {
    id: "capitulo_4",
    title: "Construcción de Acordes Tétradas",
    level: "Básico",
    theoryMarkdown: `
# Capítulo 4: Construcción de Acordes Tétradas

## 1. Acordes Tétradas
<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Acordes Tétradas y su Formación</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Los acordes tétradas, o acordes con séptima, están formados por cuatro notas distintivas. Son fundamentales en géneros musicales como el jazz, blues, bossa nova o el neo-soul, ya que añaden una mayor riqueza armónica, tensión y color.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    Al igual que las tríadas se forman superponiendo terceras, las tétradas agregan una tercera adicional sobre la quinta de la tríada original, generando un intervalo de séptima desde la nota raíz.
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li><strong>Acorde Mayor 7 (Maj7):</strong> Tríada Mayor + Séptima Mayor. Fórmula: 1 - 3 - 5 - 7. Ejemplo: <a href="#action:chord:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a>.</li>
    <li><strong>Acorde Dominante (7):</strong> Tríada Mayor + Séptima menor. Fórmula: 1 - 3 - 5 - b7. Ejemplo: <a href="#action:chord:C:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C7</a>.</li>
    <li><strong>Acorde Menor 7 (m7):</strong> Tríada Menor + Séptima menor. Fórmula: 1 - b3 - 5 - b7. Ejemplo: <a href="#action:chord:C:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cm7</a>.</li>
    <li><strong>Acorde Menor con Séptima Mayor (m(maj7)):</strong> Tríada Menor + Séptima Mayor. Fórmula: 1 - b3 - 5 - 7. Ejemplo: <a href="#action:chord:C:m(maj7)" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cm(7M)</a>.</li>
    <li><strong>Acorde Semidisminuido (m7b5):</strong> Tríada Disminuida + Séptima menor. Fórmula: 1 - b3 - b5 - b7. Ejemplo: <a href="#action:chord:C:m7b5" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cm7(5b)</a>.</li>
    <li><strong>Acorde Disminuido (dim7):</strong> Tríada Disminuida + Séptima Disminuida. Fórmula: 1 - b3 - b5 - bb7. Ejemplo: <a href="#action:chord:C:dim7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cdim7</a>.</li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Aplicación en Progresiones Armónicas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Las tétradas enriquecen el movimiento armónico, tal como podemos ver en las famosas progresiones II - V - I, extendiendo lo que vimos previamente con triadas.
  </p>
  <ul className="list-disc list-inside marker:text-orange-500 text-slate-300 space-y-2 mb-4">
    <li><strong>II - V - I en tonalidad mayor:</strong> Se estructura usando los grados correspondientes de la escala: el II grado es menor 7, el V grado es dominante, y el I grado es Mayor 7. Ejemplo en C mayor: <a href="#action:chord:D:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Dm7</a> - <a href="#action:chord:G:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G7</a> - <a href="#action:chord:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a>.</li>
    <li><strong>II - V - I en tonalidad menor:</strong> El concepto es similar pero utilizando los grados de la escala menor armónica: el II grado es semidisminuido, el V grado es dominante (para crear la tensión hacia la tónica), y el I grado es menor 7. Ejemplo en La menor: <a href="#action:chord:B:m7b5" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Bm7b5</a> - <a href="#action:chord:E:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">E7</a> - <a href="#action:chord:A:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Am7</a>.</li>
    <li><strong>Cadencia de Blues:</strong> Una progresión característica del blues utilizando acordes de séptima dominante. Ejemplo en C: <a href="#action:chord:C:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C7</a> - <a href="#action:chord:F:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">F7</a> - <a href="#action:chord:G:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G7</a>.</li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-white mb-4">Tablas de Acordes Tétradas (Sostenidos y Bemoles)</h3>
  <capitulo4-tablas></capitulo4-tablas>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-orange-500/50 mb-6 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
  <h3 className="text-xl font-bold text-orange-500 mb-4 flex items-center gap-2">🎧 Aplicación Práctica: Caso de Estudio</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La teoría cobra vida cuando la aplicamos. Para dominar la sonoridad de los acordes tétradas (Maj7, m7 y dominantes 7), el estándar <strong>"Mack the Knife"</strong> es el laboratorio perfecto. Su progresión armónica nos permite escuchar claramente cómo la séptima añade color, profundidad y movimiento a cada acorde dentro de una misma tonalidad.
  </p>
  <div className="mt-4 mb-2">
    <a href="#action:standard:mack-the-knife" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/50 rounded-lg transition-all cursor-pointer font-semibold shadow-sm hover:shadow-md">
      🎵 Analizar Mack the Knife en el Reproductor
    </a>
  </div>
</div>
    `,
    visualizerTriggers: [
      {
        description: "Visualizar el acorde Cmaj7",
        type: "chord",
        root: "C",
        chordType: "maj7"
      }
    ],
    quiz: [
      {
        question: "¿Qué nota se añade a una tríada para convertirla en tétrada?",
        options: ["La novena", "La sexta", "La séptima", "La cuarta"],
        correctAnswerIndex: 2,
        explanation: "La séptima es la nota que se superpone a la quinta de la tríada."
      },
      {
        question: "¿Cuál es la fórmula del acorde Maj7?",
        options: ["1 - b3 - 5 - 7", "1 - 3 - 5 - b7", "1 - 3 - 5 - 7", "1 - 3 - #5 - 7"],
        correctAnswerIndex: 2,
        explanation: "El acorde Mayor 7 se compone de la Fundamental, 3ra Mayor, 5ta Justa y 7ma Mayor (1 - 3 - 5 - 7)."
      },
      {
        question: "En la tonalidad de C, ¿cuál es el acorde m7 que corresponde al grado II?",
        options: ["Em7", "Dm7", "Am7", "Bm7b5"],
        correctAnswerIndex: 1,
        explanation: "El segundo grado de la escala de C Mayor es D, y forma un acorde menor 7 (Dm7)."
      },
      {
        question: "¿Qué tipo de acorde de séptima se forma en el grado V de una escala mayor?",
        options: ["Mayor 7", "Menor 7", "7 o Dominante", "Semidisminuido"],
        correctAnswerIndex: 2,
        explanation: "El quinto grado de una escala mayor genera un acorde Dominante (7)."
      },
      {
        question: "¿Cuál es el acorde del grado VII en la escala de G mayor usando tétradas?",
        options: ["F#dim7", "Fm7b5", "F#m7", "F#m7b5"],
        correctAnswerIndex: 3,
        explanation: "El séptimo grado forma un acorde semidisminuido. En G mayor, la séptima nota es F#, por lo que el acorde es F#m7b5."
      }
    ]
  },
  {
    id: "capitulo_5",
    title: "Arpegios y Funciones Armónicas",
    level: "Básico",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 5: Arpegios y Funciones Armónicas</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">1. ¿Qué es un Arpegio?</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    A diferencia de un acorde clásico donde estructuramos la mano para hacer sonar todas las notas al unísono (Stack / Bloque), un <strong>arpegio</strong> consiste en tocar las notas que componen el acorde de forma secuencial, una tras otra.
  </p>
  <p className="text-slate-300 leading-relaxed mb-0">
    Los arpegios son fundamentales para los bajistas y guitarristas líderes, ya que permiten delinear la armonía mientras se crea movimiento melódico. Dominar los arpegios es el primer paso para la improvisación fluida y la creación de líneas de bajo dinámicas (Walking Bass).
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">2. Arpegios de Tríadas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Podemos construir secuencias de tres (o cuatro, contando la octava) notas basadas en las diferentes cualidades. 
  </p>
  <ul className="space-y-3 ms-2 mb-0">
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Tríada Mayor:</strong> Formada por Tónica, 3ra Mayor y 5ta Justa. Visualiza el recorrido de <a href="#action:arpeggio:C:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C Mayor</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Tríada Menor:</strong> Formada por Tónica, 3ra menor y 5ta Justa. Visualiza el salto melódico de <a href="#action:arpeggio:A:Menor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">A Menor</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Tríada Disminuida:</strong> Formada por Tónica, 3ra menor y 5ta disminuirda. Tiene una fuerte tensión resolutiva. Visualiza <a href="#action:arpeggio:B:dim7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">B Disminuido</a> (Mostraremos la tétrada dim7 usada frecuentemente).</span>
    </li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">3. Arpegios de Tétradas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Al añadir la séptima, el arpegio consta de 4 notas antes de repetir la octava, abriendo el compás de 4/4 casi perfecto si jugamos con negras.
  </p>
  <ul className="space-y-3 ms-2 mb-0">
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Arpegio Maj7:</strong> Tónica, 3ra Mayor, 5ta Justa, 7ma Mayor. Produce un contorno melódico abierto y brillante. Visualiza el arpegio <a href="#action:arpeggio:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Arpegio m7:</strong> Tónica, 3ra menor, 5ta Justa, 7ma menor. Frecuente en líneas de acompañamiento jazz o funk suave. Visualiza <a href="#action:arpeggio:A:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Am7</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Arpegio Dominante (7):</strong> Tónica, 3ra Mayor, 5ta Justa, 7ma menor. Pilar fundamental en blues, indicando direccionalidad. Visualiza el clásico <a href="#action:arpeggio:G:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G7</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Arpegio Semidisminuido (m7b5):</strong> Tónica, 3ra menor, 5ta disminuida, 7ma menor. Fundamental para el Grado VII de la escala mayor. Visualiza <a href="#action:arpeggio:B:m7b5" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Bm7b5</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Arpegio Disminuido (dim7):</strong> Tónica, 3ra menor, 5ta disminuida, 7ma disminuida. Arpegio simétrico, lleno de tensión. Visualiza <a href="#action:arpeggio:B:dim7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Bdim7</a>.</span>
    </li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">4. Funciones Armónicas Principales y Sustitutas</h3>
  
  <p className="text-slate-300 leading-relaxed mb-4">
    En la tonalidad mayor (ej. C Mayor), cada acorde cumple un rol o <strong>función armónica</strong>:
  </p>
  
  <ul className="space-y-2 ms-2 mb-6">
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Tónica (I):</strong> Estabilidad, reposo.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Subdominante (IV):</strong> Tensión media, movimiento.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><strong>Dominante (V):</strong> Tensión máxima, necesidad de resolver a la tónica.</span>
    </li>
  </ul>

  <h4 className="font-bold text-emerald-400 mb-3">Funciones Armónicas Principales:</h4>
  <ul className="space-y-2 ms-2 mb-6">
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a> (I): C - E - G - B</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:F:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Fmaj7</a> (IV): F - A - C - E</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:G:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G7</a> (V): G - B - D - F</span>
    </li>
  </ul>

  <h4 className="font-bold text-emerald-400 mb-3">Funciones Armónicas Sustitutas:</h4>
  <p className="text-slate-300 leading-relaxed mb-4">
    Los acordes que comparten 3 notas con los principales pueden funcionar como <strong>sustitutos</strong>.
  </p>
  <ul className="space-y-2 ms-2 mb-0">
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:E:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Em7</a> (III) y <a href="#action:chord:A:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Am7</a> (VI) pueden sustituir a <a href="#action:chord:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a>. (Nota cómo el <a href="#action:chord:A:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Am7</a> comparte A - C - E - G; 3 notas de 4).</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:D:m7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Dm7</a> (II) puede sustituir a <a href="#action:chord:F:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Fmaj7</a>.</span>
    </li>
    <li className="flex items-start">
      <span className="text-emerald-500 mr-2 mt-1">●</span>
      <span className="text-slate-300"><a href="#action:chord:B:m7b5" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Bm7♭5</a> (VII) puede sustituir a <a href="#action:chord:G:7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">G7</a>.</span>
    </li>
  </ul>
</div>

<div className="bg-slate-800/50 border-l-4 border-emerald-500 p-5 my-6 rounded-r">
  <p className="font-bold text-emerald-400 mb-2">Progresión básica en C mayor:</p>
  <p className="mb-4">
    <a href="#action:chord:C:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Cmaj7</a> -> <a href="#action:chord:F:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Fmaj7</a> -> <a href="#action:chord:G:7" className="text-orange-500 font-bold hover:underline cursor-pointer">G7</a> -> Resolución: <a href="#action:chord:C:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Cmaj7</a>
  </p>

  <p className="font-bold text-emerald-400 mb-2">Progresión con funciones sustitutas:</p>
  <p className="text-sm text-slate-400 mb-2">Sustituyendo el Cmaj7 inicial, el Fmaj7 y modificando el Dominante:</p>
  <p className="mb-0">
    <a href="#action:chord:A:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Am7</a> -> <a href="#action:chord:D:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Dm7</a> -> <a href="#action:chord:B:m7b5" className="text-orange-500 font-bold hover:underline cursor-pointer">Bm7b5</a> -> Resolución: <a href="#action:chord:C:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Cmaj7</a>
  </p>
</div>
    `,
    visualizerTriggers: [
      {
        description: "Visualizar Arpegio de C Mayor",
        type: "chord",
        root: "C",
        chordType: "Mayor"
      }
    ],
    quiz: [
      {
        question: "¿Cuál es la principal diferencia entre un acorde y un arpegio?",
        options: ["Los arpegios solo usan dos notas", "La ejecución secuencial de las notas", "Los arpegios no tienen tónica", "Los acordes son lineales"],
        correctAnswerIndex: 1,
        explanation: "Un arpegio desglosa el acorde, tocando sus notas una tras otra (secuencialmente) en lugar de simultáneamente."
      },
      {
        question: "¿Qué notas forman el arpegio de una tríada mayor?",
        options: ["Tónica, 3ra menor y 5ta justa", "Tónica, 2da y 5ta justa", "Tónica, 3ra mayor y 5ta justa", "Tónica, 4ta y 5ta disminuida"],
        correctAnswerIndex: 2,
        explanation: "La tríada mayor consiste siempre en Tónica, 3ra mayor y 5ta justa."
      },
      {
        question: "En un arpegio de tríada disminuida, ¿cómo es la quinta?",
        options: ["Quinta justa", "Quinta aumentada", "Quinta disminuida o 5b", "No tiene quinta"],
        correctAnswerIndex: 2,
        explanation: "La característica principal del 'disminuido' es la quinta bemol (5b) combinada con la tercera menor."
      },
      {
        question: "Al convertir un arpegio de tríada en uno de tétrada, ¿qué nota estamos agregando?",
        options: ["La novena", "La sexta", "La séptima", "La cuarta"],
        correctAnswerIndex: 2,
        explanation: "La tétrada se compone añadiendo una séptima a la tríada base."
      },
      {
        question: "¿Para qué sirven principalmente los arpegios en la música?",
        options: ["Solo para afinar el instrumento", "Para resaltar notas importantes y crear líneas melódicas fluidas", "Para hacer ruido percusivo", "Únicamente para terminar canciones"],
        correctAnswerIndex: 1,
        explanation: "Los arpegios conectan armónicamente una sección, aportando melodía y reforzando las notas objetivo de cada pasaje armónico."
      }
    ]
  },
  {
    id: "capitulo_6",
    title: "Inversiones y Modos de la Escala Mayor",
    level: "Intermedio",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 6: Inversiones y Modos de la Escala Mayor</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <p className="text-slate-300 leading-relaxed mb-0">
    En este capítulo exploraremos las inversiones de acordes y cómo suavizan las progresiones armónicas.
  </p>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">1. Inversiones de Tríadas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Una tríada tiene tres disposiciones según la nota que se sitúa en el bajo:
  </p>

  <ul className="space-y-6 ms-2 mb-0">
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Estado Fundamental:</strong> La tónica en el bajo. Ejemplo: <a href="#action:chord:C:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C</a> (C - E - G).</span>
      </div>
    </li>
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Primera Inversión:</strong> La 3ra en el bajo. Ejemplo: <a href="#action:chord:C/E:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C/E</a> (E - G - C).</span>
      </div>
<div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Estructura de Voces:</span>
  <div className="flex flex-wrap items-center justify-center gap-2">
    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/20 animate-pulse">
      <span className="opacity-80 text-[10px] uppercase font-mono tracking-wider">Bajo:</span>
      <span>E</span>
      <span className="opacity-80 text-[11px] font-normal">(Mi)</span>
    </div>
    <span className="text-orange-500/50 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>G</span>
      <span className="opacity-80 text-[11px] font-normal">(Sol)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>C</span>
      <span className="opacity-80 text-[11px] font-normal">(Do)</span>
    </div>
  </div>
</div>
    </li>
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Segunda Inversión:</strong> La 5ta en el bajo. Ejemplo: <a href="#action:chord:C/G:Mayor" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">C/G</a> (G - C - E).</span>
      </div>
<div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Estructura de Voces:</span>
  <div className="flex flex-wrap items-center justify-center gap-2">
    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/20 animate-pulse">
      <span className="opacity-80 text-[10px] uppercase font-mono tracking-wider">Bajo:</span>
      <span>G</span>
      <span className="opacity-80 text-[11px] font-normal">(Sol)</span>
    </div>
    <span className="text-orange-500/50 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>C</span>
      <span className="opacity-80 text-[11px] font-normal">(Do)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>E</span>
      <span className="opacity-80 text-[11px] font-normal">(Mi)</span>
    </div>
  </div>
</div>
    </li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">2. Inversiones de Tétradas</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    Las tétradas (acordes con séptima) tienen cuatro disposiciones:
  </p>

  <ul className="space-y-6 ms-2 mb-0">
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Estado Fundamental:</strong> Tónica en el bajo. Ejemplo: <a href="#action:chord:C:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7</a> (C - E - G - B).</span>
      </div>
    </li>
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Primera Inversión:</strong> 3ra en el bajo. Ejemplo: <a href="#action:chord:Cmaj7/E:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7/E</a> (E - G - B - C).</span>
      </div>
<div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Estructura de Voces:</span>
  <div className="flex flex-wrap items-center justify-center gap-2">
    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/20 animate-pulse">
      <span className="opacity-80 text-[10px] uppercase font-mono tracking-wider">Bajo:</span>
      <span>E</span>
      <span className="opacity-80 text-[11px] font-normal">(Mi)</span>
    </div>
    <span className="text-orange-500/50 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>G</span>
      <span className="opacity-80 text-[11px] font-normal">(Sol)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>B</span>
      <span className="opacity-80 text-[11px] font-normal">(Si)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>C</span>
      <span className="opacity-80 text-[11px] font-normal">(Do)</span>
    </div>
  </div>
</div>
    </li>
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Segunda Inversión:</strong> 5ta en el bajo. Ejemplo: <a href="#action:chord:Cmaj7/G:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7/G</a> (G - B - C - E).</span>
      </div>
<div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Estructura de Voces:</span>
  <div className="flex flex-wrap items-center justify-center gap-2">
    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/20 animate-pulse">
      <span className="opacity-80 text-[10px] uppercase font-mono tracking-wider">Bajo:</span>
      <span>G</span>
      <span className="opacity-80 text-[11px] font-normal">(Sol)</span>
    </div>
    <span className="text-orange-500/50 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>B</span>
      <span className="opacity-80 text-[11px] font-normal">(Si)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>C</span>
      <span className="opacity-80 text-[11px] font-normal">(Do)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>E</span>
      <span className="opacity-80 text-[11px] font-normal">(Mi)</span>
    </div>
  </div>
</div>
    </li>
    <li>
      <div className="flex items-start mb-2">
        <span className="text-emerald-500 mr-2 mt-1">●</span>
        <span className="text-slate-300"><strong>Tercera Inversión:</strong> 7ma en el bajo. Ejemplo: <a href="#action:chord:Cmaj7/B:maj7" className="text-orange-500 font-semibold hover:underline cursor-pointer transition-colors">Cmaj7/B</a> (B - C - E - G).</span>
      </div>
<div className="my-4 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Estructura de Voces:</span>
  <div className="flex flex-wrap items-center justify-center gap-2">
    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-orange-500/20 animate-pulse">
      <span className="opacity-80 text-[10px] uppercase font-mono tracking-wider">Bajo:</span>
      <span>B</span>
      <span className="opacity-80 text-[11px] font-normal">(Si)</span>
    </div>
    <span className="text-orange-500/50 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>C</span>
      <span className="opacity-80 text-[11px] font-normal">(Do)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>E</span>
      <span className="opacity-80 text-[11px] font-normal">(Mi)</span>
    </div>
    <span className="text-slate-500 font-bold">➔</span>
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-full border border-slate-600/50">
      <span>G</span>
      <span className="opacity-80 text-[11px] font-normal">(Sol)</span>
    </div>
  </div>
</div>
    </li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">3. Cómo Afectan la Sonoridad en las Progresiones</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    El movimiento de los acordes en estado fundamental suele tener grandes saltos en el bajo. Las inversiones permiten líneas de bajo conjuntas.
  </p>
<div className="bg-slate-800/50 border-l-4 border-emerald-500 p-5 my-6 rounded-r">
  <p className="font-bold text-emerald-400 mb-2">Progresión con Saltos (Estado Fundamental):</p>
  <p className="mb-4">
    <a href="#action:chord:C:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">C</a> -> <a href="#action:chord:G:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">G</a> -> <a href="#action:chord:A:Menor" className="text-orange-500 font-bold hover:underline cursor-pointer">Am</a> -> <a href="#action:chord:F:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">F</a>
  </p>

  <p className="font-bold text-emerald-400 mb-2">Progresión Suave con Inversiones:</p>
  <p className="text-sm text-slate-400 mb-2">Usando inversiones para crear una línea de bajo descendente paso a paso, dando continuidad y suavidad al flujo armónico.</p>
  <p className="mb-0">
    <a href="#action:chord:C:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">C</a> -> <a href="#action:chord:G/B:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">G/B</a> -> <a href="#action:chord:A:Menor" className="text-orange-500 font-bold hover:underline cursor-pointer">Am</a> -> <a href="#action:chord:F/A:Mayor" className="text-orange-500 font-bold hover:underline cursor-pointer">F/A</a>
  </p>
</div>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">4. Introducción a los Modos Griegos</h3>
  <p className="text-slate-300 leading-relaxed mb-0">
    Los modos griegos son diferentes perspectivas de una misma escala. Si tomamos las notas de la escala mayor (por ejemplo, C Mayor: C, D, E, F, G, A, B) y comenzamos a tocarlas desde diferentes grados, obtenemos estructuras de intervalos distintas, cada una con un "color" o "carácter" único. Estos son los 7 modos:
  </p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-orange-500 mb-2">1. Jónico (Escala Mayor)</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 1er grado | Notas: C-D-E-F-G-A-B</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2M - 3M - 4J - 5J - 6M - 7M</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Sonido brillante, alegre, estable. Es la base de nuestra armonía tradicional.</p>
      <a href="#action:scale:C:Mayor" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Let It Be" (The Beatles) / "La Bamba" (Ritchie Valens)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-blue-400 mb-2">2. Dórico</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 2do grado | Notas: D-E-F-G-A-B-C</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2M - 3m - 4J - 5J - 6M - 7m</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Menor, pero con un toque brillante y "jazzy" gracias a su sexta mayor.</p>
      <a href="#action:scale:D:Dórico" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"So What" (Miles Davis) / "Oye Como Va" (Santana) / "Get Lucky" (Daft Punk)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-orange-500 mb-2">3. Frigio</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 3er grado | Notas: E-F-G-A-B-C-D</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2m - 3m - 4J - 5J - 6m - 7m</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Sabor oscuro, exótico, estilo flamenco o metal oscuro (por su segunda menor).</p>
      <a href="#action:scale:E:Frigio" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Asturias" (Isaac Albéniz) / "Symphony of Destruction" (Megadeth)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-blue-400 mb-2">4. Lidio</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 4to grado | Notas: F-G-A-B-C-D-E</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2M - 3M - 4A - 5J - 6M - 7M</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Mayor, soñador, mágico o espacial por su cuarta aumentada (#4).</p>
      <a href="#action:scale:F:Lidio" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Tema de Los Simpsons" (Danny Elfman) / "Flying in a Blue Dream" (Joe Satriani)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-orange-500 mb-2">5. Mixolidio</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 5to grado | Notas: G-A-B-C-D-E-F</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2M - 3M - 4J - 5J - 6M - 7m</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Mayor, bluesy, rock clásico. Suena a camino y verano por su séptima menor.</p>
      <a href="#action:scale:G:Mixolidio" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Sweet Home Alabama" (Lynyrd Skynyrd) / "Highway to Hell" (AC/DC)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-blue-400 mb-2">6. Eólico (Menor Natural)</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 6to grado | Notas: A-B-C-D-E-F-G</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2M - 3m - 4J - 5J - 6m - 7m</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Típicamente triste, melancólico, épico. Es la escala menor estándar.</p>
      <a href="#action:scale:A:Eólico" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Losing My Religion" (R.E.M.) / "Smells Like Teen Spirit" (Nirvana)</p>
    </div>
  </div>

  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-orange-500 mb-2">7. Lócrio</h3>
      <p className="text-sm text-slate-400 mb-3"><span className="font-semibold text-slate-300">Grado y Notas:</span> Desde el 7mo grado | Notas: B-C-D-E-F-G-A</p>
      <div className="mb-4">
        <span className="inline-block bg-slate-900 px-2 py-1 rounded text-sm text-cyan-400 font-mono tracking-widest shadow-inner shadow-black/50">T - 2m - 3m - 4J - 5d - 6m - 7m</span>
      </div>
      <p className="text-slate-300 text-sm mb-4"><span className="font-semibold text-orange-500">Carácter:</span> Muy inestable, tenso y oscuro (por su 5ta disminuida además de la 2da y 3ra menor).</p>
      <a href="#action:scale:B:Lócrio" className="mt-4 mb-4 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala</a>
    </div>
    <div className="mt-auto border-t border-slate-700/50 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">🎧 Escúchalo en acción:</p>
      <p className="text-sm text-slate-200">"Army of Me" (Björk - línea de bajo) / "Juicebox" (The Strokes)</p>
    </div>
  </div>
</div>
`,
    visualizerTriggers: [
      {
        description: "Visualizar C Mayor",
        type: "chord",
        root: "C",
        chordType: "Mayor"
      }
    ],
    quiz: [
      {
        question: "¿Qué es una primera inversión de tríada?",
        options: ["La quinta en el bajo", "La tercera en el bajo", "La tónica en el bajo", "La séptima en el bajo"],
        correctAnswerIndex: 1,
        explanation: "En la primera inversión, la nota inferior (el bajo) es la tercera del acorde."
      }
    ]
  },
  {
    id: "capitulo_7",
    title: "Escala Menor Natural",
    level: "Intermedio",
    theoryMarkdown: `
# Capítulo 7: Escala Menor Natural

<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 my-6">
  <h2 className="text-2xl font-bold text-slate-100 mb-4">1. Introducción a la Escala Menor Natural</h2>
  <p className="text-slate-300">
    La Escala Menor Natural, también conocida como <span className="text-orange-500 font-bold">Modo Eólico</span>, es uno de los pilares de la música occidental. Su sonoridad suele asociarse con emociones como la melancolía, la tristeza o la época, y es la contraparte natural de la escala mayor.
  </p>
</div>

<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 my-6">
  <h2 className="text-2xl font-bold text-slate-100 mb-4">2. Formación y Estructura de la Escala Menor Natural</h2>
  <p className="text-slate-300">
    A diferencia de la escala mayor, la escala menor natural tiene una estructura de intervalos distinta, caracterizada principalmente por su tercera menor, sexta menor y séptima menor. Su fórmula completa es:
  </p>

  <div className="bg-slate-900 text-cyan-400 font-mono p-4 rounded-lg text-center my-4">
    Tónica + 2ªM + 3ªm + 4ªJ + 5ªJ + 6ªm + 7ªm
  </div>

  <p className="text-slate-300">
    Si aplicamos esta estructura comenzando desde la nota <strong className="text-slate-100">La (A)</strong>, obtenemos las notas de la escala de <span className="text-orange-500 font-bold">A Menor</span>:
  </p>

  <div className="bg-slate-900 text-slate-200 font-bold font-mono px-6 py-3 rounded-lg text-center my-4 tracking-widest inline-block border border-slate-700 shadow-inner">
    A - B - C - D - E - F - G
  </div>

  <a href="#action:scale:A:Menor" className="mt-6 bg-orange-500 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded flex w-fit items-center gap-2 transition-colors cursor-pointer !no-underline"><i className="fa-solid fa-play"></i> Ver y Escuchar Escala (A Menor)</a>
</div>

<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 my-6">
  <h2 className="text-2xl font-bold text-slate-100 mb-4">3. Armonización en Acordes Tétradas</h2>
  <p className="text-slate-300">
    Al superponer terceras diatónicas sobre cada grado de la escala de A Menor Natural, obtenemos los siguientes acordes de cuatro notas (tétradas):
  </p>

  <table className="w-full text-left border-collapse mt-4">
    <thead>
      <tr>
        <th className="bg-slate-900 text-cyan-400 p-3 rounded-tl-lg">Grado</th>
        <th className="bg-slate-900 text-cyan-400 p-3">Tipo de Acorde</th>
        <th className="bg-slate-900 text-cyan-400 p-3 rounded-tr-lg">Acorde (Ej. A Menor)</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">i7</td>
        <td className="p-3 text-slate-300">Menor 7</td>
        <td className="p-3"><a href="#action:chord:A:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Am7</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">iiø7</td>
        <td className="p-3 text-slate-300">Semidisminuido</td>
        <td className="p-3"><a href="#action:chord:B:m7b5" className="text-orange-500 font-bold hover:underline cursor-pointer">Bm7(b5)</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">IIImaj7</td>
        <td className="p-3 text-slate-300">Mayor 7</td>
        <td className="p-3"><a href="#action:chord:C:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Cmaj7</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">iv7</td>
        <td className="p-3 text-slate-300">Menor 7</td>
        <td className="p-3"><a href="#action:chord:D:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Dm7</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">v7</td>
        <td className="p-3 text-slate-300">Menor 7</td>
        <td className="p-3"><a href="#action:chord:E:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Em7</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">VImaj7</td>
        <td className="p-3 text-slate-300">Mayor 7</td>
        <td className="p-3"><a href="#action:chord:F:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Fmaj7</a></td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">VII7</td>
        <td className="p-3 text-slate-300">Dominante 7</td>
        <td className="p-3"><a href="#action:chord:G:7" className="text-orange-500 font-bold hover:underline cursor-pointer">G7</a></td>
      </tr>
    </tbody>
  </table>
</div>

<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 my-6">
  <h2 className="text-2xl font-bold text-slate-100 mb-4">4. Análisis Armónico de la Función Dominante</h2>
  <p className="text-slate-300 mb-4">
    A diferencia de la escala mayor, donde el quinto grado es un acorde dominante fuerte (V7), en la Escala Menor Natural el quinto grado es un acorde menor: <span className="text-slate-400 font-bold">v7</span> (<a href="#action:chord:E:m7" className="text-slate-400 font-bold hover:underline cursor-pointer">Em7</a> en la tonalidad de A Menor).
  </p>
  <p className="text-slate-300 mb-4">
    Este acorde carece de la "nota sensible" (la séptima mayor de la escala, que en A Menor sería G#, pero aquí tenemos G natural). Sin la tensión del tritono que empuja a resolver hacia la tónica, la progresión v7 -{">"} i7 se siente débil armónicamente.
  </p>
  
  <div className="bg-slate-900/50 border-l-4 border-cyan-500 p-4 rounded-r-lg mt-6">
    <p className="text-slate-200 italic font-medium">
      "Este aspecto le da a la Escala Menor Natural una sonoridad más relajada, menos orientada a la resolución fuerte que encontramos en la armonía mayor tradicional."
    </p>
  </div>
</div>

<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 my-6">
  <h2 className="text-2xl font-bold text-slate-100 mb-4">5. Estabilización con V7 (La Escala Menor Armónica)</h2>
  <p className="text-slate-300 mb-4">
    Para solucionar esta falta de resolución, la música clásica europea introdujo una modificación: elevar el séptimo grado medio tono (de G a G# en A Menor). Esto crea la <strong>Escala Menor Armónica</strong> y transforma el débil acorde <span className="text-slate-400 font-bold">v7</span> (<a href="#action:chord:E:m7" className="text-slate-400 font-bold hover:underline cursor-pointer">Em7</a>) en un fuerte dominante <span className="text-orange-500 font-bold text-lg">V7</span> (<a href="#action:chord:E:7" className="text-orange-500 font-bold hover:underline cursor-pointer">E7</a>).
  </p>

  <table className="w-full text-left border-collapse mt-6">
    <thead>
      <tr>
        <th className="bg-slate-900 text-cyan-400 p-3 rounded-tl-lg">Grado</th>
        <th className="bg-slate-900 text-cyan-400 p-3">Acorde</th>
        <th className="bg-slate-900 text-cyan-400 p-3 rounded-tr-lg">Notas</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">I</td>
        <td className="p-3"><a href="#action:chord:A:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Am7</a></td>
        <td className="p-3 text-slate-300">A - C - E - G</td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">II</td>
        <td className="p-3"><a href="#action:chord:B:m7b5" className="text-orange-500 font-bold hover:underline cursor-pointer">Bm7(b5)</a></td>
        <td className="p-3 text-slate-300">B - D - F - A</td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">III</td>
        <td className="p-3"><a href="#action:chord:C:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Cmaj7</a></td>
        <td className="p-3 text-slate-300">C - E - G - B</td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">IV</td>
        <td className="p-3"><a href="#action:chord:D:m7" className="text-orange-500 font-bold hover:underline cursor-pointer">Dm7</a></td>
        <td className="p-3 text-slate-300">D - F - A - C</td>
      </tr>
      <tr className="border-b border-slate-700/50 bg-orange-500/10 shadow-inner">
        <td className="p-3 text-orange-500 font-mono font-bold">V</td>
        <td className="p-3"><a href="#action:chord:E:7" className="text-orange-500 font-extrabold hover:underline cursor-pointer flex items-center gap-2"><i className="fa-solid fa-bolt text-yellow-500"></i> E7</a></td>
        <td className="p-3 text-orange-500 font-bold">E - G# - B - D</td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">VI</td>
        <td className="p-3"><a href="#action:chord:F:maj7" className="text-orange-500 font-bold hover:underline cursor-pointer">Fmaj7</a></td>
        <td className="p-3 text-slate-300">F - A - C - E</td>
      </tr>
      <tr className="border-b border-slate-700/50">
        <td className="p-3 text-slate-300 font-mono">VII</td>
        <td className="p-3"><a href="#action:chord:G:7" className="text-orange-500 font-bold hover:underline cursor-pointer">G7</a></td>
        <td className="p-3 text-slate-300">G - B - D - F</td>
      </tr>
    </tbody>
  </table>
</div>

<div className="overflow-x-auto mt-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
  <div className="p-6 pb-4 border-b border-slate-700/50">
    <h3 className="text-xl font-bold text-slate-100">Escalas Menores con Sostenidos (#) y sus Acordes Tétradas</h3>
  </div>
  <capitulo7-tablas type="sostenidos" />
</div>

<div className="overflow-x-auto mt-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
  <div className="p-6 pb-4 border-b border-slate-700/50">
    <h3 className="text-xl font-bold text-slate-100">Escalas Menores con Bemoles (b) y sus Acordes Tétradas</h3>
  </div>
  <capitulo7-tablas type="bemoles" />
</div>

<div className="mt-12 space-y-8">
<div>
<h3 className="text-2xl font-bold text-slate-100 mb-6">Funciones Armónicas Principales</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
<h4 className="text-lg font-bold text-cyan-400 mb-2">Tónica</h4>
<p className="text-slate-300 text-sm mb-4">Aporta <span className="text-cyan-200">Estabilidad</span> y reposo absoluto. Es el centro tonal de la progresión.</p>
<p className="text-sm font-mono text-slate-400">Grados: <span className="text-white">Im7</span>, <span className="text-white">Im(maj7)</span></p>
<div className="mt-4 pt-4 border-t border-slate-700/50">
<p className="text-xs text-slate-400 mb-2">Ejemplo en La menor:</p>
<div className="flex gap-2 flex-wrap">
<a href="#action:chord:A:m7" className="px-2 py-1 text-sm whitespace-nowrap bg-slate-900 rounded-lg text-orange-500 font-bold hover:underline cursor-pointer border border-slate-700">Am7</a>
<a href="#action:chord:A:m(maj7)" className="px-2 py-1 text-sm whitespace-nowrap bg-slate-900 rounded-lg text-orange-500 font-bold hover:underline cursor-pointer border border-slate-700">Am(maj7)</a>
</div>
</div>
</div>
<div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
<h4 className="text-lg font-bold text-cyan-400 mb-2">Subdominante</h4>
<p className="text-slate-300 text-sm mb-4">Genera una <span className="text-cyan-200">tensión moderada</span> y actúa como puente lógico hacia el Dominante.</p>
<p className="text-sm font-mono text-slate-400">Grado: <span className="text-white">IVm7</span></p>
<div className="mt-4 pt-4 border-t border-slate-700/50">
<p className="text-xs text-slate-400 mb-2">Ejemplo en La menor:</p>
<div className="flex gap-2 flex-wrap">
<a href="#action:chord:D:m7" className="px-2 py-1 text-sm whitespace-nowrap bg-slate-900 rounded-lg text-orange-500 font-bold hover:underline cursor-pointer border border-slate-700">Dm7</a>
</div>
</div>
</div>
<div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
<h4 className="text-lg font-bold text-cyan-400 mb-2">Dominante</h4>
<p className="text-slate-300 text-sm mb-4">Crea una <span className="text-cyan-200">tensión fuerte</span> (debido al tritono) que exige resolución obligatoria hacia la Tónica.</p>
<p className="text-sm font-mono text-slate-400">Grado: <span className="text-white">V7</span></p>
<div className="mt-4 pt-4 border-t border-slate-700/50">
<p className="text-xs text-slate-400 mb-2">Ejemplo en La menor:</p>
<div className="flex gap-2 flex-wrap">
<a href="#action:chord:E:7" className="px-2 py-1 text-sm whitespace-nowrap bg-slate-900 rounded-lg text-orange-500 font-bold hover:underline cursor-pointer border border-slate-700">E7</a>
</div>
</div>
</div>
</div>
</div>
<div>
<h3 className="text-2xl font-bold text-slate-100 mb-6 mt-8">Funciones Armónicas Sustitutas</h3>
<div className="space-y-4">
<div className="bg-slate-900/50 p-5 rounded-xl border-l-4 border-cyan-500 border-y border-r border-slate-700">
<h4 className="text-lg font-bold text-cyan-400 mb-3 block">Sustitutos de Tónica</h4>
<p className="text-slate-300 text-sm mb-4">Comparten notas comunes con el acorde I, manteniendo la sensación de <span className="text-cyan-200">reposo</span>.</p>
<div className="flex items-center gap-4 flex-wrap">
<div className="flex items-center gap-2">
<span className="font-mono text-slate-400 text-sm">IIImaj7:</span>
<a href="#action:chord:C:maj7" className="px-3 py-1 bg-slate-800 rounded text-orange-500 font-bold hover:underline cursor-pointer border border-slate-600">Cmaj7</a>
</div>
</div>
</div>
<div className="bg-slate-900/50 p-5 rounded-xl border-l-4 border-blue-500 border-y border-r border-slate-700">
<h4 className="text-lg font-bold text-blue-400 mb-3 block">Sustitutos de Subdominante</h4>
<p className="text-slate-300 text-sm mb-4">Proveen <span className="text-cyan-200">preparación</span> y variedad armónica antes de la cadencia.</p>
<div className="flex items-center gap-4 flex-wrap">
<div className="flex items-center gap-2">
<span className="font-mono text-slate-400 text-sm">IIm7(b5):</span>
<a href="#action:chord:B:m7b5" className="px-3 py-1 bg-slate-800 rounded text-orange-500 font-bold hover:underline cursor-pointer border border-slate-600">Bm7(b5)</a>
</div>
<div className="flex items-center gap-2">
<span className="font-mono text-slate-400 text-sm">VImaj7:</span>
<a href="#action:chord:F:maj7" className="px-3 py-1 bg-slate-800 rounded text-orange-500 font-bold hover:underline cursor-pointer border border-slate-600">Fmaj7</a>
</div>
<div className="flex items-center gap-2">
<span className="font-mono text-slate-400 text-sm">VII7:</span>
<a href="#action:chord:G:7" className="px-3 py-1 bg-slate-800 rounded text-orange-500 font-bold hover:underline cursor-pointer border border-slate-600">G7</a>
</div>
</div>
</div>
<div className="bg-slate-900/50 p-5 rounded-xl border-l-4 border-rose-500 border-y border-r border-slate-700">
<h4 className="text-lg font-bold text-rose-400 mb-3 block">Sustitutos de Dominante</h4>
<p className="text-slate-300 text-sm mb-4">Mantienen la <span className="text-cyan-200">tensión</span> del tritono que obliga a resolver.</p>
<div className="flex items-center gap-4 flex-wrap">
<div className="flex items-center gap-2">
<span className="font-mono text-slate-400 text-sm">VII°7:</span>
<a href="#action:chord:G#:dim7" className="px-3 py-1 bg-slate-800 rounded text-orange-500 font-bold hover:underline cursor-pointer border border-slate-600">G#°7</a>
</div>
</div>
</div>
</div>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mt-12 mb-6 shadow-lg">
  <h3 className="text-xl font-bold text-orange-500 mb-4">6. Estudio de Caso: Autumn Leaves y el motor del Jazz (II-V-I)</h3>
  <p className="text-slate-300 mb-6">
    El secreto para entender el Jazz es buscar siempre la progresión II - V - I (Subdominante - Dominante - Tónica). En la Parte A del estándar 'Autumn Leaves', vemos cómo el compositor juega primero con un II-V-I hacia la tonalidad Mayor relativa (Do Mayor), y luego responde con un II-V-I hacia la tonalidad Menor principal (La Menor).
  </p>

  <div className="flex items-center mb-4 gap-2 flex-wrap">
    <a href="#action:progression:Dm7,G7,Cmaj7,Fmaj7,Bm7(b5),E7,Am7,Am7" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ▶️ Escuchar Original
    </a>
    <a href="#action:stop" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ⏹️ Detener
    </a>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-8 font-mono">
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Dm7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Dm7</a>
      <span className="text-xs text-slate-400 mt-1">[ii7 en Do]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:G7" className="text-xl text-yellow-400 hover:text-yellow-300 font-bold cursor-pointer !no-underline">G7</a>
      <span className="text-xs text-yellow-500 mt-1">[V7 en Do]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Cmaj7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Cmaj7</a>
      <span className="text-xs text-slate-400 mt-1">[Imaj7 en Do]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Fmaj7" className="text-xl text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer !no-underline">Fmaj7</a>
      <span className="text-xs text-emerald-500 mt-1">[IVmaj7 / VImaj7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Bm7(b5)" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Bm7(b5)</a>
      <span className="text-xs text-slate-400 mt-1">[iiø7 en La menor]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:E7" className="text-xl text-yellow-400 hover:text-yellow-300 font-bold cursor-pointer !no-underline">E7</a>
      <span className="text-xs text-yellow-500 mt-1">[V7 en La menor]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Am7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Am7</a>
      <span className="text-xs text-slate-400 mt-1">[im7 en La menor]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <span className="text-xl text-orange-500 cursor-default font-bold">%</span>
      <span className="text-xs text-slate-400 mt-1">[im7]</span>
    </div>
  </div>

  <p className="text-slate-300 mb-6">
    Ahora, apliquemos la magia de las Funciones Sustitutas que aprendimos en este capítulo. Reemplazaremos algunos acordes por sus familiares funcionales para darle un color totalmente distinto, sin perder la dirección de la cadencia.
  </p>

  <div className="flex items-center mb-4 gap-2 flex-wrap">
    <a href="#action:progression:Fmaj7,G7,Em7,Dm7,Fmaj7,G#dim7,Cmaj7,Am7" className="flex items-center gap-2 bg-orange-500/10 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ▶️ Escuchar Rearmonización
    </a>
    <a href="#action:stop" className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold py-1 px-3 rounded-lg transition-all !no-underline cursor-pointer">
      ⏹️ Detener
    </a>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-4 font-mono">
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Fmaj7" className="text-xl text-pink-400 hover:text-pink-300 font-bold cursor-pointer !no-underline">Fmaj7</a>
      <span className="text-xs text-pink-500 mt-1">[Sustituto de Dm7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:G7" className="text-xl text-yellow-400 hover:text-yellow-300 font-bold cursor-pointer !no-underline">G7</a>
      <span className="text-xs text-yellow-500 mt-1">[V7 original]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Em7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Em7</a>
      <span className="text-xs text-slate-400 mt-1">[Sustituto de Cmaj7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Dm7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Dm7</a>
      <span className="text-xs text-slate-400 mt-1">[Sustituto de Fmaj7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Fmaj7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Fmaj7</a>
      <span className="text-xs text-slate-400 mt-1">[Sustituto de Bm7(b5)]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:G#dim7" className="text-xl text-purple-400 hover:text-purple-300 font-bold cursor-pointer !no-underline">G#°7</a>
      <span className="text-xs text-purple-500 mt-1">[Sustituto de E7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Cmaj7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Cmaj7</a>
      <span className="text-xs text-slate-400 mt-1">[Sustituto de Am7]</span>
    </div>
    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-center">
      <a href="#action:chord:Am7" className="text-xl text-orange-500 hover:text-orange-300 font-bold cursor-pointer !no-underline">Am7</a>
      <span className="text-xs text-slate-400 mt-1">[Resolución Final]</span>
    </div>
  </div>
</div>
</div>
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_8",
    title: "Escala Menor Armónica",
    level: "Avanzado",
    theoryMarkdown: `
<h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">Capítulo 8: Escala Menor Armónica y sus Aplicaciones</h2>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-2xl font-bold text-slate-100 mb-4">1. Escala Menor Armónica</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    La escala menor armónica se caracteriza por su séptimo grado elevado en comparación con la escala menor natural, lo que le da un sonido más tenso y distintivo.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Formación:</strong> T - 2da Mayor - 3ra Menor - 4ta Justa - 5ta Justa - 6ta Menor - 7ma Mayor.
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Ejemplo en A menor armónica:</strong> A - B - C - D - E - F - G# - A
  </p>
  <p className="text-slate-300 leading-relaxed mb-4">
    <strong>Diferencias:</strong> En la menor natural, el 7mo grado no está elevado (G natural en lugar de G#).
  </p>
  <a href="#action:scale:A:Menor Armónica" className="mt-6 bg-orange-500 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 w-fit my-4 shadow-lg mx-auto md:mx-0 !no-underline cursor-pointer">
    <i className="fa-solid fa-play"></i> Ver y Escuchar Escala
  </a>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-2xl font-bold text-slate-100 mb-4">2. Acordes Tétrada en la Escala Menor Armónica</h3>
  <ul className="space-y-4">
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">I:</span>
      <span className="text-slate-300"><a href="#action:chord:A:m(maj7)" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">Am(maj7)</a> (A - C - E - G#) - Tónica menor con 7ma mayor.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">II:</span>
      <span className="text-slate-300"><a href="#action:chord:B:m7b5" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">Bm7b5</a> (B - D - F - A) - Acorde de paso subdominante.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">III:</span>
      <span className="text-slate-300"><a href="#action:chord:C:aug" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">Cmaj7(#5)</a> (C - E - G# - B) - Sonido ambiguo, tiende a moverse al dominante.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">IV:</span>
      <span className="text-slate-300"><a href="#action:chord:D:m7" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">Dm7</a> (D - F - A - C) - Subdominante menor.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">V:</span>
      <span className="text-slate-300"><a href="#action:chord:E:7" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">E7</a> (E - G# - B - D) - Dominante fuerte que resuelve a la tónica menor.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">VI:</span>
      <span className="text-slate-300"><a href="#action:chord:F:maj7" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">Fmaj7</a> (F - A - C - E) - Subdominante.</span>
    </li>
    <li className="flex items-start">
      <span className="text-orange-500 font-bold mr-3">VII:</span>
      <span className="text-slate-300"><a href="#action:chord:G#:dim7" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">G#°7</a> (G# - B - D - F) - Dominante sustituto con mucha tensión.</span>
    </li>
  </ul>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
  <h3 className="text-2xl font-bold text-slate-100 mb-4">3. Aplicación Práctica: Gypsy Jazz</h3>
  <p className="text-slate-300 leading-relaxed mb-4">
    El tema "Minor Swing" de Django Reinhardt es el ejemplo perfecto del uso del dominante (<a href="#action:chord:E:7" className="text-orange-500 hover:text-orange-300 font-bold transition-colors">E7</a>) en una tonalidad menor construyendo sobre la progresión del estilo Gypsy Jazz.
  </p>
  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-center flex flex-wrap justify-center items-center gap-4">
    <a href="#action:chord:A:m6" className="text-orange-500 hover:text-orange-300 font-bold text-lg transition-colors px-3 py-2 bg-slate-800 rounded">Am6</a>
    <span className="text-slate-500">➔</span>
    <a href="#action:chord:D:m6" className="text-orange-500 hover:text-orange-300 font-bold text-lg transition-colors px-3 py-2 bg-slate-800 rounded">Dm6</a>
    <span className="text-slate-500">➔</span>
    <a href="#action:chord:E:7" className="text-orange-500 hover:text-orange-300 font-bold text-lg transition-colors px-3 py-2 bg-slate-800 rounded">E7</a>
    <span className="text-slate-500">➔</span>
    <a href="#action:chord:A:m6" className="text-orange-500 hover:text-orange-300 font-bold text-lg transition-colors px-3 py-2 bg-slate-800 rounded">Am6</a>
  </div>
  <p className="text-slate-300 mt-4 leading-relaxed">
    Para comprender a fondo cómo Django Reinhardt utiliza la tensión de la menor armónica, explora el análisis armónico completo de esta pieza.
  </p>
  <a href="#action:standard:minor-swing" className="flex items-center gap-2 bg-slate-900 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold py-2 px-6 rounded-lg transition-all mt-4 w-fit shadow-lg cursor-pointer !no-underline">
    <i className="fa-solid fa-search"></i> Ver Análisis de Minor Swing
  </a>
</div>
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_9",
    title: "Modos de la Escala Menor Armónica",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo9-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_10",
    title: "Dominantes y Sustitutos",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo10-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_11",
    title: "Dominantes Extendidos y ii7 Relativos",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo11-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_12",
    title: "Tensiones",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo12-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_13",
    title: "Intercambio Modal",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo13-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  },
  {
    id: "capitulo_14",
    title: "Escala Menor Melódica",
    level: "Avanzado",
    theoryMarkdown: `
<capitulo14-contenido />
`,
    visualizerTriggers: [],
    quiz: []
  }
];
