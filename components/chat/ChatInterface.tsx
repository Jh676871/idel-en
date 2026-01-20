"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Sparkles, Languages, Lightbulb } from "lucide-react";
import { useLearning } from "@/context/LearningContext";
import { playSfx } from "@/lib/audio";
import type { ProcessedMission } from "@/types";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  translation?: string;
  isTyping?: boolean;
}

export function ChatInterface({ mission }: { mission?: ProcessedMission | null }) {
  const { wordBank, addXp, incrementChatCount, practiceWord } = useLearning();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "model",
      content: "Hi! I'm Yuqi! I-DLE is going on a World Tour! 🌍 Can you help me practice English before we go to New York? ✨",
      translation: "嗨！我是雨琦！I-DLE 要去世界巡演啦！🌍 你能在我们要去纽约之前帮我练习英语吗？✨"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [xpFloat, setXpFloat] = useState<{ id: number, amount: number, text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!mission) return;
    const question = mission.challenges.chatChallenge.question;
    const words = mission.keywords.map(k => k.word).slice(0, 6);
    setMessages([
      {
        id: "mission_intro",
        role: "model",
        content: `Mission time! ✨ ${question}\n\nTry to use these words: ${words.join(", ")}`,
        translation: undefined
      }
    ]);
  }, [mission]);

  // Generate hints from mission words or saved words
  useEffect(() => {
    if (mission) {
      setHints(mission.keywords.map(k => k.word).slice(0, 6));
      return;
    }

    if (wordBank.length > 0) {
      const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
      setHints(shuffled.slice(0, 3).map(w => w.word));
    }
  }, [mission, wordBank]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    playSfx("click");

    // XP Logic
    let xpGain = 5; // Base XP
    let bonusReason = "";

    if (mission) {
      const usedMissionWords = mission.keywords.filter(k => userMessage.toLowerCase().includes(k.word.toLowerCase()));
      if (usedMissionWords.length > 0) {
        xpGain += 10;
        bonusReason = "Mission bonus!";
        usedMissionWords.forEach(k => {
          practiceWord({
            word: k.word,
            meaning: k.definition,
            example: k.example,
            phonetic: k.phonetic,
            sourceId: mission.id,
          });
        });
        playSfx("success");
      }
    }

    // Check for used hints
    const usedHint = hints.find(h => userMessage.toLowerCase().includes(h.toLowerCase()));
    if (usedHint) {
      xpGain += 10;
      if (!bonusReason) bonusReason = "Bonus!";
      playSfx("success");
    }

    addXp(xpGain);
    incrementChatCount();

    // Show floating XP
    const floatId = Date.now();
    setXpFloat({ id: floatId, amount: xpGain, text: bonusReason });
    setTimeout(() => setXpFloat(null), 2000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          mission: mission
            ? {
                id: mission.id,
                title: mission.title,
                proficiency: mission.proficiency,
                targetWords: mission.keywords.map(k => k.word),
                chatChallenge: mission.challenges.chatChallenge.question,
              }
            : null
        })
      });

      const data = await response.json();
      
      if (data.response) {
        // Parse translation
        const parts = data.response.split(":::translation:::");
        const mainContent = parts[0].trim();
        const translation = parts[1] ? parts[1].replace(":::", "").trim() : undefined;

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "model",
            content: mainContent,
            translation: translation
          }
        ]);
        playSfx("success"); 
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Handle error UI
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          content: "Opps! My connection is a bit spotty! 🎤 Can you say that again?",
          translation: "哎呀！信号不太好！🎤 你能再说一遍吗？"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertHint = (word: string) => {
    setInput(prev => prev + (prev ? " " : "") + word);
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 relative">
      {/* Header */}
      <div className="bg-[#FFD700] p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white flex items-center justify-center">
                {/* Avatar Fallback */}
                <span className="text-xl">🦒</span>
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-black text-lg">Yuqi 🦒</h3>
            <span className="text-xs text-black/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Online
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowHints(!showHints)}
          className={`p-2 rounded-full transition-colors ${showHints ? "bg-white text-idle-gold" : "bg-black/10 text-black hover:bg-black/20"}`}
          title="Word Hints"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </div>

      {/* Hints Panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-3 flex gap-2 overflow-x-auto">
              {hints.length > 0 ? (
                hints.map(word => (
                  <button
                    key={word}
                    onClick={() => insertHint(word)}
                    className="px-3 py-1 bg-idle-purple/10 text-idle-purple dark:text-idle-pink border border-idle-purple/30 rounded-full text-sm hover:bg-idle-purple/20 whitespace-nowrap"
                  >
                    + {word}
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-500 w-full text-center">
                  Go to Lyrics to collect words first!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#b2c7d9] dark:bg-[#0f0f12]">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative">
        <AnimatePresence>
          {xpFloat && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -60 }}
              className="absolute right-8 -top-4 pointer-events-none flex flex-col items-center"
            >
              <span className="text-2xl font-bold text-idle-gold drop-shadow-md">+{xpFloat.amount} XP</span>
              {xpFloat.text && <span className="text-sm font-bold text-idle-pink">{xpFloat.text}</span>}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <button className="p-3 text-gray-400 hover:text-idle-gold transition-colors">
            <Mic className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something to Yuqi..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-idle-gold"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-idle-gold text-black rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`p-3 rounded-2xl shadow-sm relative group ${
            isUser
              ? "bg-idle-gold text-black rounded-tr-none"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
          
          {/* Translation Toggle for AI Messages */}
          {!isUser && message.translation && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
                      {message.translation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-1 text-xs text-idle-purple hover:text-idle-pink transition-colors font-medium"
              >
                <Languages className="w-3 h-3" />
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </button>
            </div>
          )}
        </div>
        
        {/* Timestamp / Status */}
        <span className="text-[10px] text-gray-500 mt-1 px-1">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
