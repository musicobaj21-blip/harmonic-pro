import React, { useState } from 'react';

const questions = [
  {
    question: "What is a tetrad chord?",
    options: [
      "It is a chord made up of three notes played in an arpeggio.",
      "It is a chord made up of four different notes (a triad to which a seventh is added).",
      "It is an empty fifth chord used in rock.",
      "It is a group of four simultaneous rhythms or measures."
    ],
    correctAnswerIndex: 1,
    explanation: "Tetrads are an extension of triad chords and play a key role in enriching harmony in modern music."
  },
  {
    question: "How do you construct a major chord with a major seventh (Maj7)?",
    options: [
      "Adding a minor seventh to a major chord.",
      "Adding a major seventh to a minor chord.",
      "Adding a major seventh to a major chord.",
      "Adding a major sixth to a diminished chord."
    ],
    correctAnswerIndex: 2,
    explanation: "The structure consists of the tonic, major third, perfect fifth and major seventh (Example: C - E - G - B)."
  },
  {
    question: "If we add a minor seventh (Bb) to a major chord (like C Major), what type of chord do we get?",
    options: [
      "A major chord with a major seventh (Cmaj7).",
      "A semi-diminished chord (Cm7b5).",
      "A minor chord with a minor seventh (Cm7).",
      "A major chord with a minor seventh or Dominant chord (C7)."
    ],
    correctAnswerIndex: 3,
    explanation: "The dominant seventh chord is formed with the tonic, major third, perfect fifth, and minor seventh."
  },
  {
    question: "What is the interval structure of a minor chord with a minor seventh (m7)?",
    options: [
      "A major chord plus a minor seventh.",
      "A minor chord plus a major seventh.",
      "A minor chord plus a minor seventh.",
      "A diminished chord plus a minor seventh."
    ],
    correctAnswerIndex: 2,
    explanation: "It is made up of the tonic, minor third, perfect fifth and minor seventh (Example: C - Eb - G - Bb)."
  },
  {
    question: "What chord is formed by adding a major seventh to a minor chord?",
    options: [
      "Minor chord with major seventh (mMaj7).",
      "Dominant chord (7).",
      "Major chord with major seventh (maj7).",
      "Semi-diminished chord (m7b5)."
    ],
    correctAnswerIndex: 0,
    explanation: "This chord has a very particular and melodic sound, composed of tonic, minor third, perfect fifth and major seventh."
  },
  {
    question: "What type of seventh is added to a diminished chord to form a semi-diminished chord (m7b5)?",
    options: [
      "A diminished seventh.",
      "A major seventh.",
      "A major sixth.",
      "A minor seventh."
    ],
    correctAnswerIndex: 3,
    explanation: "The m7b5 (or semi-diminished) chord is constructed with the tonic, minor third, diminished fifth and minor seventh."
  },
  {
    question: "The full diminished chord (dim7) is formed by adding a diminished seventh to a diminished chord. In the case of Cdim7, what is that note?",
    options: [
      "B (Si natural).",
      "Bbb (B double flat).",
      "Bb (B flat).",
      "A (The natural)."
    ],
    correctAnswerIndex: 1,
    explanation: "The exact structure of Cdim7 is C (tonic), Eb (minor third), Gb (diminished fifth) and Bbb (diminished seventh)."
  },
  {
    question: "What is one of the most used harmonic progressions with tetrads in modern music and jazz in a major key?",
    options: [
      "I - IV - V - I (Example: Cmaj7 - Fmaj7 - G7 - Cmaj7).",
      "VI - II - V (Example: Am7 - Dm7 - G7).",
      "II - V - I (Example: Dm7 - G7 - Cmaj7).",
      "I - VI - IV - V (Example: Cmaj7 - Am7 - Fmaj7 - G7)."
    ],
    correctAnswerIndex: 2,
    explanation: "This progression uses diatonic seventh chords to create a strong sense of movement and resolution toward the tonic."
  },
  {
    question: "When harmonizing a major scale with tetrads, what type of chord is always built on the fourth degree (IV)?",
    options: [
      "A minor chord with a minor seventh (m7).",
      "A dominant seventh chord (7).",
      "A major chord with a major seventh (Maj7).",
      "A semi-diminished chord (m7b5)."
    ],
    correctAnswerIndex: 2,
    explanation: "In the major harmonic field, the fourth degree always forms a Maj7 chord. For example, in the C Major (C) scale, the fourth degree produces the Fmaj7 chord."
  },
  {
    question: "In the classic progression known as \"Blues Cadence\" (Example: C7 - F7 - G7), what type of four-note chords are predominantly used?",
    options: [
      "Minor chords with minor seventh (m7).",
      "Dominant seventh chords (7).",
      "Major chords with major seventh (maj7).",
      "Semi-diminished chords (m7b5)."
    ],
    correctAnswerIndex: 1,
    explanation: "The use of dominant chords in degrees I, IV and V is the fundamental characteristic of the sound of traditional Blues."
  }
];

export default function QuizCapitulo4En() {
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
