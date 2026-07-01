'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { allTools } from '../data/allTools';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const RequestForm = ({ onSubmit, onCancel }: { onSubmit: (name: string, email: string, details: string) => Promise<void>; onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(name, email, details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-slate-900/90 border border-slate-700/50 rounded-xl p-3.5 space-y-2.5 shadow-xl text-left">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5 select-none">
        <i className="fas fa-envelope"></i> Request a Tool / Feature
      </div>
      {error && <div className="text-[10px] text-red-400 font-semibold">{error}</div>}
      <div className="space-y-1.5">
        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors" />
        <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} disabled={isSubmitting}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors" />
        <textarea placeholder="Describe what you want this tool to do..." value={details} onChange={e => setDetails(e.target.value)} disabled={isSubmitting} rows={3}
          className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg p-2.5 text-[11px] text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 transition-colors scrollbar-thin" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} disabled={isSubmitting}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[10px] font-bold text-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[10px] font-bold text-white rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
          {isSubmitting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>} Submit
        </button>
      </div>
    </form>
  );
};

// Known valid non-tool pages
const VALID_PAGES: Record<string, string> = {
  '/about': 'About Us',
  '/contact': 'Contact Us',
  '/privacy-policy': 'Privacy Policy',
  '/terms-and-conditions': 'Terms & Conditions',
  '/math': 'Math Tools',
  '/finance': 'Finance Tools',
  '/science': 'Science Tools',
  '/health': 'Health Tools',
  '/utility-tools': 'Utility Tools',
  '/knowledge': 'Knowledge Tools',
};

function isValidUrl(url: string): boolean {
  if (VALID_PAGES[url]) return true;
  return allTools.some(t => t.url === url);
}

const renderFormattedContent = (content: string) => {
  // Pre-process: convert "Link: /path" format to markdown link format
  let processed = content.replace(/Link:\s*(\/[a-zA-Z0-9\-_/]+)/g, (_match, url: string) => {
    const tool = allTools.find(t => t.url === url);
    if (tool) return `[${tool.name}](${url})`;
    if (VALID_PAGES[url]) return `[${VALID_PAGES[url]}](${url})`;
    // Not a real URL — keep as plain text
    return url;
  });

  // Split on: **bold**, [label](url), and standalone /paths
  const parts = processed.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|\/(?:math|finance|science|health|utility-tools|utility|knowledge|image-tools|about|contact|privacy-policy|terms-and-conditions)(?:\/[a-zA-Z0-9\-_/]+)?)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const mid = part.indexOf('](');
      const label = part.slice(1, mid);
      const url = part.slice(mid + 2, -1);
      // Only render as link if URL is a real tool/page
      if (!isValidUrl(url)) {
        return <span key={index}>{label}</span>;
      }
      return (
        <a key={index} href={url} className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors">
          {label}
        </a>
      );
    }
    if (part.startsWith('/')) {
      const tool = allTools.find(t => t.url === part);
      if (tool) {
        return (
          <a key={index} href={part} className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors">
            {tool.name}
          </a>
        );
      }
      if (VALID_PAGES[part]) {
        return (
          <a key={index} href={part} className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors">
            {VALID_PAGES[part]}
          </a>
        );
      }
      // Not a real URL — render as plain text, don't make it clickable
      return <span key={index}>{part}</span>;
    }
    return part;
  });
};

const STORAGE_KEY = 'tuitility_chat_history';
const MAX_MESSAGES = 100;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MESSAGES)));
  } catch { /* storage full */ }
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');

    const userMsg: Message = { id: generateId(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    setIsStreaming(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: Message = { id: generateId(), role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          let parsed;
          try {
            parsed = JSON.parse(trimmed);
          } catch {
            continue;
          }
          if (parsed.content) {
            assistantContent += parsed.content;
            setMessages(prev => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.id === assistantMsg.id) {
                updated[updated.length - 1] = { ...last, content: assistantContent };
              }
              return updated;
            });
          }
          if (parsed.error) throw new Error(parsed.error);
        }
      }

      // If AI responded with REQUEST_TOOL_FORM, replace that message with the form
      if (assistantContent.includes('REQUEST_TOOL_FORM')) {
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? {
          ...m,
          content: 'SHOW_REQUEST_FORM'
        } : m));
      } else if (!assistantContent.trim()) {
        // If stream completed but no content was received, show fallback
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.id === assistantMsg.id) {
            updated[updated.length - 1] = { ...last, content: 'Hmm, I didn\'t get a response. Please try again! 🔄' };
          }
          return updated;
        });
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Something went wrong';
      addToast(errMsg, 'error');
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1]?.content === '') {
          return prev.slice(0, -1);
        }
        const errMsg: Message = { id: generateId(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        return [...prev, errMsg];
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, addToast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    addToast('Chat cleared', 'info');
  }, [addToast]);

  const handleRequestSubmit = useCallback(async (msgId: string, name: string, email: string, details: string) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        subject: 'AI Chatbot Tool Request',
        message: details,
        formType: 'chatbot-request',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit request.');
    }
    setMessages(prev => prev.map(m => m.id === msgId ? {
      ...m,
      content: `✅ **Request Submitted Successfully!**\n\nThank you, **${name}**. We have sent your tool request details to our development team. We will get back to you at **${email}** once the tool is ready or if we need further information!`
    } : m));
    addToast('Request sent successfully!', 'success');
  }, [addToast]);

  const handleRequestCancel = useCallback((msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  }, []);

  const handleSendRequest = useCallback(() => {
    setMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: 'SHOW_REQUEST_FORM' }]);
  }, []);

  return (
    <div className="relative">
      {/* Toasts */}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`pointer-events-auto px-4 py-2 rounded-xl text-[11px] font-bold shadow-2xl transition-all duration-300 animate-fade-in-up ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
            <i className={`fas ${t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-1.5`}></i>
            {t.message}
          </div>
        ))}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[550px] bg-[#1a1a1a]/95 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-fade-in-up z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-[#1a1a1a] rounded-full flex items-center justify-center text-xs">🤖</span>
              <div>
                <span className="text-xs font-bold text-slate-200">TuitiBot</span>
                <span className="text-[9px] text-slate-500 block leading-tight">AI Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={handleClearChat}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer">
                <i className="fas fa-trash-alt mr-1"></i>Clear
              </button>
              <button type="button" onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer">
                <i className="fas fa-times text-[11px]"></i>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <div className="text-3xl mb-3">👋</div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Hi! I&apos;m TuitiBot</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                  Ask me about any tool on Tuitility — try &quot;fraction calculator&quot; or &quot;pdf merger&quot;
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {['Image Converter', 'PDF Merger', 'QR Code', 'Password'].map(s => (
                    <button key={s} type="button" onClick={() => setInput(s)}
                      className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/40 text-[10px] text-slate-400 rounded-lg transition-all cursor-pointer">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => {
              const matchedToolsInMessage = allTools.filter(tool => msg.content.includes(tool.url));
              const isForm = msg.role === 'assistant' && msg.content === 'SHOW_REQUEST_FORM';

              return (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {isForm ? (
                    <RequestForm
                      onSubmit={(name, email, details) => handleRequestSubmit(msg.id, name, email, details)}
                      onCancel={() => handleRequestCancel(msg.id)}
                    />
                  ) : (
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap break-words ${msg.role === 'user'
                      ? 'bg-slate-700/40 border border-slate-600/50 text-slate-200'
                      : 'bg-slate-800/40 border border-slate-700/40 text-slate-300'
                      }`}>
                      {renderFormattedContent(msg.content)}
                    </div>
                  )}

                  {/* Render matching tool suggestion cards */}
                  {!isForm && matchedToolsInMessage.length > 0 && (
                    <div className="w-[85%] space-y-2 mt-1.5 animate-fade-in-up">
                      {matchedToolsInMessage.map(tool => (
                        <a key={tool.url} href={tool.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all hover:scale-[1.01] active:scale-98 group">
                          <div className="w-8 h-8 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-xs shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i className={`${tool.icon || 'fas fa-cog'}`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</div>
                            <div className="text-[9px] text-slate-500 truncate">{tool.desc}</div>
                          </div>
                          <i className="fas fa-external-link-alt text-[9px] text-slate-600 group-hover:text-blue-400 transition-colors mr-1"></i>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-800/60 p-3 bg-slate-900/30">
            <div className="flex items-end gap-2">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask about a tool..."
                rows={1}
                className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-slate-500/50 transition-colors max-h-24 scrollbar-thin" />
              <button type="button" onClick={handleSend} disabled={!input.trim() || isStreaming}
                className="px-3.5 py-2.5 bg-[#1a1a1a] hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[9px] text-slate-600">Whole Website's Tools AI</span>
              <button type="button" onClick={handleSendRequest}
                className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <i className="fas fa-envelope mr-1"></i>Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button type="button" onClick={() => setIsOpen(o => !o)}
        className={`w-14 h-14 bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded-full border border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none ${isOpen ? 'rotate-45' : ''}`}
        aria-label="Toggle Chatbot">
        <i className={`fas fa-${isOpen ? 'times' : 'comment-dots'} text-lg transition-transform duration-300`}></i>
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}
