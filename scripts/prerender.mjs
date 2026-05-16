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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

// ─── Site config (mirrors src/data/siteConfig.js) ────────────────────────────

const SITE_NAME = 'Tuitility';
const SITE_URL = 'https://tuitility.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

// ─── All tools (mirrors src/data/allTools.js) ────────────────────────────────

const allTools = [
  { name: 'Fraction Calculator', desc: 'Add, subtract, multiply and divide fractions', url: '/math/calculators/fraction-calculator', category: 'Math' },
  { name: 'Percentage Calculator', desc: 'Calculate percentages quickly and easily', url: '/math/calculators/percentage-calculator', category: 'Math' },
  { name: 'Decimal to Fraction', desc: 'Convert decimals to fractions instantly', url: '/math/calculators/decimal-to-fraction-calculator', category: 'Math' },
  { name: 'LCM Calculator', desc: 'Find least common multiple', url: '/math/calculators/lcm-calculator', category: 'Math' },
  { name: 'Binary Calculator', desc: 'Convert and calculate binary numbers', url: '/math/calculators/binary-calculator', category: 'Math' },
  { name: 'LCD Calculator', desc: 'Find lowest common denominator', url: '/math/calculators/lcd-calculator', category: 'Math' },
  { name: 'Compare Fractions', desc: 'Compare multiple fractions', url: '/math/calculators/comparing-fractions-calculator', category: 'Math' },
  { name: 'Decimal Calculator', desc: 'Perform decimal arithmetic operations', url: '/math/calculators/decimal-calculator', category: 'Math' },
  { name: 'Compare Decimals', desc: 'Compare multiple decimals', url: '/math/calculators/comparing-decimals-calculator', category: 'Math' },
  { name: 'Fraction to Percent', desc: 'Convert fractions to percentages', url: '/math/calculators/fraction-to-percent-calculator', category: 'Math' },
  { name: 'Improper to Mixed', desc: 'Convert improper fractions to mixed numbers', url: '/math/calculators/improper-fraction-to-mixed-calculator', category: 'Math' },
  { name: 'Percent to Fraction', desc: 'Convert percentages to fractions', url: '/math/calculators/percent-to-fraction-calculator', category: 'Math' },
  { name: 'SSE Calculator', desc: 'Calculate sum of squares of errors', url: '/math/calculators/sse-calculator', category: 'Math' },
  { name: 'Derivative Calculator', desc: 'Calculate derivatives of functions', url: '/math/calculators/derivative-calculator', category: 'Math' },
  { name: 'Integral Calculator', desc: 'Calculate definite and indefinite integrals', url: '/math/calculators/integral-calculator', category: 'Math' },
  { name: 'Mortgage Calculator', desc: 'Calculate monthly mortgage payments with taxes, insurance, PMI', url: '/finance/calculators/mortgage-calculator', category: 'Finance' },
  { name: 'Amortization Calculator', desc: 'Calculate amortization schedules, monthly payments, and total interest over time', url: '/finance/calculators/amortization-calculator', category: 'Finance' },
  { name: 'Loan Calculator', desc: 'Calculate loan payments with down payment and fees', url: '/finance/calculators/loan-calculator', category: 'Finance' },
  { name: 'Currency Calculator', desc: 'Convert between 170+ world currencies with real-time rates', url: '/finance/calculators/currency-calculator', category: 'Finance' },
  { name: 'House Affordability Calculator', desc: 'Calculate how much house you can afford', url: '/finance/calculators/house-affordability-calculator', category: 'Finance' },
  { name: 'Compound Interest Calculator', desc: 'Calculate investment growth with compound interest', url: '/finance/calculators/compound-interest-calculator', category: 'Finance' },
  { name: 'ROI Calculator', desc: 'Calculate return on investment and annualized returns', url: '/finance/calculators/roi-calculator', category: 'Finance' },
  { name: 'Business Loan Calculator', desc: 'Calculate business loan payments', url: '/finance/calculators/business-loan-calculator', category: 'Finance' },
  { name: 'Credit Card Calculator', desc: 'Calculate credit card payments, interest, and payoff time', url: '/finance/calculators/credit-card-calculator', category: 'Finance' },
  { name: 'Investment Calculator', desc: 'Calculate investment growth, compound returns, and future value', url: '/finance/calculators/investment-calculator', category: 'Finance' },
  { name: 'Tax Calculator', desc: 'Calculate federal and state income taxes, deductions, and credits', url: '/finance/calculators/tax-calculator', category: 'Finance' },
  { name: 'Retirement Calculator', desc: 'Calculate retirement savings goals, monthly contributions, and future income', url: '/finance/calculators/retirement-calculator', category: 'Finance' },
  { name: 'Sales Tax Calculator', desc: 'Calculate sales tax, subtotal, and total amount for purchases', url: '/finance/calculators/sales-tax-calculator', category: 'Finance' },
  { name: 'Debt Payoff Calculator', desc: 'Calculate debt payoff time, total interest, and payment strategies', url: '/finance/calculators/debt-payoff-calculator', category: 'Finance' },
  { name: 'Insurance Calculator', desc: 'Calculate insurance premiums, coverage costs, and policy comparisons', url: '/finance/calculators/insurance-calculator', category: 'Finance' },
  { name: 'Budget Calculator', desc: 'Create and manage personal budgets with the 50-30-20 rule and custom allocations', url: '/finance/calculators/budget-calculator', category: 'Finance' },
  { name: 'Rental Property Calculator', desc: 'Calculate rental property ROI, cash flow, and investment returns', url: '/finance/calculators/rental-property-calculator', category: 'Finance' },
  { name: 'Debt Income Calculator', desc: 'Calculate your debt-to-income ratio to assess financial health and loan eligibility', url: '/finance/calculators/debt-income-calculator', category: 'Finance' },
  { name: 'Down Payment Calculator', desc: 'Calculate down payment amount, loan amount, and monthly mortgage payments', url: '/finance/calculators/down-payment-calculator', category: 'Finance' },
  { name: 'Present Value Calculator', desc: 'Calculate the present value of future cash flows and investments', url: '/finance/calculators/present-value-calculator', category: 'Finance' },
  { name: 'Future Value Calculator', desc: 'Calculate the future value of investments and savings with compound interest', url: '/finance/calculators/future-value-calculator', category: 'Finance' },
  { name: 'Wave Speed Calculator', desc: 'Calculate wave speed, frequency, and wavelength', url: '/science/calculators/wave-speed-calculator', category: 'Science' },
  { name: 'Gravity Calculator', desc: 'Calculate gravitational force and acceleration', url: '/science/calculators/gravity-calculator', category: 'Science' },
  { name: 'Work Power Calculator', desc: 'Calculate work, power, and energy', url: '/science/calculators/work-power-calculator', category: 'Science' },
  { name: 'DBm Watts Calculator', desc: 'Convert between dBm and watts', url: '/science/calculators/dbm-watts-calculator', category: 'Science' },
  { name: 'DBm Milliwatts Calculator', desc: 'Convert between dBm and milliwatts', url: '/science/calculators/dbm-milliwatts-calculator', category: 'Science' },
  { name: 'Capacitance Calculator', desc: 'Calculate electrical capacitance', url: '/science/calculators/capacitance-calculator', category: 'Science' },
  { name: 'Electric Flux Calculator', desc: 'Calculate electric flux through surfaces', url: '/science/calculators/electric-flux-calculator', category: 'Science' },
  { name: 'Atomic Mass Calculator', desc: 'Calculate average atomic mass', url: '/science/calculators/average-atomic-mass-calculator', category: 'Science' },
  { name: 'BMI Calculator', desc: 'Calculate your body mass index', url: '/health/calculators/bmi-calculator', category: 'Health' },
  { name: 'Calorie Calculator', desc: 'Calculate daily calorie needs', url: '/health/calculators/calorie-calculator', category: 'Health' },
  { name: 'Calorie Burn Calculator', desc: 'Estimate calories burned from exercise, activity duration, and body weight', url: '/health/calculators/calorie-burn-calculator', category: 'Health' },
  { name: 'Water Intake Calculator', desc: 'Calculate daily water requirements', url: '/health/calculators/water-intake-calculator', category: 'Health' },
  { name: 'Weight Loss Calculator', desc: 'Plan your weight loss journey', url: '/health/calculators/weight-loss-calculator', category: 'Health' },
  { name: 'Weight Gain Calculator', desc: 'Plan your weight gain journey', url: '/health/calculators/weight-gain-calculator', category: 'Health' },
  { name: 'Body Fat Calculator', desc: 'Calculate body fat percentage', url: '/health/calculators/body-fat-calculator', category: 'Health' },
  { name: 'Ideal Weight Calculator', desc: 'Find your ideal body weight', url: '/health/calculators/ideal-body-weight-calculator', category: 'Health' },
  { name: 'Diabetes Risk Calculator', desc: 'Assess your diabetes risk', url: '/health/calculators/diabetes-risk-calculator', category: 'Health' },
  { name: 'DRI Calculator', desc: 'Calculate your dietary reference intake', url: '/health/calculators/dri-calculator', category: 'Health' },
  { name: 'BRI Calculator', desc: 'Calculate your body roundness index', url: '/health/calculators/bri-calculator', category: 'Health' },
  { name: 'Image to WebP Converter', desc: 'Convert images to WebP format', url: '/utility-tools/image-tools/image-to-webp-converter', category: 'Utility' },
  { name: 'Word Counter', desc: 'Count words, characters, sentences, and paragraphs', url: '/utility-tools/word-counter', category: 'Utility' },
  { name: 'Password Generator', desc: 'Create secure passwords', url: '/utility-tools/password-generator', category: 'Utility' },
  { name: 'QR Code Generator', desc: 'Create professional QR codes', url: '/utility-tools/qr-code-generator', category: 'Utility' },
  { name: 'OCR PDF Generator', desc: 'Extract text from PDF documents', url: '/utility-tools/ocr-pdf-generator', category: 'Utility' },
  { name: 'Gen Z Translator', desc: 'Translate modern slang and expressions', url: '/utility-tools/genz-translator', category: 'Utility' },
  { name: 'RGB to HEX', desc: 'Convert RGB color values to hexadecimal format', url: '/utility-tools/converter-tools/rgb-to-hex-converter', category: 'Utility' },
  { name: 'Text Case Converter', desc: 'Change text case formats', url: '/utility-tools/converter-tools/text-case-converter', category: 'Utility' },
  { name: 'PDF to Image Converter', desc: 'Convert PDF pages to images (PNG/JPG)', url: '/utility-tools/converter-tools/pdf-to-image-converter', category: 'Utility' },
  { name: 'PDF Merger', desc: 'Combine multiple PDF files into one', url: '/utility-tools/converter-tools/merge-pdf', category: 'Utility' },
  { name: 'PDF Splitter', desc: 'Split PDF files into multiple pages', url: '/utility-tools/converter-tools/split-pdf', category: 'Utility' },
  { name: 'Delete PDF Pages', desc: 'Remove unwanted pages from PDF files', url: '/utility-tools/converter-tools/delete-pdf-pages', category: 'Utility' },
  { name: 'Organize PDF Pages', desc: 'Organize PDF pages in a specific order', url: '/utility-tools/converter-tools/organize-pdf-pages', category: 'Utility' },
  { name: 'Morse Code Translator', desc: 'Convert text to Morse code and decode', url: '/utility-tools/morse-code-translator', category: 'Utility' },
  { name: 'HTML to Markdown', desc: 'Convert HTML markup to Markdown', url: '/utility-tools/html-to-markdown-converter', category: 'Utility' },
  { name: 'English to IPA', desc: 'Convert text to phonetic notation', url: '/utility-tools/english-to-ipa-translator', category: 'Utility' },
  { name: 'Audio Bitrate Converter', desc: 'Convert audio between different bitrates', url: '/utility-tools/audio-bitrate-converter', category: 'Utility' },
  { name: 'Instagram Reels Downloader', desc: 'Download Instagram Reels videos', url: '/utility-tools/converter-tools/reels-downloader', category: 'Utility' },
  { name: 'TikTok Downloader', desc: 'Download TikTok videos', url: '/utility-tools/converter-tools/tiktok-downloader', category: 'Utility' },
  { name: 'QR Code Scanner', desc: 'Scan and decode QR codes', url: '/utility-tools/converter-tools/qr-code-scanner', category: 'Utility' },
  { name: 'Aspect Ratio Converter', desc: 'Calculate and convert aspect ratios', url: '/utility-tools/image-tools/aspect-ratio-converter', category: 'Utility' },
  { name: 'Color Blindness Simulator', desc: 'Simulate color vision deficiencies', url: '/utility-tools/image-tools/color-blindness-simulator', category: 'Utility' },
  { name: 'RGB to Pantone', desc: 'Convert RGB to Pantone colors', url: '/utility-tools/converter-tools/rgb-to-pantone-converter', category: 'Utility' },
  { name: 'Gold Weight Converter', desc: 'Convert precious metal weights', url: '/utility-tools/converter-tools/gold-precious-metal-weight-converter', category: 'Utility' },
  { name: 'GPA Calculator', desc: 'Calculate your grade point average', url: '/knowledge/calculators/gpa-calculator', category: 'Knowledge' },
  { name: 'Age Calculator', desc: 'Calculate age in years, months, days', url: '/knowledge/calculators/age-calculator', category: 'Knowledge' },
  { name: 'WPM Calculator', desc: 'Test your typing speed', url: '/knowledge/calculators/wpm-calculator', category: 'Knowledge' },
  { name: 'Habit Formation Calculator', desc: 'Calculate your habit formation timeline', url: '/knowledge/calculators/habit-formation-calculator', category: 'Knowledge' },
  { name: 'Language Level Calculator', desc: 'Assess your language proficiency level', url: '/knowledge/calculators/language-level-calculator', category: 'Knowledge' },
  { name: 'Fuel Calculator', desc: 'Calculate fuel consumption and cost', url: '/knowledge/calculators/fuel-calculator', category: 'Knowledge' },
  { name: 'Average Time Calculator', desc: 'Calculate average time across multiple entries', url: '/knowledge/calculators/average-time-calculator', category: 'Knowledge' },
  { name: 'Career Assessment Calculator', desc: 'Assess career strengths and direction', url: '/knowledge/calculators/career-assessment-calculator', category: 'Knowledge' },
  { name: 'Trauma Assessment Calculator', desc: 'Self-assessment for trauma awareness', url: '/knowledge/calculators/trauma-assessment-calculator', category: 'Knowledge' },
  { name: 'Anxiety Assessment Calculator', desc: 'Self-assessment for anxiety awareness', url: '/knowledge/calculators/anxiety-assessment-calculator', category: 'Knowledge' },
  { name: 'MBTI Personality', desc: 'Discover your MBTI personality type', url: '/knowledge/calculators/mbti-calculator', category: 'Knowledge' },
  { name: 'Carbon Footprint', desc: 'Calculate your environmental carbon impact', url: '/knowledge/calculators/carbon-footprint-calculator', category: 'Knowledge' },
  { name: 'Zakat Calculator', desc: 'Calculate Islamic charity (Zakat) amount', url: '/knowledge/calculators/zakat-calculator', category: 'Knowledge' },
];

// ─── Category pages ───────────────────────────────────────────────────────────

const categoryPages = [
  { name: 'Utility', url: '/utility-tools', description: 'Free online utility tools including file converters, PDF tools, image tools, generators, and everyday digital utilities.' },
  { name: 'Math', url: '/math', description: 'Free math calculators for fractions, percentages, decimals, algebra, calculus, and number conversions.' },
  { name: 'Finance', url: '/finance', description: 'Free finance calculators for loans, mortgages, taxes, budgeting, investing, and money planning.' },
  { name: 'Health', url: '/health', description: 'Free health calculators for BMI, calories, hydration, body composition, and wellness metrics.' },
  { name: 'Science', url: '/science', description: 'Free science calculators for physics, electrical engineering, and chemistry problems.' },
  { name: 'Knowledge', url: '/knowledge', description: 'Free knowledge and assessment tools for education, productivity, and personal development.' },
];

// ─── Static pages ─────────────────────────────────────────────────────────────

const staticPages = [
  { url: '/about', title: `About ${SITE_NAME}`, description: 'Learn about Tuitility, our calculator platform, and our mission to provide accurate free tools online.' },
  { url: '/contact', title: `Contact ${SITE_NAME}`, description: 'Contact Tuitility for support, feedback, partnerships, and calculator improvement suggestions.' },
  { url: '/privacy-policy', title: `${SITE_NAME} Privacy Policy`, description: 'Read the Tuitility privacy policy for information about data handling, browser processing, and user privacy.' },
  { url: '/terms-and-conditions', title: `${SITE_NAME} Terms and Conditions`, description: 'Review the Tuitility terms and conditions for acceptable use, content expectations, disclaimers, and site policies.' },
];

// ─── SEO builder ─────────────────────────────────────────────────────────────

function getPageSeo(routeUrl) {
  // Homepage
  if (routeUrl === '/') {
    return {
      title: `${SITE_NAME} - Free Online Calculators, Converters, PDF Tools & Utility Tools`,
      description: 'Explore Tuitility for free online calculators, converters, finance tools, health calculators, PDF tools, science tools, and productivity utilities.',
      keywords: 'free online calculators, utility tools, pdf tools, finance calculator, math calculator, health calculator, science calculator, converter tools',
      canonical: `${SITE_URL}/`,
    };
  }

  // Static pages
  const staticPage = staticPages.find(p => p.url === routeUrl);
  if (staticPage) {
    return {
      title: staticPage.title,
      description: staticPage.description,
      keywords: `${SITE_NAME}, online tools, free calculators`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  // Category pages
  const category = categoryPages.find(c => c.url === routeUrl);
  if (category) {
    return {
      title: `${category.name} Tools - Free Online ${category.name} Calculators | ${SITE_NAME}`,
      description: category.description,
      keywords: `${category.name.toLowerCase()} tools, ${category.name.toLowerCase()} calculators, free ${category.name.toLowerCase()} calculator online, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  // Individual tool pages
  const tool = allTools.find(t => t.url === routeUrl);
  if (tool) {
    return {
      title: `${tool.name} - Free Online ${tool.name} | ${SITE_NAME}`,
      description: `${tool.desc}. Free, fast, and accurate ${tool.name.toLowerCase()} tool. No sign-up required — use it instantly online on ${SITE_NAME}.`,
      keywords: `${tool.name.toLowerCase()}, ${tool.name.toLowerCase()} online, free ${tool.name.toLowerCase()}, ${tool.category.toLowerCase()} calculator, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  // Fallback
  const label = routeUrl.split('/').filter(Boolean).map(s => s.replace(/-/g, ' ')).join(' › ');
  return {
    title: `${label} | ${SITE_NAME}`,
    description: `Free online ${label} on ${SITE_NAME}. Accurate, fast, and browser-based.`,
    keywords: `${label}, ${SITE_NAME}, free online tools`,
    canonical: `${SITE_URL}${routeUrl}`,
  };
}

function buildStructuredData(routeUrl, seo) {
  const tool = allTools.find(t => t.url === routeUrl);
  if (tool) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      description: seo.description,
      url: seo.canonical,
      applicationCategory: 'UtilityApplication',
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

function injectSeo(html, routeUrl) {
  const seo = getPageSeo(routeUrl);
  const structuredData = buildStructuredData(routeUrl, seo);

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(seo.title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escHtml(seo.description)}" />`
  );

  // Replace meta keywords
  html = html.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
    `<meta name="keywords" content="${escHtml(seo.keywords)}" />`
  );

  // Replace OG tags
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,  `$1${escHtml(seo.title)}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,  `$1${escHtml(seo.description)}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,  `$1${escHtml(seo.canonical)}$2`);

  // Replace Twitter tags
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,  `$1${escHtml(seo.title)}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${escHtml(seo.description)}$2`);

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escHtml(seo.canonical)}" />`
  );

  // Inject / replace structured data before </head>
  const schemaTag = `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
  if (html.includes('id="seo-structured-data"')) {
    html = html.replace(/<script[^>]*id="seo-structured-data"[^>]*>[\s\S]*?<\/script>/, schemaTag);
  } else {
    html = html.replace('</head>', `  ${schemaTag}\n</head>`);
  }

  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Route list ───────────────────────────────────────────────────────────────

const routes = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-and-conditions',
  ...categoryPages.map(c => c.url),
  ...allTools.map(t => t.url),
];

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
        const dir = path.join(DIST, route);
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
  console.log('📁  Each route now has its own dist/<route>/index.html with correct SEO meta.');
  console.log('🔧  Update vercel.json to serve these static files (see instructions below).\n');
}

main();
