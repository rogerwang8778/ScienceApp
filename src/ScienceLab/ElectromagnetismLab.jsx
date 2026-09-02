import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, Compass, RotateCw, Activity, Layers, MoveHorizontal, Sliders } from 'lucide-react';

export default function ElectromagnetismLab() {
  const [activeTab, setActiveTab] = useState('motor');
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

  useEffect(()