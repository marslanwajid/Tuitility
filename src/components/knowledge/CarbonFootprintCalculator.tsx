'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormData {
  carMiles: string; carMpg: string; transitMiles: string;
  flightsShort: string; flightsLong: string;
  electricity: string; naturalGas: string; renewablePct: string; householdSize: string;
  diet: string; localFoodPct: string; foodWaste: string;
  wasteGenerated: string; recyclingRate: string; compost: string;
}

interface CategoryResult {
  transport: number; energy: number; food: number; waste: number;
  total: number; comparisonText: string; indicatorLeft: string;
  tips: string[];
}

const TABS = [
  { id: 'transport', label: 'Transport', icon: 'fas fa-car' },
  { id: 'energy', label: 'Home Energy', icon: 'fas fa-home' },
  { id: 'food', label: 'Food & Diet', icon: 'fas fa-utensils' },
  { id: 'waste', label: 'Waste', icon: 'fas fa-recycle' },
];

const DIETS: Record<string, string> = { 'meat-heavy': 'Meat-Heavy', average: 'Average', vegetarian: 'Vegetarian', vegan: 'Vegan' };

const formatNum = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CarbonFootprintCalculator() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<FormData>({
    carMiles: '', carMpg: '', transitMiles: '', flightsShort: '', flightsLong: '',
    electricity: '', naturalGas: '', renewablePct: '', householdSize: '',
    diet: 'average', localFoodPct: '', foodWaste: '',
    wasteGenerated: '', recyclingRate: '', compost: 'no',
  });
  const [result, setResult] = useState<CategoryResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handle = (field: keyof FormData, value: string) => setForm(p => ({ ...p, [field]: value }));

  const generateTips = (r: { transport: number; energy: number; food: number; waste: number }) => {
    const tips: string[] = [];
    if (r.transport > 4) {
      tips.push('Consider carpooling or using public transportation to reduce commuting emissions.');
      tips.push('Try combining trips or using video conferencing instead of flying when possible.');
    }
    if (r.energy > 3) {
      tips.push('Switch to LED bulbs and energy-efficient appliances to lower home energy use.');
      tips.push('Improve home insulation and consider a programmable thermostat.');
    }
    if (r.food > 2) {
      if (form.diet === 'meat-heavy') tips.push('Try meatless days each week to lower dietary emissions.');
      tips.push('Buy local and seasonal foods to reduce transportation-related emissions.');
    }
    if (r.waste > 1) {
      if (parseFloat(form.recyclingRate) < 50) tips.push('Aim to recycle at least 50% of your waste.');
      if (form.compost !== 'yes') tips.push('Start composting food scraps to reduce methane from landfills.');
    }
    if (tips.length === 0) tips.push('Great job! Your carbon footprint is already low. Keep up the sustainable habits.');
    return tips;
  };

  const calculate = () => {
    const carMiles = parseFloat(form.carMiles) || 0;
    const carMpg = parseFloat(form.carMpg) || 25;
    const transit = parseFloat(form.transitMiles) || 0;
    const sFlights = parseFloat(form.flightsShort) || 0;
    const lFlights = parseFloat(form.flightsLong) || 0;
    const elec = parseFloat(form.electricity) || 0;
    const gas = parseFloat(form.naturalGas) || 0;
    const renew = parseFloat(form.renewablePct) || 0;
    const hhSize = Math.max(1, parseFloat(form.householdSize) || 1);
    const localPct = parseFloat(form.localFoodPct) || 0;
    const fWaste = parseFloat(form.foodWaste) || 0;
    const wasteGen = parseFloat(form.wasteGenerated) || 0;
    const recycle = parseFloat(form.recyclingRate) || 0;
    const compost = form.compost === 'yes';

    const carEms = (carMiles * 52 / carMpg) * 0.404 * 1000 / 1000;
    const transitEms = transit * 52 * 0.14 / 1000;
    const flightEms = (sFlights * 223 + lFlights * 986) / 1000;
    const transport = carEms + transitEms + flightEms;

    const elecEms = elec * 12 * 0.42 * (1 - renew / 100);
    const gasEms = gas * 12 * 5.3;
    const energy = (elecEms + gasEms) / 1000 / hhSize;

    const dietBase = { 'meat-heavy': 2500, average: 1800, vegetarian: 1300, vegan: 1000 }[form.diet] || 1800;
    const localReduce = dietBase * 0.2 * (localPct / 100);
    const foodWasteEms = fWaste * 52 * 2.5 / 1000;
    const food = (dietBase - localReduce + foodWasteEms) / 1000;

    const wasteReduce = (recycle / 100) * 0.7 + (compost ? 0.3 : 0);
    const wasteEms = wasteGen * 52 * 0.57 * (1 - wasteReduce) / 1000;
    const waste = wasteEms;

    const total = transport + energy + food + waste;
    const pct = (total / 16) * 100;
    let comparisonText: string, indicatorLeft: string;
    if (pct < 50) { comparisonText = 'Much Lower than Average'; indicatorLeft = '10%'; }
    else if (pct < 80) { comparisonText = 'Lower than Average'; indicatorLeft = '30%'; }
    else if (pct < 120) { comparisonText = 'Average'; indicatorLeft = '50%'; }
    else if (pct < 150) { comparisonText = 'Higher than Average'; indicatorLeft = '70%'; }
    else { comparisonText = 'Much Higher than Average'; indicatorLeft = '90%'; }

    const tips = generateTips({ transport, energy, food, waste });
    setResult({ transport, energy, food, waste, total, comparisonText, indicatorLeft, tips });
    setError('');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#1a1a1a', '#ffffff', '#8a8a8a'] });
  };

  const reset = () => {
    setForm({
      carMiles: '', carMpg: '', transitMiles: '', flightsShort: '', flightsLong: '',
      electricity: '', naturalGas: '', renewablePct: '', householdSize: '',
      diet: 'average', localFoodPct: '', foodWaste: '',
      wasteGenerated: '', recyclingRate: '', compost: 'no',
    });
    setTab(0); setResult(null); setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-slate-200 pb-px">
          {TABS.map((t, i) => (
            <button key={t.id} type="button" onClick={() => setTab(i)} className={`px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${tab === i ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
              <i className={`${t.icon} mr-1.5`}></i>{t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* Transport */}
          {tab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-car mr-1 text-slate-400"></i>Weekly Car Miles</label>
                <input type="number" value={form.carMiles} onChange={e => handle('carMiles', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-tachometer-alt mr-1 text-slate-400"></i>Car MPG</label>
                <input type="number" value={form.carMpg} onChange={e => handle('carMpg', e.target.value)} placeholder="25" min="1" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-bus mr-1 text-slate-400"></i>Weekly Public Transit Miles</label>
                <input type="number" value={form.transitMiles} onChange={e => handle('transitMiles', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-plane mr-1 text-slate-400"></i>Short Flights / Year</label>
                <input type="number" value={form.flightsShort} onChange={e => handle('flightsShort', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-plane-departure mr-1 text-slate-400"></i>Long Flights / Year</label>
                <input type="number" value={form.flightsLong} onChange={e => handle('flightsLong', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
            </div>
          )}

          {/* Energy */}
          {tab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-bolt mr-1 text-slate-400"></i>Monthly Electricity (kWh)</label>
                <input type="number" value={form.electricity} onChange={e => handle('electricity', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-fire mr-1 text-slate-400"></i>Monthly Natural Gas (therms)</label>
                <input type="number" value={form.naturalGas} onChange={e => handle('naturalGas', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-solar-panel mr-1 text-slate-400"></i>Renewable Energy %</label>
                <input type="number" value={form.renewablePct} onChange={e => handle('renewablePct', e.target.value)} placeholder="0" min="0" max="100" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-users mr-1 text-slate-400"></i>Household Size</label>
                <input type="number" value={form.householdSize} onChange={e => handle('householdSize', e.target.value)} placeholder="1" min="1" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
            </div>
          )}

          {/* Food */}
          {tab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-utensils mr-1 text-slate-400"></i>Diet Type</label>
                <select value={form.diet} onChange={e => handle('diet', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
                  {Object.entries(DIETS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-map-marker-alt mr-1 text-slate-400"></i>Local Food %</label>
                <input type="number" value={form.localFoodPct} onChange={e => handle('localFoodPct', e.target.value)} placeholder="0" min="0" max="100" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-trash mr-1 text-slate-400"></i>Weekly Food Waste (lbs)</label>
                <input type="number" value={form.foodWaste} onChange={e => handle('foodWaste', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
            </div>
          )}

          {/* Waste */}
          {tab === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-trash-alt mr-1 text-slate-400"></i>Weekly Waste (lbs)</label>
                <input type="number" value={form.wasteGenerated} onChange={e => handle('wasteGenerated', e.target.value)} placeholder="0" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-recycle mr-1 text-slate-400"></i>Recycling Rate %</label>
                <input type="number" value={form.recyclingRate} onChange={e => handle('recyclingRate', e.target.value)} placeholder="0" min="0" max="100" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-seedling mr-1 text-slate-400"></i>Composting</label>
                <div className="flex space-x-4 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="compost" value="yes" checked={form.compost === 'yes'} onChange={e => handle('compost', e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                    <span className="text-xs font-bold text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="compost" value="no" checked={form.compost === 'no'} onChange={e => handle('compost', e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900 cursor-pointer" />
                    <span className="text-xs font-bold text-slate-700">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {tab > 0 && (
              <button type="button" onClick={() => setTab(tab - 1)} className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-xs cursor-pointer">
                <i className="fas fa-arrow-left mr-1.5"></i>Previous
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            {tab < TABS.length - 1 && (
              <button type="button" onClick={() => setTab(tab + 1)} className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-xs cursor-pointer">
                Next<i className="fas fa-arrow-right ml-1.5"></i>
              </button>
            )}
            {tab === TABS.length - 1 && (
              <button type="button" onClick={calculate} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
                Calculate Carbon Footprint
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
        )}

        <div className="flex justify-center">
          <button type="button" onClick={reset} className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-xs cursor-pointer">
            <i className="fas fa-undo mr-1.5"></i>Reset
          </button>
        </div>
      </div>

      {/* Carbon Impact Gauge SVG Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-chart-pie mr-2 text-slate-400"></i>
            Carbon Impact Gauge
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Annual CO₂ emissions by category versus the US average (16 tons).
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="c-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="c-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#c-grid)" />
            {/* Gauge background band */}
            <rect x="50" y="90" width="700" height="20" rx="10" fill="#1a1a1a" />
            <rect x="50" y="90" width={(700 * 8) / 30} height="20" rx="10" fill="#4caf50" opacity="0.6" />
            <rect x={50 + (700 * 8) / 30} y="90" width={(700 * 8) / 30} height="20" fill="#ff9800" opacity="0.6" />
            <rect x={50 + (700 * 16) / 30} y="90" width={(700 * 8) / 30} height="20" fill="#ff5722" opacity="0.6" />
            <rect x={50 + (700 * 24) / 30} y="90" width={(700 * 6) / 30} height="20" rx="0 10 10 0" fill="#ef4444" opacity="0.6" />
            {/* Tick marks */}
            {[0, 8, 16, 24, 30].map(v => (
              <text key={v} x={50 + (v / 30) * 700} y="125" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">{v}t</text>
            ))}
            {/* Needle */}
            {result && (
              <line x1={50 + Math.min((result.total / 30) * 700, 700)} y1="90" x2={50 + Math.min((result.total / 30) * 700, 700)} y2="50" stroke="#ffffff" strokeWidth="2" filter="url(#c-glow)" />
            )}
            {!result && (
              <line x1="400" y1="90" x2="400" y2="50" stroke="#2a2a2a" strokeWidth="1.5" />
            )}
            {/* Category bars */}
            {result && (
              <>
                {[
                  { label: 'Transport', value: result.transport, color: '#2196f3' },
                  { label: 'Energy', value: result.energy, color: '#ff9800' },
                  { label: 'Food', value: result.food, color: '#4caf50' },
                  { label: 'Waste', value: result.waste, color: '#9c27b0' },
                ].map((cat, i) => {
                  const barW = Math.max((cat.value / 30) * 700, 4);
                  return (
                    <g key={cat.label}>
                      <rect x={50 + i * 175} y="145" width={Math.min(barW, 160)} height="10" rx="3" fill={cat.color} opacity="0.7" />
                      <text x={50 + i * 175 + 80} y="168" textAnchor="middle" fill="#4b5563" fontSize="6" fontFamily="monospace">{cat.label}</text>
                    </g>
                  );
                })}
              </>
            )}
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result ? `Total: ${formatNum(result.total)} t CO\u2082e (${result.comparisonText})` : 'Fill in your details and calculate to see your carbon profile'}
            </text>
            {/* US avg marker */}
            <line x1={50 + (16 / 30) * 700} y1="80" x2={50 + (16 / 30) * 700} y2="95" stroke="#ff5252" strokeWidth="1" strokeDasharray="3 2" />
            <text x={50 + (16 / 30) * 700} y="78" textAnchor="middle" fill="#ff5252" fontSize="6" fontFamily="monospace">US Avg</text>
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Total:</span> {formatNum(result.total)} t</div>
              <div><span className="text-neutral-400">vs Avg:</span> {result.comparisonText}</div>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">CARBON</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Annual Carbon Footprint</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{formatNum(result.total)} <span className="text-base font-bold text-slate-400">metric tons CO₂e</span></span>
              <p className="text-sm text-slate-300 mt-2">{result.comparisonText} <span className="text-slate-500">(US avg: 16 tons)</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Transport', value: `${formatNum(result.transport)} t`, color: '#2196f3' },
                { label: 'Home Energy', value: `${formatNum(result.energy)} t`, color: '#ff9800' },
                { label: 'Food & Diet', value: `${formatNum(result.food)} t`, color: '#4caf50' },
                { label: 'Waste', value: `${formatNum(result.waste)} t`, color: '#9c27b0' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-base font-black text-white mt-1 block" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {result.tips.length > 0 && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Reduction Tips</h4>
                <ul className="space-y-1.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-white/80">
                      <span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {(() => {
                  const steps: string[] = [];
                  steps.push('**Step 1: Calculate Transportation Emissions**');
                  steps.push('$$\\text{Car} = \\frac{\\text{miles} \\times 52}{\\text{MPG}} \\times 0.404$$');
                  steps.push(`$$\\text{Car} = ${formatNum(result.transport)} \\text{ t CO}_2\\text{e}$$`);
                  steps.push('**Step 2: Calculate Home Energy Emissions**');
                  steps.push('$$\\text{Energy} = \\frac{\\text{Electricity} \\times 12 \\times 0.42 \\times (1 - \\text{renew\\%}) + \\text{Gas} \\times 12 \\times 5.3}{\\text{Household}}$$');
                  steps.push(`$$\\text{Energy} = ${formatNum(result.energy)} \\text{ t CO}_2\\text{e}$$`);
                  steps.push('**Step 3: Calculate Food & Diet Emissions**');
                  steps.push('$$\\text{Food} = \\frac{\\text{Diet Baseline} - \\text{Local Reduction} + \\text{Waste}}{1000}$$');
                  steps.push(`$$\\text{Food} = ${formatNum(result.food)} \\text{ t CO}_2\\text{e}$$`);
                  steps.push('**Step 4: Calculate Waste Emissions**');
                  steps.push('$$\\text{Waste} = \\frac{\\text{Lbs} \\times 52 \\times 0.57 \\times (1 - \\text{reduction})}{1000}$$');
                  steps.push(`$$\\text{Waste} = ${formatNum(result.waste)} \\text{ t CO}_2\\text{e}$$`);
                  steps.push('**Step 5: Total Carbon Footprint**');
                  steps.push('$$\\text{Total} = \\text{Transport} + \\text{Energy} + \\text{Food} + \\text{Waste}$$');
                  steps.push(`$$\\text{Total} = ${formatNum(result.total)} \\text{ t CO}_2\\text{e}$$`);
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
