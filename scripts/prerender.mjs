/**
 * Tuitility Full Pre-render Script
 * Run after `vite build`: node scripts/prerender.mjs
 *
 * Reads each tool's real .jsx component, extracts ContentSection text,
 * FAQs, formulas, and internal links, then injects everything as
 * crawlable HTML before <div id="root"> in each route's index.html.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');
const SRC  = path.resolve(ROOT, 'src');

const SITE_NAME = 'Tuitility';
const SITE_URL  = 'https://tuitility.vercel.app';

// Route → component file (relative to src/)
const ROUTE_COMPONENT_MAP = {
  '/math/calculators/fraction-calculator':               'components/math/FractionCalculator.jsx',
  '/math/calculators/percentage-calculator':             'components/math/PercentageCalculator.jsx',
  '/math/calculators/decimal-to-fraction-calculator':    'components/math/DecimalToFractionCalculator.jsx',
  '/math/calculators/lcm-calculator':                    'components/math/LCMCalculator.jsx',
  '/math/calculators/binary-calculator':                 'components/math/BinaryCalculator.jsx',
  '/math/calculators/lcd-calculator':                    'components/math/LCDCalculator.jsx',
  '/math/calculators/comparing-fractions-calculator':    'components/math/ComparingFractionsCalculator.jsx',
  '/math/calculators/decimal-calculator':                'components/math/DecimalCalculator.jsx',
  '/math/calculators/comparing-decimals-calculator':     'components/math/ComparingDecimalsCalculator.jsx',
  '/math/calculators/fraction-to-percent-calculator':    'components/math/FractionToPercentCalculator.jsx',
  '/math/calculators/improper-fraction-to-mixed-calculator': 'components/math/ImproperFractionToMixedCalculator.jsx',
  '/math/calculators/percent-to-fraction-calculator':    'components/math/PercentToFractionCalculator.jsx',
  '/math/calculators/sse-calculator':                    'components/math/SSECalculator.jsx',
  '/math/calculators/derivative-calculator':             'components/math/DerivativeCalculator.jsx',
  '/math/calculators/integral-calculator':               'components/math/IntegralCalculator.jsx',
  '/finance/calculators/mortgage-calculator':            'components/finance/MortgageCalculator.jsx',
  '/finance/calculators/amortization-calculator':        'components/finance/AmortizationCalculator.jsx',
  '/finance/calculators/loan-calculator':                'components/finance/LoanCalculator.jsx',
  '/finance/calculators/currency-calculator':            'components/finance/CurrencyCalculator.jsx',
  '/finance/calculators/house-affordability-calculator': 'components/finance/HouseAffordabilityCalculator.jsx',
  '/finance/calculators/compound-interest-calculator':   'components/finance/CompoundInterestCalculator.jsx',
  '/finance/calculators/roi-calculator':                 'components/finance/ROICalculator.jsx',
  '/finance/calculators/business-loan-calculator':       'components/finance/BusinessLoanCalculator.jsx',
  '/finance/calculators/credit-card-calculator':         'components/finance/CreditCardCalculator.jsx',
  '/finance/calculators/investment-calculator':          'components/finance/InvestmentCalculator.jsx',
  '/finance/calculators/tax-calculator':                 'components/finance/TaxCalculator.jsx',
  '/finance/calculators/retirement-calculator':          'components/finance/RetirementCalculator.jsx',
  '/finance/calculators/sales-tax-calculator':           'components/finance/SalesTaxCalculator.jsx',
  '/finance/calculators/debt-payoff-calculator':         'components/finance/DebtPayoffCalculator.jsx',
  '/finance/calculators/insurance-calculator':           'components/finance/InsuranceCalculator.jsx',
  '/finance/calculators/budget-calculator':              'components/finance/BudgetCalculator.jsx',
  '/finance/calculators/rental-property-calculator':     'components/finance/RentalPropertyCalculator.jsx',
  '/finance/calculators/debt-income-calculator':         'components/finance/DebtIncomeCalculator.jsx',
  '/finance/calculators/down-payment-calculator':        'components/finance/DownPaymentCalculator.jsx',
  '/finance/calculators/present-value-calculator':       'components/finance/PresentValueCalculator.jsx',
  '/finance/calculators/future-value-calculator':        'components/finance/FutureValueCalculator.jsx',
  '/science/calculators/wave-speed-calculator':          'components/science/WaveSpeedCalculator.jsx',
  '/science/calculators/gravity-calculator':             'components/science/GravityCalculator.jsx',
  '/science/calculators/work-power-calculator':          'components/science/WorkPowerCalculator.jsx',
  '/science/calculators/dbm-watts-calculator':           'components/science/DBmWattsCalculator.jsx',
  '/science/calculators/dbm-milliwatts-calculator':      'components/science/DBmMilliwattsCalculator.jsx',
  '/science/calculators/capacitance-calculator':         'components/science/CapacitanceCalculator.jsx',
  '/science/calculators/electric-flux-calculator':       'components/science/ElectricFluxCalculator.jsx',
  '/science/calculators/average-atomic-mass-calculator': 'components/science/AverageAtomicMassCalculator.jsx',
  '/health/calculators/bmi-calculator':                  'components/health/BMICalculator.jsx',
  '/health/calculators/calorie-calculator':              'components/health/CalorieCalculator.jsx',
  '/health/calculators/calorie-burn-calculator':         'components/health/CalorieBurnCalculator.jsx',
  '/health/calculators/water-intake-calculator':         'components/health/WaterIntakeCalculator.jsx',
  '/health/calculators/weight-loss-calculator':          'components/health/WeightLossCalculator.jsx',
  '/health/calculators/weight-gain-calculator':          'components/health/WeightGainCalculator.jsx',
  '/health/calculators/body-fat-calculator':             'components/health/BodyFatCalculator.jsx',
  '/health/calculators/ideal-body-weight-calculator':    'components/health/IdealWeightCalculator.jsx',
  '/health/calculators/diabetes-risk-calculator':        'components/health/DiabetesRiskCalculator.jsx',
  '/health/calculators/dri-calculator':                  'components/health/DRICalculator.jsx',
  '/health/calculators/bri-calculator':                  'components/health/BRICalculator.jsx',
  '/utility-tools/word-counter':                         'components/utility/WordCounter.jsx',
  '/utility-tools/password-generator':                   'components/utility/PasswordGenerator.jsx',
  '/utility-tools/qr-code-generator':                    'components/utility/QRCodeGenerator.jsx',
  '/utility-tools/ocr-pdf-generator':                    'components/utility/OCRPDFGenerator.jsx',
  '/utility-tools/genz-translator':                      'components/utility/GenZTranslator.jsx',
  '/utility-tools/morse-code-translator':                'components/utility/MorseCodeTranslator.jsx',
  '/utility-tools/html-to-markdown-converter':           'components/utility/HtmlToMarkdownConverter.jsx',
  '/utility-tools/english-to-ipa-translator':            'components/utility/EnglishToIPATranslator.jsx',
  '/utility-tools/audio-bitrate-converter':              'components/utility/AudioBitrateConverter.jsx',
  '/utility-tools/converter-tools/reels-downloader':     'components/utility/InstagramReelsDownloader.jsx',
  '/utility-tools/converter-tools/tiktok-downloader':    'components/utility/TikTokDownloader.jsx',
  '/utility-tools/converter-tools/qr-code-scanner':      'components/utility/QRCodeScanner.jsx',
  '/utility-tools/converter-tools/rgb-to-hex-converter': 'components/utility/converter-tools/RgbToHexConverter.jsx',
  '/utility-tools/converter-tools/text-case-converter':  'components/utility/converter-tools/TextCaseConverter.jsx',
  '/utility-tools/converter-tools/pdf-to-image-converter': 'components/utility/converter-tools/PdfToImageConverter.jsx',
  '/utility-tools/converter-tools/merge-pdf':            'components/utility/converter-tools/PdfMerger.jsx',
  '/utility-tools/converter-tools/split-pdf':            'components/utility/converter-tools/PdfSplitter.jsx',
  '/utility-tools/converter-tools/delete-pdf-pages':     'components/utility/converter-tools/DeletePdfPages.jsx',
  '/utility-tools/converter-tools/organize-pdf-pages':   'components/utility/converter-tools/PdfOrganizer.jsx',
  '/utility-tools/converter-tools/rgb-to-pantone-converter': 'components/utility/RgbToPantoneConverter.jsx',
  '/utility-tools/converter-tools/gold-precious-metal-weight-converter': 'components/utility/GoldWeightConverter.jsx',
  '/utility-tools/image-tools/image-to-webp-converter':  'components/utility/image-tools/ImageToWebP.jsx',
  '/utility-tools/image-tools/aspect-ratio-converter':   'components/utility/image-tools/AspectRatioConverter.jsx',
  '/utility-tools/image-tools/color-blindness-simulator':'components/utility/image-tools/ColorBlindnessSimulator.jsx',
  '/knowledge/calculators/gpa-calculator':               'components/knowledge/GPACalculator.jsx',
  '/knowledge/calculators/age-calculator':               'components/knowledge/AgeCalculator.jsx',
  '/knowledge/calculators/wpm-calculator':               'components/knowledge/WPMCalculator.jsx',
  '/knowledge/calculators/habit-formation-calculator':   'components/knowledge/HabitFormationCalculator.jsx',
  '/knowledge/calculators/language-level-calculator':    'components/knowledge/LanguageLevelCalculator.jsx',
  '/knowledge/calculators/fuel-calculator':              'components/knowledge/FuelCalculator.jsx',
  '/knowledge/calculators/average-time-calculator':      'components/knowledge/AverageTimeCalculator.jsx',
  '/knowledge/calculators/career-assessment-calculator': 'components/knowledge/CareerAssessmentCalculator.jsx',
  '/knowledge/calculators/trauma-assessment-calculator': 'components/knowledge/TraumaAssessmentCalculator.jsx',
  '/knowledge/calculators/anxiety-assessment-calculator':'components/knowledge/AnxietyAssessmentCalculator.jsx',
  '/knowledge/calculators/mbti-calculator':              'components/knowledge/MBTICalculator.jsx',
  '/knowledge/calculators/carbon-footprint-calculator':  'components/knowledge/CarbonFootprintCalculator.jsx',
  '/knowledge/calculators/zakat-calculator':             'components/knowledge/ZakatCalculator.jsx',
};

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
  { name: 'Amortization Calculator', desc: 'Calculate amortization schedules, monthly payments, and total interest', url: '/finance/calculators/amortization-calculator', category: 'Finance' },
  { name: 'Loan Calculator', desc: 'Calculate loan payments with down payment and fees', url: '/finance/calculators/loan-calculator', category: 'Finance' },
  { name: 'Currency Calculator', desc: 'Convert between 170+ world currencies with real-time rates', url: '/finance/calculators/currency-calculator', category: 'Finance' },
  { name: 'House Affordability Calculator', desc: 'Calculate how much house you can afford', url: '/finance/calculators/house-affordability-calculator', category: 'Finance' },
  { name: 'Compound Interest Calculator', desc: 'Calculate investment growth with compound interest', url: '/finance/calculators/compound-interest-calculator', category: 'Finance' },
  { name: 'ROI Calculator', desc: 'Calculate return on investment and annualized returns', url: '/finance/calculators/roi-calculator', category: 'Finance' },
  { name: 'Business Loan Calculator', desc: 'Calculate business loan payments', url: '/finance/calculators/business-loan-calculator', category: 'Finance' },
  { name: 'Credit Card Calculator', desc: 'Calculate credit card payments, interest, and payoff time', url: '/finance/calculators/credit-card-calculator', category: 'Finance' },
  { name: 'Investment Calculator', desc: 'Calculate investment growth, compound returns, and future value', url: '/finance/calculators/investment-calculator', category: 'Finance' },
  { name: 'Tax Calculator', desc: 'Calculate federal and state income taxes, deductions, and credits', url: '/finance/calculators/tax-calculator', category: 'Finance' },
  { name: 'Retirement Calculator', desc: 'Calculate retirement savings goals and future income', url: '/finance/calculators/retirement-calculator', category: 'Finance' },
  { name: 'Sales Tax Calculator', desc: 'Calculate sales tax, subtotal, and total amount', url: '/finance/calculators/sales-tax-calculator', category: 'Finance' },
  { name: 'Debt Payoff Calculator', desc: 'Calculate debt payoff time, total interest, and payment strategies', url: '/finance/calculators/debt-payoff-calculator', category: 'Finance' },
  { name: 'Insurance Calculator', desc: 'Calculate insurance premiums and coverage costs', url: '/finance/calculators/insurance-calculator', category: 'Finance' },
  { name: 'Budget Calculator', desc: 'Create and manage personal budgets with the 50-30-20 rule', url: '/finance/calculators/budget-calculator', category: 'Finance' },
  { name: 'Rental Property Calculator', desc: 'Calculate rental property ROI, cash flow, and investment returns', url: '/finance/calculators/rental-property-calculator', category: 'Finance' },
  { name: 'Debt Income Calculator', desc: 'Calculate your debt-to-income ratio', url: '/finance/calculators/debt-income-calculator', category: 'Finance' },
  { name: 'Down Payment Calculator', desc: 'Calculate down payment amount and loan amount', url: '/finance/calculators/down-payment-calculator', category: 'Finance' },
  { name: 'Present Value Calculator', desc: 'Calculate the present value of future cash flows', url: '/finance/calculators/present-value-calculator', category: 'Finance' },
  { name: 'Future Value Calculator', desc: 'Calculate the future value of investments', url: '/finance/calculators/future-value-calculator', category: 'Finance' },
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
  { name: 'Calorie Burn Calculator', desc: 'Estimate calories burned from exercise', url: '/health/calculators/calorie-burn-calculator', category: 'Health' },
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
  { name: 'RGB to HEX', desc: 'Convert RGB color values to hexadecimal', url: '/utility-tools/converter-tools/rgb-to-hex-converter', category: 'Utility' },
  { name: 'Text Case Converter', desc: 'Change text case formats', url: '/utility-tools/converter-tools/text-case-converter', category: 'Utility' },
  { name: 'PDF to Image Converter', desc: 'Convert PDF pages to images', url: '/utility-tools/converter-tools/pdf-to-image-converter', category: 'Utility' },
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

const toolCategories = [
  { name: 'Utility',   url: '/utility-tools', description: 'File converters, generators, downloaders, and day-to-day digital tools.' },
  { name: 'Math',      url: '/math',          description: 'Arithmetic, algebra, calculus, fractions, percentages, and number tools.' },
  { name: 'Finance',   url: '/finance',       description: 'Loans, mortgages, taxes, budgeting, investing, and money planning calculators.' },
  { name: 'Health',    url: '/health',        description: 'BMI, calorie, hydration, body composition, and wellness calculators.' },
  { name: 'Science',   url: '/science',       description: 'Physics, electrical, and chemistry calculators for study and problem solving.' },
  { name: 'Knowledge', url: '/knowledge',     description: 'Assessment, education, productivity, and personal development tools.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ─── JSX Content Extractor ────────────────────────────────────────────────────
function extractJsxContent(jsxSource) {
  const sections = [];

  // 1. ContentSection blocks
  const csRe = /<ContentSection[^>]*id="([^"]*)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/ContentSection>/g;
  let m;
  while ((m = csRe.exec(jsxSource)) !== null) {
    const html = jsxToHtml(m[3]);
    if (html.trim().length > 20) sections.push({ id: m[1], title: m[2], html });
  }

  // 2. FAQSection — parse faqs array
  const faqBlock = /<FAQSection[\s\S]*?faqs=\{(\[[\s\S]*?\])\}/.exec(jsxSource);
  if (faqBlock) {
    const titleM = /title="([^"]*)"/.exec(faqBlock[0]);
    const faqs = [];
    const pairRe = /question:\s*"([\s\S]*?)"[\s\S]*?answer:\s*"([\s\S]*?)"/g;
    let p;
    while ((p = pairRe.exec(faqBlock[1])) !== null) {
      faqs.push({ q: p[1].trim(), a: p[2].trim() });
    }
    if (faqs.length > 0) {
      sections.push({
        id: 'faqs',
        title: titleM ? titleM[1] : 'Frequently Asked Questions',
        html: `<dl>${faqs.map(f=>`<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join('')}</dl>`
      });
    }
  }

  // 3. relatedTools links from sidebar data
  const relBlock = /relatedTools\s*=\s*\[([\s\S]*?)\];/.exec(jsxSource);
  if (relBlock) {
    const links = [];
    const lRe = /name:\s*['"`]([^'"`]+)['"`][\s\S]*?url:\s*['"`]([^'"`]+)['"`]/g;
    let l;
    while ((l = lRe.exec(relBlock[1])) !== null) links.push({ name: l[1], url: l[2] });
    if (links.length > 0) {
      sections.push({
        id: 'related',
        title: 'Related Tools',
        html: `<ul>${links.map(lk=>`<li><a href="${esc(lk.url)}">${esc(lk.name)}</a></li>`).join('')}</ul>`
      });
    }
  }

  return sections;
}

// Converts JSX markup to plain HTML Google can read
function jsxToHtml(jsx) {
  let h = jsx;
  // Preserve <a href> links
  h = h.replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, inner) =>
    `<a href="${esc(href)}">${inner.replace(/<[^>]+>/g,'').replace(/\{[^}]*\}/g,'').trim()}</a>`);
  // Remove icon tags
  h = h.replace(/<i\s[^>]*><\/i>/g, '');
  // Remove KaTeX placeholder divs (empty formula containers — formulas rendered by JS)
  h = h.replace(/<div[^>]*className="[^"]*formula[^"]*"[^>]*><\/div>/g, '');
  h = h.replace(/<div[^>]*className="[^"]*formula[^"]*"[^>]*\/>/g, '');
  // Remove className, style, event handler attributes
  h = h.replace(/\s+className="[^"]*"/g,'');
  h = h.replace(/\s+style=\{[^{}]*\}/g,'');
  h = h.replace(/\s+onClick=\{[^{}]*\}/g,'');
  h = h.replace(/\s+id="[^"]*"/g,'');
  // Remove JSX comments and expressions
  h = h.replace(/\{\/\*[\s\S]*?\*\/\}/g,'');
  h = h.replace(/\{[^{}]*\}/g,'');
  // Remove unknown React components
  h = h.replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g,'');
  h = h.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g,'');
  // Unwrap divs/spans but keep content
  h = h.replace(/<div[^>]*>/g,'').replace(/<\/div>/g,'');
  h = h.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,'');
  // Clean whitespace
  h = h.replace(/\n\s*\n\s*\n/g,'\n\n').trim();
  return h;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────
function getPageSeo(url) {
  if (url === '/') return {
    title: `${SITE_NAME} - Free Online Calculators, PDF Tools, Converters and Utilities`,
    description: `Explore ${allTools.length}+ free online tools on Tuitility. No sign-up needed.`,
    keywords: `free online calculators, utility tools, finance calculator, math calculator, ${SITE_NAME}`,
    canonical: `${SITE_URL}/`
  };
  const statics = {
    '/about':               { title:`About ${SITE_NAME}`, description:`Learn about Tuitility and our free online tools.` },
    '/contact':             { title:`Contact ${SITE_NAME}`, description:`Get in touch with the Tuitility team.` },
    '/privacy-policy':      { title:`Privacy Policy — ${SITE_NAME}`, description:`Tuitility privacy policy.` },
    '/terms-and-conditions':{ title:`Terms — ${SITE_NAME}`, description:`Tuitility terms and conditions.` },
  };
  if (statics[url]) return { ...statics[url], keywords:`${SITE_NAME}, free tools`, canonical:`${SITE_URL}${url}` };
  const cat = toolCategories.find(c=>c.url===url);
  if (cat) {
    const n = allTools.filter(t=>t.category===cat.name).length;
    return { title:`Free ${cat.name} Tools — ${n} Online Calculators | ${SITE_NAME}`,
      description:`${cat.description} Browse ${n} free tools.`,
      keywords:`${cat.name.toLowerCase()} tools, ${cat.name.toLowerCase()} calculators, ${SITE_NAME}`,
      canonical:`${SITE_URL}${url}` };
  }
  const tool = allTools.find(t=>t.url===url);
  if (tool) return {
    title:`${tool.name} — Free Online ${tool.name} | ${SITE_NAME}`,
    description:`${tool.desc}. Free and browser-based on ${SITE_NAME}. No sign-up required.`,
    keywords:`${tool.name.toLowerCase()}, free ${tool.name.toLowerCase()}, ${tool.category.toLowerCase()} calculator, ${SITE_NAME}`,
    canonical:`${SITE_URL}${url}`
  };
  return { title:`${SITE_NAME}`, description:`Free tools on ${SITE_NAME}.`, keywords:SITE_NAME, canonical:`${SITE_URL}${url}` };
}

function buildSD(url, seo) {
  const tool = allTools.find(t=>t.url===url);
  if (tool) return { '@context':'https://schema.org','@type':'WebApplication',
    name:tool.name, description:seo.description, url:seo.canonical,
    applicationCategory:'UtilityApplication', operatingSystem:'Any',
    offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},
    provider:{'@type':'Organization',name:SITE_NAME,url:SITE_URL} };
  return { '@context':'https://schema.org','@type':'WebPage',
    name:seo.title, description:seo.description, url:seo.canonical,
    isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL} };
}

// ─── HTML builders ────────────────────────────────────────────────────────────
function buildToolHtml(route, sections) {
  const tool = allTools.find(t=>t.url===route);
  const name = tool?.name ?? route.split('/').pop().replace(/-/g,' ');
  const cat  = tool?.category ?? '';
  // Same-category interlinks
  const siblings = allTools.filter(t=>t.category===cat && t.url!==route).slice(0,8);
  // Cross-category links (2 per other category)
  const crossLinks = toolCategories
    .filter(c=>c.name!==cat)
    .flatMap(c=>allTools.filter(t=>t.category===c.name).slice(0,2));

  const sectionsHtml = sections.map(s=>`
    <section>
      <h2>${esc(s.title)}</h2>
      ${s.html}
    </section>`).join('');

  const siblingHtml = siblings.length > 0 ? `
    <section>
      <h2>More ${esc(cat)} Tools</h2>
      <ul>${siblings.map(t=>`<li><a href="${esc(t.url)}">${esc(t.name)}</a> — ${esc(t.desc)}</li>`).join('')}</ul>
    </section>` : '';

  const crossHtml = crossLinks.length > 0 ? `
    <section>
      <h2>More Free Tools on ${SITE_NAME}</h2>
      <ul>${crossLinks.map(t=>`<li><a href="${esc(t.url)}">${esc(t.name)}</a></li>`).join('')}</ul>
    </section>` : '';

  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article>${sectionsHtml}${siblingHtml}${crossHtml}
  </article>
</div>`;
}

function buildCategoryHtml(cat) {
  const tools = allTools.filter(t=>t.category===cat.name);
  const others = toolCategories.filter(c=>c.url!==cat.url);
  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article>
    <h1>Free ${esc(cat.name)} Tools — Online ${esc(cat.name)} Calculators | ${SITE_NAME}</h1>
    <p>${esc(cat.description)}</p>
    <section>
      <h2>All ${esc(cat.name)} Tools</h2>
      <ul>${tools.map(t=>`<li><a href="${esc(t.url)}">${esc(t.name)}</a> — ${esc(t.desc)}</li>`).join('')}</ul>
    </section>
    <section>
      <h2>Other Tool Categories</h2>
      <ul>${others.map(c=>`<li><a href="${esc(c.url)}">${esc(c.name)} Tools</a> — ${esc(c.description)}</li>`).join('')}</ul>
    </section>
  </article>
</div>`;
}

function buildHomepageHtml() {
  return `<div id="ssg-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" aria-hidden="true">
  <article>
    <h1>Tuitility — Free Online Calculators, Converters, and Utility Tools</h1>
    <p>${allTools.length}+ free browser-based tools. No sign-up or install required.</p>
    <section>
      <h2>Tool Categories</h2>
      <ul>${toolCategories.map(c=>`<li><a href="${esc(c.url)}">${esc(c.name)} Tools</a> — ${esc(c.description)}</li>`).join('')}</ul>
    </section>
    <section>
      <h2>All Free Tools</h2>
      <ul>${allTools.map(t=>`<li><a href="${esc(t.url)}">${esc(t.name)}</a> — ${esc(t.desc)}</li>`).join('')}</ul>
    </section>
  </article>
</div>`;
}

// ─── Head injection ───────────────────────────────────────────────────────────
function injectHead(html, url) {
  const seo = getPageSeo(url);
  const sd  = buildSD(url, seo);
  html = html.replace(/<title>[^<]*<\/title>/,                                    `<title>${esc(seo.title)}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,         `$1${esc(seo.description)}$2`);
  html = html.replace(/(<meta\s+name="keywords"\s+content=")[^"]*(")/,           `$1${esc(seo.keywords)}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,       `$1${esc(seo.title)}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,  `$1${esc(seo.description)}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,         `$1${esc(seo.canonical)}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,      `$1${esc(seo.title)}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,`$1${esc(seo.description)}$2`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(seo.canonical)}" />`);
  const st = `<script type="application/ld+json">${JSON.stringify(sd)}</script>`;
  if (/<script[^>]*type="application\/ld\+json"/.test(html)) {
    html = html.replace(/<script[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/, st);
  } else {
    html = html.replace('</head>', `  ${st}\n</head>`);
  }
  return html;
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = ['/','/about','/contact','/privacy-policy','/terms-and-conditions',
  ...toolCategories.map(c=>c.url), ...allTools.map(t=>t.url)];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌  dist/index.html not found. Run `npm run build:vite` first.');
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  let ok = 0, fail = 0;
  console.log(`\n🚀  Pre-rendering ${routes.length} routes with real JSX content...\n`);

  for (const route of routes) {
    try {
      let html = injectHead(template, route);
      let ssg  = '';

      if (route === '/') {
        ssg = buildHomepageHtml();
      } else {
        const cat = toolCategories.find(c=>c.url===route);
        if (cat) {
          ssg = buildCategoryHtml(cat);
        } else {
          const compPath = ROUTE_COMPONENT_MAP[route];
          if (compPath) {
            const fullPath = path.join(SRC, compPath);
            if (fs.existsSync(fullPath)) {
              const src = fs.readFileSync(fullPath, 'utf-8');
              const sections = extractJsxContent(src);
              ssg = buildToolHtml(route, sections);
            }
          }
        }
      }

      if (ssg) html = html.replace('<div id="root">', `${ssg}\n    <div id="root">`);

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
  console.log(`\n✨  Done: ${ok} pages pre-rendered${fail?`, ${fail} failed`:''}.`);
  console.log(`📄  Real JSX content injected — Google reads all sections, FAQs, and interlinks.\n`);
}
main();
