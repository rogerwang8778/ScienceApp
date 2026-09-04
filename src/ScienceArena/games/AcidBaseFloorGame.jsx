import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RefreshCw, Zap, ShieldAlert, Sparkles, Swords, Timer, Dumbbell } from 'lucide-react';

// 酸鹼藥品清單 (酸：HCl, H2SO4 / 鹼：NaOH, Ca(OH)2)
const ACIDS = [
  { symbol: 'HCl', name: '鹽酸', valence: 1, type: 'acid' },
  { symbol: 'H₂SO₄', name: '硫酸', valence: 2, type: 'acid' }
];

const BASES = [
  { symbol: 'NaOH', name: '氫氧化鈉', valence: 1, type: 'base' },
  { symbol: 'Ca(OH)₂', name: '氫氧化鈣', valence: 2, type: 'base' }
];

// 生成隨機怪獸 (pH 1~5 為酸怪，pH 9~13 為鹼怪)
const generateMonster = () => {
  const isAcidMonster = Math.random() > 0.5;
  const phList = isAcidMonster ? [1, 2, 3, 4, 5] : [9, 10, 11, 12, 13];
  const ph = phList[Math.floor(Math.random() * phList.length)];
  return {
    ph,
    type: isAcidMonster ? 'acid' : 'base',
    targetPhNeeded: 14 - ph, // 中和需要的對應酸鹼拳 pH
    id: Math.random().toString(36).substr(2, 9)
  };
};

export default function AcidBaseFloorGame({ mode = 'single', onGameOver }) {
  // 遊戲時間與狀態
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false);

  // 得分與擊倒數
  const [p1Kills, setP1Kills] = useState(0);
  const [p2Kills, setP2Kills] = useState(0);

  // 當前擂台怪獸
  const [monster, setMonster] = useState(generateMonster());

  // 玩家選擇狀態 State
  // Player 1
  const [p1Fist, setP1Fist] = useState(null); // 'left' (酸) | 'right' (鹼)
  const [p1Chem, setP1Chem] = useState(null); // 隨機抽到的酸/鹼藥品
  const [p1Mol, setP1Mol] = useState(null); // 1 或 0.5
  const [p1Charge, setP1Charge] = useState(0); // 充能次數 n (10^n L)
  const [p1Cooldown, setP1Cooldown] = useState(false);

  // Player 2 (PVP)
  const [p2Fist, setP2Fist] = useState(null);
  const [p2Chem, setP2Chem] = useState(null);
  const [p2Mol, setP2Mol] = useState(null);
  const [p2Charge, setP2Charge] = useState(0);
  const [p2Cooldown, setP2Cooldown] = useState(false);

  // 擊打打擊反饋訊息
  const [msg, setMsg] = useState('');

  // 計時器
  useEffect(() => {
    let timer = null;
    if (!isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  // 計算出的拳 pH 值
  const calculatePunchPh = (fist, chem, mol, charge) => {
    if (!fist || !chem || mol === null) return null;

    // 離子總莫耳數 = 莫耳數 * 價數
    const totalMoles = mol * chem.valence;
    // 體積 = 10^n 公升
    const volume = Math.pow(10, charge);
    // 濃度 M = 莫耳數 / 體積
    const concentration = totalMoles / volume;

    // pH 計算: -log10(M)
    const logVal = Math.round(-Math.log10(concentration));

    if (fist === 'left') {
      // 酸拳: pH直接等於 logVal
      return logVal;
    } else {
      // 鹼拳: pOH = logVal, pH = 14 - pOH
      return 14 - logVal;
    }
  };

  // 選擇出拳 (左拳-酸 / 右拳-鹼)
  const handleSelectFist = (player, fistType) => {
    if (isFinished) return;

    if (fistType === 'left') {
      const chem = ACIDS[Math.floor(Math.random() * ACIDS.length)];
      if (player === 'p1') { setP1Fist('left'); setP1Chem(chem); setP1Mol(null); setP1Charge(0); }
      else { setP2Fist('left'); setP2Chem(chem); setP2Mol(null); setP2Charge(0); }
    } else {
      const chem = BASES[Math.floor(Math.random() * BASES.length)];
      if (player === 'p1') { setP1Fist('right'); setP1Chem(chem); setP1Mol(null); setP1Charge(0); }
      else { setP2Fist('right'); setP2Chem(chem); setP2Mol(null); setP2Charge(0); }
    }
  };

  // 出拳打擊發動
  const handlePunch = (player) => {
    const fist = player === 'p1' ? p1Fist : p2Fist;
    const chem = player === 'p1' ? p1Chem : p2Chem;
    const mol = player === 'p1' ? p1Mol : p2Mol;
    const charge = player === 'p1' ? p1Charge : p2Charge;

    if (!fist || !chem || mol === null) return;

    const punchPh = calculatePunchPh(fist, chem, mol, charge);

    // 檢查是否精準完全中和 (Punch pH + 怪獸 pH === 14)
    const isKO = (punchPh === monster.targetPhNeeded);

    if (isKO) {
      // 擊倒成功！
      if (player === 'p1') setP1Kills((prev) => prev + 1);
      else setP2Kills((prev) => prev + 1);

      setMsg(`💥 ${player === 'p1' ? 'Player 1' : 'Player 2'} 揮出 pH=${punchPh} 重拳！完美完全中和 KO 怪獸！`);
      
      // 重置雙方出拳準備並更換怪獸
      resetPlayer('p1');
      resetPlayer('p2');
      setMonster(generateMonster());
    } else {
      // 出拳無效（硬直懲罰）
      setMsg(`❌ pH=${punchPh} 拳力無效！怪獸 pH=${monster.ph}（需要 pH=${monster.targetPhNeeded} 中和拳）！`);
      if (player === 'p1') {
        setP1Cooldown(true);
        setTimeout(() => setP1Cooldown(false), 1200);
      } else {
        setP2Cooldown(true);
        setTimeout(() => setP2Cooldown(false), 1200);
      }
    }
  };

  const resetPlayer = (player) => {
    if (player === 'p1') { setP1Fist(null); setP1Chem(null); setP1Mol(null); setP1Charge(0); }
    else { setP2Fist(null); setP2Chem(null); setP2Mol(null); setP2Charge(0); }
  };

  const handleExit = () => {
    const gainedExp = p1Kills * 30 + 20;
    if (onGameOver) onGameOver(gainedExp);
  };

  // 渲染操作控制面板
  const renderControls = (player) => {
    const isP1 = player === 'p1';
    const fist = isP1 ? p1Fist : p2Fist;
    const chem = isP1 ? p1Chem : p2Chem;
    const mol = isP1 ? p1Mol : p2Mol;
    const charge = isP1 ? p1Charge : p2Charge;
    const cooldown = isP1 ? p1Cooldown : p2Cooldown;

    const currentPunchPh = calculatePunchPh(fist, chem, mol, charge);

    return (
      <div className={`p-4 rounded-3xl border space-y-3 ${
        isP1 ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'
      }`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
            isP1 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400' : 'bg-rose-500/20 text-rose-300 border-rose-400'
          }`}>
            {isP1 ? '🛡️ Player 1 (左側玩家)' : '⚔️ Player 2 (右側玩家)'}
          </span>
          <span className="text-xs text-slate-400">已擊倒：<strong className="text-amber-400 text-sm">{isP1 ? p1Kills : p2Kills} 隻</strong></span>
        </div>

        {/* 步驟 1: 選擇出拳方向 */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block font-bold">1. 選擇出拳類別：</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectFist(player, 'left')}
              className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                fist === 'left' ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-300' : 'bg-slate-900 text-rose-300 border-rose-500/30 hover:bg-rose-950/30'
              }`}
            >
              🥊 左拳 (酸性攻勢)
            </button>
            <button
              onClick={() => handleSelectFist(player, 'right')}
              className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                fist === 'right' ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300' : 'bg-slate-900 text-blue-300 border-blue-500/30 hover:bg-blue-950/30'
              }`}
            >
              🥊 右拳 (鹼性攻勢)
            </button>
          </div>
        </div>

        {/* 顯示抽到的化學藥品 */}
        {chem && (
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl text-center space-y-1 animate-fadeIn">
            <p className="text-xs font-bold text-amber-300">
              抽出藥品：{chem.name} <span className="font-mono text-cyan-300">({chem.symbol})</span>
            </p>
            <p className="text-[10px] text-slate-400">
              解離價數：{chem.valence} 價 {chem.type === 'acid' ? '酸' : '鹼'}
            </p>
          </div>
        )}

        {/* 步驟 2: 選擇莫耳數 */}
        {chem && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold">2. 選擇莫耳數 (mol)：</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => isP1 ? setP1Mol(1) : setP2Mol(1)}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  mol === 1 ? 'bg-amber-500 text-slate-950 border-amber-300 font-black' : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                1 mol
              </button>
              <button
                onClick={() => isP1 ? setP1Mol(0.5) : setP2Mol(0.5)}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  mol === 0.5 ? 'bg-amber-500 text-slate-950 border-amber-300 font-black' : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                0.5 mol
              </button>
            </div>
          </div>
        )}

        {/* 步驟 3: 點擊 n 次充能注入水 10^n L */}
        {mol !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="font-bold">3. 充能注入水 (10ⁿ 公升)：</span>
              <span className="text-cyan-300 font-mono font-bold">注入水：{Math.pow(10, charge)} L (n={charge})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => isP1 ? setP1Charge((prev) => prev + 1) : setP2Charge((prev) => prev + 1)}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" /> 加水充能 (+1次)
              </button>
              <button
                onClick={() => isP1 ? setP1Charge(0) : setP2Charge(0)}
                className="px-3 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                歸零
              </button>
            </div>
          </div>
        )}

        {/* 出拳攻擊按鈕 */}
        {mol !== null && (
          <button
            onClick={() => handlePunch(player)}
            disabled={cooldown}
            className={`w-full py-3 rounded-2xl font-black text-xs md:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              cooldown
                ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-slate-950 ring-2 ring-amber-300/50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            {cooldown ? '💥 硬直冷卻中...' : `揮出酸鹼拳！(預計出拳 pH = ${currentPunchPh})`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 max-w-6xl mx-auto space-y-4 text-slate-100 select-none overflow-hidden">
      {/* 頂部標頭 */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              Heaven's Arena • Floor 70F ({mode === 'pvp' ? '雙人酸鹼中和 PK' : '單人闖關'})
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white mt-1 flex items-center gap-2">
            🧪 70F 酸鹼擂台：中和KO強攻戰
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400">倒數計時</p>
            <p className={`text-base font-mono font-bold ${timeLeft <= 10 ? 'text-rose-500 animate-ping' : 'text-cyan-400'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>
      </div>

      {/* 怪獸共同擂台 */}
      {!isFinished && monster && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden shadow-2xl">
          <div className="inline-block bg-slate-800/80 px-4 py-1 rounded-full border border-slate-700 text-xs text-slate-300 font-bold">
            👾 擂台怪獸出現！
          </div>

          <div className="flex justify-center items-center gap-4">
            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl border-4 flex flex-col items-center justify-center font-black shadow-2xl animate-bounce ${
              monster.type === 'acid' ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-blue-950/80 border-blue-500 text-blue-200'
            }`}>
              <span className="text-3xl md:text-4xl">👾</span>
              <span className="text-base md:text-lg font-mono">pH = {monster.ph}</span>
              <span className="text-[10px] font-normal">{monster.type === 'acid' ? '酸性怪獸' : '鹼性怪獸'}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 max-w-md mx-auto p-2.5 rounded-2xl text-xs space-y-1">
            <p className="text-amber-300 font-bold">
              💡 完全中和提示：需要揮出 <strong className="text-cyan-300 underline font-mono text-sm">pH = {monster.targetPhNeeded}</strong> 的{monster.type === 'acid' ? '鹼拳' : '酸拳'}才能精準 KO！
            </p>
          </div>

          {/* 打擊反饋訊息 */}
          <div className="h-6 text-xs font-bold">
            {msg ? (
              <span className={msg.includes('💥') ? 'text-emerald-400 animate-bounce' : 'text-rose-400'}>
                {msg}
              </span>
            ) : (
              <span className="text-slate-500">60 秒內計算出精準酸鹼拳擊倒最多的玩家獲勝！</span>
            )}
          </div>
        </div>
      )}

      {/* 控制面板區域 */}
      {!isFinished && (
        mode === 'pvp' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderControls('p1')}
            {renderControls('p2')}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {renderControls('p1')}
          </div>
        )
      )}

      {/* 結算畫面 */}
      {isFinished && (
        <div className="text-center space-y-6 py-8 max-w-md mx-auto">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">
              {mode === 'single'
                ? `🎉 60 秒內成功擊倒 ${p1Kills} 隻怪獸！`
                : p1Kills > p2Kills ? '🎉 Player 1 擊倒更多怪獸勝出！' : p2Kills > p1Kills ? '🎉 Player 2 擊倒更多怪獸勝出！' : '🤝 雙方擊倒數相同平手！'
              }
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              熟記酸鹼中和莫耳數 $n = M \times V \times \text{價數}$ 與水稀釋對 $\text{pH}$ 的影響！
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">P1 擊倒數量：</span>
              <span className="font-bold text-amber-400">{p1Kills} 隻</span>
            </div>
            {mode === 'pvp' && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">P2 擊倒數量：</span>
                <span className="font-bold text-rose-400">{p2Kills} 隻</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-slate-400">獲得經驗值 EXP：</span>
              <span className="font-bold text-amber-400">+{p1Kills * 30 + 20}</span>
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