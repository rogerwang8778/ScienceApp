import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Sliders, Plus, Trash2, GitBranch } from 'lucide-react';

export default function CircuitLab() {
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 電阻節點網絡資料結構 (最多10個電阻)
  // connection: 'series' (串聯) | 'parallel' (與前一電阻並聯)
  const [resistorList, setResistorList] = useState([
    { id: 'r1', name: 'R1', value: 6, connection: 'series' },
    { id: 'r2', name: 'R2', value: 6, connection: 'series' },
    { id: 'r3', name: 'R3', value: 6, connection: 'parallel' },
    { id: 'r4', name: 'R4', value: 6, connection: 'series' }
  ]);

  // 新增電阻
  const addResistor = (type) => {
    if (resistorList.length < 10) {
      const idx = resistorList.length + 1;
      setResistorList([
        ...resistorList,
        { id: `r${idx}`, name: `R${idx}`, value: 6, connection: type }
      ]);
    }
  };

  const removeResistor = (id) => {
    if (resistorList.length > 1) {
      setResistorList(resistorList.filter(r => r.id !== id));
    }
  };

  const updateResistorVal = (id, val) => {
    setResistorList(resistorList.map(r => r.id === id ? { ...r, value: Math.max(1, val) } : r));
  };

  const updateResistorConn = (id, conn) => {
    setResistorList(resistorList.map(r => r.id === id ? { ...r, connection: conn } : r));
  };

  // ==========================================
  // 電路物理量精確計算 (分組化求解)
  // ==========================================
  // 將連續並聯標示的電阻歸類為同一並聯組 Group
  let groups = [];
  resistorList.forEach((r) => {
    if (r.connection === 'series' || groups.length === 0) {
      groups.push([r]);
    } else {
      groups[groups.length - 1].push(r);
    }
  });

  // 計算每組 Group 的等效電阻 R_group
  const groupReqs = groups.map(group => {
    if (group.length === 1) return group[0].value;
    const invSum = group.reduce((sum, item) => sum + (1 / item.value), 0);
    return Number((1 / invSum).toFixed(2));
  });

  // 計算總等效電阻 Req (各組串聯)
  const req = Number(groupReqs.reduce((sum, rG) => sum + rG, 0).toFixed(2));
  const iTotal = Number((vSource / req).toFixed(2));

  // 計算每個電阻的即時 V 與 I
  const resData = [];
  groups.forEach((group, gIdx) => {
    const vGroup = Number((iTotal * groupReqs[gIdx]).toFixed(2));
    group.forEach(r => {
      if (group.length === 1) {
        resData.push({ ...r, V: vGroup, I: iTotal, groupIdx: gIdx, inParallelGroup: false });
      } else {
        const iBranch = Number((vGroup / r.value).toFixed(2));
        resData.push({ ...r, V: vGroup, I: iBranch, groupIdx: gIdx, inParallelGroup: true });
      }
    });
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《自由鏈接電路 (最多10個電阻自由串並聯)》
        </h2>
        <p className="text-xs text-slate-400 mt-1">自由新增電阻與切換串聯/並聯接點，圖示同步呈現電位分佈與分支分流</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
        {/* 電源與新增按鈕 */}
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

          <div className="flex gap-2">
            <button
              onClick={() => addResistor('series')}
              disabled={resistorList.length >= 10}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> 串聯新增 (+R)
            </button>
            <button
              onClick={() => addResistor('parallel')}
              disabled={resistorList.length >= 10}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5" /> 並聯新增 (||R)
            </button>
          </div>
        </div>

        {/* 電阻列表配置區 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {resistorList.map((r, idx) => (
            <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 relative">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-200">{r.name}</span>
                {idx > 0 && (
                  <select
                    value={r.connection}
                    onChange={(e) => updateResistorConn(r.id, e.target.value)}
                    className="bg-slate-800 text-[10px] text-cyan-300 rounded px-1 py-0.5 border border-slate-700"
                  >
                    <option value="series">串聯 (+)</option>
                    <option value="parallel">並聯 (||)</option>
                  </select>
                )}
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">阻值：</span>
                <span className="text-cyan-400 font-mono font-bold">{r.value} Ω</span>
              </div>
              <input
                type="range" min="1" max="20" step="1" value={r.value}
                onChange={(e) => updateResistorVal(r.id, Number(e.target.value))}
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

        {/* 總結資訊與按鈕 */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3">
          <div className="text-xs font-mono text-slate-300">
            電阻總數：<strong className="text-purple-300">{resistorList.length} / 10 個</strong> ｜ 等效總電阻 Req = <strong className="text-amber-300">{req} Ω</strong> ｜ 幹道總電流 I_total = <strong className="text-cyan-300">{iTotal} A</strong>
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

      {/* 雙圖呈現區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 第一張圖：動態串並聯電位圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：動態電位與串並聯結構圖
            </span>
            <span className="text-[10px] text-slate-400">高電位(紅) ➔ 降壓區 ➔ 零電位(藍)</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-x-auto">
            <svg width="340" height="200" className="select-none font-mono text-[10px]">
              {/* 外圍電源 */}
              <rect x="15" y="80" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="30" y="104" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

              {/* 幹道導線 */}
              <line x1="30" y1="80" x2="30" y2="30" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="30" y1="30" x2="60" y2="30" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="30" y1="120" x2="30" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
              <line x1="30" y1="170" x2="310" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
              <line x1="310" y1="170" x2="310" y2="30" stroke="#3b82f6" strokeWidth="2.5" />

              {/* 動態繪製組別 (Group Layout) */}
              {(() => {
                let currentX = 60;
                const groupWidth = 240 / groups.length;

                return groups.map((group, gIdx) => {
                  const xStart = currentX;
                  const xEnd = currentX + groupWidth;
                  currentX = xEnd;

                  if (group.length === 1) {
                    const item = group[0];
                    const rData = resData.find(d => d.id === item.id);
                    const midX = (xStart + xEnd) / 2;

                    return (
                      <g key={`g-${gIdx}`}>
                        <line x1={xStart} y1="30" x2={xEnd} y2="30" stroke="#ef4444" strokeWidth="2.5" />
                        <rect x={midX - 18} y="18" width="36" height="24" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                        <text x={midX} y="34" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">{item.name}</text>
                        <text x={midX} y="54" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">V={rData?.V}V</text>
                      </g>
                    );
                  } else {
                    const midX = (xStart + xEnd) / 2;

                    return (
                      <g key={`g-${gIdx}`}>
                        <line x1={xStart} y1="30" x2={xEnd} y2="30" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
                        <line x1={midX} y1="30" x2={midX} y2={30 + group.length * 35} stroke="#a855f7" strokeWidth="2" />

                        {group.map((item, subIdx) => {
                          const rData = resData.find(d => d.id === item.id);
                          const py = 30 + subIdx * 35;

                          return (
                            <g key={`sub-${item.id}`}>
                              <line x1={midX - 25} y1={py} x2={midX + 25} y2={py} stroke="#a855f7" strokeWidth="2" />
                              <rect x={midX - 18} y={py - 12} width="36" height="24" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                              <text x={midX} y={py + 3} textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">{item.name}</text>
                              <text x={midX + 28} y={py + 3} textAnchor="start" fill="#eab308" fontSize="8" fontWeight="bold">V={rData?.V}V</text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  }
                });
              })()}
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-amber-300 block">💡 串並聯結構圖示解析：</strong>
            <p>• 串聯元件：導線直線穿過（如青色框），共享幹道電流。</p>
            <p>• 並聯分支：主幹線垂直分叉為平行線路（紫色框），各分支跨接電壓相等。</p>
          </div>
        </div>

        {/* 第二張圖：分流與動態電流關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：電流關係圖 (各分支分流)
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">幹道 I_total = {iTotal} A</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-y-auto">
            <div className="w-full space-y-2 font-mono text-xs">
              {resData.map((r) => (
                <div key={`i-item-${r.id}`} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.inParallelGroup ? 'bg-purple-950 text-purple-300 border border-purple-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'}`}>
                      {r.inParallelGroup ? '並聯分支' : '串聯幹線'}
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
            <strong className="text-cyan-300 block">💡 電流守恆與分流法則：</strong>
            <p>• 節點分流：流入節點總電流等於各分支流出總和 (I_total = I1 + I2 + ...)。</p>
            <p>• 串聯同電流：串聯路徑上電流處處相等。</p>
          </div>
        </div>
      </div>

      {/* 詳細計算過程 */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" /> 多電阻約簡詳細計算過程
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
            <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 分組歐姆定律約簡步驟 (V = {vSource}V)：</p>
            <p>1. 全電路組態分組：{groups.length} 個分段區塊</p>
            {groups.map((g, idx) => (
              <p key={`grp-calc-${idx}`}>• 第 {idx + 1} 組 ({g.map(i => i.name).join(' || ')}) 等效電阻：R_group = {groupReqs[idx]} Ω</p>
            ))}
            <p>2. 全電路總等效電阻 Req = {groupReqs.join(' + ')} = <strong className="text-cyan-300">{req} Ω</strong></p>
            <p>3. 幹道總電流 I_total = V / Req = {vSource} / {req} = <strong className="text-amber-300">{iTotal} A</strong></p>
            {resData.map(r => (
              <p key={`calc-res-${r.id}`}>• {r.name} ({r.value}Ω)：電流 I_{r.name} = {r.I} A ｜ 跨接分壓 V_{r.name} = {r.V} V</p>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            點擊上方按鈕展開歐姆定律 V = IR 與全電路分組約簡推導細節。
          </div>
        )}
      </div>
    </div>
  );
}