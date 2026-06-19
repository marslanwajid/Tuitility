'use client';

import React, { useState, useRef, useCallback } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'ara', label: 'Arabic' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'kor', label: 'Korean' },
  { code: 'rus', label: 'Russian' },
  { code: 'por', label: 'Portuguese' },
  { code: 'ita', label: 'Italian' },
  { code: 'nld', label: 'Dutch' },
];

interface PageResult {
  page: number;
  text: string;
  confidence: number;
  chars: number;
}

async function downloadDocx(text: string, filename: string) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const paragraphs = escaped.split('\n').map((line) =>
    `<w:p><w:pPr><w:spacing w:before="0" w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">${line || ' '}</w:t></w:r></w:p>`
  ).join('');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>`);

  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}</w:body>
</w:document>`);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function OcrPdfGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('eng');
  const [extractedText, setExtractedText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [stats, setStats] = useState({ pages: 0, chars: 0, words: 0, lines: 0, confidence: 0, timeMs: 0 });
  const [pageResults, setPageResults] = useState<PageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setError(null);
    setExtractedText('');
    setStats({ pages: 0, chars: 0, words: 0, lines: 0, confidence: 0, timeMs: 0 });
    setPageResults([]);
    setProgress({ current: 0, total: 0, status: '' });
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleExtract = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setExtractedText('');
    setPageResults([]);
    cancelRef.current = false;

    const startTime = Date.now();
    const results: PageResult[] = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer.slice(0) }).promise;
      const totalPages = pdf.numPages;
      setProgress({ current: 0, total: totalPages, status: 'Loading pages…' });

      const worker = await Tesseract.createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setProgress((prev) => ({ ...prev, status: `Recognizing text… ${pct}%` }));
          } else {
            setProgress((prev) => ({ ...prev, status: m.status }));
          }
        },
      });

      for (let i = 1; i <= totalPages; i++) {
        if (cancelRef.current) break;
        setProgress({ current: i, total: totalPages, status: `Rendering page ${i}…` });

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;

        setProgress({ current: i, total: totalPages, status: `Page ${i} — OCR in progress…` });

        const { data } = await worker.recognize(canvas);

        results.push({
          page: i,
          text: data.text,
          confidence: data.confidence,
          chars: data.text.length,
        });
      }

      await worker.terminate();

      if (!cancelRef.current) {
        const combined = results.map((r) => r.text).join('\n\n');
        setExtractedText(combined);
        setPageResults(results);
        const totalChars = results.reduce((s, r) => s + r.chars, 0);
        const totalWords = combined.split(/\s+/).filter(Boolean).length;
        const totalLines = combined.split('\n').length;
        const avgConfidence = results.length > 0
          ? results.reduce((s, r) => s + r.confidence, 0) / results.length
          : 0;
        setStats({
          pages: results.length,
          chars: totalChars,
          words: totalWords,
          lines: totalLines,
          confidence: Math.round(avgConfidence * 10) / 10,
          timeMs: Date.now() - startTime,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process PDF. The file may be encrypted, damaged, or password-protected.');
    }

    setProcessing(false);
  };

  const handleCancel = () => { cancelRef.current = true; };

  const handleReset = () => {
    setFile(null);
    setExtractedText('');
    setStats({ pages: 0, chars: 0, words: 0, lines: 0, confidence: 0, timeMs: 0 });
    setPageResults([]);
    setProgress({ current: 0, total: 0, status: '' });
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(extractedText); } catch { /* ignore */ }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name || 'extracted').replace(/\.pdf$/i, '') + '-ocr.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    const baseName = (file?.name || 'extracted').replace(/\.pdf$/i, '');
    downloadDocx(extractedText, baseName + '-ocr.docx');
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const maxChars = Math.max(...pageResults.map((r) => r.chars), 1);

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
            All PDF processing and OCR happen 100% locally inside your browser. No files, text, or data are ever uploaded to any server.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer relative ${
          dragging ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/40'
        } bg-white/5`}
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
        {file ? (
          <div className="space-y-2">
            <i className="fas fa-file-pdf text-3xl text-red-400"></i>
            <p className="text-sm font-bold text-white">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <i className="fas fa-cloud-upload-alt text-3xl text-slate-400"></i>
            <p className="text-sm text-slate-300 font-semibold">
              Drop a PDF here or click to browse
            </p>
            <p className="text-[10px] text-slate-500">Supports any PDF document — scanned or text-based</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {file && !processing && !extractedText && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">OCR Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExtract}
            className="px-7 py-3 rounded-full bg-white text-slate-900 font-extrabold text-sm hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-magic mr-2"></i>Extract Text
          </button>
          <button
            onClick={handleReset}
            className="px-7 py-3 rounded-full bg-white/10 text-white border border-white/20 font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Processing Progress */}
      {processing && (
        <div className="bg-white/5 rounded-2xl p-5 space-y-3 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Page {progress.current} of {progress.total}
            </span>
            <span className="text-[10px] text-slate-500">{progress.status}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            ></div>
          </div>
          <button
            onClick={handleCancel}
            className="px-5 py-2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-semibold text-xs hover:bg-red-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-xs text-red-300 font-semibold"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</p>
        </div>
      )}

      {/* Results */}
      {extractedText && !processing && (
        <>
          {/* SVG Extraction Summary Widget */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
              <span className="text-white/[0.03] text-[100px] italic font-black tracking-tighter">OCR</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-chart-simple text-white/50 text-sm"></i>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Extraction Summary</span>
              </div>

              {/* Per-Page Bar Chart */}
              {pageResults.length > 0 && (
                <div className="mb-5 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold">Characters per Page</span>
                  <div className="space-y-1.5">
                    {pageResults.slice(0, 15).map((r) => (
                      <div key={r.page} className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 w-6 shrink-0 text-right font-mono">P{r.page}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(r.chars / maxChars) * 100}%`,
                              background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                            }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 w-14 text-right font-mono">{r.chars.toLocaleString()}</span>
                      </div>
                    ))}
                    {pageResults.length > 15 && (
                      <p className="text-[10px] text-slate-500 pt-1">+{pageResults.length - 15} more pages</p>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Pages', value: stats.pages, icon: 'fa-file' },
                  { label: 'Characters', value: stats.chars.toLocaleString(), icon: 'fa-font' },
                  { label: 'Words', value: stats.words.toLocaleString(), icon: 'fa-align-left' },
                  { label: 'Confidence', value: `${stats.confidence}%`, icon: 'fa-percent' },
                  { label: 'Time', value: formatTime(stats.timeMs), icon: 'fa-clock' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center space-x-2 mb-1">
                      <i className={`fas ${stat.icon} text-white/30 text-[10px]`}></i>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <span className="text-base font-black text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dark Results Panel */}
          <div className="bg-[#1a1a1a] text-white rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
              <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">OCR</span>
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-file-alt text-white/50"></i>
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Extracted Text</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 font-semibold text-[11px] hover:bg-white/20 transition-colors"
                  >
                    <i className="fas fa-copy mr-1.5"></i>Copy
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 font-semibold text-[11px] hover:bg-white/20 transition-colors"
                  >
                    <i className="fas fa-download mr-1.5"></i>TXT
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 font-semibold text-[11px] hover:bg-white/20 transition-colors"
                  >
                    <i className="fas fa-file-word mr-1.5"></i>DOCX
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed resize-y focus:outline-none focus:border-white/30 placeholder-slate-600"
                placeholder="Extracted text will appear here…"
              />
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-full bg-white/10 text-white border border-white/20 font-semibold text-[11px] hover:bg-white/20 transition-colors"
              >
                <i className="fas fa-redo mr-1.5"></i>New PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
