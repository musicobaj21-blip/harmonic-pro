import React, { useState } from 'react';

const questions = [
  {
    question: "What is the interval formula that defines a Major Scale?",
    options: [
      "Tónica - 2m - 3m - 4a - 5J - 6m - 7m",
      "Tónica - 2M - 3M - 4J - 5J - 6M - 7M",
      "Tónica - 2M - 3M - 4J - 5J - 6M - 7M",
      "Tónica - 2m - 3m - 4j - 5d - 6m - 7m"
    ],
    correctAnswerIndex: 1,
    explanation: "This sequence of tones and semitones is consistent across all major keys and generates their stable, rich sonority."
  },
  {
    question: "Why is the C Major (C) scale considered the \"mother\" or fundamental scale?",
    options: [
      "Because it is the most difficult scale to play.",
      "Because it has five flats.",
      "Because it is a natural scale that has no alterations (neither sharps nor flats).",
      "Because all the chords it generates are major."
    ],
    correctAnswerIndex: 2,
    explanation: "Since it has no accidentals (it's just the white keys on the piano), it serves as a starting point for deriving and understanding all other scales."
  },
  {
    question: "When harmonizing the C Major scale with triads, what type of chord is formed in the second degree (II)?",
    options: [
      "A diminished chord (Ddim).",
      "A major chord (D).",
      "An empty fifth chord (D5).",
      "A minor chord (Dm)."
    ],
    correctAnswerIndex: 3,
    explanation: "The second diatonic degree is always minor. Adds a soft melodic color often used to create tension towards the tonic."
  },
  {
    question: "In the harmonization of the major scale, the chord of the fifth degree (V) is fundamental. Because?",
    options: [
      "It is the brightest chord and does not require moving anywhere.",
      "It is the chord that contains the root of the scale.",
      "It is the \"dominant\" chord and generates a strong tension that resolves towards the tonic.",
      "It is the only chord that should always omit its fifth."
    ],
    correctAnswerIndex: 2,
    explanation: "The fifth degree chord (e.g. G in C Major) is the engine of Western tonal harmony."
  },
  {
    question: "What type of chord is naturally built on the seventh degree (VII) of the major scale?",
    options: [
      "A dominant chord.",
      "A major chord.",
      "A diminished chord.",
      "A minor chord."
    ],
    correctAnswerIndex: 2,
    explanation: "In C major, the seventh degree is B diminished. It has an unstable sound that requires resolution."
  },
  {
    question: "According to the Circle of Fifths, if we start from C Major, what is the first scale that introduces a sharp (#)?",
    options: [
      "F Mayor (F).",
      "G Major (G).",
      "Re Mayor (D).",
      "A Major (A)."
    ],
    correctAnswerIndex: 1,
    explanation: "Taking the perfect fifth of C, we arrive at G. This scale introduces the first sharp in its seventh degree (F#)."
  },
  {
    question: "Each time we advance in the Circle of Fifths, a sharp is added. At what level of the new scale is this alteration placed?",
    options: [
      "In the second grade.",
      "In the fifth grade.",
      "In the tone.",
      "In the seventh grade."
    ],
    correctAnswerIndex: 3,
    explanation: "For example, in G Major the sharp is F# (seventh degree); in D Major the new sharp is C# (its seventh degree)."
  },
  {
    question: "If we advance two steps in the Circle of Fifths (C -> G -> D), how many sharps does the key of D Major (D) have?",
    options: [
      "Four sharps.",
      "Three sharps.",
      "Two sharps (F# and C#).",
      "No sustain."
    ],
    correctAnswerIndex: 2,
    explanation: "The D Major scale maintains the sharp of the previous scale (F#) and adds a new one in its seventh degree (C#)."
  },
  {
    question: "To organize scales with flats (b), we use the Circle of Fourths. What is the first scale to introduce a flat?",
    options: [
      "G Major (G).",
      "B flat Major (Bb).",
      "E flat Major (Eb).",
      "Fa Mayor (F)."
    ],
    correctAnswerIndex: 3,
    explanation: "Taking the perfect fourth of C, we arrive at F. This scale introduces the first flat in its fourth degree (Bb)."
  },
  {
    question: "The chord that is formed in the sixth degree (VI) of the major scale is very important. In the case of C Major, it is Am. What is this relationship known?",
    options: [
      "It is the relative dominant of the major scale.",
      "It is the relative minor of the major scale.",
      "It is the chromatic modulation of the scale.",
      "It is the minor parallel of the major scale."
    ],
    correctAnswerIndex: 1,
    explanation: "The relative minor shares exactly the same notes and accidentals as its corresponding major scale, being essential for modulations."
  }
];

export default function QuizCapitulo3En() {
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
