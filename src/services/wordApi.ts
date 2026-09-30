import { WORDS } from "../data/words";

const API_URL = "https://api.datamuse.com/words";
const CACHE_KEY = "typing-game-word-bank-v3";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const RELATED_TOPICS = [
  "game",
  "space",
  "learning",
  "accounting",
  "finance",
  "audit",
  "tax",
  "budget",
  "business",
];

type DatamuseWord = { word?: string };
type CachedWordBank = { savedAt: number; words: string[] };

const cleanWords = (words: string[]) =>
  Array.from(
    new Set(
      words
        .map((word) => singularize(word.toLowerCase().trim()))
        .filter(
          (word) =>
            /^[a-z]+$/.test(word) && word.length >= 3 && word.length <= 10,
        ),
    ),
  );

const singularize = (word: string) => {
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (/(ches|shes|xes|zes|ses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !/(ss|us|is|ous)$/.test(word)) {
    return word.slice(0, -1);
  }
  return word;
};

const readCache = () => {
  try {
    const cached = JSON.parse(
      localStorage.getItem(CACHE_KEY) ?? "null",
    ) as CachedWordBank | null;
    if (cached && Date.now() - cached.savedAt < CACHE_TTL) {
      return cleanWords(cached.words);
    }
  } catch {
    return null;
  }
  return null;
};

export async function fetchWordBank(): Promise<string[]> {
  const cached = readCache();
  if (cached && cached.length > WORDS.length) return cached;

  const responses = await Promise.allSettled(
    RELATED_TOPICS.map(async (topic) => {
      const response = await fetch(
        `${API_URL}?ml=${encodeURIComponent(topic)}&max=60`,
      );
      if (!response.ok) throw new Error(`Word API returned ${response.status}`);
      return response.json() as Promise<DatamuseWord[]>;
    }),
  );
  const remoteWords = responses.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.map((entry) => entry.word ?? "")
      : [],
  );
  const words = cleanWords([...WORDS, ...remoteWords]);

  if (words.length > WORDS.length) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), words }),
    );
  }
  return words;
}
