import React, { useState } from 'react';

const questions = [
  {
    question: "¿De qué grado de la escala mayor se deriva la Escala Menor Natural?",
    options: ["2º grado", "4º grado", "5º grado", "6º grado"],
    correctAnswerIndex: 3,
    explanation: "La Escala Menor Natural se construye a partir del 6º grado de una Escala Mayor (generando el Modo Eólico)."
  },
  {
    question: "¿Cuál es la fórmula de intervalos de la Escala Menor Natural?",
    options: [
      "T - 2M - 3M - 4J - 5J - 6M - 7M",
      "T - 2m - 3m - 4J - 5J - 6m - 7m",
      "T - 2M - 3m - 4J - 5J - 6m - 7m",
      "T - 2M - 3m - 4a - 5J - 6m - 7M"
    ],
    correctAnswerIndex: 2,
    explanation: "Su estructura principal es la tercera menor, sexta menor y séptima menor (T - 2M - 3m - 4J - 5J - 6m - 7m)."
  },
  {
    question: "¿Por qué el V grado de la menor natural se considera inestable?",
    options: [
      "Porque es un acorde disminuido",
      "Porque es un acorde mayor",
      "Porque es un acorde menor 7 (v7) y carece de tritono",
      "Porque pertenece a la Tónica"
    ],
    correctAnswerIndex: 2,
    explanation: "El V grado en la menor natural es menor (v7), sin el tritono característico que proporciona la tensión necesaria hacia la tónica."
  },
  {
    question: "¿Qué escala se utiliza para \"pedir prestado\" un dominante fuerte (V7)?",
    options: [
      "Escala Menor Melódica",
      "Escala Mayor",
      "Escala Pentatónica Menor",
      "Escala Menor Armónica"
    ],
    correctAnswerIndex: 3,
    explanation: "Se toma prestado de la Menor Armónica (que tiene la 7ma mayor) para crear un V7 que genere fuerte tensión hacia I."
  },
  {
    question: "En A Menor, ¿cuál es el acorde dominante estabilizado?",
    options: ["Em6", "E7", "Emaj7", "Edim7"],
    correctAnswerIndex: 1,
    explanation: "En la tonalidad de A Menor, Em7 es el dominante natural débil, y se reemplaza por E7 (dominante estabilizado de la menor armónica)."
  },
  {
    question: "¿Qué acorde cumple función de Subdominante y prepara la tensión?",
    options: ["Im7", "IIIm7", "IVm7", "V7"],
    correctAnswerIndex: 2,
    explanation: "El IVm7 (por ejemplo, Dm7 en A menor) actúa como subdominante, creando transición hacia la tensión del dominante."
  },
  {
    question: "¿Qué acorde puede sustituir a la Tónica (Im7) manteniendo el reposo?",
    options: ["II°", "IIImaj7", "VImaj7", "VII7"],
    correctAnswerIndex: 1,
    explanation: "El acorde IIImaj7 comparte varias notas estructurales con la tónica Im7 y aporta esa misma sensación de reposo o color estable."
  },
  {
    question: "¿Cuántos sostenidos (#) tiene la tonalidad de F# Menor?",
    options: ["2 sostenidos", "3 sostenidos", "4 sostenidos", "ningún sostenido"],
    correctAnswerIndex: 1,
    explanation: "F# Menor es la relativa de A Mayor, ambas comparten 3 sostenidos: F#, C#, G#."
  },
  {
    question: "¿Cuál es la escala menor relativa de Eb Mayor?",
    options: ["C Menor", "F Menor", "A Menor", "G Menor"],
    correctAnswerIndex: 0,
    explanation: "Para hallar la relativa menor bajamos una tercera menor desde Eb, encontrando C Menor."
  },
  {
    question: "El acorde VII°7 cumple la función de:",
    options: [
      "Subdominante, prepara la tensión suave",
      "Tónica, resuelve suavemente",
      "Dominante, genera fuerte tensión hacia la tónica",
      "Función neutra, no direcciona a nada"
    ],
    correctAnswerIndex: 2,
    explanation: "El VII°7 es un acorde tenso por excelencia. Cumple la función resolutiva (dominante) buscando el I."
  }
];

export default function QuizCapitulo7() {
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
