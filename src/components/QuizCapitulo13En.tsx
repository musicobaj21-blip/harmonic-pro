import React, { useState } from 'react';

const quizData = [
  {
    pregunta: "What is the fundamental concept of modal interchange?",
    opciones: [
      "Permanently changing the song's key",
      "Borrowing chords from parallel modes that share the same tonic",
      "Altering all notes of the major scale",
      "Using secondary dominants"
    ],
    respuestaCorrecta: "Borrowing chords from parallel modes that share the same tonic",
    explicacion: "Modal interchange consists of borrowing chords from parallel modes (e.g., from C Aeolian to use in C Major) without changing the tonic (the tonal center remains C)."
  },
  {
    pregunta: "If our main key is C major, which of the following is a valid \"parallel mode\" for modal interchange?",
    opciones: [
      "A natural minor",
      "G mixolydian",
      "C aeolian",
      "D dorian"
    ],
    respuestaCorrecta: "C aeolian",
    explicacion: "Parallel modes are those that share the same tonic. C aeolian is a parallel mode of C major."
  },
  {
    pregunta: "In the classic progression Cmaj7 - Fmaj7 - Fm7 - Cmaj7, from which parallel mode is the Fm7 (IVm7) usually borrowed?",
    opciones: [
      "C Lydian",
      "C Mixolydian",
      "C Aeolian or C Phrygian",
      "C Dorian"
    ],
    respuestaCorrecta: "C Aeolian or C Phrygian",
    explicacion: "The Fm7 chord contains the notes F, Ab, C, Eb. The Ab (b6) and Eb (b3) come from parallel minor modes such as Aeolian or Phrygian."
  },
  {
    pregunta: "What sonic and technical effect does replacing the major IV with the minor IV (Fmaj7 to Fm7) produce in jazz, as seen in \"All of Me\"?",
    opciones: [
      "Extreme dissonance",
      "A modulation to another key",
      "A smooth chromatic voice leading (A -> Ab -> G)",
      "A sharp melodic jump"
    ],
    respuestaCorrecta: "A smooth chromatic voice leading (A -> Ab -> G)",
    explicacion: "Moving from Fmaj7 to Fm7 and then to Cmaj7 creates a descending chromatic melodic movement very characteristic of jazz: A (third of F) -> Ab (minor third of Fm) -> G (fifth of C)."
  },
  {
    pregunta: "The \"epic\" progression Cmaj7 - Abmaj7 - Bbmaj7 - Cmaj7 uses borrowed chords very common in rock and cinema. Which degrees do Abmaj7 and Bbmaj7 represent?",
    opciones: [
      "II and V",
      "bVImaj7 and bVIImaj7",
      "bIImaj7 and bIIImaj7",
      "IV and Vm"
    ],
    respuestaCorrecta: "bVImaj7 and bVIImaj7",
    explicacion: "In C major, Abmaj7 is the bVImaj7 and Bbmaj7 is the bVIImaj7, both commonly borrowed from the Aeolian mode."
  },
  {
    pregunta: "What modal degree does the dark and dramatic Dbmaj7 chord represent when played in the key of C major?",
    opciones: [
      "bIImaj7 (Phrygian/Locrian)",
      "bIIImaj7 (Dorian)",
      "bVImaj7 (Aeolian)",
      "VIImaj7 (Lydian)"
    ],
    respuestaCorrecta: "bIImaj7 (Phrygian/Locrian)",
    explicacion: "The Dbmaj7 in C is the bIImaj7, characteristic of the Phrygian or Locrian mode, providing an exotic and dramatic sonority."
  },
  {
    pregunta: "What is the main difference between modal interchange and modulation?",
    opciones: [
      "Interchange uses minor chords and modulation uses major ones",
      "Modal interchange maintains the original tonic and modulation establishes a new tonal center",
      "They are exactly the same",
      "Modulation does not allow the use of sevenths"
    ],
    respuestaCorrecta: "Modal interchange maintains the original tonic and modulation establishes a new tonal center",
    explicacion: "In modal interchange, we still feel the original tonic (e.g., C). In modulation, the gravitational center changes definitively to another key."
  },
  {
    pregunta: "If we play the progression Cmaj7 - D7 - Fmaj7 - Cmaj7, from which parallel mode does the D7 (II7) chord contribute its bright color?",
    opciones: [
      "C Phrygian",
      "C Aeolian",
      "C Lydian",
      "C Locrian"
    ],
    respuestaCorrecta: "C Lydian",
    explicacion: "The D7 chord in C major (II7) contains the F# note (the #11 of C major), the main characteristic of the Lydian mode."
  },
  {
    pregunta: "When analyzing \"Creep\" in C major (C - E - F - Fm), we saw that the E major chord is NOT a modal interchange. What harmonic function does it fulfill?",
    opciones: [
      "Secondary dominant (V of VI)",
      "Passing diminished chord",
      "Tritone substitute",
      "Diatonic chord"
    ],
    respuestaCorrecta: "Secondary dominant (V of VI)",
    explicacion: "The E major (III major) acts as a secondary dominant (V/VI) pointing towards Am, although in the song there is a deceptive resolution towards F."
  },
  {
    pregunta: "What is the key to using modal interchange successfully without confusing the listener?",
    opciones: [
      "Using all the chords from the table at the same time",
      "Changing the tonic every measure",
      "Not using too many borrowed chords at once so as not to lose the sense of the tonic",
      "Playing only triads"
    ],
    respuestaCorrecta: "Not using too many borrowed chords at once so as not to lose the sense of the tonic",
    explicacion: "An excess of borrowed chords can destroy the sense of tonality and make the music sound erratic. The progression must always be anchored to the tonic."
  }
];

export default function QuizCapitulo13En() {
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
        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm">
          Question {currentQuestion + 1} of {quizData.length}
        </span>
      </div>

      <div className="bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-xl text-white mb-6">
          {quizData[currentQuestion].pregunta}
        </h3>

        <div className="flex flex-col gap-3">
          {quizData[currentQuestion].opciones.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerClick(option)}
              className="w-full text-left p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:bg-slate-700/60 text-slate-300 transition-colors focus:outline-none"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}