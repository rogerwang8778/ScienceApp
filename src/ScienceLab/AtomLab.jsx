import React, { useState } from 'react';
import { Atom, Sparkles, Calculator, ChevronDown, ChevronUp, Layers, Plus } from 'lucide-react';

// 1~36 號元素計算
const getElementData = (z) => {
  const names = [
    '', '氫','氦','鋰','鈹','硼','碳','氮','氧','氟','氖',
    '鈉','鎂','鋁','矽','磷','硫','氯','氬','鉀','鈣',
    '鈧','鈦','釩','鉻','錳','鐵','鈷','鎳','銅','鋅',
    '鎵','鍺','砷','硒','溴','氪'
  ];
  const symbols = [
    '', 'H','He','Li','Be','B','C','N','O','F','Ne',
    'Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca',
    'Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn',
    'Ga','Ge','As','Se','Br','Kr'
  ];
  const neutrons = [
    0, 0, 2, 4, 5, 6, 6, 7, 8, 10, 10,
    12, 12, 14, 14, 16, 16, 18, 22, 20, 20,
    24, 26, 28, 28, 30, 30, 32, 30, 35, 35,
    39, 41, 42, 45, 45, 48
  ];

  const shells = [];
  if (z <= 2) {
    shells.push(z);
  } else if (z <= 10) {
    shells.push(2, z - 2);
  } else if (z <= 18) {
    shells.push(2, 8, z - 10);
  } else {
    const k = 2; const l = 8;
    let m = 8; let n = z - 18;
    if (z > 20) {
      m = 8 + (z - 20); n = 2;
      if (z === 24) { m = 13; n = 1; }
      if (z === 29) { m = 14; n = 1; }
    }
    if (z > 30) { m = 18; n = z - 28; }
    shells.push(k, l, m, n);
  }

  const outer = shells[shells.length - 1];
  let valency = '0'; let type = '惰性氣體'; let desc = '最外層電子已填滿，極為穩定不易反應';

  if (z === 1) {
    valency = '+1'; type = '陽離子趨勢'; desc = '最外層有 1 個電子，易失去 1 個電子形成 H⁺';
  } else if (outer === 1 || outer === 2 || outer === 3) {
    valency = `+${outer}`; type = '陽離子趨勢'; desc = `最外層有 ${outer} 個價電子，易失去 ${outer} 個電子達到穩定八隅體結構`;
  } else if (outer === 5 || outer === 6 || outer === 7) {
    valency = `-${8 - outer}`; type = '陰離子趨勢'; desc = `最外層有 ${outer} 個價電子，易吸引 ${8 - outer} 個電子達到 8 個電子的穩定結構`;
  } else if (outer === 4) {
    valency = '±4'; type = '共價趨勢'; desc = '最外層有 4 個價電子，傾向形成共價鍵共用電子';
  }

  return { z, symbol: symbols[z], name: names[z], n: neutrons[z] || z, shells, valency, type, desc };
};

const PERIODIC_TABLE_MAP = [
  { z: 1, row: 1, col: 1 }, { z: 2, row: 1, col: 18 },
  { z: 3, row: 2, col: 1 }, { z: 4, row: 2, col: 2 },
  { z: 5, row: 2, col: 13 }, { z: 6, row: 2, col: 14 }, { z: 7, row: 2, col: 15 }, { z: 8, row: 2, col: 16 }, { z: 9, row: 2, col: 17 }, { z: 10, row: 2, col: 18 },
  { z: 11, row: 3, col: 1 }, { z: 12, row: 3, col: 2 },
  { z: 13, row: 3, col: 13 }, { z: 14, row: 3, col: 14 }, { z: 15, row: 3, col: 15 }, { z: 16, row: 3, col: 16 }, { z: 17, row: 3, col: 17 }, { z: 18, row: 3, col: 18 },
  ...Array.from({ length: 18 }, (_, i) => ({ z: 19 + i, row: 4, col: i + 1 }))
];

const CATIONS = [
  { id: 'Na',  symbol: 'Na⁺',  charge: 1, name: '鈉離子', formulaText: 'Na', cn: '鈉' },
  { id: 'K',   symbol: 'K⁺',   charge: 1, name: '鉀離子', formulaText: 'K', cn: '鉀' },
  { id: 'NH4', symbol: 'NH₄⁺', charge: 1, name: '銨根離子', formulaText: 'NH₄', isPolyatomic: true, cn: '銨' },
  { id: 'Mg',  symbol: 'Mg²⁺', charge: 2, name: '鎂離子', formulaText: 'Mg', cn: '鎂' },
  { id: 'Ca',  symbol: 'Ca²⁺', charge: 2, name: '鈣離子', formulaText: 'Ca', cn: '鈣' },
  { id: 'Fe3', symbol: 'Fe³⁺', charge: 3, name: '鐵離子', formulaText: 'Fe', cn: '鐵' },
  { id: 'Fe2', symbol: 'Fe²⁺', charge: 2, name: '亞鐵離子', formulaText: 'Fe', cn: '亞鐵' },
  { id: 'Al',  symbol: 'Al³⁺', charge: 3, name: '鋁離子', formulaText: 'Al', cn: '鋁' },
  { id: 'H',   symbol: 'H⁺',   charge: 1, name: '氫離子', formulaText: 'H', cn: '氫' },
];

const ANIONS = [
  { id: 'Cl',    symbol: 'Cl⁻',      charge: 1, name: '氯離子', formulaText: 'Cl', cnHead: '氯化' },
  { id: 'O',     symbol: 'O²⁻',      charge: 2, name: '氧離子', formulaText: 'O', cnHead: '氧化' },
  { id: 'F',     symbol: 'F⁻',       charge: 1, name: '氟離子', formulaText: 'F', cnHead: '氟化' },
  { id: 'OH',    symbol: 'OH⁻',      charge: 1, name: '氫氧根離子', formulaText: 'OH', isPolyatomic: true, cnHead: '氫氧化' },
  { id: 'SO4',   symbol: 'SO₄²⁻',     charge: 2, name: '硫酸根離子', formulaText: 'SO₄', isPolyatomic: true, cnHead: '硫酸' },
  { id: 'SO3',   symbol: 'SO₃²⁻',     charge: 2, name: '亞硫酸根離子', formulaText: 'SO₃', isPolyatomic: true, cnHead: '亞硫酸' },
  { id: 'PO4',   symbol: 'PO₄³⁻',    charge: 3, name: '磷酸根離子', formulaText: 'PO₄', isPolyatomic: true, cnHead: '磷酸' },
  { id: 'NO3',   symbol: 'NO₃⁻',      charge: 1, name: '硝酸根離子', formulaText: 'NO₃', isPolyatomic: true, cnHead: '硝酸' },
  { id: 'CH3COO',symbol: 'CH₃COO⁻',  charge: 1, name: '醋酸根離子', formulaText: 'CH₃COO', isPolyatomic: true, isOrganic: true, cnHead: '醋酸' },
];

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

export default function AtomLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('octet');
  const [selectedZ, setSelectedZ] = useState(11);
  const [selectedCation, setSelectedCation] = useState(CATIONS[8]); // H+
  const [selectedAnion, setSelectedAnion] = useState(ANIONS[5]); // SO3 2-
  const [showCompoundCalc, setShowCompoundCalc] = useState(false);

  const elem = getElementData(selectedZ);

  const l = lcm(selectedCation.charge, selectedAnion.charge);
  const cationRatio = l / selectedCation.charge;
  const anionRatio = l / selectedAnion.charge;
  const totalElectronTransfer = l;

  // 固若金湯的中文名稱
  const getCompoundChineseName = () => {
    const cationCn = selectedCation.cn || '';
    const anionCnHead = selectedAnion.cnHead || '';

    if (selectedCation.id === 'H') {
      if (selectedAnion.id === 'Cl') return '鹽酸 (氯化氫)';
      if (selectedAnion.id === 'F') return '氟化氫';
      if (selectedAnion.id === 'O') return '水 (氧化氫)';
      if (anionCnHead.endsWith('酸')) return anionCnHead;
      return `${anionCnHead}酸`;
    }
    return `${anionCnHead}${cationCn}`;
  };

  const renderFormulaJSX = () => {
    if (selectedAnion.isOrganic) {
      let aPart = selectedAnion.formulaText;
      if (anionRatio > 1) aPart = `(${aPart})`;
      let cPart = selectedCation.formulaText;
      if (selectedCation.isPolyatomic && cationRatio > 1) cPart = `(${cPart})`;

      const formatSub = (str) => {
        const clean = str.replace(/₄/g, '4').replace(/₃/g, '3');
        return clean.split(/(\d+)/).map((part, idx) =>
          /^\d+$/.test(part) ? <sub key={idx}>{part}</sub> : part
        );
      };

      return (
        <span className="inline-flex items-baseline">
          {formatSub(aPart)}
          {anionRatio > 1 && <sub>{anionRatio}</sub>}
          {formatSub(cPart)}
          {cationRatio > 1 && <sub>{cationRatio}</sub>}
        </span>
      );
    }

    let cPart = selectedCation.formulaText;
    if (selectedCation.isPolyatomic && cationRatio > 1) cPart = `(${cPart})`;
    let aPart = selectedAnion.formulaText;
    if (selectedAnion.isPolyatomic && anionRatio > 1) aPart = `(${aPart})`;

    const formatSub = (str) => {
      const clean = str.replace(/₄/g, '4').replace(/₃/g, '3');
      return clean.split(/(\d+)/).map((part, idx) =>
        /^\d+$/.test(part) ? <sub key={idx}>{part}</sub> : part
      );
    };

    return (
      <span className="inline-flex items-baseline">
        {formatSub(cPart)}
        {cationRatio > 1 && <sub>{cationRatio}</sub>}
        {formatSub(aPart)}
        {anionRatio > 1 && <sub>{anionRatio}</sub>}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Atom className="w-5 h-5 text-indigo-400" />
          理化實驗室：原子結構與化合物 (Atom & Molecule Lab)
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索 1~36 號元素週期表八隅體電子排列及離子化合物化學式推導</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('octet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'octet' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Atom className="w-3.5 h-3.5 text-indigo-300" /> 1~36 號元素週期表與八隅體結構
        </button>
        <button
          onClick={() => setActiveSubTab('compound')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'compound' ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" /> 離子化合物化學式形成推導
        </button>
      </div>

      {/* 1. 元素週期表與八隅體結構模組 */}
      {activeSubTab === 'octet' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl space-y-3 overflow-x-auto">
            <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> 點選週期表元素 (1 ~ 36 號)：
            </h3>

            <div className="min-w-[650px] grid grid-cols-18 gap-1 text-center font-mono">
              {PERIODIC_TABLE_MAP.map((item) => {
                const eData = getElementData(item.z);
                const isSelected = selectedZ === item.z;
                return (
                  <button
                    key={`p-${item.z}`}
                    onClick={() => setSelectedZ(item.z)}
                    style={{ gridColumn: item.col, gridRow: item.row }}
                    className={`p-1 rounded-lg border transition-all flex flex-col items-center justify-center min-h-[46px] ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-300 text-white shadow-lg ring-2 ring-indigo-400 scale-105 z-10'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span className="text-[9px] opacity-60 leading-none">{item.z}</span>
                    <span className="text-xs font-bold leading-tight">{eData.symbol}</span>
                    <span className="text-[9px] text-indigo-200 scale-90">{eData.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-indigo-300 font-bold text-base">
                  {elem.name} ({elem.symbol}) 原子結構分析
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold">
                  原子序 Z = {elem.z}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">質子數 (P⁺)：</span>
                  <span className="text-rose-400 font-bold">{elem.z} 個</span>
                </div>
                <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">中子數 (N⁰)：</span>
                  <span className="text-slate-300 font-bold">{elem.n} 個</span>
                </div>
                <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">電子總數 (e⁻)：</span>
                  <span className="text-cyan-400 font-bold">{elem.z} 個</span>
                </div>
                <div className="flex justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">軌域排列：</span>
                  <span className="text-amber-400 font-bold">{elem.shells.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs space-y-2">
                <div className="flex justify-between font-bold border-b border-slate-800 pb-1">
                  <span className="text-indigo-300">八隅體趨勢：{elem.type}</span>
                  <span className="text-amber-400">穩定價態：{elem.valency}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">💡 {elem.desc}</p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[320px]">
              <svg viewBox="0 0 340 340" className="w-full h-full max-w-sm">
                <circle cx="170" cy="170" r="28" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                <text x="170" y="166" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">
                  {elem.z} P⁺
                </text>
                <text x="170" y="180" textAnchor="middle" fill="#94a3b8" fontSize="9">
                  {elem.n} N⁰
                </text>

                {elem.shells.map((electronCount, shellIdx) => {
                  const radius = 48 + shellIdx * 28;
                  const shellNames = ['K層', 'L層', 'M層', 'N層'];
                  const electronDots = [];
                  for (let i = 0; i < electronCount; i++) {
                    const angle = (i * 2 * Math.PI) / electronCount - Math.PI / 2;
                    const ex = 170 + radius * Math.cos(angle);
                    const ey = 170 + radius * Math.sin(angle);
                    const isOutermost = shellIdx === elem.shells.length - 1;

                    electronDots.push(
                      <circle
                        key={`e-${shellIdx}-${i}`}
                        cx={ex} cy={ey}
                        r={isOutermost ? "5" : "3.5"}
                        fill={isOutermost ? "#f59e0b" : "#38bdf8"}
                        stroke="#ffffff" strokeWidth="1"
                        className={isOutermost ? "animate-pulse" : ""}
                      />
                    );
                  }

                  return (
                    <g key={`shell-${shellIdx}`}>
                      <circle
                        cx="170" cy="170" r={radius} fill="none"
                        stroke={shellIdx === elem.shells.length - 1 ? "#f59e0b" : "#475569"}
                        strokeWidth={shellIdx === elem.shells.length - 1 ? "1.5" : "1"}
                        strokeDasharray={shellIdx === elem.shells.length - 1 ? "4 3" : "none"}
                        opacity="0.8"
                      />
                      <text x={170 + radius + 3} y="173" fill="#64748b" fontSize="8">
                        {shellNames[shellIdx]}
                      </text>
                      {electronDots}
                    </g>
                  );
                })}
              </svg>
              <span className="text-[11px] text-slate-400 mt-2">
                橙色亮點為<b className="text-amber-400">最外層價電子</b> ({elem.shells[elem.shells.length - 1]} 個)
              </span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-purple-300 border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-400" /> 選擇正負離子組合
            </h3>

            <div className="space-y-1.5">
              <span className="text-xs text-rose-300 font-bold block">1. 選擇陽離子 (正電)</span>
              <div className="grid grid-cols-3 gap-2">
                {CATIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCation(c)}
                    className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center ${
                      selectedCation.id === c.id
                        ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{c.symbol}</span>
                    <span className="text-[10px] opacity-80">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-cyan-300 font-bold block">2. 選擇陰離子 (負電)</span>
              <div className="grid grid-cols-3 gap-2">
                {ANIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAnion(a)}
                    className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center ${
                      selectedAnion.id === a.id
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{a.symbol}</span>
                    <span className="text-[10px] opacity-80">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-purple-300 font-bold">化合物形成結果</span>
                <button
                  onClick={() => setShowCompoundCalc(!showCompoundCalc)}
                  className="text-[11px] bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1 transition-all"
                >
                  <Calculator className="w-3 h-3" />
                  {showCompoundCalc ? '隱藏配平推導' : '顯示配平推導'}
                  {showCompoundCalc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">中文名稱：</span>
                  <span className="text-emerald-400 font-bold text-sm">{getCompoundChineseName()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">化學式：</span>
                  <span className="text-amber-400 font-bold text-lg font-mono">
                    {renderFormulaJSX()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400">電子轉移總數：</span>
                  <span className="text-amber-300 font-bold">{cationRatio} 個 {selectedCation.name} 共轉移 {totalElectronTransfer} 個 e⁻</span>
                </div>
              </div>

              {showCompoundCalc && (
                <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-purple-500/30 text-[11px] space-y-1.5 text-slate-300 font-mono">
                  <div className="font-bold text-purple-300 border-b border-slate-800 pb-1">
                    📐 電子得失與電荷平衡推導
                  </div>
                  <p>1. 陽離子失電子：{cationRatio} 個 {selectedCation.name} 各失去 {selectedCation.charge} 個 e⁻，共釋放 <span className="text-rose-400 font-bold">{totalElectronTransfer}</span> 個 e⁻</p>
                  <p>2. 陰離子得電子：{anionRatio} 個 {selectedAnion.name} 各接收 {selectedAnion.charge} 個 e⁻，共吸收 <span className="text-cyan-400 font-bold">{totalElectronTransfer}</span> 個 e⁻</p>
                  <p>3. 電中性平衡條件：</p>
                  <p className="text-purple-300 pl-3">
                    (+{selectedCation.charge}) × {cationRatio} + (-{selectedAnion.charge}) × {anionRatio} = 0
                  </p>
                  <p className="text-amber-300 font-bold pl-3 border-t border-slate-800 pt-1">
                    ⇒ 生成化合物：{getCompoundChineseName()} ({renderFormulaJSX()})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 高度視覺化得失電子與數量顆粒 SVG 圖 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-between min-h-[360px]">
            <svg viewBox="0 0 460 260" className="w-full h-full max-w-lg">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* 1. 陽離子顆粒視覺化面板 */}
              <g transform="translate(10, 35)">
                <rect x="0" y="0" width="120" height="150" fill="#881337" fillOpacity="0.25" stroke="#f43f5e" strokeWidth="2" rx="10" />
                <text x="60" y="22" textAnchor="middle" fill="#fda4af" fontSize="12" fontWeight="bold">
                  {selectedCation.name}
                </text>

                {/* 根據 cationRatio (1~3) 動態畫出對應數量的陽離子圖卡 */}
                {Array.from({ length: cationRatio }).map((_, idx) => {
                  const itemY = 40 + idx * 34;
                  return (
                    <g key={`c-particle-${idx}`} transform={`translate(10, ${itemY})`}>
                      <rect x="0" y="0" width="100" height="28" fill="#4c0519" stroke="#fb7185" strokeWidth="1" rx="6" />
                      <circle cx="16" cy="14" r="9" fill="#f43f5e" />
                      <text x="16" y="18" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">+</text>
                      <text x="55" y="18" textAnchor="middle" fill="#fecdd3" fontSize="12" fontWeight="bold">
                        {selectedCation.symbol}
                      </text>
                    </g>
                  );
                })}

                <rect x="10" y="122" width="100" height="20" fill="#881337" rx="4" />
                <text x="60" y="136" textAnchor="middle" fill="#fb7185" fontSize="9" fontWeight="bold">
                  共失 {totalElectronTransfer} 個 e⁻
                </text>
              </g>

              {/* + 號 */}
              <text x="142" y="115" textAnchor="middle" fill="#94a3b8" fontSize="20" fontWeight="bold">+</text>

              {/* 2. 陰離子顆粒視覺化面板 */}
              <g transform="translate(155, 35)">
                <rect x="0" y="0" width="120" height="150" fill="#164e63" fillOpacity="0.25" stroke="#06b6d4" strokeWidth="2" rx="10" />
                <text x="60" y="22" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="bold">
                  {selectedAnion.name}
                </text>

                {/* 根據 anionRatio (1~3) 動態畫出對應數量的陰離子圖卡 */}
                {Array.from({ length: anionRatio }).map((_, idx) => {
                  const itemY = 40 + idx * 34;
                  return (
                    <g key={`a-particle-${idx}`} transform={`translate(10, ${itemY})`}>
                      <rect x="0" y="0" width="100" height="28" fill="#083344" stroke="#38bdf8" strokeWidth="1" rx="6" />
                      <circle cx="16" cy="14" r="9" fill="#06b6d4" />
                      <text x="16" y="18" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">-</text>
                      <text x="55" y="18" textAnchor="middle" fill="#a5f3fc" fontSize="11" fontWeight="bold">
                        {selectedAnion.symbol}
                      </text>
                    </g>
                  );
                })}

                <rect x="10" y="122" width="100" height="20" fill="#164e63" rx="4" />
                <text x="60" y="136" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
                  共得 {totalElectronTransfer} 個 e⁻
                </text>
              </g>

              {/* 頂部：電子點對點轉移拋物線軌跡與顆粒 */}
              <g>
                <path d="M 70 30 Q 140 -5 215 30" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow)" />
                <circle cx="142" cy="10" r="9" fill="#f59e0b" className="animate-pulse" />
                <text x="142" y="13" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">
                  {totalElectronTransfer}e⁻
                </text>
              </g>

              {/* 反應箭頭 → */}
              <g transform="translate(283, 100)">
                <path d="M 0 12 L 24 12 M 16 4 L 24 12 L 16 20" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              {/* 3. 化合物產物結果卡片 */}
              <g transform="translate(315, 35)">
                <rect x="0" y="0" width="135" height="150" fill="#581c87" fillOpacity="0.35" stroke="#c084fc" strokeWidth="2" rx="10" />
                <foreignObject x="0" y="25" width="135" height="40">
                  <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center font-bold text-amber-400 text-base font-mono">
                    {renderFormulaJSX()}
                  </div>
                </foreignObject>
                <text x="67" y="80" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="bold">
                  {getCompoundChineseName()}
                </text>
                <rect x="12" y="118" width="111" height="22" fill="#3b0764" rx="4" />
                <text x="67" y="133" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                  電中性化合物 (淨電荷 0)
                </text>
              </g>

              {/* 下方總結條 */}
              <g transform="translate(15, 205)">
                <rect x="0" y="0" width="435" height="32" fill="#0f172a" rx="6" stroke="#334155" strokeWidth="1" />
                <text x="217" y="20" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="bold">
                  ✨ 觀察：{cationRatio} 個 {selectedCation.name} 共有 {totalElectronTransfer} 個 e⁻ 轉移至 {anionRatio} 個 {selectedAnion.name}，電荷電中性！
                </text>
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}