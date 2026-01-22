"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProgress, Vocabulary, ProcessedMission, CefrLevel } from '@/types';

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const EMPTY_LEARNING_STATE: {
  progress: UserProgress;
  tickets: number;
  missions: ProcessedMission[];
  currentMission: ProcessedMission | null;
} = {
  progress: { xp: 0, rank: "Trainee", unlockedCards: [], wordBank: [], chatCount: 0 },
  tickets: 0,
  missions: [],
  currentMission: null,
};

function loadLearningStateFromStorage() {
  if (typeof window === "undefined") return EMPTY_LEARNING_STATE;

  const savedProgress = parseJson<Partial<UserProgress>>(localStorage.getItem("idle_learning_progress"));
  const savedTickets = localStorage.getItem("idle_tickets");
  const savedMissions = parseJson<ProcessedMission[]>(localStorage.getItem("idle_missions"));
  const savedCurrentMission = parseJson<ProcessedMission>(localStorage.getItem("idle_current_mission"));

  const progress: UserProgress = {
    ...EMPTY_LEARNING_STATE.progress,
    ...(savedProgress || {}),
  };

  let tickets = 0;
  if (savedTickets) {
    const n = Number.parseInt(savedTickets, 10);
    tickets = Number.isFinite(n) ? n : 0;
  }

  if (!savedProgress) {
    const oldProgress = parseJson<{ xp?: number; chatCount?: number; unlockedCards?: string[]; tickets?: number }>(
      localStorage.getItem("neverland_progress")
    );
    const oldCollection = parseJson<Array<{ word?: string; phonetic?: string; definition?: string; addedAt?: number }>>(
      localStorage.getItem("neverland_collection")
    );

    if (oldProgress || oldCollection) {
      const migratedWords: Vocabulary[] = (oldCollection || []).flatMap((w) => {
        if (!w?.word || !w?.definition) return [];
        return [
          {
            word: w.word,
            meaning: w.definition,
            example: "",
            phonetic: w.phonetic,
            masteryLevel: 0,
            sourceId: "legacy",
            addedAt: w.addedAt || Date.now(),
          },
        ];
      });

      progress.xp = oldProgress?.xp || 0;
      progress.chatCount = oldProgress?.chatCount || 0;
      progress.unlockedCards = oldProgress?.unlockedCards || [];
      progress.wordBank = migratedWords;
      tickets = oldProgress?.tickets || tickets;
    }
  }

  return {
    progress,
    tickets,
    missions: savedMissions || [],
    currentMission: savedCurrentMission || null,
  };
}

function getInitialLearningState() {
  return EMPTY_LEARNING_STATE;
}

interface LearningContextType {
  // User Progress
  progress: UserProgress;
  addXp: (amount: number) => void;
  
  // Word Bank
  wordBank: Vocabulary[];
  addWord: (word: Omit<Vocabulary, 'addedAt' | 'masteryLevel'>) => void;
  practiceWord: (word: Omit<Vocabulary, 'addedAt' | 'masteryLevel'>) => void;
  removeWord: (word: string) => void;
  isSaved: (word: string) => boolean;
  
  // Gacha / Unlocks
  tickets: number;
  addTicket: (amount: number) => void;
  unlockCard: (cardId: string) => void;
  spendTicket: () => boolean;
  incrementChatCount: () => void;

  // Missions
  missions: ProcessedMission[];
  addMission: (mission: ProcessedMission) => void;
  updateMission: (missionId: string, updates: Partial<ProcessedMission>) => void;
  removeMission: (missionId: string) => void;
  currentMission: ProcessedMission | null;
  setCurrentMission: (mission: ProcessedMission | null) => void;
  getAverageWordMastery: () => number;
  getSuggestedCefr: () => CefrLevel;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const RANK_THRESHOLDS = [
  { name: "Trainee", xp: 0 },
  { name: "Rookie", xp: 100 },
  { name: "Idol", xp: 500 },
  { name: "Star", xp: 1000 },
  { name: "Superstar", xp: 2000 },
  { name: "Legend", xp: 5000 },
];

export function LearningProvider({ children }: { children: ReactNode }) {
  const initial = getInitialLearningState();

  // State
  const [progress, setProgress] = useState<UserProgress>(initial.progress);
  
  const [tickets, setTickets] = useState(initial.tickets);
  const [missions, setMissions] = useState<ProcessedMission[]>(initial.missions);
  const [currentMission, setCurrentMission] = useState<ProcessedMission | null>(initial.currentMission);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      const loaded = loadLearningStateFromStorage();
      setProgress(loaded.progress);
      setTickets(loaded.tickets);
      setMissions(loaded.missions);
      setCurrentMission(loaded.currentMission);
      setHasLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Persistence: Save
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem('idle_learning_progress', JSON.stringify(progress));
    localStorage.setItem('idle_tickets', tickets.toString());
    localStorage.setItem('idle_missions', JSON.stringify(missions));
    localStorage.setItem('idle_current_mission', JSON.stringify(currentMission));
  }, [hasLoaded, progress, tickets, missions, currentMission]);

  // Actions
  const calculateRank = (xp: number) => {
    const rank = RANK_THRESHOLDS.slice().reverse().find(t => xp >= t.xp);
    return rank ? rank.name : "Trainee";
  };

  const addXp = (amount: number) => {
    setProgress(prev => {
      const newXp = prev.xp + amount;
      const newRank = calculateRank(newXp);
      
      // Ticket logic: Every 50 XP
      const oldTickets = Math.floor(prev.xp / 50);
      const newTicketsCount = Math.floor(newXp / 50);
      if (newTicketsCount > oldTickets) {
        setTickets(t => t + (newTicketsCount - oldTickets));
      }

      return {
        ...prev,
        xp: newXp,
        rank: newRank
      };
    });
  };

  const addWord = (wordInput: Omit<Vocabulary, 'addedAt' | 'masteryLevel'>) => {
    setProgress(prev => {
      if (prev.wordBank.some(w => w.word === wordInput.word)) return prev;
      
      const newWord: Vocabulary = {
        ...wordInput,
        masteryLevel: 0,
        addedAt: Date.now()
      };
      
      // Side effect: Add XP for new word
      // We need to call addXp but we are inside setProgress. 
      // Better to handle XP addition separately or strictly here.
      // Since addXp relies on previous state, let's do it via a timeout or refactor.
      // For simplicity in this batched update, I'll update XP here manually.
      
      const xpReward = 10;
      const newXp = prev.xp + xpReward;
      const newRank = calculateRank(newXp);
       
      // Ticket logic duplication (refactor candidate)
      const oldTickets = Math.floor(prev.xp / 50);
      const newTicketsCount = Math.floor(newXp / 50);
      if (newTicketsCount > oldTickets) {
        setTimeout(() => setTickets(t => t + (newTicketsCount - oldTickets)), 0);
      }

      return {
        ...prev,
        wordBank: [...prev.wordBank, newWord],
        xp: newXp,
        rank: newRank
      };
    });
  };

  const practiceWord = (wordInput: Omit<Vocabulary, 'addedAt' | 'masteryLevel'>) => {
    setProgress(prev => {
      const idx = prev.wordBank.findIndex(w => w.word.toLowerCase() === wordInput.word.toLowerCase());
      if (idx === -1) {
        const newWord: Vocabulary = {
          ...wordInput,
          masteryLevel: 1,
          addedAt: Date.now()
        };
        return {
          ...prev,
          wordBank: [newWord, ...prev.wordBank]
        };
      }

      const current = prev.wordBank[idx];
      const nextLevel = Math.min(5, current.masteryLevel + 1) as Vocabulary["masteryLevel"];
      if (nextLevel === current.masteryLevel) return prev;

      const nextBank = prev.wordBank.slice();
      nextBank[idx] = {
        ...current,
        masteryLevel: nextLevel,
        meaning: wordInput.meaning || current.meaning,
        example: wordInput.example || current.example,
        phonetic: wordInput.phonetic || current.phonetic,
        sourceId: wordInput.sourceId || current.sourceId,
      };
      return {
        ...prev,
        wordBank: nextBank
      };
    });
  };

  const removeWord = (word: string) => {
    setProgress(prev => ({
      ...prev,
      wordBank: prev.wordBank.filter(w => w.word !== word)
    }));
  };

  const isSaved = (word: string) => {
    return progress.wordBank.some(w => w.word === word);
  };

  const addTicket = (amount: number) => {
    setTickets(prev => prev + amount);
  };

  const unlockCard = (cardId: string) => {
    setProgress(prev => {
      if (prev.unlockedCards.includes(cardId)) return prev;
      return {
        ...prev,
        unlockedCards: [...prev.unlockedCards, cardId]
      };
    });
  };

  const spendTicket = () => {
    if (tickets > 0) {
      setTickets(t => t - 1);
      return true;
    }
    return false;
  };

  const incrementChatCount = () => {
    setProgress(prev => ({
      ...prev,
      chatCount: prev.chatCount + 1
    }));
  };

  const addMission = (mission: ProcessedMission) => {
    setMissions(prev => [mission, ...prev]);
  };

  const updateMission = (missionId: string, updates: Partial<ProcessedMission>) => {
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, ...updates } : m));
    setCurrentMission(prev => (prev?.id === missionId ? { ...prev, ...updates } : prev));
  };

  const removeMission = (missionId: string) => {
    setMissions(prev => prev.filter(m => m.id !== missionId));
    setCurrentMission(prev => (prev?.id === missionId ? null : prev));
  };

  const getAverageWordMastery = () => {
    if (progress.wordBank.length === 0) return 0;
    const total = progress.wordBank.reduce((sum, w) => sum + w.masteryLevel, 0);
    return total / progress.wordBank.length;
  };

  const getSuggestedCefr = (): CefrLevel => {
    const avg = getAverageWordMastery();
    if (avg >= 4) return "C1";
    if (avg >= 3) return "B2";
    if (avg >= 2) return "B1";
    return "A2";
  };

  return (
    <LearningContext.Provider value={{
      progress,
      addXp,
      wordBank: progress.wordBank,
      addWord,
      practiceWord,
      removeWord,
      isSaved,
      tickets,
      addTicket,
      unlockCard,
      spendTicket,
      incrementChatCount,
      missions,
      addMission,
      updateMission,
      removeMission,
      currentMission,
      setCurrentMission,
      getAverageWordMastery,
      getSuggestedCefr
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
