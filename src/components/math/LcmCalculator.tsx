import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import confetti from 'canvas-confetti';
import 'katex/dist/katex.min.css';

interface LcmResult {
  lcm: number;
  numbers: number[];
  primeSteps: string[];
  multiplesSteps: string[];
  divisionSteps: string[];
  factorizationTable: {
    primes: number[];
    rows: { number: number; factors: { [prime: number]: number } }[];
    maxPowers: { [prime: number]: number };
  };
}

const getPrimeFactorization = (n: number): { [prime: number]: number } => {
  const factors: { [prime: number]: number } = {};
  let temp = Math.abs(n);
  
  // Factor out 2s
  while (temp % 2 === 0) {
    factors[2] = (factors[2] || 0) + 1;
    temp = temp / 2;
  }
  
  // Factor out odd primes
  for (let i = 3; i <= Math.sqrt(temp); i += 2) {
    while (temp % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      temp = temp / i;
    }
  }
  
  // If temp is prime and > 2
  if (temp > 1) {
    factors[temp] = (factors[temp] || 0) + 1;
  }
  
  return factors;
};

const formatPrimeFactorization = (factors: { [prime: number]: number }): string => {
  const keys = Object.keys(factors).map(Number).sort((a, b) => a - b);
  if (keys.length === 0) return '1';
  return keys
    .map((prime) => {
      const exp = factors[prime];
      return exp > 1 ? `${prime}^{${exp}}` : `${prime}`;
    })
    .join(' \\times ');
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

const getLCM = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / getGCD(a, b);
};

export default function LcmCalculator() {
  const [numbers, setNumbers] = useState<number[]>([12, 18, 20]);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [result, setResult] = useState<LcmResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [activeMethod, setActiveMethod] = useState<'prime' | 'multiples' | 'division'>('prime');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    recalculateSilently();
  }, [numbers]);

  const recalculateSilently = () => {
    try {
      if (numbers.length < 2) {
        setResult(null);
        return;
      }
      if (!hasCalculated) return;
      const calcResult = computeLcmModel(numbers);
      setResult(calcResult);
      setError('');
    } catch (err: any) {
      setError(err.message || '');
      setResult(null);
    }
  };

  const computeLcmModel = (inputNums: number[]): LcmResult => {
    const validNums = inputNums.map((n) => Math.floor(Math.abs(n))).filter((n) => n > 0);
    
    if (validNums.length < 2) {
      throw new Error('Please enter at least two numbers greater than 0.');
    }

    // 1. Calculate overall LCM
    let currentLcm = validNums[0];
    for (let i = 1; i < validNums.length; i++) {
      currentLcm = getLCM(currentLcm, validNums[i]);
    }

    // 2. Method A: Prime Factorization Steps
    const factorizations = validNums.map((num) => ({
      number: num,
      factors: getPrimeFactorization(num),
    }));

    // Find all unique primes
    const uniquePrimesSet = new Set<number>();
    factorizations.forEach((item) => {
      Object.keys(item.factors).forEach((p) => uniquePrimesSet.add(Number(p)));
    });
    const uniquePrimes = Array.from(uniquePrimesSet).sort((a, b) => a - b);

    // Find highest exponent for each prime
    const maxPowers: { [prime: number]: number } = {};
    uniquePrimes.forEach((prime) => {
      let maxExp = 0;
      factorizations.forEach((item) => {
        const exp = item.factors[prime] || 0;
        if (exp > maxExp) maxExp = exp;
      });
      maxPowers[prime] = maxExp;
    });

    const primeSteps: string[] = ['**Step 1: Find the prime factorization of each number**'];
    factorizations.forEach((item) => {
      const latexFact = formatPrimeFactorization(item.factors);
      primeSteps.push(`Prime factorization of ${item.number}: $${item.number} = ${latexFact}$`);
    });

    primeSteps.push('\n**Step 2: Collect the highest power of each prime factor**');
    const factorEquationParts: string[] = [];
    const factorNumberParts: string[] = [];
    
    uniquePrimes.forEach((prime) => {
      const exp = maxPowers[prime];
      const maxPowerString = exp > 1 ? `${prime}^{${exp}}` : `${prime}`;
      const numVal = Math.pow(prime, exp);
      
      primeSteps.push(`For prime $${prime}$: highest power is $${maxPowerString}$ (value: $${numVal}$)`);
      factorEquationParts.push(maxPowerString);
      factorNumberParts.push(numVal.toString());
    });

    primeSteps.push('\n**Step 3: Multiply the highest powers together**');
    const latexEq = factorEquationParts.join(' \\times ');
    const numberEq = factorNumberParts.join(' \\times ');
    primeSteps.push(`$\\text{LCM} = ${latexEq} = ${numberEq} = ${currentLcm}$`);

    // 3. Method B: Listing Multiples Steps
    const multiplesSteps: string[] = ['**Step 1: List the multiples for each number**'];
    
    // We list up to 10 multiples or up to the LCM if it fits, capped to prevent infinite loops
    factorizations.forEach((item) => {
      const mList: number[] = [];
      const cap = Math.min(15, Math.ceil(currentLcm / item.number));
      for (let i = 1; i <= cap; i++) {
        mList.push(item.number * i);
      }
      const listStr = mList.join(', ') + (mList[mList.length - 1] < currentLcm ? ', ...' : '');
      multiplesSteps.push(`Multiples of ${item.number}: $${listStr}$`);
    });

    multiplesSteps.push('\n**Step 2: Find the smallest common multiple**');
    multiplesSteps.push(`The smallest multiple common to all lists is $${currentLcm}$.`);
    multiplesSteps.push(`$\\text{LCM}(${validNums.join(', ')}) = ${currentLcm}$`);

    // 4. Method C: Division / Ladder Method Steps
    const divisionSteps: string[] = ['**Ladder Division Steps:**'];
    let tempNums = [...validNums];
    const divisorsList: number[] = [];
    let divider = 2;

    while (tempNums.some((n) => n > 1)) {
      // Check if current divider divides any of the numbers
      const dividesAny = tempNums.some((n) => n % divider === 0);
      if (dividesAny) {
        divisorsList.push(divider);
        const nextRow = tempNums.map((n) => (n % divider === 0 ? n / divider : n));
        divisionSteps.push(
          `Divide by $${divider}$: $[${tempNums.join(', ')}]$ $\\rightarrow$ $[${nextRow.join(', ')}]$`
        );
        tempNums = nextRow;
      } else {
        // Move to next prime-ish divisor (incremental search is sufficient for demonstration)
        divider++;
      }
      
      // Infinite loop guard
      if (divider > currentLcm) {
        break;
      }
    }

    divisionSteps.push('\n**Multiply all the divisors:**');
    if (divisorsList.length > 0) {
      const formulaEq = divisorsList.join(' \\times ');
      divisionSteps.push(`$\\text{LCM} = ${formulaEq} = ${currentLcm}$`);
    } else {
      divisionSteps.push(`$\\text{LCM} = ${currentLcm}$`);
    }

    return {
      lcm: currentLcm,
      numbers: validNums,
      primeSteps,
      multiplesSteps,
      divisionSteps,
      factorizationTable: {
        primes: uniquePrimes,
        rows: factorizations,
        maxPowers,
      },
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const calcResult = computeLcmModel(numbers);
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
    setNumbers([12, 18, 20]);
    setBulkInput('');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleStepperChange = (index: number, valStr: string) => {
    let val = parseInt(valStr);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;

    const newNums = [...numbers];
    newNums[index] = val;
    setNumbers(newNums);
  };

  const adjustNumber = (index: number, amount: number) => {
    const newNums = [...numbers];
    let newVal = newNums[index] + amount;
    if (newVal < 1) newVal = 1;
    newNums[index] = newVal;
    setNumbers(newNums);
  };

  const removeNumber = (index: number) => {
    if (numbers.length <= 2) {
      setError('You must keep at least two numbers to calculate LCM.');
      return;
    }
    const newNums = numbers.filter((_, idx) => idx !== index);
    setNumbers(newNums);
    setError('');
  };

  const addNumberInput = () => {
    const lastNum = numbers[numbers.length - 1] || 10;
    setNumbers([...numbers, lastNum]);
    setError('');
  };

  const handleBulkImport = () => {
    const parsed = bulkInput
      .split(',')
      .map((item) => parseInt(item.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (parsed.length < 2) {
      setError('Please provide at least two valid numbers separated by commas.');
      return;
    }

    setNumbers(parsed);
    setBulkInput('');
    setError('');
  };

  const renderLcmStep = (step: string) => {
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
      
      {/* Input Section */}
      <form onSubmit={handleCalculate} className="space-y-6">
        
        {/* Dynamic Steppers */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Numbers to Calculate LCM for:
            </span>
            <button
              type="button"
              onClick={addNumberInput}
              className="text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all"
            >
              <i className="fas fa-plus mr-1"></i> Add Number
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {numbers.map((num, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:border-slate-350 transition-all relative group"
              >
                <span className="absolute top-2 left-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  #{idx + 1}
                </span>
                
                <div className="flex items-center space-x-1 mt-2.5">
                  <button
                    type="button"
                    onClick={() => adjustNumber(idx, -1)}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={num}
                    onChange={(e) => handleStepperChange(idx, e.target.value)}
                    className="w-12 bg-transparent text-center font-bold text-base focus:outline-none text-slate-900 mx-1 border-b border-transparent hover:border-slate-200 focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => adjustNumber(idx, 1)}
                    className="w-5 h-5 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-[10px] font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeNumber(idx)}
                  className="w-6 h-6 rounded-full border border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors flex items-center justify-center text-[10px] ml-2 shrink-0 self-end mb-0.5"
                  title="Remove number"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Comma-Separated Input */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
            Or Paste a Comma-Separated List:
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="e.g. 15, 20, 35, 42"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 text-sm placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleBulkImport}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-colors active:scale-95 shrink-0"
            >
              Import List
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            <span>Quick Presets:</span>
            <button type="button" onClick={() => setNumbers([12, 18])} className="underline hover:text-slate-600">12, 18</button>
            <span>•</span>
            <button type="button" onClick={() => setNumbers([8, 12, 20])} className="underline hover:text-slate-600">8, 12, 20</button>
            <span>•</span>
            <button type="button" onClick={() => setNumbers([15, 25, 35, 45])} className="underline hover:text-slate-600">15, 25, 35, 45</button>
          </div>
        </div>

        {/* Errors Block */}
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
            Calculate LCM
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
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">LCM Computation Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center shadow-inner flex flex-col justify-center min-h-[90px] md:col-span-1">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">LCM Value</span>
              <span className="text-3xl font-black text-slate-900 flex justify-center items-center">
                <InlineMath math={result.lcm.toString()} />
              </span>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left shadow-inner space-y-2.5 md:col-span-2">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-0.5">Numbers Compared</span>
              <div className="flex flex-wrap gap-2">
                {result.numbers.map((num, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full border border-slate-250 bg-white font-mono text-xs text-slate-700 font-extrabold"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-2 border-b border-slate-200/60 gap-3">
              <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center self-start sm:self-center">
                <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
                Resolution Steps
              </h4>
              
              <div className="flex space-x-1 bg-slate-100 p-0.75 rounded-full border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setActiveMethod('prime')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    activeMethod === 'prime' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Prime Factors
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('multiples')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    activeMethod === 'multiples' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Listing Multiples
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMethod('division')}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                    activeMethod === 'division' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Ladder Division
                </button>
              </div>
            </div>

            <div className="space-y-3 font-mono text-sm leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {activeMethod === 'prime' &&
                result.primeSteps.map((step, idx) => (
                  <div key={idx} className="pb-1 border-b last:border-b-0 border-slate-50">
                    {renderLcmStep(step)}
                  </div>
                ))}
              {activeMethod === 'multiples' &&
                result.multiplesSteps.map((step, idx) => (
                  <div key={idx} className="pb-1 border-b last:border-b-0 border-slate-50">
                    {renderLcmStep(step)}
                  </div>
                ))}
              {activeMethod === 'division' &&
                result.divisionSteps.map((step, idx) => (
                  <div key={idx} className="pb-1 border-b last:border-b-0 border-slate-50">
                    {renderLcmStep(step)}
                  </div>
                ))}
            </div>
          </div>

          {/* Visual Concept Board - Factorization Grid */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
            <div className="flex items-center justify-between w-full pb-2.5 border-b border-slate-200/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                <i className="fas fa-th mr-1.5 text-slate-400"></i>
                Prime Factor Grid Visualizer
              </span>
            </div>
            
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold text-center">
                    <th className="p-3 border border-slate-700 text-left font-display">Number</th>
                    {result.factorizationTable.primes.map((prime) => (
                      <th key={prime} className="p-3 border border-slate-700">
                        Prime Factor: {prime}
                      </th>
                    ))}
                    <th className="p-3 border border-slate-700 text-right font-display">Full Factorization</th>
                  </tr>
                </thead>
                <tbody>
                  {result.factorizationTable.rows.map((row, idx) => (
                    <tr key={idx} className="text-center font-mono text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 border border-slate-200 text-left font-bold text-slate-900">{row.number}</td>
                      {result.factorizationTable.primes.map((prime) => {
                        const exponent = row.factors[prime] || 0;
                        return (
                          <td key={prime} className={`p-3 border border-slate-200 ${exponent > 0 ? 'bg-slate-50/80 font-black text-slate-900' : 'text-slate-350'}`}>
                            {exponent > 0 ? (
                              <InlineMath math={`${prime}^{${exponent}}`} />
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 border border-slate-200 text-right font-semibold text-slate-500">
                        <InlineMath math={formatPrimeFactorization(row.factors)} />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 text-center font-mono border-t-2 border-slate-300">
                    <td className="p-3 border border-slate-200 text-left font-extrabold text-slate-900">Highest Powers</td>
                    {result.factorizationTable.primes.map((prime) => {
                      const exp = result.factorizationTable.maxPowers[prime];
                      return (
                        <td key={prime} className="p-3 border border-slate-200 bg-slate-100 font-extrabold text-slate-900">
                          <InlineMath math={`${prime}^{${exp}}`} />
                        </td>
                      );
                    })}
                    <td className="p-3 border border-slate-200 text-right font-extrabold text-slate-900">
                      <InlineMath math={result.factorizationTable.primes.map((p) => {
                        const exp = result.factorizationTable.maxPowers[p];
                        return exp > 1 ? `${p}^{${exp}}` : `${p}`;
                      }).join(' \\times ')} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 font-bold self-start mt-1">
              * The Least Common Multiple (LCM) is constructed by taking the maximum power of each prime factor present in any of the numbers.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
