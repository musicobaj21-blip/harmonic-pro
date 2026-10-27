import React, { useState } from 'react';

const questions = [
  {
    question: "How many notes make up a basic triad chord?",
    options: [
      "Two notes.",
      "Three notes.",
      "Four notes.",
      "Five notes."
    ],
    correctAnswerIndex: 1,
    explanation: "Triad chords are the fundamental basis of harmony and, as their name indicates, they are built with exactly three notes."
  },
  {
    question: "What are the four main types that triad chords are classified into?",
    options: [
      "Major, minor, fair and diminished.",
      "Major, minor, increased and suspended.",
      "Major, minor, diminished and increased.",
      "Major, diminished, increased and parallel."
    ],
    correctAnswerIndex: 2,
    explanation: "These four classifications depend on the third and fifth intervals that are added to the root note."
  },
  {
    question: "What is the interval structure that forms a Major triad chord?",
    options: [
      "Tonic (1st), Minor Third (3m) and Just Fifth (5J).",
      "Tonic (1st), Major Third (3M) and Just Fifth (5J).",
      "Tonic (1st), Major Second (2M) and Just Fifth (5J).",
      "Tonic (1st), Major Third (3M) and Perfect Fourth (4J)."
    ],
    correctAnswerIndex: 1,
    explanation: "This structure gives the major chord its characteristic bright and stable sound."
  },
  {
    question: "If we construct a C Major (C) chord, what are the three resulting notes?",
    options: [
      "C - Eb - G (Do - I Flat - Sun).",
      "C - F - G (Do - Fa - Sol).",
      "C - E - G (Do - Mi - Sol).",
      "C - E - Gb (Do - E - G flat)."
    ],
    correctAnswerIndex: 2,
    explanation: "C is the tonic, E is the major third (4 semitones away), and G is the perfect fifth (7 semitones away)."
  },
  {
    question: "What interval differentiates a Major triad chord from a Minor triad chord?",
    options: [
      "The fifth (Just in the major chord, Diminished in the minor chord).",
      "The fundamental (Tonic).",
      "The seventh (Major in the major chord, Minor in the minor chord).",
      "The third (Major in the major chord, Minor in the minor chord)."
    ],
    correctAnswerIndex: 3,
    explanation: "Both chords share the Tonic and the Just Fifth; Changing the third completely alters the character of the chord."
  },
  {
    question: "What is the interval structure that forms a Minor triad chord?",
    options: [
      "Tonic (1st), Major Third (3M) and Diminished Fifth (5dim).",
      "Tonic (1st), Minor Third (3m) and Just Fifth (5J).",
      "Tonic (1ra), Minor Second (2m) and Perfect Fifth (5J).",
      "Tonic (1st), Minor Third (3m) and Augmented Fifth (5aum)."
    ],
    correctAnswerIndex: 1,
    explanation: "The minor third darkens the sound of the chord, giving it its characteristic melancholic sound."
  },
  {
    question: "If we construct a C Minor (Cm) chord, what are the correct notes?",
    options: [
      "C - E - G (Do - Mi - Sol).",
      "C - Eb - G (Do - I Flat - Sun).",
      "C - Eb - Gb (C - E flat - G flat).",
      "C - E - G# (Do - Mi - Sol sustained)."
    ],
    correctAnswerIndex: 1,
    explanation: "By lowering the third of C Major (E) half a step, we obtain the Eb, which is the minor third."
  },
  {
    question: "How is a Diminished triad chord constructed?",
    options: [
      "Tonic (1st), Major Third (3M) and Diminished Fifth (5dim).",
      "Tonic (1st), Minor Third (3m) and Augmented Fifth (5aum).",
      "Tonic (1st), Minor Third (3m) and Just Fifth (5J).",
      "Tonic (1st), Minor Third (3m) and Diminished Fifth (5dim)."
    ],
    correctAnswerIndex: 3,
    explanation: "It is made up of two overlapping minor thirds, which makes the fifth diminished (a semitone below the perfect fifth)."
  },
  {
    question: "What notes make up the C Diminished (Cdim) chord?",
    options: [
      "C - Eb - G (Do - I Flat - Sun).",
      "C - E - Gb (Do - E - G flat).",
      "C - Eb - Gb (C - E flat - G flat).",
      "C - Eb - G# (C - E flat - G sharp)."
    ],
    correctAnswerIndex: 2,
    explanation: "On the tonic C, we add the minor third (Eb) and the diminished fifth (Gb)."
  },
  {
    question: "What is the interval structure of an Augmented triad chord?",
    options: [
      "Tonic (1st), Major Third (3M) and Augmented Fifth (5aum).",
      "Tonic (1st), Minor Third (3m) and Augmented Fifth (5aum).",
      "Tonic (1st), Major Third (3M) and Diminished Fifth (5dim).",
      "Tonic (1st), Perfect Fourth (4J) and Augmented Fifth (5aum)."
    ],
    correctAnswerIndex: 0,
    explanation: "It is made up of two superimposed major thirds. The fifth is raised a semitone above the perfect fifth, generating great tension."
  }
];

export default function QuizCapitulo2En() {
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
