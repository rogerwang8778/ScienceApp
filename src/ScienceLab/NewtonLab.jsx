import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, Pause, RotateCcw, Calculator, Compass, Scale } from 'lucide-react';

export default function NewtonLab() {
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'circular'

  // ==========================================
  // 1. 滑車與砝碼實驗 State & Logic
  // ==========================================
  const [mCart, setMCart] = useState(2);       // 滑車質量 kg
  const [mWeight, setMWeight] = useState(1);   // 砝碼質量 kg
  const [dFloor, setDFloor] = useState(2);     // 砝碼距離地面高度 m
  
  const [isCartRunning, setIsCartRunning] = useState(false);
  const [cartTime, setCartTime] = useState(0);
  const [showCartCalc, setShowCartCalc] = useState(false);

  const g = 10; // 重力加速度 10 m/s²

  // 物理量計算
  const totalM = mCart + mWeight;
  const a1 = Number(((mWeight * g) / totalM).toFixed(2)); // 落地前加速度
  const tension = Number((mCart * a1).toFixed(2));        // 繩張力 T = mCart * a
  const tDrop = Number(Math.sqrt((2 * dFloor) / a1).toFixed(2)); // 砝碼落地時間
  const vDrop = Number((a1 * tDrop).toFixed(2));          // 落地時速度

  // 模擬 Timer
  useEffect(() => {
    let interval = null;
    if (isCartRunning) {
      interval = setInterval(() => {
        setCartTime((prev) => {
          if (prev >= tDrop + 2) {
            setIsCartRunning(false);
            return Number((tDrop + 2).toFixed(2));
          }
          return Number((prev + 0.05).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isCartRunning, tDrop]);

  const handleResetCart = () => {
    setIsCartRunning(false);
    setCartTime(0);
  };

  // 當前即時狀態
  const isDropped = cartTime >= tDrop;
  const currentA = isDropped ? 0 : a1;
  const currentT = isDropped ? 0 : tension;
  const currentV = isDropped ? vDrop : Number((a1 * cartTime).toFixed(2));
  const currentX = isDropped
    ? Number((0.5 * a1 * tDrop * tDrop + vDrop * (cartTime - tDrop)).toFixed(2))
    : Number((0.5 * a1 * cartTime * cartTime).toFixed(2));

  const weightY = isDropped ? dFloor : Number((0.5 * a1 * cartTime * cartTime).toFixed(2));

  // ==========================================
  // 2. 圓周運動 State & Logic
  // ==========================================
  const [radius, setRadius] = useState(4);    // 半徑 r (m)
  const [omega, setOmega] = useState(2);      // 角速度 w (rad/s)
  const [showV, setShowV] = useState(true);   // 顯示切線速度
  const [showA, setShowA] = useState(true);   // 顯示向心加速度

  const [circAngle, setCircAngle] = useState(0); // 當前旋轉角度 (rad)
  const [isCircRunning, setIsCircRunning] = useState(true);
  const [showCircCalc, setShowCircCalc] = useState(false);

  const circV = Number((omega * radius).toFixed(2));
  const circAc = Number((omega * omega * radius).toFixed(2));

  useEffect(() => {
    let interval = null;
    if (isCircRunning) {
      interval = setInterval(() => {
        setCircAngle((prev) => (prev + 0.05 * omega) % (2 * Math.PI));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isCircRunning, omega]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          理化實驗室：國三上 單元二《牛頓運動定律（F=ma 與圓周運動）》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索滑車阿特伍德機兩階段運動受力與等速率圓周運動向心力切線向量</p>
      </div>

      {/* 子模組切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'cart' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-amber-300" /> 1. 滑車與砝碼實驗 (F=ma 與兩階段運動)
        </button>
        <button
          onClick={() => setActiveTab('circular')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'circular' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-300" /> 2. 等速率圓周運動 (向心力與切線速度)
        </button>
      </div>

      {/* 1. 滑車與砝碼實驗模組 */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          {/* 控制面板 */}
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">滑車質量 M (kg)：</span>
                <span className="text-amber-400 font-mono">{mCart} kg</span>
              </div>
              <input
                type="range" min="1" max="5" step="0.5" value={mCart}
                onChange={(e) => { setMCart(Number(e.target.value)); handleResetCart(); }}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">砝碼質量 m (kg)：</span>
                <span className="text-cyan-400 font-mono">{mWeight} kg</span>
              </div>
              <input
                type="range" min="0.5" max="3" step="0.5" value={mWeight}
                onChange={(e) => { setMWeight(Number(e.target.value)); handleResetCart(); }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">砝碼離地高度 h (m)：</span>
                <span className="text-purple-400 font-mono">{dFloor} m</span>
              </div>
              <input
                type="range" min="1" max="4" step="0.5" value={dFloor}
                onChange={(e) => { setDFloor(Number(e.target.value)); handleResetCart(); }}
                className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="md:col-span-3 flex justify-between items-center border-t border-slate-800 pt-3">
              <div className="text-xs font-mono text-slate-400">
                運動狀態：<strong className={isDropped ? 'text-emerald-400' : 'text-amber-400'}>
                  {isDropped ? '【階段二】砝碼已落地 (繩張力 T=0，滑車等速運動)' : '【階段一】砝碼下降中 (全系統等加速度運動)'}
                </strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCartRunning(!isCartRunning)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                    isCartRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isCartRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isCartRunning ? '暫停運動' : '開始釋放'}
                </button>
                <button
                  onClick={handleResetCart}
                  className="p-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 畫布：滑車與桌面 SVG 視覺化 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">🏎️ 滑車與砝碼實驗裝置</span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  t = {cartTime.toFixed(2)}s ｜ v = {currentV} m/s ｜ a = {currentA} m/s²
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                <svg width="340" height="200" className="select-none font-mono text-[10px]">
                  <line x1="20" y1="90" x2="260" y2="90" stroke="#64748b" strokeWidth="4" />
                  <line x1="260" y1="90" x2="260" y2="190" stroke="#64748b" strokeWidth="4" />
                  <circle cx="260" cy="90" r="8" fill="#475569" stroke="#94a3b8" strokeWidth="2" />

                  {(() => {
                    const cartPx = Math.min(230, 40 + currentX * 35);
                    const weightPy = Math.min(170, 90 + weightY * 20);

                    return (
                      <g>
                        <line x1={cartPx + 20} y1="78" x2="260" y2="78" stroke="#f59e0b" strokeWidth="2" />
                        <line x1="268" y1="90" x2="268" y2={weightPy} stroke={isDropped ? '#475569' : '#f59e0b'} strokeWidth="2" strokeDasharray={isDropped ? '3 3' : 'none'} />

                        <rect x={cartPx - 20} y="62" width="40" height="24" rx="4" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
                        <circle cx={cartPx - 10} cy="88" r="4" fill="#0f172a" />
                        <circle cx={cartPx + 10} cy="88" r="4" fill="#0f172a" />
                        <text x={cartPx} y="77" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                          {mCart}kg
                        </text>

                        {currentT > 0 && (
                          <g>
                            <line x1={cartPx + 20} y1="78" x2={cartPx + 45} y2="78" stroke="#10b981" strokeWidth="2" />
                            <polygon points={`${cartPx + 45},75 ${cartPx + 50},78 ${cartPx + 45},81`} fill="#10b981" />
                            <text x={cartPx + 32} y="70" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">
                              T={currentT}N
                            </text>
                          </g>
                        )}

                        <rect x="258" y={weightPy} width="20" height="20" rx="3" fill="#ec4899" stroke="#f472b6" strokeWidth="1.5" />
                        <text x="268" y={weightPy + 14} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                          {mWeight}kg
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">繩張力 T</span>
                  <span className="text-emerald-300 font-bold">{currentT} N</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">滑車合力 F_cart</span>
                  <span className="text-amber-300 font-bold">{(mCart * currentA).toFixed(1)} N</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">砝碼重力 W</span>
                  <span className="text-pink-300 font-bold">{mWeight * g} N</span>
                </div>
              </div>
            </div>

            {/* 右側：v-t 圖與計算過程 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-cyan-400 block border-b border-slate-800 pb-1.5">
                  📈 兩階段運動 v-t 圖 (折點為砝碼落地瞬間)
                </span>
                <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                  <svg width="240" height="150" className="select-none font-mono text-[10px]">
                    <line x1="30" y1="120" x2="220" y2="120" stroke="#64748b" strokeWidth="1.5" />
                    <line x1="30" y1="120" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
                    <text x="210" y="135" fill="#94a3b8">t(s)</text>
                    <text x="10" y="20" fill="#38bdf8">v(m/s)</text>

                    {(() => {
                      const maxT = tDrop + 2;
                      const maxV = Math.max(10, vDrop * 1.2);

                      const scaleT = 180 / maxT;
                      const scaleV = 100 / maxV;

                      const dropPx = 30 + tDrop * scaleT;
                      const dropPy = 120 - vDrop * scaleV;
                      const endPx = 30 + maxT * scaleT;

                      const currPx = 30 + cartTime * scaleT;
                      const currPy = 120 - currentV * scaleV;

                      return (
                        <g>
                          <line x1="30" y1="120" x2={dropPx} y2={dropPy} stroke="#f59e0b" strokeWidth="2.5" />
                          <line x1={dropPx} y1={dropPy} x2={endPx} y2={dropPy} stroke="#10b981" strokeWidth="2.5" />

                          <line x1={dropPx} y1="120" x2={dropPx} y2={dropPy} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
                          <text x={dropPx} y="133" textAnchor="middle" fill="#ef4444" fontSize="8">
                            t={tDrop}s
                          </text>

                          <circle cx={currPx} cy={currPy} r="4" fill="#38bdf8" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300">⚖️ F=ma 算式詳細拆解</span>
                  <button
                    onClick={() => setShowCartCalc(!showCartCalc)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" /> {showCartCalc ? '隱藏計算過程' : '詳細計算過程'}
                  </button>
                </div>

                {showCartCalc ? (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
                    <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 系統力學連立方程：</p>
                    <p>1. 全系統總質量 M_total = {mCart} + {mWeight} = <strong className="text-cyan-300">{totalM} kg</strong></p>
                    <p>2. 全系統加速度 a = m_weight × g / M_total = ({mWeight} × 10) / {totalM} = <strong className="text-amber-300">{a1} m/s²</strong></p>
                    <p>3. 繩張力 T = M_cart × a = {mCart} × {a1} = <strong className="text-emerald-300">{tension} N</strong></p>
                    <p>4. 落地瞬間速度 v_drop = a × t_drop = {a1} × {tDrop} = <strong className="text-purple-300">{vDrop} m/s</strong></p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-sans text-slate-400 space-y-1 leading-relaxed">
                    <strong className="text-amber-300 block">💡 考點總結：</strong>
                    <p>• 落地前：砝碼重力驅動全系統，做等加速度運動 (a = mg / (M+m))。</p>
                    <p>• 落地後：合力為 0 (T = 0)，滑車依慣性做等速度運動。</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 等速率圓周運動模組 */}
      {activeTab === 'circular' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">迴轉半徑 r (m)：</span>
                <span className="text-cyan-400 font-mono">{radius} m</span>
              </div>
              <input
                type="range" min="2" max="6" step="0.5" value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">角速度 ω (rad/s)：</span>
                <span className="text-amber-400 font-mono">{omega} rad/s</span>
              </div>
              <input
                type="range" min="1" max="4" step="0.5" value={omega}
                onChange={(e) => setOmega(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsCircRunning(!isCircRunning)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                  isCircRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isCircRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isCircRunning ? '暫停旋轉' : '開始旋轉'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">🔄 等速率圓周運動向量分析</span>
                <div className="flex gap-3 text-xs">
                  <label className="flex items-center gap-1 text-emerald-400 cursor-pointer">
                    <input type="checkbox" checked={showV} onChange={(e) => setShowV(e.target.checked)} className="accent-emerald-500" /> 切線速度 v
                  </label>
                  <label className="flex items-center gap-1 text-rose-400 cursor-pointer">
                    <input type="checkbox" checked={showA} onChange={(e) => setShowA(e.target.checked)} className="accent-rose-500" /> 向心加速度 a_c
                  </label>
                </div>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[240px]">
                <svg width="280" height="240" className="select-none font-mono text-[10px]">
                  <circle cx="140" cy="120" r="4" fill="#64748b" />
                  
                  {(() => {
                    const rPx = radius * 18;
                    const ballX = 140 + rPx * Math.cos(circAngle);
                    const ballY = 120 + rPx * Math.sin(circAngle);

                    const vxPx = -Math.sin(circAngle) * 35;
                    const vyPx = Math.cos(circAngle) * 35;

                    const axPx = -Math.cos(circAngle) * 30;
                    const ayPx = -Math.sin(circAngle) * 30;

                    return (
                      <g>
                        <circle cx="140" cy="120" r={rPx} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
                        <line x1="140" y1="120" x2={ballX} y2={ballY} stroke="#64748b" strokeWidth="1.5" />

                        <circle cx={ballX} cy={ballY} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

                        {showV && (
                          <g>
                            <line x1={ballX} y1={ballY} x2={ballX + vxPx} y2={ballY + vyPx} stroke="#10b981" strokeWidth="2.5" />
                            <text x={ballX + vxPx * 1.2} y={ballY + vyPx * 1.2} fill="#10b981" fontSize="10" fontWeight="bold">
                              v={circV}m/s
                            </text>
                          </g>
                        )}

                        {showA && (
                          <g>
                            <line x1={ballX} y1={ballY} x2={ballX + axPx} y2={ballY + ayPx} stroke="#f43f5e" strokeWidth="2.5" />
                            <text x={ballX + axPx * 0.6} y={ballY + ayPx * 0.6} fill="#f43f5e" fontSize="10" fontWeight="bold">
                              F_c
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">切線速度 v = ω·r</span>
                  <span className="text-emerald-300 font-bold">{circV} m/s</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">向心加速度 a_c = v²/r</span>
                  <span className="text-rose-300 font-bold">{circAc} m/s²</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300">⚖️ 圓周運動公式詳細拆解</span>
                  <button
                    onClick={() => setShowCircCalc(!showCircCalc)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5" /> {showCircCalc ? '隱藏計算過程' : '詳細計算過程'}
                  </button>
                </div>

                {showCircCalc ? (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
                    <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 圓周運動向量與加速度算式：</p>
                    <p>1. 切線速度 v = ω × r = {omega} × {radius} = <strong className="text-emerald-300">{circV} m/s</strong></p>
                    <p>2. 向心加速度 a_c = v² / r = {circV}² / {radius} = <strong className="text-rose-300">{circAc} m/s²</strong></p>
                    <p>3. 旋轉週期 T = 2π / ω = <strong className="text-cyan-300">{(2 * Math.PI / omega).toFixed(2)} 秒/圈</strong></p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-sans text-slate-400 space-y-1.5 leading-relaxed">
                    <strong className="text-cyan-300 block">💡 圓周運動三大方向法則：</strong>
                    <p>• 速度方向：恆沿圓周切線方向（若向心力消失，物體將沿切線飛出）。</p>
                    <p>• 向心力/加速度方向：恆指向圓心，負責改變速度的「方向」而非大小。</p>
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