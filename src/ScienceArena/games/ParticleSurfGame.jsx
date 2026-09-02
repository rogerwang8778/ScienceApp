import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Waves, Play } from 'lucide-react';

export default function ParticleSurfGame({ mode = 'single', onGameOver }) {
  // 單人模式狀態 (以進度 Progress 代替原本扣血，滿 10 次達終點)
  const [progress, setProgress] = useState(0); // 0 ~ 10
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // 雙人 PK 模式獨立進度
  const [p1Progress, setP1Progress] = useState(0); // 0 ~ 10
  const [p2Progress, setP2Progress] = useState(0); // 0 ~ 10
  const [p1Round, setP1Round] = useState(null);
  const [p2Round, setP2Round] = useState(null);

  // 當前回合與視覺動態狀態
  const [singleRound, setSingleRound] = useState(null);
  const [actionState, setActionState] = useState('idle'); // 'idle' | 'success' | 'fall'
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // ==========================================
  // 1. 波動題目生成器 (微移法邏輯)
  // ==========================================
  const generateParticleQuestion = (currentLvl) => {
    // 波傳播方向：'right' (向右) 或 'left' (向左)
    const waveDirection = Math.random() > 0.5 ? 'right' : 'left';
    
    // 質點位置選定 (以正弦波相位 X 軸刻度 0 ~ 360 度表示)
    // 0: 平衡點(升) | 90: 波峰 | 180: 平衡點(降) | 270: 波谷
    // 入門 (Lvl 1-2): 剛好選在 0, 90, 180, 270 四個特殊位置
    // 進階 (Lvl 3+): 選在 45, 135, 225, 315 等斜率點，專門考上下運動方向
    const easyPhases = [0, 90, 180, 270];
    const hardPhases = [45, 135, 225, 315];
    
    const phaseList = currentLvl <= 2 ? easyPhases : (Math.random() > 0.4 ? hardPhases : easyPhases);
    const particlePhase = phaseList[Math.floor(Math.random() * phaseList.length)];

    // 提問類型：'direction' (瞬間運動方向：向上/向下/靜止) 或 'position' (隨後位置：波峰/波谷/平衡)
    const qType = particlePhase % 90 === 0 ? 'position' : 'direction';

    // 理化「微移法」判斷質點瞬間運動方向：
    // 若波向右傳 (sin(x - dx))：
    //   x 在 (0, 90) 或 (270, 360) 時，微移後波形較高 ➔ 質點【向上】
    //   x 在 (90, 270) 時，微移後波形較低 ➔ 質點【向下】
    // 若波向左傳 (sin(x + dx))，方向剛好相反
    let correctAns = '';

    if (qType === 'position') {
      if (particlePhase === 90) correctAns = '波峰';
      else if (particlePhase === 270) correctAns = '波谷';
      else correctAns = '平衡位置';
    } else {
      // 運動方向判斷
      if (waveDirection === 'right') {
        if (particlePhase === 45 || particlePhase === 315) correctAns = '向上移動';
        else correctAns = '向下移動';
      } else {
        if (particlePhase === 45 || particlePhase === 315) correctAns = '向下移動';
        else correctAns = '向上移動';
      }
    }

    return {
      waveDirection,
      particlePhase, // 質點 X 軸相位
      qType,
      correctAns,
      particleName: particlePhase === 90 ? '波峰衝浪手' : particlePhase === 270 ? '波谷衝浪手' : '介面質點 P'
    };
  };

  const generateNextRounds = (lvl) => {
    if (mode === 'single') {
      setSingleRound(generateParticleQuestion(lvl));
    } else {
      setP1Round(generateParticleQuestion(lvl));
      setP2Round(generateParticleQuestion(lvl));
    }
    setShowAnalysis(false);
  };

  useEffect(() => {
    generateNextRounds(1);
  }, [mode]);

  // 單人模式倒數計時器
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
  // 2. 作答處理與落水 / 推進動畫
  // ==========================================
  const handleSingleAnswer = (userAns) => {
    if (actionState !== 'idle' || isFinished) return;

    const isCorrect = userAns === singleRound.correctAns;

    if (isCorrect) {
      setActionState('success');
      setShowAnalysis(true);
      const nextProg = progress + 1;
      const nextLvl = level + 1;
      setProgress(nextProg);
      setLevel(nextLvl);
      setScore((prev) => prev + 30);

      if (nextProg >= 10) {
        setTimeout(() => setIsFinished(true), 1200);
      } else {
        setTimeout(() => {
          setActionState('idle');
          generateNextRounds(nextLvl);
        }, 1400);
      }
    } else {
      setActionState('fall');
      setShowAnalysis(true);
      setProgress((prev) => Math.max(0, prev - 1)); // 答錯被浪退後

      setTimeout(() => {
        setActionState('idle');
        generateNextRounds(level);
      }, 1600);
    }
  };

  // 雙人 PK 答題處理
  const handlePvpAnswer = (player, userAns) => {
    if (isFinished) return;

    const round = player === 'p1' ? p1Round : p2Round;
    const isCorrect = userAns === round.correctAns;

    if (player === 'p1') {
      if (isCorrect) {
        const next = p1Progress + 1;
        setP1Progress(next);
        if (next >= 10) setIsFinished(true);
        else setP1Round(generateParticleQuestion(level));
      } else {
        setP1Progress((prev) => Math.max(0, prev - 1));
        setP1Round(generateParticleQuestion(level));
      }
    } else {
      if (isCorrect) {
        const next = p2Progress + 1;
        setP2Progress(next);
        if (next >= 10) setIsFinished(true);
        else setP2Round(generateParticleQuestion(level));
      } else {
        setP2Progress((prev) => Math.max(0, prev - 1));
        setP2Round(generateParticleQuestion(level));
      }
    }
  };

  const handleExit = () => {
    const gainedExp = score + (progress >= 10 ? 100 : progress * 8);
    if (onGameOver) onGameOver(gainedExp);
  };

  // ==========================================
  // 3. SVG 波形與質點與「微移軌跡」渲染元件
  // ==========================================
  const renderWaveCanvas = (roundData, isFallAnimation = false) => {
    if (!roundData) return null;

    // 波形繪製參數
    const width = 340;
    const height = 120;
    const centerY = 60;
    const amplitude = 35;

    // 計算質點 X, Y 座標
    const particleX = (roundData.particlePhase / 360) * width;
    const particleY = centerY - Math.sin((roundData.particlePhase * Math.PI) / 180) * amplitude;

    // 微移法虛線波形 X 軸偏移量 (向右移 +15px，向左移 -15px)
    const shiftDx = roundData.waveDirection === 'right' ? 15 : -15;

    // 微移後的質點 Y 座標
    const shiftedPhase = roundData.particlePhase - (roundData.waveDirection === 'right' ? 15 : -15);
    const shiftedParticleY = centerY - Math.sin((shiftedPhase * Math.PI) / 180) * amplitude;

    return (
      <div className="relative w-full flex justify-center items-center py-2">
        <svg width={width} height={height} className="overflow-visible">
          {/* 1. 平衡位置基準線 */}
          <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />

          {/* 2. 原始主波形 (藍色實線) */}
          <path
            d={`M 0 ${centerY - Math.sin(0) * amplitude} 
               Q ${width * 0.25} ${centerY - amplitude * 1.4}, ${width * 0.5} ${centerY} 
               T ${width} ${centerY}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
          />

          {/* 3. 「微移法」解析虛線波形 (顯示解析或答對動態時印出) */}
          {showAnalysis && (
            <path
              d={`M ${shiftDx} ${centerY - Math.sin(0) * amplitude} 
                 Q ${width * 0.25 + shiftDx} ${centerY - amplitude * 1.4}, ${width * 0.5 + shiftDx} ${centerY} 
                 T ${width + shiftDx} ${centerY}`}
              fill="none"
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth="2.5"
              className="animate-pulse"
            />
          )}

          {/* 4. 微移垂直指示箭頭 (顯示質點真正移動軌跡) */}
          {showAnalysis && (
            <line
              x1={particleX}
              y1={particleY}
              x2={particleX}
              y2={shiftedParticleY}
              stroke="#ef4444"
              strokeWidth="3"
              markerEnd="url(#arrow)"
            />
          )}

          {/* 5. 衝浪手質點 (若落水則往下掉) */}
          <g
            transform={`translate(${particleX}, ${
              isFallAnimation ? particleY + 40 : particleY
            })`}
            className="transition-all duration-500"
          >
            <circle r="9" fill={isFallAnimation ? '#ef4444' : '#f59e0b'} className="animate-ping opacity-75" />
            <circle r="7" fill={isFallAnimation ? '#ef4444' : '#fbbf24'} stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#ffffff" fontSize="14" className="select-none">
              {isFallAnimation ? '🏊‍♂️' : '🏄‍♂️'}
            </text>
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
            <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 20F ({mode === 'pvp' ? '雙人 PK 競速' : '單人闖關'})
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              難度 Lvl.{level}
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

      {/* 單人模式專屬：衝浪推進軌道 (進度條 0 ~ 10 次) */}
      {mode === 'single' && !isFinished && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-cyan-300 flex items-center gap-1">
              <Waves className="w-4 h-4" /> 衝浪推進距離：
            </span>
            <span className="text-amber-400 font-mono">{progress} / 10 站 (抵達終點獲勝)</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 p-0.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(progress / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 核心舞台：單人與 PK 模式分流 */}
      {!isFinished && (
        <>
          {mode === 'single' ? (
            /* === 單人模式戰場 === */
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center relative">
                {/* 波傳播方向箭頭動態提示 */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-700 text-xs font-bold text-cyan-300 mb-2">
                  波傳播方向：
                  {singleRound?.waveDirection === 'right' ? (
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      向右傳播 ➔ <ArrowRight className="w-4 h-4 animate-bounce" />
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-black">
                      🧲 向左傳播 <ArrowLeft className="w-4 h-4 animate-bounce" />
                    </span>
                  )}
                </div>

                {/* SVG 波形畫布 */}
                {renderWaveCanvas(singleRound, actionState === 'fall')}

                <p className="text-sm font-bold text-white mt-2">
                  🎯 提示指令：請預測衝浪手（質點 P）此刻的
                  <span className="text-amber-300 underline underline-offset-4 ml-1">
                    {singleRound?.qType === 'position' ? '下一個位置' : '瞬間運動方向'}
                  </span>
                  ！
                </p>
              </div>

              {/* 單人模式：大按鈕回答區 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {singleRound?.qType === 'position' ? (
                  ['波峰', '波谷', '平衡位置'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleSingleAnswer(ans)}
                      disabled={actionState !== 'idle'}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-cyan-600/20 border border-slate-800 hover:border-cyan-500 text-white font-black text-base transition-all cursor-pointer disabled:opacity-50"
                    >
                      {ans}
                    </button>
                  ))
                ) : (
                  ['向上移動', '向下移動'].map((ans) => (
                    <button
                      key={ans}
                      onClick={() => handleSingleAnswer(ans)}
                      disabled={actionState !== 'idle'}
                      className="p-5 rounded-2xl bg-slate-900 hover:bg-amber-600/20 border border-slate-800 hover:border-amber-500 text-white font-black text-base transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {ans === '向上移動' ? <ArrowUp className="w-5 h-5 text-emerald-400" /> : <ArrowDown className="w-5 h-5 text-rose-400" />}
                      {ans}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* === 雙人 PK 模式戰場 (左右獨立區域搶答) === */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Player 1 */}
              <div className="bg-slate-900/90 border border-indigo-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-300 border-b border-slate-800 pb-2">
                  <span>🔵 Player 1</span>
                  <span>衝浪進度: {p1Progress} / 10</span>
                </div>
                {renderWaveCanvas(p1Round)}
                <div className="grid grid-cols-2 gap-2">
                  {['向上移動', '向下移動'].map((ans) => (
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

              {/* Right: Player 2 */}
              <div className="bg-slate-900/90 border border-rose-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-rose-300 border-b border-slate-800 pb-2">
                  <span>🔴 Player 2</span>
                  <span>衝浪進度: {p2Progress} / 10</span>
                </div>
                {renderWaveCanvas(p2Round)}
                <div className="grid grid-cols-2 gap-2">
                  {['向上移動', '向下移動'].map((ans) => (
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
              {progress >= 10 ? '精通「微移法」繪製，輕鬆掌握波形與質點振動方向！' : '記住：波前進時，介面質點只會在原地上下介面振動！'}
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