import React, { useState } from 'react';
import { Award, BookOpen, CircleCheck as CheckCircle, CircleHelp as HelpCircle, RefreshCw, Zap, Gamepad2, Bookmark, Flame, Sparkles } from 'lucide-react';
import PeriodicTable from './PeriodicTable';

export default function App() {
  const [exp, setExp] = useState(120);
  const [level, setLevel] = useState(2);
  const [streak] = useState(3);
  
  const [activeTab, setActiveTab] = useState('periodic'); // 預設開啟週期表方便除錯
  const [wrongQuestionIds, setWrongQuestionIds] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState('全部');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  const allQuestions = [
    {
      id: 1,
      unit: "力與運動",
      question: "一物體在光滑水平面上受 10 牛頓的合力作用，產生 2 m/s² 的加速度，則此物體的質量為多少 kg？",
      options: ["A. 2 kg", "B. 5 kg", "C. 10 kg", "D. 20 kg"],
      answer: 1,
      explanation: "根據牛頓第二運動定律 $F = ma$：\n$10\\text{ N} = m \\times 2\\text{ m/s}^2 \\implies m = 5\\text{ kg}$。\n故正確答案為 B。",
      expReward: 50
    },
    {
      id: 2,
      unit: "水溶液與酸鹼鹽",
      question: "在 25°C 下，純水的 pH 值為 7。若將少量強酸加入水中，下列關於溶液中水離子濃度的變化何者正確？",
      options: [
        "A. [H⁺] 增加，[OH⁻] 減少，兩者乘積維持定值",
        "B. [H⁺] 增加，[OH⁻] 增加",
        "C. [H⁺] 減少，[OH⁻] 增加",
        "D. [H⁺] 與 [OH⁻] 皆保持不變"
      ],
      answer: 0,
      explanation: "加入強酸後溶液中酸性增加，$[H^+]$ 增加。根據水的水解平衡（$K_w = [H^+][OH^-] = 10^{-14}$），在 25°C 下 $K_w$ 為定值，因此 $[OH^-]$ 會相對減少。",
      expReward: 50
    },
    {
      id: 3,
      unit: "電學與磁學",
      question: "有一電熱器接於 110V 的電源上，通過的電流為 5A，則此電熱器運轉 10 秒鐘會消耗多少焦耳的電能？",
      options: ["A. 550 焦耳", "B. 1100 焦耳", "C. 5500 焦耳", "D. 2200 焦耳"],
      answer: 2,
      explanation: "電能公式為 $E = P \\times t = V \\times I \\times t$：\n$E = 110\\text{ V} \\times 5\\text{ A} \\times 10\\text{ s} = 5500\\text{ J}$。\n故消耗電能為 5500 焦耳。",
      expReward: 60
    }
  ];

  const filteredQuestions = selectedUnit === '全部' 
    ? allQuestions 
    : allQuestions.filter(q => q.unit === selectedUnit);

  const getTitle = (lvl) => {
    if (lvl < 2) return "理化新手";
    if (lvl < 5) return "實驗室助手";
    if (lvl < 10) return "首席研究員";
    return "理化大師";
  };

  const addExp = (amount) => {
    const newExp = exp + amount;
    const expNeeded = level * 100;
    if (newExp >= expNeeded) {
      setLevel(level + 1);
      setExp(newExp - expNeeded);
    } else {
      setExp(newExp);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    
    const currentQ = filteredQuestions[currentQuizIndex];
    if (selectedOption === currentQ.answer) {
      setScore(score + 1);
      addExp(currentQ.expReward);
    } else {
      if (!wrongQuestionIds.includes(currentQ.id)) {
        setWrongQuestionIds([...wrongQuestionIds, currentQ.id]);
      }
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < filteredQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setQuizFinished(false);
    setScore(0);
  };

  const [gameCoeffs, setGameCoeffs] = useState({ a: 1, b: 1, c: 1 });
  const [gameMessage, setGameMessage] = useState(null);

  const checkBalancingGame = () => {
    if (gameCoeffs.a === 2 && gameCoeffs.b === 1 && gameCoeffs.c === 2) {
      setGameMessage({ type: 'success', text: '恭喜平衡成功！質量守恆定律達標！ +80 EXP' });
      addExp(80);
    } else {
      setGameMessage({ type: 'error', text: '數量不對喔！請檢查反應前後 H 與 O 原子總數是否相等。' });
    }
  };

  const currentQ = filteredQuestions[currentQuizIndex];
  const nextLevelExp = level * 100;
  const expPercentage = Math.min(100, Math.round((exp / nextLevelExp) * 100));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <header className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center font-bold border-2 border-indigo-400 shadow-lg shadow-indigo-600/30">
            <span className="text-xs text-indigo-200">LV</span>
            <span className="text-lg leading-none">{level}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">科學探險家</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {getTitle(level)}
              </span>
            </div>
            <div className="w-48 bg-slate-700 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-600">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500" 
                style={{ width: `${expPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">{exp} / {nextLevelExp} EXP</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-700">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs">連續練習 <strong className="text-amber-400 text-sm">{streak}</strong> 天</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-700">
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span className="text-xs">錯題本 <strong className="text-rose-400 text-sm">{wrongQuestionIds.length}</strong> 題</span>
          </div>
        </div>
      </header>

      <nav className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-6 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/80">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 題庫練習
        </button>
        <button
          onClick={() => setActiveTab('periodic')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'periodic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> 元素週期表
        </button>
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'game' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> 理化小遊戲
        </button>
        <button
          onClick={() => setActiveTab('wrongBook')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wrongBook' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" /> 錯題複習 ({wrongQuestionIds.length})
        </button>
      </nav>

      <main className="max-w-4xl mx-auto">
        {activeTab === 'quiz' && (
          <div>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <span className="text-xs text-slate-400 shrink-0">單元篩選：</span>
              {['全部', '力與運動', '水溶液與酸鹼鹽', '電學與磁學'].map((unit) => (
                <button
                  key={unit}
                  onClick={() => { setSelectedUnit(unit); handleRestartQuiz(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                    selectedUnit === unit 
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-medium' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>

            {!quizFinished && currentQ ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-6">
                  <span className="bg-indigo-900/60 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-700/50 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {currentQ.unit}
                  </span>
                  <span className="text-xs text-slate-400">
                    題目 {currentQuizIndex + 1} / {filteredQuestions.length}
                  </span>
                </div>

                <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed mb-6">
                  {currentQ.question}
                </h2>

                <div className="space-y-3 mb-6">
                  {currentQ.options.map((option, idx) => {
                    let btnStyle = "bg-slate-700/40 hover:bg-slate-700 border-slate-600/80 text-slate-200";
                    if (selectedOption === idx) btnStyle = "bg-indigo-600/30 border-indigo-500 text-white font-medium";
                    if (isAnswered) {
                      if (idx === currentQ.answer) btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-medium";
                      else if (selectedOption === idx && selectedOption !== currentQ.answer) btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !isAnswered && setSelectedOption(idx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border text-sm md:text-base transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {isAnswered && idx === currentQ.answer && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-amber-400/90 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> 答對可得 +{currentQ.expReward} EXP
                  </span>

                  {!isAnswered ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        selectedOption !== null
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      確認送出
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-600/30"
                    >
                      {currentQuizIndex < filteredQuestions.length - 1 ? '下一題' : '查看結算'}
                    </button>
                  )}
                </div>

                {showExplanation && (
                  <div className="mt-6 pt-6 border-t border-slate-700/80">
                    <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-indigo-400 font-medium mb-2 text-sm">
                        <HelpCircle className="w-4 h-4" />
                        <span>觀念拆解與詳解</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
                <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white mb-2">單元練習完成！</h2>
                <p className="text-slate-400 text-sm mb-6">本次獲得經驗值：+{score * 50} EXP</p>
                <button
                  onClick={handleRestartQuiz}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> 再練一次
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'periodic' && (
          <PeriodicTable />
        )}

        {activeTab === 'game' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-4 mb-6">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">小遊戲：化學方程式平衡挑戰</h2>
            </div>

            <p className="text-slate-300 text-sm mb-6">
              調整下方係數，使反應式左方的原子數量等於右方的原子數量（水的合成反應）。
            </p>

            <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-2xl flex flex-wrap items-center justify-center gap-3 text-lg md:text-2xl font-bold text-cyan-300 mb-6">
              <input
                type="number" min="1" max="9"
                value={gameCoeffs.a}
                onChange={(e) => setGameCoeffs({ ...gameCoeffs, a: parseInt(e.target.value) || 1 })}
                className="w-12 h-12 text-center bg-slate-800 border border-indigo-500/50 rounded-xl text-amber-400 font-bold"
              />
              <span>H₂  +</span>

              <input
                type="number" min="1" max="9"
                value={gameCoeffs.b}
                onChange={(e) => setGameCoeffs({ ...gameCoeffs, b: parseInt(e.target.value) || 1 })}
                className="w-12 h-12 text-center bg-slate-800 border border-indigo-500/50 rounded-xl text-amber-400 font-bold"
              />
              <span>O₂  ➔</span>

              <input
                type="number" min="1" max="9"
                value={gameCoeffs.c}
                onChange={(e) => setGameCoeffs({ ...gameCoeffs, c: parseInt(e.target.value) || 1 })}
                className="w-12 h-12 text-center bg-slate-800 border border-indigo-500/50 rounded-xl text-amber-400 font-bold"
              />
              <span>H₂O</span>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6 text-sm">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/80 text-center">
                <p className="text-slate-400 text-xs mb-1">反應物 (左)</p>
                <p className="text-slate-200">H: <strong className="text-indigo-400">{gameCoeffs.a * 2}</strong> | O: <strong className="text-indigo-400">{gameCoeffs.b * 2}</strong></p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/80 text-center">
                <p className="text-slate-400 text-xs mb-1">生成物 (右)</p>
                <p className="text-slate-200">H: <strong className="text-indigo-400">{gameCoeffs.c * 2}</strong> | O: <strong className="text-indigo-400">{gameCoeffs.c * 1}</strong></p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={checkBalancingGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 text-sm"
              >
                檢查平衡
              </button>

              {gameMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm border ${
                  gameMessage.type === 'success' 
                    ? 'bg-emerald-900/40 border-emerald-600/50 text-emerald-300' 
                    : 'bg-rose-900/40 border-rose-600/50 text-rose-300'
                }`}>
                  {gameMessage.text}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wrongBook' && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-rose-400" />
              個人錯題庫 ({wrongQuestionIds.length} 題)
            </h2>

            {wrongQuestionIds.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                目前沒有累積的錯題！繼續保持！
              </div>
            ) : (
              <div className="space-y-4">
                {allQuestions
                  .filter(q => wrongQuestionIds.includes(q.id))
                  .map(q => (
                    <div key={q.id} className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl">
                      <span className="text-xs text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        {q.unit}
                      </span>
                      <p className="font-medium text-slate-200 mt-2 mb-3 text-sm">{q.question}</p>
                      <div className="text-xs text-emerald-400 bg-emerald-950/50 p-3 rounded-lg border border-emerald-800/40 whitespace-pre-line">
                        <strong>正確答案詳解：</strong>{q.explanation}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}