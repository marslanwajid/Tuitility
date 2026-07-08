'use client';

import React, { useState, useMemo } from 'react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

const QUICK_PRESETS = [5, 10, 25, 50, 100, 500, 1000];
const FIVERR_COMMISSION = 0.20;
const BUYER_SERVICE_FEE_RATE = 0.055;

type WithdrawalMethod = 'bank' | 'paypal' | 'payoneer' | 'direct';

const WITHDRAWAL_METHODS: Record<WithdrawalMethod, { label: string; fee: (amount: number) => number }> = {
  bank: { label: 'Bank Transfer (Free)', fee: () => 0 },
  paypal: { label: 'PayPal ($2)', fee: () => 2 },
  payoneer: { label: 'Payoneer (1%)', fee: (a) => a * 0.01 },
  direct: { label: 'Direct Deposit ($0.50)', fee: () => 0.5 },
};

export default function FiverrFeeCalculator() {
  const [gigPrice, setGigPrice] = useState(25);
  const [extras, setExtras] = useState(0);
  const [sellerCosts, setSellerCosts] = useState(0);
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('bank');

  const fees = useMemo(() => {
    const orderSubtotal = gigPrice + extras;
    const fiverrCommission = orderSubtotal * FIVERR_COMMISSION;
    const buyerServiceFee = orderSubtotal * BUYER_SERVICE_FEE_RATE;
    const withdrawalFee = WITHDRAWAL_METHODS[withdrawalMethod].fee(orderSubtotal);
    const totalFees = fiverrCommission + buyerServiceFee + withdrawalFee;
    const totalDeductions = totalFees + sellerCosts;
    const sellerNet = orderSubtotal - fiverrCommission - withdrawalFee - sellerCosts;
    const buyerTotal = orderSubtotal + buyerServiceFee;
    const netMargin = orderSubtotal > 0 ? (sellerNet / orderSubtotal) * 100 : 0;
    return { orderSubtotal, fiverrCommission, buyerServiceFee, withdrawalFee, totalFees, sellerCosts, totalDeductions, sellerNet, buyerTotal, netMargin };
  }, [gigPrice, extras, sellerCosts, withdrawalMethod]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS -- col-span-7 */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Sale Details
          </h3>

          {/* Gig Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Gig Price</label>
              <input type="number" min="0" step="0.01" value={gigPrice}
                onChange={(e) => setGigPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-28 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg font-mono text-sm text-right font-black focus:outline-none" />
            </div>
            <input type="range" min="0" max="10000" step="1" value={gigPrice}
              onChange={(e) => setGigPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => setGigPrice(p)}
                  className={`px-2.5 py-0.5 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${gigPrice === p ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  ${p}
                </button>
              ))}
            </div>
          </div>

          {/* Extras & Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Buyer Extras (Optional)</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input type="number" min="0" step="0.01" value={extras}
                  onChange={(e) => setExtras(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Seller Costs (Optional)</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input type="number" min="0" step="0.01" value={sellerCosts}
                  onChange={(e) => setSellerCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-lg font-mono text-xs text-right font-black focus:outline-none" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center mt-8">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Fee Settings
          </h3>

          {/* Withdrawal Method */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Withdrawal Method</label>
            <div className="flex flex-wrap gap-2 text-sm">
              {(Object.entries(WITHDRAWAL_METHODS) as [WithdrawalMethod, { label: string; fee: (amount: number) => number }][]).map(([key, opt]) => (
                <button key={key} type="button" onClick={() => setWithdrawalMethod(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                    withdrawalMethod === key
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
              { label: 'Order Subtotal', value: fees.orderSubtotal, isTotal: false, isSub: false },
              { label: `Fiverr Commission (${(FIVERR_COMMISSION * 100).toFixed(0)}%)`, value: fees.fiverrCommission, isTotal: false, isSub: false },
              { label: `Buyer Service Fee (${(BUYER_SERVICE_FEE_RATE * 100).toFixed(1)}%)`, value: fees.buyerServiceFee, isTotal: false, isSub: false },
              { label: `Withdrawal Fee (${WITHDRAWAL_METHODS[withdrawalMethod].label.replace(/\(.*\)/, '').trim()})`, value: fees.withdrawalFee, isTotal: false, isSub: false },
              { label: 'Seller Costs', value: fees.sellerCosts, isTotal: false, isSub: false },
            ].map((item, i) => (
              <div key={i} className="flex justify-between border-b border-slate-200 pb-1.5 last:border-0">
                <span className="text-slate-500 font-bold">{item.label}</span>
                <span className="font-black font-mono text-slate-900">{fmt(item.value)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t-2 border-slate-300 pt-2">
              <span className="font-extrabold text-slate-800 uppercase text-xs tracking-wider">Total Fees & Costs</span>
              <span className="font-black font-mono text-lg text-slate-900">{fmt(fees.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* RESULTS -- col-span-5 */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">3</span>
            Earnings Summary
          </h3>

          {/* Dark Hero Card */}
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[110px] font-black italic">Fiverr</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Seller Net Earnings</span>
                <div className={`text-5xl font-black font-mono ${fees.sellerNet < 0 ? 'text-red-400' : 'text-white'}`}>
                  {fmt(fees.sellerNet)}
                </div>
                <div className="text-sm text-slate-400 font-mono mt-1">
                  {fees.netMargin >= 0 ? '+' : ''}{fees.netMargin.toFixed(1)}% margin
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">List Price</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(gigPrice)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Buyer Pays</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.buyerTotal)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fiverr Commission</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.fiverrCommission)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Buyer Service Fee</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.buyerServiceFee)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Withdrawal Fee</span>
                  <span className="font-mono font-black text-base text-slate-100">{fmt(fees.withdrawalFee)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Margin</span>
                  <span className={`font-mono font-black text-base ${fees.netMargin >= 20 ? 'text-emerald-400' : fees.netMargin >= 0 ? 'text-slate-100' : 'text-red-400'}`}>
                    {fees.netMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loss Warning */}
          {fees.sellerNet < 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 block">Sale at a Loss</span>
              <p className="text-[10px] text-amber-600 font-medium">Consider raising your gig price, reducing seller costs, or switching to a lower-fee withdrawal method.</p>
            </div>
          )}

          {/* Quick Comparison */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">List Price</span>
              <span className="text-2xl font-black font-mono text-slate-900">{fmt(gigPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Buyer Pays</span>
              <span className="text-lg font-black font-mono text-slate-900">{fmt(fees.buyerTotal)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Seller Keeps</span>
              <span className={`text-2xl font-black font-mono ${fees.sellerNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmt(fees.sellerNet)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
