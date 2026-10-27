import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Cuál es el concepto fundamental del intercambio modal?",
    opciones: [
      "Cambiar la tonalidad de la canción permanentemente",
      "Tomar prestados acordes de modos paralelos que comparten la misma tónica",
      "Alterar todas las notas de la escala mayor",
      "Usar dominantes secundarios"
    ],
    respuestaCorrecta: "Tomar prestados acordes de modos paralelos que comparten la misma tónica",
    explicacion: "El intercambio modal consiste en pedir prestado acordes a los modos paralelos (ej. de C Eólico para usar en C Mayor) sin cambiar la tónica (el centro tonal sigue siendo C)."
  },
  {
    pregunta: "Si nuestra tonalidad principal es C mayor, ¿cuál de los siguientes es un \"modo paralelo\" válido para hacer intercambio modal?",
    opciones: [
      "A menor natural",
      "G mixolidio",
      "C eólico",
      "D dórico"
    ],
    respuestaCorrecta: "C eólico",
    explicacion: "Los modos paralelos son aquellos que comparten la misma tónica. C eólico es un modo paralelo de C mayor."
  },
  {
    pregunta: "En la progresión clásica Cmaj7 - Fmaj7 - Fm7 - Cmaj7, ¿de qué modo paralelo se suele tomar prestado el Fm7 (IVm7)?",
    opciones: [
      "C Lidio",
      "C Mixolidio",
      "C Eólico o C Frigio",
      "C Dórico"
    ],
    respuestaCorrecta: "C Eólico o C Frigio",
    explicacion: "El acorde Fm7 contiene las notas F, Ab, C, Eb. El Ab (b6) y Eb (b3) provienen de los modos menores paralelos como el Eólico o el Frigio."
  },
  {
    pregunta: "¿Qué efecto sonoro y técnico produce el reemplazo del IV mayor por el IV menor (Fmaj7 a Fm7) en el jazz, como se ve en \"All of Me\"?",
    opciones: [
      "Una disonancia extrema",
      "Una modulación a otro tono",
      "Una conducción de voces cromática suave (A -> Ab -> G)",
      "Un salto melódico brusco"
    ],
    respuestaCorrecta: "Una conducción de voces cromática suave (A -> Ab -> G)",
    explicacion: "El paso de Fmaj7 a Fm7 y luego a Cmaj7 crea un movimiento melódico descendente cromático muy característico del jazz: A (tercera de F) -> Ab (tercera menor de Fm) -> G (quinta de C)."
  },
  {
    pregunta: "La progresión \"épica\" Cmaj7 - Abmaj7 - Bbmaj7 - Cmaj7 utiliza acordes prestados muy comunes en el rock y el cine. ¿Qué grados representan el Abmaj7 y Bbmaj7?",
    opciones: [
      "II y V",
      "bVImaj7 y bVIImaj7",
      "bIImaj7 y bIIImaj7",
      "IV y Vm"
    ],
    respuestaCorrecta: "bVImaj7 y bVIImaj7",
    explicacion: "En C mayor, Abmaj7 es el bVImaj7 y Bbmaj7 es el bVIImaj7, ambos tomados prestados comúnmente del modo Eólico."
  },
  {
    pregunta: "¿Qué grado modal representa el oscuro y dramático acorde Dbmaj7 tocado en la tonalidad de C mayor?",
    opciones: [
      "bIImaj7 (Frigio/Locrio)",
      "bIIImaj7 (Dórico)",
      "bVImaj7 (Eólico)",
      "VIImaj7 (Lidio)"
    ],
    respuestaCorrecta: "bIImaj7 (Frigio/Locrio)",
    explicacion: "El Dbmaj7 en C es el bIImaj7, característico del modo Frigio o Locrio, aportando una sonoridad exótica y dramática."
  },
  {
    pregunta: "¿Cuál es la diferencia principal entre un intercambio modal y una modulación?",
    opciones: [
      "El intercambio usa acordes menores y la modulación mayores",
      "El intercambio modal mantiene la tónica original y la modulación establece un nuevo centro tonal",
      "Son exactamente lo mismo",
      "La modulación no permite usar séptimas"
    ],
    respuestaCorrecta: "El intercambio modal mantiene la tónica original y la modulación establece un nuevo centro tonal",
    explicacion: "En el intercambio modal, seguimos sintiendo la tónica original (ej. C). En la modulación, el centro gravitacional cambia definitivamente a otro tono."
  },
  {
    pregunta: "Si tocamos la progresión Cmaj7 - D7 - Fmaj7 - Cmaj7, ¿de qué modo paralelo aporta su color brillante el acorde D7 (II7)?",
    opciones: [
      "C Frigio",
      "C Eólico",
      "C Lidio",
      "C Locrio"
    ],
    respuestaCorrecta: "C Lidio",
    explicacion: "El acorde D7 en C mayor (II7) contiene la nota F# (la #11 de C mayor), característica principal del modo Lidio."
  },
  {
    pregunta: "Al analizar \"Creep\" en C mayor (C - E - F - Fm), vimos que el acorde E mayor NO es un intercambio modal. ¿Qué función armónica cumple?",
    opciones: [
      "Dominante secundario (V del VI)",
      "Acorde disminuido de paso",
      "Sustituto tritonal",
      "Acorde diatónico"
    ],
    respuestaCorrecta: "Dominante secundario (V del VI)",
    explicacion: "El E mayor (III mayor) actúa como dominante secundario (V/VI) apuntando hacia Am, aunque en la canción hay una resolución engañosa hacia F."
  },
  {
    pregunta: "¿Cuál es la clave principal para utilizar el intercambio modal con éxito sin \"marear\" al oyente?",
    opciones: [
      "Usar todos los acordes de la tabla al mismo tiempo",
      "Cambiar de tónica en cada compás",
      "No usar demasiados acordes prestados a la vez para no perder el sentido de la tónica",
      "Tocar solo tríadas"
    ],
    respuestaCorrecta: "No usar demasiados acordes prestados a la vez para no perder el sentido de la tónica",
    explicacion: "El exceso de acordes prestados puede destruir la sensación de tonalidad y hacer que la música suene errática. Hay que anclar siempre la progresión a la tónica."
  }
];

export default function QuizCapitulo13() {
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Prueba tus conocimientos</h2>
        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm">
          Pregunta {currentQuestion + 1} de {quizData.length}
        </span>
      </div>

      <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl text-white mb-6">
          {quizData[currentQuestion].pregunta}
        </h3>

        <div className="flex flex-col gap-3">
          {quizData[currentQuestion].opciones.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(option)}
              className="w-full text-left p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/60 text-slate-300 transition-colors focus:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
