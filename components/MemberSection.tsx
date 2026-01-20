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
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold font-orbitron mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Select Your Mentor
        </h2>
        <div className="h-1 w-24 bg-idle-pink mx-auto rounded-full" />
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
