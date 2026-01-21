import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_TC, Orbitron } from "next/font/google";
import { LearningProvider } from "@/context/LearningContext";
import { Passport } from "@/components/Passport";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEVERLAND 翻譯學院",
  description: "和 I-DLE 一起練英文（翻譯官模式）",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${notoSansTc.variable} antialiased text-white pb-16 md:pb-0 text-shadow-soft`}
      >
        <div className="fixed inset-0 -z-10">
          <picture>
            <source media="(min-width: 768px)" srcSet="/assets/images/bg_desktop.webp" />
            <img
              src="/assets/images/bg_mobile.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "brightness(0.4)" }}
            />
          </picture>
          <div className="absolute inset-0 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.9)_100%)]" />
        </div>

        <div className="relative z-10">
          <LearningProvider>
            <Passport />
            {children}
            <BottomNav />
          </LearningProvider>
        </div>
      </body>
    </html>
  );
}
