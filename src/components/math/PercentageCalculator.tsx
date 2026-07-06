'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface PercentageFormData {
  calculationType: string;
  p1: string; x1: string;
  y2: string; x2: string;
  y3: string; p3: string;
  x4: string; y4: string;
  p5: string; y5: string;
  y6: string; p6: string;
  x7: string; p7: string;
  y8: string; x8: string;
  x9: string; p9: string;
  x10: string; y10: string;
  p11: string; y11: string;
  x12: string; p12: string;
  x13: string; y13: string;
  p14: string; y14: string;
}

interface CalculationResult {
  result: string;
  steps: string[];
}

interface PercentageVisualData {
  whole: number;
  part: number;
  percentage: number;
  isChange: boolean;
  changeType: 'increase' | 'decrease' | 'none';
}

function PercentageBarVisualizer({ data }: { data: PercentageVisualData }) {
  const { whole, part, percentage, isChange, changeType } = data;

  // Format helper
  const fmt = (num: number) => num.toFixed(4).replace(/\.?0+$/, '');

  if (isChange) {
    const isIncrease = changeType === 'increase';
    const maxVal = Math.max(whole, part);
    const beforePct = (whole / maxVal) * 100;
    const afterPct = (part / maxVal) * 100;

    return (
      <div className="w-full max-w-xl space-y-5">
        {/* Baseline / Before Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Original (X): <span className="font-mono text-slate-800 font-bold">{fmt(whole)}</span></span>
            <span className="font-mono text-slate-800">100%</span>
          </div>
          <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
            <div 
              style={{ width: `${beforePct}%` }}
              className="h-full bg-[#1a1a1a] transition-all duration-500"
            />
          </div>
        </div>

        {/* Result / After Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>
              {isIncrease ? 'Final (Y) [X + P%]' : 'Final (Y) [X - P%]'} :{' '}
              <span className="font-mono text-slate-800 font-bold">{fmt(part)}</span>
            </span>
            <span className="font-mono text-slate-700">
              {isIncrease ? `+${fmt(percentage)}%` : `-${fmt(percentage)}%`}
            </span>
          </div>
          
          <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 relative">
            {isIncrease ? (
              <div className="h-full flex">
                <div 
                  style={{ width: `${(whole / maxVal) * 100}%` }}
                  className="h-full bg-[#1a1a1a]"
                  title="Baseline"
                />
                <div 
                  style={{ width: `${((part - whole) / maxVal) * 100}%` }}
                  className="h-full bg-slate-400 border-l border-white border-dashed animate-pulse"
                  title={`Increase of ${fmt(percentage)}%`}
                />
              </div>
            ) : (
              <div className="h-full flex">
                <div 
                  style={{ width: `${(part / maxVal) * 100}%` }}
                  className="h-full bg-[#1a1a1a]"
                  title="Remaining"
                />
                <div 
                  style={{ width: `${((whole - part) / maxVal) * 100}%` }}
                  className="h-full bg-slate-200 border-l border-slate-300 border-dashed"
                  title={`Decrease of ${fmt(percentage)}%`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(whole, part, 1e-9);
  const wholePct = (whole / maxVal) * 100;
  const partPct = (part / maxVal) * 100;

  return (
    <div className="w-full max-w-xl space-y-5">
      {/* Whole (X) Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>Whole (X): <span className="font-mono text-slate-800 font-bold">{fmt(whole)}</span></span>
          <span className="font-mono text-slate-800">100%</span>
        </div>
        <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
          <div 
            style={{ width: `${wholePct}%` }}
            className="h-full bg-[#1a1a1a] transition-all duration-500"
          />
        </div>
      </div>

      {/* Part (Y) Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>Part (Y): <span className="font-mono text-slate-800 font-bold">{fmt(part)}</span></span>
          <span className="font-mono text-slate-800 font-bold">{fmt(percentage)}%</span>
        </div>
        <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
          <div 
            style={{ width: `${partPct}%` }}
            className="h-full bg-slate-400 transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}

interface PercentageVisualizerProps {
  data: PercentageVisualData;
  viewType: 'grid' | 'gauge' | 'bar';
}

function PercentageVisualizer({ data, viewType }: PercentageVisualizerProps) {
  const { percentage } = data;
  
  const renderGrid = () => {
    const totalGrids = Math.max(1, Math.min(3, Math.ceil(percentage / 100)));
    
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 py-2">
        {Array.from({ length: totalGrids }).map((_, gridIdx) => {
          const filledCount = Math.max(0, Math.min(100, Math.round(percentage - gridIdx * 100)));
          const gridPercentage = gridIdx === 0 
            ? Math.min(100, percentage) 
            : Math.max(0, Math.min(100, percentage - gridIdx * 100));

          return (
            <div key={gridIdx} className="flex flex-col items-center space-y-2">
              <svg width="120" height="120" viewBox="0 0 110 110" className="drop-shadow-sm hover:scale-[1.02] transition-transform">
                <rect x="2" y="2" width="106" height="106" rx="4" className="fill-none stroke-slate-200 stroke-[1.5]" />
                {Array.from({ length: 10 }).map((_, row) =>
                  Array.from({ length: 10 }).map((_, col) => {
                    const idx = row * 10 + col;
                    const isFilled = idx < filledCount;
                    return (
                      <rect
                        key={`${row}-${col}`}
                        x={5 + col * 10}
                        y={5 + row * 10}
                        width={8}
                        height={8}
                        rx={1.5}
                        className={`${
                          isFilled 
                            ? 'fill-[#1a1a1a] stroke-[#1a1a1a]' 
                            : 'fill-none stroke-slate-200'
                        } stroke-[1] transition-colors`}
                      />
                    );
                  })
                )}
              </svg>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                {gridIdx === 0 ? '1st 100%' : gridIdx === 1 ? '2nd 100%' : '3rd 100%'}
                {percentage > (gridIdx * 100) && ` (${gridPercentage.toFixed(1).replace(/\.0$/, '')}%)`}
              </span>
            </div>
          );
        })}
        {percentage > 300 && (
          <div className="text-[10px] text-slate-400 font-bold italic">
            +{(percentage - 300).toFixed(1).replace(/\.0$/, '')}% more
          </div>
        )}
      </div>
    );
  };

  const renderGauge = () => {
    const radius = 40;
    const circ = 2 * Math.PI * radius; // ~251.327
    const strokeDashoffset = circ - (circ * Math.min(Math.max(0, percentage), 100)) / 100;

    return (
      <div className="flex flex-col items-center py-2">
        <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-sm transition-all duration-300 hover:scale-105">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none stroke-slate-100 stroke-[8]"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="fill-none stroke-[#1a1a1a] stroke-[8] transition-all duration-500 ease-out"
            strokeDasharray={circ}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="54"
            textAnchor="middle"
            className="font-mono font-black text-sm fill-slate-800"
          >
            {percentage.toFixed(2).replace(/\.?0+$/, '')}%
          </text>
        </svg>
      </div>
    );
  };

  switch (viewType) {
    case 'grid':
      return renderGrid();
    case 'gauge':
      return renderGauge();
    case 'bar':
      return <PercentageBarVisualizer data={data} />;
    default:
      return null;
  }
}

const renderPercentageStep = (step: string) => {
  if (step.includes('Equation:')) {
    const formula = step.replace('Equation:', '').trim()
      .replace(/×/g, '\\times')
      .replace(/÷/g, '\\div')
      .replace(/%/g, '\\%');
    return (
      <span>
        Equation: <InlineMath math={formula} />
      </span>
    );
  }
  
  if (step.includes('=')) {
    const formula = step.trim()
      .replace(/×/g, '\\times')
      .replace(/÷/g, '\\div')
      .replace(/%/g, '\\%');
    return <InlineMath math={formula} />;
  }

  const words = step.split(' ');
  return (
    <span>
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[?,]/g, '');
        const suffix = word.match(/[?,]/) ? word[word.length - 1] : '';
        
        const isNum = /^[+-]?\d+(\.\d+)?%?$/.test(cleanWord);
        if (isNum) {
          const mathExpr = cleanWord.replace(/%/g, '\\%');
          return (
            <React.Fragment key={idx}>
              <InlineMath math={mathExpr} />
              {suffix}
              {idx < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        }
        
        return word + (idx < words.length - 1 ? ' ' : '');
      })}
    </span>
  );
};

export default function PercentageCalculator() {
  const calculationTypes = [
    { value: 'percent-of', label: 'What is P% of X?' },
    { value: 'y-percent-of-x', label: 'Y is what % of X?' },
    { value: 'y-is-p-of-what', label: 'Y is P% of what?' },
    { value: 'what-percent-of-x-is-y', label: 'What % of X is Y?' },
    { value: 'p-of-what-is-y', label: 'P% of what is Y?' },
    { value: 'y-out-of-what-is-p', label: 'Y out of what is P%?' },
    { value: 'what-out-of-x-is-p', label: 'What out of X is P%?' },
    { value: 'y-out-of-x-is-what', label: 'Y out of X is what %?' },
    { value: 'x-plus-p-is-what', label: 'X plus P% is what?' },
    { value: 'x-plus-what-is-y', label: 'X plus what % is Y?' },
    { value: 'what-plus-p-is-y', label: 'What plus P% is Y?' },
    { value: 'x-minus-p-is-what', label: 'X minus P% is what?' },
    { value: 'x-minus-what-is-y', label: 'X minus what % is Y?' },
    { value: 'what-minus-p-is-y', label: 'What minus P% is Y?' },
  ];

  const resetFormData = (): PercentageFormData => ({
    calculationType: 'percent-of',
    p1: '', x1: '',
    y2: '', x2: '',
    y3: '', p3: '',
    x4: '', y4: '',
    p5: '', y5: '',
    y6: '', p6: '',
    x7: '', p7: '',
    y8: '', x8: '',
    x9: '', p9: '',
    x10: '', y10: '',
    p11: '', y11: '',
    x12: '', p12: '',
    x13: '', y13: '',
    p14: '', y14: '',
  });

  const [formData, setFormData] = useState<PercentageFormData>(resetFormData());
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [visualData, setVisualData] = useState<PercentageVisualData | null>(null);
  const [viewType, setViewType] = useState<'grid' | 'gauge' | 'bar'>('grid');
  const [error, setError] = useState('');

  const validateInput = (value: string) => {
    if (value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  };

  const validateInputs = (...values: string[]) => {
    return values.every((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num) && val !== '';
    });
  };

  const handleInputChange = (field: keyof PercentageFormData, value: string) => {
    if (validateInput(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      calculationType: value,
    }));
    setResult(null);
    setVisualData(null);
    setError('');
  };

  const handleReset = () => {
    setFormData(resetFormData());
    setResult(null);
    setVisualData(null);
    setError('');
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const type = formData.calculationType;
    let finalResult = '';
    let steps: string[] = [];
    let err = '';
    let calcVisualData: PercentageVisualData | null = null;

    try {
      switch (type) {
        case 'percent-of': {
          const p = parseFloat(formData.p1);
          const x = parseFloat(formData.x1);
          if (!validateInputs(formData.p1, formData.x1)) {
            err = 'Please enter valid numbers for P and X.';
            break;
          }
          const val = (p / 100) * x;
          steps = [
            `What is ${p}% of ${x}?`,
            `Equation: Y = P% × X`,
            `Y = (${p} / 100) × ${x}`,
            `Y = ${(p / 100).toFixed(4)} × ${x}`,
            `Y = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: x,
            part: val,
            percentage: p,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'y-percent-of-x': {
          const y = parseFloat(formData.y2);
          const x = parseFloat(formData.x2);
          if (!validateInputs(formData.y2, formData.x2)) {
            err = 'Please enter valid numbers for Y and X.';
            break;
          }
          if (x === 0) {
            err = 'Total (X) cannot be zero (division by zero).';
            break;
          }
          const val = (y / x) * 100;
          steps = [
            `${y} is what % of ${x}?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y} ÷ ${x}) × 100`,
            `P% = ${(y / x).toFixed(6)} × 100`,
            `P% = ${val.toFixed(4).replace(/\.?0+$/, '')}%`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '') + '%';
          calcVisualData = {
            whole: x,
            part: y,
            percentage: val,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'y-is-p-of-what': {
          const y = parseFloat(formData.y3);
          const p = parseFloat(formData.p3);
          if (!validateInputs(formData.y3, formData.p3)) {
            err = 'Please enter valid numbers for Y and P.';
            break;
          }
          if (p === 0) {
            err = 'Percentage (P) cannot be zero.';
            break;
          }
          const val = y / (p / 100);
          steps = [
            `${y} is ${p}% of what?`,
            `Equation: X = Y ÷ (P% ÷ 100)`,
            `X = ${y} ÷ (${p} ÷ 100)`,
            `X = ${y} ÷ ${(p / 100).toFixed(4)}`,
            `X = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: val,
            part: y,
            percentage: p,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'what-percent-of-x-is-y': {
          const x = parseFloat(formData.x4);
          const y = parseFloat(formData.y4);
          if (!validateInputs(formData.x4, formData.y4)) {
            err = 'Please enter valid numbers for X and Y.';
            break;
          }
          if (x === 0) {
            err = 'Total (X) cannot be zero.';
            break;
          }
          const val = (y / x) * 100;
          steps = [
            `What % of ${x} is ${y}?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y} ÷ ${x}) × 100`,
            `P% = ${(y / x).toFixed(6)} × 100`,
            `P% = ${val.toFixed(4).replace(/\.?0+$/, '')}%`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '') + '%';
          calcVisualData = {
            whole: x,
            part: y,
            percentage: val,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'p-of-what-is-y': {
          const p = parseFloat(formData.p5);
          const y = parseFloat(formData.y5);
          if (!validateInputs(formData.p5, formData.y5)) {
            err = 'Please enter valid numbers for P and Y.';
            break;
          }
          if (p === 0) {
            err = 'Percentage (P) cannot be zero.';
            break;
          }
          const val = y / (p / 100);
          steps = [
            `${p}% of what is ${y}?`,
            `Equation: X = Y ÷ (P% ÷ 100)`,
            `X = ${y} ÷ (${p} ÷ 100)`,
            `X = ${y} ÷ ${(p / 100).toFixed(4)}`,
            `X = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: val,
            part: y,
            percentage: p,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'y-out-of-what-is-p': {
          const y = parseFloat(formData.y6);
          const p = parseFloat(formData.p6);
          if (!validateInputs(formData.y6, formData.p6)) {
            err = 'Please enter valid numbers for Y and P.';
            break;
          }
          if (p === 0) {
            err = 'Percentage (P) cannot be zero.';
            break;
          }
          const val = (y * 100) / p;
          steps = [
            `${y} out of what is ${p}%?`,
            `Equation: X = (Y × 100) ÷ P%`,
            `X = (${y} × 100) ÷ ${p}`,
            `X = ${y * 100} ÷ ${p}`,
            `X = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: val,
            part: y,
            percentage: p,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'what-out-of-x-is-p': {
          const x = parseFloat(formData.x7);
          const p = parseFloat(formData.p7);
          if (!validateInputs(formData.x7, formData.p7)) {
            err = 'Please enter valid numbers for X and P.';
            break;
          }
          const val = (x * p) / 100;
          steps = [
            `What out of ${x} is ${p}%?`,
            `Equation: Y = (X × P%) ÷ 100`,
            `Y = (${x} × ${p}) ÷ 100`,
            `Y = ${x * p} ÷ 100`,
            `Y = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: x,
            part: val,
            percentage: p,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'y-out-of-x-is-what': {
          const y = parseFloat(formData.y8);
          const x = parseFloat(formData.x8);
          if (!validateInputs(formData.y8, formData.x8)) {
            err = 'Please enter valid numbers for Y and X.';
            break;
          }
          if (x === 0) {
            err = 'Total (X) cannot be zero.';
            break;
          }
          const val = (y / x) * 100;
          steps = [
            `${y} out of ${x} is what %?`,
            `Equation: P% = (Y ÷ X) × 100`,
            `P% = (${y} ÷ ${x}) × 100`,
            `P% = ${(y / x).toFixed(6)} × 100`,
            `P% = ${val.toFixed(4).replace(/\.?0+$/, '')}%`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '') + '%';
          calcVisualData = {
            whole: x,
            part: y,
            percentage: val,
            isChange: false,
            changeType: 'none',
          };
          break;
        }
        case 'x-plus-p-is-what': {
          const x = parseFloat(formData.x9);
          const p = parseFloat(formData.p9);
          if (!validateInputs(formData.x9, formData.p9)) {
            err = 'Please enter valid numbers for X and P.';
            break;
          }
          const val = x + (x * p) / 100;
          steps = [
            `${x} plus ${p}% is what?`,
            `Equation: Y = X + (X × P% ÷ 100)`,
            `Y = ${x} + (${x} × ${p} ÷ 100)`,
            `Y = ${x} + ${(x * p / 100).toFixed(4).replace(/\.?0+$/, '')}`,
            `Y = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: x,
            part: val,
            percentage: p,
            isChange: true,
            changeType: 'increase',
          };
          break;
        }
        case 'x-plus-what-is-y': {
          const x = parseFloat(formData.x10);
          const y = parseFloat(formData.y10);
          if (!validateInputs(formData.x10, formData.y10)) {
            err = 'Please enter valid numbers for X and Y.';
            break;
          }
          if (x === 0) {
            err = 'Original value (X) cannot be zero.';
            break;
          }
          const val = ((y - x) / x) * 100;
          steps = [
            `${x} plus what % is ${y}?`,
            `Equation: P% = ((Y - X) ÷ X) × 100`,
            `P% = ((${y} - ${x}) ÷ ${x}) × 100`,
            `P% = (${y - x} ÷ ${x}) × 100`,
            `P% = ${((y - x) / x).toFixed(6)} × 100`,
            `P% = ${val.toFixed(4).replace(/\.?0+$/, '')}%`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '') + '%';
          calcVisualData = {
            whole: x,
            part: y,
            percentage: val,
            isChange: true,
            changeType: 'increase',
          };
          break;
        }
        case 'what-plus-p-is-y': {
          const p = parseFloat(formData.p11);
          const y = parseFloat(formData.y11);
          if (!validateInputs(formData.p11, formData.y11)) {
            err = 'Please enter valid numbers for P and Y.';
            break;
          }
          if (1 + p / 100 === 0) {
            err = 'Calculation division by zero error.';
            break;
          }
          const val = y / (1 + p / 100);
          steps = [
            `What plus ${p}% is ${y}?`,
            `Equation: X = Y ÷ (1 + P% ÷ 100)`,
            `X = ${y} ÷ (1 + ${p} ÷ 100)`,
            `X = ${y} ÷ ${(1 + p / 100).toFixed(4)}`,
            `X = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: val,
            part: y,
            percentage: p,
            isChange: true,
            changeType: 'increase',
          };
          break;
        }
        case 'x-minus-p-is-what': {
          const x = parseFloat(formData.x12);
          const p = parseFloat(formData.p12);
          if (!validateInputs(formData.x12, formData.p12)) {
            err = 'Please enter valid numbers for X and P.';
            break;
          }
          const val = x - (x * p) / 100;
          steps = [
            `${x} minus ${p}% is what?`,
            `Equation: Y = X - (X × P% ÷ 100)`,
            `Y = ${x} - (${x} × ${p} ÷ 100)`,
            `Y = ${x} - ${(x * p / 100).toFixed(4).replace(/\.?0+$/, '')}`,
            `Y = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: x,
            part: val,
            percentage: p,
            isChange: true,
            changeType: 'decrease',
          };
          break;
        }
        case 'x-minus-what-is-y': {
          const x = parseFloat(formData.x13);
          const y = parseFloat(formData.y13);
          if (!validateInputs(formData.x13, formData.y13)) {
            err = 'Please enter valid numbers for X and Y.';
            break;
          }
          if (x === 0) {
            err = 'Original value (X) cannot be zero.';
            break;
          }
          const val = ((x - y) / x) * 100;
          steps = [
            `${x} minus what % is ${y}?`,
            `Equation: P% = ((X - Y) ÷ X) × 100`,
            `P% = ((${x} - ${y}) ÷ ${x}) × 100`,
            `P% = (${x - y} ÷ ${x}) × 100`,
            `P% = ${((x - y) / x).toFixed(6)} × 100`,
            `P% = ${val.toFixed(4).replace(/\.?0+$/, '')}%`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '') + '%';
          calcVisualData = {
            whole: x,
            part: y,
            percentage: val,
            isChange: true,
            changeType: 'decrease',
          };
          break;
        }
        case 'what-minus-p-is-y': {
          const p = parseFloat(formData.p14);
          const y = parseFloat(formData.y14);
          if (!validateInputs(formData.p14, formData.y14)) {
            err = 'Please enter valid numbers for P and Y.';
            break;
          }
          if (1 - p / 100 === 0) {
            err = 'Calculation division by zero error.';
            break;
          }
          const val = y / (1 - p / 100);
          steps = [
            `What minus ${p}% is ${y}?`,
            `Equation: X = Y ÷ (1 - P% ÷ 100)`,
            `X = ${y} ÷ (1 - ${p} ÷ 100)`,
            `X = ${y} ÷ ${(1 - p / 100).toFixed(4)}`,
            `X = ${val.toFixed(4).replace(/\.?0+$/, '')}`,
          ];
          finalResult = val.toFixed(4).replace(/\.?0+$/, '');
          calcVisualData = {
            whole: val,
            part: y,
            percentage: p,
            isChange: true,
            changeType: 'decrease',
          };
          break;
        }
        default:
          err = 'Unknown operation type.';
      }

      if (err) {
        setError(err);
        setResult(null);
        setVisualData(null);
      } else {
        setResult({
          result: finalResult,
          steps: steps,
        });
        setVisualData(calcVisualData);
        setError('');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1a1a1a', '#ffffff', '#a1a1a1']
        });
      }
    } catch (ex) {
      setError('An error occurred during calculation.');
      setResult(null);
    }
  };

  const renderInputs = () => {
    const type = formData.calculationType;

    const inputField = (id: keyof PercentageFormData, label: string, placeholder: string) => (
      <div className="flex flex-col space-y-2 text-left w-full sm:w-1/2">
        <label htmlFor={id} className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
        <input
          type="text"
          id={id}
          value={formData[id]}
          onChange={(e) => handleInputChange(id, e.target.value)}
          placeholder={placeholder}
          className="px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm"
        />
      </div>
    );

    switch (type) {
      case 'percent-of':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('p1', 'Percentage (P%)', 'e.g. 25')}
            {inputField('x1', 'Number (X)', 'e.g. 80')}
          </div>
        );
      case 'y-percent-of-x':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('y2', 'Number (Y)', 'e.g. 20')}
            {inputField('x2', 'Total (X)', 'e.g. 80')}
          </div>
        );
      case 'y-is-p-of-what':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('y3', 'Number (Y)', 'e.g. 20')}
            {inputField('p3', 'Percentage (P%)', 'e.g. 25')}
          </div>
        );
      case 'what-percent-of-x-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x4', 'Total (X)', 'e.g. 80')}
            {inputField('y4', 'Number (Y)', 'e.g. 20')}
          </div>
        );
      case 'p-of-what-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('p5', 'Percentage (P%)', 'e.g. 25')}
            {inputField('y5', 'Number (Y)', 'e.g. 20')}
          </div>
        );
      case 'y-out-of-what-is-p':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('y6', 'Number (Y)', 'e.g. 20')}
            {inputField('p6', 'Percentage (P%)', 'e.g. 25')}
          </div>
        );
      case 'what-out-of-x-is-p':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x7', 'Total (X)', 'e.g. 80')}
            {inputField('p7', 'Percentage (P%)', 'e.g. 25')}
          </div>
        );
      case 'y-out-of-x-is-what':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('y8', 'Number (Y)', 'e.g. 20')}
            {inputField('x8', 'Total (X)', 'e.g. 80')}
          </div>
        );
      case 'x-plus-p-is-what':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x9', 'Number (X)', 'e.g. 100')}
            {inputField('p9', 'Percentage Increase (P%)', 'e.g. 15')}
          </div>
        );
      case 'x-plus-what-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x10', 'Original Number (X)', 'e.g. 100')}
            {inputField('y10', 'Final Number (Y)', 'e.g. 115')}
          </div>
        );
      case 'what-plus-p-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('p11', 'Percentage Increase (P%)', 'e.g. 15')}
            {inputField('y11', 'Final Number (Y)', 'e.g. 115')}
          </div>
        );
      case 'x-minus-p-is-what':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x12', 'Number (X)', 'e.g. 100')}
            {inputField('p12', 'Percentage Decrease (P%)', 'e.g. 15')}
          </div>
        );
      case 'x-minus-what-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('x13', 'Original Number (X)', 'e.g. 100')}
            {inputField('y13', 'Final Number (Y)', 'e.g. 85')}
          </div>
        );
      case 'what-minus-p-is-y':
        return (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {inputField('p14', 'Percentage Decrease (P%)', 'e.g. 15')}
            {inputField('y14', 'Final Number (Y)', 'e.g. 85')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Calculation Type Select */}
        <div className="flex flex-col space-y-2 text-left">
          <label htmlFor="calculation-type" className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Calculation Type
          </label>
          <div className="relative">
            <select
              id="calculation-type"
              value={formData.calculationType}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3.5 focus:outline-none focus:border-slate-400 font-bold text-slate-800 text-sm cursor-pointer pr-10"
            >
              {calculationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
          </div>
        </div>

        {/* Render Form Inputs */}
        <div className="pt-2">{renderInputs()}</div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center flex items-center justify-center space-x-2">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-2">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-7 py-3 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className="pt-6 border-t border-slate-100 space-y-6 animate-fade-in-up">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">Result</h3>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Final Answer
            </span>
            <span className="text-3xl font-black text-slate-900">{result.result}</span>
          </div>

          {/* Steps */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-3 font-mono text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-2.5 last:pb-0 border-b last:border-b-0 border-slate-50">
                  {renderPercentageStep(step)}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Concept Board */}
          {visualData && (
            <div className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 flex flex-col items-center space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-3 border-b border-slate-200/60 gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                  <i className="fas fa-chart-pie mr-1.5 text-slate-400"></i>
                  Live Concepts Visualizer
                </span>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/40">
                  <button
                    type="button"
                    onClick={() => setViewType('grid')}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                      viewType === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewType('gauge')}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                      viewType === 'gauge' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Gauge View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewType('bar')}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase transition-all ${
                      viewType === 'bar' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Bar View
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2 w-full">
                <PercentageVisualizer data={visualData} viewType={viewType} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
