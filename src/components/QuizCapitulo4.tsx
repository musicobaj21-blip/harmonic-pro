import React, { useState } from 'react';

const questions = [
  {
    question: "¿Qué es un acorde tétrada?",
    options: [
      "Es un acorde formado por tres notas tocadas en arpegio.",
      "Es un acorde formado por cuatro notas diferentes (una tríada a la que se le añade una séptima).",
      "Es un acorde de quinta vacío usado en el rock.",
      "Es un grupo de cuatro ritmos simultáneos o compases."
    ],
    correctAnswerIndex: 1,
    explanation: "Las tétradas son una extensión de los acordes tríada y juegan un papel clave para enriquecer la armonía en la música moderna."
  },
  {
    question: "¿Cómo se construye un acorde mayor con séptima mayor (Maj7)?",
    options: [
      "Añadiendo una séptima menor a un acorde mayor.",
      "Añadiendo una séptima mayor a un acorde menor.",
      "Añadiendo una séptima mayor a un acorde mayor.",
      "Añadiendo una sexta mayor a un acorde disminuido."
    ],
    correctAnswerIndex: 2,
    explanation: "La estructura consta de la tónica, tercera mayor, quinta justa y séptima mayor (Ejemplo: C - E - G - B)."
  },
  {
    question: "Si a un acorde mayor (como C Mayor) le añadimos una séptima menor (Bb), ¿qué tipo de acorde obtenemos?",
    options: [
      "Un acorde mayor con séptima mayor (Cmaj7).",
      "Un acorde semidisminuido (Cm7b5).",
      "Un acorde menor con séptima menor (Cm7).",
      "Un acorde mayor con séptima menor o acorde Dominante (C7)."
    ],
    correctAnswerIndex: 3,
    explanation: "El acorde de séptima dominante se forma con tónica, tercera mayor, quinta justa y séptima menor."
  },
  {
    question: "¿Cuál es la estructura interválica de un acorde menor con séptima menor (m7)?",
    options: [
      "Un acorde mayor más una séptima menor.",
      "Un acorde menor más una séptima mayor.",
      "Un acorde menor más una séptima menor.",
      "Un acorde disminuido más una séptima menor."
    ],
    correctAnswerIndex: 2,
    explanation: "Se compone de tónica, tercera menor, quinta justa y séptima menor (Ejemplo: C - Eb - G - Bb)."
  },
  {
    question: "¿Qué acorde se forma al añadir una séptima mayor a un acorde menor?",
    options: [
      "Acorde menor con séptima mayor (mMaj7).",
      "Acorde dominante (7).",
      "Acorde mayor con séptima mayor (maj7).",
      "Acorde semidisminuido (m7b5)."
    ],
    correctAnswerIndex: 0,
    explanation: "Este acorde posee una sonoridad muy particular y melódica, compuesto por tónica, tercera menor, quinta justa y séptima mayor."
  },
  {
    question: "¿Qué tipo de séptima se le añade a un acorde disminuido para formar un acorde semidisminuido (m7b5)?",
    options: [
      "Una séptima disminuida.",
      "Una séptima mayor.",
      "Una sexta mayor.",
      "Una séptima menor."
    ],
    correctAnswerIndex: 3,
    explanation: "El acorde m7b5 (o semidisminuido) se construye con tónica, tercera menor, quinta disminuida y séptima menor."
  },
  {
    question: "El acorde disminuido completo (dim7) se forma añadiendo una séptima disminuida a un acorde disminuido. En el caso de Cdim7, ¿cuál es esa nota?",
    options: [
      "B (Si natural).",
      "Bbb (Si doble bemol).",
      "Bb (Si bemol).",
      "A (La natural)."
    ],
    correctAnswerIndex: 1,
    explanation: "La estructura exacta de Cdim7 es C (tónica), Eb (tercera menor), Gb (quinta disminuida) y Bbb (séptima disminuida)."
  },
  {
    question: "¿Cuál es una de las progresiones armónicas con tétradas más utilizadas en la música moderna y el jazz en tonalidad mayor?",
    options: [
      "I - IV - V - I (Ejemplo: Cmaj7 - Fmaj7 - G7 - Cmaj7).",
      "VI - II - V (Ejemplo: Am7 - Dm7 - G7).",
      "II - V - I (Ejemplo: Dm7 - G7 - Cmaj7).",
      "I - VI - IV - V (Ejemplo: Cmaj7 - Am7 - Fmaj7 - G7)."
    ],
    correctAnswerIndex: 2,
    explanation: "Esta progresión utiliza los acordes de séptima diatónicos para crear un fuerte sentido de movimiento y resolución hacia la tónica."
  },
  {
    question: "En la armonización de una escala mayor con tétradas, ¿qué tipo de acorde se construye siempre sobre el cuarto grado (IV)?",
    options: [
      "Un acorde menor con séptima menor (m7).",
      "Un acorde de séptima dominante (7).",
      "Un acorde mayor con séptima mayor (Maj7).",
      "Un acorde semidisminuido (m7b5)."
    ],
    correctAnswerIndex: 2,
    explanation: "En el campo armónico mayor, el cuarto grado siempre forma un acorde Maj7. Por ejemplo, en la escala de Do Mayor (C), el cuarto grado produce el acorde Fmaj7."
  },
  {
    question: "En la progresión clásica conocida como \"Cadencia de Blues\" (Ejemplo: C7 - F7 - G7), ¿qué tipo de acordes de cuatro notas se utilizan predominantemente?",
    options: [
      "Acordes menores con séptima menor (m7).",
      "Acordes de séptima dominante (7).",
      "Acordes mayores con séptima mayor (maj7).",
      "Acordes semidisminuidos (m7b5)."
    ],
    correctAnswerIndex: 1,
    explanation: "El uso de acordes dominantes en los grados I, IV y V es la característica fundamental de la sonoridad del Blues tradicional."
  }
];

export default function QuizCapitulo4() {
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
