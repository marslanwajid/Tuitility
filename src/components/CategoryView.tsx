'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import InteractivePlayground from './InteractivePlayground';

interface Tool {
  name: string;
  desc: string;
  url: string;
  category: string;
  icon: string;
}

interface CategoryData {
  name: string;
  url: string;
  icon: string;
  description: string;
  toolCount: number;
  tools: Tool[];
  intro: string;
  detail: string;
  reasons: string[];
  audience: string[];
  useCases: string[];
  priorityTools: Array<{ tool: Tool; priority: { outlook: string; tier: string } }>;
}

interface CategoryViewProps {
  categoryData: CategoryData;
}

export default function CategoryView({ categoryData }: CategoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tools based on search query
  const filteredTools = searchQuery
    ? categoryData.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryData.tools;

  // Animation triggers
  useGSAP(
    () => {
      gsap.fromTo('.cat-tool-card', 
        { scale: 0.96, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }
      );
    },
    { scope: containerRef, dependencies: [searchQuery] }
  );



  const getToolRating = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.5 + (hash % 5) / 10).toFixed(1);
  };

  const getToolUsage = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (10 + (hash % 85)) + 'K+';
  };

  const renderStars = (ratingStr: string) => {
    const rating = parseFloat(ratingStr);
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star text-slate-800"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-slate-800"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fas fa-star text-slate-200"></i>);
    }
    return stars;
  };

  return (
    <div className="flex flex-col gap-16 text-left" ref={containerRef}>
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-fade-in-up">
        
        {/* Floating Category-Specific Backdrop Symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.07]">
          {categoryData.name.toLowerCase() === 'math' && (
            <>
              <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">+</div>
              <div className="absolute bottom-4 left-1/3 text-3xl font-extrabold -rotate-45 animate-float">÷</div>
              <div className="absolute top-10 right-1/4 text-5xl font-black rotate-45 animate-float-delayed">%</div>
              <div className="absolute bottom-10 right-1/3 text-4xl font-extrabold -rotate-12 animate-float">∫</div>
              <div className="absolute top-1/2 right-12 text-3xl font-extrabold rotate-12">π</div>
            </>
          )}
          {categoryData.name.toLowerCase() === 'finance' && (
            <>
              <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">$</div>
              <div className="absolute bottom-4 left-1/3 text-3xl font-extrabold -rotate-45 animate-float">%</div>
              <div className="absolute top-10 right-1/4 text-5xl font-black rotate-45 animate-float-delayed">📈</div>
              <div className="absolute bottom-10 right-1/3 text-4xl font-extrabold -rotate-12 animate-float">💵</div>
            </>
          )}
          {categoryData.name.toLowerCase() === 'science' && (
            <>
              <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">⚛</div>
              <div className="absolute bottom-4 left-1/3 text-3xl font-extrabold -rotate-45 animate-float">🧪</div>
              <div className="absolute top-10 right-1/4 text-5xl font-black rotate-45 animate-float-delayed">🧬</div>
              <div className="absolute bottom-10 right-1/3 text-4xl font-extrabold -rotate-12 animate-float">🌡</div>
            </>
          )}
          {categoryData.name.toLowerCase() === 'utility' && (
            <>
              <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">🛠</div>
              <div className="absolute bottom-4 left-1/3 text-3xl font-extrabold -rotate-45 animate-float">⚙</div>
              <div className="absolute top-10 right-1/4 text-5xl font-black rotate-45 animate-float-delayed">💻</div>
              <div className="absolute bottom-10 right-1/3 text-4xl font-extrabold -rotate-12 animate-float">Base64</div>
            </>
          )}
        </div>

        <div className="space-y-4 max-w-2xl z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200/40">
            <i className={`${categoryData.icon} text-slate-500 mr-1`}></i>
            <span>{categoryData.name} Suite</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
            {categoryData.name} Tools
          </h1>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
            {categoryData.description}
          </p>
        </div>

        {/* 3-Column Premium Stats Board */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-150 rounded-2xl shrink-0 lg:min-w-[360px] z-10">
          <div className="flex flex-col items-center p-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{categoryData.toolCount}</span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider text-center mt-1">Utilities</span>
          </div>
          <div className="flex flex-col items-center p-2.5 border-x border-slate-200/60">
            <span className="text-2xl font-black text-slate-900 tracking-tight">100%</span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider text-center mt-1">Secure</span>
          </div>
          <div className="flex flex-col items-center p-2.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">&lt;1ms</span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider text-center mt-1">Latency</span>
          </div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="max-w-xl">
        <div className="flex items-center relative rounded-full border border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] focus-within:shadow-[0_10px_30px_-6px_rgba(15,23,42,0.06)] focus-within:border-slate-400 transition-all p-1">
          <i className="fas fa-search absolute left-5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder={`Search ${categoryData.name.toLowerCase()} calculators and converters...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-13 pr-10 py-3 bg-transparent rounded-full text-sm sm:text-base text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-3.5 transition-colors"
              aria-label="Clear Search"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-150">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : `All ${categoryData.name} Utilities`}
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
            {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </span>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => {
              const rating = getToolRating(tool.name);
              const usage = getToolUsage(tool.name);
              return (
                <Link
                  key={tool.url}
                  href={tool.url}
                  className="cat-tool-card flex flex-col p-6 bg-white border border-slate-100/80 rounded-3xl hover:border-slate-300 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] transition-all duration-500 group hover:-translate-y-2.5 hover:bg-slate-50/40"
                >
                  <div
                    className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center mb-4.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:border-[#1a1a1a]"
                  >
                    <i className={`${tool.icon} text-sm`}></i>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1a1a1a] font-display relative inline-block max-w-full truncate mb-1">
                    <span className="relative">{tool.name}</span>
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#1a1a1a] group-hover:w-full transition-all duration-300"></span>
                  </h3>
                  
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 group-hover:text-slate-500 transition-colors duration-300 line-clamp-2">
                    {tool.desc}
                  </p>

                  <div className="flex items-center space-x-1.5 mt-4">
                    <div className="flex items-center space-x-0.5 text-[9px] shrink-0">
                      {renderStars(rating)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{rating}</span>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-50 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span>{usage} users</span>
                    <span className="text-slate-800 font-black flex items-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      Run <i className="fas fa-chevron-right ml-0.5 text-[8px]"></i>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto mb-4.5 text-slate-400">
              <i className="fas fa-search text-xl"></i>
            </div>
            <p className="text-lg font-bold text-slate-800 tracking-tight">No tools found</p>
            <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
              No tools in this category match your search term. Try a different term or browse other categories.
            </p>
          </div>
        )}
      </div>

      {/* Programmatic SEO Description Section (Matches Tuitility Core Requirements) */}
      <section className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 md:p-12 space-y-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            About {categoryData.name} Tools
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            {categoryData.intro}
          </p>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            {categoryData.detail}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200/60">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              Why This Matters
            </h3>
            <ul className="space-y-3">
              {categoryData.reasons.map((reason, i) => (
                <li key={i} className="flex items-start text-xs font-medium text-slate-500 leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mr-2.5 mt-2 shrink-0"></span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              Audience &amp; Use Cases
            </h3>
            <ul className="space-y-3">
              {categoryData.audience.map((aud, i) => (
                <li key={i} className="flex items-start text-xs font-medium text-slate-500 leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mr-2.5 mt-2 shrink-0"></span>
                  <span>Ideal for {aud}.</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {categoryData.priorityTools.length > 0 && (
          <div className="pt-8 border-t border-slate-200/60 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              High Priority Opportunities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryData.priorityTools.map(({ tool, priority }) => (
                <Link
                  key={tool.url}
                  href={tool.url}
                  className="p-4 bg-white border border-slate-100/80 rounded-2xl flex flex-col justify-between hover:border-slate-250 transition-colors shadow-sm"
                >
                  <span className="text-xs font-bold text-slate-900">{tool.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">{priority.outlook}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Category Sandbox Quiz/Game */}
      <section className="pt-4 border-t border-slate-150 pt-16">
        <InteractivePlayground category={categoryData.name} />
      </section>
    </div>
  );
}
