"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
}

export function GlitchText({ text }: GlitchTextProps) {
  return (
    <motion.h1
      className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-orbitron tracking-wider"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        textShadow:
          "0 0 14px rgba(255, 45, 149, 0.30), 0 0 34px rgba(255, 215, 0, 0.22)",
      }}
    >
      {text}
    </motion.h1>
  );
}
