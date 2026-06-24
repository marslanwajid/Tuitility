'use client';

import React, { useState, useCallback, useRef } from 'react';
import { processAudioFile, formatBytes, formatDuration, QUALITY_PRESETS } from '@/lib/audio';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function VideoToAudioExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<'wav' | 'mp3'>('mp3');
  const [quality, setQuality] = useState(192);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ duration: number; channels: number; sampleRate: number } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setDone(false);
    setResultUrl(null);
    setProgress(0);
    setMeta(null);
    (async () => {
      try {
        const ab = await f.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buf = await ctx.decodeAudioData(ab);
        setMeta({ duration: buf.duration, channels: buf.numberOfChannels, sampleRate: buf.sampleRate });
      } catch { /* ignore */ }
    })();
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setDone(false);
    setProgress(0);
    const blob = await processAudioFile(file, format, quality, setProgress);
    if (blob) {
      setResultUrl(URL.createObjectURL(blob));
      setDone(true);
      addToast(`Audio extracted as ${format.toUpperCase()}!`, 'success');
    } else {
      addToast('Extraction failed. The file may be unsupported.', 'error');
    }
    setBusy(false);
  }, [file, format, quality, addToast]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setMeta(null);
    setProgress(0);
    setDone(false);
    setResultUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_audio.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [resultUrl, file, format]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">EXTRACT</span>
        </div>
        <i className="fas fa-video text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All processing happens locally in your browser. No files are ever uploaded.
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
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">VIDEO</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-colors"
            >
              <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
              <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 mb-2 block"></i>
              <p className="text-sm font-semibold text-slate-300">Upload a video file</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports MP4, MOV, AVI, MKV, WebM</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-black/50 rounded-xl overflow-hidden">
                <video src={previewUrl || undefined} controls className="w-full max-h-[320px] object-contain"></video>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-video text-slate-400"></i>
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={handleReset} className="text-red-400 hover:text-red-300 text-sm"><i className="fas fa-trash"></i></button>
                </div>
                {meta && (
                  <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                    <span>Duration: {formatDuration(meta.duration)}</span>
                    <span>Channels: {meta.channels === 1 ? 'Mono' : 'Stereo'}</span>
                    <span>Sample Rate: {meta.sampleRate} Hz</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {file && !done && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold">Output Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as 'wav' | 'mp3')} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="mp3">MP3 (Compressed)</option>
                  <option value="wav">WAV (Lossless)</option>
                </select>
              </div>
              {format === 'mp3' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold">Quality</label>
                  <select value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30">
                    {QUALITY_PRESETS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {busy && (
            <div className="space-y-2">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">Extracting audio... {progress}%</p>
            </div>
          )}

          {done && resultUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center space-y-3">
              <i className="fas fa-check-circle text-emerald-400 text-2xl block"></i>
              <p className="text-sm font-bold text-emerald-300">Extraction Complete!</p>
              <div className="flex justify-center gap-3">
                <button onClick={handleDownload} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
                  <i className="fas fa-download mr-1"></i>Download {format.toUpperCase()}
                </button>
                <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors">
                  <i className="fas fa-redo mr-1"></i>Extract Another
                </button>
              </div>
            </div>
          )}

          {file && !busy && !done && (
            <div className="flex gap-3">
              <button onClick={handleReset} className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors">
                <i className="fas fa-times mr-1"></i>Remove
              </button>
              <button onClick={handleExtract} className="px-6 py-2.5 rounded-xl bg-white text-[#1a1a1a] text-xs font-black hover:bg-slate-200 transition-colors shadow-lg">
                <i className="fas fa-music mr-1"></i>Extract Audio
              </button>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need to calculate bitrates or convert formats? Try the <a href="/utility-tools/audio-bitrate-converter" className="text-white font-bold underline hover:text-slate-200">Bitrate Calculator</a> or <a href="/utility-tools/audio-format-converter" className="text-white font-bold underline hover:text-slate-200">Audio Format Converter</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
