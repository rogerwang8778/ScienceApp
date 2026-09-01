import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Pause, Flame, Scale, Activity, Thermometer, Droplets, Gauge, Maximize2 } from 'lucide-react';

export default function ChemicalEquilibriumLab() {
  const [activeTab, setActiveTab] = useState('dynamic'); // 'dynamic' | 'le_chatelier'

  // ==========================================
  // 1. 動態平衡模擬模組 State
  // ==========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [initA, setInitA] = useState(2.0);
  const [initB, setInitB] = useState(2.0);
  const [initC, setInitC] = useState(0.0);
  const [initD, setInitD] = useState(0.0);

  const [chartTab, setChartTab] = useState('rate');

  const KF = 0.10;
  const KR = 0.05;

  const [history, setHistory] = useState([
    { t: 0, a: 2.0, b: 2.0, c: 0.0, d: 0.0, rf: 0.40, rr: 0.0 }
  ]);

  const [particles, setParticles] = useState([]);

  // 粒子百分比座標生成與均勻分配算法
  const syncParticlesWithConc = (a, b, c, d, existingParticles = []) => {
    const targetA = Math.round(a * 8);
    const targetB = Math.round(b * 8);
    const targetC = Math.round(c * 8);
    const targetD = Math.round(d * 8);

    const counts = { A: targetA, B: targetB, C: targetC, D: targetD };
    const currentCounts = { A: 0, B: 0, C: 0, D: 0 };
    
    existingParticles.forEach(p => {
      if (currentCounts[p.type] !== undefined) {
        currentCounts[p.type]++;
      }
    });

    const newParticles = [];

    existingParticles.forEach(p => {
      if (newParticles.filter(np => np.type === p.type).length < counts[p.type]) {
        newParticles.push(p);
      }
    });

    Object.keys(counts).forEach(type => {
      const current = newParticles.filter(p => p.type === type).length;
      const needed = counts[type] - current;

      for (let i = 0; i < needed; i++) {
        newParticles.push({
          id: `${type}-${Date.now()}-${Math.random()}`,
          type,
          x: 5 + Math.random() * 90,
          y: 12 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2
        });
      }
    });

    setParticles(newParticles);
  };

  const handleResetDynamic = () => {
    setIsPlaying(false);
    const initialHist = {
      t: 0,
      a: initA,
      b: initB,
      c: initC,
      d: initD,
      rf: KF * initA * initB,
      rr: KR * initC * initD
    };
    setHistory([initialHist]);
    syncParticlesWithConc(initA, initB, initC, initD, []);
  };

  useEffect(() => {
    handleResetDynamic();
  }, [initA, initB, initC, initD]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.t >= 80) {
            setIsPlaying(false);
            return prev;
          }

          const dt = 0.2;
          const currentRf = KF * last.a * last.b;
          const currentRr = KR * last.c * last.d;
          const netRate = currentRf - currentRr;

          const newA = Math.max(0, last.a - netRate * dt);
          const newB = Math.max(0, last.b - netRate * dt);
          const newC = Math.max(0, last.c + netRate * dt);
          const newD = Math.max(0, last.d + netRate * dt);

          setParticles((prevP) => {
            const updatedPos = prevP.map((p) => {
              let nx = p.x + p.vx;
              let ny = p.y + p.vy;
              let nvx = p.vx;
              let nvy = p.vy;

              if (nx < 3 || nx > 95) nvx = -nvx;
              if (ny < 12 || ny > 92) nvy = -nvy;

              return { ...p, x: nx, y: ny, vx: nvx, vy: nvy };
            });

            syncParticlesWithConc(newA, newB, newC, newD, updatedPos);
            return updatedPos;
          });

          return [
            ...prev,
            {
              t: last.t + 1,
              a: newA,
              b: newB,
              c: newC,
              d: newD,
              rf: currentRf,
              rr: currentRr
            }
          ];
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStatus = history[history.length - 1] || history[0];
  const isEquilibriumReached = Math.abs(currentStatus.rf - currentStatus.rr) < 0.003 && currentStatus.t > 15;

  // ==========================================
  // 2. 勒沙特列原理 State (修正體積改變與濃度的正確顏色對應)
  // ==========================================
  const [leTab, setLeTab] = useState('temp'); // 'conc' | 'temp' | 'pressure' | 'volume'
  const [continuousPos, setContinuousPos] = useState(50); // 0 ~ 100

  // 燒瓶內安全粒子座標點
  const SAFE_PARTICLE_SLOTS = [
    { x: 48, y: 55 }, { x: 52, y: 62 }, { x: 44, y: 68 }, { x: 56, y: 72 },
    { x: 42, y: 78 }, { x: 58, y: 80 }, { x: 48, y: 75 }, { x: 50, y: 84 },
    { x: 46, y: 62 }, { x: 54, y: 68 }
  ];

  const getInterpolatedConfig = (tab, val) => {
    const ratio = val / 100; // 0.0 ~ 1.0

    // 1. 濃度影響
    if (tab === 'conc') {
      const p2Count = Math.round(ratio * 10);
      const p1Count = 10 - p2Count;

      let r, g, b, alpha;
      if (ratio <= 0.5) {
        const localR = ratio * 2;
        r = Math.round(234 + (249 - 234) * localR);
        g = Math.round(179 + (115 - 179) * localR);
        b = Math.round(8 + (22 - 8) * localR);
        alpha = 0.45 + 0.1 * localR;
      } else {
        const localR = (ratio - 0.5) * 2;
        r = Math.round(249 + (225 - 249) * localR);
        g = Math.round(115 + (29 - 115) * localR);
        b = Math.round(22 + (72 - 22) * localR);
        alpha = 0.55 + 0.2 * localR;
      }

      let status = '系統處於動態中性平衡狀態';
      if (val < 45) status = `加入 OH⁻ (pH升)，平衡向左移動 ${(50 - val) * 2}%`;
      if (val > 55) status = `加入 H⁺ (pH降)，平衡向右移動 ${(val - 50) * 2}%`;

      return {
        title: '濃度影響 (鉻酸鉀)',
        eq: '2CrO₄²⁻ (黃色) + 2H⁺ ⇌ Cr₂O₇²⁻ (橘紅色) + H₂O',
        tag: '酸鹼同離子效應平衡',
        minLabel: '加鹼 (OH⁻)',
        midLabel: '中性平衡',
        maxLabel: '加酸 (H⁺)',
        bgColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
        p1Percent: Math.round((1 - ratio) * 100),
        p2Percent: Math.round(ratio * 100),
        p1Name: `CrO₄²⁻`,
        p2Name: `Cr₂O₇²⁻`,
        p1Color: '#fde047',
        p2Color: '#ea580c',
        p1Count,
        p2Count,
        statusText: status,
        scaleFactor: 1.0,
        desc: (
          <span>
            <strong>原理：</strong>
            根據勒沙特列原理，增加酸強度（加入 H⁺）會促進正反應（向右），產生更多橘紅色的 Cr₂O₇²⁻；反之，增加鹼強度（加入 OH⁻ 消耗 H⁺）會促進逆反應（向左），產生更多黃色的 CrO₄²⁻。
          </span>
        )
      };
    }

    // 2. 溫度影響
    if (tab === 'temp') {
      const p2Count = Math.round(ratio * 10);
      const p1Count = 10 - p2Count;

      let r, g, b, alpha;
      if (ratio <= 0.5) {
        const localR = ratio * 2;
        r = Math.round(241 + (239 - 241) * localR);
        g = Math.round(245 + (68 - 245) * localR);
        b = Math.round(249 + (68 - 249) * localR);
        alpha = 0.15 + 0.3 * localR;
      } else {
        const localR = (ratio - 0.5) * 2;
        r = Math.round(239 + (153 - 239) * localR);
        g = Math.round(68 + (27 - 68) * localR);
        b = Math.round(68 + (27 - 68) * localR);
        alpha = 0.45 + 0.35 * localR;
      }

      let status = '室溫穩定平衡狀態';
      if (val < 45) status = `降溫 (冰水浴)，平衡向左移動 ${(50 - val) * 2}%`;
      if (val > 55) status = `升溫 (熱水浴)，平衡向右移動 ${(val - 50) * 2}%`;

      return {
        title: '溫度影響 (二氧化氮)',
        eq: 'N₂O₄ (無色) + 熱 (Heat) ⇌ 2NO₂ (紅棕色)',
        tag: '吸熱反應 (Endothermic)',
        minLabel: '冰水浴 (低溫)',
        midLabel: '室溫 (25°C)',
        maxLabel: '熱水浴 (高溫)',
        bgColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
        p1Percent: Math.round((1 - ratio) * 100),
        p2Percent: Math.round(ratio * 100),
        p1Name: `N₂O₄`,
        p2Name: `NO₂`,
        p1Color: '#e2e8f0',
        p2Color: '#dc2626',
        p1Count,
        p2Count,
        statusText: status,
        scaleFactor: 1.0,
        desc: (
          <span>
            <strong>原理：</strong>
            正反應是吸熱的。根據勒沙特列原理，升高溫度會促進吸熱反應（向右），產生更多紅棕色的 NO₂；降低溫度則會促進放熱反應（向左），產生更多無色的 N₂O₄。
          </span>
        )
      };
    }

    // 3. 壓力影響
    if (tab === 'pressure') {
      const shiftRightRatio = 1.0 - ratio;
      
      const r = Math.round(185 + (239 - 185) * shiftRightRatio);
      const g = Math.round(28 + (110 - 28) * shiftRightRatio);
      const b = Math.round(28 + (110 - 28) * shiftRightRatio);
      const alpha = 0.75 - 0.45 * ratio;

      const p1Count = Math.round(ratio * 10);
      const p2Count = 10 - p1Count;

      let status = '標準大氣壓平衡狀態';
      if (val < 45) status = `減壓 (低壓)，平衡向右移動 (向莫耳數多方向 NO₂) ${(50 - val) * 2}%`;
      if (val > 55) status = `加壓 (高壓)，平衡向左移動 (向莫耳數少方向 N₂O₄) ${(val - 50) * 2}%`;

      return {
        title: '壓力影響 (二氧化氮)',
        eq: 'N₂O₄ (無色, 1莫耳) ⇌ 2NO₂ (紅棕色, 2莫耳)',
        tag: '氣體分子莫耳數變化',
        minLabel: '降低壓力 (低壓)',
        midLabel: '標準壓力 (1 atm)',
        maxLabel: '增加壓力 (高壓)',
        bgColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
        p1Percent: Math.round(ratio * 100),
        p2Percent: Math.round((1 - ratio) * 100),
        p1Name: `N₂O₄`,
        p2Name: `NO₂`,
        p1Color: '#e2e8f0',
        p2Color: '#dc2626',
        p1Count,
        p2Count,
        statusText: status,
        scaleFactor: 1.0,
        desc: (
          <span>
            <strong>原理：</strong>
            根據勒沙特列原理，增加外界壓力時，系統會向氣體莫耳數較少的方向（向左生成 1 莫耳 N₂O₄）移動以減緩壓力，顏色變淺；降低壓力時，系統則向氣體莫耳數較多的方向（向右生成 2 莫耳 NO₂）移動。
          </span>
        )
      };
    }

    // 4. 體積影響 (精準修正：體積變小，顏色濃縮變深！)
    if (tab === 'volume') {
      // 體積變小 (val 大)，雖然平衡向左消耗 NO2，但體積縮小造成的濃度暴增為主因，最終 [NO2] 升，顏色變濃！
      const r = Math.round(239 + (185 - 239) * ratio);
      const g = Math.round(110 + (28 - 110) * ratio);
      const b = Math.round(110 + (28 - 110) * ratio);
      const alpha = 0.25 + 0.5 * ratio; // 體積越小 alpha 越大，顏色越深

      const scaleFactor = 1.25 - ratio * 0.5; // 體積變小 (縮小燒瓶)

      const p1Count = Math.round(ratio * 10); // 平衡左移生成的 N2O4
      const p2Count = 10 - p1Count;

      let status = '容器標準體積狀態';
      if (val < 45) status = `體積變大 (空間擴張)，平衡向右移動，但莫耳濃度降低 (顏色變淺) ${(50 - val) * 2}%`;
      if (val > 55) status = `體積變小 (空間壓縮)，平衡向左移動，但莫耳濃度暴增 (顏色變深) ${(val - 50) * 2}%`;

      return {
        title: '體積影響 (二氧化氮)',
        eq: 'N₂O₄ (無色, 1莫耳) ⇌ 2NO₂ (紅棕色, 2莫耳)',
        tag: '密閉容器空間體積壓縮與濃度效應',
        minLabel: '體積變大 (擴張/顏色淺)',
        midLabel: '標準體積',
        maxLabel: '體積變小 (壓縮/顏色深)',
        bgColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
        p1Percent: Math.round(ratio * 100),
        p2Percent: Math.round((1 - ratio) * 100),
        p1Name: `N₂O₄`,
        p2Name: `NO₂`,
        p1Color: '#e2e8f0',
        p2Color: '#dc2626',
        p1Count,
        p2Count,
        statusText: status,
        scaleFactor,
        desc: (
          <span>
            <strong>原理與細節迷思：</strong>
            當容器體積變小時（壓縮空間），系統為了減緩高壓會向莫耳數少的方向（向左生成 N₂O₄）移動。
            <br />
            <strong>⚠️ 關鍵濃度變化：</strong>雖然平衡左移消耗了部分 NO₂，但<strong>勒沙特列原理無法完全抵消體積縮小帶來的濃度暴增</strong>，因此最終新平衡的 [NO₂] 莫耳濃度依然比原本高，<strong>氣體顏色最終呈現變深</strong>！反之，體積變大時，莫耳濃度下降，顏色變淺。
          </span>
        )
      };
    }
  };

  const currentLeConfig = getInterpolatedConfig(leTab, continuousPos);

  const renderedParticles = SAFE_PARTICLE_SLOTS.map((slot, index) => {
    const isP2 = index < currentLeConfig.p2Count;
    return {
      ...slot,
      color: isP2 ? currentLeConfig.p2Color : currentLeConfig.p1Color,
      id: index
    };
  });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          理化實驗室：國二下 單元四《化學平衡與勒沙特列原理》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索可逆反應正逆反應速率平衡、動態平衡特徵與破壞平衡之移位方向預測</p>
      </div>

      {/* 主分頁 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('dynamic')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'dynamic' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-300" /> 1. 動態平衡模擬 (密閉容器粒子動態)
        </button>
        <button
          onClick={() => setActiveTab('le_chatelier')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'le_chatelier' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-indigo-300" /> 2. 勒沙特列原理 (位移與顏色變化)
        </button>
      </div>

      {/* 1. 動態平衡模擬模組 */}
      {activeTab === 'dynamic' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-300 block">可逆反應模型 (速率常數 k_f = 0.10, k_r = 0.05 固定)：</span>
                <span className="text-base font-mono font-bold text-white bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  A + B ⇌ C + D
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? '暫停反應' : '開始化學反應'}
                </button>
                <button
                  onClick={handleResetDynamic}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> 重置
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-blue-400 font-bold block">初始 [A] 濃度：{initA.toFixed(1)} M</label>
                <input
                  type="range" min="0.0" max="2.0" step="0.2"
                  value={initA}
                  onChange={(e) => setInitA(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-emerald-400 font-bold block">初始 [B] 濃度：{initB.toFixed(1)} M</label>
                <input
                  type="range" min="0.0" max="2.0" step="0.2"
                  value={initB}
                  onChange={(e) => setInitB(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-pink-400 font-bold block">初始 [C] 濃度：{initC.toFixed(1)} M</label>
                <input
                  type="range" min="0.0" max="2.0" step="0.2"
                  value={initC}
                  onChange={(e) => setInitC(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-amber-400 font-bold block">初始 [D] 濃度：{initD.toFixed(1)} M</label>
                <input
                  type="range" min="0.0" max="2.0" step="0.2"
                  value={initD}
                  onChange={(e) => setInitD(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-between space-y-3">
              <span className="text-xs font-bold text-slate-300">🧪 密閉容器內分子粒子動態反應 (均勻擴散熱運動)</span>

              <div className="w-full h-[200px] bg-slate-950 rounded-xl border-2 border-slate-700 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 right-0 h-3 bg-amber-900 border-b border-amber-950 opacity-80" />

                {particles.map((p) => {
                  let colorClass = 'bg-blue-400 shadow-blue-500/50';
                  if (p.type === 'B') colorClass = 'bg-emerald-400 shadow-emerald-500/50';
                  if (p.type === 'C') colorClass = 'bg-pink-500 shadow-pink-500/50';
                  if (p.type === 'D') colorClass = 'bg-amber-400 shadow-amber-500/50';

                  return (
                    <div
                      key={p.id}
                      className={`absolute w-3 h-3 rounded-full shadow-md transition-all duration-100 ${colorClass}`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-blue-300"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"/> A ({currentStatus.a.toFixed(2)}M)</span>
                <span className="flex items-center gap-1 text-emerald-300"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"/> B ({currentStatus.b.toFixed(2)}M)</span>
                <span className="flex items-center gap-1 text-pink-300"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"/> C ({currentStatus.c.toFixed(2)}M)</span>
                <span className="flex items-center gap-1 text-amber-300"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/> D ({currentStatus.d.toFixed(2)}M)</span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChartTab('rate')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      chartTab === 'rate' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    正逆反應速率圖
                  </button>
                  <button
                    onClick={() => setChartTab('concentration')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      chartTab === 'concentration' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    各分子莫耳濃度變化圖
                  </button>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isEquilibriumReached ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {isEquilibriumReached ? '✅ 已達動態平衡' : '⏳ 反應進行中'}
                </span>
              </div>

              {chartTab === 'rate' && (
                <div className="space-y-2">
                  <div className="bg-slate-950 rounded-xl p-2 border border-slate-800">
                    <svg width="100%" height="160" viewBox="0 0 300 160">
                      <line x1="40" y1="20" x2="280" y2="20" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="80" x2="280" y2="80" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="280" y2="140" stroke="#475569" />

                      <text x="30" y="144" fill="#64748b" fontSize="8" textAnchor="end">0</text>
                      <text x="160" y="156" fill="#94a3b8" fontSize="9" textAnchor="middle">反應時間 (t)</text>
                      <text x="15" y="80" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 15 80)">反應速率 R</text>

                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.rf / 0.4) * 120}`).join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="2.5"
                        points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.rr / 0.4) * 120}`).join(' ')}
                      />
                    </svg>
                  </div>
                  <div className="flex justify-center gap-6 text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">── 正反應速率 R_f = {currentStatus.rf.toFixed(3)}</span>
                    <span className="text-pink-400 font-bold">── 逆反應速率 R_r = {currentStatus.rr.toFixed(3)}</span>
                  </div>
                </div>
              )}

              {chartTab === 'concentration' && (
                <div className="space-y-2">
                  <div className="bg-slate-950 rounded-xl p-2 border border-slate-800">
                    <svg width="100%" height="160" viewBox="0 0 300 160">
                      <line x1="40" y1="20" x2="280" y2="20" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="80" x2="280" y2="80" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="280" y2="140" stroke="#475569" />

                      <text x="30" y="144" fill="#64748b" fontSize="8" textAnchor="end">0</text>
                      <text x="160" y="156" fill="#94a3b8" fontSize="9" textAnchor="middle">反應時間 (t)</text>
                      <text x="15" y="80" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 15 80)">濃度 (M)</text>

                      <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.a / 2.5) * 120}`).join(' ')} />
                      <polyline fill="none" stroke="#34d399" strokeWidth="2" points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.b / 2.5) * 120}`).join(' ')} />
                      <polyline fill="none" stroke="#f472b6" strokeWidth="2" points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.c / 2.5) * 120}`).join(' ')} />
                      <polyline fill="none" stroke="#fbbf24" strokeWidth="2" points={history.map(h => `${40 + (h.t / 80) * 240},${140 - (h.d / 2.5) * 120}`).join(' ')} />
                    </svg>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] font-mono">
                    <span className="text-blue-400 font-bold">── [A] = {currentStatus.a.toFixed(2)}M</span>
                    <span className="text-emerald-400 font-bold">── [B] = {currentStatus.b.toFixed(2)}M</span>
                    <span className="text-pink-400 font-bold">── [C] = {currentStatus.c.toFixed(2)}M</span>
                    <span className="text-amber-400 font-bold">── [D] = {currentStatus.d.toFixed(2)}M</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 勒沙特列原理模組 */}
      {activeTab === 'le_chatelier' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-700 flex flex-wrap gap-2">
            <button
              onClick={() => { setLeTab('conc'); setContinuousPos(50); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                leTab === 'conc' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-4 h-4" /> 濃度影響 (鉻酸鉀)
            </button>
            <button
              onClick={() => { setLeTab('temp'); setContinuousPos(50); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                leTab === 'temp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Thermometer className="w-4 h-4" /> 溫度影響 (二氧化氮)
            </button>
            <button
              onClick={() => { setLeTab('pressure'); setContinuousPos(50); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                leTab === 'pressure' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-4 h-4" /> 壓力影響 (二氧化氮)
            </button>
            <button
              onClick={() => { setLeTab('volume'); setContinuousPos(50); }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                leTab === 'volume' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-4 h-4" /> 體積影響 (二氧化氮)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-5">
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" /> 化學反應式對照
                </span>
                
                <div className="text-sm md:text-base font-bold font-mono text-center text-rose-200 bg-slate-950/80 py-3 rounded-xl border border-rose-900/50">
                  {currentLeConfig.eq}
                </div>

                <div className="flex justify-center">
                  <span className="text-[10px] bg-rose-900/60 text-rose-200 border border-rose-700/60 px-3 py-1 rounded-full font-bold">
                    {currentLeConfig.tag}
                  </span>
                </div>

                <p className="text-xs text-rose-200/90 leading-relaxed font-sans pt-1">
                  {currentLeConfig.desc}
                </p>
              </div>

              {/* 微調 Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                  <span>{leTab === 'temp' ? '連續溫度調控' : leTab === 'conc' ? '連續酸鹼濃度調控' : leTab === 'volume' ? '連續容器體積縮放' : '連續壓力調控'}：</span>
                  <span className="text-indigo-400 font-mono">{continuousPos}%</span>
                </div>

                <div className="px-1 space-y-2">
                  <input
                    type="range" min="0" max="100" step="1"
                    value={continuousPos}
                    onChange={(e) => setContinuousPos(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                  />

                  <div className="flex justify-between text-[11px] font-bold text-slate-400 font-mono">
                    <span onClick={() => setContinuousPos(0)} className="cursor-pointer hover:text-white">{currentLeConfig.minLabel}</span>
                    <span onClick={() => setContinuousPos(50)} className="cursor-pointer hover:text-white">{currentLeConfig.midLabel}</span>
                    <span onClick={() => setContinuousPos(100)} className="cursor-pointer hover:text-white">{currentLeConfig.maxLabel}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-bold text-xs text-slate-300">
                  當前狀態：<span className="text-indigo-400">{currentLeConfig.statusText}</span>
                </div>
              </div>
            </div>

            {/* 視覺化燒瓶 */}
            <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[360px] relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400">🧪 溶液/氣體顏色與分子數量即時視覺化</span>

              <div className="relative w-[180px] h-[220px] flex items-center justify-center my-2">
                <div
                  style={{
                    transform: `scale(${currentLeConfig.scaleFactor})`,
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="flex items-center justify-center relative w-full h-full"
                >
                  <svg width="180" height="220" viewBox="0 0 180 220" className="drop-shadow-2xl">
                    <polygon points="78,15 102,15 98,32 82,32" fill="#78350f" />
                    <path
                      d="M 80,32 L 100,32 L 100,65 L 155,185 C 160,195 152,205 140,205 L 40,205 C 28,205 20,195 25,185 L 80,65 Z"
                      fill={currentLeConfig.bgColor}
                      style={{ transition: 'fill 0.15s ease-out' }}
                    />
                    <path
                      d="M 80,30 L 100,30 L 100,65 L 158,187 C 165,200 155,210 140,210 L 40,210 C 25,210 15,200 22,187 L 80,65 Z"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="3.5"
                    />
                    <rect x="76" y="27" width="28" height="5" fill="#cbd5e1" rx="2" />
                  </svg>

                  {/* 安全邊界範圍內的 10 個動態顆粒 */}
                  <div className="absolute inset-0 pointer-events-none">
                    {renderedParticles.map((p) => (
                      <div
                        key={p.id}
                        className="absolute w-3 h-3 rounded-full shadow-md transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          backgroundColor: p.color
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部圖例 */}
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: currentLeConfig.p1Color }} />
                  {currentLeConfig.p1Name} ({currentLeConfig.p1Percent}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: currentLeConfig.p2Color }} />
                  {currentLeConfig.p2Name} ({currentLeConfig.p2Percent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}