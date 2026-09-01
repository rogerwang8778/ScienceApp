import React, { useState } from 'react';
import { Scale, Droplet, Layers, CheckCircle, RotateCcw, Shuffle, Plus, Minus } from 'lucide-react';

export default function DensityLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('density'); // 'density' | 'displacement' | 'balance'

  // 1. 密度與沉浮狀態
  const [mass, setMass] = useState(40); // g
  const [volume, setVolume] = useState(85); // cm3
  const [liquidDensity, setLiquidDensity] = useState(1.0); // 1.0=水, 1.2=鹽水, 0.8=酒精

  // 2. 排水法狀態
  const [cylinderWater, setCylinderWater] = useState(50); // mL
  const [objectVol, setObjectVol] = useState(20); // cm3
  const [isDropped, setIsDropped] = useState(false);

  // 3. 天平狀態
  const [balanceType, setBalanceType] = useState('topLoading'); // 'topLoading' | 'hanging'
  const [balanceRider, setBalanceRider] = useState(2.5); // 騎碼 (0-10g)
  const [targetMass, setTargetMass] = useState(34.5); // 待測物重量
  const [placedWeight, setPlacedWeight] = useState(30); // 砝碼盤重量

  // 隨機更換待測物
  const handleRandomizeObject = () => {
    const newMass = parseFloat((Math.random() * 149 + 1).toFixed(1));
    setTargetMass(newMass);
    setPlacedWeight(0);
    setBalanceRider(0);
  };

  // 增減砝碼
  const handleAdjustWeight = (amount) => {
    setPlacedWeight(prev => Math.max(0, prev + amount));
  };

  // 計算物體密度
  const calcDensity = (mass / volume).toFixed(2);
  const objD = parseFloat(calcDensity);

  // 計算物體沉浮狀態與動態水面繪圖 Y 座標 (以 px 計算)
  const getFloatStatusText = () => {
    if (objD > liquidDensity) return { text: "沉底 (D物 > D液)", color: "text-rose-400" };
    if (objD === liquidDensity) return { text: "懸浮 (D物 = D液)", color: "text-amber-400" };
    return { text: "浮出水面 (D物 < D液)", color: "text-emerald-400" };
  };

  const floatInfo = getFloatStatusText();

  // 計算天平傾斜角度 (-12度 到 +12度)
  const totalLeft = targetMass;
  const totalRight = placedWeight + balanceRider;
  const diff = totalRight - totalLeft;
  const tiltAngle = Math.max(-12, Math.min(12, diff * 1.2)); 
  const isBalanced = Math.abs(diff) < 0.1;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl">
      {/* 標頭區 */}
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          理化實驗室：基本測量與密度
        </h2>
        <p className="text-xs text-slate-400 mt-1">透過調整質量、體積與操作儀器，建立理化基礎概念量感</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('density')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'density' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> 密度與沉浮模擬
        </button>
        <button
          onClick={() => setActiveSubTab('displacement')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'displacement' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" /> 排水法測體積
        </button>
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'balance' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Scale className="w-3.5 h-3.5" /> 天平稱重與騎碼
        </button>
      </div>

      {/* 1. 密度與沉浮模擬區塊 */}
      {activeSubTab === 'density' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-cyan-300 border-b border-slate-800 pb-2">實驗變因控制</h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">物體質量 (m)</span>
                <span className="text-cyan-400 font-bold">{mass} g</span>
              </div>
              <input
                type="range" min="10" max="200" step="5"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">物體體積 (V)</span>
                <span className="text-cyan-400 font-bold">{volume} cm³</span>
              </div>
              <input
                type="range" min="20" max="200" step="5"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <span className="text-xs text-slate-300 block mb-2">選擇浸泡液體環境</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: '純水 (1.0)', d: 1.0 },
                  { name: '濃鹽水 (1.2)', d: 1.2 },
                  { name: '酒精 (0.8)', d: 0.8 }
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => setLiquidDensity(item.d)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all ${
                      liquidDensity === item.d
                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">計算公式：</span>
                <span className="text-slate-200 font-mono">D = M / V</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">物體密度 (D)：</span>
                <span className="text-amber-400 font-bold text-base">{calcDensity} g/cm³</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                <span className="text-slate-400">沉浮狀態判斷：</span>
                <span className={`font-bold ${floatInfo.color}`}>{floatInfo.text}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center relative min-h-[320px]">
            <span className="text-xs text-slate-400 absolute top-3 left-3">燒杯模擬水槽</span>
            
            {/* 燒杯容器 */}
            <div className="w-56 h-64 border-2 border-t-0 border-slate-500 rounded-b-2xl relative bg-slate-950/60 overflow-hidden">
              {/* 液體水體 */}
              <div 
                className="w-full bg-cyan-500/25 border-t-2 border-cyan-400/90 absolute bottom-0 transition-all duration-500"
                style={{ height: '160px' }}
              ></div>

              {/* 浸入物體：根據水面線 (bottom: 160px) 做精確跨邊界渲染 */}
              {(() => {
                const blockSize = Math.min(75, Math.max(36, volume / 2.2));
                const waterSurfaceY = 160; // 水面位於燒杯底部起算的像素高度
                let blockBottomY = 0;

                if (objD > liquidDensity) {
                  // 沉底：緊貼燒杯底部
                  blockBottomY = 0;
                } else if (objD === liquidDensity) {
                  // 懸浮：懸浮在水槽正中央
                  blockBottomY = 60;
                } else {
                  // 浮體：沉入深度 = (D物 / D液) * 物體高度
                  const submergedRatio = Math.min(1, objD / liquidDensity);
                  const submergedHeight = blockSize * submergedRatio;
                  blockBottomY = waterSurfaceY - submergedHeight;
                }

                return (
                  <div
                    className="bg-amber-500 border-2 border-amber-300 rounded-lg absolute left-1/2 -translate-x-1/2 transition-all duration-500 flex items-center justify-center shadow-lg z-10"
                    style={{
                      width: `${blockSize}px`,
                      height: `${blockSize}px`,
                      bottom: `${blockBottomY}px`
                    }}
                  >
                    <span className="text-[10px] font-bold text-slate-950">{mass}g</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 2. 排水法測體積區塊 */}
      {activeSubTab === 'displacement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-cyan-300 border-b border-slate-800 pb-2">排水法步驟模擬</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              對於不溶於水且沉入水中的不規則固體，可透過投入量筒後<strong>排開的水體積</strong>來測量其體積。
            </p>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">初始水位 (V₁)</span>
                <span className="text-cyan-400 font-bold">{cylinderWater} mL</span>
              </div>
              <input
                type="range" min="30" max="70" step="5"
                value={cylinderWater}
                onChange={(e) => { setCylinderWater(Number(e.target.value)); setIsDropped(false); }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">投入螺絲頭體積 (V_物)</span>
                <span className="text-cyan-400 font-bold">{objectVol} cm³</span>
              </div>
              <input
                type="range" min="5" max="30" step="1"
                value={objectVol}
                onChange={(e) => { setObjectVol(Number(e.target.value)); setIsDropped(false); }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => setIsDropped(!isDropped)}
              className={`w-full py-2.5 rounded-xl font-medium text-xs transition-all ${
                isDropped ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
              }`}
            >
              {isDropped ? '取出待測物' : '放入螺絲頭 (沉入水中)'}
            </button>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">放入後總水位 (V₂)：</span>
                <span className="text-amber-400 font-bold">{isDropped ? cylinderWater + objectVol : cylinderWater} mL</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-1">
                <span className="text-slate-300">算得物體體積：</span>
                <span className="text-emerald-400 font-bold">V₂ - V₁ = {isDropped ? objectVol : 0} cm³</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
            <div className="flex items-end gap-3">
              <div className="w-20 h-72 border-2 border-slate-500 rounded-b-xl relative bg-slate-950/80 flex flex-col justify-end p-1 overflow-hidden">
                <div 
                  className="w-full bg-cyan-500/35 border-t-2 border-cyan-300 transition-all duration-700 relative flex items-end justify-center"
                  style={{ height: `${((isDropped ? cylinderWater + objectVol : cylinderWater) / 100) * 100}%` }}
                >
                  {isDropped && (
                    <div className="w-8 h-8 bg-slate-400 border border-slate-200 rounded-md mb-2 animate-bounce"></div>
                  )}
                </div>
              </div>

              <div className="h-72 flex flex-col justify-between text-[10px] text-slate-400 font-mono py-1">
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map(val => (
                  <div key={val} className="flex items-center gap-1.5">
                    <span className="w-3 h-[1px] bg-slate-600 block"></span>
                    <span>{val} mL</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400 mt-4">刻度讀數判讀：取水面凹形中央最低處平視</span>
          </div>
        </div>
      )}

      {/* 3. 天平圖解與稱重模擬區塊 (含動態騎碼懸掛滑塊) */}
      {activeSubTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-cyan-300">天平種類與操作變因</h3>
              <button
                onClick={handleRandomizeObject}
                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs rounded-lg transition-all flex items-center gap-1 font-medium"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> 更換待測物
              </button>
            </div>
            
            <div>
              <span className="text-xs text-slate-300 block mb-2">選擇天平儀器型式</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBalanceType('topLoading')}
                  className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                    balanceType === 'topLoading'
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  上皿天平 (Top-Loading)
                </button>
                <button
                  onClick={() => setBalanceType('hanging')}
                  className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                    balanceType === 'hanging'
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  等臂懸吊天平 (Hanging)
                </button>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-3">
              <span className="text-slate-200 font-medium block">1. 放置或減少右盤砝碼 (g)</span>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-12 text-[11px]">增加：</span>
                {[10, 20, 50].map(w => (
                  <button
                    key={`plus-${w}`}
                    onClick={() => handleAdjustWeight(w)}
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded-lg border border-slate-600 font-bold flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    {w}g
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 w-12 text-[11px]">減少：</span>
                {[10, 20, 50].map(w => (
                  <button
                    key={`minus-${w}`}
                    onClick={() => handleAdjustWeight(-w)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 font-bold flex items-center justify-center gap-0.5"
                  >
                    <Minus className="w-3 h-3" />
                    {w}g
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <p className="text-slate-400">右盤砝碼總重：<strong className="text-white text-sm">{placedWeight} g</strong></p>
                <button
                  onClick={() => setPlacedWeight(0)}
                  className="px-2.5 py-1 bg-rose-900/40 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-700 text-[11px] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> 重置
                </button>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-200 font-medium">2. 調整騎碼位置 (0~10.0g)</span>
                <span className="text-amber-400 font-bold">{balanceRider} g</span>
              </div>
              <input
                type="range" min="0" max="10" step="0.1"
                value={balanceRider}
                onChange={(e) => setBalanceRider(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">（滑動即時觀察右圖橫樑上的動態騎碼滑塊）</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>右盤 (砝碼 + 騎碼)：</span>
                <span className="font-bold text-amber-300">{totalRight.toFixed(1)} g</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span>目前稱重讀數：</span>
                <span className="text-emerald-400">{totalRight.toFixed(1)} g</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between relative min-h-[360px]">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>【{balanceType === 'topLoading' ? '上皿天平結構 (指針朝上)' : '等臂懸吊天平結構 (指針朝下)'}】</span>
              <span className="text-indigo-400">測量原則：左物右碼</span>
            </div>

            {/* SVG 天平與動態騎碼繪圖 */}
            <div className="w-full max-w-md h-64 relative flex items-center justify-center my-2">
              <svg viewBox="0 0 400 260" className="w-full h-full">
                <rect x="150" y="230" width="100" height="15" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
                <rect x="192" y="100" width="16" height="130" fill="#475569" stroke="#64748b" strokeWidth="2" />

                {balanceType === 'topLoading' ? (
                  /* 上皿天平 */
                  <g>
                    <path d="M 170 65 A 30 30 0 0 1 230 65" fill="none" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="200" y1="65" x2="200" y2="75" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="185" y1="67" x2="188" y2="74" stroke="#64748b" strokeWidth="1" />
                    <line x1="215" y1="67" x2="212" y2="74" stroke="#64748b" strokeWidth="1" />

                    <circle cx="200" cy="100" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

                    <g transform={`rotate(${tiltAngle}, 200, 100)`} className="transition-transform duration-300 ease-out">
                      {/* 橫樑本體 */}
                      <rect x="50" y="96" width="300" height="8" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      
                      {/* 橫樑刻度標記 (0~10g) */}
                      {[0, 2, 4, 6, 8, 10].map(v => (
                        <line key={v} x1={200 + (v / 10) * 140} y1="96" x2={200 + (v / 10) * 140} y2="101" stroke="#475569" strokeWidth="1" />
                      ))}

                      {/* 兩端校準螺絲 */}
                      <circle cx="45" cy="100" r="5" fill="#f59e0b" />
                      <circle cx="355" cy="100" r="5" fill="#f59e0b" />

                      {/* 指針朝上 */}
                      <line x1="200" y1="100" x2="200" y2="65" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

                      {/* 動態騎碼（滑塊）圖示：根據 balanceRider (0~10g) 決定橫樑上的 X 座標 */}
                      <g transform={`translate(${200 + (balanceRider / 10) * 140}, 92)`}>
                        <rect x="-4" y="-2" width="8" height="12" rx="2" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
                        <line x1="0" y1="10" x2="0" y2="14" stroke="#ef4444" strokeWidth="2" />
                      </g>

                      {/* 左托盤物 */}
                      <rect x="75" y="55" width="10" height="41" fill="#64748b" />
                      <path d="M 50 55 L 110 55 L 100 48 L 60 48 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                      <rect x="65" y="23" width="30" height="25" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                      <text x="80" y="40" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">物</text>

                      {/* 右托盤碼 */}
                      <rect x="315" y="55" width="10" height="41" fill="#64748b" />
                      <path d="M 290 55 L 350 55 L 340 48 L 300 48 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                      {placedWeight > 0 && (
                        <g>
                          <rect x="305" y="33" width="20" height="15" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                          <text x="315" y="44" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">碼</text>
                        </g>
                      )}
                    </g>
                  </g>
                ) : (
                  /* 等臂懸吊天平 */
                  <g>
                    <circle cx="200" cy="100" r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

                    <g transform={`rotate(${tiltAngle}, 200, 100)`} className="transition-transform duration-300 ease-out">
                      <rect x="50" y="96" width="300" height="8" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      
                      {[0, 2, 4, 6, 8, 10].map(v => (
                        <line key={v} x1={200 + (v / 10) * 140} y1="96" x2={200 + (v / 10) * 140} y2="101" stroke="#475569" strokeWidth="1" />
                      ))}

                      <circle cx="45" cy="100" r="5" fill="#f59e0b" />
                      <circle cx="355" cy="100" r="5" fill="#f59e0b" />

                      <line x1="200" y1="100" x2="200" y2="160" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

                      {/* 動態騎碼（滑塊）圖示 */}
                      <g transform={`translate(${200 + (balanceRider / 10) * 140}, 92)`}>
                        <rect x="-4" y="-2" width="8" height="12" rx="2" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
                        <line x1="0" y1="10" x2="0" y2="14" stroke="#ef4444" strokeWidth="2" />
                      </g>

                      {/* 左懸吊盤 */}
                      <line x1="60" y1="104" x2="40" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="60" y1="104" x2="80" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
                      <path d="M 30 170 L 90 170 A 30 10 0 0 0 30 170" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                      <rect x="45" y="145" width="30" height="25" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                      <text x="60" y="162" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">物</text>

                      {/* 右懸吊盤 */}
                      <line x1="340" y1="104" x2="320" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="340" y1="104" x2="360" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
                      <path d="M 310 170 L 370 170 A 30 10 0 0 0 310 170" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                      {placedWeight > 0 && (
                        <g>
                          <rect x="330" y="155" width="20" height="15" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                          <text x="340" y="166" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">碼</text>
                        </g>
                      )}
                    </g>

                    <path d="M 170 160 A 30 30 0 0 1 230 160" fill="none" stroke="#64748b" strokeWidth="2" />
                    <line x1="200" y1="155" x2="200" y2="165" stroke="#f59e0b" strokeWidth="2" />
                  </g>
                )}
              </svg>
            </div>

            <div className="w-full text-center">
              {isBalanced ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 animate-pulse">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  天平平衡！成功稱出物體精準重量為 {targetMass} g！
                </div>
              ) : (
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 text-xs">
                  {tiltAngle < 0 ? (
                    <span className="text-cyan-400 font-medium">👈 左邊待測物較重！天平向左傾斜，指針偏左。</span>
                  ) : (
                    <span className="text-amber-400 font-medium">👉 右邊砝碼過重！天平向右傾斜，請減少砝碼或微調騎碼。</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}