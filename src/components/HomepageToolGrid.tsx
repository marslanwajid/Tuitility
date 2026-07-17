'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { allTools } from '../data/allTools';

const filterTabs = [
  { id: 'all', title: 'All Tools', icon: 'fas fa-th-large' },
  { id: 'favorites', title: 'Favorites', icon: 'fas fa-star text-amber-500' },
  { id: 'math', title: 'Math', icon: 'fas fa-calculator' },
  { id: 'finance', title: 'Finance', icon: 'fas fa-dollar-sign' },
  { id: 'science', title: 'Science', icon: 'fas fa-atom' },
  { id: 'health', title: 'Health', icon: 'fas fa-heartbeat' },
  { id: 'utility', title: 'Utility', icon: 'fas fa-tools' },
  { id: 'knowledge', title: 'Knowledge', icon: 'fas fa-brain' },
];

export default function HomepageToolGrid() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const saved = localStorage.getItem('tuitility-favorite-tools');
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {}
      }
    };
    loadFavorites();
    window.addEventListener('favorites-updated', loadFavorites);
    return () => window.removeEventListener('favorites-updated', loadFavorites);
  }, []);

  const toggleFavorite = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const saved = localStorage.getItem('tuitility-favorite-tools');
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }

    let updated: string[];
    if (list.includes(url)) {
      updated = list.filter((u) => u !== url);
    } else {
      updated = [...list, url];
    }

    localStorage.setItem('tuitility-favorite-tools', JSON.stringify(updated));
    setFavorites(updated);
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  };

  const filteredTools = searchQuery
    ? allTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeFilter === 'all'
    ? allTools
    : activeFilter === 'favorites'
    ? allTools.filter((tool) => favorites.includes(tool.url))
    : allTools.filter((tool) => tool.category.toLowerCase() === activeFilter.toLowerCase());

  return (
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

      <div className="flex justify-between items-end mb-8 pb-3 border-b border-slate-150">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : activeFilter === 'all'
            ? 'All Tools & Calculators'
            : activeFilter === 'favorites'
            ? 'My Favorite Tools'
            : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Tools`}
        </h3>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
          {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
        </span>
      </div>

      {filteredTools.length > 0 ? (
        <div key={activeFilter + searchQuery} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTools.map((tool, index) => (
            <Link
              key={tool.url}
              href={tool.url}
              className="relative flex flex-col p-6 bg-white border border-slate-100/80 rounded-3xl hover:border-slate-300 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.02)] transition-all duration-500 group hover:-translate-y-2.5 hover:bg-slate-50/40 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Favorite Star Button */}
              {(() => {
                const isFav = favorites.includes(tool.url);
                return (
                  <button
                    onClick={(e) => toggleFavorite(tool.url, e)}
                    className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white border border-slate-200/60 hover:border-slate-300 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_2px_8px_-2px_rgba(26,26,26,0.05)] focus:outline-none"
                    title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                    aria-label={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <i className={`${isFav ? 'fas fa-star text-amber-400' : 'far fa-star text-slate-400'} text-xs`} />
                  </button>
                );
              })()}

              <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-center mb-4.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white group-hover:border-[#1a1a1a]">
                <i className={`${tool.icon} text-sm`}></i>
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-[#1a1a1a] font-display relative inline-block max-w-full truncate mb-1 pr-6">
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
      ) : activeFilter === 'favorites' && !searchQuery ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto mb-4.5 text-slate-400">
            <i className="fas fa-star text-xl text-slate-300"></i>
          </div>
          <p className="text-lg font-bold text-slate-800 tracking-tight">No favorites yet</p>
          <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
            Click the star icon in the corner of any tool card to bookmark your most used tools here.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mx-auto mb-4.5 text-slate-400">
            <i className="fas fa-search text-xl"></i>
          </div>
          <p className="text-lg font-bold text-slate-800 tracking-tight">No tools match your query</p>
          <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
            Try adjusting your query or searching for broader terms like &quot;calculator&quot; or &quot;pdf&quot;.
          </p>
        </div>
      )}
    </section>
  );
}
