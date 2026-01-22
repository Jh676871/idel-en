"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { useLearning } from "@/context/LearningContext";
import type { ProcessedMission, ProcessedKeyword } from "@/types";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Loader2, Menu, X, Play, Pause, Repeat, BookOpen, Mic, Volume2, Clock, Plus, Minus, Save, Edit, Check, Undo, Zap, Music } from "lucide-react";

type Stage = "spotlight" | "practice" | "real_chat" | "review";

function parseLrcTimestamp(timestamp: string): number {
  const match = timestamp.match(/\[(\d+):(\d+\.\d+)\]/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseFloat(match[2]);
}

function formatLrcTimestamp(time: number): string {
  const m = Math.floor(time / 60);
  const s = (time % 60).toFixed(2);
  return `[${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}]`;
}

// Linear Interpolation for timestamps
function interpolateTimestamps(data: Array<{ timestamp: string; content: string }>) {
  const result = [...data];
  let lastValidIndex = -1;

  for (let i = 0; i < result.length; i++) {
    if (result[i].timestamp && result[i].timestamp !== "[]") {
      if (lastValidIndex !== -1 && i - lastValidIndex > 1) {
        // Found a gap
        const startTime = parseLrcTimestamp(result[lastValidIndex].timestamp);
        const endTime = parseLrcTimestamp(result[i].timestamp);
        const count = i - lastValidIndex - 1;
        const step = (endTime - startTime) / (count + 1);

        for (let j = 1; j <= count; j++) {
          result[lastValidIndex + j].timestamp = formatLrcTimestamp(startTime + step * j);
        }
      }
      lastValidIndex = i;
    }
  }
  return result;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(
  text: string, 
  keywords: ProcessedKeyword[], 
  onKeywordClick?: (k: ProcessedKeyword) => void,
  isActiveLine: boolean = false
) {
  if (!text) return null;
  const keywordMap = new Map(keywords.map(k => [k.word.toLowerCase(), k]));
  const sortedWords = Array.from(keywordMap.keys()).sort((a, b) => b.length - a.length);

  if (sortedWords.length === 0) return <span>{text}</span>;

  const pattern = new RegExp(`\\b(${sortedWords.map(escapeRegExp).join("|")})\\b`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    const lower = part.toLowerCase();
    const keyword = keywordMap.get(lower);
    
    if (keyword) {
      return (
        <motion.span
          key={idx}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onKeywordClick?.(keyword);
          }}
          className={`
            cursor-pointer inline-block px-1 rounded transition-all duration-300
            ${isActiveLine 
              ? "text-idle-gold font-bold underline decoration-idle-pink decoration-2 underline-offset-4 animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.5)]" 
              : "text-idle-pink/80 font-semibold"}
          `}
        >
          {part}
        </motion.span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function LyricsScroller({ 
  lrcData, 
  currentTime, 
  offset,
  keywords, 
  onKeywordClick,
  onLineClick,
  isProducerMode,
  producerLrcData
}: { 
  lrcData: Array<{ timestamp: string; content: string }>; 
  currentTime: number;
  offset: number;
  keywords: ProcessedKeyword[];
  onKeywordClick: (k: ProcessedKeyword) => void;
  onLineClick: (time: number) => void;
  isProducerMode?: boolean;
  producerLrcData?: Array<{ timestamp: string; content: string }>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const dataToRender = isProducerMode && producerLrcData ? producerLrcData : lrcData;

  const activeIndex = useMemo(() => {
    // Find the last line that has started
    const adjustedTime = currentTime + offset;
    for (let i = dataToRender.length - 1; i >= 0; i--) {
      const time = parseLrcTimestamp(dataToRender[i].timestamp);
      if (adjustedTime >= time) return i;
    }
    return -1;
  }, [dataToRender, currentTime, offset]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto px-6 py-12 space-y-8 scrollbar-hide text-center"
    >
      {dataToRender.map((line, index) => {
        const isActive = index === activeIndex;
        const isSynced = isProducerMode && line.timestamp && line.timestamp !== "[]" && line.timestamp.includes(":");

        return (
          <div 
            key={index}
            ref={isActive ? activeRef : null}
            className={`
              transition-all duration-500 cursor-pointer
              ${isActive ? "scale-105 opacity-100" : "opacity-40 hover:opacity-70"}
              ${isProducerMode && !isSynced ? "opacity-30" : ""}
            `}
            onClick={() => {
              const time = parseLrcTimestamp(line.timestamp);
              onLineClick(time);
            }}
          >
            <p className={`
              text-lg md:text-2xl font-bold leading-relaxed
              ${isActive 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-idle-gold via-white to-idle-pink" 
                : isProducerMode && isSynced 
                  ? "text-green-400" 
                  : "text-white"}
            `}>
              {highlightText(line.content, keywords, onKeywordClick, isActive)}
            </p>
            {isProducerMode && (
              <span className={`text-xs font-mono mt-1 block ${isSynced ? "text-green-500/50" : "text-gray-600"}`}>
                {line.timestamp || "WAITING..."}
              </span>
            )}
          </div>
        );
      })}
      <div className="h-32" /> {/* Bottom spacer */}
    </div>
  );
}


function getMastery(word: string, wordBank: Array<{ word: string; masteryLevel: number }>) {
  const found = wordBank.find((w) => w.word.toLowerCase() === word.toLowerCase());
  return found?.masteryLevel ?? 0;
}

function pickReview(member: string, score: number, total: number) {
  const ratio = total === 0 ? 0 : score / total;

  const byMember: Record<string, string[]> = {
    Soyeon: [
      "翻譯官小助手，妳的英文節奏越來越穩了，保持那股自信。",
      "控制得很漂亮。下一輪我們把用字再精準一點，妳會更帥。",
      "進步超快的。下次挑戰更長的句子，我們一起把舞台撐起來。",
    ],
    Miyeon: [
      "翻譯官小助手，剛剛好溫柔～發音越來越清楚了。",
      "做得很好！下次我們把句子接得更順、更像母語一樣自然。",
      "妳很棒耶～繼續練，妳會在舞台上更閃耀。",
    ],
    Minnie: [
      "翻譯官小助手，我喜歡妳的 vibe。聊天室裡把新單字用大膽一點。",
      "很可以！英文再多放一點情緒和細節，聽起來會更迷人。",
      "越來越流暢了～把這個能量繼續維持住。",
    ],
    Yuqi: [
      "翻譯官小助手，哇！妳的英文越來越強，世巡 ready 了啦！",
      "很棒！下次一個句子裡塞兩個目標單字，挑戰一下。",
      "做得漂亮～妳的英文正在升級！",
    ],
    Shuhua: [
      "翻譯官小助手，不錯。再勇敢一點，多說幾句。",
      "還可以。再來一次，記得把自信放大。",
      "有進步。繼續往前走，我在。",
    ],
  };

  const pool = byMember[member] || byMember.Yuqi;
  const idx = ratio >= 0.8 ? 0 : ratio >= 0.5 ? 1 : 2;
  return pool[idx] || pool[0];
}

export function MissionPlayer({ mission }: { mission: ProcessedMission }) {
  const { wordBank, practiceWord, setCurrentMission, updateMission, addXp } = useLearning();
  const [stage, setStage] = useState<Stage>("spotlight");
  const [practiceStep, setPracticeStep] = useState<0 | 1 | 2 | 3>(3);
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
  
  // New State for Video & Lyrics
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [offset, setOffset] = useState(mission.offset || 0);
  const [isWordDrawerOpen, setIsWordDrawerOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<ProcessedKeyword | null>(null);

  // Producer Mode State
  const [isProducerMode, setIsProducerMode] = useState(false);
  const [producerLrcData, setProducerLrcData] = useState<Array<{ timestamp: string; content: string }>>([]);
  const [editIndex, setEditIndex] = useState(0);

  // Initialize producer data when entering mode
  useEffect(() => {
    if (isProducerMode) {
      // Create a clean slate or copy? 
      // User says "Overwrite AI generated data", so we start with current content but maybe empty timestamps?
      // "Repeat this action until the song is finished."
      // Let's copy structure but maybe clear timestamps?
      // Or maybe keep them as reference and overwrite as we go?
      // "Visual feedback: Synced lines green, Unsynced gray."
      // This implies we should probably clear them or mark them as "pending".
      // Let's Initialize with empty timestamps for the purpose of "Production".
      if (producerLrcData.length === 0) {
        setProducerLrcData(mission.lrcData?.map(l => ({ ...l, timestamp: "" })) || []);
      }
      if (playerRef.current) {
         playerRef.current.setPlaybackRate(0.75);
         playerRef.current.pauseVideo();
         playerRef.current.seekTo(0);
         setEditIndex(0);
      }
    } else {
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(1);
      }
    }
  }, [isProducerMode]);

  const handleProducerHit = useCallback(() => {
    if (!isProducerMode || !playerRef.current) return;
    
    const time = playerRef.current.getCurrentTime();
    const formatted = formatLrcTimestamp(time);
    
    setProducerLrcData(prev => {
      const newData = [...prev];
      if (editIndex < newData.length) {
        newData[editIndex] = { ...newData[editIndex], timestamp: formatted };
      }
      return newData;
    });

    // Auto advance
    setEditIndex(prev => Math.min(prev + 1, (producerLrcData.length || 1) - 1));
    
    // Feedback
    // Maybe play a subtle tick sound?
  }, [isProducerMode, editIndex, producerLrcData.length]);

  const handleProducerUndo = useCallback(() => {
    if (editIndex > 0) {
      setEditIndex(prev => prev - 1);
      setProducerLrcData(prev => {
        const newData = [...prev];
        newData[editIndex - 1].timestamp = ""; // Reset previous
        return newData;
      });
      // Seek back slightly?
      const prevTime = parseLrcTimestamp(producerLrcData[editIndex - 1]?.timestamp || "00:00.00");
      if (playerRef.current) playerRef.current.seekTo(Math.max(0, prevTime - 2));
    }
  }, [editIndex, producerLrcData]);

  // Keyboard listener for HIT (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isProducerMode) return;
      if (e.code === "Space") {
        e.preventDefault(); // Prevent scrolling
        handleProducerHit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProducerMode, handleProducerHit]);

  const handleSaveProducerData = () => {
    // Check for gaps and interpolate
    const interpolated = interpolateTimestamps(producerLrcData);
    
    updateMission(mission.id, { lrcData: interpolated });
    setProducerLrcData(interpolated); // Update local state to show result
    setIsProducerMode(false); // Exit mode
    alert("舞台設定已更新！(包含自動補間)");
  };

  const keywords = useMemo(() => mission.keywords.map((k) => k.word), [mission.keywords]);

  const videoId = useMemo(() => {
    if (!mission.source.mediaUrl) return null;
    const match = mission.source.mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
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

  // Video Timer with high frequency
  useEffect(() => {
    let animationFrameId: number;
    
    const update = () => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
      animationFrameId = requestAnimationFrame(update);
    };
    
    // Start loop
    animationFrameId = requestAnimationFrame(update);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleSaveOffset = () => {
    updateMission(mission.id, { offset });
    alert(`已儲存時間校正: ${offset > 0 ? "+" : ""}${offset}s`);
  };

  const [speechState, setSpeechState] = useState<"idle" | "listening" | "processing" | "result">("idle");
  const [transcript, setTranscript] = useState("");
  const [speechScore, setSpeechScore] = useState(0);

  // Speech Recognition
  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("您的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge。");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setSpeechState("listening");
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
           // interim
           setTranscript(event.results[i][0].transcript);
        }
      }
      if (final) {
        setTranscript(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setSpeechState("idle");
    };

    recognition.onend = () => {
      setSpeechState("processing");
    };

    recognition.start();
  }, []);

  useEffect(() => {
    if (speechState === "processing") {
      // Calculate Score
      const target = mission.challenges.fillInTheBlank.sentence.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      const actual = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      // Simple word match overlap
      const targetWords = target.split(/\s+/);
      const actualWords = actual.split(/\s+/);
      
      let matchCount = 0;
      targetWords.forEach(w => {
        if (actualWords.includes(w)) matchCount++;
      });
      
      const score = Math.round((matchCount / targetWords.length) * 100);
      setSpeechScore(score > 100 ? 100 : score);
      setSpeechState("result");
      if (score > 60) addXp(10);
    }
  }, [speechState, transcript, mission.challenges.fillInTheBlank.sentence, addXp]);

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

  const handleKeywordClick = (k: ProcessedKeyword) => {
    playerRef.current?.pauseVideo();
    setSelectedWord(k);
  };

  // Sync state with parent (LyricsScroller active index logic)
  // We need to pass producerLrcData to LyricsScroller
  
  // Also need to handle seek when clicking lines in producer mode - handled by existing onLineClick but using producer data timestamps
  
  // Override onLineClick for Producer Mode to just seek, not edit?
  // Actually, if I click a line in Producer Mode, I might want to "jump" to that line to edit it?
  // Current logic: onClick -> seekTo(time).
  // If timestamp is empty, seekTo(0).
  // Ideally, clicking a line in Producer Mode should set `editIndex` to that line.
  const handleLineClick = (time: number) => {
    if (isProducerMode) {
      // Find index by time? No, time might be 0.
      // Better to pass index from LyricsScroller.
      // But LyricsScroller interface only passes time.
      // Let's assume user just uses the controls for now.
      // Or we can just let it seek if it has a timestamp.
    }
    
    // Adjust seek time by offset
    // If offset is +0.5s, it means video time + 0.5 = lyric time
    // So video time = lyric time - 0.5
    const seekTime = Math.max(0, time - offset);
    playerRef.current?.seekTo(seekTime, true);
    playerRef.current?.playVideo();
  };

  return (
    <div className="w-full relative min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-none">
        <div>
          <h1 className="text-xl md:text-2xl font-orbitron font-bold truncate max-w-[200px] md:max-w-md">{mission.title}</h1>
          <p className="text-gray-400 text-xs md:text-sm">{mission.proficiency} • {mission.source.type}</p>
        </div>
        <div className="flex items-center gap-2">
           {stage === "spotlight" && (
            <button 
                onClick={() => setIsWordDrawerOpen(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white md:hidden"
            >
                <Menu size={20} />
            </button>
           )}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setStage("spotlight")} className={stage === "spotlight" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>1 聚光燈</button>
            <button onClick={() => setStage("practice")} className={stage === "practice" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>2 特訓</button>
            <button onClick={() => setStage("real_chat")} className={stage === "real_chat" ? "px-3 py-1 rounded-full bg-idle-pink text-white text-xs font-bold" : "px-3 py-1 rounded-full bg-white/10 text-gray-200 text-xs"}>3 真實陪練</button>
          </div>
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
              {toast.word.toUpperCase()} 熟練度升級：{toast.from} → {toast.to}
            </div>
            {toast.to === 5 && <div className="text-xs text-idle-gold font-bold mt-1">金卡已解鎖</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {stage === "spotlight" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Left: Video + Lyrics */}
            <div className="flex-1 flex flex-col bg-black/20 rounded-3xl border border-white/5 overflow-hidden relative">
                {/* Video Player */}
                <div className="flex-none w-full aspect-video bg-black relative z-10 shadow-2xl">
                    {videoId ? (
                        <YouTube
                            videoId={videoId}
                            className="w-full h-full"
                            iframeClassName="w-full h-full"
                            onReady={(e) => { playerRef.current = e.target; }}
                            opts={{
                                playerVars: {
                                    autoplay: 1,
                                    modestbranding: 1,
                                    rel: 0,
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Video Available
                        </div>
                    )}
                </div>

                {/* Lyrics Area - The "Dynamic Sync Area" */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-black via-[#1a0b2e] to-black">
                     {/* Decorative Spotlight Beam */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-idle-pink/5 via-transparent to-transparent pointer-events-none" />
                     
                     {/* Sync Offset Tool - Hide in Producer Mode */}
                     {!isProducerMode && (
                       <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 group hover:border-idle-gold/50 transition-colors">
                        <Clock size={14} className="text-gray-400 group-hover:text-idle-gold" />
                        <button 
                          onClick={() => setOffset(prev => Math.round((prev - 0.5) * 10) / 10)}
                          className="p-1 hover:text-idle-pink text-gray-300 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-mono font-bold min-w-[3ch] text-center text-white">
                          {offset > 0 ? "+" : ""}{offset}s
                        </span>
                        <button 
                          onClick={() => setOffset(prev => Math.round((prev + 0.5) * 10) / 10)}
                          className="p-1 hover:text-idle-pink text-gray-300 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <div className="w-px h-3 bg-white/20 mx-1" />
                        <button 
                          onClick={handleSaveOffset}
                          className="p-1 hover:text-idle-gold text-gray-300 transition-colors"
                          title="儲存校正"
                        >
                          <Save size={14} />
                        </button>
                        
                        {/* Toggle Producer Mode */}
                        <div className="w-px h-3 bg-white/20 mx-1" />
                        <button
                          onClick={() => {
                            if (confirm("進入「製作人同步模式」？這將允許你重新錄製歌詞時間軸。")) {
                              setIsProducerMode(true);
                            }
                          }}
                          className="p-1 hover:text-idle-green text-gray-300 transition-colors"
                          title="製作人同步模式"
                        >
                          <Edit size={14} />
                        </button>
                     </div>
                     )}

                     {/* Producer Mode Overlay Controls */}
                     {isProducerMode && (
                        <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-xl p-3 border border-idle-green/30 animate-in fade-in slide-in-from-top-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                             <span className="text-sm font-bold text-idle-green tracking-wide">PRODUCER MODE (0.75x)</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={handleProducerUndo}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold transition-colors border border-white/5"
                            >
                              <Undo size={14} />
                              UNDO ({editIndex})
                            </button>
                            <button 
                              onClick={handleSaveProducerData}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-idle-gold text-black hover:bg-idle-yellow text-xs font-bold transition-colors shadow-lg shadow-idle-gold/20"
                            >
                              <Save size={14} />
                              SAVE STAGE
                            </button>
                            <button 
                              onClick={() => {
                                setIsProducerMode(false);
                                setProducerLrcData([]);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                     )}
                     
                     {/* Producer HIT Button (Centered Overlay) */}
                     {isProducerMode && (
                       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                          <button
                            onClick={handleProducerHit}
                            className="group relative flex flex-col items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 active:border-idle-green active:scale-95 transition-all shadow-2xl"
                          >
                             <div className="absolute inset-0 rounded-full bg-idle-green/20 opacity-0 group-active:opacity-100 transition-opacity blur-xl" />
                             <Music size={32} className="text-gray-400 group-active:text-idle-green transition-colors mb-1" />
                             <span className="text-2xl font-black text-white tracking-widest group-active:text-idle-green">HIT</span>
                             <span className="text-[10px] text-gray-500 font-mono mt-1">SPACEBAR</span>
                          </button>
                       </div>
                     )}

                     {mission.lrcData && mission.lrcData.length > 0 ? (
                        <LyricsScroller 
                            lrcData={mission.lrcData} 
                            currentTime={currentTime}
                            offset={offset} 
                            keywords={mission.keywords}
                            onKeywordClick={handleKeywordClick}
                            onLineClick={handleLineClick}
                            isProducerMode={isProducerMode}
                            producerLrcData={producerLrcData}
                        />
                     ) : (
                         <div className="p-8 text-center text-gray-400 mt-10">
                             <p>此曲目尚未包含同步歌詞資料。</p>
                             <div className="mt-6 text-left whitespace-pre-wrap max-w-2xl mx-auto opacity-60">
                                 {highlightText(mission.source.rawText, mission.keywords, handleKeywordClick)}
                             </div>
                         </div>
                     )}
                </div>
            </div>

            {/* Right: Word Sidebar (Desktop) or Drawer (Mobile) */}
            <div className={`
                fixed inset-y-0 right-0 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 z-40 transform transition-transform duration-300 ease-in-out
                ${isWordDrawerOpen ? "translate-x-0" : "translate-x-full"}
                lg:relative lg:translate-x-0 lg:bg-transparent lg:border-none lg:w-80 lg:block lg:h-full lg:overflow-y-auto
            `}>
                <div className="p-5 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <h2 className="font-orbitron font-bold">Word Bank</h2>
                        <button onClick={() => setIsWordDrawerOpen(false)}><X /></button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-orbitron font-bold hidden lg:block">Target Words</h2>
                        <button onClick={handleStartPractice} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                            開始特訓
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 no-scrollbar flex-1">
                        {mission.keywords.map((k) => {
                            const mastery = getMastery(k.word, wordBank);
                            const isGolden = mastery === 5;
                            return (
                                <div 
                                    key={k.word}
                                    onClick={() => handleKeywordClick(k)}
                                    className={`
                                        group cursor-pointer p-4 rounded-xl border transition-all duration-300
                                        ${isGolden 
                                            ? "bg-gradient-to-br from-idle-gold/10 to-black border-idle-gold/30 hover:border-idle-gold/60" 
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-lg font-orbitron group-hover:text-idle-pink transition-colors">{k.word}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{k.phonetic}</div>
                                        </div>
                                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${isGolden ? "bg-idle-gold text-black" : "bg-white/10 text-gray-300"}`}>
                                            {isGolden ? "MAX" : `Lv.${mastery}`}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-300 mt-2 line-clamp-2">{k.definition}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

             {/* Mobile Overlay for Sidebar */}
             {isWordDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsWordDrawerOpen(false)}
                />
            )}
        </div>
      )}

      {/* Member Word Card Modal */}
      <AnimatePresence>
        {selectedWord && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={() => setSelectedWord(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-md bg-[#1a0b2e] border border-idle-pink/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(231,29,54,0.2)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative h-32 bg-gradient-to-br from-idle-pink to-idle-purple overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                        <div className="absolute bottom-4 left-6">
                            <h2 className="text-4xl font-orbitron font-bold text-white drop-shadow-lg">{selectedWord.word}</h2>
                            <p className="text-white/80 font-mono">{selectedWord.phonetic}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedWord(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div>
                            <div className="text-xs text-idle-gold font-bold uppercase tracking-wider mb-1">Definition</div>
                            <p className="text-lg text-gray-100 leading-relaxed">{selectedWord.definition}</p>
                            {selectedWord.funny_definition && (
                                <p className="text-sm text-idle-pink mt-2 italic">"{selectedWord.funny_definition}"</p>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Idol's Example</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-idle-purple/30 text-idle-purple border border-idle-purple/20">Exclusive</span>
                            </div>
                            <p className="text-gray-200 italic">"{selectedWord.star_comment}"</p>
                        </div>

                        <div className="flex gap-3">
                             <button 
                                onClick={() => {
                                    const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${selectedWord.word}&type=1`);
                                    audio.play();
                                }}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Play size={16} /> 發音
                            </button>
                            <button 
                                onClick={() => {
                                    practiceWord({
                                        word: selectedWord.word,
                                        meaning: selectedWord.definition,
                                        example: selectedWord.example,
                                        phonetic: selectedWord.phonetic,
                                        sourceId: mission.id,
                                    });
                                    addXp(5);
                                    setSelectedWord(null);
                                    playerRef.current?.playVideo();
                                }}
                                className="flex-1 py-3 rounded-xl bg-idle-pink hover:bg-idle-pink/80 text-white font-bold transition-colors"
                            >
                                收藏 +5 XP
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {stage === "practice" && (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mt-6">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold">特訓</h2>
              <p className="text-gray-400 text-sm">互動挑戰</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage("spotlight")}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              >
                返回
              </button>
              <button
                onClick={handleGoChat}
                className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                去真實陪練
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setPracticeStep(3)}
                className={practiceStep === 3 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                口說挑戰
              </button>
              <button
                onClick={() => setPracticeStep(0)}
                className={practiceStep === 0 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                填空
              </button>
              <button
                onClick={() => setPracticeStep(1)}
                className={practiceStep === 1 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                配對
              </button>
              <button
                onClick={() => setPracticeStep(2)}
                className={practiceStep === 2 ? "px-3 py-2 rounded-xl bg-idle-gold text-black font-bold" : "px-3 py-2 rounded-xl bg-white/10 border border-white/10"}
              >
                對話挑戰
              </button>
            </div>

            {practiceStep === 3 && (
              <div className="space-y-6 text-center py-10">
                <div className="space-y-2">
                    <div className="text-gray-400 text-sm">請大聲唸出這句話</div>
                    <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed px-4">
                        {mission.challenges.fillInTheBlank.sentence}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                     <button 
                        onClick={() => {
                            const u = new SpeechSynthesisUtterance(mission.challenges.fillInTheBlank.sentence);
                            u.lang = 'en-US';
                            u.rate = 0.9;
                            window.speechSynthesis.speak(u);
                        }}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                     >
                        <Volume2 size={24} className="text-idle-gold" />
                     </button>

                     <button
                        onClick={speechState === "listening" ? undefined : startListening}
                        disabled={speechState === "listening"}
                        className={`
                            relative p-6 rounded-full transition-all duration-300
                            ${speechState === "listening" ? "bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]" : "bg-idle-pink hover:bg-idle-pink/80 shadow-lg hover:scale-105"}
                        `}
                     >
                        <Mic size={32} className="text-white" />
                        {speechState === "listening" && (
                            <div className="absolute inset-0 rounded-full border-2 border-white animate-ping" />
                        )}
                     </button>
                </div>

                <div className="h-16 flex items-center justify-center">
                    {speechState === "listening" && (
                        <div className="text-idle-pink font-mono animate-pulse">正在聆聽... {transcript}</div>
                    )}
                    {speechState === "processing" && (
                         <div className="text-gray-400 flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} /> 分析中...
                         </div>
                    )}
                    {speechState === "result" && (
                        <div className="space-y-2">
                            <div className="text-sm text-gray-400">您的發音："{transcript}"</div>
                            <div className={`text-2xl font-bold ${speechScore >= 80 ? "text-idle-gold" : speechScore >= 60 ? "text-white" : "text-red-400"}`}>
                                分數：{speechScore} / 100
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}

            {practiceStep === 0 && (
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-2">句子</div>
                  <div className="text-lg text-white">{mission.challenges.fillInTheBlank.sentence}</div>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    value={fibInput}
                    onChange={(e) => setFibInput(e.target.value)}
                    disabled={fibDone}
                    placeholder="輸入缺少的單字"
                    className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
                  />
                  <button
                    onClick={handleCheckFib}
                    disabled={!fibInput.trim() || fibDone}
                    className="px-5 py-3 rounded-xl bg-idle-pink text-white font-bold disabled:opacity-50"
                  >
                    檢查
                  </button>
                </div>
                {fibDone && (
                  <div className={fibCorrect ? "text-idle-gold font-bold" : "text-red-300 font-bold"}>
                    {fibCorrect ? "答對了！" : `答案：${mission.challenges.fillInTheBlank.answer}`}
                  </div>
                )}
              </div>
            )}

            {practiceStep === 1 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-300">把每個單字配對到正確的解釋</div>
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
                        <option value="">選擇解釋</option>
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
                    送出
                  </button>
                  {matchingDone && (
                    <div className="text-idle-gold font-bold">
                      得分：{matchingScore}/{matchingPairs.length}
                    </div>
                  )}
                </div>
              </div>
            )}

            {practiceStep === 2 && (
              <div className="space-y-4">
                <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                  <div className="text-sm text-gray-300 mb-2">這次的對話挑戰</div>
                  <div className="text-lg text-white font-bold">{mission.challenges.chatChallenge.question}</div>
                  <div className="text-gray-400 text-sm mt-2">
                    回覆時至少用到兩個目標單字。
                  </div>
                </div>
                <button
                  onClick={handleGoChat}
                  className="px-5 py-3 rounded-xl bg-idle-gold text-black font-bold"
                >
                  開始真實陪練
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "real_chat" && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold text-xl">真實陪練</h2>
              <p className="text-gray-400 text-sm">把目標單字自然用進句子裡</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage("practice")}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
              >
                返回
              </button>
              <button
                onClick={handleFinishMission}
                className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                完成曲目
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
                <div className="text-sm text-gray-300">演出回饋</div>
                <div className="text-2xl font-orbitron font-bold text-white mt-1">{reviewMember}</div>
                <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-4 text-white">
                  {reviewText}
                </div>
                <div className="mt-5 flex items-center justify-between text-sm text-gray-300">
                  <span>特訓分數</span>
                  <span className="text-idle-gold font-bold">{practicePoints}/{totalPracticePoints}</span>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setStage("spotlight")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    回到聚光燈
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
