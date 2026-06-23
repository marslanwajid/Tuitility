'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';

type CaseMode =
  | 'uppercase' | 'lowercase' | 'title' | 'sentence'
  | 'camel' | 'pascal' | 'constant' | 'snake' | 'kebab' | 'dot'
  | 'spaced' | 'toggle' | 'spongebob' | 'trim' | 'reverse';

interface ModeDef {
  id: CaseMode;
  label: string;
  icon: string;
}

const MODES: ModeDef[] = [
  { id: 'uppercase', label: 'UPPERCASE', icon: 'fa-arrow-up' },
  { id: 'lowercase', label: 'lowercase', icon: 'fa-arrow-down' },
  { id: 'title', label: 'Title Case', icon: 'fa-font' },
  { id: 'sentence', label: 'Sentence case', icon: 'fa-paragraph' },
  { id: 'camel', label: 'camelCase', icon: 'fa-camel' },
  { id: 'pascal', label: 'PascalCase', icon: 'fa-p' },
  { id: 'constant', label: 'CONSTANT_CASE', icon: 'fa-underscore' },
  { id: 'snake', label: 'snake_case', icon: 'fa-snake' },
  { id: 'kebab', label: 'kebab-case', icon: 'fa-minus' },
  { id: 'dot', label: 'dot.case', icon: 'fa-circle' },
  { id: 'spaced', label: 's p a c e d', icon: 'fa-arrows-h' },
  { id: 'toggle', label: 'tOGGLE cASE', icon: 'fa-exchange-alt' },
  { id: 'spongebob', label: 'sPoNgEbOb', icon: 'fa-laugh' },
  { id: 'trim', label: 'Trim Spaces', icon: 'fa-compress-alt' },
  { id: 'reverse', label: 'Reverse', icon: 'fa-undo' },
];

function applyCase(text: string, mode: CaseMode): string {
  const words = text.split(/\s+/).filter(Boolean);
  switch (mode) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'title': return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'sentence': {
      const sentences = text.split(/([.!?]\s*)/);
      return sentences.map((s, i) => i % 2 === 0 ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s).join('');
    }
    case 'camel': {
      if (!words.length) return '';
      const rest = words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      return words[0].toLowerCase() + rest.join('');
    }
    case 'pascal': return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'constant': return words.map((w) => w.toUpperCase()).join('_');
    case 'snake': return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab': return words.map((w) => w.toLowerCase()).join('-');
    case 'dot': return words.map((w) => w.toLowerCase()).join('.');
    case 'spaced': return text.split('').filter((c) => c !== ' ').join(' ');
    case 'toggle': return text.split('').map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    case 'spongebob': {
      let out = '', upper = false;
      for (const c of text) {
        if (/[a-zA-Z]/.test(c)) { out += upper ? c.toUpperCase() : c.toLowerCase(); upper = !upper; }
        else out += c;
      }
      return out;
    }
    case 'trim': return text.replace(/\s+/g, ' ').trim();
    case 'reverse': return text.split('').reverse().join('');
    default: return text;
  }
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<CaseMode | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const result = useMemo(() => {
    if (!activeMode || !input) return '';
    return applyCase(input, activeMode);
  }, [input, activeMode]);

  const inputStats = useMemo(() => {
    const trimmed = input.trim();
    const w = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    return { chars: input.length, words: w, lines: input ? input.split('\n').length : 0 };
  }, [input]);

  const resultStats = useMemo(() => {
    const trimmed = result.trim();
    const w = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    return { chars: result.length, words: w, lines: result ? result.split('\n').length : 0 };
  }, [result]);

  const handleMode = useCallback((mode: CaseMode) => {
    setActiveMode(mode);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(result); } catch { }
  }, [result]);

  const handleClear = useCallback(() => {
    setInput('');
    setActiveMode(null);
    textareaRef.current?.focus();
  }, []);

  const maxBar = Math.max(inputStats.chars, resultStats.chars, 1);

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
            All text processing happens 100% locally inside your browser. No content is ever uploaded or stored.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <i className="fas fa-pencil-alt mr-2 text-slate-400"></i>Input Text
          </span>
          {input && (
            <span className="text-[10px] text-slate-400 font-semibold">
              {inputStats.chars} chars · {inputStats.words} words · {inputStats.lines} lines
            </span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here to convert..."
          className="w-full min-h-[200px] p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 font-medium resize-y focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
        />
      </div>

      {/* Mode Buttons */}
      <div className="space-y-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
          <i className="fas fa-magic mr-2 text-slate-400"></i>Choose Case
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleMode(mode.id)}
              className={`px-3 py-2.5 rounded-xl text-[11px] font-extrabold transition-all border ${
                activeMode === mode.id
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      {input && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopy}
            disabled={!result}
            className="px-7 py-3 rounded-full bg-[#1a1a1a] text-white font-extrabold text-xs hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            <i className="fas fa-copy mr-1.5"></i>Copy Result
          </button>
          <button
            onClick={handleClear}
            className="px-7 py-3 rounded-full bg-white text-slate-700 border border-slate-200 font-extrabold text-xs hover:bg-slate-50 transition-colors"
          >
            <i className="fas fa-trash mr-1.5"></i>Clear
          </button>
        </div>
      )}

      {/* Dark Panel */}
      {activeMode && result !== '' && (
        <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">CASE</span>
          </div>
          <div className="relative z-10 space-y-6">
            {/* Result header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-white/50"></i>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Converted Text</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold bg-white/5 px-3 py-1 rounded-full">
                {MODES.find((m) => m.id === activeMode)?.label}
              </span>
            </div>

            {/* Result */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-sm text-slate-200 font-medium leading-relaxed whitespace-pre-wrap break-words">
                {result || <span className="text-slate-500 italic">No output</span>}
              </p>
            </div>

            {/* SVG Widget — Original vs Result */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-white/50 uppercase tracking-wider flex items-center">
                <i className="fas fa-chart-bar mr-2 text-white/30"></i>Text Comparison
              </span>
              <div className="space-y-3">
                {[
                  { label: 'Characters', orig: inputStats.chars, res: resultStats.chars },
                  { label: 'Words', orig: inputStats.words, res: resultStats.words },
                  { label: 'Lines', orig: inputStats.lines, res: resultStats.lines },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{stat.label}</span>
                      <span>{stat.orig} → {stat.res}</span>
                    </div>
                    <div className="flex space-x-0.5 h-5">
                      <div
                        className="h-full rounded-l-full transition-all"
                        style={{
                          width: `${(stat.orig / maxBar) * 100}%`,
                          background: 'linear-gradient(90deg, #64748b, #475569)',
                        }}
                      ></div>
                      <div
                        className="h-full rounded-r-full transition-all"
                        style={{
                          width: `${(stat.res / maxBar) * 100}%`,
                          background: 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                        }}
                      ></div>
                    </div>
                    <div className="flex text-[8px] text-slate-500 font-semibold justify-between">
                      <span>Original</span>
                      <span>Result</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
