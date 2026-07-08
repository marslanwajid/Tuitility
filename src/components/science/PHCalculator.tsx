'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type SolveMode = 'h-to-ph' | 'ph-to-h' | 'oh-to-poh' | 'poh-to-oh' | 'ph-poh';

interface PHResult {
  ph: number;
  poh: number;
  hConc: number;
  ohConc: number;
  steps: string[];
}

const MODE_LABELS: Record<SolveMode, string> = {
  'h-to-ph': '[H⁺] → pH',
  'ph-to-h': 'pH → [H⁺]',
  'oh-to-poh': '[OH⁻] → pOH',
  'poh-to-oh': 'pOH → [OH⁻]',
  'ph-poh': 'pH ↔ pOH',
};

const fmt = (n: number): string => {
  if (n === 0) return '0';
  if (Math.abs(n) < 0.0001 || Math.abs(n) >= 10000) return n.toExponential(4);
  return n.toFixed(4).replace(/\.?0+$/, '');
};

const fmtShort = (n: number): string => {
  if (n === 0) return '0';
  return n.toFixed(2);
};

const PH_SCALE_COLORS = [
  '#dc2626', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
];

function PHScale({ ph, phResult }: { ph: number; phResult: number | null }) {
  const segments = PH_SCALE_COLORS.length;
  const segWidth = 100 / segments;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-[9px] font-extrabold text-slate-400 uppercase tracking-wider px-0.5">
        <span>Acidic</span>
        <span>Neutral</span>
        <span>Basic</span>
      </div>
      <div className="relative h-6 w-full rounded-full overflow-hidden flex">
        {PH_SCALE_COLORS.map((color, i) => (
          <div key={i} style={{ width: `${segWidth}%`, backgroundColor: color }} className="h-full" />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 px-0.5">
        <span>0</span>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>10</span>
        <span>12</span>
        <span>14</span>
      </div>
      {phResult !== null && phResult >= 0 && phResult <= 14 && (
        <div className="relative h-8 w-full">
          <div
            className="absolute top-0 transform -translate-x-1/2 transition-all duration-500"
            style={{ left: `${(phResult / 14) * 100}%` }}
          >
            <div className="bg-slate-900 text-white text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-md whitespace-nowrap">
              pH {fmtShort(phResult)}
            </div>
            <div className="w-0.5 h-4 bg-slate-900 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderStep(step: string) {
  if (step.includes('\\')) {
    return <InlineMath math={step} />;
  }
  return <span>{step}</span>;
}

export default function PHCalculator() {
  const [mode, setMode] = useState<SolveMode>('h-to-ph');
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<PHResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const val = parseFloat(inputVal);
    if (inputVal === '' || isNaN(val) || val <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }

    let ph: number, poh: number, hConc: number, ohConc: number;
    let steps: string[] = [];

    try {
      switch (mode) {
        case 'h-to-ph': {
          hConc = val;
          ph = -Math.log10(hConc);
          poh = 14 - ph;
          ohConc = Math.pow(10, -poh);
          steps = [
            `\\text{pH} = -\\log_{10}([\\text{H}^+])`,
            `\\text{pH} = -\\log_{10}(${fmt(hConc)})`,
            `\\text{pH} = ${fmtShort(ph)}`,
            `\\text{pOH} = 14 - \\text{pH}`,
            `\\text{pOH} = 14 - ${fmtShort(ph)}`,
            `\\text{pOH} = ${fmtShort(poh)}`,
            `[\\text{OH}^-] = 10^{-\\text{pOH}}`,
            `[\\text{OH}^-] = 10^{-${fmtShort(poh)}}`,
            `[\\text{OH}^-] = ${fmt(ohConc)} \\text{ M}`,
          ];
          break;
        }
        case 'ph-to-h': {
          ph = val;
          if (ph < 0 || ph > 14) {
            setError('pH must be between 0 and 14.');
            return;
          }
          hConc = Math.pow(10, -ph);
          poh = 14 - ph;
          ohConc = Math.pow(10, -poh);
          steps = [
            `[\\text{H}^+] = 10^{-\\text{pH}}`,
            `[\\text{H}^+] = 10^{-${fmtShort(ph)}}`,
            `[\\text{H}^+] = ${fmt(hConc)} \\text{ M}`,
            `\\text{pOH} = 14 - \\text{pH}`,
            `\\text{pOH} = 14 - ${fmtShort(ph)}`,
            `\\text{pOH} = ${fmtShort(poh)}`,
            `[\\text{OH}^-] = 10^{-\\text{pOH}}`,
            `[\\text{OH}^-] = 10^{-${fmtShort(poh)}}`,
            `[\\text{OH}^-] = ${fmt(ohConc)} \\text{ M}`,
          ];
          break;
        }
        case 'oh-to-poh': {
          ohConc = val;
          poh = -Math.log10(ohConc);
          ph = 14 - poh;
          hConc = Math.pow(10, -ph);
          steps = [
            `\\text{pOH} = -\\log_{10}([\\text{OH}^-])`,
            `\\text{pOH} = -\\log_{10}(${fmt(ohConc)})`,
            `\\text{pOH} = ${fmtShort(poh)}`,
            `\\text{pH} = 14 - \\text{pOH}`,
            `\\text{pH} = 14 - ${fmtShort(poh)}`,
            `\\text{pH} = ${fmtShort(ph)}`,
            `[\\text{H}^+] = 10^{-\\text{pH}}`,
            `[\\text{H}^+] = 10^{-${fmtShort(ph)}}`,
            `[\\text{H}^+] = ${fmt(hConc)} \\text{ M}`,
          ];
          break;
        }
        case 'poh-to-oh': {
          poh = val;
          if (poh < 0 || poh > 14) {
            setError('pOH must be between 0 and 14.');
            return;
          }
          ohConc = Math.pow(10, -poh);
          ph = 14 - poh;
          hConc = Math.pow(10, -ph);
          steps = [
            `[\\text{OH}^-] = 10^{-\\text{pOH}}`,
            `[\\text{OH}^-] = 10^{-${fmtShort(poh)}}`,
            `[\\text{OH}^-] = ${fmt(ohConc)} \\text{ M}`,
            `\\text{pH} = 14 - \\text{pOH}`,
            `\\text{pH} = 14 - ${fmtShort(poh)}`,
            `\\text{pH} = ${fmtShort(ph)}`,
            `[\\text{H}^+] = 10^{-\\text{pH}}`,
            `[\\text{H}^+] = 10^{-${fmtShort(ph)}}`,
            `[\\text{H}^+] = ${fmt(hConc)} \\text{ M}`,
          ];
          break;
        }
        case 'ph-poh': {
          ph = val;
          if (ph < 0 || ph > 14) {
            setError('pH must be between 0 and 14.');
            return;
          }
          poh = 14 - ph;
          hConc = Math.pow(10, -ph);
          ohConc = Math.pow(10, -poh);
          steps = [
            `\\text{pOH} = 14 - \\text{pH}`,
            `\\text{pOH} = 14 - ${fmtShort(ph)}`,
            `\\text{pOH} = ${fmtShort(poh)}`,
            `[\\text{H}^+] = 10^{-\\text{pH}}`,
            `[\\text{H}^+] = 10^{-${fmtShort(ph)}}`,
            `[\\text{H}^+] = ${fmt(hConc)} \\text{ M}`,
            `[\\text{OH}^-] = 10^{-\\text{pOH}}`,
            `[\\text{OH}^-] = 10^{-${fmtShort(poh)}}`,
            `[\\text{OH}^-] = ${fmt(ohConc)} \\text{ M}`,
          ];
          break;
        }
        default: {
          setError('Unknown mode.');
          return;
        }
      }

      setResult({ ph, poh, hConc, ohConc, steps });
      setError('');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1a1a1a', '#ffffff', '#a1a1a1'],
      });
    } catch {
      setError('An error occurred during calculation.');
    }
  };

  const handleReset = () => {
    setInputVal('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Solve Mode Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(MODE_LABELS) as [SolveMode, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setMode(key); setResult(null); setError(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                mode === key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex flex-col space-y-2 text-left">
          <label htmlFor="ph-input" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            {mode === 'h-to-ph' ? '[H⁺] Concentration (M)' :
             mode === 'oh-to-poh' ? '[OH⁻] Concentration (M)' :
             mode === 'ph-to-h' ? 'pH Value' :
             mode === 'poh-to-oh' ? 'pOH Value' :
             'pH Value'}
          </label>
          <input
            type="text"
            id="ph-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              mode === 'h-to-ph' ? 'e.g. 0.0001' :
              mode === 'oh-to-poh' ? 'e.g. 0.001' :
              mode === 'ph-to-h' ? 'e.g. 3' :
              mode === 'poh-to-oh' ? 'e.g. 11' :
              'e.g. 7'
            }
            className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
          />
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
            <i className="fas fa-flask mr-2 text-slate-400"></i>
            pH Analysis Results
          </h3>

          {/* Dark Hero Card */}
          <div className="bg-[#1a1a1a] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[9rem] font-black text-white/5 leading-none select-none pointer-events-none italic mr-[-1rem] mt-[-0.5rem]">
              pH
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
              <div className="space-y-1 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">pH</span>
                <span className={`text-2xl md:text-3xl font-black font-mono ${result.ph < 7 ? 'text-red-400' : result.ph > 7 ? 'text-blue-400' : 'text-emerald-400'}`}>
                  {fmtShort(result.ph)}
                </span>
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">pOH</span>
                <span className="text-2xl md:text-3xl font-black font-mono text-white">
                  {fmtShort(result.poh)}
                </span>
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">[H⁺]</span>
                <span className="text-lg md:text-xl font-black font-mono text-white break-all">
                  {fmt(result.hConc)} M
                </span>
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">[OH⁻]</span>
                <span className="text-lg md:text-xl font-black font-mono text-white break-all">
                  {fmt(result.ohConc)} M
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                <InlineMath math="K_w = [H^+][OH^-] = 1.0 \times 10^{-14}" />
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400 ml-2">
                {fmt(result.hConc * result.ohConc)}
              </span>
            </div>
          </div>

          {/* pH Scale */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl">
            <PHScale ph={result.ph} phResult={result.ph} />
          </div>

          {/* Classification Badge */}
          <div className="text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              result.ph < 3 ? 'bg-red-100 text-red-700' :
              result.ph < 7 ? 'bg-orange-100 text-orange-700' :
              result.ph === 7 ? 'bg-emerald-100 text-emerald-700' :
              result.ph < 11 ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {result.ph < 3 ? 'Strong Acid' :
               result.ph < 7 ? 'Weak Acid' :
               result.ph === 7 ? 'Neutral' :
               result.ph < 11 ? 'Weak Base' :
               'Strong Base'}
            </span>
          </div>

          {/* Steps */}
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
