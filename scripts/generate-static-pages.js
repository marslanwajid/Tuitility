/**
 * generate-static-pages.js
 *
 * Generates a static index.html for every route in your Vite/React app.
 * Each file gets the correct <title>, <meta description>, <canonical>, and
 * Open Graph tags injected — so Googlebot sees real content, not a blank
 * <div id="root"></div>.
 *
 * Run AFTER `vite build`:
 *   node scripts/generate-static-pages.js
 *
 * Or use the combined script:
 *   npm run build && node scripts/generate-static-pages.js
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');

// ─── Site config (mirrors src/data/siteConfig.js) ────────────────────────────
const SITE_NAME = 'Tuitility';
const SITE_URL = 'https://tuitility.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

// ─── All tools (mirrors src/data/allTools.js) ─────────────────────────────────
const allTools = [
  { name: "Fraction Calculator", desc: "Add, subtract, multiply and divide fractions", url: "/math/calculators/fraction-calculator", category: "Math" },
  { name: "Percentage Calculator", desc: "Calculate percentages quickly and easily", url: "/math/calculators/percentage-calculator", category: "Math" },
  { name: "Decimal to Fraction", desc: "Convert decimals to fractions instantly", url: "/math/calculators/decimal-to-fraction-calculator", category: "Math" },
  { name: "LCM Calculator", desc: "Find least common multiple", url: "/math/calculators/lcm-calculator", category: "Math" },
  { name: "Binary Calculator", desc: "Convert and calculate binary numbers", url: "/math/calculators/binary-calculator", category: "Math" },
  { name: "LCD Calculator", desc: "Find lowest common denominator", url: "/math/calculators/lcd-calculator", category: "Math" },
  { name: "Compare Fractions", desc: "Compare multiple fractions", url: "/math/calculators/comparing-fractions-calculator", category: "Math" },
  { name: "Decimal Calculator", desc: "Perform decimal arithmetic operations", url: "/math/calculators/decimal-calculator", category: "Math" },
  { name: "Compare Decimals", desc: "Compare multiple decimals", url: "/math/calculators/comparing-decimals-calculator", category: "Math" },
  { name: "Fraction to Percent", desc: "Convert fractions to percentages", url: "/math/calculators/fraction-to-percent-calculator", category: "Math" },
  { name: "Improper to Mixed Fraction", desc: "Convert improper fractions to mixed numbers", url: "/math/calculators/improper-fraction-to-mixed-calculator", category: "Math" },
  { name: "Percent to Fraction Calculator", desc: "Convert percentages to fractions", url: "/math/calculators/percent-to-fraction-calculator", category: "Math" },
  { name: "SSE Calculator", desc: "Calculate sum of squares of errors", url: "/math/calculators/sse-calculator", category: "Math" },
  { name: "Derivative Calculator", desc: "Calculate derivatives of functions", url: "/math/calculators/derivative-calculator", category: "Math" },
  { name: "Integral Calculator", desc: "Calculate definite and indefinite integrals", url: "/math/calculators/integral-calculator", category: "Math" },
  { name: "Mortgage Calculator", desc: "Calculate monthly mortgage payments with taxes, insurance, PMI", url: "/finance/calculators/mortgage-calculator", category: "Finance" },
  { name: "Amortization Calculator", desc: "Calculate amortization schedules, monthly payments, and total interest over time", url: "/finance/calculators/amortization-calculator", category: "Finance" },
  { name: "Loan Calculator", desc: "Calculate loan payments with down payment and fees", url: "/finance/calculators/loan-calculator", category: "Finance" },
  { name: "Currency Calculator", desc: "Convert between 170+ world currencies with real-time rates", url: "/finance/calculators/currency-calculator", category: "Finance" },
  { name: "House Affordability Calculator", desc: "Calculate how much house you can afford", url: "/finance/calculators/house-affordability-calculator", category: "Finance" },
  { name: "Compound Interest Calculator", desc: "Calculate investment growth with compound interest", url: "/finance/calculators/compound-interest-calculator", category: "Finance" },
  { name: "ROI Calculator", desc: "Calculate return on investment and annualized returns", url: "/finance/calculators/roi-calculator", category: "Finance" },
  { name: "Business Loan Calculator", desc: "Calculate business loan payments", url: "/finance/calculators/business-loan-calculator", category: "Finance" },
  { name: "Credit Card Calculator", desc: "Calculate credit card payments, interest, and payoff time", url: "/finance/calculators/credit-card-calculator", category: "Finance" },
  { name: "Investment Calculator", desc: "Calculate investment growth, compound returns, and future value", url: "/finance/calculators/investment-calculator", category: "Finance" },
  { name: "Tax Calculator", desc: "Calculate federal and state income taxes, deductions, and credits", url: "/finance/calculators/tax-calculator", category: "Finance" },
  { name: "Retirement Calculator", desc: "Calculate retirement savings goals, monthly contributions, and future income", url: "/finance/calculators/retirement-calculator", category: "Finance" },
  { name: "Sales Tax Calculator", desc: "Calculate sales tax, subtotal, and total amount for purchases", url: "/finance/calculators/sales-tax-calculator", category: "Finance" },
  { name: "Debt Payoff Calculator", desc: "Calculate debt payoff time, total interest, and payment strategies", url: "/finance/calculators/debt-payoff-calculator", category: "Finance" },
  { name: "Insurance Calculator", desc: "Calculate insurance premiums, coverage costs, and policy comparisons", url: "/finance/calculators/insurance-calculator", category: "Finance" },
  { name: "Budget Calculator", desc: "Create and manage personal budgets with the 50-30-20 rule and custom allocations", url: "/finance/calculators/budget-calculator", category: "Finance" },
  { name: "Rental Property Calculator", desc: "Calculate rental property ROI, cash flow, and investment returns", url: "/finance/calculators/rental-property-calculator", category: "Finance" },
  { name: "Debt Income Calculator", desc: "Calculate your debt-to-income ratio to assess financial health and loan eligibility", url: "/finance/calculators/debt-income-calculator", category: "Finance" },
  { name: "Down Payment Calculator", desc: "Calculate down payment amount, loan amount, and monthly mortgage payments", url: "/finance/calculators/down-payment-calculator", category: "Finance" },
  { name: "Present Value Calculator", desc: "Calculate the present value of future cash flows and investments", url: "/finance/calculators/present-value-calculator", category: "Finance" },
  { name: "Future Value Calculator", desc: "Calculate the future value of investments and savings with compound interest", url: "/finance/calculators/future-value-calculator", category: "Finance" },
  { name: "Wave Speed Calculator", desc: "Calculate wave speed, frequency, and wavelength", url: "/science/calculators/wave-speed-calculator", category: "Science" },
  { name: "Gravity Calculator", desc: "Calculate gravitational force and acceleration", url: "/science/calculators/gravity-calculator", category: "Science" },
  { name: "Work Power Calculator", desc: "Calculate work, power, and energy", url: "/science/calculators/work-power-calculator", category: "Science" },
  { name: "DBm to Watts Calculator", desc: "Convert between dBm and watts", url: "/science/calculators/dbm-watts-calculator", category: "Science" },
  { name: "DBm to Milliwatts Calculator", desc: "Convert between dBm and milliwatts", url: "/science/calculators/dbm-milliwatts-calculator", category: "Science" },
  { name: "Capacitance Calculator", desc: "Calculate electrical capacitance", url: "/science/calculators/capacitance-calculator", category: "Science" },
  { name: "Electric Flux Calculator", desc: "Calculate electric flux through surfaces", url: "/science/calculators/electric-flux-calculator", category: "Science" },
  { name: "Average Atomic Mass Calculator", desc: "Calculate average atomic mass of elements", url: "/science/calculators/average-atomic-mass-calculator", category: "Science" },
  { name: "BMI Calculator", desc: "Calculate your body mass index and weight category", url: "/health/calculators/bmi-calculator", category: "Health" },
  { name: "Calorie Calculator", desc: "Calculate daily calorie needs based on your goals", url: "/health/calculators/calorie-calculator", category: "Health" },
  { name: "Calorie Burn Calculator", desc: "Estimate calories burned from exercise, activity duration, and body weight", url: "/health/calculators/calorie-burn-calculator", category: "Health" },
  { name: "Water Intake Calculator", desc: "Calculate your daily water intake requirements", url: "/health/calculators/water-intake-calculator", category: "Health" },
  { name: "Weight Loss Calculator", desc: "Plan your weight loss journey with calorie targets", url: "/health/calculators/weight-loss-calculator", category: "Health" },
  { name: "Weight Gain Calculator", desc: "Plan your weight gain journey with nutrition targets", url: "/health/calculators/weight-gain-calculator", category: "Health" },
  { name: "Body Fat Calculator", desc: "Calculate your body fat percentage accurately", url: "/health/calculators/body-fat-calculator", category: "Health" },
  { name: "Ideal Weight Calculator", desc: "Find your ideal body weight range", url: "/health/calculators/ideal-body-weight-calculator", category: "Health" },
  { name: "Diabetes Risk Calculator", desc: "Assess your type 2 diabetes risk factors", url: "/health/calculators/diabetes-risk-calculator", category: "Health" },
  { name: "DRI Calculator", desc: "Calculate your dietary reference intake for nutrients", url: "/health/calculators/dri-calculator", category: "Health" },
  { name: "BRI Calculator", desc: "Calculate your body roundness index", url: "/health/calculators/bri-calculator", category: "Health" },
  { name: "Image to WebP Converter", desc: "Convert images to WebP format for faster web loading", url: "/utility-tools/image-tools/image-to-webp-converter", category: "Utility" },
  { name: "Word Counter", desc: "Count words, characters, sentences, and paragraphs in your text", url: "/utility-tools/word-counter", category: "Utility" },
  { name: "Password Generator", desc: "Create strong, secure passwords instantly", url: "/utility-tools/password-generator", category: "Utility" },
  { name: "QR Code Generator", desc: "Create professional QR codes for URLs, text, and more", url: "/utility-tools/qr-code-generator", category: "Utility" },
  { name: "OCR PDF Generator", desc: "Extract text from PDF documents using OCR", url: "/utility-tools/ocr-pdf-generator", category: "Utility" },
  { name: "Gen Z Translator", desc: "Translate modern Gen Z slang and expressions", url: "/utility-tools/genz-translator", category: "Utility" },
  { name: "RGB to HEX Converter", desc: "Convert RGB color values to HEX format", url: "/utility-tools/converter-tools/rgb-to-hex-converter", category: "Utility" },
  { name: "Text Case Converter", desc: "Convert text between uppercase, lowercase, title case and more", url: "/utility-tools/converter-tools/text-case-converter", category: "Utility" },
  { name: "PDF to Image Converter", desc: "Convert PDF pages to high-quality PNG or JPG images", url: "/utility-tools/converter-tools/pdf-to-image-converter", category: "Utility" },
  { name: "PDF Merger", desc: "Combine multiple PDF files into one document", url: "/utility-tools/converter-tools/merge-pdf", category: "Utility" },
  { name: "PDF Splitter", desc: "Split PDF files into separate pages or sections", url: "/utility-tools/converter-tools/split-pdf", category: "Utility" },
  { name: "Delete PDF Pages", desc: "Remove unwanted pages from your PDF files", url: "/utility-tools/converter-tools/delete-pdf-pages", category: "Utility" },
  { name: "Organize PDF Pages", desc: "Reorder and organize PDF pages in any sequence", url: "/utility-tools/converter-tools/organize-pdf-pages", category: "Utility" },
  { name: "Morse Code Translator", desc: "Convert text to Morse code and decode Morse back to text", url: "/utility-tools/morse-code-translator", category: "Utility" },
  { name: "HTML to Markdown Converter", desc: "Convert HTML markup to clean Markdown format", url: "/utility-tools/html-to-markdown-converter", category: "Utility" },
  { name: "English to IPA Translator", desc: "Convert English text to IPA phonetic notation", url: "/utility-tools/english-to-ipa-translator", category: "Utility" },
  { name: "Audio Bitrate Converter", desc: "Convert audio files between different bitrates", url: "/utility-tools/audio-bitrate-converter", category: "Utility" },
  { name: "Instagram Reels Downloader", desc: "Download Instagram Reels videos easily", url: "/utility-tools/converter-tools/reels-downloader", category: "Utility" },
  { name: "TikTok Downloader", desc: "Download TikTok videos without watermark", url: "/utility-tools/converter-tools/tiktok-downloader", category: "Utility" },
  { name: "QR Code Scanner", desc: "Scan and decode QR codes from images", url: "/utility-tools/converter-tools/qr-code-scanner", category: "Utility" },
  { name: "Aspect Ratio Converter", desc: "Calculate and convert image aspect ratios", url: "/utility-tools/image-tools/aspect-ratio-converter", category: "Utility" },
  { name: "Color Blindness Simulator", desc: "Simulate how designs look with color vision deficiencies", url: "/utility-tools/image-tools/color-blindness-simulator", category: "Utility" },
  { name: "RGB to Pantone Converter", desc: "Convert RGB colors to the closest Pantone match", url: "/utility-tools/converter-tools/rgb-to-pantone-converter", category: "Utility" },
  { name: "Gold Weight Converter", desc: "Convert precious metal weights between units", url: "/utility-tools/converter-tools/gold-precious-metal-weight-converter", category: "Utility" },
  { name: "GPA Calculator", desc: "Calculate your grade point average from your grades", url: "/knowledge/calculators/gpa-calculator", category: "Knowledge" },
  { name: "Age Calculator", desc: "Calculate exact age in years, months, and days", url: "/knowledge/calculators/age-calculator", category: "Knowledge" },
  { name: "WPM Calculator", desc: "Test and improve your typing speed in words per minute", url: "/knowledge/calculators/wpm-calculator", category: "Knowledge" },
  { name: "Habit Formation Calculator", desc: "Track and calculate your habit formation progress", url: "/knowledge/calculators/habit-formation-calculator", category: "Knowledge" },
  { name: "Language Level Calculator", desc: "Assess and calculate your language proficiency level", url: "/knowledge/calculators/language-level-calculator", category: "Knowledge" },
  { name: "Fuel Calculator", desc: "Calculate fuel consumption and trip costs", url: "/knowledge/calculators/fuel-calculator", category: "Knowledge" },
  { name: "Average Time Calculator", desc: "Calculate average time from multiple time values", url: "/knowledge/calculators/average-time-calculator", category: "Knowledge" },
  { name: "Career Assessment Calculator", desc: "Assess your career strengths and direction", url: "/knowledge/calculators/career-assessment-calculator", category: "Knowledge" },
  { name: "Trauma Assessment Calculator", desc: "Self-assess trauma symptoms with a guided questionnaire", url: "/knowledge/calculators/trauma-assessment-calculator", category: "Knowledge" },
  { name: "Anxiety Assessment Calculator", desc: "Self-assess anxiety levels with a guided questionnaire", url: "/knowledge/calculators/anxiety-assessment-calculator", category: "Knowledge" },
  { name: "MBTI Personality Calculator", desc: "Discover your Myers-Briggs personality type", url: "/knowledge/calculators/mbti-calculator", category: "Knowledge" },
  { name: "Carbon Footprint Calculator", desc: "Calculate your environmental carbon footprint", url: "/knowledge/calculators/carbon-footprint-calculator", category: "Knowledge" },
  { name: "Zakat Calculator", desc: "Calculate your Islamic Zakat charity amount accurately", url: "/knowledge/calculators/zakat-calculator", category: "Knowledge" },
];

// ─── Category pages ───────────────────────────────────────────────────────────
const categoryPages = [
  { url: '/math', name: 'Math', description: 'Free online math calculators for fractions, percentages, algebra, calculus, decimals and more.' },
  { url: '/finance', name: 'Finance', description: 'Free online finance calculators for loans, mortgages, taxes, budgeting, investing, and retirement planning.' },
  { url: '/science', name: 'Science', description: 'Free online science calculators for physics, chemistry, and electrical engineering problems.' },
  { url: '/health', name: 'Health', description: 'Free online health calculators for BMI, calories, water intake, body fat, and wellness goals.' },
  { url: '/utility-tools', name: 'Utility Tools', description: 'Free online utility tools for PDF editing, image conversion, QR codes, password generation, and more.' },
  { url: '/knowledge', name: 'Knowledge', description: 'Free online knowledge tools for GPA, age, typing speed, personality, and self-assessment.' },
];

// ─── Static pages ──────────────────────────────────────────────────────────────
const staticPages = [
  { url: '/', title: `${SITE_NAME} - Free Online Calculators, PDF Tools and Converters`, description: 'Explore Tuitility for free online calculators, converters, finance tools, health calculators, PDF tools, science tools, and productivity utilities.' },
  { url: '/about', title: `About ${SITE_NAME}`, description: `Learn about ${SITE_NAME}, our calculator platform, and our mission to provide accurate free tools online.` },
  { url: '/contact', title: `Contact ${SITE_NAME}`, description: `Contact ${SITE_NAME} for support, feedback, partnerships, and calculator improvement suggestions.` },
  { url: '/privacy-policy', title: `${SITE_NAME} Privacy Policy`, description: `Read the ${SITE_NAME} privacy policy for information about data handling, browser processing, and user privacy.` },
  { url: '/terms-and-conditions', title: `${SITE_NAME} Terms and Conditions`, description: `Review the ${SITE_NAME} terms and conditions for acceptable use, content expectations, disclaimers, and site policies.` },
];

// ─── Build page metadata for any route ────────────────────────────────────────
function getPageMeta(route) {
  // Check static pages
  const staticPage = staticPages.find(p => p.url === route);
  if (staticPage) {
    return {
      title: staticPage.title,
      description: staticPage.description,
      canonical: `${SITE_URL}${route === '/' ? '/' : route}`,
    };
  }

  // Check category pages
  const categoryPage = categoryPages.find(p => p.url === route);
  if (categoryPage) {
    return {
      title: `${categoryPage.name} Calculators & Tools - Free Online | ${SITE_NAME}`,
      description: categoryPage.description,
      canonical: `${SITE_URL}${route}`,
    };
  }

  // Check tool pages
  const tool = allTools.find(t => t.url === route);
  if (tool) {
    return {
      title: `${tool.name} - Free Online ${tool.category} Tool | ${SITE_NAME}`,
      description: `${tool.desc} — Free online tool on ${SITE_NAME}. No signup required, works in your browser.`,
      canonical: `${SITE_URL}${route}`,
    };
  }

  // Fallback
  const slug = route.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${slug} | ${SITE_NAME}`,
    description: `Free online ${slug.toLowerCase()} tool on ${SITE_NAME}.`,
    canonical: `${SITE_URL}${route}`,
  };
}

// ─── Inject meta tags into HTML template ──────────────────────────────────────
function injectMeta(html, meta) {
  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${meta.canonical}" />`
  );

  // Replace OG title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );

  // Replace OG description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );

  // Replace OG URL
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${meta.canonical}" />`
  );

  // Replace Twitter title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );

  // Replace Twitter description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Main ──────────────────────────────────────────────────────────────────────
function main() {
  if (!existsSync(DIST)) {
    console.error('❌ /dist not found. Run `npm run build` first.');
    process.exit(1);
  }

  const templateHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

  // Collect all routes
  const allRoutes = [
    ...staticPages.map(p => p.url),
    ...categoryPages.map(p => p.url),
    ...allTools.map(t => t.url),
  ];

  let success = 0;
  let failed = 0;

  for (const route of allRoutes) {
    try {
      const meta = getPageMeta(route);
      const html = injectMeta(templateHtml, meta);

      if (route === '/') {
        // Root already exists, just update it
        writeFileSync(join(DIST, 'index.html'), html, 'utf-8');
      } else {
        // Create folder + index.html for each route
        const segments = route.split('/').filter(Boolean);
        const dir = join(DIST, ...segments);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), html, 'utf-8');
      }

      console.log(`✅ ${route}`);
      success++;
    } catch (err) {
      console.error(`❌ ${route} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} pages generated, ${failed} failed.`);
  console.log(`📁 Each route now has its own /dist/<route>/index.html with correct SEO meta tags.`);
  console.log(`🚀 Deploy /dist to Vercel — Googlebot will see real titles and descriptions for all ${success} pages!`);
}

main();
