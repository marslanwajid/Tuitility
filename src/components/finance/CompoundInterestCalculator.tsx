'use client';

import React, { useState, useMemo } from 'react';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCurrencyDetailed = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const COMPOUND_FREQ: Record<string, number> = {
  Monthly: 12,
  Quarterly: 4,
  'Semi-Annually': 2,
  Annually: 1,
};

interface YearRow {
  year: number; startBalance: number; contribution: number; interest: number; endBalance: number; cumulativeInterest: number; cumulativeContributions: number;
}

export default function CompoundInterestCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualReturn, setAnnualReturn] = useState<number>(7);
  const [years, setYears] = useState<number>(10);
  const [inflationRate, setInflationRate] = useState<number>(3);
  const [compoundFreq, setCompoundFreq] = useState<string>('Monthly');

  const [showGoal, setShowGoal] = useState<boolean>(false);
  const [targetFV, setTargetFV] = useState<number>(500000);

  const freq = COMPOUND_FREQ[compoundFreq];
  const periodsPerYear = freq;
  const totalPeriods = years * periodsPerYear;
  const ratePerPeriod = annualReturn / 100 / periodsPerYear;
  const contributionPerPeriod = monthlyContribution * (12 / periodsPerYear);

  const result = useMemo(() => {
    const r = ratePerPeriod;
    const n = totalPeriods;
    const pmt = contributionPerPeriod;
    const p = initialInvestment;

    let fvInitial = 0;
    let fvContrib = 0;
    let totalInvested = 0;

    if (r === 0) {
      fvInitial = p;
      fvContrib = pmt * n;
    } else {
      fvInitial = p * Math.pow(1 + r, n);
      fvContrib = pmt * (Math.pow(1 + r, n) - 1) / r;
    }

    const futureValue = fvInitial + fvContrib;
    totalInvested = p + monthlyContribution * 12 * years;
    const totalInterest = futureValue - totalInvested;
    const realValue = inflationRate > 0 ? futureValue / Math.pow(1 + inflationRate / 100, years) : futureValue;
    const inflationImpact = futureValue - realValue;
    const effectiveAnnualRate = annualReturn > 0 ? (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100 : 0;

    // Required monthly contribution to reach target
    let requiredMonthly = 0;
    if (showGoal && targetFV > futureValue) {
      const target = targetFV;
      const fvInit = p * Math.pow(1 + r, n);
      const remaining = target - fvInit;
      if (remaining > 0 && r > 0) {
        const totalContribNeeded = remaining * r / (Math.pow(1 + r, n) - 1);
        requiredMonthly = totalContribNeeded / (12 / periodsPerYear);
      }
    }

    // Year-by-year table
    const yearRows: YearRow[] = [];
    let runningBalance = p;
    let cumInterest = 0;
    let cumContrib = 0;
    for (let y = 1; y <= years; y++) {
      const startBalance = runningBalance;
      let yearContrib = 0;
      let yearInterest = 0;
      for (let pIdx = 0; pIdx < periodsPerYear; pIdx++) {
        if (r === 0) {
          const addContrib = pmt;
          runningBalance += addContrib;
          yearContrib += addContrib;
        } else {
          runningBalance = runningBalance * (1 + r);
          runningBalance += pmt;
          yearContrib += pmt;
        }
      }
      yearInterest = runningBalance - startBalance - yearContrib;
      cumInterest += yearInterest;
      cumContrib += yearContrib;
      yearRows.push({
        year: y, startBalance, contribution: yearContrib, interest: yearInterest,
        endBalance: runningBalance, cumulativeInterest: cumInterest, cumulativeContributions: cumContrib,
      });
    }

    return { futureValue, totalInvested, totalInterest, realValue, inflationImpact, effectiveAnnualRate, requiredMonthly, yearRows };
  }, [initialInvestment, monthlyContribution, annualReturn, years, inflationRate, compoundFreq, showGoal, targetFV, ratePerPeriod, totalPeriods, contributionPerPeriod, periodsPerYear]);

  const quickInitial = [0, 5000, 10000, 25000, 50000];
  const quickMonthly = [0, 100, 500, 1000, 2000];
  const freqOptions = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

  const handleReset = () => {
    setInitialInvestment(10000); setMonthlyContribution(500); setAnnualReturn(7);
    setYears(10); setInflationRate(3); setCompoundFreq('Monthly');
    setShowGoal(false); setTargetFV(500000);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Investment Details
          </h3>

          {/* Initial Investment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Initial Investment</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min="0" max="500000" step="1000" value={initialInvestment} onChange={(e) => setInitialInvestment(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-2">
              {quickInitial.map((amt) => (
                <button key={amt} type="button" onClick={() => setInitialInvestment(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${initialInvestment === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt === 0 ? '$0' : formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Contribution</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min="0" max="10000" step="50" value={monthlyContribution} onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-2">
              {quickMonthly.map((amt) => (
                <button key={amt} type="button" onClick={() => setMonthlyContribution(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${monthlyContribution === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt === 0 ? '$0' : formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Return & Years */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Return</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.5" min="0" max="30" value={annualReturn}
                    onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="1" max="30" step="0.5" value={annualReturn} onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Investment Period</label>
                <span className="font-mono text-sm font-black text-slate-700">{years} yr</span>
              </div>
              <input type="range" min="1" max="50" step="1" value={years} onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
          </div>

          {/* Compounding Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Compounding Frequency</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {freqOptions.map((opt) => (
                <button key={opt} type="button" onClick={() => setCompoundFreq(opt)}
                  className={`py-2 rounded-lg text-sm font-extrabold transition-all ${compoundFreq === opt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {opt === 'Semi-Annually' ? 'Semi-Ann' : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Inflation Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Inflation Rate</label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.5" min="0" max="15" value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min="0" max="15" step="0.5" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* Goal Planning */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl overflow-hidden">
            <button type="button" onClick={() => setShowGoal(!showGoal)}
              className="w-full flex items-center justify-between p-4 text-sm font-extrabold uppercase tracking-wider text-indigo-700 hover:bg-indigo-50/80 transition-all">
              <span className="flex items-center"><i className="fas fa-bullseye mr-2 text-indigo-500"></i>Goal Planning (Target FV)</span>
              <i className={`fas fa-chevron-${showGoal ? 'up' : 'down'} text-indigo-400 text-xs transition-all`}></i>
            </button>
            {showGoal && (
              <div className="px-4 pb-4 space-y-3 text-sm animate-fade-in-up">
                <div className="space-y-1">
                  <span className="font-bold text-slate-600">Target Future Value</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-bold">$</span>
                    <input type="number" value={targetFV} onChange={(e) => setTargetFV(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-250 px-3 py-1.5 rounded-lg font-mono text-sm font-bold focus:outline-none focus:border-slate-400" />
                  </div>
                </div>
                {targetFV > result.futureValue && result.requiredMonthly > 0 && (
                  <div className="bg-white border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Current Projection:</span>
                      <span className="font-black font-mono text-indigo-700">{formatCurrency(result.futureValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Target:</span>
                      <span className="font-black font-mono text-slate-900">{formatCurrency(targetFV)}</span>
                    </div>
                    <div className="border-t border-indigo-100 pt-2 flex justify-between items-center">
                      <span className="font-bold text-indigo-700">Required Monthly:</span>
                      <span className="font-black font-mono text-lg text-indigo-600">{formatCurrencyDetailed(result.requiredMonthly)}</span>
                    </div>
                    <p className="text-xs text-slate-400">Increase your monthly contribution to reach this goal.</p>
                  </div>
                )}
                {targetFV <= result.futureValue && (
                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 text-center">
                    <span className="text-emerald-600 font-black text-sm"><i className="fas fa-check-circle mr-1"></i>On track to reach your goal!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Growth Projection
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
                  {formatCurrency(result.futureValue)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Invested</span>
                  <span className="font-mono font-black text-base text-slate-100">{formatCurrency(result.totalInvested)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-base text-emerald-400">{formatCurrency(result.totalInterest)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Real Value (Infl-Adj)</span>
                  <span className="font-mono font-black text-base text-cyan-400">{formatCurrency(result.realValue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Effective APR (APY)</span>
                  <span className="font-mono font-black text-base text-slate-100">{result.effectiveAnnualRate.toFixed(2)}%</span>
                </div>
              </div>
              {inflationRate > 0 && (
                <div className="text-xs text-slate-500 font-mono text-center border-t border-slate-800/60 pt-3">
                  Inflation impact: <span className="text-rose-400 font-bold">{formatCurrency(result.inflationImpact)}</span> lost to inflation ({inflationRate}%/yr)
                </div>
              )}
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Contribution Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Initial Investment</span>
                <span className="font-black font-mono text-slate-900">{formatCurrency(result.totalInvested > 0 ? initialInvestment : 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Monthly Contributions</span>
                <span className="font-black font-mono text-slate-900">{formatCurrency(monthlyContribution * 12 * years)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Invested</span>
                <span className="font-black font-mono text-lg text-slate-900">{formatCurrency(result.totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Compound Interest Earned</span>
                <span className="font-black font-mono text-emerald-600">{formatCurrency(result.totalInterest)}</span>
              </div>
            </div>
          </div>

          {/* Year-by-Year Table */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Year-by-Year Growth</span>
              <span className="text-[10px] text-slate-400 font-mono">{years} years</span>
            </div>
            <div className="overflow-y-auto max-h-80 rounded-xl border border-slate-200/60">
              <table className="w-full min-w-[500px] text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                    <th className="px-3 py-2 text-left">Year</th>
                    <th className="px-3 py-2 text-right">Start Balance</th>
                    <th className="px-3 py-2 text-right">Contributions</th>
                    <th className="px-3 py-2 text-right">Interest</th>
                    <th className="px-3 py-2 text-right">End Balance</th>
                    <th className="px-3 py-2 text-right">Cum. Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {result.yearRows.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-100/30 transition-colors">
                      <td className="px-3 py-2 font-bold text-slate-900">Year {row.year}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(row.startBalance)}</td>
                      <td className="px-3 py-2 text-right text-indigo-600">{formatCurrency(row.contribution)}</td>
                      <td className="px-3 py-2 text-right text-emerald-600">{formatCurrency(row.interest)}</td>
                      <td className="px-3 py-2 text-right font-black text-slate-900">{formatCurrency(row.endBalance)}</td>
                      <td className="px-3 py-2 text-right text-emerald-500">{formatCurrency(row.cumulativeInterest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
