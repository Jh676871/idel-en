"use client";

import { Navbar } from "@/components/Navbar";
import { LyricDecoder } from "@/components/lyric-decoder/LyricDecoder";

export default function LyricsPage() {
  return (
    <main className="min-h-screen bg-idle-purple text-white">
      <Navbar />
      <div className="pt-16">
        <LyricDecoder />
      </div>
    </main>
  );
}
