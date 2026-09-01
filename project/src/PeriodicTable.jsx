import React, { useState, useEffect } from 'react';
import { Sparkles, Info, X, Search, Gamepad2, Award, RefreshCw, Timer, Trophy, Compass, Eye } from 'lucide-react';

export default function PeriodicTable({ onAddExp }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightCategory, setHighlightCategory] = useState('all');
  const [visitedElements, setVisitedElements] = useState([]);
  const [mode, setMode] = useState('table');

  // 成就勳章紀錄 ('rookie' | 'master' | 'explorer')
  const [badges, setBadges] = useState([]);

  // 測驗小遊戲狀態
  const [quizLevel, setQuizLevel] = useState('beginner'); 
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizStatusMessage, setQuizStatusMessage] = useState(null);
  
  // 專家級限時倒數 (5秒)
  const [timeLeft, setTimeLeft] = useState(5);
  const [quizFinished, setQuizFinished] = useState(false);

  // 完整 118 個元素資料庫
  const allElements = [
    { num: 1, symbol: "H", name: "氫", bopomofo: "ㄑㄧㄥ", mass: "1.008", period: 1, group: 1, category: "nonmetal", desc: "宇宙中最豐富的元素，密度最小的氣體，具可燃性，燃燒生成水。" },
    { num: 2, symbol: "He", name: "氦", bopomofo: "ㄏㄞˋ", mass: "4.003", period: 1, group: 18, category: "noble", desc: "惰性氣體，不可燃、比空氣輕，常用於填充氣球與飛船。" },
    { num: 3, symbol: "Li", name: "鋰", bopomofo: "ㄌㄧˇ", mass: "6.941", period: 2, group: 1, category: "alkali", desc: "鹼金屬，密度最小的金屬，活性極大，需儲存在石蠟油中。" },
    { num: 4, symbol: "Be", name: "鈹", bopomofo: "ㄆㄧˊ", mass: "9.012", period: 2, group: 2, category: "alkaline-earth", desc: "鹼土金屬，質輕且硬度高，常用於航太與合金材料。" },
    { num: 5, symbol: "B", name: "硼", bopomofo: "ㄆㄥˊ", mass: "10.81", period: 2, group: 13, category: "metalloid", desc: "類金屬，硼砂與硼酸常用於清潔劑與消毒抑菌。" },
    { num: 6, symbol: "C", name: "碳", bopomofo: "ㄊㄢˋ", mass: "12.01", period: 2, group: 14, category: "nonmetal", desc: "有機化合物的核心元素，具鑽石、石墨、石墨烯等多種同素異形體。" },
    { num: 7, symbol: "N", name: "氮", bopomofo: "ㄉㄢˋ", mass: "14.01", period: 2, group: 15, category: "nonmetal", desc: "空氣中含量最多（約 78%）的氣體，常溫下化學性質穩定。" },
    { num: 8, symbol: "O", name: "氧", bopomofo: "ㄧㄤˇ", mass: "16.00", period: 2, group: 16, category: "nonmetal", desc: "空氣中含量第二多（約 21%）的氣體，具助燃性，生物呼吸作用必需。" },
    { num: 9, symbol: "F", name: "氟", bopomofo: "ㄈㄨˊ", mass: "19.00", period: 2, group: 17, category: "halogen", desc: "鹵素，非金屬活性最強的元素，氟化物常用於預防蛀牙。" },
    { num: 10, symbol: "Ne", name: "氖", bopomofo: "ㄋㄞˇ", mass: "20.18", period: 2, group: 18, category: "noble", desc: "惰性氣體，通電時發出紅橙色光，常用於霓虹燈。" },
    { num: 11, symbol: "Na", name: "鈉", bopomofo: "ㄋㄚˋ", mass: "22.99", period: 3, group: 1, category: "alkali", desc: "鹼金屬，質軟，活性大，遇水劇烈反應產生氫氣與強鹼。" },
    { num: 12, symbol: "Mg", name: "鎂", bopomofo: "ㄇㄟˇ", mass: "24.31", period: 3, group: 2, category: "alkaline-earth", desc: "鹼土金屬，燃燒時發出耀眼的強烈白光，常用於煙火。" },
    { num: 13, symbol: "Al", name: "鋁", bopomofo: "ㄌㄩˇ", mass: "26.98", period: 3, group: 13, category: "post-transition", desc: "地殼中含量最多的金屬元素，延展性佳，表面具緻密氧化層。" },
    { num: 14, symbol: "Si", name: "矽", bopomofo: "ㄒㄧˋ", mass: "28.09", period: 3, group: 14, category: "metalloid", desc: "地殼含量第二多的元素，半導體產業（晶圓、晶片）的核心原料。" },
    { num: 15, symbol: "P", name: "磷", bopomofo: "ㄌㄧㄣˊ", mass: "30.97", period: 3, group: 15, category: "nonmetal", desc: "存在於骨骼與 DNA 中。紅磷常用於火柴盒側邊的摩擦面。" },
    { num: 16, symbol: "S", name: "硫", bopomofo: "ㄌㄧㄡˊ", mass: "32.06", period: 3, group: 16, category: "nonmetal", desc: "黃色固體，燃燒產生具刺激臭味的二氧化硫（酸雨主因之一）。" },
    { num: 17, symbol: "Cl", name: "氯", bopomofo: "ㄌㄩˋ", mass: "35.45", period: 3, group: 17, category: "halogen", desc: "黃綠色毒氣，具強氧化性，常用於自來水消毒與漂白水。" },
    { num: 18, symbol: "Ar", name: "氬", bopomofo: "ㄧㄚˋ", mass: "39.95", period: 3, group: 18, category: "noble", desc: "空氣中含量最多的惰性氣體（約 0.93%），用於填充燈泡防止氧化。" },
    { num: 19, symbol: "K", name: "鉀", bopomofo: "ㄐㄧㄚˇ", mass: "39.10", period: 4, group: 1, category: "alkali", desc: "鹼金屬，活性極高，植物生長三要素（氮、磷、鉀）之一。" },
    { num: 20, symbol: "Ca", name: "鈣", bopomofo: "ㄍㄞˋ", mass: "40.08", period: 4, group: 2, category: "alkaline-earth", desc: "人體骨骼與牙齒的主要成分，鈣離子參與血液凝固與肌肉收縮。" },
    { num: 21, symbol: "Sc", name: "鈧", bopomofo: "ㄎㄤˋ", mass: "44.96", period: 4, group: 3, category: "transition", desc: "過渡金屬，常用於高強度鋁鈧合金與高壓鈉燈。" },
    { num: 22, symbol: "Ti", name: "鈦", bopomofo: "ㄊㄞˋ", mass: "47.87", period: 4, group: 4, category: "transition", desc: "強度高、重量輕、耐腐蝕，廣泛用於航太、醫療植入物與眼鏡架。" },
    { num: 23, symbol: "V", name: "釩", bopomofo: "ㄈㄢˊ", mass: "50.94", period: 4, group: 5, category: "transition", desc: "常用於鋼鐵合金（釩鋼），可大幅提升鋼材的強度與韌性。" },
    { num: 24, symbol: "Cr", name: "鉻", bopomofo: "ㄍㄜˋ", mass: "52.00", period: 4, group: 6, category: "transition", desc: "質硬且具光澤，常用於電鍍保護層與不銹鋼製造。" },
    { num: 25, symbol: "Mn", name: "錳", bopomofo: "ㄇㄥˇ", mass: "54.94", period: 4, group: 7, category: "transition", desc: "脫硫與脫氧劑，是鋼鐵冶煉不可或缺的添加金屬。" },
    { num: 26, symbol: "Fe", name: "鐵", bopomofo: "ㄊㄧㄝˇ", mass: "55.85", period: 4, group: 8, category: "transition", desc: "地殼含量第二多的金屬，血紅素核心成分，工業應用廣泛。" },
    { num: 27, symbol: "Co", name: "鈷", bopomofo: "ㄍㄨˇ", mass: "58.93", period: 4, group: 9, category: "transition", desc: "高硬度與耐高溫金屬，鋰電池正極材料與強磁合金的核心成分。" },
    { num: 28, symbol: "Ni", name: "鎳", bopomofo: "ㄋㄧㄝˋ", mass: "58.69", period: 4, group: 10, category: "transition", desc: "耐腐蝕，廣泛用於不銹鋼、硬幣製造與充電電池。" },
    { num: 29, symbol: "Cu", name: "銅", bopomofo: "ㄊㄨㄥˊ", mass: "63.55", period: 4, group: 11, category: "transition", desc: "導電與導熱性極佳，紫紅色金屬，廣泛用於電線與電路板。" },
    { num: 30, symbol: "Zn", name: "鋅", bopomofo: "ㄒㄧㄣ", mass: "65.38", period: 4, group: 12, category: "transition", desc: "常用於鋼鐵防鏽（鍍鋅鋼）與黃銅合金（銅鋅合金）。" },
    { num: 31, symbol: "Ga", name: "鎵", bopomofo: "ㄐㄧㄚ", mass: "69.72", period: 4, group: 13, category: "post-transition", desc: "熔點極低（約 29.8°C，手溫即可融化），砷化鎵用於半導體元件。" },
    { num: 32, symbol: "Ge", name: "鍺", bopomofo: "ㄓㄜˇ", mass: "72.63", period: 4, group: 14, category: "metalloid", desc: "類金屬，早期的半導體材料，常用於紅外光學元件與纖維光學。" },
    { num: 33, symbol: "As", name: "砷", bopomofo: "ㄕㄣ", mass: "74.92", period: 4, group: 15, category: "metalloid", desc: "類金屬，化合物（如三氧化二砷，俗稱砒霜）具劇毒。" },
    { num: 34, symbol: "Se", name: "硒", bopomofo: "ㄒㄧ", mass: "78.97", period: 4, group: 16, category: "nonmetal", desc: "具光電效應與導電特性，常用於影印機感光鼓與太陽能電池。" },
    { num: 35, symbol: "Br", name: "溴", bopomofo: "ㄒㄧㄡˋ", mass: "79.90", period: 4, group: 17, category: "halogen", desc: "常溫下唯一呈液態的非金屬元素，紅棕色具揮發性與刺激性。" },
    { num: 36, symbol: "Kr", name: "氪", bopomofo: "ㄎㄜˋ", mass: "83.80", period: 4, group: 18, category: "noble", desc: "惰性氣體，通電發強烈白光，常用於機場跑道燈與閃光燈。" },
    { num: 37, symbol: "Rb", name: "銣", bopomofo: "ㄖㄨˊ", mass: "85.47", period: 5, group: 1, category: "alkali", desc: "鹼金屬，活性極大，常用於精密原子鐘。" },
    { num: 38, symbol: "Sr", name: "鍶", bopomofo: "ㄙ", mass: "87.62", period: 5, group: 2, category: "alkaline-earth", desc: "鹼土金屬，燃燒發出深紅色火焰，常用於紅色煙火。" },
    { num: 39, symbol: "Y", name: "釔", bopomofo: "ㄧˇ", mass: "88.91", period: 5, group: 3, category: "transition", desc: "稀土金屬之一，用於高溫超導體與雷射晶體。" },
    { num: 40, symbol: "Zr", name: "鋯", bopomofo: "ㄍㄠˋ", mass: "91.22", period: 5, group: 4, category: "transition", desc: "抗腐蝕性強，對中子吸收率低，用於核反應堆包覆管。" },
    { num: 41, symbol: "Nb", name: "鈮", bopomofo: "ㄋㄧˊ", mass: "92.91", period: 5, group: 5, category: "transition", desc: "常用於超導合金與高強度鋼材。" },
    { num: 42, symbol: "Mo", name: "鉬", bopomofo: "ㄇㄨˋ", mass: "95.95", period: 5, group: 6, category: "transition", desc: "高熔點金屬，能顯著提升合金鋼硬度與抗腐蝕力。" },
    { num: 43, symbol: "Tc", name: "鍀", bopomofo: "ㄉㄜˊ", mass: "98.00", period: 5, group: 7, category: "transition", desc: "首個人工合成元素，具放射性，用於醫學診斷。" },
    { num: 44, symbol: "Ru", name: "釕", bopomofo: "ㄌㄧㄠˇ", mass: "101.1", period: 5, group: 8, category: "transition", desc: "鉑族金屬，硬度高，常用於硬碟耐磨塗層。" },
    { num: 45, symbol: "Rh", name: "銠", bopomofo: "ㄌㄠˇ", mass: "102.9", period: 5, group: 9, category: "transition", desc: "稀有昂貴金屬，用於汽車觸媒轉換器。" },
    { num: 46, symbol: "Pd", name: "鈀", bopomofo: "ㄅㄚˇ", mass: "106.4", period: 5, group: 10, category: "transition", desc: "機能貴金屬，能吸收大量氫氣，用於觸媒與氫氣淨化。" },
    { num: 47, symbol: "Ag", name: "銀", bopomofo: "ㄧㄣˊ", mass: "107.9", period: 5, group: 11, category: "transition", desc: "導電導熱性最高的金屬，具良好抗菌效果。" },
    { num: 48, symbol: "Cd", name: "鎘", bopomofo: "ㄍㄜˊ", mass: "112.4", period: 5, group: 12, category: "transition", desc: "有毒重金屬，曾用於電池與防鏽塗層。" },
    { num: 49, symbol: "In", name: "銦", bopomofo: "ㄧㄣ", mass: "114.8", period: 5, group: 13, category: "post-transition", desc: "質軟金屬，ITO 用於顯示器與觸控面板。" },
    { num: 50, symbol: "Sn", name: "錫", bopomofo: "ㄒㄧ", mass: "118.7", period: 5, group: 14, category: "post-transition", desc: "延展性佳，常用於電路焊接（焊錫）與防鏽罐頭。" },
    { num: 51, symbol: "Sb", name: "銻", bopomofo: "ㄊㄧˋ", mass: "121.8", period: 5, group: 15, category: "metalloid", desc: "類金屬，主要用於鉛酸電池合金與阻燃劑。" },
    { num: 52, symbol: "Te", name: "碲", bopomofo: "ㄉㄧˋ", mass: "127.6", period: 5, group: 16, category: "metalloid", desc: "類金屬，主要用於合金添加與太陽能電池。" },
    { num: 53, symbol: "I", name: "碘", bopomofo: "ㄉㄧㄢˇ", mass: "126.9", period: 5, group: 17, category: "halogen", desc: "紫黑色固體，加熱易昇華。碘液用於檢驗澱粉。" },
    { num: 54, symbol: "Xe", name: "氙", bopomofo: "ㄒㄧㄢ", mass: "131.3", period: 5, group: 18, category: "noble", desc: "高密度惰性氣體，用於氙氣燈與醫學麻醉。" },
    { num: 55, symbol: "Cs", name: "銫", bopomofo: "ㄙㄜˋ", mass: "132.9", period: 6, group: 1, category: "alkali", desc: "鹼金屬，熔點低，銫原子鐘為國際時間標準。" },
    { num: 56, symbol: "Ba", name: "鋇", bopomofo: "ㄅㄟˋ", mass: "137.3", period: 6, group: 2, category: "alkaline-earth", desc: "鹼土金屬，硫酸鋇常用於消化道 X 光造影。" },
    { num: 57, symbol: "La", name: "鑭", bopomofo: "ㄌㄢˊ", mass: "138.9", period: 6, group: 3, category: "lanthanide", desc: "鑭系之首，用於相機光學玻璃與電池。" },
    { num: 58, symbol: "Ce", name: "鈰", bopomofo: "ㄕˋ", mass: "140.1", period: 6, group: 3, category: "lanthanide", desc: "含量最多的稀土元素，用於拋光與發火石。" },
    { num: 59, symbol: "Pr", name: "鐠", bopomofo: "ㄆㄨˇ", mass: "140.9", period: 6, group: 3, category: "lanthanide", desc: "用於製造強磁合金與護目鏡黃色顏料。" },
    { num: 60, symbol: "Nd", name: "釹", bopomofo: "ㄋㄩˇ", mass: "144.2", period: 6, group: 3, category: "lanthanide", desc: "釹鐵硼永磁材料核心成分，廣泛用於馬達。" },
    { num: 61, symbol: "Pm", name: "鉕", bopomofo: "ㄆㄛˇ", mass: "145.0", period: 6, group: 3, category: "lanthanide", desc: "具放射性的稀土元素，用於小型核電池。" },
    { num: 62, symbol: "Sm", name: "釤", bopomofo: "ㄕㄢ", mass: "150.4", period: 6, group: 3, category: "lanthanide", desc: "用於製造高溫釤鈷永磁鐵與核反應棒。" },
    { num: 63, symbol: "Eu", name: "銪", bopomofo: "ㄧㄡˇ", mass: "152.0", period: 6, group: 3, category: "lanthanide", desc: "用於顯示器紅光螢光粉與防偽墨水。" },
    { num: 64, symbol: "Gd", name: "釓", bopomofo: "ㄍㄚˊ", mass: "157.2", period: 6, group: 3, category: "lanthanide", desc: "具特殊磁性，廣泛用作 MRI 對比劑。" },
    { num: 65, symbol: "Tb", name: "鋱", bopomofo: "ㄊㄜˋ", mass: "158.9", period: 6, group: 3, category: "lanthanide", desc: "用於綠色螢光粉與高溫超導體。" },
    { num: 66, symbol: "Dy", name: "鏑", bopomofo: "ㄉㄧ", mass: "162.5", period: 6, group: 3, category: "lanthanide", desc: "用於提升磁鐵耐高溫特性與雷射材料。" },
    { num: 67, symbol: "Ho", name: "", bopomofo: "ㄏㄨㄛˇ", mass: "164.9", period: 6, group: 3, category: "lanthanide", desc: "具極高磁矩，用於醫療雷射手術刀。" },
    { num: 68, symbol: "Er", name: "鉺", bopomofo: "ㄦˇ", mass: "167.3", period: 6, group: 3, category: "lanthanide", desc: "摻鉺光纖放大器是通訊網路的核心元件。" },
    { num: 69, symbol: "Tm", name: "銩", bopomofo: "ㄉㄧㄡ", mass: "168.9", period: 6, group: 3, category: "lanthanide", desc: "稀少稀土金屬，用於可攜式 X 光源。" },
    { num: 70, symbol: "Yb", name: "鐿", bopomofo: "ㄧˋ", mass: "173.1", period: 6, group: 3, category: "lanthanide", desc: "用於高功率雷射與高精度光學原子鐘。" },
    { num: 71, symbol: "Lu", name: "鎦", bopomofo: "ㄌㄧㄡˊ", mass: "175.0", period: 6, group: 3, category: "lanthanide", desc: "鑭系終點，密度高，用於 PET 正電子斷層掃描。" },
    { num: 72, symbol: "Hf", name: "鉿", bopomofo: "ㄏㄚ", mass: "178.5", period: 6, group: 4, category: "transition", desc: "耐腐蝕，吸收中子力強，用於核潛艇控制棒。" },
    { num: 73, symbol: "Ta", name: "鉭", bopomofo: "ㄊㄢˇ", mass: "180.9", period: 6, group: 5, category: "transition", desc: "極度耐腐蝕，高容量鉭電容用於手機。" },
    { num: 74, symbol: "W", name: "鎢", bopomofo: "ㄨ", mass: "183.8", period: 6, group: 6, category: "transition", desc: "熔點最高金屬（3422°C），用於燈絲與刀具。" },
    { num: 75, symbol: "Re", name: "錸", bopomofo: "ㄌㄞˊ", mass: "186.2", period: 6, group: 7, category: "transition", desc: "用於噴射引擎高溫單晶合金。" },
    { num: 76, symbol: "Os", name: "鋨", bopomofo: "ㄜˊ", mass: "190.2", period: 6, group: 8, category: "transition", desc: "密度最高的天然元素（22.59 g/cm³）。" },
    { num: 77, symbol: "Ir", name: "銥", bopomofo: "ㄧ", mass: "192.2", period: 6, group: 9, category: "transition", desc: "耐腐蝕最強金屬，隕石坑銥元素為恐龍滅絕證據。" },
    { num: 78, symbol: "Pt", name: "鉑", bopomofo: "ㄅㄛˊ", mass: "195.1", period: 6, group: 10, category: "transition", desc: "俗稱白金，用於觸媒轉換器與首飾。" },
    { num: 79, symbol: "Au", name: "金", bopomofo: "ㄐㄧㄣ", mass: "197.0", period: 6, group: 11, category: "transition", desc: "延展性最強，化學性質極不活潑。" },
    { num: 80, symbol: "Hg", name: "汞", bopomofo: "ㄍㄨㄥˇ", mass: "200.6", period: 6, group: 12, category: "transition", desc: "常溫唯一液態金屬，具毒性，俗稱水銀。" },
    { num: 81, symbol: "Tl", name: "鉈", bopomofo: "ㄊㄚ", mass: "204.4", period: 6, group: 13, category: "post-transition", desc: "劇毒重金屬，無味，致脫髮與神經受損。" },
    { num: 82, symbol: "Pb", name: "鉛", bopomofo: "ㄑㄧㄢ", mass: "207.2", period: 6, group: 14, category: "post-transition", desc: "高密度重金屬，阻擋 X 射線防輻射。" },
    { num: 83, symbol: "Bi", name: "鉍", bopomofo: "ㄅㄧˋ", mass: "209.0", period: 6, group: 15, category: "post-transition", desc: "重金屬中無毒者，結晶呈繽紛彩虹光澤。" },
    { num: 84, symbol: "Po", name: "釙", bopomofo: "ㄆㄛˋ", mass: "209.0", period: 6, group: 16, category: "post-transition", desc: "居禮夫人發現之劇毒放射性元素。" },
    { num: 85, symbol: "At", name: "砹", bopomofo: "ㄞˋ", mass: "210.0", period: 6, group: 17, category: "halogen", desc: "地殼極稀有天然元素，用於標靶放療。" },
    { num: 86, symbol: "Rn", name: "氡", bopomofo: "ㄉㄨㄥ", mass: "222.0", period: 6, group: 18, category: "noble", desc: "無色無味放射性氣體，為室內輻射來源。" },
    { num: 87, symbol: "Fr", name: "鈁", bopomofo: "ㄈㄤ", mass: "223.0", period: 7, group: 1, category: "alkali", desc: "半衰期僅22分鐘，天然存在量極少。" },
    { num: 88, symbol: "Ra", name: "鐳", bopomofo: "ㄌㄟˊ", mass: "226.0", period: 7, group: 2, category: "alkaline-earth", desc: "居禮夫人發現，衰變發藍光，曾用於夜光劑。" },
    { num: 89, symbol: "Ac", name: "錒", bopomofo: "ㄚ", mass: "227.0", period: 7, group: 3, category: "actinide", desc: "錒系之首，具強放射性，發淺藍螢光。" },
    { num: 90, symbol: "Th", name: "釷", bopomofo: "ㄊㄨˇ", mass: "232.0", period: 7, group: 3, category: "actinide", desc: "天然放射性元素，下一代核能釷反應堆燃料。" },
    { num: 91, symbol: "Pa", name: "鏷", bopomofo: "ㄆㄨˊ", mass: "231.0", period: 7, group: 3, category: "actinide", desc: "極稀有放射性金屬，鈾衰變鏈中間產物。" },
    { num: 92, symbol: "U", name: "鈾", bopomofo: "ㄧㄡˊ", mass: "238.0", period: 7, group: 3, category: "actinide", desc: "天然最重元素，U-235 為核能與核武原料。" },
    { num: 93, symbol: "Np", name: "鎿", bopomofo: "ㄋㄚˊ", mass: "237.0", period: 7, group: 3, category: "actinide", desc: "首個超鈾元素，由鈾吸收中子衰變而成。" },
    { num: 94, symbol: "Pu", name: "鈈", bopomofo: "ㄅㄨˋ", mass: "244.0", period: 7, group: 3, category: "actinide", desc: "Pu-239 為核武與深空探測核電池燃料。" },
    { num: 95, symbol: "Am", name: "鎇", bopomofo: "ㄇㄟˊ", mass: "243.0", period: 7, group: 3, category: "actinide", desc: "人造元素，Am-241 用於家用煙霧警報器。" },
    { num: 96, symbol: "Cm", name: "鋦", bopomofo: "ㄐㄩˊ", mass: "247.0", period: 7, group: 3, category: "actinide", desc: "以居禮夫婦命名，用於火星車探測儀。" },
    { num: 97, symbol: "Bk", name: "鉳", bopomofo: "ㄅㄟˇ", mass: "247.0", period: 7, group: 3, category: "actinide", desc: "以加州大學柏克萊分校命名的人造超鈾元素。" },
    { num: 98, symbol: "Cf", name: "鉲", bopomofo: "ㄎㄚˇ", mass: "251.0", period: 7, group: 3, category: "actinide", desc: "昂貴高強度中子源，用於油井探測。" },
    { num: 99, symbol: "Es", name: "鎄", bopomofo: "ㄞ", mass: "252.0", period: 7, group: 3, category: "actinide", desc: "以愛因斯坦命名，氫彈廢墟中首次發現。" },
    { num: 100, symbol: "Fm", name: "鐨", bopomofo: "ㄈㄟˋ", mass: "257.0", period: 7, group: 3, category: "actinide", desc: "以費米命名，反應堆中可製造最重元素。" },
    { num: 101, symbol: "Md", name: "鍆", bopomofo: "ㄇㄣˊ", mass: "258.0", period: 7, group: 3, category: "actinide", desc: "以門得列夫命名，首次單原子計數確認。" },
    { num: 102, symbol: "No", name: "鍩", bopomofo: "ㄋㄨㄛˋ", mass: "259.0", period: 7, group: 3, category: "actinide", desc: "以諾貝爾命名的人造超重放射性元素。" },
    { num: 103, symbol: "Lr", name: "鐒", bopomofo: "ㄌㄠˊ", mass: "266.0", period: 7, group: 3, category: "actinide", desc: "錒系終點，以迴旋加速器發明人勞倫斯命名。" },
    { num: 104, symbol: "Rf", name: "鑪", bopomofo: "ㄌㄨˊ", mass: "267.0", period: 7, group: 4, category: "transition", desc: "超錒系元素，半衰期極短，以拉塞福命名。" },
    { num: 105, symbol: "Db", name: "𨧀", bopomofo: "ㄉㄨˇ", mass: "268.0", period: 7, group: 5, category: "transition", desc: "人工超重元素，以杜布納研究所命名。" },
    { num: 106, symbol: "Sg", name: "𨭎", bopomofo: "ㄒㄧˇ", mass: "269.0", period: 7, group: 6, category: "transition", desc: "首個以當時健在科學家（西博格）命名。" },
    { num: 107, symbol: "Bh", name: "𨨏", bopomofo: "ㄅㄛ", mass: "270.0", period: 7, group: 7, category: "transition", desc: "人工放射性金屬，以丹麥物理學家波耳命名。" },
    { num: 108, symbol: "Hs", name: "𨭆", bopomofo: "ㄏㄟ", mass: "277.0", period: 7, group: 8, category: "transition", desc: "以德國黑森州命名，預測性質似鋨。" },
    { num: 109, symbol: "Mt", name: "䥑", bopomofo: "ㄇㄞˋ", mass: "278.0", period: 7, group: 9, category: "transition", desc: "以核物理學家邁特納命名。" },
    { num: 110, symbol: "Ds", name: "鐽", bopomofo: "ㄉㄚˊ", mass: "281.0", period: 7, group: 10, category: "transition", desc: "以德國達姆施塔特重離子研究所命名。" },
    { num: 111, symbol: "Rg", name: "錀", bopomofo: "ㄌㄨㄣˊ", mass: "282.0", period: 7, group: 11, category: "transition", desc: "以 X 射線發現者倫琴命名。" },
    { num: 112, symbol: "Cn", name: "鎶", bopomofo: "ㄍㄜ", mass: "285.0", period: 7, group: 12, category: "transition", desc: "以哥白尼命名，研究預測具揮發性。" },
    { num: 113, symbol: "Nh", name: "鉨", bopomofo: "ㄋㄧˇ", mass: "286.0", period: 7, group: 13, category: "post-transition", desc: "首個亞洲團隊（日本理研）成功合成命名。" },
    { num: 114, symbol: "Fl", name: "𤨡", bopomofo: "ㄈㄨˇ", mass: "289.0", period: 7, group: 14, category: "post-transition", desc: "以弗廖洛夫實驗室命名，位於穩定島邊緣。" },
    { num: 115, symbol: "Mc", name: "鏌", bopomofo: "ㄇㄛˋ", mass: "290.0", period: 7, group: 15, category: "post-transition", desc: "以莫斯科州命名之超重人造金屬。" },
    { num: 116, symbol: "Lv", name: "鉝", bopomofo: "ㄌㄧˋ", mass: "293.0", period: 7, group: 16, category: "post-transition", desc: "以美國勞倫斯利福摩爾國家實驗室命名。" },
    { num: 117, symbol: "Ts", name: "鿬", bopomofo: "ㄊㄧㄢˊ", mass: "294.0", period: 7, group: 17, category: "halogen", desc: "以美國田納西州命名的人造鹵素。" },
    { num: 118, symbol: "Og", name: "鿫", bopomofo: "ㄠˋ", mass: "294.0", period: 7, group: 18, category: "noble", desc: "週期表最後一個元素，以物理學家奧加涅相命名。" }
  ];

  const categoryStyles = {
    alkali: "bg-rose-950/70 border-rose-600/80 text-rose-300 hover:bg-rose-900/90",
    "alkaline-earth": "bg-amber-950/70 border-amber-600/80 text-amber-300 hover:bg-amber-900/90",
    transition: "bg-pink-950/50 border-pink-700/60 text-pink-300 hover:bg-pink-900/80",
    "post-transition": "bg-slate-700/80 border-slate-500/80 text-slate-200 hover:bg-slate-600/90",
    metalloid: "bg-teal-950/70 border-teal-600/80 text-teal-300 hover:bg-teal-900/90",
    nonmetal: "bg-emerald-950/70 border-emerald-600/80 text-emerald-300 hover:bg-emerald-900/90",
    halogen: "bg-purple-950/70 border-purple-600/80 text-purple-300 hover:bg-purple-900/90",
    noble: "bg-indigo-950/70 border-indigo-600/80 text-indigo-300 hover:bg-indigo-900/90",
    lanthanide: "bg-fuchsia-950/70 border-fuchsia-600/80 text-fuchsia-300 hover:bg-fuchsia-900/90",
    actinide: "bg-violet-950/70 border-violet-600/80 text-violet-300 hover:bg-violet-900/90"
  };

  const categoryNames = {
    alkali: "鹼金屬", "alkaline-earth": "鹼土金屬", transition: "過渡金屬",
    "post-transition": "貧金屬/其他", metalloid: "類金屬", nonmetal: "非金屬",
    halogen: "鹵素", noble: "惰性氣體", lanthanide: "鑭系元素", actinide: "錒系元素"
  };

  const groups = Array.from({ length: 18 }, (_, i) => i + 1);

  const handleSelectElement = (el) => {
    setSelectedElement(el);
    if (!visitedElements.includes(el.num)) {
      const updated = [...visitedElements, el.num];
      setVisitedElements(updated);

      if (updated.length === 118 && !badges.includes('explorer')) {
        setBadges([...badges, 'explorer']);
        if (onAddExp) onAddExp(500);
      }
    }
  };

  useEffect(() => {
    let timer;
    if (mode === 'quiz' && quizLevel === 'expert' && !isQuizAnswered && !quizFinished) {
      if (timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        handleQuizAnswer(null);
      }
    }
    return () => clearInterval(timer);
  }, [mode, quizLevel, timeLeft, isQuizAnswered, quizFinished]);

  const generateQuiz = (lvl = quizLevel) => {
    const pool = lvl === 'beginner' 
      ? allElements.filter(e => e.num <= 36)
      : allElements;

    let target = pool[Math.floor(Math.random() * pool.length)];
    if (currentQuiz && pool.length > 1) {
      while (target.num === currentQuiz.num) {
        target = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    const wrongOptions = [];
    while (wrongOptions.length < 3) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      if (rand.num !== target.num && !wrongOptions.includes(rand)) {
        wrongOptions.push(rand);
      }
    }
    const shuffled = [...wrongOptions, target].sort(() => Math.random() - 0.5);
    setCurrentQuiz(target);
    setQuizOptions(shuffled);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setQuizStatusMessage(null);
    setTimeLeft(5);
  };

  const startQuizMode = (lvl) => {
    setQuizLevel(lvl);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizStatusMessage(null);
    setMode('quiz');
    generateQuiz(lvl);
  };

  const handleQuizAnswer = (opt) => {
    if (isQuizAnswered) return;
    setSelectedQuizOption(opt);
    setIsQuizAnswered(true);

    if (opt && opt.num === currentQuiz.num) {
      const newScore = quizScore + 1;
      setQuizScore(newScore);

      if (quizLevel === 'beginner' && newScore >= 36 && !badges.includes('rookie')) {
        setBadges([...badges, 'rookie']);
        setQuizStatusMessage({ type: 'success', text: '恭喜！成功連續答對 36 題，解鎖「元素週期表新手」勳章！ +200 EXP' });
        if (onAddExp) onAddExp(200);
      } else if (quizLevel === 'expert' && newScore >= 100 && !badges.includes('master')) {
        setBadges([...badges, 'master']);
        setQuizStatusMessage({ type: 'success', text: '太強了！完美挑戰連續 100 題專家限時關卡！解鎖「元素週期表大師」極稀有勳章！ +500 EXP' });
        if (onAddExp) onAddExp(500);
      } else {
        if (onAddExp) onAddExp(quizLevel === 'expert' ? 30 : 10);
      }
    } else {
      setQuizScore(0);
      setQuizStatusMessage({ 
        type: 'error', 
        text: opt === null ? '時間到！連勝紀錄歸零重來。' : `答錯囉！正確答案是 ${currentQuiz.symbol} (${currentQuiz.name})。連勝紀錄重置！` 
      });
    }
  };

  const isElementMatch = (el) => {
    if (!el || el.isPlaceholder) return true;
    if (highlightCategory !== 'all' && el.category !== highlightCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      return el.symbol.toLowerCase().includes(q) || el.name.includes(q) || el.bopomofo.includes(q) || el.num.toString() === q;
    }
    return true;
  };

  const getMainElement = (p, g) => {
    if (p === 6 && g === 3) return { isPlaceholder: true, name: "57-71\n鑭系", category: "lanthanide" };
    if (p === 7 && g === 3) return { isPlaceholder: true, name: "89-103\n錒系", category: "actinide" };
    return allElements.find(e => e.period === p && e.group === g && e.num !== 57 && e.num !== 89);
  };

  const lanthanides = allElements.filter(e => e.num >= 57 && e.num <= 71);
  const actinides = allElements.filter(e => e.num >= 89 && e.num <= 103);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-amber-400" />
            深化元素週期表
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-indigo-400" /> 已探索: {visitedElements.length} / 118 元素
            </span>

            {badges.includes('rookie') && (
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <Trophy className="w-3 h-3 text-emerald-400" /> 元素週期表新手
              </span>
            )}
            {badges.includes('master') && (
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium animate-pulse">
                <Award className="w-3 h-3 text-rose-400" /> 元素週期表大師
              </span>
            )}
            {badges.includes('explorer') && (
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <Compass className="w-3 h-3 text-amber-400" /> 元素週期表探索家 (全解鎖)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            圖表探索模式
          </button>
          <button
            onClick={() => startQuizMode('beginner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'quiz' && quizLevel === 'beginner' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            入門挑戰 (連續36題)
          </button>
          <button
            onClick={() => startQuizMode('expert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'quiz' && quizLevel === 'expert' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            專家限時挑戰 (連續100題/5s)
          </button>
        </div>
      </div>

      {mode === 'table' ? (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋元素（中文/符號/注音，例如：氫、Na、ㄑㄧㄥ）..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
                  清除
                </button>
              )}
            </div>

            <select
              value={highlightCategory}
              onChange={(e) => setHighlightCategory(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">顯示所有族群分類</option>
              {Object.keys(categoryNames).map(cat => (
                <option key={cat} value={cat}>{categoryNames[cat]}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1020px]">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', gap: '4px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map(p => (
                  <React.Fragment key={`period-${p}`}>
                    {groups.map(g => {
                      const el = getMainElement(p, g);
                      if (!el) return <div key={`p${p}-g${g}`}></div>;
                      if (el.isPlaceholder) {
                        return (
                          <div 
                            key={`placeholder-${p}`}
                            className={`p-1 rounded-lg border text-center flex items-center justify-center text-[10px] font-bold leading-tight opacity-80 ${categoryStyles[el.category]}`}
                          >
                            {el.name}
                          </div>
                        );
                      }
                      return (
                        <ElementCard 
                          key={el.num} 
                          el={el} 
                          onClick={() => handleSelectElement(el)} 
                          styles={categoryStyles[el.category]} 
                          isDimmed={!isElementMatch(el)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              <div className="my-6 border-t border-slate-700/80 pt-4">
                <p className="text-xs text-slate-400 mb-3 font-medium">下方獨立展示區（鑭系與錒系元素）：</p>

                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[11px] text-fuchsia-400 font-bold w-12 shrink-0">鑭系</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: '4px', flex: 1 }}>
                    {lanthanides.map(el => (
                      <ElementCard 
                        key={el.num} 
                        el={el} 
                        onClick={() => handleSelectElement(el)} 
                        styles={categoryStyles.lanthanide} 
                        isDimmed={!isElementMatch(el)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-violet-400 font-bold w-12 shrink-0">錒系</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gap: '4px', flex: 1 }}>
                    {actinides.map(el => (
                      <ElementCard 
                        key={el.num} 
                        el={el} 
                        onClick={() => handleSelectElement(el)} 
                        styles={categoryStyles.actinide} 
                        isDimmed={!isElementMatch(el)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 小遊戲 UI */
        <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 text-center max-w-xl mx-auto my-4 shadow-2xl relative overflow-hidden">
          {quizLevel === 'expert' && !isQuizAnswered && (
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            ></div>
          )}

          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              quizLevel === 'beginner' 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}>
              {quizLevel === 'beginner' ? '入門級 (目標：連續答對 36 題)' : '專家級 (目標：連續答對 100 題/5s)'}
            </span>

            <div className="flex items-center gap-3 text-xs">
              {quizLevel === 'expert' && (
                <span className={`font-bold flex items-center gap-1 ${timeLeft <= 2 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`}>
                  <Timer className="w-3.5 h-3.5" /> {timeLeft}s
                </span>
              )}
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                目前連勝：{quizScore} {quizLevel === 'beginner' ? '/ 36' : '/ 100'}
              </span>
            </div>
          </div>

          {currentQuiz && (
            <div>
              <p className="text-xs text-indigo-400 mb-1">請選擇正確的元素符號</p>
              <h3 className="text-3xl font-bold text-white mb-2">
                {currentQuiz.name}
                <span className="text-lg text-slate-400 font-normal ml-2">({currentQuiz.bopomofo})</span>
              </h3>

              {/* 依據模式隱藏或顯示原子序提示 */}
              <p className="text-xs text-slate-400 mb-6">
                {quizLevel === 'beginner' ? (
                  <>原子序：{currentQuiz.num} | 提示：{currentQuiz.desc.slice(0, 25)}...</>
                ) : (
                  <>提示：{currentQuiz.desc.slice(0, 25)}...</>
                )}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {quizOptions.map((opt, idx) => {
                  let btnStyle = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700";
                  if (isQuizAnswered) {
                    if (opt.num === currentQuiz.num) {
                      btnStyle = "bg-emerald-600/40 border-emerald-500 text-emerald-200 font-bold";
                    } else if (selectedQuizOption?.num === opt.num) {
                      btnStyle = "bg-rose-600/40 border-rose-500 text-rose-200";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(opt)}
                      disabled={isQuizAnswered}
                      className={`p-4 rounded-xl border text-xl font-bold transition-all ${btnStyle}`}
                    >
                      {opt.symbol}
                    </button>
                  );
                })}
              </div>

              {quizStatusMessage && (
                <div className={`p-3 rounded-xl text-xs border mb-4 ${
                  quizStatusMessage.type === 'success' 
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-bold' 
                    : 'bg-rose-950/80 border-rose-600 text-rose-200'
                }`}>
                  {quizStatusMessage.text}
                </div>
              )}

              {isQuizAnswered && (
                <button
                  onClick={() => generateQuiz()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  下一題挑戰
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {selectedElement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedElement(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-bold shadow-lg ${categoryStyles[selectedElement.category]}`}>
                <span className="text-xs opacity-75">{selectedElement.num}</span>
                <span className="text-3xl leading-none my-0.5">{selectedElement.symbol}</span>
                <span className="text-xs font-normal opacity-90">{selectedElement.name}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedElement.name}
                  <span className="text-base text-indigo-300 font-normal">({selectedElement.bopomofo})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">原子量：{selectedElement.mass}</p>
                <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                  {categoryNames[selectedElement.category] || "已知元素"}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-300 leading-relaxed mb-5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-medium mb-1.5">
                <Info className="w-4 h-4" />
                <span>觀念解析與重點應用：</span>
              </div>
              <p className="whitespace-pre-line text-xs md:text-sm">{selectedElement.desc}</p>
            </div>

            <button
              onClick={() => setSelectedElement(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              掌握觀念，關閉說明
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ElementCard({ el, onClick, styles, isDimmed }) {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded-lg border text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg flex flex-col items-center justify-center cursor-pointer min-h-[56px] ${styles} ${
        isDimmed ? 'opacity-20 hover:opacity-50' : 'opacity-100'
      }`}
    >
      <span className="text-[9px] opacity-70 block leading-none mb-0.5">{el.num}</span>
      <span className="text-sm font-bold leading-tight block">{el.symbol}</span>
      <span className="text-[10px] font-medium opacity-90 block leading-none mt-0.5">
        {el.name}
      </span>
      <span className="text-[8px] text-slate-400 block leading-none mt-0.5 font-normal">
        {el.bopomofo}
      </span>
    </button>
  );
}