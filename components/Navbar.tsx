"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Menu, Music, MessageCircle } from "lucide-react";
import { useState } from "react";

const navItems = [
  { en: "LYRICS", zh: "歌詞解碼", href: "/lyrics", icon: Music },
  { en: "CHAT", zh: "AI 偶像對話", href: "/chat", icon: MessageCircle },
  { en: "MISSIONS", zh: "巡迴挑戰", href: "/missions", icon: Target },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-idle-purple/80 backdrop-blur-md border-b border-white/10">
      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 bg-black/50 h-screen w-screen -z-10 ${isOpen ? "block" : "hidden"}`}
        onClick={() => setIsOpen(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <span
                className="glitch-hover text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-idle-pink to-idle-gold bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 font-orbitron"
                data-text="NEVERLAND 翻譯學院"
              >
                NEVERLAND 翻譯學院
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">
                      <span className="font-bold tracking-widest">{item.en}</span>
                      <span className="ml-1 text-[10px] text-gray-400">({item.zh})</span>
                    </span>
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idle-pink transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              ))}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto" },
          closed: { opacity: 0, height: 0 },
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-idle-purple/95"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
            >
              <item.icon className="w-5 h-5" />
              <span className="whitespace-nowrap">
                <span className="font-bold tracking-widest">{item.en}</span>
                <span className="ml-1 text-[10px] text-gray-400">({item.zh})</span>
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
