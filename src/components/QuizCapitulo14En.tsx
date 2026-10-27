import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "What is the correct formula to build a melodic minor scale?",
    opciones: [
      "1 - 2 - b3 - 4 - 5 - b6 - b7",
      "1 - 2 - b3 - 4 - 5 - 6 - 7",
      "1 - b2 - b3 - 4 - 5 - b6 - b7",
      "1 - 2 - 3 - 4 - 5 - 6 - 7"
    ],
    respuestaCorrecta: "1 - 2 - b3 - 4 - 5 - 6 - 7",
    explicacion: "The melodic minor scale differs from the natural minor in that it raises its sixth and seventh notes, resulting in the formula 1 - 2 - b3 - 4 - 5 - 6 - 7."
  },
  {
    pregunta: "What makes the melodic minor scale sound brighter and more modern than the natural minor?",
    opciones: [
      "It lacks a perfect fifth",
      "It has a major sixth and a major seventh",
      "All of its notes are altered",
      "It lacks a third"
    ],
    respuestaCorrecta: "It has a major sixth and a major seventh",
    explicacion: "The presence of the major sixth and seventh removes the tension typical of the flat b6 and b7 notes, giving it a brighter, more modern, and resolving color."
  },
  {
    pregunta: "What is the most representative chord built on the first degree of the melodic minor scale?",
    opciones: [
      "Minor 7 chord (m7)",
      "Dominant chord (7)",
      "Minor major 7 chord (m(maj7))",
      "Half-diminished chord (m7b5)"
    ],
    respuestaCorrecta: "Minor major 7 chord (m(maj7))",
    explicacion: "The first degree forms a chord with a root, minor third, perfect fifth, and major seventh, which is denoted as m(maj7)."
  },
  {
    pregunta: "The \"Lydian b7\" (Lydian Dominant) mode is commonly used over what type of chord?",
    opciones: [
      "Dominant chords with #11",
      "Natural minor chords",
      "Major chords with b9",
      "Diminished chords"
    ],
    respuestaCorrecta: "Dominant chords with #11",
    explicacion: "The Lydian b7 is the fourth mode of the melodic minor scale and contains the augmented fourth (#11) and minor seventh, ideal for 7(#11) chords."
  },
  {
    pregunta: "What is the advantage of using the \"Locrian natural 2\" mode over a half-diminished (m7b5) chord instead of the traditional Locrian?",
    opciones: [
      "It provides a natural ninth (9) instead of a flat ninth (b9)",
      "It transforms the chord into a major one",
      "It eliminates the flat fifth",
      "It forces a modulation to another key"
    ],
    respuestaCorrecta: "It provides a natural ninth (9) instead of a flat ninth (b9)",
    explicacion: "The traditional Locrian mode (which comes from the major scale) has the b9, making it very dark. Locrian natural 2 raises that minor second to a major, achieving a more open and modern sound."
  },
  {
    pregunta: "In the classic IIø - V7 - Im progression (e.g., Dm7b5 - G7b13 - Cm(maj7)), which melodic minor mode is ideal for the G7(b13) dominant chord?",
    opciones: [
      "Lydian augmented",
      "Dorian b2",
      "Mixolydian b13",
      "Superlocrian"
    ],
    respuestaCorrecta: "Mixolydian b13",
    explicacion: "The Mixolydian b13 is the fifth mode of the melodic minor scale. It provides the b13 tension without altering the ninth or the eleventh, ideal for dominant chords that resolve to minor."
  },
  {
    pregunta: "From which degree of the melodic minor scale does the Altered Scale (Superlocrian) originate?",
    opciones: [
      "From the 1st degree",
      "From the 4th degree",
      "From the 5th degree",
      "From the 7th degree"
    ],
    respuestaCorrecta: "From the 7th degree",
    explicacion: "The Altered scale or Superlocrian is constructed by starting from the seventh degree of the melodic minor scale."
  },
  {
    pregunta: "What altered tensions does the Altered Scale contain to enrich a dominant chord?",
    opciones: [
      "9, 11, 13",
      "b9, #9, b5 (#11), #5 (b13)",
      "It only contains the b9 and natural 13",
      "It has no tensions"
    ],
    respuestaCorrecta: "b9, #9, b5 (#11), #5 (b13)",
    explicacion: "The altered scale encompasses all possible tensions on a dominant chord without altering its guide tones (root, third, seventh). It contains variations of both the ninth (b9, #9) and the fifth (b5 or #11, #5 or b13)."
  },
  {
    pregunta: "Practical rule: If you want to improvise with an altered scale over a G7alt chord, which melodic minor scale should you think of?",
    opciones: [
      "G melodic minor (from the same note)",
      "Ab melodic minor (half a step up)",
      "D melodic minor (a fifth up)",
      "C melodic minor (a fourth up)"
    ],
    respuestaCorrecta: "Ab melodic minor (half a step up)",
    explicacion: "Since the altered scale is the 7th degree of the melodic minor scale, you can deduce the scale simply by thinking of the melodic minor a semitone above the chord (Ab melodic minor over G7alt)."
  },
  {
    pregunta: "If you are playing a Cmaj7 and want to apply a tritone substitute Db7(#11) before returning to the Cmaj7, which scale coming from Ab melodic minor is played over the Db7?",
    opciones: [
      "Db Lydian Dominant",
      "Db Dorian",
      "Db Ionian",
      "Db Altered"
    ],
    respuestaCorrecta: "Db Lydian Dominant",
    explicacion: "Over the Db7(#11) as a tritone substitute (subV7), the Lydian Dominant is commonly used, which corresponds to the 4th mode of Ab melodic minor (the same scale that generates the altered scale over G7)."
  }
];

export default function QuizCapitulo14En() {
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Test your knowledge</h2>
        <span className="bg-slate-800 text-indigo-400/80 px-3 py-1 rounded-full text-sm">
          Question {currentQuestion + 1} of {quizData.length}
        </span>
      </div>

      <div className="bg-slate-800/80 p-6 md:p-8 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl text-white mb-6">
          {quizData[currentQuestion].pregunta}
        </h3>

        <div className="flex flex-col gap-3">
          {quizData[currentQuestion].opciones.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(option)}
              className="w-full text-left p-4 rounded-lg border border-slate-600 bg-transparent hover:bg-slate-700/60 text-slate-300 transition-colors focus:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}