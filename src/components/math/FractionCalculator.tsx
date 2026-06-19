'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Fraction {
  numerator: number;
  denominator: number;
}

interface CalculationResult {
  fraction: string;
  decimal: string;
  mixedNumber: string;
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

      // Handle the case where denominator is 1
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

      // Draw standard slice path
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
      {label && <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">{label}</span>}
      
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

export default function FractionCalculator() {
  const [activeTab, setActiveTab] = useState<'2-fractions' | '3-fractions' | '4-fractions'>('2-fractions');
  const [result, setResult] = useState<CalculationResult | null>(null);
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
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
    ],
    '3-fractions': [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 8 },
    ],
    '4-fractions': [
      { numerator: 1, denominator: 2 },
      { numerator: 1, denominator: 4 },
      { numerator: 1, denominator: 8 },
      { numerator: 1, denominator: 16 },
    ],
  });

  // Operators state
  const [operators, setOperators] = useState<{
    '2-fractions': string[];
    '3-fractions': string[];
    '4-fractions': string[];
  }>({
    '2-fractions': ['+'],
    '3-fractions': ['+', '+'],
    '4-fractions': ['+', '+', '+'],
  });

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const handleOperatorChange = (index: number, op: string) => {
    const newOperators = { ...operators };
    newOperators[activeTab][index] = op;
    setOperators(newOperators);
  };

  const opLabels: Record<string, string> = {
    '+': 'fa-plus',
    '-': 'fa-minus',
    '*': 'fa-times',
    '/': 'fa-divide',
  };

  // Auto-calculate on state change to make visualizer dynamic
  useEffect(() => {
    // Soft recalculate to keep result model updated, but don't fire confetti automatically
    recalculateSilently();
  }, [fractions, operators, activeTab]);

  // Greatest Common Divisor
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

  // Least Common Multiple
  const getLCM = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / getGCD(a, b);
  };

  const simplifyFraction = (numerator: number, denominator: number): Fraction => {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero.');
    }
    const gcd = getGCD(numerator, denominator);
    let simplifiedNum = numerator / gcd;
    let simplifiedDen = denominator / gcd;

    if (simplifiedDen < 0) {
      simplifiedNum = -simplifiedNum;
      simplifiedDen = -simplifiedDen;
    }

    return { numerator: simplifiedNum, denominator: simplifiedDen };
  };

  const fractionToString = (f: Fraction): string => {
    if (f.denominator === 1) {
      return f.numerator.toString();
    }
    return `${f.numerator}/${f.denominator}`;
  };

  const fractionToMixedNumber = (f: Fraction): string => {
    const absNum = Math.abs(f.numerator);
    const whole = Math.floor(absNum / f.denominator);
    const remainder = absNum % f.denominator;
    const sign = f.numerator < 0 ? '-' : '';

    if (whole === 0) {
      return fractionToString(f);
    } else if (remainder === 0) {
      return `${sign}${whole}`;
    } else {
      return `${sign}${whole} ${remainder}/${f.denominator}`;
    }
  };

  const addFractions = (f1: Fraction, f2: Fraction): Fraction => {
    const lcm = getLCM(f1.denominator, f2.denominator);
    const num1 = f1.numerator * (lcm / f1.denominator);
    const num2 = f2.numerator * (lcm / f2.denominator);
    return simplifyFraction(num1 + num2, lcm);
  };

  const subtractFractions = (f1: Fraction, f2: Fraction): Fraction => {
    const lcm = getLCM(f1.denominator, f2.denominator);
    const num1 = f1.numerator * (lcm / f1.denominator);
    const num2 = f2.numerator * (lcm / f2.denominator);
    return simplifyFraction(num1 - num2, lcm);
  };

  const multiplyFractions = (f1: Fraction, f2: Fraction): Fraction => {
    return simplifyFraction(f1.numerator * f2.numerator, f1.denominator * f2.denominator);
  };

  const divideFractions = (f1: Fraction, f2: Fraction): Fraction => {
    if (f2.numerator === 0) {
      throw new Error('Cannot divide by zero.');
    }
    return simplifyFraction(f1.numerator * f2.denominator, f1.denominator * f2.numerator);
  };

  const fractionToLaTeX = (f: Fraction): string => {
    if (f.denominator === 1) {
      return f.numerator.toString();
    }
    if (f.numerator < 0) {
      return `-\\frac{${Math.abs(f.numerator)}}{${f.denominator}}`;
    }
    return `\\frac{${f.numerator}}{${f.denominator}}`;
  };

  const renderMathText = (text: string) => {
    const parts = text.split('$');
    return (
      <span>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return <InlineMath key={index} math={part} />;
          }
          return part;
        })}
      </span>
    );
  };

  const computeResultsModel = () => {
    const activeFractions = fractions[activeTab];
    const activeOps = operators[activeTab];

    activeFractions.forEach((f, idx) => {
      if (f.denominator === 0) {
        throw new Error(`Fraction ${idx + 1} has a denominator of zero.`);
      }
    });

    let currentResult = activeFractions[0];
    const steps: string[] = [`Initial value: $${fractionToLaTeX(currentResult)}$`];

    for (let i = 0; i < activeOps.length; i++) {
      const nextFraction = activeFractions[i + 1];
      const operator = activeOps[i];
      const prevStr = fractionToLaTeX(currentResult);
      const nextStr = fractionToLaTeX(nextFraction);

      let nextResult: Fraction;
      switch (operator) {
        case '+':
          nextResult = addFractions(currentResult, nextFraction);
          steps.push(`Add: $${prevStr} + ${nextStr} = ${fractionToLaTeX(nextResult)}$`);
          break;
        case '-':
          nextResult = subtractFractions(currentResult, nextFraction);
          steps.push(`Subtract: $${prevStr} - ${nextStr} = ${fractionToLaTeX(nextResult)}$`);
          break;
        case '*':
          nextResult = multiplyFractions(currentResult, nextFraction);
          steps.push(`Multiply: $${prevStr} \\times ${nextStr} = ${fractionToLaTeX(nextResult)}$`);
          break;
        case '/':
          nextResult = divideFractions(currentResult, nextFraction);
          steps.push(`Divide: $${prevStr} \\div ${nextStr} = ${fractionToLaTeX(nextResult)}$`);
          break;
        default:
          throw new Error(`Invalid operator: ${operator}`);
      }
      currentResult = nextResult;
    }

    const finalFraction = simplifyFraction(currentResult.numerator, currentResult.denominator);
    const decimalVal = (finalFraction.numerator / finalFraction.denominator).toFixed(6).replace(/\.?0+$/, '');
    const mixedNum = fractionToMixedNumber(finalFraction);

    return {
      fraction: fractionToString(finalFraction),
      decimal: decimalVal,
      mixedNumber: mixedNum,
      steps: steps,
    };
  };

  const recalculateSilently = () => {
    try {
      if (!hasCalculated) return;
      const calcResult = computeResultsModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      // Don't show hard error block during fluid inputs unless denominator is 0
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
      
      // Celebrate with monochrome confetti
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

  const handleOperatorCycle = (index: number) => {
    const opOrder = ['+', '-', '*', '/'];
    const newOperators = { ...operators };
    const currentOp = newOperators[activeTab][index];
    const nextIdx = (opOrder.indexOf(currentOp) + 1) % opOrder.length;
    newOperators[activeTab][index] = opOrder[nextIdx];
    setOperators(newOperators);
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
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
      ],
      '3-fractions': [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 8 },
      ],
      '4-fractions': [
        { numerator: 1, denominator: 2 },
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 8 },
        { numerator: 1, denominator: 16 },
      ],
    });
    setOperators({
      '2-fractions': ['+'],
      '3-fractions': ['+', '+'],
      '4-fractions': ['+', '+', '+'],
    });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Click-outside backdrop overlay to close operator dropdowns */}
      {activeDropdown !== null && (
        <div 
          className="fixed inset-0 z-20 cursor-default" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
      
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
              </div>              {/* Operator Dropdown Select */}
              {index < fractions[activeTab].length - 1 && (
                <div className="flex flex-col items-center relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                    className={`w-12 h-12 rounded-full border bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-350 transition-all flex items-center justify-center text-xs shadow-sm active:scale-95 z-30 ${
                      activeDropdown === index 
                        ? 'border-slate-400 ring-4 ring-slate-100' 
                        : 'border-slate-200'
                    }`}
                    aria-label="Select operator"
                  >
                    <i className={`fas ${opLabels[operators[activeTab][index]]} text-slate-700 text-sm`}></i>
                    <i className={`fas fa-chevron-down text-[8px] text-slate-400 ml-1.5 transition-transform duration-300 ${
                      activeDropdown === index ? 'rotate-180 text-slate-800' : ''
                    }`}></i>
                  </button>

                  {activeDropdown === index && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 flex items-center space-x-1.5 animate-fade-in shrink-0">
                      {/* Triangle pointer */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-t border-l border-slate-200 rotate-45"></div>
                      
                      {['+', '-', '*', '/'].map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => {
                            handleOperatorChange(index, op);
                            setActiveDropdown(null);
                          }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100 cursor-pointer relative z-10 ${
                            operators[activeTab][index] === op 
                              ? 'bg-slate-900 text-white font-black hover:bg-slate-800' 
                              : 'text-slate-650'
                          }`}
                        >
                          <i className={`fas ${opLabels[op]} text-xs`}></i>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            Calculate
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
          <h3 className="text-lg font-extrabold text-slate-900 text-center">Result Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fraction Form</span>
              <span className="text-xl font-extrabold text-slate-900 flex justify-center items-center">
                <InlineMath math={result.fraction.replace(/(-?\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')} />
              </span>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Decimal Form</span>
              <span className="text-xl font-extrabold text-slate-900 flex justify-center items-center">
                <InlineMath math={result.decimal} />
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Mixed Number</span>
              <span className="text-xl font-extrabold text-slate-900 flex justify-center items-center">
                <InlineMath math={result.mixedNumber.replace(/(-?\d+)\s+(\d+)\s*\/\s*(\d+)/g, '$1\\frac{$2}{$3}').replace(/(-?\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')} />
              </span>
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
                <div key={idx} className="pb-2.5 last:pb-0 border-b last:border-b-0 border-slate-100">
                  {renderMathText(step)}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Concept Board */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
            <div className="flex items-center justify-between w-full pb-2.5 border-b border-slate-200/60">
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
            
            <div className="flex flex-wrap items-center justify-center gap-4 py-2 w-full">
              {fractions[activeTab].map((frac, idx) => (
                <React.Fragment key={idx}>
                  <FractionVisualizer
                    numerator={frac.numerator}
                    denominator={frac.denominator}
                    label={`Fraction ${idx + 1}`}
                    viewType={viewType}
                  />
                  {idx < fractions[activeTab].length - 1 && (
                    <div className="flex flex-col items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm shrink-0">
                      <i className={`fas ${opLabels[operators[activeTab][idx]]} text-slate-600 text-xs`}></i>
                    </div>
                  )}
                </React.Fragment>
              ))}

              <div className="text-slate-400 font-extrabold text-sm mx-1">=</div>
              {(() => {
                const parts = result.fraction.split('/');
                const num = parseInt(parts[0]);
                const den = parts[1] ? parseInt(parts[1]) : 1;
                return (
                  <FractionVisualizer
                    numerator={num}
                    denominator={den}
                    label="Computed Result"
                    viewType={viewType}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
