'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { computeDerivative, evaluateAtPoint, formatMathJax, formatStepForDisplay } from './derivative-calculator';

interface CalculationResult {
  originalFunction: string;
  derivative: string;
  order: number;
  numericalResult: number | null;
  xValue: string;
  steps: string[];
  rules: string[];
}

interface DerivativePlotProps {
  expression: string;
  variable: string;
  evaluationPoint: number | null;
  derivativeAtPoint: number | null;
}

function DerivativePlot({ expression, variable, evaluationPoint, derivativeAtPoint }: DerivativePlotProps) {
  const width = 400;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // X Range for plotting
  const xMin = -4;
  const xMax = 4;

  // Generate curve points
  const points: { x: number; y: number }[] = [];
  const numSteps = 80;
  for (let i = 0; i <= numSteps; i++) {
    const x = xMin + (i / numSteps) * (xMax - xMin);
    const yVal = evaluateAtPoint(expression, variable, x);
    if (yVal !== null && !isNaN(yVal) && isFinite(yVal)) {
      points.push({ x, y: yVal });
    }
  }

  if (points.length === 0) return null;

  // Auto-scale Y values
  const yValues = points.map(p => p.y);
  let yMin = Math.min(...yValues);
  let yMax = Math.max(...yValues);

  // If there's an evaluation point, include it in the Y limits
  let yEval: number | null = null;
  if (evaluationPoint !== null) {
    yEval = evaluateAtPoint(expression, variable, evaluationPoint);
    if (yEval !== null && !isNaN(yEval) && isFinite(yEval)) {
      yMin = Math.min(yMin, yEval);
      yMax = Math.max(yMax, yEval);
    }
  }

  // Adjust bounds
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const diff = yMax - yMin;
    // Limit diff height to avoid extreme scale distortions
    const clampedDiff = Math.min(100, Math.max(0.1, diff));
    yMin -= clampedDiff * 0.15;
    yMax += clampedDiff * 0.15;
    
    // Safety check for extreme infinite spikes
    if (Math.abs(yMax) > 1000 || Math.abs(yMin) > 1000) {
      yMin = Math.max(-50, yMin);
      yMax = Math.min(50, yMax);
    }
  }

  // Coordinates converters
  const getX = (val: number) => {
    return paddingLeft + ((val - xMin) / (xMax - xMin)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
  };

  // Build tangent line data if evaluation point and slope are available
  let tangentPath = null;
  if (evaluationPoint !== null && derivativeAtPoint !== null && yEval !== null) {
    const m = derivativeAtPoint;
    const x0 = evaluationPoint;
    const y0 = yEval;

    // Line equation: y - y0 = m*(x - x0) => y = m*(x - x0) + y0
    const tYMin = m * (xMin - x0) + y0;
    const tYMax = m * (xMax - x0) + y0;

    const x1 = getX(xMin);
    const y1 = getY(tYMin);
    const x2 = getX(xMax);
    const y2 = getY(tYMax);

    // Filter extreme values
    if (isFinite(y1) && isFinite(y2)) {
      tangentPath = { x1, y1, x2, y2 };
    }
  }

  // Create grid lines
  const numGridLines = 4;
  const gridYVals = Array.from({ length: numGridLines + 1 }).map((_, i) => {
    return yMin + (i / numGridLines) * (yMax - yMin);
  });

  const gridXVals = Array.from({ length: numGridLines + 1 }).map((_, i) => {
    return xMin + (i / numGridLines) * (xMax - xMin);
  });

  // Build curve path d-attribute
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

  return (
    <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col items-center space-y-3">
      <div className="w-full flex justify-between items-center">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">
          Derivative Curve & Tangent Plot
        </span>
        {evaluationPoint !== null && derivativeAtPoint !== null && (
          <span className="text-[10px] font-mono font-bold text-slate-500">
            Slope at x={evaluationPoint}: {derivativeAtPoint.toFixed(4).replace(/\.?0+$/, '')}
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px] max-w-md mx-auto">
          {/* Y Grid lines & ticks */}
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

          {/* X Grid lines & ticks */}
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

          {/* Draw origin axes lines if they fall inside window */}
          {yMin <= 0 && yMax >= 0 && (
            <line
              x1={paddingLeft}
              y1={getY(0)}
              x2={width - paddingRight}
              y2={getY(0)}
              className="stroke-slate-350 stroke-[1.5]"
            />
          )}
          {xMin <= 0 && xMax >= 0 && (
            <line
              x1={getX(0)}
              y1={paddingTop}
              x2={getX(0)}
              y2={height - paddingBottom}
              className="stroke-slate-350 stroke-[1.5]"
            />
          )}

          {/* Curve plot */}
          {curveD && (
            <path
              d={curveD}
              fill="none"
              className="stroke-[#1a1a1a] stroke-[2] transition-all duration-300"
            />
          )}

          {/* Tangent line plot */}
          {tangentPath && (
            <line
              x1={tangentPath.x1}
              y1={tangentPath.y1}
              x2={tangentPath.x2}
              y2={tangentPath.y2}
              className="stroke-slate-500 stroke-[1.75] stroke-dashed"
            />
          )}

          {/* Tangency dot */}
          {evaluationPoint !== null && yEval !== null && isFinite(getX(evaluationPoint)) && isFinite(getY(yEval)) && (
            <circle
              cx={getX(evaluationPoint)}
              cy={getY(yEval)}
              r="5"
              className="fill-[#1a1a1a] stroke-white stroke-[2] drop-shadow-md"
            />
          )}
        </svg>
      </div>

      <div className="flex space-x-6 text-[10px] font-bold text-slate-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-0.5 bg-[#1a1a1a]"></span>
          <span>f({variable}) Curve</span>
        </div>
        {tangentPath && (
          <div className="flex items-center space-x-1.5">
            <span className="border-t-2 border-dashed border-slate-500 w-4 h-0.5"></span>
            <span>Tangent Line</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DerivativeCalculator() {
  const [functionInput, setFunctionInput] = useState<string>('x^3 + 2*x^2 + x + 1');
  const [variable, setVariable] = useState<string>('x');
  const [order, setOrder] = useState<number>(1);
  const [xValue, setXValue] = useState<string>('2');
  const [showSteps, setShowSteps] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (hasCalculated) {
      calculateDerivativeSilently();
    }
  }, [functionInput, variable, order, xValue]);

  const validateInputs = () => {
    if (!functionInput.trim()) {
      throw new Error('Please enter a mathematical function.');
    }
    if (order < 1 || order > 5) {
      throw new Error('Order of derivative must be between 1 and 5.');
    }
    if (xValue && isNaN(parseFloat(xValue))) {
      throw new Error('Point value must be a valid number.');
    }
  };

  const getResults = (): CalculationResult => {
    validateInputs();
    const derivativeResult = computeDerivative(functionInput, variable, order);

    let numericalResult: number | null = null;
    if (xValue && xValue.trim() !== '') {
      try {
        numericalResult = evaluateAtPoint(derivativeResult.derivative, variable, parseFloat(xValue));
      } catch (e) {
        console.error('Error evaluating numerical result:', e);
      }
    }

    return {
      originalFunction: functionInput,
      derivative: derivativeResult.derivative,
      order: order,
      numericalResult: numericalResult,
      xValue: xValue,
      steps: derivativeResult.steps || [],
      rules: derivativeResult.rules || []
    };
  };

  const calculateDerivativeSilently = () => {
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
    setFunctionInput('x^3 + 2*x^2 + x + 1');
    setVariable('x');
    setOrder(1);
    setXValue('2');
    setShowSteps(true);
    setResult(null);
    setHasCalculated(false);
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
    const textToCopy = `Function: f(${variable}) = ${result.originalFunction}
${order} Derivative: f(${variable}) = ${result.derivative}
${result.numericalResult !== null ? `Evaluated at ${variable} = ${result.xValue}: f(${result.xValue}) = ${result.numericalResult}` : ''}
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
            Function to Differentiate f({variable})
          </label>
          <input
            type="text"
            id="function-input"
            value={functionInput}
            onChange={(e) => { setFunctionInput(e.target.value); setError(''); }}
            className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
            placeholder="e.g. x^3 + 2*x^2 + x"
          />
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
                className="px-3 py-1.5 bg-white border border-slate-150 rounded-lg text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all font-mono shadow-sm active:scale-95"
              >
                {sym}
              </button>
            ))}
            {['sin(', 'cos(', 'tan(', 'ln(', 'exp(', 'sqrt('].map((sym) => (
              <button
                type="button"
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-2.5 py-1.5 bg-white border border-slate-150 rounded-lg text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all font-mono shadow-sm active:scale-95 text-[#1a1a1a]"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="variable-select" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Variable
            </label>
            <select
              id="variable-select"
              value={variable}
              onChange={(e) => { setVariable(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-bold text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
            >
              <option value="x">x</option>
              <option value="y">y</option>
              <option value="z">z</option>
              <option value="t">t</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="order-select" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Derivative Order
            </label>
            <select
              id="order-select"
              value={order}
              onChange={(e) => { setOrder(parseInt(e.target.value)); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-bold text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-sm"
            >
              <option value={1}>1st Derivative</option>
              <option value={2}>2nd Derivative</option>
              <option value={3}>3rd Derivative</option>
              <option value={4}>4th Derivative</option>
              <option value={5}>5th Derivative</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="x-value-input" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Evaluate at {variable} = (optional)
            </label>
            <input
              type="text"
              id="x-value-input"
              value={xValue}
              onChange={(e) => { setXValue(e.target.value); setError(''); }}
              placeholder="e.g. 2"
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSteps}
              onChange={(e) => setShowSteps(e.target.checked)}
              className="w-4 h-4 accent-[#1a1a1a] rounded focus:ring-0 focus:outline-none"
            />
            <span className="text-xs font-bold text-slate-500">Show step-by-step differentiation details</span>
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
            Calculate Derivative
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

      {/* Results panel */}
      {result && (
        <div className="pt-6 border-t border-slate-150 space-y-6 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-slate-900 font-display">Derivative Result</h3>
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-slate-550 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <i className={copied ? "fas fa-check text-green-600" : "far fa-copy"}></i>
              <span>{copied ? "Copied!" : "Copy Details"}</span>
            </button>
          </div>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Absolute overlay design */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">d/d{variable}</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Original Function</span>
                <div className="text-sm font-bold opacity-90 font-mono">
                  f({variable}) = {result.originalFunction}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  {order === 1 ? 'First' : order === 2 ? 'Second' : `${order}th`} Derivative
                </span>
                <div className="text-xl font-extrabold text-white flex justify-center py-1">
                  <InlineMath math={`\\frac{d^{${result.order}}}{d${variable}^{${result.order}}}[${formatMathJax(functionInput)}] = ${formatMathJax(result.derivative)}`} />
                </div>
              </div>

              {result.numericalResult !== null && (
                <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                    Evaluated at {variable} = {result.xValue}
                  </span>
                  <div className="text-xl font-black text-white flex justify-center py-1">
                    <InlineMath math={`f^{${'\''.repeat(result.order)}}(${result.xValue}) = ${result.numericalResult.toFixed(6).replace(/\.?0+$/, '')}`} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SVG tangent plotter */}
          <DerivativePlot
            expression={result.originalFunction}
            variable={variable}
            evaluationPoint={result.xValue ? parseFloat(result.xValue) : null}
            derivativeAtPoint={result.numericalResult}
          />

          {/* Step-by-Step differentiation log */}
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

                  if (isHeading) {
                    return (
                      <h5 key={idx} className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] pt-2 pb-0.5 border-b border-slate-150">
                        {cleanStep}
                      </h5>
                    );
                  }

                  // Render step mathematically
                  const formattedHtml = formatStepForDisplay(step);
                  const isMath = formattedHtml.includes('\\(');

                  if (isMath) {
                    // Split content by KaTeX delimiters
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
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Calculus Rules:</span>
                  {result.rules.map((rule, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] border border-slate-200">
                      {rule}
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
