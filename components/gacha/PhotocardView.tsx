import { motion } from "framer-motion";
import { Photocard, getRarityColor } from "@/lib/cards";
import { Lock } from "lucide-react";

interface PhotocardProps {
  card: Photocard;
  isUnlocked: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  size?: "sm" | "md" | "lg";
}

export function PhotocardView({ card, isUnlocked, isFlipped = false, onFlip, size = "md" }: PhotocardProps) {
  const width = size === "sm" ? 120 : size === "md" ? 200 : 300;
  const height = width * 1.5;

  return (
    <div 
      className="relative perspective-1000 cursor-pointer group"
      style={{ width, height }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-700"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card (The Back Design or Locked State) */}
        <div 
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-xl border-2 border-white/10 bg-gradient-to-br from-[#2a0044] to-[#1a0033] flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {isUnlocked ? (
            // Unlocked but face down (Back Design)
            <div className="w-full h-full flex flex-col items-center justify-center bg-[url('/assets/images/card-back-pattern.png')] bg-cover">
               <div className="w-16 h-16 rounded-full border-2 border-idle-gold/50 flex items-center justify-center">
                 <span className="font-orbitron font-bold text-idle-gold text-xl">NVRLND</span>
               </div>
            </div>
          ) : (
            // Locked State
            <div className="flex flex-col items-center gap-2 opacity-50">
              <Lock className="w-8 h-8 text-gray-400" />
              <span className="text-xs font-mono text-gray-400">LOCKED</span>
            </div>
          )}
        </div>

        {/* Back of Card (The Actual Photo - revealed when flipped) */}
        <div 
          className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl border-2 ${isUnlocked ? "border-white/20" : "border-gray-700"}`}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          {isUnlocked ? (
            <>
              {/* Card Image */}
              <div className="relative w-full h-full bg-gray-800">
                {/* Fallback to color if image fails (since we don't have real images yet) */}
                <div className={`w-full h-full bg-gradient-to-b ${getRarityColor(card.rarity)} opacity-80`} />
                
                {/* Overlay Details */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-idle-gold text-xs font-bold uppercase tracking-wider">{card.member}</p>
                      <h3 className="text-white font-bold font-orbitron">{card.name}</h3>
                    </div>
                    {card.rarity !== "Common" && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black`}>
                        {card.rarity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shiny Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </>
          ) : (
             // Should not happen if logic is correct, but fallback
             <div className="w-full h-full bg-gray-900" />
          )}
        </div>
      </motion.div>
    </div>
  );
}
