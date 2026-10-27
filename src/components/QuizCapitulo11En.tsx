import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "What are extended dominants?",
    opciones: [
      "A sequence of V7 chords that resolve into each other by descending fifths.",
      "Major chords played for long periods of time.",
      "Minor seventh chords chained by thirds.",
      "Dominants that always resolve by moving up a semitone."
    ],
    respuestaCorrecta: "A sequence of V7 chords that resolve into each other by descending fifths.",
    explicacion: "Extended dominants form a chain of tension where each chord acts as the V7 of the next, traveling through the cycle of fifths."
  },
  {
    pregunta: "In the C Major chain: E7 - A7 - D7 - G7 - Cmaj7, what function does the initial E7 chord serve?",
    opciones: [
      "V7/II",
      "V7/VI that starts the domino effect.",
      "I7",
      "SubV7/V"
    ],
    respuestaCorrecta: "V7/VI that starts the domino effect.",
    explicacion: "In C major, E7 is the V7 of Am (VI degree). Instead of going to Am, it goes to A7, starting the extended chain."
  },
  {
    pregunta: "In which musical styles are extended dominants very characteristic?",
    opciones: [
      "Heavy Metal and Punk.",
      "Ragtime, Traditional Jazz, Classic Pop.",
      "Electronic music and Techno.",
      "Exclusively in the Baroque period."
    ],
    respuestaCorrecta: "Ragtime, Traditional Jazz, Classic Pop.",
    explicacion: "These V7 chains are fundamental to the sound of Ragtime and Jazz standards, providing continuous harmonic motion."
  },
  {
    pregunta: "What is the purpose of interposing a relative ii7 chord before a dominant?",
    opciones: [
      "To place a minor chord before a dominant to transform it into a ii-V micro-cycle.",
      "To make the dominant sound more dissonant.",
      "To change the main key of the song to minor.",
      "To eliminate the need to resolve on the tonic."
    ],
    respuestaCorrecta: "To place a minor chord before a dominant to transform it into a ii-V micro-cycle.",
    explicacion: "The relative ii7 converts a simple V7 into a richer and more classic harmonic movement (ii-V), providing melodic fluidity."
  },
  {
    pregunta: "What is the relative ii7 of the secondary dominant A7 (which resolves toward Dm7)?",
    opciones: [
      "Am7",
      "E7",
      "Em7b5",
      "Fm7"
    ],
    respuestaCorrecta: "Em7b5",
    explicacion: "Since A7 resolves to a minor chord (Dm7), its natural relative ii7 in the minor scale is a half-diminished chord: Em7b5."
  },
  {
    pregunta: "What is the relative ii7 that accompanies a tritone substitute dominant like Db7?",
    opciones: [
      "Dm7",
      "Abm7",
      "G7",
      "C#m7"
    ],
    respuestaCorrecta: "Abm7",
    explicacion: "The relative ii is always a perfect fourth below (or a fifth above) the dominant. For Db7, the ii7 is Abm7."
  },
  {
    pregunta: "What movement does the use of a relative ii7 together with a tritone substitute (e.g., Abm7 - Db7 -> Cmaj7) create in the bass?",
    opciones: [
      "It creates a perfect fifth movement and then resolves by semitone: Ab -> Db -> C.",
      "The bass descends by major seconds all the time.",
      "It remains static on the same note.",
      "It moves exclusively by jumps of a third."
    ],
    respuestaCorrecta: "It creates a perfect fifth movement and then resolves by semitone: Ab -> Db -> C.",
    explicacion: "The move from Abm7 to Db7 is a classic fourth/fifth jump in the bass (ii-V), while Db7 to Cmaj7 is the descending chromatic resolution of the SubV7."
  },
  {
    pregunta: "If the target resolution chord is MINOR, which interval structure is preferred by default for the relative ii7?",
    opciones: [
      "Minor seventh chord (m7).",
      "It is preferred to use a minor seven flat five or m7b5 chord.",
      "Major seventh chord (maj7).",
      "Dominant chord (V7)."
    ],
    respuestaCorrecta: "It is preferred to use a minor seven flat five or m7b5 chord.",
    explicacion: "The ii chord in a minor key is a half-diminished chord (m7b5), so it sounds more cohesive to use it before the V7 when the resolution will be minor."
  },
  {
    pregunta: "What is the most common rhythmic distribution when introducing a relative ii7 accompanying its dominant in a 4/4 measure?",
    opciones: [
      "The dominant occupies all 4 beats and the relative ii7 is not played.",
      "The ii7 lasts 1 beat and the dominant 3.",
      "They usually share the measure, lasting 2 beats each (half notes).",
      "The ii7 and the dominant are played simultaneously forming a polychord."
    ],
    respuestaCorrecta: "They usually share the measure, lasting 2 beats each (half notes).",
    explicacion: "This creates a regular harmonic rhythm of half notes, very typical in jazz, giving each chord space to contribute its color to the reharmonization."
  },
  {
    pregunta: "What is the final pedagogical goal of combining chains of dominants and resolved micro ii-Vs?",
    opciones: [
      "To complicate reading sheet music unnecessarily.",
      "To enrich bass lines and smooth out harmonic transitions toward target chords.",
      "To ensure that only diatonic chords exist in a piece.",
      "To completely avoid modulations to other keys."
    ],
    respuestaCorrecta: "To enrich bass lines and smooth out harmonic transitions toward target chords.",
    explicacion: "These techniques allow for taking simple progressions and turning them into progressions with walking bass lines and elaborate voice leading."
  }
];

export default function QuizCapitulo11En() {
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
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
          <p className="text-xl text-slate-300">
            Final Score: <span className="text-cyan-400 font-bold">{score}</span> / {quizData.length}
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
          >
            Retry Quiz
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-h-[60vh] overflow-y-auto space-y-6 shadow-xl">
          <h3 className="text-xl font-bold text-slate-100 mb-4 sticky top-0 bg-slate-800 py-2 border-b border-slate-700 z-10">
            Answer Analysis
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
                    <span className="font-bold text-slate-400">Your answer:</span>{" "}
                    <span className={passed ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                      {fb.selected}
                    </span>
                  </p>
                  {!passed && (
                    <p>
                      <span className="font-bold text-slate-400">Correct answer:</span>{" "}
                      <span className="text-emerald-400">{fb.correct}</span>
                    </p>
                  )}
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">Analysis:</span> {fb.explanation}
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
        <h2 className="text-2xl font-bold text-white">Test your knowledge</h2>
        <span className="text-xs font-mono text-slate-400 border border-slate-700 px-3 py-1 rounded bg-slate-800">
          Question {currentQuestion + 1} of {quizData.length}
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