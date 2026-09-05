import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, Timer, Flame, Eye, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

// 精準指定的三大可逆反應題庫與破壞條件對照
const EQUILIBRIUM_REACTIONS = [
  {
    id: 'chromate',
    name: '鉻酸根 / 二鉻酸根平衡',
    equation: 'Cr₂O₇²⁻ (橘) + H₂O ⇌ 2CrO₄²⁻ (黃) + 2H⁺',
    rules: [
      { name: '加酸 (加 H⁺)', dir: '<' },
      { name: '加鹼 (滴入 NaOH, 消耗 H⁺)', dir: '>' },
      { name: '加入 鉻酸鉀 (加 CrO₄²⁻)', dir: '<' },
      { name: '加入 二鉻酸鉀 (加 Cr₂O₇²⁻)', dir: '>' },
      { name: '加大量水 (稀釋)', dir: '>' }
    ]
  },
  {
    id: 'nitrogen_dioxide',
    name: '二氧化氮 / 四氧化二氮平衡',
    equation: '2NO₂ (紅棕色, 2莫耳) ⇌ N₂O₄ (無色, 1莫耳) + 熱',
    rules: [
      { name: '加熱 (放入熱水中)', dir: '<' },
      { name: '降溫 (放入冰水中)', dir: '>' },
      { name: '加壓 (壓縮針筒體積)', dir: '>' },
      { name: '減壓 (拉開針筒體積)', dir: '<' },
      { name: '灌入 NO₂ 氣體', dir: '>' },
      { name: '抽離 N₂O₄ 氣體', dir: '>' }
    ]
  },
  {
    id: 'haber_bosch',
    name: '哈伯法製氨反應',
    equation: 'N₂ (1莫耳) + 3H₂ (3莫耳) ⇌ 2NH₃ (2莫耳) + 熱',
    rules: [
      { name: '加熱 (升高溫度)', dir: '<' },
      { name: '冷卻 (降低溫度)', dir: '>' },
      { name: '加壓 (提高壓力)', dir: '>' },
      { name: '減壓 (降低壓力)', dir: '<' },
      { name: '持續注入 N₂ 氣體', dir: '>' },
      { name: '持續注入 H₂ 氣體', dir: '>' },
      { name: '冷凝抽離生成物 NH₃', dir: '>' },
      { name: '加入 NH₃ 氣體', dir: '<' }
    ]
  }
];

export default function EquilibriumFloorGame({ mode = 'single', onGameOver }) {
  // 回合與流程狀態
  const [currentRound, setCurrentRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  // 階段：'memorize' (條件閃現中) | 'input' (作答階段)
  const [phase, setPhase] = useState('memorize');

  // 當前反應式與破壞條件序列
  const [currentReaction, setCurrentReaction] = useState(EQUILIBRIUM_REACTIONS[0]);
  const [conditionsSequence, setConditionsSequence] = useState([]);
  const [targetDirs, setTargetDirs] = useState([]);

  // 目前閃現顯示的條件索引
  const [showingIndex, setShowingIndex] = useState(-1);

  // 玩家輸入的答案序列
  const [p1Answers, setP1Answers] = useState([]);
  const [p2Answers, setP2Answers] = useState([]);

  // 遊戲結果訊息
  const [winnerMsg, setWinnerMsg] = useState('');

  // 初始化每一回合題目與條件序列
  const startRound = (roundNum) => {
    // 隨機抽選三大經典題目之一
    const rx = EQUILIBRIUM_REACTIONS[Math.floor(Math.random() * EQUILIBRIUM_REACTIONS.length)];
    setCurrentReaction(rx);

    // 隨機生成 roundNum 個條件
    const seq = [];
    const dirs = [];
    for (let i = 0; i < roundNum; i++) {
      const randomRule = rx.rules[Math.floor(Math.random() * rx.rules.length)];
      seq.push(randomRule.name);
      dirs.push(randomRule.dir);
    }

    setConditionsSequence(seq);
    setTarget