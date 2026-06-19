'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface SimplifiedFraction {
  numerator: number;
  denominator: number;
  gcd: number;
}

interface CalculationResult {
  percentage: number;
  decimal: number;
  initialNumerator: number;
  initialDenominator: number;
  simplifiedFraction: SimplifiedFraction;
  steps: string[];
}

interface VisualizerProps {
  percentage: number;
  fraction: SimplifiedFraction;
  viewType: 'pie' | 'bar';
}

function FractionVisualizer({ percentage, fraction, viewType }: VisualizerProps) {
  const absPercent = Math.min(100, Math.max(0, Math.abs(percentage)));
  const { numerator, denominator } = fraction;

  // Render pie visualizer
  const renderPieCircle = () => {
    if (denominator <= 0) return null;
    const paths = [];
    const activeBlocks = Math.round((absPercent / 100) * denominator);

    for (let i = 0; i < denominator; i++) {
      const angleStep = (2 * Math.PI) / denominator;
      const angleStart = i * angleStep - Math.PI / 2;
      const angleEnd = (i + 1) * angleStep - Math.PI / 2;

      const x1 = 50 + 40 * Math.cos(angleStart);
      const y1 = 50 + 40 * Math.sin(angleStart);
      const x2 = 50 + 40 * Math.cos(angleEnd);
      const y2 = 50 + 40 * Math.sin(angleEnd);

      const isShaded = i < activeBlocks;

      if (denominator === 1) {
        return (
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`${isShaded ? 'fill-[#1a1a1a]' : 'fill-none'} stroke-[#1a1a1a] stroke-2`}
          />
        );
      }

      paths.push(
        <path
          key={i}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`}
          className={`${isShaded ? 'fill-[#1a1a1a]' : 'fill-none'} stroke-[#1a1a1a] stroke-[1.5]`}
        />
      );
    }
    return <g>{paths}</g>;
  };

  // Render bar visualizer
  const renderBarGrid = () => {
    if (denominator <= 0) return null;
    const activeBlocks = Math.round((absPercent / 100) * denominator);
    const blocks = [];
    const width = 160;
    const height = 24;
    const blockWidth = width / denominator;

    for (let i = 0; i < denominator; i++) {
      const isShaded = i < activeBlocks;
      blocks.push(
        <rect
          key={i}
          x={i * blockWidth}
          y="0"
          width={blockWidth}
          height={height}
          className={`${isShaded ? 'fill-[#1a1a1a]' : 'fill-none'} stroke-[#1a1a1a] stroke-[1.5]`}
        />
      );
    }
    return <g>{blocks}</g>;
  };

  // Render circular percentage gauge dial
  const renderPercentGauge = () => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (absPercent / 100) * circumference;

    return (
      <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-sm transition-transform duration-300 hover:scale-105">
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="fill-none stroke-slate-100 stroke-[7]"
        />
        {/* Fill */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="fill-none stroke-[#1a1a1a] stroke-[7] transition-all duration-500 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        {/* Percentage text centered */}
        <text
          x="50%"
          y="53%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-[13px] font-black text-slate-800 font-mono"
        >
          {percentage}%
        </text>
      </svg>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-5 bg-slate-50 border border-slate-100 rounded-3xl w-full max-w-lg mx-auto">
      {/* Left side: Percentage Gauge */}
      <div className="flex flex-col items-center space-y-2">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">Percentage Dial</span>
        {renderPercentGauge()}
      </div>

      <div className="hidden sm:block border-l border-slate-200 h-16 my-auto"></div>

      {/* Right side: Fraction visualizer shape */}
      <div className="flex flex-col items-center space-y-2 min-w-[150px]">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">
          Fraction {viewType === 'pie' ? 'Pie' : 'Bar'} ({numerator}/{denominator})
        </span>

        {viewType === 'pie' ? (
          <svg width="80" height="80" viewBox="0 0 100 100" className="drop-shadow-sm transition-all duration-300 hover:scale-105">
            <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-200 stroke-[1.5]" />
            {renderPieCircle()}
          </svg>
        ) : (
          <div className="py-7 flex items-center justify-center">
            <svg width="150" height="24" viewBox="0 0 160 24" className="drop-shadow-sm transition-all duration-300 hover:scale-105">
              <rect width="160" height="24" rx="2" className="fill-none stroke-slate-200 stroke-[1.5]" />
              {renderBarGrid()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PercentToFractionCalculator() {
  const [percentage, setPercentage] = useState<string>('25');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [percentage]);

  const handleInputChange = (val: string) => {
    // allow numbers, decimals, and negative sign
    let validated = val.replace(/[^\d.-]/g, '');

    // Allow single decimal and single minus sign at start
    const minusIndex = validated.indexOf('-');
    if (minusIndex > 0) {
      validated = validated.replace('-', '');
    }
    const dotCount = (validated.match(/\./g) || []).length;
    if (dotCount > 1) {
      const parts = validated.split('.');
      validated = parts[0] + '.' + parts.slice(1).join('');
    }

    setPercentage(validated);
    setError('');
  };

  const adjustValue = (amount: number) => {
    const currentVal = parseFloat(percentage) || 0;
    const newVal = currentVal + amount;
    // Format to 2 decimal places to prevent float issues
    setPercentage(parseFloat(newVal.toFixed(2)).toString());
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    let newVal = percentage;
    if (char === 'clear') {
      newVal = '0';
    } else if (char === 'back') {
      newVal = percentage.slice(0, -1);
      if (newVal === '' || newVal === '-') newVal = '0';
    } else if (char === '±') {
      if (percentage.startsWith('-')) {
        newVal = percentage.slice(1);
      } else {
        newVal = percentage === '0' ? '-' : '-' + percentage;
      }
    } else if (char === '.') {
      if (!percentage.includes('.')) {
        newVal = percentage + '.';
      }
    } else {
      if (percentage === '0') {
        newVal = char;
      } else {
        newVal = percentage + char;
      }
    }
    setPercentage(newVal);
    setError('');
  };

  // GCD function
  const getGcd = (a: number, b: number): number => {
    let absA = Math.abs(Math.round(a));
    let absB = Math.abs(Math.round(b));
    while (absB) {
      const temp = absB;
      absB = absA % absB;
      absA = temp;
    }
    return absA;
  };

  const computeResult = (): CalculationResult => {
    const pInput = parseFloat(percentage);
    if (isNaN(pInput)) {
      throw new Error('Please enter a valid percentage number.');
    }

    const decimal = pInput / 100;
    
    // Find fraction digits
    const decimalStr = Math.abs(decimal).toString();
    const decimalPlaces = decimalStr.includes('.')
      ? decimalStr.split('.')[1].length
      : 0;

    // Limit decimal precision to 6 places to prevent javascript overflow
    const clampedDecimalPlaces = Math.min(6, decimalPlaces);
    const scaleFactor = Math.pow(10, clampedDecimalPlaces);

    const rawNumerator = decimal * scaleFactor;
    const initialNumerator = Math.round(rawNumerator);
    const initialDenominator = scaleFactor;

    // Simplify the fraction
    const divisor = getGcd(initialNumerator, initialDenominator);
    const simplifiedNumerator = initialNumerator / divisor;
    const simplifiedDenominator = initialDenominator / divisor;

    const steps: string[] = [];
    steps.push(`**Step 1: Convert the percentage to a decimal**`);
    steps.push(`Divide the percentage value by 100:`);
    steps.push(`$$${pInput}\\% = \\frac{${pInput}}{100} = ${decimal.toFixed(clampedDecimalPlaces + 2).replace(/\.?0+$/, '')}$$`);

    steps.push(`\n**Step 2: Express the decimal as a fraction**`);
    steps.push(`Place the decimal digits over its place value ($10^{${clampedDecimalPlaces}}$):`);
    steps.push(`$$${decimal.toFixed(clampedDecimalPlaces).replace(/\.?0+$/, '')} = \\frac{${initialNumerator}}{${initialDenominator}}$$`);

    steps.push(`\n**Step 3: Find the Greatest Common Divisor (GCD)**`);
    steps.push(`Determine the largest number that divides both the numerator and denominator:`);
    steps.push(`$$\\text{GCD}(${Math.abs(initialNumerator)}, ${initialDenominator}) = ${divisor}$$`);

    steps.push(`\n**Step 4: Reduce the fraction to lowest terms**`);
    if (divisor === 1) {
      steps.push(`Since the Greatest Common Divisor is 1, the fraction is already fully simplified:`);
      steps.push(`$$\\frac{${initialNumerator}}{${initialDenominator}}$$`);
    } else {
      steps.push(`Divide both the numerator and denominator by the Greatest Common Divisor (${divisor}):`);
      steps.push(`$$\\frac{${initialNumerator} \\div ${divisor}}{${initialDenominator} \\div ${divisor}} = \\frac{${simplifiedNumerator}}{${simplifiedDenominator}}$$`);
    }

    return {
      percentage: pInput,
      decimal,
      initialNumerator,
      initialDenominator,
      simplifiedFraction: {
        numerator: simplifiedNumerator,
        denominator: simplifiedDenominator,
        gcd: divisor
      },
      steps
    };
  };

  const recalculateSilently = () => {
    try {
      const calcResult = computeResult();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || '');
      setResult(null);
    }
  };

  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeResult();
      setResult(calcResult);
      setHasCalculated(true);
      setError('');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1a1a1a', '#ffffff', '#a1a1a1']
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setPercentage('25');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculateSubmit} className="space-y-6">
        {/* Percentage Input */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-5 py-4 rounded-2xl w-full max-w-xs transition-all hover:border-slate-350 shadow-inner">
            <span className="text-slate-400 font-extrabold text-sm uppercase">Percent:</span>
            <input
              type="text"
              value={percentage}
              onChange={(e) => handleInputChange(e.target.value)}
              className="bg-transparent text-right font-black text-xl text-slate-900 focus:outline-none w-full font-mono"
              placeholder="e.g. 25"
              aria-label="Percentage"
            />
            <span className="text-slate-700 font-black text-xl">%</span>
          </div>

          {/* Stepper Helper */}
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
            {[-10, -1, -0.1, 0.1, 1, 10].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => adjustValue(step)}
                className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors active:scale-95 text-slate-600 shadow-sm"
              >
                {step > 0 ? `+${step}` : step}
              </button>
            ))}
          </div>
        </div>

        {/* On-screen Keypad helper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-xs mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
            Tactile Number Pad
          </span>
          <div className="grid grid-cols-4 gap-2 w-full">
            {['7', '8', '9', 'clear'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyboardInput(key)}
                className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                  key === 'clear' ? 'text-rose-600 text-[10px] uppercase' : 'text-slate-800 text-sm'
                }`}
              >
                {key === 'clear' ? 'Clear' : key}
              </button>
            ))}
            {['4', '5', '6', 'back'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyboardInput(key)}
                className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                  key === 'back' ? 'text-slate-550 text-xs' : 'text-slate-800 text-sm'
                }`}
              >
                {key === 'back' ? '⌫' : key}
              </button>
            ))}
            {['1', '2', '3', '±'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyboardInput(key)}
                className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm text-slate-800 text-sm`}
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyboardInput('0')}
              className="col-span-2 h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardInput('.')}
              className="col-span-2 h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              .
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Convert to Fraction
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-655 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Conversion Results</h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Absolute overlay design */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">%</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Input Percentage</span>
                <div className="text-xl font-extrabold text-slate-200 py-1 font-mono">
                  {result.percentage}%
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Decimal Equivalent</span>
                <div className="text-xl font-extrabold text-slate-200 py-1 font-mono">
                  {result.decimal}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Simplified Fraction</span>
                <div className="text-3xl font-black text-white flex justify-center py-1">
                  <InlineMath math={`\\frac{${result.simplifiedFraction.numerator}}{${result.simplifiedFraction.denominator}}`} />
                </div>
              </div>
            </div>
          </div>

          {/* GCD divisor explanation block */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs leading-relaxed text-slate-600 font-medium">
            {result.simplifiedFraction.gcd === 1 ? (
              <div>
                <strong>GCD is 1:</strong> The fraction <code className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-850">{result.initialNumerator}/{result.initialDenominator}</code> cannot be simplified further because numerator and denominator share no common factors other than 1.
              </div>
            ) : (
              <div>
                <strong>GCD is {result.simplifiedFraction.gcd}:</strong> The largest factor dividing both {result.initialNumerator} and {result.initialDenominator} is {result.simplifiedFraction.gcd}. Dividng both sides simplifies the ratio to the irreducible form:
                <div className="mt-2 pl-3 font-mono text-slate-800">
                  • {result.initialNumerator} ÷ {result.simplifiedFraction.gcd} = {result.simplifiedFraction.numerator} <br />
                  • {result.initialDenominator} ÷ {result.simplifiedFraction.gcd} = {result.simplifiedFraction.denominator}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Mathematical Resolution
            </h4>
            <div className="space-y-4 font-mono text-sm leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => {
                if (step.startsWith('**') && step.endsWith('**')) {
                  return (
                    <strong key={idx} className="text-slate-950 font-extrabold block mt-2 mb-1">
                      {step.replace(/\*\*/g, '')}
                    </strong>
                  );
                }
                const parts = step.split('$$');
                return (
                  <div key={idx} className="block text-slate-700 py-0.5 leading-relaxed">
                    {parts.map((part, index) => {
                      if (index % 2 === 1) {
                        return <InlineMath key={index} math={part} />;
                      }
                      return part;
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Concept Board */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-3 border-b border-slate-200/60 gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-550 flex items-center self-start sm:self-center">
                <i className="fas fa-chart-pie mr-1.5 text-slate-400"></i>
                Live Proportion Visualizers
              </span>
              <div className="flex space-x-1 bg-slate-100 p-0.75 rounded-full border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setViewType('pie')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    viewType === 'pie' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pie View
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('bar')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    viewType === 'bar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bar View
                </button>
              </div>
            </div>

            <FractionVisualizer
              percentage={result.percentage}
              fraction={result.simplifiedFraction}
              viewType={viewType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
