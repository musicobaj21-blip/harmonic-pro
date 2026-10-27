import React, { useState } from 'react';

const questions = [
  {
    question: "In the first inversion of a triad chord, which note of the structure is placed on the bass?",
    options: ["The fifth", "The tone", "The third", "The seventh"],
    correctAnswerIndex: 2,
    explanation: "When reversing a triad in the ground state, the tonic rises and the third becomes the lowest note."
  },
  {
    question: "In the second inversion of a triad, as in the C/G chord, which note becomes the bass?",
    options: ["The third (E)", "The fifth (G)", "The tonic (C)", "The seventh (B)"],
    correctAnswerIndex: 1,
    explanation: "The second inversion places the fifth of the chord in bass position."
  },
  {
    question: "In tetrad chords (with a seventh), if we place the seventh as the lowest note, what inversion are we in?",
    options: ["Second investment", "Fourth investment", "First investment", "Third investment"],
    correctAnswerIndex: 3,
    explanation: "Tetrads have three inversions: the 1st (low in the 3rd), the 2nd (low in the 5th) and the 3rd (low in the 7th)."
  },
  {
    question: "What is the main objective or effect of using inversions in a harmonic progression?",
    options: [
      "Constantly change the tone",
      "Make the chord sound louder or brighter",
      "Smooth the movement between chords by minimizing large jumps in the bass",
      "Embellish the melody without affecting the underlying harmony"
    ],
    correctAnswerIndex: 2,
    explanation: "Inversions allow a more natural and melodic \"voice movement\" giving continuity to the harmonic flow."
  },
  {
    question: "What degree of the major scale is the Dorian mode, commonly used in jazz and funk, built on?",
    options: ["The 3rd grade", "The 4th grade", "The 2nd grade", "The 5th grade"],
    correctAnswerIndex: 2,
    explanation: "The Doric mode begins from the 2nd grade and is characterized by being soft and melancholic but with a hopeful touch."
  },
  {
    question: "Which Greek mode is strongly associated with flamenco music and metal due to its exotic and dark character?",
    options: ["Mixolydian mode", "Phrygian mode", "Wind Mode", "Lócrio way"],
    correctAnswerIndex: 1,
    explanation: "The Phrygian mode is built on the 3rd degree and its minor second gives it that particular tension."
  },
  {
    question: "What is the characteristic interval that gives the \"mystical and brilliant\" sound to the Lydian mode (4th degree)?",
    options: ["The diminished fifth (5dism)", "The major seventh (7maj)", "The minor sixth (6m)", "The augmented fourth (4aum)"],
    correctAnswerIndex: 3,
    explanation: "This alteration is the characteristic note of Lydian, widely used in film music (e.g. John Williams)."
  },
  {
    question: "The Mixolydio mode is happy but with a certain tension, ideal for rock and blues. To what degree does it originate?",
    options: ["The 5th grade", "The 2nd grade", "The 6th grade", "The 4th grade"],
    correctAnswerIndex: 0,
    explanation: "Built on the dominant, the Mixolydian is almost identical to the major scale but with a minor seventh."
  },
  {
    question: "Which Greek mode corresponds to the natural minor scale and is common in sad and melancholic music?",
    options: ["Lócrio way", "Phrygian mode", "Wind Mode", "Doric Mode"],
    correctAnswerIndex: 2,
    explanation: "The Aeolian mode is built on the 6th degree of the major scale, being its relative minor."
  },
  {
    question: "Why is Lócrio mode (7th degree) considered the most unstable and tense of all modes?",
    options: [
      "Because it doesn't have a root note",
      "Because it is made up only of whole tones",
      "Because it contains a diminished fifth and a minor second",
      "Because it has too many alterations (#)"
    ],
    correctAnswerIndex: 2,
    explanation: "These intervals mean that it lacks a resting tonal center, being used more in jazz and experimental music."
  }
];

export default function QuizCapitulo6En() {
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
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
          <p className="text-xl text-slate-300">
            Final Score: <span className="text-cyan-400 font-bold">{score}</span> / {questions.length}
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition"
          >
            Retry Quiz
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-h-[60vh] overflow-y-auto space-y-6">
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
                      {questions[idx].options[fb.selected]}
                    </span>
                  </p>
                  {!passed && (
                    <p>
                      <span className="font-bold text-slate-400">Correct answer:</span>{" "}
                      <span className="text-emerald-400">{questions[idx].options[fb.correct]}</span>
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
          Question {currentQuestion + 1} of {questions.length}
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
