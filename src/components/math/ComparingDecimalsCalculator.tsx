'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface ComparisonResult {
  ordered: {
    index: number;
    originalStr: string;
    num: number;
  }[];
  comparativeExpression: string;
  descendingExpression: string;
  steps: string[];
  maxPlaces: number;
  paddedValues: string[];
}

export default function ComparingDecimalsCalculator() {
  const [activeTab, setActiveTab] = useState<'2-decimals' | '3-decimals' | '4-decimals'>('2-decimals');
  const [activeField, setActiveField] = useState<number>(0);
  const [viewType, setViewType] = useState<'aligner' | 'bars'>('aligner');

  const [decimals, setDecimals] = useState<{
    '2-decimals': string[];
    '3-decimals': string[];
    '4-decimals': string[];
  }>({
    '2-decimals': ['1.25', '0.5'],
    '3-decimals': ['1.25', '0.5', '1.205'],
    '4-decimals': ['1.25', '0.5', '1.205', '0.75'],
  });

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Auto-select field if the tab changes and the activeField is out of index bounds
    const maxFields = activeTab === '2-decimals' ? 2 : activeTab === '3-decimals' ? 3 : 4;
    if (activeField >= maxFields) {
      setActiveField(0);
    }
  }, [activeTab]);

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [decimals, activeTab]);

  const getDecimalPlaces = (val: string): number => {
    const parts = val.split('.');
    return parts[1] ? parts[1].length : 0;
  };

  const adjustDecimalValue = (index: number, amount: number) => {
    const currentList = [...decimals[activeTab]];
    const currentStr = currentList[index] || '0';
    const currentVal = parseFloat(currentStr) || 0;
    
    // Calculate new value and limit range to avoid layout breaking values (-1000 to 1000)
    const newVal = Math.min(1000, Math.max(-1000, currentVal + amount));
    
    const stepPlaces = amount.toString().split('.')[1]?.length || 0;
    const currentPlaces = getDecimalPlaces(currentStr);
    const precision = Math.max(stepPlaces, currentPlaces);
    
    const formatted = newVal.toFixed(precision);
    currentList[index] = formatted.replace(/\.?0+$/, '') || '0';
    
    setDecimals(prev => ({
      ...prev,
      [activeTab]: currentList
    }));
    setError('');
  };

  const handleDecimalChange = (index: number, val: string) => {
    // Basic decimal input filter
    const filteredVal = val.replace(/[^0-9.-]/g, '');
    const currentList = [...decimals[activeTab]];
    currentList[index] = filteredVal;
    
    setDecimals(prev => ({
      ...prev,
      [activeTab]: currentList
    }));
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    const currentList = [...decimals[activeTab]];
    const currentStr = currentList[activeField] || '';

    let newVal = currentStr;
    if (char === 'back') {
      newVal = currentStr.slice(0, -1);
      if (newVal === '' || newVal === '-') newVal = '0';
    } else if (char === 'clear') {
      newVal = '0';
    } else if (char === '-') {
      if (currentStr.startsWith('-')) {
        newVal = currentStr.slice(1);
      } else {
        newVal = '-' + (currentStr === '0' ? '' : currentStr);
      }
      if (newVal === '-') newVal = '-0';
    } else if (char === '.') {
      if (!currentStr.includes('.')) {
        newVal = (currentStr === '' ? '0' : currentStr) + '.';
      }
    } else {
      if (currentStr === '0' || currentStr === '-0') {
        const isNeg = currentStr.startsWith('-');
        newVal = (isNeg ? '-' : '') + char;
      } else {
        newVal = currentStr + char;
      }
    }

    currentList[activeField] = newVal;
    setDecimals(prev => ({
      ...prev,
      [activeTab]: currentList
    }));
    setError('');
  };

  const computeComparisonModel = (): ComparisonResult => {
    const rawValues = decimals[activeTab];

    rawValues.forEach((val, idx) => {
      const trimmed = val.trim();
      if (trimmed === '' || trimmed === '-') {
        throw new Error(`Please enter a valid number for Value ${idx + 1}.`);
      }
      if (isNaN(Number(trimmed))) {
        throw new Error(`Value ${idx + 1} ("${trimmed}") is not a valid decimal number.`);
      }
    });

    const parsed = rawValues.map((v, idx) => {
      const num = parseFloat(v);
      return {
        index: idx,
        originalStr: v.trim(),
        num: num,
      };
    });

    const steps: string[] = [];
    steps.push(`**Step 1: Pad with trailing zeros to align decimal places**`);
    
    const places = rawValues.map(v => getDecimalPlaces(v.trim()));
    const maxPlaces = Math.max(...places);

    const padNumber = (numStr: string, targetPlaces: number) => {
      const cleanStr = numStr.trim();
      const isNegative = cleanStr.startsWith('-');
      const absoluteStr = isNegative ? cleanStr.slice(1) : cleanStr;
      const parts = absoluteStr.split('.');
      const integerPart = parts[0] || '0';
      let fractionPart = parts[1] || '';
      
      if (targetPlaces === 0) {
        return (isNegative ? '-' : '') + integerPart;
      }
      return (isNegative ? '-' : '') + integerPart + '.' + fractionPart.padEnd(targetPlaces, '0');
    };

    const paddedValues = rawValues.map(v => padNumber(v, maxPlaces));
    steps.push(`We find the maximum number of decimal places is $${maxPlaces}$. Padding with trailing zeros gives:`);
    rawValues.forEach((v, idx) => {
      steps.push(`Value ${idx + 1} ($${v.trim()}$): $\\rightarrow$ $${paddedValues[idx]}$`);
    });

    steps.push(`\n**Step 2: Compare from left to right (Place Value by Place Value)**`);
    const sorted = [...parsed].sort((a, b) => a.num - b.num);
    const uniqueValues = Array.from(new Set(parsed.map(p => p.num)));

    if (uniqueValues.length === 1) {
      steps.push(`All provided values are mathematically equal ($${parsed[0].num}$).`);
    } else {
      steps.push(`By lining up the decimal points and comparing digits at each place value:`);
      
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (current.num === next.num) {
          steps.push(`Value ${current.index + 1} ($${current.originalStr}$) is equal to Value ${next.index + 1} ($${next.originalStr}$).`);
          continue;
        }

        if (current.num < 0 && next.num >= 0) {
          steps.push(`Value ${current.index + 1} ($${current.originalStr}$) is negative, while Value ${next.index + 1} ($${next.originalStr}$) is non-negative. Negative numbers are always smaller than positive numbers, so $${current.originalStr} < ${next.originalStr}$.`);
        } else {
          const padCur = paddedValues[current.index];
          const padNext = paddedValues[next.index];
          
          const curAbs = padCur.replace('-', '');
          const nextAbs = padNext.replace('-', '');
          
          let diffIndex = -1;
          for (let j = 0; j < Math.max(curAbs.length, nextAbs.length); j++) {
            if ((curAbs[j] || '0') !== (nextAbs[j] || '0')) {
              diffIndex = j;
              break;
            }
          }

          if (diffIndex !== -1) {
            const pointPosCur = curAbs.indexOf('.');
            const pointPos = pointPosCur === -1 ? curAbs.length : pointPosCur;
            
            let placeLabel = '';
            if (diffIndex < pointPos) {
              const power = pointPos - 1 - diffIndex;
              if (power === 0) placeLabel = 'Ones place';
              else if (power === 1) placeLabel = 'Tens place';
              else if (power === 2) placeLabel = 'Hundreds place';
              else placeLabel = `$10^${power}$ position`;
            } else if (diffIndex > pointPos) {
              const power = diffIndex - pointPos;
              if (power === 1) placeLabel = 'tenths place';
              else if (power === 2) placeLabel = 'hundredths place';
              else if (power === 3) placeLabel = 'thousandths place';
              else if (power === 4) placeLabel = 'ten-thousandths place';
              else placeLabel = `place value position $10^{-${power}}$`;
            } else {
              placeLabel = 'decimal point alignment';
            }

            const charCur = curAbs[diffIndex] || '0';
            const charNext = nextAbs[diffIndex] || '0';

            if (current.num < 0 && next.num < 0) {
              steps.push(`Comparing negative values $${current.originalStr}$ and $${next.originalStr}$ at the ${placeLabel}:`);
              steps.push(`The absolute digit $${charCur}$ is greater than $${charNext}$, meaning $${current.originalStr}$ is further left on the number line: $${current.originalStr} < ${next.originalStr}$.`);
            } else {
              steps.push(`Comparing $${current.originalStr}$ and $${next.originalStr}$ at the ${placeLabel}:`);
              steps.push(`Digit $${charCur}$ is less than $${charNext}$, so $${current.originalStr} < ${next.originalStr}$.`);
            }
          }
        }
      }
    }

    steps.push(`\n**Step 3: Arrange numbers in order**`);
    
    let comparativeExpression = '';
    for (let i = 0; i < sorted.length; i++) {
      comparativeExpression += sorted[i].originalStr;
      if (i < sorted.length - 1) {
        const diff = sorted[i + 1].num - sorted[i].num;
        if (diff > 0) {
          comparativeExpression += ' < ';
        } else {
          comparativeExpression += ' = ';
        }
      }
    }
    steps.push(`Ascending Order: $${comparativeExpression}$`);

    let descendingExpression = '';
    const revSorted = [...sorted].reverse();
    for (let i = 0; i < revSorted.length; i++) {
      descendingExpression += revSorted[i].originalStr;
      if (i < revSorted.length - 1) {
        const diff = revSorted[i].num - revSorted[i + 1].num;
        if (diff > 0) {
          descendingExpression += ' > ';
        } else {
          descendingExpression += ' = ';
        }
      }
    }
    steps.push(`Descending Order: $${descendingExpression}$`);

    return {
      ordered: sorted,
      comparativeExpression,
      descendingExpression,
      steps,
      maxPlaces,
      paddedValues,
    };
  };

  const recalculateSilently = () => {
    try {
      const calcResult = computeComparisonModel();
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
      const calcResult = computeComparisonModel();
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
    setDecimals({
      '2-decimals': ['1.25', '0.5'],
      '3-decimals': ['1.25', '0.5', '1.205'],
      '4-decimals': ['1.25', '0.5', '1.205', '0.75'],
    });
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleTabChange = (tab: '2-decimals' | '3-decimals' | '4-decimals') => {
    setActiveTab(tab);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  // Helper to split padded string into columns for Place Value table
  const renderAlignerRow = (numStr: string, label: string) => {
    const isNegative = numStr.startsWith('-');
    const absoluteStr = isNegative ? numStr.slice(1) : numStr;
    const parts = absoluteStr.split('.');
    const integerPart = parts[0] || '0';
    const fractionPart = parts[1] || '';

    // Fixed widths: 4 integer positions, 1 point position, 5 fractional positions
    const integerCells = integerPart.slice(-4).padStart(4, ' ').split('');
    const fractionCells = fractionPart.slice(0, 5).padEnd(5, ' ').split('');

    return (
      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40" key={label}>
        <td className="py-2.5 px-3 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider text-left">
          {label}
        </td>
        <td className={`text-center font-mono font-bold text-sm ${isNegative ? 'text-rose-600 font-black' : 'text-slate-200'}`}>
          {isNegative ? '-' : '+'}
        </td>
        {integerCells.map((char, idx) => (
          <td key={`int-${idx}`} className={`text-center font-mono font-bold text-sm ${char === ' ' ? 'text-slate-200' : 'text-slate-900'}`}>
            {char === ' ' ? '0' : char}
          </td>
        ))}
        <td className="text-center font-mono font-black text-sm text-slate-900">.</td>
        {fractionCells.map((char, idx) => (
          <td key={`frac-${idx}`} className={`text-center font-mono font-bold text-sm ${char === ' ' ? 'text-slate-200' : 'text-slate-900'}`}>
            {char === ' ' ? '0' : char}
          </td>
        ))}
      </tr>
    );
  };

  // Render bars scaled relative to absolute maximum value in the set
  const renderRelativeBars = () => {
    const rawList = decimals[activeTab];
    const parsedValues = rawList.map(v => parseFloat(v) || 0);
    const hasNegatives = parsedValues.some(v => v < 0);
    
    // Find absolute maximum to scale the bars
    const maxAbs = Math.max(...parsedValues.map(Math.abs), 1e-9);

    return (
      <div className="w-full max-w-xl space-y-4 py-2">
        {parsedValues.map((val, idx) => {
          const originalStr = rawList[idx];
          
          if (hasNegatives) {
            // Bi-directional bar (centered at zero)
            const percentWidth = (Math.abs(val) / maxAbs) * 50;
            const isNegative = val < 0;

            return (
              <div className="space-y-1" key={idx}>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Value {idx + 1}</span>
                  <span className="font-mono text-slate-800">{originalStr}</span>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 relative flex items-center">
                  {/* Center vertical reference line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-300 z-10"></div>
                  
                  {isNegative ? (
                    <div 
                      style={{ 
                        left: `${50 - percentWidth}%`,
                        width: `${percentWidth}%` 
                      }}
                      className="absolute h-full bg-rose-500/80 hover:bg-rose-600 transition-all rounded-l-sm"
                      title={originalStr}
                    />
                  ) : (
                    <div 
                      style={{ 
                        left: '50%',
                        width: `${percentWidth}%` 
                      }}
                      className="absolute h-full bg-[#1a1a1a] hover:bg-[#2e2e2e] transition-all rounded-r-sm"
                      title={originalStr}
                    />
                  )}
                </div>
              </div>
            );
          } else {
            // Standard left-to-right bar
            const percentWidth = (val / maxAbs) * 100;

            return (
              <div className="space-y-1" key={idx}>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Value {idx + 1}</span>
                  <span className="font-mono text-slate-800">{originalStr}</span>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 relative">
                  <div 
                    style={{ width: `${percentWidth}%` }}
                    className="h-full bg-[#1a1a1a] hover:bg-[#2e2e2e] transition-all duration-500"
                    title={originalStr}
                  />
                </div>
              </div>
            );
          }
        })}
        <div className="text-[9px] text-slate-400 font-bold text-center mt-2">
          {hasNegatives 
            ? "Bi-directional bars: left represents negative values (red), right represents positive values (black), aligned around 0."
            : "Bars represent relative sizes scaled dynamically from 0 to the maximum value in the set."}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Tabs for 2, 3, or 4 numbers */}
      <div className="flex justify-center">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          {(['2-decimals', '3-decimals', '4-decimals'] as const).map((tab) => (
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

      <form onSubmit={handleCalculateSubmit} className="space-y-6">
        {/* Dynamic Decimal Card Grid */}
        <div className={`grid grid-cols-1 gap-4 ${activeTab === '2-decimals' ? 'md:grid-cols-2' : activeTab === '3-decimals' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {decimals[activeTab].map((decimalVal, index) => (
            <div
              key={index}
              onClick={() => setActiveField(index)}
              className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 cursor-pointer transition-all relative ${
                activeField === index ? 'border-slate-900 shadow ring-1 ring-slate-900/5' : 'border-slate-200/80 hover:border-slate-350'
              }`}
            >
              <span className="absolute top-2 right-3 w-5 h-5 rounded-full bg-slate-100 text-slate-450 text-[9px] font-mono font-black flex items-center justify-center border border-slate-200/50">
                #{index + 1}
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Value {index + 1}:
              </span>
              <input
                type="text"
                value={decimalVal}
                onChange={(e) => handleDecimalChange(index, e.target.value)}
                className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none font-mono"
                placeholder="0.0"
              />
              {/* Incrementor/Decrementor Step controls */}
              <div className="flex space-x-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDecimalValue(index, 0.1);
                  }}
                  className="px-2 py-1 text-[9px] font-mono font-bold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDecimalValue(index, -0.1);
                  }}
                  className="px-2 py-1 text-[9px] font-mono font-bold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                >
                  -0.1
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDecimalValue(index, 0.01);
                  }}
                  className="px-2 py-1 text-[9px] font-mono font-bold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                >
                  +0.01
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustDecimalValue(index, -0.01);
                  }}
                  className="px-2 py-1 text-[9px] font-mono font-bold border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                >
                  -0.01
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tactical Keypad helper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
            Tactile Number Pad (editing Value #{activeField + 1})
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
            {['4', '5', '6', '.'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyboardInput(key)}
                className="h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
              >
                {key}
              </button>
            ))}
            {['1', '2', '3', 'back'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyboardInput(key)}
                className={`h-11 rounded-xl bg-white border border-slate-200 font-extrabold transition-all active:scale-95 shadow-sm ${
                  key === 'back' ? 'text-slate-500 text-xs' : 'text-slate-800 text-sm'
                }`}
              >
                {key === 'back' ? '⌫' : key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyboardInput('0')}
              className="col-span-3 h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeyboardInput('-')}
              className="h-11 rounded-xl bg-white border border-slate-200 font-black text-slate-700 text-sm transition-all active:scale-95 shadow-sm"
              title="Toggle Positive/Negative"
            >
              ±
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
            Compare Decimals
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

      {/* Results Panel */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Comparison Results</h3>

          {/* Quick Display Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Absolute overlay design */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">0.0</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Ascending Sort Order</span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={result.comparativeExpression} />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Descending Sort Order</span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={result.descendingExpression} />
                </div>
              </div>
            </div>
          </div>

          {/* Place Value / Row Ranks */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left shadow-inner space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1 text-center">Ranked Positions (Smallest to Largest)</span>
            <div className="space-y-2">
              {result.ordered.map((item, rank) => (
                <div key={rank} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/50">
                  <span className="font-bold flex items-center">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-black flex items-center justify-center mr-2">
                      {rank + 1}
                    </span>
                    Value {item.index + 1}
                  </span>
                  <span className="font-mono font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                    {item.originalStr}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Comparison Walkthrough
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
                <i className="fas fa-eye mr-1.5 text-slate-400"></i>
                Decimal Place Alignment Visualizer
              </span>
              <div className="flex space-x-1.5 bg-slate-150 p-1.5 rounded-full border border-slate-200/40 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setViewType('aligner')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'aligner' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Column Aligner Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('bars')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'bars' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Relative Bars
                </button>
              </div>
            </div>

            {viewType === 'aligner' ? (
              <div className="w-full max-w-xl bg-white border border-slate-150 rounded-2xl overflow-x-auto p-4 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3 text-center">
                  Digit-by-Digit Place Value Chart
                </span>
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-2 px-3 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider text-left">Row</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-6">±</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">Th</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">H</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">T</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">O</th>
                      <th className="py-2 text-slate-900 font-extrabold text-[10px] w-6">.</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">t</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">h</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">th</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">t-th</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">h-th</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.paddedValues.map((paddedVal, idx) => 
                      renderAlignerRow(paddedVal, `Value ${idx + 1}`)
                    )}
                  </tbody>
                </table>
                <div className="mt-3 text-[9px] text-slate-400 italic text-center font-medium">
                  Columns: ± = Sign, Th = Thousands, H = Hundreds, T = Tens, O = Ones, t = tenths, h = hundredths, th = thousandths, t-th = ten-thousandths, h-th = hundred-thousandths.
                </div>
              </div>
            ) : (
              renderRelativeBars()
            )}
          </div>
        </div>
      )}

    </div>
  );
}
