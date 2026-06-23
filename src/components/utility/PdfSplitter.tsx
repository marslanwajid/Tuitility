'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

type SplitMode = 'range' | 'extract' | 'every';

interface SplitResult {
  name: string;
  blob: Blob;
  pages: string;
  size: number;
}

interface PagePreview {
  pageNum: number;
  imgData: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_PAGE_PREVIEWS = 100;

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function parsePageNumbers(input: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [s, e] = trimmed.split('-').map((n) => parseInt(n, 10));
      if (s && e && s >= 1 && e <= maxPages && s <= e) {
        for (let i = s; i <= e; i++) pages.add(i);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= maxPages) pages.add(num);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [generatingPreviews, setGeneratingPreviews] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [selectedPages, setSelectedPages] = useState('');
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [compression, setCompression] = useState<'off' | 'on'>('on');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [results, setResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const generatePreviews = useCallback(async (pdf: any) => {
    setGeneratingPreviews(true);
    const total = pdf.numPages;
    const limit = Math.min(total, MAX_PAGE_PREVIEWS);
    const items: PagePreview[] = [];
    for (let i = 1; i <= limit; i++) {
      try {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, canvas: canvas as any, viewport: vp }).promise;
          items.push({ pageNum: i, imgData: canvas.toDataURL() });
        } else {
          items.push({ pageNum: i, imgData: null });
        }
      } catch {
        items.push({ pageNum: i, imgData: null });
      }
    }
    setPreviews(items);
    setGeneratingPreviews(false);
  }, []);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50MB limit.');
      return;
    }
    setError(null);
    setResults([]);
    setPreviews([]);
    setProcessing(true);
    setProgressMsg('Loading PDF...');

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await getDocument({ data: buffer.slice(0) }).promise;
      setFile(f);
      setNumPages(pdf.numPages);
      setStartPage(1);
      setEndPage(pdf.numPages);
      setSelectedPages('');
      setPagesPerFile(1);

      setProgressMsg('Generating page previews...');
      await generatePreviews(pdf);
    } catch {
      setError('Failed to load PDF. The file may be corrupted or password protected.');
    }

    setProcessing(false);
  }, [generatePreviews]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    if (e.target) e.target.value = '';
  }, [handleFile]);

  const isPageSelected = useCallback((pageNum: number) => {
    if (splitMode === 'extract') {
      return parsePageNumbers(selectedPages, numPages).includes(pageNum);
    }
    return false;
  }, [splitMode, selectedPages, numPages]);

  const handlePageClick = useCallback((pageNum: number) => {
    if (splitMode !== 'extract') setSplitMode('extract');
    const current = parsePageNumbers(selectedPages, numPages);
    const next = current.includes(pageNum)
      ? current.filter((p) => p !== pageNum)
      : [...current, pageNum].sort((a, b) => a - b);
    setSelectedPages(next.join(', '));
  }, [splitMode, selectedPages, numPages]);

  const selectAllPages = () => {
    setSplitMode('extract');
    setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1).join(', '));
  };

  const clearSelection = () => setSelectedPages('');

  const splitPDF = async () => {
    if (!file) return;
    setProcessing(true);
    setProgressMsg('Splitting PDF...');
    setError(null);
    setResults([]);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const saveOpts = compression === 'on' ? { useObjectStreams: true } as any : {};
      const generated: SplitResult[] = [];

      if (splitMode === 'range') {
        if (startPage < 1 || endPage > numPages || startPage > endPage) throw new Error('Invalid page range');
        const newDoc = await PDFDocument.create();
        const indices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i);
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save(saveOpts);
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        generated.push({ name: `pages_${startPage}-${endPage}_${file.name}`, blob, pages: `${startPage}-${endPage}`, size: blob.size });
      } else if (splitMode === 'extract') {
        const pageNums = parsePageNumbers(selectedPages, numPages);
        if (pageNums.length === 0) throw new Error('No valid pages selected');
        const newDoc = await PDFDocument.create();
        const indices = pageNums.map((p) => p - 1);
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save(saveOpts);
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        generated.push({ name: `extracted_${file.name}`, blob, pages: `${pageNums.length} pages`, size: blob.size });
      } else if (splitMode === 'every') {
        if (pagesPerFile < 1) throw new Error('Invalid pages per file');
        const total = numPages;
        for (let i = 0; i < total; i += pagesPerFile) {
          const end = Math.min(i + pagesPerFile, total);
          const indices: number[] = [];
          for (let j = i; j < end; j++) indices.push(j);
          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, indices);
          copied.forEach((p) => newDoc.addPage(p));
          const bytes = await newDoc.save(saveOpts);
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          const partNum = Math.floor(i / pagesPerFile) + 1;
          generated.push({ name: `part_${partNum}_${file.name}`, blob, pages: `${i + 1}-${end}`, size: blob.size });
          setProgressMsg(`Splitting... part ${partNum} (${i + 1}-${end})`);
        }
      }

      setResults(generated);
      addToast('PDF split successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to split PDF');
      addToast('Failed to split PDF', 'error');
    }

    setProcessing(false);
  };

  const downloadFile = (res: SplitResult) => {
    const url = URL.createObjectURL(res.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllZip = async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split_files_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setNumPages(0);
    setPreviews([]);
    setResults([]);
    setError(null);
    setSelectedPages('');
    setStartPage(1);
    setEndPage(1);
  };

  const chunkInfo = useMemo(() => {
    if (splitMode !== 'every' || numPages === 0) return null;
    const n = pagesPerFile < 1 ? 1 : pagesPerFile;
    const chunks = Math.ceil(numPages / n);
    return { chunks, lastSize: numPages - (chunks - 1) * n };
  }, [splitMode, numPages, pagesPerFile]);

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
            All PDF splitting happens 100% locally inside your browser. No files ever leave your device.
          </p>
        </div>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${
                t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {!file && !processing && (
        <div
          className="w-full border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileSelect} />
          <div className="space-y-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-slate-300"></i>
            <p className="text-sm text-slate-600 font-semibold">Drop a PDF here or click to browse</p>
            <p className="text-[10px] text-slate-400">Split pages by range, extract, or every N pages</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-2">
          <i className="fas fa-exclamation-triangle text-red-500 text-xs mt-0.5"></i>
          <p className="text-xs text-red-700 font-semibold flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs"><i className="fas fa-times"></i></button>
        </div>
      )}

      {/* Dark Panel — Split Interface */}
      {file && !processing && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">SPLIT</span>
          </div>

          <div className="relative z-10 p-5 md:p-6 space-y-5">
            {/* File Info */}
            <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-3 border border-white/10">
              <i className="fas fa-file-pdf text-red-400 text-lg"></i>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate block">{file.name}</span>
                <span className="text-[11px] text-slate-400">{numPages} pages · {formatSize(file.size)}</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={reset} className="text-white/50 hover:text-white text-xs"><i className="fas fa-times"></i></button>
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1 border border-white/10">
              {([
                { id: 'range' as SplitMode, label: 'Range' },
                { id: 'extract' as SplitMode, label: 'Extract' },
                { id: 'every' as SplitMode, label: 'Every N' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSplitMode(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    splitMode === tab.id ? 'bg-white text-[#1a1a1a]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mode Controls */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              {splitMode === 'range' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">From Page</label>
                    <input
                      type="number"
                      min={1}
                      max={numPages}
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1)))}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">To Page</label>
                    <input
                      type="number"
                      min={1}
                      max={numPages}
                      value={endPage}
                      onChange={(e) => setEndPage(Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1)))}
                      className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                </div>
              )}

              {splitMode === 'extract' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Page Numbers</label>
                  <input
                    type="text"
                    value={selectedPages}
                    onChange={(e) => setSelectedPages(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Use commas and hyphens (e.g. 1, 3-5, 8)</p>
                </div>
              )}

              {splitMode === 'every' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Pages Per File</label>
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pagesPerFile}
                    onChange={(e) => setPagesPerFile(Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1)))}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  {chunkInfo && (
                    <p className="text-[10px] text-slate-500 mt-1">{chunkInfo.chunks} file(s) · last file: {chunkInfo.lastSize} page(s)</p>
                  )}
                </div>
              )}

              {/* Compression */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-sm text-white font-semibold">Compression</span>
                <select
                  value={compression}
                  onChange={(e) => setCompression(e.target.value as 'off' | 'on')}
                  className="bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-1.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="on" className="bg-[#1a1a1a] text-white">On</option>
                  <option value="off" className="bg-[#1a1a1a] text-white">Off</option>
                </select>
              </div>
            </div>

            {/* Page Preview Grid */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-th-large text-white/40 text-xs"></i>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Page Previews</span>
                </div>
                {splitMode === 'extract' && (
                  <div className="flex space-x-2">
                    <button onClick={selectAllPages} className="px-3 py-1 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-semibold hover:bg-white/20 transition-colors">
                      <i className="fas fa-check-double mr-1"></i>All
                    </button>
                    <button onClick={clearSelection} className="px-3 py-1 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-semibold hover:bg-white/20 transition-colors">
                      <i className="fas fa-eraser mr-1"></i>Clear
                    </button>
                  </div>
                )}
              </div>

              {generatingPreviews ? (
                <div className="text-center py-8 text-slate-500">
                  <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p className="text-xs">Generating previews...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
                  {previews.map((p) => (
                    <div
                      key={p.pageNum}
                      onClick={() => handlePageClick(p.pageNum)}
                      className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                        isPageSelected(p.pageNum)
                          ? 'border-white bg-white/20 shadow-lg scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {p.imgData ? (
                        <img src={p.imgData} alt={`Page ${p.pageNum}`} className="w-full h-auto block" />
                      ) : (
                        <div className="w-full aspect-[3/4] flex items-center justify-center text-white/30">
                          <i className="fas fa-file text-lg"></i>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-semibold">
                        {p.pageNum}
                      </div>
                      {isPageSelected(p.pageNum) && (
                        <div className="absolute top-1 right-1 bg-white text-[#1a1a1a] w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))}
                  {numPages > MAX_PAGE_PREVIEWS && (
                    <div className="col-span-full text-center text-[10px] text-slate-500 py-2">
                      +{numPages - MAX_PAGE_PREVIEWS} more pages (preview limited to {MAX_PAGE_PREVIEWS})
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Split Action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={splitPDF}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-[#1a1a1a] font-extrabold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-cut"></i>
                <span>Split PDF</span>
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                    <span className="text-sm font-bold text-emerald-400">Split Complete — {results.length} file(s)</span>
                  </div>
                  {results.length > 1 && (
                    <button onClick={downloadAllZip} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors">
                      <i className="fas fa-file-archive mr-1"></i>Download ZIP
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {results.map((r, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center space-x-3">
                      <i className="fas fa-file-pdf text-red-400"></i>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-semibold truncate">{r.name}</div>
                        <div className="text-[11px] text-slate-400 space-x-3">
                          <span>Pages {r.pages}</span>
                          <span>{formatSize(r.size)}</span>
                        </div>
                      </div>
                      <button onClick={() => downloadFile(r)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors">
                        <i className="fas fa-download"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={reset} className="w-full px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition-colors">
                  <i className="fas fa-redo mr-2"></i>Split Another PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">SPLIT</span>
          </div>
          <div className="relative z-10 p-8 text-center space-y-4">
            <i className="fas fa-spinner fa-spin text-3xl text-white"></i>
            <p className="text-sm text-slate-300 font-semibold">{progressMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
