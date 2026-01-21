"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { ProcessedMission } from "@/types";

export function AdminIngest() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
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
        body: JSON.stringify({ url }),
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
            question: `What is the main theme of ${missionData.title}?`,
          },
        },
        // New fields
        lrcData: missionData.lrcData,
        quiz: missionData.quiz,
        mentor: missionData.mentor,
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
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-orbitron font-bold mb-4 text-white">
                New Mission Ingestion
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube URL here..."
                  className="flex-1 bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-idle-pink transition-colors"
                />
                <button
                  onClick={handleIngest}
                  disabled={loading || !url}
                  className="bg-idle-pink hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Processing
                    </>
                  ) : (
                    "Ingest"
                  )}
                </button>
              </div>

              {/* Status Feedback */}
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center gap-3 text-idle-pink"
                  >
                    <div className="w-2 h-2 rounded-full bg-idle-pink animate-ping" />
                    <span className="font-mono text-sm animate-pulse">
                      Preparing Stage... AI is analyzing lyrics & creating quiz...
                    </span>
                  </motion.div>
                )}

                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-green-400"
                  >
                    <CheckCircle size={18} />
                    <span>{message}</span>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 text-red-400"
                  >
                    <XCircle size={18} />
                    <span>Error: {message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
