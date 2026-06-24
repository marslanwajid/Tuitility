import React from 'react';
import { Metadata } from 'next';
import { SITE_NAME } from '../../data/siteConfig';

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `Read the ${SITE_NAME} privacy policy. Learn how our calculators and converters process data locally in your browser without transmitting it to external servers.`,
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-6 max-w-4xl mx-auto text-slate-800">
      {/* Header */}
      <section className="mb-12 border-b border-slate-150 pb-8 text-left">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          <i className="fas fa-shield-alt text-[9px]"></i>
          <span>Security &amp; Consent</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
          Last updated: June 24, 2026
        </p>
      </section>

      {/* Main Content */}
      <div className="space-y-10 text-slate-650">
        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-desktop text-xs"></i>
            </span>
            1. Browser-Only Local Processing
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium">
            At <strong>{SITE_NAME}</strong>, we take a fundamentally different approach to your privacy. The vast majority of our conversion, calculation, development, and styling utilities are executed **entirely inside your browser** using local JavaScript and client-side processing.
          </p>
          <p className="text-sm leading-relaxed font-medium">
            When you upload an image to convert, draft an SVG, format source code, or input loan values, those operations run locally on your device. We **never** transmit your content files, text inputs, or private keys to our server. Once the browser page is closed, the processing environment is cleared.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-database text-xs"></i>
            </span>
            2. Information We Collect
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium">
            Because our core calculator tools process data locally, we do not require account registration, email signups, or payment credentials. We only collect the following minimal data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
            <li>
              <strong>Contact &amp; Support Info:</strong> If you submit an inquiry or tool request using our contact form, we collect your name, email, and message body. This information is only processed to respond to your request via Gmail SMTP and is never sold or shared.
            </li>
            <li>
              <strong>Anonymized Site Usage Statistics:</strong> We use Google Tag Manager (GTM) for basic web analytics to understand high-traffic categories and improve site performance. This records standard anonymized parameters (e.g. browser type, duration on site, and button clicks) but **never** accesses or logs your tool inputs.
            </li>
          </ul>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-cookie-bite text-xs"></i>
            </span>
            3. Local Storage and Cookies
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium">
            We use browser-based Local Storage to save specific preference settings for a more convenient user experience:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
            <li>Your theme choices (e.g., light theme vs dark background state).</li>
            <li>Recent inputs or configurations inside tools for your convenience on return visits.</li>
            <li>High scores or states for brain games/puzzles loaded on the dashboard.</li>
          </ul>
          <p className="text-sm leading-relaxed mt-4 font-medium">
            This storage is contained entirely on your computer. You can clear these preferences at any time by clearing your browser cache and cookies.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-user-friends text-xs"></i>
            </span>
            4. Third-Party Integrations
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium">
            Our chatbot utility, <strong>TuitiBot</strong>, provides context-aware assistance by interfacing with the OpenRouter API. Chat interactions are sent to language models for real-time prompt generation and tool suggestions. 
          </p>
          <p className="text-sm leading-relaxed font-medium">
            Do not enter highly sensitive personal or corporate data into the chatbot prompt container. Standard public API terms apply.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-envelope-open-text text-xs"></i>
            </span>
            5. Contact and Inquiries
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            For questions about this Privacy Policy, please reach out to us using the contact form at{' '}
            <a href="/contact" className="text-slate-900 underline font-semibold hover:text-slate-700">
              {SITE_NAME} Contact Page
            </a>{' '}
            or write to us directly at{' '}
            <a href="mailto:wajidmarslan@gmail.com" className="text-slate-900 underline font-semibold hover:text-slate-700">
              wajidmarslan@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
