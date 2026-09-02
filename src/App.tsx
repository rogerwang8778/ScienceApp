import React, { useState } from 'react';
import { Sparkles, Atom, FlaskConical, Trophy, Swords } from 'lucide-react';
import PeriodicTable from './PeriodicTable';
import ScienceLab from './ScienceLab/ScienceLab';
import ScienceArena from './ScienceArena/ScienceArena';

export default function App() {
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'lab' | 'arena'
  const [userExp, setUserExp] = useState(0);

  // 增加經驗值 Function
  const addExp = (amount) => {
    setUserExp(prev => prev + amount);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      {/* 頂部導覽列 Header */}
      <header className="max-w-7xl mx-auto mb-6 bg-slate-800/90 backdrop-blur p-4 md:px-6 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl">
            <Atom className="w-6 h-6 text-indigo-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">國中理化互動學習平台</h1>
            <p className="text-[11px] text-slate-400">觀念視覺化 × 探索實驗室 × 競技場對戰</p>
          </div>
        </div>

        {/* 右側：EXP 經驗值與分頁按鈕 */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>EXP: {userExp}</span>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'table' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              元素週期表
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'lab' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              理化實驗室
            </button>

            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'arena' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              理化競技場
            </button>
          </nav>
        </div>
      </header>

      {/* 主要內容顯示區域 Main Content */}
      <main className="max-w-7xl mx-auto">
        {activeTab === 'table' && (
          <PeriodicTable onAddExp={addExp} />
        )}

        {activeTab === 'lab' && (
          <ScienceLab onAddExp={addExp} />
        )}

        {activeTab === 'arena' && (
          <ScienceArena onAddExp={addExp} />
        )}
      </main>
    </div>
  );
}