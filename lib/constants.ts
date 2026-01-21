export interface Member {
  id: string;
  name: string;
  displayName: string;
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
    displayName: "SOYEON (小娟)",
    role: "隊長／饒舌",
    colors: {
      primary: "#1a0033", // Deep Purple
      accent: "#ffd700", // Gold
      gradient: "from-purple-950 via-black to-purple-950",
      glow: "shadow-purple-500/50",
    },
    message: "翻譯官小助手，跟著我把舞台翻到全世界。今天一起把英文練到發光。",
  },
  {
    id: 'miyeon',
    name: "Miyeon",
    displayName: "MIYEON (薇娟)",
    role: "主唱",
    colors: {
      primary: "#be185d", // Pink
      accent: "#fce7f3", // Light Pink
      gradient: "from-pink-950 via-black to-pink-950",
      glow: "shadow-pink-500/50",
    },
    message: "翻譯官小助手，深呼吸～我們用最溫柔的發音，把每一句都唱進心裡。",
  },
  {
    id: 'minnie',
    name: "Minnie",
    displayName: "MINNIE",
    role: "主唱",
    colors: {
      primary: "#4338ca", // Indigo
      accent: "#e0e7ff", // Light Indigo
      gradient: "from-indigo-950 via-black to-indigo-950",
      glow: "shadow-indigo-500/50",
    },
    message: "翻譯官小助手，別怕出錯。跟我一起慢慢說，我會在旁邊陪妳。",
  },
  {
    id: 'yuqi',
    name: "Yuqi",
    displayName: "YUQI (雨琦)",
    role: "領舞",
    colors: {
      primary: "#ea580c", // Orange
      accent: "#fcd34d", // Amber
      gradient: "from-orange-950 via-black to-orange-950",
      glow: "shadow-orange-500/50",
    },
    message: "翻譯官小助手～今天我們用英文嗨起來！不完美也沒關係，先開口就贏了。",
  },
  {
    id: 'shuhua',
    name: "Shuhua",
    displayName: "SHUHUA (舒華)",
    role: "門面",
    colors: {
      primary: "#0891b2", // Cyan
      accent: "#cffafe", // Light Cyan
      gradient: "from-cyan-950 via-black to-cyan-950",
      glow: "shadow-cyan-500/50",
    },
    message: "翻譯官小助手，自信一點。妳的聲音很漂亮，我們一起把句子說得很有氣場。",
  },
];
