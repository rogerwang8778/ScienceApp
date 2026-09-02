import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers, MoveHorizontal, Sliders } from 'lucide-react';

export default function ElectromagnetismLab() {
  const [activeTab, setActiveTab] = useState('motor'); // 預設開啟馬達頁籤
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
  // 3. 冷次定律 State & 雙子分頁控制
  // ==========================================
  const [lenzSubTab, setLenzSubTab] = useState('magnet'); 
  const offsetX = 40; 
  const [magnetPole, setMagnetPole] = useState('N'); 
  const [magnetX, setMagnetX] = useState(380); 
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0); 

  const dragRef = useRef({ startX: 0, initialMagnetX: 380, lastX: 380, lastTime: Date.now() });

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragRef.current = {
      startX: clientX,
      initialMagnetX: magnetX,
      lastX: clientX,
      lastTime: Date.now()
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - dragRef.current.startX;
    
    const newX = Math.max(-20, Math.min(420, dragRef.current.initialMagnetX + deltaX));
    setMagnetX(newX);

    const now = Date.now();
    const dt = (now - dragRef.current.lastTime) / 1000;
    if (dt > 0.02) {
      const v = (clientX - dragRef.current.lastX) / dt;
      setVelocity(v);
      dragRef.current.lastX = clientX;
      dragRef.current.lastTime = now;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setVelocity(0);
  };

  const [primaryCurrent, setPrimaryCurrent] = useState(50); 
  const [currentChangeRate, setCurrentChangeRate] = useState(0); 

  const handlePrimaryCurrentChange = (val) => {
    const newCurrent = Number(val);
    const diff = newCurrent - primaryCurrent;
    setCurrentChangeRate(diff);
    setPrimaryCurrent(newCurrent);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentChangeRate(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [primaryCurrent]);

  const getLenzLogic = () => {
    if (lenzSubTab === 'magnet') {
      const isMoving = Math.abs(velocity) > 15;
      const isMovingLeft = velocity < 0; 

      const magnetLeftEdge = magnetX;
      const magnetRightEdge = magnetX + 100;
      const magnetCenter = magnetX + 50;

      const coilCenter = 130 + offsetX + 25; 
      const isFullyInside = magnetLeftEdge >= (80 + offsetX) && magnetRightEdge <= (220 + offsetX);

      if (!isMoving || isFullyInside) {
        return {
          isMoving: false,
          indB: isFullyInside ? '磁鐵完全在內部，磁通量無變化' : '磁鐵靜止，無磁通量變化',
          indI: '無感應電流 (檢流計指向 0)',
          bDir: 'none',
          leftIndPole: '',
          rightIndPole: '',
          frontIUp: false,
          needleAngle: 0
        };
      }

      let leftIndPole = 'S';
      let rightIndPole = 'N';
      let bDir = 'right'; 
      let frontIUp = true; 
      const speedMagnitude = Math.min(Math.abs(velocity) / 15, 1);

      if (magnetCenter >= coilCenter) {
        const facingPole = magnetPole; 
        if (isMovingLeft) {
          rightIndPole = facingPole;
          leftIndPole = facingPole === 'N' ? 'S' : 'N';
        } else {
          rightIndPole = facingPole === 'N' ? 'S' : 'N';
          leftIndPole = facingPole;
        }
      } else {
        const facingPole = magnetPole === 'N' ? 'S' : 'N'; 
        if (!isMovingLeft) {
          leftIndPole = facingPole;
          rightIndPole = facingPole === 'N' ? 'S' : 'N';
        } else {
          leftIndPole = facingPole === 'N' ? 'S' : 'N';
          rightIndPole = facingPole;
        }
      }

      if (leftIndPole === 'S' && rightIndPole === 'N') {
        bDir = 'right';  
        frontIUp = true; 
      } else {
        bDir = 'left';   
        frontIUp = false; 
      }

      const needleAngle = frontIUp ? -35 * speedMagnitude : 35 * speedMagnitude;

      return {
        isMoving: true,
        moveDir: isMovingLeft ? 'approach' : 'recede',
        indB: `產生感應磁場 (${bDir === 'right' ? '向右 →' : '向左 ←'})`,
        indI: frontIUp ? '前方繞線向上感應電流 (檢流計向左偏轉)' : '前方繞線向下感應電流 (檢流計向右偏轉)',
        bDir,
        leftIndPole,
        rightIndPole,
        frontIUp,
        needleAngle
      };
    } else {
      const isChanging = Math.abs(currentChangeRate) > 0.5;

      if (!isChanging) {
        return {
          isMoving: false,
          indB: '主線圈電流穩定，無磁通量變化',
          indI: '無感應電流 (檢流計指向 0)',
          bDir: 'none',
          leftIndPole: '',
          rightIndPole: '',
          frontIUp: false,
          needleAngle: 0
        };
      }

      const isIncreasing = currentChangeRate > 0;
      let bDir = 'right';
      let leftIndPole = 'S';
      let rightIndPole = 'N';
      let frontIUp = true;

      if (primaryCurrent >= 0) {
        if (isIncreasing) {
          bDir = 'left'; leftIndPole = 'N'; rightIndPole = 'S'; frontIUp = false;
        } else {
          bDir = 'right'; leftIndPole = 'S'; rightIndPole = 'N'; frontIUp = true;
        }
      } else {
        if (isIncreasing) {
          bDir = 'left'; leftIndPole = 'N'; rightIndPole = 'S'; frontIUp = false;
        } else {
          bDir = 'right'; leftIndPole = 'S'; rightIndPole = 'N'; frontIUp = true;
        }
      }

      const needleAngle = frontIUp ? -30 : 30;

      return {
        isMoving: true,
        indB: isIncreasing ? '主磁場增強，感應磁場反向抵抗' : '主磁場減弱，感應磁場同向補充',
        indI: frontIUp ? '前方繞線向上感應電流 (檢流計向左偏轉)' : '前方繞線向下感應電流 (檢流計向右偏轉)',
        bDir,
        leftIndPole,
        rightIndPole,
        frontIUp,
        needleAngle
      };
    }
  };

  const lenzRes = getLenzLogic();

  // ==========================================
  // 4. 馬達原理：3D 旋轉投影運算
  // ==========================================
  const motorAngle = (animOffset * 3.6) % 360; // 0 ~ 360 度旋轉角度
  const rad = (motorAngle * Math.PI) / 180;

  // 3D 空間線圈四個頂點 (A, B, C, D) 原點 (280, 120)
  const projMotor3D = (x, y, z) => {
    const originX = 280;
    const originY = 125;
    const px = originX + x * 0.9 - z * 0.45;
    const py = originY - y * 0.9 + z * 0.45;
    return { x: px, y: py };
  };

  // 旋轉前的線圈半寬與半長
  const coilW = 60; // 沿 X 軸 (左右)
  const coilL = 80; // 沿 Z 軸 (前後)

  // 根據角度 rad 計算 AB 與 CD 兩側邊的 3D 旋轉座標
  const yRot = Math.sin(rad) * coilW;
  const xRot = Math.cos(rad) * coilW;

  const ptA = projMotor3D(-xRot, yRot, coilL);
  const ptB = projMotor3D(-xRot, yRot, -coilL);
  const ptC = projMotor3D(xRot, -yRot, -coilL);
  const ptD = projMotor3D(xRot, -yRot, coilL);

  // 判斷半環電刷換向 (當角度介於 90° ~ 270° 時，電流相對導線反向，維護單向旋轉力矩)
  const isCommutated = motorAngle > 90 && motorAngle < 270;

  return (
    <div 
      className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6 select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            理化實驗室：國三下 單元六《電與磁互動實驗室》
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            冷次定律實驗室：感應電流向量箭頭、可穿透條形磁鐵與載流螺線管變壓雙模組
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
          <Layers className="w-3.5 h-3.5 text-purple-300" /> 3. 冷次定律實驗室
        </button>
        <button
          onClick={() => setActiveTab('motor')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'motor' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-650'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5 text-rose-300" /> 4. 馬達原理 (3D動態)
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
          3. 冷次定律
      ========================================== */}
      {activeTab === 'lenz' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLenzSubTab('magnet')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lenzSubTab === 'magnet' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MoveHorizontal className="w-3.5 h-3.5" /> 實驗一：條形磁鐵自由穿透
              </button>
              <button
                onClick={() => setLenzSubTab('primaryWire')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lenzSubTab === 'primaryWire' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> 實驗二：載流主線圈 (直流電源控制)
              </button>
            </div>

            <div className="text-xs font-mono text-purple-400 font-bold">
              冷次定律：感應磁場 B<sub>感</sub> 永遠抵抗主磁場之變化
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            {lenzSubTab === 'magnet' ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">磁鐵左端極性：</span>
                  <button
                    onClick={() => setMagnetPole(magnetPole === 'N' ? 'S' : 'N')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
                      magnetPole === 'N' ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                    }`}
                  >
                    左端為 {magnetPole} 極 (右端為 {magnetPole === 'N' ? 'S' : 'N'} 極)
                  </button>
                </div>
                <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                  <MoveHorizontal className="w-4 h-4 animate-pulse" /> 左右拖曳磁鐵穿透螺線管
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 flex-wrap w-full">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Sliders className="w-4 h-4" /> 調整直流電源電流 I<sub>主</sub>：
                </span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={primaryCurrent}
                  onChange={(e) => handlePrimaryCurrentChange(e.target.value)}
                  className="w-48 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-mono font-bold text-amber-400 w-16">
                  {primaryCurrent}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[340px] overflow-x-auto">
            <svg width="660" height="260" className="select-none font-mono text-[11px]">
              <g>
                <text x={170 + offsetX} y="22" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold">感應螺線管線圈</text>

                {[0, 1, 2, 3, 4].map((i) => (
                  <path
                    key={`coil-back-${i}`}
                    d={`M ${120 + offsetX + i * 32} 150 C ${120 + offsetX + i * 32} 50, ${90 + offsetX + i * 32} 50, ${90 + offsetX + i * 32} 70`}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2.2"
                    strokeDasharray="4 3"
                    opacity="0.5"
                  />
                ))}

                {lenzSubTab === 'magnet' && (
                  <g className="cursor-grab active:cursor-grabbing" onPointerDown={handlePointerDown}>
                    <rect x={magnetX} y="90" width="100" height="40" rx="4" fill="#334155" stroke="#ffffff" strokeWidth={isDragging ? '2.5' : '1.5'} />
                    <rect x={magnetX} y="90" width="50" height="40" rx="2" fill={magnetPole === 'N' ? '#3b82f6' : '#ef4444'} />
                    <rect x={magnetX + 50} y="90" width="50" height="40" rx="2" fill={magnetPole === 'N' ? '#ef4444' : '#3b82f6'} />
                    
                    <text x={magnetX + 25} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{magnetPole}</text>
                    <text x={magnetX + 75} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{magnetPole === 'N' ? 'S' : 'N'}</text>
                  </g>
                )}

                {lenzRes.isMoving && (
                  <g>
                    <line
                      x1={lenzRes.bDir === 'right' ? 70 + offsetX : 260 + offsetX}
                      y1="110"
                      x2={lenzRes.bDir === 'right' ? 260 + offsetX : 70 + offsetX}
                      y2="110"
                      stroke="#06b6d4"
                      strokeWidth="3.5"
                    />
                    <polygon
                      points={
                        lenzRes.bDir === 'right'
                          ? `${260 + offsetX},105 ${272 + offsetX},110 ${260 + offsetX},115`
                          : `${70 + offsetX},105 ${58 + offsetX},110 ${70 + offsetX},115`
                      }
                      fill="#06b6d4"
                    />
                  </g>
                )}

                {[0, 1, 2, 3, 4].map((i) => {
                  const startX = 90 + offsetX + i * 32;
                  const endX = 120 + offsetX + i * 32;
                  return (
                    <path
                      key={`coil-front-${i}`}
                      d={`M ${startX} 70 C ${startX} 170, ${endX} 170, ${endX} 150`}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="4.5"
                    />
                  );
                })}

                <circle cx={165 + offsetX} cy="200" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text x={165 + offsetX} y="204" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">G</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* ==========================================
          4. 馬達原理 (擬真 3D 動態視覺化)
      ========================================== */}
      {activeTab === 'motor' && (
        <div className="space-y-6">
          {/* 控制與資訊面板 */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-rose-300 font-bold flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-rose-400" />
              直流馬達原理：通電線圈在場磁鐵中受磁力作用（右手開掌定則）產生力矩旋轉
            </div>
            <div className="text-xs font-mono text-amber-300 font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              線圈旋轉角度：{Math.round(motorAngle)}° ({motorAngle > 90 && motorAngle < 270 ? '電刷換向中' : '正向通電中'})
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[360px] overflow-x-auto">
            <svg width="580" height="300" className="select-none font-mono text-[11px]">
              {/* 1. 左側 N 極場磁鐵 (藍) */}
              <path d="M 80 50 L 170 50 L 170 180 L 80 180 Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
              <path d="M 170 50 L 200 70 L 200 160 L 170 180 Z" fill="#1d4ed8" />
              <path d="M 170 50 Q 185 115 170 180" fill="none" stroke="#93c5fd" strokeWidth="2" />
              <text x="125" y="120" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle">N</text>

              {/* 2. 右側 S 極場磁鐵 (紅) */}
              <path d="M 390 50 L 480 50 L 480 180 L 390 180 Z" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
              <path d="M 360 70 L 390 50 L 390 180 L 360 160 Z" fill="#b91c1c" />
              <path d="M 390 50 Q 375 115 390 180" fill="none" stroke="#fca5a5" strokeWidth="2" />
              <text x="435" y="120" fill="#ffffff" fontSize="22" fontWeight="bold" textAnchor="middle">S</text>

              {/* 3. 主磁場向量 B 箭頭 (N -> S 向右) */}
              <g>
                {[70, 115, 160].map((yVal, idx) => (
                  <g key={`b-line-${idx}`}>
                    <line x1="205" y1={yVal} x2="355" y2={yVal} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.6" />
                    <polygon points={`355,${yVal - 3} 363,${yVal} 355,${yVal + 3}`} fill="#38bdf8" opacity="0.8" />
                  </g>
                ))}
                <text x="280" y="60" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">磁場 B (向右 →)</text>
              </g>

              {/* 4. 旋轉電樞矩形線圈 ABCD (3D 空間透視) */}
              <g>
                {/* 旋轉中心軸線 */}
                <line x1="280" y1="20" x2="280" y2="230" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />

                {/* 矩形導線框 ABCD */}
                <path
                  d={`M ${ptA.x} ${ptA.y} L ${ptB.x} ${ptB.y} L ${ptC.x} ${ptC.y} L ${ptD.x} ${ptD.y} Z`}
                  fill={isCommutated ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                />

                {/* 導線頂點標籤 (A, B, C, D) */}
                <text x={ptA.x - 10} y={ptA.y + 5} fill="#fbbf24" fontSize="12" fontWeight="bold">A</text>
                <text x={ptB.x - 10} y={ptB.y - 5} fill="#fbbf24" fontSize="12" fontWeight="bold">B</text>
                <text x={ptC.x + 10} y={ptC.y - 5} fill="#fbbf24" fontSize="12" fontWeight="bold">C</text>
                <text x={ptD.x + 10} y={ptD.y + 5} fill="#fbbf24" fontSize="12" fontWeight="bold">D</text>

                {/* 電流向量 I 箭頭 (黃色) */}
                {isRunning && (
                  <g>
                    {/* 左側邊 (A->B 或 B->A) 電流箭頭 */}
                    <circle cx={(ptA.x + ptB.x) / 2} cy={(ptA.y + ptB.y) / 2} r="5" fill="#f59e0b" />
                    <text x={(ptA.x + ptB.x) / 2 - 18} y={(ptA.y + ptB.y) / 2 + 4} fill="#f59e0b" fontSize="10" fontWeight="bold">I</text>

                    {/* 右側邊 (C->D 或 D->C) 電流箭頭 */}
                    <circle cx={(ptC.x + ptD.x) / 2} cy={(ptC.y + ptD.y) / 2} r="5" fill="#f59e0b" />
                    <text x={(ptC.x + ptD.x) / 2 + 10} y={(ptC.y + ptD.y) / 2 + 4} fill="#f59e0b" fontSize="10" fontWeight="bold">I</text>
                  </g>
                )}

                {/* 導線受力方向 F 箭頭 (綠色：依右手開掌定則，左向上/右向下) */}
                {Math.abs(Math.sin(rad)) > 0.15 && (
                  <g>
                    {/* 左側導線受力 F (向上 ▲) */}
                    <line x1={ptA.x} y1={ptA.y} x2={ptA.x} y2={ptA.y - 35} stroke="#10b981" strokeWidth="3" />
                    <polygon points={`${ptA.x - 4},${ptA.y - 35} ${ptA.x},${ptA.y - 43} ${ptA.x + 4},${ptA.y - 35}`} fill="#10b981" />
                    <text x={ptA.x - 22} y={ptA.y - 25} fill="#10b981" fontSize="11" fontWeight="bold">F (向上)</text>

                    {/* 右側導線受力 F (向下 ▼) */}
                    <line x1={ptD.x} y1={ptD.y} x2={ptD.x} y2={ptD.y + 35} stroke="#10b981" strokeWidth="3" />
                    <polygon points={`${ptD.x - 4},${ptD.y + 35} ${ptD.x},${ptD.y + 43} ${ptD.x + 4},${ptD.y + 35}`} fill="#10b981" />
                    <text x={ptD.x + 10} y={ptD.y + 30} fill="#10b981" fontSize="11" fontWeight="bold">F (向下)</text>
                  </g>
                )}

                {/* 旋轉方向力矩弧形箭頭 (頂部順時針旋轉標示) */}
                <path d="M 260 30 A 25 10 0 0 1 300 30" fill="none" stroke="#c084fc" strokeWidth="2.5" />
                <polygon points="300,26 307,30 300,34" fill="#c084fc" />
                <text x="280" y="15" textAnchor="middle" fill="#c084fc" fontSize="10" fontWeight="bold">旋轉方向 (順時針)</text>
              </g>

              {/* 5. 換向器：兩個半圓形金屬環 S1, S2 與電刷 B1, B2 */}
              <g transform="translate(280, 215)">
                {/* 軸心 */}
                <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />

                {/* 半圓集電環 S1, S2 (隨角度旋轉) */}
                <g transform={`rotate(${motorAngle})`}>
                  <path d="M -12 -3 A 12 12 0 0 1 12 -3 L 10 -3 A 10 10 0 0 0 -10 -3 Z" fill="#f59e0b" />
                  <path d="M 12 3 A 12 12 0 0 1 -12 3 L -10 3 A 10 10 0 0 0 10 3 Z" fill="#d97706" />
                  <text x="-16" y="-5" fill="#f59e0b" fontSize="9" fontWeight="bold">S1</text>
                  <text x="10" y="12" fill="#d97706" fontSize="9" fontWeight="bold">S2</text>
                </g>

                {/* 固定電刷 B1 (左 +極), B2 (右 -極) */}
                <rect x="-20" y="-5" width="6" height="10" fill="#94a3b8" rx="1" />
                <text x="-32" y="3" fill="#ef4444" fontSize="10" fontWeight="bold">B1 (+)</text>

                <rect x="14" y="-5" width="6" height="10" fill="#94a3b8" rx="1" />
                <text x="23" y="3" fill="#3b82f6" fontSize="10" fontWeight="bold">B2 (-)</text>

                {/* 電池 DC 電源迴路 (底部) */}
                <path d="M -17 5 L -17 35 L -8 35 M 17 5 L 17 35 L 8 35" fill="none" stroke="#64748b" strokeWidth="1.5" />
                
                {/* 直流電池符號 */}
                <line x1="-8" y1="28" x2="-8" y2="42" stroke="#ef4444" strokeWidth="2.5" />
                <text x="-14" y="25" fill="#ef4444" fontSize="10" fontWeight="bold">+</text>

                <line x1="-2" y1="32" x2="-2" y2="38" stroke="#3b82f6" strokeWidth="3.5" />
                
                <line x1="4" y1="28" x2="4" y2="42" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="10" y1="32" x2="10" y2="38" stroke="#3b82f6" strokeWidth="3.5" />
                <text x="12" y="25" fill="#3b82f6" fontSize="10" fontWeight="bold">-</text>

                <text x="0" y="54" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">直流電源 E</text>
              </g>
            </svg>

            {/* 物理邏輯講義對照數據卡 */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 w-full mt-3 font-sans">
              <p className="text-rose-300 font-bold flex items-center justify-between">
                <span>🎯 理化講義對照說明（馬達/電動機）：</span>
                <span className="text-amber-400 font-mono">
                  {motorAngle <= 45 || motorAngle >= 315 ? '【初始位置 (0°)】' : motorAngle >= 45 && motorAngle <= 135 ? '【旋轉 90° (垂直點)】' : '【旋轉 180°】'}
                </span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-300 pt-1">
                <p>• 磁場方向 B：<strong className="text-cyan-300">由 N 極向右指向 S 極</strong></p>
                <p>• 電流換向：<strong className="text-amber-300">半圓環 (S1/S2) 每半圈切換一次</strong></p>
                <p>• 電樞旋轉：<strong className="text-purple-300">受磁力矩推動持續順時針旋轉</strong></p>
              </div>
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
          </div>
        </div>
      )}
    </div>
  );
}