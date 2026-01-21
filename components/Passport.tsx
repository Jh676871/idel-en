"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, MessageCircle, Star, Ticket, X, Globe, Grid, Sparkles } from "lucide-react";
import { useLearning } from "@/context/LearningContext";
import { GachaModal } from "@/components/gacha/GachaModal";

export function Passport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const passportId = useId().replace(/[:]/g, "").toUpperCase();
  const { progress, tickets } = useLearning();
  const { xp, chatCount, wordBank } = progress;

  // Calculate Level based on XP (e.g., Level 1 = 0-99, Level 2 = 100-199, etc.)
  const level = Math.floor(xp / 100) + 1;
  const progressToNextLevel = xp % 100;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-idle-purple/80 backdrop-blur-md border border-idle-gold/50 rounded-full px-4 py-2 shadow-lg hover:bg-idle-purple hover:border-idle-gold transition-colors group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Globe className="w-5 h-5 text-idle-gold animate-pulse-slow" />
          {tickets > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-idle-pink rounded-full border border-black animate-ping" />
          )}
        </div>
        <span className="font-orbitron text-sm font-bold text-white hidden md:block">
          護照
        </span>
        <div className="h-4 w-[1px] bg-white/20 mx-1 hidden md:block" />
        <span className="text-xs font-mono text-idle-gold hidden md:block">等級 {level}</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-gradient-to-br from-[#1a0033] to-[#2a0044] border border-idle-gold/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-idle-gold/10 p-6 flex justify-between items-start border-b border-idle-gold/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-idle-purple rounded-full border-2 border-idle-gold flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                    <Globe className="w-8 h-8 text-idle-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-bold text-white">NEVERLAND</h2>
                    <p className="text-idle-gold font-mono text-sm tracking-widest">官方護照</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="p-6 space-y-6">
                {/* XP & Level Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">經驗值</span>
                    <span className="text-idle-gold font-bold">{xp} XP</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNextLevel}%` }}
                      className="h-full bg-gradient-to-r from-idle-pink to-idle-gold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    距離等級 {level + 1} 還差 {100 - progressToNextLevel} XP
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Book className="w-6 h-6 text-idle-pink" />
                    <span className="text-2xl font-bold text-white">{wordBank.length}</span>
                    <span className="text-xs text-gray-400">已掌握單字</span>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{chatCount}</span>
                    <span className="text-xs text-gray-400">完成陪練</span>
                  </div>
                </div>

                {/* Ticket Section */}
                <div className="bg-gradient-to-r from-idle-pink/20 to-idle-purple/20 p-4 rounded-xl border border-idle-pink/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-idle-pink/20 rounded-lg">
                      <Ticket className="w-6 h-6 text-idle-pink" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">抽卡券</h4>
                      <p className="text-xs text-gray-400">每累積 50 XP 獲得 1 張</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-idle-gold">{tickets}</span>
                    <Star className="w-4 h-4 text-idle-gold fill-idle-gold" />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <a 
                     href="/binder"
                     className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                   >
                     <Grid className="w-4 h-4 text-white" />
                     <span className="font-bold text-white text-sm">寶藏盒</span>
                   </a>
                   <button
                     onClick={() => {
                        setIsOpen(false);
                        setIsGachaOpen(true);
                     }}
                     disabled={tickets === 0}
                     className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
                        tickets > 0 
                        ? "bg-idle-gold hover:bg-white text-black shadow-lg shadow-idle-gold/20" 
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                     }`}
                   >
                     <Sparkles className="w-4 h-4" />
                     <span className="font-bold text-sm">抽一張</span>
                   </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-black/20 p-4 text-center border-t border-white/5">
                <p className="text-xs text-gray-500 font-mono">護照編號：{passportId}-NVRLND</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GachaModal isOpen={isGachaOpen} onClose={() => setIsGachaOpen(false)} />
    </>
  );
}
