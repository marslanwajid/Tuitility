'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { markdownToHtml } from '@/lib/md';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const CHAR_LIMIT = 500000;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function MarkdownViewer() {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'github-dark' | 'brand-dark'>('github-dark');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const html = useMemo(() => {
    if (!input) return '';
    try {
      return markdownToHtml(input);
    } catch {
      return '<p style="color:#ef4444">Error parsing markdown.</p>';
    }
  }, [input]);

  const stats = useMemo(() => {
    if (!input) return null;
    const chars = input.length;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const lines = input.split('\n').length;
    const hCount = (input.match(/^#{1,6}\s/gm) || []).length;
    const linkCount = (input.match(/\[([^\]]+)\]\([^\)]+\)/g) || []).length;
    const imgCount = (input.match(/!\[([^\]]*)\]\([^\)]+\)/g) || []).length;
    const fences = (input.match(/^```/gm) || []).length;
    const codeCount = Math.floor(fences / 2);
    const listCount = (input.match(/^[\s]*[-*+]\s/gm) || []).length + (input.match(/^\d+\.\s/gm) || []).length;
    return { chars, words, lines, headings: hCount, links: linkCount, images: imgCount, codeBlocks: codeCount, lists: listCount };
  }, [input]);

  const handleInput = useCallback((val: string) => {
    if (val.length > CHAR_LIMIT) return;
    setInput(val);
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      addToast('Please select a .md or .markdown file', 'error');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text.length > CHAR_LIMIT) {
        addToast('File is too large (max 500KB)', 'error');
        return;
      }
      setInput(text);
      addToast(`Loaded ${file.name} (${formatFileSize(file.size)})`, 'success');
    };
    reader.onerror = () => addToast('Failed to read file', 'error');
    reader.readAsText(file);
  }, [addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const clearAll = useCallback(() => {
    setInput('');
    setFileName('');
  }, []);

  const copyHtml = useCallback(async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      addToast('HTML copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy.', 'error');
    }
  }, [html, addToast]);

  const downloadHtml = useCallback(() => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (fileName ? fileName.replace(/\.(md|markdown)$/i, '') : 'document') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [html, fileName]);

  const downloadMd = useCallback(() => {
    if (!input) return;
    const blob = new Blob([input], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [input, fileName]);

  return (
    <div className="w-full max-w-none bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-slate-800 animate-fade-in text-left">
      <div className="bg-[#1a1a1a] text-white rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[80px] italic font-black tracking-tighter">VIEWER</span>
        </div>
        <i className="fas fa-file-alt text-white text-base mt-0.5 relative z-10"></i>
        <div className="space-y-1 relative z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-wider block">File Safety</span>
          <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
            All file processing happens locally in your browser. No content is uploaded to any server.
          </p>
        </div>
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white max-w-xs animate-fade-in ${
                t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1a1a1a] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden">
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">MD</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-white bg-white/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
            <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 mb-2 block"></i>
            <p className="text-sm font-semibold text-slate-300">
              {fileName ? `Loaded: ${fileName}` : 'Drop a .md file here or click to browse'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Supports Markdown (.md, .markdown) files up to 500KB</p>
          </div>

          {/* Markdown Source */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span><i className="fab fa-markdown mr-1"></i>Markdown Source</span>
              <span className="text-[10px] text-slate-500">{input.length}/{CHAR_LIMIT}</span>
            </label>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Paste markdown here, or drop a .md file above..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30 resize-y min-h-[400px] max-h-[800px] placeholder:text-white/20"
            />
          </div>

          {/* Rendered Preview */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span className="flex items-center space-x-3">
                  <span className="flex items-center"><i className="fas fa-eye mr-1"></i>Rendered Preview</span>
                  {html && (
                    <button
                      type="button"
                      onClick={() => setIsFullScreen(true)}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 px-2 py-0.5 rounded flex items-center space-x-1 font-bold animate-fade-in"
                      title="Open Fullscreen Preview"
                    >
                      <i className="fas fa-expand"></i>
                      <span>Fullscreen</span>
                    </button>
                  )}
                  {/* Theme Selector */}
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-black uppercase tracking-wider space-x-0.5 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('light')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        previewTheme === 'light' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('github-dark')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        previewTheme === 'github-dark' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      GitHub Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('brand-dark')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        previewTheme === 'brand-dark' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      #1a1a1a
                    </button>
                  </div>
                </span>
              {stats && (
                <span className="text-[10px] text-slate-500">
                  {stats.chars.toLocaleString()} chars &middot; {stats.words.toLocaleString()} words &middot; {stats.lines} lines
                  {stats.headings > 0 && ` \u00B7 ${stats.headings} hdgs`}
                  {stats.codeBlocks > 0 && ` \u00B7 ${stats.codeBlocks} code`}
                </span>
              )}
            </label>
            <div className={`w-full rounded-xl max-h-[900px] overflow-y-auto border transition-all duration-300 theme-${previewTheme} ${
              previewTheme === 'light'
                ? 'bg-white border-slate-200'
                : previewTheme === 'github-dark'
                ? 'bg-[#0d1117] border-slate-800/80'
                : 'bg-[#1a1a1a] border-slate-800'
            }`}>
              <style dangerouslySetInnerHTML={{ __html: `
                .markdown-body {
                  /* Light theme defaults */
                  --mb-bg-color: #ffffff;
                  --mb-text-color: #24292f;
                  --mb-header-color: #24292f;
                  --mb-border-color: #d0d7de;
                  --mb-code-bg: rgba(175, 184, 193, 0.2);
                  --mb-code-text: #24292f;
                  --mb-pre-bg: #f6f8fa;
                  --mb-pre-text: #24292f;
                  --mb-pre-border: #d0d7de;
                  --mb-link-color: #0969da;
                  --mb-hr-color: #d0d7de;
                  --mb-blockquote-border: #d0d7de;
                  --mb-blockquote-bg: #f6f8fa;
                  --mb-blockquote-text: #57606a;
                  --mb-table-header-bg: #f6f8fa;
                  --mb-table-alt-row-bg: #f6f8fa;
                  --mb-anchor-color: #57606a;

                  background-color: var(--mb-bg-color);
                  color: var(--mb-text-color);
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
                  font-size: 14px;
                  line-height: 1.6;
                  word-wrap: break-word;
                  padding: 2rem;
                  transition: background-color 0.2s, color 0.2s;
                }

                /* GitHub Dark theme rules */
                .theme-github-dark .markdown-body {
                  --mb-bg-color: #0d1117;
                  --mb-text-color: #c9d1d9;
                  --mb-header-color: #f0f6fc;
                  --mb-border-color: #30363d;
                  --mb-code-bg: #21262d;
                  --mb-code-text: #e6edf3;
                  --mb-pre-bg: #161b22;
                  --mb-pre-text: #e6edf3;
                  --mb-pre-border: #21262d;
                  --mb-link-color: #58a6ff;
                  --mb-hr-color: #30363d;
                  --mb-blockquote-border: #30363d;
                  --mb-blockquote-bg: #161b22;
                  --mb-blockquote-text: #8b949e;
                  --mb-table-header-bg: #161b22;
                  --mb-table-alt-row-bg: #161b22;
                  --mb-anchor-color: #8b949e;
                }

                /* Brand Dark theme (#1a1a1a) rules */
                .theme-brand-dark .markdown-body {
                  --mb-bg-color: #1a1a1a;
                  --mb-text-color: #e2e8f0;
                  --mb-header-color: #ffffff;
                  --mb-border-color: #2d3748;
                  --mb-code-bg: #2d3748;
                  --mb-code-text: #f7fafc;
                  --mb-pre-bg: #111111;
                  --mb-pre-text: #e2e8f0;
                  --mb-pre-border: #2d3748;
                  --mb-link-color: #63b3ed;
                  --mb-hr-color: #2d3748;
                  --mb-blockquote-border: #2d3748;
                  --mb-blockquote-bg: #111111;
                  --mb-blockquote-text: #a0aec0;
                  --mb-table-header-bg: #111111;
                  --mb-table-alt-row-bg: #111111;
                  --mb-anchor-color: #a0aec0;
                }

                .markdown-body h1,
                .markdown-body h2,
                .markdown-body h3,
                .markdown-body h4,
                .markdown-body h5,
                .markdown-body h6 {
                  margin-top: 24px;
                  margin-bottom: 16px;
                  font-weight: 600 !important;
                  line-height: 1.25;
                  color: var(--mb-header-color);
                }

                .markdown-body h1 {
                  font-size: 1.8em;
                  padding-bottom: 0.3em;
                  border-bottom: 1px solid var(--mb-border-color);
                }

                .markdown-body h2 {
                  font-size: 1.4em;
                  padding-bottom: 0.3em;
                  border-bottom: 1px solid var(--mb-border-color);
                }

                .markdown-body h3 {
                  font-size: 1.2em;
                }

                .markdown-body h4 {
                  font-size: 1em;
                }

                .markdown-body p {
                  margin-top: 0;
                  margin-bottom: 16px;
                  color: var(--mb-text-color);
                }

                .markdown-body a {
                  color: var(--mb-link-color);
                  text-decoration: none;
                }

                .markdown-body a:hover {
                  text-decoration: underline;
                }

                .markdown-body hr {
                  height: 1px;
                  padding: 0;
                  margin: 24px 0;
                  background-color: var(--mb-hr-color);
                  border: 0;
                }

                .markdown-body blockquote {
                  padding: 0.5em 1em;
                  color: var(--mb-blockquote-text);
                  border-left: 0.25em solid var(--mb-blockquote-border);
                  margin: 0 0 16px 0;
                  background-color: var(--mb-blockquote-bg);
                  border-radius: 4px;
                }

                .markdown-body blockquote p:last-child {
                  margin-bottom: 0;
                }

                .markdown-body ul,
                .markdown-body ol {
                  padding-left: 2em;
                  margin-top: 0;
                  margin-bottom: 16px;
                }

                .markdown-body ul {
                  list-style-type: disc;
                }

                .markdown-body ol {
                  list-style-type: decimal;
                }

                .markdown-body li {
                  margin-top: 0.25em;
                }

                .markdown-body li + li {
                  margin-top: 0.25em;
                }

                /* Tables */
                .markdown-body table {
                  display: block;
                  width: 100%;
                  max-width: 100%;
                  overflow: auto;
                  margin-top: 0;
                  margin-bottom: 16px;
                  border-spacing: 0;
                  border-collapse: collapse;
                }

                .markdown-body table tr {
                  background-color: var(--mb-bg-color);
                  border-top: 1px solid var(--mb-border-color);
                }

                .markdown-body table tr:nth-child(2n) {
                  background-color: var(--mb-table-alt-row-bg);
                }

                .markdown-body table th,
                .markdown-body table td {
                  padding: 8px 14px;
                  border: 1px solid var(--mb-border-color);
                  color: var(--mb-text-color);
                }

                .markdown-body table th {
                  font-weight: 600;
                  background-color: var(--mb-table-header-bg);
                  color: var(--mb-header-color);
                }

                /* Code badges (inline code) */
                .markdown-body code {
                  padding: 0.2em 0.4em;
                  margin: 0;
                  font-size: 85%;
                  white-space: break-spaces;
                  background-color: var(--mb-code-bg);
                  border-radius: 6px;
                  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
                  color: var(--mb-code-text);
                }

                /* Code blocks */
                .markdown-body pre {
                  margin-top: 0;
                  margin-bottom: 16px;
                  padding: 16px;
                  overflow: auto;
                  font-size: 85%;
                  line-height: 1.45;
                  background-color: var(--mb-pre-bg);
                  border-radius: 6px;
                  border: 1px solid var(--mb-pre-border);
                }

                .markdown-body pre code {
                  padding: 0;
                  margin: 0;
                  font-size: 100%;
                  word-break: normal;
                  white-space: pre;
                  background: transparent;
                  border: 0;
                  color: var(--mb-pre-text);
                }

                /* Anchor symbol styles */
                .markdown-body h1:hover .anchor,
                .markdown-body h2:hover .anchor,
                .markdown-body h3:hover .anchor,
                .markdown-body h4:hover .anchor {
                  opacity: 1;
                }

                .markdown-body .anchor {
                  float: left;
                  padding-right: 6px;
                  margin-left: -22px;
                  line-height: 1;
                  opacity: 0;
                  color: var(--mb-anchor-color);
                  transition: opacity 0.2s;
                  display: flex;
                  align-items: center;
                }

                .markdown-body .anchor:hover {
                  color: var(--mb-link-color);
                }

                .markdown-body .octicon-link {
                  display: inline-block;
                  vertical-align: middle;
                  fill: currentColor;
                }
              ` }} />
              {html ? (
                <div className="markdown-body animate-fade-in" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <div className={`flex flex-col items-center justify-center py-20 rounded-xl transition-colors duration-300 ${
                  previewTheme === 'light'
                    ? 'text-slate-400 bg-white'
                    : previewTheme === 'github-dark'
                    ? 'text-slate-500 bg-[#0d1117]'
                    : 'text-slate-500 bg-[#1a1a1a]'
                }`}>
                  <i className="fas fa-file-alt text-4xl mb-3 text-slate-500"></i>
                  <p className="text-sm font-semibold">No content to preview</p>
                  <p className="text-xs mt-1 text-slate-500/70">Type or paste markdown above, or drop a .md file</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={clearAll}
              disabled={!input}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-eraser mr-1"></i>Clear
            </button>
            <div className="flex-1"></div>
            <button
              onClick={copyHtml}
              disabled={!html}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-copy mr-1"></i>Copy HTML
            </button>
            <button
              onClick={downloadHtml}
              disabled={!html}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-file-code mr-1"></i>Download HTML
            </button>
            <button
              onClick={downloadMd}
              disabled={!input}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-file-download mr-1"></i>Download MD
            </button>
          </div>
        </div>
      </div>
      {isFullScreen && (
        <div className={`fixed inset-0 z-50 overflow-y-auto animate-fade-in flex flex-col theme-${previewTheme} ${
          previewTheme === 'light'
            ? 'bg-white text-slate-800'
            : previewTheme === 'github-dark'
            ? 'bg-[#0d1117] text-[#c9d1d9]'
            : 'bg-[#1a1a1a] text-slate-200'
        }`}>
          {/* Header Bar */}
          <div className={`sticky top-0 px-6 py-4 flex items-center justify-between z-10 shadow-sm border-b transition-colors duration-300 ${
            previewTheme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-900'
              : previewTheme === 'github-dark'
              ? 'bg-[#161b22] border-slate-800/80 text-white'
              : 'bg-[#111111] border-slate-850 text-white'
          }`}>
            <div className="flex items-center space-x-2 text-slate-350">
              <i className="fab fa-markdown text-lg text-slate-400"></i>
              <span className={`text-sm font-bold ${previewTheme === 'light' ? 'text-slate-800' : 'text-slate-350'}`}>
                {fileName ? `Preview: ${fileName}` : 'Fullscreen Preview'}
              </span>
            </div>
            
            {/* Header Theme Switcher */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-black uppercase tracking-wider space-x-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTheme('light')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    previewTheme === 'light' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('github-dark')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    previewTheme === 'github-dark' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GitHub Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme('brand-dark')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    previewTheme === 'brand-dark' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  #1a1a1a
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer flex items-center space-x-1 border ${
                  previewTheme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-white/5 border-slate-800 text-white hover:bg-white/10'
                }`}
              >
                <i className="fas fa-compress"></i>
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
            <div className="markdown-body animate-fade-in" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      )}
    </div>
  );
}
