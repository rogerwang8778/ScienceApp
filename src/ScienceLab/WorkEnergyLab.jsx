import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, Calculator, ArrowUpRight, Flame, Table } from 'lucide-react';

export default function WorkEnergyLab() {
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'conservation'

  // ==========================================
  // 1. 功能定理 State & Logic
  // ==========================================
  const [force, setForce] = useState(10);      // 施力 F (N)
  const [mass, setMass] = useState(2);        // 質量 m (kg)
  const [distance, setDistance] = useState(5);  // 目標位移 d (m)

  const [isWorkRunning, setIsWorkRunning] = useState(false);
  const [workTime, setWorkTime] = useState(0);
  const [showWorkCalc, setShowWorkCalc] = useState(false);

  // 物理量計算
  const accel = Number((force / mass).toFixed(2)); // 加速度 a = F/m
  const maxTime = Number(Math.sqrt((2 * distance) / accel).toFixed(2)); // 達到目標位移所需時間
  const finalV = Number((accel * maxTime).toFixed(2)); // 末速度
  const workDone = Number((force * distance).toFixed(2)); // 外力作功 W = F * d
  const finalEk = Number((0.5 * mass * finalV * finalV).toFixed(2)); // 末動能 Ek = 1/2 m v^2

  useEffect(() => {
    let interval = null;
    if (isWorkRunning) {
      interval = setInterval(() => {
        setWorkTime((prev) => {
          if (prev >= maxTime) {
            setIsWorkRunning(false);
            return maxTime;
          }
          return Number((prev + 0.05).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isWorkRunning, maxTime]);

  const handleResetWork = () => {
    setIsWorkRunning(false);
    setWorkTime(0);
  };

  // 當前即時物理量
  const currentX = Number((0.5 * accel * workTime * workTime).toFixed(2));
  const currentV = Number((accel * workTime).toFixed(2));
  const currentEk = Number((0.5 * mass * currentV * currentV).toFixed(2));
  const currentW = Number((force * currentX).toFixed(2));

  // ==========================================
  // 2. 力學能守恆 State & Logic (g = 10 m/s²)
  // ==========================================
  const [v0, setV0] = useState(20);            // 初速度 v0 (m/s)
  const [projMass, setProjMass] = useState(1); // 拋射質量 m (kg)

  const [isConsRunning, setIsConsRunning] = useState(false);
  const [consTime, setConsTime] = useState(0);
  const [showConsCalc, setShowConsCalc] = useState(false);

  const g = 10; // 重力加速度 10 m/s²

  const totalFlightTime = Number(((2 * v0) / g).toFixed(2)); // 總飛行時間 T = 2v0/g
  const maxHeight = Number(((v0 * v0) / (2 * g)).toFixed(2)); // 最高點 H = v0^2 / 2g
  const totalEnergy = Number((0.5 * projMass * v0 * v0).toFixed(2)); // 總力學能 E = 1/2 m v0^2

  useEffect(() => {
    let interval = null;
    if (isConsRunning) {
      interval = setInterval(() => {
        setConsTime((prev) => {
          if (prev >= totalFlightTime) {
            setIsConsRunning(false);
            return totalFlightTime;
          }
          return Number((prev + 0.05).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isConsRunning, totalFlightTime]);

  const handleResetCons = () => {
    setIsConsRunning(false);
    setConsTime(0);
  };

  // 逐秒數據表格
  const secondConsData = [];
  for (let t = 0; t <= Math.floor(totalFlightTime); t++) {
    const h = Math.max(0, v0 * t - 0.5 * g * t * t);
    const v = v0 - g * t;
    const ep = projMass * g * h;
    const ek = 0.5 * projMass * v * v;
    secondConsData.push({ t, h: Number(h.toFixed(2)), v: Number(v.toFixed(2)), ep: Number(ep.toFixed(2)), ek: Number(ek.toFixed(2)), total: Number((ep + ek).toFixed(2)) });
  }

  // 當前即時狀態
  const currH = Math.max(0, Number((v0 * consTime - 0.5 * g * consTime * consTime).toFixed(2)));
  const currV = Number((v0 - g * consTime).toFixed(2));
  const currEp = Number((projMass * g * currH).toFixed(2));
  const currEk = Number((0.5 * projMass * currV * currV).toFixed(2));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元三《功與能（功能定理與力學能守恆）》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索外力作功轉換動能與垂直上拋動能位能相互轉換之力學能守恆律</p>
      </div>

      {/* 子模組切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('work')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'work' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" /> 1. 功能定理 (W = ΔEk)
        </button>
        <button
          onClick={() => setActiveTab('conservation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'conservation' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" /> 2. 力學能守恆 (垂直上拋 Ek ↔ Ep)
        </button>
      </div>

      {/* 1. 功能定理模組 */}
      {activeTab === 'work' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">水平施力 F (N)：</span>
                <span className="text-amber-400 font-mono">{force} N</span>
              </div>
              <input
                type="range" min="2" max="30" step="2" value={force}
                onChange={(e) => { setForce(Number(e.target.value)); handleResetWork(); }}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">物體質量 m (kg)：</span>
                <span className="text-cyan-400 font-mono">{mass} kg</span>
              </div>
              <input
                type="range" min="1" max="5" step="0.5" value={mass}
                onChange={(e) => { setMass(Number(e.target.value)); handleResetWork(); }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">目標位移 d (m)：</span>
                <span className="text-purple-400 font-mono">{distance} m</span>
              </div>
              <input
                type="range" min="2" max="10" step="1" value={distance}
                onChange={(e) => { setDistance(Number(e.target.value)); handleResetWork(); }}
                className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="md:col-span-3 flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="text-xs font-mono text-slate-400">
                作功進度：<strong className="text-amber-300">{currentX} / {distance} m</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWorkRunning(!isWorkRunning)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                    isWorkRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isWorkRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isWorkRunning ? '暫停施力' : '開始推動'}
                </button>
                <button
                  onClick={handleResetWork}
                  className="p-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 視覺化推物畫面 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">📦 水平推力與作功轉換過程</span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  t = {workTime.toFixed(2)}s ｜ v = {currentV} m/s ｜ a = {accel} m/s²
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                <svg width="340" height="160" className="select-none font-mono text-[10px]">
                  {/* 地面 */}
                  <line x1="20" y1="120" x2="320" y2="120" stroke="#64748b" strokeWidth="2" />
                  {/* 目標位移標記 */}
                  <line x1="300" y1="90" x2="300" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="300" y="80" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">d = {distance}m</text>

                  {(() => {
                    const boxPx = Math.min(300, 40 + (currentX / distance) * 260);

                    return (
                      <g>
                        {/* 木塊 */}
                        <rect x={boxPx - 20} y="80" width="40" height="40" rx="4" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                        <text x={boxPx} y="104" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                          {mass}kg
                        </text>

                        {/* 施力箭頭 F */}
                        {workTime < maxTime && (
                          <g>
                            <line x1={boxPx + 20} y1="100" x2={boxPx + 50} y2="100" stroke="#f59e0b" strokeWidth="3" />
                            <polygon points={`${boxPx + 50},96 ${boxPx + 58},100 ${boxPx + 50},104`} fill="#f59e0b" />
                            <text x={boxPx + 35} y="90" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                              F={force}N
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">外力作功 W = F·d</span>
                  <span className="text-amber-300 font-bold">{currentW} J</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">當前速度 v</span>
                  <span className="text-cyan-300 font-bold">{currentV} m/s</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">當前動能 Ek</span>
                  <span className="text-emerald-300 font-bold">{currentEk} J</span>
                </div>
              </div>
            </div>

            {/* 右側：計算過程拆解 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300">⚖️ 功能定理公式詳細拆解</span>
                  <button
                    onClick={() => setShowWorkCalc(!showWorkCalc)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" /> {showWorkCalc ? '隱藏計算過程' : '詳細計算過程'}
                  </button>
                </div>

                {showWorkCalc ? (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
                    <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 作功與動能轉換算式驗證：</p>
                    <p>1. 加速度 a = F / m = {force} / {mass} = <strong className="text-cyan-300">{accel} m/s²</strong></p>
                    <p>2. 末速度 v = √(2ad) = √(2 × {accel} × {distance}) = <strong className="text-purple-300">{finalV} m/s</strong></p>
                    <p>3. 外力作功 W = F × d = {force} × {distance} = <strong className="text-amber-300">{workDone} J</strong></p>
                    <p>4. 物體末動能 Ek = ½ × m × v² = 0.5 × {mass} × ({finalV})² = <strong className="text-emerald-300">{finalEk} J</strong></p>
                    <p className="text-emerald-400 font-bold border-t border-slate-800 pt-1">✅ 驗證結論：外力作功 W ({workDone}J) ＝ 動能變化量 ΔEk ({finalEk}J)</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-sans text-slate-400 space-y-1.5 leading-relaxed">
                    <strong className="text-amber-300 block">💡 功能定理核心觀念：</strong>
                    <p>• **合力對物體所作的功，等於物體動能的變化量** ($W = \Delta E_k$)。</p>
                    <p>• 若合力作正功（與運動同向），物體動能增加、速度變快；若合力作負功，動能減少。</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 力學能守恆模組 */}
      {activeTab === 'conservation' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">上拋初速度 v₀ (m/s)：</span>
                <span className="text-cyan-400 font-mono">{v0} m/s</span>
              </div>
              <input
                type="range" min="10" max="40" step="5" value={v0}
                onChange={(e) => { setV0(Number(e.target.value)); handleResetCons(); }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">物體質量 m (kg)：</span>
                <span className="text-amber-400 font-mono">{projMass} kg</span>
              </div>
              <input
                type="range" min="1" max="5" step="1" value={projMass}
                onChange={(e) => { setProjMass(Number(e.target.value)); handleResetCons(); }}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="text-xs font-mono text-amber-300">
                ⚡ 重力加速度預設為國中標準：<strong>g = 10 m/s²</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConsRunning(!isConsRunning)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                    isConsRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isConsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isConsRunning ? '暫停運動' : '開始上拋'}
                </button>
                <button
                  onClick={handleResetCons}
                  className="p-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左側：垂直上拋畫布與即時能態 */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">🚀 垂直上拋運動軌跡</span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  t = {consTime.toFixed(2)}s ｜ h = {currH}m ｜ v = {currV}m/s
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                <svg width="280" height="200" className="select-none font-mono text-[10px]">
                  <line x1="40" y1="170" x2="240" y2="170" stroke="#64748b" strokeWidth="2" />

                  {(() => {
                    const ballPy = Math.max(30, 170 - (currH / maxHeight) * 130);

                    return (
                      <g>
                        {/* 最高點虛線 */}
                        <line x1="30" y1="40" x2="250" y2="40" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="240" y="35" textAnchor="end" fill="#ef4444" fontSize="9">H_max = {maxHeight}m</text>

                        {/* 上拋小球 */}
                        <circle cx="140" cy={ballPy} r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="140" y={ballPy - 12} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                          {currV}m/s
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* 即時能態長條比對 */}
              <div className="space-y-2 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-400">動能 Ek = {currEk} J</span>
                  <span className="text-purple-400">位能 Ep = {currEp} J</span>
                  <span className="text-amber-300">總力學能 E = {totalEnergy} J</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(currEk / totalEnergy) * 100}%` }} className="bg-emerald-500 h-full transition-all" />
                  <div style={{ width: `${(currEp / totalEnergy) * 100}%` }} className="bg-purple-500 h-full transition-all" />
                </div>
              </div>
            </div>

            {/* 右側：逐秒表格與詳細計算 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-emerald-400" /> 逐秒能態變化與算式
                  </span>
                  <button
                    onClick={() => setShowConsCalc(!showConsCalc)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" /> {showConsCalc ? '隱藏計算過程' : '詳細計算過程'}
                  </button>
                </div>

                {showConsCalc ? (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
                    <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 力學能守恆點位拆解 (g = 10 m/s²)：</p>
                    <p>1. 拋出點 (h=0)：Ep = 0，Ek = ½×{projMass}×{v0}² = <strong className="text-emerald-300">{totalEnergy} J</strong></p>
                    <p>2. 最高點 (v=0)：H = {maxHeight}m，Ek = 0，Ep = {projMass}×10×{maxHeight} = <strong className="text-purple-300">{totalEnergy} J</strong></p>
                    <p className="text-emerald-400 font-bold border-t border-slate-800 pt-1">✅ 守恆證明：全程 E_total = Ek + Ep = <strong className="text-amber-300">{totalEnergy} J</strong> 恆為常數。</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] font-mono text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                          <th className="p-1.5">時間(s)</th>
                          <th className="p-1.5">高度(m)</th>
                          <th className="p-1.5">速度(m/s)</th>
                          <th className="p-1.5">Ek(J)</th>
                          <th className="p-1.5">Ep(J)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {secondConsData.map((row) => (
                          <tr key={`cons-row-${row.t}`} className="border-b border-slate-800/60 text-slate-300">
                            <td className="p-1.5 font-bold text-amber-300">{row.t}s</td>
                            <td className="p-1.5">{row.h}m</td>
                            <td className="p-1.5">{row.v}m/s</td>
                            <td className="p-1.5 text-emerald-300">{row.ek}J</td>
                            <td className="p-1.5 text-purple-300">{row.ep}J</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}