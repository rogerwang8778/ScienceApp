import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Plus, Trash2, Sliders, RefreshCw } from 'lucide-react';

export default function CircuitLab() {
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 互動選擇狀態
  const [selectedNode, setSelectedNode] = useState(null); // 目前點選的第一個網格點 {x, y}
  const [selectedResistorId, setSelectedResistorId] = useState('r1');

  // 電阻清單：每個電阻標註兩端點 nodeA(x,y) 與 nodeB(x,y)
  // 預設擺放一個簡單電路 (R1: 0,0->2,0; R2: 2,0->4,0; R3: 2,0->2,2 與 R2 並聯跨接; R4: 4,0->6,0)
  const [resistors, setResistors] = useState([
    { id: 'r1', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 2, y: 0 } },
    { id: 'r2', name: 'R2', value: 6, nA: { x: 2, y: 0 }, nB: { x: 4, y: 0 } },
    { id: 'r3', name: 'R3', value: 12, nA: { x: 2, y: 0 }, nB: { x: 4, y: 0 } }, // 與 R2 並聯
    { id: 'r4', name: 'R4', value: 6, nA: { x: 4, y: 0 }, nB: { x: 6, y: 0 } },
  ]);

  // 網格點點擊事件（建立電阻）
  const handleNodeClick = (x, y) => {
    if (!selectedNode) {
      setSelectedNode({ x, y });
    } else {
      // 點擊第二個點，若非同一點則建立電阻
      if (selectedNode.x !== x || selectedNode.y !== y) {
        const newIdx = resistors.length + 1;
        const newRes = {
          id: `r${Date.now().toString().slice(-4)}`,
          name: `R${newIdx}`,
          value: 6,
          nA: { x: selectedNode.x, y: selectedNode.y },
          nB: { x, y }
        };
        setResistors([...resistors, newRes]);
        setSelectedResistorId(newRes.id);
      }
      setSelectedNode(null);
    }
  };

  const removeResistor = (id) => {
    if (resistors.length > 1) {
      const nextList = resistors.filter(r => r.id !== id);
      setResistors(nextList);
      if (selectedResistorId === id) {
        setSelectedResistorId(nextList[0].id);
      }
    }
  };

  const updateResistorVal = (id, val) => {
    setResistors(resistors.map(r => r.id === id ? { ...r, value: Math.max(1, val) } : r));
  };

  // 重設為空白麵包板
  const resetBoard = () => {
    setResistors([
      { id: 'r1', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 6, y: 0 } }
    ]);
    setSelectedNode(null);
  };

  // ==========================================
  // KCL 網路圖學求解 (Node Voltage Analysis)
  // ==========================================
  // 1. 收集所有不重複的節點 key "x,y"
  const nodeKeysSet = new Set(['0,0', '6,0']); // 0,0 為正極 (V_source), 6,0 為負極 (0V)
  resistors.forEach(r => {
    nodeKeysSet.add(`${r.nA.x},${r.nA.y}`);
    nodeKeysSet.add(`${r.nB.x},${r.nB.y}`);
  });
  const allNodeKeys = Array.from(nodeKeysSet);

  // 內部未知電位節點
  const unknownNodes = allNodeKeys.filter(k => k !== '0,0' && k !== '6,0');
  const N = unknownNodes.length;

  let G = Array(N).fill(0).map(() => Array(N).fill(0));
  let B_vec = Array(N).fill(0);

  resistors.forEach(r => {
    const g = 1 / r.value;
    const kA = `${r.nA.x},${r.nA.y}`;
    const kB = `${r.nB.x},${r.nB.y}`;

    const idxA = unknownNodes.indexOf(kA);
    const idxB = unknownNodes.indexOf(kB);

    if (idxA !== -1) {
      G[idxA][idxA] += g;
      if (idxB !== -1) G[idxA][idxB] -= g;
      if (kB === '0,0') B_vec[idxA] += g * vSource;
    }

    if (idxB !== -1) {
      G[idxB][idxB] += g;
      if (idxA !== -1) G[idxB][idxA] -= g;
      if (kA === '0,0') B_vec[idxB] += g * vSource;
    }
  });

  // 高斯消去解未知節點電位
  const solveLinear = (A_mat, b_arr) => {
    let n = b_arr.length;
    if (n === 0) return [];
    let A = A_mat.map(row => [...row]);
    let x = [...b_arr];

    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < n; k++) {
        let tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      let tmp = x[maxRow];
      x[maxRow] = x[i];
      x[i] = tmp;

      if (Math.abs(A[i][i]) < 1e-7) continue;

      for (let k = i + 1; k < n; k++) {
        let c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) A[k][j] = 0;
          else A[k][j] += c * A[i][j];
        }
        x[k] += c * x[i];
      }
    }

    for (let i = n - 1; i >= 0; i--) {
      if (Math.abs(A[i][i]) < 1e-7) {
        x[i] = 0;
        continue;
      }
      x[i] = x[i] / A[i][i];
      for (let k = i - 1; k >= 0; k--) {
        x[k] -= A[k][i] * x[i];
      }
    }
    return x;
  };

  const vSol = solveLinear(G, B_vec);

  const getNodeV = (key) => {
    if (key === '0,0') return vSource;
    if (key === '6,0') return 0;
    const idx = unknownNodes.indexOf(key);
    return idx !== -1 ? Number(vSol[idx].toFixed(2)) : 0;
  };

  // 計算每個電阻的即時 V, I
  const resCalculated = resistors.map(r => {
    const kA = `${r.nA.x},${r.nA.y}`;
    const kB = `${r.nB.x},${r.nB.y}`;
    const vA = getNodeV(kA);
    const vB = getNodeV(kB);
    const vDiff = Number(Math.abs(vA - vB).toFixed(2));
    const iVal = Number((vDiff / r.value).toFixed(2));
    return { ...r, vA, vB, V: vDiff, I: iVal };
  });

  // 計算幹道總電流
  const iTotal = Number(
    resCalculated
      .filter(r => `${r.nA.x},${r.nA.y}` === '0,0' || `${r.nB.x},${r.nB.y}` === '0,0')
      .reduce((sum, r) => sum + r.I, 0)
      .toFixed(2)
  );
  const reqTotal = iTotal > 0 ? Number((vSource / iTotal).toFixed(2)) : 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：網格麵包板電路模擬器 (Breadboard Circuit)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          點擊網格上的任意兩個節點即可擺放電阻，支援自由串聯、並聯與大範圍跨接！
        </p>
      </div>

      {/* 電源與工具控制面板 */}
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-bold">電源電壓 V：</span>
          <input
            type="range" min="3" max="36" step="3" value={vSource}
            onChange={(e) => setVSource(Number(e.target.value))}
            className="w-32 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-amber-400 font-mono text-xs font-bold">{vSource} V</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetBoard}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 重置麵包板
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
              isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? '暫停斷路' : '接通電源'}
          </button>
        </div>
      </div>

      {/* 主操作區：左側網格麵包板畫布，右側電阻設定與數據 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側：網格麵包板畫布 (8x5 Grid) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> 麵包板畫布 (點擊任意兩點新增電阻)
            </span>
            <span className="text-[10px] text-slate-400">
              {selectedNode ? `已選擇起點 (${selectedNode.x}, ${selectedNode.y})，請點擊終點...` : '點擊網格節點開始畫線'}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[300px] overflow-x-auto">
            <svg width="360" height="240" className="select-none font-mono text-[10px]">
              {/* 網格背景點 */}
              {[0, 1, 2, 3, 4, 5, 6].map(gx =>
                [0, 1, 2, 3].map(gy => {
                  const cx = 30 + gx * 50;
                  const cy = 30 + gy * 50;
                  const isStartSelected = selectedNode && selectedNode.x === gx && selectedNode.y === gy;
                  const isPowerPos = gx === 0 && gy === 0;
                  const isPowerNeg = gx === 6 && gy === 0;

                  return (
                    <g key={`grid-${gx}-${gy}`} onClick={() => handleNodeClick(gx, gy)} className="cursor-pointer">
                      <circle
                        cx={cx} cy={cy} r={isStartSelected ? "7" : "4"}
                        fill={isStartSelected ? "#f59e0b" : isPowerPos ? "#ef4444" : isPowerNeg ? "#3b82f6" : "#475569"}
                        stroke={isStartSelected ? "#ffffff" : "none"} strokeWidth="2"
                      />
                      {/* 顯示節點電位 */}
                      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="7">
                        {getNodeV(`${gx},${gy}`)}V
                      </text>
                    </g>
                  );
                })
              )}

              {/* 電源輸入標示 */}
              <rect x="5" y="15" width="20" height="30" rx="3" fill="#ef4444" opacity="0.2" />
              <text x="15" y="32" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">+V</text>

              <rect x="335" y="15" width="20" height="30" rx="3" fill="#3b82f6" opacity="0.2" />
              <text x="345" y="32" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">0V</text>

              {/* 繪製已擺放的電阻 */}
              {resCalculated.map((r) => {
                const x1 = 30 + r.nA.x * 50;
                const y1 = 30 + r.nA.y * 50;
                const x2 = 30 + r.nB.x * 50;
                const y2 = 30 + r.nB.y * 50;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const isSelected = selectedResistorId === r.id;

                return (
                  <g key={`res-line-${r.id}`} onClick={() => setSelectedResistorId(r.id)} className="cursor-pointer">
                    {/* 導線連線 */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isSelected ? '#f59e0b' : '#06b6d4'} strokeWidth={isSelected ? '3.5' : '2.5'} />

                    {/* 電阻元件盒 */}
                    <rect
                      x={midX - 16} y={midY - 10} width="32" height="20" rx="4"
                      fill="#0f172a" stroke={isSelected ? '#f59e0b' : '#06b6d4'} strokeWidth="2"
                    />
                    <text x={midX} y={midY + 3} textAnchor="middle" fill={isSelected ? '#f59e0b' : '#06b6d4'} fontSize="8" fontWeight="bold">
                      {r.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
            <strong className="text-amber-300 block">💡 麵包板操作指南：</strong>
            <p>1. 點擊網格上的第一個點（亮黃燈），再點擊第二個點，即可畫出一根電阻。</p>
            <p>2. 接在同一個網格點上的電阻會自動連通並聯；串接在後方的會自動串聯。</p>
          </div>
        </div>

        {/* 右側：選取電阻屬性控制與電流清單 */}
        <div className="lg:col-span-5 space-y-4">
          {/* 選取電阻控制卡片 */}
          {(() => {
            const curR = resCalculated.find(r => r.id === selectedResistorId) || resCalculated[0];
            if (!curR) return null;

            return (
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-300" /> 設定選取電阻 ({curR.name})
                  </span>
                  {resistors.length > 1 && (
                    <button
                      onClick={() => removeResistor(curR.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-lg border border-slate-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 刪除此電阻
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">阻值 R：</span>
                    <span className="text-cyan-400 font-mono">{curR.value} Ω</span>
                  </div>
                  <input
                    type="range" min="1" max="50" step="1" value={curR.value}
                    onChange={(e) => updateResistorVal(curR.id, Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">通過電流 I：</span>
                    <span className="text-cyan-300 font-bold">{curR.I} A</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">兩端跨壓 V：</span>
                    <span className="text-amber-300 font-bold">{curR.V} V</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 全電路總結列表 */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-bold text-slate-200">
              <span>全電路即時數據 summary</span>
              <span className="text-amber-300 font-mono">Req = {reqTotal} Ω</span>
            </div>

            <div className="max-h-[180px] overflow-y-auto space-y-1.5 font-mono text-xs">
              {resCalculated.map(r => (
                <div
                  key={`list-${r.id}`}
                  onClick={() => setSelectedResistorId(r.id)}
                  className={`flex justify-between items-center p-2 rounded-xl border cursor-pointer transition-all ${
                    selectedResistorId === r.id ? 'bg-cyan-950/80 border-cyan-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span className="text-slate-200 font-bold">{r.name} ({r.value}Ω)</span>
                  <div className="flex gap-2 text-[11px]">
                    <span className="text-cyan-300">I={r.I}A</span>
                    <span className="text-amber-300">V={r.V}V</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細計算過程 */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" /> KCL 網格節點電位矩陣求解過程
          </span>
          <button
            onClick={() => setShowCalc(!showCalc)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" /> {showCalc ? '隱藏計算過程' : '詳細計算過程'}
          </button>
        </div>

        {showCalc ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
            <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 麵包板網格 KCL 電位解算步驟：</p>
            {allNodeKeys.map(key => (
              <p key={`calc-node-${key}`}>
                • 節點 Node ({key}) 電位：V = <strong className="text-cyan-300">{getNodeV(key)} V</strong>
              </p>
            ))}
            <p>• 全電路總等效電阻 Req = V_source / I_total = {vSource} / {iTotal} = <strong className="text-amber-300">{reqTotal} Ω</strong></p>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            點擊上方按鈕展開網格節點電位 KCL 矩陣求解細節。
          </div>
        )}
      </div>
    </div>
  );
}