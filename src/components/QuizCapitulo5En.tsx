import React, { useState } from 'react';

const questions = [
  {
    question: "How is the execution of an arpeggio defined?",
    options: [
      "It is playing only the tonic and the fifth of a chord at the same time",
      "It is the use of an effects pedal to prolong the sound",
      "It is the playing of the notes of a chord sequentially, rather than playing them simultaneously.",
      "It is playing all the notes of the major scale quickly from top to bottom"
    ],
    correctAnswerIndex: 2,
    explanation: "Arpeggios highlight the notes of a progression and allow you to create fluid melodic lines by playing the notes one after another."
  },
  {
    question: "What are the fundamental intervals that make up a major triad arpeggio?",
    options: [
      "Tonic (1st), major third (3rd) and perfect fifth (5th)",
      "Tonic (1st), major second (2nd) and perfect fourth (4th)",
      "Tonic (1st), minor third (3rd) and diminished fifth (5th)",
      "Tonic (1st), perfect fourth (4th) and major sixth (6th)"
    ],
    correctAnswerIndex: 0,
    explanation: "These three intervals form the basis of the major triad. For example, in C major: C - E - G."
  },
  {
    question: "To construct a tetrad arpeggio, what additional note is added to the basic triad?",
    options: ["The ninth", "The fourth", "The sixth", "The seventh"],
    correctAnswerIndex: 3,
    explanation: "Tetrad arpeggios add the seventh to the triad (tonic, third, fifth), adding depth and harmonic complexity."
  },
  {
    question: "Within the major harmonic field, what are the three main categories of harmonic functions?",
    options: [
      "Major, Minor and Diminished",
      "Tonic, Subdominant and Dominant",
      "Treble, Middle and Bass",
      "Rest, Transit and Modulation"
    ],
    correctAnswerIndex: 1,
    explanation: "These three groups create the sense of movement and resolution within a piece of music."
  },
  {
    question: "What is the role of the Tonic (I) chord in a harmonic progression?",
    options: [
      "It is the chord of maximum tension that asks to resolve",
      "It strictly serves as a passage towards the dominant",
      "It is the resting chord, the \"home\" of the tonality, and generates stability",
      "Introduce chromatic alterations to change tone"
    ],
    correctAnswerIndex: 2,
    explanation: "The harmonic progression tends to resolve towards the tonic due to its strong feeling of rest and stability."
  },
  {
    question: "What function does the Subdominant (IV) chord serve?",
    options: [
      "Maintains maximum scale tension",
      "It works as an intermediate step that provides movement and transition towards the dominant",
      "Close and resolve the progression, ending the piece",
      "Used exclusively in descending chord sequences"
    ],
    correctAnswerIndex: 1,
    explanation: "The fourth degree (e.g. Fmaj7 in C major) paves the way for tension by creating unresolved movement."
  },
  {
    question: "Why does the Dominant chord (V) generate tension that requires resolution towards the tonic?",
    options: [
      "Because its tonic is the lowest note of the scale",
      "Because it always lacks a third in its structure",
      "Because it is built on a forcibly augmented chord",
      "Because it contains the minor seventh, crucial to generating the feeling of resolution"
    ],
    correctAnswerIndex: 3,
    explanation: "The fifth degree chord (e.g. G7) has a minor seventh interval that creates an instability that naturally pushes towards the I chord."
  },
  {
    question: "What degrees can function as substitute chords for the Tonic (I) because they share common notes?",
    options: [
      "The second degree (II) and the fourth degree (IV)",
      "The third grade (III) and the sixth grade (VI)",
      "The fifth grade (V) and the seventh grade (VII)",
      "Only the second grade (II)"
    ],
    correctAnswerIndex: 1,
    explanation: "In C major, Cmaj7 shares notes with Em7 (III) and Am7 (VI), allowing for a subtle rest variation."
  },
  {
    question: "If we want to replace the Subdominant (IV) function, what chord can we use?",
    options: ["The third degree (III)", "The fifth grade (V)", "The second degree (II)", "The sixth grade (VI)"],
    correctAnswerIndex: 2,
    explanation: "Grade II (e.g. Dm7 in C major) shares notes with Grade IV (Fmaj7), providing a smooth transition to the dominant."
  },
  {
    question: "What scale degree can act as a substitute for the Dominant (V) function?",
    options: ["The fourth degree (IV)", "The seventh grade (VII)", "The second degree (II)", "The sixth grade (VI)"],
    correctAnswerIndex: 1,
    explanation: "The VII degree (e.g. Bm7b5 in C major) shares notes with the dominant (G7) and offers an interesting harmonic variation while maintaining tension."
  }
];

export default function QuizCapitulo5En() {
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
