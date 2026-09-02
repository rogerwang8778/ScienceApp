import React, { useState } from 'react';
import { Swords, ArrowLeft } from 'lucide-react';
import ArenaMenu from './ArenaMenu';
import DensityFloorGame from './games/DensityFloorGame'; // 1. 引入 1F 小遊戲
import ConcentrationFloorGame from './games/ConcentrationFloorGame';

export default function ScienceArena({ onAddExp }) {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameMode, setGameMode] = useState('single');

  const handleGameOver = (gainedExp = 0) => {
    if (gainedExp > 0 && onAddExp) {
      onAddExp(gainedExp);
    }
    setCurrentGame(null);
  };

  return (
    <div className="space-y-6">
      {currentGame && (
        <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setCurrentGame(null)}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 返回天空競技場大廳
          </button>
          
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-rose-400" />
            對戰模式：{gameMode === 'single' ? '單人限時闖關' : '雙人 1v1 PK'}
          </div>
        </div>
      )}

      {!currentGame && (
        <ArenaMenu
          gameMode={gameMode}
          setGameMode={setGameMode}
          onSelectGame={(gameId) => setCurrentGame(gameId)}
        />
      )}

      {/* 2. 當選擇 1F 時，渲染 DensityFloorGame */}
      {currentGame === 'density1F' && (
        <DensityFloorGame mode={gameMode} onGameOver={handleGameOver} />
      )}
      {currentGame === 'concentration10F' && (
        <ConcentrationFloorGame mode={gameMode} onGameOver={handleGameOver} />
      )}
    </div>
  );
}