'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

type Freq = 'monthly' | 'biweekly' | 'weekly';

const FREQ_LABELS: Record<Freq, string> = { monthly: 'Monthly', biweekly: 'Bi-weekly', weekly: 'Weekly' };
const FREQ_PERIODS: Record<Freq, number> = { monthly: 12, biweekly: 26, weekly: 52 };

const DEBT_TYPES: Record<string, { label: string; apr: number; minPct: number }> = {
  'credit-card': { label: 'Credit Card', apr: 18.99, minPct: 3 },
  'personal-loan': { label: 'Personal Loan', apr: 12.5, minPct: 2 },
  'auto-loan': { label: 'Auto Loan', apr: 6.5, minPct: 1.5 },
  'student-loan': { label: 'Student Loan', apr: 6.8, minPct: 1.5 },
  'home-equity': { label: 'Home Equity Loan', apr: 7.5, minPct: 2 },
  'medical': { label: 'Medical Debt', apr: 0, minPct: 1 },
  'other': { label: 'Other', apr: 10, minPct: 2 },
};

interface PeriodRow {
  period: number; startBalance: number; payment: number; principal: number; interest: number; endBalance: number;
}

function simulate(balance: number, apr: number, payment: number, freq: Freq, maxPeriods = 600) {
  const periodsPerYear = FREQ_PERIODS[freq];
  const periodRate = apr / 100 / periodsPerYear;
  let bal = balance;
  let periods = 0;
  let totalInt = 0;
  const schedule: PeriodRow[] = [];

  while (bal > 0.01 && periods < maxPeriods) {
    periods++;
    const startBal = bal;
    const int = bal * periodRate;
    totalInt += int;
    const applied = Math.min(payment, bal + int);
    const principal = applied - int;
    bal = bal + int - applied;
    if (bal < 0) bal = 0;
    schedule.push({
      period: periods, startBalance: startBal,
      payment: applied, principal: Math.max(0, principal), interest: int,
      endBalance: bal,
    });
    if (bal <= 0.01) break;
  }

  const totalPaid = balance + totalInt;
  const payoffYears = Math.floor(periods / periodsPerYear);
  const payoffRem = periods % periodsPerYear;

  let payoffLabel = '';
  if (payoffYears > 0) payoffLabel += `${payoffYears} yr `;
  if (payoffRem > 0) {
    if (freq === 'monthly') payoffLabel += `${payoffRem} mo`;
    else if (freq === 'biweekly') payoffLabel += `${payoffRem} bi-wk`;
    else payoffLabel += `${payoffRem} wk`;
  }
  if (!payoffLabel) payoffLabel = '< 1 period';

  return { periods, totalInt, totalPaid, payoffLabel, schedule, finalBalance: bal };
}

const balancePresets = [1000, 2500, 5000, 10000, 25000];

export default function DebtPayoffCalculator() {
  const [debtType, setDebtType] = useState('credit-card');
  const [balance, setBalance] = useState(10000);
  const [apr, setApr] = useState(DEBT_TYPES['credit-card'].apr);
  const [freq, setFreq] = useState<Freq>('monthly');
  const [minPayment, setMinPayment] = useState(300); // 3% of 10k
  const [extraPayment, setExtraPayment] = useState(50);

  const handleDebtTypeChange = (type: string) => {
    setDebtType(type);
    const dt = DEBT_TYPES[type];
    setApr(dt.apr);
    setMinPayment(Math.max(Math.ceil(balance * dt.minPct / 100), 25));
  };

  const totalPayment = minPayment + extraPayment;

  const result = useMemo(() => simulate(balance, apr, totalPayment, freq), [balance, apr, totalPayment, freq]);
  const baseResult = useMemo(() => simulate(balance, apr, minPayment, freq), [balance, apr, minPayment, freq]);

  const periodsPerYear = FREQ_PERIODS[freq];
  const firstPeriodInterest = balance * (apr / 100 / periodsPerYear);
  const interestWarning = minPayment <= firstPeriodInterest;

  const scheduleToShow = result.schedule.length > 60 ? result.schedule.slice(0, 60) : result.schedule;
  const isTruncated = result.schedule.length > 60;

  const handleReset = () => {
    setDebtType('credit-card');
    setBalance(10000);
    setApr(DEBT_TYPES['credit-card'].apr);
    setFreq('monthly');
    setMinPayment(Math.max(Math.ceil(10000 * 3 / 100), 25));
    setExtraPayment(50);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Debt Details
          </h3>

          {/* Debt Type */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Debt Type</label>
            <select value={debtType} onChange={(e) => handleDebtTypeChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none cursor-pointer">
              {Object.entries(DEBT_TYPES).map(([key, dt]) => (
                <option key={key} value={key}>{dt.label} (typical {dt.apr}%)</option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Current Balance</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={balance} onChange={(e) => setBalance(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min={0} max={200000} step={100} value={balance} onChange={(e) => setBalance(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {balancePresets.map((amt) => (
                <button key={amt} type="button" onClick={() => setBalance(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${balance === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* APR & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Interest Rate (APR)</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.01" min={0} max={50} value={apr}
                    onChange={(e) => setApr(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min={0} max={50} step={0.01} value={apr} onChange={(e) => setApr(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Payment Frequency</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {(['monthly', 'biweekly', 'weekly'] as Freq[]).map((f) => (
                  <button key={f} type="button" onClick={() => setFreq(f)}
                    className={`py-2 rounded-lg text-xs font-extrabold transition-all ${freq === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {FREQ_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Min Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Minimum Payment</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={minPayment} onChange={(e) => setMinPayment(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={5000} step={5} value={minPayment} onChange={(e) => setMinPayment(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            {interestWarning && (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
                Payment is less than {freq} interest (${Math.ceil(firstPeriodInterest)}). Balance will not decrease.
              </div>
            )}
            {!interestWarning && (
              <div className="text-[10px] text-slate-400 font-mono">
                First {freq} interest: ${Math.ceil(firstPeriodInterest)} &middot; Payment must exceed this to reduce principal
              </div>
            )}
          </div>

          {/* Extra Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Extra Payment</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={5000} step={5} value={extraPayment} onChange={(e) => setExtraPayment(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="text-xs text-slate-400 font-mono">
              Total payment: {fmt(totalPayment)}/{freq === 'monthly' ? 'mo' : freq === 'biweekly' ? 'bi-wk' : 'wk'}
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
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Payoff Summary
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">DEBT</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Payoff Time</span>
                <div className="text-5xl font-black text-white font-mono">
                  {result.payoffLabel}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  {fmt(totalPayment)}/{freq === 'monthly' ? 'mo' : freq === 'biweekly' ? 'bi-wk' : 'wk'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(result.totalInt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.totalPaid)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Interest Saved</span>
                  <span className="font-mono font-black text-base text-emerald-400">
                    {extraPayment > 0 ? fmt(Math.max(0, baseResult.totalInt - result.totalInt)) : '$0'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Periods</span>
                  <span className="font-mono font-black text-base text-slate-100">{result.periods} {freq === 'monthly' ? 'mo' : freq === 'biweekly' ? 'pmts' : 'wk'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Without Extra Comparison Panel */}
          {extraPayment > 0 && (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Without Extra Payment</span>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Payoff Time</span>
                  <span className="font-black font-mono text-slate-900">{baseResult.payoffLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Interest</span>
                  <span className="font-black font-mono text-rose-500">{fmt(baseResult.totalInt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Paid</span>
                  <span className="font-black font-mono text-slate-900">{fmt(baseResult.totalPaid)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-emerald-700 font-black">You Save</span>
                  <span className="font-black font-mono text-lg text-emerald-600">
                    {fmt(Math.max(0, baseResult.totalInt - result.totalInt))} interest
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-width: Accelerator Comparison */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400 text-sm"></i>
            Accelerator Comparison
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Minimum Only ({fmt(minPayment)})</th>
                <th className="px-4 py-3">With Extra ({fmt(totalPayment)})</th>
                <th className="px-4 py-3">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                { label: 'Payoff Time', base: baseResult.payoffLabel, extra: result.payoffLabel, diff: '' },
                { label: 'Total Interest', base: fmt(baseResult.totalInt), extra: fmt(result.totalInt), diff: fmt(Math.max(0, baseResult.totalInt - result.totalInt)) },
                { label: 'Total Paid', base: fmt(baseResult.totalPaid), extra: fmt(result.totalPaid), diff: fmt(Math.abs(baseResult.totalPaid - result.totalPaid)) },
                { label: 'Total Periods', base: `${baseResult.periods}`, extra: `${result.periods}`, diff: `${Math.max(0, baseResult.periods - result.periods)} saved` },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                  <td className="px-4 py-2.5 text-slate-500">{row.base}</td>
                  <td className="px-4 py-2.5 font-black text-slate-900">{row.extra}</td>
                  <td className={`px-4 py-2.5 font-black ${row.diff.includes('saved') ? 'text-emerald-600' : i > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {row.diff || '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Payoff Schedule
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {result.periods} {freq === 'monthly' ? 'months' : freq === 'biweekly' ? 'payments' : 'weeks'}
            {isTruncated ? ` (showing first 60)` : ''}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-80">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Start Balance</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Principal</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">End Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {scheduleToShow.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.period}</td>
                  <td className="px-4 py-2.5">{fmt(row.startBalance)}</td>
                  <td className="px-4 py-2.5">{fmt(row.payment)}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{fmt(row.principal)}</td>
                  <td className="px-4 py-2.5 text-rose-500">{fmt(row.interest)}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.endBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
