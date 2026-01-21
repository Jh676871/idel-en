export type ContentType = 'lyric' | 'sns' | 'interview';

export type CefrLevel = "A2" | "B1" | "B2" | "C1";

export interface ContentSource {
  id: string;
  title: string;
  type: ContentType;
  rawText: string;
  mediaUrl?: string;
  difficulty: 1 | 2 | 3;
}

export interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phonetic?: string;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  sourceId: string;
  addedAt: number;
}

export interface UserProgress {
  xp: number;
  rank: string;
  unlockedCards: string[];
  wordBank: Vocabulary[];
  chatCount: number;
}

export interface ProcessedKeyword {
  word: string;
  definition: string;
  phonetic: string;
  example: string;
  cefr: CefrLevel;
}

export interface ProcessedChallenges {
  fillInTheBlank: {
    sentence: string;
    answer: string;
  };
  definitionMatching: {
    pairs: Array<{
      word: string;
      definition: string;
    }>;
  };
  chatChallenge: {
    question: string;
  };
}

export interface ProcessedMission {
  id: string;
  createdAt: number;
  source: ContentSource;
  proficiency: CefrLevel;
  title: string;
  keywords: ProcessedKeyword[];
  challenges: ProcessedChallenges;
  // New fields for Content Hub
  lrcData?: Array<{ timestamp: string; content: string }>; // LRC format timestamps
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
  mentor?: string; // Assigned member mentor
  status?: "locked" | "new" | "completed"; // Mission progress
}
