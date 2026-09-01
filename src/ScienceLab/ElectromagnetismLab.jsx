import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers } from 'lucide-react';

export default function ElectromagnetismLab() {
  const [activeTab, setActiveTab] = useState('ampere');
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
  const [wireType, setWireType] = useState('straight'); // 'straight' | 'solenoid'
  const [currentDir, setCurrentDir] = useState('up'); // straight: 'up'|'down'; solenoid: 'up_front'|'down_front'

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
  // 3. 冷次定律 State & 電磁感應幾何運算
  // ==========================================
  const [sourceType, setSourceType] = useState('magnet'); // 'magnet' | 'wire'
  const [magnetPole, setMagnetPole] = useState('N'); // 'N' | 'S'
  const [actionType, setActionType] = useState('approach'); // 'approach' | 'recede'

  const getLenzResult = () => {
    let indB = '';
    let indI = '';
    let bDir = 'right'; // 內部感應磁場方向 (S -> N)
    let leftIndPole = 'S'; // 感應線圈左端極性
    let rightIndPole = 'N'; // 感應線圈右端極性
    let frontIUp = false; // 前方繞線電流方向：true(向上), false(向下)
    let needleAngle = 0; // 檢流計偏轉角度

    if (sourceType === 'magnet') {
      if (magnetPole === 'N') {
        if (actionType === 'approach') {
          // N極向左靠近 ➔ 右端產生 N 極抵觸靠近，左端為 S 極
          // 內部感應磁場 (S -> N) ➔ 向右 ➔ 前方繞線電流向下
          indB = '右端產生 N 極抵抗 N 極靠近 (內部感應磁場向右)';
          indI = '前方繞線向下感應電流 (檢流計向右偏轉)';
          bDir = 'right';
          leftIndPole = 'S';
          rightIndPole = 'N';
          frontIUp = false;
          needleAngle = 30;
        } else {
          // N極向右遠離 ➔ 右端產生 S 極拉住遠離，左端為 N 極
          // 內部感應磁場 (S -> N) ➔ 向左 ➔ 前方繞線電流向上
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
          // S極向左靠近 ➔ 右端產生 S 極抵抗靠近，左端為 N 極
          // 內部感應磁場 (S -> N) ➔ 向左 ➔ 前方繞線電流向上
          indB = '右端產生 S 極抵抗 S 極靠近 (內部感應磁場向左)';
          indI = '前方繞線向上感應電流 (檢流計向左偏轉)';
          bDir = 'left';
          leftIndPole = 'N';
          rightIndPole = 'S';
          frontIUp = true;
          needleAngle = -30;
        } else {
          // S極向右遠離 ➔ 右端產生 N 極拉住遠離，左端為 S 極
          // 內部感應磁場 (S -> N) ➔ 向右 ➔ 前方繞線電流向下
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
        indB = '產生反向感應磁場 (向左抵抗原磁場增加)';
        indI = '前方繞線向上感應電流 (檢流計向左偏轉)';
        bDir = 'left';
        leftIndPole = 'N';
        rightIndPole = 'S';
        frontIUp = true;
        needleAngle = -30;
      } else {
        indB = '產生同向感應磁場 (向右補充電流減弱磁場)';
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
            正確校正長直導線前方粒子巡航方向、冷次定律螺線管內部磁場 ($S \rightarrow N$) 與感應電流
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
                  {/* 同心橢圓後半段 (導線後方：虛線) */}
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

                  {/* 直立金屬導線 */}
                  <rect x="234" y="30" width="12" height="220" fill="#f59e0b" rx="3" stroke="#ffffff" strokeWidth="1" />
                  
                  {/* 電流箭頭標示 */}
                  <line x1="240" y1={currentDir === 'up' ? 230 : 40} x2="240" y2={currentDir === 'up' ? 40 : 230} stroke="#ef4444" strokeWidth="2.5" />
                  <text x="240" y="22" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
                    {currentDir === 'up' ? '▲ 電流 I (向上)' : '▼ 電流 I (向下)'}
                  </text>

                  {/* 同心橢圓前半段 (導線前方：實線) */}
                  {[45, 80, 115].map((rx) => (
                    <path
                      key={`front-${rx}`}
                      d={`M ${240 - rx} 140 A ${rx} ${rx * 0.35} 0 0 0 ${240 + rx} 140`}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* 導線前後/東西方位文字標記 */}
                  <text x="240" y="123" textAnchor="middle" fill="#94a3b8" fontSize="10">視角後 (虛線)</text>
                  <text x="240" y="165" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    視角前 ({currentDir === 'up' ? '向右 ➔' : '向左 '})
                  </text>
                  <text x="100" y="143" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    西方 ({currentDir === 'up' ? '穿出 ⦿' : '穿入 ⊗'})
                  </text>
                  <text x="380" y="143" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    東方 ({currentDir === 'up' ? '穿入 ⊗' : '穿出 ⦿'})
                  </text>

                  {/* 動態粒子導向校正 */}
                  {isRunning && [45, 80, 115].map((rx, idx) => {
                    const theta = (currentDir === 'up' ? -1 : 1) * ((animOffset * 3.6 + idx * 40) * Math.PI / 180);
                    const cx = 240 + rx * Math.sin(theta);
                    const cy = 140 + rx * 0.35 * Math.cos(theta);
                    const isFront = Math.cos(theta) < 0;

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
                  {/* 2. 螺線管 */}
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

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300 text-xs w-full mt-3 font-sans">
              {wireType === 'straight' ? (
                <p>
                  💡 <strong>長直導線空間分層：</strong> 實線弧線為導線<strong>視角前方</strong>磁力線；虛線弧線為導線<strong>視角後方</strong>磁力線。電流向上時，視角前方磁力線指向右側（➔），導線東側（右）指向紙內，西側（左）指向紙外。
                </p>
              ) : (
                <p>
                  💡 <strong>螺線管：</strong> 右手四指順著<strong>「前方繞線」</strong>電流（{currentDir === 'up_front' ? '由下往上 ▲' : '由上往下 ▼'}）握住，大拇指指向 <strong>{currentDir === 'up_front' ? '左端 (N極)' : '右端 (N極)'}</strong>。內部磁力線由 S 極指向 N 極。
                </p>
              )}
            </div>
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

            <div className="grid grid-cols-3 gap-4 text-center w-full max-w-xl mt-2 font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-cyan-500/50">
                <span className="text-cyan-400 font-bold block">四指 (磁場 B)</span>
                <span className="text-white text-xs font-bold">{bFieldDir}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-amber-500/50">
                <span className="text-amber-400 font-bold block">大拇指 (電流 I)</span>
                <span className="text-white text-xs font-bold">{iFieldDir}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/50">
                <span className="text-emerald-400 font-bold block">掌心 (磁力 F)</span>
                <span className="text-emerald-300 text-xs font-bold">{forceResult.text}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. 冷次定律與電磁感應 (內部感應磁場 S->N 與電流完美修正)
      ========================================== */}
      {activeTab === 'lenz' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">1. 感應源：</span>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
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
                      {actionType === 'approach' ? '向左靠近線圈 ➔' : '向右遠離線圈 '}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">電流變化：</span>
                  <button
                    onClick={() => setActionType(actionType === 'strengthen' ? 'weaken' : 'strengthen')}
                    className="px-3 py-1 bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    {actionType === 'strengthen' ? '主線圈電流加強 (磁場變大)' : '主線圈電流減弱 (磁場變小)'}
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-purple-400 font-bold">
              冷次定律：感應電流的磁場永遠抵抗原磁場之變化（來者拒，去者留）
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
            <svg width="520" height="250" className="select-none font-mono text-[11px]">
              {/* 副線圈 (Secondary Coil) */}
              <g>
                <text x="160" y="28" textAnchor="middle" fill="#a855f7" fontSize="11" fontWeight="bold">感應副線圈 (立體線圈)</text>

                {/* 後半圈 (虛線) */}
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={`ind-b-${i}`}
                    d={`M ${130 + i * 18} 100 A 15 50 0 0 1 ${160 + i * 18} 100`}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                ))}

                {/* 前半圈 (粗實線) */}
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={`ind-f-${i}`}
                    d={`M ${160 + i * 18} 100 A 15 50 0 0 1 ${130 + i * 18} 100`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="4"
                  />
                ))}

                {/* 動態標記：感應副線圈兩端 N / S 磁極標籤 */}
                <g>
                  <rect x="100" y="80" width="22" height="40" rx="3" fill={lenzRes.leftIndPole === 'N' ? '#3b82f6' : '#ef4444'} />
                  <text x="111" y="105" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">{lenzRes.leftIndPole}</text>

                  <rect x="215" y="80" width="22" height="40" rx="3" fill={lenzRes.rightIndPole === 'N' ? '#3b82f6' : '#ef4444'} />
                  <text x="226" y="105" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">{lenzRes.rightIndPole}</text>
                </g>

                {/* 前方繞線電流粒子方向精準繪製 */}
                {isRunning && [0, 1, 2, 3].map((i) => {
                  const dirMultiplier = lenzRes.frontIUp ? 1 : -1;
                  const theta = dirMultiplier * ((animOffset * 4 + i * 90) * Math.PI / 180);
                  const cx = 145 + i * 18 + 15 * Math.sin(theta);
                  const cy = 100 + 45 * Math.cos(theta);

                  return (
                    <circle key={`ind-p-${i}`} cx={cx} cy={cy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  );
                })}

                {/* 內部感應磁場 B_ind 向量箭頭 (內部永遠由 S 極指向 N 極) */}
                <line
                  x1={lenzRes.bDir === 'right' ? '135' : '190'}
                  y1="100"
                  x2={lenzRes.bDir === 'right' ? '190' : '135'}
                  y2="100"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                />
                <polygon
                  points={
                    lenzRes.bDir === 'right'
                      ? '190,95 200,100 190,105'
                      : '135,95 125,100 135,105'
                  }
                  fill="#06b6d4"
                />
                <text x="162" y="90" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">
                  B感應 ({lenzRes.bDir === 'right' ? '向右 ➔' : '向左 '})
                </text>

                {/* 下方檢流計 (G) */}
                <line x1="160" y1="150" x2="160" y2="185" stroke="#a855f7" strokeWidth="2" />
                <circle cx="160" cy="185" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text x="160" y="189" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">G</text>
                
                {/* 檢流計動態偏轉指針 */}
                <line
                  x1="160"
                  y1="185"
                  x2={160 + 12 * Math.sin((lenzRes.needleAngle * Math.PI) / 180)}
                  y2={185 - 12 * Math.cos((lenzRes.needleAngle * Math.PI) / 180)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />
              </g>

              {/* 右側感應源繪製 */}
              {sourceType === 'magnet' ? (
                <g>
                  {(() => {
                    const baseShift = (animOffset % 40);
                    const magnetX = actionType === 'approach' ? 340 - baseShift : 290 + baseShift;

                    const leftPole = magnetPole;
                    const rightPole = magnetPole === 'N' ? 'S' : 'N';

                    return (
                      <g>
                        <rect x={magnetX} y="80" width="100" height="40" rx="4" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
                        <rect x={magnetX} y="80" width="50" height="40" rx="2" fill={leftPole === 'N' ? '#3b82f6' : '#ef4444'} />
                        <rect x={magnetX + 50} y="80" width="50" height="40" rx="2" fill={rightPole === 'N' ? '#3b82f6' : '#ef4444'} />
                        
                        <text x={magnetX + 25} y="105" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{leftPole}</text>
                        <text x={magnetX + 75} y="105" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{rightPole}</text>

                        <text x={magnetX + 50} y="68" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                          {actionType === 'approach' ? '向左靠近 ➔' : '向右遠離 '}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              ) : (
                <g>
                  <text x="350" y="28" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">主線圈 (立體線圈)</text>

                  {[0, 1, 2].map((i) => (
                    <path
                      key={`p-b-${i}`}
                      d={`M ${320 + i * 20} 100 A 15 50 0 0 1 ${340 + i * 20} 100`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  ))}

                  {[0, 1, 2].map((i) => (
                    <path
                      key={`p-f-${i}`}
                      d={`M ${340 + i * 20} 100 A 15 50 0 0 1 ${320 + i * 20} 100`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={actionType === 'strengthen' ? '5' : '3'}
                    />
                  ))}

                  <rect x="320" y="170" width="60" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="350" y="186" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                    {actionType === 'strengthen' ? 'I 加強 ▲' : 'I 減弱 ▼'}
                  </text>
                </g>
              )}
            </svg>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1 w-full mt-2 font-sans">
              <p className="text-purple-300 font-bold">🎯 冷次定律電磁感應幾何與物理對照：</p>
              <p className="text-slate-300">• 感應磁極：線圈左端為 <strong className="text-blue-400">{lenzRes.leftIndPole} 極</strong>，右端為 <strong className="text-rose-400">{lenzRes.rightIndPole} 極</strong>。</p>
              <p className="text-slate-300">• 內部感應磁場（由 $S \rightarrow N$ 極）：<strong className="text-cyan-300">{lenzRes.bDir === 'right' ? '向右 ➔' : '向左 '}</strong> ({lenzRes.indB})。</p>
              <p className="text-slate-300">• 前方繞線電流：<strong className="text-amber-300">{lenzRes.frontIUp ? '由下往上 ▲' : '由上往下 ▼'}</strong>。</p>
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

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 w-full mt-2 font-sans">
              <p className="text-rose-400 font-bold">💡 馬達核心考點：</p>
              <p>1. 利用 <strong>右手開掌定則</strong>，線圈兩側電流相反、受力方向一上一下形成<strong>旋轉力矩</strong>。</p>
              <p>2. <strong>半環轉向器 (Commutator)</strong> 每轉動 180° 自動改變電流方向，確保線圈持續向同一方向旋轉。</p>
            </div>
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

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 w-full mt-2 font-sans">
              <p className="text-emerald-400 font-bold">💡 發電機核心考點：</p>
              <p>1. 線圈面與磁場垂直時，磁通量最大但變化率為 0 ➔ <strong>感應電流 = 0</strong>。</p>
              <p>2. 線圈面與磁場平行時，磁通量為 0 但變化率最大 ➔ <strong>感應電流最大</strong>。</p>
              <p>3. 交流發電機搭配 <strong>全環集電環</strong>；直流發電機搭配 <strong>半環轉向器</strong>。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}