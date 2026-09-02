import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap } from 'lucide-react';

export default function LensFocalGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionCount, setQuestionCount] = useState(1);

  // 雙人 PK 輪流控制
  const [currentPlayer, setCurrentPlayer] = useState('p1');
  const [actionState, setActionState] = useState('idle');
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  // 10 題固定題型佇列生成 (確保 10 題中精準包含所要求題型比例)
  const [questionQueue, setQuestionQueue] = useState([]);

  // 玩家點選的狀態
  const [selectedOrientation, setSelectedOrientation] = useState(null); 
  const [selectedType, setSelectedType] = useState(null);               
  const [selectedSize, setSelectedSize] = useState(null);               
  const [selectedPos, setSelectedPos] = useState(null);                 
  const [selectedTextOpt, setSelectedTextOpt] = useState(null);          // 趨勢/選擇題答案
  const [isNoImage, setIsNoImage] = useState(false);                    

  const resetSelections = () => {
    setSelectedOrientation(null);
    setSelectedType(null);
    setSelectedSize(null);
    setSelectedPos(null);
    setSelectedTextOpt(null);
    setIsNoImage(false);
  };

  // ==========================================
  // 1. 生成 10 題標準配比題庫佇列
  // ==========================================
  const generateTenQuestionQueue = () => {
    const queue = [];

    // [類型 1] 2 題凹透鏡題型
    queue.push(
      {
        qType: 'concave',
        lensType: 'concave',
        objPos: 'f_2f',
        prompt: '【凹透鏡】蠟燭置於透鏡前方，請點選正確的成像性質與位置：',
        targetAns: { orientation: '正立', type: '虛像', size: '縮小', pos: '透鏡同側', noImage: false }
      },
      {
        qType: 'concave',
        lensType: 'concave',
        objPos: '2f_out',
        prompt: '【凹透鏡】蠟燭置於 2f 外時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '正立', type: '虛像', size: '縮小', pos: '透鏡同側', noImage: false }
      }
    );

    // [類型 2] 1 題：給像位置 ➔ 反問物體位置
    queue.push({
      qType: 'text_choice',
      lensType: 'convex',
      objPos: 'f_2f',
      prompt: '【凸透鏡】紙屏上的像出現在「2f 外」，則蠟燭（物體）擺放在何處？',
      options: ['f ~ 2f 之間', '2f 外', '2f 上', 'f 內'],
      correctAns: 'f ~ 2f 之間'
    });

    // [類型 3] 1 題：給像性質 ➔ 反問物體位置
    queue.push({
      qType: 'text_choice',
      lensType: 'convex',
      objPos: 'f_2f',
      prompt: '【凸透鏡】若希望在紙屏上得到一個「放大倒立實像」，蠟燭應擺在何處？',
      options: ['f ~ 2f 之間', '2f 外', '2f 上', 'f 內'],
      correctAns: 'f ~ 2f 之間'
    });

    // [類型 4] 2 題：像的大小控制趨勢 (焦點外 1 題, 焦點內 1 題)
    // 焦點外實像 (要更大像 ➔ 物體向右/靠近 f)
    queue.push({
      qType: 'text_choice',
      lensType: 'convex',
      objPos: '2f_out',
      prompt: '【凸透鏡】蠟燭原本在 2f 外（實像），若希望得到「比現在更大」的像，蠟燭要向哪裡移動？',
      options: ['向右移動 (靠近焦點 f)', '向左移動 (遠離透鏡)', '保持不動', '上下垂直移動'],
      correctAns: '向右移動 (靠近焦點 f)'
    });

    // 焦點內虛像 (要更大像 ➔ 物體向左/遠離透鏡/靠近 f)
    queue.push({
      qType: 'text_choice',
      lensType: 'convex',
      objPos: 'f_in',
      prompt: '【凸透鏡】蠟燭原本在 f 內（虛像），若希望得到「比現在更大」的虛像，蠟燭要向哪裡移動？',
      options: ['向左移動 (靠近焦點 f)', '向右移動 (靠近透鏡)', '保持不動', '向下移動'],
      correctAns: '向左移動 (靠近焦點 f)'
    });

    // [類型 5] 1 題：物與像的移動方向趨勢 (物右像右, 物左像左)
    queue.push({
      qType: 'text_choice',
      lensType: 'convex',
      objPos: 'f_2f',
      prompt: '【凸透鏡】當蠟燭（物體）向「右」移動時，紙屏上的實像會向哪裡移動？',
      options: ['向右移動', '向左移動', '保持不動', '向上移動'],
      correctAns: '向右移動'
    });

    // [類型 6] 3 題：基礎 5 大區塊矩陣題
    queue.push(
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: '2f_out',
        prompt: '【凸透鏡】蠟燭擺在【2f 外】時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '倒立', type: '實像', size: '縮小', pos: 'f與2f之間', noImage: false }
      },
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: '2f_on',
        prompt: '【凸透鏡】蠟燭擺在【2f 上】時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '倒立', type: '實像', size: '相等', pos: '2f上', noImage: false }
      },
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: 'f_on',
        prompt: '【凸透鏡】蠟燭擺在【f 上 (焦點)】時，請點選正確的成像性質與位置：',
        targetAns: { noImage: true }
      }
    );

    // 打亂題目順序
    return queue.sort(() => 0.5 - Math.random());
  };

  useEffect(() => {
    const queue = generateTenQuestionQueue();
    setQuestionQueue(queue);
    setCurrentRound(queue[0]);
  }, []);

  // 單人倒數計時器
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
  // 2. 驗證作答邏輯
  // ==========================================
  const handleSubmitAnswer = () => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    let isCorrect = false;

    if (currentRound.qType === 'text_choice') {
      isCorrect = selectedTextOpt === currentRound.correctAns;
    } else {
      const target = currentRound.targetAns;
      if (target.noImage) {
        isCorrect = isNoImage;
      } else {
        isCorrect =
          selectedOrientation === target.orientation &&
          selectedType === target.type &&
          selectedSize === target.size &&
          selectedPos === target.pos &&
          !isNoImage;
      }
    }

    const nextLevel = level + 1;
    const nextQIdx = questionCount + 1;

    if (mode === 'single') {
      if (isCorrect) {
        setActionState('player_attack');
        setLevel(nextLevel);

        setTimeout(() => {
          setActionState('enemy_hit');
          setCombo((prev) => prev + 1);
          setScore((prev) => prev + 30);
          setEnemyHp((prev) => {
            const nextHp = Math.max(0, prev - 10);
            if (nextHp === 0 || nextQIdx > 10) setTimeout(() => setIsFinished(true), 600);
            return nextHp;
          });
        }, 250);

        setTimeout(() => {
          setActionState('idle');
          if (enemyHp > 10 && playerHp > 0 && nextQIdx <= 10) {
            resetSelections();
            setQuestionCount(nextQIdx);
            setCurrentRound(questionQueue[nextQIdx - 1]);
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
          if (playerHp > 20 && enemyHp > 0 && nextQIdx <= 10) {
            resetSelections();
            setQuestionCount(nextQIdx);
            setCurrentRound(questionQueue[nextQIdx - 1]);
          }
        }, 900);
      }
    } else {
      // 雙人 PK 輪流作答
      const isP1 = currentPlayer === 'p1';

      if (isCorrect) {
        setLevel(nextLevel);
        setActionState(isP1 ? 'player_attack' : 'enemy_attack');

        setTimeout(() => {
          setActionState(isP1 ? 'enemy_hit' : 'player_hit');
          if (isP1) {
            setEnemyHp((prev) => {
              const nextHp = Math.max(0, prev - 10);
              if (nextHp === 0 || nextQIdx > 10) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          } else {
            setPlayerHp((prev) => {
              const nextHp = Math.max(0, prev - 10);
              if (nextHp === 0 || nextQIdx > 10) setTimeout(() => setIsFinished(true), 600);
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
        if (playerHp > 10 && enemyHp > 10 && nextQIdx <= 10) {
          resetSelections();
          setQuestionCount(nextQIdx);
          setCurrentRound(questionQueue[nextQIdx - 1]);
        }
      }, 900);
    }
  };

  const handleExit = () => {
    const gainedExp = score + (playerHp > 0 ? 50 : 10);
    if (onGameOver) onGameOver(gainedExp);
  };

  const isSubmitReady = currentRound?.qType === 'text_choice' 
    ? !!selectedTextOpt 
    : isNoImage || (selectedOrientation && selectedType && selectedSize && selectedPos);

  // ==========================================
  // 3. SVG 光學畫布
  // ==========================================
  const renderOpticsCanvas = () => {
    if (!currentRound) return null;

    const width = 360;
    const height = 100;
    const centerY = 50;
    const lensX = 180;

    const f1 = lensX - 50;
    const f2 = lensX - 100;
    const f1_right = lensX + 50;
    const f2_right = lensX + 100;

    let candleX = f2 - 30;
    if (currentRound.objPos === '2f_on') candleX = f2;
    else if (currentRound.objPos === 'f_2f') candleX = (f1 + f2) / 2;
    else if (currentRound.objPos === 'f_on') candleX = f1;
    else if (currentRound.objPos === 'f_in') candleX = f1 + 25;

    return (
      <div className="relative w-full flex justify-center items-center py-2 overflow-hidden bg-slate-950/80 rounded-2xl border border-slate-800">
        <svg width={width} height={height} className="overflow-visible">
          <line x1="10" y1={centerY} x2={width - 10} y2={centerY} stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />

          <g fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
            <line x1={f2} y1={centerY - 6} x2={f2} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f2} y={centerY + 18}>2F</text>

            <line x1={f1} y1={centerY - 6} x2={f1} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f1} y={centerY + 18}>F</text>

            <line x1={f1_right} y1={centerY - 6} x2={f1_right} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f1_right} y={centerY + 18}>F</text>

            <line x1={f2_right} y1={centerY - 6} x2={f2_right} y2={centerY + 6} stroke="#94a3b8" strokeWidth="2" />
            <text x={f2_right} y={centerY + 18}>2F</text>
          </g>

          {currentRound.lensType === 'convex' ? (
            <path
              d={`M ${lensX} ${centerY - 40} Q ${lensX + 16} ${centerY}, ${lensX} ${centerY + 40} Q ${lensX - 16} ${centerY}, ${lensX} ${centerY - 40}`}
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
          ) : (
            <path
              d={`M ${lensX - 10} ${centerY - 40} Q ${lensX} ${centerY}, ${lensX - 10} ${centerY + 40} L ${lensX + 10} ${centerY + 40} Q ${lensX} ${centerY}, ${lensX + 10} ${centerY - 40} Z`}
              fill="rgba(244, 63, 94, 0.25)"
              stroke="#f43f5e"
              strokeWidth="2.5"
            />
          )}

          <g transform={`translate(${candleX}, ${centerY})`}>
            <circle cx="0" cy="-26" r="4" fill="#fbbf24" className="animate-ping opacity-75" />
            <circle cx="0" cy="-26" r="3" fill="#f97316" />
            <rect x="-3" y="-20" width="6" height="20" fill="#e2e8f0" rx="1" />
            <text x="0" y="14" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">🕯️ 物體</text>
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 30F ({mode === 'pvp' ? '雙人輪流 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              關卡 {questionCount} / 10
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
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative flex justify-between items-center min-h-[180px]">
          {/* P1 */}
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

          {/* P2 */}
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

      {/* 答題介面區 */}
      {!isFinished && currentRound && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
            {renderOpticsCanvas()}
            <h3 className="text-sm md:text-base font-black text-white mt-1">
              {currentRound.prompt}
            </h3>
          </div>

          {currentRound.qType === 'text_choice' ? (
            /* 文字選擇題型 (如：問物體擺放位置、趨勢移動) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              {currentRound.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedTextOpt(opt)}
                  className={`p-3.5 rounded-xl font-bold text-xs border transition-all cursor-pointer text-left ${
                    selectedTextOpt === opt
                      ? 'bg-indigo-600 text-white border-indigo-300 ring-2 ring-indigo-400/50 scale-[1.02]'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            /* 4 分類矩陣點選答題區 (凹透鏡與凸透鏡 5 大區塊) */
            <div className="space-y-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsNoImage(!isNoImage);
                    if (!isNoImage) {
                      setSelectedOrientation(null);
                      setSelectedType(null);
                      setSelectedSize(null);
                      setSelectedPos(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    isNoImage ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  🚫 特例：無法成像
                </button>
              </div>

              {!isNoImage ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. 正倒立 */}
                  <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black text-purple-300">🟣 正倒立方向：</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['正立', '倒立'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedOrientation(item)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedOrientation === item
                              ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400/50 scale-105'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-purple-500/50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. 虛實像 */}
                  <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black text-blue-300">🔵 虛實像性質：</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['實像', '虛像'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedType(item)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedType === item
                              ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400/50 scale-105'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-blue-500/50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. 大小比例 */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black text-emerald-300">🟢 大小比例：</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['放大', '縮小', '相等'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedSize(item)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedSize === item
                              ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400/50 scale-105'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. 成像位置 */}
                  <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-black text-amber-300">🟡 成像位置：</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['f與2f之間', '2f外', '2f上', '透鏡同側'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedPos(item)}
                          className={`py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            selectedPos === item
                              ? 'bg-amber-500 text-slate-950 border-amber-200 ring-2 ring-amber-400/50 scale-105'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <p className="text-sm font-bold text-rose-300">已選擇：焦點 f 上折射光線平行，【無法成像】</p>
                </div>
              )}
            </div>
          )}

          {/* 發射光束 / 驗證按鈕 */}
          <button
            onClick={handleSubmitAnswer}
            disabled={!isSubmitReady || actionState !== 'idle'}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitReady && actionState === 'idle'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white hover:brightness-110 active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5 fill-current" /> ⚔️ 發射光束（確認驗證）
          </button>
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
              {enemyHp === 0 ? '掌握透鏡成像與動態移動規律，順利通過 30F 擂台！' : '記得：凹透鏡永遠成「正立、縮小、虛像，同側」！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">答題完成進度：</span>
              <span className="font-bold text-amber-400">{questionCount - 1} / 10 題</span>
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