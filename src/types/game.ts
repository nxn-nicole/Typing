export type GameStatus = "idle" | "playing" | "paused" | "over";
export type GameMode = "classic" | "endless" | "letter";
export type WordBankStatus = "loading" | "online" | "local";

export type FallingWord = {
  id: number;
  text: string;
  x: number;
  y: number;
};

export type GameStats = {
  score: number;
  lives: number;
  correctKeys: number;
  totalKeys: number;
  elapsed: number;
};

export type HistoryEntry = GameStats & {
  id: string;
  playedAt: string;
  mode: GameMode;
  wordsCompleted: number;
};

export type GameApi = {
  status: GameStatus;
  words: FallingWord[];
  targetId: number | null;
  typed: string;
  stats: GameStats;
  accuracy: number;
  wpm: number;
  wordBankStatus: WordBankStatus;
  mode: GameMode;
  celebrationVisible: boolean;
  setMode: (mode: GameMode) => void;
  start: () => void;
  endGame: () => void;
  togglePause: () => void;
  dismissCelebration: () => void;
  history: HistoryEntry[];
  clearHistory: () => void;
};
