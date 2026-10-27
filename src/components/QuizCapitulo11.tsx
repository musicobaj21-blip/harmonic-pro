import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Qué son los dominantes extendidos?",
    opciones: [
      "Una sucesión de acordes V7 que resuelven entre sí por quintas descendentes.",
      "Acordes mayores que se tocan durante largos periodos de tiempo.",
      "Acordes menores séptima encadenados por terceras.",
      "Dominantes que resuelven subiendo un semitono siempre."
    ],
    respuestaCorrecta: "Una sucesión de acordes V7 que resuelven entre sí por quintas descendentes.",
    explicacion: "Los dominantes extendidos forman una cadena de tensión donde cada acorde actúa como V7 del siguiente, viajando por el ciclo de quintas."
  },
  {
    pregunta: "En la cadena de Do Mayor: E7 - A7 - D7 - G7 - Cmaj7, ¿qué función cumple el acorde E7 inicial?",
    opciones: [
      "V7/II",
      "V7/VI que inicia el efecto dominó.",
      "I7",
      "SubV7/V"
    ],
    respuestaCorrecta: "V7/VI que inicia el efecto dominó.",
    explicacion: "En Do mayor, E7 es el V7 de Am (VI grado). En lugar de ir a Am, va a A7, iniciando la cadena extendida."
  },
  {
    pregunta: "¿En qué estilos musicales son muy característicos los dominantes extendidos?",
    opciones: [
      "Heavy Metal y Punk.",
      "Ragtime, Jazz tradicional, Pop clásico.",
      "Música electrónica y Techno.",
      "Exclusivamente en el periodo barroco."
    ],
    respuestaCorrecta: "Ragtime, Jazz tradicional, Pop clásico.",
    explicacion: "Estas cadenas de V7 son fundamentales en el sonido del Ragtime y estándares de Jazz, proporcionando un movimiento armónico continuo."
  },
  {
    pregunta: "¿Cuál es el propósito de interponer un acorde ii7 relativo antes de un dominante?",
    opciones: [
      "Anteponer un acorde menor para transformar un dominante en un micro-ciclo ii-V.",
      "Hacer que el dominante suene másdisonante.",
      "Cambiar la tonalidad principal de la canción a menor.",
      "Eliminar la necesidad de resolver en la tónica."
    ],
    respuestaCorrecta: "Anteponer un acorde menor para transformar un dominante en un micro-ciclo ii-V.",
    explicacion: "El ii7 relativo convierte un simple V7 en un movimiento armónico más rico y clásico (ii-V), aportando fluidez melódica."
  },
  {
    pregunta: "¿Cuál es el ii7 relativo del dominante secundario A7 (que resuelve hacia Dm7)?",
    opciones: [
      "Am7",
      "E7",
      "Em7b5",
      "Fm7"
    ],
    respuestaCorrecta: "Em7b5",
    explicacion: "Como A7 resuelve a un acorde menor (Dm7), su ii7 relativo natural en la escala menor es un acorde semidisminuido: Em7b5."
  },
  {
    pregunta: "¿Cuál es el ii7 relativo que acompaña a un dominante sustituto tritonal como Db7?",
    opciones: [
      "Dm7",
      "Abm7",
      "G7",
      "C#m7"
    ],
    respuestaCorrecta: "Abm7",
    explicacion: "El ii relativo siempre está una cuarta justa por debajo (o quinta por arriba) del dominante. Para Db7, el ii7 es Abm7."
  },
  {
    pregunta: "¿Qué movimiento crea en el bajo el uso de un ii7 relativo junto con un sustituto tritonal (Ej. Abm7 - Db7 -> Cmaj7)?",
    opciones: [
      "Crea un movimiento de quinta justa y luego resuelve por semitono: Ab -> Db -> C.",
      "El bajo desciende por segundas mayores todo el tiempo.",
      "Permanece estático en la misma nota.",
      "Se mueve exclusivamente por saltos de tercera."
    ],
    respuestaCorrecta: "Crea un movimiento de quinta justa y luego resuelve por semitono: Ab -> Db -> C.",
    explicacion: "El paso de Abm7 a Db7 es un salto clásico de cuarta/quinta en el bajo (ii-V), mientras que de Db7 a Cmaj7 es la resolución cromática descendente del SubV7."
  },
  {
    pregunta: "Si el acorde de resolución objetivo es MENOR, ¿qué estructura interválica se prefiere por defecto para el ii7 relativo?",
    opciones: [
      "Acorde menor séptima (m7).",
      "Se prefiere usar un acorde menor siete quinta bemol o m7b5.",
      "Acorde mayor séptima (maj7).",
      "Acorde dominante (V7)."
    ],
    respuestaCorrecta: "Se prefiere usar un acorde menor siete quinta bemol o m7b5.",
    explicacion: "El acorde ii en una tonalidad menor es un acorde semidisminuido (m7b5), por lo que suena más cohesivo usarlo antes del V7 cuando la resolución será menor."
  },
  {
    pregunta: "¿Cuál es la distribución rítmica más común cuando se introduce un ii7 relativo acompañando a su dominante en un compás de 4/4?",
    opciones: [
      "El dominante ocupa los 4 tiempos y el ii7 relativo no se toca.",
      "El ii7 dura 1 tiempo y el dominante 3.",
      "Suelen compartir el compás durando 2 tiempos cada uno (figuras blancas).",
      "El ii7 y el dominante se tocan simultáneamente formando un policorde."
    ],
    respuestaCorrecta: "Suelen compartir el compás durando 2 tiempos cada uno (figuras blancas).",
    explicacion: "Esto crea un ritmo armónico regular de blancas, muy típico en el jazz, dándole espacio a cada acorde para aportar su color en la rearmonización."
  },
  {
    pregunta: "¿Cuál es el objetivo pedagógico final de combinar cadenas de dominantes y ii-V micro resueltos?",
    opciones: [
      "Complicar la lectura de la partitura de forma innecesaria.",
      "Enriquecer las líneas de bajo y suavizar las transiciones armónicas hacia los acordes objetivo.",
      "Asegurar que solo haya acordes diatónicos en una obra.",
      "Evitar por completo las modulaciones a otras tonalidades."
    ],
    respuestaCorrecta: "Enriquecer las líneas de bajo y suavizar las transiciones armónicas hacia los acordes objetivo.",
    explicacion: "Estas técnicas permiten tomar progresiones simples y convertirlas en progresiones con líneas de bajo caminantes (walking bass) y movimientos de voces elaborados."
  }
];

export default function QuizCapitulo11() {
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
