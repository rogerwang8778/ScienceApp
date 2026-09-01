import { Zap, Trophy } from 'lucide-react';
import type { ProgressStats } from '@/types';

export function getTitle(level: number): string {
  if (level < 2) return '理化新手';
  if (level < 5) return '實驗室助手';
  if (level < 10) return '首席研究員';
  return '理化大師';
}

interface HeaderProps {
  stats: ProgressStats;
  onNavigate: (view: 'dashboard' | 'achievements') => void;
}

export function Header({ stats, onNavigate }: HeaderProps) {
  const nextLevelExp = stats.level * 100;
  const expPercentage = Math.min(100, Math.round((stats.exp / nextLevelExp) * 100));

  return (
    <header className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-4 md:p-5 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <span className="text-white">Lv{stats.level}</span>
        </div>
        <div>
          <h1 className="text-base md:text-lg font-bold flex items-center gap-2 text-white">
            科學探險家
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-medium">
              {getTitle(stats.level)}
            </span>
          </h1>
          <div className="w-44 md:w-52 bg-slate-700/60 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-600/50">
            <div
              className="bg-gradient-to-r from-cyan-400 to-teal-300 h-full transition-all duration-700 ease-out"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 tabular-nums">
            {stats.exp} / {nextLevelExp} EXP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-slate-300">
            連續 <strong className="text-amber-400">{stats.streak} 天</strong>
          </span>
        </div>
        <button
          onClick={() => onNavigate('achievements')}
          className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-700/60 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            <strong className="text-emerald-400">{stats.unlockedBadges.length}</strong> 徽章
          </span>
        </button>
      </div>
    </header>
  );
}
