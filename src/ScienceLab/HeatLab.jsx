import React, { useState } from 'react';
import { Flame, Snowflake, Droplets, Thermometer, Sparkles, ChevronDown, ChevronUp, Calculator } from 'lucide-react';

export default function HeatLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('mixing'); // 'mixing' | 'latent'
  const [showMixingCalc, setShowMixingCalc] = useState(false); // 顯示冷熱水計算過程
  const [showLatentCalc, setShowLatentCalc] = useState(false); // 顯示潛熱計算過程

  // --- 1. 冷熱水混合 State ---
  const [coldMass, setColdMass] = useState(100); // g
  const [coldTemp, setColdTemp] = useState(20); // °C
  const [hotMass, setHotMass] = useState(100); // g
  const [hotTemp, setHotTemp] = useState(80); // °C

  // --- 2. 潛熱相變化 State ---
  const [iceMass, setIceMass] = useState(80); // g
  const [iceTemp, setIceTemp] = useState(0); // °C (-30 ~ 0)
  const [waterMass, setWaterMass] = useState(0); // g
  const [waterTemp, setWaterTemp] = useState(0); // °C (0 ~ 100)
  const [steamMass, setSteamMass] = useState(5); // g
  const [steamTemp, setSteamTemp] = useState(100); // °C (100 ~ 120)

  // --- 冷熱水計算邏輯 ---
  const totalWaterMass = coldMass + hotMass;
  const eqTemp = totalWaterMass > 0 ? (coldMass * coldTemp + hotMass * hotTemp) / totalWaterMass : 0;
  const heatReleased = hotMass * (hotTemp - eqTemp); // cal
  const heatAbsorbed = coldMass * (eqTemp - coldTemp); // cal

  // --- 潛熱與相變化熱平衡精確運算引擎 ---
  const calculatePhaseChange = () => {
    const totalMass = iceMass + waterMass + steamMass;
    if (totalMass === 0) {
      return {
        finalTemp: 0,
        stateDesc: '無物質',
        iceRemain: 0,
        waterRemain: 0,
        steamRemain: 0,
        steps: ['無輸入物質']
      };
    }

    const steps = [];

    // 1. 計算所有物質統一降溫/加熱至 0°C 水時的總淨能量 (以 0°C 液態水為基準 0 cal)
    // 固態冰：需要能量升溫至 0°C，再融化成 0°C 水 (吸熱負值)
    const qIceSensible = iceMass * 0.5 * (0 - iceTemp); // 冰升溫到 0°C
    const qIceLatent = iceMass * 80; // 0°C 冰熔化成 0°C 水
    const qIceNeeded = qIceSensible + qIceLatent;

    // 液態水：相對於 0°C 水蘊含的顯熱
    const qWaterSensible = waterMass * 1.0 * (waterTemp - 0);

    // 水蒸氣：降溫至 100°C，凝結成 100°C 水，再降溫至 0°C 水 (放熱正值)
    const qSteamSensibleCool = steamMass * 0.5 * (steamTemp - 100); // 蒸氣降溫到 100°C
    const qSteamLatent = steamMass * 540; // 100°C 蒸氣凝結成 100°C 水
    const qSteamWaterCool = steamMass * 1.0 * (100 - 0); // 100°C 水降溫到 0°C 水
    const qSteamGiven = qSteamSensibleCool + qSteamLatent + qSteamWaterCool;

    // 系統若全部轉為 0°C 液態水時，可釋放的淨熱量
    const netEnergyAtZeroWater = qWaterSensible + qSteamGiven - qIceNeeded;

    steps.push(`1. 基準轉換 (計算全部物質轉為 0°C 液態水時的熱量收支)：`);
    if (iceMass > 0) steps.push(`  • 冰塊 (${iceMass}g, ${iceTemp}°C) 升溫並融化為 0°C 水需吸熱：${qIceSensible.toFixed(0)} (升溫) + ${qIceLatent.toFixed(0)} (熔化) = ${qIceNeeded.toFixed(0)} cal`);
    if (waterMass > 0) steps.push(`  • 液態水 (${waterMass}g, ${waterTemp}°C) 降溫至 0°C 水可放熱：${qWaterSensible.toFixed(0)} cal`);
    if (steamMass > 0) steps.push(`  • 水蒸氣 (${steamMass}g, ${steamTemp}°C) 降溫、凝結並降溫至 0°C 水可放熱：${qSteamSensibleCool.toFixed(0)} + ${qSteamLatent.toFixed(0)} + ${qSteamWaterCool.toFixed(0)} = ${qSteamGiven.toFixed(0)} cal`);

    steps.push(`  • 淨能量餘額 (相對於 0°C 全液態水)：${netEnergyAtZeroWater.toFixed(0)} cal`);

    let finalTemp = 0;
    let iceRemain = 0;
    let waterRemain = 0;
    let steamRemain = 0;
    let stateDesc = '';

    // 2. 判斷最終平衡狀態
    if (netEnergyAtZeroWater < 0) {
      // 能量不夠讓所有物質變成 0°C 水 -> 處於 0°C 冰水共存 或 全部凍結為 <0°C 冰
      const deficit = -netEnergyAtZeroWater; // 還缺少的熱量
      // 全部 0°C 水凝固成 0°C 冰能釋放的熱量 = (原本的水 + 蒸氣凝結成的水) * 80
      const possibleWaterToFreeze = waterMass + steamMass;
      const maxFreezingHeat = possibleWaterToFreeze * 80;

      if (deficit <= maxFreezingHeat + qIceLatent) {
        // 處於 0°C 冰水共存狀態
        finalTemp = 0;
        // 實際融化的冰質量
        const meltedIce = (qWaterSensible + qSteamGiven - qIceSensible) / 80;
        if (meltedIce >= 0 && meltedIce <= iceMass) {
          iceRemain = iceMass - meltedIce;
          waterRemain = totalMass - iceRemain;
        } else if (meltedIce < 0) {
          // 连水也部分凝固
          const frozenWater = (-meltedIce);
          waterRemain = Math.max(0, waterMass + steamMass - frozenWater);
          iceRemain = totalMass - waterRemain;
        } else {
          iceRemain = 0;
          waterRemain = totalMass;
        }
        stateDesc = `0.0°C 冰水共存 (冰 ${iceRemain.toFixed(1)}g, 水 ${waterRemain.toFixed(1)}g)`;
        steps.push(`2. 狀態判斷：能量不足以全部融化為水，達到 0.0°C 冰水共存平衡。`);
        steps.push(`  • 剩餘冰量：${iceRemain.toFixed(1)}g | 剩餘水量：${waterRemain.toFixed(1)}g`);
      } else {
        // 完全凍結，且溫度降至 0°C 以下
        const extraDeficit = deficit - (maxFreezingHeat + qIceLatent);
        finalTemp = 0 - extraDeficit / (totalMass * 0.5);
        iceRemain = totalMass;
        waterRemain = 0;
        stateDesc = `${finalTemp.toFixed(1)}°C 全固態冰`;
        steps.push(`2. 狀態判斷：熱量大幅不足，全部物質結冰並降溫至 ${finalTemp.toFixed(1)}°C。`);
      }
    } else {
      // netEnergyAtZeroWater >= 0：所有物質可完全融化為 0°C 以上的水或蒸氣
      const maxWaterHeat100 = totalMass * 1.0 * 100; // 全部 0°C 水升溫到 100°C 水所需熱量

      if (netEnergyAtZeroWater <= maxWaterHeat100) {
        // 溫度介於 0°C ~ 100°C 全液態水
        finalTemp = netEnergyAtZeroWater / totalMass;
        waterRemain = totalMass;
        stateDesc = `${finalTemp.toFixed(1)}°C 全液態水`;
        steps.push(`2. 狀態判斷：多餘能量將全體液態水 (${totalMass}g) 升溫至 ${finalTemp.toFixed(1)}°C。`);
      } else {
        // 溫度達到 100°C，開始汽化
        const surplusHeat100 = netEnergyAtZeroWater - maxWaterHeat100;
        const maxVaporizeHeat = totalMass * 540; // 全部 100°C 水汽化所需的熱量

        if (surplusHeat100 <= maxVaporizeHeat) {
          finalTemp = 100;
          steamRemain = surplusHeat100 / 540;
          waterRemain = totalMass - steamRemain;
          stateDesc = `100.0°C 水與水蒸氣共存 (水 ${waterRemain.toFixed(1)}g, 蒸氣 ${steamRemain.toFixed(1)}g)`;
          steps.push(`2. 狀態判斷：溫度達到 100.0°C 並部分汽化，形成水與水蒸氣共存平衡。`);
          steps.push(`  • 汽化蒸氣量：${steamRemain.toFixed(1)}g | 剩餘水量：${waterRemain.toFixed(1)}g`);
        } else {
          // 全部汽化為 100°C 以上水蒸氣
          const superSteamHeat = surplusHeat100 - maxVaporizeHeat;
          finalTemp = 100 + superSteamHeat / (totalMass * 0.5);
          steamRemain = totalMass;
          stateDesc = `${finalTemp.toFixed(1)}°C 高溫水蒸氣`;
          steps.push(`2. 狀態判斷：熱量極高，全部物質汽化為水蒸氣並過熱至 ${finalTemp.toFixed(1)}°C。`);
        }
      }
    }

    return {
      finalTemp: Math.max(-50, Math.min(200, finalTemp)),
      stateDesc,
      iceRemain,
      waterRemain,
      steamRemain,
      steps
    };
  };

  const latentCalc = calculatePhaseChange();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-rose-400" />
          理化實驗室：熱學與相變化 (Heat & Thermodynamics Lab)
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索冷熱水混合熱平衡、比熱公式 H = M·S·ΔT 與三相變化潛熱計算</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('mixing')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'mixing' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-300" /> 冷熱水混合與熱平衡 (H = M·S·ΔT)
        </button>
        <button
          onClick={() => setActiveSubTab('latent')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'latent' ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Snowflake className="w-3.5 h-3.5 text-cyan-300" /> 冰水蒸汽相變化與潛熱 (L<sub>f</sub>=80, L<sub>v</sub>=540)
        </button>
      </div>

      {/* 1. 冷熱水混合模組 */}
      {activeSubTab === 'mixing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側調控控制區 */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-rose-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" /> 混合液體參數調控
            </h3>

            {/* 冷水設定 */}
            <div className="bg-sky-950/30 border border-sky-500/30 p-3.5 rounded-xl space-y-3">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> 冷水參數 (Cold Water)
              </span>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">冷水質量 (M<sub>1</sub>)</span>
                  <span className="text-sky-400 font-bold">{coldMass} g</span>
                </div>
                <input
                  type="range" min="20" max="300" step="10"
                  value={coldMass}
                  onChange={(e) => setColdMass(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">初始溫度 (T<sub>1</sub>)</span>
                  <span className="text-sky-400 font-bold">{coldTemp} °C</span>
                </div>
                <input
                  type="range" min="0" max="40" step="1"
                  value={coldTemp}
                  onChange={(e) => setColdTemp(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 熱水設定 */}
            <div className="bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-xl space-y-3">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 熱水參數 (Hot Water)
              </span>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">熱水質量 (M<sub>2</sub>)</span>
                  <span className="text-rose-400 font-bold">{hotMass} g</span>
                </div>
                <input
                  type="range" min="20" max="300" step="10"
                  value={hotMass}
                  onChange={(e) => setHotMass(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">初始溫度 (T<sub>2</sub>)</span>
                  <span className="text-rose-400 font-bold">{hotTemp} °C</span>
                </div>
                <input
                  type="range" min="50" max="100" step="1"
                  value={hotTemp}
                  onChange={(e) => setHotTemp(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 即時數據統計與顯示計算按鈕 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-amber-300 font-bold">熱量守恆運算結果</span>
                <button
                  onClick={() => setShowMixingCalc(!showMixingCalc)}
                  className="text-[11px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  {showMixingCalc ? '隱藏計算過程' : '顯示計算過程'}
                  {showMixingCalc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">熱水放熱量 (H<sub>放</sub>) : </span>
                  <span className="text-rose-400 font-bold">{heatReleased.toFixed(0)} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">冷水吸熱量 (H<sub>吸</sub>) : </span>
                  <span className="text-sky-400 font-bold">{heatAbsorbed.toFixed(0)} cal</span>
                </div>
                <div className="flex justify-between col-span-2 pt-1 border-t border-slate-900">
                  <span className="text-slate-300">最終熱平衡溫度 (T<sub>e</sub>) : </span>
                  <span className="text-amber-400 font-bold text-sm">{eqTemp.toFixed(1)} °C</span>
                </div>
              </div>

              {/* 展開之 H=MST 詳細計算過程 */}
              {showMixingCalc && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-amber-500/30 text-[11px] space-y-2 text-slate-300 font-mono">
                  <div className="font-bold text-amber-300 border-b border-slate-800 pb-1">
                    📐 算式步驟推導 (H = M · S · ΔT)
                  </div>
                  <p>1. 冷水吸熱：H<sub>吸</sub> = {coldMass} × 1.0 × (T<sub>e</sub> - {coldTemp})</p>
                  <p>2. 熱水放熱：H<sub>放</sub> = {hotMass} × 1.0 × ({hotTemp} - T<sub>e</sub>)</p>
                  <p>3. 假設絕熱無熱散失 (H<sub>吸</sub> = H<sub>放</sub>)：</p>
                  <p className="text-amber-300 pl-3">
                    {coldMass} × (T<sub>e</sub> - {coldTemp}) = {hotMass} × ({hotTemp} - T<sub>e</sub>)
                  </p>
                  <p className="text-amber-300 pl-3">
                    {coldMass}T<sub>e</sub> - {coldMass * coldTemp} = {hotMass * hotTemp} - {hotMass}T<sub>e</sub>
                  </p>
                  <p className="text-emerald-400 font-bold pl-3 border-t border-slate-800 pt-1">
                    ⇒ T<sub>e</sub> = ({coldMass * coldTemp} + {hotMass * hotTemp}) / {totalWaterMass} = {eqTemp.toFixed(1)} °C
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右側 SVG 動態水槽與溫度對比圖 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              <defs>
                <linearGradient id="coldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="hotGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="mixGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* 冷水燒杯 */}
              <g transform="translate(40, 40)">
                <rect x="0" y="0" width="70" height="90" fill="none" stroke="#64748b" strokeWidth="3" rx="4" />
                <rect x="3" y={90 - (coldMass / 300) * 70} width="64" height={(coldMass / 300) * 70} fill="url(#coldGrad)" rx="2" />
                <text x="35" y="-10" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">冷水杯</text>
                <text x="35" y="45" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{coldMass}g / {coldTemp}°C</text>
              </g>

              <text x="145" y="90" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold">+</text>

              {/* 熱水燒杯 */}
              <g transform="translate(180, 40)">
                <rect x="0" y="0" width="70" height="90" fill="none" stroke="#64748b" strokeWidth="3" rx="4" />
                <rect x="3" y={90 - (hotMass / 300) * 70} width="64" height={(hotMass / 300) * 70} fill="url(#hotGrad)" rx="2" />
                <text x="35" y="-10" textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="bold">熱水杯</text>
                <text x="35" y="45" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{hotMass}g / {hotTemp}°C</text>
              </g>

              <text x="285" y="90" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold">=</text>

              {/* 混合燒杯 */}
              <g transform="translate(320, 30)">
                <rect x="0" y="0" width="90" height="100" fill="none" stroke="#f59e0b" strokeWidth="3" rx="6" />
                <rect x="3" y={100 - (totalWaterMass / 600) * 80} width="84" height={(totalWaterMass / 600) * 80} fill="url(#mixGrad)" rx="3" />
                <text x="45" y="-10" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">熱平衡混合杯</text>
                <text x="45" y="50" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">{eqTemp.toFixed(1)} °C</text>
                <text x="45" y="68" textAnchor="middle" fill="#e2e8f0" fontSize="9">總質量: {totalWaterMass}g</text>
              </g>

              {/* 溫度對比動態軸 */}
              <g transform="translate(30, 175)">
                <line x1="0" y1="20" x2="390" y2="20" stroke="#475569" strokeWidth="2" />

                <circle cx={(coldTemp / 100) * 390} cy="20" r="6" fill="#38bdf8" />
                <text x={(coldTemp / 100) * 390} y="40" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">{coldTemp}°C</text>

                <circle cx={(hotTemp / 100) * 390} cy="20" r="6" fill="#fb7185" />
                <text x={(hotTemp / 100) * 390} y="40" textAnchor="middle" fill="#fb7185" fontSize="10" fontWeight="bold">{hotTemp}°C</text>

                <circle cx={(eqTemp / 100) * 390} cy="20" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={(eqTemp / 100) * 390} y="-5" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">Te = {eqTemp.toFixed(1)}°C</text>

                <path d={`M ${(hotTemp / 100) * 390 - 10} 12 Q ${((hotTemp + eqTemp) / 200) * 390} 0 ${(eqTemp / 100) * 390 + 10} 12`} fill="none" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d={`M ${(coldTemp / 100) * 390 + 10} 12 Q ${((coldTemp + eqTemp) / 200) * 390} 0 ${(eqTemp / 100) * 390 - 10} 12`} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* 2. 潛熱與相變化模組 */}
      {activeSubTab === 'latent' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側調控面板 */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-cyan-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> 混合物質（冰、水、蒸汽）調控
            </h3>

            {/* 冰塊設定 */}
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1"><Snowflake className="w-3.5 h-3.5" /> 固態冰 (S<sub>ice</sub>=0.5)</span>
                <span>{iceMass}g / {iceTemp}°C</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">質量 (g)</span>
                  <input
                    type="range" min="0" max="200" step="10"
                    value={iceMass}
                    onChange={(e) => setIceMass(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">初溫 (°C)</span>
                  <input
                    type="range" min="-30" max="0" step="2"
                    value={iceTemp}
                    onChange={(e) => setIceTemp(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 液態水設定 */}
            <div className="bg-sky-950/30 border border-sky-500/30 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-sky-300">
                <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> 液態水 (S<sub>water</sub>=1.0)</span>
                <span>{waterMass}g / {waterTemp}°C</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">質量 (g)</span>
                  <input
                    type="range" min="0" max="300" step="10"
                    value={waterMass}
                    onChange={(e) => setWaterMass(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">初溫 (°C)</span>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 水蒸氣設定 */}
            <div className="bg-orange-950/30 border border-orange-500/30 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-orange-300">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> 水蒸氣 (S<sub>steam</sub>=0.5)</span>
                <span>{steamMass}g / {steamTemp}°C</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">質量 (g)</span>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={steamMass}
                    onChange={(e) => setSteamMass(Number(e.target.value))}
                    className="w-full accent-orange-400 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">初溫 (°C)</span>
                  <input
                    type="range" min="100" max="130" step="2"
                    value={steamTemp}
                    onChange={(e) => setSteamTemp(Number(e.target.value))}
                    className="w-full accent-orange-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 相變化結果統計與詳細計算開關 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-cyan-300 font-bold">相變化熱平衡結算</span>
                <button
                  onClick={() => setShowLatentCalc(!showLatentCalc)}
                  className="text-[11px] bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  {showLatentCalc ? '隱藏推導過程' : '顯示推導過程'}
                  {showLatentCalc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">最終平衡狀態：</span>
                  <span className="text-cyan-300 font-bold">{latentCalc.stateDesc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">最終平衡溫度：</span>
                  <span className="text-amber-400 font-bold text-sm">{latentCalc.finalTemp.toFixed(1)} °C</span>
                </div>
              </div>

              {/* 展開之潛熱詳細計算過程 */}
              {showLatentCalc && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-cyan-500/30 text-[11px] space-y-1.5 text-slate-300 font-mono">
                  <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1">
                    🧪 能量收支與相變化步驟推導
                  </div>
                  {latentCalc.steps.map((step, sIdx) => (
                    <p key={`step-${sIdx}`} className={sIdx === 0 ? "text-amber-300 pt-1" : "pl-1"}>
                      {step}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側：三相變化階梯圖 SVG 繪製 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              {/* 座標軸 */}
              <line x1="40" y1="210" x2="430" y2="210" stroke="#64748b" strokeWidth="2" />
              <line x1="40" y1="20" x2="40" y2="210" stroke="#64748b" strokeWidth="2" />
              <text x="430" y="225" textAnchor="end" fill="#94a3b8" fontSize="10">吸熱量 / 能量 (Cal)</text>
              <text x="30" y="15" textAnchor="middle" fill="#94a3b8" fontSize="10">溫度 (°C)</text>

              {/* 0°C 與 100°C 基準虛線 */}
              <line x1="40" y1="160" x2="420" y2="160" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x="32" y="163" textAnchor="end" fill="#0284c7" fontSize="9">0°C</text>

              <line x1="40" y1="60" x2="420" y2="60" stroke="#e11d48" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <text x="32" y="63" textAnchor="end" fill="#e11d48" fontSize="9">100°C</text>

              {/* 三相變化加熱階梯折線 */}
              <path
                d="M 50 190 L 100 160 L 180 160 L 260 60 L 370 60 L 410 30"
                fill="none"
                stroke="#475569"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* 區域標籤 */}
              <text x="70" y="180" fill="#38bdf8" fontSize="9">冰升溫</text>
              <text x="140" y="152" fill="#38bdf8" fontSize="9" fontWeight="bold">冰熔化(80cal/g)</text>
              <text x="220" y="115" fill="#38bdf8" fontSize="9">水升溫</text>
              <text x="310" y="52" fill="#fb7185" fontSize="9" fontWeight="bold">水汽化(540cal/g)</text>
              <text x="390" y="25" fill="#fb7185" fontSize="9">蒸汽升溫</text>

              {/* 動態最終熱平衡點亮點 */}
              {(() => {
                const T = latentCalc.finalTemp;
                let px = 140;
                let py = 160;

                if (T < 0) {
                  px = 50 + ((T + 30) / 30) * 50;
                  py = 160 + (-T / 30) * 30;
                } else if (T === 0) {
                  px = 140;
                  py = 160;
                } else if (T > 0 && T < 100) {
                  px = 180 + (T / 100) * 80;
                  py = 160 - (T / 100) * 100;
                } else if (T === 100) {
                  px = 315;
                  py = 60;
                } else {
                  px = 370 + Math.min(40, ((T - 100) / 30) * 40);
                  py = 60 - Math.min(30, ((T - 100) / 30) * 30);
                }

                return (
                  <g transform={`translate(${px}, ${py})`}>
                    <circle cx="0" cy="0" r="9" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                    <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <rect x="-45" y="-32" width="90" height="22" fill="#0f172a" rx="4" stroke="#f59e0b" strokeWidth="1" />
                    <text x="0" y="-18" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                      平衡: {T.toFixed(1)}°C
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}