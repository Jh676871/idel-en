"use client";

import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useLearning } from "@/context/LearningContext";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { currentMission } = useLearning();

  return (
    <main className="min-h-screen bg-idle-purple text-white relative overflow-hidden">
        <Navbar />
        
        {/* Background Elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto h-screen flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
            >
                <h1 className="text-3xl font-bold font-orbitron mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    專訪陪練室
                </h1>
                <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                    雨琦正在準備紐約專訪，快幫她練習英文，給她力量！🦒
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 min-h-0"
            >
                <ChatInterface mission={currentMission} />
            </motion.div>
        </div>
    </main>
  );
}
