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
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${notoSansTc.variable} antialiased bg-idle-purple text-white pb-16 md:pb-0`}
      >
        <LearningProvider>
          <Passport />
          {children}
          <BottomNav />
        </LearningProvider>
      </body>
    </html>
  );
}
