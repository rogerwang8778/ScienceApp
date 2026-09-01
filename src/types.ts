export interface Question {
  id: number;
  unit: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  expReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: ProgressStats) => boolean;
}

export interface ProgressStats {
  level: number;
  exp: number;
  streak: number;
  totalCorrect: number;
  totalAnswered: number;
  quizzesCompleted: number;
  perfectQuizzes: number;
  unlockedBadges: string[];
  lastPracticeDate: string | null;
}

export type View = 'dashboard' | 'quiz' | 'results' | 'achievements';
