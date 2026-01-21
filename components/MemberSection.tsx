"use client";

import { MemberCard } from "./MemberCard";
import { motion } from "framer-motion";
import { MEMBERS, Member } from "@/lib/constants";

interface MemberSectionProps {
  selectedMember: Member | null;
  onSelectMember: (member: Member) => void;
}

export function MemberSection({ selectedMember, onSelectMember }: MemberSectionProps) {
  return (
    <section id="members" className="pt-10 pb-24 md:pt-20 md:pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center py-6 mb-8 md:mb-12"
      >
        <h2
          className="inline-flex items-center justify-center gap-2 text-3xl md:text-5xl font-bold font-orbitron mb-0 text-white tracking-wider bg-black/30 backdrop-blur-sm px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,1)" }}
        >
          選擇妳的專屬拍檔 <span className="text-idle-gold flicker-fast">🎤</span>
        </h2>
        <div className="h-1 w-16 bg-pink-500 mx-auto mt-2 shadow-[0_0_10px_#ff007f]" />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {MEMBERS.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            isSelected={selectedMember?.id === member.id}
            onSelect={onSelectMember}
          />
        ))}
      </div>
    </section>
  );
}
