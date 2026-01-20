"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "@/context/LearningContext";
import type { ProcessedMission, ProcessedKeyword } from "@/types";
import { ChatInterface } from "@/components/chat/ChatInterface";

type Stage = "spotlight" | "practice" | "real_chat" | "review";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function highlightText(text: string, keywords: string[]) {
  if (!text.trim() || keywords.length === 0) return text;

  const sorted = [...keywords]
    .map((k) => k.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (sorted.length === 0) return text;

  const pattern = new RegExp(`\\b(${sorted.map(escapeRegExp).join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, idx) => {
    const isHit = sorted.some((k) => k.toLowerCase() === part.toLowerCase());
    if (!isHit) return <span key={idx}>{part}</span>;
    return (
      <span
        key={idx}
        className="px-1 rounded bg-idle-pink/25 text-white border border-idle-pink/30"
      >
        {part}
      </span>
    );
  });
}

function getMastery(word: string, wordBank: Array<{ word: string; masteryLevel: number }>) {
  const found = wordBank.find((w) => w.word.toLowerCase() === word.toLowerCase());
  return found?.masteryLevel ?? 0;
}

function pickReview(member: string, score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total;

  const byMember: Record<string, string[]> = {
    Soyeon: [
      "Your rhythm in English is getting better! Keep that confidence.",
      "Nice control. Now try to be even more precise with your word choices.",
      "You’re improving fast. Next time, challenge yourself with longer sentences.",
    ],
    Miyeon: [
      "That was so lovely! Your pronunciation is becoming clearer.",
      "Good job! Let’s make your sentences smoother and more natural next time.",
      "You did great—keep practicing and you’ll shine even brighter.",
    ],
    Minnie: [
      "I love your vibe. Use those new words more boldly in chat.",
      "So good! Try adding feelings and details to your English.",
      "You’re getting more fluent—keep the energy going.",
    ],
    Yuqi: [
      "Wow! You’re getting stronger in English, like touring-ready!",
      "Nice! Try using two target words in one sentence next time.",
      "Great job—your English is leveling up!",
    ],
    Shuhua: [
      "Good. Now be brave and speak more.",
      "Not bad. Try again with more confidence.",
      "You’re improving. Keep going.",
    ],
  };

  const pool = byMember[member] || byMember.Yuqi;
  const idx = ratio >= 0.8 ? 0 : ratio >= 0.5 ? 1 : 2;
  return pool[idx] || pool[0];
}

export function MissionPlayer({ mission }: { mission: ProcessedMission }) {
  const { wordBank, practiceWord, setCurrentMission, addXp } = useLearning();
  const [stage, setStage] = useState<Stage>("spotlight");
  const [practiceStep, setPracticeStep] = useState<0 | 1 | 2>(0);
  const [fibInput, setFibInput] = useState("");
  const [fibDone, setFibDone] = useState(false);
  const [fibCorrect, setFibCorrect] = useState(false);
  const [matching, setMatching] = useState<Record<string, string>>({});
  const [matchingDone, setMatchingDone] = useState(false);
  const [matchingScore, setMatchingScore] = useState(0);
  const [reviewMember, setReviewMember] = useState<string>("Soyeon");
  const [reviewText, setReviewText] = useState<string>("");
  const [toast, setToast] = useState<null | { id: string; word: string; from: number; to: number }>(null);
  const prevMasteryRef = useRef<Record<string, number>>({});

  const keywords = useMemo(() => mission.keywords.map((k) => k.word), [mission.keywords]);

  const embedUrl = useMemo(() => {
    const url = mission.source.mediaUrl?.trim();
    if (!url) return null;
    return getYouTubeEmbedUrl(url);
  }, [mission.source.mediaUrl]);

  const matchingPairs = useMemo(() => mission.challenges.definitionMatching.pairs, [mission.challenges.definitionMatching.pairs]);
  const matchingDefinitions = useMemo(() => {
    const defs = matchingPairs.map((p) => p.definition);
    return defs.slice();
  }, [matchingPairs]);

  const keywordByWord = useMemo(() => {
    const map = new Map<string, ProcessedKeyword>();
    mission.keywords.forEach((k) => map.set(k.word.toLowerCase(), k));
    return map;
  }, [mission.keywords]);

  useEffect(() => {
    setCurrentMission(mission);
  }, [mission, setCurrentMission]);

  useEffect(() => {
    const nextMap: Record<string, number> = {};
    keywords.forEach((w) => {
      nextMap[w.toLowerCase()] = getMastery(w, wordBank);
    });

    const prevMap = prevMasteryRef.current;
    const increased = keywords
      .map((w) => w.toLowerCase())
      .find((w) => (prevMap[w] ?? 0) < (nextMap[w] ?? 0));

    if (increased) {
      const from = prevMap[increased] ?? 0;
      const to = nextMap[increased] ?? 0;
      setToast({ id: `${increased}-${Date.now()}`, word: increased, from, to });
      setTimeout(() => setToast(null), 1600);
    }

    prevMasteryRef.current = nextMap;
  }, [keywords, wordBank]);

  const totalPracticePoints = 1 + matchingPairs.length;
  const practicePoints = (fibCorrect ? 1 : 0) + matchingScore;

  const handleStartPractice = () => {
    setStage("practice");
    setPracticeStep(0);
  };

  const handleCheckFib = () => {
    if (fibDone) return;
    const expected = mission.challenges.fillInTheBlank.answer.trim().toLowerCase();
    const actual = fibInput.trim().toLowerCase();
    const ok = expected.length > 0 && actual === expected;
    setFibDone(true);
    setFibCorrect(ok);
    if (ok) {
      const key = keywordByWord.get(expected);
      practiceWord({
        word: key?.word || mission.challenges.fillInTheBlank.answer,
        meaning: key?.definition || "",
        example: key?.example || "",
        phonetic: key?.phonetic,
        sourceId: mission.id,
      });
      addXp(8);
    }
  };

  const handleSubmitMatching = () => {
    if (matchingDone) return;
    let score = 0;
    matchingPairs.forEach((p) => {
      const chosen = matching[p.word];
      if (chosen && chosen === p.definition) {
        score += 1;
        const key = keywordByWord.get(p.word.toLowerCase());
        practiceWord({
          word: p.word,
          meaning: key?.definition || p.definition,
          example: key?.example || "",
          phonetic: key?.phonetic,
          sourceId: mission.id,
        });
      }
    });
    setMatchingScore(score);
    setMatchingDone(true);
    if (score > 0) addXp(score * 5);
  };

  const handleGoChat = () => {
    setStage("real_chat");
  };

  const handleFinishMission = () => {
    const members = ["Soyeon", "Miyeon", "Minnie", "Yuqi", "Shuhua"];
    const pick = members[Math.floor(Math.random() * members.length)] || "Soyeon";
    setReviewMember(pick);
    setReviewText(pickReview(pick, practicePoints, totalPracticePoints));
    addXp(20);
    setStage("review");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold">{mission.title}</h1>
          <p className="text-gray-400 text-sm">{mission.proficiency} • {mission.source.type} • {mission.keywords.length} keywords</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={stage === "spotlight" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>
            1 Spotlight
          </span>
          <span className={stage === "practice" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>
            2 Practice
          </span>
          <span className={stage === "real_chat" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>
            3 Real Chat
          </span>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md"
          >
            <div className="text-sm text-white font-bold">
              {toast.word.toUpperCase()} Level Up: {toast.from} → {toast.to}
            </div>
            {toast.to === 5 && <div className="text-xs text-idle-gold font-bold mt-1">Golden Card Unlocked</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "spotlight" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h2 className="font-orbitron font-bold">Spotlight</h2>
                <p className="text-gray-400 text-sm">Media + keyword highlights</p>
              </div>
              <div className="p-5">
                {embedUrl ? (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                    <iframe
                      className="w-full h-full"
                      src={embedUrl}
                      title={mission.source.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : mission.source.mediaUrl ? (
                  <a
                    href={mission.source.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-idle-gold underline break-all"
                  >
                    {mission.source.mediaUrl}
                  </a>
                ) : (
                  <div className="text-gray-400 text-sm">No media attached for this mission.</div>
                )}

                <div className="mt-5 bg-black/30 rounded-xl border border-white/10 p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {highlightText(mission.source.rawText, keywords)}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-orbitron font-bold">Vocabulary</h2>
                  <p className="text-gray-400 text-sm">Your target words for this mission</p>
                </div>
                <button
                  onClick={handleStartPractice}
                  className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
                >
                  Start Practice
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 gap-4">
                {mission.keywords.map((k) => {
                  const mastery = getMastery(k.word, wordBank);
                  const isGolden = mastery === 5;
                  return (
                    <div
                      key={k.word}
                      className={
                        isGolden
                          ? "rounded-2xl border border-idle-gold/40 bg-gradient-to-br from-idle-gold/20 via-black/30 to-idle-pink/10 p-4"
                          : "rounded-2xl border border-white/10 bg-black/30 p-4"
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-orbitron font-bold">{k.word}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-gray-200">{k.cefr}</span>
                            {isGolden && <span className="text-xs px-2 py-1 rounded-full bg-idle-gold text-black font-bold">GOLDEN</span>}
                          </div>
                          <div className="text-sm text-gray-300 mt-1">{k.definition}</div>
                          <div className="text-xs text-idle-gold font-mono mt-1">{k.phonetic}</div>
                          <div className="text-sm text-gray-200 mt-2 italic">{k.example}</div>
                        </div>
                        <button
                          onClick={() => {
                            practiceWord({
                              word: k.word,
                              meaning: k.definition,
                              example: k.example,
                              phonetic: k.phonetic,
                              sourceId: mission.id,
                            });
                            addXp(3);
                          }}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-bold"
                        >
                          Practice +1
                        </button>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-mono">Mastery</span>
                          <span className={isGolden ? "text-idle-gold font-bold" : "text-gray-200"}>{mastery}/5</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div
                            className={isGolden ? "h-full bg-idle-gold" : "h-full bg-idle-pink"}
                            style={{ width: `${(mastery / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === "practice" && (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold">Practice</h2>
              <p className="text-gray-400 text-sm">Interactive challenges</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage("spotlight")}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleGoChat}
                className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                Go Real Chat
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setPracticeStep(0)}
                className={practiceStep === 0 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                Fill in blank
              </button>
              <button
                onClick={() => setPracticeStep(1)}
                className={practiceStep === 1 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                Matching
              </button>
              <button
                onClick={() => setPracticeStep(2)}
                className={practiceStep === 2 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                Chat Challenge
              </button>
            </div>

            {practiceStep === 0 && (
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-2">Sentence</div>
                  <div className="text-lg text-white">{mission.challenges.fillInTheBlank.sentence}</div>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    value={fibInput}
                    onChange={(e) => setFibInput(e.target.value)}
                    disabled={fibDone}
                    placeholder="Type the missing word"
                    className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
                  />
                  <button
                    onClick={handleCheckFib}
                    disabled={!fibInput.trim() || fibDone}
                    className="px-5 py-3 rounded-xl bg-idle-pink text-white font-bold disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>
                {fibDone && (
                  <div className={fibCorrect ? "text-idle-gold font-bold" : "text-red-300 font-bold"}>
                    {fibCorrect ? "Correct!" : `Answer: ${mission.challenges.fillInTheBlank.answer}`}
                  </div>
                )}
              </div>
            )}

            {practiceStep === 1 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-300">Match each word with the correct definition</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingPairs.map((p) => (
                    <div key={p.word} className="bg-black/30 border border-white/10 rounded-xl p-4">
                      <div className="font-orbitron font-bold text-white mb-2">{p.word}</div>
                      <select
                        value={matching[p.word] || ""}
                        onChange={(e) => setMatching((prev) => ({ ...prev, [p.word]: e.target.value }))}
                        disabled={matchingDone}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none"
                      >
                        <option value="">Select a definition</option>
                        {matchingDefinitions.map((d) => (
                          <option key={`${p.word}-${d}`} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitMatching}
                    disabled={matchingDone}
                    className="px-5 py-3 rounded-xl bg-idle-pink text-white font-bold disabled:opacity-50"
                  >
                    Submit
                  </button>
                  {matchingDone && (
                    <div className="text-idle-gold font-bold">
                      Score: {matchingScore}/{matchingPairs.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            {practiceStep === 2 && (
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                  <div className="text-sm text-gray-300 mb-2">Your mission chat challenge</div>
                  <div className="text-lg text-white font-bold">{mission.challenges.chatChallenge.question}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    Use at least two target words in your reply.
                  </div>
                </div>
                <button
                  onClick={handleGoChat}
                  className="px-5 py-3 rounded-xl bg-idle-gold text-black font-bold"
                >
                  Start Real Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "real_chat" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold text-xl">Real Chat</h2>
              <p className="text-gray-400 text-sm">Try using your mission words naturally</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage("practice")}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleFinishMission}
                className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                Finish Mission
              </button>
            </div>
          </div>

          <div className="h-[70vh] min-h-[520px]">
            <ChatInterface mission={mission} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {stage === "review" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setStage("spotlight")} />
            <motion.div
              initial={{ y: 20, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-[#1a0033] to-[#2a0044] border border-idle-gold/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-idle-pink via-idle-gold to-idle-pink" />
              <div className="p-6">
                <div className="text-sm text-gray-300">Performance Review</div>
                <div className="text-2xl font-orbitron font-bold text-white mt-1">{reviewMember}</div>
                <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-4 text-white">
                  {reviewText}
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-gray-300">
                  <span>Practice score</span>
                  <span className="text-idle-gold font-bold">{practicePoints}/{totalPracticePoints}</span>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setStage("spotlight")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Back to Spotlight
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
