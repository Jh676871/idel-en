"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MemberSection } from "@/components/MemberSection";
import { StartSection } from "@/components/StartSection";
import { MusicVideoSection } from "@/components/MusicVideoSection";
import { Member } from "@/lib/constants";
import { playSfx } from "@/lib/audio";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    playSfx('select');
  };

  return (
    <main className="min-h-screen bg-idle-purple text-white overflow-x-hidden selection:bg-idle-pink selection:text-white relative transition-colors duration-1000">
      {/* Dynamic Background Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0 opacity-20"
        style={{
          background: selectedMember 
            ? `radial-gradient(circle at 50% 50%, ${selectedMember.colors.primary}, transparent 70%)`
            : 'none'
        }}
      />

      <Navbar />
      
      <div className="pt-16 relative z-10">
        <Hero />
        
        <MemberSection 
          selectedMember={selectedMember} 
          onSelectMember={handleMemberSelect} 
        />

        {/* Welcome Message */}
        <AnimatePresence mode="wait">
          {selectedMember && (
            <motion.div
              key={selectedMember.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto px-4 py-8 text-center"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ background: `linear-gradient(to right, ${selectedMember.colors.primary}, ${selectedMember.colors.accent})` }}
                />
                <h3 className="text-2xl md:text-3xl font-orbitron font-bold mb-4" style={{ color: selectedMember.colors.accent }}>
                  {selectedMember.name}：翻譯官小助手，準備上場了嗎？
                </h3>
                <p className="text-xl md:text-2xl text-white italic font-light">
                  {selectedMember.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <MusicVideoSection />
        
        <StartSection />
      </div>
      
      {/* Footer / Credits */}
      <footer className="py-8 text-center text-gray-500 text-sm relative z-10">
        <p>© 2026 NEVERLAND 翻譯學院。粉絲專案。</p>
      </footer>
    </main>
  );
}
