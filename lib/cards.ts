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
    member: "SOYEON (小娟)",
    name: "Windy SOYEON",
    rarity: "Common",
    image: "/assets/images/cards/card_soyeon_01.webp",
    description: "氣場全開的隊長，天生就是舞台中心。"
  },
  {
    id: "soyeon_02",
    member: "SOYEON (小娟)",
    name: "Super Lady SOYEON",
    rarity: "Super Rare",
    image: "/assets/images/cards/card_soyeon_02.webp",
    description: "I-DLE 的推進器：自信、狠勁、全都拉滿。"
  },
  
  // Miyeon
  {
    id: "miyeon_01",
    member: "MIYEON (薇娟)",
    name: "Princess MIYEON",
    rarity: "Common",
    image: "/assets/images/cards/card_miyeon_01.webp",
    description: "溫柔又耀眼的門面光：一眼就被她收服。"
  },
  {
    id: "miyeon_02",
    member: "MIYEON (薇娟)",
    name: "Drive MIYEON",
    rarity: "Rare",
    image: "/assets/images/cards/card_miyeon_02.webp",
    description: "清爽感爆棚：像夏天一樣的微笑能量。"
  },

  // Minnie
  {
    id: "minnie_01",
    member: "MINNIE",
    name: "Dreamy MINNIE",
    rarity: "Common",
    image: "/assets/images/cards/card_minnie_01.webp",
    description: "夢幻聲線＋獨特風格：一句就讓人著迷。"
  },
  {
    id: "minnie_02",
    member: "MINNIE",
    name: "Villain Dies MINNIE",
    rarity: "Super Rare",
    image: "/assets/images/cards/card_minnie_02.webp",
    description: "暗黑又神秘的氛圍：眼神一秒把人帶走。"
  },

  // Yuqi
  {
    id: "yuqi_01",
    member: "YUQI (雨琦)",
    name: "Rockstar YUQI",
    rarity: "Common",
    image: "/assets/images/cards/card_yuqi_01.webp",
    description: "低音磁嗓＋陽光能量：一開口就很帥。"
  },
  {
    id: "yuqi_02",
    member: "YUQI (雨琦)",
    name: "Rabbit YUQI",
    rarity: "Rare",
    image: "/assets/images/cards/card_yuqi_02.webp",
    description: "可愛又兇：甜到不行、狠起來更迷人。"
  },

  // Shuhua
  {
    id: "shuhua_01",
    member: "SHUHUA (舒華)",
    name: "Boss Baby SHUHUA",
    rarity: "Common",
    image: "/assets/images/cards/card_shuhua_01.webp",
    description: "反差萌忙內：嘴硬但超可愛。"
  },
  {
    id: "shuhua_02",
    member: "SHUHUA (舒華)",
    name: "Nxde SHUHUA",
    rarity: "Super Rare",
    image: "/assets/images/cards/card_shuhua_02.webp",
    description: "自信打破偏見：帥到讓人想站起來鼓掌。"
  },
];
