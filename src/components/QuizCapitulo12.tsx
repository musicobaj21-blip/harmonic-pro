import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "¿Qué son las tensiones en un acorde?",
    opciones: [
      "Notas que forman la tríada básica",
      "Extensiones construidas por terceras sobre la tétrada básica (9, 11, 13)",
      "Notas de paso que no pertenecen a la escala",
      "Acordes de séptima disminuida"
    ],
    respuestaCorrecta: "Extensiones construidas por terceras sobre la tétrada básica (9, 11, 13)",
    explicacion: "Las tensiones continúan el apilamiento por terceras después de la fundamental, tercera, quinta y séptima."
  },
  {
    pregunta: "En un acorde Maj7, ¿cuál es la tensión que genera un sonido 'Lidio'?",
    opciones: [
      "b9",
      "11 natural",
      "#11",
      "b13"
    ],
    respuestaCorrecta: "#11",
    explicacion: "La #11 es la característica principal del modo Lidio. Sobre un Maj7, aporta un sonido abierto y brillante."
  },
  {
    pregunta: "¿Por qué se evita generalmente la 11ena natural en los acordes Maj7?",
    opciones: [
      "Porque suena demasiado consonante",
      "Porque genera una distancia de segunda menor (o b9) contra la tercera mayor del acorde",
      "Porque obliga al acorde a resolver en un tono menor",
      "Porque es exclusiva de los acordes disminuidos"
    ],
    respuestaCorrecta: "Porque genera una distancia de segunda menor (o b9) contra la tercera mayor del acorde",
    explicacion: "Esta disonancia es muy dura; por ejemplo en Cmaj7, la nota F choca fuertemente con E."
  },
  {
    pregunta: "¿Cuál es la tensión más natural y estable en los acordes menores 7 (m7) porque no genera choque fuerte con sus notas estructurales?",
    opciones: [
      "11 natural",
      "#11",
      "b9",
      "Mayor 7"
    ],
    respuestaCorrecta: "11 natural",
    explicacion: "En acordes menores, la tercera es menor, lo que sitúa a la oncena natural a distancia de un tono entero, evitando disonancias ásperas."
  },
  {
    pregunta: "¿Qué tensión superior define la diferencia entre un acorde menor con color 'Dórico' y uno con color 'Eólico'?",
    opciones: [
      "La 9 natural vs b9",
      "La 11 natural vs #11",
      "La 13 natural (Dórico) vs b13 (Eólico)",
      "La 7 mayor vs b7"
    ],
    respuestaCorrecta: "La 13 natural (Dórico) vs b13 (Eólico)",
    explicacion: "La trecena mayor da el sonido brillante del Dórico, mientras que la trecena menor (b13) da el sonido más oscuro del Eólico."
  },
  {
    pregunta: "¿Qué tipo de acorde es el más flexible, permitiendo tensiones tanto naturales como alteradas según el contexto de su resolución?",
    opciones: [
      "Maj7",
      "m7",
      "m7(b5)",
      "Dominante 7"
    ],
    respuestaCorrecta: "Dominante 7",
    explicacion: "Por su naturaleza inestable (contiene un tritono), el Dominante 7 puede aceptar 9, b9, #9, #11, 13 y b13."
  },
  {
    pregunta: "En un acorde Dominante 7sus4, ¿qué función cumple la 11ena natural?",
    opciones: [
      "Actúa como nota de paso cromática",
      "Reemplaza temporalmente a la tercera del acorde",
      "Genera un choque Lidio",
      "Prepara una modulación"
    ],
    respuestaCorrecta: "Reemplaza temporalmente a la tercera del acorde",
    explicacion: "En los acordes 'sus', la cuarta justa (u 11ena natural) sustituye a la tercera, creando una sensación de suspensión."
  },
  {
    pregunta: "En el jazz moderno, ¿qué escala se suele utilizar sobre un m7(b5) para permitir una 9na natural y evitar la fuerte disonancia de la b9?",
    opciones: [
      "Escala Locria natural",
      "Escala Dórica",
      "Escala Locria #2",
      "Escala Lidia"
    ],
    respuestaCorrecta: "Escala Locria #2",
    explicacion: "La escala Locria #2 (o Locria natural 2) eleva la novena medio tono respecto a la Locria, evitando así la disonante b9."
  },
  {
    pregunta: "¿Cuál es la característica principal del acorde disminuido 7 (dim7) al momento de aplicar tensiones?",
    opciones: [
      "Solo acepta tensiones naturales",
      "Es simétrico por terceras menores y suele usar la escala Tono-Semitono",
      "Rechaza cualquier tipo de tensión",
      "Funciona idéntico a un Maj7"
    ],
    respuestaCorrecta: "Es simétrico por terceras menores y suele usar la escala Tono-Semitono",
    explicacion: "Esta simetría permite usar la escala octatónica, proporcionando tensiones a un tono entero de cada nota del acorde."
  },
  {
    pregunta: "En la melodía, ¿cómo se le llama a la tensión que cae en un tiempo fuerte y luego resuelve a una nota estructural?",
    opciones: [
      "Bordadura",
      "Nota de paso",
      "Anticipación",
      "Apoyatura"
    ],
    respuestaCorrecta: "Apoyatura",
    explicacion: "La apoyatura se presenta en un tiempo fuerte generando tensión, para luego resolver por grado conjunto."
  }
];

export default function QuizCapitulo12() {
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


