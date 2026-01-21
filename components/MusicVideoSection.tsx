"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function MusicVideoSection() {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative aspect-video w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-idle-pink/80 transition-colors duration-300"
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </motion.button>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-2xl font-bold font-orbitron text-white">最新任務簡報</h3>
          <p className="text-gray-300">先看 I-DLE 的專屬開場影片，暖身一下</p>
        </div>

        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            backgroundPosition: "center",
          }}
        />
      </motion.div>
    </section>
  );
}
