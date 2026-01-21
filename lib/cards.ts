export type Rarity = "Common" | "Rare" | "Super Rare";

export interface Photocard {
  id: string;
  member: string; // Soyeon, Miyeon, Minnie, Yuqi, Shuhua
  name: string; // e.g., "Queencard Soyeon"
  rarity: Rarity;
  image: string; // Path to image
  description?: string;
}

// Helper to get color by rarity
export const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case "Super Rare": return "from-idle-gold via-white to-idle-gold";
    case "Rare": return "from-idle-pink via-purple-400 to-idle-pink";
    case "Common": return "from-gray-400 to-gray-600";
    default: return "from-gray-400 to-gray-600";
  }
};

export const PHOTOCARDS: Photocard[] = [
  // Soyeon
  {
    id: "soyeon_01",
    member: "素妍",
    name: "Windy 素妍",
    rarity: "Common",
    image: "/assets/images/cards/soyeon_common.jpg",
    description: "氣場全開的隊長，天生就是舞台中心。"
  },
  {
    id: "soyeon_02",
    member: "素妍",
    name: "Super Lady 素妍",
    rarity: "Super Rare",
    image: "/assets/images/cards/soyeon_rare.jpg",
    description: "I-DLE 的推進器：自信、狠勁、全都拉滿。"
  },
  
  // Miyeon
  {
    id: "miyeon_01",
    member: "美延",
    name: "Princess 美延",
    rarity: "Common",
    image: "/assets/images/cards/miyeon_common.jpg",
    description: "溫柔又耀眼的門面光：一眼就被她收服。"
  },
  {
    id: "miyeon_02",
    member: "美延",
    name: "Drive 美延",
    rarity: "Rare",
    image: "/assets/images/cards/miyeon_rare.jpg",
    description: "清爽感爆棚：像夏天一樣的微笑能量。"
  },

  // Minnie
  {
    id: "minnie_01",
    member: "敏妮",
    name: "Dreamy 敏妮",
    rarity: "Common",
    image: "/assets/images/cards/minnie_common.jpg",
    description: "夢幻聲線＋獨特風格：一句就讓人著迷。"
  },
  {
    id: "minnie_02",
    member: "敏妮",
    name: "Villain Dies 敏妮",
    rarity: "Super Rare",
    image: "/assets/images/cards/minnie_rare.jpg",
    description: "暗黑又神秘的氛圍：眼神一秒把人帶走。"
  },

  // Yuqi
  {
    id: "yuqi_01",
    member: "雨琦",
    name: "Rockstar 雨琦",
    rarity: "Common",
    image: "/assets/images/cards/yuqi_common.jpg",
    description: "低音磁嗓＋陽光能量：一開口就很帥。"
  },
  {
    id: "yuqi_02",
    member: "雨琦",
    name: "Rabbit 雨琦",
    rarity: "Rare",
    image: "/assets/images/cards/yuqi_rare.jpg",
    description: "可愛又兇：甜到不行、狠起來更迷人。"
  },

  // Shuhua
  {
    id: "shuhua_01",
    member: "舒華",
    name: "Boss Baby 舒華",
    rarity: "Common",
    image: "/assets/images/cards/shuhua_common.jpg",
    description: "反差萌忙內：嘴硬但超可愛。"
  },
  {
    id: "shuhua_02",
    member: "舒華",
    name: "Nxde 舒華",
    rarity: "Super Rare",
    image: "/assets/images/cards/shuhua_rare.jpg",
    description: "自信打破偏見：帥到讓人想站起來鼓掌。"
  },
];
