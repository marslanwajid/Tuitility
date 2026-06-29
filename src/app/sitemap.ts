import { MetadataRoute } from 'next';
import { allIndexablePaths, SITE_URL } from '../data/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  return allIndexablePaths.map((path) => {
    // Determine page priority based on URL depth and type
    let priority = 0.5;
    if (path === '/') {
      priority = 1.0;
    } else if (path === '/about' || path === '/contact') {
      priority = 0.7;
    } else if (path === '/privacy-policy' || path === '/terms-and-conditions') {
      priority = 0.3;
    } else if (
      path === '/math' ||
      path === '/finance' ||
      path === '/science' ||
      path === '/health' ||
      path === '/utility-tools' ||
      path === '/knowledge'
    ) {
      // Category landings
      priority = 0.8;
    } else {
      // Tool detail pages
      priority = 1.0;
    }

    // Determine crawl change frequency
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly';
    if (path === '/') {
      changeFrequency = 'daily';
    } else if (path === '/privacy-policy' || path === '/terms-and-conditions') {
      changeFrequency = 'monthly';
    }

    return {
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });
}
