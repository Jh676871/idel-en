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
    <section className="py-20 pb-28 md:pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold font-orbitron mb-4 text-white tracking-wider drop-shadow-[0_2px_10px_rgba(255,0,127,0.22)]">
          選擇妳的專屬拍檔 <span className="text-idle-gold flicker-fast">🎤</span>
        </h2>
        <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-idle-pink via-idle-gold to-idle-pink shadow-[0_0_18px_rgba(255,0,127,0.35)]" />
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
