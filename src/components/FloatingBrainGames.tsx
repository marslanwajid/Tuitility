'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const GAMES = [
  {
    id: 'arithmetic',
    icon: 'fa-calculator',
    title: 'Arithmetic Speedrun',
    desc: 'Rapid-fire math challenges',
    color: 'from-slate-700/30 to-slate-800/20 border-slate-600/30',
  },
  {
    id: 'binary',
    icon: 'fa-microchip',
    title: 'Binary Byte Blitz',
    desc: 'Binary/decimal conversion',
    color: 'from-slate-700/30 to-slate-800/20 border-slate-600/30',
  },
  {
    id: 'trivia',
    icon: 'fa-brain',
    title: 'Brain IQ Trivia',
    desc: 'Multi-topic quiz challenge',
    color: 'from-slate-700/30 to-slate-800/20 border-slate-600/30',
  },
];

export default function FloatingBrainGames() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handlePlay = () => {
    setIsOpen(false);
    const el = document.getElementById('playground');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#playground');
    }
  };

  return (
    <div className="relative mb-2">
      {/* Games Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[300px] bg-[#1a1a1a]/95 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-fade-in-up">
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                <i className="fas fa-brain mr-1.5 text-slate-400"></i>Brain Games
              </span>
              <button type="button" onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-all active:scale-95 cursor-pointer">
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {GAMES.map(game => (
              <div key={game.id}
                className={`flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r ${game.color} border rounded-xl cursor-pointer hover:scale-[1.02] transition-all active:scale-95`}
                onClick={handlePlay}>
                <div className="w-9 h-9 bg-slate-900/60 rounded-lg flex items-center justify-center text-sm text-slate-300">
                  <i className={`fas ${game.icon}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{game.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{game.desc}</div>
                </div>
                <i className="fas fa-play text-[10px] text-slate-500 mr-1"></i>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-800/60 bg-slate-900/30">
            <p className="text-[9px] text-slate-600 text-center">Click any game to play in the playground</p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button type="button" onClick={() => setIsOpen(o => !o)}
        className="w-14 h-14 bg-[#1a1a1a] hover:bg-neutral-800 text-white rounded-full border border-slate-700 shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Brain Games">
        <i className={`fas fa-gamepad text-lg transition-transform duration-300 ${isOpen ? 'rotate-12' : ''}`}></i>
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-200"></span>
          </span>
        )}
      </button>
    </div>
  );
}
