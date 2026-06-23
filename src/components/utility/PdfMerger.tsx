'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  error?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 20;
const TOUCH_MOVE_THRESHOLD = 5;

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [compression, setCompression] = useState<'off' | 'on'>('on');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);

  const touchDrag = useRef<{
    fromId: string;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  }, []);

  const createFileGhost = useCallback((id: string) => {
    removeGhost();
    const card = fileListRef.current?.querySelector(`[data-file-id="${id}"]`);
    if (!card) return;
    const ghost = card.cloneNode(true) as HTMLDivElement;
    ghost.className = 'fixed w-72 opacity-80 scale-90 -rotate-2 z-[10000] pointer-events-none rounded-xl overflow-hidden shadow-2xl border-2 border-white/50';
    ghost.style.left = '-9999px';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  }, [removeGhost]);

  const updateGhostPosition = useCallback((x: number, y: number) => {
    if (ghostRef.current) {
      const w = ghostRef.current.offsetWidth;
      ghostRef.current.style.left = `${x - w / 2}px`;
      ghostRef.current.style.top = `${y - 20}px`;
    }
  }, []);

  const getFileIdFromPoint = useCallback((x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const card = (el as HTMLElement).closest('[data-file-id]');
    if (!card) return null;
    return card.getAttribute('data-file-id');
  }, []);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newRaw = Array.from(fileList).filter((f) => f.type === 'application/pdf');
    if (newRaw.length === 0) {
      addToast('Please select PDF files only.', 'error');
      return;
    }

    const oversized = newRaw.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      addToast('Some files exceed the 25MB per-file limit.', 'error');
      return;
    }

    const combined = [...files, ...newRaw.map((f) => ({ file: f, size: f.size } as Partial<PdfFile>))];
    const totalSize = combined.reduce((s, f) => s + (f.size || 0), 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      addToast('Total file size exceeds 100MB limit.', 'error');
      return;
    }

    if (files.length + newRaw.length > MAX_FILES) {
      addToast(`Maximum ${MAX_FILES} files allowed.`, 'error');
      return;
    }

    setProcessing(true);
    setProgressMsg('Analyzing PDF files...');

    const processed: PdfFile[] = [];
    for (let i = 0; i < newRaw.length; i++) {
      const f = newRaw[i];
      setProgressMsg(`Analyzing file ${i + 1} of ${newRaw.length}: ${f.name}`);
      try {
        const buffer = await f.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        processed.push({
          id: generateId(),
          file: f,
          name: f.name,
          size: f.size,
          pages: pdf.getPageCount(),
        });
      } catch {
        processed.push({
          id: generateId(),
          file: f,
          name: f.name,
          size: f.size,
          pages: 0,
          error: 'Failed to analyze',
        });
      }
    }

    setFiles((prev) => [...prev, ...processed]);
    setProcessing(false);
    const okCount = processed.filter((p) => !p.error).length;
    if (okCount > 0) addToast(`Added ${okCount} PDF file(s).`, 'success');
    if (processed.some((p) => p.error)) addToast('Some files could not be analyzed.', 'warning');
  }, [files, addToast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedBlob(null);
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setMergedBlob(null);
  }, []);

  const commitFileDrag = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setFiles((prev) => {
      const src = prev.findIndex((f) => f.id === fromId);
      const tgt = prev.findIndex((f) => f.id === toId);
      if (src === -1 || tgt === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(src, 1);
      next.splice(tgt, 0, moved);
      return next;
    });
  }, []);

  // Desktop HTML5 drag
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFileDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      commitFileDrag(draggedId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, commitFileDrag]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  // Touch drag (mobile)
  const handleFileTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    const touch = e.touches[0];
    touchDrag.current = {
      fromId: id,
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false,
    };
    setDraggedId(id);
  }, []);

  const handleFileTouchMove = useCallback((e: React.TouchEvent) => {
    const td = touchDrag.current;
    if (!td) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - td.startX);
    const dy = Math.abs(touch.clientY - td.startY);

    if (!td.moved && (dx < TOUCH_MOVE_THRESHOLD && dy < TOUCH_MOVE_THRESHOLD)) return;

    if (!td.moved) {
      td.moved = true;
      createFileGhost(td.fromId);
    }

    e.preventDefault();
    updateGhostPosition(touch.clientX, touch.clientY);

    const targetId = getFileIdFromPoint(touch.clientX, touch.clientY);
    if (targetId !== null && targetId !== td.fromId) {
      setDragOverId(targetId);
    }
  }, [createFileGhost, getFileIdFromPoint, updateGhostPosition]);

  const handleFileTouchEnd = useCallback((e: React.TouchEvent) => {
    const td = touchDrag.current;
    if (!td) return;

    removeGhost();

    if (td.moved) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const targetId = getFileIdFromPoint(touch.clientX, touch.clientY);
      if (targetId !== null) {
        commitFileDrag(td.fromId, targetId);
      }
    }

    setDraggedId(null);
    setDragOverId(null);
    touchDrag.current = null;
  }, [commitFileDrag, getFileIdFromPoint, removeGhost]);

  const handleFileTouchCancel = useCallback(() => {
    touchDrag.current = null;
    removeGhost();
    setDraggedId(null);
    setDragOverId(null);
  }, [removeGhost]);

  useEffect(() => {
    return () => { removeGhost(); };
  }, [removeGhost]);

  const mergePDFs = async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length < 2) {
      addToast('Please add at least 2 valid PDF files to merge.', 'error');
      return;
    }

    setProcessing(true);
    setProgressMsg('Merging PDF files...');
    setMergedBlob(null);

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (let i = 0; i < validFiles.length; i++) {
        const f = validFiles[i];
        const pct = Math.round(((i + 1) / validFiles.length) * 100);
        setProgressMsg(`Merging ${f.name}... ${pct}%`);

        try {
          const buffer = await f.file.arrayBuffer();
          const srcPdf = await PDFDocument.load(buffer);
          const count = srcPdf.getPageCount();
          const indices = Array.from({ length: count }, (_, idx) => idx);
          const pages = await mergedPdf.copyPages(srcPdf, indices);
          pages.forEach((page) => mergedPdf.addPage(page));

          if (addPageNumbers) {
            const allPages = mergedPdf.getPages();
            const startPage = totalPages;
            for (let j = 0; j < count; j++) {
              const p = allPages[startPage + j];
              if (p) {
                const { width, height } = p.getSize();
                p.drawText(`${startPage + j + 1}`, {
                  x: width - 50,
                  y: 30,
                  size: 10,
                  color: rgb(0.5, 0.5, 0.5),
                });
              }
            }
          }

          totalPages += count;
        } catch {
          addToast(`Skipped corrupted file: ${f.name}`, 'warning');
        }
      }

      mergedPdf.setTitle('Merged PDF Document');
      mergedPdf.setCreator('PDF Merger Tool');
      mergedPdf.setProducer('Tuitility');
      mergedPdf.setCreationDate(new Date());

      setProgressMsg('Finalizing merged PDF...');
      const saveOpts = compression === 'on' ? { useObjectStreams: true } as any : {};
      const bytes = await mergedPdf.save(saveOpts);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      setMergedBlob(blob);
      addToast('PDFs merged successfully!', 'success');
    } catch {
      addToast('Failed to merge PDF files.', 'error');
    }

    setProcessing(false);
  };

  const downloadMerged = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validFiles = useMemo(() => files.filter((f) => !f.error), [files]);
  const totalPages = useMemo(() => validFiles.reduce((s, f) => s + f.pages, 0), [validFiles]);
  const totalSize = useMemo(() => validFiles.reduce((s, f) => s + f.size, 0), [validFiles]);

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
            All PDF merging and processing happens 100% locally inside your browser. No files ever leave your device.
          </p>
        </div>
      </div>

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

      {files.length === 0 && !processing && (
        <div
          className="w-full border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 border-slate-200 hover:border-slate-800 hover:bg-slate-50/50 bg-white"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="space-y-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-slate-300"></i>
            <p className="text-sm text-slate-600 font-semibold">Drop PDF files here or click to browse</p>
            <p className="text-[10px] text-slate-400">Select multiple files to merge them into one document</p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">MERGE</span>
          </div>

          <div className="relative z-10 p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center space-x-2">
                <i className="fas fa-file-pdf text-red-400"></i>
                <span>{validFiles.length} file{validFiles.length !== 1 ? 's' : ''}</span>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>Add Files
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                >
                  <i className="fas fa-trash mr-1"></i>Clear All
                </button>
              </div>
            </div>
            <input
              ref={addMoreInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div ref={fileListRef} className="space-y-2 max-h-80 overflow-y-auto pr-1 select-none">
              {validFiles.map((f, idx) => (
                <div
                  key={f.id}
                  data-file-id={f.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, f.id)}
                  onDragOver={handleFileDragOver}
                  onDrop={(e) => handleFileDrop(e, f.id)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleFileTouchStart(e, f.id)}
                  onTouchMove={handleFileTouchMove}
                  onTouchEnd={handleFileTouchEnd}
                  onTouchCancel={handleFileTouchCancel}
                  className={`flex items-center space-x-3 bg-white/5 rounded-xl p-3 border transition-all select-none touch-none ${
                    draggedId === f.id ? 'border-white/40 opacity-50 scale-[0.97]' : ''
                  } ${
                    dragOverId === f.id && draggedId !== null && draggedId !== f.id ? 'border-white/70 ring-1 ring-white/40' : 'border-white/10'
                  }`}
                  style={{ touchAction: 'none' }}
                >
                  <div className="cursor-grab text-white/30 hover:text-white/60 text-base">
                    <i className="fas fa-grip-vertical"></i>
                  </div>
                  <i className="fas fa-file-pdf text-red-400 text-xl shrink-0"></i>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{f.name}</div>
                    <div className="text-[11px] text-slate-400 space-x-3">
                      <span>{f.pages} page{f.pages !== 1 ? 's' : ''}</span>
                      <span>{formatSize(f.size)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="text-white/30 hover:text-red-400 text-sm transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              {files.some((f) => f.error) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 font-semibold">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Some files could not be analyzed. They will be skipped during merge.
                </div>
              )}
            </div>

            {validFiles.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <i className="fas fa-chart-bar text-white/40 text-xs"></i>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Pages per File</span>
                </div>
                <svg viewBox="0 0 600 40" className="w-full h-8">
                  {(() => {
                    const total = validFiles.reduce((s, f) => s + f.pages, 0);
                    if (total === 0) return <text x="300" y="24" textAnchor="middle" fill="#ffffff40" fontSize="11">No pages</text>;
                    let x = 0;
                    return validFiles.map((f, i) => {
                      const w = (f.pages / total) * 600;
                      const el = (
                        <rect key={f.id} x={x} y="2" width={Math.max(w, 1)} height="30" rx="4"
                          fill={`hsl(${(i * 47) % 360}, 60%, 55%)`}
                        >
                          <title>{f.name}: {f.pages} pages ({Math.round((f.pages / total) * 100)}%)</title>
                        </rect>
                      );
                      x += w;
                      return el;
                    });
                  })()}
                </svg>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {validFiles.map((f, i) => {
                    const total = validFiles.reduce((s, f) => s + f.pages, 0);
                    const pct = total > 0 ? Math.round((f.pages / total) * 100) : 0;
                    return (
                      <span key={f.id} className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                        <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: `hsl(${(i * 47) % 360}, 60%, 55%)` }}></span>
                        <span>{f.pages}p ({pct}%)</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Files', value: validFiles.length, icon: 'fa-file' },
                { label: 'Total Pages', value: totalPages, icon: 'fa-file-alt' },
                { label: 'Total Size', value: formatSize(totalSize), icon: 'fa-weight' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <div className="flex items-center justify-center space-x-1.5 mb-1">
                    <i className={`fas ${s.icon} text-white/30 text-[10px]`}></i>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</span>
                  </div>
                  <span className="text-base font-black text-white">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Merge Options</span>

              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Output Filename</label>
                  <input
                    type="text"
                    value={outputFileName}
                    onChange={(e) => setOutputFileName(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addPageNumbers}
                    onChange={(e) => setAddPageNumbers(e.target.checked)}
                    className="w-4 h-4 accent-white"
                  />
                  <span className="text-sm text-white font-semibold">Page Numbers</span>
                </label>

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

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={mergePDFs}
                disabled={validFiles.length < 2 || processing}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-[#1a1a1a] font-extrabold text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-object-group"></i>
                )}
                <span>{processing ? 'Merging...' : 'Merge PDFs'}</span>
              </button>
            </div>

            {processing && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center space-y-3">
                <i className="fas fa-spinner fa-spin text-2xl text-white"></i>
                <p className="text-sm text-slate-300 font-semibold">{progressMsg}</p>
              </div>
            )}

            {mergedBlob && !processing && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
                  <span className="text-sm font-bold text-emerald-400">Merge Complete!</span>
                </div>
                <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <div className="text-sm text-white font-semibold truncate">{outputFileName}</div>
                  <div className="text-[11px] text-slate-400 space-x-3">
                    <span>{totalPages} pages</span>
                    <span>{formatSize(mergedBlob.size)}</span>
                  </div>
                </div>
                <button
                  onClick={downloadMerged}
                  className="w-full px-6 py-3 rounded-xl bg-white text-emerald-700 font-extrabold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Merged PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
