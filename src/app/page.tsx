'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Calculator from '../components/Calculator';
import InteractivePlayground from '../components/InteractivePlayground';
import { toolCategories } from '../data/toolCategories';
import { allTools } from '../data/allTools';
import { featuredToolPaths, popularToolOverrides } from '../data/siteConfig';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load popular tools
  const popularTools = Object.entries(popularToolOverrides)
    .map(([path, meta]) => {
      const tool = allTools.find((entry) => entry.url === path);
      return tool ? { ...tool, ...meta } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Load featured tools
  const featuredTools = featuredToolPaths
    .map((path) => allTools.find((tool) => tool.url === path))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Filter tabs list
  const filterTabs = [
    { id: 'all', title: 'All Tools', icon: 'fas fa-th-large' },
    { id: 'math', title: 'Math', icon: 'fas fa-calculator' },
    { id: 'finance', title: 'Finance', icon: 'fas fa-dollar-sign' },
    { id: 'science', title: 'Science', icon: 'fas fa-atom' },
    { id: 'health', title: 'Health', icon: 'fas fa-heartbeat' },
    { id: 'utility', title: 'Utility', icon: 'fas fa-tools' },
    { id: 'knowledge', title: 'Knowledge', icon: 'fas fa-brain' },
  ];

  // Filter tools logic
  const filteredTools = searchQuery
    ? allTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeFilter === 'all'
    ? allTools
    : allTools.filter((tool) => tool.category.toLowerCase() === activeFilter.toLowerCase() || 
        (activeFilter.toLowerCase() === 'utility' && tool.category.toLowerCase() === 'utility')
      );



  const renderStars = (rating: number) => {
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

  // GSAP Animations on Scroll / Load
  useGSAP(
    () => {
      // Hero entrance
      gsap.fromTo('.hero-animate-up', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      gsap.fromTo('.hero-animate-calc', 
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.2)', delay: 0.3 }
      );

      // Stagger categories grid
      gsap.fromTo('.cat-card', 
        { scale: 0.96, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cat-grid',
            start: 'top 85%',
          },
        }
      );

      // Stagger popular calculators showcase
      gsap.fromTo('.popular-card', 
        { scale: 0.96, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.popular-grid',
            start: 'top 85%',
          },
        }
      );

      // Stagger featured calculators showcase
      gsap.fromTo('.featured-card', 
        { scale: 0.96, opacity: 0, y: 20 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.featured-grid',
            start: 'top 85%',
          },
        }
      );

      // Stagger elements in homepage playground section
      gsap.fromTo('.homepage-playground-section',
        { scale: 0.98, opacity: 0, y: 30 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.homepage-playground-section',
            start: 'top 85%',
          },
        }
      );
    },
    { scope: containerRef }
  );

  // Stagger all tools registry when filter/search changes
  useGSAP(
    () => {
      if (filteredTools.length > 0) {
        gsap.fromTo('.registry-card', 
          { scale: 0.96, opacity: 0, y: 15 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef, dependencies: [activeFilter, searchQuery] }
  );

  return (
    <div className="flex flex-col gap-24 py-6 text-slate-800" ref={containerRef}>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-8 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 flex flex-col space-y-7 text-left z-10">
            <div className="hero-animate-up inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 w-fit shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-slate-900 animate-ping"></span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800">Premium Digital Toolbox</span>
            </div>
            
            <h1 className="hero-animate-up text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Fast, Precise &amp; <br />
              <span className="text-[#1a1a1a]">Stunning Tools</span>
            </h1>
            
            <p className="hero-animate-up text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
              Discover a curated suite of 100+ browser-based utility tools, financial guides, and math solvers. Built for absolute speed and gorgeous clarity.
            </p>
            
            <div className="hero-animate-up flex flex-wrap gap-4 pt-2">
              <Link
                href="/math"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-300 shadow-[0_10px_20px_-8px_rgba(15,23,42,0.3)] active:scale-95 group hover:-translate-y-0.5"
              >
                <i className="fas fa-calculator mr-2.5 text-slate-400 group-hover:text-white transition-colors"></i>
                Start Calculating
              </Link>
              <Link
                href="/utility-tools"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-slate-700 font-bold border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm active:scale-95 group hover:-translate-y-0.5"
              >
                <i className="fas fa-tools mr-2.5 text-slate-400 group-hover:text-slate-600 transition-colors"></i>
                Browse Utilities
              </Link>
            </div>

            {/* Stats block */}
            <div className="hero-animate-up grid grid-cols-3 gap-6 pt-8 max-w-md border-t border-slate-150">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">100+</span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Free Tools</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Zero</span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Installs</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Local</span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Processing</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Calculator Area */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end hero-animate-calc relative lg:pr-10 w-full">
            <div className="relative animate-float w-full max-w-[410px]">
              {/* Floating Mathematical Badges */}
              <div className="absolute -top-8 -left-8 w-11 h-11 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md animate-float-delayed -rotate-12 z-20">
                <span className="font-display font-black text-[#1a1a1a] text-base">+</span>
              </div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-12 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md animate-float rotate-12 z-20" style={{ animationDelay: '1.5s' }}>
                <span className="font-display font-black text-[#1a1a1a] text-lg">%</span>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-11 h-11 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-md animate-float-delayed -rotate-6 z-20" style={{ animationDelay: '0.8s' }}>
                <span className="font-display font-black text-[#1a1a1a] text-base">∫</span>
              </div>
              <div className="absolute top-6 -right-3 w-10 h-10 bg-white border border-slate-200/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm animate-float rotate-45 z-20" style={{ animationDelay: '2.2s' }}>
                <span className="font-display font-extrabold text-[#1a1a1a] text-sm">π</span>
              </div>

              <Calculator />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore Categories Grid */}
      <section className="py-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <i className="fas fa-th-large text-[9px]"></i>
            <span>Browse Categories</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Choose Your Sandbox
          </h2>
          <p className="text-slate-500 mt-3.5 text-base font-medium max-w-xl mx-auto">
            Get instant solutions curated by topic. Each section features detailed guidance and interactive tool layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 cat-grid">
          {toolCategories.map((category, idx) => {
            const theme = {
              border: 'hover:border-slate-400',
              bg: 'group-hover:bg-slate-900',
              glow: 'hover:shadow-[0_12px_24px_-10px_rgba(26,26,26,0.08)]',
              text: 'group-hover:text-slate-950',
              iconBg: 'bg-slate-50 border-slate-200 text-slate-800'
            };

            return (
              <Link
                key={category.name}
                href={category.url}
                className={`cat-card p-7 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl hover:bg-white transition-all duration-500 group flex flex-col text-left relative overflow-hidden ${theme.border} ${theme.glow}`}
              >
                {/* Visual hover background hint */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full group-hover:scale-110 transition-transform duration-500"></div>

                <div className="flex items-center mb-5 justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-105 shrink-0 ${theme.iconBg} group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950`}>
                    <i className={`${category.icon} text-lg`}></i>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300 group-hover:translate-x-0.5">
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-bold text-slate-900 transition-colors duration-300 ${theme.text}`}>
                    {category.name} Tools
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 group-hover:text-slate-500 transition-colors duration-300">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* 3. Search and Dynamic All Tools Registry */}
      <section className="py-4 border-t border-slate-150 pt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <i className="fas fa-search text-[9px]"></i>
            <span>Interactive Catalog</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Search &amp; Filter Tools
          </h2>
          <p className="text-slate-500 mt-3.5 text-base font-medium max-w-xl mx-auto">
            Instantly filter through our entire programmatic registry of calculators, PDF utilities, and translators.
          </p>
        </div>

        {/* Central Searchbar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center relative rounded-full border border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] focus-within:shadow-[0_10px_30px_-6px_rgba(15,23,42,0.08)] focus-within:border-slate-400 transition-all p-1.5">
            <i className="fas fa-search absolute left-6 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search for calculators, converter tools, generators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-3.5 bg-transparent rounded-full text-sm sm:text-base text-slate-800 placeholder-slate-400 font-medium focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-4 transition-colors"
                aria-label="Clear Search"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs (Hidden when searching) */}
        {!searchQuery && (
          <div className="flex justify-center mb-12 overflow-x-auto pb-4 max-w-full -mx-4 px-4 mask-gradient scrollbar-none">
            <div className="flex space-x-2 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/40 shrink-0 backdrop-blur-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center space-x-2.5 px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                    activeFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-[0_4px_12px_-4px_rgba(15,23,42,0.3)]'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <i className={`${tab.icon} text-xs`}></i>
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools Results Header */}
        <div className="flex justify-between items-end mb-8 pb-3 border-b border-slate-150">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : activeFilter === 'all'
              ? 'All Tools & Calculators'
              : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tools`}
          </h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
            {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </span>
        </div>

        {/* Filtered Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <Link
                key={tool.url}
                href={tool.url}
                className="registry-card flex flex-col p-6 bg-white border border-slate-100/80 rounded-3xl hover:border-slate-300 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] transition-all duration-500 group hover:-translate-y-2.5 hover:bg-slate-50/40"
              >
                <div
                  className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center mb-4.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:border-[#1a1a1a]"
                >
                  <i className={`${tool.icon} text-sm`}></i>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-[#1a1a1a] font-display relative inline-block max-w-full truncate mb-1">
                  <span className="relative">{tool.name}</span>
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#1a1a1a] group-hover:w-full transition-all duration-300"></span>
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 group-hover:text-slate-500 transition-colors duration-300 line-clamp-2">
                  {tool.desc}
                </p>
                <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-50">
                  <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                    {tool.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-800 opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
                    Use <i className="fas fa-chevron-right text-[8px] ml-0.5"></i>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto mb-4.5 text-slate-400">
              <i className="fas fa-search text-xl"></i>
            </div>
            <p className="text-lg font-bold text-slate-800 tracking-tight">No tools match your query</p>
            <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
              Try adjusting your query or searching for broader terms like "calculator" or "pdf".
            </p>
          </div>
        )}
      </section>

      {/* 4. Popular Tools Showcase */}
      <section className="py-4 border-t border-slate-150 pt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-5 text-left">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
              <i className="fas fa-fire text-[9px]"></i>
              <span>High Traffic Showcase</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Most Popular Solutions
            </h2>
            <p className="text-slate-500 mt-3.5 text-base font-medium max-w-md">
              The daily go-to utilities and loan planners representing our highest user satisfaction.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-slate-50 border border-slate-200 px-4.5 py-2 rounded-full flex items-center w-fit h-fit shadow-sm">
            <i className="fas fa-fire mr-1.5 text-xs animate-bounce text-slate-800"></i>
            High Demand
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 popular-grid">
          {popularTools.map((tool, index) => (
            <Link
              key={tool.url}
              href={tool.url}
              className="popular-card flex flex-col p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] transition-all duration-500 group hover:-translate-y-2.5 hover:bg-slate-50/40"
            >
              <div
                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center mb-4.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:border-[#1a1a1a]"
              >
                <i className={`${tool.icon} text-sm`}></i>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-[#1a1a1a] font-display relative inline-block max-w-full truncate mb-1">
                <span className="relative">{tool.name}</span>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#1a1a1a] group-hover:w-full transition-all duration-300"></span>
              </h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 group-hover:text-slate-500 transition-colors duration-300 line-clamp-2">
                {tool.desc}
              </p>

              {/* Ratings */}
              <div className="flex items-center space-x-2 mt-5">
                <div className="flex items-center space-x-0.5 text-[10px]">
                  {renderStars(tool.rating)}
                </div>
                <span className="text-xs font-bold text-slate-500 pt-0.5">{tool.rating}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-50 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>{tool.usage} users</span>
                <span className="text-slate-800 flex items-center font-black">
                  <i className="fas fa-fire mr-1 text-[10px]"></i>
                  Popular
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Tools Showcase */}
      <section className="py-4 border-t border-slate-150 pt-20 mb-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-3">
            <i className="fas fa-star text-[9px]"></i>
            <span>Curated Selection</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Featured Tools
          </h2>
          <p className="text-slate-500 mt-3.5 text-base font-medium max-w-xl mx-auto">
            Essential templates and robust utilities engineered for peak accuracy, clean visual steps, and daily productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 featured-grid">
          {featuredTools.map((tool, index) => (
            <Link
              key={tool.url}
              href={tool.url}
              className="featured-card flex flex-col p-6 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] transition-all duration-500 group hover:-translate-y-2.5 hover:bg-slate-50/40"
            >
              <div
                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center mb-4.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:border-[#1a1a1a]"
              >
                <i className={`${tool.icon} text-sm`}></i>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-[#1a1a1a] font-display relative inline-block max-w-full truncate mb-1">
                <span className="relative">{tool.name}</span>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#1a1a1a] group-hover:w-full transition-all duration-300"></span>
              </h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2.5 group-hover:text-slate-500 transition-colors duration-300 line-clamp-2">
                {tool.desc}
              </p>
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                  {tool.category}
                </span>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors duration-300 flex items-center">
                  Open <i className="fas fa-arrow-right text-[8px] ml-1.5 group-hover:translate-x-1 transition-transform"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/math"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-300 shadow-[0_10px_20px_-8px_rgba(15,23,42,0.3)] active:scale-95 group hover:-translate-y-0.5"
          >
            Explore All Categories
            <i className="fas fa-arrow-right ml-2.5 text-xs group-hover:translate-x-1.5 transition-transform"></i>
          </Link>
        </div>
      </section>

      {/* Interactive Playground / Brain Games */}
      <section id="playground" className="py-4 border-t border-slate-150 pt-20 homepage-playground-section">
        <InteractivePlayground />
      </section>
    </div>
  );
}

