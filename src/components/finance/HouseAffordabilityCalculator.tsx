'use client';

import React, { useState, useMemo } from 'react';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const formatCurrencyDetailed = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const formatPercent = (val: number) => val.toFixed(1) + '%';

interface ScenarioOption {
  id: number; label: string; rate: number; term: number;
}

export default function HouseAffordabilityCalculator() {
  const [annualIncome, setAnnualIncome] = useState<number>(80000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500);

  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'dollar'>('percent');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [downPaymentDollar, setDownPaymentDollar] = useState<number>(16000);

  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const [taxType, setTaxType] = useState<'amount' | 'rate'>('amount');
  const [propertyTaxAmt, setPropertyTaxAmt] = useState<number>(3000);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.1);

  const [insuranceType, setInsuranceType] = useState<'amount' | 'rate'>('amount');
  const [insuranceAmt, setInsuranceAmt] = useState<number>(1200);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.5);

  const [hoaFees, setHoaFees] = useState<number>(0);
  const [pmiRate, setPmiRate] = useState<number>(0.5);

  const [scenarios, setScenarios] = useState<ScenarioOption[]>([]);
  const [scenarioIdCounter, setScenarioIdCounter] = useState<number>(1);

  // --- Compute affordability ---
  const result = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const frontEndMax = monthlyIncome * 0.28;
    const backEndMax = monthlyIncome * 0.36 - monthlyDebts;
    const availableForHousing = Math.max(0, Math.min(frontEndMax, backEndMax));

    if (availableForHousing <= 0) {
      return {
        maxHomePrice: 0, maxLoanAmount: 0, downPaymentNeeded: 0,
        monthlyPI: 0, monthlyTax: 0, monthlyIns: 0, monthlyPMI: 0, monthlyHOA: 0,
        totalMonthly: 0, frontEndRatio: 0, backEndRatio: 0,
        affordable: false,
      };
    }

    // Iterative solve for max home price (handles circular deps: rate-based tax/ins, PMI)
    let maxHomePrice = 0;
    let maxLoanAmount = 0;
    let monthlyPI = 0;
    let monthlyTax = 0;
    let monthlyIns = 0;
    let monthlyPMI = 0;
    let downPaymentPct = downPaymentPercent;
    let downPaymentAmt = 0;

    for (let iter = 0; iter < 5; iter++) {
      // Compute down payment amounts
      if (downPaymentType === 'percent') {
        downPaymentPct = downPaymentPercent;
        downPaymentAmt = maxHomePrice * downPaymentPct / 100;
      } else {
        downPaymentAmt = downPaymentDollar;
        downPaymentPct = maxHomePrice > 0 ? (downPaymentDollar / maxHomePrice) * 100 : 0;
      }

      // Compute tax and insurance based on mode
      const annualTax = taxType === 'amount' ? propertyTaxAmt : (maxHomePrice * propertyTaxRate / 100);
      const annualIns = insuranceType === 'amount' ? insuranceAmt : (maxHomePrice * insuranceRate / 100);
      monthlyTax = annualTax / 12;
      monthlyIns = annualIns / 12;

      // PMI applies if down < 20%
      monthlyPMI = 0;
      if (downPaymentPct < 20 && maxLoanAmount > 0) {
        monthlyPMI = (maxLoanAmount * pmiRate / 100) / 12;
      }

      const availableForPI = Math.max(0, availableForHousing - monthlyTax - monthlyIns - monthlyPMI - hoaFees);

      // Solve max loan from amortization
      const r = interestRate / 100 / 12;
      const n = loanTermYears * 12;

      if (availableForPI <= 0) {
        maxLoanAmount = 0;
        monthlyPI = 0;
      } else if (r === 0) {
        maxLoanAmount = availableForPI * n;
        monthlyPI = availableForPI;
      } else {
        const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        maxLoanAmount = availableForPI / factor;
        monthlyPI = availableForPI;
      }

      // Compute max home price
      if (downPaymentType === 'percent') {
        if (downPaymentPercent >= 100) {
          maxHomePrice = maxLoanAmount; // no loan needed
        } else {
          maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
        }
      } else {
        maxHomePrice = maxLoanAmount + downPaymentDollar;
      }
    }

    const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPMI + hoaFees;
    const monthlyIncomeActual = annualIncome / 12;
    const frontEndRatio = monthlyIncomeActual > 0 ? (totalMonthly / monthlyIncomeActual) * 100 : 0;
    const backEndRatio = monthlyIncomeActual > 0 ? ((totalMonthly + monthlyDebts) / monthlyIncomeActual) * 100 : 0;

    return {
      maxHomePrice, maxLoanAmount,
      downPaymentNeeded: downPaymentAmt,
      monthlyPI, monthlyTax, monthlyIns, monthlyPMI, monthlyHOA: hoaFees,
      totalMonthly, frontEndRatio, backEndRatio,
      affordable: totalMonthly <= availableForHousing && maxHomePrice > 0,
    };
  }, [annualIncome, monthlyDebts, downPaymentType, downPaymentPercent, downPaymentDollar,
      interestRate, loanTermYears, taxType, propertyTaxAmt, propertyTaxRate,
      insuranceType, insuranceAmt, insuranceRate, hoaFees, pmiRate]);

  // --- Down payment sync ---
  const handleDownPaymentPercentChange = (val: number) => {
    setDownPaymentPercent(val);
    setDownPaymentDollar(Math.round((result.maxHomePrice * val) / 100));
  };
  const handleDownPaymentDollarChange = (val: number) => {
    setDownPaymentDollar(val);
    setDownPaymentPercent(result.maxHomePrice > 0 ? parseFloat(((val / result.maxHomePrice) * 100).toFixed(2)) : 0);
  };
  const handleDownPaymentTypeChange = (tab: 'percent' | 'dollar') => {
    setDownPaymentType(tab);
    if (tab === 'percent') {
      setDownPaymentPercent(result.maxHomePrice > 0 ? parseFloat(((downPaymentDollar / result.maxHomePrice) * 100).toFixed(2)) : 0);
    } else {
      setDownPaymentDollar(Math.round((result.maxHomePrice * downPaymentPercent) / 100));
    }
  };

  // --- Scenarios ---
  const comparisonResults = useMemo(() => {
    return scenarios.map((sc) => {
      const monthlyIncome = annualIncome / 12;
      const frontEndMax = monthlyIncome * 0.28;
      const backEndMax = monthlyIncome * 0.36 - monthlyDebts;
      const avail = Math.max(0, Math.min(frontEndMax, backEndMax));

      let mPrice = 0;
      let mLoan = 0;
      let mPI = 0;
      let mTax = 0;
      let mIns = 0;
      let mPMI = 0;
      let dPct = downPaymentPercent;
      let dAmt = 0;

      for (let iter = 0; iter < 5; iter++) {
        if (downPaymentType === 'percent') { dPct = downPaymentPercent; dAmt = mPrice * dPct / 100; }
        else { dAmt = downPaymentDollar; dPct = mPrice > 0 ? (downPaymentDollar / mPrice) * 100 : 0; }

        const aTax = taxType === 'amount' ? propertyTaxAmt : (mPrice * propertyTaxRate / 100);
        const aIns = insuranceType === 'amount' ? insuranceAmt : (mPrice * insuranceRate / 100);
        mTax = aTax / 12; mIns = aIns / 12;
        mPMI = 0;
        if (dPct < 20 && mLoan > 0) { mPMI = (mLoan * pmiRate / 100) / 12; }

        const aPI = Math.max(0, avail - mTax - mIns - mPMI - hoaFees);
        const r = sc.rate / 100 / 12;
        const n = sc.term * 12;
        if (aPI <= 0) { mLoan = 0; mPI = 0; }
        else if (r === 0) { mLoan = aPI * n; mPI = aPI; }
        else { const f = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); mLoan = aPI / f; mPI = aPI; }

        if (downPaymentType === 'percent') { mPrice = downPaymentPercent >= 100 ? mLoan : mLoan / (1 - downPaymentPercent / 100); }
        else { mPrice = mLoan + downPaymentDollar; }
      }

      return { ...sc, maxHomePrice: mPrice, maxLoanAmount: mLoan, monthlyPI: mPI, totalMonthly: mPI + mTax + mIns + mPMI + hoaFees };
    });
  }, [scenarios, annualIncome, monthlyDebts, downPaymentType, downPaymentPercent, downPaymentDollar,
      taxType, propertyTaxAmt, propertyTaxRate, insuranceType, insuranceAmt, insuranceRate, hoaFees, pmiRate]);

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

  // --- Reset ---
  const handleReset = () => {
    setAnnualIncome(80000); setMonthlyDebts(500);
    setDownPaymentType('percent'); setDownPaymentPercent(20); setDownPaymentDollar(16000);
    setInterestRate(7.0); setLoanTermYears(30);
    setTaxType('amount'); setPropertyTaxAmt(3000); setPropertyTaxRate(1.1);
    setInsuranceType('amount'); setInsuranceAmt(1200); setInsuranceRate(0.5);
    setHoaFees(0); setPmiRate(0.5);
    setScenarios([]); setScenarioIdCounter(1);
  };

  const showPMI = (downPaymentType === 'percent' && downPaymentPercent < 20) ||
    (downPaymentType === 'dollar' && result.maxHomePrice > 0 && (downPaymentDollar / result.maxHomePrice) * 100 < 20);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section 1: Income & Debts */}
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Income &amp; Existing Debts
          </h3>

          {/* Annual Income */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Annual Income</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
              </div>
            </div>
            <input type="range" min="20000" max="500000" step="1000" value={annualIncome} onChange={(e) => setAnnualIncome(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-2">
              {[40000, 60000, 80000, 100000, 150000].map((amt) => (
                <button key={amt} type="button" onClick={() => setAnnualIncome(amt)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${annualIncome === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  ${amt / 1000}K
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Debts */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Monthly Debts</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 font-mono text-sm">$</span>
                <input type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
              </div>
            </div>
            <input type="range" min="0" max="10000" step="50" value={monthlyDebts} onChange={(e) => setMonthlyDebts(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* Section 2: Loan Details */}
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center pt-4">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Loan Details
          </h3>

          {/* Down Payment */}
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Down Payment</span>
              <div className="flex space-x-0.75 bg-slate-150 p-0.75 rounded-full border border-slate-200/30 text-xs">
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
                      className="w-14 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </>
              ) : (
                <>
                  <input type="range" min="0" max={result.maxHomePrice > 0 ? result.maxHomePrice : 100000} step="1000" value={downPaymentDollar}
                    onChange={(e) => handleDownPaymentDollarChange(Math.max(0, Math.min(result.maxHomePrice > 0 ? result.maxHomePrice : 100000, parseInt(e.target.value) || 0)))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-sm font-bold text-slate-400">$</span>
                    <input type="number" min="0" max={result.maxHomePrice > 0 ? result.maxHomePrice : 100000} value={downPaymentDollar}
                      onChange={(e) => handleDownPaymentDollarChange(Math.max(0, Math.min(result.maxHomePrice > 0 ? result.maxHomePrice : 100000, parseInt(e.target.value) || 0)))}
                      className="w-24 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
              <span>Down Payment: <span className="text-slate-700 font-black">{formatCurrency(result.downPaymentNeeded)}</span></span>
              <span>{downPaymentPercent.toFixed(1)}% of price</span>
            </div>
          </div>

          {/* Interest Rate & Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Interest Rate</label>
                <div className="flex items-center space-x-1">
                  <input type="number" step="0.25" min="0.1" max="12" value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <input type="range" min="1" max="12" step="0.25" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500 block">Loan Term</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                {[15, 20, 30].map((y) => (
                  <button key={y} type="button" onClick={() => setLoanTermYears(y)}
                    className={`py-2 rounded-lg text-sm font-extrabold transition-all ${loanTermYears === y ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Housing Costs */}
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center pt-4">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Housing Costs
          </h3>

          {/* Property Tax */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Property Tax</label>
              <div className="flex space-x-0.75 bg-slate-150 p-0.75 rounded-full border border-slate-200/30 text-xs">
                <button type="button" onClick={() => setTaxType('amount')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${taxType === 'amount' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Annual $</button>
                <button type="button" onClick={() => setTaxType('rate')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${taxType === 'rate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Rate %</button>
              </div>
            </div>
            {taxType === 'amount' ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-400">$</span>
                <input type="range" min="0" max="20000" step="100" value={propertyTaxAmt}
                  onChange={(e) => setPropertyTaxAmt(parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <input type="number" value={propertyTaxAmt} onChange={(e) => setPropertyTaxAmt(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input type="range" min="0" max="3" step="0.1" value={propertyTaxRate}
                  onChange={(e) => setPropertyTaxRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex items-center space-x-1 shrink-0">
                  <input type="number" step="0.1" min="0" max="3" value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
            )}
            <div className="text-xs text-slate-400 font-bold text-right">
              ~{formatCurrency(taxType === 'amount' ? propertyTaxAmt / 12 : (result.maxHomePrice * propertyTaxRate / 100) / 12)}/mo
            </div>
          </div>

          {/* Home Insurance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Home Insurance</label>
              <div className="flex space-x-0.75 bg-slate-150 p-0.75 rounded-full border border-slate-200/30 text-xs">
                <button type="button" onClick={() => setInsuranceType('amount')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${insuranceType === 'amount' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Annual $</button>
                <button type="button" onClick={() => setInsuranceType('rate')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${insuranceType === 'rate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Rate %</button>
              </div>
            </div>
            {insuranceType === 'amount' ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-400">$</span>
                <input type="range" min="0" max="10000" step="100" value={insuranceAmt}
                  onChange={(e) => setInsuranceAmt(parseInt(e.target.value) || 0)}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <input type="number" value={insuranceAmt} onChange={(e) => setInsuranceAmt(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input type="range" min="0" max="2" step="0.1" value={insuranceRate}
                  onChange={(e) => setInsuranceRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex items-center space-x-1 shrink-0">
                  <input type="number" step="0.1" min="0" max="2" value={insuranceRate}
                    onChange={(e) => setInsuranceRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
            )}
            <div className="text-xs text-slate-400 font-bold text-right">
              ~{formatCurrency(insuranceType === 'amount' ? insuranceAmt / 12 : (result.maxHomePrice * insuranceRate / 100) / 12)}/mo
            </div>
          </div>

          {/* HOA */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">HOA Fees (monthly)</label>
              <span className="font-mono text-sm font-black text-slate-700">${hoaFees}/mo</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="range" min="0" max="2000" step="25" value={hoaFees}
                onChange={(e) => setHoaFees(parseInt(e.target.value) || 0)}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <input type="number" value={hoaFees} onChange={(e) => setHoaFees(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-sm text-right font-black" />
            </div>
          </div>

          {/* PMI (conditional) */}
          {showPMI && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                <i className="fas fa-info-circle mr-1.5"></i>PMI Required (down &lt; 20%)
              </div>
              <div className="flex items-center space-x-2">
                <input type="range" min="0.1" max="2" step="0.1" value={pmiRate}
                  onChange={(e) => setPmiRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex items-center space-x-1 shrink-0">
                  <input type="number" step="0.1" min="0.1" max="2" value={pmiRate}
                    onChange={(e) => setPmiRate(Math.max(0.1, parseFloat(e.target.value) || 0.5))}
                    className="w-14 bg-white border border-slate-200 px-2 py-1 rounded-lg font-mono text-sm text-right font-black" />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>
              <div className="text-xs text-amber-600 font-bold text-right">
                {formatCurrencyDetailed(result.monthlyPMI)}/mo
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">4</span>
            Affordability Estimate
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">HOME</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Max Home Price</span>
                <div className="text-5xl font-black text-white font-mono">
                  {result.maxHomePrice > 0 ? formatCurrency(result.maxHomePrice) : (
                    <span className="text-slate-500 text-lg">N/A</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Max Loan Amount</span>
                  <span className="font-mono font-black text-base text-slate-100">{formatCurrency(result.maxLoanAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Down Payment</span>
                  <span className="font-mono font-black text-base text-cyan-400">{formatCurrency(result.downPaymentNeeded)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Front-End DTI</span>
                  <span className="font-mono font-black text-base text-emerald-400">{formatPercent(result.frontEndRatio)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Back-End DTI</span>
                  <span className={`font-mono font-black text-base ${result.backEndRatio <= 36 ? 'text-emerald-400' : result.backEndRatio <= 43 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {formatPercent(result.backEndRatio)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-mono text-center border-t border-slate-800/60 pt-3 flex items-center justify-center space-x-2">
                {result.affordable ? (
                  <><i className="fas fa-check-circle text-emerald-400"></i><span className="text-emerald-400 font-bold">Within Budget</span></>
                ) : (
                  <><i className="fas fa-exclamation-circle text-amber-400"></i><span className="text-amber-400 font-bold">Exceeds Recommended Limits</span></>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Payment Breakdown */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Monthly Payment Breakdown</span>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Principal &amp; Interest</span>
                <span className="font-black font-mono text-slate-900">{formatCurrencyDetailed(result.monthlyPI)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Property Tax</span>
                <span className="font-black font-mono text-slate-900">{formatCurrencyDetailed(result.monthlyTax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Home Insurance</span>
                <span className="font-black font-mono text-slate-900">{formatCurrencyDetailed(result.monthlyIns)}</span>
              </div>
              {result.monthlyPMI > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">PMI</span>
                  <span className="font-black font-mono text-amber-600">{formatCurrencyDetailed(result.monthlyPMI)}</span>
                </div>
              )}
              {result.monthlyHOA > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">HOA</span>
                  <span className="font-black font-mono text-slate-900">{formatCurrencyDetailed(result.monthlyHOA)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total Monthly</span>
                <span className="font-black font-mono text-lg text-slate-900">{formatCurrencyDetailed(result.totalMonthly)}</span>
              </div>
            </div>
          </div>

          {/* DTI Summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Debt-to-Income Analysis (28/36 Rule)</span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Monthly Income</span>
                <span className="font-black font-mono text-slate-900">{formatCurrency(annualIncome / 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Max Housing (28%)</span>
                <span className="font-black font-mono text-emerald-600">{formatCurrencyDetailed(annualIncome / 12 * 0.28)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Max Total Debt (36%)</span>
                <span className="font-black font-mono text-indigo-600">{formatCurrencyDetailed(annualIncome / 12 * 0.36)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-black">Front-End DTI</span>
                <span className={`font-black font-mono ${result.frontEndRatio <= 28 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatPercent(result.frontEndRatio)} {result.frontEndRatio <= 28 ? '\u2713' : '\u2717'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-black">Back-End DTI</span>
                <span className={`font-black font-mono ${result.backEndRatio <= 36 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatPercent(result.backEndRatio)} {result.backEndRatio <= 36 ? '\u2713' : '\u2717'}
                </span>
              </div>
            </div>
          </div>

          {/* Baseline vs PMI */}
          {showPMI && result.monthlyPMI > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">What If: 20% Down Payment?</span>
              <div className="text-slate-600 space-y-1">
                <p className="font-medium text-emerald-700">
                  <i className="fas fa-arrow-up mr-1"></i>Saving to 20% down would eliminate PMI and increase buying power.
                </p>
                <p className="text-slate-400">Additional savings needed: <span className="font-black text-slate-800">{formatCurrency(Math.max(0, result.maxHomePrice * 0.20 - result.downPaymentNeeded))}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section: Compare Scenarios */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-balance-scale mr-2 text-slate-400 text-sm"></i>
            Compare Loan Options
          </h3>
          <button type="button" onClick={addScenario} disabled={scenarios.length >= 3}
            className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
            <i className="fas fa-plus mr-1"></i>Add Scenario
          </button>
        </div>

        {scenarios.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-4 text-center">Add scenarios above to compare different rate and term combinations side-by-side.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="px-4 py-3 text-left">Scenario</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Max Home Price</th>
                  <th className="px-4 py-3">Max Loan</th>
                  <th className="px-4 py-3">Monthly P&amp;I</th>
                  <th className="px-4 py-3">Total Monthly</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                <tr className="bg-slate-100/30 font-bold">
                  <td className="px-4 py-2.5 text-slate-900">Current Loan</td>
                  <td className="px-4 py-2.5 text-center">{interestRate}%</td>
                  <td className="px-4 py-2.5 text-center">{loanTermYears}yr</td>
                  <td className="px-4 py-2.5 text-center font-black text-slate-950">{formatCurrency(result.maxHomePrice)}</td>
                  <td className="px-4 py-2.5 text-center">{formatCurrency(result.maxLoanAmount)}</td>
                  <td className="px-4 py-2.5 text-center">{formatCurrencyDetailed(result.monthlyPI)}</td>
                  <td className="px-4 py-2.5 text-center font-black text-slate-950">{formatCurrencyDetailed(result.totalMonthly)}</td>
                  <td className="px-4 py-2.5"></td>
                </tr>
                {comparisonResults.map((sc) => {
                  const best = comparisonResults.length > 0 && sc.maxHomePrice === Math.max(...comparisonResults.map((x) => x.maxHomePrice));
                  return (
                    <tr key={sc.id} className={`hover:bg-slate-50/60 transition-colors ${best ? 'bg-emerald-50/40' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center space-x-1">
                          <input type="text" value={sc.label} onChange={(e) => updateScenarioLabel(sc.id, e.target.value)}
                            className="bg-transparent font-bold text-slate-800 w-24 text-xs focus:outline-none focus:bg-white focus:border border-slate-200 rounded px-1" />
                          {best && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">Best</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" step="0.25" value={sc.rate} onChange={(e) => updateScenario(sc.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-14 text-center bg-transparent font-mono text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-slate-200 rounded" />%
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="1" max="40" value={sc.term} onChange={(e) => updateScenario(sc.id, 'term', parseInt(e.target.value) || 1)}
                          className="w-10 text-center bg-transparent font-mono text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-slate-200 rounded" />yr
                      </td>
                      <td className="px-4 py-2.5 text-center font-black font-mono text-slate-950">{formatCurrency(sc.maxHomePrice)}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{formatCurrency(sc.maxLoanAmount)}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{formatCurrencyDetailed(sc.monthlyPI)}</td>
                      <td className={`px-4 py-2.5 text-center font-black font-mono ${sc.totalMonthly === Math.min(...comparisonResults.map((x) => x.totalMonthly)) && comparisonResults.length > 1 ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {formatCurrencyDetailed(sc.totalMonthly)}
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
