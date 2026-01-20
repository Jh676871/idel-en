export interface WordData {
  word: string;
  phonetic: string;
  definitionEn: string;
  definitionCn: string;
  challenge: {
    sentence: string; // "She has a lot of [blank]."
    answer: string;
  };
}

export interface LyricLine {
  id: string;
  timestamp: number;
  text: string;
  keyWords?: Record<string, WordData>; // Map "word" in text to data
  speaker?: string; // e.g., "Soyeon"
}

export const QUEENCARD_LYRICS: LyricLine[] = [
  {
    id: "l1",
    timestamp: 0,
    text: "(Queencard, Queencard, I'm hot, I'm hot)",
    speaker: "All",
    keyWords: {
      "Queencard": {
        word: "Queencard",
        phonetic: "/kwiːn kɑːrd/",
        definitionEn: "A slang term (Konglish) referring to the most popular or attractive girl at school/party.",
        definitionCn: "校花 / 最受欢迎的女孩 (韩式英语 slang)",
        challenge: {
          sentence: "Everyone wants to be the ___ of the party.",
          answer: "Queencard"
        }
      }
    }
  },
  {
    id: "l2",
    timestamp: 5,
    text: "I am the top, I am twerking on the runway",
    speaker: "Soyeon",
    keyWords: {
      "runway": {
        word: "Runway",
        phonetic: "/ˈrʌn.weɪ/",
        definitionEn: "A long platform that models walk on to show off clothes.",
        definitionCn: "T台 / 秀场跑道",
        challenge: {
          sentence: "The model walked down the ___ with confidence.",
          answer: "runway"
        }
      }
    }
  },
  {
    id: "l3",
    timestamp: 10,
    text: "I am a Queencard, you wanna be the Queencard?",
    speaker: "Soyeon",
  },
  {
    id: "l4",
    timestamp: 15,
    text: "I'm a Queencard, I'm a Queencard, I'm a Queencard",
    speaker: "All",
  },
  {
    id: "l5",
    timestamp: 20,
    text: "Spotlight날 봐 (Look at me)",
    speaker: "Minnie",
    keyWords: {
        "Spotlight": {
            word: "Spotlight",
            phonetic: "/ˈspɒt.laɪt/",
            definitionEn: "A strong light that shines on a stage performer; center of attention.",
            definitionCn: "聚光灯 / 关注焦点",
            challenge: {
                sentence: "She loves being in the ___.",
                answer: "spotlight"
            }
        }
    }
  },
  {
      id: "l6",
      timestamp: 25,
      text: "I'm a star, star, star",
      speaker: "Minnie",
  },
  {
    id: "l7",
    timestamp: 30,
    text: "My fashion style is so cool",
    speaker: "Yuqi",
    keyWords: {
        "style": {
            word: "Style",
            phonetic: "/staɪl/",
            definitionEn: "A particular way of doing something or wearing clothes.",
            definitionCn: "风格 / 时尚",
            challenge: {
                sentence: "I really like your unique ___.",
                answer: "style"
            }
        }
    }
  }
];
