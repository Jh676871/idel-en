"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import { PhotocardView } from "@/components/gacha/PhotocardView";
import { PHOTOCARDS } from "@/lib/cards";
import { motion } from "framer-motion";
import { Lock, Grid } from "lucide-react";

export default function BinderPage() {
  const { progress } = useLearning();
  const { unlockedCards } = progress;
  const [filter, setFilter] = useState<"All" | "Common" | "Rare" | "Super Rare">("All");

  const filters: Array<{ value: "All" | "Common" | "Rare" | "Super Rare"; label: string }> = [
    { value: "All", label: "全部" },
    { value: "Common", label: "普通" },
    { value: "Rare", label: "稀有" },
    { value: "Super Rare", label: "超稀有" },
  ];

  const getRarityLabel = (rarity: "Common" | "Rare" | "Super Rare") => {
    if (rarity === "Super Rare") return "超稀有";
    if (rarity === "Rare") return "稀有";
    return "普通";
  };

  const filteredCards = PHOTOCARDS.filter(card => 
    filter === "All" ? true : card.rarity === filter
  );

  // Stats
  const totalCards = PHOTOCARDS.length;
  const uniqueUnlocked = PHOTOCARDS.filter(c => unlockedCards.includes(c.id)).length;
  const progressPercent = Math.round((uniqueUnlocked / totalCards) * 100);

  return (
    <main className="min-h-screen bg-[#120024] text-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Texture - Leather Binder Look */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: "url('/assets/images/leather-texture.png')", backgroundSize: '200px' }} />

      <div className="relative z-10 pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-gray-400 mb-2">BINDER</div>
            <h1 className="text-4xl font-orbitron font-bold text-white mb-2 flex items-center gap-3">
              <Grid className="w-8 h-8 text-idle-gold" />
              寶藏盒
            </h1>
            <p className="text-gray-400">
              集滿 {totalCards} 張，就能成為最強 Neverland。
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-idle-pink font-mono">
              {uniqueUnlocked} / {totalCards}
            </div>
            <div className="w-48 h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-idle-pink to-idle-gold transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                filter === f.value 
                  ? "bg-idle-gold text-black shadow-[0_0_10px_rgba(255,215,0,0.3)]" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {filteredCards.map((card, index) => {
            const isUnlocked = unlockedCards.includes(card.id);
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div className={`transition-all duration-300 ${!isUnlocked ? "grayscale opacity-60" : "hover:scale-105"}`}>
                  <PhotocardView 
                    card={card} 
                    isUnlocked={isUnlocked} 
                    isFlipped={isUnlocked} // Show face up if unlocked in binder
                    size="md"
                  />
                  
                  {/* Status Label */}
                  <div className="mt-3 text-center">
                    {isUnlocked ? (
                      <div className="flex flex-col items-center">
                        <span className="text-white font-bold text-sm">{card.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 ${
                          card.rarity === "Super Rare" ? "bg-gradient-to-r from-idle-gold to-white text-black" :
                          card.rarity === "Rare" ? "bg-idle-pink text-white" :
                          "bg-gray-700 text-gray-300"
                        }`}>
                          {getRarityLabel(card.rarity)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-gray-500 text-sm">
                        <Lock className="w-3 h-3" />
                        <span>未解鎖</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
