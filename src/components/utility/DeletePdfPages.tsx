'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

type SelectionMode = 'visual' | 'text';

interface PagePreview {
  pageNum: number;
  imgData: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
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
    const t = part.trim();
    if (t.includes('-')) {
      const [s, e] = t.split('-').map((n) => parseInt(n, 10));
      if (s && e && s >= 1 && e <= maxPages && s <= e) {
        for (let i = s; i <= e; i++) pages.add(i);
      }
    } else {
      const num = parseInt(t, 10);
      if (num >= 1 && num <= maxPages) pages.add(num);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function DeletePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [generatingPreviews, setGeneratingPreviews] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('visual');
  const [deleteSet, setDeleteSet] = useState<Set<number>>(new Set());
  const [pageInput, setPageInput] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [compression, setCompression] = useState<'off' | 'on'>('on');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const generatePreviews = useCallback(async (buffer: ArrayBuffer, total: number) => {
    setGeneratingPreviews(true);
    try {
      const pdf = await getDocument({ data: buffer.slice(0) }).promise;
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
          } else items.push({ pageNum: i, imgData: null });
        } catch {
          items.push({ pageNum: i, imgData: null });
        }
      }
      setPreviews(items);
    } catch {
      // previews remain empty
    }
    setGeneratingPreviews(false);
  }, []);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('File size exceeds 25MB limit.');
      return;
    }
    setError(null);
    setResultBlob(null);
    setDeleteSet(new Set());
    setPageInput('');
    setProcessing(true);
    setProgressMsg('Loading PDF...');

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer.slice(0));
      const total = pdf.getPageCount();
      setFile(f);
      setNumPages(total);
      setOutputFileName(f.name.replace(/\.pdf$/i, '-pages-deleted.pdf'));

      setProgressMsg('Generating page previews...');
      await generatePreviews(buffer, total);
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

  const togglePage = useCallback((pageNum: number) => {
    setDeleteSet((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      if (selectionMode === 'visual') {
        const sorted = Array.from(next).sort((a, b) => a - b);
        setPageInput(sorted.join(', '));
      }
      return next;
    });
  }, [selectionMode]);

  const selectAll = () => {
    const all = new Set(Array.from({ length: numPages }, (_, i) => i + 1));
    setDeleteSet(all);
    setPageInput(Array.from(all).sort((a, b) => a - b).join(', '));
  };

  const clearSelection = () => {
    setDeleteSet(new Set());
    setPageInput('');
  };

  const handleTextInput = useCallback((val: string) => {
    setPageInput(val);
    const parsed = parsePageNumbers(val, numPages);
    if (val.trim() && parsed.length > 0) {
      setDeleteSet(new Set(parsed));
    } else if (!val.trim()) {
      setDeleteSet(new Set());
    }
  }, [numPages]);

  const validationMsg = useMemo(() => {
    if (deleteSet.size === 0) return '';
    if (deleteSet.size >= numPages) return 'Cannot delete all pages. At least one page must remain.';
    return `${deleteSet.size} page(s) will be deleted, ${numPages - deleteSet.size} will remain.`;
  }, [deleteSet.size, numPages]);

  const canDelete = deleteSet.size > 0 && deleteSet.size < numPages;

  const handleDelete = async () => {
    if (!canDelete || !file) return;
    setProcessing(true);
    setProgressMsg('Deleting pages...');
    setError(null);
    setResultBlob(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();
      const toDelete = Array.from(deleteSet).sort((a, b) => a - b);
      const toKeep: number[] = [];
      for (let i = 1; i <= numPages; i++) {
        if (!toDelete.includes(i)) toKeep.push(i - 1);
      }
      const pages = await newDoc.copyPages(srcDoc, toKeep);
      pages.forEach((p) => newDoc.addPage(p));
      newDoc.setTitle(`${file.name} - Pages Deleted`);
      newDoc.setCreator('PDF Page Deletion Tool');
      newDoc.setProducer('Tuitility');
      newDoc.setCreationDate(new Date());
      const saveOpts = compression === 'on' ? { useObjectStreams: true } as any : {};
      const bytes = await newDoc.save(saveOpts);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      setResultBlob(blob);
      addToast('Pages deleted successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to delete pages');
      addToast('Failed to delete pages', 'error');
    }

    setProcessing(false);
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName.endsWith('.pdf') ? outputFileName : outputFileName + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setNumPages(0);
    setPreviews([]);
    setDeleteSet(new Set());
    setPageInput('');
    setResultBlob(null);
    setError(null);
  };

  const keptCount = numPages - deleteSet.size;
  const totalForBar = numPages || 1;

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
            All PDF processing happens 100% locally inside your browser. No files ever leave your device.
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
            <p className="text-[10px] text-slate-400">Select pages to delete and download the cleaned document</p>
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

      {/* Dark Panel — Delete Interface */}
      {file && !processing && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">DELETE</span>
          </div>

          <div className="relative z-10 p-5 md:p-6 space-y-5">
            {/* File Info */}
            <div className="bg-white/5 rounded-xl p-3 flex items-center space-x-3 border border-white/10">
              <i className="fas fa-file-pdf text-red-400 text-lg"></i>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate block">{file.name}</span>
                <span className="text-[11px] text-slate-400">{numPages} pages · {formatSize(file.size)}</span>
              </div>
              <button onClick={reset} className="text-white/50 hover:text-white text-xs"><i className="fas fa-times"></i></button>
            </div>

            {/* Mode Tabs */}
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1 border border-white/10">
              {([
                { id: 'visual' as SelectionMode, label: 'Visual', icon: 'fa-th' },
                { id: 'text' as SelectionMode, label: 'Text Input', icon: 'fa-keyboard' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectionMode(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    selectionMode === tab.id ? 'bg-white text-[#1a1a1a]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <i className={`fas ${tab.icon} mr-1.5`}></i>{tab.label}
                </button>
              ))}
            </div>

            {/* Selection Controls */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              {selectionMode === 'visual' && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button onClick={selectAll} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-semibold hover:bg-white/20 transition-colors">
                        <i className="fas fa-check-double mr-1"></i>All
                      </button>
                      <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-semibold hover:bg-white/20 transition-colors">
                        <i className="fas fa-eraser mr-1"></i>Clear
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      {deleteSet.size} of {numPages} selected
                    </span>
                  </div>

                  {generatingPreviews ? (
                    <div className="text-center py-8 text-slate-500">
                      <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
                      <p className="text-xs">Generating previews...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
                      {previews.map((p) => {
                        const marked = deleteSet.has(p.pageNum);
                        return (
                          <div
                            key={p.pageNum}
                            onClick={() => togglePage(p.pageNum)}
                            className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                              marked
                                ? 'border-red-500 bg-red-500/20 ring-1 ring-red-500/40'
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
                            <div className={`absolute bottom-0 left-0 right-0 text-[9px] text-center py-0.5 font-semibold ${
                              marked ? 'bg-red-600/80 text-white' : 'bg-black/60 text-white'
                            }`}>
                              {p.pageNum}
                            </div>
                            {marked && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow">
                                <i className="fas fa-trash"></i>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {numPages > MAX_PAGE_PREVIEWS && (
                        <div className="col-span-full text-center text-[10px] text-slate-500 py-2">
                          +{numPages - MAX_PAGE_PREVIEWS} more pages
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectionMode === 'text' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Pages to Delete
                  </label>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => handleTextInput(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Use commas and hyphens (e.g. 1, 3-5, 8)</p>
                  {validationMsg && (
                    <p className={`text-xs mt-1 font-semibold ${
                      deleteSet.size >= numPages ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      <i className={`fas ${deleteSet.size >= numPages ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-1`}></i>
                      {validationMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* SVG Bar — Kept vs Deleted */}
            {numPages > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <i className="fas fa-chart-pie text-white/40 text-xs"></i>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Kept vs Deleted</span>
                </div>
                <div className="flex items-center space-x-1 h-6">
                  <div
                    className="h-full rounded-l-md transition-all duration-300"
                    style={{ width: `${(keptCount / totalForBar) * 100}%`, backgroundColor: '#10b981' }}
                    title={`${keptCount} page(s) kept`}
                  ></div>
                  <div
                    className="h-full rounded-r-md transition-all duration-300"
                    style={{ width: `${(deleteSet.size / totalForBar) * 100}%`, backgroundColor: '#ef4444' }}
                    title={`${deleteSet.size} page(s) deleted`}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span><span className="inline-block w-2 h-2 rounded bg-emerald-500 mr-1"></span>{keptCount} kept</span>
                  <span><span className="inline-block w-2 h-2 rounded bg-red-500 mr-1"></span>{deleteSet.size} deleted</span>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Options</span>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Output Filename</label>
                  <input
                    type="text"
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div className="min-w-[140px]">
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Compression</label>
                  <select
                    value={compression}
                    onChange={(e) => setCompression(e.target.value as 'off' | 'on')}
                    className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="on" className="bg-[#1a1a1a] text-white">On (Smaller File)</option>
                    <option value="off" className="bg-[#1a1a1a] text-white">Off (Faster)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={!canDelete}
              className="w-full px-6 py-3 rounded-xl bg-red-500 text-white font-extrabold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-trash-alt"></i>
              <span>Delete Selected Pages</span>
            </button>

            {/* Results */}
            {resultBlob && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span className="text-sm font-bold text-emerald-400">Done! {numPages - deleteSet.size} page(s) remaining</span>
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <div className="text-sm text-white font-semibold truncate">{outputFileName}</div>
                  <div className="text-[11px] text-slate-400 space-x-3">
                    <span>{keptCount} pages</span>
                    <span>{formatSize(resultBlob.size)}</span>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="w-full px-6 py-3 rounded-xl bg-white text-emerald-700 font-extrabold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-download"></i>
                  <span>Download</span>
                </button>
                <button
                  onClick={reset}
                  className="w-full px-6 py-3 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <i className="fas fa-redo mr-2"></i>Delete From Another PDF
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
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">DELETE</span>
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
