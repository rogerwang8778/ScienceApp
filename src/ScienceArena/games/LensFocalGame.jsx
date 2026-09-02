import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ArrowRight, ArrowLeft, Shield, Heart, Sparkles, Zap } from 'lucide-react';

export default function LensFocalGame({ mode = 'single', onGameOver }) {
  // 遊戲血條與狀態
  const [playerHp, setPlayerHp] = useState(100); // P1 / 單人玩家 HP
  const [enemyHp, setEnemyHp] = useState(100);  // Boss / P2 HP
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);

  // 雙人模式交替回合控制 ('p1' | 'p2')
  const [currentPlayer, setCurrentPlayer] = useState('p1');

  // 動畫動作狀態：'idle' | 'player_attack' | 'enemy_attack' | 'player_hit' | 'enemy_hit'
  const [actionState, setActionState] = useState('idle');
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // ==========================================
  // 1. 動態題庫生成器 (包含 Lvl 1 ~ Lvl 3 遞進)
  // ==========================================
  const generateRound = (currentLevel = 1) => {
    // Lvl 3 開啟凹透鏡干擾
    const isConcave = currentLevel >= 3 && Math.random() > 0.6;
    const lensType = isConcave ? 'concave' : 'convex';

    // 凸透鏡經典 5 大位置：'2f_out' | '2f_on' | 'f_2f' | 'f_on' | 'f_in'
    // 凹透鏡：任何位置皆為【正立、縮小、虛像，位於同側 f 內】
    const positions = ['2f_out', '2f_on', 'f_2f', 'f_on', 'f_in'];
    const selectedPos = positions[Math.floor(Math.random() * positions.length)];

    let qCategory = 'basic'; // 'basic' | 'reverse' | 'trend'

    if (currentLevel === 2) {
      qCategory = Math.random() > 0.5 ? 'reverse' : 'trend';
    } else if (currentLevel >= 3) {
      const rand = Math.random();
      if (rand < 0.4) qCategory = 'basic';
      else if (rand < 0.7) qCategory = 'reverse';
      else qCategory = 'trend';
    }

    let questionData = {};

    if (lensType === 'concave') {
      // 凹透鏡題型 (必為 正立 縮小 虛像，同側 f 內)
      questionData = {
        lensType: 'concave',
        pos: selectedPos,
        posLabel: '任意位置',
        prompt: '【凹透鏡】蠟燭置於透鏡前方，其成像性質與位置為何？',
        correctAns: '正立、縮小、虛像 (透鏡同側 f 內)',
        options: [
          '正立、縮小、虛像 (透鏡同側 f 內)',
          '倒立、縮小、實像 (異側 f~2f 之間)',
          '正立、放大、虛像 (透鏡同側 2f 外)',
          '倒立、放大、實像 (異側 2f 外)'
        ].sort(() => 0.5 - Math.random())
      };
    } else {
      // 凸透鏡題型
      if (qCategory === 'basic') {
        // Lvl 1: 基本區塊判斷
        let posLabel = '';
        let correctAns = '';
        let wrongOptions = [];

        switch (selectedPos) {
          case '2f_out':
            posLabel = '物體在 2f 外';
            correctAns = '倒立、縮小、實像 (像在 f~2f 之間)';
            wrongOptions = [
              '倒立、放大、實像 (像在 2f 外)',
              '倒立、相等、實像 (像在 2f 上)',
              '正立、放大、虛像 (像在同側)'
            ];
            break;
          case '2f_on':
            posLabel = '物體在 2f 上';
            correctAns = '倒立、相等、實像 (像在 2f 上)';
            wrongOptions = [
              '倒立、縮小、實像 (像在 f~2f 之間)',
              '倒立、放大、實像 (像在 2f 外)',
              '不成像 (光線平行射出)'
            ];
            break;
          case 'f_2f':
            posLabel = '物體在 f ~ 2f 之間';
            correctAns = '倒立、放大、實像 (像在 2f 外)';
            wrongOptions = [
              '倒立、縮小、實像 (像在 f~2f 之間)',
              '正立、放大、虛像 (像在同側)',
              '倒立、相等、實像 (像在 2f 上)'
            ];
            break;
          case 'f_on':
            posLabel = '物體在 f 上 (焦點)';
            correctAns = '不成像 (折射光線平行不相交)';
            wrongOptions = [
              '倒立、放大、實像 (像在 2f 外)',
              '正立、放大、虛像 (像在同側)',
              '倒立、縮小、實像 (像在 f 上)'
            ];
            break;
          case 'f_in':
            posLabel = '物體在 f 內 (焦點內)';
            correctAns = '正立、放大、虛像 (像在同側)';
            wrongOptions = [
              '倒立、放大、實像 (像在 2f 外)',
              '正立、縮小、虛像 (像在同側)',
              '不成像 (折射光線平行)'
            ];
            break;
          default:
            break;
        }

        questionData = {
          lensType: 'convex',
          pos: selectedPos,
          posLabel,
          prompt: `【凸透鏡】當蠟燭擺放在【${posLabel}】時，成像性質與位置為何？`,
          correctAns,
          options: [correctAns, ...wrongOptions].sort(() => 0.5 - Math.random())
        };

      } else if (qCategory === 'reverse') {
        // Lvl 2: 反推題型 (給像反問物體位置)
        const targetTarget = Math.random() > 0.5 ? '放大實像' : '縮小實像';
        const correctAns = targetTarget === '放大實像' ? '物體擺在 f ~ 2f 之間' : '物體擺在 2f 外';
        const wrongOptions = targetTarget === '放大實像' 
          ? ['物體擺在 2f 外', '物體擺在 f 內', '物體擺在 2f 上']
          : ['物體擺在 f ~ 2f 之間', '物體擺在 f 內', '物體擺在 2f 上'];

        questionData = {
          lensType: 'convex',
          pos: targetTarget === '放大實像' ? 'f_2f' : '2f_out',
          posLabel: '像的性質題',
          prompt: `【凸透鏡】若要在紙屏上獲得一個【${targetTarget}】，蠟燭應該擺放在哪裡？`,
          correctAns,
          options: [correctAns, ...wrongOptions].sort(() => 0.5 - Math.random())
        };

      } else {
        // Lvl 2: 趨勢題 (蠟燭漸靠近透鏡)
        const isApproaching = Math.random() > 0.5;
        const prompt = isApproaching 
          ? '【凸透鏡】當蠟燭從 2f 外「漸漸靠近焦點 f」的過程中，紙屏上的像如何變化？'
          : '【凸透鏡】當蠟燭從 f~2f 之間「漸漸遠離透鏡」時，紙屏上的像如何變化？';
        
        const correctAns = isApproaching
          ? '像漸漸變大，且距離透鏡漸漸變遠'
          : '像漸漸變小，且距離透鏡漸漸變近';

        const wrongOptions = isApproaching
          ? ['像漸漸變小，且距離透鏡漸漸變近', '像大小不變，距離漸漸變遠', '像漸漸變大，但距離漸漸變近']
          : ['像漸漸變大，且距離透鏡漸漸變遠', '像大小不變，距離漸漸變近', '像漸漸變小，但距離漸漸變遠'];

        questionData = {
          lensType: 'convex',
          pos: 'f_2f',
          posLabel: '趨勢變化題',
          prompt,
          correctAns,
          options: [correctAns, ...wrongOptions].sort(() => 0.5 - Math.random())
        };
      }
    }

    setCurrentRound(questionData);
  };

  useEffect(() => {
    generateRound(1);
  }, []);

  // 計時器 (單人模式 60 秒)
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
  // 2. 作答處理 (答對扣 10 HP，難度隨 Lvl 提升)
  // ==========================================
  const handleAnswer = (selectedAns) => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    const isCorrect = selectedAns === currentRound.correctAns;
    const nextLevel = level + 1;

    if (mode === 'single') {
      if (isCorrect) {
        setActionState('player_attack');
        setLevel(nextLevel);

        setTimeout(() => {
          setActionState('enemy_hit');
          setCombo((prev) => prev + 1);
          setScore((prev) => prev + 25 + nextLevel * 5);
          setEnemyHp((prev) => {
            const nextHp = Math.max(0, prev - 10); // 答對扣關主 10 HP (需答對 10 題)
            if (nextHp === 0) setTimeout(() => setIsFinished(true), 600);
            return nextHp;
          });
        }, 250);

        setTimeout(() => {
          setActionState('idle');
          if (enemyHp > 10 && playerHp > 0) generateRound(nextLevel);
        }, 900);
      } else {
        setActionState('enemy_attack');
        setTimeout(() => {
          setActionState('player_hit');
          setCombo(0);
          setPlayerHp((prev) => {
            const nextHp = Math.max(0, prev - 20); // 答錯自扣 20 HP
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
      // === 雙人 PK 交替回合制 ===
      const isP1 = currentPlayer === 'p1';

      if (isCorrect) {
        setLevel(nextLevel);
        setActionState(isP1 ? 'player_attack' : 'enemy_attack');

        setTimeout(() => {
          setActionState(isP1 ? 'enemy_hit' : 'player_hit');
          if (isP1) {
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
      } else {
        setActionState(isP1 ? 'enemy_attack' : 'player_attack');

        setTimeout(() => {
          setActionState(isP1 ? 'player_hit' : 'enemy_hit');
          if (isP1) {
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
      }

      setTimeout(() => {
        setActionState('idle');
        setCurrentPlayer(isP1 ? 'p2' : 'p1');
        if (playerHp > 10 && enemyHp > 10) generateRound(nextLevel);
      }, 900);
    }
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  // ==========================================
  // 3. SVG 擬真透鏡光學主軸畫布 (動態顯示物體位置)
  // ==========================================
  const renderOpticsCanvas = () => {
    if (!currentRound) return null;

    const width = 360;
    const height = 110;
    const centerY = 55;
    const lensX = 180; // 透鏡位置 (中央)

    // 焦點 f = 50px, 兩倍焦距 2f = 100px
    const f1 = lensX - 50;
    const f2 = lensX - 100;
    const f1_right = lensX + 50;
    const f2_right = lensX + 100;

    // 根據題目 pos 換算蠟燭 X 座標
    let candleX = f2 - 30; // 預設 2f 外
    if (currentRound.pos === '2f_on') candleX = f2;
    else if (currentRound.pos === 'f_2f') candleX = (f1 + f2) / 2;
    else if (currentRound.pos === 'f_on') candleX = f1;
    else if (currentRound.pos === 'f_in') candleX = f1 + 25;

    return (
      <div className="relative w-full flex justify-center items-center py-2 overflow-hidden bg-slate-950/80 rounded-2xl border border-slate-800">
        <svg width={width} height={height} className="overflow-visible">
          {/* 主光軸 */}
          <line x1="10" y1={centerY} x2={width - 10} y2={centerY} stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />

          {/* 焦點刻度標示 */}
          <g fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
            <line x1={f2} y1={centerY - 6} x2={f2} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f2} y={centerY + 20}>2F</text>

            <line x1={f1} y1={centerY - 6} x2={f1} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f1} y={centerY + 20}>F</text>

            <line x1={f1_right} y1={centerY - 6} x2={f1_right} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f1_right} y={centerY + 20}>F</text>

            <line x1={f2_right} y1={centerY - 6} x2={f2_right} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f2_right} y={centerY + 20}>2F</text>
          </g>

          {/* 中央透鏡：凸透鏡 (雙凸弧線) vs 凹透鏡 (內凹弧線) */}
          {currentRound.lensType === 'convex' ? (
            <path
              d={`M ${lensX} ${centerY - 45} Q ${lensX + 18} ${centerY}, ${lensX} ${centerY + 45} Q ${lensX - 18} ${centerY}, ${lensX} ${centerY - 45}`}
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
          ) : (
            <path
              d={`M ${lensX - 12} ${centerY - 45} Q ${lensX} ${centerY}, ${lensX - 12} ${centerY + 45} L ${lensX + 12} ${centerY + 45} Q ${lensX} ${centerY}, ${lensX + 12} ${centerY - 45} Z`}
              fill="rgba(244, 63, 94, 0.25)"
              stroke="#f43f5e"
              strokeWidth="2.5"
            />
          )}

          {/* 蠟燭 (物體) */}
          <g transform={`translate(${candleX}, ${centerY})`}>
            {/* 火焰 */}
            <circle cx="0" cy="-28" r="4" fill="#fbbf24" className="animate-ping opacity-75" />
            <circle cx="0" cy="-28" r="3" fill="#f97316" />
            {/* 燭身 */}
            <rect x="-3" y="-22" width="6" height="22" fill="#e2e8f0" rx="1" />
            <text x="0" y="15" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">🕯️ 物體</text>
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none overflow-hidden">
      {/* 頂部資訊標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 30F ({mode === 'pvp' ? '雙人輪流 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
            </span>
            {mode === 'pvp' && (
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                currentPlayer === 'p1' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                👉 當前攻擊：{currentPlayer === 'p1' ? 'Player 1' : 'Player 2'}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 flex items-center gap-2">
            🔍 30F 光學擂台：透鏡焦點戰
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

      {/* 對戰角色擂台 */}
      {!isFinished && currentRound && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex justify-between items-center min-h-[200px]">
          {/* P1 / 挑戰者 */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${actionState === 'player_attack' ? 'translate-x-12 scale-110' : ''} ${actionState === 'player_hit' ? '-translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'player_hit' && <span className="absolute -top-8 text-rose-500 font-black text-xl animate-bounce">-20 HP!</span>}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center relative shadow-lg ${
              mode === 'pvp' && currentPlayer === 'p1' ? 'border-amber-400 bg-indigo-600/30 ring-4 ring-amber-400/30' : 'border-indigo-400 bg-indigo-600/20'
            }`}>
              <div className="text-4xl md:text-5xl">🛡️</div>
              <span className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 1' : '挑戰者'}
              </span>
            </div>
            <div className="w-28 md:w-36 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-indigo-300">{mode === 'pvp' ? 'P1' : 'YOU'}</span>
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

          {/* P2 / 關主 */}
          <div className={`flex flex-col items-center gap-2 z-10 transition-all duration-300 ${actionState === 'enemy_attack' ? '-translate-x-12 scale-110' : ''} ${actionState === 'enemy_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'enemy_hit' && <span className="absolute -top-8 text-amber-400 font-black text-xl animate-bounce">-10 HP!</span>}
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center relative shadow-lg ${
              mode === 'pvp' && currentPlayer === 'p2' ? 'border-amber-400 bg-rose-600/30 ring-4 ring-amber-400/30' : 'border-rose-500 bg-rose-600/20'
            }`}>
              <div className="text-4xl md:text-5xl">🔬</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 2' : '30F 關主'}
              </span>
            </div>
            <div className="w-28 md:w-36 space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-rose-400">{mode === 'pvp' ? 'P2' : 'BOSS'}</span>
                <span className="text-rose-400">{enemyHp} HP</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-800 p-0.5 dir-rtl">
                <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${enemyHp}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 題目與光學畫布區 */}
      {!isFinished && currentRound && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-3">
            {/* SVG 光學路徑示意的視覺輔助 */}
            {renderOpticsCanvas()}

            <h3 className="text-base md:text-lg font-black text-white mt-2">
              {currentRound.prompt}
            </h3>
          </div>

          {/* 成像組合卡牌 (大按鈕選項) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRound.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={actionState !== 'idle'}
                className="p-4 rounded-2xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center text-xs font-mono font-bold">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span className="font-bold text-white text-sm group-hover:text-indigo-300">
                    {option}
                  </span>
                </div>

                <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  選擇 ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {mode === 'single'
                ? enemyHp === 0 ? '🎉 30F 透鏡擂台 KO 突破成功！' : '⚔️ 擂台對戰結束'
                : playerHp > enemyHp ? '🎉 Player 1 獲勝！' : '🎉 Player 2 獲勝！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {enemyHp === 0 ? '掌握物距與像距趨勢，輕鬆拿捏凸透鏡與凹透鏡成像規律！' : '記住：凹透鏡永遠成「正立、縮小、虛像」！'}
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
              <span className="text-slate-400">{mode === 'single' ? '關主' : 'P2'} 剩餘 HP：</span>
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