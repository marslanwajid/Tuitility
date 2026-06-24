'use client';

import React, { useState, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const STEPS = [
  { num: 1, title: 'Copy URL', desc: 'Open Instagram, find the Reel you want, and copy its link.', img: '/images/step-1.png', aspect: 'aspect-video' },
  { num: 2, title: 'Paste URL', desc: 'Paste the Instagram Reel link into the input field below.', img: '/images/step-4.png', aspect: 'aspect-video' },
  { num: 3, title: 'Download', desc: 'Click the Download button. We will fetch the video for you.', img: '/images/step-3.png', aspect: 'aspect-[4/5]' },
  { num: 4, title: 'Save Video', desc: 'Preview the video and click Save to download it to your device.', img: '/images/step-2.png', aspect: 'aspect-[4/5]' },
];

export default function InstagramReelsDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [reelId, setReelId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const isValidInstagramUrl = (val: string) => {
    return /^https?:\/\/(www\.)?instagram\.com\/(reel\/|[^/]+\/reel\/)[A-Za-z0-9_-]+/.test(val);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setVideoUrl(null);
      setReelId(null);
    } catch {
      addToast('Could not read from clipboard', 'error');
    }
  };

  const handleClear = () => {
    setUrl('');
    setVideoUrl(null);
    setReelId(null);
  };

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed || !isValidInstagramUrl(trimmed)) {
      addToast('Please enter a valid Instagram Reel URL', 'error');
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setReelId(null);

    try {
      const res = await fetch('/api/instagram/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setReelId(data.reelId || null);
        addToast('Video ready for download!', 'success');
      } else {
        addToast(data.error || 'Could not fetch video. The reel may be private.', 'error');
      }
    } catch {
      addToast('Network error. Please check your connection and try again.', 'error');
    }

    setLoading(false);
  };

  const handleSave = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `instagram_reel_${reelId || 'video'}.mp4`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">REELS</span>
        </div>
        <i className="fab fa-instagram text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            Your Instagram links are processed securely through our API. No data is stored.
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
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">DOWNLOAD</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Step 1 & 2</label>
            <p className="text-sm font-bold text-white">Paste an Instagram Reels URL</p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setVideoUrl(null); setReelId(null); }}
                placeholder="https://www.instagram.com/reel/ABC123/"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-20 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {url && (
                  <button onClick={handleClear} className="text-slate-400 hover:text-red-400 p-1.5 text-xs transition-colors" title="Clear">
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <button onClick={handlePaste} className="text-slate-400 hover:text-white p-1.5 text-xs transition-colors" title="Paste from clipboard">
                  <i className="fas fa-paste"></i>
                </button>
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl bg-white text-[#1a1a1a] text-xs font-black hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin mr-1"></i>Processing</>
              ) : (
                <><i className="fas fa-download mr-1"></i>Download</>
              )}
            </button>
          </div>

          {videoUrl && (
            <div className="bg-[#262626] border border-white/10 rounded-xl p-4 text-center space-y-3">
              <i className="fas fa-check-circle text-white text-2xl block"></i>
              <p className="text-sm font-bold text-white">Video Ready!</p>
              <div className="max-w-xs mx-auto rounded-xl overflow-hidden bg-black shadow-lg">
                <video src={videoUrl} controls className="w-full max-h-[400px]"></video>
              </div>
              <button onClick={handleSave} className="px-6 py-3 rounded-xl bg-white text-[#1a1a1a] text-xs font-black hover:bg-slate-200 transition-colors shadow-lg">
                <i className="fas fa-save mr-1"></i>Save Video
              </button>
              <p className="text-[10px] text-slate-400">
                If the download does not start, right-click the video and select Save Video As.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center space-y-2">
                <div className={`w-full ${step.aspect} bg-white/10 rounded-lg overflow-hidden flex items-center justify-center`}>
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#1a1a1a] text-[10px] font-black">
                  {step.num}
                </div>
                <p className="text-xs font-bold text-white">{step.title}</p>
                <p className="text-[10px] text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need to download from other platforms? Try the <a href="/utility-tools/converter-tools/tiktok-downloader" className="text-white font-bold underline hover:text-slate-200">TikTok Downloader</a> or check our <a href="/utility-tools/audio-bitrate-converter" className="text-white font-bold underline hover:text-slate-200">Audio Bitrate Converter</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
