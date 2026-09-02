import React, { useState } from 'react';
import { Swords, ArrowLeft, Trophy } from 'lucide-react';
import ArenaMenu from './ArenaMenu';

// 預留未來引入的獨立小遊戲元件
// import RightHandRuleGame from './games/RightHandRuleGame';
// import CircuitTroubleGame from './games/CircuitTroubleGame';

export default function ScienceArena({ onAddExp }) {
  // currentGame: null (選單頁) | 'rightHand' | 'circuit' | 'acidBase' ...
  const [currentGame, setCurrentGame] = useState(null);
  const [gameMode, setGameMode] = useState('single'); // 'single' (單人闖關) | 'pvp' (雙人PK)

  // 遊戲結束處理，增加 EXP 並返回選單
  const handleGameOver = (gainedExp = 0) => {
    if (gainedExp > 0 && onAddExp) {
      onAddExp(gainedExp);
    }
    setCurrentGame(null);
  };

  return (
    <div className="space-y-6">
      {/* 頂部選單列：在遊戲中時顯示返回按鈕 */}
      {currentGame && (
        <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setCurrentGame(null)}
            className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 返回競技場遊戲大廳
          </button>
          
          <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-rose-400" />
            對戰模式：{gameMode === 'single' ? '單人限時闖關' : '雙人 1v1 PK'}
          </div>
        </div>
      )}

      {/* 1. 未選擇遊戲時，顯示關卡選單大廳 */}
      {!currentGame && (
        <ArenaMenu
          gameMode={gameMode}
          setGameMode={setGameMode}
          onSelectGame={(gameId) => setCurrentGame(gameId)}
        />
      )}

      {/* 2. 選擇遊戲後，渲染對應的小遊戲元件 */}
      {currentGame === 'rightHand' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">⚡ 電磁學右手定則速度 PK</h3>
          <p className="text-xs text-slate-400 mb-6">（準備開發中...）</p>
          <button
            onClick={() => handleGameOver(50)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            測試完成：獲得 50 EXP 並返回
          </button>
        </div>
        // 未來替換為：<RightHandRuleGame mode={gameMode} onGameOver={handleGameOver} />
      )}

      {currentGame === 'circuit' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">💡 電路故障除錯大比拼</h3>
          <p className="text-xs text-slate-400 mb-6">（準備開發中...）</p>
          <button
            onClick={() => handleGameOver(50)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            測試完成：獲得 50 EXP 並返回
          </button>
        </div>
        // 未來替換為：<CircuitTroubleGame mode={gameMode} onGameOver={handleGameOver} />
      )}
    </div>
  );
}