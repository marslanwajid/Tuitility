'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

type OffsiteAdTier = 'none' | 'standard' | 'premium';
const OFFSITE_RATES: Record<OffsiteAdTier, { label: string; rate: number }> = {
  none: { label: 'Not enrolled', rate: 0 },
  standard: { label: 'Under $10k (12%)', rate: 0.12 },
  premium: { label: 'Over $10k (15%)', rate: 0.15 },
};
const QUICK_PRESETS = [15, 25, 35, 45, 65, 100];

export default function EtsyFeeCalculator() {
  const [salePrice, setSalePrice] = useState(35);
  const [shippingCharged, setShippingCharged] = useState(0);
  const [itemCost, setItemCost] = useState(10);
  const [shippingCost, setShippingCost] = useState(5);
  const [offsiteTier, setOffsiteTier] = useState<OffsiteAdTier>('none');
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null);

  const totalRev = salePrice + shippingCharged;

  const fees = useMemo(() => {
    const trans = totalRev * 0.065;
    const list = 0.20;
    const proc = totalRev * 0.03 + 0.25;
    const off = totalRev * OFFSITE_RATES[offsiteTier].rate;
    const total = trans + list + proc + off;
    const costs = itemCost + shippingCost;
    const profit = totalRev - total - costs;
    return { trans, list, proc, off, total, costs, profit, margin: totalRev > 0 ? (profit / totalRev) * 100 : 0, deduct: total + costs };
  }, [totalRev, itemCost, shippingCost, offsiteTier]);

  const segments = useMemo(() => {
    const items = [
      { label: 'Your Profit', value: Math.max(0, fees.profit), color: '#1a1a1a' },
      { label: 'Etsy Fees', value: fees.total, color: '#6b7280' },
      { label: 'Item Cost', value: itemCost, color: '#9ca3af' },
      { label: 'Shipping Cost', value: shippingCost, color: '#d1d5db' },
    ].filter(s => s.value > 0);
    const sum = items.reduce((a, s) => a + s.value, 0);
    let acc = 0;
    return items.map(s => {
      const pct = sum > 0 ? s.value / sum : 0;
      const start = acc;
      acc += pct * 360;
      return { ...s, pct, startAngle: start, endAngle: acc };
    });
  }, [fees.profit, fees.total, itemCost, shippingCost]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS – col-span-7 */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Sale Details
          </h3>

          {/* Sale Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Sale Price</label>
              <input type="number" min="0" step="0.01" value={salePrice}
                onChange={(e) => setSalePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
            </div>
            <input type="range" min="0" max="500" step="1" value={salePrice}
              onChange={(e) => setSalePrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex space-x-1.5">
              {QUICK_PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => setSalePrice(p)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${salePrice === p ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  ${p}
                </button>
              ))}
            </div>
          </div>

          {/* Shipping Charged, Item Cost, Shipping Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Shipping Charged</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input type="number" min="0" step="0.01" value={shippingCharged}
                  onChange={(e) => setShippingCharged(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Item Cost</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input type="number" min="0" step="0.01" value={itemCost}
                  onChange={(e) => setItemCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Shipping Cost</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input type="number" min="0" step="0.01" value={shippingCost}
                  onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Offsite Ads */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Offsite Ads Fee</label>
            <div className="flex flex-wrap gap-2 text-sm">
              {(Object.entries(OFFSITE_RATES) as [OffsiteAdTier, { label: string; rate: number }][]).map(([key, opt]) => (
                <button key={key} type="button" onClick={() => setOffsiteTier(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                    offsiteTier === key
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Fee Breakdown</span>
            {[
              { label: 'Transaction Fee (6.5%)', value: fees.trans },
              { label: 'Listing Fee ($0.20)', value: fees.list },
              { label: 'Payment Processing (3% + $0.25)', value: fees.proc },
              ...(fees.off > 0 ? [{ label: `Offsite Ads (${(OFFSITE_RATES[offsiteTier].rate * 100).toFixed(0)}%)`, value: fees.off }] : []),
            ].map((item, i) => (
              <div key={i} className="flex justify-between border-b border-slate-200 pb-1.5 last:border-0">
                <span className="text-slate-500 font-bold">{item.label}</span>
                <span className="font-black font-mono text-slate-900">{fmt(item.value)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t-2 border-slate-300 pt-2">
              <span className="font-extrabold text-slate-800 uppercase text-xs tracking-wider">Total Fees</span>
              <span className="font-black font-mono text-lg text-slate-900">{fmt(fees.total)}</span>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3 text-sm">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Cost Summary</span>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Item Cost</span><span className="font-black font-mono text-slate-900">{fmt(itemCost)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Shipping Cost</span><span className="font-black font-mono text-slate-900">{fmt(shippingCost)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-bold">Total Deductions</span>
              <span className="font-black font-mono text-lg text-slate-900">{fmt(fees.deduct)}</span>
            </div>
          </div>
        </div>

        {/* RESULTS – col-span-5 */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Profit Summary
          </h3>

          {/* Dark Hero Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">Etsy</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Net Profit</span>
                <div className={`text-5xl font-black font-mono ${fees.profit < 0 ? 'text-red-400' : 'text-white'}`}>
                  {fmt(fees.profit)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  {fees.margin >= 0 ? '+' : ''}{fees.margin.toFixed(1)}% margin
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(totalRev)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Fees</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.total)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Costs (Item + Ship)</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.costs)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Profit Margin</span>
                  <span className={`font-mono font-black text-base ${fees.margin >= 10 ? 'text-emerald-400' : fees.margin >= 0 ? 'text-slate-100' : 'text-red-400'}`}>
                    {fees.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loss Warning */}
          {fees.profit < 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 block">Sale at a Loss</span>
              <p className="text-[10px] text-amber-600 font-medium">Consider raising your sale price, reducing item costs, or negotiating shipping rates.</p>
            </div>
          )}

          {/* Doughnut Chart */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col items-center space-y-4">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Where Your Money Goes</span>
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                {segments.map((s, i) => {
                  const r = 40, circ = 2 * Math.PI * r;
                  const dash = s.pct * circ, off = circ - (s.startAngle / 360) * circ;
                  return (
                    <circle key={i} cx="50" cy="50" r={r} fill="transparent" stroke={s.color}
                      strokeWidth={hoveredSeg === i ? 15 : 12}
                      strokeDasharray={`${dash} ${circ}`} strokeDashoffset={off}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSeg(i)}
                      onMouseLeave={() => setHoveredSeg(null)} />
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total</span>
                <span className="text-xl font-black text-slate-900 font-mono">{fmt(totalRev)}</span>
              </div>
            </div>
            <div className="w-full space-y-1.5 text-sm">
              {segments.map((s, i) => (
                <div key={i} onMouseEnter={() => setHoveredSeg(i)} onMouseLeave={() => setHoveredSeg(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${
                    hoveredSeg === i ? 'bg-white border-slate-200 font-black shadow-sm' : 'border-transparent text-slate-650'
                  }`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                    <span>{s.label}</span>
                  </div>
                  <span className="font-mono">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
