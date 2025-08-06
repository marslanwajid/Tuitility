import React from 'react';

const ContentSection = ({ 
  sections = [],
  className = "" 
}) => {
  return (
    <section className={`content-section ${className}`}>
      <div className="content-container">
        {sections.map((section, index) => (
          <div key={index} id={section.id} className="content-block">
            <h2 className="content-title">{section.title}</h2>
            {section.intro && (
              <div className="content-intro">
                {section.intro.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </div>
            )}
            {section.content && (
              <div className="content-body">
                {section.content}
              </div>
            )}
            {section.list && (
              <ul className="content-list">
                {section.list.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <i className="fas fa-check"></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.steps && (
              <ul className="usage-steps">
                {section.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>
                    <i className="fas fa-check"></i>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.examples && (
              <div className="examples-container">
                {section.examples.map((example, exIndex) => (
                  <div key={exIndex} className="example-section">
                    <h3>{example.title}</h3>
                    <p>{example.description}</p>
                    {example.solution && (
                      <div className="example-solution">
                        {example.solution.map((step, stepIndex) => (
                          <p key={stepIndex}><strong>{step.label}:</strong> {step.content}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContentSection; 