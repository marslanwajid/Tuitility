'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtRatio = (val: number) => val.toFixed(1);

type Mode = 'analyze' | 'needs';
type InsType = 'auto' | 'home' | 'health' | 'life' | 'disability' | 'renters';

const INSURANCE_TYPES: Record<InsType, { label: string; coverage: number; premium: number; deductible: number; desc: string; risk: number }> = {
  auto: { label: 'Auto Insurance', coverage: 50000, premium: 1200, deductible: 1000, desc: 'Protects against vehicle accidents, theft, and damage', risk: 1 },
  home: { label: 'Home Insurance', coverage: 300000, premium: 1800, deductible: 2500, desc: 'Covers damage to home and belongings from disasters', risk: 0 },
  health: { label: 'Health Insurance', coverage: 100000, premium: 6000, deductible: 5000, desc: 'Helps pay for medical expenses and healthcare', risk: 2 },
  life: { label: 'Life Insurance', coverage: 500000, premium: 600, deductible: 0, desc: 'Provides financial protection for family in case of death', risk: 1 },
  disability: { label: 'Disability Insurance', coverage: 50000, premium: 1200, deductible: 0, desc: 'Replaces income if unable to work due to illness or injury', risk: 2 },
  renters: { label: 'Renters Insurance', coverage: 50000, premium: 300, deductible: 1000, desc: 'Protects personal belongings and provides liability coverage', risk: 0 },
};

const VALUE_THRESHOLDS: Record<InsType, [number, number, number]> = {
  life: [500, 200, 100],
  auto: [50, 30, 20],
  home: [200, 100, 50],
  health: [20, 10, 5],
  disability: [30, 15, 8],
  renters: [100, 50, 25],
};

const CLAIMS_RISK: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3 };
const CLAIMS_LABELS: Record<string, string> = { none: 'None', low: 'Low', medium: 'Medium', high: 'High' };

const HIGH_RISK_US = ['Florida', 'California', 'Texas', 'Louisiana'];
const HIGH_RISK_INTL = ['India', 'Pakistan'];

const locationRisk = (loc: string): number => {
  if (HIGH_RISK_US.some(s => loc.includes(s))) return 1;
  if (HIGH_RISK_INTL.some(s => loc.includes(s))) return 1;
  return 0;
};

const ageRisk = (age: number): number => {
  if (age < 25) return 2;
  if (age < 35) return 1;
  if (age > 65) return 1;
  return 0;
};

const coveragePresets = [25000, 100000, 250000, 500000, 1000000];
const premiumPresets = [300, 600, 1200, 2400, 6000];
const deductiblePresets = [0, 500, 1000, 2500, 5000];

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia'];
const INTL_LOCATIONS = ['UAE', 'UK', 'Europe', 'Australia', 'India', 'Pakistan'];
const ALL_LOCATIONS = [...US_STATES, ...INTL_LOCATIONS, 'Other (custom)'];
const TERM_OPTIONS = [6, 12, 24, 36];

const RISK_ORDER = ['Low', 'Medium', 'High', 'Very High'];
const VALUE_ORDER = ['Poor', 'Fair', 'Good', 'Excellent'];

const riskColors: Record<string, string> = {
  Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  High: 'text-orange-600 bg-orange-50 border-orange-200',
  'Very High': 'text-rose-600 bg-rose-50 border-rose-200',
};
const valueColors: Record<string, string> = {
  Excellent: 'text-emerald-600', Good: 'text-blue-600', Fair: 'text-amber-600', Poor: 'text-rose-600',
};

interface ComparePolicy {
  provider: string;
  coverage: number;
  premium: number;
  deductible: number;
  type: InsType;
  age: number;
  location: string;
  claims: string;
}

function calcPolicy(p: { coverage: number; premium: number; deductible: number; type: InsType; age: number; location: string; claims: string }) {
  const mp = p.premium / 12;
  const ratio = p.premium > 0 ? p.coverage / p.premium : 0;
  const dp = p.coverage > 0 ? (p.deductible / p.coverage) * 100 : 0;
  const rs = ageRisk(p.age) + (CLAIMS_RISK[p.claims] || 0) + locationRisk(p.location) + INSURANCE_TYPES[p.type].risk;
  const rl = RISK_ORDER[rs <= 2 ? 0 : rs <= 4 ? 1 : rs <= 6 ? 2 : 3];
  const [et, gt, ft] = VALUE_THRESHOLDS[p.type];
  const ar = dp > 5 ? ratio * 1.2 : ratio;
  const vr = ar >= et ? 'Excellent' : ar >= gt ? 'Good' : ar >= ft ? 'Fair' : 'Poor';
  return { monthlyPremium: mp, ratio, deductiblePct: dp, riskScore: rs, riskLevel: rl, adjRatio: ar, valueRating: vr };
}

export default function InsuranceCalculator() {
  const [mode, setMode] = useState<Mode>('analyze');
  const [insType, setInsType] = useState<InsType>('auto');
  const [coverage, setCoverage] = useState(INSURANCE_TYPES['auto'].coverage);
  const [premium, setPremium] = useState(INSURANCE_TYPES['auto'].premium);
  const [deductible, setDeductible] = useState(INSURANCE_TYPES['auto'].deductible);
  const [term, setTerm] = useState(12);
  const [age, setAge] = useState(35);
  const [location, setLocation] = useState('New York');
  const [customLocation, setCustomLocation] = useState('');
  const [claims, setClaims] = useState('none');

  const [income, setIncome] = useState(75000);
  const [assets, setAssets] = useState(300000);
  const [debts, setDebts] = useState(150000);

  const [comparePolicies, setComparePolicies] = useState<ComparePolicy[]>([]);

  const handleTypeChange = (type: InsType) => {
    setInsType(type);
    const t = INSURANCE_TYPES[type];
    setCoverage(t.coverage);
    setPremium(t.premium);
    setDeductible(t.deductible);
  };

  const effectiveLocation = location === 'Other (custom)' && customLocation ? customLocation : location;

  const main = calcPolicy({ coverage, premium, deductible, type: insType, age, location: effectiveLocation, claims });

  const needsResult = useMemo(() => {
    const multipliers: Record<InsType, (i: number, a: number, d: number) => number> = {
      life: (i) => i * 10,
      disability: (i) => i * 0.65,
      home: (_, a) => a * 0.7,
      auto: () => 100000,
      health: (i) => Math.max(i * 0.1, 50000),
      renters: (_, a) => Math.max(a * 0.2, 25000),
    };
    const rec = multipliers[insType](income, assets, debts);
    return { recommended: rec, gap: Math.max(0, rec - coverage) };
  }, [insType, income, assets, debts, coverage]);

  const compareResults = useMemo(() => comparePolicies.map(p => ({ ...p, ...calcPolicy(p) })), [comparePolicies]);

  const handleReset = () => {
    setMode('analyze');
    setInsType('auto');
    setCoverage(50000);
    setPremium(1200);
    setDeductible(1000);
    setTerm(12);
    setAge(35);
    setLocation('New York');
    setCustomLocation('');
    setClaims('none');
    setIncome(75000);
    setAssets(300000);
    setDebts(150000);
    setComparePolicies([]);
  };

  const addCompare = () => {
    if (comparePolicies.length >= 3) return;
    setComparePolicies([...comparePolicies, { provider: '', coverage: 100000, premium: 1200, deductible: 1000, type: 'auto' as InsType, age: 35, location: 'New York', claims: 'none' }]);
  };

  const updateCompare = (idx: number, field: keyof ComparePolicy, value: any) => {
    const next = [...comparePolicies];
    next[idx] = { ...next[idx], [field]: value };
    setComparePolicies(next);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Policy Details
          </h3>

          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            {(['analyze', 'needs'] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`py-2.5 rounded-lg text-xs font-extrabold transition-all ${mode === m ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {m === 'analyze' ? 'Analyze Policy' : 'Needs Assessment'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Insurance Type</label>
            <select value={insType} onChange={(e) => handleTypeChange(e.target.value as InsType)}
              className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none cursor-pointer">
              {(Object.entries(INSURANCE_TYPES) as [InsType, typeof INSURANCE_TYPES[InsType]][]).map(([key, it]) => (
                <option key={key} value={key}>{it.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 font-medium">{INSURANCE_TYPES[insType].desc}</p>
          </div>

          {mode === 'analyze' ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Coverage Amount</label>
                  <input type="number" value={coverage} onChange={(e) => setCoverage(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
                <input type="range" min={5000} max={10000000} step={1000} value={coverage} onChange={(e) => setCoverage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-1.5">
                  {coveragePresets.map((amt) => (
                    <button key={amt} type="button" onClick={() => setCoverage(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${coverage === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt)}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Premium</label>
                  <input type="number" value={premium} onChange={(e) => setPremium(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
                <input type="range" min={1} max={50000} step={10} value={premium} onChange={(e) => setPremium(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-1.5">
                  {premiumPresets.map((amt) => (
                    <button key={amt} type="button" onClick={() => setPremium(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${premium === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt)}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Deductible</label>
                  <input type="number" value={deductible} onChange={(e) => setDeductible(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
                <input type="range" min={0} max={100000} step={100} value={deductible} onChange={(e) => setDeductible(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-1.5">
                  {deductiblePresets.map((amt) => (
                    <button key={amt} type="button" onClick={() => setDeductible(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${deductible === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt)}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Policy Term</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                    {TERM_OPTIONS.map((t) => (
                      <button key={t} type="button" onClick={() => setTerm(t)}
                        className={`py-2 rounded-lg text-xs font-extrabold transition-all ${term === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                        {t >= 12 ? `${t / 12} ${t === 12 ? 'yr' : 'yrs'}` : `${t} mo`}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Age</label>
                  <input type="number" min={18} max={100} value={age} onChange={(e) => setAge(Math.max(18, Math.min(100, parseInt(e.target.value) || 35)))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none appearance-none cursor-pointer">
                    <optgroup label="United States">{US_STATES.map((s) => (
                      <option key={s} value={s}>{s}{HIGH_RISK_US.includes(s) ? ' (higher risk)' : ''}</option>
                    ))}</optgroup>
                    <optgroup label="International">{INTL_LOCATIONS.map((c) => (
                      <option key={c} value={c}>{c}{HIGH_RISK_INTL.includes(c) ? ' (higher risk)' : ''}</option>
                    ))}</optgroup>
                    <option value="Other (custom)">Other (custom)</option>
                  </select>
                  {location === 'Other (custom)' && (
                    <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter your location..."
                      className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none mt-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Claims History</label>
                  {(['none', 'low', 'medium', 'high'] as const).map((c) => (
                    <button key={c} type="button" onClick={() => setClaims(c)}
                      className={`block w-full py-2 px-3 mb-1.5 last:mb-0 rounded-lg text-xs font-extrabold text-left transition-all border ${claims === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100'}`}>
                      {CLAIMS_LABELS[c]}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Income</label>
                  <input type="number" value={income} onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none" />
                  <input type="range" min={0} max={1000000} step={1000} value={income} onChange={(e) => setIncome(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Total Assets</label>
                  <input type="number" value={assets} onChange={(e) => setAssets(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none" />
                  <input type="range" min={0} max={10000000} step={10000} value={assets} onChange={(e) => setAssets(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Total Debts</label>
                  <input type="number" value={debts} onChange={(e) => setDebts(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none" />
                  <input type="range" min={0} max={10000000} step={10000} value={debts} onChange={(e) => setDebts(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Net Worth: <span className="font-black font-mono text-slate-900">{fmt(assets - debts)}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            {mode === 'analyze' ? 'Coverage Summary' : 'Coverage Needs'}
          </h3>

          {mode === 'analyze' ? (
            <>
              <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
                  <span className="text-[110px] font-black italic">COVER</span>
                </div>
                <div className="space-y-4 relative z-10 text-left">
                  <div className="text-center pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Monthly Premium</span>
                    <div className="text-5xl font-black text-white font-mono">{fmt(main.monthlyPremium)}</div>
                    <div className="text-sm text-slate-400 font-mono mt-1">per month</div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Policy Cost</span>
                      <span className="font-mono font-black text-base text-slate-100">{fmt(premium * (term / 12))}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Coverage:Premium</span>
                      <span className="font-mono font-black text-base text-slate-100">{fmtRatio(main.ratio)}:1</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Deductible</span>
                    <span className="font-black font-mono text-slate-900">{fmt(deductible)} ({fmtRatio(main.deductiblePct)}% of coverage)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Risk Level</span>
                    <span className={`font-black font-mono px-2.5 py-0.5 rounded-lg border text-xs ${riskColors[main.riskLevel]}`}>{main.riskLevel}</span>
                  </div>
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                      <span>Low</span><span>Med</span><span>High</span><span>V.High</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${RISK_ORDER.indexOf(main.riskLevel) === 0 ? 'bg-emerald-400 w-1/4' : RISK_ORDER.indexOf(main.riskLevel) === 1 ? 'bg-amber-400 w-2/4' : RISK_ORDER.indexOf(main.riskLevel) === 2 ? 'bg-orange-400 w-3/4' : 'bg-rose-500 w-full'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 ${valueColors[main.valueRating]}`}>
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Value Rating</span>
                <div className="text-3xl font-black">{main.valueRating}</div>
                <div className="text-sm font-medium">
                  Adj. Ratio: <span className="font-mono font-black">{fmtRatio(main.adjRatio)}:1</span>
                  {main.deductiblePct > 5 && <span className="text-xs ml-2">(+20% high-deductible boost)</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {INSURANCE_TYPES[insType].label}: Excellent ≥ {VALUE_THRESHOLDS[insType][0]}:1 · Good ≥ {VALUE_THRESHOLDS[insType][1]}:1 · Fair ≥ {VALUE_THRESHOLDS[insType][2]}:1
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
                  <span className="text-[110px] font-black italic">NEED</span>
                </div>
                <div className="space-y-4 relative z-10 text-left">
                  <div className="text-center pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Recommended {INSURANCE_TYPES[insType].label}</span>
                    <div className="text-4xl font-black text-white font-mono">{fmt(needsResult.recommended)}</div>
                    <div className="text-sm text-slate-400 font-mono mt-1">coverage amount</div>
                  </div>
                  <div className="text-sm space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Coverage</span>
                      <span className="font-mono font-black text-white">{fmt(coverage)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800/80 pt-2">
                      <span className="text-slate-400">Coverage Gap</span>
                      <span className={`font-mono font-black ${needsResult.gap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {needsResult.gap > 0 ? fmt(needsResult.gap) : 'Fully covered'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">How it's calculated</span>
                <div className="text-xs text-slate-500 space-y-1">
                  {insType === 'life' && <p>Life insurance: 10× annual income</p>}
                  {insType === 'disability' && <p>Disability insurance: 65% of annual income</p>}
                  {insType === 'home' && <p>Home insurance: 70% of total assets (estimated replacement cost)</p>}
                  {insType === 'auto' && <p>Auto insurance: $100K liability + comprehensive (standard)</p>}
                  {insType === 'health' && <p>Health insurance: 10% of income or $50K (whichever is greater)</p>}
                  {insType === 'renters' && <p>Renters insurance: 20% of assets or $25K (whichever is greater)</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Policy Comparison */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-balance-scale mr-2 text-slate-400 text-sm"></i>
            Policy Comparison
          </h3>
          <button type="button" onClick={addCompare} disabled={comparePolicies.length >= 3}
            className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-extrabold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            + Add Policy ({comparePolicies.length}/3)
          </button>
        </div>

        {comparePolicies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparePolicies.map((p, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase text-slate-400">Policy {idx + 2}</span>
                  <button type="button" onClick={() => setComparePolicies(comparePolicies.filter((_, i) => i !== idx))}
                    className="text-[10px] text-rose-500 font-black uppercase hover:text-rose-700">Remove</button>
                </div>
                <input type="text" value={p.provider} onChange={(e) => updateCompare(idx, 'provider', e.target.value)}
                  placeholder="Provider name"
                  className="w-full bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg font-mono text-xs font-black text-slate-700 focus:outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Coverage</label>
                    <input type="number" value={p.coverage} onChange={(e) => updateCompare(idx, 'coverage', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Premium</label>
                    <input type="number" value={p.premium} onChange={(e) => updateCompare(idx, 'premium', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Deductible</label>
                    <input type="number" value={p.deductible} onChange={(e) => updateCompare(idx, 'deductible', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">Type</label>
                    <select value={p.type} onChange={(e) => updateCompare(idx, 'type', e.target.value as InsType)}
                      className="w-full bg-white border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs font-black text-slate-700 focus:outline-none appearance-none cursor-pointer">
                      {(Object.keys(INSURANCE_TYPES) as InsType[]).map((k) => (
                        <option key={k} value={k}>{INSURANCE_TYPES[k].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {compareResults.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
            <table className="w-full min-w-[600px] text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Your Policy</th>
                  {compareResults.map((_, i) => <th key={i} className="px-4 py-3">Policy {i + 2}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {[
                  { label: 'Provider', vals: ['—', ...compareResults.map(p => p.provider || '—')] },
                  { label: 'Coverage', vals: [fmt(coverage), ...compareResults.map(p => fmt(p.coverage))] },
                  { label: 'Annual Premium', vals: [fmt(premium), ...compareResults.map(p => fmt(p.premium))] },
                  { label: 'Monthly Premium', vals: [fmt(main.monthlyPremium), ...compareResults.map(p => fmt(p.monthlyPremium))] },
                  { label: 'Deductible', vals: [fmt(deductible), ...compareResults.map(p => fmt(p.deductible))] },
                  { label: 'Deductible %', vals: [`${fmtRatio(main.deductiblePct)}%`, ...compareResults.map(p => `${fmtRatio(p.deductiblePct)}%`)] },
                  { label: 'Coverage:Premium', vals: [`${fmtRatio(main.ratio)}:1`, ...compareResults.map(p => `${fmtRatio(p.ratio)}:1`)] },
                  { label: 'Risk Level', vals: [main.riskLevel, ...compareResults.map(p => p.riskLevel)] },
                  { label: 'Value Rating', vals: [main.valueRating, ...compareResults.map(p => p.valueRating)] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-black text-slate-900' : 'text-slate-500'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Factors + Value Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2 text-slate-400 text-xs"></i>
            Risk Factors Breakdown
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
            <table className="w-full text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3">Factor</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {[
                  { factor: 'Age', value: `${age} yrs`, score: ageRisk(age) },
                  { factor: 'Claims History', value: CLAIMS_LABELS[claims], score: CLAIMS_RISK[claims] },
                  { factor: 'Location', value: effectiveLocation, score: locationRisk(effectiveLocation) },
                  { factor: 'Insurance Type', value: INSURANCE_TYPES[insType].label, score: INSURANCE_TYPES[insType].risk },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500">{row.factor}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.value}</td>
                    <td className="px-4 py-2.5 text-slate-900">+{row.score}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td className="px-4 py-3 text-slate-900">Total Risk Score</td>
                  <td className="px-4 py-3 text-slate-900">{main.riskLevel}</td>
                  <td className={`px-4 py-3 ${riskColors[main.riskLevel].split(' ')[0]}`}>{main.riskScore} → {main.riskLevel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-star mr-2 text-slate-400 text-xs"></i>
            Value Benchmarks — {INSURANCE_TYPES[insType].label}
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
            <table className="w-full text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Min Ratio</th>
                  <th className="px-4 py-3">Your Ratio</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {[
                  { rating: 'Excellent', min: VALUE_THRESHOLDS[insType][0] },
                  { rating: 'Good', min: VALUE_THRESHOLDS[insType][1] },
                  { rating: 'Fair', min: VALUE_THRESHOLDS[insType][2] },
                  { rating: 'Poor', min: 0 },
                ].map((row) => {
                  const met = row.min === 0 || main.adjRatio >= row.min;
                  const current = row.rating === main.valueRating;
                  return (
                    <tr key={row.rating} className="hover:bg-slate-50/60 transition-colors">
                      <td className={`px-4 py-2.5 font-black ${row.rating === 'Excellent' ? 'text-emerald-600' : row.rating === 'Good' ? 'text-blue-600' : row.rating === 'Fair' ? 'text-amber-600' : 'text-rose-600'}`}>{row.rating}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.min > 0 ? `≥ ${row.min}:1` : '—'}</td>
                      <td className="px-4 py-2.5 text-slate-900">{fmtRatio(main.adjRatio)}:1</td>
                      <td className="px-4 py-2.5">
                        {current ? <span className="text-emerald-600 font-black">✓ Current</span> : met ? <span className="text-slate-400">✓ Met</span> : <span className="text-rose-400">✗ Not met</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
