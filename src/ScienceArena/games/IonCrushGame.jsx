import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Zap, Flame, Timer, Swords, Sparkles, CheckCircle2 } from 'lucide-react';

// 離子清單定義
const IONS = [
  { symbol: 'Na⁺', charge: 1, type: 'cat', color: 'bg-blue-600 border-blue-400 text-blue-100' },
  { symbol: 'K⁺', charge: 1, type: 'cat', color: 'bg-indigo-600 border-indigo-400 text-indigo-100' },
  { symbol: 'Ca²⁺', charge: 2, type: 'cat', color: 'bg-amber-600 border-amber-400 text-amber-100' },
  { symbol: 'Mg²⁺', charge: 2, type: 'cat', color: 'bg-orange-600 border-orange-400 text-orange-100' },
  { symbol: 'Al³⁺', charge: 3, type: 'cat', color: 'bg-purple-600 border-purple-400 text-purple-100' },
  { symbol: 'Cl⁻', charge: -1, type: 'ani', color: 'bg-teal-600 border-teal-400 text-teal-100' },
  { symbol: 'NO₃⁻', charge: -1, type: 'ani', color: 'bg-emerald-600 border-emerald-400 text-emerald-100' },
  { symbol: 'O²⁻', charge: -2, type: 'ani', color: 'bg-rose-600 border-rose-400 text-rose-100' },
  { symbol: 'SO₄²⁻', charge: -2, type: 'ani', color: 'bg-pink-600 border-pink-400 text-pink-100' },
  { symbol: 'PO₄³⁻', charge: -3, type: 'ani', color: 'bg-red-700 border-red-400 text-red-100' }
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
  const [p1Selection, setP1Selection] = useState([]); // [{r, c, ion}]
  const [p2Selection, setP2Selection] = useState([]);

  const isDraggingP1 = useRef(false);
  const isDraggingP2 = useRef(false);

  // 反饋訊息
  const [p1Msg, setP1Msg] = useState('');
  const [p2Msg, setP2Msg] = useState('');

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

  // 單人模式滿 15 組判定
  useEffect(() => {
    if (mode === 'single' && p1ClearedCount >= 15 && !isFinished) {
      setIsFinished(true);
    }
  }, [p1ClearedCount, mode, isFinished]);

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
    const grid = isP1 ? p1Grid : p2Grid;
    const selection = isP1 ? p1Selection : p2Selection;
    const setSelection = isP1 ? setP1Selection : setP2Selection;

    const ion = grid[r][c];
    const existingIndex = selection.findIndex((item) => item.r === r && item.c === c);

    if (existingIndex !== -1) {
      // 若點選已選擇的倒數第二個，則退回上一步
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
    const selection = isP1 ? p1Selection : p2Selection;
    const setSelection = isP1 ? setP1Selection : setP2Selection;
    const grid = isP1 ? p1Grid : p2Grid;
    const setGrid = isP1 ? setP1Grid : setP2Grid;
    const setClearedCount = isP1 ? setP1ClearedCount : setP2ClearedCount;
    const setScore = isP1 ? setP1Score : setP2Score;
    const setMsg = isP1 ? setP1Msg : setP2Msg;

    if (selection.length < 2) {
      setSelection([]);
      return;
    }

    const totalCharge = selection.reduce((sum, item) => sum + item.ion.charge, 0);
    const hasCat = selection.some((item) => item.ion.type === 'cat');
    const hasAni = selection.some((item) => item.ion.type === 'ani');

    if (totalCharge === 0 && hasCat && hasAni) {
      // === 消除成功 ===
      const comboCount = selection.length;
      setClearedCount((prev) => prev + 1);
      setScore((prev) => prev + comboCount * 20);

      setMsg(`⚡ 正負電抵銷電中性！消除 ${comboCount} 個離子！`);
      setTimeout(() => setMsg(''), 1500);

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
      // === 電荷不平或缺乏正負離子 ===
      setMsg(`❌ 電荷總和 = ${totalCharge > 0 ? `+${totalCharge}` : totalCharge} (非電中性)`);
      setTimeout(() => setMsg(''), 1200);
    }

    setSelection([]);
  };

  const handleExit = () => {
    const gainedExp = p1Score + (p1ClearedCount >= 15 ? 100 : 20);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染獨立 6x6 離子消除盤面
  const renderBoard = (player, grid, selection, msg, clearedCount, score) => {
    const isP1 = player === 'p1';
    const currentCharge = selection.reduce((sum, item) => sum + item.ion.charge, 0);

    return (
      <div className={`p-4 rounded-3xl border space-y-3 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        {/* 面板標頭與成績 */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🛡️ Player 1 (左側選手)' : '⚔️ Player 2 (右側選手)'}
          </span>
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
            if (isP1) { isDraggingP1.current = false; validateAndClear('p1'); }
            else { isDraggingP2.current = false; validateAndClear('p2'); }
          }}
          onTouchEnd={() => {
            if (isP1) { isDraggingP1.current = false; validateAndClear('p1'); }
            else { isDraggingP2.current = false; validateAndClear('p2'); }
          }}
        >
          {grid.map((row, r) =>
            row.map((ion, c) => {
              const isSelected = selection.some((item) => item.r === r && item.c === c);
              return (
                <button
                  key={`${r}-${c}`}
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
                  className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl font-black text-xs md:text-sm border-2 flex items-center justify-center transition-all cursor-pointer ${
                    ion.color
                  } ${
                    isSelected
                      ? 'ring-4 ring-amber-300 scale-110 z-20 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
                      : 'hover:scale-105 opacity-90'
                  }`}
                >
                  {ion.symbol}
                </button>
              );
            })
          )}
        </div>

        {/* 消除反饋訊息 */}
        <div className="h-6 text-center text-xs font-bold">
          {msg ? (
            <span className={msg.includes('⚡') ? 'text-emerald-400 animate-bounce' : 'text-rose-400'}>
              {msg}
            </span>
          ) : (
            <span className="text-slate-500">用手指/滑鼠劃線連續選取相鄰離子</span>
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
            🎯 電中性規則：連結相鄰的離子球，使「正負電荷總和恰好 = 0」即可消除！
          </p>
          <p className="text-slate-400 text-[11px]">
            {mode === 'single' ? '60 秒內消除 15 組離子化合物即可通關！' : '60 秒內消除組數較多者獲得勝利！'}
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