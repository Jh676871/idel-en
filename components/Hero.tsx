"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative h-[85svh] sm:min-h-[calc(100svh-4rem)] md:min-h-[70vh] flex flex-col items-center justify-around md:justify-center text-center px-4 overflow-hidden pt-6 pb-4 md:pt-12 md:pb-10">
      <div className="absolute inset-0 -z-30 bg-center bg-cover bg-no-repeat opacity-35 md:opacity-30 bg-[url('/assets/images/backgrounds/bg_mobile.webp')] md:bg-[url('/assets/images/backgrounds/bg_desktop.webp')]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-purple-900/40 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-idle-pink/20 rounded-full blur-[100px] -z-20" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-idle-purple/40 rounded-full blur-[80px] -z-20" />

      <div className="w-full max-w-3xl mt-10 sm:mt-8 md:mt-0 md:-mt-6">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-orbitron font-black text-white tracking-[-0.08em] leading-[0.92] text-[clamp(3rem,9vw,4.25rem)] sm:text-6xl md:text-7xl lg:text-8xl transform-gpu skew-y-[-3deg]"
        >
          <span
            className="glitch glitch-hero whitespace-pre-line md:whitespace-nowrap"
            data-text={"和 I-DLE 一起\n閃耀舞台！✨"}
          >
            和 <span className="glitch-rgb" data-text="I-DLE">I-DLE</span> 一起
            <br className="block md:hidden" />
            閃耀<span className="whitespace-nowrap">舞台</span>！
            <span className="ml-2 inline-block text-[#ff007f] drop-shadow-[0_0_14px_rgba(255,0,127,0.9)] flicker-fast">✨</span>
          </span>
        </motion.h1>

        <motion.div
          className="relative w-full max-w-xl mx-auto mt-3 md:mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[170px] sm:h-[220px] w-[min(520px,120%)] sm:w-[min(560px,120%)] blur-2xl opacity-95 bg-[radial-gradient(closest-side,rgba(0,0,0,0.72),rgba(0,0,0,0.0)_72%)]" />

          <div className="neon-breathe text-[clamp(1.1rem,3.8vw,1.5rem)] sm:text-xl md:text-2xl tracking-widest">
            <div className="font-black text-idle-pink text-shadow-strong drop-shadow-[0_0_18px_rgba(255,0,127,0.22)]">
              嘿 Neverland！
            </div>
            <div className="mt-3 font-light text-white/90 leading-relaxed text-shadow-soft">
              準備好擔任隨行翻譯官了嗎？
            </div>
            <div className="mt-3 font-medium text-white text-shadow-strong drop-shadow-[0_0_14px_rgba(255,0,127,0.18)]">
              開啟妳的全球巡迴吧！
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#members"
        className="mt-3 md:mt-4 text-xs sm:text-sm md:text-base font-orbitron tracking-widest text-white/80 hover:text-white transition-colors"
      >
        選擇妳的專屬拍檔 <span className="ml-1 text-idle-gold flicker-fast">🎤</span>
      </a>
    </section>
  );
}
