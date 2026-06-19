import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import confetti from 'canvas-confetti';
import 'katex/dist/katex.min.css';

interface BinaryResult {
  binary: string;
  decimal: string;
  hex: string;
  octal: string;
  steps: string[];
  carryDiagram?: string;
}

export default function BinaryCalculator() {
  const [activeTab, setActiveTab] = useState<'arithmetic' | 'converter'>('arithmetic');
  
  // Arithmetic states
  const [op1, setOp1] = useState<string>('1010');
  const [op2, setOp2] = useState<string>('1101');
  const [operator, setOperator] = useState<string>('+');
  const [activeField, setActiveField] = useState<'op1' | 'op2'>('op1');

  // Converter states
  const [inputVal, setInputVal] = useState<string>('42');
  const [inputBase, setInputBase] = useState<'2' | '8' | '10' | '16'>('10');

  // Register state
  const [registerBits, setRegisterBits] = useState<number[]>([0, 0, 1, 0, 1, 0, 1, 0]); // 42 in 8-bit binary

  const [result, setResult] = useState<BinaryResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Real-time synchronization from inputs to register bits
  useEffect(() => {
    if (activeTab === 'converter') {
      const cleanVal = inputVal.trim();
      if (cleanVal === '') return;
      const base = parseInt(inputBase);
      
      // Basic format checks to avoid sync errors on partial input
      if (base === 2 && !/^[01]+$/.test(cleanVal)) return;
      if (base === 8 && !/^[0-7]+$/.test(cleanVal)) return;
      if (base === 10 && !/^-?\d+$/.test(cleanVal)) return;
      if (base === 16 && !/^[0-9A-Fa-f]+$/.test(cleanVal)) return;

      const decimalVal = parseInt(cleanVal, base);
      if (!isNaN(decimalVal)) {
        const binaryStr = Math.min(255, Math.max(0, decimalVal)).toString(2).padStart(8, '0');
        const bits = binaryStr.split('').map(Number);
        setRegisterBits(prev => {
          if (prev.join('') === bits.join('')) return prev;
          return bits;
        });
      }
    } else {
      // arithmetic mode: sync to the active operand
      const currentOp = activeField === 'op1' ? op1 : op2;
      const cleanOp = currentOp.trim();
      if (cleanOp === '') return;
      if (!/^[01]+$/.test(cleanOp)) return;
      
      const decimalVal = parseInt(cleanOp, 2);
      if (!isNaN(decimalVal)) {
        const binaryStr = Math.min(255, Math.max(0, decimalVal)).toString(2).padStart(8, '0');
        const bits = binaryStr.split('').map(Number);
        setRegisterBits(prev => {
          if (prev.join('') === bits.join('')) return prev;
          return bits;
        });
      }
    }
  }, [activeTab, inputVal, inputBase, op1, op2, activeField]);

  useEffect(() => {
    recalculateSilently();
  }, [op1, op2, operator, inputVal, inputBase, activeTab]);

  const recalculateSilently = () => {
    try {
      if (!hasCalculated) return;
      const calcResult = computeBinaryModel();
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || '');
      setResult(null);
    }
  };

  const handleBitToggle = (index: number) => {
    const newBits = [...registerBits];
    newBits[index] = newBits[index] === 0 ? 1 : 0;
    setRegisterBits(newBits);

    // Compute decimal sum of register bits
    const weights = [128, 64, 32, 16, 8, 4, 2, 1];
    let sum = 0;
    newBits.forEach((bit, idx) => {
      if (bit === 1) sum += weights[idx];
    });

    if (activeTab === 'converter') {
      if (inputBase === '10') {
        setInputVal(sum.toString());
      } else if (inputBase === '2') {
        setInputVal(newBits.join('').replace(/^0+/, '') || '0');
      } else if (inputBase === '16') {
        setInputVal(sum.toString(16).toUpperCase());
      } else if (inputBase === '8') {
        setInputVal(sum.toString(8));
      }
    } else {
      // arithmetic mode: update active operand
      const binStr = newBits.join('').replace(/^0+/, '') || '0';
      if (activeField === 'op1') {
        setOp1(binStr);
      } else {
        setOp2(binStr);
      }
    }
  };

  const syncRegisterFromValue = (decimalVal: number) => {
    const binaryStr = Math.min(255, Math.max(0, decimalVal)).toString(2).padStart(8, '0');
    const bits = binaryStr.split('').map(Number);
    setRegisterBits(bits);
  };

  const computeBinaryModel = (): BinaryResult => {
    if (activeTab === 'arithmetic') {
      const cleanOp1 = op1.trim();
      const cleanOp2 = op2.trim();

      if (!/^[01]+$/.test(cleanOp1) || !/^[01]+$/.test(cleanOp2)) {
        throw new Error('Please enter valid binary numbers containing only 0 and 1.');
      }

      const val1 = parseInt(cleanOp1, 2);
      const val2 = parseInt(cleanOp2, 2);

      let decimalResult = 0;
      let steps: string[] = ['**Step 1: Convert binary operands to decimal**'];
      steps.push(`$${cleanOp1}_2 = ${val1}_{10}$`);
      steps.push(`$${cleanOp2}_2 = ${val2}_{10}$`);

      steps.push(`\n**Step 2: Perform the arithmetic operation in decimal**`);
      let opSymbol = '';
      switch (operator) {
        case '+':
          decimalResult = val1 + val2;
          opSymbol = '+';
          break;
        case '-':
          decimalResult = val1 - val2;
          opSymbol = '-';
          break;
        case '*':
          decimalResult = val1 * val2;
          opSymbol = '\\times';
          break;
        case '/':
          if (val2 === 0) {
            throw new Error('Division by zero is not allowed.');
          }
          decimalResult = Math.floor(val1 / val2);
          opSymbol = '\\div';
          break;
        default:
          throw new Error('Invalid operator selected.');
      }

      steps.push(`$${val1} ${opSymbol} ${val2} = ${decimalResult}$`);

      steps.push(`\n**Step 3: Convert decimal result back to binary**`);
      const binaryResult = (decimalResult < 0 ? '-' : '') + Math.abs(decimalResult).toString(2);
      steps.push(`$${decimalResult}_{10} = ${binaryResult}_2$`);

      // Generate column carrying diagram for addition
      let carryDiagram = '';
      if (operator === '+' && decimalResult >= 0) {
        const len = Math.max(cleanOp1.length, cleanOp2.length);
        const term1 = cleanOp1.padStart(len, '0');
        const term2 = cleanOp2.padStart(len, '0');
        
        let carry = Array(len + 1).fill(0);
        let carryStr = '';
        for (let i = len - 1; i >= 0; i--) {
          const bit1 = parseInt(term1[i]);
          const bit2 = parseInt(term2[i]);
          const sum = bit1 + bit2 + carry[i + 1];
          if (sum >= 2) {
            carry[i] = 1;
          }
        }
        
        carryStr = carry.slice(0, len).map(c => (c === 1 ? '1' : ' ')).join(' ');
        const op1Spaced = term1.split('').join(' ');
        const op2Spaced = term2.split('').join(' ');
        const resSpaced = binaryResult.padStart(len + 1, '0').split('').join(' ');

        carryDiagram = `Carries:   ${carryStr}\n` +
                       `  Val 1:   ${op1Spaced}\n` +
                       `  Val 2: + ${op2Spaced}\n` +
                       `           ${'-'.repeat(len * 2)}\n` +
                       ` Result:  ${resSpaced}`;
      }

      syncRegisterFromValue(Math.abs(decimalResult));

      return {
        binary: binaryResult,
        decimal: decimalResult.toString(),
        hex: (decimalResult < 0 ? '-' : '') + Math.abs(decimalResult).toString(16).toUpperCase(),
        octal: (decimalResult < 0 ? '-' : '') + Math.abs(decimalResult).toString(8),
        steps,
        carryDiagram: carryDiagram || undefined,
      };
    } else {
      // Base Converter Mode
      const cleanVal = inputVal.trim();
      if (cleanVal === '') {
        throw new Error('Please enter a value to convert.');
      }

      const base = parseInt(inputBase);
      let decimalVal = 0;

      // Validate base input formatting
      if (base === 2 && !/^[01]+$/.test(cleanVal)) {
        throw new Error('Invalid binary format. Only 0 and 1 are allowed.');
      }
      if (base === 8 && !/^[0-7]+$/.test(cleanVal)) {
        throw new Error('Invalid octal format. Numbers 0-7 are allowed.');
      }
      if (base === 10 && !/^-?\d+$/.test(cleanVal)) {
        throw new Error('Invalid decimal format. Only integers are allowed.');
      }
      if (base === 16 && !/^[0-9A-Fa-f]+$/.test(cleanVal)) {
        throw new Error('Invalid hexadecimal format. Only 0-9 and A-F are allowed.');
      }

      decimalVal = parseInt(cleanVal, base);
      if (isNaN(decimalVal)) {
        throw new Error('An error occurred while parsing the number.');
      }

      const steps: string[] = ['**Step-by-Step Conversion Steps:**'];
      
      // Conversion equations in steps
      if (base !== 10) {
        steps.push(`**Convert from base ${base} to decimal (base 10):**`);
        const digits = cleanVal.split('');
        const terms: string[] = [];
        const expandedTerms: string[] = [];
        
        digits.forEach((digit, idx) => {
          const power = digits.length - 1 - idx;
          const val = parseInt(digit, base);
          terms.push(`(${digit} \\times ${base}^{${power}})`);
          expandedTerms.push(`(${val} \\times ${Math.pow(base, power)})`);
        });

        steps.push(`$${cleanVal}_{${base}} = ` + terms.join(' + ') + '$');
        steps.push(`$x = ` + expandedTerms.join(' + ') + ` = ${decimalVal}_{10}$`);
      } else {
        steps.push(`Value is already in decimal (base 10): $${decimalVal}$`);
      }

      if (base !== 2) {
        steps.push(`\n**Convert from decimal (${decimalVal}) to binary (base 2) via successive division:**`);
        let temp = decimalVal;
        const remainders: number[] = [];
        while (temp > 0) {
          const rem = temp % 2;
          steps.push(`$${temp} \\div 2 = ${Math.floor(temp / 2)}$ remainder $${rem}$`);
          remainders.push(rem);
          temp = Math.floor(temp / 2);
        }
        const binStr = remainders.reverse().join('') || '0';
        steps.push(`Read the remainders from bottom to top: $${binStr}_2$`);
      }

      syncRegisterFromValue(decimalVal);

      return {
        binary: decimalVal.toString(2),
        decimal: decimalVal.toString(),
        hex: decimalVal.toString(16).toUpperCase(),
        octal: decimalVal.toString(8),
        steps,
      };
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeBinaryModel();
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
    setOp1('1010');
    setOp2('1101');
    setOperator('+');
    setInputVal('42');
    setInputBase('10');
    setRegisterBits([0, 0, 1, 0, 1, 0, 1, 0]);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleKeyboardInput = (char: string) => {
    if (activeTab === 'arithmetic') {
      if (activeField === 'op1') {
        if (char === 'back') {
          setOp1(op1.slice(0, -1) || '0');
        } else if (char === 'clear') {
          setOp1('0');
        } else {
          setOp1(op1 === '0' ? char : op1 + char);
        }
      } else {
        if (char === 'back') {
          setOp2(op2.slice(0, -1) || '0');
        } else if (char === 'clear') {
          setOp2('0');
        } else {
          setOp2(op2 === '0' ? char : op2 + char);
        }
      }
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

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      {/* Mode Select Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          <button
            type="button"
            onClick={() => {
              setActiveTab('arithmetic');
              setResult(null);
              setHasCalculated(false);
              setError('');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 ${
              activeTab === 'arithmetic'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            Binary Arithmetic
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('converter');
              setResult(null);
              setHasCalculated(false);
              setError('');
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 ${
              activeTab === 'converter'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            Base Converter
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        {activeTab === 'arithmetic' ? (
          <div className="space-y-4">
            
            {/* Arithmetic layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Operand 1 card */}
              <div 
                onClick={() => setActiveField('op1')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-2 cursor-pointer transition-all relative ${
                  activeField === 'op1' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Operand 1 (Binary):
                </span>
                <input
                  type="text"
                  value={op1}
                  onChange={(e) => {
                    setOp1(e.target.value.replace(/[^01]/g, ''));
                    setError('');
                  }}
                  className="w-full bg-transparent text-lg font-black text-slate-900 focus:outline-none"
                />
              </div>

              {/* Operand 2 card */}
              <div 
                onClick={() => setActiveField('op2')}
                className={`bg-white border p-5 rounded-2xl text-left space-y-2 cursor-pointer transition-all relative ${
                  activeField === 'op2' ? 'border-slate-900 shadow' : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Operand 2 (Binary):
                </span>
                <input
                  type="text"
                  value={op2}
                  onChange={(e) => {
                    setOp2(e.target.value.replace(/[^01]/g, ''));
                    setError('');
                  }}
                  className="w-full bg-transparent text-lg font-black text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Operator Selection */}
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

            {/* Tactile Binary Keyboard Helper */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 max-w-sm mx-auto flex flex-col items-center space-y-3">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                Tactile Bit Helper (editing #{activeField === 'op1' ? '1' : '2'})
              </span>
              <div className="flex space-x-2 w-full justify-center">
                {['0', '1'].map((bit) => (
                  <button
                    key={bit}
                    type="button"
                    onClick={() => handleKeyboardInput(bit)}
                    className="flex-1 max-w-[80px] h-12 rounded-xl bg-white border border-slate-200 text-base font-black text-slate-900 hover:bg-slate-100 transition-colors shadow-sm active:scale-95"
                  >
                    {bit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeyboardInput('back')}
                  className="flex-1 max-w-[80px] h-12 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors shadow-sm active:scale-95"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyboardInput('clear')}
                  className="flex-1 max-w-[80px] h-12 rounded-xl bg-white border border-slate-200 text-[10px] font-extrabold text-rose-600 hover:bg-slate-100 transition-colors shadow-sm active:scale-95 uppercase"
                >
                  Clear
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Converter Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Input Value card */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-1.5 shadow-sm sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Input Value:
                </span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-transparent text-lg font-black text-slate-900 focus:outline-none"
                  placeholder="e.g. 42"
                />
              </div>

              {/* Base Select card */}
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl text-left space-y-1.5 shadow-sm sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Input Base:
                </span>
                <select
                  value={inputBase}
                  onChange={(e) => {
                    setInputBase(e.target.value as any);
                    setError('');
                  }}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <option value="10">Decimal (Base 10)</option>
                  <option value="2">Binary (Base 2)</option>
                  <option value="16">Hexadecimal (Base 16)</option>
                  <option value="8">Octal (Base 8)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold justify-center">
              <span>Quick values:</span>
              <button type="button" onClick={() => setInputVal('255')} className="underline hover:text-slate-600">255</button>
              <span>•</span>
              <button type="button" onClick={() => setInputVal('1024')} className="underline hover:text-slate-600">1024</button>
              <span>•</span>
              <button type="button" onClick={() => { setInputVal('FF'); setInputBase('16'); }} className="underline hover:text-slate-600">Hex: FF</button>
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
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">Computation Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Binary card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Binary (Base 2)</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono overflow-x-auto no-scrollbar block">
                {result.binary}
              </span>
            </div>

            {/* Decimal card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Decimal (Base 10)</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono block">
                {result.decimal}
              </span>
            </div>

            {/* Hex card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hex (Base 16)</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono block">
                {result.hex}
              </span>
            </div>

            {/* Octal card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Octal (Base 8)</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono block">
                {result.octal}
              </span>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-3 font-mono text-sm leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              
              {/* Carry Column diagram if present */}
              {result.carryDiagram && (
                <div className="pb-3 border-b border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5">
                    Binary Column Addition Carry:
                  </span>
                  <pre className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-slate-800 text-xs font-mono leading-relaxed overflow-x-auto">
                    {result.carryDiagram}
                  </pre>
                </div>
              )}

              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-1 border-b last:border-b-0 border-slate-50">
                  {renderStep(step)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Concept Board - 8-Bit Register */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-2 border-b border-slate-200/60 gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center self-start sm:self-center">
            <i className="fas fa-microchip mr-1.5 text-slate-400"></i>
            Interactive 8-Bit Register Visualizer
          </span>
          <span className="text-[9px] text-slate-400 italic font-bold block self-start sm:self-center">
            Click bits below to toggle values
          </span>
        </div>

        <div className="flex flex-col items-center w-full space-y-5 py-2">
          {/* 8-bit boxes */}
          <div className="flex flex-wrap justify-center gap-3 w-full">
            {[128, 64, 32, 16, 8, 4, 2, 1].map((weight, idx) => {
              const isActive = registerBits[idx] === 1;
              return (
                <div 
                  key={idx}
                  onClick={() => handleBitToggle(idx)}
                  className={`flex flex-col items-center justify-between border p-3 rounded-xl w-14 h-20 shadow-sm cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-slate-900 border-transparent text-white scale-105 shadow-md' 
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold tracking-tighter opacity-60">
                    2^{7 - idx}
                  </span>
                  <span className="text-lg font-black font-mono">
                    {registerBits[idx]}
                  </span>
                  <span className="text-[9px] font-black font-mono">
                    {weight}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sum Equation */}
          <div className="bg-white border border-slate-150 px-5 py-3.5 rounded-2xl shadow-inner w-full max-w-xl text-center">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2">
              Sum Equation:
            </span>
            <div className="font-mono text-[11px] leading-relaxed text-slate-600">
              {(() => {
                const parts: string[] = [];
                const weights = [128, 64, 32, 16, 8, 4, 2, 1];
                weights.forEach((w, idx) => {
                  if (registerBits[idx] === 1) {
                    parts.push(w.toString());
                  }
                });
                const sum = parts.map(Number).reduce((a, b) => a + b, 0);
                const expr = parts.join(' + ') || '0';
                return (
                  <span>
                    {expr} = <strong className="text-slate-900 font-extrabold text-sm">{sum}</strong>
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
