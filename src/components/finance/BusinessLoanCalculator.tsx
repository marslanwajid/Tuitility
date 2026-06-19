'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtDet = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

type CompoundFreq = 'monthly' | 'daily' | 'annually';
type PayFreq = 'monthly' | 'biweekly' | 'weekly';

const getMonthlyRate = (annualRate: number, compound: CompoundFreq) => {
  const r = annualRate / 100;
  switch (compound) {
    case 'monthly': return r / 12;
    case 'daily': return Math.pow(1 + r / 365, 365 / 12) - 1;
    case 'annually': return Math.pow(1 + r, 1 / 12) - 1;
  }
};

const calcPayment = (principal: number, rate: number, n: number) => {
  if (principal <= 0 || n <= 0) return 0;
  if (rate === 0) return principal / n;
  return principal * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
};

const PAY_FREQ_LABELS: Record<PayFreq, string> = { monthly: 'Monthly', biweekly: 'Bi-weekly', weekly: 'Weekly' };

const quickAmounts = [10000, 25000, 50000, 100000, 250000];
const compoundOptions: CompoundFreq[] = ['monthly', 'daily', 'annually'];
const payFreqOptions: PayFreq[] = ['monthly', 'biweekly', 'weekly'];

export default function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [interestRate, setInterestRate] = useState(8);
  const [termYears, setTermYears] = useState(5);
  const [termMonths, setTermMonths] = useState(0);
  const [compound, setCompound] = useState<CompoundFreq>('monthly');
  const [payFreq, setPayFreq] = useState<PayFreq>('monthly');
  const [origFeePct, setOrigFeePct] = useState(1);
  const [docFee, setDocFee] = useState(0);
  const [otherFee, setOtherFee] = useState(0);

  const result = useMemo(() => {
    const origFee = loanAmount * (origFeePct / 100);
    const totalFees = origFee + docFee + otherFee;
    const amountFinanced = loanAmount + totalFees;
    const totalTermMonths = termYears * 12 + termMonths;

    const monthlyRate = getMonthlyRate(interestRate, compound);

    let ratePerPeriod: number;
    let numPayments: number;
    switch (payFreq) {
      case 'monthly':
        ratePerPeriod = monthlyRate;
        numPayments = totalTermMonths;
        break;
      case 'biweekly':
        ratePerPeriod = monthlyRate / 2;
        numPayments = totalTermMonths * 2;
        break;
      case 'weekly':
        ratePerPeriod = monthlyRate / 4;
        numPayments = totalTermMonths * 4;
        break;
    }

    const payment = calcPayment(amountFinanced, ratePerPeriod, numPayments);
    const totalPaid = payment * numPayments;
    const totalInterest = totalPaid - amountFinanced;
    const totalCost = totalPaid;

    return {
      origFee, totalFees, amountFinanced, totalTermMonths,
      monthlyRate, ratePerPeriod, numPayments,
      payment, totalPaid, totalInterest, totalCost,
    };
  }, [loanAmount, interestRate, termYears, termMonths, compound, payFreq, origFeePct, docFee, otherFee]);

  const handleReset = () => {
    setLoanAmount(50000); setInterestRate(8); setTermYears(5); setTermMonths(0);
    setCompound('monthly'); setPayFreq('monthly');
    setOrigFeePct(1); setDocFee(0); setOtherFee(0);
  };

  const payLabel = PAY_FREQ_LABELS[payFreq];

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Business Loan Details
          </h3>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Loan Amount</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min={1000} max={5000000} step={1000} value={loanAmount} onChange={(e) => setLoanAmount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {quickAmounts.map((amt) => (
                <button key={amt} type="button" onClick={() => setLoanAmount(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${loanAmount === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt >= 1000 ? `$${amt / 1000}k` : fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Loan Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Interest Rate (APR)</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.25" min="0" max="36" value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="0.5" max="36" step="0.25" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Loan Term</label>
                <span className="font-mono text-sm font-black text-slate-700">{termYears} yr {termMonths > 0 ? `${termMonths} mo` : ''}</span>
              </div>
              <input type="range" min="1" max="30" step="1" value={termYears} onChange={(e) => setTermYears(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">+ months:</span>
                <div className="flex space-x-1">
                  {[0, 3, 6, 9].map((m) => (
                    <button key={m} type="button" onClick={() => setTermMonths(m)}
                      className={`px-2 py-0.5 font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${termMonths === m ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {m === 0 ? '0' : `${m}mo`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compounding & Payment Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Compounding</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {compoundOptions.map((opt) => (
                  <button key={opt} type="button" onClick={() => setCompound(opt)}
                    className={`py-2 rounded-lg text-sm font-extrabold transition-all ${compound === opt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {opt === 'monthly' ? 'Monthly' : opt === 'daily' ? 'Daily' : 'Annually'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Payment Frequency</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {payFreqOptions.map((opt) => (
                  <button key={opt} type="button" onClick={() => setPayFreq(opt)}
                    className={`py-2 rounded-lg text-sm font-extrabold transition-all ${payFreq === opt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {PAY_FREQ_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fees Section */}
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Fees & Charges
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Origination Fee</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.5" min="0" max="15" value={origFeePct}
                    onChange={(e) => setOrigFeePct(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-14 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="0" max="15" step="0.5" value={origFeePct} onChange={(e) => setOrigFeePct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="text-xs text-slate-400 font-mono">
                {fmt(loanAmount * origFeePct / 100)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Doc Fee</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={docFee} onChange={(e) => setDocFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
              </div>
              <input type="range" min="0" max="5000" step="50" value={docFee} onChange={(e) => setDocFee(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Other Fees</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={otherFee} onChange={(e) => setOtherFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
              </div>
              <input type="range" min="0" max="5000" step="50" value={otherFee} onChange={(e) => setOtherFee(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
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
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Loan Summary
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">BIZ</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">{payLabel} Payment</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmtDet(result.payment)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Cost</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.totalCost)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(result.totalInterest)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Fees</span>
                  <span className="font-mono font-black text-base text-orange-400">{fmt(result.totalFees)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">APR</span>
                  <span className="font-mono font-black text-base text-slate-100">{interestRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Fee & Payment Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Loan Amount</span>
                <span className="font-black font-mono text-slate-900">{fmt(loanAmount)}</span>
              </div>
              {origFeePct > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Origination Fee ({origFeePct}%)</span>
                  <span className="font-black font-mono text-orange-600">{fmt(result.origFee)}</span>
                </div>
              )}
              {docFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Documentation Fee</span>
                  <span className="font-black font-mono text-orange-600">{fmt(docFee)}</span>
                </div>
              )}
              {otherFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Other Fees</span>
                  <span className="font-black font-mono text-orange-600">{fmt(otherFee)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Fees</span>
                <span className="font-black font-mono text-lg text-orange-600">{fmt(result.totalFees)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Amount Financed</span>
                <span className="font-black font-mono text-lg text-slate-900">{fmt(result.amountFinanced)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Full-width Repayment Summary */}
      <div className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-3xl space-y-4">
        <span className="text-sm text-slate-400 font-extrabold uppercase tracking-wider block">Repayment Summary</span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Payment Frequency</span>
            <span className="font-black text-slate-900 text-base">{payLabel}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Number of Payments</span>
            <span className="font-black font-mono text-slate-900 text-base">{result.numPayments.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{payLabel} Payment</span>
            <span className="font-black font-mono text-slate-900 text-base">{fmtDet(result.payment)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Interest</span>
            <span className="font-black font-mono text-rose-600 text-base">{fmt(result.totalInterest)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Cost of Borrowing</span>
            <span className="font-black font-mono text-slate-900 text-base">{fmt(result.totalCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
