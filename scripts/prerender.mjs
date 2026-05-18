/**
 * Tuitility Pre-render Script — Full Content Injection
 * ─────────────────────────────────────────────────────
 * Run after `vite build`:  node scripts/prerender.mjs
 *
 * For every route this script:
 *  1. Injects correct <title>, <meta>, <canonical>, JSON-LD into <head>
 *  2. Injects a fully crawlable <div id="ssg-content"> BEFORE <div id="root">
 *     containing: overview, how-to steps, capabilities, FAQs, related tools
 *     — all as real HTML that Google reads immediately, no JS needed.
 *  3. React mounts into #root normally on top — users see zero difference.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

const SITE_NAME = 'Tuitility';
const SITE_URL = 'https://tuitility.vercel.app';

// ─── All Tools ────────────────────────────────────────────────────────────────
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

// ─── Categories ───────────────────────────────────────────────────────────────
const toolCategories = [
  { name: 'Utility', url: '/utility-tools', description: 'File converters, generators, downloaders, and day-to-day digital tools.' },
  { name: 'Math', url: '/math', description: 'Arithmetic, algebra, calculus, fractions, percentages, and number tools.' },
  { name: 'Finance', url: '/finance', description: 'Loans, mortgages, taxes, budgeting, investing, and money planning calculators.' },
  { name: 'Health', url: '/health', description: 'BMI, calorie, hydration, body composition, and wellness calculators.' },
  { name: 'Science', url: '/science', description: 'Physics, electrical, and chemistry calculators for study and problem solving.' },
  { name: 'Knowledge', url: '/knowledge', description: 'Assessment, education, productivity, and personal development tools.' },
];

// ─── Playbooks ────────────────────────────────────────────────────────────────
const CATEGORY_PLAYBOOK = {
  Math: {
    audience: ['students checking homework', 'teachers building examples', 'parents reviewing answers', 'professionals validating quick calculations'],
    useCases: ['classroom practice', 'exam preparation', 'worksheet checking', 'everyday number conversions'],
    pitfalls: ['typing the wrong sign', 'mixing units or formats', 'rounding too early', 'skipping validation of the final result'],
    tips: ['check whether the input expects decimals, fractions, or whole numbers', 'compare two scenarios when you want to study patterns', 'use related tools to cross-check conversions and percentages'],
  },
  Finance: {
    audience: ['borrowers comparing offers', 'home buyers planning costs', 'investors estimating growth', 'households managing budgets'],
    useCases: ['loan planning', 'investment analysis', 'monthly budgeting', 'purchase comparisons'],
    pitfalls: ['ignoring fees and taxes', 'using unrealistic rates', 'forgetting contribution frequency', 'treating estimates as advice instead of planning support'],
    tips: ['run a conservative, expected, and aggressive scenario', 'check the effect of changing only one variable at a time', 'use the result as a planning estimate before final decisions'],
  },
  Science: {
    audience: ['students solving assignments', 'teachers preparing lessons', 'lab users checking values', 'curious learners exploring formulas'],
    useCases: ['physics homework', 'lab preparation', 'engineering study', 'concept review'],
    pitfalls: ['mixing incompatible units', 'using the wrong symbol meaning', 'forgetting exponents or scientific notation', 'entering values without checking assumptions'],
    tips: ['confirm every unit before calculating', 'use the page to validate manual work line by line', 'compare examples with known textbook values when possible'],
  },
  Health: {
    audience: ['people tracking wellness goals', 'fitness beginners', 'coaches creating estimates', 'users monitoring daily habits'],
    useCases: ['weight planning', 'hydration tracking', 'nutrition planning', 'wellness check-ins'],
    pitfalls: ['treating estimates as diagnosis', 'using old body measurements', 'ignoring activity level changes', 'making decisions without context from a professional when needed'],
    tips: ['update measurements regularly', 'compare estimates across time instead of relying on one reading', 'use health calculators for planning and awareness, not diagnosis'],
  },
  Utility: {
    audience: ['creators working with files', 'students handling documents', 'teams sharing quick conversions', 'everyday users solving digital tasks'],
    useCases: ['document conversion', 'text cleanup', 'download preparation', 'file organization'],
    pitfalls: ['using the wrong input format', 'expecting unsupported formatting to stay intact', 'forgetting output settings', 'not checking privacy behavior for file workflows'],
    tips: ['review the output before downloading or reusing it', 'use related tools for cleanup after conversion', 'keep a source copy when you are processing documents or media'],
  },
  Knowledge: {
    audience: ['students organizing study plans', 'users exploring self-assessments', 'professionals tracking habits', 'learners improving productivity'],
    useCases: ['study planning', 'self-assessment', 'habit tracking', 'productivity improvement'],
    pitfalls: ['answering too quickly', 'using incomplete context', 'treating estimates as definitive outcomes', 'ignoring trends across time'],
    tips: ['revisit the tool when inputs change', 'use results to guide reflection and planning', 'combine this tool with related pages for a fuller workflow'],
  },
};

const WORKFLOWS = {
  calculator: ['Enter your values into the input fields', 'Choose an option or mode if needed', 'Click calculate to get your result instantly', 'Review the result and compare scenarios as needed'],
  converter:  ['Paste or upload the source input', 'Set the target format or output preference', 'Convert instantly in the browser', 'Copy, review, or download the output'],
  generator:  ['Define the content or settings', 'Adjust generation options if needed', 'Generate the output instantly', 'Download, copy, or reuse the result'],
  translator: ['Enter the source text into the input area', 'Choose settings or tone if available', 'Translate instantly', 'Review and copy the result'],
  downloader: ['Paste the source link into the field', 'Validate the format or supported source', 'Process the request', 'Download or reuse the final file'],
  scanner:    ['Upload an image or enable the camera', 'Scan the input', 'Read the decoded result', 'Copy or open the extracted content'],
  organizer:  ['Upload the source file', 'Set ordering or structure changes', 'Apply the changes in the browser', 'Download the updated file'],
  merger:     ['Upload all source files', 'Confirm order and settings', 'Merge them in the browser', 'Download the final combined file'],
  splitter:   ['Upload the source file', 'Choose page ranges or split mode', 'Split the file in the browser', 'Download each output file'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const esc = (str) => String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lc  = (s)   => s.charAt(0).toLowerCase() + s.slice(1);

const detectKind = (tool) => {
  const n = tool.name.toLowerCase();
  for (const k of ['converter','generator','translator','downloader','scanner','organizer','merger','splitter']) if (n.includes(k)) return k;
  return 'calculator';
};

// ─── Content builders ─────────────────────────────────────────────────────────
const buildFaqs = (tool) => {
  const pb = CATEGORY_PLAYBOOK[tool.category];
  const kind = detectKind(tool);
  return [
    { q: `What does the ${tool.name} do?`,
      a: `The ${tool.name} helps you ${lc(tool.desc)}. It runs entirely in your browser so results are instant on desktop or mobile.` },
    { q: `Who should use this ${kind}?`,
      a: `This tool is useful for ${pb.audience.slice(0,3).join(', ')}, and anyone who wants a faster way to complete ${tool.category.toLowerCase()} tasks online.` },
    { q: `Is the ${tool.name} free?`,
      a: `Yes. ${SITE_NAME} provides the ${tool.name} completely free — no account, no install, no payment required.` },
    { q: `Does this work on mobile devices?`,
      a: `Yes. The tool is fully responsive and works on phones, tablets, and desktop browsers.` },
    { q: `What should I double-check before relying on the result?`,
      a: `Check your inputs, units, formatting, and scenario assumptions. The tool speeds up the workflow but result quality depends on entering the right information.` },
    { q: `What should I do after using the ${tool.name}?`,
      a: `Compare additional scenarios if needed, validate key assumptions, and explore related ${tool.category.toLowerCase()} tools on ${SITE_NAME} for a more complete workflow.` },
  ];
};

// ─── HTML block builders ──────────────────────────────────────────────────────
function buildToolContentHtml(tool) {
  const pb      = CATEGORY_PLAYBOOK[tool.category];
  const kind    = detectKind(tool);
  const steps   = (WORKFLOWS[kind] || WORKFLOWS.calculator);
  const related = allTools.filter(t => t.category === tool.category && t.url !== tool.url).slice(0, 5);
  const faqs    = buildFaqs(tool);

  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article itemscope itemtype="https://schema.org/WebApplication">
    <h1 itemprop="name">${esc(tool.name)} — Free Online ${esc(tool.category)} ${esc(kind.charAt(0).toUpperCase()+kind.slice(1))}</h1>
    <p itemprop="description">${esc(tool.desc)}. Free, fast, and browser-based on ${SITE_NAME} — no sign-up required.</p>

    <section>
      <h2>What is the ${esc(tool.name)}?</h2>
      <p>The ${esc(tool.name)} is a free online ${esc(kind)} built to ${esc(lc(tool.desc))}. This page keeps the core workflow in one place so results are faster to reach and easier to trust.</p>
      <p>Useful for ${pb.useCases.join(', ')}, and any workflow where a fast, accurate result matters. All processing happens in your browser — nothing is uploaded to a server.</p>
    </section>

    <section>
      <h2>How to Use the ${esc(tool.name)}</h2>
      <ol>
        ${steps.map((s,i) => `<li><strong>Step ${i+1}:</strong> ${esc(s)}.</li>`).join('\n        ')}
      </ol>
    </section>

    <section>
      <h2>What This Tool Can Do</h2>
      <ul>
        <li>Handle the core ${esc(kind)} workflow directly in the browser — no software or sign-up needed.</li>
        <li>Support repeat use when you need to compare more than one scenario or input set.</li>
        <li>Display results in a clear, easy-to-scan format you can copy or act on immediately.</li>
        <li>Connect to related ${esc(tool.category.toLowerCase())} tools on ${SITE_NAME} for deeper follow-up.</li>
      </ul>
    </section>

    <section>
      <h2>When to Use the ${esc(tool.name)}</h2>
      <p>Use this tool when you want to ${esc(lc(tool.desc))} without leaving the browser. It is especially useful during ${esc(pb.useCases[0])} and ${esc(pb.useCases[1])}.</p>
      <p>A good fit for ${esc(pb.audience[0])} and ${esc(pb.audience[1])} who prefer a lightweight online tool over a spreadsheet or desktop app.</p>
    </section>

    <section>
      <h2>Tips for Best Results</h2>
      <ul>
        ${pb.tips.map(t => `<li>${esc(t)}</li>`).join('\n        ')}
        <li>Save time by using the ${esc(tool.name.toLowerCase())} alongside related ${esc(tool.category.toLowerCase())} tools on ${SITE_NAME}.</li>
      </ul>
    </section>

    <section>
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        ${pb.pitfalls.map(p => `<li>${esc(p)}</li>`).join('\n        ')}
        <li>Using the ${esc(tool.name.toLowerCase())} without checking whether the result matches your actual goal or context.</li>
      </ul>
    </section>

    <section>
      <h2>Frequently Asked Questions</h2>
      ${faqs.map(f => `<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">${esc(f.q)}</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${esc(f.a)}</p>
        </div>
      </div>`).join('\n      ')}
    </section>

    ${related.length > 0 ? `<section>
      <h2>Related ${esc(tool.category)} Tools on ${SITE_NAME}</h2>
      <ul>
        ${related.map(r => `<li><a href="${esc(r.url)}">${esc(r.name)}</a> — ${esc(r.desc)}</li>`).join('\n        ')}
      </ul>
    </section>` : ''}
  </article>
</div>`;
}

function buildCategoryContentHtml(category) {
  const tools = allTools.filter(t => t.category === category.name);
  const pb    = CATEGORY_PLAYBOOK[category.name];

  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article>
    <h1>Free ${esc(category.name)} Tools — Online ${esc(category.name)} Calculators and Converters | ${SITE_NAME}</h1>
    <p>${esc(category.description)} All ${tools.length} tools are free, browser-based, and require no sign-up.</p>

    <section>
      <h2>Who These Tools Are For</h2>
      <ul>${pb.audience.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
    </section>

    <section>
      <h2>Common Use Cases</h2>
      <ul>${pb.useCases.map(u => `<li>${esc(u)}</li>`).join('')}</ul>
    </section>

    <section>
      <h2>All ${esc(category.name)} Tools (${tools.length} available)</h2>
      <ul>
        ${tools.map(t => `<li><a href="${esc(t.url)}">${esc(t.name)}</a> — ${esc(t.desc)}</li>`).join('\n        ')}
      </ul>
    </section>

    <section>
      <h2>Tips for ${esc(category.name)} Tools</h2>
      <ul>${pb.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>
  </article>
</div>`;
}

function buildHomepageContentHtml() {
  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article>
    <h1>Tuitility — Free Online Calculators, Converters, and Utility Tools</h1>
    <p>Tuitility offers ${allTools.length}+ free online tools across math, finance, health, science, utility, and knowledge categories. All tools run in the browser — no sign-up, no install required.</p>
    <section>
      <h2>Tool Categories</h2>
      <ul>
        ${toolCategories.map(c => `<li><a href="${esc(c.url)}">${esc(c.name)} Tools</a> — ${esc(c.description)}</li>`).join('\n        ')}
      </ul>
    </section>
    <section>
      <h2>Popular Free Tools</h2>
      <ul>
        ${allTools.slice(0, 15).map(t => `<li><a href="${esc(t.url)}">${esc(t.name)}</a> — ${esc(t.desc)}</li>`).join('\n        ')}
      </ul>
    </section>
  </article>
</div>`;
}

// ─── SEO head builders ────────────────────────────────────────────────────────
function getPageSeo(routeUrl) {
  if (routeUrl === '/') return {
    title: `${SITE_NAME} - Free Online Calculators, PDF Tools, Converters and Utilities`,
    description: `Explore ${allTools.length}+ free online tools on Tuitility — calculators, converters, PDF tools, health trackers, and more. No sign-up needed.`,
    keywords: `free online calculators, utility tools, pdf tools, finance calculator, math calculator, health calculator, converter tools, ${SITE_NAME}`,
    canonical: `${SITE_URL}/`,
  };

  const statics = {
    '/about':              { title: `About ${SITE_NAME}`, description: `Learn about Tuitility, our mission to provide free accurate online tools, and how we build calculators and converters for everyday use.` },
    '/contact':            { title: `Contact ${SITE_NAME}`, description: `Get in touch with the Tuitility team for support, feedback, or partnership enquiries.` },
    '/privacy-policy':     { title: `Privacy Policy — ${SITE_NAME}`, description: `Read the Tuitility privacy policy. All tools run in your browser — we do not store or sell your data.` },
    '/terms-and-conditions': { title: `Terms and Conditions — ${SITE_NAME}`, description: `Review Tuitility terms and conditions for acceptable use, disclaimers, and site policies.` },
  };
  if (statics[routeUrl]) return { ...statics[routeUrl], keywords: `${SITE_NAME}, online tools, free calculators`, canonical: `${SITE_URL}${routeUrl}` };

  const cat = toolCategories.find(c => c.url === routeUrl);
  if (cat) {
    const count = allTools.filter(t => t.category === cat.name).length;
    return {
      title: `Free ${cat.name} Tools — ${count} Online ${cat.name} Calculators | ${SITE_NAME}`,
      description: `${cat.description} Browse ${count} free ${cat.name.toLowerCase()} tools on ${SITE_NAME}. Fast, accurate, and browser-based.`,
      keywords: `${cat.name.toLowerCase()} tools, ${cat.name.toLowerCase()} calculators, free ${cat.name.toLowerCase()} calculator online, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  const tool = allTools.find(t => t.url === routeUrl);
  if (tool) {
    const kind = detectKind(tool);
    return {
      title: `${tool.name} — Free Online ${tool.name} | ${SITE_NAME}`,
      description: `${tool.desc}. Free, fast, and accurate ${tool.name.toLowerCase()} — use it instantly in your browser on ${SITE_NAME}. No sign-up required.`,
      keywords: `${tool.name.toLowerCase()}, ${tool.name.toLowerCase()} online, free ${tool.name.toLowerCase()}, ${tool.category.toLowerCase()} ${kind}, ${SITE_NAME}`,
      canonical: `${SITE_URL}${routeUrl}`,
    };
  }

  const label = routeUrl.split('/').filter(Boolean).map(s => s.replace(/-/g, ' ')).join(' — ');
  return { title: `${label} | ${SITE_NAME}`, description: `Free online ${label} on ${SITE_NAME}.`, keywords: `${label}, ${SITE_NAME}`, canonical: `${SITE_URL}${routeUrl}` };
}

function buildStructuredData(routeUrl, seo) {
  const tool = allTools.find(t => t.url === routeUrl);
  if (tool) return {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: tool.name, description: seo.description, url: seo.canonical,
    applicationCategory: 'UtilityApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
  return {
    '@context': 'https://schema.org', '@type': 'WebPage',
    name: seo.title, description: seo.description, url: seo.canonical,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

// ─── HTML injection ───────────────────────────────────────────────────────────
function injectHead(html, routeUrl) {
  const seo = getPageSeo(routeUrl);
  const sd  = buildStructuredData(routeUrl, seo);

  html = html.replace(/<title>[^<]*<\/title>/,                                   `<title>${esc(seo.title)}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,        `$1${esc(seo.description)}$2`);
  html = html.replace(/(<meta\s+name="keywords"\s+content=")[^"]*(")/,          `$1${esc(seo.keywords)}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,      `$1${esc(seo.title)}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,`$1${esc(seo.description)}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,        `$1${esc(seo.canonical)}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,     `$1${esc(seo.title)}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,`$1${esc(seo.description)}$2`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(seo.canonical)}" />`);

  const schemaTag = `<script type="application/ld+json">${JSON.stringify(sd)}</script>`;
  if (/<script[^>]*type="application\/ld\+json"/.test(html)) {
    html = html.replace(/<script[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/, schemaTag);
  } else {
    html = html.replace('</head>', `  ${schemaTag}\n</head>`);
  }
  return html;
}

function injectBodyContent(html, routeUrl) {
  const tool = allTools.find(t => t.url === routeUrl);
  const cat  = toolCategories.find(c => c.url === routeUrl);

  let content = '';
  if (tool)          content = buildToolContentHtml(tool);
  else if (cat)      content = buildCategoryContentHtml(cat);
  else if (routeUrl === '/') content = buildHomepageContentHtml();

  if (!content) return html;
  return html.replace('<div id="root">', `${content}\n    <div id="root">`);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = ['/', '/about', '/contact', '/privacy-policy', '/terms-and-conditions',
  ...toolCategories.map(c => c.url),
  ...allTools.map(t => t.url),
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌  dist/index.html not found. Run `npm run build:vite` first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  let ok = 0, fail = 0;
  console.log(`\n🚀  Pre-rendering ${routes.length} routes with full HTML content injection...\n`);

  for (const route of routes) {
    try {
      let html = injectHead(template, route);
      html = injectBodyContent(html, route);

      if (route === '/') {  
        fs.writeFileSync(templatePath, html, 'utf-8');
      } else {
        const dir = path.join(DIST, route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8');
      }
      console.log(`  ✅  ${route}`);
      ok++;
    } catch (err) {
      console.error(`  ❌  ${route} — ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✨  Done: ${ok} pages pre-rendered${fail ? `, ${fail} failed` : ''}.`);
  console.log(`📄  Each page now has fully crawlable HTML body content — Google can read it without JavaScript.\n`);
}

main();
