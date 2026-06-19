'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => `${val.toFixed(1)}%`;

type Period = 'mo' | 'yr';
const PERIOD_LABEL: Record<Period, string> = { mo: '/mo', yr: '/yr' };

interface Source {
  label: string; amount: number; period: Period;
}

const INCOME_KEYS = ['salary', 'pension', 'investment', 'other'] as const;
const HOUSING_KEYS = ['rentMortgage', 'hoa', 'propTax', 'insurance'] as const;
const OTHER_DEBT_KEYS = ['creditCards', 'studentLoan', 'autoLoan', 'otherLoans'] as const;
const ALL_DEBT_KEYS = [...HOUSING_KEYS, ...OTHER_DEBT_KEYS] as const;

const INCOME_LABELS: Record<string, string> = { salary: 'Salary', pension: 'Pension', investment: 'Investment Income', other: 'Other Income' };
const HOUSING_LABELS: Record<string, string> = { rentMortgage: 'Rent / Mortgage', hoa: 'HOA Fees', propTax: 'Property Tax', insurance: 'Homeowner Insurance' };
const OTHER_DEBT_LABELS: Record<string, string> = { creditCards: 'Credit Cards', studentLoan: 'Student Loan', autoLoan: 'Auto Loan', otherLoans: 'Other Loans' };

const toMonthly = (amt: number, p: Period) => p === 'yr' ? amt / 12 : amt;
const toAnnual = (amt: number, p: Period) => p === 'mo' ? amt * 12 : amt;

function dtiStatus(dti: number): { label: string; color: string; desc: string } {
  if (dti < 36) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Strong financial health — high loan approval chances' };
  if (dti <= 43) return { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Manageable — most lenders will approve' };
  if (dti <= 50) return { label: 'Caution', color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Elevated — some lenders may be hesitant' };
  return { label: 'Warning', color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Very high — immediate debt reduction recommended' };
}

export default function DebtIncomeCalculator() {
  const [income, setIncome] = useState<Record<string, Source>>({
    salary: { label: 'Salary', amount: 6000, period: 'mo' },
    pension: { label: 'Pension', amount: 0, period: 'mo' },
    investment: { label: 'Investment Income', amount: 0, period: 'mo' },
    other: { label: 'Other Income', amount: 0, period: 'mo' },
  });
  const [housing, setHousing] = useState<Record<string, Source>>({
    rentMortgage: { label: 'Rent / Mortgage', amount: 1800, period: 'mo' },
    hoa: { label: 'HOA Fees', amount: 200, period: 'mo' },
    propTax: { label: 'Property Tax', amount: 3000, period: 'yr' },
    insurance: { label: 'Homeowner Insurance', amount: 1200, period: 'yr' },
  });
  const [otherDebt, setOtherDebt] = useState<Record<string, Source>>({
    creditCards: { label: 'Credit Cards', amount: 150, period: 'mo' },
    studentLoan: { label: 'Student Loan', amount: 300, period: 'mo' },
    autoLoan: { label: 'Auto Loan', amount: 400, period: 'mo' },
    otherLoans: { label: 'Other Loans', amount: 0, period: 'mo' },
  });

  const setAmt = (group: 'income' | 'housing' | 'other', key: string, val: number) => {
    const upd = (prev: Record<string, Source>) => ({ ...prev, [key]: { ...prev[key], amount: Math.max(0, val) } });
    if (group === 'income') setIncome(upd);
    else if (group === 'housing') setHousing(upd);
    else setOtherDebt(upd);
  };
  const setPeriod = (group: 'income' | 'housing' | 'other', key: string, p: Period) => {
    const upd = (prev: Record<string, Source>) => ({ ...prev, [key]: { ...prev[key], period: p } });
    if (group === 'income') setIncome(upd);
    else if (group === 'housing') setHousing(upd);
    else setOtherDebt(upd);
  };

  const totalMonthlyIncome = useMemo(() =>
    Object.values(income).reduce((s, v) => s + toMonthly(v.amount, v.period), 0), [income]);
  const totalAnnualIncome = useMemo(() =>
    Object.values(income).reduce((s, v) => s + toAnnual(v.amount, v.period), 0), [income]);

  const housingMonthly = useMemo(() =>
    Object.values(housing).reduce((s, v) => s + toMonthly(v.amount, v.period), 0), [housing]);
  const otherDebtMonthly = useMemo(() =>
    Object.values(otherDebt).reduce((s, v) => s + toMonthly(v.amount, v.period), 0), [otherDebt]);
  const totalMonthlyDebt = housingMonthly + otherDebtMonthly;

  const frontEndDTI = totalMonthlyIncome > 0 ? (housingMonthly / totalMonthlyIncome) * 100 : 0;
  const backEndDTI = totalMonthlyIncome > 0 ? (totalMonthlyDebt / totalMonthlyIncome) * 100 : 0;
  const health = dtiStatus(backEndDTI);

  const maxHousing28 = totalMonthlyIncome * 0.28;
  const maxTotalDebt36 = totalMonthlyIncome * 0.36;
  const requiredIncome36 = backEndDTI > 0 ? totalMonthlyIncome * (backEndDTI / 36) : 0;
  const debtReductionNeeded = totalMonthlyDebt > maxTotalDebt36 ? totalMonthlyDebt - maxTotalDebt36 : 0;

  const handleReset = () => {
    setIncome({
      salary: { label: 'Salary', amount: 6000, period: 'mo' },
      pension: { label: 'Pension', amount: 0, period: 'mo' },
      investment: { label: 'Investment Income', amount: 0, period: 'mo' },
      other: { label: 'Other Income', amount: 0, period: 'mo' },
    });
    setHousing({
      rentMortgage: { label: 'Rent / Mortgage', amount: 1800, period: 'mo' },
      hoa: { label: 'HOA Fees', amount: 200, period: 'mo' },
      propTax: { label: 'Property Tax', amount: 3000, period: 'yr' },
      insurance: { label: 'Homeowner Insurance', amount: 1200, period: 'yr' },
    });
    setOtherDebt({
      creditCards: { label: 'Credit Cards', amount: 150, period: 'mo' },
      studentLoan: { label: 'Student Loan', amount: 300, period: 'mo' },
      autoLoan: { label: 'Auto Loan', amount: 400, period: 'mo' },
      otherLoans: { label: 'Other Loans', amount: 0, period: 'mo' },
    });
  };

  const renderSourceRow = (group: 'income' | 'housing' | 'other', key: string, src: Source) => {
    const labels = group === 'income' ? INCOME_LABELS : group === 'housing' ? HOUSING_LABELS : OTHER_DEBT_LABELS;
    return (
      <div key={key} className="flex items-center space-x-2 py-0.5">
        <span className="text-[11px] font-extrabold uppercase text-slate-500 w-28 shrink-0">{labels[key]}</span>
        <span className="text-slate-400 font-mono text-[10px]">$</span>
        <input type="number" value={src.amount} onChange={(e) => setAmt(group, key, parseInt(e.target.value) || 0)}
          className="w-20 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
        <div className="flex bg-slate-100 rounded-lg border border-slate-200/40 p-0.5">
          {(['mo', 'yr'] as Period[]).map((p) => (
            <button key={p} type="button" onClick={() => setPeriod(group, key, p)}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold transition-all ${src.period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
              {p === 'mo' ? '/mo' : '/yr'}</button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-slate-400 w-16 text-right">
          {fmt(toMonthly(src.amount, src.period))}/mo
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Income &amp; Debt Details
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Income Sources</label>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              {INCOME_KEYS.map((k) => renderSourceRow('income', k, income[k]))}
            </div>
            <div className="text-xs text-slate-400 font-mono font-bold text-right">
              Total: {fmt(totalMonthlyIncome)}/mo &middot; {fmt(totalAnnualIncome)}/yr
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Housing Debt</label>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              {HOUSING_KEYS.map((k) => renderSourceRow('housing', k, housing[k]))}
            </div>
            <div className="text-xs text-slate-400 font-mono font-bold text-right">
              Total housing: {fmt(housingMonthly)}/mo
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Other Debt</label>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              {OTHER_DEBT_KEYS.map((k) => renderSourceRow('other', k, otherDebt[k]))}
            </div>
            <div className="text-xs text-slate-400 font-mono font-bold text-right">
              Total other debt: {fmt(otherDebtMonthly)}/mo
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex justify-between items-center text-sm">
            <span className="font-extrabold uppercase text-slate-500 text-xs">Total Monthly Debt</span>
            <span className="font-black font-mono text-slate-900">{fmt(totalMonthlyDebt)}</span>
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            DTI Analysis
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">DTI</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Back-End DTI Ratio</span>
                <div className={`text-5xl font-black font-mono ${backEndDTI < 36 ? 'text-emerald-400' : backEndDTI <= 43 ? 'text-blue-400' : backEndDTI <= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {fmtPct(backEndDTI)}
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-lg border text-xs font-black ${health.color}`}>{health.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto">{health.desc}</p>
              </div>

              {/* DTI Gauge */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>0%</span><span>28%</span><span>36%</span><span>43%</span><span>50%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div className="h-full bg-emerald-500/30" style={{ width: '28%' }} />
                    <div className="h-full bg-blue-500/30" style={{ width: '8%' }} />
                    <div className="h-full bg-amber-500/30" style={{ width: '7%' }} />
                    <div className="h-full bg-rose-500/30" style={{ width: '7%' }} />
                    <div className="h-full bg-rose-700/30" style={{ width: '50%' }} />
                  </div>
                  <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(backEndDTI, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Front-End DTI</span>
                  <span className={`font-mono font-black text-base ${frontEndDTI < 28 ? 'text-emerald-400' : frontEndDTI <= 31 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {fmtPct(frontEndDTI)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Income</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(totalMonthlyIncome)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Monthly Debt</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(totalMonthlyDebt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Housing % of Income</span>
                  <span className={`font-mono font-black text-base ${frontEndDTI <= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>{fmtPct(frontEndDTI)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Affordability at Target DTI</span>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Max Housing @ 28%</span>
              <span className="font-black font-mono text-slate-900">{fmt(maxHousing28)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Max Total Debt @ 36%</span>
              <span className="font-black font-mono text-slate-900">{fmt(maxTotalDebt36)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Req. Income for Current Debt @ 36%</span>
                <span className="font-black font-mono text-slate-900">{fmt(backEndDTI > 0 ? (totalMonthlyDebt / 0.36) : 0)}</span>
              </div>
            </div>
            {debtReductionNeeded > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-bold">
                Reduce monthly debt by {fmt(debtReductionNeeded)} to reach 36% target
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-2 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Lender Guidelines</span>
            <div className="border-b border-slate-200 pb-1 mb-1 flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              <span>Loan Type</span><span>Front</span><span>Back</span>
            </div>
            {[
              { type: 'Conventional', front: 28, back: 36 },
              { type: 'Qualified Mortgage', front: 28, back: 43 },
              { type: 'FHA', front: 31, back: 50 },
            ].map((l) => (
              <div key={l.type} className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-xs">{l.type}</span>
                <div className="flex space-x-4 font-mono font-black text-xs">
                  <span className={frontEndDTI <= l.front ? 'text-emerald-600' : 'text-rose-500'}>{l.front}%</span>
                  <span className={backEndDTI <= l.back ? 'text-emerald-600' : 'text-rose-500'}>{l.back}%</span>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-slate-400 mt-2">
              ✓ = within guideline &nbsp;·&nbsp; ✗ = exceeds guideline
            </div>
          </div>
        </div>
      </div>

      {/* Income & Debt Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-wallet mr-2 text-slate-400 text-xs"></i>
            Income Breakdown
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
            <table className="w-full text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Monthly</th>
                  <th className="px-4 py-3">Annual</th>
                  <th className="px-4 py-3">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {INCOME_KEYS.map((k) => {
                  const s = income[k];
                  const mo = toMonthly(s.amount, s.period);
                  const an = toAnnual(s.amount, s.period);
                  const pct = totalMonthlyIncome > 0 ? (mo / totalMonthlyIncome) * 100 : 0;
                  return (
                    <tr key={k} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{INCOME_LABELS[k]}</td>
                      <td className="px-4 py-2.5">{fmt(mo)}</td>
                      <td className="px-4 py-2.5">{fmt(an)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{fmtPct(pct)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-black">
                  <td className="px-4 py-3 text-slate-900">Total</td>
                  <td className="px-4 py-3 text-slate-900">{fmt(totalMonthlyIncome)}</td>
                  <td className="px-4 py-3 text-slate-900">{fmt(totalAnnualIncome)}</td>
                  <td className="px-4 py-3 text-slate-900">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
            <i className="fas fa-credit-card mr-2 text-slate-400 text-xs"></i>
            Debt Breakdown
          </h4>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
            <table className="w-full text-xs border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Monthly</th>
                  <th className="px-4 py-3">% of Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {ALL_DEBT_KEYS.map((k) => {
                  const src = HOUSING_KEYS.includes(k as typeof HOUSING_KEYS[number]) ? housing[k] : otherDebt[k];
                  const mo = toMonthly(src.amount, src.period);
                  const pct = totalMonthlyIncome > 0 ? (mo / totalMonthlyIncome) * 100 : 0;
                  const label = HOUSING_KEYS.includes(k as typeof HOUSING_KEYS[number]) ? HOUSING_LABELS[k] : OTHER_DEBT_LABELS[k];
                  const isHousing = HOUSING_KEYS.includes(k as typeof HOUSING_KEYS[number]);
                  return (
                    <tr key={k} className="hover:bg-slate-50/60 transition-colors">
                      <td className={`px-4 py-2.5 font-bold ${isHousing ? 'text-slate-900' : 'text-slate-700'}`}>
                        {isHousing ? `${label} (H)` : label}
                      </td>
                      <td className="px-4 py-2.5">{fmt(mo)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{fmtPct(pct)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-black">
                  <td className="px-4 py-3 text-slate-900">Total Debt</td>
                  <td className="px-4 py-3 text-slate-900">{fmt(totalMonthlyDebt)}</td>
                  <td className="px-4 py-3 text-slate-900">{fmtPct(backEndDTI)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* What-If Analysis */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-lightbulb mr-2 text-slate-400 text-sm"></i>
            What-If Analysis
          </h3>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Target 28% DTI</span>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Max housing</span><span className="font-black font-mono">{fmt(totalMonthlyIncome * 0.28)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Current housing</span><span className="font-black font-mono">{fmt(housingMonthly)}</span></div>
                <div className={`border-t pt-1 flex justify-between font-black ${housingMonthly <= totalMonthlyIncome * 0.28 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <span>Status</span><span>{housingMonthly <= totalMonthlyIncome * 0.28 ? '✓ On track' : `✗ Over by ${fmt(housingMonthly - totalMonthlyIncome * 0.28)}`}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Target 36% DTI</span>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Max total debt</span><span className="font-black font-mono">{fmt(totalMonthlyIncome * 0.36)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Current total debt</span><span className="font-black font-mono">{fmt(totalMonthlyDebt)}</span></div>
                <div className={`border-t pt-1 flex justify-between font-black ${totalMonthlyDebt <= totalMonthlyIncome * 0.36 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <span>Status</span><span>{totalMonthlyDebt <= totalMonthlyIncome * 0.36 ? '✓ On track' : `✗ Over by ${fmt(totalMonthlyDebt - totalMonthlyIncome * 0.36)}`}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Target 43% DTI</span>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Max total debt</span><span className="font-black font-mono">{fmt(totalMonthlyIncome * 0.43)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Current total debt</span><span className="font-black font-mono">{fmt(totalMonthlyDebt)}</span></div>
                <div className={`border-t pt-1 flex justify-between font-black ${totalMonthlyDebt <= totalMonthlyIncome * 0.43 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  <span>Status</span><span>{totalMonthlyDebt <= totalMonthlyIncome * 0.43 ? '✓ On track' : `✗ Over by ${fmt(totalMonthlyDebt - totalMonthlyIncome * 0.43)}`}</span>
                </div>
              </div>
            </div>
          </div>

          {backEndDTI > 36 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 font-bold space-y-2">
              <p>To reach <strong>36% DTI</strong>:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Reduce monthly debt by <span className="font-black">{fmt(totalMonthlyDebt - totalMonthlyIncome * 0.36)}</span></li>
                <li>OR increase monthly income to <span className="font-black">{fmt(totalMonthlyDebt / 0.36)}</span> (currently {fmt(totalMonthlyIncome)})</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
