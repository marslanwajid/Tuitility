'use client';

import React, { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  toolUrl: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ toolUrl }) => {
  const [mounted, setMounted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('tuitility-favorite-tools');
    if (saved) {
      try {
        const list: string[] = JSON.parse(saved);
        setIsFavorited(list.includes(toolUrl));
      } catch (e) {
        // Fallback
      }
    }

    const syncFavorites = () => {
      const currentSaved = localStorage.getItem('tuitility-favorite-tools');
      if (currentSaved) {
        try {
          const list: string[] = JSON.parse(currentSaved);
          setIsFavorited(list.includes(toolUrl));
        } catch (e) {}
      } else {
        setIsFavorited(false);
      }
    };

    window.addEventListener('favorites-updated', syncFavorites);
    return () => window.removeEventListener('favorites-updated', syncFavorites);
  }, [toolUrl]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem('tuitility-favorite-tools');
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }

    let updatedList: string[];
    if (list.includes(toolUrl)) {
      updatedList = list.filter((url) => url !== toolUrl);
      setIsFavorited(false);
    } else {
      updatedList = [...list, toolUrl];
      setIsFavorited(true);
    }

    localStorage.setItem('tuitility-favorite-tools', JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  };

  // Render a placeholder spacing of the same dimensions during SSR to prevent layout shift
  if (!mounted) {
    return <span className="w-8 h-8 inline-block shrink-0" />;
  }

  return (
    <button
      onClick={toggleFavorite}
      className="w-8 h-8 rounded-full hover:bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-label={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
    >
      <i
        className={`${
          isFavorited ? 'fas fa-star text-amber-400' : 'far fa-star text-slate-400 hover:text-slate-600'
        } text-base transition-transform duration-300 hover:scale-110`}
      />
    </button>
  );
};

export default FavoriteButton;
