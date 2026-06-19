'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

interface MonthRow {
  month: number; startBalance: number; payment: number; principalPaid: number; interestPaid: number; endBalance: number;
}

const sim = (balance: number, apr: number, payment: number, extra: number, addCharges: number) => {
  const dailyRate = apr / 100 / 365;
  const monthlyDays = 30.44;
  let bal = balance;
  let months = 0;
  let totalInt = 0;
  const schedule: MonthRow[] = [];
  const totalPayment = payment + extra;

  while (bal > 0.01 && months < 600) {
    months++;
    const startBal = bal;
    const int = bal * dailyRate * monthlyDays;
    totalInt += int;
    const applied = Math.min(totalPayment, bal + int);
    const principal = applied - int;
    bal = bal + int - applied + addCharges;
    if (bal < 0) bal = 0;
    schedule.push({ month: months, startBalance: startBal, payment: applied, principalPaid: Math.max(0, principal), interestPaid: int, endBalance: bal });
    if (bal <= 0.01 && addCharges <= 0) break;
  }

  const totalPaid = balance + totalInt + addCharges * months;
  return { months, totalInt, totalPaid, schedule, finalBalance: bal };
};

const calcMinPayment = (balance: number) => Math.max(balance * 0.03, 25);

const calcRequiredPayment = (balance: number, apr: number, targetMonths: number) => {
  const dailyRate = apr / 100 / 365;
  const monthlyRate = dailyRate * 30.44;
  if (monthlyRate === 0 || targetMonths <= 0) return balance > 0 ? balance / Math.max(targetMonths, 1) : 0;
  return balance * monthlyRate * Math.pow(1 + monthlyRate, targetMonths) / (Math.pow(1 + monthlyRate, targetMonths) - 1);
};

const balancePresets = [1000, 2500, 5000, 10000, 25000];

export default function CreditCardCalculator() {
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(18.99);
  const [payment, setPayment] = useState(150);
  const [extra, setExtra] = useState(0);
  const [addCharges, setAddCharges] = useState(0);

  const [showAccelerate, setShowAccelerate] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [targetMonths, setTargetMonths] = useState(12);

  const minPayment = calcMinPayment(balance);
  const paymentPlaceholder = Math.max(minPayment, payment);

  const result = useMemo(() => sim(balance, apr, payment, extra, addCharges), [balance, apr, payment, extra, addCharges]);

  const requiredPayment = useMemo(() => {
    if (!showGoal || targetMonths <= 0) return 0;
    return calcRequiredPayment(balance + addCharges * targetMonths, apr, targetMonths);
  }, [balance, apr, addCharges, showGoal, targetMonths]);

  const extraResult = useMemo(() => {
    if (!showAccelerate || extra <= 0) return null;
    return sim(balance, apr, payment, 0, addCharges);
  }, [balance, apr, payment, extra, addCharges, showAccelerate]);

  const firstMonthInterest = balance * (apr / 100 / 365) * 30.44;
  const payoffYears = Math.floor(result.months / 12);
  const payoffRemMonths = result.months % 12;
  const payoffLabel = payoffYears > 0 ? `${payoffYears} yr ${payoffRemMonths} mo` : `${result.months} mo`;

  const handleReset = () => {
    setBalance(5000); setApr(18.99); setPayment(150); setExtra(0); setAddCharges(0);
    setShowAccelerate(false); setShowGoal(false); setTargetMonths(12);
  };

  const scheduleToShow = result.schedule.length > 60 ? result.schedule.slice(0, 60) : result.schedule;
  const isTruncated = result.schedule.length > 60;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Card Details
          </h3>

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
            <input type="range" min={0} max={100000} step={100} value={balance} onChange={(e) => setBalance(parseInt(e.target.value))}
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

          {/* APR + Add Charges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">APR</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.25" min="0" max="36" value={apr}
                    onChange={(e) => setApr(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="0" max="36" step="0.25" value={apr} onChange={(e) => setApr(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5">
                {[9.99, 14.99, 18.99, 22.99, 29.99].map((r) => (
                  <button key={r} type="button" onClick={() => setApr(r)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${apr === r ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Charges</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={addCharges} onChange={(e) => setAddCharges(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
              </div>
              <input type="range" min={0} max={2000} step={25} value={addCharges} onChange={(e) => setAddCharges(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="text-xs text-slate-400 font-mono">New purchases added each month</div>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Payment
          </h3>

          {/* Monthly Payment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Payment</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={payment} onChange={(e) => setPayment(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={25} max={balance + 1000} step={5} value={payment} onChange={(e) => setPayment(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Min:</span>
              <button type="button" onClick={() => setPayment(Math.ceil(minPayment))}
                className={`px-2 py-0.5 text-[10px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${payment === Math.ceil(minPayment) ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                {fmtDet(minPayment)}
              </button>
              <span className="w-px h-4 bg-slate-200 mx-1"></span>
              {[100, 250, 500].map((amt) => (
                <button key={amt} type="button" onClick={() => setPayment(amt)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${payment === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  ${amt}
                </button>
              ))}
            </div>
            {payment <= firstMonthInterest && balance > 0 && (
              <div className="text-xs text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                Payment must exceed monthly interest ({fmtDet(firstMonthInterest)}) to reduce the balance.
              </div>
            )}
          </div>

          {/* Accelerate (Extra Payment) */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl overflow-hidden">
            <button type="button" onClick={() => setShowAccelerate(!showAccelerate)}
              className="w-full flex items-center justify-between p-4 text-sm font-extrabold uppercase tracking-wider text-indigo-700 hover:bg-indigo-50/80 transition-all">
              <span className="flex items-center"><i className="fas fa-rocket mr-2 text-indigo-500"></i>Accelerate (Extra Payment)</span>
              <i className={`fas fa-chevron-${showAccelerate ? 'up' : 'down'} text-indigo-400 text-xs transition-all`}></i>
            </button>
            {showAccelerate && (
              <div className="px-4 pb-4 space-y-3 text-sm animate-fade-in-up">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-600">Extra Monthly Payment</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-xs">$</span>
                      <input type="number" value={extra} onChange={(e) => setExtra(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-bold focus:outline-none" />
                    </div>
                  </div>
                  <input type="range" min={0} max={5000} step={5} value={extra} onChange={(e) => setExtra(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                {extra > 0 && extraResult && (
                  <div className="bg-white border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Payoff Time:</span>
                      <span className="font-black font-mono text-slate-800">
                        {payoffYears > 0 ? `${payoffYears}yr ${payoffRemMonths}mo` : `${result.months}mo`}
                        <span className="text-indigo-600"> ({result.months} mo)</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Without Extra:</span>
                      <span className="font-black font-mono text-slate-500">{extraResult.months} mo (${fmt(extraResult.totalInt)} interest)</span>
                    </div>
                    <div className="border-t border-indigo-100 pt-2 flex justify-between items-center">
                      <span className="font-bold text-emerald-700">You Save:</span>
                      <span className="font-black font-mono text-emerald-600">
                        {extraResult.months - result.months} mo & {fmt(Math.max(0, extraResult.totalInt - result.totalInt))} in interest
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Goal Planning */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl overflow-hidden">
            <button type="button" onClick={() => setShowGoal(!showGoal)}
              className="w-full flex items-center justify-between p-4 text-sm font-extrabold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50/80 transition-all">
              <span className="flex items-center"><i className="fas fa-bullseye mr-2 text-emerald-500"></i>Payoff Goal (Target Months)</span>
              <i className={`fas fa-chevron-${showGoal ? 'up' : 'down'} text-emerald-400 text-xs transition-all`}></i>
            </button>
            {showGoal && (
              <div className="px-4 pb-4 space-y-3 text-sm animate-fade-in-up">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-600">Pay Off In</label>
                    <span className="font-mono text-sm font-black text-slate-700">{targetMonths} mo ({Math.floor(targetMonths / 12)}yr {targetMonths % 12}mo)</span>
                  </div>
                  <input type="range" min={1} max={120} step={1} value={targetMonths} onChange={(e) => setTargetMonths(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                {requiredPayment > 0 && (
                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Your Payment:</span>
                      <span className="font-black font-mono text-slate-800">{fmtDet(payment + extra)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Required:</span>
                      <span className="font-black font-mono text-emerald-700">{fmtDet(requiredPayment)}/mo</span>
                    </div>
                    {payment + extra >= requiredPayment ? (
                      <div className="bg-emerald-100 text-emerald-800 rounded-xl p-2 text-center font-black text-xs">
                        <i className="fas fa-check-circle mr-1"></i>On track to pay off in {targetMonths} months!
                      </div>
                    ) : (
                      <div className="bg-amber-100 text-amber-800 rounded-xl p-2 text-center font-black text-xs">
                        Need {fmtDet(requiredPayment - payment - extra)} more per month
                      </div>
                    )}
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
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Payoff Summary
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">CC</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Payoff Time</span>
                <div className="text-5xl font-black text-white font-mono">
                  {payoffLabel}
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
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Interest</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmtDet(firstMonthInterest)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block"># Payments</span>
                  <span className="font-black text-base text-slate-100">{result.months}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Payment Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Principal Balance</span>
                <span className="font-black font-mono text-slate-900">{fmt(balance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Monthly Payment</span>
                <span className="font-black font-mono text-indigo-600">{fmtDet(payment + extra)}</span>
              </div>
              {addCharges > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Additional Charges</span>
                  <span className="font-black font-mono text-slate-900">{fmt(addCharges * result.months)}</span>
                </div>
              )}
              {extra > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Extra Payment Total</span>
                  <span className="font-black font-mono text-indigo-600">{fmt(extra * result.months)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Interest</span>
                <span className="font-black font-mono text-lg text-rose-600">{fmt(result.totalInt)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Amount Paid</span>
                <span className="font-black font-mono text-lg text-slate-900">{fmt(result.totalPaid)}</span>
              </div>
            </div>
          </div>

          {/* Tip */}
          {payment <= firstMonthInterest && balance > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm flex items-start gap-3">
              <i className="fas fa-lightbulb text-amber-500 mt-0.5"></i>
              <div>
                <span className="font-bold text-amber-800">Tip: </span>
                <span className="text-amber-700">Increase your payment above {fmtDet(firstMonthInterest)}/mo to start reducing the principal. Otherwise interest alone keeps the balance growing.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-width Payoff Schedule */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Payoff Schedule
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{result.months} payments total</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-96">
          <table className="w-full min-w-[650px] text-xs border-collapse text-left">
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
                <tr key={row.month} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 font-bold">#{row.month}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.startBalance)}</td>
                  <td className="px-4 py-2.5">{fmtDet(row.payment)}</td>
                  <td className="px-4 py-2.5 text-blue-600">{row.principalPaid > 0 ? fmtDet(row.principalPaid) : '$0.00'}</td>
                  <td className="px-4 py-2.5 text-rose-500">{fmtDet(row.interestPaid)}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.endBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isTruncated && (
          <p className="text-xs text-slate-400 text-center font-medium">Showing first 60 of {result.months} payments. Full schedule is available on your payment plan.</p>
        )}
      </div>
    </div>
  );
}
