import type { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    unit: '力與運動',
    question: '一物體在光滑水平面上受 10 牛頓的合力作用，產生 2 m/s² 的加速度，則此物體的質量為多少 kg？',
    options: ['2 kg', '5 kg', '10 kg', '20 kg'],
    answer: 1,
    explanation:
      '根據牛頓第二運動定律 F = ma：\n10 N = m × 2 m/s²\nm = 10 / 2 = 5 kg\n故正確答案為 B。',
    expReward: 50,
  },
  {
    id: 2,
    unit: '水溶液與酸鹼鹽',
    question: '在 25°C 下，純水的 pH 值為 7。若將少量強酸加入水中，下列關於溶液中離子濃度的變化何者正確？',
    options: [
      '[H⁺] 增加，[OH⁻] 減少，兩者乘積維持定值',
      '[H⁺] 增加，[OH⁻] 增加',
      '[H⁺] 減少，[OH⁻] 增加',
      '[H⁺] 與 [OH⁻] 皆保持不變',
    ],
    answer: 0,
    explanation:
      '加入強酸後溶液中 [H⁺] 增加。根據水的離子積常數 Kw = [H⁺][OH⁻] = 10⁻¹⁴，在 25°C 下 Kw 為定值，因此 [OH⁻] 會相對減少。',
    expReward: 50,
  },
  {
    id: 3,
    unit: '電學與磁學',
    question: '有一電熱器接於 110V 的電源上，通過的電流為 5A，則此電熱器運轉 10 秒鐘會消耗多少焦耳的電能？',
    options: ['550 焦耳', '1100 焦耳', '5500 焦耳', '2200 焦耳'],
    answer: 2,
    explanation:
      '電能公式 E = P × t = V × I × t：\nE = 110 V × 5 A × 10 s = 5500 J\n故消耗電能為 5500 焦耳。',
    expReward: 60,
  },
  {
    id: 4,
    unit: '力與運動',
    question: '一輛車以 20 m/s 的速度行駛，緊急煞車後經 4 秒完全停止。假設煞車過程為等加速度運動，則此車的加速度大小為多少 m/s²？',
    options: ['3 m/s²', '5 m/s²', '8 m/s²', '10 m/s²'],
    answer: 1,
    explanation:
      '等加速度運動公式 v = v₀ + at：\n0 = 20 + a × 4\na = -5 m/s²\n加速度大小為 5 m/s²（負號代表減速）。',
    expReward: 55,
  },
  {
    id: 5,
    unit: '熱與物態變化',
    question: '將 100g 的冰塊（0°C）完全融化成 0°C 的水，需要吸收多少熱量？（冰的熔化熱為 334 J/g）',
    options: ['3340 J', '33400 J', '334000 J', '33400 cal'],
    answer: 1,
    explanation:
      '熔化熱公式 Q = m × L：\nQ = 100 g × 334 J/g = 33400 J\n注意溫度在熔化過程中不變化，熱量全用於改變物態。',
    expReward: 65,
  },
  {
    id: 6,
    unit: '光學與聲音',
    question: '光從空氣射入水中時，下列何者會發生？',
    options: [
      '光速變快，頻率不變，波長變短',
      '光速變慢，頻率不變，波長變短',
      '光速變慢，頻率改變，波長不變',
      '光速不變，頻率改變，波長改變',
    ],
    answer: 1,
    explanation:
      '光從光疏介質（空氣）進入光密介質（水）時光速變慢。頻率由光源決定不會改變，而波長 = 光速 / 頻率，光速變小所以波長變短。',
    expReward: 60,
  },
  {
    id: 7,
    unit: '電學與磁學',
    question: '兩個點電荷間的靜電力大小為 F。若兩電荷的距離變為原來的 3 倍，則靜電力變為原來的多少倍？',
    options: ['1/3 倍', '1/6 倍', '1/9 倍', '3 倍'],
    answer: 2,
    explanation:
      '根據庫侖定律 F = k(q₁q₂)/r²，力與距離平方成反比：\n距離變 3 倍 → 力變為 (1/3)² = 1/9 倍。',
    expReward: 55,
  },
  {
    id: 8,
    unit: '水溶液與酸鹼鹽',
    question: '下列哪一種物質溶於水後，其水溶液呈鹼性反應？',
    options: ['二氧化碳 (CO₂)', '二氧化硫 (SO₂)', '氧化鈣 (CaO)', '氯化氫 (HCl)'],
    answer: 2,
    explanation:
      '氧化鈣（CaO）俗稱生石灰，溶於水生成氫氧化鈣 Ca(OH)₂，為鹼性。CO₂、SO₂ 溶於水生成酸，HCl 溶於水即為鹽酸。',
    expReward: 50,
  },
];

export const units = Array.from(new Set(questions.map((q) => q.unit)));
