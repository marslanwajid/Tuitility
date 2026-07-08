'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface PercentErrorResult {
  experimental: number;
  theoretical: number;
  absoluteError: number;
  percentError: number;
  steps: string[];
}

function formatNum(n: number): string {
  return n.toFixed(6).replace(/\.?0+$/, '');
}

function renderStep(step: string) {
  if (step.includes('|')) {
    return <InlineMath math={step} />;
  }
  if (step.includes('=')) {
    return <InlineMath math={step} />;
  }
  return <span>{step}</span>;
}

export default function PercentErrorCalculator() {
  const [experimental, setExperimental] = useState('');
  const [theoretical, setTheoretical] = useState('');
  const [result, setResult] = useState<PercentErrorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const exp = parseFloat(experimental);
    const theo = parseFloat(theoretical);

    if (experimental === '' || theoretical === '') {
      setError('Please fill in both fields.');
      return;
    }
    if (isNaN(exp) || isNaN(theo)) {
      setError('Please enter valid numbers.');
      return;
    }
    if (theo === 0) {
      setError('Theoretical value cannot be zero (division by zero).');
      return;
    }

    const absErr = Math.abs(exp - theo);
    const pctErr = Math.abs((exp - theo) / theo) * 100;

    const steps: string[] = [
      `\\text{Percent Error} = \\frac{| \\text{Experimental} - \\text{Theoretical} |}{| \\text{Theoretical} |} \\times 100\\%`,
      `\\text{Percent Error} = \\frac{| ${formatNum(exp)} - ${formatNum(theo)} |}{| ${formatNum(theo)} |} \\times 100\\%`,
      `\\text{Percent Error} = \\frac{| ${formatNum(exp - theo)} |}{| ${formatNum(theo)} |} \\times 100\\%`,
      `\\text{Percent Error} = \\frac{${formatNum(absErr)}}{${formatNum(Math.abs(theo))}} \\times 100\\%`,
      `\\text{Percent Error} = ${formatNum(absErr / Math.abs(theo))} \\times 100\\%`,
      `\\text{Percent Error} = ${formatNum(pctErr)}\\%`,
    ];

    setResult({
      experimental: exp,
      theoretical: theo,
      absoluteError: absErr,
      percentError: pctErr,
      steps,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#ffffff', '#a1a1a1'],
    });
  };

  const handleReset = () => {
    setExperimental('');
    setTheoretical('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex flex-col space-y-2 text-left w-full sm:w-1/2">
            <label htmlFor="experimental" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Experimental Value (E)
            </label>
            <input
              type="text"
              id="experimental"
              value={experimental}
              onChange={(e) => setExperimental(e.target.value)}
              placeholder="e.g. 85"
              className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
            />
          </div>
          <div className="flex flex-col space-y-2 text-left w-full sm:w-1/2">
            <label htmlFor="theoretical" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Theoretical Value (T)
            </label>
            <input
              type="text"
              id="theoretical"
              value={theoretical}
              onChange={(e) => setTheoretical(e.target.value)}
              placeholder="e.g. 100"
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
        <div className="pt-6 border-t border-slate-100 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">
            <i className="fas fa-chart-line mr-2 text-slate-400"></i>
            Result
          </h3>

          <div className="bg-[#1a1a1a] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[10rem] font-black text-white/5 leading-none select-none pointer-events-none italic mr-[-1rem] mt-[-1rem]">
              E−T
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">Absolute Error</span>
                <span className="text-2xl md:text-3xl font-black font-mono">
                  {formatNum(result.absoluteError)}
                </span>
              </div>
              <div className="space-y-1 text-center sm:text-left sm:border-l sm:border-white/20 sm:pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 block">Percent Error</span>
                <span className="text-2xl md:text-3xl font-black font-mono">
                  {formatNum(result.percentError)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-3 font-mono text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-2.5 last:pb-0 border-b last:border-b-0 border-slate-50">
                  {renderStep(step)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
