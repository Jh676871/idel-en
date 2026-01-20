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
        <div className="absolute inset-0 bg-gradient-to-r from-idle-pink via-purple-500 to-idle-gold rounded-full blur opacity-75 group-hover:opacity-100 group-hover:blur-md transition-all duration-300 animate-pulse" />
        <div className="relative bg-black rounded-full px-8 py-4 border border-white/20 flex items-center space-x-3 group-hover:bg-black/80 transition-colors">
          <Sparkles className="w-6 h-6 text-idle-gold animate-spin-slow" />
          <span className="text-xl font-bold font-orbitron text-white tracking-wider uppercase">
            Start Mission
          </span>
          <Sparkles className="w-6 h-6 text-idle-gold animate-spin-slow" />
        </div>
      </motion.button>
    </section>
  );
}
