import React, { useState, useEffect, useRef } from 'react';
import { Heart, Trophy, RefreshCw, Droplet } from 'lucide-react';

export default function ConcentrationFloorGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);

  // 動作與回合狀態
  const [actionState, setActionState] = useState('idle'); 
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // PK 模式水龍頭注水 State
  const [p1PourValue, setP1PourValue] = useState(0);
  const isPouringRef = useRef(false);
  const pourTimerRef = useRef(null);

  // ==========================================
  // 1. 動態難度生成 & 確保穩定 4 個選項
  // ==========================================
  const generateRound = (currentLevel) => {
    const type = Math.random() > 0.5 ? 'typeA' : 'typeB';
    let roundData = {};

    if (type === 'typeA') {
      // 類型 A：給定初始 P1、W1 與目標 P2，求加/蒸發水量 W_water (上限 1000g)
      let P1, W1, P2, W_water;

      if (currentLevel <= 2) {
        // Lvl 1-2: 基礎心算 (150g ~ 300g)
        P1 = 20; 
        W1 = 100 + currentLevel * 50; 
        P2 = 10; 
        W_water = W1; 
      } else if (currentLevel <= 5) {
        // Lvl 3-5: 中階非整數比率 (如 120g, 240g, 360g)
        W1 = 120 + (currentLevel - 2) * 60; 
        P1 = 25;
        P2 = 10; // 加水 1.5 倍 W1
        W_water = Math.round(W1 * 1.5); 
      } else {
        // Lvl 6+: 高階蒸發濃縮或複雜加水
        P1 = 12;
        W1 = 250 + (currentLevel % 4) * 80;
        P2 = 30; // 蒸發水分題
        W_water = -Math.round(W1 * 0.6);
      }

      const targetAns = Math.abs(W_water);
      
      // 生成 4 個不重複且合理的干擾選項
      const optsSet = new Set([targetAns]);
      const offsets = [50, -50, 100, -100, 150, -150, 200];
      
      for (let offset of offsets) {
        if (optsSet.size >= 4) break;
        const candidate = targetAns + offset;
        if (candidate > 0 && candidate <= 1000) {
          optsSet.add(candidate);
        }
      }

      const options = Array.from(optsSet).sort(() => 0.5 - Math.random());

      roundData = {
        type: 'typeA',
        title: W_water < 0 ? '🔥 蒸發濃縮挑戰' : '💧 加水稀釋對決',
        desc: `初始溶液：${W1}g，濃度：${P1}%。目標調整至濃度：${P2}%。`,
        questionText: W_water < 0 ? `請問需要「蒸發」多少克的水分？` : `請問需要「加入」多少克的水？`,
        targetValue: targetAns,
        maxGauge: 1000, 
        options,
        correctIdx: options.indexOf(targetAns),
        unit: 'g'
      };
    } else {
      // 類型 B：求最終濃度 P2 (上限 100%)
      let P1, W1, W_water, P2;

      if (currentLevel <= 2) {
        P1 = 24;
        W1 = 100;
        W_water = 100 + currentLevel * 100; 
        P2 = Math.round((P1 * W1) / (W1 + W_water)); 
      } else if (currentLevel <= 5) {
        P1 = 35;
        W1 = 180 + (currentLevel - 2) * 40;
        W_water = 220; 
        P2 = Math.round((P1 * W1) / (W1 + W_water)); 
      } else {
        P1 = 18;
        W1 = 400;
        W_water = -160; // 蒸發濃縮
        P2 = Math.min(100, Math.round((P1 * W1) / (W1 + W_water))); 
      }

      const targetAns = P2;
      const optsSet = new Set([targetAns]);
      const offsets = [4, -4, 8, -8, 12, -12, 15];

      for (let offset of offsets) {
        if (optsSet.size >= 4) break;
        const candidate = targetAns + offset;
        if (candidate > 0 && candidate <= 100) {
          optsSet.add(candidate);
        }
      }

      const options = Array.from(optsSet).sort(() => 0.5 - Math.random());

      roundData = {
        type: 'typeB',
        title: W_water < 0 ? '🔥 蒸發濃縮挑戰' : '🧪 最終濃度推算',
        desc: `初始溶液：${W1}g，濃度：${P1}%。${W_water < 0 ? `蒸發 ${Math.abs(W_water)}g 水` : `加入 ${W_water}g 水`}。`,
        questionText: `請問最終溶液的重量百分濃度為多少 %？`,
        targetValue: targetAns,
        maxGauge: 100, 
        options,
        correctIdx: options.indexOf(targetAns),
        unit: '%'
      };
    }

    setCurrentRound(roundData);
    setP1PourValue(0);
  };

  useEffect(() => {
    generateRound(1);
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

  // 作答並處理難度遞增 (+1 Level)
  const handleAnswer = (isCorrect) => {
    if (actionState !== 'idle' || isFinished) return;

    if (isCorrect) {
      setActionState('player_attack');
      const nextLevel = level + 1;
      setLevel(nextLevel);

      setTimeout(() => {
        setActionState('enemy_hit');
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 20 + nextLevel * 5);
        setEnemyHp((prev) => {
          const nextHp = Math.max(0, prev - 25);
          if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
          return nextHp;
        });
      }, 250);

      setTimeout(() => {
        setActionState('idle');
        if (enemyHp > 25 && playerHp > 0) {
          generateRound(nextLevel);
        }
      }, 900);
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

      setTimeout(() => {
        setActionState('idle');
        if (playerHp > 20 && enemyHp > 0) {
          generateRound(level);
        }
      }, 900);
    }
  };

  // ==========================================
  // 2. 放慢注水速率 (增量由 15 調降至 5)
  // ==========================================
  const startPouring = () => {
    if (isPouringRef.current || actionState !== 'idle') return;
    isPouringRef.current = true;
    
    // 放慢流速：水量每次加 5g，濃度每次加 1%
    const increment = currentRound.maxGauge === 1000 ? 5 : 1; 

    pourTimerRef.current = setInterval(() => {
      setP1PourValue((prev) => Math.min(currentRound.maxGauge, prev + increment));
    }, 35);
  };

  const stopPouring = () => {
    if (!isPouringRef.current) return;
    isPouringRef.current = false;
    clearInterval(pourTimerRef.current);

    // 容錯區間
    const margin = currentRound.maxGauge === 1000 ? 35 : 4;
    const diff = Math.abs(p1PourValue - currentRound.targetValue);
    const isCorrect = diff <= margin;
    handleAnswer(isCorrect);
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none overflow-hidden">
      {/* 頂部關卡卡片 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 10F ({mode === 'pvp' ? 'PK 模式' : '單人限時'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
            </span>
          </div>
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

      {/* 對戰舞台 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex justify-between items-center min-h-[200px]">
          {/* 左側角色 */}
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

          {/* 右側角色 */}
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

      {/* 題目卡片 */}
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

          {/* 單人模式：4 選 1 */}
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
            /* PK 模式：水龍頭與帶刻度量筒 */
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">目前量筒注入刻度：</span>
                <span className="text-lg font-bold text-cyan-400">
                  {p1PourValue} {currentRound.unit} <span className="text-xs text-slate-500">(上限 {currentRound.maxGauge}{currentRound.unit})</span>
                </span>
              </div>

              {/* 帶有 25%、50%、75%、100% 視覺刻度線的擬真量筒 */}
              <div className="space-y-1">
                <div className="w-full bg-slate-950 h-12 rounded-2xl border border-slate-700 relative overflow-hidden flex items-center p-1 shadow-inner">
                  {/* 注水水流 */}
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-xl transition-all duration-75"
                    style={{ width: `${(p1PourValue / currentRound.maxGauge) * 100}%` }}
                  />

                  {/* 等比例刻度線 (25%, 50%, 75%) */}
                  <div className="absolute inset-0 flex justify-between px-2 pointer-events-none items-center">
                    <div className="w-0.5 h-full bg-slate-700/60" style={{ left: '25%' }} />
                    <div className="w-0.5 h-full bg-slate-600/80" style={{ left: '50%' }} />
                    <div className="w-0.5 h-full bg-slate-700/60" style={{ left: '75%' }} />
                  </div>
                </div>

                {/* 刻度標籤文字 */}
                <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
                  <span>0{currentRound.unit}</span>
                  <span>{currentRound.maxGauge * 0.25}{currentRound.unit}</span>
                  <span>{currentRound.maxGauge * 0.5}{currentRound.unit}</span>
                  <span>{currentRound.maxGauge * 0.75}{currentRound.unit}</span>
                  <span>{currentRound.maxGauge}{currentRound.unit}</span>
                </div>
              </div>

              <button
                onMouseDown={startPouring}
                onMouseUp={stopPouring}
                onTouchStart={startPouring}
                onTouchEnd={stopPouring}
                disabled={actionState !== 'idle'}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-700 active:to-blue-700 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 select-none touch-none cursor-pointer"
              >
                <Droplet className="w-5 h-5 fill-white animate-bounce" /> 按住水龍頭注水 (對準刻度放開)
              </button>
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
              {enemyHp === 0 ? '🎉 10F 濃度擂台突破成功！' : '⚔️ 擂台對戰結束'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? `連續答對突破至 Lvl.${level}！準許晉級更高樓層！` : '熟記溶液 P% = 溶質 / 溶液，手算預估就能輕鬆擊破！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終達到難度：</span>
              <span className="font-bold text-amber-400">Lvl.{level}</span>
            </div>
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
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 結算並返回競技場大廳
          </button>
        </div>
      )}
    </div>
  );
}