import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, Timer, Flame, Eye, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

// 精準指定的三大可逆反應題庫與破壞條件對照
const EQUILIBRIUM_REACTIONS = [
  {
    id: 'chromate',
    name: '鉻酸根 / 二鉻酸根平衡',
    equation: 'Cr₂O₇²⁻ (橘) + H₂O ⇌ 2CrO₄²⁻ (黃) + 2H⁺',
    rules: [
      { name: '加酸 (加 H⁺)', dir: '<' },
      { name: '加鹼 (滴入 NaOH, 消耗 H⁺)', dir: '>' },
      { name: '加入 鉻酸鉀 (加 CrO₄²⁻)', dir: '<' },
      { name: '加入 二鉻酸鉀 (加 Cr₂O₇²⁻)', dir: '>' },
      { name: '加大量水 (稀釋)', dir: '>' }
    ]
  },
  {
    id: 'nitrogen_dioxide',
    name: '二氧化氮 / 四氧化二氮平衡',
    equation: '2NO₂ (紅棕色, 2莫耳) ⇌ N₂O₄ (無色, 1莫耳) + 熱',
    rules: [
      { name: '加熱 (放入熱水中)', dir: '<' },
      { name: '降溫 (放入冰水中)', dir: '>' },
      { name: '加壓 (壓縮針筒體積)', dir: '>' },
      { name: '減壓 (拉開針筒體積)', dir: '<' },
      { name: '灌入 NO₂ 氣體', dir: '>' },
      { name: '抽離 N₂O₄ 氣體', dir: '>' }
    ]
  },
  {
    id: 'haber_bosch',
    name: '哈伯法製氨反應',
    equation: 'N₂ (1莫耳) + 3H₂ (3莫耳) ⇌ 2NH₃ (2莫耳) + 熱',
    rules: [
      { name: '加熱 (升高溫度)', dir: '<' },
      { name: '冷卻 (降低溫度)', dir: '>' },
      { name: '加壓 (提高壓力)', dir: '>' },
      { name: '減壓 (降低壓力)', dir: '<' },
      { name: '持續注入 N₂ 氣體', dir: '>' },
      { name: '持續注入 H₂ 氣體', dir: '>' },
      { name: '冷凝抽離生成物 NH₃', dir: '>' },
      { name: '加入 NH₃ 氣體', dir: '<' }
    ]
  }
];

export default function EquilibriumFloorGame({ mode = 'single', onGameOver }) {
  // 回合與流程狀態
  const [currentRound, setCurrentRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  // 階段：'memorize' (條件閃現中) | 'input' (作答階段)
  const [phase, setPhase] = useState('memorize');

  // 當前反應式與破壞條件序列
  const [currentReaction, setCurrentReaction] = useState(EQUILIBRIUM_REACTIONS[0]);
  const [conditionsSequence, setConditionsSequence] = useState([]);
  const [targetDirs, setTargetDirs] = useState([]);

  // 目前閃現顯示的條件索引
  const [showingIndex, setShowingIndex] = useState(-1);

  // 玩家輸入的答案序列
  const [p1Answers, setP1Answers] = useState([]);
  const [p2Answers, setP2Answers] = useState([]);

  // 遊戲結果訊息
  const [winnerMsg, setWinnerMsg] = useState('');

  // 初始化每一回合題目與條件序列
  const startRound = (roundNum) => {
    // 隨機抽選三大經典題目之一
    const rx = EQUILIBRIUM_REACTIONS[Math.floor(Math.random() * EQUILIBRIUM_REACTIONS.length)];
    setCurrentReaction(rx);

    // 隨機生成 roundNum 個條件
    const seq = [];
    const dirs = [];
    for (let i = 0; i < roundNum; i++) {
      const randomRule = rx.rules[Math.floor(Math.random() * rx.rules.length)];
      seq.push(randomRule.name);
      dirs.push(randomRule.dir);
    }

    setConditionsSequence(seq);
    setTargetDirs(dirs);
    setP1Answers([]);
    setP2Answers([]);
    setShowingIndex(-1);
    setPhase('memorize');
  };

  useEffect(() => {
    startRound(currentRound);
  }, [currentRound]);

  // 記憶階段：每 1 秒閃現一個條件
  useEffect(() => {
    if (phase === 'memorize' && conditionsSequence.length > 0) {
      let step = 0;
      setShowingIndex(0);

      const interval = setInterval(() => {
        step++;
        if (step < conditionsSequence.length) {
          setShowingIndex(step);
        } else {
          clearInterval(interval);
          setShowingIndex(-1);
          setPhase('input');
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [phase, conditionsSequence]);

  // 處理玩家按鈕操作
  const handleInput = (player, dir) => {
    if (phase !== 'input' || isFinished) return;

    if (player === 'p1') {
      const nextAnswers = [...p1Answers, dir];
      const currentIndex = p1Answers.length;

      if (dir !== targetDirs[currentIndex]) {
        setIsFinished(true);
        setWinnerMsg(mode === 'single' ? '❌ 判斷錯誤！平衡破壞方向不符！' : '🎉 Player 2 獲勝！Player 1 按錯出局！');
        return;
      }

      setP1Answers(nextAnswers);

      if (mode === 'single' && nextAnswers.length === targetDirs.length) {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
        }, 800);
      }
    } else if (player === 'p2' && mode === 'pvp') {
      const nextAnswers = [...p2Answers, dir];
      const currentIndex = p2Answers.length;

      if (dir !== targetDirs[currentIndex]) {
        setIsFinished(true);
        setWinnerMsg('🎉 Player 1 獲勝！Player 2 按錯出局！');
        return;
      }

      setP2Answers(nextAnswers);
    }

    if (mode === 'pvp') {
      const p1Done = (player === 'p1' ? p1Answers.length + 1 : p1Answers.length) === targetDirs.length;
      const p2Done = (player === 'p2' ? p2Answers.length + 1 : p2Answers.length) === targetDirs.length;

      if (p1Done && p2Done) {
        setTimeout(() => {
          setCurrentRound((prev) => prev + 1);
        }, 800);
      }
    }
  };

  const handleExit = () => {
    const gainedExp = currentRound * 40;
    if (onGameOver) onGameOver(gainedExp);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 80F ({mode === 'pvp' ? '雙人平衡記憶 PK' : '單人記憶闖關'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            ⚖️ 80F 平衡擂台：勒沙特列記憶大師
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">目前回合 (指令數)</p>
            <p className="text-base font-mono font-bold text-amber-400">
              Round {currentRound} ({currentRound} 個條件)
            </p>
          </div>
        </div>
      </div>

      {/* 反應式擂台與條件閃現面板 */}
      {!isFinished && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              🧪 【三大經典可逆反應】{currentReaction.name}
            </span>
            <h3 className="text-lg md:text-xl font-black text-cyan-300 font-mono tracking-wide mt-2">
              {currentReaction.equation}
            </h3>
          </div>

          {/* 指令閃現展示區 */}
          <div className="min-h-[90px] flex flex-col items-center justify-center">
            {phase === 'memorize' && showingIndex !== -1 && (
              <div className="animate-bounce space-y-1">
                <span className="text-[11px] text-amber-400 font-bold">
                  ⚡ 條件 {showingIndex + 1} / {conditionsSequence.length}
                </span>
                <div className="bg-amber-500 text-slate-950 font-black text-lg md:text-xl px-6 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.6)] border-2 border-amber-300">
                  [{conditionsSequence[showingIndex]}]
                </div>
              </div>
            )}

            {phase === 'input' && (
              <div className="space-y-1 animate-pulse">
                <span className="text-xs font-bold text-emerald-400">
                  🧠 閃現結束！請依序還原前面 {conditionsSequence.length} 個破壞條件的平衡移動方向！
                </span>
                <p className="text-[11px] text-slate-400">
                  正確方向提示：{'? '.repeat(conditionsSequence.length)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 按鈕操作區域 */}
      {!isFinished && (
        <div className={`grid ${mode === 'pvp' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Player 1 操作 */}
          <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-3xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400">
                🛡️ Player 1
              </span>
              <span className="text-xs text-slate-400">
                已還原：<strong className="text-amber-400 font-mono">{p1Answers.length} / {targetDirs.length}</strong>
              </span>
            </div>

            <div className="flex gap-1.5 justify-center min-h-[36px] items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
              {targetDirs.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-7 h-7 rounded-lg text-xs font-black font-mono flex items-center justify-center border ${
                    p1Answers[idx]
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  {p1Answers[idx] || '?'}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleInput('p1', '<')}
                disabled={phase !== 'input'}
                className="py-4 bg-slate-900 hover:bg-indigo-600/80 text-white font-black text-lg md:text-xl rounded-2xl border border-indigo-500/40 hover:border-indigo-400 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ArrowLeft className="w-6 h-6 text-cyan-400" /> 向左 🠔 (&lt;)
              </button>

              <button
                onClick={() => handleInput('p1', '>')}
                disabled={phase !== 'input'}
                className="py-4 bg-slate-900 hover:bg-indigo-600/80 text-white font-black text-lg md:text-xl rounded-2xl border border-indigo-500/40 hover:border-indigo-400 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                向右 ➔ (&gt;) <ArrowRight className="w-6 h-6 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Player 2 操作 (PVP 模式) */}
          {mode === 'pvp' && (
            <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-3xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400">
                  ⚔️ Player 2
                </span>
                <span className="text-xs text-slate-400">
                  已還原：<strong className="text-amber-400 font-mono">{p2Answers.length} / {targetDirs.length}</strong>
                </span>
              </div>

              <div className="flex gap-1.5 justify-center min-h-[36px] items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                {targetDirs.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-7 h-7 rounded-lg text-xs font-black font-mono flex items-center justify-center border ${
                      p2Answers[idx]
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                  >
                    {p2Answers[idx] || '?'}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleInput('p2', '<')}
                  disabled={phase !== 'input'}
                  className="py-4 bg-slate-900 hover:bg-rose-600/80 text-white font-black text-lg md:text-xl rounded-2xl border border-rose-500/40 hover:border-rose-400 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <ArrowLeft className="w-6 h-6 text-cyan-400" /> 向左 🠔 (&lt;)
                </button>

                <button
                  onClick={() => handleInput('p2', '>')}
                  disabled={phase !== 'input'}
                  className="py-4 bg-slate-900 hover:bg-rose-600/80 text-white font-black text-lg md:text-xl rounded-2xl border border-rose-500/40 hover:border-rose-400 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  向右 ➔ (&gt;) <ArrowRight className="w-6 h-6 text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {winnerMsg}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              勒沙特列原理：可逆反應受到外界破壞時，平衡會朝向「抵消該破壞」的方向移動！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終突破回合：</span>
              <span className="font-bold text-amber-400">Round {currentRound}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">正確答案方向：</span>
              <span className="font-bold text-emerald-400">{targetDirs.join(' ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{currentRound * 40}</span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 返回競技場大廳
          </button>
        </div>
      )}
    </div>
  );
}