import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers } from 'lucide-react';

export default function ElectromagnetismLab() {
  const [activeTab, setActiveTab] = useState('lenz');
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
  // 1. 安培右手定則 State
  // ==========================================
  const [wireType, setWireType] = useState('straight'); 
  const [currentDir, setCurrentDir] = useState('up'); 

  // ==========================================
  // 2. 右手開掌定則 State & 3D 向量運算
  // ==========================================
  const [bFieldDir, setBFieldDir] = useState('+x');
  const [iFieldDir, setIFieldDir] = useState('+y');

  const calculateForceDir = (I, B) => {
    if (I === B || (I.startsWith('+') && B === '-' + I.slice(1)) || (I.startsWith('-') && B === '+' + I.slice(1))) {
      return { text: '平行不受力 (0)', vec: [0, 0, 0] };
    }
    
    const vecMap = {
      '+x': [1, 0, 0], '-x': [-1, 0, 0],
      '+y': [0, 1, 0], '-y': [0, -1, 0],
      '+z': [0, 0, 1], '-z': [0, 0, -1]
    };
    const vI = vecMap[I];
    const vB = vecMap[B];
    
    const Fx = vI[1] * vB[2] - vI[2] * vB[1];
    const Fy = vI[2] * vB[0] - vI[0] * vB[2];
    const Fz = vI[0] * vB[1] - vI[1] * vB[0];

    let text = '';
    if (Fx === 1) text = '+X 軸 (向右)';
    else if (Fx === -1) text = '-X 軸 (向左)';
    else if (Fy === 1) text = '+Y 軸 (向上)';
    else if (Fy === -1) text = '-Y 軸 (向下)';
    else if (Fz === 1) text = '+Z 軸 (垂直穿出紙面)';
    else if (Fz === -1) text = '-Z 軸 (垂直穿入紙面)';
    else text = '不受力 (0)';

    return { text, vec: [Fx, Fy, Fz] };
  };

  const forceResult = calculateForceDir(iFieldDir, bFieldDir);

  const project3D = (x, y, z, originX = 240, originY = 130, scale = 70) => {
    const px = originX + x * scale - z * scale * 0.5;
    const py = originY - y * scale + z * scale * 0.5;
    return { x: px, y: py };
  };

  // ==========================================
  // 3. 冷次定律 State & 電磁感應運算
  // ==========================================
  const [sourceType, setSourceType] = useState('wire'); // 'magnet' | 'wire'
  const [magnetPole, setMagnetPole] = useState('N'); // 'N' | 'S'
  const [actionType, setActionType] = useState('strengthen'); // 'approach' | 'recede' | 'strengthen' | 'weaken'

  const getLenzResult = () => {
    let indB = '';
    let indI = '';
    let bDir = 'right'; 
    let leftIndPole = 'S'; 
    let rightIndPole = 'N'; 
    let frontIUp = false; 
    let needleAngle = 0; 

    if (sourceType === 'magnet') {
      if (magnetPole === 'N') {
        if (actionType === 'approach') {
          indB = '右端產生 N 極抵抗 N 極靠近 (內部感應磁場向右)';
          indI = '前方繞線向下感應電流 (檢流計向右偏轉)';
          bDir = 'right';
          leftIndPole = 'S';
          rightIndPole = 'N';
          frontIUp = false; 
          needleAngle = 30;
        } else {
          indB = '右端產生 S 極吸引 N 極遠離 (內部感應磁場向左)';
          indI = '前方繞線向上感應電流 (檢流計向左偏轉)';
          bDir = 'left';
          leftIndPole = 'N';
          rightIndPole = 'S';
          frontIUp = true; 
          needleAngle = -30;
        }
      } else {
        if (actionType === 'approach') {
          indB = '右端產生 S 極抵抗 S 極靠近 (內部感應磁場向左)';
          indI = '前方繞線向上感應電流 (檢流計向左偏轉)';
          bDir = 'left';
          leftIndPole = 'N';
          rightIndPole = 'S';
          frontIUp = true; 
          needleAngle = -30;
        } else {
          indB = '右端產生 N 極吸引 S 極遠離 (內部感應磁場向右)';
          indI = '前方繞線向下感應電流 (檢流計向右偏轉)';
          bDir = 'right';
          leftIndPole = 'S';
          rightIndPole = 'N';
          frontIUp = false; 
          needleAngle = 30;
        }
      }
    } else {
      if (actionType === 'strengthen') {
        indB = '產生反向感應磁場 (向左抵抗原磁場向右增強)';
        indI = '前方繞線向上感應電流 (檢流計向左偏轉)';
        bDir = 'left';
        leftIndPole = 'N';
        rightIndPole = 'S';
        frontIUp = true;
        needleAngle = -30;
      } else {
        indB = '產生同向感應磁場 (向右補充原磁場向右減弱)';
        indI = '前方繞線向下感應電流 (檢流計向右偏轉)';
        bDir = 'right';
        leftIndPole = 'S';
        rightIndPole = 'N';
        frontIUp = false;
        needleAngle = 30;
      }
    }
    return { indB, indI, bDir, leftIndPole, rightIndPole, frontIUp, needleAngle };
  };

  const lenzRes = getLenzResult();

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            理化實驗室：國三下 單元六《電與磁互動實驗室》
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            冷次定律主線圈 3D 幾何重構、原磁場動態標記與感應電流精準巡航
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

      {/* 五大主題頁籤 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('ampere')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ampere' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-300" /> 1. 安培右手定則
        </button>
        <button
          onClick={() => setActiveTab('palm')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'palm' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-300" /> 2. 右手開掌定則
        </button>
        <button
          onClick={() => setActiveTab('lenz')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'lenz' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-300" /> 3. 冷次定律
        </button>
        <button
          onClick={() => setActiveTab('motor')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'motor' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5 text-rose-300" /> 4. 馬達原理
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'generator' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-300" /> 5. 發電機原理
        </button>
      </div>

      {/* ==========================================
          1. 安培右手定則
      ========================================== */}
      {activeTab === 'ampere' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">1. 導線類型：</span>
                <select
                  value={wireType}
                  onChange={(e) => {
                    setWireType(e.target.value);
                    setCurrentDir(e.target.value === 'straight' ? 'up' : 'up_front');
                  }}
                  className="bg-slate-800 text-amber-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="straight">長直導線</option>
                  <option value="solenoid">螺旋形線圈 (螺線管)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">2. 電流方向：</span>
                {wireType === 'straight' ? (
                  <select
                    value={currentDir}
                    onChange={(e) => setCurrentDir(e.target.value)}
                    className="bg-slate-800 text-cyan-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                  >
                    <option value="up">向上 (+Y 軸)</option>
                    <option value="down">向下 (-Y 軸)</option>
                  </select>
                ) : (
                  <select
                    value={currentDir}
                    onChange={(e) => setCurrentDir(e.target.value)}
                    className="bg-slate-800 text-cyan-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                  >
                    <option value="up_front">前方繞線：由下往上 ▲</option>
                    <option value="down_front">前方繞線：由上往下 ▼</option>
                  </select>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-amber-400 font-bold">
              {wireType === 'straight'
                ? '右手大拇指：電流方向 ｜ 四指彎曲：磁場方向'
                : '右手四指彎曲：電流方向 ｜ 大拇指指向：內部磁場 (N極)'}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[320px]">
            <svg width="520" height="280" className="select-none font-mono text-[11px]">
              {wireType === 'straight' ? (
                <g>
                  {[45, 80, 115].map((rx) => (
                    <path
                      key={`back-${rx}`}
                      d={`M ${240 + rx} 140 A ${rx} ${rx * 0.35} 0 0 0 ${240 - rx} 140`}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      opacity="0.6"
                    />
                  ))}

                  <rect x="234" y="30" width="12" height="220" fill="#f59e0b" rx="3" stroke="#ffffff" strokeWidth="1" />
                  
                  <line x1="240" y1={currentDir === 'up' ? 230 : 40} x2="240" y2={currentDir === 'up' ? 40 : 230} stroke="#ef4444" strokeWidth="2.5" />
                  <text x="240" y="22" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                    {currentDir === 'up' ? '▲ 電流 I (向上)' : '▼ 電流 I (向下)'}
                  </text>

                  {[45, 80, 115].map((rx) => (
                    <path
                      key={`front-${rx}`}
                      d={`M ${240 - rx} 140 A ${rx} ${rx * 0.35} 0 0 0 ${240 + rx} 140`}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                  ))}

                  <text x="240" y="123" textAnchor="middle" fill="#94a3b8" fontSize="10">視角後 (虛線)</text>

                  <text x="240" y="165" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    視角前 ({currentDir === 'up' ? '向右 →' : '向左 ←'})
                  </text>
                  <text x="100" y="143" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    西方 ({currentDir === 'up' ? '穿出 ⦿' : '穿入 ⊗'})
                  </text>
                  <text x="380" y="143" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    東方 ({currentDir === 'up' ? '穿入 ⊗' : '穿出 ⦿'})
                  </text>

                  {isRunning && [45, 80, 115].map((rx, idx) => {
                    const dirMultiplier = currentDir === 'up' ? 1 : -1;
                    const t = (animOffset * 3.6 + idx * 40) * Math.PI / 180;
                    const cx = 240 - dirMultiplier * rx * Math.sin(t);
                    const cy = 140 - rx * 0.35 * Math.cos(t);
                    const isFront = cy > 140;

                    return (
                      <g key={`p-${rx}`}>
                        <circle cx={cx} cy={cy} r={isFront ? '6' : '4'} fill={isFront ? '#38bdf8' : '#0284c7'} opacity={isFront ? 1 : 0.5} />
                        <text x={cx} y={cy + 3} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">B</text>
                      </g>
                    );
                  })}
                </g>
              ) : (
                <g>
                  {currentDir === 'up_front' ? (
                    <line x1="380" y1="140" x2="120" y2="140" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="5 3" />
                  ) : (
                    <line x1="120" y1="140" x2="380" y2="140" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="5 3" />
                  )}
                  
                  <path d="M 120 140 Q 60 100 20 60" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />
                  <path d="M 120 140 Q 60 180 20 220" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />
                  <path d="M 380 140 Q 440 100 480 60" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />
                  <path d="M 380 140 Q 440 180 480 220" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" />

                  <rect x="120" y="110" width="260" height="60" fill="url(#coreGradient)" rx="4" stroke="#64748b" strokeWidth="1.5" />

                  {currentDir === 'up_front' ? (
                    <>
                      <rect x="70" y="120" width="40" height="40" fill="#3b82f6" rx="4" />
                      <text x="90" y="145" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">N</text>

                      <rect x="390" y="120" width="40" height="40" fill="#ef4444" rx="4" />
                      <text x="410" y="145" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">S</text>
                    </>
                  ) : (
                    <>
                      <rect x="70" y="120" width="40" height="40" fill="#ef4444" rx="4" />
                      <text x="90" y="145" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">S</text>

                      <rect x="390" y="120" width="40" height="40" fill="#3b82f6" rx="4" />
                      <text x="410" y="145" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">N</text>
                    </>
                  )}

                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <path
                      key={`b-wire-${i}`}
                      d={`M ${150 + i * 40} 110 Q ${165 + i * 40} 85 ${180 + i * 40} 110`}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={`f-wire-${i}`}>
                      <path
                        d={`M ${140 + i * 40} 170 Q ${155 + i * 40} 195 ${170 + i * 40} 110`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4.5"
                      />
                      {currentDir === 'up_front' ? (
                        <path
                          d={`M ${153 + i * 40} 165 L ${157 + i * 40} 150 L ${163 + i * 40} 160`}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                        />
                      ) : (
                        <path
                          d={`M ${153 + i * 40} 145 L ${157 + i * 40} 160 L ${163 + i * 40} 150`}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  ))}

                  <line x1="120" y1="210" x2="140" y2="170" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="370" y1="110" x2="390" y2="70" stroke="#f59e0b" strokeWidth="3" />

                  <defs>
                    <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>
                  </defs>
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* ==========================================
          2. 右手開掌定則
      ========================================== */}
      {activeTab === 'palm' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">1. 磁場方向 B (四指)：</span>
                <select
                  value={bFieldDir}
                  onChange={(e) => setBFieldDir(e.target.value)}
                  className="bg-slate-800 text-cyan-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="+x">+X 軸 (向右)</option>
                  <option value="-x">-X 軸 (向左)</option>
                  <option value="+y">+Y 軸 (向上)</option>
                  <option value="-y">-Y 軸 (向下)</option>
                  <option value="+z">+Z 軸 (垂直穿出紙面)</option>
                  <option value="-z">-Z 軸 (垂直穿入紙面)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">2. 電流方向 I (大拇指)：</span>
                <select
                  value={iFieldDir}
                  onChange={(e) => setIFieldDir(e.target.value)}
                  className="bg-slate-800 text-amber-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="+x">+X 軸 (向右)</option>
                  <option value="-x">-X 軸 (向左)</option>
                  <option value="+y">+Y 軸 (向上)</option>
                  <option value="-y">-Y 軸 (向下)</option>
                  <option value="+z">+Z 軸 (垂直穿出紙面)</option>
                  <option value="-z">-Z 軸 (垂直穿入紙面)</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-mono text-emerald-400 font-bold">
              受力方向 F (掌心推出)：{forceResult.text}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[340px]">
            <svg width="480" height="260" className="select-none font-mono text-[11px]">
              {(() => {
                const origin = { x: 240, y: 130 };
                const xAxis = project3D(1.5, 0, 0, origin.x, origin.y);
                const yAxis = project3D(0, 1.5, 0, origin.x, origin.y);
                const zAxis = project3D(0, 0, 1.5, origin.x, origin.y);

                const vecI = {
                  '+x': [1, 0, 0], '-x': [-1, 0, 0],
                  '+y': [0, 1, 0], '-y': [0, -1, 0],
                  '+z': [0, 0, 1], '-z': [0, 0, -1]
                }[iFieldDir];

                const vecB = {
                  '+x': [1, 0, 0], '-x': [-1, 0, 0],
                  '+y': [0, 1, 0], '-y': [0, -1, 0],
                  '+z': [0, 0, 1], '-z': [0, 0, -1]
                }[bFieldDir];

                const vecF = forceResult.vec;

                const endI = project3D(vecI[0] * 1.2, vecI[1] * 1.2, vecI[2] * 1.2, origin.x, origin.y);
                const endB = project3D(vecB[0] * 1.2, vecB[1] * 1.2, vecB[2] * 1.2, origin.x, origin.y);
                const endF = project3D(vecF[0] * 1.2, vecF[1] * 1.2, vecF[2] * 1.2, origin.x, origin.y);

                return (
                  <g>
                    <line x1={origin.x} y1={origin.y} x2={xAxis.x} y2={xAxis.y} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={xAxis.x + 8} y={xAxis.y} fill="#64748b" fontSize="10">X</text>

                    <line x1={origin.x} y1={origin.y} x2={yAxis.x} y2={yAxis.y} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={yAxis.x} y={yAxis.y - 8} fill="#64748b" fontSize="10">Y</text>

                    <line x1={origin.x} y1={origin.y} x2={zAxis.x} y2={zAxis.y} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={zAxis.x - 12} y={zAxis.y + 12} fill="#64748b" fontSize="10">Z (穿出)</text>

                    <circle cx={origin.x} cy={origin.y} r="8" fill="#334155" stroke="#ffffff" strokeWidth="2" />

                    <line x1={origin.x} y1={origin.y} x2={endI.x} y2={endI.y} stroke="#f59e0b" strokeWidth="4.5" />
                    <circle cx={endI.x} cy={endI.y} r="6" fill="#f59e0b" />
                    <text x={endI.x + 10} y={endI.y - 5} fill="#f59e0b" fontSize="12" fontWeight="bold">I (電流)</text>

                    <line x1={origin.x} y1={origin.y} x2={endB.x} y2={endB.y} stroke="#06b6d4" strokeWidth="4.5" />
                    <circle cx={endB.x} cy={endB.y} r="6" fill="#06b6d4" />
                    <text x={endB.x + 10} y={endB.y - 5} fill="#06b6d4" fontSize="12" fontWeight="bold">B (磁場)</text>

                    {(vecF[0] !== 0 || vecF[1] !== 0 || vecF[2] !== 0) && (
                      <g>
                        <line x1={origin.x} y1={origin.y} x2={endF.x} y2={endF.y} stroke="#10b981" strokeWidth="5" />
                        <circle cx={endF.x} cy={endF.y} r="7" fill="#10b981" />
                        <text x={endF.x + 12} y={endF.y + 5} fill="#10b981" fontSize="13" fontWeight="bold">F (磁力)</text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* ==========================================
          3. 冷次定律 (修正 LaTeX 標註為 HTML 元素)
      ========================================== */}
      {activeTab === 'lenz' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">1. 感應源：</span>
                <select
                  value={sourceType}
                  onChange={(e) => {
                    setSourceType(e.target.value);
                    if (e.target.value === 'wire') setActionType('strengthen');
                    else setActionType('approach');
                  }}
                  className="bg-slate-800 text-purple-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700"
                >
                  <option value="magnet">條形磁鐵</option>
                  <option value="wire">載流主線圈 (Primary Coil)</option>
                </select>
              </div>

              {sourceType === 'magnet' ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-bold">極性：</span>
                    <button
                      onClick={() => setMagnetPole(magnetPole === 'N' ? 'S' : 'N')}
                      className="px-3 py-1 bg-slate-800 text-rose-400 text-xs font-bold rounded-xl border border-slate-700"
                    >
                      {magnetPole} 極向左靠近/遠離
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-bold">動作：</span>
                    <button
                      onClick={() => setActionType(actionType === 'approach' ? 'recede' : 'approach')}
                      className="px-3 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-xl border border-slate-700"
                    >
                      {actionType === 'approach' ? '向左靠近線圈 ←' : '向右遠離線圈 →'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">主線圈電流控制：</span>
                  <button
                    onClick={() => setActionType(actionType === 'strengthen' ? 'weaken' : 'strengthen')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      actionType === 'strengthen' 
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500/50' 
                        : 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                    }`}
                  >
                    {actionType === 'strengthen' ? 'I 電流增強 ▲ (主磁場向右增強)' : 'I 電流減弱 ▼ (主磁場向右減弱)'}
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-purple-400 font-bold">
              冷次定律：感應電流之感應磁場 B<sub>感</sub> 永遠抵抗主磁場 B<sub>原</sub> 之變化
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[320px]">
            <svg width="580" height="260" className="select-none font-mono text-[11px]">
              {/* ================= 左側：感應螺線管線圈 ================= */}
              <g>
                <text x="170" y="22" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold">感應螺線管線圈</text>

                {/* 1. 感應線圈後側 (細虛線) */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <path
                    key={`coil-back-${i}`}
                    d={`M ${120 + i * 32} 150 C ${120 + i * 32} 50, ${90 + i * 32} 50, ${90 + i * 32} 70`}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.2"
                    strokeDasharray="4 3"
                    opacity="0.5"
                  />
                ))}

                {/* 內部感應磁場 B_ind 向量箭頭 */}
                <line
                  x1={lenzRes.bDir === 'right' ? '80' : '250'}
                  y1="110"
                  x2={lenzRes.bDir === 'right' ? '250' : '80'}
                  y2="110"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                />
                <polygon
                  points={
                    lenzRes.bDir === 'right'
                      ? '250,105 260,110 250,115'
                      : '80,105 70,110 80,115'
                  }
                  fill="#06b6d4"
                />
                <text x="165" y="100" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
                  B感應 ({lenzRes.bDir === 'right' ? '向右 →' : '向左 ←'})
                </text>

                {/* 2. 感應線圈前側 (粗實線) */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <path
                    key={`coil-front-${i}`}
                    d={`M ${90 + i * 32} 70 C ${90 + i * 32} 170, ${120 + i * 32} 170, ${120 + i * 32} 150`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="4.5"
                  />
                ))}

                {/* 3. 底部迴路與檢流計 */}
                <path
                  d="M 90 135 L 90 200 L 140 200 M 190 200 L 248 200 L 248 135"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                />

                {/* 下方檢流計 (G) */}
                <circle cx="165" cy="200" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text x="165" y="204" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">G</text>
                
                <line
                  x1="165"
                  y1="200"
                  x2={165 + 12 * Math.sin((lenzRes.needleAngle * Math.PI) / 180)}
                  y2={200 - 12 * Math.cos((lenzRes.needleAngle * Math.PI) / 180)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* 線圈兩端極性 (N / S) */}
                <text x="50" y="115" textAnchor="middle" fill={lenzRes.leftIndPole === 'N' ? '#3b82f6' : '#ef4444'} fontSize="18" fontWeight="bold">
                  {lenzRes.leftIndPole}
                </text>
                <text x="270" y="115" textAnchor="middle" fill={lenzRes.rightIndPole === 'N' ? '#3b82f6' : '#ef4444'} fontSize="18" fontWeight="bold">
                  {lenzRes.rightIndPole}
                </text>

                {/* 4. 動態感應電流黃色粒子 (巡航方向精準校正) */}
                {isRunning && [0, 1, 2, 3, 4].map((i) => {
                  const dir = lenzRes.frontIUp ? 1 : -1;
                  const t = (animOffset * 4 + i * 72) * Math.PI / 180;
                  const cx = 105 + i * 32 + 15 * Math.cos(t);
                  const cy = 110 + dir * 40 * Math.sin(t);
                  const isFront = cy >= 105;

                  return (
                    <circle
                      key={`ind-p-${i}`}
                      cx={cx}
                      cy={cy}
                      r={isFront ? '5.5' : '3.5'}
                      fill={isFront ? '#f59e0b' : '#d97706'}
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity={isFront ? 1 : 0.6}
                    />
                  );
                })}
              </g>

              {/* ================= 右側：磁鐵 或 載流主線圈 ================= */}
              {sourceType === 'magnet' ? (
                <g>
                  {(() => {
                    const baseShift = (animOffset % 40);
                    const magnetX = actionType === 'approach' ? 380 - baseShift : 340 + baseShift;

                    const leftPole = magnetPole;
                    const rightPole = magnetPole === 'N' ? 'S' : 'N';

                    return (
                      <g>
                        <rect x={magnetX} y="90" width="100" height="40" rx="4" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
                        <rect x={magnetX} y="90" width="50" height="40" rx="2" fill={leftPole === 'N' ? '#3b82f6' : '#ef4444'} />
                        <rect x={magnetX + 50} y="90" width="50" height="40" rx="2" fill={rightPole === 'N' ? '#3b82f6' : '#ef4444'} />
                        
                        <text x={magnetX + 25} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{leftPole}</text>
                        <text x={magnetX + 75} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{rightPole}</text>

                        <g>
                          <text x={magnetX + 50} y="72" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">
                            {actionType === 'approach' ? '向左靠近 ←' : '向右遠離 →'}
                          </text>
                          <line
                            x1={actionType === 'approach' ? magnetX + 75 : magnetX + 25}
                            y1="142"
                            x2={actionType === 'approach' ? magnetX + 25 : magnetX + 75}
                            y2="142"
                            stroke="#38bdf8"
                            strokeWidth="2"
                          />
                          <polygon
                            points={
                              actionType === 'approach'
                                ? `${magnetX + 25},138 ${magnetX + 17},142 ${magnetX + 25},146`
                                : `${magnetX + 75},138 ${magnetX + 83},142 ${magnetX + 75},146`
                            }
                            fill="#38bdf8"
                          />
                        </g>
                      </g>
                    );
                  })()}
                </g>
              ) : (
                /* 載流主線圈：完全對齊感應螺線管之正統 3D 立體線圈樣式 */
                <g>
                  <text x="430" y="22" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                    主線圈 (載流螺線管)
                  </text>

                  {/* 1. 主線圈後側 (細虛線) */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path
                      key={`primary-back-${i}`}
                      d={`M ${380 + i * 28} 150 C ${380 + i * 28} 50, ${355 + i * 28} 50, ${355 + i * 28} 70`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      opacity="0.5"
                    />
                  ))}

                  {/* 2. 主磁場 B_原 向量箭頭與動態增減標示 */}
                  <line
                    x1="340"
                    y1="110"
                    x2="480"
                    y2="110"
                    stroke="#f59e0b"
                    strokeWidth={actionType === 'strengthen' ? '4' : '2'}
                  />
                  <polygon
                    points="480,105 492,110 480,115"
                    fill="#f59e0b"
                  />
                  <text x="420" y="98" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                    B原 (向右 →) {actionType === 'strengthen' ? '▲ 增強' : '▼ 減弱'}
                  </text>

                  {/* 3. 主線圈前側 (粗實線，繞線方向由下往上 ▲，故內部主磁場向右) */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path
                      key={`primary-front-${i}`}
                      d={`M ${355 + i * 28} 70 C ${355 + i * 28} 170, ${380 + i * 28} 170, ${380 + i * 28} 150`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={actionType === 'strengthen' ? '4.5' : '3'}
                    />
                  ))}

                  {/* 主線圈極性 (S極在左，N極在右) */}
                  <text x="325" y="115" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">S</text>
                  <text x="508" y="115" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="bold">N</text>

                  {/* 4. 主線圈電流粒子動畫 (前方實線段由下往上 ▲ 巡航) */}
                  {isRunning && [0, 1, 2, 3, 4].map((i) => {
                    const speedMultiplier = actionType === 'strengthen' ? 6 : 2;
                    const t = (animOffset * speedMultiplier + i * 72) * Math.PI / 180;
                    const cx = 367 + i * 28 + 12 * Math.cos(t);
                    const cy = 110 + 40 * Math.sin(t);
                    const isFront = cy >= 105;

                    return (
                      <circle
                        key={`pri-p-${i}`}
                        cx={cx}
                        cy={cy}
                        r={isFront ? (actionType === 'strengthen' ? '5.5' : '4') : '3'}
                        fill={isFront ? '#fbbf24' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity={isFront ? 1 : 0.6}
                      />
                    );
                  })}

                  {/* 下方控制狀態標籤 */}
                  <g transform="translate(420, 200)">
                    <rect
                      x="-55"
                      y="-14"
                      width="110"
                      height="28"
                      rx="8"
                      fill="#0f172a"
                      stroke={actionType === 'strengthen' ? '#f59e0b' : '#f43f5e'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={actionType === 'strengthen' ? '#f59e0b' : '#f43f5e'}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {actionType === 'strengthen' ? 'I 電流增強 ▲' : 'I 電流減弱 ▼'}
                    </text>
                  </g>
                </g>
              )}
            </svg>

            {/* 下方課綱解說卡 */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1 w-full mt-2 font-sans">
              <p className="text-purple-300 font-bold">🎯 冷次定律電磁感應幾何與物理對照：</p>
              <p className="text-slate-300">
                • 主線圈狀態：<strong className="text-amber-300">前方繞線電流由下往上 ▲</strong>，產生向右之主磁場 <strong className="text-amber-400">B<sub>原</sub> (向右 →)</strong>（左端 S 極、右端 N 極）。
              </p>
              <p className="text-slate-300">
                • 磁場變化與冷次定律：當主線圈電流 <strong className="text-amber-300">{actionType === 'strengthen' ? '增強' : '減弱'}</strong> 時，感應螺線管產生 <strong className="text-cyan-300">{lenzRes.indB}</strong>。
              </p>
              <p className="text-slate-300">
                • 感應螺線管：左端為 <strong className="text-blue-400">{lenzRes.leftIndPole} 極</strong>，右端為 <strong className="text-rose-400">{lenzRes.rightIndPole} 極</strong>；前方繞線感應電流為 <strong className="text-amber-300">{lenzRes.frontIUp ? '由下往上 ▲' : '由上往下 ▼'}</strong>。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          4. 馬達原理
      ========================================== */}
      {activeTab === 'motor' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
            <span className="text-xs text-rose-300 font-bold">
              直流馬達原理：電能 ➔ 機械能（載流線圈在磁場中受力產生力矩旋轉）
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <svg width="460" height="220" className="select-none font-mono text-[11px]">
              <rect x="30" y="60" width="60" height="100" rx="4" fill="#ef4444" />
              <text x="60" y="115" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">N</text>

              <rect x="370" y="60" width="60" height="100" rx="4" fill="#3b82f6" />
              <text x="400" y="115" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">S</text>

              <g transform={`rotate(${(animOffset * 3.6) % 360} 230 110)`}>
                <rect x="150" y="80" width="160" height="60" fill="none" stroke="#f59e0b" strokeWidth="4" rx="4" />
              </g>

              <circle cx="230" cy="110" r="16" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="20 10" />
            </svg>
          </div>
        </div>
      )}

      {/* ==========================================
          5. 發電機原理
      ========================================== */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
            <span className="text-xs text-emerald-300 font-bold">
              發電機原理：機械能 ➔ 電能（外力轉動線圈切割磁力線產生感應電流）
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <svg width="460" height="220" className="select-none font-mono text-[11px]">
              <path
                d="M 50 110 Q 100 30 150 110 T 250 110 T 350 110 T 450 110"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />

              {isRunning && (
                <circle
                  cx={50 + (animOffset * 4) % 400}
                  cy={110 - 50 * Math.sin((((animOffset * 4) % 400) * Math.PI) / 100)}
                  r="6"
                  fill="#f59e0b"
                />
              )}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}