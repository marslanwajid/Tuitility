'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const fmtPct = (val: number) => val.toFixed(2) + '%';

const COMPOUND_FREQ: Record<string, number> = {
  Annually: 1,
  'Semi-Annually': 2,
  Quarterly: 4,
  Monthly: 12,
};

const FV_PRESETS = [10000, 50000, 100000, 500000, 1000000];
const PMT_PRESETS = [500, 1000, 2000, 5000];
const RATE_PRESETS = [3, 5, 7, 10];
const YEAR_PRESETS = [1, 5, 10, 15, 20, 30];

interface DiscountRow {
  year: number;
  discountFactor: number;
  discountedValue: number;
  cumulativePV: number;
}

interface WhatIfRow {
  label: string;
  rate: number;
  pv: number;
  discountAmt: number;
  discountFactor: number;
}

export default function PresentValueCalculator() {
  const [mode, setMode] = useState<'lump-sum' | 'annuity'>('lump-sum');
  const [futureValue, setFutureValue] = useState(100000);
  const [payment, setPayment] = useState(1000);
  const [numPayments, setNumPayments] = useState(120);
  const [interestRate, setInterestRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundFreq, setCompoundFreq] = useState('Annually');
  const [payTiming, setPayTiming] = useState<'end' | 'beginning'>('end');

  const freq = COMPOUND_FREQ[compoundFreq];
  const periods = years * freq;
  const ratePerPeriod = interestRate / 100 / freq;

  const lumpSumPV = useMemo(() => {
    if (ratePerPeriod === 0) return futureValue;
    return futureValue / Math.pow(1 + ratePerPeriod, periods);
  }, [futureValue, ratePerPeriod, periods]);

  const annuityPV = useMemo(() => {
    if (ratePerPeriod === 0) return payment * numPayments;
    const pvOrdinary = payment * (1 - Math.pow(1 + ratePerPeriod, -numPayments)) / ratePerPeriod;
    if (payTiming === 'beginning') return pvOrdinary * (1 + ratePerPeriod);
    return pvOrdinary;
  }, [payment, numPayments, ratePerPeriod, payTiming]);

  const presentValue = mode === 'lump-sum' ? lumpSumPV : annuityPV;
  const totalFutureAmount = mode === 'lump-sum' ? futureValue : payment * numPayments;
  const discountAmount = Math.max(0, totalFutureAmount - presentValue);
  const discountFactor = totalFutureAmount > 0 ? presentValue / totalFutureAmount : 0;
  const effectiveAnnualRate = interestRate > 0
    ? (Math.pow(1 + ratePerPeriod, freq) - 1) * 100
    : 0;

  const discountSchedule = useMemo(() => {
    const rows: DiscountRow[] = [];
    for (let y = 1; y <= years; y++) {
      const yPeriods = y * freq;
      const df = 1 / Math.pow(1 + ratePerPeriod, yPeriods);
      const dv = mode === 'lump-sum' ? futureValue * df : 0;
      let cumPV = 0;
      if (mode === 'lump-sum') {
        cumPV = futureValue * df;
      } else {
        const yPmtPeriods = Math.min(y * freq, numPayments);
        if (ratePerPeriod === 0) {
          cumPV = payment * yPmtPeriods;
        } else {
          const pvPart = payment * (1 - Math.pow(1 + ratePerPeriod, -yPmtPeriods)) / ratePerPeriod;
          cumPV = payTiming === 'beginning' ? pvPart * (1 + ratePerPeriod) : pvPart;
        }
      }
      rows.push({ year: y, discountFactor: df, discountedValue: dv, cumulativePV: cumPV });
    }
    return rows;
  }, [futureValue, payment, years, freq, ratePerPeriod, mode, numPayments, payTiming]);

  const whatIfScenarios = useMemo(() => {
    const variations = [-2, -1, 0, 1, 2];
    return variations.map((delta) => {
      const rate = interestRate + delta;
      const rPerPeriod = rate / 100 / freq;
      let pv = 0;
      if (mode === 'lump-sum') {
        if (rPerPeriod === 0) pv = futureValue;
        else pv = futureValue / Math.pow(1 + rPerPeriod, periods);
      } else {
        if (rPerPeriod === 0) pv = payment * numPayments;
        else {
          const ord = payment * (1 - Math.pow(1 + rPerPeriod, -numPayments)) / rPerPeriod;
          pv = payTiming === 'beginning' ? ord * (1 + rPerPeriod) : ord;
        }
      }
      const fv = mode === 'lump-sum' ? futureValue : payment * numPayments;
      return {
        label: delta === 0 ? 'Base' : `${delta > 0 ? '+' : ''}${delta}%`,
        rate,
        pv,
        discountAmt: Math.max(0, fv - pv),
        discountFactor: fv > 0 ? pv / fv : 0,
      } as WhatIfRow;
    });
  }, [interestRate, freq, mode, futureValue, payment, periods, numPayments, payTiming]);

  const handleReset = () => {
    setMode('lump-sum');
    setFutureValue(100000);
    setPayment(1000);
    setNumPayments(120);
    setInterestRate(7);
    setYears(10);
    setCompoundFreq('Annually');
    setPayTiming('end');
  };

  const maxRows = 30;
  const scheduleToShow = discountSchedule.length > maxRows ? discountSchedule.slice(0, maxRows) : discountSchedule;
  const isTruncated = discountSchedule.length > maxRows;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Present Value Inputs
          </h3>

          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Calculation Mode</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {(['lump-sum', 'annuity'] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`py-2.5 rounded-lg text-xs font-extrabold transition-all ${mode === m ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {m === 'lump-sum' ? 'Lump Sum' : 'Annuity'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'lump-sum' ? (
            /* Future Value */
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Future Value</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={futureValue} onChange={(e) => setFutureValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
                </div>
              </div>
              <input type="range" min={1000} max={5000000} step={1000} value={futureValue} onChange={(e) => setFutureValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5">
                {FV_PRESETS.map((amt) => (
                  <button key={amt} type="button" onClick={() => setFutureValue(amt)}
                    className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${futureValue === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {fmt(amt)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Payment Amount */
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Payment Amount</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={payment} onChange={(e) => setPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
              </div>
              <input type="range" min={10} max={50000} step={10} value={payment} onChange={(e) => setPayment(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5">
                {PMT_PRESETS.map((amt) => (
                  <button key={amt} type="button" onClick={() => setPayment(amt)}
                    className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${payment === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {fmt(amt)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Discount Rate (Annual)</label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.1" min={0} max={50} value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min={0} max={50} step={0.1} value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {RATE_PRESETS.map((r) => (
                <button key={r} type="button" onClick={() => setInterestRate(r)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${interestRate === r ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Time Period</label>
              <div className="flex items-center space-x-1">
                <input type="number" min={0.1} max={100} step={0.5} value={years}
                  onChange={(e) => setYears(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">yr</span>
              </div>
            </div>
            <input type="range" min={0.5} max={50} step={0.5} value={years} onChange={(e) => setYears(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {YEAR_PRESETS.map((y) => (
                <button key={y} type="button" onClick={() => setYears(y)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${years === y ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>

          {/* Compounding Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Compounding</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {Object.keys(COMPOUND_FREQ).map((f) => (
                <button key={f} type="button" onClick={() => setCompoundFreq(f)}
                  className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${compoundFreq === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {mode === 'annuity' && (
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Payment Timing</label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {(['end', 'beginning'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setPayTiming(t)}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${payTiming === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {t === 'end' ? 'End' : 'Beginning'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Num Payments for Annuity */}
          {mode === 'annuity' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Number of Payments</label>
                <input type="number" min={1} max={600} value={numPayments}
                  onChange={(e) => setNumPayments(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
              <input type="range" min={1} max={600} step={1} value={numPayments} onChange={(e) => setNumPayments(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="text-[10px] text-slate-400 font-mono">
                {numPayments} payments over {Math.ceil(numPayments / freq)} years at {compoundFreq.toLowerCase()} compounding
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Present Value
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">PV</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Present Value</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmt(presentValue)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  at {interestRate}% discount rate &middot; {years}yr &middot; {compoundFreq.toLowerCase()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discount Amount</span>
                  <span className="font-mono font-black text-base text-amber-400">{fmt(discountAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discount Factor</span>
                  <span className="font-mono font-black text-base text-slate-100">{discountFactor.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Future Value</span>
                  <span className="font-mono font-black text-base text-slate-300">{fmt(totalFutureAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Effective Annual Rate</span>
                  <span className="font-mono font-black text-base text-emerald-400">{fmtPct(effectiveAnnualRate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What-If Scenarios */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">What-If Analysis</span>
            <div className="space-y-2 text-xs">
              {whatIfScenarios.map((sc) => (
                <div key={sc.label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                  <span className={`font-bold ${sc.label === 'Base' ? 'text-slate-900' : 'text-slate-500'}`}>
                    {sc.rate.toFixed(1)}% {sc.label === 'Base' && <span className="text-[9px] text-slate-400 font-mono">(current)</span>}
                  </span>
                  <div className="text-right">
                    <span className="font-black font-mono text-slate-900">{fmt(sc.pv)}</span>
                    <span className="text-[10px] text-slate-400 ml-2">DF: {sc.discountFactor.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Discount Schedule */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Discount Schedule
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {discountSchedule.length} years{isTruncated ? ` (showing first ${maxRows})` : ''}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-80">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Discount Factor</th>
                <th className="px-4 py-3">Discounted Value</th>
                <th className="px-4 py-3">Cumulative PV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {scheduleToShow.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.year}</td>
                  <td className="px-4 py-2.5">{row.discountFactor.toFixed(4)}</td>
                  <td className="px-4 py-2.5">{mode === 'lump-sum' ? fmt(row.discountedValue) : '\u2014'}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.cumulativePV)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400 text-sm"></i>
            Scenario Comparison
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Scenario</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Present Value</th>
                <th className="px-4 py-3">Discount Amt</th>
                <th className="px-4 py-3">Discount Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {whatIfScenarios.map((sc) => (
                <tr key={sc.label} className={`hover:bg-slate-50/60 transition-colors ${sc.label === 'Base' ? 'bg-slate-50/40' : ''}`}>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{sc.label}</td>
                  <td className="px-4 py-2.5">{sc.rate.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 font-black text-slate-900">{fmt(sc.pv)}</td>
                  <td className="px-4 py-2.5 text-amber-600">{fmt(sc.discountAmt)}</td>
                  <td className="px-4 py-2.5">{sc.discountFactor.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
