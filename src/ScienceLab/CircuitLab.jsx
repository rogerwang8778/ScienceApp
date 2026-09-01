import React, { useState } from 'react';
import { Zap, Play, Pause, RotateCcw, Calculator, Sliders } from 'lucide-react';

export default function CircuitLab() {
  // 電路型態: 'single' (單電阻) | 'series' (串聯) | 'parallel' (並聯)
  const [circuitType, setCircuitType] = useState('series');
  
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [r1, setR1] = useState(6);           // 電阻 R1 (Ω)
  const [r2, setR2] = useState(3);           // 電阻 R2 (Ω)

  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 電路物理量計算 (依歐姆定律)
  let req = 0;       // 總等效電阻 Ω
  let iTotal = 0;    // 總電流 A
  let vR1 = 0;       // R1 分壓 V
  let vR2 = 0;       // R2 分壓 V
  let iR1 = 0;       // R1 分流 A
  let iR2 = 0;       // R2 分流 A

  if (circuitType === 'single') {
    req = r1;
    iTotal = Number((vSource / req).toFixed(2));
    vR1 = vSource;
    iR1 = iTotal;
  } else if (circuitType === 'series') {
    req = r1 + r2;
    iTotal = Number((vSource / req).toFixed(2));
    iR1 = iTotal;
    iR2 = iTotal;
    vR1 = Number((iTotal * r1).toFixed(2));
    vR2 = Number((iTotal * r2).toFixed(2));
  } else if (circuitType === 'parallel') {
    req = Number(((r1 * r2) / (r1 + r2)).toFixed(2));
    iTotal = Number((vSource / req).toFixed(2));
    vR1 = vSource;
    vR2 = vSource;
    iR1 = Number((vSource / r1).toFixed(2));
    iR2 = Number((vSource / r2).toFixed(2));
  }

  const handleReset = () => {
    setIsRunning(true);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《基本電路與歐姆定律》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索電源電壓、同電位區域降壓變化與串並聯電路電流分流法則</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
        {/* 電路架構切換 */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'single', name: '單一電阻電路' },
            { id: 'series', name: '雙電阻串聯電路' },
            { id: 'parallel', name: '雙電阻並聯電路' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => { setCircuitType(type.id); handleReset(); }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                circuitType === type.id ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 變因調整滑桿 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">電源電壓 V (V)：</span>
              <span className="text-amber-400 font-mono">{vSource} V</span>
            </div>
            <input
              type="range" min="3" max="24" step="3" value={vSource}
              onChange={(e) => setVSource(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">電阻 R1 (Ω)：</span>
              <span className="text-cyan-400 font-mono">{r1} Ω</span>
            </div>
            <input
              type="range" min="1" max="12" step="1" value={r1}
              onChange={(e) => setR1(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {circuitType !== 'single' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">電阻 R2 (Ω)：</span>
                <span className="text-purple-400 font-mono">{r2} Ω</span>
              </div>
              <input
                type="range" min="1" max="12" step="1" value={r2}
                onChange={(e) => setR2(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center border-t border-slate-800 pt-3">
          <div className="text-xs font-mono text-slate-300">
            等效總電阻 Req = <strong className="text-amber-300">{req} Ω</strong> ｜ 幹道總電流 I_total = <strong className="text-cyan-300">{iTotal} A</strong>
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
            <button
              onClick={handleReset}
              className="p-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 雙圖呈現區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 第一張圖：電壓與同電位區域關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：電壓關係圖 (同電位顏色區分)
            </span>
            <span className="text-[10px] text-slate-400">高電位(紅) ➔ 零電位(藍)</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
            <svg width="320" height="180" className="select-none font-mono text-[10px]">
              {/* 電源 */}
              <rect x="20" y="70" width="30" height="40" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
              <text x="35" y="94" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

              {/* 單電阻電路圖 */}
              {circuitType === 'single' && (
                <g>
                  {/* 高電位導線 (紅色) */}
                  <path d="M 35 70 L 35 30 L 160 30" fill="none" stroke="#ef4444" strokeWidth="3" />
                  {/* 低電位導線 (藍色) */}
                  <path d="M 160 150 L 35 150 L 35 110" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  
                  {/* 電阻 R1 */}
                  <rect x="135" y="65" width="50" height="50" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
                  <text x="160" y="88" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">R1 = {r1}Ω</text>
                  <text x="160" y="104" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">V1 = {vR1}V</text>
                </g>
              )}

              {/* 雙電阻串聯電路圖 */}
              {circuitType === 'series' && (
                <g>
                  {/* 高電位區 (紅色) */}
                  <path d="M 35 70 L 35 30 L 110 30" fill="none" stroke="#ef4444" strokeWidth="3" />
                  {/* 中電位區 (黃色) */}
                  <path d="M 150 30 L 210 30" fill="none" stroke="#eab308" strokeWidth="3" />
                  {/* 低電位區 (藍色) */}
                  <path d="M 250 30 L 280 30 L 280 150 L 35 150 L 35 110" fill="none" stroke="#3b82f6" strokeWidth="3" />

                  {/* 電阻 R1 */}
                  <rect x="100" y="15" width="50" height="30" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="125" y="30" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">R1={r1}Ω</text>
                  <text x="125" y="58" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">V1={vR1}V</text>

                  {/* 電阻 R2 */}
                  <rect x="200" y="15" width="50" height="30" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                  <text x="225" y="30" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">R2={r2}Ω</text>
                  <text x="225" y="58" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="bold">V2={vR2}V</text>
                </g>
              )}

              {/* 雙電阻並聯電路圖 */}
              {circuitType === 'parallel' && (
                <g>
                  {/* 高電位區 (紅色全連通) */}
                  <path d="M 35 70 L 35 30 L 260 30 M 150 30 L 150 60 M 260 30 L 260 60" fill="none" stroke="#ef4444" strokeWidth="3" />
                  {/* 低電位區 (藍色全連通) */}
                  <path d="M 150 120 L 150 150 L 35 150 L 35 110 M 260 120 L 260 150" fill="none" stroke="#3b82f6" strokeWidth="3" />

                  {/* 支路 R1 */}
                  <rect x="125" y="60" width="50" height="60" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="150" y="85" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">R1={r1}Ω</text>
                  <text x="150" y="102" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">V1={vR1}V</text>

                  {/* 支路 R2 */}
                  <rect x="235" y="60" width="50" height="60" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                  <text x="260" y="85" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">R2={r2}Ω</text>
                  <text x="260" y="102" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">V2={vR2}V</text>
                </g>
              )}
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-amber-300 block">💡 電位與降壓觀念：</strong>
            <p>• 電荷流經電阻時將電能轉化為熱能/光能，產生電壓降 ΔV = IR。</p>
            <p>• 串聯電路中，總電壓由各電阻按比例瓜分 (V_total = V1 + V2)；並聯電路中，各支路兩端電壓相等 (V1 = V2 = V_source)。</p>
          </div>
        </div>

        {/* 第二張圖：電流關係與流向分流圖 */}
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

              {circuitType === 'single' && (
                <g>
                  <path d="M 35 70 L 35 30 L 160 30 L 160 65 M 160 115 L 160 150 L 35 150 L 35 110" fill="none" stroke="#38bdf8" strokeWidth="3" />
                  <rect x="135" y="65" width="50" height="50" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="160" y="88" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">R1 = {r1}Ω</text>
                  <text x="160" y="104" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">I1 = {iR1}A</text>
                </g>
              )}

              {circuitType === 'series' && (
                <g>
                  <path d="M 35 70 L 35 30 L 280 30 L 280 150 L 35 150 L 35 110" fill="none" stroke="#38bdf8" strokeWidth="3" />

                  <rect x="100" y="15" width="50" height="30" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="125" y="30" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">R1={r1}Ω</text>

                  <rect x="200" y="15" width="50" height="30" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                  <text x="225" y="30" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">R2={r2}Ω</text>

                  <text x="160" y="55" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">串聯等電流：I1 = I2 = {iTotal}A</text>
                </g>
              )}

              {circuitType === 'parallel' && (
                <g>
                  <path d="M 35 70 L 35 30 L 260 30 M 150 30 L 150 60 M 260 30 L 260 60" fill="none" stroke="#38bdf8" strokeWidth="3" />
                  <path d="M 150 120 L 150 150 L 35 150 L 35 110 M 260 120 L 260 150" fill="none" stroke="#38bdf8" strokeWidth="3" />

                  <rect x="125" y="60" width="50" height="60" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                  <text x="150" y="85" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">R1={r1}Ω</text>
                  <text x="150" y="102" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">I1={iR1}A</text>

                  <rect x="235" y="60" width="50" height="60" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                  <text x="260" y="85" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">R2={r2}Ω</text>
                  <text x="260" y="102" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">I2={iR2}A</text>
                </g>
              )}
            </svg>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1">
            <strong className="text-cyan-300 block">💡 電流守恆與分流法則：</strong>
            <p>• 串聯電路：單一迴路，處處電流相等 (I_total = I1 = I2)。</p>
            <p>• 並聯電路：節點分流，幹道總電流等於支路電流和 (I_total = I1 + I2)，電阻小者分得電流大。</p>
          </div>
        </div>
      </div>

      {/* 詳細計算過程展開卡 */}
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
            {circuitType === 'single' && (
              <>
                <p>1. 總等效電阻 Req = R1 = <strong className="text-cyan-300">{req} Ω</strong></p>
                <p>2. 幹道總電流 I_total = V / Req = {vSource} / {req} = <strong className="text-amber-300">{iTotal} A</strong></p>
              </>
            )}
            {circuitType === 'series' && (
              <>
                <p>1. 串聯等效電阻 Req = R1 + R2 = {r1} + {r2} = <strong className="text-cyan-300">{req} Ω</strong></p>
                <p>2. 幹道總電流 I_total = V / Req = {vSource} / {req} = <strong className="text-amber-300">{iTotal} A</strong></p>
                <p>3. R1 跨接分壓 V1 = I × R1 = {iTotal} × {r1} = <strong className="text-purple-300">{vR1} V</strong></p>
                <p>4. R2 跨接分壓 V2 = I × R2 = {iTotal} × {r2} = <strong className="text-purple-300">{vR2} V</strong></p>
              </>
            )}
            {circuitType === 'parallel' && (
              <>
                <p>1. 並聯等效電阻 1/Req = 1/R1 + 1/R2 ➔ Req = ({r1}×{r2})/({r1}+{r2}) = <strong className="text-cyan-300">{req} Ω</strong></p>
                <p>2. 幹道總電流 I_total = V / Req = {vSource} / {req} = <strong className="text-amber-300">{iTotal} A</strong></p>
                <p>3. R1 支路分流 I1 = V / R1 = {vSource} / {r1} = <strong className="text-emerald-300">{iR1} A</strong></p>
                <p>4. R2 支路分流 I2 = V / R2 = {vSource} / {r2} = <strong className="text-emerald-300">{iR2} A</strong></p>
              </>
            )}
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