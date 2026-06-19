'use client';

import React, { useState, useMemo, useRef } from 'react';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCurrencyDetailed = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

interface AmortizationPeriod {
  index: number;
  dateStr: string;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  totalMonthlyPaid: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  remainingBalance: number;
}

interface AnnualSummary {
  yearNum: number;
  calendarYear: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  extraPaid: number;
  totalPaid: number;
  endBalance: number;
  monthlyPeriods: AmortizationPeriod[];
}

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [startMonth, setStartMonth] = useState<number>(5);
  const [startYear, setStartYear] = useState<number>(2026);

  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [extraAnnual, setExtraAnnual] = useState<number>(0);
  const [extraAnnualMonth, setExtraAnnualMonth] = useState<number>(11);
  const [extraOneTime, setExtraOneTime] = useState<number>(0);
  const [extraOneTimeMonth, setExtraOneTimeMonth] = useState<number>(5);
  const [extraOneTimeYear, setExtraOneTimeYear] = useState<number>(2027);

  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [timelineHoverIndex, setTimelineHoverIndex] = useState<number | null>(null);
  const [timelineHoverX, setTimelineHoverX] = useState<number>(0);

  const timelineSvgRef = useRef<SVGSVGElement>(null);

  const toggleYearExpand = (yearNum: number) =>
    setExpandedYears((prev) => ({ ...prev, [yearNum]: !prev[yearNum] }));

  // --- Amortization Calculation ---
  const amortizationData = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let standardPI = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        standardPI = loanAmount / totalMonths;
      } else {
        standardPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
    }

    const monthlyPeriods: AmortizationPeriod[] = [];
    const annualSummaries: AnnualSummary[] = [];
    let currentBalance = loanAmount;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthIdx = 0;
    let currentCalMonth = startMonth;
    let currentCalYear = startYear;

    while (currentBalance > 0.01 && monthIdx < 600) {
      monthIdx++;
      const interestForMonth = currentBalance * monthlyRate;
      let principalForMonth = Math.min(standardPI - interestForMonth, currentBalance);
      if (principalForMonth < 0) principalForMonth = 0;

      let extraApplied = 0;
      extraApplied += extraMonthly;
      if (currentCalMonth === extraAnnualMonth) extraApplied += extraAnnual;
      if (currentCalMonth === extraOneTimeMonth && currentCalYear === extraOneTimeYear) extraApplied += extraOneTime;

      const maxPossibleExtra = Math.max(0, currentBalance - principalForMonth);
      if (extraApplied > maxPossibleExtra) extraApplied = maxPossibleExtra;

      const totalPrincipalPaid = principalForMonth + extraApplied;
      currentBalance = Math.max(0, currentBalance - totalPrincipalPaid);
      cumulativeInterest += interestForMonth;
      cumulativePrincipal += totalPrincipalPaid;

      monthlyPeriods.push({
        index: monthIdx,
        dateStr: `${months[currentCalMonth]} ${currentCalYear}`,
        payment: standardPI,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        extraPaid: extraApplied,
        totalMonthlyPaid: standardPI + extraApplied,
        cumulativeInterest,
        cumulativePrincipal,
        remainingBalance: currentBalance,
      });

      currentCalMonth++;
      if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
    }

    monthlyPeriods.forEach((period) => {
      const parts = period.dateStr.split(' ');
      const calYear = parseInt(parts[1]);
      let summary = annualSummaries.find((s) => s.calendarYear === calYear);
      if (!summary) {
        summary = {
          yearNum: annualSummaries.length + 1,
          calendarYear: calYear,
          payment: 0, principalPaid: 0, interestPaid: 0, extraPaid: 0, totalPaid: 0,
          endBalance: period.remainingBalance,
          monthlyPeriods: [],
        };
        annualSummaries.push(summary);
      }
      summary.payment += period.payment;
      summary.principalPaid += period.principalPaid;
      summary.interestPaid += period.interestPaid;
      summary.extraPaid += period.extraPaid;
      summary.totalPaid += period.totalMonthlyPaid;
      summary.endBalance = period.remainingBalance;
      summary.monthlyPeriods.push(period);
    });

    return { monthlyPeriods, annualSummaries, standardPI };
  }, [loanAmount, interestRate, loanTermYears, startMonth, startYear, extraMonthly, extraAnnual, extraAnnualMonth, extraOneTime, extraOneTimeMonth, extraOneTimeYear]);

  // --- Baseline (no extra payments) ---
  const baseline = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    let standardPI = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) standardPI = loanAmount / totalMonths;
      else standardPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    let balance = loanAmount;
    let interest = 0;
    let m = 0;
    while (balance > 0.01 && m < 600) {
      m++;
      const i = balance * monthlyRate;
      const p = Math.min(standardPI - i, balance);
      if (p < 0) break;
      balance = Math.max(0, balance - p);
      interest += i;
    }
    return { totalInterest: interest, totalMonths: m };
  }, [loanAmount, interestRate, loanTermYears]);

  const totalMonthsPaid = amortizationData.monthlyPeriods.length;
  const totalInterestPaid = amortizationData.monthlyPeriods.reduce((acc, p) => acc + p.interestPaid, 0);
  const finalPayoffDate = amortizationData.monthlyPeriods.length > 0
    ? amortizationData.monthlyPeriods[amortizationData.monthlyPeriods.length - 1].dateStr
    : 'N/A';

  const totalInterestSaved = Math.max(0, baseline.totalInterest - totalInterestPaid);
  const monthsSaved = Math.max(0, baseline.totalMonths - totalMonthsPaid);
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;
  const monthlyPI = amortizationData.standardPI;

  // --- Crossover Point ---
  const crossover = useMemo(() => {
    const period = amortizationData.monthlyPeriods.find((p) => p.principalPaid > p.interestPaid);
    const totalCrossover = amortizationData.monthlyPeriods.find((p) => p.cumulativePrincipal > p.cumulativeInterest);
    return {
      paymentCrossover: period || null,
      totalCrossover: totalCrossover || null,
    };
  }, [amortizationData.monthlyPeriods]);

  // --- Timeline SVG Metrics ---
  const timelineSvgMetrics = useMemo(() => {
    const width = 800, height = 240;
    const padding = { top: 15, right: 20, bottom: 30, left: 60 };
    const data = amortizationData.annualSummaries;
    if (data.length === 0) return null;

    const maxVal = Math.max(loanAmount,
      ...amortizationData.monthlyPeriods.map((p) => p.cumulativeInterest),
      ...amortizationData.monthlyPeriods.map((p) => p.cumulativePrincipal)
    );

    const xScale = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * (width - padding.left - padding.right);
    const yScale = (val: number) => {
      const scaleHeight = height - padding.top - padding.bottom;
      return padding.top + scaleHeight - (val / maxVal) * scaleHeight;
    };

    let balanceAreaPath = `M ${xScale(0)} ${yScale(loanAmount)} `;
    let balanceLinePath = `M ${xScale(0)} ${yScale(loanAmount)} `;
    let interestLinePath = `M ${xScale(0)} ${yScale(0)} `;
    let principalLinePath = `M ${xScale(0)} ${yScale(0)} `;

    data.forEach((d, idx) => {
      const x = xScale(idx);
      const yBal = yScale(d.endBalance);
      const lastMonth = d.monthlyPeriods[d.monthlyPeriods.length - 1];
      balanceAreaPath += `L ${x} ${yBal} `;
      balanceLinePath += `L ${x} ${yBal} `;
      interestLinePath += `L ${x} ${yScale(lastMonth.cumulativeInterest)} `;
      principalLinePath += `L ${x} ${yScale(lastMonth.cumulativePrincipal)} `;
    });

    const lastX = xScale(data.length - 1);
    balanceAreaPath += `L ${lastX} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return { width, height, padding, xScale, yScale, balanceAreaPath, balanceLinePath, interestLinePath, principalLinePath, maxVal };
  }, [amortizationData, loanAmount]);

  const handleTimelineMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!timelineSvgRef.current || !timelineSvgMetrics) return;
    const rect = timelineSvgRef.current.getBoundingClientRect();
    const xMouse = e.clientX - rect.left;
    const { padding, width } = timelineSvgMetrics;
    const chartWidth = width - padding.left - padding.right;
    const relativeX = Math.max(0, Math.min(xMouse - padding.left, chartWidth));
    const count = amortizationData.annualSummaries.length;
    const rawIdx = (relativeX / chartWidth) * (count - 1);
    const hoveredIdx = Math.round(rawIdx);
    if (hoveredIdx >= 0 && hoveredIdx < count) {
      setTimelineHoverIndex(hoveredIdx);
      setTimelineHoverX(timelineSvgMetrics.xScale(hoveredIdx));
    }
  };

  const activeHoverPeriod = timelineHoverIndex !== null ? amortizationData.annualSummaries[timelineHoverIndex] : null;

  // --- CSV Export ---
  const exportCSV = () => {
    const rows = [['Month', 'Date', 'Payment', 'Principal', 'Interest', 'Extra Paid', 'Total Paid', 'Cum. Interest', 'Cum. Principal', 'Remaining Balance']];
    amortizationData.monthlyPeriods.forEach((p) => {
      rows.push([
        String(p.index), p.dateStr,
        p.payment.toFixed(2), p.principalPaid.toFixed(2), p.interestPaid.toFixed(2),
        p.extraPaid.toFixed(2), p.totalMonthlyPaid.toFixed(2),
        p.cumulativeInterest.toFixed(2), p.cumulativePrincipal.toFixed(2),
        p.remainingBalance.toFixed(2),
      ]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization-schedule-${loanAmount}-${interestRate}%.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLoanAmount(300000);
    setInterestRate(6.5);
    setLoanTermYears(30);
    setStartMonth(5);
    setStartYear(2026);
    setExtraMonthly(0);
    setExtraAnnual(0);
    setExtraAnnualMonth(11);
    setExtraOneTime(0);
    setExtraOneTimeMonth(5);
    setExtraOneTimeYear(2027);
    setExpandedYears({});
    setTimelineHoverIndex(null);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-display">Amortization Schedule</h3>
          <p className="text-xs text-slate-500 font-medium">Full loan payoff breakdown with principal, interest, and extra payment scenarios.</p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-all active:scale-95 flex items-center space-x-1.5 shadow-sm"
        >
          <i className="fas fa-download"></i>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">1</span>
            Loan Parameters
          </h3>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Loan Amount</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="2000000"
              step="1000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex space-x-1.5">
              {[-50000, -10000, 10000, 50000].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setLoanAmount(Math.max(0, loanAmount + step))}
                  className="px-2 py-0.5 text-[9px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 active:scale-95 transition-all"
                >
                  {step > 0 ? `+${formatCurrency(step)}` : formatCurrency(step)}
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
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="15"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">Loan Term</label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {[30, 20, 15, 10].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setLoanTermYears(years)}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${loanTermYears === years ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {years} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">First Payment Date</label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl font-bold text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                min="2020"
                max="2080"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value) || 2026)}
                className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Extra Payments Panel */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center border-b border-emerald-150 pb-2">
              <i className="fas fa-piggy-bank mr-1.5 text-emerald-700"></i>
              Extra Principal Payments
            </h4>
            <div className="space-y-3.5 text-xs text-left">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-650">Extra Monthly Payment</span>
                  <span className="font-mono text-emerald-800 font-bold">+{formatCurrency(extraMonthly)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-650">Extra Annual Payment (Dec)</span>
                  <span className="font-mono text-emerald-800 font-bold">+{formatCurrency(extraAnnual)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={extraAnnual}
                  onChange={(e) => setExtraAnnual(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-emerald-100">
                <div className="space-y-1">
                  <span className="font-bold text-slate-650 block">One-Time Payment</span>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={extraOneTime || ''}
                    onChange={(e) => setExtraOneTime(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 px-2 py-1 rounded font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-650 block">Applied Year</span>
                  <input
                    type="number"
                    value={extraOneTimeYear}
                    onChange={(e) => setExtraOneTimeYear(parseInt(e.target.value) || startYear + 1)}
                    className="w-full bg-white border border-slate-200 px-2 py-1 rounded font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="px-7 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95"
            >
              Reset Parameters
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">2</span>
            Amortization Summary
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">AMORT</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-2 border-b border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Est. Monthly P&amp;I Payment</span>
                <div className="text-4xl font-black text-white mt-1 font-mono">
                  {formatCurrency(monthlyPI)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-sm text-rose-400">{formatCurrency(totalInterestPaid)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payoff Date</span>
                  <span className="font-black text-sm text-slate-100">{finalPayoffDate}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Payments</span>
                  <span className="font-mono font-black text-sm text-slate-100">{formatCurrency(monthlyPI * totalMonthsPaid)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Months</span>
                  <span className="font-black text-sm text-slate-100">{totalMonthsPaid} mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Crossover Highlight */}
          {crossover.paymentCrossover && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest flex items-center">
                <i className="fas fa-crosshairs mr-1.5"></i>
                Principal vs Interest Crossover
              </span>
              <p className="text-xs text-indigo-900 font-semibold">
                Your monthly principal payment exceeds interest starting{' '}
                <span className="font-black">{crossover.paymentCrossover.dateStr}</span> (month #{crossover.paymentCrossover.index}).
              </p>
              {crossover.totalCrossover && (
                <p className="text-[11px] text-indigo-700 font-medium">
                  Cumulative principal overtakes cumulative interest around{' '}
                  <span className="font-black">{crossover.totalCrossover.dateStr}</span>.
                </p>
              )}
            </div>
          )}

          {/* Savings if extra payments */}
          {monthsSaved > 0 && (
            <div className="p-4 bg-emerald-700 text-white rounded-2xl space-y-1.5 shadow-sm text-center animate-fade-in-up">
              <span className="text-[9px] uppercase tracking-widest font-black opacity-80 block">Extra Payments Savings</span>
              <div className="text-lg font-black">Interest Saved: {formatCurrency(totalInterestSaved)}</div>
              <div className="text-xs font-bold opacity-90">
                Paid off {yearsSaved > 0 ? `${yearsSaved} years` : ''} {remainingMonthsSaved > 0 ? `${remainingMonthsSaved} months` : ''} early!
              </div>
            </div>
          )}

          {/* Baseline Comparison */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Comparison (Without Extra Payments)</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="block text-slate-400">Total Interest</span>
                <span className="font-black font-mono text-slate-800">{formatCurrency(baseline.totalInterest)}</span>
              </div>
              <div>
                <span className="block text-slate-400">Loan Term</span>
                <span className="font-black font-mono text-slate-800">{baseline.totalMonths} mo ({Math.floor(baseline.totalMonths / 12)} yr)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline & Schedule */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 font-display">Payoff Timeline &amp; Schedule</h3>
          </div>
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/40 text-xs font-bold self-start md:self-center">
            <button
              type="button"
              onClick={() => setScheduleView('annual')}
              className={`px-4 py-1.5 rounded-full transition-all ${scheduleView === 'annual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Annual Summary
            </button>
            <button
              type="button"
              onClick={() => setScheduleView('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all ${scheduleView === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Monthly Breakdown
            </button>
          </div>
        </div>

        {/* SVG Timeline */}
        {timelineSvgMetrics && (
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-center">Remaining Balance &amp; Cumulative Cost Timeline</span>
            <div className="relative w-full overflow-x-auto">
              <svg
                ref={timelineSvgRef}
                viewBox={`0 0 ${timelineSvgMetrics.width} ${timelineSvgMetrics.height}`}
                className="w-full min-w-[700px] select-none cursor-crosshair overflow-visible"
                onMouseMove={handleTimelineMouseMove}
                onMouseLeave={() => setTimelineHoverIndex(null)}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const val = ratio * timelineSvgMetrics.maxVal;
                  const y = timelineSvgMetrics.yScale(val);
                  return (
                    <g key={idx}>
                      <line x1={timelineSvgMetrics.padding.left} y1={y} x2={timelineSvgMetrics.width - timelineSvgMetrics.padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                      <text x={timelineSvgMetrics.padding.left - 8} y={y + 3} fill="#94a3b8" fontSize="9px" fontWeight="bold" textAnchor="end" className="font-mono">{formatCurrency(val)}</text>
                    </g>
                  );
                })}
                <line x1={timelineSvgMetrics.padding.left} y1={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom} x2={timelineSvgMetrics.width - timelineSvgMetrics.padding.right} y2={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom} stroke="#cbd5e1" strokeWidth="1.5" />
                {amortizationData.annualSummaries.map((summary, idx) => {
                  if (idx % Math.ceil(amortizationData.annualSummaries.length / 8) === 0 || idx === amortizationData.annualSummaries.length - 1) {
                    return (
                      <text key={idx} x={timelineSvgMetrics.xScale(idx)} y={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom + 16} fill="#64748b" fontSize="9px" fontWeight="black" textAnchor="middle" className="font-mono">
                        {summary.calendarYear}
                      </text>
                    );
                  }
                  return null;
                })}

                <path d={timelineSvgMetrics.balanceAreaPath} fill="url(#balance-gradient)" opacity="0.12" />
                <path d={timelineSvgMetrics.balanceLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
                <path d={timelineSvgMetrics.principalLinePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                <path d={timelineSvgMetrics.interestLinePath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

                {timelineHoverIndex !== null && activeHoverPeriod && (
                  <g>
                    <line x1={timelineHoverX} y1={timelineSvgMetrics.padding.top} x2={timelineHoverX} y2={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx={timelineHoverX} cy={timelineSvgMetrics.yScale(activeHoverPeriod.endBalance)} r="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                    {activeHoverPeriod.monthlyPeriods.length > 0 && (
                      <>
                        <circle cx={timelineHoverX} cy={timelineSvgMetrics.yScale(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativePrincipal)} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                        <circle cx={timelineHoverX} cy={timelineSvgMetrics.yScale(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativeInterest)} r="4" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                      </>
                    )}
                  </g>
                )}

                <defs>
                  <linearGradient id="balance-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs pt-1 border-t border-slate-200/50">
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-3 h-0.75 bg-[#10b981] inline-block"></span>
                <span className="text-slate-700">Loan Balance</span>
              </span>
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-3 h-0.75 bg-[#3b82f6] inline-block"></span>
                <span className="text-slate-700">Cumulative Principal</span>
              </span>
              <span className="flex items-center space-x-1.5 font-bold">
                <span className="w-3 h-0.75 bg-[#f43f5e] inline-block"></span>
                <span className="text-slate-700">Cumulative Interest</span>
              </span>
            </div>

            {timelineHoverIndex !== null && activeHoverPeriod && (
              <div className="bg-[#1a1a1a] text-white p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between text-xs font-mono shadow-md animate-fade-in-up">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold block">Year</span>
                  <span className="text-sm font-black text-white">{activeHoverPeriod.calendarYear}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold block">Loan Balance</span>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(activeHoverPeriod.endBalance)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold block">Cum. Principal</span>
                  <span className="text-sm font-black text-blue-400">
                    {formatCurrency(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativePrincipal)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold block">Cum. Interest</span>
                  <span className="text-sm font-black text-rose-400">
                    {formatCurrency(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativeInterest)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Annual Summary Table */}
        {scheduleView === 'annual' ? (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-[500px]">
            <table className="w-full min-w-[800px] text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Cal Year</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Principal Paid</th>
                  <th className="px-4 py-3">Interest Paid</th>
                  <th className="px-4 py-3">Extra Paid</th>
                  <th className="px-4 py-3">Ending Balance</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {amortizationData.annualSummaries.map((summary) => {
                  const isExpanded = !!expandedYears[summary.yearNum];
                  return (
                    <React.Fragment key={summary.calendarYear}>
                      <tr
                        onClick={() => toggleYearExpand(summary.yearNum)}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer font-bold"
                      >
                        <td className="px-4 py-3 text-slate-900">Year {summary.yearNum}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{summary.calendarYear}</td>
                        <td className="px-4 py-3 font-black text-slate-950">{formatCurrency(summary.totalPaid)}</td>
                        <td className="px-4 py-3 text-blue-700">{formatCurrency(summary.principalPaid + summary.extraPaid)}</td>
                        <td className="px-4 py-3 text-rose-600">{formatCurrency(summary.interestPaid)}</td>
                        <td className={`px-4 py-3 font-bold ${summary.extraPaid > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {summary.extraPaid > 0 ? formatCurrency(summary.extraPaid) : '-'}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900">{formatCurrency(summary.endBalance)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center transition-all text-slate-500"
                          >
                            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[8px]`}></i>
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 bg-slate-50">
                            <div className="overflow-x-auto border-y border-slate-200/50">
                              <table className="w-full min-w-[700px] text-[10px] text-slate-600 font-mono">
                                <thead>
                                  <tr className="bg-slate-100/60 border-b border-slate-150 text-slate-400 font-bold uppercase text-[8px]">
                                    <th className="pl-8 pr-4 py-2">Date</th>
                                    <th className="px-4 py-2">Payment</th>
                                    <th className="px-4 py-2">Principal</th>
                                    <th className="px-4 py-2">Interest</th>
                                    <th className="px-4 py-2">Extra</th>
                                    <th className="px-4 py-2">Total Paid</th>
                                    <th className="px-4 py-2">Balance</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                  {summary.monthlyPeriods.map((p) => (
                                    <tr key={p.index} className="hover:bg-slate-100/30 transition-colors">
                                      <td className="pl-8 pr-4 py-2 text-slate-900 font-bold">{p.dateStr}</td>
                                      <td className="px-4 py-2">{formatCurrencyDetailed(p.payment)}</td>
                                      <td className="px-4 py-2 text-blue-600">{formatCurrencyDetailed(p.principalPaid)}</td>
                                      <td className="px-4 py-2 text-rose-500">{formatCurrencyDetailed(p.interestPaid)}</td>
                                      <td className={`px-4 py-2 font-bold ${p.extraPaid > 0 ? 'text-emerald-600' : ''}`}>
                                        {p.extraPaid > 0 ? `+${formatCurrencyDetailed(p.extraPaid)}` : '-'}
                                      </td>
                                      <td className="px-4 py-2 font-black text-slate-950">{formatCurrencyDetailed(p.totalMonthlyPaid)}</td>
                                      <td className="px-4 py-2 font-bold">{formatCurrencyDetailed(p.remainingBalance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Monthly Breakdown Table */
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-[500px]">
            <table className="w-full min-w-[800px] text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                  <th className="px-4 py-3">No.</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Extra Paid</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Cum. Principal</th>
                  <th className="px-4 py-3">Cum. Interest</th>
                  <th className="px-4 py-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {amortizationData.monthlyPeriods.map((p) => (
                  <tr
                    key={p.index}
                    className={`hover:bg-slate-50/60 transition-colors ${crossover.paymentCrossover && p.index === crossover.paymentCrossover.index ? 'bg-indigo-50/50 border-indigo-200' : ''}`}
                  >
                    <td className="px-4 py-2.5 text-slate-400 font-bold">#{p.index}</td>
                    <td className={`px-4 py-2.5 font-bold ${crossover.paymentCrossover && p.index === crossover.paymentCrossover.index ? 'text-indigo-700' : 'text-slate-900'}`}>
                      {p.dateStr}
                      {crossover.paymentCrossover && p.index === crossover.paymentCrossover.index && (
                        <span className="ml-1.5 text-[8px] bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded font-black uppercase tracking-wider">crossover</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{formatCurrencyDetailed(p.payment)}</td>
                    <td className={`px-4 py-2.5 font-medium ${p.principalPaid > p.interestPaid ? 'text-blue-600 font-black' : 'text-blue-500'}`}>
                      {formatCurrencyDetailed(p.principalPaid)}
                    </td>
                    <td className={`px-4 py-2.5 font-medium ${p.interestPaid > p.principalPaid ? 'text-rose-500' : 'text-rose-400'}`}>
                      {formatCurrencyDetailed(p.interestPaid)}
                    </td>
                    <td className={`px-4 py-2.5 font-bold ${p.extraPaid > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {p.extraPaid > 0 ? `+${formatCurrencyDetailed(p.extraPaid)}` : '-'}
                    </td>
                    <td className="px-4 py-2.5 font-black text-slate-950">{formatCurrencyDetailed(p.totalMonthlyPaid)}</td>
                    <td className="px-4 py-2.5 font-bold text-blue-600">{formatCurrencyDetailed(p.cumulativePrincipal)}</td>
                    <td className="px-4 py-2.5 font-bold text-rose-500">{formatCurrencyDetailed(p.cumulativeInterest)}</td>
                    <td className="px-4 py-2.5 font-black text-slate-900">{formatCurrencyDetailed(p.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
