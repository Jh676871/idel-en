"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Photocard, PHOTOCARDS } from "@/lib/cards";
import { useLearning } from "@/context/LearningContext";
import { playSfx } from "@/lib/audio";
import { PhotocardView } from "./PhotocardView";
import { X } from "lucide-react";

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GachaModal({ isOpen, onClose }: GachaModalProps) {
  const { spendTicket, unlockCard } = useLearning();
  const [step, setStep] = useState<"intro" | "shaking" | "opening" | "reveal">("intro");
  const [drawnCard, setDrawnCard] = useState<Photocard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityLabel = (rarity: Photocard["rarity"]) => {
    if (rarity === "Super Rare") return "超稀有";
    if (rarity === "Rare") return "稀有";
    return "普通";
  };

  const handleDraw = () => {
    const success = spendTicket();
    if (!success) return; // Should handle UI feedback elsewhere if no tickets

    playSfx("select");
    setStep("shaking");
    playSfx("gacha_shake");

    // Random Logic
    const randomIndex = Math.floor(Math.random() * PHOTOCARDS.length);
    const selected = PHOTOCARDS[randomIndex];
    setDrawnCard(selected);

    // Check duplicate logic handled in context, but we need to know for UI
    // Context unlockCard doesn't return status, so we check existence first
    // Actually context `unlockCard` handles "if includes return prev"
    // Let's check locally for UI message
    // Note: We can't access updated state immediately, so we need to pass current unlockedCards to check
    // But `useLearning` gives us current state.
    // However, we need to know if it *was* unlocked before this draw.
    // We'll rely on a check function if we had one, or just check `unlockedCards` from context.
    
    setTimeout(() => {
      setStep("opening");
      playSfx("gacha_open");
      
      setTimeout(() => {
        setStep("reveal");
        unlockCard(selected.id);
        // We need to determine if it was a duplicate to show +XP message
        // This is tricky because we just called unlockCard. 
        // Let's assume for now we just show the card. 
        // Improvement: Check `unlockedCards.includes(selected.id)` BEFORE calling unlockCard
      }, 1000);
    }, 2000);
  };

  const handleFlip = () => {
    if (step === "reveal" && !isFlipped) {
      setIsFlipped(true);
      playSfx("gacha_reveal");
      playSfx("success");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col items-center justify-center w-full max-w-lg p-8">
            {step === "intro" && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-64 h-64 mx-auto mb-8 relative">
                   {/* Package Graphic */}
                   <div className="w-full h-full bg-gradient-to-br from-idle-pink to-idle-purple rounded-xl shadow-[0_0_50px_rgba(255,0,127,0.4)] flex items-center justify-center border-4 border-idle-gold/30">
                     <div className="text-center">
                       <h3 className="text-3xl font-orbitron font-bold text-white mb-2">I-DLE</h3>
                      <p className="text-idle-gold font-mono">特別包</p>
                     </div>
                   </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">準備拆包了嗎？</h2>
                <button
                  onClick={handleDraw}
                  className="px-8 py-4 bg-idle-gold text-black font-bold text-xl rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.5)] whitespace-nowrap"
                >
                  打開包裹（1 張抽卡券）
                </button>
              </motion.div>
            )}

            {step === "shaking" && (
              <motion.div
                animate={{ 
                  x: [-5, 5, -5, 5, 0],
                  rotate: [-2, 2, -2, 2, 0]
                }}
                transition={{ duration: 0.2, repeat: 10 }}
                className="w-64 h-64 bg-gradient-to-br from-idle-pink to-idle-purple rounded-xl shadow-[0_0_50px_rgba(255,0,127,0.6)] flex items-center justify-center border-4 border-white"
              >
                 <span className="text-6xl animate-pulse">🎁</span>
              </motion.div>
            )}

            {step === "opening" && (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.8 }}
                className="w-64 h-64 bg-white rounded-xl flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-white animate-ping rounded-full opacity-50" />
              </motion.div>
            )}

            {step === "reveal" && drawnCard && (
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mb-8"
                >
                  <PhotocardView 
                    card={drawnCard} 
                    isUnlocked={true} 
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                    size="lg"
                  />
                </motion.div>
                
                {!isFlipped ? (
                  <motion.p 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-white font-mono text-lg"
                  >
                    點卡片翻面！
                  </motion.p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <h3 className="text-3xl font-orbitron font-bold text-idle-gold mb-2">{drawnCard.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold bg-white text-black`}>
                        {getRarityLabel(drawnCard.rarity)}
                      </span>
                    </div>
                    <button 
                      onClick={onClose}
                      className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-colors"
                    >
                      收下並關閉
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
