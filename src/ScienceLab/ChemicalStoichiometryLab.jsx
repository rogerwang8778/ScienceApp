import React, { useState } from 'react';
import { Scale, Calculator, ChevronUp, ChevronDown, AlertCircle, Beaker, CheckCircle2, Sparkles } from 'lucide-react';

// CPK 標準原子顏色對照表
const ATOM_COLORS = {
  H:  { fill: '#f8fafc', stroke: '#94a3b8', text: '#0f172a' }, // 白色
  C:  { fill: '#334155', stroke: '#0f172a', text: '#ffffff' }, // 深灰色
  N:  { fill: '#3b82f6', stroke: '#1d4ed8', text: '#ffffff' }, // 藍色
  O:  { fill: '#ef4444', stroke: '#b91c1c', text: '#ffffff' }, // 紅色
  Na: { fill: '#a855f7', stroke: '#6b21a8', text: '#ffffff' }, // 紫色
  Mg: { fill: '#14b8a6', stroke: '#0f766e', text: '#ffffff' }, // 青綠色
  Al: { fill: '#94a3b8', stroke: '#475569', text: '#ffffff' }, // 淺灰色
  Cl: { fill: '#22c55e', stroke: '#15803d', text: '#ffffff' }, // 綠色
  Ca: { fill: '#8b5cf6', stroke: '#5b21b6', text: '#ffffff' }, // 深紫色
  Fe: { fill: '#f97316', stroke: '#c2410c', text: '#ffffff' }, // 橘色
  Zn: { fill: '#64748b', stroke: '#334155', text: '#ffffff' }, // 灰藍色
};

// 正則解析化學式中的所有原子與數量 (例如 NaHCO3 -> ['Na', 'H', 'C', 'O', 'O', 'O'])
const parseFormulaAtoms = (formula) => {
  const clean = formula
    .replace(/₁/g, '1').replace(/₂/g, '2').replace(/₃/g, '3')
    .replace(/₄/g, '4').replace(/₅/g, '5').replace(/₆/g, '6')
    .replace(/₇/g, '7').replace(/₈/g, '8').replace(/₉/g, '9')
    .replace(/₀/g, '0');

  const regex = /([A-Z][a-z]?)(-?\d*)?/g;
  let match;
  const atomCounts = {};

  while ((match = regex.exec(clean)) !== null) {
    if (match[0] === '') continue;
    const el = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    atomCounts[el] = (atomCounts[el] || 0) + count;
  }

  const atomsList = [];
  Object.keys(atomCounts).forEach(el => {
    for (let i = 0; i < atomCounts[el]; i++) {
      atomsList.push(el);
    }
  });

  return atomsList;
};

// 通用動態 ViewBox CPK 原子球模型渲染器
const MoleculeIcon = ({ formula }) => {
  const atoms = parseFormulaAtoms(formula);
  const total = atoms.length;

  // 1. 若原子數量多 (大於 6)，使用雙排佈局
  if (total > 6) {
    const row1 = atoms.slice(0, Math.ceil(total / 2));
    const row2 = atoms.slice(Math.ceil(total / 2));
    const maxCols = Math.max(row1.length, row2.length);
    const r = 7;
    const overlap = 11;
    const padding = 12;
    const svgWidth = maxCols * overlap + padding * 2;
    const svgHeight = 44;

    return (
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g className="drop-shadow-md">
          {row1.map((el, idx) => {
            const style = ATOM_COLORS[el] || { fill: '#6366f1', stroke: '#4338ca', text: '#ffffff' };
            const cx = padding + r + idx * overlap;
            const cy = 13;
            return (
              <g key={`r1-${el}-${idx}`}>
                <circle cx={cx} cy={cy} r={r} fill={style.fill} stroke={style.stroke} strokeWidth="1.2" />
                <text x={cx} y={cy + 2.5} textAnchor="middle" fill={style.text} fontSize="6" fontWeight="bold">{el}</text>
              </g>
            );
          })}
          {row2.map((el, idx) => {
            const style = ATOM_COLORS[el] || { fill: '#6366f1', stroke: '#4338ca', text: '#ffffff' };
            const cx = padding + r + idx * overlap;
            const cy = 29;
            return (
              <g key={`r2-${el}-${idx}`}>
                <circle cx={cx} cy={cy} r={r} fill={style.fill} stroke={style.stroke} strokeWidth="1.2" />
                <text x={cx} y={cy + 2.5} textAnchor="middle" fill={style.text} fontSize="6" fontWeight="bold">{el}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  // 2. 一般單排佈局：依原子數自適應動態寬度與 viewBox
  const r = 8;
  const overlap = 12;
  const padding = 12;
  const svgWidth = Math.max(48, total * overlap + padding * 2);
  const svgHeight = 40;
  const startX = (svgWidth - (total - 1) * overlap) / 2;

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      <g className="drop-shadow-md">
        {atoms.map((el, idx) => {
          const style = ATOM_COLORS[el] || { fill: '#6366f1', stroke: '#4338ca', text: '#ffffff' };
          const cx = startX + idx * overlap;
          const cy = svgHeight / 2;

          return (
            <g key={`atom-${el}-${idx}`}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="1.2"
              />
              <text
                x={cx}
                y={cy + 2.5}
                textAnchor="middle"
                fill={style.text}
                fontSize="6.5"
                fontWeight="bold"
              >
                {el}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// 常用化學反應式資料庫 (共 14 種國中常見範例)
const REACTIONS = [
  {
    id: 'nahco3_heat',
    name: '小蘇打加熱分解 (2NaHCO₃ → Na₂CO₃ + H₂O + CO₂)',
    eqDisplay: '2NaHCO₃ → Na₂CO₃ + H₂O + CO₂',
    correctCoeffs: [2, 1, 1, 1],
    reactants: [
      { name: '碳酸氫鈉', formula: 'NaHCO₃', coeff: 2, mw: 84 }
    ],
    products: [
      { name: '碳酸鈉', formula: 'Na₂CO₃', coeff: 1, mw: 106 },
      { name: '水', formula: 'H₂O', coeff: 1, mw: 18 },
      { name: '二氧化碳', formula: 'CO₂', coeff: 1, mw: 44 }
    ]
  },
  {
    id: 'caco3_hcl',
    name: '碳酸鈣加鹽酸 (CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂)',
    eqDisplay: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂',
    correctCoeffs: [1, 2, 1, 1, 1],
    reactants: [
      { name: '碳酸鈣', formula: 'CaCO₃', coeff: 1, mw: 100 },
      { name: '鹽酸', formula: 'HCl', coeff: 2, mw: 36.5 }
    ],
    products: [
      { name: '氯化鈣', formula: 'CaCl₂', coeff: 1, mw: 111 },
      { name: '水', formula: 'H₂O', coeff: 1, mw: 18 },
      { name: '二氧化碳', formula: 'CO₂', coeff: 1, mw: 44 }
    ]
  },
  {
    id: 'ammonia',
    name: '哈伯法合成氨 (N₂ + 3H₂ → 2NH₃)',
    eqDisplay: 'N₂ + 3H₂ → 2NH₃',
    correctCoeffs: [1, 3, 2],
    reactants: [
      { name: '氮氣', formula: 'N₂', coeff: 1, mw: 28 },
      { name: '氫氣', formula: 'H₂', coeff: 3, mw: 2 }
    ],
    products: [
      { name: '氨氣', formula: 'NH₃', coeff: 2, mw: 17 }
    ]
  },
  {
    id: 'methane_burn',
    name: '甲烷燃燒 (CH₄ + 2O₂ → CO₂ + 2H₂O)',
    eqDisplay: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    correctCoeffs: [1, 2, 1, 2],
    reactants: [
      { name: '甲烷', formula: 'CH₄', coeff: 1, mw: 16 },
      { name: '氧氣', formula: 'O₂', coeff: 2, mw: 32 }
    ],
    products: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 1, mw: 44 },
      { name: '水', formula: 'H₂O', coeff: 2, mw: 18 }
    ]
  },
  {
    id: 'propane_burn',
    name: '丙烷燃燒 (C₃H₈ + 5O₂ → 3CO₂ + 4H₂O)',
    eqDisplay: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
    correctCoeffs: [1, 5, 3, 4],
    reactants: [
      { name: '丙烷', formula: 'C₃H₈', coeff: 1, mw: 44 },
      { name: '氧氣', formula: 'O₂', coeff: 5, mw: 32 }
    ],
    products: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 3, mw: 44 },
      { name: '水', formula: 'H₂O', coeff: 4, mw: 18 }
    ]
  },
  {
    id: 'ethanol_burn',
    name: '乙醇燃燒 (C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O)',
    eqDisplay: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
    correctCoeffs: [1, 3, 2, 3],
    reactants: [
      { name: '乙醇', formula: 'C₂H₅OH', coeff: 1, mw: 46 },
      { name: '氧氣', formula: 'O₂', coeff: 3, mw: 32 }
    ],
    products: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 2, mw: 44 },
      { name: '水', formula: 'H₂O', coeff: 3, mw: 18 }
    ]
  },
  {
    id: 'glucose_resp',
    name: '葡萄糖燃燒/呼吸作用 (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O)',
    eqDisplay: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    correctCoeffs: [1, 6, 6, 6],
    reactants: [
      { name: '葡萄糖', formula: 'C₆H₁₂O₆', coeff: 1, mw: 180 },
      { name: '氧氣', formula: 'O₂', coeff: 6, mw: 32 }
    ],
    products: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 6, mw: 44 },
      { name: '水', formula: 'H₂O', coeff: 6, mw: 18 }
    ]
  },
  {
    id: 'mg_burn',
    name: '鎂帶燃燒 (2Mg + O₂ → 2MgO)',
    eqDisplay: '2Mg + O₂ → 2MgO',
    correctCoeffs: [2, 1, 2],
    reactants: [
      { name: '鎂帶', formula: 'Mg', coeff: 2, mw: 24.3 },
      { name: '氧氣', formula: 'O₂', coeff: 1, mw: 32 }
    ],
    products: [
      { name: '氧化鎂', formula: 'MgO', coeff: 2, mw: 40.3 }
    ]
  },
  {
    id: 'h2_burn',
    name: '氫氣燃燒 (2H₂ + O₂ → 2H₂O)',
    eqDisplay: '2H₂ + O₂ → 2H₂O',
    correctCoeffs: [2, 1, 2],
    reactants: [
      { name: '氫氣', formula: 'H₂', coeff: 2, mw: 2 },
      { name: '氧氣', formula: 'O₂', coeff: 1, mw: 32 }
    ],
    products: [
      { name: '水', formula: 'H₂O', coeff: 2, mw: 18 }
    ]
  },
  {
    id: 'h2o2_decomp',
    name: '雙氧水雙分解 (2H₂O₂ → 2H₂O + O₂)',
    eqDisplay: '2H₂O₂ → 2H₂O + O₂',
    correctCoeffs: [2, 2, 1],
    reactants: [
      { name: '雙氧水', formula: 'H₂O₂', coeff: 2, mw: 34 }
    ],
    products: [
      { name: '水', formula: 'H₂O', coeff: 2, mw: 18 },
      { name: '氧氣', formula: 'O₂', coeff: 1, mw: 32 }
    ]
  },
  {
    id: 'zn_hcl',
    name: '鋅粒與鹽酸反應 (Zn + 2HCl → ZnCl₂ + H₂)',
    eqDisplay: 'Zn + 2HCl → ZnCl₂ + H₂',
    correctCoeffs: [1, 2, 1, 1],
    reactants: [
      { name: '鋅粒', formula: 'Zn', coeff: 1, mw: 65.4 },
      { name: '鹽酸', formula: 'HCl', coeff: 2, mw: 36.5 }
    ],
    products: [
      { name: '氯化鋅', formula: 'ZnCl₂', coeff: 1, mw: 136.3 },
      { name: '氫氣', formula: 'H₂', coeff: 1, mw: 2 }
    ]
  },
  {
    id: 'carbon_burn',
    name: '木炭完全燃燒 (C + O₂ → CO₂)',
    eqDisplay: 'C + O₂ → CO₂',
    correctCoeffs: [1, 1, 1],
    reactants: [
      { name: '碳', formula: 'C', coeff: 1, mw: 12 },
      { name: '氧氣', formula: 'O₂', coeff: 1, mw: 32 }
    ],
    products: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 1, mw: 44 }
    ]
  },
  {
    id: 'iron_rust',
    name: '鐵生鏽反應 (4Fe + 3O₂ → 2Fe₂O₃)',
    eqDisplay: '4Fe + 3O₂ → 2Fe₂O₃',
    correctCoeffs: [4, 3, 2],
    reactants: [
      { name: '鐵', formula: 'Fe', coeff: 4, mw: 55.8 },
      { name: '氧氣', formula: 'O₂', coeff: 3, mw: 32 }
    ],
    products: [
      { name: '氧化鐵', formula: 'Fe₂O₃', coeff: 2, mw: 159.6 }
    ]
  },
  {
    id: 'photosynthesis',
    name: '光合作用 (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂)',
    eqDisplay: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
    correctCoeffs: [6, 6, 1, 6],
    reactants: [
      { name: '二氧化碳', formula: 'CO₂', coeff: 6, mw: 44 },
      { name: '水', formula: 'H₂O', coeff: 6, mw: 18 }
    ],
    products: [
      { name: '葡萄糖', formula: 'C₆H₁₂O₆', coeff: 1, mw: 180 },
      { name: '氧氣', formula: 'O₂', coeff: 6, mw: 32 }
    ]
  }
];

export default function ChemicalStoichiometryLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('balance');
  const [selectedRxnIndex, setSelectedRxnIndex] = useState(0);

  const rxn = REACTIONS[selectedRxnIndex];
  const [userCoeffs, setUserCoeffs] = useState(rxn.correctCoeffs.map(() => 1));

  // 計量與三段式網格模組 State
  const [calcMode, setCalcMode] = useState('mol');
  const [showCalcSteps, setShowCalcSteps] = useState(false);
  const [inputVal1, setInputVal1] = useState(5);
  const [inputVal2, setInputVal2] = useState(3);

  const handleRxnChange = (index) => {
    setSelectedRxnIndex(index);
    const newRxn = REACTIONS[index];
    setUserCoeffs(newRxn.correctCoeffs.map(() => 1));
    setInputVal1(5);
    setInputVal2(3);
  };

  const isCoeffCorrect = userCoeffs.every((val, idx) => val === rxn.correctCoeffs[idx]);

  // 三段式網格數據計算
  const calculateGridData = () => {
    const r1 = rxn.reactants[0];
    const r2 = rxn.reactants[1] || null;

    const initMol1 = calcMode === 'mol' ? (Number(inputVal1) || 0) : (Number(inputVal1) || 0) / r1.mw;
    const initMol2 = r2 ? (calcMode === 'mol' ? (Number(inputVal2) || 0) : (Number(inputVal2) || 0) / r2.mw) : 0;

    const times1 = initMol1 / r1.coeff;
    const times2 = r2 ? initMol2 / r2.coeff : Infinity;

    let rxnTimes = times1;
    let limitingIndex = 0;

    if (r2) {
      if (times2 < times1) {
        rxnTimes = times2;
        limitingIndex = 1;
      }
    }

    const changeMol_Reactants = rxn.reactants.map(r => rxnTimes * r.coeff);
    const changeMol_Products = rxn.products.map(p => rxnTimes * p.coeff);

    const finalMol_Reactants = [
      Math.max(0, initMol1 - changeMol_Reactants[0]),
      r2 ? Math.max(0, initMol2 - changeMol_Reactants[1]) : 0
    ];
    const finalMol_Products = changeMol_Products;

    return {
      initMol1, initMol2,
      limitingIndex, rxnTimes,
      changeMol_Reactants, changeMol_Products,
      finalMol_Reactants, finalMol_Products
    };
  };

  const gridData = calculateGridData();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          理化實驗室：計量化學與化學反應式 (Chemical Stoichiometry)
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索 14 種國中常見反應式平衡係數、自適應 CPK 分子畫布與三段式計量網格</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'balance' ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> 1. 反應式平衡係數與具體分子視覺化
        </button>
        <button
          onClick={() => setActiveSubTab('stoichiometry')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'stoichiometry' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Beaker className="w-3.5 h-3.5 text-emerald-300" /> 2. 三段式對齊網格與限量試劑
        </button>
      </div>

      {/* 1. 平衡係數與具體分子圖案視覺化模組 */}
      {activeSubTab === 'balance' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-2/3 space-y-1">
              <label className="text-xs font-bold text-indigo-300 block">選擇化學反應式 (共 14 種國中常見範例)：</label>
              <select
                value={selectedRxnIndex}
                onChange={(e) => handleRxnChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-medium"
              >
                {REACTIONS.map((r, idx) => (
                  <option key={r.id} value={idx}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className={`w-full md:w-1/3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isCoeffCorrect ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : 'bg-amber-950/60 border-amber-500/60 text-amber-300'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{isCoeffCorrect ? '🎉 平衡係數完全正確！符合質量守恆。' : '💡 請調整下方的係數，使左右分子數量完全平衡。'}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6 overflow-x-auto shadow-inner">
            <div className="min-w-[700px] space-y-6">

              {/* 頂部：方程式與係數微調 */}
              <div className="flex items-center justify-center gap-2 text-base font-bold font-mono">
                {rxn.reactants.map((r, idx) => (
                  <React.Fragment key={`r-input-${idx}`}>
                    {idx > 0 && <span className="text-slate-500 font-bold">+</span>}
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="number" min="1" max="10"
                        value={userCoeffs[idx]}
                        onChange={(e) => {
                          const newC = [...userCoeffs];
                          newC[idx] = Math.max(1, Number(e.target.value));
                          setUserCoeffs(newC);
                        }}
                        className="w-9 bg-indigo-950 text-indigo-300 border border-indigo-600 rounded text-center font-bold text-sm focus:outline-none"
                      />
                      <span className="text-emerald-400">{r.formula}</span>
                    </div>
                  </React.Fragment>
                ))}

                <span className="text-purple-400 text-lg font-bold px-1">→</span>

                {rxn.products.map((p, idx) => {
                  const coeffIdx = rxn.reactants.length + idx;
                  return (
                    <React.Fragment key={`p-input-${idx}`}>
                      {idx > 0 && <span className="text-slate-500 font-bold">+</span>}
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                        <input
                          type="number" min="1" max="10"
                          value={userCoeffs[coeffIdx]}
                          onChange={(e) => {
                            const newC = [...userCoeffs];
                            newC[coeffIdx] = Math.max(1, Number(e.target.value));
                            setUserCoeffs(newC);
                          }}
                          className="w-9 bg-indigo-950 text-indigo-300 border border-indigo-600 rounded text-center font-bold text-sm focus:outline-none"
                        />
                        <span className="text-amber-400">{p.formula}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 中間：完美解決邊界裁切的 CPK 色彩分子模型畫布 */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-around min-h-[230px]">
                {/* 反應物 CPK 模型 */}
                {rxn.reactants.map((r, idx) => (
                  <React.Fragment key={`r-mol-group-${idx}`}>
                    {idx > 0 && <span className="text-2xl font-bold text-slate-600">+</span>}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold">{r.name} ({userCoeffs[idx]} 個分子)</span>
                      <div className="flex flex-col gap-1.5 items-center max-h-[160px] overflow-y-auto p-1">
                        {Array.from({ length: userCoeffs[idx] }).map((_, i) => (
                          <MoleculeIcon key={`r-${idx}-mol-${i}`} formula={r.formula} />
                        ))}
                      </div>
                    </div>
                  </React.Fragment>
                ))}

                {/* 箭頭 → */}
                <span className="text-2xl font-bold text-purple-400">→</span>

                {/* 生成物 CPK 模型 */}
                {rxn.products.map((p, idx) => {
                  const coeffIdx = rxn.reactants.length + idx;
                  return (
                    <React.Fragment key={`p-mol-group-${idx}`}>
                      {idx > 0 && <span className="text-2xl font-bold text-slate-600">+</span>}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-amber-400 font-bold">{p.name} ({userCoeffs[coeffIdx]} 個分子)</span>
                        <div className="flex flex-col gap-1.5 items-center max-h-[160px] overflow-y-auto p-1">
                          {Array.from({ length: userCoeffs[coeffIdx] }).map((_, i) => (
                            <MoleculeIcon key={`p-${idx}-mol-${i}`} formula={p.formula} />
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. 計量化學與三段式網格模組 */}
      {activeSubTab === 'stoichiometry' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-emerald-300 block">1. 選擇反應式：</label>
              <select
                value={selectedRxnIndex}
                onChange={(e) => handleRxnChange(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
              >
                {REACTIONS.map((r, idx) => (
                  <option key={r.id} value={idx}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-300 block">2. 輸入數值單位：</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCalcMode('mol')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    calcMode === 'mol' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  莫耳數 (mol)
                </button>
                <button
                  onClick={() => setCalcMode('mass')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    calcMode === 'mass' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  質量 (g)
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-emerald-400 block truncate">
                  {rxn.reactants[0].name} ({calcMode === 'mol' ? 'mol' : 'g'})
                </label>
                <input
                  type="number" step="any" min="0"
                  value={inputVal1}
                  onChange={(e) => setInputVal1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-sm text-center text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              {rxn.reactants[1] && (
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-cyan-400 block truncate">
                    {rxn.reactants[1].name} ({calcMode === 'mol' ? 'mol' : 'g'})
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputVal2}
                    onChange={(e) => setInputVal2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-sm text-center text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 理化課三段式網格 */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 overflow-x-auto shadow-inner">
            <div className="min-w-[680px] font-mono text-center space-y-3">

              {/* 1. 化學反應式標頭 */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 text-base font-bold text-slate-200">
                <div className="w-24 text-left text-slate-400 font-sans text-xs">反應式</div>
                <div className="flex-1 flex items-center justify-center gap-2">
                  {rxn.reactants.map((r, idx) => (
                    <React.Fragment key={`r-head-${idx}`}>
                      {idx > 0 && <span className="text-slate-500">+</span>}
                      <span className="text-emerald-400">{r.coeff} {r.formula}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-purple-400 px-2">→</span>
                  {rxn.products.map((p, idx) => (
                    <React.Fragment key={`p-head-${idx}`}>
                      {idx > 0 && <span className="text-slate-500">+</span>}
                      <span className="text-amber-400">{p.coeff} {p.formula}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 2. 初狀態 */}
              <div className="flex items-center justify-between py-2 text-sm border-b border-slate-800/60">
                <div className="w-24 text-left font-bold text-amber-400 font-sans">初 (Initial)</div>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <div className="flex-1 bg-slate-950 py-1.5 px-2 rounded-lg border border-slate-800 font-bold text-white">
                    {gridData.initMol1.toFixed(2)} <span className="text-xs opacity-60">mol</span>
                    <span className="text-[10px] text-slate-400 block font-normal">({(gridData.initMol1 * rxn.reactants[0].mw).toFixed(1)}g)</span>
                  </div>
                  {rxn.reactants[1] ? (
                    <div className="flex-1 bg-slate-950 py-1.5 px-2 rounded-lg border border-slate-800 font-bold text-white">
                      {gridData.initMol2.toFixed(2)} <span className="text-xs opacity-60">mol</span>
                      <span className="text-[10px] text-slate-400 block font-normal">({(gridData.initMol2 * rxn.reactants[1].mw).toFixed(1)}g)</span>
                    </div>
                  ) : null}
                  <span className="text-slate-700 opacity-40 px-2">→</span>
                  {rxn.products.map((_, idx) => (
                    <div key={`p-init-${idx}`} className="flex-1 text-slate-600 opacity-40">—</div>
                  ))}
                </div>
              </div>

              {/* 3. 反應/消耗狀態 */}
              <div className="flex items-center justify-between py-2 text-sm border-b border-slate-800/60">
                <div className="w-24 text-left font-bold text-rose-400 font-sans">反應 (Change)</div>
                <div className="flex-1 flex items-center justify-center gap-3">
                  {rxn.reactants.map((r, idx) => (
                    <div key={`r-change-${idx}`} className="flex-1 bg-slate-950/80 py-1.5 px-2 rounded-lg border border-rose-900/50 font-bold text-rose-400">
                      - {gridData.changeMol_Reactants[idx].toFixed(2)} <span className="text-xs opacity-60">mol</span>
                      <span className="text-[10px] text-rose-300/70 block font-normal">(-{(gridData.changeMol_Reactants[idx] * r.mw).toFixed(1)}g)</span>
                    </div>
                  ))}
                  <span className="text-slate-700 opacity-40 px-2">→</span>
                  {rxn.products.map((p, idx) => (
                    <div key={`p-change-${idx}`} className="flex-1 bg-slate-950/80 py-1.5 px-2 rounded-lg border border-emerald-900/50 font-bold text-emerald-400">
                      + {gridData.changeMol_Products[idx].toFixed(2)} <span className="text-xs opacity-60">mol</span>
                      <span className="text-[10px] text-emerald-300/70 block font-normal">(+{(gridData.changeMol_Products[idx] * p.mw).toFixed(1)}g)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 末/剩餘狀態 */}
              <div className="flex items-center justify-between py-3 text-sm bg-slate-950/40 rounded-xl">
                <div className="w-24 text-left font-bold text-emerald-400 font-sans">末 (Final)</div>
                <div className="flex-1 flex items-center justify-center gap-3">
                  {rxn.reactants.map((r, idx) => {
                    const isLimiting = gridData.finalMol_Reactants[idx] === 0;
                    return (
                      <div key={`r-final-${idx}`} className={`flex-1 py-2 px-2 rounded-lg border font-bold ${
                        isLimiting ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-slate-950 border-slate-700 text-amber-300'
                      }`}>
                        {gridData.finalMol_Reactants[idx].toFixed(2)} <span className="text-xs opacity-60">mol</span>
                        <span className="text-[10px] block font-normal opacity-80">({(gridData.finalMol_Reactants[idx] * r.mw).toFixed(1)}g)</span>
                        {isLimiting && (
                          <span className="text-[9px] bg-rose-800 text-white px-1.5 py-0.5 rounded mt-0.5 inline-block font-sans">限量試劑耗盡</span>
                        )}
                      </div>
                    );
                  })}
                  <span className="text-slate-700 opacity-40 px-2">→</span>
                  {rxn.products.map((p, idx) => (
                    <div key={`p-final-${idx}`} className="flex-1 bg-emerald-950/50 py-2 px-2 rounded-lg border border-emerald-500 font-bold text-emerald-300">
                      {gridData.finalMol_Products[idx].toFixed(2)} <span className="text-xs opacity-60">mol</span>
                      <span className="text-[10px] text-emerald-200 block font-normal">({(gridData.finalMol_Products[idx] * p.mw).toFixed(1)}g)</span>
                      <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded mt-0.5 inline-block font-sans">產物生成</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 解題結論摘要 */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 解題結論摘要
              </span>
              <button
                onClick={() => setShowCalcSteps(!showCalcSteps)}
                className="text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-all"
              >
                <Calculator className="w-3 h-3" />
                {showCalcSteps ? '隱藏步驟' : '顯示計算步驟'}
                {showCalcSteps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">限量試劑：</span>
                <span className="text-rose-400 font-bold text-sm">
                  {rxn.reactants[gridData.limitingIndex] ? rxn.reactants[gridData.limitingIndex].name : '無'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">反應最大相當次數：</span>
                <span className="text-amber-300 font-bold font-mono text-sm">
                  {gridData.rxnTimes.toFixed(2)} 次
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-1">主要生成物 ({rxn.products[0].name})：</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {gridData.finalMol_Products[0].toFixed(2)} mol ({(gridData.finalMol_Products[0] * rxn.products[0].mw).toFixed(1)} g)
                </span>
              </div>
            </div>

            {showCalcSteps && (
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 font-mono text-[11px] space-y-1.5 text-slate-300">
                <div className="font-bold text-emerald-300 border-b border-slate-800 pb-1">
                  📐 莫耳數與限量試劑步驟
                </div>
                <p>1. 莫耳數換算 (莫耳數 = 質量 / 分子量)：</p>
                {rxn.reactants.map((r, i) => (
                  <p key={`step-m-${i}`} className="pl-3 text-emerald-300">• {r.name}: {(i === 0 ? gridData.initMol1 : gridData.initMol2).toFixed(2)} mol</p>
                ))}
                <p>2. 反應相當次數 (莫耳數 / 係數)：</p>
                {rxn.reactants.map((r, i) => {
                  const m = i === 0 ? gridData.initMol1 : gridData.initMol2;
                  return (
                    <p key={`step-t-${i}`} className="pl-3">• {r.name}: {m.toFixed(2)} / {r.coeff} = {(m / r.coeff).toFixed(2)} 次</p>
                  );
                })}
                <p className="text-amber-300 pl-3">⇒ 次數較少者先用完，判定為【限量試劑】</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}