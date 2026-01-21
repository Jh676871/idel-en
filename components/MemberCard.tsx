"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/constants";

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onSelect: (member: Member) => void;
  index: number;
}

export function MemberCard({ member, isSelected, onSelect, index }: MemberCardProps) {
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
        "relative bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl flex flex-col items-center h-full transition-all duration-300",
        isSelected ? "bg-black/60 border-white/30 ring-1 ring-white/20" : "hover:bg-black/60"
      )}>
        <div className={cn(
            "w-24 h-24 rounded-full mb-4 flex items-center justify-center overflow-hidden border-2 transition-all duration-300",
            isSelected ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "border-white/20 group-hover:border-white/50 bg-white/5"
        )}>
            {/* Placeholder for image */}
            <User className="w-12 h-12 text-gray-400" />
        </div>
        
        <h3 className="text-xl font-bold font-orbitron text-white mb-1">{member.name}</h3>
        <p className="text-sm text-gray-400 tracking-widest whitespace-nowrap">{member.role}</p>
        
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
