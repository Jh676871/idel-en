export interface WordData {
  word: string;
  phonetic: string;
  definitionEn: string;
  definitionCn: string;
  idolExample?: string; // New field for 3.0 content
  challenge: {
    sentence: string; // "She has a lot of [blank]."
    answer: string;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const QUEENCARD_QUIZ: QuizQuestion[] = [
  {
    question: "What does 'Queencard' refer to in the song?",
    options: ["A royal invitation", "The most popular girl", "A credit card", "A game card"],
    correctAnswer: "The most popular girl"
  },
  {
    question: "Where is Soyeon twerking?",
    options: ["On the stage", "On the runway", "In the car", "At home"],
    correctAnswer: "On the runway"
  },
  {
    question: "What does Minnie want you to look at?",
    options: ["Her shoes", "The spotlight", "The mirror", "The phone"],
    correctAnswer: "The spotlight"
  }
];

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
        definitionCn: "校花／最受歡迎的女孩（韓式英語 slang）",
        idolExample: "Soyeon: \"Hey, don't be shy. You are the Queencard of your own life!\"",
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
        definitionCn: "T 台／秀場跑道",
        idolExample: "Miyeon: \"Walking on the runway makes me feel like a princess.\"",
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
            definitionCn: "聚光燈／關注焦點",
            idolExample: "Minnie: \"I love it when the spotlight hits me during the intro!\"",
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
            definitionCn: "風格／時尚",
            challenge: {
                sentence: "I really like your unique ___.",
                answer: "style"
            }
        }
    }
  }
];
