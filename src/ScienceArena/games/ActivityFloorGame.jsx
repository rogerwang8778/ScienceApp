import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Zap, Flame, ShieldAlert, Sparkles, Swords, HelpCircle, ArrowRight } from 'lucide-react';

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
  const [phase, setPhase] = useState('play'); // 'play' | 'skill' | 'reveal'

  // 氧化物目標 (當前與下一回合)
  const [targetOxide, setTargetOxide] = useState(null);
  const [nextOxide, setNextOxide] = useState(null);

  // 得分
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // 兩方手牌 (5張)
  const [p1Hand, setP1Hand] = useState(dealInitialHand());
  const [p2Hand, setP2Hand] = useState(dealInitialHand());

  // 第一階段蓋牌
  const [p1PlayedCard, setP1PlayedCard] = useState(null);
  const [p2PlayedCard, setP2PlayedCard] = useState(null);

  // 技能使用紀錄 (每場限1次)
  const [p1Skills, setP1Skills] = useState({ s1: false, s2: false, s3: false });
  const [p2Skills, setP2Skills] = useState({ s1: false, s2: false, s3: false });

  // 本回合選擇使用的技能
  const [p1ActiveSkill, setP1ActiveSkill] = useState(null); // 's1' | 's2' | 's3' | null
  const [p2ActiveSkill, setP2ActiveSkill] = useState(null);

  // 回合結果訊息
  const [roundResultMsg, setRoundResultMsg] = useState('');

  // 初始化氧化物目標
  useEffect(() => {
    setTargetOxide(getRandomCard());
    setNextOxide(getRandomCard());
  }, []);

  // 單人 AI 出牌與技能選擇邏輯
  const handleAiTurn = () => {
    // 1. AI 出牌 (Phase 1)
    const randomIndex = Math.floor(Math.random() * p2Hand.length);
    const aiCard = p2Hand[randomIndex];
    setP2PlayedCard(aiCard);

    // 2. AI 技能選擇 (Phase 2 隨機使用未使用的技能)
    const unusedSkills = [];
    if (!p2Skills.s1) unusedSkills.push('s1');
    if (!p2Skills.s2) unusedSkills.push('s2');
    if (!p2Skills.s3) unusedSkills.push('s3');

    if (unusedSkills.length > 0 && Math.random() > 0.6) {
      const chosenSkill = unusedSkills[Math.floor(Math.random() * unusedSkills.length)];
      setP2ActiveSkill(chosenSkill);
      setP2Skills((prev) => ({ ...prev, [chosenSkill]: true }));
    } else {
      setP2ActiveSkill(null);
    }
  };

  // Phase 1: 玩家選卡蓋牌
  const handleSelectCard = (player, card) => {
    if (phase !== 'play') return;

    if (player === 'p1') {
      setP1PlayedCard(card);
    } else {
      setP2PlayedCard(card);
    }
  };

  // 推進到 Phase 2 (技能階段)
  const confirmPhase1 = () => {
    if (!p1PlayedCard) return;

    if (mode === 'single') {
      handleAiTurn();
      setPhase('skill');
    } else if (p1PlayedCard && p2PlayedCard) {
      setPhase('skill');
    }
  };

  // 選擇技能 (Phase 2)
  const handleToggleSkill = (player, skillType) => {
    if (phase !== 'skill') return;

    if (player === 'p1') {
      if (p1Skills[skillType]) return; // 已用過
      setP1ActiveSkill((prev) => (prev === skillType ? null : skillType));
    } else {
      if (p2Skills[skillType]) return;
      setP2ActiveSkill((prev) => (prev === skillType ? null : skillType));
    }
  };

  // Phase 3: 結算階段
  const resolveRound = () => {
    let p1Card = { ...p1PlayedCard };
    let p2Card = { ...p2PlayedCard };

    // 1. 處理技能 1 (退牌與重新換牌)
    if (p1ActiveSkill === 's1') {
      setP1Skills((prev) => ({ ...prev, s1: true }));
      // 隨機將 P2 出牌換成手牌中的另一張
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

    // 2. 處理技能 2 (+1) & 技能 3 (-1)
    let p1Rank = p1Card.rank;
    let p2Rank = p2Card.rank;

    if (p1ActiveSkill === 's2') { p1Rank += 1; setP1Skills((prev) => ({ ...prev, s2: true })); }
    if (p1ActiveSkill === 's3') { p1Rank -= 1; setP1Skills((prev) => ({ ...prev, s3: true })); }

    if (p2ActiveSkill === 's2') { p2Rank += 1; setP2Skills((prev) => ({ ...prev, s2: true })); }
    if (p2ActiveSkill === 's3') { p2Rank -= 1; setP2Skills((prev) => ({ ...prev, s3: true })); }

    // 3. 開牌奪氧判定
    const targetRank = targetOxide.rank;
    const oxideBaseScore = targetOxide.score;

    let p1Earned = 0;
    let p2Earned = 0;
    let msg = '';

    if (p1Rank > p2Rank) {
      // P1 贏下回合
      p1Earned += oxideBaseScore;
      let isPrecise = (p1Rank === targetRank + 1);
      if (isPrecise) { p1Earned += 5; }

      msg = `🎉 P1 打出【${p1Card.name} (活性${p1Rank})】擊敗 P2【${p2Card.name} (活性${p2Rank})】！成功奪走 氧化${targetOxide.name} 的氧氣！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
      setP1Score((prev) => prev + p1Earned);
    } else if (p2Rank > p1Rank) {
      // P2 贏下回合
      p2Earned += oxideBaseScore;
      let isPrecise = (p2Rank === targetRank + 1);
      if (isPrecise) { p2Earned += 5; }

      msg = `🎉 P2 打出【${p2Card.name} (活性${p2Rank})】擊敗 P1【${p1Card.name} (活性${p1Rank})】！成功奪走 氧化${targetOxide.name} 的氧氣！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
      setP2Score((prev) => prev + p2Earned);
    } else {
      msg = `🤝 雙方活性點數相同 (${p1Rank})，反應互相抵銷，無人得分！`;
    }

    setRoundResultMsg(msg);
    setPhase('reveal');
  };

  // 進入下一回合
  const nextRound = () => {
    if (currentRound >= 10) {
      setIsFinished(true);
      return;
    }

    // 消耗打出的牌並補充 1 張手牌 (維持 5 張)
    setP1Hand((prev) => prev.filter((c) => c.uid !== p1PlayedCard.uid).concat(getRandomCard()));
    setP2Hand((prev) => prev.filter((c) => c.uid !== p2PlayedCard.uid).concat(getRandomCard()));

    // 重置選卡與狀態
    setP1PlayedCard(null);
    setP2PlayedCard(null);
    setP1ActiveSkill(null);
    setP2ActiveSkill(null);
    setRoundResultMsg('');

    // 更新目標氧化物
    setTargetOxide(nextOxide);
    setNextOxide(getRandomCard());

    setCurrentRound((prev) => prev + 1);
    setPhase('play');
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
              Heaven's Arena • Floor 60F ({mode === 'pvp' ? '雙人同屏吹牛 PK' : '單人對決'})
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

      {/* 對決桌面區域 */}
      {!isFinished && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4 relative">
          {/* P2 區域 (上方) */}
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400">
                ⚔️ Player 2 (對手)
              </span>
              <span className="text-sm font-mono font-bold text-amber-400">{p2Score} PTS</span>
            </div>

            {/* P2 手牌顯示 (隱藏) */}
            <div className="flex gap-1.5">
              {p2Hand.map((c, i) => (
                <div key={i} className="w-8 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                  🂠
                </div>
              ))}
            </div>
          </div>

          {/* 中央牌面對決區 */}
          <div className="flex justify-center items-center gap-8 py-2 min-h-[120px]">
            {/* P1 打出的蓋牌/翻牌 */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-indigo-300 block">Player 1 出牌</span>
              {renderCard(p1PlayedCard, phase === 'play')}
            </div>

            <Swords className="w-8 h-8 text-amber-400 animate-pulse" />

            {/* P2 打出的蓋牌/翻牌 */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-rose-300 block">Player 2 出牌</span>
              {renderCard(p2PlayedCard, phase === 'play')}
            </div>
          </div>

          {/* 階段控制與技能說明面板 */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center space-y-2">
            {phase === 'play' && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-300">
                  【階段 1：蓋牌】請從下方手牌選擇 1 張暗牌打出：
                </p>
                <button
                  onClick={confirmPhase1}
                  disabled={!p1PlayedCard}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  確認蓋牌進技能階段 ➔
                </button>
              </div>
            )}

            {phase === 'skill' && (
              <div className="space-y-2">
                <p className="text-xs text-amber-300 font-bold">
                  【階段 2：技能階段】可選擇發動 1 項一次性技能（每場限用 1 次）：
                </p>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleToggleSkill('p1', 's1')}
                    disabled={p1Skills.s1}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's1'
                        ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300'
                        : p1Skills.s1
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/40'
                    }`}
                  >
                    🌀 技能1：強制對手換牌 {p1Skills.s1 && '(已用)'}
                  </button>

                  <button
                    onClick={() => handleToggleSkill('p1', 's2')}
                    disabled={p1Skills.s2}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's2'
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                        : p1Skills.s2
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/40'
                    }`}
                  >
                    ⚡ 技能2：活性 +1 {p1Skills.s2 && '(已用)'}
                  </button>

                  <button
                    onClick={() => handleToggleSkill('p1', 's3')}
                    disabled={p1Skills.s3}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's3'
                        ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300'
                        : p1Skills.s3
                        ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                    }`}
                  >
                    🧪 技能3：活性 -1 {p1Skills.s3 && '(已用)'}
                  </button>
                </div>

                <button
                  onClick={resolveRound}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer mt-1"
                >
                  🛑 鎖定技能！翻牌開牌結算！
                </button>
              </div>
            )}

            {phase === 'reveal' && (
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

          {/* P1 區域 (下方手牌選擇) */}
          <div className="border-t border-slate-800/80 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400">
                🛡️ Player 1 (您的手牌)
              </span>
              <span className="text-sm font-mono font-bold text-amber-400">{p1Score} PTS</span>
            </div>

            <div className="flex justify-center gap-2">
              {p1Hand.map((card) => (
                <div
                  key={card.uid}
                  onClick={() => handleSelectCard('p1', card)}
                  className="cursor-pointer"
                >
                  {renderCard(card, false, p1PlayedCard?.uid === card.uid)}
                </div>
              ))}
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