import React, { useState } from 'react';

const questions = [
  {
    question: "¿Cómo se define la ejecución de un arpegio?",
    options: [
      "Es tocar solo la tónica y la quinta de un acorde al mismo tiempo",
      "Es el uso de un pedal de efectos para prolongar el sonido",
      "Es la ejecución de las notas de un acorde de manera secuencial, en lugar de tocarlas simultáneamente",
      "Es tocar todas las notas de la escala mayor rápidamente de arriba hacia abajo"
    ],
    correctAnswerIndex: 2,
    explanation: "Los arpegios resaltan las notas de una progresión y permiten crear líneas melódicas fluidas tocando las notas una tras otra."
  },
  {
    question: "¿Cuáles son los intervalos fundamentales que componen un arpegio de tríada mayor?",
    options: [
      "Tónica (1ra), tercera mayor (3ra) y quinta justa (5ta)",
      "Tónica (1ra), segunda mayor (2da) y cuarta justa (4ta)",
      "Tónica (1ra), tercera menor (3ra) y quinta disminuida (5ta)",
      "Tónica (1ra), cuarta justa (4ta) y sexta mayor (6ta)"
    ],
    correctAnswerIndex: 0,
    explanation: "Estos tres intervalos forman la base de la tríada mayor. Por ejemplo, en C mayor: C - E - G."
  },
  {
    question: "Para construir un arpegio de tétrada, ¿qué nota adicional se agrega a la tríada básica?",
    options: ["La novena", "La cuarta", "La sexta", "La séptima"],
    correctAnswerIndex: 3,
    explanation: "Los arpegios de tétradas agregan la séptima a la tríada (tónica, tercera, quinta), añadiendo profundidad y complejidad armónica."
  },
  {
    question: "Dentro del campo armónico mayor, ¿cuáles son las tres categorías principales de las funciones armónicas?",
    options: [
      "Mayor, Menor y Disminuido",
      "Tónica, Subdominante y Dominante",
      "Agudos, Medios y Graves",
      "Reposo, Tránsito y Modulación"
    ],
    correctAnswerIndex: 1,
    explanation: "Estos tres grupos crean el sentido de movimiento y resolución dentro de una pieza musical."
  },
  {
    question: "¿Cuál es el rol del acorde de Tónica (I) en una progresión armónica?",
    options: [
      "Es el acorde de máxima tensión que pide resolver",
      "Sirve estrictamente de paso hacia la dominante",
      "Es el acorde de reposo, la \"casa\" de la tonalidad, y genera estabilidad",
      "Introduce alteraciones cromáticas para cambiar de tono"
    ],
    correctAnswerIndex: 2,
    explanation: "La progresión armónica tiende a resolver hacia la tónica por su fuerte sensación de descanso y estabilidad."
  },
  {
    question: "¿Qué función cumple el acorde Subdominante (IV)?",
    options: [
      "Mantiene la tensión máxima de la escala",
      "Funciona como un paso intermedio que aporta movimiento y transición hacia la dominante",
      "Cierra y resuelve la progresión dando fin a la pieza",
      "Se utiliza exclusivamente en secuencias descendentes de acordes"
    ],
    correctAnswerIndex: 1,
    explanation: "El cuarto grado (ej. Fmaj7 en C mayor) prepara el camino hacia la tensión creando movimiento sin resolver aún."
  },
  {
    question: "¿Por qué el acorde Dominante (V) genera tensión que pide resolución hacia la tónica?",
    options: [
      "Porque su tónica es la nota más grave de la escala",
      "Porque siempre carece de tercera en su estructura",
      "Porque se construye sobre un acorde aumentado forzosamente",
      "Porque contiene la séptima menor, crucial para generar la sensación de resolución"
    ],
    correctAnswerIndex: 3,
    explanation: "El acorde de quinto grado (ej. G7) tiene un intervalo de séptima menor que crea una inestabilidad que empuja naturalmente hacia el acorde I."
  },
  {
    question: "¿Qué grados pueden funcionar como acordes sustitutos de la Tónica (I) por compartir notas en común?",
    options: [
      "El segundo grado (II) y el cuarto grado (IV)",
      "El tercer grado (III) y el sexto grado (VI)",
      "El quinto grado (V) y el séptimo grado (VII)",
      "Únicamente el segundo grado (II)"
    ],
    correctAnswerIndex: 1,
    explanation: "En C mayor, Cmaj7 comparte notas con Em7 (III) y Am7 (VI), permitiendo una variación sutil del reposo."
  },
  {
    question: "Si queremos sustituir la función de Subdominante (IV), ¿qué acorde podemos utilizar?",
    options: ["El tercer grado (III)", "El quinto grado (V)", "El segundo grado (II)", "El sexto grado (VI)"],
    correctAnswerIndex: 2,
    explanation: "El grado II (ej. Dm7 en C mayor) comparte notas con el grado IV (Fmaj7), proporcionando una transición suave hacia la dominante."
  },
  {
    question: "¿Qué grado de la escala puede actuar como sustituto de la función Dominante (V)?",
    options: ["El cuarto grado (IV)", "El séptimo grado (VII)", "El segundo grado (II)", "El sexto grado (VI)"],
    correctAnswerIndex: 1,
    explanation: "El grado VII (ej. Bm7b5 en C mayor) comparte notas con el dominante (G7) y ofrece una variación armónica interesante manteniendo la tensión."
  }
];

export default function QuizCapitulo5() {
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
