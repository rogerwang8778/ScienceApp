import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Sliders, Plus, Trash2, GitBranch, Layers } from 'lucide-react';

export default function CircuitLab() {
  const [activeTab, setActiveTab] = useState('nodeGraph');
  const [vSource, setVSource] = useState(12);
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // ==========================================
  // 頁面 1：節點跨接電路 (Node-based Circuit Builder)
  // 每個電阻定義 [startNode, endNode]
  // Node 0: 電源正極 (V_source)
  // Node 99: 電源負極 (0V/接地)
  // ==========================================
  const [nodeResistors, setNodeResistors] = useState([
    { id: 'r1', name: 'R1', value: 6, startNode: 0, endNode: 1 },
    { id: 'r2', name: 'R2', value: 6, startNode: 1, endNode: 2 },
    { id: 'r3', name: 'R3', value: 6, startNode: 2, endNode: 3 },
    { id: 'r4', name: 'R4', value: 6, startNode: 3, endNode: 4 },
    { id: 'r5', name: 'R5', value: 6, startNode: 4, endNode: 99 },
  ]);

  // 新增電阻
  const addNodeResistor = () => {
    if (nodeResistors.length < 10) {
      const idx = nodeResistors.length + 1;
      const newId = `r${idx}`;
      setNodeResistors([
        ...nodeResistors,
        { id: newId, name: `R${idx}`, value: 6, startNode: 0, endNode: 99 } // 預設跨接電源兩端
      ]);
    }
  };

  const removeNodeResistor = (id) => {
    if (nodeResistors.length > 1) {
      setNodeResistors(nodeResistors.filter((r) => r.id !== id));
    }
  };

  const updateNodeResistorProp = (id, key, val) => {
    setNodeResistors(nodeResistors.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  };

  // 可選節點清單
  const availableNodes = [
    { id: 0, label: '節點 0 (電源正極 高電位)' },
    { id: 1, label: '節點 1 (R1與R2之間)' },
    { id: 2, label: '節點 2 (R2與R3之間)' },
    { id: 3, label: '節點 3 (R3與R4之間)' },
    { id: 4, label: '節點 4 (R4與R5之間)' },
    { id: 99, label: '節點 99 (電源負極 接地0V)' },
  ];

  // KCL 求解 (Node Voltage Analysis)
  // 計算內部動態節點 (Node 1, Node 2, Node 3, Node 4)
  const internalNodes = [1, 2, 3, 4];
  const N = internalNodes.length;

  // 導納矩陣 G * V = I_ext
  let G = Array(N).fill(0).map(() => Array(N).fill(0));
  let B_vec = Array(N).fill(0);

  nodeResistors.forEach((r) => {
    const g = 1 / r.value;
    const u = r.startNode;
    const v = r.endNode;

    const uIdx = internalNodes.indexOf(u);
    const vIdx = internalNodes.indexOf(v);

    if (uIdx !== -1) {
      G[uIdx][uIdx] += g;
      if (vIdx !== -1) G[uIdx][vIdx] -= g;
      if (v === 0) B_vec[uIdx] += g * vSource;
    }

    if (vIdx !== -1) {
      G[vIdx][vIdx] += g;
      if (uIdx !== -1) G[vIdx][uIdx] -= g;
      if (u === 0) B_vec[vIdx] += g * vSource;
    }
  });

  // 高斯消去法解 V_node
  const solveLinear = (A_mat, b_arr) => {
    let n = b_arr.length;
    let A = A_mat.map((row) => [...row]);
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
  const getNodeVoltage = (nodeId) => {
    if (nodeId === 0) return vSource;
    if (nodeId === 99) return 0;
    const idx = internalNodes.indexOf(nodeId);
    return idx !== -1 ? Number(vSol[idx].toFixed(2)) : 0;
  };

  // 各電阻物理量計算
  const nodeResData = nodeResistors.map((r) => {
    const vStart = getNodeVoltage(r.startNode);
    const vEnd = getNodeVoltage(r.endNode);
    const vDiff = Number(Math.abs(vStart - vEnd).toFixed(2));
    const iVal = Number((vDiff / r.value).toFixed(2));
    const isSpan = Math.abs(r.startNode - r.endNode) > 1 && !(r.startNode === 0 && r.endNode === 1);

    return { ...r, vStart, vEnd, V: vDiff, I: iVal, isSpan };
  });

  // 計算幹道總電流
  const totalI = Number(
    nodeResData
      .filter((r) => r.startNode === 0)
      .reduce((sum, r) => sum + r.I, 0)
      .toFixed(2)
  );
  const totalReq = totalI > 0 ? Number((vSource / totalI).toFixed(2)) : 0;

  // ==========================================
  // 頁面 2：惠斯同電橋 State & Logic
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
          理化實驗室：國三上 單元四《自由節點跨接電路實驗室》
        </h2>
        <p className="text-xs text-slate-400 mt-1">自由選擇起點與終點節點（可跨越 R1~R5 任意長度進行大範圍並聯），解算高階電路網路</p>
      </div>

      {/* 頁面切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('nodeGraph')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'nodeGraph' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-300" /> 頁面 1：雙節點跨接模式 (可跨越 R1~R5 任意並聯)
        </button>
        <button
          onClick={() => setActiveTab('bridge')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'bridge' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-300" /> 頁面 2：惠斯同電橋實驗室 (鑽石網路與 KCL)
        </button>
      </div>

      {/* 頁面 1：雙節點跨接模式 */}
      {activeTab === 'nodeGraph' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-bold">總電源電壓 V：</span>
                <input
                  type="range" min="3" max="36" step="3" value={vSource}
                  onChange={(e) => setVSource(Number(e.target.value))}
                  className="w-32 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-amber-400 font-mono text-xs font-bold">{vSource} V</span>
              </div>

              <button
                onClick={addNodeResistor}
                disabled={nodeResistors.length >= 10}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> 新增電阻 (+R)
              </button>
            </div>

            {/* 電阻卡片設定區：設定起點與終點節點 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nodeResistors.map((r) => (
                <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-200">{r.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      跨接: N{r.startNode} ➔ N{r.endNode}
                    </span>
                  </div>

                  {/* 選擇起點與終點 */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5">跨接起點 (Start Node)：</span>
                      <select
                        value={r.startNode}
                        onChange={(e) => updateNodeResistorProp(r.id, 'startNode', Number(e.target.value))}
                        className="w-full bg-slate-900 text-cyan-300 rounded px-1 py-1 border border-slate-700"
                      >
                        {availableNodes.map((n) => (
                          <option key={`start-${n.id}`} value={n.id}>
                            N{n.id} ({n.id === 0 ? '電源正' : n.id === 99 ? '接地' : `節點${n.id}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">跨接終點 (End Node)：</span>
                      <select
                        value={r.endNode}
                        onChange={(e) => updateNodeResistorProp(r.id, 'endNode', Number(e.target.value))}
                        className="w-full bg-slate-900 text-purple-300 rounded px-1 py-1 border border-slate-700"
                      >
                        {availableNodes.map((n) => (
                          <option key={`end-${n.id}`} value={n.id}>
                            N{n.id} ({n.id === 0 ? '電源正' : n.id === 99 ? '接地' : `節點${n.id}`})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-400">阻值：</span>
                    <span className="text-cyan-400 font-mono font-bold">{r.value} Ω</span>
                  </div>
                  <input
                    type="range" min="1" max="20" step="1" value={r.value}
                    onChange={(e) => updateNodeResistorProp(r.id, 'value', Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
                  />

                  {nodeResistors.length > 1 && (
                    <button
                      onClick={() => removeNodeResistor(r.id)}
                      className="absolute -top-1.5 -right-1.5 bg-slate-800 text-slate-400 hover:text-rose-400 p-1 rounded-full border border-slate-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="text-xs font-mono text-slate-300">
                電阻總數：<strong className="text-purple-300">{nodeResistors.length} / 10 個</strong> ｜ 等效總電阻 Req = <strong className="text-amber-300">{totalReq} Ω</strong> ｜ 幹道總電流 I_total = <strong className="text-cyan-300">{totalI} A</strong>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                  isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? '暫停斷路' : '接通電源'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SVG 跨接網格動態畫布 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：節點跨接拓樸圖 (支援大範圍跨接)
                </span>
                <span className="text-[10px] text-slate-400">高電位(紅) ➔ 低電位(藍)</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[250px] overflow-x-auto">
                <svg width="340" height="220" className="select-none font-mono text-[10px]">
                  {/* 電源 */}
                  <rect x="15" y="90" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="30" y="114" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

                  {/* 節點 0 高電位幹線 */}
                  <line x1="30" y1="90" x2="30" y2="40" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="30" y1="40" x2="60" y2="40" stroke="#ef4444" strokeWidth="2.5" />

                  {/* 節點 99 接地低電位幹線 */}
                  <line x1="30" y1="130" x2="30" y2="180" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="30" y1="180" x2="310" y2="180" stroke="#3b82f6" strokeWidth="2.5" />

                  {/* 節點位置標註 (Node 0, 1, 2, 3, 4, 99) */}
                  {[
                    { id: 0, x: 60, y: 40 },
                    { id: 1, x: 110, y: 40 },
                    { id: 2, x: 160, y: 40 },
                    { id: 3, x: 210, y: 40 },
                    { id: 4, x: 260, y: 40 },
                    { id: 99, x: 310, y: 180 },
                  ].map((n) => (
                    <g key={`node-dot-${n.id}`}>
                      <circle cx={n.x} cy={n.y} r="3" fill="#38bdf8" />
                      <text x={n.x} y={n.y - 6} textAnchor="middle" fill="#94a3b8" fontSize="7">
                        N{n.id} ({getNodeVoltage(n.id)}V)
                      </text>
                    </g>
                  ))}

                  {/* 繪製所有電阻與跨接包覆線 */}
                  {nodeResData.map((r, idx) => {
                    // 主幹線上的電阻 (相鄰節點)
                    if (!r.isSpan) {
                      const startX = r.startNode === 0 ? 60 : 60 + r.startNode * 50;
                      const endX = r.endNode === 99 ? 310 : 60 + r.endNode * 50;
                      const midX = (startX + endX) / 2;

                      return (
                        <g key={`r-draw-${r.id}`}>
                          <line x1={startX} y1="40" x2={endX} y2="40" stroke="#ef4444" strokeWidth="2" />
                          <rect x={midX - 16} y="28" width="32" height="24" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                          <text x={midX} y="43" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">{r.name}</text>
                          <text x={midX} y="62" textAnchor="middle" fill="#eab308" fontSize="7">{r.V}V</text>
                        </g>
                      );
                    } else {
                      // 跨越多個節點的大範圍並聯拱門線 (Arc Bridge Line)
                      const startX = r.startNode === 0 ? 60 : 60 + r.startNode * 50;
                      const endX = r.endNode === 99 ? 310 : 60 + r.endNode * 50;
                      const arcY = 80 + (idx % 3) * 30; // 下降包覆線

                      return (
                        <g key={`r-draw-span-${r.id}`}>
                          {/* 拱門跨接外圍導線 */}
                          <path d={`M ${startX} 40 L ${startX} ${arcY} L ${endX} ${arcY} L ${endX} ${r.endNode === 99 ? 180 : 40}`} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
                          <rect x={(startX + endX) / 2 - 18} y={arcY - 12} width="36" height="24" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                          <text x={(startX + endX) / 2} y={arcY + 3} textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">{r.name} (跨)</text>
                          <text x={(startX + endX) / 2} y={arcY + 20} textAnchor="middle" fill="#eab308" fontSize="7">{r.V}V</text>
                        </g>
                      );
                    })}
                  })}
                </svg>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-amber-300 block">💡 雙節點跨接機制：</strong>
                <p>• 若想讓 R6 跨接並聯 R1~R5，只需將 R6 設定為 **跨接起點: N0**、**跨接終點: N99 (或 N4)**，圖面上即會自動繪製紫色包覆外圍線路！</p>
              </div>
            </div>

            {/* 各電阻電流與跨壓細節 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：各電阻跨接節點與分流列表
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">幹道 I_total = {totalI} A</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[250px] overflow-y-auto">
                <div className="w-full space-y-2 font-mono text-xs">
                  {nodeResData.map((r) => (
                    <div key={`node-res-item-${r.id}`} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isSpan ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'}`}>
                          {r.isSpan ? `跨接 N${r.startNode}➔N${r.endNode}` : `主幹 N${r.startNode}➔N${r.endNode}`}
                        </span>
                        <span className="text-slate-200 font-bold">{r.name} ({r.value}Ω)</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-cyan-300 font-bold">電流 I = {r.I} A</span>
                        <span className="text-amber-300 font-bold">跨壓 V = {r.V} V</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-cyan-300 block">💡 歐姆定律跨壓分流：</strong>
                <p>• 跨接在相同起終點節點兩端的電阻（如 N0 與 N99），兩端跨壓必定相同。</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" /> KCL 節點電位矩陣求解過程
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
                <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 節點電位法 (Node Voltage Analysis) 矩陣解算：</p>
                {internalNodes.map((nId) => (
                  <p key={`calc-node-${nId}`}>
                    • 節點 N{nId} 計算電位：V_N{nId} = <strong className="text-cyan-300">{getNodeVoltage(nId)} V</strong>
                  </p>
                ))}
                <p>• 全電路總等效電阻 Req = V_source / I_total = {vSource} / {totalI} = <strong className="text-amber-300">{totalReq} Ω</strong></p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                點擊上方按鈕展開 KCL 導納矩陣求解細節。
              </div>
            )}
          </div>
        </div>
      )}

      {/* 頁面 2：惠斯同電橋實驗室 */}
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