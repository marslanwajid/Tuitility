'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormData {
  distance: string;
  fuelEfficiency: string;
  fuelPrice: string;
  isRoundTrip: boolean;
  distanceUnit: 'miles' | 'kilometers';
  efficiencyUnit: 'mpg' | 'kpl';
  fuelUnit: 'gallons' | 'liters';
  currency: 'usd' | 'eur' | 'gbp' | 'pkr' | 'inr';
  passengers: number;
}

interface FuelResult {
  totalCost: number;
  costPerPerson: number;
  totalDistance: number;
  fuelNeeded: number;
  fuelPrice: number;
  passengers: number;
  currency: string;
  isRoundTrip: boolean;
  distanceUnit: string;
  fuelUnit: string;
  steps: string[];
}

const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  usd: { symbol: '$', label: 'USD - US Dollar ($)' },
  eur: { symbol: '\u20AC', label: 'EUR - Euro (\u20AC)' },
  gbp: { symbol: '\u00A3', label: 'GBP - British Pound (\u00A3)' },
  pkr: { symbol: '\u20A8', label: 'PKR - Pakistani Rupee (\u20A8)' },
  inr: { symbol: '\u20B9', label: 'INR - Indian Rupee (\u20B9)' },
};

const formatNum = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FuelCalculator() {
  const [form, setForm] = useState<FormData>({
    distance: '', fuelEfficiency: '', fuelPrice: '',
    isRoundTrip: false, distanceUnit: 'miles',
    efficiencyUnit: 'mpg', fuelUnit: 'gallons', currency: 'usd', passengers: 1,
  });
  const [result, setResult] = useState<FuelResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handle = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculate = () => {
    const d = parseFloat(form.distance);
    const e = parseFloat(form.fuelEfficiency);
    const p = parseFloat(form.fuelPrice);
    if (!d || d <= 0) { setError('Enter a valid distance.'); return; }
    if (!e || e <= 0) { setError('Enter a valid fuel efficiency.'); return; }
    if (!p || p <= 0) { setError('Enter a valid fuel price.'); return; }

    let dist = d;
    let eff = e;
    const useLiters = form.fuelUnit === 'liters';

    if (useLiters) {
      if (form.distanceUnit === 'miles') dist *= 1.60934;
      if (form.efficiencyUnit === 'mpg') eff /= 2.35215;
    } else {
      if (form.distanceUnit === 'kilometers') dist *= 0.621371;
      if (form.efficiencyUnit === 'kpl') eff *= 2.35215;
    }

    const totalDist = form.isRoundTrip ? dist * 2 : dist;
    const fuelNeeded = totalDist / eff;
    const totalCost = fuelNeeded * p;
    const costPerPerson = totalCost / form.passengers;

    const fuelUnitLabel = useLiters ? 'L' : 'gal';
    const fuelUnitName = useLiters ? 'liters' : 'gallons';
    const priceUnit = useLiters ? 'liter' : 'gal';
    const distUnit = useLiters ? 'km' : 'miles';

    const sym = CURRENCIES[form.currency].symbol;
    const steps: string[] = [];
    steps.push('**Step 1: Convert to standard units**');
    if (useLiters) {
      if (form.distanceUnit === 'miles') steps.push(`* $${d}$ miles $\\times 1.60934 = ${dist.toFixed(2)}$ km`);
      if (form.efficiencyUnit === 'mpg') steps.push(`* $${e}$ MPG $\\div 2.35215 = ${eff.toFixed(2)}$ km/L`);
    } else {
      if (form.distanceUnit === 'kilometers') steps.push(`* $${d}$ km $\\times 0.621371 = ${dist.toFixed(2)}$ miles`);
      if (form.efficiencyUnit === 'kpl') steps.push(`* $${e}$ km/L $\\times 2.35215 = ${eff.toFixed(2)}$ MPG`);
    }
    steps.push('**Step 2: Calculate total distance**');
    steps.push(`* $\\text{Total} = ${dist.toFixed(2)} \\times ${form.isRoundTrip ? 2 : 1} = ${totalDist.toFixed(2)}$ ${distUnit}`);
    steps.push('**Step 3: Calculate fuel needed**');
    steps.push('$$\\text{Fuel} = \\frac{\\text{Distance}}{\\text{Efficiency}}$$');
    steps.push(`$$\\text{Fuel} = \\frac{${totalDist.toFixed(2)}}{${eff.toFixed(2)}} = ${fuelNeeded.toFixed(2)} \\text{ ${fuelUnitName}}$$`);
    steps.push('**Step 4: Calculate total cost**');
    steps.push('$$\\text{Cost} = \\text{Fuel} \\times \\text{Price}$$');
    steps.push(`$$\\text{Cost} = ${fuelNeeded.toFixed(2)} \\times ${p.toFixed(2)} = ${sym}${formatNum(totalCost)}$$`);
    if (form.passengers > 1) {
      steps.push('**Step 5: Calculate cost per person**');
      steps.push('$$\\text{Per Person} = \\frac{\\text{Total Cost}}{\\text{Passengers}}$$');
      steps.push(`$$\\text{Per Person} = \\frac{${sym}${formatNum(totalCost)}}{${form.passengers}} = ${sym}${formatNum(costPerPerson)}$$`);
    }

    setResult({ totalCost, costPerPerson, totalDistance: totalDist, fuelNeeded, fuelPrice: p, passengers: form.passengers, currency: form.currency, isRoundTrip: form.isRoundTrip, distanceUnit: form.distanceUnit, fuelUnit: form.fuelUnit, steps });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#1a1a1a', '#ffffff', '#8a8a8a'] });
  };

  const reset = () => {
    setForm({ distance: '', fuelEfficiency: '', fuelPrice: '', isRoundTrip: false, distanceUnit: 'miles', efficiencyUnit: 'mpg', fuelUnit: 'gallons', currency: 'usd', passengers: 1 });
    setResult(null); setError('');
  };

  const sym = CURRENCIES[form.currency].symbol;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-route mr-1 text-slate-400"></i>Distance</label>
            <input type="number" value={form.distance} onChange={e => handle('distance', e.target.value)} placeholder="0" step="0.1" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-ruler mr-1 text-slate-400"></i>Distance Unit</label>
            <select value={form.distanceUnit} onChange={e => handle('distanceUnit', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              <option value="miles">Miles</option>
              <option value="kilometers">Kilometers</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-tachometer-alt mr-1 text-slate-400"></i>Fuel Efficiency</label>
            <input type="number" value={form.fuelEfficiency} onChange={e => handle('fuelEfficiency', e.target.value)} placeholder="0" step="0.1" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-chart-line mr-1 text-slate-400"></i>Efficiency Unit</label>
            <select value={form.efficiencyUnit} onChange={e => handle('efficiencyUnit', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              <option value="mpg">MPG (Miles per Gallon)</option>
              <option value="kpl">km/L (Kilometers per Liter)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-dollar-sign mr-1 text-slate-400"></i>Fuel Price</label>
            <input type="number" value={form.fuelPrice} onChange={e => handle('fuelPrice', e.target.value)} placeholder="0.00" step="0.01" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-coins mr-1 text-slate-400"></i>Currency</label>
            <select value={form.currency} onChange={e => handle('currency', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              {Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-gas-pump mr-1 text-slate-400"></i>Fuel Unit</label>
            <select value={form.fuelUnit} onChange={e => handle('fuelUnit', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              <option value="gallons">Gallons</option>
              <option value="liters">Liters</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-users mr-1 text-slate-400"></i>Passengers</label>
            <input type="number" value={form.passengers} onChange={e => handle('passengers', Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} min={1} max={20} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={form.isRoundTrip} onChange={e => handle('isRoundTrip', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer" />
              <span className="text-xs font-bold text-slate-700"><i className="fas fa-exchange-alt mr-1.5 text-slate-400"></i>Round Trip</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
        )}

        <div className="flex justify-center space-x-4">
          <button type="button" onClick={calculate} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
            Calculate Fuel Cost
          </button>
          <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Trip Fuel Visualizer */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-road mr-2 text-slate-400"></i>
            Trip Fuel Visualizer
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Route distance, fuel consumption, and cost at a glance.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="fuel-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="fuel-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <marker id="fuel-arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#4caf50" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#fuel-grid)" />
            <line x1="50" y1="100" x2="750" y2="100" stroke="#1f1f1f" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="50" cy="100" r="10" fill="#4caf50" filter="url(#fuel-glow)" />
            <text x="50" y="125" textAnchor="middle" fill="#4caf50" fontSize="8" fontFamily="monospace" fontWeight="bold">Start</text>
            {result ? (
              <>
                <line x1="50" y1="100" x2="750" y2="100" stroke="#4caf50" strokeWidth="3" markerEnd="url(#fuel-arrow)" />
                <circle cx="750" cy="100" r="10" fill="#ef4444" filter="url(#fuel-glow)" />
                <text x="750" y="125" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace" fontWeight="bold">End</text>
                {result.isRoundTrip && (
                  <path d="M 750 100 Q 400 30 50 100" fill="none" stroke="#ff9800" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                )}
                <rect x="50" y="145" width={((result.totalDistance || 1) / 500) * 700} height="12" rx="4" fill="#4caf50" opacity="0.6" />
                <text x="400" y="175" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">
                  {formatNum(result.totalDistance)} {result.distanceUnit === 'kilometers' ? 'km' : 'mi'} {result.isRoundTrip ? '(Round Trip)' : ''}
                </text>
              </>
            ) : (
              <>
                <line x1="50" y1="100" x2="400" y2="100" stroke="#2a2a2a" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="400" cy="100" r="10" fill="#2a2a2a" />
                <text x="400" y="125" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">Destination</text>
              </>
            )}
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result ? `Fuel: ${formatNum(result.fuelNeeded)} ${result.fuelUnit === 'liters' ? 'L' : 'gal'} \u2014 ${sym}${formatNum(result.totalCost)} total` : 'Enter trip details and calculate to see the route visualizer'}
            </text>
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Dist:</span> {formatNum(result.totalDistance)} {result.distanceUnit === 'kilometers' ? 'km' : 'mi'}</div>
              <div><span className="text-neutral-400">Fuel:</span> {formatNum(result.fuelNeeded)} {result.fuelUnit === 'liters' ? 'L' : 'gal'}</div>
            </div>
          )}
          {result && (
            <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-neutral-400">Cost:</span> {sym}{formatNum(result.totalCost)}
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">FUEL</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Main display */}
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Trip Fuel Cost</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{sym}{formatNum(result.totalCost)}</span>
              {result.passengers > 1 && (
                <p className="text-sm text-slate-300 mt-2">{sym}{formatNum(result.costPerPerson)} per person <span className="text-slate-500">({result.passengers} passengers)</span></p>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Distance', value: `${formatNum(result.totalDistance)} ${result.distanceUnit === 'kilometers' ? 'km' : 'mi'}` },
                { label: 'Fuel Required', value: `${formatNum(result.fuelNeeded)} ${result.fuelUnit === 'liters' ? 'L' : 'gal'}` },
                { label: 'Fuel Price', value: `${sym}${formatNum(result.fuelPrice)}/${result.fuelUnit === 'liters' ? 'L' : 'gal'}` },
                { label: 'Passengers', value: result.passengers > 1 ? `${result.passengers} (${sym}${formatNum(result.costPerPerson)}/ea)` : '1' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-base font-black text-white mt-1 block">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Fuel Saving Tips */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Fuel Saving Tips</h4>
              <ul className="space-y-1.5">
                {[
                  'Maintain steady speeds and avoid aggressive acceleration and braking.',
                  'Keep your vehicle well-maintained with regular oil changes and tire pressure checks.',
                  'Remove unnecessary weight from your vehicle to improve fuel efficiency.',
                  'Use cruise control on highways to maintain consistent speed.',
                  'Plan your route to avoid heavy traffic and construction zones.',
                  'Consider carpooling or combining trips to reduce overall fuel consumption.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-white/80">
                    <span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span>
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
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
