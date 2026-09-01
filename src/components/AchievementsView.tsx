import * as Icons from 'lucide-react';
import { Lock, ArrowLeft } from 'lucide-react';
import type { ProgressStats } from '@/types';
import { badges } from '@/data/badges';

interface AchievementsViewProps {
  stats: ProgressStats;
  onBack: () => void;
}

export function AchievementsView({ stats, onBack }: AchievementsViewProps) {
  const unlockedCount = stats.unlockedBadges.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">成就徽章</h2>
        <span className="text-sm text-slate-500 ml-auto">
          {unlockedCount} / {badges.length} 已解鎖
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {badges.map((badge) => {
          const unlocked = stats.unlockedBadges.includes(badge.id);
          const Icon = unlocked
            ? (Icons[badge.icon as keyof typeof Icons] as Icons.LucideIcon)
            : Lock;

          return (
            <div
              key={badge.id}
              className={`rounded-2xl p-5 text-center border transition-all duration-300 ${
                unlocked
                  ? 'bg-gradient-to-br from-slate-800 to-cyan-950/40 border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/40 border-slate-700/50 opacity-60'
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                  unlocked ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-700/50 text-slate-500'
                }`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                {badge.name}
              </h3>
              <p className="text-xs text-slate-500 leading-snug">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
