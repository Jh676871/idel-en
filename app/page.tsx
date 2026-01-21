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
    <main className="min-h-screen text-white overflow-x-hidden selection:bg-idle-pink selection:text-white relative transition-colors duration-1000">
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
      
      <div className="pt-14 md:pt-16 relative z-10">
        <Hero />
        
        <MemberSection 
          selectedMember={selectedMember} 
          onSelectMember={handleMemberSelect} 
        />

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
