import React, { useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Calculator, Sliders, Plus, Trash2, GitBranch } from 'lucide-react';

export default function CircuitLab() {
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 電阻節點網絡資料結構 (最多10個電阻)
  // connection: 'series' (串聯到上一節點) | 'parallel' (與上一節點並聯)
  const [resistorList, setResistorList] = useState([
    { id: 'r1', name: 'R1', value: 6, connection: 'series' },
    { id: 'r2', name: 'R2', value: 4, connection: 'series' },
    { id: 'r3', name: 'R3', value: 12, connection: 'parallel' }
  ]);

  // 新增電阻 (支援串聯/並聯選擇，上限10個)
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
  // 動態等效電阻與分壓分流演算法 (節點約簡)
  // ==========================================
  let req = 0;
  let resData = []; // [{ name, R, V, I, connection }]

  // 簡化連立計算：按順序進行簡併
  let currentReq = resistorList[0]?.value || 1;
  for (let i = 1; i < resistorList.length; i++) {
    const r = resistorList[i];
    if (r.connection === 'series') {
      currentReq += r.value;
    } else {
      currentReq = (currentReq * r.value) / (currentReq + r.value);
    }
  }
  req = Number(currentReq.toFixed(2));
  const iTotal = Number((vSource / req).toFixed(2));

  // 各電阻分壓與分流推導
  let accumV = vSource;
  resData = resistorList.map((r, idx) => {
    if (idx === 0) {
      const v = Number((iTotal * r.value).toFixed(2));
      return { ...r, V: v, I: iTotal };
    }
    if (r.connection === 'series') {
      const v = Number((iTotal * r.value).toFixed(2));
      return { ...r, V: v, I: iTotal };
    } else {
      // 與前一電阻並聯分流
      const prevR = resistorList[idx - 1].value;
      const rp = (prevR * r.value) / (prevR + r.value);
      const vp = Number((iTotal * rp).toFixed(2));
      const iVal = Number((vp / r.value).toFixed(2));
      return { ...r, V: vp, I: iVal };
    }
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《自由鏈接電路 (最多10個電阻自由串並聯)》
        </h2>
        <p className="text-xs text-slate-400 mt-1">自由新增電阻並切換串聯/並聯接點，即時分析高低電位降壓與分支分流</p>
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
        {/* 第一張圖：電壓與高低電位分佈圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：動態電位關係圖
            </span>
            <span className="text-[10px] text-slate-400">高電位(紅) ➔ 降壓(黃/紫) ➔ 零電位(藍)</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px] overflow-x-auto">
            <svg width="340" height="180" className="select-none font-mono text-[10px]">
              {/* 電源 */}
              <rect x="15" y="70" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="30" y="94" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

              {/* 外圍迴路導線 */}
              <path d="M 30 70 L 30 25 L 310 25 L 310 155 L 30 155 L 30 110" fill="none" stroke="#ef4444" strokeWidth="2.5" />

              {/* 繪製動態串並聯電阻矩陣 */}
              {resData.map((r, idx) => {
                const startX = 60 + idx * 25;
                return (
                  <g key={`v-map-${r.id}`}>
                    <rect x={startX} y="15" width="20" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                    <text x={startX + 10} y="29" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">{r.name}</text>
                    <text x={startX + 10} y="48" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">{r.V}V</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-amber-300 block">💡 電位與降壓規律：</strong>
            <p>• 每經過一個電阻即會產生電壓降 ΔV = I × R。</p>
            <p>• 並聯分支兩端跨接電壓相等，串聯分壓與阻值成正比。</p>
          </div>
        </div>

        {/* 第二張圖：電流與分流關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：各電阻電流與分流列表
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">I_total = {iTotal} A</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px] overflow-y-auto">
            <div className="w-full space-y-1.5 font-mono text-xs">
              {resData.map((r) => (
                <div key={`i-item-${r.id}`} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-300 font-bold">{r.name} ({r.value}Ω) [{r.connection === 'parallel' ? '並聯' : '串聯'}]</span>
                  <span className="text-cyan-300 font-bold">I = {r.I} A</span>
                  <span className="text-amber-300 font-bold">V = {r.V} V</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-cyan-300 block">💡 電流守恆與分流法則：</strong>
            <p>• 節點分流：流入節點總電流等於流出總電流。</p>
            <p>• 並聯支路中，阻值越小者分得電流越大 (I ∝ 1/R)。</p>
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
            <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 多電阻節點約簡算式 (V = {vSource}V)：</p>
            <p>1. 電阻鏈配置：{resistorList.map(r => `${r.name}(${r.value}Ω)[${r.connection}]`).join(' ➔ ')}</p>
            <p>2. 全電路總等效電阻 Req = <strong className="text-cyan-300">{req} Ω</strong></p>
            <p>3. 幹道總電流 I_total = V / Req = {vSource} / {req} = <strong className="text-amber-300">{iTotal} A</strong></p>
            {resData.map(r => (
              <p key={`calc-res-${r.id}`}>• {r.name} 電流 I_{r.name} = {r.I} A ｜ 跨接分壓 V_{r.name} = {r.V} V</p>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            點擊上方按鈕展開歐姆定律 V = IR 與全電路節點約簡推導細節。
          </div>
        )}
      </div>
    </div>
  );
}