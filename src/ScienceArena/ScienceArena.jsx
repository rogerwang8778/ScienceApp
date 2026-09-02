import React, { useState, useEffect } from 'react';
import { Swords, User, Users, Trophy, Heart, Layers, RefreshCw, CheckCircle2, XCircle, Zap, Activity } from 'lucide-react';

export default function ScienceArena({ onAddExp }) {
  const [gameMode, setGameMode] = useState(null); // 'single' | 'pvp'
  const [selectedUnit, setSelectedUnit] = useState('unit6'); 
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover'

  // 血條與分數系統
  const [p1Hp, setP1Hp] = useState(100);
  const [p2Hp, setP2Hp] = useState(100);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Combo, setP1Combo] = useState(0);
  const [p2Combo, setP2Combo] = useState(0);

  // 計時器與作答連動
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // { player: 'p1'|'p2', status: 'correct'|'wrong' }

  // 跨單元多題庫系統
  const questionBank = {
    unit6: {
      title: "單元六《電與磁》",
      icon: "⚡",
      questions: [
        {
          q: "載流長直導線電流向上，在導線東側（右側）產生的磁場方向為何？",
          options: ["穿出紙面 ⦿", "穿入紙面 ⊗", "向上 ▲", "向下 ▼"],
          answer: 1,
          hint: "安培右手定則：大拇指向上，右側四指穿入紙面。"
        },
        {
          q: "條形磁鐵 N 極快速靠近螺線管左端，螺線管左端會產生什麼感應極性？",
          options: ["N 極", "S 極", "不產生極性", "先 S 後 N"],
          answer: 0,
          hint: "冷次定律：抵抗 N 極靠近，左端產生 N 極排斥。"
        },
        {
          q: "右手開掌定則中，掌心推出的方向代表什麼？",
          options: ["電流方向 (I)", "磁場方向 (B)", "受力方向 (F)", "運動速度 (v)"],
          answer: 2,
          hint: "大拇指：電流 I ｜ 四指：磁場 B ｜ 掌心：受力 F。"
        },
        {
          q: "直流發電機的「半圓形集電環 (換向器)」主要功能為何？",
          options: ["增加電流大小", "將感應電流整流為單向直流電", "改變場磁鐵極性", "避免線圈過熱"],
          answer: 1,
          hint: "每轉 180° 自動切換接觸電刷，輸出單向直流電。"
        }
      ]
    },
    unit5: {
      title: "單元五《電路與歐姆定律》",
      icon: "💡",
      questions: [
        {
          q: "兩相同電阻「並聯」接於相同電源時，總電阻會如何變化？",
          options: ["變為原來的 2 倍", "變為原來的 1/2", "保持不變", "變為原來的 4 倍"],
          answer: 1,
          hint: "並聯總電阻倒數和：1/R總 = 1/R + 1/R = 2/R。"
        },
        {
          q: "歐姆定律公式 V = I × R 中，當電壓保持不變，電阻增大時電流會？",
          options: ["變大", "變小", "保持不變", "先變大後變小"],
          answer: 1,
          hint: "電壓固定時，電流與電阻成反比。"
        }
      ]
    },
    unit4: {
      title: "單元四《酸鹼鹽與反應速率》",
      icon: "🧪",
      questions: [
        {
          q: "水溶液在 25°C 下，pH 值由 5 降至 3，氫離子濃度 [H+] 變為原來的幾倍？",
          options: ["2 倍", "10 倍", "100 倍", "1/100 倍"],
          answer: 2,
          hint: "pH 每相差 1，[H+] 濃度相差 10 倍，相差 2 則為 100 倍。"
        },
        {
          q: "雙氧水分解反應中加入二氧化錳 (MnO2)，二氧化錳的作用為何？",
          options: ["反應物", "生成物", "催化劑", "溶劑"],
          answer: 2,
          hint: "催化劑可降低活化能，加速反應且反應前後質量不變。"
        }
      ]
    }
  };

  const currentQuestions = questionBank[selectedUnit]?.questions || [];

  // 計時器
  useEffect(() => {
    let timer = null;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // 開始遊戲
  const startGame = (mode) => {
    setGameMode(mode);
    setGameState('playing');
    setP1Hp(100);
    setP2Hp(100);
    setP1Score(0);
    setP2Score(0);
    setP1Combo(0);
    setP2Combo(0);
    setTimeLeft(30);
    setCurrentQIndex(0);
    setFeedback(null);
  };

  // 結束結算
  const endGame = () => {
    setGameState('gameover');
    const gainedExp = p1Score + (p1Hp > 0 ? 50 : 10);
    if (onAddExp) onAddExp(gainedExp);
  };

  // 單人作答判斷
  const handleSingleAnswer = (optionIdx) => {
    const q = currentQuestions[currentQIndex];
    if (optionIdx === q.answer) {
      setFeedback({ player: 'p1', status: 'correct' });
      setP1Score((prev) => prev + 20 + p1Combo * 5);
      setP1Combo((prev) => prev + 1);
    } else {
      setFeedback({ player: 'p1', status: 'wrong' });
      setP1Combo(0);
      setP1Hp((prev) => {
        const nextHp = Math.max(0, prev - 20);
        if (nextHp === 0) setTimeout(endGame, 500);
        return nextHp;
      });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQIndex + 1 < currentQuestions.length) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        endGame();
      }
    }, 800);
  };

  // 雙人 PK 搶答判斷
  const handlePvpAnswer = (player, optionIdx) => {
    const q = currentQuestions[currentQIndex];
    const isCorrect = optionIdx === q.answer;

    if (player === 'p1') {
      if (isCorrect) {
        setFeedback({ player: 'p1', status: 'correct' });
        setP1Score((prev) => prev + 25);
        setP2Hp((prev) => Math.max(0, prev - 20)); // 攻擊 Player 2 血條
      } else {
        setFeedback({ player: 'p1', status: 'wrong' });
        setP1Hp((prev) => Math.max(0, prev - 20));
      }
    } else {
      if (isCorrect) {
        setFeedback({ player: 'p2', status: 'correct' });
        setP2Score((prev) => prev + 25);
        setP1Hp((prev) => Math.max(0, prev - 20)); // 攻擊 Player 1 血條
      } else {
        setFeedback({ player: 'p2', status: 'wrong' });
        setP2Hp((prev) => Math.max(0, prev - 20));
      }
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQIndex + 1 < currentQuestions.length) {
        setCurrentQIndex((prev) => prev + 1);
      } else {
        endGame();
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1. 選擇理化單元選單 */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-400" /> 選擇理化對戰單元：
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(questionBank).map((key) => {
            const u = questionBank[key];
            const isSelected = selectedUnit === key;
            return (
              <button
                key={key}
                onClick={() => { setSelectedUnit(key); setGameState('menu'); }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{u.icon}</span>
                  <span className="text-xs font-bold">{u.title}</span>
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 競技場舞台 */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[460px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* 選單模式 */}
        {gameState === 'menu' && (
          <div className="text-center space-y-6 max-w-md w-full my-auto">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <Swords className="w-7 h-7 text-rose-400" />
                {questionBank[selectedUnit]?.title} 競技場
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                考驗觀念熟練度與快答反應！答錯扣除 HP 血條，準備好挑戰了嗎？
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => startGame('single')}
                className="p-5 bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 rounded-2xl border border-indigo-400/30 text-white shadow-xl transition-all flex flex-col items-center gap-2 group"
              >
                <User className="w-8 h-8 text-indigo-200 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">單人限時闖關</span>
                <span className="text-[10px] text-indigo-200/80">血條扣分制 × 連擊加倍</span>
              </button>

              <button
                onClick={() => startGame('pvp')}
                className="p-5 bg-gradient-to-br from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-2xl border border-rose-400/30 text-white shadow-xl transition-all flex flex-col items-center gap-2 group"
              >
                <Users className="w-8 h-8 text-rose-200 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">玩家 1v1 對決 (PK)</span>
                <span className="text-[10px] text-rose-200/80">雙人同螢幕搶答對戰</span>
              </button>
            </div>
          </div>
        )}

        {/* 對戰進行中 */}
        {gameState === 'playing' && (
          <div className="w-full max-w-2xl space-y-6">
            {/* 血條與倒數狀態列 */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-indigo-400 flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-indigo-500 stroke-none" /> Player 1 HP: {p1Hp}%
                </span>
                <span className="text-amber-400 text-sm bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  ⏱ 剩餘時間: {timeLeft}s
                </span>
                {gameMode === 'pvp' && (
                  <span className="text-rose-400 flex items-center gap-1">
                    Player 2 HP: {p2Hp}% <Heart className="w-4 h-4 fill-rose-500 stroke-none" />
                  </span>
                )}
              </div>

              {/* 血條圖形 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${p1Hp}%` }}
                  />
                </div>
                {gameMode === 'pvp' && (
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${p2Hp}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 題目面板 */}
            {currentQuestions[currentQIndex] && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    第 {currentQIndex + 1} / {currentQuestions.length} 題
                  </span>
                  {p1Combo > 1 && (
                    <span className="text-xs font-bold text-amber-400 animate-bounce">
                      🔥 {p1Combo} 連擊 Combo!
                    </span>
                  )}
                </div>

                <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {currentQuestions[currentQIndex].q}
                </h3>

                {/* 選項區 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestions[currentQIndex].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (gameMode === 'single') handleSingleAnswer(idx);
                        else handlePvpAnswer('p1', idx);
                      }}
                      className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/80 hover:border-indigo-500 text-left text-xs md:text-sm font-semibold transition-all flex items-center gap-2 group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-700 group-hover:bg-indigo-500 text-slate-300 group-hover:text-white flex items-center justify-center text-xs font-mono font-bold">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 對戰結算頁 */}
        {gameState === 'gameover' && (
          <div className="text-center space-y-5 my-auto max-w-sm w-full">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white">競技場對戰結算</h2>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">得分：</span>
                <span className="font-bold text-indigo-400">{p1Score} 分</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">剩餘血量 HP：</span>
                <span className="font-bold text-emerald-400">{p1Hp}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">獲得經驗值 EXP：</span>
                <span className="font-bold text-amber-400">+{p1Score + (p1Hp > 0 ? 50 : 10)}</span>
              </div>
            </div>

            <button
              onClick={() => setGameState('menu')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 返回競技場主頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}