"use client";

import { QUEENCARD_LYRICS, LyricLine, WordData } from "@/lib/lyrics-data";
import { useState } from "react";
import { LearningCard } from "./LearningCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LyricDecoder() {
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);

  // In a real app, we would sync this with the YouTube player time
  const activeLineId = "l1";

  const handleWordClick = (wordData: WordData) => {
    setSelectedWord(wordData);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Left: Video Player */}
      <div className="w-full lg:w-1/2 bg-black relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Placeholder for YouTube Embed */}
        <div className="w-full aspect-video max-w-2xl mx-auto px-4">
           <iframe 
             width="100%" 
             height="100%" 
             src="https://www.youtube.com/embed/7HDeem-JaSY?si=example" 
             title="YouTube video player" 
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
             allowFullScreen
             className="rounded-xl shadow-2xl border border-white/10"
           />
        </div>
        
        {/* Mobile-only overlay hint */}
        <div className="absolute bottom-4 text-center w-full text-gray-400 text-sm lg:hidden">
          Scroll down for lyrics
        </div>
      </div>

      {/* Right: Interactive Lyrics */}
      <div className="w-full lg:w-1/2 bg-[#120024] relative overflow-y-auto custom-scrollbar">
        <div className="p-8 pb-32 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Queencard</h2>
            <p className="text-idle-pink font-medium">I-DLE</p>
          </div>

          {QUEENCARD_LYRICS.map((line) => (
            <LyricLineItem 
              key={line.id} 
              line={line} 
              isActive={activeLineId === line.id}
              onWordClick={handleWordClick}
            />
          ))}
        </div>
      </div>

      {/* Learning Card Modal */}
      <AnimatePresence>
        {selectedWord && (
          <LearningCard 
            wordData={selectedWord} 
            onClose={() => setSelectedWord(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LyricLineItem({ line, isActive, onWordClick }: { line: LyricLine, isActive: boolean, onWordClick: (w: WordData) => void }) {
  // Split text by spaces to find keywords
  // This is a simplified approach. For production, a more robust tokenization is needed.
  // We will iterate through the keyWords map to find matches in the string.
  
  const renderText = () => {
    if (!line.keyWords) return <span className="text-gray-300">{line.text}</span>;

    let parts: (string | React.ReactNode)[] = [line.text];

    Object.values(line.keyWords).forEach((wordData) => {
      const word = wordData.word;
      // Regex to find the word case-insensitive
      const regex = new RegExp(`(${word})`, 'gi');
      
      const newParts: (string | React.ReactNode)[] = [];
      
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }

        const split = part.split(regex);
        split.forEach((s, i) => {
           if (s.toLowerCase() === word.toLowerCase()) {
             newParts.push(
               <button
                 key={`${line.id}-${word}-${i}`}
                 onClick={() => onWordClick(wordData)}
                 className="inline-block px-1 mx-0.5 rounded bg-idle-pink/20 text-idle-pink border border-idle-pink/50 hover:bg-idle-pink hover:text-white transition-all duration-300 font-bold cursor-pointer animate-pulse-slow"
               >
                 {s}
               </button>
             );
           } else if (s) {
             newParts.push(s);
           }
        });
      });
      parts = newParts;
    });

    return <span className="text-gray-300">{parts}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1.05 : 1 }}
      className={cn(
        "py-4 px-6 rounded-xl transition-all duration-500 border border-transparent",
        isActive ? "bg-white/5 border-idle-purple/50 shadow-lg" : "hover:bg-white/5"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{line.speaker}</span>
        <span className="text-xs font-mono text-gray-600">{formatTime(line.timestamp)}</span>
      </div>
      <p className="text-lg md:text-xl leading-relaxed">
        {renderText()}
      </p>
    </motion.div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
