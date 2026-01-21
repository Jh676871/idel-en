"use client";

import { motion } from "framer-motion";
import { GlitchText } from "./GlitchText";

export function Hero() {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-purple-900/40 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-idle-pink/20 rounded-full blur-[100px] -z-20" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-idle-purple/40 rounded-full blur-[80px] -z-20" />

      <div className="flex items-center justify-center">
        <GlitchText text="和 I-DLE 一起閃耀舞台！" />
        <span className="ml-1 text-[#ff007f] drop-shadow-[0_0_12px_rgba(255,0,127,0.8)] flicker-fast">✨</span>
      </div>
      
      <motion.p 
        className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-white/80 max-w-2xl leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        嘿 Neverland！準備好擔任她們的隨行翻譯官了嗎？選擇一位隊友，開啟妳的全球巡迴吧！
      </motion.p>
    </section>
  );
}
