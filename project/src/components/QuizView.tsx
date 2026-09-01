import { useState } from 'react';
import { BookOpen, CheckCircle, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import type { Question } from '@/types';

interface QuizViewProps {
  questions: Question[];
  onFinish: (correct: number, total: number, expGained: number) => void;
  onExit: () => void;
}

export function QuizView({ questions, onFinish, onExit }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [expGained, setExpGained] = useState(0);

  const q = questions[currentIndex];

  const handleSubmit = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === q.answer) {
      setCorrectCount((c) => c + 1);
      setExpGained((e) => e + q.expReward);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      onFinish(correctCount, questions.length, expGained);
    }
  };

  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← 放棄練習
          </button>
          <span className="text-xs text-slate-400 tabular-nums">
            第 {currentIndex + 1} / {questions.length} 題
          </span>
        </div>
        <div className="w-full bg-slate-700/50 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-teal-300 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Unit tag */}
        <span className="inline-flex items-center gap-1.5 bg-cyan-950/50 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-800/50 mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          {q.unit}
        </span>

        {/* Question */}
        <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed mb-6">
          {q.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((option, idx) => {
            let style = 'bg-slate-700/40 hover:bg-slate-700/70 border-slate-600/60 text-slate-200';

            if (!answered && selected === idx) {
              style = 'bg-cyan-600/25 border-cyan-500 text-white';
            }

            if (answered) {
              if (idx === q.answer) {
                style = 'bg-emerald-600/20 border-emerald-500 text-emerald-100';
              } else if (selected === idx) {
                style = 'bg-rose-600/20 border-rose-500 text-rose-100';
              } else {
                style = 'bg-slate-700/30 border-slate-700/50 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => !answered && setSelected(idx)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border text-sm md:text-base transition-all duration-200 flex items-center justify-between gap-2 ${style}`}
              >
                <span>
                  <span className="font-semibold mr-2 opacity-70">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  {option}
                </span>
                {answered && idx === q.answer && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-amber-400/90 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            答對 +{q.expReward} EXP
          </span>

          {!answered ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                selected !== null
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              確認送出
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
            >
              {currentIndex < questions.length - 1 ? '下一題' : '查看結算'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-6 pt-6 border-t border-slate-700/60 animate-fade-in">
            <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 font-medium mb-2 text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>題目詳解</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {q.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
