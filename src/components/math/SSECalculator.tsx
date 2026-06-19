'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface DataPointCalculation {
  actual: number;
  predicted: number;
  error: number;
  squaredError: number;
}

interface CalculationResult {
  sse: number;
  mse: number;
  rmse: number;
  calculations: DataPointCalculation[];
  count: number;
}

interface VisualizerProps {
  calculations: DataPointCalculation[];
}

function SSEResidualPlot({ calculations }: VisualizerProps) {
  if (calculations.length === 0) return null;

  const width = 400;
  const height = 200;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Find boundaries
  const allValues = calculations.flatMap(c => [c.actual, c.predicted]);
  let maxVal = Math.max(...allValues);
  let minVal = Math.min(...allValues);

  // If min and max are the same, pad them
  if (maxVal === minVal) {
    maxVal += 1;
    minVal -= 1;
  } else {
    // Add 10% padding
    const diff = maxVal - minVal;
    maxVal += diff * 0.1;
    minVal -= diff * 0.1;
  }

  // X axis scale
  const getX = (index: number) => {
    if (calculations.length <= 1) {
      return paddingLeft + chartWidth / 2;
    }
    return paddingLeft + (index / (calculations.length - 1)) * chartWidth;
  };

  // Y axis scale
  const getY = (val: number) => {
    const scale = chartHeight / (maxVal - minVal);
    return paddingTop + chartHeight - (val - minVal) * scale;
  };

  // Build grid ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }).map((_, i) => {
    return minVal + (i / yTicks) * (maxVal - minVal);
  });

  return (
    <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col items-center space-y-3">
      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-455 self-start">
        Live Residual Error Scatter Plot
      </span>
      <div className="w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] max-w-lg mx-auto">
          {/* Background grid */}
          {yTickValues.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
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
                  className="text-[9px] font-mono text-slate-400 font-bold"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X indices labels */}
          {calculations.map((_, index) => {
            const x = getX(index);
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  className="stroke-slate-150 stroke-[0.75] stroke-dashed"
                />
                <text
                  x={x}
                  y={height - paddingBottom + 14}
                  textAnchor="middle"
                  className="text-[8px] font-mono font-bold text-slate-450"
                >
                  #{index + 1}
                </text>
              </g>
            );
          })}

          {/* Error residual connectors (vertical lines representing residual error) */}
          {calculations.map((c, index) => {
            const x = getX(index);
            const yActual = getY(c.actual);
            const yPred = getY(c.predicted);
            const isPositive = c.actual >= c.predicted;

            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={yActual}
                  x2={x}
                  y2={yPred}
                  className={`stroke-[1.5] stroke-dashed ${
                    isPositive ? 'stroke-slate-650' : 'stroke-rose-500'
                  }`}
                />
              </g>
            );
          })}

          {/* Plot Actual observations as dark dots */}
          {calculations.map((c, index) => {
            const x = getX(index);
            const y = getY(c.actual);
            return (
              <circle
                key={`actual-${index}`}
                cx={x}
                cy={y}
                r="4.5"
                className="fill-[#1a1a1a] stroke-white stroke-[1.5] drop-shadow-sm transition-transform duration-300 hover:scale-125"
              />
            );
          })}

          {/* Plot Predicted values as hollow dots */}
          {calculations.map((c, index) => {
            const x = getX(index);
            const y = getY(c.predicted);
            return (
              <circle
                key={`pred-${index}`}
                cx={x}
                cy={y}
                r="4"
                className="fill-white stroke-[#1a1a1a] stroke-[2] drop-shadow-sm transition-transform duration-300 hover:scale-125"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex space-x-6 text-[10px] font-bold text-slate-500 pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]"></span>
          <span>Actual (y)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#1a1a1a]"></span>
          <span>Predicted (ŷ)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="border-t-2 border-dashed border-rose-500 w-4 h-0.5"></span>
          <span>Residual Error</span>
        </div>
      </div>
    </div>
  );
}

export default function SSECalculator() {
  const [actualData, setActualData] = useState<string>('2, 4, 6, 8');
  const [predictedData, setPredictedData] = useState<string>('1.5, 3.5, 5.5, 7.5');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (hasCalculated) {
      recalculateSilently();
    }
  }, [actualData, predictedData]);

  // Parse numbers from raw inputs
  const parseNumbers = (text: string): number[] => {
    if (!text) return [];
    return text
      .split(/[,\s\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n) && isFinite(n));
  };

  const computeResults = (): CalculationResult => {
    const actuals = parseNumbers(actualData);
    const predicted = parseNumbers(predictedData);

    if (actuals.length === 0) {
      throw new Error('Please enter actual data points.');
    }
    if (predicted.length === 0) {
      throw new Error('Please enter predicted values.');
    }
    if (actuals.length !== predicted.length) {
      throw new Error(`Data size mismatch: ${actuals.length} actual points vs ${predicted.length} predicted values. Elements must pair up 1:1.`);
    }

    let sse = 0;
    const calculations: DataPointCalculation[] = [];

    for (let i = 0; i < actuals.length; i++) {
      const act = actuals[i];
      const pred = predicted[i];
      const err = act - pred;
      const sqErr = err * err;
      sse += sqErr;

      calculations.push({
        actual: act,
        predicted: pred,
        error: err,
        squaredError: sqErr
      });
    }

    const count = actuals.length;
    const mse = sse / count;
    const rmse = Math.sqrt(mse);

    return {
      sse,
      mse,
      rmse,
      calculations,
      count
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
    setActualData('2, 4, 6, 8');
    setPredictedData('1.5, 3.5, 5.5, 7.5');
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      
      <form onSubmit={handleCalculateSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actual inputs */}
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="actual-data-points" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Actual Data Points (y)
            </label>
            <textarea
              id="actual-data-points"
              value={actualData}
              onChange={(e) => { setActualData(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              placeholder="e.g. 2, 4, 6, 8"
              rows={4}
            />
          </div>

          {/* Predicted inputs */}
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="predicted-values" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Predicted Values (ŷ)
            </label>
            <textarea
              id="predicted-values"
              value={predictedData}
              onChange={(e) => { setPredictedData(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              placeholder="e.g. 1.5, 3.5, 5.5, 7.5"
              rows={4}
            />
          </div>
        </div>

        <small className="block text-slate-455 text-center leading-relaxed">
          Provide comma-separated, space-separated, or line-separated list of numbers. Both vectors must have matching sizes.
        </small>

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
            Calculate SSE
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
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">SSE Calculation Results</h3>

          {/* Primary stats */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            {/* Absolute overlay design */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">SSE</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Observation Count</span>
                <div className="text-xl font-extrabold text-slate-200 py-1 font-mono">
                  {result.count}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Sum of Squared Errors (SSE)</span>
                <div className="text-3xl font-black text-white py-1 font-mono">
                  {result.sse.toFixed(4).replace(/\.?0+$/, '')}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Mean Squared Error (MSE)</span>
                <div className="text-xl font-extrabold text-slate-200 py-1 font-mono">
                  {result.mse.toFixed(4).replace(/\.?0+$/, '')}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Root MSE (RMSE)</span>
                <div className="text-xl font-extrabold text-slate-200 py-1 font-mono">
                  {result.rmse.toFixed(4).replace(/\.?0+$/, '')}
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-550 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Tabular Breakdown of Errors
            </h4>
            <div className="overflow-x-auto bg-white border border-slate-150 rounded-2xl shadow-inner max-h-[300px]">
              <table className="w-full text-xs font-mono border-collapse text-left text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-slate-450 font-bold border-b border-slate-150 uppercase tracking-wider text-[9px]">
                    <th className="px-4 py-3">Point</th>
                    <th className="px-4 py-3">Actual (y)</th>
                    <th className="px-4 py-3">Predicted (ŷ)</th>
                    <th className="px-4 py-3">Error (y - ŷ)</th>
                    <th className="px-4 py-3">Squared Error (y - ŷ)²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {result.calculations.map((calc, index) => (
                    <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400">#{index + 1}</td>
                      <td className="px-4 py-2.5 text-slate-800">{calc.actual}</td>
                      <td className="px-4 py-2.5 text-slate-800">{calc.predicted}</td>
                      <td className={`px-4 py-2.5 ${calc.error >= 0 ? 'text-slate-700' : 'text-rose-600'}`}>
                        {calc.error >= 0 ? `+${calc.error.toFixed(4).replace(/\.?0+$/, '')}` : calc.error.toFixed(4).replace(/\.?0+$/, '')}
                      </td>
                      <td className="px-4 py-2.5 text-slate-900">{calc.squaredError.toFixed(4).replace(/\.?0+$/, '')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-150 text-slate-850 font-black text-[13px]">
                    <td colSpan={4} className="px-4 py-3 text-right">Sum of Squares:</td>
                    <td className="px-4 py-3">{result.sse.toFixed(4).replace(/\.?0+$/, '')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* SVG Visualizer coordinate scatter */}
          <SSEResidualPlot calculations={result.calculations} />

        </div>
      )}

    </div>
  );
}
