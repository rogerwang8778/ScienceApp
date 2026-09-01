import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Sliders, Plus, Trash2, GitBranch, Layers } from 'lucide-react';

export default function CircuitLab() {
  const [activeTab, setActiveTab] = useState('custom');
  const [vSource, setVSource] = useState(12);
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // ==========================================
  // 頁面 1：階層化自由鏈接電路 State & Logic
  // parentId: 'trunk' 表示在幹道上，或為其他電阻 id (如 'r3') 表示與該電阻同支路串聯
  // connection: 'series' | 'parallel'
  // ==========================================
  const [resistorList, setResistorList] = useState([
    { id: 'r1', name: 'R1', value: 6, connection: 'series', parentId: 'trunk' },
    { id: 'r2', name: 'R2', value: 6, connection: 'series', parentId: 'trunk' },
    { id: 'r3', name: 'R3', value: 6, connection: 'parallel', parentId: 'trunk' },
    { id: 'r4', name: 'R4', value: 6, connection: 'series', parentId: 'r3' } // 指定與 R3 支路串聯
  ]);

  const addResistor = () => {
    if (resistorList.length < 10) {
      const idx = resistorList.length + 1;
      const newId = `r${idx}`;
      setResistorList([
        ...resistorList,
        { id: newId, name: `R${idx}`, value: 6, connection: 'series', parentId: 'trunk' }
      ]);
    }
  };

  const removeResistor = (id) => {
    if (resistorList.length > 1) {
      setResistorList(
        resistorList
          .filter((r) => r.id !== id)
          .map((r) => (r.parentId === id ? { ...r, parentId: 'trunk', connection: 'series' } : r))
      );
    }
  };

  const updateResistorProp = (id, key, val) => {
    setResistorList(resistorList.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
  };

  // 階層化等效電阻與分流演算法
  // 1. 整理幹道與分支結構
  const trunkItems = resistorList.filter((r) => r.parentId === 'trunk');
  const childMap = {};
  resistorList.forEach((r) => {
    if (r.parentId !== 'trunk') {
      if (!childMap[r.parentId]) childMap[r.parentId] = [];
      childMap[r.parentId].push(r);
    }
  });

  // 計算每個主元件/分支的有效阻值
  const calculateEffectiveR = (r) => {
    let baseR = r.value;
    const children = childMap[r.id] || [];
    if (children.length > 0) {
      const childrenSum = children.reduce((sum, c) => sum + c.value, 0);
      baseR += childrenSum; // 支路內串聯相加
    }
    return baseR;
  };

  // 分組並聯與幹道串聯
  let groups = [];
  trunkItems.forEach((r) => {
    if (r.connection === 'series' || groups.length === 0) {
      groups.push([r]);
    } else {
      groups[groups.length - 1].push(r);
    }
  });

  const groupReqs = groups.map((group) => {
    if (group.length === 1) return calculateEffectiveR(group[0]);
    const invSum = group.reduce((sum, item) => sum + 1 / calculateEffectiveR(item), 0);
    return Number((1 / invSum).toFixed(2));
  });

  const customReq = Number(groupReqs.reduce((sum, rG) => sum + rG, 0).toFixed(2));
  const customITotal = Number((vSource / customReq).toFixed(2));

  // 計算每個電阻的即時 V 與 I
  const customResData = [];
  groups.forEach((group, gIdx) => {
    const vGroup = Number((customITotal * groupReqs[gIdx]).toFixed(2));
    group.forEach((r) => {
      const effR = calculateEffectiveR(r);
      const iBranch = group.length === 1 ? customITotal : Number((vGroup / effR).toFixed(2));

      // 主電阻
      const vMain = Number((iBranch * r.value).toFixed(2));
      customResData.push({ ...r, V: vMain, I: iBranch, inParallelGroup: group.length > 1, parentName: '幹道' });

      // 綁定在此電阻下的子串聯電阻
      const children = childMap[r.id] || [];
      children.forEach((c) => {
        const vChild = Number((iBranch * c.value).toFixed(2));
        customResData.push({ ...c, V: vChild, I: iBranch, inParallelGroup: true, parentName: `串聯至 ${r.name}` });
      });
    });
  });

  // ==========================================
  // 頁面 2：惠斯同電橋 State & Logic
  // ==========================================
  const [br1, setBr1] = useState(6);
  const [br2, setBr2] = useState(12);
  const [br3, setBr3] = useState(4);
  const [br4, setBr4] = useState(8);
  const [br5, setBr5] = useState(10);

  const g1 = 1 / br1, g2 = 1 / br2, g3 = 1 / br3, g4 = 1 / br4, g5 = 1 / br5;
  const A_coeff = g1 + g2 + g5, B_coeff = -g5, C_const = vSource * g1;
  const D_coeff = -g5, E_coeff = g3 + g4 + g5, F_const = vSource * g3;

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
          理化實驗室：國三上 單元四《基本電路與階層化拓樸》
        </h2>
        <p className="text-xs text-slate-400 mt-1">自由選擇電阻連接目標（可與指定電阻串聯/並聯），分析多重階層分壓與分流</p>
      </div>

      {/* 頁面切換頁籤 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'custom' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-300" /> 頁面 1：自由鏈接電路 (指定電阻串並聯)
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

      {/* 頁面 1：自由鏈接電路 */}
      {activeTab === 'custom' && (
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
                onClick={addResistor}
                disabled={resistorList.length >= 10}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> 新增電阻 (+R)
              </button>
            </div>

            {/* 電阻卡片設定區 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {resistorList.map((r, idx) => (
                <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 relative">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-200">{r.name}</span>
                    {idx > 0 && (
                      <div className="flex gap-1">
                        {/* 選擇拓樸關係 */}
                        <select
                          value={r.connection}
                          onChange={(e) => updateResistorProp(r.id, 'connection', e.target.value)}
                          className="bg-slate-800 text-[10px] text-cyan-300 rounded px-1 py-0.5 border border-slate-700"
                        >
                          <option value="series">串聯 (+)</option>
                          <option value="parallel">並聯 (||)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 選擇綁定目標位置 */}
                  {idx > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">連接目標位置：</span>
                      <select
                        value={r.parentId}
                        onChange={(e) => updateResistorProp(r.id, 'parentId', e.target.value)}
                        className="w-full bg-slate-900 text-[11px] text-amber-300 rounded px-1.5 py-1 border border-slate-700"
                      >
                        <option value="trunk">主幹道 (Trunk)</option>
                        {resistorList
                          .filter((other) => other.id !== r.id && other.parentId === 'trunk')
                          .map((other) => (
                            <option key={`opt-${other.id}`} value={other.id}>
                              與 {other.name} 同支路串聯
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-400">阻值：</span>
                    <span className="text-cyan-400 font-mono font-bold">{r.value} Ω</span>
                  </div>
                  <input
                    type="range" min="1" max="20" step="1" value={r.value}
                    onChange={(e) => updateResistorProp(r.id, 'value', Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
                  />

                  {resistorList.length > 1 && (
                    <button
                      onClick={() => removeResistor(r.id)}
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
                電阻總數：<strong className="text-purple-300">{resistorList.length} / 10 個</strong> ｜ 等效總電阻 Req = <strong className="text-amber-300">{customReq} Ω</strong> ｜ 幹道總電流 I_total = <strong className="text-cyan-300">{customITotal} A</strong>
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
            {/* 動態階層圖 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：動態階層拓樸與電位圖
                </span>
                <span className="text-[10px] text-slate-400">高電位(紅) ➔ 降壓區 ➔ 零電位(藍)</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-x-auto">
                <svg width="340" height="200" className="select-none font-mono text-[10px]">
                  <rect x="15" y="80" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="30" y="104" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

                  <line x1="30" y1="80" x2="30" y2="30" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="30" y1="30" x2="60" y2="30" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="30" y1="120" x2="30" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="30" y1="170" x2="310" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="310" y1="170" x2="310" y2="30" stroke="#3b82f6" strokeWidth="2.5" />

                  {(() => {
                    let currentX = 60;
                    const groupWidth = 240 / groups.length;

                    return groups.map((group, gIdx) => {
                      const xStart = currentX;
                      const xEnd = currentX + groupWidth;
                      currentX = xEnd;

                      const midX = (xStart + xEnd) / 2;

                      return (
                        <g key={`g-${gIdx}`}>
                          <line x1={xStart} y1="30" x2={xEnd} y2="30" stroke="#ef4444" strokeWidth="2.5" />
                          {group.map((item, subIdx) => {
                            const children = childMap[item.id] || [];
                            const rData = customResData.find((d) => d.id === item.id);
                            const py = 30 + subIdx * 40;

                            return (
                              <g key={`sub-${item.id}`}>
                                {subIdx > 0 && <line x1={midX} y1="30" x2={midX} y2={py} stroke="#a855f7" strokeWidth="2" />}
                                <rect x={midX - 22} y={py - 12} width="44" height="24" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                                <text x={midX} y={py + 3} textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">
                                  {item.name}{children.length > 0 ? `+${children.map((c) => c.name).join('+')}` : ''}
                                </text>
                                <text x={midX} y={py + 22} textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold">
                                  V={rData?.V}V
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-amber-300 block">💡 階層拓樸解析：</strong>
                <p>• 可選擇將電阻綁定至**指定電阻**（例如與 R3 同支路串聯），系統會將其視為同一分支內部之串聯阻值。</p>
              </div>
            </div>

            {/* 電流關係圖 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：電流關係與分支列表
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">幹道 I_total = {customITotal} A</span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-y-auto">
                <div className="w-full space-y-2 font-mono text-xs">
                  {customResData.map((r) => (
                    <div key={`i-item-${r.id}`} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.parentId !== 'trunk' ? 'bg-amber-950 text-amber-300 border border-amber-700' : r.inParallelGroup ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'}`}>
                          {r.parentName}
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
                <strong className="text-cyan-300 block">💡 階層分流定律：</strong>
                <p>• 與指定電阻串聯的元件（如與 R3 串聯之 R4）共享相同之支路電流。</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" /> 階層化拓樸詳細計算過程
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
                <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 階層化拓樸歐姆定律約簡步驟 (V = {vSource}V)：</p>
                {resistorList.map((r) => {
                  const children = childMap[r.id] || [];
                  if (children.length > 0) {
                    return (
                      <p key={`calc-branch-${r.id}`}>
                        • 支路 {r.name} 內部串聯：R_{r.name}_branch = {r.name}({r.value}Ω) + {children.map((c) => `${c.name}(${c.value}Ω)`).join(' + ')} = {calculateEffectiveR(r)} Ω
                      </p>
                    );
                  }
                  return null;
                })}
                <p>• 全電路總等效電阻 Req = <strong className="text-cyan-300">{customReq} Ω</strong></p>
                <p>• 幹道總電流 I_total = V / Req = {vSource} / {customReq} = <strong className="text-amber-300">{customITotal} A</strong></p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-sans leading-relaxed">
                點擊上方按鈕展開歐姆定律 V = IR 與階層化拓樸約簡推導細節。
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