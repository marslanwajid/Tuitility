'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface GameState {
  level: number;
  sequence: number[]; // Indicies of the correct tiles in order
  gameState: 'idle' | 'showing' | 'playing' | 'success' | 'fail';
  userIndex: number;
  score: number;
}

export default function NotFound() {
  // Game state variables
  const [level, setLevel] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'success' | 'fail'>('idle');
  const [userIndex, setUserIndex] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [highScore, setHighScore] = useState(0);

  // Load high score from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tuitility-404-highscore');
      if (saved) {
        setHighScore(parseInt(saved, 10));
      }
    }
  }, []);

  // Update high score
  const updateHighScore = useCallback((newScore: number) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        localStorage.setItem('tuitility-404-highscore', newScore.toString());
        return newScore;
      }
      return prev;
    });
  }, []);

  // Start new game or next level
  const startLevel = useCallback((lvl: number, isReset: boolean = false) => {
    setWrongTile(null);
    setUserIndex(0);
    const newLvl = isReset ? 3 : lvl;
    if (isReset) {
      setLevel(3);
    }
    
    setGameState('showing');

    // Generate unique random numbers between 0 and 8
    const indices: number[] = [];
    const count = Math.min(newLvl, 8); // Max sequence is 8 tiles
    while (indices.length < count) {
      const rand = Math.floor(Math.random() * 9);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setSequence(indices);

    // Reveal sequence
    const newRevealed = Array(9).fill(false);
    indices.forEach((index) => {
      newRevealed[index] = true;
    });
    setRevealed(newRevealed);

    // Hide sequence after a duration (scales down slightly for difficulty)
    const showDuration = Math.max(1800 - newLvl * 100, 1000);
    const timer = setTimeout(() => {
      setRevealed(Array(9).fill(false));
      setGameState('playing');
    }, showDuration);

    return () => clearTimeout(timer);
  }, []);

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;

    const correctIndex = sequence[userIndex];

    if (index === correctIndex) {
      // Reveal correct tile briefly
      setRevealed((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });

      // Check if complete
      if (userIndex === sequence.length - 1) {
        setGameState('success');
        const nextLevel = level + 1;
        setLevel(nextLevel);
        const newScore = level - 2; // Score is levels completed
        updateHighScore(newScore);

        // Confetti burst for milestone levels
        if (level >= 5) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        // Start next level automatically after 1 second
        setTimeout(() => {
          startLevel(nextLevel, false);
        }, 1000);
      } else {
        setUserIndex((prev) => prev + 1);
      }
    } else {
      // Incorrect click
      setWrongTile(index);
      setGameState('fail');
      
      // Reveal the correct sequence to show user what they missed
      const showCorrect = Array(9).fill(false);
      sequence.forEach((idx) => {
        showCorrect[idx] = true;
      });
      setRevealed(showCorrect);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 max-w-3xl mx-auto text-slate-800 animate-fadeIn">
      {/* 404 Error Header */}
      <section className="mb-10 space-y-4">
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm animate-bounce">
          <i className="fas fa-exclamation-triangle text-[9px]"></i>
          <span>Error Code: 404</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-none">
          Oops! Lost in <span className="text-[#1a1a1a]">Sandbox</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          The utility you are looking for has either migrated, or does not exist. Let&apos;s get you back on track!
        </p>
      </section>

      {/* Interactive Brain Game Container */}
      <section className="w-full max-w-sm p-6 sm:p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_12px_40px_-12px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-500 mb-12">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900">Grid Memory Puzzle</h3>
            <p className="text-[10px] text-slate-400 font-medium">Click the numbered tiles in ascending order</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
            <span className="text-base font-black text-slate-900">{level - 2}</span>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-3 gap-3 aspect-square mb-6">
          {Array(9)
            .fill(0)
            .map((_, idx) => {
              // Determine tile number if revealed
              const seqPos = sequence.indexOf(idx);
              const isTileRevealed = revealed[idx];
              const isWrong = wrongTile === idx;
              
              // Base button styling
              let tileClass = "aspect-square rounded-2xl border font-bold text-lg flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer ";
              
              if (gameState === 'idle') {
                tileClass += "bg-slate-50 border-slate-200 text-slate-350 hover:bg-slate-100 hover:border-slate-300";
              } else if (gameState === 'showing') {
                tileClass += isTileRevealed
                  ? "bg-slate-900 border-slate-900 text-white scale-105 shadow-md"
                  : "bg-slate-50 border-slate-200 text-transparent";
              } else if (gameState === 'playing') {
                tileClass += isTileRevealed
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50";
              } else if (gameState === 'success') {
                tileClass += "bg-emerald-500 border-emerald-500 text-white scale-95";
              } else if (gameState === 'fail') {
                if (isWrong) {
                  tileClass += "bg-rose-500 border-rose-500 text-white animate-shake";
                } else if (seqPos !== -1) {
                  tileClass += "bg-slate-900 border-slate-900 text-white";
                } else {
                  tileClass += "bg-slate-50 border-slate-200 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={gameState !== 'playing'}
                  className={tileClass}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  aria-label={`Tile ${idx + 1}`}
                >
                  {(isTileRevealed || gameState === 'fail') && seqPos !== -1 ? seqPos + 1 : ''}
                </button>
              );
            })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          {gameState === 'idle' && (
            <button
              onClick={() => startLevel(level, true)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              Start Brain Test
            </button>
          )}

          {gameState === 'fail' && (
            <button
              onClick={() => startLevel(3, true)}
              className="w-full py-3 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              Try Again
            </button>
          )}

          {gameState === 'success' && (
            <div className="py-2.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs font-bold animate-pulse">
              Level Clear! Loading next...
            </div>
          )}

          {gameState === 'playing' && (
            <div className="py-2.5 bg-slate-50 text-slate-500 rounded-2xl border border-slate-150 text-xs font-bold">
              Recall sequence: click 1 to {sequence.length}
            </div>
          )}

          {gameState === 'showing' && (
            <div className="py-2.5 bg-slate-900 text-white rounded-2xl border border-slate-900 text-xs font-bold animate-pulse">
              Memorize the numbers...
            </div>
          )}

          {/* High Score Panel */}
          <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-3 pt-3 border-t border-slate-50">
            <span>Score: {Math.max(0, level - 3)}</span>
            <span>High Score: {highScore}</span>
          </div>
        </div>
      </section>

      {/* Return Buttons */}
      <section className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-[0_6px_15px_-6px_rgba(15,23,42,0.3)] active:scale-95 group hover:-translate-y-0.5"
        >
          <i className="fas fa-home mr-2 text-slate-400 group-hover:text-white transition-colors"></i>
          Back to Homepage
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all shadow-sm active:scale-95 group hover:-translate-y-0.5"
        >
          <i className="fas fa-paper-plane mr-2 text-slate-450 group-hover:text-slate-600 transition-colors"></i>
          Report Broken Link
        </Link>
      </section>
    </div>
  );
}
