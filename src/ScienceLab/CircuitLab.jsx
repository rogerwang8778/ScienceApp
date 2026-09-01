import React, { useState } from 'react';
import { Zap, Play, Pause, Calculator, Sliders, GitBranch } from 'lucide-react';

export default function CircuitLab() {
  const [vSource, setVSource] = useState(12); // 電源電壓 (V)
  const [isRunning, setIsRunning] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  // 惠斯同電橋五電阻阻值 (Ω)
  // R1: A->B, R2: B->D, R3: A->C, R4: C->D, R5(Bridge): B->C
  const [r1, setR1] = useState(6);
  const [r2, setR2] = useState(12);
  const [r3, setR3] = useState(4);
  const [r4, setR4] = useState(8);
  const [r5, setR5] = useState(10); // 橋臂電阻

  // ==========================================
  // 惠斯同電橋 KCL 方程式矩陣求解 (Node Voltage Method)
  // ==========================================
  const g1 = 1 / r1, g2 = 1 / r2, g3 = 1 / r3, g4 = 1 / r4, g5 = 1 / r5;

  const A_coeff = g1 + g2 + g5;
  const B_coeff = -g5;
  const C_const = vSource * g1;

  const D_coeff = -g5;
  const E_coeff = g3 + g4 + g5;
  const F_const = vSource * g3;

  // 克拉瑪公式解出 VB, VC
  const det = A_coeff * E_coeff - B_coeff * D_coeff;
  const vB = Number(((C_const * E_coeff - B_coeff * F_const) / det).toFixed(2));
  const vC = Number(((A_coeff * F_const - C_const * D_coeff) / det).toFixed(2));

  // 各支路電流
  const iR1 = Number(((vSource - vB) / r1).toFixed(2));
  const iR2 = Number((vB / r2).toFixed(2));
  const iR3 = Number(((vSource - vC) / r3).toFixed(2));
  const iR4 = Number((vC / r4).toFixed(2));
  const iR5 = Number(((vB - vC) / r5).toFixed(2)); // 橋臂電流 (B -> C)

  const iTotal = Number((iR1 + iR3).toFixed(2));
  const req = Number((vSource / iTotal).toFixed(2));

  // 是否達電橋平衡
  const isBalanced = Math.abs(vB - vC) < 0.05;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元四《惠斯同電橋與複雜網路》
        </h2>
        <p className="text-xs text-slate-400 mt-1">模擬惠斯同電橋 (Wheatstone Bridge) 平衡條件 (R1/R2 = R3/R4) 與中央橋臂電流為 0 之現象</p>
      </div>

      {/* 控制卡片 */}
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
              onClick={() => { setR1(6); setR2(12); setR3(4); setR4(8); }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5" /> 載入平衡比 (6:12 = 4:8)
            </button>
          </div>
        </div>

        {/* 5 電阻阻值控制 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">R1 (A-B)：</span>
              <span className="text-cyan-400 font-mono">{r1} Ω</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={r1}
              onChange={(e) => setR1(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">R2 (B-D)：</span>
              <span className="text-cyan-400 font-mono">{r2} Ω</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={r2}
              onChange={(e) => setR2(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">R3 (A-C)：</span>
              <span className="text-purple-400 font-mono">{r3} Ω</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={r3}
              onChange={(e) => setR3(Number(e.target.value))}
              className="w-full accent-purple-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">R4 (C-D)：</span>
              <span className="text-purple-400 font-mono">{r4} Ω</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={r4}
              onChange={(e) => setR4(Number(e.target.value))}
              className="w-full accent-purple-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-amber-800 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-300">R5 橋臂：</span>
              <span className="text-amber-400 font-mono">{r5} Ω</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={r5}
              onChange={(e) => setR5(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 總結資訊 */}
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

      {/* 雙圖呈現區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 第一張圖：惠斯同電橋電位結構圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> 第一張圖：惠斯同電橋電位圖 (節點點位)
            </span>
            <span className="text-[10px] text-slate-400">VB={vB}V ｜ VC={vC}V</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px]">
            <svg width="320" height="200" className="select-none font-mono text-[10px]">
              {/* 外圍電源 */}
              <rect x="15" y="80" width="30" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="30" y="104" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">{vSource}V</text>

              {/* 導線連接 (鑽石網格架構) */}
              <line x1="30" y1="80" x2="30" y2="30" stroke="#ef4444" strokeWidth="2.5" />
              <line x1="30" y1="30" x2="160" y2="30" stroke="#ef4444" strokeWidth="2.5" />

              <line x1="30" y1="120" x2="30" y2="170" stroke="#3b82f6" strokeWidth="2.5" />
              <line x1="30" y1="170" x2="160" y2="170" stroke="#3b82f6" strokeWidth="2.5" />

              <line x1="160" y1="30" x2="80" y2="100" stroke="#06b6d4" strokeWidth="2" />
              <line x1="80" y1="100" x2="160" y2="170" stroke="#06b6d4" strokeWidth="2" />

              <line x1="160" y1="30" x2="240" y2="100" stroke="#a855f7" strokeWidth="2" />
              <line x1="240" y1="100" x2="160" y2="170" stroke="#a855f7" strokeWidth="2" />

              {/* 中央跨接橋臂 R5 */}
              <line x1="80" y1="100" x2="240" y2="100" stroke={isBalanced ? '#10b981' : '#f59e0b'} strokeWidth="3" strokeDasharray={isBalanced ? 'none' : '4 4'} />

              {/* 電阻標籤 */}
              <rect x="105" y="52" width="30" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="120" y="65" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">R1={r1}Ω</text>

              <rect x="105" y="128" width="30" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="120" y="141" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">R2={r2}Ω</text>

              <rect x="185" y="52" width="30" height="20" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
              <text x="200" y="65" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">R3={r3}Ω</text>

              <rect x="185" y="128" width="30" height="20" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
              <text x="200" y="141" textAnchor="middle" fill="#a855f7" fontSize="8" fontWeight="bold">R4={r4}Ω</text>

              <rect x="145" y="90" width="30" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="160" y="103" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">R5={r5}Ω</text>

              {/* 節點標籤 */}
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
            <p>• 當 R1 / R2 = R3 / R4 （即 {r1}/{r2} = {r3}/{r4}）時，節點 B 與 C 的電位相等 (VB = VC = {vB}V)。</p>
            <p>• 此時橋臂電阻 R5 兩端無電壓差，因此完全沒有電流流過 R5 (I_R5 = 0A)。</p>
          </div>
        </div>

        {/* 第二張圖：各支路分流關係圖 */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> 第二張圖：各支路分流列表
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">幹道 I_total = {iTotal} A</span>
          </div>

          <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px] overflow-y-auto">
            <div className="w-full space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-bold">左側上支路 R1 ({r1}Ω)</span>
                <span className="text-cyan-300 font-bold">I_R1 = {iR1} A</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-bold">左側下支路 R2 ({r2}Ω)</span>
                <span className="text-cyan-300 font-bold">I_R2 = {iR2} A</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-bold">右側上支路 R3 ({r3}Ω)</span>
                <span className="text-purple-300 font-bold">I_R3 = {iR3} A</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-200 font-bold">右側下支路 R4 ({r4}Ω)</span>
                <span className="text-purple-300 font-bold">I_R4 = {iR4} A</span>
              </div>
              <div className={`flex justify-between items-center p-2.5 rounded-xl border ${isBalanced ? 'bg-emerald-950/60 border-emerald-700' : 'bg-amber-950/60 border-amber-700'}`}>
                <span className="text-amber-300 font-bold">中央橋臂 R5 ({r5}Ω) [B➔C]</span>
                <span className={`font-bold ${isBalanced ? 'text-emerald-400' : 'text-amber-300'}`}>I_R5 = {iR5} A</span>
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

      {/* 詳細計算過程 */}
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
            <p>1. 對 Node B 建立 KCL：(VB - {vSource})/{r1} + VB/{r2} + (VB - VC)/{r5} = 0 ➔ <strong className="text-cyan-300">VB = {vB} V</strong></p>
            <p>2. 對 Node C 建立 KCL：(VC - {vSource})/{r3} + VC/{r4} + (VC - VB)/{r5} = 0 ➔ <strong className="text-purple-300">VC = {vC} V</strong></p>
            <p>3. 橋臂電壓差：ΔV_BC = VB - VC = {vB} - {vC} = <strong className={isBalanced ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{(vB - vC).toFixed(2)} V</strong></p>
            <p>4. 全電路總等效電阻：Req = V_source / I_total = {vSource} / {iTotal} = <strong className="text-cyan-300">{req} Ω</strong></p>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-sans leading-relaxed">
            點擊上方按鈕展開節點電位法 VB, VC 與克拉瑪公式求解細節。
          </div>
        )}
      </div>
    </div>
  );
}