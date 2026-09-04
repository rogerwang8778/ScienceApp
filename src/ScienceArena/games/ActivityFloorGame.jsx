import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Swords, HelpCircle, UserCheck, EyeOff } from 'lucide-react';

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

const getRandomCard = () => {
  const metal = METALS[Math.floor(Math.random() * METALS.length)];
  return { ...metal, uid: Math.random().toString(36).substr(2, 9) };
};

const dealInitialHand = () => Array.from({ length: 5 }, getRandomCard);

export default function ActivityFloorGame({ mode = 'single', onGameOver }) {
  const [currentRound, setCurrentRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);

  // 階段定義：
  // 'p1_play' -> 'switch_p2_play' -> 'p2_play' -> 'switch_p1_skill' -> 'p1_skill' -> 'switch_p2_skill' -> 'p2_skill' -> 'reveal'
  const [stage, setStage] = useState('p1_play');

  const [targetOxide, setTargetOxide] = useState(null);
  const [nextOxide, setNextOxide] = useState(null);

  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const [p1Hand, setP1Hand] = useState(dealInitialHand());
  const [p2Hand, setP2Hand] = useState(dealInitialHand());

  const [p1PlayedCard, setP1PlayedCard] = useState(null);
  const [p2PlayedCard, setP2PlayedCard] = useState(null);

  const [p1Skills, setP1Skills] = useState({ s1: false, s2: false, s3: false });
  const [p2Skills, setP2Skills] = useState({ s1: false, s2: false, s3: false });

  const [p1ActiveSkill, setP1ActiveSkill] = useState(null);
  const [p2ActiveSkill, setP2ActiveSkill] = useState(null);

  const [roundResultMsg, setRoundResultMsg] = useState('');

  useEffect(() => {
    setTargetOxide(getRandomCard());
    setNextOxide(getRandomCard());
  }, []);

  useEffect(() => {
    if (mode === 'single' && stage === 'p2_play') {
      const randomIndex = Math.floor(Math.random() * p2Hand.length);
      setP2PlayedCard(p2Hand[randomIndex]);
      setTimeout(() => setStage('p1_skill'), 400);
    } else if (mode === 'single' && stage === 'p2_skill') {
      const unusedSkills = [];
      if (!p2Skills.s1) unusedSkills.push('s1');
      if (!p2Skills.s2) unusedSkills.push('s2');
      if (!p2Skills.s3) unusedSkills.push('s3');

      if (unusedSkills.length > 0 && Math.random() > 0.5) {
        const chosen = unusedSkills[Math.floor(Math.random() * unusedSkills.length)];
        setP2ActiveSkill(chosen);
      } else {
        setP2ActiveSkill(null);
      }
      setTimeout(() => resolveRound(), 400);
    }
  }, [stage, mode]);

  const handleSelectCard = (player, card) => {
    if (player === 'p1' && stage === 'p1_play') setP1PlayedCard(card);
    if (player === 'p2' && stage === 'p2_play') setP2PlayedCard(card);
  };

  const handleToggleSkill = (player, skillType) => {
    if (player === 'p1' && stage === 'p1_skill') {
      if (p1Skills[skillType]) return;
      setP1ActiveSkill((prev) => (prev === skillType ? null : skillType));
    }
    if (player === 'p2' && stage === 'p2_skill') {
      if (p2Skills[skillType]) return;
      setP2ActiveSkill((prev) => (prev === skillType ? null : skillType));
    }
  };

  const nextStage = () => {
    if (stage === 'p1_play' && p1PlayedCard) {
      if (mode === 'pvp') setStage('switch_p2_play');
      else setStage('p2_play');
    } else if (stage === 'p2_play' && p2PlayedCard) {
      if (mode === 'pvp') setStage('switch_p1_skill');
      else setStage('p1_skill');
    } else if (stage === 'p1_skill') {
      if (mode === 'pvp') setStage('switch_p2_skill');
      else setStage('p2_skill');
    } else if (stage === 'p2_skill') {
      resolveRound();
    }
  };

  const resolveRound = () => {
    let finalP1Card = { ...p1PlayedCard };
    let finalP2Card = { ...p2PlayedCard };

    let p1SkillNotice = '';
    let p2SkillNotice = '';

    if (p1ActiveSkill === 's1') {
      setP1Skills((prev) => ({ ...prev, s1: true }));
      const remainP2Hand = p2Hand.filter((c) => c.uid !== finalP2Card.uid);
      if (remainP2Hand.length > 0) {
        finalP2Card = remainP2Hand[Math.floor(Math.random() * remainP2Hand.length)];
        setP2PlayedCard(finalP2Card);
        p1SkillNotice = '🌀 P1 發動技能：強制 P2 換牌！';
      }
    }

    if (p2ActiveSkill === 's1') {
      setP2Skills((prev) => ({ ...prev, s1: true }));
      const remainP1Hand = p1Hand.filter((c) => c.uid !== finalP1Card.uid);
      if (remainP1Hand.length > 0) {
        finalP1Card = remainP1Hand[Math.floor(Math.random() * remainP1Hand.length)];
        setP1PlayedCard(finalP1Card);
        p2SkillNotice = '🌀 P2 發動技能：強制 P1 換牌！';
      }
    }

    let p1Rank = finalP1Card.rank;
    let p2Rank = finalP2Card.rank;

    if (p1ActiveSkill === 's2') {
      p1Rank += 1;
      setP1Skills((prev) => ({ ...prev, s2: true }));
      p1SkillNotice = '⚡ P1 發動技能：自身活性 +1！';
    }
    if (p1ActiveSkill === 's3') {
      p2Rank -= 1;
      setP1Skills((prev) => ({ ...prev, s3: true }));
      p1SkillNotice = '🧪 P1 發動技能：對手活性 -1！';
    }

    if (p2ActiveSkill === 's2') {
      p2Rank += 1;
      setP2Skills((prev) => ({ ...prev, s2: true }));
      p2SkillNotice = '⚡ P2 發動技能：自身活性 +1！';
    }
    if (p2ActiveSkill === 's3') {
      p1Rank -= 1;
      setP2Skills((prev) => ({ ...prev, s3: true }));
      p2SkillNotice = '🧪 P2 發動技能：對手活性 -1！';
    }

    const targetRank = targetOxide.rank;
    const oxideBaseScore = targetOxide.score;

    let p1Earned = 0;
    let p2Earned = 0;
    let resultText = '';

    const skillNotice = [p1SkillNotice, p2SkillNotice].filter(Boolean).join(' ｜ ');

    const isBothSmallerOrEqual = p1Rank <= targetRank && p2Rank <= targetRank;

    if (isBothSmallerOrEqual) {
      if (p1Rank < p2Rank) {
        p1Earned += oxideBaseScore;
        let isPrecise = (p1Rank === targetRank - 1);
        if (isPrecise) p1Earned += 5;

        resultText = `🛡️ 雙方活性均 ≤ 氧化${targetOxide.name} (活性${targetRank})！P1【${finalP1Card.name} (活性${p1Rank})】比 P2【${finalP2Card.name} (活性${p2Rank})】更安定，逆向勝出！(${isPrecise ? '⚡精準防禦暴擊 +5分！' : `+${oxideBaseScore}分`})`;
        setP1Score((prev) => prev + p1Earned);
      } else if (p2Rank < p1Rank) {
        p2Earned += oxideBaseScore;
        let isPrecise = (p2Rank === targetRank - 1);
        if (isPrecise) p2Earned += 5;

        resultText = `🛡️ 雙方活性均 ≤ 氧化${targetOxide.name} (活性${targetRank})！P2【${finalP2Card.name} (活性${p2Rank})】比 P1【${finalP1Card.name} (活性${p1Rank})】更安定，逆向勝出！(${isPrecise ? '⚡精準防禦暴擊 +5分！' : `+${oxideBaseScore}分`})`;
        setP2Score((prev) => prev + p2Earned);
      } else {
        resultText = `🤝 雙方活性相同 (${p1Rank}) 且均未超越題目，無人得分！`;
      }
    } else {
      if (p1Rank > p2Rank) {
        p1Earned += oxideBaseScore;
        let isPrecise = (p1Rank === targetRank + 1);
        if (isPrecise) p1Earned += 5;

        resultText = `🎉 P1【${finalP1Card.name} (活性${p1Rank})】擊敗 P2【${finalP2Card.name} (活性${p2Rank})】！成功奪走 氧化${targetOxide.name}！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
        setP1Score((prev) => prev + p1Earned);
      } else if (p2Rank > p1Rank) {
        p2Earned += oxideBaseScore;
        let isPrecise = (p2Rank === targetRank + 1);
        if (isPrecise) p2Earned += 5;

        resultText = `🎉 P2【${finalP2Card.name} (活性${p2Rank})】擊敗 P1【${finalP1Card.name} (活性${p1Rank})】！成功奪走 氧化${targetOxide.name}！(${isPrecise ? '⚡精準奪氧暴擊 +5分！' : `+${oxideBaseScore}分`})`;
        setP2Score((prev) => prev + p2Earned);
      } else {
        resultText = `🤝 雙方活性點數相同 (${p1Rank})，反應抵銷，無人得分！`;
      }
    }

    setRoundResultMsg(skillNotice ? `${skillNotice}\n${resultText}` : resultText);
    setStage('reveal');
  };

  const nextRound = () => {
    if (currentRound >= 10) {
      setIsFinished(true);
      return;
    }

    setP1Hand((prev) => prev.filter((c) => c.uid !== p1PlayedCard.uid).concat(getRandomCard()));
    setP2Hand((prev) => prev.filter((c) => c.uid !== p2PlayedCard.uid).concat(getRandomCard()));

    setP1PlayedCard(null);
    setP2PlayedCard(null);
    setP1ActiveSkill(null);
    setP2ActiveSkill(null);
    setRoundResultMsg('');

    setTargetOxide(nextOxide);
    setNextOxide(getRandomCard());

    setCurrentRound((prev) => prev + 1);
    setStage('p1_play');
  };

  const handleExit = () => {
    const gainedExp = p1Score * 10 + (p1Score > p2Score ? 100 : 20);
    if (onGameOver) onGameOver(gainedExp);
  };

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
              <span className="text-[10px] text-amber-300 block">🛡️ 若兩人活性均 ≤ {targetOxide.rank}，改為比小！</span>
              <span className="text-xs font-black text-emerald-400">精準比大/比小差1可 +5 分！</span>
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

      {/* 換人操作遮蔽頁 (防偷看屏障) */}
      {(stage === 'switch_p2_play' || stage === 'switch_p1_skill' || stage === 'switch_p2_skill') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-4">
          <EyeOff className={`w-16 h-16 mx-auto animate-bounce ${stage === 'switch_p1_skill' ? 'text-indigo-400' : 'text-rose-400'}`} />
          <h3 className="text-xl font-black text-white">
            請將裝置交給 【{stage === 'switch_p1_skill' ? 'Player 1' : 'Player 2'}】！
          </h3>
          <p className="text-xs text-slate-400">
            對手已完成操作。請確保對手未觀看畫面後點擊下方按鈕繼續！
          </p>
          <button
            onClick={() => {
              if (stage === 'switch_p2_play') setStage('p2_play');
              else if (stage === 'switch_p1_skill') setStage('p1_skill');
              else if (stage === 'switch_p2_skill') setStage('p2_skill');
            }}
            className={`px-6 py-3 font-bold text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center gap-2 mx-auto text-white ${
              stage === 'switch_p1_skill' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            <UserCheck className="w-5 h-5" /> 準備好，進入【{stage === 'switch_p1_skill' ? 'Player 1' : 'Player 2'}】的回合！
          </button>
        </div>
      )}

      {/* 主對決桌面區域 */}
      {!isFinished && !stage.startsWith('switch_') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4 relative">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400">
                ⚔️ Player 2 (分值：{p2Score} PTS)
              </span>
            </div>

            <div className="flex gap-1.5">
              {p2Hand.map((c, i) => (
                <div key={i} className="w-8 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                  🂠
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center gap-8 py-2 min-h-[120px]">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-indigo-300 block">Player 1 出牌</span>
              {renderCard(p1PlayedCard, stage !== 'reveal')}
            </div>

            <Swords className="w-8 h-8 text-amber-400 animate-pulse" />

            <div className="text-center space-y-1">
              <span className="text-[10px] text-rose-300 block">Player 2 出牌</span>
              {renderCard(p2PlayedCard, stage !== 'reveal')}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-2">
            {stage === 'p1_play' && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-indigo-300 font-bold">
                  【階段 1：P1 出牌】請 Player 1 從下方手牌選擇 1 張暗牌打出：
                </p>
                <button
                  onClick={nextStage}
                  disabled={!p1PlayedCard}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  確認蓋牌進階段 2 ➔
                </button>
              </div>
            )}

            {stage === 'p2_play' && mode === 'pvp' && (
              <div className="flex justify-between items-center">
                <p className="text-xs text-rose-300 font-bold">
                  【階段 2：P2 出牌】請 Player 2 從下方手牌選擇 1 張暗牌打出：
                </p>
                <button
                  onClick={nextStage}
                  disabled={!p2PlayedCard}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  確認蓋牌進階段 3 ➔
                </button>
              </div>
            )}

            {stage === 'p1_skill' && (
              <div className="space-y-2">
                <p className="text-xs text-indigo-300 font-bold">
                  【階段 3：P1 技能】請 Player 1 選擇是否使用技能（每場限 1 次）：
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleToggleSkill('p1', 's1')}
                    disabled={p1Skills.s1}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's1'
                        ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300'
                        : p1Skills.s1 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/40'
                    }`}
                  >
                    🌀 強制 P2 換牌 {p1Skills.s1 && '(已用)'}
                  </button>
                  <button
                    onClick={() => handleToggleSkill('p1', 's2')}
                    disabled={p1Skills.s2}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's2'
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                        : p1Skills.s2 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/40'
                    }`}
                  >
                    ⚡ 自身活性 +1 {p1Skills.s2 && '(已用)'}
                  </button>
                  <button
                    onClick={() => handleToggleSkill('p1', 's3')}
                    disabled={p1Skills.s3}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p1ActiveSkill === 's3'
                        ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300'
                        : p1Skills.s3 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                    }`}
                  >
                    🧪 對手活性 -1 {p1Skills.s3 && '(已用)'}
                  </button>
                </div>
                <button
                  onClick={nextStage}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer mt-1"
                >
                  確認進階段 4 ➔
                </button>
              </div>
            )}

            {stage === 'p2_skill' && mode === 'pvp' && (
              <div className="space-y-2">
                <p className="text-xs text-rose-300 font-bold">
                  【階段 4：P2 技能】請 Player 2 選擇是否使用技能（每場限 1 次）：
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleToggleSkill('p2', 's1')}
                    disabled={p2Skills.s1}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p2ActiveSkill === 's1'
                        ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300'
                        : p2Skills.s1 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/40'
                    }`}
                  >
                    🌀 強制 P1 換牌 {p2Skills.s1 && '(已用)'}
                  </button>
                  <button
                    onClick={() => handleToggleSkill('p2', 's2')}
                    disabled={p2Skills.s2}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p2ActiveSkill === 's2'
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                        : p2Skills.s2 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/40'
                    }`}
                  >
                    ⚡ 自身活性 +1 {p2Skills.s2 && '(已用)'}
                  </button>
                  <button
                    onClick={() => handleToggleSkill('p2', 's3')}
                    disabled={p2Skills.s3}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      p2ActiveSkill === 's3'
                        ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300'
                        : p2Skills.s3 ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-900 text-rose-300 border-rose-500/40 hover:bg-rose-950/40'
                    }`}
                  >
                    🧪 對手活性 -1 {p2Skills.s3 && '(已用)'}
                  </button>
                </div>
                <button
                  onClick={nextStage}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer mt-1"
                >
                  🛑 鎖定技能！進階段 5 翻牌結算 ➔
                </button>
              </div>
            )}

            {stage === 'reveal' && (
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-bold text-amber-300 whitespace-pre-line animate-bounce">
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

          <div className="border-t border-slate-800/80 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400">
                🛡️ {(stage === 'p2_play' || stage === 'p2_skill') ? 'Player 2 (您的手牌)' : 'Player 1 (您的手牌)'}
              </span>
            </div>

            <div className="flex justify-center gap-2">
              {(stage === 'p2_play' || stage === 'p2_skill' ? p2Hand : p1Hand).map((card) => {
                const currentPlayedCard = (stage === 'p2_play' || stage === 'p2_skill') ? p2PlayedCard : p1PlayedCard;
                return (
                  <div
                    key={card.uid}
                    onClick={() => handleSelectCard((stage === 'p2_play' || stage === 'p2_skill') ? 'p2' : 'p1', card)}
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