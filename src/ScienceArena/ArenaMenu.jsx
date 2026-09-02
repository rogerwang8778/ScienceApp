import React from 'react';
import { Swords, User, Users, Flame, Layers, Play } from 'lucide-react';

export default function ArenaMenu({ gameMode, setGameMode, onSelectGame }) {
  // 小遊戲卡片清單（以天空競技場樓層規劃）
  const gameList = [
    {
      id: 'density1F', // 對應 ScienceArena.jsx 中的 currentGame === 'density1F'
      unit: '天空競技場 1F',
      title: '1F 密度擂台：浮沉剋制戰',
      desc: '極速判斷 M-V 密度，運用物體與液體的浮沉特性剋制敵人！',
      icon: '🧪',
      color: 'from-amber-500/20 to-indigo-500/20',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'waves50F',
      unit: '天空競技場 50F',
      title: '50F 聲波頻率對決',
      desc: '分析振幅、頻率與波長，聽音辨位搶答音調與響度變化！',
      icon: '🔊',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300'
    },
    {
      id: 'circuit100F',
      unit: '天空競技場 100F',
      title: '100F 歐姆電流大亂鬥',
      desc: '即時除錯！找出串並聯短路、斷路與伏特/安培計讀數。',
      icon: '💡',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300'
    },
    {
      id: 'electromagnet200F',
      unit: '200F (念能力層)',
      title: '200F 右手定則極限 PK',
      desc: '安培右手、右手開掌與冷次定律極速快答！',
      icon: '⚡',
      color: 'from-rose-500/20 to-amber-500/20',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-300'
    }
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-8 space-y-8">
      {/* 頂部模式切換列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Swords className="w-7 h-7 text-rose-400" />
            獵人天空競技場大廳
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            挑戰各樓層理化關主！答錯扣除血條 HP，考驗你的概念反應速度！
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

      {/* 樓層小遊戲卡片列表 */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" /> 選擇挑戰的天空競技場樓層：
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
                  挑戰樓層 <Play className="w-3.5 h-3.5 fill-indigo-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}