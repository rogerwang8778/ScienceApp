import React, { useState } from 'react';
import { Droplets, Calculator, ChevronDown, ChevronUp, Beaker, Sparkles, Plus } from 'lucide-react';

export default function ConcentrationLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('dilution'); // 'dilution' | 'ppm'
  const [showDilutionCalc, setShowDilutionCalc] = useState(false);
  const [showPpmCalc, setShowPpmCalc] = useState(false);

  // --- 1. 重量百分濃度與稀釋 State ---
  const [soluteMass, setSoluteMass] = useState(20); // 溶質 (g)
  const [waterMass, setWaterMass] = useState(80); // 溶劑/水 (g)
  const [addedWater, setAddedWater] = useState(100); // 額外加水 (g)

  // --- 2. PPM 計算 State ---
  const [ppmSoluteMg, setPpmSoluteMg] = useState(15); // 微量溶質 (mg)
  const [ppmSolutionLiters, setPpmSolutionLiters] = useState(5); // 溶液體積 (L)

  // 1. 稀釋計算
  const initialSolutionMass = soluteMass + waterMass;
  const initialConcentration = initialSolutionMass > 0 ? (soluteMass / initialSolutionMass) * 100 : 0;
  const finalSolutionMass = initialSolutionMass + addedWater;
  const finalConcentration = finalSolutionMass > 0 ? (soluteMass / finalSolutionMass) * 100 : 0;

  // 2. PPM 計算 (1 ppm = 1 mg / 1 L 水)
  const calculatedPpm = ppmSolutionLiters > 0 ? ppmSoluteMg / ppmSolutionLiters : 0;
  const ppmToPercent = calculatedPpm / 10000;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          理化實驗室：水溶液與濃度計算 (Concentration Lab)
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索重量百分濃度、加水稀釋公式 M1·C1 = M2·C2 與 ppm 微量濃度轉換</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('dilution')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'dilution' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Beaker className="w-3.5 h-3.5 text-blue-300" /> 重量百分濃度與加水稀釋
        </button>
        <button
          onClick={() => setActiveSubTab('ppm')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'ppm' ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> ppm (百萬分濃度) 微量量測
        </button>
      </div>

      {/* 1. 稀釋與重量百分濃度模組 */}
      {activeSubTab === 'dilution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側調控面板 */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-blue-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" /> 溶液配製與加水稀釋調控
            </h3>

            {/* 初始溶液設定 */}
            <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-xl space-y-3">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <Beaker className="w-3.5 h-3.5" /> 1. 初始溶液調配
              </span>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">溶質質量 (如食鹽/糖)</span>
                  <span className="text-blue-400 font-bold">{soluteMass} g</span>
                </div>
                <input
                  type="range" min="5" max="100" step="5"
                  value={soluteMass}
                  onChange={(e) => setSoluteMass(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">原溶劑 (水) 質量</span>
                  <span className="text-blue-400 font-bold">{waterMass} g</span>
                </div>
                <input
                  type="range" min="20" max="300" step="10"
                  value={waterMass}
                  onChange={(e) => setWaterMass(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 加水稀釋設定 (調整步長 step=10) */}
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-xl space-y-3">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 2. 加水稀釋 (Solvent Addition)
              </span>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">額外加入水質量</span>
                  <span className="text-cyan-400 font-bold">+{addedWater} g</span>
                </div>
                <input
                  type="range" min="0" max="500" step="10"
                  value={addedWater}
                  onChange={(e) => setAddedWater(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* 結算數據與計算過程 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-amber-300 font-bold">濃度運算結果</span>
                <button
                  onClick={() => setShowDilutionCalc(!showDilutionCalc)}
                  className="text-[11px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  {showDilutionCalc ? '隱藏推導過程' : '顯示推導過程'}
                  {showDilutionCalc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">稀釋前濃度 (P<sub>1</sub>)</span>
                  <span className="text-blue-400 font-bold text-sm">{initialConcentration.toFixed(1)} %</span>
                </div>
                <div>
                  <span className="text-slate-400 block">稀釋後濃度 (P<sub>2</sub>)</span>
                  <span className="text-cyan-300 font-bold text-sm">{finalConcentration.toFixed(1)} %</span>
                </div>
              </div>

              {showDilutionCalc && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-amber-500/30 text-[11px] space-y-1.5 text-slate-300 font-mono">
                  <div className="font-bold text-amber-300 border-b border-slate-800 pb-1">
                    📐 稀釋前後計算步驟推導
                  </div>
                  <p>1. 重量百分濃度公式：濃度 (%) = [溶質 / (溶質 + 溶劑)] × 100%</p>
                  <p>2. 稀釋前溶液總重 = {soluteMass}g + {waterMass}g = {initialSolutionMass}g</p>
                  <p className="text-blue-300 pl-3">⇒ P<sub>1</sub> = ({soluteMass} / {initialSolutionMass}) × 100% = {initialConcentration.toFixed(1)}%</p>
                  <p>3. 關鍵觀念：<b>「加水稀釋過程中，溶質質量不變」</b> (仍為 {soluteMass}g)</p>
                  <p>4. 稀釋後溶液總重 = {initialSolutionMass}g + {addedWater}g = {finalSolutionMass}g</p>
                  <p className="text-emerald-400 font-bold pl-3 border-t border-slate-800 pt-1">
                    ⇒ P<sub>2</sub> = ({soluteMass} / {finalSolutionMass}) × 100% = {finalConcentration.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右側：燒杯圖形 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              <defs>
                <linearGradient id="concBefore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4 + (initialConcentration / 100) * 0.6} />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6 + (initialConcentration / 100) * 0.4} />
                </linearGradient>
                <linearGradient id="concAfter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2 + (finalConcentration / 100) * 0.7} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4 + (finalConcentration / 100) * 0.6} />
                </linearGradient>
              </defs>

              <g transform="translate(50, 40)">
                <rect x="0" y="0" width="100" height="120" fill="none" stroke="#64748b" strokeWidth="3" rx="6" />
                <rect x="3" y={120 - Math.min(110, (initialSolutionMass / 500) * 110)} width="94" height={Math.min(110, (initialSolutionMass / 500) * 110)} fill="url(#concBefore)" rx="3" />
                <text x="50" y="-12" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">稀釋前溶液</text>
                <text x="50" y="60" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">{initialConcentration.toFixed(1)} %</text>
                <text x="50" y="80" textAnchor="middle" fill="#e2e8f0" fontSize="10">總重: {initialSolutionMass}g</text>
                <text x="50" y="95" textAnchor="middle" fill="#93c5fd" fontSize="9">溶質: {soluteMass}g</text>
              </g>

              <g transform="translate(185, 80)">
                <path d="M 0 20 L 40 20 M 30 10 L 40 20 L 30 30" stroke="#06b6d4" strokeWidth="3" fill="none" />
                <text x="20" y="0" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">加水 +{addedWater}g</text>
              </g>

              <g transform="translate(260, 30)">
                <rect x="0" y="0" width="120" height="130" fill="none" stroke="#06b6d4" strokeWidth="3" rx="6" />
                <rect x="3" y={130 - Math.min(120, (finalSolutionMass / 800) * 120)} width="114" height={Math.min(120, (finalSolutionMass / 800) * 120)} fill="url(#concAfter)" rx="3" />
                <text x="60" y="-12" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="bold">稀釋後溶液</text>
                <text x="60" y="65" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{finalConcentration.toFixed(1)} %</text>
                <text x="60" y="88" textAnchor="middle" fill="#e2e8f0" fontSize="10">總重: {finalSolutionMass}g</text>
                <text x="60" y="103" textAnchor="middle" fill="#a5f3fc" fontSize="9">溶質維持: {soluteMass}g</text>
              </g>

              <g transform="translate(30, 205)">
                <rect x="0" y="0" width="390" height="28" fill="#0f172a" rx="6" stroke="#334155" strokeWidth="1" />
                <text x="195" y="18" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                  💡 觀念要點：加水稀釋時，溶液質量增加，溶質質量不變，故濃度降低！
                </text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 2. PPM (百萬分濃度) 模組 */}
      {activeSubTab === 'ppm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側控制區 */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> 微量濃度 (ppm) 調控與換算
            </h3>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">微量溶質質量 (毫克 mg)</span>
                  <span className="text-emerald-400 font-bold">{ppmSoluteMg} mg</span>
                </div>
                <input
                  type="range" min="1" max="100" step="1"
                  value={ppmSoluteMg}
                  onChange={(e) => setPpmSoluteMg(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">水溶液體積 (公升 L)</span>
                  <span className="text-emerald-400 font-bold">{ppmSolutionLiters} L</span>
                </div>
                <input
                  type="range" min="1" max="20" step="1"
                  value={ppmSolutionLiters}
                  onChange={(e) => setPpmSolutionLiters(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 結果面板 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-emerald-300 font-bold">ppm 計算結果</span>
                <button
                  onClick={() => setShowPpmCalc(!showPpmCalc)}
                  className="text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  {showPpmCalc ? '隱藏推導過程' : '顯示推導過程'}
                  {showPpmCalc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">百萬分濃度 (ppm)：</span>
                  <span className="text-emerald-400 font-bold text-sm">{calculatedPpm.toFixed(1)} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">換算為重量百分濃度 (%)：</span>
                  <span className="text-cyan-300 font-bold">{ppmToPercent.toFixed(5)} %</span>
                </div>
              </div>

              {showPpmCalc && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-emerald-500/30 text-[11px] space-y-1.5 text-slate-300 font-mono">
                  <div className="font-bold text-emerald-300 border-b border-slate-800 pb-1">
                    🧪 ppm 定義與公式說明
                  </div>
                  <p>1. ppm 定義：Parts Per Million（百萬分之一）。</p>
                  <p>2. 水的密度約 1 g/cm³，故 1 L 水 ≈ 1 kg = 1,000,000 mg。</p>
                  <p>3. 常用公式：<b>1 ppm = 1 mg 溶質 / 1 L 水溶液</b></p>
                  <p className="text-emerald-300 pl-3">
                    ⇒ ppm = {ppmSoluteMg} mg / {ppmSolutionLiters} L = {calculatedPpm.toFixed(1)} ppm
                  </p>
                  <p>4. ppm 與 % 的換算：1% = 10,000 ppm</p>
                  <p className="text-cyan-300 pl-3 border-t border-slate-800 pt-1">
                    ⇒ {calculatedPpm.toFixed(1)} / 10,000 = {ppmToPercent.toFixed(5)} %
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右側：高直觀 ppm 動態水槽與散布顆粒視覺化 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              <defs>
                <linearGradient id="tankWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* 大型水槽容器 */}
              <g transform="translate(40, 20)">
                <rect x="0" y="0" width="220" height="170" fill="none" stroke="#64748b" strokeWidth="3" rx="8" />

                {/* 動態水面 Height 隨體積 (1L~20L) 變化 */}
                {(() => {
                  const waterHeight = Math.max(20, (ppmSolutionLiters / 20) * 150);
                  const waterY = 170 - waterHeight;
                  // 根據 ppm 數量生成發光溶質微粒
                  const particleCount = Math.min(60, Math.max(5, Math.round(calculatedPpm * 1.5)));
                  const particles = [];
                  for (let i = 0; i < particleCount; i++) {
                    // 偽隨機均勻分佈在水體內
                    const seedX = (i * 37 + 13) % 200 + 10;
                    const seedY = waterY + ((i * 23 + 7) % (waterHeight - 15)) + 8;
                    particles.push(<circle key={`p-${i}`} cx={seedX} cy={seedY} r="2.5" fill="#34d399" className="animate-pulse" opacity="0.9" />);
                  }

                  return (
                    <>
                      <rect x="3" y={waterY} width="214" height={waterHeight} fill="url(#tankWater)" rx="4" />
                      {particles}
                    </>
                  );
                })()}

                <text x="110" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  水槽容積與溶質微粒分佈
                </text>
              </g>

              {/* 右側修復不同步與視覺說明卡 */}
              <g transform="translate(280, 20)">
                {/* 1. 水體積動態資訊 */}
                <rect x="0" y="0" width="140" height="75" fill="#0f172a" rx="8" stroke="#0284c7" strokeWidth="1.5" />
                <text x="70" y="24" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                  {ppmSolutionLiters} 公升水
                </text>
                <text x="70" y="42" textAnchor="middle" fill="#94a3b8" fontSize="9">
                  ({(ppmSolutionLiters * 1000000).toLocaleString()} mg)
                </text>
                <text x="70" y="62" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">
                  {ppmSoluteMg} mg 溶質
                </text>

                {/* 2. 算出的 ppm 結果 */}
                <rect x="0" y="85" width="140" height="85" fill="#064e3b" fillOpacity="0.4" rx="8" stroke="#10b981" strokeWidth="1.5" />
                <text x="70" y="108" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">
                  目前百萬分濃度
                </text>
                <text x="70" y="132" textAnchor="middle" fill="#34d399" fontSize="18" fontWeight="bold">
                  {calculatedPpm.toFixed(1)}
                </text>
                <text x="70" y="152" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">
                  ppm (mg/L)
                </text>
              </g>

              {/* 下方總結條 */}
              <g transform="translate(30, 202)">
                <rect x="0" y="0" width="390" height="28" fill="#0f172a" rx="6" stroke="#334155" strokeWidth="1" />
                <text x="195" y="18" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                  ✨ 視覺提示：綠色微粒代表微量溶質，水量固定時，溶質越多微粒密度越高 (ppm 越大)！
                </text>
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}