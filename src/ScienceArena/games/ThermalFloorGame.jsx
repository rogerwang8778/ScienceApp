import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Zap, Flame, Timer, Swords, Thermometer, OctagonX } from 'lucide-react';

export default function ThermalFloorGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100); // 單人：玩家HP ｜ 雙人：P1 HP
  const [enemyHp, setEnemyHp] = useState(100);  // 單人：關主HP ｜ 雙人：P2 HP
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60); 

  // 狀態與計時
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'p1_attack' | 'p2_attack' | 'p1_hit' | 'p2_hit'
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(Date.now()); 
  const [critTimerLeft, setCritTimerLeft] = useState(5.0); // 5 秒爆擊倒數
  const [isCritical, setIsCritical] = useState(false);               

  // P1 與 P2 游標動態位置 (0% ~ 100%)
  const [p1CursorPos, setP1CursorPos] = useState(0);
  const [p2CursorPos, setP2CursorPos] = useState(0);

  // 游標滑動動畫控制
  const animFrameRef = useRef(null);
  const p1DirRef = useRef(1); // 1 為向右，-1 為向左
  const p2DirRef = useRef(-1);

  const resetSelections = () => {
    setIsCritical(false);
    setRoundStartTime(Date.now());
    setCritTimerLeft(5.0);
  };

  // 5 秒暴擊倒數計時器
  useEffect(() => {
    let interval = null;
    if (!isFinished && actionState === 'idle' && currentRound) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - roundStartTime) / 1000;
        const remaining = Math.max(0, 5.0 - elapsed);
        setCritTimerLeft(remaining);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [roundStartTime, actionState, isFinished, currentRound]);

  // 生成熱平衡題目 (支援難度遞增)
  const generateRound = (currentLevel = 1) => {
    const qType = Math.random() > 0.5 ? 'typeA' : 'typeB';
    let roundData = {};

    if (qType === 'typeA') {
      // 類型 A: 給定熱水 (M1, T1)、冷水 (M2, T2)，推算平衡溫度 T
      let M1 = 100 + Math.floor(Math.random() * 4) * 50; // 100g ~ 250g
      let T1 = 70 + Math.floor(Math.random() * 5) * 5;   // 70°C ~ 90°C
      let M2 = 100 + Math.floor(Math.random() * 4) * 50; // 100g ~ 250g
      let T2 = 10 + Math.floor(Math.random() * 5) * 5;   // 10°C ~ 30°C

      if (currentLevel >= 4) {
        M1 = 120 + Math.floor(Math.random() * 6) * 30;
        M2 = 150 + Math.floor(Math.random() * 6) * 20;
      }

      // 平衡溫度計算: M1*(T1 - T) = M2*(T - T2) => T = (M1*T1 + M2*T2) / (M1 + M2)
      const targetTemp = Math.round((M1 * T1 + M2 * T2) / (M1 + M2));

      roundData = {
        qType: 'typeA',
        title: '🔥 熱平衡溫度預估',
        desc: `【熱水】${M1}g，${T1}°C ｜ 【冷水】${M2}g，${T2}°C`,
        prompt: `兩水混合（不計熱量散失），請在游標滑至【平衡溫度 (°C)】時按下鎖定！`,
        targetValue: targetTemp,
        minRange: 0,
        maxRange: 100,
        unit: '°C'
      };
    } else {
      // 類型 B: 給定熱水溫度 T1、冷水溫度 T2 與目標平衡溫度 T，推算熱水質量比例 (%)
      let T1 = 80;
      let T2 = 20;
      // 隨機產生一個整數比例 M1 : M2 (例如 1:1, 1:2, 2:1, 1:3, 3:1)
      const ratioPairs = [[1,1], [1,2], [2,1], [1,3], [3,1], [2,3], [3,2]];
      const pair = ratioPairs[Math.floor(Math.random() * ratioPairs.length)];
      const M1 = pair[0];
      const M2 = pair[1];

      const targetTemp = Math.round((M1 * T1 + M2 * T2) / (M1 + M2));
      // 熱水質量比例 = M1 / (M1 + M2) * 100%
      const hotWaterRatio = Math.round((M1 / (M1 + M2)) * 100);

      roundData = {
        qType: 'typeB',
        title: '🧪 混合質量比例估計',
        desc: `【熱水】${T1}°C ｜ 【冷水】${T2}°C ➔ 【目標平衡溫度】${targetTemp}°C`,
        prompt: `為達成目標溫度，請在游標滑至正確【熱水質量百分比 (%)】時按下鎖定！`,
        targetValue: hotWaterRatio,
        minRange: 0,
        maxRange: 100,
        unit: '%'
      };
    }

    setCurrentRound(roundData);
    resetSelections();
  };

  useEffect(() => {
    generateRound(1);
  }, []);

  // 游標來回滑動 RAF 動畫迴圈
  useEffect(() => {
    let lastTime = performance.now();
    const speed = 0.08 + level * 0.005; // 隨關卡推進稍微加快滑動速率

    const updateCursors = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      if (actionState === 'idle' && !isFinished) {
        // P1 游標更新
        setP1CursorPos((prev) => {
          let next = prev + p1DirRef.current * speed * delta;
          if (next >= 100) { next = 100; p1DirRef.current = -1; }
          if (next <= 0) { next = 0; p1DirRef.current = 1; }
          return next;
        });

        // P2 游標更新
        setP2CursorPos((prev) => {
          let next = prev + p2DirRef.current * speed * delta;
          if (next >= 100) { next = 100; p2DirRef.current = -1; }
          if (next <= 0) { next = 0; p2DirRef.current = 1; }
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(updateCursors);
    };

    animFrameRef.current = requestAnimationFrame(updateCursors);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [actionState, isFinished, level]);

  // 單人倒數計時 (60秒)
  useEffect(() => {
    let timer = null;
    if (mode === 'single' && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (mode === 'single' && timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, mode]);

  // 作答觸發判定 (鎖定按鈕按下)
  const handlePlayerStop = (player) => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    const answerTime = (Date.now() - roundStartTime) / 1000;
    const criticalHit = answerTime <= 5.0; // 5 秒速答判定

    // 取得按下時游標的值
    const currentPos = player === 'p1' ? Math.round(p1CursorPos) : Math.round(p2CursorPos);
    const target = currentRound.targetValue;

    // 判斷是否落入容錯區間 (±5 的刻度內算精準命中)
    const margin = 5;
    const isCorrect = Math.abs(currentPos - target) <= margin;
    const nextLevel = level + 1;

    if (mode === 'single') {
      // === 單人模式 ===
      if (isCorrect) {
        setIsCritical(criticalHit);
        const damage = criticalHit ? 20 : 10;
        setActionState('p1_attack');

        setTimeout(() => {
          setActionState('p2_hit');
          setCombo((prev) => prev + 1);
          setScore((prev) => prev + (criticalHit ? 50 : 30));
          setEnemyHp((prev) => {
            const nextHp = Math.max(0, prev - damage);
            if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
            return nextHp;
          });
        }, 250);

        setTimeout(() => {
          setActionState('idle');
          if (enemyHp > 10 && playerHp > 0) generateRound(nextLevel);
        }, 1100);
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
        }, 1100);
      }
    } else {
      // === 雙人搶答 PK 模式 ===
      if (isCorrect) {
        setIsCritical(criticalHit);
        const damage = criticalHit ? 20 : 10;

        setActionState(player === 'p1' ? 'p1_attack' : 'p2_attack');

        setTimeout(() => {
          setActionState(player === 'p1' ? 'p2_hit' : 'p1_hit');
          if (player === 'p1') {
            setEnemyHp((prev) => {
              const nextHp = Math.max(0, prev - damage);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          } else {
            setPlayerHp((prev) => {
              const nextHp = Math.max(0, prev - damage);
              if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          }
        }, 250);

        // 先鎖定且答對者推進下一題
        setTimeout(() => {
          setActionState('idle');
          if (playerHp > 0 && enemyHp > 0) generateRound(nextLevel);
        }, 1100);
      } else {
        // 鎖定錯誤自扣 20 HP
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

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染獨立游標控制面板
  const renderTimingControlPanel = (player, cursorPos) => {
    const isP1 = player === 'p1';

    return (
      <div className={`p-4 rounded-2xl border space-y-3 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className={`font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🛡️ Player 1 (左側選手)' : '⚔️ Player 2 (右側選手)'}
          </span>
          <span className="text-base font-bold text-amber-400 font-mono">
            當前鎖定值：{Math.round(cursorPos)} {currentRound.unit}
          </span>
        </div>

        {/* 來回滑動刻度軸 */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-10 rounded-xl border border-slate-700 relative overflow-hidden flex items-center p-1 shadow-inner">
            {/* 答案正確區域背景視覺提示 (選填: 讓對決更有動態感) */}
            <div
              className="absolute h-full bg-emerald-500/20 border-x border-emerald-400/50"
              style={{
                left: `${Math.max(0, currentRound.targetValue - 5)}%`,
                width: '10%'
              }}
            />

            {/* 來回滑動的游標 */}
            <div
              className={`absolute top-0 bottom-0 w-3 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] transition-none ${
                isP1 ? 'bg-gradient-to-b from-indigo-400 to-cyan-300' : 'bg-gradient-to-b from-rose-400 to-amber-300'
              }`}
              style={{ left: `calc(${cursorPos}% - 6px)` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>0{currentRound.unit}</span>
            <span>25{currentRound.unit}</span>
            <span>50{currentRound.unit}</span>
            <span>75{currentRound.unit}</span>
            <span>100{currentRound.unit}</span>
          </div>
        </div>

        {/* 鎖定停止按鈕 */}
        <button
          onClick={() => handlePlayerStop(player)}
          disabled={actionState !== 'idle'}
          className={`w-full py-3.5 text-white font-black text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            isP1 
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110' 
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110'
          }`}
        >
          <OctagonX className="w-5 h-5 fill-white animate-pulse" />
          {isP1 ? 'P1 🛑 瞄準按下 STOP！' : 'P2 🛑 瞄準按下 STOP！'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部資訊標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 40F ({mode === 'pvp' ? '雙人同屏搶速 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🔥 40F 熱學擂台：熱平衡調溫之劍
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

      {/* 對戰角色擂台血條 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative flex justify-between items-center min-h-[140px]">
          {isCritical && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 font-black text-xs px-3 py-0.5 rounded-full shadow-xl border-2 border-amber-300 animate-bounce flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current text-rose-600" /> ⚡ 5秒速答雙倍暴擊 (-20 HP)
            </div>
          )}

          {/* P1 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${actionState === 'p1_attack' ? 'translate-x-8 scale-110' : ''} ${actionState === 'p1_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p1_hit' && <span className="absolute -top-6 text-rose-500 font-black text-lg animate-bounce">-20 HP!</span>}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-indigo-400 bg-indigo-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">🛡️</div>
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

          {/* P2 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${actionState === 'p2_attack' ? '-translate-x-8 scale-110' : ''} ${actionState === 'p2_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p2_hit' && <span className="absolute -top-6 text-amber-400 font-black text-lg animate-bounce">-10 HP!</span>}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-rose-500 bg-rose-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">🌡️</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 2' : '40F 關主'}
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

      {/* 5 秒暴擊倒數動態條與公共題目卡片 */}
      {!isFinished && currentRound && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl space-y-1 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-bold px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                {critTimerLeft > 0 ? '⚡ 5秒速答暴擊區：' : '⏱️ 暴擊超時：'}
              </span>
              <span className={`font-mono text-xs font-black ${critTimerLeft > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                {critTimerLeft > 0 ? `${critTimerLeft.toFixed(1)}s (雙倍 20 HP)` : '普攻模式 (10 HP)'}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-800 p-0.5 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  critTimerLeft > 0 ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400' : 'bg-slate-700 opacity-40'
                }`}
                style={{ width: `${(critTimerLeft / 5.0) * 100}%` }}
              />
            </div>
          </div>

          {/* 公共題目區域 */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
              {currentRound.title}
            </span>
            <h3 className="text-sm md:text-base font-bold text-white mt-1">
              {currentRound.desc}
            </h3>
            <p className="text-xs text-amber-300 font-semibold">
              🎯 {currentRound.prompt}
            </p>
          </div>

          {/* 雙人模式：左右兩邊同屏獨立游標控制區 ｜ 單人模式：中央游標控制區 */}
          {mode === 'pvp' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* 左側：Player 1 */}
              {renderTimingControlPanel('p1', p1CursorPos)}
              {/* 右側：Player 2 */}
              {renderTimingControlPanel('p2', p2CursorPos)}
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {renderTimingControlPanel('p1', p1CursorPos)}
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
              {mode === 'single'
                ? enemyHp === 0 ? '🎉 40F 熱學擂台 KO 突破成功！' : '⚔️ 擂台對戰結束'
                : playerHp > enemyHp ? '🎉 Player 1 (左側) 搶速勝出！' : '🎉 Player 2 (右側) 搶速勝出！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              雙人對決結束！熱平衡計算精準度與鎖定時機抓得非常完美！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">當前挑戰難度：</span>
              <span className="font-bold text-amber-400">Lvl.{level}</span>
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
            <RefreshCw className="w-4 h-4" /> 返回擂台大廳
          </button>
        </div>
      )}
    </div>
  );
}