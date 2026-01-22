"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { ProcessedMission, CefrLevel } from "@/types";

function difficultyFromCefr(cefr: CefrLevel): 1 | 2 | 3 {
  if (cefr === "A2") return 1;
  if (cefr === "B1") return 2;
  return 3;
}

export function AdminIngest() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  // const [difficulty, setDifficulty] = useState<"auto" | 1 | 2 | 3>("auto"); // Removed per instruction
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [loadingText, setLoadingText] = useState("正在連線至 YouTube 舞台...");
  const [manualLyrics, setManualLyrics] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const { addMission } = useLearning();

  const handleIngest = async () => {
    if (!url.trim() || !manualLyrics.trim()) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");
    setLoadingText("Gemini 3.0 魔法轉換中 ✨ (這可能需要 60 秒，請喝杯茶)...");

    try {
      // Use the refactored process-content API
      const res = await fetch("/api/process-content", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-admin-token": adminToken.trim() 
        },
        body: JSON.stringify({ 
            url, 
            rawText: manualLyrics,
            type: "lyric", // Optional, API infers from URL presence
            masteryAverage: 0 // Default
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest");
      }

      // Transform into ProcessedMission
      const missionData = data.data;
      
      await processMissionData(missionData);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };




  const processMissionData = async (missionData: any) => {
      const newMission: ProcessedMission = {
        id: `mission-${Date.now()}`,
        createdAt: Date.now(),
        source: {
          id: missionData.videoId,
          title: missionData.title,
          type: "lyric",
          rawText: missionData.title, 
          mediaUrl: missionData.mediaUrl,
          difficulty: difficultyFromCefr((missionData.proficiency as CefrLevel) || "A2"),
        },
        proficiency: missionData.proficiency,
        title: missionData.title,
        keywords: missionData.keywords,
        challenges: {
          fillInTheBlank: {
            sentence: missionData.keywords?.[0]?.example || "Example sentence",
            answer: missionData.keywords?.[0]?.word || "word",
          },
          definitionMatching: {
            pairs: missionData.keywords?.slice(0, 3).map((k: any) => ({
              word: k.word,
              definition: k.definition,
            })) || [],
          },
          chatChallenge: {
            question: missionData.challenges?.chatChallenge?.question || `What is the main theme of ${missionData.title}?`,
          },
        },
        lrcData: missionData.lrcData,
        quiz: missionData.quiz,
        mentor: missionData.mentor,
        scenarioDialogue: missionData.scenarioDialogue,
        status: "new",
      };

      addMission(newMission);
      setStatus("success");
      setMessage(`新舞台 "${missionData.title}" 已準備就緒！`);
      setUrl("");
      setManualLyrics("");
  };

  return (
    <div className="mb-10 border-b border-white/10 pb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-idle-pink transition-colors tracking-widest uppercase font-mono mb-4 flex items-center gap-2"
      >
        <Sparkles size={12} />
        Admin / Dad Mode
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-idle-pink font-bold font-orbitron mb-4">CONTENT HUB INGESTION (MANUAL MODE)</h3>
            
            <div className="flex flex-col gap-4 mb-4">
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Admin Token (Optional if not set in backend)"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-idle-pink transition-colors text-sm"
                disabled={loading}
              />

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-idle-pink transition-colors"
                disabled={loading}
              />
              
              <div className="relative">
                <textarea
                  value={manualLyrics}
                  onChange={(e) => setManualLyrics(e.target.value)}
                  placeholder="在此貼上歌詞 (Lyrics)..."
                  className="w-full h-40 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-idle-pink transition-colors resize-none"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleIngest}
                disabled={loading || !url.trim() || !manualLyrics.trim()}
                className="bg-idle-pink hover:bg-idle-pink/80 text-white font-bold px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full shadow-[0_0_15px_rgba(255,20,147,0.5)]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Gemini 3.0 魔法轉換 ✨"}
              </button>
            </div>

            {loading && (
              <div className="w-full space-y-2">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-idle-pink via-idle-neon to-idle-purple"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-idle-neon animate-pulse">
                    GEMINI 3.0 PROCESSING...
                  </span>
                  <span className="text-gray-400">
                    SCANNING_STAGE_DATA...
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {loadingText}
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-3 text-red-400">
                <XCircle size={16} />
                <span className="text-sm">{message}</span>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
