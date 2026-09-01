import type { Badge } from '@/types';

export const badges: Badge[] = [
  {
    id: 'first_step',
    name: '初探科學',
    description: '完成第一次練習',
    icon: 'Footprints',
    condition: (s) => s.quizzesCompleted >= 1,
  },
  {
    id: 'streak_3',
    name: '堅持不懈',
    description: '連續練習 3 天',
    icon: 'Flame',
    condition: (s) => s.streak >= 3,
  },
  {
    id: 'streak_7',
    name: '一週達人',
    description: '連續練習 7 天',
    icon: 'Flame',
    condition: (s) => s.streak >= 7,
  },
  {
    id: 'perfect_quiz',
    name: '全對高手',
    description: '在一次練習中全對',
    icon: 'Target',
    condition: (s) => s.perfectQuizzes >= 1,
  },
  {
    id: 'level_5',
    name: '實驗室助手',
    description: '達到等級 5',
    icon: 'Beaker',
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    name: '首席研究員',
    description: '達到等級 10',
    icon: 'Microscope',
    condition: (s) => s.level >= 10,
  },
  {
    id: 'correct_20',
    name: '答題達人',
    description: '累計答對 20 題',
    icon: 'Brain',
    condition: (s) => s.totalCorrect >= 20,
  },
  {
    id: 'quizzes_5',
    name: '勤學之士',
    description: '完成 5 次練習',
    icon: 'BookMarked',
    condition: (s) => s.quizzesCompleted >= 5,
  },
];
