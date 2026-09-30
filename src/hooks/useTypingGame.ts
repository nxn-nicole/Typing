import { useEffect, useRef, useState } from "react";
import { WORDS } from "../data/words";
import { fetchWordBank } from "../services/wordApi";
import {
  playCompleteSound,
  playCorrectSound,
  playFailureSound,
} from "../utils/sound";
import type {
  FallingWord,
  GameApi,
  GameStats,
  GameMode,
  HistoryEntry,
  WordBankStatus,
} from "../types/game";

const BOARD_HEIGHT = 520;
const MAX_LIVES = 5;
const HISTORY_KEY = "typing-game-history";
const CELEBRATION_MILESTONES = [10, 20, 40];
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
let nextWordId = 0;

type MutableGame = GameStats & {
  mode: GameMode;
  words: FallingWord[];
  targetId: number | null;
  typed: string;
  wordsCompleted: number;
  spawnTimer: number;
};

const createGame = (mode: GameMode = "classic"): MutableGame => ({
  mode,
  words: [],
  targetId: null,
  typed: "",
  score: 0,
  lives: MAX_LIVES,
  correctKeys: 0,
  totalKeys: 0,
  elapsed: 0,
  wordsCompleted: 0,
  spawnTimer: mode === "letter" ? 0.8 : 0.3,
});

const loadHistory = (): HistoryEntry[] => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const entries = saved ? (JSON.parse(saved) as HistoryEntry[]) : [];
    return entries.map((entry) => ({
      ...entry,
      mode: entry.mode ?? "classic",
    }));
  } catch {
    return [];
  }
};

const spawnWord = (game: MutableGame, wordBank: string[]) => {
  const source = game.mode === "letter" ? LETTERS : wordBank;
  const text = source[Math.floor(Math.random() * source.length)];
  game.words.push({
    id: nextWordId++,
    text,
    x: 5 + Math.random() * 78,
    y: -36,
  });
};

const getSnapshot = (
  game: MutableGame,
): Pick<GameApi, "words" | "targetId" | "typed" | "stats"> => ({
  words: [...game.words],
  targetId: game.targetId,
  typed: game.typed,
  stats: {
    score: game.score,
    lives: game.lives,
    correctKeys: game.correctKeys,
    totalKeys: game.totalKeys,
    elapsed: game.elapsed,
  },
});

export function useTypingGame(): GameApi {
  const gameRef = useRef(createGame());
  const [status, setStatus] = useState<GameApi["status"]>("idle");
  const [mode, setModeState] = useState<GameMode>("classic");
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [view, setView] = useState(() => getSnapshot(createGame()));
  const [wordBank, setWordBank] = useState(WORDS);
  const [wordBankStatus, setWordBankStatus] =
    useState<WordBankStatus>("loading");
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  useEffect(() => {
    let active = true;
    fetchWordBank()
      .then((words) => {
        if (!active) return;
        setWordBank(words);
        setWordBankStatus(words.length > WORDS.length ? "online" : "local");
      })
      .catch(() => {
        if (active) setWordBankStatus("local");
      });
    return () => {
      active = false;
    };
  }, []);

  const finishGame = () => {
    const game = gameRef.current;
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      playedAt: new Date().toISOString(),
      mode: game.mode,
      score: game.score,
      lives: game.lives,
      correctKeys: game.correctKeys,
      totalKeys: game.totalKeys,
      elapsed: game.elapsed,
      wordsCompleted: game.wordsCompleted,
    };
    setHistory((current) => {
      const next = [entry, ...current].slice(0, 16);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    setStatus("over");
  };

  const setMode = (nextMode: GameMode) => {
    if (status === "playing" || nextMode === mode) return;
    setModeState(nextMode);
    if (status === "paused") {
      const newGame = createGame(nextMode);
      gameRef.current = newGame;
      setCelebrationVisible(false);
      setView(getSnapshot(newGame));
      setStatus("idle");
    }
  };

  const start = () => {
    const newGame = createGame(mode);
    gameRef.current = newGame;
    setCelebrationVisible(false);
    setView(getSnapshot(newGame));
    setStatus("playing");
  };

  const endGame = () => {
    if (status !== "playing" && status !== "paused") return;
    setView(getSnapshot(gameRef.current));
    finishGame();
  };

  const currentHistory = history.filter((entry) => entry.mode === mode);

  useEffect(() => {
    if (!celebrationVisible) return undefined;

    const timeout = window.setTimeout(() => {
      setCelebrationVisible(false);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [celebrationVisible]);

  const togglePause = () => {
    setStatus((current) => {
      if (current === "playing") return "paused";
      if (current === "paused") return "playing";
      return current;
    });
  };

  useEffect(() => {
    if (status !== "playing") return undefined;

    let animationFrame = 0;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const game = gameRef.current;
      game.elapsed += delta;
      const speed =
        game.mode === "letter"
          ? 100 + game.elapsed * 0.7
          : 36 + game.elapsed * 0.5;
      const interval =
        game.mode === "letter"
          ? Math.max(1.1, 2.5 - game.elapsed * 0.008)
          : Math.max(0.9, 2.1 - game.elapsed * 0.012);
      game.spawnTimer -= delta;
      if (game.spawnTimer <= 0) {
        spawnWord(game, wordBank);
        game.spawnTimer = interval;
      }

      game.words.forEach((word) => {
        word.y += speed * delta;
      });
      const fallen = game.words.filter((word) => word.y > BOARD_HEIGHT - 48);
      if (fallen.length > 0) {
        playFailureSound();
        if (game.mode !== "endless") game.lives -= fallen.length;
        if (fallen.some((word) => word.id === game.targetId)) {
          game.targetId = null;
          game.typed = "";
        }
        game.words = game.words.filter((word) => word.y <= BOARD_HEIGHT - 48);
      }

      if (game.mode !== "endless" && game.lives <= 0) {
        game.lives = 0;
        setView(getSnapshot(game));
        finishGame();
        return;
      }

      setView(getSnapshot(game));
      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [status, wordBank]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (status === "paused") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          togglePause();
        }
        return;
      }
      if (status !== "playing") {
        if (event.key === "Enter") start();
        return;
      }

      const game = gameRef.current;
      if (event.key === "Backspace") {
        game.targetId = null;
        game.typed = "";
        setView(getSnapshot(game));
        return;
      }
      if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) return;
      event.preventDefault();

      const letter = event.key.toLowerCase();
      game.totalKeys += 1;
      let nextTyped = `${game.typed}${letter}`;
      let candidates = game.words
        .filter((word) => word.text.startsWith(nextTyped))
        .sort((first, second) => second.y - first.y);

      if (candidates.length === 0 && game.typed) {
        nextTyped = letter;
        candidates = game.words
          .filter((word) => word.text.startsWith(nextTyped))
          .sort((first, second) => second.y - first.y);
      }

      const target = candidates[0];
      if (!target) {
        playFailureSound();
        game.targetId = null;
        game.typed = "";
        setView(getSnapshot(game));
        return;
      }

      game.targetId = target.id;
      game.typed = nextTyped;
      game.correctKeys += 1;
      playCorrectSound();
      if (game.typed === target.text) {
        game.score += target.text.length * 10;
        game.wordsCompleted += 1;
        if (CELEBRATION_MILESTONES.includes(game.wordsCompleted)) {
          setCelebrationVisible(true);
        }
        playCompleteSound();
        game.words = game.words.filter((word) => word.id !== target.id);
        game.targetId = null;
        game.typed = "";
      }
      setView(getSnapshot(game));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status]);

  const stats: GameStats = view.stats;
  const accuracy = stats.totalKeys
    ? Math.round((stats.correctKeys / stats.totalKeys) * 100)
    : 100;
  const wpm =
    stats.elapsed > 1
      ? Math.round(stats.correctKeys / 5 / (stats.elapsed / 60))
      : 0;

  return {
    status,
    words: view.words,
    targetId: view.targetId,
    typed: view.typed,
    stats,
    accuracy,
    wpm,
    wordBankStatus,
    mode,
    setMode,
    celebrationVisible,
    start,
    endGame,
    togglePause,
    dismissCelebration: () => setCelebrationVisible(false),
    history: currentHistory,
    clearHistory: () => {
      setHistory((current) => {
        const next = current.filter((entry) => entry.mode !== mode);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
  };
}
