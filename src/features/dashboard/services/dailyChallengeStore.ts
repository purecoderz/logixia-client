import { useSyncExternalStore } from "react";

export type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";

export interface DailyChallengeQuestion {
  id: string;
  difficulty: ChallengeDifficulty;
  category: string;
  title: string;
  prompt: string;
  codeSnippet?: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
  explanation: string;
  xp: number;
}

export const DIFFICULTY_META: Record<
  ChallengeDifficulty,
  { label: string; xp: number; description: string; badgeClass: string }
> = {
  beginner: {
    label: "Beginner",
    xp: 25,
    description: "Core syntax, variables, loops, and fundamentals",
    badgeClass: "bg-emerald-500/10 text-success border-emerald-500/30",
  },
  intermediate: {
    label: "Intermediate",
    xp: 50,
    description: "Data structures, closures, debugging, and transformations",
    badgeClass: "bg-accent/10 text-accent border-accent/30",
  },
  advanced: {
    label: "Advanced",
    xp: 100,
    description: "Algorithms, time complexity, async execution, and edge cases",
    badgeClass: "bg-amber-500/10 text-warning border-amber-500/30",
  },
};

export const DAILY_CHALLENGE_BANK: DailyChallengeQuestion[] = [
  // BEGINNER
  {
    id: "beg-1",
    difficulty: "beginner",
    category: "Python Fundamentals",
    title: "List Slicing Step",
    prompt: "What does the following Python expression evaluate to?",
    codeSnippet: "nums = [10, 20, 30, 40, 50]\nprint(nums[1:4])",
    choices: [
      { id: "a", text: "[10, 20, 30]" },
      { id: "b", text: "[20, 30, 40]" },
      { id: "c", text: "[20, 30, 40, 50]" },
      { id: "d", text: "[10, 20, 30, 40]" },
    ],
    correctChoiceId: "b",
    explanation:
      "Python slice notation `nums[start:stop]` starts at index 1 (`20`) and stops before index 4 (`50`), returning `[20, 30, 40]`.",
    xp: 25,
  },
  {
    id: "beg-2",
    difficulty: "beginner",
    category: "JavaScript Basics",
    title: "Strict vs Loose Equality",
    prompt: "What is logged to the console when this code runs?",
    codeSnippet: "console.log(0 == false, 0 === false);",
    choices: [
      { id: "a", text: "true true" },
      { id: "b", text: "false false" },
      { id: "c", text: "true false" },
      { id: "d", text: "false true" },
    ],
    correctChoiceId: "c",
    explanation:
      "`==` performs type coercion (converting `false` to `0`), whereas `===` checks both type and value without coercion.",
    xp: 25,
  },
  {
    id: "beg-3",
    difficulty: "beginner",
    category: "Control Flow",
    title: "Modulo Remainder Check",
    prompt: "Which condition correctly checks if an integer `n` is an even number?",
    codeSnippet: "if (???) {\n  // n is even\n}",
    choices: [
      { id: "a", text: "n / 2 === 0" },
      { id: "b", text: "n % 2 === 0" },
      { id: "c", text: "n % 2 === 1" },
      { id: "d", text: "n // 2 === 2" },
    ],
    correctChoiceId: "b",
    explanation:
      "The modulo operator `%` returns the remainder of division. Every even integer divided by 2 has a remainder of `0`.",
    xp: 25,
  },
  {
    id: "beg-4",
    difficulty: "beginner",
    category: "Python Strings",
    title: "String Immutability",
    prompt: "What is the output of calling `.upper()` without reassigning?",
    codeSnippet: 'word = "logixia"\nword.upper()\nprint(word)',
    choices: [
      { id: "a", text: "LOGIXIA" },
      { id: "b", text: "logixia" },
      { id: "c", text: "Logixia" },
      { id: "d", text: "TypeError" },
    ],
    correctChoiceId: "b",
    explanation:
      "Strings in Python are immutable. `word.upper()` returns a new uppercase string and leaves `word` unchanged as `\"logixia\"`.",
    xp: 25,
  },

  // INTERMEDIATE
  {
    id: "int-1",
    difficulty: "intermediate",
    category: "Python Functions",
    title: "Mutable Default Arguments",
    prompt: "What gets printed after calling `append_item` twice?",
    codeSnippet:
      "def append_item(val, bucket=[]):\n    bucket.append(val)\n    return bucket\n\nappend_item(1)\nprint(append_item(2))",
    choices: [
      { id: "a", text: "[2]" },
      { id: "b", text: "[1, 2]" },
      { id: "c", text: "[[1], [2]]" },
      { id: "d", text: "TypeError" },
    ],
    correctChoiceId: "b",
    explanation:
      "Default parameter values in Python are evaluated once when the function is defined, so both calls share the same `bucket` list.",
    xp: 50,
  },
  {
    id: "int-2",
    difficulty: "intermediate",
    category: "JavaScript Closures",
    title: "Array Map & parseInt Trap",
    prompt: "What does the following expression return in JavaScript?",
    codeSnippet: '["10", "10", "10"].map(parseInt)',
    choices: [
      { id: "a", text: "[10, 10, 10]" },
      { id: "b", text: "[10, NaN, 2]" },
      { id: "c", text: "[10, 0, 1]" },
      { id: "d", text: "[NaN, NaN, NaN]" },
    ],
    correctChoiceId: "b",
    explanation:
      "`.map()` passes `(element, index, array)` to `parseInt(string, radix)`. Radix `0` defaults to base 10 (`10`), radix `1` is invalid (`NaN`), and radix `2` parses binary `\"10\"` as `2`.",
    xp: 50,
  },
  {
    id: "int-3",
    difficulty: "intermediate",
    category: "Data Structures",
    title: "Hash Map Lookup Time",
    prompt:
      "Why do we convert a list of visited items into a `set` before checking membership in a loop?",
    choices: [
      { id: "a", text: "Sets preserve insertion order while lists do not" },
      {
        id: "b",
        text: "Set membership lookup is O(1) on average instead of O(n)",
      },
      { id: "c", text: "Sets use less memory than tuples" },
      { id: "d", text: "Sets automatically sort elements in ascending order" },
    ],
    correctChoiceId: "b",
    explanation:
      "A `set` is backed by a hash table, making `x in seen` an average O(1) operation compared to O(n) linear scans on a list.",
    xp: 50,
  },
  {
    id: "int-4",
    difficulty: "intermediate",
    category: "Python Comprehensions",
    title: "Dictionary Key Collisions",
    prompt: "How many keys will the resulting dictionary `d` contain?",
    codeSnippet: "d = {True: 'yes', 1: 'one', 1.0: 'float'}\nprint(len(d), d[True])",
    choices: [
      { id: "a", text: "3 yes" },
      { id: "b", text: "1 float" },
      { id: "c", text: "2 float" },
      { id: "d", text: "1 yes" },
    ],
    correctChoiceId: "b",
    explanation:
      "In Python, `True == 1 == 1.0` and their hashes are identical. The key remains `True`, while its value is overwritten by later entries to `'float'`.",
    xp: 50,
  },

  // ADVANCED
  {
    id: "adv-1",
    difficulty: "advanced",
    category: "Async & Event Loop",
    title: "Microtask vs Macrotask Order",
    prompt: "In what order are the numbers logged to the console?",
    codeSnippet:
      "console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
    choices: [
      { id: "a", text: "1, 2, 3, 4" },
      { id: "b", text: "1, 4, 2, 3" },
      { id: "c", text: "1, 4, 3, 2" },
      { id: "d", text: "1, 3, 4, 2" },
    ],
    correctChoiceId: "c",
    explanation:
      "Synchronous logs (`1`, `4`) run first, followed by the microtask queue (`Promise.then` -> `3`), and finally the macrotask timer queue (`setTimeout` -> `2`).",
    xp: 100,
  },
  {
    id: "adv-2",
    difficulty: "advanced",
    category: "Algorithms",
    title: "Binary Search Recurrence",
    prompt:
      "An algorithm splits a sorted array of size n in half at each step and performs O(1) work per step. What is its recurrence and time complexity?",
    choices: [
      { id: "a", text: "T(n) = 2T(n/2) + O(1) → O(n)" },
      { id: "b", text: "T(n) = T(n/2) + O(1) → O(log n)" },
      { id: "c", text: "T(n) = T(n/2) + O(n) → O(n log n)" },
      { id: "d", text: "T(n) = 2T(n/2) + O(n) → O(n log n)" },
    ],
    correctChoiceId: "b",
    explanation:
      "Only one half is explored per step (`T(n) = T(n/2) + O(1)`), which by the Master Theorem resolves to `O(log n)`.",
    xp: 100,
  },
  {
    id: "adv-3",
    difficulty: "advanced",
    category: "Graph Algorithms",
    title: "Shortest Path with Negative Weights",
    prompt:
      "Why can Dijkstra's algorithm fail on a directed graph containing negative edge weights?",
    choices: [
      { id: "a", text: "Priority queues cannot store negative numbers" },
      {
        id: "b",
        text: "It greedily finalizes the shortest distance to a node assuming future edges only increase path cost",
      },
      { id: "c", text: "Negative weights always create an infinite cycle" },
      { id: "d", text: "Adjacency lists only support unsigned weights" },
    ],
    correctChoiceId: "b",
    explanation:
      "Dijkstra assumes monotonically non-decreasing path costs. A later negative edge can make a previously 'finalized' subpath suboptimal.",
    xp: 100,
  },
  {
    id: "adv-4",
    difficulty: "advanced",
    category: "Dynamic Programming",
    title: "0/1 Knapsack Space Optimization",
    prompt:
      "When optimizing 0/1 Knapsack from a 2D table `dp[i][w]` to a 1D array `dp[w]`, why must we iterate capacity `w` from `W` down to `weight[i]`?",
    choices: [
      {
        id: "a",
        text: "To prevent reusing the same item multiple times in the current row",
      },
      { id: "b", text: "Because CPU cache lines only prefetch backward" },
      { id: "c", text: "To sort items by value-to-weight ratio automatically" },
      { id: "d", text: "Forward iteration causes integer overflow" },
    ],
    correctChoiceId: "a",
    explanation:
      "Iterating backward ensures `dp[w - weight[i]]` still holds the value from the previous item row (`i - 1`); forward iteration turns it into Unbounded Knapsack.",
    xp: 100,
  },
];

const DIFFICULTY_KEY = "logixia:daily-challenge-difficulty";
const PROGRESS_KEY = "logixia:daily-challenge-progress";
const STORE_EVENT = "logixia:daily-challenge-change";

interface DailyChallengeProgress {
  answersByKey: Record<string, string>; // key: `${dateKey}:${questionId}` -> choiceId
  completedDates: string[]; // ["2026-11-12", ...]
}

let cachedDifficulty: ChallengeDifficulty = "beginner";
let cachedProgressRaw: string | null = null;
let cachedProgress: DailyChallengeProgress = {
  answersByKey: {},
  completedDates: [],
};

export function getTodayDateKey(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function readChallengeDifficulty(): ChallengeDifficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY);
    if (raw === "beginner" || raw === "intermediate" || raw === "advanced") {
      cachedDifficulty = raw;
      return raw;
    }
  } catch {
    /* ignore storage errors */
  }
  return cachedDifficulty;
}

export function setChallengeDifficulty(next: ChallengeDifficulty): void {
  cachedDifficulty = next;
  try {
    localStorage.setItem(DIFFICULTY_KEY, next);
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

function readProgress(): DailyChallengeProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw === cachedProgressRaw) return cachedProgress;
    cachedProgressRaw = raw;
    if (!raw) {
      cachedProgress = { answersByKey: {}, completedDates: [] };
      return cachedProgress;
    }
    const parsed = JSON.parse(raw) as Partial<DailyChallengeProgress>;
    cachedProgress = {
      answersByKey:
        parsed.answersByKey && typeof parsed.answersByKey === "object"
          ? parsed.answersByKey
          : {},
      completedDates: Array.isArray(parsed.completedDates)
        ? parsed.completedDates
        : [],
    };
  } catch {
    cachedProgress = { answersByKey: {}, completedDates: [] };
  }
  return cachedProgress;
}

export function recordChallengeAttempt(
  question: DailyChallengeQuestion,
  choiceId: string,
  dateKey = getTodayDateKey(),
): void {
  const current = readProgress();
  const key = `${dateKey}:${question.id}`;
  const isCorrect = choiceId === question.correctChoiceId;
  const nextCompleted =
    isCorrect && !current.completedDates.includes(dateKey)
      ? [...current.completedDates, dateKey]
      : current.completedDates;

  const next: DailyChallengeProgress = {
    answersByKey: {
      ...current.answersByKey,
      [key]: choiceId,
    },
    completedDates: nextCompleted,
  };

  cachedProgress = next;
  try {
    const serialized = JSON.stringify(next);
    cachedProgressRaw = serialized;
    localStorage.setItem(PROGRESS_KEY, serialized);
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === DIFFICULTY_KEY ||
      e.key === PROGRESS_KEY ||
      e.key === null
    ) {
      callback();
    }
  };
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function getQuestionForDate(
  difficulty: ChallengeDifficulty,
  dateKey = getTodayDateKey(),
): DailyChallengeQuestion {
  const pool = DAILY_CHALLENGE_BANK.filter((q) => q.difficulty === difficulty);
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

export function useChallengeDifficulty(): [
  ChallengeDifficulty,
  (next: ChallengeDifficulty) => void,
] {
  const difficulty = useSyncExternalStore(
    subscribe,
    readChallengeDifficulty,
    () => "beginner" as ChallengeDifficulty,
  );
  return [difficulty, setChallengeDifficulty];
}

export function useDailyChallenge(dateKey = getTodayDateKey()) {
  const [difficulty, setDifficulty] = useChallengeDifficulty();
  const progress = useSyncExternalStore(subscribe, readProgress, () => ({
    answersByKey: {},
    completedDates: [],
  }));

  const question = getQuestionForDate(difficulty, dateKey);
  const answerKey = `${dateKey}:${question.id}`;
  const selectedChoiceId = progress.answersByKey[answerKey] ?? null;
  const isSolved = selectedChoiceId === question.correctChoiceId;

  return {
    difficulty,
    setDifficulty,
    question,
    selectedChoiceId,
    isSolved,
    completedDates: progress.completedDates,
    completedDaysCount: progress.completedDates.length,
    submitChoice: (choiceId: string) =>
      recordChallengeAttempt(question, choiceId, dateKey),
  };
}
