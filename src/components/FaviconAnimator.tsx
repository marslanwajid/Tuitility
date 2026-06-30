'use client';

import { useEffect } from 'react';

const FRAME_COUNT = 30;
const INTERVAL = 333; // 333ms per frame (derived from sampling 30 frames out of 300)

export default function FaviconAnimator() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload all frames to avoid network lag or flickering between frames
    const preloadedImages: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/images/favicon-frames/frame_${i}.png`;
      preloadedImages.push(img);
    }

    let currentFrame = 0;

    const intervalId = setInterval(() => {
      currentFrame = (currentFrame + 1) % FRAME_COUNT;
      const frameUrl = `/images/favicon-frames/frame_${currentFrame}.png`;

      // Query all favicon link elements
      const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");

      if (links.length > 0) {
        links.forEach((link) => {
          link.href = frameUrl;
          link.type = 'image/png';
        });
      } else {
        // Fallback: create favicon link if it doesn't exist
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = frameUrl;
        document.head.appendChild(link);
      }
    }, INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
