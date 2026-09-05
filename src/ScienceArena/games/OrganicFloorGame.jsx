import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Eye, Sparkles } from 'lucide-react';

// 15 種有機化合物結構式資料庫 (純結構式表示)
const ORGANIC_COMPOUNDS = [
  { structure: 'H-C(H₂)-H' },
  { structure: 'CH₃-CH₃' },
  { structure: 'CH₃-CH₂-CH₃' },

  { structure: 'CH₂=CH₂' },
  { structure: 'CH₂=CH-CH₃' },

  { structure: 'CH₃-OH' },
  { structure: 'CH₃-CH₂-OH' },
  { structure: 'CH₃-CH₂-CH₂-OH' },

  { structure: 'H-COOH' },
  { structure: 'CH₃-COOH' },
  { structure: 'CH₃-CH₂-COOH' },

  { structure: 'H-COO-CH₃' },
  { structure: 'H-COO-CH₂CH₃' },
  { structure: 'CH₃-COO-CH₃' },
  { structure: 'CH₃-COO-CH₂CH₃' }
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

  // 開局 10 秒透視記憶
  const [memorizeTimer, setMemorizeTimer] = useState(10);
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

  // 官能基與化學鍵高亮著色渲染函數
  const renderHighlightedStructure = (structure) => {
    // 依據官能基優先順序切割與著色
    // 羧基 / 酯基 (-COOH, -COO-)
    if (structure.includes('COOH')) {
      const parts = structure.split('COOH');
      return (
        <span>
          {parts[0]}
          <span className="text-rose-400 font-extrabold drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]">COOH</span>
          {parts[1]}
        </span>
      );
    }
    if (structure.includes('COO')) {
      const parts = structure.split('COO');
      return (
        <span>
          {parts[0]}
          <span className="text-rose-400 font-extrabold drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]">COO</span>
          {parts[1]}
        </span>
      );
    }
    // 醇基 (-OH)
    if (structure.includes('OH')) {
      const parts = structure.split('OH');
      return (
        <span>
          {parts[0]}
          <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">OH</span>
          {parts[1]}
        </span>
      );
    }
    // 雙鍵 (=)
    if (structure.includes('=')) {
      const parts = structure.split('=');
      return (
        <span>
          {parts[0]}
          <span className="text-amber-300 font-extrabold text-base px-0.5">=</span>
          {parts[1]}
        </span>
      );
    }

    // 普通烷類
    return <span className="text-slate-200">{structure}</span>;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 90F ({mode === 'pvp' ? 'PK' : 'Single'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🧬 90F Structure Memory Match
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">Turn</p>
            <p className={`text-sm font-black ${activePlayer === 'p1' ? 'text-indigo-400' : 'text-rose-400'}`}>
              {activePlayer === 'p1' ? '🛡️ Player 1' : '⚔️ Player 2'}
            </p>
          </div>
        </div>
      </div>

      {isMemorizing && (
        <div className="bg-amber-500/20 border border-amber-500/40 p-3 rounded-2xl text-center space-y-1 animate-pulse">
          <p className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
            <Eye className="w-4 h-4" /> Preview Time: {memorizeTimer}s
          </p>
        </div>
      )}

      {/* 官能基顏色圖例說明 */}
      <div className="flex justify-center gap-4 text-[10px] font-bold bg-slate-900/60 py-1.5 px-3 rounded-xl border border-slate-800">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span> 羧基/酯基 (-COOH, -COO-)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 羥基/醇基 (-OH)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-300"></span> 雙鍵 (=)
        </span>
      </div>

      {!isFinished && (
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${activePlayer === 'p1' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'text-slate-400 border-transparent'}`}>
            <span>🛡️ Player 1:</span>
            <span className="text-amber-400 font-mono text-sm">{p1Score}</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Remaining: <strong className="text-cyan-300 font-mono">{15 - matchedPairs.length} / 15</strong>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${activePlayer === 'p2' ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'text-slate-400 border-transparent'}`}>
            <span>⚔️ Player 2:</span>
            <span className="text-amber-400 font-mono text-sm">{p2Score}</span>
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
                className={`h-20 md:h-24 rounded-2xl border-2 p-1 flex items-center justify-center transition-all cursor-pointer select-none relative ${
                  isMatched
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-20 cursor-default scale-95'
                    : isFlipped
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-105'
                }`}
              >
                {isFlipped && !isMatched ? (
                  <span className="text-xs md:text-sm font-mono font-black text-center break-all p-1">
                    {renderHighlightedStructure(card.structure)}
                  </span>
                ) : !isMatched ? (
                  <div className="my-auto text-center space-y-1">
                    <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
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
              {p1Score > p2Score ? '🎉 Player 1 Victory!' : p2Score > p1Score ? '🎉 Player 2 Victory!' : '🤝 Draw!'}
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 Score:</span>
              <span className="font-bold text-amber-400">{p1Score}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P2 Score:</span>
              <span className="font-bold text-rose-400">{p2Score}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">EXP:</span>
              <span className="font-bold text-amber-400">+{p1Score * 20 + (p1Score > p2Score ? 100 : 20)}</span>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Exit
          </button>
        </div>
      )}
    </div>
  );
}