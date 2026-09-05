import React, { useState } from 'react';
import { Shield, Sparkles, Swords, ArrowLeft } from 'lucide-react';

// 正確匯入 ./games/ 資料夾內的各樓層擂台組件
import DensityFloorGame from './games/DensityFloorGame';         // 1F 密度擂台
import ConcentrationFloorGame from './games/ConcentrationFloorGame'; // 10F 濃度擂台
import ParticleSurfGame from './games/ParticleSurfGame';         // 20F 波動擂台
import LensFocalGame from './games/LensFocalGame';               // 30F 光學擂台
import ThermalFloorGame from './games/ThermalFloorGame';         // 40F 熱學擂台
import IonCrushGame from './games/IonCrushGame';                 // 50F 化合物擂台 (新增)
import ActivityFloorGame from './games/ActivityFloorGame'; // 60F 活性擂台
import AcidBaseFloorGame from './games/AcidBaseFloorGame'; // 70F 酸鹼擂台
import EquilibriumFloorGame from './games/EquilibriumFloorGame'; // 80F 平衡擂台
import OrganicFloorGame from './games/OrganicFloorGame'; // 90F 有機擂台

export default function ScienceArena() {
  const [playerExp, setPlayerExp] = useState(1200);
  const [activeFloor, setActiveFloor] = useState(null);
  const [gameMode, setGameMode] = useState('pvp');

  const playerLevel = Math.floor(playerExp / 500) + 1;

  const floors = [
    {
      id: '1F',
      name: '1F 密度擂台：浮沉剋制戰',
      icon: '🛡️',
      color: 'from-rose-600/20 to-orange-600/20 border-rose-500/40',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      desc: '評估 M/V 密度與液體浮沉關係，同屏左右搶速發動盾牌與砲彈攻勢！',
      component: DensityFloorGame
    },
    {
      id: '10F',
      name: '10F 濃度擂台：水龍頭稀釋對對碰',
      icon: '🧪',
      color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/40',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      desc: '雙人同屏上下量筒注水對戰！手算重量百分濃度，精準按住注水搶答扣血！',
      component: ConcentrationFloorGame
    },
    {
      id: '20F',
      name: '20F 波動擂台：波形衝浪戰',
      icon: '🌊',
      color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/40',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      desc: '觀察波形週期與波長關係，精準判斷介面振動方向！',
      component: ParticleSurfGame
    },
    {
      id: '30F',
      name: '30F 光學擂台：透鏡焦點戰',
      icon: '🔍',
      color: 'from-purple-600/20 to-indigo-600/20 border-purple-500/40',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: '雙人同屏搶速對決！5 秒內回答正確發動 2 倍暴擊傷害，掌握透鏡成像律！',
      component: LensFocalGame
    },
    {
      id: '40F',
      name: '40F 熱學擂台：熱平衡調溫之劍',
      icon: '🔥',
      color: 'from-amber-600/20 to-rose-600/20 border-amber-500/40',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: '手算熱平衡溫度與質量比例！5 秒速答暴擊，配合游標精準按下 STOP 鎖定！',
      component: ThermalFloorGame
    },
    {
      id: '50F',
      name: '50F 化合物擂台：電中性離子連連看',
      icon: '⚡',
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/40',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: 'Candy Crush 離子連連看！滑動連續連結相鄰正負離子，滿足電荷總和 = 0 消除爆破！',
      component: IonCrushGame
    },
    {
      id: '60F',
      name: '60F 活性擂台：金屬奪氧吹牛戰',
      icon: '🔥',
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/40',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: '吹牛賽局與金屬活性順序結合！手牌博弈搶奪氧化物，配合技能發動精準奪氧暴擊！',
      component: ActivityFloorGame
    },
    {
      id: '70F',
      name: '70F 酸鹼擂台：中和KO強攻戰',
      icon: '🧪',
      color: 'from-rose-600/20 to-blue-600/20 border-rose-500/40',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      desc: '計算解離莫耳數與充能體積稀釋，精準揮出酸鹼拳完全中和 KO 怪獸！',
      component: AcidBaseFloorGame
    },
    {
      id: '80F',
      name: '80F 平衡擂台：勒沙特列記憶大師',
      icon: '⚖️',
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: '記憶與反應雙重考驗！勒沙特列原理破壞條件連續閃現，完美還原平衡移動方向！',
      component: EquilibriumFloorGame
    },
    {
      id: '90F',
      name: '90F 有機擂台：官能基結構翻牌對對碰',
      icon: '🧬',
      color: 'from-purple-600/20 to-indigo-600/20 border-purple-500/40',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: '30 張有機化合物結構卡牌！5 秒透視記憶，輪流翻牌配對烷、烯、醇、酸、酯！',
      component: OrganicFloorGame
    }
  ];

  const handleGameOver = (gainedExp) => {
    setPlayerExp((prev) => prev + gainedExp);
    setActiveFloor(null);
  };

  const currentFloorObj = floors.find((f) => f.id === activeFloor);
  const ActiveGameComponent = currentFloorObj?.component;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans select-none">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center bg-slate-900/80 border border-slate-800 p-6 rounded-3xl gap-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-400/40">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Heaven's Science Arena
              </span>
              <span className="text-xs font-mono text-slate-400">v2.5 PK Special Edition</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">天空理化競技場</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">階級 Lvl.{playerLevel}</span>
            </div>
            <div className="w-36 bg-slate-950 h-2.5 rounded-full border border-slate-800 p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((playerExp % 500) / 500) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400">{playerExp} TOTAL EXP</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setGameMode('single')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'single' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              👤 單人闖關
            </button>
            <button
              onClick={() => setGameMode('pvp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'pvp' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚔️ 雙人同屏 PK
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6">
        {!activeFloor ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-black text-slate-200 flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" /> 選擇挑戰樓層擂台：
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {gameMode === 'pvp' ? '🎮 模式：雙人同屏 PK (適用電子白板)' : '🎮 模式：單人擂台闖關'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map((floor) => (
                <div
                  key={floor.id}
                  onClick={() => setActiveFloor(floor.id)}
                  className={`bg-slate-900/80 border p-5 rounded-3xl space-y-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group ${floor.color}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-4xl">{floor.icon}</span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${floor.badgeColor}`}>
                      {floor.id} 擂台
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {floor.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {floor.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      ⚡ 電中性化合物消除
                    </span>
                    <span className="text-xs font-black text-indigo-400 group-hover:translate-x-1 transition-transform">
                      挑戰擂台 ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setActiveFloor(null)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回競技場大廳
            </button>

            {ActiveGameComponent && (
              <ActiveGameComponent
                mode={gameMode}
                onGameOver={handleGameOver}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}