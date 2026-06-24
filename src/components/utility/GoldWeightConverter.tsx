'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const CONVERSION_FACTORS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 31.1035,
  ct: 0.2,
  dwt: 1.55517,
  gn: 0.0648,
  lb: 373.242,
  tola: 11.6638,
};

const UNIT_INFO: Record<string, { name: string; icon: string }> = {
  g: { name: 'Grams (g)', icon: 'fa-weight' },
  kg: { name: 'Kilograms (kg)', icon: 'fa-weight-hanging' },
  oz: { name: 'Troy Ounces (oz t)', icon: 'fa-circle' },
  ct: { name: 'Carats (ct)', icon: 'fa-gem' },
  dwt: { name: 'Pennyweight (dwt)', icon: 'fa-coins' },
  gn: { name: 'Grains (gn)', icon: 'fa-seedling' },
  lb: { name: 'Troy Pounds (lb t)', icon: 'fa-weight-scale' },
  tola: { name: 'Tola', icon: 'fa-indian-rupee-sign' },
};

const formatValue = (val: number): string => {
  if (val >= 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (val >= 100) return val.toFixed(3);
  if (val >= 10) return val.toFixed(4);
  if (val >= 1) return val.toFixed(5);
  if (val === 0) return '0';
  return val.toFixed(6);
};

export default function GoldWeightConverter() {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('g');
  const [toUnit, setToUnit] = useState('oz');
  const [result, setResult] = useState('0');
  const [allConversions, setAllConversions] = useState<{ unit: string; value: string }[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const val = parseFloat(value);
    if (!value || isNaN(val) || val < 0) {
      setResult('0');
      setAllConversions([]);
      return;
    }
    const grams = val * CONVERSION_FACTORS[fromUnit];
    const finalResult = grams / CONVERSION_FACTORS[toUnit];
    setResult(formatValue(finalResult));

    const conversions = Object.entries(CONVERSION_FACTORS).map(([unit, factor]) => ({
      unit,
      value: formatValue(grams / factor),
    }));
    setAllConversions(conversions);
  }, [value, fromUnit, toUnit]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${result} ${UNIT_INFO[toUnit].name}`);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy.', 'error');
    }
  };

  const handleReset = () => {
    setValue('');
    setFromUnit('g');
    setToUnit('oz');
    setResult('0');
    setAllConversions([]);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Banner */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">GOLD</span>
        </div>
        <i className="fas fa-coins text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All conversions are calculated locally in your browser. No data is ever uploaded.
          </p>
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Widget */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">24K</span>
        </div>

        <div className="relative z-10 p-5 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Converter */}
            <div className="lg:w-5/12 space-y-5">
              {/* Amount Input */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Weight</label>
                <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter weight..." min={0}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-white/40" />
              </div>

              {/* From / To */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">From</label>
                  <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                    {Object.entries(UNIT_INFO).map(([key, info]) => (
                      <option key={key} value={key} className="bg-[#1a1a1a]">{info.name}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSwap}
                  className="px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors mb-0"
                  title="Swap units">
                  <i className="fas fa-arrow-right-arrow-left"></i>
                </button>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">To</label>
                  <select value={toUnit} onChange={e => setToUnit(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-white/40 appearance-none cursor-pointer">
                    {Object.entries(UNIT_INFO).map(([key, info]) => (
                      <option key={key} value={key} className="bg-[#1a1a1a]">{info.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5 text-center space-y-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Result</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-white font-mono">{result}</span>
                  <span className="text-sm text-slate-400">{UNIT_INFO[toUnit].name}</span>
                  <button onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs hover:bg-white/20 transition-colors">
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>

              {/* Reset */}
              <button onClick={handleReset}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5">
                <i className="fas fa-undo"></i>Reset
              </button>
            </div>

            {/* Right: All Units Reference */}
            <div className="lg:w-7/12">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">All Units</p>
              {allConversions.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {allConversions.map(({ unit, value: v }) => (
                    <div key={unit}
                      className={`rounded-xl p-3 border flex items-center gap-3 cursor-pointer transition-colors ${unit === toUnit ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      onClick={() => setToUnit(unit)}>
                      <i className={`fas ${UNIT_INFO[unit].icon} text-slate-400 text-sm w-4 text-center`}></i>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-400 truncate">{UNIT_INFO[unit].name}</p>
                        <p className="text-sm font-bold font-mono text-white">{v}</p>
                      </div>
                      {unit === toUnit && <i className="fas fa-check text-emerald-400 text-xs"></i>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                  <p className="text-xs text-slate-500">Enter a weight to see all unit conversions</p>
                </div>
              )}
            </div>
          </div>

          {/* Cross-promotion */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3 mt-6">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need more financial tools? Try <a href="/finance/calculators/currency-calculator" className="text-white font-bold underline hover:text-slate-200">Currency Calculator</a>, check returns with <a href="/finance/calculators/roi-calculator" className="text-white font-bold underline hover:text-slate-200">ROI Calculator</a>, or factor in costs with <a href="/finance/calculators/sales-tax-calculator" className="text-white font-bold underline hover:text-slate-200">Sales Tax Calculator</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
