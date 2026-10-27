import React, { useState } from 'react';

const questions = [
  {
    question: "What is fundamentally an interval in music theory?",
    options: [
      "It is the length of time a note lasts (half note, quarter note, eighth note).",
      "It is the distance between two musical notes.",
      "It is the volume with which a chord is played.",
      "It is the number of measures in a melody."
    ],
    correctAnswerIndex: 1,
    explanation: "Intervals are the basis of harmony, as they measure the space between sounds and define their relationship."
  },
  {
    question: "What is the difference between a melodic interval and a harmonic interval?",
    options: [
      "The melodic uses sharps and the harmonic uses flats.",
      "The melodic is played one note after the other, and the harmonic is played both notes at the same time.",
      "The harmonic can only be played on the piano, and the melodic can only be played on the voice.",
      "The harmonic has a longer duration than the melodic."
    ],
    correctAnswerIndex: 1,
    explanation: "Melodies are sequential, while harmony is built by stacking notes simultaneously."
  },
  {
    question: "How many semitones away is a Perfect Fifth (5J) from its base note?",
    options: ["5 semitones.", "6 semitones.", "7 semitones.", "8 semitones."],
    correctAnswerIndex: 2,
    explanation: "For example, from C (C) to G (G) are exactly 7 semitones away."
  },
  {
    question: "What is another name for the Augmented Fourth interval (#4)?",
    options: [
      "Fair fifth (5J).",
      "Major third (3M).",
      "Minor sixth (6m).",
      "Diminished fifth (b5)."
    ],
    correctAnswerIndex: 3,
    explanation: "It is the interval known as \"Tritone\", located exactly 6 semitones from the tonic, dividing the octave in half."
  },
  {
    question: "Practice: What is the Major Third (3M) of the note D (D)?",
    options: ["Fa natural (F).", "F sharp (F#).", "E (E).", "Sol (G)."],
    correctAnswerIndex: 1,
    explanation: "The major third is 4 semitones away. D -> D# -> E -> F -> F#."
  },
  {
    question: "Practice: What is the Major Sixth (6M) of the note A (A)?",
    options: ["Fa natural (F).", "F sharp (F#).", "Sol (G).", "E (E)."],
    correctAnswerIndex: 1,
    explanation: "The major sixth is 9 semitones away. Counting from A (A), we reach F sharp (F#)."
  },
  {
    question: "Practice: If you are in the note E (E) and you go up a Minor Third (3m), what note do you reach?",
    options: ["Sol (G).", "F sharp (F#).", "G sharp (G#).", "The (A)."],
    correctAnswerIndex: 0,
    explanation: "The minor third is 3 semitones away. E -> F -> F# -> G."
  },
  {
    question: "Practice: What is the Major Seventh (7M) of the note G (G)?",
    options: ["Fa natural (F).", "F sharp (F#).", "E (E).", "The flat (Ab)."],
    correctAnswerIndex: 1,
    explanation: "The major seventh is 11 semitones away, that is, just one semitone below the octave (G)."
  },
  {
    question: "Practice: If the base note is F (F), what is its Perfect Fourth (4J)?",
    options: ["Natural (B).", "B flat (Bb).", "The (A).", "Do (C)."],
    correctAnswerIndex: 1,
    explanation: "The perfect fourth is 5 semitones away. F -> F# -> G -> G# -> A -> Bb."
  },
  {
    question: "How far away in semitones is the Octave always from any root note?",
    options: ["8 semitones.", "10 semitones.", "12 semitones.", "14 semitones."],
    correctAnswerIndex: 2,
    explanation: "In our musical system, the full chromatic scale has 12 semitones before the note is repeated in the next octave."
  }
];

export default function QuizCapitulo1En() {
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
