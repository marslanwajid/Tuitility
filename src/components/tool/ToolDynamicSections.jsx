import React from 'react';
import { Link } from 'react-router-dom';
import { getToolContentByPath } from '../../data/toolContent';
import '../../assets/css/tool-seo-content.css';

const ToolDynamicSections = ({ toolPath }) => {
  const toolContent = getToolContentByPath(toolPath);

  if (!toolContent) {
    return null;
  }

  return (
    <>
      <section className="tool-seo-content">
        <div className="container">
          <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-overview-heading`}>
            <div className="tool-seo-panel-heading">
              <h2 id={`${toolContent.kind}-overview-heading`}>About the {toolContent.name}</h2>
              <span className={`tool-seo-badge tool-seo-badge--${toolContent.priority.tier}`}>
                {toolContent.priority.outlook}
              </span>
            </div>
            {toolContent.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-functionality-heading`}>
              <h2 id={`${toolContent.kind}-functionality-heading`}>What This Tool Does</h2>
              {toolContent.functionalitySummary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-best-for-heading`}>
              <h2 id={`${toolContent.kind}-best-for-heading`}>Best For</h2>
              <ul className="tool-seo-list">
                {toolContent.audience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-features-heading`}>
              <h2 id={`${toolContent.kind}-features-heading`}>Key Features</h2>
              <ul className="tool-seo-list">
                {toolContent.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </section>

            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-when-to-use-heading`}>
              <h2 id={`${toolContent.kind}-when-to-use-heading`}>When to Use It</h2>
              <ul className="tool-seo-list">
                {toolContent.whenToUse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-how-to-heading`}>
              <h2 id={`${toolContent.kind}-how-to-heading`}>How to Use This Tool</h2>
              <ol className="tool-seo-list tool-seo-list--ordered">
                {toolContent.howToSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-benefits-heading`}>
              <h2 id={`${toolContent.kind}-benefits-heading`}>Why Users Choose This Page</h2>
              <ul className="tool-seo-list">
                {toolContent.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="tool-seo-grid">
            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-intent-heading`}>
              <h2 id={`${toolContent.kind}-intent-heading`}>Search Intent Focus</h2>
              {toolContent.searchIntent.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-keywords-heading`}>
              <h2 id={`${toolContent.kind}-keywords-heading`}>Keyword Focus</h2>
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
            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-tips-heading`}>
              <h2 id={`${toolContent.kind}-tips-heading`}>Tips for Better Results</h2>
              <ul className="tool-seo-list">
                {toolContent.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-mistakes-heading`}>
              <h2 id={`${toolContent.kind}-mistakes-heading`}>Common Mistakes to Avoid</h2>
              <ul className="tool-seo-list">
                {toolContent.mistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="tool-seo-panel" aria-labelledby={`${toolContent.kind}-related-heading`}>
            <h2 id={`${toolContent.kind}-related-heading`}>Related {toolContent.category} Tools</h2>
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
      </section>
    </>
  );
};

export default ToolDynamicSections;

