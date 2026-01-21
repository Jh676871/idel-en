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
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl blur-2xl transition-opacity duration-500",
          isSelected ? "opacity-100" : "opacity-55 group-hover:opacity-80"
        )}
        style={{
          background: `radial-gradient(circle at 30% 20%, ${member.colors.accent}40, transparent 55%), radial-gradient(circle at 70% 80%, ${member.colors.primary}66, transparent 60%)`,
        }}
      />

      <div
        className={cn(
          "relative rounded-2xl bg-gradient-to-r from-idle-pink/70 via-idle-gold/50 to-idle-pink/70",
          isSelected
            ? "p-[2px] animate-border-pulse shadow-[0_0_24px_rgba(255,0,127,0.55),0_0_46px_rgba(255,215,0,0.22)]"
            : "p-[1px] shadow-[0_0_16px_rgba(255,0,127,0.22)]"
        )}
      >
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md p-6 flex flex-col items-center transition-colors duration-300 min-h-[280px] sm:min-h-[260px]",
            isSelected ? "bg-black/55" : "group-hover:bg-black/45"
          )}
        >
          {!avatarError && (
            <img
              src={avatarSrc}
              alt=""
              className={cn(
                "absolute inset-0 w-full h-full object-cover scale-150 blur-xl transition-opacity duration-300 pointer-events-none select-none",
                isSelected ? "opacity-40" : "opacity-20"
              )}
              loading="lazy"
              onError={() => setAvatarErrorSrc(avatarSrc)}
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.75))`,
            }}
          />

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
        
        <h3 className="text-xl font-bold font-orbitron text-white mb-1 text-shadow-soft">{member.displayName}</h3>
        <p className="text-sm text-gray-200/85 tracking-widest whitespace-nowrap text-shadow-soft">{member.role}</p>
        
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
      </div>
    </motion.div>
  );
}
