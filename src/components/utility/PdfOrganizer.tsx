'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

interface PageItem {
  id: number;
  originalIndex: number;
  imgData: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const TOUCH_MOVE_THRESHOLD = 5;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function PdfOrganizer() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [originalPages, setOriginalPages] = useState<PageItem[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [compression, setCompression] = useState<'off' | 'on'>('on');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Touch drag refs (avoid re-renders during touchmove)
  const touchDrag = useRef<{
    fromIdx: number;
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

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf') {
      addToast('Please select a valid PDF file.', 'error');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      addToast('File size exceeds 25MB limit.', 'error');
      return;
    }
    setProcessing(true);
    setProgressMsg('Loading PDF...');

    try {
      const buffer = await f.arrayBuffer();
      const pdf = await getDocument({ data: buffer.slice(0) }).promise;
      const total = pdf.numPages;

      setProgressMsg(`Generating previews for ${total} pages...`);
      const items: PageItem[] = [];
      for (let i = 1; i <= total; i++) {
        try {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, canvas: canvas as any, viewport: vp }).promise;
            items.push({ id: i, originalIndex: i - 1, imgData: canvas.toDataURL() });
          } else {
            items.push({ id: i, originalIndex: i - 1, imgData: null });
          }
        } catch {
          items.push({ id: i, originalIndex: i - 1, imgData: null });
        }
      }

      setPages(items);
      setOriginalPages(items.map((p) => ({ ...p })));
      setFile(f);
      setOutputFileName(f.name.replace(/\.pdf$/i, '_organized.pdf'));

      const libDoc = await PDFDocument.load(buffer.slice(0));
      setPdfDoc(libDoc);

      addToast(`Loaded ${total} pages successfully!`, 'success');
    } catch {
      addToast('Failed to load PDF.', 'error');
    }

    setProcessing(false);
  }, [addToast]);

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

  const movePage = useCallback((fromIdx: number, toIdx: number) => {
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const commitDrag = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx !== toIdx) {
      movePage(fromIdx, toIdx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  }, [movePage]);

  // Desktop HTML5 drag
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    if (el) {
      try { e.dataTransfer.setDragImage(el, 60, 100); } catch {}
    }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === idx) return;
    setDragOverIdx(idx);
  };

  const handleDropItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null) {
      commitDrag(draggedIdx, idx);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Touch drag (mobile)
  const getCardIndexFromPoint = useCallback((x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const card = (el as HTMLElement).closest('[data-page-idx]');
    if (!card) return null;
    const idx = card.getAttribute('data-page-idx');
    return idx !== null ? parseInt(idx, 10) : null;
  }, []);

  const removeGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  }, []);

  const createGhost = useCallback((idx: number) => {
    removeGhost();
    const card = gridRef.current?.querySelector(`[data-page-idx="${idx}"]`);
    if (!card) return;
    const ghost = card.cloneNode(true) as HTMLDivElement;
    ghost.className = 'fixed w-28 h-36 opacity-80 scale-90 -rotate-3 z-[10000] pointer-events-none rounded-lg overflow-hidden shadow-2xl border-2 border-white/50';
    ghost.style.left = '-9999px';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  }, [removeGhost]);

  const updateGhostPosition = useCallback((x: number, y: number) => {
    if (ghostRef.current) {
      ghostRef.current.style.left = `${x - 56}px`;
      ghostRef.current.style.top = `${y - 72}px`;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, idx: number) => {
    const touch = e.touches[0];
    touchDrag.current = {
      fromIdx: idx,
      startX: touch.clientX,
      startY: touch.clientY,
      moved: false,
    };
    setDraggedIdx(idx);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const td = touchDrag.current;
    if (!td) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - td.startX);
    const dy = Math.abs(touch.clientY - td.startY);

    if (!td.moved && (dx < TOUCH_MOVE_THRESHOLD && dy < TOUCH_MOVE_THRESHOLD)) return;

    if (!td.moved) {
      td.moved = true;
      createGhost(td.fromIdx);
    }

    e.preventDefault();
    updateGhostPosition(touch.clientX, touch.clientY);

    const targetIdx = getCardIndexFromPoint(touch.clientX, touch.clientY);
    if (targetIdx !== null && targetIdx !== td.fromIdx) {
      setDragOverIdx(targetIdx);
    }
  }, [createGhost, getCardIndexFromPoint, updateGhostPosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const td = touchDrag.current;
    if (!td) return;

    removeGhost();

    if (td.moved) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const targetIdx = getCardIndexFromPoint(touch.clientX, touch.clientY);
      if (targetIdx !== null) {
        commitDrag(td.fromIdx, targetIdx);
      } else {
        setDraggedIdx(null);
        setDragOverIdx(null);
      }
    } else {
      setDraggedIdx(null);
      setDragOverIdx(null);
    }

    touchDrag.current = null;
  }, [commitDrag, getCardIndexFromPoint, removeGhost]);

  const handleTouchCancel = useCallback(() => {
    touchDrag.current = null;
    removeGhost();
    setDraggedIdx(null);
    setDragOverIdx(null);
  }, [removeGhost]);

  // Cleanup ghost on unmount
  useEffect(() => {
    return () => { removeGhost(); };
  }, [removeGhost]);

  const reverseOrder = () => {
    setPages((prev) => [...prev].reverse());
    addToast('Page order reversed!', 'success');
  };

  const shuffleOrder = () => {
    setPages((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    addToast('Pages shuffled!', 'success');
  };

  const resetOrder = () => {
    setPages(originalPages.map((p) => ({ ...p })));
    addToast('Reset to original order.', 'info');
  };

  const moveToFront = (idx: number) => {
    if (idx === 0) return;
    movePage(idx, 0);
  };

  const moveToBack = (idx: number) => {
    if (idx === pages.length - 1) return;
    movePage(idx, pages.length - 1);
  };

  const downloadPDF = async () => {
    if (!pdfDoc || pages.length === 0) return;
    setProcessing(true);
    setProgressMsg('Creating organized PDF...');

    try {
      const newPdf = await PDFDocument.create();
      const indices = pages.map((p) => p.originalIndex);
      const copied = await newPdf.copyPages(pdfDoc, indices);
      copied.forEach((p) => newPdf.addPage(p));
      const saveOpts = compression === 'on' ? { useObjectStreams: true } as any : {};
      const bytes = await newPdf.save(saveOpts);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName || 'organized.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('PDF downloaded successfully!', 'success');
    } catch {
      addToast('Failed to generate PDF.', 'error');
    }

    setProcessing(false);
  };

  const resetTool = () => {
    setFile(null);
    setPages([]);
    setOriginalPages([]);
    setPdfDoc(null);
    setOutputFileName('');
  };

  const posStrip = useMemo(() => {
    if (pages.length === 0) return null;
    return (
      <svg viewBox={`0 0 ${pages.length * 30} 24`} className="w-full h-6">
        {pages.map((p, i) => (
          <g key={p.id}>
            <rect x={i * 30} y="4" width="24" height="16" rx="3" fill={i === draggedIdx ? '#ef444480' : '#ffffff20'} />
            <text x={i * 30 + 12} y="15" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
              {p.id}
            </text>
          </g>
        ))}
      </svg>
    );
  }, [pages, draggedIdx]);

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
            All PDF page reordering happens 100% locally inside your browser. No files ever leave your device.
          </p>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${
                t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

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
            <p className="text-[10px] text-slate-400">Tap and hold a page to reorder it, or use the move buttons</p>
          </div>
        </div>
      )}

      {file && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
            <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">ORDER</span>
          </div>

          <div className="relative z-10 p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-pdf text-red-400 text-lg"></i>
                <div>
                  <span className="text-sm font-semibold text-white truncate block max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                  <span className="text-[11px] text-slate-400">{pages.length} pages</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={reverseOrder} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-semibold hover:bg-white/20 transition-colors">
                  <i className="fas fa-exchange-alt mr-1"></i>Reverse
                </button>
                <button onClick={shuffleOrder} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-semibold hover:bg-white/20 transition-colors">
                  <i className="fas fa-random mr-1"></i>Shuffle
                </button>
                <button onClick={resetOrder} className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-semibold hover:bg-white/20 transition-colors">
                  <i className="fas fa-undo mr-1"></i>Reset
                </button>
                <button onClick={resetTool} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold hover:bg-red-500/30 transition-colors">
                  <i className="fas fa-times mr-1"></i>Close
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center space-x-2 mb-2">
                <i className="fas fa-arrows-alt text-white/40 text-xs"></i>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Page Order</span>
              </div>
              {posStrip}
            </div>

            {processing && pages.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-white mb-2"></i>
                <p className="text-sm text-slate-300 font-semibold">{progressMsg}</p>
              </div>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-1 select-none"
              >
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    data-page-idx={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDropItem(e, idx)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, idx)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    className={`relative rounded-xl border-2 overflow-hidden touch-none select-none bg-white/5 ${
                      draggedIdx === idx ? 'opacity-40 scale-95 border-white/40' : ''
                    } ${
                      dragOverIdx === idx && draggedIdx !== null && draggedIdx !== idx
                        ? 'border-white/70 ring-1 ring-white/40 scale-[1.03]'
                        : 'border-white/10'
                    }`}
                    style={{ touchAction: 'none' }}
                  >
                    <div className="absolute top-1 left-1 z-10 flex space-x-1 md:opacity-0 md:hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveToFront(idx); }}
                          className="w-6 h-6 rounded bg-black/70 text-white text-[9px] flex items-center justify-center active:bg-black/90 hover:bg-black/90"
                          title="Move to front"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      )}
                      {idx < pages.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveToBack(idx); }}
                          className="w-6 h-6 rounded bg-black/70 text-white text-[9px] flex items-center justify-center active:bg-black/90 hover:bg-black/90"
                          title="Move to back"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      )}
                    </div>

                    {p.imgData ? (
                      <img src={p.imgData} alt={`Page ${p.id}`} className="w-full h-auto block pointer-events-none select-none" draggable={false} />
                    ) : (
                      <div className="w-full aspect-[3/4] flex items-center justify-center text-white/30">
                        <i className="fas fa-file text-lg"></i>
                      </div>
                    )}
                    <div className="bg-black/60 text-white text-[9px] text-center py-0.5 font-semibold">
                      #{idx + 1} · P{p.id}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-end gap-4">
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
                <button
                  onClick={downloadPDF}
                  disabled={processing}
                  className="px-8 py-3 rounded-xl bg-white text-[#1a1a1a] font-extrabold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 min-w-[180px]"
                >
                  {processing ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-download"></i>
                  )}
                  <span>{processing ? 'Processing...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
