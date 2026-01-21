"use client";

import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/constants";
import { useState, useEffect } from "react";

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

  // Split displayName into English and Chinese
  // Format: "SOYEON (小娟)" -> ["SOYEON", "小娟"]
  const nameParts = member.displayName.match(/([^(]+)(?:\(([^)]+)\))?/);
  const englishName = nameParts ? nameParts[1].trim() : member.displayName;
  const chineseName = nameParts && nameParts[2] ? nameParts[2].trim() : "";

  // Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  // Holographic Shine
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        await controls.start({
          x: ["100%", "-100%"],
          transition: { duration: 1.5, ease: "easeInOut", delay: 3 }
        });
      }
    };
    sequence();
  }, [controls]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ perspective: 1000 }}
      className="relative group cursor-pointer"
      onClick={() => onSelect(member)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative overflow-hidden rounded-xl aspect-[9/14] transition-all duration-300 shadow-xl",
          isSelected ? "ring-4 ring-[#ff007f] shadow-[0_0_30px_rgba(255,0,127,0.6)]" : "hover:shadow-2xl"
        )}
      >
        {/* Background Image - Sharp & Full Coverage */}
        {!avatarError && (
          <img
            src={avatarSrc}
            alt={member.displayName}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={() => setAvatarErrorSrc(avatarSrc)}
          />
        )}
        
        {/* Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(26,0,51,0.9) 0%, rgba(26,0,51,0.4) 50%, rgba(26,0,51,0.1) 100%)`
          }}
        />

        {/* Holographic Shine Overlay */}
        <motion.div
          animate={controls}
          className="absolute inset-0 w-[200%] h-full opacity-30 pointer-events-none z-20"
          style={{
            background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)",
            left: "-100%"
          }}
        />

        {/* Glassmorphism Info Box */}
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-white/5 backdrop-blur-lg border-t border-white/20 flex flex-col items-center justify-center z-10">
          
          {/* Avatar & Ring (Overlapping Top) */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* Neon Pulse Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00ff] blur-sm animate-pulse" />
              <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-[#ff007f] to-[#7a00ff]">
                <div className="w-full h-full rounded-full overflow-hidden bg-black">
                   {!avatarError ? (
                    <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                   ) : (
                    <User className="w-full h-full p-3 text-white/50" />
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Member Info */}
          <div className="mt-6 text-center px-2">
             <h3 className="text-white font-orbitron font-bold text-lg tracking-widest drop-shadow-md">
               {englishName}
             </h3>
             {chineseName && (
               <p className="text-white/80 font-serif text-sm mt-0.5 tracking-wide">
                 {chineseName}
               </p>
             )}
             <p className="text-[#ff007f] text-xs font-medium mt-1 uppercase tracking-wider">
               {member.role}
             </p>
          </div>
          
          {/* Selection Indicator (Subtle) */}
          {isSelected && (
            <motion.div 
              layoutId="selected-sparkle"
              className="absolute bottom-2 right-2 text-[#ff007f]"
            >
              <Sparkles size={16} className="animate-pulse" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
