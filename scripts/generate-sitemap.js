import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allIndexablePaths, SITE_URL } from '../src/data/siteConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

const getPriority = (routePath) => {
  if (routePath === '/') return '1.0';
  if (['/math', '/finance', '/science', '/health', '/utility-tools', '/knowledge'].includes(routePath)) {
    return '0.9';
  }
  if (routePath.startsWith('/about') || routePath.startsWith('/contact') || routePath.startsWith('/privacy-policy')) {
    return '0.4';
  }
  return '0.8';
};

const getChangeFrequency = (routePath) => {
  if (routePath === '/') return 'daily';
  if (['/math', '/finance', '/science', '/health', '/utility-tools', '/knowledge'].includes(routePath)) {
    return 'weekly';
  }
  if (routePath.startsWith('/about') || routePath.startsWith('/contact') || routePath.startsWith('/privacy-policy')) {
    return 'monthly';
  }
  return 'weekly';
};

async function generateSitemap() {
  try {
    const routePaths = Array.from(new Set(allIndexablePaths)).sort();
    const today = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (const routePath of routePaths) {
      const url = `${SITE_URL}${routePath === '/' ? '/' : routePath}`;
      sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getChangeFrequency(routePath)}</changefreq>
    <priority>${getPriority(routePath)}</priority>
  </url>
`;
    }

    sitemap += `</urlset>`;

    fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
    console.log('sitemap.xml generated successfully!');
    console.log(`Sitemap saved to: ${SITEMAP_PATH}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exitCode = 1;
  }
}

generateSitemap();
