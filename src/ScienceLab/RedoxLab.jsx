import React, { useState } from 'react';
import { Flame, Zap, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

// 金屬活性順序資料庫 (已精確調整為指定順序：K, Na, Ca, Mg, Al, C, Zn, Cr, Fe, Sn, Pb, H, Cu, Hg, Ag, Pt, Au)
const METAL_ACTIVITY = [
  { symbol: 'K', name: '鉀', mw: 39.1 },
  { symbol: 'Na', name: '鈉', mw: 23.0 },
  { symbol: 'Ca', name: '鈣', mw: 40.1 },
  { symbol: 'Mg', name: '鎂', mw: 24.3 },
  { symbol: 'Al', name: '鋁', mw: 27.0 },
  { symbol: 'C', name: '碳', mw: 12.0, nonMetal: true },
  { symbol: 'Zn', name: '鋅', mw: 65.4 },
  { symbol: 'Cr', name: '鉻', mw: 52.0 },
  { symbol: 'Fe', name: '鐵', mw: 55.8 },
  { symbol: 'Sn', name: '錫', mw: 118.7 },
  { symbol: 'Pb', name: '鉛', mw: 207.2 },
  { symbol: 'H', name: '氫', mw: 1.0, nonMetal: true },
  { symbol: 'Cu', name: '銅', mw: 63.5 },
  { symbol: 'Hg', name: '汞', mw: 200.6 },
  { symbol: 'Ag', name: '銀', mw: 107.9 },
  { symbol: 'Pt', name: '鉑', mw: 195.1 },
  { symbol: 'Au', name: '金', mw: 197.0 }
];

// 高中 10 大經典氧化數平衡範例
const OXIDATION_EXAMPLES = [
  {
    id: 'clo3_i',
    name: '1. 氯酸根與碘離子反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'ClO₃⁻ + I⁻ → Cl⁻ + I₂',
    balanced: 'ClO₃⁻ + 6I⁻ + 6H⁺ → Cl⁻ + 3I₂ + 3H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Cl：在 ClO₃⁻ 中為 +5，生成物 Cl⁻ 中為 -1\n• I：在 I⁻ 中為 -1，生成物 I₂ 中為 0' },
      { num: '②', title: '寫出得失電子 (氧化數增減)', desc: '• Cl：+5 → -1 (減少 6)\n• I：-1 → 0 (增加 1，由於生成 I₂，每莫耳 I₂ 增加 2)' },
      { num: '③', title: '平衡參與氧化還原之原子數與電子', desc: '• 最小公倍數為 6\n• ClO₃⁻ 係數為 1，I⁻ 係數設為 6，生成 3 I₂ 與 1 Cl⁻' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：1(-1) + 6(-1) = -7\n• 右側電荷：1(-1) + 3(0) = -1' },
      { num: '⑤', title: '用 H⁺ 或 OH⁻ 平衡電荷數', desc: '• 酸性溶液使用 H⁺ 配平電荷\n• 左側加入 6 H⁺，使兩側總電荷均為 -1 (-7 + 6 = -1)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 左側有 6 個 H 與 3 個 O，右側加入 3 H₂O，完成平衡！' }
    ],
    leftCharge: '-7',
    rightCharge: '-1',
    addedCharge: '6 H⁺ (左側)',
    addedH2O: '3 H₂O (右側)'
  },
  {
    id: 'mno4_c2o4',
    name: '2. 過錳酸根與草酸根反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'MnO₄⁻ + C₂O₄²⁻ → Mn²⁺ + CO₂',
    balanced: '2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Mn：在 MnO₄⁻ 中為 +7，生成物為 +2\n• C：在 C₂O₄²⁻ 中為 +3，在 CO₂ 中為 +4' },
      { num: '②', title: '寫出得失電子', desc: '• Mn：+7 → +2 (減少 5)\n• C₂O₄²⁻ 中的 2 個 C：2 × (+3 → +4) (共增加 2)' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 最小公倍數為 10\n• 2 MnO₄⁻ 搭配 5 C₂O₄²⁻，生成 2 Mn²⁺ 與 10 CO₂' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：2(-1) + 5(-2) = -12\n• 右側電荷：2(+2) + 10(0) = +4' },
      { num: '⑤', title: '用 H⁺ 平衡電荷數', desc: '• 酸性環境使用 H⁺，左側加入 16 H⁺ (-12 + 16 = +4)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 左側 16 個 H，右側加入 8 H₂O 完成質量守恆！' }
    ],
    leftCharge: '-12',
    rightCharge: '+4',
    addedCharge: '16 H⁺ (左側)',
    addedH2O: '8 H₂O (右側)'
  },
  {
    id: 'cr2o7_fe',
    name: '3. 二鉻酸根與亞鐵離子反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'Cr₂O₇²⁻ + Fe²⁺ → Cr³⁺ + Fe³⁺',
    balanced: 'Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Cr：在 Cr₂O₇²⁻ 中為 +6，生成物 Cr³⁺ 為 +3\n• Fe：Fe²⁺ (+2) → Fe³⁺ (+3)' },
      { num: '②', title: '寫出得失電子', desc: '• Cr₂O₇²⁻ 中的 2 個 Cr：2 × (+6 → +3) (共減少 6)\n• Fe：+2 → +3 (增加 1)' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 最小公倍數為 6\n• 1 Cr₂O₇²⁻ 搭配 6 Fe²⁺，生成 2 Cr³⁺ 與 6 Fe³⁺' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：1(-2) + 6(+2) = +10\n• 右側電荷：2(+3) + 6(+3) = +24' },
      { num: '⑤', title: '用 H⁺ 平衡電荷數', desc: '• 左側加入 14 H⁺，兩側電荷均為 +24 (+10 + 14 = +24)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 左側有 14 個 H 與 7 個 O，右側加入 7 H₂O' }
    ],
    leftCharge: '+10',
    rightCharge: '+24',
    addedCharge: '14 H⁺ (左側)',
    addedH2O: '7 H₂O (右側)'
  },
  {
    id: 'al_no3_base',
    name: '4. 鋁金屬與硝酸根反應 (鹼性環境)',
    env: '鹼性',
    unbalanced: 'Al + NO₃⁻ → Al(OH)₄⁻ + NH₃',
    balanced: '8Al + 3NO₃⁻ + 5OH⁻ + 18H₂O → 8Al(OH)₄⁻ + 3NH₃',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Al：0 → +3 (在 Al(OH)₄⁻ 中)\n• N：在 NO₃⁻ 中為 +5，在 NH₃ 中為 -3' },
      { num: '②', title: '寫出得失電子', desc: '• Al：0 → +3 (增加 3)\n• N：+5 → -3 (減少 8)' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 最小公倍數為 24\n• 8 Al 搭配 3 NO₃⁻，生成 8 Al(OH)₄⁻ 與 3 NH₃' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：3(-1) = -3\n• 右側電荷：8(-1) = -8' },
      { num: '⑤', title: '用 OH⁻ 平衡電荷數', desc: '• 鹼性環境使用 OH⁻，左側加入 5 OH⁻ (-3 + -5 = -8)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 補齊兩側 H、O 質量守恆，左側補加入 18 H₂O' }
    ],
    leftCharge: '-3',
    rightCharge: '-8',
    addedCharge: '5 OH⁻ (左側)',
    addedH2O: '18 H₂O (左側)'
  },
  {
    id: 'cl2_disproportion',
    name: '5. 氯氣自我自身氧化還原/歧化反應 (鹼性環境)',
    env: '鹼性',
    unbalanced: 'Cl₂ → Cl⁻ + ClO₃⁻',
    balanced: '3Cl₂ + 6OH⁻ → 5Cl⁻ + ClO₃⁻ + 3H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Cl₂ (0) 自身同時氧化為 ClO₃⁻ (+5) 與還原為 Cl⁻ (-1)' },
      { num: '②', title: '寫出得失電子', desc: '• 氧化部分：Cl (0 → +5) 增加 5\n• 還原部分：Cl (0 → -1) 減少 1' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 電子得失比為 1 : 5，故產生 5 Cl⁻ 與 1 ClO₃⁻\n• 共需 6 個 Cl 原子，即 3 個 Cl₂ 分子' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：0\n• 右側電荷：5(-1) + 1(-1) = -6' },
      { num: '⑤', title: '用 OH⁻ 平衡電荷數', desc: '• 鹼性環境使用 OH⁻，左側加入 6 OH⁻' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 左側 6 H 與 6 O，右側補加入 3 H₂O' }
    ],
    leftCharge: '0',
    rightCharge: '-6',
    addedCharge: '6 OH⁻ (左側)',
    addedH2O: '3 H₂O (右側)'
  },
  {
    id: 'cu_dilute_hno3',
    name: '6. 銅與稀硝酸反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'Cu + HNO₃ → Cu(NO₃)₂ + NO + H₂O',
    balanced: '3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Cu：0 → +2\n• N (在 NO 中)：+5 → +2' },
      { num: '②', title: '寫出得失電子', desc: '• Cu：增加 2\n• N：減少 3' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 最小公倍數為 6\n• 3 Cu 搭配 2 NO 生成物' },
      { num: '④', title: '算出左右總電荷數', desc: '• 分子式反應式電荷已平衡 (均為 0)' },
      { num: '⑤', title: '補充未改變氧化數的酸根', desc: '• 產物 3 Cu(NO₃)₂ 需 6 個 NO₃⁻，總共需要 8 HNO₃' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 配平 8 個 H 生成 4 H₂O' }
    ],
    leftCharge: '0',
    rightCharge: '0',
    addedCharge: '無 (分子式)',
    addedH2O: '4 H₂O (右側)'
  },
  {
    id: 'cu_conc_hno3',
    name: '7. 銅與濃硝酸反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'Cu + HNO₃ → Cu(NO₃)₂ + NO₂ + H₂O',
    balanced: 'Cu + 4HNO₃ → Cu(NO₃)₂ + 2NO₂ + 2H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Cu：0 → +2\n• N (在 NO₂ 中)：+5 → +4' },
      { num: '②', title: '寫出得失電子', desc: '• Cu：增加 2\n• N：減少 1' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 最小公倍數為 2\n• 1 Cu 搭配 2 NO₂ 生成物' },
      { num: '④', title: '補充未改變氧化數的酸根', desc: '• 產物需 2 個 NO₃⁻，總共需要 4 HNO₃' },
      { num: '⑤', title: '用 H₂O 平衡 O、H 原子數', desc: '• 配平 4 個 H 生成 2 H₂O' }
    ],
    leftCharge: '0',
    rightCharge: '0',
    addedCharge: '無 (分子式)',
    addedH2O: '2 H₂O (右側)'
  },
  {
    id: 'mno4_fe',
    name: '8. 過錳酸根與亞鐵離子反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺',
    balanced: 'MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Mn：+7 → +2 (減少 5)\n• Fe：+2 → +3 (增加 1)' },
      { num: '②', title: '寫出得失電子', desc: '• 得失電子最小公倍數為 5' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 1 MnO₄⁻ 搭配 5 Fe²⁺，生成 1 Mn²⁺ 與 5 Fe³⁺' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側：1(-1) + 5(+2) = +9\n• 右側：1(+2) + 5(+3) = +17' },
      { num: '⑤', title: '用 H⁺ 平衡電荷數', desc: '• 左側加入 8 H⁺ (+9 + 8 = +17)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 右側加入 4 H₂O 完成配平' }
    ],
    leftCharge: '+9',
    rightCharge: '+17',
    addedCharge: '8 H⁺ (左側)',
    addedH2O: '4 H₂O (右側)'
  },
  {
    id: 'mno4_dispro_acid',
    name: '9. 錳酸根歧化反應 (酸性環境)',
    env: '酸性',
    unbalanced: 'MnO₄²⁻ → MnO₄⁻ + MnO₂',
    balanced: '3MnO₄²⁻ + 4H⁺ → 2MnO₄⁻ + MnO₂ + 2H₂O',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• MnO₄²⁻ (+6) 同時歧化為 MnO₄⁻ (+7) 與 MnO₂ (+4)' },
      { num: '②', title: '寫出得失電子', desc: '• 氧化：+6 → +7 (增加 1)\n• 還原：+6 → +4 (減少 2)' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 產生 2 MnO₄⁻ 與 1 MnO₂，共需 3 MnO₄²⁻' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：3(-2) = -6\n• 右側電荷：2(-1) = -2' },
      { num: '⑤', title: '用 H⁺ 平衡電荷數', desc: '• 酸性環境左側加入 4 H⁺ (-6 + 4 = -2)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 右側補加入 2 H₂O 完成配平' }
    ],
    leftCharge: '-6',
    rightCharge: '-2',
    addedCharge: '4 H⁺ (左側)',
    addedH2O: '2 H₂O (右側)'
  },
  {
    id: 'zn_mno4_base',
    name: '10. 鋅與過錳酸根反應 (鹼性環境)',
    env: '鹼性',
    unbalanced: 'Zn + MnO₄⁻ → Zn²⁺ + MnO₂',
    balanced: '3Zn + 2MnO₄⁻ + 4H₂O → 3Zn²⁺ + 2MnO₂ + 8OH⁻',
    steps: [
      { num: '①', title: '標出氧化數', desc: '• Zn：0 → +2 (增加 2)\n• Mn：+7 → +4 (減少 3)' },
      { num: '②', title: '寫出得失電子', desc: '• 最小公倍數為 6' },
      { num: '③', title: '平衡參與反應之原子數', desc: '• 3 Zn 搭配 2 MnO₄⁻，生成 3 Zn²⁺ 與 2 MnO₂' },
      { num: '④', title: '算出左右總電荷數', desc: '• 左側電荷：2(-1) = -2\n• 右側電荷：3(+2) = +6' },
      { num: '⑤', title: '用 OH⁻ 平衡電荷數', desc: '• 鹼性環境右側加入 8 OH⁻ (+6 - 8 = -2)' },
      { num: '⑥', title: '用 H₂O 平衡 O、H 原子數', desc: '• 左側加入 4 H₂O 完成平衡' }
    ],
    leftCharge: '-2',
    rightCharge: '+6',
    addedCharge: '8 OH⁻ (右側)',
    addedH2O: '4 H₂O (左側)'
  }
];

export default function RedoxLab() {
  const [activeTab, setActiveTab] = useState('activity');

  // 模組 1 State：金屬活性比較
  const [elementA, setElementA] = useState('Mg');
  const [elementB, setElementB] = useState('Cu');

  // 模組 2 State：氧化數平衡
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  const idxA = METAL_ACTIVITY.findIndex(m => m.symbol === elementA);
  const idxB = METAL_ACTIVITY.findIndex(m => m.symbol === elementB);

  const isAReactiveMore = idxA < idxB;
  const isSameElement = elementA === elementB;

  const currentOxExample = OXIDATION_EXAMPLES[selectedExampleIndex];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          理化實驗室：國二下 單元二《氧化還原與金屬活性》
        </h2>
        <p className="text-xs text-slate-400 mt-1">分析元素與氧化物之對氧親和力（活性）競爭，並銜接高中氧化數得失平衡法</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'activity' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" /> 1. 活性比大小與氧化還原判定
        </button>
        <button
          onClick={() => setActiveTab('oxidation')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'oxidation' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-300" /> 2. 氧化數法平衡反應式 (高中 10 大範例)
        </button>
      </div>

      {/* 1. 活性比大小與氧化還原判定模組 */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-amber-300 block">1. 選擇投入的單質元素 (A)：</label>
              <select
                value={elementA}
                onChange={(e) => setElementA(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                {METAL_ACTIVITY.map((m) => (
                  <option key={`a-${m.symbol}`} value={m.symbol}>
                    {m.name} ({m.symbol}) — 活性排名 #{METAL_ACTIVITY.findIndex(x => x.symbol === m.symbol) + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 text-center text-slate-500 font-bold text-lg hidden md:block">+</div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-cyan-300 block">2. 選擇金屬氧化物 (BO)：</label>
              <select
                value={elementB}
                onChange={(e) => setElementB(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
              >
                {METAL_ACTIVITY.map((m) => (
                  <option key={`b-${m.symbol}`} value={m.symbol}>
                    氧化{m.name} ({m.symbol}O) — 活性排名 #{METAL_ACTIVITY.findIndex(x => x.symbol === m.symbol) + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 block">📜 國高中常見元素活性順序比較：</span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {METAL_ACTIVITY.map((m, idx) => {
                const isA = m.symbol === elementA;
                const isB = m.symbol === elementB;
                return (
                  <span
                    key={`seq-${m.symbol}`}
                    className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                      isA && isB ? 'bg-purple-900 border-purple-400 text-purple-200 font-bold scale-105' :
                      isA ? 'bg-amber-600 border-amber-400 text-white font-bold scale-105' :
                      isB ? 'bg-cyan-600 border-cyan-400 text-white font-bold scale-105' :
                      'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}. {m.symbol}
                    {isA && <span className="text-[9px] bg-amber-800 px-1 rounded">A</span>}
                    {isB && <span className="text-[9px] bg-cyan-800 px-1 rounded">BO</span>}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                實驗預測：{elementA} + {elementB}O → ?
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSameElement ? 'bg-slate-700 text-slate-300' :
                isAReactiveMore ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'
              }`}>
                {isSameElement ? '同元素不反應' : isAReactiveMore ? '✅ 發生氧化還原反應 (活性：A > B)' : '❌ 不發生反應 (活性：A < B)'}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono text-base md:text-lg font-bold">
              {isSameElement ? (
                <span className="text-slate-500">{elementA} + {elementB}O → 無反應</span>
              ) : isAReactiveMore ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-amber-400">{elementA}</span>
                  <span className="text-slate-500">+</span>
                  <span className="text-cyan-400">{elementB}O</span>
                  <span className="text-emerald-400">→</span>
                  <span className="text-emerald-300">{elementA}O</span>
                  <span className="text-slate-500">+</span>
                  <span className="text-rose-400">{elementB}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-amber-400">{elementA}</span>
                  <span className="text-slate-500">+</span>
                  <span className="text-cyan-400">{elementB}O</span>
                  <span className="text-rose-400">↛ (不反應)</span>
                </div>
              )}
            </div>

            {isAReactiveMore && !isSameElement && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>🔥 氧化反應 (Oxidation)</span>
                    <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800">搶奪氧原子</span>
                  </div>
                  <p className="text-slate-300">• 物質：<strong className="text-amber-400">{elementA}</strong> 結合氧生成 {elementA}O</p>
                  <p className="text-slate-300">• 角色：作為 <strong className="text-amber-400">還原劑 (Reducing Agent)</strong></p>
                  <p className="text-slate-300">• 電子得失：<strong className="text-rose-400">失去電子 (Lost e⁻)</strong></p>
                  <p className="text-slate-300">• 氧化數變化：<strong className="text-emerald-400">0 增加至 +2</strong></p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>❄️ 還原反應 (Reduction)</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">失去氧原子</span>
                  </div>
                  <p className="text-slate-300">• 物質：<strong className="text-cyan-400">{elementB}O</strong> 失去氧還原為 {elementB}</p>
                  <p className="text-slate-300">• 角色：作為 <strong className="text-cyan-400">氧化劑 (Oxidizing Agent)</strong></p>
                  <p className="text-slate-300">• 電子得失：<strong className="text-emerald-400">得到電子 (Gained e⁻)</strong></p>
                  <p className="text-slate-300">• 氧化數變化：<strong className="text-rose-400">+2 減少至 0</strong></p>
                </div>
              </div>
            )}

            {!isAReactiveMore && !isSameElement && (
              <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/50 text-xs text-rose-300 space-y-1">
                <p className="font-bold">💡 為什麼不發生反應？</p>
                <p>因為單質金屬 <strong>{elementA}</strong> 的活性小於 <strong>{elementB}</strong>，對氧的親和力不足以將氧原子從 {elementB}O 中搶奪過來，故反應無法自發進行。</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 氧化數法平衡反應式模組 */}
      {activeTab === 'oxidation' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
            <label className="text-xs font-bold text-indigo-300 block">選擇高中經典氧化數平衡範例 (共 10 個範例)：</label>
            <select
              value={selectedExampleIndex}
              onChange={(e) => setSelectedExampleIndex(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-medium"
            >
              {OXIDATION_EXAMPLES.map((ex, idx) => (
                <option key={ex.id} value={idx}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-400">待平衡化學反應式：</span>
              <span className={`px-2.5 py-0.5 rounded-full ${
                currentOxExample.env === '酸性' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                環境：{currentOxExample.env}溶液
              </span>
            </div>
            <div className="text-center font-mono text-lg md:text-xl font-bold text-indigo-300 bg-slate-950 py-3 rounded-xl border border-slate-800">
              {currentOxExample.unbalanced}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              解題步驟順序展開拆解 (依氧化數平衡標準 6 步驟)
            </h3>

            <div className="space-y-4">
              {currentOxExample.steps.map((st, i) => (
                <div key={`step-${i}`} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-300 border-b border-slate-800/80 pb-1.5">
                    <span className="text-indigo-400 font-mono text-sm">{st.num}</span>
                    <span>{st.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono pl-4 border-l-2 border-indigo-500/40">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                <span className="text-slate-400 font-bold font-sans block mb-1">⚖️ 電荷與配平對照表：</span>
                <p className="text-amber-300">• 左側初電荷：{currentOxExample.leftCharge}</p>
                <p className="text-amber-300">• 右側初電荷：{currentOxExample.rightCharge}</p>
                <p className="text-cyan-300">• 加入電荷平衡試劑：{currentOxExample.addedCharge}</p>
                <p className="text-cyan-300">• 加入水平衡質量：{currentOxExample.addedH2O}</p>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-500/60 p-4 rounded-xl text-xs space-y-2 flex flex-col justify-center text-center">
                <span className="font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 🎉 完全配平化學反應式結論
                </span>
                <div className="text-sm md:text-base font-bold font-mono text-emerald-300 bg-slate-950/80 py-2 rounded-lg border border-emerald-800/60">
                  {currentOxExample.balanced}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}