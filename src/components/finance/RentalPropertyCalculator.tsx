'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => `${val.toFixed(2)}%`;

function monthlyMortgage(loan: number, rate: number, years: number): number {
  if (loan <= 0) return 0;
  const mr = rate / 100 / 12;
  const n = years * 12;
  if (mr === 0) return loan / n;
  return (loan * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

function remainingBalance(loan: number, payment: number, rate: number, paid: number): number {
  if (loan <= 0) return 0;
  const mr = rate / 100 / 12;
  if (mr === 0) return Math.max(0, loan - payment * paid);
  return Math.max(0, loan * Math.pow(1 + mr, paid) - payment * ((Math.pow(1 + mr, paid) - 1) / mr));
}

const pricePresets = [100000, 250000, 500000, 1000000, 2000000];
const loanTermPresets = [15, 20, 30];
const holdPresets = [5, 10, 15, 20, 30];
const rentPresets = [500, 1000, 1500, 2500, 5000];

const BENCHMARKS = {
  cashOnCashReturn: { excellent: 12, good: 8, fair: 6, poor: 4 },
  capRate: { excellent: 8, good: 6, fair: 4, poor: 2 },
  vacancyRate: { excellent: 3, good: 5, fair: 8, poor: 12 },
  expenseRatio: { excellent: 35, good: 45, fair: 55, poor: 65 },
  dscr: { excellent: 1.5, good: 1.25, fair: 1.1, poor: 1.0 },
};

type BenchmarkKey = keyof typeof BENCHMARKS;

function benchmarkStatus(key: BenchmarkKey, val: number): { label: string; color: string } {
  const b = BENCHMARKS[key];
  if (key === 'vacancyRate' || key === 'expenseRatio') {
    if (val <= b.excellent) return { label: 'Excellent', color: 'text-emerald-600' };
    if (val <= b.good) return { label: 'Good', color: 'text-blue-600' };
    if (val <= b.fair) return { label: 'Fair', color: 'text-amber-600' };
    return { label: 'Poor', color: 'text-rose-600' };
  }
  // higher is better
  if (val >= b.excellent) return { label: 'Excellent', color: 'text-emerald-600' };
  if (val >= b.good) return { label: 'Good', color: 'text-blue-600' };
  if (val >= b.fair) return { label: 'Fair', color: 'text-amber-600' };
  return { label: 'Poor', color: 'text-rose-600' };
}

interface ProjectionRow {
  year: number; rent: number; opEx: number; noi: number; mortgage: number; cashFlow: number; propValue: number; equity: number;
}

export default function RentalPropertyCalculator() {
  const [price, setPrice] = useState(300000);
  const [useLoan, setUseLoan] = useState(true);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(30);
  const [closingCost, setClosingCost] = useState(5000);
  const [needRepairs, setNeedRepairs] = useState(false);
  const [repairCost, setRepairCost] = useState(30000);
  const [valueAfterRepair, setValueAfterRepair] = useState(350000);
  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [vacancyRate, setVacancyRate] = useState(5);
  const [mgmtFee, setMgmtFee] = useState(8);
  const [propTax, setPropTax] = useState(3600);
  const [ins, setIns] = useState(1200);
  const [maintenance, setMaintenance] = useState(1500);
  const [knowSell, setKnowSell] = useState(false);
  const [sellPrice, setSellPrice] = useState(400000);
  const [appreciation, setAppreciation] = useState(3);
  const [holding, setHolding] = useState(10);
  const [costToSell, setCostToSell] = useState(6);

  const effectiveValue = needRepairs ? valueAfterRepair : price;
  const totalUpfront = (useLoan ? price * (downPct / 100) : price) + closingCost + (needRepairs ? repairCost : 0);
  const loanAmount = useLoan ? price * (1 - downPct / 100) : 0;
  const monthMort = monthlyMortgage(loanAmount, rate, loanYears);
  const annualMort = monthMort * 12;

  const annualRent = monthlyRent * 12;
  const egi = annualRent * (1 - vacancyRate / 100);
  const mgmtAmount = egi * (mgmtFee / 100);
  const annualOpEx = propTax + ins + maintenance + mgmtAmount;
  const monthOpEx = annualOpEx / 12;
  const noi = egi - annualOpEx;
  const monthCashFlow = monthlyRent * (1 - vacancyRate / 100) - monthOpEx - (useLoan ? monthMort : 0);
  const annualCashFlow = monthCashFlow * 12;
  const cocReturn = totalUpfront > 0 ? (annualCashFlow / totalUpfront) * 100 : 0;
  const capRate = effectiveValue > 0 ? (noi / effectiveValue) * 100 : 0;
  const dscr = annualMort > 0 ? noi / annualMort : 0;
  const expenseRatio = egi > 0 ? (annualOpEx / egi) * 100 : 0;

  const futureVal = knowSell ? sellPrice : effectiveValue * Math.pow(1 + appreciation / 100, holding);
  const remainingBal = remainingBalance(loanAmount, monthMort, rate, holding * 12);
  const eq = futureVal - remainingBal;
  const sellCosts = futureVal * (costToSell / 100);
  const profitSale = eq - sellCosts - totalUpfront;
  const totalCF = annualCashFlow * holding;
  const totalReturn = totalCF + profitSale;
  const annReturn = (totalUpfront > 0 && holding > 0)
    ? (Math.pow((totalReturn + totalUpfront) / totalUpfront, 1 / holding) - 1) * 100
    : 0;

  const breakEvenRent = useLoan
    ? (monthOpEx + monthMort) / (1 - vacancyRate / 100)
    : monthOpEx / (1 - vacancyRate / 100);

  const projection: ProjectionRow[] = useMemo(() => {
    const rows: ProjectionRow[] = [];
    let curRent = monthlyRent;
    let curValue = effectiveValue;
    let cumCF = 0;
    for (let y = 1; y <= holding; y++) {
      const yrRent = curRent * 12;
      const yrEgi = yrRent * (1 - vacancyRate / 100);
      const yrMgmt = yrEgi * (mgmtFee / 100);
      const yrOpEx = propTax * Math.pow(1.02, y - 1) + ins * Math.pow(1.02, y - 1) + maintenance * Math.pow(1.02, y - 1) + yrMgmt;
      const yrNoi = yrEgi - yrOpEx;
      const yrCF = yrNoi - annualMort;
      cumCF += yrCF;
      curValue = knowSell ? (y === holding ? sellPrice : curValue * (1 + appreciation / 100)) : curValue * (1 + appreciation / 100);
      const bal = remainingBalance(loanAmount, monthMort, rate, y * 12);
      rows.push({ year: y, rent: yrRent, opEx: yrOpEx, noi: yrNoi, mortgage: annualMort, cashFlow: cumCF, propValue: curValue, equity: curValue - bal });
      curRent *= 1.03; // 3% annual rent growth
    }
    return rows;
  }, [monthlyRent, vacancyRate, mgmtFee, propTax, ins, maintenance, appreciation, holding, knowSell, sellPrice, effectiveValue, loanAmount, monthMort, rate, annualMort]);

  const handleReset = () => {
    setPrice(300000); setUseLoan(true); setDownPct(20); setRate(6.5); setLoanYears(30); setClosingCost(5000);
    setNeedRepairs(false); setRepairCost(30000); setValueAfterRepair(350000);
    setMonthlyRent(2500); setVacancyRate(5); setMgmtFee(8); setPropTax(3600); setIns(1200); setMaintenance(1500);
    setKnowSell(false); setSellPrice(400000); setAppreciation(3); setHolding(10); setCostToSell(6);
  };

  const benchRow = (key: BenchmarkKey, label: string, val: number, unit: string) => {
    const s = benchmarkStatus(key, val);
    return { label, val, unit, status: s.label, color: s.color };
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Property Details
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Purchase Price</label>
              <input type="number" value={price} onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
            </div>
            <input type="range" min={10000} max={10000000} step={5000} value={price} onChange={(e) => setPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {pricePresets.map((a) => (
                <button key={a} type="button" onClick={() => setPrice(a)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${price === a ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {fmt(a)}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Financing</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {[{ k: true, l: 'Use Loan' }, { k: false, l: 'Cash Purchase' }].map((o) => (
                <button key={String(o.k)} type="button" onClick={() => setUseLoan(o.k)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all ${useLoan === o.k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{o.l}</button>
              ))}
            </div>
            {useLoan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Down Payment</label>
                  <div className="flex items-center space-x-1">
                    <input type="number" value={downPct} onChange={(e) => setDownPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={downPct} onChange={(e) => setDownPct(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Interest Rate</label>
                  <div className="flex items-center space-x-1">
                    <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                  <input type="range" min={0} max={30} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Loan Term</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
                    {loanTermPresets.map((t) => (
                      <button key={t} type="button" onClick={() => setLoanYears(t)}
                        className={`py-1.5 rounded-md text-[11px] font-extrabold transition-all ${loanYears === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                        {t}y</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400">Closing Costs</span>
              <span className="text-slate-400 font-mono text-[10px]">$</span>
              <input type="number" value={closingCost} onChange={(e) => setClosingCost(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Repairs</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {[{ k: false, l: 'Move-in Ready' }, { k: true, l: 'Needs Repairs' }].map((o) => (
                <button key={String(o.k)} type="button" onClick={() => setNeedRepairs(o.k)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all ${needRepairs === o.k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{o.l}</button>
              ))}
            </div>
            {needRepairs && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Repair Cost</label>
                  <input type="number" value={repairCost} onChange={(e) => setRepairCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Value After Repairs</label>
                  <input type="number" value={valueAfterRepair} onChange={(e) => setValueAfterRepair(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Income &amp; Expenses</label>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Monthly Rent</label>
                <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
              <input type="range" min={100} max={50000} step={50} value={monthlyRent} onChange={(e) => setMonthlyRent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="flex space-x-1.5">
                {rentPresets.map((a) => (
                  <button key={a} type="button" onClick={() => setMonthlyRent(a)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${monthlyRent === a ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                    {fmt(a)}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Vacancy Rate</label>
                <div className="flex items-center space-x-1">
                  <input type="number" value={vacancyRate} onChange={(e) => setVacancyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
                <input type="range" min={0} max={20} step={0.5} value={vacancyRate} onChange={(e) => setVacancyRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Mgmt Fee</label>
                <div className="flex items-center space-x-1">
                  <input type="number" value={mgmtFee} onChange={(e) => setMgmtFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
                <input type="range" min={0} max={15} step={0.5} value={mgmtFee} onChange={(e) => setMgmtFee(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Prop Tax</label>
                <input type="number" value={propTax} onChange={(e) => setPropTax(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Insurance</label>
                <input type="number" value={ins} onChange={(e) => setIns(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Maintenance</label>
                <input type="number" value={maintenance} onChange={(e) => setMaintenance(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Sale Projection</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              {[{ k: false, l: 'Use Appreciation %' }, { k: true, l: 'Known Sale Price' }].map((o) => (
                <button key={String(o.k)} type="button" onClick={() => setKnowSell(o.k)}
                  className={`py-2 rounded-lg text-xs font-extrabold transition-all ${knowSell === o.k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{o.l}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {knowSell ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Future Sale Price</label>
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Appreciation Rate</label>
                  <div className="flex items-center space-x-1">
                    <input type="number" step="0.1" value={appreciation} onChange={(e) => setAppreciation(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                  <input type="range" min={0} max={20} step={0.1} value={appreciation} onChange={(e) => setAppreciation(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400">Cost to Sell</label>
                <div className="flex items-center space-x-1">
                  <input type="number" value={costToSell} onChange={(e) => setCostToSell(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
                <input type="range" min={0} max={15} step={0.5} value={costToSell} onChange={(e) => setCostToSell(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400">Holding Period</label>
              <div className="grid grid-cols-5 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
                {holdPresets.map((t) => (
                  <button key={t} type="button" onClick={() => setHolding(t)}
                    className={`py-1.5 rounded-md text-[11px] font-extrabold transition-all ${holding === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {t}y</button>
                ))}
              </div>
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
            Investment Summary
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">RENTAL</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Monthly Cash Flow</span>
                <div className={`text-4xl font-black font-mono ${monthCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(monthCashFlow)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  {useLoan ? `${fmt(monthMort)} mortgage` : 'No mortgage'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cash-on-Cash</span>
                  <span className={`font-mono font-black text-base ${cocReturn >= 8 ? 'text-emerald-400' : cocReturn >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {fmtPct(cocReturn)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Return</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(totalReturn)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annualized Return</span>
                  <span className={`font-mono font-black text-base ${annReturn >= 10 ? 'text-emerald-400' : annReturn >= 5 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {fmtPct(annReturn)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Upfront</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(totalUpfront)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Income Summary</span>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Effective Gross Income</span><span className="font-black font-mono text-slate-900">{fmt(egi)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Operating Expenses</span><span className="font-black font-mono text-rose-500">{fmt(annualOpEx)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500 font-bold">Net Operating Income</span><span className={`font-black font-mono text-lg ${noi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(noi)}</span></div>
          </div>
          {useLoan && (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Mortgage Details</span>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Loan Amount</span><span className="font-black font-mono text-slate-900">{fmt(loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Monthly Payment</span><span className="font-black font-mono text-slate-900">{fmt(monthMort)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Remaining at Sale</span><span className="font-black font-mono text-slate-900">{fmt(remainingBal)}</span></div>
            </div>
          )}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Sale Proceeds</span>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Future Value</span><span className="font-black font-mono text-slate-900">{fmt(futureVal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Equity</span><span className="font-black font-mono text-slate-900">{fmt(eq)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Selling Costs</span><span className="font-black font-mono text-rose-500">{fmt(sellCosts)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500 font-bold">Profit on Sale</span><span className={`font-black font-mono text-lg ${profitSale >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(profitSale)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Total Cash Flow</span><span className={`font-black font-mono ${totalCF >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(totalCF)}</span></div>
          </div>
        </div>
      </div>

      {/* Operating Expenses Breakdown */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-receipt mr-2 text-slate-400 text-sm"></i>
            Operating Expenses Breakdown
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Annual Amount</th>
                <th className="px-4 py-3">% of EGI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                { label: 'Property Tax', val: propTax },
                { label: 'Insurance', val: ins },
                { label: 'Maintenance', val: maintenance },
                { label: 'Management Fee', val: mgmtAmount },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                  <td className="px-4 py-2.5">{fmt(row.val)}</td>
                  <td className="px-4 py-2.5 text-slate-500">{fmtPct(egi > 0 ? (row.val / egi) * 100 : 0)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black">
                <td className="px-4 py-3 text-slate-900">Total Expenses</td>
                <td className="px-4 py-3 text-rose-600">{fmt(annualOpEx)}</td>
                <td className="px-4 py-3 text-slate-900">{fmtPct(egi > 0 ? (annualOpEx / egi) * 100 : 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Ratios with Benchmarks */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-chart-line mr-2 text-slate-400 text-sm"></i>
            Key Ratios &amp; Benchmarks
          </h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[600px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Your Value</th>
                <th className="px-4 py-3">Excellent</th>
                <th className="px-4 py-3">Good</th>
                <th className="px-4 py-3">Fair</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {[
                benchRow('cashOnCashReturn', 'Cash-on-Cash Return', cocReturn, '%'),
                benchRow('capRate', 'Cap Rate', capRate, '%'),
                benchRow('vacancyRate', 'Vacancy Rate', vacancyRate, '%'),
                benchRow('expenseRatio', 'Expense Ratio', expenseRatio, '%'),
                benchRow('dscr', 'DSCR', dscr, ''),
              ].map((row) => {
                const b = BENCHMARKS[row.label === 'Cash-on-Cash Return' ? 'cashOnCashReturn' : row.label === 'Cap Rate' ? 'capRate' : row.label === 'Vacancy Rate' ? 'vacancyRate' : row.label === 'Expense Ratio' ? 'expenseRatio' : 'dscr' as BenchmarkKey];
                return (
                  <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{row.label}</td>
                    <td className="px-4 py-2.5 font-black text-slate-900">{row.unit === '%' ? fmtPct(row.val) : row.val.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-emerald-600">{row.unit === '%' ? `${b.excellent}%` : b.excellent.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-blue-600">{row.unit === '%' ? `${b.good}%` : b.good.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-amber-600">{row.unit === '%' ? `${b.fair}%` : b.fair.toFixed(2)}</td>
                    <td className={`px-4 py-2.5 font-black ${row.color}`}>{row.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500">
          <span className="font-bold">Break-even rent: </span>
          <span className="font-mono font-black text-slate-900">{fmt(breakEvenRent)}</span>
          <span className="ml-2">/mo (current rent: {fmt(monthlyRent)})</span>
        </div>
      </div>

      {/* Year-by-Year Projection */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-calendar-alt mr-2 text-slate-400 text-sm"></i>
            Year-by-Year Projection
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{holding} years</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-96">
          <table className="w-full min-w-[700px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-3 py-3">Year</th>
                <th className="px-3 py-3">Rent</th>
                <th className="px-3 py-3">OpEx</th>
                <th className="px-3 py-3">NOI</th>
                <th className="px-3 py-3">Mortgage</th>
                <th className="px-3 py-3">Cum. CF</th>
                <th className="px-3 py-3">Prop Value</th>
                <th className="px-3 py-3">Equity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {projection.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2 font-bold text-slate-900">{row.year}</td>
                  <td className="px-3 py-2">{fmt(row.rent)}</td>
                  <td className="px-3 py-2 text-rose-500">{fmt(row.opEx)}</td>
                  <td className={`px-3 py-2 font-bold ${row.noi >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>{fmt(row.noi)}</td>
                  <td className="px-3 py-2 text-slate-500">{useLoan ? fmt(row.mortgage) : '\u2014'}</td>
                  <td className={`px-3 py-2 font-black ${row.cashFlow >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{fmt(row.cashFlow)}</td>
                  <td className="px-3 py-2">{fmt(row.propValue)}</td>
                  <td className="px-3 py-2 font-black text-slate-900">{fmt(row.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
