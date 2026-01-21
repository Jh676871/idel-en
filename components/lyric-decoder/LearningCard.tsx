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
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="pointer-events-auto relative w-full max-w-lg bg-[#1a0033] border-t-2 border-idle-pink/50 rounded-t-3xl shadow-[0_-10px_40px_rgba(255,0,127,0.3)] overflow-hidden"
      >
        {/* Decorative header */}
        <div className="h-2 bg-gradient-to-r from-idle-pink via-idle-gold to-idle-pink" />
        
        <div className="p-8 pb-12">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Word Header */}
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-5xl font-bold font-orbitron text-white mb-3 tracking-wider glitch-text">
              {wordData.word}
            </h2>
            <div className="flex items-center space-x-4 text-gray-300">
              <span className="font-mono text-xl text-idle-gold">{wordData.phonetic}</span>
              <button 
                onClick={handleSpeak}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 group"
              >
                <Volume2 className="w-5 h-5 text-idle-pink group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-white">Listen</span>
              </button>
            </div>
          </div>

          {/* Definitions Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/40 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-xs uppercase text-idle-pink font-bold tracking-widest mb-2 block">ENGLISH</span>
              <p className="text-white leading-relaxed">{wordData.definitionEn}</p>
            </div>
            <div className="bg-black/40 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-xs uppercase text-idle-pink font-bold tracking-widest mb-2 block">CHINESE</span>
              <p className="text-white leading-relaxed font-noto-sans-tc">{wordData.definitionCn}</p>
            </div>
          </div>

          {/* Idol Private Example */}
          {wordData.idolExample && (
            <div className="mb-8 relative overflow-hidden rounded-2xl border border-idle-gold/30 bg-gradient-to-r from-idle-gold/10 to-transparent p-6">
              <div className="absolute top-0 left-0 w-1 h-full bg-idle-gold" />
              <div className="flex gap-4">
                 <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-idle-gold">
                   {/* Placeholder for Member Avatar - could be dynamic based on speaker name in example */}
                   <div className="w-full h-full bg-idle-gold/50 flex items-center justify-center text-xs font-bold">IDLE</div>
                 </div>
                 <div>
                   <span className="text-xs uppercase text-idle-gold font-bold tracking-widest mb-1 block">IDOL PRIVATE TALK</span>
                   <p className="text-white italic text-lg">"{wordData.idolExample.split('"')[1]}"</p>
                   <p className="text-gray-400 text-sm mt-1">- {wordData.idolExample.split(':')[0]}</p>
                 </div>
              </div>
            </div>
          )}

          {/* Simulated Recording Button */}
          <div className="flex justify-center mb-8">
             <button className="flex flex-col items-center gap-2 group">
               <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-idle-pink/50 flex items-center justify-center group-hover:bg-idle-pink/20 group-hover:scale-110 transition-all cursor-pointer">
                 <div className="w-8 h-8 rounded-full bg-idle-pink animate-pulse" />
               </div>
               <span className="text-xs text-gray-400 uppercase tracking-widest group-hover:text-white">Tap to Record</span>
             </button>
          </div>

          {/* Challenge Section */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-idle-pink font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-idle-pink" />
              NEVERLAND CHALLENGE
            </h3>
            
            <div className="mb-6 text-lg text-white font-medium text-center">
              "{wordData.challenge.sentence.split(wordData.challenge.answer).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[80px] border-b-2 border-white/30 mx-2 text-idle-pink font-bold">
                       {feedback === 'correct' ? wordData.challenge.answer : '_____'}
                    </span>
                  )}
                </span>
              ))}"
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the missing word..."
                className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-idle-pink focus:outline-none transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              />
              <button
                onClick={checkAnswer}
                disabled={feedback === 'correct'}
                className="bg-idle-pink hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              >
                {feedback === 'correct' ? <CheckCircle /> : 'Check'}
              </button>
            </div>
            
            {feedback === 'incorrect' && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-3 text-red-400 flex items-center gap-2 text-sm justify-center"
               >
                 <AlertCircle size={14} /> Try again!
               </motion.div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saved}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105",
                saved 
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-white text-black hover:bg-gray-200"
              )}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} />
                  Saved to Binder
                </>
              ) : (
                <>
                  <Heart size={18} className={cn("text-idle-pink fill-current")} />
                  Save to Binder
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
