"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { QuizQuestion } from "@/lib/lyrics-data";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { playSfx } from "@/lib/audio";

interface QuizModalProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export function QuizModal({ questions, onComplete }: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    setSelectedOption(option);

    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSfx("success");
      setScore((prev) => prev + 1);
    } else {
      playSfx("error");
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleFinish = () => {
    if (score === questions.length) {
      onComplete();
    } else {
      // Retry
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
      setScore(0);
      setShowResult(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-black/90 border-2 border-idle-pink rounded-3xl p-8 shadow-[0_0_50px_rgba(224,36,94,0.5)]"
      >
        {!showResult ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-orbitron font-bold text-white">
                TOUR CHALLENGE <span className="text-idle-pink">#{currentIndex + 1}</span>
              </h2>
              <div className="text-idle-gold font-mono">
                SCORE: {score}/{questions.length}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl text-white mb-6 font-medium">
                {currentQuestion.question}
              </h3>
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  let buttonClass = "w-full p-4 rounded-xl border border-white/20 text-left transition-all hover:bg-white/10 text-gray-300";
                  
                  if (selectedOption === option) {
                    if (isCorrect) {
                      buttonClass = "w-full p-4 rounded-xl border-2 border-green-500 bg-green-500/20 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                    } else {
                      buttonClass = "w-full p-4 rounded-xl border-2 border-red-500 bg-red-500/20 text-white";
                    }
                  } else if (selectedOption !== null && option === currentQuestion.correctAnswer) {
                     buttonClass = "w-full p-4 rounded-xl border-2 border-green-500 bg-green-500/10 text-white opacity-50";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionClick(option)}
                      className={buttonClass}
                      disabled={selectedOption !== null}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedOption === option && (
                          isCorrect ? <CheckCircle className="text-green-400" /> : <XCircle className="text-red-400" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-idle-pink"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", duration: 1 }}
              className="inline-block mb-6"
            >
              <Trophy size={80} className={score === questions.length ? "text-idle-gold" : "text-gray-500"} />
            </motion.div>
            
            <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
              {score === questions.length ? "MISSION COMPLETE!" : "TRY AGAIN!"}
            </h2>
            
            <p className="text-gray-300 mb-8 text-lg">
              You got <span className="text-idle-pink font-bold">{score}</span> out of {questions.length} correct.
            </p>

            <button
              onClick={handleFinish}
              className="bg-idle-pink hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(224,36,94,0.6)] transition-all hover:scale-105"
            >
              {score === questions.length ? "CLAIM REWARD" : "RETRY CHALLENGE"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
