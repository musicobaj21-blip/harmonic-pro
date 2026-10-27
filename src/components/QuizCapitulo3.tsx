import React, { useState } from 'react';

const questions = [
  {
    question: "¿Cuál es la fórmula interválica que define a una Escala Mayor?",
    options: [
      "Tónica - 2m - 3m - 4a - 5J - 6m - 7m",
      "Tónica - 2M - 3M - 4J - 5J - 6M - 7M",
      "Tónica - 2M - 3m - 4J - 5J - 6M - 7m",
      "Tónica - 2m - 3M - 4J - 5d - 6M - 7m"
    ],
    correctAnswerIndex: 1,
    explanation: "Esta secuencia de tonos y semitonos es consistente en todas las tonalidades mayores y genera su sonoridad estable y rica."
  },
  {
    question: "¿Por qué la escala de Do Mayor (C) se considera la escala \"madre\" o fundamental?",
    options: [
      "Porque es la escala más difícil de tocar.",
      "Porque tiene cinco bemoles.",
      "Porque es una escala natural que no posee alteraciones (ni sostenidos ni bemoles).",
      "Porque todos los acordes que genera son mayores."
    ],
    correctAnswerIndex: 2,
    explanation: "Al no tener alteraciones (son solo las teclas blancas del piano), sirve como punto de partida para derivar y comprender todas las demás escalas."
  },
  {
    question: "Al armonizar la escala de Do Mayor con tríadas, ¿qué tipo de acorde se forma en el segundo grado (II)?",
    options: [
      "Un acorde disminuido (Ddim).",
      "Un acorde mayor (D).",
      "Un acorde de quinta vacía (D5).",
      "Un acorde menor (Dm)."
    ],
    correctAnswerIndex: 3,
    explanation: "El segundo grado diatónico siempre es menor. Añade un color melódico suave frecuentemente usado para crear tensión hacia la tónica."
  },
  {
    question: "En la armonización de la escala mayor, el acorde del quinto grado (V) es fundamental. ¿Por qué?",
    options: [
      "Es el acorde más brillante y no requiere moverse a ningún lado.",
      "Es el acorde que contiene la fundamental de la escala.",
      "Es el acorde \"dominante\" y genera una fuerte tensión que se resuelve hacia la tónica.",
      "Es el único acorde que siempre debe omitir su quinta."
    ],
    correctAnswerIndex: 2,
    explanation: "El acorde de quinto grado (ej. G en Do Mayor) es el motor de la armonía tonal occidental."
  },
  {
    question: "¿Qué tipo de acorde se construye naturalmente sobre el séptimo grado (VII) de la escala mayor?",
    options: [
      "Un acorde dominante.",
      "Un acorde mayor.",
      "Un acorde disminuido.",
      "Un acorde menor."
    ],
    correctAnswerIndex: 2,
    explanation: "En Do mayor, el séptimo grado es B disminuido. Tiene una sonoridad inestable que requiere resolución."
  },
  {
    question: "Según el Círculo de Quintas, si partimos de C Mayor, ¿cuál es la primera escala que introduce un sostenido (#)?",
    options: [
      "F Mayor (F).",
      "Sol Mayor (G).",
      "Re Mayor (D).",
      "A Mayor (A)."
    ],
    correctAnswerIndex: 1,
    explanation: "Tomando la quinta justa de C, llegamos a G. Esta escala introduce el primer sostenido en su séptimo grado (F#)."
  },
  {
    question: "Cada vez que avanzamos en el Círculo de Quintas, se añade un sostenido. ¿En qué grado de la nueva escala se coloca esta alteración?",
    options: [
      "En el segundo grado.",
      "En el quinto grado.",
      "En la tónica.",
      "En el séptimo grado."
    ],
    correctAnswerIndex: 3,
    explanation: "Por ejemplo, en G Mayor el sostenido es F# (séptimo grado); en D Mayor el nuevo sostenido es C# (su séptimo grado)."
  },
  {
    question: "Si avanzamos dos pasos en el Círculo de Quintas (C -> G -> D), ¿cuántos sostenidos tiene la tonalidad de Re Mayor (D)?",
    options: [
      "Cuatro sostenidos.",
      "Tres sostenidos.",
      "Dos sostenidos (F# y C#).",
      "Ningún sostenido."
    ],
    correctAnswerIndex: 2,
    explanation: "La escala de D Mayor mantiene el sostenido de la escala anterior (F#) y añade uno nuevo en su séptimo grado (C#)."
  },
  {
    question: "Para organizar las escalas con bemoles (b), utilizamos el Círculo de Cuartas. ¿Cuál es la primera escala en introducir un bemol?",
    options: [
      "Sol Mayor (G).",
      "Si bemol Mayor (Bb).",
      "Mi bemol Mayor (Eb).",
      "Fa Mayor (F)."
    ],
    correctAnswerIndex: 3,
    explanation: "Tomando la cuarta justa de C, llegamos a F. Esta escala introduce el primer bemol en su cuarto grado (Bb)."
  },
  {
    question: "El acorde que se forma en el sexto grado (VI) de la escala mayor es muy importante. En el caso de C Mayor, es Am. ¿Cómo se le conoce a esta relación?",
    options: [
      "Es el relativo dominante de la escala mayor.",
      "Es el relativo menor de la escala mayor.",
      "Es la modulación cromática de la escala.",
      "Es la paralela menor de la escala mayor."
    ],
    correctAnswerIndex: 1,
    explanation: "El relativo menor comparte exactamente las mismas notas y alteraciones que su escala mayor correspondiente, siendo esencial para las modulaciones."
  }
];

export default function QuizCapitulo3() {
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
