import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Droplet, Swords } from 'lucide-react';

export default function ConcentrationFloorGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100); // 單人：玩家HP ｜ 雙人：P1 HP
  const [enemyHp, setEnemyHp] = useState(100);  // 單人：關主HP ｜ 雙人：P2 HP
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60); 

  // 動作與回合狀態
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'p1_attack' | 'p2_attack' | 'p1_hit' | 'p2_hit'
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // P1 與 P2 獨立注水數值與計時器 (雙人同屏搶答)
  const [p1PourValue, setP1PourValue] = useState(0);
  const [p2PourValue, setP2PourValue] = useState(0);

  const isPouringP1Ref = useRef(false);
  const pourTimerP1Ref = useRef(null);

  const isPouringP2Ref = useRef(false);
  const pourTimerP2Ref = useRef(null);

  // 題庫生成邏輯 (支援難度遞增)
  const generateRound = (currentLevel) => {
    const type = Math.random() > 0.5 ? 'typeA' : 'typeB';
    let roundData = {};

    if (type === 'typeA') {
      let P1, W1, P2, W_water;

      if (currentLevel <= 2) {
        P1 = 20; W1 = 100 + currentLevel * 50; P2 = 10; W_water = W1;
      } else if (currentLevel <= 5) {
        W1 = 120 + (currentLevel - 2) * 40; P1 = 25; P2 = 10; W_water = Math.round(W1 * 1.5);
      } else {
        P1 = 12; W1 = 300 + (currentLevel % 5) * 60; P2 = 30; W_water = -Math.round(W1 * 0.6);
      }

      const targetAns = Math.abs(W_water);
      const optsSet = new Set([targetAns]);
      const offsets = [50, -50, 100, -100, 150, -150];
      for (let offset of offsets) {
        if (optsSet.size >= 4) break;
        const candidate = targetAns + offset;
        if (candidate > 0 && candidate <= 1000) optsSet.add(candidate);
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
      let P1, W1, W_water, P2;

      if (currentLevel <= 2) {
        P1 = 24; W1 = 100; W_water = 100 + currentLevel * 100; P2 = Math.round((P1 * W1) / (W1 + W_water));
      } else if (currentLevel <= 5) {
        P1 = 35; W1 = 200 + (currentLevel - 2) * 50; W_water = 150; P2 = Math.round((P1 * W1) / (W1 + W_water));
      } else {
        P1 = 20; W1 = 400 + (currentLevel % 3) * 100; W_water = -200; P2 = Math.min(100, Math.round((P1 * W1) / (W1 + W_water)));
      }

      const targetAns = P2;
      const optsSet = new Set([targetAns]);
      const offsets = [4, -4, 8, -8, 12, -12];
      for (let offset of offsets) {
        if (optsSet.size >= 4) break;
        const candidate = targetAns + offset;
        if (candidate > 0 && candidate <= 100) optsSet.add(candidate);
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
    setP2PourValue(0);
  };

  useEffect(() => {
    generateRound(1);
  }, []);

  // 單人模式倒數計時器 (60秒)
  useEffect(() => {
    let timer = null;
    if (mode === 'single' && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (mode === 'single' && timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, mode]);

  // 作答處理 (支援 P1 或 P2 獨立驗證)
  const handlePlayerAnswer = (player, isCorrect) => {
    if (actionState !== 'idle' || isFinished) return;

    const nextLevel = level + 1;

    if (mode === 'single') {
      // === 單人模式 ===
      if (isCorrect) {
        setActionState('p1_attack');
        setLevel(nextLevel);

        setTimeout(() => {
          setActionState('p2_hit');
          setCombo((prev) => prev + 1);
          setScore((prev) => prev + 20 + nextLevel * 5);
          setEnemyHp((prev) => {
            const nextHp = Math.max(0, prev - 10);
            if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
            return nextHp;
          });
        }, 250);

        setTimeout(() => {
          setActionState('idle');
          if (enemyHp > 10 && playerHp > 0) generateRound(nextLevel);
        }, 900);
      } else {
        setActionState('p2_attack');
        setTimeout(() => {
          setActionState('p1_hit');
          setCombo(0);
          setPlayerHp((prev) => {
            const nextHp = Math.max(0, prev - 20);
            if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
            return nextHp;
          });
        }, 250);

        setTimeout(() => {
          setActionState('idle');
          if (playerHp > 20 && enemyHp > 0) generateRound(level);
        }, 900);
      }
    } else {
      // === 雙人同時 PK 模式：答對扣對方 HP，答錯自扣 HP ===
      if (isCorrect) {
        setLevel(nextLevel);
        setActionState(player === 'p1' ? 'p1_attack' : 'p2_attack');

        setTimeout(() => {
          setActionState(player === 'p1' ? 'p2_hit' : 'p1_hit');
          if (player === 'p1') {
            setEnemyHp((prev) => {
              const nextHp = Math.max(0, prev - 10);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          } else {
            setPlayerHp((prev) => {
              const nextHp = Math.max(0, prev - 10);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          }
        }, 250);

        // 率先答對直接進下一題
        setTimeout(() => {
          setActionState('idle');
          if (playerHp > 0 && enemyHp > 0) generateRound(nextLevel);
        }, 900);
      } else {
        // 答錯自扣 20 HP
        setActionState(player === 'p1' ? 'p2_attack' : 'p1_attack');

        setTimeout(() => {
          setActionState(player === 'p1' ? 'p1_hit' : 'p2_hit');
          if (player === 'p1') {
            setPlayerHp((prev) => {
              const nextHp = Math.max(0, prev - 20);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          } else {
            setEnemyHp((prev) => {
              const nextHp = Math.max(0, prev - 20);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          }
        }, 250);

        setTimeout(() => {
          setActionState('idle');
        }, 900);
      }
    }
  };

  // P1 注水觸控邏輯
  const startPouringP1 = () => {
    if (isPouringP1Ref.current || actionState !== 'idle') return;
    isPouringP1Ref.current = true;
    const increment = currentRound.maxGauge === 1000 ? 5 : 1; 

    pourTimerP1Ref.current = setInterval(() => {
      setP1PourValue((prev) => Math.min(currentRound.maxGauge, prev + increment));
    }, 35);
  };

  const stopPouringP1 = () => {
    if (!isPouringP1Ref.current) return;
    isPouringP1Ref.current = false;
    clearInterval(pourTimerP1Ref.current);

    const margin = currentRound.maxGauge === 1000 ? 35 : 4;
    const diff = Math.abs(p1PourValue - currentRound.targetValue);
    const isCorrect = diff <= margin;
    handlePlayerAnswer('p1', isCorrect);
  };

  // P2 注水觸控邏輯
  const startPouringP2 = () => {
    if (isPouringP2Ref.current || actionState !== 'idle') return;
    isPouringP2Ref.current = true;
    const increment = currentRound.maxGauge === 1000 ? 5 : 1; 

    pourTimerP2Ref.current = setInterval(() => {
      setP2PourValue((prev) => Math.min(currentRound.maxGauge, prev + increment));
    }, 35);
  };

  const stopPouringP2 = () => {
    if (!isPouringP2Ref.current) return;
    isPouringP2Ref.current = false;
    clearInterval(pourTimerP2Ref.current);

    const margin = currentRound.maxGauge === 1000 ? 35 : 4;
    const diff = Math.abs(p2PourValue - currentRound.targetValue);
    const isCorrect = diff <= margin;
    handlePlayerAnswer('p2', isCorrect);
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染獨立注水刻度面板
  const renderPourControl = (player, pourValue, startPour, stopPour) => {
    const isP1 = player === 'p1';

    return (
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className={`font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🔵 Player 1 (上方選手)' : '🔴 Player 2 (下方選手)'}
          </span>
          <span className="text-base font-bold text-cyan-400">
            {pourValue} {currentRound.unit} <span className="text-xs text-slate-500">(上限 {currentRound.maxGauge}{currentRound.unit})</span>
          </span>
        </div>

        {/* 量筒刻度條 */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-10 rounded-xl border border-slate-700 relative overflow-hidden flex items-center p-1 shadow-inner">
            <div
              className={`h-full rounded-lg transition-all duration-75 ${
                isP1 ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-gradient-to-r from-rose-500 to-amber-400'
              }`}
              style={{ width: `${(pourValue / currentRound.maxGauge) * 100}%` }}
            />

            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none items-center">
              <div className="w-0.5 h-full bg-slate-700/80" style={{ left: '25%' }} />
              <div className="w-0.5 h-full bg-slate-500/80" style={{ left: '50%' }} />
              <div className="w-0.5 h-full bg-slate-700/80" style={{ left: '75%' }} />
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>0{currentRound.unit}</span>
            <span>{currentRound.maxGauge * 0.25}{currentRound.unit}</span>
            <span>{currentRound.maxGauge * 0.5}{currentRound.unit}</span>
            <span>{currentRound.maxGauge * 0.75}{currentRound.unit}</span>
            <span>{currentRound.maxGauge}{currentRound.unit}</span>
          </div>
        </div>

        {/* 注水壓鈕 */}
        <button
          onMouseDown={startPour}
          onMouseUp={stopPour}
          onTouchStart={startPour}
          onTouchEnd={stopPour}
          disabled={actionState !== 'idle'}
          className={`w-full py-3.5 text-white font-black text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 select-none touch-none cursor-pointer active:scale-98 ${
            isP1 
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110' 
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110'
          }`}
        >
          <Droplet className="w-4 h-4 fill-white animate-bounce" />
          {isP1 ? 'Player 1' : 'Player 2'} 按住注水 (對準刻度放開搶答)
        </button>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-5xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部資訊列 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 10F ({mode === 'pvp' ? '雙人同屏搶速 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🧪 10F 濃度擂台：水龍頭稀釋對對碰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">當前積分</p>
            <p className="text-base font-mono font-bold text-amber-400">{score} PTS</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">時間限制</p>
            {mode === 'single' ? (
              <p className={`text-sm font-mono font-bold ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`}>
                {timeLeft}s
              </p>
            ) : (
              <p className="text-sm font-mono font-bold text-emerald-400">∞ (雙人同屏搶答)</p>
            )}
          </div>
        </div>
      </div>

      {/* 對戰舞台 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative flex justify-between items-center min-h-[140px]">
          {/* P1 角色 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${actionState === 'p1_attack' ? 'translate-x-8 scale-110' : ''} ${actionState === 'p1_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p1_hit' && <span className="absolute -top-6 text-rose-500 font-black text-lg animate-bounce">-20 HP!</span>}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-indigo-400 bg-indigo-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">🧪</div>
              <span className="absolute -bottom-2 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                Player 1
              </span>
            </div>
            <div className="w-24 md:w-32 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-indigo-300">P1</span>
                <span className="text-rose-400">{playerHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-800 p-0.5">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${playerHp}%` }} />
              </div>
            </div>
          </div>

          <div className="z-10 text-center">
            <Swords className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <span className="text-xs font-black italic text-slate-500 uppercase tracking-widest mt-1 block">競技場對決</span>
            {combo > 1 && <p className="text-[10px] font-bold text-amber-400 animate-pulse mt-0.5">🔥 {combo} COMBO!</p>}
          </div>

          {/* P2 / 關主 角色 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${actionState === 'p2_attack' ? '-translate-x-8 scale-110' : ''} ${actionState === 'p2_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p2_hit' && <span className="absolute -top-6 text-amber-400 font-black text-lg animate-bounce">-10 HP!</span>}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-rose-500 bg-rose-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">💧</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 2' : '10F 關主'}
              </span>
            </div>
            <div className="w-24 md:w-32 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-rose-400">{mode === 'pvp' ? 'P2' : 'BOSS'}</span>
                <span className="text-rose-400">{enemyHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-800 p-0.5 dir-rtl">
                <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${enemyHp}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 題目與操作區域 */}
      {!isFinished && currentRound && (
        <div className="space-y-4">
          {/* 上方：Player 1 控制區 (僅在雙人 PK 顯示) */}
          {mode === 'pvp' && renderPourControl('p1', p1PourValue, startPouringP1, stopPouringP1)}

          {/* 中間公共題目卡片 */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5 text-center">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
              {currentRound.title}
            </span>
            <h3 className="text-sm md:text-base font-bold text-white mt-1">
              {currentRound.desc}
            </h3>
            <p className="text-xs text-amber-300 font-semibold">
              🎯 {currentRound.questionText}
            </p>
          </div>

          {/* 下方：單人 4 選 1 ｜ 雙人 Player 2 控制區 */}
          {mode === 'single' ? (
            <div className="grid grid-cols-2 gap-3">
              {currentRound.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePlayerAnswer('p1', idx === currentRound.correctIdx)}
                  disabled={actionState !== 'idle'}
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500 text-center font-mono font-bold text-base text-white hover:text-cyan-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {opt} {currentRound.unit}
                </button>
              ))}
            </div>
          ) : (
            renderPourControl('p2', p2PourValue, startPouringP2, stopPouringP2)
          )}
        </div>
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {mode === 'single'
                ? enemyHp === 0 ? '🎉 10F 濃度擂台突破成功！' : '⚔️ 擂台挑戰結束'
                : playerHp > enemyHp ? '🎉 Player 1 (上方) 獲勝！' : '🎉 Player 2 (下方) 獲勝！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? '成功擊倒對手！準許晉級更高樓層！' : '熟記 P% = 溶質 / 溶液，手算預估刻度就能輕鬆擊破！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">達到最高難度：</span>
              <span className="font-bold text-amber-400">Lvl.{level}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終戰力積分：</span>
              <span className="font-bold text-indigo-400">{score} PTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 剩餘 HP：</span>
              <span className="font-bold text-emerald-400">{playerHp}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P2 剩餘 HP：</span>
              <span className="font-bold text-rose-400">{enemyHp}%</span>
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