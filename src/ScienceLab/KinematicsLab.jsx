import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, RotateCcw, Compass, Table } from 'lucide-react';

export default function KinematicsLab() {
  const [activeTab, setActiveTab] = useState('linear'); // 'linear' | 'projectile'

  // ==========================================
  // 1. 直線運動 State & Logic
  // ==========================================
  const [v0, setV0] = useState(0);       // 初速 m/s
  const [a, setA] = useState(3);         // 加速度 m/s²
  const [totalTime, setTotalTime] = useState(5); // 總時間 (s)
  
  const [isLinearRunning, setIsLinearRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // 播放動畫 Timer
  useEffect(() => {
    let interval = null;
    if (isLinearRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalTime) {
            setIsLinearRunning(false);
            return totalTime;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLinearRunning, totalTime]);

  const handleResetLinear = () => {
    setIsLinearRunning(false);
    setCurrentTime(0);
  };

  // 每秒點位置與位移數據點計算
  const secondData = [];
  for (let t = 0; t <= Math.floor(totalTime); t++) {
    const x = v0 * t + 0.5 * a * t * t;
    const v = v0 + a * t;
    const prevX = t > 0 ? v0 * (t - 1) + 0.5 * a * (t - 1) * (t - 1) : 0;
    const dx = t > 0 ? x - prevX : 0;
    secondData.push({ t, x, v, dx });
  }

  // 當前即時物理量
  const currentX = Number((v0 * currentTime + 0.5 * a * currentTime * currentTime).toFixed(2));
  const currentV = Number((v0 + a * currentTime).toFixed(2));

  // ==========================================
  // 2. 拋體運動 State & Logic
  // ==========================================
  const [projType, setProjType] = useState('oblique');
  const [projV0, setProjV0] = useState(20);
  const [projAngle, setProjAngle] = useState(45);
  const [projHeight, setProjHeight] = useState(10);
  
  const [isProjRunning, setIsProjRunning] = useState(false);
  const [projTime, setProjTime] = useState(0);

  const g = 9.8;

  const handleTypeChange = (type) => {
    setProjType(type);
    setIsProjRunning(false);
    setProjTime(0);
    if (type === 'freefall') {
      setProjV0(0);
      setProjAngle(0);
      setProjHeight(20);
    } else if (type === 'upward') {
      setProjV0(20);
      setProjAngle(90);
      setProjHeight(0);
    } else if (type === 'horizontal') {
      setProjV0(15);
      setProjAngle(0);
      setProjHeight(20);
    } else if (type === 'oblique') {
      setProjV0(20);
      setProjAngle(45);
      setProjHeight(0);
    }
  };

  const rad = (projAngle * Math.PI) / 180;
  const vx = projV0 * Math.cos(rad);
  const vy0 = projV0 * Math.sin(rad);

  const totalProjTime = Number(
    ((vy0 + Math.sqrt(vy0 * vy0 + 2 * g * projHeight)) / g).toFixed(2)
  );

  const maxY = Number((projHeight + (vy0 * vy0) / (2 * g)).toFixed(2));
  const rangeX = Number((vx * totalProjTime).toFixed(2));

  useEffect(() => {
    let interval = null;
    if (isProjRunning) {
      interval = setInterval(() => {
        setProjTime((prev) => {
          if (prev >= totalProjTime) {
            setIsProjRunning(false);
            return totalProjTime;
          }
          return Number((prev + 0.05).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isProjRunning, totalProjTime]);

  const handleResetProj = () => {
    setIsProjRunning(false);
    setProjTime(0);
  };

  const currProjX = Number((vx * projTime).toFixed(2));
  const currProjY = Number(Math.max(0, projHeight + vy0 * projTime - 0.5 * g * projTime * projTime).toFixed(2));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          理化實驗室：國三上 單元一《運動學（直線與拋體運動）》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索直線運動 x-t / v-t / a-t 圖形轉換與拋體運動軌跡之 2D 向量分解</p>
      </div>

      {/* 主分頁切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('linear')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'linear' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-purple-300" /> 1. 平面直線運動 (x-t / v-t / a-t 圖形關係)
        </button>
        <button
          onClick={() => setActiveTab('projectile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'projectile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-indigo-300" /> 2. 拋體運動模擬 (軌跡與 x-y 分位移)
        </button>
      </div>

      {/* 1. 平面直線運動模組 */}
      {activeTab === 'linear' && (
        <div className="space-y-6">
          {/* 變因滑桿控制卡片 */}
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">初速度 v0 (m/s)：</span>
                <span className="text-cyan-400 font-mono">{v0} m/s</span>
              </div>
              <input
                type="range" min="-15" max="20" step="1" value={v0}
                onChange={(e) => { setV0(Number(e.target.value)); handleResetLinear(); }}
                className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">加速度 a (m/s²)：</span>
                <span className="text-amber-400 font-mono">{a} m/s²</span>
              </div>
              <input
                type="range" min="-10" max="10" step="1" value={a}
                onChange={(e) => { setA(Number(e.target.value)); handleResetLinear(); }}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">總運動時間 t (s)：</span>
                <span className="text-purple-400 font-mono">{totalTime} 秒</span>
              </div>
              <input
                type="range" min="3" max="8" step="1" value={totalTime}
                onChange={(e) => { setTotalTime(Number(e.target.value)); handleResetLinear(); }}
                className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2 md:pt-0">
              <button
                onClick={() => setIsLinearRunning(!isLinearRunning)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all ${
                  isLinearRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isLinearRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLinearRunning ? '暫停運動' : '開始播放'}
              </button>
              <button
                onClick={handleResetLinear}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl border border-slate-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 直線軌道實驗動態 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" /> 物體直線運動與打點實驗動態 (Ticker Tape View)
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                時間 t = {currentTime.toFixed(1)} s ｜ 位移 x = {currentX} m ｜ 速度 v = {currentV} m/s
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-xl p-4 overflow-x-auto flex justify-center">
              <svg width="680" height="120" className="select-none font-mono">
                {(() => {
                  let minX = 0;
                  let maxX = 0;
                  secondData.forEach(d => {
                    if (d.x < minX) minX = d.x;
                    if (d.x > maxX) maxX = d.x;
                  });
                  minX = Math.min(-10, minX - 5);
                  maxX = Math.max(20, maxX + 5);

                  const scaleX = 580 / (maxX - minX);
                  const zeroX = 50 + (0 - minX) * scaleX;

                  return (
                    <g>
                      <line x1="30" y1="80" x2="650" y2="80" stroke="#64748b" strokeWidth="2" />
                      <line x1={zeroX} y1="30" x2={zeroX} y2="85" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x={zeroX} y="22" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">原點 (x=0)</text>

                      {secondData.map((item) => {
                        const px = 50 + (item.x - minX) * scaleX;
                        const isReached = currentTime >= item.t;
                        return (
                          <g key={`dot-${item.t}`}>
                            <circle cx={px} cy="80" r="4" fill={isReached ? '#a855f7' : '#475569'} />
                            <line x1={px} y1="80" x2={px} y2="88" stroke="#64748b" strokeWidth="1.5" />
                            <text x={px} y="102" textAnchor="middle" fill="#94a3b8" fontSize="10">
                              {item.t}s ({item.x.toFixed(1)}m)
                            </text>
                          </g>
                        );
                      })}

                      {(() => {
                        const carX = 50 + (currentX - minX) * scaleX;
                        return (
                          <g>
                            <rect x={carX - 16} y="52" width="32" height="24" rx="4" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                            <circle cx={carX - 8} cy="76" r="4" fill="#0f172a" />
                            <circle cx={carX + 8} cy="76" r="4" fill="#0f172a" />
                            <text x={carX} y="44" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">
                              {currentV}m/s
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* 三圖連線同步繪製 (含每一秒連線與區域面積標註) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. x-t 圖 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-purple-400">📈 位置-時間圖 (x-t 圖)</span>
                <span className="text-[11px] font-mono text-purple-300 font-bold">x = {currentX} m</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                <svg width="220" height="160" className="select-none font-mono text-[10px]">
                  {(() => {
                    let allX = [];
                    for (let t = 0; t <= totalTime; t += 0.1) {
                      allX.push(v0 * t + 0.5 * a * t * t);
                    }
                    const maxX = Math.max(10, ...allX);
                    const minX = Math.min(-10, ...allX);

                    const scaleT = 160 / totalTime;
                    const scaleX = 120 / (maxX - minX);
                    const zeroY = 140 - (0 - minX) * scaleX;

                    let pathD = '';
                    for (let t = 0; t <= totalTime; t += 0.1) {
                      const xVal = v0 * t + 0.5 * a * t * t;
                      const px = 30 + t * scaleT;
                      const py = 140 - (xVal - minX) * scaleX;
                      pathD += `${t === 0 ? 'M' : 'L'} ${px} ${py} `;
                    }

                    const currPx = 30 + currentTime * scaleT;
                    const currPy = 140 - (currentX - minX) * scaleX;

                    return (
                      <g>
                        <line x1="30" y1={zeroY} x2="200" y2={zeroY} stroke="#64748b" strokeWidth="1.5" />
                        <line x1="30" y1="145" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
                        <text x="195" y={zeroY + 12} fill="#94a3b8">t(s)</text>
                        <text x="10" y="20" fill="#a855f7">x(m)</text>

                        {/* 每秒垂直/水平連線與刻度 */}
                        {secondData.map((item) => {
                          if (item.t === 0) return null;
                          const px = 30 + item.t * scaleT;
                          const py = 140 - (item.x - minX) * scaleX;
                          const isPast = currentTime >= item.t;
                          return (
                            <g key={`xt-grid-${item.t}`}>
                              <line x1={px} y1={zeroY} x2={px} y2={py} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                              <line x1="30" y1={py} x2={px} y2={py} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                              <circle cx={px} cy={py} r="2.5" fill={isPast ? '#c084fc' : '#475569'} />
                              <text x="28" y={py + 3} textAnchor="end" fill="#94a3b8" fontSize="8">
                                {item.x.toFixed(0)}m
                              </text>
                            </g>
                          );
                        })}

                        {/* 曲線本體 */}
                        <path d={pathD} fill="none" stroke="#c084fc" strokeWidth="2.5" />
                        
                        {/* 當前高亮動態點 */}
                        <line x1={currPx} y1={zeroY} x2={currPx} y2={currPy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx={currPx} cy={currPy} r="4" fill="#f59e0b" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* 2. v-t 圖 (每秒梯形面積與當秒位移 Δx) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-cyan-400">📈 速度-時間圖 (v-t 圖)</span>
                <span className="text-[11px] font-mono text-cyan-300 font-bold">v = {currentV} m/s</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                <svg width="220" height="160" className="select-none font-mono text-[10px]">
                  {(() => {
                    const maxV = Math.max(15, v0, v0 + a * totalTime);
                    const minV = Math.min(-15, v0, v0 + a * totalTime);

                    const scaleT = 160 / totalTime;
                    const scaleV = 120 / (maxV - minV);
                    const zeroY = 140 - (0 - minV) * scaleV;

                    const p1x = 30;
                    const p1y = 140 - (v0 - minV) * scaleV;
                    const p2x = 30 + totalTime * scaleT;
                    const p2y = 140 - (v0 + a * totalTime - minV) * scaleV;

                    const currPx = 30 + currentTime * scaleT;
                    const currPy = 140 - (currentV - minV) * scaleV;

                    let polygonPoints = `30,${zeroY} 30,${p1y} `;
                    if ((v0 > 0 && currentV < 0) || (v0 < 0 && currentV > 0)) {
                      const tCross = -v0 / a;
                      const crossPx = 30 + tCross * scaleT;
                      polygonPoints += `${crossPx},${zeroY} `;
                    }
                    polygonPoints += `${currPx},${currPy} ${currPx},${zeroY}`;

                    return (
                      <g>
                        <line x1="30" y1={zeroY} x2="200" y2={zeroY} stroke="#64748b" strokeWidth="1.5" />
                        <line x1="30" y1="145" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
                        <text x="195" y={zeroY + 12} fill="#94a3b8">t(s)</text>
                        <text x="10" y="20" fill="#38bdf8">v(m/s)</text>

                        {/* 動態背景陰影 */}
                        <polygon points={polygonPoints} fill="rgba(56, 189, 248, 0.25)" stroke="none" />

                        {/* 每秒分割線與該秒位移 (面積 Δx) 標註 */}
                        {secondData.map((item, idx) => {
                          if (idx === 0) return null;
                          const tPrev = secondData[idx - 1].t;
                          const pxPrev = 30 + tPrev * scaleT;
                          const pxCurr = 30 + item.t * scaleT;
                          const pyCurr = 140 - (item.v - minV) * scaleV;
                          const isPast = currentTime >= item.t;

                          const midPx = (pxPrev + pxCurr) / 2;

                          return (
                            <g key={`vt-sec-${item.t}`}>
                              {/* 垂直分割線 */}
                              <line x1={pxCurr} y1={zeroY} x2={pxCurr} y2={pyCurr} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                              {/* 在每個 1 秒區間填入當秒位移 Δx */}
                              <text x={midPx} y={zeroY > 80 ? zeroY - 8 : zeroY + 14} textAnchor="middle" fill={isPast ? '#38bdf8' : '#64748b'} fontSize="8" fontWeight="bold">
                                Δx={item.dx.toFixed(0)}m
                              </text>
                            </g>
                          );
                        })}

                        {/* v-t 線條 */}
                        <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#38bdf8" strokeWidth="2.5" />
                        
                        {/* 當前即時點 */}
                        <line x1={currPx} y1={zeroY} x2={currPx} y2={currPy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx={currPx} cy={currPy} r="4" fill="#f59e0b" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* 3. a-t 圖 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-amber-400">📈 加速度-時間圖 (a-t 圖)</span>
                <span className="text-[11px] font-mono text-amber-300 font-bold">a = {a} m/s²</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                <svg width="220" height="160" className="select-none font-mono text-[10px]">
                  {(() => {
                    const scaleT = 160 / totalTime;
                    const zeroY = 80;
                    const scaleA = 50 / 10;
                    const py = zeroY - a * scaleA;

                    const currPx = 30 + currentTime * scaleT;

                    return (
                      <g>
                        <line x1="30" y1={zeroY} x2="200" y2={zeroY} stroke="#64748b" strokeWidth="1.5" />
                        <line x1="30" y1="145" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
                        <text x="195" y={zeroY + 12} fill="#94a3b8">t(s)</text>
                        <text x="10" y="20" fill="#fbbf24">a(m/s²)</text>

                        {/* 每秒垂直分割網格 */}
                        {secondData.map((item) => {
                          if (item.t === 0) return null;
                          const px = 30 + item.t * scaleT;
                          return (
                            <line key={`at-sec-${item.t}`} x1={px} y1={zeroY} x2={px} y2={py} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                          );
                        })}

                        <polygon
                          points={`30,${zeroY} 30,${py} ${currPx},${py} ${currPx},${zeroY}`}
                          fill="rgba(251, 191, 36, 0.25)"
                        />

                        <line x1="30" y1={py} x2="190" y2={py} stroke="#fbbf24" strokeWidth="2.5" />
                        
                        <line x1={currPx} y1={zeroY} x2={currPx} y2={py} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                        <circle cx={currPx} cy={py} r="4" fill="#f59e0b" />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>

          {/* 等時距位移數據 */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-emerald-400" /> 等加速度運動在「等時距 (Δt = 1s)」下之位移規律觀察
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-2">時間區間</th>
                    <th className="p-2">第 1 秒 (0~1s)</th>
                    <th className="p-2">第 2 秒 (1~2s)</th>
                    <th className="p-2">第 3 秒 (2~3s)</th>
                    <th className="p-2">第 4 秒 (3~4s)</th>
                    <th className="p-2">第 5 秒 (4~5s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800 text-cyan-300">
                    <td className="p-2 font-sans font-bold text-slate-400">當秒位移 Δx (m)</td>
                    {secondData.slice(1, 6).map((item) => (
                      <td key={`dx-${item.t}`} className="p-2 font-bold text-amber-300">
                        {item.dx.toFixed(1)} m
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-xs font-sans text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed space-y-1">
              <strong className="text-amber-300 block">💡 觀念總結與解題技巧：</strong>
              <p>• v-t 圖形每一秒梯形/三角形面積等於該秒位移 (Δx)。</p>
              <p>• 等時距位移等差性質：當加速度 a = {a} m/s² 固定時，相鄰每 1 秒之位移差值恆為固定值 (Δxₙ - Δxₙ₋₁ = a = {a} m)。</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 拋體運動模擬模組 */}
      {activeTab === 'projectile' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 md:p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'freefall', name: '自由落體' },
                { id: 'upward', name: '垂直上拋' },
                { id: 'horizontal', name: '水平拋射' },
                { id: 'oblique', name: '斜向拋射' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    projType === type.id ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">初速度 v0 (m/s)：</span>
                  <span className="text-cyan-400 font-mono">{projV0} m/s</span>
                </div>
                <input
                  type="range" min="0" max="40" step="1" value={projV0}
                  disabled={projType === 'freefall'}
                  onChange={(e) => { setProjV0(Number(e.target.value)); handleResetProj(); }}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">拋射角度 θ (度)：</span>
                  <span className="text-amber-400 font-mono">{projAngle}°</span>
                </div>
                <input
                  type="range" min="0" max="90" step="5" value={projAngle}
                  disabled={projType === 'freefall' || projType === 'upward' || projType === 'horizontal'}
                  onChange={(e) => { setProjAngle(Number(e.target.value)); handleResetProj(); }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">初始高度 h0 (m)：</span>
                  <span className="text-purple-400 font-mono">{projHeight} m</span>
                </div>
                <input
                  type="range" min="0" max="50" step="5" value={projHeight}
                  onChange={(e) => { setProjHeight(Number(e.target.value)); handleResetProj(); }}
                  className="w-full accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsProjRunning(!isProjRunning)}
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                  isProjRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isProjRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isProjRunning ? '暫停動畫' : '開始發射'}
              </button>
              <button
                onClick={handleResetProj}
                className="p-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左側：2D 運動軌跡 */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-400" /> 2D 拋體運動軌跡 (x-y 座標)
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  t = {projTime.toFixed(2)}s ｜ x = {currProjX}m ｜ y = {currProjY}m
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                <svg width="340" height="200" className="select-none font-mono text-[10px]">
                  <line x1="30" y1="170" x2="320" y2="170" stroke="#64748b" strokeWidth="2" />
                  
                  {(() => {
                    const maxScaleX = Math.max(30, rangeX * 1.2);
                    const maxScaleY = Math.max(20, maxY * 1.2);

                    const scaleX = 260 / maxScaleX;
                    const scaleY = 130 / maxScaleY;

                    let trajectoryPath = '';
                    for (let t = 0; t <= totalProjTime; t += 0.05) {
                      const px = 30 + vx * t * scaleX;
                      const py = 170 - (projHeight + vy0 * t - 0.5 * g * t * t) * scaleY;
                      trajectoryPath += `${t === 0 ? 'M' : 'L'} ${px} ${py} `;
                    }

                    const ballPx = 30 + currProjX * scaleX;
                    const ballPy = 170 - currProjY * scaleY;

                    return (
                      <g>
                        <path d={trajectoryPath} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx={ballPx} cy={ballPy} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        {vx > 0 && (
                          <line x1={ballPx} y1={ballPy} x2={ballPx + 20} y2={ballPy} stroke="#38bdf8" strokeWidth="2" />
                        )}
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">最大高度 y_max</span>
                  <span className="text-purple-300 font-bold">{maxY} m</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">落地總時間 T</span>
                  <span className="text-emerald-300 font-bold">{totalProjTime} s</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">水平射程 R</span>
                  <span className="text-cyan-300 font-bold">{rangeX} m</span>
                </div>
              </div>
            </div>

            {/* 右側：觀念解說 */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-cyan-400 block border-b border-slate-800 pb-1">
                  📈 水平方向位移 (等速運動 x-t 圖)
                </span>
                <div className="text-xs font-mono text-slate-300">
                  水平速度 vx = v0 cos(θ) = {vx.toFixed(1)} m/s （恆定）
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-amber-400 block border-b border-slate-800 pb-1">
                  📈 垂直方向高度 (等加速度運動 y-t 圖)
                </span>
                <div className="text-xs font-mono text-slate-300">
                  垂直初速 vy0 = v0 sin(θ) = {vy0.toFixed(1)} m/s，受重力 g = 9.8 m/s² 向下。
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-indigo-300 block">💡 拋體獨立性核心口訣：</strong>
                <p>• 水平方向：不受外力，作等速度直線運動 (x = vx × t)。</p>
                <p>• 垂直方向：僅受重力，作等加速度運動 (y = h0 + vy0 × t - 0.5 × g × t²)。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}