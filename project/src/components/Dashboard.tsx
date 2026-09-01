import { Atom, ArrowRight, BarChart3, Flame, Target, BookMarked, CheckCircle2 } from 'lucide-react';
import type { ProgressStats, Question } from '@/types';
import { units } from '@/data/questions';

interface DashboardProps {
  stats: ProgressStats;
  questions: Question[];
  onStart: () => void;
}

export function Dashboard({ stats, questions, onStart }: DashboardProps) {
  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  const statCards = [
    { label: '完成練習', value: stats.quizzesCompleted, icon: BookMarked, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: '答對題數', value: stats.totalCorrect, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: '答題正確率', value: `${accuracy}%`, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: '連續天數', value: `${stats.streak} 天`, icon: Flame, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-cyan-950/40 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="absolute -right-8 -top-8 opacity-10">
          <Atom className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">國中理化練習</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
            透過遊戲化學習，掌握力學、電學、酸鹼與光學等核心觀念。答題累積經驗值、解鎖徽章、提升等級。
          </p>
          <button
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5"
          >
            開始今日練習
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-2"
            >
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-white tabular-nums">{card.value}</p>
              <p className="text-xs text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </section>

      {/* Units overview */}
      <section className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">練習單元</h3>
          <span className="text-xs text-slate-500 ml-auto">共 {questions.length} 題</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {units.map((unit) => (
            <span
              key={unit}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600/50"
            >
              {unit}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
