'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function QRCodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.style.display = 'none'; }
    setScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code) {
        setResult(code.data);
        addToast('QR Code detected!', 'success');
        return;
      }
    }
    if (scanningRef.current) animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [addToast]);

  const startCamera = useCallback(async () => {
    setProcessing(true);
    setResult(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        addToast('Your browser does not support camera access.', 'error');
        setProcessing(false);
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.style.display = 'block';
        await videoRef.current.play();
        scanningRef.current = true;
        setScanning(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch {
      addToast('Could not access the camera. Please grant permission.', 'error');
    }
    setProcessing(false);
  }, [scanFrame, addToast]);

  const toggleCamera = useCallback(() => {
    if (scanning) { stopCamera(); return; }
    startCamera();
  }, [scanning, startCamera, stopCamera]);

  const enhanceContrast = (data: Uint8ClampedArray) => {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const newVal = 1.5 * (avg - 128) + 128;
      const finalVal = newVal > 128 ? 255 : 0;
      data[i] = finalVal;
      data[i + 1] = finalVal;
      data[i + 2] = finalVal;
    }
  };

  const tryProcessImage = (img: HTMLImageElement, scale: number, mode: string): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: mode as any });
      if (code) { setResult(code.data); addToast('QR Code found!', 'success'); return true; }
    } catch { /* ignore */ }
    return false;
  };

  const processImageWithEnhancement = (img: HTMLImageElement) => {
    if (tryProcessImage(img, 1.0, 'attemptBoth')) return;
    const scales = [1.0, 1.5, 2.0, 0.8, 0.5];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    for (const scale of scales) {
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        let imageData = ctx.getImageData(0, 0, w, h);
        enhanceContrast(imageData.data);
        ctx.putImageData(imageData, 0, 0);
        imageData = ctx.getImageData(0, 0, w, h);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code) { setResult(code.data); addToast('QR Code found!', 'success'); return; }
      } catch { /* ignore */ }
    }
    const invModes = ['attemptBoth', 'dontInvert', 'onlyInvert'];
    for (const scale of scales) {
      for (const mode of invModes) {
        if (tryProcessImage(img, scale, mode)) return;
      }
    }
    addToast('No QR code found. Try a clearer image.', 'error');
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (scanningRef.current) stopCamera();
    setResult(null);
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImageWithEnhancement(img);
      img.onerror = () => { addToast('Could not load image.', 'error'); setProcessing(false); };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [stopCamera, addToast]);

  const handleClear = () => {
    setResult(null);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Could not copy to clipboard.', 'error');
    }
  };

  const isValidURL = (s: string) => { try { return Boolean(new URL(s)); } catch { return false; } };

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">SCAN</span>
        </div>
        <i className="fas fa-qrcode text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">Privacy & Security</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All scanning happens locally in your browser. No data is ever uploaded.
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
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">QR</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={toggleCamera}
              disabled={processing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5 ${scanning ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white text-[#1a1a1a] hover:bg-slate-200'}`}
            >
              <i className={`fas ${scanning ? 'fa-stop-circle' : 'fa-camera'}`}></i>
              {scanning ? 'Stop Camera' : 'Start Camera'}
            </button>
            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                <i className="fas fa-file-upload"></i>Upload Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          </div>

          <div className="border-2 border-dashed border-white/20 rounded-xl p-4 md:p-6 text-center min-h-[240px] flex flex-col items-center justify-center space-y-3">
            <video ref={videoRef} className="w-full max-w-md rounded-lg bg-black" muted playsInline style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {processing && !scanning && (
              <div className="text-slate-400 text-sm"><i className="fas fa-spinner fa-spin mr-2"></i>Processing...</div>
            )}

            {result && (
              <div className="w-full bg-[#262626] rounded-xl p-4 border border-white/10 space-y-3 text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Scan Result</p>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-white break-all">
                  {isValidURL(result) ? (
                    <a href={result} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">{result}</a>
                  ) : (
                    result
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-white text-[#1a1a1a] text-[10px] font-bold hover:bg-slate-200 transition-colors">
                    <i className="fas fa-copy mr-1"></i>Copy
                  </button>
                  {isValidURL(result) && (
                    <a href={result} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1">
                      <i className="fas fa-external-link-alt"></i>Open Link
                    </a>
                  )}
                  <button onClick={handleClear} className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-bold hover:bg-white/20 transition-colors">
                    <i className="fas fa-times mr-1"></i>Clear
                  </button>
                </div>
              </div>
            )}

            {!scanning && !processing && !result && (
              <div className="text-slate-500 text-center space-y-2">
                <i className="fas fa-qrcode text-3xl"></i>
                <p className="text-xs font-semibold">Start Camera or Upload an Image to Scan</p>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3">
            <i className="fas fa-external-link-alt text-slate-400 text-sm"></i>
            <p className="text-[11px] text-slate-300">
              Need to create QR codes? Try the <a href="/utility-tools/qr-code-generator" className="text-white font-bold underline hover:text-slate-200">QR Code Generator</a> or check our <a href="/utility-tools/converter-tools/reels-downloader" className="text-white font-bold underline hover:text-slate-200">Instagram Reels Downloader</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
