import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, Flame, Swords, HelpCircle, ArrowRight, EyeOff, UserCheck } from 'lucide-react';

// 15 種金屬活性資料庫
const METALS = [
  { symbol: 'K', name: '鉀', rank: 15, tier: 'high', score: 3 },
  { symbol: 'Na', name: '鈉', rank: 14, tier: 'high', score: 3 },
  { symbol: 'Ca', name: '鈣', rank: 13, tier: 'high', score: 3 },
  { symbol: 'Mg', name: '鎂', rank: 12, tier: 'high', score: 3 },
  { symbol: 'Al', name: '鋁', rank: 11, tier: 'high', score: 3 },
  { symbol: 'Zn', name: '鋅', rank: 10, tier: 'mid', score: 2 },
  { symbol: 'Cr', name: '鉻', rank: 9, tier: 'mid', score: 2 },
  { symbol: 'Fe', name: '鐵', rank: 8, tier: 'mid', score: 2 },
  { symbol: 'Sn', name: '錫', rank: 7, tier: 'mid', score: 2 },
  { symbol: 'Pb', name: '鉛', rank: 6, tier: 'mid', score: 2 },
  { symbol: 'Cu', name: '銅', rank: 5, tier: 'low', score: 1 },
  { symbol: 'Hg', name: '汞', rank: 4, tier: 'low', score: 1 },
  { symbol: 'Ag', name: '銀', rank: 3, tier: 'low', score: 1 },
  { symbol: 'Pt', name: '鉑', rank: 2, tier: 'low', score: 1 },
  { symbol: 'Au', name: '金', rank: 1, tier: 'low', score: 1 }
];

// 隨機發牌
const getRandomCard = () => {
  const metal = METALS[Math.floor(Math.random() * METALS.length)];
  return { ...metal, uid: Math.random().toString(36).substr(2, 9) };
};

// 隨機抽 5 張手牌
const dealInitialHand = () => Array.from({ length: 5 }, getRandomCard);

export default function ActivityFloorGame({ mode = 'single', onGameOver }) {
  // 遊戲全域狀態
  const [currentRound, setCurrentRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  // 流程狀態:
  // 'turn1_play' (先手蓋牌) -> 'turn1_skill' (先手技能) -> 'switch' (換人遮蔽) -> 'turn2_play' (後手蓋牌) -> 'turn2_skill' (後手技能) -> 'reveal' (開牌結算)
  const [flowState, setFlowState] = useState('turn1_play');

  // 本回合先手是誰：奇數回合 P1 先，偶數回合 P2 先
  const firstPlayer = currentRound % 2 !== 0 ? 'p1' : 'p2';
  const secondPlayer = firstPlayer === 'p1' ? 'p2' : 'p1';

  // 當前正在操作的玩家
  const activePlayer = (flowState.startsWith('turn1')) ? firstPlayer : secondPlayer;

  // 氧化物目標 (當前與下一回合)
  const [targetOxide, setTargetOxide] = useState(null);
  const [nextOxide, setNextOxide] = useState(null);

  // 得分
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // 兩方手牌 (5張)
  const [p1Hand, setP1Hand] = useState(dealInitialHand());
  const [p2Hand, setP2Hand] = useState(dealInitialHand());

  // 蓋牌選卡
  const [p1PlayedCard, setP1PlayedCard] = useState(null);
  const [p2PlayedCard, setP2PlayedCard] = useState(null);

  // 技能使用紀錄 (每場限1次)
  const [p1Skills, setP1Skills] = useState({ s1: false, s2: false, s3: false });
  const [p2Skills, setP2Skills] = useState({ s1: false, s2: false, s3: false });

  // 本回合選擇使用的技能
  const [p1ActiveSkill, setP1ActiveSkill] = useState(null);
  const [p2ActiveSkill, setP2ActiveSkill] = useState(null);

  // 回合結果訊息
  const [roundResultMsg, setRoundResultMsg] = useState('');

  // 初始化氧化物目標
  useEffect(() => {
    setTargetOxide(getRandomCard());
    setNextOxide(getRandomCard());
  }, []);

  // 單人 AI 自動進行 Turn2 流程
  const handleAiTurn = () => {
    // 1. AI 隨機選卡蓋牌
    const randomIndex = Math.floor(Math.random() * p2Hand.length);
    const aiCard = p2Hand[randomIndex];
    setP2PlayedCard(aiCard);

    // 2. AI 隨機選擇技能
    const unusedSkills = [];
    if (!p2Skills.s1) unusedSkills.push('s1');
    if (!p2Skills.s2) unusedSkills.push('s2');
    if (!p2Skills.s3) unusedSkills.push('s3');

    if (unusedSkills.length > 0 && Math.random() > 0.5) {
      const chosenSkill = unusedSkills[Math.floor(Math.random() * unusedSkills.length)];
      setP2ActiveSkill(chosenSkill);
    } else {
      setP2ActiveSkill(null);
    }
  };

  // 選牌蓋牌
  const handleSelectCard = (player, card) => {
    if (player !== activePlayer) return;
    if (player === 'p1') setP1PlayedCard(card);
    else setP2PlayedCard(card);
  };

  // 確認蓋牌，進入技能階段
  const confirmPlay = () => {
    const currentCard = activePlayer === 'p1' ? p1PlayedCard : p2PlayedCard;
    if (!currentCard) return;

    if (flowState === 'turn1_play') setFlowState('turn1_skill');
    else if (flowState === 'turn2_play') setFlowState('turn2_skill');
  };

  // 切換技能選擇
  const handleToggleSkill = (player, skillType) => {
    if (player !== activePlayer) return;

    const skills = player === 'p1' ? p1Skills : p2Skills;
    if (skills[skillType]) return; // 已使用過

    if (player === 'p1') {
      setP1ActiveSkill((prev) => (prev === skillType ? null : skillType));
    } else {
      setP2ActiveSkill((prev) => (prev === skillType ? null : skillType));
    }
  };

  // 確認技能完成，推進流程
  const confirmSkill = () => {
    if (flowState === 'turn1_skill') {
      if (mode === 'single') {
        // 單人模式：AI 直接完成 Turn 2
        handleAiTurn();
        resolveRound();
      } else {
        // 雙人 PK 模式：切換至遮蔽準備頁，等後手登場
        setFlowState('switch');
      }
    } else if (flowState === 'turn2_skill') {
      // 雙人模式後手完成，直接進入開牌結算
      resolveRound();
    }
  };

  // 開始後手回合
  const startTurn2 = () => {
    setFlowState('turn2_play');
  };

  // 開牌結算 logic
  const resolveRound = () => {
    let p1Card = { ...p1PlayedCard };
    let p2Card = { ...p2PlayedCard };

    // 1. 處理技能 1 (退牌重新換牌)
    if (p1ActiveSkill === 's1') {
      setP1Skills((prev) => ({ ...prev, s1: true }));
      const remainP2Hand = p2Hand.filter((c) => c.uid !== p2Card.uid);
      if (remainP2Hand.length > 0) {
        p2Card = remainP2Hand[Math.floor(Math.random() * remainP2Hand.length)];
        setP2PlayedCard(p2Card);
      }
    }
    if (p2ActiveSkill === 's1') {
      setP2Skills((prev) => ({ ...prev, s1: true }));
      const remainP1Hand = p1Hand.filter((c) => c.uid !== p1Card.uid);
      if (remainP1Hand.length > 0) {
        p1Card = remainP1Hand[Math.floor(Math.random() * remainP1Hand.length)];
        setP1PlayedCard(p1Card);
      }
    }

    // 2. 處理技能 2 (+1) 與技能 3 (-1)
    let p1Rank = p1Card.rank;
    let p2Rank = p2Card.rank;

    if (p1ActiveSkill === 's2') { p1Rank += 1; setP1Skills((prev) => ({ ...prev, s2: true })); }
    if (p1ActiveSkill === 's3') { p1Rank -= 1; setP1Skills((prev) => ({ ...prev, s3: true })); }

    if (p2ActiveSkill === 's2') { p2Rank += 1; setP2Skills((prev) => ({ ...prev, s2: true })); }
    if (p2ActiveSkill === 's3') { p2Rank -= 1; setP2Skills((prev) => ({ ...prev, s3: true })); }

    // 3. 結算勝負與積分
    const targetRank = targetOxide.rank;
    const oxideBaseScore = targetOxide.score;

    let p1Earned = 0;
    let p2Earned = 0;
    let msg = '';

    if (p1Rank > p2Rank) {
      p1Earned += oxideBaseScore;
      let isPrecise = (p1Rank === targetRank + 1);
      if (isPrecise) p1Earned += 5;

      msg = `🎉 P1 打出【${p1Card.name} (活性${p1Rank})】擊敗 P2【${p2Card.name} (活性${p2Rank})】！成功奪走 氧化${targetOxide.name} 的氧氣！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
      setP1Score((prev) => prev + p1Earned);
    } else if (p2Rank > p1Rank) {
      p2Earned += oxideBaseScore;
      let isPrecise = (p2Rank === targetRank + 1);
      if (isPrecise) p2Earned += 5;

      msg = `🎉 P2 打出【${p2Card.name} (活性${p2Rank})】擊敗 P1【${p1Card.name} (活性${p2Rank})】！成功奪走 氧化${targetOxide.name} 的氧氣！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
      setP2Score((prev) => prev + p2Earned);
    } else {
      msg = `🤝 雙方活性點數相同 (${p1Rank})，反應互相抵銷，無人得分！`;
    }

    setRoundResultMsg(msg);
    setFlowState('reveal');
  };

  // 進入下一回合
  const nextRound = () => {
    if (currentRound >= 10) {
      setIsFinished(true);
      return;
    }

    // 補充手牌 (維持 5 張)
    setP1Hand((prev) => prev.filter((c) => c.uid !== p1PlayedCard.uid).concat(getRandomCard()));
    setP2Hand((prev) => prev.filter((c) => c.uid !== p2PlayedCard.uid).concat(getRandomCard()));

    // 重置選卡與技能狀態
    setP1PlayedCard(null);
    setP2PlayedCard(null);
    setP1ActiveSkill(null);
    setP2ActiveSkill(null);
    setRoundResultMsg('');

    // 更新氧化物
    setTargetOxide(nextOxide);
    setNextOxide(getRandomCard());

    setCurrentRound((prev) => prev + 1);
    setFlowState('turn1_play');
  };

  const handleExit = () => {
    const gainedExp = p1Score * 10 + (p1Score > p2Score ? 100 : 20);
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染卡牌資訊模組
  const renderCard = (card, isHidden = false, isSelected = false) => {
    if (!card) return null;

    if (isHidden) {
      return (
        <div className="w-16 h-24 md:w-20 md:h-28 bg-gradient-to-tr from-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-xl flex flex-col items-center justify-center text-indigo-400 font-bold shadow-lg animate-pulse">
          <HelpCircle className="w-6 h-6 mb-1" />
          <span className="text-[10px]">暗牌蓋置</span>
        </div>
      );
    }

    return (
      <div className={`w-16 h-24 md:w-20 md:h-28 rounded-xl border-2 p-1.5 flex flex-col justify-between transition-all select-none relative shadow-lg ${
        card.tier === 'high' 
          ? 'bg-amber-950/40 border-amber-500/80 text-amber-100' 
          : card.tier === 'mid' 
          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-100' 
          : 'bg-slate-900/60 border-slate-600/80 text-slate-300'
      } ${isSelected ? 'ring-4 ring-amber-400 scale-105 z-20 shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''}`}>
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span>{card.symbol}</span>
          <span className="px-1 bg-white/10 rounded">活性{card.rank}</span>
        </div>
        <div className="text-center my-auto">
          <span className="text-base md:text-lg font-black block">{card.name}</span>
          <span className="text-[9px] text-amber-300 block">{card.score} 分值</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 60F ({mode === 'pvp' ? '雙人輪流吹牛 PK' : '單人對決'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🔥 60F 活性擂台：金屬奪氧吹牛戰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">目前回合</p>
            <p className="text-base font-mono font-bold text-amber-400">
              Round {currentRound} / 10
            </p>
          </div>
        </div>
      </div>

      {/* 氧化物目標預告面板 */}
      {!isFinished && targetOxide && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-amber-950/40 to-rose-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                🎯 當前回合金屬氧化物
              </span>
              <h3 className="text-base md:text-lg font-black text-white mt-1">
                氧化{targetOxide.name} <span className="text-xs text-amber-400">({targetOxide.symbol}O)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                活性基準：{targetOxide.rank} ｜ 奪氧成功可得：<strong className="text-amber-300">{targetOxide.score} 分</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-300 block">精準奪氧 (活性={targetOxide.rank + 1})</span>
              <span className="text-xs font-black text-emerald-400">+5 分暴擊獎勵！</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between opacity-80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                🔮 下一回合氧化物預告
              </span>
              <h4 className="text-sm font-bold text-slate-300 mt-1">
                氧化{nextOxide?.name} ({nextOxide?.symbol}O)
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400">價值 {nextOxide?.score} 分</span>
          </div>
        </div>
      )}

      {/* 換人中間遮蔽頁 (避免後手偷看) */}
      {flowState === 'switch' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-4">
          <EyeOff className="w-16 h-16 text-purple-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-black text-white">
            請將裝置交給 【{secondPlayer === 'p1' ? 'Player 1' : 'Player 2'}】 進行回答！
          </h3>
          <p className="text-xs text-slate-400">
            先手已完成蓋牌與技能階段。請確保對手未觀看畫面後點擊下方按鈕繼續！
          </p>
          <button
            onClick={startTurn2}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center gap-2 mx-auto"
          >
            <UserCheck className="w-5 h-5" /> 準備好，進入【{secondPlayer === 'p1' ? 'Player 1' : 'Player 2'}】的回合！
          </button>
        </div>
      )}

      {/* 主對決桌面區域 */}
      {!isFinished && flowState !== 'switch' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4 relative">
          {/* 對手狀態欄 */}
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400">
                ⚔️ Player 2 (分值：{p2Score} PTS)
              </span>
              {firstPlayer === 'p2' && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  👑 本回合先手
                </span>
              )}
            </div>

            <div className="flex gap-1.5">
              {p2Hand.map((c, i) => (
                <div key={i} className="w-8 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                  🂠
                </div>
              ))}
            </div>
          </div>

          {/* 中央牌面區 */}
          <div className="flex justify-center items-center gap-8 py-2 min-h-[120px]">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-indigo-300 block">Player 1 出牌</span>
              {renderCard(p1PlayedCard, flowState !== 'reveal')}
            </div>

            <Swords className="w-8 h-8 text-amber-400 animate-pulse" />

            <div className="text-center space-y-1">
              <span className="text-[10px] text-rose-300 block">Player 2 出牌</span>
              {renderCard(p2PlayedCard, flowState !== 'reveal')}
            </div>
          </div>

          {/* 操作指示與技能控制面板 */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-2">
            {(flowState === 'turn1_play' || flowState === 'turn2_play') && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-300 font-bold">
                  【階段 1：蓋牌】請 <span className="text-amber-300">{activePlayer === 'p1' ? 'Player 1' : 'Player 2'}</span> 從下方手牌選擇 1 張暗牌打出：
                </p>
                <button
                  onClick={confirmPlay}
                  disabled={(activePlayer === 'p1' && !p1PlayedCard) || (activePlayer === 'p2' && !p2PlayedCard)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  確認蓋牌 ➔
                </button>
              </div>
            )}

            {(flowState === 'turn1_skill' || flowState === 'turn2_skill') && (
              <div className="space-y-2">
                <p className="text-xs text-amber-300 font-bold">
                  【階段 2：技能】請 <span className="text-amber-300">{activePlayer === 'p1' ? 'Player 1' : 'Player 2'}</span> 選擇是否發動 1 項一次性技能（每場限 1 次）：
                </p>

                <div className="flex justify-center gap-2">
                  {(() => {
                    const skills = activePlayer === 'p1' ? p1Skills : p2Skills;
                    const activeSkill = activePlayer === 'p1' ? p1ActiveSkill : p2ActiveSkill;

                    return (
                      <>
                        <button
                          onClick={() => handleToggleSkill(activePlayer, 's1')}
                          disabled={skills.s1}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            activeSkill === 's1'
                              ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300'
                              : skills.s1
                              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/40'
                          }`}
                        >
                          🌀 技能1：強制對手換牌 {skills.s1 && '(已用)'}
                        </button>

                        <button
                          onClick={() => handleToggleSkill(activePlayer, 's2')}
                          disabled={skills.s2}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            activeSkill === 's2'
                              ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                              : skills.s2
                              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/40'
                          }`}
                        >
                          ⚡ 技能2：活性 +1 {skills.s2 && '(已用)'}
                        </button>

                        <button
                          onClick={() => handleToggleSkill(activePlayer, 's3')}
                          disabled={skills.s3}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            activeSkill === 's3'
                              ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300'
                              : skills.s3
                              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                          }`}
                        >
                          🧪 技能3：活性 -1 {skills.s3 && '(已用)'}
                        </button>
                      </>
                    );
                  })()}
                </div>

                <button
                  onClick={confirmSkill}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer mt-1"
                >
                  🛑 完成回合選擇 ➔
                </button>
              </div>
            )}

            {flowState === 'reveal' && (
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-bold text-amber-300 animate-bounce">
                  {roundResultMsg}
                </p>
                <button
                  onClick={nextRound}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  進入 Round {currentRound + 1} ➔
                </button>
              </div>
            )}
          </div>

          {/* 下方玩家手牌 */}
          <div className="border-t border-slate-800/80 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400">
                🛡️ Player 1 (分值：{p1Score} PTS)
              </span>
              {firstPlayer === 'p1' && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  👑 本回合先手
                </span>
              )}
            </div>

            {/* 當前活躍玩家手牌可點選，否則呈現在手牌視角 */}
            <div className="flex justify-center gap-2">
              {(activePlayer === 'p1' ? p1Hand : (mode === 'pvp' ? p2Hand : p1Hand)).map((card) => {
                const currentPlayedCard = activePlayer === 'p1' ? p1PlayedCard : p2PlayedCard;
                return (
                  <div
                    key={card.uid}
                    onClick={() => handleSelectCard(activePlayer, card)}
                    className="cursor-pointer"
                  >
                    {renderCard(card, false, currentPlayedCard?.uid === card.uid)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {p1Score > p2Score ? '🎉 60F 活性擂台 勝利勝出！' : p2Score > p1Score ? '⚔️ 擂台對決 挑戰結束！' : '🤝 雙方奪氧平手！'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              熟記金屬活性順序 $K>Na>Ca>Mg>Al>Zn>Cr>Fe>Sn>Pb>Cu>Hg>Ag>Pt>Au$！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 最終得分：</span>
              <span className="font-bold text-amber-400">{p1Score} PTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P2 最終得分：</span>
              <span className="font-bold text-rose-400">{p2Score} PTS</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{p1Score * 10 + (p1Score > p2Score ? 100 : 20)}</span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 返回競技場大廳
          </button>
        </div>
      )}
    </div>
  );
}