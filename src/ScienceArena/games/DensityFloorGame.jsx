import React, { useState, useEffect } from 'react';
import { Shield, Heart, Trophy, RefreshCw, ArrowUp, ArrowDown, Sparkles, Swords } from 'lucide-react';

export default function DensityFloorGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // 動畫動作狀態：'idle' | 'player_attack' | 'enemy_attack' | 'player_hit' | 'enemy_hit'
  const [actionState, setActionState] = useState('idle');
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // 液體資料庫
  const liquids = [
    { name: '沙拉油', density: 0.8, color: 'from-amber-500/20 to-yellow-600/30', border: 'border-amber-500', icon: '🧈' },
    { name: '純水', density: 1.0, color: 'from-blue-500/20 to-cyan-600/30', border: 'border-cyan-500', icon: '💧' },
    { name: '濃鹽水', density: 1.2, color: 'from-teal-500/20 to-emerald-600/30', border: 'border-emerald-500', icon: '🧂' },
    { name: '水銀 (汞)', density: 13.6, color: 'from-slate-400/20 to-slate-600/30', border: 'border-slate-400', icon: '🪙' }
  ];

  // 物質範例池
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

  // 生成回合
  const generateRound = () => {
    const liquid = liquids[Math.floor(Math.random() * liquids.length)];
    const actionGoal = Math.random() > 0.5 ? 'float' : 'sink';

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

    if (correctCandidates.length === 0 || wrongCandidates.length < 3) {
      return generateRound();
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
    generateRound();
  }, []);

  // 計時器
  useEffect(() => {
    let timer = null;
    if (!isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  // 作答並引發角色動作動畫
  const handleAnswer = (index) => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    if (index === currentRound.correctAnswerIndex) {
      // 玩家發動攻擊 -> 敵人受擊
      setActionState('player_attack');
      setTimeout(() => {
        setActionState('enemy_hit');
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + 20 + combo * 5);
        setEnemyHp((prev) => {
          const nextHp = Math.max(0, prev - 25);
          if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
          return nextHp;
        });
      }, 250);
    } else {
      // 敵人發動攻擊 -> 玩家受擊
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

    // 重置動作並進下一題
    setTimeout(() => {
      setActionState('idle');
      if (enemyHp > 25 && playerHp > 20) {
        generateRound();
      }
    }, 900);
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

      {/* 2. 對戰角色視覺擂台舞台 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex justify-between items-center min-h-[220px]">
          {/* 雷射對決背景效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-rose-600/10 rounded-3xl pointer-events-none" />

          {/* === 左側：玩家角色 (Player) === */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${
            actionState === 'player_attack' ? 'translate-x-12 scale-110' : ''
          } ${actionState === 'player_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
            
            {/* 受擊飄字 */}
            {actionState === 'player_hit' && (
              <span className="absolute -top-8 text-rose-500 font-black text-xl animate-bounce">
                -20 HP!
              </span>
            )}

            {/* 玩家 SVG 角色外觀 */}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-indigo-600/20 border-2 border-indigo-400 flex items-center justify-center relative shadow-lg shadow-indigo-500/20 ${
              actionState === 'player_hit' ? 'bg-rose-600/30 border-rose-500' : ''
            }`}>
              <div className="text-4xl md:text-5xl">🛡️</div>
              <span className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                挑戰者
              </span>
            </div>

            {/* 血條 */}
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

          {/* 中央對決 VS 標誌 */}
          <div className="z-10 text-center">
            <span className="text-2xl md:text-3xl font-black italic text-slate-700 tracking-widest">
              VS
            </span>
            {combo > 1 && (
              <p className="text-xs font-bold text-amber-400 animate-pulse mt-1">
                🔥 {combo} COMBO!
              </p>
            )}
          </div>

          {/* === 右側：1F 關主角色 (Floor Master) === */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${
            actionState === 'enemy_attack' ? '-translate-x-12 scale-110' : ''
          } ${actionState === 'enemy_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            
            {/* 受擊飄字 */}
            {actionState === 'enemy_hit' && (
              <span className="absolute -top-8 text-amber-400 font-black text-xl animate-bounce">
                -25 HP!
              </span>
            )}

            {/* 關主 SVG 角色外觀 */}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center relative shadow-lg shadow-rose-500/20 ${
              actionState === 'enemy_hit' ? 'bg-amber-600/30 border-amber-500' : ''
            }`}>
              <div className="text-4xl md:text-5xl">🥊</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                1F 關主
              </span>
            </div>

            {/* 血條 */}
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

      {/* 3. 液體陷阱攻防題幹 */}
      {!isFinished && currentRound && (
        <div className="space-y-4">
          <div className={`bg-gradient-to-r ${currentRound.liquid.color} border ${currentRound.liquid.border} p-5 rounded-2xl text-center space-y-2 relative overflow-hidden`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 border border-white/10 text-xs text-slate-300">
              <span className="text-lg">{currentRound.liquid.icon}</span>
              對手投擲液體陷阱：<strong className="text-white">{currentRound.liquid.name}</strong> 
              <span className="font-mono text-cyan-300">(密度 D = {currentRound.liquid.density} g/cm³)</span>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-slate-400">防禦攻防指令：</p>
              <h3 className="text-base md:text-lg font-black text-white flex items-center justify-center gap-2">
                {currentRound.actionGoal === 'float' ? (
                  <>
                    <ArrowUp className="w-5 h-5 text-emerald-400 animate-bounce" />
                    選出能 <span className="text-emerald-400 underline decoration-wavy">浮在液面上</span> 的盾牌材質！
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-5 h-5 text-amber-400 animate-bounce" />
                    選出能 <span className="text-amber-400 underline decoration-wavy">沉入液體底</span> 的砲彈材質！
                  </>
                )}
              </h3>
            </div>
          </div>

          {/* 4. 四個物體選項 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRound.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={actionState !== 'idle'}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
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

      {/* 5. 結算畫面 */}
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