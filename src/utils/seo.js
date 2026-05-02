import { allTools } from '../data/allTools.js';
import { getCategoryContentByPath, getToolContentByPath } from '../data/toolContent.js';
import {
  categoryPageMeta,
  DEFAULT_OG_IMAGE,
  homePageMeta,
  SITE_NAME,
  SITE_URL,
  staticPages,
} from '../data/siteConfig.js';

const normalizePath = (pathname = '/') => {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const titleCase = (value) =>
  value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getRouteCategory = (pathname) => {
  if (pathname.startsWith('/math')) return 'Math';
  if (pathname.startsWith('/finance')) return 'Finance';
  if (pathname.startsWith('/science')) return 'Science';
  if (pathname.startsWith('/health')) return 'Health';
  if (pathname.startsWith('/utility-tools')) return 'Utility';
  if (pathname.startsWith('/knowledge')) return 'Knowledge';
  return 'Tools';
};

const buildKeywords = (tool) => {
  const baseKeywords = [
    tool.name,
    `${tool.name} online`,
    `${tool.name} free`,
    `${tool.category} calculator`,
    `${tool.category} tool`,
    SITE_NAME,
  ];

  return Array.from(
    new Set(
      baseKeywords
        .flatMap((entry) => entry.split(','))
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );
};

export const getToolByPath = (pathname) =>
  allTools.find((tool) => normalizePath(tool.url) === normalizePath(pathname));

export const getCategoryByPath = (pathname) =>
  categoryPageMeta.find((category) => normalizePath(category.url) === normalizePath(pathname));

export const getStaticPageByPath = (pathname) =>
  staticPages.find((page) => normalizePath(page.path) === normalizePath(pathname));

export const getPageSeo = (pathname) => {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/') {
    return {
      ...homePageMeta,
      canonicalUrl: `${SITE_URL}/`,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
    };
  }

  const staticPage = getStaticPageByPath(normalizedPath);
  if (staticPage) {
    return {
      title: staticPage.title,
      description: staticPage.description,
      keywords: [staticPage.name, SITE_NAME, 'online tools'],
      canonicalUrl: `${SITE_URL}${staticPage.path}`,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
    };
  }

  const category = getCategoryByPath(normalizedPath);
  if (category) {
    const categoryContent = getCategoryContentByPath(normalizedPath);
    return {
      title: category.title,
      description: categoryContent?.detail || category.description,
      keywords: Array.from(
        new Set([
          ...(category.keywords || []),
          `${category.name.toLowerCase()} tools online`,
          `${category.name.toLowerCase()} calculators free`,
        ]),
      ),
      canonicalUrl: `${SITE_URL}${category.url}`,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
    };
  }

  const tool = getToolByPath(normalizedPath);
  const toolContent = getToolContentByPath(normalizedPath);
  if (tool && toolContent) {
    return {
      title: toolContent.seoTitle,
      description: toolContent.seoDescription,
      keywords: toolContent.seoKeywords?.length ? toolContent.seoKeywords : buildKeywords(tool),
      canonicalUrl: `${SITE_URL}${tool.url}`,
      image: DEFAULT_OG_IMAGE,
      type: 'article',
    };
  }

  const fallbackLabel = titleCase(normalizedPath.replace(/\//g, ' ').trim() || 'Page');
  return {
    title: `${fallbackLabel} | ${SITE_NAME}`,
    description: `Browse ${fallbackLabel} on ${SITE_NAME} for free online calculators and utility tools.`,
    keywords: [fallbackLabel, SITE_NAME, `${getRouteCategory(normalizedPath)} tools`],
    canonicalUrl: `${SITE_URL}${normalizedPath}`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  };
};

export const getStructuredData = (pathname) => {
  const normalizedPath = normalizePath(pathname);
  const seo = getPageSeo(normalizedPath);
  const tool = getToolByPath(normalizedPath);
  const category = getCategoryByPath(normalizedPath);
  const toolContent = getToolContentByPath(normalizedPath);
  const categoryContent = getCategoryContentByPath(normalizedPath);

  const base = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (normalizedPath === '/') {
    return [
      base,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ];
  }

  if (tool && toolContent) {
    const categoryUrl = tool.category.toLowerCase() === 'utility' ? 'utility-tools' : tool.category.toLowerCase();

    return [
      base,
      {
        '@context': 'https://schema.org',
        '@type': toolContent.schema.type,
        name: tool.name,
        applicationCategory: toolContent.schema.applicationCategory,
        applicationSubCategory: tool.kind,
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript and a modern browser',
        description: toolContent.seoDescription,
        url: seo.canonicalUrl,
        keywords: toolContent.schema.keywords.join(', '),
        featureList: toolContent.schema.featureList,
        audience: toolContent.schema.audience.map((audienceType) => ({
          '@type': 'Audience',
          audienceType,
        })),
        isAccessibleForFree: true,
        mainEntityOfPage: seo.canonicalUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          {
            '@type': 'ListItem',
            position: 2,
            name: `${tool.category} Tools`,
            item: `${SITE_URL}/${categoryUrl}`,
          },
          { '@type': 'ListItem', position: 3, name: tool.name, item: seo.canonicalUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: toolContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use the ${tool.name}`,
        description: toolContent.seoDescription,
        step: toolContent.howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: step,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Related ${tool.category} tools for ${tool.name}`,
        itemListElement: toolContent.relatedTools.map((relatedTool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}${relatedTool.url}`,
          name: relatedTool.name,
        })),
      },
    ];
  }

  if (category && categoryContent) {
    return [
      {
        ...base,
        '@type': 'CollectionPage',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: category.name, item: seo.canonicalUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${category.name} tools on ${SITE_NAME}`,
        itemListElement: categoryContent.tools.map((toolEntry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}${toolEntry.url}`,
          name: toolEntry.name,
        })),
      },
    ];
  }

  return base;
};
