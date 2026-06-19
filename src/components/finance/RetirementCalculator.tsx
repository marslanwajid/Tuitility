'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const SWR_OPTIONS = [3, 4, 5] as const;
const START_AGES = [25, 30, 35, 40, 45, 50];

const quickSavings = [0, 25000, 50000, 100000, 250000];
const quickContrib = [0, 250, 500, 1000, 2000];
const quickIncome = [30000, 50000, 60000, 80000, 100000];

interface YearRow {
  age: number; startBalance: number; contribution: number; growth: number; endBalance: number; cumGrowth: number;
}

interface StartAgeRow {
  startAge: number; yearsToRetire: number; projectedSavings: number; totalContrib: number; compoundGrowth: number; monthlyIncome: number;
}

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [inflation, setInflation] = useState(3);
  const [desiredIncome, setDesiredIncome] = useState(60000);
  const [socialSecurity, setSocialSecurity] = useState(1800);
  const [includeSS, setIncludeSS] = useState(true);
  const [swr, setSwr] = useState<number>(4);

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const monthlyRate = annualReturn / 100 / 12;
  const totalMonths = yearsToRetirement * 12;

  const result = useMemo(() => {
    const n = totalMonths;
    const r = monthlyRate;

    const fvCurrent = r > 0 ? currentSavings * Math.pow(1 + r, n) : currentSavings;
    const fvContributions = r > 0
      ? monthlyContribution * (Math.pow(1 + r, n) - 1) / r
      : monthlyContribution * n;
    const projectedSavings = fvCurrent + fvContributions;

    const totalCurrentSavings = currentSavings;
    const totalMonthlyContributions = monthlyContribution * n;
    const totalContributions = totalCurrentSavings + totalMonthlyContributions;
    const compoundGrowth = Math.max(0, projectedSavings - totalContributions);

    const annualSS = includeSS ? socialSecurity * 12 : 0;
    const requiredFromSavings = Math.max(0, desiredIncome - annualSS);
    const retirementGoal = swr > 0 ? requiredFromSavings / (swr / 100) : 0;

    const onTrack = projectedSavings >= retirementGoal;
    const shortfall = Math.max(0, retirementGoal - projectedSavings);
    const readinessScore = retirementGoal > 0 ? Math.min(100, (projectedSavings / retirementGoal) * 100) : 100;

    const monthlyIncome = projectedSavings * (swr / 100) / 12;
    const annualIncome = monthlyIncome * 12;

    const shortfallFV = Math.max(0, retirementGoal - fvCurrent);
    const requiredMonthly = shortfallFV > 0
      ? (r > 0 ? shortfallFV / ((Math.pow(1 + r, n) - 1) / r) : shortfallFV / n)
      : 0;

    const realProjected = inflation > 0 ? projectedSavings / Math.pow(1 + inflation / 100, yearsToRetirement) : projectedSavings;
    const realGoal = inflation > 0 && retirementGoal > 0 ? retirementGoal / Math.pow(1 + inflation / 100, yearsToRetirement) : retirementGoal;

    // Year-by-year
    const yearRows: YearRow[] = [];
    let balance = currentSavings;
    let cumGrowth = 0;
    for (let y = 1; y <= yearsToRetirement; y++) {
      const startBalance = balance;
      let yearContrib = 0;
      let yearGrowth = 0;
      for (let p = 0; p < 12; p++) {
        if (r > 0) {
          const gain = balance * r;
          balance += gain;
          yearGrowth += gain;
        }
        balance += monthlyContribution;
        yearContrib += monthlyContribution;
      }
      cumGrowth += yearGrowth;
      yearRows.push({
        age: currentAge + y,
        startBalance,
        contribution: yearContrib,
        growth: yearGrowth,
        endBalance: balance,
        cumGrowth,
      });
    }

    // Starting age impact
    const startAgeRows: StartAgeRow[] = [];
    for (const sa of START_AGES) {
      if (sa >= retirementAge) continue;
      const ytr = retirementAge - sa;
      const m = ytr * 12;
      const fvCur = r > 0 ? 0 : 0; // starting with $0 for comparison
      const fvCont = r > 0
        ? monthlyContribution * (Math.pow(1 + r, m) - 1) / r
        : monthlyContribution * m;
      const totalCont = monthlyContribution * m;
      const proj = fvCont;
      const comp = Math.max(0, proj - totalCont);
      const mi = proj * (swr / 100) / 12;
      startAgeRows.push({
        startAge: sa, yearsToRetire: ytr, projectedSavings: proj,
        totalContrib: totalCont, compoundGrowth: comp, monthlyIncome: mi,
      });
    }

    return {
      yearsToRetirement, projectedSavings, totalContributions, compoundGrowth,
      fvCurrent, fvContributions, retirementGoal, onTrack, shortfall,
      readinessScore, monthlyIncome, annualIncome, requiredMonthly,
      realProjected, realGoal, yearRows, startAgeRows,
      annualSS, requiredFromSavings,
    };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflation, desiredIncome, socialSecurity, includeSS, swr, yearsToRetirement, monthlyRate, totalMonths]);

  const handleReset = () => {
    setCurrentAge(30); setRetirementAge(65); setCurrentSavings(50000);
    setMonthlyContribution(500); setAnnualReturn(7); setInflation(3);
    setDesiredIncome(60000); setSocialSecurity(1800); setIncludeSS(true); setSwr(4);
  };

  const statusColor = result.onTrack ? 'text-emerald-400' : 'text-rose-400';
  const statusIcon = result.onTrack ? '\u2713' : '\u2717';
  const readinessColor = result.readinessScore >= 80 ? 'text-emerald-400' : result.readinessScore >= 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Your Profile
          </h3>

          {/* Current Age */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Current Age</label>
              <span className="font-mono text-sm font-black text-slate-700">{currentAge} yr</span>
            </div>
            <input type="range" min={18} max={70} step={1} value={currentAge} onChange={(e) => setCurrentAge(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* Retirement Age */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Retirement Age</label>
              <span className="font-mono text-sm font-black text-slate-700">{retirementAge} yr</span>
            </div>
            <input type="range" min={50} max={80} step={1} value={retirementAge} onChange={(e) => setRetirementAge(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            {retirementAge <= currentAge && (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
                Retirement age must be after current age
              </div>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Savings & Contributions
          </h3>

          {/* Current Savings */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Current Retirement Savings</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min={0} max={2000000} step={1000} value={currentSavings} onChange={(e) => setCurrentSavings(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5 flex-wrap gap-y-1.5">
              {quickSavings.map((amt) => (
                <button key={amt} type="button" onClick={() => setCurrentSavings(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${currentSavings === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt === 0 ? '$0' : fmt(amt)}
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
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={10000} step={50} value={monthlyContribution} onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {quickContrib.map((amt) => (
                <button key={amt} type="button" onClick={() => setMonthlyContribution(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${monthlyContribution === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt === 0 ? '$0' : fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Return & Inflation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Return</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.5" min="0" max="20" value={annualReturn}
                    onChange={(e) => setAnnualReturn(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={20} step={0.5} value={annualReturn} onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Inflation Rate</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.5" min="0" max="10" value={inflation}
                    onChange={(e) => setInflation(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={10} step={0.5} value={inflation} onChange={(e) => setInflation(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Retirement & Income
          </h3>

          {/* Desired Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Desired Annual Retirement Income</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={desiredIncome} onChange={(e) => setDesiredIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={500000} step={5000} value={desiredIncome} onChange={(e) => setDesiredIncome(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5 flex-wrap gap-y-1.5">
              {quickIncome.map((amt) => (
                <button key={amt} type="button" onClick={() => setDesiredIncome(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${desiredIncome === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Social Security */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl">
              <div>
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Social Security</label>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Estimated monthly benefit</div>
              </div>
              <button type="button" onClick={() => setIncludeSS(!includeSS)}
                className={`relative w-12 h-6 rounded-full transition-colors ${includeSS ? 'bg-slate-900' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${includeSS ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {includeSS && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly SS Benefit</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">$</span>
                    <input type="number" value={socialSecurity} onChange={(e) => setSocialSecurity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={5000} step={50} value={socialSecurity} onChange={(e) => setSocialSecurity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            )}
          </div>

          {/* Safe Withdrawal Rate */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Safe Withdrawal Rate (SWR)</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {SWR_OPTIONS.map((rate) => (
                <button key={rate} type="button" onClick={() => setSwr(rate)}
                  className={`py-2 rounded-lg text-sm font-extrabold transition-all ${swr === rate ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">4</span>
            Retirement Outlook
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">401k</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Projected Savings at Retirement</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmt(result.projectedSavings)}
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 text-sm font-extrabold font-sans ${statusColor}`}>
                  <span>{statusIcon}</span>
                  {result.onTrack
                    ? `On Track for $${desiredIncome.toLocaleString()}/yr`
                    : `Shortfall of ${fmt(result.shortfall)}`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Readiness Score</span>
                  <span className={`font-mono font-black text-base ${readinessColor}`}>
                    {result.readinessScore.toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Income (SWR)</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.monthlyIncome)}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annual Income (SWR)</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.annualIncome)}/yr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Retirement Goal</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.retirementGoal)}</span>
                </div>
              </div>
              {inflation > 0 && (
                <div className="text-xs text-slate-500 font-mono text-center border-t border-slate-800/60 pt-3">
                  Real value: {fmt(result.realProjected)} &middot; Goal: {fmt(result.realGoal)}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Panel */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Savings Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Current Savings Growth</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.fvCurrent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Contributions Growth</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.fvContributions)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Projected</span>
                <span className="font-black font-mono text-lg text-slate-900">{fmt(result.projectedSavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Total Contributions</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.totalContributions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Compound Growth</span>
                <span className="font-black font-mono text-emerald-600">{fmt(result.compoundGrowth)}</span>
              </div>
            </div>
          </div>

          {/* Required Monthly */}
          {!result.onTrack && result.requiredMonthly > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl space-y-3">
              <span className="text-xs text-indigo-500 font-extrabold uppercase tracking-wider block">Goal Planning</span>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Retirement Goal</span>
                  <span className="font-black font-mono text-slate-900">{fmt(result.retirementGoal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Current Projection</span>
                  <span className="font-black font-mono text-slate-900">{fmt(result.projectedSavings)}</span>
                </div>
                <div className="border-t border-indigo-200 pt-2 flex justify-between items-center">
                  <span className="text-indigo-700 font-black">Required Monthly Contribution</span>
                  <span className="font-black font-mono text-lg text-indigo-600">{fmtDet(result.requiredMonthly)}</span>
                </div>
                <p className="text-[10px] text-slate-400">Increase monthly contribution to ${Math.ceil(result.requiredMonthly).toLocaleString()} to reach your goal.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-width: Year-by-Year Growth */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Age-by-Age Growth
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Age {currentAge} &rarr; {retirementAge}</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-80">
          <table className="w-full min-w-[650px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Start Balance</th>
                <th className="px-4 py-3">Contributions</th>
                <th className="px-4 py-3">Growth</th>
                <th className="px-4 py-3">End Balance</th>
                <th className="px-4 py-3">Cum. Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {result.yearRows.map((row) => (
                <tr key={row.age} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">Age {row.age}</td>
                  <td className="px-4 py-2.5">{fmt(row.startBalance)}</td>
                  <td className="px-4 py-2.5 text-indigo-600">{fmt(row.contribution)}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{fmt(row.growth)}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.endBalance)}</td>
                  <td className="px-4 py-2.5 text-emerald-500">{fmt(row.cumGrowth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Starting Age Impact */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-clock mr-2 text-slate-400 text-sm"></i>
            The Cost of Waiting — Starting Age Impact
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">${monthlyContribution.toLocaleString()}/mo contributed</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[700px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Start Age</th>
                <th className="px-4 py-3">Years Saving</th>
                <th className="px-4 py-3">Total Contributions</th>
                <th className="px-4 py-3">Compound Growth</th>
                <th className="px-4 py-3">Projected at {retirementAge}</th>
                <th className="px-4 py-3">Monthly Income ({swr}% SWR)</th>
                <th className="px-4 py-3">vs Starting at 25</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {result.startAgeRows.map((row) => {
                const vs25 = result.startAgeRows[0]?.projectedSavings || 0;
                const diff = row.projectedSavings - vs25;
                const isOptimal = row.startAge >= currentAge && (row.startAge === currentAge || row.startAge === Math.max(...START_AGES.filter(a => a >= currentAge)));
                return (
                  <tr key={row.startAge} className={`hover:bg-slate-50/60 transition-colors ${row.startAge < currentAge ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      Age {row.startAge}
                      {row.startAge < currentAge && <span className="text-[9px] text-slate-400 ml-1">(past)</span>}
                    </td>
                    <td className="px-4 py-2.5">{row.yearsToRetire} yr</td>
                    <td className="px-4 py-2.5">{fmt(row.totalContrib)}</td>
                    <td className="px-4 py-2.5 text-emerald-600">{fmt(row.compoundGrowth)}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.projectedSavings)}</td>
                    <td className="px-4 py-2.5 text-cyan-600">{fmt(row.monthlyIncome)}/mo</td>
                    <td className={`px-4 py-2.5 ${diff < 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                      {diff < 0 ? `-${fmt(Math.abs(diff))}` : '\u2014'}
                    </td>
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
