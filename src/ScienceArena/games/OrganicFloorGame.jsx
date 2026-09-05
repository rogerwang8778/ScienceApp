import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Eye, Sparkles, UserCheck, Flame, Zap } from 'lucide-react';

// 15 種有機化合物資料庫 (更新：包含丙酸與甲酸乙酯)
const ORGANIC_COMPOUNDS = [
  { name: '甲烷', formula: 'CH₄', structure: 'H-C(H₂)-H' },
  { name: '乙烷', formula: 'C₂H₆', structure: 'CH₃-CH₃' },
  { name: '丙烷', formula: 'C₃H₈', structure: 'CH₃-CH₂-CH₃' },

  { name: '乙烯', formula: 'C₂H₄', structure: 'CH₂=CH₂' },
  { name: '丙烯', formula: 'C₃H₆', structure: 'CH₂=CH-CH₃' },

  { name: '甲醇', formula: 'CH₃OH', structure: 'CH₃-OH' },
  { name: '乙醇', formula: 'C₂H₅OH', structure: 'CH₃-CH₂-OH' },
  { name: '丙醇', formula: 'C₃H₇OH', structure: 'CH₃-CH₂-CH₂-OH' },

  { name: '甲酸', formula: 'HCOOH', structure: 'H-COOH' },
  { name: '乙酸', formula: 'CH₃COOH', structure: 'CH₃-COOH' },
  { name: '丙酸', formula: 'C₂H₅COOH', structure: 'CH₃-CH₂-COOH' },

  { name: '甲酸甲酯', formula: 'HCOOCH₃', structure: 'H-COO-CH₃' },
  { name: '甲酸乙酯', formula: 'HCOOC₂H₅', structure: 'H-COO-CH₂CH₃' },
  { name: '乙酸甲酯', formula: 'CH₃COOCH₃', structure: 'CH₃-COO-CH₃' },
  { name: '乙酸乙酯', formula: 'CH₃COOC₂H₅', structure: 'CH₃-COO-CH₂CH₃' }
];

// 初始化生成 30 張卡牌 (15 對，隨機洗牌)
const createDeck = () => {
  const cards = [];
  ORGANIC_COMPOUNDS.forEach((item, index) => {
    cards.push({ ...item, pairId: index, id: `c-${index}-a` });
    cards.push({ ...item, pairId: index, id: `c-${index}-b` });
  });

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

export default function OrganicFloorGame({ mode = 'single', onGameOver }) {
  const [deck, setDeck] = useState(createDeck());

  const [memorizeTimer, setMemorizeTimer] = useState(5);
  const [isMemorizing, setIsMemorizing] = useState(true);

  const [activePlayer, setActivePlayer] = useState('p1');
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);

  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const [isFinished, setIsFinished] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isMemorizing && memorizeTimer > 0) {
      timer = setInterval(() => setMemorizeTimer((prev) => prev - 1), 1000);
    } else if (memorizeTimer === 0 && isMemorizing) {
      setIsMemorizing(false);
    }
    return () => clearInterval(timer);
  }, [memorizeTimer, isMemorizing]);

  useEffect(() => {
    if (mode === 'single' && activePlayer === 'p2' && !isMemorizing && !isFinished && !isChecking) {
      const availableCards = deck.filter((c) => !matchedPairs.includes(c.pairId));
      if (availableCards.length < 2) return;

      setIsChecking(true);

      setTimeout(() => {
        const first = availableCards[Math.floor(Math.random() * availableCards.length)];
        setFlippedCards([first]);

        setTimeout(() => {
          const remain = availableCards.filter((c) => c.id !== first.id);
          const second = remain[Math.floor(Math.random() * remain.length)];
          setFlippedCards([first, second]);

          if (first.pairId === second.pairId) {
            setP2Score((prev) => prev + 1);
            setMatchedPairs((prev) => [...prev, first.pairId]);
            setFlippedCards([]);
            setIsChecking(false);
          } else {
            setTimeout(() => {
              setFlippedCards([]);
              setActivePlayer('p1');
              setIsChecking(false);
            }, 1000);
          }
        }, 800);
      }, 600);
    }
  }, [activePlayer, isMemorizing, mode, isFinished, isChecking, matchedPairs, deck]);

  useEffect(() => {
    if (matchedPairs.length === 15 && !isFinished) {
      setIsFinished(true);
    }
  }, [matchedPairs, isFinished]);

  const handleCardClick = (card) => {
    if (isMemorizing || isFinished || isChecking) return;
    if (mode === 'single' && activePlayer === 'p2') return;

    if (matchedPairs.includes(card.pairId)) return;
    if (flippedCards.some((c) => c.id === card.id)) return;

    if (flippedCards.length === 0) {
      setFlippedCards([card]);
    } else if (flippedCards.length === 1) {
      const first = flippedCards[0];
      const second = card;
      setFlippedCards([first, second]);
      setIsChecking(true);

      if (first.pairId === second.pairId) {
        if (activePlayer === 'p1') setP1Score((prev) => prev + 1);
        else setP2Score((prev) => prev + 1);

        setMatchedPairs((prev) => [...prev, first.pairId]);
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setActivePlayer((prev) => (prev === 'p1' ? 'p2' : 'p1'));
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  const handleExit = () => {
    const gainedExp = p1Score * 20 + (p1Score > p2Score ? 100 : 20);
    if (onGameOver) onGameOver(gainedExp);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 90F ({mode === 'pvp' ? '雙人翻牌對對碰 PK' : '單人闖關'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🧬 90F 有機擂台：官能基結構翻牌對對碰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">當前回合玩家</p>
            <p className={`text-sm font-black ${activePlayer === 'p1' ? 'text-indigo-400' : 'text-rose-400'}`}>
              {activePlayer === 'p1' ? '🛡️ Player 1' : '⚔️ Player 2'}
            </p>
          </div>
        </div>
      </div>

      {isMemorizing && (
        <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-2xl text-center space-y-1 animate-pulse">
          <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
            <Eye className="w-4 h-4" /> 記憶透視時間！卡牌翻開中：最後 {memorizeTimer} 秒！
          </p>
        </div>
      )}

      {!isFinished && (
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${activePlayer === 'p1' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'text-slate-400 border-transparent'}`}>
            <span>🛡️ Player 1：</span>
            <span className="text-amber-400 font-mono text-sm">{p1Score} 對</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            剩餘對數：<strong className="text-cyan-300 font-mono">{15 - matchedPairs.length} / 15</strong>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${activePlayer === 'p2' ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'text-slate-400 border-transparent'}`}>
            <span>⚔️ Player 2：</span>
            <span className="text-amber-400 font-mono text-sm">{p2Score} 對</span>
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="grid grid-cols-5 md:grid-cols-6 gap-2 bg-slate-950 p-2 md:p-3 rounded-3xl border border-slate-800">
          {deck.map((card) => {
            const isMatched = matchedPairs.includes(card.pairId);
            const isFlipped = isMemorizing || isMatched || flippedCards.some((c) => c.id === card.id);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`h-20 md:h-24 rounded-2xl border-2 p-1 flex flex-col justify-between items-center transition-all cursor-pointer select-none relative ${
                  isMatched
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-20 cursor-default scale-95'
                    : isFlipped
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-105'
                }`}
              >
                {isFlipped && !isMatched ? (
                  <>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 w-full text-center truncate">
                      {card.name}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-black my-auto">
                      {card.formula}
                    </span>
                    <span className="text-[9px] font-mono text-slate-300 truncate w-full text-center bg-black/40 rounded px-1">
                      {card.structure}
                    </span>
                  </>
                ) : !isMatched ? (
                  <div className="my-auto text-center space-y-1">
                    <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
                    <span className="text-[10px] text-slate-500 font-bold block">🧪 有機</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {p1Score > p2Score ? '🎉 Player 1 贏得有機對對碰對決！' : p2Score > p1Score ? '🎉 Player 2 贏得有機對對碰對決！' : '🤝 雙方配對數相同，平手！'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              熟記有機化合物的碳鏈數量與官能基結構式！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 配對成功：</span>
              <span className="font-bold text-amber-400">{p1Score} 對</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P2 配對成功：</span>
              <span className="font-bold text-rose-400">{p2Score} 對</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{p1Score * 20 + (p1Score > p2Score ? 100 : 20)}</span>
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