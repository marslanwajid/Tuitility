'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type SolveMode = 'c1' | 'v1' | 'c2' | 'v2';

const CONC_UNITS: Record<string, number> = { M: 1, mM: 1e-3, '\u00B5M': 1e-6, nM: 1e-9 };
const VOL_UNITS: Record<string, number> = { L: 1, mL: 1e-3, '\u00B5L': 1e-6 };
const PREFIX_MAP: Record<string, string> = { 'M': '', 'mM': 'milli', '\u00B5M': 'micro', 'nM': 'nano', 'L': '', 'mL': 'milli', '\u00B5L': 'micro' };

const CONC_KEYS = Object.keys(CONC_UNITS);
const VOL_KEYS = Object.keys(VOL_UNITS);

type ConcUnit = keyof typeof CONC_UNITS;
type VolUnit = keyof typeof VOL_UNITS;

interface DilutionResult {
  solveMode: SolveMode;
  c1: number; c1Formatted: string;
  v1: number; v1Formatted: string;
  c2: number; c2Formatted: string;
  v2: number; v2Formatted: string;
  dilutionFactor: number;
  steps: string[];
}

function fmt(val: number): string {
  if (Math.abs(val) >= 1e6) return val.toExponential(4);
  if (Math.abs(val) >= 1) return val.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (Math.abs(val) >= 1e-3) return val.toFixed(4);
  return val.toExponential(4);
}

function fmtConc(val: number): string {
  if (Math.abs(val) >= 1) return `${val.toFixed(4)} M`;
  if (Math.abs(val) >= 1e-3) return `${(val * 1e3).toFixed(4)} mM`;
  if (Math.abs(val) >= 1e-6) return `${(val * 1e6).toFixed(4)} \u00B5M`;
  return `${(val * 1e9).toFixed(4)} nM`;
}

function fmtVol(val: number): string {
  if (Math.abs(val) >= 1) return `${val.toFixed(4)} L`;
  if (Math.abs(val) >= 1e-3) return `${(val * 1e3).toFixed(4)} mL`;
  return `${(val * 1e6).toFixed(4)} \u00B5L`;
}

const EXAMPLES = [
  { label: '10X to 1X PBS (10 \u00B5L)', mode: 'v1' as SolveMode, c1: '10', c1u: 'M' as ConcUnit, c2: '1', c2u: 'M' as ConcUnit, v2: '100', v2u: '\u00B5L' as VolUnit },
  { label: 'Make 100 mL of 0.5 M NaCl', mode: 'c1' as SolveMode, v1: '10', v1u: 'mL' as VolUnit, c2: '0.5', c2u: 'M' as ConcUnit, v2: '100', v2u: 'mL' as VolUnit },
  { label: 'Dilute to 50 \u00B5M (10X dilution)', mode: 'v2' as SolveMode, c1: '500', c1u: '\u00B5M' as ConcUnit, v1: '20', v1u: '\u00B5L' as VolUnit, c2: '50', c2u: '\u00B5M' as ConcUnit, v2: '200', v2u: '\u00B5L' as VolUnit },
  { label: 'Find stock molarity', mode: 'c1' as SolveMode, v1: '5', v1u: 'mL' as VolUnit, c2: '0.25', c2u: 'M' as ConcUnit, v2: '250', v2u: 'mL' as VolUnit },
  { label: 'Serial dilution 1:100', mode: 'v1' as SolveMode, c1: '100', c1u: '\u00B5M' as ConcUnit, c2: '1', c2u: '\u00B5M' as ConcUnit, v2: '500', v2u: '\u00B5L' as VolUnit },
  { label: 'From 1 M stock to 10 mM', mode: 'v1' as SolveMode, c1: '1', c1u: 'M' as ConcUnit, c2: '10', c2u: 'mM' as ConcUnit, v2: '50', v2u: 'mL' as VolUnit },
];

const SOLVE_LABELS: Record<SolveMode, { target: string; inputs: string[] }> = {
  c1: { target: 'C\u2081 (Stock Concentration)', inputs: ['V\u2081', 'C\u2082', 'V\u2082'] },
  v1: { target: 'V\u2081 (Stock Volume)', inputs: ['C\u2081', 'C\u2082', 'V\u2082'] },
  c2: { target: 'C\u2082 (Final Concentration)', inputs: ['C\u2081', 'V\u2081', 'V\u2082'] },
  v2: { target: 'V\u2082 (Final Volume)', inputs: ['C\u2081', 'V\u2081', 'C\u2082'] },
};

export default function DilutionCalculator() {
  const [solveMode, setSolveMode] = useState<SolveMode>('v1');
  const [c1, setC1] = useState('10');
  const [c1u, setC1u] = useState<ConcUnit>('M');
  const [v1, setV1] = useState('1');
  const [v1u, setV1u] = useState<VolUnit>('mL');
  const [c2, setC2] = useState('1');
  const [c2u, setC2u] = useState<ConcUnit>('M');
  const [v2, setV2] = useState('100');
  const [v2u, setV2u] = useState<VolUnit>('mL');
  const [error, setError] = useState('');
  const [result, setResult] = useState<DilutionResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animRef = useRef<number>(0);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 3000;
    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      setAnimProgress(Math.min(1, elapsed / duration));
      if (elapsed < duration) animRef.current = requestAnimationFrame(step);
    }
    if (result) animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [result]);

  const getInput = (val: string) => parseFloat(val) || 0;

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const n_c1 = getInput(c1);
    const n_v1 = getInput(v1);
    const n_c2 = getInput(c2);
    const n_v2 = getInput(v2);

    const c1_SI = n_c1 * CONC_UNITS[c1u];
    const v1_SI = n_v1 * VOL_UNITS[v1u];
    const c2_SI = n_c2 * CONC_UNITS[c2u];
    const v2_SI = n_v2 * VOL_UNITS[v2u];

    let targetC1 = n_c1, targetV1 = n_v1, targetC2 = n_c2, targetV2 = n_v2;
    let solvedVal = 0;
    let steps: string[] = [];
    const dilC1 = c1_SI, dilV1 = v1_SI, dilC2 = c2_SI, dilV2 = v2_SI;

    if (solveMode === 'c1') {
      if (!n_v1 || !n_c2 || !n_v2) { setError('Enter V\u2081, C\u2082, and V\u2082'); return; }
      solvedVal = (c2_SI * v2_SI) / v1_SI;
      targetC1 = solvedVal / CONC_UNITS[c1u];
      steps = [
        `Using the dilution formula $C_1 V_1 = C_2 V_2$, solve for $C_1$:`,
        `$C_1 = \\frac{C_2 \\times V_2}{V_1}$`,
        `$C_1 = \\frac{${fmt(dilC2)} \\times ${fmt(dilV2)}}{${fmt(dilV1)}}$`,
        `$C_1 = ${fmt(solvedVal)} \\text{ mol/L} = ${fmtConc(solvedVal)}$`,
        `**Result:** The stock concentration required is **${fmtConc(solvedVal)}**.`,
      ];
    } else if (solveMode === 'v1') {
      if (!n_c1 || !n_c2 || !n_v2) { setError('Enter C\u2081, C\u2082, and V\u2082'); return; }
      solvedVal = (c2_SI * v2_SI) / c1_SI;
      targetV1 = solvedVal / VOL_UNITS[v1u];
      steps = [
        `Using the dilution formula $C_1 V_1 = C_2 V_2$, solve for $V_1$:`,
        `$V_1 = \\frac{C_2 \\times V_2}{C_1}$`,
        `$V_1 = \\frac{${fmt(dilC2)} \\times ${fmt(dilV2)}}{${fmt(dilC1)}}$`,
        `$V_1 = ${fmt(solvedVal)} \\text{ L} = ${fmtVol(solvedVal)}$`,
        `**Result:** You need **${fmtVol(solvedVal)}** of the stock solution.`,
      ];
    } else if (solveMode === 'c2') {
      if (!n_c1 || !n_v1 || !n_v2) { setError('Enter C\u2081, V\u2081, and V\u2082'); return; }
      solvedVal = (c1_SI * v1_SI) / v2_SI;
      targetC2 = solvedVal / CONC_UNITS[c2u];
      steps = [
        `Using the dilution formula $C_1 V_1 = C_2 V_2$, solve for $C_2$:`,
        `$C_2 = \\frac{C_1 \\times V_1}{V_2}$`,
        `$C_2 = \\frac{${fmt(dilC1)} \\times ${fmt(dilV1)}}{${fmt(dilV2)}}$`,
        `$C_2 = ${fmt(solvedVal)} \\text{ mol/L} = ${fmtConc(solvedVal)}$`,
        `**Result:** The final concentration will be **${fmtConc(solvedVal)}**.`,
      ];
    } else {
      if (!n_c1 || !n_v1 || !n_c2) { setError('Enter C\u2081, V\u2081, and C\u2082'); return; }
      if (c2_SI === 0) { setError('Final concentration cannot be zero'); return; }
      solvedVal = (c1_SI * v1_SI) / c2_SI;
      targetV2 = solvedVal / VOL_UNITS[v2u];
      steps = [
        `Using the dilution formula $C_1 V_1 = C_2 V_2$, solve for $V_2$:`,
        `$V_2 = \\frac{C_1 \\times V_1}{C_2}$`,
        `$V_2 = \\frac{${fmt(dilC1)} \\times ${fmt(dilV1)}}{${fmt(dilC2)}}$`,
        `$V_2 = ${fmt(solvedVal)} \\text{ L} = ${fmtVol(solvedVal)}$`,
        `**Result:** The final volume will be **${fmtVol(solvedVal)}**.`,
      ];
    }

    const df = solveMode === 'c2' || solveMode === 'v2'
      ? (c2_SI > 0 ? c1_SI / c2_SI : 0)
      : (v2_SI > 0 ? v2_SI / v1_SI : 0);
    steps.push(`**Dilution Factor:** The solution is diluted **${df.toFixed(2)}-fold**.`);

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#1a1a1a', '#ffffff', '#a1a1a1'] });

    const makeRes = (): DilutionResult => ({
      solveMode,
      c1: targetC1, c1Formatted: fmtConc(c1_SI),
      v1: targetV1, v1Formatted: fmtVol(v1_SI),
      c2: targetC2, c2Formatted: fmtConc(c2_SI),
      v2: targetV2, v2Formatted: fmtVol(v2_SI),
      dilutionFactor: df,
      steps,
    });
    setResult(makeRes());
    setAnimProgress(0);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleReset = () => {
    setSolveMode('v1'); setC1('10'); setC1u('M'); setV1('1'); setV1u('mL');
    setC2('1'); setC2u('M'); setV2('100'); setV2u('mL');
    setError(''); setResult(null);
  };

  const loadExample = (ex: typeof EXAMPLES[number]) => {
    setSolveMode(ex.mode);
    if (ex.c1 !== undefined) { setC1(ex.c1); setC1u(ex.c1u); }
    if (ex.v1 !== undefined) { setV1(ex.v1); setV1u(ex.v1u); }
    setC2(ex.c2); setC2u(ex.c2u); setV2(ex.v2); setV2u(ex.v2u);
    setError(''); setResult(null);
  };

  const concentrationBar = useMemo(() => {
    if (!result) return [];
    const c1SI = result.c1 * CONC_UNITS[c1u];
    const c2SI = result.c2 * CONC_UNITS[c2u];
    const maxVal = Math.max(c1SI, c2SI, 1);
    return [
      { label: 'Stock', conc: c1SI / maxVal, val: result.c1Formatted },
      { label: 'Final', conc: c2SI / maxVal, val: result.c2Formatted },
    ];
  }, [result, c1u, c2u]);

  function renderInputs() {
    const isSolveC1 = solveMode === 'c1';
    const isSolveV1 = solveMode === 'v1';
    const isSolveC2 = solveMode === 'c2';
    const isSolveV2 = solveMode === 'v2';

    return (
      <>
        {/* C1 input (disabled when solving for C1) */}
        <div className={`bg-white border ${isSolveC1 ? 'border-slate-200/50 bg-slate-50/50' : 'border-slate-200/80'} p-5 rounded-2xl text-left space-y-3`}>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Stock Concentration (C&#x2081;)</span>
          <input type="text" value={c1} onChange={(e) => { setC1(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
            disabled={isSolveC1}
            placeholder="e.g., 10" className={`w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none ${isSolveC1 ? 'text-slate-300' : ''}`} />
          <select value={c1u} onChange={(e) => setC1u(e.target.value as ConcUnit)}
            className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
            {CONC_KEYS.map(u => <option key={u} value={u}>{u === '\u00B5M' ? '\u00B5M' : u}</option>)}
          </select>
        </div>

        {/* V1 input (disabled when solving for V1) */}
        <div className={`bg-white border ${isSolveV1 ? 'border-slate-200/50 bg-slate-50/50' : 'border-slate-200/80'} p-5 rounded-2xl text-left space-y-3`}>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Stock Volume (V&#x2081;)</span>
          <input type="text" value={v1} onChange={(e) => { setV1(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
            disabled={isSolveV1}
            placeholder="e.g., 1" className={`w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none ${isSolveV1 ? 'text-slate-300' : ''}`} />
          <select value={v1u} onChange={(e) => setV1u(e.target.value as VolUnit)}
            className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
            {VOL_KEYS.map(u => <option key={u} value={u}>{u === '\u00B5L' ? '\u00B5L' : u}</option>)}
          </select>
        </div>

        {/* C2 input (disabled when solving for C2) */}
        <div className={`bg-white border ${isSolveC2 ? 'border-slate-200/50 bg-slate-50/50' : 'border-slate-200/80'} p-5 rounded-2xl text-left space-y-3`}>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Final Concentration (C&#x2082;)</span>
          <input type="text" value={c2} onChange={(e) => { setC2(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
            disabled={isSolveC2}
            placeholder="e.g., 1" className={`w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none ${isSolveC2 ? 'text-slate-300' : ''}`} />
          <select value={c2u} onChange={(e) => setC2u(e.target.value as ConcUnit)}
            className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
            {CONC_KEYS.map(u => <option key={u} value={u}>{u === '\u00B5M' ? '\u00B5M' : u}</option>)}
          </select>
        </div>

        {/* V2 input (disabled when solving for V2) */}
        <div className={`bg-white border ${isSolveV2 ? 'border-slate-200/50 bg-slate-50/50' : 'border-slate-200/80'} p-5 rounded-2xl text-left space-y-3`}>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Final Volume (V&#x2082;)</span>
          <input type="text" value={v2} onChange={(e) => { setV2(e.target.value.replace(/[^0-9.eE+-]/g, '')); setError(''); }}
            disabled={isSolveV2}
            placeholder="e.g., 100" className={`w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none ${isSolveV2 ? 'text-slate-300' : ''}`} />
          <select value={v2u} onChange={(e) => setV2u(e.target.value as VolUnit)}
            className="w-full text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 focus:outline-none focus:border-slate-400">
            {VOL_KEYS.map(u => <option key={u} value={u}>{u === '\u00B5L' ? '\u00B5L' : u}</option>)}
          </select>
        </div>
      </>
    );
  }

  const renderSteps = () => {
    if (!result) return null;
    const parts: React.ReactNode[] = [];
    result.steps.forEach((s, i) => {
      const elements: React.ReactNode[] = [];
      let remaining = s;
      while (remaining.length > 0) {
        const boldStart = remaining.indexOf('**');
        const inlineStart = remaining.indexOf('$');
        const blockStart = remaining.indexOf('$$');

        if (boldStart === -1 && inlineStart === -1 && blockStart === -1) {
          elements.push(remaining);
          break;
        }

        const nextSpecial = Math.min(
          boldStart >= 0 ? boldStart : Infinity,
          inlineStart >= 0 ? inlineStart : Infinity,
          blockStart >= 0 ? blockStart : Infinity
        );

        if (nextSpecial > 0) {
          elements.push(remaining.substring(0, nextSpecial));
          remaining = remaining.substring(nextSpecial);
          continue;
        }

        if (boldStart === 0) {
          const end = remaining.indexOf('**', 2);
          if (end === -1) { elements.push(remaining); break; }
          elements.push(<strong key={`${i}-b-${elements.length}`} className="text-slate-900">{remaining.substring(2, end)}</strong>);
          remaining = remaining.substring(end + 2);
        } else if (blockStart === 0) {
          const end = remaining.indexOf('$$', 2);
          if (end === -1) { elements.push(remaining); break; }
          elements.push(<div key={`${i}-bl-${elements.length}`} className="my-1.5"><BlockMath math={remaining.substring(2, end)} /></div>);
          remaining = remaining.substring(end + 2);
        } else if (inlineStart === 0) {
          const end = remaining.indexOf('$', 1);
          if (end === -1) { elements.push(remaining); break; }
          elements.push(<InlineMath key={`${i}-il-${elements.length}`} math={remaining.substring(1, end)} />);
          remaining = remaining.substring(end + 1);
        }
      }
      parts.push(<div key={i} className="text-xs text-slate-600 leading-relaxed">{elements}</div>);
    });
    return parts;
  };

  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Dilution Calculator</span>
          <span className="text-xs text-slate-500 mt-1"><InlineMath math="C_1 V_1 = C_2 V_2" /></span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Examples</span>
          <select onChange={(e) => { const idx = parseInt(e.target.value); if (idx >= 0) loadExample(EXAMPLES[idx]); }} defaultValue=""
            className="mt-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-400">
            <option value="" disabled>Select an example...</option>
            {EXAMPLES.map((ex, i) => <option key={i} value={i}>{ex.label}</option>)}
          </select>
        </div>
      </div>

      {/* Solve Mode Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl w-fit mx-auto">
        {([
          { key: 'c1' as SolveMode, label: 'Solve for C\u2081' },
          { key: 'v1' as SolveMode, label: 'Solve for V\u2081' },
          { key: 'c2' as SolveMode, label: 'Solve for C\u2082' },
          { key: 'v2' as SolveMode, label: 'Solve for V\u2082' },
        ]).map(({ key, label }) => (
          <button key={key} type="button" onClick={() => { setSolveMode(key); setError(''); setResult(null); }}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all duration-200 ${solveMode === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleCalc} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInputs()}
        </div>

        <div className="flex justify-center space-x-4">
          <button type="submit" className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm">
            Calculate
          </button>
          <button type="button" onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm">
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
      )}

      {/* Dilution Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">Dilution Visualizer</span>
          <span className="text-[9px] text-slate-450 font-medium">Concentration gradient across stock and final solution.</span>
        </div>
        <div className="w-full max-w-4xl relative">
          <svg ref={svgRef} viewBox="0 0 800 220" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl overflow-hidden block">
            <defs>
              <pattern id="dil-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="stock-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="final-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="dil-arrow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="url(#dil-grid)" />

            {/* Stock beaker */}
            <g transform="translate(30, 20)">
              <rect x="10" y="30" width="130" height="170" rx="6" fill="#111827" stroke="#374151" strokeWidth="1.2" />
              <rect x="10" y="30" width="130" height={170 * (result ? Math.min(1, Math.max(0.2, animProgress)) : 0.5)} rx="6" fill="url(#stock-grad)" opacity="0.85" />
              <text x="75" y="18" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace" fontWeight="bold">STOCK</text>
              <text x="75" y={50 + 170 * (result ? Math.min(0.5, Math.max(0.1, 1 - animProgress)) : 0.3)} textAnchor="middle" fill="#e0e7ff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {result ? result.c1Formatted : '—'}
              </text>
              {result && (
                <text x="75" y="205" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">
                  {fmtVol(result.c1 * CONC_UNITS[c1u] > 0 ? result.v1 * VOL_UNITS[v1u] : 1)} {/* placeholder text */}
                  {result.solveMode === 'c1' || result.solveMode === 'v1' ? '?' : `${result.v1Formatted}`}
                </text>
              )}
            </g>

            {/* Arrow */}
            <g transform="translate(200, 85)">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
                </marker>
              </defs>
              <line x1="0" y1="25" x2="150" y2="25" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray={result ? `${animProgress * 150} ${150 - animProgress * 150}` : "4 4"} markerEnd="url(#arrowhead)" filter="url(#glow)" />
              <text x="75" y="12" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="monospace">
                Dilute (add solvent)
              </text>
              <text x="75" y="50" textAnchor="middle" fill="#6b7280" fontSize="6" fontFamily="monospace">
                {result ? `${result.dilutionFactor.toFixed(1)}X` : '—'}
              </text>
            </g>

            {/* Final beaker */}
            <g transform="translate(370, 20)">
              <rect x="10" y="30" width="130" height="170" rx="6" fill="#111827" stroke="#374151" strokeWidth="1.2" />
              <rect x="10" y="30" width="130" height={170 * (result ? Math.min(1, Math.max(0.2, animProgress * 0.8)) : 0.5)} rx="6" fill="url(#final-grad)" opacity="0.85" />
              <text x="75" y="18" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace" fontWeight="bold">FINAL</text>
              <text x="75" y={50 + 170 * (result ? Math.min(0.5, Math.max(0.1, 1 - animProgress * 0.5)) : 0.3)} textAnchor="middle" fill="#ede9fe" fontSize="8" fontFamily="monospace" fontWeight="bold">
                {result ? result.c2Formatted : '—'}
              </text>
              {result && (
                <text x="75" y="205" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">
                  {result.v2Formatted}
                </text>
              )}
            </g>

            {/* Legend */}
            <g transform="translate(560, 30)">
              <rect x="0" y="0" width="200" height="160" rx="8" fill="#0d1117" stroke="#1f2937" strokeWidth="0.8" />
              <text x="100" y="20" textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace" fontWeight="bold">KEY PARAMETERS</text>
              {result ? (
                <>
                  <text x="15" y="45" fill="#4b5563" fontSize="6" fontFamily="monospace">C\u2081 (stock)</text>
                  <text x="190" y="45" textAnchor="end" fill="#e0e7ff" fontSize="6" fontFamily="monospace" fontWeight="bold">{result.c1Formatted}</text>
                  <text x="15" y="65" fill="#4b5563" fontSize="6" fontFamily="monospace">V\u2081 (stock)</text>
                  <text x="190" y="65" textAnchor="end" fill="#e0e7ff" fontSize="6" fontFamily="monospace" fontWeight="bold">{result.v1Formatted}</text>
                  <line x1="15" y1="78" x2="185" y2="78" stroke="#1f2937" strokeWidth="0.5" />
                  <text x="15" y="95" fill="#4b5563" fontSize="6" fontFamily="monospace">C\u2082 (final)</text>
                  <text x="190" y="95" textAnchor="end" fill="#ede9fe" fontSize="6" fontFamily="monospace" fontWeight="bold">{result.c2Formatted}</text>
                  <text x="15" y="115" fill="#4b5563" fontSize="6" fontFamily="monospace">V\u2082 (final)</text>
                  <text x="190" y="115" textAnchor="end" fill="#ede9fe" fontSize="6" fontFamily="monospace" fontWeight="bold">{result.v2Formatted}</text>
                  <line x1="15" y1="128" x2="185" y2="128" stroke="#1f2937" strokeWidth="0.5" />
                  <text x="15" y="145" fill="#3b82f6" fontSize="6" fontFamily="monospace" fontWeight="bold">Dilution Factor</text>
                  <text x="190" y="145" textAnchor="end" fill="#60a5fa" fontSize="6" fontFamily="monospace" fontWeight="bold">{result.dilutionFactor.toFixed(2)}X</text>
                </>
              ) : (
                <text x="100" y="90" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="monospace">Calculate to see parameters</text>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center select-none">
            <span className="text-[120px] font-black italic">DIL</span>
          </div>

          <div className="relative z-10 space-y-8 text-left">
            <div className="text-center pb-4 border-b border-slate-800/80">
              <h3 className="text-lg font-extrabold text-white font-display">
                {solveMode === 'c1' ? 'Stock Concentration' : solveMode === 'v1' ? 'Stock Volume' : solveMode === 'c2' ? 'Final Concentration' : 'Final Volume'}
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Stock Conc. (C&#x2081;)</span>
                <span className="text-lg font-black text-white font-mono">{result.c1Formatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Stock Vol. (V&#x2081;)</span>
                <span className="text-lg font-black text-white font-mono">{result.v1Formatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Final Conc. (C&#x2082;)</span>
                <span className="text-lg font-black text-white font-mono">{result.c2Formatted}</span>
              </div>
              <div className="bg-white/5 border border-slate-700/50 p-4 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Final Vol. (V&#x2082;)</span>
                <span className="text-lg font-black text-white font-mono">{result.v2Formatted}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Dilution Summary</span>
              </div>
              <div className="divide-y divide-slate-700/50 text-xs">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Dilution Factor</span>
                  <span className="font-bold text-white">{result.dilutionFactor.toFixed(2)}X</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Stock-to-Final Ratio</span>
                  <span className="font-bold text-white">1:{result.dilutionFactor >= 1 ? result.dilutionFactor.toFixed(2) : (1 / result.dilutionFactor).toFixed(2)}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-400">Stock Remaining</span>
                  <span className="font-bold text-white">{result.solveMode === 'v1' ? result.v1Formatted : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step */}
      {result && (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Step-by-Step Calculations</h3>
          <div className="space-y-2.5">
            {renderSteps()}
          </div>
        </div>
      )}
    </div>
  );
}
