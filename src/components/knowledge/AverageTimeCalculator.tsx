'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface TimeEntry {
  id: number;
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
}

interface TimeResult {
  mean: number;
  median?: number;
  mode?: number;
  min: number;
  max: number;
  range: number;
  stdDev: number;
  processedTimes: number[];
  outliers: number[];
  totalEntries: number;
  validEntries: number;
  method: string;
  showMs: boolean;
}

const formatTime = (ms: number, includeMs: boolean) => {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const msPart = ms % 1000;
  const pad = (n: number, len: number) => String(n).padStart(len, '0');
  if (includeMs) return `${pad(h,2)}:${pad(m,2)}:${pad(s,2)}.${pad(msPart,3)}`;
  return `${pad(h,2)}:${pad(m,2)}:${pad(s,2)}`;
};

const formatNum = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AverageTimeCalculator() {
  const [entries, setEntries] = useState<TimeEntry[]>([{ id: 1, hours: '', minutes: '', seconds: '', milliseconds: '' }]);
  const [showMs, setShowMs] = useState(false);
  const [method, setMethod] = useState('mean');
  const [excludeOutliers, setExcludeOutliers] = useState(false);
  const [outlierThreshold, setOutlierThreshold] = useState(2);
  const [result, setResult] = useState<TimeResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const addEntry = () => {
    const newId = Math.max(...entries.map(e => e.id), 0) + 1;
    setEntries([...entries, { id: newId, hours: '', minutes: '', seconds: '', milliseconds: '' }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: number, field: keyof TimeEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const calculateMean = (times: number[]) => times.reduce((s, v) => s + v, 0) / times.length;

  const calculateMedian = (times: number[]) => {
    const sorted = [...times].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const calculateMode = (times: number[]) => {
    const rounded = times.map(t => Math.round(t / 1000) * 1000);
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    let mode = rounded[0];
    rounded.forEach(t => {
      freq[t] = (freq[t] || 0) + 1;
      if (freq[t] > maxFreq) { maxFreq = freq[t]; mode = t; }
    });
    if (Object.values(freq).every(c => c === maxFreq)) return calculateMean(times);
    return mode;
  };

  const calculateStdDev = (times: number[]) => {
    if (times.length <= 1) return 0;
    const mean = calculateMean(times);
    const variance = times.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / times.length;
    return Math.sqrt(variance);
  };

  const removeOutliers = (data: number[], threshold: number) => {
    const mean = calculateMean(data);
    const stdDev = calculateStdDev(data);
    const outliers: number[] = [];
    const filtered = data.filter(v => {
      const z = Math.abs((v - mean) / stdDev);
      if (z > threshold) { outliers.push(v); return false; }
      return true;
    });
    return { filteredData: filtered, outliers };
  };

  const calculate = () => {
    const times: number[] = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const h = parseInt(e.hours) || 0;
      const m = parseInt(e.minutes) || 0;
      const s = parseInt(e.seconds) || 0;
      const ms = parseInt(e.milliseconds) || 0;
      if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59 || ms < 0 || ms > 999) {
        setError(`Invalid time in entry ${i + 1}. Use HH:MM:SS format.`); return;
      }
      if (h > 0 || m > 0 || s > 0 || ms > 0) times.push(h * 3600000 + m * 60000 + s * 1000 + ms);
    }
    if (times.length === 0) { setError('Add at least one valid time entry.'); return; }

    let processed = [...times];
    let outliers: number[] = [];
    if (excludeOutliers) {
      const r = removeOutliers(processed, outlierThreshold);
      processed = r.filteredData;
      outliers = r.outliers;
    }

    const res: TimeResult = {
      mean: calculateMean(processed),
      min: Math.min(...processed),
      max: Math.max(...processed),
      range: Math.max(...processed) - Math.min(...processed),
      stdDev: calculateStdDev(processed),
      processedTimes: processed,
      outliers,
      totalEntries: entries.length,
      validEntries: times.length,
      method,
      showMs,
    };
    if (method === 'median' || method === 'all') res.median = calculateMedian(processed);
    if (method === 'mode' || method === 'all') res.mode = calculateMode(processed);

    setResult(res);
    setError('');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#1a1a1a', '#ffffff', '#8a8a8a'] });
  };

  const reset = () => {
    setEntries([{ id: 1, hours: '', minutes: '', seconds: '', milliseconds: '' }]);
    setMethod('mean'); setShowMs(false); setExcludeOutliers(false); setOutlierThreshold(2);
    setResult(null); setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="flex items-center space-x-2">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider w-6 shrink-0">#{idx + 1}</span>
              <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1">
                <input type="number" min="0" max="23" placeholder="HH" value={entry.hours} onChange={e => updateEntry(entry.id, 'hours', e.target.value)} className="w-12 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-none" />
                <span className="text-slate-400 font-bold">:</span>
                <input type="number" min="0" max="59" placeholder="MM" value={entry.minutes} onChange={e => updateEntry(entry.id, 'minutes', e.target.value)} className="w-12 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-none" />
                <span className="text-slate-400 font-bold">:</span>
                <input type="number" min="0" max="59" placeholder="SS" value={entry.seconds} onChange={e => updateEntry(entry.id, 'seconds', e.target.value)} className="w-12 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-none" />
                {showMs && (
                  <>
                    <span className="text-slate-400 font-bold">.</span>
                    <input type="number" min="0" max="999" placeholder="MS" value={entry.milliseconds} onChange={e => updateEntry(entry.id, 'milliseconds', e.target.value)} className="w-14 text-center text-sm font-bold text-slate-800 bg-transparent focus:outline-none" />
                  </>
                )}
              </div>
              <button type="button" onClick={() => removeEntry(entry.id)} disabled={entries.length <= 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer">
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
          <button type="button" onClick={addEntry} className="text-xs font-extrabold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
            <i className="fas fa-plus mr-1"></i>Add Time Entry
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-calculator mr-1 text-slate-400"></i>Calculation Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              <option value="mean">Mean (Average)</option>
              <option value="median">Median</option>
              <option value="mode">Mode</option>
              <option value="all">All Methods</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-stopwatch mr-1 text-slate-400"></i>Milliseconds</label>
            <label className="flex items-center space-x-3 pt-2 cursor-pointer">
              <input type="checkbox" checked={showMs} onChange={e => setShowMs(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
              <span className="text-xs font-bold text-slate-700">Show Milliseconds</span>
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-filter mr-1 text-slate-400"></i>Outlier Detection</label>
            <label className="flex items-center space-x-3 pt-2 cursor-pointer">
              <input type="checkbox" checked={excludeOutliers} onChange={e => setExcludeOutliers(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
              <span className="text-xs font-bold text-slate-700">Exclude Outliers</span>
            </label>
          </div>
          {excludeOutliers && (
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-chart-line mr-1 text-slate-400"></i>Z-Score Threshold (σ)</label>
              <input type="number" value={outlierThreshold} onChange={e => setOutlierThreshold(Math.max(1, Math.min(5, parseFloat(e.target.value) || 2)))} min="1" max="5" step="0.1" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
        )}

        <div className="flex justify-center space-x-4">
          <button type="button" onClick={calculate} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
            Calculate Average
          </button>
          <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Time Distribution Scope SVG Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400"></i>
            Time Distribution Scope
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Scatter view of all time entries with central tendency markers.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="time-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="time-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#time-grid)" />
            <line x1="50" y1="150" x2="750" y2="150" stroke="#1f1f1f" strokeWidth="1.5" />
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <text key={t} x={50 + t * 700} y="165" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">{Math.round(t * 100)}%</text>
            ))}
            {result ? (
              <>
                {result.processedTimes.map((t, i) => {
                  const min = result.min;
                  const max = result.max;
                  const range = max - min || 1;
                  const x = 50 + ((t - min) / range) * 700;
                  const y = 70 + Math.random() * 60;
                  return <circle key={i} cx={x} cy={y} r="4" fill="#4caf50" opacity="0.7" filter="url(#time-glow)" />;
                })}
                {result.outliers.map((t, i) => {
                  const min = result.min;
                  const max = result.max;
                  const range = max - min || 1;
                  const x = 50 + ((t - min) / range) * 700;
                  const y = 70 + Math.random() * 60;
                  return <circle key={`o-${i}`} cx={x} cy={y} r="5" fill="#ef4444" opacity="0.8" stroke="#ff6666" strokeWidth="1" filter="url(#time-glow)" />;
                })}
                <line x1={50 + ((result.mean - result.min) / (result.max - result.min || 1)) * 700} y1="40" x2={50 + ((result.mean - result.min) / (result.max - result.min || 1)) * 700} y2="150" stroke="#ff9800" strokeWidth="2" strokeDasharray="4 3" />
                <text x={50 + ((result.mean - result.min) / (result.max - result.min || 1)) * 700} y="35" textAnchor="middle" fill="#ff9800" fontSize="8" fontFamily="monospace" fontWeight="bold">Mean</text>
                {result.median !== undefined && (
                  <>
                    <line x1={50 + ((result.median - result.min) / (result.max - result.min || 1)) * 700} y1="40" x2={50 + ((result.median - result.min) / (result.max - result.min || 1)) * 700} y2="150" stroke="#2196f3" strokeWidth="2" strokeDasharray="3 3" />
                    <text x={50 + ((result.median - result.min) / (result.max - result.min || 1)) * 700} y="25" textAnchor="middle" fill="#2196f3" fontSize="8" fontFamily="monospace" fontWeight="bold">Median</text>
                  </>
                )}
                {result.mode !== undefined && (
                  <>
                    <line x1={50 + ((result.mode - result.min) / (result.max - result.min || 1)) * 700} y1="40" x2={50 + ((result.mode - result.min) / (result.max - result.min || 1)) * 700} y2="150" stroke="#ce93d8" strokeWidth="2" strokeDasharray="2 4" />
                    <text x={50 + ((result.mode - result.min) / (result.max - result.min || 1)) * 700} y="15" textAnchor="middle" fill="#ce93d8" fontSize="8" fontFamily="monospace" fontWeight="bold">Mode</text>
                  </>
                )}
              </>
            ) : (
              <>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                  <circle key={i} cx={100 + i * 80} cy={90 + (i % 3) * 20} r="4" fill="#2a2a2a" opacity="0.5" />
                ))}
                <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
                  Add time entries and calculate to see the distribution
                </text>
              </>
            )}
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Mean:</span> {formatTime(result.mean, result.showMs)}</div>
              <div><span className="text-neutral-400">Std Dev:</span> {formatTime(result.stdDev, result.showMs)}</div>
            </div>
          )}
          {result && (
            <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-neutral-400">Entries:</span> {result.validEntries}{result.outliers.length > 0 ? ` (${result.outliers.length} outliers)` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">TIME</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Average Time Result</span>
              <span className="text-2xl md:text-3xl font-black tracking-tight font-mono">{formatTime(result.mean, result.showMs)}</span>
              <p className="text-xs text-slate-400 mt-1">Mean (Average)</p>
              {result.median !== undefined && (
                <p className="text-sm text-slate-300 mt-2">Median: <span className="font-mono">{formatTime(result.median, result.showMs)}</span></p>
              )}
              {result.mode !== undefined && (
                <p className="text-sm text-slate-300">Mode: <span className="font-mono">{formatTime(result.mode, result.showMs)}</span></p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Entries', value: String(result.totalEntries) },
                { label: 'Valid Entries', value: String(result.validEntries) },
                { label: 'Outliers', value: result.outliers.length > 0 ? String(result.outliers.length) : 'None' },
                { label: 'Min Time', value: formatTime(result.min, result.showMs) },
                { label: 'Max Time', value: formatTime(result.max, result.showMs) },
                { label: 'Time Range', value: formatTime(result.range, result.showMs) },
                { label: 'Std Deviation', value: formatTime(result.stdDev, result.showMs) },
                { label: 'Method', value: method === 'all' ? 'All Methods' : method.charAt(0).toUpperCase() + method.slice(1) },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-base font-black text-white mt-1 block font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Analysis Tips</h4>
              <ul className="space-y-1.5">
                {[
                  'Mean is most affected by outliers, while median is more robust.',
                  'Use mode to identify the most common performance level.',
                  'Standard deviation shows how consistent your times are.',
                  'Exclude outliers when analyzing typical performance.',
                  'Include more entries for more reliable statistical results.',
                  'Consider the context when interpreting your results.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-white/80">
                    <span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {(() => {
                  const steps: string[] = [];
                  steps.push('**Step 1: Convert all entries to milliseconds**');
                  steps.push('$$\\text{ms} = h \\times 3\\,600\\,000 + m \\times 60\\,000 + s \\times 1\\,000 + \\text{ms}$$');
                  steps.push(`**Step 2: ${excludeOutliers ? 'Exclude outliers' : 'Calculate mean'}**`);
                  if (excludeOutliers) {
                    steps.push(`* Removed ${result.outliers.length} outlier(s) using Z-score threshold of ${outlierThreshold}\u03C3`);
                    steps.push('$$Z_i = \\frac{|x_i - \\mu|}{\\sigma}$$');
                  }
                  steps.push('**Mean formula**');
                  steps.push('$$\\mu = \\frac{\\sum_{i=1}^{n} x_i}{n}$$');
                  steps.push(`$$\\mu = \\frac{${result.processedTimes.reduce((s, v) => s + v, 0).toLocaleString()}}{${result.processedTimes.length}} = ${result.mean.toFixed(0)} \\text{ ms}$$`);
                  steps.push(`* $\\mu = ${formatTime(result.mean, result.showMs)}$`);
                  if (result.median !== undefined) {
                    steps.push('**Median**');
                    steps.push(`* Middle sorted value = ${formatTime(result.median, result.showMs)}`);
                  }
                  if (result.mode !== undefined) {
                    steps.push('**Mode**');
                    steps.push(`* Most frequent value = ${formatTime(result.mode, result.showMs)}`);
                  }
                  steps.push('**Standard Deviation**');
                  steps.push('$$\\sigma = \\sqrt{\\frac{\\sum_{i=1}^{n} (x_i - \\mu)^2}{n}}$$');
                  steps.push(`* $\\sigma = ${formatTime(result.stdDev, result.showMs)}$`);
                  return steps.map((step, idx) => {
                    const trimmed = step.trim();
                    if (trimmed.startsWith('$$')) {
                      return (<div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin"><BlockMath math={trimmed.replace(/\$\$/g, '')} /></div>);
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
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
