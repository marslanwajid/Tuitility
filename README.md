
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/images/logo.png">
    <img src="/images/logo.png" alt="Tuitility" width="180" height="50">
  </picture>
</p>

<h1 align="center">Tuitility — Free Online Calculators & Utility Tools</h1>

<p align="center">
  <strong>A curated suite of 100+ browser-based utility tools, financial calculators, math solvers, PDF tools, health trackers, and more.</strong>
  <br>
  Fast, precise, and stunning — with zero installs and zero server uploads.
  <br>
  <br>
  <a href="https://tuitility.vercel.app" target="_blank"><strong>🌐 Visit Tuitility »</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## ✨ Features

- **100+ Free Tools** — Calculators, converters, generators, translators, and utilities across 6 categories
- **🖥️ 100% Browser-Based** — All processing happens on your device. No uploads, no servers, no privacy concerns
- **📱 Fully Responsive** — Beautifully designed for desktop, tablet, and mobile
- **⚡ Blazing Fast** — Built on Next.js App Router with dynamic imports, code-splitting, and lazy loading
- **🎨 Stunning UI** — GSAP animations, floating symbols, gradient panels, and a polished dark/light aesthetic
- **🔍 Advanced SEO** — Programmatic SEO content, structured data, sitemaps, Open Graph, Twitter cards
- **🤖 AI-Powered** — Built-in chatbot, MBTI analysis, trauma/anxiety assessment, and Gen-Z slang translator
- **🧩 Interactive Games** — Math, Finance & Science trivia quizzes, plus brain-training games
- **📄 Comprehensive PDF Tools** — Merge, split, delete pages, organize, PDF-to-image, OCR PDF extraction
- **🖼️ Image & Media Tools** — Format conversion, WebP, GIF compression/background-removal, video-to-GIF, aspect ratio, color blindness simulator
- **🔊 Audio Tools** — Format conversion, bitrate conversion, video-to-audio extraction
- **🔒 Privacy First** — No file uploads to servers. Everything runs locally in your browser

---

## 🧰 Tool Categories

| Category | Description | Count |
|----------|-------------|-------|
| <img src="https://img.shields.io/badge/-Math-1a1a1a?logo=wolfram&logoColor=white" height="20"> | Fractions, percentages, derivatives, integrals, LCM, LCD, binary, and more | 15+ |
| <img src="https://img.shields.io/badge/-Finance-1a1a1a?logo=googlefinance&logoColor=white" height="20"> | Mortgage, loan, tax, retirement, ROI, budget, compound interest, currency exchange | 20+ |
| <img src="https://img.shields.io/badge/-Health-1a1a1a?logo=heart&logoColor=white" height="20"> | BMI, calorie, body fat, water intake, diabetes risk, DRI, BRI, weight planning | 11 |
| <img src="https://img.shields.io/badge/-Science-1a1a1a?logo=atom&logoColor=white" height="20"> | Wave speed, gravity, work/power, capacitance, electric flux, atomic mass, dBm | 8+ |
| <img src="https://img.shields.io/badge/-Utility-1a1a1a?logo=tools&logoColor=white" height="20"> | PDF tools, image converter, QR code, password gen, word counter, audio tools, SVG tools, social downloaders | 30+ |
| <img src="https://img.shields.io/badge/-Knowledge-1a1a1a?logo=book&logoColor=white" height="20"> | GPA, age, WPM, MBTI, career assessment, carbon footprint, zakat, habit formation | 13+ |

### 🔢 Math Calculators
Fraction Calculator · Percentage Calculator · Decimal Calculator · Binary Calculator · LCM Calculator · LCD Calculator · Comparing Fractions · Comparing Decimals · Fraction to Percent · Percent to Fraction · Improper to Mixed · Decimal to Fraction · SSE Calculator · Derivative Calculator · Integral Calculator

### 💰 Finance Calculators
Mortgage Calculator · Loan Calculator · Amortization Calculator · Currency Calculator (170+ currencies) · House Affordability · Compound Interest · Investment Calculator · Retirement Calculator · Tax Calculator · Sales Tax Calculator · Budget Calculator · ROI Calculator · Credit Card Calculator · Debt Payoff · Debt-to-Income · Insurance Calculator · Down Payment · Present Value · Future Value · Business Loan · Rental Property

### ❤️ Health Calculators
BMI Calculator · Calorie Calculator · Calorie Burn · Water Intake · Weight Loss · Weight Gain · Body Fat · Ideal Body Weight · Diabetes Risk · DRI Calculator · BRI Calculator

### 🔬 Science Calculators
Wave Speed · Gravity · Work & Power · dBm to Watts · dBm to Milliwatts · Capacitance · Electric Flux · Average Atomic Mass

### 🛠️ Utility Tools
**Image Tools:** Image Converter (30+ formats), Image to WebP, Aspect Ratio Converter, Color Blindness Simulator, GIF Compressor, GIF Background Remover

**PDF Tools:** PDF Merger, PDF Splitter, Delete PDF Pages, Organize PDF Pages, PDF to Image Converter, OCR PDF Generator

**Converter Tools:** Text Case Converter, RGB to HEX, RGB to Pantone, Gold Weight Converter, SVG to Code Converter, Code to SVG Converter, Video to GIF

**Generators:** Password Generator, QR Code Generator (with logo, gradient, custom styling)

**Media Tools:** Audio Format Converter, Audio Bitrate Converter, Video to Audio Extractor

**Social Tools:** Instagram Reels Downloader, TikTok Downloader

**Other:** QR Code Scanner, Morse Code Translator, HTML to Markdown Converter, Markdown File Viewer, English to IPA Translator, Word Counter, Gen Z Translator

### 📚 Knowledge Calculators
GPA Calculator · Age Calculator · WPM Typing Test · Habit Formation · Language Level · Fuel Calculator · Average Time · Career Assessment (Holland Code) · Trauma Assessment (IES-R) · Anxiety Assessment (HAM-A) · MBTI Personality Test · Carbon Footprint · Zakat Calculator

---

## 🏗️ Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── [...slug]/                # Catch-all dynamic route for all tools & categories
│   │   └── page.tsx              # Universal page handler
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI endpoints (chat, mbti, trauma, anxiety, gen-z)
│   │   ├── contact/              # Contact form (nodemailer)
│   │   ├── currency/             # Exchange rate proxy
│   │   ├── instagram/            # Instagram Reels downloader
│   │   └── tiktok/               # TikTok downloader
│   ├── contact/                  # Contact page
│   ├── privacy-policy/           # Privacy policy
│   ├── terms-and-conditions/     # Terms & conditions
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout (header, footer, analytics, chatbot)
│   ├── not-found.tsx             # Custom 404 with memory puzzle game
│   ├── page.tsx                  # Homepage
│   └── sitemap.ts                # Dynamic sitemap generation
│
├── components/                   # React components
│   ├── Calculator.tsx            # Hero section interactive calculator
│   ├── CalculatorRegistry.ts     # Dynamic registry of all 80+ tool components
│   ├── CalculatorWidget.tsx      # Lazy-loads calculator by path
│   ├── CategoryView.tsx          # Category landing pages
│   ├── FaviconAnimator.tsx       # Animated favicon
│   ├── FloatingBrainGames.tsx    # Mini-game launcher
│   ├── FloatingChatbot.tsx       # AI assistant chatbot
│   ├── FloatingGameButton.tsx    # Game drawer toggle
│   ├── Footer.tsx                # Site footer
│   ├── Header.tsx                # Navigation header
│   ├── HeaderSearch.tsx          # Search input
│   ├── HomepageToolGrid.tsx      # Searchable/filterable tool grid
│   ├── InteractivePlayground.tsx # Trivia quiz game (Math/Finance/Science)
│   ├── ScrollToTop.tsx           # Scroll-to-top button
│   ├── ToolContentEnhancer.tsx   # Programmatic SEO + KaTeX formulas + FAQs
│   ├── finance/                  # 20 finance calculator components
│   ├── health/                   # 11 health calculator components
│   ├── knowledge/                # 13 knowledge calculator components
│   ├── math/                     # 15 math calculator components
│   ├── science/                  # 8 science calculator components
│   └── utility/                  # 30+ utility tool components
│
├── data/                         # Static data & configuration
│   ├── allTools.ts               # Complete tool manifest
│   ├── siteConfig.ts             # Site metadata, featured tools, SEO config
│   ├── toolCategories.ts         # Category definitions
│   ├── toolContent.ts            # Programmatic SEO content generator
│   └── toolDecorations.ts        # Decorative symbols & metrics per tool
│
├── lib/                          # Shared utilities
│   ├── audio.ts                  # Audio encoding helpers
│   └── md.ts                     # Markdown rendering helper
│
└── types/                        # TypeScript declarations
    ├── gifenc.d.ts
    ├── lamejs.d.ts
    ├── omggif.d.ts
    └── react-katex.d.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/your-username/tuitility-next.git
cd tuitility-next
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Google Analytics
GTAG_ID=G-XXXXXXXXXX

# SMTP for contact form (optional for local dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_TO_EMAIL=your-email@gmail.com

# Exchange Rate API (https://www.exchangerate-api.com)
EXCHANGE_RATE_API_KEY=your-api-key

# OpenAI for AI features (optional)
OPENAI_API_KEY=your-openai-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app supports hot module replacement.

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 🧪 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **GSAP** | Animations & transitions |
| **Font Awesome 6** | Icons |
| **pdf-lib / pdfjs-dist** | PDF manipulation & rendering |
| **tesseract.js** | OCR text extraction |
| **jsQR** | QR code scanning |
| **qr-code-styling** | QR code generation with logos/gradients |
| **heic2any** | HEIC/HEIF image conversion |
| **browser-image-compression** | Client-side image compression |
| **KaTeX / react-katex** | Mathematical formula rendering |
| **marked** | Markdown rendering |
| **gifenc / omggif** | GIF encoding & decoding |
| **lamejs** | MP3 audio encoding |
| **canvas-confetti** | Celebration effects |
| **@imgly/background-removal** | AI-powered background removal |
| **nodemailer** | Email sending (contact form) |
| **jszip** | ZIP file creation |

---

## 🧠 AI Features

Tuitility uses OpenAI to power several intelligent features:

- **🤖 AI Chatbot** — Floating assistant that can answer questions, suggest tools, and guide users
- **🧩 MBTI Analysis** — Deep personality assessment with cognitive stack mapping
- **🩺 Trauma Assessment** — IES-R-based PTSD screening with AI-generated coping narratives
- **💚 Anxiety Assessment** — HAM-A-based anxiety screening with personalized recommendations
- **💬 Gen-Z Translator** — Slang translation and decoding with contextual AI output

---

## 🎮 Interactive Games

- **Grid Memory Puzzle** — 404 page features a Simon-says style grid memory game
- **Interactive Playground** — Trivia quizzes across Math, Finance, and Science categories
- **Floating Brain Games** — Arithmetic Speedrun, Binary Byte Blitz, and Brain IQ Trivia

---

## 🌐 Deployment

The app is deployed on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
npm run build   # outputs to .next/
```

**Recommended Vercel settings:**
- Framework Preset: Next.js
- Node Version: 20.x
- Environment Variables: Set all from `.env.local`

---

## 📈 SEO

Tuitility is built for search visibility:

- **Programmatic SEO** — Every tool page has auto-generated content, FAQs, how-to guides, and structured data
- **Dynamic Sitemap** — All 100+ tools and static pages indexed
- **Open Graph / Twitter Cards** — Rich previews for social sharing
- **Canonical URLs** — Proper canonical tags on every page
- **Schema.org** — WebApplication structured data for tools
- **Responsive & Fast** — Lighthouse-optimized with 95+ scores

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit changes (`git commit -m 'Add amazing tool'`)
4. Push to branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

When adding a new calculator/tool:
1. Create the component in the appropriate `components/{category}/` directory
2. Register it in `components/CalculatorRegistry.ts`
3. Add it to `data/allTools.ts` with metadata
4. (Optional) Add SEO overrides in `data/toolContent.ts`

---

## 📄 License

This project is private and not currently open-sourced under a specific license.

---

## 👨‍💻 Developer

Developed by **Arslan Wajid**

- LinkedIn: [@arslan-wajid](https://www.linkedin.com/in/arslan-wajid/)
- Email: wajidmarslan@gmail.com

---

<p align="center">
  Made with ❤️ — <a href="https://tuitility.vercel.app">Tuitility</a>
</p>
