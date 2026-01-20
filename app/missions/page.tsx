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
            <h1 className="text-3xl font-orbitron font-bold">Missions</h1>
            <p className="text-gray-400">AI-processed content ready for learning</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Add Mission
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-10 text-center text-gray-300">
            No missions yet. Create one in Admin.
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
                      <span>{m.keywords.length} keywords</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMission(m.id)}
                    className="text-sm text-red-300 hover:text-red-200"
                  >
                    Remove
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
                    className="px-4 py-2 rounded-xl bg-idle-gold text-black font-bold"
                  >
                    Play Mission
                  </Link>
                  <button
                    onClick={() => setCurrentMission(m)}
                    className="px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
                  >
                    Set Current
                  </button>
                  <Link
                    href="/chat"
                    onClick={() => setCurrentMission(m)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Go Chat
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
