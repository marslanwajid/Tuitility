'use client';

import React, { useState, useMemo, useEffect } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const fmtPct = (val: number) => (val >= 0 ? '+' : '') + val.toFixed(2) + '%';

type Mode = 'stocks' | 'real-estate' | 'collectibles' | 'cars' | 'watches';

const MODE_LABELS: Record<Mode, string> = { stocks: 'Stocks & Funds', 'real-estate': 'Real Estate', collectibles: 'Collectibles', cars: 'Cars', watches: 'Watches' };

type MarketKey = 'US' | 'UK' | 'UAE' | 'India' | 'Canada' | 'Australia';

const MARKET_DATA: Record<MarketKey, { apprec: number; expense: number; capRange: [number, number]; currency: string; symbol: string }> = {
  US: { apprec: 4, expense: 1.5, capRange: [4, 8], currency: 'USD', symbol: '$' },
  UK: { apprec: 3, expense: 1, capRange: [3, 6], currency: 'GBP', symbol: '\u00A3' },
  UAE: { apprec: 7, expense: 1, capRange: [5, 8], currency: 'AED', symbol: '\u062F.\u0625' },
  India: { apprec: 6, expense: 1.2, capRange: [3, 6], currency: 'INR', symbol: '\u20B9' },
  Canada: { apprec: 4, expense: 1.3, capRange: [4, 7], currency: 'CAD', symbol: 'C$' },
  Australia: { apprec: 5, expense: 1.5, capRange: [4, 7], currency: 'AUD', symbol: 'A$' },
};

const MARKET_KEYS: MarketKey[] = ['US', 'UK', 'UAE', 'India', 'Canada', 'Australia'];
const FREQ_OPTIONS = ['Monthly', 'Quarterly', 'Annually'] as const;
const FREQ_MAP: Record<string, number> = { Monthly: 12, Quarterly: 4, Annually: 1 };

interface YearRow {
  year: number; startBalance: number; contribution: number; gain: number; endBalance: number; cumulativeGain: number;
}

export default function InvestmentCalculator() {
  const [mode, setMode] = useState<Mode>('stocks');
  const [initial, setInitial] = useState(25000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState<string>('Monthly');
  const [rate, setRate] = useState(8);
  const [inflation, setInflation] = useState(3);

  // RE
  const [reMarket, setReMarket] = useState<MarketKey>('US');
  const [reRent, setReRent] = useState(2000);
  const [reExpense, setReExpense] = useState(1.5);

  // Collectibles
  const [storageCost, setStorageCost] = useState(500);

  // Cars
  const [runningCost, setRunningCost] = useState(2000);

  // Watches
  const [insuranceCost, setInsuranceCost] = useState(500);

  // When mode changes, set defaults
  useEffect(() => {
    switch (mode) {
      case 'stocks': setRate(8); break;
      case 'real-estate': {
        const m = MARKET_DATA[reMarket];
        setRate(m.apprec);
        setReExpense(m.expense);
        break;
      }
      case 'collectibles': setRate(6); break;
      case 'cars': setRate(-10); break;
      case 'watches': setRate(8); break;
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'real-estate') {
      const m = MARKET_DATA[reMarket];
      setRate(m.apprec);
      setReExpense(m.expense);
    }
  }, [reMarket]);

  const annualCost = mode === 'collectibles' ? storageCost : mode === 'cars' ? runningCost : mode === 'watches' ? insuranceCost : 0;

  const result = useMemo(() => {
    const periodsPerYear = FREQ_MAP[freq];
    const r = rate / 100 / periodsPerYear;
    const totalPeriods = years * periodsPerYear;
    const contribPerPeriod = monthly * (12 / periodsPerYear);

    // Iterative year-by-year (handles negative rates correctly)
    let balance = initial;
    const rows: YearRow[] = [];
    let cumGain = 0;
    let totalContrib = initial;

    for (let y = 1; y <= years; y++) {
      const startBalance = balance;
      let yearContrib = 0;
      let yearGain = 0;
      for (let p = 0; p < periodsPerYear; p++) {
        const gain = balance * r;
        balance += gain;
        balance += contribPerPeriod;
        yearGain += gain;
        yearContrib += contribPerPeriod;
        totalContrib += contribPerPeriod;
      }
      // Apply annual costs (at end of year)
      const costPerPeriod = annualCost / periodsPerYear;
      balance -= annualCost;
      yearGain -= annualCost;
      cumGain += yearGain;
      rows.push({ year: y, startBalance, contribution: yearContrib, gain: yearGain, endBalance: balance, cumulativeGain: cumGain });
    }

    const totalInvested = initial + monthly * 12 * years;
    const totalGain = balance - totalInvested;
    const annualizedReturn = totalInvested > 0 && years > 0 ? (Math.pow(Math.abs(balance) / Math.abs(totalInvested), 1 / years) - 1) * 100 * (balance >= 0 ? 1 : -1) : 0;
    const realValue = inflation > 0 && years > 0 ? balance / Math.pow(1 + inflation / 100, years) : balance;
    const inflationImpact = balance - realValue;

    // Cap rate for RE
    const capRate = mode === 'real-estate' && reRent > 0 && balance > 0 ? (reRent * 12 * (1 - reExpense / 100)) / balance * 100 : 0;
    const mkt = mode === 'real-estate' ? MARKET_DATA[reMarket] : null;
    const inRange = mkt && capRate >= mkt.capRange[0] && capRate <= mkt.capRange[1];

    // Effective APY
    const apy = rate > 0 ? (Math.pow(1 + r, periodsPerYear) - 1) * 100 : rate;

    return { futureValue: balance, totalInvested, totalGain, annualizedReturn, realValue, inflationImpact, apy, rows, capRate, inRange };
  }, [initial, monthly, years, freq, rate, inflation, mode, annualCost, reMarket, reRent, reExpense]);

  const quickInitial = [0, 10000, 25000, 50000, 100000];
  const quickMonthly = [0, 100, 500, 1000, 2000];

  const handleReset = () => {
    setMode('stocks'); setInitial(25000); setMonthly(500); setYears(10); setFreq('Monthly'); setRate(8); setInflation(3);
    setReMarket('US'); setReRent(2000); setReExpense(1.5);
    setStorageCost(500); setRunningCost(2000); setInsuranceCost(500);
  };

  const modeKeys: Mode[] = ['stocks', 'real-estate', 'collectibles', 'cars', 'watches'];
  const modeIcons: Record<Mode, string> = { stocks: '\uD83D\uDCC8', 'real-estate': '\uD83C\uDFE0', collectibles: '\uD83D\uDDBC\uFE0F', cars: '\uD83D\uDE97', watches: '\u231A' };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {modeKeys.map((k) => (
            <button key={k} type="button" onClick={() => { setMode(k); }}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all whitespace-nowrap ${mode === k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {modeIcons[k]} {MODE_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
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
                <input type="number" value={initial} onChange={(e) => setInitial(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min={0} max={1000000} step={1000} value={initial} onChange={(e) => setInitial(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {quickInitial.map((amt) => (
                <button key={amt} type="button" onClick={() => setInitial(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${initial === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
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
                <input type="number" value={monthly} onChange={(e) => setMonthly(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min={0} max={10000} step={50} value={monthly} onChange={(e) => setMonthly(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {quickMonthly.map((amt) => (
                <button key={amt} type="button" onClick={() => setMonthly(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${monthly === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {amt === 0 ? '$0' : fmt(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Period & Freq */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Investment Period</label>
                <span className="font-mono text-sm font-black text-slate-700">{years} yr</span>
              </div>
              <input type="range" min={1} max={50} step={1} value={years} onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Compounding</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {FREQ_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => setFreq(opt)}
                    className={`py-2 rounded-lg text-sm font-extrabold transition-all ${freq === opt ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            {MODE_LABELS[mode]} Settings
          </h3>

          {/* Annual Return */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                {mode === 'cars' ? 'Annual Depreciation' : 'Annual Return'}
              </label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.5" min={mode === 'cars' ? -30 : 0} max="30" value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min={mode === 'cars' ? -30 : 0} max="30" step="0.5" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* Real Estate: Market + Rent + Expense */}
          {mode === 'real-estate' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Market</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                  {MARKET_KEYS.map((k) => (
                    <button key={k} type="button" onClick={() => setReMarket(k)}
                      className={`py-2 rounded-lg text-xs font-extrabold transition-all ${reMarket === k ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Rent</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-mono text-sm">$</span>
                      <input type="number" value={reRent} onChange={(e) => setReRent(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                    </div>
                  </div>
                  <input type="range" min={0} max={50000} step={100} value={reRent} onChange={(e) => setReRent(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Expense Rate</label>
                    <div className="flex items-center space-x-1">
                      <input type="number" step="0.1" min={0} max={10} value={reExpense}
                        onChange={(e) => setReExpense(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-14 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>
                  </div>
                  <input type="range" min={0} max={10} step={0.1} value={reExpense} onChange={(e) => setReExpense(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                {reMarket} market: {MARKET_DATA[reMarket].apprec}%/yr appreciation, {MARKET_DATA[reMarket].expense}% expense rate, {MARKET_DATA[reMarket].capRange[0]}-{MARKET_DATA[reMarket].capRange[1]}% typical cap rate
              </div>
            </>
          )}

          {/* Other modes: Annual cost */}
          {(mode === 'collectibles' || mode === 'cars' || mode === 'watches') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
                  {mode === 'collectibles' ? 'Storage Cost' : mode === 'cars' ? 'Running & Maintenance Cost' : 'Insurance Cost'}
                </label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input type="number" value={mode === 'collectibles' ? storageCost : mode === 'cars' ? runningCost : insuranceCost}
                    onChange={(e) => {
                      const v = Math.max(0, parseInt(e.target.value) || 0);
                      if (mode === 'collectibles') setStorageCost(v);
                      else if (mode === 'cars') setRunningCost(v);
                      else setInsuranceCost(v);
                    }}
                    className="w-20 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
              </div>
              <input type="range" min={0} max={10000} step={100} value={mode === 'collectibles' ? storageCost : mode === 'cars' ? runningCost : insuranceCost}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (mode === 'collectibles') setStorageCost(v);
                  else if (mode === 'cars') setRunningCost(v);
                  else setInsuranceCost(v);
                }}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <div className="text-xs text-slate-400 font-mono">Annual cost deducted yearly</div>
            </div>
          )}

          {/* Inflation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Inflation Rate</label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.5" min={0} max={15} value={inflation}
                  onChange={(e) => setInflation(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min={0} max={15} step="0.5" value={inflation} onChange={(e) => setInflation(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
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
            Growth Projection
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">{mode === 'stocks' ? 'S&P' : mode === 'real-estate' ? 'RE' : mode === 'collectibles' ? 'ART' : mode === 'cars' ? 'CAR' : 'WATCH'}</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Future Value</span>
                <div className="text-5xl font-black text-white font-mono">
                  {fmt(result.futureValue)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Gain</span>
                  <span className={`font-mono font-black text-base ${result.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {fmtPct(result.totalGain)} ({fmt(Math.abs(result.totalGain))})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annualized Return</span>
                  <span className={`font-mono font-black text-base ${result.annualizedReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.annualizedReturn.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Invested</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.totalInvested)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Effective APY</span>
                  <span className="font-mono font-black text-base text-slate-100">{result.apy.toFixed(2)}%</span>
                </div>
              </div>
              {inflation > 0 && (
                <div className="text-xs text-slate-500 font-mono text-center border-t border-slate-800/60 pt-3">
                  Inflation impact: <span className="text-rose-400 font-bold">{fmt(result.inflationImpact)}</span> | Real value: {fmt(result.realValue)}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">
              {mode === 'real-estate' ? 'Property Analysis' : 'Return Breakdown'}
            </span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Total Invested</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Total Gain / Loss</span>
                <span className={`font-black font-mono ${result.totalGain >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {fmtPct(result.totalGain)} ({fmt(Math.abs(result.totalGain))})
                </span>
              </div>
              {mode === 'real-estate' && reRent > 0 && result.futureValue > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5">
                    Cap Rate Estimate
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${result.inRange ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {result.inRange ? '\u2713' : '\u2717'}
                    </span>
                  </span>
                  <div className="text-right">
                    <span className="font-black font-mono text-slate-900">{result.capRate.toFixed(2)}%</span>
                    <span className="text-[10px] text-slate-400 block">Market: {MARKET_DATA[reMarket].capRange[0]}-{MARKET_DATA[reMarket].capRange[1]}%</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Annualized Return</span>
                <span className={`font-black font-mono ${result.annualizedReturn >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {result.annualizedReturn.toFixed(2)}% p.a.
                </span>
              </div>
              {inflation > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Inflation-Adjusted Value</span>
                  <span className="font-black font-mono text-cyan-600">{fmt(result.realValue)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width: Year-by-Year Table */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-table mr-2 text-slate-400 text-sm"></i>
            Year-by-Year Growth
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{years} years</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-96">
          <table className="w-full min-w-[650px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Start Balance</th>
                <th className="px-4 py-3">Contributions</th>
                <th className="px-4 py-3">Gain / Loss</th>
                <th className="px-4 py-3">End Balance</th>
                <th className="px-4 py-3">Cum. Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {result.rows.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-900">Year {row.year}</td>
                  <td className="px-4 py-2.5">{fmt(row.startBalance)}</td>
                  <td className="px-4 py-2.5 text-indigo-600">{fmt(row.contribution)}</td>
                  <td className={`px-4 py-2.5 ${row.gain >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {row.gain >= 0 ? '+' : ''}{fmt(row.gain)}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{fmt(row.endBalance)}</td>
                  <td className={`px-4 py-2.5 ${row.cumulativeGain >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {row.cumulativeGain >= 0 ? '+' : ''}{fmt(row.cumulativeGain)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
