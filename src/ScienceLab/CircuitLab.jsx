import React, { useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Calculator, Sliders, Plus, Trash2 } from 'lucide-react';

export default function CircuitLab() {
  // 電路拓樸型態:
  // 'series' (純串聯) | 'parallel' (純並聯) | 'hybridA' (R1 + R2||R3) | 'hybridB' ((R1+R2)||R3) | 'hybridC' ((R1||R2) + (R3||R4))
  const [topology, setTopology] = useState('hybridA');
  
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)

  // 電阻清單 (每個電阻含獨立阻值)
  const [resistors, setResistors] = useState([
    { id: 'r1', name: 'R1', value: 6 },
    { id: 'r2', name: 'R2', value: 4 },
    { id: 'r3', name: 'R3', value: 12 },
    { id: 'r4', name: 'R4', value: 6 }
  ]);

  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 調整單一電阻阻值
  const handleResistorChange = (id, val) => {
    setResistors(resistors.map(r => r.id === id ? { ...r, value: Math.max(1, val) } : r));
  };

  // 增加/減少電阻數量
  const addResistor = () => {
    if (resistors.length < 4) {
      const newId = `r${resistors.length + 1}`;
      setResistors([...resistors, { id: newId, name: `R${resistors.length + 1}`, value: 6 }]);
    }
  };

  const removeResistor = (id) => {
    if (resistors.length > 1) {
      setResistors(resistors.filter(r => r.id !== id));
    }
  };

  // 取得數值對照表
  const getR = (idx) => resistors[idx]?.value || 1;

  // ==========================================
  // 電路解算引擎 (依據拓樸計算 Req, I_total, Vi, Ii)
  // ==========================================
  let req = 0;
  let iTotal = 0;
  let resData = []; // [{ name, R, V, I }]
  let calcSteps = [];

  const r1 = getR(0);
  const r2 = getR(1);
  const r3 = getR(2);
  const r4 = getR(3);

  if (topology === 'series') {
    // 1. 純串聯
    req = resistors.reduce((sum, r) => sum + r.value, 0);
    iTotal = Number((vSource / req).toFixed(2));
    resData = resistors.map(r => ({
      name: r.name,
      R: r.value,
      I: iTotal,
      V: Number((iTotal * r.value).toFixed(2))
    }));
    calcSteps = [
      `1. 純串聯總等效電阻：Req = ${resistors.map(r => r.value).join(' + ')} = ${req} Ω`,
      `2. 幹道總電流：I_total = V / Req = ${vSource} / ${req} = ${iTotal} A`,
      `3. 串聯電路中處處電流相等：I1 = I2 = ... = ${iTotal} A`,
      ...resData.map(r => `• ${r.name} 跨接分壓：V_${r.name} = I × ${r.name} = ${iTotal} × ${r.R} = ${r.V} V`)
    ];
  } else if (topology === 'parallel') {
    // 2. 純並聯
    const invReq = resistors.reduce((sum, r) => sum + (1 / r.value), 0);
    req = Number((1 / invReq).toFixed(2));
    iTotal = Number((vSource / req).toFixed(2));
    resData = resistors.map(r => {
      const iVal = Number((vSource / r.value).toFixed(2));
      return {
        name: r.name,
        R: r.value,
        V: vSource,
        I: iVal
      };
    });
    calcSteps = [
      `1. 純並聯總等效電阻：1/Req = ${resistors.map(r => `1/${r.value}`).join(' + ')} ➔ Req = ${req} Ω`,
      `2. 各並聯支路兩端電壓均等於電源電壓：V1 = V2 = ... = ${vSource} V`,
      `3. 幹道總電流：I_total = V / Req = ${vSource} / ${req} = ${iTotal} A`,
      ...resData.map(r => `• ${r.name} 支路分流：I_${r.name} = V / ${r.name} = ${vSource} / ${r.R} = ${r.I} A`)
    ];
  } else if (topology === 'hybridA') {
    // 3. 混聯 A：R1 + (R2 || R3)
    const rp = Number(((r2 * r3) / (r2 + r3)).toFixed(2));
    req = Number((r1 + rp).toFixed(2));
    iTotal = Number((vSource / req).toFixed(2));

    const vR1 = Number((iTotal * r1).toFixed(2));
    const vParallel = Number((vSource - vR1).toFixed(2));

    const iR2 = Number((vParallel / r2).toFixed(2));
    const iR3 = Number((vParallel / r3).toFixed(2));

    resData = [
      { name: 'R1', R: r1, V: vR1, I: iTotal },
      { name: 'R2', R: r2, V: vParallel, I: iR2 },
      { name: 'R3', R: r3, V: vParallel, I: iR3 }
    ];

    calcSteps = [
      `1. 計算支路 (R2 || R3) 並聯等效電阻：R_parallel = (R2 × R3) / (R2 + R3) = (${r2}×${r3})/(${r2}+${r3}) = ${rp} Ω`,
      `2. 計算全電路總等效電阻：Req = R1 + R_parallel = ${r1} + ${rp} = ${req} Ω`,
      `3. 幹道總電流：I_total = V / Req = ${vSource} / ${req} = ${iTotal} A`,
      `4. R1 幹道分壓：V_R1 = I_total × R1 = ${iTotal} × ${r1} = ${vR1} V`,
      `5. 並聯區兩端電壓：V_parallel = V_source - V_R1 = ${vSource} - ${vR1} = ${vParallel} V`,
      `6. R2 支路分流：I_R2 = V_parallel / R2 = ${vParallel} / ${r2} = ${iR2} A`,
      `7. R3 支路分流：I_R3 = V_parallel / R3 = ${vParallel} / ${r3} = ${iR3} A`
    ];
  } else if (topology === 'hybridB') {
    // 4. 混聯 B：(R1 + R2) || R3
    const rs = r1 + r2;
    req = Number(((rs * r3) / (rs + r3)).toFixed(2));
    iTotal = Number((vSource / req).toFixed(2));

    const iBranch1 = Number((vSource / rs).toFixed(2));
    const iBranch2 = Number((vSource / r3).toFixed(2));

    const vR1 = Number((iBranch1 * r1).toFixed(2));
    const vR2 = Number((iBranch1 * r2).toFixed(2));

    resData = [
      { name: 'R1', R: r1, V: vR1, I: iBranch1 },
      { name: 'R2', R: r2, V: vR2, I: iBranch1 },
      { name: 'R3', R: r3, V: vSource, I: iBranch2 }
    ];

    calcSteps = [
      `1. 計算支路 1 串聯等效電阻：R_branch1 = R1 + R2 = ${r1} + ${r2} = ${rs} Ω`,
      `2. 計算總等效電阻：Req = (R_branch1 × R3) / (R_branch1 + R3) = (${rs}×${r3})/(${rs}+${r3}) = ${req} Ω`,
      `3. 幹道總電流：I_total = V / Req = ${vSource} / ${req} = ${iTotal} A`,
      `4. 支路 1 電流：I_branch1 = V / R_branch1 = ${vSource} / ${rs} = ${iBranch1} A`,
      `5. R1 分壓：V_R1 = I_branch1 × R1 = ${iBranch1} × ${r1} = ${vR1} V`,
      `6. R2 分壓：V_R2 = I_branch1 × R2 = ${iBranch1} × ${r2} = ${vR2} V`,
      `7. R3 支路分流：I_R3 = V / R3 = ${vSource} / ${r3} = ${iBranch2} A`
    ];
  } else if (topology === 'hybridC') {
    // 5. 混聯 C：(R1 || R2) + (R3 || R4)
    const rp1 = Number(((r1 * r2) / (r1 + r2)).toFixed(2));
    const rp2 = Number(((r3 * r4) / (r3 + r4)).toFixed(2));
    req = Number((rp1 + rp2).toFixed(2));
    iTotal = Number((vSource / req).toFixed(2));

    const vGroup1 = Number((iTotal * rp1).toFixed(2));
    const vGroup2 = Number((iTotal * rp2).toFixed(2));

    const iR1 = Number((vGroup1 / r1).toFixed(2));
    const iR2 = Number((vGroup1 / r2).toFixed(2));
    const iR3 = Number((vGroup2 / r3).toFixed(2));
    const iR4 = Number((vGroup2 / r4).toFixed(2));

    resData = [
      { name: 'R1', R: r1, V: vGroup1, I: iR1 },
      { name: 'R2', R: r2, V: vGroup1, I: iR2 },
      { name: 'R3', R: r3, V: vGroup2, I: iR3 },
      { name: 'R4', R: r4, V: vGroup2, I: iR4 }
    ];

    calcSteps = [
      `1. 第一組並聯電阻：Rp1 = (R1×R2)/(R1+R2) = (${r1}×${r2})/(${r1}+${r2}) = ${rp1} Ω`,
      `2. 第二組並聯電阻：Rp2 = (R3×R4)/(R3+R4) = (${r3}×${r4})/(${r3}+${r4}) = ${rp2} Ω`,
      `3. 總等效電阻：Req = Rp1 + Rp2 = ${rp1} + ${rp2} = ${req} Ω`,
      `4. 幹道總電流：I_total = V / Req = ${vSource} / ${req} = ${iTotal} A`,
      `5. 第一組分壓：V_group1 = I_total × Rp1 = ${iTotal} × ${rp1} = ${vGroup1} V`,
      `6. 第二組分壓：V_group2 = I_total × Rp2 = ${iTotal} × ${rp2} = ${vGroup2} V`
    ];
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《基本電路與多電阻自由混聯》
        </h2>
        <p className="text-xs text-slate-400 mt-1">自由調控電路拓樸、電阻數量與阻值，分析同電位區域降壓與分流狀態</p>
      </div>

      {/* 控制卡片 */}
      <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
        {/* 拓樸選擇 */}
        <div>
          <span className="text-xs text-slate-300 font-bold block mb-2">1. 選擇電路拓樸架構 (Circuit Topology)：</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 'series', name: '純串聯 (Series)' },
              { id: 'parallel', name: '純並聯 (Parallel)' },
              { id: 'hybridA', name: '混聯 A: R1 + (R2 || R3)' },
              { id: 'hybridB', name: '混聯 B: (R1+R2) || R3' },
              { id: 'hybridC', name: '混聯 C: (R1||R2) + (R3||R4)' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTopology(item.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  topology === item.id ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* 電壓與電阻控制 */}
        <div className="space-y-3 border-t border-slate-800 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-bold">2. 電源與電阻參數調控：</span>
            {(topology === 'series' || topology === 'parallel') && (
              <div className="flex gap-2">
                <button
                  onClick={addResistor}
                  disabled={resistors.length >= 4}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 新增電阻
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 電源電壓 */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">電源 V (V)：</span>
                <span className="text-amber-400 font-mono">{vSource} V</span>
              </div>
              <input
                type="range" min="3" max="36" step="3" value={vSource}
                onChange={(e) => setVSource(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* 電阻設定 */}
            {resistors.map((r, idx) => {
              if (topology === 'hybridA' && idx >= 3) return null;
              if (topology === 'hybridB' && idx >= 3) return null;

              return (
                <div key={r.id} className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 relative">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{r.name} (Ω)：</span>
                    <span className="text-cyan-400 font-mono">{r.value} Ω</span>
                  </div>
                  <input
                    type="range" min="1" max="20" step="1" value={r.value}
                    onChange={(e) => handleResistorChange(r.id, Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  {(topology === 'series' || topology === 'parallel') && resistors.length > 1 && (
                    <button
                      onClick={() => removeResistor(r.id)}
                      className="absolute top-1 right-1 text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 即時總數值 */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-3">
          <div className="text-xs font-mono text-slate-300">
            總等效電阻 Req = <strong className="text-amber-300">{req} Ω</strong> ｜ 幹道總電流 I_total = <strong className="text-cyan-300">{iTotal} A</strong>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? '暫停開關' : '接通電路'}
            </button>
          </div>
        </div>
      </div>

      {/* 雙圖呈現區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 第一張圖：電壓關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：電壓關係圖 (同電位區分)
            </span>
            <span className="text-[10px] text-slate-400">高電位(紅) ➔ 低電位(藍)</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
            <svg width="320" height="180" className="select-none font-mono text-[10px]">
              {/* 電源 */}
              <rect x="20" y="70" width="30" height="40" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
              <text x="35" y="94" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

              {/* 拓樸 A: R1 + (R2 || R3) */}
              {topology === 'hybridA' && (
                <g>
                  {/* 高電位 (紅) */}
                  <path d="M 35 70 L 35 30 L 100 30" fill="none" stroke="#ef4444" strokeWidth="3" />
                  {/* 中電位 (黃) */}
                  <path d="M 140 30 L 200 30 M 200 30 L 200 60 M 200 30 L 200 120" fill="none" stroke="#eab308" strokeWidth="3" />
                  {/* 低電位 (藍) */}
                  <path d="M 270 60 L 270 30 L 290 30 L 290 150 L 35 150 L 35 110 M 270 120 L 270 150" fill="none" stroke="#3b82f6" strokeWidth="3" />

                  {/* R1 */}
                  <rect x="95" y="15" width="45" height="30" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="117" y="32" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">R1={r1}Ω</text>
                  <text x="117" y="58" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">V1={resData[0]?.V}V</text>

                  {/* R2 */}
                  <rect x="210" y="45" width="50" height="30" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                  <text x="235" y="62" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">R2={r2}Ω</text>
                  <text x="235" y="88" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="bold">V2={resData[1]?.V}V</text>

                  {/* R3 */}
                  <rect x="210" y="105" width="50" height="30" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                  <text x="235" y="122" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">R3={r3}Ω</text>
                  <text x="235" y="148" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="bold">V3={resData[2]?.V}V</text>
                </g>
              )}

              {/* 通用純串/純並簡圖 */}
              {(topology === 'series' || topology === 'parallel' || topology === 'hybridB' || topology === 'hybridC') && (
                <g>
                  <path d="M 35 70 L 35 30 L 280 30 L 280 150 L 35 150 L 35 110" fill="none" stroke="#ef4444" strokeWidth="3" />
                  <text x="160" y="90" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">
                    {resistors.length} 個電阻配置完畢
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-amber-300 block">💡 同電位區域與降壓規律：</strong>
            <p>• 同一條無電阻導線上處處為**等電位**（顏色相同）。</p>
            <p>• 電荷流經每個電阻時均會產生**電壓降 ΔV = I × R**。</p>
          </div>
        </div>

        {/* 第二張圖：電流關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：電流關係圖 (分流與流量標示)
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">I_total = {iTotal} A</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
            <svg width="320" height="180" className="select-none font-mono text-[10px]">
              <rect x="20" y="70" width="30" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="35" y="94" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">{iTotal}A</text>

              {/* 各電阻電流列表圖 */}
              <g>
                <path d="M 35 70 L 35 30 L 280 30 L 280 150 L 35 150 L 35 110" fill="none" stroke="#38bdf8" strokeWidth="3" />
                {resData.map((r, idx) => (
                  <g key={`current-item-${idx}`}>
                    <text x="160" y={50 + idx * 25} textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                      {r.name} 電流：I_{r.name} = {r.I} A （跨接分壓 V={r.V}V）
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-cyan-300 block">💡 電流分流與守恆定律：</strong>
            <p>• 節點分流：流入節點總電流等於流出總電流。</p>
            <p>• 並聯支路中，阻值越小者分得電流越大 ($I \propto 1/R$)。</p>
          </div>
        </div>
      </div>

      {/* 詳細計算過程 */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-400" /> 電路物理量詳細計算過程
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
            <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 歐姆定律與串並聯等效計算 (V = {vSource}V)：</p>
            {calcSteps.map((step, idx) => (
              <p key={`step-${idx}`}>{step}</p>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            點擊上方按鈕展開歐姆定律 V = IR 與串並聯等效電阻推導細節。
          </div>
        )}
      </div>
    </div>
  );
}