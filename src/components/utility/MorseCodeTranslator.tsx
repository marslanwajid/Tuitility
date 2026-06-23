'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

type Mode = 'text-to-morse' | 'morse-to-text';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const CHAR_LIMIT = 1000;
const FLASH_COLORS = ['White', 'Yellow', 'Red', 'Blue'] as const;
type FlashColor = (typeof FLASH_COLORS)[number];

const TEXT_TO_MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
  ':': '---...', ';': '-.-.-.', '"': '.-..-.', "'": '.----.',
  '-': '-....-', '/': '-..-.', '@': '.--.-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', '+': '.-.-.', '=': '-...-', '_': '..--.-', '$': '...-..-',
};

const MORSE_TO_TEXT: Record<string, string> = {};
for (const [char, morse] of Object.entries(TEXT_TO_MORSE)) {
  MORSE_TO_TEXT[morse] = char;
}

const REFERENCE_ENTRIES = Object.entries(TEXT_TO_MORSE).filter(
  ([ch]) => /[A-Z0-9]/.test(ch) || '.,?!:;"\'-/@&+=_$'.includes(ch)
);

const FLASH_CSS_COLORS: Record<FlashColor, string> = {
  White: '#ffffff',
  Yellow: '#ffff00',
  Red: '#ff0000',
  Blue: '#0000ff',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => {
      if (ch === ' ') return '/';
      return TEXT_TO_MORSE[ch] || '?';
    })
    .join(' ');
}

function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s*\/\s*/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((sym) => MORSE_TO_TEXT[sym] || '?')
        .join('')
    )
    .join(' ');
}

export default function MorseCodeTranslator() {
  const [mode, setMode] = useState<Mode>('text-to-morse');
  const [input, setInput] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [wpm, setWpm] = useState(15);
  const [flashColor, setFlashColor] = useState<FlashColor>('White');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const stopPlayback = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    setIsPlaying(false);
    setIsFlashing(false);
    setFlashActive(false);
  }, []);

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const output = useMemo(() => {
    if (!input) return '';
    if (mode === 'text-to-morse') return textToMorse(input);
    return morseToText(input);
  }, [input, mode]);

  const handleInput = useCallback((val: string) => {
    if (val.length > CHAR_LIMIT) return;
    setInput(val);
  }, []);

  const clearAll = useCallback(() => {
    stopPlayback();
    setInput('');
  }, [stopPlayback]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy.', 'error');
    }
  }, [output, addToast]);

  const playSound = useCallback(() => {
    if (!output || isPlaying || isFlashing) return;
    stopPlayback();
    initAudio();
    setIsPlaying(true);

    const ctx = audioCtxRef.current!;
    const dotMs = 1200 / wpm;
    let startTime = ctx.currentTime + 0.1;

    const codes = output.split(' ');

    for (const code of codes) {
      if (code === '/') {
        startTime += (dotMs * 7) / 1000;
        continue;
      }

      for (let j = 0; j < code.length; j++) {
        const symbol = code[j];
        const duration = symbol === '.' ? dotMs : dotMs * 3;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration / 1000);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.005);
        gain.gain.setValueAtTime(0.1, startTime + duration / 1000 - 0.005);
        gain.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

        startTime += duration / 1000;

        if (j < code.length - 1) startTime += dotMs / 1000;
      }

      startTime += (dotMs * 3) / 1000;
    }

    const totalMs = (startTime - ctx.currentTime) * 1000;
    const t = setTimeout(() => setIsPlaying(false), totalMs);
    timeoutsRef.current.push(t);
  }, [output, wpm, isPlaying, isFlashing, stopPlayback, initAudio]);

  const startFlash = useCallback(() => {
    if (!output || isPlaying || isFlashing) return;
    stopPlayback();
    setIsFlashing(true);

    const dotMs = 1200 / wpm;
    let delay = 0;

    const codes = output.split(' ');

    for (const code of codes) {
      if (code === '/') {
        delay += dotMs * 7;
        continue;
      }

      for (let j = 0; j < code.length; j++) {
        const symbol = code[j];
        const duration = symbol === '.' ? dotMs : dotMs * 3;

        const tOn = setTimeout(() => setFlashActive(true), delay);
        timeoutsRef.current.push(tOn);

        const tOff = setTimeout(() => setFlashActive(false), delay + duration);
        timeoutsRef.current.push(tOff);

        delay += duration;

        if (j < code.length - 1) delay += dotMs;
      }

      delay += dotMs * 3;
    }

    const tEnd = setTimeout(() => {
      setIsFlashing(false);
      setFlashActive(false);
    }, delay + 200);
    timeoutsRef.current.push(tEnd);
  }, [output, wpm, isPlaying, isFlashing, stopPlayback]);

  const hasOutput = output.length > 0;
  const isBusy = isPlaying || isFlashing;

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">PRIVACY</span>
        </div>
        <i className="fas fa-shield-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security Guard</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All Morse code translation happens 100% locally inside your browser. No text ever leaves your device.
          </p>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${
                t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">MORSE</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-1.5 border border-white/10">
            <button
              onClick={() => { setMode('text-to-morse'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'text-to-morse' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-font mr-1"></i>Text → Morse
            </button>
            <button
              onClick={() => { setMode('morse-to-text'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'morse-to-text' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fas fa-signal mr-1"></i>Morse → Text
            </button>
          </div>

          {/* Controls: WPM + Flash Color */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[11px] text-slate-400 font-semibold flex justify-between mb-1">
                <span>Speed (WPM)</span>
                <span className="text-white font-bold">{wpm} wpm</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Flash Color</label>
              <select
                value={flashColor}
                onChange={(e) => setFlashColor(e.target.value as FlashColor)}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {FLASH_COLORS.map((c) => (
                  <option key={c} value={c} className="bg-[#1a1a1a] text-white">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Flash Display */}
          {(isFlashing || flashActive || isPlaying) && (
            <div className="h-40 bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300">
              <div
                className="w-full h-full flex items-center justify-center rounded-lg transition-colors duration-[50ms]"
                style={{
                  backgroundColor: flashActive ? FLASH_CSS_COLORS[flashColor] : '#1a1a1a',
                  boxShadow: flashActive ? `0 0 60px ${FLASH_CSS_COLORS[flashColor]}80` : 'none',
                }}
              >
                <i className={`fas fa-lightbulb text-5xl transition-opacity duration-[50ms] ${
                  flashActive ? 'opacity-100' : 'opacity-20'
                }`}
                  style={{ color: flashActive ? '#1a1a1a' : '#ffffff40' }}
                ></i>
              </div>
            </div>
          )}

          {/* Action Buttons: Play / Flash / Stop */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={playSound}
              disabled={!hasOutput || isBusy}
              className="px-6 py-3 rounded-xl bg-white text-[#1a1a1a] font-extrabold text-sm hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[160px] justify-center"
            >
              <i className={`fas ${isPlaying ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i>
              <span>{isPlaying ? 'Playing...' : 'Play Audio'}</span>
            </button>
            <button
              onClick={startFlash}
              disabled={!hasOutput || isBusy}
              className="px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-sm hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[160px] justify-center"
            >
              <i className={`fas ${isFlashing ? 'fa-spinner fa-spin' : 'fa-lightbulb'}`}></i>
              <span>{isFlashing ? 'Flashing...' : 'Flash Light'}</span>
            </button>
            {isBusy && (
              <button
                onClick={stopPlayback}
                className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500/30 transition-colors flex items-center space-x-2 justify-center"
              >
                <i className="fas fa-stop"></i>
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Input / Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span><i className="fas fa-arrow-right-to-bracket mr-1"></i>{mode === 'text-to-morse' ? 'Text Input' : 'Morse Input'}</span>
                <span className="text-[10px] text-slate-500">{input.length}/{CHAR_LIMIT}</span>
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={mode === 'text-to-morse' ? 'Type your text here...' : 'Enter Morse (use . and -)...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30 resize-y min-h-[140px] max-h-[240px] placeholder:text-white/20"
              />
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  disabled={!input && !isBusy}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-eraser mr-1"></i>Clear
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span><i className="fas fa-arrow-right-from-bracket mr-1"></i>{mode === 'text-to-morse' ? 'Morse Output' : 'Text Output'}</span>
                {output && (
                  <button
                    onClick={copyOutput}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <i className="fas fa-copy mr-1"></i>Copy
                  </button>
                )}
              </label>
              <textarea
                value={output}
                readOnly
                placeholder="Translation will appear here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono resize-y min-h-[140px] max-h-[240px] placeholder:text-white/20 cursor-default"
              />
            </div>
          </div>

          {/* Reference Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowRef((p) => !p)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-table mr-1"></i>{showRef ? 'Hide' : 'Show'} Reference
            </button>
          </div>

          {showRef && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">Morse Code Reference</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {REFERENCE_ENTRIES.map(([ch, morse]) => (
                  <div key={ch} className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/5 text-center">
                    <span className="text-sm font-bold text-white block">{ch}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{morse}</span>
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
