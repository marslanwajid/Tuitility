'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface FormData {
  currency: string;
  method: string;
  cashInHand: string; bankDeposits: string; loansGiven: string; otherCash: string;
  goldGrams: string; silverGrams: string;
  stocks: string; retirement: string; bizMerchandise: string; bizCash: string;
  shortDebt: string; bizExpenses: string;
}

interface ZakatResult {
  totalZakat: number; nisabValue: number; totalAssets: number;
  cashAssets: number; metals: number; investments: number; liabilities: number;
  cashZakat: number; metalsZakat: number; investZakat: number; liabilityZakat: number;
  currency: string; method: string;
}

const MARKET_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.78, INR: 83.50, PKR: 278.50, SAR: 3.75, AED: 3.67, MYR: 4.65, IDR: 15750, TRY: 32.15,
};
const GOLD_PRICE_USD = 65.50;
const SILVER_PRICE_USD = 0.85;
const NISAB_GOLD_G = 87.48;
const NISAB_SILVER_G = 612.36;

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
];

const formatNum = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ZakatCalculator() {
  const [form, setForm] = useState<FormData>({
    currency: 'USD', method: 'gold',
    cashInHand: '', bankDeposits: '', loansGiven: '', otherCash: '',
    goldGrams: '', silverGrams: '',
    stocks: '', retirement: '', bizMerchandise: '', bizCash: '',
    shortDebt: '', bizExpenses: '',
  });
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handle = (field: keyof FormData, value: string) => setForm(p => ({ ...p, [field]: value }));

  const calculate = () => {
    const toNum = (v: string) => Math.max(0, parseFloat(v) || 0);
    const cashIH = toNum(form.cashInHand);
    const bankD = toNum(form.bankDeposits);
    const loans = toNum(form.loansGiven);
    const oCash = toNum(form.otherCash);
    const goldG = toNum(form.goldGrams);
    const silverG = toNum(form.silverGrams);
    const stks = toNum(form.stocks);
    const retire = toNum(form.retirement);
    const bizM = toNum(form.bizMerchandise);
    const bizC = toNum(form.bizCash);
    const debt = toNum(form.shortDebt);
    const bizE = toNum(form.bizExpenses);

    const exRate = MARKET_RATES[form.currency] || 1;
    const goldVal = goldG * GOLD_PRICE_USD / exRate;
    const silverVal = silverG * SILVER_PRICE_USD / exRate;

    const cashAssets = cashIH + bankD + loans + oCash;
    const metals = goldVal + silverVal;
    const investments = stks + retire + bizM + bizC;
    const liabilities = debt + bizE;
    const totalAssets = cashAssets + metals + investments - liabilities;
    const nisabVal = (form.method === 'gold' ? NISAB_GOLD_G * GOLD_PRICE_USD : NISAB_SILVER_G * SILVER_PRICE_USD) / exRate;

    let totalZakat = 0;
    if (totalAssets >= nisabVal) totalZakat = totalAssets * 0.025;

    const cashZakat = cashAssets * 0.025;
    const metalsZakat = metals * 0.025;
    const investZakat = investments * 0.025;
    const liabilityZakat = liabilities * 0.025;

    setResult({ totalZakat, nisabValue: nisabVal, totalAssets, cashAssets, metals, investments, liabilities, cashZakat, metalsZakat, investZakat, liabilityZakat, currency: form.currency, method: form.method });
    setError('');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 }, colors: ['#1a1a1a', '#ffffff', '#8a8a8a'] });
  };

  const reset = () => {
    setForm({
      currency: 'USD', method: 'gold',
      cashInHand: '', bankDeposits: '', loansGiven: '', otherCash: '',
      goldGrams: '', silverGrams: '',
      stocks: '', retirement: '', bizMerchandise: '', bizCash: '',
      shortDebt: '', bizExpenses: '',
    });
    setResult(null); setError('');
  };

  const sections: { title: string; icon: string; fields: { label: string; sublabel: string; icon: string; key: keyof FormData; placeholder: string }[] }[] = [
    { title: 'Cash & Bank Assets', icon: 'fas fa-money-bill-wave', fields: [
      { label: 'Cash in Hand', sublabel: '', icon: 'fas fa-money-bill-wave', key: 'cashInHand', placeholder: '0.00' },
      { label: 'Bank Deposits', sublabel: '', icon: 'fas fa-university', key: 'bankDeposits', placeholder: '0.00' },
      { label: 'Loans Given', sublabel: '', icon: 'fas fa-hand-holding-usd', key: 'loansGiven', placeholder: '0.00' },
      { label: 'Other Cash Assets', sublabel: '', icon: 'fas fa-wallet', key: 'otherCash', placeholder: '0.00' },
    ]},
    { title: 'Gold & Silver (grams)', icon: 'fas fa-gem', fields: [
      { label: 'Gold (g)', sublabel: '', icon: 'fas fa-gem', key: 'goldGrams', placeholder: '0.00' },
      { label: 'Silver (g)', sublabel: '', icon: 'fas fa-medal', key: 'silverGrams', placeholder: '0.00' },
    ]},
    { title: 'Investments & Business', icon: 'fas fa-chart-line', fields: [
      { label: 'Stocks & Mutual Funds', sublabel: '', icon: 'fas fa-chart-line', key: 'stocks', placeholder: '0.00' },
      { label: 'Retirement Accounts', sublabel: '', icon: 'fas fa-piggy-bank', key: 'retirement', placeholder: '0.00' },
      { label: 'Business Merchandise', sublabel: '', icon: 'fas fa-boxes', key: 'bizMerchandise', placeholder: '0.00' },
      { label: 'Business Cash', sublabel: '', icon: 'fas fa-cash-register', key: 'bizCash', placeholder: '0.00' },
    ]},
    { title: 'Liabilities & Deductions', icon: 'fas fa-credit-card', fields: [
      { label: 'Short-term Debt', sublabel: '', icon: 'fas fa-credit-card', key: 'shortDebt', placeholder: '0.00' },
      { label: 'Business Expenses', sublabel: '', icon: 'fas fa-receipt', key: 'bizExpenses', placeholder: '0.00' },
    ]},
  ];

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800 animate-fade-in">
      <div className="space-y-6">
        {/* Currency & Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-coins mr-1 text-slate-400"></i>Currency</label>
            <select value={form.currency} onChange={e => handle('currency', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className="fas fa-balance-scale mr-1 text-slate-400"></i>Nisab Method</label>
            <select value={form.method} onChange={e => handle('method', e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all appearance-none cursor-pointer">
              <option value="gold">Gold Standard (87.48g)</option>
              <option value="silver">Silver Standard (612.36g)</option>
            </select>
          </div>
        </div>

        {/* Dynamic asset sections */}
        {sections.map(sec => (
          <div key={sec.title} className="space-y-3">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
              <i className={`${sec.icon} mr-1.5 text-slate-400`}></i>{sec.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sec.fields.map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider"><i className={`${f.icon} mr-1 text-slate-400`}></i>{f.label}</label>
                  <input type="number" value={form[f.key]} onChange={e => handle(f.key, e.target.value)} placeholder={f.placeholder} step="0.01" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600 text-center">{error}</div>
        )}

        <div className="flex justify-center space-x-4">
          <button type="button" onClick={calculate} className="px-7 py-3 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition-all duration-300 shadow-sm active:scale-95 text-sm cursor-pointer">
            Calculate Zakat
          </button>
          <button type="button" onClick={reset} className="px-7 py-3 rounded-full bg-slate-100 text-slate-650 border border-slate-200 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95 text-sm cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Wealth & Zakat Gauge SVG Widget */}
      <div className="bg-slate-50/60 border border-slate-150 rounded-3xl p-6 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-1 w-full border-b border-slate-200/50 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center">
            <i className="fas fa-chart-bar mr-2 text-slate-400"></i>
            Wealth &amp; Zakat Gauge
          </span>
          <span className="text-[9px] text-slate-450 font-medium">
            Stacked asset breakdown with Nisab threshold and Zakat indicator.
          </span>
        </div>
        <div className="w-full max-w-3xl relative">
          <svg viewBox="0 0 800 200" className="w-full bg-[#0a0a0a] border border-slate-950 rounded-2xl shadow-2xl relative overflow-hidden block">
            <defs>
              <pattern id="z-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
              </pattern>
              <filter id="z-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#z-grid)" />
            <text x="400" y="14" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
              {result ? `Zakat: ${formatNum(result.totalZakat)} ${result.currency} (Nisab: ${formatNum(result.nisabValue)} ${result.currency})` : 'Enter your assets and calculate to see your wealth profile'}
            </text>
            {result ? (
              <>
                {[
                  { label: 'Cash', val: result.cashAssets, color: '#2196f3' },
                  { label: 'Metals', val: result.metals, color: '#ff9800' },
                  { label: 'Invest', val: result.investments, color: '#4caf50' },
                  { label: 'Liability', val: -result.liabilities, color: '#ef4444' },
                ].reduce((acc, cat) => {
                  const bars = acc.bars;
                  const total = result.totalAssets;
                  const maxVal = Math.max(total, result.nisabValue, 1);
                  const w = Math.max((cat.val / maxVal) * 600, cat.val >= 0 ? 4 : -4);
                  const prevX = acc.x;
                  const newX = prevX + (cat.val >= 0 ? w : 0);
                  bars.push(
                    <g key={cat.label}>
                      {cat.val >= 0 ? (
                        <rect x={100 + prevX} y={70} width={Math.min(w, 600 - prevX)} height="20" rx="3" fill={cat.color} opacity="0.7" />
                      ) : (
                        <rect x={100 + prevX + w} y="70" width={Math.min(-w, prevX + w > 0 ? prevX + w : 600)} height="20" rx="3" fill={cat.color} opacity="0.5" stroke={cat.color} strokeWidth="1" strokeDasharray="3 2" />
                      )}
                      <text x={100 + prevX + (cat.val >= 0 ? Math.min(w, 600 - prevX) / 2 : -w / 2)} y="65" textAnchor="middle" fill={cat.color} fontSize="6" fontFamily="monospace">{cat.label}</text>
                    </g>
                  );
                  return { bars, x: cat.val >= 0 ? newX : prevX };
                }, { bars: [] as React.ReactNode[], x: 0 }).bars}
                {/* Nisab marker */}
                <line x1={100 + Math.min((result.nisabValue / Math.max(result.totalAssets, result.nisabValue, 1)) * 600, 600)} y1="60" x2={100 + Math.min((result.nisabValue / Math.max(result.totalAssets, result.nisabValue, 1)) * 600, 600)} y2="100" stroke="#ff5252" strokeWidth="2" strokeDasharray="4 3" />
                <text x={100 + Math.min((result.nisabValue / Math.max(result.totalAssets, result.nisabValue, 1)) * 600, 600)} y="55" textAnchor="middle" fill="#ff5252" fontSize="7" fontFamily="monospace">Nisab</text>
                {/* Zakat badge */}
                {result.totalZakat > 0 && (
                  <text x="400" y="185" textAnchor="middle" fill="#4caf50" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    Zakat Due: {formatNum(result.totalZakat)} {result.currency}
                  </text>
                )}
                {result.totalZakat <= 0 && (
                  <text x="400" y="185" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">
                    No Zakat due (below Nisab threshold)
                  </text>
                )}
              </>
            ) : (
              <>
                <rect x="100" y="70" width="400" height="20" rx="3" fill="#2a2a2a" opacity="0.5" />
                <text x="400" y="125" textAnchor="middle" fill="#4b5563" fontSize="7" fontFamily="monospace">
                  Asset breakdown by category will appear here
                </text>
              </>
            )}
          </svg>
          {result && (
            <div className="absolute top-2.5 left-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm flex flex-col space-y-0.5">
              <div><span className="text-neutral-400">Total:</span> {formatNum(result.totalAssets)} {result.currency}</div>
              <div><span className="text-neutral-400">Nisab:</span> {formatNum(result.nisabValue)} {result.currency}</div>
            </div>
          )}
          {result && result.totalZakat > 0 && (
            <div className="absolute top-2.5 right-3 bg-[#0a0a0a]/90 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-neutral-800 shadow-sm">
              <span className="text-emerald-400">Zakat:</span> {formatNum(result.totalZakat)} {result.currency}
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div ref={resultsRef} className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 text-left shadow-lg relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">ZAKAT</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="text-center pb-4 border-b border-white/10">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Zakat Obligation</span>
              <span className="text-3xl md:text-4xl font-black tracking-tight">{result.totalZakat > 0 ? `${formatNum(result.totalZakat)} ${result.currency}` : 'No Zakat Due'}</span>
              <p className="text-sm text-slate-300 mt-2">
                {result.currency === 'USD' ? '$' : result.currency}{formatNum(result.totalAssets)} total assets <span className="text-slate-500">|</span> Nisab: {formatNum(result.nisabValue)} {result.currency}
              </p>
              {result.totalZakat <= 0 && <p className="text-xs text-slate-400 mt-1">Your assets are below the Nisab threshold. Zakat is not obligatory.</p>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Cash & Bank', value: `${formatNum(result.cashAssets)}`, zakat: `${formatNum(result.cashZakat)}`, color: '#2196f3' },
                { label: 'Gold & Silver', value: `${formatNum(result.metals)}`, zakat: `${formatNum(result.metalsZakat)}`, color: '#ff9800' },
                { label: 'Investments', value: `${formatNum(result.investments)}`, zakat: `${formatNum(result.investZakat)}`, color: '#4caf50' },
                { label: 'Less Liabilities', value: `-${formatNum(result.liabilities)}`, zakat: `${formatNum(result.liabilityZakat)}`, color: '#ef4444' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 p-3.5 rounded-xl border border-white/10 text-center">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-base font-black text-white mt-1 block" style={{ color: item.color }}>{item.value} {result.currency}</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">Zakat: {item.zakat} {result.currency}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Important Notes</h4>
              <ul className="space-y-1.5">
                {result.totalAssets < result.nisabValue ? (
                  <>
                    <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>Your wealth is below the Nisab threshold. Zakat is not obligatory for you this year.</span></li>
                    <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>Consider giving voluntary charity (Sadaqah) according to your means.</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>Zakat is due at 2.5% of Zakatable assets held for one lunar year (Hawl).</span></li>
                    <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>Primary residence, personal vehicles, and clothing are exempt from Zakat.</span></li>
                    <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>Distribute Zakat to eligible recipients or reliable Zakat organizations.</span></li>
                  </>
                )}
                <li className="flex items-start space-x-2 text-xs text-white/80"><span className="text-emerald-400 mt-0.5 shrink-0">{'\u2022'}</span><span>For specific rulings, consult with a qualified Islamic scholar.</span></li>
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Step-by-Step Resolution Steps</h4>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs text-white/70 leading-relaxed font-medium">
                {(() => {
                  const steps: string[] = [];
                  steps.push('**Step 1: Calculate Nisab Threshold**');
                  steps.push(`$$\\text{Nisab} = \\frac{${result.method === 'gold' ? NISAB_GOLD_G : NISAB_SILVER_G} \\times ${result.method === 'gold' ? GOLD_PRICE_USD : SILVER_PRICE_USD}}{\\text{Exchange Rate}}$$`);
                  steps.push(`* $\\text{Nisab} = ${formatNum(result.nisabValue)} \\text{ ${result.currency}}$`);
                  steps.push('**Step 2: Sum All Zakatable Assets**');
                  steps.push('$$\\text{Total} = \\text{Cash} + \\text{Metals} + \\text{Investments} - \\text{Liabilities}$$');
                  steps.push(`* Cash: ${formatNum(result.cashAssets)} ${result.currency}`);
                  steps.push(`* Metals: ${formatNum(result.metals)} ${result.currency}`);
                  steps.push(`* Investments: ${formatNum(result.investments)} ${result.currency}`);
                  steps.push(`* Liabilities: -${formatNum(result.liabilities)} ${result.currency}`);
                  steps.push(`* $\\text{Total} = ${formatNum(result.totalAssets)} \\text{ ${result.currency}}$`);
                  steps.push('**Step 3: Compare to Nisab**');
                  steps.push(`* $${formatNum(result.totalAssets)} \\text{ ${result.currency}} \\geq ${formatNum(result.nisabValue)} \\text{ ${result.currency}}$`);
                  if (result.totalZakat > 0) {
                    steps.push('**Step 4: Calculate Zakat (Assets \u2265 Nisab)**');
                    steps.push('$$\\text{Zakat} = \\text{Total Assets} \\times 0.025$$');
                    steps.push(`$$\\text{Zakat} = ${formatNum(result.totalAssets)} \\times 0.025 = ${formatNum(result.totalZakat)} \\text{ ${result.currency}}$$`);
                  } else {
                    steps.push('**Step 4: No Zakat Due**');
                    steps.push('* Your total assets are below the Nisab threshold, so Zakat is not obligatory.');
                  }
                  return steps.map((step, idx) => {
                    const trimmed = step.trim();
                    if (trimmed.startsWith('$$')) {
                      return (<div key={idx} className="py-2.5 overflow-x-auto scrollbar-thin"><BlockMath math={trimmed.replace(/\$\$/g, '')} /></div>);
                    }
                    const isBold = trimmed.startsWith('**');
                    const cleanText = trimmed.replace(/^\* |\*\*/g, '');
                    const inlineRegex = /\$([^$]+)\$/g;
                    let lastIdx = 0;
                    const parts: React.ReactNode[] = [];
                    let match;
                    while ((match = inlineRegex.exec(cleanText)) !== null) {
                      if (match.index > lastIdx) parts.push(cleanText.substring(lastIdx, match.index));
                      parts.push(<InlineMath key={match.index} math={match[1]} />);
                      lastIdx = inlineRegex.lastIndex;
                    }
                    if (lastIdx < cleanText.length) parts.push(cleanText.substring(lastIdx));
                    return (<p key={idx} className={isBold ? 'font-black text-white pt-2 first:pt-0' : ''}>{parts.length > 0 ? parts : cleanText}</p>);
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
