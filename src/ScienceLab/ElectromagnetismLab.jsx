import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers, ArrowRight } from 'lucide-react';

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
  const [currentDir, setCurrentDir] = useState('up'); // straight: 'up'|'down'; solenoid: 'cw'|'ccw'

  // ==========================================
  // 2. 右手開掌定則 State
  // ==========================================
  const [bFieldDir, setBFieldDir] = useState('+x'); // +x, -x, +y, -y, +z, -z
  const [iFieldDir, setIFieldDir] = useState('+y'); // +x, -x, +y, -y, +z, -z

  // 計算磁力 F 方向 (外積 I x B)
  const calculateForceDir = (I, B) => {
    if (I[0] === B[0] || (I[0] !== 0 && I[0] === -B[0])) return '平行不拉/不受力';
    
    // 向量對應 [x, y, z]
    const vecMap = {
      '+x': [1, 0, 0], '-x': [-1, 0, 0],
      '+y': [0, 1, 0], '-y': [0, -1, 0],
      '+z': [0, 0, 1], '-z': [0, 0, -1]
    };
    const vI = vecMap[I];
    const vB = vecMap[B];
    
    // Cross Product
    const Fx = vI[1] * vB[2] - vI[2] * vB[1];
    const Fy = vI[2] * vB[0] - vI[0] * vB[2];
    const Fz = vI[0] * vB[1] - vI[1] * vB[0];

    if (Fx === 1) return '+X 軸 (向右)';
    if (Fx === -1) return '-X 軸 (向左)';
    if (Fy === 1) return '+Y 軸 (向上)';
    if (Fy === -1) return '-Y 軸 (向下)';
    if (Fz === 1) return '+Z 軸 (垂直穿出紙面)';
    if (Fz === -1) return '-Z 軸 (垂直穿入紙面)';
    return '不受力 (0)';
  };

  const forceResult = calculateForceDir(iFieldDir, bFieldDir);

  // ==========================================
  // 3. 冷次定律 State
  // ==========================================
  const [sourceType, setSourceType] = useState('magnet'); // 'magnet' | 'wire'
  const [magnetPole, setMagnetPole] = useState('N'); // 'N' | 'S'
  const [actionType, setActionType] = useState('approach'); // 'approach' | 'recede' (磁鐵) or 'strengthen' | 'weaken' (導線)

  // 計算感應磁場極性與感應電流方向
  const getLenzResult = () => {
    let indB = '';
    let indI = '';
    if (sourceType === 'magnet') {
      if (magnetPole === 'N') {
        indB = actionType === 'approach' ? '產生 N 極抵抗 (向左抵抗磁通增加)' : '產生 S 極吸引 (向右抵抗磁通減少)';
        indI = actionType === 'approach' ? '逆時針感應電流 (從左側看)' : '順時針感應電流 (從左側看)';
      } else {
        indB = actionType === 'approach' ? '產生 S 極抵抗 (向左抵抗磁通增加)' : '產生 N 極吸引 (向右抵抗磁通減少)';
        indI = actionType === 'approach' ? '順時針感應電流 (從左側看)' : '逆時針感應電流 (從左側看)';
      }
    } else {
      indB = actionType === 'strengthen' ? '產生反向感應磁場 (抵銷電流增加)' : '產生同向感應磁場 (補充電流減弱)';
      indI = actionType === 'strengthen' ? '產生反向感應電流' : '產生同向感應電流';
    }
    return { indB, indI };
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
            包含安培右手定則、開掌定則受力分析、冷次定律電磁感應與馬達發電機動畫原理
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
                    setCurrentDir(e.target.value === 'straight' ? 'up' : 'cw');
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
                    <option value="cw">順時針 (左視圖/由前方看)</option>
                    <option value="ccw">逆時針 (左視圖/由前方看)</option>
                  </select>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-amber-400 font-bold">
              右手大拇指：{wireType === 'straight' ? '電流方向' : '磁場方向 (N極)'} ｜ 四指彎曲：{wireType === 'straight' ? '磁場方向' : '電流方向'}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
            <svg width="480" height="260" className="select-none font-mono text-[11px]">
              {wireType === 'straight' ? (
                <g>
                  {/* 長直導線 */}
                  <rect x="235" y="30" width="10" height="200" fill="#f59e0b" rx="2" />
                  <text x="240" y="20" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                    {currentDir === 'up' ? '▲ 電流 I (向上)' : '▼ 電流 I (向下)'}
                  </text>

                  {/* 磁力線同心圓 (橢圓呈現立體感) */}
                  {[40, 70, 100].map((r, idx) => (
                    <g key={`circle-${r}`}>
                      <ellipse
                        cx="240"
                        cy="130"
                        rx={r}
                        ry={r * 0.4}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      {/* 磁場切線方向粒子動畫 */}
                      {isRunning && (
                        <circle
                          cx={240 + r * Math.cos(((animOffset * 4 + idx * 30) * Math.PI) / 180 * (currentDir === 'up' ? 1 : -1))}
                          cy={130 + r * 0.4 * Math.sin(((animOffset * 4 + idx * 30) * Math.PI) / 180 * (currentDir === 'up' ? 1 : -1))}
                          r="5"
                          fill="#06b6d4"
                        />
                      )}
                    </g>
                  ))}

                  <text x="360" y="130" fill="#06b6d4" fontSize="11" fontWeight="bold">
                    磁場 B：{currentDir === 'up' ? '俯視為逆時針環形' : '俯視為順時針環形'}
                  </text>
                </g>
              ) : (
                <g>
                  {/* 螺線管 */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path
                      key={`sol-${i}`}
                      d={`M ${140 + i * 40} 80 Q ${160 + i * 40} 180 ${180 + i * 40} 80`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="5"
                    />
                  ))}

                  {/* 內部磁場線 (向左或向右) */}
                  <line x1="80" y1="130" x2="400" y2="130" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)" />
                  <text x="240" y="115" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="bold">
                    內部磁場 B ({currentDir === 'cw' ? '向左 ➔ 左端為 N 極' : '向右 ➔ 右端為 N 極'})
                  </text>

                  {/* 電流粒子動畫 */}
                  {isRunning && [0, 1, 2, 3].map((i) => (
                    <circle
                      key={`sol-el-${i}`}
                      cx={160 + i * 40}
                      cy={130 + 40 * Math.sin(((animOffset * 5) * Math.PI) / 180 * (currentDir === 'cw' ? 1 : -1))}
                      r="5"
                      fill="#f59e0b"
                    />
                  ))}
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
              受力方向 F (掌心推出)：{forceResult}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <div className="text-center space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-cyan-500/50">
                  <span className="text-cyan-400 font-bold block">四指 (磁場 B)</span>
                  <span className="text-white text-sm font-bold">{bFieldDir}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-amber-500/50">
                  <span className="text-amber-400 font-bold block">大拇指 (電流 I)</span>
                  <span className="text-white text-sm font-bold">{iFieldDir}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-emerald-500/50">
                  <span className="text-emerald-400 font-bold block">掌心 (磁力 F)</span>
                  <span className="text-emerald-300 text-sm font-bold">{forceResult}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300 text-left text-[11px] leading-relaxed">
                💡 <strong>右手開掌定則記憶法：</strong>
                <p>1. 右手平展伸直，四指指向 <strong>磁場方向 B</strong>。</p>
                <p>2. 大拇指指向 <strong>導線電流方向 I</strong>。</p>
                <p>3. 手掌心推出的垂直方向即為 <strong>導線受磁力方向 F</strong>（$F = I \cdot L \cdot B \cdot \sin\theta$）。</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. 冷次定律與電磁感應
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
                  <option value="wire">載流導線/線圈</option>
                </select>
              </div>

              {sourceType === 'magnet' ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-bold">磁極：</span>
                    <button
                      onClick={() => setMagnetPole(magnetPole === 'N' ? 'S' : 'N')}
                      className="px-3 py-1 bg-slate-800 text-rose-400 text-xs font-bold rounded-xl border border-slate-700"
                    >
                      {magnetPole} 極向左
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
                    {actionType === 'strengthen' ? '電流加強 (磁場大)' : '電流減弱 (磁場小)'}
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-purple-400 font-bold">
              冷次定律：感應電流永遠抵抗原磁場之變化（來者拒，去者留）
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <svg width="480" height="220" className="select-none font-mono text-[11px]">
              {/* 感應線圈 */}
              <ellipse cx="160" cy="110" rx="30" ry="60" fill="none" stroke="#a855f7" strokeWidth="6" />

              {/* 檢流計 G */}
              <line x1="160" y1="170" x2="160" y2="200" stroke="#a855f7" strokeWidth="2" />
              <circle cx="160" cy="200" r="14" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              <text x="160" y="204" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">G</text>

              {/* 磁鐵 */}
              {sourceType === 'magnet' && (
                <g>
                  <rect x="280" y="90" width="100" height="40" rx="4" fill="#334155" stroke="#ffffff" strokeWidth="1" />
                  <rect x="280" y="90" width="50" height="40" rx="2" fill="#ef4444" />
                  <rect x="330" y="90" width="50" height="40" rx="2" fill="#3b82f6" />
                  <text x="305" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                    {magnetPole === 'N' ? 'N' : 'S'}
                  </text>
                  <text x="355" y="115" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                    {magnetPole === 'N' ? 'S' : 'N'}
                  </text>
                </g>
              )}
            </svg>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1 w-full mt-2">
              <p className="text-purple-300 font-bold">🎯 電磁感應結果剖析：</p>
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
              直流馬達原理：電能 ➔ 機械能（載流線圈在磁場中受力產生力矩順時針/逆時針旋轉）
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <svg width="460" height="220" className="select-none font-mono text-[11px]">
              {/* N/S 磁極 */}
              <rect x="30" y="60" width="60" height="100" rx="4" fill="#ef4444" />
              <text x="60" y="115" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">N</text>

              <rect x="370" y="60" width="60" height="100" rx="4" fill="#3b82f6" />
              <text x="400" y="115" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">S</text>

              {/* 旋轉矩形線圈 */}
              <g transform={`rotate(${(animOffset * 3.6) % 360} 230 110)`}>
                <rect x="150" y="80" width="160" height="60" fill="none" stroke="#f59e0b" strokeWidth="4" rx="4" />
              </g>

              {/* 半環集電環 (Commutator) */}
              <circle cx="230" cy="110" r="16" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="20 10" />
            </svg>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 w-full mt-2">
              <p className="text-rose-400 font-bold">💡 馬達核心考點：</p>
              <p>1. 利用 <strong>右手開掌定則</strong>，線圈左右兩邊電流方向相反，受磁力方向一上一下形成 <strong>力矩</strong>。</p>
              <p>2. <strong>半環轉向器（Commutator）</strong> 每轉動 180° 自動改變電流方向，確保線圈持續向同一方向旋轉。</p>
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
              發電機原理：機械能 ➔ 電能（外力轉動線圈切割磁力線，由冷次定律產生感應電流）
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[280px]">
            <svg width="460" height="220" className="select-none font-mono text-[11px]">
              {/* 正弦波感應電流 AC */}
              <path
                d="M 50 110 Q 100 30 150 110 T 250 110 T 350 110 T 450 110"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* 動態波形光點 */}
              {isRunning && (
                <circle
                  cx={50 + (animOffset * 4) % 400}
                  cy={110 - 50 * Math.sin((((animOffset * 4) % 400) * Math.PI) / 100)}
                  r="6"
                  fill="#f59e0b"
                />
              )}
            </svg>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 w-full mt-2">
              <p className="text-emerald-400 font-bold">💡 發電機核心考點：</p>
              <p>1. 線圈面與磁場垂直時，穿過磁通量最大，但磁通量變化率為 0 ➔ <strong>感應電流 = 0</strong>。</p>
              <p>2. 線圈面與磁場平行時，穿過磁通量為 0，但磁通量變化率最大 ➔ <strong>感應電流達到最大值</strong>。</p>
              <p>3. 交流發電機搭配 <strong>全環集電環</strong>；直流發電機搭配 <strong>半環轉向器</strong>。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}