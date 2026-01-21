"use client";

import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Volume2, Sparkles, BookOpen } from "lucide-react";

function CollectionContent() {
  const { wordBank, removeWord } = useLearning();

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-idle-gold to-white bg-clip-text text-transparent inline-flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-idle-gold" />
          我的強大單字庫
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          妳已經收集了 <span className="text-idle-pink font-bold">{wordBank.length}</span> 個讓妳更接近 I-DLE 的咒語！
        </p>
      </motion.div>

      {wordBank.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm"
        >
            <div className="w-24 h-24 rounded-full bg-idle-purple/50 flex items-center justify-center mb-6 animate-pulse">
                <Sparkles className="w-12 h-12 text-idle-gold" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">靈魂單字本還空空的</h3>
            <p className="text-gray-400 mb-6">去「歌詞解碼」把亮起來的單字收進來，翻譯官小助手！</p>
            <a href="/lyrics" className="px-8 py-3 bg-idle-pink text-white rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20">
                立刻去收集 🎵
            </a>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wordBank.map((item) => (
              <motion.div
                key={item.word}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className={
                  item.masteryLevel === 5
                    ? "bg-gradient-to-br from-idle-gold/30 via-black/40 to-idle-pink/20 backdrop-blur-md border border-idle-gold/40 rounded-xl p-6 relative group overflow-hidden"
                    : "bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 relative group overflow-hidden"
                }
              >
                {/* Decorative background glow */}
                <div
                  className={
                    item.masteryLevel === 5
                      ? "absolute -top-10 -right-10 w-32 h-32 bg-idle-gold/40 rounded-full blur-3xl transition-colors duration-500"
                      : "absolute -top-10 -right-10 w-32 h-32 bg-idle-purple/30 rounded-full blur-3xl group-hover:bg-idle-pink/30 transition-colors duration-500"
                  }
                />

                {item.masteryLevel === 5 && (
                  <div className="absolute top-4 left-4 px-2 py-1 rounded-full text-[10px] font-bold bg-idle-gold text-black">
                    金卡
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-orbitron">{item.word}</h3>
                    <p className="text-idle-gold font-mono text-sm">{item.phonetic}</p>
                  </div>
                  <button
                    onClick={() => playPronunciation(item.word)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-idle-pink transition-colors"
                    title="聽發音"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-300 text-sm italic">{item.meaning}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono">熟練度</span>
                    <span className={item.masteryLevel === 5 ? "text-idle-gold font-bold" : "text-gray-300"}>
                      {item.masteryLevel}/5
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={item.masteryLevel === 5 ? "h-full bg-idle-gold" : "h-full bg-idle-pink"}
                      style={{ width: `${(item.masteryLevel / 5) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-4 pt-4 border-t border-white/10">
                    <span>加入：{new Date(item.addedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => removeWord(item.word)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      移除
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-idle-purple text-white relative">
      <Navbar />
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10">
          <CollectionContent />
      </div>
    </main>
  );
}
