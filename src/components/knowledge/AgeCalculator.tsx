'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormData {
  birthDate: string;
  birthTime: string;
  calculationDate: string;
  calculationTime: string;
}

interface NextBirthday {
  date: Date;
  daysUntil: number;
  dayOfWeek: string;
}

interface AgeCategory {
  name: string;
  color: string;
  key: string;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalYears: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: NextBirthday;
  ageCategory: AgeCategory;
  birthDate: Date;
  calculationDate: Date;
  steps: string[];
}

class AgeCalculatorLogic {
  ageCategories: Record<string, { min: number; max: number; label: string; color: string }>;

  constructor() {
    this.ageCategories = {
      infant: { min: 0, max: 1, label: 'Infant', color: '#e91e63' },
      toddler: { min: 1, max: 3, label: 'Toddler', color: '#9c27b0' },
      preschooler: { min: 3, max: 5, label: 'Preschooler', color: '#673ab7' },
      child: { min: 5, max: 12, label: 'Child', color: '#3f51b5' },
      teenager: { min: 12, max: 18, label: 'Teenager', color: '#2196f3' },
      youngAdult: { min: 18, max: 30, label: 'Young Adult', color: '#00bcd4' },
      adult: { min: 30, max: 50, label: 'Adult', color: '#4caf50' },
      middleAge: { min: 50, max: 65, label: 'Middle Age', color: '#ff9800' },
      senior: { min: 65, max: 100, label: 'Senior', color: '#f44336' },
    };
  }

  calculate(formData: FormData): AgeResult {
    const birthDate = this.parseDate(formData.birthDate, formData.birthTime);
    const calculationDate = this.parseDate(formData.calculationDate, formData.calculationTime);

    if (!birthDate || !calculationDate) {
      throw new Error('Invalid date format');
    }

    if (birthDate > calculationDate) {
      throw new Error('Birth date cannot be in the future');
    }

    const ageDetails = this.calculateAgeDetails(birthDate, calculationDate);
    const nextBirthday = this.calculateNextBirthday(birthDate, calculationDate);
    const ageCategory = this.getAgeCategory(ageDetails.years);

    const steps: string[] = [];

    steps.push('**Step 1: Parse and validate input dates**');
    steps.push(`* Birth: $${formData.birthDate}$ ${formData.birthTime ? `at $${formData.birthTime}$` : '(midnight)'}`);
    steps.push(`* Calculation: $${formData.calculationDate}$ ${formData.calculationTime ? `at $${formData.calculationTime}$` : '(midnight)'}`);

    steps.push('\n**Step 2: Count complete years**');
    steps.push('* Increment year by year until adding another year would exceed the calculation date.');
    steps.push(`* Complete years: $${ageDetails.years}$`);

    steps.push('\n**Step 3: Count complete months after full years**');
    steps.push('* From the anniversary date, increment month by month.');
    steps.push(`* Additional months: $${ageDetails.months}$`);

    steps.push('\n**Step 4: Count remaining days**');
    const diffMs = calculationDate.getTime() - new Date(birthDate.getFullYear() + ageDetails.years, birthDate.getMonth() + ageDetails.months, birthDate.getDate()).getTime();
    steps.push(`* Remaining days: $${ageDetails.days}$`);

    steps.push('\n**Step 5: Compute total breakdown**');
    steps.push(`* Total years: $${ageDetails.totalYears}$, total months: $${ageDetails.totalMonths}$`);
    steps.push(`* Total weeks: $${ageDetails.totalWeeks.toLocaleString()}$, total days: $${ageDetails.totalDays.toLocaleString()}$`);
    steps.push(`* Total hours: $${ageDetails.totalHours.toLocaleString()}$, total minutes: $${ageDetails.totalMinutes.toLocaleString()}$`);

    steps.push('\n**Step 6: Age category**');
    steps.push(`* $${ageDetails.years}$ years old $\\implies$ **${ageCategory.name}**`);

    steps.push('\n**Step 7: Next birthday**');
    steps.push(`* Next birthday: $${nextBirthday.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}$`);
    steps.push(`* Days until next birthday: $${nextBirthday.daysUntil}$`);

    return {
      ...ageDetails,
      nextBirthday,
      ageCategory,
      birthDate,
      calculationDate,
      steps,
    };
  }

  parseDate(dateString: string, timeString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  }

  calculateAgeDetails(birthDate: Date, currentDate: Date) {
    const startDate = new Date(birthDate);
    const endDate = new Date(currentDate);

    const totalMilliseconds = endDate.getTime() - startDate.getTime();
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = this.calculateTotalMonths(startDate, endDate);
    const totalYears = Math.floor(totalMonths / 12);

    let years = 0;
    let months = 0;
    let days = 0;
    let tempDate = new Date(startDate);

    while (true) {
      const nextYearDate = new Date(tempDate);
      nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
      if (nextYearDate <= endDate) {
        years++;
        tempDate = nextYearDate;
      } else {
        break;
      }
    }

    while (true) {
      const nextMonthDate = new Date(tempDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      if (nextMonthDate <= endDate) {
        months++;
        tempDate = nextMonthDate;
      } else {
        break;
      }
    }

    days = Math.floor((endDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalYears,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
    };
  }

  calculateTotalMonths(startDate: Date, endDate: Date) {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    return years * 12 + months + (endDate.getDate() >= startDate.getDate() ? 0 : -1);
  }

  calculateNextBirthday(birthDate: Date, currentDate: Date): NextBirthday {
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();
    let nextBirthday = new Date(currentDate.getFullYear(), birthMonth, birthDay);
    if (nextBirthday < currentDate) {
      nextBirthday.setFullYear(currentDate.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });
    return { date: nextBirthday, daysUntil, dayOfWeek };
  }

  getAgeCategory(age: number): AgeCategory {
    for (const [, category] of Object.entries(this.ageCategories)) {
      if (age >= category.min && age < category.max) {
        return { name: category.label, color: category.color, key: category.label.toLowerCase() };
      }
    }
    return { name: 'Centenarian', color: '#795548', key: 'centenarian' };
  }

  validateInputs(formData: FormData) {
    const errors: string[] = [];
    if (!formData.birthDate) {
      errors.push('Birth date is required');
    }
    if (formData.birthDate && formData.calculationDate) {
      const birthDate = this.parseDate(formData.birthDate, formData.birthTime);
      const calculationDate = this.parseDate(formData.calculationDate, formData.calculationTime);
      if (birthDate && calculationDate && birthDate > calculationDate) {
        errors.push('Birth date cannot be in the future');
      }
    }
    return { isValid: errors.length === 0, errors };
  }
}

export default function AgeCalculator() {
  const [formData, setFormData] = useState<FormData>({
    birthDate: '',
    birthTime: '',
    calculationDate: '',
    calculationTime: '',
  });
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState('');
  const [calculator] = useState(new AgeCalculatorLogic());
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculateAge = () => {
    setError('');
    const validation = calculator.validateInputs(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }
    try {
      const calcResult = calculator.calculate(formData);
      setResult(calcResult);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetCalculator = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const formattedTime = today.toTimeString().slice(0, 5);
    setFormData({
      birthDate: '',
      birthTime: '',
      calculationDate: formattedDate,
      calculationTime: formattedTime,
    });
    setResult(null);
    setError('');
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const formattedTime = today.toTimeString().slice(0, 5);
    setFormData(prev => ({
      ...prev,
      calculationDate: formattedDate,
      calculationTime: formattedTime,
    }));
  }, []);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      {/* Input Section */}
      <div className="space-y-6">
          <div className="space-y-5">
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">Birth Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Birth Date</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Birth Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">Calculation Date</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Calculate Age On</label>
                  <input
                    type="date"
                    value={formData.calculationDate}
                    onChange={(e) => handleInputChange('calculationDate', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.calculationTime}
                    onChange={(e) => handleInputChange('calculationTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left flex items-start space-x-3 text-rose-800 animate-shake">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <div>
                <h4 className="text-xs font-bold">Validation Error</h4>
                <p className="text-[10px] font-medium mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={calculateAge}
              className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer"
            >
              Calculate Age
            </button>
            <button
              type="button"
              onClick={resetCalculator}
              className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

      {/* Life Stage Visualizer widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-road mr-2 text-slate-400"></i>
            Life Stage Visualizer
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Your position in the human life journey across all age stages.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="life-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="life-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#life-grid)" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            {[
              { key: 'infant', label: 'Infant', start: 0, end: 1, color: '#e91e63' },
              { key: 'toddler', label: 'Toddler', start: 1, end: 3, color: '#9c27b0' },
              { key: 'preschooler', label: 'Preschooler', start: 3, end: 5, color: '#673ab7' },
              { key: 'child', label: 'Child', start: 5, end: 12, color: '#3f51b5' },
              { key: 'teenager', label: 'Teen', start: 12, end: 18, color: '#2196f3' },
              { key: 'youngAdult', label: 'Young Adult', start: 18, end: 30, color: '#00bcd4' },
              { key: 'adult', label: 'Adult', start: 30, end: 50, color: '#4caf50' },
              { key: 'middleAge', label: 'Middle', start: 50, end: 65, color: '#ff9800' },
              { key: 'senior', label: 'Senior', start: 65, end: 100, color: '#f44336' },
            ].map(stage => {
              const x1 = (stage.start / 100) * 760 + 20;
              const x2 = (stage.end / 100) * 760 + 20;
              const w = Math.max(x2 - x1, 1);
              return (
                <g key={stage.key}>
                  <rect x={x1} y="70" width={w} height="60" rx="4" fill={stage.color} opacity="0.25" />
                  <text x={x1 + w / 2} y="105" textAnchor="middle" fill={stage.color} fontSize="7" fontFamily="monospace" fontWeight="bold">
                    {stage.label}
                  </text>
                </g>
              );
            })}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(y => {
              const x = (y / 100) * 760 + 20;
              return (
                <g key={y}>
                  <line x1={x} y1="65" x2={x} y2="135" stroke="#1f1f1f" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text x={x} y="148" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">{y}</text>
                </g>
              );
            })}
            {result && (() => {
              const ageX = (result.totalYears / 100) * 760 + 20;
              return (
                <>
                  <circle cx={ageX} cy="100" r="10" fill="white" filter="url(#life-glow)" />
                  <line x1={ageX} y1="30" x2={ageX} y2="170" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                  <text x={ageX} y="38" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {result.totalYears} yrs
                  </text>
                </>
              );
            })()}
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-neutral-400">Age:</span> {result.years}y {result.months}m {result.days}d
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">AGE</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Main Age Display */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Exact Age</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: result.ageCategory.color }}>
                {result.years} years, {result.months} months, {result.days} days
              </span>
              <div className="mt-2">
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-black border"
                  style={{
                    color: result.ageCategory.color,
                    borderColor: `${result.ageCategory.color}40`,
                    backgroundColor: `${result.ageCategory.color}15`,
                  }}
                >
                  {result.ageCategory.name}
                </span>
              </div>
            </div>

            {/* Total Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Total Years', value: result.totalYears },
                { label: 'Total Months', value: result.totalMonths },
                { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                { label: 'Total Days', value: result.totalDays.toLocaleString() },
                { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-lg font-black text-white mt-1 block">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Next Birthday */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Next Birthday</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Days Until</span>
                  <span className="text-xl font-black text-white mt-1 block">{result.nextBirthday.daysUntil}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Day of Week</span>
                  <span className="text-base font-black text-white mt-1 block">{result.nextBirthday.dayOfWeek}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Date</span>
                  <span className="text-sm font-black text-white mt-1 block">
                    {result.nextBirthday.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Step-by-Step KaTeX */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Step-by-Step Resolution Steps
              </h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {result.steps.map((step, idx) => {
                  const trimmed = step.trim();
                  if (trimmed.startsWith('$$')) {
                    const latexStr = trimmed.replace(/\$\$/g, '');
                    return (
                      <div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin">
                        <BlockMath math={latexStr} />
                      </div>
                    );
                  }

                  const isBold = trimmed.startsWith('**');
                  const cleanText = trimmed.replace(/^\* |\*\*/g, '');

                  const inlineRegex = /\$([^$]+)\$/g;
                  let lastIdx = 0;
                  const parts: React.ReactNode[] = [];
                  let match;

                  while ((match = inlineRegex.exec(cleanText)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(cleanText.substring(lastIdx, match.index));
                    }
                    parts.push(<InlineMath key={match.index} math={match[1]} />);
                    lastIdx = inlineRegex.lastIndex;
                  }

                  if (lastIdx < cleanText.length) {
                    parts.push(cleanText.substring(lastIdx));
                  }

                  return (
                    <p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>
                      {parts.length > 0 ? parts : cleanText}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
