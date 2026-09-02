import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers, MoveHorizontal, Sliders } from 'lucide-react';

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
  // 3. 冷次定律 State & 雙子分頁控制 (校正冷次定律磁場邏輯)
  // ==========================================
  const [lenzSubTab, setLenzSubTab] = useState('magnet'); // 'magnet' | 'primaryWire'
  
  // 線圈基準原點偏移量
  const offsetX = 40; 

  // 子分頁 1：手動拖曳磁鐵 (-20 ~ 420)
  const [magnetPole, setMagnetPole] = useState('N'); // 'N' | 'S' (左端極性)
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

  // 子分頁 2：主線圈電流控制
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

  // 全方位冷次定律邏輯運算 (包含完全校正後的極性與感應磁場方向)
  const getLenzLogic = () => {
    if (lenzSubTab === 'magnet') {
      const isMoving = Math.abs(velocity) > 15;
      const isMovingLeft = velocity < 0; // true: 向左, false: 向右

      const magnetLeftEdge = magnetX;
      const magnetRightEdge = magnetX + 100;
      const magnetCenter = magnetX + 50;

      // 線圈實際中心點 X 座標
      const coilCenter = 130 + offsetX + 25; // 195
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
      let bDir = 'right'; // 內部感應磁場 (S -> N)
      let frontIUp = true; // 大拇指朝右時，前方導線向上 (▲)
      const speedMagnitude = Math.min(Math.abs(velocity) / 15, 1);

      // A. 磁鐵在線圈右側 (中心點 >= 線圈中心)
      if (magnetCenter >= coilCenter) {
        const facingPole = magnetPole; // 靠近/遠離右端的極性 (左端極性)
        if (isMovingLeft) {
          // 靠近右端：抵抗靠近 -> 右端產生同極
          rightIndPole = facingPole;
          leftIndPole = facingPole === 'N' ? 'S' : 'N';
        } else {
          // 遠離右端：吸引遠離 -> 右端產生異極
          rightIndPole = facingPole === 'N' ? 'S' : 'N';
          leftIndPole = facingPole;
        }
      } 
      // B. 磁鐵在線圈左側 (中心點 < 線圈中心)
      else {
        const facingPole = magnetPole === 'N' ? 'S' : 'N'; // 靠近/遠離左端的極性 (右端極性)
        if (!isMovingLeft) {
          // 向右移動靠近左端：抵抗靠近 -> 左端產生同極
          leftIndPole = facingPole;
          rightIndPole = facingPole === 'N' ? 'S' : 'N';
        } else {
          // 向左移動遠離左端：吸引遠離 -> 左端產生異極
          leftIndPole = facingPole === 'N' ? 'S' : 'N';
          rightIndPole = facingPole;
        }
      }

      // 依線圈內部極性 (S -> N) 確定感應磁場方向與電流手勢
      if (leftIndPole === 'S' && rightIndPole === 'N') {
        bDir = 'right';  // 內部磁場向右
        frontIUp = true; // 大拇指朝右 -> 前方導線電流向上 (▲)
      } else {
        bDir = 'left';   // 內部磁場向左
        frontIUp = false; // 大拇指朝左 -> 前方導線電流向下 (▼)
      }

      // 檢流計偏轉：前方導線向上時，電流繞經右側向下流回檢流計，指針向左偏轉
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
      // 主線圈模式
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
          3. 冷次定律（校正完整物理邏輯）
      ========================================== */}
      {activeTab === 'lenz' && (
        <div className="space-y-6">
          {/* 子分頁導覽列 */}
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

          {/* 控制面板卡片 */}
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
                <span className="text-xs text-slate-400">
                  (改變電流強度帶動主磁場增減，正值為正向電源，負值為反向電源)
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[340px] overflow-x-auto">
            <svg width="660" height="260" className="select-none font-mono text-[11px]">
              {/* ================= 左側：感應螺線管線圈 ================= */}
              <g>
                <text x={170 + offsetX} y="22" textAnchor="middle" fill="#a855f7" fontSize="12" fontWeight="bold">感應螺線管線圈</text>

                {/* 1. 感應線圈後側 (細虛線) */}
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

                {/* 條形磁鐵 */}
                {lenzSubTab === 'magnet' && (
                  <g 
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={handlePointerDown}
                  >
                    <rect x={magnetX} y="90" width="100" height="40" rx="4" fill="#334155" stroke="#ffffff" strokeWidth={isDragging ? '2.5' : '1.5'} />
                    <rect x={magnetX} y="90" width="50" height="40" rx="2" fill={magnetPole === 'N' ? '#3b82f6' : '#ef4444'} />
                    <rect x={magnetX + 50} y="90" width="50" height="40" rx="2" fill={magnetPole === 'N' ? '#ef4444' : '#3b82f6'} />
                    
                    <text x={magnetX + 25} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{magnetPole}</text>
                    <text x={magnetX + 75} y="115" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">{magnetPole === 'N' ? 'S' : 'N'}</text>

                    <g transform={`translate(${magnetX + 38}, 62)`}>
                      <rect x="-4" y="-2" width="32" height="18" rx="4" fill="#0284c7" opacity="0.8" />
                      <text x="12" y="11" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">拖曳</text>
                    </g>

                    {lenzRes.isMoving && (
                      <g>
                        <line
                          x1={lenzRes.moveDir === 'approach' ? magnetX + 75 : magnetX + 25}
                          y1="145"
                          x2={lenzRes.moveDir === 'approach' ? magnetX + 25 : magnetX + 75}
                          y2="145"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                        />
                        <polygon
                          points={
                            lenzRes.moveDir === 'approach'
                              ? `${magnetX + 25},141 ${magnetX + 15},145 ${magnetX + 25},149`
                              : `${magnetX + 75},141 ${magnetX + 85},145 ${magnetX + 75},149`
                          }
                          fill="#38bdf8"
                        />
                      </g>
                    )}
                  </g>
                )}

                {/* 內部感應磁場 B_ind 向量箭頭 */}
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
                    <text x={165 + offsetX} y="98" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">
                      B感應 ({lenzRes.bDir === 'right' ? '向右 →' : '向左 ←'})
                    </text>
                  </g>
                )}

                {/* 2. 感應線圈前側 (粗實線) */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const startX = 90 + offsetX + i * 32;
                  const endX = 120 + offsetX + i * 32;
                  const wireX = startX + 2; 
                  const wireY = 110;

                  return (
                    <g key={`coil-front-${i}`}>
                      <path
                        d={`M ${startX} 70 C ${startX} 170, ${endX} 170, ${endX} 150`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="4.5"
                      />

                      {lenzRes.isMoving && (
                        <g>
                          {lenzRes.frontIUp ? (
                            <polygon
                              points={`${wireX},${wireY - 6} ${wireX - 5},${wireY + 5} ${wireX + 5},${wireY + 5}`}
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="0.8"
                            />
                          ) : (
                            <polygon
                              points={`${wireX},${wireY + 6} ${wireX - 5},${wireY - 5} ${wireX + 5},${wireY - 5}`}
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="0.8"
                            />
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 3. 底部迴路與檢流計 */}
                <path
                  d={`M ${90 + offsetX} 135 L ${90 + offsetX} 200 L ${140 + offsetX} 200 M ${190 + offsetX} 200 L ${248 + offsetX} 200 L ${248 + offsetX} 135`}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                />

                {/* 檢流計迴路感應電流箭頭 */}
                {lenzRes.isMoving && (
                  <g>
                    {lenzRes.frontIUp ? (
                      <>
                        <polygon points={`${90 + offsetX},158 ${85 + offsetX},168 ${95 + offsetX},168`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${120 + offsetX},200 ${110 + offsetX},195 ${110 + offsetX},205`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${220 + offsetX},200 ${210 + offsetX},195 ${210 + offsetX},205`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${248 + offsetX},158 ${243 + offsetX},168 ${253 + offsetX},168`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                      </>
                    ) : (
                      <>
                        <polygon points={`${90 + offsetX},172 ${85 + offsetX},162 ${95 + offsetX},162`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${110 + offsetX},200 ${120 + offsetX},195 ${120 + offsetX},205`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${210 + offsetX},200 ${220 + offsetX},195 ${220 + offsetX},205`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                        <polygon points={`${248 + offsetX},172 ${243 + offsetX},162 ${253 + offsetX},162`} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                      </>
                    )}
                  </g>
                )}

                {/* 下方檢流計 (G) */}
                <circle cx={165 + offsetX} cy="200" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text x={165 + offsetX} y="204" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">G</text>
                
                <line
                  x1={165 + offsetX}
                  y1="200"
                  x2={165 + offsetX + 12 * Math.sin((lenzRes.needleAngle * Math.PI) / 180)}
                  y2={200 - 12 * Math.cos((lenzRes.needleAngle * Math.PI) / 180)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* 線圈兩端極性 */}
                {lenzRes.isMoving && (
                  <g>
                    <text x={45 + offsetX} y="115" textAnchor="middle" fill={lenzRes.leftIndPole === 'N' ? '#3b82f6' : '#ef4444'} fontSize="18" fontWeight="bold">
                      {lenzRes.leftIndPole}
                    </text>
                    <text x={275 + offsetX} y="115" textAnchor="middle" fill={lenzRes.rightIndPole === 'N' ? '#3b82f6' : '#ef4444'} fontSize="18" fontWeight="bold">
                      {lenzRes.rightIndPole}
                    </text>
                  </g>
                )}

                {/* 4. 動態感應電流黃色粒子 */}
                {isRunning && lenzRes.isMoving && [0, 1, 2, 3, 4].map((i) => {
                  const dir = lenzRes.frontIUp ? 1 : -1;
                  const t = (animOffset * 5 + i * 72) * Math.PI / 180;
                  const cx = 105 + offsetX + i * 32 + 15 * Math.cos(t);
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

              {/* ================= 右側：載流主線圈 (僅在實驗二顯示) ================= */}
              {lenzSubTab === 'primaryWire' && (
                <g>
                  <text x={430 + offsetX} y="22" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                    主線圈 (載流螺線管)
                  </text>

                  {/* 1. 主線圈後側 */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path
                      key={`primary-back-${i}`}
                      d={`M ${380 + offsetX + i * 28} 150 C ${380 + offsetX + i * 28} 50, ${355 + offsetX + i * 28} 50, ${355 + offsetX + i * 28} 70`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      opacity="0.5"
                    />
                  ))}

                  {/* 內部主磁場向量標示 */}
                  {primaryCurrent !== 0 && (
                    <g>
                      <line
                        x1={primaryCurrent > 0 ? 330 + offsetX : 510 + offsetX}
                        y1="110"
                        x2={primaryCurrent > 0 ? 510 + offsetX : 330 + offsetX}
                        y2="110"
                        stroke="#f59e0b"
                        strokeWidth={Math.min(Math.abs(primaryCurrent) / 20 + 1.5, 5)}
                      />
                      <polygon
                        points={
                          primaryCurrent > 0
                            ? `${510 + offsetX},105 ${522 + offsetX},110 ${510 + offsetX},115`
                            : `${330 + offsetX},105 ${318 + offsetX},110 ${330 + offsetX},115`
                        }
                        fill="#f59e0b"
                      />
                      <text x={420 + offsetX} y="98" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                        B主 ({primaryCurrent > 0 ? '向右 →' : '向左 ←'})
                      </text>
                    </g>
                  )}

                  {/* 2. 主線圈前側 */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const wireX = 357 + offsetX + i * 28;
                    const wireY = 110;

                    return (
                      <g key={`primary-front-${i}`}>
                        <path
                          d={`M ${355 + offsetX + i * 28} 70 C ${355 + offsetX + i * 28} 170, ${380 + offsetX + i * 28} 170, ${380 + offsetX + i * 28} 150`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={Math.min(Math.abs(primaryCurrent) / 20 + 2, 5)}
                        />

                        {primaryCurrent !== 0 && (
                          <g>
                            {primaryCurrent > 0 ? (
                              <polygon
                                points={`${wireX},${wireY - 6} ${wireX - 5},${wireY + 5} ${wireX + 5},${wireY + 5}`}
                                fill="#eab308"
                                stroke="#ffffff"
                                strokeWidth="0.8"
                              />
                            ) : (
                              <polygon
                                points={`${wireX},${wireY + 6} ${wireX - 5},${wireY - 5} ${wireX + 5},${wireY - 5}`}
                                fill="#eab308"
                                stroke="#ffffff"
                                strokeWidth="0.8"
                              />
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}

                  <text x={325 + offsetX} y="115" textAnchor="middle" fill={primaryCurrent >= 0 ? '#ef4444' : '#3b82f6'} fontSize="16" fontWeight="bold">
                    {primaryCurrent >= 0 ? 'S' : 'N'}
                  </text>
                  <text x={515 + offsetX} y="115" textAnchor="middle" fill={primaryCurrent >= 0 ? '#3b82f6' : '#ef4444'} fontSize="16" fontWeight="bold">
                    {primaryCurrent >= 0 ? 'N' : 'S'}
                  </text>

                  {/* 3. 下方直流電源迴路 */}
                  <g transform={`translate(${offsetX}, 5)`}>
                    <path
                      d="M 355 135 L 355 210 L 400 210 M 460 210 L 508 210 L 508 135"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />

                    <g transform="translate(430, 210)">
                      {primaryCurrent >= 0 ? (
                        <>
                          <line x1="-12" y1="-14" x2="-12" y2="14" stroke="#ef4444" strokeWidth="3" />
                          <text x="-20" y="-16" fill="#ef4444" fontSize="11" fontWeight="bold">+</text>

                          <line x1="-2" y1="-8" x2="-2" y2="8" stroke="#3b82f6" strokeWidth="4.5" />
                          <text x="4" y="-16" fill="#3b82f6" fontSize="11" fontWeight="bold">-</text>

                          <line x1="8" y1="-12" x2="8" y2="12" stroke="#64748b" strokeWidth="2" />
                          <line x1="16" y1="-12" x2="16" y2="12" stroke="#64748b" strokeWidth="2" />
                        </>
                      ) : (
                        <>
                          <line x1="-12" y1="-8" x2="-12" y2="8" stroke="#3b82f6" strokeWidth="4.5" />
                          <text x="-20" y="-16" fill="#3b82f6" fontSize="11" fontWeight="bold">-</text>

                          <line x1="-2" y1="-14" x2="-2" y2="14" stroke="#ef4444" strokeWidth="3" />
                          <text x="4" y="-16" fill="#ef4444" fontSize="11" fontWeight="bold">+</text>

                          <line x1="8" y1="-12" x2="8" y2="12" stroke="#64748b" strokeWidth="2" />
                          <line x1="16" y1="-12" x2="16" y2="12" stroke="#64748b" strokeWidth="2" />
                        </>
                      )}
                      <text x="2" y="26" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">DC 電源</text>
                    </g>

                    {primaryCurrent !== 0 && (
                      <g>
                        {primaryCurrent > 0 ? (
                          <>
                            <polygon points="355,160 350,170 360,170" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="375,210 385,205 385,215" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="485,210 495,205 495,215" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="508,180 503,170 513,170" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                          </>
                        ) : (
                          <>
                            <polygon points="355,180 350,170 360,170" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="385,210 375,205 375,215" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="495,210 485,205 485,215" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                            <polygon points="508,160 503,170 513,170" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
                          </>
                        )}
                      </g>
                    )}
                  </g>

                  {/* 4. 主線圈動態粒子 */}
                  {isRunning && primaryCurrent !== 0 && [0, 1, 2, 3, 4].map((i) => {
                    const dir = primaryCurrent > 0 ? 1 : -1;
                    const t = (animOffset * (Math.abs(primaryCurrent) / 15) + i * 72) * Math.PI / 180;
                    const cx = 367 + offsetX + i * 28 + 12 * Math.cos(t);
                    const cy = 110 + dir * 40 * Math.sin(t);
                    const isFront = cy >= 105;

                    return (
                      <circle
                        key={`pri-p-${i}`}
                        cx={cx}
                        cy={cy}
                        r={isFront ? '4.5' : '3'}
                        fill={isFront ? '#fbbf24' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity={isFront ? 1 : 0.6}
                      />
                    );
                  })}
                </g>
              )}
            </svg>

            {/* 下方數據說明 */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 w-full mt-2 font-sans">
              <p className="text-purple-300 font-bold flex items-center justify-between">
                <span>🎯 電磁感應實驗狀態：</span>
                <span className={lenzRes.isMoving ? 'text-emerald-400 font-mono' : 'text-slate-400 font-mono'}>
                  {lenzRes.isMoving ? '⚡ 電磁感應發生中' : '⏸ 磁通量無變化'}
                </span>
              </p>
              <p className="text-slate-300">• 感應磁場：<strong className="text-cyan-300">{lenzRes.indB}</strong></p>
              <p className="text-slate-300">• 感應電流：<strong className="text-amber-300">{lenzRes.indI}</strong></p>
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