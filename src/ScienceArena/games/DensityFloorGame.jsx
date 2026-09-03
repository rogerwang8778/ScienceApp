import React, { useState, useEffect } from 'react';
import { Shield, Heart, Trophy, RefreshCw, ArrowUp, ArrowDown, Swords, User, Users } from 'lucide-react';

export default function DensityFloorGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100); // 單人：玩家HP ｜ 雙人：P1 HP
  const [enemyHp, setEnemyHp] = useState(100);  // 單人：關主HP ｜ 雙人：P2 HP
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60); 

  // 動畫動作狀態：'idle' | 'p1_attack' | 'p2_attack' | 'p1_hit' | 'p2_hit'
  const [actionState, setActionState] = useState('idle');
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // 液體資料庫
  const liquids = [
    { name: '酒精', density: 0.8, color: 'from-amber-500/20 to-yellow-600/30', border: 'border-amber-500', icon: '🧈' },
    { name: '純水', density: 1.0, color: 'from-blue-500/20 to-cyan-600/30', border: 'border-cyan-500', icon: '💧' },
    { name: '濃鹽水', density: 1.2, color: 'from-teal-500/20 to-emerald-600/30', border: 'border-emerald-500', icon: '🧂' },
    { name: '水銀 (汞)', density: 13.6, color: 'from-slate-400/20 to-slate-600/30', border: 'border-slate-400', icon: '🪙' }
  ];

  // 基礎物質範例池
  const baseMaterials = [
    { name: '保麗龍', M: 2, V: 10, density: 0.2 },
    { name: '松木塊', M: 12, V: 20, density: 0.6 },
    { name: '冰塊', M: 18, V: 20, density: 0.9 },
    { name: '塑膠塊', M: 22, V: 20, density: 1.1 },
    { name: '鋁塊', M: 54, V: 20, density: 2.7 },
    { name: '鐵塊', M: 158, V: 20, density: 7.9 },
    { name: '鉛塊', M: 226, V: 20, density: 11.3 },
    { name: '金塊', M: 386, V: 20, density: 19.3 }
  ];

  // 難度階梯式生成器
  const generateRound = (currentLevel = 1) => {
    const liquid = liquids[Math.floor(Math.random() * liquids.length)];
    const actionGoal = Math.random() > 0.5 ? 'float' : 'sink';

    let pool = [...baseMaterials];
    if (currentLevel >= 3) {
      pool.push(
        { name: '未知合金 A', M: 145, V: 150, density: 0.97 },
        { name: '未知合金 B', M: 210, V: 200, density: 1.05 },
        { name: '特殊樹脂', M: 115, V: 100, density: 1.15 }
      );
    }
    if (currentLevel >= 6) {
      pool.push(
        { name: '高純度礦石', M: 312, V: 400, density: 0.78 },
        { name: '複合金屬塊', M: 485, V: 400, density: 1.21 },
        { name: '重金屬樣品', M: 1340, V: 100, density: 13.4 }
      );
    }

    let correctCandidates = [];
    let wrongCandidates = [];

    pool.forEach((m) => {
      if (actionGoal === 'float' && m.density < liquid.density) {
        correctCandidates.push(m);
      } else if (actionGoal === 'sink' && m.density > liquid.density) {
        correctCandidates.push(m);
      } else {
        wrongCandidates.push(m);
      }
    });

    if (correctCandidates.length === 0 || wrongCandidates.length < 3) {
      return generateRound(currentLevel);
    }

    const correctMat = correctCandidates[Math.floor(Math.random() * correctCandidates.length)];
    const shuffledWrong = wrongCandidates.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctMat, ...shuffledWrong].sort(() => 0.5 - Math.random());

    setCurrentRound({
      liquid,
      actionGoal,
      options,
      correctAnswerIndex: options.findIndex((o) => o.name === correctMat.name)
    });
  };

  useEffect(() => {
    generateRound(1);
  }, []);

  // 單人模式計時器 (60 秒)
  useEffect(() => {
    let timer = null;
    if (mode === 'single' && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (mode === 'single' && timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, mode]);

  // 作答邏輯 (支援 P1 與 P2 獨立作答)
  const handlePlayerAnswer = (player, index) => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    const isCorrect = index === currentRound.correctAnswerIndex;
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
      // === 雙人同屏搶答 PK 模式 ===
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

        // 先答對者直接推進下一題
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

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染獨立作答面板模組
  const renderOptionPanel = (player) => {
    const isP1 = player === 'p1';

    return (
      <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🛡️ Player 1 (左側選手)' : '⚔️ Player 2 (右側選手)'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {currentRound.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handlePlayerAnswer(player, idx)}
              disabled={actionState !== 'idle'}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 ${
                isP1
                  ? 'bg-slate-900/90 hover:bg-indigo-600/20 border-slate-800 hover:border-indigo-500'
                  : 'bg-slate-900/90 hover:bg-rose-600/20 border-slate-800 hover:border-rose-500'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                    isP1 
                      ? 'bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white' 
                      : 'bg-slate-800 group-hover:bg-rose-600 text-slate-300 group-hover:text-white'
                  }`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="font-bold text-white text-xs">
                    {option.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pl-7">
                  M = <span className="text-amber-300">{option.M}g</span> ｜ V = <span className="text-cyan-300">{option.V}cm³</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold ${isP1 ? 'text-indigo-400' : 'text-rose-400'}`}>
                搶答 ➔
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部資訊 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 1F ({mode === 'pvp' ? '雙人同屏搶速 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            ⚔️ 1F 密度擂台：浮沉剋制戰
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
              <p className="text-sm font-mono font-bold text-emerald-400">
                ∞ (雙人同屏搶答)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 對戰角色視覺擂台 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative flex justify-between items-center min-h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-rose-600/10 rounded-2xl pointer-events-none" />

          {/* 左側：P1 角色 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${
            actionState === 'p1_attack' ? 'translate-x-8 scale-110' : ''
          } ${actionState === 'p1_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
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

          {/* 中央對決 VS */}
          <div className="z-10 text-center">
            <Swords className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <span className="text-xs font-black italic text-slate-500 uppercase tracking-widest mt-1 block">競技場對決</span>
            {combo > 1 && <p className="text-[10px] font-bold text-amber-400 animate-pulse mt-0.5">🔥 {combo} COMBO!</p>}
          </div>

          {/* 右側：P2 / 關主 角色 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${
            actionState === 'p2_attack' ? '-translate-x-8 scale-110' : ''
          } ${actionState === 'p2_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p2_hit' && <span className="absolute -top-6 text-amber-400 font-black text-lg animate-bounce">-10 HP!</span>}

            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-rose-500 bg-rose-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">🥊</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 2' : '1F 關主'}
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

      {/* 公共液體題目卡片 */}
      {!isFinished && currentRound && (
        <div className="space-y-3">
          <div className={`bg-gradient-to-r ${currentRound.liquid.color} border ${currentRound.liquid.border} p-3.5 rounded-2xl text-center space-y-1.5 relative overflow-hidden`}>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-950/60 border border-white/10 text-xs text-slate-300">
              <span className="text-base">{currentRound.liquid.icon}</span>
              對決液體：<strong className="text-white">{currentRound.liquid.name}</strong> 
              <span className="font-mono text-cyan-300">(密度 D = {currentRound.liquid.density} g/cm³)</span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm md:text-base font-black text-white flex items-center justify-center gap-2">
                {currentRound.actionGoal === 'float' ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-emerald-400 animate-bounce" />
                    選出能 <span className="text-emerald-400 underline decoration-wavy">浮在液面上</span> 的盾牌材質！
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
                    選出能 <span className="text-amber-400 underline decoration-wavy">沉入液體底</span> 的砲彈材質！
                  </>
                )}
              </h3>
            </div>
          </div>

          {/* 雙人模式：左右兩邊同屏獨立作答區 ｜ 單人模式：中央選單 */}
          {mode === 'pvp' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* 左側：Player 1 */}
              {renderOptionPanel('p1')}
              {/* 右側：Player 2 */}
              {renderOptionPanel('p2')}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {renderOptionPanel('p1')}
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
                ? enemyHp === 0 ? '🎉 1F 擂台 KO 突破成功！' : '⚔️ 擂台對戰結束'
                : playerHp > enemyHp ? '🎉 Player 1 (左側) 搶速勝出！' : '🎉 Player 2 (右側) 搶速勝出！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? '擊敗對手！準許晉級天空競技場更高樓層！' : '手算預估 M/V 密度就能輕鬆破招！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最高突破難度：</span>
              <span className="font-bold text-amber-400">Lvl.{level}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終得分 PTS：</span>
              <span className="font-bold text-indigo-400">{score}</span>
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