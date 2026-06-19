'use client';

import React, { useState, useMemo, useEffect } from 'react';

type MarketKey = 'US' | 'UK' | 'UAE' | 'India' | 'Canada' | 'Australia';

interface MarketData {
  closingCostsPct: number;
  expenseRatePct: number;
  appreciationPct: number;
  sellingCostsPct: number;
  vacancyRatePct: number;
  capRange: [number, number];
  cocRange: [number, number];
  currency: string;
  locale: string;
  symbol: string;
}

const MARKET_DATA: Record<MarketKey, MarketData> = {
  US: { closingCostsPct: 3, expenseRatePct: 1.5, appreciationPct: 4, sellingCostsPct: 6, vacancyRatePct: 5, capRange: [4, 8], cocRange: [6, 10], currency: 'USD', locale: 'en-US', symbol: '$' },
  UK: { closingCostsPct: 5, expenseRatePct: 1, appreciationPct: 3, sellingCostsPct: 2, vacancyRatePct: 4, capRange: [3, 6], cocRange: [4, 8], currency: 'GBP', locale: 'en-GB', symbol: '\u00A3' },
  UAE: { closingCostsPct: 4, expenseRatePct: 1, appreciationPct: 7, sellingCostsPct: 2, vacancyRatePct: 5, capRange: [5, 8], cocRange: [6, 12], currency: 'AED', locale: 'ar-AE', symbol: '\u062F.\u0625' },
  India: { closingCostsPct: 6, expenseRatePct: 1.2, appreciationPct: 6, sellingCostsPct: 1, vacancyRatePct: 3, capRange: [3, 6], cocRange: [4, 8], currency: 'INR', locale: 'en-IN', symbol: '\u20B9' },
  Canada: { closingCostsPct: 3, expenseRatePct: 1.3, appreciationPct: 4, sellingCostsPct: 5, vacancyRatePct: 4, capRange: [4, 7], cocRange: [5, 9], currency: 'CAD', locale: 'en-CA', symbol: 'C$' },
  Australia: { closingCostsPct: 4, expenseRatePct: 1.5, appreciationPct: 5, sellingCostsPct: 3, vacancyRatePct: 3, capRange: [4, 7], cocRange: [5, 9], currency: 'AUD', locale: 'en-AU', symbol: 'A$' },
};

const MARKET_KEYS: MarketKey[] = ['US', 'UK', 'UAE', 'India', 'Canada', 'Australia'];

const fmt = (val: number, market?: MarketData) => {
  if (!market) market = MARKET_DATA.US;
  return new Intl.NumberFormat(market.locale, { style: 'currency', currency: market.currency, maximumFractionDigits: 0 }).format(val);
};

const fmtPct = (val: number) => val.toFixed(2) + '%';

const monthlyPayment = (principal: number, annualRate: number, years: number) => {
  if (principal <= 0 || annualRate <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
};

const remainingBalance = (principal: number, annualRate: number, monthlyPmt: number, paymentsMade: number) => {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.max(0, principal - monthlyPmt * paymentsMade);
  return Math.max(0, principal * Math.pow(1 + r, paymentsMade) - monthlyPmt * (Math.pow(1 + r, paymentsMade) - 1) / r);
};

interface GeneralResult {
  totalInvested: number;
  totalReturn: number;
  netProfit: number;
  roiPct: number;
  annualizedRoi: number;
}

interface RealEstateResult {
  totalInvestment: number;
  downPaymentAmount: number;
  loanAmount: number;
  monthlyMortgage: number;
  annualMortgage: number;
  annualRent: number;
  effectiveRent: number;
  annualExpenses: number;
  noi: number;
  annualCashFlow: number;
  monthlyCashFlow: number;
  capRate: number;
  cashOnCash: number;
  futureValue: number;
  remainingLoan: number;
  saleProceeds: number;
  totalRentCollected: number;
  totalCashFlow: number;
  totalReturn: number;
  netProfit: number;
  roiPct: number;
  annualizedRoi: number;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const quickPrice = [150000, 300000, 500000, 1000000];
const quickDownPayment = [10, 20, 25, 30];

export default function ROICalculator() {
  const [mode, setMode] = useState<'general' | 'real-estate'>('general');

  // General
  const [initialInvestment, setInitialInvestment] = useState(50000);
  const [finalValue, setFinalValue] = useState(75000);
  const [genHoldingPeriod, setGenHoldingPeriod] = useState(5);
  const [additionalContrib, setAdditionalContrib] = useState(0);

  // Real Estate
  const [market, setMarket] = useState<MarketKey>('US');
  const [pp, setPp] = useState(300000);
  const [dp, setDp] = useState(20);
  const [cc, setCc] = useState(9000);
  const [reno, setReno] = useState(10000);
  const [rent, setRent] = useState(2000);
  const [apprec, setApprec] = useState(4);
  const [expRate, setExpRate] = useState(1.5);
  const [sellCost, setSellCost] = useState(6);
  const [vacRate, setVacRate] = useState(5);
  const [intRate, setIntRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [reYears, setReYears] = useState(5);

  // When market changes, auto-fill defaults
  useEffect(() => {
    const m = MARKET_DATA[market];
    setCc(pp * m.closingCostsPct / 100);
    setApprec(m.appreciationPct);
    setExpRate(m.expenseRatePct);
    setSellCost(m.sellingCostsPct);
    setVacRate(m.vacancyRatePct);
  }, [market]);

  const mkt = MARKET_DATA[market];

  const genResult = useMemo<GeneralResult>(() => {
    const totalInv = initialInvestment + additionalContrib * genHoldingPeriod;
    const totalRet = finalValue;
    const profit = totalRet - totalInv;
    const roi = totalInv > 0 ? (profit / totalInv) * 100 : 0;
    const annRoi = totalInv > 0 && genHoldingPeriod > 0 ? (Math.pow(totalRet / totalInv, 1 / genHoldingPeriod) - 1) * 100 : 0;
    return { totalInvested: totalInv, totalReturn: totalRet, netProfit: profit, roiPct: roi, annualizedRoi: annRoi };
  }, [initialInvestment, finalValue, genHoldingPeriod, additionalContrib]);

  const reResult = useMemo<RealEstateResult>(() => {
    const dpAmt = pp * (dp / 100);
    const loanAmt = pp - dpAmt;
    const totalInv = dpAmt + cc + reno;
    const mPmt = monthlyPayment(loanAmt, intRate, loanTerm);
    const aMortgage = mPmt * 12;
    const aRent = rent * 12;
    const effRent = aRent * (1 - vacRate / 100);
    const aExp = pp * expRate / 100;
    const noi = effRent - aExp;
    const aCf = noi - aMortgage;
    const mCf = aCf / 12;
    const cap = pp > 0 ? (noi / pp) * 100 : 0;
    const coc = totalInv > 0 ? (aCf / totalInv) * 100 : 0;
    const fv = pp * Math.pow(1 + apprec / 100, reYears);
    const remBal = remainingBalance(loanAmt, intRate, mPmt, reYears * 12);
    const saleProc = fv * (1 - sellCost / 100) - remBal;
    const totalRentColl = effRent * reYears;
    const totalCf = aCf * reYears;
    const totalRet = saleProc + totalRentColl;
    const profit = totalRet - totalInv;
    const roi = totalInv > 0 ? (profit / totalInv) * 100 : 0;
    const annRoi = totalInv > 0 && reYears > 0 && (totalRet / totalInv) > 0 ? (Math.pow(totalRet / totalInv, 1 / reYears) - 1) * 100 : 0;
    return {
      totalInvestment: totalInv, downPaymentAmount: dpAmt, loanAmount: loanAmt,
      monthlyMortgage: mPmt, annualMortgage: aMortgage, annualRent: aRent,
      effectiveRent: effRent, annualExpenses: aExp, noi, annualCashFlow: aCf,
      monthlyCashFlow: mCf, capRate: cap, cashOnCash: coc, futureValue: fv,
      remainingLoan: remBal, saleProceeds: saleProc, totalRentCollected: totalRentColl,
      totalCashFlow: totalCf, totalReturn: totalRet, netProfit: profit, roiPct: roi, annualizedRoi: annRoi,
    };
  }, [pp, dp, cc, reno, rent, apprec, expRate, sellCost, vacRate, intRate, loanTerm, reYears]);

  const handleReset = () => {
    setMode('general');
    setInitialInvestment(50000); setFinalValue(75000); setGenHoldingPeriod(5); setAdditionalContrib(0);
    setMarket('US'); setPp(300000); setDp(20); setCc(9000); setReno(10000);
    setRent(2000); setApprec(4); setExpRate(1.5); setSellCost(6); setVacRate(5);
    setIntRate(6.5); setLoanTerm(30); setReYears(5);
  };

  const inBenchmark = (val: number, range: [number, number]) => val >= range[0] && val <= range[1];

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {(['general', 'real-estate'] as const).map((opt) => (
            <button key={opt} type="button" onClick={() => setMode(opt)}
              className={`px-6 py-2 rounded-lg text-sm font-extrabold transition-all ${mode === opt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {opt === 'general' ? 'General ROI' : 'Real Estate'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">

          {mode === 'general' ? (
            <>
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
                <input type="range" min={0} max={1000000} step={1000} value={initialInvestment} onChange={(e) => setInitialInvestment(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-2">
                  {[0, 10000, 50000, 100000, 500000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setInitialInvestment(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${initialInvestment === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {amt === 0 ? '$0' : formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Value */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Final / Current Value</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">$</span>
                    <input type="number" value={finalValue} onChange={(e) => setFinalValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={5000000} step={1000} value={finalValue} onChange={(e) => setFinalValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>

              {/* Holding Period + Additional Contributions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Holding Period</label>
                    <span className="font-mono text-sm font-black text-slate-700">{genHoldingPeriod} yr</span>
                  </div>
                  <input type="range" min={1} max={50} step={1} value={genHoldingPeriod} onChange={(e) => setGenHoldingPeriod(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Additions</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-sm">$</span>
                      <input type="number" value={additionalContrib} onChange={(e) => setAdditionalContrib(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    </div>
                  </div>
                  <input type="range" min={0} max={100000} step={1000} value={additionalContrib} onChange={(e) => setAdditionalContrib(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
                Property Details
              </h3>

              {/* Market Selector */}
              <div className="space-y-2">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Market</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                  {MARKET_KEYS.map((k) => (
                    <button key={k} type="button" onClick={() => setMarket(k)}
                      className={`py-2 rounded-lg text-xs font-extrabold transition-all ${market === k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Property Price</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">{mkt.symbol}</span>
                    <input type="number" value={pp} onChange={(e) => setPp(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={10000} max={5000000} step={5000} value={pp} onChange={(e) => setPp(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-2">
                  {quickPrice.map((amt) => (
                    <button key={amt} type="button" onClick={() => { setPp(amt); setCc(Math.round(amt * mkt.closingCostsPct / 100)); }}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${pp === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt, mkt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Payment + Closing Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Down Payment</label>
                    <div className="flex items-center space-x-1">
                      <input type="number" min={0} max={100} value={dp} onChange={(e) => setDp(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={dp} onChange={(e) => setDp(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <div className="flex space-x-2">
                    {quickDownPayment.map((pct) => (
                      <button key={pct} type="button" onClick={() => setDp(pct)}
                        className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${dp === pct ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                        {pct}%
                      </button>
                    ))}
                  </div>
                  {dp < 100 && (
                    <div className="text-xs text-slate-400 font-mono">
                      Loan: {fmt(pp - pp * dp / 100, mkt)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Closing Costs</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-sm">{mkt.symbol}</span>
                      <input type="number" value={cc} onChange={(e) => setCc(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    </div>
                  </div>
                  <input type="range" min={0} max={pp * 0.15} step={500} value={cc} onChange={(e) => setCc(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <div className="text-xs text-slate-400 font-mono">
                    Default: {mkt.closingCostsPct}% of price ({fmt(pp * mkt.closingCostsPct / 100, mkt)})
                  </div>
                </div>
              </div>

              {/* Renovation Costs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Renovation Costs</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">{mkt.symbol}</span>
                    <input type="number" value={reno} onChange={(e) => setReno(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={200000} step={1000} value={reno} onChange={(e) => setReno(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-2">
                  {[0, 10000, 25000, 50000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setReno(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${reno === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {amt === 0 ? '$0' : formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
                Income & Financing
              </h3>

              {/* Monthly Rent */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Rent</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">{mkt.symbol}</span>
                    <input type="number" value={rent} onChange={(e) => setRent(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={50000} step={100} value={rent} onChange={(e) => setRent(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-2">
                  {[1000, 2000, 3500, 5000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setRent(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${rent === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt, mkt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan Details - only show if DP < 100% */}
              {dp < 100 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Interest Rate</label>
                      <div className="flex items-center space-x-1">
                        <input type="number" step={0.25} min={0} max={20} value={intRate}
                          onChange={(e) => setIntRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                        <span className="text-sm font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={20} step={0.25} value={intRate} onChange={(e) => setIntRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Loan Term</label>
                      <span className="font-mono text-sm font-black text-slate-700">{loanTerm} yr</span>
                    </div>
                    <input type="range" min={5} max={40} step={5} value={loanTerm} onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="flex space-x-2">
                      {[15, 20, 25, 30].map((t) => (
                        <button key={t} type="button" onClick={() => setLoanTerm(t)}
                          className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${loanTerm === t ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                          {t} yr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Market Assumptions (collapsible) */}
              <details className="bg-slate-50/50 border border-slate-100 rounded-3xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 text-sm font-extrabold uppercase tracking-wider text-slate-500 hover:bg-slate-50/80 transition-all cursor-pointer">
                  <span className="flex items-center"><i className="fas fa-sliders-h mr-2 text-slate-400"></i>Market Assumptions ({market})</span>
                  <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                </summary>
                <div className="px-4 pb-4 space-y-4 text-sm animate-fade-in-up">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600">Annual Appreciation</label>
                      <div className="flex items-center space-x-1">
                        <input type="number" step={0.5} min={0} max={20} value={apprec}
                          onChange={(e) => setApprec(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-bold focus:outline-none" />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={20} step={0.5} value={apprec} onChange={(e) => setApprec(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="text-[10px] text-slate-400 font-mono">{mkt.appreciationPct}%/yr {market} default</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600">Annual Expense Rate</label>
                      <div className="flex items-center space-x-1">
                        <input type="number" step={0.1} min={0} max={10} value={expRate}
                          onChange={(e) => setExpRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-bold focus:outline-none" />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={10} step={0.1} value={expRate} onChange={(e) => setExpRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="text-[10px] text-slate-400 font-mono">{mkt.expenseRatePct}% {market} default (taxes + insurance + maintenance)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600">Vacancy Rate</label>
                      <div className="flex items-center space-x-1">
                        <input type="number" step={0.5} min={0} max={20} value={vacRate}
                          onChange={(e) => setVacRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-bold focus:outline-none" />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={20} step={0.5} value={vacRate} onChange={(e) => setVacRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600">Selling Costs</label>
                      <div className="flex items-center space-x-1">
                        <input type="number" step={0.5} min={0} max={15} value={sellCost}
                          onChange={(e) => setSellCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-16 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-bold focus:outline-none" />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                    <input type="range" min={0} max={15} step={0.5} value={sellCost} onChange={(e) => setSellCost(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="text-[10px] text-slate-400 font-mono">{mkt.sellingCostsPct}% {market} default e.g. realtor commissions, transfer taxes</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-600">Holding Period</label>
                      <span className="font-mono text-sm font-black text-slate-700">{reYears} yr</span>
                    </div>
                    <input type="range" min={1} max={30} step={1} value={reYears} onChange={(e) => setReYears(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  </div>
                </div>
              </details>
            </>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">{mode === 'general' ? '2' : '3'}</span>
            {mode === 'general' ? 'ROI Results' : 'Investment Returns'}
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">{mode === 'general' ? 'ROI' : '🏠'}</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              {mode === 'general' ? (
                <>
                  <div className="text-center pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total ROI</span>
                    <div className="text-5xl font-black text-white font-mono">
                      {genResult.roiPct.toFixed(2)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annualized ROI</span>
                      <span className="font-mono font-black text-base text-emerald-400">{genResult.annualizedRoi.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Profit</span>
                      <span className="font-mono font-black text-base text-slate-100">{formatCurrency(genResult.netProfit)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Invested</span>
                      <span className="font-mono font-black text-base text-slate-100">{formatCurrency(genResult.totalInvested)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Return</span>
                      <span className="font-mono font-black text-base text-cyan-400">{formatCurrency(genResult.totalReturn)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center pb-3 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Total ROI</span>
                    <div className="text-5xl font-black text-white font-mono">
                      {reResult.roiPct.toFixed(2)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annualized ROI</span>
                      <span className="font-mono font-black text-base text-emerald-400">{reResult.annualizedRoi.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Profit</span>
                      <span className="font-mono font-black text-base text-slate-100">{fmt(reResult.netProfit, mkt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Investment</span>
                      <span className="font-mono font-black text-base text-slate-100">{fmt(reResult.totalInvestment, mkt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Cash Flow</span>
                      <span className={`font-mono font-black text-base ${reResult.monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {fmt(reResult.monthlyCashFlow, mkt)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Breakdown Panel */}
          {mode === 'general' ? (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Return Breakdown</span>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Initial Investment</span>
                  <span className="font-black font-mono text-slate-900">{formatCurrency(initialInvestment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Additions</span>
                  <span className="font-black font-mono text-slate-900">{formatCurrency(additionalContrib * genHoldingPeriod)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                  <span className="text-slate-700 font-black">Total Invested</span>
                  <span className="font-black font-mono text-lg text-slate-900">{formatCurrency(genResult.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Return</span>
                  <span className="font-black font-mono text-cyan-600">{formatCurrency(genResult.totalReturn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Net Profit</span>
                  <span className={`font-black font-mono ${genResult.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {formatCurrency(genResult.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Real Estate Breakdown */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Property Performance</span>
                <div className="space-y-2.5 text-sm">
                  {/* Cap Rate with Benchmark */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      Cap Rate
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${inBenchmark(reResult.capRate, mkt.capRange) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inBenchmark(reResult.capRate, mkt.capRange) ? '\u2713' : '\u2717'}
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-black font-mono text-slate-900">{reResult.capRate.toFixed(2)}%</span>
                      <span className="text-[10px] text-slate-400 block">Market: {mkt.capRange[0]}-{mkt.capRange[1]}%</span>
                    </div>
                  </div>
                  {/* Cash-on-Cash with Benchmark */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold flex items-center gap-1.5">
                      Cash-on-Cash
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${inBenchmark(reResult.cashOnCash, mkt.cocRange) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inBenchmark(reResult.cashOnCash, mkt.cocRange) ? '\u2713' : '\u2717'}
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-black font-mono text-slate-900">{reResult.cashOnCash.toFixed(2)}%</span>
                      <span className="text-[10px] text-slate-400 block">Market: {mkt.cocRange[0]}-{mkt.cocRange[1]}%</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-2.5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">NOI (Annual)</span>
                      <span className="font-black font-mono text-slate-900">{fmt(reResult.noi, mkt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Monthly Cash Flow</span>
                      <span className={`font-black font-mono ${reResult.monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {fmt(reResult.monthlyCashFlow, mkt)}
                      </span>
                    </div>
                    {dp < 100 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold">Monthly Mortgage</span>
                        <span className="font-black font-mono text-slate-900">{fmt(reResult.monthlyMortgage, mkt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sale Projection */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Sale Projection ({reYears} yr)</span>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Future Value</span>
                    <span className="font-black font-mono text-slate-900">{fmt(reResult.futureValue, mkt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Total Rent Collected</span>
                    <span className="font-black font-mono text-indigo-600">{fmt(reResult.totalRentCollected, mkt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Net Sale Proceeds</span>
                    <span className="font-black font-mono text-slate-900">{fmt(reResult.saleProceeds, mkt)}</span>
                  </div>
                  {dp < 100 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold">Remaining Loan</span>
                      <span className="font-black font-mono text-slate-500">{fmt(reResult.remainingLoan, mkt)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                    <span className="text-slate-700 font-black">Total Return</span>
                    <span className="font-black font-mono text-lg text-slate-900">{fmt(reResult.totalReturn, mkt)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
