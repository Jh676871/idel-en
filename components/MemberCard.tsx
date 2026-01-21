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

  // Split name into English and Chinese if possible
  const nameParts = member.displayName.match(/^([^(]+)(?:\(([^)]+)\))?$/);
  const enName = nameParts ? nameParts[1].trim() : member.displayName;
  const zhName = nameParts && nameParts[2] ? `(${nameParts[2]})` : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={() => onSelect(member)}
      whileTap={{ scale: 0.95, filter: "brightness(1.2)" }}
      className={cn(
        "relative group cursor-pointer transition-all duration-500",
        isSelected ? "scale-105 -translate-y-2 z-10" : ""
      )}
    >
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${member.colors.primary}80, transparent 70%)`,
          boxShadow: isSelected ? "0 0 30px rgba(255,0,127,0.4)" : "none"
        }}
      />

      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border transition-all duration-500 border-white/10",
          isSelected 
            ? "border-pink-500/60 shadow-[0_0_20px_rgba(255,0,127,0.3)]" 
            : "group-hover:border-pink-500/30"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden p-6 flex flex-col items-center transition-colors duration-300 min-h-[280px] sm:min-h-[260px] backdrop-blur-sm",
            isSelected ? "bg-black/30" : "bg-black/40 group-hover:bg-black/30"
          )}
        >
          {/* Background Image (Clear & High Quality) */}
          {!avatarError && (
            <img
              src={avatarSrc}
              alt=""
              className={cn(
                "absolute inset-0 w-full h-full object-cover object-top z-0 pointer-events-none select-none transition-all duration-700",
                isSelected 
                  ? "scale-110 opacity-100" 
                  : "scale-100 opacity-90 group-hover:scale-105"
              )}
              loading="lazy"
              onError={() => setAvatarErrorSrc(avatarSrc)}
            />
          )}
          
          {/* Dark Gradient Overlay for Text Readability */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)`
            }}
          />

          {/* Flash Effect on Select */}
          {isSelected && (
             <motion.div 
               initial={{ opacity: 0.8 }}
               animate={{ opacity: 0 }}
               transition={{ duration: 0.4 }}
               className="absolute inset-0 bg-white pointer-events-none z-[5]"
             />
          )}

          <div
            className={cn(
              "relative z-10 w-24 h-24 rounded-full mb-4 transition-all duration-300",
              "border border-pink-500 shadow-lg",
              isSelected ? "shadow-[0_0_15px_rgba(255,0,127,0.6)] scale-105" : "group-hover:scale-105 shadow-[0_0_10px_rgba(255,0,127,0.3)]"
            )}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden border-2 border-white/80 bg-black/20 backdrop-blur-sm"
            >
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

          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
              {enName}
              {zhName && <span className="text-base sm:text-lg font-normal ml-2 opacity-90 text-gray-300">{zhName}</span>}
            </h3>
            
            <div className="mt-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-sm">
              <p className="text-xs text-white/90 tracking-widest whitespace-nowrap uppercase font-bold">
                {member.role}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "relative z-10 mt-4 transition-all duration-300",
              isSelected ? "opacity-100 transform translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
            )}
          >
            <span
              className={cn(
                "text-xs font-bold px-3 py-1 rounded-full transition-colors",
                isSelected ? "bg-white text-black" : "text-white bg-white/20"
              )}
            >
              {isSelected ? "已選擇" : "選擇"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
