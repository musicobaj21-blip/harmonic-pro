import React, { useState } from 'react';

const quizData = [
  {
    question: "¿Cuál es la diferencia principal entre la escala menor natural y la menor armónica?",
    options: ["El 3er grado es mayor", "El 7mo grado está elevado un semitono", "El 6to grado es mayor", "El 4to grado está aumentado"],
    correctAnswerIndex: 1,
    explanation: "La escala menor armónica eleva el séptimo grado para crear un 'tono sensible' (a un semitono de la tónica), lo que le da una resolución más fuerte."
  },
  {
    question: "¿Cuáles son las notas exactas de la escala de A (La) Menor Armónica?",
    options: ["A - B - C - D - E - F - G - A", "A - B - C# - D - E - F# - G# - A", "A - B - C - D - E - F - G# - A", "A - B - C - D - E - F# - G - A"],
    correctAnswerIndex: 2,
    explanation: "Es A menor natural (A-B-C-D-E-F-G) pero con el séptimo grado elevado a G#."
  },
  {
    question: "¿Qué intervalo (distancia en semitonos) se forma en la práctica entre el 6to y el 7mo grado de la escala menor armónica?",
    options: ["Segunda menor", "Tercera menor", "Segunda mayor", "Segunda aumentada"],
    correctAnswerIndex: 1,
    explanation: "Entre el 6to grado y el 7mo grado elevado hay una distancia de 3 semitonos (tono y medio). Siguiendo nuestra tabla de intervalos fundamentales del Capítulo 1, esta distancia corresponde a una Tercera menor."
  },
  {
    question: "¿Qué acorde tétrada se forma en el grado I de la escala menor armónica?",
    options: ["Menor 7 (m7)", "Menor con séptima mayor (m(7M))", "Mayor 7 (maj7)", "Dominante 7 (7)"],
    correctAnswerIndex: 1,
    explanation: "El grado I de La menor armónica contiene las notas A - C - E - G#, lo que forma el tenso y característico acorde de tónica Am(7M)."
  },
  {
    question: "¿Qué tipo de acorde se forma en el grado III de la escala menor armónica?",
    options: ["Mayor 7 (maj7)", "Mayor 7 con quinta aumentada (maj7#5)", "Menor 7 (m7)", "Dominante 7 (7)"],
    correctAnswerIndex: 1,
    explanation: "El grado III en La menor armónica consta de C - E - G# - B, lo que forma el acorde Cmaj7(#5)."
  },
  {
    question: "¿Qué acorde de cuatro notas encontramos en el grado V de la escala y cuál es su función?",
    options: ["Em(maj7) / Subdominante", "E7 / Dominante fuerte hacia el grado I", "Emaj7 / Tónica", "E°7 / Acorde de paso"],
    correctAnswerIndex: 1,
    explanation: "Al tener G# como tercera mayor, el grado V se convierte en E7 (E - G# - B - D), brindando una resolución de dominante perfecta hacia Am."
  },
  {
    question: "¿Cuál es el acorde con función de dominante sustituto que se forma en el grado VII?",
    options: ["G# disminuido 7 (G#°7)", "G dominante (G7)", "G# semidisminuido (G#m7b5)", "G disminuido 7 (G°7)"],
    correctAnswerIndex: 0,
    explanation: "En la menor armónica, el acorde sobre el 7mo grado es un acorde disminuido completo: G#°7 (G# - B - D - F)."
  },
  {
    question: "¿Cuál es la progresión de acordes característica del tema 'Minor Swing' de Django Reinhardt?",
    options: ["Am7 - Dm7 - G7 - Cmaj7", "Am6 - Dm6 - E7 - Am6", "Amaj7 - Dmaj7 - E7 - Amaj7", "Am - F - C - G"],
    correctAnswerIndex: 1,
    explanation: "Esta icónica progresión del Gypsy Jazz utiliza E7 como dominante proveniente de la menor armónica."
  },
  {
    question: "En el Gypsy Jazz y en 'Minor Swing', ¿qué aporta el acorde E7 al resolver a la tónica menor (Am)?",
    options: ["Una sensación de reposo lacio", "Una modulación a la tonalidad de Mi", "Una fuerte atracción gravitacional hacia la tónica", "Un color bluesy brillante"],
    correctAnswerIndex: 2,
    explanation: "El acorde dominante E7 posee el trítono (G# - D) que crea la máxima tensión, resolviendo de manera contundente sobre Am."
  },
  {
    question: "¿Cuál es la estructura interválica completa de la escala menor armónica?",
    options: ["T - 2M - 3m - 4J - 5J - 6m - 7M", "T - 2M - 3M - 4J - 5J - 6M - 7M", "T - 2M - 3m - 4J - 5J - 6m - 7m", "T - 2m - 3m - 4J - 5J - 6m - 7m"],
    correctAnswerIndex: 0,
    explanation: "Tónica, 2da Mayor, 3ra menor, 4ta Justa, 5ta Justa, 6ta menor y 7ma Mayor (sensible)."
  }
];

export default function QuizCapitulo8() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [answersFeedback, setAnswersFeedback] = useState<
    { question: string; selected: number; correct: number; explanation: string }[]
  >([]);

  const handleAnswerClick = (optionIndex: number) => {
    const isCorrect = optionIndex === quizData[currentQuestion].correctAnswerIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    const newFeedback = [
      ...answersFeedback,
      {
        question: quizData[currentQuestion].question,
        selected: optionIndex,
        correct: quizData[currentQuestion].correctAnswerIndex,
        explanation: quizData[currentQuestion].explanation,
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
                      {quizData[idx].options[fb.selected]}
                    </span>
                  </p>
                  {!passed && (
                    <p>
                      <span className="font-bold text-slate-400">Respuesta correcta:</span>{" "}
                      <span className="text-emerald-400">{quizData[idx].options[fb.correct]}</span>
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
          {quizData[currentQuestion].question}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {quizData[currentQuestion].options.map((option, idx) => (
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
