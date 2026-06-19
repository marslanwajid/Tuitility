'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

type Mode = 'forward' | 'reverse';

const STATE_SALES_TAX: Record<string, { name: string; rate: number }> = {
  AL: { name: 'Alabama', rate: 4.0 }, AK: { name: 'Alaska', rate: 0 }, AZ: { name: 'Arizona', rate: 5.6 },
  AR: { name: 'Arkansas', rate: 6.5 }, CA: { name: 'California', rate: 7.25 }, CO: { name: 'Colorado', rate: 2.9 },
  CT: { name: 'Connecticut', rate: 6.35 }, DE: { name: 'Delaware', rate: 0 }, DC: { name: 'District of Columbia', rate: 6.0 },
  FL: { name: 'Florida', rate: 6.0 }, GA: { name: 'Georgia', rate: 4.0 }, HI: { name: 'Hawaii', rate: 4.17 },
  ID: { name: 'Idaho', rate: 6.0 }, IL: { name: 'Illinois', rate: 6.25 }, IN: { name: 'Indiana', rate: 7.0 },
  IA: { name: 'Iowa', rate: 6.0 }, KS: { name: 'Kansas', rate: 6.5 }, KY: { name: 'Kentucky', rate: 6.0 },
  LA: { name: 'Louisiana', rate: 4.45 }, ME: { name: 'Maine', rate: 5.5 }, MD: { name: 'Maryland', rate: 6.0 },
  MA: { name: 'Massachusetts', rate: 6.25 }, MI: { name: 'Michigan', rate: 6.0 }, MN: { name: 'Minnesota', rate: 6.88 },
  MS: { name: 'Mississippi', rate: 7.0 }, MO: { name: 'Missouri', rate: 4.23 }, MT: { name: 'Montana', rate: 0 },
  NE: { name: 'Nebraska', rate: 5.5 }, NV: { name: 'Nevada', rate: 6.85 }, NH: { name: 'New Hampshire', rate: 0 },
  NJ: { name: 'New Jersey', rate: 6.63 }, NM: { name: 'New Mexico', rate: 5.13 }, NY: { name: 'New York', rate: 8.0 },
  NC: { name: 'North Carolina', rate: 4.75 }, ND: { name: 'North Dakota', rate: 5.0 }, OH: { name: 'Ohio', rate: 5.75 },
  OK: { name: 'Oklahoma', rate: 4.5 }, OR: { name: 'Oregon', rate: 0 }, PA: { name: 'Pennsylvania', rate: 6.0 },
  RI: { name: 'Rhode Island', rate: 7.0 }, SC: { name: 'South Carolina', rate: 6.0 }, SD: { name: 'South Dakota', rate: 4.5 },
  TN: { name: 'Tennessee', rate: 7.0 }, TX: { name: 'Texas', rate: 6.25 }, UT: { name: 'Utah', rate: 6.1 },
  VT: { name: 'Vermont', rate: 6.0 }, VA: { name: 'Virginia', rate: 5.3 }, WA: { name: 'Washington', rate: 6.5 },
  WV: { name: 'West Virginia', rate: 6.0 }, WI: { name: 'Wisconsin', rate: 5.0 }, WY: { name: 'Wyoming', rate: 4.0 },
};

const STATE_ABBREVS = Object.keys(STATE_SALES_TAX);
const quickPrices = [10, 25, 50, 100, 500];
const quickRates = [0, 5, 6, 7, 8, 10];
const scenarioAddOns = [0, 1, 2];

export default function SalesTaxCalculator() {
  const [mode, setMode] = useState<Mode>('forward');
  const [itemPrice, setItemPrice] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState('NY');
  const [stateRate, setStateRate] = useState(STATE_SALES_TAX.NY.rate);
  const [localRate, setLocalRate] = useState(0);
  const [totalWithTax, setTotalWithTax] = useState(100);

  const combinedRate = stateRate + localRate;

  const result = useMemo(() => {
    if (mode === 'forward') {
      const subtotal = itemPrice * quantity;
      const taxAmount = subtotal * (combinedRate / 100);
      const total = subtotal + taxAmount;
      const taxPct = total > 0 ? (taxAmount / total) * 100 : 0;
      const avgTax = quantity > 0 ? taxAmount / quantity : 0;
      return { subtotal, taxAmount, total, taxPct, avgTax, originalPrice: 0 };
    } else {
      const divisor = 1 + combinedRate / 100;
      const originalPrice = totalWithTax / divisor;
      const taxAmount = totalWithTax - originalPrice;
      const subtotal = originalPrice;
      const taxPct = totalWithTax > 0 ? (taxAmount / totalWithTax) * 100 : 0;
      const avgTax = quantity > 0 ? taxAmount / quantity : 0;
      return { subtotal, taxAmount, total: totalWithTax, taxPct, avgTax, originalPrice };
    }
  }, [mode, itemPrice, quantity, combinedRate, totalWithTax]);

  // Scenarios
  const scenarios = useMemo(() => {
    return scenarioAddOns.map((addOn) => {
      const rate = combinedRate + addOn;
      if (mode === 'forward') {
        const subtotal = itemPrice * quantity;
        const taxAmount = subtotal * (rate / 100);
        const total = subtotal + taxAmount;
        return { label: addOn === 0 ? `Current (${combinedRate.toFixed(2)}%)` : `+${addOn}% (${rate.toFixed(2)}%)`, taxAmount, total, rate };
      } else {
        const divisor = 1 + rate / 100;
        const originalPrice = totalWithTax / divisor;
        const taxAmount = totalWithTax - originalPrice;
        return { label: addOn === 0 ? `Current (${combinedRate.toFixed(2)}%)` : `+${addOn}% (${rate.toFixed(2)}%)`, taxAmount, total: totalWithTax, rate };
      }
    });
  }, [mode, itemPrice, quantity, combinedRate, totalWithTax]);

  const handleStateChange = (abbr: string) => {
    setState(abbr);
    setStateRate(STATE_SALES_TAX[abbr]?.rate ?? 0);
  };

  const handleReset = () => {
    setMode('forward');
    setItemPrice(50);
    setQuantity(1);
    setState('NY');
    setStateRate(STATE_SALES_TAX.NY.rate);
    setLocalRate(0);
    setTotalWithTax(100);
  };

  const modeLabel = mode === 'forward' ? 'Forward (Price \u2192 Total)' : 'Reverse (Total \u2192 Price)';
  const subtitle = mode === 'forward'
    ? 'Enter item price and quantity to calculate total with tax'
    : 'Enter total with tax to find original price before tax';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          {(['forward', 'reverse'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-5 md:px-8 py-2 rounded-lg text-xs md:text-sm font-extrabold transition-all whitespace-nowrap ${mode === m ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {m === 'forward' ? 'Forward' : 'Reverse'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            {modeLabel}
          </h3>
          <p className="text-xs text-slate-400 font-mono -mt-4">{subtitle}</p>

          {mode === 'forward' ? (
            <>
              {/* Item Price */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Item Price</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">$</span>
                    <input type="number" value={itemPrice} onChange={(e) => setItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
                  </div>
                </div>
                <input type="range" min={0} max={10000} step={0.5} value={itemPrice} onChange={(e) => setItemPrice(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                <div className="flex space-x-1.5 flex-wrap gap-y-1.5">
                  {quickPrices.map((amt) => (
                    <button key={amt} type="button" onClick={() => setItemPrice(amt)}
                      className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${itemPrice === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                      {fmt(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Quantity</label>
                  <input type="number" min={1} max={100} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none focus:border-slate-400 focus:bg-white" />
                </div>
                <input type="range" min={1} max={100} step={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            </>
          ) : (
            <>
              {/* Total with Tax (Reverse mode) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Total with Tax</label>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 font-mono text-sm">$</span>
                    <input type="number" value={totalWithTax} onChange={(e) => setTotalWithTax(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                  </div>
                </div>
                <input type="range" min={0} max={50000} step={0.5} value={totalWithTax} onChange={(e) => setTotalWithTax(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>

              {/* Quantity (also used in reverse for avg tax calc) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Quantity</label>
                  <input type="number" min={1} max={100} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                </div>
                <input type="range" min={1} max={100} step={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>
            </>
          )}

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-6">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Tax Rate
          </h3>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">State</label>
            <select value={state} onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-700 focus:outline-none focus:border-slate-400 focus:bg-white appearance-none cursor-pointer">
              {STATE_ABBREVS.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr} &mdash; {STATE_SALES_TAX[abbr].name} ({STATE_SALES_TAX[abbr].rate > 0 ? STATE_SALES_TAX[abbr].rate + '%' : 'No state tax'})
                </option>
              ))}
            </select>
          </div>

          {/* State Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">State Rate</label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.01" min={0} max={15} value={stateRate}
                  onChange={(e) => setStateRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min={0} max={15} step={0.01} value={stateRate} onChange={(e) => setStateRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
          </div>

          {/* Local Add-On */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Local Add-On (city/county)</label>
              <div className="flex items-center space-x-1">
                <input type="number" step="0.01" min={0} max={5} value={localRate}
                  onChange={(e) => setLocalRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
            </div>
            <input type="range" min={0} max={5} step={0.01} value={localRate} onChange={(e) => setLocalRate(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="text-xs text-slate-400 font-mono bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              Combined rate: <strong className="text-slate-700">{combinedRate.toFixed(2)}%</strong> ({stateRate.toFixed(2)}% state + {localRate.toFixed(2)}% local)
            </div>
          </div>

          {/* Quick Rate Presets */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Quick Presets</label>
            <div className="flex space-x-1.5 flex-wrap gap-y-1.5">
              {quickRates.map((rate) => (
                <button key={rate} type="button" onClick={() => { setStateRate(rate); setLocalRate(0); }}
                  className={`px-3 py-1.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${stateRate === rate && localRate === 0 ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset All</button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Calculation
          </h3>

          {/* Black Result Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">{mode === 'forward' ? 'TAX' : 'NET'}</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">
                  {mode === 'forward' ? 'Total with Tax' : 'Original Price (Before Tax)'}
                </span>
                <div className="text-5xl font-black text-white font-mono">
                  {mode === 'forward' ? fmt(result.total) : fmt(result.subtotal)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  Tax: {fmt(result.taxAmount)} &middot; Rate: {combinedRate.toFixed(2)}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Subtotal</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.subtotal)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tax Amount</span>
                  <span className="font-mono font-black text-base text-rose-400">{fmt(result.taxAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tax % of Total</span>
                  <span className="font-mono font-black text-base text-amber-400">{result.taxPct.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Tax / Item</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(result.avgTax)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Panel */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Line Item Breakdown</span>
            <div className="space-y-2.5 text-sm">
              {mode === 'forward' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">{itemPrice === 0 ? 'Price' : fmt(itemPrice)} &times; {quantity}</span>
                  <span className="font-black font-mono text-slate-900">{fmt(itemPrice * quantity)}</span>
                </div>
              )}
              {mode === 'reverse' && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Paid</span>
                  <span className="font-black font-mono text-slate-900">{fmt(result.total)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Subtotal</span>
                <span className="font-black font-mono text-slate-900">{fmt(result.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Sales Tax ({combinedRate.toFixed(2)}%)</span>
                <span className="font-black font-mono text-rose-500">{fmt(result.taxAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="text-slate-700 font-black">Total</span>
                <span className="font-black font-mono text-lg text-slate-900">{fmt(result.total)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-bold">Tax as % of Total</span>
                <span className="font-black font-mono text-amber-600">{result.taxPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Avg Tax per Item</span>
                <span className="font-black font-mono text-slate-700">{fmt(result.avgTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width: Rate Scenario Comparison */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400 text-sm"></i>
            Rate Scenario Comparison
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Base: {combinedRate.toFixed(2)}%</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-auto shadow-inner">
          <table className="w-full min-w-[500px] text-xs border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0 z-10">
                <th className="px-4 py-3 w-1/4">Scenario</th>
                <th className="px-4 py-3 w-1/4">Tax Rate</th>
                <th className="px-4 py-3 w-1/4">Tax Amount</th>
                <th className="px-4 py-3 w-1/4">{mode === 'forward' ? 'Total' : 'Original Price'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {scenarios.map((s, i) => {
                const diff = s.taxAmount - scenarios[0].taxAmount;
                return (
                  <tr key={i} className={`hover:bg-slate-50/60 transition-colors ${i === 0 ? 'font-black' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-900">{s.label}</td>
                    <td className="px-4 py-3">{s.rate.toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      {fmt(s.taxAmount)}
                      {i > 0 && (
                        <span className={`ml-1.5 text-[10px] ${diff >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          ({diff >= 0 ? '+' : ''}{fmt(diff)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{fmt(s.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
