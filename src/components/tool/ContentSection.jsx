import React from 'react';
import MathFormula from './MathFormula';

const ContentSection = ({ id, title, children, className = "" }) => {
  return (
    <section id={id} className={`content-section ${className}`}>
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};

// Subcomponents for common content patterns
ContentSection.Introduction = ({ children }) => (
  <div id="introduction">
    {children}
  </div>
);

ContentSection.Features = ({ title = "Features", children }) => (
  <div id="features">
    <h3>{title}</h3>
    {children}
  </div>
);

ContentSection.Formulas = ({ title = "Formulas", children }) => (
  <div id="formulas">
    <h3>{title}</h3>
    {children}
  </div>
);

ContentSection.Examples = ({ title = "Examples", children }) => (
  <div id="examples">
    <h3>{title}</h3>
    {children}
  </div>
);

ContentSection.Applications = ({ title = "Applications", children }) => (
  <div id="applications">
    <h3>{title}</h3>
    {children}
  </div>
);

ContentSection.Table = ({ headers, rows, className = "" }) => (
  <div className={`table-responsive ${className}`}>
    <table className="styled-table">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ContentSection;

