'use client';

import React, { useState, useMemo, useRef } from 'react';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCurrencyDetailed = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

interface MonthlyPeriod {
  index: number; dateStr: string; payment: number;
  principalPaid: number; interestPaid: number; totalPaid: number; remainingBalance: number;
}

interface AnnualSummary {
  yearNum: number; calendarYear: number; payment: number; principalPaid: number;
  interestPaid: number; totalPaid: number; endBalance: number; monthlyPeriods: MonthlyPeriod[];
}

interface ScenarioOption {
  id: number; label: string; rate: number; term: number;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(30000);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [loanTermYears, setLoanTermYears] = useState<number>(3);
  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'dollar'>('dollar');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0);
  const [downPaymentDollar, setDownPaymentDollar] = useState<number>(0);
  const [monthlyFees, setMonthlyFees] = useState<number>(0);

  const [monthlyIncome, setMonthlyIncome] = useState<number>(5000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(0);
  const [showAffordability, setShowAffordability] = useState<boolean>(false);

  const [scenarios, setScenarios] = useState<ScenarioOption[]>([]);
  const [scenarioIdCounter, setScenarioIdCounter] = useState<number>(1);

  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const actualLoanAmount = Math.max(0, loanAmount - downPaymentDollar);
  const termMonths = loanTermYears * 12;

  const monthlyRate = interestRate / 100 / 12;
  let monthlyPI = 0;
  if (actualLoanAmount > 0 && termMonths > 0) {
    if (monthlyRate === 0) monthlyPI = actualLoanAmount / termMonths;
    else monthlyPI = actualLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  const totalMonthlyPayment = monthlyPI + monthlyFees;
  const totalInterest = Math.max(0, (monthlyPI * termMonths) - actualLoanAmount);
  const totalFees = monthlyFees * termMonths;
  const totalCost = (monthlyPI * termMonths) + totalFees + downPaymentDollar;
  const loanToValue = loanAmount > 0 ? (actualLoanAmount / loanAmount) * 100 : 0;
  const apr = interestRate;

  const maxHousingPayment = monthlyIncome * 0.28;
  const maxTotalDebtPayment = monthlyIncome * 0.36;
  const availableForHousing = Math.max(0, Math.min(maxHousingPayment, maxTotalDebtPayment - monthlyDebts));
  const isAffordable = totalMonthlyPayment <= availableForHousing;
  const dtiRatio = monthlyIncome > 0 ? ((monthlyDebts + totalMonthlyPayment) / monthlyIncome) * 100 : 0;

  // --- Handle down payment sync ---
  const handleDownPaymentPercentChange = (val: number) => {
    setDownPaymentPercent(val);
    setDownPaymentDollar(Math.round((loanAmount * val) / 100));
  };
  const handleDownPaymentDollarChange = (val: number) => {
    setDownPaymentDollar(val);
    setDownPaymentPercent(loanAmount > 0 ? parseFloat(((val / loanAmount) * 100).toFixed(2)) : 0);
  };
  const handleDownPaymentTypeChange = (tab: 'percent' | 'dollar') => {
    setDownPaymentType(tab);
    if (tab === 'percent') setDownPaymentPercent(loanAmount > 0 ? parseFloat(((downPaymentDollar / loanAmount) * 100).toFixed(2)) : 0);
    else setDownPaymentDollar(Math.round((loanAmount * downPaymentPercent) / 100));
  };

  const toggleYearExpand = (yearNum: number) =>
    setExpandedYears((prev) => ({ ...prev, [yearNum]: !prev[yearNum] }));

  // --- Amortization ---
  const amortizationData = useMemo(() => {
    const monthlyPeriods: MonthlyPeriod[] = [];
    const annualSummaries: AnnualSummary[] = [];
    let currentBalance = actualLoanAmount;
    let monthIdx = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let calMonth = 5; let calYear = 2026;

    while (currentBalance > 0.01 && monthIdx < 600 && monthIdx < termMonths) {
      monthIdx++;
      const interestForMonth = currentBalance * monthlyRate;
      let principalForMonth = Math.min(monthlyPI - interestForMonth, currentBalance);
      if (principalForMonth < 0) principalForMonth = 0;
      currentBalance = Math.max(0, currentBalance - principalForMonth);

      monthlyPeriods.push({
        index: monthIdx, dateStr: `${months[calMonth]} ${calYear}`,
        payment: monthlyPI, principalPaid: principalForMonth, interestPaid: interestForMonth,
        totalPaid: monthlyPI, remainingBalance: currentBalance,
      });

      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
    }

    monthlyPeriods.forEach((p) => {
      const yr = parseInt(p.dateStr.split(' ')[1]);
      let s = annualSummaries.find((x) => x.calendarYear === yr);
      if (!s) {
        s = { yearNum: annualSummaries.length + 1, calendarYear: yr, payment: 0, principalPaid: 0, interestPaid: 0, totalPaid: 0, endBalance: p.remainingBalance, monthlyPeriods: [] };
        annualSummaries.push(s);
      }
      s.payment += p.payment; s.principalPaid += p.principalPaid; s.interestPaid += p.interestPaid;
      s.totalPaid += p.totalPaid; s.endBalance = p.remainingBalance; s.monthlyPeriods.push(p);
    });

    return { monthlyPeriods, annualSummaries };
  }, [actualLoanAmount, monthlyRate, monthlyPI, termMonths]);

  // --- Baseline (no down payment, no fees) ---
  const baseline = useMemo(() => {
    const mRate = interestRate / 100 / 12;
    const mTerm = loanTermYears * 12;
    let mPI = 0;
    if (loanAmount > 0 && mTerm > 0) {
      if (mRate === 0) mPI = loanAmount / mTerm;
      else mPI = loanAmount * (mRate * Math.pow(1 + mRate, mTerm)) / (Math.pow(1 + mRate, mTerm) - 1);
    }
    const tInt = Math.max(0, (mPI * mTerm) - loanAmount);
    return { monthlyPI: mPI, totalInterest: tInt, totalCost: mPI * mTerm, monthlyPayment: mPI };
  }, [loanAmount, interestRate, loanTermYears]);

  // --- Comparison Scenarios ---
  const comparisonResults = useMemo(() => {
    return scenarios.map((sc) => {
      const mRate = sc.rate / 100 / 12;
      const mTerm = sc.term * 12;
      let mPI = 0;
      if (actualLoanAmount > 0 && mTerm > 0) {
        if (mRate === 0) mPI = actualLoanAmount / mTerm;
        else mPI = actualLoanAmount * (mRate * Math.pow(1 + mRate, mTerm)) / (Math.pow(1 + mRate, mTerm) - 1);
      }
      const tInt = Math.max(0, (mPI * mTerm) - actualLoanAmount);
      const tFees = monthlyFees * mTerm;
      const tCost = (mPI * mTerm) + tFees + downPaymentDollar;
      return { ...sc, monthlyPI: mPI, totalMonthly: mPI + monthlyFees, totalInterest: tInt, totalFees: tFees, totalCost: tCost };
    });
  }, [scenarios, actualLoanAmount, monthlyFees, downPaymentDollar]);

  const addScenario = () => {
    setScenarios((prev) => [...prev, { id: scenarioIdCounter, label: `Scenario ${scenarioIdCounter}`, rate: interestRate, term: loanTermYears }]);
    setScenarioIdCounter((c) => c + 1);
  };

  const updateScenario = (id: number, field: 'rate' | 'term', value: number) => {
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeScenario = (id: number) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const updateScenarioLabel = (id: number, label: string) => {
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, label } : s));
  };

  // --- Doughnut ---
  const doughnutSegments = useMemo(() => {
    const items = [
      { label: 'Principal & Interest', value: monthlyPI * termMonths, color: '#4f46e5' },
      { label: 'Monthly Fees', value: totalFees, color: '#f97316' },
      { label: 'Down Payment', value: downPaymentDollar, color: '#06b6d4' },
    ].filter((item) => item.value > 0);
    const sum = items.reduce((a, i) => a + i.value, 0);
    let acc = 0;
    return items.map((item) => {
      const pct = sum > 0 ? item.value / sum : 0;
      const start = acc; acc += pct * 360;
      return { ...item, pct, startAngle: start, endAngle: acc };
    });
  }, [monthlyPI, termMonths, totalFees, downPaymentDollar]);

  const [hoveredDoughnutIdx, setHoveredDoughnutIdx] = useState<number | null>(null);

  // --- CSV ---
  const exportCSV = () => {
    const rows = [['Month', 'Date', 'Payment', 'Principal', 'Interest', 'Balance']];
    amortizationData.monthlyPeriods.forEach((p) => {
      rows.push([String(p.index), p.dateStr, p.payment.toFixed(2), p.principalPaid.toFixed(2), p.interestPaid.toFixed(2), p.remainingBalance.toFixed(2)]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `loan-schedule-${loanAmount}-${interestRate}%.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLoanAmount(30000); setInterestRate(7.0); setLoanTermYears(3);
    setDownPaymentType('dollar'); setDownPaymentPercent(0); setDownPaymentDollar(0); setMonthlyFees(0);
    setMonthlyIncome(5000); setMonthlyDebts(0); setShowAffordability(false);
    setScenarios([]); setScenarioIdCounter(1); setExpandedYears({});
  };

  const quickAmounts = [5000, 10000, 25000, 50000];

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Section 1: Inputs + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">1</span>
            Loan Details
          </h3>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Loan Amount</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min="100" max="500000" step="100" value={loanAmount} onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {quickAmounts.map((amt) => (
                <button key={amt} type="button" onClick={() => setLoanAmount(amt)}
                  className={`px-2.5 py-0.5 text-[9px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${loanAmount === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Interest Rate (APR)</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.01" min="0.1" max="36" value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="0.5" max="36" step="0.25" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Loan Term <span className="text-slate-400 font-mono">({termMonths} mo)</span></label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {[1, 2, 3, 5, 7, 10, 15, 20, 30].map((y) => (
                  <button key={y} type="button" onClick={() => setLoanTermYears(y)}
                    className={`py-1 rounded-lg text-[10px] font-extrabold transition-all ${loanTermYears === y ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Down Payment */}
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Down Payment</span>
              <div className="flex space-x-0.75 bg-slate-150 p-0.75 rounded-full border border-slate-200/30 text-[10px]">
                <button type="button" onClick={() => handleDownPaymentTypeChange('percent')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${downPaymentType === 'percent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Percent (%)</button>
                <button type="button" onClick={() => handleDownPaymentTypeChange('dollar')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${downPaymentType === 'dollar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Amount ($)</button>
              </div>
            </div>
            <div className="flex justify-between items-center gap-3">
              {downPaymentType === 'percent' ? (
                <>
                  <input type="range" min="0" max="100" step="1" value={downPaymentPercent}
                    onChange={(e) => handleDownPaymentPercentChange(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <div className="flex items-center space-x-1 shrink-0">
                    <input type="number" min="0" max="100" value={downPaymentPercent}
                      onChange={(e) => handleDownPaymentPercentChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-14 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-black" />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </>
              ) : (
                <>
                  <input type="range" min="0" max={loanAmount} step="100" value={downPaymentDollar}
                    onChange={(e) => handleDownPaymentDollarChange(Math.max(0, Math.min(loanAmount, parseInt(e.target.value) || 0)))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-xs font-bold text-slate-400">$</span>
                    <input type="number" min="0" max={loanAmount} value={downPaymentDollar}
                      onChange={(e) => handleDownPaymentDollarChange(Math.max(0, Math.min(loanAmount, parseInt(e.target.value) || 0)))}
                      className="w-20 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-black" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>Down Payment: <span className="text-slate-700 font-black">{formatCurrency(downPaymentDollar)}</span></span>
              <span>Loan Amount: <span className="text-slate-700 font-black">{formatCurrency(actualLoanAmount)}</span></span>
              <span>LTV: <span className="text-slate-700 font-black">{loanToValue.toFixed(1)}%</span></span>
            </div>
          </div>

          {/* Monthly Fees */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Monthly Fees</label>
              <span className="font-mono text-xs font-black text-slate-700">${monthlyFees}/mo</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="range" min="0" max="500" step="5" value={monthlyFees}
                onChange={(e) => setMonthlyFees(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <input type="number" value={monthlyFees} onChange={(e) => setMonthlyFees(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-right" />
            </div>
          </div>

          {/* Affordability */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl overflow-hidden">
            <button type="button" onClick={() => setShowAffordability(!showAffordability)}
              className="w-full flex items-center justify-between p-4 text-xs font-extrabold uppercase tracking-wider text-indigo-700 hover:bg-indigo-50/80 transition-all">
              <span className="flex items-center"><i className="fas fa-calculator mr-2 text-indigo-500"></i>Income &amp; Affordability (28/36 Rule)</span>
              <i className={`fas fa-chevron-${showAffordability ? 'up' : 'down'} text-indigo-400 text-[10px] transition-all`}></i>
            </button>
            {showAffordability && (
              <div className="px-4 pb-4 space-y-3 text-xs animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-600">Monthly Gross Income</span>
                    <input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-250 px-2 py-1.5 rounded-lg font-mono text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-600">Monthly Debts (existing)</span>
                    <input type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-250 px-2 py-1.5 rounded-lg font-mono text-xs font-bold" />
                  </div>
                </div>
                <div className="bg-white border border-indigo-100 rounded-2xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Max Housing (28%):</span>
                    <span className="font-black font-mono text-indigo-700">{formatCurrency(maxHousingPayment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Max Total Debt (36%):</span>
                    <span className="font-black font-mono text-indigo-700">{formatCurrency(maxTotalDebtPayment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Available for Loan:</span>
                    <span className="font-black font-mono text-indigo-700">{formatCurrency(availableForHousing)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded-xl ${isAffordable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    <span className="font-bold">{isAffordable ? 'Loan is Affordable' : 'Loan exceeds recommended limits'}</span>
                    <span className="font-black font-mono">{dtiRatio.toFixed(1)}% DTI</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-7 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset Parameters</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">2</span>
            Loan Summary
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">LOAN</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-2 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Est. Monthly Payment</span>
                <div className="text-4xl font-black text-white mt-1 font-mono">
                  {formatCurrency(totalMonthlyPayment)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-sm text-rose-400">{formatCurrency(totalInterest)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Cost</span>
                  <span className="font-mono font-black text-sm text-slate-100">{formatCurrency(totalCost)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">APR</span>
                  <span className="font-black text-sm text-slate-100">{apr.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">LTV Ratio</span>
                  <span className="font-black text-sm text-slate-100">{loanToValue.toFixed(1)}%</span>
                </div>
              </div>
              {monthlyFees > 0 && (
                <div className="border-t border-slate-800/60 pt-3 text-[11px] flex justify-between">
                  <span className="text-slate-400">Total Fees Over Term</span>
                  <span className="font-black font-mono text-orange-400">{formatCurrency(totalFees)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Doughnut */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Cost Breakdown</span>
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                {doughnutSegments.map((seg, idx) => {
                  const circ = 2 * Math.PI * 40;
                  const dash = seg.pct * circ;
                  const offset = circ - (seg.startAngle / 360) * circ;
                  return (
                    <circle key={idx} cx="50" cy="50" r="40" fill="transparent" stroke={seg.color}
                      strokeWidth={hoveredDoughnutIdx === idx ? 15 : 12}
                      strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredDoughnutIdx(idx)} onMouseLeave={() => setHoveredDoughnutIdx(null)} />
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Cost</span>
                <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(totalCost)}</span>
              </div>
            </div>
            <div className="w-full space-y-1.5 text-xs">
              {doughnutSegments.map((seg, idx) => (
                <div key={idx} onMouseEnter={() => setHoveredDoughnutIdx(idx)} onMouseLeave={() => setHoveredDoughnutIdx(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${hoveredDoughnutIdx === idx ? 'bg-white border-slate-200 font-black shadow-sm' : 'border-transparent text-slate-650'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span>{seg.label}</span>
                  </div>
                  <span className="font-mono">{formatCurrency(seg.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Baseline comparison */}
          {downPaymentDollar > 0 || monthlyFees > 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">What If: No Down Payment / No Fees?</span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="block text-slate-400">Monthly Payment</span>
                  <span className="font-black font-mono text-slate-800">{formatCurrency(baseline.monthlyPayment)}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Total Interest</span>
                  <span className="font-black font-mono text-slate-800">{formatCurrency(baseline.totalInterest)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Section 2: Amortization Schedule */}
      <div className="space-y-4 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display">Amortization Schedule</h3>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={exportCSV}
              className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-1.5 shadow-sm">
              <i className="fas fa-download"></i><span>CSV</span>
            </button>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/40 text-xs font-bold">
              <button type="button" onClick={() => setScheduleView('annual')}
                className={`px-4 py-1.5 rounded-full transition-all ${scheduleView === 'annual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Annual</button>
              <button type="button" onClick={() => setScheduleView('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all ${scheduleView === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Monthly</button>
            </div>
          </div>
        </div>

        {scheduleView === 'annual' ? (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-[420px]">
            <table className="w-full min-w-[700px] text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                  <th className="px-4 py-3">Year</th><th className="px-4 py-3">Cal Year</th><th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Principal Paid</th><th className="px-4 py-3">Interest Paid</th><th className="px-4 py-3">Ending Balance</th><th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {amortizationData.annualSummaries.map((summary) => {
                  const isExpanded = !!expandedYears[summary.yearNum];
                  return (
                    <React.Fragment key={summary.calendarYear}>
                      <tr onClick={() => toggleYearExpand(summary.yearNum)} className="hover:bg-slate-50/60 transition-colors cursor-pointer font-bold">
                        <td className="px-4 py-3 text-slate-900">Year {summary.yearNum}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{summary.calendarYear}</td>
                        <td className="px-4 py-3 font-black text-slate-950">{formatCurrency(summary.totalPaid)}</td>
                        <td className="px-4 py-3 text-blue-700">{formatCurrency(summary.principalPaid)}</td>
                        <td className="px-4 py-3 text-rose-600">{formatCurrency(summary.interestPaid)}</td>
                        <td className="px-4 py-3 font-black text-slate-900">{formatCurrency(summary.endBalance)}</td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500">
                            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[8px]`}></i>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr><td colSpan={7} className="p-0 bg-slate-50">
                          <div className="overflow-x-auto border-y border-slate-200/50">
                            <table className="w-full min-w-[600px] text-[10px] text-slate-600 font-mono">
                              <thead>
                                <tr className="bg-slate-100/60 border-b border-slate-150 text-slate-400 font-bold uppercase text-[8px]">
                                  <th className="pl-8 pr-4 py-2">Date</th><th className="px-4 py-2">Payment</th><th className="px-4 py-2">Principal</th>
                                  <th className="px-4 py-2">Interest</th><th className="px-4 py-2">Balance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100/50">
                                {summary.monthlyPeriods.map((p) => (
                                  <tr key={p.index} className="hover:bg-slate-100/30">
                                    <td className="pl-8 pr-4 py-2 text-slate-900 font-bold">{p.dateStr}</td>
                                    <td className="px-4 py-2">{formatCurrencyDetailed(p.payment)}</td>
                                    <td className="px-4 py-2 text-blue-600">{formatCurrencyDetailed(p.principalPaid)}</td>
                                    <td className="px-4 py-2 text-rose-500">{formatCurrencyDetailed(p.interestPaid)}</td>
                                    <td className="px-4 py-2 font-bold">{formatCurrencyDetailed(p.remainingBalance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-[420px]">
            <table className="w-full min-w-[700px] text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                  <th className="px-4 py-3">No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Principal</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {amortizationData.monthlyPeriods.map((p) => (
                  <tr key={p.index} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 text-slate-400 font-bold">#{p.index}</td>
                    <td className="px-4 py-2.5 text-slate-900 font-bold">{p.dateStr}</td>
                    <td className="px-4 py-2.5">{formatCurrencyDetailed(p.payment)}</td>
                    <td className="px-4 py-2.5 text-blue-600">{formatCurrencyDetailed(p.principalPaid)}</td>
                    <td className="px-4 py-2.5 text-rose-500">{formatCurrencyDetailed(p.interestPaid)}</td>
                    <td className="px-4 py-2.5 font-black text-slate-900">{formatCurrencyDetailed(p.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Compare Scenarios */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-balance-scale mr-2 text-slate-400 text-sm"></i>
            Compare Loan Options
          </h3>
          <button type="button" onClick={addScenario} disabled={scenarios.length >= 3}
            className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-extrabold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
            <i className="fas fa-plus mr-1"></i>Add Scenario
          </button>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-4 text-center">Add scenarios above to compare different rate and term combinations side-by-side.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3 text-left">Scenario</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Monthly P&amp;I</th>
                  <th className="px-4 py-3">Monthly Total</th>
                  <th className="px-4 py-3">Total Interest</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {/* Current loan as baseline */}
                <tr className="bg-slate-100/30 font-bold">
                  <td className="px-4 py-2.5 text-slate-900">Current Loan</td>
                  <td className="px-4 py-2.5 text-center">{interestRate}%</td>
                  <td className="px-4 py-2.5 text-center">{loanTermYears}yr</td>
                  <td className="px-4 py-2.5 text-center">{formatCurrencyDetailed(monthlyPI)}</td>
                  <td className="px-4 py-2.5 text-center font-black text-slate-950">{formatCurrencyDetailed(totalMonthlyPayment)}</td>
                  <td className="px-4 py-2.5 text-center text-rose-600">{formatCurrencyDetailed(totalInterest)}</td>
                  <td className="px-4 py-2.5 text-center">{formatCurrencyDetailed(totalCost)}</td>
                  <td className="px-4 py-2.5"></td>
                </tr>
                {comparisonResults.map((sc) => {
                  const isBest = comparisonResults.length > 0 && sc.totalCost === Math.min(...comparisonResults.map((x) => x.totalCost));
                  return (
                    <tr key={sc.id} className={`hover:bg-slate-50/60 transition-colors ${isBest ? 'bg-emerald-50/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center space-x-1">
                          <input type="text" value={sc.label} onChange={(e) => updateScenarioLabel(sc.id, e.target.value)}
                            className="bg-transparent font-bold text-slate-800 w-24 text-xs focus:outline-none focus:bg-white focus:border border-slate-200 rounded px-1" />
                          {isBest && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">Best</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" step="0.25" value={sc.rate} onChange={(e) => updateScenario(sc.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-14 text-center bg-transparent font-mono text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-slate-200 rounded" />%
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="1" max="30" value={sc.term} onChange={(e) => updateScenario(sc.id, 'term', parseInt(e.target.value) || 1)}
                          className="w-10 text-center bg-transparent font-mono text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-slate-200 rounded" />yr
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono">{formatCurrencyDetailed(sc.monthlyPI)}</td>
                      <td className={`px-4 py-2.5 text-center font-black font-mono ${sc.totalMonthly === Math.min(...comparisonResults.map((x) => x.totalMonthly), sc.totalMonthly) && comparisonResults.length > 1 ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {formatCurrencyDetailed(sc.totalMonthly)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-rose-500">{formatCurrencyDetailed(sc.totalInterest)}</td>
                      <td className={`px-4 py-2.5 text-center font-black font-mono ${isBest ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {formatCurrencyDetailed(sc.totalCost)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button type="button" onClick={() => removeScenario(sc.id)}
                          className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all">
                          <i className="fas fa-times text-[8px]"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
