'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => `${val.toFixed(1)}%`;

type BudgetType = '50-30-20' | '70-20-10' | '60-20-20' | 'custom';

const BUDGET_TYPES: { key: BudgetType; label: string; desc: string }[] = [
  { key: '50-30-20', label: '50/30/20', desc: 'Needs 50% · Wants 30% · Savings 20%' },
  { key: '70-20-10', label: '70/20/10', desc: 'Living 70% · Savings 20% · Investing 10%' },
  { key: '60-20-20', label: '60/20/20', desc: 'Expenses 60% · Savings 20% · Debt 20%' },
  { key: 'custom', label: 'Custom', desc: 'Set your own category targets' },
];

const EXPENSE_KEYS = ['housing', 'transportation', 'food', 'utilities', 'insurance', 'healthcare', 'entertainment', 'savings', 'debt', 'other'] as const;
type ExpKey = typeof EXPENSE_KEYS[number];

const EXPENSE_LABELS: Record<ExpKey, string> = {
  housing: 'Housing', transportation: 'Transportation', food: 'Food & Groceries',
  utilities: 'Utilities', insurance: 'Insurance', healthcare: 'Healthcare',
  entertainment: 'Entertainment', savings: 'Savings', debt: 'Debt Payments', other: 'Other',
};

const EXPENSE_RECOMMENDED: Record<ExpKey, { typical: number; max?: number; min?: number }> = {
  housing: { typical: 30, max: 35 },
  transportation: { typical: 15, max: 20 },
  food: { typical: 12, max: 15 },
  utilities: { typical: 5, max: 8 },
  insurance: { typical: 8, max: 12 },
  healthcare: { typical: 5, max: 10 },
  entertainment: { typical: 5, max: 10 },
  savings: { typical: 20, min: 10 },
  debt: { typical: 10, max: 20 },
  other: { typical: 5, max: 10 },
};

type BudgetRule = { needs: number; wants: number; savings: number } | { living: number; savings: number; investing: number } | { expenses: number; savings: number; debt: number } | null;

function getBudgetRule(budgetType: BudgetType): BudgetRule {
  switch (budgetType) {
    case '50-30-20': return { needs: 0.5, wants: 0.3, savings: 0.2 };
    case '70-20-10': return { living: 0.7, savings: 0.2, investing: 0.1 };
    case '60-20-20': return { expenses: 0.6, savings: 0.2, debt: 0.2 };
    case 'custom': return null;
  }
}

function isNeeds(key: ExpKey): boolean {
  return ['housing', 'transportation', 'food', 'utilities', 'insurance', 'healthcare'].includes(key);
}

function isWants(key: ExpKey): boolean {
  return ['entertainment', 'other'].includes(key);
}

function calcHealthScore(expenses: Record<ExpKey, number>, income: number): number {
  let score = 100;
  for (const key of EXPENSE_KEYS) {
    const pct = income > 0 ? (expenses[key] / income) * 100 : 0;
    const rec = EXPENSE_RECOMMENDED[key];
    if (rec.max && pct > rec.max) score -= (pct - rec.max) * 3;
    if (rec.min && pct < rec.min) score -= (rec.min - pct) * 3;
  }
  const total = Object.values(expenses).reduce((a, b) => a + b, 0);
  if (total > income) score -= 30;
  const savingsPct = income > 0 ? (expenses.savings / income) * 100 : 0;
  if (savingsPct >= 20) score += 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getBudgetStatus(remaining: number, savingsRate: number): string {
  if (remaining < 0) return 'Over Budget';
  if (remaining === 0) return 'Balanced';
  if (savingsRate >= 20) return 'Excellent';
  if (savingsRate >= 15) return 'Good';
  if (savingsRate >= 10) return 'Fair';
  if (savingsRate >= 5) return 'Needs Work';
  return 'Poor';
}

const STATUS_COLORS: Record<string, string> = {
  'Excellent': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'Good': 'text-blue-600 bg-blue-50 border-blue-200',
  'Fair': 'text-amber-600 bg-amber-50 border-amber-200',
  'Needs Work': 'text-orange-600 bg-orange-50 border-orange-200',
  'Poor': 'text-rose-600 bg-rose-50 border-rose-200',
  'Over Budget': 'text-rose-700 bg-rose-100 border-rose-300',
  'Balanced': 'text-slate-600 bg-slate-100 border-slate-200',
};

const incomePresets = [2000, 4000, 6000, 10000, 20000];

export default function BudgetCalculator() {
  const [income, setIncome] = useState(6000);
  const [budgetType, setBudgetType] = useState<BudgetType>('50-30-20');
  const [expenses, setExpenses] = useState<Record<ExpKey, number>>({
    housing: 1800, transportation: 600, food: 600, utilities: 250,
    insurance: 400, healthcare: 200, entertainment: 300, savings: 600, debt: 500, other: 200,
  });

  const setExp = (key: ExpKey, val: number) => setExpenses(prev => ({ ...prev, [key]: Math.max(0, val) }));

  const totalExpenses = useMemo(() => Object.values(expenses).reduce((a, b) => a + b, 0), [expenses]);
  const remaining = income - totalExpenses;
  const savingsRate = income > 0 ? (expenses.savings / income) * 100 : 0;
  const healthScore = useMemo(() => calcHealthScore(expenses, income), [expenses, income]);
  const budgetStatus = getBudgetStatus(remaining, savingsRate);
  const rule = getBudgetRule(budgetType);

  const dti = income > 0 ? (expenses.debt / income) * 100 : 0;

  // For 50/30/20: compute actual needs/wants/savings
  const needsActual = EXPENSE_KEYS.filter(isNeeds).reduce((s, k) => s + expenses[k], 0);
  const wantsActual = EXPENSE_KEYS.filter(isWants).reduce((s, k) => s + expenses[k], 0);
  const savingsActual = expenses.savings + expenses.debt;

  const getHousingAffordability = () => {
    const pct = income > 0 ? (expenses.housing / income) * 100 : 0;
    if (pct <= 25) return { label: 'Excellent', color: 'text-emerald-600' };
    if (pct <= 30) return { label: 'Good', color: 'text-blue-600' };
    if (pct <= 35) return { label: 'Fair', color: 'text-amber-600' };
    return { label: 'Poor', color: 'text-rose-600' };
  };

  const handleReset = () => {
    setIncome(6000);
    setBudgetType('50-30-20');
    setExpenses({ housing: 1800, transportation: 600, food: 600, utilities: 250, insurance: 400, healthcare: 200, entertainment: 300, savings: 600, debt: 500, other: 200 });
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Income &amp; Expenses
          </h3>

          {/* Monthly Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Income</label>
              <input type="number" value={income} onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
            </div>
            <input type="range" min={500} max={100000} step={100} value={income} onChange={(e) => setIncome(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {incomePresets.map((amt) => (
                <button key={amt} type="button" onClick={() => setIncome(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${income === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(amt)}</button>
              ))}
            </div>
          </div>

          {/* Budget Type */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Budget Rule</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {BUDGET_TYPES.map((bt) => (
                <button key={bt.key} type="button" onClick={() => setBudgetType(bt.key)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all ${budgetType === bt.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {bt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium">{BUDGET_TYPES.find(bt => bt.key === budgetType)!.desc}</p>
          </div>

          {/* Expense Categories */}
          <div className="space-y-1">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block mb-2">Expense Categories</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {EXPENSE_KEYS.map((key) => {
                const pct = income > 0 ? (expenses[key] / income) * 100 : 0;
                const rec = EXPENSE_RECOMMENDED[key];
                const overMax = rec.max && pct > rec.max;
                const underMin = rec.min && pct < rec.min;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{EXPENSE_LABELS[key]}</label>
                      <div className="flex items-center space-x-1">
                        <span className="text-slate-400 font-mono text-[10px]">$</span>
                        <input type="number" value={expenses[key]} onChange={(e) => setExp(key, parseInt(e.target.value) || 0)}
                          className="w-20 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${overMax ? 'bg-rose-400' : underMin ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${Math.min(pct / (rec.max || 35) * 100, 100)}%` }} />
                      </div>
                      <span className={`text-[10px] font-mono font-black ${overMax ? 'text-rose-500' : underMin ? 'text-amber-500' : 'text-slate-400'}`}>
                        {fmtPct(pct)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Row */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Total Expenses</span>
              <span className="font-black font-mono text-slate-900">{fmt(totalExpenses)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Remaining</span>
              <span className={`font-black font-mono ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{fmt(remaining)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Savings Rate</span>
              <span className="font-black font-mono text-slate-900">{fmtPct(savingsRate)}</span>
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
            Budget Health
          </h3>

          {/* Black Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">BUDGET</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Budget Status</span>
                <div className={`text-3xl font-black ${remaining >= 0 ? 'text-white' : 'text-rose-400'}`}>{budgetStatus}</div>
                <div className="text-sm text-slate-400 font-mono mt-1">{fmt(remaining)} remaining</div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Expenses</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(totalExpenses)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Savings Rate</span>
                  <span className="font-mono font-black text-base text-emerald-400">{fmtPct(savingsRate)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Health Score</span>
                  <span className="font-mono font-black text-base text-slate-100">{healthScore}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DTI Ratio</span>
                  <span className={`font-mono font-black text-base ${dti > 36 ? 'text-rose-400' : dti > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtPct(dti)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Score Gauge */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Health Score</span>
              <span className={`text-2xl font-black font-mono ${healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{healthScore}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                style={{ width: `${healthScore}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
            </div>
          </div>

          {/* Housing Affordability */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-2">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Housing Affordability</span>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">Housing Cost</span>
              <span className="font-black font-mono text-slate-900">{fmt(expenses.housing)} ({fmtPct(income > 0 ? (expenses.housing / income) * 100 : 0)})</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">Affordability</span>
              <span className={`font-black font-mono ${getHousingAffordability().color}`}>{getHousingAffordability().label}</span>
            </div>
            <div className="text-xs text-slate-400">Recommended max: {fmt(income * 0.3)} (30% of income)</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Category Breakdown
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{budgetType} rule</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">% of Income</th>
                <th className="px-4 py-3">Recommended</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {EXPENSE_KEYS.map((key) => {
                const pct = income > 0 ? (expenses[key] / income) * 100 : 0;
                const rec = EXPENSE_RECOMMENDED[key];
                const overMax = rec.max && pct > rec.max;
                const underMin = rec.min && pct < rec.min;
                const ok = !overMax && !underMin;
                return (
                  <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{EXPENSE_LABELS[key]}</td>
                    <td className="px-4 py-2.5">{fmt(expenses[key])}</td>
                    <td className="px-4 py-2.5">{fmtPct(pct)}</td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {rec.max && rec.min ? `${fmtPct(rec.min)}–${fmtPct(rec.max)}` : rec.max ? `≤ ${fmtPct(rec.max)}` : rec.min ? `≥ ${fmtPct(rec.min)}` : '\u2014'}
                    </td>
                    <td className="px-4 py-2.5 font-black">
                      {ok ? <span className="text-emerald-600">✓ On track</span> : overMax ? <span className="text-rose-500">✗ Over</span> : <span className="text-amber-500">⚠ Under</span>}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr className="bg-slate-50 font-black">
                <td className="px-4 py-3 text-slate-900">Total</td>
                <td className="px-4 py-3 text-slate-900">{fmt(totalExpenses)}</td>
                <td className="px-4 py-3 text-slate-900">{fmtPct(income > 0 ? (totalExpenses / income) * 100 : 0)}</td>
                <td className="px-4 py-3 text-slate-500">—</td>
                <td className="px-4 py-3">{remaining >= 0 ? <span className="text-emerald-600">✓ Balanced</span> : <span className="text-rose-500">✗ Over budget</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Rule Comparison */}
      {rule && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
              <i className="fas fa-pie-chart mr-2 text-slate-400 text-xs"></i>
              {budgetType} Rule — Actual vs Target
            </h4>
            <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
              <table className="w-full text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="px-4 py-3">Bucket</th>
                    <th className="px-4 py-3">Actual</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {budgetType === '50-30-20' && (() => {
                    const rule = { needs: 0.5, wants: 0.3, savings: 0.2 };
                    const actuals = {
                      Needs: income > 0 ? (needsActual / income) * 100 : 0,
                      Wants: income > 0 ? (wantsActual / income) * 100 : 0,
                      'Savings + Debt': income > 0 ? (savingsActual / income) * 100 : 0,
                    };
                    return (Object.entries(actuals) as [string, number][]).map(([bucket, actual]) => {
                      const target = bucket === 'Needs' ? rule.needs * 100 : bucket === 'Wants' ? rule.wants * 100 : rule.savings * 100;
                      const ok = actual <= target + 2; // allow 2% tolerance
                      return (
                        <tr key={bucket} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{bucket}</td>
                          <td className="px-4 py-2.5">{fmtPct(actual)}</td>
                          <td className="px-4 py-2.5 text-slate-400">{fmtPct(target)}</td>
                          <td className="px-4 py-2.5 font-black">{ok ? <span className="text-emerald-600">✓</span> : <span className="text-rose-500">✗</span>}</td>
                        </tr>
                      );
                    });
                  })()}
                  {budgetType === '70-20-10' && (() => {
                    const actuals = {
                      'Living Expenses': income > 0 ? ((totalExpenses - expenses.savings) / income) * 100 : 0,
                      Savings: savingsRate,
                      Investing: 0,
                    };
                    return (Object.entries(actuals) as [string, number][]).map(([bucket, actual]) => {
                      const target = bucket === 'Living Expenses' ? 70 : bucket === 'Savings' ? 20 : 10;
                      const ok = actual <= target + 2 || (bucket !== 'Living Expenses' && actual >= target - 2);
                      return (
                        <tr key={bucket} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{bucket}</td>
                          <td className="px-4 py-2.5">{fmtPct(actual)}</td>
                          <td className="px-4 py-2.5 text-slate-400">{fmtPct(target)}</td>
                          <td className="px-4 py-2.5 font-black">{ok ? <span className="text-emerald-600">✓</span> : <span className="text-rose-500">✗</span>}</td>
                        </tr>
                      );
                    });
                  })()}
                  {budgetType === '60-20-20' && (() => {
                    const actuals = {
                      Expenses: income > 0 ? ((totalExpenses - expenses.savings - expenses.debt) / income) * 100 : 0,
                      Savings: savingsRate,
                      'Debt Payments': dti,
                    };
                    return (Object.entries(actuals) as [string, number][]).map(([bucket, actual]) => {
                      const target = bucket === 'Expenses' ? 60 : 20;
                      const ok = actual <= target + 2 || (bucket !== 'Expenses' && actual >= target - 2);
                      return (
                        <tr key={bucket} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{bucket}</td>
                          <td className="px-4 py-2.5">{fmtPct(actual)}</td>
                          <td className="px-4 py-2.5 text-slate-400">{fmtPct(target)}</td>
                          <td className="px-4 py-2.5 font-black">{ok ? <span className="text-emerald-600">✓</span> : <span className="text-rose-500">✗</span>}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center">
              <i className="fas fa-lightbulb mr-2 text-slate-400 text-xs"></i>
              Recommendations
            </h4>
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3 text-sm">
              {budgetType === '50-30-20' && (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Needs target</span><span className="font-black font-mono">{fmt(income * 0.5)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Wants target</span><span className="font-black font-mono">{fmt(income * 0.3)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Savings target</span><span className="font-black font-mono">{fmt(income * 0.2)}</span></div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-emerald-700 font-black">Rec. Savings</span>
                    <span className={`font-black font-mono ${expenses.savings >= income * 0.2 ? 'text-emerald-600' : 'text-amber-600'}`}>{fmt(income * 0.2)}</span>
                  </div>
                  {expenses.savings < income * 0.2 && (
                    <p className="text-xs text-amber-600 font-bold mt-2">Savings gap: {fmt(income * 0.2 - expenses.savings)}</p>
                  )}
                </>
              )}
              {budgetType === '70-20-10' && (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Living target</span><span className="font-black font-mono">{fmt(income * 0.7)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Savings target</span><span className="font-black font-mono">{fmt(income * 0.2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Investing target</span><span className="font-black font-mono">{fmt(income * 0.1)}</span></div>
                </>
              )}
              {budgetType === '60-20-20' && (
                <>
                  <div className="flex justify-between"><span className="text-slate-500">Expenses target</span><span className="font-black font-mono">{fmt(income * 0.6)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Savings target</span><span className="font-black font-mono">{fmt(income * 0.2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Debt target</span><span className="font-black font-mono">{fmt(income * 0.2)}</span></div>
                </>
              )}
              {remaining < 0 && (
                <p className="text-xs text-rose-600 font-bold mt-2">Expenses exceed income by {fmt(Math.abs(remaining))}. Consider reducing non-essential categories.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
