'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  decimalYears: number;
  correctedYears: number | null;
  correctedMonths: number | null;
  correctedDays: number | null;
  correctedDecimalYears: number | null;
  steps: string[];
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function renderStep(step: string) {
  if (step.includes('\\')) {
    return <InlineMath math={step} />;
  }
  return <span>{step}</span>;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

export default function ChronologicalAgeCalculator() {
  const [dob, setDob] = useState('');
  const [assessDate, setAssessDate] = useState('');
  const [weeksPrem, setWeeksPrem] = useState('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setAssessDate(`${y}-${m}-${d}`);
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!dob || !assessDate) {
      setError('Please enter both date of birth and assessment date.');
      return;
    }

    const dobDate = new Date(dob);
    const assessDateObj = new Date(assessDate);

    if (isNaN(dobDate.getTime()) || isNaN(assessDateObj.getTime())) {
      setError('Please enter valid dates.');
      return;
    }

    if (dobDate > assessDateObj) {
      setError('Assessment date must be after date of birth.');
      return;
    }

    const premWeeks = weeksPrem ? parseInt(weeksPrem) : 0;
    if (weeksPrem && (isNaN(premWeeks) || premWeeks < 0 || premWeeks > 20)) {
      setError('Weeks premature must be between 0 and 20.');
      return;
    }

    let y1 = dobDate.getFullYear();
    let m1 = dobDate.getMonth() + 1;
    let d1 = dobDate.getDate();
    let y2 = assessDateObj.getFullYear();
    let m2 = assessDateObj.getMonth() + 1;
    let d2 = assessDateObj.getDate();

    let years = y2 - y1;
    let months = m2 - m1;
    let days = d2 - d1;

    if (days < 0) {
      months--;
      const prevMonth = m2 === 1 ? 12 : m2 - 1;
      const prevYear = m2 === 1 ? y2 - 1 : y2;
      days += daysInMonth(prevYear, prevMonth);
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((assessDateObj.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24));
    const decimalYears = years + months / 12 + days / 365.25;

    let correctedYears: number | null = null;
    let correctedMonths: number | null = null;
    let correctedDays: number | null = null;
    let correctedDecimalYears: number | null = null;

    if (premWeeks > 0) {
      const correctedDate = new Date(dobDate);
      correctedDate.setDate(correctedDate.getDate() + premWeeks * 7);
      const corrDiff = assessDateObj.getTime() - correctedDate.getTime();
      corrDiff;
      const cY = Math.floor(corrDiff / (1000 * 60 * 60 * 24 * 365.25));
      const remAfterY = corrDiff - cY * 1000 * 60 * 60 * 24 * 365.25;
      const cM = Math.floor(remAfterY / (1000 * 60 * 60 * 24 * 30.4375));
      const cD = Math.floor((remAfterY - cM * 1000 * 60 * 60 * 24 * 30.4375) / (1000 * 60 * 60 * 24));
      correctedYears = cY;
      correctedMonths = cM;
      correctedDays = cD;
      correctedDecimalYears = cY + cM / 12 + cD / 365.25;
    }

    const steps: string[] = [
      `\\text{Chronological Age} = \\text{Assessment Date} - \\text{Date of Birth}`,
      `\\text{Age} = ${y2}-${String(m2).padStart(2, '0')}-${String(d2).padStart(2, '0')} - ${y1}-${String(m1).padStart(2, '0')}-${String(d1).padStart(2, '0')}`,
      `\\text{Years} = ${y2} - ${y1} = ${years}`,
      `\\text{Months} = ${m2} - ${m1} = ${months}`,
      `\\text{Days} = ${d2} - ${d1} = ${days}`,
      `\\text{Chronological Age} = ${years}\\ \\text{year${years !== 1 ? 's' : ''}},\\ ${months}\\ \\text{month${months !== 1 ? 's' : ''}},\\ ${days}\\ \\text{day${days !== 1 ? 's' : ''}}`,
      `\\text{Age in Decimal Years} = ${years} + ${months}/12 + ${days}/365.25 = ${fmt(decimalYears)}`,
    ];

    if (premWeeks > 0 && correctedYears !== null) {
      steps.push(`\\text{Weeks Premature} = ${premWeeks}\\ \\text{weeks}`);
      steps.push(`\\text{Corrected Age (subtract ${premWeeks} weeks)} = ${correctedYears}\\text{y}\\ ${correctedMonths}\\text{m}\\ ${correctedDays}\\text{d}`);
    }

    setResult({
      years, months, days, totalDays, decimalYears,
      correctedYears, correctedMonths, correctedDays, correctedDecimalYears,
      steps,
    });

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1a1a1a', '#ffffff', '#8a8a8a'],
    });

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleReset = () => {
    setDob('');
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setAssessDate(`${y}-${m}-${d}`);
    setWeeksPrem('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="dob" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
            />
          </div>
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="assess-date" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Assessment Date
            </label>
            <input
              type="date"
              id="assess-date"
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
            />
          </div>
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="weeks-prem" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Weeks Premature <span className="text-slate-400 font-medium normal-case">(optional)</span>
            </label>
            <input
              type="number"
              id="weeks-prem"
              min="0"
              max="20"
              value={weeksPrem}
              onChange={(e) => setWeeksPrem(e.target.value)}
              placeholder="e.g. 8"
              className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center space-x-4 pt-2">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div ref={resultsRef} className="pt-6 border-t border-slate-100 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">
            <i className="fas fa-calendar-check mr-2 text-slate-400"></i>
            Chronological Age
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[7rem] font-black text-white/5 leading-none select-none pointer-events-none italic mr-[-0.5rem] mt-[-0.5rem]">
              AGE
            </div>
            <div className="relative z-10 space-y-6">
              <div className="text-center pb-4 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2">
                  Chronological Age
                </span>
                <div className="text-4xl md:text-5xl font-black font-mono text-white">
                  {result.years}y {result.months}m {result.days}d
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  {fmt(result.decimalYears)} decimal years
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Years</span>
                  <span className="font-mono font-black text-2xl text-white">{result.years}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Months</span>
                  <span className="font-mono font-black text-2xl text-white">{result.months}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Days</span>
                  <span className="font-mono font-black text-2xl text-white">{result.days}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Days</span>
                  <span className="font-mono font-black text-2xl text-white">{result.totalDays.toLocaleString()}</span>
                </div>
              </div>

              {result.correctedYears !== null && (
                <div className="pt-4 border-t border-slate-800/80 text-center">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block mb-2">
                    Corrected Age <span className="text-slate-500 font-medium normal-case">(for prematurity)</span>
                  </span>
                  <div className="text-3xl md:text-4xl font-black font-mono text-blue-400">
                    {result.correctedYears}y {result.correctedMonths}m {result.correctedDays}d
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {fmt(result.correctedDecimalYears!)} decimal years
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Calculation
            </h4>
            <div className="space-y-3 font-mono text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-2.5 last:pb-0 border-b last:border-b-0 border-slate-50">
                  {renderStep(step)}
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Reference */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-start space-x-3">
            <i className="fas fa-stethoscope text-slate-400 mt-0.5"></i>
            <div className="text-[10px] text-slate-500 font-semibold leading-relaxed space-y-1">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider block text-[9px]">Clinical Reference</span>
              <p>
                Chronological age is used as the baseline for standardized developmental assessments including the Bayley Scales,
                ASQ, WPPSI, and other norm-referenced tests. For children born before 37 weeks gestation, corrected (adjusted) age
                is recommended for developmental screening until at least 24 months of corrected age.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
