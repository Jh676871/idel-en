"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/constants";
import { useState } from "react";

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onSelect: (member: Member) => void;
  index: number;
}

export function MemberCard({ member, isSelected, onSelect, index }: MemberCardProps) {
  const avatarSrc = `/assets/images/members/member_${member.id}.webp`;
  const [avatarErrorSrc, setAvatarErrorSrc] = useState<string | null>(null);
  
  // Extract English name for the poster style (remove parenthesis content)
  const nameParts = member.displayName.match(/^([^(]+)(?:\(([^)]+)\))?$/);
  const displayName = nameParts ? nameParts[1].trim() : member.displayName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onSelect(member)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300",
        // 5. Active State: Neon Pink glowing border
        isSelected 
          ? "border-2 border-pink-500 shadow-[0_0_20px_rgba(255,0,127,0.6)]" 
          : "border-2 border-transparent hover:border-white/20"
      )}
    >
      {/* 2. Poster Style Image (Full Bleed, Sharp, Center 20%) */}
      <img
        src={avatarErrorSrc || avatarSrc}
        alt={member.displayName}
        className={cn(
          "absolute inset-0 w-full h-full object-cover object-[center_20%] transition-transform duration-700 ease-out",
          // Slight zoom on hover for life
          "group-hover:scale-105"
        )}
        loading="lazy"
        onError={() => setAvatarErrorSrc(avatarSrc)}
      />

      {/* 3. Text Protection: Deep Black Gradient at Bottom 25% */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none"
      />

      {/* 4. Typography: Centered on the gradient */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 flex flex-col items-center justify-end z-10 pointer-events-none">
        <h3 className="text-white font-bold tracking-widest uppercase text-2xl md:text-3xl font-orbitron drop-shadow-md mb-2 text-center">
          {displayName}
        </h3>
        <p className="text-gray-300 text-xs tracking-[0.2em] font-light uppercase opacity-90 text-center">
          {member.role}
        </p>
      </div>

      {/* Optional: Subtle flash on select */}
      {isSelected && (
         <motion.div 
           initial={{ opacity: 0.5 }}
           animate={{ opacity: 0 }}
           transition={{ duration: 0.3 }}
           className="absolute inset-0 bg-white pointer-events-none z-20"
         />
      )}
    </motion.div>
  );
}
