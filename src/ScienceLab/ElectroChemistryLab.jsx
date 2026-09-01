import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Activity, Layers, RefreshCw } from 'lucide-react';

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
  const [batteryMode, setBatteryMode] = useState('discharge'); // 'discharge' (放電) | 'charge' (充電 - 限鉛蓄電池)

  const voltaicData = {
    'zn-cu': {
      title: '鋅銅電池 (Zn - Cu Battery)',
      negName: '鋅片 (Zn)',
      posName: '銅片 (Cu)',
      negSol: '硫酸鋅溶液 (ZnSO₄)',
      posSol: '硫酸銅溶液 (CuSO₄)',
      negColor: '#cbd5e1',
      posColor: '#b45309',
      negSolColor: 'rgba(226, 232, 240, 0.25)',
      posSolColor: 'rgba(6, 182, 212, 0.45)',
      negIon: 'Zn²⁺',
      posIon: 'Cu²⁺',
      electronDir: '鋅片 ➔ 銅片 (外電路)',
      table: {
        negElectrode: '負極 (提供電子，活性大)',
        posElectrode: '正極 (接收電子，活性小)',
        oxRed: '鋅釋出電子：氧化反應',
        posOxRed: '銅離子得到電子：還原反應',
        negHalf: 'Zn → Zn²⁺ + 2e⁻',
        posHalf: 'Cu²⁺ + 2e⁻ → Cu',
        totalEq: 'Zn + Cu²⁺ → Zn²⁺ + Cu',
        negMass: '減輕 (鋅原子溶解成 Zn²⁺ 游入溶液)',
        posMass: '增加 (Cu²⁺ 游向銅片獲得電子析出 Cu)',
        negSolChange: '無色透明 (Zn²⁺ 離子濃度漸增)',
        posSolChange: '藍色變淡 (Cu²⁺ 離子濃度漸減)',
        saltBridge: 'K⁺ 游向正極 (銅片杯)，NO₃⁻ 游向負極 (鋅片杯) 以維持電中性',
        outerCircuit: '電子由 鋅片(負極) 經檢流計流向 銅片(正極)；電流方向相反',
        innerCircuit: '溶液中離子與鹽橋離子游動維持閉合迴路',
      },
    },
    'cu-ag': {
      title: '銅銀電池 (Cu - Ag Battery)',
      negName: '銅片 (Cu)',
      posName: '銀片 (Ag)',
      negSol: '硫酸銅溶液 (CuSO₄)',
      posSol: '硝酸銀溶液 (AgNO₃)',
      negColor: '#b45309',
      posColor: '#e2e8f0',
      negSolColor: 'rgba(6, 182, 212, 0.45)',
      posSolColor: 'rgba(241, 245, 249, 0.25)',
      negIon: 'Cu²⁺',
      posIon: 'Ag⁺',
      electronDir: '銅片 ➔ 銀片 (外電路)',
      table: {
        negElectrode: '負極 (活性 Cu > Ag)',
        posElectrode: '正極 (活性 Ag < Cu)',
        oxRed: '銅釋出電子：氧化反應',
        posOxRed: '銀離子得到電子：還原反應',
        negHalf: 'Cu → Cu²⁺ + 2e⁻',
        posHalf: '2Ag⁺ + 2e⁻ → 2Ag',
        totalEq: 'Cu + 2Ag⁺ → Cu²⁺ + 2Ag',
        negMass: '減輕 (銅原子溶解成 Cu²⁺ 游入溶液)',
        posMass: '增加 (Ag⁺ 游向銀片析出銀白色金屬 Ag)',
        negSolChange: '藍色變深 (Cu²⁺ 離子濃度漸增)',
        posSolChange: '保持無色 (Ag⁺ 離子濃度漸減)',
        saltBridge: '陽離子 (K⁺) 游向銀片杯，陰離子 (NO₃⁻) 游向銅片杯',
        outerCircuit: '電子由 銅片(負極) 經外電路流向 銀片(正極)',
        innerCircuit: '離子在鹽橋與兩杯水溶液中自由游動',
      },
    },
    'lead-acid': {
      discharge: {
        title: '鉛蓄電池 (放電模式 Discharge)',
        negName: '鉛板 (Pb)',
        posName: '二氧化鉛板 (PbO₂)',
        negSol: '稀硫酸 (H₂SO₄)',
        posSol: '稀硫酸 (H₂SO₄)',
        negColor: '#64748b',
        posColor: '#78350f',
        negSolColor: 'rgba(56, 189, 248, 0.25)',
        posSolColor: 'rgba(56, 189, 248, 0.25)',
        negIon: 'SO₄²⁻',
        posIon: 'H⁺',
        electronDir: '鉛板 (Pb 負極) ➔ 二氧化鉛 (PbO₂ 正極)',
        table: {
          negElectrode: '負極 (鉛板 Pb)',
          posElectrode: '正極 (二氧化鉛板 PbO₂)',
          oxRed: '鉛失電子：氧化反應',
          posOxRed: '二氧化鉛得電子：還原反應',
          negHalf: 'Pb + SO₄²⁻ → PbSO₄ + 2e⁻',
          posHalf: 'PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻ → PbSO₄ + 2H₂O',
          totalEq: 'Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O',
          negMass: '增加 (生成白色 PbSO₄ 附著於極板)',
          posMass: '增加 (生成白色 PbSO₄ 附著於極板)',
          negSolChange: '硫酸被消耗且生成水，H₂SO₄ 濃度下降，比重變小',
          posSolChange: '硫酸被消耗且生成水，H₂SO₄ 濃度下降，比重變小',
          saltBridge: '無鹽橋，兩極同置於稀硫酸電解液中',
          outerCircuit: '電子由 負極 (Pb) 流向 正極 (PbO₂)',
          innerCircuit: 'H⁺ 游向正極、SO₄²⁻ 游向兩極參與化學反應',
        },
      },
      charge: {
        title: '鉛蓄電池 (充電模式 Charging - 電解反應)',
        negName: '陰極 (接電源負極 Pb)',
        posName: '陽極 (接電源正極 PbO₂)',
        negSol: '稀硫酸 (H₂SO₄)',
        posSol: '稀硫酸 (H₂SO₄)',
        negColor: '#475569',
        posColor: '#9a3412',
        negSolColor: 'rgba(56, 189, 248, 0.35)',
        posSolColor: 'rgba(56, 189, 248, 0.35)',
        negIon: 'H⁺',
        posIon: 'SO₄²⁻',
        electronDir: '外接 DC 電源：電源負極 ➔ 陰極 (Pb)',
        table: {
          negElectrode: '陰極 (連接 DC 電源負極)',
          posElectrode: '陽極 (連接 DC 電源正極)',
          oxRed: 'PbSO₄ 得電子還原為 Pb',
          posOxRed: 'PbSO₄ 失電子氧化為 PbO₂',
          negHalf: 'PbSO₄ + 2e⁻ → Pb + SO₄²⁻',
          posHalf: 'PbSO₄ + 2H₂O → PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻',
          totalEq: '2PbSO₄ + 2H₂O → Pb + PbO₂ + 2H₂SO₄',
          negMass: '減少 (白色 PbSO₄ 溶解還原為 Pb)',
          posMass: '減少 (白色 PbSO₄ 溶解氧化為 PbO₂)',
          negSolChange: '生成 H₂SO₄ 並消耗水，濃度上升，比重變大',
          posSolChange: '生成 H₂SO₄ 並消耗水，濃度上升，比重變大',
          saltBridge: '無鹽橋，由電解液進行離子傳輸',
          outerCircuit: '外接直流電源（正接正、負接負）強制電子逆向流動',
          innerCircuit: 'SO₄²⁻ 離子游離回溶液中，電解液密度恢復',
        },
      },
    },
  };

  const getCurVoltaicData = () => {
    if (voltaicType === 'lead-acid') {
      return voltaicData['lead-acid'][batteryMode];
    }
    return voltaicData[voltaicType];
  };

  const curVoltaic = getCurVoltaicData();

  // ==========================================
  // 主題 2：電解與電鍍 State & Data
  // ==========================================
  const [electrolyte, setElectrolyte] = useState('water');
  const [electrodeType, setElectrodeType] = useState('carbon');

  const electroKey = `${electrolyte}_${electrodeType}`;

  const electroData = {
    water_carbon: {
      title: '電解水 (碳棒-碳棒)',
      anodeName: '陽極 (+極) 碳棒',
      cathodeName: '陰極 (-極) 碳棒',
      anodeColor: '#334155',
      cathodeColor: '#334155',
      solutionName: '水 + 微量 NaOH (增強導電性)',
      solColor: 'rgba(56, 189, 248, 0.25)',
      anodeGas: '氧氣 (O₂)',
      cathodeGas: '氫氣 (H₂)',
      anodeIon: 'OH⁻',
      cathodeIon: 'H⁺',
      gasRatio: '陽極 O₂ : 陰極 H₂ 體積比 = 1 : 2',
      table: {
        anodeHalf: '2H₂O → O₂ + 4H⁺ + 4e⁻ (水分子氧化)',
        cathodeHalf: '2H₂O + 2e⁻ → H₂ + 2OH⁻ (水分子還原)',
        totalEq: '2H₂O → 2H₂ + O₂',
        anodeChange: '產生氧氣氣泡 (體積為陰極的 1/2)，碳棒質量不變',
        cathodeChange: '產生氫氣氣泡 (體積為陽極的 2 倍)，碳棒質量不變',
        solChange: '水分子被消耗，NaOH 濃度漸增，pH 值維持鹼性',
      },
    },
    cuso4_carbon: {
      title: '電解硫酸銅 (碳棒-碳棒)',
      anodeName: '陽極 (+極) 碳棒',
      cathodeName: '陰極 (-極) 碳棒',
      anodeColor: '#334155',
      cathodeColor: '#334155',
      solutionName: '硫酸銅溶液 (CuSO₄)',
      solColor: 'rgba(6, 182, 212, 0.45)',
      anodeGas: '氧氣 (O₂)',
      cathodeGas: '銅金屬 (Cu)',
      anodeIon: 'SO₄²⁻',
      cathodeIon: 'Cu²⁺',
      gasRatio: '陽極產生 O₂ 氣泡，陰極析出紅棕色 Cu',
      table: {
        anodeHalf: '2H₂O → O₂ + 4H⁺ + 4e⁻ (水分子氧化)',
        cathodeHalf: 'Cu²⁺ + 2e⁻ → Cu (銅離子還原)',
        totalEq: '2CuSO₄ + 2H₂O → 2Cu + O₂ + 2H₂SO₄',
        anodeChange: '產生氧氣氣泡，碳棒質量不變',
        cathodeChange: '附著紅棕色銅金屬，極棒質量增加',
        solChange: 'Cu²⁺ 減少、H⁺ 增加，藍色漸淡，溶液漸呈酸性 (生成 H₂SO₄)',
      },
    },
    cuso4_copper: {
      title: '電解硫酸銅 / 電鍍銅 (銅棒-銅棒)',
      anodeName: '陽極 (+極) 銅棒 (欲鍍物/補充極)',
      cathodeName: '陰極 (-極) 銅棒 (被鍍物)',
      anodeColor: '#b45309',
      cathodeColor: '#b45309',
      solutionName: '硫酸銅溶液 (CuSO₄)',
      solColor: 'rgba(6, 182, 212, 0.45)',
      anodeGas: '銅溶解成 Cu²⁺',
      cathodeGas: '銅析出成 Cu',
      anodeIon: 'SO₄²⁻',
      cathodeIon: 'Cu²⁺',
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
      solColor: 'rgba(56, 189, 248, 0.25)',
      anodeGas: '銅溶解成 Cu²⁺',
      cathodeGas: '氫氣 (H₂)',
      anodeIon: 'OH⁻',
      cathodeIon: 'H⁺',
      gasRatio: '陽極銅溶解，陰極產生 H₂ 氣泡',
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
            清晰標示外電路電子流向（精準抵達極棒）、鹽橋與水溶液中放大版陽/陰離子動態游動軌跡
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
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-bold">1. 選擇電池組合：</span>
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
                  鉛蓄電池
                </button>
              </div>

              {/* 鉛蓄電池專用：放電/充電切換 */}
              {voltaicType === 'lead-acid' && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-700/60 ml-2">
                  <span className="text-[11px] text-amber-300 font-bold px-1.5">模式：</span>
                  <button
                    onClick={() => setBatteryMode('discharge')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      batteryMode === 'discharge' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ 放電 (電池)
                  </button>
                  <button
                    onClick={() => setBatteryMode('charge')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      batteryMode === 'charge' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔌 充電 (電解)
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-amber-400 font-bold">
              {curVoltaic.title}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center space-y-3">
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-4 h-4" /> 動態圖示：電子精準移至極棒 + 鹽橋與溶液離子游動
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                電子流向：{curVoltaic.electronDir}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[310px] overflow-x-auto">
              <svg width="480" height="280" className="select-none font-mono text-[11px]">
                {/* 左燒杯 A */}
                <rect x="40" y="120" width="140" height="120" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="42" y="140" width="136" height="98" fill={curVoltaic.negSolColor} />
                <text x="110" y="252" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curVoltaic.negSol}</text>

                {/* 右燒杯 B */}
                <rect x="300" y="120" width="140" height="120" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="302" y="140" width="136" height="98" fill={curVoltaic.posSolColor} />
                <text x="370" y="252" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curVoltaic.posSol}</text>

                {/* 左極棒 (負極 / 陰極) */}
                <rect x="85" y="80" width="20" height="110" fill={curVoltaic.negColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="95" y="65" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
                  {voltaicType === 'lead-acid' && batteryMode === 'charge' ? '陰極 (-)' : '負極 (-)'}
                </text>
                <text x="95" y="77" textAnchor="middle" fill="#cbd5e1" fontSize="10">{curVoltaic.negName}</text>

                {/* 右極棒 (正極 / 陽極) */}
                <rect x="375" y="80" width="20" height="110" fill={curVoltaic.posColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="385" y="65" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                  {voltaicType === 'lead-acid' && batteryMode === 'charge' ? '陽極 (+)' : '正極 (+)'}
                </text>
                <text x="385" y="77" textAnchor="middle" fill="#cbd5e1" fontSize="10">{curVoltaic.posName}</text>

                {/* 鹽橋 (U型管) */}
                {voltaicType !== 'lead-acid' ? (
                  <g>
                    <path d="M 145 180 L 145 110 Q 145 90 165 90 L 315 90 Q 335 90 335 110 L 335 180" fill="none" stroke="#475569" strokeWidth="20" />
                    <path d="M 145 180 L 145 110 Q 145 90 165 90 L 315 90 Q 335 90 335 110 L 335 180" fill="none" stroke="#38bdf8" strokeWidth="12" opacity="0.6" />
                    <text x="240" y="83" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">鹽橋 (KNO₃ 膠體)</text>

                    {/* 鹽橋中離子 - 放大標示 */}
                    {/* K+ 陽離子向右 (正極) */}
                    <circle cx={165 + (animOffset * 1.4) % 150} cy="90" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                    <text x={165 + (animOffset * 1.4) % 150} y="93.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">K⁺</text>

                    {/* NO3- 陰離子向左 (負極) */}
                    <circle cx={315 - (animOffset * 1.4) % 150} cy="90" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                    <text x={315 - (animOffset * 1.4) % 150} y={93.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">NO₃⁻</text>
                  </g>
                ) : (
                  <g>
                    <line x1="180" y1="180" x2="300" y2="180" stroke="#38bdf8" strokeWidth="8" strokeDasharray="6 4" />
                    <text x="240" y="172" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">H₂SO₄ 電解質溶液傳導</text>
                  </g>
                )}

                {/* 3. 溶液中的自由離子游動標示 (放大版) */}
                {isRunning && (
                  <g>
                    {/* 左杯溶液陽離子解離/移動 */}
                    <circle cx="70" cy={200 - (animOffset % 40)} r="8" fill="#38bdf8" opacity="0.85" stroke="#ffffff" strokeWidth="1" />
                    <text x="70" y={203 - (animOffset % 40)} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {curVoltaic.negIon || 'Zn²⁺'}
                    </text>

                    <circle cx="125" cy={160 + (animOffset % 40)} r="8" fill="#38bdf8" opacity="0.85" stroke="#ffffff" strokeWidth="1" />
                    <text x="125" y={163 + (animOffset % 40)} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {curVoltaic.negIon || 'Zn²⁺'}
                    </text>

                    {/* 右杯溶液陽離子游向極棒析出 */}
                    <circle cx={330 + (animOffset % 40)} cy="180" r="8" fill="#a855f7" opacity="0.85" stroke="#ffffff" strokeWidth="1" />
                    <text x={330 + (animOffset % 40)} y="183" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {curVoltaic.posIon || 'Cu²⁺'}
                    </text>

                    <circle cx={410 - (animOffset % 40)} cy="210" r="8" fill="#a855f7" opacity="0.85" stroke="#ffffff" strokeWidth="1" />
                    <text x={410 - (animOffset % 40)} y={213} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      {curVoltaic.posIon || 'Cu²⁺'}
                    </text>
                  </g>
                )}

                {/* 外電路導線與儀表 (精準連至左極棒 (95,80) 與右極棒 (385,80)) */}
                <polyline points="95,80 95,25 240,25" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <polyline points="240,25 385,25 385,80" fill="none" stroke="#f59e0b" strokeWidth="3" />

                {/* 外接儀表/電源 */}
                {voltaicType === 'lead-acid' && batteryMode === 'charge' ? (
                  <g>
                    <rect x="215" y="10" width="50" height="30" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                    <text x="240" y="24" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">DC 電源</text>
                    <text x="240" y="34" textAnchor="middle" fill="#f59e0b" fontSize="8">充電中</text>
                  </g>
                ) : (
                  <g>
                    <circle cx="240" cy="25" r="15" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                    <text x="240" y="29" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">G</text>
                    <line x1="240" y1="25" x2="249" y2="15" stroke="#ef4444" strokeWidth="2.5" />
                  </g>
                )}

                {/* 1. 外電路動態電子 (e-) 粒子：精準落在極棒頂端 (95,80) 與 (385,80) 上 */}
                {isRunning && [0, 1, 2, 3].map((i) => {
                  let isReversed = (voltaicType === 'lead-acid' && batteryMode === 'charge');
                  // 放電：從 95,80 走到 385,80 (長度 55 + 290 + 55 = 400)
                  const totalDist = 400;
                  let pos = (animOffset * 4 + i * 100) % totalDist;
                  if (isReversed) pos = totalDist - pos; // 充電方向相反

                  let ex = 95, ey = 80;
                  if (pos <= 55) {
                    ex = 95; ey = 80 - pos; // 左極棒往上走至 (95,25)
                  } else if (pos <= 345) {
                    ex = 95 + (pos - 55); ey = 25; // 橫向過檢流計至 (385,25)
                  } else {
                    ex = 385; ey = 25 + (pos - 345); // 右導線向下直達右極棒 (385,80)
                  }

                  return (
                    <g key={`electron-${i}`}>
                      <circle cx={ex} cy={ey} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                      <text x={ex} y={ey + 2.5} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">e⁻</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 理化考點詳細剖析對照表 */}
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
                      {voltaicType === 'lead-acid' && batteryMode === 'charge' ? '陰極' : '負極'} ({curVoltaic.negName})
                    </th>
                    <th className="p-3 w-2/5 font-bold text-emerald-400">
                      {voltaicType === 'lead-acid' && batteryMode === 'charge' ? '陽極' : '正極'} ({curVoltaic.posName})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">電極屬性</td>
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
                    <td className="p-3 font-bold bg-slate-950/30 text-amber-300 border-r border-slate-800">鹽橋/離子傳輸</td>
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
                <Activity className="w-4 h-4" /> 動態圖示：電子由陽極直達陰極 + 溶液離子定向移動
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {curElectro.gasRatio}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[290px] overflow-x-auto">
              <svg width="460" height="260" className="select-none font-mono text-[11px]">
                {/* 燒杯 */}
                <rect x="110" y="100" width="240" height="135" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="112" y="120" width="236" height="113" fill={curElectro.solColor} />
                <text x="230" y="248" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curElectro.solutionName}</text>

                {/* 陽極棒 (+極, 左) */}
                <rect x="160" y="70" width="18" height="110" fill={curElectro.anodeColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="169" y="55" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">陽極 (+極)</text>
                <text x="169" y="198" textAnchor="middle" fill="#ef4444" fontSize="9">{curElectro.anodeGas}</text>

                {/* 陰極棒 (-極, 右) */}
                <rect x="280" y="70" width="18" height="110" fill={curElectro.cathodeColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="289" y="55" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">陰極 (-極)</text>
                <text x="289" y="198" textAnchor="middle" fill="#3b82f6" fontSize="9">{curElectro.cathodeGas}</text>

                {/* 氣泡動態 */}
                {isRunning && (
                  <g>
                    {(electrolyte === 'water' || (electrolyte === 'cuso4' && electrodeType === 'carbon')) && [0, 1, 2].map((i) => (
                      <circle
                        key={`anode-bubble-${i}`}
                        cx="169"
                        cy={160 - ((animOffset * 2 + i * 22) % 60)}
                        r={3.5 + i}
                        fill="#38bdf8"
                        opacity="0.8"
                      />
                    ))}

                    {electrolyte === 'water' && [0, 1, 2, 3, 4].map((i) => (
                      <circle
                        key={`cathode-bubble-${i}`}
                        cx="289"
                        cy={160 - ((animOffset * 2.5 + i * 16) % 60)}
                        r={3 + (i % 2)}
                        fill="#38bdf8"
                        opacity="0.85"
                      />
                    ))}
                  </g>
                )}

                {/* 3. 溶液中的離子游動標示 (放大版) */}
                {isRunning && (
                  <g>
                    {/* 陰離子游向陽極 (+極) */}
                    <circle cx={200 - (animOffset % 30)} cy="150" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                    <text x={200 - (animOffset % 30)} y="153" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                      {curElectro.anodeIon}
                    </text>

                    {/* 陽離子游向陰極 (-極) */}
                    <circle cx={250 + (animOffset % 30)} cy="170" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <text x={250 + (animOffset % 30)} y="173" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                      {curElectro.cathodeIon}
                    </text>
                  </g>
                )}

                {/* 直流電源 (DC Power) */}
                <rect x="205" y="12" width="50" height="28" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="230" y="29" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">DC 電源</text>

                {/* 外電路導線：精準接至 (169,70) 與 (289,70) */}
                <polyline points="169,70 169,26 205,26" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                <polyline points="255,26 289,26 289,70" fill="none" stroke="#3b82f6" strokeWidth="2.5" />

                {/* 1. 外電路電子粒子：精準由陽極 (169,70) 經電源抵達陰極 (289,70) */}
                {isRunning && [0, 1, 2].map((i) => {
                  const totalDist = 250;
                  const pos = (animOffset * 3 + i * 85) % totalDist;
                  let ex = 169, ey = 70;
                  if (pos <= 44) {
                    ex = 169; ey = 70 - pos; // 陽極棒向上至 (169,26)
                  } else if (pos <= 206) {
                    ex = 169 + (pos - 44) * (120 / 162); ey = 26; // 橫穿電源至 (289,26)
                  } else {
                    ex = 289; ey = 26 + (pos - 206); // 陰極棒向下直達 (289,70)
                  }
                  return (
                    <g key={`el-${i}`}>
                      <circle cx={ex} cy={ey} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                      <text x={ex} y={ey + 2.5} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">e⁻</text>
                    </g>
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