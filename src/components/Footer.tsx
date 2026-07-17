'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toolCategories } from '../data/toolCategories';
import { SITE_NAME } from '../data/siteConfig';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="inline-block relative w-36 h-10 filter brightness-0 invert">
              <Image
                src="/images/logo.png"
                alt={SITE_NAME}
                fill
                sizes="(max-width: 144px) 100vw, 144px"
                className="object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your ultimate destination for free online calculators and tools. Accurate, fast, and reliable calculations for all your needs.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">100+</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Tools</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">24/7</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Available</span>
              </div>
            </div>
            
            <a
              href="https://json-prompt-generator.vercel.app"
              className="flex items-center p-3 bg-slate-800/40 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden mr-3 shrink-0 bg-slate-800 flex items-center justify-center border border-slate-700">
                <Image 
                  src="/images/logo-prompt-genetaor.png" 
                  alt="JSON Prompt Generator" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">Other AI Tool Site</span>
                <strong className="block text-xs font-bold text-white group-hover:text-slate-200 transition-colors mt-0.5 truncate">
                  JSON Prompt Generator
                </strong>
                <span className="block text-[10px] text-slate-500 truncate">
                  Generate structured prompt JSONs for AI workflows.
                </span>
              </div>
            </a>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {toolCategories.map((category) => (
                  <Link
                    key={category.url}
                    href={category.url}
                    className="text-sm hover:text-white transition-colors flex items-center space-x-2 py-1 group"
                  >
                    <i className={`${category.icon} text-slate-500 group-hover:text-white transition-colors text-xs`}></i>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tools */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Popular Tools
              </h3>
              <div className="flex flex-col space-y-2.5">
                <Link href="/math/calculators/percentage-calculator" className="text-sm hover:text-white transition-colors">
                  Percentage Calculator
                </Link>
                <Link href="/finance/calculators/mortgage-calculator" className="text-sm hover:text-white transition-colors">
                  Mortgage Calculator
                </Link>
                <Link href="/health/calculators/bmi-calculator" className="text-sm hover:text-white transition-colors">
                  BMI Calculator
                </Link>
                <Link href="/math/calculators/fraction-calculator" className="text-sm hover:text-white transition-colors">
                  Fraction Calculator
                </Link>
                <Link href="/utility-tools/password-generator" className="text-sm hover:text-white transition-colors">
                  Password Generator
                </Link>
                <Link href="/knowledge/calculators/age-calculator" className="text-sm hover:text-white transition-colors">
                  Age Calculator
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Support & Info
              </h3>
              <div className="flex flex-col space-y-2 text-sm">
                <Link href="/about" className="hover:text-white transition-colors py-0.5">
                  About Us
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors py-0.5">
                  Contact
                </Link>
                <Link href="/privacy-policy" className="hover:text-white transition-colors py-0.5">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors py-0.5">
                  Terms &amp; Conditions
                </Link>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
                    }
                  }}
                  className="hover:text-white transition-colors py-0.5 text-left cursor-pointer focus:outline-none"
                >
                  Cookie Preferences
                </button>
              </div>
              <div className="pt-2 flex flex-col space-y-2">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Get in Touch</h4>
                <a
                  href="mailto:wajidmarslan@gmail.com"
                  className="text-xs flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                >
                  <i className="fas fa-envelope text-slate-500 group-hover:text-white"></i>
                  <span>wajidmarslan@gmail.com</span>
                </a>
                <p className="text-[10px] text-slate-500 flex items-center space-x-2">
                  <i className="fas fa-clock text-slate-600"></i>
                  <span>24/7 Free Online Tools</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; 2026 {SITE_NAME}. All rights reserved.</p>
          <p>
            Developed by{' '}
            <a
              href="https://www.linkedin.com/in/arslan-wajid/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Arslan Wajid
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
