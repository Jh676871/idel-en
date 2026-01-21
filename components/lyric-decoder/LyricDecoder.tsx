"use client";

import { QUEENCARD_LYRICS, QUEENCARD_QUIZ, LyricLine, WordData } from "@/lib/lyrics-data";
import { useState, useEffect, useRef } from "react";
import { LearningCard } from "./LearningCard";
import { QuizModal } from "./QuizModal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import YouTube, { YouTubeProps } from "react-youtube";
import { GachaModal } from "@/components/gacha/GachaModal";
import { useLearning } from "@/context/LearningContext";

export function LyricDecoder() {
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [isStageClear, setIsStageClear] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const { addTicket } = useLearning();

  // Sync Manager: Track time every 100ms
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && player) {
      interval = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        // Find active line
        const currentLine = QUEENCARD_LYRICS.reduce((prev, curr) => {
          if (curr.timestamp <= time) {
            return curr;
          }
          return prev;
        }, QUEENCARD_LYRICS[0]);

        if (currentLine && currentLine.id !== activeLineId) {
          setActiveLineId(currentLine.id);
        }
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, player, activeLineId]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineId && activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineId]);

  const handleWordClick = (wordData: WordData) => {
    if (player && isPlaying) {
      player.pauseVideo();
    }
    setSelectedWord(wordData);
  };

  const handleCloseCard = () => {
    setSelectedWord(null);
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === 1);
    
    // Video Ended (data === 0)
    if (event.data === 0) {
      handleStageClear();
    }
  };

  const handleStageClear = () => {
    setShowQuiz(true); // Show Quiz first
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
    setIsStageClear(true);
    addTicket(1); // Reward for finishing
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      cc_load_policy: 0, 
      controls: 1,
      modestbranding: 1,
    },
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-black relative">
      {/* Left: Video Player */}
      <div className="w-full lg:w-3/5 relative flex flex-col border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="flex-1 relative bg-black flex items-center justify-center p-4">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-10">
             <YouTube
               videoId="7HDeem-JaSY"
               opts={opts}
               onReady={onPlayerReady}
               onStateChange={onPlayerStateChange}
               className="w-full h-full"
               iframeClassName="w-full h-full"
             />
             
             {/* Mission Accomplished Overlay */}
             <AnimatePresence>
               {isStageClear && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
                 >
                   <motion.h2 
                     initial={{ scale: 0.5, y: 50 }}
                     animate={{ scale: 1, y: 0 }}
                     className="text-4xl md:text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-idle-neon to-purple-400 mb-6 text-center"
                   >
                     STAGE CLEAR!
                   </motion.h2>
                   
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                     className="flex flex-col items-center gap-4"
                   >
                     <p className="text-xl text-white">Reward: 1 Gacha Ticket</p>
                     <button
                       onClick={() => setShowGacha(true)}
                       className="px-8 py-3 bg-idle-pink hover:bg-idle-pink/80 text-white font-bold rounded-full shadow-[0_0_20px_rgba(225,0,152,0.5)] transition-all transform hover:scale-105"
                     >
                       PULL GACHA
                     </button>
                     <button
                       onClick={() => setIsStageClear(false)}
                       className="text-gray-400 hover:text-white text-sm underline"
                     >
                       Replay Stage
                     </button>
                   </motion.div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          <div className="absolute inset-0 bg-idle-neon/5 blur-[100px] pointer-events-none" />
        </div>
        
        <div className="h-16 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-6">
          <div className="text-white/80 font-mono text-sm">
            SYNC: {currentTime.toFixed(2)}s
          </div>
          <div className="flex items-center gap-4">
             <div className="text-idle-pink font-bold font-orbitron">
                {activeLineId ? "ON AIR" : "READY"}
             </div>
             <div className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
          </div>
        </div>
      </div>

      {/* Right: Interactive Lyrics */}
      <div 
        ref={scrollContainerRef}
        className="w-full lg:w-2/5 bg-[#120024] relative overflow-y-auto custom-scrollbar scroll-smooth"
      >
        <div className="p-8 pb-32 space-y-6">
          <div className="text-center mb-8 sticky top-0 bg-[#120024]/90 backdrop-blur-md py-4 z-20 border-b border-white/10">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-1">Queencard</h2>
            <p className="text-idle-pink text-sm font-medium tracking-widest">STAGE MODE</p>
          </div>

          {QUEENCARD_LYRICS.map((line) => {
            const isActive = activeLineId === line.id;
            return (
              <div 
                key={line.id} 
                ref={isActive ? activeLineRef : null}
                className={cn(
                  "transition-all duration-500 transform",
                  isActive ? "scale-105 opacity-100 py-4" : "scale-100 opacity-40 hover:opacity-60"
                )}
              >
                <LyricLineItem 
                  line={line} 
                  isActive={isActive}
                  onWordClick={handleWordClick}
                />
              </div>
            );
          })}
          
          <div className="h-32" /> 
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedWord && (
          <LearningCard 
            wordData={selectedWord} 
            onClose={handleCloseCard} 
          />
        )}
        {showQuiz && (
           <QuizModal 
             questions={QUEENCARD_QUIZ} 
             onComplete={handleQuizComplete} 
           />
        )}
      </AnimatePresence>

      <GachaModal 
        isOpen={showGacha} 
        onClose={() => {
          setShowGacha(false);
          setIsStageClear(false);
        }} 
      />
    </div>
  );
}

function LyricLineItem({ line, isActive, onWordClick }: { line: LyricLine, isActive: boolean, onWordClick: (w: WordData) => void }) {
  const renderText = () => {
    if (!line.keyWords) return <span>{line.text}</span>;

    // Complex replacement to keep React nodes for keywords
    // We'll create a simple parser that splits by keywords
    let parts: { text: string; isKeyword?: boolean; wordData?: WordData }[] = [{ text: line.text }];

    Object.values(line.keyWords).forEach((wordData) => {
      const word = wordData.word;
      const regex = new RegExp(`(${word})`, 'gi');
      
      const newParts: typeof parts = [];
      
      parts.forEach(part => {
        if (part.isKeyword) {
          newParts.push(part);
          return;
        }

        const split = part.text.split(regex);
        split.forEach((s) => {
          if (s.toLowerCase() === word.toLowerCase()) {
            newParts.push({ text: s, isKeyword: true, wordData });
          } else if (s) {
            newParts.push({ text: s });
          }
        });
      });
      parts = newParts;
    });

    return (
      <>
        {parts.map((part, i) => (
          part.isKeyword ? (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, textShadow: "0 0 8px #E10098" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => part.wordData && onWordClick(part.wordData)}
              className={cn(
                "inline-block px-1 rounded mx-0.5 font-bold cursor-pointer transition-colors border-b-2 border-transparent",
                isActive 
                  ? "text-idle-pink bg-white/10 border-idle-pink animate-pulse" 
                  : "text-white hover:text-idle-pink hover:border-idle-pink"
              )}
            >
              {part.text}
            </motion.button>
          ) : (
            <span key={i}>{part.text}</span>
          )
        ))}
      </>
    );
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-300",
      isActive 
        ? "bg-white/5 border-idle-neon/50 shadow-[0_0_15px_rgba(225,0,152,0.8)] glitch-active relative overflow-hidden" 
        : "bg-transparent border-transparent"
    )}>
      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-idle-neon/20 to-transparent pointer-events-none" />}
      <div className="flex items-center gap-3 mb-2 relative z-10">
        {line.speaker && (
           <span className={cn(
             "text-xs px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
             isActive ? "bg-idle-pink text-black" : "bg-white/10 text-gray-400"
           )}>
             {line.speaker}
           </span>
        )}
      </div>
      <p className={cn(
        "text-lg md:text-xl font-medium leading-relaxed",
        isActive ? "text-white" : "text-gray-300"
      )}>
        {renderText()}
      </p>
    </div>
  );
}
