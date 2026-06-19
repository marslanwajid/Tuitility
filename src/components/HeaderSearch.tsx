'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allTools } from '../data/allTools';

interface HeaderSearchProps {
  idPrefix: string;
  isMobile: boolean;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ idPrefix, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search when location changes (user navigated)
  useEffect(() => {
    setSearchQuery('');
    setIsFocused(false);
  }, [pathname]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredSearchResults = searchQuery
    ? allTools
        .filter(
          (tool) =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const getToolColorClass = (index: number) => {
    return 'bg-slate-50 text-slate-800 border-slate-100';
  };

  return (
    <div
      className={`relative w-full ${isMobile ? 'block py-4 px-2' : 'hidden md:block max-w-md ml-auto mr-4'}`}
      ref={searchRef}
    >
      <div
        className={`flex items-center w-full relative rounded-full border transition-all duration-300 ${
          isFocused
            ? 'border-primary shadow-sm bg-white'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <i className="fas fa-search absolute left-4 text-slate-400 z-10 text-sm"></i>
        <input
          type="text"
          id={`${idPrefix}Input`}
          placeholder="Search tools & calculators..."
          className="w-full pl-11 pr-10 py-2.5 bg-transparent rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          autoComplete="off"
        />
        {searchQuery ? (
          <button
            type="button"
            className="absolute right-4 text-slate-400 hover:text-slate-600 z-10 transition-colors"
            onClick={() => setSearchQuery('')}
            aria-label="Clear Search"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        ) : (
          <div className="absolute right-4 text-slate-400">
            <kbd className="hidden lg:inline-block text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 pointer-events-none">
              /
            </kbd>
          </div>
        )}
      </div>

      {isFocused && searchQuery && (
        <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden max-h-[420px] flex flex-col">
          {filteredSearchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-400">
                  {filteredSearchResults.length} result{filteredSearchResults.length !== 1 ? 's' : ''} found
                </span>
              </div>
              <div className="overflow-y-auto divide-y divide-slate-50">
                {filteredSearchResults.map((tool, index) => (
                  <Link
                    key={tool.url}
                    href={tool.url}
                    className="flex items-center px-4 py-3 hover:bg-slate-50/80 transition-colors group"
                    onClick={() => {
                      setSearchQuery('');
                      setIsFocused(false);
                    }}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center mr-3 transition-transform group-hover:scale-110 ${getToolColorClass(
                        index
                      )}`}
                    >
                      <i className={tool.icon}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">
                        {tool.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{tool.desc}</p>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {tool.category}
                    </span>
                  </Link>
                ))}
              </div>
              {filteredSearchResults.length === 8 && (
                <div className="px-4 py-2 bg-slate-50/40 border-t border-slate-50 text-center">
                  <span className="text-[10px] text-slate-400">Type more to refine results...</span>
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <i className="fas fa-search text-lg"></i>
              </div>
              <p className="text-sm font-semibold text-slate-700">No tools found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
