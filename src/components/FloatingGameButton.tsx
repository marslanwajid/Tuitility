'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function FloatingGameButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    const el = document.getElementById('playground');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#playground');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip */}
      <span className="hidden sm:inline-block mr-3 bg-[#1a1a1a] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-lg border border-slate-700/60 shadow-lg opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none select-none">
        Brain Games
      </span>
      
      {/* Floating Action Button */}
      <button
        onClick={handleClick}
        className="w-14 h-14 bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded-full border border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group relative focus:outline-none"
        aria-label="Open Brain Playground"
      >
        <i className="fas fa-gamepad text-lg group-hover:rotate-12 transition-transform duration-300"></i>
        
        {/* Pulsing indicator dot */}
        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-200"></span>
        </span>
      </button>
    </div>
  );
}
