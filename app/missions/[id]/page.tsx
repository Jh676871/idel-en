"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import { MissionPlayer } from "@/components/missions/MissionPlayer";

export default function MissionPlayerPage() {
  const params = useParams<{ id: string }>();
  const { missions } = useLearning();

  const mission = useMemo(() => {
    const id = params?.id;
    if (!id) return null;
    return missions.find((m) => m.id === id) || null;
  }, [missions, params?.id]);

  return (
    <main className="min-h-screen text-white relative">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 pb-28 px-4">
        {!mission ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <div className="text-xl font-orbitron font-bold">找不到曲目</div>
            <div className="text-gray-400 text-sm mt-2">回到「今日演出曲目」挑一首來練吧。</div>
            <div className="mt-5">
              <Link
                href="/missions"
                className="inline-flex px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                返回今日演出曲目
              </Link>
            </div>
          </div>
        ) : (
          <MissionPlayer mission={mission} />
        )}
      </div>
    </main>
  );
}
