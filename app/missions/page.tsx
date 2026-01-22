"use client";

import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import Link from "next/link";
import { AdminIngest } from "@/components/missions/AdminIngest";
import { Play, Lock, CheckCircle, Star, Music2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MissionsPage() {
  const { missions, removeMission, setCurrentMission } = useLearning();

  // Helper to determine status (Mock logic for now)
  const getStatus = (missionId: string) => {
    // In a real app, check progress
    return "new"; // 'locked' | 'new' | 'completed'
  };

  const getDifficultyStars = (diff: number) => {
    return Array(diff).fill(0).map((_, i) => (
      <Star key={i} size={12} className="fill-idle-gold text-idle-gold" />
    ));
  };

  return (
    <main className="min-h-screen text-white relative bg-[#1a0033]">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 pb-28 px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-gray-400 mb-2">CONTENT HUB</div>
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white">
              巡迴挑戰 <span className="text-idle-pink">MISSIONS</span>
            </h1>
            <p className="text-gray-400 mt-2">
              選擇曲目開始特訓，解鎖更多歌詞與獨家內容
            </p>
          </div>
        </div>

        {/* Admin / Dad Interface */}
        <AdminIngest />

        {/* Mission Grid */}
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 border-dashed">
            <Music2 size={48} className="text-white/20 mb-4" />
            <p className="text-gray-400 font-medium">暫無演出曲目</p>
            <p className="text-sm text-gray-500 mt-1">請使用上方 Admin 工具新增 YouTube 連結</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((m) => {
              const status = m.status || getStatus(m.id);
              const isLocked = status === "locked";
              
              return (
                <Link
                  key={m.id}
                  href={`/missions/${m.id}`} // Keeping existing route for player compatibility
                  onClick={(e) => {
                    if (isLocked) e.preventDefault();
                    setCurrentMission(m);
                  }}
                  className={cn(
                    "group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-idle-pink/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,127,0.15)]",
                    isLocked && "opacity-60 cursor-not-allowed grayscale"
                  )}
                >
                  {/* Card Header / Image Placeholder */}
                  <div className="h-32 bg-black/40 relative overflow-hidden">
                    {m.source.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={`https://img.youtube.com/vi/${m.source.id}/maxresdefault.jpg`} 
                        alt={m.title}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-idle-purple to-black">
                        <Music2 className="text-white/20" size={32} />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {status === "completed" && (
                        <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                          <CheckCircle size={12} /> COMPLETED
                        </div>
                      )}
                      {status === "new" && (
                        <div className="bg-idle-pink/20 text-idle-pink border border-idle-pink/30 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-md animate-pulse">
                          <Sparkles size={12} /> NEW
                        </div>
                      )}
                      {status === "locked" && (
                        <div className="bg-black/60 text-gray-400 border border-white/10 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                          <Lock size={12} /> LOCKED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="font-orbitron font-bold text-lg text-white truncate mb-1 group-hover:text-idle-pink transition-colors">
                      {m.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{m.mentor || "Soyeon"}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {getDifficultyStars(m.source.difficulty || 1)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                      <div className="text-xs text-gray-500 font-mono">
                        {m.keywords.length} KEYWORDS
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-idle-pink group-hover:text-white transition-colors">
                        <Play size={14} className="ml-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function SparklesIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

