'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { IntegralCalculator, formatMathJax, formatStepForDisplay } from './integral-calculator';

interface CalculationResult {
  success: boolean;
  antiderivative: string;
  numerical: number | null;
  sampleValue: number | null;
  steps: string[];
  rules: string[];
}

interface IntegralPlotProps {
  expression: string;
  variable: string;
  lowerLimit: number;
  upperLimit: number;
}

function IntegralAreaPlot({ expression, variable, lowerLimit, upperLimit }: IntegralPlotProps) {
  const width = 400;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const calculator = new IntegralCalculator();

  // Establish plotting bounds
  const minX = Math.min(lowerLimit, -1) - 1.5;
  const maxX = Math.max(upperLimit, 2) + 1.5;

  const points: { x: number; y: number }[] = [];
  const numSteps = 80;

  for (let i = 0; i <= numSteps; i++) {
    const x = minX + (i / numSteps) * (maxX - minX);
    try {
      const yVal = calculator.evaluate(expression, x);
      if (yVal !== null && !isNaN(yVal) && isFinite(yVal)) {
        points.push({ x, y: yVal });
      }
    } catch (e) {
      // Ignore calculation error for invalid points
    }
  }

  if (points.length === 0) return null;

  const yValues = points.map(p => p.y);
  let minY = Math.min(...yValues, 0); // Include zero baseline
  let maxY = Math.max(...yValues, 0);

  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  } else {
    const diff = maxY - minY;
    const clampedDiff = Math.min(100, Math.max(0.1, diff));
    minY -= clampedDiff * 0.15;
    maxY += clampedDiff * 0.15;

    // Safety checks
    if (Math.abs(minY) > 1000 || Math.abs(maxY) > 1000) {
      minY = Math.max(-50, minY);
      maxY = Math.min(50, maxY);
    }
  }

  const getX = (val: number) => {
    return paddingLeft + ((val - minX) / (maxX - minX)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
  };

  // Build grid ticks
  const numGridLines = 4;
  const gridYVals = Array.from({ length: numGridLines + 1 }).map((_, i) => {
    return minY + (i / numGridLines) * (maxY - minY);
  });

  const gridXVals = Array.from({ length: numGridLines + 1 }).map((_, i) => {
    return minX + (i / numGridLines) * (maxX - minX);
  });

  // Curve path
  let curveD = '';
  points.forEach((p, idx) => {
    const xSvg = getX(p.x);
    const ySvg = getY(p.y);
    if (isFinite(xSvg) && isFinite(ySvg)) {
      if (idx === 0) {
        curveD = `M ${xSvg} ${ySvg}`;
      } else {
        curveD += ` L ${xSvg} ${ySvg}`;
      }
    }
  });

  // Closed shaded area polygon between limits
  let shadedD = '';
  const shadeSteps = 50;
  const shadePoints: { x: number; y: number }[] = [];
  
  for (let i = 0; i <= shadeSteps; i++) {
    const x = lowerLimit + (i / shadeSteps) * (upperLimit - lowerLimit);
    try {
      const y = calculator.evaluate(expression, x);
      if (y !== null && !isNaN(y) && isFinite(y)) {
        shadePoints.push({ x, y });
      }
    } catch (e) {
      // Ignore evaluation errors
    }
  }

  if (shadePoints.length > 0) {
    const startX = getX(lowerLimit);
    const startZeroY = getY(0);
    shadedD = `M ${startX} ${startZeroY}`;

    shadePoints.forEach((p) => {
      const xSvg = getX(p.x);
      const ySvg = getY(p.y);
      if (isFinite(xSvg) && isFinite(ySvg)) {
        shadedD += ` L ${xSvg} ${ySvg}`;
      }
    });

    const endX = getX(upperLimit);
    const endZeroY = getY(0);
    shadedD += ` L ${endX} ${endZeroY} Z`;
  }

  return (
    <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col items-center space-y-3">
      <div className="w-full flex justify-between items-center">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">
          Definite Integral Shaded Area
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-500">
          Interval: [{lowerLimit}, {upperLimit}]
        </span>
      </div>

      <div className="w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px] max-w-md mx-auto">
          {/* Grid lines */}
          {gridYVals.map((val, idx) => {
            const y = getY(val);
            if (!isFinite(y)) return null;
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="stroke-slate-200 stroke-[1] stroke-dashed"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono text-slate-450 font-bold"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {gridXVals.map((val, idx) => {
            const x = getX(val);
            if (!isFinite(x)) return null;
            return (
              <g key={`x-${idx}`}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  className="stroke-slate-200 stroke-[1] stroke-dashed"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 12}
                  textAnchor="middle"
                  className="text-[9px] font-mono text-slate-450 font-bold"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X Axis baseline */}
          <line
            x1={paddingLeft}
            y1={getY(0)}
            x2={width - paddingRight}
            y2={getY(0)}
            className="stroke-slate-350 stroke-[1.5]"
          />

          {/* Shaded Area representation */}
          {shadedD && (
            <path
              d={shadedD}
              className="fill-slate-900/10 stroke-slate-650/20 stroke-[1] stroke-dashed"
            />
          )}

          {/* Plot curve */}
          {curveD && (
            <path
              d={curveD}
              fill="none"
              className="stroke-[#1a1a1a] stroke-[2]"
            />
          )}

          {/* Boundaries vertical bars */}
          {isFinite(getX(lowerLimit)) && (
            <line
              x1={getX(lowerLimit)}
              y1={getY(0)}
              x2={getX(lowerLimit)}
              y2={getY(calculator.evaluate(expression, lowerLimit) || 0)}
              className="stroke-slate-900 stroke-[1] stroke-dashed"
            />
          )}
          {isFinite(getX(upperLimit)) && (
            <line
              x1={getX(upperLimit)}
              y1={getY(0)}
              x2={getX(upperLimit)}
              y2={getY(calculator.evaluate(expression, upperLimit) || 0)}
              className="stroke-slate-900 stroke-[1] stroke-dashed"
            />
          )}
        </svg>
      </div>

      <div className="flex space-x-6 text-[10px] font-bold text-slate-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-0.5 bg-[#1a1a1a]"></span>
          <span>f({variable}) Curve</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 bg-slate-900/10 border border-slate-400 border-dashed rounded-sm"></span>
          <span>Accumulated Area</span>
        </div>
      </div>
    </div>
  );
}

export default function IntegralCalculatorComponent() {
  const [functionInput, setFunctionInput] = useState<string>('x^2');
  const [variable, setVariable] = useState<string>('x');
  const [integralType, setIntegralType] = useState<string>('indefinite');
  const [lowerLimit, setLowerLimit] = useState<string>('0');
  const [upperLimit, setUpperLimit] = useState<string>('2');
  const [showSteps, setShowSteps] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const calculator = new IntegralCalculator();

  useEffect(() => {
    if (hasCalculated) {
      calculateIntegralSilently();
    }
  }, [functionInput, variable, integralType, lowerLimit, upperLimit]);

  const validateInputs = () => {
    if (!functionInput.trim()) {
      throw new Error('Please enter a function to integrate.');
    }
    if (integralType === 'definite') {
      if (!lowerLimit || !upperLimit) {
        throw new Error('Please enter both lower and upper limits for definite integration.');
      }
      const lower = parseFloat(lowerLimit);
      const upper = parseFloat(upperLimit);
      if (isNaN(lower) || isNaN(upper)) {
        throw new Error('Limits must be valid numeric values.');
      }
    }
  };

  const getResults = (): CalculationResult => {
    validateInputs();
    const lower = integralType === 'definite' ? parseFloat(lowerLimit) : null;
    const upper = integralType === 'definite' ? parseFloat(upperLimit) : null;

    const calcResult = calculator.calculate(functionInput, variable, integralType, lower, upper);
    if (!calcResult.success) {
      throw new Error('Could not calculate the integral of the given function.');
    }

    return calcResult;
  };

  const calculateIntegralSilently = () => {
    try {
      const calcResult = getResults();
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
      const calcResult = getResults();
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
    setFunctionInput('x^2');
    setVariable('x');
    setIntegralType('indefinite');
    setLowerLimit('0');
    setUpperLimit('2');
    setShowSteps(true);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const setPresetFunction = (func: string) => {
    setFunctionInput(func);
    setError('');
  };

  const insertSymbol = (sym: string) => {
    const input = document.getElementById('function-input') as HTMLInputElement;
    if (input) {
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const text = functionInput;
      const newText = text.substring(0, start) + sym + text.substring(end);
      setFunctionInput(newText);
      setError('');
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + sym.length, start + sym.length);
      }, 0);
    } else {
      setFunctionInput(prev => prev + sym);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `Integral: ∫(${functionInput}) d${variable} (${integralType})
Antiderivative: F(${variable}) = ${result.antiderivative}
${result.numerical !== null ? `Evaluated from ${lowerLimit} to ${upperLimit}: ${result.numerical}` : ''}
Steps:
${result.steps.map(step => step.replace(/\*\*/g, '')).join('\n')}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculateSubmit} className="space-y-6">
        <div className="flex flex-col space-y-2 text-left">
          <label htmlFor="function-input" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Function to Integrate f({variable})
          </label>
          <input
            type="text"
            id="function-input"
            value={functionInput}
            onChange={(e) => { setFunctionInput(e.target.value); setError(''); }}
            className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
            placeholder="e.g. x^2, sin(x), e^x"
          />
        </div>

        {/* Preset Helper Shortcuts */}
        <div className="flex flex-wrap gap-1.5 justify-start select-none">
          {['x', 'x^2', 'x^3', 'sin(x)', 'cos(x)', 'e^x', '1/x'].map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setPresetFunction(preset)}
              className="px-3 py-1 bg-slate-50 border border-slate-150 hover:bg-slate-100 rounded-xl text-xs font-bold font-mono transition-all active:scale-95"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Dynamic Keypad Panel */}
        <div className="flex flex-col space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 text-left">
            Math Helper Keypad
          </span>
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl justify-start">
            {['x', 'y', 't', '+', '-', '*', '/', '^', '(', ')'].map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-3 py-1.5 bg-white border border-slate-155 rounded-lg text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all font-mono shadow-sm active:scale-95"
              >
                {sym}
              </button>
            ))}
            {['sin(', 'cos(', 'tan(', 'ln(', 'exp(', 'sqrt('].map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-2.5 py-1.5 bg-white border border-slate-155 rounded-lg text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all font-mono shadow-sm active:scale-95 text-[#1a1a1a]"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="variable-select" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Variable of Integration
            </label>
            <select
              id="variable-select"
              value={variable}
              onChange={(e) => { setVariable(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-bold text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
            >
              <option value="x">dx (x)</option>
              <option value="y">dy (y)</option>
              <option value="t">dt (t)</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="integral-type" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Integral Type
            </label>
            <select
              id="integral-type"
              value={integralType}
              onChange={(e) => { setIntegralType(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-bold text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
            >
              <option value="indefinite">Indefinite Integral</option>
              <option value="definite">Definite Integral</option>
            </select>
          </div>
        </div>

        {integralType === 'definite' && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            <div className="flex flex-col space-y-2 text-left">
              <label htmlFor="lower-limit" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Lower Boundary Limit (a)
              </label>
              <input
                type="text"
                id="lower-limit"
                value={lowerLimit}
                onChange={(e) => { setLowerLimit(e.target.value); setError(''); }}
                placeholder="e.g. 0"
                className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col space-y-2 text-left">
              <label htmlFor="upper-limit" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Upper Boundary Limit (b)
              </label>
              <input
                type="text"
                id="upper-limit"
                value={upperLimit}
                onChange={(e) => { setUpperLimit(e.target.value); setError(''); }}
                placeholder="e.g. 2"
                className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSteps}
              onChange={(e) => setShowSteps(e.target.checked)}
              className="w-4 h-4 accent-[#1a1a1a] rounded focus:ring-0 focus:outline-none"
            />
            <span className="text-xs font-bold text-slate-500">Show step-by-step integration details</span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate Integral
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

      {/* Result Display */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-6 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 font-display">Integration Result</h3>
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-slate-550 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <i className={copied ? "fas fa-check text-green-600" : "far fa-copy"}></i>
              <span>{copied ? "Copied!" : "Copy Details"}</span>
            </button>
          </div>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Overlay icon background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">∫ dx</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Original Term</span>
                <div className="text-sm font-bold opacity-90 font-mono">
                  {integralType === 'definite'
                    ? `∫[${lowerLimit} to ${upperLimit}] (${functionInput}) d${variable}`
                    : `∫ (${functionInput}) d${variable}`}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Antiderivative Solution</span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={`F(${variable}) = ${formatMathJax(result.antiderivative)}`} />
                </div>
              </div>

              {result.numerical !== null && integralType === 'definite' && (
                <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Definite Area Value</span>
                  <div className="text-2xl font-black text-white py-1">
                    {result.numerical.toFixed(8).replace(/\.?0+$/, '')}
                  </div>
                </div>
              )}

              {result.sampleValue !== null && integralType === 'indefinite' && (
                <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Sample Value at {variable} = 1 (excl. C)
                  </span>
                  <div className="text-sm font-mono font-bold text-slate-300">
                    F(1) = {result.sampleValue.toFixed(6).replace(/\.?0+$/, '')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Area under curve plot for definite integrals */}
          {integralType === 'definite' && lowerLimit !== '' && upperLimit !== '' && !isNaN(parseFloat(lowerLimit)) && !isNaN(parseFloat(upperLimit)) && (
            <IntegralAreaPlot
              expression={functionInput}
              variable={variable}
              lowerLimit={parseFloat(lowerLimit)}
              upperLimit={parseFloat(upperLimit)}
            />
          )}

          {/* Step log resolution */}
          {showSteps && result.steps.length > 0 && (
            <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
              <h4 className="text-sm text-slate-550 font-extrabold uppercase tracking-wider flex items-center">
                <i className="fas fa-list-ol mr-1.5 text-slate-450"></i>
                Detailed Calculation Steps
              </h4>
              <div className="space-y-2.5">
                {result.steps.map((step, idx) => {
                  const isHeading = step.startsWith('**');
                  const cleanStep = step.replace(/\*\*/g, '');
                  if (cleanStep.trim() === '') {
                    return <div key={idx} className="h-2" />;
                  }

                  const formattedHtml = formatStepForDisplay(step);
                  const isMath = formattedHtml.includes('\\(');

                  if (isMath) {
                    const parts = formattedHtml.split(/\\\((.*?)\\\)/g);
                    return (
                      <div key={idx} className="text-sm leading-relaxed text-slate-650 flex flex-wrap items-center gap-1 font-bold pl-2 border-l border-slate-300">
                        {parts.map((p, pIdx) => {
                          const isFormula = pIdx % 2 === 1;
                          return isFormula ? (
                            <span key={pIdx} className="inline-block py-0.5 text-slate-900"><InlineMath math={p} /></span>
                          ) : (
                            <span key={pIdx}>{p}</span>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="text-sm text-slate-600 pl-2 border-l border-slate-300 font-bold">
                      {cleanStep}
                    </div>
                  );
                })}
              </div>

              {result.rules.length > 0 && (
                <div className="mt-4 p-3 bg-white border border-slate-150 rounded-2xl flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Integration Rules:</span>
                  {result.rules.map((rule, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded-lg font-bold text-[10px] border border-slate-200">
                      {rule.replace('Rule: ', '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
