import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Activity, Layers } from 'lucide-react';

export default function ElectroChemistryLab() {
  // 頁面切換: 'voltaic' (伏打電池) | 'electrolysis' (電解與電鍍)
  const [activeTab, setActiveTab] = useState('voltaic');
  const [isRunning, setIsRunning] = useState(true);
  const [animOffset, setAnimOffset] = useState(0);

  // 動態動畫計時器
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setAnimOffset((prev) => (prev + 1) % 100);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // ==========================================
  // 主題 1：伏打電池 State & Data
  // ==========================================
  const [voltaicType, setVoltaicType] = useState('zn-cu'); // 'zn-cu' | 'cu-ag' | 'lead-acid'

  const voltaicData = {
    'zn-cu': {
      title: '鋅銅電池 (Zn - Cu Battery)',
      negName: '鋅片 (Zn)',
      posName: '銅片 (Cu)',
      negSol: '硫酸鋅溶液 (ZnSO₄)',
      posSol: '硫酸銅溶液 (CuSO₄)',
      negColor: '#cbd5e1', // 鋅灰色
      posColor: '#b45309', // 銅棕色
      negSolColor: 'rgba(226, 232, 240, 0.2)', // 無色
      posSolColor: 'rgba(6, 182, 212, 0.4)', // 藍色
      electronDir: '鋅片 ➔ 銅片 (外電路)',
      table: {
        negElectrode: '負極 (提供電子，活性大)',
        posElectrode: '正極 (接收電子，活性小)',
        oxRed: '鋅釋出電子：氧化反應',
        posOxRed: '銅離子得到電子：還原反應',
        negHalf: 'Zn → Zn²⁺ + 2e⁻',
        posHalf: 'Cu²⁺ + 2e⁻ → Cu',
        totalEq: 'Zn + Cu²⁺ → Zn²⁺ + Cu',
        negMass: '減輕 (鋅原子溶解成 Zn²⁺)',
        posMass: '增加 (Cu²⁺ 析出為 Cu 沉積在銅片)',
        negSolChange: '無色透明 (Zn²⁺ 濃度漸增)',
        posSolChange: '藍色變淡 (Cu²⁺ 濃度漸減)',
        saltBridge: 'K⁺ 移向銅片杯，NO₃⁻ 移向鋅片杯以維持電中性',
        outerCircuit: '電子由 鋅片(負極) 經檢流計流向 銅片(正極)；電流方向相反',
        innerCircuit: '溶液與鹽橋中的離子移動形成導通迴路',
      },
    },
    'cu-ag': {
      title: '銅銀電池 (Cu - Ag Battery)',
      negName: '銅片 (Cu)',
      posName: '銀片 (Ag)',
      negSol: '硫酸銅溶液 (CuSO₄)',
      posSol: '硝酸銀溶液 (AgNO₃)',
      negColor: '#b45309', // 銅棕色
      posColor: '#e2e8f0', // 銀白色
      negSolColor: 'rgba(6, 182, 212, 0.4)', // 藍色
      posSolColor: 'rgba(241, 245, 249, 0.2)', // 無色
      electronDir: '銅片 ➔ 銀片 (外電路)',
      table: {
        negElectrode: '負極 (活性 Cu > Ag)',
        posElectrode: '正極 (活性 Ag < Cu)',
        oxRed: '銅釋出電子：氧化反應',
        posOxRed: '銀離子得到電子：還原反應',
        negHalf: 'Cu → Cu²⁺ + 2e⁻',
        posHalf: '2Ag⁺ + 2e⁻ → 2Ag',
        totalEq: 'Cu + 2Ag⁺ → Cu²⁺ + 2Ag',
        negMass: '減輕 (銅原子溶解成 Cu²⁺)',
        posMass: '增加 (Ag⁺ 析出銀白色銀金屬)',
        negSolChange: '藍色變深 (Cu²⁺ 濃度漸增)',
        posSolChange: '保持無色 (Ag⁺ 濃度漸減)',
        saltBridge: '陽離子游向銀片杯，陰離子游向銅片杯',
        outerCircuit: '電子由 銅片(負極) 流向 銀片(正極)',
        innerCircuit: '離子在鹽橋與溶液中游動',
      },
    },
    'lead-acid': {
      title: '鉛蓄電池放電 (Lead-Acid Battery Discharge)',
      negName: '鉛板 (Pb)',
      posName: '二氧化鉛板 (PbO₂)',
      negSol: '稀硫酸 (H₂SO₄)',
      posSol: '稀硫酸 (H₂SO₄)',
      negColor: '#64748b', // 鉛灰色
      posColor: '#78350f', // 棕褐色
      negSolColor: 'rgba(56, 189, 248, 0.25)',
      posSolColor: 'rgba(56, 189, 248, 0.25)',
      electronDir: '鉛板 (Pb) ➔ 二氧化鉛 (PbO₂)',
      table: {
        negElectrode: '負極 (鉛板 Pb)',
        posElectrode: '正極 (二氧化鉛板 PbO₂)',
        oxRed: '鉛釋出電子：氧化反應',
        posOxRed: '二氧化鉛接受電子：還原反應',
        negHalf: 'Pb + SO₄²⁻ → PbSO₄ + 2e⁻',
        posHalf: 'PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻ → PbSO₄ + 2H₂O',
        totalEq: 'Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O',
        negMass: '增加 (生成白色 PbSO₄ 沉澱於極板)',
        posMass: '增加 (生成白色 PbSO₄ 沉澱於極板)',
        negSolChange: '硫酸消耗，生成水，H₂SO₄ 濃度下降，比重變小',
        posSolChange: '硫酸消耗，生成水，H₂SO₄ 濃度下降，比重變小',
        saltBridge: '無鹽橋，兩極同在 H₂SO₄ 電解液中',
        outerCircuit: '電子由 負極 (Pb) 流向 正極 (PbO₂)',
        innerCircuit: 'H⁺ 與 SO₄²⁻ 離子參與電極反應',
      },
    },
  };

  const curVoltaic = voltaicData[voltaicType];

  // ==========================================
  // 主題 2：電解與電鍍 State & Data
  // ==========================================
  const [electrolyte, setElectrolyte] = useState('water'); // 'water' (水) | 'cuso4' (硫酸銅)
  const [electrodeType, setElectrodeType] = useState('carbon'); // 'carbon' (碳棒-碳棒) | 'copper' (銅棒-銅棒/電鍍)

  const electroKey = `${electrolyte}_${electrodeType}`;

  const electroData = {
    water_carbon: {
      title: '電解水 (碳棒-碳棒)',
      anodeName: '陽極 (+極) 碳棒',
      cathodeName: '陰極 (-極) 碳棒',
      anodeColor: '#334155',
      cathodeColor: '#334155',
      solutionName: '水 + 微量 NaOH (增強導電性)',
      solColor: 'rgba(56, 189, 248, 0.2)',
      anodeGas: '氧氣 (O₂)',
      cathodeGas: '氫氣 (H₂)',
      gasRatio: '陽極 O₂ : 陰極 H₂ 體積比 = 1 : 2',
      table: {
        anodeHalf: '2H₂O → O₂ + 4H⁺ + 4e⁻ (氧化)',
        cathodeHalf: '2H₂O + 2e⁻ → H₂ + 2OH⁻ (還原)',
        totalEq: '2H₂O → 2H₂ + O₂',
        anodeChange: '產生氧氣氣泡 (體積為陰極的 1/2)，極棒質量不變',
        cathodeChange: '產生氫氣氣泡 (體積為陽極的 2 倍)，極棒質量不變',
        solChange: '水減少，NaOH 濃度漸增，pH 值維持鹼性',
      },
    },
    cuso4_carbon: {
      title: '電解硫酸銅 (碳棒-碳棒)',
      anodeName: '陽極 (+極) 碳棒',
      cathodeName: '陰極 (-極) 碳棒',
      anodeColor: '#334155',
      cathodeColor: '#334155',
      solutionName: '硫酸銅溶液 (CuSO₄)',
      solColor: 'rgba(6, 182, 212, 0.4)',
      anodeGas: '氧氣 (O₂)',
      cathodeGas: '銅金屬 (Cu)',
      gasRatio: '陽極產生 O₂，陰極析出紅棕色 Cu',
      table: {
        anodeHalf: '2H₂O → O₂ + 4H⁺ + 4e⁻ (水分子氧化)',
        cathodeHalf: 'Cu²⁺ + 2e⁻ → Cu (銅離子還原)',
        totalEq: '2CuSO₄ + 2H₂O → 2Cu + O₂ + 2H₂SO₄',
        anodeChange: '產生氧氣氣泡，碳棒質量不變',
        cathodeChange: '附著紅棕色銅金屬，碳棒質量增加',
        solChange: 'Cu²⁺ 減少，H⁺ 增加，藍色漸淡，溶液漸呈酸性 (生成 H₂SO₄)',
      },
    },
    cuso4_copper: {
      title: '電解硫酸銅 / 電鍍銅 (銅棒-銅棒)',
      anodeName: '陽極 (+極) 銅棒 (欲鍍物/補充極)',
      cathodeName: '陰極 (-極) 銅棒 (被鍍物)',
      anodeColor: '#b45309',
      cathodeColor: '#b45309',
      solutionName: '硫酸銅溶液 (CuSO₄)',
      solColor: 'rgba(6, 182, 212, 0.4)',
      anodeGas: '銅溶解 (Cu²⁺)',
      cathodeGas: '銅析出 (Cu)',
      gasRatio: '陽極溶解銅質量 = 陰極析出銅質量',
      table: {
        anodeHalf: 'Cu → Cu²⁺ + 2e⁻ (銅原子氧化)',
        cathodeHalf: 'Cu²⁺ + 2e⁻ → Cu (銅離子還原)',
        totalEq: 'Cu (陽極) → Cu (陰極)',
        anodeChange: '銅棒逐漸溶解，質量減少',
        cathodeChange: '析出紅棕色銅，質量增加',
        solChange: 'Cu²⁺ 消耗速率等於生成速率，溶液藍色深度與濃度保持不變',
      },
    },
    water_copper: {
      title: '電解水 (銅棒-銅棒)',
      anodeName: '陽極 (+極) 銅棒',
      cathodeName: '陰極 (-極) 銅棒',
      anodeColor: '#b45309',
      cathodeColor: '#b45309',
      solutionName: '水 + 微量 NaOH',
      solColor: 'rgba(56, 189, 248, 0.2)',
      anodeGas: '銅溶解成 Cu²⁺',
      cathodeGas: '氫氣 (H₂)',
      gasRatio: '陽極銅溶解，陰極產生 H₂',
      table: {
        anodeHalf: 'Cu → Cu²⁺ + 2e⁻ (銅先於水氧化)',
        cathodeHalf: '2H₂O + 2e⁻ → H₂ + 2OH⁻',
        totalEq: 'Cu + 2H₂O → Cu²⁺ + H₂ + 2OH⁻',
        anodeChange: '銅棒溶解，質量減少',
        cathodeChange: '產生氫氣氣泡，極棒質量不變',
        solChange: '生成 Cu(OH)₂ 藍色沉澱，溶液漸呈藍色濁狀',
      },
    },
  };

  const curElectro = electroData[electroKey] || electroData['water_carbon'];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            理化實驗室：國三下 單元五《電化學與電解實驗室》
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            完整呈現伏打電池電子與離子流向，以及電解/電鍍反應過程與極棒/溶液質量變化
          </p>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`py-1.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
            isRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? '暫停動畫' : '播放動畫'}
        </button>
      </div>

      {/* 主題切換頁籤 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('voltaic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'voltaic' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-300" /> 1. 伏打電池 (Voltaic Cell)
        </button>
        <button
          onClick={() => setActiveTab('electrolysis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'electrolysis' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-300" /> 2. 電解與電鍍 (Electrolysis Lab)
        </button>
      </div>

      {/* ==========================================
          主題 1：伏打電池 (Voltaic Cell)
      ========================================== */}
      {activeTab === 'voltaic' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">選擇電池組合：</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setVoltaicType('zn-cu')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    voltaicType === 'zn-cu' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  鋅銅電池
                </button>
                <button
                  onClick={() => setVoltaicType('cu-ag')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    voltaicType === 'cu-ag' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  銅銀電池
                </button>
                <button
                  onClick={() => setVoltaicType('lead-acid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    voltaicType === 'lead-acid' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  鉛蓄電池 (放電)
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-amber-400 font-bold">
              {curVoltaic.title}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center space-y-3">
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-4 h-4" /> 伏打電池動態示意圖 (外電路電子流 + 鹽橋離子游動)
              </span>
              <span className="text-slate-400 font-mono">
                電子流向：{curVoltaic.electronDir}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[280px] overflow-x-auto">
              <svg width="460" height="250" className="select-none font-mono text-[10px]">
                {/* 燒杯 A */}
                <rect x="50" y="110" width="120" height="110" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="52" y="130" width="116" height="88" fill={curVoltaic.negSolColor} />
                <text x="110" y="235" textAnchor="middle" fill="#94a3b8" fontSize="9">{curVoltaic.negSol}</text>

                {/* 燒杯 B */}
                <rect x="290" y="110" width="120" height="110" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="292" y="130" width="116" height="88" fill={curVoltaic.posSolColor} />
                <text x="350" y="235" textAnchor="middle" fill="#94a3b8" fontSize="9">{curVoltaic.posSol}</text>

                {/* 左電極棒 (負極) */}
                <rect x="80" y="80" width="18" height="90" transform="rotate(-10 80 80)" fill={curVoltaic.negColor} stroke="#cbd5e1" strokeWidth="1" />
                <text x="75" y="70" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">負極 (-)</text>
                <text x="75" y="82" textAnchor="middle" fill="#cbd5e1" fontSize="9">{curVoltaic.negName}</text>

                {/* 右電極棒 (正極) */}
                <rect x="360" y="80" width="18" height="90" transform="rotate(10 360 80)" fill={curVoltaic.posColor} stroke="#cbd5e1" strokeWidth="1" />
                <text x="380" y="70" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">正極 (+)</text>
                <text x="380" y="82" textAnchor="middle" fill="#cbd5e1" fontSize="9">{curVoltaic.posName}</text>

                {/* 鹽橋 */}
                {voltaicType !== 'lead-acid' ? (
                  <g>
                    <path d="M 140 160 L 140 100 Q 140 80 160 80 L 300 80 Q 320 80 320 100 L 320 160" fill="none" stroke="#64748b" strokeWidth="16" />
                    <path d="M 140 160 L 140 100 Q 140 80 160 80 L 300 80 Q 320 80 320 100 L 320 160" fill="none" stroke="#38bdf8" strokeWidth="10" opacity="0.6" />
                    <text x="230" y="75" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">鹽橋 (KNO₃)</text>

                    <circle cx={160 + (animOffset * 1.4) % 140} cy="80" r="4" fill="#10b981" />
                    <text x={160 + (animOffset * 1.4) % 140} y={83} textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">K⁺</text>

                    <circle cx={300 - (animOffset * 1.4) % 140} cy="80" r="4" fill="#ef4444" />
                    <text x={300 - (animOffset * 1.4) % 140} y={83} textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold">NO₃⁻</text>
                  </g>
                ) : (
                  <g>
                    <line x1="170" y1="160" x2="290" y2="160" stroke="#38bdf8" strokeWidth="6" strokeDasharray="4 4" />
                    <text x="230" y="150" textAnchor="middle" fill="#38bdf8" fontSize="9">H₂SO₄ 電解液導通</text>
                  </g>
                )}

                {/* 外電路導線與檢流計 G */}
                <polyline points="80,75 80,25 230,25" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                <polyline points="230,25 380,25 380,75" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                <circle cx="230" cy="25" r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="230" y="28" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">G</text>
                <line x1="230" y1="25" x2="238" y2="16" stroke="#ef4444" strokeWidth="2" />

                {/* 電子流向 */}
                {isRunning && [0, 1, 2, 3].map((i) => {
                  const pos = (animOffset * 3 + i * 70) % 300;
                  let ex = 80, ey = 75;
                  if (pos < 50) {
                    ex = 80; ey = 75 - pos;
                  } else if (pos < 250) {
                    ex = 80 + (pos - 50); ey = 25;
                  } else {
                    ex = 280; ey = 25 + (pos - 250);
                  }
                  return (
                    <g key={`electron-${i}`}>
                      <circle cx={ex} cy={ey} r="4" fill="#f59e0b" />
                      <text x={ex} y={ey + 2} textAnchor="middle" fill="#0f172a" fontSize="6" fontWeight="bold">e⁻</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" /> {curVoltaic.title} 理化考點對照表
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-3 w-1/5 font-bold border-r border-slate-800">剖析項目</th>
                    <th className="p-3 w-2/5 font-bold text-rose-400 border-r border-slate-800">
                      負極 ({curVoltaic.negName})
                    </th>
                    <th className="p-3 w-2/5 font-bold text-emerald-400">
                      正極 ({curVoltaic.posName})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">電極特性</td>
                    <td className="p-3 border-r border-slate-800">{curVoltaic.table.negElectrode}</td>
                    <td className="p-3">{curVoltaic.table.posElectrode}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">氧化還原</td>
                    <td className="p-3 border-r border-slate-800">{curVoltaic.table.oxRed}</td>
                    <td className="p-3">{curVoltaic.table.posOxRed}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">半反應式</td>
                    <td className="p-3 font-mono text-cyan-300 border-r border-slate-800">{curVoltaic.table.negHalf}</td>
                    <td className="p-3 font-mono text-cyan-300">{curVoltaic.table.posHalf}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">總反應式</td>
                    <td colSpan="2" className="p-3 font-mono text-amber-300 font-bold bg-slate-950/40">
                      {curVoltaic.table.totalEq}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">質量變化</td>
                    <td className="p-3 border-r border-slate-800 text-rose-300">{curVoltaic.table.negMass}</td>
                    <td className="p-3 text-emerald-300">{curVoltaic.table.posMass}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">溶液變化</td>
                    <td className="p-3 border-r border-slate-800">{curVoltaic.table.negSolChange}</td>
                    <td className="p-3">{curVoltaic.table.posSolChange}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">鹽橋離子流向</td>
                    <td colSpan="2" className="p-3 text-slate-300 bg-slate-950/20">
                      {curVoltaic.table.saltBridge}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">外電路 (電子流)</td>
                    <td colSpan="2" className="p-3 text-slate-300 bg-slate-950/20">
                      {curVoltaic.table.outerCircuit}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">內電路 (迴路)</td>
                    <td colSpan="2" className="p-3 text-slate-300 bg-slate-950/20">
                      {curVoltaic.table.innerCircuit}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          主題 2：電解與電鍍 (Electrolysis Lab)
      ========================================== */}
      {activeTab === 'electrolysis' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">1. 電解液：</span>
                <select
                  value={electrolyte}
                  onChange={(e) => setElectrolyte(e.target.value)}
                  className="bg-slate-800 text-cyan-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="water">水 (+微量 NaOH)</option>
                  <option value="cuso4">硫酸銅溶液 (CuSO₄)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">2. 正負電極棒：</span>
                <select
                  value={electrodeType}
                  onChange={(e) => setElectrodeType(e.target.value)}
                  className="bg-slate-800 text-amber-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="carbon">碳棒 - 碳棒 (惰性電極)</option>
                  <option value="copper">銅棒 - 銅棒 (活性電極/電鍍)</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-mono text-cyan-400 font-bold">
              {curElectro.title}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center space-y-3">
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Activity className="w-4 h-4" /> 電解實驗動態圖 (直流電源驅動 + 電子強制由陽極向陰極移動)
              </span>
              <span className="text-slate-400 font-mono">
                {curElectro.gasRatio}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[280px] overflow-x-auto">
              <svg width="440" height="240" className="select-none font-mono text-[10px]">
                {/* 燒杯 */}
                <rect x="120" y="90" width="200" height="130" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="122" y="110" width="196" height="108" fill={curElectro.solColor} />
                <text x="220" y="230" textAnchor="middle" fill="#94a3b8" fontSize="9">{curElectro.solutionName}</text>

                {/* 陽極棒 (+極, 左) */}
                <rect x="160" y="70" width="16" height="100" fill={curElectro.anodeColor} stroke="#cbd5e1" strokeWidth="1" />
                <text x="168" y="58" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">陽極 (+極)</text>
                <text x="168" y="185" textAnchor="middle" fill="#ef4444" fontSize="8">{curElectro.anodeGas}</text>

                {/* 陰極棒 (-極, 右) */}
                <rect x="260" y="70" width="16" height="100" fill={curElectro.cathodeColor} stroke="#cbd5e1" strokeWidth="1" />
                <text x="268" y="58" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">陰極 (-極)</text>
                <text x="268" y="185" textAnchor="middle" fill="#3b82f6" fontSize="8">{curElectro.cathodeGas}</text>

                {/* 氣泡動態 */}
                {isRunning && (
                  <g>
                    {(electrolyte === 'water' || (electrolyte === 'cuso4' && electrodeType === 'carbon')) && [0, 1, 2].map((i) => (
                      <circle
                        key={`anode-bubble-${i}`}
                        cx="168"
                        cy={150 - ((animOffset * 2 + i * 25) % 60)}
                        r={3 + i}
                        fill="#38bdf8"
                        opacity="0.7"
                      />
                    ))}

                    {electrolyte === 'water' && [0, 1, 2, 3, 4].map((i) => (
                      <circle
                        key={`cathode-bubble-${i}`}
                        cx="268"
                        cy={150 - ((animOffset * 2.5 + i * 18) % 60)}
                        r={2.5 + (i % 2)}
                        fill="#38bdf8"
                        opacity="0.8"
                      />
                    ))}
                  </g>
                )}

                {/* 直流電源 (DC Power) */}
                <rect x="200" y="15" width="40" height="25" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="220" y="31" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">DC 電源</text>
                <text x="208" y="24" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">+</text>
                <text x="232" y="24" textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">-</text>

                {/* 外電路導線 */}
                <polyline points="168,70 168,27 200,27" fill="none" stroke="#ef4444" strokeWidth="2" />
                <polyline points="240,27 268,27 268,70" fill="none" stroke="#3b82f6" strokeWidth="2" />

                {/* 外電路電子粒子 */}
                {isRunning && [0, 1, 2].map((i) => {
                  const pos = (animOffset * 2.5 + i * 80) % 240;
                  let ex = 168, ey = 70;
                  if (pos < 43) {
                    ex = 168; ey = 70 - pos;
                  } else if (pos < 115) {
                    ex = 168 + (pos - 43); ey = 27;
                  } else if (pos < 187) {
                    ex = 240 + (pos - 115) * (28 / 72); ey = 27;
                  } else {
                    ex = 268; ey = 27 + (pos - 187);
                  }
                  return (
                    <circle key={`el-${i}`} cx={ex} cy={ey} r="3" fill="#f59e0b" />
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> {curElectro.title} 理化考點剖析表
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-3 w-1/5 font-bold border-r border-slate-800">剖析項目</th>
                    <th className="p-3 w-2/5 font-bold text-rose-400 border-r border-slate-800">
                      陽極 (+極) - 連接電源正極
                    </th>
                    <th className="p-3 w-2/5 font-bold text-blue-400">
                      陰極 (-極) - 連接電源負極
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-cyan-300 border-r border-slate-800">電極名稱與材質</td>
                    <td className="p-3 border-r border-slate-800">{curElectro.anodeName}</td>
                    <td className="p-3">{curElectro.cathodeName}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-cyan-300 border-r border-slate-800">電極反應 (半反應式)</td>
                    <td className="p-3 font-mono text-cyan-300 border-r border-slate-800">{curElectro.table.anodeHalf}</td>
                    <td className="p-3 font-mono text-cyan-300">{curElectro.table.cathodeHalf}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-cyan-300 border-r border-slate-800">總反應式</td>
                    <td colSpan="2" className="p-3 font-mono text-amber-300 font-bold bg-slate-950/40">
                      {curElectro.table.totalEq}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-cyan-300 border-r border-slate-800">極棒與產物變化</td>
                    <td className="p-3 border-r border-slate-800 text-rose-300">{curElectro.table.anodeChange}</td>
                    <td className="p-3 text-blue-300">{curElectro.table.cathodeChange}</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-cyan-300 border-r border-slate-800">電解液濃度/顏色變化</td>
                    <td colSpan="2" className="p-3 text-slate-300 bg-slate-950/20">
                      {curElectro.table.solChange}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}