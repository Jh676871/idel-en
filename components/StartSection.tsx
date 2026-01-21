"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function StartSection() {
  return (
    <section className="py-20 flex justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-idle-purple via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative group px-8 py-4 bg-transparent"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-idle-pink via-purple-500 to-idle-gold rounded-full blur-md opacity-90 group-hover:opacity-100 group-hover:blur-xl transition-all duration-300 animate-pulse" />
        <div className="relative bg-black/80 rounded-full px-8 py-4 border border-white/25 flex items-center space-x-3 group-hover:bg-black/85 transition-colors shadow-[0_0_45px_rgba(255,0,127,0.25)] group-hover:shadow-[0_0_60px_rgba(255,0,127,0.35)]">
          <Sparkles className="w-6 h-6 text-idle-gold animate-spin-slow" />
          <span className="flex flex-col items-center leading-none">
            <span className="text-xl font-bold font-orbitron text-white tracking-wider uppercase whitespace-nowrap">START WORLD TOUR</span>
            <span className="text-[11px] text-gray-300 whitespace-nowrap">開始巡迴挑戰</span>
          </span>
          <Sparkles className="w-6 h-6 text-idle-gold animate-spin-slow" />
        </div>
      </motion.button>
    </section>
  );
}
