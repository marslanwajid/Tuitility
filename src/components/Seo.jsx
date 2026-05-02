import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '../data/siteConfig';
import { getPageSeo, getStructuredData } from '../utils/seo';

const ensureMetaTag = (selector, attributes) => {
  let tag = document.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }

  return tag;
};

const Seo = ({
  title,
  description,
  keywords,
  canonicalUrl,
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  structuredData,
}) => {
  const location = useLocation();
  const routeSeo = getPageSeo(location.pathname);
  const routeStructuredData = getStructuredData(location.pathname);

  useEffect(() => {
    const safeTitle = routeSeo.title || title || `${SITE_NAME} - Free Online Calculators and Tools`;
    const safeDescription =
      routeSeo.description ||
      description ||
      'Your ultimate destination for free online calculators and tools. Accurate, fast, and reliable calculations for all your needs.';
    const mergedKeywords = Array.from(
      new Set([
        ...(Array.isArray(routeSeo.keywords) ? routeSeo.keywords : String(routeSeo.keywords || '').split(',')),
        ...(Array.isArray(keywords) ? keywords : String(keywords || '').split(',')),
      ]
        .map((entry) => entry.trim())
        .filter(Boolean)),
    );
    const safeKeywords = mergedKeywords.join(', ');
    const safeCanonicalUrl = routeSeo.canonicalUrl || canonicalUrl || window.location.href;
    const safeImage = routeSeo.image || image || DEFAULT_OG_IMAGE;
    const safeType = routeSeo.type || type;
    const safeStructuredData = structuredData || routeStructuredData;

    document.title = safeTitle;

    const metaDescription = ensureMetaTag('meta[name="description"]', { name: 'description' });
    metaDescription.setAttribute('content', safeDescription);

    const metaKeywords = ensureMetaTag('meta[name="keywords"]', { name: 'keywords' });
    metaKeywords.setAttribute(
      'content',
      safeKeywords || 'calculators, tools, math, finance, science, health, utility, knowledge',
    );

    const metaRobots = ensureMetaTag('meta[name="robots"]', { name: 'robots' });
    metaRobots.setAttribute('content', robots);

    const ogTitle = ensureMetaTag('meta[property="og:title"]', { property: 'og:title' });
    ogTitle.setAttribute('content', safeTitle);

    const ogDescription = ensureMetaTag('meta[property="og:description"]', { property: 'og:description' });
    ogDescription.setAttribute('content', safeDescription);

    const ogType = ensureMetaTag('meta[property="og:type"]', { property: 'og:type' });
    ogType.setAttribute('content', safeType);

    const ogUrl = ensureMetaTag('meta[property="og:url"]', { property: 'og:url' });
    ogUrl.setAttribute('content', safeCanonicalUrl);

    const ogImage = ensureMetaTag('meta[property="og:image"]', { property: 'og:image' });
    ogImage.setAttribute('content', safeImage);

    const twitterCard = ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card' });
    twitterCard.setAttribute('content', 'summary_large_image');

    const twitterTitle = ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' });
    twitterTitle.setAttribute('content', safeTitle);

    const twitterDescription = ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description' });
    twitterDescription.setAttribute('content', safeDescription);

    const twitterImage = ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image' });
    twitterImage.setAttribute('content', safeImage);

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', safeCanonicalUrl);

    let schemaTag = document.getElementById('seo-structured-data');
    if (!schemaTag) {
      schemaTag = document.createElement('script');
      schemaTag.id = 'seo-structured-data';
      schemaTag.type = 'application/ld+json';
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = safeStructuredData ? JSON.stringify(safeStructuredData) : '';
  }, [title, description, keywords, canonicalUrl, robots, image, type, structuredData, routeSeo, routeStructuredData]);

  return null;
};

export default Seo;
