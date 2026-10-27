import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Cuál es la fórmula correcta para construir una escala menor melódica?",
    opciones: [
      "1 - 2 - b3 - 4 - 5 - b6 - b7",
      "1 - 2 - b3 - 4 - 5 - 6 - 7",
      "1 - b2 - b3 - 4 - 5 - b6 - b7",
      "1 - 2 - 3 - 4 - 5 - 6 - 7"
    ],
    respuestaCorrecta: "1 - 2 - b3 - 4 - 5 - 6 - 7",
    explicacion: "La escala menor melódica se diferencia de la menor natural en que eleva su sexta y séptima notas, resultando en la fórmula 1 - 2 - b3 - 4 - 5 - 6 - 7."
  },
  {
    pregunta: "¿Qué hace que la escala menor melódica suene más luminosa y moderna que la menor natural?",
    opciones: [
      "Que no tiene quinta justa",
      "Que tiene sexta mayor y séptima mayor",
      "Que todas sus notas son alteradas",
      "Que no tiene tercera"
    ],
    respuestaCorrecta: "Que tiene sexta mayor y séptima mayor",
    explicacion: "La presencia de la sexta y séptima mayores le quita la tensión típica de las notas bemoles b6 y b7, dándole un color más brillante, moderno y resolutivo."
  },
  {
    pregunta: "¿Cuál es el acorde más representativo construido sobre el primer grado de la menor melódica?",
    opciones: [
      "Acorde menor 7 (m7)",
      "Acorde dominante (7)",
      "Acorde menor con séptima mayor (m(maj7))",
      "Acorde semidisminuido (m7b5)"
    ],
    respuestaCorrecta: "Acorde menor con séptima mayor (m(maj7))",
    explicacion: "El primer grado forma un acorde con tónica, tercera menor, quinta justa y séptima mayor, que se cifra como m(maj7)."
  },
  {
    pregunta: "El modo \"Lidio b7\" (Lidio Dominante) se utiliza comúnmente sobre qué tipo de acorde?",
    opciones: [
      "Acordes dominantes con #11",
      "Acordes menores naturales",
      "Acordes mayores con b9",
      "Acordes disminuidos"
    ],
    respuestaCorrecta: "Acordes dominantes con #11",
    explicacion: "El Lidio b7 es el cuarto modo de la menor melódica y contiene la cuarta aumentada (#11) y séptima menor, ideal para acordes 7(#11)."
  },
  {
    pregunta: "¿Qué ventaja tiene usar el modo \"Locrio natural 2\" sobre un acorde semidisminuido (m7b5) en lugar del Locrio tradicional?",
    opciones: [
      "Aporta una novena natural (9) en lugar de una novena bemol (b9)",
      "Transforma el acorde en mayor",
      "Elimina la quinta bemol",
      "Obliga a modular a otra tonalidad"
    ],
    respuestaCorrecta: "Aporta una novena natural (9) en lugar de una novena bemol (b9)",
    explicacion: "El modo Locrio tradicional (que proviene de la escala mayor) tiene la b9, lo que lo hace muy oscuro. El Locrio natural 2 eleva esa segunda menor a mayor, logrando una sonoridad más abierta y moderna."
  },
  {
    pregunta: "En la progresión clásica IIø - V7 - Im (ej. Dm7b5 - G7b13 - Cm(maj7)), ¿qué modo de la menor melódica es ideal para el dominante G7(b13)?",
    opciones: [
      "Lidio aumentado",
      "Dórico b2",
      "Mixolidio b13",
      "Superlocrio"
    ],
    respuestaCorrecta: "Mixolidio b13",
    explicacion: "El Mixolidio b13 es el quinto modo de la menor melódica. Proporciona la tensión b13 sin alterar la novena o la oncena, ideal para acordes de dominante que resuelven a menor."
  },
  {
    pregunta: "¿Desde qué grado de la escala menor melódica se origina la Escala Alterada (Superlocrio)?",
    opciones: [
      "Desde el 1er grado",
      "Desde el 4to grado",
      "Desde el 5to grado",
      "Desde el 7mo grado"
    ],
    respuestaCorrecta: "Desde el 7mo grado",
    explicacion: "La escala Alterada o Superlocrio se construye comenzando desde el séptimo grado de la escala menor melódica."
  },
  {
    pregunta: "¿Qué tensiones alteradas contiene la Escala Alterada para enriquecer un acorde dominante?",
    opciones: [
      "9, 11, 13",
      "b9, #9, b5 (#11), #5 (b13)",
      "Sólo contiene la b9 y la 13 natural",
      "No tiene tensiones"
    ],
    respuestaCorrecta: "b9, #9, b5 (#11), #5 (b13)",
    explicacion: "La escala alterada abarca todas las tensiones posibles en un acorde dominante sin alterar sus notas guía (raíz, tercera, séptima). Contiene tanto variaciones de la novena (b9, #9) como de la quinta (b5 o #11, #5 o b13)."
  },
  {
    pregunta: "Regla práctica: Si quieres improvisar con una escala alterada sobre el acorde G7alt, ¿qué escala menor melódica debes pensar?",
    opciones: [
      "G menor melódica (desde la misma nota)",
      "Ab menor melódica (medio tono arriba)",
      "D menor melódica (una quinta arriba)",
      "C menor melódica (cuarta arriba)"
    ],
    respuestaCorrecta: "Ab menor melódica (medio tono arriba)",
    explicacion: "Como la escala alterada es el 7mo grado de la menor melódica, puedes deducir la escala simplemente pensando en la menor melódica un semitono por encima del acorde (Ab menor melódica sobre G7alt)."
  },
  {
    pregunta: "Si estás tocando un Cmaj7 y quieres aplicar un sustituto tritonal Db7(#11) antes de volver al Cmaj7, ¿qué escala proveniente de Ab menor melódica se toca sobre el Db7?",
    opciones: [
      "Db Lidia Dominante",
      "Db Dórica",
      "Db Jónica",
      "Db Alterada"
    ],
    respuestaCorrecta: "Db Lidia Dominante",
    explicacion: "Sobre el Db7(#11) como sustituto tritonal (subV7) se utiliza comúnmente la Lidia Dominante, que corresponde al 4to modo de Ab menor melódica (la misma escala que genera la alterada sobre G7)."
  }
];

export default function QuizCapitulo14() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answersFeedback, setAnswersFeedback] = useState<{question: string, selected: string, correct: string, explanation: string}[]>([]);

  const handleAnswerClick = (selectedOption: string) => {
    const isCorrect = selectedOption === quizData[currentQuestion].respuestaCorrecta;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswersFeedback([
      ...answersFeedback,
      {
        question: quizData[currentQuestion].pregunta,
        selected: selectedOption,
        correct: quizData[currentQuestion].respuestaCorrecta,
        explanation: quizData[currentQuestion].explicacion
      }
    ]);

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
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center shadow-xl">
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

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-h-[60vh] overflow-y-auto space-y-6 shadow-xl">
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Prueba tus conocimientos</h2>
        <span className="bg-slate-800 text-indigo-400/80 px-3 py-1 rounded-full text-sm">
          Pregunta {currentQuestion + 1} de {quizData.length}
        </span>
      </div>

      <div className="bg-slate-800/80 p-6 md:p-8 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl text-white mb-6">
          {quizData[currentQuestion].pregunta}
        </h3>

        <div className="flex flex-col gap-3">
          {quizData[currentQuestion].opciones.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(option)}
              className="w-full text-left p-4 rounded-lg border border-slate-600 bg-transparent hover:bg-slate-700/60 text-slate-300 transition-colors focus:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
