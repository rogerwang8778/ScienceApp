import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Plus, Trash2, Sliders, RefreshCw, GitCommit } from 'lucide-react';

export default function CircuitLab() {
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 當前欲擺放的元件模式: 'resistor' (電阻) | 'wire' (導線)
  const [toolMode, setToolMode] = useState('resistor');

  // 互動選擇狀態
  const [selectedNode, setSelectedNode] = useState(null); // 目前點選的第一個網格點 {x, y}
  const [selectedItemId, setSelectedItemId] = useState('r1');

  // 電阻/導線清單 (11x7 擴大版麵包板)
  // 電源正極預設在 (0,0)，電源負極預設在 (10,0)
  const [components, setComponents] = useState([
    { id: 'r1', type: 'resistor', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 3, y: 0 } },
    { id: 'r2', type: 'resistor', name: 'R2', value: 6, nA: { x: 3, y: 0 }, nB: { x: 7, y: 0 } },
    { id: 'w1', type: 'wire', name: '導線1', value: 0.0001, nA: { x: 3, y: 0 }, nB: { x: 3, y: 3 } }, // 延伸支路導線
    { id: 'r3', type: 'resistor', name: 'R3', value: 12, nA: { x: 3, y: 3 }, nB: { x: 7, y: 3 } }, // 並聯支路電阻
    { id: 'w2', type: 'wire', name: '導線2', value: 0.0001, nA: { x: 7, y: 3 }, nB: { x: 7, y: 0 } },
    { id: 'r4', type: 'resistor', name: 'R4', value: 6, nA: { x: 7, y: 0 }, nB: { x: 10, y: 0 } },
  ]);

  // 網格點點擊事件（建立電阻或導線）
  const handleNodeClick = (x, y) => {
    if (!selectedNode) {
      setSelectedNode({ x, y });
    } else {
      // 點擊第二個點，若非同一點則建立元件
      if (selectedNode.x !== x || selectedNode.y !== y) {
        const isRes = toolMode === 'resistor';
        const resCount = components.filter(c => c.type === 'resistor').length + 1;
        const wireCount = components.filter(c => c.type === 'wire').length + 1;

        const newItem = {
          id: `item_${Date.now().toString().slice(-5)}`,
          type: toolMode,
          name: isRes ? `R${resCount}` : `導線${wireCount}`,
          value: isRes ? 6 : 0.0001, // 導線接近 0 歐姆
          nA: { x: selectedNode.x, y: selectedNode.y },
          nB: { x, y }
        };
        setComponents([...components, newItem]);
        setSelectedItemId(newItem.id);
      }
      setSelectedNode(null);
    }
  };

  const removeItem = (id) => {
    if (components.length > 1) {
      const nextList = components.filter(c => c.id !== id);
      setComponents(nextList);
      if (selectedItemId === id) {
        setSelectedItemId(nextList[0].id);
      }
    }
  };

  const updateResistorVal = (id, val) => {
    setComponents(components.map(c => c.id === id ? { ...c, value: Math.max(1, val) } : c));
  };

  // 重設麵包板
  const resetBoard = () => {
    setComponents([
      { id: 'r1', type: 'resistor', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 10, y: 0 } }
    ]);
    setSelectedNode(null);
  };

  // ==========================================
  // KCL 網路圖學求解 (Node Voltage Analysis)
  // ==========================================
  const nodeKeysSet = new Set(['0,0', '10,0']); // 0,0 正極(V_source), 10,0 負極(0V)
  components.forEach(c => {
    nodeKeysSet.add(`${c.nA.x},${c.nA.y}`);
    nodeKeysSet.add(`${c.nB.x},${c.nB.y}`);
  });
  const allNodeKeys = Array.from(nodeKeysSet);

  const unknownNodes = allNodeKeys.filter(k => k !== '0,0' && k !== '10,0');
  const N = unknownNodes.length;

  let G = Array(N).fill(0).map(() => Array(N).fill(0));
  let B_vec = Array(N).fill(0);

  components.forEach(c => {
    const g = 1 / c.value;
    const kA = `${c.nA.x},${c.nA.y}`;
    const kB = `${c.nB.x},${c.nB.y}`;

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
    if (key === '10,0') return 0;
    const idx = unknownNodes.indexOf(key);
    return idx !== -1 ? Number(vSol[idx].toFixed(2)) : 0;
  };

  // 計算每個元件的即時 V, I
  const compCalculated = components.map(c => {
    const kA = `${c.nA.x},${c.nA.y}`;
    const kB = `${c.nB.x},${c.nB.y}`;
    const vA = getNodeV(kA);
    const vB = getNodeV(kB);
    const vDiff = Number(Math.abs(vA - vB).toFixed(2));
    const iVal = Number((vDiff / c.value).toFixed(2));
    return { ...c, vA, vB, V: vDiff, I: iVal };
  });

  // 計算幹道總電流
  const iTotal = Number(
    compCalculated
      .filter(c => `${c.nA.x},${c.nA.y}` === '0,0' || `${c.nB.x},${c.nB.y}` === '0,0')
      .reduce((sum, c) => sum + c.I, 0)
      .toFixed(2)
  );
  const reqTotal = iTotal > 0 ? Number((vSource / iTotal).toFixed(2)) : 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：加大型網格麵包板與自由佈線模擬器 (Breadboard Circuit)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          支援自由選擇放置「電阻」或「導線 Wire」，可在 11×7 加大型麵包板上拉出精美的自由混聯線路
        </p>
      </div>

      {/* 工具與電源控制面板 */}
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-bold">電源 V：</span>
          <input
            type="range" min="3" max="36" step="3" value={vSource}
            onChange={(e) => setVSource(Number(e.target.value))}
            className="w-28 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-amber-400 font-mono text-xs font-bold">{vSource} V</span>
        </div>

        {/* 工具選擇器 */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setToolMode('resistor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              toolMode === 'resistor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> 擺放電阻 (Resistor)
          </button>
          <button
            onClick={() => setToolMode('wire')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              toolMode === 'wire' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" /> 新增導線 (Wire)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetBoard}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 清空麵包板
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

      {/* 畫布與數據區 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側：加大型麵包板畫布 (11x7 Grid) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> 加大型麵包板 (11×7 網格空間)
            </span>
            <span className="text-[10px] text-slate-400">
              {selectedNode
                ? `起點 (${selectedNode.x}, ${selectedNode.y})，模式: ${toolMode === 'resistor' ? '電阻' : '導線'}`
                : `模式：${toolMode === 'resistor' ? '擺放電阻' : '拉導線Wire'}`}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[340px] overflow-x-auto">
            <svg width="480" height="300" className="select-none font-mono text-[10px]">
              {/* 11x7 網格點 */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(gx =>
                [0, 1, 2, 3, 4, 5, 6].map(gy => {
                  const cx = 30 + gx * 42;
                  const cy = 30 + gy * 40;
                  const isStartSelected = selectedNode && selectedNode.x === gx && selectedNode.y === gy;
                  const isPowerPos = gx === 0 && gy === 0;
                  const isPowerNeg = gx === 10 && gy === 0;

                  return (
                    <g key={`grid-${gx}-${gy}`} onClick={() => handleNodeClick(gx, gy)} className="cursor-pointer">
                      <circle
                        cx={cx} cy={cy} r={isStartSelected ? "6" : "3.5"}
                        fill={isStartSelected ? "#f59e0b" : isPowerPos ? "#ef4444" : isPowerNeg ? "#3b82f6" : "#475569"}
                        stroke={isStartSelected ? "#ffffff" : "none"} strokeWidth="2"
                      />
                      <text x={cx} y={cy + 13} textAnchor="middle" fill="#64748b" fontSize="6.5">
                        {getNodeV(`${gx},${gy}`)}V
                      </text>
                    </g>
                  );
                })
              )}

              {/* 電源正負極標籤 */}
              <rect x="5" y="15" width="20" height="30" rx="3" fill="#ef4444" opacity="0.2" />
              <text x="15" y="32" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">+V</text>

              <rect x="455" y="15" width="20" height="30" rx="3" fill="#3b82f6" opacity="0.2" />
              <text x="465" y="32" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">0V</text>

              {/* 繪製已擺放的元件 (電阻或導線) */}
              {compCalculated.map((c) => {
                const x1 = 30 + c.nA.x * 42;
                const y1 = 30 + c.nA.y * 40;
                const x2 = 30 + c.nB.x * 42;
                const y2 = 30 + c.nB.y * 40;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const isSelected = selectedItemId === c.id;
                const isWire = c.type === 'wire';

                return (
                  <g key={`item-line-${c.id}`} onClick={() => setSelectedItemId(c.id)} className="cursor-pointer">
                    {/* 導線或電阻接線 */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isSelected ? '#f59e0b' : isWire ? '#10b981' : '#06b6d4'}
                      strokeWidth={isWire ? '3' : isSelected ? '3.5' : '2.5'}
                      strokeDasharray={isWire ? '4 2' : 'none'}
                    />

                    {/* 電阻元件盒 */}
                    {!isWire && (
                      <>
                        <rect
                          x={midX - 16} y={midY - 10} width="32" height="20" rx="4"
                          fill="#0f172a" stroke={isSelected ? '#f59e0b' : '#06b6d4'} strokeWidth="2"
                        />
                        <text x={midX} y={midY + 3} textAnchor="middle" fill={isSelected ? '#f59e0b' : '#06b6d4'} fontSize="8" fontWeight="bold">
                          {c.name}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
            <strong className="text-amber-300 block">💡 自由拉線提示：</strong>
            <p>1. 上方可切換 **【擺放電阻】** 或 **【新增導線 Wire】**。</p>
            <p>2. 利用「導線`Wire`」連接不同區塊，可以讓複雜的電路、並聯支路拉得更乾淨美觀！</p>
          </div>
        </div>

        {/* 右側：選取元件控制與列表 */}
        <div className="lg:col-span-4 space-y-4">
          {/* 選取元件卡片 */}
          {(() => {
            const curItem = compCalculated.find(c => c.id === selectedItemId) || compCalculated[0];
            if (!curItem) return null;

            return (
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-300" /> 設定 {curItem.name} ({curItem.type === 'wire' ? '純導線' : '電阻'})
                  </span>
                  {components.length > 1 && (
                    <button
                      onClick={() => removeItem(curItem.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-lg border border-slate-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 刪除
                    </button>
                  )}
                </div>

                {curItem.type === 'resistor' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">阻值 R：</span>
                      <span className="text-cyan-400 font-mono">{curItem.value} Ω</span>
                    </div>
                    <input
                      type="range" min="1" max="50" step="1" value={curItem.value}
                      onChange={(e) => updateResistorVal(curItem.id, Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-mono">
                    🟢 此元件為無阻值導線 (Wire)，純作接線通電用途。
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">通過電流 I：</span>
                    <span className="text-cyan-300 font-bold">{curItem.I} A</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">兩端跨壓 V：</span>
                    <span className="text-amber-300 font-bold">{curItem.V} V</span>
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

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 font-mono text-xs">
              {compCalculated.map(c => (
                <div
                  key={`list-${c.id}`}
                  onClick={() => setSelectedItemId(c.id)}
                  className={`flex justify-between items-center p-2 rounded-xl border cursor-pointer transition-all ${
                    selectedItemId === c.id ? 'bg-cyan-950/80 border-cyan-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <span className="text-slate-200 font-bold">
                    {c.type === 'wire' ? '🟢' : '🔷'} {c.name} {c.type === 'resistor' ? `(${c.value}Ω)` : ''}
                  </span>
                  <div className="flex gap-2 text-[11px]">
                    <span className="text-cyan-300">I={c.I}A</span>
                    <span className="text-amber-300">V={c.V}V</span>
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