"use client";

import { motion } from "framer-motion";

interface GlitchTextProps {
  text: string;
}

export function GlitchText({ text }: GlitchTextProps) {
  return (
    <div className="relative inline-block group">
      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-orbitron tracking-wider relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {text}
      </motion.h1>
      
      <motion.span 
        className="absolute top-0 left-0 -z-10 w-full h-full text-4xl md:text-6xl lg:text-7xl font-bold text-idle-pink font-orbitron select-none opacity-70"
        animate={{ 
          x: [0, -2, 2, -1, 0],
          y: [0, 1, -1, 2, 0],
          opacity: [0.7, 0.4, 0.7]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
          repeatType: "reverse",
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 1]
        }}
      >
        {text}
      </motion.span>
      
      <motion.span 
        className="absolute top-0 left-0 -z-10 w-full h-full text-4xl md:text-6xl lg:text-7xl font-bold text-idle-gold font-orbitron select-none opacity-70"
        animate={{ 
          x: [0, 2, -2, 1, 0],
          y: [0, -1, 1, -2, 0],
          opacity: [0.7, 0.4, 0.7]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 2.5,
          repeatType: "reverse",
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 1]
        }}
      >
        {text}
      </motion.span>
    </div>
  );
}
