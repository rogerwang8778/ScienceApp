import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Activity, Layers } from 'lucide-react';

export default function ElectroChemistryLab() {
  const [activeTab, setActiveTab] = useState('voltaic');
  const [isRunning, setIsRunning] = useState(true);
  const [animOffset, setAnimOffset] = useState(0);

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
  // 主題 1：伏打電池 State & Data (全面支援放電/充電)
  // ==========================================
  const [voltaicType, setVoltaicType] = useState('zn-cu'); // 'zn-cu' | 'cu-ag' | 'lead-acid'
  const [batteryMode, setBatteryMode] = useState('discharge'); // 'discharge' (放電) | 'charge' (充電)

  const rawVoltaicData = {
    'zn-cu': {
      discharge: {
        title: '鋅銅電池 (放電模式 Discharge)',
        negName: '鋅片 (Zn 負極)',
        posName: '銅片 (Cu 正極)',
        negSol: '硫酸鋅溶液 (ZnSO₄)',
        posSol: '硫酸銅溶液 (CuSO₄)',
        negColor: '#cbd5e1',
        posColor: '#b45309',
        negSolColor: 'rgba(226, 232, 240, 0.25)',
        posSolColor: 'rgba(6, 182, 212, 0.45)',
        negIon: 'Zn²⁺',
        posIon: 'Cu²⁺',
        electronDir: '鋅片 (負極) ➔ 銅片 (正極)',
        table: {
          negElectrode: '負極 (活性 Zn > Cu)',
          posElectrode: '正極 (活性 Cu < Zn)',
          oxRed: '鋅原子釋出電子：氧化反應',
          posOxRed: '銅離子得到電子：還原反應',
          negHalf: 'Zn → Zn²⁺ + 2e⁻',
          posHalf: 'Cu²⁺ + 2e⁻ → Cu',
          totalEq: 'Zn + Cu²⁺ → Zn²⁺ + Cu',
          negMass: '減輕 (鋅原子溶解成 Zn²⁺ 游離離開極棒)',
          posMass: '增加 (Cu²⁺ 游向銅片獲得電子析出 Cu)',
          negSolChange: '無色透明 (Zn²⁺ 離子濃度漸增)',
          posSolChange: '藍色變淡 (Cu²⁺ 離子濃度漸減)',
          saltBridge: '陽離子 (K⁺) 游向銅片杯，陰離子 (NO₃⁻) 游向鋅片杯維持電中性',
          outerCircuit: '電子由 鋅片(負極) 經檢流計流向 銅片(正極)',
          innerCircuit: '鹽橋與水溶液中離子定向游動導通迴路',
        },
      },
      charge: {
        title: '鋅銅電池 (充電模式 Charging - 反向電解)',
        negName: '鋅片 (接電源負極 陰極)',
        posName: '銅片 (接電源正極 陽極)',
        negSol: '硫酸鋅溶液 (ZnSO₄)',
        posSol: '硫酸銅溶液 (CuSO₄)',
        negColor: '#94a3b8',
        posColor: '#d97706',
        negSolColor: 'rgba(226, 232, 240, 0.35)',
        posSolColor: 'rgba(6, 182, 212, 0.3)',
        negIon: 'Zn²⁺',
        posIon: 'Cu²⁺',
        electronDir: '外接 DC 電源：銅片 (陽極) ➔ 鋅片 (陰極)',
        table: {
          negElectrode: '陰極 (連接 DC 電源負極)',
          posElectrode: '陽極 (連接 DC 電源正極)',
          oxRed: 'Zn²⁺ 得電子析出為 Zn：還原反應',
          posOxRed: 'Cu 原子溶解為 Cu²⁺：氧化反應',
          negHalf: 'Zn²⁺ + 2e⁻ → Zn',
          posHalf: 'Cu → Cu²⁺ + 2e⁻',
          totalEq: 'Zn²⁺ + Cu → Zn + Cu²⁺',
          negMass: '增加 (Zn²⁺ 游向極棒析出金屬鋅)',
          posMass: '減少 (銅片溶解成 Cu²⁺ 游離離開極棒)',
          negSolChange: 'Zn²⁺ 離子濃度漸減',
          posSolChange: '藍色變深 (Cu²⁺ 離子濃度漸增)',
          saltBridge: '陽離子 (K⁺) 游向鋅片杯，陰離子 (NO₃⁻) 游向銅片杯',
          outerCircuit: '外接直流電源強制將電子送回鋅片',
          innerCircuit: '鹽橋離子反向游動平衡電場',
        },
      },
    },
    'cu-ag': {
      discharge: {
        title: '銅銀電池 (放電模式 Discharge)',
        negName: '銅片 (Cu 負極)',
        posName: '銀片 (Ag 正極)',
        negSol: '硫酸銅溶液 (CuSO₄)',
        posSol: '硝酸銀溶液 (AgNO₃)',
        negColor: '#b45309',
        posColor: '#e2e8f0',
        negSolColor: 'rgba(6, 182, 212, 0.45)',
        posSolColor: 'rgba(241, 245, 249, 0.25)',
        negIon: 'Cu²⁺',
        posIon: 'Ag⁺',
        electronDir: '銅片 (負極) ➔ 銀片 (正極)',
        table: {
          negElectrode: '負極 (活性 Cu > Ag)',
          posElectrode: '正極 (活性 Ag < Cu)',
          oxRed: '銅原子釋出電子：氧化反應',
          posOxRed: '銀離子得到電子：還原反應',
          negHalf: 'Cu → Cu²⁺ + 2e⁻',
          posHalf: '2Ag⁺ + 2e⁻ → 2Ag',
          totalEq: 'Cu + 2Ag⁺ → Cu²⁺ + 2Ag',
          negMass: '減輕 (銅原子溶解成 Cu²⁺ 游離離開極棒)',
          posMass: '增加 (Ag⁺ 游向銀片析出銀白色銀金屬)',
          negSolChange: '藍色變深 (Cu²⁺ 離子濃度漸增)',
          posSolChange: '無色 (Ag⁺ 離子濃度漸減)',
          saltBridge: '陽離子 (K⁺) 游向銀片杯，陰離子 (NO₃⁻) 游向銅片杯',
          outerCircuit: '電子由 銅片(負極) 流向 銀片(正極)',
          innerCircuit: '離子在鹽橋與溶液中流動',
        },
      },
      charge: {
        title: '銅銀電池 (充電模式 Charging - 反向電解)',
        negName: '銅片 (接電源負極 陰極)',
        posName: '銀片 (接電源正極 陽極)',
        negSol: '硫酸銅溶液 (CuSO₄)',
        posSol: '硝酸銀溶液 (AgNO₃)',
        negColor: '#d97706',
        posColor: '#cbd5e1',
        negSolColor: 'rgba(6, 182, 212, 0.3)',
        posSolColor: 'rgba(241, 245, 249, 0.35)',
        negIon: 'Cu²⁺',
        posIon: 'Ag⁺',
        electronDir: '外接 DC 電源：銀片 (陽極) ➔ 銅片 (陰極)',
        table: {
          negElectrode: '陰極 (連接 DC 電源負極)',
          posElectrode: '陽極 (連接 DC 電源正極)',
          oxRed: 'Cu²⁺ 得電子析出為 Cu：還原反應',
          posOxRed: 'Ag 原子溶解為 Ag⁺：氧化反應',
          negHalf: 'Cu²⁺ + 2e⁻ → Cu',
          posHalf: '2Ag → 2Ag⁺ + 2e⁻',
          totalEq: 'Cu²⁺ + 2Ag → Cu + 2Ag⁺',
          negMass: '增加 (Cu²⁺ 游向極棒析出金屬銅)',
          posMass: '減少 (銀片溶解成 Ag⁺ 游離離開極棒)',
          negSolChange: '藍色變淡 (Cu²⁺ 離子濃度漸減)',
          posSolChange: 'Ag⁺ 離子濃度漸增',
          saltBridge: '陽離子 (K⁺) 游向銅片杯，陰離子 (NO₃⁻) 游向銀片杯',
          outerCircuit: '直流電源強制推動電子反向移動',
          innerCircuit: '鹽橋離子維持兩端電荷平衡',
        },
      },
    },
    'lead-acid': {
      discharge: {
        title: '鉛蓄電池 (放電模式 Discharge)',
        negName: '鉛板 (Pb 負極)',
        posName: '二氧化鉛板 (PbO₂ 正極)',
        negSol: '稀硫酸 (H₂SO₄)',
        posSol: '稀硫酸 (H₂SO₄)',
        negColor: '#64748b',
        posColor: '#78350f',
        negSolColor: 'rgba(56, 189, 248, 0.25)',
        posSolColor: 'rgba(56, 189, 248, 0.25)',
        negIon: 'SO₄²⁻',
        posIon: 'H⁺',
        electronDir: '鉛板 (Pb) ➔ 二氧化鉛板 (PbO₂)',
        table: {
          negElectrode: '負極 (鉛板 Pb)',
          posElectrode: '正極 (二氧化鉛板 PbO₂)',
          oxRed: '鉛失電子：氧化反應',
          posOxRed: '二氧化鉛得電子：還原反應',
          negHalf: 'Pb + SO₄²⁻ → PbSO₄ + 2e⁻',
          posHalf: 'PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻ → PbSO₄ + 2H₂O',
          totalEq: 'Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O',
          negMass: '增加 (生成白色 PbSO₄ 沉澱於極板)',
          posMass: '增加 (生成白色 PbSO₄ 沉澱於極板)',
          negSolChange: '硫酸被消耗且生成水，H₂SO₄ 濃度下降，比重變小',
          posSolChange: '硫酸被消耗且生成水，H₂SO₄ 濃度下降，比重變小',
          saltBridge: '無鹽橋，兩極同置於稀硫酸電解液中',
          outerCircuit: '電子由 負極 (Pb) 流向 正極 (PbO₂)',
          innerCircuit: 'H⁺ 游向正極、SO₄²⁻ 游向兩極參與反應',
        },
      },
      charge: {
        title: '鉛蓄電池 (充電模式 Charging - 電解反應)',
        negName: '鉛板 (接電源負極 陰極)',
        posName: '二氧化鉛板 (接電源正極 陽極)',
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

  const curVoltaic = rawVoltaicData[voltaicType][batteryMode];

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
            清晰標示外電路電子流向、全電池放電/充電模式與放大版水溶液/鹽橋離子定向游動軌跡
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
              <span className="text-xs text-slate-300 font-bold">1. 電池組合：</span>
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

              {/* 全伏打電池：放電/充電模式切換 */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-amber-700/60 ml-2">
                <span className="text-[11px] text-amber-300 font-bold px-1.5">運作模式：</span>
                <button
                  onClick={() => setBatteryMode('discharge')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    batteryMode === 'discharge' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ 放電 (自發反應)
                </button>
                <button
                  onClick={() => setBatteryMode('charge')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    batteryMode === 'charge' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔌 充電 (強迫電解)
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
                <Zap className="w-4 h-4" /> 動態視覺：放大離子與定向移動軌跡 (靠近極棒/遠離極棒)
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                電子流向：{curVoltaic.electronDir}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[320px] overflow-x-auto">
              <svg width="500" height="300" className="select-none font-mono text-[11px]">
                {/* 左燒杯 A */}
                <rect x="40" y="120" width="150" height="130" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="42" y="140" width="146" height="108" fill={curVoltaic.negSolColor} />
                <text x="115" y="265" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curVoltaic.negSol}</text>

                {/* 右燒杯 B */}
                <rect x="310" y="120" width="150" height="130" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="312" y="140" width="146" height="108" fill={curVoltaic.posSolColor} />
                <text x="385" y="265" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curVoltaic.posSol}</text>

                {/* 左極棒 */}
                <rect x="85" y="80" width="22" height="110" fill={curVoltaic.negColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="96" y="62" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">
                  {batteryMode === 'charge' ? '陰極 (-)' : '負極 (-)'}
                </text>
                <text x="96" y="75" textAnchor="middle" fill="#cbd5e1" fontSize="10">{curVoltaic.negName}</text>

                {/* 右極棒 */}
                <rect x="393" y="80" width="22" height="110" fill={curVoltaic.posColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="404" y="62" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                  {batteryMode === 'charge' ? '陽極 (+)' : '正極 (+)'}
                </text>
                <text x="404" y="75" textAnchor="middle" fill="#cbd5e1" fontSize="10">{curVoltaic.posName}</text>

                {/* 鹽橋 */}
                {voltaicType !== 'lead-acid' ? (
                  <g>
                    <path d="M 150 180 L 150 100 Q 150 80 170 80 L 330 80 Q 350 80 350 100 L 350 180" fill="none" stroke="#475569" strokeWidth="24" />
                    <path d="M 150 180 L 150 100 Q 150 80 170 80 L 330 80 Q 350 80 350 100 L 350 180" fill="none" stroke="#38bdf8" strokeWidth="14" opacity="0.65" />
                    <text x="250" y="72" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">鹽橋 (KNO₃)</text>

                    {/* 鹽橋大圖示離子 */}
                    {batteryMode === 'discharge' ? (
                      <>
                        <circle cx={170 + (animOffset * 1.6) % 160} cy="80" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={170 + (animOffset * 1.6) % 160} y="84" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">K⁺</text>

                        <circle cx={330 - (animOffset * 1.6) % 160} cy="80" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={330 - (animOffset * 1.6) % 160} y="84" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">NO₃⁻</text>
                      </>
                    ) : (
                      <>
                        <circle cx={330 - (animOffset * 1.6) % 160} cy="80" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={330 - (animOffset * 1.6) % 160} y="84" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">K⁺</text>

                        <circle cx={170 + (animOffset * 1.6) % 160} cy="80" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={170 + (animOffset * 1.6) % 160} y="84" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">NO₃⁻</text>
                      </>
                    )}
                  </g>
                ) : (
                  <g>
                    <line x1="190" y1="180" x2="310" y2="180" stroke="#38bdf8" strokeWidth="10" strokeDasharray="6 4" />
                    <text x="250" y="170" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">H₂SO₄ 電解質溶液</text>
                  </g>
                )}

                {/* 1 & 2. 水溶液中離子定向移動 (大幅放大 + 直線靠攏/遠離極棒軌跡) */}
                {isRunning && (
                  <g>
                    {batteryMode === 'discharge' ? (
                      <>
                        {/* 左杯：陽離子 (Zn2+/Cu2+) 從左極棒 (x=107) 向外溶解遠離 */}
                        <g>
                          <circle cx={107 + (animOffset % 55)} cy="160" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                          <text x={107 + (animOffset % 55)} y="164" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                            {curVoltaic.negIon}
                          </text>
                        </g>

                        {/* 右杯：陽離子 (Cu2+/Ag+) 從右杯深處朝右極棒 (x=393) 靠攏 */}
                        <g>
                          <circle cx={340 + (animOffset % 50)} cy="190" r="14" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
                          <text x={340 + (animOffset % 50)} y="194" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                            {curVoltaic.posIon}
                          </text>
                        </g>
                      </>
                    ) : (
                      <>
                        {/* 充電模式：左杯離子靠攏極棒析出 */}
                        <g>
                          <circle cx={165 - (animOffset % 55)} cy="160" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                          <text x={165 - (animOffset % 55)} y="164" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                            {curVoltaic.negIon}
                          </text>
                        </g>

                        {/* 充電模式：右杯極棒離子溶解離開 */}
                        <g>
                          <circle cx={393 - (animOffset % 50)} cy="190" r="14" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
                          <text x={393 - (animOffset % 50)} y="194" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                            {curVoltaic.posIon}
                          </text>
                        </g>
                      </>
                    )}
                  </g>
                )}

                {/* 外電路導線與儀表 */}
                <polyline points="96,80 96,25 250,25" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <polyline points="250,25 404,25 404,80" fill="none" stroke="#f59e0b" strokeWidth="3" />

                {/* 充電或放電儀表圖示 */}
                {batteryMode === 'charge' ? (
                  <g>
                    <rect x="220" y="8" width="60" height="34" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                    <text x="250" y="22" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">DC 電源</text>
                    <text x="250" y="34" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">充電模式</text>
                  </g>
                ) : (
                  <g>
                    <circle cx="250" cy="25" r="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                    <text x="250" y="29" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">G</text>
                    <line x1="250" y1="25" x2="260" y2="14" stroke="#ef4444" strokeWidth="2.5" />
                  </g>
                )}

                {/* 外電路動態電子 (e-) 粒子流向 */}
                {isRunning && [0, 1, 2, 3].map((i) => {
                  const totalDist = 430;
                  let pos = (animOffset * 4.3 + i * 107) % totalDist;
                  if (batteryMode === 'charge') pos = totalDist - pos; // 充電方向相反

                  let ex = 96, ey = 80;
                  if (pos <= 55) {
                    ex = 96; ey = 80 - pos;
                  } else if (pos <= 375) {
                    ex = 96 + (pos - 55); ey = 25;
                  } else {
                    ex = 404; ey = 25 + (pos - 375);
                  }

                  return (
                    <g key={`electron-${i}`}>
                      <circle cx={ex} cy={ey} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                      <text x={ex} y={ey + 3} textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">e⁻</text>
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
                      {batteryMode === 'charge' ? '陰極' : '負極'} ({curVoltaic.negName})
                    </th>
                    <th className="p-3 w-2/5 font-bold text-emerald-400">
                      {batteryMode === 'charge' ? '陽極' : '正極'} ({curVoltaic.posName})
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
                <Activity className="w-4 h-4" /> 動態視覺：離子向極棒靠攏/離開與電子定向傳導
              </span>
              <span className="text-slate-300 font-mono text-[11px]">
                {curElectro.gasRatio}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[300px] overflow-x-auto">
              <svg width="480" height="280" className="select-none font-mono text-[11px]">
                {/* 燒杯 */}
                <rect x="110" y="100" width="260" height="145" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <rect x="112" y="120" width="256" height="123" fill={curElectro.solColor} />
                <text x="240" y="260" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{curElectro.solutionName}</text>

                {/* 陽極棒 (+極) */}
                <rect x="160" y="70" width="20" height="115" fill={curElectro.anodeColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="170" y="55" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="bold">陽極 (+極)</text>
                <text x="170" y="202" textAnchor="middle" fill="#ef4444" fontSize="9">{curElectro.anodeGas}</text>

                {/* 陰極棒 (-極) */}
                <rect x="300" y="70" width="20" height="115" fill={curElectro.cathodeColor} stroke="#ffffff" strokeWidth="1.5" />
                <text x="310" y="55" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="bold">陰極 (-極)</text>
                <text x="310" y="202" textAnchor="middle" fill="#3b82f6" fontSize="9">{curElectro.cathodeGas}</text>

                {/* 氣泡動態 */}
                {isRunning && (
                  <g>
                    {(electrolyte === 'water' || (electrolyte === 'cuso4' && electrodeType === 'carbon')) && [0, 1, 2].map((i) => (
                      <circle
                        key={`anode-bubble-${i}`}
                        cx="170"
                        cy={160 - ((animOffset * 2 + i * 22) % 60)}
                        r={3.5 + i}
                        fill="#38bdf8"
                        opacity="0.8"
                      />
                    ))}

                    {electrolyte === 'water' && [0, 1, 2, 3, 4].map((i) => (
                      <circle
                        key={`cathode-bubble-${i}`}
                        cx="310"
                        cy={160 - ((animOffset * 2.5 + i * 16) % 60)}
                        r={3 + (i % 2)}
                        fill="#38bdf8"
                        opacity="0.85"
                      />
                    ))}
                  </g>
                )}

                {/* 水溶液中的離子游動標示 (放大版 + 朝極棒移動) */}
                {isRunning && (
                  <g>
                    {/* 陰離子游向陽極 (x=170) */}
                    <circle cx={225 - (animOffset % 45)} cy="150" r="13" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={225 - (animOffset % 45)} y="154" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      {curElectro.anodeIon}
                    </text>

                    {/* 陽離子游向陰極 (x=300) */}
                    <circle cx={245 + (animOffset % 45)} cy="175" r="13" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={245 + (animOffset % 45)} y="179" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      {curElectro.cathodeIon}
                    </text>
                  </g>
                )}

                {/* 直流電源 (DC Power) */}
                <rect x="212" y="10" width="56" height="30" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                <text x="240" y="28" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">DC 電源</text>

                {/* 外電路導線 */}
                <polyline points="170,70 170,25 212,25" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                <polyline points="268,25 310,25 310,70" fill="none" stroke="#3b82f6" strokeWidth="2.5" />

                {/* 外電路電子粒子傳導 */}
                {isRunning && [0, 1, 2].map((i) => {
                  const totalDist = 270;
                  const pos = (animOffset * 3.2 + i * 90) % totalDist;
                  let ex = 170, ey = 70;
                  if (pos <= 45) {
                    ex = 170; ey = 70 - pos;
                  } else if (pos <= 225) {
                    ex = 170 + (pos - 45) * (140 / 180); ey = 25;
                  } else {
                    ex = 310; ey = 25 + (pos - 225);
                  }
                  return (
                    <g key={`el-${i}`}>
                      <circle cx={ex} cy={ey} r="5.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                      <text x={ex} y={ey + 3} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold">e⁻</text>
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