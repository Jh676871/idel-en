"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, BookOpen, Grid } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "我的舞台", href: "/", icon: Home },
  { name: "巡迴挑戰", href: "/missions", icon: Target },
  { name: "靈魂單字本", href: "/collection", icon: BookOpen },
  { name: "寶藏盒", href: "/binder", icon: Grid },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-idle-purple/90 backdrop-blur-lg border-t border-white/10 pb-safe z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-idle-pink" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-idle-pink/50 blur-lg rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
