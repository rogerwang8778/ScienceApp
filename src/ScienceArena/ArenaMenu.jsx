import React from 'react';
import { Swords, User, Users, Flame, Layers, Play } from 'lucide-react';

export default function ArenaMenu({ gameMode, setGameMode, onSelectGame }) {
  // 小遊戲清單資料庫（預留未來擴充 10+ 款遊戲）
  const gameList = [
    {
      id: 'rightHand',
      unit: '單元六《電與磁》',
      title: '電磁學右手定則速度 PK',
      desc: '極速判斷電流 I、磁場 B 與受力 F 的右手掌心方向！',
      icon: '⚡',
      color: 'from-amber-500/20 to-indigo-500/20',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'circuit',
      unit: '單元五《電路與歐姆定律》',
      title: '電路故障除錯大比拼',
      desc: '即時除錯！找出串並聯短路、斷路與燈泡亮暗問題。',
      icon: '💡',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300'
    },
    {
      id: 'acidBase',
      unit: '單元四《酸鹼鹽與反應速率》',
      title: '酸鹼沉澱與離子配對賽',
      desc: '快答 pH 值變換、離子沉澱反應與催化劑特性！',
      icon: '🧪',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'waves',
      unit: '單元三《波動與聲音》',
      title: '聲波三要素頻率挑戰',
      desc: '分析振幅、頻率與波長，搶答音調與響度變化！',
      icon: '🔊',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300'
    }
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-8 space-y-8">
      {/* 頂部模式切換列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Swords className="w-7 h-7 text-rose-400" />
            理化競技場遊戲大廳
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            選擇對戰遊戲與模式，答錯扣除血條 HP，考驗你的概念反應速度！
          </p>
        </div>

        {/* 單人 / 雙人對戰模式 Toggle */}
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5">
          <button
            onClick={() => setGameMode('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              gameMode === 'single'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> 單人限時闖關
          </button>
          <button
            onClick={() => setGameMode('pvp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              gameMode === 'pvp'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 雙人 1v1 PK
          </button>
        </div>
      </div>

      {/* 小遊戲卡片列表 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" /> 選擇挑戰的小遊戲單元：
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameList.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`bg-gradient-to-br ${game.color} bg-slate-900 border ${game.borderColor} rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between space-y-4 group`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-white/10 ${game.badgeColor}`}>
                    {game.unit}
                  </span>
                  <span className="text-2xl group-hover:scale-125 transition-transform">{game.icon}</span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {game.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> 扣血機制: 答錯 -20 HP
                </span>
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  進入遊戲 <Play className="w-3.5 h-3.5 fill-indigo-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}