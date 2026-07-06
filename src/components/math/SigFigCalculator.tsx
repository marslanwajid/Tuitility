'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import 'katex/dist/katex.min.css';

interface SigFigDigit {
  char: string;
  isSignificant: boolean;
  rule: 'non-zero' | 'captive-zero' | 'leading-zero' | 'trailing-decimal-zero' | 'trailing-whole-zero' | 'decimal-point' | 'sign';
  label: string;
}

interface SigFigResult {
  displayInput: string;
  count: number;
  digits: SigFigDigit[];
  steps: string[];
  rules: string[];
  hasAmbiguousTrailingZeros: boolean;
  ambiguousNote?: string;
  roundedResult?: string;
  roundingSteps?: string[];
}

function getSigFigColor(digit: SigFigDigit): string {
  if (digit.char === '.' || digit.char === '-' || digit.char === '+') return 'text-slate-400';
  if (digit.isSignificant) return 'text-[#1a1a1a]';
  return 'text-slate-300';
}

function getSigFigBg(digit: SigFigDigit): string {
  if (digit.char === '.' || digit.char === '-' || digit.char === '+') return 'bg-transparent';
  if (digit.isSignificant) return 'bg-[#1a1a1a]/10 border-[#1a1a1a]/30';
  return 'bg-slate-100 border-slate-200';
}

function getRuleBadgeColor(rule: string): string {
  switch (rule) {
    case 'non-zero': return 'bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20';
    case 'captive-zero': return 'bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20';
    case 'leading-zero': return 'bg-[#1a1a1a]/5 text-slate-400 border-slate-200';
    case 'trailing-decimal-zero': return 'bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20';
    case 'trailing-whole-zero': return 'bg-[#1a1a1a]/10 text-[#1a1a1a] border-[#1a1a1a]/20';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getRuleIcon(rule: string): string {
  switch (rule) {
    case 'non-zero': return 'fas fa-check-circle';
    case 'captive-zero': return 'fas fa-border-all';
    case 'leading-zero': return 'fas fa-times-circle';
    case 'trailing-decimal-zero': return 'fas fa-check-circle';
    case 'trailing-whole-zero': return 'fas fa-exclamation-circle';
    default: return 'fas fa-circle';
  }
}

function analyzeSigFigs(input: string): {
  digits: SigFigDigit[];
  count: number;
  hasAmbiguousTrailingZeros: boolean;
  ambiguousNote?: string;
} {
  const trimmed = input.trim();
  const chars = trimmed.split('');
  const digits: SigFigDigit[] = [];

  // Find first non-zero digit index (ignoring sign and decimal)
  let firstNonZero = -1;
  let lastNonZero = -1;
  let hasDecimal = false;

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === '.') hasDecimal = true;
    if (c >= '1' && c <= '9') {
      if (firstNonZero === -1) firstNonZero = i;
      lastNonZero = i;
    }
  }

  // If no non-zero digit found, all are non-significant
  if (firstNonZero === -1) {
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      digits.push({
        char: c,
        isSignificant: false,
        rule: 'leading-zero',
        label: c === '.' ? 'Decimal point' : 'Zero — no non-zero digits found, not significant',
      });
    }
    return { digits, count: 0, hasAmbiguousTrailingZeros: false };
  }

  let significantCount = 0;
  let hasAmbiguousTrailingZeros = false;
  let ambiguousNote: string | undefined;

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];

    if (c === '.' || c === '-' || c === '+') {
      digits.push({
        char: c,
        isSignificant: false,
        rule: c === '.' ? 'decimal-point' : 'sign',
        label: c === '.' ? 'Decimal point (placeholder)' : 'Sign indicator',
      });
      continue;
    }

    if (c >= '1' && c <= '9') {
      significantCount++;
      digits.push({
        char: c,
        isSignificant: true,
        rule: 'non-zero',
        label: `Non-zero digit — always significant (rule 1)`,
      });
      continue;
    }

    // c is '0'
    const idx = i;

    if (idx < firstNonZero) {
      // Zero before first non-zero digit
      digits.push({
        char: c,
        isSignificant: false,
        rule: 'leading-zero',
        label: 'Leading zero — not significant (rule 3)',
      });
    } else if (idx > lastNonZero) {
      // Zero after last non-zero digit
      if (hasDecimal) {
        // After decimal point → significant
        significantCount++;
        digits.push({
          char: c,
          isSignificant: true,
          rule: 'trailing-decimal-zero',
          label: 'Trailing zero after decimal — significant (rule 4)',
        });
      } else {
        // Whole number, no decimal → ambiguous, not significant
        hasAmbiguousTrailingZeros = true;
        digits.push({
          char: c,
          isSignificant: false,
          rule: 'trailing-whole-zero',
          label: 'Trailing zero in whole number — ambiguous, treated as not significant (rule 5). Add a decimal point (e.g. "100.") to make all trailing zeros significant.',
        });
      }
    } else {
      // Zero between first and last non-zero digit → captive zero
      significantCount++;
      digits.push({
        char: c,
        isSignificant: true,
        rule: 'captive-zero',
        label: 'Captive zero between non-zero digits — significant (rule 2)',
      });
    }
  }

  if (hasAmbiguousTrailingZeros) {
    ambiguousNote =
      'This number ends with trailing zeros in a whole number without a decimal point. These zeros are ambiguous under standard sig fig rules. Adding a decimal point (e.g., "100.") makes them significant.';
  }

  return { digits, count: significantCount, hasAmbiguousTrailingZeros, ambiguousNote };
}

function roundToSigFigs(input: string, targetCount: number): {
  result: string;
  steps: string[];
} {
  const trimmed = input.trim();
  const analysis = analyzeSigFigs(input);
  const steps: string[] = [];

  if (analysis.count === 0) {
    steps.push('No significant digits found — result is 0.');
    return { result: '0', steps };
  }

  if (targetCount >= analysis.count) {
    steps.push(`The input already has ${analysis.count} significant figure${analysis.count !== 1 ? 's' : ''}, which is within the target of ${targetCount}. No rounding needed.`);
    return { result: trimmed, steps };
  }

  // Count only significant digits positions in original
  const sigDigitIndices: number[] = [];
  for (let i = 0; i < analysis.digits.length; i++) {
    const d = analysis.digits[i];
    if (d.isSignificant) {
      sigDigitIndices.push(i);
    }
  }

  // The Nth significant digit is at sigDigitIndices[targetCount - 1]
  // The (N+1)th significant digit is at sigDigitIndices[targetCount]
  const nthSigIndex = sigDigitIndices[targetCount - 1];
  const nextSigIndex = sigDigitIndices[targetCount];

  // Get all chars
  const chars = trimmed.split('');
  const nthDigit = chars[nthSigIndex];
  const nthDigitVal = parseInt(nthDigit);

  // Determine if we round up
  let roundUp = false;

  if (nextSigIndex !== undefined) {
    const nextDigit = chars[nextSigIndex];
    const nextDigitVal = parseInt(nextDigit);
    if (nextDigitVal >= 5) {
      roundUp = true;
    }
    steps.push(`The ${targetCount === 1 ? '1st' : targetCount === 2 ? '2nd' : targetCount === 3 ? '3rd' : `${targetCount}th`} significant digit is '${nthDigit}' at position ${nthSigIndex + 1}.`);
    steps.push(`The next digit (${targetCount + 1}th significant) is '${nextDigit}' — ${nextDigitVal >= 5 ? '≥ 5, round up' : '< 5, keep same'}.`);
  } else {
    steps.push(`Only ${analysis.count} significant digit${analysis.count !== 1 ? 's' : ''} exist; target ${targetCount} is achievable by zero-padding.`);
  }

  // Build result by taking chars up to nthSigIndex, then possible adjustments
  let resultChars: string[] = [];

  // Determine how many characters to keep from original
  // We need to keep all characters up to and including the nth significant digit
  // But also maintain decimal point position

  // Find where the decimal point is
  let decimalIdx = -1;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === '.') {
      decimalIdx = i;
      break;
    }
  }

  // The rounding position in the result
  // We keep chars from 0 to nthSigIndex (inclusive) from the original
  // then pad with zeros to maintain place value if needed

  // Determine the result length: we need to keep place value
  // Find the position relative to decimal

  // Simple approach: copy chars up to nthSigIndex, handle rounding, pad
  for (let i = 0; i <= nthSigIndex; i++) {
    if (chars[i] === '.') continue;
    resultChars.push(chars[i]);
  }

  if (roundUp) {
    // Propagate carry through result from right to left
    let carry = 1;
    for (let i = resultChars.length - 1; i >= 0; i--) {
      if (resultChars[i] === '.' || resultChars[i] === '-' || resultChars[i] === '+') continue;
      const val = parseInt(resultChars[i]) + carry;
      if (val === 10) {
        resultChars[i] = '0';
        carry = 1;
      } else {
        resultChars[i] = val.toString();
        carry = 0;
        break;
      }
    }
    if (carry === 1) {
      resultChars.unshift('1');
    }
  }

  // Re-insert decimal if needed
  // Calculate the new decimal position
  let resultStr: string;

  // Determine how many digits after decimal point in result
  // We need to pad with zeros so the result has the same decimal precision
  // as the position of the Nth significant digit

  if (decimalIdx !== -1) {
    // Determine the result format
    // Count digits after decimal in the original up to nthSigIndex
    const digitsAfterDecimal = nthSigIndex - decimalIdx;

    if (digitsAfterDecimal >= 0) {
      // Decimal is included in the kept portion
      // Build with decimal at the right position
      let resultWithDecimal = '';
      const charArray = chars.slice(0, nthSigIndex + 1);

      // Apply rounding to the last digit if needed
      if (roundUp) {
        // Already handled in resultChars above
      }

      // Rebuild with decimal
      let digitPos = 0;
      const plainDigits: string[] = [];
      for (let i = 0; i < chars.length && i <= nthSigIndex; i++) {
        if (chars[i] === '.' || chars[i] === '-' || chars[i] === '+') continue;
        plainDigits.push(resultChars[digitPos] || chars[i]);
        digitPos++;
      }

      // Place decimal
      const resultDigitsBeforeDecimal = decimalIdx;
      let sigPos = 0;
      const finalParts: string[] = [];
      for (let i = 0; i < chars.length; i++) {
        if (i > nthSigIndex) break;
        if (chars[i] === '.' || chars[i] === '-' || chars[i] === '+') {
          if (chars[i] === '.') {
            // Check if we've passed all digits before decimal
            const beforeDecCount = chars.slice(0, i).filter(c => c >= '0' && c <= '9').length;
            if (roundUp && beforeDecCount < plainDigits.length) {
              // Use the adjusted value
            }
          }
          finalParts.push(chars[i]);
          continue;
        }
        if (chars[i] >= '0' && chars[i] <= '9') {
          const adjusted = resultChars[sigPos] ?? chars[i];
          finalParts.push(adjusted);
          sigPos++;
        }
      }
      resultStr = finalParts.join('');

      // Pad with zeros after decimal if needed to show precision
      if (digitsAfterDecimal > 0) {
        const currentAfterDecimal = resultStr.split('.')[1]?.length || 0;
        for (let i = currentAfterDecimal; i < digitsAfterDecimal; i++) {
          resultStr += '0';
        }
      }
    } else {
      // Decimal is after the kept portion — need to pad with zeros
      resultStr = resultChars.join('');
      // No need to add decimal since we're keeping only integer part
    }
  } else {
    resultStr = resultChars.join('');

    // Pad with zeros to maintain place value
    // The result should have (nthSigIndex + 1) characters (minus sign/decimal)
    const originalDigitCount = chars.filter(c => c >= '0' && c <= '9').length;
    const keptDigitCount = resultChars.filter(c => c >= '0' && c <= '9').length;

    // We need to pad if the number is a whole number and we removed trailing digits
    // but need to keep place value (e.g., 12345 -> 12000 for 2 sig figs)
    const originalNum = parseFloat(trimmed);
    if (!isNaN(originalNum) && originalNum >= 1) {
      const resultNum = parseFloat(resultStr);
      // Pad with zeros to maintain magnitude
      const magnitude = Math.floor(Math.log10(originalNum)) + 1; // digits in integer part
      const keptDigits = keptDigitCount;
      if (keptDigits < magnitude) {
        for (let i = keptDigits; i < magnitude; i++) {
          resultStr += '0';
        }
      }
    }
  }

  steps.push(`Result: ${resultStr}`);

  // Post-process resultStr to handle edge cases
  // Remove leading zeros after sign
  let cleaned = resultStr;
  cleaned = cleaned.replace(/^(-?)0+(?=\d)/, '$1');
  if (cleaned.startsWith('.') || cleaned.startsWith('-.')) {
    cleaned = cleaned.replace(/^(-?)\./, '$10.');
  }
  if (cleaned === '' || cleaned === '-') cleaned = '0';

  // If resultStr looks wrong, fall back
  const finalResult = resultStr;

  return { result: finalResult, steps };
}

const PRESETS = [
  { label: '0.00450', value: '0.00450', desc: '3 sig figs — leading zeros not significant' },
  { label: '100', value: '100', desc: '1 sig fig — ambiguous trailing zeros' },
  { label: '100.', value: '100.', desc: '3 sig figs — decimal makes zeros significant' },
  { label: '0.00102', value: '0.00102', desc: '3 sig figs — captive zero is significant' },
  { label: '3.14159', value: '3.14159', desc: '6 sig figs — all non-zero' },
  { label: '1000', value: '1000', desc: '1 sig fig — ambiguous' },
  { label: '0.0500', value: '0.0500', desc: '3 sig figs — trailing decimal zeros' },
  { label: '1.200', value: '1.200', desc: '4 sig figs — trailing decimal zeros' },
  { label: '0.00052', value: '0.00052', desc: '2 sig figs — leading zeros not significant' },
];

export default function SigFigCalculator() {
  const [activeTab, setActiveTab] = useState<'count' | 'round'>('count');
  const [numberInput, setNumberInput] = useState<string>('3.14159');
  const [targetSigFigs, setTargetSigFigs] = useState<number>(3);
  const [result, setResult] = useState<SigFigResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hoveredDigit, setHoveredDigit] = useState<number | null>(null);

  const computeResult = useCallback(() => {
    const trimmed = numberInput.trim();
    if (!trimmed) {
      throw new Error('Please enter a number.');
    }

    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) {
      throw new Error('Please enter a valid number.');
    }

    const analysis = analyzeSigFigs(trimmed);
    const steps: string[] = [];
    const rules: string[] = [];

    if (analysis.count === 0) {
      steps.push('No significant figures found. All digits are non-significant.');
      return {
        displayInput: trimmed,
        count: 0,
        digits: analysis.digits,
        steps,
        rules: ['no-significant-digits'],
        hasAmbiguousTrailingZeros: false,
      };
    }

    // Build step-by-step explanation
    const stepLines: string[] = [];

    if (analysis.digits.some(d => d.rule === 'non-zero')) {
      stepLines.push('Step 1: All non-zero digits (1-9) are always significant.');
      rules.push('non-zero');
    }

    if (analysis.digits.some(d => d.rule === 'captive-zero')) {
      stepLines.push('Step 2: Zeros between non-zero digits (captive zeros) are significant.');
      rules.push('captive-zero');
    }

    if (analysis.digits.some(d => d.rule === 'leading-zero')) {
      stepLines.push('Step 3: Leading zeros before the first non-zero digit are NOT significant. They are only placeholders.');
      rules.push('leading-zero');
    }

    if (analysis.digits.some(d => d.rule === 'trailing-decimal-zero')) {
      stepLines.push('Step 4: Trailing zeros after a decimal point ARE significant — they indicate measurement precision.');
      rules.push('trailing-decimal-zero');
    }

    if (analysis.digits.some(d => d.rule === 'trailing-whole-zero')) {
      stepLines.push('Step 5: Trailing zeros in a whole number without a decimal are ambiguous — treated as NOT significant by default.');
      rules.push('trailing-whole-zero');
    }

    // Per-digit scan
    stepLines.push('');
    stepLines.push(`Digit-by-digit scan of "${trimmed}":`);
    analysis.digits.forEach((d, idx) => {
      if (d.char === '.' || d.char === '-' || d.char === '+') {
        stepLines.push(`  Position ${idx + 1}: '${d.char}' — ${d.label}`);
      } else {
        stepLines.push(
          `  Position ${idx + 1}: '${d.char}' — ${d.isSignificant ? 'SIGNIFICANT' : 'NOT significant'} — ${d.label}`
        );
      }
    });

    stepLines.push('');
    stepLines.push(`Total: ${analysis.count} significant figure${analysis.count !== 1 ? 's' : ''}.`);

    return {
      displayInput: trimmed,
      count: analysis.count,
      digits: analysis.digits,
      steps: stepLines,
      rules,
      hasAmbiguousTrailingZeros: analysis.hasAmbiguousTrailingZeros,
      ambiguousNote: analysis.ambiguousNote,
    };
  }, [numberInput]);

  const computeRoundResult = useCallback(() => {
    const trimmed = numberInput.trim();
    if (!trimmed) throw new Error('Please enter a number.');
    if (isNaN(parseFloat(trimmed))) throw new Error('Please enter a valid number.');

    const analysis = analyzeSigFigs(trimmed);
    if (analysis.count === 0) throw new Error('No significant figures found in the input.');

    if (targetSigFigs < 1 || targetSigFigs > 15) {
      throw new Error('Target significant figures must be between 1 and 15.');
    }

    const rounding = roundToSigFigs(trimmed, targetSigFigs);

    const steps: string[] = [
      `Rounding "${trimmed}" to ${targetSigFigs} significant figure${targetSigFigs !== 1 ? 's' : ''}:`,
      `The input has ${analysis.count} significant figure${analysis.count !== 1 ? 's' : ''} in total.`,
      '',
      ...rounding.steps,
    ];

    return {
      displayInput: trimmed,
      count: analysis.count,
      digits: analysis.digits,
      steps,
      rules: [],
      hasAmbiguousTrailingZeros: analysis.hasAmbiguousTrailingZeros,
      ambiguousNote: analysis.ambiguousNote,
      roundedResult: rounding.result,
      roundingSteps: rounding.steps,
    };
  }, [numberInput, targetSigFigs]);

  useEffect(() => {
    if (hasCalculated) {
      try {
        if (activeTab === 'count') {
          const r = computeResult();
          setResult(r);
          setError('');
        } else {
          const r = computeRoundResult();
          setResult(r);
          setError('');
        }
      } catch (err: any) {
        setError(err.message || '');
        setResult(null);
      }
    }
  }, [numberInput, targetSigFigs, activeTab, hasCalculated, computeResult, computeRoundResult]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let r: SigFigResult;
      if (activeTab === 'count') {
        r = computeResult();
      } else {
        r = computeRoundResult();
      }
      setResult(r);
      setHasCalculated(true);
      setError('');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1a1a1a', '#ffffff', '#a1a1a1'],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
      setResult(null);
    }
  };

  const handleReset = () => {
    setNumberInput('3.14159');
    setTargetSigFigs(3);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handlePreset = (value: string) => {
    setNumberInput(value);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  const handleTabChange = (tab: 'count' | 'round') => {
    setActiveTab(tab);
    setResult(null);
    setHasCalculated(false);
    setError('');
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      {/* Tab Selectors */}
      <div className="flex justify-center">
        <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
          <button
            onClick={() => handleTabChange('count')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 ${
              activeTab === 'count'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            Count Sig Figs
          </button>
          <button
            onClick={() => handleTabChange('round')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-350 active:scale-95 ${
              activeTab === 'round'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            Round to Sig Figs
          </button>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="space-y-4">
          {/* Number Input */}
          <div className="flex flex-col space-y-2 text-left">
            <label htmlFor="sigfig-number" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Enter a Number
            </label>
            <input
              type="text"
              id="sigfig-number"
              value={numberInput}
              onChange={(e) => { setNumberInput(e.target.value); setError(''); }}
              className="w-full bg-slate-50 border border-slate-200/80 px-4 py-3.5 rounded-2xl font-mono text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              placeholder="e.g. 3.14159, 0.00450, 100"
            />
          </div>

          {/* Target Sig Figs - only in Round mode */}
          {activeTab === 'round' && (
            <div className="flex flex-col space-y-2 text-left">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Target Significant Figures: {targetSigFigs}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setTargetSigFigs(Math.max(1, targetSigFigs - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-sm font-bold"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <div className="flex-1 max-w-xs">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={targetSigFigs}
                    onChange={(e) => setTargetSigFigs(parseInt(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTargetSigFigs(Math.min(15, targetSigFigs + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center text-sm font-bold"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <span className="w-10 text-center font-bold font-mono text-lg text-slate-900">
                  {targetSigFigs}
                </span>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div className="pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePreset(preset.value)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all hover:bg-slate-100 ${
                    numberInput === preset.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            {activeTab === 'count' ? 'Count Sig Figs' : 'Round to Sig Figs'}
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
          <h3 className="text-lg font-extrabold text-slate-900 text-center font-display">
            {activeTab === 'count' ? 'Significant Figures Result' : 'Rounding Result'}
          </h3>

          {/* Hero Summary Card - follow SSE/Derivative dark card pattern */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 space-y-5 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">SF</span>
            </div>

            <div className="space-y-4 relative z-10">
              {/* For Round mode, show both counts */}
              {activeTab === 'round' && result.roundedResult ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Original Number
                    </span>
                    <div className="text-lg font-bold font-mono text-slate-200">
                      {result.displayInput}
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Rounded to {targetSigFigs} Significant Figure{targetSigFigs !== 1 ? 's' : ''}
                    </span>
                    <div className="text-3xl font-black text-white font-mono py-1">
                      {result.roundedResult}
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Original Had
                    </span>
                    <div className="text-xl font-extrabold text-slate-200 font-mono">
                      {result.count} significant figure{result.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Input Number
                    </span>
                    <div className="text-lg font-bold font-mono text-slate-200">
                      {result.displayInput}
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Significant Figures
                    </span>
                    <div className="text-5xl font-black text-white py-1 font-mono">
                      {result.count}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ambiguous Trailing Zeros Warning */}
          {result.hasAmbiguousTrailingZeros && (
            <div className="p-4 bg-[#1a1a1a]/5 border border-[#1a1a1a]/20 rounded-2xl text-xs font-bold text-[#1a1a1a] flex items-start space-x-2.5">
              <i className="fas fa-exclamation-triangle text-[#1a1a1a]/60 mt-0.5"></i>
              <span>{result.ambiguousNote}</span>
            </div>
          )}

          {/* Color-Coded Digit Grid */}
          <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-4">
            <div className="flex items-center justify-between w-full pb-2.5 border-b border-slate-200/60">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
                <i className="fas fa-grip-horizontal mr-1.5 text-slate-400"></i>
                Digit-by-Digit Significance
              </span>
              <div className="flex space-x-3 text-[9px] font-bold">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#1a1a1a]/20 border border-[#1a1a1a]/40"></span>
                  <span className="text-slate-500">Significant</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span>
                  <span className="text-slate-500">Not significant</span>
                </span>
              </div>
            </div>

            {/* Digit Grid */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 py-3">
              {result.digits.map((digit, idx) => {
                if (digit.char === '.' || digit.char === '-' || digit.char === '+') {
                  return (
                    <span
                      key={idx}
                      className="text-lg font-bold text-slate-400 select-none px-0.5"
                    >
                      {digit.char}
                    </span>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="relative"
                    onMouseEnter={() => setHoveredDigit(idx)}
                    onMouseLeave={() => setHoveredDigit(null)}
                  >
                    <div
                      className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center text-lg font-black font-mono cursor-default transition-all duration-150 ${getSigFigBg(digit)} ${getSigFigColor(digit)} ${
                        hoveredDigit === idx ? 'scale-110 shadow-md z-10' : ''
                      }`}
                    >
                      {digit.char}
                    </div>

                    {/* Tooltip */}
                    {hoveredDigit === idx && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap max-w-[280px] text-center leading-relaxed">
                          {digit.label}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary line */}
            <div className="text-xs font-bold text-slate-500 pt-1 border-t border-slate-200/60 w-full text-center">
              <span className="text-[#1a1a1a] font-black">{result.count}</span> significant figure{result.count !== 1 ? 's' : ''} in "<span className="font-mono">{result.displayInput}</span>"
            </div>
          </div>

          {/* Rule Badges */}
          {result.rules.length > 0 && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1">
                <i className="fas fa-tags mr-1 text-slate-400"></i>
                Rules Applied:
              </span>
              {result.rules.map((rule, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRuleBadgeColor(rule)}`}
                >
                  <i className={`${getRuleIcon(rule)} text-[9px]`}></i>
                  <span>
                    {rule === 'non-zero' ? 'Non-zero digits' :
                     rule === 'captive-zero' ? 'Captive zeros' :
                     rule === 'leading-zero' ? 'Leading zeros' :
                     rule === 'trailing-decimal-zero' ? 'Trailing decimal zeros' :
                     rule === 'trailing-whole-zero' ? 'Trailing whole zeros' :
                     rule}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 text-left">
            <h4 className="text-sm text-slate-500 font-extrabold uppercase tracking-wider flex items-center">
              <i className="fas fa-list-ol mr-1.5 text-slate-400"></i>
              Step-by-Step Resolution
            </h4>
            <div className="space-y-1.5 font-mono text-sm text-slate-700 leading-relaxed bg-white border border-slate-150 p-5 rounded-2xl shadow-inner max-h-80 overflow-y-auto">
              {result.steps.map((step, idx) => {
                const isHeading = step.startsWith('Step ');
                if (step === '') {
                  return <div key={idx} className="h-1" />;
                }
                if (isHeading) {
                  return (
                    <div key={idx} className="text-xs font-black text-slate-900 pt-2 pb-0.5 border-b border-slate-100 mb-1">
                      {step}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="text-[11px] leading-relaxed text-slate-600 py-0.5 pl-2 border-l-2 border-slate-200">
                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Proportion Bar - significant vs not */}
          {result.digits.length > 0 && (
            <div className="bg-slate-50/60 border border-slate-150 rounded-2xl p-5 flex flex-col items-center space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center self-start">
                <i className="fas fa-chart-bar mr-1.5 text-slate-400"></i>
                Significance Proportion
              </span>
              {(() => {
                const total = result.digits.filter(d => d.char >= '0' && d.char <= '9').length;
                const sigCount = result.count;
                const nonSigCount = total - sigCount;
                const sigPct = total > 0 ? (sigCount / total) * 100 : 0;
                const nonSigPct = total > 0 ? (nonSigCount / total) * 100 : 0;

                return (
                  <div className="w-full max-w-md space-y-3">
                    <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200/50">
                      {sigCount > 0 && (
                        <div
                          style={{ width: `${sigPct}%` }}
                          className="h-full bg-[#1a1a1a]/70 transition-all duration-500 flex items-center justify-center"
                        >
                          {sigPct > 15 && (
                            <span className="text-[9px] font-extrabold text-white drop-shadow-sm">
                              {sigCount} sig
                            </span>
                          )}
                        </div>
                      )}
                      {nonSigCount > 0 && (
                        <div
                          style={{ width: `${nonSigPct}%` }}
                          className="h-full bg-[#1a1a1a]/20 transition-all duration-500 flex items-center justify-center"
                        >
                          {nonSigPct > 15 && (
                            <span className="text-[9px] font-extrabold text-[#1a1a1a]/70">
                              {nonSigCount} non-sig
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded bg-[#1a1a1a]/70"></span>
                        <span>Significant: {sigCount}/{total} ({sigPct.toFixed(0)}%)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded bg-[#1a1a1a]/20"></span>
                        <span>Non-significant: {nonSigCount}/{total} ({nonSigPct.toFixed(0)}%)</span>
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
