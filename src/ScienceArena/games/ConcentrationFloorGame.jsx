import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart, Trophy, RefreshCw, Droplet, ArrowRight, Zap, Play } from 'lucide-react';

export default function ConcentrationFloorGame({ mode = 'single', onGameOver }) {
  // 玩家與關主狀態
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // 動作與回合狀態
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'player_attack' | 'enemy_attack' | 'player_hit' | 'enemy_hit'
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // PK 模式專屬：水龍頭注水控制 State
  const [p1PourValue, setP1PourValue] = useState(0);
  const isPouringRef = useRef(false);
  const pourTimerRef = useRef(null);

  // ==========================================
  // 題目生成邏輯 (類型 A、類型 B、三階段難度)
  // ==========================================
  const generateRound = () => {
    // 難度判斷：前 2 題簡單、3-5 題進階、6 題以上挑戰
    const difficulty = score < 40 ? 'easy' : score < 100 ? 'medium' : 'hard';
    const type = Math.random() > 0.5 ? 'typeA' : 'typeB';

    let roundData = {};

    if (type === 'typeA') {
      // 類型 A：給定初始 P1、W1 與目標 P2，求加水量 W_water
      let P1, W1, P2, W_water;

      if (difficulty === 'easy') {
        P1 = 20; // 20%
        W1 = 100; // 100g 溶液 (溶質 20g)
        P2 = 10; // 降至 10%
        W_water = 100; // 需要加水 100g (總重 200g)
      } else if (difficulty === 'medium') {
        P1 = 30; // 30%
        W1 = 200; // 200g (溶質 60g)
        P2 = 15; // 降至 15%
        W_water = 200; // 需要加水 200g (總重 400g)
      } else {
        // 挑戰級：蒸發水分濃縮 (P2 > P1)
        P1 = 10; // 10%
        W1 = 200; // 200g (溶質 20g)
        P2 = 20; // 濃縮至 20%
        W_water = -100; // 蒸發 100g 水 (總重 100g)
      }

      // 生成 4 個選擇題選項 (單人模式用)
      const targetAns = Math.abs(W_water);
      const wrongOpts = [
        targetAns + 50,
        Math.max(25, targetAns - 50),
        targetAns * 2
      ];
      const options = [targetAns, ...wrongOpts].sort(() => 0.5 - Math.random());

      roundData = {
        type: 'typeA',
        title: W_water < 0 ? '🔥 蒸發濃縮挑戰' : '💧 加水稀釋對決',
        desc: `初始溶液：${W1}g，濃度：${P1}%。目標調整至濃度：${P2}%。`,
        questionText: W_water < 0 ? `請問需要「蒸發」多少克的水分？` : `請問需要「加入」多少克的水？`,
        targetValue: targetAns,
        options,
        correctIdx: options.indexOf(targetAns),
        unit: 'g'
      };
    } else {
      // 類型 B：給定初始 P1、W1 與加水量 W_water，求最終濃度 P2
      let P1, W1, W_water, P2;

      if (difficulty === 'easy') {
        P1 = 20; // 20%
        W1 = 100; // 100g (溶質 20g)
        W_water = 100; // 加水 100g (總重 200g)
        P2 = 10; // 20 / 200 = 10%
      } else if (difficulty === 'medium') {
        P1 = 40; // 40%
        W1 = 100; // 100g (溶質 40g)
        W_water = 300; // 加水 300g (總重 400g)
        P2 = 10; // 40 / 400 = 10%
      } else {
        P1 = 25; // 25%
        W1 = 200; // 200g (溶質 50g)
        W_water = -100; // 蒸發 100g 水 (總重 100g)
        P2 = 50; // 50 / 100 = 50%
      }

      const wrongOpts = [P2 + 5, Math.max(5, P2 - 5), P2 * 2];
      const options = [P2, ...wrongOpts].sort(() => 0.5 - Math.random());

      roundData = {
        type: 'typeB',
        title: W_water < 0 ? '🔥 蒸發濃縮挑戰' : '🧪 最終濃度推算',
        desc: `初始溶液：${W1}g，濃度：${P1}%。${W_water < 0 ? `蒸發 ${Math.abs(W_water)}g 水` : `加入 ${W_water}g 水`}。`,
        questionText: `請問最終溶液的重量百分濃度為多少 %？`,
        targetValue: P2,
        options,
        correctIdx: options.indexOf(P2),
        unit: '%'
      };
    }

    setCurrentRound(roundData);
    setP1PourValue(0);
  };

  useEffect(() => {
    generateRound();
  }, []);

  // 單人模式計時器
  useEffect(() => {
    let timer = null;
    if (mode === 'single' && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (mode === 'single' && timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, mode]);

  // ==========================================
  // 作答與 PK 水龍頭控制
  // ==========================================
  const handleAnswer = (isCorrect) => {
    if (actionState !== 'idle' || isFinished) return;

    if (isCorrect) {
      setActionState('player_attack');
      setTimeout(() => {
        setActionState('enemy_hit');
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 25 + combo * 5);
        setEnemyHp((prev) => {
          const nextHp = Math.max(0, prev - 25);
          if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
          return nextHp;
        });
      }, 250);
    } else {
      setActionState('enemy_attack');
      setTimeout(() => {
        setActionState('player_hit');
        setCombo(0);
        setPlayerHp((prev) => {
          const nextHp = Math.max(0, prev - 20);
          if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
          return nextHp;
        });
      }, 250);
    }

    setTimeout(() => {
      setActionState('idle');
      if (enemyHp > 25 && playerHp > 20) {
        generateRound();
      }
    }, 900);
  };

  // PK 模式：按住水龍頭注水邏輯
  const startPouring = () => {
    if (isPouringRef.current || actionState !== 'idle') return;
    isPouringRef.current = true;
    pourTimerRef.current = setInterval(() => {
      setP1PourValue((prev) => Math.min(400, prev + 5));
    }, 40);
  };

  const stopPouring = () => {
    if (!isPouringRef.current) return;
    isPouringRef.current = false;
    clearInterval(pourTimerRef.current);

    // 判斷是否精準停在目標數值範圍 (允許 ±15 容錯度)
    const diff = Math.abs(p1PourValue - currentRound.targetValue);
    const isCorrect = diff <= 20;
    handleAnswer(isCorrect);
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none overflow-hidden">
      {/* 1. 天空競技場 頂部資訊 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Heaven's Arena • Floor 10F ({mode === 'pvp' ? 'PK 水龍頭對戰' : '單人限時'})
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 flex items-center gap-2">
            🧪 10F 濃度擂台：水龍頭稀釋對對碰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">當前積分</p>
            <p className="text-lg font-mono font-bold text-amber-400">{score} PTS</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">時間限制</p>
            {mode === 'single' ? (
              <p className={`text-base font-mono font-bold ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`}>
                {timeLeft}s
              </p>
            ) : (
              <p className="text-base font-mono font-bold text-emerald-400">∞ (打倒為止)</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. 對戰舞台與角色形象 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex justify-between items-center min-h-[200px]">
          {/* 左側：挑戰者 */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${actionState === 'player_attack' ? 'translate-x-12 scale-110' : ''} ${actionState === 'player_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'player_hit' && <span className="absolute -top-8 text-rose-500 font-black text-xl animate-bounce">-20 HP!</span>}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-indigo-600/20 border-2 border-indigo-400 flex items-center justify-center relative shadow-lg shadow-indigo-500/20">
              <div className="text-4xl md:text-5xl">🧪</div>
              <span className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 1' : '挑戰者'}
              </span>
            </div>
            <div className="w-28 md:w-36 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-indigo-300">YOU</span>
                <span className="text-rose-400">{playerHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-800 p-0.5">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${playerHp}%` }} />
              </div>
            </div>
          </div>

          <div className="z-10 text-center">
            <span className="text-2xl md:text-3xl font-black italic text-slate-700 tracking-widest">VS</span>
            {combo > 1 && <p className="text-xs font-bold text-amber-400 animate-pulse mt-1">🔥 {combo} COMBO!</p>}
          </div>

          {/* 右側：1F 濃度關主 */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${actionState === 'enemy_attack' ? '-translate-x-12 scale-110' : ''} ${actionState === 'enemy_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'enemy_hit' && <span className="absolute -top-8 text-amber-400 font-black text-xl animate-bounce">-25 HP!</span>}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center relative shadow-lg shadow-rose-500/20">
              <div className="text-4xl md:text-5xl">💧</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">10F 濃度關主</span>
            </div>
            <div className="w-28 md:w-36 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-rose-400">BOSS</span>
                <span className="text-rose-400">{enemyHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-800 p-0.5 dir-rtl">
                <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${enemyHp}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 題目面板 */}
      {!isFinished && currentRound && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 text-center">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              {currentRound.title}
            </span>
            <h3 className="text-base md:text-lg font-bold text-white mt-1">
              {currentRound.desc}
            </h3>
            <p className="text-xs text-amber-300 font-semibold">
              🎯 {currentRound.questionText}
            </p>
          </div>

          {/* 4. 操作介面 (單人模式：4選1 ｜ PK模式：水龍頭拉桿) */}
          {mode === 'single' ? (
            <div className="grid grid-cols-2 gap-3">
              {currentRound.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx === currentRound.correctIdx)}
                  disabled={actionState !== 'idle'}
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500 text-center font-mono font-bold text-base text-white hover:text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {opt} {currentRound.unit}
                </button>
              ))}
            </div>
          ) : (
            /* PK模式專屬：按住水龍頭注水拉桿介面 */
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">目前注水量 / 刻度：</span>
                <span className="text-lg font-bold text-cyan-400">{p1PourValue} {currentRound.unit}</span>
              </div>

              {/* 擬真量筒柱狀圖 */}
              <div className="w-full bg-slate-950 h-8 rounded-xl border border-slate-800 relative overflow-hidden flex items-center p-1">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-lg transition-all duration-75"
                  style={{ width: `${(p1PourValue / 400) * 100}%` }}
                />
                {/* 目標提示線 */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10 animate-pulse"
                  style={{ left: `${(currentRound.targetValue / 400) * 100}%` }}
                />
              </div>

              <button
                onMouseDown={startPouring}
                onMouseUp={stopPouring}
                onTouchStart={startPouring}
                onTouchEnd={stopPouring}
                disabled={actionState !== 'idle'}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-700 active:to-blue-700 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 select-none touch-none"
              >
                <Droplet className="w-5 h-5 fill-white animate-bounce" /> 按住水龍頭注水 (達到目標鬆開)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {enemyHp === 0 ? '🎉 10F 濃度擂台突破成功！' : '⚔️ 擂台對戰結束'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? '擊敗濃度關主！準許晉級天空競技場更高的 50F 樓層！' : '熟記質量百分濃度 P% = 溶質 / 溶液，就能輕鬆破招！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終得分 PTS：</span>
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