import React, { useState } from 'react';
import { Atom, Flame, Beaker, Sparkles, AlertCircle } from 'lucide-react';

// ==========================================
// 化學式數字下標格式化元件 (例: C5H12 -> C₅H₁₂)
// ==========================================
export function FormattedFormula({ formula }) {
  if (!formula || formula === '無') return <span>無</span>;

  const tokens = formula.split(/(\d+)/);
  return (
    <span>
      {tokens.map((token, index) => {
        if (/^\d+$/.test(token)) {
          return (
            <sub key={index} className="text-[0.75em] bottom-[-0.1em] font-bold">
              {token}
            </sub>
          );
        }
        return <span key={index}>{token}</span>;
      })}
    </span>
  );
}

// ==========================================
// 1. 向量 2D 平面結構式繪製元件
// ==========================================
function StructuralFormulaViewer({ family, carbonCount }) {
  if ((family === 'alkene' || family === 'alkyne') && carbonCount === 1) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-amber-400 font-bold space-y-2">
        <AlertCircle className="w-8 h-8" />
        <p className="text-xs md:text-sm">
          ⚠️ {family === 'alkene' ? '烯類' : '炔類'}不包含 1 個碳的化合物（最少需要 2 個碳形成雙鍵或參鍵）。
        </p>
      </div>
    );
  }

  const n = carbonCount;
  const startX = 70;
  const stepX = 55;
  const yC = 85;

  let totalWidth = startX + (n - 1) * stepX + 70;
  if (family === 'alcohol') totalWidth += 70;
  if (family === 'acid') totalWidth += 80;

  const height = 170;

  const carbons = Array.from({ length: n }, (_, i) => ({
    x: startX + i * stepX,
    y: yC,
    index: i
  }));

  return (
    <div className="w-full overflow-x-auto flex justify-center py-2">
      <svg width={Math.max(totalWidth, 340)} height={height} className="font-mono select-none">
        {/* 最左端 H */}
        <g>
          <text x={carbons[0].x - 45} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="16" fontWeight="bold">
            H
          </text>
          <line x1={carbons[0].x - 33} y1={yC} x2={carbons[0].x - 13} y2={yC} stroke="#94a3b8" strokeWidth="2" />
        </g>

        {carbons.map((c, i) => {
          const isLast = i === n - 1;

          let bondToNext = null;
          if (!isLast) {
            const nextX = carbons[i + 1].x;
            if (i === 0 && family === 'alkene') {
              bondToNext = (
                <g key={`bond-${i}`}>
                  <line x1={c.x + 13} y1={yC - 4} x2={nextX - 13} y2={yC - 4} stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1={c.x + 13} y1={yC + 4} x2={nextX - 13} y2={yC + 4} stroke="#38bdf8" strokeWidth="2.5" />
                </g>
              );
            } else if (i === 0 && family === 'alkyne') {
              bondToNext = (
                <g key={`bond-${i}`}>
                  <line x1={c.x + 13} y1={yC - 6} x2={nextX - 13} y2={yC - 6} stroke="#a78bfa" strokeWidth="2.5" />
                  <line x1={c.x + 13} y1={yC} x2={nextX - 13} y2={yC} stroke="#a78bfa" strokeWidth="2.5" />
                  <line x1={c.x + 13} y1={yC + 6} x2={nextX - 13} y2={yC + 6} stroke="#a78bfa" strokeWidth="2.5" />
                </g>
              );
            } else {
              bondToNext = (
                <line key={`bond-${i}`} x1={c.x + 13} y1={yC} x2={nextX - 13} y2={yC} stroke="#94a3b8" strokeWidth="2" />
              );
            }
          }

          let topH = true;
          if (family === 'acid' && isLast) topH = false;
          if (family === 'alkyne' && (i === 0 || i === 1)) topH = false;

          let bottomH = true;
          if (family === 'acid' && isLast) bottomH = false;
          if (family === 'alkyne' && (i === 0 || i === 1)) bottomH = false;
          if (family === 'alkene' && i === 1) bottomH = false;

          return (
            <g key={`carbon-${i}`}>
              {bondToNext}

              <text x={c.x} y={yC + 5} textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">
                C
              </text>

              {topH && (
                <g>
                  <line x1={c.x} y1={yC - 10} x2={c.x} y2={yC - 30} stroke="#94a3b8" strokeWidth="2" />
                  <text x={c.x} y={yC - 38} textAnchor="middle" fill="#cbd5e1" fontSize="15">
                    H
                  </text>
                </g>
              )}

              {bottomH && (
                <g>
                  <line x1={c.x} y1={yC + 14} x2={c.x} y2={yC + 34} stroke="#94a3b8" strokeWidth="2" />
                  <text x={c.x} y={yC + 48} textAnchor="middle" fill="#cbd5e1" fontSize="15">
                    H
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {(family === 'alkane' || family === 'alkene' || family === 'alkyne') && (
          <g>
            <line x1={carbons[n - 1].x + 13} y1={yC} x2={carbons[n - 1].x + 33} y2={yC} stroke="#94a3b8" strokeWidth="2" />
            <text x={carbons[n - 1].x + 45} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="16" fontWeight="bold">
              H
            </text>
          </g>
        )}

        {family === 'alcohol' && (
          <g>
            <line x1={carbons[n - 1].x + 13} y1={yC} x2={carbons[n - 1].x + 33} y2={yC} stroke="#38bdf8" strokeWidth="2.5" />
            <text x={carbons[n - 1].x + 45} y={yC + 5} textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="bold">
              O
            </text>
            <line x1={carbons[n - 1].x + 57} y1={yC} x2={carbons[n - 1].x + 77} y2={yC} stroke="#38bdf8" strokeWidth="2.5" />
            <text x={carbons[n - 1].x + 89} y={yC + 5} textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="bold">
              H
            </text>
          </g>
        )}

        {family === 'acid' && (
          <g>
            <line x1={carbons[n - 1].x - 4} y1={yC - 10} x2={carbons[n - 1].x - 4} y2={yC - 30} stroke="#f43f5e" strokeWidth="2.5" />
            <line x1={carbons[n - 1].x + 4} y1={yC - 10} x2={carbons[n - 1].x + 4} y2={yC - 30} stroke="#f43f5e" strokeWidth="2.5" />
            <text x={carbons[n - 1].x} y={yC - 38} textAnchor="middle" fill="#f43f5e" fontSize="16" fontWeight="bold">
              O
            </text>

            <line x1={carbons[n - 1].x + 13} y1={yC} x2={carbons[n - 1].x + 33} y2={yC} stroke="#f43f5e" strokeWidth="2.5" />
            <text x={carbons[n - 1].x + 45} y={yC + 5} textAnchor="middle" fill="#f43f5e" fontSize="16" fontWeight="bold">
              O
            </text>

            <line x1={carbons[n - 1].x + 57} y1={yC} x2={carbons[n - 1].x + 77} y2={yC} stroke="#f43f5e" strokeWidth="2.5" />
            <text x={carbons[n - 1].x + 89} y={yC + 5} textAnchor="middle" fill="#f43f5e" fontSize="16" fontWeight="bold">
              H
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ==========================================
// 2. 酯化反應機構 SVG 渲染元件
// ==========================================
function EsterificationSVG({ acidC, alcC }) {
  const stepX = 48;
  const yC = 70;

  const acidStartX = 45;
  const acidWidth = acidStartX + (acidC - 1) * stepX + 130;

  const alcStartX = 45;
  const alcWidth = alcStartX + alcC * stepX + 60;

  const esterStartX = 45;
  const esterWidth = esterStartX + (acidC + alcC - 1) * stepX + 130;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 羧酸 */}
        <div className="lg:col-span-5 bg-slate-900 border border-rose-900/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-rose-300">
            <span>羧酸 (示性式：<FormattedFormula formula={getAcidFormula(acidC)} />)</span>
            <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
              脫去 -OH 羥基
            </span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg width={Math.max(acidWidth, 240)} height={140} className="font-mono select-none">
              <text x={acidStartX - 35} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
              <line x1={acidStartX - 25} y1={yC} x2={acidStartX - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />

              {Array.from({ length: acidC }).map((_, i) => {
                const x = acidStartX + i * stepX;
                const isLast = i === acidC - 1;
                return (
                  <g key={`acid-c-${i}`}>
                    {i < acidC - 1 && (
                      <line x1={x + 10} y1={yC} x2={x + stepX - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                    )}
                    <text x={x} y={yC + 5} textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="bold">C</text>

                    {!isLast && (
                      <g>
                        <line x1={x} y1={yC - 10} x2={x} y2={yC - 26} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x} y={yC - 33} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                        <line x1={x} y1={yC + 12} x2={x} y2={yC + 28} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x} y={yC + 42} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                      </g>
                    )}

                    {isLast && (
                      <g>
                        <line x1={x - 3} y1={yC - 10} x2={x - 3} y2={yC - 26} stroke="#f43f5e" strokeWidth="2" />
                        <line x1={x + 3} y1={yC - 10} x2={x + 3} y2={yC - 26} stroke="#f43f5e" strokeWidth="2" />
                        <text x={x} y={yC - 34} textAnchor="middle" fill="#f43f5e" fontSize="15" fontWeight="bold">O</text>

                        <rect x={x + 18} y={yC - 22} width={64} height={44} rx={6} fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                        <line x1={x + 10} y1={yC} x2={x + 28} y2={yC} stroke="#f43f5e" strokeWidth="2" />
                        <text x={x + 38} y={yC + 5} textAnchor="middle" fill="#f43f5e" fontSize="15" fontWeight="bold">O</text>
                        <line x1={x + 48} y1={yC} x2={x + 64} y2={yC} stroke="#f43f5e" strokeWidth="2" />
                        <text x={x + 74} y={yC + 5} textAnchor="middle" fill="#f43f5e" fontSize="15" fontWeight="bold">H</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center text-slate-400 font-extrabold text-2xl py-1">
          <span>+</span>
        </div>

        {/* 醇類 */}
        <div className="lg:col-span-5 bg-slate-900 border border-cyan-900/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
            <span>醇類 (示性式：<FormattedFormula formula={getAlcoholFormula(alcC)} />)</span>
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
              脫去 -H 氫原子
            </span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg width={Math.max(alcWidth, 240)} height={140} className="font-mono select-none">
              <rect x={10} y={yC - 22} width={34} height={44} rx={6} fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x={27} y={yC + 5} textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">H</text>
              <line x1={35} y1={yC} x2={52} y2={yC} stroke="#38bdf8" strokeWidth="2" />
              <text x={62} y={yC + 5} textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">O</text>

              {Array.from({ length: alcC }).map((_, i) => {
                const x = alcStartX + 40 + i * stepX;
                return (
                  <g key={`alc-c-${i}`}>
                    {i === 0 ? (
                      <line x1={72} y1={yC} x2={x - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                    ) : (
                      <line x1={x - stepX + 10} y1={yC} x2={x - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                    )}

                    <text x={x} y={yC + 5} textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="bold">C</text>

                    <line x1={x} y1={yC - 10} x2={x} y2={yC - 26} stroke="#94a3b8" strokeWidth="2" />
                    <text x={x} y={yC - 33} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                    <line x1={x} y1={yC + 12} x2={x} y2={yC + 28} stroke="#94a3b8" strokeWidth="2" />
                    <text x={x} y={yC + 42} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>

                    {i === alcC - 1 && (
                      <g>
                        <line x1={x + 10} y1={yC} x2={x + 26} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x + 36} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-1 py-1">
        <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-xs bg-slate-900 border border-amber-800/60 px-4 py-1.5 rounded-full shadow-md">
          <span>脫水縮合 (濃 H₂SO₄ 催化劑 / 加熱 Δ)</span>
          <span>↓</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 生成酯 */}
        <div className="lg:col-span-8 bg-slate-900 border border-emerald-900/60 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300">
            <span>生成酯類 (示性式：<FormattedFormula formula={getEsterFormula(acidC, alcC)} />)</span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
              包含酯基 (-COO-) 官能基
            </span>
          </div>

          <div className="w-full overflow-x-auto flex justify-center py-2">
            <svg width={Math.max(esterWidth, 340)} height={140} className="font-mono select-none">
              {(() => {
                const esterGroupX = esterStartX + (acidC - 1) * stepX;
                return (
                  <rect
                    x={esterGroupX - 10}
                    y={yC - 42}
                    width={72}
                    height={86}
                    rx={8}
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })()}

              <text x={esterStartX - 35} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
              <line x1={esterStartX - 25} y1={yC} x2={esterStartX - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />

              {Array.from({ length: acidC }).map((_, i) => {
                const x = esterStartX + i * stepX;
                const isCarboxylC = i === acidC - 1;

                return (
                  <g key={`ester-acid-c-${i}`}>
                    {i < acidC - 1 && (
                      <line x1={x + 10} y1={yC} x2={x + stepX - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                    )}

                    <text x={x} y={yC + 5} textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="bold">C</text>

                    {!isCarboxylC && (
                      <g>
                        <line x1={x} y1={yC - 10} x2={x} y2={yC - 26} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x} y={yC - 33} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                        <line x1={x} y1={yC + 12} x2={x} y2={yC + 28} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x} y={yC + 42} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                      </g>
                    )}

                    {isCarboxylC && (
                      <g>
                        <line x1={x - 3} y1={yC - 10} x2={x - 3} y2={yC - 26} stroke="#10b981" strokeWidth="2" />
                        <line x1={x + 3} y1={yC - 10} x2={x + 3} y2={yC - 26} stroke="#10b981" strokeWidth="2" />
                        <text x={x} y={yC - 34} textAnchor="middle" fill="#10b981" fontSize="15" fontWeight="bold">O</text>

                        <line x1={x + 10} y1={yC} x2={x + 30} y2={yC} stroke="#10b981" strokeWidth="2.5" />
                        <text x={x + 42} y={yC + 5} textAnchor="middle" fill="#10b981" fontSize="15" fontWeight="bold">O</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {Array.from({ length: alcC }).map((_, i) => {
                const esterOX = esterStartX + (acidC - 1) * stepX + 42;
                const x = esterOX + 36 + i * stepX;

                return (
                  <g key={`ester-alc-c-${i}`}>
                    {i === 0 ? (
                      <line x1={esterOX + 10} y1={yC} x2={x - 10} y2={yC} stroke="#10b981" strokeWidth="2.5" />
                    ) : (
                      <line x1={x - stepX + 10} y1={yC} x2={x - 10} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                    )}

                    <text x={x} y={yC + 5} textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="bold">C</text>

                    <line x1={x} y1={yC - 10} x2={x} y2={yC - 26} stroke="#94a3b8" strokeWidth="2" />
                    <text x={x} y={yC - 33} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                    <line x1={x} y1={yC + 12} x2={x} y2={yC + 28} stroke="#94a3b8" strokeWidth="2" />
                    <text x={x} y={yC + 42} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>

                    {i === alcC - 1 && (
                      <g>
                        <line x1={x + 10} y1={yC} x2={x + 26} y2={yC} stroke="#94a3b8" strokeWidth="2" />
                        <text x={x + 36} y={yC + 5} textAnchor="middle" fill="#cbd5e1" fontSize="14">H</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-center text-slate-400 font-extrabold text-xl py-1">
          <span>+</span>
        </div>

        {/* 水 */}
        <div className="lg:col-span-3 bg-slate-900 border border-blue-900/60 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-blue-300">
            <span>水 (<FormattedFormula formula="H2O" />)</span>
            <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
              脫去水分子
            </span>
          </div>

          <div className="w-full flex justify-center py-4">
            <svg width={140} height={100} className="font-mono select-none">
              <rect x={15} y={yC - 35} width={110} height={50} rx={8} fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x={35} y={yC - 5} textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">H</text>
              <line x1={45} y1={yC - 10} x2={60} y2={yC - 10} stroke="#3b82f6" strokeWidth="2" />
              <text x={70} y={yC - 5} textAnchor="middle" fill="#f43f5e" fontSize="15" fontWeight="bold">O</text>
              <line x1={80} y1={yC - 10} x2={95} y2={yC - 10} stroke="#3b82f6" strokeWidth="2" />
              <text x={105} y={yC - 5} textAnchor="middle" fill="#f43f5e" fontSize="15" fontWeight="bold">H</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAcidFormula(c) {
  if (c === 1) return 'HCOOH';
  if (c === 2) return 'CH3COOH';
  const r1C = c - 1;
  return `C${r1C}H${r1C * 2 + 1}COOH`;
}

function getAlcoholFormula(c) {
  if (c === 1) return 'CH3OH';
  return `C${c}H${c * 2 + 1}OH`;
}

function getEsterFormula(acidC, alcC) {
  let r1 = acidC === 1 ? 'H' : acidC === 2 ? 'CH3' : `C${acidC - 1}H${(acidC - 1) * 2 + 1}`;
  let r2 = alcC === 1 ? 'CH3' : `C${alcC}H${alcC * 2 + 1}`;
  return `${r1}COO${r2}`;
}

export default function OrganicChemistryLab() {
  const [activeTab, setActiveTab] = useState('structure');

  // ==========================================
  // 1. 官能基與結構式 State
  // ==========================================
  const [family, setFamily] = useState('alkane');
  const [carbonCount, setCarbonCount] = useState(5);

  const STEM_NAMES = ['甲', '乙', '丙', '丁', '戊', '己'];

  const getOrganicInfo = (fam, c) => {
    const stem = STEM_NAMES[c - 1];

    if (fam === 'alkane') {
      const h = c * 2 + 2;
      let extraDesc = '常用作燃料。';
      if (c === 1) extraDesc = '天然氣（LNG）的主要成分。';
      if (c === 3 || c === 4) extraDesc = '桶裝瓦斯（液化石油氣 LPG）的主要成分。';

      return {
        name: `${stem}烷`,
        generalFormula: 'CₙH₂ₙ₊₂',
        formula: `C${c}H${h}`,
        condensed: `C${c}H${h}`,
        functionalGroup: '單鍵 (C-C)',
        desc: `通式 CₙH₂ₙ₊₂。屬於飽和烴，難溶於水，常溫下化學性質安定，燃燒會生成二氧化碳與水。${extraDesc}`
      };
    }

    if (fam === 'alkene') {
      if (c === 1) {
        return {
          name: '甲烯 (不存在)',
          generalFormula: 'CₙH₂ₙ',
          formula: '無',
          condensed: '無',
          functionalGroup: '雙鍵 (C=C)',
          desc: '⚠️ 烯類分子中最少需要 2 個碳原子才能形成碳碳雙鍵 (C=C)，故不存在甲烯。'
        };
      }
      const h = c * 2;
      return {
        name: `${stem}烯`,
        generalFormula: 'CₙH₂ₙ',
        formula: `C${c}H${h}`,
        condensed: `C${c}H${h}`,
        functionalGroup: '雙鍵 (C=C)',
        desc: `不飽和烴，通式 CₙH₂ₙ。含有碳碳雙鍵，化學性質較烷類活潑。`
      };
    }

    if (fam === 'alkyne') {
      if (c === 1) {
        return {
          name: '甲炔 (不存在)',
          generalFormula: 'CₙH₂ₙ₋₂',
          formula: '無',
          condensed: '無',
          functionalGroup: '參鍵 (C≡C)',
          desc: '⚠️ 炔類分子中最少需要 2 個碳原子才能形成碳碳參鍵 (C≡C)，故不存在甲炔。'
        };
      }
      const h = c * 2 - 2;
      return {
        name: `${stem}炔`,
        generalFormula: 'CₙH₂ₙ₋₂',
        formula: `C${c}H${h}`,
        condensed: `C${c}H${h}`,
        functionalGroup: '參鍵 (C≡C)',
        desc: `不飽和烴，通式 CₙH₂ₙ₋₂。乙炔燃燒溫度極高，常用於金屬氣焊。`
      };
    }

    if (fam === 'alcohol') {
      const alk = c === 1 ? '' : `C${c}H${c * 2 + 1}`;
      const formulaStr = c === 1 ? 'CH3OH' : `${alk}OH`;

      let extraDesc = '中性化合物，易溶於水。';
      if (c === 1) {
        extraDesc = '⚠️ 警語：又稱木精、工業酒精或變性酒精。具有劇毒，不慎誤飲會導致失明、肝腎衰竭甚至死亡！';
      } else if (c === 2) {
        extraDesc = '又稱酒精，可作為消毒劑（75%）、燃料與酒類飲料成分，易燃且易溶於水。';
      }

      return {
        name: `${stem}醇`,
        generalFormula: 'CₙH₂ₙ₊₁OH',
        formula: `C${c}H${c * 2 + 1}OH`,
        condensed: formulaStr,
        functionalGroup: '羥基 (-OH)',
        desc: `醇類通式為 CₙH₂ₙ₊₁OH。含有羥基 (-OH) 官能基。${extraDesc}`
      };
    }

    if (fam === 'acid') {
      let R = '';
      if (c === 1) R = 'H';
      else if (c === 2) R = 'CH3';
      else R = `C${c - 1}H${(c - 1) * 2 + 1}`;

      let extraDesc = '水溶液呈弱酸性，能使藍色石蕊試紙變紅。';
      if (c === 1) {
        extraDesc = '又稱「蟻酸」，為蜂類與螞蟻叮咬分泌物中的酸性毒素，會引起皮膚紅腫灼痛。';
      } else if (c === 2) {
        extraDesc = '又稱「醋酸」，食用醋中約含 3~5% 乙酸。純乙酸凝固點高（約 16.6°C），冬日凝結如冰，故稱冰醋酸。';
      }

      const alkylN = c - 1; // 烷基的碳數 = 總碳數 - 1

      return {
        name: `${stem}酸`,
        generalFormula: 'CₙH₂ₙ₊₁COOH (提醒：n = 總碳數 - 1)',
        formula: c === 1 ? 'HCOOH' : c === 2 ? 'CH3COOH' : `C${alkylN}H${alkylN * 2 + 1}COOH`,
        condensed: `${R}COOH (總碳數 = ${c}，其中烷基 n = ${alkylN})`,
        functionalGroup: '羧基 (-COOH)',
        desc: `羧酸類通式為 CₙH₂ₙ₊₁COOH (提醒：n 為羧基外的烷基碳數，即 n = 總碳數 - 1；當 n=0 時，烷基 R 為氫原子 H)。含有羧基 (-COOH)。${extraDesc}`
      };
    }
  };

  const currentInfo = getOrganicInfo(family, carbonCount);

  // ==========================================
  // 2. 酯化反應 State
  // ==========================================
  const [esterAcidC, setEsterAcidC] = useState(2);
  const [esterAlcoholC, setEsterAlcoholC] = useState(5);

  const getEsterResult = (acidC, alcC) => {
    const acidStem = STEM_NAMES[acidC - 1];
    const alcStem = STEM_NAMES[alcC - 1];

    const esterName = `${acidStem}酸${alcStem}酯`;
    const formula = getEsterFormula(acidC, alcC);

    const FRAGRANCES = {
      '1-1': '甲酸甲酯 (桃子香味)',
      '2-1': '乙酸甲酯 (水果香)',
      '2-2': '乙酸乙酯 (菠蘿/蘋果香，常見溶劑)',
      '2-5': '乙酸戊酯 (香蕉香味)',
      '4-2': '丁酸乙酯 (鳳梨香味)',
      '2-8': '乙酸辛酯 (柳橙香味)'
    };
    const key = `${acidC}-${alcC}`;
    const scent = FRAGRANCES[key] || `${esterName} (具有特有水果香氣，難溶於水且密度小於水，浮於水面)`;

    return {
      esterName,
      formula,
      acidFormula: getAcidFormula(acidC),
      alcoholFormula: getAlcoholFormula(alcC),
      scent,
      mechanism: `酸去羥基 (-OH) + 醇去氫 (-H) ➔ 生成 ${esterName} + H₂O`
    };
  };

  const esterResult = getEsterResult(esterAcidC, esterAlcoholC);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Atom className="w-5 h-5 text-emerald-400" />
          理化實驗室：國二下 單元五《有機化合物與酯化反應》
        </h2>
        <p className="text-xs text-slate-400 mt-1">探索有機烴類、醇酸官能基結構式示性式與酯化脫水縮合反應機制</p>
      </div>

      {/* 主分頁 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'structure' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Atom className="w-3.5 h-3.5 text-emerald-300" /> 1. 官能基與結構式展示器
        </button>
        <button
          onClick={() => setActiveTab('esterification')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'esterification' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Beaker className="w-3.5 h-3.5 text-indigo-300" /> 2. 酯化反應實驗室 (酸 + 醇 ➔ 酯 + 水)
        </button>
      </div>

      {/* 1. 官能基與結構式展示器 */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          {/* 官能基種類切換頁籤 */}
          <div className="bg-slate-900 p-2 rounded-2xl border border-slate-700 flex flex-wrap gap-2">
            {[
              { id: 'alkane', name: '烷類 (Alkane)' },
              { id: 'alkene', name: '烯類 (Alkene)' },
              { id: 'alkyne', name: '炔類 (Alkyne)' },
              { id: 'alcohol', name: '醇類 (Alcohol)' },
              { id: 'acid', name: '羧酸類 (Acid)' }
            ].map((fam) => (
              <button
                key={fam.id}
                onClick={() => setFamily(fam.id)}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  family === fam.id ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {fam.name}
              </button>
            ))}
          </div>

          {/* 碳數選擇 (1 ~ 6: 甲乙丙丁戊己) */}
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-300 block">選擇總碳原子數 (1 ~ 6)：</span>
            <div className="grid grid-cols-6 gap-2">
              {STEM_NAMES.map((stem, idx) => {
                const num = idx + 1;
                return (
                  <button
                    key={stem}
                    onClick={() => setCarbonCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                      carbonCount === num
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    C{num} ({stem})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 化合物詳細展示卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 左側資訊卡片 */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <span className="text-base font-extrabold text-amber-300">{currentInfo.name}</span>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  {currentInfo.functionalGroup}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans block">同系物類別通式：</span>
                  <span className="text-sm font-bold text-amber-300">{currentInfo.generalFormula}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans block">示性式 / 化學式：</span>
                  <span className="text-base font-bold text-cyan-300">
                    <FormattedFormula formula={currentInfo.formula} />
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans block">分子簡式與說明：</span>
                  <span className="text-xs font-bold text-emerald-400">
                    <FormattedFormula formula={currentInfo.condensed} />
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans space-y-1">
                <strong className="text-indigo-300 block">💡 官能基日常特性與課綱知識：</strong>
                <p>{currentInfo.desc}</p>
              </div>
            </div>

            {/* 右側向量平面結構式 */}
            <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-emerald-400" /> 平面結構式圖解 (Structural Formula)
              </span>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[180px]">
                <StructuralFormulaViewer family={family} carbonCount={carbonCount} />
              </div>

              <div className="text-[11px] font-mono text-slate-400 text-center bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
                註：碳原子 (C) 形成 4 個單鍵，氫原子 (H) 形成 1 個單鍵，氧原子 (O) 形成 2 個鍵。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 酯化反應實驗室 */}
      {activeTab === 'esterification' && (
        <div className="space-y-6">
          {/* 酸與醇選單 */}
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rose-300 block">1. 選擇羧酸 (含有 -COOH 官能基)：</label>
              <select
                value={esterAcidC}
                onChange={(e) => setEsterAcidC(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-400 font-bold"
              >
                {STEM_NAMES.map((stem, idx) => (
                  <option key={`acid-${idx}`} value={idx + 1}>
                    C{idx + 1} ({stem}酸)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">2. 選擇醇類 (含有 -OH 官能基)：</label>
              <select
                value={esterAlcoholC}
                onChange={(e) => setEsterAlcoholC(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
              >
                {STEM_NAMES.map((stem, idx) => (
                  <option key={`alc-${idx}`} value={idx + 1}>
                    C{idx + 1} ({stem}醇)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 酯化反應方程式與機制 SVG */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-indigo-400" /> 酯化反應方程式 (濃硫酸作催化劑與吸水劑)
              </span>

              <div className="text-sm md:text-base font-bold font-mono text-center text-indigo-200 bg-slate-950/90 py-3 rounded-xl border border-indigo-900/50 overflow-x-auto flex items-center justify-center gap-2">
                <span className="text-rose-400">
                  <FormattedFormula formula={esterResult.acidFormula} />
                </span>
                <span>+</span>
                <span className="text-cyan-400">
                  <FormattedFormula formula={esterResult.alcoholFormula} />
                </span>
                <span className="text-amber-300">⇌ (濃 H₂SO₄ / 加熱) ⇌</span>
                <span className="text-emerald-400">
                  <FormattedFormula formula={esterResult.formula} />
                </span>
                <span>+</span>
                <span className="text-blue-300">
                  <FormattedFormula formula="H2O" />
                </span>
              </div>
            </div>

            {/* 結構式圖解 */}
            <div className="bg-slate-950 p-4 md:p-6 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block border-b border-slate-800 pb-2">
                🔬 酯化脫水縮合反應結構式圖解 (酸脫去 -OH + 醇脫去 -H ➔ 形成酯基 -COO- 與 H₂O)
              </span>
              <EsterificationSVG acidC={esterAcidC} alcC={esterAlcoholC} />
            </div>

            {/* 生成酯類性質 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">🎉 生成酯類名稱與示性式：</span>
                <div className="text-lg font-bold text-amber-300 font-mono">{esterResult.esterName}</div>
                <div className="text-sm font-mono text-cyan-300">
                  <FormattedFormula formula={esterResult.formula} />
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-pink-400 block flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-pink-400" /> 特有香氣與物理性質：
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{esterResult.scent}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}