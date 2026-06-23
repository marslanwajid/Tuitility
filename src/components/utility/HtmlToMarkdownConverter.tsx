'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { markdownToHtml, encodeEntities } from '@/lib/md';

type Mode = 'to-markdown' | 'to-html';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const CHAR_LIMIT = 100000;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function htmlToMarkdown(html: string): string {
  let md = html;

  // Decode entities first
  md = decodeEntities(md);

  // Normalize whitespace between tags
  md = md.replace(/>\s+</g, '><');
  md = md.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Headers
  md = md.replace(/<h1[\s\S]*?>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[\s\S]*?>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[\s\S]*?>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[\s\S]*?>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[\s\S]*?>(.*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[\s\S]*?>(.*?)<\/h6>/gi, '\n###### $1\n');

  // Horizontal rules
  md = md.replace(/<hr[\s\S]*?>/gi, '\n---\n');

  // Line breaks
  md = md.replace(/<br[\s\S]*?>/gi, '  \n');

  // Paragraphs
  md = md.replace(/<p[\s\S]*?>(.*?)<\/p>/gi, '\n\n$1\n\n');

  // Bold / Strong
  md = md.replace(/<(?:strong|b)[\s\S]*?>(.*?)<\/(?:strong|b)>/gi, '**$1**');

  // Italic / Em
  md = md.replace(/<(?:em|i)[\s\S]*?>(.*?)<\/(?:em|i)>/gi, '*$1*');

  // Strikethrough
  md = md.replace(/<(?:del|s|strike)[\s\S]*?>(.*?)<\/(?:del|s|strike)>/gi, '~~$1~~');

  // Links
  md = md.replace(/<a[\s\S]*?href="([^"]*)"[\s\S]*?>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<a[\s\S]*?href='([^']*)'[\s\S]*?>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[\s\S]*?src="([^"]*)"[\s\S]*?alt="([^"]*)"[\s\S]*?>/gi, '![$2]($1)');
  md = md.replace(/<img[\s\S]*?src='([^']*)'[\s\S]*?alt='([^']*)'[\s\S]*?>/gi, '![$2]($1)');
  md = md.replace(/<img[\s\S]*?src="([^"]*)"[\s\S]*?>/gi, '![]($1)');
  md = md.replace(/<img[\s\S]*?src='([^']*)'[\s\S]*?>/gi, '![]($1)');

  // Blockquotes
  md = md.replace(/<blockquote[\s\S]*?>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    return '\n' + content.trim().split('\n').map((l: string) => '> ' + l.trim()).join('\n') + '\n';
  });

  // Code blocks (pre > code)
  md = md.replace(/<pre[\s\S]*?><code[\s\S]*?>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');

  // Inline code
  md = md.replace(/<code[\s\S]*?>(.*?)<\/code>/gi, '`$1`');

  // Tables
  md = md.replace(/<table[\s\S]*?>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[] = [];
    let hdr: string[] = [];
    const rowMatch = tableContent.match(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi);
    if (!rowMatch) return _;

    rowMatch.forEach((row: string, ri: number) => {
      const cells: string[] = [];
      const cellMatch = row.match(/<(?:th|td)[\s\S]*?>([\s\S]*?)<\/(?:th|td)>/gi);
      if (cellMatch) {
        cellMatch.forEach((c: string) => {
          const inner = c.replace(/<(?:\/)?(?:th|td)[\s\S]*?>/gi, '').trim().replace(/\s+/g, ' ');
          cells.push(inner);
        });
      }
      if (ri === 0) {
        hdr = cells;
      }
      rows.push('| ' + cells.join(' | ') + ' |');
    });

    if (hdr.length > 0) {
      const sep = '| ' + hdr.map(() => '---').join(' | ') + ' |';
      rows.splice(1, 0, sep);
    }
    return '\n' + rows.join('\n') + '\n';
  });

  // Unordered lists
  md = md.replace(/<ul[\s\S]*?>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return '\n' + convertListItems(content.trim(), 0) + '\n';
  });

  // Ordered lists
  md = md.replace(/<ol[\s\S]*?>([\s\S]*?)<\/ol>/gi, (_, content) => {
    return '\n' + convertListItems(content.trim(), 1) + '\n';
  });

  // Strip remaining HTML tags (div, span, etc.), keep content
  md = md.replace(/<[\/]?(?:div|span|section|article|main|header|footer|nav|aside|figure|figcaption|time|mark|small|sub|sup|u|ins|center|font|label)[^>]*>/gi, '');

  // Cleanup
  md = md.replace(/^\s+|\s+$/gm, (s) => s.trim() ? s : '');
  md = md.replace(/\n{4,}/g, '\n\n\n');
  md = md.trim();

  return md;
}

function convertListItems(content: string, type: number, depth = 0): string {
  const indent = '  '.repeat(depth);
  const liRegex = /<li[\s\S]*?>([\s\S]*?)<\/li>/gi;
  let result = '';
  const items: string[] = [];
  let m: RegExpExecArray | null;
  const regex = new RegExp(liRegex.source, 'gi');
  while ((m = regex.exec(content)) !== null) {
    items.push(m[1]);
  }

  items.forEach((item, idx) => {
    const prefix = type === 0 ? '-' : `${idx + 1}.`;
    // Extract any nested lists inside this li
    let nested = '';
    let cleanItem = item
      .replace(/<ul[\s\S]*?>([\s\S]*?)<\/ul>/gi, (_, nc) => {
        nested += '\n' + convertListItems(nc, 0, depth + 1);
        return '';
      })
      .replace(/<ol[\s\S]*?>([\s\S]*?)<\/ol>/gi, (_, nc) => {
        nested += '\n' + convertListItems(nc, 1, depth + 1);
        return '';
      });
    // Clean remaining tags from item text
    cleanItem = cleanItem.replace(/<[^>]*>/g, '').trim();
    result += indent + prefix + ' ' + cleanItem + '\n' + nested;
  });

  return result;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function countLines(text: string): number {
  return text ? text.split('\n').length : 0;
}

export default function HtmlToMarkdownConverter() {
  const [mode, setMode] = useState<Mode>('to-markdown');
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const output = useMemo(() => {
    if (!input) return '';
    try {
      if (mode === 'to-markdown') return htmlToMarkdown(input);
      return markdownToHtml(input);
    } catch {
      return 'Error: Could not convert. Please check your input.';
    }
  }, [input, mode]);

  const handleInput = useCallback((val: string) => {
    if (val.length > CHAR_LIMIT) return;
    setInput(val);
  }, []);

  const clearAll = useCallback(() => {
    setInput('');
  }, []);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      addToast('Copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy.', 'error');
    }
  }, [output, addToast]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const ext = mode === 'to-markdown' ? 'md' : 'html';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, mode]);

  const inputStats = useMemo(() => ({
    chars: input.length,
    words: countWords(input),
    lines: countLines(input),
  }), [input]);

  const outputStats = useMemo(() => ({
    chars: output.length,
    words: countWords(output),
    lines: countLines(output),
  }), [output]);

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
            All conversion happens 100% locally inside your browser. No content ever leaves your device.
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
          <span className="text-white/[0.03] text-[120px] italic font-black tracking-tighter">MARKDOWN</span>
        </div>

        <div className="relative z-10 p-5 md:p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-1.5 border border-white/10">
            <button
              onClick={() => { setMode('to-markdown'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'to-markdown' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fab fa-html5 mr-1"></i>HTML → Markdown
            </button>
            <button
              onClick={() => { setMode('to-html'); setInput(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                mode === 'to-html' ? 'bg-white text-[#1a1a1a]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <i className="fab fa-markdown mr-1"></i>Markdown → HTML
            </button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">In Chars</span>
              <span className="text-xs font-bold text-white">{inputStats.chars.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">In Words</span>
              <span className="text-xs font-bold text-white">{inputStats.words.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">In Lines</span>
              <span className="text-xs font-bold text-white">{inputStats.lines.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">Out Chars</span>
              <span className="text-xs font-bold text-white">{outputStats.chars.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">Out Words</span>
              <span className="text-xs font-bold text-white">{outputStats.words.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase block">Out Lines</span>
              <span className="text-xs font-bold text-white">{outputStats.lines.toLocaleString()}</span>
            </div>
          </div>

          {/* Editor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span><i className="fas fa-arrow-right-to-bracket mr-1"></i>{mode === 'to-markdown' ? 'HTML Input' : 'Markdown Input'}</span>
                <span className="text-[10px] text-slate-500">{input.length}/{CHAR_LIMIT}</span>
              </label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={mode === 'to-markdown' ? 'Paste your HTML here...' : 'Paste your Markdown here...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/30 resize-y min-h-[280px] max-h-[480px] placeholder:text-white/20"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                <span><i className="fas fa-arrow-right-from-bracket mr-1"></i>{mode === 'to-markdown' ? 'Markdown Output' : 'HTML Output'}</span>
                <div className="flex space-x-2">
                  <button onClick={copyOutput} disabled={!output} className="text-[10px] text-slate-400 hover:text-white disabled:text-slate-600 transition-colors" title="Copy to clipboard">
                    <i className="fas fa-copy mr-1"></i>Copy
                  </button>
                  <button onClick={downloadOutput} disabled={!output} className="text-[10px] text-slate-400 hover:text-white disabled:text-slate-600 transition-colors" title="Download file">
                    <i className="fas fa-download mr-1"></i>Download
                  </button>
                </div>
              </label>
              <textarea
                value={output}
                readOnly
                placeholder="Converted output will appear here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono resize-y min-h-[280px] max-h-[480px] placeholder:text-white/20 cursor-default"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={clearAll}
              disabled={!input}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-eraser mr-1"></i>Clear
            </button>
            <button
              onClick={() => setShowPreview((p) => !p)}
              disabled={!output}
              className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <i className={`fas ${showPreview ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>{showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {/* Live Preview (only when output is HTML) */}
          {showPreview && output && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
                <i className="fas fa-eye mr-1"></i>Live Preview
              </span>
              <div className="bg-white rounded-xl p-5 text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 prose-strong:text-slate-900 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
                {mode === 'to-html' ? (
                  <div dangerouslySetInnerHTML={{ __html: output }} />
                ) : (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">{output}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
