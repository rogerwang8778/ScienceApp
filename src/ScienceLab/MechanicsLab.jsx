import React, { useState } from 'react';
import { ArrowRight, Calculator, Scale, Droplets, Info, RefreshCw } from 'lucide-react';

export default function MechanicsLab() {
  const [activeTab, setActiveTab] = useState('friction'); // 'friction' | 'buoyancy'

  // ==========================================
  // 1. 摩擦力模擬器 State
  // ==========================================
  const [weight, setWeight] = useState(10); // 物體重量/正向力 N (kgw 或 N)
  const [muS, setMuS] = useState(0.5);      // 靜摩擦係數 mu_s
  const [muK, setMuK] = useState(0.3);      // 動摩擦係數 mu_k
  const [pushForce, setPushForce] = useState(3); // 外力 F

  // 計算摩擦力相關參數
  const maxFs = Number((weight * muS).toFixed(1)); // 最大靜摩擦力 f_s_max = mu_s * N
  const fk = Number((weight * muK).toFixed(1));    // 動摩擦力 f_k = mu_k * N

  let currentFriction = 0;
  let motionState = '靜止'; // '靜止' | '恰好欲動' | '加速運動'
  let stateColor = 'text-emerald-400';

  if (pushForce === 0) {
    currentFriction = 0;
    motionState = '靜止 (無受外力)';
    stateColor = 'text-slate-400';
  } else if (pushForce < maxFs) {
    currentFriction = pushForce;
    motionState = '靜止 (受靜摩擦力)';
    stateColor = 'text-emerald-400';
  } else if (pushForce === maxFs) {
    currentFriction = maxFs;
    motionState = '恰好欲動 (臨界點)';
    stateColor = 'text-amber-400';
  } else {
    currentFriction = fk;
    motionState = '運動中 (受動摩擦力)';
    stateColor = 'text-rose-400';
  }

  // ==========================================
  // 2. 浮力模擬器 State
  // ==========================================
  const [mass, setMass] = useState(150);       // 物體質量 (g)
  const [volume, setVolume] = useState(100);    // 物體體積 (cm³)
  const [liquidDensity, setLiquidDensity] = useState(1.0); // 液體密度 (g/cm³)
  const [showCalculation, setShowCalculation] = useState(false);

  // 物體密度 rho = m / V
  const objectDensity = Number((mass / volume).toFixed(2));
  
  // 物體重力 W (以 g 或 kgw 標示相當於重量 1g = 1gw)
  const weightG = mass; // 重力 (gw)

  let state = 'sink'; // 'float' | 'suspend' | 'sink'
  let vSub = 0;       // 沒入液體體積 cm³
  let buoyancy = 0;   // 浮力 B (gw)
  let normalForce = 0; // 正向力 N (gw)

  if (objectDensity < liquidDensity) {
    state = 'float'; // 浮體
    buoyancy = weightG; // 浮力等於物重
    vSub = Number((buoyancy / liquidDensity).toFixed(1)); // V_下 = B / rho_L
    normalForce = 0;
  } else if (Math.abs(objectDensity - liquidDensity) < 0.001) {
    state = 'suspend'; // 懸浮
    buoyancy = weightG;
    vSub = volume;
    normalForce = 0;
  } else {
    state = 'sink'; // 沉體
    vSub = volume; // 完全沒入
    buoyancy = Number((vSub * liquidDensity).toFixed(1)); // B = V_下 * rho_L
    normalForce = Number((weightG - buoyancy).toFixed(1)); // N = W - B
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          理化實驗室：國二下 單元六《力學（摩擦力與浮力）》
        </h2>
        <p className="text-xs text-slate-400 mt-1">動態模擬靜/動摩擦力轉換關係與阿基米德浮力原理沉浮條件</p>
      </div>

      {/* 子模組分頁 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('friction')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'friction' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-amber-300" /> 1. 摩擦力與推力關係模擬器
        </button>
        <button
          onClick={() => setActiveTab('buoyancy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'buoyancy' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-300" /> 2. 浮力與沉浮條件模擬器
        </button>
      </div>

      {/* 1. 摩擦力模擬模組 */}
      {activeTab === 'friction' && (
        <div className="space-y-6">
          {/* 變因滑桿控制卡片 */}
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">物體重量 / 正向力 (N)：</span>
                <span className="text-amber-400 font-mono">{weight} kgw</span>
              </div>
              <input
                type="range" min="1" max="50" value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">靜摩擦係數 (μₛ)：</span>
                <span className="text-emerald-400 font-mono">{muS}</span>
              </div>
              <input
                type="range" min="0.1" max="1.0" step="0.05" value={muS}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMuS(val);
                  if (val < muK) setMuK(val);
                }}
                className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">動摩擦係數 (μₖ)：</span>
                <span className="text-cyan-400 font-mono">{muK}</span>
              </div>
              <input
                type="range" min="0.05" max={muS} step="0.05" value={muK}
                onChange={(e) => setMuK(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">水平推力 F (kgw)：</span>
                <span className="text-rose-400 font-mono">{pushForce} kgw</span>
              </div>
              <input
                type="range" min="0" max="40" step="0.5" value={pushForce}
                onChange={(e) => setPushForce(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 畫面視覺化：物體受力物理模擬 & F-f 座標圖表 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左側：物體水平面受力動畫圖 */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" /> 物體水平受力動態
                </span>
                <span className={`text-xs font-mono font-bold ${stateColor}`}>
                  狀態：{motionState}
                </span>
              </div>

              {/* 受力情境向量圖 SVG */}
              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                <svg width="320" height="160" className="select-none font-mono">
                  {/* 水平面 */}
                  <line x1="20" y1="120" x2="300" y2="120" stroke="#64748b" strokeWidth="4" />
                  {/* 斜線地面紋理 */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line key={i} x1={30 + i * 20} y1="120" x2={20 + i * 20} y2={132} stroke="#475569" strokeWidth="2" />
                  ))}

                  {/* 木塊物體 */}
                  <rect x="110" y="60" width="100" height="60" rx="8" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
                  <text x="160" y="95" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">
                    m ({weight}kg)
                  </text>

                  {/* 推力箭頭 (向右) */}
                  {pushForce > 0 && (
                    <g>
                      <line x1="210" y1="90" x2={210 + Math.min(pushForce * 2.5, 75)} y2="90" stroke="#f43f5e" strokeWidth="3.5" />
                      <polygon points={`${210 + Math.min(pushForce * 2.5, 75)},85 ${220 + Math.min(pushForce * 2.5, 75)},90 ${210 + Math.min(pushForce * 2.5, 75)},95`} fill="#f43f5e" />
                      <text x={220 + Math.min(pushForce * 2.5, 75)} y="82" fill="#f43f5e" fontSize="11" fontWeight="bold">
                        F={pushForce}
                      </text>
                    </g>
                  )}

                  {/* 摩擦力箭頭 (向左) */}
                  {currentFriction > 0 && (
                    <g>
                      <line x1="110" y1="118" x2={110 - Math.min(currentFriction * 2.5, 75)} y2="118" stroke="#10b981" strokeWidth="3.5" />
                      <polygon points={`${110 - Math.min(currentFriction * 2.5, 75)},113 ${100 - Math.min(currentFriction * 2.5, 75)},118 ${110 - Math.min(currentFriction * 2.5, 75)},123`} fill="#10b981" />
                      <text x={90 - Math.min(currentFriction * 2.5, 75)} y="112" fill="#10b981" fontSize="11" fontWeight="bold">
                        f={currentFriction}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* 關鍵數值摘要 */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">最大靜摩擦力 fₛ,max</span>
                  <span className="text-amber-300 font-bold">{maxFs} kgw</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">動摩擦力 fₖ</span>
                  <span className="text-cyan-300 font-bold">{fk} kgw</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">當前受摩擦力 f</span>
                  <span className="text-emerald-300 font-bold">{currentFriction} kgw</span>
                </div>
              </div>
            </div>

            {/* 右側：施力與摩擦力關係圖 (F-f 圖) */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <span className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                📈 施力 (F) 與 摩擦力 (f) 關係圖解
              </span>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                <svg width="300" height="180" className="select-none font-mono">
                  {/* 網格與座標軸 */}
                  <line x1="40" y1="150" x2="280" y2="150" stroke="#64748b" strokeWidth="2" />
                  <line x1="40" y1="150" x2="40" y2="20" stroke="#64748b" strokeWidth="2" />
                  <text x="275" y="168" fill="#94a3b8" fontSize="10">F(推力)</text>
                  <text x="15" y="25" fill="#94a3b8" fontSize="10">f(摩擦)</text>

                  {/* 靜摩擦斜線 (f = F) 到 (maxFs, maxFs) */}
                  <line x1="40" y1="150" x2={40 + maxFs * 4} y2={150 - maxFs * 4} stroke="#10b981" strokeWidth="2.5" />
                  {/* 陡降至動摩擦力 */}
                  <line x1={40 + maxFs * 4} y1={150 - maxFs * 4} x2={40 + maxFs * 4} y2={150 - fk * 4} stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                  {/* 動摩擦平直線 */}
                  <line x1={40 + maxFs * 4} y1={150 - fk * 4} x2="270" y2={150 - fk * 4} stroke="#06b6d4" strokeWidth="2.5" />

                  {/* 當前施力狀態標籤點 */}
                  {pushForce <= maxFs ? (
                    <circle cx={40 + pushForce * 4} cy={150 - pushForce * 4} r="5" fill="#f43f5e" />
                  ) : (
                    <circle cx={40 + pushForce * 4} cy={150 - fk * 4} r="5" fill="#f43f5e" />
                  )}

                  {/* 頂點標示 (最大靜摩擦力) */}
                  <circle cx={40 + maxFs * 4} cy={150 - maxFs * 4} r="3" fill="#f59e0b" />
                  <text x={40 + maxFs * 4 + 5} y={150 - maxFs * 4 - 5} fill="#f59e0b" fontSize="10">fₛ,max</text>
                </svg>
              </div>

              <div className="text-[11px] font-sans text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                <strong className="text-amber-300 block mb-1">💡 理化核心觀念：</strong>
                1. 未推動前，靜摩擦力等於外力 ($f_s = F$)，成 45° 正比斜線。<br/>
                2. 恰好欲動瞬間達「最大靜摩擦力 ($f_{s,\text{max}} = \mu_s \times N$)」。<br/>
                3. 推動後變為「動摩擦力 ($f_k = \mu_k \times N$)」，數值固定且略小於最大靜摩擦力。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 浮力與沉浮條件模擬模組 */}
      {activeTab === 'buoyancy' && (
        <div className="space-y-6">
          {/* 控制控制卡片 */}
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">物體質量 (m)：</span>
                <span className="text-amber-400 font-mono">{mass} g</span>
              </div>
              <input
                type="range" min="20" max="300" step="5" value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">物體體積 (V)：</span>
                <span className="text-cyan-400 font-mono">{volume} cm³</span>
              </div>
              <input
                type="range" min="20" max="250" step="5" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">液體密度 (ρₗ)：</span>
                <span className="text-blue-400 font-mono">{liquidDensity} g/cm³</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1" value={liquidDensity}
                onChange={(e) => setLiquidDensity(Number(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 畫面視覺化：阿基米德水槽燒杯與受力分析卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左側：燒杯液體沉浮動態 */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" /> 液體沉浮狀態模擬
                </span>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  state === 'float' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  state === 'suspend' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {state === 'float' ? '浮體 (D物 < D液)' : state === 'suspend' ? '懸浮 (D物 = D液)' : '沉體 (D物 > D液)'}
                </span>
              </div>

              {/* 燒杯模擬圖 SVG */}
              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                <svg width="240" height="200" className="select-none font-mono">
                  {/* 燒杯外框 */}
                  <rect x="50" y="20" width="140" height="160" rx="4" fill="none" stroke="#94a3b8" strokeWidth="3" />
                  
                  {/* 水位刻度線與水 */}
                  <rect x="53" y="60" width="134" height="117" fill="rgba(56, 189, 248, 0.25)" />
                  <line x1="53" y1="60" x2="187" y2="60" stroke="#38bdf8" strokeWidth="2" />

                  {/* 物體放置位置計算 */}
                  {(() => {
                    let yPos = 60; // 預設浮在水面
                    if (state === 'float') {
                      const hRatio = vSub / volume;
                      yPos = 60 - 40 * (1 - hRatio); // 部分露在水面上
                    } else if (state === 'suspend') {
                      yPos = 100; // 懸浮於水中
                    } else {
                      yPos = 135; // 觸底
                    }

                    return (
                      <g>
                        <rect x="90" y={yPos} width="60" height="40" rx="4" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                        <text x="120" y={yPos + 24} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
                          {mass}g
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="text-center font-mono text-xs text-slate-400">
                物體密度 $\rho_B$ = <strong className="text-amber-300">{objectDensity} g/cm³</strong> ｜ 液體密度 $\rho_L$ = <strong className="text-cyan-300">{liquidDensity} g/cm³</strong>
              </div>
            </div>

            {/* 右側：力平衡數據卡片與計算展開 */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300">⚖️ 受力平衡與阿基米德浮力</span>
                <button
                  onClick={() => setShowCalculation(!showCalculation)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3.5 h-3.5" /> {showCalculation ? '隱藏計算過程' : '詳細計算過程'}
                </button>
              </div>

              {/* 三力數據卡片 */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-rose-400 font-sans block text-[11px]">向下物重 (W)</span>
                  <span className="text-base font-bold text-rose-300">{weightG} gw</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-sans block text-[11px]">向上浮力 (B)</span>
                  <span className="text-base font-bold text-cyan-300">{buoyancy} gw</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-sans block text-[11px]">底面正向力 (N)</span>
                  <span className="text-base font-bold text-emerald-300">{normalForce} gw</span>
                </div>
              </div>

              {/* 詳細步驟計算展開手卡 */}
              {showCalculation ? (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 leading-relaxed">
                  <p className="text-amber-300 font-bold border-b border-slate-800 pb-1">🧮 阿基米德浮力公式步驟拆解：</p>
                  <p>1. 物體總密度：$\rho = \frac{m}{V} = \frac{{mass}}{{volume}} = {objectDensity}\text{ g/cm}^3$</p>
                  <p>2. 排開液體體積 ($V_{\text{下}}$)：{vSub} cm³</p>
                  <p>3. 阿基米德浮力 ($B = V_{\text{下}} \times \rho_L$)：</p>
                  <p className="pl-4 text-cyan-300 font-bold">
                    $B = {vSub} \times {liquidDensity} = {buoyancy}\text{ gw}$
                  </p>
                  {state === 'sink' && (
                    <p className="text-emerald-300 pt-1">
                      4. 沉底正向力支撐：$N = W - B = {weightG} - {buoyancy} = {normalForce}\text{ gw}$
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs font-sans text-slate-400 leading-relaxed space-y-1">
                  <strong className="text-amber-300 block">💡 沉浮條件核心口訣：</strong>
                  <p>• 浮體 ($\rho_B < \rho_L$)：浮力等於物重 ($B = W$)，浸入體積 $V_{\text{下}} = V \times \frac{\rho_B}{\rho_L}$。</p>
                  <p>• 沉體 ($\rho_B > \rho_L$)：完全沒入 ($V_{\text{下}} = V$)，浮力 $B = V \times \rho_L < W$，容器底正向力 $N = W - B$。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}