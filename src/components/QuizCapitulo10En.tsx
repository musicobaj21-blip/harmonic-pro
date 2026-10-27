import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "What is a secondary dominant chord?",
    opciones: [
      "A diatonic chord that replaces the tonic.",
      "A minor chord used before any dominant.",
      "A dominant chord (V7) outside of the key that prepares the arrival of a specific chord.",
      "The exact fifth degree of the key we are in."
    ],
    respuestaCorrecta: "A dominant chord (V7) outside of the key that prepares the arrival of a specific chord.",
    explicacion: "Secondary dominants are non-diatonic chords that function as the V7 of the target chord, adding tension and color."
  },
  {
    pregunta: "In the key of C Major, what is the secondary dominant that prepares the arrival to Am (vi degree)?",
    opciones: ["Em7", "E7", "A7", "G7"],
    respuestaCorrecta: "E7",
    explicacion: "E7 is the V7 of Am. It replaces the diatonic chord Em to generate the necessary tension before resolving to Am."
  },
  {
    pregunta: "In functional harmonic analysis, how is the A7 chord labeled when it resolves to Dm7 in the key of C Major?",
    opciones: ["V7/V", "II7", "V7/ii", "SubV7/ii"],
    respuestaCorrecta: "V7/ii",
    explicacion: "Since Dm7 is the second degree (ii) of C Major, the A7 acts as the dominant of that second degree (V7/ii)."
  },
  {
    pregunta: "What characteristic defines the resolution of a tritone substitution (SubV7)?",
    opciones: [
      "It resolves by jumping up a perfect fourth.",
      "It resolves by staying on the same bass note.",
      "It resolves by descending a minor second (a semitone) toward the target chord.",
      "It resolves by ascending a whole tone toward the tonic."
    ],
    respuestaCorrecta: "It resolves by descending a minor second (a semitone) toward the target chord.",
    explicacion: "Tritone substitution allows the bass to descend chromatically by a half-step, creating a very smooth resolution (e.g., Db7 to Cmaj7)."
  },
  {
    pregunta: "If we want to replace the main dominant (G7) with its tritone substitute in a C Major progression, which chord do we use?",
    opciones: ["D7", "Ab7", "F#7", "Db7"],
    respuestaCorrecta: "Db7",
    explicacion: "Db7 is a tritone (augmented fourth) away from G7, and it resolves by descending a semitone toward Cmaj7."
  },
  {
    pregunta: "Which mode is ideal for playing over a tritone substitution to provide a tense and bright color?",
    opciones: ["Dorian Mode", "Lydian Dominant Mode", "Superlocrian Mode", "Classic Mixolydian Mode"],
    respuestaCorrecta: "Lydian Dominant Mode",
    explicacion: "The Lydian dominant mode reinforces the character of the tritone chord thanks to its augmented fourth and minor seventh."
  },
  {
    pregunta: "What is the main harmonic difference between a progression with secondary dominants and one with tritone substitutions?",
    opciones: [
      "Secondary dominants use minor chords, tritone substitutions use major chords.",
      "Secondary dominants move by fourth jumps, tritone substitutions generate chromatic descending bass lines.",
      "Secondary dominants are only used in jazz, tritone substitutions in pop.",
      "There is no difference, they sound exactly the same."
    ],
    respuestaCorrecta: "Secondary dominants move by fourth jumps, tritone substitutions generate chromatic descending bass lines.",
    explicacion: "While a cycle of secondary dominants jumps in fourths (e.g., E7 - A7 - D7), tritone substitutions descend by semitones (Eb7 - Dm7)."
  },
  {
    pregunta: "In the classic II - V - I progression (Dm7 - G7 - Cmaj7), what does it become when applying the tritone substitution to the dominant?",
    opciones: ["Dm7 - D7 - Cmaj7", "Dm7 - Db7 - Cmaj7", "D7 - G7 - Cmaj7", "Db7 - G7 - Cmaj7"],
    respuestaCorrecta: "Dm7 - Db7 - Cmaj7",
    explicacion: "The G7 is replaced by Db7, creating a descending, chromatic bass movement: D - Db - C."
  },
  {
    pregunta: "In the tritone reharmonization of the \"Mack the Knife\" case study, the Eb7 chord is used to go to Dm7. How is this Eb7 labeled?",
    opciones: ["V7/ii", "SubV7/ii", "III7", "SubV7/I"],
    respuestaCorrecta: "SubV7/ii",
    explicacion: "Eb7 is a semitone above Dm7, therefore, it is the tritone substitute of the dominant of the second degree (SubV7/ii)."
  },
  {
    pregunta: "What is the main purpose of using these reharmonization tools in a composition?",
    opciones: [
      "To make the song easier to play.",
      "To eliminate the harmonic tension of the original progression.",
      "To provide new options for color, sophistication, and less predictable dynamic movement.",
      "To ensure the song uses strictly diatonic chords."
    ],
    respuestaCorrecta: "To provide new options for color, sophistication, and less predictable dynamic movement.",
    explicacion: "Both secondary and tritone chords enrich the harmony, break linearity, and offer new paths toward resolution."
  }
];

export default function QuizCapitulo10En() {
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