'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Feedback');
  const [rawMessage, setRawMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !rawMessage.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: category,
          message: rawMessage.trim(),
          formType: 'contact',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setCategory('Feedback');
        setRawMessage('');
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again later.');
      }
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage('Failed to connect to the email server. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto text-slate-800">
      {/* Header Section */}
      <section className="text-left mb-12 border-b border-slate-150 pb-8">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          <i className="fas fa-envelope text-[9px]"></i>
          <span>Get In Touch</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
          Contact Us
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl">
          Have feedback, found a bug, or want to request a new tool? Drop us a message, and our team will get back to you.
        </p>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 bg-slate-950 text-slate-350 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03),transparent)] pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-6">Contact Info</h2>
              
              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Direct Email</h3>
                    <a href="mailto:wajidmarslan@gmail.com" className="text-white hover:underline font-semibold transition-all">
                      wajidmarslan@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Response Time</h3>
                    <p className="text-slate-300 font-semibold leading-relaxed">
                      We check inquiries daily. Expect a response within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <i className="fas fa-laptop-code"></i>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Local Processing</h3>
                    <p className="text-slate-300 font-semibold leading-relaxed">
                      Your calculations are processed locally. Only form submissions reach our support desk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Looking for Instant Help?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-4">
              Try chatting with TuitiBot, our AI companion located on the bottom right. It can find calculators, explain concepts, and direct you to the right tools.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-slate-700 transition-colors"
            >
              Go to Home Screen
              <i className="fas fa-arrow-right ml-2 text-[9px]"></i>
            </Link>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-8">
          <div className="p-8 sm:p-10 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
            {submitStatus === 'success' ? (
              /* Success Message Container */
              <div className="text-center py-10 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center mx-auto text-slate-900 shadow-sm animate-scaleUp">
                  <i className="fas fa-check text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Message Sent Successfully!</h2>
                  <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. We have received your inquiry and will review it promptly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-[0_4px_12px_-4px_rgba(15,23,42,0.3)]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="name" className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="email" className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Inquiry Category */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="category" className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                    Category of Inquiry
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 transition-all appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="Feedback">Feedback / Suggestions</option>
                      <option value="Bug Report">Report a Bug / Tool Error</option>
                      <option value="Tool Request">Request a New Calculator / Tool</option>
                      <option value="Business">Partnership / Advertising</option>
                      <option value="Other">Other Issues</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="message" className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    placeholder="Provide details about your query..."
                    value={rawMessage}
                    onChange={(e) => setRawMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all resize-none disabled:opacity-50"
                  ></textarea>
                </div>

                {/* Status Indicator Messages */}
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-150 rounded-2xl text-rose-800 text-xs font-semibold animate-fadeIn">
                    <i className="fas fa-exclamation-circle text-sm shrink-0"></i>
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-300 shadow-[0_10px_20px_-8px_rgba(15,23,42,0.3)] active:scale-95 disabled:opacity-50 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Inquiry...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2.5"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
