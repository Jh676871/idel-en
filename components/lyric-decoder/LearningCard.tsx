"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, CheckCircle, AlertCircle, Heart } from "lucide-react";
import { useState } from "react";
import { WordData } from "@/lib/lyrics-data";
import { playSfx } from "@/lib/audio";
import { useLearning } from "@/context/LearningContext";
import { cn } from "@/lib/utils";

interface LearningCardProps {
  wordData: WordData;
  onClose: () => void;
}

export function LearningCard({ wordData, onClose }: LearningCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const { addWord, isSaved } = useLearning();

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(wordData.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    if (userAnswer.trim().toLowerCase() === wordData.challenge.answer.toLowerCase()) {
      setFeedback('correct');
      playSfx('success');
    } else {
      setFeedback('incorrect');
    }
  };

  const handleSave = () => {
    addWord({
      word: wordData.word,
      phonetic: wordData.phonetic,
      meaning: wordData.definitionEn,
      example: wordData.challenge.sentence,
      sourceId: "queencard-lyrics"
    });
    playSfx('success');
  };

  const saved = isSaved(wordData.word);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#1a0033] border border-idle-pink/50 rounded-2xl shadow-[0_0_30px_rgba(255,0,127,0.3)] overflow-hidden">
        {/* Decorative header */}
        <div className="h-2 bg-gradient-to-r from-idle-pink via-idle-gold to-idle-pink" />
        
        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Word Header */}
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-4xl font-bold font-orbitron text-white mb-2 tracking-wider">
              {wordData.word}
            </h2>
            <div className="flex items-center space-x-3 text-gray-300">
              <span className="font-mono text-lg text-idle-gold">{wordData.phonetic}</span>
              <button 
                onClick={handleSpeak}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Volume2 className="w-5 h-5 text-idle-pink" />
              </button>
            </div>
          </div>

          {/* Definitions */}
          <div className="space-y-4 mb-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">English</span>
              <p className="text-white mt-1">{wordData.definitionEn}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Chinese</span>
              <p className="text-white mt-1">{wordData.definitionCn}</p>
            </div>
          </div>

          {/* Challenge Section */}
          <div className="bg-black/30 p-5 rounded-xl border border-idle-gold/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-idle-gold" />
            <h3 className="text-idle-gold font-bold mb-3 uppercase text-sm tracking-widest flex items-center">
              Mission Challenge
            </h3>
            
            <p className="text-lg text-gray-200 mb-4">
              {wordData.challenge.sentence.split('___').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-24 border-b-2 border-white/30 mx-1 text-center font-bold text-idle-pink">
                       ?
                    </span>
                  )}
                </span>
              ))}
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the missing word..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-idle-pink transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              />
              <button
                onClick={checkAnswer}
                className="bg-idle-pink text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-600 transition-colors"
              >
                Check
              </button>
            </div>

            {/* Feedback Message */}
            <AnimatePresence>
              {feedback !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn(
                    "mt-3 flex items-center space-x-2 text-sm font-bold",
                    feedback === 'correct' ? "text-green-400" : "text-red-400"
                  )}
                >
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Correct! Perfect style!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Try again! You can do it!</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collection Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saved}
              className={cn(
                "flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all duration-300",
                saved 
                  ? "bg-gray-700 text-gray-400 cursor-default"
                  : "bg-gradient-to-r from-idle-purple to-idle-pink text-white hover:scale-105 shadow-lg shadow-purple-500/30"
              )}
            >
              <Heart className={cn("w-5 h-5", saved ? "fill-gray-400" : "fill-white animate-pulse")} />
              <span>{saved ? "Added to Collection" : "Add to My Collection"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
