'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';

const INPUT_TYPES = ['URL', 'Text', 'Email', 'Phone', 'SMS', 'WiFi', 'vCard'] as const;
type InputMode = typeof INPUT_TYPES[number];

const DOT_TYPES = ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as const;
const CORNER_TYPES = ['square', 'extra-rounded', 'circle', 'dot'] as const;

interface Preset {
  name: string; icon: string; dotType: string; cornerType: string; cornerDotType: string;
  fgColor: string; bgColor: string; cornerColor: string; useGradient: boolean;
  gradientType: 'linear' | 'radial'; gradientColor1: string; gradientColor2: string;
  transparent: boolean;
}

const PRESETS: Preset[] = [
  { name: 'Classic', icon: 'fa-circle', dotType: 'square', cornerType: 'square', cornerDotType: 'square', fgColor: '#000000', bgColor: '#ffffff', cornerColor: '#000000', useGradient: false, gradientType: 'linear', gradientColor1: '#000000', gradientColor2: '#000000', transparent: false },
  { name: 'Midnight', icon: 'fa-moon', dotType: 'rounded', cornerType: 'extra-rounded', cornerDotType: 'square', fgColor: '#1e3a5f', bgColor: '#ffffff', cornerColor: '#1e3a5f', useGradient: false, gradientType: 'linear', gradientColor1: '#1e3a5f', gradientColor2: '#1e3a5f', transparent: true },
  { name: 'Emerald', icon: 'fa-leaf', dotType: 'dots', cornerType: 'rounded', cornerDotType: 'dot', fgColor: '#059669', bgColor: '#ffffff', cornerColor: '#059669', useGradient: false, gradientType: 'linear', gradientColor1: '#059669', gradientColor2: '#059669', transparent: true },
  { name: 'Royal', icon: 'fa-crown', dotType: 'extra-rounded', cornerType: 'circle', cornerDotType: 'circle', fgColor: '#000000', bgColor: '#ffffff', cornerColor: '#000000', useGradient: true, gradientType: 'linear', gradientColor1: '#6366f1', gradientColor2: '#8b5cf6', transparent: true },
  { name: 'Sunset', icon: 'fa-sun', dotType: 'classy', cornerType: 'extra-rounded', cornerDotType: 'square', fgColor: '#000000', bgColor: '#ffffff', cornerColor: '#000000', useGradient: true, gradientType: 'linear', gradientColor1: '#f59e0b', gradientColor2: '#ef4444', transparent: true },
  { name: 'Ocean', icon: 'fa-water', dotType: 'classy-rounded', cornerType: 'rounded', cornerDotType: 'dot', fgColor: '#000000', bgColor: '#ffffff', cornerColor: '#000000', useGradient: true, gradientType: 'linear', gradientColor1: '#0ea5e9', gradientColor2: '#06b6d4', transparent: false },
  { name: 'Rose', icon: 'fa-rose', dotType: 'rounded', cornerType: 'rounded', cornerDotType: 'rounded', fgColor: '#000000', bgColor: '#ffffff', cornerColor: '#000000', useGradient: true, gradientType: 'linear', gradientColor1: '#e11d48', gradientColor2: '#f43f5e', transparent: true },
  { name: 'Dark', icon: 'fa-moon', dotType: 'square', cornerType: 'square', cornerDotType: 'square', fgColor: '#ffffff', bgColor: '#0a0a0a', cornerColor: '#ffffff', useGradient: false, gradientType: 'linear', gradientColor1: '#ffffff', gradientColor2: '#ffffff', transparent: false },
  { name: 'Neon', icon: 'fa-bolt', dotType: 'dots', cornerType: 'extra-rounded', cornerDotType: 'circle', fgColor: '#000000', bgColor: '#000000', cornerColor: '#000000', useGradient: true, gradientType: 'linear', gradientColor1: '#a855f7', gradientColor2: '#ec4899', transparent: false },
  { name: 'Corporate', icon: 'fa-briefcase', dotType: 'square', cornerType: 'square', cornerDotType: 'square', fgColor: '#2563eb', bgColor: '#ffffff', cornerColor: '#2563eb', useGradient: false, gradientType: 'linear', gradientColor1: '#2563eb', gradientColor2: '#2563eb', transparent: false },
];

interface BadgeStyle { name: string; icon: string; cls: string; }
const BADGE_STYLES: BadgeStyle[] = [
  { name: 'Pill Dark', icon: 'fa-circle', cls: 'bg-slate-900 text-white rounded-full px-5 py-2 text-xs font-extrabold shadow-sm' },
  { name: 'Pill Brand', icon: 'fa-palette', cls: 'bg-indigo-600 text-white rounded-full px-5 py-2 text-xs font-extrabold shadow-sm' },
  { name: 'Pill Outline', icon: 'fa-border-all', cls: 'border-2 border-slate-900 text-slate-900 rounded-full px-5 py-2 text-xs font-extrabold bg-white' },
  { name: 'Tag Minimal', icon: 'fa-tag', cls: 'text-slate-500 text-xs font-bold' },
  { name: 'Tag Underline', icon: 'fa-underline', cls: 'text-slate-900 text-xs font-extrabold border-b-2 border-slate-900 pb-0.5' },
  { name: 'Badge Icon', icon: 'fa-qrcode', cls: 'bg-slate-100 text-slate-700 rounded-xl px-4 py-1.5 text-xs font-extrabold shadow-sm flex items-center space-x-1.5' },
];

const TAGLINE_PRESETS = ['Scan me!', 'Follow us', 'Visit website', 'Contact us', 'Learn more', 'Get started'];

interface InputFields {
  url: string; text: string; email: string; subject: string; body: string;
  phone: string; smsNumber: string; smsBody: string; ssid: string;
  wifiPassword: string; encryption: 'WPA' | 'WEP' | 'nopass';
  vCardName: string; vCardTel: string; vCardEmail: string; vCardOrg: string;
  vCardTitle: string; vCardAdr: string; vCardUrl: string; vCardNote: string;
}

function buildData(mode: InputMode, fields: InputFields): string {
  switch (mode) {
    case 'URL': return fields.url || 'https://';
    case 'Text': return fields.text || 'Hello, world!';
    case 'Email': return `mailto:${fields.email}?subject=${encodeURIComponent(fields.subject)}&body=${encodeURIComponent(fields.body)}`;
    case 'Phone': return `tel:${fields.phone}`;
    case 'SMS': return `SMSTO:${fields.smsNumber}:${fields.smsBody}`;
    case 'WiFi': return `WIFI:T:${fields.encryption};S:${fields.ssid};P:${fields.wifiPassword};;`;
    case 'vCard': {
      const lines = [
        'BEGIN:VCARD', 'VERSION:3.0',
        fields.vCardName ? `FN:${fields.vCardName}` : '',
        fields.vCardTel ? `TEL:${fields.vCardTel}` : '',
        fields.vCardEmail ? `EMAIL:${fields.vCardEmail}` : '',
        fields.vCardOrg ? `ORG:${fields.vCardOrg}` : '',
        fields.vCardTitle ? `TITLE:${fields.vCardTitle}` : '',
        fields.vCardAdr ? `ADR:;;${fields.vCardAdr}` : '',
        fields.vCardUrl ? `URL:${fields.vCardUrl}` : '',
        fields.vCardNote ? `NOTE:${fields.vCardNote}` : '',
        'END:VCARD',
      ].filter(Boolean);
      return lines.join('\n');
    }
    default: return '';
  }
}

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400';
const labelCls = 'text-[10px] font-extrabold uppercase tracking-wider text-slate-500';

export default function QRCodeGenerator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [mode, setMode] = useState<InputMode>('URL');
  const [size, setSize] = useState(280);
  const [margin, setMargin] = useState(0);
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('Q');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotType, setDotType] = useState<string>('square');
  const [cornerType, setCornerType] = useState<string>('square');
  const [cornerDotType, setCornerDotType] = useState<string>('square');
  const [cornerColor, setCornerColor] = useState('#000000');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientColor1, setGradientColor1] = useState('#6366f1');
  const [gradientColor2, setGradientColor2] = useState('#ec4899');
  const [transparentBg, setTransparentBg] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [logoSz, setLogoSz] = useState(0.25);
  const [filename, setFilename] = useState('qr-code');
  const [tagline, setTagline] = useState('');
  const [badgeStyle, setBadgeStyle] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState<InputFields>({
    url: 'https://', text: '', email: '', subject: '', body: '',
    phone: '', smsNumber: '', smsBody: '', ssid: '', wifiPassword: '',
    encryption: 'WPA', vCardName: '', vCardTel: '', vCardEmail: '',
    vCardOrg: '', vCardTitle: '', vCardAdr: '', vCardUrl: '', vCardNote: '',
  });

  const data = buildData(mode, fields);

  const applyPreset = useCallback((p: Preset) => {
    setDotType(p.dotType);
    setCornerType(p.cornerType);
    setCornerDotType(p.cornerDotType);
    setFgColor(p.fgColor);
    setBgColor(p.bgColor);
    setCornerColor(p.cornerColor);
    setUseGradient(p.useGradient);
    setGradientType(p.gradientType);
    setGradientColor1(p.gradientColor1);
    setGradientColor2(p.gradientColor2);
    setTransparentBg(p.transparent);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.innerHTML = '';
    const qr = new QRCodeStyling({
      margin,
      qrOptions: { errorCorrectionLevel: ecl },
      imageOptions: { hideBackgroundDots: true, imageSize: logoSz, margin: 5 },
      image: logoDataUrl || undefined,
      dotsOptions: useGradient
        ? { type: dotType as any, gradient: { type: gradientType, rotation: 0, colorStops: [{ offset: 0, color: gradientColor1 }, { offset: 1, color: gradientColor2 }] } }
        : { type: dotType as any, color: fgColor },
      cornersSquareOptions: { type: cornerType as any, color: cornerColor },
      cornersDotOptions: { type: cornerDotType as any, color: cornerColor },
      backgroundOptions: transparentBg ? undefined : { color: bgColor },
    });
    qrRef.current = qr;
    qr.append(el);
  }, [size, data, margin, ecl, fgColor, bgColor, dotType, cornerType, cornerDotType, cornerColor, useGradient, gradientType, gradientColor1, gradientColor2, transparentBg, logoDataUrl, logoSz]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(data); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  }, [data]);

  const handleDownload = useCallback(async (ext: 'png' | 'svg') => {
    await qrRef.current?.download({ name: filename, extension: ext as any });
  }, [filename]);

  const set = (key: keyof InputFields, val: string) => setFields((prev) => ({ ...prev, [key]: val }));

  const activePreset = PRESETS.find((p) =>
    p.dotType === dotType && p.cornerType === cornerType && p.cornerDotType === cornerDotType &&
    p.fgColor === (useGradient ? gradientColor1 : fgColor) &&
    p.bgColor === bgColor && p.cornerColor === cornerColor &&
    p.useGradient === useGradient && p.transparent === transparentBg
  );

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All QR codes are generated 100% locally inside your browser. No data, images, or logs are ever uploaded to any server.
          </p>
        </div>
      </div>

      {/* Input Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {INPUT_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setMode(t)}
            className={`px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${mode === t ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t === 'URL' && <i className="fas fa-link mr-1.5 text-[9px]"></i>}
            {t === 'Text' && <i className="fas fa-font mr-1.5 text-[9px]"></i>}
            {t === 'Email' && <i className="fas fa-envelope mr-1.5 text-[9px]"></i>}
            {t === 'Phone' && <i className="fas fa-phone mr-1.5 text-[9px]"></i>}
            {t === 'SMS' && <i className="fas fa-comment-dots mr-1.5 text-[9px]"></i>}
            {t === 'WiFi' && <i className="fas fa-wifi mr-1.5 text-[9px]"></i>}
            {t === 'vCard' && <i className="fas fa-address-card mr-1.5 text-[9px]"></i>}
            {t}
          </button>
        ))}
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {mode === 'URL' && <input value={fields.url} onChange={(e) => set('url', e.target.value)} placeholder="https://example.com" className={inputCls} />}
        {mode === 'Text' && <textarea value={fields.text} onChange={(e) => set('text', e.target.value)} placeholder="Enter text to encode..." rows={3} className={`${inputCls} resize-y min-h-[60px]`} />}
        {mode === 'Email' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={fields.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" className={`${inputCls} md:col-span-3`} />
            <input value={fields.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Subject (optional)" className={inputCls} />
            <textarea value={fields.body} onChange={(e) => set('body', e.target.value)} placeholder="Body (optional)" rows={2} className={`${inputCls} md:col-span-2 resize-y min-h-[40px]`} />
          </div>
        )}
        {mode === 'Phone' && <input value={fields.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1234567890" className={inputCls} />}
        {mode === 'SMS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={fields.smsNumber} onChange={(e) => set('smsNumber', e.target.value)} placeholder="Phone number" className={inputCls} />
            <textarea value={fields.smsBody} onChange={(e) => set('smsBody', e.target.value)} placeholder="Message (optional)" rows={2} className={`${inputCls} resize-y min-h-[40px]`} />
          </div>
        )}
        {mode === 'WiFi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={fields.ssid} onChange={(e) => set('ssid', e.target.value)} placeholder="Network name (SSID)" className={inputCls} />
            <input value={fields.wifiPassword} onChange={(e) => set('wifiPassword', e.target.value)} placeholder="Password" type="text" className={inputCls} />
            <select value={fields.encryption} onChange={(e) => set('encryption', e.target.value as any)} className={inputCls}>
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        )}
        {mode === 'vCard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={fields.vCardName} onChange={(e) => set('vCardName', e.target.value)} placeholder="Full Name" className={inputCls} />
            <input value={fields.vCardTel} onChange={(e) => set('vCardTel', e.target.value)} placeholder="Phone" className={inputCls} />
            <input value={fields.vCardEmail} onChange={(e) => set('vCardEmail', e.target.value)} placeholder="Email" className={inputCls} />
            <input value={fields.vCardOrg} onChange={(e) => set('vCardOrg', e.target.value)} placeholder="Organization" className={inputCls} />
            <input value={fields.vCardTitle} onChange={(e) => set('vCardTitle', e.target.value)} placeholder="Job Title" className={inputCls} />
            <input value={fields.vCardAdr} onChange={(e) => set('vCardAdr', e.target.value)} placeholder="Address (Street, City, Zip)" className={inputCls} />
            <input value={fields.vCardUrl} onChange={(e) => set('vCardUrl', e.target.value)} placeholder="Website" className={inputCls} />
            <textarea value={fields.vCardNote} onChange={(e) => set('vCardNote', e.target.value)} placeholder="Notes" rows={2} className={`${inputCls} resize-y min-h-[40px]`} />
          </div>
        )}
      </div>

      {/* Preset Styles */}
      <div className="space-y-3">
        <span className={labelCls}>Quick Styles</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" onClick={() => applyPreset(p)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer border ${
                activePreset?.name === p.name
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
              }`}>
              <i className={`fas ${p.icon} text-[9px]`}></i>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QR Preview + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className={labelCls}>Size</span>
              <input type="range" min="128" max="600" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <span className="text-[10px] text-slate-500 font-bold">{size}px</span>
            </div>
            <div className="space-y-1">
              <span className={labelCls}>Margin</span>
              <input type="range" min="0" max="4" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              <span className="text-[10px] text-slate-500 font-bold">{margin}</span>
            </div>
            <div className="space-y-1">
              <span className={labelCls}>Error Correction</span>
              <select value={ecl} onChange={(e) => setEcl(e.target.value as any)} className={inputCls}>
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className={labelCls}>Dot Style</span>
              <select value={dotType} onChange={(e) => setDotType(e.target.value)} className={inputCls}>
                {DOT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className={labelCls}>Foreground</span>
              <div className="flex items-center space-x-2">
                <input type="color" value={useGradient ? gradientColor1 : fgColor} onChange={(e) => useGradient ? setGradientColor1(e.target.value) : setFgColor(e.target.value)} disabled={useGradient} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                <input value={useGradient ? gradientColor1 : fgColor} onChange={(e) => useGradient ? setGradientColor1(e.target.value) : setFgColor(e.target.value)} disabled={useGradient} className={`${inputCls} flex-1 font-mono text-[10px]`} />
              </div>
            </div>
            <div className="space-y-1">
              <span className={labelCls}>Background</span>
              <div className="flex items-center space-x-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={transparentBg} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={transparentBg} className={`${inputCls} flex-1 font-mono text-[10px]`} />
              </div>
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <button type="button" role="checkbox" aria-checked={transparentBg} onClick={() => setTransparentBg(!transparentBg)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${transparentBg ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-500'}`}>
                  {transparentBg && <i className="fas fa-check text-[8px] text-white"></i>}
                </button>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Transparent BG</span>
              </label>
            </div>
            <div className="space-y-1">
              <span className={labelCls}>Corner Style</span>
              <select value={cornerType} onChange={(e) => setCornerType(e.target.value)} className={inputCls}>
                {CORNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <span className={labelCls}>Corner Dot</span>
              <select value={cornerDotType} onChange={(e) => setCornerDotType(e.target.value)} className={inputCls}>
                {CORNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <button type="button" role="checkbox" aria-checked={useGradient} onClick={() => setUseGradient(!useGradient)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${useGradient ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-500'}`}>
                  {useGradient && <i className="fas fa-check text-[8px] text-white"></i>}
                </button>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Gradient</span>
              </label>
            </div>
            {useGradient && (
              <>
                <div className="space-y-1">
                  <span className={labelCls}>Gradient Type</span>
                  <select value={gradientType} onChange={(e) => setGradientType(e.target.value as any)} className={inputCls}>
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className={labelCls}>Color 1</span>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                    <input value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className={`${inputCls} flex-1 font-mono text-[10px]`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className={labelCls}>Color 2</span>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                    <input value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className={`${inputCls} flex-1 font-mono text-[10px]`} />
                  </div>
                </div>
              </>
            )}
            {!useGradient && (
              <div className="space-y-1">
                <span className={labelCls}>Corner Color</span>
                <div className="flex items-center space-x-2">
                  <input type="color" value={cornerColor} onChange={(e) => setCornerColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                  <input value={cornerColor} onChange={(e) => setCornerColor(e.target.value)} className={`${inputCls} flex-1 font-mono text-[10px]`} />
                </div>
              </div>
            )}
          </div>

          {/* Logo + Tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className={labelCls}>Logo (optional)</span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] border border-slate-200 hover:bg-slate-200 transition-all active:scale-95 flex items-center space-x-1.5">
                  <i className="fas fa-upload text-[9px]"></i><span>Upload Image</span>
                </span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                {logoDataUrl && <button type="button" onClick={() => setLogoDataUrl('')} className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer">Remove</button>}
              </label>
              {logoDataUrl && (
                <div className="mt-2">
                  <span className={labelCls}>Logo Size</span>
                  <input type="range" min="0.1" max="0.5" step="0.05" value={logoSz} onChange={(e) => setLogoSz(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                  <span className="text-[10px] text-slate-500 font-bold">{Math.round(logoSz * 100)}%</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <span className={labelCls}>Tagline</span>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Scan me!" className={inputCls} />
              <div className="flex flex-wrap gap-1.5">
                {TAGLINE_PRESETS.map((t) => (
                  <button key={t} type="button" onClick={() => setTagline(t)}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${tagline === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <span className={labelCls}>Badge Style</span>
            <div className="flex flex-wrap gap-2">
              {BADGE_STYLES.map((bs, i) => (
                <button key={bs.name} type="button" onClick={() => setBadgeStyle(i)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer border ${
                    badgeStyle === i
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                  }`}>
                  <i className={`fas ${bs.icon} text-[9px]`}></i>
                  <span>{bs.name}</span>
                </button>
              ))}
            </div>
            <span className={labelCls}>Filename</span>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} className={inputCls} />
          </div>
        </div>

        {/* Preview with tagline */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`rounded-2xl p-5 inline-flex ${transparentBg ? 'bg-slate-50' : ''} border ${transparentBg ? 'border-slate-200' : 'border-transparent'}`}>
            <div className="flex flex-col items-center">
              <div ref={containerRef} className="[&_canvas]:!block [&_canvas]:!max-w-full [&_canvas]:!h-auto" />
              {tagline && (
                <span className={`mt-2.5 text-center max-w-[260px] leading-tight inline-flex items-center justify-center gap-1.5 ${BADGE_STYLES[badgeStyle].cls}`}>
                  {badgeStyle === 5 && <i className="fas fa-qrcode text-[9px]"></i>}
                  {tagline}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDownload('png')} className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 hover:bg-slate-800">
              <i className="fas fa-download text-[9px]"></i><span>PNG</span>
            </button>
            <button type="button" onClick={() => handleDownload('svg')} className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 hover:bg-slate-800">
              <i className="fas fa-download text-[9px]"></i><span>SVG</span>
            </button>
            <button type="button" onClick={handleCopy} className="px-5 py-2.5 rounded-full bg-white text-slate-900 border border-slate-300 font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5 hover:bg-slate-50">
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-[9px]`}></i><span>{copied ? 'Copied!' : 'Copy Data'}</span>
            </button>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold text-center break-all max-w-[260px]">{data}</span>
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">QR CODE</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-lg font-black text-white block">{size}&times;{size}</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Size</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-lg font-black text-white block">{margin}</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Margin</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-lg font-black text-white block">{ecl}</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Error Correction</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center">
              <span className="text-lg font-black text-white block capitalize">{dotType}</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Dot Style</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="w-6 h-6 rounded border border-white/20 shrink-0" style={{ backgroundColor: useGradient ? gradientColor1 : fgColor }} />
              <div><span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Foreground</span><span className="text-[10px] font-mono text-white font-bold mt-0.5 block">{useGradient ? `${gradientType} gradient` : fgColor}</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="w-6 h-6 rounded border border-white/20 shrink-0" style={{ backgroundColor: transparentBg ? 'transparent' : bgColor }} />
              <div><span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Background</span><span className="text-[10px] font-mono text-white font-bold mt-0.5 block">{transparentBg ? 'Transparent' : bgColor}</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="w-6 h-6 rounded border border-white/20 shrink-0" style={{ backgroundColor: cornerColor }} />
              <div><span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Corner</span><span className="text-[10px] font-mono text-white font-bold mt-0.5 block">{cornerType} / {cornerDotType}</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Input</span>
              <span className="text-[10px] font-bold text-white mt-0.5 block truncate">{mode}</span>
            </div>
          </div>

          {logoDataUrl && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center space-x-3">
              <img src={logoDataUrl} alt="logo" className="w-8 h-8 object-contain rounded border border-white/10 shrink-0" />
              <div><span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Logo</span><span className="text-[10px] text-white font-bold mt-0.5 block">{Math.round(logoSz * 100)}% size</span></div>
            </div>
          )}

          {tagline && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
              <div><span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Tagline</span><span className="text-[11px] font-bold text-white mt-0.5 block">{tagline}</span></div>
              <span className="text-[9px] text-slate-500 font-bold">{BADGE_STYLES[badgeStyle].name}</span>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Encoded Data</span>
            <p className="text-[11px] font-mono text-slate-300 mt-1 break-all leading-relaxed">{data}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
