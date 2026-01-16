import { useEffect } from 'react';

const Seo = ({ title, description, keywords, canonicalUrl }) => {
  useEffect(() => {
    // Update title
    document.title = title || 'Tuitility - Free Online Calculators and Tools';

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || 'Your ultimate destination for free online calculators and tools. Accurate, fast, and reliable calculations for all your needs.');

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || 'calculators, tools, math, finance, science, health, utility, knowledge');

    // Update canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl || window.location.href);

    // Cleanup function (optional, but good practice if tags might change frequently)
    return () => {
      // You might want to revert to default or remove specific tags on unmount
      // For a SPA, usually not strictly necessary as new page will set its own
      // document.title = 'Tuitility - Free Online Calculators and Tools';
      // metaDescription.setAttribute('content', 'Your ultimate destination for free online calculators and tools. Accurate, fast, and reliable calculations for all your needs.');
      // metaKeywords.setAttribute('content', 'calculators, tools, math, finance, science, health, utility, knowledge');
    };
  }, [title, description, keywords, canonicalUrl]);

  return null; // Seo component doesn't render any visible UI
};

export default Seo;