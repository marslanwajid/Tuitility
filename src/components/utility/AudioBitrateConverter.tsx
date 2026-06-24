'use client';

import React, { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function convertBitrate(value: number, from: string, to: string): string {
  let bps = value;
  if (from === 'kbps') bps = value * 1000;
  else if (from === 'mbps') bps = value * 1000000;
  let result = bps;
  if (to === 'kbps') result = bps / 1000;
  else if (to === 'mbps') result = bps / 1000000;
  return result >= 1000 ? result.toFixed(1) : result.toFixed(2);
}

const PRESETS = [96, 128, 160, 192, 256, 320, 1411];

export default function AudioBitrateConverter() {
  const [val, setVal] = useState('');
  const [from, setFrom] = useState('kbps');
  const [to, setTo] = useState('kbps');
  const [result, setResult] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const handleConvert = useCallback(() => {
    const v = parseFloat(val);
    if (isNaN(v)) return;
    setResult(convertBitrate(v, from, to) + ' ' + to);
  }, [val, from, to]);

  const handlePreset = useCallback((v: number) => {
    setVal(String(v));
    setFrom('kbps');
  }, []);

  const handleClear = useCallback(() => {
    setVal('');
    setResult('');
    setFrom('kbps');
    setTo('kbps');
  }, []);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => addToast('Copied!', 'success'));
  }, [result, addToast]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">BITRATE</span>
        </div>
        <i className="fas fa-music text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All calculation happens locally in your browser. No data is ever uploaded.
          </p>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">BITRATE</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          <div className="space-y-4">
            <label className="text-[11px] text-slate-400 font-semibold">Input Bitrate</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="Enter value"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-white/20"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="bps">bps</option>
                <option value="kbps">kbps</option>
                <option value="mbps">mbps</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  val === String(p) && from === 'kbps' ? 'bg-white text-[#1a1a1a]' : 'bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20'
                }`}
              >
                {p} kbps{p === 1411 ? ' (CD)' : ''}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold">Output Unit</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="bps">bps (Bits per second)</option>
              <option value="kbps">kbps (Kilobits per second)</option>
              <option value="mbps">mbps (Megabits per second)</option>
            </select>
          </div>

          {result && (
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Result</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white font-mono">{result}</span>
                <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-bold hover:bg-white/20 transition-colors">
                  <i className="fas fa-copy mr-1"></i>Copy
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleClear} className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors">
              <i className="fas fa-eraser mr-1"></i>Clear
            </button>
            <button onClick={handleConvert} disabled={!val} className="px-6 py-2.5 rounded-xl bg-white text-[#1a1a1a] text-xs font-black hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg">
              <i className="fas fa-sync-alt mr-1"></i>Calculate
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-[10px] text-slate-400 font-semibold uppercase mb-2">Reference: Common Bitrates</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div><span className="text-white font-bold">96 kbps</span> — Internet radio</div>
              <div><span className="text-white font-bold">128 kbps</span> — Standard MP3</div>
              <div><span className="text-white font-bold">192 kbps</span> — Good quality</div>
              <div><span className="text-white font-bold">256 kbps</span> — AAC (Apple Music)</div>
              <div><span className="text-white font-bold">320 kbps</span> — High quality MP3</div>
              <div><span className="text-white font-bold">1411 kbps</span> — CD (uncompressed)</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need to convert audio formats? Try the <a href="/utility-tools/audio-format-converter" className="text-white font-bold underline hover:text-slate-200">Audio Format Converter</a> or extract audio from videos with the <a href="/utility-tools/video-to-audio-extractor" className="text-white font-bold underline hover:text-slate-200">Video to Audio Extractor</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
