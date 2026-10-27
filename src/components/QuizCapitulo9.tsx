import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Cuál es el nombre del 5to modo de la escala menor armónica y cuál es su principal función?",
    opciones: [
      "Mixolidio b9 b13, usado como dominante resolutivo.",
      "Dórico #4, usado para crear tensión de paso.",
      "Lidio #2, usado en intercambios modales.",
      "Mixolidio b9 b13, usado para resolver a un acorde mayor."
    ],
    respuestaCorrecta: "Mixolidio b9 b13, usado como dominante resolutivo.",
    explicacion: "El 5to modo es el Mixolidio b9 b13. Al tener la tercera mayor y la séptima menor (creando un tritono), actúa como dominante perfecto, resolviendo clásicamente hacia la tónica menor gracias al empuje de sus tensiones (b9 y b13)."
  },
  {
    pregunta: "¿Cuál es la estructura interválica del modo Locrio 6 (2do grado) y en qué se diferencia del Locrio del modo mayor?",
    opciones: [
      "T - 2m - 3m - 4J - 5dim - 6m - 7m, tiene 6ta menor.",
      "T - 2m - 3m - 4J - 5dim - 6M - 7m, tiene 6ta mayor.",
      "T - 2M - 3m - 4aum - 5dim - 6M - 7m, tiene 2da mayor.",
      "T - 2m - 3m - 4J - 5J - 6M - 7m, tiene 5ta justa."
    ],
    respuestaCorrecta: "T - 2m - 3m - 4J - 5dim - 6M - 7m, tiene 6ta mayor.",
    explicacion: "A diferencia del Locrio estándar que posee una sexta menor, el Locrio 6 contiene una 6ta mayor. Esto le proporciona un sonido algo menos denso y una tensión muy utilizada sobre acordes semidisminuidos."
  },
  {
    pregunta: "El modo Jónico Aumentado se construye sobre el 3er grado de la escala. Su principal característica es:",
    opciones: [
      "Que contiene una 5ta disminuida.",
      "Que contiene una 4ta aumentada en lugar de 4ta justa.",
      "Que contiene una 5ta aumentada (5aum), dándole una sonoridad de ensueño.",
      "Que carece de séptima mayor."
    ],
    respuestaCorrecta: "Que contiene una 5ta aumentada (5aum), dándole una sonoridad de ensueño.",
    explicacion: "Su fórmula es T - 2M - 3M - 4J - 5aum - 6M - 7M. La quinta aumentada es la nota que le da el carácter inestable, abierto y mágico, formando una tríada aumentada en estado fundamental."
  },
  {
    pregunta: "Sobre el 4to grado de la menor armónica se forma el modo Dórico #4. ¿Qué intervalo le otorga su tensión característica?",
    opciones: [
      "La segunda menor.",
      "La cuarta aumentada o tritono que forma con la tónica.",
      "La séptima mayor.",
      "La quinta disminuida."
    ],
    respuestaCorrecta: "La cuarta aumentada o tritono que forma con la tónica.",
    explicacion: "El Dórico #4 (T - 2M - 3m - 4aum - 5J - 6M - 7m) tiene una #4 que choca y genera tensión, dándole un color balcánico o de jazz exótico muy apreciado en improvisación."
  },
  {
    pregunta: "Si estamos en la tonalidad de A menor armónica (La - Si - Do - Re - Mi - Fa - Sol#), ¿cuáles son las notas exactas del modo E Mixolidio b9 b13?",
    opciones: [
      "E - F# - G# - A - B - C - D",
      "E - F - G# - A - B - C# - D",
      "E - F - G - A - B - C - D",
      "E - F - G# - A - B - C - D"
    ],
    respuestaCorrecta: "E - F - G# - A - B - C - D",
    explicacion: "El 5to modo inicia la escala desde Mi (E). Las notas son heredadas exactamente de A menor armónica: Mi, Fa(b9), Sol#(3raM), La(4ta), Si(5ta), Do(b13) y Re(7ma)."
  },
  {
    pregunta: "¿Sobre qué grado de la escala menor armónica se construye el modo Lidio #2?",
    opciones: [
      "Sobre el 3er grado.",
      "Sobre el 4to grado.",
      "Sobre el 6to grado.",
      "Sobre el 7mo grado."
    ],
    respuestaCorrecta: "Sobre el 6to grado.",
    explicacion: "El Lidio #2 se genera arrancando la escala desde su sexto grado. Conserva la cuarta aumentada del modo Lidio normal, pero añade una misteriosa segunda aumentada."
  },
  {
    pregunta: "¿Cuál es la estructura exacta de intervalos del 1er modo de la escala menor armónica (Modo Tónica)?",
    opciones: [
      "T - 2M - 3m - 4J - 5J - 6m - 7M",
      "T - 2M - 3M - 4J - 5J - 6m - 7m",
      "T - 2M - 3m - 4J - 5dim - 6m - 7M",
      "T - 2m - 3m - 4J - 5J - 6m - 7M"
    ],
    respuestaCorrecta: "T - 2M - 3m - 4J - 5J - 6m - 7M",
    explicacion: "Tiene la base de una escala menor natural pero con el 7mo grado elevado a séptima mayor (movimiento sensible), creando la característica distancia de tono y medio entre b6 y #7."
  },
  {
    pregunta: "El Superlocrio, o 7mo modo, es conocido como el más disonante y denso de todos. ¿Qué característica interválica radical tiene?",
    opciones: [
      "Posee una tercera mayor disfrazada de cuarta disminuida.",
      "Posee una 7ma doble bemol (bb7 o 6ta mayor enarmónica) además de grados alterados.",
      "Carece de tercera.",
      "Eleva la quinta."
    ],
    respuestaCorrecta: "Posee una 7ma doble bemol (bb7 o 6ta mayor enarmónica) además de grados alterados.",
    explicacion: "La estructura del Superlocrio (escala disminuida) es T - 2m - 3m - 4J - 5dim - 6m - 7bb. Esta séptima doble bemol es enarmónicamente equivalente a una sexta mayor, conformando el acorde disminuido con 7ma disminuida (°7)."
  },
  {
    pregunta: "A nivel sonoro y práctico, el 1er modo (Menor Armónica) suele utilizarse para:",
    opciones: [
      "Dar un sonido alegre e infantil.",
      "Generar ambientes de blues tejano.",
      "Evocar sonoridades exóticas, gitanas y contextos clásicos de jazz.",
      "Improvisar sobre acordes dominantes exclusivamente."
    ],
    respuestaCorrecta: "Evocar sonoridades exóticas, gitanas y contextos clásicos de jazz.",
    explicacion: "Su distintivo salto de tono y medio entre los grados 6 y 7 atrae su uso en pasajes flamencos, metal neoclásico, gypsy jazz y música exótica."
  },
  {
    pregunta: "A nivel macro conceptual, ¿qué relación existe entre las diferentes notas de estos siete modos planteados?",
    opciones: [
      "Comparten la misma tónica siempre.",
      "Están enlazados por el círculo de quintas.",
      "Comparten exactamente las mismas 7 notas de la escala madre (Menor Armónica), solo cambia el centro tonal.",
      "No tienen ninguna relación entre sí, poseen armaduras totalmente distintas."
    ],
    respuestaCorrecta: "Comparten exactamente las mismas 7 notas de la escala madre (Menor Armónica), solo cambia el centro tonal.",
    explicacion: "Esa es la esencia de la teoría modal: las alteraciones o notas no cambian, solo cambia qué nota del grupo elegimos que actúe como nuestra tónica (grado de reposo)."
  }
];

export default function QuizCapitulo9() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answersFeedback, setAnswersFeedback] = useState<
    { question: string; selected: string; correct: string; explanation: string }[]
  >([]);

  const handleAnswerClick = (optionStr: string) => {
    const isCorrect = optionStr === quizData[currentQuestion].respuestaCorrecta;
    if (isCorrect) {
      setScore(score + 1);
    }

    const newFeedback = [
      ...answersFeedback,
      {
        question: quizData[currentQuestion].pregunta,
        selected: optionStr,
        correct: quizData[currentQuestion].respuestaCorrecta,
        explanation: quizData[currentQuestion].explicacion,
      },
    ];

    setAnswersFeedback(newFeedback);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setAnswersFeedback([]);
  };

  if (showScore) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¡Quiz Completado!</h2>
          <p className="text-xl text-slate-300">
            Puntuación Final: <span className="text-cyan-400 font-bold">{score}</span> / {quizData.length}
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
          >
            Reintentar Quiz
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-h-[60vh] overflow-y-auto space-y-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4 sticky top-0 bg-slate-800 py-2 border-b border-slate-700 z-10">
            Análisis de Respuestas
          </h3>
          {answersFeedback.map((fb, idx) => {
            const passed = fb.selected === fb.correct;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <p className="font-semibold text-slate-200 mb-3 block">
                  {idx + 1}. {fb.question}
                </p>
                <div className="space-y-2 text-sm text-slate-300 mb-4">
                  <p>
                    <span className="font-bold text-slate-400">Tu respuesta:</span>{" "}
                    <span className={passed ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                      {fb.selected}
                    </span>
                  </p>
                  {!passed && (
                    <p>
                      <span className="font-bold text-slate-400">Respuesta correcta:</span>{" "}
                      <span className="text-emerald-400">{fb.correct}</span>
                    </p>
                  )}
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">Análisis:</span> {fb.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10 w-full flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Prueba tus conocimientos</h2>
        <span className="text-xs font-mono text-slate-400 border border-slate-700 px-3 py-1 rounded bg-slate-800">
          Pregunta {currentQuestion + 1} de {quizData.length}
        </span>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
        <h3 className="text-xl font-medium text-slate-100 mb-8 leading-relaxed">
          {quizData[currentQuestion].pregunta}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {quizData[currentQuestion].opciones.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(option)}
              className="w-full text-left p-4 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-orange-500/50 transition-colors text-slate-200 focus:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
