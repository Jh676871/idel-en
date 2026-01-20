export interface Member {
  id: string;
  name: string;
  role: string;
  colors: {
    primary: string;
    accent: string;
    gradient: string;
    glow: string;
  };
  message: string;
}

export const MEMBERS: Member[] = [
  {
    id: 'soyeon',
    name: "Soyeon",
    role: "Leader & Rapper",
    colors: {
      primary: "#1a0033", // Deep Purple
      accent: "#ffd700", // Gold
      gradient: "from-purple-950 via-black to-purple-950",
      glow: "shadow-purple-500/50",
    },
    message: "I create the trend. Are you ready to create your future?",
  },
  {
    id: 'miyeon',
    name: "Miyeon",
    role: "Main Vocalist",
    colors: {
      primary: "#be185d", // Pink
      accent: "#fce7f3", // Light Pink
      gradient: "from-pink-950 via-black to-pink-950",
      glow: "shadow-pink-500/50",
    },
    message: "Sing with your heart! Let's make this lesson beautiful.",
  },
  {
    id: 'minnie',
    name: "Minnie",
    role: "Main Vocalist",
    colors: {
      primary: "#4338ca", // Indigo
      accent: "#e0e7ff", // Light Indigo
      gradient: "from-indigo-950 via-black to-indigo-950",
      glow: "shadow-indigo-500/50",
    },
    message: "Open your eyes to a new world. Let's dream together.",
  },
  {
    id: 'yuqi',
    name: "Yuqi",
    role: "Lead Dancer",
    colors: {
      primary: "#ea580c", // Orange
      accent: "#fcd34d", // Amber
      gradient: "from-orange-950 via-black to-orange-950",
      glow: "shadow-orange-500/50",
    },
    message: "Hi! I'm Yuqi! Ready to rock your English today?",
  },
  {
    id: 'shuhua',
    name: "Shuhua",
    role: "Visual",
    colors: {
      primary: "#0891b2", // Cyan
      accent: "#cffafe", // Light Cyan
      gradient: "from-cyan-950 via-black to-cyan-950",
      glow: "shadow-cyan-500/50",
    },
    message: "Don't be afraid to be yourself. Confidence is key!",
  },
];
