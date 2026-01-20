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
    member: "Soyeon",
    name: "Windy Soyeon",
    rarity: "Common",
    image: "/assets/images/cards/soyeon_common.jpg",
    description: "Charismatic leader in her natural element."
  },
  {
    id: "soyeon_02",
    member: "Soyeon",
    name: "Super Lady Soyeon",
    rarity: "Super Rare",
    image: "/assets/images/cards/soyeon_rare.jpg",
    description: "The unstoppable force of I-DLE."
  },
  
  // Miyeon
  {
    id: "miyeon_01",
    member: "Miyeon",
    name: "Princess Miyeon",
    rarity: "Common",
    image: "/assets/images/cards/miyeon_common.jpg",
    description: "Elegant visuals that captivate everyone."
  },
  {
    id: "miyeon_02",
    member: "Miyeon",
    name: "Drive Miyeon",
    rarity: "Rare",
    image: "/assets/images/cards/miyeon_rare.jpg",
    description: "Refreshing vibes from her solo debut."
  },

  // Minnie
  {
    id: "minnie_01",
    member: "Minnie",
    name: "Dreamy Minnie",
    rarity: "Common",
    image: "/assets/images/cards/minnie_common.jpg",
    description: "Her voice is as unique as her style."
  },
  {
    id: "minnie_02",
    member: "Minnie",
    name: "Villain Dies Minnie",
    rarity: "Super Rare",
    image: "/assets/images/cards/minnie_rare.jpg",
    description: "A dark and mysterious aura."
  },

  // Yuqi
  {
    id: "yuqi_01",
    member: "Yuqi",
    name: "Rockstar Yuqi",
    rarity: "Common",
    image: "/assets/images/cards/yuqi_common.jpg",
    description: "Deep voice, bright energy."
  },
  {
    id: "yuqi_02",
    member: "Yuqi",
    name: "Rabbit Yuqi",
    rarity: "Rare",
    image: "/assets/images/cards/yuqi_rare.jpg",
    description: "Cute but fierce!"
  },

  // Shuhua
  {
    id: "shuhua_01",
    member: "Shuhua",
    name: "Boss Baby Shuhua",
    rarity: "Common",
    image: "/assets/images/cards/shuhua_common.jpg",
    description: "The savage maknae we all love."
  },
  {
    id: "shuhua_02",
    member: "Shuhua",
    name: "Nxde Shuhua",
    rarity: "Super Rare",
    image: "/assets/images/cards/shuhua_rare.jpg",
    description: "Breaking prejudices with confidence."
  },
];
