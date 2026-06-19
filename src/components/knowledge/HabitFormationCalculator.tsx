'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormData {
  habitType: string;
  dailyTime: number;
  motivationLevel: 'low' | 'medium' | 'high';
  previousAttempt: 'yes' | 'no';
  complexity: 'simple' | 'medium' | 'complex';
}

interface HabitResult {
  estimatedDays: number;
  minDays: number;
  maxDays: number;
  successProbability: number;
  targetDate: string;
  habitType: string;
  factors: { label: string; value: string; impact: string }[];
  steps: string[];
}

const FACTOR_DETAILS: Record<string, { label: string; options: Record<string, { label: string; multiplier: number; impact: string }> }> = {
  motivationLevel: {
    label: 'Motivation Level',
    options: {
      low: { label: 'Low', multiplier: 1.3, impact: '+30% time' },
      medium: { label: 'Medium', multiplier: 1.0, impact: 'Baseline' },
      high: { label: 'High', multiplier: 0.8, impact: '-20% time' },
    },
  },
  complexity: {
    label: 'Habit Complexity',
    options: {
      simple: { label: 'Simple', multiplier: 0.8, impact: '-20% time' },
      medium: { label: 'Medium', multiplier: 1.0, impact: 'Baseline' },
      complex: { label: 'Complex', multiplier: 1.4, impact: '+40% time' },
    },
  },
  previousAttempt: {
    label: 'Previous Attempts',
    options: {
      no: { label: 'First attempt', multiplier: 1.0, impact: 'Baseline' },
      yes: { label: 'Tried before', multiplier: 0.9, impact: '-10% time' },
    },
  },
  dailyTime: {
    label: 'Daily Time',
    options: {
      low: { label: '<5 min/day', multiplier: 1.2, impact: '+20% time' },
      medium: { label: '5-30 min/day', multiplier: 1.0, impact: 'Baseline' },
      high: { label: '>30 min/day', multiplier: 0.9, impact: '-10% time' },
    },
  },
};

const getTimeBucket = (minutes: number): 'low' | 'medium' | 'high' => {
  if (minutes < 5) return 'low';
  if (minutes <= 30) return 'medium';
  return 'high';
};

export default function HabitFormationCalculator() {
  const [formData, setFormData] = useState<FormData>({
    habitType: '',
    dailyTime: 10,
    motivationLevel: 'medium',
    previousAttempt: 'no',
    complexity: 'medium',
  });
  const [result, setResult] = useState<HabitResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculate = () => {
    if (!formData.habitType.trim()) {
      setError('Please enter a habit you want to form.');
      return;
    }
    if (formData.dailyTime < 1 || formData.dailyTime > 120) {
      setError('Daily time must be between 1 and 120 minutes.');
      return;
    }

    const baseDays = 66;
    const mFactor = FACTOR_DETAILS.motivationLevel.options[formData.motivationLevel].multiplier;
    const cFactor = FACTOR_DETAILS.complexity.options[formData.complexity].multiplier;
    const pFactor = FACTOR_DETAILS.previousAttempt.options[formData.previousAttempt].multiplier;
    const tBucket = getTimeBucket(formData.dailyTime);
    const tFactor = FACTOR_DETAILS.dailyTime.options[tBucket].multiplier;

    const estimatedDays = Math.round(baseDays * mFactor * cFactor * pFactor * tFactor);
    const minDays = Math.round(estimatedDays * 0.85);
    const maxDays = Math.round(estimatedDays * 1.15);

    let probability = 70;
    if (formData.motivationLevel === 'high') probability += 15;
    else if (formData.motivationLevel === 'low') probability -= 15;
    if (formData.complexity === 'simple') probability += 10;
    else if (formData.complexity === 'complex') probability -= 10;
    if (formData.previousAttempt === 'yes') probability += 5;
    probability = Math.min(Math.max(probability, 0), 100);

    const target = new Date();
    target.setDate(target.getDate() + estimatedDays);
    const targetDate = target.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const factors: { label: string; value: string; impact: string }[] = [
      { label: 'Motivation', value: FACTOR_DETAILS.motivationLevel.options[formData.motivationLevel].label, impact: FACTOR_DETAILS.motivationLevel.options[formData.motivationLevel].impact },
      { label: 'Complexity', value: FACTOR_DETAILS.complexity.options[formData.complexity].label, impact: FACTOR_DETAILS.complexity.options[formData.complexity].impact },
      { label: 'Previous Attempt', value: FACTOR_DETAILS.previousAttempt.options[formData.previousAttempt].label, impact: FACTOR_DETAILS.previousAttempt.options[formData.previousAttempt].impact },
      { label: 'Daily Time', value: FACTOR_DETAILS.dailyTime.options[tBucket].label, impact: FACTOR_DETAILS.dailyTime.options[tBucket].impact },
    ];

    const steps: string[] = [];
    steps.push('**Step 1: Start with research baseline**');
    steps.push('* Research shows average habit formation takes **66 days** (Lally et al., 2010).');
    steps.push('**Step 2: Apply motivation factor**');
    steps.push(`* Motivation: **${formData.motivationLevel}** $\\implies$ multiplier $${mFactor}$`);
    steps.push('**Step 3: Apply complexity factor**');
    steps.push(`* Complexity: **${formData.complexity}** $\\implies$ multiplier $${cFactor}$`);
    steps.push('**Step 4: Apply previous attempt factor**');
    steps.push(`* Previous attempt: **${formData.previousAttempt === 'yes' ? 'Yes' : 'No'}** $\\implies$ multiplier $${pFactor}$`);
    steps.push('**Step 5: Apply daily time factor**');
    steps.push(`* Daily time: **${formData.dailyTime} min/day** $\\implies$ multiplier $${tFactor}$`);
    steps.push('**Step 6: Calculate estimated days**');
    steps.push('$$\\text{Days} = 66 \\times ' + mFactor + ' \\times ' + cFactor + ' \\times ' + pFactor + ' \\times ' + tFactor + ' = ' + estimatedDays + '$$');
    steps.push(`* Range: $${minDays}$ to $${maxDays}$ days (\\pm 15\\%)`);
    steps.push('**Step 7: Success probability**');
    steps.push(`* Base: 70\\% + adjustments = **${probability}\\%**`);

    setResult({ estimatedDays, minDays, maxDays, successProbability: probability, targetDate, habitType: formData.habitType.trim(), factors, steps });

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
    });
  };

  const reset = () => {
    setFormData({ habitType: '', dailyTime: 10, motivationLevel: 'medium', previousAttempt: 'no', complexity: 'medium' });
    setResult(null);
    setError('');
  };

  const probColor = result
    ? result.successProbability >= 70 ? '#4caf50' : result.successProbability >= 40 ? '#ff9800' : '#ef4444'
    : '#4caf50';

  const getTips = (): string[] => {
    if (!result) return [];
    const tips: string[] = [];
    const m = formData.motivationLevel;
    const c = formData.complexity;
    const t = formData.dailyTime;
    if (m === 'low') { tips.push('Start with a very small version of your habit to build momentum.'); tips.push('Set up visual reminders in your environment to prompt your habit.'); tips.push('Find an accountability partner to keep you on track.'); }
    else if (m === 'medium') { tips.push('Track your progress daily to maintain motivation.'); tips.push('Reward yourself after completing your habit consistently for a week.'); }
    else { tips.push('Challenge yourself by gradually increasing the difficulty of your habit.'); tips.push('Consider sharing your habit journey with others to stay committed.'); }
    if (c === 'complex') { tips.push('Break down your habit into smaller sub-habits to make it more manageable.'); tips.push('Focus on mastering one aspect at a time before adding complexity.'); }
    if (t > 30) tips.push('Consider splitting your practice into multiple shorter sessions throughout the day.');
    tips.push('The 21-day habit myth is not scientifically accurate. Research shows most habits take between 18-254 days to form.');
    tips.push(`Stay consistent! Missing a day occasionally won't derail your progress, but try not to miss two days in a row during these ${result.estimatedDays} days.`);
    tips.push('Stack your new habit onto an existing habit to make it easier to remember.');
    tips.push('Add a reminder to your calendar for daily practice and a milestone check-in every 7 days.');
    return tips;
  };

  const tips = getTips();

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">What habit do you want to form?</label>
              <input
                type="text"
                value={formData.habitType}
                onChange={e => handleChange('habitType', e.target.value)}
                placeholder="e.g., Exercise, Reading, Meditation"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Daily time commitment (minutes)</label>
              <input
                type="number"
                value={formData.dailyTime}
                onChange={e => handleChange('dailyTime', Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                min={1}
                max={120}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">How motivated are you?</label>
              <div className="space-y-1.5">
                {[
                  { value: 'low', label: 'Low - I\'m not very motivated' },
                  { value: 'medium', label: 'Medium - I\'m somewhat motivated' },
                  { value: 'high', label: 'High - I\'m very motivated' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    formData.motivationLevel === opt.value
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="motivation"
                      value={opt.value}
                      checked={formData.motivationLevel === opt.value}
                      onChange={e => handleChange('motivationLevel', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      formData.motivationLevel === opt.value ? 'border-white' : 'border-slate-300'
                    }`}>
                      {formData.motivationLevel === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">How complex is this habit?</label>
              <div className="space-y-1.5">
                {[
                  { value: 'simple', label: 'Simple - easy to do (e.g., drink water)' },
                  { value: 'medium', label: 'Medium - moderate effort (e.g., exercise 15min)' },
                  { value: 'complex', label: 'Complex - multiple steps (e.g., learn language)' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    formData.complexity === opt.value
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="complexity"
                      value={opt.value}
                      checked={formData.complexity === opt.value}
                      onChange={e => handleChange('complexity', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      formData.complexity === opt.value ? 'border-white' : 'border-slate-300'
                    }`}>
                      {formData.complexity === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-bold">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Previous Attempt */}
          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Have you tried this habit before?</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'no', label: 'First attempt' },
                { value: 'yes', label: 'Tried before' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center justify-center px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  formData.previousAttempt === opt.value
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="previous-attempt"
                    value={opt.value}
                    checked={formData.previousAttempt === opt.value}
                    onChange={e => handleChange('previousAttempt', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left flex items-start space-x-3 text-rose-800 animate-shake">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <div>
                <h4 className="text-xs font-bold">Error</h4>
                <p className="text-[10px] font-medium mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button type="button" onClick={calculate} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
              Calculate Habit Formation Time
            </button>
            <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer">
              Reset
            </button>
          </div>
        </div>

      {/* Habit Formation Journey Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-chart-line mr-2 text-slate-400"></i>
            Habit Formation Journey
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Your path from initiation to automaticity over {result ? result.estimatedDays : '66'} days.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="habit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="habit-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="habit-progress" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#ff9800" />
                <stop offset="66%" stopColor="#4caf50" />
                <stop offset="100%" stopColor="#2196f3" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#habit-grid)" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            {result ? (() => {
              const totalDays = result.estimatedDays;
              const p33 = (totalDays * 0.33 / totalDays) * 760 + 20;
              const p66 = (totalDays * 0.66 / totalDays) * 760 + 20;
              return (
                <>
                  <rect x="20" y="95" width={p33 - 20} height="50" rx="6" fill="#ef4444" opacity="0.2" />
                  <rect x={p33} y="95" width={p66 - p33} height="50" rx="6" fill="#ff9800" opacity="0.2" />
                  <rect x={p66} y="95" width={780 - p66} height="50" rx="6" fill="#4caf50" opacity="0.2" />
                  <line x1={p33} y1="90" x2={p33} y2="150" stroke="#ff9800" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={p66} y1="90" x2={p66} y2="150" stroke="#4caf50" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={(20 + p33) / 2} y="118" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">Initiation</text>
                  <text x={(p33 + p66) / 2} y="118" textAnchor="middle" fill="#ff9800" fontSize="7" fontFamily="monospace" fontWeight="bold">Adaptation</text>
                  <text x={(p66 + 780) / 2} y="118" textAnchor="middle" fill="#4caf50" fontSize="7" fontFamily="monospace" fontWeight="bold">Automaticity</text>
                  <text x="20" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">Day 0</text>
                  <text x="780" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">Day {totalDays}</text>
                  <text x={p33} y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">~{Math.round(totalDays * 0.33)}</text>
                  <text x={p66} y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">~{Math.round(totalDays * 0.66)}</text>
                </>
              );
            })() : (
              <>
                <rect x="20" y="95" width="250" height="50" rx="6" fill="#ef4444" opacity="0.15" />
                <rect x="277" y="95" width="250" height="50" rx="6" fill="#ff9800" opacity="0.15" />
                <rect x="534" y="95" width="247" height="50" rx="6" fill="#4caf50" opacity="0.15" />
                <text x="145" y="118" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">Initiation</text>
                <text x="402" y="118" textAnchor="middle" fill="#ff9800" fontSize="7" fontFamily="monospace" fontWeight="bold">Adaptation</text>
                <text x="658" y="118" textAnchor="middle" fill="#4caf50" fontSize="7" fontFamily="monospace" fontWeight="bold">Automaticity</text>
                <text x="20" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">Day 0</text>
                <text x="780" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">Day 66</text>
                <text x="277" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">~22</text>
                <text x="534" y="165" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">~44</text>
              </>
            )}
            <line x1="20" y1="130" x2="780" y2="130" stroke="url(#habit-progress)" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            {[0, 25, 50, 75, 100].map((pct, i) => {
              const x = 20 + (pct / 100) * 760;
              return (
                <circle key={i} cx={x} cy="130" r="5" fill="#0a0a0a" stroke={i === 0 ? '#ef4444' : i <= 2 ? '#ff9800' : i <= 3 ? '#4caf50' : '#2196f3'} strokeWidth="2" />
              );
            })}
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result ? `Target: ${result.targetDate}` : 'Calculate your habit formation timeline to see your journey'}
            </text>
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Est:</span> {result.estimatedDays} days</div>
              <div><span className="text-neutral-400">Range:</span> {result.minDays}\u2013{result.maxDays} d</div>
            </div>
          )}
          {result && (
            <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-neutral-400">P(success):</span> {result.successProbability}%
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">HABIT</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Main display */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Habit Formation Estimate</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{result.estimatedDays} days</span>
              <p className="text-sm text-slate-300 mt-2">to form your <span className="font-black text-white">{result.habitType}</span> habit</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Estimated Days', value: result.estimatedDays },
                { label: 'Range', value: `${result.minDays}–${result.maxDays} days` },
                { label: 'Success Probability', value: `${result.successProbability}%` },
                { label: 'Target Date', value: result.targetDate },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-base font-black text-white mt-1 block">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Probability Bar */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Success Probability</h4>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${result.successProbability}%`, backgroundColor: probColor }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0%</span>
                <span>{result.successProbability}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Factor Breakdown</h4>
              <div className="space-y-2">
                {result.factors.map(f => (
                  <div key={f.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-[11px] font-bold text-white">{f.label}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({f.value})</span>
                    </div>
                    <span className={`text-[10px] font-bold ${f.impact.includes('+') ? 'text-rose-400' : f.impact.includes('-') ? 'text-emerald-400' : 'text-slate-400'}`}>{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Tips */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Personalized Tips for Success</h4>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-white/80">
                    <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-step */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {result.steps.map((step, idx) => {
                  const trimmed = step.trim();
                  if (trimmed.startsWith('$$')) {
                    const latexStr = trimmed.replace(/\$\$/g, '');
                    return (<div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin"><BlockMath math={latexStr} /></div>);
                  }
                  const isBold = trimmed.startsWith('**');
                  const cleanText = trimmed.replace(/^\* |\*\*/g, '');
                  const inlineRegex = /\$([^$]+)\$/g;
                  let lastIdx = 0;
                  const parts: React.ReactNode[] = [];
                  let match;
                  while ((match = inlineRegex.exec(cleanText)) !== null) {
                    if (match.index > lastIdx) parts.push(cleanText.substring(lastIdx, match.index));
                    parts.push(<InlineMath key={match.index} math={match[1]} />);
                    lastIdx = inlineRegex.lastIndex;
                  }
                  if (lastIdx < cleanText.length) parts.push(cleanText.substring(lastIdx));
                  return (<p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>{parts.length > 0 ? parts : cleanText}</p>);
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
