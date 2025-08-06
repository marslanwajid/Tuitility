import React from 'react';

const TableOfContents = ({ 
  sections = [],
  className = "" 
}) => {
  const defaultSections = [
    { id: "introduction", title: "Introduction" },
    { id: "what-is-fraction", title: "What is a Fraction?" },
    { id: "formulas", title: "Formulas & Methods" },
    { id: "how-to-use", title: "How to Use Fraction Calculator" },
    { id: "examples", title: "Examples" },
    { id: "significance", title: "Significance" },
    { id: "functionality", title: "Functionality" },
    { id: "applications", title: "Applications" },
    { id: "faqs", title: "FAQs" }
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <div className={`toc-section ${className}`}>
      <h3 className="toc-title">
        <i className="fas fa-list"></i>
        Table of Contents
      </h3>
      <nav className="toc-nav">
        {displaySections.map((section, index) => (
          <a 
            key={index} 
            href={`#${section.id}`} 
            className="toc-link"
          >
            {section.title}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents; 