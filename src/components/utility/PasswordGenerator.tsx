'use client';

import React, { useState, useCallback, useMemo } from 'react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+{}[]:;<>,.?/~`-=\\|"\'';
const AMBIGUOUS = 'il1Lo0O';

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useDigits: boolean, useSymbols: boolean, excludeAmbiguous: boolean): string {
  let pool = '';
  if (useUpper) pool += UPPER;
  if (useLower) pool += LOWER;
  if (useDigits) pool += DIGITS;
  if (useSymbols) pool += SYMBOLS;
  if (!pool) pool = LOWER;

  if (excludeAmbiguous) {
    for (const ch of AMBIGUOUS) pool = pool.replaceAll(ch, '');
  }
  if (!pool) pool = LOWER;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let pwd = '';
  for (let i = 0; i < length; i++) pwd += pool[arr[i] % pool.length];
  return pwd;
}

function calcEntropy(length: number, poolSize: number): number {
  if (poolSize <= 1) return 0;
  return length * Math.log2(poolSize);
}

function crackTime(entropy: number): string {
  if (entropy < 28) return 'instantly';
  const seconds = 2 ** (entropy - 1) / 1e10;
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3.1536e11) return `${Math.round(seconds / 31536000)} years`;
  return `~ ${(seconds / 3.1536e11).toLocaleString(undefined, { maximumFractionDigits: 0 })} centuries`;
}

function strengthLabel(entropy: number): { label: string; color: string; bg: string } {
  if (entropy < 36) return { label: 'Weak', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' };
  if (entropy < 60) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
  if (entropy < 80) return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' };
  return { label: 'Very Strong', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30' };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [copied, setCopied] = useState(false);

  const poolSize = useMemo(() => {
    let s = 0;
    if (useUpper) s += UPPER.length;
    if (useLower) s += LOWER.length;
    if (useDigits) s += DIGITS.length;
    if (useSymbols) s += SYMBOLS.length;
    if (!s) s = LOWER.length;
    let chars = UPPER + LOWER + DIGITS + SYMBOLS;
    if (excludeAmbiguous) for (const ch of AMBIGUOUS) chars = chars.replaceAll(ch, '');
    if (!s) return LOWER.length;
    // Recalculate actual pool after ambiguous removal
    let actual = 0;
    if (useUpper) actual += chars.split('').filter((c) => UPPER.includes(c)).length;
    if (useLower) actual += chars.split('').filter((c) => LOWER.includes(c)).length;
    if (useDigits) actual += chars.split('').filter((c) => DIGITS.includes(c)).length;
    if (useSymbols) actual += chars.split('').filter((c) => SYMBOLS.includes(c)).length;
    return actual || s;
  }, [useUpper, useLower, useDigits, useSymbols, excludeAmbiguous]);

  const password = useMemo(() => generatePassword(length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous), [length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous]);
  const entropy = useMemo(() => calcEntropy(length, poolSize), [length, poolSize]);
  const strength = useMemo(() => strengthLabel(entropy), [entropy]);
  const crack = useMemo(() => crackTime(entropy), [entropy]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [password]);

  const meterPct = Math.min((entropy / 128) * 100, 100);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All passwords are generated 100% locally inside your browser using cryptographically secure random values. No passwords, patterns, or data are ever transmitted or stored.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Length slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Password Length</span>
            <span className="text-sm font-black text-slate-900">{length}</span>
          </div>
          <input type="range" min="4" max="32" value={length} onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
            <span>4</span><span>12</span><span>20</span><span>32</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5">
          {[
            { label: 'Uppercase (A-Z)', key: 'upper', val: useUpper, set: setUseUpper },
            { label: 'Lowercase (a-z)', key: 'lower', val: useLower, set: setUseLower },
            { label: 'Numbers (0-9)', key: 'digits', val: useDigits, set: setUseDigits },
            { label: 'Symbols (!@#$%...)', key: 'symbols', val: useSymbols, set: setUseSymbols },
            { label: 'Exclude Ambiguous (il1Lo0O)', key: 'ambig', val: excludeAmbiguous, set: setExcludeAmbiguous },
          ].map(({ label, val, set }) => (
            <label key={label} className="flex items-center space-x-2.5 cursor-pointer group">
              <button type="button" role="checkbox" aria-checked={val} onClick={() => set(!val)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${val ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-500'}`}>
                {val && <i className="fas fa-check text-[8px] text-white"></i>}
              </button>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Generated Password */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
        <code className="text-sm md:text-base font-mono font-bold text-slate-900 break-all select-all flex-1 leading-relaxed">{password}</code>
        <div className="flex items-center space-x-2 shrink-0">
          <button type="button" onClick={handleCopy}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 hover:bg-slate-800">
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-[9px]`}></i>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Entropy Strength Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-shield-alt mr-2 text-slate-400"></i>
            Password Strength Meter
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Entropy-based strength analysis with crack-time estimation and color-coded meter.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="ps-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <linearGradient id="ps-meter" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="28%" stopColor="#f59e0b" />
                <stop offset="47%" stopColor="#10b981" />
                <stop offset="62%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
              <filter id="ps-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#ps-grid)" />
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              Entropy: {entropy.toFixed(1)} bits — {strength.label}
            </text>
            {/* Meter background track */}
            <rect x="100" y="55" width="600" height="24" rx="12" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
            {/* Meter fill */}
            <rect x="100" y="55" width={Math.min((600 * meterPct) / 100, 600)} height="24" rx="12" fill="url(#ps-meter)" opacity="0.85" />
            {/* Entropy scale markers */}
            {[36, 60, 80].map((bits) => {
              const x = 100 + (bits / 128) * 600;
              return (
                <g key={bits}>
                  <line x1={x} y1="50" x2={x} y2="84" stroke="#4b5563" strokeWidth="1" strokeDasharray="2 2" />
                  <text x={x} y="92" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">{bits}b</text>
                </g>
              );
            })}
            {/* Needle */}
            <line x1={100 + (entropy / 128) * 600} y1="50" x2={100 + (entropy / 128) * 600} y2="105" stroke="#fff" strokeWidth="2" filter="url(#ps-glow)" />
            <circle cx={100 + (entropy / 128) * 600} cy="50" r="4" fill="#fff" filter="url(#ps-glow)" />
            {/* Legend */}
            <text x="400" y="118" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">Weak (0-36)  Fair (36-60)  Strong (60-80)  Very Strong (80+)</text>
            {/* Strength badge */}
            <rect x="330" y="130" width="140" height="22" rx="11" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
            <text x="400" y="144" textAnchor="middle" fill={strength.label === 'Weak' ? '#ef4444' : strength.label === 'Fair' ? '#f59e0b' : '#34d399'} fontSize="9" fontFamily="monospace" fontWeight="bold">{strength.label}</text>
            {/* Pool / crack info */}
            <text x="400" y="175" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              Pool: {poolSize.toLocaleString()} chars per position &bull; Crack time: {crack}
            </text>
          </svg>
          <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
            <div><span className="text-neutral-400">Entropy:</span> {entropy.toFixed(1)} bits</div>
            <div><span className="text-neutral-400">Pool:</span> {poolSize.toLocaleString()} chars</div>
          </div>
          <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
            <span className="text-emerald-400">Crack:</span> {crack}
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">PASSWORD</span>
        </div>
        <div className="relative z-10 space-y-6">
          {/* Password display */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <code className="text-sm md:text-base font-mono font-bold text-white break-all select-all leading-relaxed">{password}</code>
              <button type="button" onClick={handleCopy}
                className="px-4 py-2 rounded-full bg-white text-slate-900 font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 shrink-0 hover:bg-slate-100">
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-[9px]`}></i>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength badge + entropy */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg ${strength.bg}`}>
              {strength.label}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">{entropy.toFixed(1)} bits of entropy</span>
            <span className="text-[11px] text-slate-500 font-medium">Pool: {poolSize.toLocaleString()} chars</span>
          </div>

          {/* Meter bar inside results */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${meterPct}%`, background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #34d399)' }} />
          </div>

          {/* Character set breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Uppercase', count: password.split('').filter((c) => UPPER.includes(c)).length, color: 'text-blue-400' },
              { label: 'Lowercase', count: password.split('').filter((c) => LOWER.includes(c)).length, color: 'text-emerald-400' },
              { label: 'Numbers', count: password.split('').filter((c) => DIGITS.includes(c)).length, color: 'text-amber-400' },
              { label: 'Symbols', count: password.split('').filter((c) => SYMBOLS.includes(c)).length, color: 'text-rose-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider block">{label}</span>
                <span className={`text-xl font-black mt-1 block ${color}`}>{count}</span>
              </div>
            ))}
          </div>

          {/* Crack time estimate */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Crack Time Estimate</span>
            <p className="text-sm font-black text-white mt-1 leading-relaxed">
              At 10 billion guesses per second (top consumer hardware): <span className="text-emerald-400">{crack}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
