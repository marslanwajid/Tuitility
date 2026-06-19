'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position to top instantly on pathname change
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    } catch (e) {
      console.warn('ScrollToTop error:', e);
    }
  }, [pathname]);

  return null;
}
