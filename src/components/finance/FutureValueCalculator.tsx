'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => val.toFixed(2) + '%';

const COMPOUND_FREQ: Record<string, number> = {
  Annually: 1,
  'Semi-Annually': 2,
  Quarterly: 4,
  Monthly: 12,
};

const PV_PRESETS = [0, 10000, 50000, 100000, 500000];
const PMT_PRESETS = [500, 1000, 2000, 5000];
const RATE_PRESETS = [3, 5, 7, 10];
const YEAR_PRESETS = [1, 5, 10, 15, 20, 30];

interface GrowthRow {
  year: number;
  startBalance: number;
  contribution: number;
  interest: number;
  endBalance: number;
}

interface WhatIfRow {
  label: string;
  rate: number;
  fv: number;
  totalInterest: number;
  totalContributions: number;
}

export default function FutureValueCalculator() {
  const [mode, setMode] = useState<'lump-sum' | 'annuity'>('lump-sum');
  const [presentValue, setPresentValue] = useState(10000);
  const [payment, setPayment] = useState(1000);
  const [numPayments, setNumPayments] = useState(120);
  const [interestRate, setInterestRate] = useState(7);
  const [years, setYears] = useState(10);
  const [compoundFreq, setCompoundFreq] = useState('Annually');
  const [payTiming, setPayTiming] = useState<'end' | 'beginning'>('end');

  const freq = COMPOUND_FREQ[compoundFreq];
  const periods = years * freq;
  const ratePerPeriod = interestRate / 100 / freq;

  const lumpSumFV = useMemo(() => {
    if (ratePerPeriod === 0) return presentValue;
    return presentValue * Math.pow(1 + ratePerPeriod, periods);
  }, [presentValue, ratePerPeriod, periods]);

  const annuityFV = useMemo(() => {
    if (ratePerPeriod === 0) return payment * numPayments;
    const fvOrdinary = payment * (Math.pow(1 + ratePerPeriod, numPayments) - 1) / ratePerPeriod;
    if (payTiming === 'beginning') return fvOrdinary * (1 + ratePerPeriod);
    return fvOrdinary;
  }, [payment, numPayments, ratePerPeriod, payTiming]);

  const futureValue = mode === 'lump-sum' ? lumpSumFV : annuityFV;
  const totalContributions = mode === 'lump-sum'
    ? presentValue
    : presentValue + payment * numPayments;
  const totalInterest = Math.max(0, futureValue - totalContributions);
  const effectiveAnnualRate = interestRate > 0
    ? (Math.pow(1 + ratePerPeriod, freq) - 1) * 100
    : 0;

  // Simple interest FV for comparison
  const simpleFV = mode === 'lump-sum'
    ? presentValue * (1 + interestRate / 100 * years)
    : totalContributions;
  const compoundBonus = futureValue - simpleFV;

  const growthSchedule = useMemo(() => {
    const rows: GrowthRow[] = [];
    let runningBalance = mode === 'lump-sum' ? presentValue : 0;
    let cumContrib = mode === 'lump-sum' ? presentValue : 0;
    for (let y = 1; y <= years; y++) {
      const startBalance = runningBalance;
      let yearContrib = 0;
      let yearInterest = 0;
      if (mode === 'lump-sum') {
        for (let p = 0; p < freq; p++) {
          runningBalance = runningBalance * (1 + ratePerPeriod);
        }
        yearInterest = runningBalance - startBalance;
      } else {
        const pMax = Math.min(y * freq, numPayments);
        const pPrev = Math.min((y - 1) * freq, numPayments);
        const pThisYear = pMax - pPrev;
        for (let p = 0; p < pThisYear; p++) {
          runningBalance = runningBalance * (1 + ratePerPeriod);
          runningBalance += payment;
          yearContrib += payment;
          cumContrib += payment;
        }
        yearInterest = runningBalance - startBalance - yearContrib;
      }
      cumContrib = mode === 'lump-sum' ? presentValue : cumContrib;
      rows.push({ year: y, startBalance, contribution: yearContrib, interest: yearInterest, endBalance: runningBalance });
    }
    return rows;
  }, [presentValue, payment, years, freq, ratePerPeriod, mode, numPayments]);

  const whatIfScenarios = useMemo(() => {
    const variations = [-2, -1, 0, 1, 2];
    return variations.map((delta) => {
      const rate = interestRate + delta;
      const rPerPeriod = rate / 100 / freq;
      let fv = 0;
      let tc = 0;
      if (mode === 'lump-sum') {
        if (rPerPeriod === 0) fv = presentValue;
        else fv = presentValue * Math.pow(1 + rPerPeriod, periods);
        tc = presentValue;
      } else {
        if (rPerPeriod === 0) fv = payment * numPayments;
        else {
          const ord = payment * (Math.pow(1 + rPerPeriod, numPayments) - 1) / rPerPeriod;
          fv = payTiming === 'beginning' ? ord * (1 + rPerPeriod) : ord;
        }
        tc = presentValue + payment * numPayments;
      }
      return {
        label: delta === 0 ? 'Base' : `${delta > 0 ? '+' : ''}${delta}%`,
        rate,
        fv,
        totalInterest: Math.max(0, fv - tc),
        totalContributions: tc,
      } as WhatIfRow;
    });
  }, [interestRate, freq, mode, presentValue, payment, periods, numPayments, payTiming]);

  const handleReset = () => {
    setMode('lump-sum');
    setPresentValue(10000);
    setPayment(1000);
    setNumPayments(120);
    setInterestRate(7);
    setYears(10);
    setCompoundFreq('Annually');
    setPayTiming('end');
  };

  const maxRows = 30;
  const scheduleToShow = growthSchedule.length > maxRows ? growthSchedule.slice(0, maxRows) : growthSchedule;
  const isTruncated = growthSchedule.length > maxRows;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Future Value Inputs
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
            /* Present Value */
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Present Value</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={presentValue} onChange={(e) => setPresentValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
                </div>
              </div>
              <input type="range" min={0} max={2000000} step={100} value={presentValue} onChange={(e) => setPresentValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5">
                {PV_PRESETS.map((amt) => (
                  <button key={amt} type="button" onClick={() => setPresentValue(amt)}
                    className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${presentValue === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
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
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Growth Rate (Annual)</label>
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
            <>
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
            </>
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
            Future Value
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">FV</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Future Value</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmt(futureValue)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  at {interestRate}% growth &middot; {years}yr &middot; {compoundFreq.toLowerCase()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-base text-emerald-400">{fmt(totalInterest)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Contributions</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(totalContributions)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Effective Annual Rate</span>
                  <span className="font-mono font-black text-base text-emerald-400">{fmtPct(effectiveAnnualRate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Compound vs Simple</span>
                  <span className="font-mono font-black text-base text-amber-400">{compoundBonus >= 0 ? fmt(compoundBonus) : '$0'}</span>
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
                    <span className="font-black font-mono text-slate-900">{fmt(sc.fv)}</span>
                    <span className="text-[10px] text-slate-400 ml-2">+{fmt(sc.totalInterest)} int</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Schedule */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Growth Schedule
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {growthSchedule.length} years{isTruncated ? ` (showing first ${maxRows})` : ''}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-80">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Start Balance</th>
                <th className="px-4 py-3">Contributions</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">End Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {scheduleToShow.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.year}</td>
                  <td className="px-4 py-2.5">{fmt(row.startBalance)}</td>
                  <td className="px-4 py-2.5 text-sky-600">{row.contribution > 0 ? fmt(row.contribution) : '\u2014'}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{row.interest > 0 ? fmt(row.interest) : '\u2014'}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.endBalance)}</td>
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
                <th className="px-4 py-3">Future Value</th>
                <th className="px-4 py-3">Total Interest</th>
                <th className="px-4 py-3">Total Contributions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {whatIfScenarios.map((sc) => (
                <tr key={sc.label} className={`hover:bg-slate-50/60 transition-colors ${sc.label === 'Base' ? 'bg-slate-50/40' : ''}`}>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{sc.label}</td>
                  <td className="px-4 py-2.5">{sc.rate.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 font-black text-slate-900">{fmt(sc.fv)}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{fmt(sc.totalInterest)}</td>
                  <td className="px-4 py-2.5">{fmt(sc.totalContributions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
