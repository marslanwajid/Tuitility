'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

const CURRENCY_INFO: Record<string, { name: string; country: string; symbol: string }> = {
  USD: { name: 'US Dollar', country: 'United States', symbol: '$' },
  EUR: { name: 'Euro', country: 'European Union', symbol: '\u20AC' },
  GBP: { name: 'British Pound', country: 'United Kingdom', symbol: '\u00A3' },
  JPY: { name: 'Japanese Yen', country: 'Japan', symbol: '\u00A5' },
  CNY: { name: 'Chinese Yuan', country: 'China', symbol: '\u00A5' },
  INR: { name: 'Indian Rupee', country: 'India', symbol: '\u20B9' },
  CAD: { name: 'Canadian Dollar', country: 'Canada', symbol: 'C$' },
  AUD: { name: 'Australian Dollar', country: 'Australia', symbol: 'A$' },
  CHF: { name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF' },
  SEK: { name: 'Swedish Krona', country: 'Sweden', symbol: 'kr' },
  NOK: { name: 'Norwegian Krone', country: 'Norway', symbol: 'kr' },
  DKK: { name: 'Danish Krone', country: 'Denmark', symbol: 'kr' },
  PLN: { name: 'Polish Z\u0142oty', country: 'Poland', symbol: 'z\u0142' },
  CZK: { name: 'Czech Koruna', country: 'Czech Republic', symbol: 'K\u010D' },
  HUF: { name: 'Hungarian Forint', country: 'Hungary', symbol: 'Ft' },
  RUB: { name: 'Russian Ruble', country: 'Russia', symbol: '\u20BD' },
  TRY: { name: 'Turkish Lira', country: 'Turkey', symbol: '\u20BA' },
  BRL: { name: 'Brazilian Real', country: 'Brazil', symbol: 'R$' },
  MXN: { name: 'Mexican Peso', country: 'Mexico', symbol: '$' },
  KRW: { name: 'South Korean Won', country: 'South Korea', symbol: '\u20A9' },
  SGD: { name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$' },
  THB: { name: 'Thai Baht', country: 'Thailand', symbol: '\u0E3F' },
  MYR: { name: 'Malaysian Ringgit', country: 'Malaysia', symbol: 'RM' },
  IDR: { name: 'Indonesian Rupiah', country: 'Indonesia', symbol: 'Rp' },
  PHP: { name: 'Philippine Peso', country: 'Philippines', symbol: '\u20B1' },
  VND: { name: 'Vietnamese \u0110\u1ED3ng', country: 'Vietnam', symbol: '\u20AB' },
  HKD: { name: 'Hong Kong Dollar', country: 'Hong Kong', symbol: 'HK$' },
  TWD: { name: 'New Taiwan Dollar', country: 'Taiwan', symbol: 'NT$' },
  ILS: { name: 'Israeli New Shekel', country: 'Israel', symbol: '\u20AA' },
  AED: { name: 'UAE Dirham', country: 'United Arab Emirates', symbol: '\u062F.\u0625' },
  SAR: { name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: '\u0631.\u0633' },
  QAR: { name: 'Qatari Riyal', country: 'Qatar', symbol: '\u0631.\u0642' },
  KWD: { name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: '\u062F.\u0643' },
  BHD: { name: 'Bahraini Dinar', country: 'Bahrain', symbol: '.\u062F.\u0628' },
  OMR: { name: 'Omani Rial', country: 'Oman', symbol: '\u0631.\u0639.' },
  JOD: { name: 'Jordanian Dinar', country: 'Jordan', symbol: '\u062F.\u0627' },
  LBP: { name: 'Lebanese Pound', country: 'Lebanon', symbol: '\u0644.\u0644' },
  EGP: { name: 'Egyptian Pound', country: 'Egypt', symbol: '\u062C.\u0645' },
  ZAR: { name: 'South African Rand', country: 'South Africa', symbol: 'R' },
  NGN: { name: 'Nigerian Naira', country: 'Nigeria', symbol: '\u20A6' },
  KES: { name: 'Kenyan Shilling', country: 'Kenya', symbol: 'KSh' },
  GHS: { name: 'Ghanaian Cedi', country: 'Ghana', symbol: 'GH\u20B5' },
  MAD: { name: 'Moroccan Dirham', country: 'Morocco', symbol: '\u062F.\u0645.' },
  TND: { name: 'Tunisian Dinar', country: 'Tunisia', symbol: '\u062F.\u062A' },
  DZD: { name: 'Algerian Dinar', country: 'Algeria', symbol: '\u062F.\u062C' },
  UGX: { name: 'Ugandan Shilling', country: 'Uganda', symbol: 'USh' },
  TZS: { name: 'Tanzanian Shilling', country: 'Tanzania', symbol: 'TSh' },
  MWK: { name: 'Malawian Kwacha', country: 'Malawi', symbol: 'MK' },
  ZMW: { name: 'Zambian Kwacha', country: 'Zambia', symbol: 'ZK' },
  BWP: { name: 'Botswana Pula', country: 'Botswana', symbol: 'P' },
  MUR: { name: 'Mauritian Rupee', country: 'Mauritius', symbol: '\u20A8' },
  LKR: { name: 'Sri Lankan Rupee', country: 'Sri Lanka', symbol: 'Rs' },
  PKR: { name: 'Pakistani Rupee', country: 'Pakistan', symbol: '\u20A8' },
  BDT: { name: 'Bangladeshi Taka', country: 'Bangladesh', symbol: '\u09F3' },
  NPR: { name: 'Nepalese Rupee', country: 'Nepal', symbol: '\u20A8' },
  MMK: { name: 'Myanmar Kyat', country: 'Myanmar', symbol: 'K' },
  KHR: { name: 'Cambodian Riel', country: 'Cambodia', symbol: '\u17DB' },
  LAK: { name: 'Lao Kip', country: 'Laos', symbol: '\u20AD' },
  MNT: { name: 'Mongolian T\u00F6gr\u00F6g', country: 'Mongolia', symbol: '\u20AE' },
  BYN: { name: 'Belarusian Ruble', country: 'Belarus', symbol: 'Br' },
  UAH: { name: 'Ukrainian Hryvnia', country: 'Ukraine', symbol: '\u20B4' },
  MDL: { name: 'Moldovan Leu', country: 'Moldova', symbol: 'L' },
  RON: { name: 'Romanian Leu', country: 'Romania', symbol: 'lei' },
  BGN: { name: 'Bulgarian Lev', country: 'Bulgaria', symbol: '\u043B\u0432' },
  HRK: { name: 'Croatian Kuna', country: 'Croatia', symbol: 'kn' },
  RSD: { name: 'Serbian Dinar', country: 'Serbia', symbol: '\u0434\u0438\u043D.' },
  ALL: { name: 'Albanian Lek', country: 'Albania', symbol: 'L' },
  MKD: { name: 'Macedonian Denar', country: 'North Macedonia', symbol: '\u0434\u0435\u043D' },
  GEL: { name: 'Georgian Lari', country: 'Georgia', symbol: '\u20BE' },
  AMD: { name: 'Armenian Dram', country: 'Armenia', symbol: '\u058F' },
  AZN: { name: 'Azerbaijani Manat', country: 'Azerbaijan', symbol: '\u20BC' },
  KZT: { name: 'Kazakhstani Tenge', country: 'Kazakhstan', symbol: '\u20B8' },
  KGS: { name: 'Kyrgyzstani Som', country: 'Kyrgyzstan', symbol: '\u0441' },
  TJS: { name: 'Tajikistani Somoni', country: 'Tajikistan', symbol: '\u0405M' },
  TMT: { name: 'Turkmenistan Manat', country: 'Turkmenistan', symbol: 'T' },
  UZS: { name: 'Uzbekistani Som', country: 'Uzbekistan', symbol: 'som' },
  AFN: { name: 'Afghan Afghani', country: 'Afghanistan', symbol: '\u060B' },
  IRR: { name: 'Iranian Rial', country: 'Iran', symbol: '\uFDFC' },
  IQD: { name: 'Iraqi Dinar', country: 'Iraq', symbol: '\u0639.\u062F' },
  SYP: { name: 'Syrian Pound', country: 'Syria', symbol: '\u00A3' },
  YER: { name: 'Yemeni Rial', country: 'Yemen', symbol: '\uFDFC' },
  SDG: { name: 'Sudanese Pound', country: 'Sudan', symbol: '\u062C.\u0633.' },
  SSP: { name: 'South Sudanese Pound', country: 'South Sudan', symbol: 'SSP' },
  SOS: { name: 'Somali Shilling', country: 'Somalia', symbol: 'S' },
  ETB: { name: 'Ethiopian Birr', country: 'Ethiopia', symbol: 'Br' },
  DJF: { name: 'Djiboutian Franc', country: 'Djibouti', symbol: 'Fdj' },
  KMF: { name: 'Comorian Franc', country: 'Comoros', symbol: 'CF' },
  MGA: { name: 'Malagasy Ariary', country: 'Madagascar', symbol: 'Ar' },
  MZN: { name: 'Mozambican Metical', country: 'Mozambique', symbol: 'MT' },
  ZWL: { name: 'Zimbabwean Dollar', country: 'Zimbabwe', symbol: 'Z$' },
  BOB: { name: 'Bolivian Boliviano', country: 'Bolivia', symbol: 'Bs' },
  PYG: { name: 'Paraguayan Guaran\u00ED', country: 'Paraguay', symbol: '\u20B2' },
  GYD: { name: 'Guyanese Dollar', country: 'Guyana', symbol: 'G$' },
  SRD: { name: 'Surinamese Dollar', country: 'Suriname', symbol: '$' },
  FJD: { name: 'Fiji Dollar', country: 'Fiji', symbol: 'FJ$' },
  WST: { name: 'Samoan T\u0101l\u0101', country: 'Samoa', symbol: 'T' },
  TOP: { name: 'Tongan Pa\u02BBanga', country: 'Tonga', symbol: 'T$' },
  VUV: { name: 'Vanuatu Vatu', country: 'Vanuatu', symbol: 'VT' },
  SBD: { name: 'Solomon Islands Dollar', country: 'Solomon Islands', symbol: 'SI$' },
  PGK: { name: 'Papua New Guinean Kina', country: 'Papua New Guinea', symbol: 'K' },
  NZD: { name: 'New Zealand Dollar', country: 'New Zealand', symbol: 'NZ$' },
  XPF: { name: 'CFP Franc', country: 'French Polynesia', symbol: '\u20A3' },
  XCD: { name: 'East Caribbean Dollar', country: 'Eastern Caribbean', symbol: 'EC$' },
  BBD: { name: 'Barbadian Dollar', country: 'Barbados', symbol: 'Bds$' },
  TTD: { name: 'Trinidad and Tobago Dollar', country: 'Trinidad and Tobago', symbol: 'TT$' },
  JMD: { name: 'Jamaican Dollar', country: 'Jamaica', symbol: 'J$' },
  HTG: { name: 'Haitian Gourde', country: 'Haiti', symbol: 'G' },
  DOP: { name: 'Dominican Peso', country: 'Dominican Republic', symbol: 'RD$' },
  CUP: { name: 'Cuban Peso', country: 'Cuba', symbol: '$' },
  BZD: { name: 'Belize Dollar', country: 'Belize', symbol: 'BZ$' },
  GTQ: { name: 'Guatemalan Quetzal', country: 'Guatemala', symbol: 'Q' },
  HNL: { name: 'Honduran Lempira', country: 'Honduras', symbol: 'L' },
  NIO: { name: 'Nicaraguan C\u00F3rdoba', country: 'Nicaragua', symbol: 'C$' },
  CRC: { name: 'Costa Rican Col\u00F3n', country: 'Costa Rica', symbol: '\u20A1' },
  PAB: { name: 'Panamanian Balboa', country: 'Panama', symbol: 'B/.' },
  ISK: { name: 'Icelandic Kr\u00F3na', country: 'Iceland', symbol: 'kr' },
  FOK: { name: 'Faroese Kr\u00F3na', country: 'Faroe Islands', symbol: 'kr' },
  GGP: { name: 'Guernsey Pound', country: 'Guernsey', symbol: '\u00A3' },
  JEP: { name: 'Jersey Pound', country: 'Jersey', symbol: '\u00A3' },
  IMP: { name: 'Manx Pound', country: 'Isle of Man', symbol: '\u00A3' },
  FKP: { name: 'Falkland Islands Pound', country: 'Falkland Islands', symbol: '\u00A3' },
  SHP: { name: 'Saint Helena Pound', country: 'Saint Helena', symbol: '\u00A3' },
  GIP: { name: 'Gibraltar Pound', country: 'Gibraltar', symbol: '\u00A3' },
  TVD: { name: 'Tuvaluan Dollar', country: 'Tuvalu', symbol: '$' },
  KID: { name: 'Kiribati Dollar', country: 'Kiribati', symbol: '$' },
  CVE: { name: 'Cape Verdean Escudo', country: 'Cape Verde', symbol: '$' },
  STN: { name: 'S\u00E3o Tom\u00E9 and Pr\u00EDncipe Dobra', country: 'S\u00E3o Tom\u00E9 and Pr\u00EDncipe', symbol: 'Db' },
  GMD: { name: 'Gambian Dalasi', country: 'Gambia', symbol: 'D' },
  GNF: { name: 'Guinean Franc', country: 'Guinea', symbol: 'FG' },
  SLL: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
  LRD: { name: 'Liberian Dollar', country: 'Liberia', symbol: 'L$' },
  LSL: { name: 'Lesotho Loti', country: 'Lesotho', symbol: 'L' },
  SZL: { name: 'Swazi Lilangeni', country: 'Eswatini', symbol: 'L' },
  LYD: { name: 'Libyan Dinar', country: 'Libya', symbol: '\u0644.\u062F' },
  MRU: { name: 'Mauritanian Ouguiya', country: 'Mauritania', symbol: 'UM' },
  MVR: { name: 'Maldivian Rufiyaa', country: 'Maldives', symbol: 'Rf' },
  BIF: { name: 'Burundian Franc', country: 'Burundi', symbol: 'FBu' },
  CDF: { name: 'Congolese Franc', country: 'Democratic Republic of the Congo', symbol: 'FC' },
  XAF: { name: 'Central African CFA Franc', country: 'Central African Economic and Monetary Community', symbol: 'FCFA' },
  XOF: { name: 'West African CFA Franc', country: 'West African Economic and Monetary Union', symbol: 'CFA' },
  XDR: { name: 'Special Drawing Rights', country: 'International Monetary Fund', symbol: 'SDR' },
  SCR: { name: 'Seychellois Rupee', country: 'Seychelles', symbol: '\u20A8' },
  ERN: { name: 'Eritrean Nakfa', country: 'Eritrea', symbol: 'Nfk' },
  SLE: { name: 'Sierra Leonean Leone', country: 'Sierra Leone', symbol: 'Le' },
};

const CURRENCY_CODES = Object.keys(CURRENCY_INFO).sort();
const DEFAULT_FROM = 'USD';
const DEFAULT_TO = 'EUR';

const POPULAR_PAIRS = [
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'USD', to: 'JPY' },
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'USD' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'CAD' },
  { from: 'USD', to: 'AUD' },
  { from: 'USD', to: 'CHF' },
  { from: 'USD', to: 'CNY' },
];

interface ConversionRecord {
  from: string; to: string; amount: number; result: number; rate: number; timestamp: Date;
}

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>(DEFAULT_FROM);
  const [toCurrency, setToCurrency] = useState<string>(DEFAULT_TO);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const fetchRates = useCallback(async (base: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/currency?base=${base}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch rates');
      }
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(data.updated);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency, fetchRates]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const rate = useMemo(() => {
    if (fromCurrency === toCurrency) return 1;
    if (!rates[fromCurrency] || !rates[toCurrency]) return null;
    return rates[toCurrency];
  }, [rates, fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (rate === null) return null;
    return amount * rate;
  }, [amount, rate]);

  const formatAmount = (val: number, code: string) => {
    const info = CURRENCY_INFO[code];
    const symbol = info?.symbol || code;
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatRateVal = (val: number) => {
    if (val >= 1) return val.toFixed(4);
    if (val >= 0.01) return val.toFixed(6);
    return val.toFixed(8);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handlePopularPair = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
  };

  useEffect(() => {
    if (rate !== null && convertedAmount !== null && !loading) {
      setHistory(prev => {
        const next = [{ from: fromCurrency, to: toCurrency, amount, result: convertedAmount, rate, timestamp: new Date() }, ...prev];
        return next.slice(0, 10);
      });
    }
  }, [convertedAmount, fromCurrency, toCurrency, rate, amount, loading]);

  const filteredFrom = CURRENCY_CODES.filter(c =>
    c.includes(fromSearch.toUpperCase()) ||
    CURRENCY_INFO[c]?.name.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredTo = CURRENCY_CODES.filter(c =>
    c.includes(toSearch.toUpperCase()) ||
    CURRENCY_INFO[c]?.name.toLowerCase().includes(toSearch.toLowerCase())
  );

  const handleReset = () => {
    setAmount(1);
    setFromCurrency(DEFAULT_FROM);
    setToCurrency(DEFAULT_TO);
    setHistory([]);
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">1</span>
            Currency Conversion
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Amount</label>
            </div>
            <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#1a1a1a] border border-slate-700 px-5 py-4 rounded-2xl font-mono text-3xl text-right text-white font-black focus:outline-none focus:border-slate-500 placeholder-slate-500 shadow-sm" />
            <div className="flex space-x-2">
              {quickAmounts.map((amt) => (
                <button key={amt} type="button" onClick={() => setAmount(amt)}
                  className={`px-3 py-1 text-xs font-mono font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${amount === amt ? 'border-slate-900 bg-slate-900 text-white' : 'text-slate-500'}`}>
                  {(CURRENCY_INFO[fromCurrency]?.symbol || '$') + amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">From</label>
            <div ref={fromRef} className="relative">
              <button type="button" onClick={() => { setFromOpen(!fromOpen); setFromSearch(''); }}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-xl font-black text-sm hover:border-slate-300 transition-all">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{CURRENCY_INFO[fromCurrency]?.symbol || ''}</span>
                  <span className="text-sm">{fromCurrency}</span>
                  <span className="text-slate-400 font-medium text-sm">{CURRENCY_INFO[fromCurrency]?.name || ''}</span>
                </div>
                <i className={`fas fa-chevron-${fromOpen ? 'up' : 'down'} text-slate-400 text-xs`}></i>
              </button>
              {fromOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input type="text" value={fromSearch} onChange={(e) => setFromSearch(e.target.value)}
                      placeholder="Search currency..."
                      className="w-full bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400" />
                  </div>
                  <div className="overflow-y-auto max-h-56">
                    {filteredFrom.map(code => (
                      <button key={code} type="button" onClick={() => { setFromCurrency(code); setFromOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-50 transition-all ${code === fromCurrency ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-600'}`}>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm w-6">{CURRENCY_INFO[code]?.symbol || ''}</span>
                          <span className="font-bold">{code}</span>
                          <span className="text-slate-400">{CURRENCY_INFO[code]?.name || ''}</span>
                        </div>
                        {code === fromCurrency && <i className="fas fa-check text-slate-900 text-[10px]"></i>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button type="button" onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center shadow-sm">
              <i className="fas fa-exchange-alt text-slate-500 text-base"></i>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">To</label>
            <div ref={toRef} className="relative">
              <button type="button" onClick={() => { setToOpen(!toOpen); setToSearch(''); }}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200/80 px-5 py-3 rounded-xl font-black text-sm hover:border-slate-300 transition-all">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{CURRENCY_INFO[toCurrency]?.symbol || ''}</span>
                  <span className="text-sm">{toCurrency}</span>
                  <span className="text-slate-400 font-medium text-sm">{CURRENCY_INFO[toCurrency]?.name || ''}</span>
                </div>
                <i className={`fas fa-chevron-${toOpen ? 'up' : 'down'} text-slate-400 text-xs`}></i>
              </button>
              {toOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <input type="text" value={toSearch} onChange={(e) => setToSearch(e.target.value)}
                      placeholder="Search currency..."
                      className="w-full bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400" />
                  </div>
                  <div className="overflow-y-auto max-h-56">
                    {filteredTo.map(code => (
                      <button key={code} type="button" onClick={() => { setToCurrency(code); setToOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-50 transition-all ${code === toCurrency ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-600'}`}>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm w-6">{CURRENCY_INFO[code]?.symbol || ''}</span>
                          <span className="font-bold">{code}</span>
                          <span className="text-slate-400">{CURRENCY_INFO[code]?.name || ''}</span>
                        </div>
                        {code === toCurrency && <i className="fas fa-check text-slate-900 text-[10px]"></i>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Popular Pairs</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {POPULAR_PAIRS.map((pair, idx) => (
                <button key={idx} type="button" onClick={() => handlePopularPair(pair.from, pair.to)}
                  className={`px-3 py-2 text-xs font-mono font-black border rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all ${fromCurrency === pair.from && toCurrency === pair.to ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500'}`}>
                  {pair.from}\u2192{pair.to}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-bold">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Fetching latest rates...</span>
            </div>
          )}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold px-4 py-3 rounded-xl">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={handleReset}
              className="px-8 py-3 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-600 font-extrabold hover:bg-slate-200 transition-all duration-300 active:scale-95">Reset</button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-sm font-black flex items-center justify-center mr-2">2</span>
            Conversion Result
          </h3>

          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-white flex justify-center items-center">
              <span className="text-[120px] font-black italic">FX</span>
            </div>
            <div className="space-y-4 relative z-10 text-left">
              <div className="text-center pb-3 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Converted Amount</span>
                <div className="text-5xl font-black text-white font-mono">
                  {loading ? (
                    <span className="text-slate-500 text-lg">Loading...</span>
                  ) : rate === null ? (
                    <span className="text-slate-500 text-lg">N/A</span>
                  ) : (
                    formatAmount(convertedAmount!, toCurrency)
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2 text-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exchange Rate</span>
                  <span className="font-mono font-black text-base text-emerald-400">
                    {rate !== null ? formatRateVal(rate) : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reverse Rate</span>
                  <span className="font-mono font-black text-base text-slate-100">
                    {rate !== null ? formatRateVal(1 / rate) : '-'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 font-mono text-center border-t border-slate-800/60 pt-3">
                {lastUpdated ? `Rates updated: ${lastUpdated}` : ''}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-3">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Rate Details</span>
            <div className="text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">1 {fromCurrency} =</span>
                <span className="font-black font-mono text-slate-900">{rate !== null ? formatRateVal(rate) : '-'} {toCurrency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">1 {toCurrency} =</span>
                <span className="font-black font-mono text-slate-900">{rate !== null ? formatRateVal(1 / rate) : '-'} {fromCurrency}</span>
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Recent Conversions</span>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {history.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                    <span className="font-bold text-slate-700">
                      {(CURRENCY_INFO[h.from]?.symbol || '') + h.amount.toLocaleString()} {h.from}
                    </span>
                    <i className="fas fa-arrow-right text-slate-300 text-[10px] mx-2"></i>
                    <span className="font-black text-slate-900">
                      {(CURRENCY_INFO[h.to]?.symbol || '') + h.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {h.to}
                    </span>
                    <span className="text-slate-400 text-[10px]">{h.rate.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
