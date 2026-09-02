import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Waves, CheckCircle2 } from 'lucide-react';

export default function ParticleSurfGame({ mode = 'single', onGameOver }) {
  // 遊戲狀態
  const [progress, setProgress] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);

  // 雙人 PK 模式獨立狀態 (加入各自的題號計數，確保 1~3 題過後出週期題)
  const [p1Progress, setP1Progress] = useState(0);
  const [p2Progress, setP2Progress] = useState(0);
  const [p1QIndex, setP1QIndex] = useState(1);
  const [p2QIndex, setP2QIndex] = useState(1);
  const [p1Round, setP1Round] = useState(null);
  const [p2Round, setP2Round] = useState(null);

  // 當前回合與視覺動態狀態
  const [singleRound, setSingleRound] = useState(null);
  const [actionState, setActionState] = useState('idle'); 
  const [isFinished, setIsFinished] = useState(false);

  // 動畫控制 (單人 & 雙人 P1 / P2 獨立平移量與終點標示)
  const [animOffsetSingle, setAnimOffsetSingle] = useState(0);
  const [showFinalSingle, setShowFinalSingle] = useState(false);

  const [animOffsetP1, setAnimOffsetP1] = useState(0);
  const [showFinalP1, setShowFinalP1] = useState(false);

  const [animOffsetP2, setAnimOffsetP2] = useState(0);
  const [showFinalP2, setShowFinalP2] = useState(false);

  const animRefSingle = useRef(null);
  const animRefP1 = useRef(null);
  const animRefP2 = useRef(null);

  // ==========================================
  // 1. 嚴謹物理數學模型題庫生成器
  // ==========================================
  const generateParticleQuestion = (qIndex) => {
    const waveDirection = Math.random() > 0.5 ? 'right' : 'left';

    if (qIndex <= 3) {
      // === 前 3 題：瞬間運動方向判斷 ===
      const phases = [45, 135, 225, 315];
      const particlePhase = phases[Math.floor(Math.random() * phases.length)];

      let correctAns = '';
      if (waveDirection === 'right') {
        correctAns = (particlePhase === 45 || particlePhase === 315) ? '向下移動' : '向上移動';
      } else {
        correctAns = (particlePhase === 45 || particlePhase === 315) ? '向上移動' : '向下移動';
      }

      return {
        qCategory: 'direction',
        waveDirection,
        particlePhase,
        deltaQuarters: 0.25,
        title: `第 ${qIndex} 題：瞬間運動方向`,
        desc: `波向${waveDirection === 'right' ? '右' : '左'}傳播，請判斷質點 P 此刻的瞬間運動方向？`,
        options: ['向上移動', '向下移動'],
        correctAns,
        particleName: '介面質點 P'
      };
    } else {
      // === 第 4 題起：週期位移題型 (含精準週期移位動畫) ===
      const isTypeA = Math.random() > 0.5;

      if (isTypeA) {
        const startPhases = [90, 180, 270]; 
        const startPhase = startPhases[Math.floor(Math.random() * startPhases.length)];
        const deltaQuarters = [1, 2, 3, 4][Math.floor(Math.random() * 4)];

        let phaseShift = deltaQuarters * 90;
        let finalPhase = 0;

        if (waveDirection === 'right') {
          finalPhase = (startPhase - phaseShift % 360 + 360) % 360;
        } else {
          finalPhase = (startPhase + phaseShift) % 360;
        }

        let correctAns = '';
        if (Math.abs(finalPhase - 90) < 5 || Math.abs(finalPhase - 450) < 5) correctAns = '波峰';
        else if (Math.abs(finalPhase - 270) < 5) correctAns = '波谷';
        else correctAns = '平衡位置';

        const phaseName = startPhase === 90 ? '波峰' : startPhase === 270 ? '波谷' : '平衡位置';

        return {
          qCategory: 'period_position',
          waveDirection,
          particlePhase: startPhase,
          deltaQuarters: deltaQuarters / 4,
          title: `第 ${qIndex} 題：週期隨後位置`,
          desc: `波向${waveDirection === 'right' ? '右' : '左'}傳播。衝浪手原本位於【${phaseName}】，經過 ${deltaQuarters}/4 個週期 (T) 後，會位於什麼位置？`,
          options: ['波峰', '波谷', '平衡位置'],
          correctAns,
          particleName: '衝浪手'
        };
      } else {
        const startPhases = [90, 180, 270];
        const startPhase = startPhases[Math.floor(Math.random() * startPhases.length)];
        
        let targetPhase = 90;
        if (startPhase === 90) targetPhase = 270;
        else if (startPhase === 270) targetPhase = 90;
        else targetPhase = Math.random() > 0.5 ? 90 : 270;

        let deltaPhase = 0;
        if (waveDirection === 'right') {
          deltaPhase = (startPhase - targetPhase + 360) % 360;
        } else {
          deltaPhase = (targetPhase - startPhase + 360) % 360;
        }

        if (deltaPhase === 0) deltaPhase = 360;
        const requiredQuarters = Math.round(deltaPhase / 90);
        const correctAns = `${requiredQuarters}/4 個週期`;

        const startName = startPhase === 90 ? '波峰' : startPhase === 270 ? '波谷' : '平衡位置';
        const targetName = targetPhase === 90 ? '波峰' : '波谷';

        return {
          qCategory: 'period_time',
          waveDirection,
          particlePhase: startPhase,
          deltaQuarters: requiredQuarters / 4,
          title: `第 ${qIndex} 題：最快週期推算`,
          desc: `波向${waveDirection === 'right' ? '右' : '左'}傳播。衝浪手原本位於【${startName}】，最快需要經過多少個週期才能到達【${targetName}】？`,
          options: ['1/4 個週期', '2/4 個週期', '3/4 個週期', '4/4 個週期'],
          correctAns,
          particleName: '衝浪手'
        };
      }
    }
  };

  const generateNextRounds = (qIdx) => {
    if (mode === 'single') {
      setSingleRound(generateParticleQuestion(qIdx));
      setAnimOffsetSingle(0);
      setShowFinalSingle(false);
    } else {
      setP1Round(generateParticleQuestion(1));
      setP2Round(generateParticleQuestion(1));
      setP1QIndex(1);
      setP2QIndex(1);
      setAnimOffsetP1(0);
      setShowFinalP1(false);
      setAnimOffsetP2(0);
      setShowFinalP2(false);
    }
  };

  useEffect(() => {
    generateNextRounds(1);
  }, [mode]);

  // 計時器
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
  // 2. 通用動畫引擎 (支援 Single, P1, P2)
  // ==========================================
  const triggerWaveAnimation = (targetKey, direction, deltaPeriodFraction, callback) => {
    let start = null;
    const duration = 1200;
    const fullWaveLength = 340; 
    const distance = (direction === 'right' ? 1 : -1) * (fullWaveLength * deltaPeriodFraction);

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progressTime = timestamp - start;
      const rate = Math.min(progressTime / duration, 1);
      
      const currentOffset = distance * rate;
      if (targetKey === 'single') setAnimOffsetSingle(currentOffset);
      else if (targetKey === 'p1') setAnimOffsetP1(currentOffset);
      else if (targetKey === 'p2') setAnimOffsetP2(currentOffset);

      if (progressTime < duration) {
        if (targetKey === 'single') animRefSingle.current = requestAnimationFrame(step);
        else if (targetKey === 'p1') animRefP1.current = requestAnimationFrame(step);
        else if (targetKey === 'p2') animRefP2.current = requestAnimationFrame(step);
      } else {
        if (targetKey === 'single') setShowFinalSingle(true);
        else if (targetKey === 'p1') setShowFinalP1(true);
        else if (targetKey === 'p2') setShowFinalP2(true);

        setTimeout(() => {
          if (callback) callback();
        }, 800);
      }
    };

    if (targetKey === 'single') animRefSingle.current = requestAnimationFrame(step);
    else if (targetKey === 'p1') animRefP1.current = requestAnimationFrame(step);
    else if (targetKey === 'p2') animRefP2.current = requestAnimationFrame(step);
  };

  const handleSingleAnswer = (userAns) => {
    if (actionState !== 'idle' || isFinished) return;

    const isCorrect = userAns === singleRound.correctAns;
    const nextQIdx = questionCount + 1;

    setActionState(isCorrect ? 'success' : 'fall');

    triggerWaveAnimation('single', singleRound.waveDirection, singleRound.deltaQuarters || 0.25, () => {
      if (isCorrect) {
        const nextProg = progress + 1;
        setProgress(nextProg);
        setQuestionCount(nextQIdx);
        setScore((prev) => prev + 30);

        if (nextProg >= 10) {
          setIsFinished(true);
        } else {
          setActionState('idle');
          generateNextRounds(nextQIdx);
        }
      } else {
        setProgress((prev) => Math.max(0, prev - 1));
        setActionState('idle');
        generateNextRounds(questionCount);
      }
    });
  };

  const handlePvpAnswer = (player, userAns) => {
    if (isFinished) return;

    const round = player === 'p1' ? p1Round : p2Round;
    const isCorrect = userAns === round.correctAns;

    triggerWaveAnimation(player, round.waveDirection, round.deltaQuarters || 0.25, () => {
      if (player === 'p1') {
        const nextQIdx = p1QIndex + 1;
        setP1QIndex(nextQIdx);

        if (isCorrect) {
          const next = p1Progress + 1;
          setP1Progress(next);
          if (next >= 10) setIsFinished(true);
          else {
            setP1Round(generateParticleQuestion(nextQIdx));
            setAnimOffsetP1(0);
            setShowFinalP1(false);
          }
        } else {
          setP1Progress((prev) => Math.max(0, prev - 1));
          setP1Round(generateParticleQuestion(nextQIdx));
          setAnimOffsetP1(0);
          setShowFinalP1(false);
        }
      } else {
        const nextQIdx = p2QIndex + 1;
        setP2QIndex(nextQIdx);

        if (isCorrect) {
          const next = p2Progress + 1;
          setP2Progress(next);
          if (next >= 10) setIsFinished(true);
          else {
            setP2Round(generateParticleQuestion(nextQIdx));
            setAnimOffsetP2(0);
            setShowFinalP2(false);
          }
        } else {
          setP2Progress((prev) => Math.max(0, prev - 1));
          setP2Round(generateParticleQuestion(nextQIdx));
          setAnimOffsetP2(0);
          setShowFinalP2(false);
        }
      }
    });
  };

  const handleExit = () => {
    const gainedExp = score + (progress >= 10 ? 100 : progress * 8);
    if (onGameOver) onGameOver(gainedExp);
  };

  // ==========================================
  // 3. 通用 SVG 波動畫布與終點高亮標籤
  // ==========================================
  const renderWaveCanvas = (roundData, currentAnimOffset, showFinal, isFallAnimation = false) => {
    if (!roundData) return null;

    const width = 340;
    const height = 130;
    const centerY = 65;
    const amplitude = 35;

    const particleX = (roundData.particlePhase / 360) * width;
    
    // 依據即時平移距離換算成弧度
    const phaseOffsetRad = (currentAnimOffset / width) * 2 * Math.PI;
    const particleY = centerY - Math.sin((roundData.particlePhase * Math.PI) / 180 - phaseOffsetRad) * amplitude;

    return (
      <div className="relative w-full flex justify-center items-center py-2 overflow-hidden">
        <svg width={width} height={height} className="overflow-visible">
          {/* 平衡基準線 */}
          <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />

          {/* 1. 平移正弦波形 */}
          <g transform={`translate(${currentAnimOffset}, 0)`}>
            <path
              d={`M -340 ${centerY - Math.sin(-340 * Math.PI / 170) * amplitude} 
                 Q ${width * 0.25 - 340} ${centerY - amplitude * 1.4}, ${width * 0.5 - 340} ${centerY} 
                 T 0 ${centerY}
                 Q ${width * 0.25} ${centerY - amplitude * 1.4}, ${width * 0.5} ${centerY} 
                 T ${width} ${centerY}
                 Q ${width * 1.25} ${centerY - amplitude * 1.4}, ${width * 1.5} ${centerY} 
                 T ${width * 2} ${centerY}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
            />
          </g>

          {/* 2. 質點純垂直振動軸線 */}
          <line x1={particleX} y1="10" x2={particleX} y2={height - 10} stroke="#f59e0b" strokeDasharray="2 2" opacity="0.4" />

          {/* 3. 動畫結束時的高亮定格圓圈標記 */}
          {showFinal && (
            <circle
              cx={particleX}
              cy={particleY}
              r="16"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              className="animate-ping"
            />
          )}

          {/* 4. 衝浪手質點 */}
          <g
            transform={`translate(${particleX}, ${
              isFallAnimation ? particleY + 35 : particleY
            })`}
            className="transition-transform duration-75"
          >
            <circle r="8" fill={isFallAnimation ? '#ef4444' : showFinal ? '#22c55e' : '#f59e0b'} className="animate-ping opacity-75" />
            <circle r="6" fill={isFallAnimation ? '#ef4444' : showFinal ? '#22c55e' : '#fbbf24'} stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="15">
              {isFallAnimation ? '🏊‍♂️' : '🏄‍♂️'}
            </text>
          </g>
        </svg>

        {/* 5. 終點動態定格浮籤文字 */}
        {showFinal && (
          <div className="absolute bottom-1 bg-emerald-500/90 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg border border-emerald-300 animate-bounce flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 最終抵達：{roundData?.correctAns}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-100 select-none overflow-hidden">
      {/* 頂部資訊列 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 20F ({mode === 'pvp' ? '雙人 PK' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              {mode === 'single' ? `關卡 ${questionCount} / 10` : '雙人競速對決'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 flex items-center gap-2">
            🏄‍♂️ 20F 波動擂台：質點衝浪手
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
              <p className="text-base font-mono font-bold text-emerald-400">∞ (搶先衝刺)</p>
            )}
          </div>
        </div>
      </div>

      {/* 單人模式進度條 */}
      {mode === 'single' && !isFinished && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-cyan-300 flex items-center gap-1">
              <Waves className="w-4 h-4" /> 衝浪推進距離：
            </span>
            <span className="text-amber-400 font-mono">{progress} / 10 站 (往前10次抵達終點)</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 p-0.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(progress / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 主戰場區 */}
      {!isFinished && (
        <>
          {mode === 'single' ? (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center relative space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-700 text-xs font-bold text-cyan-300">
                  波傳播方向：
                  {singleRound?.waveDirection === 'right' ? (
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      👉 向右傳播 <ArrowRight className="w-4 h-4 animate-bounce" />
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      👈 向左傳播 <ArrowLeft className="w-4 h-4 animate-bounce" />
                    </span>
                  )}
                </div>

                {renderWaveCanvas(singleRound, animOffsetSingle, showFinalSingle, actionState === 'fall')}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {singleRound?.title}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {singleRound?.desc}
                  </h3>
                </div>
              </div>

              {/* 答題按鈕區 */}
              <div className={`grid gap-3 ${singleRound?.options.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {singleRound?.options.map((ans) => (
                  <button
                    key={ans}
                    onClick={() => handleSingleAnswer(ans)}
                    disabled={actionState !== 'idle'}
                    className="p-4 rounded-2xl bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500 text-white font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {ans === '向上移動' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                    {ans === '向下移動' && <ArrowDown className="w-4 h-4 text-rose-400" />}
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 雙人 PK 模式 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player 1 */}
              <div className="bg-slate-900/90 border border-indigo-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-300 border-b border-slate-800 pb-2">
                  <span>🔵 Player 1 (第 {p1QIndex} 題)</span>
                  <span className="text-amber-400">
                    {p1Round?.waveDirection === 'right' ? '👉 向右傳播' : '👈 向左傳播'}
                  </span>
                  <span>進度: {p1Progress} / 10</span>
                </div>
                {renderWaveCanvas(p1Round, animOffsetP1, showFinalP1)}
                <p className="text-xs font-bold text-white text-center min-h-[36px] flex items-center justify-center">{p1Round?.desc}</p>
                <div className={`grid gap-2 ${p1Round?.options.length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {p1Round?.options.map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handlePvpAnswer('p1', ans)}
                      className="p-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player 2 */}
              <div className="bg-slate-900/90 border border-rose-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-rose-300 border-b border-slate-800 pb-2">
                  <span>🔴 Player 2 (第 {p2QIndex} 題)</span>
                  <span className="text-amber-400">
                    {p2Round?.waveDirection === 'right' ? '👉 向右傳播' : '👈 向左傳播'}
                  </span>
                  <span>進度: {p2Progress} / 10</span>
                </div>
                {renderWaveCanvas(p2Round, animOffsetP2, showFinalP2)}
                <p className="text-xs font-bold text-white text-center min-h-[36px] flex items-center justify-center">{p2Round?.desc}</p>
                <div className={`grid gap-2 ${p2Round?.options.length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {p2Round?.options.map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handlePvpAnswer('p2', ans)}
                      className="p-3 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {mode === 'single'
                ? progress >= 10 ? '🎉 20F 波動擂台順利抵達終點！' : '⚔️ 擂台對戰結束'
                : p1Progress >= 10 ? '🎉 Player 1 率先抵達終點獲勝！' : '🎉 Player 2 率先抵達終點獲勝！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {progress >= 10 ? '精通「微移法」與週期規律，輕鬆掌控介面質點振動！' : '熟記一週期 = 4/4T 振動一次，微移法能精準推算瞬間移動方向！'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">最終獲得積分：</span>
              <span className="font-bold text-indigo-400">{score} PTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">衝浪推進距離：</span>
              <span className="font-bold text-emerald-400">{mode === 'single' ? progress : Math.max(p1Progress, p2Progress)} / 10 站</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{score + (progress >= 10 ? 100 : progress * 8)}</span>
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