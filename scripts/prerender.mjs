/**
 * Tuitility Pre-render Script
 * ----------------------------
 * Generates a static index.html for every route so Google can crawl
 * real HTML content instead of an empty <div id="root"></div>.
 *
 * Run after `vite build`:  node scripts/prerender.mjs
 *
 * What it does:
 *  1. Reads dist/index.html (the built SPA shell)
 *  2. For every route, injects the correct <title>, <meta>, <link rel="canonical">
 *     and JSON-LD structured data directly into the HTML
 *  3. Writes dist/<route>/index.html so Vercel serves real HTML per URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import data from the source of truth
import { allTools } from '../src/data/allTools.js';
import { SITE_NAME, SITE_URL, staticPages, allIndexablePaths } from '../src/data/siteConfig.js';
import { toolCategories } from '../src/data/toolCategories.js';
import { getToolContentByPath, getCategoryContentByPath } from '../src/data/toolContent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

// ─── SEO builder ─────────────────────────────────────────────────────────────

function getPageSeo(routeUrl) {
  // Static pages
  const staticPage = staticPages.find(p => p.path === routeUrl);
  if (staticPage) {
    return {
      title: staticPage.title,
      description: staticPage.description,
      keywords: `${SITE_NAME}, online tools, free calculators`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  // Category pages
  const category = toolCategories.find(c => c.url === routeUrl);
  if (category) {
    const content = getCategoryContentByPath(routeUrl);
    return {
      title: `${category.name} Tools - Free Online ${category.name} Calculators | ${SITE_NAME}`,
      description: category.description,
      keywords: `${category.name.toLowerCase()} tools, ${category.name.toLowerCase()} calculators, free ${category.name.toLowerCase()} calculator online, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
      content
    };
  }

  // Individual tool pages
  const tool = allTools.find(t => t.url === routeUrl);
  if (tool) {
    const content = getToolContentByPath(routeUrl);
    return {
      title: content.seoTitle || `${tool.name} - Free Online ${tool.name} | ${SITE_NAME}`,
      description: content.seoDescription || `${tool.desc}. Free, fast, and accurate ${tool.name.toLowerCase()} tool.`,
      keywords: content.seoKeywords?.join(', ') || `${tool.name.toLowerCase()}, ${tool.name.toLowerCase()} online, free ${tool.name.toLowerCase()}, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
      content
    };
  }

  // Homepage fallback
  if (routeUrl === '/') {
    return {
      title: `${SITE_NAME} - Free Online Calculators, Converters, PDF Tools & Utility Tools`,
      description: 'Explore Tuitility for free online calculators, converters, finance tools, health calculators, PDF tools, science tools, and productivity utilities.',
      keywords: 'free online calculators, utility tools, pdf tools, finance calculator, math calculator, health calculator, science calculator, converter tools',
      canonical: `${SITE_URL}/`,
    };
  }

  // Fallback for any other route
  const label = routeUrl.split('/').filter(Boolean).map(s => s.replace(/-/g, ' ')).join(' › ');
  return {
    title: `${label} | ${SITE_NAME}`,
    description: `Free online ${label} on ${SITE_NAME}. Accurate, fast, and browser-based.`,
    keywords: `${label}, ${SITE_NAME}, free online tools`,
    canonical: `${SITE_URL}${routeUrl}`,
  };
}

function buildStructuredData(routeUrl, seo) {
  if (seo.content && seo.content.schema) {
    return {
      '@context': 'https://schema.org',
      '@type': seo.content.schema.type || 'WebApplication',
      name: seo.content.name,
      description: seo.description,
      url: seo.canonical,
      applicationCategory: seo.content.schema.applicationCategory,
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    };
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.canonical,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

// ─── HTML injection ───────────────────────────────────────────────────────────

function injectBodyContent(html, seo) {
  if (!seo.content) return html;

  const c = seo.content;
  let bodyHtml = `\n  <div id="seo-rich-content" style="display:none" aria-hidden="true">\n`;
  
  // Title and Overview
  bodyHtml += `    <h1>${escHtml(c.seoTitle || c.name)}</h1>\n`;
  if (c.overview) {
    c.overview.forEach(p => {
      bodyHtml += `    <p>${escHtml(p)}</p>\n`;
    });
  }

  // How to use
  if (c.howToSteps && c.howToSteps.length > 0) {
    bodyHtml += `    <h2>How to use ${escHtml(c.name)}</h2>\n`;
    bodyHtml += `    <ol>\n`;
    c.howToSteps.forEach(step => {
      bodyHtml += `      <li>${escHtml(step)}</li>\n`;
    });
    bodyHtml += `    </ol>\n`;
  }

  // Benefits / Capabilities
  if (c.capabilities && c.capabilities.length > 0) {
    bodyHtml += `    <h2>Key Features</h2>\n`;
    bodyHtml += `    <ul>\n`;
    c.capabilities.forEach(cap => {
      bodyHtml += `      <li>${escHtml(cap)}</li>\n`;
    });
    bodyHtml += `    </ul>\n`;
  }

  // FAQs
  if (c.faqs && c.faqs.length > 0) {
    bodyHtml += `    <h2>Frequently Asked Questions</h2>\n`;
    c.faqs.forEach(faq => {
      bodyHtml += `    <div class="faq-item">\n`;
      bodyHtml += `      <h3>${escHtml(faq.question)}</h3>\n`;
      bodyHtml += `      <p>${escHtml(faq.answer)}</p>\n`;
      bodyHtml += `    </div>\n`;
    });
  }

  // Categories / Priority tools (for category pages)
  if (c.tools && c.tools.length > 0) {
    bodyHtml += `    <h2>Available ${escHtml(c.name)} Tools</h2>\n`;
    bodyHtml += `    <ul>\n`;
    c.tools.forEach(t => {
      bodyHtml += `      <li><a href="${t.url}">${escHtml(t.name)}</a> - ${escHtml(t.desc)}</li>\n`;
    });
    bodyHtml += `    </ul>\n`;
  }

  bodyHtml += `  </div>\n`;

  // Inject before <div id="root">
  if (html.includes('<div id="root">')) {
    return html.replace('<div id="root">', bodyHtml + '  <div id="root">');
  }
  return html;
}

function injectSeo(html, routeUrl) {
  const seo = getPageSeo(routeUrl);
  const structuredData = buildStructuredData(routeUrl, seo);

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(seo.title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escHtml(seo.description)}" />`
  );

  // Replace meta keywords
  html = html.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="keywords" content="${escHtml(seo.keywords)}" />`
  );

  // Replace OG tags
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i,  `$1${escHtml(seo.title)}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i,  `$1${escHtml(seo.description)}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i,  `$1${escHtml(seo.canonical)}$2`);

  // Replace Twitter tags
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,  `$1${escHtml(seo.title)}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,  `$1${escHtml(seo.description)}$2`);

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escHtml(seo.canonical)}" />`
  );

  // Inject / replace structured data before </head>
  const schemaTag = `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
  if (html.includes('id="seo-structured-data"')) {
    html = html.replace(/<script[^>]*id="seo-structured-data"[^>]*>[\s\S]*?<\/script>/i, schemaTag);
  } else {
    html = html.replace('</head>', `  ${schemaTag}\n</head>`);
  }

  // Inject Body Content
  html = injectBodyContent(html, seo);

  return html;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Route list ───────────────────────────────────────────────────────────────

const routes = allIndexablePaths;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌  dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  let succeeded = 0;
  let failed = 0;

  console.log(`\n🚀  Pre-rendering ${routes.length} routes...\n`);

  for (const route of routes) {
    try {
      const html = injectSeo(template, route);

      if (route === '/') {
        // Overwrite dist/index.html in place for the root
        fs.writeFileSync(templatePath, html, 'utf-8');
      } else {
        // Create dist/<route>/index.html
        const segments = route.split('/').filter(Boolean);
        const dir = path.join(DIST, ...segments);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
      }

      console.log(`  ✅  ${route}`);
      succeeded++;
    } catch (err) {
      console.error(`  ❌  ${route} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨  Done: ${succeeded} pages pre-rendered${failed ? `, ${failed} failed` : ''}.\n`);
}

main();
