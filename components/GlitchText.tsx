"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
}

export function GlitchText({ text }: GlitchTextProps) {
  return (
    <motion.h1
      className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white font-orbitron tracking-wider text-shadow-strong"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {text}
    </motion.h1>
  );
}
