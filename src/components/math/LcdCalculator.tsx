'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Fraction {
  numerator: number;
  denominator: number;
}

interface LcdResult {
  lcd: number;
  equivalentFractions: Fraction[];
  multipliers: number[];
  steps: string[];
}

interface FractionVisualizerProps {
  numerator: number;
  denominator: number;
  label?: string;
  viewType: 'pie' | 'bar';
}

function FractionVisualizer({ numerator, denominator, label, viewType }: FractionVisualizerProps) {
  if (denominator <= 0) return null;

  const wholes = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  const totalShapes = wholes + (remainder > 0 ? 1 : 0);

  // Limit display to 2 shapes maximum to avoid horizontal page overflow
  const shapesToDraw = Math.min(2, totalShapes);

  const renderPieCircle = (circleIndex: number) => {
    const isFullCircle = circleIndex < wholes;
    
    if (isFullCircle) {
      return (
        <circle cx="50" cy="50" r="40" className="fill-[#1a1a1a] stroke-[#1a1a1a] stroke-2" />
      );
    }

    const paths = [];
    for (let i = 0; i < denominator; i++) {
      const angleStep = (2 * Math.PI) / denominator;
      const angleStart = i * angleStep - Math.PI / 2;
      const angleEnd = (i + 1) * angleStep - Math.PI / 2;

      const x1 = 50 + 40 * Math.cos(angleStart);
      const y1 = 50 + 40 * Math.sin(angleStart);
      const x2 = 50 + 40 * Math.cos(angleEnd);
      const y2 = 50 + 40 * Math.sin(angleEnd);

      const isShaded = i < remainder;

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

  const renderBarGrid = (barIndex: number) => {
    const isFullBar = barIndex < wholes;
    const activeBlocks = isFullBar ? denominator : remainder;

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

  return (
    <div className="flex flex-col items-center space-y-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl w-full min-w-[120px] max-w-[180px] transition-all">
      {label && <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">{label}</span>}
      
      {viewType === 'pie' ? (
        <div className="flex items-center space-x-1.5 justify-center">
          {shapesToDraw > 0 ? (
            Array.from({ length: shapesToDraw }).map((_, idx) => (
              <svg key={idx} width="52" height="52" viewBox="0 0 100 100" className="drop-shadow-sm transition-all duration-300 hover:scale-105">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-200 stroke-[1.5]" />
                {renderPieCircle(idx)}
              </svg>
            ))
          ) : (
            <svg width="52" height="52" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-200 stroke-[1.5] stroke-dashed" />
            </svg>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-1.5 w-full items-center">
          {shapesToDraw > 0 ? (
            Array.from({ length: shapesToDraw }).map((_, idx) => (
              <svg key={idx} width="120" height="20" viewBox="0 0 160 24" className="drop-shadow-sm transition-all duration-300 hover:scale-[1.02]">
                <rect width="160" height="24" rx="2" className="fill-none stroke-slate-200 stroke-[1.5]" />
                {renderBarGrid(idx)}
              </svg>
            ))
          ) : (
            <svg width="120" height="20" viewBox="0 0 160 24">
              <rect width="160" height="24" rx="2" className="fill-none stroke-slate-200 stroke-[1.5] stroke-dashed" />
            </svg>
          )}
        </div>
      )}

      <div className="text-xs font-black font-mono text-slate-700">
        {numerator}/{denominator}
      </div>
    </div>
  );
}

const gcd = (a: number, b: number): number => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return Math.abs(a);
};

const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

const lcmOfArray = (arr: number[]): number => {
  return arr.reduce((acc, val) => lcm(acc, val), arr[0] || 1);
};

const getPrimeFactors = (n: number): Record<number, number> => {
  const factors: Record<number, number> = {};
  let temp = n;
  for (let i = 2; i <= temp; i++) {
    while (temp % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      temp = temp / i;
    }
  }
  return factors;
};

export default function LcdCalculator() {
  const [fractions, setFractions] = useState<Fraction[]>([
    { numerator: 1, denominator: 2 },
    { numerator: 2, denominator: 3 }
  ]);
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  const [result, setResult] = useState<LcdResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [fractions]);

  const recalculateSilently = () => {
    try {
      const calcResult = computeLcdModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const handleFractionChange = (index: number, field: keyof Fraction, value: number) => {
    const updated = [...fractions];
    if (field === 'denominator') {
      // Clamped denominator limits: 1 to 100
      updated[index].denominator = Math.min(100, Math.max(1, value));
    } else {
      // Clamped numerator limits: 0 to 100
      updated[index].numerator = Math.min(100, Math.max(0, value));
    }
    setFractions(updated);
  };

  const addFraction = () => {
    if (fractions.length < 4) {
      setFractions([...fractions, { numerator: 1, denominator: 4 }]);
    }
  };

  const removeFraction = (index: number) => {
    if (fractions.length > 2) {
      const updated = fractions.filter((_, idx) => idx !== index);
      setFractions(updated);
    }
  };

  const computeLcdModel = (): LcdResult => {
    const denominators = fractions.map(f => f.denominator);
    
    // Check if any denominator is <= 0
    if (denominators.some(d => d <= 0)) {
      throw new Error('Denominators must be greater than 0.');
    }

    const lcdVal = lcmOfArray(denominators);

    const multipliers = fractions.map(f => lcdVal / f.denominator);
    const equivalentFractions = fractions.map((f, idx) => ({
      numerator: f.numerator * multipliers[idx],
      denominator: lcdVal
    }));

    const steps: string[] = [];
    steps.push('**Step 1: Extract the denominators of all fractions**');
    steps.push(`The denominators are: $${denominators.join(', ')}$`);

    steps.push('\n**Step 2: Find the Least Common Multiple (LCM) of the denominators**');
    
    // Listing Multiples Method
    steps.push('*Method A: Listing Multiples*');
    denominators.forEach(d => {
      const mults = Array.from({ length: 6 }).map((_, idx) => d * (idx + 1));
      steps.push(`Multiples of $${d}$: $${mults.join(', ')}, \\dots$`);
    });

    // Prime Factorization Method
    steps.push('\n*Method B: Prime Factorization*');
    const allPrimeFactors: Record<number, number> = {};
    denominators.forEach(d => {
      const factors = getPrimeFactors(d);
      const parts = Object.entries(factors).map(([p, exp]) => `${p}^{${exp}}`);
      steps.push(`$${d} = ${parts.join(' \\times ') || '1'}$`);

      Object.entries(factors).forEach(([p, exp]) => {
        const prime = parseInt(p);
        allPrimeFactors[prime] = Math.max(allPrimeFactors[prime] || 0, exp);
      });
    });

    const factorizationParts = Object.entries(allPrimeFactors).map(([p, exp]) => `${p}^{${exp}}`);
    steps.push(`Take the highest power of each prime factor:`);
    steps.push(`$\\text{LCM} = ${factorizationParts.join(' \\times ') || '1'} = ${lcdVal}$`);

    steps.push(`\n**Step 3: Calculate scaling factors for each fraction**`);
    fractions.forEach((f, idx) => {
      const mult = multipliers[idx];
      steps.push(`For Fraction ${idx + 1} ($\\frac{${f.numerator}}{${f.denominator}}$): Multiply numerator and denominator by $${lcdVal} \\div ${f.denominator} = ${mult}$`);
    });

    steps.push(`\n**Step 4: Scale fractions to their equivalent forms**`);
    fractions.forEach((f, idx) => {
      const mult = multipliers[idx];
      const eqNum = equivalentFractions[idx].numerator;
      steps.push(`$\\frac{${f.numerator}}{${f.denominator}} = \\frac{${f.numerator} \\times ${mult}}{${f.denominator} \\times ${mult}} = \\frac{${eqNum}}{${lcdVal}}$`);
    });

    return {
      lcd: lcdVal,
      equivalentFractions,
      multipliers,
      steps
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeLcdModel();
      setResult(calcResult);
      setHasCalculated(true);
      setError('');

      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#1a1a1a', '#ffffff', '#808080']
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setFractions([
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 3 }
    ]);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Fraction Entry Cards */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {fractions.map((fraction, index) => (
            <div key={index} className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 flex flex-col space-y-4 relative group">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  Fraction #{index + 1}
                </span>
                {fractions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeFraction(index)}
                    className="w-5 h-5 rounded-full bg-slate-200/60 hover:bg-rose-100 hover:text-rose-600 transition-colors flex items-center justify-center text-[10px]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Fraction Cards Steppers */}
              <div className="flex flex-col items-center space-y-3.5">
                
                {/* Numerator Stepper */}
                <div className="flex items-center space-x-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => handleFractionChange(index, 'numerator', fraction.numerator - 1)}
                    className="w-8 h-8 rounded-full border border-slate-250 bg-white hover:bg-slate-100 text-slate-700 font-black text-sm active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm min-w-[56px] text-center">
                    <span className="text-[8px] text-slate-450 uppercase font-black tracking-tight leading-none mb-0.5">Num</span>
                    <input
                      type="number"
                      value={fraction.numerator}
                      onChange={(e) => handleFractionChange(index, 'numerator', parseInt(e.target.value) || 0)}
                      className="w-8 text-center text-sm font-extrabold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFractionChange(index, 'numerator', fraction.numerator + 1)}
                    className="w-8 h-8 rounded-full border border-slate-250 bg-white hover:bg-slate-100 text-slate-700 font-black text-sm active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>

                <div className="w-16 h-[2px] bg-slate-300 rounded-full" />

                {/* Denominator Stepper */}
                <div className="flex items-center space-x-2 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => handleFractionChange(index, 'denominator', fraction.denominator - 1)}
                    className="w-8 h-8 rounded-full border border-slate-250 bg-white hover:bg-slate-100 text-slate-700 font-black text-sm active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm min-w-[56px] text-center">
                    <span className="text-[8px] text-slate-450 uppercase font-black tracking-tight leading-none mb-0.5">Den</span>
                    <input
                      type="number"
                      value={fraction.denominator}
                      onChange={(e) => handleFractionChange(index, 'denominator', parseInt(e.target.value) || 1)}
                      className="w-8 text-center text-sm font-extrabold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFractionChange(index, 'denominator', fraction.denominator + 1)}
                    className="w-8 h-8 rounded-full border border-slate-250 bg-white hover:bg-slate-100 text-slate-700 font-black text-sm active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>

              </div>
            </div>
          ))}

          {/* Add Fraction button slot */}
          {fractions.length < 4 && (
            <button
              type="button"
              onClick={addFraction}
              className="border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center space-y-2 p-5 min-h-[160px] text-slate-450 hover:text-slate-650 transition-all active:scale-98"
            >
              <i className="fas fa-plus text-base"></i>
              <span className="text-xs font-extrabold">Add Fraction</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate LCD
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

      {/* Error Message block */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Calculator Results Display */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Computation Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* LCD Card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[100px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Lowest Common Denominator (LCD)</span>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {result.lcd}
              </span>
            </div>

            {/* Equivalent Fractions Display Card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[100px] space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Equivalent Fractions</span>
              <div className="flex justify-center items-center space-x-3 text-sm font-black text-slate-900 font-mono">
                {result.equivalentFractions.map((f, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-350">,</span>}
                    <InlineMath math={`\\frac{${f.numerator}}{${f.denominator}}`} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step LCD Resolution
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
                const parts = step.split('$');
                return (
                  <div key={idx} className="block text-slate-750 py-0.5 leading-relaxed">
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

          {/* Real-time Subdivided Concepts Visualizer */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-3 border-b border-slate-200/60 gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center self-start sm:self-center">
                <i className="fas fa-chart-pie mr-1.5 text-slate-400"></i>
                Equivalent Subdivision Visualizer
              </span>
              <div className="flex space-x-1.5 bg-slate-150 p-1.5 rounded-full border border-slate-200/40 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setViewType('pie')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'pie' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pie View
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('bar')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'bar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bar View
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Original Fractions panel */}
              <div className="flex flex-col items-center space-y-3.5 bg-white border border-slate-150 p-5 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Original Fractions (Different Denominators)</span>
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  {fractions.map((f, idx) => (
                    <FractionVisualizer
                      key={idx}
                      numerator={f.numerator}
                      denominator={f.denominator}
                      label={`Fraction #${idx + 1}`}
                      viewType={viewType}
                    />
                  ))}
                </div>
              </div>

              {/* Subdivided Equivalent Fractions panel */}
              <div className="flex flex-col items-center space-y-3.5 bg-white border border-slate-150 p-5 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Equivalent Fractions (Common LCD = {result.lcd})</span>
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  {result.equivalentFractions.map((f, idx) => (
                    <FractionVisualizer
                      key={idx}
                      numerator={f.numerator}
                      denominator={f.denominator}
                      label={`Scaled #${idx + 1}`}
                      viewType={viewType}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-4 rounded-2xl w-full text-center max-w-3xl shadow-inner text-xs text-slate-500 leading-relaxed font-medium">
              <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-widest block mb-1">Visualization Guide:</span>
              Compare the <span className="font-bold text-slate-800">Original</span> shapes with the <span className="font-bold text-slate-800">Equivalent</span> shapes. Notice how each equivalent shape is divided into exactly <span className="font-bold text-slate-800">{result.lcd}</span> equal subdivisions, yet the total shaded area relative to each shape remains exactly the same.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
