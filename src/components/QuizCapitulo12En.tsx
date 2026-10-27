import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "What are tensions in a chord?",
    opciones: [
      "Notes that form the basic triad",
      "Extensions built by thirds above the basic tetrad (9, 11, 13)",
      "Passing notes that do not belong to the scale",
      "Diminished seventh chords"
    ],
    respuestaCorrecta: "Extensions built by thirds above the basic tetrad (9, 11, 13)",
    explicacion: "Tensions continue the stacking by thirds after the root, third, fifth, and seventh."
  },
  {
    pregunta: "In a Maj7 chord, which tension generates a 'Lydian' sound?",
    opciones: [
      "b9",
      "natural 11",
      "#11",
      "b13"
    ],
    respuestaCorrecta: "#11",
    explicacion: "The #11 is the main characteristic of the Lydian mode. On a Maj7, it provides an open and bright sound."
  },
  {
    pregunta: "Why is the natural 11th generally avoided in Maj7 chords?",
    opciones: [
      "Because it sounds too consonant",
      "Because it creates a minor second (or b9) interval against the major third of the chord",
      "Because it forces the chord to resolve into a minor key",
      "Because it is exclusive to diminished chords"
    ],
    respuestaCorrecta: "Because it creates a minor second (or b9) interval against the major third of the chord",
    explicacion: "This dissonance is very harsh; for example in Cmaj7, the note F clashes strongly with E."
  },
  {
    pregunta: "Which is the most natural and stable tension in minor 7 (m7) chords because it does not create a strong clash with its structural notes?",
    opciones: [
      "natural 11",
      "#11",
      "b9",
      "Major 7"
    ],
    respuestaCorrecta: "natural 11",
    explicacion: "In minor chords, the third is minor, which places the natural 11th at a whole-step interval, avoiding harsh dissonances."
  },
  {
    pregunta: "Which upper tension defines the difference between a minor chord with 'Dorian' color and one with 'Aeolian' color?",
    opciones: [
      "Natural 9 vs b9",
      "Natural 11 vs #11",
      "Natural 13 (Dorian) vs b13 (Aeolian)",
      "Major 7 vs b7"
    ],
    respuestaCorrecta: "Natural 13 (Dorian) vs b13 (Aeolian)",
    explicacion: "The major 13th gives the bright sound of the Dorian, while the minor 13th (b13) gives the darker sound of the Aeolian."
  },
  {
    pregunta: "Which type of chord is the most flexible, allowing both natural and altered tensions depending on the context of its resolution?",
    opciones: [
      "Maj7",
      "m7",
      "m7(b5)",
      "Dominant 7"
    ],
    respuestaCorrecta: "Dominant 7",
    explicacion: "Due to its unstable nature (containing a tritone), the Dominant 7 can accept 9, b9, #9, #11, 13, and b13."
  },
  {
    pregunta: "In a Dominant 7sus4 chord, what function does the natural 11th serve?",
    opciones: [
      "Acts as a chromatic passing note",
      "Temporarily replaces the third of the chord",
      "Generates a Lydian clash",
      "Prepares a modulation"
    ],
    respuestaCorrecta: "Temporarily replaces the third of the chord",
    explicacion: "In 'sus' chords, the perfect fourth (or natural 11th) replaces the third, creating a sense of suspension."
  },
  {
    pregunta: "In modern jazz, which scale is usually used over an m7(b5) to allow for a natural 9th and avoid the strong dissonance of the b9?",
    opciones: [
      "Natural Locrian scale",
      "Dorian scale",
      "Locrian #2 scale",
      "Lydian scale"
    ],
    respuestaCorrecta: "Locrian #2 scale",
    explicacion: "The Locrian #2 (or natural 2 Locrian) scale raises the ninth by a half step compared to the Locrian, thus avoiding the dissonant b9."
  },
  {
    pregunta: "What is the main characteristic of the diminished 7 (dim7) chord when applying tensions?",
    opciones: [
      "It only accepts natural tensions",
      "It is symmetric by minor thirds and usually uses the Whole-Half scale",
      "It rejects any type of tension",
      "It functions identically to a Maj7"
    ],
    respuestaCorrecta: "It is symmetric by minor thirds and usually uses the Whole-Half scale",
    explicacion: "This symmetry allows the use of the octatonic scale, providing tensions a whole step away from each note of the chord."
  },
  {
    pregunta: "In melody, what is the tension called that falls on a strong beat and then resolves to a structural note?",
    opciones: [
      "Neighbor note",
      "Passing note",
      "Anticipation",
      "Appoggiatura"
    ],
    respuestaCorrecta: "Appoggiatura",
    explicacion: "The appoggiatura occurs on a strong beat creating tension, only to resolve by step."
  }
];

export default function QuizCapitulo12En() {
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