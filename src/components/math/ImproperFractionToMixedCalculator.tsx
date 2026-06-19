'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface CalculationResult {
  numerator: number;
  denominator: number;
  quotient: number;
  remainder: number;
  steps: string[];
  isWholeNumber: boolean;
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
    <div className="flex flex-col items-center space-y-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl w-full min-w-[130px] max-w-[200px] transition-all">
      {label && <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-455">{label}</span>}
      
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

export default function ImproperFractionToMixedCalculator() {
  const [activeField, setActiveField] = useState<'numerator' | 'denominator'>('numerator');
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');

  // Input states
  const [fraction, setFraction] = useState({ numerator: '11', denominator: '4' });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [fraction]);

  const handleFieldChange = (field: 'numerator' | 'denominator', val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, ''); // positive integers only
    
    // Denominator cannot be 0
    if (field === 'denominator' && cleanVal === '0') return;

    setFraction(prev => ({
      ...prev,
      [field]: cleanVal
    }));
    setError('');
  };

  const adjustFieldValue = (field: 'numerator' | 'denominator', amount: number) => {
    const currentStr = fraction[field];
    const currentVal = parseInt(currentStr) || 0;
    let newVal = currentVal + amount;

    // Minimum validations
    if (field === 'denominator' && newVal < 1) newVal = 1;
    if (field === 'numerator' && newVal < 0) newVal = 0;

    const formatted = newVal.toString();
    setFraction(prev => ({ ...prev, [field]: formatted }));
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    const currentStr = fraction[activeField];

    let newVal = currentStr;
    if (char === 'back') {
      newVal = currentStr.slice(0, -1);
      if (newVal === '') newVal = activeField === 'denominator' ? '1' : '0';
    } else if (char === 'clear') {
      newVal = activeField === 'denominator' ? '1' : '0';
    } else {
      if (currentStr === '0' || currentStr === '1' && activeField === 'denominator' && currentStr.length === 1) {
        newVal = char;
      } else {
        newVal = currentStr + char;
      }
    }

    if (activeField === 'denominator' && newVal === '0') return;

    setFraction(prev => ({ ...prev, [activeField]: newVal }));
    setError('');
  };

  const computeResults = (): CalculationResult => {
    const num = parseInt(fraction.numerator);
    const den = parseInt(fraction.denominator);

    if (isNaN(num) || isNaN(den)) {
      throw new Error('Please enter valid positive integers.');
    }

    if (den === 0) {
      throw new Error('Denominator cannot be zero.');
    }

    if (num < den) {
      throw new Error('Please enter an improper fraction where the numerator is greater than or equal to the denominator (numerator ≥ denominator).');
    }

    const quotient = Math.floor(num / den);
    const remainder = num % den;

    const steps: string[] = [];
    steps.push(`**Step 1: Write down the given improper fraction**`);
    steps.push(`Improper fraction: $$\\frac{${num}}{${den}}$$`);

    steps.push(`\n**Step 2: Divide the numerator by the denominator**`);
    steps.push(`Perform standard division to find the quotient and remainder:`);
    steps.push(`$$${num} \\div ${den} = ${quotient} \\text{ with a remainder of } ${remainder}$$`);

    steps.push(`\n**Step 3: Construct the mixed number**`);
    steps.push(`Using division terms:`);
    steps.push(`• The quotient ($${quotient}$) becomes the whole number.`);
    steps.push(`• The remainder ($${remainder}$) becomes the new numerator.`);
    steps.push(`• The original denominator ($${den}$) remains the same.`);

    if (remainder === 0) {
      steps.push(`\n**Step 4: Simplify the result**`);
      steps.push(`Since the remainder is 0, the fraction simplifies perfectly to the whole number:`);
      steps.push(`$$\\frac{${num}}{${den}} = ${quotient}$$`);
    } else {
      steps.push(`\n**Step 4: Final mixed number form**`);
      steps.push(`Combine whole number and fraction:`);
      steps.push(`$$\\frac{${num}}{${den}} = ${quotient}\\frac{${remainder}}{${den}}$$`);
    }

    return {
      numerator: num,
      denominator: den,
      quotient,
      remainder,
      steps,
      isWholeNumber: remainder === 0
    };
  };

  const recalculateSilently = () => {
    try {
      const calcResult = computeResults();
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
      const calcResult = computeResults();
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
    setFraction({ numerator: '11', denominator: '4' });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      <form onSubmit={handleCalculateSubmit} className="space-y-6">
        {/* Fraction Input Card */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex flex-col items-center bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:border-slate-350 transition-all w-28 relative">
            {/* Numerator */}
            <div 
              onClick={() => setActiveField('numerator')}
              className={`flex items-center justify-between w-full p-1 rounded-lg ${activeField === 'numerator' ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustFieldValue('numerator', -1); }}
                className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center text-[10px] font-bold"
              >
                <i className="fas fa-minus text-[8px]"></i>
              </button>
              <input
                type="text"
                value={fraction.numerator}
                onChange={(e) => handleFieldChange('numerator', e.target.value)}
                className="w-8 bg-transparent text-center font-bold text-base focus:outline-none text-slate-900 mx-1 border-b border-transparent font-mono"
                aria-label="Numerator"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustFieldValue('numerator', 1); }}
                className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center text-[10px] font-bold"
              >
                <i className="fas fa-plus text-[8px]"></i>
              </button>
            </div>

            {/* Division Line */}
            <div className="w-full border-t border-slate-300 my-3.5"></div>

            {/* Denominator */}
            <div 
              onClick={() => setActiveField('denominator')}
              className={`flex items-center justify-between w-full p-1 rounded-lg ${activeField === 'denominator' ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustFieldValue('denominator', -1); }}
                className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-550 hover:bg-slate-200 transition-colors flex items-center justify-center text-[10px] font-bold"
              >
                <i className="fas fa-minus text-[8px]"></i>
              </button>
              <input
                type="text"
                value={fraction.denominator}
                onChange={(e) => handleFieldChange('denominator', e.target.value)}
                className="w-8 bg-transparent text-center font-bold text-base focus:outline-none text-slate-900 mx-1 border-b border-transparent font-mono"
                aria-label="Denominator"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); adjustFieldValue('denominator', 1); }}
                className="w-5 h-5 rounded bg-slate-100 border border-slate-200 text-slate-550 hover:bg-slate-200 transition-colors flex items-center justify-center text-[10px] font-bold"
              >
                <i className="fas fa-plus text-[8px]"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Keypad helper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-xs mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block text-center">
            Tactile Number Pad (editing {activeField})
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
            <button
              type="button"
              onClick={() => handleKeyboardInput('1')}
              className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardInput('2')}
              className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardInput('3')}
              className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardInput('0')}
              className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              0
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
            Convert to Mixed Number
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
              <span className="text-[120px] font-black italic">a b/c</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Improper Fraction</span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={`\\frac{${result.numerator}}{${result.denominator}}`} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Mixed Number Form</span>
                <div className="text-3xl font-black text-white flex justify-center py-1">
                  {result.isWholeNumber ? (
                    <InlineMath math={`${result.quotient}`} />
                  ) : (
                    <InlineMath math={`${result.quotient}\\frac{${result.remainder}}{${result.denominator}}`} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {!result.isWholeNumber && (
            <div className="text-center text-xs font-bold text-slate-500">
              Read as: <span className="font-mono text-slate-800">"{result.quotient} and {result.remainder}/{result.denominator}"</span>
            </div>
          )}

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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center self-start sm:self-center">
                <i className="fas fa-chart-pie mr-1.5 text-slate-400"></i>
                Live Mixed Number Visualizer
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
              <FractionVisualizer
                numerator={result.numerator}
                denominator={result.denominator}
                label="Improper Fraction Visual Shape"
                viewType={viewType}
              />
              <div className="text-slate-350 text-xl font-bold flex items-center justify-center">
                <i className="fas fa-arrow-right"></i>
              </div>
              <div className="flex flex-col items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl w-full min-w-[130px] max-w-[200px]">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-455 mb-2.5">Mixed Representation</span>
                <div className="flex items-center space-x-3 py-3">
                  <span className="text-3xl font-black text-slate-800">{result.quotient}</span>
                  {!result.isWholeNumber && (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-850 border-b border-slate-400 px-1">{result.remainder}</span>
                      <span className="text-sm font-black text-slate-850 px-1">{result.denominator}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-bold text-center mt-2">
                  {result.isWholeNumber 
                    ? `${result.quotient} whole units` 
                    : `${result.quotient} whole units + ${result.remainder}/${result.denominator} remainder`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
