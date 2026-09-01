import React, { useState } from 'react';
import { Layers, Droplets, Zap, Activity, Sun, ArrowLeft, Beaker, Thermometer, Atom, Scale, Flame } from 'lucide-react';
import DensityLab from './DensityLab';
import ConcentrationLab from './ConcentrationLab';
import TransverseWaveLab from './TransverseWaveLab';
import OpticsLab from './OpticsLab';
import HeatLab from './HeatLab';
import AtomLab from './AtomLab';
import ChemicalStoichiometryLab from './ChemicalStoichiometryLab';
import RedoxLab from './RedoxLab';
import AcidBaseLab from './AcidBaseLab';
import ChemicalEquilibriumLab from './ChemicalEquilibriumLab';
import OrganicChemistryLab from './OrganicChemistryLab';
import MechanicsLab from './MechanicsLab'; // 引入力學實驗室

export default function ScienceLab({ onAddExp }) {
  const [currentLab, setCurrentLab] = useState(null);

  const labList = [
    {
      id: 'density',
      title: '基本測量與密度實驗室',
      unit: '國二理化 上學期 - 單元一 (密度)',
      desc: '探索質量、體積與密度的關係，體驗上皿/懸吊天平與排水法測體積。',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'concentration',
      title: '水溶液與濃度計算實驗室',
      unit: '國二理化 上學期 - 單元二 (濃度)',
      desc: '探索重量百分濃度、加水稀釋 (M1·C1 = M2·C2) 與 ppm 微量濃度計算。',
      icon: Droplets,
      color: 'from-blue-500/20 to-teal-500/20 border-blue-500/50 text-blue-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'transverse-wave',
      title: '橫波 (Transverse Wave) 模擬器',
      unit: '國二理化 上學期 - 單元三 (波動)',
      desc: '直觀呈現橫波質點上下振動與波形傳播，可調控振幅、頻率與波長。',
      icon: Activity,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/50 text-purple-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'optics',
      title: '幾何光學與透鏡鏡面實驗室',
      unit: '國二理化 上學期 - 單元四 (光學)',
      desc: '探索針孔成像、平面/凸凹面鏡反射與凸/凹透鏡折射光路作圖。',
      icon: Sun,
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'heat',
      title: '熱學與相變化實驗室',
      unit: '國二理化 上學期 - 單元五 (熱學)',
      desc: '操作冷熱水混合熱平衡 (H=M·S·ΔT) 與冰水蒸汽三相變化與潛熱計算。',
      icon: Thermometer,
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/50 text-rose-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'atom',
      title: '原子結構與化合物實驗室',
      unit: '國二理化 上學期 - 單元六 (原子)',
      desc: '探索 1~36 號八隅體結構與正負離子配平形成化合物。',
      icon: Atom,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-indigo-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'stoichiometry',
      title: '計量化學與反應式實驗室',
      unit: '國二理化 下學期 - 單元一 (計量化學)',
      desc: '探索反應式平衡係數規則、原子莫耳數計算與限量試劑關聯。',
      icon: Scale,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'redox',
      title: '氧化還原與金屬活性實驗室',
      unit: '國二理化 下學期 - 單元二 (氧化還原)',
      desc: '元素與氧化物搶氧活性比大小、氧化劑/還原劑判定與高中氧化數平衡法。',
      icon: Flame,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'acid-base',
      title: '酸鹼滴定與 pH 值實驗室',
      unit: '國二理化 下學期 - 單元三 (酸鹼鹽)',
      desc: '操作酸鹼中和滴定，觀察指示劑顏色變化與 pH 動態滴定曲線。',
      icon: Droplets,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/50 text-pink-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'equilibrium',
      title: '化學平衡與勒沙特列原理',
      unit: '國二理化 下學期 - 單元四 (化學平衡)',
      desc: '觀測動態平衡正逆反應速率與破壞平衡之勒沙特列移動方向預測。',
      icon: Scale,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'organic',
      title: '有機化合物與酯化反應',
      unit: '國二理化 下學期 - 單元五 (有機化)',
      desc: '探索有機烴類/醇/酸官能基結構式與酸醇酯化脫水縮合反應。',
      icon: Atom,
      color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/50 text-teal-400',
      badge: '已上線',
      isAvailable: true,
    },
    {
      id: 'mechanics',
      title: '力學 (摩擦力與浮力實驗室)',
      unit: '國二理化 下學期 - 單元六 (力學)',
      desc: '模擬靜/動摩擦力與外力圖形關係，及阿基米德浮力與沉浮條件。',
      icon: Scale,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400',
      badge: '全新上線',
      isAvailable: true,
    },
    {
      id: 'circuit',
      title: '歐姆定律與串並聯電路',
      unit: '國三理化 上學期 - 單元二',
      desc: '自由組裝開關、燈泡與電阻，即時觀測伏特計與安培計偏轉。',
      icon: Zap,
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400',
      badge: '開發中',
      isAvailable: false,
    }
  ];

  if (currentLab === 'density') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-cyan-400" /> 返回理化實驗室大廳</button><DensityLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'concentration') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-blue-400" /> 返回理化實驗室大廳</button><ConcentrationLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'transverse-wave') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-purple-400" /> 返回理化實驗室大廳</button><TransverseWaveLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'optics') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-amber-400" /> 返回理化實驗室大廳</button><OpticsLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'heat') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-rose-400" /> 返回理化實驗室大廳</button><HeatLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'atom') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-indigo-400" /> 返回理化實驗室大廳</button><AtomLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'stoichiometry') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-emerald-400" /> 返回理化實驗室大廳</button><ChemicalStoichiometryLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'redox') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-amber-400" /> 返回理化實驗室大廳</button><RedoxLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'acid-base') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-pink-400" /> 返回理化實驗室大廳</button><AcidBaseLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'equilibrium') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-emerald-400" /> 返回理化實驗室大廳</button><ChemicalEquilibriumLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'organic') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-teal-400" /> 返回理化實驗室大廳</button><OrganicChemistryLab onAddExp={onAddExp} /></div>);
  if (currentLab === 'mechanics') return (<div className="space-y-4"><button onClick={() => setCurrentLab(null)} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all shadow-md"><ArrowLeft className="w-4 h-4 text-amber-400" /> 返回理化實驗室大廳</button><MechanicsLab onAddExp={onAddExp} /></div>);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="border-b border-slate-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Beaker className="w-5 h-5 text-cyan-400" />
          互動理化實驗室 (Science Lab Portal)
        </h2>
        <p className="text-xs text-slate-400 mt-1">選擇主題單元進行變因操控與觀念視覺化探索</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labList.map((lab) => {
          const IconComponent = lab.icon;
          return (
            <div
              key={lab.id}
              onClick={() => lab.isAvailable && setCurrentLab(lab.id)}
              className={`border rounded-2xl p-5 bg-gradient-to-br transition-all flex flex-col justify-between relative overflow-hidden ${lab.color} ${
                lab.isAvailable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    lab.isAvailable ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {lab.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1">{lab.unit}</span>
                <h3 className="text-base font-bold text-white mb-2">{lab.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{lab.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  {lab.isAvailable ? '點擊進入實驗室 →' : '單元準備中'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}