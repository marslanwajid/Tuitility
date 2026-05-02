import { allTools } from './allTools.js';
import { toolCategories } from './toolCategories.js';

export const SITE_NAME = 'Tuitility';
export const SITE_URL = 'https://tuitility.vercel.app';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo.png`;

export const homePageMeta = {
  title: `${SITE_NAME} - Free Online Calculators, Converters, PDF Tools & Utility Tools`,
  description:
    'Explore Tuitility for free online calculators, converters, finance tools, health calculators, PDF tools, science tools, and productivity utilities.',
  keywords: [
    'free online calculators',
    'utility tools',
    'pdf tools',
    'finance calculator',
    'math calculator',
    'health calculator',
    'science calculator',
    'converter tools',
  ],
};

export const staticPages = [
  {
    name: 'About',
    path: '/about',
    title: `About ${SITE_NAME}`,
    description:
      'Learn about Tuitility, our calculator platform, and our mission to provide accurate free tools online.',
  },
  {
    name: 'Contact',
    path: '/contact',
    title: `Contact ${SITE_NAME}`,
    description:
      'Contact Tuitility for support, feedback, partnerships, and calculator improvement suggestions.',
  },
  {
    name: 'Privacy Policy',
    path: '/privacy-policy',
    title: `${SITE_NAME} Privacy Policy`,
    description:
      'Read the Tuitility privacy policy for information about data handling, browser processing, and user privacy.',
  },
];

export const categoryPageMeta = toolCategories.map((category) => ({
  ...category,
  title: `${category.name} Tools - ${SITE_NAME}`,
  keywords: [
    `${category.name.toLowerCase()} tools`,
    `${category.name.toLowerCase()} calculators`,
    `${category.name.toLowerCase()} converter`,
    `${SITE_NAME.toLowerCase()} ${category.name.toLowerCase()}`,
  ],
}));

export const featuredToolPaths = [
  '/math/calculators/fraction-calculator',
  '/math/calculators/percentage-calculator',
  '/finance/calculators/mortgage-calculator',
  '/finance/calculators/currency-calculator',
  '/health/calculators/bmi-calculator',
  '/utility-tools/qr-code-generator',
  '/utility-tools/converter-tools/pdf-to-image-converter',
  '/knowledge/calculators/age-calculator',
];

export const popularToolOverrides = {
  '/math/calculators/fraction-calculator': { rating: 4.8, usage: '50K+' },
  '/health/calculators/bmi-calculator': { rating: 4.9, usage: '75K+' },
  '/utility-tools/converter-tools/pdf-to-image-converter': { rating: 4.9, usage: '60K+' },
  '/utility-tools/password-generator': { rating: 4.6, usage: '25K+' },
  '/math/calculators/percentage-calculator': { rating: 4.8, usage: '45K+' },
  '/finance/calculators/mortgage-calculator': { rating: 4.8, usage: '42K+' },
  '/finance/calculators/currency-calculator': { rating: 4.8, usage: '45K+' },
  '/knowledge/calculators/age-calculator': { rating: 4.5, usage: '20K+' },
};

export const allIndexablePaths = [
  '/',
  ...staticPages.map((page) => page.path),
  ...categoryPageMeta.map((category) => category.url),
  ...allTools.map((tool) => tool.url),
];
