'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => `${val.toFixed(1)}%`;

function monthlyPmt(loan: number, rate: number, years: number): number {
  if (loan <= 0) return 0;
  const mr = rate / 100 / 12;
  const n = years * 12;
  if (mr === 0) return loan / n;
  return (loan * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

const pricePresets = [150000, 300000, 500000, 750000, 1000000];
const downPresets = [3.5, 5, 10, 15, 20, 25];
const termPresets = [15, 20, 30];
const PMI_RATE = 0.5; // annual % of loan

function scenario(price: number, downPct: number, rate: number, years: number) {
  const downAmt = price * (downPct / 100);
  const loan = price - downAmt;
  const month = monthlyPmt(loan, rate, years);
  const totalPaid = month * years * 12;
  const totalInt = totalPaid - loan;
  const totalCost = downAmt + totalPaid;
  const ltv = price > 0 ? (loan / price) * 100 : 0;
  const pmiReq = downPct < 20;
  const pmiAnnual = pmiReq ? loan * (PMI_RATE / 100) : 0;
  const pmiMonthly = pmiAnnual / 12;
  return { downAmt, loan, month, totalInt, totalCost, ltv, pmiReq, pmiAnnual, pmiMonthly, totalPaid };
}

export default function DownPaymentCalculator() {
  const [price, setPrice] = useState(400000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [closingPct, setClosingPct] = useState(3);
  const [extraDown, setExtraDown] = useState(0);

  const main = useMemo(() => scenario(price, downPct, rate, years), [price, downPct, rate, years]);
  const closingCosts = price * (closingPct / 100);
  const totalUpfront = main.downAmt + closingCosts;

  const compScenarios = useMemo(() => {
    const pcts = [10, 20, 25];
    return pcts.map(p => ({ pct: p, ...scenario(price, p, rate, years) }));
  }, [price, rate, years]);

  const breakEven = useMemo(() => {
    if (extraDown <= 0) return null;
    const newDownPct = ((price * (downPct / 100) + extraDown) / price) * 100;
    const newS = scenario(price, Math.min(newDownPct, 100), rate, years);
    const monthlySavings = main.month + main.pmiMonthly - (newS.month + newS.pmiMonthly);
    const breakMonths = monthlySavings > 0 ? extraDown / monthlySavings : Infinity;
    const breakYears = breakMonths / 12;
    const totalSavingsOverTerm = monthlySavings * years * 12;
    return { extraDown, newDownPct, monthlySavings, breakMonths, breakYears, totalSavingsOverTerm, newS };
  }, [extraDown, price, downPct, rate, years, main]);

  const handleReset = () => {
    setPrice(400000); setDownPct(20); setRate(6.5); setYears(30); setClosingPct(3); setExtraDown(0);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Purchase Details
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Home Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
            </div>
            <input type="range" min={50000} max={5000000} step={5000} value={price} onChange={(e) => setPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {pricePresets.map((a) => (
                <button key={a} type="button" onClick={() => setPrice(a)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${price === a ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(a)}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Down Payment</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.1" value={downPct} onChange={(e) => setDownPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={100} step={0.5} value={downPct} onChange={(e) => setDownPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5 flex-wrap gap-1.5">
                {downPresets.map((p) => (
                  <button key={p} type="button" onClick={() => setDownPct(p)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${Math.abs(downPct - p) < 0.1 ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {p === 3.5 ? `${p}% FHA` : `${p}%`}</button>
                ))}
              </div>
              {downPct < 20 && (
                <div className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  Below 20% — PMI required
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Interest Rate</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={15} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Loan Term</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {termPresets.map((t) => (
                  <button key={t} type="button" onClick={() => setYears(t)}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-all ${years === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {t}y</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Closing Costs</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.5" value={closingPct} onChange={(e) => setClosingPct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={10} step={0.5} value={closingPct} onChange={(e) => setClosingPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Extra Down</label>
                <input type="number" value={extraDown} onChange={(e) => setExtraDown(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
              <input type="range" min={0} max={price * 0.5} step={1000} value={extraDown} onChange={(e) => setExtraDown(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="text-[10px] text-slate-400 font-mono">Upfront needed: {fmt(totalUpfront + extraDown)}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Payment Summary
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">DOWN</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Monthly Payment (P&amp;I)</span>
                <div className="text-5xl font-black text-white font-mono">{fmt(main.month)}</div>
                <div className="text-sm text-slate-400 font-mono mt-1">{years}-year fixed</div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Down Payment</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(main.downAmt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Loan Amount</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(main.loan)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">LTV Ratio</span>
                  <span className={`font-mono font-black text-base ${main.ltv <= 80 ? 'text-emerald-400' : main.ltv <= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {fmtPct(main.ltv)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(main.totalInt)}</span>
                </div>
              </div>
            </div>
          </div>

          {main.pmiReq && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 block">PMI Required</span>
              <div className="flex justify-between text-sm">
                <span className="text-amber-700 font-bold">Monthly PMI</span>
                <span className="font-black font-mono text-amber-800">{fmt(main.pmiMonthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-700 font-bold">Annual PMI</span>
                <span className="font-black font-mono text-amber-800">{fmt(main.pmiAnnual)}</span>
              </div>
              <p className="text-[10px] text-amber-600 font-medium">
                Until LTV reaches 80% — contribute extra to principal to remove PMI sooner
              </p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Full Cost Picture</span>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Total P&amp;I Paid</span><span className="font-black font-mono text-slate-900">{fmt(main.totalPaid)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Down Payment</span><span className="font-black font-mono text-slate-900">{fmt(main.downAmt)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Closing Costs</span><span className="font-black font-mono text-slate-900">{fmt(closingCosts)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-bold">Total Cost</span>
              <span className="font-black font-mono text-lg text-slate-900">{fmt(main.totalCost + closingCosts)}</span>
            </div>
          </div>

          {breakEven && breakEven.monthlySavings > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 block">Extra Down Payment Benefit</span>
              <div className="flex justify-between text-sm"><span className="text-emerald-700 font-bold">Extra Down</span><span className="font-black font-mono text-emerald-800">{fmt(breakEven.extraDown)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-emerald-700 font-bold">Monthly Savings</span><span className="font-black font-mono text-emerald-800">{fmt(breakEven.monthlySavings)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-emerald-700 font-bold">Break-Even</span><span className="font-black font-mono text-emerald-800">{breakEven.breakMonths < Infinity ? `${Math.ceil(breakEven.breakMonths)} mo (${breakEven.breakYears.toFixed(1)} yr)` : 'N/A'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-emerald-700 font-bold">Total Saved Over Term</span><span className="font-black font-mono text-emerald-800">{fmt(breakEven.totalSavingsOverTerm)}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400 text-sm"></i>
            Scenario Comparison
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{fmt(price)} home</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3 bg-slate-100">Your Plan ({fmtPct(downPct)} down)</th>
                {compScenarios.map((s) => (
                  <th key={s.pct} className={`px-4 py-3 ${s.pct === downPct ? 'bg-slate-100' : ''}`}>{s.pct}% Down</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                { label: 'Down Payment', vals: [main.downAmt, ...compScenarios.map(s => s.downAmt)] },
                { label: 'Loan Amount', vals: [main.loan, ...compScenarios.map(s => s.loan)] },
                { label: 'Monthly P&amp;I', vals: [main.month, ...compScenarios.map(s => s.month)] },
                { label: 'Monthly + PMI', vals: [main.month + main.pmiMonthly, ...compScenarios.map(s => s.month + s.pmiMonthly)] },
                { label: 'Total Interest', vals: [main.totalInt, ...compScenarios.map(s => s.totalInt)] },
                { label: 'Total Cost', vals: [main.totalCost, ...compScenarios.map(s => s.totalCost)] },
                { label: 'LTV Ratio', vals: [main.ltv, ...compScenarios.map(s => s.ltv)], unit: '%' },
                { label: 'PMI Required', vals: [main.pmiReq, ...compScenarios.map(s => s.pmiReq)] },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                  {row.vals.map((v, j) => {
                    const isBest = row.label === 'Monthly P&amp;I' || row.label === 'Monthly + PMI' || row.label === 'Total Interest' || row.label === 'Total Cost' || row.label === 'LTV Ratio'
                      ? (typeof v === 'number' && v === Math.min(...row.vals.filter(x => typeof x === 'number') as number[]))
                      : row.label === 'PMI Required' ? v === false
                      : false;
                    return (
                      <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-black text-slate-900' : isBest ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>
                        {typeof v === 'number' ? (row.unit === '%' ? fmtPct(v) : fmt(v)) : v ? '⚠ Yes' : '✓ No'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Down Payment Reference */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Down Payment Reference
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Down %</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Down Payment</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">+PMI</th>
                <th className="px-4 py-3">Total Int.</th>
                <th className="px-4 py-3">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                { pct: 3.5, desc: 'FHA min' },
                { pct: 5, desc: 'Conv. min' },
                { pct: 10, desc: 'Moderate' },
                { pct: 15, desc: 'Lower PMI' },
                { pct: 20, desc: 'No PMI' },
                { pct: 25, desc: 'Large' },
              ].map(({ pct, desc }) => {
                const s = scenario(price, pct, rate, years);
                const isSelected = Math.abs(downPct - pct) < 0.1;
                return (
                  <tr key={pct} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-slate-50 font-black' : ''}`}>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{pct}%</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[10px]">{desc}</td>
                    <td className="px-4 py-2.5">{fmt(s.downAmt)}</td>
                    <td className="px-4 py-2.5">{fmt(s.month)}</td>
                    <td className={`px-4 py-2.5 ${s.pmiReq ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {s.pmiReq ? fmt(s.month + s.pmiMonthly) : '\u2014'}
                    </td>
                    <td className="px-4 py-2.5">{fmt(s.totalInt)}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(s.totalCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
