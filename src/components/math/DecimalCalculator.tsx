'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface DecimalResult {
  value: string;
  steps: string[];
  op1Padded: string;
  op2Padded: string;
  resPadded: string;
  decimalPlaces: number;
}

export default function DecimalCalculator() {
  const [op1, setOp1] = useState<string>('1.25');
  const [op2, setOp2] = useState<string>('0.5');
  const [operator, setOperator] = useState<string>('+');
  const [activeField, setActiveField] = useState<'op1' | 'op2'>('op1');
  const [viewType, setViewType] = useState<'aligner' | 'grid'>('aligner');
  
  const [result, setResult] = useState<DecimalResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [op1, op2, operator]);

  const recalculateSilently = () => {
    try {
      const calcResult = computeDecimalModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const getDecimalPlaces = (val: string): number => {
    const parts = val.split('.');
    return parts[1] ? parts[1].length : 0;
  };

  const adjustValue = (field: 'op1' | 'op2', amount: number) => {
    const currentStr = field === 'op1' ? op1 : op2;
    const currentVal = parseFloat(currentStr) || 0;
    // Limit range to prevent massive numbers breaking layouts (0 to 100)
    const newVal = Math.min(100, Math.max(0, currentVal + amount));
    
    // Format to avoid long decimal tail floating precision errors
    const places = Math.max(getDecimalPlaces(currentStr), amount.toString().split('.')[1]?.length || 0);
    const formatted = newVal.toFixed(places);
    
    if (field === 'op1') {
      setOp1(formatted.replace(/\.?0+$/, '') || '0');
    } else {
      setOp2(formatted.replace(/\.?0+$/, '') || '0');
    }
  };

  const handleKeyboardInput = (char: string) => {
    const currentStr = activeField === 'op1' ? op1 : op2;
    const setVal = activeField === 'op1' ? setOp1 : setOp2;

    if (char === 'back') {
      setVal(currentStr.slice(0, -1) || '0');
    } else if (char === 'clear') {
      setVal('0');
    } else if (char === '.') {
      if (!currentStr.includes('.')) {
        setVal(currentStr + '.');
      }
    } else {
      // Avoid starting with multiple zeros
      if (currentStr === '0') {
        setVal(char);
      } else {
        setVal(currentStr + char);
      }
    }
  };

  const computeDecimalModel = (): DecimalResult => {
    const cleanOp1 = op1.trim();
    const cleanOp2 = op2.trim();

    if (cleanOp1 === '' || cleanOp2 === '') {
      throw new Error('Please enter values for both operands.');
    }

    if (isNaN(Number(cleanOp1)) || isNaN(Number(cleanOp2))) {
      throw new Error('Please enter valid decimal numbers.');
    }

    const val1 = parseFloat(cleanOp1);
    const val2 = parseFloat(cleanOp2);

    const places1 = getDecimalPlaces(cleanOp1);
    const places2 = getDecimalPlaces(cleanOp2);
    const maxPlaces = Math.max(places1, places2);

    // Compute base multiplier to convert to safe integers
    const multiplier = Math.pow(10, maxPlaces);
    
    // Scale operands to integers
    const int1 = Math.round(val1 * multiplier);
    const int2 = Math.round(val2 * multiplier);

    let resultVal = 0;
    const steps: string[] = [];
    steps.push('**Step 1: Check decimal places and align decimal points**');
    steps.push(`Operand 1: $${cleanOp1}$ has $${places1}$ decimal places.`);
    steps.push(`Operand 2: $${cleanOp2}$ has $${places2}$ decimal places.`);
    steps.push(`Maximum decimal places: $${maxPlaces}$. We pad with trailing zeros if needed.`);

    const padNumber = (numStr: string, targetPlaces: number) => {
      const parts = numStr.split('.');
      const integerPart = parts[0] || '0';
      let fractionPart = parts[1] || '';
      return integerPart + '.' + fractionPart.padEnd(targetPlaces, '0');
    };

    const op1Padded = padNumber(cleanOp1, maxPlaces);
    const op2Padded = padNumber(cleanOp2, maxPlaces);

    steps.push(`Aligned Operand 1: $${op1Padded}$`);
    steps.push(`Aligned Operand 2: $${op2Padded}$`);

    switch (operator) {
      case '+':
        resultVal = (int1 + int2) / multiplier;
        steps.push('\n**Step 2: Add scaled integers**');
        steps.push(`Convert to integers by multiplying by $10^{${maxPlaces}} = ${multiplier}$:`);
        steps.push(`$${int1} + ${int2} = ${int1 + int2}$`);
        steps.push(`\n**Step 3: Convert the integer sum back by dividing by the multiplier**`);
        steps.push(`$\\frac{${int1 + int2}}{${multiplier}} = ${resultVal}$`);
        break;

      case '-':
        resultVal = (int1 - int2) / multiplier;
        steps.push('\n**Step 2: Subtract scaled integers**');
        steps.push(`Convert to integers by multiplying by $10^{${maxPlaces}} = ${multiplier}$:`);
        steps.push(`$${int1} - ${int2} = ${int1 - int2}$`);
        steps.push(`\n**Step 3: Convert the integer difference back by dividing by the multiplier**`);
        steps.push(`$\\frac{${int1 - int2}}{${multiplier}} = ${resultVal}$`);
        break;

      case '*': {
        resultVal = (int1 * int2) / (multiplier * multiplier);
        const totalPlaces = places1 + places2;
        steps.push('\n**Step 2: Multiply ignoring decimal points**');
        steps.push(`Multiply as integers:`);
        steps.push(`$${int1 / Math.pow(10, maxPlaces - places1)} \\times ${int2 / Math.pow(10, maxPlaces - places2)} = ${int1 * int2 / Math.pow(10, 2 * maxPlaces - totalPlaces)}$`);
        steps.push(`\n**Step 3: Determine the final decimal point position**`);
        steps.push(`Sum of decimal places: $${places1} \\text{ (from Val 1)} + ${places2} \\text{ (from Val 2)} = ${totalPlaces}$ places.`);
        steps.push(`Shift decimal point $${totalPlaces}$ positions to the left:`);
        steps.push(`$${resultVal}$`);
        break;
      }

      case '/':
        if (val2 === 0) {
          throw new Error('Division by zero is not allowed.');
        }
        resultVal = val1 / val2;
        steps.push('\n**Step 2: Eliminate decimal from the divisor (denominator)**');
        steps.push(`Multiply both divisor and dividend by $10^{${places2}} = ${Math.pow(10, places2)}$ to make the divisor a whole number:`);
        steps.push(`Dividend: $${val1} \\times ${Math.pow(10, places2)} = ${val1 * Math.pow(10, places2)}$`);
        steps.push(`Divisor: $${val2} \\times ${Math.pow(10, places2)} = ${val2 * Math.pow(10, places2)}$`);
        steps.push(`\n**Step 3: Perform division**`);
        steps.push(`$${val1 * Math.pow(10, places2)} \\div ${val2 * Math.pow(10, places2)} = ${resultVal}$`);
        break;

      default:
        throw new Error('Invalid operator selected.');
    }

    // Prepare padded representation for the column aligner visualizer
    const resStr = resultVal.toString();
    const resPlaces = getDecimalPlaces(resStr);
    const finalMaxPlaces = Math.max(maxPlaces, resPlaces);

    const paddedOp1 = padNumber(cleanOp1, finalMaxPlaces);
    const paddedOp2 = padNumber(cleanOp2, finalMaxPlaces);
    const paddedRes = padNumber(resStr, finalMaxPlaces);

    return {
      value: resStr,
      steps,
      op1Padded: paddedOp1,
      op2Padded: paddedOp2,
      resPadded: paddedRes,
      decimalPlaces: finalMaxPlaces
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeDecimalModel();
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
      setError(err.message || 'An error occurred.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setOp1('1.25');
    setOp2('0.5');
    setOperator('+');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  // Helper to split padded string into columns for the Place Value Table
  const renderAlignerRow = (numStr: string, label: string) => {
    const parts = numStr.split('.');
    const integerPart = parts[0] || '0';
    const fractionPart = parts[1] || '';

    // Fixed widths: 4 integer positions, 1 point position, 4 fractional positions
    const integerCells = integerPart.padStart(4, ' ').split('');
    const fractionCells = fractionPart.padEnd(4, ' ').split('');

    return (
      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40">
        <td className="py-2.5 px-3 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider text-left">
          {label}
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

  // 10x10 grid shaders representing values up to 2.00
  const render10x10Grid = (val: number, label: string, color: string) => {
    const cells = [];
    const filledCount = Math.min(100, Math.max(0, Math.round(val * 100)));

    for (let i = 0; i < 100; i++) {
      const isFilled = i < filledCount;
      cells.push(
        <div
          key={i}
          className={`w-3 h-3 border border-slate-200 rounded-sm transition-all duration-300 ${
            isFilled ? color : 'bg-white'
          }`}
        />
      );
    }

    return (
      <div className="flex flex-col items-center space-y-3 bg-white border border-slate-150 p-4 rounded-2xl w-full max-w-[170px] shadow-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
        <div className="grid grid-cols-10 gap-1">
          {cells}
        </div>
        <span className="text-xs font-black font-mono text-slate-800">{val.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Operand Stepper Cards */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Operand 1 card */}
          <div 
            onClick={() => setActiveField('op1')}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 cursor-pointer transition-all relative ${
              activeField === 'op1' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Value 1 (Decimal):
            </span>
            <input
              type="text"
              value={op1}
              onChange={(e) => {
                setOp1(e.target.value.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            {/* Stepper buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => adjustValue('op1', 0.1)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op1', -0.1)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op1', 0.01)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                +0.01
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op1', -0.01)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                -0.01
              </button>
            </div>
          </div>

          {/* Operand 2 card */}
          <div 
            onClick={() => setActiveField('op2')}
            className={`bg-white border p-5 rounded-2xl text-left space-y-3.5 cursor-pointer transition-all relative ${
              activeField === 'op2' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
            }`}
          >
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Value 2 (Decimal):
            </span>
            <input
              type="text"
              value={op2}
              onChange={(e) => {
                setOp2(e.target.value.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              className="w-full bg-transparent text-xl font-black text-slate-900 focus:outline-none"
            />
            {/* Stepper buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => adjustValue('op2', 0.1)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op2', -0.1)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op2', 0.01)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                +0.01
              </button>
              <button
                type="button"
                onClick={() => adjustValue('op2', -0.01)}
                className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all text-slate-650"
              >
                -0.01
              </button>
            </div>
          </div>
        </div>

        {/* Operator Selectors */}
        <div className="flex justify-center space-x-2">
          {['+', '-', '*', '/'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => {
                setOperator(op);
                setError('');
              }}
              className={`w-10 h-10 rounded-full border text-sm font-extrabold transition-all active:scale-95 ${
                operator === op
                  ? 'bg-slate-900 text-white border-transparent'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {op === '*' ? '×' : op === '/' ? '÷' : op}
            </button>
          ))}
        </div>

        {/* Numeric Keypad Helper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
            Tactile Number Pad (editing #{activeField === 'op1' ? '1' : '2'})
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
              className="col-span-4 h-11 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-800 text-sm transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate Decimal
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

      {/* Results Display */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-8 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Computation Results</h3>

          {/* Core Value Card */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center shadow-inner flex flex-col justify-center max-w-sm mx-auto min-h-[100px]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Decimal Answer</span>
            <span className="text-2xl font-black text-slate-900 font-mono block">
              {result.value}
            </span>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Decimal Resolution
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

          {/* Visual Concept Board */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-3 border-b border-slate-200/60 gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center self-start sm:self-center">
                <i className="fas fa-eye mr-1.5 text-slate-400"></i>
                Decimal Representation Visualizer
              </span>
              <div className="flex space-x-1.5 bg-slate-150 p-1.5 rounded-full border border-slate-200/40 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setViewType('aligner')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'aligner' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Column Aligner
                </button>
                <button
                  type="button"
                  onClick={() => setViewType('grid')}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    viewType === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  10x10 Block Grids
                </button>
              </div>
            </div>

            {viewType === 'aligner' ? (
              <div className="w-full max-w-xl bg-white border border-slate-150 rounded-2xl overflow-x-auto p-4 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3 text-center">
                  Decimal Point Column Alignment Table
                </span>
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-2 px-3 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider text-left">Row</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">Th</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">H</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">T</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">O</th>
                      <th className="py-2 text-slate-900 font-extrabold text-[10px] w-6">.</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">t</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">h</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">th</th>
                      <th className="py-2 text-slate-450 font-bold text-[10px] w-8">t-th</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderAlignerRow(result.op1Padded, 'Value 1')}
                    {renderAlignerRow(result.op2Padded, 'Value 2')}
                    <tr className="border-t border-double border-slate-300 bg-slate-50/20 font-black">
                      <td className="py-2.5 px-3 text-slate-700 font-extrabold uppercase text-[9px] tracking-wider text-left">
                        Result
                      </td>
                      {(() => {
                        const parts = result.resPadded.split('.');
                        const integerPart = parts[0] || '0';
                        const fractionPart = parts[1] || '';
                        const integerCells = integerPart.padStart(4, ' ').split('');
                        const fractionCells = fractionPart.padEnd(4, ' ').split('');

                        return (
                          <>
                            {integerCells.map((char, idx) => (
                              <td key={`res-int-${idx}`} className={`text-center font-mono font-black text-sm ${char === ' ' ? 'text-slate-200' : 'text-slate-900'}`}>
                                {char === ' ' ? '0' : char}
                              </td>
                            ))}
                            <td className="text-center font-mono font-black text-sm text-slate-900">.</td>
                            {fractionCells.map((char, idx) => (
                              <td key={`res-frac-${idx}`} className={`text-center font-mono font-black text-sm ${char === ' ' ? 'text-slate-200' : 'text-slate-900'}`}>
                                {char === ' ' ? '0' : char}
                              </td>
                            ))}
                          </>
                        );
                      })()}
                    </tr>
                  </tbody>
                </table>
                <div className="mt-3 text-[9px] text-slate-400 italic text-center font-medium">
                  Columns: Th = Thousands, H = Hundreds, T = Tens, O = Ones, t = tenths, h = hundredths, th = thousandths, t-th = ten-thousandths.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-5 w-full">
                <div className="flex flex-wrap justify-center gap-6 w-full">
                  {render10x10Grid(parseFloat(op1) || 0, 'Value 1 portion', 'bg-[#1a1a1a]')}
                  {render10x10Grid(parseFloat(op2) || 0, 'Value 2 portion', 'bg-[#a1a1a1]')}
                  {render10x10Grid(parseFloat(result.value) || 0, 'Answer portion', 'bg-slate-900')}
                </div>
                <div className="bg-white border border-slate-150 p-4 rounded-2xl w-full text-center max-w-3xl shadow-inner text-xs text-slate-500 leading-relaxed font-medium">
                  <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-widest block mb-1">Grid Guide:</span>
                  Each 10x10 grid represents a single whole unit ($1.00$). The number of shaded squares represents the fractional decimal size in hundredths (e.g., $0.45$ shades $45$ blocks out of $100$). Values exceeding $1.00$ are clamped to $1.00$ (100 blocks) for portion scaling limits.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
