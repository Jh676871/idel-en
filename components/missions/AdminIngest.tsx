"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { ProcessedMission } from "@/types";

export function AdminIngest() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState<"auto" | 1 | 2 | 3>("auto");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { addMission } = useLearning();

  const handleIngest = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/ingest-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest");
      }

      // Transform into ProcessedMission
      const missionData = data.data;
      const newMission: ProcessedMission = {
        id: `mission-${Date.now()}`,
        createdAt: Date.now(),
        source: {
          id: missionData.videoId,
          title: missionData.title,
          type: "lyric",
          rawText: missionData.title, // Simplified
          mediaUrl: missionData.mediaUrl,
          difficulty: missionData.difficulty,
        },
        proficiency: missionData.proficiency,
        title: missionData.title,
        keywords: missionData.keywords,
        challenges: {
          fillInTheBlank: {
            sentence: missionData.keywords[0]?.example || "Example sentence",
            answer: missionData.keywords[0]?.word || "word",
          },
          definitionMatching: {
            pairs: missionData.keywords.slice(0, 3).map((k: any) => ({
              word: k.word,
              definition: k.definition,
            })),
          },
          chatChallenge: {
            question: missionData.scenarioDialogue?.question || `What is the main theme of ${missionData.title}?`,
          },
        },
        // New fields
        lrcData: missionData.lrcData,
        quiz: missionData.quiz,
        mentor: missionData.mentor,
        scenarioDialogue: missionData.scenarioDialogue,
        status: "new",
      };

      addMission(newMission);
      setStatus("success");
      setMessage(`Successfully added "${missionData.title}"!`);
      setUrl("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
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
            <h3 className="text-idle-pink font-bold font-orbitron mb-4">CONTENT HUB INGESTION</h3>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-idle-pink transition-colors"
                disabled={loading}
              />
              
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-idle-pink transition-colors"
                disabled={loading}
              >
                <option value="auto">Auto (Adaptive)</option>
                <option value="1">Level 1 (Easy)</option>
                <option value="2">Level 2 (Medium)</option>
                <option value="3">Level 3 (Hard)</option>
              </select>

              <button
                onClick={handleIngest}
                disabled={loading || !url.trim()}
                className="bg-idle-pink hover:bg-idle-pink/80 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Analyze"}
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
                  Gemini 3.0 正在掃描舞台、拆解音軌與建立語義地圖...
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
