import React from 'react';
import { Metadata } from 'next';
import { SITE_NAME } from '../../data/siteConfig';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${SITE_NAME}`,
  description: `Review the ${SITE_NAME} terms of use. Understand guidelines for using our free local utilities, liability limits, and general site conditions.`,
  alternates: {
    canonical: '/terms-and-conditions',
  },
};

export default function TermsPage() {
  return (
    <div className="py-6 max-w-4xl mx-auto text-slate-800">
      {/* Header */}
      <section className="mb-12 border-b border-slate-150 pb-8 text-left">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
          <i className="fas fa-file-contract text-[9px]"></i>
          <span>Usage Guidelines</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
          Terms &amp; Conditions
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
              <i className="fas fa-handshake text-xs"></i>
            </span>
            1. Agreement to Terms
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            By accessing or using the services, online calculators, converters, code utilities, and developer sandboxes provided by <strong>{SITE_NAME}</strong>, you agree to comply with and be bound by these Terms &amp; Conditions. If you do not agree to these terms, you are not authorized to use the website.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-check-circle text-xs"></i>
            </span>
            2. Permitted Use &amp; Browser Execution
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium">
            {SITE_NAME} is provided free of charge for your personal and professional use. Our tools execute scripts dynamically within your browser sandbox. 
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm font-medium">
            <li>You agree not to bypass, disable, or tamper with security structures, script boundaries, or API limits.</li>
            <li>You must not automate queries, scraping processes, or trigger denial-of-service behaviors on our servers or routing interfaces.</li>
            <li>You remain solely responsible for the content you process (such as SVG text, source code files, and images) and for compliance with local legal requirements.</li>
          </ul>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3 bg-rose-50/10 p-1 rounded-xl">
            <span className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-250 flex items-center justify-center text-amber-900 shrink-0">
              <i className="fas fa-exclamation-triangle text-xs"></i>
            </span>
            3. Disclaimer of Accuracy &amp; Warranties
          </h2>
          <p className="text-sm leading-relaxed mb-4 font-medium text-amber-900 bg-amber-50/40 p-4 border border-amber-150 rounded-2xl">
            <strong>IMPORTANT NOTICE:</strong> All calculators, conversions, and algorithms on {SITE_NAME} are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind. 
          </p>
          <p className="text-sm leading-relaxed font-medium">
            While we strive for absolute mathematical precision, currency update timeliness, and tool accuracy, calculations can output incorrect values due to browser rendering differences, floating-point limitations, or stale configuration variables. Do not rely on our financial, mortgage, health, or mathematical tools for critical personal, scientific, or commercial transactions. Always cross-reference values independently.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-ban text-xs"></i>
            </span>
            4. Limitation of Liability
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            In no event shall {SITE_NAME}, its developer team, or its affiliates be held liable for any direct, indirect, incidental, consequential, special, or exemplary damages (including but not limited to loss of data, loss of financial assets, conversion errors, or browser crashes) resulting from the use of, or inability to use, this site.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-copyright text-xs"></i>
            </span>
            5. Intellectual Property
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            The code layouts, styles, dynamic script structures, branding designs, and graphics are the proprietary intellectual property of {SITE_NAME}. You may not copy, republish, or redistribute our calculator logic templates or stylesheets without explicit written permission.
          </p>
        </section>

        <section className="p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0">
              <i className="fas fa-sync-alt text-xs"></i>
            </span>
            6. Changes to Terms
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            We reserve the right to revise or modify these terms at any time without prior notice. By continuing to use the website after updates are published, you accept and agree to the modified Terms &amp; Conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
