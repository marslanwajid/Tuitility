import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import confetti from 'canvas-confetti';
import 'katex/dist/katex.min.css';

interface DecimalToFractionResult {
  decimal: string;
  fractionForm: string; // "3/8" or "-3/8"
  mixedNumber: string; // "1 3/4" or "-1 3/4"
  numerator: number;
  denominator: number;
  isNegative: boolean;
  isRepeating: boolean;
  steps: string[];
}

export default function DecimalToFractionCalculator() {
  const [decimalInput, setDecimalInput] = useState<string>('0.375');
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [nonRepeatingPart, setNonRepeatingPart] = useState<string>('0.1');
  const [repeatingPart, setRepeatingPart] = useState<string>('6');
  
  const [result, setResult] = useState<DecimalToFractionResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [viewType, setViewType] = useState<'ruler' | 'pie'>('ruler');

  useEffect(() => {
    recalculateSilently();
  }, [decimalInput, isRepeating, nonRepeatingPart, repeatingPart]);

  const recalculateSilently = () => {
    try {
      if (!hasCalculated) return;
      const calcResult = computeConversionModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || '');
      setResult(null);
    }
  };

  const getGCD = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  };

  const computeConversionModel = (): DecimalToFractionResult => {
    if (!isRepeating) {
      // 1. Terminating Decimal Solver
      const cleaned = decimalInput.trim();
      const numVal = parseFloat(cleaned);
      if (isNaN(numVal) || !isFinite(numVal)) {
        throw new Error('Please enter a valid decimal number.');
      }

      const isNegative = numVal < 0;
      const absVal = Math.abs(numVal);
      const wholePart = Math.floor(absVal);
      
      // Determine number of decimal places
      let decimalPlaces = 0;
      const dotIndex = cleaned.indexOf('.');
      if (dotIndex !== -1) {
        // Strip trailing zeros to avoid bloated powers of 10
        const fractionalStr = cleaned.slice(dotIndex + 1).replace(/0+$/, '');
        decimalPlaces = fractionalStr.length;
      }

      const scale = Math.pow(10, decimalPlaces);
      const rawNumerator = Math.round(absVal * scale);
      const rawDenominator = scale;

      const gcd = getGCD(rawNumerator, rawDenominator);
      const numerator = rawNumerator / gcd;
      const denominator = rawDenominator / gcd;

      // Formatting steps
      const steps: string[] = ['**Step 1: Write down the decimal divided by 1**'];
      const signStr = isNegative ? '-' : '';
      steps.push(`$x = ${signStr}${absVal} = \\frac{${signStr}${absVal}}{1}$`);

      steps.push(`\n**Step 2: Multiply both top and bottom by 10 for every digit after the decimal point**`);
      steps.push(`Since there are ${decimalPlaces} digits after the decimal point, multiply by $10^{${decimalPlaces}} = ${scale}$:`);
      steps.push(`$x = \\frac{${signStr}${absVal} \\times ${scale}}{1 \\times ${scale}} = \\frac{${signStr}${rawNumerator}}{${rawDenominator}}$`);

      steps.push(`\n**Step 3: Simplify the fraction**`);
      steps.push(`Find the Greatest Common Divisor (GCD) of $${rawNumerator}$ and $${rawDenominator}$, which is $${gcd}$.`);
      steps.push(`Divide both the numerator and the denominator by $${gcd}$:`);
      steps.push(`$x = \\frac{${signStr}${rawNumerator} \\div ${gcd}}{${rawDenominator} \\div ${gcd}} = \\frac{${signStr}${numerator}}{${denominator}}$`);

      // Mixed number representation
      let mixedNumber = '';
      if (wholePart > 0 && numerator !== denominator && denominator !== 1) {
        const remainder = numerator % denominator;
        if (remainder > 0) {
          mixedNumber = `${signStr}${wholePart} \\frac{${remainder}}{${denominator}}`;
          steps.push(`\n**Step 4: Convert to a mixed number**`);
          steps.push(`$x = ${signStr}${wholePart} \\frac{${remainder}}{${denominator}}$`);
        }
      }

      const fractionForm = `${isNegative ? '-' : ''}${numerator}/${denominator}`;

      return {
        decimal: cleaned,
        fractionForm,
        mixedNumber: mixedNumber || fractionForm,
        numerator,
        denominator,
        isNegative,
        isRepeating: false,
        steps,
      };
    } else {
      // 2. Repeating Decimal Solver (Algebraic Method)
      const cleanNonRep = nonRepeatingPart.trim();
      const cleanRep = repeatingPart.trim();

      if (!/^-?\d*(\.\d*)?$/.test(cleanNonRep) || cleanNonRep === '') {
        throw new Error('Please enter a valid non-repeating starting decimal (e.g. 0.1).');
      }
      if (!/^\d+$/.test(cleanRep) || cleanRep === '') {
        throw new Error('Please enter a valid repeating period (e.g. 6).');
      }

      const numNonRep = parseFloat(cleanNonRep);
      if (isNaN(numNonRep)) {
        throw new Error('Invalid non-repeating decimal format.');
      }

      const isNegative = numNonRep < 0 || cleanNonRep.startsWith('-');
      const absNonRep = Math.abs(numNonRep);

      // Determine decimal digits of non-repeating part
      let dA = 0;
      const dotIndex = cleanNonRep.indexOf('.');
      if (dotIndex !== -1) {
        dA = cleanNonRep.slice(dotIndex + 1).length;
      }

      const dB = cleanRep.length;

      // N1 = 10^dA, N2 = 10^(dA + dB)
      const scale1 = Math.pow(10, dA);
      const scale2 = Math.pow(10, dA + dB);

      // Calculate V1 (value shifted to clear non-repeating digits)
      const v1 = Math.round(absNonRep * scale1);
      
      // Calculate V2 (value shifted to clear one repeating cycle)
      // V2 = V1 * 10^dB + repeating period integer
      const repVal = parseInt(cleanRep);
      const v2 = v1 * Math.pow(10, dB) + repVal;

      const numDiff = v2 - v1;
      const denDiff = scale2 - scale1;

      const gcd = getGCD(numDiff, denDiff);
      const numerator = numDiff / gcd;
      const denominator = denDiff / gcd;

      // Build LaTeX steps
      const repPattern = `${cleanRep}${cleanRep}...`;
      const fullDecimalString = `${isNegative ? '-' : ''}${absNonRep.toFixed(dA).replace(/\.$/, '')}${repPattern}`;
      
      const steps: string[] = ['**Step 1: Set up the algebraic equations**'];
      steps.push(`Let $x = ${absNonRep.toFixed(dA).replace(/\.$/, '')}\\overline{${cleanRep}}$ (Equation 0)`);

      steps.push(`\n**Step 2: Multiply by $10^{dA}$ to shift the decimal point past the non-repeating part**`);
      steps.push(`Since there is/are ${dA} digit(s) in the non-repeating fractional part, multiply by $10^{${dA}} = ${scale1}$:`);
      steps.push(`$${scale1}x = ${v1}.${repPattern}$ (Equation 1)`);

      steps.push(`\n**Step 3: Multiply by $10^{dA + dB}$ to shift the decimal past the first repeating cycle**`);
      steps.push(`Since the repeating cycle has length ${dB}, multiply the original equation by $10^{${dA + dB}} = ${scale2}$:`);
      steps.push(`$${scale2}x = ${v2}.${repPattern}$ (Equation 2)`);

      steps.push(`\n**Step 4: Subtract Equation 1 from Equation 2 to eliminate the repeating decimal tail**`);
      steps.push(`$(${scale2}x) - (${scale1}x) = (${v2}.${repPattern}) - (${v1}.${repPattern})$`);
      steps.push(`$${denDiff}x = ${numDiff}$`);

      steps.push(`\n**Step 5: Solve for $x$ and simplify**`);
      steps.push(`$x = \\frac{${numDiff}}{${denDiff}}$`);
      
      steps.push(`Find the Greatest Common Divisor (GCD) of $${numDiff}$ and $${denDiff}$, which is $${gcd}$.`);
      steps.push(`Divide both the numerator and denominator by $${gcd}$:`);
      
      const signStr = isNegative ? '-' : '';
      steps.push(`$x = ${signStr}\\frac{${numDiff} \\div ${gcd}}{${denDiff} \\div ${gcd}} = ${signStr}\\frac{${numerator}}{${denominator}}$`);

      // Mixed number representation
      const wholePart = Math.floor(numerator / denominator);
      let mixedNumber = '';
      if (wholePart > 0 && numerator !== denominator && denominator !== 1) {
        const remainder = numerator % denominator;
        if (remainder > 0) {
          mixedNumber = `${signStr}${wholePart} \\frac{${remainder}}{${denominator}}`;
          steps.push(`\n**Step 6: Convert to a mixed number**`);
          steps.push(`$x = ${signStr}${wholePart} \\frac{${remainder}}{${denominator}}$`);
        }
      }

      const fractionForm = `${isNegative ? '-' : ''}${numerator}/${denominator}`;

      return {
        decimal: fullDecimalString,
        fractionForm,
        mixedNumber: mixedNumber || fractionForm,
        numerator,
        denominator,
        isNegative,
        isRepeating: true,
        steps,
      };
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeConversionModel();
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
    setDecimalInput('0.375');
    setIsRepeating(false);
    setNonRepeatingPart('0.1');
    setRepeatingPart('6');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const adjustDecimal = (amount: number) => {
    const parsed = parseFloat(decimalInput);
    if (isNaN(parsed)) {
      setDecimalInput((0 + amount).toFixed(3));
    } else {
      setDecimalInput((parsed + amount).toFixed(3));
    }
  };

  const renderStep = (step: string) => {
    if (step.startsWith('**') && step.endsWith('**')) {
      return <strong className="text-slate-900 font-extrabold block mt-2 mb-1">{step.replace(/\*\*/g, '')}</strong>;
    }
    const parts = step.split('$');
    return (
      <span className="block text-slate-700 py-0.5">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return <InlineMath key={index} math={part} />;
          }
          return part;
        })}
      </span>
    );
  };

  const renderRuler = () => {
    if (!result) return null;
    const value = result.numerator / result.denominator;
    const sign = result.isNegative ? -1 : 1;
    const finalVal = value * sign;

    const lowerInt = Math.floor(finalVal);
    const upperInt = Math.ceil(finalVal) === lowerInt ? lowerInt + 1 : Math.ceil(finalVal);
    const range = upperInt - lowerInt;
    
    // Position percentage on our horizontal slider (0% to 100% of the SVG width)
    const positionPercent = ((finalVal - lowerInt) / range) * 100;

    // Build ruler tick values
    const ticks: number[] = [];
    const stepVal = range / 10;
    for (let i = 0; i <= 10; i++) {
      ticks.push(lowerInt + i * stepVal);
    }

    return (
      <div className="w-full bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
        <div className="flex items-center justify-between w-full pb-2 border-b border-slate-200/60">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Number Line Visualizer
          </span>
        </div>

        <div className="w-full py-4 relative">
          <svg viewBox="0 0 400 60" className="w-full overflow-visible">
            {/* Main axis line */}
            <line x1="20" y1="35" x2="380" y2="35" className="stroke-slate-300 stroke-[2]" />
            
            {/* Ticks and labels */}
            {ticks.map((tick, idx) => {
              const xPos = 20 + (idx / 10) * 360;
              const isBoundary = idx === 0 || idx === 10;
              return (
                <g key={idx}>
                  <line 
                    x1={xPos} 
                    y1={isBoundary ? 27 : 30} 
                    x2={xPos} 
                    y2={isBoundary ? 43 : 40} 
                    className="stroke-slate-350 stroke-[1.5]" 
                  />
                  <text 
                    x={xPos} 
                    y="53" 
                    textAnchor="middle" 
                    className={`font-mono text-[9px] font-bold ${isBoundary ? 'fill-slate-800 font-extrabold' : 'fill-slate-400'}`}
                  >
                    {tick.toFixed(1).replace(/\.0$/, '')}
                  </text>
                </g>
              );
            })}

            {/* Position Marker flag */}
            {(() => {
              const xMarker = 20 + (positionPercent / 100) * 360;
              return (
                <g className="transition-all duration-500">
                  <line x1={xMarker} y1="12" x2={xMarker} y2="35" className="stroke-slate-900 stroke-[1.5] stroke-dashed" />
                  <circle cx={xMarker} cy="35" r="4.5" className="fill-slate-900 stroke-white stroke-[1.5]" />
                  <rect 
                    x={xMarker - 25} 
                    y="-4" 
                    width="50" 
                    height="14" 
                    rx="3" 
                    className="fill-slate-900 stroke-white stroke-[1]" 
                  />
                  <text 
                    x={xMarker} 
                    y="6" 
                    textAnchor="middle" 
                    className="fill-white font-mono text-[8px] font-extrabold"
                  >
                    {finalVal.toFixed(3).replace(/\.?0+$/, '')}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    );
  };

  const renderPie = () => {
    if (!result) return null;
    const value = result.numerator / result.denominator;
    // We only render fractions up to 1 correctly in simple circles, clamp or draw remaining segments
    const fractionPart = value - Math.floor(value);
    const percentage = fractionPart * 100;
    
    // Pie circle SVG computation
    const radius = 32;
    const circ = 2 * Math.PI * radius;
    const strokeDash = circ;
    const strokeOffset = circ - (fractionPart * circ);

    return (
      <div className="w-full bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
        <div className="flex items-center justify-between w-full pb-2 border-b border-slate-200/60">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Shaded Pie Representation (Fractional Part)
          </span>
        </div>

        <div className="flex flex-col items-center py-2 space-y-2">
          <svg width="100" height="100" viewBox="0 0 80 80" className="drop-shadow-sm hover:scale-105 transition-transform">
            <circle cx="40" cy="40" r={radius} className="fill-slate-50 stroke-slate-200 stroke-[1.5]" />
            {fractionPart > 0 && (
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="fill-none stroke-slate-900 stroke-[32] origin-[40px_40px] -rotate-90 transition-all duration-500"
                style={{
                  strokeDasharray: strokeDash,
                  strokeDashoffset: strokeOffset,
                }}
              />
            )}
            <circle cx="40" cy="40" r={radius} className="fill-none stroke-slate-900 stroke-[1.5]" />
          </svg>
          <div className="text-center font-mono text-xs font-bold text-slate-500">
            Shaded portion: <span className="text-slate-900">{percentage.toFixed(1).replace(/\.0$/, '')}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Input Form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        
        {/* Repeating Decimal Toggle */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-150/60">
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-extrabold text-slate-900 block font-display">
              Repeating Decimal (Recurring)?
            </span>
            <span className="text-[10px] text-slate-400 font-bold block">
              Toggle for repeating tail (e.g. 0.333... vs 0.375)
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isRepeating} 
              onChange={(e) => {
                setIsRepeating(e.target.checked);
                setError('');
              }}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
          </label>
        </div>

        {/* Dynamic Steppers / Numeric Fields */}
        {!isRepeating ? (
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block text-left">
              Decimal Value:
            </span>
            <div className="flex items-center justify-center bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm max-w-xs mx-auto relative">
              <button
                type="button"
                onClick={() => adjustDecimal(-0.05)}
                className="w-8 h-8 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-xs font-bold"
              >
                -0.05
              </button>
              <input
                type="text"
                value={decimalInput}
                onChange={(e) => {
                  setDecimalInput(e.target.value);
                  setError('');
                }}
                className="w-24 bg-transparent text-center font-bold text-lg focus:outline-none text-slate-900 mx-2"
                placeholder="0.375"
              />
              <button
                type="button"
                onClick={() => adjustDecimal(0.05)}
                className="w-8 h-8 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-xs font-bold"
              >
                +0.05
              </button>
            </div>
            <div className="flex justify-center space-x-2 text-[10px] text-slate-400 font-bold">
              <span>Quick values:</span>
              <button type="button" onClick={() => setDecimalInput('0.125')} className="underline hover:text-slate-600">0.125</button>
              <span>•</span>
              <button type="button" onClick={() => setDecimalInput('0.625')} className="underline hover:text-slate-600">0.625</button>
              <span>•</span>
              <button type="button" onClick={() => setDecimalInput('1.75')} className="underline hover:text-slate-600">1.75</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Non-repeating inputs */}
            <div className="bg-white border border-slate-200/85 p-5 rounded-2xl text-left space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Non-Repeating Part:
              </span>
              <input
                type="text"
                value={nonRepeatingPart}
                onChange={(e) => {
                  setNonRepeatingPart(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-slate-400"
                placeholder="e.g. 0.1"
              />
              <span className="text-[9px] text-slate-400 italic font-medium block">
                Digits before the repeat tail begins.
              </span>
            </div>

            {/* Repeating inputs */}
            <div className="bg-white border border-slate-200/85 p-5 rounded-2xl text-left space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Repeating Period (Recurring):
              </span>
              <input
                type="text"
                value={repeatingPart}
                onChange={(e) => {
                  setRepeatingPart(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-slate-400 font-mono"
                placeholder="e.g. 6"
              />
              <span className="text-[9px] text-slate-400 italic font-medium block">
                The recurring tail digits (e.g. 0.1666... = 6).
              </span>
            </div>
          </div>
        )}

        {/* Error Block */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
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
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results Block */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Conversion Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Input Decimal card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Decimal Form</span>
              <span className="text-xl font-extrabold text-slate-900">
                {isRepeating ? (
                  <span>
                    {nonRepeatingPart}
                    <span className="underline decoration-slate-900 decoration-2">{repeatingPart}</span>
                  </span>
                ) : (
                  result.decimal
                )}
              </span>
            </div>

            {/* Fraction Form card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fraction Form</span>
              <span className="text-xl font-extrabold text-slate-900 flex justify-center items-center">
                <InlineMath math={result.mixedNumber.replace(/(-?\d+)\s+(\d+)\s*\/\s*(\d+)/g, '$1\\frac{$2}{$3}').replace(/(-?\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')} />
              </span>
            </div>

            {/* Percentage card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Percentage Form</span>
              <span className="text-xl font-extrabold text-slate-900">
                {((result.numerator / result.denominator) * (result.isNegative ? -1 : 1) * 100).toFixed(2).replace(/\.00$/, '')}%
              </span>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Algebraic Step-by-Step
            </h4>
            <div className="space-y-3 font-mono text-sm leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-1 border-b last:border-b-0 border-slate-50">
                  {renderStep(step)}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Concept Board - Toggles */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-slate-100 p-0.75 rounded-full border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setViewType('ruler')}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    viewType === 'ruler' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Number Line
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('pie')}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    viewType === 'pie' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pie Shading
                </button>
              </div>
            </div>

            {viewType === 'ruler' ? renderRuler() : renderPie()}
          </div>

        </div>
      )}
    </div>
  );
}
