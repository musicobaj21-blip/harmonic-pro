import React, { useState } from 'react';

const questions = [
  {
    question: "En la primera inversión de un acorde tríada, ¿qué nota de la estructura se sitúa en el bajo?",
    options: ["La quinta", "La tónica", "La tercera", "La séptima"],
    correctAnswerIndex: 2,
    explanation: "Al invertir una tríada en estado fundamental, la tónica sube y la tercera se convierte en la nota más grave."
  },
  {
    question: "En la segunda inversión de una tríada, como en el acorde C/G, ¿qué nota pasa a ser el bajo?",
    options: ["La tercera (E)", "La quinta (G)", "La tónica (C)", "La séptima (B)"],
    correctAnswerIndex: 1,
    explanation: "La segunda inversión coloca la quinta del acorde en la posición del bajo."
  },
  {
    question: "En los acordes tétradas (con séptima), si colocamos la séptima como la nota más baja, ¿en qué inversión estamos?",
    options: ["Segunda inversión", "Cuarta inversión", "Primera inversión", "Tercera inversión"],
    correctAnswerIndex: 3,
    explanation: "Las tétradas tienen tres inversiones: la 1ra (bajo en 3ra), la 2da (bajo en 5ta) y la 3ra (bajo en 7ma)."
  },
  {
    question: "¿Cuál es el principal objetivo o efecto de utilizar inversiones en una progresión armónica?",
    options: [
      "Cambiar la tonalidad constantemente",
      "Hacer que el acorde suene más fuerte o brillante",
      "Suavizar el movimiento entre acordes minimizando los saltos grandes en el bajo",
      "Adornar la melodía sin que afecte la armonía subyacente"
    ],
    correctAnswerIndex: 2,
    explanation: "Las inversiones permiten un \"movimiento de voces\" más natural y melódico, dando continuidad al flujo armónico."
  },
  {
    question: "¿Sobre qué grado de la escala mayor se construye el modo Dórico, utilizado comúnmente en el jazz y el funk?",
    options: ["El 3º grado", "El 4º grado", "El 2º grado", "El 5º grado"],
    correctAnswerIndex: 2,
    explanation: "El modo Dórico comienza desde el 2º grado y se caracteriza por ser suave y melancólico pero con un toque esperanzador."
  },
  {
    question: "¿Qué modo griego se asocia fuertemente con la música flamenca y el metal debido a su carácter exótico y oscuro?",
    options: ["Modo Mixolidio", "Modo Frigio", "Modo Eólico", "Modo Lócrio"],
    correctAnswerIndex: 1,
    explanation: "El modo Frigio se construye sobre el 3er grado y su segunda menor le otorga esa tensión particular."
  },
  {
    question: "¿Cuál es el intervalo característico que le da el sonido \"místico y brillante\" al modo Lidio (4º grado)?",
    options: ["La quinta disminuida (5dism)", "La séptima mayor (7maj)", "La sexta menor (6m)", "La cuarta aumentada (4aum)"],
    correctAnswerIndex: 3,
    explanation: "Esta alteración es la nota característica del Lidio, muy utilizado en música cinematográfica (ej. John Williams)."
  },
  {
    question: "El modo Mixolidio es alegre pero con cierta tensión, ideal para el rock y el blues. ¿En qué grado se origina?",
    options: ["El 5º grado", "El 2º grado", "El 6º grado", "El 4º grado"],
    correctAnswerIndex: 0,
    explanation: "Construido sobre la dominante, el Mixolidio es casi idéntico a la escala mayor pero con una séptima menor."
  },
  {
    question: "¿Qué modo griego corresponde a la escala menor natural y es común en música triste y melancólica?",
    options: ["Modo Lócrio", "Modo Frigio", "Modo Eólico", "Modo Dórico"],
    correctAnswerIndex: 2,
    explanation: "El modo Eólico se construye sobre el 6º grado de la escala mayor, siendo su relativo menor."
  },
  {
    question: "¿Por qué el modo Lócrio (7º grado) es considerado el más inestable y tenso de todos los modos?",
    options: [
      "Porque no tiene una nota fundamental",
      "Porque está formado solo por tonos enteros",
      "Porque contiene una quinta disminuida y una segunda menor",
      "Porque tiene demasiadas alteraciones (#)"
    ],
    correctAnswerIndex: 2,
    explanation: "Estos intervalos hacen que carezca de un centro tonal de reposo, usándose más en jazz y música experimental."
  }
];

export default function QuizCapitulo6() {
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
