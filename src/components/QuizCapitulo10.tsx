import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Qué es un dominante sustituto secundario?",
    opciones: [
      "Un acorde diatónico que reemplaza a la tónica.",
      "Un acorde menor que se usa antes de cualquier dominante.",
      "Un acorde dominante (V7) fuera de la tonalidad que prepara la llegada a un acorde específico.",
      "El quinto grado exacto de la tonalidad en la que estamos."
    ],
    respuestaCorrecta: "Un acorde dominante (V7) fuera de la tonalidad que prepara la llegada a un acorde específico.",
    explicacion: "Los dominantes secundarios son acordes no diatónicos que funcionan como V7 del acorde objetivo, añadiendo tensión y color."
  },
  {
    pregunta: "En la tonalidad de Do Mayor (C), ¿cuál es el dominante secundario que prepara la llegada a Am (VI grado)?",
    opciones: ["Em7", "E7", "A7", "G7"],
    respuestaCorrecta: "E7",
    explicacion: "E7 es el V7 de Am. Sustituye al acorde diatónico Em para generar la tensión necesaria antes de resolver a Am."
  },
  {
    pregunta: "En el análisis armónico funcional, ¿cómo se etiqueta el acorde A7 cuando resuelve hacia Dm7 en la tonalidad de Do Mayor?",
    opciones: ["V7/V", "II7", "V7/ii", "SubV7/ii"],
    respuestaCorrecta: "V7/ii",
    explicacion: "Como Dm7 es el segundo grado (ii) de Do Mayor, el A7 actúa como el dominante de ese segundo grado (V7/ii)."
  },
  {
    pregunta: "¿Qué característica define la resolución de un dominante sustituto tritonal (SubV7)?",
    opciones: [
      "Resuelve saltando una cuarta justa hacia arriba.",
      "Resuelve manteniéndose en la misma nota del bajo.",
      "Resuelve descendiendo una segunda menor (un semitono) hacia el acorde objetivo.",
      "Resuelve ascendiendo un tono completo hacia la tónica."
    ],
    respuestaCorrecta: "Resuelve descendiendo una segunda menor (un semitono) hacia el acorde objetivo.",
    explicacion: "La sustitución tritonal permite que el bajo descienda cromáticamente medio tono, creando una resolución muy suave (ej. Db7 hacia Cmaj7)."
  },
  {
    pregunta: "Si en una progresión en Do Mayor queremos sustituir el dominante principal (G7) por su sustituto tritonal, ¿qué acorde usamos?",
    opciones: ["D7", "Ab7", "F#7", "Db7"],
    respuestaCorrecta: "Db7",
    explicacion: "Db7 se encuentra a una distancia de tritono (cuarta aumentada) de G7, y resuelve descendiendo un semitono hacia Cmaj7."
  },
  {
    pregunta: "¿Qué modo es ideal para tocar sobre un dominante sustituto tritonal aportando un color tenso y brillante?",
    opciones: ["Modo Dórico", "Modo Lidio Dominante", "Modo Superlocrio", "Modo Mixolidio clásico"],
    respuestaCorrecta: "Modo Lidio Dominante",
    explicacion: "El modo lidio dominante refuerza el carácter del acorde tritonal gracias a su cuarta aumentada y su séptima menor."
  },
  {
    pregunta: "¿Cuál es la principal diferencia armónica entre una progresión con dominantes secundarios y una con tritonales?",
    opciones: [
      "Los secundarios usan acordes menores, los tritonales acordes mayores.",
      "Los secundarios se mueven por saltos de cuarta, los tritonales generan líneas de bajo cromáticas descendentes.",
      "Los secundarios solo se usan en el jazz, los tritonales en el pop.",
      "No hay diferencia, suenan exactamente igual."
    ],
    respuestaCorrecta: "Los secundarios se mueven por saltos de cuarta, los tritonales generan líneas de bajo cromáticas descendentes.",
    explicacion: "Mientras un ciclo de dominantes secundarios salta en cuartas (ej. E7 - A7 - D7), los tritonales descienden por semitonos (Eb7 - Dm7)."
  },
  {
    pregunta: "En la clásica progresión II - V - I (Dm7 - G7 - Cmaj7), ¿cómo queda al aplicar la sustitución tritonal en el dominante?",
    opciones: ["Dm7 - D7 - Cmaj7", "Dm7 - Db7 - Cmaj7", "D7 - G7 - Cmaj7", "Db7 - G7 - Cmaj7"],
    respuestaCorrecta: "Dm7 - Db7 - Cmaj7",
    explicacion: "El G7 es sustituido por Db7, creando un movimiento de bajo descendente y cromático: D - Db - C."
  },
  {
    pregunta: "En la rearmonización tritonal del caso de estudio \"Mack the Knife\", se utiliza el acorde Eb7 para ir a Dm7. ¿Cómo se etiqueta este Eb7?",
    opciones: ["V7/ii", "SubV7/ii", "III7", "SubV7/I"],
    respuestaCorrecta: "SubV7/ii",
    explicacion: "Eb7 está un semitono arriba de Dm7, por lo tanto, es el sustituto tritonal del dominante del segundo grado (SubV7/ii)."
  },
  {
    pregunta: "¿Cuál es el propósito principal de usar estas herramientas de rearmonización en una composición?",
    opciones: [
      "Hacer que la canción sea más fácil de tocar.",
      "Eliminar la tensión armónica de la progresión original.",
      "Aportar nuevas opciones de color, sofisticación y movimiento dinámico menos predecible.",
      "Asegurar que la canción use estrictamente acordes diatónicos."
    ],
    respuestaCorrecta: "Aportar nuevas opciones de color, sofisticación y movimiento dinámico menos predecible.",
    explicacion: "Tanto los secundarios como los tritonales enriquecen la armonía, rompen la linealidad y ofrecen nuevos caminos hacia la resolución."
  }
];

export default function QuizCapitulo10() {
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
