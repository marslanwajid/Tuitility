import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategoryContentByPath, getToolContentByPath } from '../data/toolContent';
import '../assets/css/tool-seo-content.css';

const ToolContentEnhancer = () => {
  const location = useLocation();
  const toolContent = getToolContentByPath(location.pathname);
  const categoryContent = getCategoryContentByPath(location.pathname);

  if (toolContent) {
    return (
      <div className="tool-seo-content">
        <div className="container">
          <section className="tool-seo-panel" aria-labelledby="tool-overview-heading">
            <div className="tool-seo-panel-heading">
              <h2 id="tool-overview-heading">About the {toolContent.name}</h2>
              <span className={`tool-seo-badge tool-seo-badge--${toolContent.priority.tier}`}>
                {toolContent.priority.outlook}
              </span>
            </div>
            {toolContent.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="tool-functionality-heading">
              <h2 id="tool-functionality-heading">What This Tool Does</h2>
              {toolContent.functionalitySummary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="tool-seo-panel" aria-labelledby="tool-best-for-heading">
              <h2 id="tool-best-for-heading">Best For</h2>
              <ul className="tool-seo-list">
                {toolContent.audience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="tool-features-heading">
              <h2 id="tool-features-heading">Key Features</h2>
              <ul className="tool-seo-list">
                {toolContent.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>

            <section className="tool-seo-panel" aria-labelledby="tool-when-to-use-heading">
              <h2 id="tool-when-to-use-heading">When to Use It</h2>
              <ul className="tool-seo-list">
                {toolContent.whenToUse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="tool-how-to-heading">
              <h2 id="tool-how-to-heading">How to Use This Tool</h2>
              <ol className="tool-seo-list tool-seo-list--ordered">
                {toolContent.howToSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="tool-seo-panel" aria-labelledby="tool-benefits-heading">
              <h2 id="tool-benefits-heading">Why Users Choose This Page</h2>
              <ul className="tool-seo-list">
                {toolContent.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="tool-intent-heading">
              <h2 id="tool-intent-heading">Search Intent Focus</h2>
              {toolContent.searchIntent.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="tool-seo-panel" aria-labelledby="tool-focus-keywords-heading">
              <h2 id="tool-focus-keywords-heading">Keyword Focus</h2>
              <div className="tool-seo-tags">
                {toolContent.seoKeywords.slice(0, 12).map((keyword) => (
                  <span key={keyword} className="tool-seo-tag">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="tool-tips-heading">
              <h2 id="tool-tips-heading">Tips for Better Results</h2>
              <ul className="tool-seo-list">
                {toolContent.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="tool-seo-panel" aria-labelledby="tool-mistakes-heading">
              <h2 id="tool-mistakes-heading">Common Mistakes to Avoid</h2>
              <ul className="tool-seo-list">
                {toolContent.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="tool-seo-panel" aria-labelledby="tool-faq-heading">
            <h2 id="tool-faq-heading">{toolContent.name} FAQ</h2>
            <div className="tool-seo-faqs">
              {toolContent.faqs.map((faq) => (
                <details key={faq.question} className="tool-seo-faq">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="tool-seo-panel" aria-labelledby="tool-related-heading">
            <h2 id="tool-related-heading">Related {toolContent.category} Tools</h2>
            <p>
              Explore more pages in this category to continue your workflow after using the
              {' '}
              {toolContent.name}
              .
            </p>
            <div className="tool-seo-links">
              {toolContent.relatedTools.map((tool) => (
                <Link key={tool.url} to={tool.url} className="tool-seo-link-card">
                  <span className="tool-seo-link-title">{tool.name}</span>
                  <span className="tool-seo-link-desc">{tool.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (categoryContent) {
    return (
      <div className="tool-seo-content tool-seo-content--category">
        <div className="container">
          <section className="tool-seo-panel" aria-labelledby="category-overview-heading">
            <h2 id="category-overview-heading">Explore {categoryContent.name} Tools</h2>
            <p>{categoryContent.intro}</p>
            <p>{categoryContent.detail}</p>
          </section>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby="category-reasons-heading">
              <h2 id="category-reasons-heading">Why This Section Matters</h2>
              <ul className="tool-seo-list">
                {categoryContent.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>

            <section className="tool-seo-panel" aria-labelledby="category-audience-heading">
              <h2 id="category-audience-heading">Who These Tools Help</h2>
              <ul className="tool-seo-list">
                {categoryContent.audience.map((audience) => (
                  <li key={audience}>{audience}</li>
                ))}
              </ul>
            </section>
          </div>

          {categoryContent.priorityTools.length > 0 && (
            <section className="tool-seo-panel" aria-labelledby="category-opportunity-heading">
              <h2 id="category-opportunity-heading">SEO Opportunity Tools in {categoryContent.name}</h2>
              <div className="tool-seo-links">
                {categoryContent.priorityTools.map(({ tool, priority }) => (
                  <Link key={tool.url} to={tool.url} className="tool-seo-link-card">
                    <span className="tool-seo-link-title">{tool.name}</span>
                    <span className="tool-seo-link-desc">{priority.outlook}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="tool-seo-panel" aria-labelledby="category-popular-heading">
            <h2 id="category-popular-heading">Popular Pages in {categoryContent.name}</h2>
            <div className="tool-seo-links">
              {categoryContent.tools.slice(0, 8).map((tool) => (
                <Link key={tool.url} to={tool.url} className="tool-seo-link-card">
                  <span className="tool-seo-link-title">{tool.name}</span>
                  <span className="tool-seo-link-desc">{tool.desc}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return null;
};

export default ToolContentEnhancer;

