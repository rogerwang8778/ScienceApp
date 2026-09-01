import React, { useState, useRef } from 'react';
import { Eye, Sun, Compass, Plus, Trash2, RotateCw, Sparkles } from 'lucide-react';

export default function OpticsLab({ onAddExp }) {
  const [activeSubTab, setActiveSubTab] = useState('lens'); //預設切換至透鏡 tab 方便測試

  // 1. 針孔成像 State
  const [candleHeight, setCandleHeight] = useState(40); // 物高 h1
  const [distObjPinhole, setDistObjPinhole] = useState(120); // 物距 d1
  const [distPinholeScreen, setDistPinholeScreen] = useState(120); // 像距 d2

  // 2. 面鏡成像 State
  const [mirrorType, setMirrorType] = useState('flat'); // 'flat' | 'convex' | 'concave'
  const [mirrorObjDist, setMirrorObjDist] = useState(100); // 物距 p
  const [mirrorRotation, setMirrorRotation] = useState(0); // 面鏡旋轉角度 (-30 ~ +30度)

  // 3. 透鏡成像 State
  const [lensType, setLensType] = useState('convex'); // 'convex' | 'concave'
  const [focalLength, setFocalLength] = useState(60); // 焦距 f
  const [objectDist, setObjectDist] = useState(130); // 物距 p

  // 4. 自由模式 State
  const [freeRayCount, setFreeRayCount] = useState(5); // 雷射光束數量
  const [freeSourceY, setFreeSourceY] = useState(120); // 光源 Y 軸中心
  const [freeSourceAngle, setFreeSourceAngle] = useState(0); // 入射角度 (-30 ~ 30)
  const [freeElements, setFreeElements] = useState([
    { id: 'elem-1', type: 'convex_lens', x: 170, y: 120, angle: 0, f: 60, size: 80 },
    { id: 'elem-2', type: 'concave_mirror', x: 320, y: 120, angle: 0, f: 70, size: 80 }
  ]);
  const [selectedElemId, setSelectedElemId] = useState('elem-1');
  const [draggingElemId, setDraggingElemId] = useState(null);
  const svgRef = useRef(null);

  // --- 針孔像高計算 ---
  const safeDistObj = distObjPinhole || 1;
  const imageScale = distPinholeScreen / safeDistObj;
  const pinholeImageHeight = (candleHeight * imageScale).toFixed(1);

  // --- 面鏡成像數值計算 ---
  const getMirrorCalculations = () => {
    const p = mirrorObjDist;
    const h1 = 40;
    const fm = 60;

    if (mirrorType === 'flat') {
      return { p, q: p, h1, h2: h1, m: 1.0, isReal: false, isNoImage: false, desc: '正立等大虛像 (像距 q = 物距 p)' };
    } else if (mirrorType === 'convex') {
      const q = (p * fm) / (p + fm);
      const m = q / p;
      const h2 = h1 * m;
      return { p, q, h1, h2, m, isReal: false, isNoImage: false, desc: '正立縮小虛像 (發散光延伸線相交)' };
    } else {
      if (Math.abs(p - fm) < 2) {
        return { p, q: Infinity, h1, h2: Infinity, m: Infinity, isReal: false, isNoImage: true, desc: '不成像 (物在焦點上，反射光平行)' };
      } else if (p > fm) {
        const q = (p * fm) / (p - fm);
        const m = q / p;
        const h2 = h1 * m;
        return { p, q, h1, h2, m, isReal: true, isNoImage: false, desc: '倒立實像 (反射光線實際相交)' };
      } else {
        const q = (p * fm) / (fm - p);
        const m = fm / (fm - p);
        const h2 = h1 * m;
        return { p, q, h1, h2, m, isReal: false, isNoImage: false, desc: '正立放大虛像 (焦距內發散光鏡後延長會聚)' };
      }
    }
  };

  const mirrorCalc = getMirrorCalculations();

  // --- 透鏡成像數值計算 (修正精確物理邏輯) ---
  const getLensCalculations = () => {
    const p = objectDist;
    const f = focalLength;
    const h1 = 40;

    if (lensType === 'concave') {
      const absQ = (f * p) / (p + f);
      const m = absQ / p;
      const h2 = h1 * m;
      return {
        p,
        q: -absQ,
        absQ,
        h1,
        h2,
        m,
        isReal: false,
        isInverted: false,
        desc: '正立縮小虛像 (發散透鏡，近視眼鏡)',
        color: 'text-amber-400'
      };
    } else {
      if (Math.abs(p - f) < 1) {
        return { p, q: Infinity, absQ: Infinity, h1, h2: Infinity, m: Infinity, isReal: false, isInverted: false, desc: '不成像 (折射光平行無焦點)', color: 'text-slate-400' };
      }

      const q = (f * p) / (p - f);
      const absQ = Math.abs(q);
      const m = absQ / p;
      const h2 = h1 * m;

      if (p > f) {
        let desc = '倒立縮小實像 (像在 f ~ 2f 之間)';
        if (Math.abs(p - 2 * f) <= 5) desc = '倒立等大實像 (像在 2f 上)';
        else if (p < 2 * f) desc = '倒立放大實像 (像在 2f 外，投影機)';
        return { p, q, absQ, h1, h2, m, isReal: true, isInverted: true, desc, color: 'text-emerald-400' };
      } else {
        return { p, q, absQ, h1, h2, m, isReal: false, isInverted: false, desc: '正立放大虛像 (物在 f 內，放大鏡原理)', color: 'text-cyan-400' };
      }
    }
  };

  const lensCalc = getLensCalculations();

  // --- 自由模式 2D 光線追蹤引擎 ---
  const traceFreeRays = () => {
    const rays = [];
    const count = freeRayCount;
    const startY = freeSourceY;
    const spacing = 18;
    const startX = 20;
    const initRad = (freeSourceAngle * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spacing;
      let currP = {
        x: startX - offset * Math.sin(initRad),
        y: startY + offset * Math.cos(initRad)
      };
      let currAngle = initRad;
      const pathPoints = [{ ...currP }];

      let bounces = 0;
      const maxBounces = 7;

      while (bounces < maxBounces) {
        const vx = Math.cos(currAngle);
        const vy = Math.sin(currAngle);

        let closestHit = null;
        let minT = Infinity;

        for (const elem of freeElements) {
          const elemRad = (elem.angle * Math.PI) / 180;
          const size = elem.size || 80;
          const sx = -Math.sin(elemRad);
          const sy = Math.cos(elemRad);

          const Ax = elem.x - (size / 2) * sx;
          const Ay = elem.y - (size / 2) * sy;
          const Bx = elem.x + (size / 2) * sx;
          const By = elem.y + (size / 2) * sy;

          const Dx = Bx - Ax;
          const Dy = By - Ay;
          const denom = vx * Dy - vy * Dx;

          if (Math.abs(denom) > 1e-6) {
            const t = ((Ax - currP.x) * Dy - (Ay - currP.y) * Dx) / denom;
            const s = ((Ax - currP.x) * vy - (Ay - currP.y) * vx) / denom;

            if (t > 0.01 && s >= 0 && s <= 1) {
              if (t < minT) {
                minT = t;
                closestHit = { x: currP.x + t * vx, y: currP.y + t * vy, s, elem };
              }
            }
          }
        }

        if (closestHit) {
          pathPoints.push({ x: closestHit.x, y: closestHit.y });
          currP = { x: closestHit.x, y: closestHit.y };

          const elem = closestHit.elem;
          const elemRad = (elem.angle * Math.PI) / 180;
          const normal = { x: Math.cos(elemRad), y: Math.sin(elemRad) };
          const surface = { x: -Math.sin(elemRad), y: Math.cos(elemRad) };

          if (elem.type === 'flat_mirror') {
            const dot = vx * normal.x + vy * normal.y;
            const rx = vx - 2 * dot * normal.x;
            const ry = vy - 2 * dot * normal.y;
            currAngle = Math.atan2(ry, rx);
          } else if (elem.type === 'convex_mirror' || elem.type === 'concave_mirror') {
            const h = (closestHit.x - elem.x) * surface.x + (closestHit.y - elem.y) * surface.y;
            const f = elem.f || 60;
            const dotN = vx * normal.x + vy * normal.y;
            const dirSign = dotN >= 0 ? 1 : -1;

            let alpha = h / (2 * f);
            if (elem.type === 'convex_mirror') alpha = -alpha;
            alpha = alpha * dirSign;

            const normAngle = Math.atan2(normal.y, normal.x) + alpha;
            const nx = Math.cos(normAngle);
            const ny = Math.sin(normAngle);

            const dot = vx * nx + vy * ny;
            const rx = vx - 2 * dot * nx;
            const ry = vy - 2 * dot * ny;
            currAngle = Math.atan2(ry, rx);
          } else if (elem.type === 'convex_lens' || elem.type === 'concave_lens') {
            const h = (closestHit.x - elem.x) * surface.x + (closestHit.y - elem.y) * surface.y;
            const f = elem.f || 70;
            const dotN = vx * normal.x + vy * normal.y;
            const dirSign = dotN >= 0 ? 1 : -1;

            let delta = Math.atan2(h, f);
            if (elem.type === 'convex_lens') delta = -delta;

            currAngle = currAngle + delta * dirSign;
          }
          bounces++;
        } else {
          pathPoints.push({
            x: currP.x + Math.cos(currAngle) * 500,
            y: currP.y + Math.sin(currAngle) * 500
          });
          break;
        }
      }
      rays.push(pathPoints);
    }
    return rays;
  };

  // --- 自由模式互動事件 ---
  const addFreeElement = (type) => {
    const newElem = {
      id: `elem-${Date.now()}`,
      type,
      x: 220,
      y: 120,
      angle: type === 'flat_mirror' ? 45 : 0,
      f: 60,
      size: 80
    };
    setFreeElements([...freeElements, newElem]);
    setSelectedElemId(newElem.id);
  };

  const deleteFreeElement = (id) => {
    setFreeElements(freeElements.filter(e => e.id !== id));
    if (selectedElemId === id) setSelectedElemId(null);
  };

  const handlePointerDown = (id, e) => {
    e.stopPropagation();
    setSelectedElemId(id);
    setDraggingElemId(id);
  };

  const handlePointerMove = (e) => {
    if (!draggingElemId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = Math.max(30, Math.min(420, ((e.clientX - rect.left) / rect.width) * 450));
    const svgY = Math.max(30, Math.min(210, ((e.clientY - rect.top) / rect.height) * 240));

    setFreeElements(freeElements.map(elem =>
      elem.id === draggingElemId ? { ...elem, x: Math.round(svgX), y: Math.round(svgY) } : elem
    ));
  };

  const handlePointerUp = () => {
    setDraggingElemId(null);
  };

  const selectedElem = freeElements.find(e => e.id === selectedElemId);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400"/>
          理化實驗室：幾何光學與透鏡鏡面 (Optics Lab)
        </h2>
        <p className="text-xs text-slate-400 mt-1">模擬光線反射與折射路徑，支援物距、像距、物高、像高數據動態標註與光學計算</p>
      </div>

      {/* 子選單切換 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('pinhole')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'pinhole' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5"/> 針孔成像 (光的直線傳播)
        </button>
        <button
          onClick={() => setActiveSubTab('mirror')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'mirror' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Compass className="w-3.5 h-3.5"/> 面鏡成像與反射旋轉
        </button>
        <button
          onClick={() => setActiveSubTab('lens')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'lens' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Sun className="w-3.5 h-3.5"/> 透鏡成像 (含 2F / F 特徵點)
        </button>
        <button
          onClick={() => setActiveSubTab('free')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeSubTab === 'free' ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300"/> 自由光路模式 (多元件探索)
        </button>
      </div>

      {/* 1. 針孔成像區塊 */}
      {activeSubTab === 'pinhole' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-amber-300 border-b border-slate-800 pb-2">針孔成像變因調控</h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">物體高度 (物高 h₁)</span>
                <span className="text-amber-400 font-bold">{candleHeight} px</span>
              </div>
              <input
                type="range" min="20" max="60" step="2"
                value={candleHeight}
                onChange={(e) => setCandleHeight(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">蠟燭到針孔距離 (物距 d₁)</span>
                <span className="text-amber-400 font-bold">{distObjPinhole} px</span>
              </div>
              <input
                type="range" min="60" max="180" step="5"
                value={distObjPinhole}
                onChange={(e) => setDistObjPinhole(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">針孔到紙屏距離 (像距 d₂)</span>
                <span className="text-amber-400 font-bold">{distPinholeScreen} px</span>
              </div>
              <input
                type="range" min="60" max="180" step="5"
                value={distPinholeScreen}
                onChange={(e) => setDistPinholeScreen(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">幾何相似三角形公式：</span>
                <span className="text-amber-300 font-mono font-bold">h₁ / h₂ = d₁ / d₂</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-slate-800">
                <span className="text-slate-300">紙屏上計算像高 (h₂)：</span>
                <span className="text-emerald-400 font-bold">{pinholeImageHeight} px</span>
              </div>
              <p className="text-emerald-400 font-bold text-[11px]">成像性質：上下顛倒、左右相反的「倒立實像」</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              <line x1="10" y1="120" x2="440" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

              <line x1="200" y1="20" x2="200" y2="116" stroke="#94a3b8" strokeWidth="4" />
              <line x1="200" y1="124" x2="200" y2="210" stroke="#94a3b8" strokeWidth="4" />
              <text x="200" y="222" textAnchor="middle" fill="#94a3b8" fontSize="10">針孔板</text>

              {(() => {
                const screenX = 200 + distPinholeScreen;
                const candleX = 200 - distObjPinhole;
                const candleTopY = 120 - candleHeight;
                const imgBottomY = 120 + parseFloat(pinholeImageHeight);

                return (
                  <g>
                    <line x1={screenX} y1="20" x2={screenX} y2="210" stroke="#38bdf8" strokeWidth="3" strokeDasharray="3 2" />
                    <text x={screenX} y="222" textAnchor="middle" fill="#38bdf8" fontSize="10">紙屏</text>

                    <rect x={candleX - 4} y="120" width="8" height="35" fill="#f1f5f9" />
                    <path d={`M ${candleX} 120 Q ${candleX - 6} ${candleTopY + 8} ${candleX} ${candleTopY} Q ${candleX + 6} ${candleTopY + 8} ${candleX} 120`} fill="#f59e0b" />

                    <path d={`M ${screenX} 120 Q ${screenX + 6} ${imgBottomY - 8} ${screenX} ${imgBottomY} Q ${screenX - 6} ${imgBottomY - 8} ${screenX} 120`} fill="#f59e0b" opacity="0.8" />

                    <line x1={candleX} y1={candleTopY} x2={screenX} y2={imgBottomY} stroke="#fbbf24" strokeWidth="1.5" />
                    <line x1={candleX} y1="120" x2={screenX} y2="120" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />

                    <line x1={candleX - 12} y1="120" x2={candleX - 12} y2={candleTopY} stroke="#f59e0b" strokeWidth="1.2" />
                    <text x={candleX - 16} y={120 - candleHeight / 2} textAnchor="end" fill="#f59e0b" fontSize="10" fontWeight="bold">物高 h₁ ({candleHeight})</text>

                    <line x1={screenX + 12} y1="120" x2={screenX + 12} y2={imgBottomY} stroke="#10b981" strokeWidth="1.2" />
                    <text x={screenX + 16} y={120 + parseFloat(pinholeImageHeight) / 2} textAnchor="start" fill="#10b981" fontSize="10" fontWeight="bold">像高 h₂ ({pinholeImageHeight})</text>

                    <line x1={candleX} y1="175" x2="200" y2="175" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x={(candleX + 200) / 2} y="190" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">物距 d₁ ({distObjPinhole})</text>

                    <line x1="200" y1="175" x2={screenX} y2="175" stroke="#a855f7" strokeWidth="1.2" />
                    <text x={(200 + screenX) / 2} y="190" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">像距 d₂ ({distPinholeScreen})</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* 2. 面鏡成像區塊 */}
      {activeSubTab === 'mirror' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-amber-300 border-b border-slate-800 pb-2">面鏡種類與旋轉效果</h3>

            <div>
              <span className="text-xs text-slate-300 block mb-2">選擇面鏡型式</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'flat', name: '平面鏡' },
                  { id: 'convex', name: '凸面鏡 (發散)' },
                  { id: 'concave', name: '凹面鏡 (會聚)' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setMirrorType(item.id)}
                    className={`py-2 px-2 text-xs rounded-xl border transition-all ${
                      mirrorType === item.id
                        ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">物體到面鏡距離 (物距 p)</span>
                <span className="text-amber-400 font-bold">{mirrorObjDist} px</span>
              </div>
              <input
                type="range" min="60" max="180" step="5"
                value={mirrorObjDist}
                onChange={(e) => setMirrorObjDist(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">面鏡旋轉角度 (鏡面傾斜)</span>
                <span className="text-cyan-400 font-bold">{mirrorRotation}°</span>
              </div>
              <input
                type="range" min="-30" max="30" step="1"
                value={mirrorRotation}
                onChange={(e) => setMirrorRotation(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* 即時幾何數據統計面板 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-slate-800 pb-1.5">
                <Compass className="w-3.5 h-3.5"/> 即時光學數據彙整
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">物高 (h₁)：</span>
                  <span className="text-amber-300 font-bold">{mirrorCalc.h1} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">物距 (p)：</span>
                  <span className="text-amber-300 font-bold">{mirrorCalc.p} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">像高 (h₂)：</span>
                  <span className="text-emerald-400 font-bold">
                    {mirrorCalc.isNoImage ? '∞' : `${(mirrorCalc.h2 || 0).toFixed(1)} px`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">像距 (q)：</span>
                  <span className="text-emerald-400 font-bold">
                    {mirrorCalc.isNoImage ? '∞' : `${(mirrorCalc.q || 0).toFixed(1)} px`}
                  </span>
                </div>
                <div className="flex justify-between col-span-2 pt-1 border-t border-slate-900">
                  <span className="text-slate-400">放大率 (m = h₂/h₁ = q/p)：</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {mirrorCalc.isNoImage ? '∞' : `${(mirrorCalc.m || 0).toFixed(2)} 倍`}
                  </span>
                </div>
              </div>
              <p className="text-cyan-300 font-bold text-[11px] pt-1 border-t border-slate-800">
                ✔ {mirrorCalc.desc}
              </p>
            </div>
          </div>

          {/* 右側：面鏡 SVG 成像繪圖區 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              <line x1="10" y1="120" x2="440" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

              <g transform={`rotate(${mirrorRotation}, 250, 120)`}>
                {mirrorType === 'flat' && <line x1="250" y1="40" x2="250" y2="200" stroke="#38bdf8" strokeWidth="4" />}
                {mirrorType === 'convex' && <path d="M 258 40 Q 242 120 258 200" fill="none" stroke="#38bdf8" strokeWidth="4" />}
                {mirrorType === 'concave' && <path d="M 242 40 Q 258 120 242 200" fill="none" stroke="#38bdf8" strokeWidth="4" />}
              </g>

              {(() => {
                const mirrorX = 250;
                const mirrorY = 120;
                const objX = mirrorX - mirrorObjDist;
                const objH = 40;
                const objTopY = mirrorY - objH;

                const rad = (mirrorRotation * Math.PI) / 180;
                const cosR = Math.cos(rad);
                const sinR = Math.sin(rad);

                const O_top = { x: objX, y: objTopY };
                const O_base = { x: objX, y: mirrorY };

                const toLocal = (p) => ({
                  u: (p.x - mirrorX) * cosR + (p.y - mirrorY) * sinR,
                  v: -(p.x - mirrorX) * sinR + (p.y - mirrorY) * cosR
                });

                const toWorld = (p) => ({
                  x: mirrorX + p.u * cosR - p.v * sinR,
                  y: mirrorY + p.u * sinR + p.v * cosR
                });

                const locTop = toLocal(O_top);
                const locBase = toLocal(O_base);
                const p = -locTop.u;

                let imgTopWorld = { x: 0, y: 0 };
                let imgBaseWorld = { x: 0, y: 0 };
                let isReal = false;
                let isNoImage = false;
                let locF, hitPoint1Local;
                const fm = 60;
                let absQ = p;
                let imgH = objH;

                if (mirrorType === 'flat') {
                  const locImgTop = { u: p, v: locTop.v };
                  const locImgBase = { u: p, v: locBase.v };
                  imgTopWorld = toWorld(locImgTop);
                  imgBaseWorld = toWorld(locImgBase);
                  hitPoint1Local = { u: 0, v: locTop.v };
                  absQ = p;
                  imgH = objH;
                } else if (mirrorType === 'convex') {
                  locF = { u: fm, v: 0 };
                  const q = (p * fm) / (p + fm);
                  absQ = q;
                  const m = fm / (p + fm);
                  imgH = objH * m;
                  const locImgTop = { u: q, v: locTop.v * m };
                  const locImgBase = { u: q, v: locBase.v * m };
                  imgTopWorld = toWorld(locImgTop);
                  imgBaseWorld = toWorld(locImgBase);
                  hitPoint1Local = { u: -6, v: locTop.v };
                } else {
                  locF = { u: -fm, v: 0 };
                  if (Math.abs(p - fm) < 2) {
                    isNoImage = true;
                    hitPoint1Local = { u: 6, v: locTop.v };
                  } else if (p > fm) {
                    isReal = true;
                    const q = (p * fm) / (p - fm);
                    absQ = q;
                    const m = q / p;
                    imgH = objH * m;
                    const locImgTop = { u: -q, v: -locTop.v * m };
                    const locImgBase = { u: -q, v: -locBase.v * m };
                    imgTopWorld = toWorld(locImgTop);
                    imgBaseWorld = toWorld(locImgBase);
                    hitPoint1Local = { u: 6, v: locTop.v };
                  } else {
                    const q = (p * fm) / (fm - p);
                    absQ = q;
                    const m = fm / (fm - p);
                    imgH = objH * m;
                    const locImgTop = { u: q, v: locTop.v * m };
                    const locImgBase = { u: q, v: locBase.v * m };
                    imgTopWorld = toWorld(locImgTop);
                    imgBaseWorld = toWorld(locImgBase);
                    hitPoint1Local = { u: 6, v: locTop.v };
                  }
                }

                const hit1World = toWorld(hitPoint1Local);
                const centerWorld = { x: mirrorX, y: mirrorY };
                const worldF = locF ? toWorld(locF) : null;

                const getArrowAngle = (base, top) => {
                  const ax = top.x - base.x;
                  const ay = top.y - base.y;
                  return (Math.atan2(ay, ax) * 180) / Math.PI + 90;
                };

                return (
                  <g>
                    {/* 焦點 F */}
                    {worldF && (
                      <g>
                        <circle cx={worldF.x} cy={worldF.y} r="3" fill="#f59e0b" />
                        <text x={worldF.x} y={worldF.y + 15} textAnchor="middle" fill="#f59e0b" fontSize="9">
                          F ({mirrorType === 'convex' ? '鏡後' : '鏡前'})
                        </text>
                      </g>
                    )}

                    {/* 物體箭頭 */}
                    <line x1={O_base.x} y1={O_base.y} x2={O_top.x} y2={O_top.y} stroke="#38bdf8" strokeWidth="3" />
                    <polygon points={`${O_top.x},${O_top.y - 6} ${O_top.x - 4},${O_top.y + 2} ${O_top.x + 4},${O_top.y + 2}`} fill="#38bdf8" />
                    <text x={O_base.x} y={O_base.y + 15} textAnchor="middle" fill="#38bdf8" fontSize="10">物體</text>

                    {/* 物長 h1 標註 */}
                    <line x1={O_base.x - 10} y1="120" x2={O_base.x - 10} y2={O_top.y} stroke="#f59e0b" strokeWidth="1.2" />
                    <text x={O_base.x - 14} y="100" textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="bold">物長 h₁ (40)</text>

                    {/* 物距 p 標註 */}
                    <line x1={O_base.x} y1="175" x2="250" y2="175" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x={(O_base.x + 250) / 2} y="190" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">物距 p ({mirrorObjDist})</text>

                    {!isNoImage && (
                      <g>
                        {/* 光線路徑 */}
                        <line x1={O_top.x} y1={O_top.y} x2={hit1World.x} y2={hit1World.y} stroke="#fbbf24" strokeWidth="1.5" />
                        <line x1={O_top.x} y1={O_top.y} x2={centerWorld.x} y2={centerWorld.y} stroke="#10b981" strokeWidth="1.5" />

                        {isReal ? (
                          <g>
                            <line x1={hit1World.x} y1={hit1World.y} x2={imgTopWorld.x} y2={imgTopWorld.y} stroke="#fbbf24" strokeWidth="1.5" />
                            <line x1={centerWorld.x} y1={centerWorld.y} x2={imgTopWorld.x} y2={imgTopWorld.y} stroke="#10b981" strokeWidth="1.5" />
                          </g>
                        ) : (
                          <g>
                            <line x1={hit1World.x} y1={hit1World.y} x2={imgTopWorld.x} y2={imgTopWorld.y} stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 3" />
                            {(() => {
                              const vx = hit1World.x - imgTopWorld.x;
                              const vy = hit1World.y - imgTopWorld.y;
                              const len = Math.hypot(vx, vy) || 1;
                              return (
                                <line x1={hit1World.x} y1={hit1World.y} x2={hit1World.x + (vx / len) * 120} y2={hit1World.y + (vy / len) * 120} stroke="#fbbf24" strokeWidth="1.5" />
                              );
                            })()}

                            <line x1={centerWorld.x} y1={centerWorld.y} x2={imgTopWorld.x} y2={imgTopWorld.y} stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 3" />
                            {(() => {
                              const vx = centerWorld.x - imgTopWorld.x;
                              const vy = centerWorld.y - imgTopWorld.y;
                              const len = Math.hypot(vx, vy) || 1;
                              return (
                                <line x1={centerWorld.x} y1={centerWorld.y} x2={centerWorld.x + (vx / len) * 120} y2={centerWorld.y + (vy / len) * 120} stroke="#10b981" strokeWidth="1.5" />
                              );
                            })()}
                          </g>
                        )}

                        {/* 成像箭頭與標籤 */}
                        <g>
                          <line
                            x1={imgBaseWorld.x} y1={imgBaseWorld.y}
                            x2={imgTopWorld.x} y2={imgTopWorld.y}
                            stroke={isReal ? "#10b981" : "#c084fc"}
                            strokeWidth="2.5"
                            strokeDasharray={isReal ? "none" : "3 3"}
                          />
                          <g transform={`translate(${imgTopWorld.x}, ${imgTopWorld.y}) rotate(${getArrowAngle(imgBaseWorld, imgTopWorld)})`}>
                            <polygon points="0,-6 -4,2 4,2" fill={isReal ? "#10b981" : "#c084fc"} />
                          </g>
                          <text
                            x={imgTopWorld.x} y={imgTopWorld.y - 12}
                            textAnchor="middle"
                            fill={isReal ? "#10b981" : "#c084fc"}
                            fontSize="10" fontWeight="bold"
                          >
                            {mirrorType === 'flat' ? '正立等大虛像' : mirrorType === 'convex' ? '正立縮小虛像' : isReal ? '倒立實像' : '正立放大虛像'}
                          </text>

                          {/* 像長 h2 標註 */}
                          <line
                            x1={imgTopWorld.x + (imgTopWorld.x >= imgBaseWorld.x ? 12 : -12)}
                            y1={imgBaseWorld.y}
                            x2={imgTopWorld.x + (imgTopWorld.x >= imgBaseWorld.x ? 12 : -12)}
                            y2={imgTopWorld.y}
                            stroke={isReal ? "#10b981" : "#a855f7"}
                            strokeWidth="1.2"
                          />
                          <text
                            x={imgTopWorld.x + (imgTopWorld.x >= imgBaseWorld.x ? 16 : -16)}
                            y={(imgBaseWorld.y + imgTopWorld.y) / 2}
                            textAnchor={imgTopWorld.x >= imgBaseWorld.x ? "start" : "end"}
                            fill={isReal ? "#10b981" : "#a855f7"}
                            fontSize="9" fontWeight="bold"
                          >
                            像長 h₂ ({imgH.toFixed(1)})
                          </text>

                          {/* 像距 q 標註 */}
                          <line x1="250" y1="200" x2={imgBaseWorld.x} y2="200" stroke="#a855f7" strokeWidth="1.2" />
                          <text x={(250 + imgBaseWorld.x) / 2} y="213" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">
                            像距 q ({absQ.toFixed(1)})
                          </text>
                        </g>
                      </g>
                    )}

                    {isNoImage && (
                      <text x="250" y="80" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
                        物在焦點上，反射光平行不相交 (不成像)
                      </text>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* 3. 透鏡成像區塊 (已精確修復成像坐標與三條特徵光線作圖) */}
      {activeSubTab === 'lens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-amber-300 border-b border-slate-800 pb-2">透鏡種類與作圖規則</h3>

            <div>
              <span className="text-xs text-slate-300 block mb-2">選擇透鏡型態</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLensType('convex')}
                  className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                    lensType === 'convex'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  凸透鏡 (會聚)
                </button>
                <button
                  onClick={() => setLensType('concave')}
                  className={`py-2 px-3 text-xs rounded-xl border font-medium transition-all ${
                    lensType === 'concave'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  凹透鏡 (發散)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">透鏡焦距 (f)</span>
                <span className="text-amber-400 font-bold">{focalLength} px</span>
              </div>
              <input
                type="range" min="40" max="90" step="5"
                value={focalLength}
                onChange={(e) => setFocalLength(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">物體位置 (物距 p)</span>
                <span className="text-amber-400 font-bold">{objectDist} px</span>
              </div>
              <input
                type="range" min="30" max="200" step="5"
                value={objectDist}
                onChange={(e) => setObjectDist(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 即時幾何數據統計面板 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-slate-800 pb-1.5">
                <Compass className="w-3.5 h-3.5"/> 即時光學數據彙整
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">物高 (h₁)：</span>
                  <span className="text-amber-300 font-bold">{lensCalc.h1} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">物距 (p)：</span>
                  <span className="text-amber-300 font-bold">{lensCalc.p} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">像高 (h₂)：</span>
                  <span className="text-emerald-400 font-bold">
                    {!isFinite(lensCalc.q) ? '∞' : `${lensCalc.h2.toFixed(1)} px`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">像距 (q)：</span>
                  <span className="text-emerald-400 font-bold">
                    {!isFinite(lensCalc.q) ? '∞' : `${lensCalc.absQ.toFixed(1)} px`}
                  </span>
                </div>
                <div className="flex justify-between col-span-2 pt-1 border-t border-slate-900">
                  <span className="text-slate-400">放大率 (m = h₂/h₁ = q/p)：</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {!isFinite(lensCalc.q) ? '∞' : `${lensCalc.m.toFixed(2)} 倍`}
                  </span>
                </div>
              </div>
              <p className={`font-bold text-[11px] pt-1 border-t border-slate-800 ${lensCalc.color}`}>
                ✔ {lensCalc.desc}
              </p>
            </div>
          </div>

          {/* 右側：透鏡 SVG 成像繪圖區 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[340px]">
            <svg viewBox="0 0 450 240" className="w-full h-full max-w-lg">
              {/* 主光軸 */}
              <line x1="10" y1="120" x2="440" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />

              {/* 特徵標記點 F, 2F, F', 2F' */}
              <circle cx={225 - focalLength} cy="120" r="3" fill="#f59e0b" />
              <text x={225 - focalLength} y="135" textAnchor="middle" fill="#f59e0b" fontSize="9">F</text>

              <circle cx={225 - 2 * focalLength} cy="120" r="3" fill="#ef4444" />
              <text x={225 - 2 * focalLength} y="135" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">2F</text>

              <circle cx={225 + focalLength} cy="120" r="3" fill="#f59e0b" />
              <text x={225 + focalLength} y="135" textAnchor="middle" fill="#f59e0b" fontSize="9">F'</text>

              <circle cx={225 + 2 * focalLength} cy="120" r="3" fill="#ef4444" />
              <text x={225 + 2 * focalLength} y="135" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">2F'</text>

              {/* 透鏡圖形 */}
              {lensType === 'convex' ? (
                <path d="M 225 30 Q 235 120 225 210 Q 215 120 225 30" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
              ) : (
                <path d="M 218 30 L 232 30 Q 223 120 232 210 L 218 210 Q 227 120 218 30" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
              )}

              {(() => {
                const lensX = 225;
                const lensY = 120;
                const objX = lensX - objectDist;
                const objH = lensCalc.h1; // 40
                const objTopY = lensY - objH;

                // 物體標註點
                const O_top = { x: objX, y: objTopY };

                // 計算像點幾何位置
                if (!isFinite(lensCalc.q)) {
                  return (
                    <g>
                      {/* 物體 */}
                      <line x1={objX} y1="120" x2={objX} y2={objTopY} stroke="#38bdf8" strokeWidth="3" />
                      <polygon points={`${objX},${objTopY - 6} ${objX - 4},${objTopY + 2} ${objX + 4},${objTopY + 2}`} fill="#38bdf8" />
                      <text x={objX} y={objTopY - 10} textAnchor="middle" fill="#38bdf8" fontSize="10">物體</text>

                      {/* 平行光折射後通過焦點 F' */}
                      <line x1={objX} y1={objTopY} x2={lensX} y2={objTopY} stroke="#fbbf24" strokeWidth="1.5" />
                      <line x1={lensX} y1={objTopY} x2={lensX + 200} y2={objTopY + (200 / focalLength) * objH} stroke="#fbbf24" strokeWidth="1.5" />

                      {/* 直射鏡心光線 */}
                      <line x1={objX} y1={objTopY} x2={lensX + 200} y2={lensY + (200 / objectDist) * objH} stroke="#10b981" strokeWidth="1.5" />

                      <text x="225" y="80" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">
                        物在焦點上，折射光平行不相交 (不成像)
                      </text>
                    </g>
                  );
                }

                // 計算像頂點坐標
                const imgH = lensCalc.h2;
                let imgX, imgTopY;

                if (lensCalc.isReal) {
                  // 凸透鏡實像：鏡後 (x > lensX)，倒立 (y > lensY)
                  imgX = lensX + lensCalc.absQ;
                  imgTopY = lensY + imgH;
                } else if (lensType === 'convex') {
                  // 凸透鏡虛像：鏡前 (x < lensX)，正立 (y < lensY)
                  imgX = lensX - lensCalc.absQ;
                  imgTopY = lensY - imgH;
                } else {
                  // 凹透鏡虛像：鏡前 (x < lensX)，正立 (y < lensY)
                  imgX = lensX - lensCalc.absQ;
                  imgTopY = lensY - imgH;
                }

                const I_top = { x: imgX, y: imgTopY };

                return (
                  <g>
                    {/* 1. 物體箭頭 (藍色) */}
                    <line x1={objX} y1={lensY} x2={O_top.x} y2={O_top.y} stroke="#38bdf8" strokeWidth="3" />
                    <polygon points={`${O_top.x},${O_top.y - 6} ${O_top.x - 4},${O_top.y + 2} ${O_top.x + 4},${O_top.y + 2}`} fill="#38bdf8" />
                    <text x={objX} y={O_top.y - 10} textAnchor="middle" fill="#38bdf8" fontSize="10">物體</text>

                    {/* 物長 h1 標註 */}
                    <line x1={objX - 10} y1="120" x2={objX - 10} y2={O_top.y} stroke="#f59e0b" strokeWidth="1.2" />
                    <text x={objX - 14} y={100} textAnchor="end" fill="#f59e0b" fontSize="9" fontWeight="bold">物長 h₁ (40)</text>

                    {/* 物距 p 標註 */}
                    <line x1={objX} y1="175" x2={lensX} y2="175" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x={(objX + lensX) / 2} y="190" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">物距 p ({objectDist})</text>

                    {/* 2. 成像箭頭與標註 */}
                    <line
                      x1={I_top.x} y1={lensY}
                      x2={I_top.x} y2={I_top.y}
                      stroke={lensCalc.isReal ? "#10b981" : "#c084fc"}
                      strokeWidth="3"
                      strokeDasharray={lensCalc.isReal ? "none" : "3 3"}
                    />
                    {lensCalc.isInverted ? (
                      <polygon points={`${I_top.x},${I_top.y + 6} ${I_top.x - 4},${I_top.y - 2} ${I_top.x + 4},${I_top.y - 2}`} fill="#10b981" />
                    ) : (
                      <polygon points={`${I_top.x},${I_top.y - 6} ${I_top.x - 4},${I_top.y + 2} ${I_top.x + 4},${I_top.y + 2}`} fill="#c084fc" />
                    )}
                    <text
                      x={I_top.x}
                      y={lensCalc.isInverted ? I_top.y + 16 : I_top.y - 10}
                      textAnchor="middle"
                      fill={lensCalc.isReal ? "#10b981" : "#c084fc"}
                      fontSize="10" fontWeight="bold"
                    >
                      {lensCalc.isReal ? '倒立實像' : '正立虛像'}
                    </text>

                    {/* 像長 h2 標註 */}
                    <line
                      x1={I_top.x + (lensCalc.isReal ? 12 : -12)}
                      y1={lensY}
                      x2={I_top.x + (lensCalc.isReal ? 12 : -12)}
                      y2={I_top.y}
                      stroke={lensCalc.isReal ? "#10b981" : "#a855f7"}
                      strokeWidth="1.2"
                    />
                    <text
                      x={I_top.x + (lensCalc.isReal ? 16 : -16)}
                      y={(lensY + I_top.y) / 2}
                      textAnchor={lensCalc.isReal ? "start" : "end"}
                      fill={lensCalc.isReal ? "#10b981" : "#a855f7"}
                      fontSize="9" fontWeight="bold"
                    >
                      像長 h₂ ({imgH.toFixed(1)})
                    </text>

                    {/* 像距 q 標註 */}
                    <line x1={lensX} y1="200" x2={I_top.x} y2="200" stroke="#a855f7" strokeWidth="1.2" />
                    <text x={(lensX + I_top.x) / 2} y="213" textAnchor="middle" fill="#a855f7" fontSize="9" fontWeight="bold">
                      像距 q ({lensCalc.absQ.toFixed(1)})
                    </text>

                    {/* 3. 特徵作圖光線 */}
                    {/* 光線 A: 平行主光軸光線 (黃色) */}
                    <line x1={O_top.x} y1={O_top.y} x2={lensX} y2={O_top.y} stroke="#fbbf24" strokeWidth="1.5" />

                    {lensCalc.isReal ? (
                      /* 凸透鏡實像：折射光通過 F' 抵達像點 I_top */
                      <g>
                        <line x1={lensX} y1={O_top.y} x2={I_top.x} y2={I_top.y} stroke="#fbbf24" strokeWidth="1.5" />
                        {/* 光線 B: 通過鏡心 O 直射 (綠色) */}
                        <line x1={O_top.x} y1={O_top.y} x2={I_top.x} y2={I_top.y} stroke="#10b981" strokeWidth="1.5" />
                      </g>
                    ) : lensType === 'convex' ? (
                      /* 凸透鏡虛像：折射光發散（方向來自 F'），反向延長線相交於 I_top */
                      <g>
                        <line x1={lensX} y1={O_top.y} x2={lensX + 150} y2={O_top.y + (150 / focalLength) * objH} stroke="#fbbf24" strokeWidth="1.5" />
                        <line x1={I_top.x} y1={I_top.y} x2={lensX} y2={O_top.y} stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 3" />
                        {/* 光線 B: 通過鏡心 O 直射 */}
                        <line x1={O_top.x} y1={O_top.y} x2={lensX + 150} y2={lensY + (150 / objectDist) * objH} stroke="#10b981" strokeWidth="1.5" />
                        <line x1={I_top.x} y1={I_top.y} x2={O_top.x} y2={O_top.y} stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />
                      </g>
                    ) : (
                      /* 凹透鏡虛像：折射光向上發散（方向來自鏡前 F），反向延長線相交於 I_top */
                      <g>
                        <line x1={lensX} y1={O_top.y} x2={lensX + 150} y2={O_top.y - (150 / focalLength) * objH} stroke="#fbbf24" strokeWidth="1.5" />
                        <line x1={lensX - focalLength} y1={lensY} x2={lensX} y2={O_top.y} stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 3" />
                        {/* 光線 B: 通過鏡心 O 直射 */}
                        <line x1={O_top.x} y1={O_top.y} x2={lensX + 150} y2={lensY + (150 / objectDist) * objH} stroke="#10b981" strokeWidth="1.5" />
                        <line x1={I_top.x} y1={I_top.y} x2={O_top.x} y2={O_top.y} stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" />
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* 4. 自由光路模式區塊 */}
      {activeSubTab === 'free' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左側：控制面板 */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700 p-5 rounded-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4"/> 自由光術調控面板
              </h3>
              <button
                onClick={() => setFreeElements([])}
                className="text-[11px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3"/> 清空畫布
              </button>
            </div>

            {/* 新增光學元件按鈕區 */}
            <div>
              <span className="text-xs text-slate-300 block mb-2 font-medium">新增光學元件到畫布：</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => addFreeElement('flat_mirror')}
                  className="py-2 px-2 text-xs rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3"/> 平面鏡
                </button>
                <button
                  onClick={() => addFreeElement('convex_mirror')}
                  className="py-2 px-2 text-xs rounded-xl bg-slate-800 border border-slate-700 hover:border-sky-400 text-sky-300 font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3"/> 凸面鏡
                </button>
                <button
                  onClick={() => addFreeElement('concave_mirror')}
                  className="py-2 px-2 text-xs rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-400 text-indigo-300 font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3"/> 凹面鏡
                </button>
                <button
                  onClick={() => addFreeElement('convex_lens')}
                  className="py-2 px-2 text-xs rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500 text-amber-300 font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3"/> 凸透鏡
                </button>
                <button
                  onClick={() => addFreeElement('concave_lens')}
                  className="py-2 px-2 text-xs rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-500 text-purple-300 font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3"/> 凹透鏡
                </button>
              </div>
            </div>

            {/* 平行光源控制 */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs text-amber-300 font-bold block border-b border-slate-800 pb-1">
                平行雷射光源調控
              </span>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">光束數量</span>
                  <span className="text-amber-400 font-bold">{freeRayCount} 條</span>
                </div>
                <input
                  type="range" min="1" max="7" step="2"
                  value={freeRayCount}
                  onChange={(e) => setFreeRayCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">光源位置 (Y 軸)</span>
                  <span className="text-amber-400 font-bold">{freeSourceY} px</span>
                </div>
                <input
                  type="range" min="60" max="180" step="5"
                  value={freeSourceY}
                  onChange={(e) => setFreeSourceY(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">入射角度</span>
                  <span className="text-amber-400 font-bold">{freeSourceAngle}°</span>
                </div>
                <input
                  type="range" min="-30" max="30" step="2"
                  value={freeSourceAngle}
                  onChange={(e) => setFreeSourceAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 已選取元件屬性面板 */}
            {selectedElem ? (
              <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5"/> 選取元件屬性 ({
                      selectedElem.type === 'flat_mirror' ? '平面鏡' :
                      selectedElem.type === 'convex_mirror' ? '凸面鏡' :
                      selectedElem.type === 'concave_mirror' ? '凹面鏡' :
                      selectedElem.type === 'convex_lens' ? '凸透鏡' : '凹透鏡'
                    })
                  </span>
                  <button
                    onClick={() => deleteFreeElement(selectedElem.id)}
                    className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3"/> 刪除
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">旋轉角度</span>
                    <span className="text-emerald-400 font-bold">{selectedElem.angle}°</span>
                  </div>
                  <input
                    type="range" min="-180" max="180" step="5"
                    value={selectedElem.angle}
                    onChange={(e) => setFreeElements(freeElements.map(el =>
                      el.id === selectedElem.id ? { ...el, angle: Number(e.target.value) } : el
                    ))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {selectedElem.type !== 'flat_mirror' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">元件焦距 (f)</span>
                      <span className="text-emerald-400 font-bold">{selectedElem.f} px</span>
                    </div>
                    <input
                      type="range" min="30" max="120" step="5"
                      value={selectedElem.f}
                      onChange={(e) => setFreeElements(freeElements.map(el =>
                        el.id === selectedElem.id ? { ...el, f: Number(e.target.value) } : el
                      ))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                💡 在右側畫布點擊或拖曳光學元件以進行精細調控
              </div>
            )}
          </div>

          {/* 右側：自由模擬 SVG 畫布 */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[340px] select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 450 240"
              className="w-full h-full max-w-lg cursor-crosshair"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="#334155" />
                </pattern>
              </defs>
              <rect width="450" height="240" fill="url(#grid)" rx="10" />

              {/* 平行雷射光源發射器 */}
              <g transform={`translate(20, ${freeSourceY}) rotate(${freeSourceAngle})`}>
                <rect x="-15" y="-35" width="20" height="70" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="-5" y="4" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">LASER</text>
              </g>

              {/* 光線追蹤路徑渲染 */}
              {traceFreeRays().map((rayPath, rIdx) => {
                const pathD = rayPath.map((p, pIdx) => `${pIdx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                return (
                  <path
                    key={`ray-${rIdx}`}
                    d={pathD}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    opacity="0.9"
                    style={{ filter: 'drop-shadow(0px 0px 3px rgba(245, 158, 11, 0.8))' }}
                  />
                );
              })}

              {/* 光學元件繪製 */}
              {freeElements.map((elem) => {
                const isSelected = elem.id === selectedElemId;

                return (
                  <g
                    key={elem.id}
                    transform={`translate(${elem.x}, ${elem.y}) rotate(${elem.angle})`}
                    onPointerDown={(e) => handlePointerDown(elem.id, e)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {/* 選取 Highlight 外框 */}
                    {isSelected && (
                      <rect
                        x="-15" y="-48" width="30" height="96"
                        fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3"
                        rx="6"
                      />
                    )}

                    {/* 平面鏡 */}
                    {elem.type === 'flat_mirror' && (
                      <g>
                        <line x1="0" y1="-40" x2="0" y2="40" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                        <line x1="3" y1="-35" x2="3" y2="35" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
                      </g>
                    )}

                    {/* 凸面鏡 */}
                    {elem.type === 'convex_mirror' && (
                      <g>
                        <path d="M -4 -40 Q 8 0 -4 40" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <path d="M -8 -36 Q 4 0 -8 36" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
                      </g>
                    )}

                    {/* 凹面鏡 */}
                    {elem.type === 'concave_mirror' && (
                      <g>
                        <path d="M 4 -40 Q -8 0 4 40" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 8 -36 Q -4 0 8 36" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" />
                      </g>
                    )}

                    {/* 凸透鏡 */}
                    {elem.type === 'convex_lens' && (
                      <path d="M 0 -40 Q 12 0 0 40 Q -12 0 0 -40" fill="#38bdf8" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="2" />
                    )}

                    {/* 凹透鏡 */}
                    {elem.type === 'concave_lens' && (
                      <path d="M -6 -40 L 6 -40 Q -3 0 6 40 L -6 40 Q 3 0 -6 -40" fill="#a855f7" fillOpacity="0.35" stroke="#a855f7" strokeWidth="2" />
                    )}

                    {/* 拖曳中心點 */}
                    <circle cx="0" cy="0" r="4" fill={isSelected ? "#10b981" : "#ffffff"} opacity="0.8" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}