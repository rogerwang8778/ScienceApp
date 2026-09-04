import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Zap, Flame, Timer, Swords, Sparkles, EyeOff, Snowflake } from 'lucide-react';

// 離子清單定義
const IONS = [
  { symbol: 'Na⁺', baseSymbol: 'Na', charge: 1, type: 'cat', color: 'bg-blue-600 border-blue-400 text-blue-100' },
  { symbol: 'K⁺', baseSymbol: 'K', charge: 1, type: 'cat', color: 'bg-indigo-600 border-indigo-400 text-indigo-100' },
  { symbol: 'Ca²⁺', baseSymbol: 'Ca', charge: 2, type: 'cat', color: 'bg-amber-600 border-amber-400 text-amber-100' },
  { symbol: 'Mg²⁺', baseSymbol: 'Mg', charge: 2, type: 'cat', color: 'bg-orange-600 border-orange-400 text-orange-100' },
  { symbol: 'Al³⁺', baseSymbol: 'Al', charge: 3, type: 'cat', color: 'bg-purple-600 border-purple-400 text-purple-100' },
  { symbol: 'Cl⁻', baseSymbol: 'Cl', charge: -1, type: 'ani', color: 'bg-teal-600 border-teal-400 text-teal-100' },
  { symbol: 'NO₃⁻', baseSymbol: 'NO₃', charge: -1, type: 'ani', color: 'bg-emerald-600 border-emerald-400 text-emerald-100' },
  { symbol: 'O²⁻', baseSymbol: 'O', charge: -2, type: 'ani', color: 'bg-rose-600 border-rose-400 text-rose-100' },
  { symbol: 'SO₄²⁻', baseSymbol: 'SO₄', charge: -2, type: 'ani', color: 'bg-pink-600 border-pink-400 text-pink-100' },
  { symbol: 'PO₄³⁻', baseSymbol: 'PO₄', charge: -3, type: 'ani', color: 'bg-red-700 border-red-400 text-red-100' }
];

const GRID_SIZE = 6;

// 隨機生成單個離子球
const getRandomIon = () => {
  const ion = IONS[Math.floor(Math.random() * IONS.length)];
  return { ...ion, id: Math.random().toString(36).substr(2, 9) };
};

// 初始化 6x6 離子盤
const createInitialGrid = () => {
  const grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(getRandomIon());
    }
    grid.push(row);
  }
  return grid;
};

export default function IonCrushGame({ mode = 'single', onGameOver }) {
  // 遊戲時間與狀態
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);

  // 得分與消除計數
  const [p1Score, setP1Score] = useState(0);
  const [p1ClearedCount, setP1ClearedCount] = useState(0);

  const [p2Score, setP2Score] = useState(0);
  const [p2ClearedCount, setP2ClearedCount] = useState(0);

  // 離子棋盤 State
  const [p1Grid, setP1Grid] = useState(createInitialGrid());
  const [p2Grid, setP2Grid] = useState(createInitialGrid());

  // 連線選擇 State
  const [p1Selection, setP1Selection] = useState([]);
  const [p2Selection, setP2Selection] = useState([]);

  // 沉澱狀態：紀錄哪幾排（Row Index 0~5）處於沉澱封鎖中
  const [p1PrecipitatedRows, setP1PrecipitatedRows] = useState([]);
  const [p2PrecipitatedRows, setP2PrecipitatedRows] = useState([]);

  const isDraggingP1 = useRef(false);
  const isDraggingP2 = useRef(false);

  // 防止同一動作多重呼叫的 Ref 鎖
  const isProcessingP1 = useRef(false);
  const isProcessingP2 = useRef(false);

  // 反饋訊息
  const [p1Msg, setP1Msg] = useState('');
  const [p2Msg, setP2Msg] = useState('');

  // 技能次數與倒數狀態
  const [p1SkillCharges, setP1SkillCharges] = useState(0);
  const [p2SkillCharges, setP2SkillCharges] = useState(0);

  const [p1BlindTimer, setP1BlindTimer] = useState(0); // P1 被遮蔽倒數 (秒)
  const [p2BlindTimer, setP2BlindTimer] = useState(0); // P2 被遮蔽倒數 (秒)

  // 60 秒倒數計時器
  useEffect(() => {
    let timer = null;
    if (!isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  // 技能遮蔽倒數計時器
  useEffect(() => {
    let blindInterval = null;
    if (!isFinished) {
      blindInterval = setInterval(() => {
        setP1BlindTimer((prev) => Math.max(0, prev - 1));
        setP2BlindTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(blindInterval);
  }, [isFinished]);

  // 單人模式滿 15 組通關判定
  useEffect(() => {
    if (mode === 'single' && p1ClearedCount >= 15 && !isFinished) {
      setIsFinished(true);
    }
  }, [p1ClearedCount, mode, isFinished]);

  // 主動發動障眼法技能 (扣除 1 次次數，讓對手隱藏價數 10 秒)
  const handleUseSkill = (player) => {
    if (mode !== 'pvp' || isFinished) return;

    if (player === 'p1' && p1SkillCharges > 0) {
      setP1SkillCharges((prev) => prev - 1);
      setP2BlindTimer((prev) => prev + 10);
      setP1Msg('🌀 發動【障眼法】！對手價數隱藏 10 秒！');
      setTimeout(() => setP1Msg(''), 2000);
    } else if (player === 'p2' && p2SkillCharges > 0) {
      setP2SkillCharges((prev) => prev - 1);
      setP1BlindTimer((prev) => prev + 10);
      setP2Msg('🌀 發動【障眼法】！對手價數隱藏 10 秒！');
      setTimeout(() => setP2Msg(''), 2000);
    }
  };

  // 判斷兩位置是否相鄰 (包含對角)
  const isAdjacent = (pos1, pos2) => {
    const dr = Math.abs(pos1.r - pos2.r);
    const dc = Math.abs(pos1.c - pos2.c);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  };

  // 處理離子球點擊/劃線選取
  const handleTileTouch = (player, r, c) => {
    if (isFinished) return;

    const isP1 = player === 'p1';
    const precipitatedRows = isP1 ? p1PrecipitatedRows : p2PrecipitatedRows;

    // 若該排處於沉澱凍結狀態，無法選取！
    if (precipitatedRows.includes(r)) return;

    const grid = isP1 ? p1Grid : p2Grid;
    const selection = isP1 ? p1Selection : p2Selection;
    const setSelection = isP1 ? setP1Selection : setP2Selection;

    const ion = grid[r][c];
    const existingIndex = selection.findIndex((item) => item.r === r && item.c === c);

    if (existingIndex !== -1) {
      if (existingIndex === selection.length - 2) {
        setSelection(selection.slice(0, selection.length - 1));
      }
      return;
    }

    if (selection.length === 0) {
      setSelection([{ r, c, ion }]);
    } else {
      const last = selection[selection.length - 1];
      if (isAdjacent(last, { r, c })) {
        setSelection([...selection, { r, c, ion }]);
      }
    }
  };

  // 驗證連線是否滿足「電荷總和 = 0」且包含正負離子
  const validateAndClear = (player) => {
    const isP1 = player === 'p1';
    const processingRef = isP1 ? isProcessingP1 : isProcessingP2;

    if (processingRef.current) return;
    processingRef.current = true;

    const selection = isP1 ? p1Selection : p2Selection;
    const setSelection = isP1 ? setP1Selection : setP2Selection;
    const grid = isP1 ? p1Grid : p2Grid;
    const setGrid = isP1 ? setP1Grid : setP2Grid;
    const setClearedCount = isP1 ? setP1ClearedCount : setP2ClearedCount;
    const setScore = isP1 ? setP1Score : setP2Score;
    const setMsg = isP1 ? setP1Msg : setP2Msg;
    const setSkillCharges = isP1 ? setP1SkillCharges : setP2SkillCharges;

    const myPrecipitatedRows = isP1 ? p1PrecipitatedRows : p2PrecipitatedRows;
    const setMyPrecipitatedRows = isP1 ? setP1PrecipitatedRows : setP2PrecipitatedRows;
    const setOpponentPrecipitatedRows = isP1 ? setP2PrecipitatedRows : setP1PrecipitatedRows;

    if (selection.length < 2) {
      setSelection([]);
      processingRef.current = false;
      return;
    }

    const totalCharge = selection.reduce((sum, item) => sum + item.ion.charge, 0);
    const hasCat = selection.some((item) => item.ion.type === 'cat');
    const hasAni = selection.some((item) => item.ion.type === 'ani');

    if (totalCharge === 0 && hasCat && hasAni) {
      // === 消除成功 ===
      const comboCount = selection.length;

      // 檢查是否包含 Ca²⁺ 與 SO₄²⁻ 生成硫酸鈣沉澱 (CaSO₄)
      const hasCa = selection.some((item) => item.ion.baseSymbol === 'Ca');
      const hasSO4 = selection.some((item) => item.ion.baseSymbol === 'SO₄');
      const isPrecipitateCombo = hasCa && hasSO4;

      // 若生成硫酸鈣沉澱，隨機對對方一排施加沉澱狀態
      if (mode === 'pvp' && isPrecipitateCombo) {
        const randomRow = Math.floor(Math.random() * GRID_SIZE);
        setOpponentPrecipitatedRows((prev) => {
          if (!prev.includes(randomRow)) return [...prev, randomRow];
          return prev;
        });
      }

      // 解除自己的沉澱物判定：若消除的格子包含「沉澱排」的相鄰排（r-1 或 r+1）
      if (myPrecipitatedRows.length > 0) {
        const selectedRows = selection.map((item) => item.r);
        const rowsToUnlock = myPrecipitatedRows.filter((pRow) =>
          selectedRows.some((sRow) => Math.abs(sRow - pRow) === 1)
        );

        if (rowsToUnlock.length > 0) {
          setMyPrecipitatedRows((prev) => prev.filter((r) => !rowsToUnlock.includes(r)));
        }
      }

      // 1. 若單次消除 >= 5 顆，觸發 5 秒障眼法
      if (mode === 'pvp' && comboCount >= 5) {
        if (isP1) setP2BlindTimer((prev) => prev + 5);
        else setP1BlindTimer((prev) => prev + 5);
      }

      // 2. 累計消除組數與訊息判定
      setClearedCount((prevCount) => {
        const nextCount = prevCount + 1;
        const prevMilestone = Math.floor(prevCount / 5);
        const nextMilestone = Math.floor(nextCount / 5);

        if (mode === 'pvp' && isPrecipitateCombo) {
          setMsg(`🧊 生成 CaSO₄ 硫酸鈣沉澱！對手隨機一排被沉澱凍結！`);
        } else if (mode === 'pvp' && comboCount >= 5) {
          setMsg(`⚡ 單次消 5 顆以上！對手價數隱藏 5 秒！`);
        } else if (nextMilestone > prevMilestone) {
          setSkillCharges((charges) => charges + 1);
          setMsg(`⚡ 電中性！技能充能完成 (+1 次障眼法)！`);
        } else {
          setMsg(`⚡ 電中性！消除 ${comboCount} 個離子！`);
        }
        return nextCount;
      });

      setScore((prev) => prev + comboCount * 20);
      setTimeout(() => setMsg(''), 1800);

      // 複製 Grid 並清空選中項
      const newGrid = grid.map((row) => [...row]);
      selection.forEach(({ r, c }) => {
        newGrid[r][c] = null;
      });

      // 離子球由上方落下遞補 (Drop & Refill)
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptyCount = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newGrid[r][c] === null) {
            emptyCount++;
          } else if (emptyCount > 0) {
            newGrid[r + emptyCount][c] = newGrid[r][c];
            newGrid[r][c] = null;
          }
        }
        for (let r = 0; r < emptyCount; r++) {
          newGrid[r][c] = getRandomIon();
        }
      }

      setGrid(newGrid);
    } else {
      // === 電荷不平衡 ===
      setMsg(`❌ 電荷總和 = ${totalCharge > 0 ? `+${totalCharge}` : totalCharge} (非電中性)`);
      setTimeout(() => setMsg(''), 1200);
    }

    setSelection([]);
    processingRef.current = false;
  };

  const handleExit = () => {
    const gainedExp = p1Score + (p1ClearedCount >= 15 ? 100 : 20);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染獨立 6x6 離子消除盤面
  const renderBoard = (player, grid, selection, msg, clearedCount, score) => {
    const isP1 = player === 'p1';
    const currentCharge = selection.reduce((sum, item) => sum + item.ion.charge, 0);

    const isBlinded = isP1 ? p1BlindTimer > 0 : p2BlindTimer > 0;
    const blindTimer = isP1 ? p1BlindTimer : p2BlindTimer;

    const skillCharges = isP1 ? p1SkillCharges : p2SkillCharges;
    const precipitatedRows = isP1 ? p1PrecipitatedRows : p2PrecipitatedRows;

    return (
      <div className={`p-4 rounded-3xl border space-y-3 relative overflow-hidden ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        {/* 被障眼法迷霧遮蔽提示標籤 */}
        {isBlinded && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xl border border-purple-300 animate-bounce flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-amber-300" />
            障眼法作用中！價數隱藏 ({blindTimer}s)
          </div>
        )}

        {/* 面板標頭與成績 */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
              isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
            }`}>
              {isP1 ? '🛡️ Player 1 (左側選手)' : '⚔️ Player 2 (右側選手)'}
            </span>

            {/* 技能按鈕 */}
            {mode === 'pvp' && (
              <button
                onClick={() => handleUseSkill(player)}
                disabled={skillCharges === 0}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                  skillCharges > 0
                    ? 'bg-purple-600 text-white border-purple-400 hover:bg-purple-500 shadow-lg animate-pulse cursor-pointer active:scale-95'
                    : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                {skillCharges > 0
                  ? `🌀 障眼法技能 (可對敵 ${skillCharges} 次)`
                  : `🌀 充能中 (${clearedCount % 5}/5)`}
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">已消除：</span>
            <span className="text-base font-black font-mono text-amber-400">{clearedCount} 組</span>
          </div>
        </div>

        {/* 當前連線電荷計算動態提示 */}
        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">目前選取離子總電荷：</span>
          <span className={`font-mono text-sm font-black ${
            currentCharge === 0 && selection.length > 0 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
          }`}>
            {currentCharge > 0 ? `+${currentCharge}` : currentCharge}
          </span>
        </div>

        {/* 6x6 離子棋盤 */}
        <div
          className="grid grid-cols-6 gap-1.5 bg-slate-950 p-2 rounded-2xl border border-slate-800 touch-none select-none"
          onMouseUp={() => {
            if (isP1) isDraggingP1.current = false;
            else isDraggingP2.current = false;
            validateAndClear(player);
          }}
          onTouchEnd={() => {
            if (isP1) isDraggingP1.current = false;
            else isDraggingP2.current = false;
            validateAndClear(player);
          }}
        >
          {grid.map((row, r) => {
            const isRowPrecipitated = precipitatedRows.includes(r);

            return row.map((ion, c) => {
              const isSelected = selection.some((item) => item.r === r && item.c === c);
              return (
                <button
                  key={`${r}-${c}`}
                  disabled={isRowPrecipitated}
                  onMouseDown={() => {
                    if (isP1) isDraggingP1.current = true;
                    else isDraggingP2.current = true;
                    handleTileTouch(player, r, c);
                  }}
                  onMouseEnter={() => {
                    if ((isP1 && isDraggingP1.current) || (!isP1 && isDraggingP2.current)) {
                      handleTileTouch(player, r, c);
                    }
                  }}
                  onTouchStart={() => {
                    if (isP1) isDraggingP1.current = true;
                    else isDraggingP2.current = true;
                    handleTileTouch(player, r, c);
                  }}
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl font-black text-xs md:text-sm border-2 flex items-center justify-center transition-all cursor-pointer relative ${
                    isRowPrecipitated
                      ? 'bg-slate-800/90 border-slate-600 text-slate-500 cursor-not-allowed opacity-60'
                      : ion.color
                  } ${
                    isSelected
                      ? 'ring-4 ring-amber-300 scale-110 z-20 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
                      : 'hover:scale-105 opacity-90'
                  }`}
                >
                  {/* 若排被沉澱凍結，呈現雪花結晶覆蓋狀態 */}
                  {isRowPrecipitated ? (
                    <Snowflake className="w-5 h-5 text-cyan-300 animate-spin" />
                  ) : (
                    isBlinded ? ion.baseSymbol : ion.symbol
                  )}
                </button>
              );
            });
          })}
        </div>

        {/* 消除反饋訊息 */}
        <div className="h-6 text-center text-xs font-bold">
          {msg ? (
            <span className={msg.includes('🧊') ? 'text-cyan-300 animate-bounce' : msg.includes('⚡') ? 'text-emerald-400 animate-bounce' : 'text-rose-400'}>
              {msg}
            </span>
          ) : (
            <span className="text-slate-500">劃線連續選取相鄰離子，電荷總和 = 0 消除</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 50F ({mode === 'pvp' ? '雙人同屏消除 PK' : '單人闖關'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🧪 50F 化合物擂台：電中性離子連連看
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">倒數計時</p>
            <p className={`text-base font-mono font-bold ${timeLeft <= 10 ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>
      </div>

      {/* 遊戲說明 */}
      {!isFinished && (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-center text-xs space-y-1">
          <p className="font-bold text-amber-300">
            🎯 電中性規則：連結相鄰離子，使「正負電荷總和恰好 = 0」即可消除！
          </p>
          <p className="text-slate-400 text-[11px]">
            {mode === 'single'
              ? '60 秒內消除 15 組離子化合物即可通關！'
              : '🧊 沉澱Combo：消除 Ca²⁺ 與 SO₄²⁻ (CaSO₄) 可隨機封鎖對手一排！在相鄰排消除即可解凍！'}
          </p>
        </div>
      )}

      {/* 消除面板區域 */}
      {!isFinished && (
        mode === 'pvp' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 左側 P1 */}
            {renderBoard('p1', p1Grid, p1Selection, p1Msg, p1ClearedCount, p1Score)}
            {/* 右側 P2 */}
            {renderBoard('p2', p2Grid, p2Selection, p2Msg, p2ClearedCount, p2Score)}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {renderBoard('p1', p1Grid, p1Selection, p1Msg, p1ClearedCount, p1Score)}
          </div>
        )
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {mode === 'single'
                ? p1ClearedCount >= 15 ? '🎉 50F 化合物擂台突破成功！' : '⚔️ 擂台時間到！'
                : p1ClearedCount > p2ClearedCount ? '🎉 Player 1 (左側) 消除勝出！' : p2ClearedCount > p1ClearedCount ? '🎉 Player 2 (右側) 消除勝出！' : '🤝 雙方平手！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              熟記陽離子與陰離子價數，形成電中性化合物！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 成功消除：</span>
              <span className="font-bold text-amber-400">{p1ClearedCount} 組</span>
            </div>
            {mode === 'pvp' && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">P2 成功消除：</span>
                <span className="font-bold text-rose-400">{p2ClearedCount} 組</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{p1Score + (p1ClearedCount >= 15 ? 100 : 20)}</span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 返回競技場大廳
          </button>
        </div>
      )}
    </div>
  );
}