import { Award, RefreshCw, ArrowLeft, Zap } from 'lucide-react';

interface ResultsViewProps {
  correct: number;
  total: number;
  expGained: number;
  onRestart: () => void;
  onHome: () => void;
}

export function ResultsView({ correct, total, expGained, onRestart, onHome }: ResultsViewProps) {
  const percentage = Math.round((correct / total) * 100);
  const isPerfect = correct === total;

  const message =
    percentage >= 80
      ? '太棒了！你的理化觀念非常扎實。'
      : percentage >= 50
        ? '不錯！再多練習幾次會更熟練。'
        : '別灰心，持續練習就能進步。';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center shadow-xl">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border ${
            isPerfect
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}
        >
          <Award className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">完成本日練習！</h2>
        <p className="text-slate-400 text-sm mb-6">{message}</p>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <p className="text-xs text-slate-400 mb-1">答對題數</p>
            <p className="text-2xl font-bold text-cyan-400 tabular-nums">
              {correct}/{total}
            </p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <p className="text-xs text-slate-400 mb-1">正確率</p>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">{percentage}%</p>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <p className="text-xs text-slate-400 mb-1 flex items-center justify-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-400" /> 經驗值
            </p>
            <p className="text-2xl font-bold text-amber-400 tabular-nums">+{expGained}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onHome}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </button>
          <button
            onClick={onRestart}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            再練習一次
          </button>
        </div>
      </div>
    </div>
  );
}
