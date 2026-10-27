import React, { useState } from 'react';

const questions = [
  {
    question: "¿Qué es fundamentalmente un intervalo en la teoría musical?",
    options: [
      "Es el tiempo que dura una nota (blanca, negra, corchea).",
      "Es la distancia que existe entre dos notas musicales.",
      "Es el volumen con el que se toca un acorde.",
      "Es la cantidad de compases en una melodía."
    ],
    correctAnswerIndex: 1,
    explanation: "Los intervalos son la base de la armonía, ya que miden el espacio entre sonidos y definen su relación."
  },
  {
    question: "¿Cuál es la diferencia entre un intervalo melódico y uno armónico?",
    options: [
      "El melódico usa sostenidos y el armónico usa bemoles.",
      "El melódico se toca una nota después de la otra, y el armónico se tocan ambas notas al mismo tiempo.",
      "El armónico solo se puede tocar en el piano, y el melódico en la voz.",
      "El armónico tiene mayor duración de tiempo que el melódico."
    ],
    correctAnswerIndex: 1,
    explanation: "Las melodías son secuenciales, mientras que la armonía se construye apilando notas simultáneamente."
  },
  {
    question: "¿A cuántos semitonos de distancia se encuentra una Quinta Justa (5J) desde su nota base?",
    options: ["5 semitonos.", "6 semitonos.", "7 semitonos.", "8 semitonos."],
    correctAnswerIndex: 2,
    explanation: "Por ejemplo, de Do (C) a Sol (G) hay exactamente 7 semitonos de distancia."
  },
  {
    question: "¿Qué otro nombre recibe el intervalo de Cuarta Aumentada (#4)?",
    options: [
      "Quinta justa (5J).",
      "Tercera mayor (3M).",
      "Sexta menor (6m).",
      "Quinta disminuida (b5)."
    ],
    correctAnswerIndex: 3,
    explanation: "Es el intervalo conocido como \"Tritono\", ubicado exactamente a 6 semitonos de la tónica, dividiendo la octava a la mitad."
  },
  {
    question: "Práctica: ¿Cuál es la Tercera Mayor (3M) de la nota Re (D)?",
    options: ["Fa natural (F).", "Fa sostenido (F#).", "Mi (E).", "Sol (G)."],
    correctAnswerIndex: 1,
    explanation: "La tercera mayor está a 4 semitonos de distancia. D -> D# -> E -> F -> F#."
  },
  {
    question: "Práctica: ¿Cuál es la Sexta Mayor (6M) de la nota La (A)?",
    options: ["Fa natural (F).", "Fa sostenido (F#).", "Sol (G).", "Mi (E)."],
    correctAnswerIndex: 1,
    explanation: "La sexta mayor está a 9 semitonos de distancia. Contando desde La (A), llegamos a Fa sostenido (F#)."
  },
  {
    question: "Práctica: Si estás en la nota Mi (E) y subes una Tercera Menor (3m), ¿a qué nota llegas?",
    options: ["Sol (G).", "Fa sostenido (F#).", "Sol sostenido (G#).", "La (A)."],
    correctAnswerIndex: 0,
    explanation: "La tercera menor está a 3 semitonos. E -> F -> F# -> G."
  },
  {
    question: "Práctica: ¿Cuál es la Séptima Mayor (7M) de la nota Sol (G)?",
    options: ["Fa natural (F).", "Fa sostenido (F#).", "Mi (E).", "La bemol (Ab)."],
    correctAnswerIndex: 1,
    explanation: "La séptima mayor está a 11 semitonos de distancia, es decir, solo un semitono por debajo de la octava (G)."
  },
  {
    question: "Práctica: Si la nota base es Fa (F), ¿cuál es su Cuarta Justa (4J)?",
    options: ["Si natural (B).", "Si bemol (Bb).", "La (A).", "Do (C)."],
    correctAnswerIndex: 1,
    explanation: "La cuarta justa está a 5 semitonos. F -> F# -> G -> G# -> A -> Bb."
  },
  {
    question: "¿A qué distancia en semitonos se encuentra siempre la Octava de cualquier nota fundamental?",
    options: ["8 semitonos.", "10 semitonos.", "12 semitonos.", "14 semitonos."],
    correctAnswerIndex: 2,
    explanation: "En nuestro sistema musical, la escala cromática completa tiene 12 semitonos antes de que la nota se repita en la siguiente octava."
  }
];

export default function QuizCapitulo1() {
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
