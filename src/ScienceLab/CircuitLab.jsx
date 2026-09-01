import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Plus, Trash2, Sliders, RefreshCw, GitCommit, GitBranch, Layers, Activity } from 'lucide-react';

export default function CircuitLab() {
  // 分頁切換狀態: 'breadboard' (網格麵包板) | 'bridge' (惠斯同電橋)
  const [activeTab, setActiveTab] = useState('breadboard');

  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // ==========================================
  // 網格麵包板 State & Logic (11x7 Grid)
  // ==========================================
  const [toolMode, setToolMode] = useState('resistor'); // 'resistor' | 'wire'
  const [selectedNode, setSelectedNode] = useState(null); // {x, y}
  const [selectedItemId, setSelectedItemId] = useState('r1');

  // 電阻與導線清單 (電源正極 (0,0), 電源負極 (10,0))
  const [components, setComponents] = useState([
    { id: 'r1', type: 'resistor', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 3, y: 0 } },
    { id: 'r2', type: 'resistor', name: 'R2', value: 6, nA: { x: 3, y: 0 }, nB: { x: 7, y: 0 } },
    { id: 'w1', type: 'wire', name: '導線1', value: 0.0001, nA: { x: 3, y: 0 }, nB: { x: 3, y: 3 } },
    { id: 'r3', type: 'resistor', name: 'R3', value: 12, nA: { x: 3, y: 3 }, nB: { x: 7, y: 3 } },
    { id: 'w2', type: 'wire', name: '導線2', value: 0.0001, nA: { x: 7, y: 3 }, nB: { x: 7, y: 0 } },
    { id: 'r4', type: 'resistor', name: 'R4', value: 6, nA: { x: 7, y: 0 }, nB: { x: 10, y: 0 } },
  ]);

  const handleNodeClick = (x, y) => {
    if (!selectedNode) {
      setSelectedNode({ x, y });
    } else {
      if (selectedNode.x !== x || selectedNode.y !== y) {
        const isRes = toolMode === 'resistor';
        const resCount = components.filter(c => c.type === 'resistor').length + 1;
        const wireCount = components.filter(c => c.type === 'wire').length + 1;

        const newItem = {
          id: `item_${Date.now().toString().slice(-5)}`,
          type: toolMode,
          name: isRes ? `R${resCount}` : `導線${wireCount}`,
          value: isRes ? 6 : 0.0001,
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

  const resetBoard = () => {
    setComponents([
      { id: 'r1', type: 'resistor', name: 'R1', value: 6, nA: { x: 0, y: 0 }, nB: { x: 10, y: 0 } }
    ]);
    setSelectedNode(null);
  };

  // 麵包板 KCL 求解
  const nodeKeysSet = new Set(['0,0', '10,0']);
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

  // 計算各元件的 V, I 與 電功率 P = V * I (W)
  const compCalculated = components.map(c => {
    const kA = `${c.nA.x},${c.nA.y}`;
    const kB = `${c.nB.x},${c.nB.y}`;
    const vA = getNodeV(kA);
    const vB = getNodeV(kB);
    const vDiff = Number(Math.abs(vA - vB).toFixed(2));
    const iVal = Number((vDiff / c.value).toFixed(2));
    const pVal = Number((vDiff * iVal).toFixed(2)); // 電功率 (W)
    return { ...c, vA, vB, V: vDiff, I: iVal, P: pVal };
  });

  // 全電路總物理量
  const iTotal = Number(
    compCalculated
      .filter(c => `${c.nA.x},${c.nA.y}` === '0,0' || `${c.nB.x},${c.nB.y}` === '0,0')
      .reduce((sum, c) => sum + c.I, 0)
      .toFixed(2)
  );
  const reqTotal = iTotal > 0 ? Number((vSource / iTotal).toFixed(2)) : 0;
  const pTotal = Number((vSource * iTotal).toFixed(2)); // 全電路總電功率 (W)

  // ==========================================
  // 惠斯同電橋 State & Logic (5個電阻鑽石網路)
  // ==========================================
  const [br1, setBr1] = useState(6);
  const [br2, setBr2] = useState(12);
  const [br3, setBr3] = useState(4);
  const [br4, setBr4] = useState(8);
  const [br5, setBr5] = useState(10);

  const bg1 = 1 / br1, bg2 = 1 / br2, bg3 = 1 / br3, bg4 = 1 / br4, bg5 = 1 / br5;
  const A_coeff = bg1 + bg2 + bg5, B_coeff = -bg5, C_const = vSource * bg1;
  const D_coeff = -bg5, E_coeff = bg3 + bg4 + bg5, F_const = vSource * bg3;

  const det = A_coeff * E_coeff - B_coeff * D_coeff;
  const vB = Number(((C_const * E_coeff - B_coeff * F_const) / det).toFixed(2));
  const vC = Number(((A_coeff * F_const - C_const * D_coeff) / det).toFixed(2));

  const iBr1 = Number(((vSource - vB) / br1).toFixed(2));
  const iBr2 = Number((vB / br2).toFixed(2));
  const iBr3 = Number(((vSource - vC) / br3).toFixed(2));
  const iBr4 = Number((vC / br4).toFixed(2));
  const iBr5 = Number(((vB - vC) / br5).toFixed(2));

  const bridgeITotal = Number((iBr1 + iBr3).toFixed(2));
  const bridgeReq = Number((vSource / bridgeITotal).toFixed(2));
  const isBalanced = Math.abs(vB - vC) < 0.05;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《基本電路、電功率與惠斯同電橋》
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          可自由擺放電阻/導線進行電功率 (P = IV) 試算，或切換至惠斯同電橋實驗室
        </p>
      </div>

      {/* 頁面切換按鈕 (已刪除 "頁面一"、"頁面二" 字樣) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('breadboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'breadboard' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-300" /> 加大型網格麵包板 (自由擺放電阻與導線)
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'bridge' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-300" /> 惠斯同電橋實驗室 (鑽石網路與 KCL)
        </button>
      </div>

      {/* ==========================================
          加大型網格麵包板
      ========================================== */}
      {activeTab === 'breadboard' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">總電源電壓 V：</span>
              <input
                type="range" min="3" max="36" step="3" value={vSource}
                onChange={(e) => setVSource(Number(e.target.value))}
                className="w-28 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-amber-400 font-mono text-xs font-bold">{vSource} V</span>
            </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
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

                  <rect x="5" y="15" width="20" height="30" rx="3" fill="#ef4444" opacity="0.2" />
                  <text x="15" y="32" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">+V</text>

                  <rect x="455" y="15" width="20" height="30" rx="3" fill="#3b82f6" opacity="0.2" />
                  <text x="465" y="32" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">0V</text>

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
                        <line
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={isSelected ? '#f59e0b' : isWire ? '#10b981' : '#06b6d4'}
                          strokeWidth={isWire ? '3' : isSelected ? '3.5' : '2.5'}
                          strokeDasharray={isWire ? '4 2' : 'none'}
                        />

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
                <strong className="text-amber-300 block">💡 自由拉線與功率解析：</strong>
                <p>1. 上方可切換 **【擺放電阻】** 或 **【新增導線 Wire】**。</p>
                <p>2. 點選下方個別電阻或全電路總結，可展開詳細的 **電壓 $V$、電流 $I$ 與電功率 $P$** 公式推導！</p>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              {/* 選取元件物理量卡片 */}
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

                    {/* 電壓、電流與電功率數據展示 */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">兩端跨壓 V：</span>
                        <span className="text-amber-300 font-bold">{curItem.V} V</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">通過電流 I：</span>
                        <span className="text-cyan-300 font-bold">{curItem.I} A</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">消耗功率 P：</span>
                        <span className="text-rose-400 font-bold">{curItem.P} W</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 全電路總結物理量列表 */}
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-3">
                <div className="border-b border-slate-800 pb-2 text-xs font-bold text-slate-200 flex justify-between items-center">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Activity className="w-3.5 h-3.5" /> 全電路總物理量 (Total)
                  </span>
                  <span className="text-xs font-mono text-purple-300">Req = {reqTotal} Ω</span>
                </div>

                {/* 全電路總數據 3 欄 */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">總電壓 V_tot：</span>
                    <span className="text-amber-300 font-bold">{vSource} V</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">總電流 I_tot：</span>
                    <span className="text-cyan-300 font-bold">{iTotal} A</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">總功率 P_tot：</span>
                    <span className="text-rose-400 font-bold">{pTotal} W</span>
                  </div>
                </div>

                {/* 元件物理量明細清單 */}
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 font-mono text-xs pt-1">
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
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-amber-300">V={c.V}V</span>
                        <span className="text-cyan-300">I={c.I}A</span>
                        <span className="text-rose-400 font-bold">P={c.P}W</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 詳細計算過程與公式推導區 */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" /> 電路物理量與電功率 ($P = IV$) 詳細推導過程
              </span>
              <button
                onClick={() => setShowCalc(!showCalc)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
              >
                <Calculator className="w-3.5 h-3.5" /> {showCalc ? '隱藏計算過程' : '詳細計算過程'}
              </button>
            </div>

            {showCalc ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-3 text-slate-300 leading-relaxed">
                {/* 1. 當前選取元件之詳細推導 */}
                {(() => {
                  const cur = compCalculated.find(c => c.id === selectedItemId) || compCalculated[0];
                  if (!cur) return null;

                  return (
                    <div className="border-b border-slate-800 pb-2 space-y-1">
                      <p className="text-amber-300 font-bold">🎯 【當前選取元件：{cur.name} ({cur.type === 'wire' ? '導線 Wire' : `電阻 ${cur.value}Ω`})】詳細步驟：</p>
                      <p>• 兩端跨接電壓差 $V_{{cur.name}}$ = $|V_{{\text{{Start}}}} - V_{{\text{{End}}}}| = {cur.V}\text{{ V}}$</p>
                      {cur.type === 'resistor' ? (
                        <>
                          <p>• 流經歐姆電流 $I_{{cur.name}}$ = $\frac{{V}}{{R}} = \frac{{{cur.V}}}{{{cur.value}}} = \mathbf{{{cur.I}}\text{{ A}}}$</p>
                          <p>• 消耗電功率 $P_{{cur.name}}$ = $I \times V = {cur.I}\text{{ A}} \times {cur.V}\text{{ V}} = \mathbf{{{cur.P}}\text{{ W}}}$ （亦可用 $I^2 R = {cur.I}^2 \times {cur.value} = {cur.P}\text{{ W}}$）</p>
                        </>
                      ) : (
                        <p>• 純導線無顯著歐姆電阻 ($R \approx 0\,\Omega$)，跨壓 $V \approx 0\,\text{{V}}$，故熱功率消耗 $P \approx 0\,\text{{W}}$。</p>
                      )}
                    </div>
                  );
                })()}

                {/* 2. 全電路總理化公式推導 */}
                <div className="space-y-1 pt-1">
                  <p className="text-rose-400 font-bold">⚡ 【全電路總物理量 (Total Circuit Summary)】公式推導：</p>
                  <p>• 總電源電壓 $V_{{\text{{total}}}}$ = $\mathbf{{{vSource}}\text{{ V}}}$</p>
                  <p>• 全電路幹道總電流 $I_{{\text{{total}}}}$ = $\sum I_{{\text{{branch}}}} = \mathbf{{{iTotal}}\text{{ A}}}$</p>
                  <p>• 全電路等效總電阻 $R_{{\text{{eq}}}}$ = $\frac{{V_{{\text{{total}}}}}}{{I_{{\text{{total}}}}}} = \frac{{{vSource}}}{{{iTotal}}} = \mathbf{{{reqTotal}}\,\Omega}$</p>
                  <p>• 全電路總電功率 $P_{{\text{{total}}}}$ = $V_{{\text{{total}}}} \times I_{{\text{{total}}}} = {vSource}\text{{ V}} \times {iTotal}\text{{ A}} = \mathbf{{{pTotal}}\text{{ W}}}$</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                點擊上方按鈕展開當前選取電阻與全電路總電功率 $P = IV$ 與歐姆定律之完整推導步驟。
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          惠斯同電橋實驗室
      ========================================== */}
      {activeTab === 'bridge' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-bold">電源電壓 V：</span>
                <input
                  type="range" min="3" max="24" step="3" value={vSource}
                  onChange={(e) => setVSource(Number(e.target.value))}
                  className="w-32 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-amber-400 font-mono text-xs font-bold">{vSource} V</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setBr1(6); setBr2(12); setBr3(4); setBr4(8); }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <GitBranch className="w-3.5 h-3.5" /> 載入平衡比 (6:12 = 4:8)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">R1 (A-B)：</span>
                  <span className="text-cyan-400 font-mono">{br1} Ω</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1" value={br1}
                  onChange={(e) => setBr1(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">R2 (B-D)：</span>
                  <span className="text-cyan-400 font-mono">{br2} Ω</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1" value={br2}
                  onChange={(e) => setBr2(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">R3 (A-C)：</span>
                  <span className="text-purple-400 font-mono">{br3} Ω</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1" value={br3}
                  onChange={(e) => setBr3(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-700 rounded cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">R4 (C-D)：</span>
                  <span className="text-purple-400 font-mono">{br4} Ω</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1" value={br4}
                  onChange={(e) => setBr4(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-slate-700 rounded cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-300">R5 橋臂：</span>
                  <span className="text-amber-400 font-mono">{br5} Ω</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1" value={br5}
                  onChange={(e) => setBr5(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-slate-700 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                電橋狀態：<strong className={isBalanced ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {isBalanced ? '✅ 電橋達完美平衡 (VB = VC，R5 無電流)' : '⚠️ 電橋未平衡 (VB ≠ VC，R5 有電流)'}
                </strong>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                  isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? '暫停開關' : '接通電源'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：惠斯同電橋電位圖 (節點點位)
                </span>
                <span className="text-[10px] text-slate-400">VB={vB}V ｜ VC={vC}V</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px]">
                <svg width="320" height="200" className="select-none font-mono text-[10px]">
                  <rect x="15" y="80" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="30" y="104" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

                  <line x1="30" y1="80" x2="30" y2="30" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="30" y1="30" x2="160" y2="30" stroke="#ef4444" strokeWidth="2.5" />

                  <line x1="30" y1="120" x2="30" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="30" y1="170" x2="160" y2="170" stroke="#3b82f6" strokeWidth="2.5" />

                  <line x1="160" y1="30" x2="80" y2="100" stroke="#06b6d4" strokeWidth="2" />
                  <line x1="80" y1="100" x2="160" y2="170" stroke="#06b6d4" strokeWidth="2" />

                  <line x1="160" y1="30" x2="240" y2="100" stroke="#a855f7" strokeWidth="2" />
                  <line x1="240" y1="100" x2="160" y2="170" stroke="#a855f7" strokeWidth="2" />

                  <line x1="80" y1="100" x2="240" y2="100" stroke={isBalanced ? '#10b981' : '#f59e0b'} strokeWidth="3" strokeDasharray={isBalanced ? 'none' : '4 4'} />

                  <rect x="105" y="52" width="30" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="120" y="65" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">R1={br1}Ω</text>

                  <rect x="105" y="128" width="30" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="120" y="141" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">R2={br2}Ω</text>

                  <rect x="185" y="52" width="30" height="20" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="200" y="65" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">R3={br3}Ω</text>

                  <rect x="185" y="128" width="30" height="20" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="200" y="141" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">R4={br4}Ω</text>

                  <rect x="145" y="90" width="30" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="160" y="103" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">R5={br5}Ω</text>

                  <circle cx="160" cy="30" r="4" fill="#ef4444" />
                  <text x="160" y="20" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">Node A ({vSource}V)</text>

                  <circle cx="80" cy="100" r="4" fill="#06b6d4" />
                  <text x="55" y="103" textAnchor="end" fill="#06b6d4" fontSize="9" fontWeight="bold">VB={vB}V</text>

                  <circle cx="240" cy="100" r="4" fill="#a855f7" />
                  <text x="265" y="103" textAnchor="start" fill="#a855f7" fontSize="9" fontWeight="bold">VC={vC}V</text>

                  <circle cx="160" cy="170" r="4" fill="#3b82f6" />
                  <text x="160" y="185" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">Node D (0V)</text>
                </svg>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-amber-300 block">💡 惠斯同電橋平衡條件：</strong>
                <p>• 當 R1 / R2 = R3 / R4 （即 {br1}/{br2} = {br3}/{br4}）時，節點 B 與 C 的電位相等 (VB = VC = {vB}V)。</p>
                <p>• 此時橋臂電阻 R5 兩端無電壓差，因此完全沒有電流流過 R5 (I_R5 = 0A)。</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：各支路分流列表
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">幹道 I_total = {bridgeITotal} A</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-y-auto">
                <div className="w-full space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-bold">左側上支路 R1 ({br1}Ω)</span>
                    <span className="text-cyan-300 font-bold">I_R1 = {iBr1} A</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-bold">左側下支路 R2 ({br2}Ω)</span>
                    <span className="text-cyan-300 font-bold">I_R2 = {iBr2} A</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-bold">右側上支路 R3 ({br3}Ω)</span>
                    <span className="text-purple-300 font-bold">I_R3 = {iBr3} A</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-200 font-bold">右側下支路 R4 ({br4}Ω)</span>
                    <span className="text-purple-300 font-bold">I_R4 = {iBr4} A</span>
                  </div>
                  <div className={`flex justify-between items-center p-2.5 rounded-xl border ${isBalanced ? 'bg-emerald-950/60 border-emerald-700' : 'bg-amber-950/60 border-amber-700'}`}>
                    <span className="text-amber-300 font-bold">中央橋臂 R5 ({br5}Ω) [B➔C]</span>
                    <span className={`font-bold ${isBalanced ? 'text-emerald-400' : 'text-amber-300'}`}>I_R5 = {iBr5} A</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-cyan-300 block">💡 節點 KCL 與分流：</strong>
                <p>• 節點 B 滿足：I_R1 = I_R2 + I_R5。</p>
                <p>• 當電橋平衡時 I_R5 = 0，此時 I_R1 = I_R2 且 I_R3 = I_R4。</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" /> 節點電位法 (Node Voltage) 解算過程
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
                <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 節點電位 KCL 矩陣解算步驟：</p>
                <p>1. 對 Node B 建立 KCL：(VB - {vSource})/{br1} + VB/{br2} + (VB - VC)/{br5} = 0 ➔ <strong className="text-cyan-300">VB = {vB} V</strong></p>
                <p>2. 對 Node C 建立 KCL：(VC - {vSource})/{br3} + VC/{br4} + (VC - VB)/{br5} = 0 ➔ <strong className="text-purple-300">VC = {vC} V</strong></p>
                <p>3. 橋臂電壓差：ΔV_BC = VB - VC = {vB} - {vC} = <strong className={isBalanced ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{(vB - vC).toFixed(2)} V</strong></p>
                <p>4. 全電路總等效電阻：Req = V_source / I_total = {vSource} / {bridgeITotal} = <strong className="text-cyan-300">{bridgeReq} Ω</strong></p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                點擊上方按鈕展開節點電位法 VB, VC 與克拉瑪公式求解細節。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}