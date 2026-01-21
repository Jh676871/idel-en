"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
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
  const avatarError = avatarErrorSrc === avatarSrc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={() => onSelect(member)}
      className={cn(
        "relative group cursor-pointer transition-all duration-500",
        isSelected ? "scale-105 -translate-y-2" : ""
      )}
    >
      {/* Glowing background effect */}
      <div 
        className={cn(
          "absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500",
          isSelected ? "opacity-100" : "",
          `bg-gradient-to-r ${member.colors.gradient}`
        )} 
        style={{
            background: isSelected 
                ? `linear-gradient(to right, ${member.colors.primary}, ${member.colors.accent})`
                : undefined
        }}
      />
      
      {/* Card Content - Glassmorphism */}
      <div className={cn(
        "relative bg-black/60 backdrop-blur-sm border border-idle-pink/30 p-6 rounded-xl flex flex-col items-center h-full transition-all duration-300",
        isSelected ? "bg-black/70 border-idle-pink/60 ring-1 ring-idle-pink/25" : "hover:bg-black/65"
      )}>
        <div className={cn(
          "w-24 h-24 rounded-full mb-4 p-[2px] transition-all duration-300",
          isSelected ? "shadow-[0_0_22px_rgba(255,255,255,0.35)]" : "group-hover:shadow-[0_0_22px_rgba(255,255,255,0.25)]"
        )} style={{
          background: `linear-gradient(135deg, ${member.colors.accent}, rgba(255,255,255,0.22))`
        }}>
          <div className={cn(
            "w-full h-full rounded-full overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md",
            isSelected ? "border-white/35" : "group-hover:border-white/30"
          )}>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
              {!avatarError && (
                <img
                  src={avatarSrc}
                  alt={member.displayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setAvatarErrorSrc(avatarSrc)}
                />
              )}
              {avatarError && <User className="w-10 h-10 text-white/45" />}
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold font-orbitron text-white mb-1">{member.displayName}</h3>
        <p className="text-sm text-gray-200/80 tracking-widest whitespace-nowrap">{member.role}</p>
        
        <div className={cn(
            "mt-4 transition-all duration-300",
            isSelected ? "opacity-100 transform translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
        )}>
           <span className={cn(
               "text-xs font-bold px-3 py-1 rounded-full transition-colors",
               isSelected ? "bg-white text-black" : "text-white bg-white/20"
           )}>
             {isSelected ? "已選擇" : "選擇"}
           </span>
        </div>
      </div>
    </motion.div>
  );
}
