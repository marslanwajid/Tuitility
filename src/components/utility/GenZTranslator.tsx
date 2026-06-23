'use client';

import React, { useState, useEffect, useRef } from 'react';

const DICTIONARY = [
  { term: 'Bet', definition: '"Yes", "Okay", or "I agree". Used to confirm plans or accept a challenge.' },
  { term: 'Cap / No Cap', definition: '"Cap" means a lie or exaggeration. "No cap" means "no lie", "seriously", or "for real".' },
  { term: 'Finna', definition: 'Short for "fixing to", meaning going to or preparing to do something.' },
  { term: 'Ghosting', definition: 'Suddenly cutting off all communication with someone without explanation.' },
  { term: 'Simp', definition: 'Someone who does way too much for a person they like, often without reciprocation.' },
  { term: 'Sus', definition: 'Short for "suspicious" or "shady". Popularized by the game Among Us.' },
  { term: 'Rizz', definition: 'Short for "charisma". Refers to someone\'s charm or ability to attract others.' },
  { term: 'fr fr', definition: 'Short for "for real, for real". Used to emphasize honesty and truthfulness.' },
];

export default function GenZTranslator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [conversionMode, setConversionMode] = useState<'to-genz' | 'to-standard'>('to-genz');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTranslate = async (text: string, mode: 'to-genz' | 'to-standard') => {
    if (!text.trim()) {
      setOutputText('');
      setStatusMsg('');
      return;
    }

    // Abort any active translation request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg('Translating vibes...');

    try {
      const response = await fetch('/api/ai/translate-genz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          toGenZ: mode === 'to-genz',
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to translate');
      }

      setOutputText(data.translation || '');
      setStatusMsg('');
    } catch (err: any) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        return; // Silently ignore aborted requests
      }
      console.error(err);
      setErrorMsg(err.message || 'Translation service offline');
      setOutputText(
        mode === 'to-genz'
          ? "I'm sorry, I couldn't translate that to Gen Z slang right now. (AI Service Offline)"
          : "I'm sorry, I couldn't translate that to standard English right now. (AI Service Offline)"
      );
      setStatusMsg('');
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleReset = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setInputText('');
    setOutputText('');
    setErrorMsg('');
    setStatusMsg('');
    setIsLoading(false);
  };

  const handleSwap = () => {
    const newMode = conversionMode === 'to-genz' ? 'to-standard' : 'to-genz';
    setConversionMode(newMode);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      } catch {
        /* ignore */
      }
    }
  };

  const inputLabel = conversionMode === 'to-genz' ? 'Standard English' : 'Gen Z Slang';
  const outputLabel = conversionMode === 'to-genz' ? 'Gen Z Output' : 'Standard English Output';
  const inputPlaceholder =
    conversionMode === 'to-genz'
      ? 'Hello! How are you doing today? I am very excited for our meeting.'
      : 'Yo fam, that presentation was absolute rizz, fr fr no cap...';

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      {/* Privacy Guard */}
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">AI TECH</span>
        </div>
        <i className="fas fa-robot text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">AI Translation Model</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            Powered by Google's advanced Gemini AI. All requests are securely processed over SSL and inputs are never saved or stored.
          </p>
        </div>
      </div>

      {/* Translation Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-150">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setConversionMode('to-genz')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              conversionMode === 'to-genz'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            Standard → Gen Z
          </button>
          <button
            type="button"
            onClick={() => setConversionMode('to-standard')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              conversionMode === 'to-standard'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            Gen Z → Standard
          </button>
        </div>

        {statusMsg && (
          <span className="text-[10px] text-slate-500 font-bold flex items-center px-2">
            {isLoading && <i className="fas fa-spinner animate-spin mr-1.5 text-[9px]"></i>}
            {statusMsg}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-start space-x-2">
          <i className="fas fa-exclamation-circle mt-0.5"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Left Side: Input Box */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-400 transition-all">
          <div className="flex items-center justify-between bg-white border-b border-slate-150 px-4 py-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {inputLabel}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setInputText('')}
                disabled={!inputText}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all disabled:opacity-40 cursor-pointer"
                title="Clear"
              >
                <i className="fas fa-trash-alt text-[10px]"></i>
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full min-h-[220px] md:min-h-[280px] p-5 bg-transparent border-0 text-sm text-slate-800 placeholder:text-slate-400 font-medium resize-y focus:outline-none"
          />
          <div className="flex justify-between items-center px-4 py-2 border-t border-slate-150/40 text-[9px] text-slate-400 font-bold bg-white/20">
            <span>{inputText.length} characters</span>
            <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        {/* Swap Button (Desktop Center overlay) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={handleSwap}
            className="w-10 h-10 bg-slate-900 border border-slate-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 hover:bg-slate-850 cursor-pointer hover:rotate-180 duration-500"
            title="Swap translation direction"
          >
            <i className="fas fa-exchange-alt text-xs"></i>
          </button>
        </div>

        {/* Right Side: Output Box */}
        <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all relative">
          <div className="flex items-center justify-between bg-white border-b border-slate-150 px-4 py-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
              {outputLabel}
              {conversionMode === 'to-genz' && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-black tracking-widest uppercase rounded">
                  AI ✨
                </span>
              )}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputText}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-all disabled:opacity-40 cursor-pointer"
                title="Copy translation"
              >
                <i className={copyStatus === 'Copied!' ? 'fas fa-check text-[10px]' : 'fas fa-copy text-[10px]'}></i>
                <span className="text-[9px] font-extrabold">{copyStatus}</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex">
            <textarea
              value={outputText}
              readOnly
              placeholder="Translation will appear here after clicking Translate Vibes..."
              className={`w-full min-h-[220px] md:min-h-[280px] p-5 bg-transparent border-0 text-sm text-slate-800 placeholder:text-slate-400 font-medium resize-none focus:outline-none transition-all duration-300 ${
                isLoading ? 'blur-xs opacity-50 select-none' : ''
              }`}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-slate-50/70 flex flex-col items-center justify-center space-y-2 z-10 animate-fade-in">
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce delay-300"></span>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Translating Vibes
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center px-4 py-2 border-t border-slate-150/40 text-[9px] text-slate-400 font-bold bg-white/20">
            <span>{outputText.length} characters</span>
            <span>{outputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleTranslate(inputText, conversionMode)}
          disabled={isLoading || !inputText.trim()}
          className="px-8 py-3 rounded-full bg-[#1a1a1a] text-white font-extrabold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 flex items-center space-x-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Translating Vibes...</span>
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              <span>Translate Vibes</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-extrabold text-xs transition-all active:scale-95 cursor-pointer hover:bg-slate-50 flex items-center space-x-2 shadow-sm"
        >
          <i className="fas fa-redo-alt"></i>
          <span>Reset</span>
        </button>
      </div>

      {/* Mini Dictionary Card Deck */}
      <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[100px] italic font-black tracking-tighter">DICTIONARY</span>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col space-y-1 w-full text-left mb-5">
            <span className="text-xs font-black uppercase tracking-wider text-white/50 flex items-center">
              <i className="fas fa-book mr-2 text-white/30"></i>
              Mini Gen Z Slang Dictionary
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Quick reference guide for common Gen Z slang expressions and their meanings.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {DICTIONARY.map((item) => (
              <div
                key={item.term}
                className="bg-white/5 rounded-2xl p-4 flex flex-col text-left hover:bg-white/10 transition-all border border-white/5"
              >
                <span className="text-xs font-black text-white mb-1">{item.term}</span>
                <span className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  {item.definition}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interlinking & Related Tools */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col space-y-1 w-full text-left">
          <span className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] flex items-center">
            <i className="fas fa-link mr-2 text-slate-500"></i>
            Optimize Your Text
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Decoded your slang? Polish it further with these helpful utility tools.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/utility-tools/word-counter"
            className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-2xl flex items-center space-x-3 transition-all"
          >
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shadow-sm shrink-0">
              <i className="fas fa-font"></i>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-black text-[#1a1a1a] block truncate">Word Counter</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                Count words & analyze density
              </span>
            </div>
          </a>
          <a
            href="/utility-tools/english-to-ipa-translator"
            className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-2xl flex items-center space-x-3 transition-all"
          >
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shadow-sm shrink-0">
              <i className="fas fa-microphone-alt"></i>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-black text-[#1a1a1a] block truncate">English to IPA</span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                Phonetic transcription tool
              </span>
            </div>
          </a>
          <a
            href="/utility-tools/converter-tools/text-case-converter"
            className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-2xl flex items-center space-x-3 transition-all"
          >
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs shadow-sm shrink-0">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-black text-[#1a1a1a] block truncate">
                Text Case Converter
              </span>
              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                Upper, lower, title case conversions
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
