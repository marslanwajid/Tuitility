import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_JSX_PATH = path.join(__dirname, '../src/App.jsx');
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const BASE_URL = 'https://tuitility.vercel.app';

async function generateSitemap() {
  try {
    const appJsxContent = fs.readFileSync(APP_JSX_PATH, 'utf8');

    // Regex to find all path attributes in Route components
    // It captures paths like '/', '/math', '/math/calculators/binary-calculator'
    const routePaths = new Set();
    const routeRegex = /<Route[^>]+path=["']([^"']+)["'][^>]*\/>/g;
    let match;

    while ((match = routeRegex.exec(appJsxContent)) !== null) {
      if (match[1]) {
        routePaths.add(match[1]);
      }
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (const routePath of Array.from(routePaths).sort()) {
      const url = `${BASE_URL}${routePath}`;
      sitemap += `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${routePath === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
    }

    sitemap += `</urlset>`;

    fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
    console.log('sitemap.xml generated successfully!');
    console.log(`Sitemap saved to: ${SITEMAP_PATH}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();