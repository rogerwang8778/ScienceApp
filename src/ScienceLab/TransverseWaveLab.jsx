import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Activity, Sliders, Eye, ArrowRight, ArrowLeft, PlayCircle } from 'lucide-react';

export default function TransverseWaveLab({ onAddExp }) {
  // 物理變因 State
  const [amplitude, setAmplitude] = useState(40); // 振幅 (px)
  const [frequency, setFrequency] = useState(1.5); // 頻率 (Hz)
  const [wavelength, setWavelength] = useState(180); // 波長 (px)
  const [direction, setDirection] = useState('right'); // 'right' | 'left'
  
  // 播放與檢視狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [markedParticleIndex, setMarkedParticleIndex] = useState(12);

  // 動態播放指定週期分率 (如播放 1/4 T 後自動暫停)
  const [targetTimeLimit, setTargetTimeLimit] = useState(null); // 紀錄自動暫停的時間點
  const [playingCycleLabel, setPlayingCycleLabel] = useState(null); // 當前正在動態播放的週期標籤

  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  
  // 物理時間與波前波頭 (Wavefront) 狀態
  const timeRef = useRef(0); // 模擬時間 (秒)
  const waveFrontRef = useRef(0); // 波前向前推進的距離 (px)

  // 波速計算與聯動 (v = f * λ)
  const waveSpeedPx = frequency * wavelength; // px/s
  const calculatedVelocity = (frequency * (wavelength / 100)).toFixed(1); // m/s 示意

  // 使用者拉動波速 slider 時，換算對應頻率
  const handleVelocityChange = (newVel) => {
    const newFreq = parseFloat((newVel / (wavelength / 100)).toFixed(2));
    setFrequency(Math.max(0.2, Math.min(5.0, newFreq)));
  };

  // 重置繩波為初始靜止狀態
  const handleReset = () => {
    setIsPlaying(false);
    setTargetTimeLimit(null);
    setPlayingCycleLabel(null);
    timeRef.current = 0;
    waveFrontRef.current = 0;
  };

  // 【全新功能】：動態播放指定的週期分率 (1/4T ~ 4/4T)
  const handlePlayCycleFraction = (fraction, label) => {
    const T = 1 / frequency; // 一個完整週期的秒數
    const durationToPlay = T * fraction; // 需動態播放的秒數
    
    // 設定目標停止時間
    const newLimit = timeRef.current + durationToPlay;
    setTargetTimeLimit(newLimit);
    setPlayingCycleLabel(label);
    setIsPlaying(true); // 開始動態播放動畫
  };

  // 切換手動播放/暫停
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setTargetTimeLimit(null);
      setPlayingCycleLabel(null);
    } else {
      setTargetTimeLimit(null); // 無限制持續播放
      setPlayingCycleLabel(null);
      setIsPlaying(true);
    }
  };

  // 繪圖與物理動畫 Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();

    const render = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // 當處於播放狀態時，推進物理時間與波前位置
      if (isPlaying) {
        // 檢查是否到達指定的動態週期目標時間 (例如 1/4 T 動態播放完畢)
        if (targetTimeLimit !== null && timeRef.current + dt >= targetTimeLimit) {
          // 精準裁切到目標時間並自動暫停
          const remainDt = targetTimeLimit - timeRef.current;
          timeRef.current = targetTimeLimit;
          waveFrontRef.current += waveSpeedPx * remainDt;
          
          setIsPlaying(false); // 自動暫停！
          setTargetTimeLimit(null);
          setPlayingCycleLabel(null);
        } else {
          timeRef.current += dt;
          waveFrontRef.current += waveSpeedPx * dt;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // 1. 平衡位置虛線
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      const k = (2 * Math.PI) / wavelength;
      const omega = 2 * Math.PI * frequency;
      const t = timeRef.current;
      const waveFront = waveFrontRef.current;

      // 2. 繪製波動曲線 (考量波前 Wavefront 漸進傳播)
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#38bdf8';

      for (let x = 0; x <= width; x += 2) {
        let y = centerY;

        if (direction === 'right') {
          if (x <= waveFront) {
            y = centerY - amplitude * Math.sin(k * x - omega * t);
          }
        } else {
          if ((width - x) <= waveFront) {
            y = centerY - amplitude * Math.sin(k * (width - x) - omega * t);
          }
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. 繪製介質質點
      const numParticles = 40;
      const particleSpacing = width / (numParticles - 1);

      for (let i = 0; i < numParticles; i++) {
        const x = i * particleSpacing;
        let y = centerY;

        if (direction === 'right') {
          if (x <= waveFront) {
            y = centerY - amplitude * Math.sin(k * x - omega * t);
          }
        } else {
          if ((width - x) <= waveFront) {
            y = centerY - amplitude * Math.sin(k * (width - x) - omega * t);
          }
        }

        const isMarked = i === markedParticleIndex;

        // 質點垂直軌跡輔助線
        if (isMarked) {
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1;
          ctx.moveTo(x, centerY - amplitude - 10);
          ctx.lineTo(x, centerY + amplitude + 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(x, y, isMarked ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isMarked ? '#f43f5e' : '#cbd5e1';
        ctx.shadowColor = isMarked ? '#f43f5e' : 'transparent';
        ctx.shadowBlur = isMarked ? 10 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 4. 觀念標籤 (當波傳遞過半後顯示波峰、波谷、波長)
      if (showAnnotations && waveFront > 30) {
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        // 標註振幅 A
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.moveTo(30, centerY);
        ctx.lineTo(30, centerY - amplitude);
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'left';
        ctx.fillText(`振幅 A (${amplitude}px)`, 36, centerY - amplitude / 2);

        // 標註波長
        if (waveFront >= wavelength) {
          const startX = direction === 'right' ? 50 : width - 50 - wavelength;
          ctx.beginPath();
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.moveTo(startX, centerY - amplitude - 5);
          ctx.lineTo(startX + wavelength, centerY - amplitude - 5);
          ctx.stroke();

          ctx.fillStyle = '#c084fc';
          ctx.textAlign = 'center';
          ctx.fillText(`波長 λ (${wavelength}px)`, startX + wavelength / 2, centerY - amplitude - 12);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [amplitude, frequency, wavelength, direction, isPlaying, showAnnotations, markedParticleIndex, waveSpeedPx, targetTimeLimit]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
      {/* 標頭 */}
      <div className="border-b border-slate-700 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            橫波 (Transverse Wave) 互動模擬器
          </h2>
          <p className="text-xs text-slate-400 mt-1">支援動態播放指定的 1/4T ~ 4/4T 週期分率，自動暫停便於觀念解題</p>
        </div>

        {/* 核心公式與狀態導讀 */}
        <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-xl text-xs flex items-center gap-4">
          <div>
            <span className="text-slate-400 block">當前物理時間：</span>
            <span className="text-cyan-300 font-mono font-bold">{timeRef.current.toFixed(2)} 秒</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-400 block">當前狀態：</span>
            <span className="text-amber-400 font-bold">
              {playingCycleLabel ? `動態播放 ${playingCycleLabel} 中...` : (isPlaying ? '連續動態播放中' : '已暫停 (靜止定格)')}
            </span>
          </div>
        </div>
      </div>

      {/* 主模擬畫布 */}
      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={760}
          height={280}
          className="w-full h-auto max-w-full cursor-pointer"
        />

        {/* 控制按鈕列 */}
        <div className="flex flex-wrap items-center justify-between w-full mt-4 pt-3 border-t border-slate-800/80 gap-3 text-xs">
          {/* 左側：播放、重置與方向 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? '暫停' : '持續播放'}
            </button>

            {/* 波的前進方向切換 */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => { setDirection('right'); handleReset(); }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  direction === 'right' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" /> 向右波源
              </button>
              <button
                onClick={() => { setDirection('left'); handleReset(); }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  direction === 'left' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 向左波源
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 清空重置
            </button>
          </div>

          {/* 【全新功能】：動態播放 1/4T, 2/4T, 3/4T, 4/4T 週期分率 */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] px-1 flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" /> 動態播放:
            </span>
            {[
              { label: '1/4 T', val: 0.25 },
              { label: '2/4 T', val: 0.5 },
              { label: '3/4 T', val: 0.75 },
              { label: '4/4 T', val: 1.0 }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handlePlayCycleFraction(item.val, item.label)}
                >
                <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl text-xs space-y-2 text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Info className="w-4 h-4" />
          <span>理化「週期分率動態演示」解題觀察技巧：</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
          <li><strong>動態觀測 (1/4 T)</strong>：點擊 <span className="text-amber-300 font-bold">▶ 1/4 T</span>，可以觀看質點「花費 1/4 週期，從平衡位置滑動到達波峰」的動態軌跡。</li>
          <li><strong>動態觀測 (2/4 T)（半週期）</strong>：質點剛好完成半個完整的週期運動，波形正好傳播半個波長 (1/2 λ) 的距離！</li>
        </ul>
      </div>

          {/* 顯示標籤按鈕 */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              showAnnotations
                ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {showAnnotations ? '隱藏名詞標籤' : '顯示觀念標籤'}
          </button>
        </div>
      </div>

      {/* 控制變因卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 波速 Velocity */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> 波速 (Speed, v)
            </span>
            <span className="text-emerald-400 font-bold">{calculatedVelocity} m/s</span>
          </div>
          <input
            type="range" min="0.5" max="8.0" step="0.1"
            value={calculatedVelocity}
            onChange={(e) => handleVelocityChange(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">波形在介質中的傳播速度 ($v = f \times \lambda$)</p>
        </div>

        {/* 振幅 Amplitude */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> 振幅 (Amplitude, A)
            </span>
            <span className="text-cyan-400 font-bold">{amplitude} px</span>
          </div>
          <input
            type="range" min="10" max="80" step="2"
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">質點偏離平衡位置的最大距離</p>
        </div>

        {/* 頻率 Frequency */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> 頻率 (Frequency, f)
            </span>
            <span className="text-amber-400 font-bold">{frequency} Hz</span>
          </div>
          <input
            type="range" min="0.2" max="3.0" step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">介質每秒鐘振動的次數</p>
        </div>

        {/* 波長 Wavelength */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> 波長 (Wavelength, λ)
            </span>
            <span className="text-purple-400 font-bold">{wavelength} px</span>
          </div>
          <input
            type="range" min="100" max="300" step="10"
            value={wavelength}
            onChange={(e) => setWavelength(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">相鄰兩波峰或波谷間的距離</p>
        </div>
      </div>

      {/* 理化考點觀念解析 */}
      <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl text-xs space-y-2 text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Info className="w-4 h-4" />
          <span>理化「週期分率動態演示」解題觀察技巧：</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
          <li><strong>動態觀測 $\frac{1}{4}T$</strong>：點擊 <span className="text-amber-300 font-bold">▶ 1/4 T</span>，可以觀看質點「花費 1/4 週期，從平衡位置滑動到達波峰」的動態軌跡。</li>
          <li><strong>動態觀測 $\frac{2}{4}T$（半週期）</strong>：質點剛好完成半個完整的週期運動，波形正好傳播半個波長（$\frac{1}{2}\lambda$）的距離！</li>
        </ul>
      </div>
    </div>
  );
}