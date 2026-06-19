'use client';

import React, { useState, useEffect } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: number) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (previousValue === null || !operation) return;

    const inputValue = parseFloat(display);
    const newValue = calculate(previousValue, inputValue, operation);

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const handlePercentage = () => {
    const currentValue = parseFloat(display);
    const newValue = currentValue / 100;
    setDisplay(String(newValue));
  };

  const handlePlusMinus = () => {
    const currentValue = parseFloat(display);
    const newValue = -currentValue;
    setDisplay(String(newValue));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (/^[0-9]$/.test(key)) {
        inputDigit(parseInt(key));
      } else if (key === '.' || key === ',') {
        inputDecimal();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*') {
        performOperation('×');
      } else if (key === '/') {
        performOperation('÷');
      } else if (key === '=' || key === 'Enter') {
        event.preventDefault();
        handleEquals();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
      } else if (key === '%') {
        handlePercentage();
      } else if (key === '±' || key === 'p' || key === 'P') {
        handlePlusMinus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, previousValue, operation, waitingForOperand]);

  return (
    <div className="w-full max-w-[410px] bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-2xl flex flex-col gap-5 text-white transition-all duration-300 hover:border-slate-700 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]">
      {/* Screen */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5.5 text-right flex flex-col justify-end min-h-[115px] overflow-hidden select-none">
        <div className="text-xs text-slate-450 font-medium tracking-wide h-5 mb-1">
          {previousValue !== null && operation && (
            <span>
              {previousValue} {operation}
            </span>
          )}
        </div>
        <div className="text-4xl font-extrabold tracking-tight text-white font-mono break-all leading-none">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Function Keys */}
        <button
          onClick={clearDisplay}
          className="h-16 w-full rounded-2xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 font-semibold text-sm transition-all duration-150 active:scale-90"
        >
          AC
        </button>
        <button
          onClick={handlePlusMinus}
          className="h-16 w-full rounded-2xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 font-semibold text-sm transition-all duration-150 active:scale-90"
        >
          ±
        </button>
        <button
          onClick={handlePercentage}
          className="h-16 w-full rounded-2xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 font-semibold text-sm transition-all duration-150 active:scale-90"
        >
          %
        </button>
        <button
          onClick={() => performOperation('÷')}
          className={`h-16 w-full rounded-2xl font-bold text-base transition-all duration-150 active:scale-90 ${
            operation === '÷' ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          ÷
        </button>

        {/* Numbers & Operators */}
        <button
          onClick={() => inputDigit(7)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          7
        </button>
        <button
          onClick={() => inputDigit(8)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          8
        </button>
        <button
          onClick={() => inputDigit(9)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          9
        </button>
        <button
          onClick={() => performOperation('×')}
          className={`h-16 w-full rounded-2xl font-bold text-base transition-all duration-150 active:scale-90 ${
            operation === '×' ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          ×
        </button>

        <button
          onClick={() => inputDigit(4)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          4
        </button>
        <button
          onClick={() => inputDigit(5)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          5
        </button>
        <button
          onClick={() => inputDigit(6)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          6
        </button>
        <button
          onClick={() => performOperation('-')}
          className={`h-16 w-full rounded-2xl font-bold text-base transition-all duration-150 active:scale-90 ${
            operation === '-' ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          −
        </button>

        <button
          onClick={() => inputDigit(1)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          1
        </button>
        <button
          onClick={() => inputDigit(2)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          2
        </button>
        <button
          onClick={() => inputDigit(3)}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className={`h-16 w-full rounded-2xl font-bold text-base transition-all duration-150 active:scale-90 ${
            operation === '+' ? 'bg-white text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          +
        </button>

        <button
          onClick={() => inputDigit(0)}
          className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90 col-span-2"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="h-16 w-full rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 text-white font-semibold text-base transition-all duration-150 active:scale-90"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="h-16 w-full rounded-2xl bg-white text-slate-900 font-bold text-base transition-all duration-150 hover:bg-slate-100 hover:scale-[1.03] active:scale-90"
        >
          =
        </button>
      </div>
    </div>
  );
};

export default Calculator;
