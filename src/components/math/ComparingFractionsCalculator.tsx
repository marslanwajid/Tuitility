'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Fraction {
  numerator: number;
  denominator: number;
}

interface ComparisonResult {
  orderedFractions: {
    originalIndex: number;
    numerator: number;
    denominator: number;
    decimal: string;
    equivalentNumerator: number;
  }[];
  comparativeExpression: string;
  lcd: number;
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

  // Limit display to 3 shapes maximum to avoid layout overflow
  const shapesToDraw = Math.min(3, totalShapes);

  const renderPieCircle = (circleIndex: number) => {
    const isFullCircle = circleIndex < wholes;
    
    // Draw fully filled circle if it's a whole circle
    if (isFullCircle) {
      return (
        <circle cx="50" cy="50" r="40" className="fill-[#1a1a1a] stroke-[#1a1a1a] stroke-2" />
      );
    }

    // Otherwise, draw the pie slices
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

      // Handle denominator = 1
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
    <div className="flex flex-col items-center space-y-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl w-full min-w-[130px] max-w-[200px] transition-all">
      {label && <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">{label}</span>}
      
      {viewType === 'pie' ? (
        <div className="flex items-center space-x-2">
          {shapesToDraw > 0 ? (
            Array.from({ length: shapesToDraw }).map((_, idx) => (
              <svg key={idx} width="56" height="56" viewBox="0 0 100 100" className="drop-shadow-sm transition-all duration-300 hover:scale-105">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-200 stroke-[1.5]" />
                {renderPieCircle(idx)}
              </svg>
            ))
          ) : (
            <svg width="56" height="56" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-200 stroke-[1.5] stroke-dashed" />
            </svg>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-1.5 w-full items-center">
          {shapesToDraw > 0 ? (
            Array.from({ length: shapesToDraw }).map((_, idx) => (
              <svg key={idx} width="140" height="24" viewBox="0 0 160 24" className="drop-shadow-sm transition-all duration-300 hover:scale-[1.02]">
                <rect width="160" height="24" rx="2" className="fill-none stroke-slate-200 stroke-[1.5]" />
                {renderBarGrid(idx)}
              </svg>
            ))
          ) : (
            <svg width="140" height="24" viewBox="0 0 160 24">
              <rect width="160" height="24" rx="2" className="fill-none stroke-slate-200 stroke-[1.5] stroke-dashed" />
            </svg>
          )}
        </div>
      )}

      {totalShapes > 3 && (
        <span className="text-[9px] text-slate-400 italic font-bold">+{totalShapes - 3} more shapes</span>
      )}

      <div className="text-xs font-mono font-black text-slate-800">
        {numerator}/{denominator}
      </div>
    </div>
  );
}

const fractionToLaTeX = (f: Fraction): string => {
  if (f.denominator === 1) {
    return f.numerator.toString();
  }
  if (f.numerator < 0) {
    return `-\\frac{${Math.abs(f.numerator)}}{${f.denominator}}`;
  }
  return `\\frac{${f.numerator}}{${f.denominator}}`;
};

const renderComparingFractionStep = (step: string) => {
  if (step.startsWith('Fraction ') && step.includes(':')) {
    const parts = step.split(':');
    const label = parts[0] + ':';
    const content = parts[1].trim(); 
    
    if (content.includes('=')) {
      const math = content
        .replace(/×/g, '\\times')
        .replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}')
        .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
      return (
        <span>
          {label} <InlineMath math={math} />
        </span>
      );
    } else if (content.includes('(Decimal:')) {
      const fractionPart = content.split(' ')[0]; 
      const decimalPart = content.substring(content.indexOf('(')); 
      
      const mathFraction = fractionPart.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
      return (
        <span>
          {label} <InlineMath math={mathFraction} /> {decimalPart}
        </span>
      );
    }
  }

  if (step.startsWith('Numerators order:')) {
    const math = step.replace('Numerators order:', '').trim()
      .replace(/≤/g, '\\le')
      .replace(/<=/g, '\\le');
    return (
      <span>
        Numerators order: <InlineMath math={math} />
      </span>
    );
  }

  if (step.startsWith('Final Comparison:')) {
    const math = step.replace('Final Comparison:', '').trim()
      .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
      .replace(/</g, '<')
      .replace(/>/g, '>');
    return (
      <span>
        Final Comparison: <InlineMath math={math} />
      </span>
    );
  }

  if (step.includes('[') && step.includes(']')) {
    const numbersList = step.substring(step.indexOf('['), step.indexOf(']') + 1);
    const parts = step.split(numbersList);
    const before = parts[0];
    const after = parts[1];
    
    const finalMatch = after.match(/\d+/);
    if (finalMatch) {
      const finalNum = finalMatch[0];
      const afterParts = after.split(finalNum);
      return (
        <span>
          {before}
          <InlineMath math={numbersList} />
          {afterParts[0]}
          <InlineMath math={finalNum} />
          {afterParts[1]}
        </span>
      );
    }
  }

  return <span>{step}</span>;
};

export default function ComparingFractionsCalculator() {
  const [activeTab, setActiveTab] = useState<'2-fractions' | '3-fractions' | '4-fractions'>('2-fractions');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');

  // Fractions state
  const [fractions, setFractions] = useState<{
    '2-fractions': Fraction[];
    '3-fractions': Fraction[];
    '4-fractions': Fraction[];
  }>({
    '2-fractions': [
      { numerator: 2, denominator: 3 },
      { numerator: 3, denominator: 5 },
    ],
    '3-fractions': [
      { numerator: 2, denominator: 3 },
      { numerator: 3, denominator: 5 },
      { numerator: 1, denominator: 2 },
    ],
    '4-fractions': [
      { numerator: 2, denominator: 3 },
      { numerator: 3, denominator: 5 },
      { numerator: 1, denominator: 2 },
      { numerator: 3, denominator: 4 },
    ],
  });

  useEffect(() => {
    recalculateSilently();
  }, [fractions, activeTab]);

  const getGCD = (a: number, b: number): number => {
    let num1 = Math.abs(a);
    let num2 = Math.abs(b);
    while (num2 !== 0) {
      const temp = num2;
      num2 = num1 % num2;
      num1 = temp;
    }
    return num1;
  };

  const getLCM = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / getGCD(a, b);
  };

  const computeResultsModel = (): ComparisonResult => {
    const activeFractions = fractions[activeTab];

    activeFractions.forEach((f, idx) => {
      if (f.denominator === 0) {
        throw new Error(`Fraction ${idx + 1} has a denominator of zero.`);
      }
    });

    const steps: string[] = ['Fractions to compare:'];
    activeFractions.forEach((f, idx) => {
      steps.push(`Fraction ${idx + 1}: ${f.numerator}/${f.denominator} (Decimal: ${(f.numerator / f.denominator).toFixed(4)})`);
    });

    // Find Least Common Denominator (LCM of all denominators)
    let lcd = activeFractions[0].denominator;
    for (let i = 1; i < activeFractions.length; i++) {
      lcd = getLCM(lcd, activeFractions[i].denominator);
    }
    steps.push(`\n1. Find the Least Common Denominator (LCD):`);
    steps.push(`The Least Common Multiple (LCM) of denominators [${activeFractions.map(f => f.denominator).join(', ')}] is ${lcd}.`);

    // Convert each fraction
    steps.push(`\n2. Convert fractions to equivalent fractions with denominator ${lcd}:`);
    const mapped = activeFractions.map((f, idx) => {
      const scale = lcd / f.denominator;
      const eqNumerator = f.numerator * scale;
      steps.push(
        `Fraction ${idx + 1}: (${f.numerator} × ${scale}) / (${f.denominator} × ${scale}) = ${eqNumerator}/${lcd}`
      );
      return {
        originalIndex: idx,
        numerator: f.numerator,
        denominator: f.denominator,
        decimal: (f.numerator / f.denominator).toFixed(6).replace(/\.?0+$/, ''),
        equivalentNumerator: eqNumerator,
      };
    });

    // Sort fractions based on equivalent numerator
    steps.push(`\n3. Compare converted numerators:`);
    const ordered = [...mapped].sort((a, b) => a.equivalentNumerator - b.equivalentNumerator);
    steps.push(
      `Numerators order: ${ordered.map(item => item.equivalentNumerator).join(' ≤ ')}`
    );

    // Build comparative expression string (e.g. 1/2 < 3/5 < 2/3)
    let comparativeExpression = '';
    steps.push(`\n4. Write original fractions in order:`);
    
    for (let i = 0; i < ordered.length; i++) {
      const current = ordered[i];
      comparativeExpression += `${current.numerator}/${current.denominator}`;
      if (i < ordered.length - 1) {
        const next = ordered[i + 1];
        if (current.equivalentNumerator < next.equivalentNumerator) {
          comparativeExpression += ' < ';
        } else if (current.equivalentNumerator > next.equivalentNumerator) {
          comparativeExpression += ' > ';
        } else {
          comparativeExpression += ' = ';
        }
      }
    }
    steps.push(`Final Comparison: ${comparativeExpression}`);

    return {
      orderedFractions: ordered,
      comparativeExpression,
      lcd,
      steps,
    };
  };

  const recalculateSilently = () => {
    try {
      if (!hasCalculated) return;
      const calcResult = computeResultsModel();
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
      const calcResult = computeResultsModel();
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

  const handleFractionChange = (index: number, field: keyof Fraction, value: string) => {
    const newFractions = { ...fractions };
    const num = parseInt(value);
    const parsedVal = isNaN(num) ? 0 : num;

    let validatedVal = parsedVal;
    if (field === 'denominator' && validatedVal < 1) validatedVal = 1;
    if (field === 'numerator' && validatedVal < 0) validatedVal = 0;

    newFractions[activeTab][index][field] = validatedVal;
    setFractions(newFractions);
  };

  const stepFraction = (index: number, field: keyof Fraction, direction: 'up' | 'down') => {
    const newFractions = { ...fractions };
    const currentVal = newFractions[activeTab][index][field];
    
    let newVal = direction === 'up' ? currentVal + 1 : currentVal - 1;
    if (field === 'denominator' && newVal < 1) newVal = 1;
    if (field === 'numerator' && newVal < 0) newVal = 0;
    
    newFractions[activeTab][index][field] = newVal;
    setFractions(newFractions);
  };

  const handleTabChange = (tab: '2-fractions' | '3-fractions' | '4-fractions') => {
    setActiveTab(tab);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleReset = () => {
    setFractions({
      '2-fractions': [
        { numerator: 2, denominator: 3 },
        { numerator: 3, denominator: 5 },
      ],
      '3-fractions': [
        { numerator: 2, denominator: 3 },
        { numerator: 3, denominator: 5 },
        { numerator: 1, denominator: 2 },
      ],
      '4-fractions': [
        { numerator: 2, denominator: 3 },
        { numerator: 3, denominator: 5 },
        { numerator: 1, denominator: 2 },
        { numerator: 3, denominator: 4 },
      ],
    });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Tab Selectors */}
      <div className="flex justify-center">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          {(['2-fractions', '3-fractions', '4-fractions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleCalculateSubmit} className="space-y-8">
        {/* Fraction Group Inputs */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {fractions[activeTab].map((fraction, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Tactile Fraction Card */}
              <div className="flex flex-col items-center bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-slate-350 transition-all w-28 relative">
                <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-mono font-black flex items-center justify-center border border-white">
                  {index + 1}
                </span>

                {/* Numerator controls */}
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => stepFraction(index, 'numerator', 'down')}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    <i className="fas fa-minus text-[8px]"></i>
                  </button>
                  
                  <input
                    type="number"
                    value={fraction.numerator}
                    onChange={(e) => handleFractionChange(index, 'numerator', e.target.value)}
                    className="w-10 bg-transparent text-center font-bold text-base focus:outline-none text-slate-900 mx-1 border-b border-transparent hover:border-slate-200 focus:border-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`Fraction ${index + 1} Numerator`}
                  />

                  <button
                    type="button"
                    onClick={() => stepFraction(index, 'numerator', 'up')}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    <i className="fas fa-plus text-[8px]"></i>
                  </button>
                </div>

                {/* Division line */}
                <div className="w-full border-t border-slate-350 my-3"></div>

                {/* Denominator controls */}
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => stepFraction(index, 'denominator', 'down')}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    <i className="fas fa-minus text-[8px]"></i>
                  </button>
                  
                  <input
                    type="number"
                    value={fraction.denominator}
                    onChange={(e) => handleFractionChange(index, 'denominator', e.target.value)}
                    className="w-10 bg-transparent text-center font-bold text-base focus:outline-none text-slate-900 mx-1 border-b border-transparent hover:border-slate-200 focus:border-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`Fraction ${index + 1} Denominator`}
                    min="1"
                  />

                  <button
                    type="button"
                    onClick={() => stepFraction(index, 'denominator', 'up')}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    <i className="fas fa-plus text-[8px]"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
            Compare
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

      {/* Results Display */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">Comparison Result</h3>
          
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Absolute overlay design */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">1/2</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Sorted Expression</span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={result.comparativeExpression.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Ranked Order (Ascending)</span>
                <div className="space-y-2 pt-1">
                  {result.orderedFractions.map((item, rank) => (
                    <div key={rank} className="flex items-center justify-between text-xs text-slate-350 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/50">
                      <span className="font-bold flex items-center text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[9px] font-black flex items-center justify-center mr-2">
                          {rank + 1}
                        </span>
                        Fraction {item.originalIndex + 1} ({item.numerator}/{item.denominator})
                      </span>
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80 text-white font-black">
                        val: {item.decimal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-3 font-mono text-sm text-slate-700 leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-2.5 last:pb-0 border-b last:border-b-0 border-slate-100 white-space-pre-line">
                  {renderComparingFractionStep(step)}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Concept Board */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-2.5 border-b border-slate-200/60 gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                <i className="fas fa-chart-pie mr-1.5 text-slate-400"></i>
                Live Concepts Visualizer
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
            
            <div className="flex flex-wrap items-center justify-center gap-6 py-2 w-full">
              {fractions[activeTab].map((frac, idx) => (
                <FractionVisualizer
                  key={idx}
                  numerator={frac.numerator}
                  denominator={frac.denominator}
                  label={`Fraction ${idx + 1}`}
                  viewType={viewType}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
