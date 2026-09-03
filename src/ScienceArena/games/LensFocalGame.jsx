import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, CheckCircle2, Flame, Timer, Swords } from 'lucide-react';

export default function LensFocalGame({ mode = 'single', onGameOver }) {
  // 血條與遊戲狀態
  const [playerHp, setPlayerHp] = useState(100); // P1 / 單人玩家 HP
  const [enemyHp, setEnemyHp] = useState(100);  // P2 / 關主 HP
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionCount, setQuestionCount] = useState(1);

  // 狀態與計時
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'p1_attack' | 'p2_attack' | 'p1_hit' | 'p2_hit'
  const [currentRound, setCurrentRound] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(Date.now()); 
  const [critTimerLeft, setCritTimerLeft] = useState(5.0); // 5 秒爆擊倒數
  const [isCritical, setIsCritical] = useState(false);               
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionQueue, setQuestionQueue] = useState([]);

  // P1 點選狀態
  const [p1Orientation, setP1Orientation] = useState(null); 
  const [p1Type, setP1Type] = useState(null);               
  const [p1Size, setP1Size] = useState(null);               
  const [p1Pos, setP1Pos] = useState(null);                 
  const [p1TextOpt, setP1TextOpt] = useState(null);          
  const [p1NoImage, setP1NoImage] = useState(false);                    

  // P2 點選狀態 (雙人同時模式使用)
  const [p2Orientation, setP2Orientation] = useState(null); 
  const [p2Type, setP2Type] = useState(null);               
  const [p2Size, setP2Size] = useState(null);               
  const [p2Pos, setP2Pos] = useState(null);                 
  const [p2TextOpt, setP2TextOpt] = useState(null);          
  const [p2NoImage, setP2NoImage] = useState(false);                    

  const resetSelections = () => {
    // P1 重置
    setP1Orientation(null); setP1Type(null); setP1Size(null); setP1Pos(null); setP1TextOpt(null); setP1NoImage(false);
    // P2 重置
    setP2Orientation(null); setP2Type(null); setP2Size(null); setP2Pos(null); setP2TextOpt(null); setP2NoImage(false);
    
    setShowFeedback(false);
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

  const generateTenQuestionQueue = () => {
    const queue = [];

    // 凹透鏡 2 題
    queue.push(
      {
        qType: 'concave',
        lensType: 'concave',
        objPos: 'f_2f',
        showMode: 'obj_only',
        prompt: '【凹透鏡】蠟燭置於透鏡前方，請點選正確的成像性質與位置：',
        targetAns: { orientation: '正立', type: '虛像', size: '縮小', pos: '透鏡同側', noImage: false }
      },
      {
        qType: 'concave',
        lensType: 'concave',
        objPos: '2f_out',
        showMode: 'obj_only',
        prompt: '【凹透鏡】蠟燭置於 2f 外時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '正立', type: '虛像', size: '縮小', pos: '透鏡同側', noImage: false }
      }
    );

    // 反問物體位置 2 題
    queue.push(
      {
        qType: 'text_choice',
        lensType: 'convex',
        objPos: 'f_2f',
        imgPos: '2f_out',
        showMode: 'img_only',
        prompt: '【凸透鏡】紙屏上的像出現在「2f 外」，則蠟燭（物體）擺放在何處？',
        options: ['f ~ 2f 之間', '2f 外', '2f 上', 'f 內'],
        correctAns: 'f ~ 2f 之間'
      },
      {
        qType: 'text_choice',
        lensType: 'convex',
        objPos: 'f_2f',
        imgPos: '2f_out',
        showMode: 'img_only',
        prompt: '【凸透鏡】若要在紙屏上得到一個「放大倒立實像」，蠟燭應擺在何處？',
        options: ['f ~ 2f 之間', '2f 外', '2f 上', 'f 內'],
        correctAns: 'f ~ 2f 之間'
      }
    );

    // 趨勢題 3 題
    queue.push(
      {
        qType: 'text_choice',
        lensType: 'convex',
        objPos: '2f_out',
        showMode: 'obj_only',
        prompt: '【凸透鏡】蠟燭原本在 2f 外（實像），若希望得到「比現在更大」的像，蠟燭要向哪裡移動？',
        options: ['向右移動 (靠近焦點 f)', '向左移動 (遠離透鏡)', '保持不動', '上下垂直移動'],
        correctAns: '向右移動 (靠近焦點 f)'
      },
      {
        qType: 'text_choice',
        lensType: 'convex',
        objPos: 'f_in',
        showMode: 'obj_only',
        prompt: '【凸透鏡】蠟燭原本在 f 內（虛像），若希望得到「比現在更大」的虛像，蠟燭要向哪裡移動？',
        options: ['向左移動 (靠近焦點 f)', '向右移動 (靠近透鏡)', '保持不動', '向下移動'],
        correctAns: '向左移動 (靠近焦點 f)'
      },
      {
        qType: 'text_choice',
        lensType: 'convex',
        objPos: 'f_2f',
        showMode: 'both',
        prompt: '【凸透鏡】當蠟燭（物體）向「右」移動時，紙屏上的實像會向哪裡移動？',
        options: ['向右移動', '向左移動', '保持不動', '向上移動'],
        correctAns: '向右移動'
      }
    );

    // 基礎區塊 3 題
    queue.push(
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: '2f_out',
        showMode: 'obj_only',
        prompt: '【凸透鏡】蠟燭擺在【2f 外】時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '倒立', type: '實像', size: '縮小', pos: 'f與2f之間', noImage: false }
      },
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: '2f_on',
        showMode: 'obj_only',
        prompt: '【凸透鏡】蠟燭擺在【2f 上】時，請點選正確的成像性質與位置：',
        targetAns: { orientation: '倒立', type: '實像', size: '相等', pos: '2f上', noImage: false }
      },
      {
        qType: 'matrix',
        lensType: 'convex',
        objPos: 'f_on',
        showMode: 'obj_only',
        prompt: '【凸透鏡】蠟燭擺在【f 上 (焦點)】時，請點選正確的成像性質與位置：',
        targetAns: { noImage: true }
      }
    );

    return queue.sort(() => 0.5 - Math.random());
  };

  useEffect(() => {
    const queue = generateTenQuestionQueue();
    setQuestionQueue(queue);
    setCurrentRound(queue[0]);
    setRoundStartTime(Date.now());
  }, []);

  // 單人倒數計時
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
  // 作答驗證 (支援 P1 或 P2 獨立按壓驗證)
  // ==========================================
  const handlePlayerSubmit = (player) => {
    if (!currentRound || isFinished || actionState !== 'idle') return;

    const answerTime = (Date.now() - roundStartTime) / 1000; 
    const criticalHit = answerTime <= 5.0; // 5 秒暴擊判定

    // 檢查指定玩家的答案
    let isCorrect = false;
    if (player === 'p1') {
      if (currentRound.qType === 'text_choice') {
        isCorrect = p1TextOpt === currentRound.correctAns;
      } else {
        const target = currentRound.targetAns;
        isCorrect = target.noImage ? p1NoImage : (p1Orientation === target.orientation && p1Type === target.type && p1Size === target.size && p1Pos === target.pos && !p1NoImage);
      }
    } else {
      if (currentRound.qType === 'text_choice') {
        isCorrect = p2TextOpt === currentRound.correctAns;
      } else {
        const target = currentRound.targetAns;
        isCorrect = target.noImage ? p2NoImage : (p2Orientation === target.orientation && p2Type === target.type && p2Size === target.size && p2Pos === target.pos && !p2NoImage);
      }
    }

    const nextQIdx = questionCount + 1;
    setShowFeedback(true);

    if (mode === 'single') {
      // 單人模式
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
        }, 1200);
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
          if (playerHp > 20 && enemyHp > 0 && nextQIdx <= 10) {
            resetSelections();
            setQuestionCount(nextQIdx);
            setCurrentRound(questionQueue[nextQIdx - 1]);
          }
        }, 1200);
      }
    } else {
      // === 雙人同時 PK 模式：答對扣對方 HP，答錯自扣 HP ===
      if (isCorrect) {
        setIsCritical(criticalHit);
        const damage = criticalHit ? 20 : 10; // 5 秒內爆擊扣 20 HP

        setActionState(player === 'p1' ? 'p1_attack' : 'p2_attack');

        setTimeout(() => {
          setActionState(player === 'p1' ? 'p2_hit' : 'p1_hit');
          if (player === 'p1') {
            setEnemyHp((prev) => {
              const nextHp = Math.max(0, prev - damage);
              if (nextHp === 0 || nextQIdx > 10) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          } else {
            setPlayerHp((prev) => {
              const nextHp = Math.max(0, prev - damage);
              if (nextHp === 0 || nextQIdx > 10) setTimeout(() => setIsFinished(true), 600);
              return nextHp;
            });
          }
        }, 250);

        // 答對自動進入下一題
        setTimeout(() => {
          setActionState('idle');
          if (playerHp > 0 && enemyHp > 0 && nextQIdx <= 10) {
            resetSelections();
            setQuestionCount(nextQIdx);
            setCurrentRound(questionQueue[nextQIdx - 1]);
          }
        }, 1200);
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

  const isP1Ready = currentRound?.qType === 'text_choice' ? !!p1TextOpt : p1NoImage || (p1Orientation && p1Type && p1Size && p1Pos);
  const isP2Ready = currentRound?.qType === 'text_choice' ? !!p2TextOpt : p2NoImage || (p2Orientation && p2Type && p2Size && p2Pos);

  // SVG 光學畫布
  const renderOpticsCanvas = () => {
    if (!currentRound) return null;

    const width = 360;
    const height = 110;
    const centerY = 55;
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

    let imgX = f2_right + 30; 
    let isInverted = true;
    let imgScale = 1.4;

    if (currentRound.lensType === 'concave') {
      imgX = lensX - 28; 
      isInverted = false;
      imgScale = 0.6;
    } else {
      if (currentRound.objPos === '2f_out') {
        imgX = (f1_right + f2_right) / 2;
        imgScale = 0.7;
      } else if (currentRound.objPos === '2f_on') {
        imgX = f2_right;
        imgScale = 1.0;
      } else if (currentRound.objPos === 'f_in') {
        imgX = f2 - 20;
        isInverted = false;
        imgScale = 1.5;
      }
    }

    const shouldHideObject = currentRound.showMode === 'img_only' && !showFeedback;
    const shouldShowImage = (currentRound.showMode === 'img_only' || currentRound.showMode === 'both' || showFeedback) && currentRound.objPos !== 'f_on';

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

          {!shouldHideObject && (
            <g transform={`translate(${candleX}, ${centerY})`}>
              <circle cx="0" cy="-26" r="4" fill="#fbbf24" className="animate-ping opacity-75" />
              <circle cx="0" cy="-26" r="3" fill="#f97316" />
              <rect x="-3" y="-20" width="6" height="20" fill="#e2e8f0" rx="1" />
              <text x="0" y="14" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">🕯️ 物體</text>
            </g>
          )}

          {shouldShowImage && (
            <g
              transform={`translate(${imgX}, ${centerY}) scale(${imgScale}, ${isInverted ? -imgScale : imgScale})`}
              opacity={currentRound.lensType === 'concave' || currentRound.objPos === 'f_in' ? 0.65 : 0.9}
            >
              <circle cx="0" cy="-26" r="4" fill="#38bdf8" className="animate-ping opacity-75" />
              <circle cx="0" cy="-26" r="3" fill="#0284c7" />
              <rect x="-3" y="-20" width="6" height="20" fill="#94a3b8" rx="1" />
              <text x="0" y={isInverted ? -8 : 14} transform={isInverted ? "scale(1, -1)" : ""} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                🖼️ 成像
              </text>
            </g>
          )}
        </svg>

        {showFeedback && (
          <div className="absolute bottom-1 bg-emerald-500/90 text-white font-black text-xs px-3 py-0.5 rounded-full shadow-lg border border-emerald-300 animate-bounce flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 正確解答圖示揭曉
          </div>
        )}
      </div>
    );
  };

  // 渲染獨立作答面板模組 (給 P1 或 P2 重複使用)
  const renderPlayerControlPanel = (player, orientation, setOrientation, type, setType, size, setSize, pos, setPos, textOpt, setTextOpt, noImg, setNoImg, isReady) => {
    const isP1 = player === 'p1';

    return (
      <div className={`p-3.5 rounded-2xl border space-y-3 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🛡️ Player 1 (左側選手)' : '⚔️ Player 2 (右側選手)'}
          </span>

          {currentRound.qType !== 'text_choice' && (
            <button
              onClick={() => {
                setNoImg(!noImg);
                if (!noImg) { setOrientation(null); setType(null); setSize(null); setPos(null); }
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                noImg ? 'bg-rose-500 text-white border-rose-300' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              🚫 不成像
            </button>
          )}
        </div>

        {currentRound.qType === 'text_choice' ? (
          /* 文字選擇題 */
          <div className="grid grid-cols-1 gap-2">
            {currentRound.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setTextOpt(opt)}
                className={`p-2.5 rounded-xl font-bold text-[11px] border text-left transition-all cursor-pointer ${
                  textOpt === opt
                    ? isP1 ? 'bg-indigo-600 text-white border-indigo-300 ring-2 ring-indigo-400/50' : 'bg-rose-600 text-white border-rose-300 ring-2 ring-rose-400/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          /* 多重方塊矩陣題 */
          !noImg ? (
            <div className="space-y-2 text-[10px]">
              {/* 正倒立 */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400">🟣 正倒立：</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['正立', '倒立'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setOrientation(item)}
                      className={`py-1.5 rounded-lg font-bold border transition-all ${
                        orientation === item
                          ? isP1 ? 'bg-indigo-600 text-white border-indigo-300' : 'bg-rose-600 text-white border-rose-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 虛實像 */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400">🔵 虛實像：</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['實像', '虛像'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setType(item)}
                      className={`py-1.5 rounded-lg font-bold border transition-all ${
                        type === item
                          ? isP1 ? 'bg-indigo-600 text-white border-indigo-300' : 'bg-rose-600 text-white border-rose-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 大小 */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400">🟢 大小：</span>
                <div className="grid grid-cols-3 gap-1">
                  {['放大', '縮小', '相等'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSize(item)}
                      className={`py-1 rounded-lg font-bold border transition-all ${
                        size === item
                          ? isP1 ? 'bg-indigo-600 text-white border-indigo-300' : 'bg-rose-600 text-white border-rose-300'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 成像位置 */}
              <div className="space-y-1">
                <span className="font-bold text-slate-400">🟡 成像位置：</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {['f與2f之間', '2f外', '2f上', '透鏡同側'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setPos(item)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        pos === item
                          ? 'bg-amber-500 text-slate-950 border-amber-200'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <p className="text-xs font-bold text-rose-300">已選擇【無法成像】</p>
            </div>
          )
        )}

        {/* 獨立發射光束按鈕 */}
        <button
          onClick={() => handlePlayerSubmit(player)}
          disabled={!isReady || actionState !== 'idle'}
          className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isReady && actionState === 'idle'
              ? isP1 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" /> {isP1 ? 'P1 搶答發射！' : 'P2 搶答發射！'}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 30F ({mode === 'pvp' ? '雙人同屏搶速 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              關卡 {questionCount} / 10
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🔍 30F 光學擂台：透鏡焦點戰
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
          </div>

          {/* P2 */}
          <div className={`flex flex-col items-center gap-1.5 z-10 transition-all duration-300 ${actionState === 'p2_attack' ? '-translate-x-8 scale-110' : ''} ${actionState === 'p2_hit' ? 'translate-x-4 animate-shake text-rose-500' : ''}`}>
            {actionState === 'p2_hit' && <span className="absolute -top-6 text-amber-400 font-black text-lg animate-bounce">-20 HP!</span>}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-rose-500 bg-rose-600/20 flex items-center justify-center relative shadow-lg">
              <div className="text-3xl md:text-4xl">🔬</div>
              <span className="absolute -bottom-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {mode === 'pvp' ? 'Player 2' : '30F 關主'}
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

      {/* 5 秒暴擊動態倒數條與公共題目區 */}
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

          {/* 公共題目與 SVG 光學繪圖 */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            {renderOpticsCanvas()}
            <h3 className="text-xs md:text-sm font-black text-white mt-1">
              {currentRound.prompt}
            </h3>
          </div>

          {/* 雙人模式：左右兩邊同屏獨立作答區 */}
          {mode === 'pvp' ? (
            <div className="grid grid-cols-2 gap-3">
              {/* 左側：Player 1 */}
              {renderPlayerControlPanel('p1', p1Orientation, setP1Orientation, p1Type, setP1Type, p1Size, setP1Size, p1Pos, setP1Pos, p1TextOpt, setP1TextOpt, p1NoImage, setP1NoImage, isP1Ready)}
              {/* 右側：Player 2 */}
              {renderPlayerControlPanel('p2', p2Orientation, setP2Orientation, p2Type, setP2Type, p2Size, setP2Size, p2Pos, setP2Pos, p2TextOpt, setP2TextOpt, p2NoImage, setP2NoImage, isP2Ready)}
            </div>
          ) : (
            /* 單人模式面板 */
            <div className="max-w-xl mx-auto">
              {renderPlayerControlPanel('p1', p1Orientation, setP1Orientation, p1Type, setP1Type, p1Size, setP1Size, p1Pos, setP1Pos, p1TextOpt, setP1TextOpt, p1NoImage, setP1NoImage, isP1Ready)}
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
                ? enemyHp === 0 ? '🎉 30F 透鏡擂台 KO 突破成功！' : '⚔️ 擂台對戰結束'
                : playerHp > enemyHp ? '🎉 Player 1 (左側) 搶速勝出！' : '🎉 Player 2 (右側) 搶速勝出！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              雙人搶速對決結束！兩位選手在透鏡成像性質反應力上表現相當精彩！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">完成題目數量：</span>
              <span className="font-bold text-amber-400">{questionCount - 1} / 10 題</span>
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