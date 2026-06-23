'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

type Format = 'png' | 'jpg' | 'webp';
type BgMode = 'none' | 'simple' | 'ai';

interface Settings {
  format: Format;
  quality: number;
  scale: number;
  invertColors: boolean;
  backgroundMode: BgMode;
}

export default function PdfToImageConverter() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    format: 'png',
    quality: 0.9,
    scale: 1.5,
    invertColors: false,
    backgroundMode: 'none',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setError(null);
    setFileName(f.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const pdf = await getDocument({ data: buffer.slice(0) }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch {
        setError('Failed to load PDF. The file might be corrupted or password protected.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    setLoading(true);
    if (settings.backgroundMode === 'ai') setProcessingAI(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: settings.scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, canvas, viewport }).promise;

      if (settings.invertColors) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];
          d[i + 1] = 255 - d[i + 1];
          d[i + 2] = 255 - d[i + 2];
        }
        ctx.putImageData(imageData, 0, 0);
      }

      if (settings.backgroundMode === 'simple') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        const tolerance = 40;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          let alpha = 255;
          if (settings.invertColors) {
            if (r < tolerance && g < tolerance && b < tolerance) {
              alpha = Math.max(0, (Math.max(r, g, b) / tolerance) * 255);
            }
          } else {
            if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
              alpha = Math.max(0, (Math.max(255 - r, 255 - g, 255 - b) / tolerance) * 255);
            }
          }
          if (alpha < 255) d[i + 3] = alpha;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (settings.backgroundMode === 'ai') {
        try {
          const { removeBackground } = await import('@imgly/background-removal');
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (!blob) throw new Error('Failed to create blob');
          const imageBlob = await removeBackground(blob);
          const img = new Image();
          img.src = URL.createObjectURL(imageBlob);
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(img.src);
              resolve();
            };
          });
        } catch {
          setError('AI Background Removal failed. Try Simple mode instead.');
        }
      }
    } catch {
      setError('Error rendering page.');
    } finally {
      setLoading(false);
      setProcessingAI(false);
    }
  }, [pdfDoc, currentPage, settings]);

  useEffect(() => {
    if (pdfDoc) renderPage();
  }, [pdfDoc, currentPage, settings.scale, settings.backgroundMode, settings.invertColors]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const mimeType = settings.format === 'jpg' ? 'image/jpeg' : settings.format === 'webp' ? 'image/webp' : 'image/png';
    const baseName = fileName.replace(/\.pdf$/i, '').replace(/\s+/g, '-').toLowerCase();
    const link = document.createElement('a');
    link.download = `${baseName}-page-${currentPage}.${settings.format}`;
    link.href = canvasRef.current.toDataURL(mimeType, settings.quality);
    link.click();
  };

  const handleReset = () => {
    if (pdfDoc) (pdfDoc as any).destroy();
    setPdfDoc(null);
    setFileName('');
    setTotalPages(0);
    setCurrentPage(1);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSettings({ format: 'png', quality: 0.9, scale: 1.5, invertColors: false, backgroundMode: 'none' });
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

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
            All PDF rendering and image conversion happens 100% locally inside your browser. No files ever leave your device.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      {!pdfDoc && (
        <div
          className={`w-full border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
            dragging ? 'border-slate-900 bg-slate-50 scale-[0.99]' : 'border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {loading ? (
            <div className="space-y-3">
              <i className="fas fa-spinner fa-spin text-3xl text-slate-400"></i>
              <p className="text-sm text-slate-500 font-semibold">Loading PDF...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <i className="fas fa-cloud-upload-alt text-3xl text-slate-300"></i>
              <p className="text-sm text-slate-600 font-semibold">Drop a PDF here or click to browse</p>
              <p className="text-[10px] text-slate-400">Convert PDF pages to PNG, JPG, or WebP</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-2">
          <i className="fas fa-exclamation-triangle text-red-500 text-xs mt-0.5"></i>
          <div className="flex-1">
            <p className="text-xs text-red-700 font-semibold">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Dark Panel — PDF Preview & Controls */}
      {pdfDoc && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">PDF→IMG</span>
          </div>

          <div className="relative z-10 p-5 md:p-6 space-y-5">
            {/* File Info */}
            <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-3 border border-white/10">
              <i className="fas fa-file-pdf text-red-400 text-lg"></i>
              <span className="text-sm font-semibold text-white truncate flex-1">{fileName}</span>
              <button onClick={handleReset} className="text-white/50 hover:text-white text-xs">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5">
              {/* Left: Controls */}
              <div className="space-y-4">
                {/* Page Selection */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Page Selection</label>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={currentPage <= 1 || loading}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-white">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages || loading}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                {/* Format */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Export Format</label>
                  <select
                    value={settings.format}
                    onChange={(e) => updateSetting('format', e.target.value as Format)}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="png" className="bg-[#1a1a1a] text-white">PNG (High Quality)</option>
                    <option value="jpg" className="bg-[#1a1a1a] text-white">JPG (Smaller Size)</option>
                    <option value="webp" className="bg-[#1a1a1a] text-white">WebP (Modern Web)</option>
                  </select>
                </div>

                {/* Background Removal */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Background Removal</label>
                  <select
                    value={settings.backgroundMode}
                    onChange={(e) => updateSetting('backgroundMode', e.target.value as BgMode)}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="none" className="bg-[#1a1a1a] text-white">None (Original)</option>
                    <option value="simple" className="bg-[#1a1a1a] text-white">Simple (Remove White)</option>
                    <option value="ai" className="bg-[#1a1a1a] text-white">AI Removal (Slower)</option>
                  </select>
                </div>

                {/* Invert Colors */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-semibold">Invert Colors</span>
                    <label className="relative inline-block w-11 h-6">
                      <input
                        type="checkbox"
                        checked={settings.invertColors}
                        onChange={(e) => updateSetting('invertColors', e.target.checked)}
                        className="opacity-0 w-0 h-0 peer"
                      />
                      <span className="absolute cursor-pointer inset-0 bg-white/20 rounded-full transition-colors peer-checked:bg-white/60 before:absolute before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-5"></span>
                    </label>
                  </div>
                </div>

                {/* Scale */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                    Resolution ({settings.scale}x)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.5"
                    value={settings.scale}
                    onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1x</span>
                    <span>3x</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full px-5 py-3 rounded-xl bg-white text-[#1a1a1a] font-extrabold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-download"></i>
                    )}
                    <span>{loading ? 'Rendering...' : 'Download Image'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-xs hover:bg-white/20 transition-colors"
                  >
                    Upload Different PDF
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                {loading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 rounded-xl">
                    <div className="text-center space-y-2">
                      {processingAI ? (
                        <>
                          <i className="fas fa-magic fa-spin text-2xl text-white"></i>
                          <p className="text-xs text-slate-300 font-semibold">AI Removing Background...</p>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-spinner fa-spin text-2xl text-white"></i>
                          <p className="text-xs text-slate-300 font-semibold">Rendering page...</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div ref={previewRef} className="max-w-full overflow-auto rounded-lg shadow-2xl" style={{ display: loading ? 'none' : 'block' }}>
                  <canvas ref={canvasRef} className="block max-w-full h-auto"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
