import React, { useState } from 'react';
import { Droplets, Calculator, ChevronUp, ChevronDown, CheckCircle2, FlaskConical, RefreshCw, AlertCircle, Activity } from 'lucide-react';

// Common solutes database
const SOLUTES = [
  { id: 'hcl', name: '鹽酸 (HCl)', type: 'strong_acid', eq: 'HCl → H⁺ + Cl⁻', hCount: 1, ohCount: 0, cation: 'H⁺', anion: 'Cl⁻' },
  { id: 'h2so4', name: '硫酸 (H₂SO₄)', type: 'strong_acid_diprotic', eq: 'H₂SO₄ → 2H⁺ + SO₄²⁻', hCount: 2, ohCount: 0, cation: 'H⁺', anion: 'SO₄²⁻' },
  { id: 'naoh', name: '氫氧化鈉 (NaOH)', type: 'strong_base', eq: 'NaOH → Na⁺ + OH⁻', hCount: 0, ohCount: 1, cation: 'Na⁺', anion: 'OH⁻' },
  { id: 'caoh2', name: '氫氧化鈣 (Ca(OH)₂)', type: 'strong_base_diprotic', eq: 'Ca(OH)₂ → Ca²⁺ + 2OH⁻', hCount: 0, ohCount: 2, cation: 'Ca²⁺', anion: 'OH⁻' },
  { id: 'nacl', name: '氯化鈉 (NaCl)', type: 'neutral_salt', eq: 'NaCl → Na⁺ + Cl⁻', hCount: 0, ohCount: 0, cation: 'Na⁺', anion: 'Cl⁻' }
];

// 格式化科學記號：將 1e-2 轉為 1.00 × 10⁻²
const formatScientific = (num) => {
  if (num === 0 || !isFinite(num)) return '0';
  const expStr = num.toExponential(2);
  const [coef, exp] = expStr.split('e');
  const expNum = parseInt(exp, 10);
  
  if (expNum === 0) return `${coef}`;

  const superscripts = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  
  const formattedExp = exp.split('').map(char => superscripts[char] || char).join('');
  return (
    <span>
      {coef} × 10<sup>{formattedExp}</sup>
    </span>
  );
};

export default function AcidBaseLab() {
  const [activeTab, setActiveTab] = useState('ph');

  // Module 1: pH calculation state
  const [selectedSoluteId, setSelectedSoluteId] = useState('hcl');
  const [moles, setMoles] = useState(0.01);
  const [volume, setVolume] = useState(1);
  const [showPhCalcSteps, setShowPhCalcSteps] = useState(false);

  // Module 2: Titration state
  const [titrantId, setTitrantId] = useState('naoh'); // In buret
  const [analyteId, setAnalyteId] = useState('hcl');   // In flask
  const [analyteVol, setAnalyteVol] = useState(25);    // mL
  const [analyteConc, setAnalyteConc] = useState(0.1);  // M
  const [titrantConc, setTitrantConc] = useState(0.1);  // M
  const [addedVol, setAddedVol] = useState(0);         // mL added
  const [showTitrationSteps, setShowTitrationSteps] = useState(false);

  // --- Module 1 Logic ---
  const currentSolute = SOLUTES.find(s => s.id === selectedSoluteId) || SOLUTES[0];
  const safeVol = Math.max(0.001, Number(volume) || 1);
  const safeMoles = Math.max(0, Number(moles) || 0);
  const molarity = safeMoles / safeVol;

  let hConc = 1e-7;
  let ohConc = 1e-7;

  if (currentSolute.hCount > 0) {
    hConc = molarity * currentSolute.hCount + 1e-7;
    ohConc = 1e-14 / hConc;
  } else if (currentSolute.ohCount > 0) {
    ohConc = molarity * currentSolute.ohCount + 1e-7;
    hConc = 1e-14 / ohConc;
  } else {
    hConc = 1e-7;
    ohConc = 1e-7;
  }

  const phValue = -Math.log10(hConc);

  // --- Module 2 Logic (Titration) ---
  const titrantInfo = SOLUTES.find(s => s.id === titrantId) || SOLUTES[2];
  const analyteInfo = SOLUTES.find(s => s.id === analyteId) || SOLUTES[0];

  const nAnalyteH = analyteInfo.hCount;
  const nAnalyteOH = analyteInfo.ohCount;
  const nTitrantH = titrantInfo.hCount;
  const nTitrantOH = titrantInfo.ohCount;

  const isAcidInFlask = nAnalyteH > 0;
  const isAcidInBuret = nTitrantH > 0;
  const isSameNature = (isAcidInFlask && isAcidInBuret) || (!isAcidInFlask && !isAcidInBuret);

  const safeAnalyteConc = Math.max(0.001, Number(analyteConc) || 0.1);
  const safeTitrantConc = Math.max(0.001, Number(titrantConc) || 0.1);
  const safeAnalyteVol = Math.max(1, Number(analyteVol) || 25);

  const nAnalyte = isAcidInFlask ? nAnalyteH : nAnalyteOH;
  const nTitrant = isAcidInBuret ? nTitrantH : nTitrantOH;
  const equivVol = isSameNature ? 0 : (nAnalyte * safeAnalyteConc * safeAnalyteVol) / (nTitrant * safeTitrantConc);

  // 計算滴定過程中的詳細莫耳數、難溶性 CaSO4 修正、各離子動態莫耳濃度與 pH
  const getTitrationDetails = (vAdded) => {
    const totalVolL = (safeAnalyteVol + vAdded) / 1000;
    
    // 1. 計算旁觀離子莫耳數與初莫耳濃度
    let spectatorCationName = '';
    let spectatorCationConc = 0;
    let spectatorAnionName = '';
    let spectatorAnionConc = 0;

    if (isAcidInFlask) {
      spectatorAnionName = analyteInfo.anion;
      const analyteMole = (safeAnalyteVol / 1000) * safeAnalyteConc;
      spectatorAnionConc = analyteMole / totalVolL;

      spectatorCationName = titrantInfo.cation;
      const titrantMole = (vAdded / 1000) * safeTitrantConc;
      spectatorCationConc = titrantMole / totalVolL;
    } else {
      spectatorCationName = analyteInfo.cation;
      const analyteMole = (safeAnalyteVol / 1000) * safeAnalyteConc;
      spectatorCationConc = analyteMole / totalVolL;

      spectatorAnionName = titrantInfo.anion;
      const titrantMole = (vAdded / 1000) * safeTitrantConc;
      spectatorAnionConc = titrantMole / totalVolL;
    }

    // 2. 檢測是否為 Ca(OH)2 + H2SO4 反應 (產生難溶性 CaSO4 沉澱)
    const isCaSO4Precipitate = 
      (analyteId === 'caoh2' && titrantId === 'h2so4') || 
      (analyteId === 'h2so4' && titrantId === 'caoh2');

    let hasPrecipitate = false;
    // 硫酸鈣 CaSO4 室溫飽和莫耳濃度約 0.015 M
    const CASO4_SATURATION_CONC = 0.015;

    if (isCaSO4Precipitate && vAdded > 0) {
      if (spectatorCationConc > CASO4_SATURATION_CONC && spectatorAnionConc > CASO4_SATURATION_CONC) {
        hasPrecipitate = true;
        spectatorCationConc = CASO4_SATURATION_CONC;
        spectatorAnionConc = CASO4_SATURATION_CONC;
      }
    }

    // 3. 計算反應離子 (H⁺, OH⁻)
    let currentHConc = 1e-7;
    let currentOHConc = 1e-7;
    let statusText = '';

    if (isSameNature) {
      if (isAcidInFlask) {
        const h1 = (safeAnalyteVol / 1000) * safeAnalyteConc * nAnalyteH;
        const h2 = (vAdded / 1000) * safeTitrantConc * nTitrantH;
        currentHConc = (h1 + h2) / totalVolL + 1e-7;
        currentOHConc = 1e-14 / currentHConc;
        statusText = `⚠️ 同為酸性溶液：混合不發生中和反應，H⁺ 莫耳數直接累加`;
      } else {
        const oh1 = (safeAnalyteVol / 1000) * safeAnalyteConc * nAnalyteOH;
        const oh2 = (vAdded / 1000) * safeTitrantConc * nTitrantOH;
        currentOHConc = (oh1 + oh2) / totalVolL + 1e-7;
        currentHConc = 1e-14 / currentOHConc;
        statusText = `⚠️ 同為鹼性溶液：混合不發生中和反應，OH⁻ 莫耳數直接累加`;
      }
    } else {
      const initialHoles = (safeAnalyteVol / 1000) * safeAnalyteConc * nAnalyte;
      const addedHoles = (vAdded / 1000) * safeTitrantConc * nTitrant;

      if (isAcidInFlask) {
        if (addedHoles < initialHoles) {
          const excessH = (initialHoles - addedHoles) / totalVolL;
          currentHConc = Math.max(1e-7, excessH);
          currentOHConc = 1e-14 / currentHConc;
          statusText = `酸過量 (未達當量點)，過量 H⁺ 莫耳數 = ${(initialHoles - addedHoles).toExponential(3)} mol`;
        } else if (Math.abs(addedHoles - initialHoles) < 1e-8) {
          currentHConc = 1e-7;
          currentOHConc = 1e-7;
          statusText = `完全中和 (恰達當量點)，[H⁺] = [OH⁻] = 1.0 × 10⁻⁷ M`;
        } else {
          const excessOH = (addedHoles - initialHoles) / totalVolL;
          currentOHConc = Math.max(1e-7, excessOH);
          currentHConc = 1e-14 / currentOHConc;
          statusText = `鹼過量 (已過當量點)，過量 OH⁻ 莫耳數 = ${(addedHoles - initialHoles).toExponential(3)} mol`;
        }
      } else {
        if (addedHoles < initialHoles) {
          const excessOH = (initialHoles - addedHoles) / totalVolL;
          currentOHConc = Math.max(1e-7, excessOH);
          currentHConc = 1e-14 / currentOHConc;
          statusText = `鹼過量 (未達當量點)，過量 OH⁻ 莫耳數 = ${(initialHoles - addedHoles).toExponential(3)} mol`;
        } else if (Math.abs(addedHoles - initialHoles) < 1e-8) {
          currentHConc = 1e-7;
          currentOHConc = 1e-7;
          statusText = `完全中和 (恰達當量點)，[H⁺] = [OH⁻] = 1.0 × 10⁻⁷ M`;
        } else {
          const excessH = (addedHoles - initialHoles) / totalVolL;
          currentHConc = Math.max(1e-7, excessH);
          currentOHConc = 1e-14 / currentHConc;
          statusText = `酸過量 (已過當量點)，過量 H⁺ 莫耳數 = ${(addedHoles - initialHoles).toExponential(3)} mol`;
        }
      }
    }

    if (hasPrecipitate) {
      statusText += ` (⚠️ 產生微溶性白色沉澱 CaSO₄↓，離子濃度受限於飽和濃度 0.015 M)`;
    }

    return {
      totalVolL,
      currentHConc,
      currentOHConc,
      spectatorCationName,
      spectatorCationConc,
      spectatorAnionName,
      spectatorAnionConc,
      hasPrecipitate,
      calculatedPh: -Math.log10(currentHConc),
      statusText,
      isSameNature
    };
  };

  const currentDetails = getTitrationDetails(addedVol);
  const currentTitrationPh = currentDetails.calculatedPh;
  const isReachedEquiv = !isSameNature && Math.abs(addedVol - equivVol) < 0.5;

  // 酚酞指示劑模擬顏色
  const getSolutionColor = (ph) => {
    if (ph < 8.2) return 'rgba(239, 68, 68, 0.15)';
    if (ph >= 8.2 && ph <= 10.0) return 'rgba(236, 72, 153, 0.5)';
    return 'rgba(219, 39, 119, 0.8)';
  };

  // 生成繪圖曲線座標點
  const maxVol = isSameNature ? 50 : Math.max(50, Math.ceil(equivVol * 2));
  const curvePoints = [];
  for (let v = 0; v <= maxVol; v += maxVol / 60) {
    const ph = getTitrationDetails(v).calculatedPh;
    const x = 40 + (v / maxVol) * 240;
    const y = 180 - (ph / 14) * 160;
    curvePoints.push(`${x},${y}`);
  }

  const currentX = 40 + (addedVol / maxVol) * 240;
  const currentY = 180 - (currentTitrationPh / 14) * 160;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Droplets className="w-5 h-5 text-pink-400" />
          理化實驗室：國二下 單元三《酸鹼與鹽 (酸鹼中和與滴定)》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索莫耳濃度與 pH 值換算、電離方程式與動態酸鹼滴定曲線畫布</p>
      </div>

      {/* 子分頁 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('ph')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'ph' ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-pink-300" /> 1. 莫耳濃度與 pH 值計算器
        </button>
        <button
          onClick={() => setActiveTab('titration')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'titration' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-indigo-300" /> 2. 酸鹼滴定模擬與 pH 曲線圖
        </button>
      </div>

      {/* 1. 莫耳濃度與 pH 值計算器 */}
      {activeTab === 'ph' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-bold text-pink-300 block">1. 選擇溶質種類：</label>
              <select
                value={selectedSoluteId}
                onChange={(e) => setSelectedSoluteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-400 font-medium"
              >
                {SOLUTES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">2. 溶質莫耳數 (mol)：</label>
              <input
                type="number" step="0.001" min="0"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-center text-amber-300 font-mono font-bold focus:outline-none focus:border-pink-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">3. 溶液體積 (L)：</label>
              <input
                type="number" step="0.1" min="0.001"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-center text-cyan-300 font-mono font-bold focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono space-y-1">
              <span className="text-xs text-slate-400 font-sans block">完全解離離子方程式：</span>
              <span className="text-base md:text-lg font-bold text-emerald-400">{currentSolute.eq}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-sans">溶液莫耳濃度 [C]：</span>
                <span className="text-base font-bold text-amber-300">{molarity.toFixed(3)} M</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-sans">氫離子濃度 [H⁺]：</span>
                <span className="text-base font-bold text-rose-400">
                  {formatScientific(hConc)} M
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-sans">氫氧根離子濃度 [OH⁻]：</span>
                <span className="text-base font-bold text-cyan-400">
                  {formatScientific(ohConc)} M
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-pink-500/30 flex flex-col items-center justify-center space-y-3">
              <span className="text-xs font-bold text-slate-400">水溶液酸鹼值 (pH Meter)：</span>
              <div className="text-4xl md:text-5xl font-extrabold font-mono text-pink-400 drop-shadow-md">
                pH = {phValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  phValue < 6.8 ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  phValue > 7.2 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {phValue < 6.8 ? '🔴 酸性溶液' : phValue > 7.2 ? '🔵 鹼性溶液' : '🟢 中性溶液'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-pink-300 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-pink-400" /> pH 詳細計算過程拆解
                </span>
                <button
                  onClick={() => setShowPhCalcSteps(!showPhCalcSteps)}
                  className="text-[11px] bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 px-2.5 py-1 rounded-lg border border-pink-500/30 flex items-center gap-1 transition-all"
                >
                  {showPhCalcSteps ? '隱藏過程' : '顯示計算過程'}
                  {showPhCalcSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showPhCalcSteps && (
                <div className="p-3 bg-slate-900 rounded-lg border border-pink-500/30 font-mono space-y-2 text-slate-300">
                  <p>1. 莫耳濃度 M = 溶質莫耳數 / 溶液公升數</p>
                  <p className="pl-3 text-amber-300">• M = {safeMoles} mol / {safeVol} L = {molarity.toFixed(4)} M</p>

                  <p>2. 解離離子濃度計算：</p>
                  {currentSolute.hCount > 0 && (
                    <p className="pl-3 text-rose-300">• [H⁺] = {molarity.toFixed(4)} × {currentSolute.hCount} = {formatScientific(molarity * currentSolute.hCount)} M</p>
                  )}
                  {currentSolute.ohCount > 0 && (
                    <p className="pl-3 text-cyan-300">• [OH⁻] = {molarity.toFixed(4)} × {currentSolute.ohCount} = {formatScientific(molarity * currentSolute.ohCount)} M</p>
                  )}
                  {currentSolute.hCount === 0 && currentSolute.ohCount === 0 && (
                    <p className="pl-3 text-emerald-300">• 中性鹽類不解離 H⁺/OH⁻，水純解離 [H⁺] = 1.0 × 10⁻⁷ M</p>
                  )}

                  <p>3. pH 值定義 pH = -log₁₀[H⁺]：</p>
                  <p className="pl-3 text-pink-400 font-bold">• pH = -log₁₀({formatScientific(hConc)}) = {phValue.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 酸鹼滴定模擬實驗 */}
      {activeTab === 'titration' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center text-xs">
            <div className="space-y-1">
              <label className="font-bold text-indigo-300 block">1. 滴定管溶液：</label>
              <select
                value={titrantId}
                onChange={(e) => setTitrantId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2 text-white focus:outline-none focus:border-indigo-400"
              >
                {SOLUTES.filter(s => s.type !== 'neutral_salt').map((s) => (
                  <option key={`t-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-pink-300 block">2. 錐形瓶被滴定液：</label>
              <select
                value={analyteId}
                onChange={(e) => setAnalyteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2 text-white focus:outline-none focus:border-pink-400"
              >
                {SOLUTES.filter(s => s.type !== 'neutral_salt').map((s) => (
                  <option key={`a-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-indigo-300 block">3. 滴定管濃度 (M)：</label>
              <input
                type="number" step="0.05" min="0.01"
                value={titrantConc}
                onChange={(e) => setTitrantConc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-indigo-300 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-pink-300 block">4. 被滴定液濃度 (M)：</label>
              <input
                type="number" step="0.05" min="0.01"
                value={analyteConc}
                onChange={(e) => setAnalyteConc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-pink-300 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 block">5. 被滴定體積 (mL)：</label>
              <div className="flex gap-1.5">
                <input
                  type="number" step="5" min="5"
                  value={analyteVol}
                  onChange={(e) => setAnalyteVol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-cyan-300 font-mono font-bold"
                />
                <button
                  onClick={() => setAddedVol(0)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl px-2.5 font-bold shrink-0 transition-all"
                  title="重置體積"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>

          {isSameNature && (
            <div className="p-3 bg-amber-950/80 border border-amber-500/80 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>同為{isAcidInFlask ? '酸性' : '鹼性'}溶液：此組合為同質溶液混合，不發生酸鹼中和反應，沒有當量點，離子莫耳數將直接累加。</span>
            </div>
          )}

          {/* 動態各離子莫耳濃度即時看板 (含 CaSO4 沉澱標記) */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                錐形瓶內各離子莫耳濃度隨滴定動態變化 (當前 V_滴入 = {addedVol.toFixed(1)} mL)：
              </span>
              {currentDetails.hasPrecipitate && (
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ⚠️ 產生白色微溶沉澱 CaSO₄↓
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-rose-400 font-sans block font-bold">[H⁺] 氫離子濃度：</span>
                <span className="text-sm font-bold text-rose-300">{formatScientific(currentDetails.currentHConc)} M</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-sans block font-bold">[OH⁻] 氫氧根離子濃度：</span>
                <span className="text-sm font-bold text-cyan-300">{formatScientific(currentDetails.currentOHConc)} M</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-sans block font-bold">[{currentDetails.spectatorCationName}] 陽離子濃度：</span>
                <span className="text-sm font-bold text-amber-300">{formatScientific(currentDetails.spectatorCationConc)} M</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-sans block font-bold">[{currentDetails.spectatorAnionName}] 陰離子濃度：</span>
                <span className="text-sm font-bold text-emerald-300">{formatScientific(currentDetails.spectatorAnionConc)} M</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-between relative min-h-[320px]">
              <span className="text-xs font-bold text-slate-400">🧪 動態滴定裝置模擬</span>

              <svg width="200" height="230" viewBox="0 0 200 230" className="drop-shadow-md">
                <rect x="20" y="10" width="8" height="210" fill="#475569" rx="2" />
                <rect x="10" y="210" width="80" height="10" fill="#334155" rx="2" />
                <rect x="25" y="60" width="30" height="6" fill="#64748b" rx="1" />

                <rect x="50" y="15" width="16" height="110" fill="none" stroke="#94a3b8" strokeWidth="2" rx="2" />
                <rect x="52" y={20 + (addedVol / maxVol) * 80} width="12" height={100 - (addedVol / maxVol) * 80} fill="#818cf8" opacity="0.6" />
                <circle cx="58" cy="128" r="4" fill="#38bdf8" />

                {addedVol > 0 && (
                  <circle cx="58" cy="142" r="3" fill="#818cf8" className="animate-bounce" />
                )}

                <path d="M48,150 L68,150 L88,205 C90,210 85,215 78,215 L38,215 C31,215 26,210 28,205 Z" fill="none" stroke="#94a3b8" strokeWidth="2" />
                <path
                  d={`M${38 - (addedVol / maxVol) * 4},190 L${78 + (addedVol / maxVol) * 4},190 C85,210 85,215 78,215 L38,215 C31,215 31,210 38,190 Z`}
                  fill={getSolutionColor(currentTitrationPh)}
                />
              </svg>

              <div className="w-full space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                  <span>滴定滴入體積: <strong className="text-indigo-400">{addedVol.toFixed(1)} mL</strong></span>
                  <span>當量點: <strong className="text-emerald-400">{isSameNature ? '無' : `${equivVol.toFixed(1)} mL`}</strong></span>
                </div>
                <input
                  type="range" min="0" max={maxVol} step="0.2"
                  value={addedVol}
                  onChange={(e) => setAddedVol(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">📈 酸鹼滴定 pH 曲線圖</span>
                <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/80 px-2.5 py-1 rounded-lg border border-pink-800">
                  當前 pH = {currentTitrationPh.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 relative">
                <svg width="100%" height="200" viewBox="0 0 300 200">
                  <line x1="40" y1="20" x2="280" y2="20" stroke="#334155" strokeDasharray="3 3" />
                  <text x="30" y="24" fill="#64748b" fontSize="8" textAnchor="end">14</text>

                  <line x1="40" y1="100" x2="280" y2="100" stroke="#334155" strokeDasharray="3 3" />
                  <text x="30" y="104" fill="#64748b" fontSize="8" textAnchor="end">7</text>

                  <line x1="40" y1="180" x2="280" y2="180" stroke="#475569" />
                  <text x="30" y="184" fill="#64748b" fontSize="8" textAnchor="end">0</text>

                  <text x="160" y="196" fill="#94a3b8" fontSize="9" textAnchor="middle">滴入體積 V (mL)</text>
                  <text x="15" y="100" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 15 100)">pH 值</text>

                  {!isSameNature && equivVol <= maxVol && (
                    <line
                      x1={40 + (equivVol / maxVol) * 240}
                      y1="20"
                      x2={40 + (equivVol / maxVol) * 240}
                      y2="180"
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                  )}

                  <polyline
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    points={curvePoints.join(' ')}
                  />

                  <circle cx={currentX} cy={currentY} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              {isReachedEquiv && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>🎉 已到達【滴定當量點 (Equivalence Point)】！酸鹼莫耳數恰好完全中和。</span>
                </div>
              )}
            </div>
          </div>

          {/* 滴定過程詳細計算 */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-400" /> {isSameNature ? '同性質混合【當前 pH 值】計算過程' : '滴定當量點與【當前 pH 值】計算過程'}
              </span>
              <button
                onClick={() => setShowTitrationSteps(!showTitrationSteps)}
                className="text-[11px] bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition-all"
              >
                {showTitrationSteps ? '隱藏過程' : '顯示計算過程'}
                {showTitrationSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showTitrationSteps && (
              <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 font-mono space-y-2 text-slate-300">
                {!isSameNature && (
                  <div className="border-b border-slate-800 pb-2">
                    <p className="font-bold text-indigo-300">📐 理論當量點計算：N₁ × M₁ × V₁ = N₂ × M₂ × V₂</p>
                    <p>• 錐形瓶莫耳數 = {nAnalyte} × {safeAnalyteConc} M × {safeAnalyteVol} mL = {(nAnalyte * safeAnalyteConc * safeAnalyteVol).toFixed(3)} mmol</p>
                    <p className="text-emerald-400 font-bold">• 當量點體積 V_eq = {(nAnalyte * safeAnalyteConc * safeAnalyteVol).toFixed(3)} / ({nTitrant} × {safeTitrantConc}) = {equivVol.toFixed(2)} mL</p>
                  </div>
                )}

                <div className="pt-1 space-y-1.5">
                  <p className="font-bold text-pink-300">🧪 當前滴定點 (V_added = {addedVol.toFixed(1)} mL) 之 pH 計算過程：</p>
                  <p className="pl-3 text-slate-400">• 反應狀態：{currentDetails.statusText}</p>
                  <p className="pl-3 text-amber-300">• 溶液總體積 V_total = {safeAnalyteVol} mL + {addedVol.toFixed(1)} mL = {(currentDetails.totalVolL * 1000).toFixed(1)} mL ({currentDetails.totalVolL.toFixed(4)} L)</p>
                  <p className="pl-3 text-cyan-300">• 當前 [H⁺] 濃度 = {formatScientific(currentDetails.currentHConc)} M</p>
                  <p className="pl-3 font-bold text-pink-400">• 當前 pH = -log₁₀({formatScientific(currentDetails.currentHConc)}) = {currentTitrationPh.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}