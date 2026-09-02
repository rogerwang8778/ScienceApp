import React, { useState, useEffect } from 'react';
import { Shield, Zap, Heart, Trophy, RefreshCw, Flame, ArrowUp, ArrowDown } from 'lucide-react';

export default function DensityFloorGame({ mode = 'single', onGameOver }) {
  // 玩家與對手血條 (HP)
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // 對戰回合狀態
  const [currentRound, setCurrentRound] = useState(null);
  const [hitFeedback, setHitFeedback] = useState(null); // 'hit_enemy' | 'hit_player'
  const [isFinished, setIsFinished] = useState(false);

  // 液體資料庫
  const liquids = [
    { name: '沙拉油', density: 0.8, color: 'from-amber-500/20 to-yellow-600/30', border: 'border-amber-500', icon: '🧈' },
    { name: '純水', density: 1.0, color: 'from-blue-500/20 to-cyan-600/30', border: 'border-cyan-500', icon: '💧' },
    { name: '濃鹽水', density: 1.2, color: 'from-teal-500/20 to-emerald-600/30', border: 'border-emerald-500', icon: '🧂' },
    { name: '水銀 (汞)', density: 13.6, color: 'from-slate-400/20 to-slate-600/30', border: 'border-slate-400', icon: '🪙' }
  ];

  // 物質範例池 (M: 質量 g, V: 體積 cm³)
  const materialsPool = [
    { name: '保麗龍', M: 2, V: 10, density: 0.2 },
    { name: '松木塊', M: 12, V: 20, density: 0.6 },
    { name: '冰塊', M: 18, V: 20, density: 0.9 },
    { name: '塑膠塊', M: 22, V: 20, density: 1.1 },
    { name: '鋁塊', M: 54, V: 20, density: 2.7 },
    { name: '鐵塊', M: 158, V: 20, density: 7.9 },
    { name: '鉛塊', M: 226, V: 20, density: 11.3 },
    { name: '金塊', M: 386, V: 20, density: 19.3 }
  ];

  // 生成隨機回合題目
  const generateRound = () => {
    const liquid = liquids[Math.floor(Math.random() * liquids.length)];
    // 攻防目標：'float' (浮起來 D_物 < D_液) 或 'sink' (沉下去 D_物 > D_液)
    const actionGoal = Math.random() > 0.5 ? 'float' : 'sink';

    // 篩選出符合答案與不符合答案的物體
    let correctCandidates = [];
    let wrongCandidates = [];

    materialsPool.forEach((m) => {
      if (actionGoal === 'float' && m.density < liquid.density) {
        correctCandidates.push(m);
      } else if (actionGoal === 'sink' && m.density > liquid.density) {
        correctCandidates.push(m);
      } else {
        wrongCandidates.push(m);
      }
    });

    // 若極端情況下候選不夠，預設退回純水題型
    if (correctCandidates.length === 0 || wrongCandidates.length < 3) {
      return generateRound();
    }

    // 抽 1 個正確選項 + 3 個錯誤選項
    const correctMat = correctCandidates[Math.floor(Math.random() * correctCandidates.length)];
    const shuffledWrong = wrongCandidates.sort(() => 0.5 - Math.random()).slice(0, 3);

    // 打亂四個選項
    const options = [correctMat, ...shuffledWrong].sort(() => 0.5 - Math.random());

    setCurrentRound({
      liquid,
      actionGoal,
      options,
      correctAnswerIndex: options.findIndex((o) => o.name === correctMat.name)
    });
  };

  // 初始化與倒數計時器
  useEffect(() => {
    generateRound();
  }, []);

  useEffect(() => {
    let timer = null;
    if (!isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  // 處理玩家選擇
  const handleAnswer = (index) => {
    if (!currentRound || isFinished) return;

    if (index === currentRound.correctAnswerIndex) {
      // 答對：對手扣血 + 加分
      setHitFeedback('hit_enemy');
      setCombo((prev) => prev + 1);
      const addPoints = 20 + combo * 5;
      setScore((prev) => prev + addPoints);

      setEnemyHp((prev) => {
        const nextHp = Math.max(0, prev - 25);
        if (nextHp === 0) setTimeout(handleFinish, 500);
        return nextHp;
      });
    } else {
      // 答錯：玩家扣血 (防禦失敗)
      setHitFeedback('hit_player');
      setCombo(0);
      setPlayerHp((prev) => {
        const nextHp = Math.max(0, prev - 20);
        if (nextHp === 0) setTimeout(handleFinish, 500);
        return nextHp;
      });
    }

    setTimeout(() => {
      setHitFeedback(null);
      if (enemyHp > 25 && playerHp > 20) {
        generateRound();
      }
    }, 600);
  };

  // 遊戲結束
  const handleFinish = () => {
    setIsFinished(true);
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none">
      {/* 1. 天空競技場 1F 樓層標題列 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Heaven's Arena • Floor 1F
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 flex items-center gap-2">
            ⚔️ 1F 密度擂台：浮沉剋制戰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">當前積分</p>
            <p className="text-lg font-mono font-bold text-amber-400">{score} PTS</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">倒數計時</p>
            <p className={`text-base font-mono font-bold ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>
      </div>

      {/* 2. 對戰擂台對決區 (玩家 vs 1F 關主) */}
      {!isFinished && currentRound && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* 玩家血條與卡片 */}
          <div className={`bg-slate-900/80 border p-4 rounded-2xl transition-all duration-300 ${hitFeedback === 'hit_player' ? 'border-rose-500 bg-rose-950/30 animate-bounce' : 'border-slate-800'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                <Shield className="w-4 h-4" /> 玩家挑戰者 (You)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-none" /> {playerHp} HP
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${playerHp}%` }} />
            </div>
          </div>

          {/* 1F 關主血條與卡片 */}
          <div className={`bg-slate-900/80 border p-4 rounded-2xl transition-all duration-300 ${hitFeedback === 'hit_enemy' ? 'border-amber-500 bg-amber-950/30 animate-bounce' : 'border-slate-800'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                🥊 1F 密度關主 (Floor Master)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-none" /> {enemyHp} HP
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 dir-rtl">
              <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${enemyHp}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* 3. 液體陷阱題目卡片 */}
      {!isFinished && currentRound && (
        <div className="space-y-5">
          <div className={`bg-gradient-to-r ${currentRound.liquid.color} border ${currentRound.liquid.border} p-6 rounded-2xl text-center space-y-3 relative overflow-hidden`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 border border-white/10 text-xs text-slate-300">
              <span className="text-lg">{currentRound.liquid.icon}</span>
              對手投擲液體陷阱：<strong className="text-white">{currentRound.liquid.name}</strong> 
              <span className="font-mono text-cyan-300">(密度 D = {currentRound.liquid.density} g/cm³)</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">防禦攻防指令：</p>
              <h3 className="text-lg md:text-xl font-black text-white flex items-center justify-center gap-2">
                {currentRound.actionGoal === 'float' ? (
                  <>
                    <ArrowUp className="w-6 h-6 text-emerald-400 animate-bounce" />
                    選出能 <span className="text-emerald-400 underline decoration-wavy">浮在液面上</span> 的盾牌材質！
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-6 h-6 text-amber-400 animate-bounce" />
                    選出能 <span className="text-amber-400 underline decoration-wavy">沉入液體底</span> 的砲彈材質！
                  </>
                )}
              </h3>
            </div>
          </div>

          {/* 4. 四個物體選項 ($M$ 與 $V$ 算密度) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRound.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center text-xs font-mono font-bold">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span className="font-bold text-white text-sm group-hover:text-indigo-300">
                      {option.name}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 pl-8">
                    質量 M = <span className="text-amber-300">{option.M}g</span> ｜ 體積 V = <span className="text-cyan-300">{option.V}cm³</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">密度 D</span>
                  <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-emerald-400">
                    {(option.M / option.V).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. 擂台對戰結算頁 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {enemyHp === 0 ? '🎉 1F 擂台突破成功！' : '⚔️ 擂台對戰結束'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? '恭喜通關天空競技場 1F！準許晉級更高樓層！' : '再接再厲，掌握密度浮沉特性就能輕鬆擊破對手！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">得分 PTS：</span>
              <span className="font-bold text-indigo-400">{score}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">剩餘血量 HP：</span>
              <span className="font-bold text-emerald-400">{playerHp}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{score + (playerHp > 0 ? 50 : 10)}</span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> 結算並返回競技場大廳
          </button>
        </div>
      )}
    </div>
  );
}