'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

type FilingStatus = 'single' | 'married-joint' | 'married-separate' | 'head-household';

const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single', 'married-joint': 'Married Joint', 'married-separate': 'Married Separate', 'head-household': 'Head of Household',
};

const STATUS_KEYS: FilingStatus[] = ['single', 'married-joint', 'married-separate', 'head-household'];

// 2025 Federal Tax Brackets (Rev. Proc. 2024-40)
const BRACKETS: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  'married-joint': [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  'married-separate': [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
  'head-household': [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// 2025 Standard Deductions (One Big Beautiful Bill)
const STD_DED: Record<FilingStatus, number> = {
  single: 15750,
  'married-joint': 31500,
  'married-separate': 15750,
  'head-household': 23625,
};

// State tax rates (simplified effective rate for planning)
const STATE_DATA: Record<string, { name: string; rate: number }> = {
  AL: { name: 'Alabama', rate: 3.5 },
  AK: { name: 'Alaska', rate: 0 },
  AZ: { name: 'Arizona', rate: 3.0 },
  AR: { name: 'Arkansas', rate: 4.0 },
  CA: { name: 'California', rate: 6.0 },
  CO: { name: 'Colorado', rate: 4.4 },
  CT: { name: 'Connecticut', rate: 5.0 },
  DE: { name: 'Delaware', rate: 4.0 },
  DC: { name: 'District of Columbia', rate: 6.0 },
  FL: { name: 'Florida', rate: 0 },
  GA: { name: 'Georgia', rate: 5.0 },
  HI: { name: 'Hawaii', rate: 6.0 },
  ID: { name: 'Idaho', rate: 5.0 },
  IL: { name: 'Illinois', rate: 4.95 },
  IN: { name: 'Indiana', rate: 3.05 },
  IA: { name: 'Iowa', rate: 5.0 },
  KS: { name: 'Kansas', rate: 5.0 },
  KY: { name: 'Kentucky', rate: 4.0 },
  LA: { name: 'Louisiana', rate: 3.0 },
  ME: { name: 'Maine', rate: 6.0 },
  MD: { name: 'Maryland', rate: 5.0 },
  MA: { name: 'Massachusetts', rate: 5.0 },
  MI: { name: 'Michigan', rate: 4.25 },
  MN: { name: 'Minnesota', rate: 6.0 },
  MS: { name: 'Mississippi', rate: 4.4 },
  MO: { name: 'Missouri', rate: 4.0 },
  MT: { name: 'Montana', rate: 5.0 },
  NE: { name: 'Nebraska', rate: 5.0 },
  NV: { name: 'Nevada', rate: 0 },
  NH: { name: 'New Hampshire', rate: 0 },
  NJ: { name: 'New Jersey', rate: 5.0 },
  NM: { name: 'New Mexico', rate: 4.0 },
  NY: { name: 'New York', rate: 6.0 },
  NC: { name: 'North Carolina', rate: 4.5 },
  ND: { name: 'North Dakota', rate: 2.5 },
  OH: { name: 'Ohio', rate: 4.0 },
  OK: { name: 'Oklahoma', rate: 4.0 },
  OR: { name: 'Oregon', rate: 7.0 },
  PA: { name: 'Pennsylvania', rate: 3.07 },
  RI: { name: 'Rhode Island', rate: 4.0 },
  SC: { name: 'South Carolina', rate: 5.0 },
  SD: { name: 'South Dakota', rate: 0 },
  TN: { name: 'Tennessee', rate: 0 },
  TX: { name: 'Texas', rate: 0 },
  UT: { name: 'Utah', rate: 4.55 },
  VT: { name: 'Vermont', rate: 5.0 },
  VA: { name: 'Virginia', rate: 5.0 },
  WA: { name: 'Washington', rate: 0 },
  WV: { name: 'West Virginia', rate: 4.0 },
  WI: { name: 'Wisconsin', rate: 5.0 },
  WY: { name: 'Wyoming', rate: 0 },
};

const STATE_ABBREVS = Object.keys(STATE_DATA);

// FICA constants (2025)
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176100;
const MEDICARE_RATE = 0.0145;
const ADD_MEDICARE_RATE = 0.009;
const ADD_MED_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  'married-joint': 250000,
  'married-separate': 125000,
  'head-household': 200000,
};

const incomePresets = [30000, 50000, 75000, 100000, 200000, 500000];

interface BracketRow {
  range: string; rate: number; bracketIncome: number; tax: number;
}

interface ScenarioResult {
  label: string;
  grossIncome: number;
  stdDed: number;
  itemizedDed: number;
  totalDed: number;
  deductionSource: 'standard' | 'itemized';
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  ssTax: number;
  medicareTax: number;
  addMedicareTax: number;
  ficaTotal: number;
  totalTaxBeforeCredits: number;
  credits: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveRate: number;
  marginalRate: number;
  bracketRows: BracketRow[];
  stateRate: number;
}

function computeFederalTax(taxableIncome: number, status: FilingStatus): { tax: number; marginal: number; rows: BracketRow[] } {
  const brackets = BRACKETS[status];
  let tax = 0;
  let marginal = 0;
  const rows: BracketRow[] = [];
  let remaining = taxableIncome;
  for (const b of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, b.max - b.min);
    const bracketTax = taxableInBracket * b.rate;
    tax += bracketTax;
    if (taxableInBracket > 0) marginal = b.rate * 100;
    const rangeLabel = `$${b.min.toLocaleString()} – $${b.max === Infinity ? '+' : b.max.toLocaleString()}`;
    rows.push({ range: rangeLabel, rate: b.rate * 100, bracketIncome: taxableInBracket, tax: bracketTax });
    remaining -= taxableInBracket;
  }
  return { tax, marginal, rows };
}

function computeStateTax(taxableIncome: number, state: string): number {
  const info = STATE_DATA[state];
  if (!info || info.rate === 0) return 0;
  return taxableIncome * (info.rate / 100);
}

function computeScenario(
  baseIncome: number,
  extraIncomeAmt: number,
  extraDedAmt: number,
  status: FilingStatus,
  state: string,
  deductionMode: 'standard' | 'itemized' | 'compare',
  itemizedDed: number,
  credits: number,
  includeFICA: boolean,
): ScenarioResult {
  const grossIncome = baseIncome + extraIncomeAmt;
  const stdDed = STD_DED[status];
  const totalItemized = itemizedDed + extraDedAmt;
  const useItemized = deductionMode === 'itemized' || (deductionMode === 'compare' && totalItemized > stdDed);
  const totalDed = useItemized ? totalItemized : stdDed;
  const taxableIncome = Math.max(0, grossIncome - totalDed);
  const fed = computeFederalTax(taxableIncome, status);
  const stateTax = computeStateTax(taxableIncome, state);
  let ssTax = 0;
  let medicareTax = 0;
  let addMedicareTax = 0;
  if (includeFICA) {
    ssTax = Math.min(grossIncome, SS_WAGE_BASE) * SS_RATE;
    medicareTax = grossIncome * MEDICARE_RATE;
    const addMedThreshold = ADD_MED_THRESHOLD[status];
    if (grossIncome > addMedThreshold) {
      addMedicareTax = (grossIncome - addMedThreshold) * ADD_MEDICARE_RATE;
    }
  }
  const ficaTotal = ssTax + medicareTax + addMedicareTax;
  const totalTaxBeforeCredits = fed.tax + stateTax + ficaTotal;
  const totalTax = Math.max(0, totalTaxBeforeCredits - credits);
  const afterTaxIncome = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  return {
    label: '',
    grossIncome: Math.round(grossIncome),
    stdDed,
    itemizedDed: totalItemized,
    totalDed,
    deductionSource: useItemized ? 'itemized' : 'standard',
    taxableIncome: Math.round(taxableIncome),
    federalTax: Math.round(fed.tax),
    stateTax: Math.round(stateTax),
    ssTax: Math.round(ssTax),
    medicareTax: Math.round(medicareTax),
    addMedicareTax: Math.round(addMedicareTax),
    ficaTotal: Math.round(ficaTotal),
    totalTaxBeforeCredits: Math.round(totalTaxBeforeCredits),
    credits: Math.round(credits),
    totalTax: Math.round(totalTax),
    afterTaxIncome: Math.round(afterTaxIncome),
    effectiveRate,
    marginalRate: fed.marginal,
    bracketRows: fed.rows,
    stateRate: STATE_DATA[state]?.rate ?? 0,
  };
}

export default function TaxCalculator() {
  const [status, setStatus] = useState<FilingStatus>('single');
  const [income, setIncome] = useState(75000);
  const [state, setState] = useState('NY');
  const [deductionMode, setDeductionMode] = useState<'standard' | 'itemized' | 'compare'>('compare');
  const [itemizedDed, setItemizedDed] = useState(0);
  const [credits, setCredits] = useState(0);
  const [extraIncome, setExtraIncome] = useState(10000);
  const [extraDeductions, setExtraDeductions] = useState(5000);
  const [includeFICA, setIncludeFICA] = useState(true);
  const [activeScenario, setActiveScenario] = useState(0);

  const scenarios = useMemo(() => {
    const current = computeScenario(income, 0, 0, status, state, deductionMode, itemizedDed, credits, includeFICA);
    const extraInc = computeScenario(income, extraIncome, 0, status, state, deductionMode, itemizedDed, credits, includeFICA);
    const extraDed = computeScenario(income, 0, extraDeductions, status, state, deductionMode, itemizedDed, credits, includeFICA);
    return [
      { ...current, label: 'Current' },
      { ...extraInc, label: `+ $${extraIncome.toLocaleString()} Income` },
      { ...extraDed, label: `+ $${extraDeductions.toLocaleString()} Deductions` },
    ];
  }, [income, status, state, deductionMode, itemizedDed, credits, extraIncome, extraDeductions, includeFICA]);

  const result = scenarios[activeScenario];

  const handleReset = () => {
    setStatus('single');
    setIncome(75000);
    setState('NY');
    setDeductionMode('compare');
    setItemizedDed(0);
    setCredits(0);
    setExtraIncome(10000);
    setExtraDeductions(5000);
    setIncludeFICA(true);
    setActiveScenario(0);
  };

  const marginalBracketLabel = result.marginalRate > 0 ? `${result.marginalRate}%` : '0%';

  const deductionSavings = result.deductionSource === 'itemized'
    ? Math.max(0, result.itemizedDed - result.stdDed)
    : Math.max(0, result.stdDed - result.itemizedDed);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Filing Status Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {STATUS_KEYS.map((k) => (
            <button key={k} type="button" onClick={() => setStatus(k)}
              className={`px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all whitespace-nowrap ${status === k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {FILING_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Income & Deductions
          </h3>

          {/* Gross Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Gross Annual Income</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={income} onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min={0} max={1000000} step={1000} value={income} onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5 flex-wrap gap-y-1.5">
              {incomePresets.map((amt) => (
                <button key={amt} type="button" onClick={() => setIncome(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${income === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">State of Residence</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none cursor-pointer">
              {STATE_ABBREVS.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr} — {STATE_DATA[abbr].name}{STATE_DATA[abbr].rate > 0 ? ` (${STATE_DATA[abbr].rate}% est.)` : ' (No income tax)'}
                </option>
              ))}
            </select>
          </div>

          {/* Deduction Mode */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Deduction Method</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {(['standard', 'itemized', 'compare'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setDeductionMode(mode)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all ${deductionMode === mode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {mode === 'standard' ? 'Standard' : mode === 'itemized' ? 'Itemized' : 'Auto Compare'}
                </button>
              ))}
            </div>
            {deductionMode !== 'standard' && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Itemized Deductions</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">$</span>
                    <input type="number" value={itemizedDed} onChange={(e) => setItemizedDed(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={100000} step={500} value={itemizedDed} onChange={(e) => setItemizedDed(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            )}
            {deductionMode === 'compare' && result.stdDed > 0 && (
              <div className={`text-xs font-mono px-4 py-3 rounded-2xl border ${result.deductionSource === 'itemized' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                {result.deductionSource === 'itemized'
                  ? `Itemized saves $${deductionSavings.toLocaleString()} vs standard deduction`
                  : `Standard deduction saves $${deductionSavings.toLocaleString()} vs itemized ($${result.itemizedDed.toLocaleString()})`}
              </div>
            )}
          </div>

          {/* Tax Credits */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Tax Credits</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={credits} onChange={(e) => setCredits(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={50000} step={500} value={credits} onChange={(e) => setCredits(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* FICA Toggle */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl">
            <div>
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Include Payroll Tax (FICA)</label>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Social Security (6.2%) + Medicare (1.45% + 0.9%)</div>
            </div>
            <button type="button" onClick={() => setIncludeFICA(!includeFICA)}
              className={`relative w-12 h-6 rounded-full transition-colors ${includeFICA ? 'bg-slate-900' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${includeFICA ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            What-If Scenarios
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Extra Income (Scenario 2)</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={extraIncome} onChange={(e) => setExtraIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={200000} step={1000} value={extraIncome} onChange={(e) => setExtraIncome(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Extra Deductions (Scenario 3)</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={extraDeductions} onChange={(e) => setExtraDeductions(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={50000} step={500} value={extraDeductions} onChange={(e) => setExtraDeductions(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Tax Summary
          </h3>

          {/* Scenario Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            {scenarios.map((s, i) => (
              <button key={i} type="button" onClick={() => setActiveScenario(i)}
                className={`py-1.5 rounded-lg text-[10px] md:text-xs font-extrabold transition-all truncate ${activeScenario === i ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">TAX</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total Tax</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmt(result.totalTax)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  on {fmt(result.grossIncome)} gross income
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Effective Rate</span>
                  <span className="font-mono font-black text-base text-emerald-400">{result.effectiveRate.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Marginal Rate</span>
                  <span className="font-mono font-black text-base text-amber-400">{marginalBracketLabel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">After-Tax Income</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.afterTaxIncome)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Taxable Income</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.taxableIncome)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Panel */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Tax Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Federal Income Tax</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.federalTax)}</span>
              </div>
              {result.stateTax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    State Income Tax
                    <span className="text-[9px] text-slate-400 font-mono font-bold">({result.stateRate}%)</span>
                  </span>
                  <span className="font-black font-mono text-slate-900">{fmt(result.stateTax)}</span>
                </div>
              )}
              {result.stateTax === 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">State Income Tax</span>
                  <span className="font-black font-mono text-emerald-600">$0</span>
                </div>
              )}
              {includeFICA && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      Social Security
                      <span className="text-[9px] text-slate-400 font-mono font-bold">(6.2%)</span>
                    </span>
                    <span className="font-black font-mono text-slate-900">{fmt(result.ssTax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      Medicare
                      <span className="text-[9px] text-slate-400 font-mono font-bold">(1.45%{result.addMedicareTax > 0 ? ' + 0.9%' : ''})</span>
                    </span>
                    <span className="font-black font-mono text-slate-900">{fmt(result.medicareTax + result.addMedicareTax)}</span>
                  </div>
                </>
              )}
              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Tax</span>
                  <span className="font-black font-mono text-slate-900">{fmt(result.totalTax)}</span>
                </div>
              </div>
              {result.credits > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="font-bold">Tax Credits Applied</span>
                  <span className="font-black font-mono">−{fmt(result.credits)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-bold">After-Tax Income</span>
                <span className="font-black font-mono text-cyan-600">{fmt(result.afterTaxIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Deduction Used</span>
                <span className="font-black font-mono text-slate-700">{result.deductionSource === 'itemized' ? 'Itemized' : 'Standard'} ({fmt(result.totalDed)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width: Bracket Breakdown */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Marginal Bracket Breakdown
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{FILING_LABELS[status]}</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-80">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Tax Rate</th>
                <th className="px-4 py-3">Income Range</th>
                <th className="px-4 py-3">Amount Taxed</th>
                <th className="px-4 py-3">Tax</th>
                <th className="px-4 py-3">Cumulative Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {result.bracketRows.map((row, i) => {
                const cumTax = result.bracketRows.slice(0, i + 1).reduce((s, r) => s + r.tax, 0);
                return (
                  <tr key={i} className={`hover:bg-slate-50/60 transition-colors ${row.bracketIncome > 0 ? '' : 'opacity-40'}`}>
                    <td className="px-4 py-2.5 font-bold">{row.rate}%</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.range}</td>
                    <td className="px-4 py-2.5">{row.bracketIncome > 0 ? fmt(row.bracketIncome) : '—'}</td>
                    <td className={`px-4 py-2.5 font-bold ${row.bracketIncome > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                      {row.bracketIncome > 0 ? fmt(row.tax) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-indigo-600 font-bold">{fmt(Math.round(cumTax))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400 text-sm"></i>
            3-Way Scenario Comparison
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[650px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3 w-1/4">Metric</th>
                {scenarios.map((s, i) => (
                  <th key={i} className={`px-4 py-3 w-1/4 ${activeScenario === i ? 'text-slate-900' : ''}`}>
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                { label: 'Gross Income', val: (s: ScenarioResult) => fmt(s.grossIncome) },
                { label: 'Deductions', val: (s: ScenarioResult) => fmt(s.totalDed) },
                { label: 'Taxable Income', val: (s: ScenarioResult) => fmt(s.taxableIncome) },
                { label: 'Federal Tax', val: (s: ScenarioResult) => fmt(s.federalTax) },
                { label: 'State Tax', val: (s: ScenarioResult) => fmt(s.stateTax) },
                ...(includeFICA ? [{ label: 'FICA (SS + Medicare)', val: (s: ScenarioResult) => fmt(s.ficaTotal) }] : []),
                { label: 'Total Tax', val: (s: ScenarioResult) => fmt(s.totalTax) },
                { label: 'After-Tax Income', val: (s: ScenarioResult) => fmt(s.afterTaxIncome) },
                { label: 'Effective Rate', val: (s: ScenarioResult) => s.effectiveRate.toFixed(2) + '%' },
                { label: 'Marginal Rate', val: (s: ScenarioResult) => s.marginalRate > 0 ? s.marginalRate + '%' : '0%' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                  {scenarios.map((s, j) => {
                    const isActive = activeScenario === j;
                    return (
                      <td key={j} className={`px-4 py-2.5 ${isActive ? 'text-slate-900 font-black' : 'text-slate-500'}`}>
                        {row.val(s)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
