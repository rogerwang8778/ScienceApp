import { useCallback, useEffect, useState } from 'react';
import type { ProgressStats } from '@/types';
import { badges } from '@/data/badges';

const STORAGE_KEY = 'science-explorer-progress';

const defaultStats: ProgressStats = {
  level: 1,
  exp: 0,
  streak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  unlockedBadges: [],
  lastPracticeDate: null,
};

function loadStats(): ProgressStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useProgress() {
  const [stats, setStats] = useState<ProgressStats>(loadStats);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const recordQuiz = useCallback(
    (correct: number, total: number, expGained: number) => {
      setStats((prev) => {
        const today = todayStr();
        let streak = prev.streak;
        if (prev.lastPracticeDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          streak = prev.lastPracticeDate === yesterday ? prev.streak + 1 : 1;
        }

        let level = prev.level;
        let exp = prev.exp + expGained;
        while (exp >= level * 100) {
          exp -= level * 100;
          level += 1;
        }

        const next: ProgressStats = {
          ...prev,
          level,
          exp,
          streak,
          totalCorrect: prev.totalCorrect + correct,
          totalAnswered: prev.totalAnswered + total,
          quizzesCompleted: prev.quizzesCompleted + 1,
          perfectQuizzes: prev.perfectQuizzes + (correct === total ? 1 : 0),
          lastPracticeDate: today,
        };

        const earned: string[] = [];
        for (const b of badges) {
          if (!next.unlockedBadges.includes(b.id) && b.condition(next)) {
            earned.push(b.id);
          }
        }
        if (earned.length) {
          next.unlockedBadges = [...next.unlockedBadges, ...earned];
          setNewBadges(earned);
        }

        return next;
      });
    },
    [],
  );

  const clearNewBadges = useCallback(() => setNewBadges([]), []);

  const resetProgress = useCallback(() => {
    setStats(defaultStats);
    setNewBadges([]);
  }, []);

  return { stats, recordQuiz, newBadges, clearNewBadges, resetProgress };
}
