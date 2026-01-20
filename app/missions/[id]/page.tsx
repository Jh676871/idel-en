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
    <main className="min-h-screen bg-idle-purple text-white relative">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-24 pb-28 px-4">
        {!mission ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
            <div className="text-xl font-orbitron font-bold">Mission not found</div>
            <div className="text-gray-400 text-sm mt-2">Go back to Missions and select one.</div>
            <div className="mt-5">
              <Link
                href="/missions"
                className="inline-flex px-4 py-2 rounded-xl bg-idle-pink text-white font-bold"
              >
                Back to Missions
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

