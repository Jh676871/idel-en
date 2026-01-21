"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
}

export function GlitchText({ text }: GlitchTextProps) {
  const parts = text.split("I-DLE");

  return (
    <motion.h1
      className="glitch text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-black tracking-[-0.08em] text-white"
      data-text={text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {parts[0]}
      {parts.length > 1 && (
        <span className="glitch-rgb" data-text="I-DLE">
          I-DLE
        </span>
      )}
      {parts.slice(1).join("I-DLE")}
    </motion.h1>
  );
}
