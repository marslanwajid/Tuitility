'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';

// Help helper for math formatting
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatCurrencyDetailed = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(val);
};

// Types for amort schedule
interface AmortizationPeriod {
  index: number; // 1-indexed month
  dateStr: string;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  taxPaid: number;
  insurancePaid: number;
  hoaPaid: number;
  pmiPaid: number;
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
  taxPaid: number;
  insurancePaid: number;
  hoaPaid: number;
  pmiPaid: number;
  extraPaid: number;
  totalPaid: number;
  endBalance: number;
  monthlyPeriods: AmortizationPeriod[];
}

export default function MortgageCalculator() {
  // --- STATE ---
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPaymentType, setDownPaymentType] = useState<'percent' | 'dollar'>('percent');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [downPaymentDollar, setDownPaymentDollar] = useState<number>(80000);

  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  
  const [startMonth, setStartMonth] = useState<number>(5); // 0-indexed: 5 = June
  const [startYear, setStartYear] = useState<number>(2026);

  // Additional costs state
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2); // annual %
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1200); // annual $
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [pmiAnnualRate, setPmiAnnualRate] = useState<number>(0.75); // annual % of loan amount

  // Extra payments state
  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [extraAnnual, setExtraAnnual] = useState<number>(0);
  const [extraAnnualMonth, setExtraAnnualMonth] = useState<number>(11); // 11 = December
  const [extraOneTime, setExtraOneTime] = useState<number>(0);
  const [extraOneTimeMonth, setExtraOneTimeMonth] = useState<number>(5);
  const [extraOneTimeYear, setExtraOneTimeYear] = useState<number>(2027);

  // UI tabs and controls
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  
  // Interactive charting hover states
  const [hoveredDoughnutIndex, setHoveredDoughnutIndex] = useState<number | null>(null);
  const [timelineHoverIndex, setTimelineHoverIndex] = useState<number | null>(null);
  const [timelineHoverX, setTimelineHoverX] = useState<number>(0);

  const timelineSvgRef = useRef<SVGSVGElement>(null);

  // Sync Down Payment Dollar and Percent when either changes or when Home Price changes
  const handleHomePriceChange = (val: number) => {
    setHomePrice(val);
    if (downPaymentType === 'percent') {
      const dollar = Math.round((val * downPaymentPercent) / 100);
      setDownPaymentDollar(dollar);
    } else {
      const pct = val > 0 ? parseFloat(((downPaymentDollar / val) * 100).toFixed(2)) : 0;
      setDownPaymentPercent(pct);
    }
  };

  const handleDownPaymentPercentChange = (val: number) => {
    setDownPaymentPercent(val);
    const dollar = Math.round((homePrice * val) / 100);
    setDownPaymentDollar(dollar);
  };

  const handleDownPaymentDollarChange = (val: number) => {
    setDownPaymentDollar(val);
    const pct = homePrice > 0 ? parseFloat(((val / homePrice) * 100).toFixed(2)) : 0;
    setDownPaymentPercent(pct);
  };

  // Switch tabs
  const handleTabChange = (tab: 'percent' | 'dollar') => {
    setDownPaymentType(tab);
    if (tab === 'percent') {
      const pct = homePrice > 0 ? parseFloat(((downPaymentDollar / homePrice) * 100).toFixed(2)) : 0;
      setDownPaymentPercent(pct);
    } else {
      const dollar = Math.round((homePrice * downPaymentPercent) / 100);
      setDownPaymentDollar(dollar);
    }
  };

  // Adjust home price by helper steps
  const adjustHomePrice = (amount: number) => {
    const newVal = Math.max(0, homePrice + amount);
    handleHomePriceChange(newVal);
  };

  // Toggle annual summary row expansion
  const toggleYearExpand = (yearNum: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [yearNum]: !prev[yearNum],
    }));
  };

  // --- CALCULATIONS ---
  const loanAmount = Math.max(0, homePrice - downPaymentDollar);

  // Amortization Generator Hook
  const amortizationData = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    // Standard Monthly P&I Payment (M)
    let standardPI = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        standardPI = loanAmount / totalMonths;
      } else {
        standardPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
    }

    // Additional costs monthly equivalents
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = homeInsuranceAnnual / 12;

    const monthlyPeriods: AmortizationPeriod[] = [];
    const annualSummaries: AnnualSummary[] = [];

    let currentBalance = loanAmount;
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Track extra payments variables
    let monthIdx = 0;
    let currentCalMonth = startMonth;
    let currentCalYear = startYear;

    while (currentBalance > 0.01 && monthIdx < 600) { // Safety cap at 50 years (600 months)
      monthIdx++;
      
      const interestForMonth = currentBalance * monthlyRate;
      let principalForMonth = Math.min(standardPI - interestForMonth, currentBalance);
      if (principalForMonth < 0) principalForMonth = 0;

      // Determine PMI monthly fee
      // PMI terminates when current Loan-to-Value (LTV) is <= 80% (i.e. remaining balance <= 80% of original Home Price)
      const currentLtv = homePrice > 0 ? (currentBalance / homePrice) * 100 : 0;
      const paysPmi = currentLtv > 80 && (downPaymentPercent < 20);
      const monthlyPmi = paysPmi ? (loanAmount * (pmiAnnualRate / 100)) / 12 : 0;

      // Determine extra principal payments
      let extraApplied = 0;

      // 1. Extra Monthly
      extraApplied += extraMonthly;

      // 2. Extra Annual
      if (currentCalMonth === extraAnnualMonth) {
        extraApplied += extraAnnual;
      }

      // 3. Extra One-time
      if (currentCalMonth === extraOneTimeMonth && currentCalYear === extraOneTimeYear) {
        extraApplied += extraOneTime;
      }

      // Cap extra payment to remaining balance
      const maxPossibleExtra = Math.max(0, currentBalance - principalForMonth);
      if (extraApplied > maxPossibleExtra) {
        extraApplied = maxPossibleExtra;
      }

      const totalPrincipalPaid = principalForMonth + extraApplied;
      currentBalance = Math.max(0, currentBalance - totalPrincipalPaid);

      cumulativeInterest += interestForMonth;
      cumulativePrincipal += totalPrincipalPaid;

      const dateStr = `${months[currentCalMonth]} ${currentCalYear}`;

      monthlyPeriods.push({
        index: monthIdx,
        dateStr,
        payment: standardPI,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        taxPaid: monthlyTax,
        insurancePaid: monthlyInsurance,
        hoaPaid: hoaMonthly,
        pmiPaid: monthlyPmi,
        extraPaid: extraApplied,
        totalMonthlyPaid: standardPI + monthlyTax + monthlyInsurance + hoaMonthly + monthlyPmi + extraApplied,
        cumulativeInterest,
        cumulativePrincipal,
        remainingBalance: currentBalance,
      });

      // Increment calendar date
      currentCalMonth++;
      if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
      }
    }

    // Group into Annual Summaries
    monthlyPeriods.forEach((period) => {
      // Determine calendar year from date string
      const parts = period.dateStr.split(' ');
      const calYear = parseInt(parts[1]);

      let summary = annualSummaries.find((s) => s.calendarYear === calYear);
      if (!summary) {
        summary = {
          yearNum: annualSummaries.length + 1,
          calendarYear: calYear,
          payment: 0,
          principalPaid: 0,
          interestPaid: 0,
          taxPaid: 0,
          insurancePaid: 0,
          hoaPaid: 0,
          pmiPaid: 0,
          extraPaid: 0,
          totalPaid: 0,
          endBalance: period.remainingBalance,
          monthlyPeriods: [],
        };
        annualSummaries.push(summary);
      }

      summary.payment += period.payment;
      summary.principalPaid += period.principalPaid;
      summary.interestPaid += period.interestPaid;
      summary.taxPaid += period.taxPaid;
      summary.insurancePaid += period.insurancePaid;
      summary.hoaPaid += period.hoaPaid;
      summary.pmiPaid += period.pmiPaid;
      summary.extraPaid += period.extraPaid;
      summary.totalPaid += period.totalMonthlyPaid;
      summary.endBalance = period.remainingBalance; // always takes final balance of the year
      summary.monthlyPeriods.push(period);
    });

    return {
      monthlyPeriods,
      annualSummaries,
      standardPI,
      monthlyTax,
      monthlyInsurance,
    };
  }, [
    homePrice,
    downPaymentDollar,
    downPaymentPercent,
    interestRate,
    loanTermYears,
    startMonth,
    startYear,
    propertyTaxRate,
    homeInsuranceAnnual,
    hoaMonthly,
    pmiAnnualRate,
    extraMonthly,
    extraAnnual,
    extraAnnualMonth,
    extraOneTime,
    extraOneTimeMonth,
    extraOneTimeYear,
  ]);

  // Baseline Mortgage (No Extra Payments) for savings comparison
  const baselineMortgage = useMemo(() => {
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

    let currentBalance = loanAmount;
    let cumulativeInterest = 0;
    let monthIdx = 0;

    while (currentBalance > 0.01 && monthIdx < 600) {
      monthIdx++;
      const interestForMonth = currentBalance * monthlyRate;
      const principalForMonth = Math.min(standardPI - interestForMonth, currentBalance);
      currentBalance = Math.max(0, currentBalance - principalForMonth);
      cumulativeInterest += interestForMonth;
    }

    return {
      totalInterest: cumulativeInterest,
      totalMonths: monthIdx,
    };
  }, [loanAmount, interestRate, loanTermYears]);

  // Derived metrics with extra payments
  const totalMonthsPaid = amortizationData.monthlyPeriods.length;
  const totalInterestPaid = amortizationData.monthlyPeriods.reduce((acc, p) => acc + p.interestPaid, 0);
  const finalPayoffDate = amortizationData.monthlyPeriods.length > 0 
    ? amortizationData.monthlyPeriods[amortizationData.monthlyPeriods.length - 1].dateStr 
    : 'N/A';

  // Savings computations
  const totalInterestSaved = Math.max(0, baselineMortgage.totalInterest - totalInterestPaid);
  const monthsSaved = Math.max(0, baselineMortgage.totalMonths - totalMonthsPaid);
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;

  // Monthly Breakdown Metrics (for current starting month/period)
  const initialPmi = (downPaymentPercent < 20) ? (loanAmount * (pmiAnnualRate / 100)) / 12 : 0;
  const monthlyPI = amortizationData.standardPI;
  const monthlyTax = amortizationData.monthlyTax;
  const monthlyIns = amortizationData.monthlyInsurance;
  const monthlyHoa = hoaMonthly;
  const monthlyPmi = initialPmi;

  const totalMonthlySum = monthlyPI + monthlyTax + monthlyIns + monthlyHoa + monthlyPmi;

  // Reset all fields to defaults
  const handleReset = () => {
    setHomePrice(400000);
    setDownPaymentPercent(20);
    setDownPaymentDollar(80000);
    setDownPaymentType('percent');
    setInterestRate(6.5);
    setLoanTermYears(30);
    setStartMonth(5);
    setStartYear(2026);
    setPropertyTaxRate(1.2);
    setHomeInsuranceAnnual(1200);
    setHoaMonthly(0);
    setPmiAnnualRate(0.75);
    setExtraMonthly(0);
    setExtraAnnual(0);
    setExtraAnnualMonth(11);
    setExtraOneTime(0);
    setExtraOneTimeMonth(5);
    setExtraOneTimeYear(2027);
  };

  // --- DOUGHNUT CHART SEGMENTS ---
  const doughnutSegments = useMemo(() => {
    const items = [
      { label: 'Principal & Interest', value: monthlyPI, color: '#4f46e5' }, // indigo-600
      { label: 'Property Taxes', value: monthlyTax, color: '#8b5cf6' }, // violet-500
      { label: 'Home Insurance', value: monthlyIns, color: '#f97316' }, // orange-500
      { label: 'HOA Fees', value: monthlyHoa, color: '#ec4899' }, // pink-500
      { label: 'PMI', value: monthlyPmi, color: '#06b6d4' }, // teal-500
    ].filter(item => item.value > 0);

    const sum = items.reduce((acc, item) => acc + item.value, 0);
    let accumAngle = 0;

    return items.map((item) => {
      const pct = sum > 0 ? item.value / sum : 0;
      const angle = pct * 360;
      const startAngle = accumAngle;
      accumAngle += angle;

      return {
        ...item,
        pct,
        startAngle,
        endAngle: accumAngle,
      };
    });
  }, [monthlyPI, monthlyTax, monthlyIns, monthlyHoa, monthlyPmi]);

  // Coordinate Generator for Timeline SVG
  // Sample summaries (approx 30 data points or years)
  const timelineSvgMetrics = useMemo(() => {
    const width = 800;
    const height = 240;
    const padding = { top: 15, right: 20, bottom: 30, left: 60 };

    const data = amortizationData.annualSummaries;
    if (data.length === 0) return null;

    const maxVal = Math.max(
      loanAmount,
      amortizationData.monthlyPeriods.reduce((acc, p) => Math.max(acc, p.cumulativeInterest), 0),
      amortizationData.monthlyPeriods.reduce((acc, p) => Math.max(acc, p.cumulativePrincipal), 0)
    );

    const xScale = (idx: number) => {
      return padding.left + (idx / (data.length - 1)) * (width - padding.left - padding.right);
    };

    const yScale = (val: number) => {
      const scaleHeight = height - padding.top - padding.bottom;
      return padding.top + scaleHeight - (val / maxVal) * scaleHeight;
    };

    // Build SVG coordinates
    // Remaining Balance curve (as shaded area under path)
    let balanceAreaPath = `M ${xScale(0)} ${yScale(loanAmount)} `;
    let balanceLinePath = `M ${xScale(0)} ${yScale(loanAmount)} `;

    // Cumulative Interest line
    let interestLinePath = `M ${xScale(0)} ${yScale(0)} `;

    // Cumulative Principal line
    let principalLinePath = `M ${xScale(0)} ${yScale(0)} `;

    data.forEach((d, idx) => {
      const x = xScale(idx);
      const yBal = yScale(d.endBalance);
      // Take final monthly period of that summary year for cumulative metrics
      const lastMonth = d.monthlyPeriods[d.monthlyPeriods.length - 1];
      const yInt = yScale(lastMonth.cumulativeInterest);
      const yPri = yScale(lastMonth.cumulativePrincipal);

      balanceAreaPath += `L ${x} ${yBal} `;
      balanceLinePath += `L ${x} ${yBal} `;
      interestLinePath += `L ${x} ${yInt} `;
      principalLinePath += `L ${x} ${yPri} `;
    });

    // Close the area path
    const lastX = xScale(data.length - 1);
    balanceAreaPath += `L ${lastX} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

    return {
      width,
      height,
      padding,
      xScale,
      yScale,
      balanceAreaPath,
      balanceLinePath,
      interestLinePath,
      principalLinePath,
      maxVal,
    };
  }, [amortizationData, loanAmount]);

  // Timeline hover coordinates solver
  const handleTimelineMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!timelineSvgRef.current || !timelineSvgMetrics) return;

    const rect = timelineSvgRef.current.getBoundingClientRect();
    const xMouse = e.clientX - rect.left;

    // Convert mouse X to scale index
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

  const activeHoverPeriod = timelineHoverIndex !== null 
    ? amortizationData.annualSummaries[timelineHoverIndex] 
    : null;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 flex items-center space-x-1.5 ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fas fa-home"></i>
            <span>Overview & Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 flex items-center space-x-1.5 ${
              activeTab === 'schedule' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fas fa-table"></i>
            <span>Amortization Schedule</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Form (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">1</span>
              Mortgage Parameters
            </h3>

            {/* Home Price Input / Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Home Purchase Price</label>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => handleHomePriceChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="2500000"
                step="5000"
                value={homePrice}
                onChange={(e) => handleHomePriceChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex space-x-1.5">
                {[-50000, -10000, 10000, 50000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => adjustHomePrice(step)}
                    className="px-2 py-0.5 text-[9px] font-mono font-black border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-500 active:scale-95 transition-all"
                  >
                    {step > 0 ? `+${formatCurrency(step)}` : formatCurrency(step)}
                  </button>
                ))}
              </div>
            </div>

            {/* Down Payment Toggle, Input & Slider */}
            <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Down Payment</span>
                <div className="flex space-x-0.75 bg-slate-150 p-0.75 rounded-full border border-slate-200/30 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleTabChange('percent')}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${downPaymentType === 'percent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Percent (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('dollar')}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${downPaymentType === 'dollar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Amount ($)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center gap-3">
                {downPaymentType === 'percent' ? (
                  <>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={downPaymentPercent}
                      onChange={(e) => handleDownPaymentPercentChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={downPaymentPercent}
                        onChange={(e) => handleDownPaymentPercentChange(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-14 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none focus:border-slate-400"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="range"
                      min="0"
                      max={homePrice}
                      step="1000"
                      value={downPaymentDollar}
                      onChange={(e) => handleDownPaymentDollarChange(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        max={homePrice}
                        value={downPaymentDollar}
                        onChange={(e) => handleDownPaymentDollarChange(Math.max(0, Math.min(homePrice, parseInt(e.target.value) || 0)))}
                        className="w-20 bg-white border border-slate-250 px-2 py-1 rounded-lg font-mono text-xs text-right font-black focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span>Calculated Down Payment: <span className="text-slate-700 font-black">{formatCurrency(downPaymentDollar)}</span></span>
                <span>LTV: <span className="text-slate-700 font-black">{(100 - downPaymentPercent).toFixed(1)}%</span></span>
              </div>
            </div>

            {/* Interest Rate & Loan Term */}
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
                      className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        loanTermYears === years
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {years} yr
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Date Selection */}
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

            {/* Advanced Costs Tab Accordion */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center border-b border-slate-250 pb-2">
                <i className="fas fa-file-invoice-dollar mr-1.5 text-slate-400"></i>
                Taxes, Insurance, HOA & PMI (Escrow)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Property Tax Rate</span>
                    <span className="text-[10px] font-mono text-slate-600 font-black">{propertyTaxRate}% / yr</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="0.05"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                    <input
                      type="number"
                      step="0.05"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-14 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Home Insurance</span>
                    <span className="text-[10px] font-mono text-slate-600 font-black">{formatCurrency(homeInsuranceAnnual)} / yr</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={homeInsuranceAnnual}
                      onChange={(e) => setHomeInsuranceAnnual(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                    <input
                      type="number"
                      value={homeInsuranceAnnual}
                      onChange={(e) => setHomeInsuranceAnnual(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HOA Fees</span>
                    <span className="text-[10px] font-mono text-slate-600 font-black">{formatCurrency(hoaMonthly)} / mo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                    <input
                      type="number"
                      value={hoaMonthly}
                      onChange={(e) => setHoaMonthly(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PMI Insurance Rate</span>
                    <span className="text-[10px] font-mono text-slate-600 font-black">{pmiAnnualRate}% / yr</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={pmiAnnualRate}
                      onChange={(e) => setPmiAnnualRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                      disabled={downPaymentPercent >= 20}
                    />
                    <input
                      type="number"
                      step="0.05"
                      value={pmiAnnualRate}
                      onChange={(e) => setPmiAnnualRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-14 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-right"
                      disabled={downPaymentPercent >= 20}
                    />
                  </div>
                  {downPaymentPercent >= 20 && (
                    <span className="text-[9px] text-green-600 font-bold block">No PMI needed (LTV &lt;= 80%)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Reset Controller */}
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

          {/* Results Overview (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center mr-2">2</span>
              Calculation Results
            </h3>

            {/* Premium Black Results Card */}
            <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
                <span className="text-[120px] font-black italic">PITI</span>
              </div>

              <div className="space-y-4 relative z-10 text-left">
                {/* Total Monthly Payment */}
                <div className="text-center pb-2 border-b border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Est. Monthly Payment</span>
                  <div className="text-4xl font-black text-white mt-1 font-mono">
                    {formatCurrency(totalMonthlySum)}
                  </div>
                </div>

                {/* Grid metrics */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Home Loan Amount</span>
                    <span className="font-mono font-black text-sm text-slate-100">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Down Payment</span>
                    <span className="font-mono font-black text-sm text-slate-100">{formatCurrency(downPaymentDollar)} ({downPaymentPercent}%)</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Interest Paid</span>
                    <span className="font-mono font-black text-sm text-slate-100">{formatCurrency(totalInterestPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Est. Payoff Date</span>
                    <span className="font-black text-sm text-slate-100">{finalPayoffDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Doughnut Payment Breakdown */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center space-y-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Payment Breakdown</span>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                  />
                  {doughnutSegments.map((seg, idx) => {
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDash = seg.pct * circumference;
                    const strokeOffset = circumference - (seg.startAngle / 360) * circumference;

                    const isHovered = hoveredDoughnutIndex === idx;

                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={isHovered ? 15 : 12}
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredDoughnutIndex(idx)}
                        onMouseLeave={() => setHoveredDoughnutIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Central Labels */}
                <div className="absolute text-center flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">PITI Total</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(totalMonthlySum)}</span>
                </div>
              </div>

              {/* Segment Legend */}
              <div className="w-full space-y-1.5 text-xs">
                {doughnutSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDoughnutIndex(idx)}
                    onMouseLeave={() => setHoveredDoughnutIndex(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${
                      hoveredDoughnutIndex === idx 
                        ? 'bg-white border-slate-200 font-black shadow-sm' 
                        : 'border-transparent text-slate-650'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                      <span>{seg.label}</span>
                    </div>
                    <span className="font-mono">{formatCurrency(seg.value)}/mo</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Payments Principal Planning Panel */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center border-b border-emerald-150 pb-2">
                <i className="fas fa-piggy-bank mr-1.5 text-emerald-700"></i>
                Simulate Extra Payments
              </h4>

              <div className="space-y-3.5 text-xs text-left">
                {/* Extra Monthly */}
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

                {/* Extra Annual */}
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

                {/* One Time Extra */}
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

                {/* Savings Highlights */}
                {monthsSaved > 0 && (
                  <div className="p-3.5 bg-emerald-700 text-white rounded-2xl space-y-1.5 shadow-sm text-center animate-fade-in-up">
                    <span className="text-[9px] uppercase tracking-widest font-black opacity-80 block">Extra Payments Savings</span>
                    <div className="text-lg font-black">
                      Total Interest Saved: {formatCurrency(totalInterestSaved)}
                    </div>
                    <div className="text-xs font-bold opacity-90">
                      Paid off {yearsSaved > 0 ? `${yearsSaved} years` : ''} {remainingMonthsSaved > 0 ? ` ${remainingMonthsSaved} months` : ''} early!
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Amortization Schedule (Amortization Schedule Tab) */
        <div className="space-y-6 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">Amortization Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">Detailed breakdown of principal, interest, taxes, insurance, and balances over time.</p>
            </div>
            
            {/* View controls */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/40 text-xs font-bold self-start md:self-center">
              <button
                type="button"
                onClick={() => setScheduleView('annual')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  scheduleView === 'annual' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  scheduleView === 'monthly' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly Breakdown
              </button>
            </div>
          </div>

          {/* SVG Timeline Balance Plotter */}
          {timelineSvgMetrics && (
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-center">Remaining Balance & Cumulative Cost Timeline</span>
              
              <div className="relative w-full overflow-x-auto">
                <svg
                  ref={timelineSvgRef}
                  viewBox={`0 0 ${timelineSvgMetrics.width} ${timelineSvgMetrics.height}`}
                  className="w-full min-w-[700px] select-none cursor-crosshair overflow-visible"
                  onMouseMove={handleTimelineMouseMove}
                  onMouseLeave={() => setTimelineHoverIndex(null)}
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const { padding, width, height, yScale, maxVal } = timelineSvgMetrics;
                    const val = ratio * maxVal;
                    const y = yScale(val);
                    return (
                      <g key={idx}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={width - padding.right}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3}
                          fill="#94a3b8"
                          fontSize="9px"
                          fontWeight="bold"
                          textAnchor="end"
                          className="font-mono"
                        >
                          {formatCurrency(val)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Horizontal Axes */}
                  <line
                    x1={timelineSvgMetrics.padding.left}
                    y1={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom}
                    x2={timelineSvgMetrics.width - timelineSvgMetrics.padding.right}
                    y2={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />

                  {/* Year labels */}
                  {amortizationData.annualSummaries.map((summary, idx) => {
                    if (idx % Math.ceil(amortizationData.annualSummaries.length / 8) === 0 || idx === amortizationData.annualSummaries.length - 1) {
                      return (
                        <text
                          key={idx}
                          x={timelineSvgMetrics.xScale(idx)}
                          y={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom + 16}
                          fill="#64748b"
                          fontSize="9px"
                          fontWeight="black"
                          textAnchor="middle"
                          className="font-mono"
                        >
                          {summary.calendarYear}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Shaded remaining balance area */}
                  <path
                    d={timelineSvgMetrics.balanceAreaPath}
                    fill="url(#balance-gradient)"
                    opacity="0.12"
                  />
                  <path
                    d={timelineSvgMetrics.balanceLinePath}
                    fill="none"
                    stroke="#10b981" // emerald-500
                    strokeWidth="2.5"
                  />

                  {/* Cumulative Principal line */}
                  <path
                    d={timelineSvgMetrics.principalLinePath}
                    fill="none"
                    stroke="#3b82f6" // blue-500
                    strokeWidth="2.5"
                  />

                  {/* Cumulative Interest line */}
                  <path
                    d={timelineSvgMetrics.interestLinePath}
                    fill="none"
                    stroke="#f43f5e" // rose-500
                    strokeWidth="2.5"
                  />

                  {/* Vertical Tracking cursor */}
                  {timelineHoverIndex !== null && (
                    <g>
                      <line
                        x1={timelineHoverX}
                        y1={timelineSvgMetrics.padding.top}
                        x2={timelineHoverX}
                        y2={timelineSvgMetrics.height - timelineSvgMetrics.padding.bottom}
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={timelineHoverX}
                        cy={timelineSvgMetrics.yScale(activeHoverPeriod?.endBalance || 0)}
                        r="4"
                        fill="#10b981"
                        stroke="#fff"
                        strokeWidth="1.5"
                      />
                      {activeHoverPeriod?.monthlyPeriods && activeHoverPeriod.monthlyPeriods.length > 0 && (
                        <>
                          <circle
                            cx={timelineHoverX}
                            cy={timelineSvgMetrics.yScale(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativePrincipal)}
                            r="4"
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={timelineHoverX}
                            cy={timelineSvgMetrics.yScale(activeHoverPeriod.monthlyPeriods[activeHoverPeriod.monthlyPeriods.length - 1].cumulativeInterest)}
                            r="4"
                            fill="#f43f5e"
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                        </>
                      )}
                    </g>
                  )}

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="balance-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Chart Legend */}
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

              {/* Dynamic Interactive Tooltip */}
              {timelineHoverIndex !== null && activeHoverPeriod && (
                <div className="bg-[#1a1a1a] text-white p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between text-xs font-mono shadow-md animate-fade-in-up">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold block">Calendar Year</span>
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

          {/* Schedule Tables */}
          {scheduleView === 'annual' ? (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner max-h-[500px]">
              <table className="w-full min-w-[800px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Calendar Year</th>
                    <th className="px-4 py-3">Total Paid</th>
                    <th className="px-4 py-3">Principal Paid</th>
                    <th className="px-4 py-3">Interest Paid</th>
                    <th className="px-4 py-3">Taxes & Insurance</th>
                    <th className="px-4 py-3">PMI / HOA</th>
                    <th className="px-4 py-3">Ending Balance</th>
                    <th className="px-4 py-3 text-center">Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {amortizationData.annualSummaries.map((summary) => {
                    const isExpanded = !!expandedYears[summary.yearNum];
                    const taxesAndIns = summary.taxPaid + summary.insurancePaid;
                    const pmiAndHoa = summary.pmiPaid + summary.hoaPaid;

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
                          <td className="px-4 py-3 text-slate-500">{formatCurrency(taxesAndIns)}</td>
                          <td className="px-4 py-3 text-slate-500">{formatCurrency(pmiAndHoa)}</td>
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

                        {/* Expanded Monthly Rows */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="p-0 bg-slate-50">
                              <div className="overflow-x-auto border-y border-slate-200/50">
                                <table className="w-full min-w-[750px] text-[10px] text-slate-600 font-mono">
                                  <thead>
                                    <tr className="bg-slate-100/60 border-b border-slate-150 text-slate-400 font-bold uppercase text-[8px]">
                                      <th className="pl-8 pr-4 py-2">Date</th>
                                      <th className="px-4 py-2">Monthly Payment</th>
                                      <th className="px-4 py-2">Principal</th>
                                      <th className="px-4 py-2">Interest</th>
                                      <th className="px-4 py-2">Extra Paid</th>
                                      <th className="px-4 py-2">Taxes & Ins.</th>
                                      <th className="px-4 py-2">PMI & HOA</th>
                                      <th className="px-4 py-2">Total Monthly</th>
                                      <th className="px-4 py-2">Ending Balance</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100/50">
                                    {summary.monthlyPeriods.map((p) => (
                                      <tr key={p.index} className="hover:bg-slate-100/30 transition-colors">
                                        <td className="pl-8 pr-4 py-2 text-slate-900 font-bold">{p.dateStr}</td>
                                        <td className="px-4 py-2">{formatCurrencyDetailed(p.payment)}</td>
                                        <td className="px-4 py-2 text-blue-600">{formatCurrencyDetailed(p.principalPaid)}</td>
                                        <td className="px-4 py-2 text-rose-500">{formatCurrencyDetailed(p.interestPaid)}</td>
                                        <td className="px-4 py-2 text-emerald-600 font-bold">
                                          {p.extraPaid > 0 ? `+${formatCurrencyDetailed(p.extraPaid)}` : '-'}
                                        </td>
                                        <td className="px-4 py-2">{formatCurrencyDetailed(p.taxPaid + p.insurancePaid)}</td>
                                        <td className="px-4 py-2">{formatCurrencyDetailed(p.pmiPaid + p.hoaPaid)}</td>
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
              <table className="w-full min-w-[850px] text-xs border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Monthly Payment</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Extra Paid</th>
                    <th className="px-4 py-3">Taxes & Ins.</th>
                    <th className="px-4 py-3">PMI / HOA</th>
                    <th className="px-4 py-3">Total Payment</th>
                    <th className="px-4 py-3">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {amortizationData.monthlyPeriods.map((p) => (
                    <tr key={p.index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 font-bold">#{p.index}</td>
                      <td className="px-4 py-2.5 text-slate-900 font-bold">{p.dateStr}</td>
                      <td className="px-4 py-2.5">{formatCurrencyDetailed(p.payment)}</td>
                      <td className="px-4 py-2.5 text-blue-600 font-medium">{formatCurrencyDetailed(p.principalPaid)}</td>
                      <td className="px-4 py-2.5 text-rose-500 font-medium">{formatCurrencyDetailed(p.interestPaid)}</td>
                      <td className="px-4 py-2.5 text-emerald-600 font-bold">
                        {p.extraPaid > 0 ? `+${formatCurrencyDetailed(p.extraPaid)}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{formatCurrencyDetailed(p.taxPaid + p.insurancePaid)}</td>
                      <td className="px-4 py-2.5 text-slate-500">{formatCurrencyDetailed(p.pmiPaid + p.hoaPaid)}</td>
                      <td className="px-4 py-2.5 font-black text-slate-950">{formatCurrencyDetailed(p.totalMonthlyPaid)}</td>
                      <td className="px-4 py-2.5 font-black text-slate-900">{formatCurrencyDetailed(p.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
