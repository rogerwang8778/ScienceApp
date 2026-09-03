import React, { useState } from 'react';
import { Swords, User, Users, Flame, Layers, Play, ArrowLeft } from 'lucide-react';

// 引入各樓層小遊戲元件
import DensityFloorGame from './games/DensityFloorGame';
import ConcentrationFloorGame from './games/ConcentrationFloorGame';
import ParticleSurfGame from './games/ParticleSurfGame';
import LensFocalGame from './games/LensFocalGame';

export default function ScienceArena({ onAddExp }) {
  // currentGame: null (選單大廳) | 'density1F' | 'concentration10F' | ...
  const [currentGame, setCurrentGame] = useState(null);
  const [gameMode, setGameMode] = useState('single'); // 'single' (單人闖關) | 'pvp' (雙人PK)

  // 樓層遊戲卡片清單（未來新增 50F、100F 等關卡，在此擴充即可）
  const gameList = [
    {
      id: 'density1F',
      unit: '天空競技場 1F',
      title: '1F 密度擂台：浮沉剋制戰',
      desc: '心算 M/V 密度，運用物體與液體的浮沉特性剋制敵人！',
      icon: '🧪',
      color: 'from-amber-500/20 to-indigo-500/20',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'concentration10F',
      unit: '天空競技場 10F',
      title: '10F 濃度擂台：水龍頭稀釋對對碰',
      desc: '計算質量百分濃度，PK 模式體驗長按水龍頭精準注水對決！',
      icon: '💧',
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300'
    },
    {
      id: 'waves20F',
      unit: '天空競技場 20F',
      title: '20F 波動擂台：質點衝浪手',
      desc: '運用理化「微移法」預測波前進時介面質點的瞬間運動方向！',
      icon: '🏄‍♂️',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300'
    },
    {
      id: 'optics30F',
      unit: '天空競技場 30F',
      title: '30F 光學擂台：透鏡焦點戰',
      desc: '破解死背痛點！秒殺「物距 vs. 像距 & 成像性質」反應對決！',
      icon: '🔍',
      color: 'from-purple-500/20 to-indigo-500/20',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300'
    },
    {
      id: 'waves50F',
      unit: '天空競技場 50F',
      title: '50F 聲波頻率對決',
      desc: '分析振幅、頻率與波長，聽音辨位搶答音調與響度變化！（準備中）',
      icon: '🔊',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300'
    },
    {
      id: 'electromagnet200F',
      unit: '200F (念能力層)',
      title: '200F 右手定則極限 PK',
      desc: '安培右手、右手開掌與冷次定律極速快答！（準備中）',
      icon: '⚡',
      color: 'from-rose-500/20 to-amber-500/20',
      borderColor: 'border-rose-500/40 hover:border-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-300'
    }
  ];

  // 遊戲結束結算並發放 EXP
  const handleGameOver = (gainedExp = 0) => {
    if (gainedExp > 0 && onAddExp) {
      onAddExp(gainedExp);
    }
    setCurrentGame(null);
  };

  return (
    <div className="space-y-6">
      {/* 頂部選單列：在小遊戲進行中時，顯示返回大廳按鈕 */}
      {currentGame && (
        <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setCurrentGame(null)}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> 返回獵人天空競技場大廳
          </button>
          
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-rose-400" />
            對戰模式：{gameMode === 'single' ? '單人限時闖關' : '雙人 1v1 PK'}
          </div>
        </div>
      )}

      {/* 1. 尚未選擇遊戲時：顯示選單大廳 UI */}
      {!currentGame && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-8 space-y-8 select-none">
          {/* 模式切換標頭 */}
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'single'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" /> 單人限時闖關
              </button>
              <button
                onClick={() => setGameMode('pvp')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'pvp'
                    ? 'bg-rose-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> 雙人 1v1 PK
              </button>
            </div>
          </div>

          {/* 樓層小遊戲卡片清單 */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> 選擇挑戰的天空競技場樓層：
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameList.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setCurrentGame(game.id)}
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
      )}

      {/* 2. 選擇特定遊戲後，渲染對應小遊戲 */}
      {currentGame === 'density1F' && (
        <DensityFloorGame mode={gameMode} onGameOver={handleGameOver} />
      )}

      {currentGame === 'concentration10F' && (
        <ConcentrationFloorGame mode={gameMode} onGameOver={handleGameOver} />
      )}
      {currentGame === 'waves20F' && (
        <ParticleSurfGame mode={gameMode} onGameOver={handleGameOver} />
      )}
      {currentGame === 'optics30F' && (
        <LensFocalGame mode={gameMode} onGameOver={handleGameOver} />
      )}
    </div>
  );
}