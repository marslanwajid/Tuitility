import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { SITE_NAME } from '../../data/siteConfig';

export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}, our privacy-first local utility platform, and our mission to deliver fast, precise, and beautifully designed web calculators.`,
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="py-6 max-w-4xl mx-auto text-slate-800">
      {/* Hero Section */}
      <section className="text-center mb-16 relative overflow-hidden py-12 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/40 rounded-bl-full pointer-events-none"></div>
        <div className="inline-flex items-center space-x-1.5 bg-slate-200/80 border border-slate-300 text-slate-800 rounded-full px-4.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          <i className="fas fa-info-circle text-[10px]"></i>
          <span>Our Story</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          About <span className="text-[#1a1a1a]">{SITE_NAME}</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          We believe digital utilities should be clean, ridiculously fast, and respectful of your privacy. No sign-ups, no ads, and no data tracking.
        </p>
      </section>

      {/* Grid of Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] flex flex-col justify-between hover:border-slate-350 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <i className="fas fa-user-shield text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Privacy-First Architecture</h2>
            <p className="text-sm text-slate-450 leading-relaxed font-medium">
              Unlike typical online conversion and calculator tools that upload your files, images, or numerical data to a backend server, {SITE_NAME} performs calculations and processing **locally in your browser**. Your files never leave your device.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] flex flex-col justify-between hover:border-slate-350 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <i className="fas fa-bolt text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Instant Execution</h2>
            <p className="text-sm text-slate-450 leading-relaxed font-medium">
              By utilizing modern WebAssembly and JavaScript algorithms right in the client, Tuitility eliminates latency. Experience instant calculations, image adjustments, format conversions, and text processing.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] flex flex-col justify-between hover:border-slate-350 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <i className="fas fa-magic text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">Premium Aesthetic</h2>
            <p className="text-sm text-slate-450 leading-relaxed font-medium">
              Utility tools don&apos;t have to look boring or outdated. We put massive effort into crafting a state-of-the-art interface with beautiful typography, intuitive interaction models, responsive flows, and custom themes.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] flex flex-col justify-between hover:border-slate-350 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
              <i className="fas fa-expand-arrows-alt text-lg"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-950 mb-3">100% Free & Open</h2>
            <p className="text-sm text-slate-450 leading-relaxed font-medium">
              All tools are entirely free to use with zero hidden subscriptions, limiters, or processing caps. Access fully featured converters, math algorithms, financial models, and code formatters without barriers.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Detail */}
      <section className="bg-slate-950 text-slate-350 rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-sm sm:text-base leading-relaxed mb-6 font-medium text-slate-300">
            Digital tools are essential for daily workflow, but the web has become cluttered with bloated, ad-ridden utility sites that track your usage and require account creation. 
          </p>
          <p className="text-sm sm:text-base leading-relaxed mb-8 font-medium text-slate-300">
            {SITE_NAME} was founded to clean up this ecosystem. By building a unified dashboard of light, lightning-fast utilities, we aim to respect user privacy, make computation accessible, and deliver premium client-side experiences without compromise.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all active:scale-95 text-sm"
          >
            Explore the Toolbox
            <i className="fas fa-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>
      </section>

      {/* Team / Author Section */}
      <section className="text-center p-8 border border-slate-150 rounded-3xl bg-white mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Designed & Maintained</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">By Developers for Everyone</p>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
          {SITE_NAME} is actively updated to add new features, support more converters, and enhance accuracy. If you have tool requests or feedback, we would love to hear from you.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Contact Us
          </Link>
          <a
            href="https://www.linkedin.com/in/arslan-wajid/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-all active:scale-95"
          >
            <i className="fab fa-linkedin mr-2"></i>
            LinkedIn
          </a>
        </div>
      </section>
    </div>
  );
}
