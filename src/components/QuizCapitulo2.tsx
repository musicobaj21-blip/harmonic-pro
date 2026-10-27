import React, { useState } from 'react';

const questions = [
  {
    question: "¿Cuántas notas componen un acorde tríada básico?",
    options: [
      "Dos notas.",
      "Tres notas.",
      "Cuatro notas.",
      "Cinco notas."
    ],
    correctAnswerIndex: 1,
    explanation: "Los acordes tríadas son la base fundamental de la armonía y, como su nombre indica, se construyen con exactamente tres notas."
  },
  {
    question: "¿Cuáles son los cuatro tipos principales en los que se clasifican los acordes tríadas?",
    options: [
      "Mayores, menores, justos y disminuidos.",
      "Mayores, menores, aumentados y suspendidos.",
      "Mayores, menores, disminuidos y aumentados.",
      "Mayores, disminuidos, aumentados y paralelos."
    ],
    correctAnswerIndex: 2,
    explanation: "Estas cuatro clasificaciones dependen de los intervalos de tercera y quinta que se le añaden a la nota fundamental."
  },
  {
    question: "¿Cuál es la estructura de intervalos que forma un acorde tríada Mayor?",
    options: [
      "Tónica (1ra), Tercera Menor (3m) y Quinta Justa (5J).",
      "Tónica (1ra), Tercera Mayor (3M) y Quinta Justa (5J).",
      "Tónica (1ra), Segunda Mayor (2M) y Quinta Justa (5J).",
      "Tónica (1ra), Tercera Mayor (3M) y Cuarta Justa (4J)."
    ],
    correctAnswerIndex: 1,
    explanation: "Esta estructura le da al acorde mayor su sonoridad brillante y estable característica."
  },
  {
    question: "Si construimos un acorde de Do Mayor (C), ¿cuáles son las tres notas resultantes?",
    options: [
      "C - Eb - G (Do - Mi bemol - Sol).",
      "C - F - G (Do - Fa - Sol).",
      "C - E - G (Do - Mi - Sol).",
      "C - E - Gb (Do - Mi - Sol bemol)."
    ],
    correctAnswerIndex: 2,
    explanation: "C es la tónica, E es la tercera mayor (a 4 semitonos) y G es la quinta justa (a 7 semitonos)."
  },
  {
    question: "¿Qué intervalo es el que diferencia a un acorde tríada Mayor de un acorde tríada Menor?",
    options: [
      "La quinta (Justa en el acorde mayor, Disminuida en el acorde menor).",
      "La fundamental (Tónica).",
      "La séptima (Mayor en el acorde mayor, Menor en el acorde menor).",
      "La tercera (Mayor en el acorde mayor, Menor en el acorde menor)."
    ],
    correctAnswerIndex: 3,
    explanation: "Ambos acordes comparten la Tónica y la Quinta Justa; el cambio de la tercera altera completamente el carácter del acorde."
  },
  {
    question: "¿Cuál es la estructura de intervalos que forma un acorde tríada Menor?",
    options: [
      "Tónica (1ra), Tercera Mayor (3M) y Quinta Disminuida (5dim).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Justa (5J).",
      "Tónica (1ra), Segunda Menor (2m) y Quinta Justa (5J).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Aumentada (5aum)."
    ],
    correctAnswerIndex: 1,
    explanation: "La tercera menor oscurece el sonido del acorde, dándole su característica sonoridad melancólica."
  },
  {
    question: "Si construimos un acorde de Do Menor (Cm), ¿cuáles son las notas correctas?",
    options: [
      "C - E - G (Do - Mi - Sol).",
      "C - Eb - G (Do - Mi bemol - Sol).",
      "C - Eb - Gb (Do - Mi bemol - Sol bemol).",
      "C - E - G# (Do - Mi - Sol sostenido)."
    ],
    correctAnswerIndex: 1,
    explanation: "Al bajar medio tono la tercera de Do Mayor (E), obtenemos el Eb, que es la tercera menor."
  },
  {
    question: "¿Cómo se construye un acorde tríada Disminuido?",
    options: [
      "Tónica (1ra), Tercera Mayor (3M) y Quinta Disminuida (5dim).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Aumentada (5aum).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Justa (5J).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Disminuida (5dim)."
    ],
    correctAnswerIndex: 3,
    explanation: "Se compone de dos terceras menores superpuestas, lo que hace que la quinta sea disminuida (un semitono por debajo de la quinta justa)."
  },
  {
    question: "¿Qué notas conforman el acorde de Do Disminuido (Cdim)?",
    options: [
      "C - Eb - G (Do - Mi bemol - Sol).",
      "C - E - Gb (Do - Mi - Sol bemol).",
      "C - Eb - Gb (Do - Mi bemol - Sol bemol).",
      "C - Eb - G# (Do - Mi bemol - Sol sostenido)."
    ],
    correctAnswerIndex: 2,
    explanation: "Sobre la tónica C, agregamos la tercera menor (Eb) y la quinta disminuida (Gb)."
  },
  {
    question: "¿Cuál es la estructura de intervalos de un acorde tríada Aumentado?",
    options: [
      "Tónica (1ra), Tercera Mayor (3M) y Quinta Aumentada (5aum).",
      "Tónica (1ra), Tercera Menor (3m) y Quinta Aumentada (5aum).",
      "Tónica (1ra), Tercera Mayor (3M) y Quinta Disminuida (5dim).",
      "Tónica (1ra), Cuarta Justa (4J) y Quinta Aumentada (5aum)."
    ],
    correctAnswerIndex: 0,
    explanation: "Se compone de dos terceras mayores superpuestas. La quinta se eleva un semitono por encima de la quinta justa, generando gran tensión."
  }
];

export default function QuizCapitulo2() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answersFeedback, setAnswersFeedback] = useState<
    { question: string; selected: number; correct: number; explanation: string }[]
  >([]);

  const handleAnswerClick = (optionIndex: number) => {
    const isCorrect = optionIndex === questions[currentQuestion].correctAnswerIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    const newFeedback = [
      ...answersFeedback,
      {
        question: questions[currentQuestion].question,
        selected: optionIndex,
        correct: questions[currentQuestion].correctAnswerIndex,
        explanation: questions[currentQuestion].explanation,
      },
    ];

    setAnswersFeedback(newFeedback);

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
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
            Puntuación Final: <span className="text-cyan-400 font-bold">{score}</span> / {questions.length}
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
                      {questions[idx].options[fb.selected]}
                    </span>
                  </p>
                  {!passed && (
                    <p>
                      <span className="font-bold text-slate-400">Respuesta correcta:</span>{" "}
                      <span className="text-emerald-400">{questions[idx].options[fb.correct]}</span>
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
          Pregunta {currentQuestion + 1} de {questions.length}
        </span>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
        <h3 className="text-xl font-medium text-slate-100 mb-8 leading-relaxed">
          {questions[currentQuestion].question}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {questions[currentQuestion].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(idx)}
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
