"use client";

import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import Link from "next/link";

export default function MissionsPage() {
  const { missions, removeMission, setCurrentMission } = useLearning();

  return (
    <main className="min-h-screen bg-idle-purple text-white relative">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 pb-28 px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-mono tracking-[0.35em] text-gray-400 mb-2">MISSIONS</div>
            <h1 className="text-3xl font-orbitron font-bold">今日演出曲目</h1>
            <p className="text-gray-400">AI 已把 World Tour 素材整理好，等妳帶隊友開練</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 whitespace-nowrap"
          >
            新增曲目
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-10 text-center text-gray-300">
            後台目前空空的... 快去 Admin 區挑幾首酷歌，準備今天的特訓吧！
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map((m) => (
              <div key={m.id} className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-orbitron font-bold">{m.title}</h2>
                    <div className="text-sm text-gray-400 mt-1">
                      <span className="mr-3">{m.source.type}</span>
                      <span className="mr-3">{m.proficiency}</span>
                      <span>{m.keywords.length} 個關鍵字</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMission(m.id)}
                    className="text-sm text-red-300 hover:text-red-200"
                  >
                    移除
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {m.keywords.slice(0, 6).map((k) => (
                    <span
                      key={k.word}
                      className="px-3 py-1 rounded-full text-xs bg-black/30 border border-white/10"
                    >
                      {k.word}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/missions/${m.id}`}
                    onClick={() => setCurrentMission(m)}
                    className="px-4 py-2 rounded-xl bg-idle-gold text-black font-bold whitespace-nowrap"
                  >
                    開始特訓
                  </Link>
                  <button
                    onClick={() => setCurrentMission(m)}
                    className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold whitespace-nowrap"
                  >
                    設為本日曲目
                  </button>
                  <Link
                    href="/chat"
                    onClick={() => setCurrentMission(m)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 whitespace-nowrap"
                  >
                    去陪練
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
